"""
Empirical Adversarial Stress Testing & Fuzzing Suite for ADHD Micro-Task Verification Gate.

Challenges:
1. schemas/micro_task_schema.json (Draft7Validator rejection of 100% invalid payloads & acceptance of valid payloads)
2. data/curriculum/grade_1_to_5_benchmark.json & schemas/grade_1_to_5_benchmark_schema.json (Strict schema adherence, non-empty GT steps, non-empty final answers, unique IDs, correct grade numbers)
3. data/surveys/adhd_parent_survey.json & src/adhd_scoring/scoring_service.py (Adversarial fuzzing, out-of-range, invalid types, empty dicts, string inputs, all-0s, all-3s, robust exception handling, and mathematical monotonicity)
"""

from __future__ import annotations

import copy
import itertools
import json
import math
import random
import re
import sys
import unittest
from pathlib import Path
from typing import Any, Dict, List

import jsonschema

repo_root = Path(__file__).resolve().parents[2]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from src.adhd_scoring.scoring_service import (
    ScoringService,
    calculate_cognitive_profile,
    load_survey_definition,
    validate_survey_answers,
)


class TestMicroTaskSchemaAdversarial(unittest.TestCase):
    """
    Adversarial and fuzz testing against schemas/micro_task_schema.json.
    Verifies that Draft7Validator rejects 100% of boundary, mutated, and adversarial payloads
    and accepts valid payloads.
    """

    @classmethod
    def setUpClass(cls):
        cls.schema_path = repo_root / "schemas" / "micro_task_schema.json"
        with open(cls.schema_path, "r", encoding="utf-8") as f:
            cls.schema_data = json.load(f)

        # Confirm Draft-07 schema validity
        jsonschema.Draft7Validator.check_schema(cls.schema_data)
        cls.validator = jsonschema.Draft7Validator(cls.schema_data)

        # Canonical baseline valid payload
        cls.valid_payload = {
            "session_id": "sess_adv_test_001",
            "task_metadata": {
                "benchmark_id": "G2_MATH_06",
                "original_title": "Bài toán đàn gà tìm thóc",
                "grade": 2,
                "subject": "toan",
                "target_cognitive_profile": {
                    "attention_span_minutes": 15,
                    "recommended_micro_task_duration_sec": 120,
                    "working_memory_capacity": 3,
                    "rsd_sensitivity_level": "HIGH",
                    "scaffolding_level": "MODERATE"
                },
                "total_micro_tasks": 2,
                "total_estimated_duration_sec": 240
            },
            "micro_tasks": [
                {
                    "step_id": 1,
                    "title": "Đọc và tìm số gà mái",
                    "action_verb": "Đọc",
                    "atomic_instruction": "Đọc câu đầu tiên và xác định số con gà mái trong chuồng.",
                    "duration_sec": 120,
                    "ui_type": "highlight",
                    "ui_payload": {
                        "prompt_text": "Trong chuồng có 14 con gà mái.",
                        "highlight_target_segments": ["14 con gà mái"]
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "visual_cue",
                        "cognitive_load_level": "low",
                        "working_memory_items": 1,
                        "explanation": "Cô lập dữ kiện gà mái vào vùng nhớ ngắn hạn."
                    },
                    "hints": [
                        "Nhìn vào chữ số đứng trước chữ con gà mái nhé.",
                        "Có 14 con gà mái tất cả."
                    ],
                    "success_criteria": {
                        "evaluation_type": "keyword_containment",
                        "expected_answer": "14",
                        "feedback_on_error": "Milo thấy con đọc rất chăm chú rồi, nhìn lại số đầu tiên bên cạnh chữ gà mái nhé!"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "milo_thumbs_up",
                        "audio_cue": "gentle_pop_success",
                        "dopamine_points": 25
                    },
                    "is_final_step": False
                },
                {
                    "step_id": 2,
                    "title": "Tính số gà trống",
                    "action_verb": "Tính",
                    "atomic_instruction": "Lấy 25 trừ 14 để tính số gà trống.",
                    "duration_sec": 120,
                    "ui_type": "text_input",
                    "ui_payload": {
                        "prompt_text": "25 - 14 = ?",
                        "placeholder": "Điền đáp số..."
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "worked_example",
                        "cognitive_load_level": "medium",
                        "working_memory_items": 2,
                        "explanation": "Thực hiện phép trừ có nhớ hoặc không nhớ."
                    },
                    "hints": [
                        "Lấy hàng đơn vị 5 trừ 4 trước con nhé.",
                        "5 trừ 4 bằng 1, 2 trừ 1 bằng 1. Kết quả là 11 con."
                    ],
                    "success_criteria": {
                        "evaluation_type": "exact_match",
                        "expected_answer": "11",
                        "feedback_on_error": "Không sao cả, Milo và bạn cùng tính lại: 5 - 4 = 1, 2 - 1 = 1, vậy là 11 con nha!"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "sparkle_star_01",
                        "audio_cue": "positive_bell_c6",
                        "dopamine_points": 40
                    },
                    "is_final_step": True
                }
            ],
            "final_summary": {
                "final_answer_step_id": 2,
                "extracted_final_answer": "11 con",
                "pedagogical_wrap_up": "Tuyệt vời lắm! Con đã tính rất cẩn thận và tìm ra đáp số cùng Milo."
            }
        }

    def test_canonical_valid_payload_accepted(self):
        """Verify baseline valid payload validates with 0 errors."""
        errors = list(self.validator.iter_errors(self.valid_payload))
        self.assertEqual(len(errors), 0, f"Valid payload failed validation: {errors}")

    def test_adversarial_duration_boundaries(self):
        """
        Boundary tests for micro-task duration_sec:
        Strict window is [60, 300] seconds.
        - 59s: MUST BE REJECTED
        - 60s: MUST BE ACCEPTED
        - 150s: MUST BE ACCEPTED
        - 300s: MUST BE ACCEPTED
        - 301s: MUST BE REJECTED
        - 0s, -1s, 1000s: MUST BE REJECTED
        - Non-integer: 120.5, '120': MUST BE REJECTED
        """
        payload = copy.deepcopy(self.valid_payload)

        # Accepted boundaries
        for valid_dur in [60, 150, 300]:
            payload["micro_tasks"][0]["duration_sec"] = valid_dur
            self.assertTrue(
                self.validator.is_valid(payload),
                f"Valid duration {valid_dur} was rejected"
            )

        # Rejected boundaries
        invalid_durations = [59, 301, 0, -1, -60, 302, 500, 1000, 120.5, "120", None, True, False]
        for inv_dur in invalid_durations:
            payload["micro_tasks"][0]["duration_sec"] = inv_dur
            self.assertFalse(
                self.validator.is_valid(payload),
                f"Invalid duration {inv_dur!r} was accepted"
            )

    def test_adversarial_action_verb_regex(self):
        """
        Stress test action_verb regex ^[a-zA-ZÀ-ỹ_]+$:
        Must permit single-word tokens with Vietnamese diacritics and underscores.
        Must REJECT multi-verb strings, spaces, punctuation, numbers, hyphens, empty strings.
        """
        payload = copy.deepcopy(self.valid_payload)

        valid_verbs = [
            "Đọc", "Tính", "Chọn", "Điền", "Kéo", "Gạch_chân", "Sắp_xếp",
            "Quan_sát", "Nối", "Khoanh", "Tô_màu", "Viết", "Đếm", "So_sánh",
            "Identify", "Calculate", "Select"
        ]
        for v in valid_verbs:
            payload["micro_tasks"][0]["action_verb"] = v
            self.assertTrue(self.validator.is_valid(payload), f"Valid verb '{v}' was rejected")

        invalid_verbs = [
            "Đọc và viết",       # Multi-verb with conjunction and spaces
            "Tính rồi điền",     # Multi-verb sequential
            "Chọn, tô màu",      # Multi-verb with comma
            "Đọc và làm",        # Vietnamese multi-verb
            "Read and calculate",# English multi-verb
            "Tính!",             # Exclamation mark
            "Chọn?",             # Question mark
            "Gạch-chân",         # Hyphen instead of underscore
            "123",               # Numeric
            "Đọc1",              # Alphanumeric
            "",                  # Empty
            "   ",               # Whitespace only
            "Chọn ",             # Trailing space
            " Chọn",             # Leading space
            "Đọc\tvà\tviết",     # Tabs
            "Đọc\nTính",         # Newlines
            None,                # Null
            123,                 # Integer
            True                 # Boolean
        ]
        for inv_v in invalid_verbs:
            payload["micro_tasks"][0]["action_verb"] = inv_v
            self.assertFalse(
                self.validator.is_valid(payload),
                f"Invalid action_verb {inv_v!r} was accepted"
            )

    def test_adversarial_ui_types(self):
        """
        Verify that ONLY the 8 authorized interactive UI types are permitted.
        All other UI types, invalid strings, numbers, or nulls must be rejected 100%.
        """
        payload = copy.deepcopy(self.valid_payload)

        valid_ui_types = [
            "single_choice",
            "multiple_choice",
            "text_input",
            "drag_drop",
            "audio_listen",
            "highlight",
            "checkbox",
            "order_sequencing"
        ]
        for u in valid_ui_types:
            payload["micro_tasks"][0]["ui_type"] = u
            self.assertTrue(self.validator.is_valid(payload), f"Valid ui_type '{u}' was rejected")

        invalid_ui_types = [
            "dropdown",
            "canvas",
            "slider",
            "vr_3d",
            "matrix",
            "voice_input",
            "free_text",
            "radio_button",
            "drag-and-drop",
            "audio",
            "HIGHLIGHT",
            "",
            "   ",
            None,
            123,
            ["single_choice"],
            {"type": "single_choice"}
        ]
        for inv_u in invalid_ui_types:
            payload["micro_tasks"][0]["ui_type"] = inv_u
            self.assertFalse(
                self.validator.is_valid(payload),
                f"Invalid ui_type {inv_u!r} was accepted"
            )

    def test_adversarial_missing_error_feedback(self):
        """
        Verify missing or invalid feedback_on_error in success_criteria is rejected.
        ADHD RSD protocol strictly requires gentle non-punitive corrective feedback.
        """
        payload = copy.deepcopy(self.valid_payload)

        # 1. Missing feedback_on_error key
        del payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"]
        self.assertFalse(self.validator.is_valid(payload), "Missing feedback_on_error was accepted")

        # 2. Null feedback_on_error
        payload = copy.deepcopy(self.valid_payload)
        payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"] = None
        self.assertFalse(self.validator.is_valid(payload), "Null feedback_on_error was accepted")

        # 3. Numeric feedback_on_error
        payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"] = 404
        self.assertFalse(self.validator.is_valid(payload), "Numeric feedback_on_error was accepted")

        # 4. List feedback_on_error
        payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"] = ["Try again"]
        self.assertFalse(self.validator.is_valid(payload), "List feedback_on_error was accepted")

    def test_adversarial_excessive_and_missing_hints(self):
        """
        Verify hints array bounds: minItems: 1, maxItems: 3, items must be string.
        - 0 hints: MUST BE REJECTED
        - 1 hint: MUST BE ACCEPTED
        - 2 hints: MUST BE ACCEPTED
        - 3 hints: MUST BE ACCEPTED
        - 4 hints: MUST BE REJECTED
        - 5 hints: MUST BE REJECTED
        - Non-string hints: MUST BE REJECTED
        """
        payload = copy.deepcopy(self.valid_payload)

        # 1, 2, 3 hints are valid
        for count in [1, 2, 3]:
            payload["micro_tasks"][0]["hints"] = [f"Hint {i}" for i in range(count)]
            self.assertTrue(self.validator.is_valid(payload), f"{count} hints was rejected")

        # 0 hints (empty list) -> rejected
        payload["micro_tasks"][0]["hints"] = []
        self.assertFalse(self.validator.is_valid(payload), "Empty hints list was accepted")

        # 4 hints -> rejected
        payload["micro_tasks"][0]["hints"] = ["H1", "H2", "H3", "H4"]
        self.assertFalse(self.validator.is_valid(payload), "4 hints was accepted")

        # 5 hints -> rejected
        payload["micro_tasks"][0]["hints"] = ["H1", "H2", "H3", "H4", "H5"]
        self.assertFalse(self.validator.is_valid(payload), "5 hints was accepted")

        # Non-string hints
        payload["micro_tasks"][0]["hints"] = [1, 2, 3]
        self.assertFalse(self.validator.is_valid(payload), "Integer hints array was accepted")

        payload["micro_tasks"][0]["hints"] = ["H1", None]
        self.assertFalse(self.validator.is_valid(payload), "None in hints array was accepted")

    def test_adversarial_missing_required_keys(self):
        """
        Systematic removal of required top-level and item-level keys.
        100% of omissions must be rejected.
        """
        top_level_keys = ["session_id", "task_metadata", "micro_tasks", "final_summary"]
        for k in top_level_keys:
            p = copy.deepcopy(self.valid_payload)
            del p[k]
            self.assertFalse(self.validator.is_valid(p), f"Missing top-level key '{k}' was accepted")

        task_metadata_keys = [
            "benchmark_id", "original_title", "grade", "subject",
            "total_micro_tasks", "total_estimated_duration_sec"
        ]
        for k in task_metadata_keys:
            p = copy.deepcopy(self.valid_payload)
            del p["task_metadata"][k]
            self.assertFalse(self.validator.is_valid(p), f"Missing task_metadata key '{k}' was accepted")

        step_keys = [
            "step_id", "title", "action_verb", "atomic_instruction",
            "duration_sec", "ui_type", "ui_payload", "cognitive_scaffolding",
            "hints", "success_criteria", "immediate_reinforcer", "is_final_step"
        ]
        for k in step_keys:
            p = copy.deepcopy(self.valid_payload)
            del p["micro_tasks"][0][k]
            self.assertFalse(self.validator.is_valid(p), f"Missing step key '{k}' was accepted")

    def test_adversarial_instruction_and_title_max_length(self):
        """
        Verify atomic_instruction maxLength: 160 and title maxLength: 60.
        Lengths <= max must pass; length == max + 1 must fail.
        """
        payload = copy.deepcopy(self.valid_payload)

        # 160 chars instruction is valid
        payload["micro_tasks"][0]["atomic_instruction"] = "A" * 160
        self.assertTrue(self.validator.is_valid(payload))

        # 161 chars instruction is invalid
        payload["micro_tasks"][0]["atomic_instruction"] = "A" * 161
        self.assertFalse(self.validator.is_valid(payload))

        # 60 chars title is valid
        payload["micro_tasks"][0]["atomic_instruction"] = "Valid instruction"
        payload["micro_tasks"][0]["title"] = "T" * 60
        self.assertTrue(self.validator.is_valid(payload))

        # 61 chars title is invalid
        payload["micro_tasks"][0]["title"] = "T" * 61
        self.assertFalse(self.validator.is_valid(payload))

    def test_adversarial_dopamine_points_bounds(self):
        """Dopamine points strictly bounded in [10, 100]."""
        payload = copy.deepcopy(self.valid_payload)

        # Valid bounds
        for pts in [10, 50, 100]:
            payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = pts
            self.assertTrue(self.validator.is_valid(payload), f"Valid dopamine_points {pts} rejected")

        # Invalid bounds
        for pts in [9, 0, -10, 101, 200, "50", None]:
            payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = pts
            self.assertFalse(self.validator.is_valid(payload), f"Invalid dopamine_points {pts!r} accepted")

    def test_adversarial_reinforcer_enums(self):
        """Verify visual_asset and audio_cue must strictly adhere to their schema enums."""
        payload = copy.deepcopy(self.valid_payload)

        # Invalid visual_asset
        payload["micro_tasks"][0]["immediate_reinforcer"]["visual_asset"] = "laser_explosion_huge"
        self.assertFalse(self.validator.is_valid(payload))

        # Reset and test invalid audio_cue
        payload["micro_tasks"][0]["immediate_reinforcer"]["visual_asset"] = "sparkle_star_01"
        payload["micro_tasks"][0]["immediate_reinforcer"]["audio_cue"] = "heavy_metal_scream"
        self.assertFalse(self.validator.is_valid(payload))

    def test_adversarial_scaffolding_constraints(self):
        """Verify cognitive scaffolding enums and working_memory_items in [1, 5]."""
        payload = copy.deepcopy(self.valid_payload)

        # working_memory_items: 0 -> invalid
        payload["micro_tasks"][0]["cognitive_scaffolding"]["working_memory_items"] = 0
        self.assertFalse(self.validator.is_valid(payload))

        # working_memory_items: 6 -> invalid
        payload["micro_tasks"][0]["cognitive_scaffolding"]["working_memory_items"] = 6
        self.assertFalse(self.validator.is_valid(payload))

        # invalid cognitive_load_level
        payload["micro_tasks"][0]["cognitive_scaffolding"]["working_memory_items"] = 2
        payload["micro_tasks"][0]["cognitive_scaffolding"]["cognitive_load_level"] = "extreme_meltdown"
        self.assertFalse(self.validator.is_valid(payload))

    def test_adversarial_micro_tasks_array_length(self):
        """Total micro-tasks in session must be in [1, 10]."""
        payload = copy.deepcopy(self.valid_payload)
        base_step = copy.deepcopy(payload["micro_tasks"][0])

        # 0 tasks
        payload["micro_tasks"] = []
        self.assertFalse(self.validator.is_valid(payload), "0 micro-tasks accepted")

        # 1 to 10 tasks are valid
        for count in [1, 5, 10]:
            payload["micro_tasks"] = [copy.deepcopy(base_step) for _ in range(count)]
            self.assertTrue(self.validator.is_valid(payload), f"{count} micro-tasks rejected")

        # 11 tasks -> invalid
        payload["micro_tasks"] = [copy.deepcopy(base_step) for _ in range(11)]
        self.assertFalse(self.validator.is_valid(payload), "11 micro-tasks accepted")

    def test_randomized_adversarial_fuzzing_1000_mutations(self):
        """
        Fuzz micro_task_schema with 1000 randomized invalid mutations.
        Assures 100.0% of corrupted payloads are cleanly rejected by Draft7Validator.
        """
        rng = random.Random(42)
        rejection_count = 0
        total_fuzz_trials = 1000

        mutation_actions = [
            "corrupt_duration",
            "corrupt_action_verb",
            "corrupt_ui_type",
            "corrupt_hints",
            "corrupt_feedback",
            "delete_random_key",
            "corrupt_dopamine",
            "corrupt_grade",
            "corrupt_wm_items"
        ]

        for _ in range(total_fuzz_trials):
            payload = copy.deepcopy(self.valid_payload)
            action = rng.choice(mutation_actions)

            if action == "corrupt_duration":
                payload["micro_tasks"][0]["duration_sec"] = rng.choice([-100, 0, 45, 59, 301, 500, 9999, "90s"])
            elif action == "corrupt_action_verb":
                payload["micro_tasks"][0]["action_verb"] = rng.choice([
                    "Đọc và hiểu", "Tính xong ghi", "Chọn!", "123", "", "   ", "Click here"
                ])
            elif action == "corrupt_ui_type":
                payload["micro_tasks"][0]["ui_type"] = rng.choice([
                    "slider", "canvas", "vr_view", "dropdown", "select_box", None, 99
                ])
            elif action == "corrupt_hints":
                payload["micro_tasks"][0]["hints"] = rng.choice([
                    [], ["H1", "H2", "H3", "H4"], ["H1", "H2", "H3", "H4", "H5"], [123, 456], None
                ])
            elif action == "corrupt_feedback":
                payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"] = rng.choice([
                    None, 123, [], {"err": "retry"}
                ])
            elif action == "delete_random_key":
                target = rng.choice(["step_id", "title", "atomic_instruction", "cognitive_scaffolding", "hints", "is_final_step"])
                del payload["micro_tasks"][0][target]
            elif action == "corrupt_dopamine":
                payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = rng.choice([
                    0, 5, 9, 101, 500, -1, "20", None
                ])
            elif action == "corrupt_grade":
                payload["task_metadata"]["grade"] = rng.choice([0, 6, -1, 10, "3", None])
            elif action == "corrupt_wm_items":
                payload["micro_tasks"][0]["cognitive_scaffolding"]["working_memory_items"] = rng.choice([
                    0, 6, 10, -1, "2", None
                ])

            is_valid = self.validator.is_valid(payload)
            if not is_valid:
                rejection_count += 1

        self.assertEqual(
            rejection_count,
            total_fuzz_trials,
            f"Fuzzing failed: expected {total_fuzz_trials} rejections, got {rejection_count}"
        )


class TestBenchmarkDatasetAdversarial(unittest.TestCase):
    """
    Adversarial verification of data/curriculum/grade_1_to_5_benchmark.json against
    schemas/grade_1_to_5_benchmark_schema.json.
    Verifies strict schema adherence, non-empty GT steps, non-empty final answers, unique IDs,
    grade matching, and ADHD scaffolding notes.
    """

    @classmethod
    def setUpClass(cls):
        cls.schema_path = repo_root / "schemas" / "grade_1_to_5_benchmark_schema.json"
        cls.data_path = repo_root / "data" / "curriculum" / "grade_1_to_5_benchmark.json"

        with open(cls.schema_path, "r", encoding="utf-8") as f:
            cls.schema_data = json.load(f)
        jsonschema.Draft7Validator.check_schema(cls.schema_data)
        cls.validator = jsonschema.Draft7Validator(cls.schema_data)

        with open(cls.data_path, "r", encoding="utf-8") as f:
            cls.dataset = json.load(f)

    def test_strict_schema_adherence_zero_errors(self):
        """Verify the 25 benchmark items produce zero schema validation errors."""
        errors = list(self.validator.iter_errors(self.dataset))
        self.assertEqual(
            len(errors), 0,
            f"Benchmark failed Draft-07 schema validation with errors: {[e.message for e in errors]}"
        )

    def test_total_exercises_count(self):
        """Verify exactly 25 exercises."""
        self.assertEqual(self.dataset.get("total_exercises"), 25)
        self.assertEqual(len(self.dataset.get("exercises", [])), 25)

    def test_unique_exercise_ids_and_id_regex(self):
        """Verify all 25 exercise IDs are globally unique and conform to ^G[1-5]_(MATH|VIET|MCQ|ENG)_[0-9]{2}$."""
        id_regex = re.compile(r"^G[1-5]_(MATH|VIET|MCQ|ENG)_[0-9]{2}$")
        exercises = self.dataset.get("exercises", [])
        seen_ids = set()

        for ex in exercises:
            ex_id = ex.get("id")
            self.assertIsNotNone(id_regex.match(ex_id), f"Invalid ID format: '{ex_id}'")
            self.assertNotIn(ex_id, seen_ids, f"Duplicate ID detected: '{ex_id}'")
            seen_ids.add(ex_id)

        self.assertEqual(len(seen_ids), 25, "Expected 25 distinct IDs")

    def test_grade_numbers_and_distribution(self):
        """
        Verify each grade 1 to 5 has exactly 5 exercises,
        and ex['grade'] strictly matches the integer in ex['id'][1].
        """
        exercises = self.dataset.get("exercises", [])
        grade_dist = {g: 0 for g in range(1, 6)}

        for ex in exercises:
            g = ex.get("grade")
            self.assertIn(g, grade_dist, f"Invalid grade {g} in {ex.get('id')}")
            grade_dist[g] += 1
            # Match with ID prefix
            id_prefix_grade = int(ex["id"][1])
            self.assertEqual(
                g, id_prefix_grade,
                f"Mismatch between exercise grade ({g}) and ID prefix ({ex['id']})"
            )

        for g in range(1, 6):
            self.assertEqual(grade_dist[g], 5, f"Grade {g} does not have exactly 5 items: {grade_dist[g]}")

    def test_category_distribution_adherence(self):
        """
        Verify exact distribution:
        - 10 Toán lời văn
        - 5 Tiếng Việt / Đọc hiểu
        - 5 Trắc nghiệm nhiều câu ABCD
        - 5 Tiếng Anh tiểu học
        """
        exercises = self.dataset.get("exercises", [])
        counts = {
            "Toán lời văn": 0,
            "Tiếng Việt / Đọc hiểu": 0,
            "Trắc nghiệm nhiều câu ABCD": 0,
            "Tiếng Anh tiểu học": 0
        }
        for ex in exercises:
            cat = ex.get("category")
            self.assertIn(cat, counts, f"Unknown category '{cat}' in {ex.get('id')}")
            counts[cat] += 1

        self.assertEqual(counts["Toán lời văn"], 10)
        self.assertEqual(counts["Tiếng Việt / Đọc hiểu"], 5)
        self.assertEqual(counts["Trắc nghiệm nhiều câu ABCD"], 5)
        self.assertEqual(counts["Tiếng Anh tiểu học"], 5)

    def test_non_empty_ground_truth_steps(self):
        """
        Verify that 100% of items have non-empty, high-fidelity ground truth steps:
        - len(ground_truth_steps) >= 2
        - step_number sequential starting from 1
        - instruction non-empty string (> 10 chars)
        - mathematical_or_logical_goal non-empty string (> 5 chars)
        - intermediate_output present and non-empty
        """
        exercises = self.dataset.get("exercises", [])
        for ex in exercises:
            ex_id = ex.get("id")
            gt_steps = ex.get("ground_truth_steps")
            self.assertIsInstance(gt_steps, list, f"{ex_id}: ground_truth_steps is not a list")
            self.assertGreaterEqual(len(gt_steps), 2, f"{ex_id}: less than 2 ground truth steps")

            for idx, step in enumerate(gt_steps, start=1):
                self.assertEqual(step.get("step_number"), idx, f"{ex_id}: step_number mismatch at index {idx}")
                inst = step.get("instruction", "").strip()
                self.assertGreater(len(inst), 10, f"{ex_id} step {idx}: instruction too short: '{inst}'")
                goal = step.get("mathematical_or_logical_goal", "").strip()
                self.assertGreater(len(goal), 5, f"{ex_id} step {idx}: goal too short: '{goal}'")
                out = step.get("intermediate_output")
                self.assertIsNotNone(out, f"{ex_id} step {idx}: intermediate_output is None")
                self.assertTrue(bool(str(out).strip()), f"{ex_id} step {idx}: intermediate_output is empty")

    def test_non_empty_final_answers(self):
        """
        Verify that 100% of items have non-empty, robust final answers:
        - value is non-empty string or numeric
        - normalized_display is non-empty string
        - acceptable_variants is non-empty list of non-empty strings
        - canonical normalized_display or value is represented in acceptable_variants
        """
        exercises = self.dataset.get("exercises", [])
        for ex in exercises:
            ex_id = ex.get("id")
            fa = ex.get("final_answer")
            self.assertIsInstance(fa, dict, f"{ex_id}: final_answer is not a dict")

            val = fa.get("value")
            self.assertIsNotNone(val, f"{ex_id}: final_answer.value is None")
            self.assertTrue(bool(str(val).strip()), f"{ex_id}: final_answer.value is empty")

            norm = fa.get("normalized_display", "").strip()
            self.assertGreater(len(norm), 0, f"{ex_id}: normalized_display is empty")

            variants = fa.get("acceptable_variants")
            self.assertIsInstance(variants, list, f"{ex_id}: acceptable_variants is not a list")
            self.assertGreaterEqual(len(variants), 1, f"{ex_id}: acceptable_variants is empty")

            for v in variants:
                self.assertTrue(bool(str(v).strip()), f"{ex_id}: found empty string in acceptable_variants")

            # Check representation match
            variants_lower = [str(v).strip().lower() for v in variants]
            norm_lower = norm.lower()
            val_lower = str(val).strip().lower()
            has_match = (norm_lower in variants_lower) or (val_lower in variants_lower) or any(v in norm_lower for v in variants_lower)
            self.assertTrue(
                has_match,
                f"{ex_id}: Neither normalized_display '{norm}' nor value '{val}' matches variants {variants}"
            )

    def test_mcq_abcd_distractor_integrity(self):
        """
        Verify the 5 MCQ items have complete A, B, C, D options with distinct values,
        valid final answer letter, and distractor analyses.
        """
        exercises = self.dataset.get("exercises", [])
        mcq_items = [e for e in exercises if e.get("category") == "Trắc nghiệm nhiều câu ABCD"]
        self.assertEqual(len(mcq_items), 5)

        for item in mcq_items:
            ex_id = item["id"]
            opts = item.get("options")
            self.assertIsInstance(opts, dict, f"{ex_id}: options is not a dict")
            for letter in ["A", "B", "C", "D"]:
                self.assertIn(letter, opts, f"{ex_id}: missing option {letter}")
                self.assertTrue(bool(opts[letter].strip()), f"{ex_id}: option {letter} is empty")

            # Check distinctness
            opt_values = [opts[k].strip() for k in ["A", "B", "C", "D"]]
            self.assertEqual(len(set(opt_values)), 4, f"{ex_id}: options are not 4 distinct values: {opt_values}")

            # Check final answer value is A, B, C, or D
            fa_letter = str(item["final_answer"]["value"]).strip()
            self.assertIn(fa_letter, ["A", "B", "C", "D"], f"{ex_id}: MCQ final answer must be A/B/C/D, got {fa_letter}")

    def test_adhd_scaffolding_notes_integrity(self):
        """Verify adhd_scaffolding_notes is populated for all 25 items."""
        exercises = self.dataset.get("exercises", [])
        for ex in exercises:
            ex_id = ex["id"]
            notes = ex.get("adhd_scaffolding_notes")
            self.assertIsInstance(notes, dict, f"{ex_id}: missing adhd_scaffolding_notes")
            for req_key in ["working_memory_pitfall", "executive_function_scaffolding", "visual_or_concrete_aid"]:
                self.assertIn(req_key, notes, f"{ex_id}: missing '{req_key}' in adhd_scaffolding_notes")
                self.assertGreater(len(notes[req_key].strip()), 5, f"{ex_id}: '{req_key}' too short")


class TestAdhdScoringAdversarialFuzzing(unittest.TestCase):
    """
    Adversarial and fuzz testing against data/surveys/adhd_parent_survey.json &
    src/adhd_scoring/scoring_service.py.
    Verifies robust exception handling on invalid inputs, mathematical monotonicity,
    and extreme clinical baselines.
    """

    @classmethod
    def setUpClass(cls):
        cls.service = ScoringService()
        cls.survey_data = cls.service.get_survey_definition()

    def test_survey_definition_integrity(self):
        """Verify survey definition has 9 questions, Likert scale 0-3, and 3 dimensions."""
        self.assertEqual(self.survey_data.get("survey_id"), "adhd_vadprs_snapiv_9q")
        questions = self.survey_data.get("questions", [])
        self.assertEqual(len(questions), 9)

        scale = self.survey_data.get("scoring_scale", [])
        self.assertEqual(len(scale), 4)
        self.assertEqual([s["value"] for s in scale], [0, 1, 2, 3])

        dimensions = self.survey_data.get("dimensions", [])
        self.assertEqual(len(dimensions), 3)
        dim_ids = [d["id"] for d in dimensions]
        self.assertEqual(dim_ids, ["executive_function", "attention_span", "rsd_sensitivity"])

    def test_adversarial_out_of_range_values(self):
        """Scores < 0 or > 3 must raise ValueError."""
        out_of_range_values = [-1, -5, -999, 4, 5, 10, 999, 10000]
        for val in out_of_range_values:
            # Test each question position q1 to q9
            for target_q in range(1, 10):
                answers = {f"q{i}": 1 for i in range(1, 10)}
                answers[f"q{target_q}"] = val
                with self.assertRaises(ValueError, msg=f"Score {val} at q{target_q} did not raise ValueError"):
                    self.service.score(answers)

    def test_adversarial_invalid_types(self):
        """Non-numeric, boolean, None, and complex types must raise ValueError or TypeError."""
        invalid_type_inputs = [
            True, False, None, "1", "abc", "", "   ", [1], {"val": 1},
            1.5, 2.7, 0.1, -0.1, 3.1, float("nan"), float("inf"), float("-inf")
        ]
        for inv_input in invalid_type_inputs:
            answers = {f"q{i}": 1 for i in range(1, 10)}
            answers["q5"] = inv_input
            with self.assertRaises((ValueError, TypeError), msg=f"Input {inv_input!r} did not raise ValueError/TypeError"):
                self.service.score(answers)

    def test_valid_integer_floats_accepted(self):
        """Float representations of integers (0.0, 1.0, 2.0, 3.0) should be cleanly accepted and converted to int."""
        answers = {f"q{i}": float(i % 4) for i in range(1, 10)}
        res = self.service.score(answers)
        self.assertIsInstance(res, dict)
        for k, v in res["raw_scores"].items():
            self.assertIsInstance(v, int)

    def test_flexible_dict_keys_interoperability(self):
        """Verify dict keys formatted as 'q1'..'q9', 1..9 (int), or '1'..'9' (str) yield identical scores."""
        scores_seq = [1, 2, 0, 3, 2, 1, 0, 2, 3]

        dict_q = {f"q{i}": scores_seq[i-1] for i in range(1, 10)}
        dict_int = {i: scores_seq[i-1] for i in range(1, 10)}
        dict_str = {str(i): scores_seq[i-1] for i in range(1, 10)}
        list_input = list(scores_seq)

        res_q = self.service.score(dict_q)
        res_int = self.service.score(dict_int)
        res_str = self.service.score(dict_str)
        res_list = self.service.score(list_input)

        self.assertEqual(res_q["cognitive_profile_vector"], res_int["cognitive_profile_vector"])
        self.assertEqual(res_q["cognitive_profile_vector"], res_str["cognitive_profile_vector"])
        self.assertEqual(res_q["cognitive_profile_vector"], res_list["cognitive_profile_vector"])

    def test_adversarial_empty_and_incomplete_dicts(self):
        """Empty dicts and missing questions must raise ValueError."""
        # Empty dict
        with self.assertRaises(ValueError):
            self.service.score({})

        # Missing 1 question (e.g. only 8 questions provided)
        for missing_i in range(1, 10):
            incomplete = {f"q{i}": 1 for i in range(1, 10) if i != missing_i}
            with self.assertRaises(ValueError):
                self.service.score(incomplete)

    def test_adversarial_list_inputs(self):
        """List input with length != 9 must raise ValueError. Valid list of 9 must pass."""
        # Invalid lengths
        for length in [0, 1, 8, 10, 15]:
            invalid_list = [1] * length
            with self.assertRaises(ValueError):
                self.service.score(invalid_list)

        # Valid list
        valid_list = [1, 2, 0, 1, 3, 2, 0, 1, 2]
        res = self.service.score(valid_list)
        self.assertIn("cognitive_profile_vector", res)

    def test_adversarial_non_dict_non_list(self):
        """Non-collection inputs (int, str, None, bool) must raise TypeError."""
        for inv in [None, 123, "q1=1, q2=2", True, 45.6]:
            with self.assertRaises(TypeError):
                self.service.score(inv)

    def test_extreme_baseline_all_zeros_neurotypical(self):
        """
        All 0s: No executive, attention, or RSD deficit.
        Expected:
        - raw_scores: EF=0, AS=0, RSD=0, total=0
        - CDI = 0.0
        - attention_span_minutes = 25
        - recommended_micro_task_duration_sec = 300
        - working_memory_capacity = 5
        - rsd_sensitivity_level = 'LOW'
        - scaffolding_level = 'MINIMAL'
        - max_steps_per_session = 6
        """
        answers = [0] * 9
        res = self.service.score(answers)

        self.assertEqual(res["raw_scores"]["total_score"], 0)
        self.assertEqual(res["normalized_indices"]["composite_deficit_index"], 0.0)

        vec = res["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 25)
        self.assertEqual(vec["recommended_micro_task_duration_sec"], 300)
        self.assertEqual(vec["working_memory_capacity"], 5)
        self.assertEqual(vec["rsd_sensitivity_level"], "LOW")
        self.assertEqual(vec["scaffolding_level"], "MINIMAL")
        self.assertEqual(vec["max_steps_per_session"], 6)

    def test_extreme_baseline_all_threes_severe_adhd(self):
        """
        All 3s: Severe deficit across all dimensions.
        Expected:
        - raw_scores: EF=9, AS=9, RSD=9, total=27
        - CDI = 1.0
        - attention_span_minutes = 5
        - recommended_micro_task_duration_sec = 90
        - working_memory_capacity = 1
        - rsd_sensitivity_level = 'SEVERE'
        - scaffolding_level = 'INTENSIVE'
        - max_steps_per_session = 3
        """
        answers = [3] * 9
        res = self.service.score(answers)

        self.assertEqual(res["raw_scores"]["total_score"], 27)
        self.assertEqual(res["normalized_indices"]["composite_deficit_index"], 1.0)

        vec = res["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 5)
        self.assertEqual(vec["recommended_micro_task_duration_sec"], 90)
        self.assertEqual(vec["working_memory_capacity"], 1)
        self.assertEqual(vec["rsd_sensitivity_level"], "SEVERE")
        self.assertEqual(vec["scaffolding_level"], "INTENSIVE")
        self.assertEqual(vec["max_steps_per_session"], 3)

    def test_mathematical_monotonicity_attention_span(self):
        """
        Monotonicity Property 1:
        As AS raw score (q4+q5+q6) increases from 0 to 9:
        - attention_span_minutes MUST be non-increasing (monotonically decreases or stays constant)
        - recommended_micro_task_duration_sec MUST be non-increasing
        """
        prev_span = 999
        prev_dur = 999

        for as_level in range(10):  # AS sum from 0 to 9
            # Construct answers with varying AS score (q4+q5+q6 = as_level)
            q4 = min(3, as_level)
            rem1 = as_level - q4
            q5 = min(3, rem1)
            q6 = as_level - q4 - q5

            answers = {
                "q1": 1, "q2": 1, "q3": 1,
                "q4": q4, "q5": q5, "q6": q6,
                "q7": 1, "q8": 1, "q9": 1
            }
            res = self.service.score(answers)
            vec = res["cognitive_profile_vector"]
            curr_span = vec["attention_span_minutes"]
            curr_dur = vec["recommended_micro_task_duration_sec"]

            self.assertLessEqual(
                curr_span, prev_span,
                f"Attention span violated monotonicity at AS={as_level}: {curr_span} > {prev_span}"
            )
            self.assertLessEqual(
                curr_dur, prev_dur,
                f"Micro-task duration violated monotonicity at AS={as_level}: {curr_dur} > {prev_dur}"
            )

            prev_span = curr_span
            prev_dur = curr_dur

    def test_mathematical_monotonicity_working_memory(self):
        """
        Monotonicity Property 2:
        As EF raw score (q1+q2+q3) increases from 0 to 9:
        - working_memory_capacity MUST be non-increasing (decreases from 5 to 1)
        """
        prev_wm = 999

        for ef_level in range(10):
            q1 = min(3, ef_level)
            rem = ef_level - q1
            q2 = min(3, rem)
            q3 = ef_level - q1 - q2

            answers = {
                "q1": q1, "q2": q2, "q3": q3,
                "q4": 1, "q5": 1, "q6": 1,
                "q7": 1, "q8": 1, "q9": 1
            }
            res = self.service.score(answers)
            curr_wm = res["cognitive_profile_vector"]["working_memory_capacity"]

            self.assertLessEqual(
                curr_wm, prev_wm,
                f"Working memory capacity violated monotonicity at EF={ef_level}: {curr_wm} > {prev_wm}"
            )
            prev_wm = curr_wm

    def test_mathematical_monotonicity_rsd_sensitivity(self):
        """
        Monotonicity Property 3:
        As RSD raw score (q7+q8+q9) increases from 0 to 9:
        - rsd_sensitivity_level tier MUST be non-decreasing: LOW <= MEDIUM <= HIGH <= SEVERE.
        """
        tier_ranks = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "SEVERE": 4}
        prev_rank = 0

        for rsd_level in range(10):
            q7 = min(3, rsd_level)
            rem = rsd_level - q7
            q8 = min(3, rem)
            q9 = rsd_level - q7 - q8

            answers = {
                "q1": 1, "q2": 1, "q3": 1,
                "q4": 1, "q5": 1, "q6": 1,
                "q7": q7, "q8": q8, "q9": q9
            }
            res = self.service.score(answers)
            level = res["cognitive_profile_vector"]["rsd_sensitivity_level"]
            curr_rank = tier_ranks[level]

            self.assertGreaterEqual(
                curr_rank, prev_rank,
                f"RSD tier violated monotonicity at RSD={rsd_level}: {level} ({curr_rank}) < prev ({prev_rank})"
            )
            prev_rank = curr_rank

    def test_mathematical_monotonicity_scaffolding_and_max_steps(self):
        """
        Monotonicity Property 4:
        As all scores increase uniformly (0..3):
        - CDI increases monotonically from 0.0 to 1.0
        - scaffolding_level increases monotonically: MINIMAL <= MODERATE <= INTENSIVE
        - max_steps_per_session decreases monotonically: 6 >= 4 >= 3
        """
        scaffold_ranks = {"MINIMAL": 1, "MODERATE": 2, "INTENSIVE": 3}
        prev_cdi = -1.0
        prev_scaffold_rank = 0
        prev_max_steps = 999

        for uniform_score in [0, 1, 2, 3]:
            answers = [uniform_score] * 9
            res = self.service.score(answers)
            curr_cdi = res["normalized_indices"]["composite_deficit_index"]
            curr_scaffold = res["cognitive_profile_vector"]["scaffolding_level"]
            curr_rank = scaffold_ranks[curr_scaffold]
            curr_steps = res["cognitive_profile_vector"]["max_steps_per_session"]

            self.assertGreater(curr_cdi, prev_cdi)
            self.assertGreaterEqual(curr_rank, prev_scaffold_rank)
            self.assertLessEqual(curr_steps, prev_max_steps)

            prev_cdi = curr_cdi
            prev_scaffold_rank = curr_rank
            prev_max_steps = curr_steps

    def test_randomized_adversarial_fuzzing_2000_invalid_payloads(self):
        """
        Fuzz scoring service with 2,000 randomized invalid payloads:
        Invalid keys, wrong types, out-of-range numbers, malformed structures.
        Verify 100% are rejected with ValueError or TypeError without unhandled exceptions.
        """
        rng = random.Random(999)
        total_trials = 2000
        rejected = 0

        invalid_value_pool = [
            -100, -1, 4, 10, 999, "abc", "", "1", True, False, None,
            1.5, 2.7, [1], {"a": 1}, float("nan"), float("inf")
        ]

        for _ in range(total_trials):
            mode = rng.choice(["bad_val", "missing_key", "bad_type", "bad_list_len"])

            if mode == "bad_val":
                answers = {f"q{i}": rng.randint(0, 3) for i in range(1, 10)}
                target = f"q{rng.randint(1, 9)}"
                answers[target] = rng.choice(invalid_value_pool)
            elif mode == "missing_key":
                # Dict missing between 1 and 8 keys
                keys_to_keep = rng.sample(range(1, 10), rng.randint(0, 8))
                answers = {f"q{i}": rng.randint(0, 3) for i in keys_to_keep}
            elif mode == "bad_type":
                answers = rng.choice([12345, "invalid_string", None, True, 45.6])
            elif mode == "bad_list_len":
                bad_len = rng.choice([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 20])
                answers = [rng.randint(0, 3) for _ in range(bad_len)]

            try:
                self.service.score(answers)
            except (ValueError, TypeError):
                rejected += 1
            except Exception as e:
                self.fail(f"Unhandled exception during fuzzing: {type(e).__name__}: {e}")

        self.assertEqual(
            rejected, total_trials,
            f"Expected {total_trials} rejections, got {rejected}"
        )

    def test_randomized_valid_fuzzing_1000_vectors_adhere_to_bounds(self):
        """
        Fuzz scoring service with 1,000 randomized valid survey responses.
        Verify 100% produce valid vectors within physiological and pedagogical bounds:
        - attention_span_minutes in [5, 25]
        - recommended_micro_task_duration_sec in [60, 300] and multiple of 30
        - working_memory_capacity in [1, 5]
        - rsd_sensitivity_level in ['LOW', 'MEDIUM', 'HIGH', 'SEVERE']
        - scaffolding_level in ['MINIMAL', 'MODERATE', 'INTENSIVE']
        - max_steps_per_session in [3, 4, 6]
        """
        rng = random.Random(777)
        total_trials = 1000

        for _ in range(total_trials):
            answers = {f"q{i}": rng.randint(0, 3) for i in range(1, 10)}
            res = self.service.score(answers)
            vec = res["cognitive_profile_vector"]

            self.assertTrue(5 <= vec["attention_span_minutes"] <= 25)
            self.assertTrue(60 <= vec["recommended_micro_task_duration_sec"] <= 300)
            self.assertEqual(vec["recommended_micro_task_duration_sec"] % 30, 0)
            self.assertTrue(1 <= vec["working_memory_capacity"] <= 5)
            self.assertIn(vec["rsd_sensitivity_level"], ["LOW", "MEDIUM", "HIGH", "SEVERE"])
            self.assertIn(vec["scaffolding_level"], ["MINIMAL", "MODERATE", "INTENSIVE"])
            self.assertIn(vec["max_steps_per_session"], [3, 4, 6])


if __name__ == "__main__":
    unittest.main()
