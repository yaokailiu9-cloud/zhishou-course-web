const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const source = ['common', 'authorize'].map(n => fs.readFileSync(path.join(root, 'backend/consultation', n + '.js'), 'utf8')).join('\n');
function check(accountId, matches, payload = {name:'合成用户名'}) {
  let output, query;
  vm.runInNewContext(source, {context:{
    getArg:key => ({account_id:accountId, operation:'CHECK_USERNAME', payload})[key],
    setReturn:(_, value) => output = JSON.parse(JSON.stringify(value)),
    runGql:(name, text, variables, options) => {
      assert.equal(options.role, 'admin');
      if(name === 'ServiceRows') return {rows:[]};
      assert.equal(name, 'CheckServiceUsername');
      query = JSON.parse(JSON.stringify(variables));
      return {matches};
    }
  }});
  return {output, query};
}
test('用户名校验拒绝游客，且只返回布尔结果', () => {
  assert.throws(() => check(null, []), /登录/);
  assert.deepEqual(check(201, [{id:202}]).output.result, {ok:true, data:{available:false}});
  assert.deepEqual(check(201, []).output.result, {ok:true, data:{available:true}});
});
test('用户名校验只能排除当前账号，兼容关联资料历史名称', () => {
  const {query} = check(201, [], {name:'旧名称', excludeAccountId:202});
  assert.equal(query.where._and[0]._not._eq.bigint_operand.right_operand.literal, 201);
  assert.equal(query.where._and[1]._or[1].account_profile._eq.text_operand.right_operand.literal, '旧名称');
  assert.throws(() => check(201, undefined), /校验失败/);
});
function frontend(response) {
  const calls = [], exports = {exports:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'utils/zion.js'), 'utf8'), {
    module:exports, require:n=>n.endsWith("/auth")?{isAuthError:()=>false,expire:()=>{}}:{}, wx:{getStorageSync:key=>key==='zionJwt'?'synthetic-token':'', request:args=>{
      calls.push(args.data); args.success({statusCode:200,data:response});
    }}
  });
  return {api:exports.exports, calls};
}
test('客户端查重不读取他人账号，后端失败不会显示用户名已被占用', async () => {
  const f = frontend({data:{fz_invoke_action_flow:{ok:true,data:{available:false}}}});
  assert.equal(await f.api.isUsernameAvailable('占用名称', 999), false);
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls[0].variables.args)), {operation:'CHECK_USERNAME',payload:{name:'占用名称'}});
  const broken = frontend({data:{fz_invoke_action_flow:null}});
  await assert.rejects(broken.api.isUsernameAvailable('名称'), /暂不可用/);
});
