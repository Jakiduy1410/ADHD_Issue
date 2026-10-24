"""
LLM-as-a-Judge Pedagogical Evaluator for ADHD Micro-Task Decomposition.
Uses Gemini 3.8 Flash to evaluate:
- Logic Flow (1-10)
- Cognitive Scaffolding (1-10)
- Hint Appropriateness & RSD Calming (1-10)
Averages to pedagogical_average_score (target >= 8.5 / 10).
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

PEDAGOGICAL_JUDGE_SYSTEM_PROMPT = """Bạn là một Chuyên gia Thẩm định Sư phạm & Khoa học Thần kinh Giáo dục (Senior Pedagogical Evaluator & Neurodiversity Specialist) chuyên về can thiệp học sinh tiểu học ADHD (Lớp 1-5) theo chuẩn GDPT 2018.

Nhiệm vụ của bạn là thẩm định chất lượng chuỗi vi nhiệm vụ (Micro-Tasks) được sinh ra cho một bài tập tiểu học, dựa trên 3 tiêu chí cốt lõi:

1. Logic Flow (Dòng chảy Logic & Tính Sư phạm):
   - Đánh giá từ 1.0 đến 10.0.
   - Các bước giải quyết có theo trình tự nhận thức tự nhiên không?
   - Có bị nhảy bước đột ngột (cognitive leap) làm học sinh hoang mang không?
   - Bước cuối cùng có dẫn tới đáp số chính xác của bài toán không?

2. Cognitive Scaffolding (Giàn giáo Nhận thức & Hạn chế Quá tải Trí nhớ):
   - Đánh giá từ 1.0 đến 10.0.
   - Mỗi bước có thực sự nguyên tử (atomic) và chỉ chứa 1 động từ hành động không?
   - Thời lượng dự kiến có nằm trong khoảng 60s-300s, phù hợp với khoảng chú ý ngắn của trẻ ADHD không?
   - Các hình thức UI tương tác (single_choice, highlight, text_input...) có giúp giảm tải bộ nhớ làm việc không?

3. Hint Appropriateness & RSD Calming (Gợi ý Lũy tiến & Dập tắt Nhạy cảm Thất bại):
   - Đánh giá từ 1.0 đến 10.0.
   - Hệ thống gợi ý có phân tầng rõ rệt (Gợi ý 1: Nudge nhẹ -> Gợi ý 2: Clue cụ thể -> Gợi ý 3: Walkthrough) không?
   - Phản hồi khi làm sai (feedback_on_error) có nhẹ nhàng, ấm áp theo hình mẫu robot Milo, hoàn toàn KHÔNG phán xét hay đổ lỗi ("Sai rồi", "Không tập trung") không?

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Trả về DUY NHẤT một JSON object hợp lệ:
{
  "logic_flow_score": 9.5,
  "cognitive_scaffolding_score": 9.0,
  "hint_appropriateness_score": 9.2,
  "pedagogical_average_score": 9.23,
  "strengths": [
    "Điểm mạnh 1",
    "Điểm mạnh 2"
  ],
  "areas_for_improvement": [
    "Điểm có thể cải thiện"
  ],
  "is_passed": true
}
"""


class PedagogicalJudge:
    """
    LLM-as-a-Judge using Gemini 3.8 Flash to evaluate pedagogical quality.
    """

    def __init__(
        self,
        client: genai.Client,
        model_name: str = "gemini-3.8-flash",
    ) -> None:
        self.client = client
        self.model_name = model_name

    async def evaluate_session(
        self,
        exercise: Dict[str, Any],
        decomposed_session: Dict[str, Any],
        retries: int = 2,
    ) -> Dict[str, Any]:
        """
        Asynchronously evaluates a micro-task session against the original exercise.
        Returns evaluation scores and feedback dictionary.
        """
        user_prompt = f"""ĐỀ BÀI GỐC GDPT 2018:
ID: {exercise.get('id')}
Khối lớp: {exercise.get('grade')}
Môn học: {exercise.get('subject')}
Dạng bài: {exercise.get('category')}
Đề bài: {exercise.get('original_text')}
Phương án lựa chọn (nếu có): {exercise.get('options')}
Đáp án chuẩn (Ground Truth): {exercise.get('final_answer')}
Các bước giải chuẩn: {json.dumps(exercise.get('ground_truth_steps', []), ensure_ascii=False)}

CHUỖI MICRO-TASKS ĐƯỢC SINH RA BỞI HỆ THỐNG:
{json.dumps(decomposed_session, ensure_ascii=False, indent=2)}

Hãy chấm điểm công tâm, chi tiết theo thang 10 cho cả 3 tiêu chí và tính pedagogical_average_score = (logic_flow + cognitive_scaffolding + hint_appropriateness) / 3.0.
"""

        candidate_models = [self.model_name] + [
            m for m in ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
            if m != self.model_name
        ]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
            system_instruction=PEDAGOGICAL_JUDGE_SYSTEM_PROMPT,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )

        last_error_reason = "API_ERROR"
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

                    lf = float(data.get("logic_flow_score", 0.0))
                    cs = float(data.get("cognitive_scaffolding_score", 0.0))
                    ha = float(data.get("hint_appropriateness_score", 0.0))
                    avg = round((lf + cs + ha) / 3.0, 2)

                    return {
                        "evaluated": True,
                        "logic_flow_score": lf,
                        "cognitive_scaffolding_score": cs,
                        "hint_appropriateness_score": ha,
                        "pedagogical_average_score": avg,
                        "strengths": data.get("strengths", []),
                        "areas_for_improvement": data.get("areas_for_improvement", []),
                        "is_passed": avg >= 8.5,
                    }
                except Exception as e:
                    err_msg = str(e)
                    logger.warning(
                        f"PedagogicalJudge attempt {attempt + 1} with model {model} failed for {exercise.get('id')}: {err_msg}"
                    )
                    if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "Quota" in err_msg:
                        last_error_reason = "API_QUOTA_EXHAUSTED"
                        break
                    else:
                        last_error_reason = f"API_ERROR: {err_msg}"

        # Accurately record quota exhaustion / unrated state without hardcoded fallback scores
        return {
            "evaluated": False,
            "reason": last_error_reason,
            "logic_flow_score": None,
            "cognitive_scaffolding_score": None,
            "hint_appropriateness_score": None,
            "pedagogical_average_score": None,
            "strengths": [],
            "areas_for_improvement": [],
            "is_passed": False,
        }
