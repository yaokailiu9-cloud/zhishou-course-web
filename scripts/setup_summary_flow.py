import json,yaml
from pathlib import Path
from zion_cli import call
fid='db7162d9-adc6-412a-ae7d-830d095ae022';out=Path('.codex-work/consultation')
r=call([
 {'name':'ADD_ACTION_FLOW_INPUT_PARAMS','args':{'actionFlowId':fid,'items':[{'name':'job_id','type':'BIGINT'}]}},
 {'name':'ADD_ACTION_FLOW_NODE','args':{'actionFlowId':fid,'afterNodeId':'i5tt5ymsl','displayName':'读取总结请求登录身份','node':{'type':'TEMPLATE_CODE','templateCodeId':'XmXk1me8OmD'}}},
 {'name':'ADD_CUSTOM_CODE_NODE_INPUT','args':{'actionFlowId':fid,'nodeId':'y5wh8mnf3','name':'job_id'}},
 {'name':'ADD_CUSTOM_CODE_NODE_INPUT','args':{'actionFlowId':fid,'nodeId':'y5wh8mnf3','name':'account_id'}},
 {'name':'ADD_CUSTOM_CODE_NODE_OUTPUT_VALUE','args':{'actionFlowId':fid,'nodeId':'y5wh8mnf3','name':'state','type':'JSONB'}},
 {'name':'ADD_CUSTOM_CODE_NODE_OUTPUT_VALUE','args':{'actionFlowId':fid,'nodeId':'y5wh8mnf3','name':'prompt','type':'TEXT'}},
 {'name':'ADD_ACTION_FLOW_NODE','args':{'actionFlowId':fid,'afterNodeId':'gyv9yr159','displayName':'保存草稿或提交音频处理','node':{'type':'CUSTOM_CODE','code':'throw new Error("总结配置中");'}}}
]);(out/'summary-setup.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(r.get('errors',r.get('responses')))
