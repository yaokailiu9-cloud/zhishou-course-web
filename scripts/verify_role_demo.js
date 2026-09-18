// Exercises only the tracked synthetic accounts and course; never prints credentials.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const zion=require('../server/role-demo/zion');
async function main(){
 const file='.codex-work/role-demo/zion-accounts.json';
 const c=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(c.projectId,'JmAxbl1MMe4');assert.ok(c.classId);
 const jwt={};const checks=[];
 const pass=name=>{checks.push(name);console.log('PASS '+name);};
 for(const role of ['manager','agent','customer'])jwt[role]=await zion.login(c.actors[role]);
 pass('三个真实测试账号分别认证');
 const call=(role,op,p={})=>zion.invoke(jwt[role],op,p);
 await assert.rejects(call('customer','SET_AGENT',{accountId:c.actors.agent.id,active:true}),/权限|工作人员/);
 pass('客户不能授予代理身份');
 await call('manager','SET_AGENT',{accountId:c.actors.agent.id,active:true});
 assert.equal((await call('agent','FAMILY_OVERVIEW')).role,'AGENT');
 await assert.rejects(call('agent','STAFF_CHILD_INTAKES'),/权限|工作人员/);
 pass('管理人员指定代理；代理不能进入工作人员资料接口');
 await call('manager','BIND_CUSTOMER',{customerId:c.actors.customer.id,agentAccountId:c.actors.agent.id});
 const bound=await call('customer','FAMILY_OVERVIEW');
 assert.equal(String(bound.binding.referrer.id),String(c.actors.agent.id));
 const firstId=bound.binding.id;
 await call('manager','BIND_CUSTOMER',{customerId:c.actors.customer.id,agentAccountId:c.actors.agent.id});
 assert.equal((await call('customer','FAMILY_OVERVIEW')).binding.id,firstId);
 await assert.rejects(call('customer','BIND_CUSTOMER',{customerId:c.actors.customer.id,agentAccountId:c.actors.agent.id}),/权限|工作人员/);
 pass('客户直接绑定落库；重复绑定幂等，客户无改绑权限');
 const {enrollment}=await call('customer','ENROLL',{classId:c.classId,name:'联调家长（模拟）',phone:'13800000000',referrerId:c.actors.agent.id});
 c.enrollmentId=enrollment.id;fs.writeFileSync(file,JSON.stringify(c,null,2),{mode:0o600});
 let data=await call('customer','GET_CHILD_INTAKE',{enrollmentId:enrollment.id});
 if(!data.intake.child_submitted_at){
  await call('customer','SUBMIT_CHILD_INTAKE',{enrollmentId:enrollment.id,name:'小禾（模拟）',gender:'女',age:12,grade:'六年级',economicSource:'父母供养（模拟）',issues:data.issues.slice(0,2),description:'模拟资料：希望改善亲子交流。',dailyBehavior:'模拟资料：放学后独处，周末打球。',guardianName:'联调家长（模拟）',guardianPhone:'13800000000',consent:true});
 }
 await assert.rejects(call('agent','GET_CHILD_INTAKE',{enrollmentId:enrollment.id}),/不能访问/);
 const clients=await call('agent','MY_REFERRALS');
 assert.ok(clients.items.some(x=>String(x.referred_account_id)===String(c.actors.customer.id)));
 pass('客户报名和孩子资料落库；代理可见客户但不能读取孩子详细资料');
 data=await call('manager','GET_CHILD_INTAKE',{enrollmentId:enrollment.id});
 if(data.intake.feedback_status!=='CONFIRMED'){
  await call('manager','SAVE_CHILD_FEEDBACK',{enrollmentId:enrollment.id,revision:data.intake.feedback_revision,content:'【模拟工作人员反馈】先安排一段不谈成绩的交流，记录具体情境，再和工作人员讨论家庭沟通方法。',confirm:false});
  const draft=await call('customer','GET_CHILD_INTAKE',{enrollmentId:enrollment.id});
  assert.equal(draft.intake.feedback_status,'DRAFT');
  assert.equal(draft.intake.feedback_content,undefined);assert.equal(draft.intake.feedback_available_at,null);
  pass('保存草稿不启动三小时计时，也不向客户返回正文');
  data=await call('manager','GET_CHILD_INTAKE',{enrollmentId:enrollment.id});
  await call('manager','SAVE_CHILD_FEEDBACK',{enrollmentId:enrollment.id,revision:data.intake.feedback_revision,content:data.intake.feedback_content,confirm:true});
 }
 const customer=await call('customer','GET_CHILD_INTAKE',{enrollmentId:enrollment.id});
 const r=customer.intake;
 assert.equal(new Date(r.feedback_available_at)-new Date(r.feedback_confirmed_at),10800000);
 if(Date.now()<new Date(r.feedback_available_at)){assert.equal(r.canViewFeedback,false);assert.equal(r.feedback_content,undefined);}
 await assert.rejects(call('manager','SAVE_CHILD_FEEDBACK',{enrollmentId:enrollment.id,revision:r.feedback_revision,content:'不应覆盖',confirm:true}),/回复已确认完成/);
 pass('确认完成后整三小时才开放；确认后不可重复覆盖');
 fs.writeFileSync('.codex-work/referral-intake/real-flow-results.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,enrollmentId:enrollment.id,availableAt:r.feedback_available_at},null,2));
 console.log('Zion 三端业务验证完成；客户可查看时间 '+r.feedback_available_at);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
