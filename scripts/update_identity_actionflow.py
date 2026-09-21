"""Update only the identity authorization node, preserving concurrent service-flow edits."""
import json
from pathlib import Path

from zion_cli import call, run

PROJECT_ID = "JmAxbl1MMe4"
FLOW_ID = "9f60a0be-4628-4268-a769-661264846cf4"
NODE_ID = "h4i3zzuex"

state = run("schema", "load")
assert state["projectExId"] == PROJECT_ID, "Wrong project; no changes applied"

detail = call([{
    "name": "GET_ACTION_FLOW_DETAIL",
    "args": {"actionFlowId": FLOW_ID},
}])["responses"][0]
assert f"id: {NODE_ID}\n    type: CUSTOM_CODE" in detail, "Identity node mismatch"

code = (
    Path("backend/consultation/common.js").read_text()
    + "\n"
    + Path("backend/consultation/authorize.js").read_text()
)
result = call([{
    "name": "UPDATE_ACTION_FLOW_NODE",
    "args": {
        "actionFlowId": FLOW_ID,
        "nodeId": NODE_ID,
        "config": {"type": "CUSTOM_CODE", "code": code},
    },
}])
validation = run("schema", "validate")

output = Path(".codex-work/identity-management")
output.mkdir(parents=True, exist_ok=True)
(output / "actionflow-update.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
(output / "schema-validation.json").write_text(json.dumps(validation, ensure_ascii=False, indent=2))

print("Updated only the identity authorization node; backend not synchronized.")
print(json.dumps(validation, ensure_ascii=False))
