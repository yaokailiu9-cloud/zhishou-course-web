"""Add questionnaire fields to the already access-restricted enrollment table."""
import json
from pathlib import Path
from zion_cli import run,call
OUT=Path('.codex-work/referral-intake');OUT.mkdir(parents=True,exist_ok=True)
def field(api,label,kind='TEXT',default=None):
    f={'apiName':api,'displayName':label,'basicTypeNameOrTypeId':kind,'required':default is not None}
    if default is not None:f['defaultValue']=default
    return f
fields=[field('child_name','孩子姓名'),field('child_gender','孩子性别'),field('child_age','孩子年龄','BIGINT'),field('child_grade','孩子年级'),field('child_economic_source','孩子经济来源'),field('child_issues','家长最重要的两个问题','JSONB'),field('child_description','问题描述'),field('child_daily_behavior','日常表现'),field('guardian_name','家长姓名'),field('guardian_phone','家长联系电话'),field('guardian_consent_at','监护人同意时间','TIMESTAMPTZ'),field('child_submitted_at','孩子资料提交时间','TIMESTAMPTZ'),field('feedback_content','工作人员梳理反馈'),field('feedback_status','梳理反馈状态',default='NOT_SUBMITTED'),field('feedback_confirmed_at','工作人员确认完成时间','TIMESTAMPTZ'),field('feedback_available_at','客户可查看时间','TIMESTAMPTZ'),field('feedback_revision','反馈并发版本','BIGINT',0)]
state=run('schema','load');assert state['projectExId']=='JmAxbl1MMe4'
before=run('schema','snapshot','--args','{"full":true}');
if not (OUT/'before.json').exists(): (OUT/'before.json').write_text(json.dumps(before,ensure_ascii=False))
model=before['server']['dataModel'];tables={t['name']:t for t in model['tableMetadata']};ops=[]
for name,additions in [('public_class_enrollment',fields),('service_provider',[field('service_kind','业务身份',default='STAFF')])]:
    t=tables[name];existing={c['name'] for c in t['columnMetadata']};missing=[f for f in additions if f['apiName'] not in existing]
    if missing:ops.append({'name':'ADD_FIELDS_AND_RELATIONS','args':{'tableDisplayName':t['displayName'],'fields':missing,'relations':[]}})
if 'feedback_reviewer_id' not in {c['name'] for c in tables['public_class_enrollment']['columnMetadata']}:
    ops.append({'name':'ADD_FIELDS_AND_RELATIONS','args':{'tableDisplayName':tables['service_provider']['displayName'],'fields':[],'relations':[{'sourceTableDisplayName':tables['service_provider']['displayName'],'targetTableDisplayName':tables['public_class_enrollment']['displayName'],'fieldDisplayNameInSourceTable':'梳理的孩子资料','fieldApiNameInSourceTable':'reviewed_child_intakes','fieldDisplayNameInTargetTable':'反馈工作人员','fieldApiNameInTargetTable':'feedback_reviewer','relationType':'one_to_many'}]}})
if ops:call(ops)
after=run('schema','snapshot','--args','{"full":true}');(OUT/'after-schema.json').write_text(json.dumps(after,ensure_ascii=False))
# Immediately document the actual returned fields/relationship before frontend work.
p=Path('数据库结构与关联关系说明.md');s=p.read_text();heading='## 2026-09-18 推荐归属与报名后孩子资料'
if heading in s:s=s.split(heading)[0].rstrip()+'\n'
lines=[heading,'','状态：仅编辑草稿，尚未同步或上线。平台添加字段时产生了默认角色授权，必须在编辑器恢复报名表全部禁止、服务人员禁止写入，并回读验证后方可部署。','','- 客户 / 代理 / 管理人员以后台服务人员身份及能力字段判定，绝不信任可由客户修改的 `account.user_type`。','- `service_provider.service_kind=AGENT` 表示管理人员指定的代理；`STAFF`（兼容原空值）表示原工作人员。代理的 `can_reply` 与 `can_accept_order` 必须为 false，不能借代理身份进入工作人员接口。','- 推荐归属沿用 `course_referral` 的账户唯一约束；首次成功报名时固定，保留已有归属且不提供改绑操作。','- 新孩子表单是一份公开课报名的结构化字段，独立于预约中的 `offline_appointment.child_info` 快照，不会自动开通咨询资格。','- 工作人员保存草稿与确认完成分开；确认完成时由服务器写入 `feedback_confirmed_at` 及其后3小时的 `feedback_available_at`。此前客户接口不返回反馈正文。','- `service_provider.reviewed_child_intakes` → `public_class_enrollment.feedback_reviewer_id` 为一对多显式关系；保留原到课核实工作人员关系，两者互不混用。','','```mermaid','flowchart LR','  推荐代理 -->|首次报名锁定，一对多| 课程推荐关系','  客户账号 -->|唯一被推荐账号| 课程推荐关系','  客户账号 -->|一对多显式关系| 公开课报名','  公开课程 -->|一对多显式关系| 公开课报名','  反馈工作人员 -->|一对多显式关系| 公开课报名','  公开课报名 -->|同一行结构化字段| 孩子资料与延时反馈','```','','### 新增字段及用途','','| 表 | 字段 | 用途 | 类型 |','| --- | --- | --- | --- |']
for t in after['server']['dataModel']['tableMetadata']:
    if t['name'] in ['public_class_enrollment','service_provider']:
        names={f['apiName'] for f in fields}|{'service_kind','feedback_reviewer_id'}
        for c in t['columnMetadata']:
            if c['name'] in names:lines.append('| `'+t['name']+'` | `'+c['name']+'` | '+c['displayName']+' | '+c['type']+' |')
lines+=['','唯一约束继续使用 `public_class_enrollment_customer_class_key`（同账号同课程唯一报名）、`course_referral_referred_account_id_key`（每客户唯一推荐人）及 `service_provider_account_id_key`（每账号唯一业务身份）。反馈保存以 `feedback_revision` 校验并发，确认后不允许覆盖。','']
p.write_text(s+'\n'+'\n'.join(lines));print('Draft schema documented; not deployed.')
# Default roles must retain their existing denial on enrollment/referrals and no provider writes.
for role in after['server']['roleConfigs']:
    perms=role['permissionConfig']['tablePermissionById']
    for name in ['public_class_enrollment','course_referral']:
        p=perms.get(tables[name]['id'],{});assert not any(p.get(k) for k in ['insert','update','select','delete','aggregate','count']),('New sensitive field access',role['name'],name)
    p=perms.get(tables['service_provider']['id'],{});assert not any(p.get(k) for k in ['insert','update','delete']),('Provider write access',role['name'])
print('Permission checks passed.')
