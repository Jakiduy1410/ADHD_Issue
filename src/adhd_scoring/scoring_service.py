"""
Production Scoring Module for ADHD 9-Question Parent Survey.

Transforms clinical responses (Likert 0-3) based on Vanderbilt VADPRS, SNAP-IV,
and Barkley Emotional Dysregulation framework into continuous and categorical
Cognitive Profile vectors for GDPT 2018 elementary micro-task scaffolding.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


def get_default_survey_path() -> Path:
    """Returns the default path to the survey definition JSON file."""
    # Assuming standard project structure: repo_root/data/surveys/adhd_parent_survey.json
    current_file = Path(__file__).resolve()
    # current_file is in repo_root/src/adhd_scoring/
    repo_root = current_file.parents[2]
    return repo_root / "data" / "surveys" / "adhd_parent_survey.json"


def load_survey_definition(survey_path: Optional[Union[str, Path]] = None) -> Dict[str, Any]:
    """
    Loads and parses the ADHD parent survey definition JSON.
    """
    path = Path(survey_path) if survey_path else get_default_survey_path()
    if not path.is_file():
        raise FileNotFoundError(f"ADHD survey definition file not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "questions" not in data or len(data["questions"]) != 9:
        raise ValueError(
            f"Invalid survey definition: expected exactly 9 questions, got "
            f"{len(data.get('questions', []))}"
        )
    return data


def validate_survey_answers(answers: Union[Dict[str, Any], List[int]]) -> Dict[str, int]:
    """
    Validates and normalizes 9 survey answers.
    Accepts either:
      - Dict with keys 'q1'..'q9', or '1'..'9', or 1..9
      - List/Tuple of 9 integer responses
    All scores must be integers in [0, 3].
    Returns normalized Dict[str, int] with keys 'q1'..'q9'.
    """
    normalized: Dict[str, int] = {}

    if isinstance(answers, (list, tuple)):
        if len(answers) != 9:
            raise ValueError(f"Expected exactly 9 answers in list, got {len(answers)}")
        for idx, val in enumerate(answers, start=1):
            normalized[f"q{idx}"] = val
    elif isinstance(answers, dict):
        for i in range(1, 10):
            str_key = f"q{i}"
            num_key = i
            str_num_key = str(i)

            if str_key in answers:
                normalized[str_key] = answers[str_key]
            elif num_key in answers:
                normalized[str_key] = answers[num_key]
            elif str_num_key in answers:
                normalized[str_key] = answers[str_num_key]
            else:
                raise ValueError(f"Missing required survey question {str_key}")
    else:
        raise TypeError(f"Answers must be a dict or list/tuple, got {type(answers).__name__}")

    # Validate each value is integer in range [0, 3]
    for k, v in normalized.items():
        if isinstance(v, bool):  # bool is a subclass of int in Python
            raise ValueError(f"Question {k} score cannot be a boolean: {v}")
        if not isinstance(v, (int, float)):
            raise ValueError(f"Question {k} score must be numeric, got {type(v).__name__}: {v}")
        if isinstance(v, float):
            if not v.is_integer():
                raise ValueError(f"Question {k} score must be an integer, got float {v}")
            v = int(v)
            normalized[k] = v
        if v < 0 or v > 3:
            raise ValueError(f"Question {k} score must be in range [0, 3], got {v}")

    return normalized


def calculate_cognitive_profile(
    answers: Union[Dict[str, Any], List[int]],
    child_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Transforms 9-question survey answers into normalized continuous and categorical
    Cognitive Profile vectors, prompt injection directives, and metadata.

    Mapping Algorithm:
      - Raw subscales:
          EF  = q1 + q2 + q3 in [0, 9] (Executive Function)
          AS  = q4 + q5 + q6 in [0, 9] (Attention Span & Distraction)
          RSD = q7 + q8 + q9 in [0, 9] (Rejection Sensitive Dysphoria)
          Total = EF + AS + RSD in [0, 27]
      - Normalized Indices in [0.0, 1.0]:
          I_EF = round(EF / 9.0, 4)
          I_AS = round(AS / 9.0, 4)
          I_RSD = round(RSD / 9.0, 4)
          CDI = round(0.40 * I_EF + 0.35 * I_AS + 0.25 * I_RSD, 4) (Composite Deficit Index)
      - Continuous & Categorical Vectors:
          attention_span_minutes = clamp(5, 25, round(25.0 - (AS / 9.0) * 20.0))
          recommended_micro_task_duration_sec = clamp(60, 300, round((300.0 - (AS / 9.0) * 210.0) / 30.0) * 30)
          working_memory_capacity = clamp(1, 5, round(5.0 - (EF / 9.0) * 4.0))
          rsd_sensitivity_level = LOW (0-2) | MEDIUM (3-4) | HIGH (5-7) | SEVERE (8-9)
          scaffolding_level = MINIMAL (CDI < 0.35) | MODERATE (0.35 <= CDI < 0.70) | INTENSIVE (CDI >= 0.70)
          max_steps_per_session = 6 (MINIMAL) | 4 (MODERATE) | 3 (INTENSIVE)
    """
    clean_answers = validate_survey_answers(answers)

    metadata = {
        "child_name": "Học sinh",
        "grade": 3,
        "age": 8,
    }
    if child_metadata:
        metadata.update(child_metadata)

    # 1. Raw Subscale Scores
    ef_score = clean_answers["q1"] + clean_answers["q2"] + clean_answers["q3"]
    as_score = clean_answers["q4"] + clean_answers["q5"] + clean_answers["q6"]
    rsd_score = clean_answers["q7"] + clean_answers["q8"] + clean_answers["q9"]
    total_score = ef_score + as_score + rsd_score

    # 2. Normalized Indices [0.0, 1.0]
    ef_index = round(ef_score / 9.0, 4)
    as_index = round(as_score / 9.0, 4)
    rsd_index = round(rsd_score / 9.0, 4)
    cdi = round((0.40 * ef_index) + (0.35 * as_index) + (0.25 * rsd_index), 4)

    # 3. Attention Span (minutes) [5 to 25 minutes]
    raw_span = 25.0 - (as_score / 9.0) * 20.0
    attention_span_minutes = max(5, min(25, int(round(raw_span))))

    # 4. Recommended Micro-Task Duration (seconds) [60 to 300 seconds, rounded to 30s]
    raw_micro_duration = 300.0 - (as_score / 9.0) * 210.0
    recommended_duration = int(round(raw_micro_duration / 30.0) * 30)
    recommended_micro_task_duration_sec = max(60, min(300, recommended_duration))

    # 5. Working Memory Capacity (chunks) [1 to 5 chunks]
    raw_wm = 5.0 - (ef_score / 9.0) * 4.0
    working_memory_capacity = max(1, min(5, int(round(raw_wm))))

    # 6. RSD Sensitivity Level
    if rsd_score <= 2:
        rsd_sensitivity_level = "LOW"
    elif rsd_score <= 4:
        rsd_sensitivity_level = "MEDIUM"
    elif rsd_score <= 7:
        rsd_sensitivity_level = "HIGH"
    else:
        rsd_sensitivity_level = "SEVERE"

    # 7. Scaffolding Level & Max Steps
    if cdi < 0.35:
        scaffolding_level = "MINIMAL"
        max_steps = 6
    elif cdi < 0.70:
        scaffolding_level = "MODERATE"
        max_steps = 4
    else:
        scaffolding_level = "INTENSIVE"
        max_steps = 3

    # 8. Behavioral Directives for Prompt Injection
    verb_constraint = (
        "CHỈ được dùng ĐÚNG 1 động từ hành động duy nhất trong mỗi micro-task (ví dụ: 'Đọc', 'Gạch chân', 'Tính')."
        if working_memory_capacity <= 2
        else "Mỗi micro-task tối đa 1-2 động từ hành động liên kết trực tiếp."
    )

    rsd_tone_guideline = (
        "Áp dụng giao thức hạ nhiệt RSD tối đa: Không phê phán, không dùng từ 'sai', dùng giọng điệu ấm áp của robot Milo, tự động kích hoạt lời khen nỗ lực sau mỗi bước."
        if rsd_sensitivity_level in ["HIGH", "SEVERE"]
        else "Giọng điệu khích lệ tích cực, khen ngợi quy trình làm bài."
    )

    prompt_directives = {
        "scaffolding_level": scaffolding_level,
        "max_atomic_steps": max_steps,
        "step_duration_target_sec": recommended_micro_task_duration_sec,
        "cognitive_chunk_limit": working_memory_capacity,
        "verb_constraint": verb_constraint,
        "rsd_tone_guideline": rsd_tone_guideline,
        "visual_timer_interval_sec": recommended_micro_task_duration_sec,
    }

    system_instruction_context = (
        f"HỌC SINH CÓ HỒ SƠ NHẬN THỨC: Sức chứa trí nhớ làm việc: {working_memory_capacity} chunks. "
        f"Khoảng chú ý hữu dụng: {attention_span_minutes} phút (Micro-task tối đa {recommended_micro_task_duration_sec}s). "
        f"Độ nhạy cảm thất bại (RSD): {rsd_sensitivity_level}. Mức giàn giáo sư phạm: {scaffolding_level}. "
        f"Yêu cầu phân rã: Tối đa {max_steps} bước vi nhiệm vụ. {verb_constraint} {rsd_tone_guideline}"
    )

    cognitive_vector = {
        "attention_span_minutes": attention_span_minutes,
        "recommended_micro_task_duration_sec": recommended_micro_task_duration_sec,
        "working_memory_capacity": working_memory_capacity,
        "rsd_sensitivity_level": rsd_sensitivity_level,
        "scaffolding_level": scaffolding_level,
        "max_steps_per_session": max_steps,
    }

    # Consolidated output adhering to PROJECT.md interface contract both at top level and structured sub-blocks
    return {
        # Top-level interface contract fields (for direct destructuring by downstream prompt engines)
        "attention_span_minutes": attention_span_minutes,
        "recommended_micro_task_duration_sec": recommended_micro_task_duration_sec,
        "working_memory_capacity": working_memory_capacity,
        "rsd_sensitivity_level": rsd_sensitivity_level,
        "scaffolding_level": scaffolding_level,
        "max_steps_per_session": max_steps,
        "prompt_injection_directives": prompt_directives,
        # Structured diagnostic and pipeline payloads
        "survey_metadata": {
            "survey_id": "adhd_vadprs_snapiv_9q",
            "version": "1.0.0",
            "child_name": metadata["child_name"],
            "grade": metadata["grade"],
            "age": metadata["age"],
        },
        "raw_scores": {
            "executive_function": ef_score,
            "attention_span": as_score,
            "rsd_sensitivity": rsd_score,
            "total_score": total_score,
        },
        "normalized_indices": {
            "executive_function_deficit_index": ef_index,
            "attention_decay_index": as_index,
            "rejection_sensitivity_index": rsd_index,
            "composite_deficit_index": cdi,
        },
        "cognitive_profile_vector": cognitive_vector,
        "stage_2_prompt_injection_payload": {
            "system_instruction_context": system_instruction_context
        },
    }


class ScoringService:
    """Production service class for loading surveys, scoring, and generating prompt payloads."""

    def __init__(self, survey_path: Optional[Union[str, Path]] = None) -> None:
        self.survey_path = Path(survey_path) if survey_path else get_default_survey_path()
        self._survey_cache: Optional[Dict[str, Any]] = None

    def get_survey_definition(self) -> Dict[str, Any]:
        """Returns cached survey definition."""
        if self._survey_cache is None:
            self._survey_cache = load_survey_definition(self.survey_path)
        return self._survey_cache

    def score(
        self,
        answers: Union[Dict[str, Any], List[int]],
        child_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Calculates cognitive profile and prompt directives."""
        return calculate_cognitive_profile(answers, child_metadata=child_metadata)
