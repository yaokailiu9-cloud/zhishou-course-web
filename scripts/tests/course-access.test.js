const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const common=read('backend/consultation/common.js'),authorize=common+'\n'+read('backend/consultation/authorize.js');
const access=common+'\nvar s=getState(), p=s.payload, op=s.operation;\n'+read('backend/consultation/course-access.js')+'\nif (!s.result) fail("暂不支持此操作");\ncontext.setReturn("state",s.result);';
const HOUR=3600000;
function harness(){
 const db={
  service_provider:[{id:1,account_id:101,service_kind:'STAFF',service_status:'ACTIVE',can_reply:true,can_accept_order:true},{id:2,account_id:103,service_kind:'GUARDIAN',review_role:'GUARDIAN',service_status:'ACTIVE',can_reply:true,can_accept_order:false},{id:3,account_id:104,service_kind:'AGENT',service_status:'ACTIVE',can_reply:false,can_accept_order:false}],
  account:[{id:101,username:'manager',account_profile:{user_name:'刘老师'}},{id:201,username:'p1',wechat_nickname:'家长甲',fz_phone_number:'13800001234'},{id:202,username:'p2',account_profile:{user_name:'家长乙'}},{id:209,username:'gone',fz_deleted:true}],
  course:[{id:14,title:'什么是沟通',enabled:true},{id:8,title:'倾诉的陷阱',enabled:true}],
  course_lesson:[{id:22,course_id:14,sort_order:1,video:{id:9,url:'https://cdn.test/comm.mp4'}},{id:23,course_id:14,sort_order:2,video:null,video_url:null},{id:16,course_id:8,sort_order:1,video:{id:8,url:'https://cdn.test/talk.mp4'}}],
  course_view_grant:[]
 };
 const now={value:Date.parse('2026-10-10T10:00:00Z')};
 function match(row,w){
  if(!w||!Object.keys(w).length)return true;
  if(w._and)return w._and.every(c=>match(row,c));if(w._or)return w._or.some(c=>match(row,c));if(w._not)return !match(row,w._not);
  const [key,data]=Object.entries(w)[0];
  if(!key.startsWith('_'))return !!row[key]&&match(row[key],data);
  const operand=key==='_ilike'?data:Object.values(data)[0],l=row[operand.left_operand.column],r=operand.right_operand.literal;
  if(key==='_ilike')return String(l||'').toLowerCase().includes(String(r).replace(/%/g,'').toLowerCase());
  return key==='_eq'?String(l??false)===String(r):key==='_lt'?Number(l)<Number(r):key==='_gt'?Number(l)>Number(r):false;
 }
 const accountOf=id=>db.account.find(a=>String(a.id)===String(id))||null;
 const decorate=g=>({...g,course:db.course.find(c=>c.id===g.course_id),viewer:accountOf(g.viewer_id),granted_by:accountOf(g.granted_by_id)});
 function runGql(name,q,v){
  if(name==='ServiceRows'){const table=q.match(/rows: (\w+)\(/)[1],limit=Number(q.match(/limit: (\d+)/)[1]);let rows=db[table].filter(r=>match(r,v.where)).sort((a,b)=>b.id-a.id).slice(0,limit);if(table==='course_view_grant')rows=rows.map(decorate);return {rows:structuredClone(rows)};}
  if(name==='ServiceInsert'){const table=q.match(/insert_(\w+)\(/)[1];if(table==='course_view_grant'&&db[table].some(r=>r.request_key===v.object.request_key))return {saved:{returning:[],affected_rows:0}};const row={id:db[table].length+1,created_at:new Date(now.value).toISOString(),revoked_at:null,...v.object};db[table].push(row);return {saved:{returning:[{id:row.id}],affected_rows:1}};}
  if(name==='ServiceUpdate'){const table=q.match(/update_(\w+)\(/)[1],rows=db[table].filter(r=>match(r,v.where));rows.forEach(r=>Object.assign(r,v.object));return {saved:{affected_rows:rows.length,returning:rows.map(r=>({id:r.id}))}};}
  if(name==='CourseViewCourse')return {course_by_pk:db.course.find(c=>c.id===v.id)||null};
  if(name==='CourseViewLessons')return {rows:db.course_lesson.filter(l=>match(l,v.where)).sort((a,b)=>a.sort_order-b.sort_order)};
  if(name==='CourseViewCourses')return {rows:db.course.map(c=>({...c,course_lesson:db.course_lesson.filter(l=>l.course_id===c.id)}))};
  if(name==='CourseViewTarget')return {account_by_pk:accountOf(v.id)&&{id:accountOf(v.id).id,fz_deleted:!!accountOf(v.id).fz_deleted}};
  if(name==='CourseViewCandidates')return {rows:db.account.filter(a=>match({...a,fz_deleted:!!a.fz_deleted},v.where))};
  throw new Error('unexpected query '+name);
 }
 function run(account,operation,payload={}){
  let state;const RealDate=Date;
  class FixedDate extends RealDate{constructor(...a){super(...(a.length?a:[now.value]));}static now(){return now.value;}}
  const context={getArg:k=>({account_id:account,operation,payload,state})[k],setReturn:(_,v)=>state=structuredClone(v),runGql};
  vm.runInNewContext(authorize,{context,Date:FixedDate});vm.runInNewContext(access,{context,Date:FixedDate});
  assert.equal(state.ok,true);return state.data;
 }
 return {db,run,now};
}
test('家长未开通看不到视频地址，管理人员开通1天后可看，24小时后自动关闭且不返回期限',()=>{
 const h=harness();
 let a=h.run(201,'COURSE_VIEW_ACCESS',{courseId:14});
 assert.equal(a.canWatch,false);assert.equal(a.reason,'NOT_GRANTED');
 assert.deepEqual(a.lessons.map(l=>[l.hasVideo,l.videoUrl]),[[true,''],[false,'']]);
 const g=h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'201',courseId:'14',hours:24,requestKey:'k1'}).grant;
 assert.equal(g.status,'ACTIVE');assert.equal(g.viewerName,'家长甲');assert.equal(g.courseTitle,'什么是沟通');assert.equal(g.grantedByName,'刘老师');
 assert.equal(Date.parse(g.expiresAt)-Date.parse(g.grantedAt),24*HOUR);
 a=h.run(201,'COURSE_VIEW_ACCESS',{courseId:14});
 assert.equal(a.canWatch,true);assert.equal(a.lessons[0].videoUrl,'https://cdn.test/comm.mp4');
 assert.doesNotMatch(JSON.stringify(a),/expires|2026-|小时|duration/,'家长端不返回期限');
 assert.equal(h.run(201,'COURSE_VIEW_ACCESS',{courseId:8}).canWatch,false,'只开放指定课程');
 assert.equal(h.run(202,'COURSE_VIEW_ACCESS',{courseId:14}).canWatch,false,'只开放指定家长');
 h.now.value+=24*HOUR-1000;assert.equal(h.run(201,'COURSE_VIEW_ACCESS',{courseId:14}).canWatch,true);
 h.now.value+=2000;a=h.run(201,'COURSE_VIEW_ACCESS',{courseId:14});
 assert.equal(a.canWatch,false);assert.equal(a.reason,'ENDED');assert.equal(a.lessons[0].videoUrl,'');
 assert.equal(h.run(101,'COURSE_VIEW_ADMIN').grants[0].status,'EXPIRED');
});
test('2天授权按48小时计算，重复提交不重复开通，收回后立即失效',()=>{
 const h=harness();
 const g=h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'202',courseId:'8',hours:48,requestKey:'same'}).grant;
 assert.equal(Date.parse(g.expiresAt)-Date.parse(g.grantedAt),48*HOUR);
 h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'202',courseId:'8',hours:48,requestKey:'same'});
 assert.equal(h.db.course_view_grant.length,1);
 h.now.value+=47*HOUR;assert.equal(h.run(202,'COURSE_VIEW_ACCESS',{courseId:8}).canWatch,true);
 assert.equal(h.run(101,'COURSE_VIEW_REVOKE',{grantId:g.id}).grant.status,'REVOKED');
 const a=h.run(202,'COURSE_VIEW_ACCESS',{courseId:8});assert.equal(a.canWatch,false);assert.equal(a.reason,'ENDED');
});
test('只有管理人员能开通、收回和查看授权；时长只能1天或2天；停用账号不能开通',()=>{
 const h=harness();
 for(const actor of [201,103,104])for(const [op,payload] of [['COURSE_VIEW_ADMIN',{}],['COURSE_VIEW_CANDIDATES',{}],['COURSE_VIEW_GRANT',{viewerAccountId:'201',courseId:'14',hours:24,requestKey:'x'}]])assert.throws(()=>h.run(actor,op,payload),/只有管理人员/);
 assert.throws(()=>h.run(null,'COURSE_VIEW_GRANT',{viewerAccountId:'201',courseId:'14',hours:24,requestKey:'x'}),/登录/);
 for(const hours of [1,12,72,'abc'])assert.throws(()=>h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'201',courseId:'14',hours,requestKey:'h'+hours}),/1天或2天/);
 assert.throws(()=>h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'209',courseId:'14',hours:24,requestKey:'d'}),/已停用/);
 assert.throws(()=>h.run(101,'COURSE_VIEW_GRANT',{viewerAccountId:'201',courseId:'99',hours:24,requestKey:'c'}),/课程不存在/);
 assert.equal(h.db.course_view_grant.length,0);
});
test('管理与工作人员可直接观看；未登录访客只看到需要登录，不返回视频地址',()=>{
 const h=harness();
 for(const actor of [101,103])assert.equal(h.run(actor,'COURSE_VIEW_ACCESS',{courseId:14}).lessons[0].videoUrl,'https://cdn.test/comm.mp4');
 const agent=h.run(104,'COURSE_VIEW_ACCESS',{courseId:14});assert.equal(agent.canWatch,false);
 const guest=h.run(null,'COURSE_VIEW_ACCESS',{courseId:14});assert.equal(guest.reason,'LOGIN');assert.doesNotMatch(JSON.stringify(guest),/cdn\.test/);
});
test('管理端按姓名或手机号尾号查找家长，结果不含停用账号且只返回手机号后4位',()=>{
 const h=harness();
 assert.deepEqual(h.run(101,'COURSE_VIEW_CANDIDATES',{keyword:'家长乙'}).items.map(i=>i.id),['202']);
 const byPhone=h.run(101,'COURSE_VIEW_CANDIDATES',{keyword:'1234'}).items;
 assert.deepEqual(byPhone,[{id:'201',name:'家长甲',phoneTail:'1234',staff:false}]);
 assert.ok(!h.run(101,'COURSE_VIEW_CANDIDATES',{}).items.some(i=>i.id==='209'));
 const admin=h.run(101,'COURSE_VIEW_ADMIN');
 assert.deepEqual(admin.courses.map(c=>[c.title,c.hasVideo]),[['什么是沟通',true],['倾诉的陷阱',true]]);
});
