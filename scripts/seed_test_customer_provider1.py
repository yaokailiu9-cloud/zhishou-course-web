#!/usr/bin/env python3
"""Seed test customer for customer page, served by service_provider id=1."""
import json
import subprocess
import sys
import time

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"

CUSTOMER_ACCOUNT_ID = 1000000000000002
CUSTOMER_NICKNAME = "测试客户小安"
CUSTOMER_AVATAR = "https://api.dicebear.com/7.x/thumbs/png?seed=test-customer-xiaoan"

SERVICE_PROVIDER_ID = 1
ADVISOR_ID = 5
MANAGER_ACCOUNT_ID = 1000000000000010

PROBLEM_CATEGORY = "恋爱情感"
ISSUE_SUMMARY = "我和男朋友最近总是吵架，感觉沟通越来越困难"
SERVICE_DURATION_SECONDS = 3600

CUSTOMER_MESSAGES = [
    "老师好，我和男朋友最近总是吵架。",
    "每次冷战我都很焦虑，不知道该怎么开口。",
    "我们最近一次是因为他回消息慢吵起来的。",
]
MANAGER_MESSAGES = [
    "你好，我在。我们先从最近一次争吵开始梳理。",
    "你刚才提到冷战和回消息慢，这两个点我们可以分开看。",
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
    payload = json.loads(proc.stdout)
    if isinstance(payload, dict) and payload.get("error"):
        raise RuntimeError(json.dumps(payload, ensure_ascii=False))
    return payload


def first_returning(payload, key="returning"):
    rows = payload.get(key) or []
    if not rows:
        raise RuntimeError(f"empty {key}: {json.dumps(payload, ensure_ascii=False)}")
    return rows[0]


def main():
    now = time.time()
    paid_at = time.strftime("%Y-%m-%dT%H:%M:%S+08:00", time.localtime(now))
    expires_at = time.strftime("%Y-%m-%dT%H:%M:%S+08:00", time.localtime(now + SERVICE_DURATION_SECONDS))
    order_no = f"TC{int(now * 1000)}"

    customer = first_returning(mcp_support("update", {
        "tableName": "account",
        "where": {"id": {"_eq": CUSTOMER_ACCOUNT_ID}},
        "set": {
            "username": CUSTOMER_NICKNAME,
            "wechat_nickname": CUSTOMER_NICKNAME,
            "wechat_avatar_url": CUSTOMER_AVATAR,
        },
        "fields": ["id", "username", "wechat_nickname", "wechat_avatar_url"],
    }))

    provider = first_returning(mcp_support("query", {
        "tableName": "service_provider",
        "where": {"id": {"_eq": SERVICE_PROVIDER_ID}},
        "limit": 1,
        "fields": ["id", "account_id", "advisor_id", "display_name", "service_status"],
    }), key="service_provider")

    existing_bindings = mcp_support("query", {
        "tableName": "customer_service_binding",
        "where": {"customer_account_id": {"_eq": CUSTOMER_ACCOUNT_ID}},
        "limit": 1,
        "fields": ["id", "customer_account_id", "advisor_id", "service_provider_id", "binding_status"],
    }).get("customer_service_binding") or []

    if existing_bindings:
        binding = first_returning(mcp_support("update", {
            "tableName": "customer_service_binding",
            "where": {"id": {"_eq": existing_bindings[0]["id"]}},
            "set": {
                "advisor_id": ADVISOR_ID,
                "service_provider_id": SERVICE_PROVIDER_ID,
                "binding_status": "ACTIVE",
                "bound_at": paid_at,
            },
            "fields": [
                "id", "customer_account_id", "advisor_id",
                "service_provider_id", "binding_status", "bound_at",
            ],
        }))
    else:
        binding = first_returning(mcp_support("insert", {
            "tableName": "customer_service_binding",
            "objects": [{
                "customer_account_id": CUSTOMER_ACCOUNT_ID,
                "advisor_id": ADVISOR_ID,
                "service_provider_id": SERVICE_PROVIDER_ID,
                "binding_status": "ACTIVE",
                "bound_at": paid_at,
            }],
            "fields": [
                "id", "customer_account_id", "advisor_id",
                "service_provider_id", "binding_status", "bound_at",
            ],
        }))

    binding_id = binding["id"]

    existing_sessions = mcp_support("query", {
        "tableName": "consultation_session",
        "where": {"customer_service_binding_id": {"_eq": binding_id}},
        "limit": 1,
        "fields": ["id", "order_id", "status", "expires_at", "customer_service_binding_id"],
    }).get("consultation_session") or []

    order = first_returning(mcp_support("insert", {
        "tableName": "consultation_order",
        "objects": [{
            "order_no": order_no,
            "advisor_id": ADVISOR_ID,
            "customer_account_id": CUSTOMER_ACCOUNT_ID,
            "amount": 200,
            "duration_minutes": 60,
            "status": "paid",
            "payment_provider": "wechat",
            "paid_at": paid_at,
            "chat_available_until": expires_at,
            "remark": ISSUE_SUMMARY,
            "problem_category": PROBLEM_CATEGORY,
            "issue_summary": ISSUE_SUMMARY,
            "booking_source": "miniapp-dev-test",
        }],
        "fields": [
            "id", "order_no", "customer_account_id", "advisor_id",
            "status", "paid_at", "chat_available_until", "problem_category", "issue_summary",
        ],
    }))

    session_payload = {
        "order_id": order["id"],
        "customer_account_id": CUSTOMER_ACCOUNT_ID,
        "advisor_id": ADVISOR_ID,
        "manager_account_id": MANAGER_ACCOUNT_ID,
        "service_provider_id": SERVICE_PROVIDER_ID,
        "customer_service_binding_id": binding_id,
        "status": "waiting",
        "last_message_at": paid_at,
        "topic": ISSUE_SUMMARY,
        "session_source": "miniapp-dev-test",
        "customer_nickname": CUSTOMER_NICKNAME,
        "customer_avatar_url": CUSTOMER_AVATAR,
    }

    if existing_sessions:
        session = first_returning(mcp_support("update", {
            "tableName": "consultation_session",
            "where": {"id": {"_eq": existing_sessions[0]["id"]}},
            "set": session_payload,
            "fields": [
                "id", "order_id", "customer_account_id", "service_provider_id",
                "customer_service_binding_id", "status", "expires_at", "topic",
            ],
        }))
    else:
        session = first_returning(mcp_support("insert", {
            "tableName": "consultation_session",
            "objects": [session_payload],
            "fields": [
                "id", "order_id", "customer_account_id", "service_provider_id",
                "customer_service_binding_id", "status", "expires_at", "topic",
            ],
        }))

    session_id = session["id"]

    mcp_support("delete", {
        "tableName": "consultation_message",
        "where": {"session_id": {"_eq": session_id}},
        "allowDeleteAll": False,
    })

    inserted_messages = []
    for index, content in enumerate(CUSTOMER_MESSAGES, start=1):
        sent_at = time.strftime(
            "%Y-%m-%dT%H:%M:%S+08:00",
            time.localtime(now + index),
        )
        row = first_returning(mcp_support("insert", {
            "tableName": "consultation_message",
            "objects": [{
                "session_id": session_id,
                "sender_account_id": CUSTOMER_ACCOUNT_ID,
                "sender_role": "customer",
                "content": content,
                "content_type": "text",
                "message_source": "miniapp-dev-test",
                "delivery_status": "saved",
                "sent_at": sent_at,
            }],
            "fields": ["id", "content", "sender_role", "session_id", "sent_at"],
        }))
        inserted_messages.append(row)

    for index, content in enumerate(MANAGER_MESSAGES, start=1):
        sent_at = time.strftime(
            "%Y-%m-%dT%H:%M:%S+08:00",
            time.localtime(now + 10 + index),
        )
        row = first_returning(mcp_support("insert", {
            "tableName": "consultation_message",
            "objects": [{
                "session_id": session_id,
                "sender_account_id": MANAGER_ACCOUNT_ID,
                "sender_role": "manager",
                "content": content,
                "content_type": "text",
                "message_source": "miniapp-dev-test",
                "delivery_status": "saved",
                "sent_at": sent_at,
            }],
            "fields": ["id", "content", "sender_role", "session_id", "sent_at"],
        }))
        inserted_messages.append(row)

    print(json.dumps({
        "customerAccount": customer,
        "serviceProvider": provider,
        "customerServiceBinding": binding,
        "consultationOrder": order,
        "consultationSession": session,
        "messageCount": len(inserted_messages),
        "miniProgramHints": {
            "customerLoginAccountId": CUSTOMER_ACCOUNT_ID,
            "managerLoginAccountId": MANAGER_ACCOUNT_ID,
            "consultationSessionId": session_id,
            "consultationOrderId": order["id"],
            "serviceProviderId": SERVICE_PROVIDER_ID,
            "bindingId": binding_id,
        },
        "notes": [
            "客户页：account 1000000000000002（测试客户小安）",
            "经理页：account 1000000000000010（刘曜恺 / service_provider 1）",
            "customer_service_binding 与 consultation_session 已通过 customer_service_binding_id 1:1 绑定。",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"seed failed: {error}", file=sys.stderr)
        sys.exit(1)
