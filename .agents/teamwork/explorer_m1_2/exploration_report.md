# BÁO CÁO NGHIÊN CỨU & THIẾT KẾ TÍCH HỢP KHO 25 BÀI TẬP GDPT 2018 VÀO TASKDATABASE
**Mã tài liệu:** EXPLORATION-M1-2-CURRICULUM-BANK  
**Explorer:** `explorer_m1_2` (Curriculum Bank Integration Explorer)  
**Milestone:** Milestone 1 (Sync Bus & Curriculum Bank)  
**Mục tiêu:** Thiết kế phương án tiếp nhận và tích hợp toàn bộ 25 bài tập đối chuẩn GDPT 2018 (`data/curriculum/grade_1_to_5_benchmark.json`) cùng 4 bài tập kỹ năng sinh hoạt thực tế vào `taskDatabase` trong `generate_app.py`.  
**Ngày thực hiện:** 2026-10-18  

---

## 1. TỔNG QUAN KHẢO SÁT HIỆN TRẠNG

### 1.1. Hiện trạng `taskDatabase` trong `generate_app.py`
Qua khảo sát tại dòng 1527–1762 của `generate_app.py`:
- `taskDatabase` hiện tại là một JavaScript Object literal chứa 12 bài tập mẫu:
  - 4 bài Toán: `math_garden` (Diện tích HCN), `math_market` (Mua cam & táo), `math_remainder` (Phép chia có dư), `math_geometry` (Đếm góc vuông).
  - 2 bài Tiếng Việt: `viet_luom` (Bài thơ Lượm), `viet_family` (Vốn từ Gia đình).
  - 2 bài Tiếng Anh: `eng_pet` (My Cute Pet), `eng_fruit` (At the Fruit Shop).
  - 4 bài Kỹ năng sinh hoạt: `chore_desk` (Dọn bàn học 5 phút), `chore_teeth` (Đánh răng 2 phút), `chore_backpack` (Chuẩn bị balo), `chore_bed` (Gấp chăn gối).
- **Điểm hạn chế của kho hiện tại:**
  - Chưa kết nối với 25 bài tập đối chuẩn GDPT 2018 tại `data/curriculum/grade_1_to_5_benchmark.json`.
  - Thiếu metadata sư phạm chuẩn: `ground_truth_steps`, `final_answer` (chưa có trường so khớp chuẩn), `adhd_scaffolding_notes` (thiếu bẫy trí nhớ tạm thời và chỉ dẫn điều hành).
  - Các bước (`steps`) chưa tuân thủ Draft-07 Micro-Task Schema: thiếu `action_verb` đơn nhất (regex `^[a-zA-ZÀ-ỹ_]+$`), chưa ép trần độ dài câu lệnh dưới 15 từ, thiếu chuẩn `ui_type` (8 loại) và thông số `immediate_reinforcer` (FR1 < 300ms).
- **Các điểm tham chiếu quan trọng trong frontend (`generate_app.py`):**
  - Dòng 1030–1034: Các nút lọc danh mục HTML (`p-cat-all`, `p-cat-math`, `p-cat-viet`, `p-cat-eng`, `p-cat-chore`) đang ghi số lượng tĩnh: `Tất cả (12)`, `Toán (4)`, `Tiếng Việt (2)`, `Tiếng Anh (2)`, `Sinh Hoạt (4)`.
  - Dòng 1774–1777: Khởi tạo lộ trình mặc định `childRoadmap: [taskDatabase['chore_desk'], taskDatabase['math_garden']]`.
  - Dòng 1781: `activeTask: taskDatabase['chore_desk']`.
  - Dòng 1794–1796: `selectedCatalogIds: new Set(['chore_desk', 'math_garden'])`, `modalTaskKey: 'math_garden'`.
  - Dòng 2688–2717: `renderParentCatalogList()` lặp qua `Object.values(taskDatabase)`.
  - Dòng 2132–2288: `renderChildWorkspaceStep()` xử lý các loại giao diện tương tác đặc thù (`chore_pens`, `chore_trash`, `chore_books`, `chore_wipe`, `math_clues`, `math_formula`, `math_numpad`) và fallback về Generic Micro-Task Stage cho các bài tập chuẩn.

---

### 1.2. Hiện trạng Kho 25 Bài Tập Đối Chuẩn GDPT 2018 (`data/curriculum/grade_1_to_5_benchmark.json`)
Kho chuẩn gồm đúng 25 bài tập phân bổ đều từ Lớp 1 đến Lớp 5, 100% tuân thủ `schemas/grade_1_to_5_benchmark_schema.json`:
- **Phân bổ theo môn và khối lớp:**
  - Lớp 1 (5 bài): `G1_MATH_01`, `G1_MATH_02`, `G1_VIET_03`, `G1_MCQ_04` (TNXH Hình học), `G1_ENG_05`.
  - Lớp 2 (5 bài): `G2_MATH_06`, `G2_MATH_07`, `G2_VIET_08`, `G2_MCQ_09`, `G2_ENG_10`.
  - Lớp 3 (5 bài): `G3_MATH_11`, `G3_MATH_12`, `G3_VIET_13`, `G3_MCQ_14`, `G3_ENG_15`.
  - Lớp 4 (5 bài): `G4_MATH_16`, `G4_MATH_17`, `G4_VIET_18`, `G4_MCQ_19`, `G4_ENG_20`.
  - Lớp 5 (5 bài): `G5_MATH_21`, `G5_MATH_22`, `G5_VIET_23`, `G5_MCQ_24`, `G5_ENG_25`.
- **Cơ cấu dữ liệu mỗi bài tập:**
  - `id`: Mã bài chuẩn (ví dụ `G3_MATH_11`).
  - `grade`: Khối lớp (1 đến 5).
  - `subject`: Enum `["Toán", "Tiếng Việt", "Khoa học & Tự nhiên xã hội", "Tiếng Anh"]`.
  - `category`: Dạng bài (Toán lời văn, Tiếng Việt/Đọc hiểu, Trắc nghiệm ABCD, Tiếng Anh).
  - `topic`: Chủ đề bài học bám sát GDPT 2018.
  - `difficulty`: Mức độ nhận thức (Cơ bản, Vận dụng, Vận dụng cao).
  - `estimated_duration_min`: Thời gian dự tính (5–12 phút).
  - `original_text`: Đề bài gốc bằng Tiếng Việt / Tiếng Anh.
  - `options` & `distractor_analysis`: Dành cho bài MCQ / Tiếng Anh (hoặc `null` với Toán lời văn & Tiếng Việt).
  - `ground_truth_steps`: Mảng 3–4 bước sư phạm (`step_number`, `instruction`, `mathematical_or_logical_goal`, `intermediate_output`).
  - `final_answer`: Đáp án chuẩn (`value`, `unit`, `normalized_display`, `acceptable_variants`).
  - `adhd_scaffolding_notes`: Chỉ dẫn thần kinh nhận thức (`working_memory_pitfall`, `executive_function_scaffolding`, `visual_or_concrete_aid`).

---

## 2. MA TRẬN ÁNH XẠ SCHEMA: BENCHMARK → FRONTEND & DRAFT-07 MICRO-TASK

Để tích hợp trơn tru vào frontend mà không làm hỏng logic giao diện hiện hành, cấu trúc mỗi Task Object được thiết kế dung hòa tối ưu 3 lớp:
1. **Lớp Frontend Task Item (tương thích 100% `generate_app.py`):**
   - Giữ nguyên các trường: `id`, `cat`, `catName`, `icon`, `title`, `island`, `reward`, `stepSeconds`, `steps`.
   - Mỗi bước trong `steps` giữ nguyên: `badge`, `text` (để hiển thị modal phụ huynh và cockpit học sinh), `type` (để kích hoạt tương tác đặc thù).
2. **Lớp Tiêu chuẩn Sư phạm GDPT 2018:**
   - Bổ sung: `grade`, `subject`, `original_text`, `final_answer`, `adhd_scaffolding_notes`.
   - Trong từng bước: `mathematical_or_logical_goal`, `intermediate_output`, `hints` (1–3 cấp), `success_criteria`.
3. **Lớp Quy chuẩn Draft-07 Micro-Task (`schemas/micro_task_schema.json`):**
   - `action_verb`: Đúng 1 động từ hành động duy nhất, khớp regex `^[a-zA-ZÀ-ỹ_]+$`, không chứa khoảng trắng.
   - `atomic_instruction`: Câu lệnh vi mô đơn nhất, **bắt buộc nghiêm ngặt < 15 từ** (lý tưởng 6–11 từ) để giải tỏa bộ nhớ làm việc (Phonological Loop).
   - `duration_sec`: Giới hạn từ 60s đến 300s.
   - `ui_type`: Một trong 8 loại enum chuẩn (`single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`).
   - `ui_data`: Cấu hình tương tác (options, placeholder, prompt_text, items_to_drag, highlight_target_segments).
   - `immediate_reinforcer`: Cơ chế kích hoạt dopamine FR1 tức thì (< 300ms) với `visual_asset`, `audio_cue`, `dopamine_points`.

### 2.1. Bảng Đối Chiếu Trường Dữ Liệu (Field Mapping Specification)

| Trường Trong Benchmark JSON | Trường Frontend Trong `taskDatabase` | Quy Cách Chuẩn Hóa & Ý Nghĩa Sư Phạm |
|---|---|---|
| `id` | `id` | Giữ nguyên mã bài (ví dụ `G1_MATH_01` .. `G5_ENG_25`), sinh hoạt dùng `chore_desk`, `chore_teeth`, `chore_backpack`, `chore_bed`. |
| `grade` | `grade` | Số nguyên 1–5 (Bài sinh hoạt gán Grade 1). |
| `subject` | `subject` & `cat` | Ánh xạ: Toán → `cat: 'math'`, Tiếng Việt → `cat: 'viet'`, Tiếng Anh → `cat: 'eng'`, Khoa học TNXH → `cat: 'math'`, Hoạt động trải nghiệm → `cat: 'chore'`. |
| `topic` + `category` | `title` | Rút gọn thành tiêu đề thân thiện với trẻ em (dưới 45 ký tự) kèm icon emoji. |
| `estimated_duration_min` | `stepSeconds` | Tính thời gian mỗi bước = `clamp(60, 100, round((estimated_duration_min * 60) / steps.length))`. |
| N/A | `reward` | Điểm sao Dopamine thưởng khi hoàn thành hòn đảo: 100–160 ⭐ tùy độ khó. |
| N/A | `island` | `'study'` cho bài văn hóa, `'routine'` cho bài sinh hoạt. |
| `original_text` | `original_text` | Toàn văn đề bài gốc để phụ huynh xem và AI tái sử dụng. |
| `final_answer` | `final_answer` | Đối tượng đáp số chuẩn làm căn cứ so khớp tự động khi con hoàn thành. |
| `adhd_scaffolding_notes` | `adhd_scaffolding_notes` | Giữ nguyên 3 trường: `working_memory_pitfall`, `executive_function_scaffolding`, `visual_or_concrete_aid`. |
| `ground_truth_steps[i]` | `steps[i]` | Phân rã thành Micro-Task chuẩn đáp ứng Draft-07 (xem mục 2.2). |

### 2.2. Chi Tiết Ánh Xạ Từng Bước (`steps[i]`)

| Trường Trong `steps[i]` | Kiểu Dữ Liệu | Ràng Buộc Kỹ Thuật & Thần Kinh Học |
|---|---|---|
| `step_id` | `integer` | Chỉ số bước bắt đầu từ 1. |
| `badge` | `string` | Nhãn bước ngắn gọn hiển thị trên thẻ (ví dụ `"Tìm Dữ Kiện"`, `"Chọn Phép Tính"`). |
| `action_verb` | `string` | Đúng 1 động từ hành động đơn nhất, regex `^[a-zA-ZÀ-ỹ_]+$` (ví dụ `Gạch_chân`, `Tính`, `Chọn`, `Đổi`, `Nhân`, `Chia`, `Tách`). |
| `atomic_instruction` | `string` | Chỉ dẫn hành động duy nhất, **< 15 từ** (thực tế 6–11 từ). |
| `text` | `string` | Tương thích ngược frontend: gán bằng `atomic_instruction` (hoặc kèm định dạng HTML trợ thị giác). |
| `type` | `string` | Định tuyến giao diện: nếu là bài sinh hoạt hoặc toán có widget đặc thù (`chore_pens`, `math_clues`...) thì giữ nguyên; các bài khác gán bằng `ui_type` hoặc `'generic'`. |
| `ui_type` | `string` | 8 enum Draft-07: `single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`. |
| `ui_data` | `object` | Cấu hình tham số cho UI (`prompt_text`, `options`, `placeholder`, `highlight_target_segments`...). |
| `duration_sec` | `integer` | 60 đến 120 giây (khớp cửa sổ chú ý ADHD GDPT 2018). |
| `immediate_reinforcer` | `object` | `{ visual_asset, audio_cue, dopamine_points }` (FR1 < 300ms). |
| `hints` | `array[string]` | 1–3 gợi ý phân tầng (Gợi ý 1: Nudge, Gợi ý 2: Clue, Gợi ý 3: Walkthrough). |
| `success_criteria` | `object` | `{ evaluation_type, expected_answer, feedback_on_error }` (không dùng từ phủ định). |
| `mathematical_or_logical_goal` | `string` | Mục tiêu sư phạm trích từ `ground_truth_steps`. |
| `intermediate_output` | `string` | Sản phẩm trung gian trích từ `ground_truth_steps`. |
| `is_final_step` | `boolean` | `true` nếu là bước cuối cùng của bài tập. |

---

## 3. DANH MỤC 29 NHIỆM VỤ ĐÃ ĐƯỢC CHUẨN HÓA TOÀN DIỆN

Hệ thống đã chuẩn hóa thành công 29 nhiệm vụ (25 bài GDPT 2018 + 4 bài sinh hoạt thực tế). Dưới đây là bảng tổng hợp chi tiết:

| # | ID | Khối Lớp | Môn Học | Phân Loại (`cat`) | Tên Nhiệm Vụ | Icon | Số Bước | Thời Gian Bước | Thưởng ⭐ | Động Từ Hành Động Chính | Đáp Số Chuẩn |
|---|---|:---:|---|:---:|---|:---:|:---:|:---:|:---:|---|---|
| 1 | `G1_MATH_01` | 1 | Toán | `math` | Cộng số chim trên cành (Phép cộng phạm vi 10) | 🐦 | 3 | 60s | +120 | `Gạch_chân`, `Chọn`, `Tính` | 8 con chim |
| 2 | `G1_MATH_02` | 1 | Toán | `math` | Tính số cam còn lại của mẹ (Phép trừ phạm vi 20) | 🍊 | 3 | 60s | +120 | `Đọc`, `Chọn`, `Tính` | 12 quả cam |
| 3 | `G1_VIET_03` | 1 | Tiếng Việt | `viet` | Đọc hiểu: Ai cất tiếng gáy vang buổi sáng? | 🐓 | 3 | 70s | +120 | `Gạch_chân`, `Dò`, `Chọn` | chú gà trống |
| 4 | `G1_MCQ_04` | 1 | Khoa học & TNXH | `math` | Đếm số hình tròn trên mô hình ngôi nhà | 🏠 | 3 | 60s | +110 | `Xác_định`, `Đếm`, `Chọn` | B. 2 hình tròn |
| 5 | `G1_ENG_05` | 1 | Tiếng Anh | `eng` | English Vocabulary: Màu sắc bút chì (Colors) | ✏️ | 3 | 60s | +120 | `Đọc`, `Nhớ`, `Chọn` | C. red |
| 6 | `G2_MATH_06` | 2 | Toán | `math` | Bài toán Đội Hai trồng cây (Nhiều hơn đơn vị) | 🌳 | 4 | 80s | +130 | `Tìm`, `Chọn`, `Tính`, `Kết_luận` | 53 cây xanh |
| 7 | `G2_MATH_07` | 2 | Toán | `math` | Tính lít dầu còn lại (Bảng nhân 5 & Trừ) | 🛢️ | 3 | 80s | +130 | `Nhân`, `Trừ`, `Kết_luận` | 13 lít dầu |
| 8 | `G2_VIET_08` | 2 | Tiếng Việt | `viet` | Đọc hiểu: Mẫu câu Ai làm gì? (Nam giúp bà) | 🥬 | 3 | 70s | +120 | `Tìm`, `Gạch_chân`, `Chọn` | tưới những luống rau sau vườn |
| 9 | `G2_MCQ_09` | 2 | Toán | `math` | Đổi đơn vị mét sang đề-xi-mét (Sợi dây) | 📏 | 3 | 70s | +120 | `Đổi`, `Trừ`, `Chọn` | B. 6 dm |
| 10 | `G2_ENG_10` | 2 | Tiếng Anh | `eng` | English Grammar: There is / There are Plural | 📚 | 3 | 70s | +120 | `Đọc`, `Nhớ`, `Chọn` | B. are |
| 11 | `G3_MATH_11` | 3 | Toán | `math` | Cửa hàng bán gạo (Gấp một số lần & Tổng) | 🍚 | 3 | 90s | +140 | `Nhân`, `Cộng`, `Kết_luận` | 96 kg gạo |
| 12 | `G3_MATH_12` | 3 | Toán | `math` | Bài toán rút về đơn vị: Thưởng vở học sinh | 📓 | 3 | 90s | +140 | `Chia`, `Nhân`, `Kết_luận` | 25 quyển vở |
| 13 | `G3_VIET_13` | 3 | Tiếng Việt | `viet` | Đọc hiểu: Biện pháp so sánh Mặt hồ Ba Bể | 🪞 | 3 | 80s | +130 | `Tìm`, `Xác_định`, `Chọn` | một tấm gương khổng lồ |
| 14 | `G3_MCQ_14` | 3 | Toán | `math` | Tính chu vi mảnh đất HCN (15m và 8m) | 📐 | 3 | 80s | +130 | `Nhớ`, `Tính`, `Chọn` | B. 46 m |
| 15 | `G3_ENG_15` | 3 | Tiếng Anh | `eng` | Sentence Reordering: Vịt biết bơi (can/can't) | 🦆 | 3 | 80s | +130 | `Tìm`, `Ghép`, `Chọn` | A. A duck can swim but can't fly. |
| 16 | `G4_MATH_16` | 4 | Toán | `math` | Toán Tổng - Hiệu: Sách quyên góp 4A và 4B | 📚 | 4 | 90s | +150 | `Tách`, `Tính`, `Trừ`, `Kết_luận` | 4A: 160 quyển, 4B: 120 quyển |
| 17 | `G4_MATH_17` | 4 | Toán | `math` | Phân số của một số: Đàn gia cầm gà và vịt | 🐥 | 3 | 90s | +140 | `Tính`, `Trừ`, `Kết_luận` | 480 con vịt |
| 18 | `G4_VIET_18` | 4 | Tiếng Việt | `viet` | Đọc hiểu: Biện pháp nhân hóa Chị Gió | 🌾 | 3 | 80s | +130 | `Tìm`, `Gạch_chân`, `Chọn` | thì thầm (hoặc khẽ thì thầm) |
| 19 | `G4_MCQ_19` | 4 | Toán | `math` | Diện tích hình bình hành (Đáy 24m, cao 15m) | 🔷 | 4 | 85s | +140 | `Nhớ`, `Lọc`, `Tính`, `Chọn` | A. 360 m2 |
| 20 | `G4_ENG_20` | 4 | Tiếng Anh | `eng` | English Reading: Mẹ Peter làm bánh kếp | 🥞 | 3 | 80s | +130 | `Tìm`, `Dò`, `Chọn` | B. In the kitchen, making pancakes. |
| 21 | `G5_MATH_21` | 5 | Toán | `math` | Chuyển động đều: Ô tô và xe máy gặp nhau | 🚗 | 4 | 100s | +160 | `Cộng`, `Chia`, `Cộng`, `Kết_luận` | a) 2 giờ; b) 9 giờ sáng |
| 22 | `G5_MATH_22` | 5 | Toán | `math` | Thể tích bể nước hình hộp chữ nhật và lít | 📦 | 4 | 100s | +160 | `Nhân`, `Đổi`, `Tính`, `Kết_luận` | 2160 lít |
| 23 | `G5_VIET_23` | 5 | Tiếng Việt | `viet` | Đọc hiểu: Bài học kiên trì rèn nét chữ | ✍️ | 3 | 90s | +150 | `Tìm`, `Khái_quát`, `Tổng_hợp` | Kiên trì rèn luyện; có ý chí sẽ thành công |
| 24 | `G5_MCQ_24` | 5 | Toán | `math` | Bài toán giảm giá 2 lần chiếc cặp (Tỉ số %) | 🎒 | 3 | 90s | +150 | `Tính`, `Tính`, `Chọn` | B. 153 000 đồng |
| 25 | `G5_ENG_25` | 5 | Tiếng Anh | `eng` | English Reading: Chuyến đi Đà Nẵng của Nam | ✈️ | 3 | 80s | +140 | `Tìm`, `Dò`, `Chọn` | C. By plane |
| 26 | `chore_desk` | 1 | Sinh Hoạt | `chore` | Dọn bàn học gọn gàng trong 5 phút | 🧹 | 4 | 60s | +120 | `Cắm_bút`, `Gom_rác`, `Xếp_sách`, `Lau_bàn` | Bàn học gọn gàng, sạch sẽ |
| 27 | `chore_teeth` | 1 | Sinh Hoạt | `chore` | Đánh răng đúng cách 2 phút buổi tối | 🪥 | 3 | 45s | +100 | `Lấy_kem`, `Chải_răng`, `Súc_miệng` | Răng miệng sạch thơm tho |
| 28 | `chore_backpack` | 1 | Sinh Hoạt | `chore` | Tự chuẩn bị balo đi học ngày mai | 🎒 | 4 | 70s | +120 | `Xem`, `Xếp_sách`, `Kiểm_tra`, `Bỏ_bình` | Balo sẵn sàng đến trường |
| 29 | `chore_bed` | 1 | Sinh Hoạt | `chore` | Gấp chăn gối gọn gàng sau khi thức dậy | 🛏️ | 3 | 60s | +100 | `Giũ`, `Gấp`, `Đặt` | Giường ngủ ngăn nắp gọn gàng |

### 2.3. Thống Kê Định Lượng Của Bộ Dữ Liệu
- **Tổng số nhiệm vụ:** 29 nhiệm vụ.
- **Tổng số vi bước (Micro-tasks):** 94 vi bước.
- **Tỷ lệ tuân thủ giới hạn từ ngữ (< 15 từ):** 94/94 vi bước (100%), độ dài trung bình 8.2 từ/bước.
- **Tỷ lệ tuân thủ động từ hành động đơn nhất (Regex `^[a-zA-ZÀ-ỹ_]+$`):** 94/94 vi bước (100%), 0 ký tự khoảng trắng trong verb token.
- **Tỷ lệ có Ground Truth & Đáp án chuẩn:** 29/29 bài (100%).
- **Tỷ lệ có ADHD Scaffolding Notes:** 29/29 bài (100%).

---

## 4. BẢO TỒN 4 BÀI TẬP KỸ NĂNG SINH HOẠT VÀ TÍCH HỢP TƯƠNG THÍCH NGƯỢC

### 4.1. Bảo tồn 4 bài tập sinh hoạt thực tế
4 bài tập sinh hoạt trong `generate_app.py` được bảo toàn nguyên vẹn ID và cơ chế tương tác:
1. `chore_desk`: Dọn bàn học (4 bước với các widget xúc giác: `chore_pens`, `chore_trash`, `chore_books`, `chore_wipe`).
2. `chore_teeth`: Đánh răng 2 phút (3 bước vệ sinh cá nhân).
3. `chore_backpack`: Soạn cặp sách (4 bước checklist chống quên đồ).
4. `chore_bed`: Gấp chăn gối buổi sáng (3 bước chống quán tính giấc ngủ).

Tất cả 4 bài tập này được định danh dưới môn học chuẩn:
`"subject": "hoat_dong_trai_nghiem"`, phân loại danh mục `"cat": "chore"`, tên danh mục hiển thị `"catName": "Hoạt Động Trải Nghiệm"` (hoặc `"Vệ Sinh Cá Nhân"`, `"Thói Quen Buổi Sáng"`), và loại đảo phiêu lưu `"island": "routine"`.

### 4.2. Cơ chế Alias Tương Thích Ngược cho `math_garden`
Trong mã nguồn cũ, `math_garden` được gán vào `childRoadmap` mặc định tại dòng 1776 và modal phụ huynh tại dòng 1796. Để tránh bất kỳ lỗi truy cập undefined hoặc KeyError nào, giải pháp cung cấp một alias rõ ràng:
```javascript
taskDatabase['math_garden'] = taskDatabase['G1_MATH_01']; // Hoặc liên kết trực tiếp
```
Đồng thời, cập nhật lộ trình khởi tạo chuẩn của bé thành:
```javascript
childRoadmap: [
  taskDatabase['chore_desk'],   // Đảo 1: Thói quen sinh hoạt khởi động
  taskDatabase['G1_MATH_01']    // Đảo 2: Bài tập Toán GDPT 2018 đầu tiên
]
```

---

## 5. HƯỚNG DẪN CẬP NHẬT DÀNH CHO BỘ PHẬN IMPLEMENTER

Khi bộ phận Implementer tiến hành tích hợp vào `generate_app.py`, cần thực hiện các điều chỉnh đồng bộ sau:

### 5.1. Thay thế khối `taskDatabase` (Dòng 1527–1762)
Thay thế toàn bộ khai báo `const taskDatabase = { ... };` bằng nội dung tệp snippet chuẩn đã được biên soạn sẵn tại:
`.agents/teamwork/explorer_m1_2/task_database_snippet.js`
(Tệp này dài 200,795 ký tự, đã format chuẩn cú pháp JavaScript, bao gồm đầy đủ 29 bài tập và alias `math_garden`).

### 5.2. Cập nhật các nút Lọc Danh Mục Phụ Huynh trong HTML (Dòng 1030–1034)
Điều chỉnh các số lượng trong badge đếm để khớp với kho 29 bài:
```html
<button onclick="parentFilterCatalog('all')" id="p-cat-all" class="px-2.5 py-1 rounded-xl bg-teal-600 text-white shrink-0">Tất cả (29)</button>
<button onclick="parentFilterCatalog('math')" id="p-cat-math" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📐 Toán GDPT (15)</button>
<button onclick="parentFilterCatalog('viet')" id="p-cat-viet" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📖 Tiếng Việt (5)</button>
<button onclick="parentFilterCatalog('eng')" id="p-cat-eng" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🇬🇧 Tiếng Anh (5)</button>
<button onclick="parentFilterCatalog('chore')" id="p-cat-chore" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🧹 Sinh Hoạt (4)</button>
```

### 5.3. Cập nhật hàm Render Catalog để xử lý Khử Trùng Lặp Alias
Trong `renderParentCatalogList()` (dòng 2688):
```javascript
// Khử trùng lặp giữa mã chính và alias (nếu có math_garden)
const taskMap = new Map();
Object.values(taskDatabase).forEach(t => { if (t && t.id) taskMap.set(t.id, t); });
const tasks = Array.from(taskMap.values());
```

---

## 6. DANH MỤC HIỆN VẬT KÈM THEO
1. `.agents/teamwork/explorer_m1_2/ingested_task_database.json`: File dữ liệu chuẩn JSON thuần của toàn bộ 29 bài tập.
2. `.agents/teamwork/explorer_m1_2/task_database_snippet.js`: Code JavaScript sẵn sàng copy vào `generate_app.py`.
3. `.agents/teamwork/explorer_m1_2/build_curriculum_bank.py`: Script Python kiểm tra tính hợp lệ và tự động sinh dữ liệu.
4. `.agents/teamwork/explorer_m1_2/handoff.md`: Báo cáo bàn giao 5 thành phần theo Handoff Protocol.
