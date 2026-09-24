const ZION_MEMBER_GRAPHQL_URL = 'https://zion-app.functorz.com/zero/bZ7yl9DZ4YY/api/graphql-v2';
const MEMBER_ID_PATTERN = /^\d{5,6}$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

const CHECK_MEMBER_QUERY = `query CheckId($id: String!) {
  users: ud_yonghuxinxi_89e7ab(
    where: {_eq: {text_operand: {left_operand: {column: ud_id002fchaxun_fb7c4b}, right_operand: {literal: $id}}}}
    limit: 1
  ) { id }
  whitelist: ud_gongzhonghaoxueyuanbaimingdan_9a7b8b(
    where: {_eq: {text_operand: {left_operand: {column: ud_id_4c38d0}, right_operand: {literal: $id}}}}
    limit: 1
  ) { id }
}`;

const visitors = new Map();

function clientAddress(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(req, now = Date.now()) {
  const address = clientAddress(req);
  const current = visitors.get(address);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    visitors.set(address, {count: 1, startedAt: now});
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function plain(res, status, value, extraHeaders = {}) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
    ...extraHeaders
  });
  res.end(value);
}

async function checkMemberStatus(id, fetchImpl = global.fetch) {
  const response = await fetchImpl(ZION_MEMBER_GRAPHQL_URL, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({query: CHECK_MEMBER_QUERY, variables: {id}}),
    signal: AbortSignal.timeout(8_000)
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (_) {
    throw new Error('ZION_MEMBER_LOOKUP_INVALID_RESPONSE');
  }
  if (!response.ok || payload.errors || !payload.data) {
    throw new Error('ZION_MEMBER_LOOKUP_FAILED');
  }
  const users = Array.isArray(payload.data.users) ? payload.data.users : [];
  const whitelist = Array.isArray(payload.data.whitelist) ? payload.data.whitelist : [];
  return users.length > 0 || whitelist.length > 0;
}

async function handleMemberStatus(req, res, url) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '600'
    });
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    plain(res, 405, '0', {allow: 'GET, OPTIONS'});
    return;
  }
  const id = String(url.searchParams.get('id') || '').trim();
  if (!MEMBER_ID_PATTERN.test(id)) {
    plain(res, 400, '0');
    return;
  }
  if (isRateLimited(req)) {
    plain(res, 429, '0', {'retry-after': '60'});
    return;
  }
  try {
    plain(res, 200, (await checkMemberStatus(id)) ? '1' : '0');
  } catch (error) {
    console.error('member status lookup failed:', error && error.message ? error.message : error);
    plain(res, 502, '0', {'x-member-check-error': 'upstream'});
  }
}

module.exports = {
  CHECK_MEMBER_QUERY,
  MEMBER_ID_PATTERN,
  ZION_MEMBER_GRAPHQL_URL,
  checkMemberStatus,
  handleMemberStatus
};
