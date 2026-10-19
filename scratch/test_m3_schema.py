import json
from pathlib import Path
import jsonschema

schema_path = Path("schemas/micro_task_schema.json")
with open(schema_path, "r", encoding="utf-8") as f:
    schema = json.load(f)

validator = jsonschema.Draft7Validator(schema)

# Test Vietnamese Session
vn_session = {
    "session_id": "SESSION_AI_TEST_VN_01",
    "task_metadata": {
        "benchmark_id": "AI_VN_TEST_01",
        "original_title": "Đọc bài thơ Em yêu mùa hè và tìm từ láy",
        "grade": 3,
        "subject": "tieng_viet",
        "target_cognitive_profile": {
            "attention_span_minutes": 10,
            "recommended_micro_task_duration_sec": 120,
            "working_memory_capacity": 2,
            "rsd_sensitivity_level": "HIGH",
            "scaffolding_level": "MODERATE",
        },
        "total_micro_tasks": 3,
        "total_estimated_duration_sec": 360,
    },
    "micro_tasks": [
        {
            "step_id": 1,
            "title": "Gạch chân từ láy",
            "action_verb": "Gạch_chân",
            "atomic_instruction": "Gạch chân từ láy miêu tả tiếng ve kêu.",
            "duration_sec": 120,
            "ui_type": "highlight",
            "ui_payload": {
                "prompt_text": "Ve kêu râm ran trong vòm lá mát rượi.",
                "highlight_target_segments": ["râm ran"],
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "visual_cue",
                "cognitive_load_level": "low",
                "working_memory_items": 1,
                "explanation": "Hướng sự chú ý vào âm thanh gợi cảm.",
            },
            "hints": ["Từ láy lặp lại âm đầu 'r' con nha."],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": ["râm ran"],
                "feedback_on_error": "Milo gợi ý: Con hãy kiểm tra lại từ láy nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "sparkle_star_01",
                "audio_cue": "positive_bell_c6",
                "dopamine_points": 25,
            },
            "is_final_step": False,
        },
        {
            "step_id": 2,
            "title": "Chọn nghĩa của từ",
            "action_verb": "Chọn",
            "atomic_instruction": "Chọn từ miêu tả đúng ý nghĩa câu thơ.",
            "duration_sec": 120,
            "ui_type": "single_choice",
            "ui_payload": {
                "prompt_text": "Từ 'râm ran' gợi cảm giác âm thanh như thế nào?",
                "options": ["Âm thanh rộn rã kéo dài", "Yên lặng không có tiếng động"],
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "worked_example",
                "cognitive_load_level": "low",
                "working_memory_items": 1,
                "explanation": "Phát triển năng lực đọc hiểu qua so sánh nhị phân.",
            },
            "hints": ["Tiếng ve mùa hè thường rộn rã hay yên lặng con nhỉ?"],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": "Âm thanh rộn rã kéo dài",
                "feedback_on_error": "Milo gợi ý: Con hãy suy nghĩ kỹ hơn về tiếng ve mùa hè nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "milo_thumbs_up",
                "audio_cue": "sparkle_ting_short",
                "dopamine_points": 30,
            },
            "is_final_step": False,
        },
        {
            "step_id": 3,
            "title": "Điền từ còn thiếu",
            "action_verb": "Điền",
            "atomic_instruction": "Điền từ 'râm ran' vào câu cảm nhận.",
            "duration_sec": 120,
            "ui_type": "text_input",
            "ui_payload": {
                "prompt_text": "Tiếng ve kêu ... báo hiệu mùa hè đã về.",
                "placeholder": "Điền từ còn thiếu...",
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "fill_in_the_blank",
                "cognitive_load_level": "medium",
                "working_memory_items": 1,
                "explanation": "Khắc sâu từ vựng qua bài tập điền khuyết.",
            },
            "hints": ["Điền từ 'râm ran' con nha."],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": "râm ran",
                "feedback_on_error": "Milo gợi ý: Hãy điền đúng từ láy ở bước 1 nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "particle_burst_gold",
                "audio_cue": "gentle_pop_success",
                "dopamine_points": 40,
            },
            "is_final_step": True,
        },
    ],
    "final_summary": {
        "final_answer_step_id": 3,
        "extracted_final_answer": "râm ran",
        "pedagogical_wrap_up": "Xuất sắc! Con đã hiểu rất rõ cách dùng từ láy trong Tiếng Việt cùng bạn Milo!",
    },
}

# Test Routine / Chores Session
chores_session = {
    "session_id": "SESSION_AI_TEST_CHORES_01",
    "task_metadata": {
        "benchmark_id": "AI_CHORE_TEST_01",
        "original_title": "Dọn dẹp bàn học và cất sách vở",
        "grade": 1,
        "subject": "khoa_hoc_tu_nhien",
        "target_cognitive_profile": {
            "attention_span_minutes": 8,
            "recommended_micro_task_duration_sec": 90,
            "working_memory_capacity": 2,
            "rsd_sensitivity_level": "HIGH",
            "scaffolding_level": "MODERATE",
        },
        "total_micro_tasks": 3,
        "total_estimated_duration_sec": 270,
    },
    "micro_tasks": [
        {
            "step_id": 1,
            "title": "Gạch chân đồ vật cần dọn",
            "action_verb": "Gạch_chân",
            "atomic_instruction": "Gạch chân các đồ vật cần xếp gọn gàng.",
            "duration_sec": 90,
            "ui_type": "highlight",
            "ui_payload": {
                "prompt_text": "Em hãy thu dọn bàn học và cất sách vở gọn gàng.",
                "highlight_target_segments": ["bàn học", "sách vở"],
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "visual_cue",
                "cognitive_load_level": "low",
                "working_memory_items": 2,
                "explanation": "Định hướng mục tiêu không gian cụ thể.",
            },
            "hints": ["Tìm 2 đồ vật trong câu con nhé."],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": ["bàn học", "sách vở"],
                "feedback_on_error": "Milo gợi ý: Con hãy gạch chân bàn học và sách vở nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "sparkle_star_01",
                "audio_cue": "positive_bell_c6",
                "dopamine_points": 25,
            },
            "is_final_step": False,
        },
        {
            "step_id": 2,
            "title": "Chọn hành động đúng",
            "action_verb": "Chọn",
            "atomic_instruction": "Chọn cách cất sách vở khoa học nhất.",
            "duration_sec": 90,
            "ui_type": "single_choice",
            "ui_payload": {
                "prompt_text": "Sách vở sau khi học xong nên để ở đâu?",
                "options": ["Xếp gọn lên kệ hoặc giá sách", "Vứt bừa bãi dưới sàn"],
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "worked_example",
                "cognitive_load_level": "low",
                "working_memory_items": 1,
                "explanation": "Hình thành thói quen kỷ luật tự giác.",
            },
            "hints": ["Xếp lên kệ sách sẽ rất ngăn nắp con nha."],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": "Xếp gọn lên kệ hoặc giá sách",
                "feedback_on_error": "Milo gợi ý: Hãy chọn nơi ngăn nắp nhất nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "milo_thumbs_up",
                "audio_cue": "sparkle_ting_short",
                "dopamine_points": 30,
            },
            "is_final_step": False,
        },
        {
            "step_id": 3,
            "title": "Xác nhận hoàn thành",
            "action_verb": "Điền",
            "atomic_instruction": "Điền chữ 'xong' khi con đã làm xong.",
            "duration_sec": 90,
            "ui_type": "text_input",
            "ui_payload": {
                "prompt_text": "Bàn học đã sạch bóng chưa con? Điền 'xong' nhé:",
                "placeholder": "Điền xong...",
            },
            "cognitive_scaffolding": {
                "scaffolding_type": "verification_check",
                "cognitive_load_level": "low",
                "working_memory_items": 1,
                "explanation": "Đánh dấu hoàn thành chuỗi hành vi.",
            },
            "hints": ["Nhập chữ 'xong' con nhé."],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": "xong",
                "feedback_on_error": "Milo gợi ý: Con hãy hoàn tất việc dọn dẹp rồi điền 'xong' nhé! Bạn Milo tin con sẽ làm được! 🌱",
            },
            "immediate_reinforcer": {
                "visual_asset": "confetti_cannon",
                "audio_cue": "harp_glissando_soft",
                "dopamine_points": 40,
            },
            "is_final_step": True,
        },
    ],
    "final_summary": {
        "final_answer_step_id": 3,
        "extracted_final_answer": "xong",
        "pedagogical_wrap_up": "Tuyệt vời! Con đã có một góc học tập thật ngăn nắp và sạch đẹp!",
    },
}

for name, s in [("Vietnamese", vn_session), ("Chores", chores_session)]:
    errs = list(validator.iter_errors(s))
    if errs:
        print(f"FAILED {name}:")
        for e in errs:
            print(f"  {e.message} at path: {'/'.join(str(p) for p in e.path)}")
    else:
        print(f"VALIDATION SUCCESS: {name} Session conforms 100% to Draft-07 micro_task_schema.json!")
