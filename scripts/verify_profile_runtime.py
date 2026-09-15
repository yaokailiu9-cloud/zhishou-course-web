"""Check deployed profile permissions using only recorded synthetic accounts."""
import json
from consultation_runtime_test import FIX, OUT, gql, save, invoke
from zion_request import request

f=json.loads(FIX.read_text()); a=f['actors']['otherCustomer']; b=f['actors']['customer']
q='query ProfileOwner($id:bigint!){account_by_pk(id:$id){id account_profile_id account_profile{id user_name}}}'
current=gql(q,{'id':a['id']},a['token'])['account_by_pk']
pid=current['account_profile_id']
if not pid:
    created=gql('mutation CreateTestProfile($o:account_profile_insert_input!){insert_account_profile_one(object:$o){id}}', {'o':{'user_name':a['username'],'city':'合成联调资料'}}, a['token'])
    row=created['insert_account_profile_one']
    if not row:
        raise RuntimeError('Profile insert returned no ID under self-only SELECT; inspect before retry')
    pid=row['id']; f['ids']['profile']=pid; save(f)
    gql('mutation LinkTestProfile($id:bigint!,$p:bigint!){update_account_by_pk(pk_columns:{id:$id},_set:{account_profile_id:$p}){id}}',{'id':a['id'],'p':pid},a['token'])
query='query ReadTestProfile($id:bigint!){account_profile_by_pk(id:$id){id user_name}}'
checks={}
for role,token in [('self',a['token']),('other',b['token']),('anonymous',None)]:
    response=request({'query':query,'variables':{'id':pid}},token)
    readable=bool(((response.get('data') or {}).get('account_profile_by_pk') or {}).get('id'))
    checks[role+'_read']=readable
    assert readable==(role=='self'),(role,response)
write='mutation UpdateTestProfile($id:bigint!){update_account_profile_by_pk(pk_columns:{id:$id},_set:{city:"合成联调更新"}){id}}'
for role,token in [('self',a['token']),('other',b['token']),('anonymous',None)]:
    response=request({'query':write,'variables':{'id':pid}},token)
    writable=bool(((response.get('data') or {}).get('update_account_profile_by_pk') or {}).get('id'))
    checks[role+'_write']=writable
    assert writable==(role=='self'),(role,response)
for name,available in [(a['username'],True),(b['username'],False)]:
    response=invoke(a,'CHECK_USERNAME',{'name':name,'excludeAccountId':b['id']})
    result=response.get('result',response)
    if isinstance(result,str):result=json.loads(result)
    assert result['data']['available']==available
checks['username_check']=True
(OUT/'profile-permissions.json').write_text(json.dumps(checks,indent=2))
print('Profile creation, own save, cross-account denial and username check passed')
