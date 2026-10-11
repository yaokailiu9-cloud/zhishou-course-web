#!/usr/bin/env python3
"""Encode, upload private Zion videos, and bind a reviewed course/lesson plan.

Usage: python3 scripts/upload-course-videos.py PLAN_JSON TOKEN_FILE [--workers 2]
The plan is an external local JSON file. Credentials and signed URLs are never
written into the plan. Original videos are read only; reruns resume completed work.
"""
import argparse
import base64
import concurrent.futures
import hashlib
import http.client
import json
import subprocess
import threading
import time
import urllib.parse
import urllib.request
from pathlib import Path

ENDPOINT = 'https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2'


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size:stream=codec_type,codec_name,width,height',
        '-of', 'json', str(path)], text=True))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('token_file', type=Path)
    parser.add_argument('--workers', type=int, default=2)
    args = parser.parse_args()
    rows = json.loads(args.plan.read_text())
    token = args.token_file.read_text().strip()
    lock = threading.Lock()

    def save(row, **changes):
        with lock:
            row.update(changes)
            tmp = args.plan.with_suffix('.tmp')
            tmp.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
            tmp.replace(args.plan)

    def gql(query, variables=None):
        req = urllib.request.Request(ENDPOINT,
            data=json.dumps({'query': query, 'variables': variables or {}}).encode(),
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token})
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.load(response)
        if result.get('errors'):
            # GraphQL messages are safe to report; never include request headers.
            raise RuntimeError('; '.join(e.get('message', 'GraphQL error') for e in result['errors']))
        return result['data']

    def lesson(row):
        found = gql('query($id:bigint!){course_lesson_by_pk(id:$id){id title course_id video_id video_url}}',
                    {'id': row['lesson_id']})['course_lesson_by_pk']
        if not found or str(found['course_id']) != str(row['course_id']) or found['title'] != row['title']:
            raise RuntimeError('Course/lesson identity changed; review the mapping again')
        if found['video_url'] or (found['video_id'] and str(found['video_id']) != str(row.get('video_id'))):
            raise RuntimeError('Lesson already has another video; refusing to overwrite')
        return found

    def put_file(info, path, row):
        parsed = urllib.parse.urlsplit(info['uploadUrl'])
        if parsed.scheme != 'https':
            raise RuntimeError('Presigned upload must use HTTPS')
        headers = info.get('uploadHeaders') or {}
        if isinstance(headers, str):
            headers = json.loads(headers)
        headers = dict(headers)
        headers['Content-Length'] = str(path.stat().st_size)
        connection = http.client.HTTPSConnection(parsed.hostname, parsed.port, timeout=180)
        try:
            connection.putrequest('PUT', parsed.path + ('?' + parsed.query if parsed.query else ''))
            for key, value in headers.items():
                connection.putheader(key, str(value))
            connection.endheaders()
            sent, last = 0, time.monotonic()
            with path.open('rb') as source:
                while chunk := source.read(1024 * 1024):
                    connection.send(chunk)
                    sent += len(chunk)
                    if time.monotonic() - last > 20:
                        save(row, uploaded_bytes=sent)
                        print(f"UPLOAD {row['title']}: {sent * 100 // path.stat().st_size}%", flush=True)
                        last = time.monotonic()
            response = connection.getresponse()
            response.read()
            if not 200 <= response.status < 300:
                raise RuntimeError(f'Object storage PUT returned HTTP {response.status}')
        finally:
            connection.close()

    def process(row):
        try:
            lesson(row)
            if row['status'] == 'bound':
                return
            output = Path(row['output'])
            output.parent.mkdir(parents=True, exist_ok=True)
            if not row.get('encoded_verified') or not output.exists():
                source = Path(row['source'])
                if source.stat().st_size != row['source_bytes']:
                    raise RuntimeError('Source file changed; review plan again')
                save(row, status='encoding', error=None)
                print('ENCODE ' + row['title'], flush=True)
                partial = output.with_suffix('.partial.mp4')
                command = ['ffmpeg', '-hide_banner', '-loglevel', 'error',
                    '-hwaccel', 'videotoolbox', '-i', str(source),
                    '-map', '0:v:0', '-map', '0:a:0', '-vf', 'scale=-2:720',
                    '-c:v', 'h264_videotoolbox', '-b:v', '1700k', '-maxrate', '2200k',
                    '-bufsize', '4400k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
                    '-movflags', '+faststart', '-progress', str(output.with_suffix('.progress')),
                    '-nostats', '-y', str(partial)]
                with output.with_suffix('.encode.log').open('w') as log:
                    subprocess.run(command, stdout=log, stderr=log, check=True)
                meta = probe(partial)
                duration = float(meta['format']['duration'])
                if abs(duration - row['source_duration']) > 1:
                    raise RuntimeError('Encoded duration differs from source')
                if [s['codec_name'] for s in meta['streams']] != ['h264', 'aac']:
                    raise RuntimeError('Expected H.264 video and AAC audio')
                partial.replace(output)
                save(row, status='encoded', encoded_verified=True,
                     encoded_bytes=output.stat().st_size, duration_seconds=duration)
                print(f"ENCODED {row['title']}: {output.stat().st_size/1e6:.1f} MB", flush=True)
            if not row.get('uploaded_verified'):
                digest = hashlib.md5()
                with output.open('rb') as source:
                    while chunk := source.read(1024 * 1024):
                        digest.update(chunk)
                info = gql('mutation($md5:String!){videoPresignedUrl(videoMd5Base64:$md5,videoFormat:MP4,acl:PRIVATE){videoId uploadUrl uploadHeaders}}',
                           {'md5': base64.b64encode(digest.digest()).decode()})['videoPresignedUrl']
                save(row, status='uploading', video_id=info['videoId'], md5_hex=digest.hexdigest(), error=None)
                put_file(info, output, row)
                save(row, status='uploaded', uploaded_verified=True, uploaded_bytes=output.stat().st_size)
                print('UPLOADED ' + row['title'], flush=True)
            lesson(row)  # Recheck concurrent edits immediately before binding.
            seconds = round(row['duration_seconds'])
            duration_text = f'{seconds//60}:{seconds%60:02d}'
            eq = lambda column, value: {'_eq': {'bigint_operand': {
                'left_operand': {'column': column}, 'right_operand': {'literal': value}}}}
            where = {'_and': [eq('id', row['lesson_id']), eq('course_id', row['course_id']),
                {'_or': [{'_is_null': {'bigint_operand': {'column': 'video_id'}}},
                         eq('video_id', row['video_id'])]}]}
            changed = gql('mutation($where:course_lesson_bool_exp!,$set:course_lesson_set_input!){update_course_lesson(where:$where,_set:$set){affected_rows returning{id title course_id duration_text video_id video{id url}}}}',
                         {'where': where, 'set': {'video_id': row['video_id'], 'duration_text': duration_text}})['update_course_lesson']
            if changed['affected_rows'] != 1:
                raise RuntimeError('Lesson changed concurrently; refusing to overwrite')
            result = changed['returning'][0]
            if not result or str(result['video_id']) != str(row['video_id']) or not (result.get('video') or {}).get('url'):
                raise RuntimeError('Video binding readback failed')
            req = urllib.request.Request(result['video']['url'], headers={'Range': 'bytes=0-1023'})
            with urllib.request.urlopen(req, timeout=60) as response:
                head = response.read(1024)
                if response.status not in (200, 206) or b'ftyp' not in head[:64]:
                    raise RuntimeError('Uploaded MP4 range readback failed')
                etag = response.headers.get('ETag', '').strip('"').lower()
                if etag != row['md5_hex']:
                    raise RuntimeError('Uploaded object checksum differs from the local video')
            save(row, status='bound', duration_text=duration_text, range_verified=True,
                 checksum_verified=True, error=None)
            print(f"BOUND {row['title']}: lesson {row['lesson_id']}, video {row['video_id']}", flush=True)
        except Exception as error:
            # Avoid recording signed upload URLs in generic network exceptions.
            message = str(error) if isinstance(error, RuntimeError) else type(error).__name__
            save(row, status='failed', error=message)
            print(f"FAILED {row['title']}: {message}", flush=True)

    # Shortest first, so that verified courses become available progressively.
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        list(pool.map(process, sorted(rows, key=lambda r: r['source_duration'])))
    print(json.dumps({'bound': sum(r['status'] == 'bound' for r in rows), 'total': len(rows)}, ensure_ascii=False))
    return 0 if all(r['status'] == 'bound' for r in rows) else 1


if __name__ == '__main__':
    raise SystemExit(main())
