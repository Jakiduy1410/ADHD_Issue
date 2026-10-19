"""
Completeness Checker for Elementary ADHD Micro-Task Benchmark.
Evaluates whether intermediate sub-goals and sub-questions from canonical
ground truth steps are sufficiently covered in decomposed micro-tasks.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple


class CompletenessChecker:
    """
    Checks coverage of intermediate sub-goals, canonical solution steps,
    and sub-questions in the generated micro-task session.
    """

    def check(
        self,
        micro_tasks: List[Dict[str, Any]],
        ground_truth_steps: List[Dict[str, Any]],
        sub_questions: Optional[List[str]] = None,
    ) -> Tuple[float, List[str]]:
        """
        Evaluates step and goal coverage.
        Returns:
            (coverage_rate: float in [0.0, 1.0], messages: List[str])
        """
        if not micro_tasks:
            return 0.0, ["Micro-tasks list is empty"]

        if not ground_truth_steps:
            return 1.0, []

        messages: List[str] = []

        # Check final step designation
        has_final_step = any(task.get("is_final_step") is True for task in micro_tasks)
        if not has_final_step:
            messages.append("No micro-task is flagged with is_final_step: True")

        # Step count coverage: micro-tasks must scaffold the problem adequately
        expected_step_count = len(ground_truth_steps)
        actual_step_count = len(micro_tasks)

        min_required = max(1, expected_step_count - 1)
        if actual_step_count >= min_required:
            coverage = 1.0
        else:
            coverage = round(actual_step_count / expected_step_count, 2)
            messages.append(
                f"Generated {actual_step_count} micro-tasks; expected at least {min_required} to cover {expected_step_count} canonical steps"
            )

        # Check sub-question coverage if provided
        if sub_questions:
            sq_count = len(sub_questions)
            if actual_step_count < sq_count and coverage == 1.0:
                coverage = round(actual_step_count / max(1, sq_count), 2)
                messages.append(
                    f"Generated {actual_step_count} micro-tasks for {sq_count} identified sub-questions"
                )

        return coverage, messages
