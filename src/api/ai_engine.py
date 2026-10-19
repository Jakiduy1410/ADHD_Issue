"""
AI Task Decomposer Engine using Gemini 3.5 Flash Lite (Rẻ nhất, tốc độ cao nhất ~1s).
Không có fallback giả mạo hay bịa đặt số liệu.
Nếu lỗi API hoặc không phân tích được -> Trả về lỗi rõ ràng để phụ huynh biết.
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Model rẻ và nhẹ nhất trong họ Gemini hiện nay
CHEAPEST_MODEL = "gemini-3.5-flash-lite"

DECOMPOSER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "benchmark_id": {"type": "STRING"},
        "original_title": {"type": "STRING"},
        "exercise_type": {
            "type": "STRING",
            "enum": ["word_problem", "reading_comprehension", "geometry", "pure_arithmetic", "find_x"],
            "description": "Phân loại dạng bài để kích hoạt UI và giàn giáo nhận thức tương ứng"
        },
        "subject": {"type": "STRING", "enum": ["toan", "tieng_viet", "tieng_anh", "khoa_hoc_tu_nhien"]},
        "reading_passage": {
            "type": "STRING",
            "description": "Chỉ dùng cho bài đọc hiểu: Toàn bộ đoạn văn/câu chuyện gốc để tham chiếu. Tuyệt đối không nhét câu hỏi hay đáp án trắc nghiệm vào đây."
        },
        "geometry_spec": {
            "type": "OBJECT",
            "properties": {
                "shape_type": {"type": "STRING", "enum": ["rectangle", "square", "parallelogram", "triangle", "nested"]},
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
                "nested_label": {"type": "STRING", "description": "Tên hình phụ bên trong nếu là nested (ví dụ: 'Ao cá', 'Lối đi')"}
            },
            "description": "Thông số hình học để hệ thống vẽ hình SVG trực quan cho trẻ ADHD"
        },
        "target_keywords": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Bao gồm cả: (1) Các số liệu kèm đơn vị ('15 quyển vở', '12 000 đồng'), (2) Quan hệ đại lượng ('gấp đôi', 'mỗi quyển'), và (3) Từ khóa YÊU CẦU ĐỀ BÀI CẦN TÍNH ('phải trả bao nhiêu tiền', 'tất cả', 'nặng bao nhiêu')"
        },
        "steps": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "step_id": {"type": "INTEGER"},
                    "title": {"type": "STRING", "description": "Tên bước, ví dụ: 'Đổi đơn vị tấn sang kg'"},
                    "action_verb": {"type": "STRING", "description": "1 động từ hành động đơn nhất: Gạch_chân, Chọn, Tính, Điền"},
                    "atomic_instruction": {"type": "STRING", "description": "Chỉ dẫn ngắn dưới 15 từ cho trẻ"},
                    "ui_type": {
                        "type": "STRING",
                        "enum": ["highlight", "single_choice", "text_input"],
                        "description": "BƯỚC 1 của bài toán có lời văn và hình học BẮT BUỘC là 'highlight'. Bước 2 là 'single_choice' (cầu nối nhận thức). Bước cuối là 'text_input'."
                    },
                    "prompt_text": {"type": "STRING", "description": "Câu hỏi/nội dung hiển thị trong thẻ"},
                    "reading_excerpt": {
                        "type": "STRING",
                        "description": "Chỉ dùng cho đọc hiểu: Câu trích dẫn ngắn trong bài đọc để trẻ tìm kiếm manh mối"
                    },
                    "highlight_target_segments": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Các cụm từ cần gạch chân nếu ui_type là highlight (bắt buộc gồm dữ kiện số và từ khóa chỉ định toán tử như 'tất cả', 'thêm', 'bớt', 'còn lại')"
                    },
                    "options": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Các lựa chọn A, B, C nếu ui_type là single_choice"
                    },
                    "placeholder": {"type": "STRING", "description": "Placeholder cho ô nhập nếu là text_input"},
                    "expected_answer": {"type": "STRING", "description": "Đáp án chuẩn xác tuyệt đối"},
                    "feedback_on_error": {"type": "STRING", "description": "Lời động viên nhẹ nhàng của Robot Milo nếu trẻ làm sai (RSD-safe)"},
                    "dopamine_points": {"type": "INTEGER"}
                },
                "required": ["step_id", "title", "action_verb", "atomic_instruction", "ui_type", "expected_answer", "feedback_on_error"]
            }
        },
        "final_answer": {"type": "STRING"},
        "pedagogical_summary": {"type": "STRING"}
    },
    "required": ["original_title", "subject", "exercise_type", "target_keywords", "steps", "final_answer"]
}

def load_decomposer_prompt() -> str:
    from pathlib import Path
    repo_root = Path(__file__).resolve().parents[2]
    prompt_path = repo_root / "prompts" / "micro_task_decomposer.md"
    if prompt_path.is_file():
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Không thể đọc {prompt_path}: {e}")
    return "Bạn là Chuyên gia Sư phạm và Khoa học Thần kinh Thấu hiểu trẻ ADHD tiểu học."


async def decompose_exercise_with_gemini(raw_text: str, grade: int = 3, cognitive_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env! Không thể băm bài.")

    client = genai.Client(api_key=api_key)

    user_prompt = f"""
Đề bài gốc:
"{raw_text}"

Khối lớp: Lớp {grade}
Hồ sơ nhận thức trẻ: {json.dumps(cognitive_profile or {}, ensure_ascii=False)}

Hãy phân tích và băm bài này thành chuỗi vi nhiệm vụ nguyên tử (3 đến 4 bước) theo đúng JSON Schema đã định.
LƯU Ý QUAN TRỌNG:
- Với bài toán có lời văn: BƯỚC 1 BẮT BUỘC là 'highlight' gạch chân số liệu và từ khóa chỉ định toán tử (ví dụ: 'tất cả', 'thêm', 'bớt', 'còn lại').
- BƯỚC 2 BẮT BUỘC là 'single_choice' hỏi ý nghĩa từ khóa (cầu nối nhận thức).
- BƯỚC 3: Chọn phép tính ('single_choice').
- BƯỚC 4: Tính kết quả ('text_input').
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
                        system_instruction=load_decomposer_prompt(),
                        response_mime_type="application/json",
                        response_schema=DECOMPOSER_SCHEMA,
                        temperature=0.2
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
        
        # Transform into our standard micro_task format
        transformed_tasks = []
        exercise_type = parsed_data.get("exercise_type", "word_problem")
        reading_passage = parsed_data.get("reading_passage")
        geometry_spec = parsed_data.get("geometry_spec")

        for s in parsed_data.get("steps", []):
            ui_type = s.get("ui_type", "text_input")
            ui_payload = {
                "prompt_text": s.get("prompt_text") or s.get("atomic_instruction"),
                "placeholder": s.get("placeholder") or "Nhập kết quả...",
                "exercise_type": exercise_type
            }
            if reading_passage:
                ui_payload["reading_passage"] = reading_passage
            if s.get("reading_excerpt"):
                ui_payload["reading_excerpt"] = s.get("reading_excerpt")
            if geometry_spec:
                ui_payload["geometry_spec"] = geometry_spec

            if ui_type == "highlight":
                ui_payload["highlight_target_segments"] = s.get("highlight_target_segments") or parsed_data.get("target_keywords", [])
            elif ui_type == "single_choice":
                ui_payload["options"] = s.get("options") or []

            transformed_tasks.append({
                "step_id": s["step_id"],
                "title": s["title"],
                "action_verb": s["action_verb"],
                "atomic_instruction": s["atomic_instruction"],
                "duration_sec": 120,
                "ui_type": ui_type,
                "ui_payload": ui_payload,
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
                "immediate_reinforcer": {
                    "visual_asset": "sparkle_star_01",
                    "audio_cue": "positive_bell_c6",
                    "dopamine_points": s.get("dopamine_points", 30)
                },
                "is_final_step": (s["step_id"] == len(parsed_data["steps"]))
            })

        return {
            "session_id": f"SESSION_GEMINI_{int(os.times().elapsed * 1000)}",
            "task_metadata": {
                "benchmark_id": parsed_data.get("benchmark_id", "AI_CUSTOM_TASK"),
                "original_title": parsed_data.get("original_title", raw_text[:50]),
                "grade": grade,
                "subject": parsed_data.get("subject", "toan"),
                "exercise_type": exercise_type,
                "reading_passage": reading_passage,
                "geometry_spec": geometry_spec,
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
