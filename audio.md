# KẾ HOẠCH & KỊCH BẢN THIẾT KẾ HỆ THỐNG ÂM THANH MILO VOICE
> Nhánh Git: adding_audio  
> Phiên bản: v1.1-clean-text-for-tts  
> Mục tiêu: Tích hợp trợ lý giọng nói Milo (ElevenLabs / Web Speech API). Toàn bộ nội dung lời thoại đã được lọc sạch biểu tượng cảm xúc (emoji/emote) để sẵn sàng trích xuất và nạp trực tiếp vào engine Text-to-Speech mà không lo lỗi phát âm hay đọc nhầm ký tự đặc biệt.

---

## 1. TRIẾT LÝ SƯ PHẠM ADHD & NGUYÊN TẮC ÂM THANH

1. Nguyên tắc dưới 4 giây (Micro-Audio):
   - Không đọc đề bài dài. Chỉ đọc: Động từ hành động + Mục tiêu (Action Verb + Target).
   - Ví dụ: "Chạm gạch chân chiều dài và chiều rộng nào!" (Thời lượng: 2.5 giây).

2. Dual-Channel Anchoring (Đồng bộ Mắt và Tai):
   - Khi giọng nói phát ra, phần header hoặc vùng tương tác trên màn hình phát sáng nhẹ để mắt và tai của bé cùng neo vào một điểm tập trung.

3. Định Hướng Không Phán Xét (No-Fault Redirection):
   - Tuyệt đối không dùng từ ngữ gây tự ái như "Sai rồi", "Tính ẩu thế", "Chú ý hơn nào".
   - Thay bằng tâm thế đồng minh khám phá: "Úi chà, suýt trúng rồi! Thử lại chìa khóa khác xem sao!".

4. Lịch Sự Giác Quan:
   - Có nút bật tắt âm thanh và icon loa nhỏ cạnh mỗi bước để bé chủ động nghe lại khi cần.
   - Tự động ngắt câu cũ khi chuyển bước để không nói đè.

---

## 2. KỊCH BẢN THEO CÁC LOẠI GIAO DIỆN CHUẨN (GENERIC UI SCRIPTS)

Gom cụm theo các ui_type cốt lõi của hệ thống để tái sử dụng tối đa:

* ui_type: highlight (Chạm gạch chân từ khóa, số liệu):
  "Thám tử ơi, chạm tay gạch chân những số liệu và từ khóa quan trọng nào!"

* ui_type: single_choice (Chọn 1 đáp án, chọn phép tính, chọn ý nghĩa):
  "Quan sát kỹ và chạm vào chiếc hộp có đáp án đúng nhất nhé!"

* ui_type: text_input (Gõ kết quả số học, điền đáp số):
  "Tuyệt lắm! Bây giờ gõ kết quả vào ô để mở rương kho báu nào!"

* ui_type: checkbox (Đánh dấu xác nhận hoàn thành công việc):
  "Làm xong rồi thì chạm vào ô vuông để tích hoàn thành nhé!"

* ui_type: photo_proof (Chụp ảnh minh chứng gửi phụ huynh):
  "Bây giờ hãy chụp một bức ảnh thật đẹp gửi cho bố mẹ ngay nào!"

* ui_type: timer_brush (Đồng hồ đếm ngược tự động chải răng 30s):
  "Bắt đầu chải xoay tròn êm tay nào! Khi chuông reo sẽ tự chuyển bước nhé!"

---

## 3. KỊCH BẢN BÀI TẬP GDPT 2018 ĐẶC THÙ (SPECIFIC STUDY TASKS)

* Dạng Hình Học Trực Quan SVG (geometry):
  - Bước 1 (Quan sát hình và lấy số đo):
    "Nhìn hình vẽ phía trên kìa! Chạm vào số đo các cạnh để lấy dữ liệu nhé!"
  - Bước 2 (Chọn công thức chu vi hoặc diện tích):
    "Muốn tính diện tích hay chu vi nhỉ? Chọn đúng thần chú công thức nào!"
  - Bước 3 (Tính toán kết quả):
    "Thay số vào công thức rồi gõ kết quả vào ô nào!"

* Dạng Đọc Hiểu Tiếng Việt (reading_comprehension):
  - Bước 1 (Soi đoạn trích dẫn phía trên):
    "Đoạn văn ở ngay phía trên! Con lướt mắt tìm từ khóa Milo ghim nhé!"
  - Bước 2 (Tìm chi tiết trong câu chuyện):
    "Ai vừa xuất hiện trong câu chuyện nhỉ? Chọn đáp án đúng nào!"

* Dạng Đố Tìm X (multi_item_find_x):
  - Bước 1 (Xác định vai trò của X):
    "Anh bạn X đang đóng vai gì trong phép tính này nhỉ? Chọn vai trò của X nào!"
  - Bước 2 (Chọn quy tắc tìm X):
    "Muốn tìm anh bạn X này, chúng mình dùng phép tính gì đây?"

* Dạng Phép Tính Có Nhớ & Nhiều Chữ Số (pure_arithmetic):
  - Bước 1 (Tính hàng đơn vị):
    "Cùng tính hàng đơn vị trước nào! Nhớ giữ lại phần nhớ trong đầu nhé!"
  - Bước 2 (Tính hàng chục):
    "Bây giờ cộng thêm số nhớ vào hàng chục để ra đáp số cuối cùng nào!"

* Dạng Tiếng Anh (eng):
  - Bước 1 (Nhận diện từ vựng):
    "Lắng nghe và chạm vào từ vựng tiếng Anh tương ứng nào!"
  - Bước 2 (Ghép câu hoặc chọn nghĩa):
    "Chọn nghĩa tiếng Việt chính xác của từ này nhé!"

---

## 4. KỊCH BẢN CÁC BÀI NỀ NẾP SINH HOẠT THỰC TẾ (ROUTINES & CHORES)

Nói rõ ràng từng hành động cơ bắp cụ thể, và hướng dẫn chi tiết cả thao tác thực hiện lẫn chụp ảnh minh chứng:

### Routine 1: Gấp chăn gối phẳng phiu sau khi thức dậy (routine_morning_bed)
* Bước 1 (Ảnh giường ngái ngủ): "Hãy giơ máy lên chụp một bức ảnh chiếc giường lúc vừa thức dậy để làm mốc nào!"
* Bước 2 (Giũ phẳng chăn): "Cầm hai mép chăn giũ nhẹ để chăn trải thật phẳng phiu trên mặt giường nhé!"
* Bước 3 (Gấp đôi chăn & xếp gối): "Gấp đôi chăn theo chiều dọc rồi gấp thành hình vuông, và xếp gối ngay ngắn sát đầu giường nào!"
* Bước 4 (Minh chứng giường 5 sao): "Chiếc giường đã phẳng phiu đẹp đẽ rồi! Chụp một bức ảnh chiếc giường năm sao gửi mẹ ngay nào!"

### Routine 2: Tự mặc đồng phục và đeo thẻ học sinh (routine_morning_outfit)
* Bước 1 (Mặc áo cài cúc): "Mặc áo đồng phục và cài các nút cúc thẳng hàng từ trên xuống dưới nhé!"
* Bước 2 (Đeo thẻ học sinh): "Lấy dây thẻ học sinh đeo vào cổ ngay ngắn trước ngực nào!"
* Bước 3 (Minh chứng chỉn chu): "Chỉnh trang phục thật ngay ngắn rồi chụp một bức ảnh gửi mẹ trước khi đi học nào!"

### Routine 3: Hạ cánh tan trường: Cất giày, treo balo và bỏ bình nước (routine_afterschool_drop)
* Bước 1 (Xếp giày lên kệ): "Cởi giày ra và đặt ngay ngắn lên tầng kệ dép của con nhé!"
* Bước 2 (Treo balo lên móc): "Treo quai cặp lên chiếc móc treo tường quen thuộc nào!"
* Bước 3 (Bỏ bình nước ra bồn rửa): "Mở cặp lấy bình nước mang từ trường về đặt vào bồn rửa bát để rửa sạch nhé!"
* Bước 4 (Minh chứng trạm hạ cánh): "Chụp một bức ảnh kệ dép, cặp và bình nước đã đặt đúng chỗ gửi mẹ nào!"

### Routine 4: Rửa tay xà phòng 6 bước và thay đồ nhà (routine_afterschool_wash)
* Bước 1 (Bơm xà phòng xoa bọt): "Bơm một lần xà phòng, xoa đều lòng bàn tay, mu bàn tay và các kẽ ngón trong ba mươi giây nào!"
* Bước 2 (Xả sạch & Treo đồng phục): "Xả sạch bọt dưới vòi nước, lau khô tay và thay bộ quần áo ở nhà thật thoải mái nhé!"
* Bước 3 (Minh chứng tay sạch): "Đưa hai bàn tay ra trước máy và chụp một bức ảnh đôi tay sạch thơm tho gửi mẹ nào!"

### Routine 5: Thưởng thức bữa xế nạp năng lượng chiều (routine_afterschool_snack)
* Bước 1 (Rửa tay xà phòng): "Rửa hai bàn tay thật sạch với xà phòng dưới vòi nước trước khi ăn xế nhé!"
* Bước 2 (Ăn bữa phụ nhẹ nhàng): "Thưởng thức sữa hoặc đĩa trái cây tươi để nạp lại năng lượng sau giờ học nào!"
* Bước 3 (Dọn đĩa cốc & Chụp ảnh): "Bê đĩa cốc đã ăn xong đặt vào bồn rửa và chụp một bức ảnh bàn ăn sạch sẽ gửi mẹ nhé!"

### Routine 6: Dọn bàn học gọn gàng trong 5 phút (routine_clean_desk)
* Bước 1 (Thu gom bút thước): "Thu gom tất cả bút và thước rải rác trên bàn cắm gọn vào ống đựng bút nào!"
* Bước 2 (Gom rác vào sọt): "Nhặt sạch các mẩu giấy vụn và rác trên bàn bỏ vào sọt rác dưới gầm bàn nhé!"
* Bước 3 (Xếp sách vở thành chồng): "Xếp các cuốn sách vở thành một chồng ngay ngắn ở góc bàn bên trái nào!"
* Bước 4 (Minh chứng bàn sáng bóng): "Mặt bàn đã sạch bóng rồi! Chụp một bức ảnh bàn học ngăn nắp gửi mẹ nhận thưởng ngay nào!"

### Routine 7: Tự lập chuẩn bị mâm cơm gia đình (routine_dinner_prep)
* Bước 1 (Lò vi sóng): "Cho đĩa thức ăn vào lò vi sóng, chỉnh hai phút rồi bấm nút bắt đầu nhé!"
* Bước 2 (Bếp đun hâm canh): "Bật bếp nhỏ hâm nóng nồi canh trong lúc lò vi sóng đang chạy ngầm nào!"
* Bước 3 (Lấy bát đũa & xới cơm): "Lấy bát đũa, thìa và xới các bát cơm nóng ra bàn ăn cho cả nhà nhé!"
* Bước 4 (Minh chứng mâm cơm tươm tất): "Dùng lót tay bê các món ra bàn và chụp một bức ảnh mâm cơm tươm tất gửi mẹ nào!"

### Routine 8: Soát thời khóa biểu và xếp sách vở ngày mai (routine_pack_schoolbag)
* Bước 1 (Xem thời khóa biểu): "Mở bảng thời khóa biểu trên tường và đối chiếu các môn học của ngày mai nào!"
* Bước 2 (Xếp chồng sách vở lên bàn): "Lấy đủ sách vở và hộp bút của ngày mai xếp thành một chồng ngay ngắn trên mặt bàn nhé!"
* Bước 3 (Minh chứng chồng sách trên bàn): "Chụp một bức ảnh cận cảnh chồng sách vở và hộp bút trên bàn để mẹ kiểm tra nào!"
* Bước 4 (Cất vào cặp & Kéo khóa): "Cất toàn bộ sách vở vào cặp, kéo khóa lại và đặt ngay ngắn cạnh cửa nhé!"

### Routine 9: Đánh răng đúng cách 2 phút buổi tối (routine_night_teeth)
* Bước 1 (Bóp kem hạt đậu): "Hãy lấy tuýp kem bóp một lượng nhỏ bằng hạt đậu lên đầu bàn chải nhé!"
* Bước 2 (Hàm trên 30s): "Bây giờ đưa bàn chải lên hàm trên, chải xoay tròn đều khắp các mặt răng trong ba mươi giây nào!"
* Bước 3 (Hàm dưới 30s): "Chuyển xuống chải đều khắp các mặt răng của hàm dưới trong ba mươi giây nhé!"
* Bước 4 (Nụ cười răng thơm trước gương): "Súc miệng thật sạch rồi đứng trước gương chụp một bức ảnh cười tươi khoe hàm răng trắng sạch gửi mẹ nào!"

### Routine 10: Tắt màn hình và đọc truyện 5 phút (routine_bedtime_screen_off)
* Bước 1 (Cất thiết bị ra bàn): "Tắt màn hình điện thoại hoặc máy tính bảng và mang ra đặt trên bàn của bố mẹ nào!"
* Bước 2 (Đọc sách giấy thư giãn): "Nằm trên giường và đọc vài trang sách truyện yêu thích để thư giãn não bộ nhé!"
* Bước 3 (Minh chứng sách gập ngủ ngon): "Gập sách lại đặt đầu giường và chụp một bức ảnh trước khi tắt đèn đi ngủ nào!"

---

## 5. KỊCH BẢN PHỤ TRỢ HÀNH VI (EVENT-DRIVEN & BEHAVIORAL SCRIPTS)

### 1. Khi Con Bấm Chưa Trúng (No-Fault Redirection)
* Lần 1 (Tò mò, vui vẻ):
  "Úi chà, suýt trúng rồi! Thử lại chiếc chìa khóa khác xem sao!"
* Lần 2 (Nhẹ nhàng soi lại):
  "Ủa kì lạ ta? Manh mối này hơi lệch một tẹo, Milo cùng bạn ngắm lại nhé!"
* Lần 3 (Milo Rescue chiếu đèn pin):
  "Đừng lo nhé! Để Milo chiếu đèn pin làm mờ các ô sai giúp bạn nha!"

### 2. Khi Con Lơ Đãng Hoặc Ngồi Im (Inactivity Watcher)
* Sau 25 giây không chạm màn hình (Đánh thức nhẹ nhàng):
  "Cốc cốc! Thám tử ơi, bạn đang nghĩ đến đâu rồi?"
* Sau 50 giây không chạm màn hình (Đề nghị cứu viện):
  "Có bước nào hơi khó không? Cậu có muốn bấm nút Milo để được gợi ý không nè?"

### 3. Vòng Đếm Thời Gian (Timer Events)
* Còn 10 giây cuối:
  "Mười giây đếm ngược! Bình tĩnh về đích nào bạn ơi!"
* Khi hết giờ (Tặng thêm giờ, không trừ điểm):
  "Hết giờ mất rồi, nhưng không sao cả! Milo tặng thêm cho bạn một ít thời gian để hoàn thành nè!"

### 4. Bài Tập Thở Bụng Hạ Nhiệt 4-4-4 (Box Breathing)
* Pha 1 (Hít vào 4 giây):
  "Hít sâu vào bằng mũi nào... căng tròn bụng lên..."
* Pha 2 (Giữ hơi 4 giây):
  "Giữ hơi êm dịu... cảm nhận sự bình yên..."
* Pha 3 (Thở ra 4 giây):
  "Thở nhẹ nhàng ra bằng miệng... như thổi nguội bát súp..."
* Pha 4 (Thả lỏng 4 giây):
  "Thả lỏng hai vai... Sẵn sàng quay lại rồi nè!"

### 5. Cổ Vũ Chinh Phục Chuỗi Đảo Trên Roadmap (Island Progression Pacing)
> ⚠️ **NGUYÊN TẮC SƯ PHẠM ADHD QUAN TRỌNG:**
> - Tuyệt đối **KHÔNG** chèn audio giọng nói vào giữa các vi nhiệm vụ (microtasks) khi bé đang làm bài để tránh đứt mạch tư duy và làm mệt tai (giữa các bước chỉ dùng hiệu ứng nổ sao SFX).
> - Giàn âm thanh `progress_*` và `reward_island_win` được dùng để **thay đổi linh hoạt theo tiến trình chuỗi ĐẢO trên Roadmap** (Island Progression Pacing), tránh lặp lại nhàm chán mỗi khi hoàn thành đảo.

* **Đảo đầu tiên vừa hoàn thành**:
  Luân phiên giữa:
  - "Hoan hô! Bạn vừa chinh phục thêm một hòn đảo kỳ thú! Bố mẹ sẽ tự hào lắm đấy!" (`reward_island_win`)
  - "Tiếp tục tiến lên nào!" (`progress_next`)
* **Đảo ở nửa chặng đường lộ trình** (ví dụ đảo 2/4):
  "Cố lên! Ta đi được nửa chặng đường rồi!" (`progress_halfway`)
* **Đảo áp chót** (chỉ còn 1 đảo nữa là tới đích):
  "Chỉ còn một bước nữa là tới đích rồi!" (`progress_almost`)
* **Đảo cuối cùng** (về đích mở Rương Báu Hoàng Kim):
  "Tuyệt vời! Chúng mình đã về đích rồi!" (`progress_finish`)
* Khi bấm gửi ảnh minh chứng:
  "Tách! Bức ảnh xịn xò đã bay sang máy bố mẹ rồi! Bố mẹ sẽ tự hào về bạn lắm đấy!"
* Khi đổi vé vàng thành công:
  "Ting ting! Chiếc vé vàng đã bay thẳng sang máy của bố mẹ rồi! Chờ bố mẹ mở quà nhé!"
