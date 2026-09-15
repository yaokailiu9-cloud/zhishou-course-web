const cloud = require("wx-server-sdk");
const https = require("https");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const DEFAULT_ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";

async function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = options.body || "";
    const request = https.request({
      hostname: parsedUrl.hostname,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body),
        ...(options.headers || {})
      }
    }, (response) => {
      let text = "";
      response.on("data", (chunk) => {
        text += chunk;
      });
      response.on("end", () => {
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (error) {
          reject(new Error(`Invalid JSON response from ${url}: ${text.slice(0, 200)}`));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode} from ${url}: ${JSON.stringify(data)}`));
          return;
        }
        resolve(data);
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
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
  const token = process.env.ZION_ADMIN_TOKEN || "";
  const data = await requestJson(url, {
    method: "POST",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, variables })
  });
  if (data.errors && data.errors.length) {
    throw new Error(`Zion GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

async function getPhoneNumberByCloudOpenapi(phoneCode) {
  if (!phoneCode) {
    throw new Error("Missing phone_code from getPhoneNumber");
  }
  const result = await cloud.openapi.phonenumber.getPhoneNumber({
    code: phoneCode
  });
  const phoneInfo = result.phoneInfo || result.phone_info || {};
  const phoneNumber = phoneInfo.phoneNumber || phoneInfo.purePhoneNumber || "";
  if (!phoneNumber) {
    throw new Error(`WeChat did not return phone number: ${JSON.stringify(result)}`);
  }
  return phoneNumber;
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

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    if (!openid) {
      throw new Error("Cloud function did not receive OPENID");
    }

    const phoneNumber = await getPhoneNumberByCloudOpenapi(event.phone_code || event.phoneCode || "");
    const account = await upsertZionAccount({
      openid,
      unionid: wxContext.UNIONID || "",
      phoneNumber,
      nickName: event.nick_name || event.nickName || "微信用户",
      avatarUrl: event.avatar_url || event.avatarUrl || "",
      rawProfile: event.raw_profile_json || event.rawProfileJson || event
    });

    return {
      success: true,
      account_id: account.id,
      wechat_openid: account.wechat_openid || openid,
      phone_number: account.fz_phone_number || phoneNumber,
      user: {
        id: String(account.id),
        nickName: account.wechat_nickname || event.nick_name || "微信用户",
        avatarUrl: account.wechat_avatar_url || event.avatar_url || "",
        openid: account.wechat_openid || openid,
        phone: account.fz_phone_number || phoneNumber,
        role: "customer"
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Wechat cloud login failed"
    };
  }
};
