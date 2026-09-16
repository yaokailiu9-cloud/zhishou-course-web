const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-h5-session';
const {sign, verify, decodeRef, refToken, safeReturn, friendly} = require('../../server/h5');
const {createServer, staticFile} = require('../../index');

function request(server, pathname) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = require('node:http').request({host:'127.0.0.1',port:address.port,path:pathname}, res => {
      const chunks=[];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });
    req.on('error', reject);
    req.end();
  });
}

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

test('免费公开课程支持直接报名，底部导航有可识别的当前状态',async()=>{
  const fs=require('node:fs/promises');
  const root=require('node:path').join(__dirname,'../..');
  const [html,js,css]=await Promise.all([
    fs.readFile(require('node:path').join(root,'web/index.html'),'utf8'),
    fs.readFile(require('node:path').join(root,'web/app.js'),'utf8'),
    fs.readFile(require('node:path').join(root,'web/app.css'),'utf8')
  ]);
  assert.match(html,/免费公开课/);
  assert.match(html,/确认免费报名/);
  assert.match(html,/aria-current="page"/);
  assert.match(html,/class="nav-icon"/);
  assert.match(js,/微信登录并免费报名/);
  assert.match(js,/免费报名已提交/);
  assert.match(css,/safe-area-inset-bottom/);
  assert.match(css,/min-height:52px/);
});

test('Zeabur 服务入口可提供健康检查和课程网页', async t => {
  const server=createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const health=await request(server,'/healthz');
  assert.equal(health.status,200);
  assert.deepEqual(JSON.parse(health.body),{ok:true,service:'zhishou-course-web'});
  const page=await request(server,'/web/');
  assert.equal(page.status,200);
  assert.match(page.headers['content-type'],/text\/html/);
  assert.match(page.body,/二阶 · 线上共修/);
  assert.equal(staticFile('/web/%2e%2e/package.json'),null);
});
