const zion=require('../../utils/zion');
Page({
 data:{mode:'advisors',keyword:'',items:[],results:[],searched:false,loading:false,error:''},
 onLoad(q={}){this.setData({mode:q.mode==='courses'?'courses':'advisors'});this.refresh();},
 async refresh(){this.setData({loading:true,error:''});try{
   const courses=this.data.mode==='courses';
   const r=await (courses?zion.listCourses({limit:50}):zion.listAdvisors({limit:50}));
   const items=(courses?r.courses:r.advisors)||[];
   this.setData({items:items.map(i=>({...i,displayTags:(i.tags||[]).slice(0,3),detailUrl:(courses?'/pages/course-detail/course-detail?id=':'/pages/advisor/advisor?id=')+encodeURIComponent(i.id)}))});this.runSearch(this.data.keyword);
  }catch(e){this.setData({items:[],results:[],error:'搜索内容暂时加载失败，请重试。'});}finally{this.setData({loading:false});}},
 onKeywordInput(e){this.setData({keyword:e.detail.value});this.runSearch(e.detail.value);},
 clearKeyword(){this.setData({keyword:'',results:[],searched:false});},
 runSearch(value){const keyword=String(value||'').trim().toLowerCase();this.setData({searched:!!keyword,results:keyword?this.data.items.filter(i=>[i.name,i.title,i.subtitle,i.bio,i.company,(i.tags||[]).join(' '),(i.topics||[]).join(' ')].some(v=>String(v||'').toLowerCase().includes(keyword))):[]});},
});
