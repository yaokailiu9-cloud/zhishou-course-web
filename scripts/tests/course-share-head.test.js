const test=require('node:test'),assert=require('node:assert/strict');
const {courseShareHead}=require('../../server/h5/course-share');
const html='<head><title>知守</title><meta name="description" content="课程"></head>';
test('课程链接预览使用匿名图片与标题，转义内容且不查询视频或使用管理员令牌',async t=>{
 const previous=global.fetch; t.after(()=>{global.fetch=previous});let sent;
 global.fetch=async(_url,options)=>{sent=options;return {ok:true,json:async()=>({data:{course_by_pk:{title:'手机 <课程>',subtitle:'与"孩子"沟通',enabled:true,cover_image:{url:'https://cdn.test/cover?a=1&b=2'}}}})}};
 const result=await courseShareHead(html,'/web/?course=15');
 assert.match(result,/手机 &lt;课程&gt;/);assert.match(result,/og:image/);assert.match(result,/a=1&amp;b=2/);
 assert.equal(JSON.parse(sent.body).variables.id,'15');assert.equal(sent.headers.authorization,undefined);
 assert.doesNotMatch(sent.body,/video|lesson|grant/);
});
test('无效、下架或后端失败的分享不影响网页打开',async t=>{
 const previous=global.fetch;t.after(()=>{global.fetch=previous});
 global.fetch=()=>{assert.fail('无效 ID 不访问后台')};assert.equal(await courseShareHead(html,'/web/?course=bad'),html);
 global.fetch=async()=>({ok:true,json:async()=>({data:{course_by_pk:{title:'下架课程',enabled:false}}})});assert.equal(await courseShareHead(html,'/web/?course=15'),html);
 global.fetch=async()=>{throw Error('offline')};assert.equal(await courseShareHead(html,'/web/?course=15'),html);
});
