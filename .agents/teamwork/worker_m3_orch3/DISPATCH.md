## 2026-10-18T16:50:20Z
You are Worker M3 (worker_m3_orch3) for Milestone M3: Real Micro-Task AI Decomposer Pipeline & Child Interactive Stages (Requirements R2 & R3).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m3_orch3

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Pay special attention to section ## 2026-10-18T16:12:18Z, Requirements R2 & R3 and acceptance criteria.
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\orchestrator_3\PROJECT.md
Inspect `schemas/micro_task_schema.json` to verify required Draft-07 schema properties.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK ASSIGNMENT:
Implement Requirements R2 and R3 in `index.html`:
1. Real AI Task Decomposition Pipeline (`parentRunAiBreakdown`):
   - Replace the static 4-step `setTimeout` stub with real decomposition logic:
     - Ingest user input text (`#ai-task-input`) and child cognitive profile (`appState.cognitiveProfile`: attention span, working memory, RSD sensitivity level).
     - Attempt live backend call: `async fetch("http://localhost:8000/api/tasks/decompose", { ... })` with AbortController timeout (3.5s).
     - Implement smart, content-aware client-side offline fallback when backend is unavailable or timed out:
       - Detect domain: Math (numbers, math verbs: cộng, thêm, trừ, bớt, nhân, chia) vs Reading/Vietnamese vs Chores.
       - Generate authentic micro-tasks conforming strictly to `schemas/micro_task_schema.json`:
         * Single action verb per step (`Đọc`, `Gạch_chân`, `Tính`, `Chọn`, `Điền`).
         * Micro-task duration scaled by `appState.cognitiveProfile.recommended_micro_task_duration_sec` (clamped 60s - 300s).
         * Step count capped by `appState.cognitiveProfile.max_steps_per_session`.
         * Each step has authentic `ui_type` (`highlight`, `single_choice`, `text_input`), `ui_payload`, `cognitive_scaffolding`, `hints`, and `success_criteria` (`expected_answer`, `feedback_on_error`).
     - Populate `activeGeneratedAiTask` with fully interactive steps (setting both `ui_payload` and `ui_data` for seamless rendering) and render the preview list.
2. Stage Rendering Schema Compatibility:
   - In `renderChildWorkspaceStep(stepIndex)`:
     - Standardize payload retrieval: `const ui = stepData.ui_payload || stepData.ui_data || {};`.
     - Ensure `ui_type === 'single_choice'`, `'text_input'`, and `'highlight'` render dynamically with authentic prompts, options, and placeholders rather than falling back to generic placeholder cards.
3. Strict Answer Validation in `handleChildTextInputSubmit`:
   - Enforce answer validation against `success_criteria.expected_answer` (or `stepData.expected_answer` or `ui.expected_answer`).
   - Normalize strings: trim, lowercase, and equate Vietnamese decimal comma (`12,5`) with decimal point (`12.5`).
   - If answer is correct:
     * Play star sound, show positive encouragement, and enable Next Step button (`btnNext.disabled = false`, remove `btn-disabled`).
   - If answer is incorrect:
     * Keep Next Step button disabled (`btnNext.disabled = true`, add `btn-disabled`).
     * Play gentle sound/tap, display gentle RSD-safe hint:
       `"Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"`.
       (Strict RSD protection: NO harsh red penalty icons or negative shaming).
4. Authentic Keyword Highlighting with Sentence Context:
   - Replace disconnected standalone chip buttons with contextual tokenized sentence segments.
   - For `ui_type === 'highlight'`:
     * Render the problem sentence tokenized into selectable word/phrase spans in reading order.
     * Required target segments (e.g., numbers, key entities from `ui.highlight_target_segments`) must be tapped by the child to highlight them.
     * Validate that all required target segments are selected before enabling step completion!
     * Tapping non-target tokens toggles them safely with gentle guidance.
5. Verification:
   - Execute `python tests/runner.py` to confirm 330/330 tests pass with 0 regressions.
   - Run Node.js adversarial tests (including new tests for R2/R3) to verify 0 regressions.
