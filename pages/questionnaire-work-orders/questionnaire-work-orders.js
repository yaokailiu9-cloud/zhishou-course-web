const auth=require('../../utils/auth');
const service=require('../../utils/consultationService');
const QUESTIONNAIRE_CLASS_ID='11';
const tabs=[
 {key:'PENDING',label:'待处理'},
 {key:'DRAFT',label:'处理中'},
 {key:'CONFIRMED',label:'已完成'},
 {key:'ALL',label:'全部'}
];
function decorate(item){
 const status=item.feedback_status||'PENDING';
 return {...item,status,statusText:status==='CONFIRMED'?'已完成':status==='DRAFT'?'处理中':'待处理',submittedText:service.formatTime(item.child_submitted_at)};
}
Page({
 data:{loading:true,loadingMore:false,error:'',tabs,activeTab:'PENDING',records:[],filtered:[],nextCursor:null,counts:{PENDING:0,DRAFT:0,CONFIRMED:0,ALL:0}},
 onLoad(){require('../../utils/loginReturn').restore(this,'questionnaire-work-orders','');},
 onShow(){this.refresh();},
 async refresh(){
  if(!auth.requireLogin('登录后查看问卷工单。')){this.setData({loading:false});return;}
  this.setData({loading:true,error:'',records:[],filtered:[],nextCursor:null});
  await this.loadPage(false);
  this.setData({loading:false});
 },
 async loadPage(more){
  if(more&&!this.data.nextCursor)return;
  this.setData({loadingMore:!!more});
  try{
   const r=await service.call('STAFF_CHILD_INTAKES',{cursor:more?this.data.nextCursor:null});
   const incoming=(r.items||[]).filter(item=>item.public_class&&String(item.public_class.id)===QUESTIONNAIRE_CLASS_ID&&item.child_submitted_at).map(decorate);
   const records=more?this.data.records.concat(incoming):incoming;
   this.setData({records,nextCursor:r.nextCursor||null},()=>this.applyFilter());
  }catch(e){service.error(this,e);}finally{this.setData({loadingMore:false});}
 },
 applyFilter(){
  const records=this.data.records,counts={PENDING:0,DRAFT:0,CONFIRMED:0,ALL:records.length};
  records.forEach(item=>{if(Object.prototype.hasOwnProperty.call(counts,item.status))counts[item.status]++;});
  const active=this.data.activeTab;
  this.setData({counts,filtered:active==='ALL'?records:records.filter(item=>item.status===active)});
 },
 chooseTab(e){this.setData({activeTab:e.currentTarget.dataset.key},()=>this.applyFilter());},
 loadMore(){if(!this.data.loadingMore)this.loadPage(true);},
 openRecord(e){const id=e.currentTarget.dataset.id;if(id)wx.navigateTo({url:'/pages/questionnaire-review/questionnaire-review?id='+id});}
});
