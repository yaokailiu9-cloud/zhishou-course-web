"""Bounded real-backend checks with fresh synthetic accounts; never prints credentials."""
import json,secrets
from pathlib import Path
from consultation_runtime_test import gql,admin_token,FID
from zion_request import request
out=Path(__file__).resolve().parents[1]/'.codex-work/service-review';out.mkdir(parents=True,exist_ok=True)
actors={};created=[];results={};token=admin_token();nonce=secrets.token_hex(5)
def invoke(role,op,p=None):
 r=gql('mutation ReviewIntegration($args:Json!){fz_invoke_action_flow(actionFlowId:"'+FID+'",versionId:1,args:$args)}',{'args':{'operation':op,'payload':p or {}}},actors[role]['token'])['fz_invoke_action_flow']
 if isinstance(r,str):r=json.loads(r)
 r=r.get('result',r);assert r.get('ok') is True,str(r);return r['data']
def denied(fn):
 try:fn();return False
 except Exception:return True
def insert(table,obj):
 r=gql('mutation ReviewFixture($o:'+table+'_insert_input!){saved:insert_'+table+'_one(object:$o){id}}',{'o':obj},token)['saved'];created.append((table,r['id']));return r['id']
def blocked_read(jwt):
 r=request({'query':'query ReviewPrivate{service_review_item(limit:1){id body}}'},jwt);return bool(r.get('errors')) or not (r.get('data') or {}).get('service_review_item')
try:
 for role in ['general','director','guardian','customer','outsider']:
  password=secrets.token_urlsafe(24);username='reviewtest_'+nonce+'_'+role
  r=gql('mutation ReviewAccount($u:String!,$p:String!){authenticateWithUsername(username:$u,password:$p,register:true){account{id}jwt{token}}}',{'u':username,'p':password})['authenticateWithUsername'];actors[role]={'id':r['account']['id'],'token':r['jwt']['token']}
 general=insert('service_provider',{'account_id':actors['general']['id'],'display_name':'合成总管-'+nonce,'service_kind':'STAFF','service_status':'ACTIVE','can_reply':True,'can_accept_order':True,'review_role':'GENERAL'})
 for role,identity in [('guardian','GUARDIAN'),('director','DIRECTOR')]:
  invoke('general','SET_ACCOUNT_IDENTITY',{'targetAccountId':actors[role]['id'],'identity':identity,'note':'合成流转验证-'+nonce})
 staff=invoke('general','LIST_SERVICE_STAFF')['items'];guardian=next(i['id'] for i in staff if str(i['account_id'])==str(actors['guardian']['id']));director=next(i['id'] for i in staff if str(i['account_id'])==str(actors['director']['id']))
 created.extend([('service_provider',guardian),('service_provider',director)])
 aid=insert('offline_appointment',{'request_key':'reviewtest:'+nonce,'customer_id':actors['customer']['id'],'provider_id':general,'contact_name':'合成家长-'+nonce,'status':'孩子档案','child_info':{'name':'合成孩子','age':10,'grade':'五年级'}})
 detail=invoke('general','GET_SERVICE_CASE',{'appointmentId':aid})
 invoke('general','ASSIGN_SERVICE_CASE',{'appointmentId':aid,'previousUpdatedAt':detail['appointment']['updated_at'],'guardianId':guardian,'directorId':director,'level':'A','subLevel':'1','danger':'合成危险因素','priority':True,'memo':'合成备忘录'})
 overview=invoke('guardian','SERVICE_CHAT_OVERVIEW');results['assigned_guardian_sees_case']=any(i['id']==aid for i in overview['cases'])
 results['outsider_blocked']=denied(lambda:invoke('outsider','GET_SERVICE_CASE',{'appointmentId':aid,'role':'GENERAL'}))
 payload={'appointmentId':aid,'content':'合成家长反馈','requestKey':nonce}
 invoke('customer','SEND_SERVICE_FEEDBACK',payload);invoke('customer','SEND_SERVICE_FEEDBACK',payload)
 detail=invoke('guardian','GET_SERVICE_CASE',{'appointmentId':aid});assert len(detail['feedback'])==1;fb=detail['feedback'][0]['id'];created.append(('consultation_feedback',fb));results['feedback_retry_idempotent']=True
 item=invoke('guardian','SAVE_SERVICE_DRAFT',{'appointmentId':aid,'kind':'REPLY','feedbackId':fb,'content':'合成回复待审核'})['item'];created.append(('service_review_item',item['id']))
 results['draft_hidden']=not invoke('customer','GET_SERVICE_CASE',{'appointmentId':aid})['feedback'][0]['reply'].get('body')
 item=invoke('guardian','REVIEW_SERVICE_ITEM',{'itemId':item['id'],'revision':item['revision'],'action':'SUBMIT'})['item'];assert item['stage']=='DIRECTOR'
 results['guardian_cannot_approve']=denied(lambda:invoke('guardian','REVIEW_SERVICE_ITEM',{'itemId':item['id'],'revision':item['revision'],'action':'APPROVE','role':'GENERAL'}))
 item=invoke('director','REVIEW_SERVICE_ITEM',{'itemId':item['id'],'revision':item['revision'],'action':'APPROVE'})['item'];assert item['stage']=='GENERAL'
 from datetime import datetime,timezone
 item=invoke('general','REVIEW_SERVICE_ITEM',{'itemId':item['id'],'revision':item['revision'],'action':'APPROVE','availableAt':datetime.now(timezone.utc).isoformat()})['item'];assert item['stage']=='APPROVED'
 results['three_stage_reply_visible']=invoke('customer','GET_SERVICE_CASE',{'appointmentId':aid})['feedback'][0]['reply']['body']['content']=='合成回复待审核'
 plan=invoke('guardian','SAVE_SERVICE_DRAFT',{'appointmentId':aid,'kind':'PLAN','summary':'合成方案','advice':'合成执行建议'})['item'];created.append(('service_review_item',plan['id']))
 plan=invoke('guardian','REVIEW_SERVICE_ITEM',{'itemId':plan['id'],'revision':plan['revision'],'action':'SUBMIT'})['item']
 plan=invoke('director','REVIEW_SERVICE_ITEM',{'itemId':plan['id'],'revision':plan['revision'],'action':'SUPPLEMENT','note':'请补充合成信息'})['item']
 waiting=invoke('customer','GET_SERVICE_CASE',{'appointmentId':aid})['plan'];assert waiting['supplementNote']=='请补充合成信息' and 'body' not in waiting
 invoke('customer','SUPPLEMENT_SERVICE_CASE',{'appointmentId':aid,'itemId':plan['id'],'revision':plan['revision'],'content':'合成补充信息'});results['parent_supplement_returns_to_draft']=invoke('guardian','GET_SERVICE_CASE',{'appointmentId':aid})['plan']['stage']=='DRAFT'
 results['anonymous_private_table_denied']=blocked_read(None);results['customer_private_table_denied']=blocked_read(actors['customer']['token'])
 assert all(results.values()),results
 (out/'runtime-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
finally:
 # Delete only IDs created by this run, in dependency order.
 for table in ['service_review_item','consultation_feedback','offline_appointment','service_provider']:
  for t,key in created:
   if t==table:gql('mutation ReviewCleanup($id:bigint!){delete_'+table+'_by_pk(id:$id){id}}',{'id':key},token)
 for actor in actors.values():
  # Remove synthetic permission audit rows by their actual target relation.
  where={'_eq':{'bigint_operand':{'left_operand':{'column':'target_account_id'},'right_operand':{'literal':actor['id']}}}}
  gql('mutation ReviewAuditCleanup($w:identity_change_log_bool_exp!){delete_identity_change_log(where:$w){affected_rows}}',{'w':where},token)
  gql('mutation RetireReviewAccount($id:bigint!){update_account_by_pk(pk_columns:{id:$id},_set:{fz_deleted:true}){id}}',{'id':actor['id']},token)
 print('Synthetic business records cleaned; synthetic credential accounts retired.')
