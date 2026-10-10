const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
const STATUS={ACTIVE:'观看中',EXPIRED:'已到期',REVOKED:'已收回'};
function grantCard(g){return {...g,statusText:STATUS[g.status]||g.status,durationText:Number(g.durationHours)===48?'2 天':'1 天',grantedText:service.formatTime(g.grantedAt),expiresText:service.formatTime(g.expiresAt),revokedText:g.revokedAt?service.formatTime(g.revokedAt):''};}
Page({data:{loading:true,error:'',allowed:false,courses:[],courseOptions:[],courseIndex:-1,keyword:'',searching:false,searched:false,candidates:[],viewer:{id:'',name:''},hours:24,saving:false,grants:[],nextCursor:null},
 onShow(){this.refresh();},
 refresh(){return this.load(false);},more(){return this.load(true);},
 async load(more){if(this.fetching)return;if(!auth.requireLogin('请登录管理人员账号。')){this.setData({loading:false,allowed:false});return;}this.fetching=true;this.setData({loading:true,error:''});
  try{const r=await service.call('COURSE_VIEW_ADMIN',{cursor:more?this.data.nextCursor:null});const courses=r.courses||[];const selected=this.data.courses[this.data.courseIndex];
   this.setData({allowed:true,courses,courseOptions:courses.map(c=>c.title+(c.hasVideo?'':'（视频未上传）')+(c.enabled?'':'（已下架）')),courseIndex:selected?courses.findIndex(c=>c.id===selected.id):-1,grants:(more?this.data.grants:[]).concat((r.grants||[]).map(grantCard)),nextCursor:r.nextCursor});}
  catch(e){if(!more)this.setData({allowed:false,grants:[]});service.error(this,e);}finally{this.fetching=false;this.setData({loading:false});}},
 inputKeyword(e){this.setData({keyword:e.detail.value});},
 async search(){if(this.data.searching)return;this.setData({searching:true,error:''});try{const r=await service.call('COURSE_VIEW_CANDIDATES',{keyword:this.data.keyword});this.setData({candidates:r.items||[],searched:true});}catch(e){service.error(this,e);}finally{this.setData({searching:false});}},
 pickViewer(e){const d=e.currentTarget.dataset;this.setData({viewer:{id:String(d.id),name:d.name}});this.grantKey='';},
 pickCourse(e){this.setData({courseIndex:Number(e.detail.value)});this.grantKey='';},
 pickHours(e){this.setData({hours:Number(e.currentTarget.dataset.hours)===48?48:24});this.grantKey='';},
 grant(){const {viewer,courses,courseIndex,hours}=this.data,course=courses[courseIndex];
  if(!viewer.id){wx.showToast({title:'请先选择家长',icon:'none'});return;}if(!course){wx.showToast({title:'请选择课程',icon:'none'});return;}
  wx.showModal({title:'确认开通',content:`为 ${viewer.name} 开通《${course.title}》${hours===48?'2 天':'1 天'}观看，从现在开始计时，到期自动关闭。`,success:async res=>{if(!res.confirm||this.data.saving)return;
   if(!this.grantKey)this.grantKey=service.requestKey();this.setData({saving:true,error:''});
   try{await service.call('COURSE_VIEW_GRANT',{viewerAccountId:viewer.id,courseId:course.id,hours,requestKey:this.grantKey});this.grantKey='';wx.showToast({title:'已开通'});await this.load(false);}
   catch(e){service.error(this,e);}finally{this.setData({saving:false});}}});},
 revoke(e){const id=e.currentTarget.dataset.id;wx.showModal({title:'提前收回',content:'收回后家长立即不能再观看这节课。',success:async res=>{if(!res.confirm)return;try{await service.call('COURSE_VIEW_REVOKE',{grantId:id});wx.showToast({title:'已收回'});await this.load(false);}catch(err){service.error(this,err);}}});}
});
