const { userPortrait } = require("../../utils/mock");
const zion = require("../../utils/zion");

function extractCityName(location = {}) {
  const address = `${location.address || ""}`;
  const name = `${location.name || ""}`;
  const combined = `${address} ${name}`;
  const cityMatch = combined.match(/([^省市自治区特别行政区\s]{1,12}(?:市|盟|地区|自治州))/);
  if (cityMatch) return cityMatch[1];
  const directCityMatch = combined.match(/(北京|上海|天津|重庆|香港|澳门)/);
  if (directCityMatch) return `${directCityMatch[1]}${/香港|澳门/.test(directCityMatch[1]) ? "特别行政区" : "市"}`;
  return name || address || "";
}

const viewSession = require("../../utils/viewSession");
const auth = require("../../utils/auth");
const {readableError} = require("../../utils/serviceError");
Page({
  data: {defaultPortrait:userPortrait,avatarUrl:"",avatarImageId:"",userName:"",region:"",detailAddress:"",locationInfo:null,
    gender:"",genderOptions:["未设置","女","男","其他"],genderIndex:0,phone:"",birthday:"",accountId:"",
    loading:false,saving:false,error:"",usernameError:"",today:new Date().toISOString().slice(0,10)},
  onLoad() { this.unloaded=false;this.dirtyFields={};this.loadProfile();if(require("../../utils/loginReturn").restore(this,"profile-edit","")){Object.keys(this.data).forEach(k=>this.dirtyFields[k]=true);this.editVersion=1;} },
  onUnload() { this.unloaded=true; },
  active() { return !this.unloaded && viewSession.current(this.identity); },
  loadProfile() {
    if(!auth.requireLogin("登录后编辑自己的资料。"))return;
    this.identity=viewSession.capture();
    wx.removeStorageSync("profileDraft");
    const user=wx.getStorageSync("userInfo") || {};
    this.applyUser(user);
    return this.loadBackendProfile(user.id);
  },
  applyUser(user) {
    const gender=user.gender || "";
    const values={avatarUrl:user.avatarUrl || "",avatarImageId:user.avatarImageId || "",userName:user.username || user.nickName || "",
      region:user.region || "",detailAddress:user.address || "",locationInfo:user.locationInfo || null,
      gender,genderIndex:Math.max(0,this.data.genderOptions.indexOf(gender || "未设置")),phone:user.phone || "",birthday:user.birthday || "",accountId:user.id || ""};
    for(const key of Object.keys(values))if(this.dirtyFields && this.dirtyFields[key])delete values[key];
    this.setData(values);
  },
  async loadBackendProfile(accountId) {
    const identity=this.identity;this.setData({loading:true,error:""});
    try {
      const user=await zion.getAccountProfile(accountId);
      if(!this.active() || identity!==this.identity || !user || String(user.id)!==String(accountId))return;
      wx.setStorageSync("userInfo",{...(wx.getStorageSync("userInfo") || {}),...user});
      this.applyUser(user);
    } catch(e) { if(this.active())this.setData({error:readableError(e.message)}); }
    finally { if(this.active())this.setData({loading:false}); }
  },
  change(values) {
    this.dirtyFields=this.dirtyFields || {};
    Object.keys(values).forEach(k=>this.dirtyFields[k]=true);
    this.editVersion=(this.editVersion || 0)+1;
    this.setData({...values,error:"",usernameError:""});
    if(wx.enableAlertBeforeUnload)wx.enableAlertBeforeUnload({message:"资料尚未保存，确定离开吗？"});
  },
  onChooseAvatar(e) { if(!this.data.saving)this.change({avatarUrl:e.detail.avatarUrl || "",avatarImageId:""}); },
  isLocalAvatar(url) { return Boolean(url) && !/^https:\/\//.test(url); },
  onUserNameInput(e) { this.change({userName:e.detail.value}); },
  onRegionInput(e) { this.change({region:e.detail.value,locationInfo:null}); },
  onAddressInput(e) { this.change({detailAddress:e.detail.value,locationInfo:null}); },
  chooseRegion() {
    if(this.data.saving)return;
    if(typeof wx.chooseLocation!=="function"){this.setData({error:"当前无法定位，请手动填写地区和地址。"});return;}
    wx.chooseLocation({success:r=>{if(this.active())this.change({region:extractCityName(r),detailAddress:r.address || r.name || "",locationInfo:{name:r.name || "",address:r.address || "",latitude:r.latitude,longitude:r.longitude}});},
      fail:e=>{if(!/cancel/i.test(e.errMsg || ""))this.setData({error:"定位未完成，可直接手动填写地区和地址。"});}});
  },
  onGenderChange(e) {const genderIndex=Number(e.detail.value || 0);this.change({genderIndex,gender:genderIndex?this.data.genderOptions[genderIndex]:""});},
  onBirthdayChange(e) {this.change({birthday:e.detail.value});},
  async saveProfile() {
    if(this.data.saving || this.data.loading)return;
    if(!auth.requireLogin("登录后保存个人资料。") || !this.active())return;
    const form=JSON.parse(JSON.stringify(this.data)),version=this.editVersion || 0,identity=this.identity;
    const name=form.userName.trim();
    if(!name || name.length>80){this.setData({usernameError:"请填写1至80字的用户名"});return;}
    if(form.birthday && form.birthday>this.data.today){this.setData({error:"生日不能晚于今天"});return;}
    this.setData({saving:true,error:"",usernameError:""});
    try {
      if(!await zion.isUsernameAvailable(name,identity.accountId)){this.setData({usernameError:"该用户名已被使用，请换一个"});return;}
      if(!this.active())return;
      const avatar=this.isLocalAvatar(form.avatarUrl)?await zion.uploadImage(form.avatarUrl):{url:form.avatarUrl,imageId:form.avatarImageId};
      if(!this.active())return;
      const user=await zion.saveAccountProfile({accountId:identity.accountId,userName:name,avatarUrl:avatar.url || "",avatarImageId:avatar.imageId || "",
        region:form.region.trim(),address:form.detailAddress.trim(),locationInfo:form.locationInfo,gender:form.gender,birthday:form.birthday});
      if(!this.active() || identity!==this.identity)return;
      wx.setStorageSync("userInfo",{...(wx.getStorageSync("userInfo") || {}),...user});
      if((this.editVersion || 0)===version){
        this.dirtyFields={};this.applyUser(user);
        if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();
        wx.showToast({title:"资料已保存",icon:"success"});
      }else wx.showToast({title:"已保存，新增修改仍待保存",icon:"none"});
    } catch(e) {if(this.active())this.setData({error:readableError(e.message)});}
    finally {if(!this.unloaded)this.setData({saving:false});}
  }
});
