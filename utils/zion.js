const PROJECT_ID = "JmAxbl1MMe4";
const WECHAT_APP_ID = "wx35d600312d9c89f3";
const ZION_WEB_URL = "https://zion.functorz.com/tool/JmAxbl1MMe4/WECHAT";
const ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";
const WECHAT_LOGIN_CLOUD_FUNCTION = "wechatLogin";
const WECHAT_LOGIN_BRIDGE_URL = "";
const WECHAT_LOGIN_ACTION_FLOW_ID = "4e0d236b-9a2c-4510-9c73-8cdade71e9e3";
const WECHAT_LOGIN_ACTION_FLOW_VERSION = 1;
const CHAT_SESSION_STORAGE_KEY = "consultationSessionId";
const APP_VERSION = "1";
const DEFAULT_MANAGER_ACCOUNT_ID = "1000000000000010";
const DEFAULT_MANAGER_SERVICE_PROVIDER_ID = "1";
const ACCOUNT_PROFILE_KEY = "account_profile";
const LEGACY_ACCOUNT_PROFILE_KEY = "serenity_profile";
const DEFAULT_MANAGER_IDENTITY = {
  user: {
    id: DEFAULT_MANAGER_ACCOUNT_ID,
    nickName: "刘曜恺",
    avatarUrl: "",
    role: "manager",
    phone: "",
    username: "刘曜恺"
  },
  serviceProvider: {
    id: DEFAULT_MANAGER_SERVICE_PROVIDER_ID,
    accountId: DEFAULT_MANAGER_ACCOUNT_ID,
    displayName: "刘曜恺",
    title: "情感咨询经理",
    avatarUrl: "https://api.dicebear.com/7.x/thumbs/png?seed=manager-linjing",
    bio: "",
    specialties: [],
    serviceStatus: "ACTIVE",
    verified: true,
    canReply: true,
    canAcceptOrder: true,
    onlineStatus: "online",
    rating: "4.9",
    pricePerHour: 200,
    serviceMinutes: 60,
    todayWaitingCount: 0,
    activeSessionCount: 0,
    todayIncome: 0,
    totalIncome: 12800
  }
};

function cloneDefaultManagerIdentity() {
  return JSON.parse(JSON.stringify(DEFAULT_MANAGER_IDENTITY));
}

function isDefaultManagerAccount(accountId) {
  return String(accountId || "") === DEFAULT_MANAGER_ACCOUNT_ID;
}

function makeClientMessageId() {
  return `miniapp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

const MANAGER_RECALL_WINDOW_MS = 60 * 1000;

const CONSULTATION_MESSAGE_FIELDS = `
        id
        session_id
        sender_account_id
        sender_role
        content
        content_type
        sent_at
        is_recalled
        recalled_at
        recalled_by_account_id
        recalled_content
        visible_to_customer
        replaces_message_id
        replaced_by_message_id
`;

function isSchemaCompatibilityError(error) {
  return /field|column|validation|unknown|not found|does not exist|unexpected/i.test(String(error && error.message || error));
}

function getGraphQLOperationName(query) {
  const match = String(query || "").match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match ? match[1] : "AnonymousOperation";
}

function toDatabaseId(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  if (!/^\d+$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function graphql(query, variables = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const operationName = getGraphQLOperationName(query);
    const token = options.auth === false ? "" : wx.getStorageSync("zionJwt");
    const header = {
      "content-type": "application/json"
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    wx.request({
      url: ZION_GRAPHQL_URL,
      method: "POST",
      data: { query, variables },
      header,
      success(res) {
        if(token && wx.getStorageSync("zionJwt")!==token){reject(new Error("登录身份已变化，请重试"));return;}
        const auth = require("./auth");
        if(auth.isAuthError(res.statusCode,JSON.stringify(res.data && res.data.errors || '')))auth.expire(token);
        if (res.statusCode >= 200 && res.statusCode < 300 && !res.data.errors) {
          resolve(res.data);
          return;
        }
        const detail = res.data && res.data.errors
          ? JSON.stringify(res.data.errors)
          : JSON.stringify(res.data || {});
        reject(new Error(`Zion GraphQL request failed: ${res.statusCode} [${operationName}] ${detail}`));
      },
      fail(error) {
        reject(new Error(`Zion GraphQL network failed [${operationName}]: ${error && error.errMsg ? error.errMsg : "unknown error"}`));
      }
    });
  });
}

const IMAGE_SUFFIX_MAP = {
  jpg: "JPG",
  jpeg: "JPEG",
  png: "PNG",
  gif: "GIF",
  webp: "WEBP"
};

function readFileAsArrayBuffer(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

function putBinary(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: "PUT",
      data,
      header: headers,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
          return;
        }
        reject(new Error(`image upload failed: ${res.statusCode}`));
      },
      fail: reject
    });
  });
}

/**
 * 把本地图片文件上传到 Zion 图片资产库。
 * 返回 { imageId, url }：imageId 用于写入 *_image_id 字段（持久），
 * url 是当次的签名地址（会过期，仅作即时展示，不要落库为文本）。
 */
function uploadImage(filePath) {
  const { md5Base64 } = require("./md5");
  const extMatch = String(filePath || "").match(/\.(\w+)$/);
  const suffix = IMAGE_SUFFIX_MAP[extMatch ? extMatch[1].toLowerCase() : ""] || "JPEG";

  const presignQuery = `
    mutation GetImageUploadUrl($md5: String!, $suffix: MediaFormat!, $acl: CannedAccessControlList) {
      imagePresignedUrl(imgMd5Base64: $md5, imageSuffix: $suffix, acl: $acl) {
        imageId
        uploadUrl
        uploadHeaders
      }
    }
  `;
  const urlQuery = `
    query GetImageById($id: bigint) {
      getImageById(imageId: $id) {
        id
        url
      }
    }
  `;

  return readFileAsArrayBuffer(filePath).then((buffer) => {
    const md5 = md5Base64(buffer);
    return graphql(presignQuery, { md5, suffix, acl: "PUBLIC_READ" }).then((res) => {
      const info = res.data.imagePresignedUrl || {};
      if (!info.uploadUrl || !info.imageId) {
        throw new Error("presigned upload url missing");
      }
      let headers = info.uploadHeaders || {};
      if (typeof headers === "string") {
        try {
          headers = JSON.parse(headers);
        } catch (error) {
          headers = {};
        }
      }
      return putBinary(info.uploadUrl, buffer, headers).then(() => info.imageId);
    });
  }).then((imageId) => graphql(urlQuery, { id: imageId }).then((res) => ({
    imageId,
    url: (res.data.getImageById && res.data.getImageById.url) || ""
  })));
}

function requestWechatLoginActionFlow(args, loginPayload) {
  const query = `
    mutation InvokeWechatLoginAction($args: Json!) {
      fz_invoke_action_flow(
        actionFlowId: "${WECHAT_LOGIN_ACTION_FLOW_ID}",
        versionId: ${WECHAT_LOGIN_ACTION_FLOW_VERSION},
        args: $args
      )
    }
  `;

  return graphql(query, { args }).then((res) => {
    const raw = res.data && res.data.fz_invoke_action_flow;
    const body = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    if (!body.success) {
      throw new Error(body.message || "微信登录后端尚未完成手机号换取配置。");
    }

    return {
      actionFlowResult: body,
      user: {
        id: body.account_id ? String(body.account_id) : "",
        nickName: args.nick_name || "微信用户",
        avatarUrl: args.avatar_url || "",
        openid: body.wechat_openid || "",
        role: "customer",
        phone: body.phone_number || ""
      },
      payload: loginPayload
    };
  });
}

// Zion 原生微信小程序登录（微信行为登录）。
// 后端用 wx.login 的 code 调微信 code2session，自动创建/复用 account 并写入 wechat_openid。
function requestZionWechatMiniAppLogin(loginCode) {
  const query = `
    mutation LoginWithWechatMiniApp($code: String!) {
      loginWithWechatMiniApp(code: $code, createIfNotExists: true) {
        account {
          id
          username
          phoneNumber
          profileImageUrl
          permissionRoles
        }
        jwt {
          token
        }
      }
    }
  `;

  return graphql(query, { code: loginCode }, { auth: false }).then((res) => {
    const result = res.data && res.data.loginWithWechatMiniApp;
    if (!result || !result.account || !result.account.id) {
      throw new Error("Zion 微信登录未返回账户，请检查小程序 AppSecret 配置。");
    }
    if (result.jwt && result.jwt.token) {
      wx.setStorageSync("zionJwt", result.jwt.token);
    }
    return result;
  });
}

// 把登录后采集到的微信昵称/头像同步到 account 表（已验证字段）。
function syncWechatProfileToAccount(accountId, profile = {}) {
  const data = {};
  if (profile.nickName) {
    data.wechat_nickname = profile.nickName;
  }
  if (profile.avatarUrl) {
    data.wechat_avatar_url = profile.avatarUrl;
  }
  if (!Object.keys(data).length) {
    return Promise.resolve(null);
  }

  const query = `
    mutation SyncWechatProfile($id: bigint!, $data: account_set_input!) {
      update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        wechat_nickname
        wechat_avatar_url
      }
    }
  `;

  return graphql(query, { id: Number(accountId), data })
    .then((res) => res.data.update_account_by_pk)
    .catch((error) => {
      console.warn("syncWechatProfileToAccount failed", error);
      return null;
    });
}

// 发送手机号绑定短信验证码（Zion 内置能力，不依赖微信付费手机号组件）。
function sendPhoneVerificationCode(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }

  const query = `
    mutation SendBindPhoneCode($telephone: String!) {
      sendVerificationCodeToPhone(telephone: $telephone, verificationEnumType: BIND)
    }
  `;

  return graphql(query, { telephone: phone }).then((res) => {
    if (!res.data || res.data.sendVerificationCodeToPhone !== true) {
      throw new Error("短信验证码发送失败，请稍后重试。");
    }
    return true;
  });
}

function isPhoneRegistered(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.resolve(false);
  }
  const query = `
    query PhoneRegistered($phone: String!) {
      account(where: { fz_phone_number: { _eq: $phone } }, limit: 1) {
        id
      }
    }
  `;
  return graphql(query, { phone }).then((res) => {
    const list = res.data && res.data.account;
    return Array.isArray(list) && list.length > 0;
  }).catch(() => false);
}

// 发送手机号登录验证码。
// Zion 的验证码分类型：已注册手机号必须用 LOGIN 类型，新手机号用 SIGN_UP 类型，
// 且登录时 authenticateWithPhoneNumber 的 register 参数必须与发码类型一致。
// 注意：未注册手机号用 LOGIN 类型也能发码成功，但登录时 register:false 会校验失败，
// 因此必须先查 account 表决定发码类型，不能「先 LOGIN 失败再回退 SIGN_UP」。
// 返回 { mode: "LOGIN" | "SIGN_UP" }，页面需要保存 mode 并在登录时传回。
function sendLoginVerificationCode(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }

  const buildQuery = (enumType) => `
    mutation SendLoginPhoneCode($telephone: String!) {
      sendVerificationCodeToPhone(telephone: $telephone, verificationEnumType: ${enumType})
    }
  `;
  const send = (enumType) => graphql(buildQuery(enumType), { telephone: phone }).then((res) => {
    if (!res.data || res.data.sendVerificationCodeToPhone !== true) {
      throw new Error("短信验证码发送失败，请稍后重试。");
    }
    return { mode: enumType };
  }).catch((error) => {
    const raw = String(error && error.message || "");
    if (/INSUFFICIENT_SMS_AMOUNT|短信数量超限/i.test(raw)) {
      throw new Error("短信额度已用完，请联系管理员在 Zion 后台充值后再试。");
    }
    throw error;
  });

  return isPhoneRegistered(phone).then((registered) => send(registered ? "LOGIN" : "SIGN_UP"));
}

// 手机号 + 短信验证码登录（Zion 内置）。
// codeMode 必须与发码时的类型一致：
// - "LOGIN"：已注册手机号，直接匹配 Zion 后端已有账户登录（register: false）。
// - "SIGN_UP"：新手机号，验证通过后自动创建账户（register: true）。
function loginWithPhoneNumber(telephone, verificationCode, profile = {}, codeMode = "LOGIN") {
  const phone = String(telephone || "").trim();
  const code = String(verificationCode || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }
  if (!code) {
    return Promise.reject(new Error("请输入短信验证码。"));
  }

  const register = codeMode === "SIGN_UP";
  const query = `
    mutation LoginWithPhoneNumber($telephone: String!, $verificationCode: String!, $register: Boolean!) {
      authenticateWithPhoneNumber(
        telephone: $telephone,
        verificationCode: $verificationCode,
        register: $register
      ) {
        account {
          id
          username
          phoneNumber
          profileImageUrl
          permissionRoles
        }
        jwt {
          token
        }
      }
    }
  `;

  return graphql(query, { telephone: phone, verificationCode: code, register }, { auth: false }).then((res) => {
    const result = res.data && res.data.authenticateWithPhoneNumber;
    if (!result || !result.account || !result.account.id) {
      throw new Error("Zion 未返回账户，登录失败。");
    }
    const token = result.jwt && result.jwt.token ? result.jwt.token : "";
    if (token) {
      wx.setStorageSync("zionJwt", token);
    }

    const accountId = String(result.account.id);
    return getAccountProfile(accountId).catch(() => null).then((backendUser) => {
      // 老账户直接沿用后端已有昵称/头像；只有后端缺失时才用本次填写的资料补齐。
      const missingProfile = {};
      if (profile.nickName && !(backendUser && backendUser.nickName && backendUser.nickName !== "微信用户")) {
        missingProfile.nickName = profile.nickName;
      }
      if (profile.avatarUrl && !(backendUser && backendUser.avatarUrl)) {
        missingProfile.avatarUrl = profile.avatarUrl;
      }

      const syncPromise = Object.keys(missingProfile).length
        ? syncWechatProfileToAccount(accountId, missingProfile).then(() => getAccountProfile(accountId).catch(() => backendUser))
        : Promise.resolve(backendUser);

      return syncPromise.then((finalUser) => ({
        token,
        isNewAccount: register,
        user: finalUser && finalUser.id ? finalUser : {
          id: accountId,
          nickName: profile.nickName || result.account.username || `用户${phone.slice(-4)}`,
          avatarUrl: profile.avatarUrl || result.account.profileImageUrl || "",
          role: "customer",
          phone: result.account.phoneNumber || phone
        }
      }));
    });
  });
}

// 用短信验证码把真实手机号绑定到当前登录的 Zion 账户（写入 account.fz_phone_number）。
function bindPhoneNumberByCode(telephone, verificationCode) {
  const phone = String(telephone || "").trim();
  const code = String(verificationCode || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }
  if (!code) {
    return Promise.reject(new Error("请输入短信验证码。"));
  }
  if (!wx.getStorageSync("zionJwt")) {
    return Promise.reject(new Error("请先完成微信登录，再绑定手机号。"));
  }

  const query = `
    mutation BindPhoneByCode($telephone: String!, $verificationCode: String!) {
      bindPhoneNumberByVerificationCode(telephone: $telephone, verificationCode: $verificationCode)
    }
  `;

  return graphql(query, { telephone: phone, verificationCode: code }).then((res) => {
    if (!res.data || res.data.bindPhoneNumberByVerificationCode !== true) {
      throw new Error("手机号绑定失败，请核对验证码后重试。");
    }
    return true;
  });
}

function normalizeCourseLesson(item = {}) {
  const videoAssetUrl = item.video && item.video.url ? item.video.url : "";
  return {
    id: String(item.id),
    title: item.title || "",
    duration: item.duration_text || "",
    sortOrder: Number(item.sort_order || 0),
    videoUrl: videoAssetUrl || item.video_url || ""
  };
}

function normalizeCourse(item = {}) {
  const coverImageUrl = item.cover_image && item.cover_image.url ? item.cover_image.url : "";
  const lessons = Array.isArray(item.course_lesson) ? item.course_lesson : [];
  const chapters = lessons
    .map(normalizeCourseLesson)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: String(item.id),
    zionId: item.id,
    title: item.title || "",
    subtitle: item.subtitle || "",
    description: item.description || "",
    coverUrl: coverImageUrl || item.cover_url || "",
    durationText: item.duration_text || "",
    badge: item.badge || "",
    sortOrder: Number(item.sort_order || 0),
    enabled: item.enabled !== false,
    chapters
  };
}

function normalizeAdvisor(item = {}) {
  const tags = Array.isArray(item.tags_json)
    ? item.tags_json
    : String(item.specialties || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

  const avatarImageUrl = item.avatar_image && item.avatar_image.url ? item.avatar_image.url : "";

  return {
    id: String(item.id),
    zionId: item.id,
    name: item.name,
    title: item.title,
    avatarUrl: avatarImageUrl || item.avatar_url,
    imageUrl: avatarImageUrl || item.avatar_url,
    avatarText: item.name ? item.name.slice(0, 1) : "心",
    bio: item.bio,
    tags,
    topics: tags,
    helped: item.consult_count || 0,
    rating: item.rating || "5.0",
    displayPrice: item.price_per_hour || 200,
    pricePerHour: item.price_per_hour || 200,
    status: item.status
  };
}

function normalizeServiceProvider(item = {}) {
  const specialties = Array.isArray(item.specialties_json)
    ? item.specialties_json
    : String(item.specialties || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  const account = item.account || {};
  const displayName = account.wechat_nickname || account.username || item.display_name || item.name || "服务人员";
  const avatarUrl = account.wechat_avatar_url || item.avatar_url || "";

  return {
    id: String(item.id),
    accountId: item.account_id ? String(item.account_id) : "",
    displayName,
    title: item.title || "情感咨询经理",
    avatarUrl,
    bio: item.bio || "",
    specialties,
    serviceStatus: item.service_status || "PENDING_REVIEW",
    serviceKind: item.service_kind || "STAFF",
    verified: !!item.verified,
    canReply: !!item.can_reply,
    canAcceptOrder: !!item.can_accept_order,
    onlineStatus: item.online_status || "offline",
    rating: item.rating || "0",
    pricePerHour: item.price_per_hour || 200,
    serviceMinutes: item.service_minutes || 60,
    todayWaitingCount: item.today_waiting_count || 0,
    activeSessionCount: item.active_session_count || 0,
    todayIncome: item.today_income || 0,
    totalIncome: item.total_income || 0
  };
}

function normalizeManagerSession(item = {}, accountsById = {}, ordersById = {}) {
  const customerAccount = accountsById[String(item.customer_account_id || "")] || {};
  const customerProfile = customerAccount.account_profile || {};
  const order = ordersById[String(item.order_id || "")] || {};
  const customerNickname = item.customer_nickname
    || customerProfile.user_name
    || customerAccount.wechat_nickname
    || customerAccount.username
    || "微信用户";
  const customerAvatarUrl = item.customer_avatar_url
    || customerProfile.avatar_url
    || customerAccount.wechat_avatar_url
    || "";
  return {
    id: String(item.id),
    orderId: item.order_id ? String(item.order_id) : "",
    customerAccountId: item.customer_account_id ? String(item.customer_account_id) : "",
    advisorId: item.advisor_id ? String(item.advisor_id) : "",
    managerAccountId: item.manager_account_id ? String(item.manager_account_id) : "",
    serviceProviderId: item.service_provider_id ? String(item.service_provider_id) : "",
    status: item.status,
    startedAt: item.started_at,
    expiresAt: item.expires_at,
    lastMessageAt: item.last_message_at,
    topic: item.topic || order.issue_summary || item.issue_summary || "",
    customerNickname,
    customerAvatarUrl,
    customerAvatarText: customerNickname ? customerNickname.slice(0, 1) : "客",
    problemCategory: order.problem_category || item.problem_category || item.category || "情感问答",
    issueSummary: order.issue_summary || item.issue_summary || "",
    amount: order.amount || item.amount || 200,
    durationMinutes: order.duration_minutes || item.duration_minutes || 60,
    chatAvailableUntil: order.chat_available_until || item.chat_available_until || ""
  };
}

function normalizeConsultationStatus(order = {}, session = {}) {
  const sessionStatus = String(session.status || "").toLowerCase();
  const orderStatus = String(order.status || "").toLowerCase();
  if (["active", "serving", "in_service"].includes(sessionStatus)) return "服务中";
  if (["completed", "finished", "ended", "closed"].includes(sessionStatus) || ["completed", "finished"].includes(orderStatus)) return "已完成";
  if (["waiting", "paid", "pending"].includes(sessionStatus) || ["paid", "created", "pending"].includes(orderStatus)) return "待接单";
  return orderStatus || sessionStatus ? (order.status || session.status) : "待接单";
}

function formatDisplayAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function formatMoneyText(value) {
  const numeric = Number(formatDisplayAmount(value));
  const fixed = numeric.toFixed(2);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function getCustomerAccountSummary(accountId) {
  if (!accountId) {
    return Promise.resolve({
      totalSpent: 0,
      totalSpentText: "0.00",
      orderCards: [
        { label: "待支付", value: 0 },
        { label: "服务中", value: 0 },
        { label: "已完成", value: 0 }
      ]
    });
  }

  const query = `
    query GetCustomerAccountSummary($accountId: bigint!) {
      consultation_order(
        where: { customer_account_id: { _eq: $accountId } }
        order_by: { created_at: desc }
        limit: 200
      ) {
        id
        amount
        status
        paid_at
      }
      consultation_session(
        where: { customer_account_id: { _eq: $accountId } }
        order_by: { last_message_at: desc }
        limit: 200
      ) {
        id
        status
      }
    }
  `;

  return graphql(query, { accountId: Number(accountId) }).then((res) => {
    const orders = res.data.consultation_order || [];
    const sessions = res.data.consultation_session || [];
    let totalSpent = 0;
    let pendingCount = 0;
    let servingCount = 0;
    let completedCount = 0;

    orders.forEach((order) => {
      const status = String(order.status || "").toLowerCase();
      if (status === "pending" || status === "created") {
        pendingCount += 1;
        return;
      }
      if (order.paid_at) {
        totalSpent += Number(formatDisplayAmount(order.amount));
      }
      if (status === "completed" || status === "finished") {
        completedCount += 1;
      }
    });

    sessions.forEach((session) => {
      const status = String(session.status || "").toLowerCase();
      if (["active", "serving", "in_service"].includes(status)) {
        servingCount += 1;
      }
    });

    return {
      totalSpent,
      totalSpentText: formatMoneyText(totalSpent),
      orderCards: [
        { label: "待支付", value: pendingCount },
        { label: "服务中", value: servingCount },
        { label: "已完成", value: completedCount }
      ]
    };
  });
}

function normalizeManagerOrder(order = {}, session = {}, accountsById = {}) {
  const customerAccount = accountsById[String(order.customer_account_id || session.customer_account_id || "")] || {};
  const customerProfile = customerAccount.account_profile || {};
  const customerName = session.customer_nickname
    || customerProfile.user_name
    || customerAccount.wechat_nickname
    || customerAccount.username
    || "匿名用户";
  const customerAvatarUrl = session.customer_avatar_url
    || customerProfile.avatar_url
    || customerAccount.wechat_avatar_url
    || "";
  const status = normalizeConsultationStatus(order, session);
  const amount = formatDisplayAmount(order.amount || session.amount || 0);
  const durationMinutes = Number(order.duration_minutes || session.duration_minutes || 60);
  const startedAt = session.started_at ? new Date(session.started_at).getTime() : 0;
  const expiresAt = session.expires_at ? new Date(session.expires_at).getTime() : 0;
  const elapsedMinutes = startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 60000)) : 0;
  const progress = startedAt && expiresAt
    ? Math.min(100, Math.max(0, Math.round(((Date.now() - startedAt) / (expiresAt - startedAt)) * 100)))
    : 0;

  return {
    id: String(session.id || order.id || ""),
    orderId: order.id ? String(order.id) : "",
    sessionId: session.id ? String(session.id) : "",
    orderNo: order.order_no || "",
    name: customerName,
    avatarUrl: customerAvatarUrl,
    avatarText: customerName ? customerName.slice(0, 1) : "客",
    tag: order.problem_category || session.problemCategory || "情感问答",
    title: order.issue_summary || order.remark || session.topic || "用户提交了新的咨询问题......",
    status,
    statusTone: status === "待接单" ? "orange" : (status === "服务中" ? "blue" : "gray"),
    metaLeft: status === "服务中"
      ? `已服务：${Math.min(elapsedMinutes, durationMinutes)}分钟 / ${durationMinutes}分钟`
      : `${status === "已完成" ? "服务时长" : "预约时长"}：${durationMinutes}分钟`,
    metaRight: `${status === "已完成" ? "收入" : "价格"}：¥${amount}`,
    time: status === "已完成"
      ? `完成时间：${session.ended_at ? formatShortDate(session.ended_at) : "未记录"}`
      : `提交时间：${formatRelativeTime(order.created_at || session.created_at)}`,
    amount,
    durationMinutes,
    progress,
    createdAt: order.created_at || session.created_at || "",
    startedAt: session.started_at || "",
    endedAt: session.ended_at || "",
    expiresAt: session.expires_at || order.chat_available_until || "",
    customerAccountId: order.customer_account_id || session.customer_account_id || "",
    managerAccountId: session.manager_account_id || "",
    serviceProviderId: session.service_provider_id || "",
    rawOrder: order,
    rawSession: session
  };
}

function formatRelativeTime(value) {
  if (!value) return "刚刚";
  const timestamp = new Date(value).getTime();
  if (!timestamp) return "刚刚";
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "昨天" : `${diffDays}天前`;
}

function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (isSameDay) return "今天";
  if (date.toDateString() === yesterday.toDateString()) return "昨天";
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function normalizeAccount(item = {}) {
  const infoMap = item.oauth2_user_info_map && typeof item.oauth2_user_info_map === "object"
    ? item.oauth2_user_info_map
    : {};
  const linkedProfile = item.account_profile && typeof item.account_profile === "object"
    ? item.account_profile
    : {};
  const accountProfile = {
    ...getStoredAccountProfile(infoMap),
    ...linkedProfile
  };
  // 头像优先取 avatar_image（Zion 图片资产，URL 每次查询都会重新签名），
  // avatar_url 文本仅作为老数据兜底。
  const avatarImageUrl = accountProfile.avatar_image && accountProfile.avatar_image.url
    ? accountProfile.avatar_image.url
    : "";

  return {
    id: item.id ? String(item.id) : "",
    profileId: item.account_profile_id ? String(item.account_profile_id) : (accountProfile.id ? String(accountProfile.id) : ""),
    nickName: accountProfile.user_name || item.wechat_nickname || item.username || "微信用户",
    avatarUrl: avatarImageUrl || accountProfile.avatar_url || item.wechat_avatar_url || "",
    avatarImageId: accountProfile.avatar_image && accountProfile.avatar_image.id ? String(accountProfile.avatar_image.id) : "",
    role: item.user_type || "customer",
    phone: item.fz_phone_number || "",
    username: /^wxh5_[a-f0-9]{36}$/.test(item.username || "")
      ? (accountProfile.user_name || item.wechat_nickname || "微信用户") : (item.username || ""),
    region: accountProfile.region || accountProfile.city || "",
    locationInfo: accountProfile.location_info || null,
    address: accountProfile.address || (accountProfile.location_info && accountProfile.location_info.address) || "",
    gender: accountProfile.gender || "",
    birthday: accountProfile.birthday || ""
  };
}

function getStoredAccountProfile(infoMap = {}) {
  if (infoMap[ACCOUNT_PROFILE_KEY] && typeof infoMap[ACCOUNT_PROFILE_KEY] === "object") {
    return infoMap[ACCOUNT_PROFILE_KEY];
  }
  if (infoMap[LEGACY_ACCOUNT_PROFILE_KEY] && typeof infoMap[LEGACY_ACCOUNT_PROFILE_KEY] === "object") {
    return infoMap[LEGACY_ACCOUNT_PROFILE_KEY];
  }
  return {};
}

function getDefaultManagerIdentity() {
  const query = `
    query GetDefaultManagerIdentity {
      service_provider(limit: 20) {
        id
        account_id
        display_name
        title
        avatar_url
        service_status
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
      account(limit: 100) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const providers = (res.data.service_provider || []).map(normalizeServiceProvider);
    const provider = providers.find((item) => item.serviceStatus === "ACTIVE" && (item.canReply || item.canAcceptOrder))
      || providers[0];
    if (!provider) {
      return cloneDefaultManagerIdentity();
    }
    const account = (res.data.account || []).find((item) => String(item.id) === String(provider.accountId));
    const user = account
      ? normalizeAccount(account)
      : {
        id: provider.accountId,
        nickName: provider.displayName,
        avatarUrl: provider.avatarUrl,
        role: "manager",
        phone: ""
      };
    return {
      user: {
        ...user,
        id: provider.accountId || user.id,
        nickName: provider.displayName || user.nickName,
        avatarUrl: provider.avatarUrl || user.avatarUrl,
        role: "manager"
      },
      serviceProvider: provider
    };
  }).catch((error) => {
    console.warn("getDefaultManagerIdentity fallback", error);
    return cloneDefaultManagerIdentity();
  });
}

function listCourses(filters = {}) {
  const query = `
    query ListCourses($limit: Int) {
      course(
        where: { enabled: { _eq: true } }
        order_by: { sort_order: asc }
        limit: $limit
      ) {
        id
        title
        subtitle
        cover_url
        cover_image {
          id
          url
        }
        duration_text
        badge
        sort_order
        enabled
      }
    }
  `;

  return graphql(query, { limit: filters.limit || 50 }).then((res) => ({
    courses: (res.data.course || []).map(normalizeCourse)
  }));
}

function getCourse(id) {
  const courseId = toDatabaseId(id);
  if (!courseId) {
    return Promise.resolve({ course: null });
  }

  const query = `
    query GetCourse($id: bigint!) {
      course_by_pk(id: $id) {
        id
        title
        subtitle
        description
        cover_url
        cover_image {
          id
          url
        }
        duration_text
        badge
        sort_order
        enabled
        course_lesson(order_by: { sort_order: asc }) {
          id
          title
          duration_text
          sort_order
          video_url
          video {
            id
            url
          }
        }
      }
    }
  `;

  return graphql(query, { id: courseId }).then((res) => ({
    course: normalizeCourse(res.data.course_by_pk || {})
  }));
}

function listAdvisors(filters = {}) {
  const query = `
    query ListAdvisors($limit: Int) {
      advisor(limit: $limit, order_by: { id: asc }) {
        id
        name
        title
        avatar_url
        avatar_image {
          id
          url
        }
        bio
        specialties
        tags_json
        price_per_hour
        rating
        consult_count
        status
      }
    }
  `;

  return graphql(query, { limit: filters.limit || 20 }).then((res) => ({
    advisors: (res.data.advisor || []).map(normalizeAdvisor)
  }));
}

function listServiceProviders(filters = {}) {
  const query = `
    query ListServiceProviders {
      service_provider(limit: 50) {
        id
        account_id
        display_name
        title
        avatar_url
        bio
        specialties_json
        service_status
        service_kind
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const providers = (res.data.service_provider || []).map(normalizeServiceProvider);
    return {
      serviceProviders: filters.status
        ? providers.filter((item) => item.serviceStatus === filters.status)
        : providers
    };
  });
}

function getServiceProviderByAccount(accountId) {
  if (!accountId) return Promise.resolve(null);

  const query = `
    query GetServiceProviderByAccount($accountId: bigint!) {
      service_provider(where: { _eq: { bigint_operand: { left_operand: { column: account_id }, right_operand: { literal: $accountId } } } }, limit: 1) {
        id
        account_id
        display_name
        title
        avatar_url
        bio
        specialties_json
        service_status
        service_kind
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
    }
  `;

  return graphql(query, { accountId: Number(accountId) }).then((res) => {
    const provider = (res.data.service_provider || [])[0];
    return provider ? normalizeServiceProvider(provider) : null;
  });
}

function createServiceProviderProfile(data = {}) {
  const query = `
    mutation CreateServiceProviderProfile($object: service_provider_insert_input!) {
      insert_service_provider_one(object: $object) {
        id
        account_id
        display_name
        title
        avatar_url
        service_status
        verified
        can_reply
        can_accept_order
      }
    }
  `;
  const object = {
    display_name: data.displayName || data.name || "服务人员",
    title: data.title || "情感咨询经理",
    avatar_url: data.avatarUrl || "",
    bio: data.bio || "",
    specialties_json: data.specialties || [],
    service_status: data.serviceStatus || "PENDING_REVIEW",
    verified: !!data.verified,
    can_reply: !!data.canReply,
    can_accept_order: !!data.canAcceptOrder,
    online_status: data.onlineStatus || "offline",
    rating: data.rating || 0,
    price_per_hour: data.pricePerHour || 200,
    service_minutes: data.serviceMinutes || 60
  };

  if (data.accountId) {
    object.account_id = Number(data.accountId);
  }

  return graphql(query, { object }).then((res) => normalizeServiceProvider(res.data.insert_service_provider_one));
}

function getAdvisor(id) {
  const advisorId = toDatabaseId(id);
  if (!advisorId) {
    return Promise.resolve({ advisor: null });
  }

  const query = `
    query GetAdvisor($id: bigint!) {
      advisor_by_pk(id: $id) {
        id
        name
        title
        avatar_url
        avatar_image {
          id
          url
        }
        bio
        specialties
        tags_json
        price_per_hour
        rating
        consult_count
        status
        service_provider {
          id
          account_id
          display_name
          service_status
        }
      }
    }
  `;

  return graphql(query, { id: advisorId }).then((res) => ({
    advisor: normalizeAdvisor(res.data.advisor_by_pk)
  }));
}

const ACTIVE_CUSTOMER_BINDING_STATUS = "ACTIVE";

function normalizeCustomerServiceBinding(item = {}) {
  const advisor = item.advisor || {};
  const provider = item.service_provider || {};
  const session = item.consultation_session || null;

  return {
    id: item.id ? String(item.id) : "",
    status: item.binding_status || ACTIVE_CUSTOMER_BINDING_STATUS,
    boundAt: item.bound_at || "",
    customerAccountId: item.customer_account_id ? String(item.customer_account_id) : "",
    advisorId: item.advisor_id ? String(item.advisor_id) : "",
    serviceProviderId: item.service_provider_id ? String(item.service_provider_id) : "",
    managerAccountId: provider.account_id ? String(provider.account_id) : "",
    advisorName: advisor.name || provider.display_name || "",
    advisorTitle: advisor.title || provider.title || "",
    transferNote: item.transfer_note || "",
    lastTransferredAt: item.last_transferred_at || "",
    consultationSessionId: session && session.id ? String(session.id) : ""
  };
}

function getCustomerServiceBinding(customerAccountId) {
  const accountId = toDatabaseId(customerAccountId);
  if (!accountId) return Promise.resolve(null);

  const query = `
    query GetCustomerServiceBinding($accountId: bigint!) {
      customer_service_binding(
        limit: 1,
        where: {
          customer_account_id: { _eq: $accountId },
          binding_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        binding_status
        bound_at
        transfer_note
        last_transferred_at
        customer_account_id
        advisor_id
        service_provider_id
        advisor {
          id
          name
          title
        }
        service_provider {
          id
          account_id
          display_name
          title
        }
        consultation_session {
          id
          order_id
          customer_account_id
          advisor_id
          manager_account_id
          service_provider_id
          status
          started_at
          ended_at
          expires_at
          last_message_at
          topic
          customer_nickname
          customer_avatar_url
        }
      }
    }
  `;

  return graphql(query, { accountId })
    .then((res) => {
      const row = (res.data.customer_service_binding || [])[0];
      return row ? normalizeCustomerServiceBinding(row) : null;
    })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) return null;
      throw error;
    });
}

function resolveAdvisorServiceProvider(advisorId) {
  const resolvedAdvisorId = toDatabaseId(advisorId);
  if (!resolvedAdvisorId) {
    return Promise.reject(new Error("missing advisor id"));
  }

  const query = `
    query ResolveAdvisorServiceProvider($id: bigint!) {
      advisor_by_pk(id: $id) {
        id
        name
        service_provider {
          id
          account_id
          display_name
          service_status
        }
      }
      service_provider(
        limit: 1,
        where: {
          advisor_id: { _eq: $id },
          service_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        account_id
        display_name
        service_status
      }
    }
  `;

  return graphql(query, { id: resolvedAdvisorId })
    .then((res) => {
      const advisor = res.data.advisor_by_pk || {};
      const provider = advisor.service_provider || (res.data.service_provider || [])[0] || null;
      if (!provider || !provider.id) {
        const error = new Error("该咨询师暂未关联服务人员，暂时无法预约。");
        error.code = "MISSING_SERVICE_PROVIDER";
        throw error;
      }
      return {
        advisorId: String(advisor.id || advisorId),
        advisorName: advisor.name || provider.display_name || "",
        serviceProviderId: String(provider.id),
        managerAccountId: provider.account_id ? String(provider.account_id) : ""
      };
    });
}

function isActiveServiceProvider(provider) {
  return Boolean(
    provider
    && provider.serviceStatus === "ACTIVE"
    && (provider.canReply || provider.canAcceptOrder)
  );
}

function assertCanBookAdvisor(customerAccountId, advisorId) {
  return getServiceProviderByAccount(customerAccountId)
    .then((provider) => {
      if (isActiveServiceProvider(provider)) {
        return {
          allowed: false,
          binding: null,
          reason: "manager",
          message: "服务人员账号不能预约咨询，请前往「我的」进入工作台处理客户订单。"
        };
      }
      return getCustomerServiceBinding(customerAccountId).then((binding) => {
        if (!binding || !binding.advisorId) {
          return { allowed: true, binding: null };
        }
        if (String(binding.advisorId) === String(advisorId)) {
          return { allowed: true, binding };
        }
        return {
          allowed: false,
          binding,
          reason: "binding",
          message: `你已绑定咨询师 ${binding.advisorName || "专属咨询师"}，不能预约其他老师。后续服务都会由 TA 回复。`
        };
      });
    });
}

function createCustomerServiceBinding(data = {}) {
  const query = `
    mutation CreateCustomerServiceBinding($object: customer_service_binding_insert_input!) {
      insert_customer_service_binding_one(object: $object) {
        id
        binding_status
        bound_at
        customer_account_id
        advisor_id
        service_provider_id
      }
    }
  `;
  const boundAt = new Date().toISOString();

  return graphql(query, {
    object: {
      customer_account_id: Number(data.customerAccountId),
      advisor_id: Number(data.advisorId),
      service_provider_id: Number(data.serviceProviderId),
      binding_status: ACTIVE_CUSTOMER_BINDING_STATUS,
      bound_at: boundAt
    }
  }).then((res) => normalizeCustomerServiceBinding(res.data.insert_customer_service_binding_one));
}

function ensureCustomerServiceBinding(data = {}) {
  return getCustomerServiceBinding(data.customerAccountId).then((existing) => {
    if (existing && existing.advisorId) {
      if (String(existing.advisorId) !== String(data.advisorId)) {
        const error = new Error("customer already bound to another advisor");
        error.code = "BINDING_CONFLICT";
        throw error;
      }
      return existing;
    }
    return createCustomerServiceBinding(data);
  });
}

function canTransferCustomerBinding(account) {
  const role = account && (account.user_type || account.role);
  return role === "admin" || role === "super_admin";
}

function transferCustomerServiceBinding(data = {}) {
  const query = `
    query GetAccountRole($id: bigint!) {
      account_by_pk(id: $id) {
        id
        user_type
      }
    }
  `;
  const updateQuery = `
    mutation TransferCustomerServiceBinding($id: bigint!, $data: customer_service_binding_set_input!) {
      update_customer_service_binding_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        binding_status
        bound_at
        transfer_note
        last_transferred_at
        customer_account_id
        advisor_id
        service_provider_id
      }
    }
  `;
  const transferredAt = new Date().toISOString();

  return graphql(query, { id: Number(data.operatorAccountId) })
    .then((res) => {
      const account = res.data.account_by_pk;
      if (!canTransferCustomerBinding(account)) {
        const error = new Error("仅更高权限人员可以移交客户绑定关系。");
        error.code = "TRANSFER_FORBIDDEN";
        throw error;
      }
      return resolveAdvisorServiceProvider(data.advisorId);
    })
    .then((resolved) => graphql(updateQuery, {
      id: Number(data.bindingId),
      data: {
        advisor_id: Number(resolved.advisorId),
        service_provider_id: Number(resolved.serviceProviderId),
        binding_status: ACTIVE_CUSTOMER_BINDING_STATUS,
        transfer_note: data.transferNote || "",
        last_transferred_at: transferredAt
      }
    }).then((updateRes) => normalizeCustomerServiceBinding(updateRes.data.update_customer_service_binding_by_pk)));
}

function createQuestion(data) {
  return createPaymentOrder({
    advisorId: data.advisorId,
    remark: data.content || data.question || ""
  });
}

function normalizeConsultationSessionRow(session) {
  if (!session) return null;
  const order = session.consultation_order || {};
  const durationMinutes = Number(order.duration_minutes || session.duration_minutes || 60);
  const chatAvailableUntil = order.chat_available_until || session.chat_available_until || "";
  const expiryInput = {
    status: session.status,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    expiresAt: session.expires_at,
    durationMinutes,
    chatAvailableUntil
  };
  return {
    id: String(session.id),
    orderId: session.order_id ? String(session.order_id) : "",
    customerAccountId: session.customer_account_id ? String(session.customer_account_id) : "",
    advisorId: session.advisor_id ? String(session.advisor_id) : "",
    managerAccountId: session.manager_account_id ? String(session.manager_account_id) : "",
    serviceProviderId: session.service_provider_id ? String(session.service_provider_id) : "",
    status: session.status,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    expiresAt: session.expires_at,
    durationMinutes,
    chatAvailableUntil,
    effectiveExpiresAt: resolveEffectiveSessionExpiry(expiryInput),
    lastMessageAt: session.last_message_at,
    topic: session.topic || "",
    customerNickname: session.customer_nickname || "客户",
    customerAvatarUrl: session.customer_avatar_url || "",
    customerAvatarText: session.customer_nickname ? session.customer_nickname.slice(0, 1) : "客"
  };
}

function getBoundConsultationSession(customerAccountId, options = {}) {
  const accountId = toDatabaseId(customerAccountId);
  if (!accountId) return Promise.resolve(null);

  const bindingQuery = `
    query GetBoundSessionFromBinding($accountId: bigint!) {
      customer_service_binding(
        limit: 1,
        where: {
          customer_account_id: { _eq: $accountId },
          binding_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        advisor_id
        service_provider_id
        consultation_session {
          id
          order_id
          customer_account_id
          advisor_id
          manager_account_id
          service_provider_id
          status
          started_at
          ended_at
          expires_at
          last_message_at
          topic
          customer_nickname
          customer_avatar_url
        }
      }
    }
  `;

  const legacyQuery = `
    query GetBoundConsultationSession($where: consultation_session_bool_exp!) {
      consultation_session(
        where: $where,
        order_by: { id: asc },
        limit: 1
      ) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;

  return graphql(bindingQuery, { accountId })
    .then((res) => {
      const binding = (res.data.customer_service_binding || [])[0];
      if (!binding) return null;
      if (
        options.serviceProviderId
        && String(binding.service_provider_id) !== String(options.serviceProviderId)
      ) {
        return null;
      }
      if (
        options.advisorId
        && String(binding.advisor_id) !== String(options.advisorId)
      ) {
        return null;
      }
      return normalizeConsultationSessionRow(binding.consultation_session);
    })
    .catch((error) => {
      if (!isSchemaCompatibilityError(error)) throw error;
      const where = {
        customer_account_id: { _eq: accountId }
      };
      if (options.serviceProviderId) {
        where.service_provider_id = { _eq: Number(options.serviceProviderId) };
      } else if (options.advisorId) {
        where.advisor_id = { _eq: Number(options.advisorId) };
      }
      return graphql(legacyQuery, { where })
        .then((legacyRes) => normalizeConsultationSessionRow((legacyRes.data.consultation_session || [])[0]));
    });
}

function updateConsultationSession(sessionId, data = {}) {
  const resolvedSessionId = toDatabaseId(sessionId);
  if (!resolvedSessionId) {
    return Promise.reject(new Error("missing session id"));
  }

  const query = `
    mutation UpdateConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;
  const payload = {};
  if (data.orderId !== undefined) payload.order_id = data.orderId ? Number(data.orderId) : null;
  if (data.customerAccountId !== undefined) payload.customer_account_id = data.customerAccountId ? Number(data.customerAccountId) : null;
  if (data.advisorId !== undefined) payload.advisor_id = data.advisorId ? Number(data.advisorId) : null;
  if (data.managerAccountId !== undefined) payload.manager_account_id = data.managerAccountId ? Number(data.managerAccountId) : null;
  if (data.serviceProviderId !== undefined) payload.service_provider_id = data.serviceProviderId ? Number(data.serviceProviderId) : null;
  if (data.status !== undefined) payload.status = data.status;
  if (data.startedAt !== undefined) payload.started_at = data.startedAt ? new Date(data.startedAt).toISOString() : null;
  if (data.endedAt !== undefined) payload.ended_at = data.endedAt ? new Date(data.endedAt).toISOString() : null;
  if (data.expiresAt !== undefined) payload.expires_at = data.expiresAt ? new Date(data.expiresAt).toISOString() : null;
  if (data.lastMessageAt !== undefined) payload.last_message_at = data.lastMessageAt ? new Date(data.lastMessageAt).toISOString() : null;
  if (data.topic !== undefined) payload.topic = data.topic || "";
  if (data.customerNickname !== undefined) payload.customer_nickname = data.customerNickname || "";
  if (data.customerAvatarUrl !== undefined) payload.customer_avatar_url = data.customerAvatarUrl || "";
  if (data.customerServiceBindingId !== undefined) {
    payload.customer_service_binding_id = data.customerServiceBindingId
      ? Number(data.customerServiceBindingId)
      : null;
  }

  return graphql(query, { id: resolvedSessionId, data: payload })
    .then((res) => normalizeConsultationSessionRow(res.data.update_consultation_session_by_pk))
    .then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
      }
      return session;
    });
}

function reuseOrCreateConsultationSession(data = {}) {
  const customerAccountId = data.customerAccountId;
  const bindingPromise = data.customerServiceBindingId
    ? Promise.resolve({ id: String(data.customerServiceBindingId) })
    : (customerAccountId
      ? ensureCustomerServiceBinding({
        customerAccountId,
        advisorId: data.advisorId,
        serviceProviderId: data.serviceProviderId
      })
      : Promise.resolve(null));

  return bindingPromise.then((binding) => {
    const bindingId = binding && binding.id;
    const lookup = customerAccountId
      ? getBoundConsultationSession(customerAccountId, {
        serviceProviderId: data.serviceProviderId,
        advisorId: data.advisorId
      })
      : Promise.resolve(null);

    return lookup.then((existing) => {
      if (existing && existing.id) {
        const updateData = {
          orderId: data.orderId,
          advisorId: data.advisorId,
          managerAccountId: data.managerAccountId,
          serviceProviderId: data.serviceProviderId,
          customerServiceBindingId: bindingId,
          status: data.status || data.sessionStatus || "waiting",
          endedAt: null,
          lastMessageAt: new Date().toISOString(),
          topic: data.topic || data.remark || existing.topic,
          customerNickname: data.customerNickname || existing.customerNickname,
          customerAvatarUrl: data.customerAvatarUrl || existing.customerAvatarUrl
        };
        if (isServiceTimerActive(existing)) {
          const durationMinutes = Number(data.minutes || data.durationMinutes || existing.durationMinutes || 60);
          const currentExpiresAt = existing.expiresAt ? new Date(existing.expiresAt).getTime() : 0;
          const baseTime = Math.max(Date.now(), currentExpiresAt || 0);
          updateData.status = "active";
          updateData.expiresAt = new Date(baseTime + durationMinutes * 60 * 1000);
        } else {
          updateData.startedAt = null;
          updateData.expiresAt = null;
        }
        return updateConsultationSession(existing.id, updateData);
      }
      return createConsultationSession({
        ...data,
        customerServiceBindingId: bindingId
      });
    });
  });
}

function createConsultationSession(data = {}) {
  const query = `
    mutation CreateConsultationSession($object: consultation_session_insert_input!) {
      insert_consultation_session_one(object: $object) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        expires_at
        last_message_at
        topic
        session_source
        customer_nickname
        customer_avatar_url
      }
    }
  `;
  const legacyQuery = `
    mutation CreateConsultationSession($object: consultation_session_insert_input!) {
      insert_consultation_session_one(object: $object) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        status
        started_at
        expires_at
        last_message_at
      }
    }
  `;
  const nowIso = new Date().toISOString();
  const object = {
    order_id: data.orderId ? Number(data.orderId) : null,
    customer_account_id: data.customerAccountId ? Number(data.customerAccountId) : null,
    advisor_id: data.advisorId ? Number(data.advisorId) : null,
    manager_account_id: data.managerAccountId ? Number(data.managerAccountId) : null,
    service_provider_id: data.serviceProviderId ? Number(data.serviceProviderId) : null,
    status: data.status || "waiting",
    last_message_at: nowIso,
    topic: data.topic || data.remark || "",
    session_source: data.source || "miniapp",
    customer_nickname: data.customerNickname || "",
    customer_avatar_url: data.customerAvatarUrl || ""
  };
  if (data.startedAt) {
    object.started_at = new Date(data.startedAt).toISOString();
  }
  if (data.expiresAt) {
    object.expires_at = new Date(data.expiresAt).toISOString();
  }
  if (data.customerServiceBindingId) {
    object.customer_service_binding_id = Number(data.customerServiceBindingId);
  }
  const legacyObject = {
    order_id: object.order_id,
    customer_account_id: object.customer_account_id,
    advisor_id: object.advisor_id,
    manager_account_id: object.manager_account_id,
    status: object.status,
    last_message_at: object.last_message_at
  };
  if (object.started_at) {
    legacyObject.started_at = object.started_at;
  }
  if (object.expires_at) {
    legacyObject.expires_at = object.expires_at;
  }

  return graphql(query, { object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { object: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.insert_consultation_session_one)
    .then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
      }
      return session;
    });
}

function ensureConsultationSession(context = {}) {
  const sessionId = context.sessionId || wx.getStorageSync(CHAT_SESSION_STORAGE_KEY);
  if (sessionId) {
    wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, sessionId);
    return getConsultationSession(sessionId).then((session) => {
      if (!session) {
        return Promise.reject(new Error("bound session not found"));
      }
      return session;
    });
  }

  const customerAccountId = context.accountId || context.customerAccountId;
  if (customerAccountId) {
    return getBoundConsultationSession(customerAccountId, {
      serviceProviderId: context.serviceProviderId,
      advisorId: context.advisorId
    }).then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
        if (session.orderId) {
          wx.setStorageSync("consultationOrderId", session.orderId);
        }
        return session;
      }
      return Promise.reject(new Error("missing bound consultation session"));
    });
  }

  return Promise.reject(new Error("missing bound consultation session"));
}

function updateConsultationSessionLastMessage(sessionId, sentAt) {
  if (!sessionId) return Promise.resolve(null);

  const query = `
    mutation UpdateConsultationSessionLastMessage($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        last_message_at
      }
    }
  `;

  return graphql(query, {
    id: Number(sessionId),
    data: {
      last_message_at: sentAt
    }
  }).then((res) => res.data.update_consultation_session_by_pk);
}

function insertConsultationMessage(message, context = {}) {
  const query = `
    mutation InsertMessage($object: consultation_message_insert_input!) {
      insert_consultation_message_one(object: $object) {
        id
        session_id
        content
        sender_role
        content_type
        client_message_id
        message_source
        delivery_status
        sent_at
      }
    }
  `;
  const legacyQuery = `
    mutation InsertMessage($object: consultation_message_insert_input!) {
      insert_consultation_message_one(object: $object) {
        id
        session_id
        content
        sender_role
        content_type
        sent_at
      }
    }
  `;
  const sentAt = new Date().toISOString();
  const object = {
    session_id: context.sessionId ? Number(context.sessionId) : null,
    sender_account_id: context.accountId ? Number(context.accountId) : null,
    sender_role: context.senderRole || "customer",
    content: message,
    content_type: context.contentType || "text",
    client_message_id: context.clientMessageId || makeClientMessageId(),
    message_source: context.source || "miniapp",
    delivery_status: "saved",
    sent_at: sentAt
  };
  if (context.replacesMessageId) {
    object.replaces_message_id = Number(context.replacesMessageId);
  }
  const legacyObject = {
    session_id: object.session_id,
    sender_account_id: object.sender_account_id,
    sender_role: object.sender_role,
    content: object.content,
    content_type: object.content_type,
    sent_at: object.sent_at
  };

  return graphql(query, { object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { object: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.insert_consultation_message_one)
    .then((savedMessage) => updateConsultationSessionLastMessage(savedMessage.session_id, sentAt)
      .catch(() => null)
      .then(() => savedMessage));
}

function sendChatMessage(message, context = {}) {
  const sessionId = context.sessionId || wx.getStorageSync("consultationSessionId");
  return getConsultationSession(sessionId)
    .then((session) => {
      if (!session) {
        throw new Error("session not found");
      }
      if (session.status === "closed") {
        throw new Error("session expired");
      }
      if (isServiceTimerActive(session)) {
        const expiresAt = resolveEffectiveSessionExpiry(session);
        if (!expiresAt || expiresAt <= Date.now()) {
          throw new Error("session expired");
        }
      } else if (isServiceTimerStarted(session)) {
        throw new Error("session expired");
      }
      const userInfo = wx.getStorageSync("userInfo") || {};
      const senderRole = context.senderRole || "customer";
      if (
        senderRole === "customer"
        && session.customerAccountId
        && userInfo.id
        && String(session.customerAccountId) !== String(userInfo.id)
      ) {
        throw new Error("session mismatch");
      }
      return session;
    })
    .then((session) => {
      const senderRole = context.senderRole || "customer";
      if (senderRole === "manager" && !isServiceTimerActive(session)) {
        return startConsultationServiceTimer(session);
      }
      return session;
    })
    .then((session) => insertConsultationMessage(message, {
      ...context,
      sessionId: session.id
    }))
    .then((savedMessage) => ({
      ...savedMessage,
      sessionId: savedMessage.session_id
    }));
}

function isUsernameAvailable(userName) {
  const name = String(userName || "").trim();
  if (!name || name.length > 80) return Promise.resolve(false);
  if (!wx.getStorageSync("zionJwt")) return Promise.reject(new Error("请先微信登录"));
  // The backend checks globally and returns only a boolean; account RLS stays self-only.
  const query = `mutation CheckUsername($args: Json!) {
    fz_invoke_action_flow(actionFlowId: "9f60a0be-4628-4268-a769-661264846cf4", versionId: 1, args: $args)
  }`;
  return graphql(query, {args:{operation:"CHECK_USERNAME",payload:{name}}}).then((response) => {
    let output = response.data && response.data.fz_invoke_action_flow;
    if (typeof output === "string") output = JSON.parse(output);
    let result = output && (output.result || output);
    if (typeof result === "string") result = JSON.parse(result);
    if (!result || result.ok !== true || !result.data || typeof result.data.available !== "boolean") {
      throw new Error("用户名校验暂不可用，请稍后重试");
    }
    return result.data.available;
  });
}

// 微信身份登录：wx.login → Zion 按 openid 创建/复用唯一账户 → 用户名+头像写入后端。
// 一个微信只对应一个 account；用户名在全局唯一。
function loginWithWechatIdentity(profile = {}) {
  const wxLogin = () => new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject(new Error("微信登录失败，请重试"));
      },
      fail: () => reject(new Error("微信登录失败，请重试"))
    });
  });

  return wxLogin()
    .then((code) => requestZionWechatMiniAppLogin(code))
    .then((loginResult) => {
      const accountId = String(loginResult.account.id);
      return getAccountProfile(accountId).then((backendUser) => ({ backendUser, accountId }));
    })
    .then(({ backendUser, accountId }) => {
      const nickNameInput = String(profile.nickName || "").trim();
      const avatarInput = profile.avatarUrl || "";
      const existingName = String(backendUser.username || backendUser.nickName || "").trim();
      const hasValidAvatar = (url) => Boolean(url) && !/^wxfile:\/\//.test(url);
      const hasEstablishedProfile = Boolean(
        existingName && existingName !== "微信用户" && hasValidAvatar(backendUser.avatarUrl)
      );

      if (!hasEstablishedProfile) {
        if (!nickNameInput) {
          return Promise.reject(new Error("请填写用户名"));
        }
        if (!avatarInput && !backendUser.avatarUrl) {
          return Promise.reject(new Error("请选择头像"));
        }
      }

      const shouldUpdate = Boolean(nickNameInput || avatarInput);
      if (hasEstablishedProfile && !shouldUpdate) {
        return Promise.resolve({
          isNewAccount: false,
          user: backendUser,
          token: wx.getStorageSync("zionJwt")
        });
      }

      const finalName = nickNameInput || existingName;
      const finalAvatar = avatarInput || backendUser.avatarUrl || "";

      return isUsernameAvailable(finalName, accountId).then((available) => {
        const keepingOwnUsername = Boolean(existingName && finalName === existingName);
        if (!available && !keepingOwnUsername) {
          return Promise.reject(new Error("该用户名已被使用，请换一个"));
        }

        const uploadPromise = avatarInput && !/^https:\/\//.test(avatarInput)
          ? uploadImage(avatarInput)
          : Promise.resolve({
            url: finalAvatar,
            imageId: backendUser.avatarImageId || ""
          });

        return uploadPromise.then((uploaded) => saveAccountProfile({
          accountId,
          userName: finalName,
          avatarUrl: uploaded.url || finalAvatar,
          avatarImageId: uploaded.imageId ? String(uploaded.imageId) : "",
          role: backendUser.role || "customer",
          phone: backendUser.phone || ""
        })).then(() => getAccountProfile(accountId)).then((finalUser) => ({
          isNewAccount: !hasEstablishedProfile,
          user: finalUser,
          token: wx.getStorageSync("zionJwt")
        }));
      });
    });
}

function loginWithWechat(code, profile = {}) {
  if (!code) {
    return Promise.reject(new Error("缺少微信登录 code，请重新点击登录。"));
  }

  const loginPayload = {
    code,
    appid: WECHAT_APP_ID,
    profile: {
      nickName: profile.nickName || "",
      avatarUrl: profile.avatarUrl || "",
      loginAt: profile.loginAt || Date.now(),
      source: profile.source || "wechat-miniapp"
    },
    phoneCode: profile.phoneCode || "",
    phoneAuthAt: profile.phoneAuthAt || 0
  };

  return requestZionWechatMiniAppLogin(code).then((loginResult) => {
    const accountId = String(loginResult.account.id);
    const token = loginResult.jwt && loginResult.jwt.token ? loginResult.jwt.token : "";

    // 可选增强：如果拿到了微信手机号授权 code（付费能力开通后），走 Action Flow 换取真实手机号。
    const phoneExchange = profile.phoneCode
      ? requestWechatLoginActionFlow({
        login_code: code,
        phone_code: profile.phoneCode,
        nick_name: profile.nickName || "",
        avatar_url: profile.avatarUrl || "",
        raw_profile_json: { ...loginPayload, submittedAt: new Date().toISOString() }
      }, loginPayload).catch((error) => {
        console.warn("wechat phone code exchange failed", error);
        return null;
      })
      : Promise.resolve(null);

    return syncWechatProfileToAccount(accountId, profile)
      .then(() => phoneExchange)
      .then(() => getAccountProfile(accountId).catch(() => null))
      .then((backendUser) => ({
        actionFlowResult: null,
        token,
        user: backendUser && backendUser.id ? backendUser : {
          id: accountId,
          nickName: profile.nickName || loginResult.account.username || "微信用户",
          avatarUrl: profile.avatarUrl || loginResult.account.profileImageUrl || "",
          role: "customer",
          phone: loginResult.account.phoneNumber || ""
        },
        payload: loginPayload
      }));
  });
}

function getAccountProfile(accountId) {
  const resolvedAccountId = toDatabaseId(accountId);
  if (!resolvedAccountId) {
    return Promise.reject(new Error("missing account id"));
  }

  const query = `
    query GetAccountProfile($id: bigint!) {
      account_by_pk(id: $id) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;

  return graphql(query, { id: resolvedAccountId }).then((res) => normalizeAccount(res.data.account_by_pk));
}

function saveAccountProfile(profile = {}) {
  if (!profile.accountId) {
    return Promise.reject(new Error("missing account id"));
  }

  const getQuery = `
    query GetAccountProfile($id: bigint!) {
      account_by_pk(id: $id) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;
  const updateAccountQuery = `
    mutation SaveAccountProfile($id: bigint!, $data: account_set_input!) {
      update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;
  const insertProfileQuery = `
    mutation InsertAccountProfile($object: account_profile_insert_input!) {
      insert_account_profile_one(object: $object) {
        id
        user_name
        avatar_url
        avatar_image {
          id
          url
        }
        city
        address
        gender
        birthday
        phone
        wechat_avatar_url
        location_info
      }
    }
  `;
  const updateProfileQuery = `
    mutation UpdateAccountProfile($id: bigint!, $data: account_profile_set_input!) {
      update_account_profile_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        user_name
        avatar_url
        avatar_image {
          id
          url
        }
        city
        address
        gender
        birthday
        phone
        wechat_avatar_url
        location_info
      }
    }
  `;


  return graphql(getQuery, { id: Number(profile.accountId) }).then((accountRes) => {
    const currentAccount = accountRes.data.account_by_pk || {};
    const linkedProfile = currentAccount.account_profile && typeof currentAccount.account_profile === "object"
      ? currentAccount.account_profile
      : {};
    const currentProfile = {
      ...getStoredAccountProfile(
        currentAccount.oauth2_user_info_map && typeof currentAccount.oauth2_user_info_map === "object"
          ? currentAccount.oauth2_user_info_map
          : {}
      ),
      ...linkedProfile
    };
    const profileRecord = {
      ...currentProfile,
      user_name: profile.userName || "",
      avatar_url: profile.avatarUrl || "",
      region: profile.region || "",
      city: profile.region || "",
      address: profile.address || (profile.locationInfo && profile.locationInfo.address) || "",
      location_name: profile.locationName || (profile.locationInfo && profile.locationInfo.name) || "",
      latitude: profile.locationInfo && profile.locationInfo.latitude,
      longitude: profile.locationInfo && profile.locationInfo.longitude,
      location_info: profile.locationInfo || null,
      gender: profile.gender || "",
      birthday: profile.birthday || "",
      updated_at: new Date().toISOString()
    };
    const profileData = {
      user_name: profileRecord.user_name,
      avatar_url: profileRecord.avatar_url,
      city: profileRecord.city,
      address: profileRecord.address,
      gender: profileRecord.gender,
      birthday: profileRecord.birthday || null,
      phone: profile.phone || currentAccount.fz_phone_number || "",
      wechat_avatar_url: profileRecord.avatar_url,
      location_info: profileRecord.location_info
    };
    if (profile.avatarImageId) {
      profileData.avatar_image_id = Number(profile.avatarImageId);
    }
    const saveProfilePromise = currentAccount.account_profile_id
      ? graphql(updateProfileQuery, {
        id: Number(currentAccount.account_profile_id),
        data: profileData
      }).then((profileRes) => profileRes.data.update_account_profile_by_pk)
      : graphql(insertProfileQuery, { object: profileData }).then((profileRes) => profileRes.data.insert_account_profile_one);

    return saveProfilePromise.then((savedProfile) => {
      const nextRole = currentAccount.user_type === "manager"
        ? "manager"
        : (profile.role || currentAccount.user_type || "customer");
      const data = {
        // H5 OAuth uses this stable identifier to recover the same account.
        username: /^wxh5_[a-f0-9]{36}$/.test(currentAccount.username || "")
          ? currentAccount.username : (profile.userName || ""),
        wechat_nickname: profile.userName || "",
        wechat_avatar_url: profile.avatarUrl || "",
        user_type: nextRole,
        account_profile_id: savedProfile && savedProfile.id ? Number(savedProfile.id) : currentAccount.account_profile_id
      };

      return graphql(updateAccountQuery, {
        id: Number(profile.accountId),
        data
      });
    });
  }).then((res) => {
    const savedAccount = normalizeAccount(res.data.update_account_by_pk);
    // Staff capabilities and identity are maintained by the backend only.
    // Display names/avatars are read from the related account after profile save.
    return savedAccount;
  });
}

function createPaymentOrder(data = {}) {
  const query = `
    mutation CreateConsultationOrder($object: consultation_order_insert_input!) {
      insert_consultation_order_one(object: $object) {
        id
        order_no
        advisor_id
        amount
        duration_minutes
        status
        customer_account_id
        remark
        problem_category
        issue_summary
        booking_source
      }
    }
  `;
  const legacyQuery = `
    mutation CreateConsultationOrder($object: consultation_order_insert_input!) {
      insert_consultation_order_one(object: $object) {
        id
        order_no
        advisor_id
        amount
        duration_minutes
        status
      }
    }
  `;
  const orderNo = `EM${Date.now()}`;
  const object = {
    order_no: orderNo,
    advisor_id: data.advisorId ? Number(data.advisorId) : null,
    customer_account_id: data.customerAccountId ? Number(data.customerAccountId) : null,
    amount: data.price || data.amount || 200,
    duration_minutes: data.minutes || data.durationMinutes || 60,
    status: "created",
    payment_provider: "wechat",
    remark: data.remark || "",
    problem_category: data.problemCategory || data.category || "情感问答",
    issue_summary: data.issueSummary || data.remark || "",
    booking_source: data.source || "miniapp"
  };
  const legacyObject = {
    order_no: object.order_no,
    advisor_id: object.advisor_id,
    amount: object.amount,
    duration_minutes: object.duration_minutes,
    status: object.status,
    payment_provider: object.payment_provider,
    remark: object.remark
  };

  return graphql(query, {
    object
  }).catch((error) => {
    if (isSchemaCompatibilityError(error)) {
      return graphql(legacyQuery, { object: legacyObject });
    }
    throw error;
  }).then((res) => ({
    orderId: res.data.insert_consultation_order_one.id,
    orderNo,
    payParams: null
  }));
}

function confirmPayment(orderId) {
  const options = arguments[1] || {};
  const query = `
    mutation ConfirmPayment($id: bigint!, $data: consultation_order_set_input!) {
      update_consultation_order_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        paid_at
        chat_available_until
      }
    }
  `;
  const paidAt = new Date();
  const durationMinutes = options.minutes || options.durationMinutes || 60;
  const chatAvailableUntil = new Date(paidAt.getTime() + durationMinutes * 60 * 1000);

  return graphql(query, {
    id: Number(orderId),
    data: {
      status: "paid",
      paid_at: paidAt.toISOString(),
      chat_available_until: chatAvailableUntil.toISOString()
    }
  }).then((res) => reuseOrCreateConsultationSession({
    orderId,
    customerAccountId: options.customerAccountId,
    advisorId: options.advisorId,
    managerAccountId: options.managerAccountId,
    serviceProviderId: options.serviceProviderId,
    status: options.sessionStatus || "waiting",
    sessionStatus: options.sessionStatus || "waiting",
    minutes: durationMinutes,
    topic: options.topic,
    source: options.source || "miniapp",
    customerNickname: options.customerNickname,
    customerAvatarUrl: options.customerAvatarUrl
  }).catch(() => null).then((session) => ({
    ...res,
    session
  })));
}

function confirmSessionRenewal(orderId, options = {}) {
  const sessionId = options.sessionId || options.conversationId;
  if (!orderId || !sessionId) {
    return Promise.reject(new Error("missing order or session id"));
  }

  const paidAt = new Date();
  const durationMinutes = options.minutes || options.durationMinutes || 60;
  const updateOrderQuery = `
    mutation ConfirmRenewalOrder($id: bigint!, $data: consultation_order_set_input!) {
      update_consultation_order_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        paid_at
        chat_available_until
      }
    }
  `;
  const updateSessionQuery = `
    mutation RenewConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        order_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
      }
    }
  `;

  return getConsultationSession(sessionId).then(() => {
    const chatAvailableUntil = new Date(paidAt.getTime() + durationMinutes * 60 * 1000);
    const renewalData = {
      status: "paid",
      paid_at: paidAt.toISOString(),
      chat_available_until: chatAvailableUntil.toISOString()
    };
    const sessionData = {
      order_id: Number(orderId),
      started_at: null,
      expires_at: null,
      ended_at: null,
      status: "waiting"
    };

    return graphql(updateOrderQuery, {
      id: Number(orderId),
      data: renewalData
    }).then((orderRes) => graphql(updateSessionQuery, {
      id: Number(sessionId),
      data: sessionData
    }).then((sessionRes) => ({
      order: orderRes.data.update_consultation_order_by_pk,
      session: sessionRes.data.update_consultation_session_by_pk,
      expiresAt: ""
    })));
  });
}

function listCustomerMessagesForSessions(sessionIds = []) {
  const ids = (sessionIds || [])
    .map((id) => Number(id))
    .filter((id) => id && !Number.isNaN(id));
  if (!ids.length) {
    return Promise.resolve({ messagesBySession: {} });
  }

  const query = `
    query ListCustomerMessagesForSessions($sessionIds: [bigint!]!) {
      consultation_message(
        where: {
          session_id: { _in: $sessionIds },
          sender_role: { _eq: "customer" }
        }
        order_by: { id: asc }
        limit: 2000
      ) {
        id
        session_id
        sender_role
        sent_at
      }
    }
  `;

  return graphql(query, { sessionIds: ids }).then((res) => {
    const messagesBySession = {};
    (res.data.consultation_message || []).forEach((item) => {
      const sessionId = String(item.session_id);
      if (!messagesBySession[sessionId]) {
        messagesBySession[sessionId] = [];
      }
      messagesBySession[sessionId].push({
        id: String(item.id),
        sessionId,
        senderRole: item.sender_role,
        sentAt: item.sent_at
      });
    });
    return { messagesBySession };
  });
}

function normalizeConsultationMessage(item = {}) {
  return {
    id: String(item.id),
    sessionId: item.session_id ? String(item.session_id) : "",
    accountId: item.sender_account_id ? String(item.sender_account_id) : "",
    senderRole: item.sender_role || "",
    role: item.sender_role === "manager" ? "assistant" : "user",
    content: item.content || "",
    contentType: item.content_type || "text",
    sentAt: item.sent_at || "",
    isRecalled: !!item.is_recalled,
    recalledAt: item.recalled_at || "",
    recalledByAccountId: item.recalled_by_account_id ? String(item.recalled_by_account_id) : "",
    recalledContent: item.recalled_content || "",
    visibleToCustomer: item.visible_to_customer !== false,
    replacesMessageId: item.replaces_message_id ? String(item.replaces_message_id) : "",
    replacedByMessageId: item.replaced_by_message_id ? String(item.replaced_by_message_id) : ""
  };
}

function getConsultationMessageById(messageId) {
  if (!messageId) return Promise.resolve(null);

  const query = `
    query GetConsultationMessageById($id: bigint!) {
      consultation_message_by_pk(id: $id) {
        ${CONSULTATION_MESSAGE_FIELDS}
      }
    }
  `;

  return graphql(query, { id: Number(messageId) })
    .then((res) => {
      const row = res.data.consultation_message_by_pk;
      if (!row) return null;
      return normalizeConsultationMessage(row);
    })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        const legacyQuery = `
          query GetConsultationMessageById($id: bigint!) {
            consultation_message_by_pk(id: $id) {
              id
              session_id
              sender_account_id
              sender_role
              content
              content_type
              sent_at
            }
          }
        `;
        return graphql(legacyQuery, { id: Number(messageId) })
          .then((legacyRes) => {
            const row = legacyRes.data.consultation_message_by_pk;
            if (!row) return null;
            return normalizeConsultationMessage(row);
          });
      }
      throw error;
    });
}

function recallManagerMessage(messageId, managerAccountId) {
  return getConsultationMessageById(messageId)
    .then((message) => {
      if (!message || !message.id) {
        throw new Error("message not found");
      }
      if (message.senderRole !== "manager") {
        throw new Error("only manager messages can be recalled");
      }
      if (message.isRecalled) {
        throw new Error("already recalled");
      }
      const sentAt = message.sentAt ? new Date(message.sentAt).getTime() : 0;
      if (!sentAt || Date.now() - sentAt > MANAGER_RECALL_WINDOW_MS) {
        throw new Error("recall window expired");
      }
      if (
        managerAccountId
        && message.accountId
        && String(message.accountId) !== String(managerAccountId)
      ) {
        throw new Error("only sender can recall");
      }

      const recalledAt = new Date().toISOString();
      const query = `
        mutation RecallManagerMessage($id: bigint!, $data: consultation_message_set_input!) {
          update_consultation_message_by_pk(pk_columns: { id: $id }, _set: $data) {
            id
            is_recalled
            recalled_at
            recalled_by_account_id
            recalled_content
            visible_to_customer
            replaced_by_message_id
          }
        }
      `;

      return graphql(query, {
        id: Number(messageId),
        data: {
          is_recalled: true,
          recalled_at: recalledAt,
          recalled_by_account_id: managerAccountId ? Number(managerAccountId) : null,
          recalled_content: message.content || "",
          visible_to_customer: false,
          content: ""
        }
      }).then((res) => normalizeConsultationMessage(res.data.update_consultation_message_by_pk || {}));
    });
}

function resendRecalledManagerMessage(data = {}) {
  const replacesMessageId = data.replacesMessageId || data.replaceMessageId;
  if (!replacesMessageId) {
    return sendChatMessage(data.content, {
      sessionId: data.sessionId || data.conversationId,
      accountId: data.managerAccountId,
      senderRole: "manager",
      source: "manager-miniapp"
    });
  }

  return getConsultationMessageById(replacesMessageId)
    .then((original) => {
      if (!original || !original.id) {
        throw new Error("recall target not found");
      }
      if (!original.isRecalled) {
        throw new Error("message not recalled");
      }
      if (
        data.managerAccountId
        && original.recalledByAccountId
        && String(original.recalledByAccountId) !== String(data.managerAccountId)
      ) {
        throw new Error("recall owner mismatch");
      }

      const sessionId = data.sessionId || data.conversationId || original.sessionId;
      return getConsultationSession(sessionId)
        .then((session) => {
          if (!session) {
            throw new Error("session not found");
          }
          if (session.status === "closed") {
            throw new Error("session expired");
          }
          if (isServiceTimerActive(session)) {
            return session;
          }
          if (isServiceTimerStarted(session)) {
            throw new Error("session expired");
          }
          return startConsultationServiceTimer(session);
        })
        .then((session) => insertConsultationMessage(data.content, {
          sessionId: session.id,
          accountId: data.managerAccountId,
          senderRole: "manager",
          source: "manager-miniapp-reedit",
          replacesMessageId
        }).then((savedMessage) => {
        const query = `
          mutation LinkRecalledManagerMessage($id: bigint!, $data: consultation_message_set_input!) {
            update_consultation_message_by_pk(pk_columns: { id: $id }, _set: $data) {
              id
              replaced_by_message_id
            }
          }
        `;
        return graphql(query, {
          id: Number(replacesMessageId),
          data: {
            replaced_by_message_id: Number(savedMessage.id)
          }
        })
          .catch((error) => {
            if (isSchemaCompatibilityError(error)) {
              return null;
            }
            throw error;
          })
          .then(() => ({
            ...savedMessage,
            replacesMessageId: String(replacesMessageId)
          }));
        }));
    });
}

function getSessionMessages(sessionId, options = {}) {
  const resolvedSessionId = toDatabaseId(sessionId);
  if (!resolvedSessionId) return Promise.resolve({ messages: [] });
  const viewerRole = options.viewerRole || "customer";
  const where = { session_id: { _eq: resolvedSessionId } };
  if (viewerRole === "customer") {
    where.visible_to_customer = { _eq: true };
  }

  const query = `
    query GetSessionMessages($where: consultation_message_bool_exp!) {
      consultation_message(
        where: $where
        order_by: { sent_at: asc }
        limit: 500
      ) {
        ${CONSULTATION_MESSAGE_FIELDS}
      }
    }
  `;

  const legacyQuery = `
    query GetSessionMessages($sessionId: bigint!) {
      consultation_message(
        where: { session_id: { _eq: $sessionId } }
        order_by: { sent_at: asc }
        limit: 500
      ) {
        id
        session_id
        sender_account_id
        sender_role
        content
        content_type
        sent_at
      }
    }
  `;

  return graphql(query, { where })
    .then((res) => ({
      messages: (res.data.consultation_message || []).map((item) => normalizeConsultationMessage(item))
    }))
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { sessionId: resolvedSessionId }).then((legacyRes) => ({
          messages: (legacyRes.data.consultation_message || []).map((item) => normalizeConsultationMessage(item))
        }));
      }
      throw error;
    });
}

function isServiceTimerStarted(session = {}) {
  const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : 0;
  return !!(startedAt && !Number.isNaN(startedAt));
}

function isServiceTimerActive(session = {}) {
  if (!isServiceTimerStarted(session)) {
    return false;
  }
  const expiresAt = resolveEffectiveSessionExpiry(session);
  return expiresAt > Date.now();
}

function startConsultationServiceTimer(session = {}) {
  if (!session || !session.id) {
    return Promise.reject(new Error("missing session"));
  }
  if (isServiceTimerActive(session)) {
    return Promise.resolve(session);
  }
  const durationMinutes = Number(session.durationMinutes || 60);
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  return updateConsultationSession(session.id, {
    status: "active",
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastMessageAt: startedAt.toISOString()
  });
}

function resolveEffectiveSessionExpiry(session = {}) {
  if (!session) return 0;
  if (session.status === "closed" || session.endedAt) {
    const endedAt = session.endedAt ? new Date(session.endedAt).getTime() : 0;
    const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
    return endedAt || expiresAt || Date.now() - 1;
  }

  if (!isServiceTimerStarted(session)) {
    return 0;
  }

  const durationMinutes = Number(session.durationMinutes || 60);
  const durationMs = durationMinutes * 60 * 1000;
  const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
  const orderUntil = session.chatAvailableUntil ? new Date(session.chatAvailableUntil).getTime() : 0;
  const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : 0;

  let effective = 0;
  if (expiresAt && orderUntil) {
    effective = Math.min(expiresAt, orderUntil);
  } else {
    effective = expiresAt || orderUntil || 0;
  }

  if (startedAt && durationMs) {
    const startedBased = startedAt + durationMs;
    if (!effective || Number.isNaN(effective) || effective < startedAt) {
      effective = startedBased;
    }
  }

  return effective && !Number.isNaN(effective) ? effective : 0;
}

function getConsultationSession(sessionId) {
  if (!sessionId) return Promise.resolve(null);
  const query = `
    query GetConsultationSession($id: bigint!) {
      consultation_session_by_pk(id: $id) {
        id
        order_id
        customer_account_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;

  return graphql(query, { id: Number(sessionId) }).then((res) => {
    const session = res.data.consultation_session_by_pk;
    if (!session) return null;
    if (!session.order_id) {
      return normalizeConsultationSessionRow(session);
    }

    const orderQuery = `
      query GetConsultationOrderForSession($id: bigint!) {
        consultation_order_by_pk(id: $id) {
          duration_minutes
          chat_available_until
        }
      }
    `;

    return graphql(orderQuery, { id: Number(session.order_id) })
      .then((orderRes) => normalizeConsultationSessionRow({
        ...session,
        consultation_order: orderRes.data.consultation_order_by_pk
      }))
      .catch(() => normalizeConsultationSessionRow(session));
  });
}

function listManagerOrders(options = {}) {
  const query = `
    query ListManagerOrders {
      consultation_order(limit: 100, order_by: { created_at: desc }) {
        id
        created_at
        order_no
        customer_account_id
        advisor_id
        amount
        duration_minutes
        status
        paid_at
        chat_available_until
        remark
        problem_category
        issue_summary
        booking_source
      }
      consultation_session(limit: 100, order_by: { last_message_at: desc }) {
        id
        created_at
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const accountsById = (res.data.account || []).reduce((map, account) => {
      map[String(account.id)] = account;
      return map;
    }, {});
    const sessions = res.data.consultation_session || [];
    const sessionsByOrderId = sessions.reduce((map, session) => {
      if (session.order_id && !map[String(session.order_id)]) {
        map[String(session.order_id)] = session;
      }
      return map;
    }, {});
    const orders = (res.data.consultation_order || []).map((order) => (
      normalizeManagerOrder(order, sessionsByOrderId[String(order.id)] || {}, accountsById)
    ));
    const sessionOnlyOrders = sessions
      .filter((session) => !session.order_id)
      .map((session) => normalizeManagerOrder({}, session, accountsById));
    const records = orders.concat(sessionOnlyOrders);

    return { orders: records };
  });
}

function getManagerOrderDetail(params = {}) {
  const orderId = params.orderId ? String(params.orderId) : "";
  const sessionId = params.sessionId ? String(params.sessionId) : "";
  return listManagerOrders({}).then((result) => {
    const order = (result.orders || []).find((item) => (
      (orderId && item.orderId === orderId) || (sessionId && item.sessionId === sessionId)
    ));
    const resolvedSessionId = sessionId || (order && order.sessionId);
    return getSessionMessages(resolvedSessionId).then((messagesResult) => ({
      order: order || null,
      sessionId: resolvedSessionId,
      messages: messagesResult.messages || []
    }));
  });
}

function listManagerSessions(options = "waiting") {
  const filters = typeof options === "string" ? { status: options } : (options || {});
  const query = `
    query ListSessions {
      consultation_session(limit: 50) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
      consultation_order(limit: 100, order_by: { created_at: desc }) {
        id
        problem_category
        issue_summary
        amount
        duration_minutes
        chat_available_until
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;
  const legacyQuery = `
    query ListSessions {
      consultation_session(limit: 50) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        status
        started_at
        expires_at
        last_message_at
        topic
        customer_nickname
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;

  return graphql(query)
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery);
      }
      throw error;
    })
    .then((res) => {
      const accountsById = (res.data.account || []).reduce((map, account) => {
        map[String(account.id)] = account;
        return map;
      }, {});
      const ordersById = (res.data.consultation_order || []).reduce((map, order) => {
        map[String(order.id)] = order;
        return map;
      }, {});
      const sessions = (res.data.consultation_session || [])
        .map((item) => normalizeManagerSession(item, accountsById, ordersById))
        .filter((item) => {
          if (filters.serviceProviderId && item.serviceProviderId === String(filters.serviceProviderId)) {
            return true;
          }
          if (filters.managerAccountId && item.managerAccountId === String(filters.managerAccountId)) {
            return true;
          }
          return !filters.serviceProviderId && !filters.managerAccountId;
        });
      return { sessions };
    });
}

function acceptConsultationOrder(data = {}) {
  const sessionId = data.sessionId || data.conversationId || data.id;
  if (!sessionId || Number.isNaN(Number(sessionId))) {
    return Promise.resolve({ id: sessionId || "", status: "active", localOnly: true });
  }

  const acceptedAt = new Date();
  const query = `
    mutation AcceptConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        service_provider_id
        manager_account_id
        started_at
        last_message_at
        expires_at
      }
    }
  `;
  const legacyQuery = `
    mutation AcceptConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        manager_account_id
        started_at
        last_message_at
        expires_at
      }
    }
  `;
  const object = {
    status: "active",
    last_message_at: acceptedAt.toISOString()
  };

  if (data.serviceProviderId) {
    object.service_provider_id = Number(data.serviceProviderId);
  }
  if (data.managerAccountId) {
    object.manager_account_id = Number(data.managerAccountId);
  }

  const legacyObject = {
    status: object.status,
    last_message_at: object.last_message_at
  };
  if (object.manager_account_id) {
    legacyObject.manager_account_id = object.manager_account_id;
  }

  return graphql(query, { id: Number(sessionId), data: object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { id: Number(sessionId), data: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.update_consultation_session_by_pk);
}

function sendManagerReply(data) {
  if (data.replacesMessageId || data.replaceMessageId) {
    return resendRecalledManagerMessage(data);
  }
  return sendChatMessage(data.content, {
    sessionId: data.sessionId || data.conversationId,
    accountId: data.managerAccountId,
    senderRole: "manager",
    source: "manager-miniapp"
  });
}

module.exports = {
  PROJECT_ID,
  WECHAT_APP_ID,
  ZION_WEB_URL,
  ZION_GRAPHQL_URL,
  WECHAT_LOGIN_CLOUD_FUNCTION,
  WECHAT_LOGIN_BRIDGE_URL,
  CHAT_SESSION_STORAGE_KEY,
  graphql,
  listCourses,
  getCourse,
  listAdvisors,
  getAdvisor,
  getCustomerServiceBinding,
  resolveAdvisorServiceProvider,
  assertCanBookAdvisor,
  createCustomerServiceBinding,
  ensureCustomerServiceBinding,
  transferCustomerServiceBinding,
  listServiceProviders,
  getServiceProviderByAccount,
  createServiceProviderProfile,
  getDefaultManagerIdentity,
  createQuestion,
  getBoundConsultationSession,
  updateConsultationSession,
  reuseOrCreateConsultationSession,
  createConsultationSession,
  ensureConsultationSession,
  insertConsultationMessage,
  sendChatMessage,
  getSessionMessages,
  getConsultationMessageById,
  recallManagerMessage,
  resendRecalledManagerMessage,
  listCustomerMessagesForSessions,
  getConsultationSession,
  resolveEffectiveSessionExpiry,
  isServiceTimerStarted,
  startConsultationServiceTimer,
  listManagerOrders,
  getManagerOrderDetail,
  loginWithWechat,
  loginWithWechatIdentity,
  isUsernameAvailable,
  loginWithPhoneNumber,
  sendLoginVerificationCode,
  sendPhoneVerificationCode,
  bindPhoneNumberByCode,
  getAccountProfile,
  getCustomerAccountSummary,
  saveAccountProfile,
  uploadImage,
  createPaymentOrder,
  confirmPayment,
  confirmSessionRenewal,
  listManagerSessions,
  acceptConsultationOrder,
  sendManagerReply
};
