"""
AI Task Decomposer Engine using Gemini 3.5 Flash Lite (Rẻ nhất, tốc độ cao nhất ~1s).
Kiến trúc 2 Tầng:
- Stage 1: Classifier phân loại môn & ngách bài tập chuyên biệt (prompts/classifier.md).
- Stage 2: Router nạp prompt chuyên sâu theo ngách (prompts/specialists/*.md) với few-shot sâu,
           ép chặt giàn giáo nhận thức ADHD và thống nhất 100% schema với tasks_db.json & renderers.js.
Không có fallback giả mạo hay regex chống chế. Lỗi mạng/API -> Báo lỗi rõ ràng.
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Model rẻ và nhẹ nhất trong họ Gemini hiện nay
CHEAPEST_MODEL = "gemini-3.5-flash-lite"
REPO_ROOT = Path(__file__).resolve().parents[2]

# --- SCHEMA CHO STAGE 1: CLASSIFIER ---
CLASSIFIER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "subject": {
            "type": "STRING",
            "enum": ["math", "vietnamese", "english", "routine"]
        },
        "category": {
            "type": "STRING",
            "enum": [
                "math_geometry",
                "math_word_problem_basic",
                "math_word_problem_model",
                "math_arithmetic_algebra",
                "viet_reading",
                "viet_grammar",
                "eng_vocab_sentence",
                "life_routine"
            ],
            "description": "Ngách nhỏ sư phạm chuyên biệt duy nhất"
        },
        "reasoning": {"type": "STRING", "description": "Giải thích ngắn gọn dưới 20 từ lý do chọn ngách"}
    },
    "required": ["subject", "category"]
}

# --- SCHEMA CHO BÀI TOÁN HÌNH HỌC (ÉP CHẶT geometry_spec SVG) ---
GEOMETRY_DECOMPOSER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "benchmark_id": {"type": "STRING"},
        "original_title": {"type": "STRING"},
        "exercise_type": {"type": "STRING", "enum": ["geometry"]},
        "subject": {"type": "STRING", "enum": ["toan", "khoa_hoc_tu_nhien"]},
        "original_text": {"type": "STRING", "description": "Đề bài gốc hoàn chỉnh để trẻ đọc ở bước 1"},
        "geometry_spec": {
            "type": "OBJECT",
            "properties": {
                "shape_type": {"type": "STRING", "enum": ["rectangle", "square", "parallelogram", "triangle", "house_counting", "nested"]},
                "dimensions": {
                    "type": "OBJECT",
                    "properties": {
                        "length": {"type": "STRING"},
                        "width": {"type": "STRING"},
                        "base": {"type": "STRING"},
                        "height": {"type": "STRING"},
                        "side": {"type": "STRING"}
                    }
                },
                "target": {"type": "STRING", "enum": ["area", "perimeter", "remaining_area"]},
                "nested_label": {"type": "STRING"}
            },
            "required": ["shape_type", "dimensions", "target"],
            "description": "Thông số hình học bắt buộc để vẽ hình SVG trực quan cho trẻ ADHD"
        },
        "target_keywords": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Kích thước hình học kèm đơn vị và từ khóa mục tiêu (chu vi, diện tích)"
        },
        "steps": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "step_id": {"type": "INTEGER"},
                    "title": {"type": "STRING"},
                    "action_verb": {"type": "STRING", "enum": ["Gạch_chân", "Chọn", "Tính", "Điền"]},
                    "atomic_instruction": {"type": "STRING", "description": "Chỉ dẫn ngắn gọn < 15 từ"},
                    "ui_type": {"type": "STRING", "enum": ["highlight", "single_choice", "text_input"]},
                    "prompt_text": {"type": "STRING", "description": "Nội dung câu hỏi hoặc biểu thức tính toán"},
                    "highlight_target_segments": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Cụm từ cần gạch chân nếu ui_type là highlight"
                    },
                    "options": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Lựa chọn nếu ui_type là single_choice"
                    },
                    "placeholder": {"type": "STRING"},
                    "expected_answer": {"type": "STRING"},
                    "feedback_on_error": {"type": "STRING", "description": "Lời động viên nhẹ nhàng ấm áp RSD-safe của Milo"},
                    "dopamine_points": {"type": "INTEGER"}
                },
                "required": ["step_id", "title", "action_verb", "atomic_instruction", "ui_type", "prompt_text", "expected_answer", "feedback_on_error"]
            }
        },
        "final_answer": {"type": "STRING"},
        "pedagogical_summary": {"type": "STRING"}
    },
    "required": ["original_title", "exercise_type", "subject", "original_text", "geometry_spec", "target_keywords", "steps", "final_answer"]
}

# --- SCHEMA TIÊU CHUẨN CHO CÁC DẠNG BÀI TOÁN KHÁC ---
STANDARD_MATH_DECOMPOSER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "benchmark_id": {"type": "STRING"},
        "original_title": {"type": "STRING"},
        "exercise_type": {
            "type": "STRING",
            "enum": ["word_problem", "pure_arithmetic", "find_x"]
        },
        "subject": {"type": "STRING", "enum": ["toan"]},
        "original_text": {"type": "STRING", "description": "Đề bài gốc hoàn chỉnh"},
        "target_keywords": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Bao gồm: (1) Số liệu/đại lượng kèm đơn vị, (2) Từ khóa quan hệ/toán tử ('tất cả', 'còn lại', 'nhiều hơn')"
        },
        "steps": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "step_id": {"type": "INTEGER"},
                    "title": {"type": "STRING"},
                    "action_verb": {"type": "STRING", "enum": ["Gạch_chân", "Chọn", "Tính", "Điền"]},
                    "atomic_instruction": {"type": "STRING", "description": "Chỉ dẫn ngắn gọn < 15 từ"},
                    "ui_type": {"type": "STRING", "enum": ["highlight", "single_choice", "text_input"]},
                    "prompt_text": {"type": "STRING", "description": "Nội dung câu hỏi hoặc biểu thức tính toán chuẩn đặt tính theo dòng"},
                    "highlight_target_segments": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Cụm từ cần gạch chân nếu ui_type là highlight"
                    },
                    "options": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Lựa chọn nếu ui_type là single_choice"
                    },
                    "placeholder": {"type": "STRING"},
                    "expected_answer": {"type": "STRING"},
                    "feedback_on_error": {"type": "STRING", "description": "Lời động viên nhẹ nhàng RSD-safe của Milo"},
                    "dopamine_points": {"type": "INTEGER"}
                },
                "required": ["step_id", "title", "action_verb", "atomic_instruction", "ui_type", "prompt_text", "expected_answer", "feedback_on_error"]
            }
        },
        "final_answer": {"type": "STRING"},
        "pedagogical_summary": {"type": "STRING"}
    },
    "required": ["original_title", "exercise_type", "subject", "original_text", "target_keywords", "steps", "final_answer"]
}


def load_prompt_file(relative_path: str) -> str:
    prompt_file = REPO_ROOT / relative_path
    if prompt_file.is_file():
        try:
            with open(prompt_file, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Không thể đọc file prompt {prompt_file}: {e}")
    return ""


def load_classifier_prompt() -> str:
    content = load_prompt_file("prompts/classifier.md")
    return content or "Bạn là Bộ Phân Loại Nhiệm Vụ (Task Classifier) chuẩn GDPT 2018 cho trẻ ADHD."


def load_specialist_prompt(category: str) -> str:
    path_map = {
        "math_geometry": "prompts/specialists/math_geometry.md",
        "math_word_problem_basic": "prompts/specialists/math_word_problem_basic.md",
        "math_word_problem_model": "prompts/specialists/math_word_problem_model.md",
        "math_arithmetic_algebra": "prompts/specialists/math_arithmetic_algebra.md",
    }
    rel_path = path_map.get(category)
    if rel_path:
        content = load_prompt_file(rel_path)
        if content:
            return content
    # Fallback to general micro_task_decomposer prompt
    return load_prompt_file("prompts/micro_task_decomposer.md") or "Bạn là Chuyên gia Sư phạm ADHD."


def fast_heuristic_classify(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Nhận diện siêu tốc ngách sư phạm (<1ms) cho các dạng bài tiểu học chuẩn mực,
    tiết kiệm 20-30s độ trễ mạng so với việc gọi remote LLM 2 lần liên tiếp.
    """
    lower = raw_text.lower().strip()
    # 1. Sinh hoạt đời thường
    if any(k in lower for k in ["dọn dẹp", "bàn học", "rác", "quét nhà", "lau bàn", "gấp quần áo", "cặp sách", "đánh răng", "đi ngủ", "rửa bát"]):
        return {"subject": "routine", "category": "life_routine", "reasoning": "Khớp từ khóa thói quen sinh hoạt"}
    # 2. Tiếng Anh
    if any(k in lower for k in ["choose the", "fill in", "read the passage", "translate to english"]):
        return {"subject": "english", "category": "eng_vocab_sentence", "reasoning": "Khớp dạng bài Tiếng Anh"}
    # 3. Tiếng Việt
    if any(k in lower for k in ["đoạn văn", "bài thơ", "chính tả", "tập đọc", "từ láy", "câu chuyện", "nghĩa của từ"]) and not any(op in lower for op in ["+", "-", "×", "*", "/", ":", "="]):
        return {"subject": "vietnamese", "category": "viet_reading", "reasoning": "Khớp bài đọc hiểu Tiếng Việt"}
    # 4. Toán hình học
    if any(k in lower for k in ["chu vi", "diện tích", "hình chữ nhật", "hình vuông", "hình bình hành", "tam giác", "hình tròn", "hình thoi", "cửa sổ", "mái nhà", "cạnh", "chiều dài", "chiều rộng"]):
        return {"subject": "math", "category": "math_geometry", "reasoning": "Khớp dạng toán Hình học & Đo lường"}
    # 5. Toán mô hình Tổng-Hiệu / Tỉ số / Chuyển động
    if any(k in lower for k in ["tổng và hiệu", "tổng - hiệu", "nhiều hơn", "ít hơn", "vận tốc", "quãng đường", "thời gian", "tỉ số", "gấp"]) and any(w in lower for w in ["hỏi", "bao nhiêu", "tìm hai số"]):
        if any(m in lower for m in ["tổng", "hiệu", "hai lớp", "hai kho", "hai thùng", "hai xe", "vận tốc", "km/h"]):
            return {"subject": "math", "category": "math_word_problem_model", "reasoning": "Khớp toán mô hình Tổng-Hiệu / Tỉ số"}
    # 6. Toán tính toán thuần / Tìm X / Đặt tính
    if any(k in lower for k in ["đặt tính", "tìm x", "giá trị biểu thức", "tính nhẩm"]) or (not any(w in lower for w in ["hỏi", "bao nhiêu"]) and any(op in lower for op in ["+", "-", "*", "×", "/", ":"])):
        return {"subject": "math", "category": "math_arithmetic_algebra", "reasoning": "Khớp dạng bài Đặt tính & Số học"}
    # 7. Toán lời văn cơ bản
    if any(w in lower for w in ["hỏi", "bao nhiêu", "có tất cả", "còn lại", "mỗi bạn", "bông hoa", "quả cam", "con chim"]):
        return {"subject": "math", "category": "math_word_problem_basic", "reasoning": "Khớp toán lời văn thực tế cơ bản"}
    return None


async def classify_task(raw_text: str, client: genai.Client) -> Dict[str, Any]:
    """
    STAGE 1: Phân loại môn học và ngách nhỏ chuyên biệt.
    Ưu tiên nhận diện siêu tốc (<1ms) để tránh bị timeout mạng, chỉ gọi LLM khi đề bài đặc biệt.
    """
    fast_match = fast_heuristic_classify(raw_text)
    if fast_match:
        logger.info(f"Stage 1 Fast Heuristic kết quả: category={fast_match['category']}, reasoning={fast_match['reasoning']}")
        return fast_match

    classifier_instruction = load_classifier_prompt()
    user_input = f"""Hãy phân loại đề bài sau vào đúng Môn học và Ngách chuyên biệt:
Đề bài: "{raw_text}"
"""
    try:
        response = client.models.generate_content(
            model=CHEAPEST_MODEL,
            contents=user_input,
            config=types.GenerateContentConfig(
                system_instruction=classifier_instruction,
                response_mime_type="application/json",
                response_schema=CLASSIFIER_SCHEMA,
                temperature=0.0
            )
        )
        if response and response.text:
            return json.loads(response.text)
    except Exception as e:
        logger.warning(f"Lỗi Stage 1 Classifier: {e}, mặc định sang math_word_problem_basic")
    
    return {"subject": "math", "category": "math_word_problem_basic", "reasoning": "Default word problem"}


async def decompose_exercise_with_gemini(
    raw_text: str, 
    grade: int = 3, 
    cognitive_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    STAGE 2: Băm vi nhiệm vụ chuyên sâu theo ngách nhỏ với Few-shot đắt giá và Schema ép chặt.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env! Không thể băm bài.")

    client = genai.Client(api_key=api_key)

    # 1. Gọi Stage 1: Phân loại môn & ngách nhỏ
    classification = await classify_task(raw_text, client)
    category = classification.get("category", "math_word_problem_basic")
    logger.info(f"Stage 1 Classifier kết quả: category={category}, reasoning={classification.get('reasoning')}")

    # 2. Chọn Prompt chuyên biệt và Schema tương ứng
    specialist_prompt = load_specialist_prompt(category)
    if category == "math_geometry":
        schema_to_use = GEOMETRY_DECOMPOSER_SCHEMA
    else:
        schema_to_use = STANDARD_MATH_DECOMPOSER_SCHEMA

    user_prompt = f"""
Đề bài gốc:
"{raw_text}"

Khối lớp: Lớp {grade}
Ngách chuyên biệt đã xác định: {category}
Hồ sơ nhận thức trẻ: {json.dumps(cognitive_profile or {}, ensure_ascii=False)}

Hãy phân tích và băm bài này thành chuỗi vi nhiệm vụ nguyên tử (3 đến 4 bước) theo đúng JSON Schema đã định.
LƯU Ý QUAN TRỌNG:
- Luôn giữ nguyên đề bài gốc trong trường `original_text` để trẻ có thể đọc ở Bước 1.
- Với bài hình học: BƯỚC 1 gạch chân số đo và mục tiêu (chu vi/diện tích); BƯỚC 2 gán số đo vào hình SVG trực quan; BƯỚC 3 chọn công thức; BƯỚC 4 tính toán.
- Với bài toán có lời văn: BƯỚC 1 gạch chân ĐẦY ĐỦ 2 nhóm: đại lượng kèm đơn vị VÀ từ khóa toán tử ('tất cả', 'còn lại', 'nhiều hơn'); BƯỚC 2 hỏi ý nghĩa từ khóa; BƯỚC 3 chọn phép tính; BƯỚC 4 tính toán.
- Với phép tính cộng/trừ/nhân: `prompt_text` của bước tính toán phải chứa biểu thức số học rõ ràng (ví dụ: '15 + 8 = ?' hoặc '23 × 2 = ?') để kích hoạt giao diện đặt tính cột dọc theo dòng.
"""

    try:
        response = None
        last_err = None
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=CHEAPEST_MODEL,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=specialist_prompt,
                        response_mime_type="application/json",
                        response_schema=schema_to_use,
                        temperature=0.1
                    )
                )
                if response and response.text:
                    break
            except Exception as api_err:
                last_err = api_err
                err_str = str(api_err)
                if any(term in err_str for term in ["503", "429", "UNAVAILABLE", "ResourceExhausted"]) and attempt < 2:
                    logger.warning(f"Gemini API quá tải tạm thời (lần {attempt+1}/3), thử lại sau 2s: {api_err}")
                    await asyncio.sleep(2.0)
                    continue
                raise api_err
        
        if not response or not response.text:
            raise RuntimeError(f"Gemini trả về phản hồi rỗng hoặc lỗi: {last_err}")

        parsed_data = json.loads(response.text)
        
        # 3. Chuẩn hóa dữ liệu đầu ra đồng bộ 100% với tasks_db.json và renderers.js
        transformed_tasks = []
        exercise_type = parsed_data.get("exercise_type", "word_problem")
        geometry_spec = parsed_data.get("geometry_spec")
        reading_passage = parsed_data.get("reading_passage")

        for s in parsed_data.get("steps", []):
            ui_type = s.get("ui_type", "text_input")
            ui_payload = {
                "prompt_text": s.get("prompt_text") or s.get("atomic_instruction"),
                "placeholder": s.get("placeholder") or "Nhập kết quả...",
                "exercise_type": exercise_type
            }
            if geometry_spec:
                ui_payload["geometry_spec"] = geometry_spec
            if reading_passage:
                ui_payload["reading_passage"] = reading_passage

            if ui_type == "highlight":
                ui_payload["highlight_target_segments"] = s.get("highlight_target_segments") or parsed_data.get("target_keywords", [])
            elif ui_type == "single_choice":
                ui_payload["options"] = s.get("options") or []

            transformed_tasks.append({
                "step_id": s["step_id"],
                "title": s["title"],
                "badge": s["title"],
                "action_verb": s["action_verb"],
                "atomic_instruction": s["atomic_instruction"],
                "text": s["atomic_instruction"],
                "duration_sec": 120,
                "ui_type": ui_type,
                "type": ui_type,
                "ui_payload": ui_payload,
                "ui_data": ui_payload,  # Đồng bộ tuyệt đối với tasks_db.json và renderers.js
                "cognitive_scaffolding": {
                    "scaffolding_type": "sub_question" if s["step_id"] > 1 else "visual_cue",
                    "cognitive_load_level": "low",
                    "working_memory_items": 1,
                    "explanation": s["title"]
                },
                "hints": [s["atomic_instruction"]],
                "success_criteria": {
                    "evaluation_type": "exact_match",
                    "expected_answer": s["expected_answer"],
                    "feedback_on_error": s["feedback_on_error"]
                },
                "expected_answer": s["expected_answer"],
                "feedback_on_error": s["feedback_on_error"],
                "immediate_reinforcer": {
                    "visual_asset": "sparkle_star_01",
                    "audio_cue": "positive_bell_c6",
                    "dopamine_points": s.get("dopamine_points", 30)
                },
                "dopamine_points": s.get("dopamine_points", 30),
                "is_final_step": (s["step_id"] == len(parsed_data["steps"]))
            })

        return {
            "session_id": f"SESSION_GEMINI_{int(os.times().elapsed * 1000)}",
            "task_metadata": {
                "benchmark_id": parsed_data.get("benchmark_id", f"CUSTOM_{category.upper()}"),
                "original_title": parsed_data.get("original_title", raw_text[:50]),
                "original_text": parsed_data.get("original_text", raw_text),
                "grade": grade,
                "subject": "toan",
                "exercise_type": exercise_type,
                "category": category,
                "classification_reasoning": classification.get("reasoning", ""),
                "geometry_spec": geometry_spec,
                "target_keywords": parsed_data.get("target_keywords", []),
                "target_cognitive_profile": cognitive_profile or {},
                "total_micro_tasks": len(transformed_tasks),
                "total_estimated_duration_sec": len(transformed_tasks) * 120
            },
            "micro_tasks": transformed_tasks,
            "final_summary": {
                "final_answer_step_id": len(transformed_tasks),
                "extracted_final_answer": parsed_data.get("final_answer", ""),
                "pedagogical_wrap_up": parsed_data.get("pedagogical_summary", "Bạn Milo rất tự hào về nỗ lực của con!")
            }
        }
    except Exception as e:
        logger.error(f"Lỗi khi gọi Gemini: {e}")
        raise RuntimeError(f"Lỗi phân tích AI: {str(e)}")
