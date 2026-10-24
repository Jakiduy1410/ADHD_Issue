"""
E2E Test Suite for Requirement R1: ADHD Parent Survey & Cognitive Profiling.
Validates:
- Tier 1: Feature Coverage (9-question clinical structure, VADPRS/SNAP-IV dimensions, scoring scale)
- Tier 2: Boundary & Corner Cases (extreme Likert scores 0/3, float rounding, invalid inputs, Vietnamese text integrity)
- Tier 3: Cross-Feature Combinations (Cognitive Profile output feeding into prompt directives)
- Tier 4: Real-World Scenarios (Clinical ADHD personas: Inattentive, Impulsive, Combined + RSD)
"""

import json
import sys
import unittest
from pathlib import Path
from typing import Any, Dict

repo_root = Path(__file__).resolve().parents[2]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))


class TestR1SurveyE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.repo_root = Path(__file__).resolve().parents[2]
        cls.survey_file = cls.repo_root / "data" / "surveys" / "adhd_parent_survey.json"

    # =========================================================================
    # TIER 1: Feature Coverage (Clinical Structure, 9 Questions, Scoring Scale)
    # =========================================================================

    def test_tier1_survey_file_exists(self):
        """Verify data/surveys/adhd_parent_survey.json exists at canonical path."""
        self.assertTrue(
            self.survey_file.is_file(),
            f"Expected survey file not found at: {self.survey_file}"
        )

    def test_tier1_survey_top_level_structure(self):
        """Verify survey JSON has all required top-level clinical and EdTech metadata."""
        with open(self.survey_file, "r", encoding="utf-8") as f:
            survey = json.load(f)

        required_keys = [
            "survey_id",
            "title",
            "clinical_basis",
            "target_audience",
            "scoring_scale",
            "dimensions",
            "questions",
        ]
        for key in required_keys:
            self.assertIn(key, survey, f"Missing required survey key: '{key}'")

        self.assertEqual(survey["survey_id"], "adhd_vadprs_snapiv_9q")
        self.assertIn("Vanderbilt", survey["clinical_basis"])
        self.assertIn("SNAP-IV", survey["clinical_basis"])

    def test_tier1_exactly_nine_questions_with_dimension_distribution(self):
        """Verify exactly 9 questions covering EF (q1-q3), AS (q4-q6), RSD (q7-q9)."""
        with open(self.survey_file, "r", encoding="utf-8") as f:
            survey = json.load(f)

        questions = survey.get("questions", [])
        self.assertEqual(len(questions), 9, f"Survey must have exactly 9 questions, got {len(questions)}")

        expected_distribution = {
            "q1": ("executive_function", "working_memory"),
            "q2": ("executive_function", "task_initiation"),
            "q3": ("executive_function", "inhibition_and_planning"),
            "q4": ("attention_span", "sustained_attention"),
            "q5": ("attention_span", "distractibility"),
            "q6": ("attention_span", "completion_persistence"),
            "q7": ("rsd_sensitivity", "fear_of_failure"),
            "q8": ("rsd_sensitivity", "feedback_reactivity"),
            "q9": ("rsd_sensitivity", "frustration_avoidance"),
        }

        found_ids = set()
        for q in questions:
            q_id = q.get("id")
            found_ids.add(q_id)
            self.assertIn(q_id, expected_distribution, f"Unexpected question ID: {q_id}")
            expected_dim, expected_sub = expected_distribution[q_id]
            self.assertEqual(q.get("dimension"), expected_dim, f"{q_id} dimension mismatch")
            self.assertEqual(q.get("sub_trait"), expected_sub, f"{q_id} sub_trait mismatch")
            self.assertTrue(len(q.get("prompt_text", "").strip()) > 10, f"{q_id} prompt text too short")
            self.assertTrue(len(q.get("clinical_source", "").strip()) > 5, f"{q_id} clinical source missing")

        self.assertEqual(len(found_ids), 9, "All 9 question IDs q1..q9 must be unique and present")

    def test_tier1_four_level_likert_scoring_scale(self):
        """Verify 4-level Likert scale definition (0=Never, 1=Occasionally, 2=Often, 3=Very Often)."""
        with open(self.survey_file, "r", encoding="utf-8") as f:
            survey = json.load(f)

        scale = survey.get("scoring_scale", [])
        self.assertEqual(len(scale), 4, f"Scoring scale must have 4 levels, got {len(scale)}")
        values = [s.get("value") for s in scale]
        self.assertEqual(values, [0, 1, 2, 3], f"Scoring values must be [0, 1, 2, 3], got {values}")

    def test_tier1_scoring_service_import_and_happy_path(self):
        """Verify calculation of Cognitive Profile from standard survey response."""
        try:
            from src.adhd_scoring.scoring_service import calculate_cognitive_profile
        except ImportError as e:
            self.fail(f"Could not import calculate_cognitive_profile: {e}")

        # Standard mild/moderate response
        answers = {f"q{i}": 1 for i in range(1, 10)}
        profile = calculate_cognitive_profile(answers, {"child_name": "Bé An", "grade": 3, "age": 8})

        self.assertIn("cognitive_profile_vector", profile)
        self.assertIn("prompt_injection_directives", profile)
        self.assertIn("raw_scores", profile)
        self.assertIn("normalized_indices", profile)

        vec = profile["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 18)
        self.assertTrue(60 <= vec["recommended_micro_task_duration_sec"] <= 300)
        self.assertTrue(1 <= vec["working_memory_capacity"] <= 5)
        self.assertIn(vec["rsd_sensitivity_level"], ["LOW", "MEDIUM", "HIGH", "SEVERE"])
        self.assertIn(vec["scaffolding_level"], ["MINIMAL", "MODERATE", "INTENSIVE"])

    # =========================================================================
    # TIER 2: Boundary & Corner Cases (Extremes, Rounding, Invalid Inputs, Unicode)
    # =========================================================================

    def test_tier2_extreme_neurotypical_baseline_all_zeros(self):
        """All 0s: No deficit baseline -> max duration (300s), max attention (25m), LOW RSD."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        answers = {f"q{i}": 0 for i in range(1, 10)}
        res = calculate_cognitive_profile(answers)

        raw = res["raw_scores"]
        self.assertEqual(raw["executive_function"], 0)
        self.assertEqual(raw["attention_span"], 0)
        self.assertEqual(raw["rsd_sensitivity"], 0)
        self.assertEqual(raw["total_score"], 0)

        norm = res["normalized_indices"]
        self.assertEqual(norm["composite_deficit_index"], 0.0)

        vec = res["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 25)
        self.assertEqual(vec["recommended_micro_task_duration_sec"], 300)
        self.assertEqual(vec["working_memory_capacity"], 5)
        self.assertEqual(vec["rsd_sensitivity_level"], "LOW")
        self.assertEqual(vec["scaffolding_level"], "MINIMAL")
        self.assertEqual(vec["max_steps_per_session"], 6)

    def test_tier2_extreme_severe_adhd_all_threes(self):
        """All 3s: Severe ADHD & extreme RSD -> min duration (60-90s), min attention (5m), SEVERE RSD."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        answers = {f"q{i}": 3 for i in range(1, 10)}
        res = calculate_cognitive_profile(answers)

        raw = res["raw_scores"]
        self.assertEqual(raw["executive_function"], 9)
        self.assertEqual(raw["attention_span"], 9)
        self.assertEqual(raw["rsd_sensitivity"], 9)
        self.assertEqual(raw["total_score"], 27)

        norm = res["normalized_indices"]
        self.assertEqual(norm["composite_deficit_index"], 1.0)

        vec = res["cognitive_profile_vector"]
        self.assertEqual(vec["attention_span_minutes"], 5)
        self.assertTrue(vec["recommended_micro_task_duration_sec"] <= 90)
        self.assertEqual(vec["working_memory_capacity"], 1)
        self.assertEqual(vec["rsd_sensitivity_level"], "SEVERE")
        self.assertEqual(vec["scaffolding_level"], "INTENSIVE")
        self.assertEqual(vec["max_steps_per_session"], 3)

    def test_tier2_scaffolding_boundary_thresholds(self):
        """Verify scaffolding transition boundaries: MINIMAL (< 0.35) -> MODERATE (< 0.70) -> INTENSIVE (>= 0.70)."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        # All 1s -> CDI = 0.3333 (< 0.35) -> MINIMAL
        res_min = calculate_cognitive_profile({f"q{i}": 1 for i in range(1, 10)})
        self.assertEqual(res_min["cognitive_profile_vector"]["scaffolding_level"], "MINIMAL")

        # All 2s -> CDI = 0.6667 (>= 0.35 and < 0.70) -> MODERATE
        res_mod = calculate_cognitive_profile({f"q{i}": 2 for i in range(1, 10)})
        self.assertEqual(res_mod["cognitive_profile_vector"]["scaffolding_level"], "MODERATE")

        # Mixed high EF & AS (e.g., EF=3,3,3, AS=3,3,3, RSD=1,1,1) -> CDI = 0.4*1.0 + 0.35*1.0 + 0.25*0.3333 = 0.8333 -> INTENSIVE
        res_int = calculate_cognitive_profile({
            "q1": 3, "q2": 3, "q3": 3,
            "q4": 3, "q5": 3, "q6": 3,
            "q7": 1, "q8": 1, "q9": 1
        })
        self.assertEqual(res_int["cognitive_profile_vector"]["scaffolding_level"], "INTENSIVE")

    def test_tier2_invalid_scores_raise_value_error(self):
        """Verify robust input validation rejecting negative, out-of-range, non-numeric, or missing answers."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        # Out-of-bounds score (> 3)
        with self.assertRaises((ValueError, TypeError)):
            calculate_cognitive_profile({**{f"q{i}": 1 for i in range(1, 9)}, "q9": 4})

        # Negative score
        with self.assertRaises((ValueError, TypeError)):
            calculate_cognitive_profile({**{f"q{i}": 1 for i in range(1, 9)}, "q9": -1})

        # Non-integer float score
        with self.assertRaises((ValueError, TypeError)):
            calculate_cognitive_profile({**{f"q{i}": 1 for i in range(1, 9)}, "q9": 1.5})

        # Boolean score
        with self.assertRaises((ValueError, TypeError)):
            calculate_cognitive_profile({**{f"q{i}": 1 for i in range(1, 9)}, "q9": True})

        # Missing question
        incomplete = {f"q{i}": 1 for i in range(1, 9)}
        with self.assertRaises((ValueError, KeyError)):
            calculate_cognitive_profile(incomplete)

    def test_tier2_duration_rounding_and_clamping(self):
        """Verify micro-task duration is clamped to [60, 300] and rounded to multiples of 30 seconds."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        for as_level in range(4):
            answers = {
                "q1": 1, "q2": 1, "q3": 1,
                "q4": as_level, "q5": as_level, "q6": as_level,
                "q7": 1, "q8": 1, "q9": 1
            }
            res = calculate_cognitive_profile(answers)
            sec = res["cognitive_profile_vector"]["recommended_micro_task_duration_sec"]
            self.assertTrue(60 <= sec <= 300, f"Duration {sec} outside [60, 300]")
            self.assertEqual(sec % 30, 0, f"Duration {sec} is not a multiple of 30s")

    def test_tier2_vietnamese_diacritics_and_encoding_fidelity(self):
        """Verify Vietnamese text in survey is cleanly formatted without charmap/mojibake corruptions."""
        with open(self.survey_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Unicode replacement char  check
        self.assertNotIn("\ufffd", content, "Survey JSON contains unicode replacement character \ufffd")
        
        # Verify specific Vietnamese diacritic markers exist
        vietnamese_keywords = ["Khảo Sát", "Thói Quen", "Tập Trung", "Chức năng Điều hành", "Khoảng Chú ý", "Thất Bại"]
        for kw in vietnamese_keywords:
            self.assertIn(kw, content, f"Expected Vietnamese keyword '{kw}' missing or corrupted")

    # =========================================================================
    # TIER 3: Cross-Feature Combinations (Cognitive Profile -> Prompt Directives)
    # =========================================================================

    def test_tier3_prompt_injection_directives_contract(self):
        """Verify prompt_injection_directives fields strictly fulfill Stage 2 decomposer requirements."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        answers = {f"q{i}": 2 for i in range(1, 10)}
        profile = calculate_cognitive_profile(answers)
        directives = profile.get("prompt_injection_directives", {})

        expected_directive_keys = [
            "scaffolding_level",
            "max_atomic_steps",
            "step_duration_target_sec",
            "cognitive_chunk_limit",
            "verb_constraint",
            "rsd_tone_guideline",
        ]
        for key in expected_directive_keys:
            self.assertIn(key, directives, f"Directive key '{key}' missing from prompt_injection_directives")

    def test_tier3_high_rsd_enforces_milo_calming_and_no_criticism(self):
        """When RSD is HIGH or SEVERE, tone guideline must mandate Milo calming persona and non-punitive language."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        # RSD = 3+3+3 = 9 -> SEVERE
        answers = {
            "q1": 0, "q2": 0, "q3": 0,
            "q4": 0, "q5": 0, "q6": 0,
            "q7": 3, "q8": 3, "q9": 3
        }
        res = calculate_cognitive_profile(answers)
        directives = res["prompt_injection_directives"]

        tone = directives["rsd_tone_guideline"].lower()
        self.assertTrue(
            "milo" in tone or "hạ nhiệt" in tone or "không phê phán" in tone or "khích lệ" in tone,
            f"Expected Milo calming/RSD buffer in tone guideline, got: {directives['rsd_tone_guideline']}"
        )

    def test_tier3_low_working_memory_enforces_single_action_verb(self):
        """When working_memory_capacity <= 2, verb_constraint must strictly restrict to 1 single action verb."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        # EF = 3+3+2 = 8 -> wm_capacity <= 2
        answers = {
            "q1": 3, "q2": 3, "q3": 2,
            "q4": 1, "q5": 1, "q6": 1,
            "q7": 1, "q8": 1, "q9": 1
        }
        res = calculate_cognitive_profile(answers)
        wm = res["cognitive_profile_vector"]["working_memory_capacity"]
        self.assertLessEqual(wm, 2)

        verb_rule = res["prompt_injection_directives"]["verb_constraint"].lower()
        self.assertTrue(
            "1 động từ" in verb_rule or "đúng 1" in verb_rule or "duy nhất" in verb_rule,
            f"Expected strict 1-action-verb constraint when wm <= 2, got: {res['prompt_injection_directives']['verb_constraint']}"
        )

    # =========================================================================
    # TIER 4: Real-World Scenarios (Clinical ADHD Personas)
    # =========================================================================

    def test_tier4_clinical_persona_inattentive_predominant(self):
        """Child with severe attention deficit (AS=8) but low impulsivity and low RSD."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        answers = {
            "q1": 1, "q2": 1, "q3": 0,  # EF: 2
            "q4": 3, "q5": 3, "q6": 2,  # AS: 8 (Severe)
            "q7": 0, "q8": 1, "q9": 0   # RSD: 1 (Low)
        }
        child = {"child_name": "Bé Nam", "grade": 2, "age": 7}
        profile = calculate_cognitive_profile(answers, child)

        vec = profile["cognitive_profile_vector"]
        self.assertLessEqual(vec["attention_span_minutes"], 10)
        self.assertLessEqual(vec["recommended_micro_task_duration_sec"], 150)
        self.assertEqual(vec["rsd_sensitivity_level"], "LOW")

    def test_tier4_clinical_persona_severe_rsd_and_task_paralysis(self):
        """Child with perfectionistic paralysis, intense fear of failure, and extreme feedback reactivity."""
        from src.adhd_scoring.scoring_service import calculate_cognitive_profile

        answers = {
            "q1": 1, "q2": 3, "q3": 1,  # Task paralysis in q2
            "q4": 1, "q5": 1, "q6": 2,  # AS: 4 (Moderate)
            "q7": 3, "q8": 3, "q9": 3   # RSD: 9 (Severe)
        }
        child = {"child_name": "Bé Linh", "grade": 4, "age": 9}
        profile = calculate_cognitive_profile(answers, child)

        vec = profile["cognitive_profile_vector"]
        self.assertEqual(vec["rsd_sensitivity_level"], "SEVERE")
        self.assertIn("milo", profile["prompt_injection_directives"]["rsd_tone_guideline"].lower())


if __name__ == "__main__":
    unittest.main()
