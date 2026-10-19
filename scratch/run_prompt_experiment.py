"""
Experiment Script to evaluate Stage 1 & Stage 2 Prompts on 3 diverse problems:
1. G3_MATH_11 (Toán có lời văn)
2. G2_VIET_08 (Tiếng Việt)
3. ROUTINE_01_CLEAN_DESK (Sinh hoạt đời thường)

Evaluates:
- Draft-07 schema compliance (schemas/micro_task_schema.json)
- Atomic action verb (regex ^[a-zA-ZÀ-ỹ_]+$, no whitespace, no multi-verbs)
- Duration window (60s - 300s)
- Step instruction length (< 15 words)
- RSD calming compliance (no "sai", "chưa đúng")
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai
import jsonschema

# Force utf-8 stdout
sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
load_dotenv(dotenv_path=REPO_ROOT / ".env")

from benchmark.pipeline.stage1_classifier import Stage1Classifier
from benchmark.pipeline.stage2_decomposer import Stage2Decomposer

def count_words(text: str) -> int:
    return len(re.findall(r"\w+", text))

def evaluate_micro_tasks(session_data: dict, schema: dict) -> dict:
    validator = jsonschema.Draft7Validator(schema)
    schema_errors = list(validator.iter_errors(session_data))
    
    tasks = session_data.get("micro_tasks", [])
    step_evals = []
    
    verb_pattern = re.compile(r"^[a-zA-ZÀ-ỹ_]+$")
    rsd_forbidden = ["sai", "sai rồi", "chưa đúng", "không đúng", "tại sao không tập trung", "lại nhầm"]
    
    for t in tasks:
        step_id = t.get("step_id")
        action_verb = str(t.get("action_verb", ""))
        instruction = str(t.get("atomic_instruction", ""))
        duration = t.get("duration_sec", 0)
        feedback = str(t.get("success_criteria", {}).get("feedback_on_error", "")).lower()
        
        verb_valid = bool(verb_pattern.match(action_verb)) and (" " not in action_verb) and ("và" not in action_verb)
        duration_valid = (60 <= duration <= 300)
        word_count = count_words(instruction)
        under_15_words = (word_count < 15)
        
        rsd_violations = [w for w in rsd_forbidden if w in feedback]
        rsd_valid = len(rsd_violations) == 0
        
        step_evals.append({
            "step_id": step_id,
            "action_verb": action_verb,
            "verb_valid": verb_valid,
            "duration_sec": duration,
            "duration_valid": duration_valid,
            "atomic_instruction": instruction,
            "word_count": word_count,
            "under_15_words": under_15_words,
            "feedback_on_error": feedback,
            "rsd_valid": rsd_valid,
            "rsd_violations": rsd_violations
        })
        
    return {
        "schema_valid": len(schema_errors) == 0,
        "schema_errors": [f"[{'/'.join(str(p) for p in e.path)}] {e.message}" for e in schema_errors],
        "total_steps": len(tasks),
        "steps": step_evals,
        "all_verbs_valid": all(s["verb_valid"] for s in step_evals),
        "all_durations_valid": all(s["duration_valid"] for s in step_evals),
        "all_under_15_words": all(s["under_15_words"] for s in step_evals),
        "all_rsd_valid": all(s["rsd_valid"] for s in step_evals),
    }

async def run_experiment():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model_name = "gemini-flash-latest"
    
    s1 = Stage1Classifier(client=client, model_name=model_name)
    s2 = Stage2Decomposer(client=client, model_name=model_name)
    
    with open(REPO_ROOT / "schemas" / "micro_task_schema.json", "r", encoding="utf-8") as f:
        schema = json.load(f)
        
    with open(REPO_ROOT / "data" / "curriculum" / "grade_1_to_5_benchmark.json", "r", encoding="utf-8") as f:
        benchmark_data = json.load(f)
        
    ex_dict = {e["id"]: e for e in benchmark_data["exercises"]}
    
    # 3 target exercises
    ex_math = ex_dict["G3_MATH_11"]
    ex_viet = ex_dict["G2_VIET_08"]
    ex_routine = {
        "id": "ROUTINE_01_CLEAN_DESK",
        "grade": 2,
        "subject": "Khoa học & Tự nhiên xã hội",
        "category": "Kỹ năng sinh hoạt đời thường",
        "topic": "Dọn dẹp góc học tập ngăn nắp",
        "difficulty": "Cơ bản",
        "estimated_duration_min": 6,
        "original_text": "Sau khi học bài xong, em hãy tự giác dọn dẹp góc học tập cho ngăn nắp: cất sách vở vào đúng ngăn bàn, gom bút thước vào hộp bút, lau sạch bụi trên mặt bàn và tắt đèn học.",
        "options": None,
        "final_answer": {
            "value": "Hoàn thành",
            "unit": "nhiệm vụ",
            "normalized_display": "Bàn học gọn gàng và ngăn nắp",
            "acceptable_variants": ["Hoàn thành", "Gọn gàng", "Sạch sẽ"]
        },
        "ground_truth_steps": [
            {
                "step_number": 1,
                "instruction": "Cất sách và vở vào đúng ngăn bàn.",
                "mathematical_or_logical_goal": "Sắp xếp tài liệu giấy tờ",
                "intermediate_output": "Sách vở đã trong ngăn"
            },
            {
                "step_number": 2,
                "instruction": "Gom các loại bút và thước kẻ bỏ vào hộp bút.",
                "mathematical_or_logical_goal": "Thu gom dụng cụ viết",
                "intermediate_output": "Bút thước trong hộp"
            },
            {
                "step_number": 3,
                "instruction": "Dùng khăn lau sạch bụi trên mặt bàn học.",
                "mathematical_or_logical_goal": "Vệ sinh bề mặt bàn",
                "intermediate_output": "Mặt bàn sạch bụi"
            },
            {
                "step_number": 4,
                "instruction": "Tắt đèn bàn học và xếp ghế gọn gàng vào sát bàn.",
                "mathematical_or_logical_goal": "Kết thúc buổi học an toàn tiết kiệm điện",
                "intermediate_output": "Đèn tắt, ghế xếp gọn"
            }
        ],
        "adhd_scaffolding_notes": {
            "working_memory_pitfall": "Trẻ dễ bị choáng ngợp bởi cả bàn bừa bộn và bỏ cuộc ngay từ đầu (ADHD paralysis).",
            "executive_function_scaffolding": "Chia nhỏ thành từng nhóm vật thể đơn lẻ: chỉ dọn sách trước, rồi mới dọn bút.",
            "visual_or_concrete_aid": "Checklist trực quan từng vật dụng."
        }
    }
    
    test_cases = [
        ("Toán có lời văn", ex_math),
        ("Tiếng Việt đọc hiểu", ex_viet),
        ("Sinh hoạt đời thường", ex_routine)
    ]
    
    results = {}
    
    for label, ex in test_cases:
        item_id = ex["id"]
        print(f"\n==========================================")
        print(f"BẮT ĐẦU THỬ NGHIỆM: [{label}] ID: {item_id}")
        print(f"Đề bài: {ex['original_text']}")
        print(f"==========================================")
        
        # 1. Stage 1
        print("--> Chạy Stage 1: Problem Classifier & Cognitive IR...")
        cognitive_ir = await s1.classify(ex)
        print(f"Stage 1 IR taxonomy: {cognitive_ir.get('problem_taxonomy')}")
        print(f"Stage 1 Sub-questions count: {len(cognitive_ir.get('sub_questions', []))}")
        print(f"Stage 1 Traps count: {len(cognitive_ir.get('potential_adhd_traps', []))}")
        
        # 2. Stage 2
        print("--> Chạy Stage 2: Micro-Task Decomposer...")
        profile = {
            "cognitive_profile_vector": {
                "attention_span_minutes": 10,
                "recommended_micro_task_duration_sec": 120,
                "working_memory_capacity": 2,
                "rsd_sensitivity_level": "HIGH",
                "scaffolding_level": "MODERATE",
                "max_steps_per_session": 4,
            },
            "stage_2_prompt_injection_payload": {
                "system_instruction_context": "Học sinh có độ nhạy cảm thất bại cao (RSD HIGH). Giới hạn tối đa 2 mục bộ nhớ làm việc cùng lúc."
            }
        }
        
        session_output = await s2.decompose(ex, cognitive_ir, profile)
        eval_report = evaluate_micro_tasks(session_output, schema)
        
        print("\n--- KẾT QUẢ ĐÁNH GIÁ VI NHIỆM VỤ ---")
        print(f"Tuân thủ Schema Draft-07: {eval_report['schema_valid']}")
        if not eval_report['schema_valid']:
            print(f"Lỗi Schema: {eval_report['schema_errors']}")
        print(f"Số lượng Micro-tasks: {eval_report['total_steps']}")
        print(f"100% Động từ đơn nhất (Atomic Verb): {eval_report['all_verbs_valid']}")
        print(f"100% Thời lượng trong [60s, 300s]: {eval_report['all_durations_valid']}")
        print(f"100% Dưới 15 từ / bước: {eval_report['all_under_15_words']}")
        print(f"100% Chuẩn RSD (không từ ngữ tiêu cực): {eval_report['all_rsd_valid']}")
        
        for step in eval_report["steps"]:
            print(f"  [Bước {step['step_id']}] Verb: '{step['action_verb']}' (Hợp lệ: {step['verb_valid']}) | Thời lượng: {step['duration_sec']}s (Hợp lệ: {step['duration_valid']}) | Số từ: {step['word_count']} (Dưới 15: {step['under_15_words']})")
            print(f"     Chỉ dẫn: \"{step['atomic_instruction']}\"")
            print(f"     Feedback khi sai: \"{step['feedback_on_error']}\" (RSD OK: {step['rsd_valid']})")
            
        results[item_id] = {
            "label": label,
            "exercise": ex,
            "cognitive_ir": cognitive_ir,
            "session_output": session_output,
            "eval_report": eval_report
        }
        
    out_path = Path("scratch/experiment_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n Đã lưu kết quả chi tiết vào {out_path.resolve()}")

if __name__ == "__main__":
    asyncio.run(run_experiment())
