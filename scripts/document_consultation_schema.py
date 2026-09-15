# -*- coding: utf-8 -*-
"""Generate the project's relationship document from an official Zion schema snapshot."""
import json,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
model=json.loads((root/'.codex-work/consultation/data-model.json').read_text())['server']['dataModel']
target=root/'数据库结构与关联关系说明.md'
if target.exists() and '蝶变践行' in target.read_text()[:120]:
 backup=root/'docs/archive/误放的蝶变践行数据库结构-20260908.md';backup.parent.mkdir(parents=True,exist_ok=True)
 if not backup.exists():shutil.copy2(target,backup)
new={'public_class','public_class_enrollment','offline_appointment','offline_consultation_record','consultation_feedback','consultation_feedback_reply','consultation_summary_job'}
lines=['# 情感对话数据库结构与关联关系说明','',
 '项目：`JmAxbl1MMe4`。更新日期：2026-09-08。来源：Zion 官方 CLI 当前编辑结构快照。',
 '',
 '**部署状态：新增公开课、线下咨询和总结结构已写入编辑草稿，未同步正式后端。** 工作人员/AI 权限收紧及正式联调已获授权，权限修改已保存草稿。账号隔离另被自动审批拦截，等待该项确认；Mac 当前锁屏。本文不能作为已部署 API 的证明。',
 '',
 '原误放的“蝶变践行”文档已原样备份到 `docs/archive/误放的蝶变践行数据库结构-20260908.md`，它不是本项目的结构依据。',
 '',
 '## 本次流程与约束',
 '',
 '免费公开课报名 → 人工邀请进群 → 核实实际到课 → 申请咨询 → 老师确认时间 → 孩子基础信息 → 沟通记录和建议 → 家长留言/反馈与老师回复。内部付费课程暂缓。',
 '',
 '- 同一账号同一场课程仅一份报名；仅有报名不取得预约资格。',
 '- 孩子信息是每次预约的 JSON 快照，服务端只接受姓名、年龄、年级、监护人、关系、电话、困扰、期待字段。',
 '- 老师确认的记录不可覆写；后续补充作为反馈回复保留。',
 '- 总结草稿与录音属于指定预约及请求人；文字来源为本次预约的留言、执行反馈、老师回复。',
 '- `advice` 是 `{key,content}` 数组；`advice_key=conversation` 表示一般留言。',
 '- 总结状态：UPLOADING → QUEUED → PROCESSING → AUDIO_PROCESSING（录音）→ READY / FAILED。READY 仅表示草稿可供检查。',
 '- 音频通过 PRIVATE 预签名 PUT 上传；服务端分配并保存 recording_id，不接受客户端指定任意文件 ID。',
 '- `source_range` 保存文字来源条目范围与是否有更早记录；`conversation_ref` 是服务器分配的 AI 会话编号（文本引用，非外键）。',
 '',
 '## 后端动作流',
 '',
 '| ID | 用途 | 状态 |','| --- | --- | --- |','| `9f60a0be-4628-4268-a769-661264846cf4` | 同步公开课、资格、预约、资料、反馈、总结任务服务 | 编辑草稿 |','| `db7162d9-adc6-412a-ae7d-830d095ae022` | 异步校验总结任务、生成文字草稿或提交音频处理 | 编辑草稿 |',
 '',
 '两个动作流均从官方登录身份节点读取账号，不接受客户端传入角色作为授权依据。代码保存在 `backend/consultation/`。',
 '',
 '## 表清单',
 '',
 '| 表 | 显示名 | 状态 |','| --- | --- | --- |']
for table in model['tableMetadata']:lines.append(f"| `{table['name']}` | {table.get('displayName','')} | {'本次新增，未同步' if table['name'] in new else '既有结构'} |")
lines+=['','## 关系清单','','以下是平台实际关系，不包含 JSON 业务引用。','','| 源表 / 关系字段 | 关系 | 目标表 / 外键字段 |','| --- | --- | --- |']
for r in model['relationMetadata']:lines.append(f"| `{r['sourceTable']}.{r.get('nameInSource','')}` | {r['type']} | `{r['targetTable']}.{r.get('targetColumn','')}` |")
lines+=['','## 字段与约束','']
for t in model['tableMetadata']:
 lines += [f"### {t.get('displayName',t['name'])} · `{t['name']}`",'',
 '| 字段 | 名称 | 类型 | 必填 | 唯一 |','| --- | --- | --- | --- | --- |']
 for c in t.get('columnMetadata',[]):lines.append(f"| `{c['name']}` | {c.get('displayName','')} | {c.get('type','')} | {'是' if c.get('required') else '否'} | {'是' if c.get('unique') else '否'} |")
 for key in ['uniqueConstraints','constraints','uniqueIndexes']:
  if t.get(key):lines+=['',f"约束（平台原始元数据）：`{json.dumps(t[key],ensure_ascii=False)}`"]
 lines+=['']
lines+=['## 权限与验证边界','','- 七张新增业务表对游客和普通登录用户的直接 CRUD/统计入口已在编辑草稿中关闭；通过服务动作流按本人或负责老师访问。','- 游客和登录用户对服务人员表直接 insert/update/delete 均已在草稿关闭。前端个人资料保存不再修改服务人员身份，展示名称优先读取关联账号。','- 四张 AI 系统表的登录用户直接读取/统计已在草稿关闭；直接 AI 调用权限仍需核实。未写入真实咨询内容。','- 合成账号实测证实正式 account 接口允许跨用户读取和修改。本人读取/更新的隔离规则已被编辑器自动保存到草稿，但后续保存被自动审批拦截；未获追加确认前不继续修改或同步这些账号规则。','- 本地业务与权限单元测试、微信编译器检查已经执行；真实后端调用、AI 文本/音频处理、真机录音尚未完成。','- 本次没有发布微信小程序。','']
target.write_text('\n'.join(lines));print('Generated',target.name,'tables',len(model['tableMetadata']),'relations',len(model['relationMetadata']))
