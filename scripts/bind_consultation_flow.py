"""Install only the bounded consultation nodes after local authorization tests pass."""
import json
from pathlib import Path
from zion_cli import call
out=Path('.codex-work/consultation');nodes=json.loads((out/'flow-nodes.json').read_text());fid='9f60a0be-4628-4268-a769-661264846cf4'
args=[{'name':'ADD_CUSTOM_CODE_NODE_INPUT','args':{'actionFlowId':fid,'nodeId':nodes[0]['id'],'name':name}} for name in ['operation','payload']]

bind=[]
for index,n in enumerate(nodes):
 arg='account_id' if index==0 else 'state'
 path=['Context','读取真实登录账号','current_account_id'] if index==0 else ['Context',nodes[index-1]['label'],'state']
 bind.append({'name':'CREATE_OPTION_BINDING','args':{'schemaPath':n['path']+[{'key':'inputArgsDataBinding'},{'key':arg}],'pathInHierarchicalMenu':path}})
for name in ['operation','payload']:
 path=nodes[0]['path']+[{'key':'inputArgsDataBinding'},{'key':name}]
 options=call([{'name':'GET_DATA_BINDING_OPTIONS','args':{'schemaPath':path}}]);(out/(name+'-options.json')).write_text(json.dumps(options,ensure_ascii=False))
 bind.append({'name':'CREATE_OPTION_BINDING','args':{'schemaPath':path,'pathInHierarchicalMenu':['Context','Input',name]}})
common=Path('backend/consultation/common.js').read_text()
for n in nodes:
 bind.append({'name':'UPDATE_ACTION_FLOW_NODE','args':{'actionFlowId':fid,'nodeId':n['id'],'config':{'type':'CUSTOM_CODE','code':common+'\n'+Path('backend/consultation/'+n['key']+'.js').read_text()}}})
# Verified FLOW_END aoq6gg2vm path from add-auth.json.
end=[{'key':'server'},{'key':'actionFlows'},{'index':1},{'key':'allNodes'},{'index':1},{'key':'outputDataBindings'},{'key':'result'}]
options=call([{'name':'GET_DATA_BINDING_OPTIONS','args':{'schemaPath':end}}]);(out/'output-options.json').write_text(json.dumps(options,ensure_ascii=False))
bind.append({'name':'CREATE_OPTION_BINDING','args':{'schemaPath':end,'pathInHierarchicalMenu':['Context',nodes[-1]['label'],'state']}})
r=call(bind);(out/'bound-flow.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print('Bound service flow')
