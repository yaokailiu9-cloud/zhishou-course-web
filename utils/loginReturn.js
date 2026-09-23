// One login continuation per app session. Personal form values are never persisted to storage.
const ALLOWED = new Set(['customer','public-class','public-class-detail','class-enroll','my-enrollments','class-ticket','course-manage','course-edit','course-roster','service-workbench','consultation-detail','advisor','profile-edit','questionnaire-share','questionnaire-review','questionnaire','chat']);
const MAX_AGE = 30 * 60 * 1000;
let pending = null;
let enrollmentDraft = null;
let restoredDraft = null;
function remember(page, options = {}) {
  pending = null;
  enrollmentDraft = null;
  restoredDraft = null;
  const route = page && page.route || '';
  const name = route.split('/')[1];
  if (!ALLOWED.has(name) || route !== `pages/${name}/${name}`) return;
  const id = page.options && page.options.id;
  if (id != null && !/^[1-9][0-9]*$/.test(String(id))) return;
  const url = '/' + route + (id ? '?id=' + encodeURIComponent(id) : '');
  pending = { url, name, id: String(id || ''), createdAt: Date.now() };
  if(options.preserveForm && options.accountId && page.data){
    const keys={chat:['input','failedMessage','sendError'],customer:['form','showForm'], 'class-enroll':['form'], 'course-edit':['form','coverUrl','groupQrUrl'],
      'consultation-detail':['childForm','recordForm','noteContent','feedbackContent','replyContents','confirmDate','confirmTime','staffNote'],
      'profile-edit':['avatarUrl','avatarImageId','userName','region','detailAddress','locationInfo','gender','genderIndex','birthday']}[name] || [];
    pending.accountId=String(options.accountId);
    if(name==='chat')pending.sessionId=String(wx.getStorageSync("consultationSessionId") || "");
    pending.draft=JSON.parse(JSON.stringify(Object.fromEntries(keys.filter(k=>page.data[k]!==undefined).map(k=>[k,page.data[k]]))));
  }
  if (name === 'class-enroll' && options.enrollmentForm) {
    pending.form = { name: String(options.enrollmentForm.name || '').slice(0,60), phone: String(options.enrollmentForm.phone || '').slice(0,11) };
  }
}
function resume() {
  const next = pending;
  pending = null;
  if (!next || Date.now() - next.createdAt > MAX_AGE) return false;
  const user=typeof wx.getStorageSync==='function'?(wx.getStorageSync('userInfo') || {}):{};
  if(next.draft && next.accountId===String(user.id || ''))restoredDraft={...next};
  const navigate=next.name==='chat'?wx.switchTab:wx.navigateTo;
  if (next.form) enrollmentDraft = { id: next.id, form: next.form, createdAt: Date.now() };
  navigate({url: next.url, fail: () => {
    enrollmentDraft = null;
    wx.showToast({title:'登录成功，请从首页重新进入课程',icon:'none'});
  }});
  return true;
}
function takeEnrollmentForm(id) {
  const draft = enrollmentDraft;
  enrollmentDraft = null;
  return draft && draft.id === String(id) && Date.now()-draft.createdAt <= MAX_AGE ? draft.form : null;
}
function restore(page,name,id) {
  const d=restoredDraft;
  if(!d || d.name!==name || d.id!==String(id || ''))return false;
  restoredDraft=null;
  const user=wx.getStorageSync('userInfo') || {};
  if(d.accountId!==String(user.id || '') || Date.now()-d.createdAt>MAX_AGE)return false;
  if(name==='chat' && d.sessionId!==String(wx.getStorageSync("consultationSessionId") || ""))return false;
  page.setData(d.draft);
  return true;
}
function clear() { pending = null; enrollmentDraft = null; restoredDraft = null; }
module.exports = { remember, resume, takeEnrollmentForm, restore, clear };
