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
module.exports={courseSections};
