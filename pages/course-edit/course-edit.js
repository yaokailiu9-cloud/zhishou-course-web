const service=require('../../utils/consultationService');const auth=require('../../utils/auth');const zion=require('../../utils/zion');const {dateParts,iso,classShare}=require('../../utils/coursePresentation');
const empty=()=>({title:'',description:'',date:'',time:'',closeDate:'',closeTime:'',checkinDate:'',checkinTime:'',city:'',capacity:'0',groupGuide:'',contactPhone:'',notice:'',signupUrl:'',coverId:null,groupQrId:null,shareCodeId:null});
Page({data:{loading:true,busy:false,uploading:false,error:'',allowed:false,hasSavedClass:false,form:empty(),coverUrl:'',groupQrUrl:'',shareCodeUrl:'',savedClass:null,saveNotice:'',publishError:'',status:'DRAFT'},
 onLoad(q={}){this.classId=q.id||null;this.editVersion=0;this.savedVersion=0;this.refresh();if(require("../../utils/loginReturn").restore(this,"course-edit",this.classId)){this.markEdited();}},
 async refresh(options={}){const version=this.editVersion || 0;const preserve=options.preserve===true || (options.preserve!==false && version!==(this.savedVersion||0));if(!auth.requireLogin('请登录负责课程的工作人员账号。')){this.setData({loading:false});return;}this.setData({loading:true,error:'',allowed:false});try{if(this.classId){const r=await service.call('GET_STAFF_CLASS',{classId:this.classId}),c=r.classInfo,t=dateParts(c.starts_at),d=dateParts(c.registration_closes_at),k=dateParts(c.checkin_closes_at);this.revision=c.revision;this.setData({allowed:true,hasSavedClass:true,savedClass:c,status:c.status,form:{title:c.title||'',description:c.description||'',date:t.date,time:t.time,closeDate:d.date,closeTime:d.time,checkinDate:k.date,checkinTime:k.time,city:c.city||'',capacity:String(c.capacity||0),groupGuide:c.group_guide||'',contactPhone:c.contact_phone||'',notice:c.notice||'',signupUrl:c.signup_url||'',coverId:c.cover&&c.cover.id||null,groupQrId:c.group_qr&&c.group_qr.id||null,shareCodeId:c.share_code&&c.share_code.id||null},coverUrl:c.cover&&c.cover.url||'',groupQrUrl:c.group_qr&&c.group_qr.url||'',shareCodeUrl:c.share_code&&c.share_code.url||'',...((preserve || (this.editVersion || 0)!==version)?{form:this.data.form,coverUrl:this.data.coverUrl,groupQrUrl:this.data.groupQrUrl,shareCodeUrl:this.data.shareCodeUrl}: {})});}else{await service.call('STAFF_CLASSES');this.setData({allowed:true});}}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 markEdited(){this.editVersion=(this.editVersion||0)+1;if(wx.enableAlertBeforeUnload)wx.enableAlertBeforeUnload({message:'课程内容尚未保存，确定离开吗？'});},
 clearDeadline(e){this.markEdited();const kind=e.currentTarget.dataset.kind;if(kind==='registration')this.setData({'form.closeDate':'','form.closeTime':''});if(kind==='checkin')this.setData({'form.checkinDate':'','form.checkinTime':''});},
 input(e){this.markEdited();const k=e.currentTarget.dataset.key;if(Object.keys(empty()).includes(k))this.setData({['form.'+k]:e.detail.value,saveNotice:'',publishError:''});},
 upload(e){if(this.data.uploading||this.data.busy)return;const kind=e.currentTarget.dataset.kind;if(!['cover','groupQr'].includes(kind))return;wx.chooseMedia({count:1,mediaType:['image'],success:async r=>{this.setData({uploading:true,error:''});try{const image=await zion.uploadImage(r.tempFiles[0].tempFilePath);this.markEdited();this.setData({['form.'+kind+'Id']:image.imageId,[kind+'Url']:image.url});}catch(e){service.error(this,e);}finally{this.setData({uploading:false});}}});},
 removeImage(e){this.markEdited();const k=e.currentTarget.dataset.kind;if(['cover','groupQr'].includes(k))this.setData({['form.'+k+'Id']:null,[k+'Url']:''});},
 save(e){if(this.data.busy||this.data.uploading)return;const status=e.currentTarget.dataset.status;if(status==='CLOSED'){wx.showModal({title:'结束本场报名',content:'结束后停止接收新报名，已有报名和入场凭证保留。',success:r=>{if(r.confirm)this.submit(status);}});}else this.submit(status);},
 publish(e={}){if(this.data.busy||this.data.uploading||this.data.loading||!this.data.allowed)return;const values=e.detail&&e.detail.value;if(values){const fields={};for(const key of ['title','description','city','date','time','capacity','closeDate','closeTime','checkinDate','checkinTime','groupGuide','contactPhone','notice'])if(Object.prototype.hasOwnProperty.call(values,key))fields[key]=String(values[key]);if(Object.keys(fields).some(key=>fields[key]!==this.data.form[key]))this.markEdited();this.setData({form:{...this.data.form,...fields}});}return this.submit('PUBLISHED');},
 saveDraft(){return this.submit('DRAFT');},
 showFormError(message){this.setData({error:message,publishError:message});if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});},
 async submit(status){
  if(this.data.busy||this.data.uploading||this.data.loading||!this.data.allowed)return;
  const f=JSON.parse(JSON.stringify(this.data.form)),version=this.editVersion||0;
  if(!f.title.trim()){this.showFormError('请填写课程名称');return;}
  for(const [d,t] of [['date','time'],['closeDate','closeTime'],['checkinDate','checkinTime']])if(Boolean(f[d])!==Boolean(f[t])){this.showFormError('请将所选日期和时间填写完整');return;}
  if(status==='PUBLISHED'&&(!f.date||!f.time)){this.showFormError('发布前请选择开课日期和时间');return;}
  if(!Number.isSafeInteger(Number(f.capacity||0))||Number(f.capacity)<0||Number(f.capacity)>10000){this.showFormError('名额请输入0至10000的整数，0表示不限');return;}
  const start=iso(f.date,f.time),registration=iso(f.closeDate,f.closeTime),checkin=iso(f.checkinDate,f.checkinTime);
  if(start&&!Number.isFinite(Date.parse(start))){this.showFormError('开课时间无效，请重新选择');return;}
  if(status==='PUBLISHED'&&this.data.status!=='PUBLISHED'&&Date.parse(start)<=Date.now()){this.showFormError('请选择未来的开课时间再发布');return;}
  if(registration&&(!start||!Number.isFinite(Date.parse(registration))||Date.parse(registration)>Date.parse(start))){this.showFormError('报名截止时间不能晚于开课时间');return;}
  if(checkin&&(!start||!Number.isFinite(Date.parse(checkin))||Date.parse(checkin)<Date.parse(start))){this.showFormError('签到截止时间不能早于开课时间');return;}
  if(f.contactPhone.trim()&&!/^1[3-9]\d{9}$/.test(f.contactPhone.trim())){this.showFormError('联系手机号请填写有效的11位号码，或留空');return;}
  if(Number(f.capacity)>0&&Number(f.capacity)<Number(this.data.savedClass&&this.data.savedClass.reserved_count||0)){this.showFormError('名额不能少于已报名人数');return;}
  this.setData({busy:true,error:'',publishError:'',saveNotice:''});
  try{
   const r=await service.call('SAVE_CLASS',{...f,id:this.classId,revision:this.revision,status,startsAt:iso(f.date,f.time),registrationClosesAt:iso(f.closeDate,f.closeTime),checkinClosesAt:iso(f.checkinDate,f.checkinTime)});
   this.classId=r.id;
   // Preserve the committed result even if the follow-up read fails; do not suggest creating it again.
   this.setData({hasSavedClass:true,status,savedClass:{id:r.id,title:f.title,status,coverUrl:this.data.coverUrl},saveNotice:status==='PUBLISHED'?'课程已发布，可直接微信分享给朋友或群。':status==='DRAFT'?'草稿已保存，发布后即可邀请报名。':'已结束本场报名。'});
   wx.showToast({title:status==='PUBLISHED'?'已发布':'已保存',icon:'success'});
   this.savedVersion=version;
   await this.refresh({preserve:(this.editVersion||0)!==version});
   if((this.editVersion||0)!==version)this.setData({saveNotice:'已保存提交时的版本，新增修改仍待保存。'});
   else if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();
   if(this.data.error)this.setData({error:'课程已保存，但重新读取失败。请重试读取，不必重复新建。'});
   if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});
  }catch(e){service.error(this,e);this.showFormError(this.data.error);if(wx.showModal)wx.showModal({title:'课程未发布或保存',content:this.data.error,showCancel:false,confirmText:'返回修改'});}finally{this.setData({busy:false});}
 },
 onShareAppMessage(){return classShare(this.data.savedClass);},
 preview(){if(this.classId)wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+this.classId});}
});
