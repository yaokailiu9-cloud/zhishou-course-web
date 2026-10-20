const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const viewSession=require('../../utils/viewSession');
Page({
 data:{loading:true,busy:false,allowed:false,loggedIn:false,error:'',shareUrl:'',expiresText:'',offer:null,agents:[],agentIndex:-1,agentAccountId:'',agentName:'',generatedAgentName:'',search:'',customers:[],customerIndex:-1,customerAccountId:'',customerName:'',boundAgentId:'',searching:false,generatedCustomerName:''},
 onShow(){this.refresh();},
 onUnload(){this.generation=(this.generation||0)+1;},
 async refresh(){
  const generation=this.generation=(this.generation||0)+1,identity=viewSession.capture();
  this.setData({loading:true,allowed:false,loggedIn:auth.isLoggedIn(),error:'',shareUrl:'',expiresText:'',offer:null,agents:[],agentIndex:-1,agentAccountId:'',agentName:'',generatedAgentName:'',search:'',customers:[],customerIndex:-1,customerAccountId:'',customerName:'',boundAgentId:'',searching:false,generatedCustomerName:''});
  if(!auth.isLoggedIn()){this.setData({loading:false});return;}
  try{const r=await service.call('INTERNAL_PURCHASE_ACCESS');if(generation!==this.generation||!viewSession.current(identity))return;this.setData({allowed:r.allowed===true});if(r.allowed===true){const agents=await service.call('PURCHASE_LINK_AGENTS');if(generation!==this.generation||!viewSession.current(identity))return;this.setData({agents:agents.items||[]});}}
  catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
  finally{if(generation===this.generation)this.setData({loading:false});}
 },
 login(){auth.requireLogin('登录后生成咨询缴费链接。');},
 goProfile(){wx.switchTab({url:'/pages/profile/profile'});},
 inputSearch(e){this.searchGeneration=(this.searchGeneration||0)+1;this.setData({search:e.detail.value,customers:[],customerAccountId:'',customerName:'',customerIndex:-1,boundAgentId:'',shareUrl:'',searching:false});},
 async searchCustomers(){
  if(this.data.busy||!this.data.allowed)return;
  const g=this.searchGeneration=(this.searchGeneration||0)+1,identity=viewSession.capture(),generation=this.generation;this.setData({searching:true,error:'',shareUrl:''});
  try{const r=await service.call('PURCHASE_LINK_CUSTOMERS',{search:this.data.search});if(g!==this.searchGeneration||generation!==this.generation||!viewSession.current(identity))return;this.setData({customers:(r.items||[]).map(c=>({...c,label:c.name+'（ID '+c.accountId+'）'})),customerAccountId:'',customerName:'',boundAgentId:'',customerIndex:-1,error:r.items&&r.items.length?'':'未找到微信账号，请核对昵称或完整ID。'});}
  catch(e){if(g===this.searchGeneration&&generation===this.generation&&viewSession.current(identity))service.error(this,e);}
  finally{if(g===this.searchGeneration)this.setData({searching:false});}
 },
 selectCustomer(e){
  const index=Number(e.detail.value),c=this.data.customers[index];if(this.data.busy||!c)return;
  const bound=c.agentAccountId||'',ai=bound?this.data.agents.findIndex(a=>a.accountId===bound):-1,a=this.data.agents[ai];
  this.setData({customerIndex:index,customerAccountId:c.accountId,customerName:c.name,boundAgentId:bound,agentIndex:ai,agentAccountId:a?a.accountId:'',agentName:a?a.name:'',shareUrl:'',expiresText:'',error:bound&&!a?'原代理已停用，请联系管理员核对归属。':''});
 },
 selectAgent(event){const index=Number(event.detail.value);if(this.data.busy||this.data.boundAgentId||!Number.isInteger(index)||index<0||index>=this.data.agents.length)return;const agent=this.data.agents[index];this.setData({agentIndex:index,agentAccountId:agent.accountId,agentName:agent.name,shareUrl:'',expiresText:'',generatedAgentName:'',error:''});},
 async generate(){
  if(this.data.busy||!this.data.allowed)return;
  if(!this.data.customerAccountId){this.setData({error:'请先选择指定微信收款对象。'});return;}
  if(!this.data.agentAccountId){this.setData({error:'请先选择上级代理。'});return;}
  const generation=this.generation,identity=viewSession.capture(),agentAccountId=this.data.agentAccountId,customerAccountId=this.data.customerAccountId;this.setData({busy:true,error:'',shareUrl:'',expiresText:''});
  try{const r=await service.call('CREATE_PURCHASE_LINK',{agentAccountId,customerAccountId});if(generation!==this.generation||!viewSession.current(identity)||agentAccountId!==this.data.agentAccountId||customerAccountId!==this.data.customerAccountId)return;
   const date=new Date(new Date(r.expiresAt).getTime()+8*3600000);this.setData({shareUrl:r.url,offer:r.offer,generatedCustomerName:this.data.customerName+'（ID '+customerAccountId+'）',generatedAgentName:r.agent&&r.agent.name||this.data.agentName,expiresText:date.toISOString().slice(0,16).replace('T',' ')+'（北京时间）'});
  }catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
  finally{if(generation===this.generation)this.setData({busy:false});}
 },
 copy(){if(!this.data.shareUrl)return;wx.setClipboardData({data:this.data.shareUrl,success:()=>wx.showToast({title:'链接已复制',icon:'success'}),fail:()=>this.setData({error:'复制失败，请重试。'})});}
});
