const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
function setup(){
 let page;const pending=[],requests=[],storage={userInfo:{id:'39',role:'manager'},zionJwt:'A'};
 const identity={capture:()=>({accountId:String(storage.userInfo?.id || ""),token:storage.zionJwt}),current:s=>s.accountId===String(storage.userInfo?.id || "")&&s.token===storage.zionJwt};
 const zion={getServiceProviderByAccount:()=>{const d=defer();pending.push(d);return d.promise;},isManagerProvider:p=>p?.serviceStatus==='ACTIVE'&&p.serviceKind==='STAFF'&&p.canReply===true&&p.canAcceptOrder===true,listManagerSessions:async()=>{requests.push('sessions');return {sessions:[]};},resolveEffectiveSessionExpiry:()=>0};
 const checkin={allowed:false};
 const modules={viewSession:identity,zion,consultationService:{call:async op=>{requests.push(op);return checkin;}},mock:{},chatContext:{enterCustomerView(){}},loginReturn:{clear(){}},testCustomerPreview:{isActive:()=>false}};
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/profile/profile.js'),'utf8'),{Page:p=>page=p,require:n=>modules[path.basename(n)]||{},wx:{getStorageSync:k=>storage[k],setStorageSync:(k,v)=>storage[k]=v,removeStorageSync:k=>delete storage[k],showTabBar(){}},console:{warn(){}}});
 page.data=structuredClone(page.data);page.setData=patch=>Object.assign(page.data,patch);return {page,pending,storage,requests,zion,checkin,modules};
}
const agent={id:'17',accountId:'39',serviceStatus:'ACTIVE',serviceKind:'AGENT',canReply:false,canAcceptOrder:false};
test('普通用户不因本地role或旧邀请状态看到管理、代理、签到功能',async()=>{
 for(const provider of [null,{...agent,serviceStatus:'INACTIVE'},{...agent,accountId:'other'},{...agent,serviceKind:'CUSTOMER'}]){
  const h=setup();h.page.setData({canInvite:true,canCheckin:true,isServiceProvider:true});const job=h.page.loadManagerAccess(h.storage.userInfo);
  assert.equal(h.page.data.canInvite,false);h.pending[0].resolve(provider);await job;
  assert.equal(h.page.data.canInvite,false);assert.equal(h.page.data.canCheckin,false);assert.equal(h.page.data.isServiceProvider,false);assert.deepEqual(h.requests,['CHECKIN_ACCESS']);
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
 const h=setup();let job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve(agent);await job;assert.equal(h.page.data.canInvite,true);assert.equal(h.page.data.isServiceProvider,false);assert.deepEqual(h.requests,['CHECKIN_ACCESS']);
 job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[1].reject(Error('offline'));await job;assert.equal(h.page.data.canInvite,false);
});
test('管理会话列表失败不会把已确认的管理身份变成普通用户',async()=>{
 const h=setup();h.checkin.allowed=true;h.zion.listManagerSessions=async()=>{throw Error('offline');};const job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve({...agent,serviceKind:'STAFF',canReply:true,canAcceptOrder:true});await job;
 assert.equal(h.page.data.isServiceProvider,true);assert.equal(h.page.data.canInvite,true);assert.equal(h.page.data.canCheckin,true);
});

 test('不能用上个账号的资料在新登录身份下恢复特权入口',async()=>{
 const h=setup();h.storage.userInfo={id:'40'};await h.page.loadManagerAccess({id:'39'});assert.equal(h.pending.length,0);assert.equal(h.page.data.canInvite,false);
 });


test('身份读取失败显示待确认并可重试，不误报为普通用户', async()=>{
 const h=setup();let job=h.page.loadManagerAccess(h.storage.userInfo);
 assert.equal(h.page.data.managerAccessLoading,true);assert.equal(h.page.data.managerAccessError,'');
 h.pending[0].reject(Error('字段无访问权限'));await job;
 assert.equal(h.page.data.managerAccessLoading,false);assert.ok(h.page.data.managerAccessError);assert.equal(h.page.data.isServiceProvider,false);
 h.page.data.userInfo=h.storage.userInfo;job=h.page.retryManagerAccess();
 assert.equal(h.page.data.managerAccessLoading,true);assert.equal(h.page.data.managerAccessError,'');
 h.pending[1].resolve({...agent,serviceKind:'STAFF',canReply:true,canAcceptOrder:true});await job;
 assert.equal(h.page.data.isServiceProvider,true);assert.equal(h.page.data.managerAccessError,'');
});

test('只有后端成功确认无工作身份时才显示用户，加载和错误有独立文案',async()=>{
 const h=setup(),job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve(null);await job;
 assert.equal(h.page.data.managerAccessError,'');assert.equal(h.page.data.managerAccessLoading,false);assert.equal(h.page.data.isServiceProvider,false);
 const template=fs.readFileSync(path.resolve(__dirname,'../../pages/profile/profile.wxml'),'utf8');
 assert.match(template,/managerAccessLoading \? '正在确认身份…' : managerAccessError \? '身份暂未确认'/);
 assert.match(template,/bindtap="retryManagerAccess"/);
});

 test('指定普通签到员独立显示入口，不开放代理和管理，刷新撤销后隐藏',async()=>{
 const h=setup();h.checkin.allowed=true;let job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve(null);await job;
 assert.equal(h.page.data.canCheckin,true);assert.equal(h.page.data.canInvite,false);assert.equal(h.page.data.isServiceProvider,false);assert.deepEqual(h.requests,['CHECKIN_ACCESS']);
 h.checkin.allowed=false;job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[1].resolve(null);await job;assert.equal(h.page.data.canCheckin,false);
 const template=fs.readFileSync(path.resolve(__dirname,'../../pages/profile/profile.wxml'),'utf8');
 assert.ok(template.indexOf('bindtap="goCheckin"')<template.indexOf('wx:if="{{canInvite}}"'));assert.match(template,/canCheckin \? '签到人员'/);
 });
 test('签到授权独立于服务人员接口失败，超管标识只读后台能力',async()=>{
 const h=setup();h.checkin.allowed=true;h.checkin.isSuperAdmin=true;let job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].reject(Error('offline'));await job;assert.equal(h.page.data.canCheckin,true);assert.equal(h.page.data.isSuperAdmin,true);
 h.modules.consultationService.call=async()=>{throw Error('offline');};job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[1].resolve(null);await job;assert.equal(h.page.data.canCheckin,false);assert.equal(h.page.data.isSuperAdmin,false);assert.ok(h.page.data.managerAccessError);
 });
 test('晚到的签到权限响应不能恢复已退出账号的入口',async()=>{
 const h=setup(),late=defer();h.modules.consultationService.call=()=>late.promise;const job=h.page.loadManagerAccess(h.storage.userInfo);h.pending[0].resolve(null);h.page.logout();late.resolve({allowed:true,isSuperAdmin:true});await job;assert.equal(h.page.data.canCheckin,false);assert.equal(h.page.data.isSuperAdmin,false);
 });
