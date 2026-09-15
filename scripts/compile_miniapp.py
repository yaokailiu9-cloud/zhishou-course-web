"""Compile the native app with the installed official WeChat compilers."""
import json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bin=Path('/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec')
out=root/'.codex-work/course-reference';out.mkdir(parents=True,exist_ok=True)
reports=[]
for compiler,extension in [('wcc','wxml'),('wcsc','wxss')]:
 files=[str(p.relative_to(root)) for p in root.glob('pages/**/*.'+extension)]
 if extension=='wxss':files+=['app.wxss']+[str(p.relative_to(root)) for p in root.glob('styles/*.wxss')]
 p=subprocess.run([str(bin/compiler),*files],cwd=root,capture_output=True,text=True)
 (out/(compiler+'-compiled.js')).write_text(p.stdout)
 reports.append({'compiler':compiler,'files':len(files),'passed':p.returncode==0,'errors':p.stderr})
(out/'compile-results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
print(json.dumps(reports,ensure_ascii=False));raise SystemExit(any(not r['passed'] for r in reports))
