"""Remove contact requirements only for the education bundle in the verified live payment node."""
import json,os,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CLI='/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.8.0/bin/zion-mcp'
CWD=os.environ.get('ZION_PROJECT_CWD',str(ROOT));OUT=ROOT/'.codex-work/education-account';OUT.mkdir(parents=True,exist_ok=True)
def run(*args):
 p=subprocess.run([CLI,*args],cwd=CWD,env={**os.environ,'MCP_LOG_FILE':'off'},text=True,capture_output=True,timeout=120)
 if p.returncode:raise RuntimeError('Zion command failed; inspect local diagnostics')
 return json.loads(p.stdout)
state=run('schema','load');assert state['projectExId']=='JmAxbl1MMe4'
snapshot=run('schema','snapshot','--args','{"full":true}');(OUT/'before.json').write_text(json.dumps(snapshot,ensure_ascii=False))
for table in ['course_registration_order','public_class_enrollment']:
 t=next(t for t in snapshot['server']['dataModel']['tableMetadata'] if t['name']==table)
 for field in ['registrant_name','phone']:assert next(c for c in t['columnMetadata'] if c['name']==field)['required'] is False
flow=next(f for f in snapshot['server']['actionFlows'] if f['uniqueId']=='9f60a0be-4628-4268-a769-661264846cf4');node=next(n for n in flow['allNodes'] if n['uniqueId']=='sui9sl3ko')
before="registrant_name:text(p.name,'姓名',60,true),phone:phone(p.phone),course_title_snapshot:"
after="registrant_name:educationBundle?null:text(p.name,'姓名',60,true),phone:educationBundle?null:phone(p.phone),course_title_snapshot:"
assert (ROOT/'backend/consultation/course-payment.js').read_text().count(after)==1
code=node['code']
if code.count(after)!=1:
 assert code.count(before)==1,'Live payment handler changed; review before editing'
 code=code.replace(before,after)
verify=ROOT/'.codex-work/education-bundle';verify.mkdir(parents=True,exist_ok=True)
(verify/'sui9sl3ko.js').write_text(code)
(verify/'dv4kpohsg.js').write_text(next(n for n in flow['allNodes'] if n['uniqueId']=='dv4kpohsg')['code'])
if '--apply' in sys.argv and code!=node['code']:
 result=run('schema','tool-call','--toolCalls',json.dumps([{'name':'UPDATE_ACTION_FLOW_NODE','args':{'actionFlowId':flow['uniqueId'],'nodeId':node['uniqueId'],'config':{'type':'CUSTOM_CODE','code':code}}}],ensure_ascii=False));assert not result.get('errors'),result.get('errors')
 validation=run('schema','validate');(OUT/'validation.json').write_text(json.dumps(validation));print(json.dumps(validation))
 updated=run('schema','snapshot','--args','{"full":true}')
 f=next(f for f in updated['server']['actionFlows'] if f['uniqueId']==flow['uniqueId']);n=next(n for n in f['allNodes'] if n['uniqueId']==node['uniqueId']);assert n['code']==code;n['code']=node['code'];assert updated==snapshot,'Unrelated schema changes detected'
 print('Only the payment node code changed; model and permissions unchanged')
else:print('Contact-free payment patch verified; no changes applied')
