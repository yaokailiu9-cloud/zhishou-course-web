#!/usr/bin/env python3
"""Repair account rows whose oauth2_user_info_map was polluted with account_profile.

Usage:
  python3 scripts/repair_oauth2_accounts.py

Uses Zion MCP supportservice_graphql (admin). Safe to re-run.
"""
import json
import subprocess
import sys

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
MCP = [sys.executable, "scripts/zion_mcp_call.py", "supportservice_graphql"]


def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    proc = subprocess.run(
        MCP + [json.dumps(payload, ensure_ascii=False)],
        cwd=WORKDIR,
        capture_output=True,
        text=True,
        check=True,
    )
    outer = json.loads(proc.stdout)
    inner = json.loads(outer[0]["response"]["result"]["content"][0]["text"])
    return inner


def main():
    data = gql(
        """
        query ListAccounts {
          account(limit: 200) {
            id
            wechat_openid
            oauth2_user_info_map
          }
        }
        """
    )
    repaired = 0
    for row in data.get("account") or []:
        info_map = row.get("oauth2_user_info_map") or {}
        if not isinstance(info_map, dict):
            continue
        wechat = info_map.get("WECHAT") or info_map.get("wechat")
        polluted = "account_profile" in info_map or "serenity_profile" in info_map
        open_id = ""
        if isinstance(wechat, dict):
            open_id = wechat.get("openId") or wechat.get("openid") or ""
        needs_openid = not row.get("wechat_openid") and open_id
        if not polluted and not needs_openid:
            continue

        clean_map = {}
        if isinstance(wechat, dict):
            clean_map["WECHAT"] = {
                "type": wechat.get("type") or "WechatOAuth2UserInfo",
                "openId": open_id or wechat.get("openId") or wechat.get("openid") or "",
            }
            if wechat.get("sessionKey"):
                clean_map["WECHAT"]["sessionKey"] = wechat["sessionKey"]

        mutation = """
        mutation RepairAccount($id: bigint!, $data: account_set_input!) {
          update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
            id
            wechat_openid
          }
        }
        """
        patch = {"oauth2_user_info_map": clean_map}
        if needs_openid:
            patch["wechat_openid"] = open_id
        result = gql(mutation, {"id": row["id"], "data": patch})
        updated = result.get("update_account_by_pk")
        if updated:
            repaired += 1
            print(f"repaired account {updated['id']} openid={updated.get('wechat_openid')}")

    print(f"done, repaired {repaired} account(s)")


if __name__ == "__main__":
    main()
