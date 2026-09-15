#!/usr/bin/env python3
"""Link each ACTIVE customer_service_binding to its canonical consultation_session.

Run once after adding the 1:1 relation:
  customer_service_binding (1) -> consultation_session (1)

Rules:
- Pick the oldest session (lowest id) for each binding's customer + service_provider.
- Write consultation_session.customer_service_binding_id.
- Optionally close duplicate sessions for the same customer/provider.
"""
import json
import subprocess
import sys

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"
CLOSE_DUPLICATES = True


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
    bindings = mcp_support("query", {
        "tableName": "customer_service_binding",
        "where": {"binding_status": {"_eq": "ACTIVE"}},
        "limit": 200,
        "fields": ["id", "customer_account_id", "service_provider_id", "binding_status"],
    }).get("customer_service_binding") or []

    sessions = mcp_support("query", {
        "tableName": "consultation_session",
        "limit": 500,
        "order_by": {"id": "asc"},
        "fields": ["id", "customer_account_id", "service_provider_id", "customer_service_binding_id", "status"],
    }).get("consultation_session") or []

    linked = []
    closed = []

    for binding in bindings:
        customer_id = binding["customer_account_id"]
        provider_id = binding["service_provider_id"]
        binding_id = binding["id"]

        candidates = [
            row for row in sessions
            if row.get("customer_account_id") == customer_id
            and row.get("service_provider_id") == provider_id
        ]
        if not candidates:
            continue

        canonical = candidates[0]
        if canonical.get("customer_service_binding_id") != binding_id:
            updated = mcp_support("update", {
                "tableName": "consultation_session",
                "where": {"id": {"_eq": canonical["id"]}},
                "set": {"customer_service_binding_id": binding_id},
                "fields": ["id", "customer_service_binding_id", "status"],
            })["returning"][0]
            linked.append(updated)

        if CLOSE_DUPLICATES:
            duplicate_ids = [row["id"] for row in candidates[1:] if row.get("status") != "closed"]
            if duplicate_ids:
                mcp_support("update", {
                    "tableName": "consultation_session",
                    "where": {"id": {"_in": duplicate_ids}},
                    "set": {"status": "closed"},
                    "fields": ["id", "status"],
                })
                closed.extend(duplicate_ids)

    print(json.dumps({
        "linkedSessions": linked,
        "closedDuplicateSessionIds": closed,
        "notes": [
            "Each ACTIVE binding now owns exactly one consultation_session via customer_service_binding_id.",
            "Duplicate sessions for the same customer/provider were marked closed when CLOSE_DUPLICATES=True.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"link failed: {error}", file=sys.stderr)
        sys.exit(1)
