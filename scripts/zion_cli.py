#!/usr/bin/env python3
"""Invoke the installed official Zion plugin. JSON outputs stay in a local work folder."""
import json, os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
PLUGIN = Path('/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.1.6')
def run(*args):
    env = dict(os.environ, PLUGIN_ROOT=str(PLUGIN))
    p = subprocess.run([str(PLUGIN/'bin/zion-mcp'), *args], cwd=ROOT, env=env, text=True, capture_output=True, timeout=180)
    if p.returncode:
        raise RuntimeError(p.stderr or p.stdout)
    return json.loads(p.stdout)
def call(items):
    result=run('schema','tool-call','--toolCalls',json.dumps(items,ensure_ascii=False))
    if result.get('errors'): raise RuntimeError(str(result['errors']))
    return result
if __name__=='__main__':
    if sys.argv[1]=='call':
        result=call(json.loads(Path(sys.argv[2]).read_text()))
        target=Path(sys.argv[3])
    else:
        target=Path(sys.argv[1]); result=run(*sys.argv[2:])
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print('Saved '+str(target))
