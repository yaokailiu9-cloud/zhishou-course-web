// Bind asynchronous UI work to the identity and conversation that started it.
function capture() {
  const user = wx.getStorageSync('userInfo') || {};
  return {
    accountId: String(user.id || ''),
    token: wx.getStorageSync('zionJwt') || '',
    sessionId: String(wx.getStorageSync('consultationSessionId') || ''),
    role: wx.getStorageSync('currentChatRole') || 'customer'
  };
}
function current(snapshot, conversation = false) {
  const now = capture();
  return !!snapshot && snapshot.accountId === now.accountId && snapshot.token === now.token
    && (!conversation || (snapshot.sessionId === now.sessionId && snapshot.role === now.role));
}
module.exports = { capture, current };
