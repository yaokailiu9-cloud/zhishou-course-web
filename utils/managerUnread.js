const STORAGE_KEY = "managerSessionReadCursor";

function getReadCursors() {
  const stored = wx.getStorageSync(STORAGE_KEY);
  return stored && typeof stored === "object" ? stored : {};
}

function getReadCursor(sessionId) {
  return Number(getReadCursors()[String(sessionId)] || 0);
}

function markSessionRead(sessionId, lastMessageId) {
  if (!sessionId || !lastMessageId) return;
  const nextId = Number(lastMessageId);
  if (!nextId || Number.isNaN(nextId)) return;
  const cursors = getReadCursors();
  const prevId = Number(cursors[String(sessionId)] || 0);
  if (nextId <= prevId) return;
  cursors[String(sessionId)] = String(nextId);
  wx.setStorageSync(STORAGE_KEY, cursors);
}

function markSessionReadFromMessages(sessionId, messages) {
  if (!sessionId || !Array.isArray(messages) || !messages.length) return;
  const maxId = messages.reduce((max, item) => {
    const id = Number(item.id);
    return id > max ? id : max;
  }, 0);
  if (maxId) {
    markSessionRead(sessionId, maxId);
  }
}

function countUnreadCustomerMessages(sessionId, customerMessages) {
  const cursor = getReadCursor(sessionId);
  return (customerMessages || []).filter((item) => Number(item.id) > cursor).length;
}

function sumUnreadCounts(items) {
  return (items || []).reduce((total, item) => total + Number(item.unreadCount || 0), 0);
}

module.exports = {
  STORAGE_KEY,
  getReadCursors,
  getReadCursor,
  markSessionRead,
  markSessionReadFromMessages,
  countUnreadCustomerMessages,
  sumUnreadCounts
};
