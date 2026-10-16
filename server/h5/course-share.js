// Anonymous course metadata only: never include lesson or video fields in link previews.
const ENDPOINT='https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2';
function escape(value) { return String(value || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function courseShareHead(html,requestUrl) {
  const id=new URL(requestUrl,'https://www.apply.tianqiwushu.cn').searchParams.get('course');
  if(!/^[1-9][0-9]{0,18}$/.test(id || ''))return html;
  try {
    const response=await fetch(process.env.ZION_GRAPHQL_URL || ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},signal:AbortSignal.timeout(5000),
      body:JSON.stringify({query:'query CourseSharePreview($id:bigint!){course_by_pk(id:$id){id title subtitle enabled cover_url cover_image{url}}}',variables:{id}})});
    if(!response.ok)return html;
    const body=await response.json(),c=body.data?.course_by_pk;
    if(body.errors || !c?.title || c.enabled !== true)return html;
    const title=escape(c.title),desc=escape(c.subtitle || '知守课程 · 查看课程图片与介绍');
    const image=c.cover_image?.url || c.cover_url || '';
    const link='https://www.apply.tianqiwushu.cn/web/?course='+encodeURIComponent(id)+'#/pages/course-detail/course-detail?id='+encodeURIComponent(id);
    const meta=`<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${escape(link)}">`+(/^https?:\/\//.test(image)?`<meta property="og:image" content="${escape(image)}">`:'');
    return html.replace(/<title>[\s\S]*?<\/title>/,`<title>${title} · 知守</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${desc}">`).replace('</head>',meta+'\n</head>');
  }catch(_){return html;}
}
module.exports={courseShareHead};
