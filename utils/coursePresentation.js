const { decorate, formatTime } = require('./consultationService');

function classCard(value) {
  const c=decorate(value || {});
  const registrationFee=Math.max(0,Number(c.registration_fee||0));
  return {...c,registrationFee,feeText:registrationFee>0?`￥${registrationFee.toFixed(2)}`:'免费',isPaid:registrationFee>0, placeText:c.city ? c.city+' · 详细地址群内通知' : '详细地址将在课程群内通知',
    deadlineText:formatTime(c.registration_closes_at || c.starts_at),
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
    return {title:'知手 · 免费公开课',path:'/pages/public-class/public-class'};
  const share={title:c.title || '知手 · 免费公开课',path:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(String(c.id))};
  const cover=c.coverUrl || (c.cover && c.cover.url);
  if(cover)share.imageUrl=cover;
  return share;
}
module.exports={classCard,isUpcomingClass,enrollmentCard,dateParts,iso,classShare};
