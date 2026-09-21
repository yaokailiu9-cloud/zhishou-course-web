// Admin sandbox, synthetic course/order only, ALWAYS rolled back. No gateway calls.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.8/bin/zion-mcp';
let code=read('backend/consultation/common.js')+'\n'+read('backend/consultation/classes.js').replace('// FAMILY_HANDLERS: build script inserts family.js here.',read('backend/consultation/family.js')).replace('// PAYMENT_HANDLERS: build script inserts course-payment.js and MD5 here.',read('utils/md5.js').replace('module.exports = { md5Base64 };','')+'\n'+read('backend/consultation/course-payment.js'));
if(process.argv.includes('--live')){
  const snapshot=JSON.parse(cp.execFileSync(cli,['schema','snapshot','--args','{"full":true}'],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:10000000,env:{...process.env,MCP_LOG_FILE:'off'}}));
  code=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4').allNodes.find(n=>n.uniqueId==='sui9sl3ko').code;
  if(!code.includes('// COURSE_PAYMENT_START'))throw new Error('Live payment handlers missing');
}
const wrapper=`
var native=context,KEY='0123456789abcdef0123456789abcdef';
function query(n,q,v){var r=native.runGql(n,q,v||{},{role:'admin'});if(typeof r==='string')r=JSON.parse(r);if(r.errors)throw new Error('GraphQL validation failed');return r.data||r;}
function check(v,m){if(!v)throw new Error(m);}
function invoke(actor,operation,payload){var out;(function(context){${code}})({getArg:function(k){return k==='wechat_pay_key'?KEY:{operation:operation,payload:payload||{},actor:{accountId:actor}};},setReturn:function(k,v){out=v;},runGql:function(n,q,v,o){return native.runGql(n,q,v,o);}});return out.result.data;}
var accounts=query('PayTestActors','query PayTestActors{account(limit:1000){id username wechat_openid service_provider{id can_accept_order service_status}}}').account;
var buyer=accounts.filter(function(a){return String(a.username).indexOf('wxh5_')===0&&a.wechat_openid;})[0];
var staff=accounts.filter(function(a){return a.service_provider&&a.service_provider.can_accept_order&&a.service_provider.service_status==='ACTIVE';})[0];check(buyer&&staff,'Need existing WeChat buyer and organizer');
var c=query('PayTestCourse','mutation PayTestCourse($o:public_class_insert_input!){insert_public_class_one(object:$o){id}}',{o:{title:'自动回滚-支付联调',status:'PUBLISHED',starts_at:new Date(Date.now()+3600000).toISOString(),organizer_id:staff.service_provider.id,registration_fee:100,capacity:2,reserved_count:0,revision:0}}).insert_public_class_one;
var prepared=invoke(buyer.id,'PREPARE_COURSE_PAYMENT',{classId:c.id,name:'自动回滚测试',phone:'13800000000',amount:0.01});check(prepared.order.amount===100&&prepared.request.total_fee==='10000','Server price');
check(invoke(buyer.id,'PREPARE_COURSE_PAYMENT',{classId:c.id,name:'测试',phone:'13800000000'}).order.id===prepared.order.id,'Reuse pending');
var gateway={appid:'wx6dafecca8d5fd24e',mch_id:'1666219884',return_code:'SUCCESS',result_code:'SUCCESS',trade_type:'JSAPI',trade_state:'SUCCESS',openid:buyer.wechat_openid,out_trade_no:prepared.order.orderNo,total_fee:'10000',fee_type:'CNY',transaction_id:'499999'+String(Date.now()),nonce_str:'rollback-only'};
${read('utils/md5.js').replace('module.exports = { md5Base64 };','')}
var u=unescape(encodeURIComponent(Object.keys(gateway).sort().map(function(k){return k+'='+gateway[k];}).join('&')+'&key='+KEY)),b=new Uint8Array(u.length);for(var i=0;i<u.length;i++)b[i]=u.charCodeAt(i);gateway.sign=wordsToBytes(md5Core(bufferToWords(b.buffer))).map(function(x){return ('0'+x.toString(16)).slice(-2);}).join('').toUpperCase();
check(invoke(null,'CONFIRM_COURSE_PAYMENT',{gateway:gateway}).confirmed,'Confirmed');check(invoke(null,'CONFIRM_COURSE_PAYMENT',{gateway:gateway}).confirmed,'Idempotent callback');
var status=invoke(buyer.id,'QUERY_COURSE_PAYMENT',{orderId:prepared.order.id});check(status.order.status==='PAID'&&status.enrollment,'Paid registration');
var saved=query('PayTestSaved','query PayTestSaved($id:bigint!,$enrollmentId:bigint!){public_class_by_pk(id:$id){reserved_count} public_class_enrollment_by_pk(id:$enrollmentId){payment_order_id}}',{id:c.id,enrollmentId:status.enrollment.id});
check(saved.public_class_by_pk.reserved_count===1,'Single seat');check(String(saved.public_class_enrollment_by_pk.payment_order_id)===String(prepared.order.id),'Explicit order enrollment link');
native.setReturn('result',{passed:true,checks:7,rollback:true,gatewayCalls:0});`;
const result=cp.execFileSync(cli,['runtime','run-code','--projectExId','JmAxbl1MMe4','--no-updateDb','--jsCode',wrapper],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:2000000,timeout:120000,env:{...process.env,MCP_LOG_FILE:'off'}});
console.log(result);
