import os
import sys
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

sample_decomposition = {
  "session_id": "session_adhd_g3_math_001",
  "task_metadata": {
    "benchmark_id": "G3-M-01",
    "original_title": "Bài toán hai buổi bán gạo",
    "grade": 3,
    "subject": "toan",
    "total_micro_tasks": 3,
    "total_estimated_duration_sec": 360
  },
  "micro_tasks": [
    {
      "step_id": 1,
      "title": "Tính số gạo còn lại sau buổi sáng",
      "action_verb": "Tính",
      "atomic_instruction": "Lấy 45 trừ 15 để tìm số gạo còn lại sau buổi sáng.",
      "duration_sec": 120,
      "ui_type": "text_input",
      "ui_payload": {"placeholder": "Nhập số kg gạo còn lại..."},
      "cognitive_scaffolding": {
        "scaffolding_type": "sub_question",
        "cognitive_load_level": "low",
        "working_memory_items": 2,
        "explanation": "Chia nhỏ bài toán phức hợp bằng cách giải quyết phần số gạo sau buổi sáng trước."
      },
      "hints": ["Buổi sáng bán được 15 kg trong tổng số 45 kg.", "Thực hiện phép trừ: 45 - 15."],
      "success_criteria": {
        "evaluation_type": "exact_match",
        "expected_answer": "30",
        "feedback_on_error": "Milo gợi ý: Ta lấy 45 trừ đi 15, con thử trừ hàng đơn vị trước nhé!"
      },
      "immediate_reinforcer": {
        "visual_asset": "sparkle_star_01",
        "audio_cue": "sparkle_ting_short",
        "dopamine_points": 25
      },
      "is_final_step": False
    },
    {
      "step_id": 2,
      "title": "Tính số gạo bán được trong buổi chiều",
      "action_verb": "Tính",
      "atomic_instruction": "Lấy 30 chia cho 3 để tìm số gạo bán buổi chiều.",
      "duration_sec": 120,
      "ui_type": "text_input",
      "ui_payload": {"placeholder": "Nhập số kg gạo bán buổi chiều..."},
      "cognitive_scaffolding": {
        "scaffolding_type": "fill_in_the_blank",
        "cognitive_load_level": "medium",
        "working_memory_items": 2,
        "explanation": "Tìm giá trị của một phần ba từ kết quả vừa tìm được ở bước 1."
      },
      "hints": ["Buổi chiều bán 1/3 của 30 kg gạo còn lại.", "Thực hiện phép chia: 30 : 3."],
      "success_criteria": {
        "evaluation_type": "exact_match",
        "expected_answer": "10",
        "feedback_on_error": "Milo cùng con nhẩm nhé: 3 nhân mấy bằng 30 nào?"
      },
      "immediate_reinforcer": {
        "visual_asset": "particle_burst_gold",
        "audio_cue": "positive_bell_c6",
        "dopamine_points": 35
      },
      "is_final_step": False
    },
    {
      "step_id": 3,
      "title": "Tính số gạo còn lại cuối cùng",
      "action_verb": "Tính",
      "atomic_instruction": "Lấy 30 trừ 10 để tìm số gạo còn lại sau hai buổi.",
      "duration_sec": 120,
      "ui_type": "text_input",
      "ui_payload": {"placeholder": "Nhập số kg gạo còn lại cuối cùng..."},
      "cognitive_scaffolding": {
        "scaffolding_type": "worked_example",
        "cognitive_load_level": "low",
        "working_memory_items": 2,
        "explanation": "Chốt đáp án cuối cùng của bài toán."
      },
      "hints": ["Lấy số gạo còn sau sáng (30) trừ số gạo bán chiều (10).", "30 - 10 = ?"],
      "success_criteria": {
        "evaluation_type": "exact_match",
        "expected_answer": "20 kg",
        "feedback_on_error": "Con đã rất gần đích rồi! Lấy 3 chục trừ 1 chục bằng mấy chục?"
      },
      "immediate_reinforcer": {
        "visual_asset": "milo_thumbs_up",
        "audio_cue": "harp_glissando_soft",
        "dopamine_points": 40
      },
      "is_final_step": True
    }
  ],
  "final_summary": {
    "final_answer_step_id": 3,
    "extracted_final_answer": "20 kg",
    "pedagogical_wrap_up": "Xuất sắc! Con đã kiên trì tìm được số gạo còn lại của từng buổi và hoàn thành bài toán 20 kg."
  }
}

judge_prompt = f"""
Bạn là Chuyên gia Giám khảo Sư phạm & Thần kinh Nhận thức (Pedagogical & Neurodevelopmental Judge) đánh giá chất lượng chuỗi Micro-Task can thiệp cho học sinh tiểu học ADHD (Lớp 1-5).

BÀI TẬP ĐẦU VÀO:
Đề bài: Một cửa hàng có 45 kg gạo, buổi sáng bán được 15 kg gạo, buổi chiều bán được số gạo bằng 1/3 số gạo còn lại. Hỏi sau cả hai buổi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?
Ground truth:
- Bước 1: Số gạo còn lại sau buổi sáng: 45 - 15 = 30 (kg)
- Bước 2: Số gạo buổi chiều bán: 30 : 3 = 10 (kg)
- Bước 3: Số gạo còn lại sau cả hai buổi: 30 - 10 = 20 (kg)
- Đáp số: 20 kg gạo

KẾT QUẢ PHÂN RÃ MICRO-TASK CẦN CHẤM:
{json.dumps(sample_decomposition, ensure_ascii=False, indent=2)}

TIÊU CHÍ ĐÁNH GIÁ (Thang điểm 1-10 cho mỗi tiêu chí):
1. Logic Flow (Dòng chảy logic sư phạm):
   - Chuỗi bước có logic chặt chẽ, mạch lạc, không nhảy cóc?
   - Các bước trung gian có giải quyết triệt để vấn đề không?
   - Bước cuối cùng có dẫn tới đáp số đúng không?
2. Cognitive Scaffolding (Giàn giáo nhận thức & Giảm tải bộ nhớ làm việc):
   - Thời lượng mỗi bước có phù hợp (60s - 300s)?
   - Câu lệnh có nguyên tử (atomic, 1 động từ hành động đơn nhất, ngắn gọn <= 25 từ)?
   - Loại tương tác (ui_type) có phù hợp với nhận thức của học sinh tiểu học không?
   - Tải nhận thức có được kiểm soát tốt không?
3. Hint Appropriateness & RSD Calming (Gợi ý bậc thang & Phòng ngừa RSD):
   - Các gợi ý có mang tính bậc thang dẫn dắt tư duy thay vì làm hộ?
   - Phản hồi khi sai (feedback_on_error) có ấm áp, thấu cảm, không phán xét, triệt tiêu phản ứng RSD không?
   - Cơ chế củng cố dopamine tức thì có phù hợp không?

YÊU CẦU ĐẦU RA:
Bắt buộc xuất JSON theo cấu trúc sau:
{{
  "logic_flow_score": float (1.0 - 10.0),
  "logic_flow_rationale": "chuỗi nhận xét",
  "cognitive_scaffolding_score": float (1.0 - 10.0),
  "cognitive_scaffolding_rationale": "chuỗi nhận xét",
  "hint_appropriateness_score": float (1.0 - 10.0),
  "hint_appropriateness_rationale": "chuỗi nhận xét",
  "pedagogical_average_score": float (1.0 - 10.0),
  "is_passed": boolean (true nếu pedagogical_average_score >= 8.5),
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "improvement_suggestions": ["gợi ý cải thiện 1"]
}}
"""

judge_schema = {
    "type": "object",
    "required": [
        "logic_flow_score", "logic_flow_rationale",
        "cognitive_scaffolding_score", "cognitive_scaffolding_rationale",
        "hint_appropriateness_score", "hint_appropriateness_rationale",
        "pedagogical_average_score", "is_passed",
        "strengths", "improvement_suggestions"
    ],
    "properties": {
        "logic_flow_score": {"type": "number"},
        "logic_flow_rationale": {"type": "string"},
        "cognitive_scaffolding_score": {"type": "number"},
        "cognitive_scaffolding_rationale": {"type": "string"},
        "hint_appropriateness_score": {"type": "number"},
        "hint_appropriateness_rationale": {"type": "string"},
        "pedagogical_average_score": {"type": "number"},
        "is_passed": {"type": "boolean"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "improvement_suggestions": {"type": "array", "items": {"type": "string"}}
    }
}

resp = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=judge_prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=judge_schema,
        temperature=0.1
    )
)

print("LLM Judge Result:")
print(resp.text)
