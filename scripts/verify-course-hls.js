// Read-only proof for the HLS branch of COURSE_VIEW_ACCESS: chains the five live service nodes in run-code
// (--no-updateDb), with the course-access block of the last node replaced by backend/consultation/course-access.js.
// Usage: node scripts/verify-course-hls.js <packagedPublicCourseId> <unpackagedPublicCourseId> <privateCourseId> [--live]
// --live checks the deployed node unchanged instead of the patched one.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),zionCwd=process.env.ZION_PROJECT_CWD||root;
const run=(...args)=>cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{cwd:zionCwd,encoding:'utf8',maxBuffer:60000000,timeout:300000});
const [packaged,unpackaged,privateCourse]=process.argv.slice(2,5).map(Number);
assert.ok([packaged,unpackaged,privateCourse].every(n=>Number.isSafeInteger(n)&&n>0),'usage: node scripts/verify-course-hls.js <packaged> <unpackaged> <private> [--live]');
run('project','set-current','--projectExId','JmAxbl1MMe4');
const flow=JSON.parse(run('schema','snapshot','--args','{"full":true}')).server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const nodes=['h4i3zzuex','sui9sl3ko','g3oknp94t','z07supad5','dv4kpohsg'].map(id=>flow.allNodes.find(n=>n.uniqueId===id).code);
if(!process.argv.includes('--live')){
  const code=nodes[4],start=code.indexOf('// Course viewing grants:'),end=code.indexOf('if (!s.result) fail("暂不支持此操作");');
  assert.ok(start>=0&&end>start,'course-access block not found in live node');
  nodes[4]=code.slice(0,start)+fs.readFileSync(path.join(root,'backend/consultation/course-access.js'),'utf8').trim()+'\n'+code.slice(end);
}
const wrapper=`
var native=context;
function invoke(operation,payload){
  var state=null;
  ${nodes.map(code=>`(function(context){${code}})({getArg:function(k){return k==='operation'?operation:k==='payload'?payload:k==='account_id'?null:k==='state'?state:'';},setReturn:function(k,v){if(k==='state')state=v;},runGql:function(n,q,v,o){return native.runGql(n,q,v,o);}});`).join('\n  ')}
  return typeof state==='string'?JSON.parse(state):state;
}
function summary(courseId){
  var r=invoke('COURSE_VIEW_ACCESS',{courseId:courseId});
  return {canWatch:r.data.canWatch,reason:r.data.reason,lessons:r.data.lessons.map(function(l){var p=l.hls&&l.hls.playlist||'';return {id:l.id,hasVideo:l.hasVideo,mp4:!!l.videoUrl,hls:!!l.hls,keyOk:!!(l.hls&&/^[0-9a-f]{32}$/.test(l.hls.key)),segments:(p.match(/#EXTINF:/g)||[]).length,keyUri:(p.match(/URI="([^"]+)"/)||[])[1]||'',ended:p.indexOf('#EXT-X-ENDLIST')>0,audio:l.hls&&l.hls.audio?{ownKey:/^[0-9a-f]{32}$/.test(l.hls.audio.key)&&l.hls.audio.key!==l.hls.key,segments:(l.hls.audio.playlist.match(/#EXTINF:/g)||[]).length,keyUri:(l.hls.audio.playlist.match(/URI="([^"]+)"/)||[])[1]||''}:null};})};
}
native.setReturn('result',{packaged:summary(${packaged}),unpackaged:summary(${unpackaged}),privateCourse:summary(${privateCourse})});`;
const output=JSON.parse(run('runtime','run-code','--projectExId','JmAxbl1MMe4','--no-updateDb','--jsCode',wrapper));
console.log(JSON.stringify(output,null,1));
