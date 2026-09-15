"""Read-only pagination smoke checks with existing synthetic accounts; no new records."""
import json
from pathlib import Path
from consultation_runtime_test import FIX, invoke, gql
out=Path('.codex-work/ui-fixes')
actors=json.loads(FIX.read_text())['actors']
checks={}
def result(actor,op,p):
 r=invoke(actor,op,p)
 r=r.get('result',r)
 if isinstance(r,str):r=json.loads(r)
 return r
for key in ['customer','otherCustomer']:
 actor=actors[key]
 login=gql('mutation TestLogin($u:String!,$p:String!){authenticateWithUsername(username:$u,password:$p,register:false){jwt{token}}}',{'u':actor['username'],'p':actor['password']})
 actor['token']=login['authenticateWithUsername']['jwt']['token']
 r=result(actors[key],'MY_OVERVIEW',{'paginate':True})
 assert r.get('ok') is True,'Synthetic account query failed'
 d=r['data'];assert isinstance(d['appointments'],list) and 'nextAppointmentCursor' in d
 assert len(d['appointments'])<=20
 checks[key]={'paginated':True,'count':len(d['appointments'])}
 r=result(actors[key],'MY_OVERVIEW',{})
 assert r.get('ok') is True
 checks[key]['legacy_compatible']=True
for actor,op,p in [(None,'MY_OVERVIEW',{'paginate':True}),(actors['customer'],'GET_APPOINTMENT',{'paginate':True,'appointmentId':'9223372036854775806','feedbackCursor':'100'})]:
 try:r=result(actor,op,p);denied=r.get('ok') is not True
 except Exception:denied=True
 assert denied,'Access unexpectedly allowed'
 checks[op+'_denied']=True
(out/'runtime-pagination.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('Read-only pagination contract and denial checks passed; no business writes.')
