"""Update verified existing service nodes only; preserve bindings and permissions."""
import json
from pathlib import Path
from zion_cli import run,call
out=Path('.codex-work/course-reference')
state=run('schema','load')
assert state['projectExId']=='JmAxbl1MMe4', 'Wrong project; no changes applied'
# Never stage these privileged handlers against an unprotected or incomplete schema.
snapshot=run('schema','snapshot','--args','{"full":true}')
tables={t['name']:t for t in snapshot['server']['dataModel']['tableMetadata']}
for name,required in [('public_class_enrollment',{'guardian_consent_at','feedback_content','feedback_available_at','feedback_revision','feedback_reviewer_id'}),('service_provider',{'service_kind'})]:
 assert required <= {c['name'] for c in tables[name]['columnMetadata']}, 'Missing verified fields: '+name
for role in snapshot['server']['roleConfigs']:
 perms=role['permissionConfig']['tablePermissionById']
 for name in ['public_class_enrollment','course_referral']:
  assert not any(perms.get(tables[name]['id'],{}).get(k) for k in ['insert','update','select','delete','aggregate','count']), 'Close default data permissions in Zion before updating: '+name
 assert not any(perms.get(tables['service_provider']['id'],{}).get(k) for k in ['insert','update','delete']), 'Close provider writes in Zion before updating'
out.mkdir(parents=True,exist_ok=True)

flows=[('9f60a0be-4628-4268-a769-661264846cf4',[('h4i3zzuex','authorize'),('sui9sl3ko','classes'),('g3oknp94t','appointments'),('z07supad5','followup'),('dv4kpohsg','summary')]),('db7162d9-adc6-412a-ae7d-830d095ae022',[('y5wh8mnf3','summary-prepare'),('po4499ntk','summary-save')])]
details=call([{'name':'GET_ACTION_FLOW_DETAIL','args':{'actionFlowId':fid}} for fid,nodes in flows]);(out/'flows-pre-update.json').write_text(json.dumps(details,ensure_ascii=False,indent=2))
common=Path('backend/consultation/common.js').read_text();updates=[]
for (fid,nodes),detail in zip(flows,details['responses']):
 for node,file in nodes:
  assert 'id: '+node+'\n    type: CUSTOM_CODE' in detail, 'Node identity mismatch'
  code=common+'\n'+Path('backend/consultation/'+file+'.js').read_text()
  if file=='authorize': code+='\n'+Path('backend/consultation/checkin.js').read_text()
  if file=='classes': code=code.replace('// FAMILY_HANDLERS: build script inserts family.js here.',Path('backend/consultation/family.js').read_text())
  updates.append({'name':'UPDATE_ACTION_FLOW_NODE','args':{'actionFlowId':fid,'nodeId':node,'config':{'type':'CUSTOM_CODE','code':code}}})
r=call(updates);(out/'code-updated.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
validation=run('schema','validate');(out/'schema-validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2))
print('Updated 7 existing code nodes in target editing schema; backend not synchronized.')
print(json.dumps(validation,ensure_ascii=False)[:1500])
