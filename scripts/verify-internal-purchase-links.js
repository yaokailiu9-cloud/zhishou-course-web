// Exact prospective/live node code, real backend rows, automatically rolled back.
// Uses a synthetic signing key and NO calls to the WeChat gateway.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.codex-work/internal-purchase-links');
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.13/bin/zion-mcp',cwd=process.env.ZION_PROJECT_CWD||root;
const run=(...a)=>{try{return JSON.parse(cp.execFileSync(cli,a,{cwd,env:{...process.env,PLUGIN_ROOT:path.dirname(path.dirname(cli)),MCP_LOG_FILE:'off'},encoding:'utf8',maxBuffer:20000000,timeout:180000}));}catch(e){throw Error(String(e.stdout||e.stderr||'Zion verification failed').slice(-4000));}};
const live=process.argv.includes('--live'),nodes=live?run('schema','snapshot','--args','{"full":true}').server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4').allNodes:null;
const code=id=>nodes?nodes.find(n=>n.uniqueId===id).code:fs.readFileSync(path.join(dir,id+'-after.js'),'utf8');
const md5=fs.readFileSync(path.join(root,'utils/md5.js'),'utf8').replace('module.exports = { md5Base64 };','');
const script=`
var native=context,buyer=1000000000000031,KEY='0123456789abcdef0123456789abcdef';
function check(v,m){if(!v)throw new Error(m);}
function query(n,q,v){var r=native.runGql(n,q,v||{},{role:'admin'});if(typeof r==='string')r=JSON.parse(r);if(r.errors)throw new Error('Verification query failed');return r.data||r;}
var providers=query('PurchaseLinkProviders','query PurchaseLinkProviders{service_provider{ id account_id service_kind service_status can_accept_order can_reply }}').service_provider;
function invoke(kind,actor,operation,payload){var out,provider=providers.filter(function(p){return p.account_id===actor&&p.service_status==='ACTIVE';})[0];var runner=kind==='booking'?function(context){${code('g3oknp94t')}}:function(context){${code('sui9sl3ko')}};
 runner({getArg:function(k){return k==='wechat_pay_key'?KEY:{operation:operation,payload:payload||{},actor:{accountId:actor,providerId:provider?provider.id:null,serviceKind:provider?provider.service_kind:'',canReply:provider?provider.can_reply:false,canAccept:provider?provider.can_accept_order:false}};},setReturn:function(k,v){out=v;},runGql:function(n,q,v,o){return native.runGql(n,q,v,o);}});check(out&&out.result&&out.result.ok,'Node did not return success');return out.result.data;}
check(invoke('payment',1000000000000019,'INTERNAL_PURCHASE_ACCESS').allowed,'Liu issuer');check(invoke('payment',1000000000000021,'INTERNAL_PURCHASE_ACCESS').allowed,'Cheng issuer');check(!invoke('payment',buyer,'INTERNAL_PURCHASE_ACCESS').allowed,'Customer denied issuer access');
var link=invoke('payment',1000000000000021,'CREATE_PURCHASE_LINK'),offer=invoke('payment',buyer,'GET_LINK_PACKAGE',{paymentLinkToken:link.token});check(offer.offer.price===3999,'Price from live product');
var original=invoke('booking',buyer,'GET_PACKAGE');check(!original.eligible&&!original.package,'Old per-account override removed; inspect if customer data changed');
var denied=false;try{invoke('payment',buyer,'CREATE_PURCHASE_LINK',{issuerAccountId:1000000000000019});}catch(e){denied=true;}check(denied,'Client cannot impersonate issuer');
var broken=link.token.slice(0,-1)+(link.token.slice(-1)==='a'?'b':'a');denied=false;try{invoke('payment',buyer,'GET_LINK_PACKAGE',{paymentLinkToken:broken});}catch(e){denied=true;}check(denied,'Tampered token denied');
var prepared=invoke('payment',buyer,'PREPARE_COURSE_PAYMENT',{classId:offer.offer.id,name:'自动回滚验证',phone:'13800000000',paymentLinkToken:link.token,amount:0.01});check(prepared.order.status==='PENDING'&&prepared.order.amount===3999&&prepared.request.total_fee==='399900','Pending server-priced order');
check(!invoke('booking',buyer,'GET_PACKAGE').package,'No entitlement before gateway proof');denied=false;try{invoke('booking',buyer,'CREATE_APPOINTMENT',{requestedTime:new Date(Date.now()+86400000).toISOString(),concerns:'回滚验证'});}catch(e){denied=true;}check(denied,'Unpaid cannot book');
var account=query('PurchaseLinkBuyer','query PurchaseLinkBuyer($id:bigint!){account_by_pk(id:$id){wechat_openid}}',{id:buyer}).account_by_pk;
var gateway={appid:'wx6dafecca8d5fd24e',mch_id:'1666219884',return_code:'SUCCESS',result_code:'SUCCESS',trade_type:'JSAPI',trade_state:'SUCCESS',openid:account.wechat_openid,out_trade_no:prepared.order.orderNo,total_fee:'399900',fee_type:'CNY',transaction_id:'499999'+String(Date.now()),nonce_str:'rollback-only'};
${md5}
var signText=unescape(encodeURIComponent(Object.keys(gateway).sort().map(function(k){return k+'='+gateway[k];}).join('&')+'&key='+KEY)),bytes=new Uint8Array(signText.length);for(var i=0;i<signText.length;i++)bytes[i]=signText.charCodeAt(i);gateway.sign=wordsToBytes(md5Core(bufferToWords(bytes.buffer))).map(function(x){return ('0'+x.toString(16)).slice(-2);}).join('').toUpperCase();
invoke('payment',null,'CONFIRM_COURSE_PAYMENT',{gateway:gateway});invoke('payment',null,'CONFIRM_COURSE_PAYMENT',{gateway:gateway});
var paid=invoke('booking',buyer,'GET_PACKAGE');check(paid.eligible&&paid.viaPurchaseLink&&paid.package.total===5,'Exactly five sessions after signed proof');
var when=new Date(Date.now()+86400000).toISOString(),booking=invoke('booking',buyer,'CREATE_APPOINTMENT',{requestedTime:when,concerns:'自动回滚验证'});
var a=query('PurchaseLinkBooking','query PurchaseLinkBooking($id:bigint!){offline_appointment_by_pk(id:$id){status child_info enrollment_id provider_id}}',{id:booking.id}).offline_appointment_by_pk;check(a.status==='PENDING'&&a.child_info===null&&a.enrollment_id===null&&a.provider_id===15,'No fabricated first consultation or child archive');
invoke('booking',1000000000000021,'CONFIRM_APPOINTMENT',{appointmentId:booking.id,confirmedAt:when});
native.setReturn('result',{passed:true,rollback:true,gatewayCalls:0,twoIssuersVerified:true,otherAccountsDenied:true,tamperingDenied:true,price:3999,oldManualOverrideRemoved:true,unpaidCannotBook:true,paidSessions:5,supervisorConfirmation:true,noFabricatedFirstConsultation:true});`;
const result=run('runtime','run-code','--projectExId','JmAxbl1MMe4','--no-updateDb','--jsCode',script);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,live?'verified-live.json':'verified-staged.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
