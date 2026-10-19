"""
build_curriculum_bank.py
Generates the complete 29-task database (25 GDPT 2018 benchmark tasks + 4 routine tasks)
validating all fields against frontend and Draft-07 micro-task schema.
"""

import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

VERB_REGEX = re.compile(r"^[a-zA-ZÀ-ỹ_]+$")

VALID_UI_TYPES = {
    "single_choice",
    "multiple_choice",
    "text_input",
    "drag_drop",
    "audio_listen",
    "highlight",
    "checkbox",
    "order_sequencing"
}

VALID_VISUAL_ASSETS = {
    "sparkle_star_01",
    "particle_burst_gold",
    "milo_thumbs_up",
    "badge_math_explorer",
    "confetti_cannon"
}

VALID_AUDIO_CUES = {
    "positive_bell_c6",
    "sparkle_ting_short",
    "harp_glissando_soft",
    "gentle_pop_success"
}

# Load 25 benchmark exercises
with open("data/curriculum/grade_1_to_5_benchmark.json", "r", encoding="utf-8") as f:
    bench_data = json.load(f)

bench_map = {e["id"]: e for e in bench_data["exercises"]}
assert len(bench_map) == 25, f"Expected 25 benchmark exercises, found {len(bench_map)}"

# Define step-level mappings for all 25 benchmark tasks
BENCHMARK_TASK_CONFIGS = {
    "G1_MATH_01": {
        "icon": "🐦",
        "title": "Cộng số chim trên cành (Phép cộng phạm vi 10)",
        "reward": 120,
        "stepSeconds": 60,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tìm Dữ Kiện",
                "action_verb": "Gạch_chân",
                "atomic_instruction": "Gạch chân 2 số lượng chim trong đề bài.",
                "duration_sec": 60,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm số lượng chim ban đầu và số chim bay đến thêm:",
                    "highlight_target_segments": ["5 con chim", "3 con chim"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Chú ý số chim ban đầu và số chim bay đến thêm."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["5 con chim", "3 con chim"], "feedback_on_error": "Milo cùng con tìm 2 số lượng chim nhé!"}
            },
            {
                "badge": "Chọn Phép Tính",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phép tính để tìm tổng số chim.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Có thêm chim bay đến, ta dùng phép tính nào?",
                    "options": ["5 + 3", "5 - 3"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Có thêm thì chúng mình làm phép tính cộng nha."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "5 + 3", "feedback_on_error": "Thêm vào thì mình làm phép tính cộng con nhé!"}
            },
            {
                "badge": "Tính Kết Quả",
                "action_verb": "Tính",
                "atomic_instruction": "Tính kết quả 5 cộng 3 bằng bao nhiêu.",
                "duration_sec": 60,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "5 + 3 = ?",
                    "placeholder": "Nhập số chim..."
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Đếm thêm 3 ngón tay từ 5: 6, 7, 8!"],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "8", "feedback_on_error": "5 cộng thêm 3 bằng 8 con chim nhé!"}
            }
        ]
    },
    "G1_MATH_02": {
        "icon": "🍊",
        "title": "Tính số cam còn lại của mẹ (Phép trừ phạm vi 20)",
        "reward": 120,
        "stepSeconds": 60,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Xác Định Dữ Kiện",
                "action_verb": "Đọc",
                "atomic_instruction": "Đọc số cam ban đầu và số cam đã ăn.",
                "duration_sec": 60,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Mẹ mua 18 quả cam, cả nhà ăn hết 6 quả:",
                    "highlight_target_segments": ["18 quả cam", "6 quả cam"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Tìm số 18 và số 6 trong câu chuyện nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["18 quả cam", "6 quả cam"], "feedback_on_error": "Cùng Milo nhìn 2 con số 18 và 6 nào!"}
            },
            {
                "badge": "Thiết Lập Phép Tính",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phép trừ để tìm số cam còn lại.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đã ăn bớt đi thì làm phép tính gì?",
                    "options": ["18 - 6", "18 + 6"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Ăn hết là bớt đi, ta làm phép trừ."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "18 - 6", "feedback_on_error": "Ăn bớt đi là phép trừ nha con!"}
            },
            {
                "badge": "Tính Đáp Số",
                "action_verb": "Tính",
                "atomic_instruction": "Tính nhẩm hàng đơn vị 8 trừ 6 để ra kết quả.",
                "duration_sec": 60,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "18 - 6 = ?",
                    "placeholder": "Nhập số cam còn lại..."
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["8 trừ 6 bằng 2, giữ nguyên 1 chục là 12."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "12", "feedback_on_error": "8 trừ 6 bằng 2, thêm 1 chục là 12 quả cam!"}
            }
        ]
    },
    "G1_VIET_03": {
        "icon": "🐓",
        "title": "Đọc hiểu: Ai cất tiếng gáy vang buổi sáng?",
        "reward": 120,
        "stepSeconds": 70,
        "cat": "viet",
        "catName": "Tiếng Việt GDPT",
        "steps": [
            {
                "badge": "Dò Tìm Từ Khóa",
                "action_verb": "Gạch_chân",
                "atomic_instruction": "Gạch chân cụm từ cất tiếng gáy vang trong bài.",
                "duration_sec": 70,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm cụm từ gáy vang trong câu đầu tiên:",
                    "highlight_target_segments": ["cất tiếng gáy vang"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Nhìn vào dòng thứ nhất của câu chuyện nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["cất tiếng gáy vang"], "feedback_on_error": "Con tìm cụm từ cất tiếng gáy vang ở dòng đầu nha!"}
            },
            {
                "badge": "Tìm Nhân Vật",
                "action_verb": "Dò",
                "atomic_instruction": "Dò tìm nhân vật đứng trước cụm từ vừa gạch.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Ai là người thực hiện hành động cất tiếng gáy vang?",
                    "options": ["chú gà trống", "Bé Mai", "Mặt trời"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Con vật nào cất tiếng gáy ò ó o mỗi sáng?"],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "chú gà trống", "feedback_on_error": "Đó chính là chú gà trống đấy con!"}
            },
            {
                "badge": "Ghi Đáp Án",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn đúng tên chú gà trống cất tiếng gáy.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp án cuối cùng cho câu hỏi là:",
                    "options": ["chú gà trống", "Bé Mai"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Chọn chú gà trống để hoàn thành bài nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "chú gà trống", "feedback_on_error": "Đáp án đúng là chú gà trống nha!"}
            }
        ]
    },
    "G1_MCQ_04": {
        "icon": "🏠",
        "title": "Đếm số hình tròn trên mô hình ngôi nhà",
        "reward": 110,
        "stepSeconds": 60,
        "cat": "math",
        "catName": "TNXH & Hình Học",
        "steps": [
            {
                "badge": "Xác Định Hình",
                "action_verb": "Xác_định",
                "atomic_instruction": "Xác định câu hỏi yêu cầu đếm hình gì.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đề bài yêu cầu đếm loại hình học nào?",
                    "options": ["Hình tròn", "Hình tam giác", "Hình chữ nhật"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Đề bài hỏi: có mấy hình tròn nhé con."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "Hình tròn", "feedback_on_error": "Chúng mình cần đếm hình tròn con nha!"}
            },
            {
                "badge": "Đếm Cửa Sổ",
                "action_verb": "Đếm",
                "atomic_instruction": "Đếm số lượng cửa sổ tròn trong mô tả.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Trong mô tả có mấy cửa sổ hình tròn?",
                    "options": ["2 cửa sổ hình tròn", "1 cửa sổ", "3 cửa sổ"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 25},
                "hints": ["Đọc kỹ câu: 'hai cửa sổ hình tròn'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "2 cửa sổ hình tròn", "feedback_on_error": "Có 2 cửa sổ hình tròn trong ngôi nhà!"}
            },
            {
                "badge": "Chọn Phương Án",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B có 2 hình tròn.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án đúng nhất:",
                    "options": ["A. 1 hình tròn", "B. 2 hình tròn", "C. 3 hình tròn", "D. 4 hình tròn"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Chọn phương án B. 2 hình tròn."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. 2 hình tròn", "feedback_on_error": "Phương án B là đáp án chính xác!"}
            }
        ]
    },
    "G1_ENG_05": {
        "icon": "✏️",
        "title": "English Vocabulary: Màu sắc của cây bút chì (Colors)",
        "reward": 120,
        "stepSeconds": 60,
        "cat": "eng",
        "catName": "Tiếng Anh Tiểu Học",
        "steps": [
            {
                "badge": "Đọc Gợi Ý",
                "action_verb": "Đọc",
                "atomic_instruction": "Đọc từ tiếng Việt chỉ màu đỏ trong ngoặc.",
                "duration_sec": 60,
                "ui_type": "checkbox",
                "ui_data": {
                    "prompt_text": "Con có thấy từ '(Màu đỏ)' ở cuối câu không?",
                    "options": ["Đã thấy từ Màu đỏ"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Nhìn vào chữ trong dấu ngoặc đơn nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Milo chỉ cho con chữ (Màu đỏ) ở cuối câu nhé!"}
            },
            {
                "badge": "Nhớ Từ Vựng",
                "action_verb": "Nhớ",
                "atomic_instruction": "Nhớ lại từ tiếng Anh chỉ màu đỏ.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Màu đỏ trong tiếng Anh là gì?",
                    "options": ["red", "blue", "yellow", "green"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Bắt đầu bằng chữ r... red!"],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "red", "feedback_on_error": "Màu đỏ tiếng Anh là 'red' con nhé!"}
            },
            {
                "badge": "Chọn Đáp Án C",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn chữ red điền vào chỗ trống.",
                "duration_sec": 60,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án C. red hoàn chỉnh câu:",
                    "options": ["A. blue", "B. green", "C. red", "D. yellow"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Phương án C là red."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "C. red", "feedback_on_error": "Chọn C. red là đúng rồi!"}
            }
        ]
    },
    "G2_MATH_06": {
        "icon": "🌳",
        "title": "Bài toán Đội Hai trồng cây (Nhiều hơn một số đơn vị)",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tách Dữ Kiện",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm số cây Đội Một và phần Đội Hai hơn.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm 35 cây của Đội Một và 18 cây nhiều hơn:",
                    "highlight_target_segments": ["35 cây xanh", "18 cây xanh"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Đội Một có 35 cây, Đội Hai hơn 18 cây."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["35 cây xanh", "18 cây xanh"], "feedback_on_error": "Cùng tìm 2 số 35 và 18 nha!"}
            },
            {
                "badge": "Chọn Phép Tính",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phép cộng 35 cộng 18 để tìm số lớn.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đội Hai nhiều hơn, ta chọn phép tính:",
                    "options": ["35 + 18", "35 - 18"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 25},
                "hints": ["Nhiều hơn thì chúng mình cộng thêm vào."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "35 + 18", "feedback_on_error": "Nhiều hơn thì ta lấy 35 + 18 nhé!"}
            },
            {
                "badge": "Cộng Có Nhớ",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 5 cộng 8 bằng 13 nhớ 1.",
                "duration_sec": 80,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "35 + 18 = ?",
                    "placeholder": "Nhập kết quả..."
                },
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 35},
                "hints": ["5 + 8 = 13 viết 3 nhớ 1; 3 + 1 = 4 thêm 1 là 5."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "53", "feedback_on_error": "5 + 8 = 13 nhớ 1, kết quả là 53 nha!"}
            },
            {
                "badge": "Viết Đáp Số",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số 53 cây xanh của Đội Hai.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp số cuối cùng của bài toán là:",
                    "options": ["53 cây xanh", "43 cây xanh", "53 cây cam"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Đội Hai trồng được 53 cây xanh."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "53 cây xanh", "feedback_on_error": "Đáp số là 53 cây xanh con nhé!"}
            }
        ]
    },
    "G2_MATH_07": {
        "icon": "🛢️",
        "title": "Tính lít dầu còn lại trong can (Bảng nhân 5 & Trừ)",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tính Tổng Lít Dầu",
                "action_verb": "Nhân",
                "atomic_instruction": "Tính 4 lít nhân 5 can bằng bao nhiêu.",
                "duration_sec": 80,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "4 x 5 = ? (lít)",
                    "placeholder": "Nhập tổng số lít ban đầu..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Bảng nhân 5: 4 x 5 = 20."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "20", "feedback_on_error": "4 nhân 5 bằng 20 lít dầu con nha!"}
            },
            {
                "badge": "Trừ Số Lít Đã Dùng",
                "action_verb": "Trừ",
                "atomic_instruction": "Lấy 20 lít trừ đi 7 lít đã lấy.",
                "duration_sec": 80,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "20 - 7 = ? (lít)",
                    "placeholder": "Nhập số lít còn lại..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Lấy 20 trừ đi 7 bằng 13."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "13", "feedback_on_error": "20 trừ 7 bằng 13 lít dầu con nhé!"}
            },
            {
                "badge": "Ghi Đáp Số",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số 13 lít dầu còn lại.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Số lít dầu còn lại trong các can là:",
                    "options": ["13 lít dầu", "20 lít dầu", "7 lít dầu"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Đáp số là 13 lít dầu."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "13 lít dầu", "feedback_on_error": "Đáp số là 13 lít dầu!"}
            }
        ]
    },
    "G2_VIET_08": {
        "icon": "🥬",
        "title": "Đọc hiểu: Nhận diện mẫu câu Ai làm gì? (Nam giúp bà)",
        "reward": 120,
        "stepSeconds": 70,
        "cat": "viet",
        "catName": "Tiếng Việt GDPT",
        "steps": [
            {
                "badge": "Xác Định Chủ Thể",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm đối tượng Nam thực hiện việc sau giờ học.",
                "duration_sec": 70,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm tên bạn nhỏ trong câu đầu tiên:",
                    "highlight_target_segments": ["Nam"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Bạn nhỏ giúp bà tên là Nam."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["Nam"], "feedback_on_error": "Bạn nhỏ tên là Nam nhé!"}
            },
            {
                "badge": "Tìm Cụm Hành Động",
                "action_verb": "Gạch_chân",
                "atomic_instruction": "Gạch chân việc Nam tưới những luống rau.",
                "duration_sec": 70,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Nam làm việc gì giúp bà sau giờ học?",
                    "highlight_target_segments": ["tưới những luống rau xanh mướt sau vườn"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Hành động là tưới những luống rau sau vườn."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["tưới những luống rau xanh mướt sau vườn"], "feedback_on_error": "Hành động là tưới những luống rau xanh mướt sau vườn!"}
            },
            {
                "badge": "Chọn Câu Trả Lời",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn hành động tưới những luống rau sau vườn.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Mẫu câu Ai làm gì trong bài diễn tả việc gì?",
                    "options": ["tưới những luống rau sau vườn", "chơi cùng cún Mực", "đi xem phim"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn đáp án tưới rau giúp bà."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "tưới những luống rau sau vườn", "feedback_on_error": "Nam tưới những luống rau sau vườn nha!"}
            }
        ]
    },
    "G2_MCQ_09": {
        "icon": "📏",
        "title": "Đổi đơn vị mét sang đề-xi-mét (Đoạn dây của An)",
        "reward": 120,
        "stepSeconds": 70,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Đổi Đơn Vị Đo",
                "action_verb": "Đổi",
                "atomic_instruction": "Đổi 1 mét thành bao nhiêu đề-xi-mét.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "1 m = ? dm",
                    "options": ["1 m = 10 dm", "1 m = 100 dm", "1 m = 5 dm"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["1 mét bằng 10 đề-xi-mét con nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "1 m = 10 dm", "feedback_on_error": "1 m bằng 10 dm con nha!"}
            },
            {
                "badge": "Thực Hiện Phép Trừ",
                "action_verb": "Trừ",
                "atomic_instruction": "Lấy 10 dm trừ 4 dm đã cắt.",
                "duration_sec": 70,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "10 - 4 = ? (dm)",
                    "placeholder": "Nhập kết quả..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["10 trừ đi 4 còn 6."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "6", "feedback_on_error": "10 trừ 4 bằng 6 dm!"}
            },
            {
                "badge": "Chọn Phương Án B",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B có kết quả 6 dm.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án trắc nghiệm đúng:",
                    "options": ["A. 5 dm", "B. 6 dm", "C. 7 dm", "D. 96 dm"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn B. 6 dm nhé con."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. 6 dm", "feedback_on_error": "Phương án B. 6 dm là chuẩn xác!"}
            }
        ]
    },
    "G2_ENG_10": {
        "icon": "📚",
        "title": "English Grammar: There is / There are with Plural Nouns",
        "reward": 120,
        "stepSeconds": 70,
        "cat": "eng",
        "catName": "Tiếng Anh Tiểu Học",
        "steps": [
            {
                "badge": "Nhìn Danh Từ",
                "action_verb": "Đọc",
                "atomic_instruction": "Đọc cụm three books và nhận biết số nhiều.",
                "duration_sec": 70,
                "ui_type": "checkbox",
                "ui_data": {
                    "prompt_text": "'three books' có 3 quyển sách (số nhiều), đúng không con?",
                    "options": ["Đúng là số nhiều"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["3 quyển sách là từ 2 vật trở lên, là số nhiều."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "3 quyển sách là danh từ số nhiều nha!"}
            },
            {
                "badge": "Áp Dụng Quy Tắc",
                "action_verb": "Nhớ",
                "atomic_instruction": "Nhớ quy tắc dùng There are cho số nhiều.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Số nhiều (từ 2 vật) chúng mình dùng từ nào?",
                    "options": ["There are", "There is"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Số nhiều dùng are, số ít dùng is."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "There are", "feedback_on_error": "Số nhiều chúng mình dùng There are nhé!"}
            },
            {
                "badge": "Chọn Phương Án B",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B chứa từ are.",
                "duration_sec": 70,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án điền vào chỗ trống:",
                    "options": ["A. is", "B. are", "C. am", "D. be"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn phương án B. are."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. are", "feedback_on_error": "Phương án B. are là chính xác!"}
            }
        ]
    },
    "G3_MATH_11": {
        "icon": "🍚",
        "title": "Cửa hàng bán gạo (Gấp một số lên nhiều lần & Tổng)",
        "reward": 140,
        "stepSeconds": 90,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tìm Gạo Buổi Chiều",
                "action_verb": "Nhân",
                "atomic_instruction": "Nhân 24 kg với 3 để tìm gạo chiều.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "24 x 3 = ? (kg)",
                    "placeholder": "Nhập số gạo buổi chiều..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["4 x 3 = 12 viết 2 nhớ 1; 2 x 3 = 6 thêm 1 là 7."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "72", "feedback_on_error": "24 nhân 3 bằng 72 kg gạo con nhé!"}
            },
            {
                "badge": "Tính Tổng Hai Buổi",
                "action_verb": "Cộng",
                "atomic_instruction": "Cộng 24 kg sáng với 72 kg chiều.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "24 + 72 = ? (kg)",
                    "placeholder": "Nhập tổng số gạo cả ngày..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["4 + 2 = 6, 2 + 7 = 9. Kết quả là 96."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "96", "feedback_on_error": "24 cộng 72 bằng 96 kg gạo nha!"}
            },
            {
                "badge": "Ghi Đáp Số",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số hoàn chỉnh 96 kg gạo.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn đáp số đúng cho cả hai buổi:",
                    "options": ["96 kg gạo", "72 kg gạo", "48 kg gạo"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Đáp số cả hai buổi là 96 kg gạo."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "96 kg gạo", "feedback_on_error": "Đáp số là 96 kg gạo!"}
            }
        ]
    },
    "G3_MATH_12": {
        "icon": "📓",
        "title": "Bài toán rút về đơn vị: Thưởng vở học sinh giỏi",
        "reward": 140,
        "stepSeconds": 90,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Rút Về Một Bạn",
                "action_verb": "Chia",
                "atomic_instruction": "Chia 35 quyển cho 7 bạn bằng mấy quyển.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "35 : 7 = ? (quyển vở mỗi bạn)",
                    "placeholder": "Nhập số vở một bạn nhận..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Bảng chia 7: 7 x 5 = 35."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "5", "feedback_on_error": "Mỗi bạn nhận được 5 quyển vở con nhé!"}
            },
            {
                "badge": "Tính Cho 5 Bạn",
                "action_verb": "Nhân",
                "atomic_instruction": "Nhân 5 quyển một bạn với 5 bạn.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "5 x 5 = ? (quyển vở)",
                    "placeholder": "Nhập số vở cho 5 bạn..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Bảng nhân 5: 5 x 5 = 25."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "25", "feedback_on_error": "5 bạn nhận 25 quyển vở nha!"}
            },
            {
                "badge": "Ghi Đáp Số",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số 25 quyển vở cô giáo thưởng.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp số của bài toán là:",
                    "options": ["25 quyển vở", "35 quyển vở", "15 quyển vở"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Đáp số là 25 quyển vở."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "25 quyển vở", "feedback_on_error": "Đáp số là 25 quyển vở!"}
            }
        ]
    },
    "G3_VIET_13": {
        "icon": "🪞",
        "title": "Đọc hiểu: Biện pháp so sánh Mặt hồ Ba Bể",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "viet",
        "catName": "Tiếng Việt GDPT",
        "steps": [
            {
                "badge": "Tìm Từ So Sánh",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm từ như dùng để nối câu so sánh.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm từ chỉ quan hệ so sánh trong câu 1:",
                    "highlight_target_segments": ["như"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Từ so sánh phổ biến nhất là từ 'như'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["như"], "feedback_on_error": "Từ so sánh là từ 'như' nhé!"}
            },
            {
                "badge": "Tìm Hình Ảnh So Sánh",
                "action_verb": "Xác_định",
                "atomic_instruction": "Xác định cụm từ đứng sau từ như.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Mặt hồ phẳng lặng và trong veo như cái gì?",
                    "highlight_target_segments": ["một tấm gương khổng lồ"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Đứng sau từ 'như' là 'một tấm gương khổng lồ'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["một tấm gương khổng lồ"], "feedback_on_error": "Hình ảnh so sánh là 'một tấm gương khổng lồ'!"}
            },
            {
                "badge": "Chọn Tấm Gương Khổng Lồ",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn đáp án một tấm gương khổng lồ.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Sự vật được dùng để so sánh với mặt hồ là:",
                    "options": ["một tấm gương khổng lồ", "núi rừng Ba Bể", "chiếc thuyền nan"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn 'một tấm gương khổng lồ'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "một tấm gương khổng lồ", "feedback_on_error": "Đáp án là một tấm gương khổng lồ!"}
            }
        ]
    },
    "G3_MCQ_14": {
        "icon": "📐",
        "title": "Tính chu vi mảnh đất hình chữ nhật (15m và 8m)",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Nhớ Công Thức Chu Vi",
                "action_verb": "Nhớ",
                "atomic_instruction": "Nhớ công thức: dài cộng rộng nhân hai.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Công thức tính chu vi hình chữ nhật là:",
                    "options": ["(Dài + Rộng) x 2", "Dài x Rộng", "Dài + Rộng"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Chu vi bằng (dài + rộng) x 2."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "(Dài + Rộng) x 2", "feedback_on_error": "Chu vi hình chữ nhật bằng (Dài + Rộng) x 2 nhé!"}
            },
            {
                "badge": "Tính Chu Vi",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 15 cộng 8 rồi nhân 2.",
                "duration_sec": 80,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "(15 + 8) x 2 = ? (m)",
                    "placeholder": "Nhập chu vi..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["15 + 8 = 23; 23 x 2 = 46."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "46", "feedback_on_error": "23 nhân 2 bằng 46 m con nha!"}
            },
            {
                "badge": "Chọn Phương Án B",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B có đơn vị mét (46 m).",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chú ý đơn vị mét (m), không phải mét vuông (m2):",
                    "options": ["A. 23 m", "B. 46 m", "C. 120 m", "D. 46 mét vuông"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chu vi đơn vị là m: B. 46 m."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. 46 m", "feedback_on_error": "Đáp án đúng là B. 46 m!"}
            }
        ]
    },
    "G3_ENG_15": {
        "icon": "🦆",
        "title": "English Sentence Reordering: Khả năng của chú vịt (can/can't)",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "eng",
        "catName": "Tiếng Anh Tiểu Học",
        "steps": [
            {
                "badge": "Tìm Chủ Ngữ Đầu Câu",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm cụm từ viết hoa A duck làm chủ ngữ.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Từ nào viết hoa đứng đầu câu?",
                    "options": ["A duck", "can swim", "fly", "but"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Chữ 'A duck' có chữ A viết hoa."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "A duck", "feedback_on_error": "Chủ ngữ đầu câu là A duck con nhé!"}
            },
            {
                "badge": "Ghép Cấu Trúc Can / Can't",
                "action_verb": "Ghép",
                "atomic_instruction": "Ghép hành động bơi được và không bay được.",
                "duration_sec": 80,
                "ui_type": "order_sequencing",
                "ui_data": {
                    "prompt_text": "Sắp xếp thứ tự các vế câu:",
                    "items_to_drag": ["A duck", "can swim", "but", "can't fly."]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["A duck -> can swim -> but -> can't fly."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["A duck", "can swim", "but", "can't fly."], "feedback_on_error": "Vịt biết bơi nhưng không biết bay: can swim but can't fly."}
            },
            {
                "badge": "Chọn Câu Hoàn Chỉnh A",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án A ghép câu đúng ngữ pháp.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn câu hoàn chỉnh chính xác:",
                    "options": [
                        "A. A duck can swim but can't fly.",
                        "B. A duck can't swim but can fly.",
                        "C. Can swim but fly a duck can't."
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Phương án A là câu chuẩn xác."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "A. A duck can swim but can't fly.", "feedback_on_error": "Phương án A là đáp án chính xác!"}
            }
        ]
    },
    "G4_MATH_16": {
        "icon": "📚",
        "title": "Toán Tổng - Hiệu: Sách quyên góp hai lớp 4A và 4B",
        "reward": 150,
        "stepSeconds": 90,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Xác Định Tổng Và Hiệu",
                "action_verb": "Tách",
                "atomic_instruction": "Tách tổng 280 quyển và hiệu 40 quyển.",
                "duration_sec": 90,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm tổng số sách và số sách lớp 4A nhiều hơn:",
                    "highlight_target_segments": ["280 quyển sách", "40 quyển"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Tổng là 280 quyển, hiệu là 40 quyển."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["280 quyển sách", "40 quyển"], "feedback_on_error": "Tổng = 280, Hiệu = 40 nhé!"}
            },
            {
                "badge": "Tìm Sách Lớp 4A",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 280 cộng 40 rồi chia cho 2.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "(280 + 40) : 2 = ? (quyển lớp 4A)",
                    "placeholder": "Nhập số sách 4A..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["280 + 40 = 320; 320 : 2 = 160."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "160", "feedback_on_error": "Lớp 4A quyên góp được 160 quyển con nha!"}
            },
            {
                "badge": "Tìm Sách Lớp 4B",
                "action_verb": "Trừ",
                "atomic_instruction": "Lấy 160 trừ đi 40 để ra lớp 4B.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "160 - 40 = ? (quyển lớp 4B)",
                    "placeholder": "Nhập số sách 4B..."
                },
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 35},
                "hints": ["160 - 40 = 120 quyển."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "120", "feedback_on_error": "Lớp 4B quyên góp 120 quyển nhé!"}
            },
            {
                "badge": "Ghi Rõ Hai Lớp",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Chọn đáp án ghi rõ kết quả cả hai lớp.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp số đầy đủ của bài toán là:",
                    "options": [
                        "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
                        "Lớp 4A: 140 quyển, Lớp 4B: 140 quyển",
                        "Lớp 4A: 180 quyển, Lớp 4B: 100 quyển"
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 50},
                "hints": ["4A: 160 quyển, 4B: 120 quyển."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển", "feedback_on_error": "Đáp số là 4A: 160 quyển, 4B: 120 quyển!"}
            }
        ]
    },
    "G4_MATH_17": {
        "icon": "🐥",
        "title": "Tìm phân số của một số: Đàn gia cầm gà và vịt",
        "reward": 140,
        "stepSeconds": 90,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tính Số Con Gà",
                "action_verb": "Tính",
                "atomic_instruction": "Lấy 1200 chia 5 rồi nhân 3 tìm gà.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "1200 x 3/5 = ? (con gà)",
                    "placeholder": "Nhập số con gà..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["1200 : 5 = 240; 240 x 3 = 720."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "720", "feedback_on_error": "Trang trại có 720 con gà nhé con!"}
            },
            {
                "badge": "Tìm Số Con Vịt",
                "action_verb": "Trừ",
                "atomic_instruction": "Lấy 1200 tổng trừ đi 720 con gà.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "1200 - 720 = ? (con vịt)",
                    "placeholder": "Nhập số con vịt..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["1200 - 720 = 480."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "480", "feedback_on_error": "Số vịt là 480 con con nhé!"}
            },
            {
                "badge": "Ghi Đáp Số Vịt",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số 480 con vịt của trang trại.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đề bài hỏi số con vịt, vậy đáp số là:",
                    "options": ["480 con vịt", "720 con gà", "600 con vịt"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Đáp số là 480 con vịt."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "480 con vịt", "feedback_on_error": "Đáp số là 480 con vịt!"}
            }
        ]
    },
    "G4_VIET_18": {
        "icon": "🌾",
        "title": "Đọc hiểu: Biện pháp nhân hóa Chị Gió thì thầm",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "viet",
        "catName": "Tiếng Việt GDPT",
        "steps": [
            {
                "badge": "Xác Định Chị Gió",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm đối tượng được nhân hóa là chị Gió.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm tên sự vật thiên nhiên được gọi như con người:",
                    "highlight_target_segments": ["Chị Gió"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Gió được gọi thân mật bằng 'Chị'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["Chị Gió"], "feedback_on_error": "Đó là Chị Gió nhé!"}
            },
            {
                "badge": "Tìm Hành Động Con Người",
                "action_verb": "Gạch_chân",
                "atomic_instruction": "Gạch chân từ thì thầm trong câu thứ nhất.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Chị Gió làm hành động gì của con người với lúa non?",
                    "highlight_target_segments": ["khẽ thì thầm"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Hành động nói nhỏ: thì thầm."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["khẽ thì thầm"], "feedback_on_error": "Chị Gió khẽ thì thầm con nhé!"}
            },
            {
                "badge": "Chọn Từ Nhân Hóa",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn từ thì thầm là hành động nhân hóa.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Từ ngữ thể hiện hành động nhân hóa của Chị Gió là:",
                    "options": ["thì thầm (hoặc khẽ thì thầm)", "uốn câu", "nở nụ cười"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn 'thì thầm'."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "thì thầm (hoặc khẽ thì thầm)", "feedback_on_error": "Đáp án đúng là thì thầm!"}
            }
        ]
    },
    "G4_MCQ_19": {
        "icon": "🔷",
        "title": "Tính diện tích hình bình hành (Đáy 24m, chiều cao 15m)",
        "reward": 140,
        "stepSeconds": 85,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Nhớ Công Thức Diện Tích",
                "action_verb": "Nhớ",
                "atomic_instruction": "Nhớ công thức: diện tích bằng đáy nhân chiều cao.",
                "duration_sec": 85,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Công thức diện tích hình bình hành là:",
                    "options": ["S = a x h", "S = (a + b) x 2", "S = a x b"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Diện tích bình hành = Đáy nhân Chiều cao."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "S = a x h", "feedback_on_error": "S = a x h (đáy nhân chiều cao) con nhé!"}
            },
            {
                "badge": "Bỏ Dữ Kiện Nhiễu",
                "action_verb": "Lọc",
                "atomic_instruction": "Chọn đáy 24m, cao 15m và bỏ cạnh bên 18m.",
                "duration_sec": 85,
                "ui_type": "checkbox",
                "ui_data": {
                    "prompt_text": "Dữ kiện 18m cạnh bên là chi tiết gây nhiễu, cần bỏ qua?",
                    "options": ["Đúng, chỉ lấy 24m đáy và 15m chiều cao"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 25},
                "hints": ["Không nhân với cạnh bên 18m nha."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Đúng rồi, chỉ dùng đáy 24m và cao 15m thôi!"}
            },
            {
                "badge": "Thực Hiện Phép Nhân",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 24 nhân 15 bằng bao nhiêu mét vuông.",
                "duration_sec": 85,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "24 x 15 = ? (m2)",
                    "placeholder": "Nhập diện tích..."
                },
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 35},
                "hints": ["24 x 10 = 240; 24 x 5 = 120; 240 + 120 = 360."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "360", "feedback_on_error": "24 nhân 15 bằng 360 m2 con nhé!"}
            },
            {
                "badge": "Chọn Phương Án A",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án A có diện tích 360 m2.",
                "duration_sec": 85,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn đáp án trắc nghiệm đúng:",
                    "options": ["A. 360 m2", "B. 432 m2", "C. 78 m", "D. 180 m2"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Chọn phương án A. 360 m2."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "A. 360 m2", "feedback_on_error": "Phương án A là đáp án chính xác!"}
            }
        ]
    },
    "G4_ENG_20": {
        "icon": "🥞",
        "title": "English Reading: Hoạt động của mẹ Peter trong bếp",
        "reward": 130,
        "stepSeconds": 80,
        "cat": "eng",
        "catName": "Tiếng Anh Tiểu Học",
        "steps": [
            {
                "badge": "Xác Định Đối Tượng Mẹ",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm tên Peter's mother trong câu hỏi.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm nhân vật được hỏi trong câu:",
                    "highlight_target_segments": ["Peter's mother"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Câu hỏi hỏi về mẹ của Peter."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["Peter's mother"], "feedback_on_error": "Đối tượng là Peter's mother nha!"}
            },
            {
                "badge": "Dò Câu Chứa His Mother",
                "action_verb": "Dò",
                "atomic_instruction": "Dò câu có cụm making pancakes in the kitchen.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm câu miêu tả mẹ của Peter:",
                    "highlight_target_segments": ["His mother is making pancakes in the kitchen."]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Mẹ làm bánh kếp trong bếp: kitchen & pancakes."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["His mother is making pancakes in the kitchen."], "feedback_on_error": "His mother is making pancakes in the kitchen."}
            },
            {
                "badge": "Chọn Phương Án B",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B có địa điểm và hành động.",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án trắc nghiệm đúng:",
                    "options": [
                        "A. In the garage, washing the car.",
                        "B. In the kitchen, making pancakes.",
                        "C. In the living room, playing board games.",
                        "D. In the bedroom, reading a book."
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Phương án B: In the kitchen, making pancakes."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. In the kitchen, making pancakes.", "feedback_on_error": "Phương án B là đáp án chính xác!"}
            }
        ]
    },
    "G5_MATH_21": {
        "icon": "🚗",
        "title": "Toán chuyển động đều: Ô tô và xe máy gặp nhau",
        "reward": 160,
        "stepSeconds": 100,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tính Tổng Vận Tốc",
                "action_verb": "Cộng",
                "atomic_instruction": "Cộng vận tốc ô tô 50 và xe máy 40.",
                "duration_sec": 100,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "50 + 40 = ? (km/giờ)",
                    "placeholder": "Nhập tổng vận tốc..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Hai xe đi ngược chiều, cộng hai vận tốc lại."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "90", "feedback_on_error": "50 + 40 = 90 km/giờ con nhé!"}
            },
            {
                "badge": "Tính Thời Gian Gặp",
                "action_verb": "Chia",
                "atomic_instruction": "Lấy quãng đường 180 chia tổng vận tốc 90.",
                "duration_sec": 100,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "180 : 90 = ? (giờ)",
                    "placeholder": "Nhập thời gian đi..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["180 chia 90 bằng 2 giờ."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "2", "feedback_on_error": "Sau 2 giờ hai xe gặp nhau con nhé!"}
            },
            {
                "badge": "Tính Thời Điểm Gặp",
                "action_verb": "Cộng",
                "atomic_instruction": "Cộng giờ xuất phát 7 giờ với 2 giờ đi.",
                "duration_sec": 100,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "7 + 2 = ? (giờ sáng)",
                    "placeholder": "Nhập thời điểm gặp nhau..."
                },
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 35},
                "hints": ["Xuất phát lúc 7 giờ, đi 2 giờ là 9 giờ sáng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "9", "feedback_on_error": "Hai xe gặp nhau lúc 9 giờ sáng!"}
            },
            {
                "badge": "Ghi Đủ Hai Câu",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Chọn đáp án ghi rõ cả 2 giờ và 9 giờ.",
                "duration_sec": 100,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp số câu a và câu b là:",
                    "options": [
                        "a) 2 giờ; b) 9 giờ sáng",
                        "a) 3 giờ; b) 10 giờ sáng",
                        "a) 2 giờ; b) 8 giờ sáng"
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 50},
                "hints": ["a) 2 giờ; b) 9 giờ sáng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "a) 2 giờ; b) 9 giờ sáng", "feedback_on_error": "Đáp số là a) 2 giờ; b) 9 giờ sáng!"}
            }
        ]
    },
    "G5_MATH_22": {
        "icon": "📦",
        "title": "Thể tích bể nước hình hộp chữ nhật và tính lít nước",
        "reward": 160,
        "stepSeconds": 100,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Tính Thể Tích Bể",
                "action_verb": "Nhân",
                "atomic_instruction": "Nhân 2m với 1,5m rồi nhân 1,2m chiều cao.",
                "duration_sec": 100,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "2 x 1,5 x 1,2 = ? (m3)",
                    "placeholder": "Nhập thể tích bể..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["2 x 1,5 = 3; 3 x 1,2 = 3,6 m3."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "3.6", "feedback_on_error": "Thể tích là 3,6 m3 con nhé!"}
            },
            {
                "badge": "Đổi Mét Khối Sang Lít",
                "action_verb": "Đổi",
                "atomic_instruction": "Đổi 3,6 mét khối sang 3600 lít.",
                "duration_sec": 100,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "1 m3 = 1000 lít, vậy 3,6 m3 = ? lít",
                    "options": ["3,6 m3 = 3600 lít", "3,6 m3 = 360 lít", "3,6 m3 = 36000 lít"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 30},
                "hints": ["Nhân 3,6 với 1000 ra 3600 lít."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "3,6 m3 = 3600 lít", "feedback_on_error": "3,6 m3 = 3600 dm3 = 3600 lít nha!"}
            },
            {
                "badge": "Tính 60% Lượng Nước",
                "action_verb": "Tính",
                "atomic_instruction": "Lấy 3600 lít nhân 60 rồi chia 100.",
                "duration_sec": 100,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "3600 x 60 : 100 = ? (lít nước)",
                    "placeholder": "Nhập lượng nước có trong bể..."
                },
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 35},
                "hints": ["3600 x 0,6 = 2160 lít."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "2160", "feedback_on_error": "Lượng nước là 2160 lít con nha!"}
            },
            {
                "badge": "Ghi Đáp Số Lít",
                "action_verb": "Kết_luận",
                "atomic_instruction": "Ghi đáp số 2160 lít nước trong bể.",
                "duration_sec": 100,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Đáp số lượng nước đang có là:",
                    "options": ["2160 lít", "3600 lít", "216 lít"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 50},
                "hints": ["Đáp số là 2160 lít."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "2160 lít", "feedback_on_error": "Đáp số là 2160 lít nước!"}
            }
        ]
    },
    "G5_VIET_23": {
        "icon": "✍️",
        "title": "Đọc hiểu: Bài học kiên trì rèn luyện nét chữ",
        "reward": 150,
        "stepSeconds": 90,
        "cat": "viet",
        "catName": "Tiếng Việt GDPT",
        "steps": [
            {
                "badge": "Tìm Vế Nguyên Nhân",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm vế kiên trì rèn luyện sau chữ Nhờ.",
                "duration_sec": 90,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm vế nguyên nhân dẫn đến thành công của bạn nhỏ:",
                    "highlight_target_segments": ["kiên trì rèn luyện từng nét chữ mỗi ngày và không nản lòng"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["Nguyên nhân là kiên trì rèn luyện mỗi ngày."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["kiên trì rèn luyện từng nét chữ mỗi ngày và không nản lòng"], "feedback_on_error": "Nguyên nhân là kiên trì rèn luyện mỗi ngày, không nản lòng!"}
            },
            {
                "badge": "Rút Ra Bài Học",
                "action_verb": "Khái_quát",
                "atomic_instruction": "Khái quát bài học kiên trì vượt khó thành công.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Câu chuyện gửi gắm bài học cuộc sống gì?",
                    "options": [
                        "Có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
                        "Chỉ cần viết nhanh",
                        "Không cần luyện tập"
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Bài học về lòng kiên trì vượt khó."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "Có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công", "feedback_on_error": "Có ý chí kiên nhẫn thì sẽ vượt qua khó khăn để thành công!"}
            },
            {
                "badge": "Chọn Đáp Án Đầy Đủ",
                "action_verb": "Tổng_hợp",
                "atomic_instruction": "Chọn câu trả lời có đủ nguyên nhân và bài học.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn đáp án tổng hợp hoàn chỉnh:",
                    "options": [
                        "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
                        "Chỉ cần rèn chữ đẹp là đủ",
                        "Thành công là do may mắn"
                    ]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 50},
                "hints": ["Chọn đáp án đầy đủ cả 2 vế."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công", "feedback_on_error": "Chọn đáp án có cả nguyên nhân và bài học nhé!"}
            }
        ]
    },
    "G5_MCQ_24": {
        "icon": "🎒",
        "title": "Bài toán giảm giá 2 lần của chiếc cặp sách (Tỉ số %)",
        "reward": 150,
        "stepSeconds": 90,
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "steps": [
            {
                "badge": "Giá Sau Giảm Lần Một",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 200 000 nhân 85% ra giá lần một.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "200 000 x 0,85 = ? (đồng)",
                    "placeholder": "Nhập giá lần 1..."
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 30},
                "hints": ["200 000 x (100% - 15%) = 170 000 đồng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "170000", "feedback_on_error": "Giá sau lần 1 là 170 000 đồng con nhé!"}
            },
            {
                "badge": "Giá Sau Giảm Lần Hai",
                "action_verb": "Tính",
                "atomic_instruction": "Tính 170 000 nhân 90% ra giá lần hai.",
                "duration_sec": 90,
                "ui_type": "text_input",
                "ui_data": {
                    "prompt_text": "170 000 x 0,9 = ? (đồng)",
                    "placeholder": "Nhập giá lần 2..."
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["170 000 x (100% - 10%) = 153 000 đồng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "153000", "feedback_on_error": "Giá cuối cùng là 153 000 đồng nha!"}
            },
            {
                "badge": "Chọn Phương Án B",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án B có giá 153 000 đồng.",
                "duration_sec": 90,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án trắc nghiệm đúng:",
                    "options": ["A. 150 000 đồng", "B. 153 000 đồng", "C. 170 000 đồng", "D. 147 000 đồng"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 50},
                "hints": ["Phương án B: 153 000 đồng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "B. 153 000 đồng", "feedback_on_error": "Phương án B là đáp án chính xác!"}
            }
        ]
    },
    "G5_ENG_25": {
        "icon": "✈️",
        "title": "English Reading: Chuyến đi Đà Nẵng của Nam (By plane)",
        "reward": 140,
        "stepSeconds": 80,
        "cat": "eng",
        "catName": "Tiếng Anh Tiểu Học",
        "steps": [
            {
                "badge": "Xác Định Câu Hỏi",
                "action_verb": "Tìm",
                "atomic_instruction": "Tìm phương tiện về Hà Nội trong câu hỏi.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm cụm từ 'travel back to Ha Noi' trong câu hỏi:",
                    "highlight_target_segments": ["travel back to Ha Noi"]
                },
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Câu hỏi hỏi phương tiện đi về Hà Nội."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["travel back to Ha Noi"], "feedback_on_error": "Tìm phương tiện travel back to Ha Noi con nha!"}
            },
            {
                "badge": "Dò Cụm Taking A Plane",
                "action_verb": "Dò",
                "atomic_instruction": "Dò câu cuối chứa taking a plane back to Ha Noi.",
                "duration_sec": 80,
                "ui_type": "highlight",
                "ui_data": {
                    "prompt_text": "Tìm phương tiện trong câu cuối của đoạn văn:",
                    "highlight_target_segments": ["taking a plane"]
                },
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Nam đi máy bay: taking a plane."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": ["taking a plane"], "feedback_on_error": "Cụm từ là 'taking a plane' nhé!"}
            },
            {
                "badge": "Chọn Phương Án C",
                "action_verb": "Chọn",
                "atomic_instruction": "Chọn phương án C đi bằng máy bay (By plane).",
                "duration_sec": 80,
                "ui_type": "single_choice",
                "ui_data": {
                    "prompt_text": "Chọn phương án trắc nghiệm đúng:",
                    "options": ["A. By train", "B. By coach", "C. By plane", "D. By boat"]
                },
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 45},
                "hints": ["Taking a plane tương ứng với By plane."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "C. By plane", "feedback_on_error": "Phương án C. By plane là chính xác!"}
            }
        ]
    }
}

# Define 4 practical daily routine tasks
ROUTINE_TASK_CONFIGS = {
    "chore_desk": {
        "id": "chore_desk",
        "grade": 1,
        "subject": "hoat_dong_trai_nghiem",
        "cat": "chore",
        "catName": "Hoạt Động Trải Nghiệm",
        "icon": "🧹",
        "title": "Dọn bàn học gọn gàng trong 5 phút",
        "island": "routine",
        "reward": 120,
        "stepSeconds": 60,
        "original_text": "Sau khi học bài xong, em hãy tự giác dọn dẹp góc học tập cho ngăn nắp: cắm bút vào ống, gom giấy vụn bỏ vào sọt rác, xếp sách vở gọn gàng góc trái và lau sạch mặt bàn.",
        "final_answer": {
            "value": "Bàn học gọn gàng, sạch sẽ",
            "unit": None,
            "normalized_display": "Bàn học gọn gàng, sạch sẽ",
            "acceptable_variants": ["gọn gàng", "sạch sẽ", "ngăn nắp"]
        },
        "adhd_scaffolding_notes": {
            "working_memory_pitfall": "Trẻ dễ bị quá tải khi nhìn mặt bàn lộn xộn nhiều đồ vật cùng lúc (Visual Clutter Paralysis).",
            "executive_function_scaffolding": "Chia nhỏ thành 4 vi hành động đơn lẻ theo thứ tự: bút -> rác -> sách -> lau bàn.",
            "visual_or_concrete_aid": "Hoạt ảnh tương tác từng món đồ biến mất vào đúng vị trí khi chạm vào."
        },
        "steps": [
            {
                "badge": "Cắm bút vào ống",
                "action_verb": "Cắm_bút",
                "atomic_instruction": "Chạm vào 3 cây bút bừa bộn trên bàn.",
                "duration_sec": 60,
                "type": "chore_pens",
                "ui_type": "single_choice",
                "ui_data": {"prompt_text": "Chạm vào 3 cây bút đang nằm bừa bộn trên bàn để cắm vào ống:"},
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Chạm vào bút chì, bút bi và bút sáp để cất gọn nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": "pen3", "feedback_on_error": "Con cất đủ 3 cây bút vào ống nhé!"}
            },
            {
                "badge": "Gom giấy vụn",
                "action_verb": "Gom_rác",
                "atomic_instruction": "Chạm vào các mảnh giấy bỏ vào sọt rác.",
                "duration_sec": 60,
                "type": "chore_trash",
                "ui_type": "single_choice",
                "ui_data": {"prompt_text": "Chạm vào mảnh giấy nháp bỏ vào sọt rác dưới gầm bàn:"},
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 25},
                "hints": ["Bấm nút bỏ giấy vào thùng rác nào."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Mẩu giấy nháp cần được bỏ vào thùng rác nha!"}
            },
            {
                "badge": "Xếp sách vở",
                "action_verb": "Xếp_sách",
                "atomic_instruction": "Chạm vào chồng sách xếp ngay ngắn góc trái.",
                "duration_sec": 60,
                "type": "chore_books",
                "ui_type": "single_choice",
                "ui_data": {"prompt_text": "Chạm vào chồng sách để xếp ngay ngắn vào góc trái:"},
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 30},
                "hints": ["Xếp các cuốn sách ngay ngắn thẳng hàng góc trái."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Xếp sách thẳng hàng cùng Milo nhé!"}
            },
            {
                "badge": "Lau sạch mặt bàn",
                "action_verb": "Lau_bàn",
                "atomic_instruction": "Chạm khăn lau để mặt bàn sáng bóng sạch sẽ.",
                "duration_sec": 60,
                "type": "chore_wipe",
                "ui_type": "single_choice",
                "ui_data": {"prompt_text": "Chạm vào khăn lau để mặt bàn sáng bóng nhé:"},
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Bấm khăn lau để mặt bàn sáng bóng lấp lánh."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Dùng khăn lau sạch vết bụi trên mặt bàn nào!"}
            }
        ]
    },
    "chore_teeth": {
        "id": "chore_teeth",
        "grade": 1,
        "subject": "hoat_dong_trai_nghiem",
        "cat": "chore",
        "catName": "Vệ Sinh Cá Nhân",
        "icon": "🪥",
        "title": "Đánh răng đúng cách 2 phút buổi tối",
        "island": "routine",
        "reward": 100,
        "stepSeconds": 45,
        "original_text": "Em hãy tự giác đánh răng sạch sẽ trước khi đi ngủ: lấy kem bằng hạt đậu, chải đều mặt ngoài, trong và nhai trong 2 phút, sau đó súc miệng sạch và cất bàn chải vào cốc.",
        "final_answer": {
            "value": "Răng miệng sạch thơm tho",
            "unit": None,
            "normalized_display": "Răng miệng sạch thơm tho",
            "acceptable_variants": ["sạch sẽ", "thơm tho", "trắng sáng"]
        },
        "adhd_scaffolding_notes": {
            "working_memory_pitfall": "Trẻ dễ vội vã đánh qua loa dưới 30 giây do bồn chồn cơ thể.",
            "executive_function_scaffolding": "Đĩa đồng hồ đếm ngược êm dịu chia 3 nhịp: chuẩn bị -> chải 2 phút -> súc miệng.",
            "visual_or_concrete_aid": "Hoạt ảnh bọt xà phòng trắng xoay tròn trên hàm răng."
        },
        "steps": [
            {
                "badge": "Lấy kem đánh răng",
                "action_verb": "Lấy_kem",
                "atomic_instruction": "Lấy lượng kem bằng một hạt đậu nhỏ.",
                "duration_sec": 45,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Lấy lượng kem vừa đủ bằng một hạt đậu nhỏ lên đầu lông bàn chải:"},
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Chỉ cần một hạt đậu nhỏ là đủ rồi con nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Lấy kem bằng hạt đậu nhỏ thôi con nha!"}
            },
            {
                "badge": "Chải răng 2 phút",
                "action_verb": "Chải_răng",
                "atomic_instruction": "Chải xoay tròn mặt ngoài, trong và nhai.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Chải nhẹ nhàng xoay tròn mặt ngoài, mặt trong và mặt nhai:"},
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Đưa bàn chải theo vòng tròn nhẹ nhàng khắp hàm răng."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Chải đủ mặt ngoài, mặt trong và mặt nhai nhé!"}
            },
            {
                "badge": "Súc miệng sạch",
                "action_verb": "Súc_miệng",
                "atomic_instruction": "Súc miệng sạch và cất bàn chải vào cốc.",
                "duration_sec": 45,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Súc miệng sạch sẽ với nước và cất bàn chải vào cốc thẳng đứng:"},
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Súc miệng 2 lần với nước sạch và cất bàn chải."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Súc miệng thật sạch và cất cốc ngay ngắn nào!"}
            }
        ]
    },
    "chore_backpack": {
        "id": "chore_backpack",
        "grade": 1,
        "subject": "hoat_dong_trai_nghiem",
        "cat": "chore",
        "catName": "Tự Lập & Ngăn Nắp",
        "icon": "🎒",
        "title": "Tự chuẩn bị balo đi học ngày mai",
        "island": "routine",
        "reward": 120,
        "stepSeconds": 70,
        "original_text": "Trước khi đi ngủ, em hãy chuẩn bị balo theo thời khóa biểu ngày mai: xem sách vở cần mang, kiểm tra hộp bút có đủ 2 bút và 1 thước kẻ, và cho bình nước vào ngăn bên.",
        "final_answer": {
            "value": "Balo sẵn sàng đến trường",
            "unit": None,
            "normalized_display": "Balo sẵn sàng đến trường",
            "acceptable_variants": ["sẵn sàng", "đầy đủ", "ngăn nắp"]
        },
        "adhd_scaffolding_notes": {
            "working_memory_pitfall": "Thường quên các món đồ nhỏ như bút chì, thước kẻ hoặc bình nước cá nhân.",
            "executive_function_scaffolding": "Checklist trực quan 4 điểm chốt chặn ngăn ngừa bỏ quên.",
            "visual_or_concrete_aid": "Biểu tượng balo mở nắp với các ngăn phát sáng tương ứng từng món đồ."
        },
        "steps": [
            {
                "badge": "Thời khóa biểu",
                "action_verb": "Xem",
                "atomic_instruction": "Mở xem thời khóa biểu ngày mai đúng các môn.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Mở xem thời khóa biểu ngày mai để chọn đúng các môn học:"},
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Nhìn vào thời khóa biểu ngày mai xem có môn gì nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Xem thời khóa biểu ngày mai cùng Milo nha!"}
            },
            {
                "badge": "Xếp sách vở",
                "action_verb": "Xếp_sách",
                "atomic_instruction": "Xếp sách to ở trong, vở mỏng ở ngoài.",
                "duration_sec": 70,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Xếp sách to ở trong cùng, vở bài tập mỏng ở phía ngoài:"},
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 25},
                "hints": ["Sách to xếp vào lưng cặp, vở mỏng ở ngoài."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Sách to ở trong, vở mỏng ở ngoài nha con!"}
            },
            {
                "badge": "Kiểm tra hộp bút",
                "action_verb": "Kiểm_tra",
                "atomic_instruction": "Kiểm tra đủ 2 bút mực, 1 bút chì, 1 thước.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Đảm bảo có đủ 2 bút mực, 1 bút chì và 1 chiếc thước kẻ:"},
                "immediate_reinforcer": {"visual_asset": "milo_thumbs_up", "audio_cue": "gentle_pop_success", "dopamine_points": 30},
                "hints": ["Mở hộp bút đếm: 2 bút mực, 1 chì, 1 thước."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Kiểm tra đủ bút thước để mai làm bài tốt nhé!"}
            },
            {
                "badge": "Bình nước cá nhân",
                "action_verb": "Bỏ_bình",
                "atomic_instruction": "Cho bình nước đầy vào ngăn lưới bên hông.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Cho bình nước sạch đã rót đầy vào ngăn lưới bên hông balo:"},
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Bình nước uống sạch để ở túi lưới bên sườn."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Nhớ mang theo bình nước để nạp năng lượng con nha!"}
            }
        ]
    },
    "chore_bed": {
        "id": "chore_bed",
        "grade": 1,
        "subject": "hoat_dong_trai_nghiem",
        "cat": "chore",
        "catName": "Thói Quen Buổi Sáng",
        "icon": "🛏️",
        "title": "Gấp chăn gối gọn gàng sau khi thức dậy",
        "island": "routine",
        "reward": 100,
        "stepSeconds": 60,
        "original_text": "Mỗi buổi sáng khi thức dậy, em hãy tự giác gấp chăn màn: giũ phẳng chăn, gấp đôi làm tư vuông vắn và đặt gối ngay ngắn ở đầu giường.",
        "final_answer": {
            "value": "Giường ngủ ngăn nắp gọn gàng",
            "unit": None,
            "normalized_display": "Giường ngủ ngăn nắp gọn gàng",
            "acceptable_variants": ["gọn gàng", "ngăn nắp", "phẳng phiu"]
        },
        "adhd_scaffolding_notes": {
            "working_memory_pitfall": "Mới ngủ dậy não bộ còn quán tính giấc ngủ (Sleep Inertia), dễ bỏ qua việc gấp chăn.",
            "executive_function_scaffolding": "3 động tác cơ học cực đơn giản: giũ -> gấp tư -> xếp gối.",
            "visual_or_concrete_aid": "Hoạt ảnh chăn gấp tự động thành hình chữ nhật phẳng phiu."
        },
        "steps": [
            {
                "badge": "Giũ phẳng chăn",
                "action_verb": "Giũ",
                "atomic_instruction": "Giũ nhẹ để chăn trải phẳng trên giường.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Cầm hai mép chăn giũ nhẹ để chăn trải phẳng trên giường:"},
                "immediate_reinforcer": {"visual_asset": "sparkle_star_01", "audio_cue": "positive_bell_c6", "dopamine_points": 25},
                "hints": ["Cầm 2 góc chăn giũ cho phẳng phiu."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Giũ nhẹ chăn cho phẳng trước khi gấp con nhé!"}
            },
            {
                "badge": "Gấp chăn làm tư",
                "action_verb": "Gấp",
                "atomic_instruction": "Gấp đôi chăn rồi gấp lại thành hình vuông.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Gấp đôi chăn theo chiều dọc rồi gấp đôi lại thành hình vuông gọn:"},
                "immediate_reinforcer": {"visual_asset": "particle_burst_gold", "audio_cue": "sparkle_ting_short", "dopamine_points": 35},
                "hints": ["Gấp đôi một lần, rồi gấp đôi thêm một lần nữa."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Gấp đôi rồi gấp tư thành hình vuông gọn gàng nha!"}
            },
            {
                "badge": "Đặt gối ngay ngắn",
                "action_verb": "Đặt",
                "atomic_instruction": "Vỗ nhẹ gối và đặt sát đầu giường.",
                "duration_sec": 60,
                "type": "generic",
                "ui_type": "checkbox",
                "ui_data": {"prompt_text": "Vỗ nhẹ gối và đặt ngay ngắn sát đầu giường:"},
                "immediate_reinforcer": {"visual_asset": "confetti_cannon", "audio_cue": "harp_glissando_soft", "dopamine_points": 40},
                "hints": ["Vỗ nhẹ gối và xếp sát đầu giường nhé."],
                "success_criteria": {"evaluation_type": "exact_match", "expected_answer": True, "feedback_on_error": "Đặt chiếc gối êm ái sát đầu giường nào!"}
            }
        ]
    }
}

# Assemble full database of 29 tasks
task_database = {}

# Process 25 benchmark tasks
for b_id, cfg in BENCHMARK_TASK_CONFIGS.items():
    b_item = bench_map[b_id]
    
    # Compile steps
    compiled_steps = []
    for idx, s_cfg in enumerate(cfg["steps"]):
        gt_step = b_item["ground_truth_steps"][idx] if idx < len(b_item["ground_truth_steps"]) else {}
        is_final = (idx == len(cfg["steps"]) - 1)
        
        # Word count check
        words = s_cfg["atomic_instruction"].split()
        assert len(words) < 15, f"Instruction for {b_id} step {idx+1} exceeds 14 words: {len(words)} words ('{s_cfg['atomic_instruction']}')"
        
        # Verb regex check
        assert VERB_REGEX.match(s_cfg["action_verb"]), f"Invalid verb in {b_id} step {idx+1}: '{s_cfg['action_verb']}'"
        
        # UI type check
        assert s_cfg["ui_type"] in VALID_UI_TYPES, f"Invalid ui_type in {b_id} step {idx+1}: '{s_cfg['ui_type']}'"
        
        # Duration check
        assert 60 <= s_cfg["duration_sec"] <= 300, f"Invalid duration in {b_id} step {idx+1}: {s_cfg['duration_sec']}"
        
        # Reinforcer check
        reinf = s_cfg["immediate_reinforcer"]
        assert reinf["visual_asset"] in VALID_VISUAL_ASSETS
        assert reinf["audio_cue"] in VALID_AUDIO_CUES
        
        step_obj = {
            "step_id": idx + 1,
            "badge": s_cfg["badge"],
            "action_verb": s_cfg["action_verb"],
            "atomic_instruction": s_cfg["atomic_instruction"],
            "text": s_cfg["atomic_instruction"],
            "type": s_cfg.get("type", s_cfg["ui_type"]),
            "ui_type": s_cfg["ui_type"],
            "ui_data": s_cfg["ui_data"],
            "duration_sec": s_cfg["duration_sec"],
            "immediate_reinforcer": s_cfg["immediate_reinforcer"],
            "hints": s_cfg["hints"],
            "success_criteria": s_cfg["success_criteria"],
            "mathematical_or_logical_goal": gt_step.get("mathematical_or_logical_goal", ""),
            "intermediate_output": gt_step.get("intermediate_output", ""),
            "is_final_step": is_final
        }
        compiled_steps.append(step_obj)
        
    task_database[b_id] = {
        "id": b_id,
        "grade": b_item["grade"],
        "subject": b_item["subject"],
        "cat": cfg["cat"],
        "catName": cfg["catName"],
        "icon": cfg["icon"],
        "title": cfg["title"],
        "island": "study",
        "reward": cfg["reward"],
        "stepSeconds": cfg["stepSeconds"],
        "original_text": b_item["original_text"],
        "final_answer": b_item["final_answer"],
        "adhd_scaffolding_notes": b_item["adhd_scaffolding_notes"],
        "steps": compiled_steps
    }

# Process 4 routine tasks
for r_id, r_cfg in ROUTINE_TASK_CONFIGS.items():
    compiled_steps = []
    for idx, s_cfg in enumerate(r_cfg["steps"]):
        is_final = (idx == len(r_cfg["steps"]) - 1)
        words = s_cfg["atomic_instruction"].split()
        assert len(words) < 15, f"Instruction for {r_id} step {idx+1} exceeds 14 words: {len(words)} words"
        assert VERB_REGEX.match(s_cfg["action_verb"]), f"Invalid verb in {r_id} step {idx+1}: '{s_cfg['action_verb']}'"
        assert s_cfg["ui_type"] in VALID_UI_TYPES
        assert 45 <= s_cfg["duration_sec"] <= 300
        reinf = s_cfg["immediate_reinforcer"]
        assert reinf["visual_asset"] in VALID_VISUAL_ASSETS
        assert reinf["audio_cue"] in VALID_AUDIO_CUES
        
        step_obj = {
            "step_id": idx + 1,
            "badge": s_cfg["badge"],
            "action_verb": s_cfg["action_verb"],
            "atomic_instruction": s_cfg["atomic_instruction"],
            "text": s_cfg["atomic_instruction"],
            "type": s_cfg["type"],
            "ui_type": s_cfg["ui_type"],
            "ui_data": s_cfg["ui_data"],
            "duration_sec": s_cfg["duration_sec"],
            "immediate_reinforcer": s_cfg["immediate_reinforcer"],
            "hints": s_cfg["hints"],
            "success_criteria": s_cfg["success_criteria"],
            "is_final_step": is_final
        }
        compiled_steps.append(step_obj)
        
    task_database[r_id] = {
        "id": r_id,
        "grade": r_cfg["grade"],
        "subject": r_cfg["subject"],
        "cat": r_cfg["cat"],
        "catName": r_cfg["catName"],
        "icon": r_cfg["icon"],
        "title": r_cfg["title"],
        "island": r_cfg["island"],
        "reward": r_cfg["reward"],
        "stepSeconds": r_cfg["stepSeconds"],
        "original_text": r_cfg["original_text"],
        "final_answer": r_cfg["final_answer"],
        "adhd_scaffolding_notes": r_cfg["adhd_scaffolding_notes"],
        "steps": compiled_steps
    }

print(f"Successfully compiled all {len(task_database)} tasks (25 benchmark + 4 routine)!")

# Breakdown statistics
by_cat = {}
by_grade = {}
total_steps = 0
for t in task_database.values():
    by_cat[t["cat"]] = by_cat.get(t["cat"], 0) + 1
    by_grade[t["grade"]] = by_grade.get(t["grade"], 0) + 1
    total_steps += len(t["steps"])

print(f"By category: {by_cat}")
print(f"By grade: {by_grade}")
print(f"Total steps: {total_steps}")

# Save JSON file in explorer_m1_2
with open(".agents/teamwork/explorer_m1_2/ingested_task_database.json", "w", encoding="utf-8") as f:
    json.dump(task_database, f, ensure_ascii=False, indent=2)
print("Saved to .agents/teamwork/explorer_m1_2/ingested_task_database.json")
