// Package one lesson video as AES-128 HLS: segments are uploaded to Zion as private files and the key plus
// segment list go into course_lesson_hls / course_lesson_hls_segment (both closed to the front-end roles).
// COURSE_VIEW_ACCESS then hands authorised viewers a fresh playlist and key instead of the MP4 address.
// Usage: node scripts/hls-package.js <lessonId> [--dry-run]   (needs ffmpeg and a logged-in zion-mcp)
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),zionCwd=process.env.ZION_PROJECT_CWD||root,dryRun=process.argv.includes('--dry-run');
const SEGMENT_SECONDS=6,PRESIGN_BATCH=30,UPLOADS_IN_FLIGHT=6;
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

async function main(){
  const lessonId=Number(process.argv[2]);
  assert.ok(Number.isSafeInteger(lessonId)&&lessonId>0,'usage: node scripts/hls-package.js <lessonId> [--dry-run]');
  run('project','set-current','--projectExId','JmAxbl1MMe4');
  const lesson=gql(`query{course_lesson_by_pk(id:${lessonId}){id title video{url} video_url hls{id version}}}`).course_lesson_by_pk;
  assert.ok(lesson,'lesson not found');
  const source=(lesson.video&&lesson.video.url)||lesson.video_url;assert.ok(source,'lesson has no video');
  const version=((lesson.hls&&lesson.hls.version)||0)+1,dir=fs.mkdtempSync(path.join(os.tmpdir(),`zs-hls-${lessonId}-`));
  try{
    const mp4=path.join(dir,'source.mp4'),key=crypto.randomBytes(16),iv=crypto.randomBytes(16);
    cp.execFileSync('curl',['-sfL','--retry','3','-o',mp4,source]);
    fs.writeFileSync(path.join(dir,'key.bin'),key);
    fs.writeFileSync(path.join(dir,'keyinfo'),`zskey://${lessonId}/${version}\n${path.join(dir,'key.bin')}\n${iv.toString('hex')}\n`);
    // Stream copy keeps the original quality; segments cut on existing keyframes.
    cp.execFileSync('ffmpeg',['-v','error','-i',mp4,'-map','0:v:0','-map','0:a:0?','-c','copy','-f','hls','-hls_time',String(SEGMENT_SECONDS),'-hls_playlist_type','vod','-hls_key_info_file',path.join(dir,'keyinfo'),'-hls_segment_filename',path.join(dir,'seg%05d.ts'),path.join(dir,'index.m3u8')]);
    const {segments,target}=parsePlaylist(fs.readFileSync(path.join(dir,'index.m3u8'),'utf8'));
    const files=segments.map((segment,seq)=>{const bytes=fs.readFileSync(path.join(dir,segment.name));return {...segment,seq,bytes,md5:crypto.createHash('md5').update(bytes).digest('base64')};});
    const total=segments.reduce((sum,segment)=>sum+segment.duration,0);
    console.log(`lesson ${lessonId} 《${lesson.title}》 v${version}: ${files.length} segments, ${total.toFixed(1)}s, ${(files.reduce((s,f)=>s+f.bytes.length,0)/1048576).toFixed(1)}MB`);
    if(dryRun){console.log('dry run: nothing uploaded');return;}

    for(let start=0;start<files.length;start+=PRESIGN_BATCH){
      const batch=files.slice(start,start+PRESIGN_BATCH);
      const query='query{'+batch.map(f=>`s${f.seq}:filePresignedUrlV2(md5Base64:${JSON.stringify(f.md5)},format:OTHER,name:${JSON.stringify(`lesson${lessonId}-v${version}-${String(f.seq).padStart(5,'0')}.ts`)},suffix:"ts",sizeBytes:${f.bytes.length},acl:PRIVATE){fileId uploadUrl uploadHeaders}`).join(' ')+'}';
      const result=gql(query);
      for(const f of batch){const info=result['s'+f.seq];assert.ok(info&&info.fileId&&info.uploadUrl,'presign failed for segment '+f.seq);f.upload=info;}
    }
    let next=0,done=0;
    await Promise.all(Array.from({length:UPLOADS_IN_FLIGHT},async()=>{
      while(next<files.length){
        const f=files[next++],headers={...(typeof f.upload.uploadHeaders==='string'?JSON.parse(f.upload.uploadHeaders):f.upload.uploadHeaders)};
        delete headers.Date;
        await put(f.upload.uploadUrl,headers,f.bytes);
        if(++done%20===0||done===files.length)console.log(`uploaded ${done}/${files.length}`);
      }
    }));

    // Replace any previous version; the lesson plays the MP4 only in the moment between delete and insert.
    const object={lesson_id:lessonId,version,key_hex:key.toString('hex')+':'+iv.toString('hex'),target_duration:target,segment_count:files.length,status:'READY',
      segments:{data:files.map(f=>({seq:f.seq,duration:Number(f.duration.toFixed(6)),segment_file_id:f.upload.fileId}))}};
    const saved=gql(`mutation{s:delete_course_lesson_hls_segment(where:{hls:{lesson_id:{_eq:${lessonId}}}}){affected_rows} h:delete_course_lesson_hls(where:{lesson_id:{_eq:${lessonId}}}){affected_rows} n:insert_course_lesson_hls_one(object:${literal(object)}){id version segment_count}}`);
    assert.equal(saved.n.segment_count,files.length);
    const check=gql(`query{course_lesson_hls(where:{lesson_id:{_eq:${lessonId}}}){version status segments_aggregate{aggregate{count}}}}`).course_lesson_hls[0];
    assert.equal(check.segments_aggregate.aggregate.count,files.length,'segment rows missing');
    console.log(`saved course_lesson_hls ${saved.n.id} v${saved.n.version} (${check.status}); replaced rows: ${saved.h.affected_rows}`);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error.message||error);process.exit(1);});
