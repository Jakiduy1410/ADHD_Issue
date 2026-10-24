"""
E2E Test Suite for Requirement R3: Micro-Task Schema (Draft-07) & System Prompts.
Validates:
- Tier 1: Feature Coverage (Schema Draft-07 compliance, 60s-300s window, 8 UI types, 1-verb pattern, 4 prompt files existence)
- Tier 2: Boundary & Corner Cases (Duration boundaries 60/300, Single verb regex, Hints bounds 1-3, Dopamine points 10-100, Prompt lexical safety)
- Tier 3: Cross-Feature Combinations (Valid micro-task decomposition payload validation against real benchmark item, Profile injection match)
- Tier 4: Real-World Scenarios (Comprehensive validation of full 4-step session payloads with error-injection mutation tests)
"""

import copy
import json
import re
import sys
import unittest
from pathlib import Path
from typing import Any, Dict
import jsonschema

repo_root = Path(__file__).resolve().parents[2]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))


class TestR3SchemaPromptsE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.repo_root = Path(__file__).resolve().parents[2]
        cls.schema_path = cls.repo_root / "schemas" / "micro_task_schema.json"
        cls.prompts_dir = cls.repo_root / "prompts"

        with open(cls.schema_path, "r", encoding="utf-8") as f:
            cls.schema_data = json.load(f)

        cls.validator = jsonschema.Draft7Validator(cls.schema_data)

        # Baseline valid micro-task session payload for testing
        cls.canonical_payload = {
            "session_id": "sess_test_12345",
            "task_metadata": {
                "benchmark_id": "G1_MATH_01",
                "original_title": "Bài toán đàn gà trên cành",
                "grade": 1,
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
                    "title": "Xác định số gà ban đầu",
                    "action_verb": "Đọc",
                    "atomic_instruction": "Đọc kĩ câu đầu tiên và tìm số con chim đậu lúc đầu.",
                    "duration_sec": 90,
                    "ui_type": "highlight",
                    "ui_payload": {
                        "prompt_text": "Có 5 con chim đậu trên cành.",
                        "highlight_target_segments": ["5 con chim"]
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "visual_cue",
                        "cognitive_load_level": "low",
                        "working_memory_items": 1,
                        "explanation": "Cô lập dữ kiện ban đầu vào vùng nhớ tạm."
                    },
                    "hints": [
                        "Nhìn vào chữ số ở câu đầu tiên con nhé.",
                        "Có 5 con chim đậu trên cành lúc đầu."
                    ],
                    "success_criteria": {
                        "evaluation_type": "keyword_containment",
                        "expected_answer": "5",
                        "feedback_on_error": "Milo thấy con đọc rất chăm chú rồi, nhìn lại số đầu tiên cạnh chữ chim nha!"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "milo_thumbs_up",
                        "audio_cue": "gentle_pop_success",
                        "dopamine_points": 20
                    },
                    "is_final_step": False
                },
                {
                    "step_id": 2,
                    "title": "Xác định số gà bay đến thêm",
                    "action_verb": "Chọn",
                    "atomic_instruction": "Chọn số lượng chim mới bay đến thêm vào cành.",
                    "duration_sec": 120,
                    "ui_type": "single_choice",
                    "ui_payload": {
                        "prompt_text": "Có thêm 3 con chim bay đến. Số chim bay đến là mấy?",
                        "options": ["2 con", "3 con", "4 con"]
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "sub_question",
                        "cognitive_load_level": "low",
                        "working_memory_items": 1,
                        "explanation": "Nhận biết lượng bổ sung."
                    },
                    "hints": [
                        "Con tìm từ 'bay đến' xem số mấy đứng trước nhé."
                    ],
                    "success_criteria": {
                        "evaluation_type": "exact_match",
                        "expected_answer": "3 con",
                        "feedback_on_error": "Không sao cả, Milo gợi ý: từ bay đến đứng ngay sau số 3 đó!"
                    },
                    "immediate_reinforcer": {
                        "visual_asset": "sparkle_star_01",
                        "audio_cue": "sparkle_ting_short",
                        "dopamine_points": 30
                    },
                    "is_final_step": False
                },
                {
                    "step_id": 3,
                    "title": "Tính tổng số chim trên cành",
                    "action_verb": "Tính",
                    "atomic_instruction": "Lấy 5 cộng 3 để tính xem có tất cả bao nhiêu con chim.",
                    "duration_sec": 150,
                    "ui_type": "text_input",
                    "ui_payload": {
                        "prompt_text": "5 + 3 = ?",
                        "placeholder": "Điền kết quả..."
                    },
                    "cognitive_scaffolding": {
                        "scaffolding_type": "worked_example",
                        "cognitive_load_level": "medium",
                        "working_memory_items": 2,
                        "explanation": "Thực hiện phép tính tổng kết."
                    },
                    "hints": [
                        "Xòe 5 ngón tay rồi đếm thêm 3 ngón tay nữa nhé.",
                        "5 thêm 1 là 6, thêm 1 là 7, thêm 1 nữa là...",
                        "5 + 3 = 8 con chim."
                    ],
                    "success_criteria": {
                        "evaluation_type": "exact_match",
                        "expected_answer": "8",
                        "feedback_on_error": "Cố lên bạn ơi, mình cùng đếm ngón tay với Milo nhé: 5 thêm 3 là 8!"
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
                "extracted_final_answer": "8 con",
                "pedagogical_wrap_up": "Tuyệt vời lắm! Bạn đã hoàn thành xuất sắc bài toán đàn chim cùng Milo!"
            }
        }

    # =========================================================================
    # TIER 1: Feature Coverage (Draft-07 Compliance, UI Types, Prompts Deployment)
    # =========================================================================

    def test_tier1_micro_task_schema_file_exists(self):
        """Verify schemas/micro_task_schema.json exists."""
        self.assertTrue(self.schema_path.is_file(), f"Missing schema at: {self.schema_path}")

    def test_tier1_schema_is_valid_draft_07(self):
        """Verify micro_task_schema.json is a valid JSON Schema Draft-07 specification."""
        self.assertEqual(self.schema_data.get("$schema"), "http://json-schema.org/draft-07/schema#")
        # Draft7Validator.check_schema raises SchemaError if invalid
        jsonschema.Draft7Validator.check_schema(self.schema_data)

    def test_tier1_schema_mandates_four_top_level_keys(self):
        """Verify required top-level keys: session_id, task_metadata, micro_tasks, final_summary."""
        required = self.schema_data.get("required", [])
        expected = ["session_id", "task_metadata", "micro_tasks", "final_summary"]
        for key in expected:
            self.assertIn(key, required, f"Schema missing required top-level key: '{key}'")

    def test_tier1_schema_enforces_eight_ui_types(self):
        """Verify the 8 required interactive UI types in schema enum."""
        items_schema = self.schema_data["properties"]["micro_tasks"]["items"]["properties"]
        ui_enum = items_schema["ui_type"]["enum"]
        expected_ui_types = [
            "single_choice",
            "multiple_choice",
            "text_input",
            "drag_drop",
            "audio_listen",
            "highlight",
            "checkbox",
            "order_sequencing",
        ]
        self.assertEqual(len(ui_enum), 8)
        for t in expected_ui_types:
            self.assertIn(t, ui_enum, f"Schema missing UI type enum: '{t}'")

    def test_tier1_all_four_prompt_files_exist_and_deployed(self):
        """Verify all core system prompts are deployed in prompts/ or archive/prompts/ directory."""
        required_prompts = [
            "micro_task_decomposer.md",
            "kid_rsd_calming_milo.md",
            "parent_effort_coach.md",
        ]
        for prompt_name in required_prompts:
            prompt_path = self.prompts_dir / prompt_name
            self.assertTrue(prompt_path.is_file(), f"Missing active prompt file: {prompt_path}")
            self.assertGreater(prompt_path.stat().st_size, 2000, f"Prompt {prompt_name} is unexpectedly small")

        # Verify archived stage1 / stage2 prompts exist in archive/prompts
        for legacy_prompt in ["stage1_problem_classifier.md", "stage2_task_decomposer.md"]:
            legacy_path = self.prompts_dir / legacy_prompt
            if not legacy_path.exists():
                legacy_path = self.repo_root / "archive" / "prompts" / legacy_prompt
            self.assertTrue(legacy_path.is_file(), f"Missing legacy prompt file: {legacy_path}")
            self.assertGreater(legacy_path.stat().st_size, 2000, f"Legacy prompt {legacy_prompt} is unexpectedly small")

    # =========================================================================
    # TIER 2: Boundary & Corner Cases (Duration, Verb Regex, Hints, Dopamine, Lexical)
    # =========================================================================

    def test_tier2_duration_window_boundaries_60_to_300(self):
        """Verify micro_task duration strictly bounded to [60, 300]."""
        payload = copy.deepcopy(self.canonical_payload)

        # 60s is valid
        payload["micro_tasks"][0]["duration_sec"] = 60
        self.assertTrue(self.validator.is_valid(payload))

        # 300s is valid
        payload["micro_tasks"][0]["duration_sec"] = 300
        self.assertTrue(self.validator.is_valid(payload))

        # 59s is invalid (< 60)
        payload["micro_tasks"][0]["duration_sec"] = 59
        self.assertFalse(self.validator.is_valid(payload))

        # 301s is invalid (> 300)
        payload["micro_tasks"][0]["duration_sec"] = 301
        self.assertFalse(self.validator.is_valid(payload))

    def test_tier2_action_verb_pattern_single_token(self):
        """Verify action_verb pattern ^[a-zA-ZÀ-ỹ_]+$ permits single tokens and rejects spaces/symbols."""
        pattern_str = self.schema_data["properties"]["micro_tasks"]["items"]["properties"]["action_verb"]["pattern"]
        verb_regex = re.compile(pattern_str)

        valid_verbs = ["Đọc", "Tính", "Chọn", "Điền", "Kéo", "Gạch_chân", "Sắp_xếp", "Quan_sát"]
        for v in valid_verbs:
            self.assertIsNotNone(verb_regex.match(v), f"Valid verb '{v}' failed regex match")

        invalid_verbs = [
            "Đọc và tính",       # Contains spaces and conjunction
            "Tính rồi chọn",     # Multiple verbs
            "Tính!",             # Exclamation mark
            "Gạch-chân",         # Hyphen instead of underscore
            "123",               # Numbers
            "",                  # Empty
            " "                  # Whitespace
        ]
        for v in invalid_verbs:
            self.assertIsNone(verb_regex.match(v), f"Invalid verb '{v}' unexpectedly passed regex match")

    def test_tier2_hints_array_length_boundaries_1_to_3(self):
        """Verify hints array length must be between 1 and 3 items."""
        payload = copy.deepcopy(self.canonical_payload)

        # 1 hint -> valid
        payload["micro_tasks"][0]["hints"] = ["Gợi ý 1 duy nhất"]
        self.assertTrue(self.validator.is_valid(payload))

        # 3 hints -> valid
        payload["micro_tasks"][0]["hints"] = ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
        self.assertTrue(self.validator.is_valid(payload))

        # 0 hints -> invalid
        payload["micro_tasks"][0]["hints"] = []
        self.assertFalse(self.validator.is_valid(payload))

        # 4 hints -> invalid
        payload["micro_tasks"][0]["hints"] = ["H1", "H2", "H3", "H4"]
        self.assertFalse(self.validator.is_valid(payload))

    def test_tier2_dopamine_points_boundaries_10_to_100(self):
        """Verify dopamine_points must be an integer between 10 and 100."""
        payload = copy.deepcopy(self.canonical_payload)

        # 10 -> valid
        payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = 10
        self.assertTrue(self.validator.is_valid(payload))

        # 100 -> valid
        payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = 100
        self.assertTrue(self.validator.is_valid(payload))

        # 9 -> invalid
        payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = 9
        self.assertFalse(self.validator.is_valid(payload))

        # 101 -> invalid
        payload["micro_tasks"][0]["immediate_reinforcer"]["dopamine_points"] = 101
        self.assertFalse(self.validator.is_valid(payload))

    def test_tier2_prompt_lexical_boundary_safety(self):
        """Verify kid and parent prompts adhere to EdTech/Wellness boundaries without stigmatizing medical terms."""
        milo_text = (self.prompts_dir / "kid_rsd_calming_milo.md").read_text(encoding="utf-8")
        parent_text = (self.prompts_dir / "parent_effort_coach.md").read_text(encoding="utf-8")

        # Milo prompt must explicitly prohibit punitive feedback
        self.assertIn("TUYỆT ĐỐI CẤM", milo_text)
        self.assertIn("Sai rồi", milo_text)

        # Parent coach prompt must emphasize effort-based praise and deficit externalization
        self.assertIn("Effort-Based Praise", parent_text)
        self.assertIn("Deficit Externalization", parent_text)
        self.assertIn("Lexical Boundary", parent_text)

    # =========================================================================
    # TIER 3: Cross-Feature Combinations (Cognitive Profile Directives -> Prompts)
    # =========================================================================

    def test_tier3_canonical_micro_task_payload_validates_cleanly(self):
        """Verify our canonical 3-step session payload validates against micro_task_schema with 0 errors."""
        errors = list(self.validator.iter_errors(self.canonical_payload))
        self.assertEqual(len(errors), 0, f"Canonical payload had validation errors: {[e.message for e in errors]}")

    def test_tier3_stage2_prompt_documents_cognitive_profile_injection(self):
        """Verify Stage 2 prompt explicitly documents injection of all 5 Cognitive Profile vector fields."""
        stage2_path = self.prompts_dir / "stage2_task_decomposer.md"
        if not stage2_path.exists():
            stage2_path = self.repo_root / "archive" / "prompts" / "stage2_task_decomposer.md"
        stage2_text = stage2_path.read_text(encoding="utf-8")

        profile_fields = [
            "attention_span_minutes",
            "recommended_micro_task_duration_sec",
            "working_memory_capacity",
            "rsd_sensitivity_level",
            "scaffolding_level",
        ]
        for field in profile_fields:
            self.assertIn(
                field,
                stage2_text,
                f"Stage 2 prompt missing reference to Cognitive Profile field '{field}'"
            )

    # =========================================================================
    # TIER 4: Real-World Scenarios (Payload Mutation and Error Cascading)
    # =========================================================================

    def test_tier4_missing_required_scaffolding_fails_validation(self):
        """Omission of required scaffolding fields in a micro-task raises validation error."""
        payload = copy.deepcopy(self.canonical_payload)
        del payload["micro_tasks"][0]["cognitive_scaffolding"]["explanation"]

        errors = list(self.validator.iter_errors(payload))
        self.assertGreater(len(errors), 0)
        self.assertTrue(any("explanation" in e.message for e in errors))

    def test_tier4_missing_feedback_on_error_fails_validation(self):
        """Omission of feedback_on_error in success_criteria raises validation error."""
        payload = copy.deepcopy(self.canonical_payload)
        del payload["micro_tasks"][0]["success_criteria"]["feedback_on_error"]

        errors = list(self.validator.iter_errors(payload))
        self.assertGreater(len(errors), 0)
        self.assertTrue(any("feedback_on_error" in e.message for e in errors))

    def test_tier4_invalid_ui_payload_type_rejected(self):
        """Supplying invalid UI type (e.g. 'virtual_reality_3d') is rejected."""
        payload = copy.deepcopy(self.canonical_payload)
        payload["micro_tasks"][0]["ui_type"] = "virtual_reality_3d"

        errors = list(self.validator.iter_errors(payload))
        self.assertGreater(len(errors), 0)


if __name__ == "__main__":
    unittest.main()
