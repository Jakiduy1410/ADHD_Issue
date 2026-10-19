## 2026-10-17T13:24:36Z
You are Curriculum Implementation Worker (Milestone M2).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m2\
The authoritative user request is located at: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md and c:\Users\ADMIN\Documents\antigravity\calm-bardeen\PROJECT.md before starting work.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You exclusively own: `data/curriculum/grade_1_to_5_benchmark.json` and `schemas/grade_1_to_5_benchmark_schema.json`.
You must NOT modify files owned by other workers.

Your task:
1. Review Explorer 2's specification at:
   - `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_2\handoff.md`
2. Deploy `schemas/grade_1_to_5_benchmark_schema.json` adhering to Draft-07 JSON Schema.
3. Deploy `data/curriculum/grade_1_to_5_benchmark.json` with exactly 25 exercises:
   - Exactly 5 per grade (Grade 1, 2, 3, 4, 5).
   - Exactly 10 Toán lời văn, 5 Tiếng Việt / Đọc hiểu, 5 Trắc nghiệm ABCD (with options and distractor analysis), 5 Tiếng Anh.
   - 100% of exercises must contain:
     * `original_text`
     * `ground_truth_steps` (canonical pedagogical steps structured for ADHD micro-tasking)
     * `final_answer` (`value`, `unit`, `normalized_display`, `acceptable_variants`)
     * `adhd_scaffolding_notes` (working memory pitfall, executive function scaffolding, visual aid)
4. Run verification tests using Python `jsonschema.Draft7Validator` to prove 100% compliance with zero validation errors.
5. Document all commands and results in `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m2\handoff.md`.
6. Send a message to orchestrator (`799fffd1-d215-47b1-9d09-7dfd1688ffaf`) when complete.
