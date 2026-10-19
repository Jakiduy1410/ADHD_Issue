# HƯỚNG DẪN SỬ DỤNG HỆ SINH THÁI KÉP CAN THIỆP ADHD TIỂU HỌC
# (MILO QUEST x TRẠM THẤU HIỂU)
## Bám sát Chương trình Giáo dục Phổ thông 2018 (GDPT 2018) & Cơ sở Khoa học Thần kinh Nhận thức

---

## 1. TỔNG QUAN KIẾN TRÚC & HỆ SINH THÁI KÉP (ARCHITECTURE & ECOSYSTEM)

Hệ sinh thái phần mềm kép can thiệp ADHD là giải pháp EdTech ứng dụng khoa học thần kinh nhận thức, thiết kế chuyên biệt cho học sinh tiểu học (Lớp 1–5) gặp hội chứng giảm chú ý / tăng động (ADHD) và hội chứng nhạy cảm tổn thương tự ái (Rejection Sensitive Dysphoria - RSD).

```
                      +------------------------------------------+
                      |         TRẠM THẤU HIỂU (PARENT)          |
                      | - Khảo sát lâm sàng 9 câu Vanderbilt     |
                      | - Tính Vector Nhận thức (EF, AS, RSD)    |
                      | - Kho 25 bài GDPT 2018 & Sinh hoạt       |
                      | - Băm bài bằng AI (Gemini 2 chặng)       |
                      | - Giám sát Telemetry & Duyệt Vé Vàng     |
                      +--------------------+---------------------+
                                           |
                  ================== MiloSyncBus ==================
                  [Tầng 1: WebSocket /ws/sync (FastAPI Server)]
                  [Tầng 2: LocalStorage Cross-Tab Event Bus]
                  =================================================
                                           |
                      +--------------------+---------------------+
                      |            MILO QUEST (CHILD)            |
                      | - Buồng lái tập trung (Single-Focus)     |
                      | - Đĩa đếm ngược trực quan (Visual Timer) |
                      | - Gạch chân từ khóa theo ngữ cảnh        |
                      | - Kiểm tra đáp số nghiêm ngặt, RSD-Safe  |
                      | - Robot Milo & Bài tập thở hộp 4-4-4     |
                      | - Nổ sao Dopamine & Đổi Vé Vàng          |
                      +------------------------------------------+
```

### Các Trụ Cột Khoa Học Thần Kinh Cốt Lõi:
1. **Lý thuyết Tải nhận thức (Cognitive Load Theory)**: Loại bỏ toàn bộ giao diện rối rắm. Trẻ ADHD chỉ nhìn thấy đúng **1 thẻ vi nhiệm vụ duy nhất** trên màn hình tại một thời điểm (Single-Focus Card).
2. **Kỹ thuật Giàn giáo Vi nhiệm vụ (Micro-Task Scaffolding)**: Mọi bài tập phức tạp được băm nhỏ thành các bước nguyên tử từ 60s đến 300s, chứa đúng **1 động từ hành động đơn nhất** (Đọc, Gạch chân, Tính, Chọn) và chỉ dẫn tinh gọn dưới 15 từ.
3. **Giao thức Dập tắt RSD (RSD Shielding)**: Tuyệt đối không sử dụng các từ ngữ mang tính phán xét, chê bai ("Sai rồi", "Thất bại"). Khi làm chưa đúng, hệ thống đưa ra gợi ý nâng đỡ ấm áp từ Robot Milo.
4. **Vòng lặp Khen thưởng Dopamine (Dopamine Micro-Rewards)**: Âm thanh nổ sao tactile qua Web Audio API và hiệu ứng hạt bùng nổ tức thì (< 300ms) sau mỗi bước hoàn thành, giúp duy trì hứng thú nội tại.

---

## 2. YÊU CẦU HỆ THỐNG & KHỞI ĐỘNG NHANH (PREREQUISITES & QUICKSTART)

### 2.1. Yêu Cầu Môi Trường
- **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux.
- **Python**: Phiên bản 3.10 trở lên.
- **Node.js**: Phiên bản 18 trở lên (để chạy bộ kiểm thử nghịch đảo).
- **Trình duyệt Web**: Google Chrome, Microsoft Edge, Firefox hoặc Safari phiên bản mới nhất hỗ trợ Web Audio API và localStorage.
- **Google Gemini API Key** (Tùy chọn): Khóa API Google Gemini lưu trong file `.env`. Nếu không có hoặc hết quota, hệ thống tự động kích hoạt **Bộ phân rã dự phòng nhận thức ngoại tuyến (Offline Content-Aware Fallback Engine)** mà không bị gián đoạn.

### 2.2. Các Bước Khởi Động Nhanh

#### Bước 1: Cài đặt thư viện phụ thuộc
Mở terminal (PowerShell hoặc Bash) tại thư mục gốc của dự án:
```powershell
pip install -r requirements.txt
```
*(Các thư viện chính bao gồm: `fastapi`, `uvicorn`, `websockets`, `httpx`, `pydantic`, `jsonschema`, `google-genai`)*.

#### Bước 2: Cấu hình biến môi trường (Tùy chọn)
Tạo hoặc kiểm tra file `.env` tại thư mục gốc:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
APP_ENV=development
PORT=8000
```

#### Bước 3: Khởi động Backend FastAPI Server
Chạy lệnh khởi chạy máy chủ backend:
```powershell
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8000 --reload
```
Hoặc chạy trực tiếp script:
```powershell
python src/api/server.py
```
Máy chủ backend sẽ lắng nghe tại: `http://localhost:8000`.
- API Health Check: `http://localhost:8000/api/health`
- WebSocket Endpoint: `ws://localhost:8000/ws/sync`
- API Documentation (Swagger): `http://localhost:8000/docs`

#### Bước 4: Mở Giao Diện Web Ứng Dụng Kép
Mở file `index.html` trực tiếp bằng trình duyệt Web:
- Nhấp đúp chuột vào file `index.html`, hoặc
- Mở qua máy chủ HTTP tĩnh (ví dụ: Live Server trong VS Code hoặc `python -m http.server 3000`).

#### Bước 5: Chế Độ Xem (View Modes)
Tại thanh điều hướng trên cùng, người dùng có thể lựa chọn:
- **Chế độ Song Song (Dual Device)**: Hiển thị đồng thời cả 2 màn hình điện thoại (Trái: Máy Bé Leo, Phải: Máy Mẹ Lan). Thích hợp nhất cho việc kiểm thử, demo và đánh giá tương tác thời gian thực.
- **Bé Leo (Child Only)**: Chỉ hiển thị buồng lái tập trung của trẻ.
- **Mẹ Lan (Parent Only)**: Chỉ hiển thị trạm quản lý và giao bài của phụ huynh.

---

## 3. KHẢO SÁT CHẨN ĐOÁN NHẬN THỨC PHỤ HUYNH (PARENT SURVEY WALKTHROUGH)

Trạm Thấu Hiểu tích hợp bộ khảo sát 9 câu chuẩn lâm sàng dựa trên thang đo **Vanderbilt VADPRS** và **SNAP-IV** kết hợp nghiên cứu của GS. Russell Barkley về rối loạn điều hòa cảm xúc ở trẻ ADHD.

```
       [Huy hiệu Hồ sơ Nhận thức: EF: 44% | AS: 33% | RSD: 56% | CDI: 0.43 (MODERATE)]
                                     | (Bấm để mở)
                                     v
       +--------------------------------------------------------------+
       |   📋 KHẢO SÁT CHẨN ĐOÁN NHẬN THỨC & TẬP TRUNG (9 CÂU)        |
       |                                                              |
       |  Nhóm 1: Chức năng Điều hành (Executive Function)            |
       |  - Câu 1: Bé gặp khó khăn khi nhớ chỉ dẫn nhiều bước?        |
       |  - Câu 2: Bé thường trì hoãn hoặc lúng túng khi bắt đầu?     |
       |  - Câu 3: Bàn học của bé thường bừa bộn, hay quên đồ dùng?   |
       |                                                              |
       |  Nhóm 2: Khoảng Chú ý & Dễ Xao Nhãng (Attention Span)         |
       |  - Câu 4: Bé dễ bị xao nhãng bởi tiếng động nhỏ xung quanh?  |
       |  - Câu 5: Bé chỉ tập trung làm việc liên tục được dưới 10p?  |
       |  - Câu 6: Bé hay bỏ dở giữa chừng để chuyển sang việc khác?  |
       |                                                              |
       |  Nhóm 3: Nhạy Cảm Tổn Thương Tự Ái (RSD)                     |
       |  - Câu 7: Bé dễ xúc động, nản lòng hoặc phản ứng gay gắt?   |
       |  - Câu 8: Bé có xu hướng trốn tránh bài tập vì sợ sai?       |
       |  - Câu 9: Bé cần sự khen ngợi và công nhận nỗ lực tức thì?   |
       |                                                              |
       |       [BỎ QUA (DÙNG MẶC ĐỊNH)]      [LƯU HỒ SƠ NHẬN THỨC]    |
       +--------------------------------------------------------------+
```

### 3.1. Các Bước Thực Hiện Khảo Sát
1. Trên màn hình Trạm Thấu Hiểu (phụ huynh), bấm vào **Huy hiệu Hồ sơ Nhận thức** ở đầu trang (`#parent-cognitive-profile-badge`).
2. Modal khảo sát 9 câu sẽ hiện ra. Phụ huynh đánh giá từng câu theo thang đo Likert 4 mức:
   - `0`: Không bao giờ / Hiếm khi (Điểm thiếu hụt = 0)
   - `1`: Thỉnh thoảng (Điểm thiếu hụt = 1)
   - `2`: Thường xuyên (Điểm thiếu hụt = 2)
   - `3`: Rất thường xuyên (Điểm thiếu hụt = 3)
3. Bấm **"Lưu Hồ Sơ Nhận Thức"** để tính toán. Nếu muốn dùng ngay cấu hình tiêu chuẩn, bấm **"Bỏ qua (Dùng mặc định)"**.

### 3.2. Thuật Toán Tính Điểm & Chuyển Đổi Vector Nhận Thức
Hệ thống tính toán các chỉ số chuẩn hóa trong đoạn $[0.0, 1.0]$:
- **Chỉ số Thiếu hụt Chức năng Điều hành ($I_{EF}$)**:
  $$I_{EF} = \frac{q_1 + q_2 + q_3}{9.0}$$
- **Chỉ số Suy giảm Chú ý ($I_{AS}$)**:
  $$I_{AS} = \frac{q_4 + q_5 + q_6}{9.0}$$
- **Chỉ số Nhạy cảm Thất bại ($I_{RSD}$)**:
  $$I_{RSD} = \frac{q_7 + q_8 + q_9}{9.0}$$
- **Chỉ số Thiếu hụt Hỗn hợp (Composite Deficit Index - $CDI$)**:
  $$CDI = 0.40 \times I_{EF} + 0.35 \times I_{AS} + 0.25 \times I_{RSD}$$

### 3.3. Ánh Xạ Sang Tham Số Can Thiệp & Giàn Giáo
| Chỉ số Đầu Ra | Công Thức Ánh Xạ | Ý Nghĩa Sư Phạm Thần Kinh |
|---|---|---|
| **Khoảng chú ý hữu dụng** | $\text{clamp}\left(5, 25, 25 - \frac{AS}{9} \times 20\right)$ phút | Giới hạn tối đa cả phiên học |
| **Thời lượng vi bước** | $\text{clamp}\left(60, 300, \text{round}\left(\frac{300 - \frac{AS}{9} \times 210}{30}\right) \times 30\right)$ giây | Độ dài đồng hồ Visual Timer cho 1 thẻ |
| **Sức chứa trí nhớ làm việc** | $\text{clamp}\left(1, 5, 5 - \frac{EF}{9} \times 4\right)$ chunks | Số lượng thông tin/dữ kiện nạp đồng thời |
| **Phân tầng RSD** | $RSD \le 2$: LOW; $3-4$: MEDIUM; $5-7$: HIGH; $8-9$: SEVERE | Quyết định mức độ bảo vệ cảm xúc & câu chữ của Milo |
| **Mức giàn giáo ($CDI$)** | $<0.35$: MINIMAL (6 bước); $0.35-0.70$: MODERATE (4 bước); $\ge 0.70$: INTENSIVE (3 bước) | Số bước phân rã tối đa trong một bài tập |

---

## 4. QUY TRÌNH GIAO BÀI PHÍA PHỤ HUYNH (PARENT ASSIGNMENT HUB)

Trạm Thấu Hiểu cung cấp 2 phương thức giao bài độc lập, đáp ứng mọi tình huống học tập:

### 4.1. Hướng 1: Kho Đề Xuất Băm Sẵn (Curriculum Catalog)
Hệ thống tích hợp sẵn 25 bài tập mẫu chuẩn GDPT 2018 trải đều từ Lớp 1 đến Lớp 5 (Toán có lời văn, Tiếng Việt đọc hiểu, Tiếng Anh nhận diện câu) và bài rèn luyện kỹ năng sinh hoạt:
1. **Lọc theo Môn / Chủ đề**: Bấm chọn các chip lọc `Tất cả`, `Toán`, `Tiếng Việt`, `Kỹ năng sống`.
2. **Chọn lẻ hoặc Chọn theo Lô (Batch Selection)**:
   - Tick chọn các ô checkbox trên từng thẻ bài tập.
   - Thẻ thông tin ghim đáy (Sticky Action Bar) tự động cập nhật:
     `Đã chọn: X bài tập | Y bước • ~Z phút • +W ⭐`
3. **Giao Sang Máy Con**: Bấm nút lớn **"🚀 GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!"**.
   - Ngay lập tức, `MiloSyncBus` sẽ bắn sự kiện `TASK_ASSIGN_BATCH` sang máy con.
   - Lộ trình Đảo Bài Tập phía máy trẻ tự động dựng mới các hòn đảo tương ứng mà không cần tải lại trang.

### 4.2. Hướng 2: Tự Giao Bài Mới (Custom Task Assignment)
Chuyển sang tab **"Tự Giao Bài"**:
- **Cơ chế 1: ✨ AI Tự Băm Vi Nhiệm Vụ (AI Decomposition Pipeline)**:
  1. Phụ huynh dán đề bài thô (ví dụ: một bài toán đố trong sách giáo khoa hoặc đoạn văn).
  2. Chọn môn học và khối lớp (Lớp 1–5).
  3. Bấm **"Băm Bài Bằng AI"**.
  4. Backend sẽ lấy `CognitiveProfile` của bé từ khảo sát, kết hợp với đề bài và gửi tới mô hình Gemini thông qua Pipeline 2 chặng:
     - *Chặng 1 (IR Classifier)*: Phân tích thể loại bài, mục tiêu học tập, trích xuất dữ kiện đầu vào và kết quả mẫu.
     - *Chặng 2 (Decomposer)*: Sinh các bước vi nhiệm vụ tuân thủ nghiêm ngặt `schemas/micro_task_schema.json` Draft-07 (1 động từ hành động, thời lượng 60-300s, chỉ dẫn < 15 từ).
     - *Offline Fallback*: Nếu không có kết nối Gemini, máy chủ tự kích hoạt thuật toán sinh bài dự phòng phân tích cú pháp câu tiếng Việt để băm bài theo đúng chuyên môn môn học.
  5. Phụ huynh có thể xem trước các bước vi nhiệm vụ vừa được tạo ra rồi bấm **"Giao Sang Máy Con"**.
- **Cơ chế 2: ✍️ Soạn Bằng Tay Động (Manual Composition)**:
  1. Nhập tiêu đề bài tập.
  2. Tự do thêm/bớt số bước bằng nút **"+ Thêm bước"**.
  3. Chọn loại tương tác (`Trắc nghiệm đơn`, `Nhập văn bản/số`, `Gạch chân từ khóa`).
  4. Nhập chỉ dẫn ngắn gọn và đáp án chuẩn.
  5. Bấm **"Giao Sang Máy Con"**.

---

## 5. BUỒNG LÁI TẬP TRUNG CỦA HỌC SINH (CHILD FOCUS COCKPIT)

Milo Quest mang lại trải nghiệm êm dịu, không áp lực nhưng kích thích chú ý cao độ:

```
        +---------------------------------------------------------+
        |  [⭐ 150 Sao]     [ĐẢO 1: BÁC BA BÁN CAM]     [CỨU TRỢ 🆘] |
        +---------------------------------------------------------+
        |                                                         |
        |             ( ( (  ĐĨA VISUAL TIMER  ) ) )              |
        |                     [ 01 : 45 ]                         |
        |                                                         |
        |   THẺ VI NHIỆM VỤ DUY NHẤT (SINGLE-FOCUS CARD):         |
        |   +-------------------------------------------------+   |
        |   | Bước 1/3: ĐỌC VÀ GẠCH CHÂN DỮ KIỆN              |   |
        |   | Động từ: [Gạch_chân]   Thời lượng: 90s          |   |
        |   |                                                 |   |
        |   | "Bác Ba có [12 quả cam] và [5 quả lê]..."       |   |
        |   |              ^^^^^^^^^^^^   ^^^^^^^^^^          |   |
        |   | (Bé chạm trực tiếp vào các mẩu câu để gạch)     |   |
        |   |                                                 |   |
        |   | [ ✅ ĐÃ HOÀN THÀNH GẠCH CHÂN DỮ KIỆN ]          |   |
        |   +-------------------------------------------------+   |
        |                                                         |
        |              [ TIẾP TỤC BƯỚC TIẾP THEO -> ]             |
        +---------------------------------------------------------+
```

### 5.1. Các Thành Phần Trọng Yếu Phía Máy Con
1. **Bản Đồ Lộ Trình Đảo Bài Tập (Island Roadmap)**:
   - Mọi nhiệm vụ phụ huynh giao (dù 1 bài hay 1 lô bài) được biểu diễn thành các trạm đảo phiêu lưu nối tiếp nhau.
   - Hoàn thành xong đảo này sẽ tự động mở khóa đường đi sang đảo tiếp theo.
2. **Đĩa Đếm Ngược Trực Quan (Visual Timer Disc)**:
   - Sử dụng vòng gradient chuyển màu mượt mà:
     * Màu xanh lá (`#58CC02`): Trạng thái thời gian an toàn.
     * Màu vàng cảnh báo (`#FFC800`): Khi còn dưới 30% thời gian.
     * Màu xanh dương (`#38BDF8`): Khi tạm dừng để thở thư giãn.
   - Tuyệt đối không phát ra âm thanh tích tắc làm tăng hormone cortisol gây căng thẳng ở trẻ ADHD.
3. **Gạch Chân Theo Ngữ Cảnh (Contextual Token Highlighting)**:
   - Thay vì các nút rời rạc vô nghĩa, đề bài được chia tách tự nhiên thành các mẩu câu trôi chảy.
   - Trẻ chạm ngón tay để gạch chân các dữ kiện (ví dụ: số lượng `12 quả cam`, danh từ chính).
   - Nút hoàn thành chỉ sáng lên khi trẻ đã tìm đủ các dữ kiện trọng tâm, rèn luyện kỹ năng quan sát chi tiết.
4. **Kiểm Tra Đáp Số Nghiêm Ngặt & Gợi Ý Dập Tắt RSD (Strict Validation & RSD Shielding)**:
   - Khi trẻ nhập kết quả (ví dụ phép tính `12,5` hoặc `12.5`), hệ thống chuẩn hóa tự động dấu phẩy thập phân theo quy chuẩn toán học Việt Nam.
   - **Nếu kết quả chưa chính xác**: Hệ thống **không bao giờ hiển thị chữ "Sai rồi" hay viền đỏ cảnh báo trừng phạt**. Nút tiếp tục bị khóa với màu xám chuẩn độ tương phản WCAG AA (`#475569`). Robot Milo sẽ đưa ra gợi ý nâng đỡ dịu dàng:
     > *"Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"*
   - **Nếu kết quả chính xác**: Hệ thống nổ hiệu ứng sao trong < 300ms, phát âm thanh vui tai qua Web Audio API, và mở khóa nút Tiếp tục.
5. **Cứu Trợ Robot Milo & Bài Tập Thở Hộp 4-4-4 (Box Breathing)**:
   - Khi cảm thấy căng thẳng, quá tải hay bối rối, trẻ bấm nút **"Cứu trợ 🆘"**.
   - Đồng hồ đếm ngược lập tức tạm dừng. Robot Milo xuất hiện hướng dẫn trẻ điều hòa nhịp tim và hệ thần kinh giao cảm bằng nhịp thở hộp:
     * Hít vào nhẹ nhàng bằng mũi (4 giây)
     * Giữ hơi êm dịu trong lồng ngực (4 giây)
     * Thở ra từ từ bằng miệng (4 giây)
     * Tĩnh lặng thư giãn (4 giây)
   - Sau khi hoàn thành bài thở, trẻ lấy lại bình tĩnh và tiếp tục làm bài.
6. **Rương Báu & Đổi Vé Vàng (Golden Ticket)**:
   - Vượt qua các đảo bài tập, trẻ tích lũy điểm sao Dopamine và mở khóa Rương kho báu.
   - Trẻ có thể bấm đổi **Vé Vàng** (phần thưởng đời thực đã thống nhất với bố mẹ: 30 phút xem hoạt hình, đi ăn kem, đi chơi công viên).
   - Yêu cầu đổi vé bắn thông báo lập tức sang Trạm Thấu Hiểu để bố mẹ bấm nút **"Duyệt Vé"**.

---

## 6. BẢN SẮC THỊ GIÁC PHÂN BIỆT: ĐẢO SINH HOẠT vs ĐẢO BÀI TẬP

Để giúp não bộ trẻ ADHD dễ dàng chuyển đổi trạng thái tâm lý giữa sinh hoạt thường nhật và học tập chuyên sâu, giao diện được phân tách bằng 2 bộ màu sắc trực quan rõ rệt:

```
+------------------------------------+------------------------------------+
|     ĐẢO SINH HOẠT (ROUTINES)       |     ĐẢO BÀI TẬP (ACADEMICS)        |
+------------------------------------+------------------------------------+
| - Gam màu: Vàng hổ phách (Amber)   | - Gam màu: Ngọc lam / Mòng két     |
|   ấm áp, êm dịu, không áp lực      |   (Teal/Emerald/Sky) tập trung sâu |
| - Nút bấm 3D: `.btn-3d-amber`      | - Nút bấm 3D: `.btn-3d-green`      |
| - Biểu tượng: 🛏️, 🎒, 🧹, 🥛       | - Biểu tượng: 🔢, 📖, 📐, 📝       |
| - Giảm bớt căng thẳng khi làm việc | - Kích thích chú ý thị giác và tư  |
|   nhà, dọn dẹp, chuẩn bị sách vở   |   duy giải quyết vấn đề            |
+------------------------------------+------------------------------------+
```

### Tiêu Chuẩn Tiếp Cận WCAG AA
Toàn bộ các thành phần hiển thị, từ nhãn hướng dẫn, ô nhập liệu, đến nút bấm vô hiệu hóa (`.btn-disabled` với mã màu `#475569`) đều được kiểm định đạt tỷ lệ tương phản tối thiểu **$\ge 4.5:1$**, bảo đảm trẻ quan sát rõ ràng trong mọi điều kiện ánh sáng phòng học mà không mỏi mắt.

---

## 7. HƯỚNG DẪN KIỂM THỬ TỰ ĐỘNG & KIỂM ĐỊNH HỆ THỐNG (TESTING & VERIFICATION)

Hệ thống được trang bị bộ kiểm thử tự động đa tầng (Multi-Tier E2E & Adversarial Suites) bảo đảm 100% tính đúng đắn và không phát sinh lỗi hồi quy.

### 7.1. Chạy Toàn Bộ Test Suite Python (Runner Thống Nhất)
Chạy lệnh sau tại thư mục gốc:
```powershell
python tests/runner.py
```
**Kết quả mong đợi:**
- Trình chạy sẽ tự động khám phá toàn bộ các file `test_*.py` trong `tests/` và `tests/e2e/`.
- Thực thi toàn bộ 349 bài kiểm thử (bao gồm 330 bài gốc và 19 bài kiểm định hồi quy R7).
- Báo cáo kết quả: `ALL E2E TESTS PASSED SUCCESSFULLY (STATUS: GREEN)` với mã thoát `exit code 0`.

### 7.2. Chạy Riêng Module Kiểm Định Hồi Quy R7 (`test_r7_refactor_regression.py`)
```powershell
python -m unittest tests/e2e/test_r7_refactor_regression.py -v
```
Kiểm định chi tiết 5 hạng mục của R7:
1. `test_01` đến `test_04`: Toàn vẹn cấu trúc thư mục `docs/research/` (4 files), `docs/reports/` (2 files), `docs/infra/` (2 files) và `scratch/prompt_experiment_report.md` chứa "RSD".
2. `test_05` đến `test_08`: Thuật toán tính điểm khảo sát phụ huynh, trọng số $CDI = 0.40 I_{EF} + 0.35 I_{AS} + 0.25 I_{RSD}$, giới hạn thời lượng 60s–300s và 4 bậc enum RSD.
3. `test_09` đến `test_11`: Tuân thủ chuẩn JSON Schema Draft-07, động từ hành động đơn nhất (`^[a-zA-ZÀ-ỹ_]+$`) và thời lượng 60-300s.
4. `test_12` đến `test_14`: Logic kiểm tra đáp án nghiêm ngặt, chuẩn hóa dấu phẩy kiểu Việt Nam (`12,5` == `12.5`), từ chối đáp án sai.
5. `test_15` đến `test_19`: Ràng buộc giao diện `#parent-survey-modal`, `#parent-cognitive-profile-badge`, `.btn-3d-amber`, `.btn-disabled` chuẩn WCAG AA (`#475569`), và khung ghim đáy giao lô bài tập.

### 7.3. Chạy Toàn Bộ 8 Bộ Kiểm Thử Nghịch Đảo Node.js (Adversarial Suites)
Chạy lệnh sau trong PowerShell:
```powershell
Get-ChildItem -Path tests/adversarial/*.js | ForEach-Object { 
    Write-Host "Running $($_.Name)..." -ForegroundColor Cyan
    node $_.FullName
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```
8 bộ kiểm thử nghịch đảo bao gồm:
1. `test_adhd_ui_ergonomics_adversarial.js`: Kiểm tra chống kẹt cuộn và chống cắt cụt checkbox trên khung điện thoại 370px.
2. `test_challenger_curriculum_ui.js`: Kiểm tra hiển thị kho 25 bài tập và giao lô nhiệm vụ.
3. `test_challenger_storage_cheer_stress.js`: Kiểm thử áp lực đồng bộ đa tab, nghẽn mạng và tự phục hồi localStorage.
4. `test_m3_ai_decomposition_interactive_stages.js`: Kiểm tra phân rã AI, gạch chân từ khóa ngữ cảnh và xác thực đáp số.
5. `test_m4_ergonomics_contrast_themes.js`: Kiểm tra độ tương phản WCAG AA và màu sắc phân biệt Đảo sinh hoạt vs Đảo bài tập.
6. `test_milo_sync_adversarial.js`: Kiểm tra độ trễ đồng bộ bus dưới 300ms.
7. `test_parent_survey_cognitive_profile.js`: Kiểm tra tính toán tương đương giữa JavaScript và Python scoring service (1000 tổ hợp điểm).
8. `test_whitebox_sync_simulator_adversarial.js`: Kiểm thử hộp trắng giải thuật chống lặp sự kiện và dòng đời Vé Vàng.

---

## 8. DANH MỤC THƯ MỤC DỰ ÁN (PROJECT REPOSITORY LAYOUT)

```
calm-bardeen/
├── index.html                   # Ứng dụng Web Kép (Milo Quest x Trạm Thấu Hiểu)
├── USER_GUIDE.md                # Hướng dẫn sử dụng tổng quan toàn diện (Root)
├── package.json                 # Cấu hình dự án (nếu có)
├── requirements.txt             # Thư viện Python phụ thuộc
│
├── docs/                        # Tài liệu dự án đã chuẩn hóa
│   ├── USER_GUIDE.md            # Bản sao hướng dẫn sử dụng trong docs/
│   ├── research/                # Nghiên cứu lý thuyết & y văn lâm sàng ADHD
│   │   ├── AI Can Thiệp ADHD.md
│   │   ├── AI Parent Coach (1).md
│   │   ├── Nguyên nhân và Giải pháp.md
│   │   └── Ứng dụng AI cho ADHD (1).md
│   ├── reports/                 # Báo cáo đối chuẩn & đánh giá mô hình
│   │   ├── BENCHMARK_SUMMARY.md
│   │   └── benchmark_report.json
│   └── infra/                   # Tài liệu hạ tầng kiểm thử
│       ├── TEST_INFRA.md
│       └── TEST_READY.md
│
├── data/                        # Dữ liệu khảo sát & kho bài tập
│   ├── surveys/                 # Khảo sát lâm sàng ADHD 9 câu
│   │   └── adhd_parent_survey.json
│   └── curriculum/              # 25 bài tập đối chuẩn GDPT 2018 Lớp 1-5
│       └── grade_1_to_5_benchmark.json
│
├── schemas/                     # Quy chuẩn JSON Schema Draft-07
│   └── micro_task_schema.json   # Chuẩn dữ liệu vi nhiệm vụ ADHD
│
├── prompts/                     # Hệ thống System Prompts phân rã 2 chặng
│   ├── stage1_ir_classifier.txt
│   ├── stage2_micro_task_decomposer.txt
│   ├── stage3_encouragement_generator.txt
│   └── stage4_pedagogical_judge.txt
│
├── scratch/                     # Báo cáo thực nghiệm & kiểm tra nghiêm ngặt
│   └── prompt_experiment_report.md # Báo cáo Strict Guardrail (bảo toàn prompts gốc)
│
├── src/                         # Mã nguồn Backend
│   ├── adhd_scoring/            # Dịch vụ tính điểm nhận thức Python
│   │   └── scoring_service.py
│   └── api/                     # Máy chủ FastAPI & WebSocket
│       └── server.py
│
└── tests/                       # Bộ kiểm thử tự động toàn diện
    ├── runner.py                # Trình chạy kiểm thử hợp nhất
    ├── e2e/                     # Bộ kiểm thử End-to-End & Hồi quy
    │   ├── test_r1_survey.py
    │   ├── test_r2_curriculum.py
    │   ├── test_r3_schema_prompts.py
    │   ├── test_runner.py
    │   ├── test_dual_app_e2e.py
    │   └── test_r7_refactor_regression.py # Bộ kiểm thử hồi quy R7 mới
    └── adversarial/             # 8 bộ kiểm thử nghịch đảo Node.js
```

---
*Bản quyền phát triển thuộc về Nhóm R&D Can Thiệp ADHD Công Nghệ Cao (2026).*
