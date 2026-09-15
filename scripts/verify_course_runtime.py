"""Production course transaction checks, exclusively tracked synthetic fixtures."""
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timedelta,timezone
from consultation_runtime_test import FIX,OUT,save,invoke

f=json.loads(FIX.read_text()); actors=f['actors']; ids=f['ids']
def service(role,op,p=None):
    r=invoke(actors.get(role),op,p)
    r=r.get('result',r)
    if isinstance(r,str):r=json.loads(r)
    assert r['ok'],r
    return r['data']
def remember(k,v):ids[k]=v;save(f);return v
cid=ids.get('capacity_class')
if not cid:
    cid=remember('capacity_class',service('teacher','SAVE_CLASS',{
        'title':'并发联调专用-'+f['nonce'],'startsAt':(datetime.now(timezone.utc)+timedelta(days=1)).isoformat(),
        'description':'合成测试，验证完成清理','groupGuide':'合成指引，无真实群邀请','status':'PUBLISHED','capacity':1})['id'])
def enroll(role):
    try:return role,service(role,'ENROLL',{'classId':cid,'name':'并发合成家长','phone':'13800000000'})
    except Exception as e:return role,{'error':str(e)}
with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(enroll,['customer','otherCustomer']))
winners=[(role,r['enrollment']) for role,r in results if 'enrollment' in r]
assert len(winners)==1,results
winner,enrollment=winners[0];remember('capacity_enrollment',enrollment['id'])
loser=next(role for role,r in results if 'error' in r)
assert service('teacher','COURSE_ROSTER',{'classId':cid})['stats']['registered']==1
before=enrollment['entry_code']
service(winner,'CANCEL_ENROLLMENT',{'enrollmentId':enrollment['id']})
enrollment=service(winner,'ENROLL',{'classId':cid,'name':'并发合成家长','phone':'13800000000'})['enrollment']
assert enrollment['entry_code']!=before
service(winner,'CANCEL_ENROLLMENT',{'enrollmentId':enrollment['id']})
other=service(loser,'ENROLL',{'classId':cid,'name':'另一合成家长','phone':'13800000000'})['enrollment']
remember('capacity_other_enrollment',other['id'])
assert service('teacher','COURSE_ROSTER',{'classId':cid})['stats']['registered']==1
assert any(c['id']==cid for c in service(None,'LIST_CLASSES')['classes'])
share=service('teacher','GENERATE_CLASS_SHARE_CODE',{'classId':cid})
remember('capacity_share_image',share['image']['id'])
checks={'concurrentLastSeat':True,'cancelReleasesSeat':True,'reregisterReplacesCode':True,'anonymousCourseBrowsing':True,'realClassMiniCodeGenerated':True}
(OUT/'course-transactions.json').write_text(json.dumps(checks,indent=2))
print('Course concurrency, cancellation, re-registration, public browsing and share-code checks passed')
