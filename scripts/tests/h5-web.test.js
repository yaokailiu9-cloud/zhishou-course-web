const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-h5-session';
const {sign, verify, decodeRef, refToken, safeReturn, friendly, wechatAppId, wechatAppSecret, authenticateWechatAccount, signWechatShareUrl, shareUrlForRequest} = require('../../server/h5');
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

test('旧部署的 SECRET 可兼容作为会话签名密钥',()=>{
  const sessionSecret=process.env.SESSION_SECRET;
  const legacySecret=process.env.SECRET;
  delete process.env.SESSION_SECRET;
  process.env.SECRET='legacy-deployment-secret-that-is-long-enough';
  const token=sign({account:{id:'13'},jwt:'token',exp:Math.floor(Date.now()/1000)+30});
  assert.equal(verify(token).account.id,'13');
  if(sessionSecret===undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET=sessionSecret;
  if(legacySecret===undefined) delete process.env.SECRET; else process.env.SECRET=legacySecret;
});

test('Zeabur 自动 PASSWORD 可作为未显式配置时的会话签名密钥',()=>{
  const sessionSecret=process.env.SESSION_SECRET;
  const legacySecret=process.env.SECRET;
  const platformPassword=process.env.PASSWORD;
  delete process.env.SESSION_SECRET;
  delete process.env.SECRET;
  process.env.PASSWORD='zeabur-service-password-that-is-long-enough';
  const token=sign({account:{id:'14'},jwt:'token',exp:Math.floor(Date.now()/1000)+30});
  assert.equal(verify(token).account.id,'14');
  if(sessionSecret===undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET=sessionSecret;
  if(legacySecret===undefined) delete process.env.SECRET; else process.env.SECRET=legacySecret;
  if(platformPassword===undefined) delete process.env.PASSWORD; else process.env.PASSWORD=platformPassword;
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
  assert.equal(friendly(new Error('ZION:config: wechat authentication web app id does not exist')),'Zion 尚未配置公众号网页应用，请先填写公众号 AppID 和 AppSecret');
  assert.equal(friendly(new Error('ZION:PolyglotException: Error: 本场名额已满')),'本场名额已满');
  assert.equal(friendly(new Error('database password leaked')),'服务暂时不可用，请稍后重试');
});

test('网页授权使用天启无书公众号 AppID，并允许部署环境覆盖',()=>{
  const previous=process.env.WECHAT_OA_APP_ID;
  delete process.env.WECHAT_OA_APP_ID;
  assert.equal(wechatAppId(),'wx6dafecca8d5fd24e');
  process.env.WECHAT_OA_APP_ID='wx-environment-app-id';
  assert.equal(wechatAppId(),'wx-environment-app-id');
  if(previous===undefined) delete process.env.WECHAT_OA_APP_ID; else process.env.WECHAT_OA_APP_ID=previous;
});

test('公众号密钥兼容旧部署的 WECHAT_APP_SECRET 变量名',()=>{
  const officialSecret=process.env.WECHAT_OA_APP_SECRET;
  const legacySecret=process.env.WECHAT_APP_SECRET;
  delete process.env.WECHAT_OA_APP_SECRET;
  process.env.WECHAT_APP_SECRET='legacy-wechat-secret';
  assert.equal(wechatAppSecret(),'legacy-wechat-secret');
  if(officialSecret===undefined) delete process.env.WECHAT_OA_APP_SECRET; else process.env.WECHAT_OA_APP_SECRET=officialSecret;
  if(legacySecret===undefined) delete process.env.WECHAT_APP_SECRET; else process.env.WECHAT_APP_SECRET=legacySecret;
});

test('微信课程卡片签名固定且只接受本站网页地址',()=>{
  const url='https://www.apply.tianqiwushu.cn/web/?ref=x';
  const source='jsapi_ticket=ticket&noncestr=nonce&timestamp=123&url='+url;
  assert.equal(signWechatShareUrl('ticket',url,'nonce',123),require('node:crypto').createHash('sha1').update(source).digest('hex'));
  const req={headers:{host:'www.apply.tianqiwushu.cn','x-forwarded-proto':'https'}};
  assert.equal(shareUrlForRequest(req,url+'#/pages/public-class-detail/public-class-detail?id=7'),url);
  assert.throws(()=>shareUrlForRequest(req,'https://evil.example/web/'),/分享地址无效/);
});

test('微信回调 code 只交给 Zion loginWithWechat 换取业务会话',async t=>{
  const originalFetch=global.fetch;
  const originalSecret=process.env.WECHAT_OA_APP_SECRET;
  delete process.env.WECHAT_OA_APP_SECRET;
  let sent;
  global.fetch=async(url,options)=>{
    sent={url,body:JSON.parse(options.body)};
    return {ok:true,text:async()=>JSON.stringify({data:{loginWithWechat:{account:{id:'88',username:'微信用户甲',profileImageUrl:'https://example.invalid/avatar.png'},jwt:{token:'zion-user-jwt'}}}})};
  };
  t.after(()=>{
    global.fetch=originalFetch;
    if(originalSecret===undefined) delete process.env.WECHAT_OA_APP_SECRET; else process.env.WECHAT_OA_APP_SECRET=originalSecret;
  });
  const login=await authenticateWechatAccount('one-time-wechat-code');
  assert.equal(sent.url,'https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2');
  assert.equal(sent.body.variables.code,'one-time-wechat-code');
  assert.match(sent.body.query,/loginWithWechat/);
  assert.doesNotMatch(sent.body.query,/authenticateWithUsername|appsecret|access_token/i);
  assert.deepEqual(login,{jwt:'zion-user-jwt',account:{id:'88',name:'微信用户甲',avatarUrl:'https://example.invalid/avatar.png'}});
});

test('生产环境用公众号 AppSecret 换取资料并创建或恢复 Zion 账号',async t=>{
  const originalFetch=global.fetch;
  const originalSecret=process.env.WECHAT_OA_APP_SECRET;
  process.env.WECHAT_OA_APP_SECRET='test-only-official-account-secret';
  const calls=[];
  global.fetch=async(url,options={})=>{
    calls.push({url:String(url),body:options.body?JSON.parse(options.body):null,authorization:options.headers&&options.headers.authorization});
    if(String(url).startsWith('https://api.weixin.qq.com/sns/oauth2/access_token')) {
      return {ok:true,text:async()=>JSON.stringify({openid:'openid-001',access_token:'access-token-001'})};
    }
    if(String(url).startsWith('https://api.weixin.qq.com/sns/userinfo')) {
      return {ok:true,text:async()=>JSON.stringify({openid:'openid-001',unionid:'unionid-001',nickname:'微信用户乙',headimgurl:'https://example.invalid/b.png'})};
    }
    if(calls.filter(call=>call.body).length===1) {
      return {ok:true,text:async()=>JSON.stringify({data:{authenticateWithUsername:{account:{id:'99',username:'wxh5_test'},jwt:{token:'zion-profile-jwt'}}}})};
    }
    return {ok:true,text:async()=>JSON.stringify({data:{update_account_by_pk:{id:'99',username:'wxh5_test',wechat_nickname:'微信用户乙',wechat_avatar_url:'https://example.invalid/b.png'}}})};
  };
  t.after(()=>{
    global.fetch=originalFetch;
    if(originalSecret===undefined) delete process.env.WECHAT_OA_APP_SECRET; else process.env.WECHAT_OA_APP_SECRET=originalSecret;
  });
  const login=await authenticateWechatAccount('one-time-wechat-code');
  assert.match(calls[0].url,/appid=wx6dafecca8d5fd24e/);
  assert.match(calls[0].url,/code=one-time-wechat-code/);
  assert.match(calls[2].body.query,/authenticateWithUsername/);
  assert.equal(calls[3].authorization,'Bearer zion-profile-jwt');
  assert.equal(calls[3].body.variables.data.wechat_openid,'openid-001');
  assert.equal(Object.hasOwn(calls[3].body.variables.data,'user_type'),false);
  assert.deepEqual(login,{jwt:'zion-profile-jwt',account:{id:'99',name:'微信用户乙',avatarUrl:'https://example.invalid/b.png'}});
});

test('旧版课程网页及推荐入口已下线',async()=>{
  const fs=require('node:fs/promises');
  const root=require('node:path').join(__dirname,'../..');
  const [runtime,css]=await Promise.all([
    fs.readFile(require('node:path').join(root,'web/replica/runtime.js'),'utf8'),
    fs.readFile(require('node:path').join(root,'web/replica/runtime.css'),'utf8')
  ]);
  await Promise.all([
    fs.access(require('node:path').join(root,'web/legacy/index.html')).then(()=>assert.fail('legacy page should be deleted'),error=>assert.equal(error.code,'ENOENT')),
    fs.access(require('node:path').join(root,'web/app.js')).then(()=>assert.fail('old web script should be deleted'),error=>assert.equal(error.code,'ENOENT')),
    fs.access(require('node:path').join(root,'web/app.css')).then(()=>assert.fail('old web stylesheet should be deleted'),error=>assert.equal(error.code,'ENOENT'))
  ]);
  assert.doesNotMatch(runtime+css,/web\/legacy|web-referrals|我的推荐\s*·\s*专属推荐链接与学员记录/);
});

test('课程管理仍只经后端工作人员操作',async()=>{
  const fs=require('node:fs/promises');
  const root=require('node:path').join(__dirname,'../..');
  const server=await fs.readFile(require('node:path').join(root,'server/h5/index.js'),'utf8');
  assert.match(server,/invoke\(session\.jwt, "STAFF_CLASSES"/);
  assert.match(server,/invoke\(session\.jwt, "COURSE_ROSTER"/);
  assert.match(server,/invoke\(session\.jwt, "SAVE_CLASS"/);
});

test('Zeabur 服务入口可提供健康检查和课程网页', async t => {
  const server=createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const health=await request(server,'/healthz');
  assert.equal(health.status,200);
  assert.deepEqual(JSON.parse(health.body),{
    ok:true,
    service:'zhishou-course-web',
    release:'2026.09.22.2'
  });
  const wechatVerify=await request(server,'/MP_verify_GFzG9U79F1ySzmh4.txt');
  assert.equal(wechatVerify.status,200);
  assert.match(wechatVerify.headers['content-type'],/text\/plain/);
  assert.equal(wechatVerify.body.trim(),'GFzG9U79F1ySzmh4');
  const page=await request(server,'/web/');
  assert.equal(page.status,200);
  assert.match(page.headers['content-type'],/text\/html/);
  assert.match(page.body,/《答案库》系列课程/);
  const login=await request(server,'/api/h5?action=login&return=%2Fweb%2F%23%2Fpages%2Fprofile%2Fprofile');
  assert.equal(login.status,302);
  assert.match(login.headers.location,/open\.weixin\.qq\.com\/connect\/oauth2\/authorize/);
  assert.match(login.headers.location,/appid=wx6dafecca8d5fd24e/);
  assert.match(login.headers.location,/scope=snsapi_userinfo/);
  const legacy=await request(server,'/web/legacy/');
  assert.equal(legacy.status,404);
  assert.equal(legacy.body,'Not Found');
  assert.equal(staticFile('/web/%2e%2e/package.json'),null);
});
