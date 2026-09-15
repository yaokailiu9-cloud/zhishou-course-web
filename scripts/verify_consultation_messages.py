#!/usr/bin/env python3
"""Verify each consultation_message joins to order problem_category / issue_summary."""
import json
import subprocess
import sys

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"
SESSION_ID = sys.argv[1] if len(sys.argv) > 1 else ""


def mcp_graphql(query):
    payload = {"query": query}
    cmd = [
        "npx", "-y", "zion-mcp@2.0.21",
        "--cwd", WORKDIR,
        "support", "graphql",
        "--args", json.dumps(payload, ensure_ascii=False),
    ]
    env = {"NPM_CONFIG_CACHE": NPM_CACHE, **dict(__import__("os").environ)}
    proc = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if proc.returncode != 0:
        raise RuntimeError(proc.stdout + proc.stderr)
    body = json.loads(proc.stdout)
    if body.get("errors"):
        raise RuntimeError(json.dumps(body["errors"], ensure_ascii=False))
    if "data" in body:
        return body.get("data") or {}
    return body


def main():
    if SESSION_ID:
        message_block = f"""
        consultation_message(
          where: {{ session_id: {{ _eq: {int(SESSION_ID)} }} }}
          order_by: {{ sent_at: asc }}
          limit: 500
        ) {{
          id
          session_id
          sender_role
          content
          sent_at
        }}
        """
    else:
        message_block = """
        consultation_message(order_by: { sent_at: asc }, limit: 500) {
          id
          session_id
          sender_role
          content
          sent_at
        }
        """

    data = mcp_graphql(f"""
      query VerifyConsultationMessages {{
        {message_block}
        consultation_session(limit: 200) {{
          id
          order_id
          topic
          customer_nickname
        }}
        consultation_order(limit: 200, order_by: {{ created_at: desc }}) {{
          id
          problem_category
          issue_summary
        }}
      }}
    """)

    sessions_by_id = {str(item["id"]): item for item in data.get("consultation_session") or []}
    orders_by_id = {str(item["id"]): item for item in data.get("consultation_order") or []}
    rows = []
    for message in data.get("consultation_message") or []:
        session = sessions_by_id.get(str(message.get("session_id") or ""), {})
        order = orders_by_id.get(str(session.get("order_id") or ""), {})
        rows.append({
            "messageId": message.get("id"),
            "sessionId": message.get("session_id"),
            "senderRole": message.get("sender_role"),
            "content": message.get("content"),
            "sentAt": message.get("sent_at"),
            "orderId": session.get("order_id"),
            "problemCategory": order.get("problem_category"),
            "issueSummary": order.get("issue_summary"),
            "sessionTopic": session.get("topic"),
            "joinOk": bool(order.get("problem_category") and order.get("issue_summary")),
        })

    summary = {
        "sessionFilter": SESSION_ID or "all",
        "totalMessages": len(rows),
        "joinedMessages": sum(1 for row in rows if row["joinOk"]),
        "missingJoin": [row for row in rows if not row["joinOk"]],
        "rows": rows,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if rows and summary["joinedMessages"] != summary["totalMessages"]:
        sys.exit(2)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"verify failed: {error}", file=sys.stderr)
        sys.exit(1)
