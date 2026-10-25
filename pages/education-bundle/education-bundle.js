const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const payment=require('../../utils/coursePayment');
const viewSession=require('../../utils/viewSession');
Page({
  data:{loading:true,busy:false,loggedIn:false,error:'',offer:null,purchased:false,form:{name:'',phone:''}},
  onShow(){this.refresh();},
  onUnload(){this.generation=(this.generation||0)+1;},
  async refresh(){
    const generation=this.generation=(this.generation||0)+1,identity=viewSession.capture();
    this.setData({loading:true,loggedIn:auth.isLoggedIn(),error:'',offer:null,purchased:false});
    try{const data=await service.call('GET_EDUCATION_BUNDLE');if(generation!==this.generation||!viewSession.current(identity))return;this.setData({offer:data.offer,purchased:!!data.purchased});}
    catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
    finally{if(generation===this.generation)this.setData({loading:false});}
  },
  input(e){this.setData({['form.'+e.currentTarget.dataset.key]:e.detail.value});},
  async buy(){
    if(this.data.busy||!this.data.offer||!this.data.offer.available||this.data.purchased)return;
    if(!auth.requireLogin('登录后购买课程包，观看权限将绑定你的微信账号。'))return;
    const name=this.data.form.name.trim(),phone=this.data.form.phone.trim();
    if(!name||name.length>60||!/^1[3-9][0-9]{9}$/.test(phone)){this.setData({error:'请填写姓名和有效的11位手机号。'});return;}
    const identity=viewSession.capture(),generation=this.generation;
    this.setData({busy:true,error:''});
    try{const result=await payment.enroll({name,phone},this.data.offer.feeText,{action:'education-bundle-pay',noun:'孩子教育课程包',confirmTitle:'购买课程包'});if(result&&generation===this.generation&&viewSession.current(identity)){await this.refresh();if(this.data.purchased)wx.showToast({title:'已解锁课程',icon:'success'});}}
    catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
    finally{this.setData({busy:false});}
  },
  openCourse(e){wx.navigateTo({url:'/pages/course-detail/course-detail?id='+e.currentTarget.dataset.id});},
  copyLink(){wx.setClipboardData({data:'https://www.apply.tianqiwushu.cn/web/#/pages/education-bundle/education-bundle'});},
  goBack(){wx.navigateBack({fail:()=>wx.switchTab({url:'/pages/plaza/plaza'})});},
  onShareAppMessage(){return {title:'孩子教育课程包 · ¥688',path:'/pages/education-bundle/education-bundle'};}
});
