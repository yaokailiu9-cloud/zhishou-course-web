#!/usr/bin/env python3
"""Invoke the project-pinned Zion CLI. JSON outputs stay in a local work folder."""
import json, os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
CLI = ['npx', '-y', 'zion-mcp@2.7.8']
def run(*args):
    p = subprocess.run([*CLI, *args], cwd=ROOT, env=os.environ.copy(), text=True, capture_output=True, timeout=180)
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
