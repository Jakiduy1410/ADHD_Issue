import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv()

import sys
sys.path.insert(0, os.path.abspath("."))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from src.api.ai_engine import decompose_exercise_with_gemini

test_problems = [
    {
        "id": "p1",
        "text": "Cô Hồng mua 15 quyển vở, mỗi quyển có giá 12 000 đồng và 11 quyển truyện, mỗi quyển có giá 18 500 đồng. Hỏi cô Hồng phải trả người bán hàng bao nhiêu tiền?",
        "grade": 4
    },
    {
        "id": "p2",
        "text": "Hai bao thóc nặng 50 kg. Hỏi 15 bao nặng bao nhiêu ki-lô-gam?",
        "grade": 4
    },
    {
        "id": "p3",
        "text": "Bác Dương mua 6 bình nước, mỗi bình nước có giá 60 000 đồng. Biết phí giao hàng là 30 000 đồng. Hỏi bác Dương phải trả tất cả bao nhiêu tiền?",
        "grade": 4
    },
    {
        "id": "p4",
        "text": "Anh Khoai khắc số lên các đốt tre theo quy tắc: đốt tre thứ nhất khắc số 1, đốt tre thứ hai khắc số 2, đốt tre thứ ba khắc số 4 và cứ như vậy, số khắc ở đốt tre sau gấp đôi số khắc ở đốt tre trước đó. Biết rằng ở đốt tre thứ mười tám, anh Khoai khắc số 131 072. Hỏi anh Khoai khắc số bao nhiêu lên đốt tre thứ hai mươi?",
        "grade": 4
    }
]

async def run():
    for p in test_problems:
        print(f"\n=======================================================")
        print(f"TESTING: {p['text']}")
        print(f"=======================================================")
        res = await decompose_exercise_with_gemini(p['text'], grade=p['grade'])
        meta = res.get('task_metadata', {})
        print(f"Title: {meta.get('original_title')}")
        print(f"Subject: {meta.get('subject')}")
        print(f"Final Answer: {res.get('final_summary', {}).get('extracted_final_answer')}")
        steps = res.get('micro_tasks', [])
        print(f"Steps Count: {len(steps)}")
        for s in steps:
            print(f"  - Step {s['step_id']} [{s['ui_type']}]: {s['title']}")
            print(f"    Instruction: {s['atomic_instruction']}")
            print(f"    Prompt: {s['ui_payload'].get('prompt_text')}")
            if s['ui_type'] == 'highlight':
                print(f"    Highlight Segments: {s['ui_payload'].get('highlight_target_segments')}")
            elif s['ui_type'] == 'single_choice':
                print(f"    Options: {s['ui_payload'].get('options')}")
            print(f"    Expected: {s['success_criteria'].get('expected_answer')}")

if __name__ == '__main__':
    asyncio.run(run())
