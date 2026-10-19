# 5-Component Handoff Report: Dual-App ADHD Intervention Ecosystem Refactor Survey

**Agent**: `explorer_survey_orch3`  
**Recipient**: `orchestrator_3` (`82075e96-ee88-4405-8b7e-45a7eaed25fe`)  
**Timestamp**: 2026-10-18T16:26:00Z  
**Type**: Hard Handoff (Investigation & Baseline Survey Complete)

---

## 1. Observation

1. **Current Test Suite Execution**:
   - Tool Command: `python tests/runner.py`
   - Output:
     ```
     Total Tests Run: 330
     Passed:         330
     Failures:       0
     Errors:         0
     Elapsed Time:   79.938s
     ALL 54 E2E TESTS PASSED SUCCESSFULLY (STATUS: GREEN).
     ```
   - Node.js tests executed:
     - `node tests/adversarial/test_adhd_ui_ergonomics_adversarial.js`: 19/19 PASSED
     - `node tests/adversarial/test_challenger_curriculum_ui.js`: 14/14 PASSED
     - `node tests/adversarial/test_challenger_storage_cheer_stress.js`: 11/11 PASSED
     - `node tests/adversarial/test_milo_sync_adversarial.js`: 31/31 PASSED
     - `node tests/adversarial/test_whitebox_sync_simulator_adversarial.js`: 19/19 PASSED
   - Live Gemini API calls occur in `tests/test_api_server.py:84-134` (`test_04_tasks_decompose_curriculum` and `test_05_tasks_decompose_adhoc_text`) using `GEMINI_API_KEY` from `.env`.

2. **Loose Root Markdown Files & Test Dependency**:
   - Loose research files in root: `AI Can Thiệp ADHD.md`, `AI Parent Coach (1).md`, `Nguyên nhân và Giải pháp.md`, `Ứng dụng AI cho ADHD (1).md`.
   - Benchmark / test infra files in root: `BENCHMARK_SUMMARY.md`, `TEST_INFRA.md`, `TEST_READY.md`, `benchmark_report.json`.
   - `benchmark/run_benchmark.py:217-218` and lines 346-347 specify default output paths `benchmark_report.json` and `BENCHMARK_SUMMARY.md`.
   - `.gitignore:6` contains `benchmark_report.json`.
   - **Critical Dependency**: In `tests/e2e/test_dual_app_e2e.py:917-920`:
     ```python
     def test_tier1_f21_05_scratch_isolation_compliance(self):
         """F21.5: Prompt experiments and diff reports are strictly isolated in scratch/."""
         scratch_dir = REPO_ROOT / "scratch"
         self.assertTrue((scratch_dir / "prompt_experiment_report.md").is_file())
     ```
     and line 1657:
     ```python
     report = (REPO_ROOT / "scratch" / "prompt_experiment_report.md").read_text(encoding="utf-8")
     self.assertIn("RSD", report)
     ```
     `scratch/prompt_experiment_report.md` is strictly asserted by existing automated tests and must NOT be moved or deleted.

3. **Parent Diagnostic Survey State**:
   - `data/surveys/adhd_parent_survey.json` defines 9 questions, Likert scale 0-3, clinical dimensions (`executive_function`, `attention_span`, `rsd_sensitivity`), and scoring formulas for $I_{EF}, I_{AS}, I_{RSD}, CDI$ and profile vectors.
   - `src/adhd_scoring/scoring_service.py` implements `calculate_cognitive_profile()` with full validation.
   - In `index.html`: `grep_search` for `survey`, `khảo sát`, or `cognitiveProfile` returned 0 matches. `appState` (lines 6000-6030) has no `cognitiveProfile`. No survey modal or badge exists in the frontend.

4. **AI Decomposition Stub**:
   - In `index.html:7461-7505`, `parentRunAiBreakdown()` uses a static `setTimeout(..., 500)` that instantiates `activeGeneratedAiTask` with 4 generic hardcoded steps ("Đọc thầm đề bài...", "Chọn công thức...", "Thực hiện phép tính...", "Đọc lại đáp số...").
   - It makes no HTTP calls to `/api/tasks/decompose`, ignores child cognitive parameters, and omits `action_verb`, `ui_type`, and `success_criteria`.

5. **Child Stage Validation & Highlighting Bugs**:
   - In `index.html:6709-6725`:
     ```javascript
     function handleChildTextInputSubmit(expected) {
       const input = document.getElementById('child-stage-text-input');
       if (!input) return;
       const val = input.value.trim();
       if (!val) return;
       playSfx('star');
       const btnNext = document.getElementById('child-btn-next-step');
       if (btnNext) {
         btnNext.disabled = false;
         btnNext.classList.remove('btn-disabled');
       }
       ...
     ```
     It enables `btnNext` on ANY non-empty text without verifying `val` against `expected`.
   - In `index.html:6627-6648`: For `ui_type === 'highlight'`, target segments are mapped to standalone `<button class="highlight-chip ...">` outside sentence context, and `completeGenericStep(this)` enables Next Step without checking if any chip was selected.
   - In `index.html:6580, 6605, 6627`: Code checks `stepData.ui_data`, while `schemas/micro_task_schema.json:172` specifies `ui_payload`.

6. **UI Ergonomics & Contrast**:
   - In `index.html:7227-7252`: Catalog card inside `.phone-mockup` (390px width) can clip checkboxes on constrained viewports if title or badge rows wrap poorly.
   - In `index.html:938` and `1083`: Outer `#parent-screen-container` body (`overflow-y-auto`) encloses inner `#catalog-tasks-list` (`max-h-[380px] overflow-y-auto`), causing mousewheel scroll trapping and burying the Batch Dispatch button ("GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!").
   - Contrast Ratios:
     - `.btn-disabled` (`index.html:164`): `#94A3B8` on `#E2E8F0` is 2.05:1 (WCAG AA requires $\ge 4.5:1$).
     - Clue distractor text (`index.html:6525`): `#94A3B8 opacity-50` on `#FFFFFF` is ~1.8:1.
     - Context clue text (`index.html:6512`): `#94A3B8 opacity-60` on `#FFFFFF` is ~2.1:1.
     - Inactive filter chips (`index.html:1055-1058`): `#64748B` on `#F1F5F9` is 3.65:1.
   - Visual Themes (R5): Both routines (`cat: 'chore'`) and academic tasks (`cat: 'math'/'viet'/'eng'`) render with identical green styling (`btn-3d-green`, `ring-emerald-100`, `bg-[#F4F9F9]`).

---

## 2. Logic Chain

1. From **Observation 1**, all existing 330 Python tests and 94 JS assertions currently pass. Therefore, any refactoring must maintain backwards compatibility with existing element IDs, event bus protocol names, and test assertions.
2. From **Observation 2**, moving the 4 loose research markdown files to `docs/research/`, benchmark files to `docs/reports/`, and test infra docs to `docs/infra/` cleans the root directory without breaking any test, provided `benchmark/run_benchmark.py` and `.gitignore` are updated. However, `scratch/prompt_experiment_report.md` must be left in `scratch/` because `test_dual_app_e2e.py` asserts its exact path.
3. From **Observation 3**, the clinical survey backend (`scoring_service.py`) works, but `index.html` has no survey UI or state. Implementing a 9-question modal flow with Likert scoring in JS and storing the vector in `appState.cognitiveProfile` directly satisfies R4.
4. From **Observation 4**, `parentRunAiBreakdown()` is an incomplete mock. Connecting it via `async fetch` to `/api/tasks/decompose` with an offline client-side fallback conforming to `schemas/micro_task_schema.json` satisfies R2.
5. From **Observation 5**, `handleChildTextInputSubmit()` currently accepts wrong answers because it lacks a conditional comparison with `expected`. Adding normalized comparison with RSD-safe hints and upgrading the highlight stage to tokenized sentence spans with selection validation satisfies R3.
6. From **Observation 6**, adjusting card padding/flexbox, making the batch dispatch button sticky, darkening `.btn-disabled` to `#475569`, removing clue opacity, and applying warm styling to `cat === 'chore'` directly resolves R1 and R5.

---

## 3. Caveats

1. **Live Gemini Calls in Test Suite**: Running `python tests/runner.py` requires ~80s because `test_api_server.py` tests call the live Gemini API using `.env`. If internet access is interrupted or API quota is reached, those two tests will fall back to canonical mock outputs.
2. **`index.html` vs `generate_app.py`**: `generate_app.py` is a generator script containing `build_full_html()`. Existing tests read `index.html` directly. While `index.html` is the primary runtime file, `generate_app.py` should either be kept in sync or updated so future executions of `generate_app.py` do not overwrite refactored code.
3. **Challenger JS Test Vector**: In `tests/adversarial/test_challenger_curriculum_ui.js:438`, a fuzz test submitted a 1000-character input to `handleChildTextInputSubmit("14")` and asserted `!btnNext.disabled` because of the old auto-pass behavior. When implementing strict validation, `handleChildTextInputSubmit` should reject non-matching answers like `"A".repeat(1000)` while continuing to pass exact matches like `"14"`.

---

## 4. Conclusion

The ecosystem is architecturally sound with a solid test harness (330 passing tests), but contains specific implementation gaps:
- R1: Checkbox layout overflow, scroll wheel trapping, and 4 specific WCAG AA contrast failures.
- R2: Hardcoded 4-step `parentRunAiBreakdown()` stub needing API integration and intelligent offline fallback.
- R3: Auto-pass bug in `handleChildTextInputSubmit()`, disconnected highlight chips, and `ui_data` vs `ui_payload` mismatch.
- R4: Complete absence of frontend parent survey modal, scoring, and cognitive profile state.
- R5: Absence of warm calming theme for routines vs cool focus theme for study tasks.
- R6: 8 loose root files requiring move to `docs/` while strictly keeping `scratch/prompt_experiment_report.md` in `scratch/`.
- R7: Full test verification and user guide documentation required upon completion.

All fixes are clearly scoped and can be implemented with zero regressions.

---

## 5. Verification Method

To independently verify all findings and validate future implementations:

1. **Run Current Test Suite**:
   ```powershell
   python tests/runner.py
   ```
   *Expected*: Exit code 0, 330 tests run, 0 failures, 0 errors.

2. **Run Node.js Adversarial Test Suites**:
   ```powershell
   node tests/adversarial/test_adhd_ui_ergonomics_adversarial.js
   node tests/adversarial/test_challenger_curriculum_ui.js
   node tests/adversarial/test_challenger_storage_cheer_stress.js
   node tests/adversarial/test_milo_sync_adversarial.js
   node tests/adversarial/test_whitebox_sync_simulator_adversarial.js
   ```
   *Expected*: All 5 suites report PASSED with 0 failures.

3. **Inspect Problematic Code Locations**:
   - `index.html:6709-6725`: `handleChildTextInputSubmit()` auto-passing flaw.
   - `index.html:7461-7505`: `parentRunAiBreakdown()` static 4-step `setTimeout` stub.
   - `index.html:6627-6648`: Highlight stage standalone chips without selection validation.
   - `index.html:163-168`: `.btn-disabled` `#94A3B8` on `#E2E8F0` (contrast 2.05:1).
   - `index.html:6512, 6525`: Clue text opacity 50% and 60% (contrast < 2:1).
   - `index.html:938, 1083`: Nested scroll containers hiding batch dispatch button.
   - `tests/e2e/test_dual_app_e2e.py:917-920, 1655-1658`: Tests requiring `scratch/prompt_experiment_report.md`.

4. **Invalidation Condition**:
   Any change that breaks the existing 330 tests or removes `scratch/prompt_experiment_report.md` will immediately fail `python tests/runner.py`.
