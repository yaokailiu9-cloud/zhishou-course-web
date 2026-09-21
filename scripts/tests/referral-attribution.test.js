const test=require('node:test'),assert=require('node:assert/strict');
const {engine,fixture}=require('./consultation-security.test');
function data(){const db=fixture();db.service_provider.push({id:3,account_id:203,display_name:'代理丙',service_kind:'AGENT',service_status:'ACTIVE',can_reply:false,can_accept_order:false});db.course_referral=[{id:9,referrer_id:203,referred_account_id:201,locked_at:new Date().toISOString()},{id:10,referrer_id:101,referred_account_id:202}];return db;}
test('推荐客户仅代理本人可见，管理可查看全部，并携带课程和到课状态',()=>{
 const e=engine(data());const own=e.run(203,'REFERRAL_CLIENTS',{accountId:101}).data;
 assert.equal(own.total,1);assert.equal(own.items.length,1);assert.equal(own.items[0].customerName,'家长甲');assert.equal(own.items[0].referrerName,'家长丙');assert.equal(own.items[0].enrollments[0].attendanceStatus,'ATTENDED');assert.equal(own.items[0].enrollments[0].courseTitle,'甲公开课');assert.equal(own.items[0].enrollments[0].phone,undefined);
 assert.throws(()=>e.run(203,'REFERRAL_CLIENTS',{scope:'all'}),/管理人员/);assert.throws(()=>e.run(201,'REFERRAL_CLIENTS'),/权限/);assert.throws(()=>e.run(null,'REFERRAL_CLIENTS'),/登录/);
 assert.equal(e.run(101,'REFERRAL_CLIENTS',{scope:'all'}).data.items.length,2);
 e.db.service_provider[2].service_status='INACTIVE';assert.throws(()=>e.run(203,'REFERRAL_CLIENTS'),/权限/);
});
test('推荐预览不产生关系；新链接不能替换已记录来源；老客户不会显示待绑定',()=>{
 const e=engine(data());assert.equal(e.run(203,'REFERRAL_OVERVIEW').data.canInvite,true);
 const old=e.run(201,'REFERRAL_OVERVIEW',{referrerId:101}).data;assert.equal(old.binding.name,'家长丙');assert.equal(old.candidate,null);
 e.db.course_referral=[];assert.equal(e.run(201,'REFERRAL_OVERVIEW',{referrerId:203}).data.candidate,null);
 assert.equal(e.run(null,'REFERRAL_OVERVIEW',{referrerId:203}).data.candidate.name,'代理丙');assert.equal(e.db.course_referral.length,0);
 assert.equal(e.run(203,'REFERRAL_OVERVIEW',{referrerId:203}).data.candidate,null);
});
