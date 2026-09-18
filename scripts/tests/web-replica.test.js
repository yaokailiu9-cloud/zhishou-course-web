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
async function host(){
  const {document,Event}=parseHTML(read('web/index.html'));
  Object.defineProperty(document,'currentScript',{value:{src:'http://localhost/web/replica/runtime.js?v=test'}});
  document.querySelectorAll('dialog').forEach(d=>{d.showModal=()=>{d.open=true};d.close=()=>{d.open=false}});
  const errors=[];
  const context={document,Event,console:{log(){},warn(){},error:(...args)=>errors.push(args)},URL,URLSearchParams,AbortController,setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},queueMicrotask,innerWidth:390,innerHeight:844,devicePixelRatio:1,requestAnimationFrame:fn=>queueMicrotask(fn),navigator:{userAgent:'test browser'},location:{pathname:'/web/',search:'',hash:'',origin:'http://localhost',href:'http://localhost/web/'},history:{pushState(){},replaceState(){},back(){}},addEventListener(){},scrollTo(){},scrollY:0,
    fetch:async url=>({ok:true,status:200,headers:[],json:async()=>({ok:true,data:{loggedIn:false}}),text:async()=>JSON.stringify({data:{course:[],advisor:[],course_by_pk:null,fz_invoke_action_flow:{result:{ok:true,data:{classes:[],items:[]}}}}})})};
  context.window=context;vm.createContext(context);
  vm.runInContext(read('web/replica/source.js'),context);
  vm.runInContext(read('web/replica/runtime.js'),context);
  await tick();return{context,document,Event,host:context.MiniHost,errors};
}
test('all 24 pages are bundled from the exact current mini-program sources',()=>{
  const manifest=JSON.parse(read('web/replica-manifest.json'));
  assert.equal(manifest.pages.length,24);
  for(const [file,hash]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),hash,file);
  for(const route of manifest.pages)assert.ok(fs.existsSync(path.join(ROOT,'web/replica',route.split('/')[1]+'.css')));
  assert.doesNotMatch(read('web/replica/base.css'),/##page|\d+rpx/);
});
test('home renders source content, real tab navigation, and all page modules without JS errors',async()=>{
  const h=await host();assert.match(h.document.getElementById('page').textContent,/透过现象看本质/);
  assert.equal(h.document.querySelectorAll('#tabbar button').length,4);
  for(const route of h.context.MiniSource.config.pages){h.host.wx.navigateTo({url:'/'+route});await tick();assert.equal(h.host.current.route,route==='pages/manager/manager'?'pages/profile/profile':route);assert.ok(h.document.getElementById('page').textContent.trim(),route)}
  assert.deepEqual(h.errors,[]);
});
test('loop rendering and conditional states preserve user input and search filtering',async()=>{
  const h=await host();h.host.wx.navigateTo({url:'/pages/search/search?mode=courses'});await tick();
  const input=h.document.querySelector('input');assert.ok(input);input.value='家庭';input.dispatchEvent(new h.Event('input',{bubbles:true}));await tick();
  assert.equal(h.document.querySelector('input').value,'家庭');
  h.host.wx.navigateTo({url:'/pages/index/index'});await tick();h.host.current.setData({featuredCourses:[{id:'7',title:'测试课程',badge:'付费',coverUrl:''}],loadingCourses:false,courseError:''});await tick();
  assert.match(h.document.getElementById('page').textContent,/测试课程/);
  const link=h.document.querySelector('navigator');assert.equal(link.getAttribute('aria-label'),'查看测试课程');
  link.dispatchEvent(new h.Event('click'));await tick();assert.equal(h.host.current.route,'pages/course-detail/course-detail');assert.equal(h.host.current.options.id,'7');
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
