const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {courseSections}=require('../../utils/courseContent');
function home(listCourses){
 let page;const navigations=[];
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/index/index.js'),'utf8'),{
  Page:p=>page=p,require:n=>n.endsWith('/zion')?{listCourses}:{enterCustomerView(){}},encodeURIComponent,
  wx:{navigateTo:v=>navigations.push(v.url)}
 });
 page.data=structuredClone(page.data);page.setData=function(patch){Object.assign(this.data,patch);};return{page,navigations};
}
test('首页从后端推荐付费课程，保留真实课程 ID 且不将免费旧课程改为付费',async()=>{
 const rows=[{id:'1234567890123456',title:'二阶线上共修',badge:'付费',coverUrl:''},{id:'2',title:'原有课程',badge:'热门'}];
 const {page,navigations}=home(async()=>({courses:rows}));await page.fetchFeaturedCourses();
 assert.equal(page.data.featuredCourses.length,1);assert.equal(page.data.featuredCourses[0].id,rows[0].id);assert.equal(rows[1].badge,'热门');assert.equal(page.data.featuredCourses[0].coverUrl,'');
 page.openCourse({currentTarget:{dataset:{id:rows[0].id}}});page.goSearch();
 assert.deepEqual(navigations,['/pages/course-detail/course-detail?id='+rows[0].id,'/pages/search/search?mode=courses']);
});
test('首页后端读取失败可重试，不使用人物或虚构课程作为兜底',async()=>{
 let failed=true;const{page}=home(async()=>{if(failed)throw Error('offline');return{courses:[]};});
 await page.fetchFeaturedCourses();assert.equal(page.data.featuredCourses.length,0);assert.match(page.data.courseError,/加载失败/);assert.equal(page.data.loadingCourses,false);
 failed=false;await page.fetchFeaturedCourses();assert.equal(page.data.courseError,'');assert.equal(page.data.featuredCourses.length,0);
});
test('课程介绍按后台段落展示，收费、免费权益及学习规则完整保留',()=>{
 const content=fs.readFileSync(path.resolve(__dirname,'../../outputs/course-home-2026-09-11/二阶共修营课程文案.md'),'utf8').split('\n').slice(1).join('\n');
 const sections=courseSections(content);assert.equal(sections.length,7);
 const price=sections.find(s=>s.title==='收费标准').body;assert.match(price,/未建档家长：1680元/);assert.match(price,/已建档家长：优惠价680元/);
 assert.match(sections.find(s=>s.title==='自愿参加，原有权益不变').body,/不会影响原有帮扶指导/);
 assert.match(sections.find(s=>s.title==='学习安排与规则').body,/迟到15分钟/);
 assert.deepEqual(courseSections(null),[]);
 assert.deepEqual(courseSections('## 标题\r\n正文\r\n\r\n第二段'),[{title:'标题',body:'正文\n\n第二段'}]);
});
