/* Browser host for the preserved mini-program. Source expressions are compiled at build time. */
(function () {
  const source = window.MiniSource;
  const buildVersion = new URL(document.currentScript.src).searchParams.get('v');
  const root = document.getElementById('page');
  const modules = {}, definitions = {}, files = new Map(), storage = new Map();
  const app = {globalData:{}};
  let current = null, stack = [], renderPending = false, toastTimer, unloadMessage = '', session = null, wechatSdkLoading = null, wechatShareReady = null;
  const HOME = 'pages/index/index';
  const tabRoutes = source.config.tabBar.list.map(item => item.pagePath);
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  function resolve(from, name) {
    const segments = (name.startsWith('.') ? from.split('/').slice(0,-1).join('/')+'/'+name : name).split('/');
    const out=[];for(const part of segments){if(part==='..')out.pop();else if(part&&part!=='.')out.push(part)}
    return out.join('/').replace(/\.js$/,'');
  }
  function requireModule(name) {
    if(modules[name])return modules[name].exports;
    if(!source.modules[name])throw new Error('页面模块不存在：'+name);
    const module={exports:{}};modules[name]=module;
    source.modules[name](path=>requireModule(resolve(name,path)),module,module.exports,definition=>{definitions[name]=definition},wx,()=>app,()=>stack);
    if(name==='utils/payment'){
      const unavailable=()=>Promise.reject(new Error('网页支付尚未接入，请联系工作人员'));
      module.exports.startConsultationPayment=unavailable;module.exports.renewConsultationPayment=unavailable;
    }
    return module.exports;
  }
  function value(parts, scope) {
    const evaluate=part=>typeof part==='string'?part:source.expressions[part.e](scope);
    if(parts?.length===1)return evaluate(parts[0]);
    return (parts||[]).map(part=>{const v=evaluate(part);return v==null?'':String(v)}).join('');
  }
  function safeUrl(raw) {
    const v=String(raw||'');
    if(v.startsWith('/assets/'))return '/web/replica'+v;
    return /^(https?:|blob:|data:image\/|\/web\/)/i.test(v)?v:'';
  }
  function dispatch(page, name, element, native, detail={}) {
    if(!name||typeof page[name]!=='function')return;
    const target={dataset:{...element.dataset},id:element.id};
    try {Promise.resolve(page[name]({type:native?.type||'tap',currentTarget:target,target,detail})).catch(error=>wx.showToast({title:error.message||'操作未完成'}))}
    catch(error){console.error(error);wx.showToast({title:error.message||'操作未完成'})}
  }
  function children(nodes, scope, parent, page) {
    let branch=false;
    for(const node of nodes){
      if(node.text){parent.append(document.createTextNode(String(value(node.text,scope)??'')));continue}
      const attrs=node.attrs;
      if(attrs['wx:for']){
        const list=value(attrs['wx:for'],scope)||[];
        const itemName=value(attrs['wx:for-item'],scope)||'item',indexName=value(attrs['wx:for-index'],scope)||'index';
        const cleaned={...attrs};delete cleaned['wx:for'];
        Object.entries(list).forEach(([index,item])=>children([{...node,attrs:cleaned}],{...scope,[itemName]:item,[indexName]:Array.isArray(list)?Number(index):index},parent,page));
        continue;
      }
      if(attrs['wx:if']){branch=!!value(attrs['wx:if'],scope);if(!branch)continue}
      else if(attrs['wx:elif']){if(branch)continue;branch=!!value(attrs['wx:elif'],scope);if(!branch)continue}
      else if(attrs['wx:else']){if(branch)continue;branch=true}
      else branch=false;
      if(node.tag==='block'){children(node.children,scope,parent,page);continue}
      const tag=node.tag==='image'?'img':node.tag==='picker'?'label':node.tag;
      const el=document.createElement(tag);
      const values={};for(const [key,parts]of Object.entries(attrs))values[key]=value(parts,scope);
      for(const [key,val]of Object.entries(values)){
        if(key.startsWith('wx:')||/^(bind|catch)/.test(key)||['range','range-key','mode','value','open-type','form-type','url','scroll-into-view','scroll-top','canvas-id','type'].includes(key))continue;
        if(['disabled','hidden','controls','autoplay','loop','muted','scroll-y','scroll-x'].includes(key)){if(val!==false&&val!=null&&val!=='false'){el.setAttribute(key,'');if(key in el)el[key]=true}continue}
        if(key==='src'||key==='poster'){if(safeUrl(val))el.setAttribute(key,safeUrl(val));continue}
        if(key==='style'){el.style.cssText=String(val||'').replace(/(-?\d+(?:\.\d+)?)rpx/g,'calc($1 * var(--rpx))');continue}
        if(val!=null)el.setAttribute(key,String(val));
      }
      if(tag==='img'){el.alt=values['aria-label']||'';el.style.objectFit=values.mode==='aspectFit'?'contain':'cover';if(values.mode==='widthFix'){el.style.height='auto';el.style.width='100%'}}
      if(tag==='button')el.type=values['form-type']==='submit'?'submit':'button';
      if(tag==='input'||tag==='textarea'){
        el.dataset.focusKey=page._inputCounter++;
        if(tag==='input'){el.type=['number','digit'].includes(values.type)?'text':values.type==='password'?'password':'text';if(['number','digit'].includes(values.type))el.inputMode='decimal'}
        el.value=values.value??'';
      }
      if(tag==='canvas'){el.id=values['canvas-id']||values.id;el.width=256;el.height=256}
      if(tag==='scroll-view'&&values['scroll-y']!==undefined)el.setAttribute('scroll-y','');
      if(tag==='scroll-view'&&values['scroll-x']!==undefined)el.setAttribute('scroll-x','');
      const eventMap={tap:'click',input:'input',change:'change',confirm:'keydown',submit:'submit',error:'error',load:'load',blur:'blur',focus:'focus',longpress:'contextmenu',scrolltolower:'scroll',touchstart:'touchstart',touchend:'touchend'};
      for(const [key,handler]of Object.entries(values)){
        const match=key.match(/^(bind|catch):?(.+)$/);if(!match||!eventMap[match[2]])continue;
        const emit=event=>{
          if(match[1]==='catch')event.stopPropagation();
          if(match[2]==='confirm'&&event.key!=='Enter')return;
          if(match[2]==='scrolltolower'&&el.scrollTop+el.clientHeight<el.scrollHeight-30)return;
          if(match[2]==='submit'||match[2]==='longpress')event.preventDefault();
          const detail={value:el.value,width:el.naturalWidth,height:el.naturalHeight};
          if(match[2]==='submit')detail.value=Object.fromEntries(new FormData(el));
          dispatch(page,handler,el,event,detail);
        };
        if(match[2]==='input'&&(tag==='input'||tag==='textarea')){
          let composing=false;
          el.addEventListener('compositionstart',()=>{composing=true});
          el.addEventListener('compositionend',event=>{composing=false;emit(event)});
          el.addEventListener('input',event=>{if(!composing&&!event.isComposing)emit(event)});
        }else el.addEventListener(eventMap[match[2]],emit);
        if(match[2]==='tap'&&!['button','input','textarea','navigator'].includes(tag)){el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})}
      }
      if(tag==='navigator'){
        el.setAttribute('role','link');el.tabIndex=0;
        const open=()=>navigate(values.url,values['open-type']==='switchTab'?'tab':'push');
        el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter')open()});
      }
      if(values['open-type']==='chooseAvatar')el.addEventListener('click',()=>wx.chooseMedia({mediaType:['image'],success:r=>dispatch(page,values.bindchooseavatar,el,null,{avatarUrl:r.tempFiles[0].tempFilePath})}));
      if(values['open-type']==='share')el.addEventListener('click',()=>share(page));
      children(node.children,scope,el,page);
      if(node.tag==='picker'){
        el.classList.add('web-picker');
        const select=document.createElement(['date','time'].includes(values.mode)?'input':'select');select.className='web-picker-control';select.disabled=!!values.disabled;
        select.setAttribute('aria-label',el.textContent.trim()||'选择');
        if(select.tagName==='INPUT'){select.type=values.mode;select.value=values.value||'';if(values.end)select.max=values.end;if(values.start)select.min=values.start}
        else{(values.range||[]).forEach((item,i)=>{const option=document.createElement('option');option.value=i;option.textContent=values['range-key']?item[values['range-key']]:item;select.append(option)});select.value=values.value||0}
        select.addEventListener('change',event=>{event.stopPropagation();dispatch(page,values.bindchange,el,event,{value:select.value})});
        el.append(select);
      }
      parent.append(el);
      if(values['scroll-into-view'])requestAnimationFrame(()=>{const target=document.getElementById(values['scroll-into-view']);if(target)target.scrollIntoView({block:'nearest'})});
    }
  }
  function render() {
    renderPending=false;if(!current)return;
    const focused=document.activeElement,focusKey=focused?.dataset.focusKey,start=focused?.selectionStart,end=focused?.selectionEnd;
    const scrollers=[...root.querySelectorAll('scroll-view')].map(el=>({id:el.id,top:el.scrollTop}));
    const fragment=document.createDocumentFragment();current._inputCounter=0;
    children(source.pages[current.route].tree,current.data,fragment,current);
    root.replaceChildren(fragment);root.dataset.route=current.route;
    if(current.route==='pages/profile/profile'){
      const subtitle=root.querySelector('.login-subtitle');if(subtitle)subtitle.textContent='在微信内打开，通过公众号授权登录';
      const benefits=root.querySelector('.login-benefits');if(benefits)benefits.textContent='登录后可查看报名、咨询和学习记录；昵称和头像可在个人资料中修改。';
      const avatar=root.querySelector('.login-avatar-picker');if(avatar){avatar.disabled=true;avatar.setAttribute('aria-label','知守头像')}
      const link=document.createElement('a');link.href='/web/legacy/#mine';link.className='web-referrals';link.textContent='我的推荐 · 专属推荐链接与学员记录 ›';root.append(link);
    }
    if(focusKey!=null){const next=root.querySelector('[data-focus-key="'+focusKey+'"]');if(next){next.focus({preventScroll:true});try{next.setSelectionRange(start,end)}catch(_){}}}
    scrollers.forEach((v,i)=>{const el=v.id?document.getElementById(v.id):root.querySelectorAll('scroll-view')[i];if(el)el.scrollTop=v.top});
  }
  function schedule(){if(!renderPending){renderPending=true;queueMicrotask(render)}}
  function setData(page, patch, callback){
    for(const [path,v]of Object.entries(patch)){
      const keys=path.replace(/\[(\d+)\]/g,'.$1').split('.');let target=page.data;
      keys.forEach((key,index)=>{if(index===keys.length-1)target[key]=v;else{if(target[key]==null)target[key]=/^\d+$/.test(keys[index+1])?[]:{};target=target[key]}});
    }
    if(page===current)schedule();if(callback)queueMicrotask(()=>callback.call(page));
  }
  async function lifecycle(page, name, args){if(typeof page[name]==='function'){try{await page[name](args)}catch(error){console.error(name,error);wx.showToast({title:'加载未完成，请稍后重试'})}}}
  function showPage(page){
    current=page;const config=source.pages[page.route].config;
    $('#page-style').href='/web/replica/'+page.route.split('/')[1]+'.css?v='+buildVersion;
    $('#page-header').hidden=config.navigationStyle==='custom';$('#page-title').textContent=config.navigationBarTitleText||'知守';
    document.title=(config.navigationBarTitleText||'知守')+' · 知守';
    $('#tabbar').hidden=!tabRoutes.includes(page.route);root.classList.toggle('no-tabs',!tabRoutes.includes(page.route));
    for(const button of $('#tabbar').children)button.setAttribute('aria-current',button.dataset.route===page.route?'page':'false');
    render();window.scrollTo(0,page._scroll||0);
  }
  function parseRoute(url){const raw=String(url||'').replace(/^#?\/?/,'');const [path,query]=raw.split('?');return{route:source.pages[path]?path:HOME,options:Object.fromEntries(new URLSearchParams(query))}}
  function navigate(url,mode='push',fromHistory=false){
    const {route,options}=parseRoute(url);
    if(!fromHistory&&unloadMessage){wx.showModal({title:'尚未保存',content:unloadMessage,success:r=>{if(r.confirm){unloadMessage='';navigate(url,mode)}}});return}
    if(current){current._scroll=window.scrollY;lifecycle(current,'onHide')}
    if(mode==='tab'||mode==='replace'){for(const old of (mode==='tab'?stack:stack.slice(-1)))lifecycle(old,'onUnload');stack=mode==='tab'?[]:stack.slice(0,-1)}
    requireModule(route);const page={...definitions[route],data:clone(definitions[route].data||{}),route,options};
    page.setData=(patch,cb)=>setData(page,patch,cb);
    // Browser identity is an HttpOnly server session, never a mini-program login code.
    if(route==='pages/profile/profile'){
      page.loginByWechat=webLogin;
      const originalLogout=page.logout;
      page.logout=async function(){try{const r=await fetch('/api/h5?action=logout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});if(!r.ok)throw new Error();session=null;originalLogout.call(this)}catch(_){wx.showToast({title:'退出未完成，请重试'})}};
    }
    if(route==='pages/consultation-detail/consultation-detail')page.startRecording=()=>wx.showModal({title:'网页录音尚未开放',content:'本次已复刻录音与总结入口。网页录音编码尚待接入，目前可以使用文字沟通总结及手动记录。',showCancel:false});
    page.setCustomNav=function(){this.setData({statusBarHeight:12,navHeight:76,navPaddingRight:0})};
    stack.push(page);showPage(page);
    if(!fromHistory){const hash='#/'+route+(Object.keys(options).length?'?'+new URLSearchParams(options):'');history[mode==='replace'?'replaceState':'pushState']({route},'',location.pathname+location.search+hash)}
    lifecycle(page,'onLoad',options);lifecycle(page,'onShow');queueMicrotask(()=>lifecycle(page,'onReady'));
  }
  function back(){if(stack.length>1){if(unloadMessage){wx.showModal({title:'尚未保存',content:unloadMessage,success:r=>{if(r.confirm){unloadMessage='';history.back()}}});return}history.back()}else navigate('/'+HOME,'tab')}
  window.addEventListener('popstate',()=>{unloadMessage='';const {route,options}=parseRoute(location.hash);const previous=stack[stack.length-2];if(previous&&previous.route===route&&JSON.stringify(previous.options)===JSON.stringify(options)){lifecycle(current,'onUnload');stack.pop();showPage(previous);lifecycle(previous,'onShow')}else navigate(location.hash,'replace',true)});
  window.addEventListener('beforeunload',event=>{if(unloadMessage){event.preventDefault();event.returnValue=''}});
  function complete(options,result,failed=false){options[failed?'fail':'success']?.(result);options.complete?.(result)}
  function modal(options){
    const dialog=$('#modal');if(dialog.open)dialog.close();dialog.querySelector('h2').textContent=options.title||'提示';dialog.querySelector('p').textContent=options.content||'';
    const actions=dialog.querySelector('.modal-actions');actions.replaceChildren();let done=false;
    const finish=confirm=>{if(done)return;done=true;dialog.close();complete(options,{confirm,cancel:!confirm})};
    if(options.showCancel!==false){const cancel=document.createElement('button');cancel.className='cancel';cancel.textContent=options.cancelText||'取消';cancel.onclick=()=>finish(false);actions.append(cancel)}
    const ok=document.createElement('button');ok.textContent=options.confirmText||'确定';ok.onclick=()=>finish(true);actions.append(ok);dialog.oncancel=event=>{event.preventDefault();finish(false)};dialog.showModal();
  }
  function webLogin(){
    if(!/MicroMessenger/i.test(navigator.userAgent)){wx.showModal({title:'微信登录',content:'请将当前网页链接在微信中打开，再点击微信登录。',confirmText:'复制链接',success:r=>{if(r.confirm)wx.setClipboardData({data:location.href})}});return}
    const ref=new URLSearchParams(location.search).get('ref')||'';
    location.href='/api/h5?action=login&ref='+encodeURIComponent(ref)+'&return='+encodeURIComponent('/web/#/'+HOME);
  }
  function shareDetails(page){
    const info=page.onShareAppMessage?.()||{};const url=new URL('/web/',location.origin);url.hash='/'+(info.path||page.route).replace(/^\//,'');
    const ref=new URLSearchParams(location.search).get('ref');if(ref)url.searchParams.set('ref',ref);
    const image=info.imageUrl?new URL(info.imageUrl,location.origin).href:'';
    return {info,url,title:info.title||'知守',desc:info.desc||'查看课程介绍、开课时间与报名信息',image};
  }
  function loadWechatSdk(){
    if(window.wx?.config)return Promise.resolve(true);if(wechatSdkLoading)return wechatSdkLoading;
    wechatSdkLoading=new Promise((resolve,reject)=>{const script=document.createElement('script');const timer=setTimeout(()=>reject(new Error('微信组件加载超时')),12000);script.src='https://res.wx.qq.com/open/js/jweixin-1.6.0.js';script.onload=()=>{clearTimeout(timer);resolve(true)};script.onerror=()=>{clearTimeout(timer);reject(new Error('微信组件加载失败'))};document.head.append(script)}).catch(error=>{wechatSdkLoading=null;throw error});
    return wechatSdkLoading;
  }
  async function prepareWechatShare(page){
    if(!/MicroMessenger/i.test(navigator.userAgent))return false;await loadWechatSdk();
    const details=shareDetails(page);
    if(!wechatShareReady){
      wechatShareReady=(async()=>{const signedUrl=location.href.split('#')[0];const response=await fetch('/api/h5?action=share-signature&url='+encodeURIComponent(signedUrl));const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||'微信分享配置失败');
        await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('微信组件配置超时')),12000);window.wx.ready(()=>{clearTimeout(timer);resolve()});window.wx.error(error=>{clearTimeout(timer);reject(error)});window.wx.config({...result.data,debug:false,jsApiList:['updateAppMessageShareData','updateTimelineShareData','scanQRCode']})});return true;})().catch(error=>{wechatShareReady=null;throw error});
    }
    await wechatShareReady;
    const data={title:details.title,desc:details.desc,link:details.url.href,imgUrl:details.image};
    window.wx.updateAppMessageShareData?.(data);window.wx.updateTimelineShareData?.({title:details.title,link:details.url.href,imgUrl:details.image});
    return true;
  }
  async function share(page){const details=shareDetails(page);try{
    if(/MicroMessenger/i.test(navigator.userAgent)&&await prepareWechatShare(page)){wx.showModal({title:'微信分享',content:'课程卡片已准备好，请点击右上角“…”发送给朋友或群。',showCancel:false,confirmText:'知道了'});return}
    if(navigator.share)await navigator.share({title:details.title,text:details.desc,url:details.url.href});else await wx.setClipboardData({data:details.url.href});
  }catch(error){if(error.name!=='AbortError')wx.showModal({title:'分享课程',content:'微信卡片暂未调起，已为你保留课程链接。可复制后发送给朋友或群。',confirmText:'复制链接',success:r=>{if(r.confirm)wx.setClipboardData({data:details.url.href})}})}}
  function scanImage(o){
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.capture='environment';input.onchange=async()=>{try{const file=input.files[0];if(!file){complete(o,{errMsg:'cancel'},true);return}const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);const result=window.jsQR(pixels.data,pixels.width,pixels.height);bitmap.close();if(!result)throw new Error('未识别到二维码，请拍摄清晰图片后重试');complete(o,{result:result.data})}catch(error){complete(o,{errMsg:error.message},true)}};input.oncancel=()=>complete(o,{errMsg:'cancel'},true);input.click();
  }
  function offerScanImage(o){modal({title:'使用拍照识码',content:'微信扫一扫暂不可用。可以拍摄用户的个人入场二维码继续签到，请保持画面清晰。',confirmText:'拍照识码',success:r=>{if(r.confirm)scanImage(o);else complete(o,{errMsg:'cancel'},true)}})}
  const wx={
    getStorageSync:key=>storage.get(key)||'',setStorageSync:(key,val)=>storage.set(key,val),removeStorageSync:key=>storage.delete(key),
    getSystemInfoSync:()=>({windowWidth:Math.min(innerWidth,430),windowHeight:innerHeight,statusBarHeight:12,platform:'web',pixelRatio:devicePixelRatio,safeArea:{bottom:innerHeight}}),
    getWindowInfo:()=>wx.getSystemInfoSync(),getMenuButtonBoundingClientRect:()=>({top:20,bottom:60,left:Math.min(innerWidth,430),right:Math.min(innerWidth,430),height:40,width:0}),
    getAccountInfoSync:()=>({miniProgram:{envVersion:'release',version:'web-replica-20260918'}}),
    navigateTo:o=>navigate(o.url),switchTab:o=>navigate(o.url,'tab'),redirectTo:o=>navigate(o.url,'replace'),reLaunch:o=>navigate(o.url,'tab'),navigateBack:back,
    showTabBar:()=>{},setNavigationBarTitle:o=>{document.title=o.title+' · 知守';$('#page-title').textContent=o.title},
    pageScrollTo:o=>window.scrollTo({top:o.scrollTop||0,behavior:o.duration?'smooth':'instant'}),
    showToast:o=>{clearTimeout(toastTimer);$('#toast').textContent=o.title;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,o.duration||2600)},
    showLoading:o=>{$('#loading').textContent=o.title||'正在加载…';$('#loading').hidden=false},hideLoading:()=>$('#loading').hidden=true,
    showModal:modal,
    showActionSheet:o=>{const dialog=$('#modal');if(dialog.open)dialog.close();dialog.querySelector('h2').textContent='请选择';dialog.querySelector('p').textContent='';const actions=dialog.querySelector('.modal-actions');actions.replaceChildren();(o.itemList||[]).forEach((text,i)=>{const b=document.createElement('button');b.textContent=text;b.onclick=()=>{dialog.close();complete(o,{tapIndex:i})};actions.append(b)});dialog.oncancel=()=>complete(o,{errMsg:'cancel'},true);dialog.showModal()},
    setClipboardData:async o=>{try{await navigator.clipboard.writeText(o.data);complete(o,{});wx.showToast({title:'已复制'})}catch(_){wx.showModal({title:'复制链接',content:o.data,showCancel:false});complete(o,{errMsg:'无法自动复制'},true)}},
    makePhoneCall:o=>{if(/^[+\d -]+$/.test(o.phoneNumber))location.href='tel:'+o.phoneNumber},
    previewImage:o=>{const dialog=$('#image-preview');dialog.querySelector('img').src=safeUrl(o.current||(o.urls||[])[0]);dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal()},
    enableAlertBeforeUnload:o=>unloadMessage=o.message||'修改尚未保存，确定离开？',disableAlertBeforeUnload:()=>unloadMessage='',
    login:o=>{complete(o,{errMsg:'网页请通过公众号授权登录'},true);webLogin()},
    requestPayment:o=>{complete(o,{errMsg:'网页支付尚未接入，请联系工作人员'},true);wx.showToast({title:'网页支付尚未接入，请联系工作人员'})},
    chooseLocation:o=>complete(o,{errMsg:'请在网页中手动填写地区和详细地址'},true),
    chooseMedia:o=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const file=input.files[0];if(!file)return;const suffix=(file.name.match(/\.(png|jpe?g|webp|gif)$/i)||[])[1]||'jpg';const url=URL.createObjectURL(file)+'#upload.'+suffix;files.set(url,file);complete(o,{tempFiles:[{tempFilePath:url,size:file.size}]})};input.oncancel=()=>complete(o,{errMsg:'cancel'},true);input.click()},
    getFileSystemManager:()=>({readFile:async o=>{try{const file=files.get(o.filePath);if(!file)throw new Error('文件不可用');complete(o,{data:await file.arrayBuffer()})}catch(error){complete(o,{errMsg:error.message},true)}}}),
    request:o=>{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),o.timeout||30000);
      const isZion=o.url==='https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2';
      const method=o.method||'GET';const headers=isZion?{'content-type':'application/json'}:(o.header||{});
      const data=isZion?{...o.data,anonymous:!o.header?.Authorization}:o.data;
      fetch(isZion?'/api/h5?action=graphql':o.url,{method,headers,credentials:isZion?'same-origin':'omit',signal:controller.signal,body:method==='GET'?undefined:data instanceof ArrayBuffer?data:JSON.stringify(data)}).then(async response=>{const text=await response.text();let data;try{data=JSON.parse(text)}catch(_){data=text}complete(o,{statusCode:response.status,data,header:Object.fromEntries(response.headers)})}).catch(error=>complete(o,{errMsg:error.message},true)).finally(()=>clearTimeout(timeout));
      return{abort:()=>controller.abort()};
    },
    createVideoContext:id=>({play:()=>document.getElementById(id)?.play(),pause:()=>document.getElementById(id)?.pause(),stop:()=>{const video=document.getElementById(id);if(video){video.pause();video.currentTime=0}}}),
    createCanvasContext:id=>{const commands=[];return{setFillStyle:color=>commands.push(ctx=>ctx.fillStyle=color),fillRect:(...args)=>commands.push(ctx=>ctx.fillRect(...args)),draw:(_,callback)=>requestAnimationFrame(()=>{const canvas=document.getElementById(id);if(canvas){const ctx=canvas.getContext('2d');commands.forEach(command=>command(ctx))}callback?.()})}},
    scanCode:async o=>{
      if(/MicroMessenger/i.test(navigator.userAgent)){
        try{await prepareWechatShare(current);if(!window.wx?.scanQRCode)throw new Error('微信扫码组件不可用');window.wx.scanQRCode({needResult:1,scanType:['qrCode'],success:r=>complete(o,{result:r.resultStr}),fail:e=>{/cancel/i.test(e.errMsg||'')?complete(o,{errMsg:'cancel'},true):offerScanImage(o)},cancel:()=>complete(o,{errMsg:'cancel'},true)});}catch(error){offerScanImage(o)}
        return;
      }
      scanImage(o);
    },
    getRecorderManager:()=>({onStop(){},offStop(){},onError(fn){this.error=fn},offError(){},start(){this.error?.({errMsg:'网页录音编码尚未接入，请使用文字记录'})},stop(){}})
  };
  // Copy only a non-secret session marker into the compatibility storage. JWT stays HttpOnly.
  async function start(){
    try{const response=await fetch('/api/h5?action=session');const body=await response.json();if(body.ok&&body.data.loggedIn){session=body.data;storage.set('zionJwt','h5-session');storage.set('userInfo',{id:session.user.id,nickName:session.user.name,username:session.user.name,avatarUrl:session.user.avatarUrl})}}catch(_){/* Public browsing remains available. */}
    for(const item of source.config.tabBar.list){const button=document.createElement('button');button.dataset.route=item.pagePath;button.textContent=item.text;button.onclick=()=>navigate('/'+item.pagePath,'tab');$('#tabbar').append(button)}
    $('#back-button').onclick=back;
    const aliases={home:HOME,courses:'pages/plaza/plaza',mine:'pages/profile/profile'};
    const initial=location.hash.slice(1);
    const target=aliases[initial]||initial||HOME;
    navigate(parseRoute(target).route==='pages/profile/profile'?HOME:target,'replace');
    const error=new URLSearchParams(location.search).get('loginError');if(error)wx.showToast({title:error});
  }
  window.MiniHost={start,parseRoute,value,requireModule,get current(){return current},wx};
  start();
})();
