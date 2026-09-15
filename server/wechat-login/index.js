const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";
let accessTokenCache = {
  token: "",
  expiresAt: 0
};

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) return;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  });
}

function readJsonRequest(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}: ${JSON.stringify(data)}`);
  }
  return data;
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function zionGraphql(query, variables = {}) {
  const url = process.env.ZION_GRAPHQL_URL || DEFAULT_ZION_GRAPHQL_URL;
  const token = getRequiredEnv("ZION_ADMIN_TOKEN");
  const data = await requestJson(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });
  if (data.errors && data.errors.length) {
    throw new Error(`Zion GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

async function wechatCodeToSession(loginCode) {
  const appid = getRequiredEnv("WECHAT_APP_ID");
  const secret = getRequiredEnv("WECHAT_APP_SECRET");
  const url = "https://api.weixin.qq.com/sns/jscode2session"
    + `?appid=${encodeURIComponent(appid)}`
    + `&secret=${encodeURIComponent(secret)}`
    + `&js_code=${encodeURIComponent(loginCode)}`
    + "&grant_type=authorization_code";
  const data = await requestJson(url);
  if (data.errcode) {
    throw new Error(`jscode2session failed: ${data.errcode} ${data.errmsg || ""}`);
  }
  if (!data.openid) {
    throw new Error("jscode2session did not return openid");
  }
  return data;
}

async function getWechatAccessToken() {
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now() + 60 * 1000) {
    return accessTokenCache.token;
  }

  const appid = getRequiredEnv("WECHAT_APP_ID");
  const secret = getRequiredEnv("WECHAT_APP_SECRET");
  const url = "https://api.weixin.qq.com/cgi-bin/token"
    + "?grant_type=client_credential"
    + `&appid=${encodeURIComponent(appid)}`
    + `&secret=${encodeURIComponent(secret)}`;
  const data = await requestJson(url);
  if (data.errcode) {
    throw new Error(`access_token failed: ${data.errcode} ${data.errmsg || ""}`);
  }
  if (!data.access_token) {
    throw new Error("access_token response did not include access_token");
  }
  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 7200) * 1000
  };
  return data.access_token;
}

async function getPhoneNumber(phoneCode) {
  if (!phoneCode) {
    throw new Error("Missing phone_code from getPhoneNumber");
  }

  const accessToken = await getWechatAccessToken();
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${encodeURIComponent(accessToken)}`;
  const data = await requestJson(url, {
    method: "POST",
    body: JSON.stringify({ code: phoneCode })
  });
  if (data.errcode) {
    throw new Error(`getPhoneNumber failed: ${data.errcode} ${data.errmsg || ""}`);
  }
  if (!data.phone_info || (!data.phone_info.phoneNumber && !data.phone_info.purePhoneNumber)) {
    throw new Error(`getPhoneNumber response did not include phone_info: ${JSON.stringify(data)}`);
  }
  return data.phone_info;
}

async function findAccountByOpenid(openid) {
  const query = `
    query FindAccountByOpenid($openid: String!) {
      account(where: {
        _eq: {
          text_operand: {
            left_operand: { column: wechat_openid },
            right_operand: { literal: $openid }
          }
        }
      }, limit: 1) {
        id
      }
    }
  `;
  const data = await zionGraphql(query, { openid });
  return data.account && data.account[0] ? data.account[0] : null;
}

async function upsertZionAccount({ openid, unionid, phoneNumber, nickName, avatarUrl, rawProfile }) {
  const now = new Date().toISOString();
  const existing = await findAccountByOpenid(openid);
  const set = {
    updated_at: now,
    oauth2_user_info_map: {
      wechat: {
        openid,
        unionid: unionid || "",
        rawProfile: rawProfile || {}
      }
    },
    fz_deleted: false,
    fz_phone_number: phoneNumber || "",
    fz_email: "",
    wechat_nickname: nickName || "微信用户",
    wechat_avatar_url: avatarUrl || "",
    wechat_openid: openid,
    wechat_unionid: unionid || "",
    user_type: "customer",
    last_login_at: now
  };

  if (existing && existing.id) {
    const query = `
      mutation UpdateAccount($id: bigint!, $data: account_set_input!) {
        update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
          id
          wechat_nickname
          wechat_avatar_url
          wechat_openid
          fz_phone_number
        }
      }
    `;
    const data = await zionGraphql(query, { id: existing.id, data: set });
    return data.update_account_by_pk;
  }

  const query = `
    mutation InsertAccount($object: account_insert_input!) {
      insert_account_one(object: $object) {
        id
        wechat_nickname
        wechat_avatar_url
        wechat_openid
        fz_phone_number
      }
    }
  `;
  const data = await zionGraphql(query, { object: set });
  return data.insert_account_one;
}

async function handleLogin(payload) {
  const loginCode = payload.login_code || payload.loginCode || "";
  const phoneCode = payload.phone_code || payload.phoneCode || "";
  if (!loginCode) {
    throw new Error("Missing login_code");
  }

  const session = await wechatCodeToSession(loginCode);
  const phoneInfo = await getPhoneNumber(phoneCode);
  const phoneNumber = phoneInfo.phoneNumber || phoneInfo.purePhoneNumber || "";
  const account = await upsertZionAccount({
    openid: session.openid,
    unionid: session.unionid || "",
    phoneNumber,
    nickName: payload.nick_name || payload.nickName || "微信用户",
    avatarUrl: payload.avatar_url || payload.avatarUrl || "",
    rawProfile: payload.raw_profile_json || payload.rawProfileJson || payload
  });

  return {
    success: true,
    account_id: account.id,
    wechat_openid: account.wechat_openid || session.openid,
    phone_number: account.fz_phone_number || phoneNumber,
    pure_phone_number: phoneInfo.purePhoneNumber || phoneNumber,
    country_code: phoneInfo.countryCode || "",
    phone_info: phoneInfo,
    user: {
      id: String(account.id),
      nickName: account.wechat_nickname || payload.nick_name || "微信用户",
      avatarUrl: account.wechat_avatar_url || payload.avatar_url || "",
      openid: account.wechat_openid || session.openid,
      phone: account.fz_phone_number || phoneNumber,
      role: "customer"
    }
  };
}

async function nodeHandler(req, res) {
  try {
    if (req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "wechat-login" }));
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405, { "content-type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Method not allowed" }));
      return;
    }
    const payload = await readJsonRequest(req);
    const result = await handleLogin(payload);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: error.message || "Wechat login failed"
    }));
  }
}

function startServer() {
  const port = Number(process.env.PORT || 8787);
  http.createServer(nodeHandler).listen(port, () => {
    console.log(`wechat-login bridge listening on ${port}`);
  });
}

module.exports = {
  handleLogin,
  nodeHandler
};

if (require.main === module) {
  loadLocalEnv();
  startServer();
}
