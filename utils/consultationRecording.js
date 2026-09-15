const service=require('./consultationService');
const {md5Base64}=require('./md5');
async function uploadAndSummarize(filePath,appointmentId,consentedAt){
 const bytes=await new Promise((resolve,reject)=>wx.getFileSystemManager().readFile({filePath,success:r=>resolve(r.data),fail:()=>reject(new Error('录音文件读取失败，请重新录制'))}));
 if(!bytes.byteLength||bytes.byteLength>10000000)throw new Error('录音应在10MB以内，请分段录制');
 const job=await service.call('PREPARE_RECORDING',{appointmentId,consentedAt,sizeBytes:bytes.byteLength,md5Base64:md5Base64(bytes),requestKey:service.requestKey()});
 const upload=job.upload;
 if(!upload||!/^https:\/\//.test(upload.uploadUrl))throw new Error('录音上传暂不可用');
 await new Promise((resolve,reject)=>wx.request({url:upload.uploadUrl,method:'PUT',data:bytes,timeout:120000,header:{'content-type':upload.contentType,...(upload.uploadHeaders||{})},success:r=>r.statusCode>=200&&r.statusCode<300?resolve():reject(new Error('录音上传失败，请重新录制')),fail:()=>reject(new Error('录音上传失败，请检查网络后重新录制'))}));
 try{return await service.call('PROCESS_RECORDING',{appointmentId,jobId:job.id});}catch(e){throw new Error('录音已上传，提交处理未完成。请刷新后点击“处理已上传录音”。');}
}
module.exports={uploadAndSummarize};
