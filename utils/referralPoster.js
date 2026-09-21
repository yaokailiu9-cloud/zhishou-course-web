// Deterministic, self-contained PNG: the link is encoded in the QR, never printed.
const {matrix}=require('./courseQr');
function poster(canvas,{url,title='知守课程报名',name=''}) {
 canvas.width=750;canvas.height=1060;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('二维码图片生成失败，请刷新后重试');
 ctx.fillStyle='#fbf9f8';ctx.fillRect(0,0,750,1060);
 ctx.fillStyle='#123b35';ctx.font='bold 32px sans-serif';ctx.fillText('知守 · 课程邀请',60,78);
 ctx.font='bold 38px sans-serif';
 const chars=Array.from(String(title).slice(0,80));let lines=[''];
 for(const char of chars){let index=lines.length-1;if(ctx.measureText(lines[index]+char).width>620){if(lines.length===2){lines[1]=lines[1].slice(0,-1)+'…';break;}lines.push(char);}else lines[index]+=char;}
 lines.forEach((line,i)=>ctx.fillText(line,60,146+i*54));
 const cells=matrix(url),size=570,offsetX=90,offsetY=235,unit=size/(cells.length+8);
 ctx.fillStyle='#fff';ctx.fillRect(offsetX,offsetY,size,size);ctx.fillStyle='#123b35';
 cells.forEach((row,y)=>row.forEach((dark,x)=>{if(dark){const left=Math.round((x+4)*unit),top=Math.round((y+4)*unit);ctx.fillRect(offsetX+left,offsetY+top,Math.round((x+5)*unit)-left,Math.round((y+5)*unit)-top);}}));
 ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('微信扫一扫 / 长按识别二维码',375,865);
 ctx.font='25px sans-serif';ctx.fillText(/[?&]ref=/.test(url)?'登录后进入课程，推荐信息自动保留':'微信内打开课程，查看详情并报名',375,914);
 if(name){ctx.font='24px sans-serif';ctx.fillText('分享人：'+Array.from(String(name)).slice(0,18).join(''),375,966);}
 return canvas.toDataURL('image/png');
}
module.exports={poster};
