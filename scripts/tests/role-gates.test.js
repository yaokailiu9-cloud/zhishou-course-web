const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');

function loadZion(respond = () => ({})) {
  const requests = [];
  const storage = {zionJwt: 'token-A'};
  const wx = {
    getStorageSync: key => storage[key],
    setStorageSync: (key, value) => { storage[key] = value; },
    removeStorageSync: key => { delete storage[key]; },
    request(options) {
      requests.push(options.data);
      options.success({statusCode: 200, data: {data: respond(options.data)}});
    }
  };
  const mod = {exports: {}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'utils/zion.js'), 'utf8'), {
    module: mod, exports: mod.exports, wx, console, Date, Promise, JSON, Math, Number, String, Boolean, Object, Array, Error,
    require: name => name === './auth' ? {isAuthError: () => false, expire() {}} : require(path.join(root, 'utils', name))
  });
  return {zion: mod.exports, requests};
}

const staff = {id: '14', accountId: '19', serviceStatus: 'ACTIVE', serviceKind: 'STAFF', canReply: true, canAcceptOrder: true};

test('只有启用中且具备接单和回复能力的 STAFF 才是管理身份', () => {
  const {zion} = loadZion();
  assert.equal(zion.isManagerProvider(staff), true);
  assert.equal(zion.isManagerProvider({...staff, serviceKind: 'AGENT'}), false, '代理即使带有能力字段也不能成为管理');
  assert.equal(zion.isManagerProvider({...staff, serviceStatus: 'INACTIVE'}), false);
  assert.equal(zion.isManagerProvider({...staff, canAcceptOrder: false}), false);
  assert.equal(zion.isManagerProvider({...staff, canReply: false}), false);
  assert.equal(zion.isManagerProvider(null), false);
});

test('管理会话列表在后端按负责人筛选并按最新消息排序', async () => {
  const {zion, requests} = loadZion(() => ({consultation_session: [], consultation_order: [], account: []}));
  await zion.listManagerSessions({serviceProviderId: '14', managerAccountId: '19'});
  const {query, variables} = requests[0];
  assert.match(query, /consultation_session\(where: \$where, order_by: \{ last_message_at: desc \}/);
  const columns = Array.from(variables.where._or, item => item._eq.bigint_operand.left_operand.column);
  assert.deepEqual(columns, ['service_provider_id', 'manager_account_id']);
  assert.deepEqual(Array.from(variables.where._or, item => item._eq.bigint_operand.right_operand.literal), [14, 19]);
});

test('客户端不再提供写死的经理身份、按 user_type 移交客户或改写业务身份', () => {
  const {zion} = loadZion();
  assert.equal(zion.getDefaultManagerIdentity, undefined);
  assert.equal(zion.transferCustomerServiceBinding, undefined);
  const source = fs.readFileSync(path.join(root, 'utils/zion.js'), 'utf8');
  assert.doesNotMatch(source, /user_type: nextRole/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'pages/chat/chat.js'), 'utf8'), /mockUnlock/);
});

test('我的页、聊天页和工作台都使用同一个管理身份判断，聊天页不信任本地缓存', () => {
  for (const page of ['profile', 'chat', 'manager']) {
    const source = fs.readFileSync(path.join(root, `pages/${page}/${page}.js`), 'utf8');
    assert.match(source, /zion\.isManagerProvider\(provider\)/, page);
  }
  const chat = fs.readFileSync(path.join(root, 'pages/chat/chat.js'), 'utf8');
  assert.doesNotMatch(chat, /storedProviderId/);
});
