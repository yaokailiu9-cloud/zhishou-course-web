const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),archive=require(path.join(root,'utils/childArchive'));
test('档案日期接受未补零和中文写法并统一成年-月-日',()=>{
  for(const [input,expected] of [['2026-10-8','2026-10-08'],['2026/10/8','2026-10-08'],['2026年10月8日','2026-10-08'],['2026.1.5','2026-01-05'],['2026-10-08','2026-10-08'],['','']])assert.equal(archive.normalizeDate(input),expected);
  for(const input of ['2026-2-30','10-8','明天'])assert.equal(archive.normalizeDate(input),null);
});
test('家长提交档案时把未补零日期整理后再发送，无效日期提示具体字段',async()=>{
  const calls=[],service=require.resolve(path.join(root,'utils/consultationService'));
  require.cache[service]={id:service,filename:service,loaded:true,exports:{call:async(op,payload)=>{calls.push([op,payload]);return {};},error(){},decorate:x=>x}};
  let config;global.Page=c=>{config=c;};global.wx={showToast(){},pageScrollTo(){},getStorageSync(){return '';}};
  const page=path.join(root,'pages/consultation-detail/consultation-detail.js');delete require.cache[page];require(page);
  const ctx={...config,data:{...config.data,childForm:archive.empty({name:'小明',age:'10',guardian:'家长',relationship:'母亲',phone:'13800000000',concerns:'厌学',filledAt:'2026-10-8',signatureDate:'2026/10/8'})},setData(patch){Object.assign(this.data,patch);},refresh:async()=>{}};
  await ctx.saveChild();
  assert.equal(calls[0][0],'SAVE_CHILD_INFO');assert.equal(calls[0][1].childInfo.filledAt,'2026-10-08');assert.equal(calls[0][1].childInfo.signatureDate,'2026-10-08');
  ctx.data.childForm={...ctx.data.childForm,signatureDate:'10月8日'};calls.length=0;await ctx.saveChild();
  assert.equal(calls.length,0);assert.match(ctx.data.error,/签字日期请按年-月-日填写/);
});
