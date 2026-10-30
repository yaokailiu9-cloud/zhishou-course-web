# 2026-10-30 录播课程与首页入口

- 认知改变世界：course 19，lesson 28，完整原片 75:04，私有资产 1030000000000025；复用服务端 `public_video=true` 开放观看。首页及课程页将“孩子教育公开课”放在系列课程前。
- 知鹿：course 20，lesson 29，完整原片 50:35，私有资产 1030000000000024；`public_video=false`，`badge=封存`，独立“知鹿系列课程”分类。未分配家长授权，不纳入答案库付费课程包。列表和详情提示封存，普通访客的服务端权限结果不含播放地址；既有后台工作人员权限保留。
- 封面：Zion 图片资产 1020000000000052、1020000000000053；原始封面同步保存在 assets/course-covers，网页构建副本位于 web/replica/assets/course-covers。
- 两段视频直接上传完整 MP4 原片，未转码，外置盘原文件保持不变；上传后校验 MD5/ETag、MP4 Range 请求与课时绑定。
- 复用已存在的 course / course_lesson / course_view_grant 字段及观看动作，无 schema、角色权限、动作流更改。
- 验证：102 项课程首页、观看权限及网页交互测试通过；build:web、build 均通过。线上动作实测 course 19 匿名可看，course 20 匿名不可看且不返回播放地址。
