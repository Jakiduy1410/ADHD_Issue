"""
Reference implementation and verification script for ADHD 9-Question Survey Scoring Engine.
Clinical dimensions:
- Executive Function (EF, Q1-Q3)
- Attention Span (AS, Q4-Q6)
- Rejection Sensitive Dysphoria (RSD, Q7-Q9)
"""

import math
from typing import Dict, Any, List

def calculate_cognitive_profile(answers: Dict[str, int], child_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Transforms 9-question survey answers (q1..q9, scores 0-3) into a normalized Cognitive Profile.
    """
    if child_metadata is None:
        child_metadata = {
            "child_name": "Em bé",
            "grade": 3,
            "age": 8
        }
    
    # 1. Validation
    required_keys = [f"q{i}" for i in range(1, 10)]
    for k in required_keys:
        if k not in answers:
            raise ValueError(f"Missing answer for question {k}")
        val = answers[k]
        if not isinstance(val, int) or val < 0 or val > 3:
            raise ValueError(f"Answer for {k} must be an integer between 0 and 3, got {val}")

    # 2. Raw Subscale Scores
    ef_score = answers["q1"] + answers["q2"] + answers["q3"] # Range [0, 9]
    as_score = answers["q4"] + answers["q5"] + answers["q6"] # Range [0, 9]
    rsd_score = answers["q7"] + answers["q8"] + answers["q9"] # Range [0, 9]
    total_score = ef_score + as_score + rsd_score # Range [0, 27]

    # 3. Normalized Indices [0.0, 1.0]
    ef_index = round(ef_score / 9.0, 4)
    as_index = round(as_score / 9.0, 4)
    rsd_index = round(rsd_score / 9.0, 4)
    
    # Weighted Composite Deficit Index (CDI): 40% EF, 35% AS, 25% RSD
    cdi = round((0.40 * ef_index) + (0.35 * as_index) + (0.25 * rsd_index), 4)

    # 4. Attention Span Transformation [5 to 25 minutes]
    # Linear monotonic interpolation: 0 deficit -> 25 min, 9 deficit -> 5 min
    raw_span = 25.0 - (as_score / 9.0) * (25.0 - 5.0)
    attention_span_minutes = int(round(raw_span))
    
    # Micro-task duration [60s to 300s]
    # Inattention lowers duration from 300s (mild) to 90s-120s (severe)
    raw_micro_duration = 300.0 - (as_score / 9.0) * (300.0 - 90.0)
    # Clamp to [60, 300] and round to multiple of 30s for clean UI
    recommended_micro_task_duration_sec = int(round(raw_micro_duration / 30.0) * 30)
    recommended_micro_task_duration_sec = max(60, min(300, recommended_micro_task_duration_sec))

    # 5. Working Memory Capacity Transformation [1 to 5 chunks]
    # 0 deficit -> 5 chunks, 9 deficit -> 1 chunk
    raw_wm = 5.0 - (ef_score / 9.0) * 4.0
    working_memory_capacity = int(round(raw_wm))
    working_memory_capacity = max(1, min(5, working_memory_capacity))

    # 6. RSD Sensitivity Level Categorization
    if rsd_score <= 2:
        rsd_sensitivity_level = "LOW"
    elif rsd_score <= 4:
        rsd_sensitivity_level = "MEDIUM"
    elif rsd_score <= 7:
        rsd_sensitivity_level = "HIGH"
    else:
        rsd_sensitivity_level = "SEVERE"

    # 7. Scaffolding Level Determination
    if cdi < 0.35:
        scaffolding_level = "MINIMAL"
        max_steps = 6
    elif cdi < 0.70:
        scaffolding_level = "MODERATE"
        max_steps = 4
    else:
        scaffolding_level = "INTENSIVE"
        max_steps = 3

    # 8. Behavioral Directives for Prompt Injection
    prompt_directives = {
        "scaffolding_level": scaffolding_level,
        "max_atomic_steps": max_steps,
        "step_duration_target_sec": recommended_micro_task_duration_sec,
        "cognitive_chunk_limit": working_memory_capacity,
        "verb_constraint": (
            "CHỈ được dùng ĐÚNG 1 động từ hành động duy nhất trong mỗi micro-task (ví dụ: 'Đọc', 'Gạch chân', 'Tính')."
            if working_memory_capacity <= 2 else
            "Mỗi micro-task tối đa 1-2 động từ hành động liên kết trực tiếp."
        ),
        "rsd_tone_guideline": (
            "Áp dụng giao thức hạ nhiệt RSD tối đa: Không phê phán, không dùng từ 'sai', dùng giọng điệu ấm áp của robot Milo, tự động kích hoạt lời khen nỗ lực sau mỗi bước."
            if rsd_sensitivity_level in ["HIGH", "SEVERE"] else
            "Giọng điệu khích lệ tích cực, khen ngợi quy trình làm bài."
        ),
        "visual_timer_interval_sec": recommended_micro_task_duration_sec
    }

    return {
        "survey_metadata": {
            "survey_id": "adhd_vadprs_snapiv_9q",
            "version": "1.0.0",
            "child_name": child_metadata.get("child_name", "Em bé"),
            "grade": child_metadata.get("grade", 3),
            "age": child_metadata.get("age", 8)
        },
        "raw_scores": {
            "executive_function": ef_score,
            "attention_span": as_score,
            "rsd_sensitivity": rsd_score,
            "total_score": total_score
        },
        "normalized_indices": {
            "executive_function_deficit_index": ef_index,
            "attention_decay_index": as_index,
            "rejection_sensitivity_index": rsd_index,
            "composite_deficit_index": cdi
        },
        "cognitive_profile_vector": {
            "attention_span_minutes": attention_span_minutes,
            "recommended_micro_task_duration_sec": recommended_micro_task_duration_sec,
            "working_memory_capacity": working_memory_capacity,
            "rsd_sensitivity_level": rsd_sensitivity_level,
            "scaffolding_level": scaffolding_level,
            "max_steps_per_session": max_steps
        },
        "prompt_injection_directives": prompt_directives
    }

if __name__ == "__main__":
    test_cases = [
        ("All 0s (Baseline / Neurotypical)", {f"q{i}": 0 for i in range(1, 10)}),
        ("All 1s (Mild Inattention / Normal Range)", {f"q{i}": 1 for i in range(1, 10)}),
        ("All 2s (Moderate ADHD Features)", {f"q{i}": 2 for i in range(1, 10)}),
        ("All 3s (Severe ADHD & High RSD)", {f"q{i}": 3 for i in range(1, 10)}),
        ("Mixed: Severe RSD & EF, Mild AS", {"q1": 3, "q2": 3, "q3": 2, "q4": 1, "q5": 1, "q6": 1, "q7": 3, "q8": 3, "q9": 3}),
        ("Mixed: Severe Inattention, Low RSD", {"q1": 2, "q2": 1, "q3": 1, "q4": 3, "q5": 3, "q6": 3, "q7": 0, "q8": 0, "q9": 1})
    ]

    for name, answers in test_cases:
        res = calculate_cognitive_profile(answers, {"child_name": "Bé Nam", "grade": 2, "age": 7})
        print(f"=== Case: {name} ===")
        print(f"  Raw: EF={res['raw_scores']['executive_function']}, AS={res['raw_scores']['attention_span']}, RSD={res['raw_scores']['rsd_sensitivity']}, Total={res['raw_scores']['total_score']}")
        print(f"  CDI: {res['normalized_indices']['composite_deficit_index']}")
        print(f"  Vector: attention_span_minutes={res['cognitive_profile_vector']['attention_span_minutes']}, "
              f"wm_capacity={res['cognitive_profile_vector']['working_memory_capacity']}, "
              f"rsd_level={res['cognitive_profile_vector']['rsd_sensitivity_level']}, "
              f"scaffolding={res['cognitive_profile_vector']['scaffolding_level']}, "
              f"micro_duration_sec={res['cognitive_profile_vector']['recommended_micro_task_duration_sec']}")
        print()
