# Handoff Report: Milestone M2 — Parent Diagnostic Survey & Cognitive Profile Integration (Requirement R4)

## 1. Observation
- `data/surveys/adhd_parent_survey.json` defines exactly 9 clinical questions (q1–q3 for Executive Function, q4–q6 for Attention Span, q7–q9 for RSD Sensitivity) and 4-point Likert scoring scale (0="Không bao giờ", 1="Thỉnh thoảng", 2="Thường xuyên", 3="Rất thường xuyên").
- `src/adhd_scoring/scoring_service.py` lines 102–176 specify the production mathematical algorithms:
  - $S_{EF} = q_1 + q_2 + q_3$
  - $S_{AS} = q_4 + q_5 + q_6$
  - $S_{RSD} = q_7 + q_8 + q_9$
  - $I_{EF} = S_{EF}/9.0$, $I_{AS} = S_{AS}/9.0$, $I_{RSD} = S_{RSD}/9.0$
  - $CDI = 0.40 \times I_{EF} + 0.35 \times I_{AS} + 0.25 \times I_{RSD}$
  - `attention_span_minutes = clamp(5, 25, round(25.0 - (S_AS / 9.0) * 20.0))`
  - `recommended_micro_task_duration_sec = clamp(60, 300, round((300.0 - (S_AS / 9.0) * 210.0) / 30.0) * 30)`
  - `working_memory_capacity = clamp(1, 5, round(5.0 - (S_EF / 9.0) * 4.0))`
  - `rsd_sensitivity_level`: LOW ($\le 2$), MEDIUM ($\le 4$), HIGH ($\le 7$), SEVERE ($\ge 8$)
  - `scaffolding_level`: MINIMAL ($CDI < 0.35$), MODERATE ($0.35 \le CDI < 0.70$), INTENSIVE ($CDI \ge 0.70$)
  - `max_steps_per_session`: 6 (MINIMAL), 4 (MODERATE), 3 (INTENSIVE)
- In `index.html`:
  - Added `#parent-cognitive-profile-badge` and `#parent-cognitive-badge` in the Parent App header right below the top bar with `onclick="openSurveyModal()"`.
  - Added `#parent-survey-modal` inside `#parent-screen-container` with 9 questions, Likert options, and action buttons (`btn-save-survey` and `btn-skip-survey`).
  - Added `DEFAULT_COGNITIVE_PROFILE`, `loadStoredCognitiveProfile()`, `calculateCognitiveProfileFromAnswers()`, `updateCognitiveProfileUI()`, `openSurveyModal()`, `closeSurveyModal()`, `saveSurveyAndCalculateProfile()`, and `skipSurveyWithDefaults()`.
  - Hydrated `appState.cognitiveProfile` in `appState` initialization and on `DOMContentLoaded`.
- Automated test runs:
  - `node tests/adversarial/test_parent_survey_cognitive_profile.js`: "ALL PARENT DIAGNOSTIC SURVEY & COGNITIVE PROFILE TESTS PASSED CLEANLY!" (15 assertions checked across 6 sections).
  - All 5 existing adversarial test suites: 94 assertions passed cleanly (0 failed).
  - `python tests/runner.py` / combined python suites: 330 tests executed with 0 failures and 0 errors.

## 2. Logic Chain
1. By reading `data/surveys/adhd_parent_survey.json` and `src/adhd_scoring/scoring_service.py` (Observation 1 & 2), the clinical question hierarchy, Likert scale mapping, and exact mathematical conversion formulas to CognitiveProfile vectors were established.
2. In `index.html` (Observation 3), integrating the 9-question modal, scoring function, state persistence (`milo_cognitive_profile`), and header badge enables parents to diagnose attention parameters and see active settings at a glance, fulfilling Requirement R4.
3. Comparative fuzz testing of all 1,000 subscale score combinations against the Python engine yielded 0 discrepancies, verifying exact mathematical parity between frontend and backend.
4. Executing all 6 Node.js adversarial test files and 330 Python tests (Observation 4) confirms that the implementation introduces zero regressions to existing dual-app synchronization, timers, audio, or curriculum dispatch.

## 3. Caveats
- The survey modal is housed directly inside the parent phone mockup (`#parent-screen-container`) to mirror the authentic mobile app experience. If opened when the parent screen is active or in dual mode, it is immediately accessible.
- Future milestone M3 will directly inject `appState.cognitiveProfile` into the task decomposition API payload (`/api/tasks/decompose`). The state vector structure matches `schemas/micro_task_schema.json` and `scoring_service.py` interfaces for seamless M3 consumption.

## 4. Conclusion
Milestone M2 (Requirement R4) is complete and fully verified. `index.html` now includes a complete clinical 9-question survey modal, rigorous mathematical scoring computation, robust localStorage persistence, state synchronization, and an interactive header Cognitive Profile Summary Badge. All automated tests pass with 100% green status.

## 5. Verification Method
To independently verify:
```bash
# 1. Run the new M2 parent diagnostic survey regression test
node tests/adversarial/test_parent_survey_cognitive_profile.js

# 2. Run all existing adversarial Node.js test suites
node tests/adversarial/test_adhd_ui_ergonomics_adversarial.js
node tests/adversarial/test_challenger_curriculum_ui.js
node tests/adversarial/test_challenger_storage_cheer_stress.js
node tests/adversarial/test_milo_sync_adversarial.js
node tests/adversarial/test_whitebox_sync_simulator_adversarial.js

# 3. Run Python unit, e2e, and adversarial test suites
python -m unittest tests/e2e/test_r1_survey.py tests/e2e/test_r2_curriculum.py tests/e2e/test_dual_app_e2e.py tests/adversarial/test_adversarial_challenge.py
```
Invalidation conditions:
- Any discrepancy between JS `calculateCognitiveProfileFromAnswers()` output and Python `calculate_cognitive_profile()`.
- Failure to persist or restore `appState.cognitiveProfile` under key `milo_cognitive_profile`.
- Missing `#parent-survey-modal` or broken click handler on `#parent-cognitive-profile-badge`.
- Any non-zero exit code or uncaught exception across test suites.
