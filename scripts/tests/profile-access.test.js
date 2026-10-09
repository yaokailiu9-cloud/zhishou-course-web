const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
function setup(){
 let page;const pending=[],requests=[],storage={userInfo:{id:'39',role:'manager'},zionJwt:'A'};
 const identity={capture:()=>({accountId:String(storage.userInfo?.id || ""),token:storage.zionJwt}),current:s=>s.accountId===String(storage.userInfo?.id || "")&&s.token===storage.zionJwt};
 const zion={getServiceProviderByAccount:()=>{const d=defer();pending.push(d);return d.promise;},isManagerProvider:p=>p?.serviceStatus==='ACTIVE'&&p.serviceKind==='STAFF'&&p.canReply===true&&p.canAcceptOrder===true,listManagerSessions:async()=>{requests.push('sessions');return {sessions:[]};},resolveEffectiveSessionExpiry:()=>0};
 const modules={viewSession:identity,zion,consultationService:{call:async op=>{requests.push(op);return {allowed:true};}},mock:{},chatContext:{enterCustomerView(){}},loginReturn:{clear(){}},testCustomerPreview:{isActive:()=>false}};
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/profile/profile.js'),'utf8'),{Page:p=>page=p,require:n=>modules[path.basename(n)]||{},wx:{getStorageSync:k=>storage[k],setStorageSync:(k,v)=>storage[k]=v,removeStorageSync:k=>delete storage[k],showTabBar(){}},console:{warn(){}}});
 page.data=structuredClone(page.data);page.setData=patch=>Object.assign(page.data,patch);return {page,pending,storage,requests,zion};
}
const agent={id:'17',accountId:'39',serviceStatus:'ACTIVE',serviceKind:'AGENT',canReply:false,canAcceptOrder:false};
test('普通用户不因本地role或旧邀请状态看到管理、代理、签到功能',async()=>{
 for(const provider of [null,{...agent,serviceStatus:'INACTIVE'},{...agent,accountId:'other'},{...agent,serviceKind:'CUSTOMER'}]){
  const h=setup();h.page.setData({canInvite:true,canCheckin:true,isServiceProvider:true});const job=h.page.loadManagerAccess(h.storage.userInfo);
  assert.equal(h.page.data.canInvite,false);h.pending[0].resolve(provider);await job;
  assert.equal(h.page.data.canInvite,false);assert.equal(h.page.data.canCheckin,false);assert.equal(h.page.data.isServiceProvider,false);assert.deepEqual(h.requests,[]);
 }
});
test('旧请求晚到不会覆盖同账号最新身份校验，也不能覆盖换号或退出',async()=>{
 for(const change of ['refresh','account','logout','unload','no-user']){
  const h=setup(),old=h.page.loadManagerAccess(h.storage.userInfo);
  if(change==='refresh'){const latest=h.page.loadManagerAccess(h.storage.userInfo);h.pending[1].resolve(null);await latest;}
  else if(change==='account')h.storage.userInfo={id:'40'};
  else if(change==='logout')h.page.logout();
  else if(change==='unload')h.page.onUnload();
  else {delete h.storage.userInfo;h.page.hydrateUserFromStorage();}
  h.pending[0].resolve(agent);await old;
  assert.equal(h.page.data.canInvite,false,change);assert.equal(h.page.data.isServiceProvider,false,change);
 }
});
test('已确认代理可以看到代理功能，身份接口失败则关闭全部特权入口',async()=>{
 const h=setup();let job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve(agent);await job;assert.equal(h.page.data.canInvite,true);assert.equal(h.page.data.isServiceProvider,false);assert.deepEqual(h.requests,[]);
 job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[1].reject(Error('offline'));await job;assert.equal(h.page.data.canInvite,false);
});
test('管理会话列表失败不会把已确认的管理身份变成普通用户',async()=>{
 const h=setup();h.zion.listManagerSessions=async()=>{throw Error('offline');};const job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve({...agent,serviceKind:'STAFF',canReply:true,canAcceptOrder:true});await job;
 assert.equal(h.page.data.isServiceProvider,true);assert.equal(h.page.data.canInvite,true);assert.equal(h.page.data.canCheckin,true);
});

 test('不能用上个账号的资料在新登录身份下恢复特权入口',async()=>{
 const h=setup();h.storage.userInfo={id:'40'};await h.page.loadManagerAccess({id:'39'});assert.equal(h.pending.length,0);assert.equal(h.page.data.canInvite,false);
 });
