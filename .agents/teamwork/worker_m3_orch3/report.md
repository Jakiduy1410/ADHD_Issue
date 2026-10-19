# Milestone M3 Work Report: Real Micro-Task AI Decomposer Pipeline & Child Interactive Stages (Requirements R2 & R3)

**Agent**: Worker M3 (`worker_m3_orch3`)  
**Timestamp**: 2026-10-18T17:08:00Z  
**Target Milestone**: M3 (Features 5, 6, 7, 8 in `PROJECT.md`; Requirements R2 & R3 in `ORIGINAL_REQUEST.md`)  
**Status**: COMPLETED (100% Verified, 0 Regressions)

---

## 1. Executive Summary

Milestone M3 delivers the real pedagogical Micro-Task AI Decomposition Pipeline and upgraded child interactive stages for the Dual-App ADHD Intervention Ecosystem (`Milo Quest` x `Trạm Thấu Hiểu`):

1. **Replaced Static Stub with Real AI Decomposer (`parentRunAiBreakdown`)**:
   - Ingests raw task text from `#ai-task-input` and the child's live clinical cognitive profile from `appState.cognitiveProfile` (attention span, working memory capacity, RSD sensitivity level, scaffolding tier).
   - Attempts live backend decomposition via `POST http://localhost:8000/api/tasks/decompose` with an `AbortController` 3.5s timeout guardrail.
   - Implements an authentic, content-aware client-side offline fallback when the backend is offline or unconfigured.
   - Fully conforms to `schemas/micro_task_schema.json` (Draft-07), ensuring single action verbs per step (`Đọc`, `Gạch_chân`, `Tính`, `Chọn`, `Điền`), duration scaled to `recommended_micro_task_duration_sec` (clamped 60s–300s), and step counts capped by `max_steps_per_session`.
   - Dual-assigns both `ui_payload` and `ui_data` on all steps for seamless rendering across modern and legacy component consumers.

2. **Stage Rendering Schema Compatibility (`renderChildWorkspaceStep`)**:
   - Standardized payload resolution: `const ui = stepData.ui_payload || stepData.ui_data || {};`.
   - Replaced generic placeholder fallback with dynamic rendering for:
     * `single_choice`: Authentic prompt text, options list, and expected answer matching.
     * `text_input`: Authentic prompt text, custom placeholders, and hints.
     * `highlight`: Contextual problem sentence in reading order with interactive token spans.

3. **Strict Answer Validation & RSD Shield (`handleChildTextInputSubmit`)**:
   - Replaced legacy auto-pass stub with strict answer validation against `success_criteria.expected_answer` (with fallback to `stepData.expected_answer` and `ui.expected_answer`).
   - Implemented string normalization: whitespace trimming, lowercase conversion, and equating Vietnamese decimal comma (`12,5`) with decimal point (`12.5`).
   - If correct: plays star sound (`playSfx('star')`), displays encouragement, and enables Next Step button (`btnNext.disabled = false`).
   - If incorrect: keeps Next Step button disabled (`btnNext.disabled = true`, adds `btn-disabled`), plays gentle tap sound (`playSfx('tap')`), and displays non-punitive, RSD-safe corrective guidance:
     `"Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"`.
     (Strict RSD protection: NO harsh red penalty icons or negative shaming).

4. **Authentic Contextual Keyword Highlighting**:
   - Replaced disconnected standalone chips with tokenized sentence segments rendered in authentic reading order (`tokenizeSentenceForHighlight`).
   - Highlights target entities (e.g. quantities, nouns) in bright amber (`bg-amber-300 border-amber-400 font-black`) when tapped.
   - Non-target tokens toggle safely with gentle guidance without penalization.
   - Completion button (`btn-complete-highlight`) is strictly disabled until ALL required target segments are highlighted, preventing premature step completion.

5. **Exhaustive Automated Verification**:
   - `python tests/runner.py`: **330/330 tests pass (100% green, 0 failures, 0 errors, 0 regressions)**.
   - 7 Node.js adversarial test suites: **118/118 tests pass (100% green)**, including 8 newly written adversarial tests in `tests/adversarial/test_m3_ai_decomposition_interactive_stages.js`.

---

## 2. Technical Implementation Details

### 2.1 Domain-Aware Micro-Task Generator (`generateClientSideMicroTasks`)
Located in `index.html`:
- Classifies input into 3 pedagogical domains:
  - **Math (`toan`)**: Detects numbers and arithmetic keywords (`cộng`, `thêm`, `trừ`, `bớt`, `nhân`, `chia`, `gấp`, `giảm`, `chia đều`, `chu vi`, `diện tích`, `bao nhiêu`). Extracts quantities, infers operation sign, and generates 3 atomic micro-steps:
    1. `Gạch_chân` (highlight): Identify numbers in sentence context.
    2. `Chọn` (single_choice): Select the correct arithmetic formula.
    3. `Điền` (text_input): Compute and input the final answer.
  - **Chores / Routines (`khoa_hoc_tu_nhien`)**: Detects household & routine keywords (`dọn`, `bàn học`, `rác`, `sách vở`, `quần áo`, `rửa bát`, `đánh răng`). Generates 3 atomic micro-steps:
    1. `Gạch_chân` (highlight): Identify messy items in context.
    2. `Chọn` (single_choice): Select the tidy behavior.
    3. `Điền` (text_input): Confirm completion by typing `"xong"`.
  - **Vietnamese / Reading (`tieng_viet`)**: Detects literature keywords (`đọc`, `bài thơ`, `đoạn văn`, `từ ngữ`, `từ láy`). Generates 3 atomic micro-steps:
    1. `Gạch_chân` (highlight): Highlight key figurative/descriptive word.
    2. `Chọn` (single_choice): Choose the literary meaning.
    3. `Điền` (text_input): Cloze exercise filling in the keyword.

### 2.2 JSON Schema Conformance
Every generated micro-task session strictly adheres to `schemas/micro_task_schema.json` (Draft-07):
- `session_id`: Unique identifier (`SESSION_AI_${timestamp}`).
- `task_metadata`: `benchmark_id`, `original_title` (<= 60 chars), `grade` (1-5), `subject` (enum: `toan`, `tieng_viet`, `tieng_anh`, `khoa_hoc_tu_nhien`), `target_cognitive_profile`, `total_micro_tasks`, `total_estimated_duration_sec`.
- `micro_tasks`: Array of micro-tasks each with `step_id`, `title`, `action_verb` (regex `^[a-zA-ZÀ-ỹ_]+$`), `atomic_instruction` (<= 160 chars), `duration_sec` (60-300), `ui_type`, `ui_payload`, `cognitive_scaffolding`, `hints` (1-3 items), `success_criteria`, `immediate_reinforcer` (`visual_asset`, `audio_cue`, `dopamine_points`), and `is_final_step`.
- `final_summary`: `final_answer_step_id`, `extracted_final_answer`, `pedagogical_wrap_up`.

### 2.3 Strict Answer Normalization Algorithm
```javascript
function normalizeAnswer(val) {
  if (val === null || val === undefined) return "";
  let s = String(val).trim().toLowerCase();
  // Equate Vietnamese decimal comma (12,5) with decimal point (12.5)
  s = s.replace(/(\d+),(\d+)/g, "$1.$2");
  s = s.replace(/\s+/g, " ");
  return s;
}
```
Validation accepts exact matches, numeric equivalence (`12.5` === `12.50`), and matches against arrays of acceptable variants.

### 2.4 Sentence Tokenization Algorithm
```javascript
function tokenizeSentenceForHighlight(sentence, targets) {
  // Sort target segments by length descending
  // Extract non-overlapping target phrases into distinct tokens
  // Split intermediate sentences by word tokens in reading order
  // Return [{ text, isTarget, targetKey }]
}
```
Ensures children read the actual problem sentence naturally from left to right while interacting directly with words as physical objects.

---

## 3. Verification Commands & Results

| Test Suite | Framework | Tests | Result | Notes |
|------------|-----------|-------|--------|-------|
| `tests/runner.py` | Python unittest | 330 | **330 Passed, 0 Failed** | 0 regressions across all E2E Tiers 1-4 |
| `test_m3_ai_decomposition_interactive_stages.js` | Node.js assert | 8 | **8 Passed, 0 Failed** | New M3 test suite covering R2 & R3 |
| `test_challenger_curriculum_ui.js` | Node.js assert | 14 | **14 Passed, 0 Failed** | Updated strict validation assertions |
| `test_adhd_ui_ergonomics_adversarial.js` | Node.js assert | 19 | **19 Passed, 0 Failed** | Ergonomics & focus card workflows |
| `test_parent_survey_cognitive_profile.js` | Node.js assert | 16 | **16 Passed, 0 Failed** | M2 survey scoring & persistence |
| `test_challenger_storage_cheer_stress.js` | Node.js assert | 11 | **11 Passed, 0 Failed** | Storage corruption & cheer payloads |
| `test_milo_sync_adversarial.js` | Node.js assert | 31 | **31 Passed, 0 Failed** | MiloSyncBus 10-event state protocol |
| `test_whitebox_sync_simulator_adversarial.js` | Node.js assert | 19 | **19 Passed, 0 Failed** | Dual simulator & golden ticket |
| **Total Test Coverage** | **Python + Node** | **448** | **448 Passed, 0 Failed** | **100% Green** |

---

## 4. Modified Files

1. `index.html`:
   - Updated `renderChildWorkspaceStep` with `stepIndex` argument support, standardized `ui_payload || ui_data`, and dynamic rendering for `single_choice`, `text_input`, and `highlight`.
   - Added `normalizeAnswer`, `tokenizeSentenceForHighlight`, `toggleHighlightToken`, `completeHighlightStep`.
   - Updated `handleChildTextInputSubmit` with strict answer validation, decimal normalization, and RSD-safe gentle feedback.
   - Added `detectDomainSubject` and `generateClientSideMicroTasks` adhering strictly to Draft-07 schema.
   - Replaced static `setTimeout` in `parentRunAiBreakdown` with live backend fetch and smart offline fallback.
   - Exported M3 functions on `window` for DOM event handling and testing.
2. `tests/adversarial/test_challenger_curriculum_ui.js`:
   - Updated text input fuzzing assertion to verify answer rejection on incorrect inputs and acceptance on valid trimmed & decimal comma inputs.
3. `tests/adversarial/test_m3_ai_decomposition_interactive_stages.js`:
   - Created comprehensive adversarial verification suite for M3 requirements.
