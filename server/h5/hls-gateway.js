// Short-lived HLS relay for native players (iPhone) that cannot take the playlist and key from page memory.
// The page posts what COURSE_VIEW_ACCESS already gave it, so nothing here talks to Zion or widens access:
// the relay only turns that playlist into same-origin URLs that expire, and caps how often the key is read.
const crypto = require("crypto");

const TTL_MS = 4 * 60 * 60 * 1000;
const MAX_SESSIONS = 2000;
const MAX_KEY_READS = 60;
const MAX_BODY = 1024 * 1024;
const SEGMENT_ORIGIN = "https://fz-zion-static.functorz.com/";
const sessions = new Map();

function prune(now = Date.now()) {
  for (const [id, session] of sessions) if (session.expires <= now) sessions.delete(id);
  while (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
}

async function readInput(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error("INPUT:播放列表过长");
  }
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { throw new Error("INPUT:请求格式无效"); }
}

// Accept only the playlist shape COURSE_VIEW_ACCESS builds: one AES-128 key on zskey://lesson/version and Zion segment URLs.
function checkedPlaylist(input) {
  const lessonId = String(input.lessonId || ""), version = String(input.version || ""), key = String(input.key || ""), playlist = String(input.playlist || "");
  if (!/^[1-9][0-9]{0,15}$/.test(lessonId) || !/^[1-9][0-9]{0,8}$/.test(version) || !/^[0-9a-f]{32}$/i.test(key)) throw new Error("INPUT:播放信息无效");
  const keyLine = `#EXT-X-KEY:METHOD=AES-128,URI="zskey://${lessonId}/${version}",`;
  const lines = playlist.split("\n").map(line => line.trim()).filter(Boolean);
  if (lines[0] !== "#EXTM3U" || lines[lines.length - 1] !== "#EXT-X-ENDLIST") throw new Error("INPUT:播放列表无效");
  if (lines.filter(line => line.startsWith("#EXT-X-KEY")).length !== 1 || !lines.some(line => line.startsWith(keyLine) && /,IV=0x[0-9a-f]{32}$/i.test(line))) throw new Error("INPUT:播放列表无效");
  if (!lines.every(line => line.startsWith("#") || (line.startsWith(SEGMENT_ORIGIN) && !/[\s"'<>]/.test(line)))) throw new Error("INPUT:播放列表无效");
  return {lines, keyLine, key};
}

async function createHlsSession(req) {
  const {lines, keyLine, key} = checkedPlaylist(await readInput(req));
  prune();
  const id = crypto.randomBytes(18).toString("base64url");
  const playlist = lines.map(line => line.startsWith(keyLine) ? line.replace(/URI="[^"]+"/, `URI="/api/hls/${id}.key"`) : line).join("\n") + "\n";
  sessions.set(id, {playlist, key: Buffer.from(key, "hex"), expires: Date.now() + TTL_MS, keyReads: 0});
  return {url: `/api/hls/${id}.m3u8`};
}

function serveHls(req, res, pathname) {
  const match = pathname.match(/^\/api\/hls\/([A-Za-z0-9_-]{24})\.(m3u8|key)$/);
  const headers = {"cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer"};
  const session = match && sessions.get(match[1]);
  if (req.method !== "GET" || !session || session.expires <= Date.now()) {
    res.writeHead(match && req.method !== "GET" ? 405 : 404, headers);
    return res.end();
  }
  if (match[2] === "m3u8") {
    res.writeHead(200, {...headers, "content-type": "application/vnd.apple.mpegurl"});
    return res.end(session.playlist);
  }
  if (++session.keyReads > MAX_KEY_READS) {
    res.writeHead(403, headers);
    return res.end();
  }
  res.writeHead(200, {...headers, "content-type": "application/octet-stream"});
  return res.end(session.key);
}

module.exports = {createHlsSession, serveHls, checkedPlaylist, _sessions: sessions};
