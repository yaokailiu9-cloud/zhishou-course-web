const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const source = path.join(root, "web");
const target = path.join(root, "public", "web");

fs.rmSync(target, {recursive:true, force:true});
fs.mkdirSync(path.dirname(target), {recursive:true});
fs.cpSync(source, target, {recursive:true});

console.log("Copied web/ to public/web/ for Vercel static hosting");
