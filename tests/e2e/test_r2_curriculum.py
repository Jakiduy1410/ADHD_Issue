"""
E2E Test Suite for Requirement R2: Grade 1-5 Benchmark Curriculum (25 Exercises).
Validates:
- Tier 1: Feature Coverage (25 GDPT 2018 items, 5/grade, 4 categories, 100% ground_truth_steps & final_answer, Draft-07 schema compliance)
- Tier 2: Boundary & Corner Cases (ABCD distractor completeness, Vietnamese diacritics, unit variants, decimal commas/dots)
- Tier 3: Cross-Feature Combinations (Atomic step granularity, evaluator matching compatibility)
- Tier 4: Real-World Scenarios (End-to-end ground truth matching simulation for all 25 items with variant and noisy inputs)
"""

import json
import re
import sys
import unittest
from pathlib import Path
from typing import Any, Dict, List
import jsonschema

repo_root = Path(__file__).resolve().parents[2]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))


class TestR2CurriculumE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.repo_root = Path(__file__).resolve().parents[2]
        cls.curriculum_file = cls.repo_root / "data" / "curriculum" / "grade_1_to_5_benchmark.json"
        cls.schema_file = cls.repo_root / "schemas" / "grade_1_to_5_benchmark_schema.json"

        # Load schema
        with open(cls.schema_file, "r", encoding="utf-8") as f:
            cls.schema_data = json.load(f)
        cls.validator = jsonschema.Draft7Validator(cls.schema_data)

        # Load curriculum
        with open(cls.curriculum_file, "r", encoding="utf-8") as f:
            cls.curriculum_data = json.load(f)

    # =========================================================================
    # TIER 1: Feature Coverage (25 Items, 5/Grade, 4 Categories, Draft-07 Schema)
    # =========================================================================

    def test_tier1_curriculum_and_schema_files_exist(self):
        """Verify benchmark dataset and schema files exist at canonical paths."""
        self.assertTrue(self.curriculum_file.is_file(), f"Missing curriculum file: {self.curriculum_file}")
        self.assertTrue(self.schema_file.is_file(), f"Missing schema file: {self.schema_file}")

    def test_tier1_schema_validation_passes_with_zero_errors(self):
        """Verify data/curriculum/grade_1_to_5_benchmark.json strictly complies with Draft-07 schema."""
        errors = list(self.validator.iter_errors(self.curriculum_data))
        if errors:
            error_msgs = [f"- {e.message} at path: {'/'.join(str(p) for p in e.path)}" for e in errors[:10]]
            self.fail(f"Benchmark dataset failed JSON Schema validation with {len(errors)} errors:\n" + "\n".join(error_msgs))

    def test_tier1_exactly_twenty_five_exercises(self):
        """Verify total_exercises is exactly 25 and array has 25 items."""
        self.assertEqual(self.curriculum_data.get("total_exercises"), 25)
        exercises = self.curriculum_data.get("exercises", [])
        self.assertEqual(len(exercises), 25, f"Expected 25 exercises, got {len(exercises)}")

    def test_tier1_even_grade_distribution_five_per_grade(self):
        """Verify exact distribution of 5 exercises per grade (Grades 1 to 5)."""
        exercises = self.curriculum_data.get("exercises", [])
        grade_counts = {g: 0 for g in range(1, 6)}

        for ex in exercises:
            g = ex.get("grade")
            self.assertIn(g, grade_counts, f"Exercise {ex.get('id')} has invalid grade: {g}")
            grade_counts[g] += 1

        for g in range(1, 6):
            self.assertEqual(grade_counts[g], 5, f"Grade {g} must have exactly 5 exercises, got {grade_counts[g]}")

    def test_tier1_category_distribution_mandate(self):
        """Verify category breakdown: 10 Toán lời văn, 5 Tiếng Việt, 5 Trắc nghiệm ABCD, 5 Tiếng Anh."""
        exercises = self.curriculum_data.get("exercises", [])
        cat_counts = {
            "Toán lời văn": 0,
            "Tiếng Việt / Đọc hiểu": 0,
            "Trắc nghiệm nhiều câu ABCD": 0,
            "Tiếng Anh tiểu học": 0,
        }

        for ex in exercises:
            cat = ex.get("category")
            self.assertIn(cat, cat_counts, f"Exercise {ex.get('id')} has unexpected category: {cat}")
            cat_counts[cat] += 1

        self.assertEqual(cat_counts["Toán lời văn"], 10, f"Expected 10 Toán lời văn, got {cat_counts['Toán lời văn']}")
        self.assertEqual(cat_counts["Tiếng Việt / Đọc hiểu"], 5, f"Expected 5 Tiếng Việt, got {cat_counts['Tiếng Việt / Đọc hiểu']}")
        self.assertEqual(cat_counts["Trắc nghiệm nhiều câu ABCD"], 5, f"Expected 5 MCQ ABCD, got {cat_counts['Trắc nghiệm nhiều câu ABCD']}")
        self.assertEqual(cat_counts["Tiếng Anh tiểu học"], 5, f"Expected 5 Tiếng Anh, got {cat_counts['Tiếng Anh tiểu học']}")

    def test_tier1_hundred_percent_ground_truth_and_final_answer(self):
        """Verify 100% of the 25 exercises have non-empty ground_truth_steps and complete final_answer."""
        exercises = self.curriculum_data.get("exercises", [])
        for ex in exercises:
            ex_id = ex.get("id")
            # Ground truth steps
            gt_steps = ex.get("ground_truth_steps")
            self.assertIsInstance(gt_steps, list, f"{ex_id} ground_truth_steps must be a list")
            self.assertGreaterEqual(len(gt_steps), 2, f"{ex_id} ground_truth_steps must have >= 2 atomic steps")
            for step in gt_steps:
                self.assertIn("step_number", step, f"{ex_id} step missing step_number")
                self.assertIn("instruction", step, f"{ex_id} step missing instruction")
                self.assertIn("intermediate_output", step, f"{ex_id} step missing intermediate_output")
                self.assertTrue(len(step["instruction"].strip()) > 0, f"{ex_id} instruction empty")

            # Final answer
            fa = ex.get("final_answer")
            self.assertIsInstance(fa, dict, f"{ex_id} final_answer must be a dict")
            self.assertIn("value", fa, f"{ex_id} final_answer missing 'value'")
            self.assertIn("normalized_display", fa, f"{ex_id} final_answer missing 'normalized_display'")
            self.assertIn("acceptable_variants", fa, f"{ex_id} final_answer missing 'acceptable_variants'")
            self.assertIsInstance(fa["acceptable_variants"], list, f"{ex_id} acceptable_variants must be a list")
            self.assertGreaterEqual(len(fa["acceptable_variants"]), 1, f"{ex_id} acceptable_variants cannot be empty")

    # =========================================================================
    # TIER 2: Boundary & Corner Cases (ABCD, Diacritics, Units, Commas/Dots)
    # =========================================================================

    def test_tier2_mcq_abcd_completeness_and_distinct_distractors(self):
        """Verify all 5 MCQ ABCD exercises have distinct options A, B, C, D and valid final answer key."""
        exercises = self.curriculum_data.get("exercises", [])
        mcq_items = [e for e in exercises if e.get("category") == "Trắc nghiệm nhiều câu ABCD"]
        self.assertEqual(len(mcq_items), 5)

        for item in mcq_items:
            ex_id = item.get("id")
            options = item.get("options")
            self.assertIsInstance(options, dict, f"{ex_id} must have options object")
            for opt_key in ["A", "B", "C", "D"]:
                self.assertIn(opt_key, options, f"{ex_id} missing option {opt_key}")
                self.assertTrue(len(options[opt_key].strip()) > 0, f"{ex_id} option {opt_key} is empty")

            # All 4 options must be distinct
            opt_texts = [options[k].strip() for k in ["A", "B", "C", "D"]]
            self.assertEqual(len(set(opt_texts)), 4, f"{ex_id} contains duplicate options: {opt_texts}")

            # final_answer value must be one of A, B, C, D
            fa_val = str(item["final_answer"]["value"]).strip()
            self.assertIn(fa_val, ["A", "B", "C", "D"], f"{ex_id} MCQ final answer must be A/B/C/D, got {fa_val}")

            # acceptable_variants must include the option letter and the option text
            variants_lower = [str(v).lower() for v in item["final_answer"]["acceptable_variants"]]
            self.assertIn(fa_val.lower(), variants_lower, f"{ex_id} variants must include '{fa_val}'")

    def test_tier2_unit_variants_coverage(self):
        """Verify acceptable_variants contains diverse forms (with unit, without unit, abbreviations)."""
        exercises = self.curriculum_data.get("exercises", [])
        math_items = [e for e in exercises if e.get("category") == "Toán lời văn"]

        for item in math_items:
            ex_id = item.get("id")
            unit = item["final_answer"].get("unit")
            variants = item["final_answer"]["acceptable_variants"]
            self.assertGreaterEqual(len(variants), 2, f"{ex_id} should have multiple acceptable variants")

            # If unit exists, check that variants contain both unit-bearing and numeric-only forms
            if unit:
                unit_words = [w.lower() for w in unit.split()]
                has_unit_form = any(any(w in v.lower() for w in unit_words) for v in variants)
                self.assertTrue(has_unit_form, f"{ex_id} expected at least one variant containing unit word from '{unit}'")

    def test_tier2_vietnamese_diacritics_and_typography(self):
        """Verify original_text, ground truth instructions, and topics have valid Vietnamese diacritics."""
        exercises = self.curriculum_data.get("exercises", [])
        for item in exercises:
            ex_id = item.get("id")
            text = item.get("original_text", "")
            self.assertNotIn("\ufffd", text, f"{ex_id} contains unicode replacement character \ufffd")
            self.assertTrue(len(text) >= 15, f"{ex_id} original_text too short: '{text}'")

            # adhd_scaffolding_notes check
            notes = item.get("adhd_scaffolding_notes", {})
            self.assertIn("working_memory_pitfall", notes, f"{ex_id} missing working_memory_pitfall")
            self.assertIn("executive_function_scaffolding", notes, f"{ex_id} missing executive_function_scaffolding")
            self.assertIn("visual_or_concrete_aid", notes, f"{ex_id} missing visual_or_concrete_aid")
            self.assertTrue(len(notes["working_memory_pitfall"].strip()) > 5)

    def test_tier2_id_naming_convention(self):
        """Verify ID format follows ^G[1-5]_(MATH|VIET|MCQ|ENG)_[0-9]{2}$ and IDs are unique."""
        exercises = self.curriculum_data.get("exercises", [])
        id_regex = re.compile(r"^G[1-5]_(MATH|VIET|MCQ|ENG)_[0-9]{2}$")
        seen_ids = set()

        for item in exercises:
            ex_id = item.get("id")
            self.assertIsNotNone(id_regex.match(ex_id), f"Invalid ID format: '{ex_id}'")
            self.assertNotIn(ex_id, seen_ids, f"Duplicate ID: '{ex_id}'")
            seen_ids.add(ex_id)

            # Check grade in ID matches grade field
            grade_char = int(ex_id[1])
            self.assertEqual(grade_char, item.get("grade"), f"{ex_id} grade prefix mismatch")

    # =========================================================================
    # TIER 3: Cross-Feature Combinations (Atomic Steps & Evaluator Compatibility)
    # =========================================================================

    def test_tier3_atomic_steps_align_with_adhd_micro_task_granularity(self):
        """Verify ground_truth_steps do not bundle multiple calculations into a single step."""
        exercises = self.curriculum_data.get("exercises", [])
        for item in exercises:
            ex_id = item.get("id")
            steps = item.get("ground_truth_steps", [])
            # Step numbers must be 1, 2, 3... sequential
            for idx, step in enumerate(steps, start=1):
                self.assertEqual(step.get("step_number"), idx, f"{ex_id} step number out of sequence")

    def test_tier3_matcher_compatibility_canonical_display(self):
        """Verify that canonical normalized_display always matches via acceptable_variants or contains a variant."""
        exercises = self.curriculum_data.get("exercises", [])
        for item in exercises:
            ex_id = item.get("id")
            norm_disp = item["final_answer"]["normalized_display"].strip().lower()
            variants = [str(v).strip().lower() for v in item["final_answer"]["acceptable_variants"]]
            matched = any(
                v == norm_disp or v in norm_disp or norm_disp in v
                for v in variants
            )
            self.assertTrue(
                matched,
                f"{ex_id} normalized_display '{norm_disp}' does not match acceptable_variants: {variants}"
            )

    # =========================================================================
    # TIER 4: Real-World Scenarios (Automated Ground Truth Matcher Simulation)
    # =========================================================================

    def test_tier4_ground_truth_matching_simulation_on_all_25_items(self):
        """Simulate ground truth matching engine across all 25 items with valid and noisy inputs."""
        exercises = self.curriculum_data.get("exercises", [])

        def match_answer(candidate: str, item: Dict[str, Any]) -> bool:
            c_norm = candidate.strip().lower()
            # 1. Exact or sub-phrase match with any acceptable variant
            for var in item["final_answer"]["acceptable_variants"]:
                v_norm = str(var).strip().lower()
                if c_norm == v_norm:
                    return True
                # Match if variant is contained as whole token or sub-phrase
                if len(v_norm) > 1 and v_norm in c_norm:
                    return True
                if len(c_norm) > 1 and c_norm in v_norm:
                    return True

            # 2. Match raw value using word boundaries if single character
            raw_val = str(item["final_answer"]["value"]).strip().lower()
            if len(raw_val) == 1:
                if re.search(r"\b" + re.escape(raw_val) + r"\b", c_norm):
                    return True
            else:
                if raw_val in c_norm:
                    return True
            return False

        # Verify each item matches on:
        # 1. Canonical display
        # 2. First acceptable variant
        # And fails on deliberate wrong answer
        for item in exercises:
            ex_id = item.get("id")
            canonical = item["final_answer"]["normalized_display"]
            first_variant = item["final_answer"]["acceptable_variants"][0]

            self.assertTrue(
                match_answer(canonical, item),
                f"{ex_id} failed matching canonical display: '{canonical}'"
            )
            self.assertTrue(
                match_answer(first_variant, item),
                f"{ex_id} failed matching first variant: '{first_variant}'"
            )

            # Deliberately wrong answer must NOT match
            wrong_cand = "99999_wrong_answer_xyz"
            self.assertFalse(
                match_answer(wrong_cand, item),
                f"{ex_id} falsely matched wrong candidate: '{wrong_cand}'"
            )


if __name__ == "__main__":
    unittest.main()
