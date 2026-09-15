"""Direct runtime GraphQL fallback; credentials are never printed or written to outputs."""
import json,sys,urllib.request
from pathlib import Path
URL='https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2'
def request(payload,token=None):
 headers={'Content-Type':'application/json'}
 if token:headers['Authorization']='Bearer '+token
 req=urllib.request.Request(URL,data=json.dumps(payload).encode(),headers=headers)
 with urllib.request.urlopen(req,timeout=60) as r:return json.loads(r.read())
if __name__=='__main__':
 inp,out=sys.argv[1:3];token=None
 if len(sys.argv)>3 and sys.argv[3]=='--admin':
  from zion_cli import run
  data=run('platform','graphql','--query','query { fetchAppDetailByExIdWithoutReconcile(projectExId: "JmAxbl1MMe4") { ... on Project { dataVisualizers { admin token } } } }')
  visualizers=data['fetchAppDetailByExIdWithoutReconcile']['dataVisualizers']
  token=next(v['token'] for v in visualizers if v.get('admin'))
 elif len(sys.argv)>3:token=Path(sys.argv[3]).read_text().strip()
 result=request(json.loads(Path(inp).read_text()),token);Path(out).write_text(json.dumps(result,ensure_ascii=False,indent=2));print('Saved runtime response '+out)
