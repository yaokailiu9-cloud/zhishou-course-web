"""Delete only validated, recorded synthetic business fixtures after integration."""
import json
from consultation_runtime_test import FIX,OUT,gql,admin_token,save
f=json.loads(FIX.read_text()); ids=f['ids']; token=admin_token(); removed=[]; retained=[]
def eq(column,value):return {'_eq':{'bigint_operand':{'left_operand':{'column':column},'right_operand':{'literal':value}}}}
def rows(table,where,fields='id'):
    return gql('query CleanupRows($w:'+table+'_bool_exp!){rows:'+table+'(where:$w){'+fields+'}}',{'w':where},token)['rows']
def delete(table,key):
    assert table in ['consultation_feedback_reply','consultation_feedback','offline_consultation_record','consultation_summary_job','offline_appointment','public_class_enrollment','public_class','account_profile']
    r=gql('mutation CleanupOne($id:bigint!){delete_'+table+'_by_pk(id:$id){id}}',{'id':key},token)
    removed.append({'table':table,'id':key})
for key in ['class','capacity_class']:
    if ids.get(key):
        cs=rows('public_class',eq('id',ids[key]),'id title organizer_id')
        assert not cs or (len(cs)==1 and f['nonce'] in cs[0]['title'] and cs[0]['organizer_id']==ids['teacher'])
aid=ids.get('appointment')
if aid:
    found=rows('offline_appointment',eq('id',aid),'id customer_id provider_id request_key')
    if found:
        a=found[0]
        assert a['customer_id']==f['actors']['customer']['id'] and a['provider_id']==ids['teacher'] and f['nonce'] in a['request_key']
    for fb in rows('consultation_feedback',eq('appointment_id',aid)):
        for reply in rows('consultation_feedback_reply',eq('feedback_id',fb['id'])):delete('consultation_feedback_reply',reply['id'])
        delete('consultation_feedback',fb['id'])
    for table in ['offline_consultation_record','consultation_summary_job']:
        for row in rows(table,eq('appointment_id',aid)):delete(table,row['id'])
    delete('offline_appointment',aid)
for key in ['class','capacity_class']:
    if ids.get(key):
        for e in rows('public_class_enrollment',eq('public_class_id',ids[key]),'id customer_id'):
            assert e['customer_id'] in [a['id'] for a in f['actors'].values()]
            delete('public_class_enrollment',e['id'])
        delete('public_class',ids[key])
if ids.get('profile'):
    actor=f['actors']['otherCustomer']
    a=gql('query CleanupProfileOwner($id:bigint!){account_by_pk(id:$id){id username account_profile_id}}',{'id':actor['id']},token)['account_by_pk']
    assert a['username']==actor['username'] and a['account_profile_id'] in [None,ids['profile']]
    if a['account_profile_id']:
        gql('mutation UnlinkSyntheticProfile($id:bigint!){update_account_by_pk(pk_columns:{id:$id},_set:{account_profile_id:null}){id}}',{'id':actor['id']},token)
    if rows('account_profile',eq('id',ids['profile'])):delete('account_profile',ids['profile'])
# Use the platform conversation operation, never mutate the protected AI tables directly.
for conv in rows('fz_conversation',eq('account_id',f['actors']['teacher']['id']),'id status'):
    assert conv['status']=='COMPLETED'
    # Direct AI permission is deliberately denied, including this maintenance operation.
    retained.append({'table':'AI conversation','id':conv['id'],'reason':'Protected by direct AI permission; synthetic content only'})
(OUT/'business-cleanup.json').write_text(json.dumps({'removed':removed,'retainedConversations':retained,'retainedAssets':{k:v for k,v in ids.items() if k in ['audio_file','capacity_share_image']}},indent=2))
f['ids']={k:v for k,v in ids.items() if k in ['teacher','otherTeacher']};save(f)
print('Removed validated synthetic business rows/conversations:',len(removed))
