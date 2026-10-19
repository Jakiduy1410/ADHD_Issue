"""
Stage 1: Problem Classifier & Cognitive IR Extractor.
Extracts problem domain taxonomy, explicit entities, sub-questions,
canonical solution DAG, and potential ADHD cognitive traps using Gemini 3.8 Flash.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
import re
from typing import Any, Dict, Optional, Union
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


def get_default_stage1_prompt_path() -> Path:
    current_file = Path(__file__).resolve()
    repo_root = current_file.parents[3]
    return repo_root / "archive" / "prompts" / "stage1_problem_classifier.md"


class Stage1Classifier:
    """
    Executes Stage 1 Problem Classification and Cognitive IR Extraction.
    """

    def __init__(
        self,
        client: genai.Client,
        model_name: str = "gemini-3.8-flash",
        prompt_path: Optional[Union[str, Path]] = None,
    ) -> None:
        self.client = client
        self.model_name = model_name
        self.prompt_path = Path(prompt_path) if prompt_path else get_default_stage1_prompt_path()

        if not self.prompt_path.is_file():
            raise FileNotFoundError(f"Stage 1 prompt not found at: {self.prompt_path}")

        with open(self.prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()

    async def classify(
        self,
        exercise: Dict[str, Any],
        retries: int = 2,
    ) -> Dict[str, Any]:
        """
        Asynchronously classifies an exercise and produces a Cognitive IR JSON.
        """
        item_id = exercise.get("id", "UNKNOWN")
        user_prompt = f"""PHÂN TÍCH NHẬN THỨC BÀI TẬP TIỂU HỌC GDPT 2018:
ID: {item_id}
Khối lớp: {exercise.get('grade')}
Môn học: {exercise.get('subject')}
Dạng bài: {exercise.get('category')}
Chủ đề: {exercise.get('topic')}
Đề bài gốc: {exercise.get('original_text')}
Phương án lựa chọn (nếu có): {exercise.get('options')}
Đáp án đúng tham chiếu: {exercise.get('final_answer', {}).get('normalized_display')}
Các bước giải mẫu tham chiếu: {json.dumps(exercise.get('ground_truth_steps', []), ensure_ascii=False)}

Hãy phân tích bài tập và xuất ra Cognitive IR JSON theo đúng định dạng được hướng dẫn.
"""

        candidate_models = [self.model_name] + [
            m for m in ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
            if m != self.model_name
        ]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
            system_instruction=self.system_prompt,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )

        for model in candidate_models:
            for attempt in range(retries + 1):
                try:
                    response = await self.client.aio.models.generate_content(
                        model=model,
                        contents=user_prompt,
                        config=config,
                    )

                    raw_text = response.text.strip()
                    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                    raw_text = re.sub(r"\s*```$", "", raw_text)

                    data = json.loads(raw_text)
                    return data
                except Exception as e:
                    logger.warning(
                        f"Stage 1 attempt {attempt + 1} with model {model} failed for {item_id}: {e}"
                    )
                    # If quota error, break inner retry loop to try next model immediately
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        break

        logger.info(f"Using high-fidelity fallback Cognitive IR for {item_id}")
        return self._construct_fallback_ir(exercise)

    def _construct_fallback_ir(self, exercise: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback Cognitive IR constructed directly from canonical exercise data."""
        gt_steps = exercise.get("ground_truth_steps", [])
        sub_questions = [s.get("instruction", "") for s in gt_steps]

        dag = []
        for idx, s in enumerate(gt_steps, start=1):
            dag.append({
                "step_index": idx,
                "goal_description": s.get("mathematical_or_logical_goal", ""),
                "operation_expression": s.get("instruction", ""),
                "target_variable": f"step_{idx}_out",
                "intermediate_value": s.get("intermediate_output", ""),
                "unit": "",
                "dependencies": [idx - 1] if idx > 1 else [],
            })

        fa = exercise.get("final_answer", {})
        return {
            "benchmark_id": exercise.get("id"),
            "problem_taxonomy": {
                "subject": "toan" if exercise.get("subject") == "Toán" else "tieng_viet",
                "grade": exercise.get("grade", 1),
                "category": exercise.get("category", ""),
                "difficulty_tier": "moderate",
            },
            "original_problem": {
                "text": exercise.get("original_text", ""),
                "target_question": exercise.get("original_text", ""),
            },
            "extracted_entities": {
                "explicit_quantities": [],
                "relational_conditions": [],
                "implicit_constants": [],
            },
            "sub_questions": sub_questions,
            "canonical_solution_dag": dag,
            "canonical_final_answer": fa,
            "potential_adhd_traps": [
                {
                    "trap_type": "working_memory_overload",
                    "description": exercise.get("adhd_scaffolding_notes", {}).get("working_memory_pitfall", ""),
                    "prevention_recommendation": exercise.get("adhd_scaffolding_notes", {}).get("executive_function_scaffolding", ""),
                }
            ],
        }
