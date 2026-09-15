var s=getState(),job=one("consultation_summary_job",s.jobId,JOB_FIELDS);
if(job.conversation_ref!==s.attempt || job.status!=="PROCESSING" || String(job.requester_id)!==String(s.requesterId)) fail("总结任务状态已变化");
var conversationId=id(context.getArg("conversation_id"));
if(s.source==="AUDIO") {
  try {
    gql('mutation SendRecording($conversation: Long!, $file: Long!) { fz_zai_send_ai_message(conversationId:$conversation, fileId:$file, text:"请读取附件录音，先逐段转写，再整理沟通要点、明确约定的行动和待确认事项。听不清则标注，无法读取则明确写出无法读取音频，不能猜测。") }',{conversation:conversationId,file:id(job.recording_id)});
    update("consultation_summary_job",and(eq("id",job.id),eq("conversation_ref",s.attempt,"text")),{status:"AUDIO_PROCESSING",conversation_ref:String(conversationId)});
  } catch(e) {update("consultation_summary_job",and(eq("id",job.id),eq("conversation_ref",s.attempt,"text")),{status:"FAILED",error_message:"录音未能提交处理，请稍后重试。"});}
} else {
  var draft=text(context.getArg("draft"),"总结草稿",60000,true);
  update("consultation_summary_job",and(eq("id",job.id),eq("conversation_ref",s.attempt,"text")),{status:"READY",draft:draft,conversation_ref:String(conversationId)});
}
