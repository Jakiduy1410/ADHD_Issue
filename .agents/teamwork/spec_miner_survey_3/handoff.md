# HANDOFF REPORT: CURRICULUM, COGNITIVE SURVEY & PROMPT SPECIFICATION
**Agent:** `spec_miner_survey_3` (Curriculum & Prompt Spec Miner)  
**Parent:** `f373a3a8-9bab-4128-a177-2c52ad25b640`  
**Working Directory:** `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3`  
**Timestamp:** 2026-10-18T05:48:00Z  
**Handoff Type:** Hard (Task complete)  

---

## 1. Observation

1. **Curriculum Dataset & Schema (`data/curriculum/grade_1_to_5_benchmark.json` & `schemas/grade_1_to_5_benchmark_schema.json`)**:
   - File `data/curriculum/grade_1_to_5_benchmark.json` contains exactly 25 exercises (`total_exercises: 25`, lines 6-10 in schema, lines 1-10 in data).
   - Validated against `schemas/grade_1_to_5_benchmark_schema.json` with zero errors using `jsonschema.validate()` (exit code 0).
   - Grade distribution is strictly uniform: exactly 5 exercises per grade for Grades 1, 2, 3, 4, 5.
   - Subject distribution: 10 Math word problems (`Toán lời văn`), 5 Vietnamese reading comprehension (`Tiếng Việt / Đọc hiểu`), 5 Multiple-Choice Questions (`Trắc nghiệm ABCD`), and 5 Primary English exercises (`Tiếng Anh tiểu học`).
   - 100% of the 25 exercises include structured `ground_truth_steps` (range 3 to 4 steps) and normalized `final_answer` (with `value`, `unit`, `normalized_display`, and `acceptable_variants`).
   - 100% include `adhd_scaffolding_notes` with `working_memory_pitfall`, `executive_function_scaffolding`, and `visual_or_concrete_aid`.

2. **Parent Clinical Survey & Algorithm (`data/surveys/adhd_parent_survey.json` & `src/adhd_scoring/scoring_service.py`)**:
   - `data/surveys/adhd_parent_survey.json` defines a 9-item survey on Likert scale 0–3, derived from Vanderbilt VADPRS, SNAP-IV, and Barkley Emotional Dysregulation frameworks.
   - Dimension breakdown: `executive_function` (q1–q3), `attention_span` (q4–q6), and `rsd_sensitivity` (q7–q9).
   - `src/adhd_scoring/scoring_service.py` implements mathematical mapping:
     - $S_{EF} = q1 + q2 + q3$, $S_{AS} = q4 + q5 + q6$, $S_{RSD} = q7 + q8 + q9$.
     - $CDI = 0.40 \times I_{EF} + 0.35 \times I_{AS} + 0.25 \times I_{RSD}$.
     - `attention_span_minutes = clamp(5, 25, round(25.0 - (S_AS / 9.0) * 20.0))`.
     - `recommended_micro_task_duration_sec = clamp(60, 300, round((300.0 - (S_AS / 9.0) * 210.0) / 30.0) * 30)`.
     - `working_memory_capacity = clamp(1, 5, round(5.0 - (S_EF / 9.0) * 4.0))`.
     - `rsd_sensitivity_level` thresholded into `LOW, MEDIUM, HIGH, SEVERE`.
     - `scaffolding_level` thresholded into `MINIMAL, MODERATE, INTENSIVE` (max steps 6, 4, 3 respectively).
   - Executed `python -m unittest discover -s src/adhd_scoring -p "test_*.py"`: Ran 22 tests in 0.003s — **OK (22/22 passed)**.

3. **Micro-Task Schema (`schemas/micro_task_schema.json`)**:
   - Draft-07 compliant schema.
   - Core constraints:
     - `duration_sec`: integer `[60, 300]` (1 to 5 minutes).
     - `action_verb`: regex `^[a-zA-ZÀ-ỹ_]+$` (single action verb token).
     - `atomic_instruction`: max length 160 characters, with $< 15$ words constraint required by pedagogical prompt guidelines.
     - `ui_type`: enum of 8 interactive types (`single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`).
     - `immediate_reinforcer`: visual assets, audio cues, points in `[10, 100]` for $< 300$ms FR1 dopamine schedule.

4. **Prompt Guardrail & Production Integrity Check**:
   - Production prompts in `prompts/` inspected:
     - `prompts/stage1_problem_classifier.md` (13,242 bytes)
     - `prompts/stage2_task_decomposer.md` (16,673 bytes)
     - `prompts/kid_rsd_calming_milo.md` (8,458 bytes)
     - `prompts/parent_effort_coach.md` (13,535 bytes)
   - Git status confirms all files in `prompts/` are **100% intact and unedited**.
   - Scratch testing directory inspected: `scratch/run_prompt_experiment.py`, `scratch/experiment_results.json`, and `scratch/prompt_experiment_report.md`.
   - Prompt guardrail strictly respected: experiments were conducted in `scratch/` and generated rationale diff proposals for future approval:
     1. Strict $< 15$ words constraint in `stage2_task_decomposer.md` (lines 31–35) to prevent working memory overflow.
     2. Inclusion of `hoat_dong_trai_nghiem` in `subject` enum across schemas and prompts.

5. **Parent Hub & Child App UI/UX Integration (`index.html`, `generate_app.py`, `src/api/server.py`)**:
   - Parent Hub provides 2 modes: "Kho Đề Xuất (Băm Sẵn)" (with batch checkboxes and one-click dispatch button) and "Tự Giao" (AI decomposition & manual builder).
   - Clicking "GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!" populates `appState.childRoadmap` and triggers `renderChildIslandRoadmap()`, immediately rendering the assigned exercises as sequential islands on the child's adventure map.
   - Child App provides single-focus cards, circular visual countdown timer, tactile inputs, instant dopamine star rewards ($< 300$ms), and on-demand / error-triggered Milo 4-4-4 vagal box breathing.

---

## 2. Logic Chain

1. *Premise*: The system requires a high-fidelity benchmark dataset that is both mathematically sound and pedagogically scaffolded for elementary ADHD students under GDPT 2018.
2. *Observation*: `data/curriculum/grade_1_to_5_benchmark.json` contains 25 items across Grades 1–5, 100% of which pass schema validation, provide explicit mathematical steps, final answers, and ADHD working memory pitfall notes.
3. *Inference*: The curriculum inventory is complete, robust, and immediately usable for benchmark evaluations and Parent Hub catalog rendering.
4. *Premise*: ADHD cognitive profiling must be objective, non-stigmatizing, and capable of dynamically parameterizing AI decomposition.
5. *Observation*: The 9-question survey avoids diagnostic labels, adheres to clinical scales (VADPRS/SNAP-IV), and is algorithmically converted via `scoring_service.py` into quantitative vectors and prompt injection payloads.
6. *Inference*: Downstream prompt engines receive mathematically bounded parameters (e.g., maximum steps, duration ceiling, verb constraints) tailored to each child's cognitive profile.
7. *Premise*: Overwriting production prompts during experimentation risks pipeline regressions.
8. *Observation*: The prompt experiment was executed strictly in `scratch/`, leaving `prompts/` pristine while generating git diffs and neuroscientific rationales.
9. *Inference*: The prompt guardrail is effective and ready to be maintained as an enduring project standard.

---

## 3. Caveats

1. **Instruction Word Count vs Schema Constraint**: `schemas/micro_task_schema.json` currently enforces `maxLength: 160` characters rather than a token/word count regex for `atomic_instruction`. The $< 15$ words constraint is enforced via prompt instruction and post-processing in `server.py`.
2. **Subject Enum Scope**: The current schema enum for `subject` in `schemas/micro_task_schema.json` is `["toan", "tieng_viet", "tieng_anh", "khoa_hoc_tu_nhien"]`. Daily life routine chores are mapped to `khoa_hoc_tu_nhien` until the proposed diff to add `hoat_dong_trai_nghiem` is formally merged.
3. **LLM API Fallback**: When Gemini API is unavailable or keys are unconfigured, `src/api/server.py` relies on `_construct_fallback_decomposition()`, which produces deterministic rule-based micro-tasks conforming to the schema.

---

## 4. Conclusion

The curriculum data, clinical survey, micro-task schema, and prompt infrastructure are fully verified, robust, and strictly documented:
- All 25 benchmark exercises are inventoried with full pedagogical and answer metadata.
- Survey scoring and cognitive profile mapping are verified with 22/22 unit tests passing.
- Micro-task schema Draft-07 constraints are clearly articulated.
- Prompt integrity is verified (100% intact), and the scratch diff protocol is validated.
- The UI/UX mapping between Parent Hub batch selection and Child App Island Quests is documented in detail.
- Full specification report written to `spec_report.md`.

---

## 5. Verification Method

To independently verify these findings, run the following commands from the repository root (`c:\Users\ADMIN\Documents\antigravity\calm-bardeen`):

1. **Verify Benchmark Schema Adherence (Zero Errors)**:
   ```bash
   python -c "import json, jsonschema; schema = json.load(open('schemas/grade_1_to_5_benchmark_schema.json', encoding='utf-8')); data = json.load(open('data/curriculum/grade_1_to_5_benchmark.json', encoding='utf-8')); jsonschema.validate(instance=data, schema=schema); print('PASS: Benchmark schema validation')"
   ```

2. **Verify 22 Scoring Service Unit Tests**:
   ```bash
   python -m unittest discover -s src/adhd_scoring -p "test_*.py"
   ```

3. **Verify Integrity of Original Prompts**:
   ```bash
   git status -- prompts/
   ```

4. **Verify Prompt Experiment Results in `scratch/`**:
   ```bash
   python -c "import json; res = json.load(open('scratch/experiment_results.json', encoding='utf-8')); print(f'PASS: {len(res)} experiment test cases recorded')"
   ```
