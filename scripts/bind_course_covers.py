#!/usr/bin/env python3
"""Bind Zion cover_image assets to course rows (reuse serenity preview images)."""
import json
import subprocess
import sys

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"

# serenityImages[0], [2], [1], [0], [2], [1] -> already in Zion asset library
COURSE_COVERS = [
    {"id": 1, "cover_image_id": 1020000000000001},
    {"id": 2, "cover_image_id": 1020000000000003},
    {"id": 3, "cover_image_id": 1020000000000002},
    {"id": 4, "cover_image_id": 1020000000000001},
    {"id": 5, "cover_image_id": 1020000000000003},
    {"id": 6, "cover_image_id": 1020000000000002},
]


def mcp_support(action, args):
    cmd = [
        "npx", "-y", "zion-mcp@2.0.21",
        "--cwd", WORKDIR,
        "support", action,
        "--args", json.dumps(args, ensure_ascii=False),
    ]
    env = {"NPM_CONFIG_CACHE": NPM_CACHE, **dict(__import__("os").environ)}
    proc = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if proc.returncode != 0:
        raise RuntimeError(proc.stdout + proc.stderr)
    return json.loads(proc.stdout)


def main():
    updated = []
    for row in COURSE_COVERS:
        res = mcp_support("update", {
            "tableName": "course",
            "where": {"id": {"_eq": row["id"]}},
            "set": {"cover_image_id": row["cover_image_id"]},
        })
        updated.append({"course_id": row["id"], "cover_image_id": row["cover_image_id"], "result": res})
    print(json.dumps({"updated": updated}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"update failed: {error}", file=sys.stderr)
        sys.exit(1)
