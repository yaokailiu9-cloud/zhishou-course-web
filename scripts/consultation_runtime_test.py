"""Bounded integration checks: test-only accounts, fixture IDs tracked, no credentials printed."""
import json,os,secrets,sys,time
from pathlib import Path
from zion_cli import run
from zion_request import request
OUT=Path(__file__).resolve().parents[1]/'.codex-work/consultation'
FIX=OUT/'runtime-fixtures.json'
FID='9f60a0be-4628-4268-a769-661264846cf4'
def save(value):
 fd=os.open(str(FIX),os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as f:json.dump(value,f)
def admin_token():
 r=run('platform','graphql','--query','query { fetchAppDetailByExIdWithoutReconcile(projectExId: "JmAxbl1MMe4") { ... on Project { dataVisualizers {admin token} } } }')
 return next(x['token'] for x in r['fetchAppDetailByExIdWithoutReconcile']['dataVisualizers'] if x['admin'])
def gql(q,v=None,token=None):
 r=request({'query':q,'variables':v or {}},token)
 if r.get('errors'):raise RuntimeError(json.dumps(r['errors'],ensure_ascii=False))
 return r['data']
def invoke(actor,op,p=None):
 r=gql('mutation Service($args: Json!) {fz_invoke_action_flow(actionFlowId:"'+FID+'",versionId:1,args:$args)}',{'args':{'operation':op,'payload':p or {}}},actor.get('token') if actor else None)['fz_invoke_action_flow']
 if isinstance(r,str):r=json.loads(r)
 return r
if __name__=='__main__':
 phase=sys.argv[1]
 f=json.loads(FIX.read_text()) if FIX.exists() else {'nonce':secrets.token_hex(5),'actors':{},'ids':{}}
 if phase=='accounts':
  for role in ['teacher','otherTeacher','customer','otherCustomer']:
   if role in f['actors']:continue
   password=secrets.token_urlsafe(24);username='consulttest_'+f['nonce']+'_'+role.lower()
   r=gql('mutation TestAccount($u:String!,$p:String!){authenticateWithUsername(username:$u,password:$p,register:true){account{id}jwt{token}}}',{'u':username,'p':password})['authenticateWithUsername']
   f['actors'][role]={'id':r['account']['id'],'username':username,'password':password,'token':r['jwt']['token']};save(f)
  print('Created/reused four isolated integration accounts; credentials kept private.')
 if phase=='account-isolation':
  a=f['actors']['customer'];b=f['actors']['otherCustomer']
  result={}
  q='query TestAccountIsolation($id:bigint!){account_by_pk(id:$id){id username}}'
  for label,token in [('anonymous',None),('different_account',a['token']),('self',b['token'])]:
   r=request({'query':q,'variables':{'id':b['id']}},token);result[label]={'blocked':bool(r.get('errors')) or not (r.get('data') or {}).get('account_by_pk')}
  # Change only the synthetic account's already-known test nickname; no production user is touched.
  mutation='mutation TestAccountWrite($id:bigint!){update_account_by_pk(pk_columns:{id:$id},_set:{wechat_nickname:"isolated-fixture"}){id}}'
  r=request({'query':mutation,'variables':{'id':b['id']}},a['token']);result['cross_write']={'blocked':bool(r.get('errors')) or not (r.get('data') or {}).get('update_account_by_pk')}
  (OUT/'account-isolation.json').write_text(json.dumps(result,indent=2));print(result)
 if phase=='providers':
  token=admin_token()
  for key in ['teacher','otherTeacher']:
   if key in f['ids']:continue
   actor=f['actors'][key]
   r=gql('mutation TestProvider($object: service_provider_insert_input!){insert_service_provider_one(object:$object){id}}',{'object':{'account_id':actor['id'],'display_name':'联调专用-'+key,'service_status':'ACTIVE','can_reply':True,'can_accept_order':True}},token)
   f['ids'][key]=r['insert_service_provider_one']['id'];save(f)
  print('Created/reused two test-only service provider fixtures.')
 if phase=='smoke':
  results={}
  for role,op in [(None,'LIST_CLASSES'),(None,'MY_OVERVIEW'),('customer','MY_OVERVIEW'),('teacher','STAFF_OVERVIEW')]:
   try:results[str(role)+':'+op]=invoke(f['actors'].get(role),op)
   except Exception as e:results[str(role)+':'+op]={'error':str(e)}
  (OUT/'runtime-smoke.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False)[:6000])
