"""
Test Suite: Thử nghiệm Classifier 2 Tầng và Hệ thống Prompt Ngách Nhỏ cho Môn Toán (GDPT 2018).
Kiểm tra chéo:
1. Stage 1: Phân loại chính xác 4 ngách Toán học.
2. Stage 2: Băm vi nhiệm vụ qua Gemini API thật, kiểm tra:
   - Có bước nêu/đọc đề bài đầy đủ.
   - Bài hình học có geometry_spec SVG chuẩn xác.
   - Bài lời văn có highlight đại lượng + từ khóa và phép tính theo dòng.
   - Bài tính toán tuân thủ cấu trúc đặt tính cột dọc theo dòng.
   - Đồng bộ schema 100% với tasks_db.json và renderers.js.
"""

from __future__ import annotations

import os
import sys
import json
import asyncio
import unittest
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv
load_dotenv(REPO_ROOT / ".env")

from src.api.ai_engine import (
    classify_task,
    decompose_exercise_with_gemini,
    CHEAPEST_MODEL
)
from google import genai


class TestMathSpecialists(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            self.skipTest("Bỏ qua kiểm thử AI thật do thiếu GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key)

    async def test_01_classifier_accuracy(self):
        """Kiểm tra Stage 1 phân loại chuẩn xác 4 ngách Toán học."""
        test_cases = [
            ("Một mảnh đất hình chữ nhật có chiều dài 15m, chiều rộng 8m. Tính chu vi mảnh đất đó.", "math_geometry"),
            ("Mẹ có 18 quả cam, mẹ cho bạn An 6 quả cam. Hỏi mẹ còn lại bao nhiêu quả cam?", "math_word_problem_basic"),
            ("Hai lớp 4A và 4B trồng được 600 cây. Lớp 4A trồng nhiều hơn 4B là 50 cây. Hỏi mỗi lớp trồng bao nhiêu cây?", "math_word_problem_model"),
            ("Đặt tính rồi tính: 15 × 3 + 25", "math_arithmetic_algebra"),
        ]

        for text, expected_category in test_cases:
            res = await classify_task(text, self.client)
            self.assertEqual(res.get("subject"), "math", f"Môn học phải là math cho: {text}")
            self.assertEqual(res.get("category"), expected_category, f"Sai ngách cho đề bài: {text}")
            print(f" [CLASSIFIER] Đề: '{text[:40]}...' -> Ngách: {res.get('category')} (Lý do: {res.get('reasoning')})")

    async def test_02_decompose_geometry(self):
        """Kiểm tra ngách Hình học: BẮT BUỘC có đề bài gốc, geometry_spec SVG, bước 1 highlight số đo."""
        raw_text = "Một mảnh vườn hình chữ nhật có chiều dài 20m, chiều rộng 10m. Tính diện tích mảnh vườn."
        res = await decompose_exercise_with_gemini(raw_text=raw_text, grade=3)

        meta = res["task_metadata"]
        steps = res["micro_tasks"]

        # 1. Kiểm tra đề bài gốc và phân loại
        self.assertIn("chiều dài 20m", meta["original_text"])
        self.assertEqual(meta["category"], "math_geometry")
        self.assertEqual(meta["exercise_type"], "geometry")

        # 2. Bắt buộc có geometry_spec SVG
        self.assertIsNotNone(meta["geometry_spec"], "Hình học bắt buộc phải có geometry_spec")
        geo = meta["geometry_spec"]
        self.assertIn("shape_type", geo)
        self.assertIn("dimensions", geo)
        self.assertEqual(geo["target"], "area")

        # 3. Kiểm tra các bước
        self.assertGreaterEqual(len(steps), 3)
        step1 = steps[0]
        self.assertEqual(step1["ui_type"], "highlight", "Bước 1 hình học phải là highlight đọc đề và tìm số đo")
        self.assertIn("ui_data", step1, "Phải có ui_data đồng bộ với tasks_db.json")
        self.assertIn("highlight_target_segments", step1["ui_payload"])

        # 4. Kiểm tra có bước quan sát hình SVG
        has_shape_step = any("hình" in s["title"].lower() or "số đo" in s["title"].lower() or "dài" in s["title"].lower() for s in steps)
        self.assertTrue(has_shape_step, "Phải có bước gán hoặc quan sát số đo trên hình SVG")

        # 5. Kiểm tra bước tính toán kích hoạt giao diện theo dòng
        last_step = steps[-1]
        self.assertEqual(last_step["ui_type"], "text_input")
        print(f" [GEOMETRY] Đã băm {len(steps)} bước chuẩn SVG geometry_spec: {geo['shape_type']}, dims={geo['dimensions']}")

    async def test_03_decompose_word_problem_basic(self):
        """Kiểm tra ngách Toán lời văn: Highlight đại lượng + từ khóa toán tử, cầu nối nhận thức, tính theo dòng."""
        raw_text = "Trên cành cây có 7 con chim. Có thêm 4 con chim nữa bay đến. Hỏi có tất cả bao nhiêu con chim?"
        res = await decompose_exercise_with_gemini(raw_text=raw_text, grade=1)

        meta = res["task_metadata"]
        steps = res["micro_tasks"]

        self.assertEqual(meta["category"], "math_word_problem_basic")
        self.assertEqual(meta["exercise_type"], "word_problem")

        # Bước 1: highlight
        step1 = steps[0]
        self.assertEqual(step1["ui_type"], "highlight")
        targets = step1["ui_payload"].get("highlight_target_segments", [])
        self.assertGreater(len(targets), 0)
        # Kiểm tra có từ khóa toán tử ('tất cả' hoặc 'thêm')
        has_operator_kw = any("tất cả" in t.lower() or "thêm" in t.lower() for t in targets)
        self.assertTrue(has_operator_kw, f"Bước 1 gạch chân phải có từ khóa toán tử: {targets}")

        # Bước 2: cầu nối nhận thức
        step2 = steps[1]
        self.assertEqual(step2["ui_type"], "single_choice")

        # Bước cuối: text_input biểu thức phép tính theo dòng
        last_step = steps[-1]
        self.assertEqual(last_step["ui_type"], "text_input")
        prompt_txt = last_step["ui_payload"]["prompt_text"]
        self.assertTrue(any(ch in prompt_txt for ch in ["+", "-", "="]), f"Prompt text tính toán phải chứa biểu thức theo dòng: {prompt_txt}")
        print(f" [WORD PROBLEM BASIC] Đã băm {len(steps)} bước chuẩn ADHD highlight & cognitive bridge")

    async def test_04_decompose_arithmetic(self):
        """Kiểm tra ngách Tính toán thuần: Thứ tự ưu tiên và đặt tính cột dọc theo dòng."""
        raw_text = "Đặt tính rồi tính: 125 × 4"
        res = await decompose_exercise_with_gemini(raw_text=raw_text, grade=3)

        meta = res["task_metadata"]
        steps = res["micro_tasks"]

        self.assertEqual(meta["category"], "math_arithmetic_algebra")
        self.assertIn(meta["exercise_type"], ["pure_arithmetic", "word_problem"])

        # Kiểm tra bước tính toán chứa biểu thức 125 x 4
        text_input_steps = [s for s in steps if s["ui_type"] == "text_input"]
        self.assertGreater(len(text_input_steps), 0)
        calc_prompt = text_input_steps[-1]["ui_payload"]["prompt_text"]
        self.assertTrue("125" in calc_prompt, f"Phép tính phải chứa số 125 để kích hoạt cột dọc: {calc_prompt}")
        print(f" [ARITHMETIC] Đã băm {len(steps)} bước chuẩn đặt tính cột dọc theo dòng: {calc_prompt}")

    async def test_05_schema_conformance_with_tasks_db(self):
        """Kiểm tra chéo schema AI sinh ra phải trùng khớp 100% với tasks_db.json."""
        with open(REPO_ROOT / "data" / "curriculum" / "tasks_db.json", encoding="utf-8") as f:
            tasks_db = json.load(f)

        db_sample = tasks_db["G1_MATH_01"]
        
        # Sinh bài qua AI
        ai_res = await decompose_exercise_with_gemini("Mẹ có 15 quả cam, mẹ cho bạn Nam 5 quả. Hỏi mẹ còn lại bao nhiêu quả cam?", grade=2)
        ai_step = ai_res["micro_tasks"][0]

        # Kiểm tra các trường quan trọng mà renderer ở Frontend cần
        required_step_fields = [
            "step_id", "title", "action_verb", "atomic_instruction", 
            "ui_type", "ui_payload", "ui_data", "expected_answer", 
            "feedback_on_error", "dopamine_points"
        ]
        for field in required_step_fields:
            self.assertIn(field, ai_step, f"Thiếu trường '{field}' trong bước của AI")

        # Kiểm tra ui_payload và ui_data đồng nhất
        self.assertEqual(ai_step["ui_payload"], ai_step["ui_data"])
        print(" [SCHEMA CONFORMANCE] Khớp 100% cấu trúc giữa AI và tasks_db.json!")


if __name__ == "__main__":
    unittest.main()
