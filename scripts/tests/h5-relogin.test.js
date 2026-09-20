const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
process.env.SESSION_SECRET = 'isolated-relogin-test-session-secret';
const {authenticateWechatAccount, sign} = require('../../server/h5');
const {createServer} = require('../../index');

function mockBackend(t, options = {}) {
  const originalFetch = global.fetch, originalSecret = process.env.WECHAT_OA_APP_SECRET;
  process.env.WECHAT_OA_APP_SECRET = 'test-only-wechat-secret';
  let accountExists = false;
  const attempts = [], codes = [];
  const response = value => ({ok:true, text:async () => JSON.stringify(value)});
  const failure = classification => response({errors:[{message:classification, extensions:{classification}}]});
  global.fetch = async (url, init = {}) => {
    if (String(url).includes('/sns/oauth2/access_token')) {
      const code = new URL(url).searchParams.get('code');
      assert.ok(!codes.includes(code), 'each OAuth callback uses a fresh code');
      codes.push(code);
      return response({openid:'same-wechat-user', access_token:'test-access-token'});
    }
    if (String(url).includes('/sns/userinfo')) return response({openid:'same-wechat-user', nickname:'测试用户'});
    const {query, variables} = JSON.parse(init.body);
    if (query.includes('authenticateWithUsername')) {
      attempts.push(variables.register);
      if (options.error) return failure(options.error);
      if (variables.register) {
        if (accountExists || options.race) {
          accountExists = true;
          return failure('USERNAME_ALREADY_EXISTS');
        }
        accountExists = true;
      } else if (!accountExists) return failure('ACCOUNT_DOES_NOT_EXIST');
      return response({data:{authenticateWithUsername:{account:{id:'101'}, jwt:{token:'private-user-jwt'}}}});
    }
    assert.match(query, /UpdateH5WechatProfile/);
    assert.equal(init.headers.authorization, 'Bearer private-user-jwt');
    return response({data:{update_account_by_pk:{id:'101', wechat_nickname:'测试用户'}}});
  };
  t.after(() => {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.WECHAT_OA_APP_SECRET;
    else process.env.WECHAT_OA_APP_SECRET = originalSecret;
  });
  return {attempts};
}

function request(server, path, {method = 'GET', cookie = ''} = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({host:'127.0.0.1', port:server.address().port, path, method,
      headers:{cookie, 'content-type':'application/json'}}, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({status:res.statusCode, headers:res.headers, body}));
    });
    req.on('error', reject);
    req.end(method === 'POST' ? '{}' : undefined);
  });
}

test('首次登录 → 退出 → 再次微信授权恢复同一账号，JWT 仍只在 HttpOnly 会话中', async t => {
  const backend = mockBackend(t);
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const returnTo = '/web/#/pages/profile/profile';
  const state = sign({kind:'oauth', returnTo, exp:Math.floor(Date.now()/1000)+60});
  async function login(code) {
    const result = await request(server, '/api/wechat-oauth-callback?' + new URLSearchParams({state, code}));
    assert.equal(result.status, 302);
    assert.equal(result.headers.location, '/web/#/pages/index/index');
    assert.match(result.headers['set-cookie'][0], /HttpOnly/);
    const cookie = result.headers['set-cookie'][0].split(';')[0];
    const session = await request(server, '/api/h5?action=session', {cookie});
    assert.equal(JSON.parse(session.body).data.user.id, '101');
    assert.ok(!session.body.includes('private-user-jwt'));
    return cookie;
  }
  const cookie = await login('first-code');
  const logout = await request(server, '/api/h5?action=logout', {method:'POST', cookie});
  assert.equal(logout.status, 200);
  assert.match(logout.headers['set-cookie'][0], /Max-Age=0/);
  const loggedOut = await request(server, '/api/h5?action=session');
  assert.equal(JSON.parse(loggedOut.body).data.loggedIn, false);
  await login('second-code');
  assert.deepEqual(backend.attempts, [false, true, false]);
});

test('同一微信账号并发首次注册冲突后恢复已有账号', async t => {
  const backend = mockBackend(t, {race:true});
  const login = await authenticateWechatAccount('race-code');
  assert.equal(login.account.id, '101');
  assert.deepEqual(backend.attempts, [false, true, false]);
});

test('密码或服务错误不能被当作账号不存在而触发注册', async t => {
  for (const error of ['BAD_CREDENTIALS', 'INTERNAL_ERROR']) {
    await t.test(error, async t => {
      const backend = mockBackend(t, {error});
      await assert.rejects(authenticateWechatAccount('error-code'), {classification:error});
      assert.deepEqual(backend.attempts, [false]);
    });
  }
});
