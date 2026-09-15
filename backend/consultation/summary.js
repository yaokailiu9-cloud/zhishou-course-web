var s=getState(), p=s.payload, op=s.operation;
if (["SUMMARIZE_TEXT","PREPARE_RECORDING","PROCESS_RECORDING","RETRY_SUMMARY"].indexOf(op)>=0) {
  var a=appointment(s,p.appointmentId);
  if (["CONFIRMED","COMPLETED"].indexOf(a.status)<0) fail("预约确认后才能总结沟通");
  if (String(a.customer_id)!==String(s.actor.accountId)) staff(s,"canReply");
  if (op==="SUMMARIZE_TEXT" || op==="PREPARE_RECORDING") {
    var key=requestKey(s,"summary"), old=list("consultation_summary_job",eq("request_key",key,"text"),JOB_FIELDS,1)[0];
    if (old) { if(op==="PREPARE_RECORDING") fail("本次上传已分配，请重新录制或重试处理已有录音"); result(s,{id:old.id}); }
    else {
      var recent=list("consultation_summary_job",and(eq("appointment_id",a.id),eq("requester_id",s.actor.accountId)),JOB_FIELDS,30);
      if (recent.some(function(j){return ["QUEUED","PROCESSING","AUDIO_PROCESSING"].indexOf(j.status)>=0 && Date.now()-new Date(j.updated_at || j.created_at).getTime()<900000;})) fail("本次咨询已有总结正在处理，请等待或刷新进度");
      var object={request_key:key,appointment_id:a.id,requester_id:s.actor.accountId,source:op==="PREPARE_RECORDING"?"AUDIO":"TEXT",status:"QUEUED"};
      var upload=null;
      if (op==="PREPARE_RECORDING") {
        var consent=date(p.consentedAt,"录音同意时间");
        if (Math.abs(Date.now()-new Date(consent).getTime())>86400000) fail("请在本次录音前确认参与者同意");
        var size=Number(p.sizeBytes);if (!Number.isInteger(size)||size<1||size>10000000) fail("录音文件应在10MB以内，请分段录制");
        var md5=text(p.md5Base64,"文件校验",24,true);if(!/^[A-Za-z0-9+/]{22}==$/.test(md5)) fail("文件校验无效");
        upload=gql('mutation AllocateRecording($md5: String!, $size: Int!) { filePresignedUrl(md5Base64:$md5, sizeBytes:$size, name:"consultation-recording", suffix:"mp3", format:MP3, acl:PRIVATE) { fileId uploadUrl uploadHeaders contentType } }',{md5:md5,size:size}).filePresignedUrl;
        object.recording_id=upload.fileId;object.consented_at=consent;object.status="UPLOADING";
      } else {
        var rows=list("consultation_feedback",eq("appointment_id",a.id),FEEDBACK_FIELDS,501);
        if (!rows.length) fail("本次咨询还没有文字沟通，请先在下方留言或反馈");
        var hasMore=rows.length>500;rows=rows.slice(0,500).reverse();
        var lines=[];rows.forEach(function(f){lines.push("家长："+f.content);(f.replies||[]).slice().sort(function(x,y){return Number(x.id)-Number(y.id);}).forEach(function(r){lines.push("老师："+r.content);});});
        var transcript=lines.join("\n");if(transcript.length>60000) fail("文字较多，请联系老师分段整理");
        object.transcript=transcript;object.source_range={firstFeedbackId:rows[0].id,lastFeedbackId:rows[rows.length-1].id,count:rows.length,hasEarlier:hasMore};
      }
      var jobId=insert("consultation_summary_job",object,"consultation_summary_job_request_key");
      if(!jobId) fail("该总结请求已提交，请刷新查看");
      if(!upload) context.createActionFlowTask("db7162d9-adc6-412a-ae7d-830d095ae022",null,{job_id:jobId});
      result(s,{id:jobId,upload:upload});
    }
  } else {
    var job=one("consultation_summary_job",p.jobId,JOB_FIELDS);
    if(String(job.appointment_id)!==String(a.id)||String(job.requester_id)!==String(s.actor.accountId)) fail("只能处理自己提交的本次总结");
    if(op==="PROCESS_RECORDING" && (job.source!=="AUDIO" || !job.recording_id || !job.consented_at)) fail("录音尚未准备好");
    if(["QUEUED","PROCESSING","AUDIO_PROCESSING","READY"].indexOf(job.status)>=0) result(s,{id:job.id});
    else {
      if(op==="RETRY_SUMMARY" && job.status!=="FAILED") fail("只有失败任务可以重新处理");
      if(op==="PROCESS_RECORDING" && job.status!=="UPLOADING") fail("录音状态已变化，请刷新");
      update("consultation_summary_job",and(eq("id",job.id),eq("status",job.status,"text")),{status:"QUEUED",error_message:null,conversation_ref:null});
      context.createActionFlowTask("db7162d9-adc6-412a-ae7d-830d095ae022",null,{job_id:job.id});result(s,{id:job.id});
    }
  }
}
if (!s.result) fail("暂不支持此操作");
context.setReturn("state",s.result);
