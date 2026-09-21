const test=require('node:test'),assert=require('node:assert/strict'),jsQR=require('jsqr');
const {poster}=require('../../utils/referralPoster');
test('二维码海报独立解码到原推荐链接，图片文案不打印链接',()=>{
 const text=[];let pixels;const canvas={getContext(){pixels=new Uint8ClampedArray(this.width*this.height*4);pixels.fill(255);return{fillStyle:'',font:'',textAlign:'',measureText:s=>({width:Array.from(s).length*30}),fillText:s=>text.push(s),fillRect(x,y,w,h){const color=this.fillStyle==='#123b35'?[18,59,53]:[255,255,255];for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){const at=(py*750+px)*4;pixels[at]=color[0];pixels[at+1]=color[1];pixels[at+2]=color[2];}}};},toDataURL:type=>{assert.equal(type,'image/png');return 'data:image/png;base64,test';}};
 const url='https://www.apply.tianqiwushu.cn/web/?ref='+Buffer.from(JSON.stringify({kind:'ref',accountId:'1000000000000019',exp:1800000000})).toString('base64url')+'.'+'A'.repeat(43)+'#/pages/public-class-detail/public-class-detail?id=7';
 assert.match(poster(canvas,{url,title:'亲子沟通公开课',name:'分享人甲'}),/^data:image\/png/);
 assert.equal(jsQR(pixels,canvas.width,canvas.height)?.data,url);assert.ok(text.some(t=>t.includes('登录后进入课程')));assert.ok(text.some(t=>t.includes('分享人甲')));assert.ok(!text.join('').includes('https://'));
});
