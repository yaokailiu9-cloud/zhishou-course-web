// Empty family-archive questions adapted from the paper form. No photographed answers are stored here.
const choice = (key, label, options) => ({ key, label, type: 'choice', options });
const multi = (key, label, options) => ({ key, label, type: 'multi', options });
const text = (key, label, maxLength = 120) => ({ key, label, type: 'text', maxLength });
const long = (key, label, maxLength = 2000) => ({ key, label, type: 'textarea', maxLength });
const yesNo = ['是', '否'];
const sections = [
  { title: '孩子与家长', fields: [
    text('name', '孩子姓名或称呼', 60), choice('gender', '性别', ['男', '女', '其他']), text('age', '年龄（0–30岁）', 2), text('grade', '年级', 60),
    text('wechatNickname', '微信昵称', 60), text('filledAt', '填写日期（年-月-日）', 10), text('guardian', '家长姓名', 60),
    text('relationship', '与孩子关系', 60), text('phone', '联系电话', 11), long('concerns', '当前主要困扰', 4000), long('goals', '希望本次沟通解决的问题')
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
  { title: '五、问题表现与纲要确认', fields: [
    multi('readConfirmed', '已阅读并确认（可多选）', ['基本纲要', '郑重声明', '特训营', '天性辨别']),
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
    text('signatureName', '家长签字（填写姓名）'), text('signatureDate', '签字日期（年-月-日）', 10), long('remarks', '备注')
  ] }
];
const fields = sections.flatMap(section => section.fields);
const fieldByKey = Object.fromEntries(fields.map(field => [field.key, field]));
const empty = defaults => Object.assign(Object.fromEntries(fields.map(field => [field.key, field.type === 'multi' ? [] : ''])), defaults || {});
function formSections(form) {
  return sections.map(section => ({ ...section, fields: section.fields.map(field => ({
    ...field, value: Array.isArray(form[field.key]) ? form[field.key].join('、') : String(form[field.key] ?? ''),
    options: (field.options || []).map(option => ({ label: option, selected: field.type === 'multi' ? (form[field.key] || []).includes(option) : form[field.key] === option }))
  })) }));
}
function answeredSections(form) {
  return formSections(form).map(section => ({ ...section, fields: section.fields.filter(field => field.value) })).filter(section => section.fields.length);
}
module.exports = { sections, fields, fieldByKey, empty, formSections, answeredSections };
