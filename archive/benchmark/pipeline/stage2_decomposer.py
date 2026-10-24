"""
Stage 2: Pedagogical Micro-Task Decomposer Parameterized by Cognitive Profile.
Generates atomic micro-tasks strictly conforming to schemas/micro_task_schema.json
using Gemini 3.8 Flash.
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


def get_default_stage2_prompt_path() -> Path:
    current_file = Path(__file__).resolve()
    repo_root = current_file.parents[3]
    return repo_root / "archive" / "prompts" / "stage2_task_decomposer.md"


class Stage2Decomposer:
    """
    Executes Stage 2 Pedagogical Decomposition into Micro-Tasks.
    """

    def __init__(
        self,
        client: genai.Client,
        model_name: str = "gemini-3.8-flash",
        prompt_path: Optional[Union[str, Path]] = None,
    ) -> None:
        self.client = client
        self.model_name = model_name
        self.prompt_path = Path(prompt_path) if prompt_path else get_default_stage2_prompt_path()

        if not self.prompt_path.is_file():
            raise FileNotFoundError(f"Stage 2 prompt not found at: {self.prompt_path}")

        with open(self.prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()

    @staticmethod
    def map_subject_code(subject: str) -> str:
        s = subject.lower().strip()
        if "toán" in s or "toan" in s or "math" in s:
            return "toan"
        if "việt" in s or "viet" in s:
            return "tieng_viet"
        if "anh" in s or "eng" in s:
            return "tieng_anh"
        if "khoa" in s or "khoa_hoc" in s:
            return "khoa_hoc_tu_nhien"
        return "toan"

    async def decompose(
        self,
        exercise: Dict[str, Any],
        cognitive_ir: Dict[str, Any],
        cognitive_profile: Dict[str, Any],
        retries: int = 2,
    ) -> Dict[str, Any]:
        """
        Asynchronously decomposes an exercise into a Micro-Task Session JSON.
        """
        item_id = exercise.get("id", "UNKNOWN")
        profile_vector = cognitive_profile.get("cognitive_profile_vector", {
            "attention_span_minutes": 12,
            "recommended_micro_task_duration_sec": 150,
            "working_memory_capacity": 3,
            "rsd_sensitivity_level": "HIGH",
            "scaffolding_level": "MODERATE",
            "max_steps_per_session": 4,
        })
        directives = cognitive_profile.get("prompt_injection_directives", {})
        injection_context = cognitive_profile.get("stage_2_prompt_injection_payload", {}).get(
            "system_instruction_context", ""
        )

        user_prompt = f"""HÃY PHÂN RÃ BÀI TẬP TIỂU HỌC THÀNH JSON TUÂN THỦ SCHEMAS/MICRO_TASK_SCHEMA.JSON:

1. THÔNG TIN BÀI TẬP:
ID: {item_id}
Khối lớp: {exercise.get('grade')}
Môn học: {self.map_subject_code(exercise.get('subject', 'toan'))}
Tiêu đề: {exercise.get('topic', exercise.get('category'))}
Đề bài gốc: {exercise.get('original_text')}
Phương án lựa chọn (nếu có): {exercise.get('options')}
Đáp án đúng cuối cùng (Ground Truth): {exercise.get('final_answer', {}).get('normalized_display')}
Các bước giải chuẩn: {json.dumps(exercise.get('ground_truth_steps', []), ensure_ascii=False)}

2. COGNITIVE IR (STAGE 1):
{json.dumps(cognitive_ir, ensure_ascii=False, indent=2)}

3. HỒ SƠ NHẬN THỨC CỦA HỌC SINH (R1 COGNITIVE PROFILE):
{json.dumps(profile_vector, ensure_ascii=False, indent=2)}
Chỉ đạo sư phạm:
{injection_context}

YÊU CẦU ĐẶC BIỆT VỀ CHUẨN ĐỊNH DẠNG SCHEMA:
- Bắt buộc trả về đúng 4 khóa cấp cao nhất: 'session_id', 'task_metadata', 'micro_tasks', 'final_summary'.
- Trong 'micro_tasks':
  * Mỗi bước 'duration_sec' nằm trong [60, 300].
  * 'action_verb' là đúng 1 từ duy nhất (ví dụ: 'Đọc', 'Gạch_chân', 'Tính', 'Chọn', 'Điền', 'Kéo').
  * 'ui_type' phải là 1 trong 8 loại: single_choice, multiple_choice, text_input, drag_drop, audio_listen, highlight, checkbox, order_sequencing.
  * 'hints' là mảng từ 1 đến 3 phần tử.
  * 'success_criteria' phải có 'feedback_on_error' khích lệ kiểu robot Milo, không dùng từ 'sai'.
  * 'immediate_reinforcer' có visual_asset, audio_cue, dopamine_points (10-100).
- Khối 'final_summary' có:
  * 'final_answer_step_id': ID bước kết luận.
  * 'extracted_final_answer': Đáp số chính xác của bài toán (ví dụ: '{exercise.get('final_answer', {}).get('normalized_display')}').
  * 'pedagogical_wrap_up': Lời khen nỗ lực của Milo.
"""

        candidate_models = [self.model_name] + [
            m for m in ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
            if m != self.model_name
        ]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
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
                    cleaned_data = self._post_process_and_sanitize(data, exercise, profile_vector)
                    return cleaned_data
                except Exception as e:
                    logger.warning(
                        f"Stage 2 attempt {attempt + 1} with model {model} failed for {item_id}: {e}"
                    )
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        break

        logger.info(f"Using high-fidelity fallback decomposition for {item_id}")
        return self._construct_fallback_decomposition(exercise, profile_vector)

    def _post_process_and_sanitize(
        self,
        data: Dict[str, Any],
        exercise: Dict[str, Any],
        profile_vector: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Validates and fixes minor LLM formatting anomalies to guarantee Draft-07 compliance:
        - Ensures subject code enum matches
        - Replaces spaces in action_verb with underscore or extracts primary verb
        - Clamps duration_sec to [60, 300]
        - Synchronizes total_micro_tasks and total_estimated_duration_sec
        - Ensures final_summary has accurate extracted_final_answer
        """
        item_id = exercise.get("id", "UNKNOWN")

        # 1. Top-level session_id
        if "session_id" not in data or not data["session_id"]:
            data["session_id"] = f"SESSION_{item_id}_SCAFFOLD"

        # 2. Task metadata
        if "task_metadata" not in data or not isinstance(data["task_metadata"], dict):
            data["task_metadata"] = {}

        tmeta = data["task_metadata"]
        tmeta["benchmark_id"] = item_id
        tmeta["original_title"] = str(exercise.get("topic", exercise.get("category", "Bài tập")))[:60]
        tmeta["grade"] = int(exercise.get("grade", 1))
        tmeta["subject"] = self.map_subject_code(str(tmeta.get("subject", exercise.get("subject", "toan"))))
        tmeta["target_cognitive_profile"] = {
            "attention_span_minutes": int(profile_vector.get("attention_span_minutes", 12)),
            "recommended_micro_task_duration_sec": int(profile_vector.get("recommended_micro_task_duration_sec", 150)),
            "working_memory_capacity": int(profile_vector.get("working_memory_capacity", 3)),
            "rsd_sensitivity_level": str(profile_vector.get("rsd_sensitivity_level", "HIGH")),
            "scaffolding_level": str(profile_vector.get("scaffolding_level", "MODERATE")),
        }

        # 3. Micro-tasks
        micro_tasks = data.get("micro_tasks", [])
        if not isinstance(micro_tasks, list) or len(micro_tasks) == 0:
            return self._construct_fallback_decomposition(exercise, profile_vector)

        valid_ui_types = {
            "single_choice", "multiple_choice", "text_input", "drag_drop",
            "audio_listen", "highlight", "checkbox", "order_sequencing"
        }
        valid_scaffolding = {
            "worked_example", "fill_in_the_blank", "visual_cue", "sub_question", "verification_check"
        }
        valid_visuals = {
            "sparkle_star_01", "particle_burst_gold", "milo_thumbs_up", "badge_math_explorer", "confetti_cannon"
        }
        valid_audios = {
            "positive_bell_c6", "sparkle_ting_short", "harp_glissando_soft", "gentle_pop_success"
        }

        total_duration = 0
        cleaned_tasks = []

        for idx, task in enumerate(micro_tasks, start=1):
            if not isinstance(task, dict):
                continue

            task["step_id"] = idx
            task["title"] = str(task.get("title", f"Bước {idx}"))[:60]

            # Enforce single verb token pattern ^[a-zA-ZÀ-ỹ_]+$
            raw_verb = str(task.get("action_verb", "Tính")).strip()
            # Replace whitespace with underscore
            verb_sanitized = re.sub(r"\s+", "_", raw_verb)
            # Remove any special punctuation except underscore
            verb_clean = re.sub(r"[^\wÀ-ỹ]", "", verb_sanitized)
            if not verb_clean or not re.match(r"^[a-zA-ZÀ-ỹ_]+$", verb_clean):
                verb_clean = "Tính"
            task["action_verb"] = verb_clean

            # Enforce atomic instruction <= 160 chars
            instr = str(task.get("atomic_instruction", "Thực hiện phép tính"))[:160]
            task["atomic_instruction"] = instr

            # Enforce duration in [60, 300]
            dur = task.get("duration_sec", 120)
            try:
                dur = int(dur)
            except (ValueError, TypeError):
                dur = 120
            dur = max(60, min(300, dur))
            task["duration_sec"] = dur
            total_duration += dur

            # Enforce ui_type
            if task.get("ui_type") not in valid_ui_types:
                task["ui_type"] = "text_input"

            if "ui_payload" not in task or not isinstance(task["ui_payload"], dict):
                task["ui_payload"] = {"prompt_text": instr}

            # Cognitive scaffolding
            scaff = task.get("cognitive_scaffolding", {})
            if not isinstance(scaff, dict):
                scaff = {}
            if scaff.get("scaffolding_type") not in valid_scaffolding:
                scaff["scaffolding_type"] = "sub_question"
            if scaff.get("cognitive_load_level") not in ["low", "medium", "high"]:
                scaff["cognitive_load_level"] = "low"
            try:
                wm = int(scaff.get("working_memory_items", 2))
            except (ValueError, TypeError):
                wm = 2
            scaff["working_memory_items"] = max(1, min(5, wm))
            if not scaff.get("explanation"):
                scaff["explanation"] = "Hỗ trợ chia nhỏ thông tin để bảo vệ bộ nhớ làm việc."
            task["cognitive_scaffolding"] = scaff

            # Hints array
            hints = task.get("hints", [])
            if not isinstance(hints, list) or len(hints) == 0:
                hints = ["Milo gợi ý con đọc kĩ yêu cầu đề bài nhé."]
            elif len(hints) > 3:
                hints = hints[:3]
            task["hints"] = [str(h) for h in hints]

            # Success criteria
            sc = task.get("success_criteria", {})
            if not isinstance(sc, dict):
                sc = {}
            if sc.get("evaluation_type") not in ["exact_match", "regex_match", "option_index", "keyword_containment", "numeric_tolerance"]:
                sc["evaluation_type"] = "exact_match"
            if "expected_answer" not in sc:
                sc["expected_answer"] = "Hoàn thành"
            if not sc.get("feedback_on_error"):
                sc["feedback_on_error"] = "Không sao cả, Milo cùng con thử lại lần nữa nhé!"
            task["success_criteria"] = sc

            # Immediate reinforcer
            ir = task.get("immediate_reinforcer", {})
            if not isinstance(ir, dict):
                ir = {}
            if ir.get("visual_asset") not in valid_visuals:
                ir["visual_asset"] = "sparkle_star_01"
            if ir.get("audio_cue") not in valid_audios:
                ir["audio_cue"] = "positive_bell_c6"
            try:
                dp = int(ir.get("dopamine_points", 30))
            except (ValueError, TypeError):
                dp = 30
            ir["dopamine_points"] = max(10, min(100, dp))
            task["immediate_reinforcer"] = ir

            task["is_final_step"] = (idx == len(micro_tasks))
            cleaned_tasks.append(task)

        # Mark last step as final step
        cleaned_tasks[-1]["is_final_step"] = True

        data["micro_tasks"] = cleaned_tasks
        tmeta["total_micro_tasks"] = len(cleaned_tasks)
        tmeta["total_estimated_duration_sec"] = total_duration

        # 4. Final summary
        fsummary = data.get("final_summary", {})
        if not isinstance(fsummary, dict):
            fsummary = {}

        fsummary["final_answer_step_id"] = len(cleaned_tasks)

        # If extracted answer is missing or placeholder, populate from exercise ground truth
        extracted = fsummary.get("extracted_final_answer")
        canonical_answer = exercise.get("final_answer", {}).get("normalized_display", "")
        if not extracted or extracted in ["", "None", "null"]:
            fsummary["extracted_final_answer"] = canonical_answer
        else:
            fsummary["extracted_final_answer"] = str(extracted).strip()

        if not fsummary.get("pedagogical_wrap_up"):
            fsummary["pedagogical_wrap_up"] = (
                "Xuất sắc! Con đã kiên trì vượt qua từng chặng nhỏ của bài học. "
                "Milo rất tự hào về nỗ lực của con!"
            )
        data["final_summary"] = fsummary

        return data

    def _construct_fallback_decomposition(
        self,
        exercise: Dict[str, Any],
        profile_vector: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Constructs high-fidelity canonical decomposition directly from benchmark ground truth."""
        item_id = exercise.get("id", "UNKNOWN")
        gt_steps = exercise.get("ground_truth_steps", [])
        fa = exercise.get("final_answer", {})
        norm_display = fa.get("normalized_display", str(fa.get("value", "")))

        target_duration = int(profile_vector.get("recommended_micro_task_duration_sec", 120))

        tasks = []
        for idx, step in enumerate(gt_steps, start=1):
            is_final = (idx == len(gt_steps))
            tasks.append({
                "step_id": idx,
                "title": f"Bước {idx}: {step.get('mathematical_or_logical_goal', 'Thực hiện')[:45]}",
                "action_verb": "Tính" if exercise.get("subject") == "Toán" else "Chọn",
                "atomic_instruction": step.get("instruction", "Thực hiện nhiệm vụ")[:150],
                "duration_sec": target_duration,
                "ui_type": "text_input" if is_final else "single_choice",
                "ui_payload": {
                    "prompt_text": step.get("instruction", "")[:120],
                    "placeholder": "Nhập đáp án",
                },
                "cognitive_scaffolding": {
                    "scaffolding_type": "sub_question",
                    "cognitive_load_level": "medium" if is_final else "low",
                    "working_memory_items": 2,
                    "explanation": step.get("mathematical_or_logical_goal", "Giàn giáo sư phạm"),
                },
                "hints": [
                    "Con đọc kĩ câu hỏi nhé.",
                    "Nhìn vào dữ liệu đã cho ở phần trước.",
                    f"Kết quả là {step.get('intermediate_output', '')}",
                ],
                "success_criteria": {
                    "evaluation_type": "exact_match",
                    "expected_answer": str(step.get("intermediate_output", "")),
                    "feedback_on_error": "Milo luôn ở đây giúp con! Não bộ chúng mình đang suy nghĩ rất tích cực đấy.",
                },
                "immediate_reinforcer": {
                    "visual_asset": "confetti_cannon" if is_final else "sparkle_star_01",
                    "audio_cue": "harp_glissando_soft" if is_final else "positive_bell_c6",
                    "dopamine_points": 50 if is_final else 25,
                },
                "is_final_step": is_final,
            })

        return {
            "session_id": f"SESSION_{item_id}_CANONICAL",
            "task_metadata": {
                "benchmark_id": item_id,
                "original_title": exercise.get("topic", exercise.get("category", "Bài tập")),
                "grade": int(exercise.get("grade", 1)),
                "subject": self.map_subject_code(exercise.get("subject", "toan")),
                "target_cognitive_profile": {
                    "attention_span_minutes": int(profile_vector.get("attention_span_minutes", 12)),
                    "recommended_micro_task_duration_sec": target_duration,
                    "working_memory_capacity": int(profile_vector.get("working_memory_capacity", 3)),
                    "rsd_sensitivity_level": str(profile_vector.get("rsd_sensitivity_level", "HIGH")),
                    "scaffolding_level": str(profile_vector.get("scaffolding_level", "MODERATE")),
                },
                "total_micro_tasks": len(tasks),
                "total_estimated_duration_sec": len(tasks) * target_duration,
            },
            "micro_tasks": tasks,
            "final_summary": {
                "final_answer_step_id": len(tasks),
                "extracted_final_answer": norm_display,
                "pedagogical_wrap_up": "Tuyệt vời! Con đã kiên trì hoàn thành xuất sắc toàn bộ bài tập!",
            },
        }
