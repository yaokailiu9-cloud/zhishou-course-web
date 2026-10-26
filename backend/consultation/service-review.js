// Service management: all scopes and review transitions are decided by the authenticated backend actor.
var s=s||getState(),p=s.payload,op=s.operation;
var SERVICE_CASE_FIELDS=APPOINTMENT_FIELDS+(/\bupdated_at\b/.test(APPOINTMENT_FIELDS)?'':' updated_at')+' guardian_id director_id service_metadata guardian { id display_name } director { id display_name }';
var SERVICE_REVIEW_FIELDS='id created_at updated_at request_key appointment_id feedback_id author_id kind body stage revision available_at history';
function serviceRole(){return s.actor.reviewRole||'';}
function serviceGeneral(){return serviceRole()==='GENERAL'&&s.actor.serviceKind==='STAFF'&&s.actor.canAccept&&s.actor.canReply;}
function serviceScope(){login(s);if(serviceGeneral())return {_not:eq('status','CANCELED','text')};var scopes=[eq('customer_id',s.actor.accountId)];if(s.actor.canReply&&s.actor.providerId){scopes.push(eq('guardian_id',s.actor.providerId));if(serviceRole()==='DIRECTOR')scopes.push(eq('director_id',s.actor.providerId));}return and({_or:scopes},{_not:eq('status','CANCELED','text')});}
function serviceCase(value){var a=one('offline_appointment',value,SERVICE_CASE_FIELDS);login(s);var own=String(a.customer_id)===String(s.actor.accountId),assigned=s.actor.canReply&&s.actor.providerId&&(String(a.guardian_id)===String(s.actor.providerId)||serviceRole()==='DIRECTOR'&&String(a.director_id)===String(s.actor.providerId));if(a.status==='CANCELED'||!(own||assigned||serviceGeneral()))fail('不能访问其他孩子的服务档案');return {row:a,owner:own,staff:!own&&(assigned||serviceGeneral())};}
function serviceVisible(r){return r.stage==='APPROVED'&&r.available_at&&new Date(r.available_at).getTime()<=Date.now();}
function serviceView(r,isStaff){if(!r)return null;var v={id:r.id,kind:r.kind,stage:r.stage,revision:r.revision,availableAt:r.available_at,feedbackId:r.feedback_id,createdAt:r.created_at};if(isStaff||serviceVisible(r)){v.body=r.body||{};if(isStaff)v.history=r.history||[];}if(!isStaff&&r.stage==='SUPPLEMENT')v.supplementNote=r.body&&r.body.supplementNote||'';return v;}
function serviceRevision(r){if(!r||Number(p.revision)!==Number(r.revision)||p.revision==null)fail('内容已更新，请刷新后重试');}
function serviceSave(r,values,event){var history=(r.history||[]).concat([{action:event,actorAccountId:String(s.actor.accountId),role:serviceRole(),at:new Date().toISOString(),note:text(p.note,'操作备注',2000,false)}]);values.revision=Number(r.revision)+1;values.history=history;update('service_review_item',and(eq('id',r.id),eq('revision',Number(r.revision)),eq('stage',r.stage,'text')),values);return one('service_review_item',r.id,SERVICE_REVIEW_FIELDS);}
function serviceBody(kind){if(kind==='REPLY')return {content:text(p.content,'回复内容',6000,true)};return {summary:text(p.summary,'方案内容',16000,true),advice:text(p.advice,'执行建议',10000,false)};}
// SERVICE_CHAT_UNREAD: direct messages follow the GET_APPOINTMENT canTalk rule, so a reader only counts messages they can open.
function serviceTalk(a){return !!a&&!!a.customer_id&&['PENDING','CONFIRMED','COMPLETED','孩子档案'].indexOf(a.status)>=0&&(String(a.customer_id)===String(s.actor.accountId)||!!s.actor.providerId&&s.actor.serviceKind==='STAFF'&&!!s.actor.canAccept&&!!s.actor.canReply);}
function serviceSender(a,row){if(!row)return '';if(String(row.author_id)===String(s.actor.accountId))return '我';if(String(row.author_id)===String(a.customer_id))return (a.contact_name||'家长')+'（家长）';return '老师';}
// Service feedback/review read state is independent of direct-message ids and scoped to the reader.
function serviceIncomingUnread(apps){
 var out={},ids=[];(apps||[]).forEach(function(a){if(a&&a.id&&a.customer_id&&!Object.prototype.hasOwnProperty.call(out,a.id)){out[a.id]=0;ids.push(a.id);}});
 if(!ids.length)return out;
 var marks=gql('query ServiceMessageReadMarks($where:consultation_dialogue_read_bool_exp!){rows:consultation_dialogue_read(where:$where,limit:501){appointment_id service_read_at}}',{where:and(eq('reader_id',s.actor.accountId),{_or:ids.map(function(v){return eq('appointment_id',v);})})}).rows||[],byId={};
 marks.forEach(function(m){byId[m.appointment_id]=m.service_read_at;});
 var defs=[],selections=[],vars={},now=new Date().toISOString();
 (apps||[]).forEach(function(a,i){
  var readAt=byId[a.id]||'1970-01-01T00:00:00.000Z',own=String(a.customer_id)===String(s.actor.accountId),key='m'+i;
  if(own){vars[key]=and(eq('appointment_id',a.id),eq('kind','REPLY','text'),eq('stage','APPROVED','text'),compare('_lte','available_at',now,'timestamptz'),{_or:[compare('_gt','available_at',readAt,'timestamptz'),compare('_gt','updated_at',readAt,'timestamptz')]});defs.push('$'+key+':service_review_item_bool_exp!');selections.push(key+':service_review_item_aggregate(where:$'+key+'){aggregate{count}}');}
  else {vars[key]=and(eq('appointment_id',a.id),eq('advice_key','__service_feedback__','text'),eq('author_id',a.customer_id),compare('_gt','created_at',readAt,'timestamptz'));defs.push('$'+key+':consultation_feedback_bool_exp!');selections.push(key+':consultation_feedback_aggregate(where:$'+key+'){aggregate{count}}');}
 });
 var counts=gql('query ServiceMessageUnreadCounts('+defs.join(',')+'){'+selections.join(' ')+'}',vars);
 (apps||[]).forEach(function(a,i){out[a.id]=Number(counts['m'+i].aggregate.count)||0;});return out;
}
function markServiceMessagesRead(a){
 // Never take reader_id from the client. Concurrent readers get separate rows by the existing unique constraint.
 var where=and(eq('reader_id',s.actor.accountId),eq('appointment_id',a.id)),now=new Date().toISOString();
 gql('mutation ServiceMessageReadInsert($object:consultation_dialogue_read_insert_input!){saved:insert_consultation_dialogue_read(objects:[$object],on_conflict:{constraint:consultation_dialogue_read_reader_appointment,update_columns:[]}){affected_rows}}',{object:{reader_id:s.actor.accountId,appointment_id:a.id,last_read_id:0,service_read_at:now}});
 gql('mutation ServiceMessageReadUpdate($where:consultation_dialogue_read_bool_exp!,$object:consultation_dialogue_read_set_input!){saved:update_consultation_dialogue_read(where:$where,_set:$object){affected_rows}}',{where:and(where,{_or:[isNull('service_read_at','timestamptz'),compare('_lt','service_read_at',now,'timestamptz')]}),object:{service_read_at:now}});
}
function serviceUnreadTotal(){var rows=list('offline_appointment',serviceScope(),'id customer_id status',501),direct=dialogueUnread(rows.filter(serviceTalk)),feedback=serviceIncomingUnread(rows);return rows.reduce(function(n,a){return n+(direct[a.id]?direct[a.id].unread:0)+(feedback[a.id]||0);},0);}
function serviceCanWrite(a){if(!a.staff||!s.actor.canReply)fail('没有回复或整理方案的权限');}
if(op==='SERVICE_CHAT_OVERVIEW'){
 var role=serviceRole(),page=pageRows('offline_appointment',serviceScope(),SERVICE_CASE_FIELDS,p.cursor,20,true),vars={},defs=[],selections=[];
 page.items.forEach(function(a,i){var feedbackScope=and(eq('appointment_id',a.id),eq('advice_key','__service_feedback__','text'));vars['f'+i]=feedbackScope;vars['p'+i]=and(feedbackScope,{_not:eq('status','REPLIED','text')});vars['m'+i]=and(eq('appointment_id',a.id),eq('advice_key','__consultation_dialogue__','text'));vars['d'+i]=and(eq('appointment_id',a.id),eq('stage','DIRECTOR','text'));vars['g'+i]=and(eq('appointment_id',a.id),eq('stage','GENERAL','text'));['f','p','m'].forEach(function(k){defs.push('$'+k+i+':consultation_feedback_bool_exp!');});['d','g'].forEach(function(k){defs.push('$'+k+i+':service_review_item_bool_exp!');});selections.push('f'+i+':consultation_feedback(where:$f'+i+',order_by:{id:desc},limit:1){id content author_id created_at}','m'+i+':consultation_feedback(where:$m'+i+',order_by:{id:desc},limit:1){id content author_id created_at}','p'+i+':consultation_feedback_aggregate(where:$p'+i+'){aggregate{count}}','d'+i+':service_review_item_aggregate(where:$d'+i+'){aggregate{count}}','g'+i+':service_review_item_aggregate(where:$g'+i+'){aggregate{count}}');});
 var summaries=page.items.length?gql('query ServiceCaseSummaries('+defs.join(',')+'){'+selections.join(' ')+'}',vars):{};
 var unread=dialogueUnread(page.items.filter(serviceTalk)),serviceUnread=serviceIncomingUnread(page.items);
 result(s,{role:role,canManage:serviceGeneral(),staff:!!s.actor.providerId&&!!s.actor.canReply,nextCursor:page.nextCursor,unreadTotal:p.cursor?null:serviceUnreadTotal(),cases:page.items.map(function(a,i){var meta=Object.assign({},a.service_metadata||{});if(!s.actor.canReply)delete meta.memo;// PARENT_METADATA_HIDDEN: a parent's own archive carries no internal grading.
if(String(a.customer_id)===String(s.actor.accountId))meta={};var fb=summaries['f'+i][0],msg=serviceTalk(a)&&summaries['m'+i][0],last=msg&&(!fb||Number(msg.id)>Number(fb.id))?msg:fb;var stages=[];if(summaries['d'+i].aggregate.count)stages.push('DIRECTOR');if(summaries['g'+i].aggregate.count)stages.push('GENERAL');return {id:a.id,childName:a.child_info&&a.child_info.name||a.contact_name||'孩子档案',parentName:a.contact_name,grade:a.child_info&&a.child_info.grade||'',age:a.child_info&&a.child_info.age||'',concerns:a.concerns||'',metadata:meta,guardianName:a.guardian&&a.guardian.display_name||'',directorName:a.director&&a.director.display_name||'',pending:Number(summaries['p'+i].aggregate.count),unread:(unread[a.id]?unread[a.id].unread:0)+(serviceUnread[a.id]||0),latest:last&&last.content||a.concerns||'暂无反馈',latestFrom:serviceSender(a,last),latestAt:last&&last.created_at||'',reviewStages:stages};})});
}
if(op==='SERVICE_CHAT_UNREAD'){result(s,{total:serviceUnreadTotal()});}
if(op==='GET_SERVICE_CASE'){
 var access=serviceCase(p.appointmentId),a=access.row;
 var feedback=pageRows('consultation_feedback',and(eq('appointment_id',a.id),eq('advice_key','__service_feedback__','text')),'id created_at content status',p.beforeId,20,true),reviews=list('service_review_item',and(eq('appointment_id',a.id),{_or:[eq('kind','PLAN','text')].concat(feedback.items.map(function(f){return eq('feedback_id',f.id);}))}),SERVICE_REVIEW_FIELDS,21);
 var remaining=serviceIncomingUnread([a])[a.id]||0;if(p.markRead===true&&!p.beforeId&&remaining){markServiceMessagesRead(a);remaining=0;}var directUnread=serviceTalk(a)?dialogueUnread([a])[a.id].unread:0;
 var plan=reviews.filter(function(r){return r.kind==='PLAN';})[0];if(!access.staff){a=Object.assign({},a,{service_metadata:{}});}
 result(s,{appointment:a,unread:directUnread+remaining,owner:access.owner,staff:access.staff,role:serviceRole(),canManage:serviceGeneral(),canDraft:access.staff&&!!s.actor.canReply,parentServiceReadAt:access.staff?parentReadState(a).parentServiceReadAt:undefined,plan:serviceView(plan,access.staff),feedback:feedback.items.map(function(f){return {id:f.id,content:f.content,status:f.status,createdAt:f.created_at,reply:serviceView(reviews.filter(function(r){return r.kind==='REPLY'&&String(r.feedback_id)===String(f.id);})[0],access.staff)};}),nextCursor:feedback.nextCursor});
}
if(op==='SEND_SERVICE_FEEDBACK'){
 var access=serviceCase(p.appointmentId);if(!access.owner)fail('只有档案所属家长可以提交反馈');
 var key=requestKey(s,'service-feedback:'+access.row.id),content=text(p.content,'反馈内容',6000,true);
 if(content.indexOf(QUOTE_MARK)>=0)fail('反馈包含无效字符');content=dialogueQuote(access.row)+content;
 insert('consultation_feedback',{request_key:key,appointment_id:access.row.id,author_id:s.actor.accountId,advice_key:'__service_feedback__',content:content,status:'PENDING'},'consultation_feedback_request_key');result(s,{id:access.row.id});
}
if(op==='SAVE_SERVICE_DRAFT'){
 var access=serviceCase(p.appointmentId);serviceCanWrite(access);var kind=text(p.kind,'审核类型',20,true);if(['PLAN','REPLY'].indexOf(kind)<0)fail('审核类型无效');
 var feedbackId=null;if(kind==='REPLY'){var f=one('consultation_feedback',p.feedbackId,'id appointment_id advice_key');if(String(f.appointment_id)!==String(access.row.id)||f.advice_key!=='__service_feedback__')fail('反馈不属于本档案');feedbackId=f.id;}
 var key=kind==='PLAN'?'plan:'+access.row.id:'reply:'+feedbackId,old=list('service_review_item',eq('request_key',key,'text'),SERVICE_REVIEW_FIELDS,1)[0],body=serviceBody(kind),saved;
 if(old){serviceRevision(old);if(old.stage==='APPROVED')fail('已审核内容不能覆盖，请补充新的反馈');if(old.stage!=='DRAFT'&&old.stage!=='SUPPLEMENT')fail('请先退回修改，再编辑草稿');saved=serviceSave(old,{body:Object.assign({},old.body,body),stage:'DRAFT',available_at:null},'SAVE_DRAFT');}
 else {if(p.revision!=null)fail('草稿不存在，请刷新');var created=insert('service_review_item',{request_key:key,appointment_id:access.row.id,feedback_id:feedbackId,author_id:s.actor.providerId,kind:kind,body:body,stage:'DRAFT',revision:1,history:[{action:'CREATE',actorAccountId:String(s.actor.accountId),role:serviceRole(),at:new Date().toISOString()}]},'service_review_item_request_key');if(!created)fail('草稿已由其他操作创建，请刷新');saved=one('service_review_item',created,SERVICE_REVIEW_FIELDS);}
 result(s,{item:serviceView(saved,true)});
}
if(op==='REVIEW_SERVICE_ITEM'){
 var r=one('service_review_item',p.itemId,SERVICE_REVIEW_FIELDS),access=serviceCase(r.appointment_id);serviceCanWrite(access);serviceRevision(r);var action=text(p.action,'审核动作',30,true),next,values={};
 if(action==='SUBMIT'){if(r.stage!=='DRAFT')fail('只能提交草稿');if(!access.row.director_id)fail('请先由总管分配总监');var reviewer=one('service_provider',access.row.director_id,'id service_status review_role can_reply');if(reviewer.service_status!=='ACTIVE'||reviewer.review_role!=='DIRECTOR'||!reviewer.can_reply)fail('分配的总监尚未具备复核权限');next='DIRECTOR';}
 else if(action==='APPROVE'){if(r.stage==='DIRECTOR'){if(serviceRole()!=='DIRECTOR'||String(access.row.director_id)!==String(s.actor.providerId))fail('仅分配的总监可以复核');next='GENERAL';}else if(r.stage==='GENERAL'){if(!serviceGeneral())fail('仅总管可以终审');next='APPROVED';var release=new Date(p.availableAt).getTime();if(!p.availableAt||!isFinite(release)||release<Date.now()-300000||release>Date.now()+31536000000)fail('请选择有效的家长可见时间');values.available_at=new Date(Math.max(release,Date.now())).toISOString();}else fail('当前阶段不能审核通过');}
 else if(action==='RETURN'||action==='SUPPLEMENT'){if(!((r.stage==='DIRECTOR'&&serviceRole()==='DIRECTOR'&&String(access.row.director_id)===String(s.actor.providerId))||(r.stage==='GENERAL'&&serviceGeneral())))fail('没有当前级别的审核权限');var note=text(p.note,'退回或补充说明',2000,true);next=action==='SUPPLEMENT'?'SUPPLEMENT':'DRAFT';values.body=Object.assign({},r.body,{supplementNote:note});values.available_at=null;}
 else fail('审核动作无效');
 values.stage=next;var saved=serviceSave(r,values,action);if(next==='APPROVED'&&r.kind==='REPLY')update('consultation_feedback',eq('id',r.feedback_id),{status:'REPLIED'});result(s,{item:serviceView(saved,true)});
}
if(op==='SUPPLEMENT_SERVICE_CASE'){
 var access=serviceCase(p.appointmentId);if(!access.owner)fail('只有家长本人可补充');var r=one('service_review_item',p.itemId,SERVICE_REVIEW_FIELDS);if(String(r.appointment_id)!==String(access.row.id)||r.kind!=='PLAN'||r.stage!=='SUPPLEMENT')fail('当前方案无需补充');serviceRevision(r);
 var info=text(p.content,'补充信息',6000,true),body=Object.assign({},r.body,{parentSupplement:info});var saved=serviceSave(r,{body:body,stage:'DRAFT'},'PARENT_SUPPLEMENT');result(s,{item:serviceView(saved,false)});
}
if(op==='LIST_SERVICE_STAFF'){
 if(!serviceGeneral())fail('只有总管可以分配服务人员');result(s,{items:list('service_provider',and(eq('service_status','ACTIVE','text'),eq('can_reply',true,'boolean')),'id account_id display_name service_kind review_role can_accept_order',200)});
}
if(op==='ASSIGN_SERVICE_CASE'){
 if(!serviceGeneral())fail('只有总管可以分配服务人员');var access=serviceCase(p.appointmentId),a=access.row;if(!p.previousUpdatedAt||p.previousUpdatedAt!==a.updated_at)fail('档案已变化，请刷新');
 // OPTIONAL_GUARDIAN: a 总管 may hand an archive to a 总监 alone; without a 监护专员 nobody gains guardian access.
 var guardian=p.guardianId==null||p.guardianId===''?null:one('service_provider',p.guardianId,'id service_kind service_status can_reply review_role'),director=one('service_provider',p.directorId,'id service_kind service_status can_reply review_role');
 if(guardian&&(guardian.service_status!=='ACTIVE'||!guardian.can_reply||guardian.service_kind==='AGENT'))fail('请选择启用的监护专员');if(director.service_status!=='ACTIVE'||!director.can_reply||director.review_role!=='DIRECTOR')fail('请选择具备总监权限的工作人员');
 var meta={level:text(p.level,'方案等级',20,false),subLevel:text(p.subLevel,'副等级',30,false),danger:text(p.danger,'危险因素',2000,false),memo:text(p.memo,'方案备忘录',4000,false),phase:text(p.phase,'方案阶段',60,false),priority:p.priority===true};if(meta.level&&['A','B','C','D'].indexOf(meta.level)<0)fail('等级无效');
 update('offline_appointment',and(eq('id',a.id),eq('updated_at',p.previousUpdatedAt,'timestamptz')),{guardian_id:guardian?guardian.id:null,director_id:director.id,service_metadata:meta});result(s,{id:a.id});
}
