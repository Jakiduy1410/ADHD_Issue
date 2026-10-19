# Master Plan: Standardized R&D Toolkit for Elementary ADHD Micro-Task Intervention

## Objective
Deliver a production-grade, mathematically and pedagogically verified intervention toolkit satisfying:
1. R1: ADHD 9-question parent survey & cognitive parameter mapping (`data/surveys/adhd_parent_survey.json`)
2. R2: 25 benchmark exercises Grade 1-5 (GDPT 2018) with `ground_truth_steps` & `final_answer` (`data/curriculum/grade_1_to_5_benchmark.json`)
3. R3: JSON Schema (draft-07) in `schemas/micro_task_schema.json`, two-stage decomposition prompt pipeline, and encouragement prompts
4. R4: Automated benchmark suite in Python using Gemini API reading key from `.env`, checking syntax (>=95%), correctness (>=90%), LLM judge (>=8.5/10), producing `benchmark_report.json` and Markdown summary.

## Phase Breakdown

### Phase 0: Full Scope Survey (Exploration)
- Explorer 1: Analyze existing markdown files (`AI Can Thiệp ADHD.md`, `AI Parent Coach (1).md`, etc.) and clinical ADHD diagnostic criteria (Vanderbilt VADPRS, SNAP-IV, Executive Function, Attention Span, RSD).
- Explorer 2: Analyze GDPT 2018 Vietnamese curriculum standards for Grades 1-5 across Math word problems, Vietnamese reading comprehension, Multiple Choice ABCD, and English.
- Explorer 3: Investigate JSON Schema Draft-07 specification, Gemini API environment (`.env`, Python libraries `google-genai` / `google-generativeai`), async execution structure, evaluation metrics, and LLM-as-a-judge rubric.

### Phase 1: Architecture & Decomposition (PROJECT.md)
- Synthesize findings into `PROJECT.md`.
- Establish Milestones M1 (R1 Survey), M2 (R2 Benchmark Data), M3 (R3 Schema & Prompts), M4 (R4 Benchmark Harness & E2E Validation).
- Define interface contracts between cognitive profile vector, benchmark items, decomposition prompt pipeline, and evaluation runner.

### Phase 2: Execution & Verification Loop
For each milestone:
- Explorer analyzes & designs implementation specification.
- Worker implements genuine solution (strict anti-cheating warning).
- Reviewers (2) independently review code, data, and pedagogical soundness.
- Challengers (2) stress-test edge cases and validate schemas.
- Forensic Auditor verifies genuine implementation and absence of cheating.
- Gate check: strict all-pass required.

### Phase 3: Final E2E Benchmark Execution & Quality Gate
- Run full 25-task automated benchmark using Gemini API.
- Verify Syntax Compliance >= 95%.
- Verify Final Answer Correctness >= 90%.
- Verify Pedagogical LLM Judge >= 8.5/10.
- Verify `benchmark_report.json` and Markdown summary generation.

### Phase 4: Final Handover
- Comprehensive synthesis and final report to parent/user.
