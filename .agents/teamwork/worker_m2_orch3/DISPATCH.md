## 2026-10-18T16:36:18Z
You are Worker M2 (worker_m2_orch3) for Milestone M2: Parent Diagnostic Survey & Cognitive Profile Integration (Requirement R4).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m2_orch3

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Pay special attention to section ## 2026-10-18T16:12:18Z, Requirement R4.
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\orchestrator_3\PROJECT.md
Inspect `data/surveys/adhd_parent_survey.json` and `src/adhd_scoring/scoring_service.py` to see the exact 9 questions, Likert options, clinical dimension mappings, and scoring mathematical formulas.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK ASSIGNMENT:
Implement the Parent Diagnostic Survey & Cognitive Profile flow in `index.html`:
1. Clinical 9-Question Survey Modal / Flow:
   - Provide a clean, accessible modal/dialog in the Parent App (`index.html`) with the 9 questions from `adhd_parent_survey.json`.
   - 4-point Likert options for each question: 0 ("Không bao giờ"), 1 ("Thỉnh thoảng"), 2 ("Thường xuyên"), 3 ("Rất thường xuyên").
   - Action buttons:
     - "Lưu & Tính Điểm Hồ Sơ" (validates answers, calculates cognitive profile, saves to state & localStorage, closes modal, shows success toast).
     - "Bỏ qua (Dùng Mặc Định)" (sets sensible default profile, closes modal).
     - Close (X) button.
2. Clinical Scoring Computation (match `scoring_service.py` exactly):
   - Calculate raw scores:
     - S_EF = q1 + q2 + q3 (0..9)
     - S_AS = q4 + q5 + q6 (0..9)
     - S_RSD = q7 + q8 + q9 (0..9)
     - S_total = S_EF + S_AS + S_RSD (0..27)
   - Normalized indices:
     - I_EF = S_EF / 9.0
     - I_AS = S_AS / 9.0
     - I_RSD = S_RSD / 9.0
     - CDI = 0.40 * I_EF + 0.35 * I_AS + 0.25 * I_RSD
   - CognitiveProfile Vector:
     - attention_span_minutes = Math.round(25.0 - (S_AS / 9.0) * 20.0)
     - recommended_micro_task_duration_sec = Math.min(300, Math.max(60, Math.round((300.0 - (S_AS / 9.0) * 210.0) / 30.0) * 30))
     - working_memory_capacity = Math.min(5, Math.max(1, Math.round(5.0 - (S_EF / 9.0) * 4.0)))
     - rsd_sensitivity_level = S_RSD <= 2 ? "LOW" : S_RSD <= 4 ? "MEDIUM" : S_RSD <= 7 ? "HIGH" : "SEVERE"
     - scaffolding_level = CDI < 0.35 ? "MINIMAL" : CDI < 0.70 ? "MODERATE" : "INTENSIVE"
     - max_steps_per_session = CDI < 0.35 ? 6 : CDI < 0.70 ? 4 : 3
3. State & Persistence:
   - In `appState`: initialize `cognitiveProfile` from `localStorage` (`milo_cognitive_profile`) or default:
     `{ attention_span_minutes: 12, recommended_micro_task_duration_sec: 120, working_memory_capacity: 3, rsd_sensitivity_level: 'HIGH', scaffolding_level: 'MODERATE', max_steps_per_session: 4 }`.
4. Parent Dashboard Badge:
   - Render an interactive Cognitive Profile Summary Badge in the Parent App header (or prominently in the parent overview):
     e.g., `🎯 Hồ sơ nhận thức: Chú ý ${profile.attention_span_minutes}p • Vi bước ${profile.recommended_micro_task_duration_sec}s • RSD ${profile.rsd_sensitivity_level}`.
   - Clicking this badge re-opens the survey modal anytime.
5. Verification:
   - Test in Node.js (syntax check: `node -c index.html` or similar test script).
   - Execute `python tests/runner.py` to ensure 0 regressions.
   - Run adversarial Node.js tests to confirm all 94 assertions still pass.

OUTPUT REQUIREMENTS:
- Write your detailed work report to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m2_orch3\report.md`.
- Write your 5-component handoff to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m2_orch3\handoff.md`.
- When finished, use `send_message` to report back to orchestrator_3 (Recipient: 82075e96-ee88-4405-8b7e-45a7eaed25fe).
