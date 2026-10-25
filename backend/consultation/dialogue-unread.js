// DIALOGUE_UNREAD_START
// New plan-feedback messages for the current reader: the other side's messages after
// this reader's read mark or the reader's own latest message. Other staff never advance it.
function dialogueUnread(apps) {
  var out={},ids=[],byId={};
  (apps||[]).forEach(function(a){if(a&&a.id&&a.customer_id&&!byId[a.id]&&(!a.status||["PENDING","CONFIRMED","COMPLETED","孩子档案"].indexOf(a.status)>=0)){byId[a.id]=a;ids.push(id(a.id));out[a.id]={unread:0,mark:0};}});
  if(!ids.length||!s.actor.accountId)return out;
  var scope={_or:ids.map(function(v){return eq("appointment_id",v);})};
  var marks=gql("query DialogueReadMarks($where:consultation_dialogue_read_bool_exp!){rows: consultation_dialogue_read(where:$where,limit:501){appointment_id last_read_id}}",{where:and(eq("reader_id",s.actor.accountId),scope)}).rows||[];
  marks.forEach(function(r){var o=out[r.appointment_id];if(o)o.mark=Math.max(o.mark,Number(r.last_read_id)||0);});
  var rows=gql("query DialogueUnreadRows($where:consultation_feedback_bool_exp!){rows: consultation_feedback(where:$where,order_by:{id:desc},limit:501){id appointment_id author_id}}",{where:and(eq("advice_key","__consultation_dialogue__","text"),scope)}).rows||[];
  function ownSide(row){var a=byId[row.appointment_id],readerIsCustomer=String(a.customer_id)===String(s.actor.accountId);return (String(row.author_id)===String(a.customer_id))===readerIsCustomer;}
  rows.forEach(function(row){var o=out[row.appointment_id];if(o&&String(row.author_id)===String(s.actor.accountId))o.mark=Math.max(o.mark,Number(row.id));});
  rows.forEach(function(row){var o=out[row.appointment_id];if(o&&!ownSide(row)&&Number(row.id)>o.mark)o.unread++;});
  return out;
}
function withDialogueUnread(items) {
  var counts=dialogueUnread(items);
  return (items||[]).map(function(a){var c=counts[a.id];return Object.assign({},a,{dialogue_unread:c?c.unread:0});});
}
function markDialogueRead(a,lastId) {
  lastId=Number(lastId)||0;if(!lastId||!s.actor.accountId)return;
  var where=and(eq("reader_id",s.actor.accountId),eq("appointment_id",a.id));
  var row=(gql("query DialogueReadMark($where:consultation_dialogue_read_bool_exp!){rows: consultation_dialogue_read(where:$where,limit:1){id last_read_id}}",{where:where}).rows||[])[0];
  if(!row)gql("mutation DialogueReadInsert($object:consultation_dialogue_read_insert_input!){saved: insert_consultation_dialogue_read(objects:[$object],on_conflict:{constraint:consultation_dialogue_read_reader_appointment,update_columns:[]}){affected_rows}}",{object:{reader_id:s.actor.accountId,appointment_id:a.id,last_read_id:lastId}});
  else if(Number(row.last_read_id)<lastId)gql("mutation DialogueReadUpdate($where:consultation_dialogue_read_bool_exp!,$object:consultation_dialogue_read_set_input!){saved: update_consultation_dialogue_read(where:$where,_set:$object){affected_rows}}",{where:and(eq("id",row.id),compare("_lt","last_read_id",lastId)),object:{last_read_id:lastId}});
}
// DIALOGUE_UNREAD_END
