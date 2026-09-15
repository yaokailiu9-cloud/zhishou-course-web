#!/usr/bin/env python3
"""Seed course + course_lesson rows from utils/mock.js preview data."""
import json
import subprocess
import sys

WORKDIR = "/Users/nidie/Desktop/（情感对话）"
NPM_CACHE = "/Users/nidie/.npm-cache-nidie"

COURSES = [
  {
    "title": "亲密关系沟通基础课",
    "subtitle": "从冷战到有效对话的 7 天重建练习",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDBE_PpklCTtMGNoNVwm3yme4DRCG6Qnty1vXOqewa3CEEIh2cKakWLJwFF-Oxx3QqnJ-vb6Xp3BhrA9Qu-2RQdpCghzmMCWrPQ7CNFlWAVOHKJDmrn3uF-jmPgHA_ANMPI1l1G-yk3bnI2Cfl9v8SPCE0HvUlkDgbuezV2r6HqVI1ZebBXr7VWjQsSiBfI36QmOcbBJb7dXbjjI2WporIAGqCVvbmMhiW-JfDpidd0uNU5CisITK0q",
    "duration_text": "6小时32分",
    "badge": "热门",
    "sort_order": 1,
    "lessons": [
      {"title": "第一课：识别关系中的沟通陷阱", "duration_text": "18:20", "sort_order": 1},
      {"title": "第二课：从指责到表达的转换", "duration_text": "24:05", "sort_order": 2},
      {"title": "第三课：倾听与共情的练习", "duration_text": "21:40", "sort_order": 3},
      {"title": "第四课：冲突后的修复对话", "duration_text": "28:15", "sort_order": 4},
    ],
  },
  {
    "title": "情绪内耗自救指南",
    "subtitle": "减少反复想、睡不着、情绪起伏大的日常训练",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBiB_dUldghqVAFH9x7xl68EMKFzJO40A3O38yr4vgLP1yfs-yXGaKtXAzO7bAY9qd86oTtaYp7DtII7hfy_r4hgyBGNAexKUJ3GyZONPnLUznJWazL7OPZ_7S80hMsj-9zMaWTcMX-ISH8f8WxiiN1MTC_ezmCsOjMfmKJ3AmMUtKWzhv-yDBj41SWwNU4KoDjRY38LEaXBbGoqlt93ZeeVFl7iECyWp2Q8_kudnHZFdNE8-KJafT8",
    "duration_text": "4小时18分",
    "badge": "推荐",
    "sort_order": 2,
    "lessons": [
      {"title": "第一课：什么是情绪内耗", "duration_text": "12:30", "sort_order": 1},
      {"title": "第二课：情绪命名的力量", "duration_text": "16:45", "sort_order": 2},
      {"title": "第三课：睡前放松三步法", "duration_text": "19:20", "sort_order": 3},
    ],
  },
  {
    "title": "分手后关系复盘课",
    "subtitle": "理性看待分手，找到下一段关系的起点",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA9_hUSdMgi6jnKGVCWE-5ZMF7o1klgpOx2i80YuVhQ6kwahRb9A8Tkxh4xT2vWGDudT9l-NKrardzgYcFPj0g38oHLa0bWu12aQ4TFpgCPeixdLOpLJFmgat_y1c-rFy4SJIQDSuOW4EdUV05gV_2NoDFmnsHQ6QAVLGx3BPp7w9MLYjXMgMGQpjIO6OSH3Dsrn6ZpEyfoufN5rEKzsT2e_Q5PBemGfWCjmKrjyYbPtlJNHnrmRWyM",
    "duration_text": "5小时06分",
    "badge": "",
    "sort_order": 3,
    "lessons": [
      {"title": "第一课：分手后的情绪周期", "duration_text": "15:10", "sort_order": 1},
      {"title": "第二课：复盘不是翻旧账", "duration_text": "22:35", "sort_order": 2},
    ],
  },
  {
    "title": "婚恋关系安全感建立",
    "subtitle": "减少控制与试探，建立稳定信任",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDBE_PpklCTtMGNoNVwm3yme4DRCG6Qnty1vXOqewa3CEEIh2cKakWLJwFF-Oxx3QqnJ-vb6Xp3BhrA9Qu-2RQdpCghzmMCWrPQ7CNFlWAVOHKJDmrn3uF-jmPgHA_ANMPI1l1G-yk3bnI2Cfl9v8SPCE0HvUlkDgbuezV2r6HqVI1ZebBXr7VWjQsSiBfI36QmOcbBJb7dXbjjI2WporIAGqCVvbmMhiW-JfDpidd0uNU5CisITK0q",
    "duration_text": "7小时12分",
    "badge": "新课",
    "sort_order": 4,
    "lessons": [
      {"title": "第一课：你的依恋风格是什么", "duration_text": "20:00", "sort_order": 1},
      {"title": "第二课：焦虑型依恋的调节", "duration_text": "26:40", "sort_order": 2},
    ],
  },
  {
    "title": "职场压力与情绪边界",
    "subtitle": "工作再累，也不把情绪全部带回家",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBiB_dUldghqVAFH9x7xl68EMKFzJO40A3O38yr4vgLP1yfs-yXGaKtXAzO7bAY9qd86oTtaYp7DtII7hfy_r4hgyBGNAexKUJ3GyZONPnLUznJWazL7OPZ_7S80hMsj-9zMaWTcMX-ISH8f8WxiiN1MTC_ezmCsOjMfmKJ3AmMUtKWzhv-yDBj41SWwNU4KoDjRY38LEaXBbGoqlt93ZeeVFl7iECyWp2Q8_kudnHZFdNE8-KJafT8",
    "duration_text": "3小时45分",
    "badge": "",
    "sort_order": 5,
    "lessons": [
      {"title": "第一课：情绪边界是什么", "duration_text": "14:20", "sort_order": 1},
      {"title": "第二课：下班前的 5 分钟切换", "duration_text": "11:55", "sort_order": 2},
    ],
  },
  {
    "title": "父母沟通与家庭关系",
    "subtitle": "减少代际冲突，建立成年子女边界",
    "cover_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA9_hUSdMgi6jnKGVCWE-5ZMF7o1klgpOx2i80YuVhQ6kwahRb9A8Tkxh4xT2vWGDudT9l-NKrardzgYcFPj0g38oHLa0bWu12aQ4TFpgCPeixdLOpLJFmgat_y1c-rFy4SJIQDSuOW4EdUV05gV_2NoDFmnsHQ6QAVLGx3BPp7w9MLYjXMgMGQpjIO6OSH3Dsrn6ZpEyfoufN5rEKzsT2e_Q5PBemGfWCjmKrjyYbPtlJNHnrmRWyM",
    "duration_text": "4小时50分",
    "badge": "",
    "sort_order": 6,
    "lessons": [
      {"title": "第一课：为什么越长大越难沟通", "duration_text": "17:30", "sort_order": 1},
      {"title": "第二课：温和拒绝的练习", "duration_text": "19:15", "sort_order": 2},
    ],
  },
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
    created = []
    for course in COURSES:
        lessons = course.pop("lessons")
        row = {
            "title": course["title"],
            "subtitle": course["subtitle"],
            "cover_url": course["cover_url"],
            "duration_text": course["duration_text"],
            "badge": course.get("badge") or "",
            "sort_order": course["sort_order"],
            "enabled": True,
        }
        res = mcp_support("insert", {
            "tableName": "course",
            "objects": [row],
            "fields": ["id", "title"],
        })
        course_id = res["returning"][0]["id"]
        lesson_objects = [
            {
                "title": lesson["title"],
                "duration_text": lesson["duration_text"],
                "sort_order": lesson["sort_order"],
                "course_id": course_id,
            }
            for lesson in lessons
        ]
        mcp_support("insert", {
            "tableName": "course_lesson",
            "objects": lesson_objects,
            "fields": ["id", "title", "course_id"],
        })
        created.append({"id": course_id, "title": row["title"], "lessons": len(lesson_objects)})

    print(json.dumps({"seeded": created}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"seed failed: {error}", file=sys.stderr)
        sys.exit(1)
