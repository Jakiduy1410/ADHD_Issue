# QUY TẮC PHÁT TRIỂN DÀNH CHO AI AGENT (MANDATORY AI AGENT GUIDELINES)

> ⚠️ **DÀNH CHO TẤT CẢ CÁC AI AGENT ĐỌC TRƯỚC KHI CODE:**  
> Bạn bắt buộc phải tuân thủ nghiêm ngặt các nguyên tắc dưới đây. Không bao giờ được đi đường tắt (hardcode vào JS) hay làm hỏng cấu trúc phân tầng của dự án.

---

## 1. CẤU TRÚC PHÂN TẦNG VÀ SINGLE SOURCE OF TRUTH (NGUỒN CHÂN LÝ DUY NHẤT)

* **Dữ liệu bài tập chuẩn (25 GDPT 2018 + 4 bài sinh hoạt)**:
  * Nằm DUY NHẤT tại: `data/curriculum/tasks_db.json`.
  * **TUYỆT ĐỐI CẤM**: Không hardcode danh sách bài tập hoặc câu lệnh `if (taskId === '...')` vào file JavaScript (`app/js/app.js`). Mọi chỉnh sửa dữ liệu, gợi ý, số liệu hình học, bài đọc hiểu PHẢI sửa trong file JSON này.

* **Prompt AI phân rã vi nhiệm vụ (Micro-Task Decomposer)**:
  * Nằm DUY NHẤT tại: `prompts/micro_task_decomposer.md`.
  * `src/api/ai_engine.py` nạp động từ file này bằng `load_decomposer_prompt()`.
  * **TUYỆT ĐỐI CẤM**: Không tự tiện hardcode chuỗi prompt dạng string vào code Python.

* **Mã nguồn giao diện (Frontend Web)**:
  * Nằm trực tiếp trong thư mục: `app/` (`index.html`, `css/style.css`, `js/app.js`).
  * Backend FastAPI tự động mount và phục vụ trực tiếp thư mục `app/` tại `http://localhost:8000/`.
  * **TUYỆT ĐỐI KHÔNG CẦN**: `generate_app.py` hay tạo lại file `index.html` gộp ở thư mục gốc (đã được dọn dẹp và cất vào `archive/`). Mọi chỉnh sửa giao diện chỉ cần làm trực tiếp trong `app/`.

---

## 2. NGUYÊN TẮC SƯ PHẠM ADHD 2 TẦNG (2-TIER PEDAGOGICAL ARCHITECTURE)

Mọi bài tập phải phân biệt rạch ròi 2 cấp độ:

### Tầng 1: Cấp độ Bài tập lớn (`exercise_type`)
* Các thể loại: `word_problem`, `geometry`, `reading_comprehension`, `pure_arithmetic`, `find_x`.
* **Giàn giáo thị giác (Visual Props)**:
  * Nếu là `geometry`: Bắt buộc có `geometry_spec` để vẽ hình SVG trực quan trên đầu thẻ (`shape_type`, `dimensions`, `target`).
  * Nếu là `reading_comprehension`: Bắt buộc có `reading_passage` để ghim đoạn văn chuyện gốc trên đầu cho trẻ tham chiếu.

### Tầng 2: Cấp độ Vi bước con (Atomic Steps)
Mỗi bài tập gồm 2 đến 4 bước nhỏ (`steps: [...]`). Mỗi bước chỉ làm ĐÚNG 1 THAO TÁC (`ui_type`):
* `ui_type = "highlight"`: Chạm/quẹt gạch chân từ khóa, số liệu.
* `ui_type = "single_choice"`: Chọn 1 phương án A, B, C.
* `ui_type = "text_input"`: Gõ kết quả số hoặc chữ.
* `ui_type = "checkbox"`: Nút tích xác nhận hoàn thành.

> 🔴 **ĐIỀU CẤM KỴ**:  
> Đối với bài toán hình học hoặc toán có lời văn, **BƯỚC 1 BẮT BUỘC PHẢI LÀ GẠCH CHÂN DỮ KIỆN (`ui_type: "highlight"`)**. Không bao giờ được bỏ qua bước gạch chân này để nhảy vào tính ngay, vì trẻ ADHD sẽ bị quá tải hoặc nhầm lẫn giữa chu vi và diện tích!

---

## 3. QUY TRÌNH ĐỒNG BỘ KHI SỬA HOẶC THÊM DẠNG BÀI MỚI

Khi người dùng yêu cầu sửa một bài tập chưa ưng ý hoặc thêm dạng bài mới:
1. **Sửa file dữ liệu**: Sửa trực tiếp bài đó trong `data/curriculum/tasks_db.json`.
2. **Kiểm tra UI**: Đảm bảo các `ui_type` được khai báo khớp với các renderer trong `app/js/app.js`.
3. **Dạy lại AI (Prompt)**: Copy bài tập mẫu chuẩn mực vừa sửa dán vào mục `## BÀI HỌC MẪU (FEW-SHOT EXAMPLES)` của file `prompts/micro_task_decomposer.md` để Gemini AI học theo cách băm đó.
4. **Chạy kiểm thử**:
   ```bash
   python tests/test_api_server.py
   python -m unittest tests/e2e/test_dual_app_e2e.py
   ```
   Tất cả bài test bắt buộc phải vượt qua 100% (STATUS: GREEN).

---

## 4. KHỞI CHẠY HỆ THỐNG
* File khởi chạy 1-click duy nhất: `run.bat` (chạy FastAPI port 8000 và tự mở trình duyệt).
