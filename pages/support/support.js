Page({
 data:{about:false,version:'体验版',questions:[{title:'如何申请线下咨询？',answer:'先报名免费公开课，实际到课并由工作人员核实后，在“我的报名与咨询”中提交申请。工作人员确认时间后即可填写孩子基础信息。'},{title:'报名后如何联系老师？',answer:'进入“我的报名”，打开对应场次的入场凭证，查看进群指引；课程提供电话时，可直接联系工作人员。'},{title:'发送或保存失败怎么办？',answer:'先检查网络和登录状态。聊天发送未确认时，先查看记录是否已出现该消息，再使用保留的原文重试。'}]},
 onLoad(q={}){let version='体验版';try{const a=wx.getAccountInfoSync();version=a.miniProgram.version || (a.miniProgram.envVersion==='develop'?'开发版':'体验版');}catch(_){}this.setData({about:q.kind==='about',version});wx.setNavigationBarTitle({title:q.kind==='about'?'关于知手':'帮助与支持'});},
 classes(){wx.navigateTo({url:'/pages/public-class/public-class'});},
 privacy(){wx.navigateTo({url:'/pages/privacy/privacy'});}
});
