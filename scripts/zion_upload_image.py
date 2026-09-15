#!/usr/bin/env python3
"""Upload a local image to Zion asset storage and print its id and public URL.

Usage: python3 scripts/zion_upload_image.py <image_path>
Admin token is read from /tmp/zion_admin_token and never printed.
"""
import base64
import hashlib
import json
import sys
import urllib.request

ENDPOINT = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2"

def gql(payload, token):
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        headers={"content-type": "application/json", "Authorization": "Bearer " + token},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def main():
    path = sys.argv[1]
    token = open("/tmp/zion_admin_token").read().strip()
    data = open(path, "rb").read()
    md5b64 = base64.b64encode(hashlib.md5(data).digest()).decode()

    presign = gql({
        "query": """
          mutation($md5: String!, $suffix: MediaFormat!, $acl: CannedAccessControlList) {
            imagePresignedUrl(imgMd5Base64: $md5, imageSuffix: $suffix, acl: $acl) {
              imageId uploadUrl uploadHeaders
            }
          }
        """,
        "variables": {"md5": md5b64, "suffix": "JPEG", "acl": "PUBLIC_READ"},
    }, token)
    if presign.get("errors"):
        print(json.dumps(presign["errors"], ensure_ascii=False))
        sys.exit(1)
    info = presign["data"]["imagePresignedUrl"]
    image_id = info["imageId"]

    headers = info.get("uploadHeaders") or {}
    if isinstance(headers, str):
        headers = json.loads(headers)
    req = urllib.request.Request(info["uploadUrl"], data=data, method="PUT", headers=headers)
    with urllib.request.urlopen(req) as resp:
        assert 200 <= resp.status < 300, resp.status

    got = gql({
        "query": "query($id: bigint) { getImageById(imageId: $id) { id url } }",
        "variables": {"id": image_id},
    }, token)
    if got.get("errors"):
        print(json.dumps(got["errors"], ensure_ascii=False))
        sys.exit(1)
    result = got["data"]["getImageById"]
    print(json.dumps({"imageId": result["id"], "url": result["url"]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
