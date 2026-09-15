"""Bounded referral smoke test using only the project's isolated fixture accounts."""
import json
from pathlib import Path

from consultation_runtime_test import FID, admin_token, gql
from zion_request import request


def login(actor):
    result = gql(
        "mutation H5ReferralLogin($u:String!,$p:String!){authenticateWithUsername(username:$u,password:$p,register:false){account{id}jwt{token}}}",
        {"u": actor["username"], "p": actor["password"]},
    )["authenticateWithUsername"]
    return {"id": result["account"]["id"], "token": result["jwt"]["token"]}


def invoke(actor, operation, payload=None):
    raw = gql(
        f'mutation H5ReferralService($args:Json!){{fz_invoke_action_flow(actionFlowId:"{FID}",versionId:1,args:$args)}}',
        {"args": {"operation": operation, "payload": payload or {}}},
        actor["token"],
    )["fz_invoke_action_flow"]
    result = json.loads(raw) if isinstance(raw, str) else raw
    return result.get("result", result) if isinstance(result, dict) else result


def blocked_direct_read(token):
    response = request({"query": "query DirectReferralRead{course_referral(limit:1){id}}"}, token)
    return bool(response.get("errors")) or not (response.get("data") or {}).get("course_referral")


def main():
    fixtures = json.loads((Path(__file__).resolve().parents[1] / ".codex-work/consultation/runtime-fixtures.json").read_text())
    customer = login(fixtures["actors"]["customer"])
    referrer = login(fixtures["actors"]["otherCustomer"])
    cleanup_token = admin_token()
    cleanup_query = "mutation CleanupH5Referral($where:course_referral_bool_exp!){delete_course_referral(where:$where){affected_rows}}"
    where = {"_eq": {"bigint_operand": {"left_operand": {"column": "referred_account_id"}, "right_operand": {"literal": customer["id"]}}}}
    gql(cleanup_query, {"where": where}, cleanup_token)
    try:
        first = invoke(customer, "LOCK_REFERRER", {"referrerId": referrer["id"]})
        repeated = invoke(customer, "LOCK_REFERRER", {"referrerId": fixtures["actors"]["teacher"]["id"]})
        mine = invoke(referrer, "MY_REFERRALS")
        status = invoke(customer, "MY_REFERRAL_STATUS")
        result = {
            "anonymous_direct_read_blocked": blocked_direct_read(None),
            "logged_in_direct_read_blocked": blocked_direct_read(customer["token"]),
            "first_lock_created": first["data"]["locked"] is True,
            "repeat_did_not_rebind": repeated["data"]["locked"] is False and str(repeated["data"]["binding"]["referrer_id"]) == str(referrer["id"]),
            "referrer_sees_direct_user": any(str(item["referred_account_id"]) == str(customer["id"]) for item in mine["data"]["items"]),
            "referred_user_sees_binding": str(status["data"]["binding"]["referrer_id"]) == str(referrer["id"]),
        }
        if not all(result.values()):
            raise RuntimeError(json.dumps(result, ensure_ascii=False))
        print(json.dumps(result, ensure_ascii=False))
    finally:
        gql(cleanup_query, {"where": where}, cleanup_token)


if __name__ == "__main__":
    main()
