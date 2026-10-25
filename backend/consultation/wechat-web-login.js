// The server exchanges a real one-use code with the new service account's Secret.
// Never accept an OpenID, UnionID, target account, or credentials from the payload.
if(op==='WEBSITE_WECHAT_LOGIN'){
  var webLoginCode=text(p.code,'微信授权码',256,true);
  function webLoginApi(api,args){
    var r;try{r=context.callThirdPartyApi(api,args);if(typeof r==='string')r=JSON.parse(r);}catch(_){fail('新服务号微信登录暂不可用，请稍后重试');}
    if(!r||r.code!==200||!r.data||r.data.errcode)fail('微信授权已失效，请重新登录');
    return r.data;
  }
  var webToken=webLoginApi('rvhgukwrr',{gyhv1hcj0:webLoginCode});
  if(!/^[-\w]{10,128}$/.test(webToken.openid||'')||!webToken.access_token)fail('微信授权已失效，请重新登录');
  var webProfile=webLoginApi('txlbvb2a7',{k2jjan49n:webToken.access_token,bf950ztm7:webToken.openid});
  if(webProfile.openid!==webToken.openid||(webProfile.unionid&&webToken.unionid&&webProfile.unionid!==webToken.unionid))fail('微信授权身份不一致，请重新登录');
  var webUnion=webProfile.unionid||webToken.unionid;
  // Without UnionID we cannot distinguish a new visitor from an existing customer.
  if(!/^[-\w]{10,128}$/.test(webUnion||''))fail('新服务号未返回UnionID，请将新旧服务号绑定到同一微信开放平台后重试');
  var webAccounts=gql('query ResolveWebsiteWechatIdentity($where:account_bool_exp!){accounts:account(where:$where,limit:2){id username wechat_openid}}',{where:and(eq('wechat_unionid',webUnion,'text'),eq('fz_deleted',false,'boolean'))}).accounts||[];
  if(webAccounts.length>1)fail('微信身份关联多个账号，请联系工作人员核对');
  var webExisting=webAccounts[0]||null;
  if(webExisting&&(!/^wxh5_[0-9a-f]{36}$/.test(webExisting.username||'')||!/^[-\w]{10,128}$/.test(webExisting.wechat_openid||'')))fail('原微信账号需要核对，请联系工作人员');
  result(s,{appId:'wx8daa76a8eb887e47',profile:{openid:webProfile.openid,unionid:webUnion,nickname:String(webProfile.nickname||'微信用户').slice(0,80),headimgurl:String(webProfile.headimgurl||'').slice(0,1500)},existingAccount:webExisting?{id:String(webExisting.id),username:webExisting.username,openid:webExisting.wechat_openid}:null});
}
