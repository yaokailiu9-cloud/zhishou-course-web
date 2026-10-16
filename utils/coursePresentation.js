const { decorate, formatTime } = require('./consultationService');

function classCard(value) {
  const c=decorate(value || {});
  const registrationFee=Math.max(0,Number(c.registration_fee||0));
  const deadline=formatTime(c.registration_closes_at || c.starts_at);
  const deadlineCopy=text=>String(text||'').replace(/报名截止时间[:：]\s*[^\n。]*截止报名[。.]?/g,`报名截止时间：${deadline}截止报名。`);
  return {...c,registrationFee,feeText:registrationFee>0?`￥${registrationFee.toFixed(2)}`:'免费',isPaid:registrationFee>0, placeText:c.city ? c.city+' · 详细地址群内通知' : '详细地址将在课程群内通知',
    description:deadlineCopy(c.description),notice:deadlineCopy(c.notice),deadlineText:deadline,
    coverUrl:c.cover && c.cover.url || '', shareCodeUrl:c.share_code && c.share_code.url || ''};
}
function isUpcomingClass(value, now) {
  const startsAt=new Date(value && value.starts_at).getTime();
  return !!value && value.status==='PUBLISHED' && Number.isFinite(startsAt) && startsAt>(now == null ? Date.now() : now);
}
function enrollmentCard(value) {
  const e=decorate(value), active=e.status==='REGISTERED';
  const state=!active?'已取消':e.attendance_status==='ATTENDED'?'已参加':e.attendance_status==='ABSENT'?'未到课':'待参加';
  return {...e,public_class:classCard(e.public_class),stateText:state,
    phoneMasked:String(e.phone||'').replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2'),
    canCancel:active && e.attendance_status!=='ATTENDED' && new Date(e.public_class && e.public_class.starts_at).getTime()>Date.now(),
    entryPayload:active && e.entry_code ? 'EMPATH-ENTRY:'+e.entry_code : '',
    verifiedText:formatTime(e.verified_at)};
}
function dateParts(value) {
  if(!value)return {date:'',time:''};
  const parts=formatTime(value).split(' ');return {date:parts[0],time:parts[1]||''};
}
function iso(date,time) { return date&&time?`${date}T${time}:00+08:00`:null; }
// Share only saved, visible classes; an unloaded page or draft falls back to the course list.
function classShare(c) {
  if (!c || !c.id || !['PUBLISHED','CLOSED'].includes(c.status))
    return {title:'知守 · 免费公开课',path:'/pages/public-class/public-class'};
  const share={title:c.title || '知守 · 免费公开课',path:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(String(c.id))};
  const cover=c.coverUrl || (c.cover && c.cover.url);
  if(cover)share.imageUrl=cover;
  return share;
}
// Public introductions may be shared even when video access is restricted.
function courseShare(course) {
  if (!course || !course.id || !course.title || course.enabled === false)
    return {title:'知守 · 课程',path:'/pages/plaza/plaza'};
  const share={title:course.title,path:'/pages/course-detail/course-detail?id='+encodeURIComponent(String(course.id)),
    desc:String(course.subtitle || '知守课程 · 查看课程图片与介绍').slice(0,120)};
  if(course.coverUrl)share.imageUrl=course.coverUrl;
  return share;
}
function courseWebLink(course) {
  const share=courseShare(course);
  const query=course && course.id && course.enabled !== false ? '?course='+encodeURIComponent(String(course.id)) : '';
  return 'https://www.apply.tianqiwushu.cn/web/'+query+'#'+share.path;
}
module.exports={courseShare,courseWebLink,classCard,isUpcomingClass,enrollmentCard,dateParts,iso,classShare};
