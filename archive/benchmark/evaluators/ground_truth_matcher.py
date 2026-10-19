"""
Ground Truth Matcher for Elementary ADHD Micro-Task Benchmark.
Multi-strategy deterministic matcher comparing AI's extracted final answer
against GDPT 2018 benchmark item's final_answer definition.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Dict, List, Optional, Tuple


class GroundTruthMatcher:
    """
    Multi-strategy deterministic ground-truth matcher for GDPT 2018 benchmark items.
    Strategies:
      1. Exact Normalized Text Match (Unicode NFC, lowercase, whitespace collapsed, punctuation stripped)
      2. Multiple Choice Option Match (Single letter A, B, C, D regex)
      3. Numerical & Unit Tolerance Match (Vietnamese comma decimals '12,5' -> 12.5, tolerance 1e-4)
      4. Substring & Keyword Containment
    """

    @staticmethod
    def normalize_text(text: Any) -> str:
        """
        Normalizes text: converts to string, Unicode NFC, lowercase, strips punctuation
        and standardizes Vietnamese comma decimal notation.
        """
        if text is None:
            return ""
        if isinstance(text, (int, float)):
            return str(text)

        s = str(text)
        s = unicodedata.normalize("NFC", s)
        s = s.strip().lower()

        # Normalize Vietnamese comma decimals: e.g., '12,5' -> '12.5', '3,14' -> '3.14'
        s = re.sub(r"(\d+),(\d+)", r"\1.\2", s)

        # Standardize multiple whitespaces into a single space
        s = re.sub(r"\s+", " ", s)

        return s

    @staticmethod
    def extract_numbers(text: Any) -> List[float]:
        """
        Extracts all numeric tokens from normalized text.
        """
        norm = GroundTruthMatcher.normalize_text(text)
        matches = re.findall(r"-?\d+(?:\.\d+)?", norm)
        res: List[float] = []
        for m in matches:
            try:
                res.append(float(m))
            except ValueError:
                pass
        return res

    def match(self, candidate_answer: Any, final_answer_def: Dict[str, Any]) -> bool:
        """
        Returns True if candidate answer matches the benchmark item's final_answer definition.
        """
        details = self.match_details(candidate_answer, final_answer_def)
        return details["matched"]

    def match_details(self, candidate_answer: Any, final_answer_def: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes multi-strategy matching and returns detailed audit diagnostics.
        """
        if candidate_answer is None or candidate_answer == "":
            return {
                "matched": False,
                "strategy": "none",
                "reason": "Candidate answer is empty or None",
                "candidate_raw": candidate_answer,
                "candidate_normalized": "",
            }

        norm_candidate = self.normalize_text(candidate_answer)
        acceptable_variants = final_answer_def.get("acceptable_variants", [])
        expected_raw_value = final_answer_def.get("value")
        expected_unit = final_answer_def.get("unit", "")
        expected_display = final_answer_def.get("normalized_display", "")

        # Collect all expected target string representations
        all_targets = list(acceptable_variants)
        if expected_display and expected_display not in all_targets:
            all_targets.append(expected_display)
        if expected_raw_value is not None and str(expected_raw_value) not in all_targets:
            all_targets.append(str(expected_raw_value))

        # -------------------------------------------------------------
        # Strategy 1: Exact Normalized Text Match
        # -------------------------------------------------------------
        for target in all_targets:
            norm_target = self.normalize_text(target)
            if norm_candidate == norm_target:
                return {
                    "matched": True,
                    "strategy": "exact_normalized_match",
                    "matched_target": target,
                    "candidate_normalized": norm_candidate,
                }

        # -------------------------------------------------------------
        # Strategy 2: Single-Letter Multiple Choice Match (A, B, C, D)
        # -------------------------------------------------------------
        str_val = str(expected_raw_value).strip().upper()
        if str_val in ["A", "B", "C", "D"]:
            # Check for isolated option letter in candidate (e.g., 'A', 'Đáp án: A', 'Chọn B.')
            pattern = rf"(?:\b|^|\s)({re.escape(str_val.lower())})(?:\b|\.|\:|$|\s)"
            if re.search(pattern, norm_candidate):
                return {
                    "matched": True,
                    "strategy": "mcq_letter_regex",
                    "matched_target": str_val,
                    "candidate_normalized": norm_candidate,
                }

        # -------------------------------------------------------------
        # Strategy 3: Numerical Equivalence Match (with comma & unit tolerance)
        # -------------------------------------------------------------
        expected_numbers: List[float] = []
        if isinstance(expected_raw_value, (int, float)):
            expected_numbers.append(float(expected_raw_value))
        else:
            expected_numbers = self.extract_numbers(str(expected_raw_value))

        candidate_numbers = self.extract_numbers(norm_candidate)

        if expected_numbers and candidate_numbers:
            if len(expected_numbers) == 1:
                target_num = expected_numbers[0]
                for c_num in candidate_numbers:
                    if abs(c_num - target_num) < 1e-4:
                        return {
                            "matched": True,
                            "strategy": "numerical_tolerance",
                            "expected_num": target_num,
                            "candidate_num": c_num,
                            "candidate_normalized": norm_candidate,
                        }
            elif len(expected_numbers) > 1 and len(candidate_numbers) >= len(expected_numbers):
                # All expected numbers must match candidate numbers
                all_matched = True
                for target_num in expected_numbers:
                    if not any(abs(c - target_num) < 1e-4 for c in candidate_numbers):
                        all_matched = False
                        break
                if all_matched:
                    return {
                        "matched": True,
                        "strategy": "multi_numerical_tolerance",
                        "expected_numbers": expected_numbers,
                        "candidate_numbers": candidate_numbers,
                        "candidate_normalized": norm_candidate,
                    }

        # -------------------------------------------------------------
        # Strategy 4: Substring / Keyword Containment
        # -------------------------------------------------------------
        for target in all_targets:
            norm_target = self.normalize_text(target)
            if len(norm_target) >= 2:
                # If target is contained within candidate or candidate within target
                if norm_target in norm_candidate or (len(norm_candidate) >= 3 and norm_candidate in norm_target):
                    return {
                        "matched": True,
                        "strategy": "substring_containment",
                        "matched_target": target,
                        "candidate_normalized": norm_candidate,
                    }

        return {
            "matched": False,
            "strategy": "failed_all_strategies",
            "candidate_normalized": norm_candidate,
            "all_targets_tested": [self.normalize_text(t) for t in all_targets],
        }
