import os
import sys
import json
from dotenv import load_dotenv
from jsonschema import Draft7Validator
from google import genai
from google.genai import types

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

# Load schema
with open("test_schema_check.json", "r", encoding="utf-8") as f:
    schema = json.load(f)

validator = Draft7Validator(schema)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

prompt = """
[BÀI TẬP ĐỐI CHUẨN]
Đề bài: Một cửa hàng có 45 kg gạo, buổi sáng bán được 15 kg gạo, buổi chiều bán được số gạo bằng 1/3 số gạo còn lại. Hỏi sau cả hai buổi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?
Lớp: 3
Môn: Toán

[HỒ SƠ NHẬN THỨC CỦA TRẺ - COGNITIVE PROFILE]
- attention_span_minutes: 10
- recommended_micro_task_duration_sec: 120
- working_memory_capacity: 2
- rsd_sensitivity_level: HIGH
- scaffolding_level: INTENSIVE
- Directives:
  * Mỗi micro-task CHỈ chứa đúng 1 động từ hành động đơn nhất (như Đọc, Gạch chân, Tính, Chọn).
  * Thời lượng mỗi bước: 120 giây (trong khoảng 60s - 300s).
  * Hạn chế tối đa tải nhận thức, hướng dẫn từng bước nhỏ.
  * Giọng điệu thân thiện, ấm áp của robot Milo, không chê bai, dập tắt RSD.
  * Bước cuối cùng (is_final_step: true) phải chốt đáp số chính xác.

Yêu cầu: Xuất ra cấu trúc JSON tuân thủ nghiêm ngặt Schema.
"""

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.2
    )
)

print("Generated response length:", len(response.text))
try:
    data = json.loads(response.text)
    errors = list(validator.iter_errors(data))
    if not errors:
        print("PERFECT VALIDATION: 100% compliant with Draft-07 schema!")
        print("Total micro-tasks:", len(data.get("micro_tasks", [])))
        for mt in data.get("micro_tasks", []):
            print(f"  Step {mt.get('step_id')}: [{mt.get('action_verb')}] {mt.get('atomic_instruction')} ({mt.get('duration_sec')}s, UI: {mt.get('ui_type')})")
        print("Final extracted answer:", data.get("final_summary", {}).get("extracted_final_answer"))
    else:
        print(f"Validation errors ({len(errors)}):")
        for err in errors:
            print(f"  Path: {list(err.path)} -> {err.message}")
except Exception as e:
    print("JSON parsing failed:", e)
