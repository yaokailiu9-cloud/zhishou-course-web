// Run the exact prospective/live node code with real rows in an admin transaction.
// No gateway calls; no persistent writes. Never return signed payment requests.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.codex-work/manual-package-purchase');
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.13/bin/zion-mcp';
const cwd=process.env.ZION_PROJECT_CWD||root,env={...process.env,PLUGIN_ROOT:path.dirname(path.dirname(cli)),MCP_LOG_FILE:'off'};
const run=(...a)=>{try{return JSON.parse(cp.execFileSync(cli,a,{cwd,env,encoding:'utf8',maxBuffer:20000000,timeout:180000}));}catch(e){throw Error(String(e.stdout||e.stderr||'Zion verification failed').slice(-6000));}};
let nodes;
if(process.argv.includes('--live'))nodes=run('schema','snapshot','--args','{"full":true}').server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4').allNodes;
const code=id=>nodes?nodes.find(n=>n.uniqueId===id).code:fs.readFileSync(path.join(dir,id+'-after.js'),'utf8');
const script=`
var native=context,buyer=1000000000000031,KEY='0123456789abcdef0123456789abcdef';
function check(v,m){if(!v)throw new Error(m);}
function query(n,q,v){var r=native.runGql(n,q,v||{},{role:'admin'});if(typeof r==='string')r=JSON.parse(r);if(r.errors)throw new Error('Verification query failed');return r.data||r;}
function invoke(kind,actor,operation,payload){var out;var runner=kind==='booking'?function(context){${code('g3oknp94t')}}:function(context){${code('sui9sl3ko')}};runner({getArg:function(k){return k==='wechat_pay_key'?KEY:{operation:operation,payload:payload||{},actor:{accountId:actor}};},setReturn:function(k,v){out=v;},runGql:function(n,q,v,o){return native.runGql(n,q,v,o);}});check(out&&out.result&&out.result.ok,'Node did not return success');return out.result.data;}
var before=query('ManualPurchaseBefore','query ManualPurchaseBefore{offline_appointment_aggregate(where:{_eq:{bigint_operand:{left_operand:{column:customer_id},right_operand:{literal:1000000000000031}}}}){aggregate{count}} course_registration_order_aggregate(where:{_and:[{_eq:{bigint_operand:{left_operand:{column:customer_id},right_operand:{literal:1000000000000031}}}},{_eq:{bigint_operand:{left_operand:{column:public_class_id},right_operand:{literal:18}}}}]}){aggregate{count}}}');
check(before.offline_appointment_aggregate.aggregate.count===0,'Customer first-consultation state changed; inspect');
check(before.course_registration_order_aggregate.aggregate.count===0,'Customer package orders changed; inspect');
var offer=invoke('booking',buyer,'GET_PACKAGE');check(offer.eligible&&offer.manualApproval&&offer.offer.price===3999&&!offer.package,'Manual eligibility');
var other=invoke('booking',1000000000000101,'GET_PACKAGE',{customerId:buyer,manualApproval:true});check(!other.eligible&&!other.manualApproval,'Other customer isolation');
var blocked=false;try{invoke('booking',buyer,'CREATE_APPOINTMENT',{requestedTime:new Date(Date.now()+86400000).toISOString(),concerns:'回滚验证'});}catch(e){blocked=String(e).indexOf('购买5次')>=0;}check(blocked,'Unpaid cannot book');
var prepared=invoke('payment',buyer,'PREPARE_COURSE_PAYMENT',{classId:offer.offer.id,name:offer.defaults.name,phone:offer.defaults.phone,amount:0.01});
check(prepared.order.status==='PENDING'&&prepared.order.amount===3999&&prepared.request.total_fee==='399900','Server-priced pending order');
check(invoke('booking',buyer,'GET_PACKAGE').package===null,'Unpaid order grants no sessions');
native.setReturn('result',{passed:true,rollback:true,gatewayCalls:0,customerId:String(buyer),eligible:true,manualApproval:true,price:3999,unpaidCannotBook:true,firstConsultationRecords:0,otherCustomerDenied:true});`;
const result=run('runtime','run-code','--projectExId','JmAxbl1MMe4','--no-updateDb','--jsCode',script);
fs.writeFileSync(path.join(dir,process.argv.includes('--live')?'verified-live.json':'verified-staged.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
