#!/usr/bin/env python3
"""Run a GraphQL query against the Zion runtime backend as admin.

Usage: python3 scripts/zion_gql.py <query_file.json>
The JSON file contains {"query": "...", "variables": {...}}.
The admin token is read from /tmp/zion_admin_token and never printed.
"""
import json
import sys
import urllib.request

ENDPOINT = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2"

def main():
    payload = json.load(open(sys.argv[1]))
    token = open("/tmp/zion_admin_token").read().strip()
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        headers={
            "content-type": "application/json",
            "Authorization": "Bearer " + token,
        },
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())
    print(json.dumps(body, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
