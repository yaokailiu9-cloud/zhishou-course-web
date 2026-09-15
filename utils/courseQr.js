const qrcode=require('./vendor/qrcode');
function matrix(value) {
  const qr=qrcode(0,'M');qr.addData(value);qr.make();
  return Array.from({length:qr.getModuleCount()},(_,y)=>Array.from({length:qr.getModuleCount()},(_,x)=>qr.isDark(y,x)));
}
function draw(page,canvasId,value,size=256) {
  const cells=matrix(value), ctx=wx.createCanvasContext(canvasId,page),unit=size/(cells.length+8);
  ctx.setFillStyle('#ffffff');ctx.fillRect(0,0,size,size);ctx.setFillStyle('#183b35');
  cells.forEach((row,y)=>row.forEach((dark,x)=>{if(dark){const left=Math.round((x+4)*unit),top=Math.round((y+4)*unit);ctx.fillRect(left,top,Math.round((x+5)*unit)-left,Math.round((y+5)*unit)-top);}}));
  return new Promise(resolve=>ctx.draw(false,resolve));
}
module.exports={matrix,draw};
