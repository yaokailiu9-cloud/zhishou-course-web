"""Apply reviewed annual-access deltas to two verified live nodes, preserving concurrent edits."""
import difflib,json,os,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE='596902f5746c029851933112c0e3004e1352ce93'
CLI='/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.8.0/bin/zion-mcp';CWD=os.environ.get('ZION_PROJECT_CWD',str(ROOT));OUT=ROOT/'.codex-work/education-year';OUT.mkdir(parents=True,exist_ok=True)
def run(*args):
 p=subprocess.run([CLI,*args],cwd=CWD,env={**os.environ,'MCP_LOG_FILE':'off'},text=True,capture_output=True,timeout=120)
 if p.returncode:raise RuntimeError('Zion command failed; inspect local diagnostics')
 return json.loads(p.stdout)
def old(file):return subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT,text=True)
def patch(code,file):
 a=old(file).splitlines(keepends=True);b=(ROOT/file).read_text().splitlines(keepends=True)
 for g in difflib.SequenceMatcher(a=a,b=b,autojunk=False).get_grouped_opcodes(2):
  before=''.join(a[g[0][1]:g[-1][2]]);after=''.join(b[g[0][3]:g[-1][4]])
  if code.count(before)==1:code=code.replace(before,after)
  else:assert code.count(after)==1,'Live code differs in '+file
 return code
def helper(source):return '// CHILD_EDUCATION_BUNDLE_START'+source.split('// CHILD_EDUCATION_BUNDLE_START')[1].split('// CHILD_EDUCATION_BUNDLE_END')[0]+'// CHILD_EDUCATION_BUNDLE_END'
state=run('schema','load');assert state['projectExId']=='JmAxbl1MMe4'
snapshot=run('schema','snapshot','--args','{"full":true}');(OUT/'before.json').write_text(json.dumps(snapshot,ensure_ascii=False));flow=next(f for f in snapshot['server']['actionFlows'] if f['uniqueId']=='9f60a0be-4628-4268-a769-661264846cf4')
previous=helper(old('backend/consultation/common.js'));updated=helper((ROOT/'backend/consultation/common.js').read_text());updates=[]
verify=ROOT/'.codex-work/education-bundle';verify.mkdir(parents=True,exist_ok=True)
for nid,files in [('sui9sl3ko',['backend/consultation/classes.js','backend/consultation/course-payment.js']),('dv4kpohsg',['backend/consultation/course-access.js'])]:
 n=next(n for n in flow['allNodes'] if n['uniqueId']==nid);code=n['code']
 if code.count(previous)==1:code=code.replace(previous,updated)
 else:assert code.count(updated)==1,'Live helper differs'
 for file in files:code=patch(code,file)
 (verify/(nid+'.js')).write_text(code)
 if code!=n['code']:updates.append({'name':'UPDATE_ACTION_FLOW_NODE','args':{'actionFlowId':flow['uniqueId'],'nodeId':nid,'config':{'type':'CUSTOM_CODE','code':code}}})
if '--apply' in sys.argv and updates:
 result=run('schema','tool-call','--toolCalls',json.dumps(updates,ensure_ascii=False));assert not result.get('errors'),result.get('errors')
 validation=run('schema','validate');print(json.dumps(validation));(OUT/'validation.json').write_text(json.dumps(validation))
 after=run('schema','snapshot','--args','{"full":true}');f=next(f for f in after['server']['actionFlows'] if f['uniqueId']==flow['uniqueId'])
 for u in updates:
  n=next(n for n in f['allNodes'] if n['uniqueId']==u['args']['nodeId']);assert n['code']==u['args']['config']['code'];n['code']=next(original for original in flow['allNodes'] if original['uniqueId']==u['args']['nodeId'])['code']
 assert after==snapshot,'Unrelated schema changes detected'
 print('Only two reviewed node code fields changed')
else:print('Verified annual access patch; no changes applied')
