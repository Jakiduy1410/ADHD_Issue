"""
Script: Generate Full Audio Assets via Vietnamese Neural Voice (vi-VN-NamMinhNeural)
Engine: edge-tts (High quality Vietnamese, 100% free, natural pacing)
Voice: vi-VN-NamMinhNeural
Output Directory: data/audio/
Manifest: data/audio/manifest.json
"""

import os
import sys
import json
import asyncio
from pathlib import Path
import edge_tts

VOICE = "vi-VN-NamMinhNeural"
RATE = "+6%"
PITCH = "+2Hz"

BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "data" / "audio"

AUDIO_ITEMS = [
    # 1. Generic UI Actions
    {
        "category": "generic_ui",
        "key": "highlight",
        "file_name": "highlight.mp3",
        "text": "Thám tử ơi, chạm tay gạch chân những số liệu và từ khóa quan trọng nào!"
    },
    {
        "category": "generic_ui",
        "key": "single_choice",
        "file_name": "single_choice.mp3",
        "text": "Quan sát kỹ và chạm vào chiếc hộp có đáp án đúng nhất nhé!"
    },
    {
        "category": "generic_ui",
        "key": "text_input",
        "file_name": "text_input.mp3",
        "text": "Tuyệt lắm! Bây giờ gõ kết quả vào ô để mở rương kho báu nào!"
    },
    {
        "category": "generic_ui",
        "key": "checkbox",
        "file_name": "checkbox.mp3",
        "text": "Làm xong rồi thì chạm vào ô vuông để tích hoàn thành nhé!"
    },
    {
        "category": "generic_ui",
        "key": "photo_proof",
        "file_name": "photo_proof.mp3",
        "text": "Bây giờ hãy chụp một bức ảnh thật đẹp gửi cho bố mẹ ngay nào!"
    },
    {
        "category": "generic_ui",
        "key": "timer_brush",
        "file_name": "timer_brush.mp3",
        "text": "Bắt đầu chải xoay tròn êm tay nào! Khi chuông reo sẽ tự chuyển bước nhé!"
    },

    # 2. Specific Study Tasks
    {
        "category": "study_special",
        "key": "geometry_step1_dims",
        "file_name": "geometry_step1_dims.mp3",
        "text": "Nhìn hình vẽ phía trên kìa! Chạm vào số đo các cạnh để lấy dữ liệu nhé!"
    },
    {
        "category": "study_special",
        "key": "geometry_step2_formula",
        "file_name": "geometry_step2_formula.mp3",
        "text": "Muốn tính diện tích hay chu vi nhỉ? Chọn đúng thần chú công thức nào!"
    },
    {
        "category": "study_special",
        "key": "geometry_step3_calc",
        "file_name": "geometry_step3_calc.mp3",
        "text": "Thay số vào công thức rồi gõ kết quả vào ô nào!"
    },
    {
        "category": "study_special",
        "key": "reading_step1_passage",
        "file_name": "reading_step1_passage.mp3",
        "text": "Đoạn văn ở ngay phía trên! Con lướt mắt tìm từ khóa Milo ghim nhé!"
    },
    {
        "category": "study_special",
        "key": "reading_step2_character",
        "file_name": "reading_step2_character.mp3",
        "text": "Ai vừa xuất hiện trong câu chuyện nhỉ? Chọn đáp án đúng nào!"
    },
    {
        "category": "study_special",
        "key": "find_x_step1_role",
        "file_name": "find_x_step1_role.mp3",
        "text": "Anh bạn X đang đóng vai gì trong phép tính này nhỉ? Chọn vai trò của X nào!"
    },
    {
        "category": "study_special",
        "key": "find_x_step2_rule",
        "file_name": "find_x_step2_rule.mp3",
        "text": "Muốn tìm anh bạn X này, chúng mình dùng phép tính gì đây?"
    },
    {
        "category": "study_special",
        "key": "arithmetic_step1_units",
        "file_name": "arithmetic_step1_units.mp3",
        "text": "Cùng tính hàng đơn vị trước nào! Nhớ giữ lại phần nhớ trong đầu nhé!"
    },
    {
        "category": "study_special",
        "key": "arithmetic_step2_tens",
        "file_name": "arithmetic_step2_tens.mp3",
        "text": "Bây giờ cộng thêm số nhớ vào hàng chục để ra đáp số cuối cùng nào!"
    },
    {
        "category": "study_special",
        "key": "english_step1_vocab",
        "file_name": "english_step1_vocab.mp3",
        "text": "Lắng nghe và chạm vào từ vựng tiếng Anh tương ứng nào!"
    },
    {
        "category": "study_special",
        "key": "english_step2_meaning",
        "file_name": "english_step2_meaning.mp3",
        "text": "Chọn nghĩa tiếng Việt chính xác của từ này nhé!"
    },

    # 3. Behavioral & Contextual Responses
    {
        "category": "behavioral",
        "key": "wrong_attempt_1",
        "file_name": "wrong_attempt_1.mp3",
        "text": "Úi chà, suýt trúng rồi! Thử lại chiếc chìa khóa khác xem sao!"
    },
    {
        "category": "behavioral",
        "key": "wrong_attempt_2",
        "file_name": "wrong_attempt_2.mp3",
        "text": "Ủa kì lạ ta? Manh mối này hơi lệch một tẹo, Milo cùng bạn ngắm lại nhé!"
    },
    {
        "category": "behavioral",
        "key": "wrong_attempt_3_rescue",
        "file_name": "wrong_attempt_3_rescue.mp3",
        "text": "Đừng lo nhé! Để Milo chiếu đèn pin làm mờ các ô sai giúp bạn nha!"
    },
    {
        "category": "behavioral",
        "key": "idle_nudge_25s",
        "file_name": "idle_nudge_25s.mp3",
        "text": "Cốc cốc! Thám tử ơi, bạn đang nghĩ đến đâu rồi?"
    },
    {
        "category": "behavioral",
        "key": "idle_rescue_50s",
        "file_name": "idle_rescue_50s.mp3",
        "text": "Có bước nào hơi khó không? Cậu có muốn bấm nút Milo để được gợi ý không nè?"
    },
    {
        "category": "behavioral",
        "key": "timer_10s_warning",
        "file_name": "timer_10s_warning.mp3",
        "text": "Mười giây đếm ngược! Bình tĩnh về đích nào bạn ơi!"
    },
    {
        "category": "behavioral",
        "key": "timer_timeout_bonus",
        "file_name": "timer_timeout_bonus.mp3",
        "text": "Hết giờ mất rồi, nhưng không sao cả! Milo tặng thêm cho bạn một ít thời gian để hoàn thành nè!"
    },
    {
        "category": "behavioral",
        "key": "breathe_phase1_inhale",
        "file_name": "breathe_phase1_inhale.mp3",
        "text": "Hít sâu vào bằng mũi nào... căng tròn bụng lên..."
    },
    {
        "category": "behavioral",
        "key": "breathe_phase2_hold",
        "file_name": "breathe_phase2_hold.mp3",
        "text": "Giữ hơi êm dịu... cảm nhận sự bình yên..."
    },
    {
        "category": "behavioral",
        "key": "breathe_phase3_exhale",
        "file_name": "breathe_phase3_exhale.mp3",
        "text": "Thở nhẹ nhàng ra bằng miệng... như thổi nguội bát súp..."
    },
    {
        "category": "behavioral",
        "key": "breathe_phase4_relax",
        "file_name": "breathe_phase4_relax.mp3",
        "text": "Thả lỏng hai vai... Sẵn sàng quay lại rồi nè!"
    },
    {
        "category": "behavioral",
        "key": "reward_step_win",
        "file_name": "reward_step_win.mp3",
        "text": "Thêm sao vào túi!"
    },
    {
        "category": "behavioral",
        "key": "reward_photo_sent",
        "file_name": "reward_photo_sent.mp3",
        "text": "Tách! Bức ảnh xịn xò đã bay sang máy bố mẹ rồi! Bố mẹ sẽ tự hào về bạn lắm đấy!"
    },
    {
        "category": "behavioral",
        "key": "reward_island_win",
        "file_name": "reward_island_win.mp3",
        "text": "Hoan hô! Bạn vừa chinh phục thêm một hòn đảo kỳ thú! Bố mẹ sẽ tự hào lắm đấy!"
    },
    {
        "category": "behavioral",
        "key": "reward_golden_ticket",
        "file_name": "reward_golden_ticket.mp3",
        "text": "Ting ting! Chiếc vé vàng đã bay thẳng sang máy của bố mẹ rồi! Chờ bố mẹ mở quà nhé!"
    },

    # 4. Routine: Gấp chăn gối (routine_morning_bed)
    {
        "category": "routines/routine_morning_bed",
        "key": "routine_morning_bed_step1",
        "file_name": "step1_photo_start.mp3",
        "text": "Hãy giơ máy lên chụp một bức ảnh chiếc giường lúc vừa thức dậy để làm mốc nào!"
    },
    {
        "category": "routines/routine_morning_bed",
        "key": "routine_morning_bed_step2",
        "file_name": "step2_shake_blanket.mp3",
        "text": "Cầm hai mép chăn giũ nhẹ để chăn trải thật phẳng phiu trên mặt giường nhé!"
    },
    {
        "category": "routines/routine_morning_bed",
        "key": "routine_morning_bed_step3",
        "file_name": "step3_fold_blanket.mp3",
        "text": "Gấp đôi chăn theo chiều dọc rồi gấp thành hình vuông, và xếp gối ngay ngắn sát đầu giường nào!"
    },
    {
        "category": "routines/routine_morning_bed",
        "key": "routine_morning_bed_step4",
        "file_name": "step4_photo_finish.mp3",
        "text": "Chiếc giường đã phẳng phiu đẹp đẽ rồi! Chụp một bức ảnh chiếc giường năm sao gửi mẹ ngay nào!"
    },

    # 5. Routine: Mặc đồng phục (routine_morning_outfit)
    {
        "category": "routines/routine_morning_outfit",
        "key": "routine_morning_outfit_step1",
        "file_name": "step1_button_shirt.mp3",
        "text": "Mặc áo đồng phục và cài các nút cúc thẳng hàng từ trên xuống dưới nhé!"
    },
    {
        "category": "routines/routine_morning_outfit",
        "key": "routine_morning_outfit_step2",
        "file_name": "step2_wear_badge.mp3",
        "text": "Lấy dây thẻ học sinh đeo vào cổ ngay ngắn trước ngực nào!"
    },
    {
        "category": "routines/routine_morning_outfit",
        "key": "routine_morning_outfit_step3",
        "file_name": "step3_photo_finish.mp3",
        "text": "Chỉnh trang phục thật ngay ngắn rồi chụp một bức ảnh gửi mẹ trước khi đi học nào!"
    },

    # 6. Routine: Tan trường (routine_afterschool_drop)
    {
        "category": "routines/routine_afterschool_drop",
        "key": "routine_afterschool_drop_step1",
        "file_name": "step1_shoes_rack.mp3",
        "text": "Cởi giày ra và đặt ngay ngắn lên tầng kệ dép của con nhé!"
    },
    {
        "category": "routines/routine_afterschool_drop",
        "key": "routine_afterschool_drop_step2",
        "file_name": "step2_hang_backpack.mp3",
        "text": "Treo quai cặp lên chiếc móc treo tường quen thuộc nào!"
    },
    {
        "category": "routines/routine_afterschool_drop",
        "key": "routine_afterschool_drop_step3",
        "file_name": "step3_bottle_sink.mp3",
        "text": "Mở cặp lấy bình nước mang từ trường về đặt vào bồn rửa bát để rửa sạch nhé!"
    },
    {
        "category": "routines/routine_afterschool_drop",
        "key": "routine_afterschool_drop_step4",
        "file_name": "step4_photo_finish.mp3",
        "text": "Chụp một bức ảnh kệ dép, cặp và bình nước đã đặt đúng chỗ gửi mẹ nào!"
    },

    # 7. Routine: Rửa tay & thay đồ (routine_afterschool_wash)
    {
        "category": "routines/routine_afterschool_wash",
        "key": "routine_afterschool_wash_step1",
        "file_name": "step1_soap_foam.mp3",
        "text": "Bơm một lần xà phòng, xoa đều lòng bàn tay, mu bàn tay và các kẽ ngón trong ba mươi giây nào!"
    },
    {
        "category": "routines/routine_afterschool_wash",
        "key": "routine_afterschool_wash_step2",
        "file_name": "step2_rinse_change.mp3",
        "text": "Xả sạch bọt dưới vòi nước, lau khô tay và thay bộ quần áo ở nhà thật thoải mái nhé!"
    },
    {
        "category": "routines/routine_afterschool_wash",
        "key": "routine_afterschool_wash_step3",
        "file_name": "step3_photo_finish.mp3",
        "text": "Đưa hai bàn tay ra trước máy và chụp một bức ảnh đôi tay sạch thơm tho gửi mẹ nào!"
    },

    # 8. Routine: Bữa xế (routine_afterschool_snack)
    {
        "category": "routines/routine_afterschool_snack",
        "key": "routine_afterschool_snack_step1",
        "file_name": "step1_wash_hands.mp3",
        "text": "Rửa hai bàn tay thật sạch với xà phòng dưới vòi nước trước khi ăn xế nhé!"
    },
    {
        "category": "routines/routine_afterschool_snack",
        "key": "routine_afterschool_snack_step2",
        "file_name": "step2_eat_snack.mp3",
        "text": "Thưởng thức sữa hoặc đĩa trái cây tươi để nạp lại năng lượng sau giờ học nào!"
    },
    {
        "category": "routines/routine_afterschool_snack",
        "key": "routine_afterschool_snack_step3",
        "file_name": "step3_clean_table_photo.mp3",
        "text": "Bê đĩa cốc đã ăn xong đặt vào bồn rửa và chụp một bức ảnh bàn ăn sạch sẽ gửi mẹ nhé!"
    },

    # 9. Routine: Dọn bàn học (routine_clean_desk)
    {
        "category": "routines/routine_clean_desk",
        "key": "routine_clean_desk_step1",
        "file_name": "step1_collect_pens.mp3",
        "text": "Thu gom tất cả bút và thước rải rác trên bàn cắm gọn vào ống đựng bút nào!"
    },
    {
        "category": "routines/routine_clean_desk",
        "key": "routine_clean_desk_step2",
        "file_name": "step2_trash_bin.mp3",
        "text": "Nhặt sạch các mẩu giấy vụn và rác trên bàn bỏ vào sọt rác dưới gầm bàn nhé!"
    },
    {
        "category": "routines/routine_clean_desk",
        "key": "routine_clean_desk_step3",
        "file_name": "step3_stack_books.mp3",
        "text": "Xếp các cuốn sách vở thành một chồng ngay ngắn ở góc bàn bên trái nào!"
    },
    {
        "category": "routines/routine_clean_desk",
        "key": "routine_clean_desk_step4",
        "file_name": "step4_photo_finish.mp3",
        "text": "Mặt bàn đã sạch bóng rồi! Chụp một bức ảnh bàn học ngăn nắp gửi mẹ nhận thưởng ngay nào!"
    },

    # 10. Routine: Dọn bàn ăn (routine_dinner_prep)
    {
        "category": "routines/routine_dinner_prep",
        "key": "routine_dinner_prep_step1",
        "file_name": "step1_wipe_table.mp3",
        "text": "Cho đĩa thức ăn vào lò vi sóng, chỉnh hai phút rồi bấm nút bắt đầu nhé!"
    },
    {
        "category": "routines/routine_dinner_prep",
        "key": "routine_dinner_prep_step2",
        "file_name": "step2_set_chopsticks.mp3",
        "text": "Bật bếp nhỏ hâm nóng nồi canh trong lúc lò vi sóng đang chạy ngầm nào!"
    },
    {
        "category": "routines/routine_dinner_prep",
        "key": "routine_dinner_prep_step3",
        "file_name": "step3_set_bowls.mp3",
        "text": "Lấy bát đũa, thìa và xới các bát cơm nóng ra bàn ăn cho cả nhà nhé!"
    },
    {
        "category": "routines/routine_dinner_prep",
        "key": "routine_dinner_prep_step4",
        "file_name": "step4_photo_finish.mp3",
        "text": "Dùng lót tay bê các món ra bàn và chụp một bức ảnh mâm cơm tươm tất gửi mẹ nào!"
    },

    # 11. Routine: Soạn sách vở (routine_pack_schoolbag)
    {
        "category": "routines/routine_pack_schoolbag",
        "key": "routine_pack_schoolbag_step1",
        "file_name": "step1_check_schedule.mp3",
        "text": "Mở bảng thời khóa biểu trên tường và đối chiếu các môn học của ngày mai nào!"
    },
    {
        "category": "routines/routine_pack_schoolbag",
        "key": "routine_pack_schoolbag_step2",
        "file_name": "step2_pack_books.mp3",
        "text": "Lấy đủ sách vở và hộp bút của ngày mai xếp thành một chồng ngay ngắn trên mặt bàn nhé!"
    },
    {
        "category": "routines/routine_pack_schoolbag",
        "key": "routine_pack_schoolbag_step3",
        "file_name": "step3_photo_books_table.mp3",
        "text": "Chụp một bức ảnh cận cảnh chồng sách vở và hộp bút trên bàn để mẹ kiểm tra nào!"
    },
    {
        "category": "routines/routine_pack_schoolbag",
        "key": "routine_pack_schoolbag_step4",
        "file_name": "step4_photo_finish.mp3",
        "text": "Cất toàn bộ sách vở vào cặp, kéo khóa lại và đặt ngay ngắn cạnh cửa nhé!"
    },

    # 12. Routine: Đánh răng tối (routine_night_teeth)
    {
        "category": "routines/routine_night_teeth",
        "key": "routine_night_teeth_step1",
        "file_name": "step1_photo_paste.mp3",
        "text": "Hãy lấy tuýp kem bóp một lượng nhỏ bằng hạt đậu lên đầu bàn chải nhé!"
    },
    {
        "category": "routines/routine_night_teeth",
        "key": "routine_night_teeth_step2",
        "file_name": "step2_upper_teeth.mp3",
        "text": "Bây giờ đưa bàn chải lên hàm trên, chải xoay tròn đều khắp các mặt răng trong ba mươi giây nào!"
    },
    {
        "category": "routines/routine_night_teeth",
        "key": "routine_night_teeth_step3",
        "file_name": "step3_lower_teeth.mp3",
        "text": "Chuyển xuống chải đều khắp các mặt răng của hàm dưới trong ba mươi giây nhé!"
    },
    {
        "category": "routines/routine_night_teeth",
        "key": "routine_night_teeth_step4",
        "file_name": "step4_photo_smile.mp3",
        "text": "Súc miệng thật sạch rồi đứng trước gương chụp một bức ảnh cười tươi khoe hàm răng trắng sạch gửi mẹ nào!"
    },

    # 13. Routine: Tắt màn hình (routine_bedtime_screen_off)
    {
        "category": "routines/routine_bedtime_screen_off",
        "key": "routine_bedtime_screen_off_step1",
        "file_name": "step1_screen_off.mp3",
        "text": "Tắt màn hình điện thoại hoặc máy tính bảng và mang ra đặt trên bàn của bố mẹ nào!"
    },
    {
        "category": "routines/routine_bedtime_screen_off",
        "key": "routine_bedtime_screen_off_step2",
        "file_name": "step2_read_book.mp3",
        "text": "Nằm trên giường và đọc vài trang sách truyện yêu thích để thư giãn não bộ nhé!"
    },
    {
        "category": "routines/routine_bedtime_screen_off",
        "key": "routine_bedtime_screen_off_step3",
        "file_name": "step3_photo_finish.mp3",
        "text": "Gập sách lại đặt đầu giường và chụp một bức ảnh trước khi tắt đèn đi ngủ nào!"
    }
]

def main():
    import subprocess, time
    print("=== VIETNAMESE ROUTINE & AUDIO RE-GENERATOR ===")
    total = len(AUDIO_ITEMS)
    manifest = {}

    for idx, item in enumerate(AUDIO_ITEMS, 1):
        cat_dir = OUTPUT_DIR / item["category"]
        cat_dir.mkdir(parents=True, exist_ok=True)
        out_file = cat_dir / item["file_name"]
        rel_path = f"data/audio/{item['category']}/{item['file_name']}".replace("\\", "/")

        manifest[item["key"]] = {
            "category": item["category"],
            "file": rel_path,
            "text": item["text"]
        }

        # Nếu là routine hoặc câu đã sửa, sinh lại file để cập nhật nội dung mới
        is_routine = item["category"].startswith("routines/") or item["key"] == "reward_step_win"
        if not is_routine and out_file.exists() and out_file.stat().st_size > 5000:
            print(f"[{idx}/{total}] [SKIP-UNCHANGED] {item['key']}")
            continue

        print(f"[{idx}/{total}] [GENERATING] {item['key']}...")
        cmd = [
            "edge-tts",
            "--voice", VOICE,
            "--rate", RATE,
            "--pitch", PITCH,
            "--text", item["text"],
            "--write-media", str(out_file)
        ]
        
        for attempt in range(3):
            res = subprocess.run(cmd, capture_output=True)
            if out_file.exists() and out_file.stat().st_size > 5000:
                print(f"    -> [OK] {item['file_name']} ({out_file.stat().st_size} bytes)")
                break
            time.sleep(1.2)
        time.sleep(0.3)

    # Ghi manifest.json mới
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE] Manifest updated at: {manifest_path}")

if __name__ == "__main__":
    main()
