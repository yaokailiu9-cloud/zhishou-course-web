"""Create only tracked synthetic Zion identities for the requested three-role review."""
import json,os,secrets,datetime,sys
from pathlib import Path
from consultation_runtime_test import gql,admin_token
ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'.codex-work/role-demo/zion-accounts.json'
FILE.parent.mkdir(parents=True,exist_ok=True)
c=json.loads(FILE.read_text()) if FILE.exists() else {'projectId':'JmAxbl1MMe4','nonce':secrets.token_hex(5),'actors':{}}
def save():
 fd=os.open(FILE,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as f:json.dump(c,f,ensure_ascii=False,indent=2)
def service(actor,operation,payload):
 r=gql('mutation RoleDemoService($args:Json!){fz_invoke_action_flow(actionFlowId:"9f60a0be-4628-4268-a769-661264846cf4",versionId:1,args:$args)}',{'args':{'operation':operation,'payload':payload}},actor['token'])['fz_invoke_action_flow']
 if isinstance(r,str):r=json.loads(r)
 r=r.get('result',r)
 if isinstance(r,str):r=json.loads(r)
 if not r.get('ok'):raise RuntimeError('Role demo action failed: '+str(r)[:300])
 return r['data']
for role,label in [('manager','联调管理·林老师'),('agent','联调代理·陈同学'),('customer','联调客户·周家长')]:
 a=c['actors'].setdefault(role,{'username':'role_demo_'+c['nonce']+'_'+role,'password':secrets.token_urlsafe(30),'name':label+'·'+c['nonce'][:3]});save()
 r=gql('mutation DemoIdentity($u:String!,$p:String!,$register:Boolean!){authenticateWithUsername(username:$u,password:$p,register:$register){account{id}jwt{token}}}',{'u':a['username'],'p':a['password'],'register':not bool(a.get('id'))})['authenticateWithUsername'];a.update(id=r['account']['id'],token=r['jwt']['token']);save()
 gql('mutation DemoName($id:bigint!,$object:account_set_input!){update_account_by_pk(pk_columns:{id:$id},_set:$object){id}}',{'id':a['id'],'object':{'wechat_nickname':a['name']}},a['token'])
 print('Verified test account',role,a['id'],flush=True)
if '--accounts-only' in sys.argv:
 print('Three real Zion account identities verified; role and course setup pending schema deployment.');sys.exit(0)
if not c.get('managerProviderId'):
 r=gql('mutation DemoManager($object:service_provider_insert_input!){insert_service_provider_one(object:$object){id}}',{'object':{'account_id':c['actors']['manager']['id'],'display_name':c['actors']['manager']['name'],'service_kind':'STAFF','service_status':'ACTIVE','can_reply':True,'can_accept_order':True}},admin_token())
 c['managerProviderId']=r['insert_service_provider_one']['id'];save()
if not c.get('classId'):
 c['classId']=service(c['actors']['manager'],'SAVE_CLASS',{'title':'【三端联调专用】父母有道，孩子有路','description':'随机模拟家庭演示，不面向真实报名','status':'PUBLISHED','startsAt':(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=7)).isoformat(),'city':'联调专用','capacity':3,'groupGuide':'仅供本次三端流程演示，无真实群邀请'})['id'];save()
for role,a in c['actors'].items():print(role,service(a,'FAMILY_OVERVIEW',{})['role'],flush=True)
print('Verified Zion demo course',c['classId'],'. Credentials stay in local private file.')
