const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {courseSections}=require('../../utils/courseContent');
function home(listCourses){
 let page;const navigations=[];
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/index/index.js'),'utf8'),{
  Page:p=>page=p,require:n=>n.endsWith('/zion')?{listCourses}:n.endsWith('/courseContent')?require('../../utils/courseContent'):{enterCustomerView(){}},encodeURIComponent,
  wx:{navigateTo:v=>navigations.push(v.url)}
 });
 page.data=structuredClone(page.data);page.setData=function(patch){Object.assign(this.data,patch);};return{page,navigations};
}
test('首页将个人成长与孩子系列分开，并直接推荐两堂手机课',async()=>{
 const rows=[{id:'1234567890123456',title:'二阶线上共修',badge:'付费',coverUrl:''},{id:'2',title:'原有课程',badge:'热门'},{id:'8',title:'奖励的误区',subtitle:'《答案库》系列课程',coverUrl:'https://example.invalid/cover.jpg'},{id:'15',title:'沉迷手机',subtitle:'《答案库》系列课程'},{id:'16',title:'该不该使用手机',subtitle:'《答案库》系列课程'},{id:'17',title:'责善',subtitle:'个人成长课程'}];
 const {page,navigations}=home(async()=>({courses:rows}));await page.fetchFeaturedCourses();
 assert.deepEqual(page.data.childCourses.map(course=>course.id),['8','15','16']);
 assert.deepEqual(page.data.personalGrowthCourses.map(course=>course.id),['17']);
 assert.deepEqual(page.data.phoneCourses.map(course=>course.title),['沉迷手机','该不该使用手机']);
 page.openCourse({currentTarget:{dataset:{id:rows[4].id}}});page.goSearch();
 assert.deepEqual(navigations,['/pages/course-detail/course-detail?id=16','/pages/search/search?mode=courses']);
});
test('首页后端读取失败可重试，不使用人物或虚构课程作为兜底',async()=>{
 let failed=true;const{page}=home(async()=>{if(failed)throw Error('offline');return{courses:[]};});
 await page.fetchFeaturedCourses();assert.equal(page.data.childCourses.length,0);assert.equal(page.data.personalGrowthCourses.length,0);assert.match(page.data.courseError,/加载失败/);assert.equal(page.data.loadingCourses,false);
 failed=false;await page.fetchFeaturedCourses();assert.equal(page.data.courseError,'');assert.equal(page.data.phoneCourses.length,0);
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
