// Translate infrastructure failures without exposing server internals to families.
function readableError(value) {
  const raw = String(value || '').trim();
  // Zion wraps deliberate validation failures in a Java exception. Only unwrap
  // known course/auth messages; infrastructure details must remain hidden.
  const wrapped = raw.match(/^(?:org\.graalvm\.polyglot\.)?PolyglotException:\s*Error:\s*([^\r\n]+)(?:[\r\n][\s\S]*)?$/);
  const known = new Set(['请先微信登录','当前账号没有这项工作人员权限','只能管理本人负责的公开课','课程状态无效','名额请输入0至10000的整数，0表示不限','名额不能少于已报名人数','已有报名的课程请结束报名，不能改回草稿','报名链接须使用https地址','发布前请填写开课时间','报名截止时间不能晚于开课时间','签到截止时间不能早于开课时间','请选择未来的开课时间再发布','课程已被更新，请刷新后再修改','请填写有效的11位手机号','状态已变化，请刷新后重试','记录不存在或已不可用','数据保存失败，请重试']);
  const safeCourseField = /^(课程名称|课程说明|进群指引|报名链接|开课城市|参课须知)填写不完整或过长$|^(开课时间|报名截止时间|签到截止时间)无效$/;
  const business = wrapped && wrapped[1].trim();
  const message = business && (known.has(business) || safeCourseField.test(business)) ? business : raw;
  if (/action\s*flow\s*not\s*found/i.test(message)) {
    return '报名与咨询服务暂未开放，请稍后再试。';
  }
  if (/timeout|timed\s*out/i.test(message)) return '连接超时，请稍后重试。';
  if (/unauthorized|jwt|token.*expired|not authenticated/i.test(message)) {
    return '登录已过期，请重新微信登录。';
  }
  if (/forbidden|permission denied|no permission/i.test(message)) {
    return '当前账号暂时无法使用这项服务，请联系工作人员。';
  }
  if (!message || /graphql|sql|exception|stack|actionflow|internal.server|\bat\s+\S+\.js/i.test(message)
      || !/[\u4e00-\u9fff]/.test(message)) {
    return '服务暂时无法连接，请稍后重试。';
  }
  return message.slice(0, 250);
}
module.exports = { readableError };
