"""
Automated Python Regression & Path Integrity Test Suite for Milestone M5 (Requirement R7).

Verifies:
- Test 1: Folder Structure & Path Integrity:
  * 4 research markdown files exist in docs/research/
  * docs/reports/ holds the committed BENCHMARK_SUMMARY.md (benchmark_report.json is a gitignored generated artifact)
  * 2 files exist in docs/infra/
  * scratch/prompt_experiment_report.md exists and contains "RSD"
  * No loose research markdown files left at project root
- Test 2: Parent Survey Scoring Math Parity:
  * Parity of src.adhd_scoring.scoring_service.calculate_cognitive_profile
  * Verification across diverse vectors (all 0s, all 1s, all 2s, all 3s, mixed clinical vectors)
  * Normalized indices: I_EF, I_AS, I_RSD, and Composite Deficit Index (CDI)
  * Duration clamping strictly between 60s and 300s
  * RSD level enums: LOW, MEDIUM, HIGH, SEVERE
  * Scaffolding level enums: MINIMAL, MODERATE, INTENSIVE
- Test 3: Micro-Task Schema Conformance:
  * Adherence to schemas/micro_task_schema.json Draft-07
  * Single action verb token regex (^[a-zA-ZÀ-ỹ_]+$)
  * Step duration bounded between 60s and 300s
  * All required session and micro-task fields present
  * Schema rejection on invalid duration or multi-word verbs
- Test 4: Answer Validation Logic:
  * Normalization (whitespace stripping, lowercasing, spacing collapse)
  * Vietnamese decimal comma normalization ('12,5' == '12.5')
  * Strict rejection of incorrect answers and fuzz
  * Acceptance of exact match and numeric equivalence
  * Multi-variant expected answer array support
- Test 5: Frontend UI & Accessibility Contract:
  * #parent-survey-modal DOM container
  * #parent-cognitive-profile-badge with openSurveyModal() handler
  * .btn-3d-amber styling class
  * .btn-disabled styling with WCAG AA compliant text color (#475569)
  * Sticky batch action container for dispatching selected catalog tasks
"""

from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import jsonschema

# Ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from src.adhd_scoring.scoring_service import (
    ScoringService,
    calculate_cognitive_profile,
    validate_survey_answers,
)


class TestR7RefactorRegression(unittest.TestCase):
    """E2E & Regression test suite for Requirement R7 refactoring."""

    @classmethod
    def setUpClass(cls):
        cls.repo_root = REPO_ROOT
        cls.docs_dir = cls.repo_root / "docs"
        cls.research_dir = cls.docs_dir / "research"
        cls.reports_dir = cls.docs_dir / "reports"
        cls.infra_dir = cls.docs_dir / "infra"
        cls.scratch_dir = cls.repo_root / "scratch"
        cls.schemas_dir = cls.repo_root / "schemas"
        cls.schema_file = cls.schemas_dir / "micro_task_schema.json"
        cls.index_html_file = cls.repo_root / "index.html"

        # Load JSON schema Draft-07
        with open(cls.schema_file, "r", encoding="utf-8") as f:
            cls.schema_data = json.load(f)
        cls.validator = jsonschema.Draft7Validator(cls.schema_data)

        # Read app files into html_content
        app_dir = cls.repo_root / "app"
        js_code = "\n".join(f.read_text(encoding="utf-8") for f in sorted((app_dir / "js").glob("*.js")))
        cls.html_content = (
            (app_dir / "index.html").read_text(encoding="utf-8")
            + "\n"
            + js_code
            + "\n"
            + (app_dir / "css" / "style.css").read_text(encoding="utf-8")
        )

    # =========================================================================
    # TEST 1: FOLDER STRUCTURE & PATH INTEGRITY
    # =========================================================================

    def test_01_docs_research_folder_integrity(self):
        """Assert that exactly 4 research markdown files exist in docs/research/."""
        self.assertTrue(self.research_dir.is_dir(), f"Missing directory: {self.research_dir}")

        expected_research_files = [
            "AI Can Thiệp ADHD.md",
            "AI Parent Coach (1).md",
            "Nguyên nhân và Giải pháp.md",
            "Ứng dụng AI cho ADHD (1).md",
        ]

        actual_md_files = [f.name for f in self.research_dir.glob("*.md")]
        self.assertEqual(
            len(actual_md_files), 4,
            f"Expected exactly 4 markdown files in docs/research/, found {len(actual_md_files)}: {actual_md_files}"
        )

        for filename in expected_research_files:
            file_path = self.research_dir / filename
            self.assertTrue(
                file_path.is_file(),
                f"Missing expected research document: {file_path}"
            )
            self.assertGreater(
                file_path.stat().st_size, 0,
                f"Research file is empty: {file_path}"
            )

        # Assert no loose research files left behind at project root
        for filename in expected_research_files:
            root_copy = self.repo_root / filename
            self.assertFalse(
                root_copy.exists(),
                f"Loose research document found at project root: {root_copy}. Should only exist in docs/research/"
            )

    def test_02_docs_reports_folder_integrity(self):
        """Assert docs/reports/ holds the committed benchmark summary.

        BENCHMARK_SUMMARY.md is the committed deliverable and must exist.
        benchmark_report.json is a generated artifact: the project .gitignore
        deliberately excludes it (regenerate with
        `python archive/benchmark/run_benchmark.py`), so it is not required
        to ship — but when present it must be valid, non-empty JSON.
        No other stray files may live in docs/reports/.
        """
        self.assertTrue(self.reports_dir.is_dir(), f"Missing directory: {self.reports_dir}")

        committed_files = ["BENCHMARK_SUMMARY.md"]
        generated_files = ["benchmark_report.json"]

        actual_files = [f.name for f in self.reports_dir.iterdir() if f.is_file()]
        unexpected = [f for f in actual_files if f not in committed_files + generated_files]
        self.assertEqual(
            unexpected, [],
            f"Unexpected files in docs/reports/: {unexpected} (found: {actual_files})"
        )

        for filename in committed_files:
            file_path = self.reports_dir / filename
            self.assertTrue(
                file_path.is_file(),
                f"Missing expected report file: {file_path}"
            )
            self.assertGreater(
                file_path.stat().st_size, 0,
                f"Report file is empty: {file_path}"
            )
            # Root must not have loose report files
            root_copy = self.repo_root / filename
            self.assertFalse(
                root_copy.exists(),
                f"Loose report file found at project root: {root_copy}"
            )

        report_json = self.reports_dir / "benchmark_report.json"
        if report_json.is_file():
            self.assertGreater(report_json.stat().st_size, 0, "benchmark_report.json is empty")
            data = json.loads(report_json.read_text(encoding="utf-8"))
            self.assertTrue(data, "benchmark_report.json must contain a non-empty JSON document")

    def test_03_docs_infra_folder_integrity(self):
        """Assert that 2 files exist in docs/infra/."""
        self.assertTrue(self.infra_dir.is_dir(), f"Missing directory: {self.infra_dir}")

        expected_infra_files = [
            "TEST_INFRA.md",
            "TEST_READY.md",
        ]

        actual_files = [f.name for f in self.infra_dir.iterdir() if f.is_file()]
        self.assertEqual(
            len(actual_files), 2,
            f"Expected exactly 2 files in docs/infra/, found {len(actual_files)}: {actual_files}"
        )

        for filename in expected_infra_files:
            file_path = self.infra_dir / filename
            self.assertTrue(
                file_path.is_file(),
                f"Missing expected infra file: {file_path}"
            )
            self.assertGreater(
                file_path.stat().st_size, 0,
                f"Infra file is empty: {file_path}"
            )

        for filename in expected_infra_files:
            root_copy = self.repo_root / filename
            self.assertFalse(
                root_copy.exists(),
                f"Loose infra file found at project root: {root_copy}"
            )

    def test_04_scratch_prompt_experiment_report_exists_and_contains_rsd(self):
        """Assert that scratch/prompt_experiment_report.md exists and contains 'RSD'."""
        report_file = self.scratch_dir / "prompt_experiment_report.md"
        self.assertTrue(
            report_file.is_file(),
            f"Expected report file missing: {report_file}"
        )

        content = report_file.read_text(encoding="utf-8")
        self.assertIn(
            "RSD", content,
            "Expected 'RSD' keyword to be present in scratch/prompt_experiment_report.md"
        )
        self.assertIn(
            "Strict Guardrail", content,
            "Expected Strict Guardrail notice in prompt_experiment_report.md"
        )

    # =========================================================================
    # TEST 2: PARENT SURVEY SCORING MATH PARITY
    # =========================================================================

    def test_05_scoring_math_parity_minimum_vector(self):
        """Verify cognitive profile calculation on minimal deficit vector (all 0s)."""
        answers = [0] * 9
        profile = calculate_cognitive_profile(answers)

        # Subscale scores
        raw = profile["raw_scores"]
        self.assertEqual(raw["executive_function"], 0)
        self.assertEqual(raw["attention_span"], 0)
        self.assertEqual(raw["rsd_sensitivity"], 0)
        self.assertEqual(raw["total_score"], 0)

        # Normalized indices: I_EF, I_AS, I_RSD, CDI
        indices = profile["normalized_indices"]
        self.assertAlmostEqual(indices["executive_function_deficit_index"], 0.0, places=4)
        self.assertAlmostEqual(indices["attention_decay_index"], 0.0, places=4)
        self.assertAlmostEqual(indices["rejection_sensitivity_index"], 0.0, places=4)
        self.assertAlmostEqual(indices["composite_deficit_index"], 0.0, places=4)

        # Target vectors
        vec = profile["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 25)
        self.assertEqual(vec["recommended_micro_task_duration_sec"], 300)
        self.assertEqual(vec["working_memory_capacity"], 5)
        self.assertEqual(vec["rsd_sensitivity_level"], "LOW")
        self.assertEqual(vec["scaffolding_level"], "MINIMAL")
        self.assertEqual(vec["max_steps_per_session"], 6)

    def test_06_scoring_math_parity_maximum_vector(self):
        """Verify cognitive profile calculation on maximum deficit vector (all 3s)."""
        answers = [3] * 9
        profile = calculate_cognitive_profile(answers)

        raw = profile["raw_scores"]
        self.assertEqual(raw["executive_function"], 9)
        self.assertEqual(raw["attention_span"], 9)
        self.assertEqual(raw["rsd_sensitivity"], 9)
        self.assertEqual(raw["total_score"], 27)

        indices = profile["normalized_indices"]
        self.assertAlmostEqual(indices["executive_function_deficit_index"], 1.0, places=4)
        self.assertAlmostEqual(indices["attention_decay_index"], 1.0, places=4)
        self.assertAlmostEqual(indices["rejection_sensitivity_index"], 1.0, places=4)
        self.assertAlmostEqual(indices["composite_deficit_index"], 1.0, places=4)

        vec = profile["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 5)
        self.assertEqual(vec["recommended_micro_task_duration_sec"], 90)
        self.assertEqual(vec["working_memory_capacity"], 1)
        self.assertEqual(vec["rsd_sensitivity_level"], "SEVERE")
        self.assertEqual(vec["scaffolding_level"], "INTENSIVE")
        self.assertEqual(vec["max_steps_per_session"], 3)

    def test_07_scoring_math_parity_diverse_vectors(self):
        """Verify CDI weighting formula and diverse response vector parity."""
        test_cases = [
            # answers list, expected (EF, AS, RSD, CDI, RSD_level, Scaffolding)
            ([1] * 9, 3, 3, 3, 0.3333, "MEDIUM", "MINIMAL"),
            ([2] * 9, 6, 6, 6, 0.6667, "HIGH", "MODERATE"),
            ([0, 1, 0, 2, 2, 1, 3, 2, 3], 1, 5, 8, 0.4611, "SEVERE", "MODERATE"),
            ([3, 3, 3, 0, 0, 0, 0, 0, 0], 9, 0, 0, 0.4000, "LOW", "MODERATE"),
            ([0, 0, 0, 3, 3, 3, 0, 0, 0], 0, 9, 0, 0.3500, "LOW", "MODERATE"),
            ([0, 0, 0, 0, 0, 0, 3, 3, 3], 0, 0, 9, 0.2500, "SEVERE", "MINIMAL"),
            ([3, 2, 3, 3, 3, 3, 2, 3, 2], 8, 9, 7, 0.9000, "HIGH", "INTENSIVE"),
        ]

        for answers, exp_ef, exp_as, exp_rsd, exp_cdi, exp_rsd_lvl, exp_scaffold in test_cases:
            res = calculate_cognitive_profile(answers)
            raw = res["raw_scores"]
            indices = res["normalized_indices"]
            vec = res["cognitive_profile_vector"]

            self.assertEqual(raw["executive_function"], exp_ef, f"EF mismatch for {answers}")
            self.assertEqual(raw["attention_span"], exp_as, f"AS mismatch for {answers}")
            self.assertEqual(raw["rsd_sensitivity"], exp_rsd, f"RSD mismatch for {answers}")
            self.assertAlmostEqual(indices["composite_deficit_index"], exp_cdi, delta=0.001)

            # Mathematical parity check: CDI = 0.40 * I_EF + 0.35 * I_AS + 0.25 * I_RSD
            ef_i = indices["executive_function_deficit_index"]
            as_i = indices["attention_decay_index"]
            rsd_i = indices["rejection_sensitivity_index"]
            expected_weighted = round(0.40 * ef_i + 0.35 * as_i + 0.25 * rsd_i, 4)
            self.assertAlmostEqual(indices["composite_deficit_index"], expected_weighted, places=4)

            self.assertEqual(vec["rsd_sensitivity_level"], exp_rsd_lvl)
            self.assertEqual(vec["scaffolding_level"], exp_scaffold)

    def test_08_duration_clamping_and_rsd_enums_coverage(self):
        """Verify micro-task duration is strictly clamped in [60s, 300s] and RSD enums match boundaries."""
        # Test all possible AS scores from 0 to 9
        for as_score in range(10):
            # Construct answers with AS sum = as_score
            q4 = as_score // 3
            q5 = (as_score - q4) // 2
            q6 = as_score - q4 - q5
            answers = [1, 1, 1, q4, q5, q6, 1, 1, 1]
            profile = calculate_cognitive_profile(answers)
            dur = profile["recommended_micro_task_duration_sec"]

            # Strictly clamped in [60, 300]
            self.assertGreaterEqual(dur, 60, f"Duration {dur} below 60s for AS {as_score}")
            self.assertLessEqual(dur, 300, f"Duration {dur} above 300s for AS {as_score}")
            self.assertEqual(dur % 30, 0, f"Duration {dur} not divisible by 30")

        # Test all possible RSD scores [0..9] to verify all 4 enum values:
        # LOW (0-2), MEDIUM (3-4), HIGH (5-7), SEVERE (8-9)
        expected_enums = {
            0: "LOW", 1: "LOW", 2: "LOW",
            3: "MEDIUM", 4: "MEDIUM",
            5: "HIGH", 6: "HIGH", 7: "HIGH",
            8: "SEVERE", 9: "SEVERE"
        }
        for rsd_val, expected_enum in expected_enums.items():
            q7 = rsd_val // 3
            q8 = (rsd_val - q7) // 2
            q9 = rsd_val - q7 - q8
            answers = [0, 0, 0, 0, 0, 0, q7, q8, q9]
            profile = calculate_cognitive_profile(answers)
            self.assertEqual(
                profile["rsd_sensitivity_level"], expected_enum,
                f"RSD score {rsd_val} failed to map to enum {expected_enum}"
            )

    # =========================================================================
    # TEST 3: MICRO-TASK SCHEMA CONFORMANCE (Draft-07)
    # =========================================================================

    def test_09_micro_task_schema_is_draft_07_valid(self):
        """Verify schemas/micro_task_schema.json is a valid Draft-07 JSON Schema."""
        self.assertEqual(
            self.schema_data.get("$schema"),
            "http://json-schema.org/draft-07/schema#",
            "Schema must declare Draft-07 specification"
        )
        # Check that Draft-07 meta-schema accepts our schema definition
        jsonschema.Draft7Validator.check_schema(self.schema_data)

    def test_10_canonical_decomposition_conforms_to_schema(self):
        """Validate that a standard decomposition output adheres strictly to micro_task_schema.json."""
        valid_payload = {
            "session_id": "sess_r7_verify_001",
            "task_metadata": {
                "benchmark_id": "G3_MATH_11",
                "original_title": "Bài toán hai bước tính số ki-lô-gam gạo",
                "grade": 3,
                "subject": "toan",
                "target_cognitive_profile": {
                    "attention_span_minutes": 15,
                    "recommended_micro_task_duration_sec": 120,
                    "working_memory_capacity": 3,
                    "rsd_sensitivity_level": "HIGH",
                    "scaffolding_level": "MODERATE"
                },
                "total_micro_tasks": 3,
                "total_estimated_duration_sec": 360
            },
            "micro_tasks": [
                {
                    "step_id": 1,
                    "title": "Đọc đề và tìm dữ kiện",
                    "action_verb": "Đọc",
                    "atomic_instruction": "Đọc kĩ đề bài và xác định số ki-lô-gam gạo ở bao thứ nhất.",
                    "duration_sec": 90,
                    "ui_type": "highlight",
                    "ui_payload": {
                        "prompt_text": "Bao thứ nhất có 25 kg gạo, bao thứ hai gấp đôi.",
                        "highlight_target_segments": ["25 kg gạo"]
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "visual_cue",
                        "cognitive_load_level": "low",
                        "working_memory_items": 1,
                        "explanation": "Cô lập dữ kiện 25 kg gạo vào vùng nhớ."
                    },
                    "hints": [
                        "Nhìn vào câu đầu tiên của đề bài.",
                        "Số 25 đứng cạnh đơn vị kg."
                    ],
                    "success_criteria": {
                        "evaluation_type": "keyword_containment",
                        "expected_answer": "25",
                        "feedback_on_error": "Milo gợi ý: Con hãy tìm số đứng trước chữ kg nhé! 🌱"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "milo_thumbs_up",
                        "audio_cue": "gentle_pop_success",
                        "dopamine_points": 30
                    },
                    "is_final_step": False
                },
                {
                    "step_id": 2,
                    "title": "Tính số gạo bao thứ hai",
                    "action_verb": "Tính",
                    "atomic_instruction": "Thực hiện phép tính 25 nhân 2 để tìm số gạo bao thứ hai.",
                    "duration_sec": 120,
                    "ui_type": "text_input",
                    "ui_payload": {
                        "prompt_text": "25 x 2 = ?",
                        "placeholder": "Nhập kết quả..."
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "sub_question",
                        "cognitive_load_level": "medium",
                        "working_memory_items": 2,
                        "explanation": "Tính số gạo bao thứ hai."
                    },
                    "hints": [
                        "25 + 25 bằng bao nhiêu?",
                        "Kết quả là một số tròn chục."
                    ],
                    "success_criteria": {
                        "evaluation_type": "exact_match",
                        "expected_answer": "50",
                        "feedback_on_error": "Milo gợi ý: Hãy cộng 25 với 25 một lần nữa nhé! 🌱"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "sparkle_star_01",
                        "audio_cue": "sparkle_ting_short",
                        "dopamine_points": 40
                    },
                    "is_final_step": False
                },
                {
                    "step_id": 3,
                    "title": "Tính tổng số gạo cả hai bao",
                    "action_verb": "Tính",
                    "atomic_instruction": "Cộng số gạo cả hai bao: 25 + 50.",
                    "duration_sec": 150,
                    "ui_type": "single_choice",
                    "ui_payload": {
                        "prompt_text": "25 + 50 = ?",
                        "options": ["65 kg", "75 kg", "80 kg"]
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "worked_example",
                        "cognitive_load_level": "medium",
                        "working_memory_items": 2,
                        "explanation": "Phép tính tổng kết hai bao."
                    },
                    "hints": [
                        "Hàng đơn vị là 5 + 0 = 5.",
                        "Hàng chục là 2 + 5 = 7."
                    ],
                    "success_criteria": {
                        "evaluation_type": "exact_match",
                        "expected_answer": "75 kg",
                        "feedback_on_error": "Milo gợi ý: Hãy tính hàng chục 2 + 5 = 7 nhé! 🌱"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "particle_burst_gold",
                        "audio_cue": "positive_bell_c6",
                        "dopamine_points": 50
                    },
                    "is_final_step": True
                }
            ],
            "final_summary": {
                "final_answer_step_id": 3,
                "extracted_final_answer": "75 kg",
                "pedagogical_wrap_up": "Xuất sắc! Bé đã giải xong toàn bộ bài toán hai bước tính cùng Milo!"
            }
        }

        # Validate with jsonschema
        errors = list(self.validator.iter_errors(valid_payload))
        self.assertEqual(len(errors), 0, f"Schema validation errors: {[e.message for e in errors]}")

    def test_11_schema_rejects_multi_word_verbs_and_invalid_duration(self):
        """Verify schema strictly enforces single action verb and 60-300s duration constraints."""
        sample_task = {
            "step_id": 1,
            "title": "Bước test",
            "action_verb": "Đọc",
            "atomic_instruction": "Đọc đề bài",
            "duration_sec": 120,
            "ui_type": "single_choice",
            "ui_payload": {"prompt_text": "Chọn"},
            "cognitive_scaffolding": {
                "scaffolding_type": "visual_cue",
                "cognitive_load_level": "low",
                "working_memory_items": 1,
                "explanation": "Giải thích mục tiêu"
            },
            "hints": ["Gợi ý 1"],
            "success_criteria": {
                "evaluation_type": "exact_match",
                "expected_answer": "A",
                "feedback_on_error": "Milo gợi ý: Làm lại nhé 🌱"
            },
            "immediate_reinforcer": {
                "visual_asset": "milo_thumbs_up",
                "audio_cue": "gentle_pop_success",
                "dopamine_points": 20
            },
            "is_final_step": True
        }

        base_session = {
            "session_id": "test_err_sess",
            "task_metadata": {
                "benchmark_id": "G1_MATH_01",
                "original_title": "Test",
                "grade": 1,
                "subject": "toan",
                "total_micro_tasks": 1,
                "total_estimated_duration_sec": 120
            },
            "micro_tasks": [sample_task],
            "final_summary": {
                "final_answer_step_id": 1,
                "extracted_final_answer": "A",
                "pedagogical_wrap_up": "Hoàn thành"
            }
        }

        # 1. Action verb with spaces (multi-word) must fail regex ^[a-zA-ZÀ-ỹ_]+$
        invalid_verb_session = json.loads(json.dumps(base_session))
        invalid_verb_session["micro_tasks"][0]["action_verb"] = "Đọc và trả lời"
        errs = list(self.validator.iter_errors(invalid_verb_session))
        self.assertTrue(any("action_verb" in list(e.path) for e in errs), "Schema must reject multi-word action_verb")

        # 2. Duration < 60s must fail schema
        invalid_dur_low = json.loads(json.dumps(base_session))
        invalid_dur_low["micro_tasks"][0]["duration_sec"] = 45
        errs = list(self.validator.iter_errors(invalid_dur_low))
        self.assertTrue(any("duration_sec" in list(e.path) for e in errs), "Schema must reject duration < 60s")

        # 3. Duration > 300s must fail schema
        invalid_dur_high = json.loads(json.dumps(base_session))
        invalid_dur_high["micro_tasks"][0]["duration_sec"] = 400
        errs = list(self.validator.iter_errors(invalid_dur_high))
        self.assertTrue(any("duration_sec" in list(e.path) for e in errs), "Schema must reject duration > 300s")

    # =========================================================================
    # TEST 4: ANSWER VALIDATION LOGIC (Equivalence & Normalization)
    # =========================================================================

    @staticmethod
    def _normalize_answer(val: Any) -> str:
        """Python mirror of frontend normalizeAnswer() function in index.html."""
        if val is None:
            return ""
        s = str(val).strip().lower()
        # Equate Vietnamese decimal comma (12,5) with decimal point (12.5)
        s = re.sub(r"(\d+),(\d+)", r"\1.\2", s)
        s = re.sub(r"\s+", " ", s)
        return s

    @classmethod
    def _validate_answer(cls, child_input: str, expected: Union[str, List[str], float, int]) -> bool:
        """Python mirror of handleChildTextInputSubmit() validation logic."""
        if not child_input or not child_input.strip():
            return False
        val_norm = cls._normalize_answer(child_input)

        if expected is None:
            return True

        if isinstance(expected, list):
            for item in expected:
                item_norm = cls._normalize_answer(item)
                if item_norm == val_norm:
                    return True
                try:
                    num_item = float(item_norm)
                    num_val = float(val_norm)
                    if num_item == num_val:
                        return True
                except ValueError:
                    pass
            return False
        else:
            exp_norm = cls._normalize_answer(expected)
            if val_norm == exp_norm:
                return True
            try:
                num_exp = float(exp_norm)
                num_val = float(val_norm)
                return num_exp == num_val
            except ValueError:
                return False

    def test_12_answer_normalization_and_exact_match(self):
        """Test answer normalization trims spaces, ignores case, and matches exact answers."""
        self.assertEqual(self._normalize_answer("  Quả Cam  "), "quả cam")
        self.assertEqual(self._normalize_answer("12  kg"), "12 kg")

        self.assertTrue(self._validate_answer("Quả cam", "quả cam"))
        self.assertTrue(self._validate_answer("  QUẢ CAM  ", "quả cam"))
        self.assertFalse(self._validate_answer("Quả táo", "quả cam"))

    def test_13_vietnamese_decimal_comma_normalization(self):
        """Verify Vietnamese decimal comma (12,5 == 12.5) parity in answer validation."""
        # 12,5 matches 12.5
        self.assertTrue(self._validate_answer("12,5", "12.5"))
        self.assertTrue(self._validate_answer("  12,5  ", "12.5"))
        self.assertTrue(self._validate_answer("12.5", "12,5"))
        self.assertTrue(self._validate_answer("0,75", "0.75"))
        self.assertTrue(self._validate_answer("3,14", 3.14))

        # Rejection of wrong decimal
        self.assertFalse(self._validate_answer("12,4", "12.5"))
        self.assertFalse(self._validate_answer("12,55", "12.5"))

    def test_14_answer_rejection_and_acceptance_matrix(self):
        """Verify strict rejection of incorrect inputs and acceptance of variants."""
        # Rejection of wrong numbers
        self.assertFalse(self._validate_answer("99", "12.5"))
        self.assertFalse(self._validate_answer("0", "14"))
        self.assertFalse(self._validate_answer("sai rồi", "14"))
        self.assertFalse(self._validate_answer("", "14"))

        # Acceptance of exact
        self.assertTrue(self._validate_answer("14", "14"))
        self.assertTrue(self._validate_answer("14", 14))

        # Array of acceptable variants
        variants = ["8 con chim", "8", "8 con"]
        self.assertTrue(self._validate_answer("8", variants))
        self.assertTrue(self._validate_answer("8 con chim", variants))
        self.assertTrue(self._validate_answer("8 con", variants))
        self.assertFalse(self._validate_answer("7 con chim", variants))
        self.assertFalse(self._validate_answer("chim", variants))

    # =========================================================================
    # TEST 5: FRONTEND UI & ACCESSIBILITY CONTRACT
    # =========================================================================

    def test_15_parent_survey_modal_contract(self):
        """Verify index.html contains #parent-survey-modal with required controls."""
        self.assertIn(
            'id="parent-survey-modal"', self.html_content,
            "index.html must contain modal element #parent-survey-modal"
        )
        self.assertIn(
            'id="btn-save-survey"', self.html_content,
            "index.html must contain #btn-save-survey"
        )
        self.assertIn(
            'id="btn-skip-survey"', self.html_content,
            "index.html must contain #btn-skip-survey"
        )

    def test_16_parent_cognitive_profile_badge_contract(self):
        """Verify index.html contains #parent-cognitive-profile-badge with click handler."""
        self.assertIn(
            'id="parent-cognitive-profile-badge"', self.html_content,
            "index.html must contain #parent-cognitive-profile-badge"
        )
        self.assertIn(
            'onclick="openSurveyModal()"', self.html_content,
            "Badge must trigger openSurveyModal() on click"
        )

    def test_17_btn_3d_amber_contract(self):
        """Verify index.html contains .btn-3d-amber class for warm routines theme."""
        self.assertIn(
            '.btn-3d-amber', self.html_content,
            "index.html must contain CSS class .btn-3d-amber"
        )

    def test_18_btn_disabled_wcag_aa_contract(self):
        """Verify .btn-disabled in index.html satisfies WCAG AA text contrast (#475569)."""
        self.assertIn(
            '.btn-disabled', self.html_content,
            "index.html must contain CSS class .btn-disabled"
        )
        # Verify compliant text color #475569 (slate-600, contrast >= 4.5:1 on light backgrounds)
        self.assertRegex(
            self.html_content,
            r"\.btn-disabled\s*\{[^}]*color:\s*#475569\s*!important",
            "CSS .btn-disabled must define 'color: #475569 !important' to meet WCAG AA contrast ratio >= 4.5:1"
        )

    def test_19_sticky_batch_action_container_contract(self):
        """Verify index.html contains sticky container for batch task dispatch."""
        self.assertIn(
            'GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!', self.html_content,
            "index.html must contain batch dispatch button label"
        )
        self.assertIn(
            'dispatchSelectedCatalogTasks()', self.html_content,
            "index.html must wire batch dispatch button to dispatchSelectedCatalogTasks()"
        )
        self.assertIn(
            'id="batch-selected-count"', self.html_content,
            "index.html must contain #batch-selected-count counter"
        )
        # Verify sticky bottom container exists
        self.assertRegex(
            self.html_content,
            r'class="[^"]*sticky\s+bottom-0[^"]*"',
            "index.html must contain sticky bottom container for batch actions"
        )


if __name__ == "__main__":
    unittest.main()
