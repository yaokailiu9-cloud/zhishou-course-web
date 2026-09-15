"""Exercise only fixtures recorded by consultation_runtime_test.py; no real customers."""
import base64,hashlib,json,sys,time,urllib.request
from datetime import datetime,timedelta,timezone
from consultation_runtime_test import FIX,OUT,save,invoke,gql,admin_token
f=json.loads(FIX.read_text());actors=f['actors'];ids=f['ids'];checks=[]
def stamp(seconds):return (datetime.now(timezone.utc)+timedelta(seconds=seconds)).isoformat()
def service(role,op,payload=None):
 r=invoke(actors.get(role),op,payload)
 if isinstance(r,str):r=json.loads(r)
 r=r.get('result',r)
 if isinstance(r,str):r=json.loads(r)
 if not r.get('ok'):raise RuntimeError(str(r))
 return r['data']
def deny(role,op,payload,expected):
 try:service(role,op,payload)
 except Exception as e:
  if expected not in str(e):raise
  checks.append(op+' rejected '+str(role));return
 raise AssertionError(op+' unexpectedly allowed '+str(role))
def remember(key,value):ids[key]=value;save(f);return value
mode=sys.argv[1]
if mode=='core':
 deny('customer','SAVE_CLASS',{'title':'forged'},'工作人员')
 deny('customer','CREATE_APPOINTMENT',{'requestKey':f['nonce']+'blocked','requestedTime':'下周'},'公开课')
 title='接口联调专用-'+f['nonce']
 if not ids.get('class'):
  remember('class',service('teacher','SAVE_CLASS',{'title':title,'description':'仅测试，完成后清理','startsAt':stamp(86400),'groupGuide':'联调专用，不联系真实用户','status':'PUBLISHED'})['id'])
 cid=ids['class']
 if not ids.get('enrollment'):
  payload={'classId':cid,'name':'联调家长','phone':'13800000000'}
  r=service('customer','ENROLL',payload);remember('enrollment',r['enrollment']['id'])
  assert service('customer','ENROLL',payload)['enrollment']['id']==ids['enrollment'];checks.append('enrollment idempotent')
  assert not service('customer','MY_OVERVIEW')['eligible'];checks.append('registration does not grant eligibility')
  deny('customer','VERIFY_ENROLLMENT',{'enrollmentId':ids['enrollment'],'attendanceStatus':'ATTENDED'},'工作人员')
  ticket=service('customer','GET_ENROLLMENT',{'enrollmentId':ids['enrollment']})['enrollment']
  entry={'classId':cid,'entryCode':'EMPATH-ENTRY:'+ticket['entry_code']}
  assert service('teacher','LOOKUP_ENTRY',entry)['enrollment']['id']==ids['enrollment']
  assert not service('customer','MY_OVERVIEW')['eligible'];checks.append('scan lookup alone does not grant eligibility')
  service('teacher','SAVE_CLASS',{'id':cid,'title':title,'description':'仅测试，完成后清理','startsAt':stamp(-3600),'groupGuide':'联调专用','status':'PUBLISHED'})
  service('teacher','CHECK_IN',entry)
  assert service('teacher','CHECK_IN',entry)['alreadyCheckedIn'];checks.append('QR attendance confirmation is idempotent')
 assert service('customer','MY_OVERVIEW')['eligible'];checks.append('verified attendance grants application access')
 payload={'requestKey':f['nonce']+'booking','requestedTime':'联调时间','concerns':'仅测试家庭阅读安排','enrollmentId':ids['enrollment']}
 aid=remember('appointment',service('customer','CREATE_APPOINTMENT',payload)['id']);assert service('customer','CREATE_APPOINTMENT',payload)['id']==aid
 deny('otherCustomer','GET_APPOINTMENT',{'appointmentId':aid},'其他客户')
 deny('otherTeacher','CONFIRM_APPOINTMENT',{'appointmentId':aid,'confirmedAt':stamp(120)},'其他客户')
 a=service('teacher','GET_APPOINTMENT',{'appointmentId':aid})['appointment']
 if a['status']=='PENDING':service('teacher','CONFIRM_APPOINTMENT',{'appointmentId':aid,'confirmedAt':stamp(2),'note':'仅联调，无实际到店'})
 service('customer','SAVE_CHILD_INFO',{'appointmentId':aid,'childInfo':{'name':'联调孩子','age':8,'guardian':'联调家长','relationship':'监护人','phone':'13800000000','concerns':'希望每天共同阅读十分钟','goals':'耐心倾听'}})
 service('customer','SEND_NOTE',{'appointmentId':aid,'content':'我希望每天晚上和孩子一起阅读十分钟。','requestKey':f['nonce']+'note'})
 a=service('teacher','GET_APPOINTMENT',{'appointmentId':aid});nid=remember('note',a['feedbacks'][0]['id'])
 service('teacher','REPLY_FEEDBACK',{'feedbackId':nid,'content':'先听孩子说完，再一起选择一本书，下周复盘。','requestKey':f['nonce']+'note-reply'})
 service('teacher','SAVE_RECORD',{'appointmentId':aid,'summary':'沟通家庭共读安排。','advice':[{'key':'reading','content':'每天一起阅读十分钟，下周复盘'}],'confirm':True})
 service('customer','SEND_FEEDBACK',{'appointmentId':aid,'adviceKey':'reading','content':'今天已经一起读了十分钟，孩子愿意继续。','requestKey':f['nonce']+'feedback'})
 detail=service('teacher','GET_APPOINTMENT',{'appointmentId':aid});feedback=next(x for x in detail['feedbacks'] if x['advice_key']=='reading');remember('feedback',feedback['id'])
 service('teacher','REPLY_FEEDBACK',{'feedbackId':feedback['id'],'content':'保持倾听，记录孩子自己选书的变化。','requestKey':f['nonce']+'feedback-reply'})
 service('teacher','COMPLETE_APPOINTMENT',{'appointmentId':aid})
 detail=service('customer','GET_APPOINTMENT',{'appointmentId':aid});assert detail['appointment']['status']=='COMPLETED';assert detail['record']['status']=='CONFIRMED';assert len(detail['feedbacks'])==2
 checks.append('appointment -> child info -> confirmed record -> feedback/reply -> completion')
 (OUT/'end-to-end-core.json').write_text(json.dumps({'passed':True,'checks':checks},ensure_ascii=False,indent=2));print('Core integration passed:',len(checks),'checks')
if mode=='text':
 aid=ids['appointment']
 jid=remember('text_job',service('teacher','SUMMARIZE_TEXT',{'appointmentId':aid,'requestKey':f['nonce']+'summary'})['id']);print('Text summary job queued:',jid)
if mode=='audio':
 audio=OUT/'synthetic-audio.mp3'
 data=audio.read_bytes()
 if len(data)<10000:raise RuntimeError('Synthetic speech fixture is missing or empty')
 if not ids.get('audio_job'):
  payload={'appointmentId':ids['appointment'],'consentedAt':stamp(0),
   'sizeBytes':len(data),'md5Base64':base64.b64encode(hashlib.md5(data).digest()).decode(),
   'requestKey':f['nonce']+'audio'}
  job=service('teacher','PREPARE_RECORDING',payload)
  remember('audio_job',job['id']);remember('audio_file',job['upload']['fileId'])
  upload=job['upload']
  if not upload['uploadUrl'].startswith('https://'):raise RuntimeError('Expected HTTPS upload')
  headers={'Content-Type':upload['contentType'],**(upload.get('uploadHeaders') or {})}
  req=urllib.request.Request(upload['uploadUrl'],data=data,headers=headers,method='PUT')
  with urllib.request.urlopen(req,timeout=60) as response:
   if response.status not in range(200,300):raise RuntimeError('Synthetic recording upload failed')
  remember('audio_uploaded',True)
 if not ids.get('audio_uploaded'):raise RuntimeError('Previous upload failed; inspect tracked fixture before retry')
 service('teacher','PROCESS_RECORDING',{'appointmentId':ids['appointment'],'jobId':ids['audio_job']})
 print('Synthetic audio summary queued:',ids['audio_job'])
if mode=='poll':
 d=service('teacher','GET_APPOINTMENT',{'appointmentId':ids['appointment']});jobs=d['summaryJobs'];(OUT/'summary-results.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2));print([{k:j.get(k) for k in ['id','source','status','draft','error_message']} for j in jobs])
