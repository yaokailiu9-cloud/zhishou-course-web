// Render the backend's plain-text course introduction without injecting HTML.
function courseSections(description) {
  const sections=[];
  let title='课程介绍', lines=[];
  function flush() {
    const body=lines.join('\n').trim();
    if(body)sections.push({title,body});
  }
  for(const line of String(description||'').split(/\r?\n/)) {
    const heading=line.match(/^##\s+(.+)$/);
    if(heading){flush();title=heading[1].trim();lines=[];}
    else lines.push(line);
  }
  flush();
  return sections;
}
// Existing backend subtitles identify the two recorded-course categories.
const ANSWER_LIBRARY_SUBTITLE='《答案库》系列课程';
const PERSONAL_GROWTH_SUBTITLE='个人成长课程';
function isAnswerLibraryCourse(course) {
  return !!course && course.subtitle===ANSWER_LIBRARY_SUBTITLE;
}
function isPersonalGrowthCourse(course) {
  return !!course && course.subtitle===PERSONAL_GROWTH_SUBTITLE;
}
module.exports={courseSections,ANSWER_LIBRARY_SUBTITLE,PERSONAL_GROWTH_SUBTITLE,isAnswerLibraryCourse,isPersonalGrowthCourse};
