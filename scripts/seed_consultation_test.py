#!/usr/bin/env python3
"""Seed a fresh consultation order/session and test messages for aspect join verification."""
import json
import subprocess
import sys
import time

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"

CUSTOMER_ACCOUNT_ID = 1000000000000010
CUSTOMER_NICKNAME = "测试客户小安"
ADVISOR_ID = 8
SERVICE_PROVIDER_ID = 2
MANAGER_ACCOUNT_ID = 1000000000000002
PROBLEM_CATEGORY = "恋爱情感"
ISSUE_SUMMARY = "我和男朋友最近总是吵架，感觉沟通越来越困难"
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
    return json.loads(proc.stdout)


def main():
    paid_at = time.strftime("%Y-%m-%dT%H:%M:%S+08:00")
    expires_at = time.strftime("%Y-%m-%dT%H:%M:%S+08:00", time.localtime(time.time() + 3600))
    order_no = f"EM{int(time.time() * 1000)}"

    order_res = mcp_support("insert", {
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
        "fields": ["id", "order_no", "problem_category", "issue_summary"],
    })
    order = order_res["returning"][0]
    order_id = order["id"]

    session_res = mcp_support("insert", {
        "tableName": "consultation_session",
        "objects": [{
            "order_id": order_id,
            "customer_account_id": CUSTOMER_ACCOUNT_ID,
            "advisor_id": ADVISOR_ID,
            "manager_account_id": MANAGER_ACCOUNT_ID,
            "service_provider_id": SERVICE_PROVIDER_ID,
            "status": "waiting",
            "last_message_at": paid_at,
            "topic": ISSUE_SUMMARY,
            "session_source": "miniapp-dev-test",
            "customer_nickname": CUSTOMER_NICKNAME,
        }],
        "fields": ["id", "order_id", "status", "topic"],
    })
    session = session_res["returning"][0]
    session_id = session["id"]

    mcp_support("update", {
        "tableName": "consultation_session",
        "where": {"id": {"_eq": session_id}},
        "set": {
            "status": "active",
            "manager_account_id": MANAGER_ACCOUNT_ID,
            "service_provider_id": SERVICE_PROVIDER_ID,
            "last_message_at": paid_at,
        },
    })

    inserted = []
    for index, content in enumerate(CUSTOMER_MESSAGES, start=1):
        sent_at = time.strftime(
            "%Y-%m-%dT%H:%M:%S+08:00",
            time.localtime(time.time() + index),
        )
        row = mcp_support("insert", {
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
            "fields": ["id", "content", "sender_role", "sent_at"],
        })["returning"][0]
        inserted.append(row)

    for index, content in enumerate(MANAGER_MESSAGES, start=1):
        sent_at = time.strftime(
            "%Y-%m-%dT%H:%M:%S+08:00",
            time.localtime(time.time() + 10 + index),
        )
        row = mcp_support("insert", {
            "tableName": "consultation_message",
            "objects": [{
                "session_id": session_id,
                "sender_account_id": MANAGER_ACCOUNT_ID,
                "sender_role": "manager",
                "content": content,
                "content_type": "text",
                "message_source": "manager-miniapp-dev-test",
                "delivery_status": "saved",
                "sent_at": sent_at,
            }],
            "fields": ["id", "content", "sender_role", "sent_at"],
        })["returning"][0]
        inserted.append(row)
        if index == 1:
            timer_started_at = sent_at
            timer_expires_at = time.strftime(
                "%Y-%m-%dT%H:%M:%S+08:00",
                time.localtime(time.time() + 10 + index + 3600),
            )
            mcp_support("update", {
                "tableName": "consultation_session",
                "where": {"id": {"_eq": session_id}},
                "set": {
                    "status": "active",
                    "started_at": timer_started_at,
                    "expires_at": timer_expires_at,
                    "last_message_at": sent_at,
                },
            })

    timer_started = bool(MANAGER_MESSAGES)
    miniapp_storage = {
        "consultationOrderId": str(order_id),
        "consultationSessionId": str(session_id),
        "consultationTopic": ISSUE_SUMMARY,
        "currentChatRole": "customer",
    }
    if timer_started:
        miniapp_storage["currentSessionStartedAt"] = timer_started_at
        miniapp_storage["currentSessionStartedSessionId"] = str(session_id)
        miniapp_storage["currentSessionExpiresAt"] = timer_expires_at
        miniapp_storage["currentSessionExpiresSessionId"] = str(session_id)
        miniapp_storage["paidUntil"] = str(int((time.time() + 3610) * 1000))

    result = {
        "orderId": order_id,
        "orderNo": order_no,
        "sessionId": session_id,
        "problemCategory": PROBLEM_CATEGORY,
        "issueSummary": ISSUE_SUMMARY,
        "customerAccountId": CUSTOMER_ACCOUNT_ID,
        "managerAccountId": MANAGER_ACCOUNT_ID,
        "serviceProviderId": SERVICE_PROVIDER_ID,
        "messageCount": len(inserted),
        "miniappStorage": miniapp_storage,
        "deviceSteps": [
            "1. 在 profile 页用微信登录（会创建/复用 customer account 并写入 zionJwt）",
            "2. 进入 advisor 详情页支付，或把 miniappStorage 写入开发者工具 Storage 后直接进 chat",
            "3. 经理端从 profile 进入工作台，接单 sessionId 后回复",
        ],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"seed failed: {error}", file=sys.stderr)
        sys.exit(1)
