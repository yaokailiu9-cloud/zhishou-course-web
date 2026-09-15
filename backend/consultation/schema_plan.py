"""Additive Zion model for free public classes and offline consultations."""
import json
from pathlib import Path

def field(api, label, kind='TEXT', default=None):
    f={'apiName':api,'displayName':label,'basicTypeNameOrTypeId':kind,'required':default is not None}
    if default is not None: f['defaultValue']=json.dumps(default,ensure_ascii=False) if kind=='JSONB' else default
    return f

tables=[
 ('public_class','免费公开课',[field('title','课程名称'),field('description','课程说明'),field('starts_at','开课时间','TIMESTAMPTZ'),field('status','发布状态',default='DRAFT'),field('group_guide','进群指引'),field('signup_url','报名链接'),field('group_qr','进群二维码','IMAGE')]),
 ('public_class_enrollment','公开课报名',[field('registrant_name','报名姓名'),field('phone','联系电话'),field('status','报名状态',default='REGISTERED'),field('attendance_status','到课状态',default='PENDING'),field('group_status','进群状态',default='PENDING'),field('verified_at','核实时间','TIMESTAMPTZ')]),
 ('offline_appointment','线下咨询预约',[field('request_key','申请幂等键'),field('requested_time','期望时间'),field('confirmed_at','确认咨询时间','TIMESTAMPTZ'),field('status','预约状态',default='PENDING'),field('contact_name','家长姓名'),field('phone','联系电话'),field('concerns','本次困扰'),field('child_info','孩子基础信息','JSONB'),field('staff_note','预约说明'),field('completed_at','完成时间','TIMESTAMPTZ')]),
 ('offline_consultation_record','线下咨询记录',[field('summary','沟通内容'),field('advice','执行建议','JSONB',[]),field('status','记录状态',default='DRAFT'),field('confirmed_at','记录确认时间','TIMESTAMPTZ')]),
 ('consultation_feedback','执行反馈',[field('request_key','反馈幂等键'),field('advice_key','执行建议标识'),field('content','执行情况'),field('status','回复状态',default='PENDING')]),
 ('consultation_feedback_reply','反馈回复',[field('request_key','回复幂等键'),field('content','回复内容')]),
 ('consultation_summary_job','沟通总结任务',[field('source','总结来源'),field('status','任务状态',default='PENDING'),field('transcript','转写文字'),field('draft','总结草稿'),field('error_message','失败说明'),field('recording','面谈录音','FILE'),field('consented_at','录音同意时间','TIMESTAMPTZ'),field('source_range','消息来源范围','JSONB'),field('conversation_ref','智能体会话标识'),field('request_key','总结幂等键')])
]

def rel(src,dst,left,right,kind='one_to_many'):
 return {'sourceTableDisplayName':src,'targetTableDisplayName':dst,'fieldDisplayNameInSourceTable':left,'fieldDisplayNameInTargetTable':right,'fieldApiNameInSourceTable':left,'fieldApiNameInTargetTable':right,'relationType':kind}
relations=[
 rel('服务人员','免费公开课','organized_public_classes','organizer'),
 rel('帐户','公开课报名','public_class_enrollments','customer'),
 rel('免费公开课','公开课报名','enrollments','public_class'),
 rel('服务人员','公开课报名','verified_enrollments','verified_by'),
 rel('帐户','线下咨询预约','offline_appointments','customer'),
 rel('服务人员','线下咨询预约','offline_appointments','provider'),
 rel('公开课报名','线下咨询预约','appointments','enrollment'),
 rel('线下咨询预约','线下咨询记录','consultation_record','appointment','one_to_one'),
 rel('服务人员','线下咨询记录','offline_records','author'),
 rel('线下咨询预约','执行反馈','feedbacks','appointment'),
 rel('帐户','执行反馈','consultation_feedbacks','author'),
 rel('执行反馈','反馈回复','replies','feedback'),
 rel('服务人员','反馈回复','feedback_replies','author'),
 rel('线下咨询预约','沟通总结任务','summary_jobs','appointment'),
 rel('帐户','沟通总结任务','summary_jobs','requester'),
 rel('咨询会话','沟通总结任务','summary_jobs','chat_session')
]
create=[{'name':'ADD_TABLES','args':{'items':[{'tableApiName':api,'tableDisplayName':label,'fields':fs,'relations':[]} for api,label,fs in tables]}}]
add_rel=[]
for src in dict.fromkeys(r['sourceTableDisplayName'] for r in relations):
 add_rel.append({'name':'ADD_FIELDS_AND_RELATIONS','args':{'tableDisplayName':src,'fields':[],'relations':[r for r in relations if r['sourceTableDisplayName']==src]}})
if __name__=='__main__':
 out=Path('.codex-work/consultation')
 (out/'add-tables-input.json').write_text(json.dumps(create,ensure_ascii=False))
 (out/'add-relations-input.json').write_text(json.dumps(add_rel,ensure_ascii=False))
