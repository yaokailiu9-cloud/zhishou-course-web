#!/usr/bin/env python3
"""Compile the existing 24 mini-program pages into a CSP-compatible browser bundle.
Never changes mini-program source files. No credentials or local data are bundled.
"""
from pathlib import Path
from html.parser import HTMLParser
import functools,json,re,shutil,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'web'/'replica';OUT.mkdir(parents=True,exist_ok=True)
expressions=[]

# The browser replica keeps a few web-only presentation choices without
# changing the original WeChat mini-program files.
WEB_TEXT_REPLACEMENTS=(
    ('免费 · ',''),
    ('免费',''),
    ('报名参加后，可申请线下咨询',''),
    ('\n到课核实后，可申请线下咨询。',''),
    ('；实际到课核实后，可申请线下咨询。','。'),
    ('到课核实后，可申请线下咨询。',''),
)

def class_names(node):
    return {
        name
        for part in (node.get('attrs',{}).get('class') or [])
        if isinstance(part,str)
        for name in part.split()
    }

def replace_web_text(text):
    return functools.reduce(lambda value,replacement:value.replace(*replacement),WEB_TEXT_REPLACEMENTS,text)

def patch_web_tree(route,nodes):
    for node in nodes:
        if 'text' in node:
            node['text']=[replace_web_text(part) if isinstance(part,str) else part for part in node['text']]
            node['text']=[part for part in node['text'] if part != '']
        children=node.get('children') or []
        if route=='pages/index/index' and 'home-paths' in class_names(node):
            children=[child for child in children if child.get('attrs',{}).get('bindtap') != ['goCustomerPortal']]
            node['children']=children
        if route=='pages/public-class/public-class' and {'card','course-card'} <= class_names(node):
            children=[child for child in children if not (
                child.get('tag')=='image' and 'course-cover' in class_names(child)
                or child.get('tag')=='view' and 'course-cover-fallback' in class_names(child)
            )]
            node['children']=children
        patch_web_tree(route,children)
    nodes[:]=[node for node in nodes if not (
        'text' in node and not node['text']
        or node.get('tag')=='text' and not node.get('children')
    )]

def value(s):
    parts=re.split(r'(\{\{[\s\S]*?\}\})',s or '')
    result=[]
    for p in parts:
        if p.startswith('{{') and p.endswith('}}'):
            expression=p[2:-2].strip()
            if expression not in expressions: expressions.append(expression)
            result.append({'e':expressions.index(expression)})
        elif p: result.append(p.replace('\\n','\n'))
    return result
class Wxml(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.root=[];self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        node={'tag':tag,'attrs':{k:value(v) for k,v in attrs},'children':[]};self.stack[-1].append(node);self.stack.append(node['children'])
    def handle_endtag(self,tag):
        if len(self.stack)>1:self.stack.pop()
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
    def handle_data(self,data):
        if data.strip():self.stack[-1].append({'text':value(data)})
def css(path):
    source=path.read_text()
    source=re.sub(r'@import\s+[\'"]([^\'"]+)[\'"];?',lambda m:css((path.parent/m[1]).resolve()),source)
    source=re.sub(r'(-?\d+(?:\.\d+)?)rpx',lambda m:'calc('+m[1]+' * var(--rpx))',source)
    source=re.sub(r'(?<![-\w.#])page(?=[\s{,:])','#page',source)
    source=re.sub(r'(?<![-\w.])image(?=[\s{,.:>\[])','img',source)
    return source.rstrip()+"\n"
config=json.loads((ROOT/'app.json').read_text());pages={};manifest={}
for route in config['pages']:
    path=ROOT/route;parser=Wxml();parser.feed(path.with_suffix('.wxml').read_text())
    patch_web_tree(route,parser.root)
    page_config=json.loads(path.with_suffix('.json').read_text())
    if 'navigationBarTitleText' in page_config:
        page_config['navigationBarTitleText']=replace_web_text(page_config['navigationBarTitleText'])
    pages[route]={'tree':parser.root,'config':page_config}
    (OUT/(route.split('/')[1]+'.css')).write_text(css(path.with_suffix('.wxss')))
    for suffix in ['.js','.wxml','.wxss','.json']:
        f=path.with_suffix(suffix);manifest[str(f.relative_to(ROOT))]=hashlib.sha256(f.read_bytes()).hexdigest()
(OUT/'base.css').write_text(css(ROOT/'app.wxss'))
modules=sorted((ROOT/'utils').rglob('*.js'))+[ROOT/(p+'.js') for p in config['pages']]
bundle=['/* Generated from original mini-program sources; run npm run build:web. */','window.MiniSource={config:'+json.dumps(config,ensure_ascii=False)+',pages:'+json.dumps(pages,ensure_ascii=False)+',expressions:[']
for expr in expressions:bundle.append('function(scope){with(scope){try{return ('+expr+')}catch(_){return undefined}}},')
bundle.append('],modules:{')
for f in modules:
    key=str(f.relative_to(ROOT)).removesuffix('.js');bundle.append(json.dumps(key)+':function(require,module,exports,Page,wx,getApp,getCurrentPages){\n'+f.read_text()+'\n},')
bundle.append('}};')
(OUT/'source.js').write_text('\n'.join(bundle).replace('免费',''))
(ROOT/'web'/'replica-manifest.json').write_text(json.dumps({'pages':config['pages'],'sha256':manifest},ensure_ascii=False,indent=2)+'\n')
assets=ROOT/'assets'
if assets.exists():shutil.copytree(assets,OUT/'assets',dirs_exist_ok=True)
print(f'Compiled {len(pages)} pages, {len(modules)} modules, {len(expressions)} expressions. Original mini-program untouched.')

# Content-version assets so deployed browsers cannot mix old and new adapters.
html=ROOT/'web'/'index.html'
if html.exists():
    fingerprint=hashlib.sha256(b''.join(p.read_bytes() for p in sorted(OUT.glob('*')) if p.is_file())).hexdigest()[:12]
    html.write_text(re.sub(r'v=[A-Za-z0-9-]+', 'v='+fingerprint, html.read_text()))
