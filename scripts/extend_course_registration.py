"""Add missing course registration fields/constraints after inspecting the live target."""
import json
from pathlib import Path
from zion_cli import run, call
from document_course_model import document_model

OUT = Path('.codex-work/course-reference')

def field(name, label, kind='TEXT', default=None):
    item = dict(apiName=name, displayName=label, basicTypeNameOrTypeId=kind, required=default is not None)
    if default is not None: item['defaultValue'] = default
    return item

ADDITIONS = {
 'public_class': [field('cover','课程封面','IMAGE'), field('city','开课城市'),
    field('contact_phone','课程联系号码'), field('notice','参课须知'),
    field('capacity','报名人数上限','BIGINT',0), field('reserved_count','有效报名人数','BIGINT',0),
    field('revision','并发版本','BIGINT',0), field('registration_closes_at','报名截止时间','TIMESTAMPTZ'),
    field('checkin_closes_at','签到截止时间','TIMESTAMPTZ'), field('share_code','报名小程序码','IMAGE')],
 'public_class_enrollment': [field('entry_code','个人入场码'), field('checkin_method','核实方式'), field('canceled_at','取消报名时间','TIMESTAMPTZ')]
}
CONSTRAINTS = [
 ('public_class_enrollment','public_class_enrollment_customer_class_key',['customer_id','public_class_id']),
 ('public_class_enrollment','public_class_enrollment_entry_code_key',['entry_code']),
 ('offline_appointment','offline_appointment_request_key',['request_key']),
 ('consultation_feedback','consultation_feedback_request_key',['request_key']),
 ('consultation_feedback_reply','consultation_feedback_reply_request_key',['request_key']),
 ('consultation_summary_job','consultation_summary_job_request_key',['request_key'])
]

if __name__ == '__main__':
    state = run('schema','load')
    assert state['projectExId'] == 'JmAxbl1MMe4', 'Refusing to modify another project'
    snapshot = run('schema','snapshot','--args','{"full":true}')
    model = snapshot['server']['dataModel']
    tables = {t['name']: t for t in model['tableMetadata']}
    calls = []
    for name, fields in ADDITIONS.items():
        table = tables[name]
        existing = {c['name'] for c in table['columnMetadata']}
        missing = [f for f in fields if f['apiName'] not in existing]
        if missing: calls.append({'name':'ADD_FIELDS_AND_RELATIONS','args':{'tableDisplayName':table['displayName'],'fields':missing,'relations':[]}})
    if calls: call(calls)
    model = run('schema','snapshot','--args','{"full":true}')['server']['dataModel']
    tables = {t['name']: t for t in model['tableMetadata']}
    constraints = []
    for table_name, name, columns in CONSTRAINTS:
        table = tables[table_name]
        if name not in {c['name'] for c in table.get('constraintMetadata',[])}:
            labels = {c['name']: c['displayName'] for c in table['columnMetadata']}
            constraints.append(dict(tableDisplayName=table['displayName'],constraintName=name,constraintType='UNIQUE',fieldDisplayNames=[labels[c] for c in columns]))
    if constraints: call([{'name':'ADD_CONSTRAINTS','args':{'constraints':constraints}}])
    current = run('schema','snapshot','--args','{"full":true}')['server']['dataModel']
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'target-model-after.json').write_text(json.dumps({'server':{'dataModel':current}},ensure_ascii=False,indent=2))
    document_model(current)
    print('Added missing course fields and constraints; model documented. No backend sync performed.')
