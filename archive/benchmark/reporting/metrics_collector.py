"""
Metrics Collector for Elementary ADHD Micro-Task Benchmark.
Aggregates evaluation results, computes statistical metrics, and evaluates
acceptance criteria across all 25 GDPT 2018 items.
"""

from __future__ import annotations

from typing import Any, Dict, List


class MetricsCollector:
    """
    Accumulates per-item evaluation records and computes aggregate benchmarks.
    """

    def __init__(self) -> None:
        self.item_results: List[Dict[str, Any]] = []

    def add_result(self, result: Dict[str, Any]) -> None:
        """Appends an evaluated item result record."""
        self.item_results.append(result)

    def compute_live_metrics(self) -> Dict[str, Any]:
        """
        Computes metrics specifically for live API evaluated items.
        """
        live_items = [
            r for r in self.item_results
            if r.get("execution_mode") == "live_gemini_3.8_flash" or (
                r.get("judge_score") is not None
                and r.get("judge_details", {}).get("evaluated") is not False
            )
        ]
        count = len(live_items)
        if count == 0:
            return {
                "live_items_count": 0,
                "syntax_compliance_rate": 0.0,
                "final_answer_correctness_rate": 0.0,
                "pedagogical_average_score": 0.0,
                "completeness_rate": 0.0,
                "average_duration_sec": 0.0,
            }

        valid_count = sum(1 for r in live_items if r.get("schema_valid") is True)
        matched_count = sum(1 for r in live_items if r.get("correctness_matched") is True)
        completeness_sum = sum(float(r.get("completeness_score", 0.0)) for r in live_items)
        judge_scores = [float(r["judge_score"]) for r in live_items if r.get("judge_score") is not None]
        judge_avg = round(sum(judge_scores) / len(judge_scores), 2) if judge_scores else 0.0
        duration_sum = sum(float(r.get("duration_sec", 0.0)) for r in live_items)

        return {
            "live_items_count": count,
            "syntax_compliance_rate": round(valid_count / count, 4),
            "final_answer_correctness_rate": round(matched_count / count, 4),
            "pedagogical_average_score": judge_avg,
            "completeness_rate": round(completeness_sum / count, 4),
            "average_duration_sec": round(duration_sum / count, 2),
        }

    def compute_overall_metrics(self) -> Dict[str, Any]:
        """
        Computes overall metrics across the entire 25-item dataset.
        """
        total = len(self.item_results)
        if total == 0:
            return {
                "total_exercises": 0,
                "syntax_compliance_rate": 0.0,
                "final_answer_correctness_rate": 0.0,
                "completeness_rate": 0.0,
                "live_evaluated_count": 0,
                "offline_canonical_count": 0,
            }

        valid_count = sum(1 for r in self.item_results if r.get("schema_valid") is True)
        matched_count = sum(1 for r in self.item_results if r.get("correctness_matched") is True)
        completeness_sum = sum(float(r.get("completeness_score", 0.0)) for r in self.item_results)
        live_count = sum(1 for r in self.item_results if r.get("execution_mode") == "live_gemini_3.8_flash")
        offline_count = total - live_count

        return {
            "total_exercises": total,
            "syntax_compliance_rate": round(valid_count / total, 4),
            "final_answer_correctness_rate": round(matched_count / total, 4),
            "completeness_rate": round(completeness_sum / total, 4),
            "live_evaluated_count": live_count,
            "offline_canonical_count": offline_count,
        }

    def compute_summary_metrics(self) -> Dict[str, Any]:
        """
        Computes aggregate metrics across all collected item results.
        """
        total = len(self.item_results)
        if total == 0:
            return {
                "syntax_compliance_rate": 0.0,
                "final_answer_correctness_rate": 0.0,
                "pedagogical_average_score": 0.0,
                "completeness_rate": 0.0,
                "average_duration_sec": 0.0,
                "live_items_count": 0,
                "offline_items_count": 0,
            }

        valid_count = sum(1 for r in self.item_results if r.get("schema_valid") is True)
        matched_count = sum(1 for r in self.item_results if r.get("correctness_matched") is True)
        completeness_sum = sum(float(r.get("completeness_score", 0.0)) for r in self.item_results)
        
        # Calculate authentic average exclusively across evaluated items
        evaluated_items = [
            r for r in self.item_results
            if r.get("judge_score") is not None
            and r.get("judge_details", {}).get("evaluated") is not False
        ]
        if evaluated_items:
            judge_avg = round(sum(float(r["judge_score"]) for r in evaluated_items) / len(evaluated_items), 2)
        else:
            judge_avg = 0.0

        duration_sum = sum(float(r.get("duration_sec", 0.0)) for r in self.item_results)
        live_count = len(evaluated_items)

        return {
            "syntax_compliance_rate": round(valid_count / total, 4),
            "final_answer_correctness_rate": round(matched_count / total, 4),
            "pedagogical_average_score": judge_avg,
            "completeness_rate": round(completeness_sum / total, 4),
            "average_duration_sec": round(duration_sum / total, 2),
            "live_items_count": live_count,
            "offline_items_count": total - live_count,
        }

    def evaluate_acceptance(self) -> Dict[str, bool]:
        """
        Evaluates system acceptance against R4 guardrail thresholds:
          - Syntax Compliance >= 95% (0.95)
          - Correctness Rate >= 90% (0.90)
          - Pedagogical Judge Score >= 8.5 / 10.0 (on authentic live evaluation)
        """
        metrics = self.compute_summary_metrics()
        syntax_ok = metrics["syntax_compliance_rate"] >= 0.95
        correctness_ok = metrics["final_answer_correctness_rate"] >= 0.90
        judge_ok = metrics["pedagogical_average_score"] >= 8.5

        return {
            "syntax_ge_95": syntax_ok,
            "correctness_ge_90": correctness_ok,
            "judge_ge_8_5": judge_ok,
            "all_criteria_met": syntax_ok and correctness_ok and judge_ok,
        }

    def compute_breakdowns(self) -> Dict[str, Any]:
        """
        Computes performance breakdowns by Grade and by Subject Category.
        """
        by_grade: Dict[int, Dict[str, Any]] = {}
        by_category: Dict[str, Dict[str, Any]] = {}

        for r in self.item_results:
            g = int(r.get("grade", 1))
            cat = str(r.get("category", "Chung"))

            # Grade init
            if g not in by_grade:
                by_grade[g] = {"total": 0, "syntax_valid": 0, "correct": 0, "judge_sum": 0.0, "judge_count": 0}
            by_grade[g]["total"] += 1
            if r.get("schema_valid"):
                by_grade[g]["syntax_valid"] += 1
            if r.get("correctness_matched"):
                by_grade[g]["correct"] += 1
            if r.get("judge_score") is not None:
                by_grade[g]["judge_sum"] += float(r.get("judge_score"))
                by_grade[g]["judge_count"] += 1

            # Category init
            if cat not in by_category:
                by_category[cat] = {"total": 0, "syntax_valid": 0, "correct": 0, "judge_sum": 0.0, "judge_count": 0}
            by_category[cat]["total"] += 1
            if r.get("schema_valid"):
                by_category[cat]["syntax_valid"] += 1
            if r.get("correctness_matched"):
                by_category[cat]["correct"] += 1
            if r.get("judge_score") is not None:
                by_category[cat]["judge_sum"] += float(r.get("judge_score"))
                by_category[cat]["judge_count"] += 1

        # Format grade breakdown
        grade_summary = {}
        for g, data in sorted(by_grade.items()):
            tot = data["total"]
            j_cnt = data.get("judge_count", 0)
            avg_sc = round(data["judge_sum"] / j_cnt, 2) if j_cnt > 0 else None
            grade_summary[f"Lớp {g}"] = {
                "total_items": tot,
                "syntax_rate": round(data["syntax_valid"] / tot, 2),
                "correctness_rate": round(data["correct"] / tot, 2),
                "avg_judge_score": avg_sc,
                "evaluated_judge_items": j_cnt,
            }

        # Format category breakdown
        cat_summary = {}
        for cat, data in sorted(by_category.items()):
            tot = data["total"]
            j_cnt = data.get("judge_count", 0)
            avg_sc = round(data["judge_sum"] / j_cnt, 2) if j_cnt > 0 else None
            cat_summary[cat] = {
                "total_items": tot,
                "syntax_rate": round(data["syntax_valid"] / tot, 2),
                "correctness_rate": round(data["correct"] / tot, 2),
                "avg_judge_score": avg_sc,
                "evaluated_judge_items": j_cnt,
            }

        return {
            "by_grade": grade_summary,
            "by_category": cat_summary,
        }
