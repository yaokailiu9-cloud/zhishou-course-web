const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const ROOT=path.join(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));
async function host(options={}){
  const {document,Event}=parseHTML(read('web/index.html'));
  document.defaultView.HTMLElement.prototype.scrollIntoView=function(){};
  Object.defineProperty(document,'currentScript',{value:{src:'http://localhost/web/replica/runtime.js?v=test'}});
  document.querySelectorAll('dialog').forEach(d=>{d.showModal=()=>{d.open=true};d.close=()=>{d.open=false}});
  const errors=[];
  const context={document,Event,console:{log(){},warn(){},error:(...args)=>errors.push(args)},URL,URLSearchParams,AbortController,setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},queueMicrotask,innerWidth:390,innerHeight:844,devicePixelRatio:1,requestAnimationFrame:fn=>queueMicrotask(fn),navigator:{userAgent:'test browser'},location:{pathname:'/web/',search:'',hash:'',origin:'http://localhost',href:'http://localhost/web/'},history:{pushState(){},replaceState(){},back(){}},addEventListener(){},scrollTo(){},scrollY:0,
    fetch:async url=>({ok:true,status:200,headers:[],json:async()=>({ok:true,data:{loggedIn:false}}),text:async()=>JSON.stringify({data:{course:[],advisor:[],course_by_pk:null,fz_invoke_action_flow:{result:{ok:true,data:{classes:[],items:[]}}}}})})};
  Object.assign(context.location,options.location);
  Object.assign(context.navigator,options.navigator);
  if(options.fetch)context.fetch=options.fetch;
  const replacements=[];
  context.history.replaceState=(_state,_title,url)=>replacements.push(url);
  context.window=context;vm.createContext(context);
  vm.runInContext(read('web/replica/source.js'),context);
  // Use the published configuration unless a test explicitly overrides it.
  if(typeof options.chatEntryVisible==='boolean')context.MiniSource.config.webFeatures.chatEntryVisible=options.chatEntryVisible;
  vm.runInContext(read('web/replica/runtime.js'),context);
  await tick();return{context,document,Event,host:context.MiniHost,errors,replacements};
}
function sessionFetch(user,provider){
  return async url=>{
    const body=String(url).includes('action=session')?{ok:true,data:{loggedIn:!!user,user}}:{data:{service_provider:provider?[provider]:[],course:[],advisor:[],course_by_pk:null,fz_invoke_action_flow:{result:{ok:true,data:{classes:[],items:[]}}}}};
    return {ok:true,status:200,headers:[],json:async()=>body,text:async()=>JSON.stringify(body)};
  };
}
const MANAGER_PROVIDER={id:14,account_id:1000000000000019,service_status:'ACTIVE',service_kind:'STAFF',can_reply:true,can_accept_order:true};
test('正式网站底部聊天入口只对管理人员和黄泰铭开放，其他人暂不显示',async()=>{
  const features=JSON.parse(read('web/features.json'));
  assert.equal(features.chatEntryVisible,false);
  assert.equal(features.chatEntryForManagers,true);
  assert.deepEqual(features.chatEntryAccountIds,['1000000000000039']);
  const chat=h=>h.document.querySelector('#tabbar [data-route="pages/chat/chat"]');
  const guest=await host();
  assert.equal(chat(guest),null);assert.equal(guest.document.querySelectorAll('#tabbar button').length,3);
  const customer=await host({fetch:sessionFetch({id:'1000000000000050',name:'普通家长'},null)});await tick();
  assert.equal(chat(customer),null);
  const agent=await host({fetch:sessionFetch({id:'1000000000000051',name:'代理'},{...MANAGER_PROVIDER,account_id:1000000000000051,service_kind:'AGENT'})});await tick();
  assert.equal(chat(agent),null);
  const named=await host({fetch:sessionFetch({id:'1000000000000039',name:'黄泰铭'},null)});await tick();
  assert.equal(chat(named).textContent,'聊天');
  const manager=await host({fetch:sessionFetch({id:'1000000000000019',name:'刘曜恺'},MANAGER_PROVIDER)});await tick();
  assert.equal(manager.document.querySelectorAll('#tabbar button').length,4);
  chat(manager).onclick();await tick();
  assert.equal(manager.host.current.route,'pages/chat/chat');
  assert.equal(chat(manager).getAttribute('aria-current'),'page');
  assert.equal(manager.document.getElementById('tabbar').hidden,false);
  for(const h of [guest,customer,agent,named,manager])assert.deepEqual(h.errors,[]);
});
test('打开全员显示开关时所有人都能看到聊天入口',async()=>{
  const h=await host({chatEntryVisible:true});
  assert.equal(h.document.querySelectorAll('#tabbar button').length,4);
  assert.equal(h.document.querySelector('#tabbar [data-route="pages/chat/chat"]').textContent,'聊天');
});
test('关闭显示开关时只隐藏聊天入口，旧链接和咨询反馈页面保留',async()=>{
  const h=await host({chatEntryVisible:false,location:{hash:'#/pages/chat/chat?appointmentId=31'}});
  assert.equal(h.host.current.route,'pages/chat/chat');
  assert.equal(h.host.current.options.appointmentId,'31');
  assert.equal(h.document.querySelector('#tabbar [data-route="pages/chat/chat"]'),null);
  assert.equal(h.document.querySelectorAll('#tabbar button').length,3);
  for(const method of ['navigateTo','switchTab','redirectTo','reLaunch']){
    h.host.wx[method]({url:'/pages/chat/chat'});await tick();
    assert.equal(h.host.current.route,'pages/chat/chat');
  }
  h.host.wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id=31'});await tick();
  assert.equal(h.host.current.route,'pages/consultation-detail/consultation-detail');
  assert.equal(h.host.current.options.id,'31');
  assert.deepEqual(h.errors,[]);
});
test('从我的链接进入时落到首页，仍可主动切换我的且课程分享链接可直达',async()=>{
  for(const hash of ['', '#mine', '#/pages/profile/profile']){
    const h=await host({location:{hash}});
    assert.equal(h.host.current.route,'pages/index/index');
    assert.equal(h.replacements.at(-1),'/web/#/pages/index/index');
    h.document.querySelector('[data-route="pages/profile/profile"]').onclick();
    await tick();assert.equal(h.host.current.route,'pages/profile/profile');
  }
  const h=await host({location:{hash:'#/pages/public-class-detail/public-class-detail?id=12'}});
  assert.equal(h.host.current.route,'pages/public-class-detail/public-class-detail');
  assert.equal(h.host.current.options.id,'12');
});
test('客户页按后台邀请权限隐藏推荐入口，只有本人方案入口可见',async()=>{
  const h=await host();
  h.host.wx.navigateTo({url:'/pages/profile/profile'});await tick();
  const page=h.document.getElementById('page');
  h.host.current.setData({isLoggedIn:true,canInvite:false,hasMyPlan:true,userInfo:{id:'18',nickName:'客户',role:'agent'}});await tick();
  assert.doesNotMatch(page.textContent,/简易方案梳理|推荐客户|累计消费/);
  assert.match(page.textContent,/我的方案/);
  h.host.current.setData({canInvite:true,userInfo:{id:'19',nickName:'代理',role:'agent'}});await tick();
  assert.match(page.textContent,/简易方案梳理|推荐客户/);
  assert.doesNotMatch(page.textContent,/累计消费/);
});
test('微信登录请求指定首页为回调落点并保留推荐人',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=test-ref',hash:'#mine'}});
  h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
  h.host.current.loginByWechat();
  const url=new URL(h.context.location.href,'http://localhost');
  assert.equal(url.searchParams.get('return'),'/web/#/pages/index/index');
  assert.equal(url.searchParams.get('ref'),'test-ref');
});

test('扫码来源先保存再登录，刷新无 ref 仍强制登录并回到原课程',async()=>{
  const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=7';let calls=[];
  const fetch=async(url,options={})=>{calls.push({url,options});return {ok:true,status:200,headers:[],json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:false,invitation:{returnTo}}:String(url).includes('capture-referral')?{invitation:{returnTo}}:{candidate:{name:'推荐人甲'}}})};};
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=signed-invitation',hash:'#/pages/public-class-detail/public-class-detail?id=7'},fetch});
  assert.equal(calls[0].url,'/api/h5?action=capture-referral');assert.equal(JSON.parse(calls[0].options.body).returnTo,returnTo);assert.equal(calls[0].options.credentials,'same-origin');
  assert.equal(h.host.current.route,'pages/invite-login/invite-login');assert.doesNotMatch(h.document.querySelector('#page').textContent,/推荐人甲|代理|推荐归属/);
  h.host.wx.switchTab({url:'/pages/plaza/plaza'});await tick();assert.equal(h.host.current.route,'pages/invite-login/invite-login');
  await h.host.current.login();let url=new URL(h.context.location.href,'http://localhost');assert.equal(url.searchParams.get('return'),returnTo);
  const refreshed=await host({navigator:{userAgent:'MicroMessenger'},fetch});assert.equal(refreshed.host.current.route,'pages/invite-login/invite-login');await refreshed.host.current.login();url=new URL(refreshed.context.location.href,'http://localhost');assert.equal(url.searchParams.get('return'),returnTo);assert.equal(url.searchParams.get('ref'),'');
});

test('邀请保存失败时不能继续报名；已有登录遇到有效推荐码不强制重新授权',async()=>{
  for(const fail of [true,false]){
    const h=await host({location:{search:'?ref=signed',hash:'#/pages/public-class-detail/public-class-detail?id=7'},fetch:async(url)=>({ok:!fail||!String(url).includes('capture-referral'),status:fail?500:200,headers:[],json:async()=>({ok:!fail||!String(url).includes('capture-referral'),data:String(url).includes('action=session')?{loggedIn:true,user:{id:'18',name:'家长'},invitation:{returnTo:'/web/#/pages/public-class-detail/public-class-detail?id=7'}}:{invitation:{returnTo:'/web/#/pages/public-class-detail/public-class-detail?id=7'}}}),text:async()=>JSON.stringify({data:{fz_invoke_action_flow:{result:{ok:true,data:{classInfo:{id:7,status:'PUBLISHED'}}}}}})})});
    assert.equal(h.host.current.route,fail?'pages/invite-login/invite-login':'pages/public-class-detail/public-class-detail');assert.equal(h.host.wx.getStorageSync('userInfo').id,'18');
  }
});
test('扫码网络故障重试恢复原课程并发起授权，不再刷新错误页',async()=>{
  const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=16';let captures=0;
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=signed-course',hash:returnTo.split('/web/')[1]},fetch:async(url,options={})=>{
    if(String(url).includes('capture-referral')){captures++;assert.equal(JSON.parse(options.body).returnTo,returnTo);if(captures===1)throw Error('网络连接中断');}
    return {ok:true,status:200,json:async()=>({ok:true,data:String(url).includes('session')?{loggedIn:false}:{invitation:{returnTo}}})};
  }});
  assert.equal(h.host.current.route,'pages/invite-login/invite-login');assert.match(h.host.current.data.error,/网络连接中断/);assert.equal(h.replacements.at(-1),'/web/?ref=signed-course'+returnTo.split('/web/')[1]);
  await h.host.current.login();assert.equal(captures,2);const login=new URL(h.context.location.href,'http://localhost');assert.equal(login.pathname,'/api/h5');assert.equal(login.searchParams.get('return'),returnTo);assert.equal(login.searchParams.get('ref'),'signed-course');
});
test('入口登录不依赖推荐展示查询，已过期的后台登录能重新微信授权',async()=>{
  const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=16';
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=signed-course',hash:returnTo.split('/web/')[1]},fetch:async url=>{
    if(String(url).includes('referral-context'))throw Error('可选推荐查询不可用');
    const capture=String(url).includes('capture-referral');return {ok:!capture,status:capture?401:200,json:async()=>capture?{ok:false,code:'INVITATION_LOGIN_REQUIRED',message:'登录状态已过期，请重新微信登录后继续报名'}:{ok:true,data:{loggedIn:true,user:{id:'101',name:'家长'},invitation:{returnTo}}},text:async()=>JSON.stringify({data:{service_provider:[]}})};
  }});
  assert.match(h.host.current.data.error,/登录状态已过期/);await h.host.current.login();assert.equal(new URL(h.context.location.href,'http://localhost').searchParams.get('return'),returnTo);
});
test('报名截止和无效二维码显示真实原因，不发起授权或改为请重发的通用提示',async()=>{
  for(const message of ['本场报名已截止，请查看其他课程','报名二维码已失效，请联系分享人重新发送']){
    const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=signed-course',hash:'#/pages/public-class-detail/public-class-detail?id=16'},fetch:async url=>{const capture=String(url).includes('capture-referral');return {ok:!capture,status:capture?400:200,json:async()=>capture?{ok:false,message}:{ok:true,data:{loggedIn:false}}};}});
    assert.equal(h.host.current.data.error,message);await h.host.current.login();assert.equal(h.host.current.data.error,message);assert.equal(h.context.location.href,'http://localhost/web/');
  }
});
test('all registered pages are bundled from the exact current mini-program sources',()=>{
  const manifest=JSON.parse(read('web/replica-manifest.json'));
  assert.deepEqual(manifest.pages,JSON.parse(read('app.json')).pages);
  for(const [file,hash]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),hash,file);
  for(const route of manifest.pages)assert.ok(fs.existsSync(path.join(ROOT,'web/replica',route.split('/')[1]+'.css')));
  assert.doesNotMatch(read('web/replica/base.css'),/##page|\d+rpx/);
});
test('网页课程日期和时间选择器参与表单提交',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/course-edit/course-edit?id=6'});await tick();
  h.host.current.setData({allowed:true,loading:false});await tick();
  const form=h.document.querySelector('form');
  for(const name of ['date','time','closeDate','closeTime','checkinDate','checkinTime'])
    assert.ok(form.querySelector(`.web-picker-control[name="${name}"]`),`${name} must be a named form control`);
});
test('微信网页扫码使用官方扫一扫并将个人码交回签到页，取消可再次扫描',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let ready,config,scan,out,failure;
  h.context.wx={config:r=>{config=r;ready();},ready:fn=>{ready=fn;},error(){},updateAppMessageShareData(){throw new Error('分享菜单不可用')},scanQRCode:r=>{scan=r;}};
  await h.host.wx.scanCode({success:r=>out=r,fail:r=>failure=r});
  assert.ok(config.jsApiList.includes('scanQRCode'));assert.equal(scan.needResult,1);
  scan.success({resultStr:'EMPATH-ENTRY:'+'A'.repeat(24)});assert.equal(out.result,'EMPATH-ENTRY:'+'A'.repeat(24));
  await h.host.wx.scanCode({fail:r=>failure=r});scan.cancel();assert.equal(failure.errMsg,'cancel');
});
test('普通浏览器保留拍照识码入口，取消结束本次扫描',async()=>{
  const h=await host();const original=h.document.createElement.bind(h.document);let input,failure;
  h.document.createElement=tag=>{const el=original(tag);if(tag==='input'){input=el;el.click=()=>{};}return el;};
  await h.host.wx.scanCode({fail:r=>failure=r});assert.equal(input.accept,'image/*');assert.equal(input.capture,'environment');input.oncancel();assert.equal(failure.errMsg,'cancel');
});
test('拍照识码在没有 createImageBitmap 的微信浏览器中仍可读取照片并释放资源',async()=>{
  const h=await host();const original=h.document.createElement.bind(h.document);let input,canvas,result,revoked=false;
  h.context.URL={createObjectURL:()=> 'blob:scan-test',revokeObjectURL:()=>{revoked=true}};
  h.context.jsQR=()=>({data:'EMPATH-ENTRY:'+'A'.repeat(24)});
  h.document.createElement=tag=>{const el=original(tag);
    if(tag==='input'){input=el;el.click=()=>{};Object.defineProperty(el,'files',{value:[{type:'image/jpeg'}]});}
    if(tag==='img'){Object.defineProperties(el,{naturalWidth:{value:2400},naturalHeight:{value:1800},src:{set(){queueMicrotask(()=>el.onload())}}});}
    if(tag==='canvas'){canvas=el;el.getContext=()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(4),width:canvas.width,height:canvas.height})});}
    return el;};
  await h.host.wx.scanCode({success:r=>result=r});await input.onchange();
  assert.equal(result.result,'EMPATH-ENTRY:'+'A'.repeat(24));assert.equal(canvas.width,1600);assert.equal(canvas.height,1200);
  assert.equal(revoked,true);assert.equal(input.parentElement,null);
});
test('微信签名未配置时明确提示拍照识码，点击后仍能进入相机入口',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});h.context.wx={config(){}};
  h.context.fetch=async()=>({ok:false,json:async()=>({ok:false,message:'配置暂不可用'})});
  const original=h.document.createElement.bind(h.document);let input,failure;
  h.document.createElement=tag=>{const el=original(tag);if(tag==='input'){input=el;el.click=()=>{};}return el;};
  await h.host.wx.scanCode({fail:r=>failure=r});assert.match(h.document.querySelector('#modal').textContent,/配置暂不可用/);
  h.document.querySelector('#modal .modal-actions button:last-child').onclick();assert.equal(input.capture,'environment');input.oncancel();assert.equal(failure.errMsg,'cancel');
});
test('微信配置和扫一扫的原始错误可在拍照兜底提示中定位',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let report;
  h.context.wx={config(){report({errMsg:'config:invalid url domain'})},ready(){},error:fn=>{report=fn}};
  await h.host.wx.scanCode({});
  assert.match(h.document.querySelector('#modal').textContent,/JS 接口安全域名未通过/);
  assert.match(h.document.querySelector('#modal').textContent,/config:invalid url domain/);
  h.document.querySelector('#modal .modal-actions button:first-child').onclick();
  let scan;h.context.wx={config(){},ready:fn=>fn(),error(){},scanQRCode:fn=>{scan=fn}};
  await h.host.wx.scanCode({});scan.fail({errMsg:'scanQRCode:fail no permission'});
  assert.match(h.document.querySelector('#modal').textContent,/扫一扫调用：scanQRCode:fail no permission/);
});
test('微信离线权限校验失败后重新配置并重试一次扫一扫',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let ready,scan,configCount=0,scanCount=0,result;
  h.context.wx={ready:fn=>{ready=fn},error(){},config(){configCount++;ready()},scanQRCode:fn=>{scan=fn;scanCount++}};
  await h.host.wx.scanCode({success:r=>result=r});
  scan.fail({errMsg:'scanQRCode:the permission value is offline verifying'});
  await new Promise(resolve=>setTimeout(resolve,420));
  assert.equal(configCount,2);assert.equal(scanCount,2);
  scan.success({resultStr:'EMPATH-ENTRY:'+'B'.repeat(24)});
  assert.equal(result.result,'EMPATH-ENTRY:'+'B'.repeat(24));
});
test('微信扫一扫拒绝后网页相机连续识码并释放摄像头',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let ready,scan,result,stopped=false;
  h.context.navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop:()=>{stopped=true}}]})};
  h.context.wx={ready:fn=>{ready=fn},error(){},config(){ready()},scanQRCode:fn=>{scan=fn}};
  const video=h.document.querySelector('#live-scanner video');
  Object.defineProperties(video,{readyState:{value:4},videoWidth:{value:1280},videoHeight:{value:720}});
  video.play=async()=>{};
  h.context.jsQR=()=>({data:'EMPATH-ENTRY:'+'C'.repeat(24)});
  const create=h.document.createElement.bind(h.document);
  h.document.createElement=tag=>{const el=create(tag);if(tag==='canvas')el.getContext=()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(4),width:800,height:450})});return el};
  h.context.requestAnimationFrame=fn=>{queueMicrotask(()=>fn(200));return 1};
  await h.host.wx.scanCode({success:r=>result=r});scan.fail({errMsg:'scanQRCode:fail no permission'});await tick();
  assert.equal(result.result,'EMPATH-ENTRY:'+'C'.repeat(24));assert.equal(stopped,true);
  assert.equal(h.document.querySelector('#live-scanner').open,false);
});
test('home renders source content, real tab navigation, and all page modules without JS errors',async()=>{
  const h=await host({chatEntryVisible:true});assert.match(h.document.getElementById('page').textContent,/透过现象看本质/);
  assert.doesNotMatch(h.document.getElementById('page').textContent,/到课核实后，可申请线下咨询/);
  assert.equal(h.document.querySelectorAll('#tabbar button').length,4);
  const customerRedirects=new Set(['pages/manager/manager','pages/referrals/referrals','pages/questionnaire-share/questionnaire-share']);
  for(const route of h.context.MiniSource.config.pages){h.host.wx.navigateTo({url:'/'+route});await tick();assert.equal(h.host.current.route,customerRedirects.has(route)?route==='pages/manager/manager'?'pages/profile/profile':'pages/customer/customer':route);assert.ok(h.document.getElementById('page').textContent.trim(),route)}
  assert.deepEqual(h.errors,[]);
});
test('网页公开课显示后台费用但不向报名端展示名额，名额只保留在管理端',async()=>{
  assert.match(read('pages/public-class/public-class.wxml'),/\{\{item\.feeText\}\}/);
  assert.match(read('pages/public-class/public-class.wxml'),/course-cover/);
  assert.doesNotMatch(read('pages/public-class/public-class.wxml'),/seatsText|剩余.*名额/);
  assert.doesNotMatch(read('pages/public-class-detail/public-class-detail.wxml'),/课堂名额|seatsText/);
  assert.match(read('pages/course-manage/course-manage.wxml'),/已报名.*名额/);
  const h=await host();h.host.wx.navigateTo({url:'/pages/public-class/public-class'});await tick();
  h.host.current.setData({classes:[{id:'5',title:'公开课测试',coverUrl:'https://example.invalid/cover.jpg',timeText:'周六',placeText:'深圳',description:'课程介绍',canEnroll:true,capacity:30,reserved_count:0,feeText:'￥100.00',isPaid:true}],loading:false,error:''});await tick();
  const page=h.document.getElementById('page');
  assert.doesNotMatch(page.textContent,/免费公开课|到课核实后，可申请线下咨询|课堂名额|剩余\s*30|30\s*\/\s*30/);assert.match(page.textContent,/￥100\.00|报名开放/);
  assert.equal(page.querySelectorAll('.course-card .course-cover,.course-card .course-cover-fallback').length,0);
  assert.match(page.textContent,/公开课/);
  h.host.wx.navigateTo({url:'/pages/profile/profile'});await tick();
  assert.doesNotMatch(h.document.getElementById('page').textContent,/报名参加后，可申请线下咨询/);
});
test('loop rendering and conditional states preserve user input and search filtering',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/search/search?mode=courses'});await tick();
  const input=h.document.querySelector('input');assert.ok(input);input.value='家庭';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.document.querySelector('input').value,'家庭');
  const titles=['奖励的误区','倾诉的陷阱','安全感从哪来','为何知错不改','问题从哪里来','判断准确吗','有没有选择权','什么是沟通','沉迷手机','该不该使用手机','责善'];
  const rows=titles.map((title,index)=>({id:String(index+7),title,subtitle:title==='责善'?'个人成长课程':'《答案库》系列课程',badge:'付费',enabled:true,cover_image:{url:'https://example.invalid/cover.png'},course_lesson:[{id:index+1,title}]}));
  h.context.fetch=async(_url,options)=>{const request=JSON.parse(options.body);const data=request.query.includes('query GetCourse')?{course_by_pk:rows.find(row=>row.id===String(request.variables.id))}:{course:rows};return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data})};};
  h.host.wx.navigateTo({url:'/pages/index/index'});await tick();
  const homePage=h.document.getElementById('page');
  assert.match(homePage.textContent,/公开课程|个人成长课程|孩子系列课程/);
  assert.equal(homePage.querySelectorAll('.home-growth-card').length,1);
  assert.deepEqual([...homePage.querySelectorAll('.home-topic-card .topic-title')].map(node=>node.textContent),['沉迷手机','该不该使用手机']);
  assert.equal(h.document.querySelectorAll('.series-entry').length,1);
  const homeOrder=[...homePage.querySelectorAll('.series-entry,.home-topic-card,.home-growth-card')];
  assert.ok(homeOrder[0].classList.contains('series-entry'));
  assert.deepEqual(homeOrder.slice(1,3).map(node=>node.querySelector('.topic-title').textContent),['沉迷手机','该不该使用手机']);
  assert.ok(homeOrder[3].classList.contains('home-growth-card'));
  for(const card of homePage.querySelectorAll('.home-topic-card'))assert.equal(card.querySelector('.topic-cover-image').getAttribute('src'),'https://example.invalid/cover.png');
  assert.doesNotMatch(h.document.getElementById('page').textContent,/奖励的误区|倾诉的陷阱/);
  homePage.querySelector('[aria-label="查看沉迷手机"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.host.current.route,'pages/course-detail/course-detail');assert.equal(h.host.current.options.id,'15');
  h.host.wx.switchTab({url:'/pages/index/index'});await tick();
  const link=h.document.querySelector('[aria-label="查看孩子系列课程"]');assert.ok(link);
  link.dispatchEvent(new h.Event('click'));await tick();assert.equal(h.host.current.route,'pages/plaza/plaza');
  assert.equal(h.document.querySelectorAll('.library-tab').length,2);
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,10);
  assert.match(h.document.getElementById('page').textContent,/个人成长|孩子系列课程/);
  const courseSearch=h.document.querySelector('.library-search-input');assert.ok(courseSearch);
  courseSearch.value='手机';courseSearch.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,2);
  h.document.querySelector('[aria-label="清空搜索"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,10);
  for(const row of rows.slice(0,10)){
    h.document.querySelector('[aria-label="查看'+row.title+'"]').dispatchEvent(new h.Event('click'));await tick();
    assert.equal(h.host.current.route,'pages/course-detail/course-detail');assert.equal(h.host.current.options.id,row.id);
    assert.equal(h.document.querySelector('.chapter-title').textContent,row.title);
    h.host.wx.switchTab({url:'/pages/plaza/plaza'});await tick();
  }
  h.document.querySelector('[aria-label="查看个人成长课程"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,1);
  assert.equal(h.document.querySelector('.library-search-input').value,'');
  h.document.querySelector('[aria-label="查看责善"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.host.current.options.id,'17');
  h.host.wx.switchTab({url:'/pages/index/index'});await tick();
  h.document.querySelector('[aria-label="查看孩子系列课程"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.host.current.data.activeCategory,'child','从首页进入系列时不会停留在上次的个人成长分类');
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,10);
  assert.equal(h.host.wx.getStorageSync('courseLibraryCategory'),'');
  h.host.wx.switchTab({url:'/pages/index/index'});await tick();
  h.document.querySelector('[aria-label="查看该不该使用手机"]').dispatchEvent(new h.Event('click'));await tick();
  assert.equal(h.host.current.route,'pages/course-detail/course-detail');assert.equal(h.host.current.options.id,'16');
});
test('网页表单等待中文输入法组词完成后再更新页面',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/course-edit/course-edit'});await tick();
  h.host.current.setData({allowed:true,loading:false});await tick();
  const input=h.document.querySelector('input[name="title"]');assert.ok(input);
  input.dispatchEvent(new h.Event('compositionstart',{bubbles:true}));
  input.value='奖励的误区';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.host.current.data.form.title,'');
  input.dispatchEvent(new h.Event('compositionend',{bubbles:true}));await tick();
  assert.equal(h.host.current.data.form.title,'奖励的误区');
  assert.equal(h.document.querySelector('input[name="title"]').value,'奖励的误区');
});
test('家长与工作人员拼音组词期间的自动刷新不能替换输入框，选字后可连续输入并发送',async()=>{
 for(const owner of [true,false]){
  const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();const p=h.host.current,calls=[];
  p.serviceSelectedId=31;p.refreshServiceCase=async()=>{};p.serviceAction=async(op,payload)=>{calls.push({op,payload});return {item:{id:52,revision:1}};};
  p.setData({serviceMode:true,serviceActive:{id:31,childName:'测试孩子'},serviceDetail:{owner,staff:!owner,canDraft:!owner,appointment:{}},serviceLoading:false,serviceTab:'feedback',serviceDraftFeedbackId:owner?null:17,serviceFeedback:[{id:17,content:'反馈'}],serviceInput:''});await tick();
  const input=h.document.querySelector('.service-composer textarea');assert.ok(input);
  Object.defineProperty(h.document,'activeElement',{configurable:true,get:()=>input});
  const ancestors=[];for(let el=input;el&&el.id!=='page';el=el.parentNode)ancestors.push(el);
  for(const [pinyin,committed]of [['haizi','孩子'],['zuijin','孩子最近']]){
   input.dispatchEvent(new h.Event('compositionstart',{bubbles:true}));
   input.value=pinyin;const composing=new h.Event('input',{bubbles:true});composing.isComposing=true;input.dispatchEvent(composing);
   p.setData({serviceMessages:[{id:'new',content:'刷新收到新回复'}]});await tick();
   assert.equal(h.document.querySelector('.service-composer textarea')===input,true);assert.equal(input.value,pinyin);assert.ok(input.isConnected);
   input.value=committed;input.dispatchEvent(new h.Event('compositionend',{bubbles:true}));await tick();
   assert.equal(p.data.serviceInput,committed);assert.equal(h.document.querySelector('.service-composer textarea')===input,true);
   input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
   assert.equal(p.data.serviceInput,committed);assert.equal(input.value,committed);
  }
  assert.ok(ancestors.every(el=>el.isConnected),'文本框及其父级持续连接，手机键盘和撤销栈不被打断');
  input.value+='很好';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.document.querySelector('.service-composer textarea')===input,true);
  assert.equal(h.document.querySelector('.service-composer .service-primary').disabled,false);
  h.document.querySelector('.service-composer .service-primary').click();await tick();
  assert.equal(calls.length,1);assert.equal(calls[0].op,owner?'SEND_SERVICE_FEEDBACK':'SAVE_SERVICE_DRAFT');assert.equal(calls[0].payload.content,'孩子最近很好');
  assert.equal(input.value,owner?'':'孩子最近很好');assert.equal(p.data.serviceInput,owner?'':'孩子最近很好');assert.deepEqual(h.errors,[]);
 }
});
test('中文输入中的回车只选字，正常回车可确认；切换页面不会被旧输入法锁住',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();const p=h.host.current;
 p.setData({serviceMode:false,chatType:'private',inputText:'',canSend:true,isLoggedIn:true});await tick();
 // A small compiled-template fixture exercises bindconfirm with real DOM events.
 h.context.MiniSource.pages[p.route].tree=[{tag:'input',attrs:{bindinput:['imeInput'],bindconfirm:['imeConfirm'],value:['']},children:[]}];
 let confirms=0;p.imeInput=()=>{};p.imeConfirm=()=>{confirms++};p.setData({});await tick();
 const input=h.document.querySelector('#page input');
 const enter=props=>{const event=new h.Event('keydown',{bubbles:true});Object.assign(event,{key:'Enter',...props});input.dispatchEvent(event)};
 input.dispatchEvent(new h.Event('compositionstart',{bubbles:true}));enter({});assert.equal(confirms,0);
 input.dispatchEvent(new h.Event('compositionend',{bubbles:true}));enter({isComposing:true});enter({keyCode:229});assert.equal(confirms,0);
 enter({});assert.equal(confirms,1);
 input.dispatchEvent(new h.Event('compositionstart',{bubbles:true}));p.setData({poll:true});await tick();
 h.host.wx.navigateTo({url:'/pages/profile-edit/profile-edit'});await tick();assert.equal(h.document.getElementById('page').dataset.route,'pages/profile-edit/profile-edit');
 h.host.current.setData({nickName:'新昵称'});await tick();assert.match(h.document.getElementById('page').textContent,/保存/);assert.deepEqual(h.errors,[]);
});
test('输入框前增删其他字段不会抢走焦点，保留的父级事件使用最新数据',async()=>{
 const h=await host();const p=h.host.current,seen=[];
 h.context.MiniSource.expressions.push(scope=>scope.extra,scope=>scope.draft,scope=>scope.caseId);
 const end=h.context.MiniSource.expressions.length;
 const field=name=>({tag:'input',attrs:{name:[name],value:[{e:end-2}],bindinput:['editDraft']},children:[]});
 h.context.MiniSource.pages[p.route].tree=[{tag:'view',attrs:{bindtap:['readCase'],'data-id':[{e:end-1}]},children:[{...field('extra'),'attrs':{...field('extra').attrs,'wx:if':[{e:end-3}]}},field('message')]}];
 p.editDraft=e=>p.setData({draft:e.detail.value});p.readCase=e=>seen.push(e.currentTarget.dataset.id);
 p.setData({extra:false,draft:'中文',caseId:'31'});await tick();const input=h.document.querySelector('input[name="message"]');
 Object.defineProperty(h.document,'activeElement',{configurable:true,get:()=>input});
 p.setData({extra:true,caseId:'32'});await tick();assert.equal(h.document.querySelector('input[name="message"]')===input,true);
 input.dispatchEvent(new h.Event('click',{bubbles:true}));assert.deepEqual(seen,['32']);
 input.value+='输入';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();assert.equal(p.data.draft,'中文输入');assert.equal(h.document.querySelector('input[name="message"]')===input,true);
 p.setData({extra:false});await tick();assert.equal(h.document.querySelector('input[name="message"]')===input,true);assert.deepEqual(h.errors,[]);
});
test('date/selector controls emit mini-program values and protected pages do not grant staff access',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/profile-edit/profile-edit'});await tick();
  const select=h.document.querySelector('select');assert.ok(select);const option=select.querySelectorAll('option')[2];option.selected=true;select.dispatchEvent(new h.Event('change',{bubbles:true}));await tick();assert.equal(h.host.current.data.gender,'男');
  const birthday=[...h.document.querySelectorAll('.web-picker[role="button"]')].find(el=>/生日/.test(el.textContent));assert.ok(birthday);assert.match(birthday.textContent,/生日.*请选择/);
  const click=el=>el.dispatchEvent(new h.Event('click',{bubbles:true}));
  click(birthday);const sheet=h.document.querySelector('.web-sheet');assert.ok(sheet,'点击生日应打开日期面板');
  const pick=(act,value)=>{const s=sheet.querySelector(`select[data-act="${act}"]`);for(const o of s.querySelectorAll("option"))o.value===String(value)?o.setAttribute("selected",""):o.removeAttribute("selected");s.dispatchEvent(new h.Event('change',{bubbles:true}));};
  pick('year',2012);pick('month',2);click(sheet.querySelector('[data-day="2012-03-04"]'));
  assert.equal(h.host.current.data.birthday||'','', '确定前不写入页面数据');click(sheet.querySelector('[data-act="ok"]'));await tick();
  assert.equal(h.host.current.data.birthday,'2012-03-04');assert.equal(h.document.querySelector('.web-sheet'),null);
  h.host.wx.disableAlertBeforeUnload();h.host.wx.navigateTo({url:'/pages/course-roster/course-roster?id=1'});await tick();assert.equal(h.host.current.data.allowed,false);
  assert.equal(h.host.wx.getStorageSync('zionJwt'),'');assert.equal(h.document.querySelectorAll('[data-field="attendanceStatus"]').length,0);
});
test('网页时间面板：先选小时再选分钟不重绘页面，确定后只回传一次并在重开时保留',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/course-edit/course-edit?id=6'});await tick();
  h.host.current.setData({allowed:true,loading:false});await tick();
  const click=el=>el.dispatchEvent(new h.Event('click',{bubbles:true}));
  const field=()=>h.document.querySelector('.web-picker-control[name="time"]').closest('.web-picker');
  const before=field();let updates=0;const setData=h.host.current.setData.bind(h.host.current);h.host.current.setData=(...a)=>{updates++;return setData(...a)};
  click(before);let sheet=h.document.querySelector('.web-sheet');assert.ok(sheet);
  click(sheet.querySelector('[data-hour="14"]'));click(sheet.querySelector('[data-minute="30"]'));await tick();
  assert.equal(updates,0,'选择过程中不应触发页面 setData');assert.equal(field(),before,'选择过程中页面元素不应被重建');
  assert.match(sheet.querySelector('.web-sheet-value').textContent,/14:30/);
  click(sheet.querySelector('[data-act="ok"]'));await tick();
  assert.equal(h.host.current.data.form.time,'14:30');assert.equal(updates,1);
  assert.equal(h.document.querySelector('.web-picker-control[name="time"]').value,'14:30');
  click(field());sheet=h.document.querySelector('.web-sheet');assert.ok(sheet.querySelector('[data-hour="14"].on'));assert.ok(sheet.querySelector('[data-minute="30"].on'));
  click(sheet.querySelector('[data-act="cancel"]'));assert.equal(h.document.querySelector('.web-sheet'),null);assert.equal(h.host.current.data.form.time,'14:30');
});
test('网页日期面板不能选早于最早可选日期的日子',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/course-edit/course-edit?id=6'});await tick();
  h.host.current.setData({allowed:true,loading:false});await tick();
  const el=h.document.querySelector('.web-picker-control[name="date"]').closest('.web-picker');
  el.dispatchEvent(new h.Event('click',{bubbles:true}));const sheet=h.document.querySelector('.web-sheet');
  const days=[...sheet.querySelectorAll('[data-day]')];assert.ok(days.length>=28);assert.ok(sheet.querySelector('.web-day.on'),'默认选中今天，可直接确定');
});
test('网页定位使用浏览器授权并把城市与坐标交回资料页',async()=>{
  let geocodeUrl,result,failure;
  const h=await host({navigator:{geolocation:{getCurrentPosition:success=>success({coords:{latitude:22.5431,longitude:114.0579}})}},fetch:async url=>{
    if(String(url).startsWith('https://api.bigdatacloud.net/')){geocodeUrl=String(url);return{ok:true,json:async()=>({countryName:'中国',principalSubdivision:'广东省',city:'深圳市',locality:'福田区'})};}
    return {ok:true,status:200,headers:[],json:async()=>({ok:true,data:{loggedIn:false}}),text:async()=>JSON.stringify({data:{course:[],advisor:[],course_by_pk:null,fz_invoke_action_flow:{result:{ok:true,data:{classes:[],items:[]}}}}})};
  }});
  await new Promise(resolve=>h.host.wx.chooseLocation({success:value=>{result=value;resolve();},fail:error=>{failure=error;resolve();}}));
  assert.equal(failure,undefined);assert.equal(result.name,'深圳市');assert.match(result.address,/广东省.*深圳市.*福田区/);assert.equal(result.latitude,22.5431);assert.match(geocodeUrl,/localityLanguage=zh/);
});
test('browser payment fails before creating orders and recorder clearly reports unsupported state',async()=>{
  const h=await host();await assert.rejects(h.host.requireModule('utils/payment').startConsultationPayment(),/网页支付尚未接入/);
  h.host.wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id=1'});await tick();h.host.current.startRecording();assert.match(h.document.getElementById('modal').textContent,/网页录音尚未开放/);
});
test('课程网页只把服务端签名交给微信桥，取消不等于支付成功',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let passed,out,failure;
  h.context.WeixinJSBridge={invoke:(method,args,callback)=>{passed={method,args};callback({err_msg:'get_brand_wcpay_request:cancel'});}};
  h.host.wx.requestPayment({appId:'wx6dafecca8d5fd24e',timeStamp:'1',nonceStr:'nonce',package:'prepay_id=wx1234567890123',signType:'MD5',paySign:'A'.repeat(32),success:r=>out=r,fail:r=>failure=r});
  assert.equal(passed.method,'getBrandWCPayRequest');assert.equal(out,undefined);assert.match(failure.errMsg,/cancel/);assert.equal(passed.args.paySign,'A'.repeat(32));
});
test('支付API携带同源会话，不把微信签名当成支付成功凭证',async()=>{
  const h=await host();let fetched;
  h.context.fetch=async(url,options)=>{fetched={url,options};return {status:200,headers:[],text:async()=>JSON.stringify({ok:true,data:{order:{status:'PENDING'}}})};};
  const response=await h.host.requireModule('utils/coursePayment').request('course-pay-status',{orderId:1});
  assert.equal(response.order.status,'PENDING');assert.equal(fetched.options.credentials,'same-origin');assert.equal(fetched.url,'/api/h5?action=course-pay-status');
});

test('课程详情分享生成图片二维码，不调用系统发送长链接',async()=>{
  let shared;const h=await host({navigator:{share:async()=>{assert.fail('不能发送裸链接');}}});
  h.host.requireModule('utils/referralPoster').poster=(_canvas,value)=>{shared=value;return 'data:image/png;base64,dGVzdA==';};
  h.host.wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id=7'});await tick();
  h.host.current.setData({classInfo:{id:'7',title:'奖励的误区',status:'PUBLISHED',canEnroll:true,coverUrl:'https://example.invalid/cover.jpg'}});await tick();
  assert.equal(h.document.querySelector('.course-footer .secondary'),null);
  h.host.current.setData({canInvite:true});await tick();
  h.document.querySelector('.course-footer .secondary').dispatchEvent(new h.Event('click',{bubbles:true}));await tick();
  assert.equal(shared.title,'奖励的误区');assert.match(shared.url,/#\/pages\/public-class-detail\/public-class-detail\?id=7$/);
  assert.equal(h.document.querySelector('#image-preview').open,true);assert.match(h.document.querySelector('#image-preview img').src,/^data:image\/png/);assert.ok(!h.document.querySelector('#image-preview').textContent.includes('http'));
});

test('代理分享使用自己的签名码，免费报名把收到的推荐码送到同源会话接口',async()=>{
  let shared,canInvite=true;
  const h=await host({location:{search:'?ref=incoming-other-agent'},navigator:{share:async value=>{shared=value}},fetch:async url=>({ok:true,status:200,headers:[],json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:true,user:{id:'18',name:'代理'}}:{canInvite,referralToken:canInvite?'own-signed-token':''}}),text:async()=>JSON.stringify({data:{fz_invoke_action_flow:{result:{ok:true,data:{classes:[]}}}}})})});
  h.host.requireModule('utils/referralPoster').poster=(_canvas,value)=>{shared=value;return 'data:image/png;base64,dGVzdA==';};
  h.host.wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id=7'});await tick();
  h.host.current.setData({classInfo:{id:'7',title:'公开课',canEnroll:true}});await tick();
  h.document.querySelector('.course-footer .secondary').dispatchEvent(new h.Event('click',{bubbles:true}));await tick();
  assert.equal(new URL(shared.url).searchParams.get('ref'),'own-signed-token');
  let request;h.context.fetch=async(url,options)=>{request={url,options};return{ok:true,status:200,headers:[],text:async()=>JSON.stringify({ok:true,data:{enrollment:{id:77}}})};};
  const enrollment=await h.host.requireModule('utils/consultationService').call('ENROLL',{classId:7,name:'报名人',phone:'13800000000',referrerId:999});
  assert.equal(enrollment.enrollment.id,77);assert.equal(request.url,'/api/h5?action=enroll');assert.equal(request.options.credentials,'same-origin');
  const input=JSON.parse(request.options.body);assert.equal(input.ref,'incoming-other-agent');assert.equal(input.referrerId,undefined);
});

test('推荐客户页实际显示推荐人、报名课程和到课状态，普通用户没有管理切换',async()=>{
  const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:18});
  h.host.wx.createCanvasContext=()=>({setFillStyle(){},fillRect(){},draw(_,cb){cb();}});
  h.host.wx.getReferralContext=async()=>({canInvite:true,isManager:false,shareUrl:'https://example.test/web/?ref=signed#/pages/plaza/plaza'});
  h.host.requireModule('utils/consultationService').call=async()=>({total:1,items:[{id:1,customerName:'家长甲',referrerName:'代理乙',enrollments:[{id:2,name:'报名人甲',courseTitle:'亲子课堂',status:'REGISTERED',attendanceStatus:'ATTENDED'}]}]});
  h.host.wx.navigateTo({url:'/pages/referrals/referrals'});await tick();await tick();
  const text=h.document.querySelector('#page').textContent;
  for(const value of ['家长甲','推荐人：代理乙','亲子课堂','已到课','报名人甲'])assert.ok(text.includes(value),value);
  assert.ok(!text.includes('全部推荐客户'));assert.equal(h.host.current.data.allowed,true);
  let copied;h.host.wx.setClipboardData=({data})=>{copied=data;};[...h.document.querySelectorAll('button')].find(b=>b.textContent==='复制邀请链接').dispatchEvent(new h.Event('click',{bubbles:true}));await tick();assert.equal(copied,'https://example.test/web/?ref=signed#/pages/plaza/plaza');
  const canvas=h.document.getElementById('referral-code');assert.ok(canvas);
  h.host.current.setData({loading:true});await tick();assert.equal(h.document.getElementById('referral-code'),canvas,'刷新名单不清空已绘制二维码');
});

test('文字聊天保留空状态和既有输入权限，移除倒计时与待开始',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();
  h.host.current.setData({hasAccess:false,serviceEnded:false,isManagerView:false,messages:[]});await tick();
  assert.equal(h.document.querySelectorAll('.chat-empty').length,1);
  assert.equal(h.document.querySelectorAll('.service-card').length,0);
  assert.equal(h.document.querySelectorAll('.chat-composer').length,0);
  assert.match(h.document.getElementById('page').textContent,/暂时还没有创建相应的聊天。/);
  assert.doesNotMatch(h.document.getElementById('page').textContent,/线下咨询|查看预约、记录与后续沟通|本服务为情感问答|不包含医疗诊断/);
  assert.equal(h.document.querySelectorAll('.offline-consultation-entry,.chat-empty-desc,.chat-empty-action,.disclaimer').length,0);
  h.host.current.setData({isManagerView:true,messages:[]});await tick();
  assert.equal(h.document.querySelectorAll('.chat-empty').length,1);
  assert.match(h.document.getElementById('page').textContent,/暂时还没有创建相应的聊天。/);
  h.host.current.setData({hasAccess:true,remainingText:'59:59',messages:[{id:'demo',role:'assistant',content:'已创建聊天'}]});await tick();
  assert.equal(h.document.querySelectorAll('.chat-empty').length,0);
  assert.equal(h.document.querySelectorAll('.service-card').length,0);
  assert.doesNotMatch(h.document.getElementById('page').textContent,/59:59|待开始|剩余/);
  assert.equal(h.document.querySelectorAll('.chat-composer').length,1);
});

test('H5 修改昵称保留稳定登录用户名，并展示保存后的昵称',async()=>{
  const h=await host();
  const username='wxh5_'+'a'.repeat(36);
  let account={id:101,username,wechat_nickname:'旧昵称',account_profile_id:7,account_profile:{id:7,user_name:'旧昵称'}};
  h.context.fetch=async(url,options)=>{
    const {query,variables}=JSON.parse(options.body);
    let data;
    if(query.includes('query GetAccountProfile')) data={account_by_pk:account};
    else if(query.includes('mutation UpdateAccountProfile')) {
      account.account_profile={id:7,...variables.data};
      data={update_account_profile_by_pk:account.account_profile};
    } else {
      assert.match(query,/mutation SaveAccountProfile/);
      assert.equal(variables.data.username,username);
      account={...account,...variables.data};
      data={update_account_by_pk:account};
    }
    return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data})};
  };
  const user=await h.host.requireModule('utils/zion').saveAccountProfile({accountId:'101',userName:'新昵称'});
  assert.equal(account.username,username);
  assert.equal(account.account_profile.user_name,'新昵称');
  assert.equal(user.username,'新昵称');
  assert.equal(user.nickName,'新昵称');
});

test('服务管理中管理人员可修改备注并提交档案，其他资料不出现编辑框',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id=31'});await tick();
 h.host.current.setData({loading:false,error:'',archiveOnly:true,appointment:{status:'孩子档案',child_info:{name:'合成孩子'},provider:{display_name:'负责老师'},concerns:'不应重复展示的摘要',staff_note:'不应展示的录入说明'},canEditArchive:true,editingArchive:false,childForm:{name:'合成孩子',age:11,remarks:'原备注'},childSections:require('../../utils/childArchive').formSections({name:'合成孩子',age:11,remarks:'原备注'}),answeredChildSections:require('../../utils/childArchive').answeredSections({name:'合成孩子',age:11,remarks:'原备注'}),feedbacks:[],record:null,canReply:true,archiveOpen:true});await tick();
 const page=h.document.getElementById('page');assert.doesNotMatch(page.textContent,/咨询时间|预约安排|不应重复展示的摘要|不应展示的录入说明|还没有沟通记录|保存备注/);assert.match(page.textContent,/合成孩子的孩子档案|修改档案/);assert.doesNotMatch(page.textContent,/提交档案/);
 h.host.current.editArchive();await tick();assert.match(page.textContent,/提交档案|取消修改/);assert.doesNotMatch(page.textContent,/保存备注/);assert.ok(page.querySelector('textarea[data-key="remarks"]'));assert.equal(page.querySelector('input[data-key="name"]'),null);
 h.host.current.setData({canEditArchive:false,editingArchive:false});await tick();assert.doesNotMatch(page.textContent,/修改档案|提交档案/);
 h.host.current.setData({archiveOnly:false});await tick();assert.match(page.textContent,/预约安排|不应重复展示的摘要/);
});

test('客户页按首次咨询档案与购买状态显示5次咨询购买或预约入口，不再提供免费自助申请',async()=>{
  const offer={id:90,title:'5次咨询',price:3999,sessions:5,unitPrice:1000},states=[
    [{offer,eligible:false,package:null,defaults:null},['由代理为你预约第1次'],['购买5次咨询','预约下一次咨询']],
    [{offer,eligible:true,package:null,defaults:{name:'家长甲',phone:'13800000000'}},['后续5次咨询','单次咨询 ￥1000，5次咨询 ￥3999','购买5次咨询'],['预约下一次咨询','再购买']],
    [{offer,eligible:true,package:{id:91,total:5,used:1,remaining:4,hasPending:false},defaults:{name:'家长甲',phone:'13800000000'}},['剩余 4 次','已预约 1 / 5 次','预约下一次咨询','再购买5次咨询','单次咨询 ￥1000 · 5次咨询 ￥3999'],['后续5次咨询']],
    [{offer,eligible:true,package:{id:91,total:5,used:2,remaining:3,hasPending:true},defaults:{}},['已有待确认的预约','再购买5次咨询'],['预约下一次咨询']]];
  for(const [pkg,shown,hidden] of states){
    const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:18});
    const calls=[];h.host.requireModule('utils/consultationService').call=async(op,p)=>{calls.push([op,p]);return op==='GET_PACKAGE'?pkg:op==='MY_OVERVIEW'?{eligible:true,enrollments:[],appointments:[]}:op==='CREATE_APPOINTMENT'?{id:77}:{};};
    h.host.wx.navigateTo({url:'/pages/customer/customer'});await tick();await tick();
    const text=h.document.querySelector('#page').textContent;
    for(const value of shown)assert.ok(text.includes(value),value);
    for(const value of hidden)assert.ok(!text.includes(value),value);
    assert.ok(!text.includes('申请线下咨询'));
    if(pkg.package&&!pkg.package.hasPending){
      const page=h.host.current;page.apply();assert.equal(page.data.showForm,true);assert.equal(page.data.form.name,'家长甲');
      for(const [key,value] of [['date','2099-01-02'],['time','14:30'],['concerns','继续沟通']])page.input({currentTarget:{dataset:{key}},detail:{value}});
      page.submit();await tick();
      assert.equal(JSON.stringify(calls.find(c=>c[0]==='CREATE_APPOINTMENT')[1]),JSON.stringify({name:'家长甲',phone:'13800000000',concerns:'继续沟通',requestedTime:'2099-01-02T14:30:00+08:00'}));
    }
  }
});

test('已绑定的独立档案双方从方案详情继续反馈并发送，未绑定时隐藏反馈',async()=>{
 for(const isStaff of [false,true]){
  const h=await host({chatEntryVisible:false});h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:isStaff?101:201});
  const calls=[],messages=[{id:10,content:'老师主动询问近况',senderRole:'teacher',isMine:isStaff,createdAt:'2026-10-09T10:00:00Z'}];
  h.host.requireModule('utils/consultationService').call=async(op,p)=>{
   calls.push([op,p]);if(op==='GET_APPOINTMENT')return {appointment:{id:31,status:'孩子档案',child_info:{name:'合成学生'},provider:{display_name:'负责老师'}},canTalk:true,isStaff,canReply:isStaff,feedbacks:[],summaryJobs:[],dialogueUnread:isStaff?0:1,dialogueReadMark:9};
   if(op==='GET_CONSULTATION_DIALOGUE')return {messages,nextCursor:null};
   if(op==='SEND_CONSULTATION_MESSAGE')return {message:{id:11,content:p.content,senderRole:isStaff?'teacher':'customer',isMine:true,createdAt:'2026-10-09T10:01:00Z'}};
   return {};
  };
  h.host.wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id=31'});await tick();
  const page=h.document.querySelector('#page');assert.match(page.textContent,/方案反馈/);assert.doesNotMatch(page.textContent,/本次咨询已完成/);
  // Plan feedback is the first card and opens on arrival; new messages from the other side are tagged.
  assert.ok(page.querySelector('.dialogue-card').compareDocumentPosition(page.querySelector('.archive-card'))&4);await tick();assert.match(page.textContent,/老师主动询问近况/);assert.equal(page.querySelectorAll('.new-tag').length,isStaff?0:1);assert.equal(page.querySelector('.unread-badge'),null);
  [...page.querySelectorAll('button')].find(b=>b.textContent==='收起').dispatchEvent(new h.Event('click'));await tick();
  const open=[...page.querySelectorAll('button')].find(b=>b.textContent===(isStaff?'回复与沟通':'继续反馈'));assert.ok(open);open.dispatchEvent(new h.Event('click'));await tick();assert.match(page.textContent,/老师主动询问近况/);
  const input=page.querySelector('.dialogue-input');assert.ok(input);input.value=isStaff?'老师可以直接发消息':'学生可以直接发消息';input.dispatchEvent(new h.Event('input'));await tick();
  [...page.querySelectorAll('button')].find(b=>b.textContent==='发送消息').dispatchEvent(new h.Event('click'));await tick();
  assert.ok(calls.some(([op])=>op==='SEND_CONSULTATION_MESSAGE'));assert.match(page.textContent,isStaff?/老师可以直接发消息/:/学生可以直接发消息/);assert.equal(h.host.current.route,'pages/consultation-detail/consultation-detail');assert.equal(page.querySelectorAll('.dialogue-message').length,2);
  h.host.current.setData({canTalk:false,appointment:{status:'CONFIRMED',child_info:{name:'合成学生'},provider:{display_name:'负责老师'}}});await tick();assert.equal(page.querySelector('.dialogue-card'),null);
 }
});

test('独立孩子档案通过现有我的方案进入并在原详情反馈，不添加聊天入口',async()=>{
 const h=await host({chatEntryVisible:false});h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:201,nickName:'合成客户'});
 const archive={id:31,status:'孩子档案',customer_id:201,provider_id:1,child_info:{name:'合成孩子',remarks:'老师给出的方案内容'},provider:{display_name:'负责老师'}};
 h.host.requireModule('utils/consultationService').call=async op=>{
  if(op==='GET_QUESTIONNAIRE')return {enrollment:null};
  if(op==='MY_OVERVIEW')return {appointments:[archive],enrollments:[]};
  if(op==='GET_APPOINTMENT')return {appointment:archive,canTalk:true,isStaff:false,feedbacks:[],summaryJobs:[]};
  return {};
 };
 h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
 let page=h.document.querySelector('#page');const plan=[...page.querySelectorAll('.settings-row')].find(row=>row.textContent.includes('我的方案'));assert.ok(plan);plan.dispatchEvent(new h.Event('click'));await tick();
 assert.equal(h.host.current.route,'pages/customer/customer');page=h.document.querySelector('#page');assert.match(page.textContent,/我的方案/);assert.doesNotMatch(page.textContent,/购买|预约下一次咨询|我的公开课报名|客户中心/);assert.match(page.textContent,/合成孩子/);assert.match(page.textContent,/查看方案与继续反馈/);
 const card=[...page.querySelectorAll('.card')].find(row=>row.textContent.includes('合成孩子'));card.dispatchEvent(new h.Event('click'));await tick();assert.equal(h.host.current.route,'pages/consultation-detail/consultation-detail');
 page=h.document.querySelector('#page');assert.doesNotMatch(page.textContent,/老师给出的方案内容/);page.querySelector('.archive-toggle').dispatchEvent(new h.Event('click'));await tick();assert.match(page.textContent,/老师给出的方案内容/);assert.match(page.textContent,/方案反馈/);assert.match(page.textContent,/发送消息/);assert.doesNotMatch(page.textContent,/本次咨询已完成/);
});

 test('普通用户返回我的页不查询推荐或签到，也不显示聊天页签',async()=>{
  const requests=[];
  const h=await host({fetch:async(url,options={})=>{
   if(String(url).includes('action=graphql')){const input=JSON.parse(options.body);requests.push(input);return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data:{service_provider:[],account_by_pk:{id:201,wechat_nickname:'合成客户'}}})};}
   return {ok:true,status:200,json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:true,user:{id:201,name:'合成客户'}}:{canInvite:false}})};
  }});
  for(let i=0;i<3;i++){
   h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
   const text=h.document.querySelector('#page').textContent;
   assert.match(text,/报名公开课/);assert.match(text,/我的方案/);
   assert.doesNotMatch(text,/进入客户端|简易方案梳理|推荐客户|扫码进场|工作台|累计消费/);
   assert.equal(h.document.querySelector('[data-route="pages/chat/chat"]'),null);
   h.host.current.onShow();await tick();
  }
  // 我的页只在onShow校验身份；另有启动和每次切换页签时的聊天入口校验各一次。
  assert.equal(requests.filter(r=>r.query.includes('GetServiceProviderByAccount')).length,10,'只在onShow校验身份，onLoad不重复请求');
  assert.equal(requests.filter(r=>r.variables?.args).length,0,'普通用户不请求推荐、签到、会话或方案入口权限');
 });

 test('不同后台身份登录后的入口严格隔离，包括旧user_type不一致的账号',async()=>{
  const records=process.env.PROFILE_IDENTITY_FIXTURES ? JSON.parse(fs.readFileSync(process.env.PROFILE_IDENTITY_FIXTURES,'utf8')) : [
   {id:'201',identity:'USER',user_type:'manager',service_provider:null},
   {id:'202',identity:'USER',user_type:'agent',service_provider:{id:17,account_id:'202',service_kind:'AGENT',service_status:'INACTIVE',can_reply:false,can_accept_order:false}},
   {id:'203',identity:'AGENT',service_provider:{id:18,account_id:'203',service_kind:'AGENT',service_status:'ACTIVE',can_reply:false,can_accept_order:false}},
   {id:'204',identity:'MANAGER',service_provider:{id:19,account_id:'204',service_kind:'STAFF',service_status:'ACTIVE',can_reply:true,can_accept_order:true}}
  ];
  for(const record of records){
   const requests=[],provider=record.service_provider;
   const h=await host({fetch:async(url,options={})=>{
    if(String(url).includes('action=graphql')){
     const input=JSON.parse(options.body);requests.push(input);const result={allowed:record.identity==='MANAGER',appointments:[],enrollments:[],enrollment:null};
     return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data:{service_provider:provider?[provider]:[],account_by_pk:{id:record.id,wechat_nickname:'账号'},consultation_session:[],consultation_order:[],account:[],fz_invoke_action_flow:{result:{ok:true,data:result}}}})};
    }
    return {ok:true,status:200,json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:true,user:{id:record.id,name:'账号',role:record.user_type}}:{canInvite:record.identity!=='USER'}})};
   }});
   h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
   const text=h.document.querySelector('#page').textContent;
   assert.match(text,/报名公开课/);assert.match(text,/我的方案/);assert.doesNotMatch(text,/进入客户端|累计消费/);
   if(record.identity==='USER'){
    assert.doesNotMatch(text,/简易方案梳理|推荐客户|扫码进场|工作台/,'普通账号'+record.id);
    assert.equal(h.host.current.data.canInvite,false);assert.equal(h.host.current.data.isServiceProvider,false);
    assert.equal(requests.filter(r=>r.variables?.args).length,0);
    assert.equal(h.document.querySelector('[data-route="pages/chat/chat"]'),null);
   }else {
    assert.match(text,/简易方案梳理/);assert.match(text,/推荐客户/);
    assert.equal(!!h.document.querySelector('[data-route="pages/chat/chat"]'),record.identity==='MANAGER','聊天入口只对管理人员开放'+record.id);
    assert.equal(h.host.current.data.isServiceProvider,record.identity==='MANAGER');
    if(record.identity==='AGENT')assert.doesNotMatch(text,/扫码进场|工作台/);
   }
  }
 });

 test('同一浏览器管理退出或被降为用户后清除特权入口和聊天页签',async()=>{
  for(const mode of ['logout','revoke']){
   let manager=true;
   const provider={id:14,account_id:19,service_kind:'STAFF',service_status:'ACTIVE',can_reply:true,can_accept_order:true};
   const h=await host({fetch:async(url,options={})=>{
    if(String(url).includes('action=graphql'))return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data:{service_provider:manager?[provider]:[],account_by_pk:{id:19,wechat_nickname:'账号'},consultation_session:[],consultation_order:[],account:[],fz_invoke_action_flow:{result:{ok:true,data:{allowed:manager}}}}})};
    return {ok:true,status:200,json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:true,user:{id:19,name:'账号'}}:{canInvite:manager}})};
   }});
   h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
   assert.equal(h.document.querySelector('[data-route="pages/chat/chat"]').hidden,false);
   manager=false;
   if(mode==='logout')await h.host.current.logout();else await h.host.current.loadManagerAccess(h.host.current.data.userInfo);
   await tick();
   assert.doesNotMatch(h.document.querySelector('#page').textContent,/简易方案梳理|推荐客户|扫码进场|进入工作台/,mode);
   h.host.wx.switchTab({url:'/pages/index/index'});await tick();
   assert.equal(h.document.querySelector('[data-route="pages/chat/chat"]'),null,mode);
  }
 });

test('推荐客户显示预备学员，只有后台核实资格的客户能代约，提交后仍等待老师确认',async()=>{
 const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:18});
 h.host.wx.createCanvasContext=()=>({setFillStyle(){},fillRect(){},draw(_,cb){cb();}});
 h.host.wx.getReferralContext=async()=>({canInvite:true,isManager:false,shareUrl:''});
 const calls=[];h.host.requireModule('utils/consultationService').call=async(op,p)=>{
  calls.push({op,p});
  if(op==='REFERRAL_CLIENTS')return {total:2,items:[{id:51,customerName:'核实家长',referrerName:'顾欣',enrollments:[{id:21,name:'核实家长',courseTitle:'公开课',status:'REGISTERED',attendanceStatus:'ATTENDED',canBookConsultation:true}]},{id:52,customerName:'待核实家长',referrerName:'顾欣',enrollments:[{id:22,courseTitle:'公开课',status:'REGISTERED',attendanceStatus:'ATTENDED',canBookConsultation:false}]}]};
  if(op==='GET_AGENT_APPOINTMENT')return {name:'核实家长',phone:'13800000000',appointment:null};
  if(op==='CREATE_AGENT_APPOINTMENT')return {id:91,appointment:{id:91,contact_name:p.name,requested_time:p.requestedTime,status:'PENDING'}};
  throw new Error(op);
 };
 h.host.wx.navigateTo({url:'/pages/referrals/referrals'});await tick();await tick();
 assert.ok(h.document.querySelector('#page').textContent.includes('预备学员'));
 const buttons=[...h.document.querySelectorAll('button')].filter(b=>b.textContent.includes('代约咨询 / 查看预约'));assert.equal(buttons.length,1);
 assert.ok(h.document.querySelector('#page').textContent.includes('尚未核实参加公开课，暂不能预约咨询'));
 buttons[0].dispatchEvent(new h.Event('click',{bubbles:true}));await tick();
 assert.equal(calls.at(-1).op,'GET_AGENT_APPOINTMENT');assert.equal(String(calls.at(-1).p.enrollmentId),'21');
 h.host.current.setData({bookingForm:{name:'核实家长',phone:'13800000000',date:'2099-01-01',time:'14:00',concerns:'亲子沟通'}});await tick();
 [...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('提交咨询预约')).dispatchEvent(new h.Event('click',{bubbles:true}));await tick();
 assert.equal(calls.at(-1).op,'CREATE_AGENT_APPOINTMENT');assert.equal(String(calls.at(-1).p.referralId),'51');assert.equal(calls.at(-1).p.requestedTime,'2099-01-01T14:00:00+08:00');
 assert.equal(h.host.current.data.booking.appointment.status,'PENDING');assert.ok(h.document.querySelector('#page').textContent.includes('等待负责人老师确认时间'));assert.ok(!h.document.querySelector('#page').textContent.includes('确认时间：'));
});
 test('没有管理或服务开通权限的普通用户仍可进入聊天并查看既有消息',async()=>{
  const h=await host();
  h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:'201',nickName:'普通用户'});
  const zion=h.host.requireModule('utils/zion');
  zion.getServiceProviderByAccount=async()=>null;
  zion.ensureCustomerBoundSession=async()=>null;
  assert.equal(h.document.querySelector('[data-route="pages/chat/chat"]'),null,'普通用户暂不显示聊天页签');
  h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();
  assert.equal(h.host.current.route,'pages/chat/chat');
  assert.equal(h.host.current.data.canOpenSessionDrawer,false);
  h.host.current.setData({hasAccess:false,canRenew:false,serviceEnded:true,messages:[{id:'existing',role:'assistant',content:'既有聊天记录仍可查看'}]});await tick();
  assert.match(h.document.querySelector('#page').textContent,/既有聊天记录仍可查看/);
  assert.equal(h.document.querySelector('.chat-composer'),null,'未开通服务不授予发送权限');
  assert.equal(h.document.querySelector('.session-drawer-root'),null,'普通用户没有管理会话面板权限');
  assert.equal(h.document.querySelector('.renew-action'),null);
 });

 test('多档案家长可展开孩子列表，等级与危险因素可读，普通家长不显示审核按钮',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();
  const active={id:31,childName:'小知',parentName:'家长甲',pending:1,latest:'每天执行情况',metadata:{level:'A',danger:'合成风险'}};
  h.host.current.setData({serviceMode:true,serviceLoading:false,serviceActive:active,serviceAllCases:[active,{id:32,childName:'另一孩子'}],serviceCases:[active],serviceDetail:{owner:true,staff:false,appointment:{contact_name:'家长甲',provider:{display_name:'老师'}}},serviceFeedback:[{id:1,content:'每天执行情况',reply:{id:2,stage:'DIRECTOR',stageText:'总监复核'},timeText:'今天'}],serviceMeta:active.metadata});await tick();
  h.document.querySelector('.service-profile').click();await tick();
  assert.ok(h.document.querySelector('.service-drawer'));assert.match(h.document.querySelector('.service-drawer').textContent,/孩子档案|小知|家长甲|合成风险/);
  assert.equal(h.document.querySelector('.review-actions'),null);assert.equal(h.document.querySelector('.service-permission-entry'),null);
  assert.doesNotMatch(h.document.querySelector('#page').textContent,/待开始|剩余/);
 });
test('家长课程页：未开通或已到期时不能播放且不显示期限，开通后可播放；管理端可进入授权页',async()=>{
 const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:'201'});
 const course={id:'14',title:'什么是沟通',description:'',chapters:[{id:'22',title:'什么是沟通',duration:'',sortOrder:1,hasVideo:false,videoUrl:''}]};
 h.host.requireModule('utils/zion').getCourse=async()=>({course:structuredClone(course)});
 let access={canWatch:false,reason:'ENDED',lessons:[{id:'22',hasVideo:true,videoUrl:''}]};const calls=[];
 h.host.requireModule('utils/consultationService').call=async(op,p)=>{calls.push({op,p});return structuredClone(access);};
 h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=14'});await tick();await tick();
 assert.equal(calls[0].op,'COURSE_VIEW_ACCESS');assert.equal(calls[0].p.courseId,'14');
 const page=()=>h.document.querySelector('#page').textContent;
 assert.match(page(),/待开通/);assert.doesNotMatch(page(),/到期|剩余|小时/);
 h.host.current.openChapter({currentTarget:{dataset:{index:0}}});await tick();
 assert.equal(h.document.querySelector('#modal').open,true);assert.match(h.document.querySelector('#modal').textContent,/本课程观看权限已结束，请联系老师/);
 assert.equal(h.host.current.data.showVideoPlayer,false);h.document.querySelector('#modal').close();
 access={canWatch:true,reason:'',lessons:[{id:'22',hasVideo:true,videoUrl:'https://cdn.test/comm.mp4'}]};
 await h.host.current.fetchCourse('14');await tick();
 assert.match(page(),/可播放/);
 h.host.current.videoContext={play(){},pause(){},stop(){}};// linkedom has no media playback
 h.host.current.openChapter({currentTarget:{dataset:{index:0}}});await tick();
 assert.equal(h.host.current.data.playingVideoUrl,'https://cdn.test/comm.mp4');
 h.host.requireModule('utils/consultationService').call=async op=>op==='COURSE_VIEW_ADMIN'?{courses:[{id:'14',title:'什么是沟通',enabled:true,hasVideo:false}],grants:[{id:1,courseId:'14',courseTitle:'什么是沟通',viewerName:'家长甲',grantedByName:'刘老师',durationHours:48,grantedAt:'2026-10-10T10:00:00Z',expiresAt:'2026-10-12T10:00:00Z',status:'ACTIVE'}],nextCursor:null}:{};
 h.host.wx.navigateTo({url:'/pages/course-access/course-access'});await tick();await tick();
 assert.match(page(),/课程观看授权/);assert.match(page(),/家长甲/);assert.match(page(),/《什么是沟通》/);assert.match(page(),/观看中/);assert.match(page(),/2 天/);assert.match(page(),/提前收回/);
 assert.deepEqual(h.errors,[]);
});

test('工作台与我的页面在进入前显示方案反馈新消息数',async()=>{
 const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:101});
 h.host.requireModule('utils/consultationService').call=async op=>op==='STAFF_OVERVIEW'?{canAccept:true,canReply:true,classes:[],enrollments:[],appointments:[{id:31,status:'孩子档案',contact_name:'家长甲',child_info:{name:'合成孩子'},dialogue_unread:2},{id:32,status:'孩子档案',contact_name:'家长乙',child_info:{name:'另一孩子'},dialogue_unread:0}]}:op==='DIALOGUE_UNREAD_TOTAL'?{staff:3,customer:0}:{};
 h.host.wx.navigateTo({url:'/pages/service-workbench/service-workbench'});await tick();await tick();
 const page=h.document.querySelector('#page'),badges=[...page.querySelectorAll('.unread-badge')].map(b=>b.textContent);
 assert.deepEqual(badges,['3条新消息','2条新消息']);
});

test('服务反馈空状态不显示无法输入的回复框，方案入口与只读权限提示清楚',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();const p=h.host.current;
 p.setData({serviceMode:true,serviceActive:{id:31,childName:'合成孩子'},serviceDetail:{staff:true,canDraft:true,appointment:{}},serviceFeedback:[],serviceLoading:false});await tick();
 assert.equal(h.document.querySelector('.service-composer textarea'),null);
 assert.equal(h.document.querySelector('.service-review-settings'),null);
 assert.match(h.document.querySelector('.service-composer').textContent,/等待家长提交反馈/);
 h.document.querySelector('.service-empty-action').click();await tick();assert.equal(p.data.serviceTab,'plan');
 p.setData({serviceTab:'feedback',serviceDetail:{staff:true,canDraft:false,appointment:{}},serviceFeedback:[{id:17,content:'合成反馈'}]});await tick();
 assert.equal(h.document.querySelector('.service-reply-button'),null);assert.equal(h.document.querySelector('.service-composer textarea'),null);
 assert.match(h.document.querySelector('.service-composer').textContent,/仅可查看和审核/);assert.deepEqual(h.errors,[]);
});

test('选择反馈后回复框可输入，保存携带反馈ID；审核设置独立展开且家长仍可发送',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();const p=h.host.current,calls=[];
 p.serviceSelectedId=31;p.refreshServiceCase=async()=>{};p.serviceAction=async(op,payload)=>{calls.push({op,payload});return {item:{id:52,revision:1}};};
 p.setData({serviceMode:true,serviceActive:{id:31,childName:'合成孩子'},serviceDetail:{staff:true,canDraft:true,appointment:{}},serviceCanManage:true,serviceFeedback:[{id:17,content:'合成反馈'}],serviceLoading:false});await tick();
 h.document.querySelector('.service-reply-button').click();await tick();let input=h.document.querySelector('.service-composer textarea');assert.equal(input.disabled,false);
 input.value='合成回复';input.dispatchEvent(new h.Event('input'));await tick();h.document.querySelector('.service-composer .service-primary').click();await tick();
 assert.equal(calls[0].op,'SAVE_SERVICE_DRAFT');assert.equal(calls[0].payload.feedbackId,17);assert.equal(calls[0].payload.content,'合成回复');
 assert.equal(h.document.querySelector('.service-review-settings textarea'),null);h.document.querySelector('.service-settings-toggle').click();await tick();assert.ok(h.document.querySelector('.service-release input'));
 p.switchServiceTab({currentTarget:{dataset:{tab:'plan'}}});assert.equal(p.data.serviceReviewSettingsOpen,false);
 p.setData({serviceTab:'feedback',serviceDetail:{owner:true,staff:false,canDraft:false,appointment:{}},serviceInput:'',serviceFeedback:[]});await tick();
 input=h.document.querySelector('.service-composer textarea');assert.equal(input.disabled,false);input.value='家长执行反馈';input.dispatchEvent(new h.Event('input'));await tick();h.document.querySelector('.service-composer .service-primary').click();await tick();
 assert.equal(calls[1].op,'SEND_SERVICE_FEEDBACK');assert.equal(calls[1].payload.content,'家长执行反馈');assert.equal(p.data.serviceInput,'');assert.deepEqual(h.errors,[]);
});

test('所有家长共用反馈模板：无审核与历史入口，单档案头像静态，档案页保留发送',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();const p=h.host.current;
 for(const parentId of ['1000000000000039','1000000000000060','1000000000000080']){
  p.setData({serviceMode:true,serviceStaff:false,serviceRoleLabel:'家长',serviceAllCases:[{id:31}],serviceActive:{id:31,childName:'本人孩子'},serviceDetail:{owner:true,staff:false,canDraft:false,appointment:{customer_id:parentId}},serviceLoading:false,serviceFeedback:[],serviceMessages:[],serviceTab:'feedback'});await tick();
  assert.equal(h.document.querySelector('[data-tab="plan"]'),null);assert.equal(h.document.querySelector('.service-nav-history'),null);assert.equal(h.document.querySelector('button.service-profile'),null);assert.ok(h.document.querySelector('.service-profile-static'));
  assert.equal(h.document.querySelector('.service-composer textarea').disabled,false);assert.match(h.document.querySelector('.service-composer .service-primary').textContent,/发送反馈/);
  h.document.querySelector('.service-case-strip button').click();await tick();assert.equal(p.data.serviceTab,'archive');assert.ok(h.document.querySelector('.service-composer textarea'));
 }
 p.setData({serviceTab:'feedback',serviceAllCases:[{id:31},{id:32}],serviceMessages:[{id:'feedback-17',content:'家长反馈',timeText:'今天'},{id:'reply-52',content:'老师公开回复',timeText:'今天',isReply:true}]});await tick();assert.ok(h.document.querySelector('button.service-profile'));
 assert.doesNotMatch(h.document.querySelector('.service-chat-content').textContent,/监护专员整理|总监复核|总管终审/);assert.match(h.document.querySelector('.teacher-message').textContent,/老师公开回复/);assert.deepEqual(h.errors,[]);
});

test('课程标题右侧只有转发按钮，弹出本课程封面卡片，不复制或发送裸链接',async()=>{
 const copied=[],shared=[];
 const row={id:'15',title:'沉迷手机',subtitle:'孩子系列课程',description:'## 课程介绍\n理解孩子使用手机的原因',enabled:true,cover_image:{url:'https://example.invalid/phone.jpg'},course_lesson:[{id:'25',title:'沉迷手机'}]};
 const fetch=async(url,options)=>{
  const input=options?.body?JSON.parse(options.body):{};
  const data=String(url).includes('action=session')?{ok:true,data:{loggedIn:false}}:input.query?.includes('query GetCourse')?{data:{course_by_pk:row}}:{data:{fz_invoke_action_flow:{result:{ok:true,data:{canWatch:false,isPublic:false,reason:'LOGIN',lessons:[{id:'25',hasVideo:true,videoUrl:''}]}}}}};
  return {ok:true,status:200,headers:[],json:async()=>data,text:async()=>JSON.stringify(data)};
 };
 const h=await host({location:{search:'?course=15'},fetch,navigator:{clipboard:{writeText:async text=>copied.push(text)},share:async value=>shared.push(value)}});await tick();
 assert.equal(h.host.current.route,'pages/course-detail/course-detail');
 assert.match(h.document.getElementById('page').textContent,/理解孩子使用手机的原因|视频需开通观看权限/);
 assert.equal(h.document.querySelector('.hero-cover').getAttribute('src'),row.cover_image.url);
 assert.equal(h.document.querySelector('#page video'),null);
 const forward=h.document.querySelector('.course-title-row .course-forward');assert.ok(forward);
 assert.equal(h.document.querySelectorAll('.course-share-primary,.course-share-secondary,.course-share-panel').length,0);
 forward.dispatchEvent(new h.Event('click'));await tick();
 assert.equal(h.host.current.data.showSharePanel,true);
 assert.equal(h.document.querySelector('.forward-card-title').textContent,row.title);
 assert.equal(h.document.querySelector('.forward-card-cover').getAttribute('src'),row.cover_image.url);
 assert.equal(h.document.querySelectorAll('.forward-submit').length,1);
 assert.deepEqual(copied,[]);assert.deepEqual(shared,[]);
 assert.match(h.document.querySelector('.forward-sheet-hint').textContent,/微信内打开/);
 h.document.querySelector('.forward-close').dispatchEvent(new h.Event('click'));await tick();
 assert.equal(h.host.current.data.showSharePanel,false);
 assert.deepEqual(h.errors,[]);
});

test('微信课程卡片配置带课程封面，不继承其他代理的报名参数',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=8'});await tick();
 h.host.current.setData({loading:false,error:'',course:{id:'8',title:'倾诉的陷阱',subtitle:'孩子系列课程',enabled:true,coverUrl:'https://cdn.test/talk.jpg',chapters:[]}});await tick();
 h.context.navigator.userAgent='MicroMessenger';let ready,card,timeline;
 h.context.wx={config:()=>ready(),ready:fn=>{ready=fn},error(){},updateAppMessageShareData:value=>{card=value;value.success?.()},updateTimelineShareData:value=>{timeline=value}};
 h.context.fetch=async()=>({ok:true,json:async()=>({ok:true,data:{appId:'test',timestamp:1,nonceStr:'x',signature:'x'}})});
 await h.host.wx.prepareCourseShare(h.host.current);
 assert.equal(card.title,'倾诉的陷阱');assert.equal(card.imgUrl,'https://cdn.test/talk.jpg');
 assert.equal(card.link,'http://localhost/web/?course=8#/pages/course-detail/course-detail?id=8');
 assert.equal(timeline.link,card.link);assert.equal(timeline.imgUrl,card.imgUrl);
});


test('微信明确拒绝封面卡片配置时不误报准备成功，不降级复制裸链接',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=8'});await tick();
 h.host.current.setData({loading:false,error:'',course:{id:'8',title:'倾诉的陷阱',enabled:true,coverUrl:'https://cdn.test/talk.jpg',chapters:[]}});await tick();
 h.context.navigator.userAgent='MicroMessenger';let ready;
 h.context.wx={config:()=>ready(),ready:fn=>{ready=fn},error(){},updateAppMessageShareData:value=>value.fail({errMsg:'permission denied'})};
 h.context.fetch=async()=>({ok:true,json:async()=>({ok:true,data:{appId:'test',timestamp:1,nonceStr:'x',signature:'x'}})});
 assert.equal(await h.host.wx.prepareCourseShare(h.host.current),false);
 h.host.current.openSharePanel();await tick();
 assert.match(h.document.querySelector('.forward-sheet-hint').textContent,/课程链接.*微信菜单/);
 assert.equal(h.document.querySelectorAll('.forward-submit').length,1);
 assert.match(h.document.querySelector('.forward-share-error').textContent,/permission denied/);
 h.document.querySelector('.forward-submit').click();await tick();
 assert.equal(h.host.current.data.showShareGuide,true);
 assert.doesNotMatch(h.document.querySelector('.wechat-guide-note').textContent,/将发送.*封面/);
 assert.equal(h.document.querySelector('#modal').open,undefined);
});


test('网页立即转发显示微信菜单引导，面板不常驻菜单长提示，卡片仍采用课程封面',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=15'});await tick();
 h.host.current.setData({loading:false,error:'',course:{id:'15',title:'沉迷手机',enabled:true,coverUrl:'https://cdn.test/phone.jpg',chapters:[]}});await tick();
 h.context.navigator.userAgent='MicroMessenger';let ready,card;
 h.context.wx={config:()=>ready(),ready:fn=>{ready=fn},error(){},updateAppMessageShareData:value=>{card=value;value.success()},updateTimelineShareData(){}};
 h.context.fetch=async()=>({ok:true,json:async()=>({ok:true,data:{appId:'test',timestamp:1,nonceStr:'x',signature:'x'}})});
 h.document.querySelector('.course-forward').click();await tick();
 assert.equal(h.host.current.data.showShareGuide,false);
 assert.equal(h.document.querySelector('.forward-sheet-hint').textContent,'课程封面链接卡片已准备好');
 assert.equal(h.document.querySelectorAll('.forward-submit').length,1);
 h.document.querySelector('.forward-submit').click();await tick();
 assert.equal(h.host.current.data.showShareGuide,true);
 assert.match(h.document.querySelector('.wechat-forward-guide').textContent,/发送给朋友/);
 assert.equal(card.imgUrl,'https://cdn.test/phone.jpg');
 h.document.querySelector('.wechat-forward-guide').click();await tick();
 assert.equal(h.host.current.data.showShareGuide,false);assert.equal(h.host.current.data.showSharePanel,true);
});


test('iPhone保留进入文档时的签名地址，安卓使用当前课程地址，换课后重新配置',async()=>{
 for(const agent of ['MicroMessenger iPhone','MicroMessenger Android']){
  const h=await host();h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=15'});await tick();
  h.host.current.setData({loading:false,error:'',course:{id:'15',title:'沉迷手机',enabled:true,coverUrl:'https://cdn.test/phone.jpg',chapters:[]}});await tick();
  h.context.navigator.userAgent=agent;let ready;const signatures=[],cards=[];
  h.context.wx={config:()=>ready(),ready:fn=>{ready=fn},error(){},updateAppMessageShareData:value=>{cards.push(value);value.success()},updateTimelineShareData(){}};
  h.context.fetch=async url=>{signatures.push(new URL(String(url),'http://localhost').searchParams.get('url'));return {ok:true,json:async()=>({ok:true,data:{appId:'test',timestamp:1,nonceStr:'x',signature:'x'}})}};
  await h.host.wx.prepareCourseShare(h.host.current);
  assert.equal(signatures[0],agent.includes('iPhone')?'http://localhost/web/':'http://localhost/web/?course=15');
  assert.equal(h.replacements.at(-1),'http://localhost/web/?course=15#/pages/course-detail/course-detail?id=15');
  h.host.current.setData({course:{id:'16',title:'该不该使用手机',enabled:true,coverUrl:'https://cdn.test/other.jpg',chapters:[]}});await tick();
  await h.host.wx.prepareCourseShare(h.host.current);
  assert.equal(signatures.length,agent.includes('iPhone')?1:2);
  assert.match(cards.at(-1).link,/course=16#/);
 }
});

test('新接口失败时兼容官方菜单分享监听，仍然分享可点击课程链接和课程封面',async()=>{
 const h=await host();h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=8'});await tick();
 h.host.current.setData({loading:false,error:'',course:{id:'8',title:'倾诉的陷阱',enabled:true,coverUrl:'https://cdn.test/talk.jpg',chapters:[]}});await tick();
 h.context.navigator.userAgent='MicroMessenger';let ready,legacy;
 h.context.wx={config:()=>ready(),ready:fn=>{ready=fn},error(){},updateAppMessageShareData:value=>value.fail({errMsg:'function not exist'}),onMenuShareAppMessage:value=>{legacy=value}};
 h.context.fetch=async()=>({ok:true,json:async()=>({ok:true,data:{appId:'test',timestamp:1,nonceStr:'x',signature:'x'}})});
 assert.equal(await h.host.wx.prepareCourseShare(h.host.current),false,'菜单监听注册不是已发送卡片的证明');
 assert.equal(legacy.title,'倾诉的陷阱');assert.equal(legacy.imgUrl,'https://cdn.test/talk.jpg');
 assert.equal(legacy.link,'http://localhost/web/?course=8#/pages/course-detail/course-detail?id=8');
 assert.doesNotMatch(legacy.link,/token|video|data:/);
});

test('课程转发封面按原图宽高比展示，模板不强制正方形或固定视口高度',()=>{
 assert.match(read('pages/course-detail/course-detail.wxml'),/class="forward-card-cover"[^>]+mode="widthFix"/);
 const rule=read('pages/course-detail/course-detail.wxss').match(/\.forward-card-cover\s*\{([^}]+)\}/)[1];
 assert.match(rule,/height:auto/);assert.doesNotMatch(rule,/aspect-ratio|42vh|max-height/);
});

test('课程视频网页端去掉浏览器下载入口并显示观看者水印，不影响播放控件',async()=>{
 const h=await host();h.host.wx.setStorageSync('zionJwt','h5-session');h.host.wx.setStorageSync('userInfo',{id:'201',nickName:'家长甲',phone:'13800000000'});
 const course={id:'15',title:'沉迷手机',description:'',chapters:[{id:'24',title:'沉迷手机',duration:'11:42',sortOrder:1,hasVideo:true,videoUrl:''}]};
 h.host.requireModule('utils/zion').getCourse=async()=>({course:structuredClone(course)});
 h.host.requireModule('utils/consultationService').call=async()=>({canWatch:true,isPublic:true,reason:'',lessons:[{id:'24',hasVideo:true,videoUrl:'https://cdn.test/phone.mp4'}]});
 h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=15'});await tick();await tick();
 h.host.current.videoContext={play(){},pause(){},stop(){}};
 h.host.current.openChapter({currentTarget:{dataset:{index:0}}});await tick();
 const video=h.document.querySelector('#courseVideo');
 assert.equal(video.getAttribute('src'),'https://cdn.test/phone.mp4');assert.equal(video.hasAttribute('controls'),true);
 assert.equal(video.getAttribute('controlslist'),'nodownload');assert.equal(video.hasAttribute('playsinline'),true);
 const menu=new h.Event('contextmenu',{cancelable:true});video.dispatchEvent(menu);assert.equal(menu.defaultPrevented,true);
 const mark=h.document.querySelector('.video-watermark');
 assert.equal(mark.getAttribute('aria-hidden'),'true');assert.equal(mark.textContent,'知守 · 家长甲 · ID 201');assert.doesNotMatch(mark.textContent,/138/);
 const css=fs.readFileSync(path.join(__dirname,'../../web/replica/course-detail.css'),'utf8');
 assert.match(css,/\.video-watermark \{[^}]*pointer-events: none/);
 h.host.wx.removeStorageSync('zionJwt');h.host.current.openChapter({currentTarget:{dataset:{index:0}}});await tick();
 assert.equal(h.document.querySelector('.video-watermark').textContent,'知守 · 访客观看');
});

const openPublicLesson=async h=>{
 const course={id:'15',title:'沉迷手机',description:'',enabled:true,chapters:[{id:'24',title:'沉迷手机',duration:'11:42',sortOrder:1,hasVideo:true,videoUrl:''}]};
 h.host.requireModule('utils/zion').getCourse=async()=>({course:structuredClone(course)});
 h.host.requireModule('utils/consultationService').call=async()=>({canWatch:true,isPublic:true,reason:'',lessons:[{id:'24',hasVideo:true,videoUrl:'https://cdn.test/phone.mp4'}]});
 h.host.wx.navigateTo({url:'/pages/course-detail/course-detail?id=15'});await tick();await tick();
 h.host.current.videoContext={play(){},pause(){},stop(){}};
 h.host.current.openChapter({currentTarget:{dataset:{index:0}}});await tick();
};
test('夸克、UC 等自带视频下载的浏览器不加载视频，提示复制链接到微信观看',async()=>{
 for(const ua of['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Quark/7.4.5.2088','Mozilla/5.0 (Linux; U; Android 14) UCBrowser/17.2.0.1380 Mobile Safari/537.36','Mozilla/5.0 (Linux; Android 14) Mobile Safari/537.36 baiduboxapp/13.60.0.10','Mozilla/5.0 (Linux; Android 14) MQQBrowser/14.8 Mobile Safari/537.36']){
  const h=await host({navigator:{userAgent:ua}});await openPublicLesson(h);
  assert.equal(!!h.document.querySelector('#courseVideo'),false,ua);assert.equal(h.host.current.data.showVideoPlayer,false);
  const modal=h.document.querySelector('#modal');assert.equal(modal.open,true);assert.match(modal.textContent,/请在微信中观看/);assert.match(modal.textContent,/复制链接/);
 }
});
test('微信（含安卓 X5 的 MQQBrowser 标识）和普通浏览器照常播放课程视频',async()=>{
 for(const ua of['Mozilla/5.0 (Linux; Android 14) MQQBrowser/6.2 TBS/046011 Mobile Safari/537.36 MicroMessenger/8.0.49','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 MicroMessenger/8.0.50','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1']){
  const h=await host({navigator:{userAgent:ua}});await openPublicLesson(h);
  assert.equal(h.document.querySelector('#courseVideo')?.getAttribute('src'),'https://cdn.test/phone.mp4',ua);
 }
});
test('播放中页面 setData 不会重建视频元素，避免课程从头播放',async()=>{
 const h=await host();await openPublicLesson(h);
 const video=h.document.querySelector('#courseVideo');
 h.host.current.setData({showSharePanel:true});await tick();
 assert.equal(h.document.querySelector('#courseVideo')===video,true);
 h.host.current.stopVideo();await tick();assert.equal(!!h.document.querySelector('#courseVideo'),false);
});
