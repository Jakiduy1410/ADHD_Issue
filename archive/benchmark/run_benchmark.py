"""
CLI Runner and Orchestration Engine for GDPT 2018 ADHD Micro-Task Benchmark.
Executes the two-stage prompt pipeline, multi-evaluator suite, and generates
the final docs/reports/benchmark_report.json and docs/reports/BENCHMARK_SUMMARY.md.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
from pathlib import Path
import random
import sys
import time
from typing import Any, Dict, List, Optional

# Force UTF-8 encoding on standard I/O streams for Windows environments
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logging.getLogger("google").setLevel(logging.ERROR)
logging.getLogger("google_genai").setLevel(logging.ERROR)
logger = logging.getLogger("benchmark_runner")

# Add project root to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv
from google import genai

from src.adhd_scoring.scoring_service import ScoringService
from benchmark.pipeline.stage1_classifier import Stage1Classifier
from benchmark.pipeline.stage2_decomposer import Stage2Decomposer
from benchmark.evaluators.syntax_validator import SyntaxValidator
from benchmark.evaluators.ground_truth_matcher import GroundTruthMatcher
from benchmark.evaluators.completeness_checker import CompletenessChecker
from benchmark.evaluators.pedagogical_judge import PedagogicalJudge
from benchmark.reporting.metrics_collector import MetricsCollector
from benchmark.reporting.report_generator import ReportGenerator


def get_gemini_client() -> genai.Client:
    """Loads environment and initializes Gemini API client."""
    load_dotenv(dotenv_path=REPO_ROOT / ".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY not found in environment or .env file! "
            "Please ensure .env contains a valid GEMINI_API_KEY."
        )
    return genai.Client(api_key=api_key)


async def evaluate_single_item(
    exercise: Dict[str, Any],
    stage1: Stage1Classifier,
    stage2: Stage2Decomposer,
    syntax_validator: SyntaxValidator,
    gt_matcher: GroundTruthMatcher,
    completeness_checker: CompletenessChecker,
    judge: PedagogicalJudge,
    cognitive_profile: Dict[str, Any],
    semaphore: asyncio.Semaphore,
    timeout_sec: float = 45.0,
    max_retries: int = 3,
) -> Dict[str, Any]:
    """
    Executes the full evaluation lifecycle for a single benchmark item with semaphore
    concurrency control and exponential backoff retry.
    """
    item_id = exercise.get("id", "UNKNOWN")
    grade = exercise.get("grade", 1)
    subject = exercise.get("subject", "Toán")
    category = exercise.get("category", "")
    topic = exercise.get("topic", "")

    start_time = time.time()

    async with semaphore:
        for attempt in range(1, max_retries + 1):
            try:
                # 1. Stage 1: Problem Classifier & Cognitive IR
                async with asyncio.timeout(timeout_sec):
                    cognitive_ir = await stage1.classify(exercise)

                # 2. Stage 2: Micro-Task Decomposer
                async with asyncio.timeout(timeout_sec):
                    session = await stage2.decompose(exercise, cognitive_ir, cognitive_profile)

                # 3. Evaluator 1: Syntax Validator (Draft-07)
                schema_valid, schema_errors = syntax_validator.validate(session)

                # 4. Evaluator 2: Ground Truth Matcher
                extracted_answer = (
                    session.get("final_summary", {}).get("extracted_final_answer", "")
                )
                expected_def = exercise.get("final_answer", {})
                expected_display = expected_def.get(
                    "normalized_display", str(expected_def.get("value", ""))
                )
                correctness_matched = gt_matcher.match(extracted_answer, expected_def)
                match_details = gt_matcher.match_details(extracted_answer, expected_def)

                # 5. Evaluator 3: Completeness Checker
                comp_score, comp_msgs = completeness_checker.check(
                    session.get("micro_tasks", []),
                    exercise.get("ground_truth_steps", []),
                    cognitive_ir.get("sub_questions"),
                )

                # 6. Evaluator 4: Pedagogical LLM-as-a-Judge
                async with asyncio.timeout(timeout_sec):
                    judge_eval = await judge.evaluate_session(exercise, session)
                judge_score = judge_eval.get("pedagogical_average_score")

                elapsed = time.time() - start_time
                is_live = judge_eval.get("evaluated", False)
                execution_mode = "live_gemini_3.8_flash" if is_live else "offline_canonical_validation"

                status_sym = "✅" if (schema_valid and correctness_matched) else "⚠️"
                judge_str = f"{judge_score:.2f}/10" if judge_score is not None else "UNRATED (Quota)"
                logger.info(
                    f"{status_sym} [{item_id}] Grade {grade} {subject} | "
                    f"Mode: {execution_mode} | "
                    f"Schema: {'PASS' if schema_valid else 'FAIL'} | "
                    f"Correct: {'PASS' if correctness_matched else 'FAIL'} | "
                    f"Judge: {judge_str} | Time: {elapsed:.1f}s"
                )

                return {
                    "item_id": item_id,
                    "grade": grade,
                    "subject": subject,
                    "category": category,
                    "topic": topic,
                    "execution_mode": execution_mode,
                    "schema_valid": schema_valid,
                    "schema_errors": schema_errors,
                    "correctness_matched": correctness_matched,
                    "correctness_details": match_details,
                    "completeness_score": comp_score,
                    "completeness_messages": comp_msgs,
                    "judge_score": judge_score,
                    "judge_details": judge_eval,
                    "duration_sec": round(elapsed, 2),
                    "extracted_final_answer": extracted_answer,
                    "expected_final_answer": expected_display,
                }

            except TimeoutError:
                logger.warning(
                    f"⏱️ Attempt {attempt}/{max_retries} timed out after {timeout_sec}s on {item_id}"
                )
            except Exception as exc:
                err_str = str(exc)
                logger.warning(
                    f"⚠️ Attempt {attempt}/{max_retries} failed for {item_id}: {err_str}"
                )
                # Exponential backoff on rate-limits (429/503)
                if "429" in err_str or "503" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    backoff = (2 ** attempt) + random.uniform(0.5, 2.0)
                    logger.info(f"Rate limit backoff: sleeping {backoff:.2f}s before retry...")
                    await asyncio.sleep(backoff)

        # Fallback if all retries exhausted: safe failure record
        elapsed = time.time() - start_time
        logger.error(f"❌ [{item_id}] Failed after {max_retries} attempts.")
        return {
            "item_id": item_id,
            "grade": grade,
            "subject": subject,
            "category": category,
            "topic": topic,
            "execution_mode": "offline_canonical_validation",
            "schema_valid": False,
            "schema_errors": ["Execution retries exhausted"],
            "correctness_matched": False,
            "correctness_details": {"matched": False, "reason": "Execution failed"},
            "completeness_score": 0.0,
            "completeness_messages": ["Execution failed"],
            "judge_score": None,
            "judge_details": {
                "evaluated": False,
                "reason": "API_QUOTA_EXHAUSTED",
                "logic_flow_score": None,
                "cognitive_scaffolding_score": None,
                "hint_appropriateness_score": None,
                "pedagogical_average_score": None,
                "strengths": [],
                "areas_for_improvement": [],
                "is_passed": False,
            },
            "duration_sec": round(elapsed, 2),
            "extracted_final_answer": "",
            "expected_final_answer": exercise.get("final_answer", {}).get("normalized_display", ""),
        }


async def run_benchmark(
    concurrency: int = 3,
    model_name: str = "gemini-3.8-flash",
    limit: Optional[int] = None,
    timeout_sec: float = 45.0,
    output_json: str = "docs/reports/benchmark_report.json",
    output_md: str = "docs/reports/BENCHMARK_SUMMARY.md",
) -> int:
    """
    Main asynchronous benchmark orchestrator.
    """
    print("=" * 80)
    print("AUTOMATED GDPT 2018 ELEMENTARY ADHD MICRO-TASK BENCHMARK SUITE")
    print(f"Model: {model_name} | Concurrency: {concurrency} | Timeout: {timeout_sec}s")
    print("=" * 80)

    # 1. Initialize API Client
    client = get_gemini_client()

    # 2. Load Benchmark Dataset
    benchmark_file = REPO_ROOT / "data" / "curriculum" / "grade_1_to_5_benchmark.json"
    if not benchmark_file.is_file():
        raise FileNotFoundError(f"Benchmark file not found at: {benchmark_file}")

    with open(benchmark_file, "r", encoding="utf-8") as f:
        benchmark_catalog = json.load(f)

    exercises: List[Dict[str, Any]] = benchmark_catalog.get("exercises", [])
    if limit:
        exercises = exercises[:limit]

    print(f"Loaded {len(exercises)} benchmark exercises from {benchmark_file.name}")

    # 3. Initialize Cognitive Profile via Survey Scoring Service
    scoring_service = ScoringService()
    # Canonical moderate ADHD profile responses (EF: 5, AS: 6, RSD: 5)
    clinical_answers = [2, 2, 1, 2, 2, 2, 2, 2, 1]
    cognitive_profile = scoring_service.score(
        clinical_answers,
        child_metadata={"child_name": "Nam", "grade": 3, "age": 8},
    )
    print(
        f"Initialized Target Child Cognitive Profile: "
        f"Attention={cognitive_profile['attention_span_minutes']}m, "
        f"WM={cognitive_profile['working_memory_capacity']} chunks, "
        f"RSD={cognitive_profile['rsd_sensitivity_level']}, "
        f"Scaffolding={cognitive_profile['scaffolding_level']}"
    )

    # 4. Initialize Evaluators and Pipeline
    schema_path = REPO_ROOT / "schemas" / "micro_task_schema.json"
    stage1 = Stage1Classifier(client=client, model_name=model_name)
    stage2 = Stage2Decomposer(client=client, model_name=model_name)
    syntax_validator = SyntaxValidator(schema_path=schema_path)
    gt_matcher = GroundTruthMatcher()
    completeness_checker = CompletenessChecker()
    judge = PedagogicalJudge(client=client, model_name=model_name)

    collector = MetricsCollector()
    semaphore = asyncio.Semaphore(concurrency)

    # 5. Launch Asynchronous Concurrent Tasks
    print(f"\nDispatching {len(exercises)} evaluation tasks with Semaphore({concurrency})...\n")
    start_total_time = time.time()

    tasks = [
        evaluate_single_item(
            exercise=ex,
            stage1=stage1,
            stage2=stage2,
            syntax_validator=syntax_validator,
            gt_matcher=gt_matcher,
            completeness_checker=completeness_checker,
            judge=judge,
            cognitive_profile=cognitive_profile,
            semaphore=semaphore,
            timeout_sec=timeout_sec,
        )
        for ex in exercises
    ]

    # Gather all results preserving completion order
    results = await asyncio.gather(*tasks)
    for r in results:
        collector.add_result(r)

    total_elapsed = time.time() - start_total_time

    # 6. Generate Deliverable Reports
    json_path = REPO_ROOT / output_json
    md_path = REPO_ROOT / output_md

    ReportGenerator.generate_json_report(collector, model_name=model_name, output_path=json_path)
    ReportGenerator.generate_markdown_summary(collector, model_name=model_name, output_path=md_path)

    metrics = collector.compute_summary_metrics()
    acceptance = collector.evaluate_acceptance()

    # 7. Print Terminal Summary Table
    print("\n" + "=" * 80)
    print("BENCHMARK EXECUTION COMPLETED")
    print("=" * 80)
    print(f"Total Exercises Tested: {len(exercises)}")
    print(f"Total Execution Time:   {total_elapsed:.2f}s ({total_elapsed / len(exercises):.2f}s / item)")
    judge_val_str = (
        f"{metrics['pedagogical_average_score']:.2f} / 10.0"
        if metrics.get("pedagogical_average_score") is not None
        else "UNRATED"
    )
    print(f"Syntax Compliance:      {metrics['syntax_compliance_rate'] * 100:.1f}% (Target: >= 95.0%)")
    print(f"Correctness Rate:       {metrics['final_answer_correctness_rate'] * 100:.1f}% (Target: >= 90.0%)")
    print(f"Pedagogical LLM Judge:  {judge_val_str} (Target: >= 8.5 / 10.0)")
    print(f"Completeness Rate:      {metrics['completeness_rate'] * 100:.1f}%")
    print(f"Live API Cohort:        {metrics.get('live_items_count', 0)} items")
    print(f"Offline Canonical:      {metrics.get('offline_items_count', 0)} items")
    print("-" * 80)
    print(f"Report JSON:  {json_path.resolve()}")
    print(f"Summary MD:   {md_path.resolve()}")
    print("-" * 80)

    if acceptance["all_criteria_met"]:
        print("\n🎉 ALL ACCEPTANCE CRITERIA SATISFIED! (STATUS: GREEN)\n")
        return 0
    else:
        print("\n⚠️ ONE OR MORE ACCEPTANCE CRITERIA WERE NOT MET.\n")
        return 1


def main() -> None:
    parser = argparse.ArgumentParser(description="GDPT 2018 ADHD Micro-Task Benchmark Runner")
    parser.add_argument("--concurrency", type=int, default=3, help="Max concurrent async tasks (default: 3)")
    parser.add_argument("--model", type=str, default="gemini-3.8-flash", help="Gemini model name (default: gemini-3.8-flash)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of exercises to run (default: all 25)")
    parser.add_argument("--timeout", type=float, default=45.0, help="Per-item timeout in seconds (default: 45s)")
    parser.add_argument("--output-json", type=str, default="docs/reports/benchmark_report.json", help="Path to export JSON report")
    parser.add_argument("--output-md", type=str, default="docs/reports/BENCHMARK_SUMMARY.md", help="Path to export Markdown summary")
    args = parser.parse_args()

    exit_code = asyncio.run(
        run_benchmark(
            concurrency=args.concurrency,
            model_name=args.model,
            limit=args.limit,
            timeout_sec=args.timeout,
            output_json=args.output_json,
            output_md=args.output_md,
        )
    )
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
