// Message deletion is a reversible status change, with an immutable original snapshot in the existing review journal.
// The journal and the status change share the service action flow's transaction.
function dialogueDeletedIds(a){
 var ids=p.visibleIds;if(ids==null)return [];
 if(!Array.isArray(ids)||ids.length>200)fail('消息同步参数无效');
 if(!ids.length)return [];
 return list('consultation_feedback',and(eq('appointment_id',a.id),eq('advice_key','__consultation_dialogue__','text'),eq('status','DELETED','text'),{_or:ids.map(function(v){return eq('id',id(v));})}),'id',200).map(function(row){return row.id;});
}
if(op==='DELETE_SERVICE_MESSAGE'){
 staff(s,'canReply');var access=serviceCase(p.appointmentId);serviceCanWrite(access);var a=access.row;
 if(p.kind==='dialogue'){
  var row=one('consultation_feedback',p.messageId,'id appointment_id author_id advice_key content status created_at');
  if(String(row.appointment_id)!==String(a.id)||row.advice_key!=='__consultation_dialogue__'||String(row.author_id)!==String(s.actor.accountId)||String(row.author_id)===String(a.customer_id))fail('只能删除自己发出的老师消息');
  if(row.status!=='DELETED'){
   var actor=one('service_provider',s.actor.providerId,'id display_name');
   var event={action:'DELETE',actorAccountId:String(s.actor.accountId),actorName:actor.display_name||'老师',role:serviceRole(),at:new Date().toISOString(),beforeBody:{content:row.content},afterBody:null};
   var log=insert('service_review_item',{request_key:'message-log:'+row.id,appointment_id:a.id,feedback_id:row.id,author_id:s.actor.providerId,kind:'MESSAGE_LOG',stage:'DELETED',revision:1,body:{content:row.content},history:[event]},'service_review_item_request_key');
   if(!log)fail('消息状态已变化，请刷新后重试');
   update('consultation_feedback',and(eq('id',row.id),eq('appointment_id',a.id),eq('author_id',s.actor.accountId),eq('status',row.status,'text')),{status:'DELETED'});
   row.status='DELETED';
  }
  result(s,{id:row.id,kind:'dialogue',message:dialogueMessage(a,row)});
 }else if(p.kind==='reply'){
  var item=one('service_review_item',p.messageId,SERVICE_REVIEW_FIELDS);
  if(String(item.appointment_id)!==String(a.id)||item.kind!=='REPLY'||String(item.author_id)!==String(s.actor.providerId))fail('只能删除自己发出的老师回复');
  if(item.stage!=='DELETED'){if(!serviceVisible(item))fail('只能删除已经发出的老师回复');serviceRevision(item);serviceSave(item,{stage:'DELETED'},'DELETE');}
  result(s,{id:item.id,kind:'reply'});
 }else fail('消息类型无效');
}
if(op==='GET_SERVICE_MESSAGE_HISTORY'){
 var access=serviceCase(p.appointmentId);if(!access.staff)fail('只有本档案的工作人员可查看历史记录');
 var scope=and(eq('appointment_id',access.row.id),{_or:[eq('kind','MESSAGE_LOG','text'),eq('kind','REPLY','text'),eq('kind','PLAN','text')]}),page=pageRows('service_review_item',scope,SERVICE_REVIEW_FIELDS,p.cursor,20,true),events=[];
 page.items.forEach(function(row){(row.history||[]).forEach(function(event,index){events.push({key:String(row.id)+':'+index,itemId:row.id,kind:row.kind,action:event.action,actorAccountId:event.actorAccountId||'',actorName:event.actorName||'',role:event.role||'',at:event.at||row.created_at,note:event.note||'',beforeBody:event.beforeBody||null,afterBody:event.afterBody||null,hasSnapshot:!!event.beforeBody||!!event.afterBody});});});
 events.sort(function(a,b){return (Date.parse(b.at)||0)-(Date.parse(a.at)||0)||Number(b.itemId)-Number(a.itemId);});
 result(s,{events:events,nextCursor:page.nextCursor});
}
