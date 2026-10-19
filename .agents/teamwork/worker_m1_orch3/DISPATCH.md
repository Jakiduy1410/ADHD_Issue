## 2026-10-18T16:26:18Z
You are Worker M1 (worker_m1_orch3) for Milestone M1: Folder Clean-Up & Path Integrity (Requirement R6).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1_orch3

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Pay special attention to section ## 2026-10-18T16:12:18Z, Requirement R6 and acceptance criteria.
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\orchestrator_3\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK ASSIGNMENT:
1. Reorganize root files into structured subdirectories:
   - Create `docs/research/` if it doesn't exist, and move these 4 research markdown files from the repository root:
     - `AI Can Thiệp ADHD.md` -> `docs/research/AI Can Thiệp ADHD.md`
     - `AI Parent Coach (1).md` -> `docs/research/AI Parent Coach (1).md`
     - `Nguyên nhân và Giải pháp.md` -> `docs/research/Nguyên nhân và Giải pháp.md`
     - `Ứng dụng AI cho ADHD (1).md` -> `docs/research/Ứng dụng AI cho ADHD (1).md`
   - Create `docs/reports/` if it doesn't exist, and move:
     - `BENCHMARK_SUMMARY.md` -> `docs/reports/BENCHMARK_SUMMARY.md`
     - `benchmark_report.json` -> `docs/reports/benchmark_report.json`
   - Create `docs/infra/` if it doesn't exist, and move:
     - `TEST_INFRA.md` -> `docs/infra/TEST_INFRA.md`
     - `TEST_READY.md` -> `docs/infra/TEST_READY.md`
2. CRITICAL PRESERVATION:
   - In `tests/e2e/test_dual_app_e2e.py` lines 917-920 & 1655-1658, automated tests explicitly check that `scratch/prompt_experiment_report.md` exists and contains "RSD". DO NOT move or delete `scratch/prompt_experiment_report.md`!
3. Update code and configuration paths:
   - In `benchmark/run_benchmark.py`: update default output paths from `benchmark_report.json` and `BENCHMARK_SUMMARY.md` to `docs/reports/benchmark_report.json` and `docs/reports/BENCHMARK_SUMMARY.md`.
   - In `.gitignore`: ensure `docs/reports/benchmark_report.json` and `benchmark_report.json` are listed.
   - Check if any other files in `tests/`, `src/`, or `README.md` reference the moved files, and update paths accordingly.
4. VERIFICATION:
   - Execute `python tests/runner.py` using powershell run_command.
   - Verify that all 330 tests pass with exit code 0 and 0 failures.
   - Document commands executed and exact test counts in your report.

OUTPUT REQUIREMENTS:
- Write your detailed work report to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1_orch3\report.md`.
- Write your 5-component handoff to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1_orch3\handoff.md`.
- When finished, use `send_message` to report back to orchestrator_3 (Recipient: 82075e96-ee88-4405-8b7e-45a7eaed25fe).
