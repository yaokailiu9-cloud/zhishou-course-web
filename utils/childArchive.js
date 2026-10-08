// Empty family-archive questions adapted from the paper form. No photographed answers are stored here.
const choice = (key, label, options) => ({ key, label, type: 'choice', options });
const multi = (key, label, options) => ({ key, label, type: 'multi', options });
const text = (key, label, maxLength = 120) => ({ key, label, type: 'text', maxLength });
const long = (key, label, maxLength = 2000) => ({ key, label, type: 'textarea', maxLength });
const date = (key, label) => ({ key, label, type: 'date', maxLength: 10 });
const must = field => ({ ...field, required: true });
const yesNo = ['是', '否'];
const sections = [
  { title: '孩子与家长', fields: [
    must(text('name', '孩子姓名或称呼', 60)), choice('gender', '性别', ['男', '女', '其他']), must(text('age', '年龄（0–30岁）', 2)), text('grade', '年级', 60),
    text('wechatNickname', '微信昵称', 60), date('filledAt', '填写日期'), must(text('guardian', '家长姓名', 60)),
    must(text('relationship', '与孩子关系', 60)), must(text('phone', '联系电话', 11)), must(long('concerns', '当前主要困扰', 4000)), long('goals', '希望本次沟通解决的问题')
  ] },
  { title: '一、家庭基本情况', fields: [
    text('fatherName', '父亲姓名'), text('fatherOccupation', '父亲职业'), text('motherName', '母亲姓名'), text('motherOccupation', '母亲职业'),
    choice('parentsDivorced', '父母是否离异', yesNo), choice('fatherCognition', '父亲认知', ['不管', '控制', '配合', '自我']),
    choice('motherCognition', '母亲认知', ['不管', '控制', '配合', '自我']), long('familyMembers', '同住家庭成员及关系')
  ] },
  { title: '二、父母必答', fields: [
    choice('fatherPlanSupport', '父亲对方案的支持态度', ['反对', '无所谓', '赞同']),
    choice('fatherDiscipline', '父亲对孩子的方式', ['严格', '可共情', '时严时松']),
    long('fatherDisrespectResponse', '父亲遇到孩子对长辈或妈妈不敬时的处理方式'),
    choice('motherPlanSupport', '母亲对方案的支持态度', ['反对', '无所谓', '赞同']),
    choice('motherDiscipline', '母亲对孩子的方式', ['严格', '可共情', '时严时松']),
    long('motherDisrespectResponse', '母亲遇到孩子对长辈或爸爸不敬时的处理方式')
  ] },
  { title: '三、亲属环境', fields: [
    choice('paternalNearby', '爷爷奶奶是否在孩子附近', yesNo), long('paternalAttitude', '爷爷奶奶对孩子的态度'),
    choice('paternalInterference', '爷爷奶奶是否干预父母教育', ['从不', '偶尔', '经常']),
    choice('maternalNearby', '外公外婆是否在孩子附近', yesNo), long('maternalAttitude', '外公外婆对孩子的态度'),
    choice('maternalInterference', '外公外婆是否干预父母教育', ['从不', '偶尔', '经常']), long('otherFactors', '其他家庭因素')
  ] },
  { title: '四、孩子性格行为', fields: [
    choice('obedience', '听话与否', ['听话', '一般', '不听话']), choice('ruleAwareness', '规则意识', ['强', '一般', '弱']),
    choice('socialAbility', '社交能力', ['强', '一般', '弱']), choice('runsAway', '是否乱跑', yesNo),
    choice('badFriends', '是否乱交朋友', yesNo), choice('overnightAbsent', '是否夜不归宿', yesNo),
    long('hobbies', '喜好爱好'), long('personality', '性格描述'),
    multi('dailyTraits', '日常表现（可多选）', ['虚荣心强', '好静乖巧', '花钱无度', '不乱花钱', '义气忠义', '敏感胆小', '争强好胜', '特善交际', '积极阳光', '圆润可爱', '毅力不足', '心思灵活', '嫉妒心强', '不爱学习', '自觉性强', '朋友特多', '善良重情', '疑心甚重'])
  ] },
  { title: '五、问题表现', fields: [
    multi('issues', '孩子存在的问题（可多选）', ['拖沓', '扯皮', '焦躁', '日夜颠倒', '辍学', '无情', '挑食', '消极', '厌学', '撒泼摆烂', '自残', '抑郁', '推诿', '贪玩', '胡乱花钱', '爱讲公平', '暴力', '自我封闭', '懒惰', '马虎', '爱讲道理', '对抗', '沉默', '沉迷游戏']),
    long('specificProblems', '具体问题补充', 4000), long('influences', '影响因素', 4000)
  ] },
  { title: '六、以往对抗情况', fields: [
    choice('opposeTeacher', '对抗老师', yesNo), text('opposeTeacherMethod', '对抗老师的形式'), choice('opposeTeacherDegree', '对抗老师的程度', ['轻微', '一般', '严重']),
    choice('opposeParents', '对抗父母', yesNo), text('opposeParentsMethod', '对抗父母的形式'), choice('opposeParentsDegree', '对抗父母的程度', ['轻微', '一般', '严重']),
    choice('opposeRelatives', '对抗亲属', yesNo), text('opposeRelativesMethod', '对抗亲属的形式'), choice('opposeRelativesDegree', '对抗亲属的程度', ['轻微', '一般', '严重']),
    choice('fighting', '骂人打架', yesNo), text('fightingMethod', '骂人打架的形式'), choice('fightingDegree', '骂人打架的程度', ['轻微', '一般', '严重'])
  ] },
  { title: '七、孩子经济状况', fields: [
    text('moneyAmount', '现有经济数目（约，元）', 30), long('moneySource', '现有经济来源'),
    text('signatureName', '家长签字（填写姓名）'), date('signatureDate', '签字日期'), long('remarks', '备注')
  ] }
];
const fields = sections.flatMap(section => section.fields);
const fieldByKey = Object.fromEntries(fields.map(field => [field.key, field]));
const empty = defaults => Object.assign(Object.fromEntries(fields.map(field => [field.key, field.type === 'multi' ? [] : ''])), defaults || {});
function formSections(form, errors) {
  return sections.map(section => ({ ...section, fields: section.fields.map(field => ({
    ...field, error: (errors && errors[field.key]) || '', value: Array.isArray(form[field.key]) ? form[field.key].join('、') : String(form[field.key] ?? ''),
    options: (field.options || []).map(option => ({ label: option, selected: field.type === 'multi' ? (form[field.key] || []).includes(option) : form[field.key] === option }))
  })) }));
}
function answeredSections(form) {
  return formSections(form).map(section => ({ ...section, fields: section.fields.filter(field => field.value) })).filter(section => section.fields.length);
}
// Parents often type 2026-10-8 or 2026/10/8; the backend accepts only zero-padded YYYY-MM-DD.
function normalizeDate(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const m = raw.match(/^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?$/);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])], date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return `${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
const dateKeys = ['filledAt', 'signatureDate'];
// Returns {fieldKey: message} for every field the parent must fix before submitting.
function validate(form) {
  const errors = {};
  fields.forEach(field => {
    const value = String(form[field.key] ?? '').trim();
    if (field.required && !value) errors[field.key] = '请填写' + field.label.replace(/（.*）$/, '');
    else if (value.length > field.maxLength) errors[field.key] = '最多填写' + field.maxLength + '个字';
  });
  const age = String(form.age ?? '').trim();
  if (age && (!/^\d+$/.test(age) || Number(age) > 30)) errors.age = '年龄请填写0至30的整数';
  const phone = String(form.phone ?? '').trim();
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) errors.phone = '请填写有效的11位手机号';
  dateKeys.forEach(key => { if (normalizeDate(form[key]) === null) errors[key] = '请重新选择日期'; });
  return errors;
}
// Map a backend rejection back to the field it is about, so the page can outline it.
function errorField(message) {
  const text = String(message || '');
  if (/年龄/.test(text)) return 'age';
  if (/手机号|联系电话/.test(text)) return 'phone';
  if (/日期/.test(text)) return 'filledAt';
  if (/性别/.test(text)) return 'gender';
  const option = text.match(/档案(?:多)?选项无效：(\w+)/);
  if (option && fieldByKey[option[1]]) return option[1];
  const field = fields.find(item => text.indexOf(item.label.replace(/（.*）$/, '')) === 0);
  return field ? field.key : '';
}
module.exports = { sections, fields, fieldByKey, empty, formSections, answeredSections, normalizeDate, dateKeys, validate, errorField };
