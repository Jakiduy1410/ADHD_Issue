# Original User Request

## 2026-10-17T13:12:16Z

Xây dựng bộ công cụ R&D chuẩn hóa cho hệ thống Micro-Task can thiệp ADHD học sinh tiểu học (Lớp 1–5), bao gồm bộ khảo sát phụ huynh 9 câu (Vanderbilt/SNAP-IV), kho 25 bài tập đối chuẩn chuẩn GDPT 2018 kèm ground truth, chuẩn JSON Schema cho micro-task, và bộ script benchmark tự động kiểm tra cú pháp lẫn tính đúng đắn sư phạm/toán học qua Gemini API.

Working directory: c:\Users\ADMIN\Documents\antigravity\calm-bardeen
Integrity mode: development

## Requirements

### R1. Bộ Khảo Sát ADHD 9 Câu & Ánh Xạ Tham Số Nhận Thức
Xây dựng file khảo sát phụ huynh tinh gọn 9 câu trích xuất từ thang đo lâm sàng Vanderbilt VADPRS và SNAP-IV, tập trung vào chức năng điều hành, độ dài khoảng chú ý và độ nhạy cảm thất bại (RSD). Cung cấp thuật toán tính điểm chuyển đổi câu trả lời thành Vector tham số nhận thức (Cognitive Profile) dưới dạng JSON để nạp vào prompt phân rã bài tập.

### R2. Kho Bài Tập Đối Chuẩn Lớp 1–5 (25 Bài Chuẩn GDPT 2018)
Biên soạn kho 25 bài tập kinh điển bám sát chương trình Giáo dục Phổ thông 2018 của Việt Nam (Toán lời văn, Tiếng Việt/Đọc hiểu, Trắc nghiệm nhiều câu ABCD, Tiếng Anh) từ lớp 1 đến lớp 5. Mỗi bài tập bắt buộc đi kèm:
- Đề bài gốc.
- `ground_truth_steps`: Các bước giải mẫu chuẩn sư phạm.
- `final_answer`: Đáp số hoặc đáp án đúng cuối cùng để làm căn cứ chấm tự động.

### R3. Định Chuẩn JSON Schema & Hệ Thống Prompt Phân Rã
- Định nghĩa file JSON Schema (Draft-07) quy chuẩn dữ liệu Micro-Task (đảm bảo mỗi bước chỉ từ 60s–300s, 1 động từ hành động đơn nhất, `ui_type` phù hợp).
- Thiết kế hệ thống Prompt phân rã 2 chặng (Two-Stage Pipeline): Nhận diện dạng bài → Phân rã theo mẫu sư phạm chuyên biệt.
- Thiết kế Prompt động viên (Encouragement Prompt) hỗ trợ dập tắt RSD và kịch bản khen ngợi nỗ lực cho phụ huynh.

### R4. Hệ Thống Benchmark Tự Động Đánh Giá Toàn Diện (Syntax + Correctness)
Viết script Python thực thi benchmark gọi Gemini API qua `google-genai` (hoặc `google-generativeai`) đọc khóa từ `.env`, tối ưu thời gian chạy (batching / async gọn gàng, fail-fast, không chạy lặp vô nghĩa):
- **Kiểm tra Cú pháp (Syntax Check)**: Validate kết quả trả về với JSON Schema.
- **Kiểm tra Tính Đúng Đắn (Ground Truth Match)**: Tự động so khớp bước kết luận của AI với `final_answer` của bài tập.
- **Kiểm tra Độ Bao Phủ (Completeness Check)**: Không bỏ sót câu hỏi con trong các đề phức hợp.
- **Giám Khảo Sư Phạm (LLM-as-a-Judge)**: Chấm điểm thang 10 cho Logic Flow, Cognitive Scaffolding, Hint Appropriateness.
- Xuất báo cáo tổng kết chi tiết `benchmark_report.json` và bảng tóm tắt Markdown.

---

## Acceptance Criteria

### Verification & Performance Guardrails
- [ ] File khảo sát `data/surveys/adhd_parent_survey.json` hoàn thiện đủ 9 câu hỏi, thang đo điểm và công thức ánh xạ ra tham số nhận thức.
- [ ] Kho bài tập `data/curriculum/grade_1_to_5_benchmark.json` chứa đúng 25 bài tập chuẩn phân bố đều lớp 1–5, 100% có `ground_truth_steps` và `final_answer`.
- [ ] File `schemas/micro_task_schema.json` hợp lệ theo chuẩn draft-07.
- [ ] Toàn bộ System Prompts được lưu trữ rõ ràng, sẵn sàng nạp cho pipeline.
- [ ] Script benchmark thực thi trơn tru, nạp API key từ `.env`, hoàn thành 25 bài test mà không bị treo hay lặp vô hạn.
- [ ] Báo cáo `benchmark_report.json` ghi nhận:
  - Tỷ lệ tuân thủ Schema ≥ 95%.
  - Tỷ lệ lời giải đúng đáp số (Final Answer Correctness) ≥ 90%.
  - Điểm trung bình đánh giá Sư phạm (LLM Judge) ≥ 8.5/10.


## 2026-10-18T05:39:44Z

Xây dựng và hoàn thiện trọn gói Hệ sinh thái Phần mềm Kép hỗ trợ trẻ tiểu học giảm chú ý (ADHD GDPT 2018): Ứng dụng Học sinh (Milo Quest) x Ứng dụng Phụ huynh (Trạm Thấu Hiểu), có giả lập 2 máy thời gian thực, Lộ trình Đảo Bài Tập và cơ chế đồng điều hòa cảm xúc.

Working directory: c:\Users\ADMIN\Documents\antigravity\calm-bardeen
Integrity mode: development

Phân bổ model:
- Task dễ/trung bình (UI layout, Tailwind CSS, components, mock data, Web Audio, test): Phân công Gemini 3.8 Flash (flash).
- Task khó/kiến trúc (đồng bộ 2 máy WebSocket, State sync bus, AI decomposition pipeline, giải thuật ADHD scoring): Phân công Flagship / Pro (pro).

## Requirements

### R1. Giả Lập Hai Thiết Bị & Đăng Nhập Giả Lập (Dual-Device Simulator & Mock Auth)
Hệ thống phải cung cấp môi trường chạy thử nghiệm kép gồm 2 máy đặt cạnh nhau (hoặc chuyển đổi vai trò 1 chạm: Phụ huynh ↔ Bé Leo), đồng bộ dữ liệu hai chiều thời gian thực (nhiệm vụ, tiến độ từng bước, điểm sao Dopamine, và yêu cầu phê duyệt Vé Vàng).

### R2. Phân Hệ Phụ Huynh Với 2 Hướng Giao Bài Toàn Diện (Parent Assignment Hub)
Phụ huynh có thể giao bài theo 2 hướng độc lập:
- Hướng 1: Kho Đề Xuất (Băm sẵn): Lựa chọn từ kho 25 bài tập chuẩn GDPT 2018 Lớp 1-5 (Toán, Tiếng Việt, Tiếng Anh) và bài tập kỹ năng sinh hoạt; hỗ trợ chọn lẻ hoặc tick chọn cả lô bài (Batch Selection) rồi bấm một nút bắn toàn bộ sang máy con.
- Hướng 2: Tự Giao Bài Mới: Gồm cơ chế AI Tự Băm (nhập đề bài thô bất kỳ -> AI phân rã thành các vi bước < 15 từ, 1 động từ hành động để xem trước/tinh chỉnh) và cơ chế Soạn Bằng Tay động (tự do thêm/bớt số bước).
- Giám sát & Khen ngợi nỗ lực: Nhận Live Telemetry từ máy con và cung cấp kịch bản khen ngợi nỗ lực (Effort-Based Praise) cùng cảnh báo tránh nói để ngăn ngừa tổn thương tự ái (RSD).

### R3. Phân Hệ Học Sinh Với Lộ Trình Đảo Bài Tập & Robot Milo (Child Quest & Cockpit)
Phía máy con phải hiện thực hóa trọn vẹn trải nghiệm thân thiện với não bộ ADHD:
- Lộ trình Đảo Bài Tập (Island Quest Roadmap): Toàn bộ bài tập phụ huynh vừa giao (dù 1 bài hay 1 lô bài) được chuyển đổi thành các Hòn đảo nối tiếp nhau trên bản đồ phiêu lưu.
- Buồng lái tập trung (Focus Cockpit): Nguyên tắc 1 màn hình 1 thẻ duy nhất (Single-Focus Card), đĩa Visual Timer đếm lùi trực quan êm dịu, bàn phím số Numpad/thẻ tương tác xúc giác, phản hồi Dopamine nổ sao tức thì (< 300ms).
- Robot Milo & Bài tập thở hộp 4-4-4: Milo giữ im lặng khi làm bài để tránh xao nhãng; xuất hiện khi trẻ bấm cứu trợ hoặc gặp khó khăn để an ủi giải tỏa cảm xúc (RSD Shield) và hướng dẫn thở hộp 4-4-4.
- Mở Rương Báu & Đổi Vé Vàng: Hoàn thành các đảo mở khóa Rương kho báu; đổi Vé Vàng (phần thưởng đời thực) gửi yêu cầu phê duyệt lập tức sang máy bố mẹ.

### R4. Quy Tắc Thực Nghiệm Prompt Nghiêm Ngặt (Strict Prompt Guardrail)
Khi kiểm thử hoặc thực nghiệm hệ thống Prompt (prompts/) với Gemini API:
- Tuyệt đối không tự ý ghi đè vào các file Prompt gốc.
- Mọi phát hiện lỗi hoặc đề xuất cải tiến (như ép trần < 15 từ, mở rộng enum môn học) phải được kiểm chứng trên bản nháp (scratch) và lập báo cáo chi tiết (Diff nội dung + Lý do khoa học thần kinh) để người dùng phê duyệt trước khi áp dụng.

## Acceptance Criteria

### Chức Năng Ứng Dụng Kép
- [ ] Giao diện web chạy mượt mà 60fps tại index.html (hoặc out_index.html), hỗ trợ Web Audio API tạo âm thanh click tactile và nổ sao trực tiếp.
- [ ] Chuyển đổi vai trò người dùng (Mock Login) hoạt động tức thì giữa Bé Leo, Mẹ Lan và Chế độ Song Song (Dual).
- [ ] Phụ huynh tick chọn 1 lô bài ở Kho đề xuất và bấm "Giao ngay", máy con lập tức cập nhật Lộ trình Đảo tương ứng mà không cần tải lại trang.
- [ ] Con làm xong một vi bước, hệ thống nổ hiệu ứng sao trong < 300ms và tự động chuyển sang bước tiếp theo.
- [ ] Nút cứu trợ kích hoạt bài tập thở bụng 4-4-4 của Milo với hoạt ảnh co giãn nhịp thở và đồng hồ đếm ngược.
- [ ] Con đổi Vé Vàng gửi thông báo sang máy mẹ, mẹ bấm duyệt thì máy con lập tức nhận thông báo ăn mừng.

### Tính Toàn Vẹn Của Hệ Thống Prompt
- [ ] 100% các file prompt gốc trong prompts/ được bảo toàn nguyên vẹn; các phát hiện thực nghiệm được lưu trong báo cáo khoa học tại scratch/.


## 2026-10-18T16:12:18Z

This is a focused refactor, bug fix, architectural folder reorganization and core pipeline completion task; keep the team small, lean and focused on high-quality delivery rather than sprawling agent counts.

Working directory: c:\Users\ADMIN\Documents\antigravity\calm-bardeen
Integrity mode: development

Refactor, reorganize, and complete the Dual-App ADHD Intervention Ecosystem (Milo Quest x Trạm Thấu Hiểu) codebase to resolve critical UI issues, replace mocked AI task decomposition with real pipeline execution, implement parent diagnostic survey flow, upgrade child interactive stages, clean up project folder structure, verify rigorously through automated tests, and provide a clear usage guide for the user.

## Requirements

### R1. UI Ergonomics & Accessibility Corrections
1. Fix parent task catalog checkbox truncation in dual-channel mode: ensure card layout and `.phone-screen` inner containers prevent clipping on constrained mockups.
2. Fix viewport scrolling in dual-channel mode: wrap parent screen views in an accessible scroll container so the batch dispatch button ("GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!") is consistently visible and clickable.
3. Fix contrast ratios to meet WCAG AA (≥ 4.5:1 for normal text) across all input boxes, inactive filter chips, disabled buttons (`.btn-disabled`), and clue text.

### R2. Real Pedagogical Micro-Task AI Decomposer Pipeline
1. Connect `parentRunAiBreakdown()` to real decomposition logic instead of the hardcoded 4-step `setTimeout` stub.
2. Ingest the user's input exercise text and child cognitive profile (attention span, working memory capacity, RSD sensitivity level) to dynamically decompose the task into atomic micro-tasks adhering strictly to `schemas/micro_task_schema.json`.
3. Support offline fallback gracefully with meaningful, content-aware decomposition matching the input subject/grade if the LLM backend is offline or unconfigured.
4. Render child workspace steps based on the actual decomposed `ui_type` (`single_choice`, `text_input`, `highlight`, etc.) with authentic instructions and payloads rather than dumping full unsegmented problem text.

### R3. Authentic Keyword Highlighting & Strict Validation
1. Replace standalone disconnected chip buttons with contextual tokenized sentence segments.
2. For highlight tasks (e.g., finding quantities or key entities), require the child to tap target segments (numbers, key nouns) within the sentence structure, validating that required target items are selected before enabling completion.
3. In `handleChildTextInputSubmit()`, enforce answer validation against `success_criteria.expected_answer` with gentle, RSD-safe corrective hints instead of auto-passing every incorrect input.

### R4. Parent Diagnostic Survey & Cognitive Profile Integration
1. Provide a clean UI flow for the 9-question parent survey based on `data/surveys/adhd_parent_survey.json`.
2. Compute clinical dimension scores (Executive Function, Attention Span, RSD Sensitivity, Composite Deficit Index) and map them into the `CognitiveProfile` stored in state.
3. Allow parents to complete or skip the survey (with sensible default profile), displaying the active profile summary badge in the parent dashboard.

### R5. Distinct Visual Identity for Routines vs Study Tasks
1. Distinguish "Đảo sinh hoạt" (routines/chores - warm, calming theme) from "Đảo bài tập" (academic GDPT - cool focus theme) on the child's Island Quest roadmap and focus card styling.

### R6. Project Structure Clean-Up & Organization
1. Consolidate loose research documents from project root (`AI Can Thi?p ADHD.md`, `AI Parent Coach (1).md`, `Nguyên nhân và Giải pháp.md`, `?ng d?ng AI cho ADHD (1).md`, etc.) into a dedicated `docs/research/` folder.
2. Relocate test infra & benchmark documentation (`BENCHMARK_SUMMARY.md`, `TEST_INFRA.md`, `TEST_READY.md`, `benchmark_report.json`) into `docs/reports/` and `docs/infra/`.
3. Standardize and organize scripts and temporary audit code in `scratch/` and maintain clean root structure with proper `.gitignore` enforcement.
4. Ensure all paths and test runners are updated to reflect any moved reference files without breaking imports.

### R7. Verification & End-to-End User Documentation
1. Run and verify the full automated test suite (`tests/runner.py`, unit tests, e2e browser/sync tests) to ensure 0 regressions.
2. Add automated regression tests covering the fixed validation, survey scoring, folder references, and real decomposition flows.
3. Provide a clear, step-by-step user guide explaining how to run the backend, open the app, conduct the survey, assign custom tasks, and test with the child interface.

## Acceptance Criteria

### Project Organization Verification
- [ ] Root directory is clean of unstructured markdown research files; all domain research is organized under `docs/research/`, reports under `docs/reports/`, and infra docs under `docs/infra/`.
- [ ] No broken references, broken links, or broken test imports resulting from the folder re-organization.

### Automated Verification
- [ ] All existing automated tests in `tests/runner.py` pass with exit code 0.
- [ ] New automated unit/integration tests verify:
  - Input submission rejection on incorrect answer and acceptance on correct answer.
  - Survey scoring calculation matching the formula in `adhd_parent_survey.json`.
  - Decomposition output conforming to Draft-07 `micro_task_schema.json`.
- [ ] No JavaScript runtime syntax errors or uncaught exceptions in the browser console during dual-channel task assignment and child step execution.

### User Experience Verification
- [ ] Checkboxes and action buttons in Parent Catalog remain fully visible and clickable in both single-view and dual-channel view without clipping.
- [ ] Custom exercise breakdown produces distinct, task-specific micro-tasks for different inputs (e.g. math division vs reading poem), each rendering its corresponding interactive widget.
- [ ] Color contrast for labels, disabled buttons, and stage prompts is readable under normal ambient lighting.
- [ ] A walkthrough guide document is provided at completion detailing system execution and verification.
