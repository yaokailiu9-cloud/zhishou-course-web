/* Browser host for the preserved mini-program. Source expressions are compiled at build time. */
(function () {
  const source = window.MiniSource;
  const wechatEntryUrl = location.href.split('#')[0];
  const buildVersion = new URL(document.currentScript.src).searchParams.get('v');
  const root = document.getElementById('page');
  const modules = {}, definitions = {}, files = new Map(), storage = new Map();
  const app = {globalData:{}};
  let current = null, renderedPage = null, stack = [], renderPending = false, toastTimer, unloadMessage = '', session = null, wechatSdkLoading = null, wechatShareReady = null, wechatSignedUrl = '';
  let composition = null, renderDeferred = false;
  // A poll or another setData must never detach an editor while the IME owns it.
  root.addEventListener('compositionstart',event=>{composition={page:current,element:event.target}});
  const finishComposition=event=>{
    if(composition?.element!==event.target)return;
    composition=null;
    if(renderDeferred){renderDeferred=false;schedule();}
  };
  root.addEventListener('compositionend',finishComposition);
  root.addEventListener('focusout',finishComposition);
  const HOME = 'pages/index/index';
  const INVITE_LOGIN = 'pages/invite-login/invite-login';
  let invitation=null,invitationError='',invitationNeedsLogin=false;
  const invitationTarget='/web/'+(location.hash||'#/pages/plaza/plaza');
  const webFeatures = source.config.webFeatures || {};
  const chatEntryVisible = webFeatures.chatEntryVisible === true;
  // Display-only gate: the chat route itself stays reachable; the backend still enforces every chat permission.
  const chatEntryAccountIds = (webFeatures.chatEntryAccountIds || []).map(String);
  let chatEntryAllowed = chatEntryVisible;
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
  // Browsers that sniff <video> and add their own download / cloud-save button. WeChat and WeCom never match.
  function videoDownloadBrowser(ua=navigator.userAgent){
    return !/MicroMessenger|wxwork/i.test(ua)&&/Quark\/|UCBrowser|UCWEB|UBrowser|baiduboxapp|baidubrowser|BaiduHD|bdbrowser|MQQBrowser|QQBrowser|SogouMobileBrowser|SogouSearch|MetaSr|2345Explorer|Mb2345Browser|LieBaoFast|LBBROWSER|QihooBrowser|QHBrowser|360SE|360EE|MiuiBrowser|HuaweiBrowser|HeyTapBrowser|OppoBrowser|VivoBrowser|Maxthon/i.test(ua);
  }
  // Course MP4s play through MediaSource as blob: segments where the browser supports it, so the element never carries a file URL to save.
  // Any failure switches back to the original direct src at the same position; iPhone (no MediaSource) keeps the direct src.
  const STREAM_CHUNK=2*1024*1024,STREAM_AHEAD=60,STREAM_BEHIND=30,attachedVideos=new Set();
  // Stop fetching for videos a render removed (another lesson, closed player, left the page).
  function releaseVideos(){for(const video of attachedVideos)if(!video.isConnected){attachedVideos.delete(video);video._stopStream?.()}}
  let mp4boxLoading=null;
  function loadMp4box(){
    if(window.MP4Box)return Promise.resolve();
    return mp4boxLoading||(mp4boxLoading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/web/replica/mp4box.js?v='+buildVersion;script.onload=()=>window.MP4Box?resolve():reject(new Error('mp4box missing'));script.onerror=()=>reject(new Error('mp4box load failed'));document.head.append(script)}).catch(error=>{mp4boxLoading=null;throw error}));
  }
  function canStreamVideo(src){
    try{return !!window.MediaSource?.isTypeSupported?.('video/mp4; codecs="avc1.42E01E"')&&/^https:\/\//i.test(src)&&/\.mp4$/i.test(new URL(src).pathname)}catch(_){return false}
  }
  function attachMedia(video){
    video._mediaAttached=true;const src=video._mediaSrc;
    if(videoDownloadBrowser())return;
    attachedVideos.add(video);
    if(src.startsWith('zshls://')){playHls(video,src).catch(()=>videoError(video));return}
    if(!canStreamVideo(src)){video.setAttribute('src',src);return}
    video._mediaStream=true;
    streamVideo(video,src).catch(()=>directVideo(video,src));
  }
  function directVideo(video,src){
    if(!video._mediaStream)return;
    video._mediaStream=false;video._stopStream?.();
    const time=video.currentTime||0,resume=!video.paused;
    video.setAttribute('src',src);
    if(time||resume)video.addEventListener('loadedmetadata',()=>{if(time)video.currentTime=time;if(resume)video.play().catch(()=>{})},{once:true});
  }
  // Encrypted HLS lessons (COURSE_VIEW_ACCESS hls): playlist and AES key stay in page memory and reach hls.js through
  // zshls:// and zskey:// addresses, so the network never carries a playable file or a key URL. Native players
  // (iPhone, no MediaSource) get short-lived same-origin URLs from the H5 relay instead.
  const hlsSources=new Map();let hlsLoading=null;
  function registerHls(lessonId,hls){
    if(!hls||!/^[1-9][0-9]*$/.test(String(lessonId))||!/^[0-9a-f]{32}$/i.test(hls.key||'')||typeof hls.playlist!=='string'||!hls.version)return '';
    const src='zshls://'+lessonId+'/'+hls.version;hlsSources.set(src,{lessonId:String(lessonId),version:hls.version,key:hls.key,playlist:hls.playlist});return src;
  }
  function loadHlsJs(){
    if(window.Hls)return Promise.resolve();
    return hlsLoading||(hlsLoading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/web/replica/hls.js?v='+buildVersion;script.onload=()=>window.Hls?resolve():reject(new Error('hls.js missing'));script.onerror=()=>reject(new Error('hls.js load failed'));document.head.append(script)}).catch(error=>{hlsLoading=null;throw error}));
  }
  function videoError(video){video._mediaStream=false;if(video.isConnected)video.dispatchEvent(new Event('error'))}
  async function playHls(video,src){
    const entry=hlsSources.get(src);if(!entry)return videoError(video);
    const native=!window.MediaSource&&typeof video.canPlayType==='function'&&!!video.canPlayType('application/vnd.apple.mpegurl');
    if(native){
      const response=await fetch('/api/h5?action=hls-session',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(entry)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok||!/^\/api\/hls\/[A-Za-z0-9_-]{24}\.m3u8$/.test(data.data?.url||''))return videoError(video);
      if(video.isConnected)video.setAttribute('src',data.data.url);
      return;
    }
    if(!window.MediaSource&&!window.ManagedMediaSource)return videoError(video);
    await loadHlsJs();
    const Hls=window.Hls;if(!video.isConnected)return;if(!Hls.isSupported())return videoError(video);
    const key=new Uint8Array(entry.key.match(/../g).map(byte=>parseInt(byte,16))).buffer;
    class MemoryLoader extends Hls.DefaultConfig.loader{
      load(context,config,callbacks){
        const playlist=context.url.startsWith('zshls:'),secret=context.url.startsWith('zskey:');
        if(!playlist&&!secret)return super.load(context,config,callbacks);
        const stats=this.stats,data=playlist?entry.playlist:key.slice(0);
        stats.loading.start=stats.loading.first=stats.loading.end=performance.now();stats.loaded=stats.total=playlist?data.length:data.byteLength;
        queueMicrotask(()=>callbacks.onSuccess({url:context.url,data},stats,context,null));
      }
    }
    const player=new Hls({loader:MemoryLoader,maxBufferLength:60,maxMaxBufferLength:120,backBufferLength:30});
    let recoveries=0;
    const stop=()=>{try{player.destroy()}catch(_){}};
    video._stopStream=stop;
    player.on(Hls.Events.ERROR,(event,data)=>{
      if(!data.fatal)return;
      if(recoveries<3&&data.type===Hls.ErrorTypes.NETWORK_ERROR){recoveries++;player.startLoad();return}
      if(recoveries<3&&data.type===Hls.ErrorTypes.MEDIA_ERROR){recoveries++;player.recoverMediaError();return}
      stop();videoError(video);
    });
    player.loadSource(src);player.attachMedia(video);
  }
  async function streamVideo(video,src){
    await loadMp4box();
    if(!video._mediaStream)return;
    const source=new MediaSource(),file=window.MP4Box.createFile(),tracks=[],url=URL.createObjectURL(source);
    let offset=0,ended=false,fetching=false,controller=null,ready=false,stopped=false,retries=0,stall=null;
    const boot=setTimeout(()=>{if(!ready)fail()},15000);
    function fail(){if(!stopped)directVideo(video,src)}
    function stop(){
      if(stopped)return;stopped=true;controller?.abort();clearTimeout(stall);clearTimeout(boot);URL.revokeObjectURL(url);
      video.removeEventListener('timeupdate',tick);video.removeEventListener('seeking',seek);video.removeEventListener('waiting',wait);video.removeEventListener('error',fail);
    }
    video._stopStream=stop;
    const ahead=()=>{const b=video.buffered,t=video.currentTime;for(let i=0;i<b.length;i++)if(b.start(i)<=t+0.3&&t<b.end(i))return b.end(i)-t;return 0};
    function finish(){if(ended&&ready&&source.readyState==='open'&&tracks.every(track=>!track.queue.length&&!track.buffer.updating)){try{source.endOfStream()}catch(_){}}}
    function flush(track){
      if(stopped||track.buffer.updating||!track.queue.length||source.readyState==='closed')return;
      const item=track.queue[0];
      try{track.buffer.appendBuffer(item.data);track.queue.shift();if(item.sample)file.releaseUsedSamples(track.id,item.sample)}
      catch(error){if(error.name==='QuotaExceededError')evict(5);else fail()}
    }
    function evict(behind){
      const keep=video.currentTime-behind;
      for(const track of tracks){const b=track.buffer.buffered;if(!track.buffer.updating&&b.length&&b.start(0)<keep-(behind===5?0:10)){try{track.buffer.remove(0,keep)}catch(_){}}}
    }
    async function pump(){
      if(stopped||fetching||ended)return;
      if(!video.isConnected)return stop();
      if(ready&&ahead()>STREAM_AHEAD)return;
      fetching=true;const start=offset,request=controller=new AbortController();
      try{
        const response=await fetch(src,{headers:{Range:'bytes='+start+'-'+(start+STREAM_CHUNK-1)},signal:request.signal,credentials:'omit'});
        if(response.status===416)ended=true;
        else if(response.status!==206)throw new Error('range');
        else{
          const data=await response.arrayBuffer();
          if(stopped)return;
          if(request.signal.aborted){fetching=false;return pump()}
          data.fileStart=start;
          const next=file.appendBuffer(data);
          if(data.byteLength<STREAM_CHUNK){ended=true;file.flush()}
          else offset=typeof next==='number'&&next>start?next:start+data.byteLength;
        }
        retries=0;
      }catch(error){
        fetching=false;
        if(stopped)return;
        if(request.signal.aborted)return pump();
        if(++retries<=3){setTimeout(pump,1000*retries);return}
        return fail();
      }
      fetching=false;finish();pump();
    }
    function seek(){
      if(!ready||stopped||ahead()>0.5)return;
      const target=file.seek(video.currentTime,true);
      tracks.forEach(track=>{track.queue=track.queue.filter(item=>!item.sample)});
      ended=false;offset=target.offset;controller?.abort();
      if(!fetching)pump();
    }
    function tick(){if(!video.isConnected)return stop();clearTimeout(stall);evict(STREAM_BEHIND);tracks.forEach(flush);pump()}
    function wait(){clearTimeout(stall);stall=setTimeout(()=>{if(!stopped&&!video.paused&&video.readyState<3)fail()},15000)}
    file.onError=fail;
    file.onReady=info=>{
      const list=[...info.videoTracks,...info.audioTracks],types=list.map(track=>(track.video?'video':'audio')+'/mp4; codecs="'+track.codec+'"');
      if(!info.videoTracks.length||!types.every(type=>MediaSource.isTypeSupported(type)))return fail();
      try{
        if(info.duration&&info.timescale)source.duration=info.duration/info.timescale;
        list.forEach((track,i)=>{const entry={id:track.id,buffer:source.addSourceBuffer(types[i]),queue:[]};entry.buffer.addEventListener('updateend',()=>{flush(entry);finish()});tracks.push(entry);file.setSegmentOptions(track.id,entry,{nbSamples:track.video?120:180})});
        file.initializeSegmentation().forEach(segment=>{segment.user.queue.push({data:segment.buffer});flush(segment.user)});
        ready=true;clearTimeout(boot);file.start();
      }catch(_){fail()}
    };
    file.onSegment=(id,entry,data,sample)=>{if(stopped)return;entry.queue.push({data,sample});flush(entry)};
    video.addEventListener('timeupdate',tick);video.addEventListener('seeking',seek);video.addEventListener('waiting',wait);video.addEventListener('error',fail);
    await new Promise((resolve,reject)=>{source.addEventListener('sourceopen',resolve,{once:true});video.src=url;setTimeout(()=>reject(new Error('sourceopen')),8000)});
    URL.revokeObjectURL(url);
    pump();
  }
  function dispatch(page, name, element, native, detail={}) {
    if(!name||typeof page[name]!=='function')return;
    const target={dataset:{...element.dataset},id:element.id};
    try {Promise.resolve(page[name]({type:native?.type||'tap',currentTarget:target,target,detail})).catch(error=>wx.showToast({title:error.message||'操作未完成'}))}
    catch(error){console.error(error);wx.showToast({title:error.message||'操作未完成'})}
  }
  const pickerMemory=new Map();
  const pad2=n=>String(n).padStart(2,'0');
  const dateText=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  const parseDate=text=>{const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(text||''));return m?new Date(+m[1],+m[2]-1,+m[3]):null};
  const WEEK='日一二三四五六';
  let pickerClose=null;
  // 网页版日期/时间选择面板：挂在 #page 之外，选择过程中页面不重绘；点“确定”才回调一次。
  function openDateTimePicker({mode,value,start,end,title,onConfirm}){
    if(pickerClose)pickerClose();
    const isDate=mode==='date',now=new Date(),todayText=dateText(now);
    const inRange=v=>(!start||v>=start)&&(!end||v<=end);
    let selected=value&&inRange(value)?value:'';
    if(isDate&&!selected){const fallback=start&&todayText<start?start:end&&todayText>end?end:todayText;selected=fallback;}
    const initial=isDate?parseDate(selected)||now:now;let viewYear=initial.getFullYear(),viewMonth=initial.getMonth();
    let hour=selected&&!isDate?selected.slice(0,2):'',minute=selected&&!isDate?selected.slice(3,5):'';
    const mask=document.createElement('div');mask.className='web-sheet-mask';
    const sheet=document.createElement('div');sheet.className='web-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',title);sheet.tabIndex=-1;
    mask.append(sheet);
    const result=()=>isDate?selected:(hour&&minute?hour+':'+minute:'');
    const pretty=()=>{const v=result();if(!v)return isDate?'请选择日期':'请选择小时和分钟';if(!isDate)return v;const d=parseDate(v);return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 周'+WEEK[d.getDay()]};
    function dateBody(){
      const lo=start?+start.slice(0,4):end?now.getFullYear()-100:now.getFullYear()-5,hi=end?+end.slice(0,4):now.getFullYear()+10;
      const years=[];for(let y=Math.min(lo,viewYear);y<=Math.max(hi,viewYear);y++)years.push(y);
      const monthFirst=new Date(viewYear,viewMonth,1),days=new Date(viewYear,viewMonth+1,0).getDate();
      const prevOk=!start||dateText(new Date(viewYear,viewMonth,0))>=start,nextOk=!end||dateText(new Date(viewYear,viewMonth+1,1))<=end;
      let cells='';for(let i=0;i<monthFirst.getDay();i++)cells+='<span></span>';
      for(let d=1;d<=days;d++){const v=dateText(new Date(viewYear,viewMonth,d));
        cells+=`<button type="button" class="web-day${v===selected?' on':''}${v===todayText?' today':''}" data-day="${v}"${inRange(v)?'':' disabled'}>${d}</button>`;}
      return `<div class="web-cal-head"><button type="button" data-act="prev" aria-label="上个月"${prevOk?'':' disabled'}>‹</button>
        <select data-act="year" aria-label="年份">${years.map(y=>`<option value="${y}"${y===viewYear?' selected':''}>${y}年</option>`).join('')}</select>
        <select data-act="month" aria-label="月份">${Array.from({length:12},(_,m)=>`<option value="${m}"${m===viewMonth?' selected':''}>${m+1}月</option>`).join('')}</select>
        <button type="button" data-act="next" aria-label="下个月"${nextOk?'':' disabled'}>›</button></div>
        <div class="web-cal-week">${[...WEEK].map(w=>`<span>${w}</span>`).join('')}</div><div class="web-cal-grid">${cells}</div>`;
    }
    function timeBody(){
      const minutes=[];for(let m=0;m<60;m+=5)minutes.push(pad2(m));if(minute&&!minutes.includes(minute)){minutes.push(minute);minutes.sort();}
      const ok=v=>inRange(v);
      const hours=Array.from({length:24},(_,h)=>pad2(h)).map(h=>`<button type="button" class="web-time${h===hour?' on':''}" data-hour="${h}"${minutes.some(m=>ok(h+':'+m))?'':' disabled'}>${h}</button>`).join('');
      const mins=minutes.map(m=>`<button type="button" class="web-time${m===minute?' on':''}" data-minute="${m}"${!hour||ok(hour+':'+m)?'':' disabled'}>${m}</button>`).join('');
      return `<p class="web-time-label">时</p><div class="web-time-grid">${hours}</div><p class="web-time-label">分</p><div class="web-time-grid">${mins}</div>`;
    }
    function draw(){
      const v=result();
      sheet.innerHTML=`<div class="web-sheet-bar"><button type="button" data-act="cancel">取消</button><strong>${title}</strong><button type="button" data-act="ok" class="web-sheet-ok"${v&&inRange(v)?'':' disabled'}>确定</button></div>
        <p class="web-sheet-value${v?'':' empty'}">${pretty()}</p>${isDate?dateBody():timeBody()}`;
    }
    const restoreOverflow=document.body.style.overflow;
    function close(){mask.remove();document.body.style.overflow=restoreOverflow;document.removeEventListener('keydown',onKey,true);pickerClose=null;}
    function onKey(event){if(event.key==='Escape'){event.preventDefault();close();}}
    sheet.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b||b.disabled)return;
      if(b.dataset.day)selected=b.dataset.day;
      else if(b.dataset.hour){hour=b.dataset.hour;if(minute&&!inRange(hour+':'+minute))minute='';}
      else if(b.dataset.minute)minute=b.dataset.minute;
      else if(b.dataset.act==='prev'||b.dataset.act==='next'){const d=new Date(viewYear,viewMonth+(b.dataset.act==='next'?1:-1),1);viewYear=d.getFullYear();viewMonth=d.getMonth();}
      else if(b.dataset.act==='cancel'){close();return}
      else if(b.dataset.act==='ok'){const v=result();close();if(v)onConfirm(v);return}
      draw();
    });
    sheet.addEventListener('change',event=>{const t=event.target;if(t.dataset.act==='year')viewYear=+t.value;if(t.dataset.act==='month')viewMonth=+t.value;draw();});
    mask.addEventListener('click',event=>{if(event.target===mask)close()});
    document.addEventListener('keydown',onKey,true);
    draw();document.body.append(mask);document.body.style.overflow='hidden';pickerClose=close;
    try{sheet.focus({preventScroll:true})}catch(_){}
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
      let el=document.createElement(tag);
      const listeners=[];
      const on=(type,handler)=>{listeners.push([type,handler]);el.addEventListener(type,handler)};
      el._miniListeners=listeners;el._miniRetarget=target=>{el=target};
      const values={};for(const [key,parts]of Object.entries(attrs))values[key]=value(parts,scope);
      for(const [key,val]of Object.entries(values)){
        if(key.startsWith('wx:')||/^(bind|catch)/.test(key)||['range','range-key','mode','value','open-type','form-type','url','scroll-into-view','scroll-top','canvas-id','type'].includes(key))continue;
        if(['disabled','hidden','controls','autoplay','loop','muted','scroll-y','scroll-x'].includes(key)){if(val!==false&&val!=null&&val!=='false'){el.setAttribute(key,'');if(key in el)el[key]=true}continue}
        if(key==='src'||key==='poster'){if(tag==='video'&&key==='src'&&/^zshls:\/\/\d+\/\d+$/.test(String(val))){el._mediaSrc=String(val);continue}if(safeUrl(val)){if(tag==='video'&&key==='src')el._mediaSrc=safeUrl(val);else el.setAttribute(key,safeUrl(val))}continue}
        if(key==='style'){el.style.cssText=String(val||'').replace(/(-?\d+(?:\.\d+)?)rpx/g,'calc($1 * var(--rpx))');continue}
        if(val!=null)el.setAttribute(key,String(val));
      }
      if(tag==='img'){el.alt=values['aria-label']||'';el.style.objectFit=values.mode==='aspectFit'?'contain':'cover';if(values.mode==='widthFix'){el.style.height='auto';el.style.width='100%'}}
      if(tag==='button')el.type=values['form-type']==='submit'?'submit':'button';
      if(tag==='input'||tag==='textarea'){
        const identity=JSON.stringify([tag,attrs.value,values.bindinput||values['bind:input'],values.id,values.name,Object.entries(values).filter(([key])=>key.startsWith('data-'))]);
        const occurrence=page._inputKeys.get(identity)||0;page._inputKeys.set(identity,occurrence+1);
        el.dataset.focusKey=identity+':'+occurrence;
        if(tag==='input'){el.type=['number','digit'].includes(values.type)?'text':values.type==='password'?'password':'text';if(['number','digit'].includes(values.type))el.inputMode='decimal'}
        el.value=values.value??'';
      }
      if(tag==='canvas'){el.id=values['canvas-id']||values.id;el.width=256;el.height=256}
      // Course videos: drop the browser's own download entry and long-press save menu; speed, casting and fullscreen stay available.
      if(tag==='video'){el.setAttribute('controlslist','nodownload');el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');el.setAttribute('x5-playsinline','');el.draggable=false;on('contextmenu',event=>event.preventDefault())}
      if(tag==='scroll-view'&&values['scroll-y']!==undefined)el.setAttribute('scroll-y','');
      if(tag==='scroll-view'&&values['scroll-x']!==undefined)el.setAttribute('scroll-x','');
      const eventMap={tap:'click',input:'input',change:'change',confirm:'keydown',submit:'submit',error:'error',load:'load',blur:'blur',focus:'focus',longpress:'contextmenu',scroll:'scroll',scrolltolower:'scroll',touchstart:'touchstart',touchend:'touchend'};
      for(const [key,handler]of Object.entries(values)){
        const match=key.match(/^(bind|catch):?(.+)$/);if(!match||!eventMap[match[2]])continue;
        const emit=event=>{
          if(match[2]==='error'&&el._mediaStream)return;
          if(match[1]==='catch')event.stopPropagation();
          if(match[2]==='confirm'&&(event.key!=='Enter'||event.isComposing||event.keyCode===229||composition?.element===el))return;
          if(match[2]==='scrolltolower'&&el.scrollTop+el.clientHeight<el.scrollHeight-30)return;
          if(match[2]==='submit'||match[2]==='longpress')event.preventDefault();
          const detail={value:el.value,width:el.naturalWidth,height:el.naturalHeight};
          if(match[2]==='scroll')Object.assign(detail,{scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight});
          if(match[2]==='submit')detail.value=Object.fromEntries(new FormData(el));
          dispatch(page,handler,el,event,detail);
        };
        if(match[2]==='input'&&(tag==='input'||tag==='textarea')){
          let composing=false;
          on('compositionstart',()=>{composing=true});
          on('compositionend',event=>{composing=false;emit(event)});
          on('input',event=>{if(!composing&&!event.isComposing)emit(event)});
        }else on(eventMap[match[2]],emit);
        if(match[2]==='tap'&&!values.role&&!['button','input','textarea','navigator'].includes(tag)){el.setAttribute('role','button');el.tabIndex=0;on('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})}
      }
      if(tag==='navigator'){
        el.setAttribute('role','link');el.tabIndex=0;
        const open=()=>navigate(values.url,values['open-type']==='switchTab'?'tab':'push');
        on('click',open);on('keydown',e=>{if(e.key==='Enter')open()});
      }
      if(values['open-type']==='chooseAvatar')on('click',()=>wx.chooseMedia({mediaType:['image'],success:r=>dispatch(page,values.bindchooseavatar,el,null,{avatarUrl:r.tempFiles[0].tempFilePath})}));
      if(values['open-type']==='share')on('click',()=>share(page));
      children(node.children,scope,el,page);
      if(node.tag==='picker'){
        el.classList.add('web-picker');
        if(['date','time'].includes(values.mode)){
          // 日期/时间用页面外的底部面板选择，确认后才 setData，避免整页重绘打断原生控件。
          const memoryKey=[page.route,values.bindchange,values.mode,values['data-key']||''].join('|');
          const current=values.value||pickerMemory.get(memoryKey)||'';
          const hidden=document.createElement('input');hidden.type='hidden';hidden.className='web-picker-control';hidden.value=current;if(values.name)hidden.name=values.name;
          el.append(hidden);el.setAttribute('role','button');el.tabIndex=values.disabled?-1:0;if(values.disabled)el.setAttribute('aria-disabled','true');
          const label=el.textContent.trim()||(values.mode==='date'?'选择日期':'选择时间');el.setAttribute('aria-label',label);
          const open=event=>{event.preventDefault();if(values.disabled)return;
            openDateTimePicker({mode:values.mode,value:current,start:values.start||'',end:values.end||'',title:label,
              onConfirm:value=>{pickerMemory.set(memoryKey,value);dispatch(page,values.bindchange,el,{type:'change'},{value})}});};
          on('click',open);on('keydown',event=>{if(event.key==='Enter'||event.key===' ')open(event)});
        }else{
          const select=document.createElement('select');select.className='web-picker-control';select.disabled=!!values.disabled;
          select.setAttribute('aria-label',el.textContent.trim()||'选择');
          (values.range||[]).forEach((item,i)=>{const option=document.createElement('option');option.value=i;option.textContent=values['range-key']?item[values['range-key']]:item;select.append(option)});select.value=values.value||0;
          select.addEventListener('change',event=>{event.stopPropagation();dispatch(page,values.bindchange,el,event,{value:select.value})});
          el.append(select);
        }
      }
      parent.append(el);
      if(values['scroll-into-view'])requestAnimationFrame(()=>{const target=document.getElementById(values['scroll-into-view']);if(target)target.scrollIntoView({block:'nearest'})});
    }
  }
  function replaceKeepingEditor(fragment,focused){
    const key=focused?.dataset.focusKey;
    if(key==null||renderedPage!==current)return false;
    const fresh=[...fragment.querySelectorAll('[data-focus-key]')].find(el=>el.dataset.focusKey===key);
    if(!fresh)return false;
    const pairs=[];let old=focused,next=fresh;
    while(old!==root&&next!==fragment){
      if(!old||!next||old.tagName!==next.tagName)return false;
      pairs.push([old,next]);old=old.parentNode;next=next.parentNode;
    }
    if(old!==root||next!==fragment)return false;
    pairs.push([root,fragment]);
    // Keep the editor AND its ancestors attached. Moving the textarea alone
    // also closes mobile keyboards and loses native composition/undo state.
    for(let i=0;i<pairs.length;i++){
      const [target,replacement]=pairs[i];
      if(target!==root){
        for(const attr of [...target.attributes])if(!replacement.hasAttribute(attr.name))target.removeAttribute(attr.name);
        for(const attr of [...replacement.attributes])if(target.getAttribute(attr.name)!==attr.value)target.setAttribute(attr.name,attr.value);
        for(const [type,handler]of target._miniListeners||[])target.removeEventListener(type,handler);
        replacement._miniRetarget?.(target);
        target._miniListeners=replacement._miniListeners||[];
        for(const [type,handler]of target._miniListeners)target.addEventListener(type,handler);
      }
      if(i===0){if(target.value!==replacement.value)target.value=replacement.value;continue;}
      const kept=pairs[i-1][0],placeholder=pairs[i-1][1];
      // Replace siblings in place without ever removing the focused branch.
      for(const child of [...target.childNodes])if(child!==kept)child.remove();
      let after=false;
      for(const child of [...replacement.childNodes]){
        if(child===placeholder){after=true;continue;}
        if(after)target.append(child);else target.insertBefore(child,kept);
      }
    }
    return true;
  }
  function render() {
    renderPending=false;if(!current)return;
    if(composition?.page===current&&composition.element.isConnected){renderDeferred=true;return;}
    composition=null;renderDeferred=false;
    const focused=document.activeElement,focusKey=focused?.dataset.focusKey,start=focused?.selectionStart,end=focused?.selectionEnd;
    const scrollers=[...root.querySelectorAll('scroll-view')].map(el=>({id:el.id,top:el.scrollTop}));
    const canvases=renderedPage===current?new Map([...root.querySelectorAll('canvas[id]')].map(el=>[el.id,el])):new Map();
    const videos=renderedPage===current?new Map([...root.querySelectorAll('video[id]')].map(el=>[el.id,el])):new Map();
    const fragment=document.createDocumentFragment();current._inputKeys=new Map();
    children(source.pages[current.route].tree,current.data,fragment,current);
    // setData rerenders the DOM; keep already drawn ticket/referral QR bitmaps.
    for(const placeholder of fragment.querySelectorAll('canvas[id]')){const drawn=canvases.get(placeholder.id);if(drawn){drawn.className=placeholder.className;drawn.setAttribute('style',placeholder.getAttribute('style')||'');placeholder.replaceWith(drawn);}}
    // Keep the course video element too, so a setData during playback never restarts the lesson.
    for(const placeholder of fragment.querySelectorAll('video[id]')){const playing=videos.get(placeholder.id);if(playing&&playing._mediaSrc===placeholder._mediaSrc){playing.className=placeholder.className;playing.setAttribute('style',placeholder.getAttribute('style')||'');placeholder.replaceWith(playing);}}
    const keptEditor=replaceKeepingEditor(fragment,focused);
    if(!keptEditor)root.replaceChildren(fragment);root.dataset.route=current.route;
    root.querySelectorAll('video').forEach(video=>{if(video._mediaSrc&&!video._mediaAttached)attachMedia(video)});releaseVideos();
    renderedPage=current;
    if(current.route==='pages/chat/chat'){
      const composer=root.querySelector('.chat-composer');
      if(composer){
        const input=composer.querySelector('textarea');
        if(input){input.rows=1;input.setAttribute('aria-label','聊天消息');
          requestAnimationFrame(()=>{if(input.isConnected)input.style.height=Math.min(144,Math.max(44,input.scrollHeight))+'px'});
        }
      }
    }
    if(current.route==='pages/profile/profile'){
      const subtitle=root.querySelector('.login-subtitle');if(subtitle)subtitle.textContent='在微信内打开，通过公众号授权登录';
      const benefits=root.querySelector('.login-benefits');if(benefits)benefits.textContent='登录后可报名公开课、查看自己的方案和聊天记录；昵称和头像可在个人资料中修改。';
      const avatar=root.querySelector('.login-avatar-picker');if(avatar){avatar.disabled=true;avatar.setAttribute('aria-label','知守头像')}
    }
    if(!keptEditor&&focusKey!=null){const next=[...root.querySelectorAll('[data-focus-key]')].find(el=>el.dataset.focusKey===focusKey);if(next){next.focus({preventScroll:true});try{next.setSelectionRange(start,end)}catch(_){}}}
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
  function renderTabbar(){
    const bar=$('#tabbar');bar.replaceChildren();
    for(const item of source.config.tabBar.list){
      if(item.pagePath==='pages/chat/chat'&&!chatEntryAllowed)continue;
      const button=document.createElement('button');button.dataset.route=item.pagePath;button.textContent=item.text;button.onclick=()=>navigate('/'+item.pagePath,'tab');
      button.setAttribute('aria-current',current&&current.route===item.pagePath?'page':'false');bar.append(button);
    }
  }
  async function refreshChatEntry(){
    const accountId=session&&session.user?String(session.user.id):'';let allowed=chatEntryVisible;
    if(!allowed&&accountId){
      if(chatEntryAccountIds.includes(accountId))allowed=true;
      else if(webFeatures.chatEntryForManagers===true){
        try{const zion=requireModule('utils/zion');const provider=await zion.getServiceProviderByAccount(accountId);allowed=zion.isManagerProvider(provider)&&String(provider.accountId)===accountId;}catch(_){allowed=false}
      }
      if(!session||String(session.user.id)!==accountId)return;
    }
    if(allowed!==chatEntryAllowed){chatEntryAllowed=allowed;renderTabbar()}
  }
  function parseRoute(url){const raw=String(url||'').replace(/^#?\/?/,'');const [path,query]=raw.split('?');return{route:source.pages[path]?path:HOME,options:Object.fromEntries(new URLSearchParams(query))}}
  function navigate(url,mode='push',fromHistory=false){
    let {route,options}=parseRoute(url);
    if(invitationError||(invitation&&!storage.get('zionJwt'))){route=INVITE_LOGIN;options={};}
    if(!fromHistory&&unloadMessage){wx.showModal({title:'尚未保存',content:unloadMessage,success:r=>{if(r.confirm){unloadMessage='';navigate(url,mode)}}});return}
    if(current){current._scroll=window.scrollY;lifecycle(current,'onHide')}
    if(mode==='tab')refreshChatEntry();
    if(mode==='tab'||mode==='replace'){for(const old of (mode==='tab'?stack:stack.slice(-1)))lifecycle(old,'onUnload');stack=mode==='tab'?[]:stack.slice(0,-1)}
    requireModule(route);const page={...definitions[route],data:clone(definitions[route].data||{}),route,options};
    page.setData=(patch,cb)=>setData(page,patch,cb);
    // Browser identity is an HttpOnly server session, never a mini-program login code.
    if(route==='pages/profile/profile'){
      page.loginByWechat=webLogin;
      const originalLogout=page.logout;
      page.logout=async function(){try{const r=await fetch('/api/h5?action=logout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});if(!r.ok)throw new Error();session=null;invitation=null;invitationError='';referralContext=null;refreshChatEntry();const clean=new URL(location.href);clean.searchParams.delete('ref');history.replaceState({},'',clean.pathname+clean.search+clean.hash);originalLogout.call(this)}catch(_){wx.showToast({title:'退出未完成，请重试'})}};
    }
    if(route==='pages/consultation-detail/consultation-detail')page.startRecording=()=>wx.showModal({title:'网页录音尚未开放',content:'本次已复刻录音与总结入口。网页录音编码尚待接入，目前可以使用文字沟通总结及手动记录。',showCancel:false});
    page.setCustomNav=function(){this.setData({statusBarHeight:12,navHeight:76,navPaddingRight:0})};
    stack.push(page);showPage(page);
    if(!fromHistory){const hash=route===INVITE_LOGIN?'#'+(invitation?.returnTo||invitationTarget).split('#')[1]:'#/'+route+(Object.keys(options).length?'?'+new URLSearchParams(options):'');history[mode==='replace'?'replaceState':'pushState']({route},'',location.pathname+location.search+hash)}
    lifecycle(page,'onLoad',options);lifecycle(page,'onShow').then(()=>{if(page===current&&[HOME,'pages/plaza/plaza','pages/public-class/public-class','pages/checkin/checkin'].includes(page.route))prepareWechatShare(page).catch(()=>false);});queueMicrotask(()=>lifecycle(page,'onReady'));
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
    if(invitationError&&!invitationNeedsLogin){wx.showToast({title:invitationError});return;}
    if(invitation&&!/MicroMessenger/i.test(navigator.userAgent)){wx.showModal({title:'请在微信中登录',content:'请用微信扫一扫，或长按识别收到的报名二维码。',showCancel:false});return;}
    if(!/MicroMessenger/i.test(navigator.userAgent)){wx.showModal({title:'微信登录',content:'请将当前网页链接在微信中打开，再点击微信登录。',confirmText:'复制链接',success:r=>{if(r.confirm)wx.setClipboardData({data:location.href})}});return}
    const ref=new URLSearchParams(location.search).get('ref')||'';
    location.href='/api/h5?action=login&ref='+encodeURIComponent(ref)+'&return='+encodeURIComponent(invitation?.returnTo||'/web/#/'+HOME);
  }
  let referralContext = null;
  async function getReferralContext(classId,target){
    const identity=session;
    const response=await fetch('/api/h5?action=referral-context&ref='+encodeURIComponent(new URLSearchParams(location.search).get('ref')||'')+'&classId='+encodeURIComponent(classId||'')+'&target='+encodeURIComponent(target||''));
    const body=await response.json();
    if(identity!==session)throw new Error('登录身份已变化，请重试');
    if(!response.ok||!body.ok)throw new Error(body.message||'报名信息加载失败，请刷新重试');
    referralContext={...body.data,identity,classId:String(classId||'')};return body.data;
  }
  function shareClassId(page){
    return (page.onShareAppMessage?.().path||'').match(/^\/pages\/public-class-detail\/public-class-detail\?id=([1-9][0-9]*)$/)?.[1]||'';
  }
  function shareDetails(page){
    const info=page.onShareAppMessage?.()||{};const url=new URL('/web/',location.origin);url.hash='/'+(info.path||page.route).replace(/^\//,'');
    const videoId=info.path?.match(/^\/pages\/course-detail\/course-detail\?id=([1-9][0-9]*)$/)?.[1];if(videoId)url.searchParams.set('course',videoId);
    const ref=!videoId&&referralContext?.identity===session&&referralContext?.canInvite&&referralContext.classId===shareClassId(page)?referralContext.referralToken:'';if(ref)url.searchParams.set('ref',ref);
    const image=info.imageUrl?new URL(info.imageUrl,location.origin).href:'';
    return {info,url,title:info.title||'知守',desc:info.desc||'查看课程介绍、开课时间与报名信息',image};
  }
  function loadWechatSdk(){
    if(window.wx?.config)return Promise.resolve(true);if(wechatSdkLoading)return wechatSdkLoading;
    wechatSdkLoading=new Promise((resolve,reject)=>{const script=document.createElement('script');const timer=setTimeout(()=>reject(new Error('微信组件加载超时')),12000);script.src='https://res.wx.qq.com/open/js/jweixin-1.6.0.js';script.onload=()=>{clearTimeout(timer);resolve(true)};script.onerror=()=>{clearTimeout(timer);reject(new Error('微信组件加载失败'))};document.head.append(script)}).catch(error=>{wechatSdkLoading=null;throw error});
    return wechatSdkLoading;
  }
  function shareProblem(page,error){
    const message=String(error?.errMsg||error?.message||'微信未返回卡片配置结果').slice(0,180);
    const reason=/invalid signature/i.test(message)?'微信签名验证未通过':/invalid url domain|url not|domain/i.test(message)?'当前域名未通过微信 JS 接口验证':/permission|not exist|not support|offline verifying/i.test(message)?'微信未开放当前网页的封面分享接口':'微信封面分享配置未完成';
    page.setData({shareError:reason+'（'+message+'）',shareReady:false});
    console.warn('课程链接卡片配置失败',message);
  }
  async function prepareWechatShare(page){
    if(!/MicroMessenger/i.test(navigator.userAgent))return false;await loadWechatSdk();
    const classId=shareClassId(page);
    if(page.route!=='pages/course-detail/course-detail'&&session&&(referralContext?.identity!==session||referralContext?.classId!==classId))await getReferralContext(classId);
    const details=shareDetails(page),videoCourse=page.route==='pages/course-detail/course-detail';
    // A shared web URL must identify the course before # so WeChat can fetch its cover.
    if(videoCourse && details.info.path?.includes('?id=') && new URL(location.href).searchParams.get('course')!==String(page.data.course?.id))history.replaceState(null,'',details.url.href);
    // iOS validates against the URL that opened this document; Android uses the current URL.
    const signedUrl=/iPhone|iPad|iPod/i.test(navigator.userAgent)?wechatEntryUrl:(videoCourse?details.url.href.split('#')[0]:location.href.split('#')[0]);
    if(!wechatShareReady||wechatSignedUrl!==signedUrl){
      wechatSignedUrl=signedUrl;
      wechatShareReady=(async()=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);let response,result;
        try{response=await fetch('/api/h5?action=share-signature&url='+encodeURIComponent(signedUrl),{credentials:'same-origin',signal:controller.signal});result=await response.json();}finally{clearTimeout(timeout)}
        if(!response.ok||!result.ok)throw new Error(result.message||'微信分享签名请求失败');
        await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('微信组件配置超时')),12000);window.wx.ready(()=>{clearTimeout(timer);resolve()});window.wx.error(error=>{clearTimeout(timer);reject(new Error(error?.errMsg||error?.message||'微信组件验证失败'))});window.wx.config({...result.data,debug:false,jsApiList:['updateAppMessageShareData','updateTimelineShareData','onMenuShareAppMessage','scanQRCode']})});return true;})().catch(error=>{if(wechatSignedUrl===signedUrl)wechatShareReady=null;throw error});
    }
    await wechatShareReady;
    if(page!==current)return false;
    const data={title:details.title,desc:details.desc,link:details.url.href,imgUrl:details.image};
    if(videoCourse){
      try{
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new Error('课程封面接口响应超时')),8000);
          const finish=error=>{clearTimeout(timer);error?reject(error):resolve()};
          try{
            if(typeof window.wx.updateAppMessageShareData!=='function')throw new Error('updateAppMessageShareData not supported');
            window.wx.updateAppMessageShareData({...data,success:()=>finish(),fail:error=>finish(new Error(error?.errMsg||'微信拒绝设置分享封面'))});
          }catch(error){finish(error)}
        });
      }catch(error){
        // Official compatibility listener still sends a web link with title and cover.
        // Registering it does not confirm that the client has sent a message.
        try{window.wx.onMenuShareAppMessage?.({...data,fail:failure=>shareProblem(page,failure)})}catch(_){}
        throw error;
      }
      try{window.wx.updateTimelineShareData?.({title:details.title,link:details.url.href,imgUrl:details.image})}catch(_){}
    }else{
      try{window.wx.updateAppMessageShareData?.(data);window.wx.updateTimelineShareData?.({title:details.title,link:details.url.href,imgUrl:details.image})}catch(error){console.warn('微信分享菜单更新失败',error)}
    }
    return true;
  }
  function showReferralPoster({url,title,name='',kind='course'}){
    const questionnaire=kind==='questionnaire';
    const image=requireModule('utils/referralPoster').poster(document.createElement('canvas'),{url,title,name,label:questionnaire?'知守 · 简易方案梳理':'知守 · 课程邀请',tip:questionnaire?'扫码后微信登录，按页面金额支付并填写问卷':'微信扫一扫 / 长按识别二维码',afterTip:questionnaire?'登录后支付并填写，推荐信息自动保留':undefined});
    const dialog=$('#image-preview');if(dialog.open)dialog.close();
    dialog.classList.add('is-referral-poster');
    dialog.querySelector('img').src=image;dialog.querySelector('img').alt=questionnaire?'简易方案梳理二维码':'课程报名二维码';
    let tip=dialog.querySelector('p');if(!tip){tip=document.createElement('p');dialog.insertBefore(tip,dialog.querySelector('img'));}
    tip.textContent='长按保存这张图片，再发送给微信好友或群。'+(questionnaire?'对方扫码登录后，按页面显示金额支付并填写问卷。':(/[?&]ref=/.test(url)?'对方扫码登录后，推荐信息会继续保留。':'对方扫码后可查看课程并报名。'));
    dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();
    return image;
  }
  async function share(page){
    if(page.route==='pages/course-detail/course-detail'){
      if(!page.data.showSharePanel){page.openSharePanel();return;}
      if(!/MicroMessenger/i.test(navigator.userAgent)){
        page.setData({shareHint:'请在微信内打开后使用微信转发'});return;
      }
      // The native WeChat menu can always send the current course URL. Do not
      // hide that menu behind optional cover configuration or an endless retry.
      page.setData({showShareGuide:true,sharePreparing:false,shareHint:'通过微信菜单发送本课程链接'});
      prepareWechatShare(page).then(ready=>{if(ready)page.setData({shareReady:true,shareError:'',shareHint:'课程封面链接卡片已准备好'});}).catch(error=>shareProblem(page,error));
      return;
    }
    try{await getReferralContext(shareClassId(page));}catch(_){if(session){wx.showToast({title:'分享信息加载失败，请重试'});return;}}
    const details=shareDetails(page);try{showReferralPoster({url:details.url.href,title:details.title,name:referralContext?.canInvite?session?.user?.name:''});}
    catch(_){wx.showToast({title:'报名二维码生成失败，请重试'});}
  }
  async function decodeScanImage(file){
    if(!window.jsQR)throw new Error('识码组件未加载，请刷新重试或输入入场码。');
    const url=URL.createObjectURL(file),image=document.createElement('img');
    try{
      await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('无法读取照片，请重新拍摄或输入入场码。'));image.src=url});
      const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
      if(!width||!height)throw new Error('照片无效，请重新拍摄或输入入场码。');
      const scale=Math.min(1,1600/Math.max(width,height)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
      const context=canvas.getContext('2d');if(!context)throw new Error('无法读取照片，请重新拍摄或输入入场码。');
      context.drawImage(image,0,0,canvas.width,canvas.height);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height);
      const result=window.jsQR(pixels.data,pixels.width,pixels.height);
      if(!result)throw new Error('未识别到二维码，请将整个入场码拍清楚后重试。');
      return result.data;
    }finally{URL.revokeObjectURL(url)}
  }
  function scanImage(o){
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.capture='environment';
    input.style.cssText='position:fixed;opacity:0;width:1px;height:1px;pointer-events:none';document.body.append(input);
    let done=false;const finish=(result,failed)=>{if(done)return;done=true;input.remove();complete(o,result,failed)};
    input.onchange=async()=>{const file=input.files?.[0];if(!file){finish({errMsg:'cancel'},true);return}
      try{finish({result:await decodeScanImage(file)},false)}catch(error){finish({errMsg:error.message||'识码失败，请重试或输入入场码。'},true)}};
    input.oncancel=()=>finish({errMsg:'cancel'},true);
    try{input.click()}catch(_){finish({errMsg:'无法打开相机，请输入入场码。'},true)}
  }
  function scanErrorReason(error){
    const message=String(error?.errMsg||error?.message||error||'未知原因').replace(/https?:\/\/[^\s)]+/gi,'[链接]').slice(0,160);
    if(/invalid.*url domain|url.*not.*domain/i.test(message))return 'JS 接口安全域名未通过（'+message+'）';
    if(/invalid.*signature/i.test(message))return '签名校验未通过（'+message+'）';
    return message;
  }
  function offerScanImage(o,error,stage='微信组件准备'){modal({title:'使用拍照识码',content:'微信扫一扫暂不可用。'+stage+'：'+scanErrorReason(error)+'。可以拍摄用户的个人入场二维码继续签到，请保持画面清晰。',confirmText:'拍照识码',success:r=>{if(r.confirm)scanImage(o);else complete(o,{errMsg:'cancel'},true)}})}
  async function scanLiveCamera(o,nativeError,stage){
    if(!navigator.mediaDevices?.getUserMedia||!window.jsQR){offerScanImage(o,nativeError,stage);return}
    const dialog=$('#live-scanner'),video=dialog.querySelector('video'),canvas=document.createElement('canvas'),context=canvas.getContext('2d');
    if(!context){offerScanImage(o,nativeError,stage);return}
    let done=false,stream=null,frame=0,lastRead=-Infinity;
    const stop=()=>{done=true;if(frame)window.cancelAnimationFrame?.(frame);stream?.getTracks().forEach(track=>track.stop());video.srcObject=null;if(dialog.open)dialog.close()};
    dialog.querySelector('[data-action="cancel"]').onclick=()=>{stop();complete(o,{errMsg:'cancel'},true)};
    dialog.querySelector('[data-action="photo"]').onclick=()=>{stop();scanImage(o)};
    dialog.oncancel=event=>{event.preventDefault();stop();complete(o,{errMsg:'cancel'},true)};
    dialog.showModal();
    try{
      const media=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});
      if(done){media.getTracks().forEach(track=>track.stop());return}
      stream=media;video.srcObject=media;await video.play();
      const read=time=>{
        if(done)return;
        if(video.readyState>=2&&video.videoWidth&&video.videoHeight&&time-lastRead>=120){
          lastRead=time;const scale=Math.min(1,800/Math.max(video.videoWidth,video.videoHeight));
          canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
          context.drawImage(video,0,0,canvas.width,canvas.height);
          const pixels=context.getImageData(0,0,canvas.width,canvas.height),code=window.jsQR(pixels.data,pixels.width,pixels.height);
          if(code?.data){stop();complete(o,{result:code.data});return}
        }
        frame=requestAnimationFrame(read);
      };
      frame=requestAnimationFrame(read);
    }catch(error){if(!done){stop();offerScanImage(o,new Error(scanErrorReason(nativeError)+'；网页相机：'+scanErrorReason(error)),'扫码')}}
  }
  function startWechatScan(o,retried=false){
    try{window.wx.scanQRCode({needResult:1,scanType:['qrCode'],success:r=>complete(o,{result:r.resultStr}),fail:e=>{
      if(/cancel/i.test(e.errMsg||'')){complete(o,{errMsg:'cancel'},true);return}
      if(!retried&&/offline verifying/i.test(e.errMsg||'')){
        wechatShareReady=null;
        prepareWechatShare(current).then(()=>setTimeout(()=>startWechatScan(o,true),350)).catch(error=>scanLiveCamera(o,error,'微信组件准备'));
      }else scanLiveCamera(o,e,'扫一扫调用');
    },cancel:()=>complete(o,{errMsg:'cancel'},true)})}catch(error){scanLiveCamera(o,error,'扫一扫调用')}
  }
  const wx={
    getStorageSync:key=>storage.get(key)||'',setStorageSync:(key,val)=>storage.set(key,val),removeStorageSync:key=>storage.delete(key),
    getSystemInfoSync:()=>({windowWidth:Math.min(innerWidth,430),windowHeight:innerHeight,statusBarHeight:12,platform:'web',pixelRatio:devicePixelRatio,safeArea:{bottom:innerHeight}}),
    getWindowInfo:()=>wx.getSystemInfoSync(),getMenuButtonBoundingClientRect:()=>({top:20,bottom:60,left:Math.min(innerWidth,430),right:Math.min(innerWidth,430),height:40,width:0}),
    getAccountInfoSync:()=>({miniProgram:{envVersion:'release',version:'web-replica-20260922'}}),
    navigateTo:o=>navigate(o.url),switchTab:o=>navigate(o.url,'tab'),redirectTo:o=>navigate(o.url,'replace'),reLaunch:o=>navigate(o.url,'tab'),navigateBack:back,
    showTabBar:()=>{},setNavigationBarTitle:o=>{document.title=o.title+' · 知守';$('#page-title').textContent=o.title},
    pageScrollTo:o=>{const target=o.selector&&document.querySelector(o.selector);if(target){const top=target.getBoundingClientRect().top+window.scrollY+(o.offsetTop||0);window.scrollTo({top:Math.max(0,top),behavior:o.duration?'smooth':'instant'});return;}window.scrollTo({top:o.scrollTop||0,behavior:o.duration?'smooth':'instant'});},
    showToast:o=>{clearTimeout(toastTimer);$('#toast').textContent=o.title;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,o.duration||2600)},
    showLoading:o=>{$('#loading').textContent=o.title||'正在加载…';$('#loading').hidden=false},hideLoading:()=>$('#loading').hidden=true,
    showModal:modal,
    showActionSheet:o=>{const dialog=$('#modal');if(dialog.open)dialog.close();dialog.querySelector('h2').textContent='请选择';dialog.querySelector('p').textContent='';const actions=dialog.querySelector('.modal-actions');actions.replaceChildren();(o.itemList||[]).forEach((text,i)=>{const b=document.createElement('button');b.textContent=text;b.onclick=()=>{dialog.close();complete(o,{tapIndex:i})};actions.append(b)});dialog.oncancel=()=>complete(o,{errMsg:'cancel'},true);dialog.showModal()},
    setClipboardData:async o=>{try{await navigator.clipboard.writeText(o.data);complete(o,{});wx.showToast({title:'已复制'})}catch(_){wx.showModal({title:'复制链接',content:o.data,showCancel:false});complete(o,{errMsg:'无法自动复制'},true)}},
    makePhoneCall:o=>{if(/^[+\d -]+$/.test(o.phoneNumber))location.href='tel:'+o.phoneNumber},
    previewImage:o=>{const dialog=$('#image-preview');dialog.classList.remove('is-referral-poster');const tip=dialog.querySelector('p');if(tip)tip.remove();dialog.querySelector('img').src=safeUrl(o.current||(o.urls||[])[0]);dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal()},
    enableAlertBeforeUnload:o=>unloadMessage=o.message||'修改尚未保存，确定离开？',disableAlertBeforeUnload:()=>unloadMessage='',
    login:o=>{complete(o,{errMsg:'网页请通过公众号授权登录'},true);webLogin()},
    isH5:true,
    isWechatBrowser:()=>/MicroMessenger/i.test(navigator.userAgent),
    isVideoDownloadBrowser:()=>videoDownloadBrowser(),
    registerHls:(lessonId,hls)=>registerHls(lessonId,hls),
    getReferralContext,
    showReferralPoster,
    getInvitationError:()=>invitationError,
    retryInvitation:async()=>{
      await captureInvitation();
      if(invitationError&&!invitationNeedsLogin)throw new Error(invitationError);
      if(invitationNeedsLogin){webLogin();return;}
      if(invitation&&!storage.get('zionJwt'))webLogin();
      else if(invitation)navigate(invitation.returnTo.split('#')[1],'replace');
      else webLogin();
    },
    prepareCourseShare:page=>prepareWechatShare(page).then(ready=>{if(ready)page.setData({shareReady:true,shareError:''});return ready;}).catch(error=>{shareProblem(page,error);return false;}),
    getReferralToken:()=>new URLSearchParams(location.search).get('ref')||'',
    canUseCoursePayment:()=>/MicroMessenger/i.test(navigator.userAgent)&&!!window.WeixinJSBridge,
    requestPayment:o=>{
      if(!/MicroMessenger/i.test(navigator.userAgent)||!window.WeixinJSBridge){complete(o,{errMsg:'请在微信中打开课程网页后缴费'},true);return;}
      if(!/^prepay_id=\w{10,128}$/.test(o.package||'')||o.signType!=='MD5'||!/^[A-F0-9]{32}$/.test(o.paySign||'')){complete(o,{errMsg:'微信支付参数无效'},true);return;}
      window.WeixinJSBridge.invoke('getBrandWCPayRequest',{appId:o.appId,timeStamp:o.timeStamp,nonceStr:o.nonceStr,package:o.package,signType:o.signType,paySign:o.paySign},r=>complete(o,{errMsg:r.err_msg||'微信支付结果未知'},r.err_msg!=='get_brand_wcpay_request:ok'));
    },
    chooseLocation:o=>{
      if(!navigator.geolocation){complete(o,{errMsg:'当前浏览器不支持定位，请手动填写地区和详细地址'},true);return;}
      navigator.geolocation.getCurrentPosition(async position=>{
        const latitude=position.coords.latitude,longitude=position.coords.longitude;
        try{
          const url='https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+encodeURIComponent(latitude)+'&longitude='+encodeURIComponent(longitude)+'&localityLanguage=zh';
          const response=await fetch(url,{credentials:'omit'});if(!response.ok)throw new Error('地址解析失败');
          const place=await response.json(),city=place.city||place.locality||place.principalSubdivision||'';
          const parts=[place.countryName,place.principalSubdivision,place.city,place.locality].filter((value,index,all)=>value&&all.indexOf(value)===index);
          if(!city)throw new Error('没有识别到当前城市');
          complete(o,{name:city,address:parts.join(' '),latitude,longitude});
        }catch(error){complete(o,{errMsg:(error&&error.message)||'定位地址解析失败，请手动填写'},true);}
      },error=>complete(o,{errMsg:error&&error.code===1?'定位权限未开启，请允许定位后重试':'定位未完成，请手动填写地区和详细地址'},true),{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
    },
    chooseMedia:o=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const file=input.files[0];if(!file)return;const suffix=(file.name.match(/\.(png|jpe?g|webp|gif)$/i)||[])[1]||'jpg';const url=URL.createObjectURL(file)+'#upload.'+suffix;files.set(url,file);complete(o,{tempFiles:[{tempFilePath:url,size:file.size}]})};input.oncancel=()=>complete(o,{errMsg:'cancel'},true);input.click()},
    getFileSystemManager:()=>({readFile:async o=>{try{const file=files.get(o.filePath);if(!file)throw new Error('文件不可用');complete(o,{data:await file.arrayBuffer()})}catch(error){complete(o,{errMsg:error.message},true)}}}),
    request:o=>{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),o.timeout||30000);
      const isZion=o.url==='https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2';
      const method=o.method||'GET';const headers=isZion?{'content-type':'application/json'}:(o.header||{});
      const data=isZion?{...o.data,anonymous:!o.header?.Authorization}:o.data;
      fetch(isZion?'/api/h5?action=graphql':o.url,{method,headers,credentials:isZion||/^\/api\/h5\?/.test(o.url)?'same-origin':'omit',signal:controller.signal,body:method==='GET'?undefined:data instanceof ArrayBuffer?data:JSON.stringify(data)}).then(async response=>{const text=await response.text();let data;try{data=JSON.parse(text)}catch(_){data=text}complete(o,{statusCode:response.status,data,header:Object.fromEntries(response.headers)})}).catch(error=>complete(o,{errMsg:error.message},true)).finally(()=>clearTimeout(timeout));
      return{abort:()=>controller.abort()};
    },
    createVideoContext:id=>({play:()=>document.getElementById(id)?.play(),pause:()=>document.getElementById(id)?.pause(),stop:()=>{const video=document.getElementById(id);if(video){video.pause();video.currentTime=0}}}),
    createCanvasContext:id=>{const commands=[];return{setFillStyle:color=>commands.push(ctx=>ctx.fillStyle=color),fillRect:(...args)=>commands.push(ctx=>ctx.fillRect(...args)),draw:(_,callback)=>requestAnimationFrame(()=>{const canvas=document.getElementById(id);if(canvas){const ctx=canvas.getContext('2d');commands.forEach(command=>command(ctx))}callback?.()})}},
    scanCode:async o=>{
      if(/MicroMessenger/i.test(navigator.userAgent)){
        try{await prepareWechatShare(current);if(!window.wx?.scanQRCode)throw new Error('微信扫码组件不可用');startWechatScan(o)}catch(error){scanLiveCamera(o,error,'微信组件准备')}
        return;
      }
      scanImage(o);
    },
    getRecorderManager:()=>({onStop(){},offStop(){},onError(fn){this.error=fn},offError(){},start(){this.error?.({errMsg:'网页录音编码尚未接入，请使用文字记录'})},stop(){}})
  };
  // Copy only a non-secret session marker into the compatibility storage. JWT stays HttpOnly.
  async function captureInvitation(){
    invitationError='';invitationNeedsLogin=false;
    const incomingRef=new URLSearchParams(location.search).get('ref');
    if(incomingRef){
      try{const response=await fetch('/api/h5?action=capture-referral',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({ref:incomingRef,returnTo:invitation?.returnTo||invitationTarget})});const body=await response.json();if(!response.ok||!body.ok){invitationNeedsLogin=body.code==='INVITATION_LOGIN_REQUIRED';throw new Error(body.message||'报名入口暂时无法打开，请重试');}invitation=body.data.invitation;}
      catch(e){invitationError=e.message||'报名入口暂时无法打开，请重新加载';}
    }
  }
  async function start(){
    const incomingRef=new URLSearchParams(location.search).get('ref');
    await captureInvitation();
    try{const response=await fetch('/api/h5?action=session');const body=await response.json();if(!response.ok||!body.ok)throw new Error();invitation=body.data.invitation||invitation;if(body.data.loggedIn){session=body.data;storage.set('zionJwt','h5-session');storage.set('userInfo',{id:session.user.id,nickName:session.user.name,username:session.user.name,avatarUrl:session.user.avatarUrl})}}catch(_){if(incomingRef||invitation)invitationError='登录状态暂未确认，请重新加载报名页面';}
    const loginError=new URLSearchParams(location.search).get('loginError');
    if(loginError&&invitation&&!session)invitationError=loginError;
    if(session)try{await getReferralContext();}catch(_){/* Retry explicitly when sharing; public browsing remains available. */}
    renderTabbar();refreshChatEntry();
    $('#back-button').onclick=back;
    const aliases={home:HOME,courses:'pages/plaza/plaza',mine:'pages/profile/profile'};
    const courseId=new URLSearchParams(location.search).get('course');
    const initial=location.hash.slice(1)||(/^[1-9][0-9]*$/.test(courseId||'')?'/pages/course-detail/course-detail?id='+courseId:'');
    const target=aliases[initial]||(parseRoute(initial).route===INVITE_LOGIN&&session?invitation?.returnTo?.split('#')[1]||HOME:initial)||HOME;
    navigate(parseRoute(target).route==='pages/profile/profile'?HOME:target,'replace');
    const error=new URLSearchParams(location.search).get('loginError');if(error)wx.showToast({title:error});
  }
  window.MiniHost={start,parseRoute,value,requireModule,get current(){return current},wx};
  start();
})();
