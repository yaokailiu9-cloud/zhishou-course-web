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
  vm.runInContext(read('web/replica/runtime.js'),context);
  await tick();return{context,document,Event,host:context.MiniHost,errors,replacements};
}
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
test('微信登录请求指定首页为回调落点并保留推荐人',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=test-ref',hash:'#mine'}});
  h.host.wx.switchTab({url:'/pages/profile/profile'});await tick();
  h.host.current.loginByWechat();
  const url=new URL(h.context.location.href,'http://localhost');
  assert.equal(url.searchParams.get('return'),'/web/#/pages/index/index');
  assert.equal(url.searchParams.get('ref'),'test-ref');
});
test('all registered pages are bundled from the exact current mini-program sources',()=>{
  const manifest=JSON.parse(read('web/replica-manifest.json'));
  assert.deepEqual(manifest.pages,JSON.parse(read('app.json')).pages);
  for(const [file,hash]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),hash,file);
  for(const route of manifest.pages)assert.ok(fs.existsSync(path.join(ROOT,'web/replica',route.split('/')[1]+'.css')));
  assert.doesNotMatch(read('web/replica/base.css'),/##page|\d+rpx/);
});
test('微信网页扫码使用官方扫一扫并将个人码交回签到页，取消可再次扫描',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});let ready,config,scan,out,failure;
  h.context.wx={config:r=>{config=r;ready();},ready:fn=>{ready=fn;},error(){},scanQRCode:r=>{scan=r;}};
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
test('微信签名未配置时明确提示拍照识码，点击后仍能进入相机入口',async()=>{
  const h=await host({navigator:{userAgent:'MicroMessenger'}});h.context.wx={config(){}};
  h.context.fetch=async()=>({ok:false,json:async()=>({ok:false,message:'配置暂不可用'})});
  const original=h.document.createElement.bind(h.document);let input,failure;
  h.document.createElement=tag=>{const el=original(tag);if(tag==='input'){input=el;el.click=()=>{};}return el;};
  await h.host.wx.scanCode({fail:r=>failure=r});assert.match(h.document.querySelector('#modal').textContent,/拍照识码/);
  h.document.querySelector('#modal .modal-actions button:last-child').onclick();assert.equal(input.capture,'environment');input.oncancel();assert.equal(failure.errMsg,'cancel');
});
test('home renders source content, real tab navigation, and all page modules without JS errors',async()=>{
  const h=await host();assert.match(h.document.getElementById('page').textContent,/透过现象看本质/);
  assert.doesNotMatch(h.document.getElementById('page').textContent,/到课核实后，可申请线下咨询/);
  assert.equal(h.document.querySelectorAll('#tabbar button').length,4);
  for(const route of h.context.MiniSource.config.pages){h.host.wx.navigateTo({url:'/'+route});await tick();assert.equal(h.host.current.route,route==='pages/manager/manager'?'pages/profile/profile':route);assert.ok(h.document.getElementById('page').textContent.trim(),route)}
  assert.deepEqual(h.errors,[]);
});
test('网页公开课按场次显示后台费用，不再把所有场次写死为免费',async()=>{
  assert.match(read('pages/public-class/public-class.wxml'),/\{\{item\.feeText\}\}/);
  assert.match(read('pages/public-class/public-class.wxml'),/course-cover/);
  const h=await host();h.host.wx.navigateTo({url:'/pages/public-class/public-class'});await tick();
  h.host.current.setData({classes:[{id:'5',title:'公开课测试',coverUrl:'https://example.invalid/cover.jpg',timeText:'周六',placeText:'深圳',description:'课程介绍',canEnroll:true,seatsText:'尚有名额',feeText:'￥100.00',isPaid:true}],loading:false,error:''});await tick();
  const page=h.document.getElementById('page');
  assert.doesNotMatch(page.textContent,/免费公开课|到课核实后，可申请线下咨询/);assert.match(page.textContent,/￥100\.00/);
  assert.equal(page.querySelectorAll('.course-card .course-cover,.course-card .course-cover-fallback').length,0);
  assert.match(page.textContent,/公开课/);
  h.host.wx.navigateTo({url:'/pages/profile/profile'});await tick();
  assert.doesNotMatch(h.document.getElementById('page').textContent,/报名参加后，可申请线下咨询/);
});
test('loop rendering and conditional states preserve user input and search filtering',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/search/search?mode=courses'});await tick();
  const input=h.document.querySelector('input');assert.ok(input);input.value='家庭';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.document.querySelector('input').value,'家庭');
  const titles=['奖励的误区','倾诉的陷阱','安全感从哪来','为何知错不改','问题从哪里来','判断准确吗','有没有选择权','什么是沟通'];
  const rows=titles.map((title,index)=>({id:String(index+7),title,subtitle:'《答案库》系列课程',badge:'付费',enabled:true,cover_image:{url:'https://example.invalid/cover.png'},course_lesson:[{id:index+1,title}]}));
  h.context.fetch=async(_url,options)=>{const request=JSON.parse(options.body);const data=request.query.includes('query GetCourse')?{course_by_pk:rows.find(row=>row.id===String(request.variables.id))}:{course:rows};return {ok:true,status:200,headers:[],text:async()=>JSON.stringify({data})};};
  h.host.wx.navigateTo({url:'/pages/index/index'});await tick();
  assert.equal(h.document.querySelectorAll('.series-entry').length,1);
  assert.doesNotMatch(h.document.getElementById('page').textContent,/奖励的误区|倾诉的陷阱/);
  const link=h.document.querySelector('[aria-label="查看答案库系列课程"]');assert.ok(link);
  link.dispatchEvent(new h.Event('click'));await tick();assert.equal(h.host.current.route,'pages/plaza/plaza');
  assert.equal(h.document.querySelectorAll('.course-grid .course-card').length,8);
  for(const row of rows){
    h.document.querySelector('[aria-label="查看'+row.title+'"]').dispatchEvent(new h.Event('click'));await tick();
    assert.equal(h.host.current.route,'pages/course-detail/course-detail');assert.equal(h.host.current.options.id,row.id);
    assert.equal(h.document.querySelector('.chapter-title').textContent,row.title);
    h.host.wx.switchTab({url:'/pages/plaza/plaza'});await tick();
  }
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
test('date/selector controls emit mini-program values and protected pages do not grant staff access',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/profile-edit/profile-edit'});await tick();
  const select=h.document.querySelector('select');assert.ok(select);const option=select.querySelectorAll('option')[2];option.selected=true;select.dispatchEvent(new h.Event('change',{bubbles:true}));await tick();assert.equal(h.host.current.data.gender,'男');
  h.host.wx.disableAlertBeforeUnload();h.host.wx.navigateTo({url:'/pages/course-roster/course-roster?id=1'});await tick();assert.equal(h.host.current.data.allowed,false);
  assert.equal(h.host.wx.getStorageSync('zionJwt'),'');assert.equal(h.document.querySelectorAll('[data-field="attendanceStatus"]').length,0);
});
test('browser payment fails before creating orders and recorder clearly reports unsupported state',async()=>{
  const h=await host();await assert.rejects(h.host.requireModule('utils/payment').startConsultationPayment(),/网页支付尚未接入/);
  h.host.wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id=1'});await tick();h.host.current.startRecording();assert.match(h.document.getElementById('modal').textContent,/网页录音尚未开放/);
});

test('课程详情分享把标题、说明和直达链接交给系统分享',async()=>{
  let shared;const h=await host({navigator:{share:async value=>{shared=value}}});
  h.host.wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id=7'});await tick();
  h.host.current.setData({classInfo:{id:'7',title:'奖励的误区',status:'PUBLISHED',canEnroll:true,coverUrl:'https://example.invalid/cover.jpg'}});await tick();
  h.document.querySelector('.course-footer .secondary').dispatchEvent(new h.Event('click',{bubbles:true}));await tick();
  assert.equal(shared.title,'奖励的误区');assert.match(shared.text,/课程介绍/);assert.match(shared.url,/#\/pages\/public-class-detail\/public-class-detail\?id=7$/);
});

test('文字聊天未开通时展示简洁空状态，开通后恢复计时与输入区',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/chat/chat'});await tick();
  h.host.current.setData({hasAccess:false,serviceEnded:false,isManagerView:false,messages:[]});await tick();
  assert.equal(h.document.querySelectorAll('.chat-empty').length,1);
  assert.equal(h.document.querySelectorAll('.service-card').length,0);
  assert.equal(h.document.querySelectorAll('.chat-composer').length,0);
  assert.match(h.document.getElementById('page').textContent,/暂时没有文字会话/);
  h.host.current.setData({hasAccess:true,remainingText:'59:59'});await tick();
  assert.equal(h.document.querySelectorAll('.chat-empty').length,0);
  assert.equal(h.document.querySelectorAll('.service-card').length,1);
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
