const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-h5-session';
const {sign, verify, decodeRef, refToken, safeReturn, friendly} = require('../../server/h5');

test('签名会话可验证且篡改后失效',()=>{
  const token=sign({account:{id:'12'},jwt:'token',exp:Math.floor(Date.now()/1000)+30});
  assert.equal(verify(token).account.id,'12');
  assert.equal(verify(token.slice(0,-1)+(token.endsWith('a')?'b':'a')),null);
});

test('推荐链接只接受有效的服务端签名账号',()=>{
  const token=refToken('10001');
  assert.equal(decodeRef(token),'10001');
  assert.equal(decodeRef(sign({kind:'ref',accountId:'0',exp:Math.floor(Date.now()/1000)+30})), '');
  assert.equal(decodeRef('10001'), '');
});

test('OAuth 返回地址只能停留在网页应用内',()=>{
  assert.equal(safeReturn('/web/?ref=x#courses'),'/web/?ref=x#courses');
  assert.equal(safeReturn('https://evil.example/'),'/web/');
  assert.equal(safeReturn('//evil.example/'),'/web/');
});

test('配置错误与课程业务错误可读，技术错误不泄露',()=>{
  assert.equal(friendly(new Error('CONFIG:WECHAT_OA_APP_ID')),'网页微信登录尚未完成公众号参数配置');
  assert.equal(friendly(new Error('ZION:PolyglotException: Error: 本场名额已满')),'本场名额已满');
  assert.equal(friendly(new Error('database password leaked')),'服务暂时不可用，请稍后重试');
});

test('H5 页面不含小程序协议、咨询师或人物图片入口',async()=>{
  const fs=require('node:fs/promises');
  const html=await fs.readFile(require('node:path').join(__dirname,'../../web/index.html'),'utf8');
  assert.match(html,/二阶 · 线上共修/);
  assert.match(html,/微信登录/);
  assert.match(html,/我推荐的学员/);
  assert.doesNotMatch(html,/咨询师|心理专家|open-type=|wx\./);
  assert.doesNotMatch(html,/<img[^>]+(?:专家|老师|人物)/);
});
