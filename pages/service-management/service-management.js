const service = require('../../utils/consultationService');
const auth = require('../../utils/auth');
const viewSession = require('../../utils/viewSession');

Page({
  data: {loading:true,busy:false,allowed:false,error:'',cases:[],filteredCases:[],nextCursor:null,search:'',selected:null,appointment:null,guardians:[],directors:[],guardianIndex:0,directorIndex:0,levels:['','A','B','C','D'],levelIndex:0,meta:{}},
  onShow(){this.hidden=false;this.load();},
  onHide(){this.hidden=true;this.generation=(this.generation||0)+1;this.setData({allowed:false,appointment:null});},
  onUnload(){this.onHide();},
  current(generation,identity){return !this.hidden&&this.generation===generation&&viewSession.current(identity);},
  async load(){
    const generation=this.generation=(this.generation||0)+1,identity=viewSession.capture();
    this.setData({loading:true,busy:false,allowed:false,error:'',appointment:null,selected:null,cases:[],filteredCases:[],guardians:[],directors:[]});
    if(!auth.requireLogin('请登录总管账号管理服务分配。')){this.setData({loading:false});return;}
    try {
      // LIST_SERVICE_STAFF rechecks the authenticated 总管 permission on the server.
      const staff=await service.call('LIST_SERVICE_STAFF');
      if(!this.current(generation,identity))return;
      const overview=await service.call('SERVICE_CHAT_OVERVIEW');
      if(!this.current(generation,identity))return;
      if(!overview.canManage)throw Error('只有总管可以管理服务分配');
      const items=staff.items||[];
      this.setData({allowed:true,cases:overview.cases||[],nextCursor:overview.nextCursor||null,guardians:[{id:'',display_name:'暂不分配监护专员'},...items.filter(i=>i.service_kind!=='AGENT')],directors:items.filter(i=>i.review_role==='DIRECTOR')});
      this.filterCases();
    }catch(e){if(this.current(generation,identity))this.setData({error:e.message});}
    finally{if(this.current(generation,identity))this.setData({loading:false});}
  },
  filterCases(){const q=this.data.search.trim().toLowerCase();this.setData({filteredCases:this.data.cases.filter(c=>!q||[c.childName,c.parentName,c.id].join(' ').toLowerCase().includes(q))});},
  searchCases(e){this.setData({search:e.detail.value});this.filterCases();},
  async more(){
    if(this.data.busy||!this.data.nextCursor)return;
    const generation=this.generation,identity=viewSession.capture();this.setData({busy:true,error:''});
    try{const r=await service.call('SERVICE_CHAT_OVERVIEW',{cursor:this.data.nextCursor});if(!this.current(generation,identity))return;if(!r.canManage)throw Error('没有服务管理权限');this.setData({cases:this.data.cases.concat(r.cases||[]),nextCursor:r.nextCursor||null});this.filterCases();}
    catch(e){if(this.current(generation,identity))this.setData({error:e.message});}
    finally{if(this.current(generation,identity))this.setData({busy:false});}
  },
  async selectCase(e){
    if(this.data.busy)return;
    const id=e.currentTarget.dataset.id,generation=this.generation,identity=viewSession.capture();
    this.setData({busy:true,error:'',appointment:null,selected:this.data.cases.find(c=>String(c.id)===String(id))});
    try{const r=await service.call('GET_SERVICE_CASE',{appointmentId:id});if(!this.current(generation,identity))return;if(!r.canManage)throw Error('没有服务管理权限');const a=r.appointment,meta=a.service_metadata||{};this.setData({appointment:a,meta:{...meta},guardianIndex:Math.max(0,this.data.guardians.findIndex(i=>String(i.id)===String(a.guardian_id))),directorIndex:Math.max(0,this.data.directors.findIndex(i=>String(i.id)===String(a.director_id))),levelIndex:Math.max(0,this.data.levels.indexOf(meta.level||''))});}
    catch(e){if(this.current(generation,identity))this.setData({error:e.message});}
    finally{if(this.current(generation,identity))this.setData({busy:false});}
  },
  closeCase(){if(!this.data.busy)this.setData({selected:null,appointment:null,error:''});},
  changeStaff(e){const field=e.currentTarget.dataset.field;if(['guardianIndex','directorIndex'].includes(field))this.setData({[field]:Number(e.detail.value)});},
  changeMeta(e){this.setData({['meta.'+e.currentTarget.dataset.field]:e.detail.value});},
  changeLevel(e){const levelIndex=Number(e.detail.value);this.setData({levelIndex,'meta.level':this.data.levels[levelIndex]});},
  changePriority(e){this.setData({'meta.priority':e.detail.value});},
  async save(){
    if(this.data.busy||!this.data.allowed||!this.data.appointment)return;
    const director=this.data.directors[this.data.directorIndex],guardian=this.data.guardians[this.data.guardianIndex];
    if(!director){this.setData({error:'请先在身份管理中授权总监，再分配'});return;}
    const generation=this.generation,identity=viewSession.capture(),a=this.data.appointment;
    this.setData({busy:true,error:''});
    try{await service.call('ASSIGN_SERVICE_CASE',{appointmentId:a.id,previousUpdatedAt:a.updated_at,guardianId:guardian&&guardian.id||null,directorId:director.id,...this.data.meta});if(!this.current(generation,identity))return;wx.showToast({title:'服务分配已保存',icon:'success'});await this.load();}
    catch(e){if(this.current(generation,identity))this.setData({error:e.message});}
    finally{if(this.current(generation,identity))this.setData({busy:false});}
  },
  openPermissions(){wx.navigateTo({url:'/pages/manager/manager?tab=identities'});}
});
