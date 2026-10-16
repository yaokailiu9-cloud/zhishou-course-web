const test=require('node:test'),assert=require('node:assert/strict'),{Readable}=require('node:stream');
const gateway=require('../../server/h5/hls-gateway');
const IV='0x'+'1'.repeat(32),KEY='0123456789abcdef0123456789abcdef';
const playlist=(extra='')=>'#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXT-X-KEY:METHOD=AES-128,URI="zskey://24/1",IV='+IV+'\n#EXTINF:6.000000,\nhttps://fz-zion-static.functorz.com/2026/x/project/1/files/a.ts\n'+extra+'#EXT-X-ENDLIST\n';
const request=input=>Readable.from([JSON.stringify(input)]);
function response(){const r={status:0,headers:{},body:null,writeHead(s,h){r.status=s;r.headers=h||{}},end(b){r.body=b}};return r;}
const get=path=>{const res=response();gateway.serveHls({method:'GET'},res,path);return res;};

test('HLS 中转只接受课程播放列表的格式，拒绝外部分片地址和错误密钥',()=>{
 assert.ok(gateway.checkedPlaylist({lessonId:'24',version:1,key:KEY,playlist:playlist()}));
 for(const input of[{lessonId:'24',version:1,key:'xyz',playlist:playlist()},{lessonId:'24',version:1,key:KEY,playlist:playlist('#EXTINF:6,\nhttps://evil.example/a.ts\n')},{lessonId:'25',version:1,key:KEY,playlist:playlist()},{lessonId:'24',version:1,key:KEY,playlist:'#EXTM3U\n#EXT-X-ENDLIST\n'}])
  assert.throws(()=>gateway.checkedPlaylist(input),/INPUT:/);
});
test('HLS 中转返回同源短期地址，密钥地址改为本次会话并限制读取次数',async()=>{
 const {url}=await gateway.createHlsSession(request({lessonId:'24',version:1,key:KEY,playlist:playlist()}));
 assert.match(url,/^\/api\/hls\/[A-Za-z0-9_-]{24}\.m3u8$/);
 const list=get(url);assert.equal(list.status,200);assert.equal(list.headers['content-type'],'application/vnd.apple.mpegurl');assert.equal(list.headers['cache-control'],'no-store');
 assert.doesNotMatch(list.body,/zskey:/);const keyPath=list.body.match(/URI="([^"]+)"/)[1];assert.equal(keyPath,url.replace('.m3u8','.key'));
 const key=get(keyPath);assert.equal(key.status,200);assert.equal(Buffer.compare(key.body,Buffer.from(KEY,'hex')),0);
 for(let i=1;i<60;i++)get(keyPath);assert.equal(get(keyPath).status,403);
 assert.equal(get('/api/hls/'+'A'.repeat(24)+'.m3u8').status,404);assert.equal(get('/api/hls/../../etc/passwd').status,404);
 gateway._sessions.get(url.slice(9,33)).expires=Date.now()-1;assert.equal(get(url).status,404);
});
