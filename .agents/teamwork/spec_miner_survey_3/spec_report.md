# SPECIFICATION REPORT: CURRICULUM, COGNITIVE SURVEY & PROMPT ARCHITECTURE
**Document ID:** SPEC-SURVEY-3-20261018  
**Author:** spec_miner_survey_3 (Curriculum & Prompt Spec Miner)  
**Target Architecture:** Dual-Device ADHD Elementary Intervention System (GDPT 2018)  
**Working Repository:** `c:\Users\ADMIN\Documents\antigravity\calm-bardeen`  
**Date:** 2026-10-18  

---

## 1. Executive Summary & Objective

This specification report establishes the authoritative baseline for the dual-device ADHD elementary educational ecosystem (Parent Hub "Trạm Thấu Hiểu" × Child App "Milo Quest") complying with Vietnam's **Chương trình Giáo dục Phổ thông 2018 (GDPT 2018 - Thông tư 32/2018/TT-BGDĐT)** and clinical neurocognitive frameworks (**Vanderbilt VADPRS, SNAP-IV, Barkley Emotional Dysregulation, Dodson RSD**).

This investigation verified:
1. **Curriculum Dataset (`data/curriculum/grade_1_to_5_benchmark.json`)**: Exactly 25 benchmark exercises across Grades 1–5, 100% compliant with Draft-07 schema (`schemas/grade_1_to_5_benchmark_schema.json`), containing canonical `ground_truth_steps`, `final_answer`, and ADHD neurocognitive scaffolding notes.
2. **Clinical Parent Survey (`data/surveys/adhd_parent_survey.json`)**: 9-item Likert (0–3) questionnaire mapped to 3 clinical dimensions and transformed into continuous and categorical Cognitive Profile vectors via `src/adhd_scoring/scoring_service.py` (22/22 unit tests passing).
3. **Micro-Task Schema (`schemas/micro_task_schema.json`)**: Strict Draft-07 JSON Schema enforcing 60s–300s durations, single action verbs (`^[a-zA-ZÀ-ỹ_]+$`), instruction word limits (< 15 words), 8 UI types, and FR1 dopamine reinforcers (< 300ms).
4. **Prompt System & Strict Guardrail (`prompts/` & `scratch/`)**: Verified that all 4 production prompts in `prompts/` are **100% intact**. Confirmed that experimental AI testing strictly operates in `scratch/`, outputting scientific rationale diff reports without modifying production prompt files.
5. **Dual-App UI/UX Flow**: Complete mapping of the Parent Hub batch assignment mechanism (Hướng 1: Kho Đề Xuất vs Hướng 2: Tự Giao) and the Child App Island Quest adventure roadmap with Single-Focus Card cockpit and Milo 4-4-4 vagal breathing.

---

## 2. GDPT 2018 25 Benchmark Exercises Inventory

### 2.1. Structural Schema Contract (`schemas/grade_1_to_5_benchmark_schema.json`)
The curriculum file `data/curriculum/grade_1_to_5_benchmark.json` complies strictly with Draft-07 JSON Schema:
- **Root Fields**: `version` ("1.0.0"), `framework` ("Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT)"), `total_exercises` (25), and `exercises` (array of exactly 25 objects).
- **Exercise Required Fields**:
  - `id`: Pattern `^G[1-5]_(MATH|VIET|MCQ|ENG)_[0-9]{2}$`.
  - `grade`: Integer `[1, 5]`.
  - `subject`: Enum `["Toán", "Tiếng Việt", "Khoa học & Tự nhiên xã hội", "Tiếng Anh"]`.
  - `category`: Enum `["Toán lời văn", "Tiếng Việt / Đọc hiểu", "Trắc nghiệm nhiều câu ABCD", "Tiếng Anh tiểu học"]`.
  - `topic`: String describing curriculum topic.
  - `difficulty`: Enum `["Cơ bản (Nhận biết/Thông hiểu)", "Vận dụng", "Vận dụng cao"]`.
  - `estimated_duration_min`: Integer `[3, 20]`.
  - `original_text`: Full Vietnamese problem statement.
  - `options` & `distractor_analysis`: Object with keys `A, B, C, D` for MCQ/English, or `null` for word/reading problems.
  - `ground_truth_steps`: Array of $\ge 2$ structured steps (`step_number`, `instruction`, `mathematical_or_logical_goal`, `intermediate_output`).
  - `final_answer`: Object with `value`, `unit`, `normalized_display`, and `acceptable_variants`.
  - `adhd_scaffolding_notes`: Object with `working_memory_pitfall`, `executive_function_scaffolding`, and `visual_or_concrete_aid`.

### 2.2. Distribution Matrix Across Grades and Subjects
Each grade contains exactly 5 standardized exercises:
- **Math Word Problems (Toán lời văn)**: 10 exercises (G1: 2, G2: 2, G3: 2, G4: 2, G5: 2).
- **Vietnamese Reading Comprehension (Tiếng Việt / Đọc hiểu)**: 5 exercises (1 per grade).
- **Multiple-Choice Questions (Trắc nghiệm ABCD)**: 5 exercises (G1 TNXH: 1, G2-G5 Math MCQ: 4).
- **Primary English (Tiếng Anh tiểu học)**: 5 exercises (1 per grade).

### 2.3. Comprehensive Inventory Table of 25 Benchmark Exercises

| # | ID | Khối Lớp | Môn Học | Dạng Bài | Chủ Đề / Topic | Độ Khó | Số Bước GT | Đáp Số Chuẩn (`normalized_display`) | Điểm Nghẽn Trí Nhớ Tạm (ADHD Pitfall) |
|---|---|:---:|---|---|---|---|:---:|---|---|
| 1 | `G1_MATH_01` | 1 | Toán | Toán lời văn | Phép cộng trong phạm vi 10 (Dạng toán thêm vào) | Cơ bản | 3 | `8 con chim` | Xao nhãng bởi từ ngữ miêu tả 'cành cây', 'bay đến', quên số lượng ban đầu |
| 2 | `G1_MATH_02` | 1 | Toán | Toán lời văn | Phép trừ trong phạm vi 20 không nhớ (Dạng toán bớt đi) | Cơ bản | 3 | `12 quả cam` | Nhầm giữa cộng và trừ khi đọc lướt từ khóa 'ăn bớt' |
| 3 | `G1_VIET_03` | 1 | Tiếng Việt | Tiếng Việt / Đọc hiểu | Đọc hiểu văn bản ngắn & Nhận diện nhân vật và hành động | Cơ bản | 3 | `chú gà trống` | Bị thu hút bởi tên nhân vật người 'Bé Mai' ở câu cuối thay vì gà trống |
| 4 | `G1_MCQ_04` | 1 | Khoa học & TNXH | Trắc nghiệm ABCD | Nhận biết hình học phẳng và số lượng trong mô hình | Cơ bản | 3 | `B. 2 hình tròn` | Hấp tấp chọn 1 vì thấy chữ 'một chiếc ô tô', đếm sót bánh xe |
| 5 | `G1_ENG_05` | 1 | Tiếng Anh | Tiếng Anh tiểu học | Vocabulary: Colors & Everyday Objects | Cơ bản | 3 | `C. red` | Nhầm giữa các từ màu sắc bắt đầu bằng phụ âm tương tự (red vs yellow) |
| 6 | `G2_MATH_06` | 2 | Toán | Toán lời văn | Bài toán 'Nhiều hơn một số đơn vị' (Cộng có nhớ phạm vi 100) | Vận dụng | 4 | `53 cây xanh` | Quên phần 'nhớ 1' sang hàng chục, tính nhầm $38 + 15 = 43$ |
| 7 | `G2_MATH_07` | 2 | Toán | Toán lời văn | Bảng nhân 5 & Đơn vị đo dung tích (Lít) — 2 bước tính | Vận dụng | 3 | `13 lít dầu` | Dừng lại ngay sau bước 1 ($4 \times 5 = 20$) do thỏa mãn dopamine sớm |
| 8 | `G2_VIET_08` | 2 | Tiếng Việt | Tiếng Việt / Đọc hiểu | Đọc hiểu văn bản & Nhận diện mẫu câu 'Ai làm gì?' | Cơ bản | 3 | `tưới những luống rau sau vườn` | Phân tâm bởi câu thứ hai tả 'chú cún Mực lon ton', bỏ sót việc Nam giúp bà |
| 9 | `G2_MCQ_09` | 2 | Toán | Trắc nghiệm ABCD | Đổi đơn vị đo độ dài (m sang dm) và phép tính trừ | Vận dụng | 3 | `B. 6 dm` | Bỏ qua bước đổi đơn vị, cố tính $1 - 4$ hoặc $1 + 4$ gây ức chế nhận thức |
| 10 | `G2_ENG_10` | 2 | Tiếng Anh | Tiếng Anh tiểu học | Grammar: There is / There are with Plural Nouns | Cơ bản | 3 | `B. are` | Phản xạ điền 'is' theo thói quen cửa miệng do chưa phân biệt danh từ số nhiều |
| 11 | `G3_MATH_11` | 3 | Toán | Toán lời văn | Bài toán giải bằng hai bước tính (Gấp một số lên nhiều lần & Tổng) | Vận dụng | 3 | `96 kg gạo` | Tưởng tìm ra 72 kg buổi chiều là xong bài và dừng lại (Premature Closure) |
| 12 | `G3_MATH_12` | 3 | Toán | Toán lời văn | Bài toán liên quan đến rút về đơn vị | Vận dụng | 3 | `25 quyển vở` | Bối rối trước hai số 5 (5 quyển và 5 bạn), nhầm phép chia rút về đơn vị |
| 13 | `G3_VIET_13` | 3 | Tiếng Việt | Tiếng Việt / Đọc hiểu | Đọc hiểu văn bản & Nhận diện biện pháp tu từ so sánh | Cơ bản | 3 | `một tấm gương khổng lồ` | Xao nhãng vào vị ngữ phía sau 'soi bóng núi rừng', chép thừa chi tiết |
| 14 | `G3_MCQ_14` | 3 | Toán | Trắc nghiệm ABCD | Chu vi hình chữ nhật & Bẫy nhầm lẫn công thức diện tích/nửa chu vi | Vận dụng | 3 | `B. 46 m` | Thấy số 46 vội vàng chọn đáp án D (46 mét vuông) do không kiểm tra đơn vị |
| 15 | `G3_ENG_15` | 3 | Tiếng Anh | Tiếng Anh tiểu học | Sentence building & Modal verbs (Ability: can / can't) | Vận dụng | 3 | `A. A duck can swim but can't fly.` | Quá tải khi sắp xếp 6 mảnh từ xáo trộn trong đầu cùng một lúc |
| 16 | `G4_MATH_16` | 4 | Toán | Toán lời văn | Dạng toán điển hình: Tìm hai số khi biết Tổng và Hiệu | Vận dụng cao | 4 | `Lớp 4A: 160 quyển, Lớp 4B: 120 quyển` | Nhớ lộn công thức Tổng - Hiệu quên chia 2, hoặc tính nhầm số bé/số lớn |
| 17 | `G4_MATH_17` | 4 | Toán | Toán lời văn | Phân số & Tìm phân số của một số | Vận dụng | 3 | `480 con vịt` | Tính xong 720 con gà thì ngỡ đã xong bài và điền 720 làm đáp án |
| 18 | `G4_VIET_18` | 4 | Tiếng Việt | Tiếng Việt / Đọc hiểu | Đọc hiểu văn bản & Phân tích biện pháp tu từ nhân hóa | Cơ bản | 3 | `thì thầm (hoặc khẽ thì thầm)` | Nhầm lẫn hành động của chị Gió với hành động của bông lúa ('uốn câu') |
| 19 | `G4_MCQ_19` | 4 | Toán | Trắc nghiệm ABCD | Diện tích hình bình hành & Bẫy nhầm giữa cạnh bên và chiều cao | Vận dụng | 4 | `A. 360 m2` | Bị kích thích bởi số 18 xuất hiện ở cạnh bên và nhân nhầm $24 \times 18 = 432$ |
| 20 | `G4_ENG_20` | 4 | Tiếng Anh | Tiếng Anh tiểu học | Reading comprehension & Present Continuous Tense | Cơ bản | 3 | `B. In the kitchen, making pancakes.` | Quá tải khi đọc 3 nhân vật khác nhau trong đoạn văn, nhầm giữa Ben và mẹ |
| 21 | `G5_MATH_21` | 5 | Toán | Toán lời văn | Toán chuyển động đều: Hai chuyển động ngược chiều gặp nhau | Vận dụng cao | 4 | `a) 2 giờ; b) 9 giờ sáng` | Nhầm giữa khoảng thời gian đi (2 giờ) và thời điểm gặp nhau (9 giờ) |
| 22 | `G5_MATH_22` | 5 | Toán | Toán lời văn | Thể tích hình hộp chữ nhật & Đổi đơn vị Lít & Tỉ số phần trăm | Vận dụng cao | 4 | `2160 lít` | Quên đổi từ $m^3$ sang $dm^3$ hoặc nhân nhầm phần trăm với số đo chưa đổi |
| 23 | `G5_VIET_23` | 5 | Tiếng Việt | Tiếng Việt / Đọc hiểu | Quan hệ nguyên nhân - kết quả & Rút ra bài học cuộc sống | Vận dụng cao | 3 | `Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công` | Chỉ trả lời được 1 vế (nguyên nhân hoặc bài học), bỏ sót vế thứ hai |
| 24 | `G5_MCQ_24` | 5 | Toán | Trắc nghiệm ABCD | Tỉ số phần trăm nhiều lần & Bẫy cộng gộp tỉ lệ liên tiếp | Vận dụng cao | 3 | `B. 153 000 đồng` | Bị cám dỗ bởi phép tính nhẩm $15 + 10 = 25\%$ dẫn thẳng vào bẫy 150.000đ |
| 25 | `G5_ENG_25` | 5 | Tiếng Anh | Tiếng Anh tiểu học | Reading Comprehension & Past Simple Tense (Holiday Travel) | Cơ bản | 3 | `C. By plane` | Đọc lướt thấy từ 'cable car' ở câu 2 và suy đoán vội vã thay vì đọc kỹ 'flew' |

---

## 3. ADHD Parent Clinical Survey & Cognitive Profile Mapping

### 3.1. Clinical Foundations & Lexical Boundary Protection
The survey file `data/surveys/adhd_parent_survey.json` extracts 9 standardized items from:
- **Vanderbilt ADHD Diagnostic Parent Rating Scale (VADPRS)**: Items 2, 3, 4, 5, 8, 11/16, Impairment.
- **Swanson, Nolan, and Pelham Rating Scale (SNAP-IV)**: Items 2, 4, 7, 8, 12, 19, 21.
- **Barkley Emotional Dysregulation Framework & Dodson Rejection Sensitive Dysphoria (RSD)** criteria.

**Strict Lexical Boundary Guarantee:**
To maintain strict compliance with EdTech and Cognitive Wellness boundaries, the survey explicitly forbids medical/diagnostic terminology (e.g., "bệnh nhân", "chẩn đoán bệnh", "thuốc", "điều trị ADHD"). It frames all traits around focus habits, working memory capacity, sensory filters, and emotional self-regulation.

### 3.2. Likert Scoring Scale & Dimensions
Each question is answered on a 4-point Likert scale:
- `0`: "Không bao giờ" (Hầu như không bao giờ hoặc $< 1$ lần/tháng).
- `1`: "Thỉnh thoảng" (Xuất hiện nhưng không ảnh hưởng lớn, 1–2 lần/tuần).
- `2`: "Thường xuyên" (Xuất hiện trong hầu hết các buổi học, 3–4 lần/tuần).
- `3`: "Rất thường xuyên" (Gần như ngày nào cũng xảy ra, gây trở ngại nghiêm trọng).

The 9 questions map to 3 orthogonal dimensions (max raw score 9 each, composite weight defined):
1. **Executive Function ($S_{EF}$, Weight 40%)**:
   - `q1` (Working Memory): Quá tải khi tiếp nhận $2-3$ chỉ dẫn liên tiếp.
   - `q2` (Task Initiation): Loay hoay, đóng băng hành vi khi bắt đầu bài học (Task Paralysis).
   - `q3` (Inhibition & Planning): Hấp tấp ghi đáp án chưa đọc hết câu, bỏ qua bước nháp.
2. **Attention Span & Distractibility ($S_{AS}$, Weight 35%)**:
   - `q4` (Sustained Attention): Thời gian tập trung liên tục dưới 5–10 phút đã bồn chồn.
   - `q5` (Distractibility): Tiếng động nhỏ hoặc đồ vật chuyển động làm đứt gãy luồng suy nghĩ.
   - `q6` (Completion Persistence): Bỏ dở bài tập giữa chừng do chiết khấu trì hoãn (Delay Discounting).
3. **Rejection Sensitive Dysphoria & Emotion Regulation ($S_{RSD}$, Weight 25%)**:
   - `q7` (Fear of Failure): Quá lo lắng bị sai, tẩy xóa rách vở, ngập ngừng không dám làm.
   - `q8` (Feedback Reactivity): Bộc phát cảm xúc tiêu cực, khóc hoặc cáu kỉnh khi bị sửa bài.
   - `q9` (Frustration Avoidance): Mau nản lòng, buông xuôi ngay khi gặp câu hỏi chưa hiểu.

### 3.3. Mathematical Scoring & Vector Mapping Algorithm
Implemented and tested in `src/adhd_scoring/scoring_service.py`:

```
1. Raw Subscale Scores:
   S_EF  = q1 + q2 + q3  ∈ [0, 9]
   S_AS  = q4 + q5 + q6  ∈ [0, 9]
   S_RSD = q7 + q8 + q9  ∈ [0, 9]
   S_total = S_EF + S_AS + S_RSD ∈ [0, 27]

2. Normalized Indices:
   I_EF  = round(S_EF / 9.0, 4)   ∈ [0.0, 1.0]
   I_AS  = round(S_AS / 9.0, 4)   ∈ [0.0, 1.0]
   I_RSD = round(S_RSD / 9.0, 4)  ∈ [0.0, 1.0]
   CDI   = round(0.40 * I_EF + 0.35 * I_AS + 0.25 * I_RSD, 4) (Composite Deficit Index)

3. Continuous & Categorical Vector Mapping:
   - attention_span_minutes = clamp(5, 25, round(25.0 - (S_AS / 9.0) * 20.0))
   - recommended_micro_task_duration_sec = clamp(60, 300, round((300.0 - (S_AS / 9.0) * 210.0) / 30.0) * 30)
   - working_memory_capacity = clamp(1, 5, round(5.0 - (S_EF / 9.0) * 4.0))

4. Categorical Thresholds:
   - rsd_sensitivity_level:
       LOW:    0 <= S_RSD <= 2
       MEDIUM: 3 <= S_RSD <= 4
       HIGH:   5 <= S_RSD <= 7
       SEVERE: 8 <= S_RSD <= 9
   - scaffolding_level & max_steps_per_session:
       MINIMAL:   CDI < 0.35      -> max 6 steps
       MODERATE:  0.35 <= CDI < 0.70 -> max 4 steps
       INTENSIVE: CDI >= 0.70     -> max 3 steps
```

### 3.4. Prompt Injection Directives Output
The scoring service produces a normalized dictionary `prompt_injection_directives` directly injected into Stage 2 System Prompts:
- `verb_constraint`: If `working_memory_capacity <= 2`, strictly enforces **EXACTLY 1 single action verb** per step.
- `rsd_tone_guideline`: If `HIGH` or `SEVERE`, activates maximum RSD cooling protocol (no negative words, warm Milo persona, effort recognition).
- `visual_timer_interval_sec`: Equated to `recommended_micro_task_duration_sec`.

---

## 4. Micro-Task Schema Specification (`schemas/micro_task_schema.json`)

### 4.1. Structural Rules (Draft-07 Compliant)
Every session decomposed by AI or crafted manually must validate against `schemas/micro_task_schema.json`.
- **Root Fields**: `session_id`, `task_metadata`, `micro_tasks` (array of 1 to 10 items), and `final_summary`.
- **`task_metadata`**:
  - `benchmark_id`: Identifier (e.g. `G3_MATH_11`, `ROUTINE_01_CLEAN_DESK`).
  - `grade`: Integer 1 to 5.
  - `subject`: Enum `["toan", "tieng_viet", "tieng_anh", "khoa_hoc_tu_nhien"]`.
  - `target_cognitive_profile`: Embedded profile vector.
  - `total_micro_tasks`: Count of steps.
  - `total_estimated_duration_sec`: Sum of step durations (max 1800s / 30 mins).

### 4.2. Atomic Micro-Task Constraints
Each item in `micro_tasks` must fulfill:
1. **Duration Window**: `duration_sec` must be an integer between **60 and 300 seconds** (1 to 5 minutes). Never $<60s$ (too fragmented) and never $>300s$ (causes attention decay).
2. **Atomic Action Verb**: `action_verb` must match regex `^[a-zA-ZÀ-ỹ_]+$`. Exactly 1 action verb token (e.g., `Đọc`, `Gạch_chân`, `Tính`, `Chọn`, `Điền`, `Kéo`, `Sắp_xếp`). No spaces or conjunctions.
3. **Atomic Instruction Length**: Max length 160 chars in schema; strictly constrained to **< 15 words** (ideally 6–12 words) to prevent working memory overload.
4. **Interactive UI Types (8 Supported Enums)**:
   - `single_choice`: Radio list of options.
   - `multiple_choice`: Multi-select checkboxes.
   - `text_input`: Short text/number field.
   - `drag_drop`: Card dragging into target drop zones.
   - `audio_listen`: Text-to-speech audio player.
   - `highlight`: Interactive word/number highlight selector.
   - `checkbox`: Self-verification checkpoint.
   - `order_sequencing`: Step-by-step ordering cards.
5. **Cognitive Scaffolding**:
   - `scaffolding_type`: Enum `["worked_example", "fill_in_the_blank", "visual_cue", "sub_question", "verification_check"]`.
   - `cognitive_load_level`: `"low"`, `"medium"`, `"high"`.
   - `working_memory_items`: Integer `[1, 5]` (must be $\le$ child's `working_memory_capacity`).
6. **Progressive Hints**: Array of 1 to 3 strings:
   - Hint 1: Nudge (gentle orientation).
   - Hint 2: Clue (formula or intermediate hint).
   - Hint 3: Walkthrough (concrete walkthrough).
7. **RSD-Safe Corrective Feedback**:
   - `feedback_on_error`: Under `success_criteria`, forbids negative words ("Sai rồi", "Chưa đúng", "Tại sao không tập trung"). Re-frames errors as normal biological battery depletion using Agent Milo's voice.
8. **FR1 Immediate Reinforcer (< 300ms Delivery)**:
   - `visual_asset`: Enum `["sparkle_star_01", "particle_burst_gold", "milo_thumbs_up", "badge_math_explorer", "confetti_cannon"]`.
   - `audio_cue`: Enum `["positive_bell_c6", "sparkle_ting_short", "harp_glissando_soft", "gentle_pop_success"]`.
   - `dopamine_points`: Integer `[10, 100]`.
9. **Final Summary**:
   - `final_answer_step_id`: Step ID yielding the final canonical result.
   - `extracted_final_answer`: Deterministic normalized string matching benchmark ground truth.
   - `pedagogical_wrap_up`: Milo's congratulatory growth-mindset reflection.

---

## 5. Prompts System Specification & Strict Guardrail Verification

### 5.1. Inventory of Production Prompts in `prompts/`

| Prompt File | Pedagogical Persona / Role | Core Function | Key Behavioral Outputs |
|---|---|---|---|
| `stage1_problem_classifier.md` | **AI Curriculum Cognitive Analyst** (Thùy Trán Nhân Tạo) | Analyzes raw exercise through 5 cognitive lenses: Domain taxonomy, Entity/Quantity extraction, Sub-questions, Solution DAG, and ADHD traps. | Outputs standard JSON `Cognitive IR` with DAG nodes, intermediate variables, and trap warnings. |
| `stage2_task_decomposer.md` | **Pedagogical Micro-Task Decomposer** (Bộ Máy Giàn Giáo Nhận Thức) | Ingests raw exercise, Cognitive IR, and Child Cognitive Profile to generate micro-tasks. | Outputs valid Draft-07 JSON session conforming to `schemas/micro_task_schema.json`. |
| `kid_rsd_calming_milo.md` | **Agent Milo** (Chú Robot Đồng Hành Thần Tiên) | Empathy co-regulation, amygdala cooling, vagal activation. | Executes 3-phase calming protocol: (1) Deficit Externalization, (2) 4-4-4 Vagal Box Breathing, (3) Atomic Resumption. |
| `parent_effort_coach.md` | **AI Parent Coach** (Cố vấn Tâm lý Hành vi & Khoa học Thần kinh) | Transforms raw app telemetry (pauses, time spent, tasks completed) into neurobiological empathy. | Generates 3-part parent report: Telemetry Summary, Neuroscience Perspective, and Communication Scripts (Avoid vs Say). |

### 5.2. Strict Prompt Guardrail Verification
A rigorous integrity check was conducted on the prompt files:
1. **Intactness of Original Prompts**:
   - Git status and file inspection confirm that all 4 files in `prompts/` remain **100% intact and uncorrupted**.
   - No experimental runs or scripts have overwritten the authoritative prompt files.
2. **Experimental Guardrail Workflow**:
   - All AI prompt benchmarking and experiments are strictly restricted to `scratch/` (specifically `scratch/run_prompt_experiment.py`, `scratch/experiment_results.json`, and `scratch/prompt_experiment_report.md`).
   - Any observed edge cases or proposed enhancements are recorded as **Content Diff Proposals** backed by neuroscientific rationale and submitted for review, rather than being applied directly to `prompts/`.

### 5.3. Analysis of Proposed Diffs in `scratch/prompt_experiment_report.md`
The empirical evaluation in `scratch/` identified two critical findings:

1. **Instruction Word Count (< 15 Words Ceiling)**:
   - *Observation*: In test experiments, Step 1 of Math `G3_MATH_11` yielded 16 words, and Step 1 of Vietnamese `G2_VIET_08` yielded 15 words.
   - *Root Cause*: `prompts/stage2_task_decomposer.md` line 32 originally stated `atomic_instruction tối đa 160 ký tự (khoảng 10 - 20 từ)`.
   - *Proposed Diff*: Enforce strict wording: `atomic_instruction BẮT BUỘC NGHIÊM NGẶT DƯỚI 15 TỪ (Tối đa 14 từ, lý tưởng từ 6 đến 12 từ)`.
   - *Neuroscience Rationale*: Children with ADHD experience rapid decay in phonological working memory loops; instructions exceeding 14 words lead to cognitive overload and failure to retain the operational goal.
2. **Subject Enum Expansion for Experiential / Routine Chores**:
   - *Observation*: Daily routine chores (e.g., `ROUTINE_01_CLEAN_DESK`) had to be mapped to `khoa_hoc_tu_nhien` because `schemas/micro_task_schema.json` and Stage 1/2 prompts only recognized `toan, tieng_viet, tieng_anh, khoa_hoc_tu_nhien`.
   - *Proposed Diff*: Expand subject enum in prompts and schema to include `hoat_dong_trai_nghiem` (or `ky_nang_song`), perfectly matching GDPT 2018 mandatory experiential curriculum standards.

---

## 6. UI/UX Mapping: Parent Hub & Child App Island Quests

### 6.1. Parent Hub (Trạm Thấu Hiểu) Batch Selection Flow
In `index.html` and `src/api/server.py`, the Parent Hub supports two complementary assignment modes:

```
[Parent Hub Navigation]
   ├── [Hướng 1: Kho Đề Xuất (Băm Sẵn)]
   │     ├── Filter Pills: Tất cả (12) | Toán (4) | Tiếng Việt (2) | Tiếng Anh (2) | Sinh Hoạt (4)
   │     ├── Batch Header Controls: "Chọn tất cả" | "Bỏ chọn"
   │     ├── Exercise Card Item:
   │     │     ├── Subject icon, Category tag, Title
   │     │     ├── Step count, Dopamine star reward
   │     │     ├── "Xem bước →" (Triggers Parent Task Modal to review micro-steps)
   │     │     └── Selection Checkbox
   │     └── Sticky Batch Action Bar:
   │           ├── Summary: "[N] bài tập • [M] bước • ~[T] phút • +[S] ⭐"
   │           └── One-click Action Button: "🚀 GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!"
   │
   └── [Hướng 2: Tự Giao Bài Mới]
         ├── Subtab 1: ✨ AI Tự Băm (Gemini API 2-Stage Pipeline with instant preview & fine-tuning)
         └── Subtab 2: ✍️ Soạn Bằng Tay Động (Add/remove custom steps, select UI type, set timer)
```

**Dispatch Logic:**
When the parent clicks "🚀 GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!", `dispatchSelectedCatalogTasks()` executes:
1. Collects all checked task objects from `taskDatabase` (or via `/api/tasks/dispatch`).
2. Populates `appState.childRoadmap = selectedTasks` and resets `appState.currentRoadmapIndex = 0`.
3. Calls `renderChildIslandRoadmap()` and switches the child screen to `home`.
4. Dispatches real-time WebSocket sync event `NEW_DISPATCH_ROUTE` across devices.

### 6.2. Child App (Milo Quest) Island Quests & Cockpit Flow
The Child App transforms the dispatched batch into an interactive adventure:

```
[Child App: Milo Quest]
   │
   ├── [Lộ Trình Đảo Bài Tập (Island Quest Roadmap)]
   │     ├── Island Counter: "Đảo [X] / [Total]: Đang Chinh Phục"
   │     ├── Active Island Node: Current task icon, title, steps count, reward stars
   │     ├── Locked Next Island Node: Preview of subsequent station (unlocked upon completion)
   │     ├── Companion Milo: Speech bubble with personalized encouragement
   │     └── Treasure Chest (Rương Báu Hoàng Kim): Locked until all islands in the roadmap are conquered
   │
   ├── [Buồng Lái Tập Trung (Focus Cockpit / Single-Focus Card)]
   │     ├── Island Header: Island name & step indicator (e.g. "Bước 1/3")
   │     ├── Visual Timer Disk:
   │     │     ├── Smooth circular countdown disk (60s–300s)
   │     │     └── "Tạm Dừng Mềm" (Soft Pause) button to halt timer without penalty
   │     ├── Atomic Instruction Card: Single action verb + instruction (< 15 words)
   │     ├── Tactile Interaction Area:
   │     │     ├── Math Numpad / Clue selection / Highlighting / Drag-Drop
   │     │     └── Web Audio API clicks with immediate tactile feedback
   │     ├── Robot Milo Assistant:
   │     │     ├── Stays silent during active work (zero distraction)
   │     │     └── Emerges on "Cứu Trợ" or 2 consecutive errors -> 4-4-4 Vagal Box Breathing
   │     └── Instant Dopamine Star Burst:
   │           └── < 300ms FR1 reward animation (confetti, audio chime, +stars counter update)
   │
   └── [Đổi Vé Vàng (Golden Ticket Redemption)]
         ├── Finishing all islands unlocks the Golden Treasure Chest
         └── Child requests real-world reward (e.g., 30 mins Lego time) -> sends approval request to Parent
```

---

## 7. Features Discovered & Edge Cases

### 7.1. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Curriculum | 25 GDPT 2018 Benchmark Inventory | Standardized elementary benchmark repository across 5 grades and 4 subject categories | Grade (1–5), Subject, Category | JSON benchmark record with steps and final answer | Fails schema if items $\ne 25$ or steps $< 2$ | `grade_1_to_5_benchmark.json` |
| 2 | Curriculum | ADHD Scaffolding Metadata | Explicit cognitive failure trap notes and visual aid cues for every benchmark item | Exercise ID | `working_memory_pitfall`, `executive_function_scaffolding`, `visual_or_concrete_aid` | N/A (Required fields) | `grade_1_to_5_benchmark.json` |
| 3 | Survey | 9-Question ADHD Parent Survey | Clinically grounded focus & executive function survey for primary school parents | 9 Likert responses (0–3) | Survey metadata, dimension classifications | Validates integer in `[0, 3]` | `adhd_parent_survey.json` |
| 4 | Cognitive Profile | Continuous & Categorical Vector Mapping | Transforms 9 survey scores into personalized cognitive profile vector | Answers array `[q1..q9]` | Attention span (min), micro-task duration (sec), working memory chunks (1–5), RSD level, Scaffolding level | Throws ValueError if length $\ne 9$ or value invalid | `scoring_service.py` |
| 5 | Cognitive Profile | Prompt Directives Generator | Generates natural language system context and algorithmic constraints for LLM prompts | Cognitive profile vector | Formatted system instruction string and constraint dict | Falls back to moderate defaults | `scoring_service.py` |
| 6 | Schema | Micro-Task Draft-07 Schema | Standard JSON schema for elementary micro-task sessions | Decomposed session JSON | Validation boolean / error list | Rejects steps $< 60s$ or $> 300s$, invalid verbs, invalid UI types | `micro_task_schema.json` |
| 7 | Schema | 8 Interactive UI Types | Standardized interactive components for child focus cockpit | `ui_type` enum | UI payload configuration | Schema error if unlisted UI type supplied | `micro_task_schema.json` |
| 8 | Schema | FR1 Dopamine Immediate Reinforcer | Instant reward dispatch spec (< 300ms) with visual and audio cues | Micro-task step completion | Visual asset enum, audio cue enum, points (10–100) | Validated against enum | `micro_task_schema.json` |
| 9 | Prompts | Stage 1 Cognitive IR Extractor | AI Curriculum Cognitive Analyst extracting canonical DAG and ADHD trap warnings | Raw exercise text / ID | Cognitive IR JSON | Schema validator fallback | `stage1_problem_classifier.md` |
| 10 | Prompts | Stage 2 Micro-Task Decomposer | Task Scaffolding Engine generating atomic micro-tasks tailored to cognitive profile | Raw exercise, Cognitive IR, Profile | Decomposed session JSON | Fallback rule-based decomposer if API fails | `stage2_task_decomposer.md` |
| 11 | Prompts | Agent Milo 3-Phase RSD Calming | Empathetic companion calming protocol with 4-4-4 vagal box breathing | Emotional trigger / Soft pause | 3-phase dialogue and breathing prompts | Enforces strict ban on negative/medical terms | `kid_rsd_calming_milo.md` |
| 12 | Prompts | AI Parent Effort Coach | Telemetry-driven coaching engine teaching parents process-based praise | Session telemetry JSON | 3-part parent briefing report | Replaces blame with neurobiological explanation | `parent_effort_coach.md` |
| 13 | Parent Hub | Batch Selection & One-Click Dispatch | Checkbox selection of multiple benchmark tasks dispatched as a cohesive island route | Selected catalog task IDs | `appState.childRoadmap`, WebSocket event | Alerts user if 0 tasks selected | `index.html`, `server.py` |
| 14 | Child App | Island Quest Adventure Roadmap | Dynamic progression map representing assigned tasks as islands with lock/unlock states | Road map tasks array | Interactive SVG island nodes | Blocks click on locked islands | `index.html` |
| 15 | Child App | Single-Focus Card Workspace | Focused 1-task-at-a-time cockpit with visual timer and zero cognitive clutter | Active micro-step | Visual timer, instruction card, tactile inputs | Auto-pauses on Milo assist | `index.html` |

### 7.2. Edge Cases Observed & Addressed

| # | Feature | Input / Trigger | Observed Behavior | Handling / Resolution |
|---|---|---|---|---|
| 1 | Benchmark Schema | Exercise with missing `working_memory_pitfall` | Schema validation fails with `ValidationError` | Enforced in `grade_1_to_5_benchmark_schema.json`; 100% of 25 exercises include full scaffolding notes |
| 2 | Benchmark Distractors | Non-MCQ items (Math word problems, Vietnamese reading) | `options: null`, `distractor_analysis: null` | Schema explicitly accepts `["object", "null"]` for these fields |
| 3 | Survey Validation | Boolean passed instead of integer (e.g. `q1: True`) | Python treats `bool` as `int`, which could skew score to 1 | `scoring_service.py` explicitly rejects `isinstance(v, bool)` with ValueError |
| 4 | Survey Extreme | All scores 0 (No deficit) | Raw scores = 0, CDI = 0.0, Attention span = 25m, Duration = 300s, WM = 5 chunks | Categorized as `LOW` RSD, `MINIMAL` scaffolding (max 6 steps) |
| 5 | Survey Extreme | All scores 3 (Severe deficit) | Raw scores = 27, CDI = 1.0, Attention span = 5m, Duration = 90s, WM = 1 chunk | Categorized as `SEVERE` RSD, `INTENSIVE` scaffolding (max 3 steps) |
| 6 | Micro-Task Action Verb | Compound verb with space (e.g. `"Đọc và tính"`) | Fails regex pattern `^[a-zA-ZÀ-ỹ_]+$` | Strictly enforces atomic verbs; underscores required for standard compounds (e.g. `"Gạch_chân"`) |
| 7 | Micro-Task Duration | Duration set to 45s or 360s | Fails schema validation (min 60s, max 300s) | Clamped strictly to $[60, 300]$ range in scoring service and decomposer |
| 8 | Instruction Word Count | Instruction exceeding 15 words (e.g., 16 words in `G3_MATH_11` test) | Passes schema (schema limits char length to 160), but breaches pedagogical guardrail | Documented in `scratch/prompt_experiment_report.md` with git diff proposal to constrain prompt ceiling to $<15$ words |
| 9 | Routine Chores Enum | Daily chores (`ROUTINE_01_CLEAN_DESK`) passed to Stage 2 | Fails schema enum `toan, tieng_viet, tieng_anh, khoa_hoc_tu_nhien` unless mapped to `khoa_hoc_tu_nhien` | Mapped to `khoa_hoc_tu_nhien` temporarily; diff proposal prepared in `scratch/` to add `hoat_dong_trai_nghiem` |
| 10 | Gemini API Failure / Rate Limit | Network timeout, 429 quota exhaustion, or invalid API key | System falls back gracefully to `_construct_fallback_decomposition()` in `server.py` | Child and parent experience zero service interruption; valid Draft-07 tasks always delivered |

---

## 8. Conclusion

All 25 GDPT 2018 benchmark exercises, the 9-question parent survey, the Draft-07 micro-task schema, and the 4 core system prompts have been thoroughly audited, verified, and mapped to the dual-app application architecture. Original prompts in `prompts/` are fully preserved, with experimental findings properly segregated in `scratch/`. The system specification is ready for production and downstream implementation.
