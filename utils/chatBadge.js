// Unread direct messages across every archive the reader can open, shown on the 聊天 tab.
const service = require('./consultationService');
const auth = require('./auth');
const CHAT_TAB_INDEX = 2;
const REFRESH_MS = 30000;
let shown = 0, inflight = null, lastAt = 0, timer = null;

function apply(total) {
  const count = Math.max(0, Number(total) || 0);
  if (count === shown) return;
  shown = count;
  try {
    if (count > 0) wx.setTabBarBadge({ index: CHAT_TAB_INDEX, text: count > 99 ? '99+' : String(count), fail() {} });
    else wx.removeTabBarBadge({ index: CHAT_TAB_INDEX, fail() {} });
  } catch (_) {}
}

function refresh(force) {
  // The web build hides the 聊天 tab from accounts without an archive; they skip the count entirely.
  const hidden = typeof wx.chatTabVisible === 'function' && !wx.chatTabVisible();
  if (!auth.isLoggedIn() || hidden) { apply(0); return Promise.resolve(0); }
  if (!timer) timer = setInterval(() => refresh(true), REFRESH_MS);
  if (inflight) return inflight;
  if (!force && Date.now() - lastAt < 10000) return Promise.resolve(shown);
  lastAt = Date.now();
  const token = wx.getStorageSync('zionJwt');
  inflight = service.call('SERVICE_CHAT_UNREAD')
    .then((r) => { if (wx.getStorageSync('zionJwt') === token) apply(r && r.total); return shown; })
    .catch(() => shown)
    .finally(() => { inflight = null; });
  return inflight;
}

module.exports = { apply, refresh };
