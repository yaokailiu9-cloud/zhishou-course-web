# WeChat Login Bridge

这个服务用于本地原生小程序的真实微信登录：

1. 接收前端传来的 `login_code` 和 `phone_code`。
2. 服务端使用微信 `AppSecret` 调微信接口换取 `openid` 和手机号。
3. 服务端使用 Zion GraphQL Admin Token 写入/更新 `account` 表。
4. 返回 `account_id`、`wechat_openid`、`phone_number` 给小程序。

密钥只能放在部署平台的环境变量中，不要写进小程序前端。

## 环境变量

```text
WECHAT_APP_ID=wx35d600312d9c89f3
WECHAT_APP_SECRET=从微信公众平台获取
ZION_GRAPHQL_URL=https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
ZION_ADMIN_TOKEN=从 Zion Connect Backend 复制
```

## 请求

```http
POST /wechat-login
Content-Type: application/json

{
  "login_code": "wx.login 返回的 code",
  "phone_code": "getPhoneNumber 返回的手机号临时 code",
  "nick_name": "微信用户",
  "avatar_url": "",
  "raw_profile_json": {}
}
```

`phone_code` 来自：

```xml
<button open-type="getPhoneNumber" bindgetphonenumber="loginByWechat">
  微信一键登录
</button>
```

它不是 `wx.login` 的 code，有效期约 5 分钟，只能使用一次。后端会用：

```text
POST https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=ACCESS_TOKEN
Body: { "code": phone_code }
```

换取微信返回的 `phone_info`，再写入 Zion `account.fz_phone_number`。

## 响应

```json
{
  "success": true,
  "account_id": 1001,
  "wechat_openid": "openid",
  "phone_number": "13800000000",
  "pure_phone_number": "13800000000",
  "country_code": "86",
  "phone_info": {
    "phoneNumber": "13800000000",
    "purePhoneNumber": "13800000000",
    "countryCode": "86"
  },
  "user": {
    "id": "1001",
    "nickName": "微信用户",
    "avatarUrl": "",
    "openid": "openid",
    "phone": "13800000000",
    "role": "customer"
  }
}
```

## 部署后

把公开 HTTPS 地址填到 `utils/zion.js` 的 `WECHAT_LOGIN_BRIDGE_URL`。

不要把小程序前端指向本地端口。经理入口和正式登录都应使用已落库的 Zion 数据、线上 HTTPS 服务或 Zion 用户事件。

先复制环境变量模板：

```bash
cp server/wechat-login/.env.example server/wechat-login/.env
```

然后填写 `server/wechat-login/.env`：

```text
WECHAT_APP_ID=wx35d600312d9c89f3
WECHAT_APP_SECRET=你的微信 AppSecret
ZION_GRAPHQL_URL=https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
ZION_ADMIN_TOKEN=Zion Admin Bearer Token
```

启动本地桥接服务：

```bash
npm run wechat-login
```

然后在微信开发者工具里：

1. 打开 `详情 → 本地设置`。
2. 勾选 `不校验合法域名、web-view、TLS 版本以及 HTTPS 证书`。
3. 重新编译小程序。
4. 点击“微信一键登录”触发 `getPhoneNumber`。

这只能用于开发者工具本地测试。正式发布必须部署成 HTTPS，并把域名加入微信公众平台合法域名。
