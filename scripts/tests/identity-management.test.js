const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '../..');
const code = fs.readFileSync(path.join(root, 'backend/consultation/common.js'), 'utf8')
  + '\n'
  + fs.readFileSync(path.join(root, 'backend/consultation/authorize.js'), 'utf8');

function fixture() {
  return {
    accounts: [
      { id: 101, username: 'manager', wechat_nickname: '管理甲', service_provider: { id: 1, service_kind: 'STAFF', service_status: 'ACTIVE', can_reply: true, can_accept_order: true } },
      { id: 102, username: 'agent', wechat_nickname: '代理乙', service_provider: { id: 2, service_kind: 'AGENT', service_status: 'ACTIVE', can_reply: false, can_accept_order: false } },
      { id: 201, username: 'customer', wechat_nickname: '用户丙', account_profile: { user_name: '用户丙' }, service_provider: null },
      { id: 202, username: 'old-staff', wechat_nickname: '用户丁', service_provider: { id: 3, service_kind: 'STAFF', service_status: 'INACTIVE', can_reply: false, can_accept_order: false } }
    ],
    logs: []
  };
}

function run(db, actorId, operation, payload = {}) {
  let output;
  const actor = db.accounts.find((item) => item.id === actorId);
  const runGql = (name, _query, variables, options) => {
    assert.equal(options.role, 'admin');
    if (name === 'ServiceRows') {
      return { data: { rows: actor && actor.service_provider && actor.service_provider.service_status === 'ACTIVE' ? [actor.service_provider] : [] } };
    }
    if (name === 'ListAccountIdentities') return { accounts: db.accounts };
    if (name === 'IdentityTarget') return { account_by_pk: db.accounts.find((item) => item.id === variables.id) || null };
    if (name === 'ChangeExistingIdentity' || name === 'CreateIdentity') {
      const target = db.accounts.find((item) => item.id === variables.accountId);
      Object.assign(target, variables.accountData);
      if (name === 'CreateIdentity') target.service_provider = { id: 10 + db.logs.length, ...variables.providerData };
      else Object.assign(target.service_provider, variables.providerData);
      db.logs.push({ id: db.logs.length + 1, ...variables.log });
      return { account: { id: target.id }, provider: { id: target.service_provider.id }, audit: { id: db.logs.length, created_at: new Date().toISOString() } };
    }
    throw new Error(`Unexpected operation ${name}`);
  };
  vm.runInNewContext(code, {
    context: {
      getArg: (key) => ({ account_id: actorId, operation, payload })[key],
      setReturn: (_key, value) => { output = JSON.parse(JSON.stringify(value)); },
      runGql
    },
    Date, JSON, Number, String, Array, Object, Set, Error
  });
  return output;
}

test('只有启用且具备完整能力的 STAFF 管理可以读取身份列表', () => {
  for (const actorId of [102, 201]) {
    assert.throws(() => run(fixture(), actorId, 'LIST_ACCOUNT_IDENTITIES'), /只有管理人员/);
  }
  const result = run(fixture(), 101, 'LIST_ACCOUNT_IDENTITIES').result.data;
  assert.deepEqual(result.items.map((item) => item.identity), ['MANAGER', 'AGENT', 'USER', 'USER']);
  assert.equal(result.items[0].isSelf, true);
});

test('管理可以把已有服务人员改为代理并写入审计记录', () => {
  const db = fixture();
  const result = run(db, 101, 'SET_ACCOUNT_IDENTITY', { targetAccountId: 202, identity: 'AGENT', note: '调整分工' }).result.data;
  const target = db.accounts.find((item) => item.id === 202);
  assert.equal(result.identity, 'AGENT');
  assert.equal(target.user_type, 'agent');
  assert.equal(target.service_provider.service_kind, 'AGENT');
  assert.equal(target.service_provider.service_status, 'ACTIVE');
  assert.equal(target.service_provider.can_reply, false);
  assert.deepEqual(db.logs[0], {
    id: 1,
    old_identity: 'USER',
    new_identity: 'AGENT',
    change_note: '调整分工',
    operator_account_id: 101,
    target_account_id: 202
  });
});

test('管理可以为普通用户创建管理身份，但不能修改自己的身份', () => {
  const db = fixture();
  run(db, 101, 'SET_ACCOUNT_IDENTITY', { targetAccountId: 201, identity: 'MANAGER' });
  const target = db.accounts.find((item) => item.id === 201);
  assert.equal(target.user_type, 'manager');
  assert.equal(target.service_provider.service_kind, 'STAFF');
  assert.equal(target.service_provider.can_reply, true);
  assert.equal(target.service_provider.can_accept_order, true);
  assert.throws(() => run(db, 101, 'SET_ACCOUNT_IDENTITY', { targetAccountId: 101, identity: 'USER' }), /不能在此处修改自己/);
});
