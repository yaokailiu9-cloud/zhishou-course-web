"""Update the two course tables and verified constraints in the relationship document."""
import re
from pathlib import Path

def document_model(model):
    path=Path('数据库结构与关联关系说明.md')
    source=path.read_text()
    for table in model['tableMetadata']:
        if table['name'] not in {'public_class','public_class_enrollment','offline_appointment','consultation_feedback','consultation_feedback_reply','consultation_summary_job'}: continue
        lines=[f"### {table['displayName']} · `{table['name']}`",'', '| 字段 | 名称 | 类型 | 必填 | 唯一 |','| --- | --- | --- | --- | --- |']
        for c in table['columnMetadata']:
            lines.append(f"| `{c['name']}` | {c.get('displayName','')} | {c['type']} | {'是' if c.get('required') else '否'} | {'是' if c.get('unique') else '否'} |")
        lines.extend(['','已核实的唯一约束：',''])
        for c in table.get('constraintMetadata',[]):
            if c.get('compositeUniqueColumns'): lines.append(f"- `{c['name']}`："+'、'.join(f'`{v}`' for v in c['compositeUniqueColumns']))
        replacement='\n'.join(lines)+'\n\n'
        source=re.sub(r'### [^\n]* · `'+table['name']+r'`\n.*?(?=\n### |\n## |\Z)',lambda _:replacement,source,flags=re.S)
    heading='## 2026-09-09 课程报名补充'
    section='''## 2026-09-09 课程报名补充

字段及约束来源为本轮官方 CLI 编辑结构，尚未同步正式后端。没有新增跨表关系；继续使用课程—报名—账户及核实工作人员的显式关联。

- `capacity=0` 表示不限制人数；`reserved_count` 仅记录有效报名，取消时释放名额；`revision` 通过带版本条件的原子更新防止并发超额和丢失更新。报名与取消均在同步事务内执行。
- `registration_closes_at` 到时停止报名；未填写时以开课时间为准。`checkin_closes_at` 为签到截止，不能早于开课。
- `cover`、`group_qr`、`share_code` 分别是课程封面、进群码和报名小程序码；IMAGE 资产按平台实际字段签名读取，不存临时图片 URL。
- `entry_code` 是后端签发的报名识别码，不包含姓名/手机号；它不是访问客户资料的授权凭据。核销仍需工作人员身份与场次归属校验。取消后旧码失效，重新报名更换码。
- `checkin_method` 区分扫码和人工核实；`verified_at`、`verified_by_id` 留存核实时间及工作人员。已到课不允许改回缺席或取消。
- 本轮核对发现先前复合/请求幂等约束未实际创建，已补齐真实约束，不能仅依赖本地测试中的去重模拟。

'''
    if heading in source: source=re.sub(re.escape(heading)+r'.*?(?=\n## |\Z)',lambda _:section,source,flags=re.S)
    else: source += '\n'+section
    source=source.replace('；Mac 当前锁屏','').replace('更新日期：2026-09-08','更新日期：2026-09-09')
    path.write_text(source)
