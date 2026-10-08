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
  ctx.data.childForm={...ctx.data.childForm,signatureDate:'10月8日',name:'',phone:'123'};calls.length=0;await ctx.saveChild();
  assert.equal(calls.length,0);assert.equal(ctx.data.error,'');
  assert.deepEqual(Object.keys(ctx.data.fieldErrors).sort(),['name','phone','signatureDate']);assert.match(ctx.data.archiveError,/3项.*红框/);
  const shown=Object.fromEntries(ctx.data.childSections.flatMap(section=>section.fields).map(field=>[field.key,field.error]));
  assert.equal(shown.name,'请填写孩子姓名或称呼');assert.equal(shown.phone,'请填写有效的11位手机号');assert.equal(shown.grade,'');
  ctx.updateChild('name','小明');assert.ok(!('name' in ctx.data.fieldErrors));
  ctx.updateChild('phone','13800000000');ctx.pickChildDate({currentTarget:{dataset:{key:'signatureDate'}},detail:{value:'2026-10-09'}});
  assert.deepEqual(ctx.data.fieldErrors,{});assert.equal(ctx.data.archiveError,'');
  require.cache[service].exports.call=async()=>{throw new Error('请填写有效年龄');};await ctx.saveChild();
  assert.equal(ctx.data.error,'');assert.equal(ctx.data.fieldErrors.age,'请填写有效年龄');
});
test('档案日期用日期选择器，错误项有红框和就地提示',()=>{
  const fs=require('fs'),w=fs.readFileSync(path.join(root,'pages/consultation-detail/consultation-detail.wxml'),'utf8'),css=fs.readFileSync(path.join(root,'pages/consultation-detail/consultation-detail.wxss'),'utf8');
  assert.equal(archive.fieldByKey.filledAt.type,'date');assert.equal(archive.fieldByKey.signatureDate.type,'date');
  assert.match(w,/field\.type === 'date'[^>]*mode="date"[^>]*bindchange="pickChildDate"/);
  assert.match(w,/id="child-field-\{\{field\.key\}\}"[^>]*has-error/);assert.match(w,/class="field-error"/);assert.match(w,/class="archive-error"/);
  assert.match(css,/\.archive-field\.has-error[^{]*\{[^}]*border: 2rpx solid #d93025/);
});
test('家庭档案不再显示纲要确认多选项，已有档案也不展示',()=>{
  const text=JSON.stringify(archive.sections);
  for(const value of ['纲要','基本纲要','郑重声明','特训营','天性辨别','readConfirmed'])assert.ok(!text.includes(value),value);
  const shown=JSON.stringify(archive.answeredSections({readConfirmed:['基本纲要'],issues:['厌学']}));
  assert.ok(!shown.includes('基本纲要'));assert.ok(shown.includes('厌学'));
});
