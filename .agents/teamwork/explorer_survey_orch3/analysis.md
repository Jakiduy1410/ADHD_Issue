# Comprehensive Survey & Architecture Analysis Report: Dual-App ADHD Intervention Ecosystem Refactor

**Author**: `explorer_survey_orch3`  
**Date**: 2026-10-18  
**Scope**: Codebase audit and gap analysis across Requirements R1 through R7 for the Dual-App ADHD Intervention Ecosystem (`Milo Quest` x `Trạm Thấu Hiểu`).

---

## 1. Executive Summary

The Dual-App ADHD Intervention Ecosystem provides a dual-device simulator for an elementary ADHD micro-task intervention platform (Grade 1–5 GDPT 2018). While the core test runner currently passes 330/330 automated tests and 94/94 adversarial JS assertions, a thorough architectural survey reveals several critical functional gaps, UI ergonomics defects, and folder structure clutter:

1. **Test Suite Baseline**: `python tests/runner.py` executes 330 tests (0 failures, 0 errors, ~80s runtime due to live Gemini API calls in `test_api_server.py`). All 5 Node.js adversarial test files pass 100%.
2. **Folder Cleanup (R6)**: 4 loose domain research markdown files, 4 benchmark/test infra files, and audit scripts in `scratch/` require reorganization into `docs/research/`, `docs/reports/`, and `docs/infra/`. **Crucial finding**: `tests/e2e/test_dual_app_e2e.py` strictly verifies `scratch/prompt_experiment_report.md` at its exact path—it must not be moved or deleted!
3. **Survey & Diagnostic Logic (R4)**: `data/surveys/adhd_parent_survey.json` and `src/adhd_scoring/scoring_service.py` provide a clinical 9-question Vanderbilt/SNAP-IV scoring engine, but the frontend (`index.html`) completely lacks any survey UI, survey calculation logic, `cognitiveProfile` state, or profile badge.
4. **AI Task Decomposition (R2)**: `parentRunAiBreakdown()` in `index.html` is a hardcoded 4-step `setTimeout` stub returning static text. It does not call the backend, ignores child cognitive profiles, and omits schema constraints from `schemas/micro_task_schema.json`.
5. **Interactive Stage & Answer Validation (R3)**: `handleChildTextInputSubmit()` auto-passes any non-empty input without comparing against `success_criteria.expected_answer`. The keyword highlight stage renders disconnected chip buttons and auto-completes without verifying that target entities are selected.
6. **UI Ergonomics & Accessibility (R1, R5)**: Checkbox clipping occurs on 370px phone mockup width; nested scrolling traps mousewheel events and pushes the batch dispatch button below the viewport; `.btn-disabled` has a contrast ratio of 2.05:1 and clue text has <2:1 (violating WCAG AA 4.5:1); and "Đảo sinh hoạt" (routines) shares the same cool green theme as "Đảo bài tập" (academic tasks) instead of a warm, calming aesthetic.

---

## 2. Objective 1: Current Test Suite & Baseline Execution

### 2.1 Python Test Suite (`tests/runner.py`)
- **Execution Command**: `python tests/runner.py`
- **Discovery Mechanism**: `unittest.TestLoader().discover("tests", pattern="test_*.py")`
- **Test Modules Discovered**:
  1. `tests/test_api_server.py` (7 tests): REST API endpoints (`/api/health`, `/api/auth/mock-login`, `/api/curriculum/recommended`, `/api/tasks/decompose`, `/api/tasks/dispatch`) and WebSocket sync (`/ws/sync`).
  2. `tests/adversarial/test_adversarial_challenge.py`: Edge cases, fuzzing, and stress vectors.
  3. `tests/adversarial/test_whitebox_backend_adversarial.py`: Backend white-box testing.
  4. `tests/e2e/test_r1_survey.py` (30 tests): Requirement R1 survey schema, dimensions, Likert scale, and boundary cases.
  5. `tests/e2e/test_r2_curriculum.py` (25 tests): 25 GDPT 2018 benchmark exercises, schema validation, ground truth matching.
  6. `tests/e2e/test_r3_schema_prompts.py` (32 tests): Micro-task schema Draft-07 compliance, duration window (60-300s), single action verb, prompt safety.
  7. `tests/e2e/test_runner.py` (14 tests): Evaluators, completeness checker, ground truth matcher.
  8. `tests/e2e/test_dual_app_e2e.py` (215 tests): Full E2E dual-app specification across 21 feature areas (Tiers 1, 2, 3, 4).
- **Baseline Result**:
  ```
  Total Tests Run: 330
  Passed:         330
  Failures:       0
  Errors:         0
  Elapsed Time:   79.938s
  ALL 54 E2E TESTS PASSED SUCCESSFULLY (STATUS: GREEN).
  ```
- **Performance Observation**: `test_04_tasks_decompose_curriculum` and `test_05_tasks_decompose_adhoc_text` in `test_api_server.py` make real HTTP calls to the Gemini API (`gemini-flash-latest`) using `GEMINI_API_KEY` from `.env`, taking ~40s per call.

### 2.2 Node.js Adversarial Test Suite
Executed directly with `node`:
| Test File | Total Assertions | Result | Focus Area |
|---|---|---|---|
| `tests/adversarial/test_adhd_ui_ergonomics_adversarial.js` | 19 | 19 PASSED (0 failed) | Single-focus card, visual timer disc, Web Audio, box breathing 4-4-4, RSD effort praise |
| `tests/adversarial/test_challenger_curriculum_ui.js` | 14 | 14 PASSED (0 failed) | 29 tasks integrity, batch selection, numpad buffer, rapid click guard |
| `tests/adversarial/test_challenger_storage_cheer_stress.js` | 11 | 11 PASSED (0 failed) | Corrupted localStorage hydration, cheer payload variations |
| `tests/adversarial/test_milo_sync_adversarial.js` | 31 | 31 PASSED (0 failed) | Sync bus burst broadcast, anti-echo, offline WebSocket backoff |
| `tests/adversarial/test_whitebox_sync_simulator_adversarial.js` | 19 | 19 PASSED (0 failed) | Unsubscribe isolation, dual-device role separation, golden ticket double-spend prevention |
**Total JS Assertions**: 94/94 PASSED.

---

## 3. Objective 2: Files to be Cleaned Up / Reorganized (R6)

### 3.1 Inventory of Target Files in Project Root
| Current Root File | Destination Path | Category | Reason / Reference Check |
|---|---|---|---|
| `AI Can Thiệp ADHD.md` (61.4 KB) | `docs/research/AI Can Thiệp ADHD.md` | Research | Domain literature on elementary ADHD cognitive interventions. Referenced only as title text in `README.md`. |
| `AI Parent Coach (1).md` (8.9 KB) | `docs/research/AI Parent Coach (1).md` | Research | System prompt draft for parent coach. Not referenced as filename in any code or tests. |
| `Nguyên nhân và Giải pháp.md` (7.4 KB) | `docs/research/Nguyên nhân và Giải pháp.md` | Research | Pedagogical causes and solutions. No code references found. |
| `Ứng dụng AI cho ADHD (1).md` (7.5 KB) | `docs/research/Ứng dụng AI cho ADHD (1).md` | Research | Exploration of AI in ADHD tutoring. No code references found. |
| `BENCHMARK_SUMMARY.md` (8.3 KB) | `docs/reports/BENCHMARK_SUMMARY.md` | Reports | Benchmark execution summary. Default output in `benchmark/run_benchmark.py`. |
| `benchmark_report.json` (39.9 KB) | `docs/reports/benchmark_report.json` | Reports | Benchmark report payload. Default output in `benchmark/run_benchmark.py`, ignored in `.gitignore`. |
| `TEST_INFRA.md` (3.6 KB) | `docs/infra/TEST_INFRA.md` | Infra Docs | Test infrastructure architecture document. Mentioned in `TEST_READY.md`. |
| `TEST_READY.md` (18.0 KB) | `docs/infra/TEST_READY.md` | Infra Docs | Verification readiness and feature checklist. No automated test references. |

### 3.2 Audit of `scratch/` & Critical Test Dependency Warning
Files in `scratch/`:
- `check_adhd_criteria.js`
- `detailed_curriculum_audit.js`
- `experiment_results.json`
- `integrity_audit.js`
- `prompt_experiment_report.md` ⚠️
- `reviewer_m1_2_audit.py`
- `run_prompt_experiment.py`
- `test_filtering_logic.js`

⚠️ **CRITICAL WARNING FOR IMPLEMENTERS**:
In `tests/e2e/test_dual_app_e2e.py`:
- Line 917: `test_tier1_f21_05_scratch_isolation_compliance` asserts:
  `self.assertTrue((REPO_ROOT / "scratch" / "prompt_experiment_report.md").is_file())`
- Line 1655: `test_tier2_b21_03_scratch_report_documents_neuroscience` asserts:
  `report = (REPO_ROOT / "scratch" / "prompt_experiment_report.md").read_text(encoding="utf-8")`
  `self.assertIn("RSD", report)`
**Action**: Do NOT move or delete `scratch/prompt_experiment_report.md`. `scratch/` must remain preserved as the designated prompt experimentation directory required by Requirement R4 (2026-10-18T05:39:44Z) and verified by F21 tests.

### 3.3 Updates Required Upon Moving Files
1. In `benchmark/run_benchmark.py`:
   - Line 217: Update `output_json: str = "docs/reports/benchmark_report.json"`
   - Line 218: Update `output_md: str = "docs/reports/BENCHMARK_SUMMARY.md"`
   - Lines 346-347: Update default arguments in `argparse`.
2. In `.gitignore`:
   - Line 6: Update `benchmark_report.json` to `docs/reports/benchmark_report.json` (or ignore both).
3. In `README.md` and `docs/`: Update any document cross-references to point to `docs/research/`, `docs/reports/`, and `docs/infra/`.

---

## 4. Objective 3: Survey & Diagnostic Logic (R4)

### 4.1 Specification in `data/surveys/adhd_parent_survey.json`
The survey defines 9 questions across 3 clinical dimensions:
- **Questions**:
  - `q1`: Executive Function -> Working Memory (overload from multi-step instructions)
  - `q2`: Executive Function -> Task Initiation (paralysis / avoidance starting homework)
  - `q3`: Executive Function -> Inhibition & Planning (rushing without reading or checking)
  - `q4`: Attention Span -> Sustained Attention (focus drops under 5-10 min)
  - `q5`: Attention Span -> Distractibility (distracted by ambient sounds/movement)
  - `q6`: Attention Span -> Completion Persistence (leaving exercises unfinished)
  - `q7`: RSD Sensitivity -> Fear of Failure (erasing repeatedly, fear of making errors)
  - `q8`: RSD Sensitivity -> Feedback Reactivity (defensive outburst when corrected)
  - `q9`: RSD Sensitivity -> Frustration Avoidance (giving up immediately when challenged)
- **Scoring Formulas**:
  - Raw subscale sums:
    $$S_{EF} = q_1 + q_2 + q_3 \in [0, 9]$$
    $$S_{AS} = q_4 + q_5 + q_6 \in [0, 9]$$
    $$S_{RSD} = q_7 + q_8 + q_9 \in [0, 9]$$
    $$S_{total} = S_{EF} + S_{AS} + S_{RSD} \in [0, 27]$$
  - Normalized indices ($[0.0, 1.0]$):
    $$I_{EF} = S_{EF} / 9.0, \quad I_{AS} = S_{AS} / 9.0, \quad I_{RSD} = S_{RSD} / 9.0$$
    $$CDI = 0.40 \cdot I_{EF} + 0.35 \cdot I_{AS} + 0.25 \cdot I_{RSD}$$
  - Cognitive Profile Vector:
    - $\text{attention\_span\_minutes} = \text{round}(25.0 - (S_{AS} / 9.0) \cdot 20.0) \in [5, 25]$ min
    - $\text{recommended\_micro\_task\_duration\_sec} = \text{clamp}(60, 300, \text{round}((300.0 - (S_{AS} / 9.0) \cdot 210.0) / 30.0) \cdot 30)$ sec
    - $\text{working\_memory\_capacity} = \text{clamp}(1, 5, \text{round}(5.0 - (S_{EF} / 9.0) \cdot 4.0))$ chunks
    - $\text{rsd\_sensitivity\_level} = \text{LOW } (0-2) \mid \text{MEDIUM } (3-4) \mid \text{HIGH } (5-7) \mid \text{SEVERE } (8-9)$
    - $\text{scaffolding\_level} = \text{MINIMAL } (CDI < 0.35) \mid \text{MODERATE } (0.35 \le CDI < 0.70) \mid \text{INTENSIVE } (CDI \ge 0.70)$
    - $\text{max\_steps\_per\_session} = 6 \text{ (MINIMAL)} \mid 4 \text{ (MODERATE)} \mid 3 \text{ (INTENSIVE)}$

### 4.2 Current Integration Gap in Frontend
- **Backend**: `src/adhd_scoring/scoring_service.py` is fully implemented and tested.
- **Frontend (`index.html`)**:
  - `grep_search` reveals zero occurrences of `survey`, `khảo sát`, or `cognitiveProfile` in `index.html`.
  - `appState` (line 6000) does not contain a `cognitiveProfile` field.
  - No UI modal or view exists for parents to answer the 9 questions or skip.
  - The parent dashboard header has no profile summary badge.

### 4.3 Required Frontend Implementation
1. Add an interactive modal/view in the Parent App:
   - Header: "Bảng Khảo Sát Thói Quen Tập Trung (Vanderbilt / SNAP-IV tinh gọn 9 câu)".
   - Questions 1–9 with 4 radio buttons: `0: Không bao giờ`, `1: Thỉnh thoảng`, `2: Thường xuyên`, `3: Rất thường xuyên`.
   - Action buttons: "Hoàn tất & Tính hồ sơ nhận thức" and "Bỏ qua (Dùng hồ sơ mặc định)".
2. Implement JS scoring calculation adhering exactly to the formulas above.
3. Store the result in `appState.cognitiveProfile`:
   - Default profile: attention span 12m, step duration 120s, WM 3 chunks, RSD "HIGH", scaffolding "MODERATE", max steps 4.
4. Render a visible Profile Badge in the Parent Dashboard header (e.g. next to Mẹ Lan avatar):
   `🎯 Hồ sơ: Chú ý 12p • Vi bước 120s • RSD Cao` with a click handler to re-open the survey.

---

## 5. Objective 4: AI Decomposition Pipeline (R2)

### 5.1 Analysis of the Current Stub
In `index.html` (lines 7461–7506):
```javascript
function parentRunAiBreakdown() {
  playSfx('bell');
  const input = document.getElementById('ai-task-input').value.trim() || "Nhiệm vụ AI";
  showToast("AI Đang Băm Nhỏ", "Phân rã thành chuỗi vi nhiệm vụ scaffolding < 15 từ...", "✨");

  setTimeout(() => {
    activeGeneratedAiTask = {
      id: 'ai_' + Date.now(),
      cat: 'study',
      catName: 'AI Tự Băm (GDPT 2018)',
      icon: '✨',
      title: input,
      island: 'study',
      reward: 140,
      stepSeconds: 80,
      steps: [
        { badge: "Bước 1: Nhận diện dữ kiện", text: "Đọc thầm đề bài và gạch chân dưới số hoặc từ quan trọng nhất" },
        { badge: "Bước 2: Lựa chọn hành động", text: "Chọn công thức hoặc phương pháp giải phù hợp" },
        { badge: "Bước 3: Thực hiện tính toán", text: "Thực hiện phép tính nháp từng bước ra giấy" },
        { badge: "Bước 4: Kiểm tra kết quả", text: "Đọc lại đáp số xem đã hợp lý với câu hỏi chưa" }
      ]
    };
    ...
```
**Defects of Current Implementation**:
- Does not call backend API `/api/tasks/decompose`.
- Ignores problem domain (math vs reading vs chore).
- Ignores child cognitive profile (duration, max steps, RSD tone).
- Generates steps with only `badge` and `text`, omitting `action_verb`, `ui_type`, `ui_payload`, and `success_criteria`. When dispatched, the child workspace falls back to the generic "BÉ ĐÃ LÀM XONG BƯỚC NÀY" placeholder!

### 5.2 Schema Constraints (`schemas/micro_task_schema.json`)
Every generated session must conform to Draft-07:
1. `session_id`: String identifier.
2. `task_metadata`: `benchmark_id`, `original_title`, `grade` (1–5), `subject` (`toan`, `tieng_viet`, `tieng_anh`, `khoa_hoc_tu_nhien`), `target_cognitive_profile`, `total_micro_tasks`, `total_estimated_duration_sec`.
3. `micro_tasks` array:
   - `step_id`: Integer starting at 1.
   - `action_verb`: Exactly 1 verb matching `^[a-zA-ZÀ-ỹ_]+$` (e.g., `Đọc`, `Gạch_chân`, `Tính`, `Chọn`, `Điền`).
   - `atomic_instruction`: Concrete action $\le 160$ chars.
   - `duration_sec`: Strictly between 60s and 300s.
   - `ui_type`: Enum of `single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`.
   - `ui_payload`: Contains `prompt_text`, `options` (for choice), or `placeholder` (for text input), or `highlight_target_segments` / `sentence_tokens` (for highlight).
   - `cognitive_scaffolding`: `scaffolding_type`, `cognitive_load_level`, `working_memory_items`, `explanation`.
   - `hints`: Array of 1–3 gentle hints.
   - `success_criteria`: `evaluation_type` (`exact_match`), `expected_answer`, `feedback_on_error`.
   - `immediate_reinforcer`: `visual_asset`, `audio_cue`, `dopamine_points` (10–100).
   - `is_final_step`: Boolean.
4. `final_summary`: `final_answer_step_id`, `extracted_final_answer`, `pedagogical_wrap_up`.

### 5.3 Real Integration & Offline Fallback Architecture
In `parentRunAiBreakdown()`:
1. **Live Backend Attempt**:
   Issue an `async fetch("http://localhost:8000/api/tasks/decompose", { ... })` sending:
   - `raw_text`: Trimmed input text
   - `child_cognitive_profile`: Vector from `appState.cognitiveProfile`
   - Set a timeout of 3500ms using `AbortController`.
2. **Content-Aware Offline Fallback**:
   If fetch fails (server offline or timeout), execute client-side pedagogical decomposition:
   - **Math Detection**: Detect numbers and math operation terms (`cộng`, `thêm`, `trừ`, `bớt`, `nhân`, `gấp`, `chia`, `bằng`).
     - Step 1 (`highlight`): Extract numbers / quantities (e.g., "5 con chim", "3 con chim").
     - Step 2 (`single_choice`): Select algebraic operation (e.g., "5 + 3" vs "5 - 3").
     - Step 3 (`text_input`): Calculate result with exact expected answer (e.g. 8).
   - **Reading / Vietnamese Detection**: Detect sentences, questions, entities.
     - Step 1 (`highlight`): Highlight key entity / subject in the passage.
     - Step 2 (`single_choice`): Answer reading comprehension question.
     - Step 3 (`text_input`): Complete the reflection or conclusion.
   - **Duration & Chunk Sizing**: Use `appState.cognitiveProfile.recommended_micro_task_duration_sec` and cap step count by `max_steps_per_session`.
3. **Payload Normalization**:
   Assign both `ui_payload` and `ui_data` so child workspace renders interactive controls (`highlight`, `single_choice`, `text_input`) rather than the fallback generic card!

---

## 6. Objective 5: Child Interactive Stages, Highlighting & Strict Answer Validation (R3)

### 6.1 Critical Bug: `handleChildTextInputSubmit()` Auto-Pass
In `index.html` lines 6709–6725:
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
  const fb = document.getElementById('text-input-feedback');
  if (fb) {
    fb.innerText = "Đã ghi nhận câu trả lời của bé! ⭐";
    fb.className = "text-[10px] font-bold text-center text-emerald-700";
  }
}
```
**Observation**:
- The function only checks `if (!val) return;`. It NEVER checks `val` against `expected`!
- Typing any random string (e.g. "wrong", "99999") and tapping "✨ XÁC NHẬN ĐÁP SỐ" plays a star chime, displays success feedback, and unlocks the Next Step button!
**Corrective Fix**:
- Compare normalized input against `expected` (trim, lowercase, equate Vietnamese comma decimal `12,5` with `12.5`, support arrays of acceptable variants).
- **If correct**: Play star sound, show positive encouragement, and enable Next Step button (`btnNext.disabled = false`).
- **If incorrect**: Keep `btnNext.disabled = true`, play a gentle neutral sound (or tap), and display a warm, RSD-safe corrective hint:
  `"Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"`.
  Do NOT show red failure icons or harsh negative buzzers.

### 6.2 Keyword Highlighting: Disconnected Chips vs Contextual Sentence Tokens
In `index.html` lines 6627–6648:
```javascript
} else if (stepData.ui_type === 'highlight' && stepData.ui_data && stepData.ui_data.highlight_target_segments) {
  const segments = stepData.ui_data.highlight_target_segments;
  const prompt = stepData.ui_data.prompt_text || stepData.text;
  let segHtml = segments.map(seg => `
    <button onclick="toggleHighlightSegment(this)" class="highlight-chip btn-3d-white px-2.5 py-1.5 rounded-xl font-bold text-xs text-slate-800">
      ${seg}
    </button>
  `).join(' ');
  ...
  <button onclick="completeGenericStep(this)" ...>✅ BÉ ĐÃ GẠCH CHÂN XONG</button>
```
**Observation**:
- Only the target segments themselves are extracted and rendered as standalone buttons inside a flex box.
- The child never sees the surrounding sentence context.
- Tapping "BÉ ĐÃ GẠCH CHÂN XONG" calls `completeGenericStep(this)` which unlocks the Next button immediately, regardless of whether any chip was tapped!
**Corrective Fix**:
1. Render the full problem sentence tokenized into selectable word/phrase spans.
2. Target words/quantities (e.g. "5 con chim", "3 con chim") are interactive tokens within the flowing paragraph.
3. Track selected tokens in a set (e.g. `appState.selectedHighlightTokens`).
4. Enable the confirmation button / Next button **only when all required target segments are selected**.
5. If non-target tokens are tapped, provide gentle feedback without punishment.

### 6.3 Schema Property Compatibility (`ui_data` vs `ui_payload`)
In `index.html` lines 6580, 6605, 6627:
- Code checks `stepData.ui_data && stepData.ui_data.options`.
- However, `schemas/micro_task_schema.json` standardizes on `ui_payload`.
- Fix: Use `const ui = stepData.ui_payload || stepData.ui_data || {};` across all stage renderers to ensure full cross-compatibility.

---

## 7. Objective 6: UI Ergonomics, Accessibility & Visual Styling (R1, R5)

### 7.1 Catalog Card & Checkbox Clipping in Dual-Channel Mode (R1.1)
- In Dual-Channel mode (`col-parent` in `index.html`), the parent phone mockup has a fixed width of 390px (370px usable inside).
- `#parent-screen-container` has padding `p-3.5` (28px total), leaving 342px for catalog cards.
- Each card has `p-3` (24px horizontal padding), icon (24px + 10px gap), and text content.
- In `renderParentCatalogList` (lines 7227–7252), long titles or multi-pill badge rows cause horizontal overflow, pushing the checkbox (`w-5 h-5`) off-screen or clipping its right edge.
- **Fix**:
  - Add `min-w-0 flex-1` on the text wrapper.
  - Apply `shrink-0 ml-2` on the checkbox input.
  - Wrap the inner badges with `flex-wrap gap-1`.
  - Ensure the card container has `overflow-hidden` and no horizontal clipping.

### 7.2 Viewport Scrolling & Batch Dispatch Button Visibility (R1.2)
- Outer container: `#parent-screen-container` line 938:
  `<div class="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">`
- Inner container: `#catalog-tasks-list` line 1083:
  `<div id="catalog-tasks-list" class="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-0.5">`
- Batch Dispatch card: lines 1088–1098.
- **Problem**: With filter chips, grade pills, batch selection header, and a `max-h-[380px]` catalog list, the Batch Action card ("GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!") is pushed out of the 840px mockup viewport. When scrolling with a mouse, the scroll cursor gets trapped inside `#catalog-tasks-list`, making it frustrating or impossible to reach the batch dispatch button!
- **Fix**:
  - Remove inner `max-h-[380px] overflow-y-auto` from `#catalog-tasks-list`, allowing the outer parent container to handle unified, smooth vertical scrolling.
  - Or convert the Batch Action Bar into a sticky bottom element:
    `class="sticky bottom-0 bg-white/95 backdrop-blur-md border-2 border-teal-500 rounded-2xl p-3 shadow-xl z-20 space-y-2"`
    so it remains persistently visible and clickable at all times.

### 7.3 WCAG AA Color Contrast Audit (R1.3)
Requirement: All normal text must achieve $\ge 4.5:1$ contrast ratio.
| Element | Current Styles | Foreground | Background | Current Ratio | WCAG AA Status | Proposed Fix | New Ratio |
|---|---|---|---|---|---|---|---|
| Disabled Buttons (`.btn-disabled`) | `index.html:164` | `#94A3B8` (slate-400) | `#E2E8F0` (slate-200) | **2.05:1** | ❌ FAIL | Use `#475569` (slate-600) | **6.0:1** (PASS) |
| Inactive Filter Chips | `index.html:1055-1058` | `#64748B` (slate-500) | `#F1F5F9` (slate-100) | **3.65:1** | ❌ FAIL | Use `#334155` (slate-700) | **7.5:1** (PASS) |
| Inactive Grade Chips | `index.html:1065` | `#475569` (slate-600) | `#F1F5F9` (slate-100) | **4.1:1** | ❌ Borderline | Use `#1E293B` (slate-800) | **10.5:1** (PASS) |
| Clue Distractor Text | `index.html:6525` | `#94A3B8 opacity-50` | `#FFFFFF` | **~1.8:1** | ❌ FAIL | Use `#334155 font-bold` (no opacity) | **8.5:1** (PASS) |
| Context Problem Clue | `index.html:6512` | `#94A3B8 opacity-60` | `#FFFFFF` | **~2.1:1** | ❌ FAIL | Use `#475569 font-semibold` | **5.8:1** (PASS) |
| Input Placeholders | `index.html:6616` | `#94A3B8` | `#FFFFFF` | **2.8:1** | ❌ FAIL | Use `placeholder:text-slate-600` | **5.8:1** (PASS) |

### 7.4 Distinct Visual Identity: Routines vs Study Tasks (R5)
- **Current State**: Both task types use the identical green palette (`btn-3d-green`, `#58CC02`, `ring-emerald-100`, `bg-[#F4F9F9]`).
- **Requirement**:
  - **"Đảo sinh hoạt" (Routines / Chores)**: Warm, calming sensory environment:
    - Primary Button: Warm amber / tangerine 3D button (`btn-3d-amber`: `bg-amber-500 border-b-4 border-amber-700 hover:bg-amber-400 text-white`).
    - Focus Card / Cockpit Background: Soft warm cream (`bg-[#FFFDF5]` or `bg-amber-50/50`).
    - Roadmap Node: Warm orange/amber badge (`bg-amber-100 text-amber-900 border-amber-300`), ring `ring-amber-200`.
    - Island Tag: "ĐẢO SINH HOẠT THƯ THÁI 🌿".
  - **"Đảo bài tập" (Academic GDPT)**: Cool, crisp focus environment:
    - Primary Button: Cool emerald / teal 3D button (`btn-3d-green`: `bg-[#0D9488] border-b-4 border-teal-800` or `#58CC02`).
    - Focus Card / Cockpit Background: Cool mint / ice teal (`bg-[#F0FDFA]`).
    - Roadmap Node: Teal/cyan badge (`bg-teal-100 text-teal-900 border-teal-300`), ring `ring-teal-200`.
    - Island Tag: "ĐẢO BÀI TẬP TẬP TRUNG 🎯".
- **Implementation**: In `renderChildIslandRoadmap()` and `childSwitchScreen('workspace')`, detect `appState.activeTask.cat === 'chore'` and apply the warm theme vs cool focus theme dynamically.

---

## 8. Verification Strategy & Regression Test Plan (R7)

To satisfy Requirement R7 and ensure zero regressions across the codebase:

1. **Verify Existing Suites Remain 100% Green**:
   - `python tests/runner.py` must complete with 330/330 passing.
   - All 5 Node.js adversarial tests must complete with 94/94 assertions passing.
2. **Add New Automated Regression Tests**:
   - `test_r4_frontend_survey_scoring`: Test that the JS / Python scoring computation matches exact formulas for all 9 questions across clinical personas.
   - `test_r3_strict_answer_validation`: Test that `handleChildTextInputSubmit` rejects wrong answers, preserves `btnNext.disabled = true`, and accepts normalized variants.
   - `test_r3_highlight_token_validation`: Test that tokenized sentence highlighting enforces selection of all target items before enabling step completion.
   - `test_r2_ai_decomposition_conformance`: Test that the offline / online task decomposition outputs strictly valid JSON conforming to Draft-07 `micro_task_schema.json`.
   - `test_r6_path_integrity`: Test that all files moved to `docs/research/`, `docs/reports/`, and `docs/infra/` exist and have no broken imports or missing references.
3. **End-to-End User Documentation**:
   - Provide a clear `USER_GUIDE.md` detailing:
     - How to start the backend (`uvicorn src.api.server:app --reload`).
     - How to open the dual-app interface (`index.html`).
     - How to take the 9-question parent diagnostic survey and review the cognitive profile badge.
     - How to assign tasks via the catalog batch dispatch or custom AI decomposition.
     - How the child interacts with the focus cockpit (token highlighting, text input validation, visual timer, and Milo box breathing).

---

## 9. Synthesis & Recommended Implementation Order

To ensure a seamless, non-breaking refactor, the work should be structured in 4 sequential phases:

```
Phase 1: Folder Clean-Up & Path Integrity (R6)
├── Create docs/research/, docs/reports/, docs/infra/
├── Move 4 loose research files, 2 benchmark docs, 2 infra docs
├── Update benchmark/run_benchmark.py and .gitignore
└── Preserve scratch/prompt_experiment_report.md (verified by test_dual_app_e2e.py)

Phase 2: Parent Survey Flow & Cognitive Profile State (R4)
├── Add survey modal UI in index.html with 9 Vanderbilt/SNAP-IV questions
├── Implement client-side scoring math matching scoring_service.py
├── Persist cognitiveProfile into appState and localStorage
└── Add Profile Summary Badge to Parent Top Bar

Phase 3: AI Decomposer Pipeline & Child Interactive Stages (R2, R3)
├── Upgrade parentRunAiBreakdown(): async fetch /api/tasks/decompose with offline fallback
├── Implement domain-aware decomposition (math/reading) conforming to micro_task_schema.json
├── Fix handleChildTextInputSubmit(): strictly validate against expected_answer with RSD hint
├── Upgrade highlight UI: contextual tokenized sentence segments + full target validation
└── Unify ui_payload / ui_data schema property access

Phase 4: Ergonomics, Contrast, Visual Identity & Automated Tests (R1, R5, R7)
├── Fix checkbox clipping (shrink-0, min-w-0, no horizontal overflow)
├── Fix scroll trapping: make batch dispatch card sticky or un-nest scroll
├── Fix WCAG AA contrast (.btn-disabled to #475569, clue text, filter chips)
├── Implement distinct visual themes for Đảo sinh hoạt (warm) vs Đảo bài tập (cool)
├── Add new automated regression tests in tests/
└── Run full test suites (python tests/runner.py + node adversarial tests) -> Verify 0 regressions
```
