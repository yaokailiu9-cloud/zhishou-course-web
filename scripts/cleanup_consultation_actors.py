"""Remove only tracked synthetic actors before business integration has started."""
import json
from consultation_runtime_test import FIX, OUT, admin_token, gql, save

f = json.loads(FIX.read_text())
if any(key not in ('teacher', 'otherTeacher') for key in f['ids']):
    raise RuntimeError('Business fixtures exist; clean dependent records first')
token = admin_token()
removed = []
retained = []
for role, actor in list(f['actors'].items()):
    expected = 'consulttest_' + f['nonce'] + '_' + role.lower()
    if actor['username'] != expected:
        raise RuntimeError('Fixture name does not match the recorded nonce')
    account = gql('query CleanupAccount($id:bigint!){account_by_pk(id:$id){id username}}',
                  {'id': actor['id']}, token)['account_by_pk']
    if account and account['username'] != expected:
        raise RuntimeError('Live account identity does not match the fixture')
    provider_id = f['ids'].get(role)
    if provider_id:
        provider = gql('query CleanupProvider($id:bigint!){service_provider_by_pk(id:$id){id account_id}}',
                       {'id': provider_id}, token)['service_provider_by_pk']
        if provider and str(provider['account_id']) != str(actor['id']):
            raise RuntimeError('Provider belongs to a different account')
        if provider:
            gql('mutation CleanupProvider($id:bigint!){delete_service_provider_by_pk(id:$id){id}}',
                {'id': provider_id}, token)
            removed.append({'table': 'service_provider', 'id': provider_id})
        del f['ids'][role]
        save(f)
    if account:
        try:
            gql('mutation CleanupAccount($id:bigint!){delete_account_by_pk(id:$id){id}}',
                {'id': actor['id']}, token)
        except RuntimeError as error:
            if 'fz_account_credentials_account_id_fkey' not in str(error):
                raise
            retained.append({'id': actor['id'], 'reason': 'Built-in credential foreign key'})
            continue
        removed.append({'table': 'account', 'id': actor['id']})
    del f['actors'][role]
    save(f)
(OUT/'actor-cleanup.json').write_text(json.dumps({'removed': removed, 'retained': retained}, indent=2))
print('Removed tracked synthetic records:', len(removed))
print('Synthetic accounts retained due to built-in credentials:', len(retained))
