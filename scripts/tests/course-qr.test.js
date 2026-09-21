const test=require('node:test'),assert=require('node:assert/strict');
const {matrix}=require('../../utils/courseQr');
const jsQR=require('jsqr');
test('个人入场码在不同绘制尺寸下可被独立扫码库解码',()=>{
 const payload='EMPATH-ENTRY:ABCDEFGHJKLMNPQRSTUVWXYZ2',cells=matrix(payload);
 for(const size of [220,256,512]){const pixels=new Uint8ClampedArray(size*size*4);pixels.fill(255);const unit=size/(cells.length+8);for(let y=0;y<cells.length;y++)for(let x=0;x<cells.length;x++)if(cells[y][x])for(let py=Math.round((y+4)*unit);py<Math.round((y+5)*unit);py++)for(let px=Math.round((x+4)*unit);px<Math.round((x+5)*unit);px++){const i=(py*size+px)*4;pixels[i]=24;pixels[i+1]=59;pixels[i+2]=53;}
 const decoded=jsQR(pixels,size,size);assert.ok(decoded,'尺寸 '+size);assert.equal(decoded.data,payload);}
});

test('带签名的长推荐链接二维码可以扫描回原课程和推荐码',()=>{
 const payload='https://www.apply.tianqiwushu.cn/web/?ref='+Buffer.from(JSON.stringify({kind:'ref',accountId:'123456',exp:1800000000})).toString('base64url')+'.'+'A'.repeat(43)+'#/pages/public-class-detail/public-class-detail?id=123';
 const cells=matrix(payload),size=256,pixels=new Uint8ClampedArray(size*size*4);pixels.fill(255);const unit=size/(cells.length+8);
 for(let y=0;y<cells.length;y++)for(let x=0;x<cells.length;x++)if(cells[y][x])for(let py=Math.round((y+4)*unit);py<Math.round((y+5)*unit);py++)for(let px=Math.round((x+4)*unit);px<Math.round((x+5)*unit);px++){const i=(py*size+px)*4;pixels[i]=24;pixels[i+1]=59;pixels[i+2]=53;}
 assert.equal(jsQR(pixels,size,size)?.data,payload);
});
