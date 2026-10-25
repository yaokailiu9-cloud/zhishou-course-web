"""Patch only the reviewed bundle deltas into two live nodes, preserving concurrent code."""
import difflib,json,os,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE_REVISION='4e19baac77e9cc742b6f07be655cfa14538638b9'
CWD=os.environ.get('ZION_PROJECT_CWD',str(ROOT))
CLI=os.environ.get('ZION_CLI','/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.8.0/bin/zion-mcp')
OUT=ROOT/'.codex-work/education-bundle';OUT.mkdir(parents=True,exist_ok=True)
def run(*args):
 p=subprocess.run([CLI,*args],cwd=CWD,env={**os.environ,'MCP_LOG_FILE':'off'},text=True,capture_output=True,timeout=180)
 if p.returncode:raise RuntimeError('Zion operation failed; inspect local diagnostics')
 return json.loads(p.stdout)
def patch(code,file):
 old=subprocess.check_output(['git','show',BASE_REVISION+':'+file],cwd=ROOT,text=True).splitlines(keepends=True)
 new=(ROOT/file).read_text().splitlines(keepends=True)
 for group in difflib.SequenceMatcher(a=old,b=new,autojunk=False).get_grouped_opcodes(2):
  before=''.join(old[group[0][1]:group[-1][2]]);after=''.join(new[group[0][3]:group[-1][4]])
  if code.count(before)==1:code=code.replace(before,after)
  else:assert code.count(after)==1,'Live code changed: '+file+'; inspect before updating'
 return code
state=run('schema','load');assert state['projectExId']=='JmAxbl1MMe4'
snapshot=run('schema','snapshot','--args','{"full":true}')
(OUT/'before.json').write_text(json.dumps(snapshot,ensure_ascii=False))
flow=next(f for f in snapshot['server']['actionFlows'] if f['uniqueId']=='9f60a0be-4628-4268-a769-661264846cf4')
helper=(ROOT/'backend/consultation/common.js').read_text().split('// CHILD_EDUCATION_BUNDLE_START')[1].split('// CHILD_EDUCATION_BUNDLE_END')[0]
updates=[]
for node_id,files in [('sui9sl3ko',['backend/consultation/classes.js','backend/consultation/course-payment.js']),('dv4kpohsg',['backend/consultation/course-access.js'])]:
 node=next(n for n in flow['allNodes'] if n['uniqueId']==node_id);assert node['type']=='CUSTOM_CODE'
 code=node['code']
 for file in files:code=patch(code,file)
 block='// CHILD_EDUCATION_BUNDLE_START'+helper+'// CHILD_EDUCATION_BUNDLE_END\n'
 if 'CHILD_EDUCATION_BUNDLE_START' not in code:code=block+code
 else:assert code.count(block)==1,'Live bundle helper differs; review before updating'
 (OUT/(node_id+'.js')).write_text(code)
 if code==node['code']:continue
 updates.append({'name':'UPDATE_ACTION_FLOW_NODE','args':{'actionFlowId':flow['uniqueId'],'nodeId':node_id,'config':{'type':'CUSTOM_CODE','code':code}}})
(OUT/'updates.json').write_text(json.dumps(updates,ensure_ascii=False))
if not updates:print('Bundle nodes already match the reviewed source');raise SystemExit(0)
if '--apply' in __import__('sys').argv:
 result=run('schema','tool-call','--toolCalls',json.dumps(updates,ensure_ascii=False));assert not result.get('errors'),result.get('errors')
 validation=run('schema','validate');(OUT/'validation.json').write_text(json.dumps(validation,ensure_ascii=False))
 print(json.dumps({'staged':True,'nodes':[u['args']['nodeId'] for u in updates],'validation':validation},ensure_ascii=False))
else:print('Verified exact bundle deltas against live nodes; no changes applied')
