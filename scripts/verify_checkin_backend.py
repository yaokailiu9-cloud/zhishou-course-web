"""Exercise course check-in against Zion with synthetic rows, ALWAYS rolled back.

The admin sandbox supplies test actor IDs to the same authorization code; this
does not mint user credentials or prove a real phone's WeChat camera integration.
"""
import json
from pathlib import Path
from zion_cli import run

assert run('schema', 'load')['projectExId'] == 'JmAxbl1MMe4'
source = '\n'.join(Path(f'backend/consultation/{f}.js').read_text() for f in ['common', 'authorize', 'checkin'])
wrapper = """
var nativeContext=context;
function invoke(actor,operation,payload){
  var output;
  (function(context){ SOURCE })( {
    getArg:function(k){return {account_id:actor,operation:operation,payload:payload||{}}[k];},
    setReturn:function(k,v){output=v;},
    runGql:function(n,q,v,o){return nativeContext.runGql(n,q,v,o);}
  });
  return output.result.data;
}
function query(n,q,v){var r=nativeContext.runGql(n,q,v||{},{role:'admin'});if(typeof r==='string')r=JSON.parse(r);if(r.errors)throw new Error(JSON.stringify(r.errors));return r.data||r;}
function check(v,label){if(!v)throw new Error(label);}
function denied(fn){try{fn();}catch(e){return true;}throw new Error('Authorization did not reject');}
var people=query('CheckinTestActors','query CheckinTestActors{account(limit:100,order_by:{id:asc}){id service_provider{id service_status service_kind can_reply can_accept_order}}}').account;
var manager=people.filter(function(a){var p=a.service_provider;return p&&p.service_status==='ACTIVE'&&p.service_kind==='STAFF'&&p.can_reply&&p.can_accept_order;})[0];
var customers=people.filter(function(a){return !a.service_provider;});
check(manager&&customers.length>=2,'Need existing manager and two ordinary accounts for rollback-only checks');
var user=customers[0],other=customers[1];
var c=query('CheckinTestCourse','mutation CheckinTestCourse($o:public_class_insert_input!){insert_public_class_one(object:$o){id}}',{o:{title:'自动回滚-签到联调',status:'PUBLISHED',starts_at:new Date(Date.now()-3600000).toISOString(),organizer_id:manager.service_provider.id}}).insert_public_class_one;
var entry='Z'.repeat(24);
var enrollment=query('CheckinTestEnrollment','mutation CheckinTestEnrollment($o:public_class_enrollment_insert_input!){insert_public_class_enrollment_one(object:$o){id}}',{o:{public_class_id:c.id,customer_id:other.id,registrant_name:'合成签到报名',phone:'13800000000',status:'REGISTERED',attendance_status:'PENDING',group_status:'PENDING',entry_code:entry}}).insert_public_class_enrollment_one;
denied(function(){invoke(user.id,'CHECKIN_ROSTER',{classId:c.id});});
invoke(manager.id,'CHECKIN_SET_STAFF',{classId:c.id,accountId:user.id,active:true});
check(invoke(user.id,'CHECKIN_ACCESS').allowed,'Assigned access');
check(invoke(manager.id,'CHECKIN_STAFF',{classId:c.id}).items.length===1,'Staff listing');
check(invoke(manager.id,'CHECKIN_CANDIDATES',{search:String(user.id)}).items.length===1,'Account search');
var classes=invoke(user.id,'CHECKIN_CLASSES');check(classes.items.some(function(x){return x.id===c.id;}),'Course scope query');
var r=invoke(user.id,'CHECKIN_ROSTER',{classId:c.id});check(r.stats.registered===1&&r.stats.remaining===1,'Before stats');
check(invoke(user.id,'CHECKIN_LOOKUP',{classId:c.id,entryCode:'EMPATH-ENTRY:'+entry}).enrollment.id===enrollment.id,'QR lookup');
var first=invoke(user.id,'CHECKIN_CONFIRM',{classId:c.id,entryCode:entry});check(first.stats.attended===1&&first.stats.remaining===0&&!first.alreadyCheckedIn,'Confirmed stats');
check(invoke(manager.id,'CHECKIN_CONFIRM',{classId:c.id,entryCode:entry}).alreadyCheckedIn,'Repeat is idempotent');
var saved=query('CheckinTestSaved','query CheckinTestSaved($id:bigint!){public_class_enrollment_by_pk(id:$id){checked_in_by_id verified_at}}',{id:enrollment.id}).public_class_enrollment_by_pk;
check(saved.checked_in_by_id===user.id&&!!saved.verified_at,'Actual operator recorded');
invoke(manager.id,'CHECKIN_SET_STAFF',{classId:c.id,accountId:user.id,active:false});
denied(function(){invoke(user.id,'CHECKIN_CONFIRM',{classId:c.id,entryCode:entry});});
denied(function(){invoke(other.id,'CHECKIN_ROSTER',{classId:c.id});});
denied(function(){invoke(user.id,'CHECKIN_SET_STAFF',{classId:c.id,accountId:other.id,active:true});});
nativeContext.setReturn('result',{passed:true,checks:12,rollback:true,syntheticClassId:c.id,syntheticEnrollmentId:enrollment.id});
""".replace('SOURCE', source)
# Never add --updateDb: all synthetic inserts and changes must be rolled back.
print(json.dumps(run('runtime', 'run-code', '--jsCode', wrapper), ensure_ascii=False, indent=2))
