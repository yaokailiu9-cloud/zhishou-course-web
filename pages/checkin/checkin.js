const service = require('../../utils/consultationService');
const auth = require('../../utils/auth');
const session = require('../../utils/viewSession');

Page({
  data: {loading:false,busy:false,error:'',allowed:false,isManager:false,classId:'',classInfo:null,items:[],stats:{registered:0,attended:0,remaining:0},search:'',entryCode:'',filter:'ALL',nextCursor:null,candidate:null,scanResult:null,staffOpen:false,staff:[],staffLoading:false,staffSearch:'',candidates:[],candidateCursor:null,staffError:'',tabs:[{key:'ALL',label:'全部报名'},{key:'REMAINING',label:'未签到'},{key:'ATTENDED',label:'已签到'}]},
  onLoad(q={}) { this.setData({classId:q.id||''}); },
  onShow() { clearTimeout(this.scanTimer);this.scanAttempt=(this.scanAttempt||0)+1;this.scanValue=null;this.setData({busy:false,allowed:false,isManager:false,items:[],classInfo:null,candidate:null,scanResult:null,entryCode:'',staffOpen:false,staff:[],candidates:[]});return this.refresh(); },
  onHide() { clearTimeout(this.scanTimer);this.scanAttempt=(this.scanAttempt||0)+1;this.generation=(this.generation||0)+1;this.scanValue=null;this.setData({candidate:null,busy:false,entryCode:'',staff:[],candidates:[]}); },
  onUnload() { this.onHide(); },
  refresh() { return this.load(false); },
  more() { return this.load(true); },
  inputSearch(e) { this.setData({search:e.detail.value}); },
  filter(e) { if(this.data.busy)return;this.setData({filter:e.currentTarget.dataset.key});return this.refresh(); },
  inputEntryCode(e) { this.setData({entryCode:e.detail.value}); },
  openClass(e) { wx.navigateTo({url:'/pages/checkin/checkin?id='+encodeURIComponent(e.currentTarget.dataset.id)}); },
  async load(more) {
    const generation=this.generation=(this.generation||0)+1, identity=session.capture();
    if(!auth.requireLogin('请登录管理或被指定的签到人员账号。')) { this.setData({loading:false,allowed:false,isManager:false,items:[],staff:[],candidates:[],classInfo:null});return; }
    if(more && this.appliedSearch!==this.data.search)more=false;
    const search=this.data.search;
    this.setData({loading:true,error:''});
    try {
      const r=await service.call(this.data.classId?'CHECKIN_ROSTER':'CHECKIN_CLASSES',{classId:this.data.classId,search,filter:this.data.filter,cursor:more?this.data.nextCursor:null});
      if(generation!==this.generation||!session.current(identity))return;
      this.appliedSearch=search;
      this.setData({allowed:true,isManager:r.isManager,items:(more?this.data.items:[]).concat((r.items||[]).map(item=>({...item,timeText:service.formatTime(item.starts_at),verifiedText:service.formatTime(item.verifiedAt)}))),nextCursor:r.nextCursor,classInfo:r.classInfo?{...r.classInfo,timeText:service.formatTime(r.classInfo.starts_at)}:null,stats:r.stats||this.data.stats});
    } catch(e) {
      if(generation!==this.generation||!session.current(identity))return;
      this.scanValue=null;this.setData({allowed:false,isManager:false,items:[],staff:[],candidates:[],classInfo:null,candidate:null,scanResult:null});service.error(this,e);
    } finally { if(generation===this.generation&&session.current(identity))this.setData({loading:false}); }
  },
  scan() {
    if(this.data.busy||!this.data.allowed)return;
    const identity=session.capture(),generation=this.generation,attempt=this.scanAttempt=(this.scanAttempt||0)+1;
    this.setData({busy:true,error:'',candidate:null,scanResult:null});this.scanValue=null;
    clearTimeout(this.scanTimer);
    this.scanTimer=setTimeout(()=>{if(attempt!==this.scanAttempt||!session.current(identity)||generation!==this.generation)return;this.scanAttempt++;this.setData({busy:false,error:'扫码等待超时，请重试或输入入场码。'});},30000);
    wx.scanCode({onlyFromCamera:true,scanType:['qrCode'],success:r=>{if(attempt!==this.scanAttempt)return;clearTimeout(this.scanTimer);return this.lookupEntryCode(r.result,identity,generation);},fail:e=>{if(attempt!==this.scanAttempt||!session.current(identity)||generation!==this.generation)return;clearTimeout(this.scanTimer);const message=e.errMsg||'';this.setData({busy:false,error:/cancel/i.test(message)?'':/^(未识别到二维码|无法读取照片|照片无效|识码组件未加载|无法打开相机)/.test(message)?message:'微信扫一扫暂不可用，请拍照识码或输入入场码。'});}});
  },
  manualLookup() {
    if(this.data.busy||!this.data.allowed||!this.data.classId)return;
    const code=String(this.data.entryCode||'').trim().toUpperCase();
    if(!/^[A-Z2-9]{24}$/.test(code)){this.setData({error:'请输入凭证下方的 24 位个人入场码。'});return;}
    this.setData({busy:true,error:'',candidate:null,scanResult:null});this.scanValue=null;
    return this.lookupEntryCode(code,session.capture(),this.generation);
  },
  async lookupEntryCode(code,identity,generation) {
    if(!session.current(identity)||generation!==this.generation)return;
    try {
      const out=await service.call('CHECKIN_LOOKUP',{classId:this.data.classId,entryCode:code});
      if(!session.current(identity)||generation!==this.generation)return;
      this.scanValue=code;this.setData({candidate:out.enrollment,stats:out.stats,entryCode:''});
    } catch(e) { if(session.current(identity)&&generation===this.generation)service.error(this,e); }
    finally { if(session.current(identity)&&generation===this.generation)this.setData({busy:false}); }
  },
  closeScan() {this.scanValue=null;this.setData({candidate:null});},
  async confirmScan() {
    if(this.data.busy||!this.scanValue)return;
    const identity=session.capture(),generation=this.generation;
    this.setData({busy:true,error:''});
    try {
      const out=await service.call('CHECKIN_CONFIRM',{classId:this.data.classId,entryCode:this.scanValue});
      if(!session.current(identity)||generation!==this.generation)return;
      this.closeScan();this.setData({stats:out.stats,scanResult:{name:out.enrollment.name,title:out.alreadyCheckedIn?'已签到，无需重复':'签到成功'}});
      await this.refresh();
    } catch(e) {if(session.current(identity)&&generation===this.generation)service.error(this,e);}
    finally {if(session.current(identity))this.setData({busy:false});}
  },
  async toggleStaff() {this.setData({staffOpen:!this.data.staffOpen});if(this.data.staffOpen)await this.loadStaff();},
  async loadStaff() {
    const identity=session.capture();
    try {const r=await service.call('CHECKIN_STAFF',{classId:this.data.classId});if(session.current(identity))this.setData({staff:r.items,staffError:''});}
    catch(e) {if(session.current(identity))this.setData({staff:[],staffError:e.message});}
  },
  inputStaffSearch(e) {this.setData({staffSearch:e.detail.value});},
  searchStaff() {return this.findStaff(false);},
  moreStaff() {return this.findStaff(true);},
  async findStaff(more) {
    if(this.data.staffLoading)return;
    if(more&&this.appliedStaffSearch!==this.data.staffSearch)more=false;
    const identity=session.capture(),search=this.data.staffSearch.trim();
    if(!search){this.setData({staffError:'请输入对方的昵称或用户编号',candidates:[],candidateCursor:null});return;}
    this.setData({staffLoading:true,staffError:''});
    try {const r=await service.call('CHECKIN_CANDIDATES',{search,cursor:more?this.data.candidateCursor:null});if(!session.current(identity))return;this.appliedStaffSearch=search;this.setData({candidates:(more?this.data.candidates:[]).concat(r.items),candidateCursor:r.nextCursor,staffError:r.items.length?'':'没有找到用户，请先让对方登录。'});}
    catch(e) {if(session.current(identity))this.setData({staffError:e.message,candidates:[]});}
    finally {if(session.current(identity))this.setData({staffLoading:false});}
  },
  setStaff(e) {
    if(this.data.busy)return;
    const {id,name,active}=e.currentTarget.dataset,enabled=active===true||active==='true';
    wx.showModal({title:enabled?'设置签到人员':'取消签到权限',content:enabled?`允许 ${name}（用户 ${id}）查看本场名单并扫码签到？不会改变其管理、代理或用户身份。`:`取消 ${name} 在本场的签到权限？`,success:r=>{if(r.confirm)this.saveStaff(id,enabled);}});
  },
  async saveStaff(accountId,active) {
    const identity=session.capture();this.setData({busy:true,staffError:''});
    try {await service.call('CHECKIN_SET_STAFF',{classId:this.data.classId,accountId,active});if(!session.current(identity))return;await this.loadStaff();wx.showToast({title:active?'已设置签到人员':'已取消签到权限',icon:'success'});}
    catch(e) {if(session.current(identity))this.setData({staffError:e.message});}
    finally {if(session.current(identity))this.setData({busy:false});}
  }
});
