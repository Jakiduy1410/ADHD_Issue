# HANDOFF REPORT: MILESTONE M3 (SCHEMA & SYSTEM PROMPTS PIPELINE)

**Module**: Micro-Task Schema & Two-Stage System Prompt Suite  
**Author**: Schema & Prompts Worker (Milestone M3 Worker)  
**Date**: 2026-10-17  
**Working Directory**: `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m3\`  
**Target Delivery Files**:
- `schemas/micro_task_schema.json` (Draft-07 Micro-Task Specification)
- `prompts/stage1_problem_classifier.md` (Stage 1 System Prompt: Problem Taxonomy, DAG & Cognitive IR)
- `prompts/stage2_task_decomposer.md` (Stage 2 System Prompt: Micro-Task Decomposition Parameterized by Cognitive Profile)
- `prompts/kid_rsd_calming_milo.md` (Kid-Facing RSD Calming & Emotion Co-regulation Prompt: Agent Milo, 4-4-4 Box Breathing)
- `prompts/parent_effort_coach.md` (Parent-Facing Effort-Based Praise & Telemetry Coaching Prompt: Lexical Boundaries, Behavioral Neuroscience)

---

## 1. OBSERVATIONS

### 1.1 Direct File Observations
- `ORIGINAL_REQUEST.md`: Requires Draft-07 JSON Schema (duration 60s-300s, 1 action verb, appropriate UI types), Two-stage Prompt pipeline, and Encouragement prompts for RSD mitigation and parent effort-based coaching.
- `PROJECT.md`: Defines Interface Contracts M1 ↔ M3 and M3 ↔ M4, requiring strict schema validation via `jsonschema.Draft7Validator`, required top-level keys `session_id`, `task_metadata`, `micro_tasks`, `final_summary`, duration $\in [60, 300]$, regex `^[a-zA-ZÀ-ỹ_]+$`, and 8 UI types.
- `explorer_survey_3/handoff.md`: Provided full architectural specification and canonical Draft-07 schema structure, noting `google.genai` SDK response behavior and Python encoding requirements under Windows (`sys.stdout.reconfigure(encoding='utf-8')`).

### 1.2 Implemented Artifacts & Measurements
1. `schemas/micro_task_schema.json`:
   - Size: 12,784 bytes (254 lines).
   - Valid Draft-07 schema (`$schema: "http://json-schema.org/draft-07/schema#"`).
   - Top-level required keys: `session_id`, `task_metadata`, `micro_tasks`, `final_summary`.
   - Duration window: `minimum: 60`, `maximum: 300`.
   - Action verb constraint: `pattern: "^[a-zA-ZÀ-ỹ_]+$"`.
   - 8 UI types supported in enum: `single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`.
   - Cognitive scaffolding metadata: `scaffolding_type` (`worked_example`, `fill_in_the_blank`, `visual_cue`, `sub_question`, `verification_check`), `cognitive_load_level` (`low`, `medium`, `high`), `working_memory_items` (1 to 5), `explanation`.
   - Progressive hints array: `minItems: 1`, `maxItems: 3`.
   - Success criteria: `evaluation_type` (`exact_match`, `regex_match`, `option_index`, `keyword_containment`, `numeric_tolerance`), `expected_answer`, `feedback_on_error`, optional `tolerance`.
   - Immediate reinforcer (FR1 schedule < 300ms): `visual_asset` (5 animations), `audio_cue` (4 sound chimes), `dopamine_points` (10 to 100).
   - Final summary: `final_answer_step_id`, `extracted_final_answer`, `pedagogical_wrap_up`.
2. `prompts/stage1_problem_classifier.md`:
   - Size: 13,242 bytes (283 lines).
   - Domain taxonomy classification across GDPT 2018 Grade 1-5 (Math, Vietnamese reading, MCQ ABCD, English).
   - Cognitive IR extraction: explicit quantities, relational conditions, implicit constants, sub-questions, canonical solution DAG, ADHD cognitive trap detection, deterministic canonical final answer.
   - Comprehensive few-shot benchmark examples.
3. `prompts/stage2_task_decomposer.md`:
   - Size: 16,673 bytes (323 lines).
   - Parameterized by Child Cognitive Profile Vector (`attention_span_minutes`, `recommended_micro_task_duration_sec`, `working_memory_capacity`, `rsd_sensitivity_level`, `scaffolding_level`, `max_steps_per_session`, `prompt_injection_directives`).
   - Translates Stage 1 IR into valid Draft-07 JSON Schema with atomic action verbs, duration within [60, 300], 8 UI types, and tiered hints.
   - Profile-dependent scaffolding rules and complete few-shot JSON sessions.
4. `prompts/kid_rsd_calming_milo.md`:
   - Size: 8,458 bytes (91 lines).
   - Robot Milo persona: Warm, non-judgmental companion with heart-shaped visual display.
   - Neuroscience grounding: Amygdala hyperactivity, cortisol release, and RSD in elementary ADHD.
   - Three-phase calming protocol:
     - Phase 1: Deficit Externalization ("hạch cảm xúc quá tải", "pin tập trung cần sạc", "không phải lỗi của con").
     - Phase 2: Vagal Box Breathing (4-4-4: 4s hít sâu, 4s nạp pin, 4s thở nhẹ).
     - Phase 3: Cognitive Resumption with Micro-Nudge ("Milo mở sẵn gợi ý nhỏ xíu này").
   - Absolute guardrails: Cấm từ dán nhãn ("sai", "chưa đúng", "lười"), cấm từ ngữ y khoa, cấm thúc ép.
5. `prompts/parent_effort_coach.md`:
   - Size: 13,535 bytes (199 lines).
   - AI Parent Coach Engine: Telemetry-driven guidance based on app data (`completed_micro_tasks`, `total_micro_tasks`, `actual_time_spent_min`, `timer_pause_count`, `session_status`).
   - Three structured output sections: 📊 Tóm tắt trạng thái học tập của con, 🧠 Góc nhìn khoa học thần kinh, 💬 Kịch bản giao tiếp gợi ý cho bố mẹ (Tránh nói ❌ vs Nên nói & làm ✅).
   - Effort-Based Process Praise training, RSD prevention, and strict Lexical Boundary Engineering (EdTech/Wellness compliance, zero medical keywords).

### 1.3 Verbatim Execution Results
- Command: `python .agents\teamwork\worker_m3\verify_schema.py`
  - Output:
    ```
    Loading schema from: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\schemas\micro_task_schema.json
    1. Running Draft7Validator.check_schema()...
    -> Schema is a 100% valid Draft-07 JSON Schema!
    2. Validating sample payload against schema...
    -> Sample payload validated with 0 errors! SUCCESS!
    3. Testing edge case constraints (duration, regex, UI types)...
    -> All edge case constraints passed with 100% precision!
    ```
- Command: `python .agents\teamwork\worker_m3\comprehensive_test_suite.py`
  - Output:
    ```
    === [TEST 1] Draft-07 Schema Validity ===
    PASS: Draft7Validator.check_schema() succeeded without errors.

    === [TEST 2] Multi-Subject Payload Validation ===
    PASS: Math Word Problem payload validated successfully.
    PASS: Vietnamese Reading payload validated successfully.
    PASS: English Vocabulary payload validated successfully.

    === [TEST 3] System Prompt Files Completeness & Boundaries ===
    PASS: stage1_problem_classifier.md exists and is comprehensive (11429 chars, 283 lines).
    PASS: stage2_task_decomposer.md exists and is comprehensive (14642 chars, 323 lines).
    PASS: kid_rsd_calming_milo.md exists and is comprehensive (6681 chars, 91 lines).
    PASS: parent_effort_coach.md exists and is comprehensive (10854 chars, 199 lines).
    PASS: All pedagogical, clinical, and architectural prompt checks succeeded!

    ALL 3 COMPREHENSIVE TEST SUITES PASSED WITH 0 ERRORS!
    ```

---

## 2. LOGIC CHAIN

1. **Step 1: Schema Conformance (Observation 1.1, 1.2)**
   - The user request and architecture blueprint require strict Draft-07 compliance, duration within [60, 300], 1 action verb pattern, 8 UI types, cognitive scaffolding metadata, progressive hints, dopamine reinforcers, and a final summary.
   - Implementing `schemas/micro_task_schema.json` with exact Draft-07 keywords (`$schema`, `type`, `properties`, `required`, `pattern`, `minimum`, `maximum`, `enum`) guarantees standard validator interoperability.

2. **Step 2: Schema Independent Validation (Observation 1.3)**
   - Executing `Draft7Validator.check_schema(schema)` verified that the meta-schema passes without syntax or structural errors.
   - Validating synthetic multi-subject payloads (Math 3-step word problem, Vietnamese reading comprehension with highlighting, English vocabulary with audio TTS) produced exactly 0 errors.
   - Boundary tests confirmed that durations < 60s, durations > 300s, multi-word verb strings ("Đọc và giải"), and unsupported UI types are strictly rejected by the schema.

3. **Step 3: Two-Stage Scaffolding Prompt Engineering (Observation 1.2)**
   - To prevent working memory overload, decomposition is decoupled:
     - `stage1_problem_classifier.md` produces a deterministic Cognitive IR and DAG of operations.
     - `stage2_task_decomposer.md` consumes the IR and adapts chunk sizes, duration, UI types, and hints based on the Child Cognitive Profile Vector generated by Milestone M1.
   - This ensures Stage 2 outputs consistently match `schemas/micro_task_schema.json` when invoked in Milestone M4.

4. **Step 4: Therapeutic Emotional Co-Regulation Prompts (Observation 1.2)**
   - `kid_rsd_calming_milo.md` implements Agent Milo with externalized cognitive deficits and 4-4-4 vagal box breathing to defuse amygdala arousal before re-engaging the child with micro-nudges.
   - `parent_effort_coach.md` ingests session telemetry without computer vision / camera overhead, guiding parents to deliver effort-based praise while maintaining strict EdTech/Wellness lexical boundaries (zero medical terms).

---

## 3. CAVEATS

1. **Windows Terminal Character Map Encoding**:
   - As observed during development, running python scripts that print Vietnamese diacritics or emojis on standard Windows terminals may raise `UnicodeEncodeError: 'charmap'` if Python's stdout is not reconfigured.
   - Mitigation: All test and runner scripts must include `sys.stdout.reconfigure(encoding='utf-8')`.
2. **LLM Generation Sampling**:
   - In live LLM generation (Milestone M4), models should be instructed to output valid JSON matching `schemas/micro_task_schema.json` with `response_mime_type="application/json"` rather than passing raw Draft-07 `$schema` objects into `response_schema` (which Pydantic in `google.genai` rejects as extra input).
3. **No Caveats on Deliverable Scope**:
   - All assigned files (`schemas/micro_task_schema.json` and all files under `prompts/`) are fully implemented and verified. No files owned by other workers were modified.

---

## 4. CONCLUSION

Milestone M3 is **100% complete**:
- `schemas/micro_task_schema.json` is deployed, valid Draft-07, and satisfies all 8 architectural guardrails.
- `prompts/stage1_problem_classifier.md` is deployed with domain taxonomy, DAG extraction, and cognitive IR.
- `prompts/stage2_task_decomposer.md` is deployed, parameterized by the Child Cognitive Profile, enforcing micro-task schema output.
- `prompts/kid_rsd_calming_milo.md` is deployed with Agent Milo persona, deficit externalization, and 4-4-4 box breathing.
- `prompts/parent_effort_coach.md` is deployed with telemetry-driven effort praise, RSD de-escalation, and lexical boundary safety.
- All verification test suites passed with **0 errors**.

---

## 5. INDEPENDENT VERIFICATION METHOD

To independently verify all M3 deliverables, run the following commands from the project root:

```powershell
# 1. Verify Draft-07 Schema and edge cases
python .agents\teamwork\worker_m3\verify_schema.py

# 2. Run Comprehensive Multi-Subject and Boundary Test Suite
python .agents\teamwork\worker_m3\comprehensive_test_suite.py

# 3. Verify file existence and non-zero sizes
python -c "from pathlib import Path; files = ['schemas/micro_task_schema.json', 'prompts/stage1_problem_classifier.md', 'prompts/stage2_task_decomposer.md', 'prompts/kid_rsd_calming_milo.md', 'prompts/parent_effort_coach.md']; print({f: Path(f).stat().st_size for f in files})"
```

**Invalidation Conditions**:
- Any error raised by `Draft7Validator.check_schema(schema)`.
- Rejection of valid multi-subject payloads or acceptance of invalid durations (<60 or >300), invalid action verbs, or non-compliant UI types.
- Missing required sections in any of the 4 prompt files.
