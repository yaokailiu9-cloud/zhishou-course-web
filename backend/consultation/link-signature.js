// SHA-256 / HMAC-SHA-256 for the synchronous GraalJS sandbox (no Node crypto).
// Link keys are derived with a separate purpose string; payment signatures are unchanged.
function linkUtf8(value){var s=unescape(encodeURIComponent(String(value))),a=[];for(var i=0;i<s.length;i++)a.push(s.charCodeAt(i));return a;}
function linkSha256(bytes){
 var k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 var h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],data=bytes.slice(),bits=bytes.length*8;
 data.push(128);while(data.length%64!==56)data.push(0);for(var z=7;z>=0;z--)data.push(z>=4?Math.floor(bits/Math.pow(2,z*8))&255:(bits>>>z*8)&255);
 function r(x,n){return (x>>>n)|(x<<(32-n));}
 for(var offset=0;offset<data.length;offset+=64){
  var w=[];for(var i=0;i<16;i++)w[i]=(data[offset+i*4]<<24)|(data[offset+i*4+1]<<16)|(data[offset+i*4+2]<<8)|data[offset+i*4+3];
  for(i=16;i<64;i++){var x=w[i-15],y=w[i-2];w[i]=(w[i-16]+(r(x,7)^r(x,18)^(x>>>3))+w[i-7]+(r(y,17)^r(y,19)^(y>>>10)))|0;}
  var a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],v=h[7];
  for(i=0;i<64;i++){var t1=(v+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+k[i]+w[i])|0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0;v=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}
  var out=[a,b,c,d,e,f,g,v];for(i=0;i<8;i++)h[i]=(h[i]+out[i])|0;
 }
 var result=[];for(var j=0;j<8;j++)for(var shift=24;shift>=0;shift-=8)result.push((h[j]>>>shift)&255);return result;
}
function linkHmac(key,message){var b=linkUtf8(key);if(b.length>64)b=linkSha256(b);while(b.length<64)b.push(0);var inner=b.map(function(v){return v^54;}),outer=b.map(function(v){return v^92;});return linkSha256(outer.concat(linkSha256(inner.concat(linkUtf8(message))))).map(function(v){return ('0'+v.toString(16)).slice(-2);}).join('');}
function linkEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;var diff=0;for(var i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
