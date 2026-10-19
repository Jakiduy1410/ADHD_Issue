# Detailed Work Report: Milestone M2 — Parent Diagnostic Survey & Cognitive Profile Integration (Requirement R4)

**Worker**: Worker M2 (`worker_m2_orch3`)  
**Timestamp**: 2026-10-18T16:50:00Z  
**Target File**: `index.html`  
**Test Suite Added**: `tests/adversarial/test_parent_survey_cognitive_profile.js`  

---

## 1. Executive Summary
Milestone M2 implements the clinical 9-question Parent Diagnostic Survey (VADPRS / SNAP-IV / Barkley framework) and Cognitive Profile Integration into the Dual-App ADHD Intervention Ecosystem (`index.html`).

All clinical dimensions (Executive Function $S_{EF}$, Attention Span $S_{AS}$, and Rejection Sensitive Dysphoria $S_{RSD}$) and normalized composite indices ($CDI$) have been implemented in JavaScript, matching the Python production reference `src/adhd_scoring/scoring_service.py` with 100% mathematical fidelity (verified across all 1,000 subscale score combinations with 0 discrepancies).

The interactive workflow is accessible via a top-header Summary Badge and overview card in the Parent App, supporting seamless modal completion, answer validation, state synchronization, local storage persistence, and default profile skipping.

---

## 2. Detailed Technical Implementation

### 2.1 Clinical 9-Question Survey Modal & Dialog Flow
- **Modal Component**: Added `#parent-survey-modal` inside `#parent-screen-container` (parent phone mockup viewport), styled with responsive backdrop-blur, smooth scrollable form, and clean header/footer action rows.
- **Questions Ingested**: Ingested all 9 questions from `data/surveys/adhd_parent_survey.json`:
  - `q1`: Executive Function — Working Memory (multi-step instructions)
  - `q2`: Executive Function — Task Initiation (task paralysis)
  - `q3`: Executive Function — Inhibition & Planning (impulsive rushing)
  - `q4`: Attention Span — Sustained Attention (focus span)
  - `q5`: Attention Span — Distractibility (sensory filtering)
  - `q6`: Attention Span — Completion Persistence (task abandonment)
  - `q7`: RSD Sensitivity — Fear of Failure (perfectionism & anxiety)
  - `q8`: RSD Sensitivity — Feedback Reactivity (emotional flare-ups)
  - `q9`: RSD Sensitivity — Frustration Avoidance (rapid surrender)
- **Likert Scale**: 4-point Likert options (values 0–3) formatted as interactive radio cards:
  - 0: "Không bao giờ"
  - 1: "Thỉnh thoảng"
  - 2: "Thường xuyên"
  - 3: "Rất thường xuyên"
- **Action Buttons**:
  - `btn-save-survey` ("Lưu & Tính Điểm Hồ Sơ"): validates all 9 questions answered, calculates clinical profile, persists to state and storage, updates UI, closes modal, shows success toast.
  - `btn-skip-survey` ("Bỏ qua (Dùng Mặc Định)"): resets profile to contract defaults, persists to storage, updates UI, closes modal, shows info toast.
  - Close button (`✕`): closes modal safely without modifying unsaved state.

### 2.2 Mathematical Scoring Computation Engine
Implemented `calculateCognitiveProfileFromAnswers(answers)` in `index.html` strictly matching `src/adhd_scoring/scoring_service.py`:
- **Raw Subscales**:
  - $S_{EF} = q_1 + q_2 + q_3 \in [0, 9]$
  - $S_{AS} = q_4 + q_5 + q_6 \in [0, 9]$
  - $S_{RSD} = q_7 + q_8 + q_9 \in [0, 9]$
  - $S_{total} = S_{EF} + S_{AS} + S_{RSD} \in [0, 27]$
- **Normalized Deficit Indices**:
  - $I_{EF} = S_{EF} / 9.0 \in [0.0, 1.0]$
  - $I_{AS} = S_{AS} / 9.0 \in [0.0, 1.0]$
  - $I_{RSD} = S_{RSD} / 9.0 \in [0.0, 1.0]$
  - $CDI = 0.40 \times I_{EF} + 0.35 \times I_{AS} + 0.25 \times I_{RSD} \in [0.0, 1.0]$
- **Cognitive Profile Vectors**:
  - `attention_span_minutes`: $\text{clamp}(5, 25, \text{round}(25.0 - (S_{AS} / 9.0) \times 20.0))$
  - `recommended_micro_task_duration_sec`: $\text{clamp}(60, 300, \text{round}((300.0 - (S_{AS} / 9.0) \times 210.0) / 30.0) \times 30)$
  - `working_memory_capacity`: $\text{clamp}(1, 5, \text{round}(5.0 - (S_{EF} / 9.0) \times 4.0))$
  - `rsd_sensitivity_level`: $S_{RSD} \le 2 \to \text{LOW}$, $\le 4 \to \text{MEDIUM}$, $\le 7 \to \text{HIGH}$, $\le 9 \to \text{SEVERE}$
  - `scaffolding_level`: $CDI < 0.35 \to \text{MINIMAL}$, $< 0.70 \to \text{MODERATE}$, $\ge 0.70 \to \text{INTENSIVE}$
  - `max_steps_per_session`: $CDI < 0.35 \to 6$, $< 0.70 \to 4$, $\ge 0.70 \to 3$

### 2.3 State Management & Storage Persistence
- In `appState`:
  ```javascript
  cognitiveProfile: loadStoredCognitiveProfile(),
  surveyAnswers: null,
  ```
- **Fallback Defaults**:
  `{ attention_span_minutes: 12, recommended_micro_task_duration_sec: 120, working_memory_capacity: 3, rsd_sensitivity_level: 'HIGH', scaffolding_level: 'MODERATE', max_steps_per_session: 4 }`
- **LocalStorage Keys**:
  - Primary vector key: `'milo_cognitive_profile'`
  - Answer cache key: `'milo_survey_answers'`
- **Hydration**: Fully rehydrated upon `DOMContentLoaded` with corrupt storage fallback handling.

### 2.4 Parent Dashboard Header Badge & Overview Card
- Added `#parent-cognitive-profile-badge` in the Parent App header directly below the top bar, displaying:
  `🎯 Hồ sơ nhận thức: Chú ý ${profile.attention_span_minutes}p • Vi bước ${profile.recommended_micro_task_duration_sec}s • RSD ${profile.rsd_sensitivity_level}`
- Clicking the badge or the "Khảo sát" chip triggers `openSurveyModal()` anytime.
- Also added an overview card in `parent-screen-home` showing active scaffolding level and working memory capacity.

---

## 3. Verification & Test Results

1. **JavaScript Syntax Verification**:
   - `node -e "... new vm.Script(mainScript) ..."` compiles cleanly with zero syntax errors.
2. **Mathematical Equivalence Fuzzing**:
   - Tested 1,000 subscale score combinations comparing JS implementation against Python `src/adhd_scoring/scoring_service.py`. Result: 0 discrepancies.
3. **Automated Adversarial Node.js Tests**:
   - `test_adhd_ui_ergonomics_adversarial.js`: 19/19 PASSED.
   - `test_challenger_curriculum_ui.js`: 14/14 PASSED.
   - `test_challenger_storage_cheer_stress.js`: 11/11 PASSED.
   - `test_milo_sync_adversarial.js`: 31/31 PASSED.
   - `test_whitebox_sync_simulator_adversarial.js`: 19/19 PASSED.
   - `test_parent_survey_cognitive_profile.js` (NEW): 15 assertions covering 6 sections PASSED.
   - **Total Node.js assertions**: 109 assertions PASSED (0 regressions).
4. **Python Test Suite Verification**:
   - `test_r1_survey.py`: 16/16 tests PASSED.
   - `test_dual_app_e2e.py`: 225/225 tests PASSED.
   - `test_r2_curriculum.py`, `test_r3_schema_prompts.py`, `test_runner.py`, `test_whitebox_backend_adversarial.py`: 44/44 tests PASSED.
   - `test_adversarial_challenge.py`: 38/38 tests PASSED.
   - `test_api_server.py`: 7/7 tests PASSED.
   - **Total Python tests executed**: 330 tests PASSED with exit code 0.
