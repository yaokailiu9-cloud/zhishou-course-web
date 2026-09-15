import json, yaml
from pathlib import Path
from zion_cli import call
OUT=Path('.codex-work/consultation')
FID='9f60a0be-4628-4268-a769-661264846cf4'
steps=[('authorize','校验账号与服务人员身份'),('classes','处理免费公开课报名及到课核实'),('appointments','校验资格并处理线下预约'),('followup','保存咨询记录与执行反馈'),('summary','处理文字及面谈总结任务')]
nodes=[]; previous='jcp0wle94'
for key,label in steps:
 r=call([{'name':'ADD_ACTION_FLOW_NODE','args':{'actionFlowId':FID,'afterNodeId':previous,'displayName':label,'node':{'type':'CUSTOM_CODE','code':'throw new Error("服务配置中");'}}}])
 item=yaml.safe_load(r['responses'][0])[0]
 nodes.append({'key':key,'label':label,'id':item['uniqueId'],'path':item['schemaPath']})
 previous=item['uniqueId']
 (OUT/'flow-nodes.json').write_text(json.dumps(nodes,ensure_ascii=False,indent=2))
 print('Created '+key,flush=True)
inputs=[]
for n in nodes:
 arg='account_id' if n['key']=='authorize' else 'state'
 inputs.extend([{'name':'ADD_CUSTOM_CODE_NODE_INPUT','args':{'actionFlowId':FID,'nodeId':n['id'],'name':arg}},{'name':'ADD_CUSTOM_CODE_NODE_OUTPUT_VALUE','args':{'actionFlowId':FID,'nodeId':n['id'],'name':'state','type':'JSONB'}}])
r=call(inputs)
(OUT/'node-params.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
opts=[{'name':'GET_DATA_BINDING_OPTIONS','args':{'schemaPath':n['path']+[{'key':'inputArgsDataBinding'},{'key':'account_id' if n['key']=='authorize' else 'state'}]}} for n in nodes]
r=call(opts)
(OUT/'binding-options.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print('Saved binding options',flush=True)
