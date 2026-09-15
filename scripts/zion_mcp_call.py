#!/usr/bin/env python3
"""Call a zion-mcp tool over stdio JSON-RPC.

Usage: python3 scripts/zion_mcp_call.py <tool_name> '<json_arguments>' [more tool/arg pairs...]
Runs set_current_project first, then each requested tool in one MCP session.
"""
from pathlib import Path
import json
import select
import subprocess
import sys
import time

WORKDIR = str(Path(__file__).resolve().parents[1])
PROJECT_EX_ID = "JmAxbl1MMe4"

proc = subprocess.Popen(
    ["/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.1.6/bin/zion-mcp", "mcp"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    cwd=WORKDIR,
)
next_id = [0]

def send(obj):
    proc.stdin.write((json.dumps(obj) + "\n").encode())
    proc.stdin.flush()

def read_until(msg_id, timeout=180):
    end = time.time() + timeout
    while time.time() < end:
        r, _, _ = select.select([proc.stdout], [], [], 0.5)
        if not r:
            continue
        line = proc.stdout.readline()
        if not line:
            break
        try:
            msg = json.loads(line)
        except Exception:
            continue
        if msg.get("id") == msg_id:
            return msg
    return None

def call(name, arguments, timeout=180):
    next_id[0] += 1
    rid = next_id[0]
    send({"jsonrpc": "2.0", "id": rid, "method": "tools/call",
          "params": {"name": name, "arguments": arguments}})
    return read_until(rid, timeout)

def main():
    send({"jsonrpc": "2.0", "id": 100000, "method": "initialize",
          "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                      "clientInfo": {"name": "cli", "version": "1.0"}}})
    read_until(100000, 60)
    send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    res = call("set_current_working_directory", {"directory": WORKDIR}, 60)
    res = call("set_current_project", {"projectExId": PROJECT_EX_ID}, 120)

    args = sys.argv[1:]
    outputs = []
    for i in range(0, len(args), 2):
        tool = args[i]
        arguments = json.loads(args[i + 1]) if i + 1 < len(args) else {}
        res = call(tool, arguments)
        outputs.append({"tool": tool, "response": res})
    print(json.dumps(outputs, ensure_ascii=False, indent=2))
    proc.terminate()

if __name__ == "__main__":
    main()
