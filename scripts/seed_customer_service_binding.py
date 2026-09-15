#!/usr/bin/env python3
"""Link advisors to service providers and optionally seed a customer binding."""
import json
import subprocess
import sys
import time

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"

# Default test mapping: advisor 5 (曜恺) -> service_provider 1
ADVISOR_ID = 5
SERVICE_PROVIDER_ID = 1

# Leave empty to skip creating a pre-bound customer row.
CUSTOMER_ACCOUNT_ID = None
# Example: CUSTOMER_ACCOUNT_ID = 1000000000000010


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
    provider_res = mcp_support("update", {
        "tableName": "service_provider",
        "where": {"id": {"_eq": SERVICE_PROVIDER_ID}},
        "set": {"advisor_id": ADVISOR_ID},
        "fields": ["id", "advisor_id", "display_name"],
    })
    provider = (provider_res.get("returning") or [{}])[0]

    binding = None
    if CUSTOMER_ACCOUNT_ID:
        bound_at = time.strftime("%Y-%m-%dT%H:%M:%S+08:00")
        existing = mcp_support("query", {
            "tableName": "customer_service_binding",
            "where": {
                "customer_account_id": {"_eq": CUSTOMER_ACCOUNT_ID},
                "binding_status": {"_eq": "ACTIVE"},
            },
            "limit": 1,
            "fields": ["id", "customer_account_id", "advisor_id", "service_provider_id"],
        })
        rows = existing.get("rows") or []
        if rows:
            binding = mcp_support("update", {
                "tableName": "customer_service_binding",
                "where": {"id": {"_eq": rows[0]["id"]}},
                "set": {
                    "advisor_id": ADVISOR_ID,
                    "service_provider_id": SERVICE_PROVIDER_ID,
                    "binding_status": "ACTIVE",
                    "bound_at": bound_at,
                },
                "fields": ["id", "customer_account_id", "advisor_id", "service_provider_id", "binding_status"],
            })["returning"][0]
        else:
            binding = mcp_support("insert", {
                "tableName": "customer_service_binding",
                "objects": [{
                    "customer_account_id": CUSTOMER_ACCOUNT_ID,
                    "advisor_id": ADVISOR_ID,
                    "service_provider_id": SERVICE_PROVIDER_ID,
                    "binding_status": "ACTIVE",
                    "bound_at": bound_at,
                }],
                "fields": ["id", "customer_account_id", "advisor_id", "service_provider_id", "binding_status"],
            })["returning"][0]

    print(json.dumps({
        "serviceProvider": provider,
        "customerBinding": binding,
        "notes": [
            "客户首次支付成功后会自动写入 customer_service_binding。",
            "已绑定客户不能再预约其他答主；仅 admin/super_admin 可调用 transferCustomerServiceBinding。",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"seed failed: {error}", file=sys.stderr)
        sys.exit(1)
