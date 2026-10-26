"""Exercise the deployed deletion/audit flow using isolated synthetic fixtures, then remove only those fixtures."""
import json,os,secrets,subprocess,time
from urllib.error import HTTPError
from pathlib import Path
from zion_request import request
CLI=os.environ['ZION_CLI'];CWD=os.environ.get('ZION_PROJECT_CWD',str(Path(__file__).resolve().parents[1]));FID='9f60a0be-4628-4268-a769-661264846cf4'
def cli(*args):return json.loads(subprocess.check_output([CLI,*args],cwd=CWD,text=True,env={**os.environ,'MCP_LOG_FILE':'off'}))
def gql(q,v=None,token=None):
 for attempt in range(5):
  time.sleep(1.2)
  try:
   r=request({'query':q,'variables':v or {}},token);break
  except HTTPError as error:
   if error.code!=429 or attempt==4:raise
   time.sleep(min(15,3*(attempt+1)))
 if r.get('errors'):raise RuntimeError(str(r['errors']))
 return r['data']
admin=next(v['token'] for v in cli('platform','graphql','--query','query {fetchAppDetailByExIdWithoutReconcile(projectExId:"JmAxbl1MMe4"){... on Project {dataVisualizers{admin token}}}}')['fetchAppDetailByExIdWithoutReconcile']['dataVisualizers'] if v['admin'])
nonce=secrets.token_hex(7);actors={};created=[];checks={}
manifest=Path(__file__).resolve().parents[1]/'.codex-work/message-history/fixture-ids.json'
def save_ids():
 manifest.parent.mkdir(parents=True,exist_ok=True)
 fd=os.open(str(manifest),os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as file:json.dump({'nonce':nonce,'created':created},file)

def insert(table,obj):
 value=gql('mutation AuditFixture($o:'+table+'_insert_input!){saved:insert_'+table+'_one(object:$o){id}}',{'o':obj},admin)['saved']['id'];created.append((table,value));save_ids();return value
def invoke(role,op,payload):
 r=gql('mutation AuditIntegration($a:Json!){fz_invoke_action_flow(actionFlowId:"'+FID+'",versionId:1,args:$a)}',{'a':{'operation':op,'payload':payload}},actors[role]['token'])['fz_invoke_action_flow']
 if isinstance(r,str):r=json.loads(r)
 r=r.get('result',r)
 if not r.get('ok'):raise RuntimeError(str(r))
 return r['data']
def deny(fn):
 try:fn()
 except Exception:return True
 return False
try:
 for role in ['teacher','other','parent']:
  r=gql('mutation AuditAccount($u:String!,$p:String!){authenticateWithUsername(username:$u,password:$p,register:true){account{id}jwt{token}}}',{'u':'audit_test_'+nonce+'_'+role,'p':secrets.token_urlsafe(28)})['authenticateWithUsername'];actors[role]={'id':r['account']['id'],'token':r['jwt']['token']};created.append(('account',r['account']['id']));save_ids()
 teacher=insert('service_provider',{'account_id':actors['teacher']['id'],'display_name':'合成审计老师-'+nonce,'service_kind':'STAFF','service_status':'ACTIVE','can_reply':True,'can_accept_order':True,'review_role':'GENERAL'})
 insert('service_provider',{'account_id':actors['other']['id'],'display_name':'合成其他老师-'+nonce,'service_kind':'STAFF','service_status':'ACTIVE','can_reply':True,'can_accept_order':True,'review_role':'GENERAL'})
 appointment=insert('offline_appointment',{'request_key':'audit-test:'+nonce,'customer_id':actors['parent']['id'],'provider_id':teacher,'status':'孩子档案','contact_name':'合成测试家长','child_info':{'name':'合成测试孩子'}})
 base={'appointmentId':appointment}
 msg=invoke('teacher','SEND_CONSULTATION_MESSAGE',{**base,'requestKey':'test-'+nonce,'content':'合成待删除消息'})['message'];created.append(('consultation_feedback',msg['id']));checks['own_delete_flag']=msg['canDelete'] is True
 params={**base,'kind':'dialogue','messageId':msg['id']}
 checks['other_teacher_denied']=deny(lambda:invoke('other','DELETE_SERVICE_MESSAGE',params));checks['parent_denied']=deny(lambda:invoke('parent','DELETE_SERVICE_MESSAGE',params))
 removed=invoke('teacher','DELETE_SERVICE_MESSAGE',params)['message'];checks['tombstone']=removed['isDeleted'] is True and removed['content']=='' and not removed['canDelete']
 invoke('teacher','DELETE_SERVICE_MESSAGE',params)
 history=invoke('teacher','GET_SERVICE_MESSAGE_HISTORY',base);checks['idempotent_audit']=len(history['events'])==1;checks['audit_original']=history['events'][0]['beforeBody']['content']=='合成待删除消息';checks['audit_actor']=str(history['events'][0]['actorAccountId'])==str(actors['teacher']['id'])
 for event in history['events']:
  entry=('service_review_item',event['itemId'])
  if entry not in created:created.append(entry)
 checks['parent_history_denied']=deny(lambda:invoke('parent','GET_SERVICE_MESSAGE_HISTORY',base))
 polled=invoke('parent','GET_CONSULTATION_DIALOGUE',{**base,'afterId':msg['id'],'visibleIds':[msg['id']]});checks['old_message_delete_polled']=str(msg['id']) in list(map(str,polled['deletedIds']));checks['parent_no_original']='合成待删除消息' not in json.dumps(polled,ensure_ascii=False)
 checks['deleted_quote_denied']=deny(lambda:invoke('parent','SEND_CONSULTATION_MESSAGE',{**base,'content':'合成引用','requestKey':'quote-'+nonce,'quoteKind':'dialogue','quoteId':msg['id']}))
 assert all(checks.values()),checks
finally:
 # Only this run's newly created appointment is in scope; dependent rows go first.
 if 'appointment' in locals():
  for table in ['service_review_item','consultation_feedback','consultation_dialogue_read']:
   gql('mutation CleanupAuditRows($id:bigint!){delete_'+table+'(where:{_eq:{bigint_operand:{left_operand:{column:appointment_id},right_operand:{literal:$id}}}}){affected_rows}}',{'id':appointment},admin)
 priority={'offline_appointment':0,'service_provider':1,'account':2}
 for table,value in sorted([entry for entry in created if entry[0] in priority],key=lambda x:priority[x[0]]):
  if table=='account':
   assert gql('mutation RetireAuditAccount($ids:[Long]){deregisterByAccountId(ids:$ids)}',{'ids':[value]},admin)['deregisterByAccountId'] is True
   retired=gql('query VerifyRetiredAuditAccount($id:bigint!){account_by_pk(id:$id){id fz_deleted}}',{'id':value},admin)['account_by_pk'];assert not retired or retired['fz_deleted'] is True
  else:gql('mutation CleanupAuditFixture($id:bigint!){delete_'+table+'_by_pk(id:$id){id}}',{'id':value},admin)
checks['fixtures_cleaned']=True
checks['synthetic_accounts_retired']=True
manifest.unlink(missing_ok=True)
out=Path(__file__).resolve().parents[1]/'.codex-work/message-history/live-verification.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(checks,ensure_ascii=False,indent=2));print(json.dumps(checks,ensure_ascii=False))
