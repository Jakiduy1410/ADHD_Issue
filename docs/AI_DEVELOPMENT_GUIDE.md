# TÀI LIỆU HƯỚNG DẪN KIẾN TRÚC & PHÁT TRIỂN HỆ THỐNG
# (DUAL-APP ADHD EDTECH ECOSYSTEM: MILO QUEST x TRẠM THẤU HIỂU)

## 1. TỔNG QUAN HỆ THỐNG
Dự án được xây dựng phục vụ trẻ em tiểu học có xu hướng ADHD/suy giảm chức năng điều hành (GDPT 2018), bao gồm 2 trải nghiệm song hành:
1. **Milo Quest (Ứng dụng con)**: Hải trình đảo nhiệm vụ, Buồng lái tập trung 1 màn hình 1 bước (Single-Focus Cockpit), Đĩa đếm giờ thị giác (Visual Timer Disc), Âm thanh Dopamine Web Audio <300ms, Milo hạ nhiệt quá tải cảm xúc 4-4-4 (Box Breathing).
2. **Trạm Thấu Hiểu (Ứng dụng mẹ)**: Giao bài hàng loạt từ kho 25 bài chuẩn GDPT 2018 hoặc tự nhập đề cho AI băm, Giám sát thời gian thực (Live Telemetry), Huấn luyện viên khen ngợi nỗ lực (RSD Coach), Duyệt vé vàng đổi quà (Golden Ticket).

---

## 2. KIẾN TRÚC PHẦN MỀM (SOFTWARE ARCHITECTURE)

### 2.1. Phân tầng thư mục
```text
calm-bardeen/
│
├── AGENTS.md                   <-- BẢNG QUY TẮC BẮT BUỘC CHO AI AGENT
├── run.bat                     <-- Script khởi chạy 1-click (FastAPI + Web App)
├── generate_app.py             <-- Compiler: Ghép source từ app/ ra index.html
├── index.html                  <-- Standalone build cho kiểm thử tự động
│
├── data/curriculum/
│   ├── tasks_db.json           <-- Kho dữ liệu 29 bài tập giàu thông số (Source of Truth)
│   └── grade_1_to_5_benchmark.json <-- Benchmark gốc GDPT 2018
│
├── prompts/                    <-- Trung tâm chứa các Prompt AI (.md)
│   ├── micro_task_decomposer.md <-- System Prompt băm bài kèm Few-shot examples
│   ├── parent_effort_coach.md  <-- Prompt hướng dẫn phụ huynh khen nỗ lực
│   └── kid_rsd_calming_milo.md <-- Prompt robot Milo an ủi RSD
│
├── app/                        <-- Source code Frontend
│   ├── index.html              <-- Khung DOM giao diện
│   ├── css/style.css           <-- CSS tùy biến
│   └── js/app.js               <-- Logic ứng dụng, Web Audio API, MiloSyncBus
│
├── src/api/                    <-- Backend Python FastAPI
│   ├── server.py               <-- REST API, WebSocket /ws/sync, Static Web Server
│   └── ai_engine.py            <-- Tích hợp Google Gemini 3.5 Flash Lite
│
└── tests/                      <-- 363 Unit, E2E, và Adversarial Test Cases
```

---

## 3. QUY TRÌNH SỬA BÀI TẬP VÀ ĐỒNG BỘ PROMPT AI (HOW-TO GUIDE)

### Bước 1: Khi cần sửa đổi một bài tập trong kho
* Mở file `data/curriculum/tasks_db.json`.
* Tìm mã bài (ví dụ `G3_MCQ_14`).
* Sửa nội dung câu hỏi, thông số hình học (`geometry_spec`), đoạn văn (`reading_passage`) hoặc các bước con trong mảng `steps`.
* Không sửa hardcode trong file JavaScript.

### Bước 2: Khi cần thêm dạng bài mới cho AI phân rã
1. Lấy 1 bài mẫu chuẩn từ `tasks_db.json`.
2. Mở file `prompts/micro_task_decomposer.md`.
3. Dán bài mẫu đó vào mục `## BÀI HỌC MẪU (FEW-SHOT EXAMPLES)`.
4. Gemini sẽ tự động học theo cấu trúc mẫu đó và sinh ra các bài tập tương tự của phụ huynh mà không bao giờ bị lệch chuẩn giao diện.

### Bước 3: Kiểm tra và đóng gói
```bash
# 1. Biên dịch frontend app/ ra index.html
python generate_app.py

# 2. Chạy toàn bộ 363 test case
python tests/runner.py
```
Đảm bảo tất cả các bài test đều báo `PASSED (STATUS: GREEN)`.
