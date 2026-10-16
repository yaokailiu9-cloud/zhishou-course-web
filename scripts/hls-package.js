// Package one lesson video as AES-128 HLS: segments are uploaded to Zion as private files and the key plus
// segment list go into course_lesson_hls / course_lesson_hls_segment (both closed to the front-end roles).
// COURSE_VIEW_ACCESS then hands authorised viewers a fresh playlist and key instead of the MP4 address.
// Each lesson gets a video track (WeChat) and a separately keyed audio-only track (other browsers: cover + sound).
// Usage: node scripts/hls-package.js <lessonId> [--audio-only] [--dry-run]   (needs ffmpeg and a logged-in zion-mcp)
// --audio-only adds or replaces just the audio track of an already packaged lesson; the video key is never read.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),zionCwd=process.env.ZION_PROJECT_CWD||root,dryRun=process.argv.includes('--dry-run'),audioOnly=process.argv.includes('--audio-only');
const SEGMENT_SECONDS={video:6,audio:30},PRESIGN_BATCH=30,UPLOADS_IN_FLIGHT=6;
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{cwd:zionCwd,encoding:'utf8',maxBuffer:30000000,timeout:300000}));}
function gql(query){const result=run('runtime','graphql','--args',JSON.stringify({query,variables:{}}));if(result.error)throw new Error(result.error);return result;}
// GraphQL literal for inline objects (Zion input type names are not needed this way).
const literal=v=>Array.isArray(v)?'['+v.map(literal).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).map(([k,x])=>k+':'+literal(x)).join(',')+'}':JSON.stringify(v);

function parsePlaylist(text){
  const lines=text.split('\n').map(line=>line.trim()),segments=[];
  for(let i=0;i<lines.length;i++){const match=lines[i].match(/^#EXTINF:([\d.]+),/);if(match)segments.push({duration:Number(match[1]),name:lines[i+1]});}
  const target=Number((text.match(/#EXT-X-TARGETDURATION:(\d+)/)||[])[1]);
  assert.ok(segments.length&&target>0&&text.includes('#EXT-X-ENDLIST'),'ffmpeg playlist incomplete');
  return {segments,target};
}

async function put(url,headers,body){
  for(let attempt=1;;attempt++){
    const response=await fetch(url,{method:'PUT',headers,body}).catch(error=>({ok:false,status:error.message}));
    if(response.ok)return;
    if(attempt>=3)throw new Error('upload failed: '+response.status);
    await new Promise(resolve=>setTimeout(resolve,1000*attempt));
  }
}

// Encrypt one track with its own random key and IV; the key URI names the track so the player can pick the key.
function packageTrack(dir,mp4,lessonId,version,track){
  const key=crypto.randomBytes(16),iv=crypto.randomBytes(16),prefix=track==='audio'?'a':'v';
  fs.writeFileSync(path.join(dir,prefix+'.key'),key);
  fs.writeFileSync(path.join(dir,prefix+'.keyinfo'),`zskey://${lessonId}/${version}${track==='audio'?'/audio':''}\n${path.join(dir,prefix+'.key')}\n${iv.toString('hex')}\n`);
  const maps=track==='audio'?['-map','0:a:0','-vn']:['-map','0:v:0','-map','0:a:0?'];
  // Stream copy keeps the original quality; video segments cut on existing keyframes.
  cp.execFileSync('ffmpeg',['-v','error','-i',mp4,...maps,'-c','copy','-f','hls','-hls_time',String(SEGMENT_SECONDS[track]),'-hls_playlist_type','vod','-hls_key_info_file',path.join(dir,prefix+'.keyinfo'),'-hls_segment_filename',path.join(dir,prefix+'%05d.ts'),path.join(dir,prefix+'.m3u8')]);
  const {segments,target}=parsePlaylist(fs.readFileSync(path.join(dir,prefix+'.m3u8'),'utf8'));
  const files=segments.map((segment,seq)=>{const bytes=fs.readFileSync(path.join(dir,segment.name));return {...segment,seq,track,bytes,md5:crypto.createHash('md5').update(bytes).digest('base64')};});
  return {files,target,keyHex:key.toString('hex')+':'+iv.toString('hex')};
}

async function upload(files,lessonId,version){
  for(let start=0;start<files.length;start+=PRESIGN_BATCH){
    const batch=files.slice(start,start+PRESIGN_BATCH);
    const query='query{'+batch.map((f,i)=>`s${i}:filePresignedUrlV2(md5Base64:${JSON.stringify(f.md5)},format:OTHER,name:${JSON.stringify(`lesson${lessonId}-v${version}-${f.track}-${String(f.seq).padStart(5,'0')}.ts`)},suffix:"ts",sizeBytes:${f.bytes.length},acl:PRIVATE){fileId uploadUrl uploadHeaders}`).join(' ')+'}';
    const result=gql(query);
    batch.forEach((f,i)=>{const info=result['s'+i];assert.ok(info&&info.fileId&&info.uploadUrl,'presign failed for '+f.track+' segment '+f.seq);f.upload=info;});
  }
  let next=0,done=0;
  await Promise.all(Array.from({length:UPLOADS_IN_FLIGHT},async()=>{
    while(next<files.length){
      const f=files[next++],headers={...(typeof f.upload.uploadHeaders==='string'?JSON.parse(f.upload.uploadHeaders):f.upload.uploadHeaders)};
      delete headers.Date;
      await put(f.upload.uploadUrl,headers,f.bytes);
      if(++done%50===0||done===files.length)console.log(`uploaded ${done}/${files.length}`);
    }
  }));
}
const rows=files=>files.map(f=>({seq:f.seq,track:f.track,duration:Number(f.duration.toFixed(6)),segment_file_id:f.upload.fileId}));
const megabytes=files=>(files.reduce((sum,f)=>sum+f.bytes.length,0)/1048576).toFixed(1)+'MB';

async function main(){
  const lessonId=Number(process.argv[2]);
  assert.ok(Number.isSafeInteger(lessonId)&&lessonId>0,'usage: node scripts/hls-package.js <lessonId> [--audio-only] [--dry-run]');
  run('project','set-current','--projectExId','JmAxbl1MMe4');
  const lesson=gql(`query{course_lesson_by_pk(id:${lessonId}){id title video{url} video_url hls{id version status}}}`).course_lesson_by_pk;
  assert.ok(lesson,'lesson not found');
  const source=(lesson.video&&lesson.video.url)||lesson.video_url;assert.ok(source,'lesson has no video');
  if(audioOnly)assert.ok(lesson.hls&&lesson.hls.status==='READY','package the video first: node scripts/hls-package.js '+lessonId);
  const version=audioOnly?lesson.hls.version:((lesson.hls&&lesson.hls.version)||0)+1,dir=fs.mkdtempSync(path.join(os.tmpdir(),`zs-hls-${lessonId}-`));
  try{
    const mp4=path.join(dir,'source.mp4');
    cp.execFileSync('curl',['-sfL','--retry','3','-o',mp4,source]);
    const hasAudio=cp.execFileSync('ffprobe',['-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',mp4],{encoding:'utf8'}).trim()!=='';
    const audio=hasAudio?packageTrack(dir,mp4,lessonId,version,'audio'):null,video=audioOnly?null:packageTrack(dir,mp4,lessonId,version,'video');
    for(const [name,t] of [['video',video],['audio',audio]])if(t)console.log(`lesson ${lessonId} 《${lesson.title}》 v${version} ${name}: ${t.files.length} segments, ${t.files.reduce((s,f)=>s+f.duration,0).toFixed(1)}s, ${megabytes(t.files)}`);
    if(!audio)console.log(`lesson ${lessonId}: no audio stream, audio track skipped`);
    if(dryRun){console.log('dry run: nothing uploaded');return;}
    const files=[...(video?video.files:[]),...(audio?audio.files:[])];
    await upload(files,lessonId,version);
    const audioFields={audio_key_hex:audio?audio.keyHex:'',audio_segment_count:audio?audio.files.length:0};
    if(audioOnly){
      const saved=gql(`mutation{d:delete_course_lesson_hls_segment(where:{hls_id:{_eq:${lesson.hls.id}},track:{_eq:"audio"}}){affected_rows} i:insert_course_lesson_hls_segment(objects:${literal(rows(files).map(r=>({...r,hls_id:lesson.hls.id})))}){affected_rows} u:update_course_lesson_hls(where:{id:{_eq:${lesson.hls.id}}},_set:${literal(audioFields)}){affected_rows}}`);
      assert.equal(saved.i.affected_rows,files.length);assert.equal(saved.u.affected_rows,1);
      console.log(`saved audio track for course_lesson_hls ${lesson.hls.id} (replaced ${saved.d.affected_rows} audio rows)`);
      return;
    }
    // Replace any previous version; the lesson plays the MP4 only in the moment between delete and insert.
    const object={lesson_id:lessonId,version,key_hex:video.keyHex,target_duration:video.target,segment_count:video.files.length,status:'READY',...audioFields,segments:{data:rows(files)}};
    const saved=gql(`mutation{s:delete_course_lesson_hls_segment(where:{hls:{lesson_id:{_eq:${lessonId}}}}){affected_rows} h:delete_course_lesson_hls(where:{lesson_id:{_eq:${lessonId}}}){affected_rows} n:insert_course_lesson_hls_one(object:${literal(object)}){id version segment_count}}`);
    assert.equal(saved.n.segment_count,video.files.length);
    const check=gql(`query{course_lesson_hls(where:{lesson_id:{_eq:${lessonId}}}){version status segments_aggregate{aggregate{count}}}}`).course_lesson_hls[0];
    assert.equal(check.segments_aggregate.aggregate.count,files.length,'segment rows missing');
    console.log(`saved course_lesson_hls ${saved.n.id} v${saved.n.version} (${check.status}); replaced rows: ${saved.h.affected_rows}`);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error.message||error);process.exit(1);});
