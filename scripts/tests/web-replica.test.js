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

test('扫码来源先保存再登录，刷新无 ref 仍强制登录并回到原课程',async()=>{
  const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=7';let calls=[];
  const fetch=async(url,options={})=>{calls.push({url,options});return {ok:true,status:200,headers:[],json:async()=>({ok:true,data:String(url).includes('action=session')?{loggedIn:false,invitation:{returnTo}}:String(url).includes('capture-referral')?{invitation:{returnTo}}:{candidate:{name:'推荐人甲'}}})};};
  const h=await host({navigator:{userAgent:'MicroMessenger'},location:{search:'?ref=signed-invitation',hash:'#/pages/public-class-detail/public-class-detail?id=7'},fetch});
  assert.equal(calls[0].url,'/api/h5?action=capture-referral');assert.equal(JSON.parse(calls[0].options.body).returnTo,returnTo);assert.equal(calls[0].options.credentials,'same-origin');
  assert.equal(h.host.current.route,'pages/invite-login/invite-login');assert.ok(h.document.querySelector('#page').textContent.includes('推荐人甲'));
  h.host.wx.switchTab({url:'/pages/plaza/plaza'});await tick();assert.equal(h.host.current.route,'pages/invite-login/invite-login');
  h.host.current.login();let url=new URL(h.context.location.href,'http://localhost');assert.equal(url.searchParams.get('return'),returnTo);
  const refreshed=await host({navigator:{userAgent:'MicroMessenger'},fetch});assert.equal(refreshed.host.current.route,'pages/invite-login/invite-login');refreshed.host.current.login();url=new URL(refreshed.context.location.href,'http://localhost');assert.equal(url.searchParams.get('return'),returnTo);assert.equal(url.searchParams.get('ref'),'');
});

test('邀请保存失败时不能继续报名；已有登录遇到有效推荐码不强制重新授权',async()=>{
  for(const fail of [true,false]){
    const h=await host({location:{search:'?ref=signed',hash:'#/pages/public-class-detail/public-class-detail?id=7'},fetch:async(url)=>({ok:!fail||!String(url).includes('capture-referral'),status:fail?500:200,headers:[],json:async()=>({ok:!fail||!String(url).includes('capture-referral'),data:String(url).includes('action=session')?{loggedIn:true,user:{id:'18',name:'家长'},invitation:{returnTo:'/web/#/pages/public-class-detail/public-class-detail?id=7'}}:{invitation:{returnTo:'/web/#/pages/public-class-detail/public-class-detail?id=7'}}}),text:async()=>JSON.stringify({data:{fz_invoke_action_flow:{result:{ok:true,data:{classInfo:{id:7,status:'PUBLISHED'}}}}}})})});
    assert.equal(h.host.current.route,fail?'pages/invite-login/invite-login':'pages/public-class-detail/public-class-detail');assert.equal(h.host.wx.getStorageSync('userInfo').id,'18');
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
  const birthday=h.document.querySelector('input[type="date"]');assert.ok(birthday);assert.match(birthday.parentElement.textContent,/生日.*请选择/);birthday.value='2012-03-04';birthday.dispatchEvent(new h.Event('change',{bubbles:true}));await tick();assert.equal(h.host.current.data.birthday,'2012-03-04');
  h.host.wx.disableAlertBeforeUnload();h.host.wx.navigateTo({url:'/pages/course-roster/course-roster?id=1'});await tick();assert.equal(h.host.current.data.allowed,false);
  assert.equal(h.host.wx.getStorageSync('zionJwt'),'');assert.equal(h.document.querySelectorAll('[data-field="attendanceStatus"]').length,0);
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
  const canvas=h.document.getElementById('referral-code');assert.ok(canvas);
  h.host.current.setData({loading:true});await tick();assert.equal(h.document.getElementById('referral-code'),canvas,'刷新名单不清空已绘制二维码');
});

test('文字聊天空状态在用户和管理端统一展示，开通后恢复计时与输入区',async()=>{
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
