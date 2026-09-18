const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {handleApi, handleOauthCallback} = require('./server/h5');

const WEB_ROOT = path.join(__dirname, 'web');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), {'content-type': 'application/json; charset=utf-8'});
}

function staticFile(pathname) {
  const requestPath = pathname === '/web' || pathname === '/web/'
    ? 'index.html'
    : pathname.slice('/web/'.length) + (pathname.endsWith('/') ? 'index.html' : '');
  let decoded;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch (_) {
    return null;
  }
  const file = path.resolve(WEB_ROOT, decoded || 'index.html');
  return file === WEB_ROOT || file.startsWith(`${WEB_ROOT}${path.sep}`) ? file : null;
}

async function serveWeb(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', {allow: 'GET, HEAD'});
    return;
  }
  const file = staticFile(pathname);
  if (!file) {
    send(res, 404, 'Not Found');
    return;
  }
  try {
    const content = await fs.readFile(file);
    const type = MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    send(res, 200, req.method === 'HEAD' ? '' : content, {
      'content-type': type,
      'cache-control': path.extname(file) === '.html' ? 'no-store' : 'public, max-age=3600',
      'x-content-type-options': 'nosniff'
    });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      send(res, 404, 'Not Found');
      return;
    }
    send(res, 500, 'Internal Server Error');
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/') {
      res.writeHead(302, {location: '/web/'});
      res.end();
      return;
    }
    if (url.pathname === '/healthz') {
      json(res, 200, {ok: true, service: 'zhishou-course-web'});
      return;
    }
    if (url.pathname === '/api/h5') {
      await handleApi(req, res);
      return;
    }
    if (url.pathname === '/api/wechat-oauth-callback') {
      await handleOauthCallback(req, res);
      return;
    }
    if (url.pathname === '/web' || url.pathname === '/web/' || url.pathname.startsWith('/web/')) {
      await serveWeb(req, res, url.pathname);
      return;
    }
    json(res, 404, {ok: false, message: '路径不存在'});
  });
}

function startServer() {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => {
    console.log(`zhishou-course-web listening on ${port}`);
  });
}

module.exports = {createServer, serveWeb, staticFile};

if (require.main === module) startServer();
