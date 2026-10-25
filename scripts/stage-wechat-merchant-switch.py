"""Patch only the verified payment section, preserving concurrent live handlers.

Credentials must be saved through Zion's native secret dialog and bound to the
existing code node inputs; no plaintext secret is read by this script.
"""
import json, os, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = os.environ.get('ZION_CLI', '/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.8.0/bin/zion-mcp')
CWD = os.environ.get('ZION_PROJECT_CWD', str(ROOT))
OUT = ROOT / '.codex-work/merchant-switch'
OUT.mkdir(parents=True, exist_ok=True)

def run(*args):
    p = subprocess.run([CLI, *args], cwd=CWD, env={**os.environ, 'MCP_LOG_FILE':'off'}, capture_output=True, text=True, timeout=180)
    if p.returncode:
        raise RuntimeError('Zion command failed; inspect local diagnostics without printing credentials')
    return json.loads(p.stdout)

state = run('schema', 'load')
assert state['projectExId'] == 'JmAxbl1MMe4'
snapshot = run('schema', 'snapshot', '--args', '{"full":true}')
flow = next(f for f in snapshot['server']['actionFlows'] if f['uniqueId'] == '9f60a0be-4628-4268-a769-661264846cf4')
node = next(n for n in flow['allNodes'] if n['uniqueId'] == 'sui9sl3ko')
assert node['type'] == 'CUSTOM_CODE'
for name in ['wechat_pay_key', 'guanzhishou_pay_key', 'guanzhishou_app_secret']:
    inp = next(i for i in node['inputs'] if i['name'] == name)
    assert 'secretConfigId' in json.dumps(inp['value']), 'Secret binding missing: ' + name
code = node['code']
start = code.index('// Runs inside the transactional Zion action flow.')
end = code.rindex("context.setReturn('state',s);")
link_start, link_end = '// INTERNAL_PURCHASE_LINKS_START', '// INTERNAL_PURCHASE_LINKS_END'
block = code[code.index(link_start):code.index(link_end)+len(link_end)]
marker = '// PURCHASE_LINK_HANDLERS: build inserts link-signature.js and purchase-links.js here.'
old = subprocess.check_output(['git','show','HEAD:backend/consultation/course-payment.js'], cwd=ROOT, text=True)
canonical = code[start:end].replace(block, marker)
# Only insignificant blank-line differences are accepted. Never overwrite an
# unfamiliar live payment change or the private purchase-link handlers.
normalize = lambda s: '\n'.join(line for line in s.strip().splitlines() if line.strip())
new = (ROOT/'backend/consultation/course-payment.js').read_text()
assert normalize(canonical) in [normalize(old), normalize(new)], 'Live payment code changed; review the new snapshot first'
replacement = new.replace(marker, block)
assert replacement.count("PAY_MERCHANT='1119085869'") == 1
updated = code[:start] + replacement + '\n' + code[end:]
(OUT/'node-before-merchant-switch.js').write_text(code)
(OUT/'node-after-merchant-switch.js').write_text(updated)
result = run('schema','tool-call','--toolCalls',json.dumps([{'name':'UPDATE_ACTION_FLOW_NODE','args':{
    'actionFlowId':flow['uniqueId'], 'nodeId':node['uniqueId'], 'config':{'type':'CUSTOM_CODE','code':updated}
}}],ensure_ascii=False))
assert not result.get('errors'), str(result.get('errors'))
validation = run('schema','validate')
(OUT/'validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2))
print(json.dumps({'staged':True,'project':state['projectExId'],'merchantId':'1119085869','appId':'wx8daa76a8eb887e47','validation':validation},ensure_ascii=False))
