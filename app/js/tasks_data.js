window.TASKS_DB = {
  "G1_MATH_01": {
    "id": "G1_MATH_01",
    "grade": 1,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "exercise_type": "word_problem",
    "icon": "🐦",
    "title": "Cộng số chim trên cành (Phép cộng phạm vi 10)",
    "island": "study",
    "reward": 120,
    "stepSeconds": 60,
    "original_text": "Trên cành cây có 5 con chim đang đậu. Lát sau có thêm 3 con chim nữa bay đến đậu cùng. Hỏi trên cành cây lúc này có tất cả bao nhiêu con chim?",
    "final_answer": {
      "value": 8,
      "unit": "con chim",
      "normalized_display": "8 con chim",
      "acceptable_variants": [
        "8",
        "8 con",
        "8 con chim"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ dễ bị xao nhãng bởi từ ngữ miêu tả 'cành cây', 'bay đến' và quên mất số lượng ban đầu.",
      "executive_function_scaffolding": "Tách từ khóa số lượng và từ khóa định hướng 'tất cả' để liên kết với phép cộng trước khi tính toán.",
      "visual_or_concrete_aid": "Biểu tượng 5 chấm tròn màu xanh + 3 chấm tròn màu đỏ trên màn hình."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Trên cành cây có 5 con chim đang đậu. Lát sau có thêm 3 con chim nữa. Hỏi có tất cả bao nhiêu con chim?",
          "highlight_target_segments": [
            "5 con chim",
            "3 con chim",
            "tất cả"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Tìm hai số lượng chim và từ khóa 'tất cả' nhé con!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "5 con chim",
            "3 con chim",
            "tất cả"
          ],
          "feedback_on_error": "Milo cùng con tìm 2 số lượng chim và từ 'tất cả' nhé!"
        },
        "mathematical_or_logical_goal": "Nhận diện dữ kiện đã cho và từ khóa chỉ định toán tử",
        "intermediate_output": "Ban đầu: 5 con; thêm vào: 3 con; từ khóa: tất cả",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Ý Nghĩa Từ Khóa",
        "action_verb": "Chọn",
        "atomic_instruction": "Từ khóa 'tất cả' cho biết chúng mình cần gộp lại hay bớt đi?",
        "text": "Từ khóa 'tất cả' cho biết chúng mình cần gộp lại hay bớt đi?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ 'tất cả' cho biết ta cần thực hiện thao tác gì?",
          "options": [
            "Gộp lại (Phép cộng +)",
            "Bớt đi (Phép trừ -)"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Hỏi 'tất cả' là gom chung hai nhóm lại với nhau, ta làm phép cộng (+)."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Gộp lại (Phép cộng +)",
          "feedback_on_error": "Từ 'tất cả' nghĩa là gộp lại bằng phép cộng (+) con nhé!"
        },
        "mathematical_or_logical_goal": "Liên kết ngữ nghĩa từ khóa với toán tử số học",
        "intermediate_output": "tất cả -> phép cộng (+)",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phép Tính",
        "action_verb": "Chọn",
        "atomic_instruction": "Vì cần gộp lại 'tất cả', phép tính đúng là gì?",
        "text": "Vì cần gộp lại 'tất cả', phép tính đúng là gì?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Với từ khóa 'tất cả', con chọn phép tính nào?",
          "options": [
            "5 + 3",
            "5 - 3"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Gộp 5 con chim và 3 con chim ta có phép tính 5 + 3."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "5 + 3",
          "feedback_on_error": "Gộp lại thì mình chọn 5 + 3 con nhé!"
        },
        "mathematical_or_logical_goal": "Lựa chọn biểu thức số học",
        "intermediate_output": "5 + 3",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Đáp Số",
        "action_verb": "Tính",
        "atomic_instruction": "Tính kết quả 5 cộng 3 bằng bao nhiêu.",
        "text": "Tính kết quả 5 cộng 3 bằng bao nhiêu.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "5 + 3 = ?",
          "placeholder": "Nhập số chim..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Đếm thêm 3 từ 5: 6, 7, 8!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "8",
          "feedback_on_error": "5 cộng 3 bằng 8 con chim nhé!"
        },
        "mathematical_or_logical_goal": "Tính toán và kết luận kèm danh số",
        "intermediate_output": "8 con chim",
        "is_final_step": true
      }
    ]
  },
  "G1_MATH_02": {
    "id": "G1_MATH_02",
    "grade": 1,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🍊",
    "title": "Tính số cam còn lại của mẹ (Phép trừ phạm vi 20)",
    "island": "study",
    "reward": 120,
    "stepSeconds": 60,
    "original_text": "Mẹ mua về 18 quả cam. Cả nhà đã ăn hết 6 quả cam. Hỏi mẹ còn lại bao nhiêu quả cam?",
    "final_answer": {
      "value": 12,
      "unit": "quả cam",
      "normalized_display": "12 quả cam",
      "acceptable_variants": [
        "12",
        "12 quả",
        "12 quả cam"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Hay nhầm lẫn giữa phép tính cộng và trừ khi đọc lướt qua từ 'còn lại'.",
      "executive_function_scaffolding": "Khóa sự chú ý vào hành động 'đã ăn hết' mang ý nghĩa bớt đi.",
      "visual_or_concrete_aid": "Bảng cấu tạo số tách 18 thành 10 và 8; gạch bỏ 6 đơn vị từ 8."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Mẹ mua về 18 quả cam. Cả nhà đã ăn hết 6 quả cam. Hỏi mẹ còn lại bao nhiêu quả cam?",
          "highlight_target_segments": [
            "18 quả cam",
            "6 quả cam",
            "còn lại"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Tìm số 18 quả cam, 6 quả cam và từ 'còn lại' nhé con!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "18 quả cam",
            "6 quả cam",
            "còn lại"
          ],
          "feedback_on_error": "Milo cùng con tìm số 18 quả cam, 6 quả cam và chữ 'còn lại' nhé!"
        },
        "mathematical_or_logical_goal": "Nhận diện số liệu đầu vào và từ khóa toán tử",
        "intermediate_output": "Có: 18 quả; Đã ăn: 6 quả; Từ khóa: còn lại",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Ý Nghĩa Từ Khóa",
        "action_verb": "Chọn",
        "atomic_instruction": "Từ khóa 'còn lại' sau khi đã ăn hết cho biết chúng mình cần làm gì?",
        "text": "Từ khóa 'còn lại' sau khi đã ăn hết cho biết chúng mình cần làm gì?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ 'còn lại' sau khi đã ăn hết tương ứng với thao tác gì?",
          "options": [
            "Bớt đi (Phép trừ -)",
            "Gộp lại (Phép cộng +)"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Ăn hết nghĩa là bớt đi, ta làm phép trừ (-)."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Bớt đi (Phép trừ -)",
          "feedback_on_error": "Ăn hết là bớt đi, ta làm phép trừ (-) con nhé!"
        },
        "mathematical_or_logical_goal": "Liên kết ngữ nghĩa từ khóa với toán tử",
        "intermediate_output": "còn lại -> phép trừ (-)",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phép Tính",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phép trừ đúng để tìm số cam còn lại của mẹ.",
        "text": "Chọn phép trừ đúng để tìm số cam còn lại của mẹ.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Phép tính đúng để tìm số cam còn lại là:",
          "options": [
            "18 - 6",
            "18 + 6"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Lấy 18 quả ban đầu trừ đi 6 quả đã ăn."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "18 - 6",
          "feedback_on_error": "Lấy 18 trừ 6 con nhé!"
        },
        "mathematical_or_logical_goal": "Thiết lập biểu thức số học",
        "intermediate_output": "18 - 6",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Đáp Số",
        "action_verb": "Tính",
        "atomic_instruction": "Tính kết quả 18 trừ 6 bằng bao nhiêu.",
        "text": "Tính kết quả 18 trừ 6 bằng bao nhiêu.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "18 - 6 = ?",
          "placeholder": "Nhập số cam còn lại..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "8 trừ 6 bằng 2, thêm 1 chục là 12."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "12",
          "feedback_on_error": "18 trừ 6 bằng 12 quả cam con nhé!"
        },
        "mathematical_or_logical_goal": "Tính toán và đưa ra kết quả cuối cùng",
        "intermediate_output": "12 quả cam",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G1_VIET_03": {
    "id": "G1_VIET_03",
    "grade": 1,
    "subject": "Tiếng Việt",
    "cat": "viet",
    "catName": "Tiếng Việt GDPT",
    "exercise_type": "reading_comprehension",
    "reading_passage": "Buổi sáng sớm, chú gà trống cất tiếng gáy vang báo hiệu ngày mới. Mặt trời từ từ nhô lên đỏ rực. Bé Mai thức dậy, đánh răng, rửa mặt rồi vui vẻ cùng mẹ đi bộ đến trường tiểu học.",
    "icon": "🐓",
    "title": "Đọc hiểu: Ai cất tiếng gáy vang buổi sáng?",
    "island": "study",
    "reward": 120,
    "stepSeconds": 70,
    "original_text": "Đọc đoạn văn sau và trả lời câu hỏi: 'Buổi sáng sớm, chú gà trống cất tiếng gáy vang báo hiệu ngày mới. Mặt trời từ từ nhô lên đỏ rực. Bé Mai thức dậy, đánh răng, rửa mặt rồi vui vẻ cùng mẹ đi bộ đến trường tiểu học.'\nCâu hỏi: Ai là người cất tiếng gáy vang vào buổi sáng sớm?",
    "final_answer": {
      "value": "chú gà trống",
      "unit": null,
      "normalized_display": "chú gà trống",
      "acceptable_variants": [
        "chú gà trống",
        "gà trống",
        "Chú gà trống",
        "con gà trống"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ bị thu hút bởi tên nhân vật người 'Bé Mai' ở câu cuối mà vội vã chọn Mai thay vì gà trống.",
      "executive_function_scaffolding": "Chỉ dẫn đọc dò từng dòng (Line-by-line reading mask) và ghim đoạn văn tham chiếu.",
      "visual_or_concrete_aid": "Ghim đoạn văn đọc hiểu trên đầu kèm gạch chân từ khóa."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dò Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân cụm từ 'cất tiếng gáy vang' trong câu chuyện.",
        "text": "Gạch chân cụm từ 'cất tiếng gáy vang' trong câu chuyện.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm cụm từ gáy vang trong câu chuyện:",
          "highlight_target_segments": [
            "cất tiếng gáy vang"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Nhìn vào dòng thứ nhất của câu chuyện nhé."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "cất tiếng gáy vang"
          ],
          "feedback_on_error": "Con tìm cụm từ cất tiếng gáy vang ở dòng đầu nha!"
        },
        "mathematical_or_logical_goal": "Định vị từ khóa mục tiêu trong văn bản",
        "intermediate_output": "Cụm từ khóa: 'cất tiếng gáy vang'",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Ai Đã Gáy",
        "action_verb": "Dò",
        "atomic_instruction": "Nhìn ngay trước cụm từ 'cất tiếng gáy vang', ai là nhân vật thực hiện hành động?",
        "text": "Nhìn ngay trước cụm từ 'cất tiếng gáy vang', ai là nhân vật thực hiện hành động?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Ai đứng ngay trước cụm từ 'cất tiếng gáy vang'?",
          "options": [
            "chú gà trống",
            "Mặt trời",
            "Bé Mai"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Trong câu: 'Buổi sáng sớm, chú gà trống cất tiếng gáy vang...'"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "chú gà trống",
          "feedback_on_error": "Đó chính là chú gà trống đấy con!"
        },
        "mathematical_or_logical_goal": "Đối chiếu chủ ngữ thực hiện hành động",
        "intermediate_output": "'chú gà trống cất tiếng gáy vang'",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Trả Lời Câu Hỏi",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn câu trả lời chính xác cho câu hỏi của bài.",
        "text": "Chọn câu trả lời chính xác cho câu hỏi của bài.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Câu hỏi: Ai là người cất tiếng gáy vang vào buổi sáng sớm?",
          "options": [
            "Chú gà trống",
            "Bé Mai",
            "Mặt trời"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Chú gà trống cất tiếng gáy vang báo hiệu ngày mới."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Chú gà trống",
          "feedback_on_error": "Đáp án đúng là Chú gà trống nha!"
        },
        "mathematical_or_logical_goal": "Trích xuất câu trả lời đọc hiểu hoàn chỉnh",
        "intermediate_output": "Chú gà trống",
        "is_final_step": true
      }
    ]
  },
  "G1_MCQ_04": {
    "id": "G1_MCQ_04",
    "grade": 1,
    "subject": "Khoa học & Tự nhiên xã hội",
    "cat": "math",
    "catName": "TNXH & Hình Học",
    "exercise_type": "geometry",
    "geometry_spec": {
      "shape_type": "house_counting",
      "dimensions": {
        "roof": "tam giác đỏ",
        "wall": "hình vuông vàng",
        "door": "hình chữ nhật nâu",
        "windows": "2 hình tròn xanh dương"
      },
      "target": "hình tròn"
    },
    "icon": "🏠",
    "title": "Đếm số hình tròn trên mô hình ngôi nhà",
    "island": "study",
    "reward": 110,
    "stepSeconds": 60,
    "original_text": "Có bao nhiêu cửa sổ hình tròn trong ngôi nhà này?",
    "final_answer": {
      "value": "2",
      "unit": "cửa sổ",
      "normalized_display": "2 cửa sổ hình tròn",
      "acceptable_variants": [
        "2",
        "2 cửa sổ",
        "2 hình tròn",
        "hai",
        "hai cửa sổ"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Dễ bị quá tải thị giác nếu đưa hình ngôi nhà ngay từ bước 1.",
      "executive_function_scaffolding": "Bước 1 đọc đề sạch sẽ, Bước 2 tương tác chạm cửa sổ tròn trên SVG, Bước 3 đếm tổng kết.",
      "visual_or_concrete_aid": "Mô hình SVG ngôi nhà với 2 cửa sổ hình tròn màu xanh dương tương tác chạm trực tiếp."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân từ khóa chỉ hình học trong câu hỏi.",
        "text": "Gạch chân từ khóa chỉ hình học trong câu hỏi.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Có bao nhiêu cửa sổ hình tròn trong ngôi nhà này?",
          "highlight_target_segments": [
            "hình tròn"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Tìm từ 'hình tròn' trong câu hỏi nhé con!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "hình tròn"
          ],
          "feedback_on_error": "Milo cùng con tìm từ 'hình tròn' nhé!"
        },
        "mathematical_or_logical_goal": "Đọc đề bài và định vị từ khóa hình học tiêu điểm",
        "intermediate_output": "hình tròn",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Xác Định Cửa Sổ Tròn",
        "action_verb": "Chạm_hình",
        "atomic_instruction": "Bé hãy chạm vào cửa sổ hình tròn trên ngôi nhà bên dưới.",
        "text": "Bé hãy chạm vào cửa sổ hình tròn trên ngôi nhà bên dưới.",
        "type": "single_choice",
        "ui_type": "shape_touch",
        "ui_data": {
          "prompt_text": "Xác định cửa sổ hình tròn: Bé hãy chạm vào cửa sổ hình tròn 🔵 trên ngôi nhà bên dưới nhé!",
          "geometry_spec": {
            "shape_type": "house_counting",
            "dimensions": {
              "roof": "tam giác đỏ",
              "wall": "hình vuông vàng",
              "door": "hình chữ nhật nâu",
              "windows": "2 hình tròn xanh dương"
            },
            "target": "hình tròn"
          },
          "options": [],
          "hide_choice_options": true
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Bé hãy chạm vào 1 trong 2 ô cửa sổ tròn màu xanh trên thân nhà nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Hai ô cửa sổ (Hình tròn 🔵)",
          "feedback_on_error": "Đó chính là hai ô cửa sổ hình tròn màu xanh đấy con!"
        },
        "mathematical_or_logical_goal": "Xác định vật thể hình tròn qua tương tác xúc giác SVG",
        "intermediate_output": "Cửa sổ -> hình tròn",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Đếm Tổng Số Lượng",
        "action_verb": "Chọn",
        "atomic_instruction": "Vậy tổng cộng có bao nhiêu cửa sổ hình tròn?",
        "text": "Vậy tổng cộng có bao nhiêu cửa sổ hình tròn?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Vậy tổng cộng có bao nhiêu cửa sổ hình tròn?",
          "options": [
            "2 cửa sổ",
            "1 cửa sổ",
            "3 cửa sổ",
            "4 cửa sổ"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Có 2 ô cửa sổ tròn trên ngôi nhà con nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "2 cửa sổ",
          "feedback_on_error": "Có 2 cửa sổ hình tròn con nha!"
        },
        "mathematical_or_logical_goal": "Tổng kết số lượng đếm được",
        "intermediate_output": "2 cửa sổ hình tròn",
        "is_final_step": true
      }
    ]
  },
  "G1_ENG_05": {
    "id": "G1_ENG_05",
    "grade": 1,
    "subject": "Tiếng Anh",
    "cat": "eng",
    "catName": "Tiếng Anh Tiểu Học",
    "exercise_type": "reading_comprehension",
    "reading_passage": "Look at my new pencil. It is ______ (Màu đỏ).",
    "icon": "✏️",
    "title": "English Vocabulary: Màu sắc của cây bút chì (Colors)",
    "island": "study",
    "reward": 120,
    "stepSeconds": 60,
    "original_text": "Choose the correct word to complete the sentence:\n'Look at my new pencil. It is ______.' (Màu đỏ)",
    "final_answer": {
      "value": "C",
      "unit": null,
      "normalized_display": "C. red",
      "acceptable_variants": [
        "C",
        "C.",
        "red",
        "C. red"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Nhầm lẫn giữa các từ màu sắc bắt đầu bằng phụ âm tương tự hoặc màu quen thuộc.",
      "executive_function_scaffolding": "Đọc câu mẫu tiếng Anh, xác định nghĩa tiếng Việt cần tìm rồi mới truy xuất từ vựng tương ứng.",
      "visual_or_concrete_aid": "Ghim câu tiếng Anh trên đầu kèm nghĩa tiếng Việt trong ngoặc."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xác Định Nghĩa",
        "action_verb": "Chọn",
        "atomic_instruction": "Quan sát câu tiếng Anh ở trên, từ trong ngoặc yêu cầu tìm màu gì?",
        "text": "Quan sát câu tiếng Anh ở trên, từ trong ngoặc yêu cầu tìm màu gì?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Gợi ý trong dấu ngoặc (Màu đỏ) yêu cầu con điền màu gì?",
          "options": [
            "Màu đỏ",
            "Màu xanh da trời",
            "Màu vàng"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Nhìn vào chữ trong dấu ngoặc đơn: '(Màu đỏ)'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Màu đỏ",
          "feedback_on_error": "Từ trong ngoặc là Màu đỏ con nhé!"
        },
        "mathematical_or_logical_goal": "Xác định nghĩa mục tiêu",
        "intermediate_output": "Nghĩa: Màu đỏ",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Nhớ Từ Vựng",
        "action_verb": "Nhớ",
        "atomic_instruction": "Màu đỏ trong tiếng Anh được viết là gì?",
        "text": "Màu đỏ trong tiếng Anh được viết là gì?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ tiếng Anh nào có nghĩa là 'màu đỏ'?",
          "options": [
            "red",
            "blue",
            "yellow",
            "green"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Bắt đầu bằng chữ r... red!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "red",
          "feedback_on_error": "Màu đỏ tiếng Anh là 'red' con nhé!"
        },
        "mathematical_or_logical_goal": "Truy xuất trí nhớ từ vựng L1 -> L2",
        "intermediate_output": "red",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Hoàn Thành Câu",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn từ đúng để điền vào chỗ trống: 'It is ______.'",
        "text": "Chọn từ đúng để điền vào chỗ trống: 'It is ______.'",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Look at my new pencil. It is ______.",
          "options": [
            "A. blue",
            "B. green",
            "C. red",
            "D. yellow"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Điền 'red' vào chỗ trống tương ứng với phương án C."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "C. red",
          "feedback_on_error": "Phương án C. red là đáp án chính xác!"
        },
        "mathematical_or_logical_goal": "Hoàn thiện câu hoàn chỉnh",
        "intermediate_output": "It is red. (Phương án C)",
        "is_final_step": true
      }
    ]
  },
  "G2_MATH_06": {
    "id": "G2_MATH_06",
    "grade": 2,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🌳",
    "title": "Bài toán Đội Hai trồng cây (Nhiều hơn một số đơn vị)",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Đội Một trồng được 35 cây xanh. Đội Hai trồng được nhiều hơn Đội Một 18 cây xanh. Hỏi Đội Hai trồng được bao nhiêu cây xanh?",
    "final_answer": {
      "value": 53,
      "unit": "cây xanh",
      "normalized_display": "53 cây xanh",
      "acceptable_variants": [
        "53",
        "53 cây",
        "53 cây xanh"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Quên phần 'nhớ 1' sang hàng chục dẫn đến kết quả sai phổ biến là 43.",
      "executive_function_scaffolding": "Chia phép cộng thành 2 thao tác: tính hàng đơn vị riêng và cộng hàng chục có nhớ riêng.",
      "visual_or_concrete_aid": "Hộp ghi nhớ số 1 nhỏ đặt trên đỉnh cột hàng chục."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Đội Một trồng được 35 cây xanh. Đội Hai trồng được nhiều hơn Đội Một 18 cây xanh. Hỏi Đội Hai trồng được bao nhiêu cây xanh?",
          "highlight_target_segments": [
            "35 cây xanh",
            "18 cây xanh",
            "nhiều hơn"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 35 cây xanh, 18 cây xanh và từ 'nhiều hơn' nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "35 cây xanh",
            "18 cây xanh",
            "nhiều hơn"
          ],
          "feedback_on_error": "Milo cùng con tìm 35 cây xanh, 18 cây xanh và từ 'nhiều hơn' nhé!"
        },
        "mathematical_or_logical_goal": "Nhận diện dữ kiện và từ khóa chỉ phép toán",
        "intermediate_output": "Đội 1: 35 cây; Đội 2 nhiều hơn: 18 cây",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Ý Nghĩa Từ Khóa",
        "action_verb": "Chọn",
        "atomic_instruction": "Từ khóa 'nhiều hơn' cho biết ta cần làm phép tính gì để tìm số cây Đội Hai?",
        "text": "Từ khóa 'nhiều hơn' cho biết ta cần làm phép tính gì để tìm số cây Đội Hai?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ 'nhiều hơn' cho biết số cây của Đội Hai tính bằng phép tính nào?",
          "options": [
            "Cộng thêm (Phép cộng +)",
            "Bớt đi (Phép trừ -)"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Nhiều hơn nghĩa là cộng thêm."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Cộng thêm (Phép cộng +)",
          "feedback_on_error": "Nhiều hơn là làm phép cộng (+) nha con!"
        },
        "mathematical_or_logical_goal": "Liên kết từ khóa với toán tử cộng",
        "intermediate_output": "nhiều hơn -> phép cộng (+)",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phép Tính",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn biểu thức tính số cây của Đội Hai.",
        "text": "Chọn biểu thức tính số cây của Đội Hai.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Phép tính tìm số cây Đội Hai là:",
          "options": [
            "35 + 18",
            "35 - 18"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Lấy 35 cộng với 18."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "35 + 18",
          "feedback_on_error": "Ta lấy 35 + 18 nhé!"
        },
        "mathematical_or_logical_goal": "Thiết lập phép tính",
        "intermediate_output": "35 + 18",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Cộng Có Nhớ",
        "action_verb": "Tính",
        "atomic_instruction": "Tính 35 + 18 bằng bao nhiêu cây xanh.",
        "text": "Tính 35 + 18 bằng bao nhiêu cây xanh.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "35 + 18 = ?",
          "placeholder": "Nhập số cây..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "5 + 8 = 13 viết 3 nhớ 1; 3 + 1 = 4 thêm 1 bằng 5."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "53",
          "feedback_on_error": "35 + 18 = 53 cây xanh nha con!"
        },
        "mathematical_or_logical_goal": "Thực hiện phép cộng có nhớ",
        "intermediate_output": "53 cây xanh",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G2_MATH_07": {
    "id": "G2_MATH_07",
    "grade": 2,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🛢️",
    "title": "Tính lít dầu còn lại trong can (Bảng nhân 5 & Trừ)",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Có 5 can đựng dầu, mỗi can chứa 4 lít dầu. Người ta đã lấy ra 7 lít dầu để dùng. Hỏi trong 5 can đó còn lại tất cả bao nhiêu lít dầu?",
    "final_answer": {
      "value": 13,
      "unit": "lít",
      "normalized_display": "13 lít dầu",
      "acceptable_variants": [
        "13",
        "13 lít",
        "13 l",
        "13 lít dầu"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ thường dừng lại ngay sau bước 1 (4 x 5 = 20) do thỏa mãn với một phép tính và quên bước trừ 7.",
      "executive_function_scaffolding": "Checklist 2 hộp kiểm: [ ] Tính tổng dầu [ ] Trừ phần đã dùng.",
      "visual_or_concrete_aid": "Vẽ 5 can dầu minh họa, sau đó hiển thị mũi tên rút bớt 7 lít ra ngoài."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Có 5 can đựng dầu, mỗi can chứa 4 lít dầu. Người ta đã lấy ra 7 lít dầu để dùng. Hỏi trong 5 can đó còn lại tất cả bao nhiêu lít dầu?",
          "highlight_target_segments": [
            "5 can",
            "4 lít dầu",
            "7 lít dầu",
            "còn lại"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Tìm 5 can, 4 lít dầu, 7 lít dầu và chữ 'còn lại' nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "5 can",
            "4 lít dầu",
            "7 lít dầu",
            "còn lại"
          ],
          "feedback_on_error": "Gạch chân đủ 5 can, 4 lít dầu, 7 lít dầu và 'còn lại' nha!"
        },
        "mathematical_or_logical_goal": "Nhận diện dữ kiện toán 2 bước",
        "intermediate_output": "5 can x 4 lít; lấy ra 7 lít; tìm còn lại",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tính Tổng Lít Dầu",
        "action_verb": "Nhân",
        "atomic_instruction": "Tính 5 can, mỗi can 4 lít có tất cả bao nhiêu lít dầu.",
        "text": "Tính 5 can, mỗi can 4 lít có tất cả bao nhiêu lít dầu.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "4 × 5 = ? (lít)",
          "placeholder": "Nhập tổng số lít..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "4 nhân 5 bằng 20 lít."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "20",
          "feedback_on_error": "4 x 5 = 20 lít dầu nha con!"
        },
        "mathematical_or_logical_goal": "Áp dụng bảng nhân",
        "intermediate_output": "20 lít",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phép Trừ Còn Lại",
        "action_verb": "Chọn",
        "atomic_instruction": "Lấy ra 7 lít để dùng, ta chọn phép tính trừ nào để tìm số dầu còn lại?",
        "text": "Lấy ra 7 lít để dùng, ta chọn phép tính trừ nào để tìm số dầu còn lại?",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Phép tính tìm số dầu còn lại là:",
          "options": [
            "20 - 7",
            "20 + 7"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Lấy tổng 20 lít trừ đi 7 lít đã dùng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "20 - 7",
          "feedback_on_error": "Ta làm phép trừ 20 - 7 nhé!"
        },
        "mathematical_or_logical_goal": "Thiết lập bước trừ",
        "intermediate_output": "20 - 7",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Lít Dầu Còn Lại",
        "action_verb": "Tính",
        "atomic_instruction": "Tính 20 trừ 7 bằng bao nhiêu lít dầu.",
        "text": "Tính 20 trừ 7 bằng bao nhiêu lít dầu.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "20 - 7 = ?",
          "placeholder": "Nhập số dầu còn lại..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "20 trừ 7 bằng 13."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "13",
          "feedback_on_error": "20 - 7 = 13 lít dầu con nhé!"
        },
        "mathematical_or_logical_goal": "Tính toán đáp số cuối",
        "intermediate_output": "13 lít dầu",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G2_VIET_08": {
    "id": "G2_VIET_08",
    "grade": 2,
    "subject": "Tiếng Việt",
    "cat": "viet",
    "catName": "Tiếng Việt GDPT",
    "icon": "🥬",
    "title": "Đọc hiểu: Nhận diện mẫu câu Ai làm gì? (Nam giúp bà)",
    "island": "study",
    "reward": 120,
    "stepSeconds": 70,
    "original_text": "Đọc đoạn văn sau:\n'Mỗi buổi chiều sau giờ học, Nam thường giúp bà tưới những luống rau xanh mướt sau vườn. Chú cún Mực lon ton chạy quanh đôi chân Nam như muốn cùng tham gia.'\nCâu hỏi: Sau giờ học mỗi buổi chiều, Nam thường làm việc gì để giúp bà?",
    "final_answer": {
      "value": "tưới những luống rau sau vườn",
      "unit": null,
      "normalized_display": "tưới những luống rau sau vườn",
      "acceptable_variants": [
        "tưới rau",
        "tưới những luống rau sau vườn",
        "tưới rau sau vườn",
        "tưới những luống rau",
        "tưới rau giúp bà"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ bị phân tâm bởi câu thứ hai tả 'chú cún Mực lon ton' nên ghi nhầm hành động chơi với cún.",
      "executive_function_scaffolding": "Lọc theo từ khóa mục tiêu: 'Nam' + 'giúp bà'.",
      "visual_or_concrete_aid": "Gạch chân hành động của Nam bằng nét đơn xanh, gạch chân chú cún bằng nét đứt xám."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xác Định Chủ Thể",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm đối tượng Nam thực hiện việc sau giờ học.",
        "text": "Tìm đối tượng Nam thực hiện việc sau giờ học.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm tên bạn nhỏ trong câu đầu tiên:",
          "highlight_target_segments": [
            "Nam"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Bạn nhỏ giúp bà tên là Nam."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "Nam"
          ],
          "feedback_on_error": "Bạn nhỏ tên là Nam nhé!"
        },
        "mathematical_or_logical_goal": "Neo định ngữ cảnh câu hỏi",
        "intermediate_output": "Thời gian: chiều sau giờ học; Người: Nam",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Cụm Hành Động",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân việc Nam tưới những luống rau.",
        "text": "Gạch chân việc Nam tưới những luống rau.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Nam làm việc gì giúp bà sau giờ học?",
          "highlight_target_segments": [
            "tưới những luống rau xanh mướt sau vườn"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Hành động là tưới những luống rau sau vườn."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "tưới những luống rau xanh mướt sau vườn"
          ],
          "feedback_on_error": "Hành động là tưới những luống rau xanh mướt sau vườn!"
        },
        "mathematical_or_logical_goal": "Trích xuất cụm vị ngữ chỉ hoạt động",
        "intermediate_output": "'tưới những luống rau xanh mướt sau vườn'",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Câu Trả Lời",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn hành động tưới những luống rau sau vườn.",
        "text": "Chọn hành động tưới những luống rau sau vườn.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Mẫu câu Ai làm gì trong bài diễn tả việc gì?",
          "options": [
            "tưới những luống rau sau vườn",
            "chơi cùng cún Mực",
            "đi xem phim"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Chọn đáp án tưới rau giúp bà."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "tưới những luống rau sau vườn",
          "feedback_on_error": "Nam tưới những luống rau sau vườn nha!"
        },
        "mathematical_or_logical_goal": "Khái quát câu trả lời",
        "intermediate_output": "tưới những luống rau sau vườn",
        "is_final_step": true
      }
    ]
  },
  "G2_MCQ_09": {
    "id": "G2_MCQ_09",
    "grade": 2,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "📏",
    "title": "Đổi đơn vị mét sang đề-xi-mét (Đoạn dây của An)",
    "island": "study",
    "reward": 120,
    "stepSeconds": 70,
    "original_text": "Một sợi dây dài 1 m. Bạn An cắt lấy một đoạn dài 4 dm để buộc bưu phẩm. Hỏi đoạn dây còn lại dài bao nhiêu đề-xi-mét?",
    "final_answer": {
      "value": "B",
      "unit": null,
      "normalized_display": "B. 6 dm",
      "acceptable_variants": [
        "B",
        "B.",
        "6 dm",
        "6",
        "B. 6 dm"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Bỏ qua bước đổi đơn vị và cố gắng tính 1 - 4 hoặc 1 + 4.",
      "executive_function_scaffolding": "Quy tắc vàng: 'Trước khi cộng trừ, hãy nhìn xem đơn vị có giống nhau không?'.",
      "visual_or_concrete_aid": "Thước đo 1 mét chia thành 10 vạch đề-xi-mét rõ ràng."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu, đơn vị và từ khóa quan trọng.",
        "text": "Gạch chân các số liệu, đơn vị và từ khóa quan trọng.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Một sợi dây dài 1 m. Bạn An cắt lấy một đoạn dài 4 dm để buộc bưu phẩm. Hỏi đoạn dây còn lại dài bao nhiêu đề-xi-mét?",
          "highlight_target_segments": [
            "1 m",
            "4 dm",
            "còn lại",
            "đề-xi-mét"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 1 m, 4 dm, 'còn lại' và 'đề-xi-mét' nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "1 m",
            "4 dm",
            "còn lại",
            "đề-xi-mét"
          ],
          "feedback_on_error": "Milo cùng con tìm 1 m, 4 dm, 'còn lại' và 'đề-xi-mét' nào!"
        },
        "mathematical_or_logical_goal": "Nhận diện đơn vị đo khác nhau và từ khóa",
        "intermediate_output": "1 m, 4 dm, còn lại",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Đổi Đơn Vị Đo",
        "action_verb": "Đổi",
        "atomic_instruction": "Đổi 1 mét sang đề-xi-mét.",
        "text": "Đổi 1 mét sang đề-xi-mét.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "1 m bằng bao nhiêu đề-xi-mét (dm)?",
          "options": [
            "1 m = 10 dm",
            "1 m = 100 dm",
            "1 m = 5 dm"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "1 m = 10 dm."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "1 m = 10 dm",
          "feedback_on_error": "1 m = 10 dm con nha!"
        },
        "mathematical_or_logical_goal": "Đổi đơn vị đo độ dài",
        "intermediate_output": "1 m = 10 dm",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Thực Hiện Phép Trừ",
        "action_verb": "Trừ",
        "atomic_instruction": "Tính 10 dm trừ 4 dm bằng bao nhiêu dm.",
        "text": "Tính 10 dm trừ 4 dm bằng bao nhiêu dm.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "10 - 4 = ? (dm)",
          "placeholder": "Nhập số dm còn lại..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "10 trừ 4 bằng 6."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "6",
          "feedback_on_error": "10 - 4 = 6 dm nha con!"
        },
        "mathematical_or_logical_goal": "Tính toán độ dài còn lại",
        "intermediate_output": "6 dm",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Chọn Phương Án B",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án đúng trong đề trắc nghiệm.",
        "text": "Chọn phương án đúng trong đề trắc nghiệm.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Kết quả 6 dm tương ứng với phương án nào?",
          "options": [
            "B. 6 dm",
            "A. 5 dm",
            "C. 7 dm",
            "D. 96 dm"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Chọn B. 6 dm."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "B. 6 dm",
          "feedback_on_error": "Đáp án đúng là B. 6 dm con nhé!"
        },
        "mathematical_or_logical_goal": "Khoanh đáp án chuẩn",
        "intermediate_output": "B. 6 dm",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G2_ENG_10": {
    "id": "G2_ENG_10",
    "grade": 2,
    "subject": "Tiếng Anh",
    "cat": "eng",
    "catName": "Tiếng Anh Tiểu Học",
    "icon": "📚",
    "title": "English Grammar: There is / There are with Plural Nouns",
    "island": "study",
    "reward": 120,
    "stepSeconds": 70,
    "original_text": "Choose the correct option:\n'How many books are there on the table?' - 'There ______ three books.'",
    "final_answer": {
      "value": "B",
      "unit": null,
      "normalized_display": "B. are",
      "acceptable_variants": [
        "B",
        "B.",
        "are",
        "B. are"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Phản xạ điền 'is' theo thói quen cửa miệng do chưa kịp phân tích cụm từ số nhiều.",
      "executive_function_scaffolding": "Khoanh tròn số '3' và đuôi '-s' trong 'books' trước khi chọn từ.",
      "visual_or_concrete_aid": "Ký hiệu quả cân so sánh: 1 vật = IS; 2+ vật = ARE."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Nhìn Danh Từ",
        "action_verb": "Đọc",
        "atomic_instruction": "Đọc cụm three books và nhận biết số nhiều.",
        "text": "Đọc cụm three books và nhận biết số nhiều.",
        "type": "checkbox",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "'three books' có 3 quyển sách (số nhiều), đúng không con?",
          "options": [
            "Đúng là số nhiều"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "3 quyển sách là từ 2 vật trở lên, là số nhiều."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "3 quyển sách là danh từ số nhiều nha!"
        },
        "mathematical_or_logical_goal": "Xác định số lượng của danh từ bổ ngữ",
        "intermediate_output": "'three books' là số nhiều (plural)",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Áp Dụng Quy Tắc",
        "action_verb": "Nhớ",
        "atomic_instruction": "Nhớ quy tắc dùng There are cho số nhiều.",
        "text": "Nhớ quy tắc dùng There are cho số nhiều.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Số nhiều (từ 2 vật) chúng mình dùng từ nào?",
          "options": [
            "There are",
            "There is"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Số nhiều dùng are, số ít dùng is."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "There are",
          "feedback_on_error": "Số nhiều chúng mình dùng There are nhé!"
        },
        "mathematical_or_logical_goal": "Quy tắc ngữ pháp thì hiện tại",
        "intermediate_output": "Chọn động từ to be: are",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phương Án B",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án B chứa từ are.",
        "text": "Chọn phương án B chứa từ are.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chọn phương án điền vào chỗ trống:",
          "options": [
            "A. is",
            "B. are",
            "C. am",
            "D. be"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Chọn phương án B. are."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "B. are",
          "feedback_on_error": "Phương án B. are là chính xác!"
        },
        "mathematical_or_logical_goal": "Chọn đáp án",
        "intermediate_output": "Phương án B",
        "is_final_step": true
      }
    ]
  },
  "G3_MATH_11": {
    "id": "G3_MATH_11",
    "grade": 3,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🍚",
    "title": "Cửa hàng bán gạo (Gấp một số lên nhiều lần & Tổng)",
    "island": "study",
    "reward": 140,
    "stepSeconds": 90,
    "original_text": "Cửa hàng buổi sáng bán được 24 kg gạo. Buổi chiều bán được gấp 3 lần buổi sáng. Hỏi cả hai buổi cửa hàng bán được tất cả bao nhiêu ki-lô-gam gạo?",
    "final_answer": {
      "value": 96,
      "unit": "kg",
      "normalized_display": "96 kg gạo",
      "acceptable_variants": [
        "96",
        "96 kg",
        "96 ki-lô-gam",
        "96 kg gạo"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Tưởng rằng tìm ra 72 kg là đã hoàn thành bài toán và dừng lại mà không tính tổng cả hai buổi.",
      "executive_function_scaffolding": "Nhắc nhở câu hỏi cốt lõi: 'Đề bài hỏi buổi chiều hay hỏi CẢ HAI BUỔI?'.",
      "visual_or_concrete_aid": "Sơ đồ đoạn thẳng: Sáng 1 đoạn; Chiều 3 đoạn; ngoặc nhọn hỏi chấm tổng cả 4 đoạn."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Cửa hàng buổi sáng bán được 24 kg gạo. Buổi chiều bán được gấp 3 lần buổi sáng. Hỏi cả hai buổi cửa hàng bán được tất cả bao nhiêu ki-lô-gam gạo?",
          "highlight_target_segments": [
            "24 kg gạo",
            "gấp 3 lần",
            "tất cả"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 24 kg gạo, 'gấp 3 lần' và 'tất cả' nhé!"
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "24 kg gạo",
            "gấp 3 lần",
            "tất cả"
          ],
          "feedback_on_error": "Tìm 24 kg gạo, 'gấp 3 lần' và 'tất cả' nào con!"
        },
        "mathematical_or_logical_goal": "Trích xuất dữ kiện bài toán hợp",
        "intermediate_output": "Sáng: 24 kg; Chiều: gấp 3; Hỏi: tất cả",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Gạo Buổi Chiều",
        "action_verb": "Nhân",
        "atomic_instruction": "Tính số gạo buổi chiều bán được bằng phép nhân 24 với 3.",
        "text": "Tính số gạo buổi chiều bán được bằng phép nhân 24 với 3.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "24 × 3 = ? (kg)",
          "placeholder": "Nhập số kg buổi chiều..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "4 x 3 = 12 viết 2 nhớ 1; 2 x 3 = 6 thêm 1 là 7 -> 72 kg."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "72",
          "feedback_on_error": "24 x 3 = 72 kg con nhé!"
        },
        "mathematical_or_logical_goal": "Tính bước trung gian",
        "intermediate_output": "72 kg",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phép Tính Tổng",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phép cộng để tính số gạo cả hai buổi bán được.",
        "text": "Chọn phép cộng để tính số gạo cả hai buổi bán được.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Phép tính tìm số gạo cả hai buổi là:",
          "options": [
            "24 + 72",
            "72 - 24"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Cả hai buổi là gộp sáng (24) và chiều (72)."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "24 + 72",
          "feedback_on_error": "Lấy 24 + 72 nha con!"
        },
        "mathematical_or_logical_goal": "Thiết lập phép cộng tổng",
        "intermediate_output": "24 + 72",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Tổng Hai Buổi",
        "action_verb": "Tính",
        "atomic_instruction": "Tính 24 cộng 72 bằng bao nhiêu ki-lô-gam gạo.",
        "text": "Tính 24 cộng 72 bằng bao nhiêu ki-lô-gam gạo.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "24 + 72 = ?",
          "placeholder": "Nhập tổng số kg..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "4 + 2 = 6; 2 + 7 = 9 -> 96 kg."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "96",
          "feedback_on_error": "24 + 72 = 96 kg gạo con nha!"
        },
        "mathematical_or_logical_goal": "Tính kết quả cuối",
        "intermediate_output": "96 kg gạo",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G3_MATH_12": {
    "id": "G3_MATH_12",
    "grade": 3,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "📓",
    "title": "Bài toán rút về đơn vị: Thưởng vở học sinh giỏi",
    "island": "study",
    "reward": 140,
    "stepSeconds": 90,
    "original_text": "Cô giáo có 35 quyển vở thưởng đều cho 7 bạn học sinh giỏi. Hỏi 5 bạn nhận được bao nhiêu quyển vở?",
    "final_answer": {
      "value": 25,
      "unit": "quyển vở",
      "normalized_display": "25 quyển vở",
      "acceptable_variants": [
        "25",
        "25 quyển",
        "25 quyển vở"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ bối rối trước sự xuất hiện của hai số 5 (5 quyển và 5 bạn) dẫn đến nhầm lẫn khái niệm.",
      "executive_function_scaffolding": "Chia bài toán làm 2 bước rõ rệt: (1) Rút về đơn vị (tìm 1 bạn), (2) Nhân lên cho 5 bạn.",
      "visual_or_concrete_aid": "Minh họa 1 gói quà nhỏ đại diện cho 1 bạn chứa 5 cuốn vở."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Cô giáo có 35 quyển vở thưởng đều cho 7 bạn học sinh giỏi. Hỏi 5 bạn nhận được bao nhiêu quyển vở?",
          "highlight_target_segments": [
            "35 quyển vở",
            "7 bạn học sinh giỏi",
            "5 bạn"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 35 quyển vở, 7 bạn học sinh giỏi và 5 bạn."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "35 quyển vở",
            "7 bạn học sinh giỏi",
            "5 bạn"
          ],
          "feedback_on_error": "Tìm đủ 35 quyển vở, 7 bạn và 5 bạn nhé con!"
        },
        "mathematical_or_logical_goal": "Nhận diện dữ kiện bài toán rút về đơn vị",
        "intermediate_output": "Có: 35 quyển; 7 bạn; Hỏi: 5 bạn",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Rút Về Một Bạn",
        "action_verb": "Tính",
        "atomic_instruction": "Tính số vở 1 bạn nhận được bằng cách lấy 35 chia cho 7.",
        "text": "Tính số vở 1 bạn nhận được bằng cách lấy 35 chia cho 7.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "35 : 7 = ? (quyển)",
          "placeholder": "Nhập số vở 1 bạn..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "7 x 5 = 35 nên 35 : 7 = 5 quyển vở."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "5",
          "feedback_on_error": "35 : 7 = 5 quyển vở con nhé!"
        },
        "mathematical_or_logical_goal": "Bước rút về đơn vị",
        "intermediate_output": "Mỗi bạn: 5 quyển vở",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Tính Số Vở Của 5 Bạn",
        "action_verb": "Tính",
        "atomic_instruction": "Lấy số vở 1 bạn nhân với 5 để tìm số vở của 5 bạn: 5 nhân 5.",
        "text": "Lấy số vở 1 bạn nhân với 5 để tìm số vở của 5 bạn: 5 nhân 5.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "5 × 5 = ? (quyển)",
          "placeholder": "Nhập số vở 5 bạn..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 40
        },
        "hints": [
          "5 x 5 = 25 quyển vở."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "25",
          "feedback_on_error": "5 x 5 = 25 quyển vở con nhé!"
        },
        "mathematical_or_logical_goal": "Tính kết quả cuối",
        "intermediate_output": "25 quyển vở",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G3_VIET_13": {
    "id": "G3_VIET_13",
    "grade": 3,
    "subject": "Tiếng Việt",
    "cat": "viet",
    "catName": "Tiếng Việt GDPT",
    "icon": "🪞",
    "title": "Đọc hiểu: Biện pháp so sánh Mặt hồ Ba Bể",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Đọc đoạn văn sau:\n'Mặt hồ Ba Bể phẳng lặng và trong veo như một tấm gương khổng lồ soi bóng núi rừng hùng vĩ. Những chiếc thuyền độc mộc lướt nhẹ trên mặt nước mang lại cảm giác thanh bình, êm ả.'\nCâu hỏi: Trong đoạn văn trên, mặt hồ Ba Bể được so sánh với sự vật nào?",
    "final_answer": {
      "value": "một tấm gương khổng lồ",
      "unit": null,
      "normalized_display": "một tấm gương khổng lồ",
      "acceptable_variants": [
        "tấm gương khổng lồ",
        "một tấm gương khổng lồ",
        "tấm gương",
        "gương khổng lồ"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Sao nhãng vào vế vị ngữ phía sau 'soi bóng núi rừng hùng vĩ' và trả lời nhầm là 'núi rừng'.",
      "executive_function_scaffolding": "Dùng công thức khuôn mẫu: [Sự vật A] + NHƯ + [Sự vật B].",
      "visual_or_concrete_aid": "Khung bảng 2 cột đối chiếu: Vế A | Từ nối | Vế B."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Tìm Từ So Sánh",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm từ như dùng để nối câu so sánh.",
        "text": "Tìm từ như dùng để nối câu so sánh.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm từ chỉ quan hệ so sánh trong câu 1:",
          "highlight_target_segments": [
            "như"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Từ so sánh phổ biến nhất là từ 'như'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "như"
          ],
          "feedback_on_error": "Từ so sánh là từ 'như' nhé!"
        },
        "mathematical_or_logical_goal": "Nhận diện dấu hiệu tu từ so sánh",
        "intermediate_output": "Từ so sánh: 'như'",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Hình Ảnh So Sánh",
        "action_verb": "Xác_định",
        "atomic_instruction": "Xác định cụm từ đứng sau từ như.",
        "text": "Xác định cụm từ đứng sau từ như.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Mặt hồ phẳng lặng và trong veo như cái gì?",
          "highlight_target_segments": [
            "một tấm gương khổng lồ"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Đứng sau từ 'như' là 'một tấm gương khổng lồ'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "một tấm gương khổng lồ"
          ],
          "feedback_on_error": "Hình ảnh so sánh là 'một tấm gương khổng lồ'!"
        },
        "mathematical_or_logical_goal": "Bóc tách cấu trúc A như B",
        "intermediate_output": "Vế A: Mặt hồ Ba Bể; Vế B: một tấm gương khổng lồ",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Tấm Gương Khổng Lồ",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn đáp án một tấm gương khổng lồ.",
        "text": "Chọn đáp án một tấm gương khổng lồ.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Sự vật được dùng để so sánh với mặt hồ là:",
          "options": [
            "một tấm gương khổng lồ",
            "núi rừng Ba Bể",
            "chiếc thuyền nan"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Chọn 'một tấm gương khổng lồ'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "một tấm gương khổng lồ",
          "feedback_on_error": "Đáp án là một tấm gương khổng lồ!"
        },
        "mathematical_or_logical_goal": "Đưa ra đáp án chuẩn xác",
        "intermediate_output": "một tấm gương khổng lồ",
        "is_final_step": true
      }
    ]
  },
  "G3_MCQ_14": {
    "id": "G3_MCQ_14",
    "grade": 3,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "📐",
    "title": "Tính chu vi mảnh đất hình chữ nhật (15m và 8m)",
    "exercise_type": "geometry",
    "geometry_spec": {
      "shape_type": "rectangle",
      "dimensions": {
        "length": "15 m",
        "width": "8 m"
      },
      "target": "perimeter"
    },
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Một mảnh đất hình chữ nhật có chiều dài 15 m và chiều rộng 8 m. Chu vi của mảnh đất đó là bao nhiêu?",
    "final_answer": {
      "value": "B",
      "unit": null,
      "normalized_display": "B. 46 m",
      "acceptable_variants": [
        "B",
        "B.",
        "46 m",
        "46",
        "B. 46 m"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Nhìn thấy số 46 vội vàng chọn ngay đáp án D mà không đọc đơn vị mét vuông ở đuôi.",
      "executive_function_scaffolding": "Buộc học sinh kiểm tra hai bước: (1) Số có đúng không? (2) Đơn vị có đúng không?",
      "visual_or_concrete_aid": "Vẽ hình chữ nhật với 4 cạnh đánh dấu độ dài quanh viền."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các kích thước và từ khóa yêu cầu trong đề bài.",
        "text": "Gạch chân các kích thước và từ khóa yêu cầu trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Một mảnh đất hình chữ nhật có chiều dài 15 m và chiều rộng 8 m. Chu vi mảnh đất đó là bao nhiêu?",
          "highlight_target_segments": [
            "chiều dài 15 m",
            "chiều rộng 8 m",
            "Chu vi"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân chiều dài 15 m, chiều rộng 8 m và chữ Chu vi."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "chiều dài 15 m",
            "chiều rộng 8 m",
            "Chu vi"
          ],
          "feedback_on_error": "Gạch chân đủ 3 dữ kiện nhé!"
        },
        "mathematical_or_logical_goal": "Định vị dữ kiện hình học",
        "intermediate_output": "dài: 15m; rộng: 8m; tìm: chu vi",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Nhớ Công Thức Chu Vi",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn công thức tính chu vi hình chữ nhật.",
        "text": "Chọn công thức tính chu vi hình chữ nhật.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Công thức tính chu vi hình chữ nhật là:",
          "options": [
            "(Chiều dài + Chiều rộng) × 2",
            "Chiều dài × Chiều rộng",
            "Chiều dài + Chiều rộng"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "(Dài + Rộng) rồi nhân 2."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "(Chiều dài + Chiều rộng) × 2",
          "feedback_on_error": "Chu vi = (Dài + Rộng) x 2 nha!"
        },
        "mathematical_or_logical_goal": "Nhớ công thức",
        "intermediate_output": "P = (a + b) x 2",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Tính Nửa Chu Vi",
        "action_verb": "Tính",
        "atomic_instruction": "Tính nửa chu vi mảnh đất bằng cách lấy 15 cộng 8.",
        "text": "Tính nửa chu vi mảnh đất bằng cách lấy 15 cộng 8.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "15 + 8 = ? (m)",
          "placeholder": "Nhập nửa chu vi..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "15 + 8 = 23 m."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "23",
          "feedback_on_error": "15 + 8 = 23 m con nhé!"
        },
        "mathematical_or_logical_goal": "Tính nửa chu vi",
        "intermediate_output": "23 m",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Chu Vi Mảnh Đất",
        "action_verb": "Tính",
        "atomic_instruction": "Lấy nửa chu vi nhân với 2 để tìm chu vi: 23 nhân 2.",
        "text": "Lấy nửa chu vi nhân với 2 để tìm chu vi: 23 nhân 2.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "23 × 2 = ? (m)",
          "placeholder": "Nhập chu vi..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "23 x 2 = 46 m."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "46",
          "feedback_on_error": "23 x 2 = 46 m con nhé!"
        },
        "mathematical_or_logical_goal": "Tính toán chu vi",
        "intermediate_output": "46 m",
        "is_final_step": false
      },
      {
        "step_id": 5,
        "badge": "Chọn Phương Án B",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án đúng trong đề trắc nghiệm.",
        "text": "Chọn phương án đúng trong đề trắc nghiệm.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chu vi mảnh đất là 46 m, chọn đáp án đúng:",
          "options": [
            "B. 46 m",
            "A. 23 m",
            "D. 46 m2",
            "C. 120 m"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Chu vi đo bằng mét (m), không phải m2. Chọn B."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "B. 46 m",
          "feedback_on_error": "Chọn B. 46 m con nha!"
        },
        "mathematical_or_logical_goal": "Khoanh đáp án đúng",
        "intermediate_output": "B. 46 m",
        "is_final_step": true
      }
    ]
  },
  "G3_ENG_15": {
    "id": "G3_ENG_15",
    "grade": 3,
    "subject": "Tiếng Anh",
    "cat": "eng",
    "catName": "Tiếng Anh Tiểu Học",
    "icon": "🦆",
    "title": "English Sentence Reordering: Khả năng của chú vịt (can/can't)",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Reorder the words to make a correct sentence:\n'swim / but / can / fly / can't / A duck / .'\nChoose the correct sentence:",
    "final_answer": {
      "value": "A",
      "unit": null,
      "normalized_display": "A. A duck can swim but can't fly.",
      "acceptable_variants": [
        "A",
        "A.",
        "A duck can swim but can't fly.",
        "A duck can swim but can't fly"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Quá tải khi sắp xếp 6 mảnh từ xáo trộn trong đầu cùng một lúc.",
      "executive_function_scaffolding": "Phân nhóm từ: Cụm 1 (Con gì? -> A duck), Cụm 2 (Làm được gì? -> can swim), Cụm 3 (Không làm được gì? -> can't fly).",
      "visual_or_concrete_aid": "Các khối hình ghép puzzle 3 mảnh có khớp nối màu sắc."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Tìm Chủ Ngữ Đầu Câu",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm cụm từ viết hoa A duck làm chủ ngữ.",
        "text": "Tìm cụm từ viết hoa A duck làm chủ ngữ.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ nào viết hoa đứng đầu câu?",
          "options": [
            "A duck",
            "can swim",
            "fly",
            "but"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Chữ 'A duck' có chữ A viết hoa."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "A duck",
          "feedback_on_error": "Chủ ngữ đầu câu là A duck con nhé!"
        },
        "mathematical_or_logical_goal": "Định vị thành phần chủ ngữ",
        "intermediate_output": "Chủ ngữ: A duck",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Ghép Cấu Trúc Can / Can't",
        "action_verb": "Ghép",
        "atomic_instruction": "Ghép hành động bơi được và không bay được.",
        "text": "Ghép hành động bơi được và không bay được.",
        "type": "order_sequencing",
        "ui_type": "order_sequencing",
        "ui_data": {
          "prompt_text": "Sắp xếp thứ tự các vế câu:",
          "items_to_drag": [
            "A duck",
            "can swim",
            "but",
            "can't fly."
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "A duck -> can swim -> but -> can't fly."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "A duck",
            "can swim",
            "but",
            "can't fly."
          ],
          "feedback_on_error": "Vịt biết bơi nhưng không biết bay: can swim but can't fly."
        },
        "mathematical_or_logical_goal": "Mô hình hóa cú pháp câu",
        "intermediate_output": "can swim but can't fly",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Câu Hoàn Chỉnh A",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án A ghép câu đúng ngữ pháp.",
        "text": "Chọn phương án A ghép câu đúng ngữ pháp.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chọn câu hoàn chỉnh chính xác:",
          "options": [
            "A. A duck can swim but can't fly.",
            "B. A duck can't swim but can fly.",
            "C. Can swim but fly a duck can't."
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Phương án A là câu chuẩn xác."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "A. A duck can swim but can't fly.",
          "feedback_on_error": "Phương án A là đáp án chính xác!"
        },
        "mathematical_or_logical_goal": "Khẳng định lựa chọn đúng",
        "intermediate_output": "Phương án A",
        "is_final_step": true
      }
    ]
  },
  "G4_MATH_16": {
    "id": "G4_MATH_16",
    "grade": 4,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "📚",
    "title": "Toán Tổng - Hiệu: Sách quyên góp hai lớp 4A và 4B",
    "island": "study",
    "reward": 150,
    "stepSeconds": 90,
    "original_text": "Hai lớp 4A và 4B quyên góp được tất cả 280 quyển sách cho thư viện vùng cao. Lớp 4A quyên góp được nhiều hơn lớp 4B là 40 quyển sách. Hỏi mỗi lớp quyên góp được bao nhiêu quyển sách?",
    "final_answer": {
      "value": "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
      "unit": "quyển sách",
      "normalized_display": "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
      "acceptable_variants": [
        "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
        "4A: 160 quyển, 4B: 120 quyển",
        "4A: 160, 4B: 120",
        "160 quyển và 120 quyển",
        "160 và 120",
        "160, 120"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Nhớ lộn công thức lấy Tổng trừ Hiệu nhưng quên chia 2 hoặc chỉ tính một lớp rồi nộp bài.",
      "executive_function_scaffolding": "Lộ trình 3 hộp: [1] Tính 4A qua công thức; [2] Tính 4B qua phép trừ; [3] Soát lại tổng xem có bằng 280 không.",
      "visual_or_concrete_aid": "Vẽ sơ đồ đoạn thẳng: Đoạn 4A dài hơn đoạn 4B một mẩu 40 quyển."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Tách",
        "atomic_instruction": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "text": "Gạch chân các số liệu và từ khóa quan trọng trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm tổng số sách và số sách lớp 4A nhiều hơn:",
          "highlight_target_segments": [
            "280 quyển",
            "40 quyển",
            "nhiều hơn"
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Tổng là 280 quyển, hiệu là 40 quyển."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "280 quyển sách",
            "40 quyển"
          ],
          "feedback_on_error": "Tổng = 280, Hiệu = 40 nhé!"
        },
        "mathematical_or_logical_goal": "Phân loại dạng toán Tổng - Hiệu",
        "intermediate_output": "Tổng = 280; Hiệu = 40; Số lớn: 4A; Số bé: 4B",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Sách Lớp 4A",
        "action_verb": "Tính",
        "atomic_instruction": "Tìm số lớn: Lấy tổng cộng hiệu rồi chia 2.",
        "text": "Tìm số lớn: Lấy tổng cộng hiệu rồi chia 2.",
        "type": "progressive_calculation",
        "ui_type": "progressive_calculation",
        "ui_data": {
          "prompt_text": "Tìm số sách lớp 4A (Số lớn = (280 + 40) : 2):",
          "progressive_phases": [
            {
              "phase_id": 1,
              "lead_text": "1) Tính hai lần số sách lớp 4A:",
              "expression": "280 + 40 =",
              "calc": {
                "top": "280",
                "op": "+",
                "bot": "40",
                "expected": "320"
              },
              "expected_answer": "320",
              "unit": "quyển"
            },
            {
              "phase_id": 2,
              "lead_text": "2) Chia đôi tìm số sách lớp 4A:",
              "expression": "320 : 2 =",
              "calc": {
                "top": "320",
                "op": ":",
                "bot": "2",
                "expected": "160"
              },
              "expected_answer": "160",
              "unit": "quyển"
            }
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "280 + 40 = 320; 320 : 2 = 160."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "160",
          "feedback_on_error": "Lấy 280 cộng 40 bằng 320, rồi chia 2 được 160 quyển con nhé!"
        },
        "mathematical_or_logical_goal": "Tính số lớn",
        "intermediate_output": "(280 + 40) : 2 = 320 : 2 = 160 (quyển)",
        "is_final_step": false,
        "ui_payload": {
          "prompt_text": "Tìm số sách lớp 4A (Số lớn = (280 + 40) : 2):",
          "progressive_phases": [
            {
              "phase_id": 1,
              "lead_text": "1) Tính hai lần số sách lớp 4A:",
              "expression": "280 + 40 =",
              "calc": {
                "top": "280",
                "op": "+",
                "bot": "40",
                "expected": "320"
              },
              "expected_answer": "320",
              "unit": "quyển"
            },
            {
              "phase_id": 2,
              "lead_text": "2) Chia đôi tìm số sách lớp 4A:",
              "expression": "320 : 2 =",
              "calc": {
                "top": "320",
                "op": ":",
                "bot": "2",
                "expected": "160"
              },
              "expected_answer": "160",
              "unit": "quyển"
            }
          ]
        }
      },
      {
        "step_id": 3,
        "badge": "Tìm Sách Lớp 4B",
        "action_verb": "Trừ",
        "atomic_instruction": "Lấy 160 trừ đi 40 để ra lớp 4B.",
        "text": "Lấy 160 trừ đi 40 để ra lớp 4B.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "160 - 40 = ? (quyển lớp 4B)",
          "placeholder": "Nhập số sách 4B..."
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "milo_thumbs_up",
          "audio_cue": "gentle_pop_success",
          "dopamine_points": 35
        },
        "hints": [
          "160 - 40 = 120 quyển."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "120",
          "feedback_on_error": "Lớp 4B quyên góp 120 quyển nhé!"
        },
        "mathematical_or_logical_goal": "Tính số bé",
        "intermediate_output": "160 - 40 = 120 (quyển)",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Ghi Rõ Hai Lớp",
        "action_verb": "Kết_luận",
        "atomic_instruction": "Chọn đáp án ghi rõ kết quả cả hai lớp.",
        "text": "Chọn đáp án ghi rõ kết quả cả hai lớp.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Đáp số đầy đủ của bài toán là:",
          "options": [
            "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
            "Lớp 4A: 140 quyển, Lớp 4B: 140 quyển",
            "Lớp 4A: 180 quyển, Lớp 4B: 100 quyển"
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 50
        },
        "hints": [
          "4A: 160 quyển, 4B: 120 quyển."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Lớp 4A: 160 quyển, Lớp 4B: 120 quyển",
          "feedback_on_error": "Đáp số là 4A: 160 quyển, 4B: 120 quyển!"
        },
        "mathematical_or_logical_goal": "Kiểm thử và kết luận",
        "intermediate_output": "Lớp 4A: 160 quyển; Lớp 4B: 120 quyển",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G4_MATH_17": {
    "id": "G4_MATH_17",
    "grade": 4,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🐥",
    "title": "Tìm phân số của một số: Đàn gia cầm gà và vịt",
    "island": "study",
    "reward": 140,
    "stepSeconds": 90,
    "original_text": "Một trang trại có 1200 con gia cầm gồm gà và vịt. Trong đó số gà chiếm 3/5 tổng số gia cầm. Hỏi trang trại đó có bao nhiêu con vịt?",
    "final_answer": {
      "value": 480,
      "unit": "con vịt",
      "normalized_display": "480 con vịt",
      "acceptable_variants": [
        "480",
        "480 con",
        "480 con vịt"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Tính xong 720 con gà thì ngỡ đã xong bài và điền 720 làm đáp số, bỏ quên câu hỏi về con vịt.",
      "executive_function_scaffolding": "Highlight câu hỏi mục tiêu: 'Hỏi trang trại có bao nhiêu CON VỊT?'.",
      "visual_or_concrete_aid": "Thanh đồ họa chia 5 phần bằng nhau: 3 phần màu vàng là gà (720), 2 phần màu xanh là vịt (?)."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu, phân số và câu hỏi của đề bài.",
        "text": "Gạch chân các số liệu, phân số và câu hỏi của đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Một trang trại có 1200 con gia cầm gồm gà và vịt. Trong đó số gà chiếm 3/5 tổng số gia cầm. Hỏi trang trại đó có bao nhiêu con vịt?",
          "highlight_target_segments": [
            "1200 con gia cầm",
            "3/5",
            "bao nhiêu con vịt"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 1200 con gia cầm, 3/5 và 'bao nhiêu con vịt'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "1200 con gia cầm",
            "3/5",
            "bao nhiêu con vịt"
          ],
          "feedback_on_error": "Tìm đủ 3 dữ kiện nhé!"
        },
        "mathematical_or_logical_goal": "Nhận diện dữ kiện phân số",
        "intermediate_output": "Tổng: 1200 con; Gà: 3/5; Tìm vịt",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tính Số Con Gà",
        "action_verb": "Tính",
        "atomic_instruction": "Tính số con gà bằng 3/5 của 1200 con.",
        "text": "Tính số con gà bằng 3/5 của 1200 con.",
        "type": "progressive_calculation",
        "ui_type": "progressive_calculation",
        "ui_data": {
          "prompt_text": "Tính số gà bằng 3/5 của 1200 con gia cầm:",
          "progressive_phases": [
            {
              "phase_id": 1,
              "lead_text": "1) Rút về 1 phần (1/5 tổng số gia cầm):",
              "expression": "1200 : 5 =",
              "calc": {
                "top": "1200",
                "op": ":",
                "bot": "5",
                "expected": "240"
              },
              "expected_answer": "240",
              "unit": "con"
            },
            {
              "phase_id": 2,
              "lead_text": "2) Nhân lên 3 phần (Số con gà):",
              "expression": "240 × 3 =",
              "calc": {
                "top": "240",
                "op": "×",
                "bot": "3",
                "expected": "720"
              },
              "expected_answer": "720",
              "unit": "con gà"
            }
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "1200 : 5 = 240; 240 x 3 = 720 con gà."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "720",
          "feedback_on_error": "Milo cùng con lấy 1200 chia 5 được 240, rồi nhân 3 được 720 con gà nhé!"
        },
        "mathematical_or_logical_goal": "Tìm phân số của một số",
        "intermediate_output": "720 con gà",
        "is_final_step": false,
        "ui_payload": {
          "prompt_text": "Tính số gà bằng 3/5 của 1200 con gia cầm:",
          "progressive_phases": [
            {
              "phase_id": 1,
              "lead_text": "1) Rút về 1 phần (1/5 tổng số gia cầm):",
              "expression": "1200 : 5 =",
              "calc": {
                "top": "1200",
                "op": ":",
                "bot": "5",
                "expected": "240"
              },
              "expected_answer": "240",
              "unit": "con"
            },
            {
              "phase_id": 2,
              "lead_text": "2) Nhân lên 3 phần (Số con gà):",
              "expression": "240 × 3 =",
              "calc": {
                "top": "240",
                "op": "×",
                "bot": "3",
                "expected": "720"
              },
              "expected_answer": "720",
              "unit": "con gà"
            }
          ]
        }
      },
      {
        "step_id": 3,
        "badge": "Tìm Số Con Vịt",
        "action_verb": "Trừ",
        "atomic_instruction": "Lấy tổng 1200 trừ đi 720 con gà để tìm số con vịt.",
        "text": "Lấy tổng 1200 trừ đi 720 con gà để tìm số con vịt.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "1200 - 720 = ? (con vịt)",
          "placeholder": "Nhập số con vịt..."
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "1200 trừ 720 bằng 480 con."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "480",
          "feedback_on_error": "1200 - 720 = 480 con vịt nha!"
        },
        "mathematical_or_logical_goal": "Thực hiện phép trừ",
        "intermediate_output": "480 con vịt",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Ghi Đáp Số Vịt",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn đáp số số con vịt của trang trại.",
        "text": "Chọn đáp số số con vịt của trang trại.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Đáp số số con vịt là:",
          "options": [
            "480 con vịt",
            "720 con gà",
            "600 con vịt"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Chọn 480 con vịt."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "480 con vịt",
          "feedback_on_error": "Đáp số là 480 con vịt con nha!"
        },
        "mathematical_or_logical_goal": "Kết luận đáp số",
        "intermediate_output": "480 con vịt",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G4_VIET_18": {
    "id": "G4_VIET_18",
    "grade": 4,
    "subject": "Tiếng Việt",
    "cat": "viet",
    "catName": "Tiếng Việt GDPT",
    "icon": "🌾",
    "title": "Đọc hiểu: Biện pháp nhân hóa Chị Gió thì thầm",
    "exercise_type": "reading_comprehension",
    "reading_passage": "Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non. Những bông lúa bẽn lẽn nghiêng đầu chào đón chị, rộn rã rì rào ca hát dưới nắng sớm.",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Câu hỏi: Chị Gió được gán cho những từ ngữ hành động nào?",
    "final_answer": {
      "value": "thì thầm",
      "unit": null,
      "normalized_display": "thì thầm (hoặc khẽ thì thầm)",
      "acceptable_variants": [
        "thì thầm",
        "khẽ thì thầm",
        "khẽ thì thầm với các bông lúa non"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Nhầm lẫn hành động của chị Gió với hành động của bông lúa ('bẽn lẽn nghiêng đầu', 'ca hát').",
      "executive_function_scaffolding": "Tạo bảng phân loại: Cột 1: Hành động của chị Gió | Cột 2: Hành động của bông lúa.",
      "visual_or_concrete_aid": "Tô màu hồng cho chủ ngữ 'chị Gió' và mũi tên chỉ đến từ 'thì thầm'."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xác Định Chị Gió",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm đối tượng được nhân hóa là chị Gió.",
        "text": "Tìm đối tượng được nhân hóa là chị Gió.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm tên sự vật thiên nhiên được gọi như con người:",
          "reading_excerpt": "Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non.",
          "highlight_target_segments": [
            "Chị Gió"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Gió được gọi thân mật bằng 'Chị'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "Chị Gió"
          ],
          "feedback_on_error": "Đó là Chị Gió nhé!"
        },
        "mathematical_or_logical_goal": "Xác định thực thể trung tâm",
        "intermediate_output": "Thực thể: chị Gió",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tìm Hành Động Con Người",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân từ thì thầm trong câu thứ nhất.",
        "text": "Gạch chân từ thì thầm trong câu thứ nhất.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Chị Gió làm hành động gì của con người với lúa non?",
          "highlight_target_segments": [
            "khẽ thì thầm"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Hành động nói nhỏ: thì thầm."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "khẽ thì thầm"
          ],
          "feedback_on_error": "Chị Gió khẽ thì thầm con nhé!"
        },
        "mathematical_or_logical_goal": "Phân tích phép nhân hóa qua hành động",
        "intermediate_output": "Từ chỉ hành động: 'thì thầm' (hoặc 'khẽ thì thầm')",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Từ Nhân Hóa",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn từ thì thầm là hành động nhân hóa.",
        "text": "Chọn từ thì thầm là hành động nhân hóa.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Từ ngữ thể hiện hành động nhân hóa của Chị Gió là:",
          "options": [
            "thì thầm (hoặc khẽ thì thầm)",
            "uốn câu",
            "nở nụ cười"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Chọn 'thì thầm'."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "thì thầm (hoặc khẽ thì thầm)",
          "feedback_on_error": "Đáp án đúng là thì thầm!"
        },
        "mathematical_or_logical_goal": "Đưa ra đáp án chuẩn",
        "intermediate_output": "thì thầm (khẽ thì thầm)",
        "is_final_step": true
      }
    ]
  },
  "G4_MCQ_19": {
    "id": "G4_MCQ_19",
    "grade": 4,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🔷",
    "title": "Tính diện tích hình bình hành (Đáy 24m, chiều cao 15m)",
    "exercise_type": "geometry",
    "geometry_spec": {
      "shape_type": "parallelogram",
      "dimensions": {
        "base": "24 m",
        "height": "15 m"
      },
      "target": "area"
    },
    "island": "study",
    "reward": 140,
    "stepSeconds": 85,
    "original_text": "Một mảnh đất hình bình hành có độ dài đáy là 24 m, chiều cao tương ứng là 15 m và độ dài cạnh bên là 18 m. Diện tích mảnh đất đó là là bao nhiêu?",
    "final_answer": {
      "value": "A",
      "unit": null,
      "normalized_display": "A. 360 m2",
      "acceptable_variants": [
        "A",
        "A.",
        "360 m2",
        "360 mét vuông",
        "360",
        "A. 360 m2"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Bị kích thích bởi số 18 xuất hiện trong đề bài và tiện tay nhân 24 x 18.",
      "executive_function_scaffolding": "Luyện kỹ năng ức chế (Inhibition): gạch một đường đỏ mảnh qua cụm từ 'cạnh bên là 18 m' vì nó không nằm trong công thức.",
      "visual_or_concrete_aid": "Hình vẽ bình hành có đường cao hạ vuông góc nét đứt màu đỏ rõ rệt."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các kích thước và từ khóa yêu cầu trong đề bài.",
        "text": "Gạch chân các kích thước và từ khóa yêu cầu trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Một mảnh đất hình bình hành có độ dài đáy là 24 m, chiều cao tương ứng là 15 m và độ dài cạnh bên là 18 m. Diện tích mảnh đất đó là bao nhiêu?",
          "highlight_target_segments": [
            "đáy là 24 m",
            "chiều cao tương ứng là 15 m",
            "Diện tích"
          ]
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân đáy là 24 m, chiều cao tương ứng là 15 m và Diện tích."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "đáy là 24 m",
            "chiều cao tương ứng là 15 m",
            "Diện tích"
          ],
          "feedback_on_error": "Tìm đủ đáy 24m, chiều cao 15m và Diện tích nhé!"
        },
        "mathematical_or_logical_goal": "Lọc dữ kiện cốt lõi",
        "intermediate_output": "đáy: 24m; cao: 15m; bỏ cạnh bên 18m",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Nhớ Công Thức Diện Tích",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn công thức tính diện tích hình bình hành.",
        "text": "Chọn công thức tính diện tích hình bình hành.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Công thức tính diện tích hình bình hành là:",
          "options": [
            "S = a × h (Đáy × Chiều cao)",
            "S = (a + b) × 2",
            "S = a × b (Đáy × Cạnh bên)"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Diện tích hình bình hành bằng Đáy nhân Chiều cao."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "S = a × h (Đáy × Chiều cao)",
          "feedback_on_error": "S = a x h con nhé!"
        },
        "mathematical_or_logical_goal": "Xác định công thức",
        "intermediate_output": "S = a x h",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Thực Hiện Phép Nhân",
        "action_verb": "Tính",
        "atomic_instruction": "Tính 24 nhân 15 bằng bao nhiêu mét vuông.",
        "text": "Tính 24 nhân 15 bằng bao nhiêu mét vuông.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "24 × 15 = ? (m2)",
          "placeholder": "Nhập diện tích..."
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "24 x 10 = 240; 24 x 5 = 120 -> 240 + 120 = 360 m2."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "360",
          "feedback_on_error": "24 x 15 = 360 m2 nha con!"
        },
        "mathematical_or_logical_goal": "Thực hiện phép tính",
        "intermediate_output": "360 m2",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Chọn Phương Án A",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án đúng trong đề trắc nghiệm.",
        "text": "Chọn phương án đúng trong đề trắc nghiệm.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Diện tích là 360 m2, tương ứng với đáp án nào?",
          "options": [
            "A. 360 m2",
            "B. 432 m2",
            "C. 78 m",
            "D. 180 m2"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Chọn A. 360 m2."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "A. 360 m2",
          "feedback_on_error": "Đáp án đúng là A. 360 m2 con nhé!"
        },
        "mathematical_or_logical_goal": "Khoanh đáp án",
        "intermediate_output": "A. 360 m2",
        "is_final_step": true
      }
    ]
  },
  "G4_ENG_20": {
    "id": "G4_ENG_20",
    "grade": 4,
    "subject": "Tiếng Anh",
    "cat": "eng",
    "catName": "Tiếng Anh Tiểu Học",
    "icon": "🥞",
    "title": "English Reading: Hoạt động của mẹ Peter trong bếp",
    "exercise_type": "reading_comprehension",
    "reading_passage": "It is Sunday morning. Peter's family is at home. His father is washing the car in the garage. His mother is making pancakes in the kitchen. Peter and his sister, Linda, are playing board games in the living room.",
    "island": "study",
    "reward": 130,
    "stepSeconds": 80,
    "original_text": "Question: Where is Peter's mother and what is she doing?",
    "final_answer": {
      "value": "B",
      "unit": null,
      "normalized_display": "B. In the kitchen, making pancakes.",
      "acceptable_variants": [
        "B",
        "B.",
        "In the kitchen, making pancakes.",
        "B. In the kitchen, making pancakes."
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Quá tải khi đọc 3 nhân vật khác nhau trong cùng một đoạn văn ngắn và ghép lộn người này vào việc người kia.",
      "executive_function_scaffolding": "Đặt bộ lọc: Bỏ qua câu về Father, bỏ qua câu về Peter/Linda, chỉ đọc câu có Mother.",
      "visual_or_concrete_aid": "Bản đồ căn nhà cắt lớp với các phòng và biểu tượng người ở từng phòng."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xác Định Đối Tượng Mẹ",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm tên Peter's mother trong câu hỏi.",
        "text": "Tìm tên Peter's mother trong câu hỏi.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm nhân vật được hỏi trong câu:",
          "highlight_target_segments": [
            "Peter's mother"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Câu hỏi hỏi về mẹ của Peter."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "Peter's mother"
          ],
          "feedback_on_error": "Đối tượng là Peter's mother nha!"
        },
        "mathematical_or_logical_goal": "Xác định thực thể mục tiêu",
        "intermediate_output": "Target: Peter's mother",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Dò Câu Chứa His Mother",
        "action_verb": "Dò",
        "atomic_instruction": "Dò câu có cụm making pancakes in the kitchen.",
        "text": "Dò câu có cụm making pancakes in the kitchen.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm hành động của mẹ Peter trong câu:",
          "reading_excerpt": "His mother is making pancakes in the kitchen.",
          "highlight_target_segments": [
            "making pancakes in the kitchen"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Mẹ làm bánh kếp trong bếp: kitchen & pancakes."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "His mother is making pancakes in the kitchen."
          ],
          "feedback_on_error": "His mother is making pancakes in the kitchen."
        },
        "mathematical_or_logical_goal": "Định vị vị trí thông tin",
        "intermediate_output": "'making pancakes in the kitchen'",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phương Án B",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án B có địa điểm và hành động.",
        "text": "Chọn phương án B có địa điểm và hành động.",
        "type": "single_choice",
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
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Phương án B: In the kitchen, making pancakes."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "B. In the kitchen, making pancakes.",
          "feedback_on_error": "Phương án B là đáp án chính xác!"
        },
        "mathematical_or_logical_goal": "Khớp nối thông tin đa thành phần",
        "intermediate_output": "Phương án B",
        "is_final_step": true
      }
    ]
  },
  "G5_MATH_21": {
    "id": "G5_MATH_21",
    "grade": 5,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🚗",
    "title": "Toán chuyển động đều: Ô tô và xe máy gặp nhau (Ý a)",
    "island": "study",
    "reward": 160,
    "stepSeconds": 100,
    "original_text": "Quãng đường AB dài 180 km. Lúc 7 giờ sáng, một ô tô đi từ A về B với vận tốc 50 km/giờ và một xe máy đi từ B về A với vận tốc 40 km/giờ. Hỏi sau bao lâu hai xe gặp nhau?",
    "final_answer": {
      "value": 2,
      "unit": "giờ",
      "normalized_display": "2 giờ",
      "acceptable_variants": [
        "2",
        "2 giờ",
        "hai giờ"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Bài toán có 2 câu hỏi (a và b) dễ khiến trẻ bị ngợp và quên mất câu hỏi thứ hai.",
      "executive_function_scaffolding": "Tách bài toán thành từng bước: (1) Tính tổng vận tốc, (2) Tính thời gian gặp (câu a), (3) Tính thời điểm gặp (câu b).",
      "visual_or_concrete_aid": "Sơ đồ đoạn thẳng AB với 2 mũi tên chuyển động ngược chiều tiến lại gần nhau."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các số liệu chuyển động và câu hỏi của đề bài.",
        "text": "Gạch chân các số liệu chuyển động và câu hỏi của đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Quãng đường AB dài 180 km. Lúc 7 giờ sáng, một ô tô đi từ A với vận tốc 50 km/giờ và xe máy đi từ B với vận tốc 40 km/giờ. Hỏi sau bao lâu hai xe gặp nhau?",
          "highlight_target_segments": [
            "180 km",
            "50 km/giờ",
            "40 km/giờ",
            "sau bao lâu"
          ]
        },
        "duration_sec": 60,
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "180 km",
            "50 km/giờ",
            "40 km/giờ",
            "sau bao lâu"
          ],
          "feedback_on_error": "Con gạch chân 180 km, 50 km/giờ, 40 km/giờ và từ sau bao lâu nhé!"
        }
      },
      {
        "step_id": 2,
        "badge": "Tính Tổng Vận Tốc",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính cộng dọc để tính tổng vận tốc hai xe.",
        "text": "Đặt tính cộng dọc để tính tổng vận tốc hai xe.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "50 + 40 = ? (km/giờ)",
          "placeholder": "Nhập tổng vận tốc..."
        },
        "duration_sec": 60,
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "90",
          "feedback_on_error": "50 cộng 40 bằng 90 km/giờ con nhé!"
        }
      },
      {
        "step_id": 3,
        "badge": "Thời Gian Gặp Nhau",
        "action_verb": "Tính",
        "atomic_instruction": "Lấy quãng đường 180 chia tổng vận tốc 90 để tìm thời gian.",
        "text": "Lấy quãng đường 180 chia tổng vận tốc 90 để tìm thời gian.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "180 : 90 = ? (giờ)",
          "placeholder": "Nhập số giờ..."
        },
        "duration_sec": 60,
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "2",
          "feedback_on_error": "180 chia 90 bằng 2 giờ con nhé!"
        }
      },
      {
        "step_id": 4,
        "badge": "Tổng Kết Đáp Số",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn đáp án đúng về thời gian hai xe gặp nhau.",
        "text": "Chọn đáp án đúng về thời gian hai xe gặp nhau.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Sau bao lâu hai xe gặp nhau?",
          "options": [
            "2 giờ",
            "3 giờ",
            "1,5 giờ"
          ]
        },
        "duration_sec": 60,
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "2 giờ",
          "feedback_on_error": "Hai xe gặp nhau sau 2 giờ con nhé!"
        }
      }
    ],
    "exercise_type": "word_problem"
  },
  "G5_MATH_22": {
    "id": "G5_MATH_22",
    "grade": 5,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "📦",
    "title": "Thể tích bể nước hình hộp chữ nhật và tính lít nước",
    "island": "study",
    "reward": 160,
    "stepSeconds": 100,
    "original_text": "Một bể nước dạng hình hộp chữ nhật có kích thước bên trong lòng bể là: chiều dài 2 m, chiều rộng 1,5 m và chiều cao 1,2 m. Hiện tại lượng nước trong bể chiếm 60% thể tích bể. Hỏi trong bể đang có bao nhiêu lít nước? (Biết 1 dm3 = 1 lít).",
    "final_answer": {
      "value": 2160,
      "unit": "lít",
      "normalized_display": "2160 lít",
      "acceptable_variants": [
        "2160",
        "2160 lít",
        "2160 l",
        "2160 lít nước"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Quên đổi từ m3 sang dm3 (lấy 3,6 x 60% = 2,16 lít) hoặc nhân nhầm hệ số đổi đơn vị thể tích là 100 thay vì 1000.",
      "executive_function_scaffolding": "Đặt tính dọc số thập phân 1,5 x 2 = 3 m2 và 1,2 x 3 = 3,6 m3. Sau đó đổi sang lít (3600 lít), tính 1% (36 lít) và nhân dọc 36 x 60 = 2160 lít.",
      "visual_or_concrete_aid": "Bể nước 3D có vạch nước dâng lên mức 60%."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân các kích thước và tỉ lệ phần trăm trong đề bài.",
        "text": "Gạch chân các kích thước và tỉ lệ phần trăm trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Một bể nước dạng hình hộp chữ nhật có kích thước bên trong lòng bể là: chiều dài 2 m, chiều rộng 1,5 m và chiều cao 1,2 m. Hiện tại lượng nước trong bể chiếm 60% thể tích bể. Hỏi trong bể đang có bao nhiêu lít nước?",
          "highlight_target_segments": [
            "chiều dài 2 m",
            "chiều rộng 1,5 m",
            "chiều cao 1,2 m",
            "60%"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân dài 2m, rộng 1,5m, cao 1,2m và 60%."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "chiều dài 2 m",
            "chiều rộng 1,5 m",
            "chiều cao 1,2 m",
            "60%"
          ],
          "feedback_on_error": "Tìm đủ 4 kích thước và tỉ lệ nhé con!"
        },
        "mathematical_or_logical_goal": "Trích xuất dữ kiện thể tích",
        "intermediate_output": "2m x 1,5m x 1,2m; nước 60%",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tính Diện Tích Đáy Bể",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính nhân dọc: lấy 1,5 nhân 2 để tìm diện tích đáy bể.",
        "text": "Đặt tính nhân dọc: lấy 1,5 nhân 2 để tìm diện tích đáy bể.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "1,5 × 2 = ? (m2)",
          "placeholder": "Nhập diện tích đáy..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "Đặt tính nhân 1,5 x 2 = 3 m2."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "3",
            "3,0",
            "3.0"
          ],
          "feedback_on_error": "1,5 x 2 = 3 m2 con nhé!"
        },
        "mathematical_or_logical_goal": "Tính diện tích đáy bể (đặt tính dọc số thập phân)",
        "intermediate_output": "3 m2",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Tính Thể Tích Bể",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính nhân dọc: lấy 1,2 nhân 3 để tìm thể tích bể.",
        "text": "Đặt tính nhân dọc: lấy 1,2 nhân 3 để tìm thể tích bể.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "1,2 × 3 = ? (m3)",
          "placeholder": "Nhập thể tích bể..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Đặt tính nhân 1,2 x 3 = 3,6 m3."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "3.6",
            "3,6"
          ],
          "feedback_on_error": "1,2 x 3 = 3,6 m3 con nha!"
        },
        "mathematical_or_logical_goal": "Tính thể tích bể (đặt tính dọc số thập phân)",
        "intermediate_output": "3.6 m3",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Đổi Mét Khối Sang Lít",
        "action_verb": "Đổi",
        "atomic_instruction": "Đổi 3,6 mét khối sang lít (1 m3 = 1000 lít).",
        "text": "Đổi 3,6 mét khối sang lít (1 m3 = 1000 lít).",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "1 m3 = 1000 lít, vậy 3,6 m3 = ? lít",
          "options": [
            "3,6 m3 = 3600 lít",
            "3,6 m3 = 360 lít",
            "3,6 m3 = 36000 lít"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "3,6 x 1000 = 3600 lít."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "3,6 m3 = 3600 lít",
          "feedback_on_error": "1 m3 = 1000 lít nên 3,6 m3 = 3600 lít con nhé!"
        },
        "mathematical_or_logical_goal": "Đổi đơn vị đo thể tích sang dung tích",
        "intermediate_output": "3600 lít",
        "is_final_step": false
      },
      {
        "step_id": 5,
        "badge": "Tính 1% Thể Tích Bể",
        "action_verb": "Tính",
        "atomic_instruction": "Tìm 1% thể tích bể bằng cách lấy 3600 chia 100.",
        "text": "Tìm 1% thể tích bể bằng cách lấy 3600 chia 100.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "3600 : 100 = ? (lít)",
          "placeholder": "Nhập số lít..."
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "3600 : 100 = 36 lít."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "36",
          "feedback_on_error": "3600 : 100 = 36 lít con nhé!"
        },
        "mathematical_or_logical_goal": "Tính giá trị 1% làm bước đệm",
        "intermediate_output": "36 lít",
        "is_final_step": false
      },
      {
        "step_id": 6,
        "badge": "Tính Lượng Nước 60%",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính nhân dọc: lấy 36 nhân 60 để tìm lượng nước trong bể.",
        "text": "Đặt tính nhân dọc: lấy 36 nhân 60 để tìm lượng nước trong bể.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "36 × 60 = ? (lít nước)",
          "placeholder": "Nhập số lít nước..."
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 40
        },
        "hints": [
          "Đặt tính nhân 36 x 60 = 2160 lít."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "2160",
          "feedback_on_error": "Lượng nước trong bể là 2160 lít con nha!"
        },
        "mathematical_or_logical_goal": "Đặt tính nhân tìm giá trị 60%",
        "intermediate_output": "2160 lít",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G5_VIET_23": {
    "id": "G5_VIET_23",
    "grade": 5,
    "subject": "Tiếng Việt",
    "cat": "viet",
    "catName": "Tiếng Việt GDPT",
    "icon": "✍️",
    "title": "Đọc hiểu: Bài học kiên trì rèn luyện nét chữ",
    "island": "study",
    "reward": 150,
    "stepSeconds": 90,
    "original_text": "Đọc đoạn văn sau:\n'Nhờ biết kiên trì rèn luyện từng nét chữ mỗi ngày và không nản lòng trước những trang giấy bị lem mực, cuối cùng Cao Bá Quát đã sửa được tật viết chữ xấu, trở thành người nổi tiếng khắp vùng về tài văn hay chữ tốt.'\nCâu hỏi: Nguyên nhân chính nào giúp Cao Bá Quát từ một người viết chữ rất xấu trở thành người nổi tiếng về chữ tốt? Bài học em rút ra từ câu chuyện trên là gì?",
    "final_answer": {
      "value": "Kiên trì rèn luyện mỗi ngày, không nản lòng trước khó khăn",
      "unit": null,
      "normalized_display": "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
      "acceptable_variants": [
        "kiên trì rèn luyện",
        "lòng kiên trì rèn luyện mỗi ngày và không nản lòng",
        "kiên trì, không nản chí",
        "có ý chí và lòng kiên trì",
        "kiên trì",
        "không nản lòng"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Chỉ trả lời được một nửa câu hỏi (chỉ nêu nguyên nhân hoặc chỉ nêu bài học) do trí nhớ làm việc bị quá tải bởi câu hỏi kép.",
      "executive_function_scaffolding": "Phân tách rành mạch thành 2 phần: [Phần 1: Nguyên nhân là gì?] và [Phần 2: Bài học rút ra là gì?].",
      "visual_or_concrete_aid": "Biểu tượng mũi tên kép nối từ Cố Gắng -> Thành Quả."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Tìm Vế Nguyên Nhân",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm vế kiên trì rèn luyện sau chữ Nhờ.",
        "text": "Tìm vế kiên trì rèn luyện sau chữ Nhờ.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm vế nguyên nhân dẫn đến thành công của bạn nhỏ:",
          "highlight_target_segments": [
            "kiên trì rèn luyện từng nét chữ mỗi ngày và không nản lòng"
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Nguyên nhân là kiên trì rèn luyện mỗi ngày."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "kiên trì rèn luyện từng nét chữ mỗi ngày và không nản lòng"
          ],
          "feedback_on_error": "Nguyên nhân là kiên trì rèn luyện mỗi ngày, không nản lòng!"
        },
        "mathematical_or_logical_goal": "Bóc tách mối quan hệ nhân quả",
        "intermediate_output": "Nguyên nhân: kiên trì rèn luyện, không nản lòng",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Rút Ra Bài Học",
        "action_verb": "Khái_quát",
        "atomic_instruction": "Khái quát bài học kiên trì vượt khó thành công.",
        "text": "Khái quát bài học kiên trì vượt khó thành công.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Câu chuyện gửi gắm bài học cuộc sống gì?",
          "options": [
            "Có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
            "Chỉ cần viết nhanh",
            "Không cần luyện tập"
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Bài học về lòng kiên trì vượt khó."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
          "feedback_on_error": "Có ý chí kiên nhẫn thì sẽ vượt qua khó khăn để thành công!"
        },
        "mathematical_or_logical_goal": "Đúc kết thông điệp đạo đức",
        "intermediate_output": "Bài học: kiên trì, có ý chí vượt khó thì sẽ thành công",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Đáp Án Đầy Đủ",
        "action_verb": "Tổng_hợp",
        "atomic_instruction": "Chọn câu trả lời có đủ nguyên nhân và bài học.",
        "text": "Chọn câu trả lời có đủ nguyên nhân và bài học.",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chọn đáp án tổng hợp hoàn chỉnh:",
          "options": [
            "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
            "Chỉ cần rèn chữ đẹp là đủ",
            "Thành công là do may mắn"
          ]
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 50
        },
        "hints": [
          "Chọn đáp án đầy đủ cả 2 vế."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học: có ý chí, kiên nhẫn thì sẽ vượt qua khó khăn để thành công",
          "feedback_on_error": "Chọn đáp án có cả nguyên nhân và bài học nhé!"
        },
        "mathematical_or_logical_goal": "Diễn đạt câu trả lời trọn vẹn",
        "intermediate_output": "Kiên trì rèn luyện mỗi ngày, không nản lòng; bài học về ý chí và sự kiên trì",
        "is_final_step": true
      }
    ]
  },
  "G5_MCQ_24": {
    "id": "G5_MCQ_24",
    "grade": 5,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🎒",
    "title": "Bài toán giảm giá 2 lần của chiếc cặp sách (Tỉ số %)",
    "island": "study",
    "reward": 150,
    "stepSeconds": 90,
    "original_text": "Giá một chiếc cặp sách đầu năm là 200 000 đồng. Nhân dịp khai giảng, cửa hàng giảm giá 15%. Đến tuần lễ vàng, cửa hàng lại giảm tiếp 10% trên giá đã giảm. Hỏi sau hai lần giảm giá, chiếc cặp sách đó có giá là bao nhiêu?",
    "final_answer": {
      "value": "B",
      "unit": null,
      "normalized_display": "B. 153 000 đồng",
      "acceptable_variants": [
        "B",
        "B.",
        "153 000 đồng",
        "153 000",
        "153000",
        "B. 153 000 đồng"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Bị cám dỗ bởi phép tính nhẩm nhanh 15 + 10 = 25% dẫn thẳng vào bẫy đáp án A.",
      "executive_function_scaffolding": "Rút số ngắn: 1% của 200 000đ là 2000đ. Đặt tính nhân 2000 x 15 có 2 dòng tích riêng rồi cộng lại ra 30 000đ. Sau đó trừ dọc tìm giá sau lần 1 (170 000đ). Lần 2 giảm 10% (17 000đ), trừ dọc ra 153 000đ.",
      "visual_or_concrete_aid": "Nhãn giá hạ bậc thang: Giá 200 000 -> Giảm 15% còn 170 000 -> Giảm 10% còn 153 000."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Dữ Kiện & Từ Khóa",
        "action_verb": "Gạch_chân",
        "atomic_instruction": "Gạch chân giá ban đầu và các tỉ lệ giảm giá trong đề bài.",
        "text": "Gạch chân giá ban đầu và các tỉ lệ giảm giá trong đề bài.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Giá một chiếc cặp sách đầu năm là 200 000 đồng. Nhân dịp khai giảng, cửa hàng giảm giá 15%. Đến tuần lễ vàng, cửa hàng lại giảm tiếp 10% trên giá đã giảm. Hỏi sau hai lần giảm giá, chiếc cặp sách đó có giá là bao nhiêu?",
          "highlight_target_segments": [
            "200 000 đồng",
            "giảm giá 15%",
            "giảm tiếp 10% trên giá đã giảm"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "Gạch chân 200 000 đồng, giảm giá 15% và giảm tiếp 10% trên giá đã giảm."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "200 000 đồng",
            "giảm giá 15%",
            "giảm tiếp 10% trên giá đã giảm"
          ],
          "feedback_on_error": "Tìm đủ 3 dữ kiện quan trọng nhé!"
        },
        "mathematical_or_logical_goal": "Định vị dữ kiện tỉ số % thay đổi gốc tính",
        "intermediate_output": "Gốc: 200.000đ; giảm 15%; giảm tiếp 10%",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Tính Tiền Giảm Lần 1 (2 Dòng Tích Riêng)",
        "action_verb": "Tính",
        "atomic_instruction": "Giá gốc 200 000đ (1% là 2000đ). Đặt tính nhân 2000 với 15, điền 2 dòng tích riêng rồi cộng lại.",
        "text": "Giá gốc 200 000đ (1% là 2000đ). Đặt tính nhân 2000 với 15, điền 2 dòng tích riêng rồi cộng lại.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "2000 × 15 = ? (đồng)",
          "placeholder": "Nhập tiền giảm lần 1..."
        },
        "duration_sec": 90,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Tích riêng 1: 2000 x 5 = 10000. Tích riêng 2: 2000 x 1 = 2000. Cộng lại được 30000."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "30000",
            "30 000"
          ],
          "feedback_on_error": "2000 x 15 = 30 000 đồng con nhé!"
        },
        "mathematical_or_logical_goal": "Đặt tính nhân 2 chữ số có các dòng tích riêng",
        "intermediate_output": "30 000 đồng",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Giá Cặp Sau Lần Giảm 1",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính trừ dọc: lấy giá gốc 200 000 trừ số tiền giảm 30 000.",
        "text": "Đặt tính trừ dọc: lấy giá gốc 200 000 trừ số tiền giảm 30 000.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "200000 - 30000 = ? (đồng)",
          "placeholder": "Nhập giá sau lần 1..."
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "200 000 - 30 000 = 170 000 đồng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "170000",
            "170 000"
          ],
          "feedback_on_error": "200 000 - 30 000 = 170 000 đồng con nhé!"
        },
        "mathematical_or_logical_goal": "Đặt tính trừ tìm giá trị sau lần giảm 1",
        "intermediate_output": "170 000 đồng",
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Tính Tiền Giảm Lần 2 (10%)",
        "action_verb": "Tính",
        "atomic_instruction": "Giá mới 170 000đ (1% là 1700đ). Đặt tính nhân tìm số tiền giảm: lấy 1700 nhân 10.",
        "text": "Giá mới 170 000đ (1% là 1700đ). Đặt tính nhân tìm số tiền giảm: lấy 1700 nhân 10.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "1700 × 10 = ? (đồng)",
          "placeholder": "Nhập tiền giảm lần 2..."
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 30
        },
        "hints": [
          "1700 x 10 = 17 000 đồng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "17000",
            "17 000"
          ],
          "feedback_on_error": "1700 x 10 = 17 000 đồng con nhé!"
        },
        "mathematical_or_logical_goal": "Đặt tính nhân tìm tiền giảm lần 2",
        "intermediate_output": "17 000 đồng",
        "is_final_step": false
      },
      {
        "step_id": 5,
        "badge": "Giá Cặp Sau Hai Lần Giảm",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính trừ dọc: lấy giá 170 000 trừ số tiền giảm 17 000.",
        "text": "Đặt tính trừ dọc: lấy giá 170 000 trừ số tiền giảm 17 000.",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "170000 - 17000 = ? (đồng)",
          "placeholder": "Nhập giá sau lần 2..."
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 30
        },
        "hints": [
          "170 000 - 17 000 = 153 000 đồng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "153000",
            "153 000"
          ],
          "feedback_on_error": "170 000 - 17 000 = 153 000 đồng con nhé!"
        },
        "mathematical_or_logical_goal": "Đặt tính trừ tìm kết quả cuối",
        "intermediate_output": "153 000 đồng",
        "is_final_step": false
      },
      {
        "step_id": 6,
        "badge": "Chọn Đáp Án Đúng",
        "action_verb": "Chọn",
        "atomic_instruction": "Sau 2 lần giảm giá, chiếc cặp sách có giá là 153 000 đồng. Chọn đáp án đúng:",
        "text": "Sau 2 lần giảm giá, chiếc cặp sách có giá là 153 000 đồng. Chọn đáp án đúng:",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chiếc cặp sau hai lần giảm giá có giá là:",
          "options": [
            "A. 150 000 đồng",
            "B. 153 000 đồng",
            "C. 160 000 đồng",
            "D. 170 000 đồng"
          ]
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 40
        },
        "hints": [
          "Đáp án là B. 153 000 đồng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "B. 153 000 đồng",
          "feedback_on_error": "Đáp án đúng là B con nha!"
        },
        "mathematical_or_logical_goal": "Chọn đáp án trắc nghiệm",
        "intermediate_output": "B. 153 000 đồng",
        "is_final_step": true
      }
    ],
    "exercise_type": "word_problem"
  },
  "G5_ENG_25": {
    "id": "G5_ENG_25",
    "grade": 5,
    "subject": "Tiếng Anh",
    "cat": "eng",
    "catName": "Tiếng Anh Tiểu Học",
    "icon": "✈️",
    "title": "English Reading: Chuyến đi Đà Nẵng của Nam (By plane)",
    "island": "study",
    "reward": 140,
    "stepSeconds": 80,
    "original_text": "Read the story:\n'Last summer, Nam went to Da Nang with his parents. They visited Ba Na Hills and took a cable car to the Golden Bridge. The weather was cool and sunny. Nam took lots of beautiful photos. On the last day, they bought some seafood and souvenirs before taking a plane back to Ha Noi.'\nQuestion: How did Nam and his family travel back to Ha Noi?",
    "final_answer": {
      "value": "C",
      "unit": null,
      "normalized_display": "C. By plane",
      "acceptable_variants": [
        "C",
        "C.",
        "By plane",
        "plane",
        "C. By plane"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Đọc lướt thấy 'cable car' ở câu 2 và vội vã suy đoán hoặc chọn sai phương tiện.",
      "executive_function_scaffolding": "Neo từ khóa thời gian: 'On the last day' + 'back to Ha Noi'.",
      "visual_or_concrete_aid": "Biểu tượng máy bay gắn liền với chiều mũi tên bay từ Đà Nẵng về Hà Nội."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xác Định Câu Hỏi",
        "action_verb": "Tìm",
        "atomic_instruction": "Tìm phương tiện về Hà Nội trong câu hỏi.",
        "text": "Tìm phương tiện về Hà Nội trong câu hỏi.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm cụm từ 'travel back to Ha Noi' trong câu hỏi:",
          "highlight_target_segments": [
            "travel back to Ha Noi"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Câu hỏi hỏi phương tiện đi về Hà Nội."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "travel back to Ha Noi"
          ],
          "feedback_on_error": "Tìm phương tiện travel back to Ha Noi con nha!"
        },
        "mathematical_or_logical_goal": "Xác định mục tiêu tìm kiếm thông tin",
        "intermediate_output": "Target: transport back to Ha Noi",
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Dò Cụm Taking A Plane",
        "action_verb": "Dò",
        "atomic_instruction": "Dò câu cuối chứa taking a plane back to Ha Noi.",
        "text": "Dò câu cuối chứa taking a plane back to Ha Noi.",
        "type": "highlight",
        "ui_type": "highlight",
        "ui_data": {
          "prompt_text": "Tìm phương tiện trong câu cuối của đoạn văn:",
          "highlight_target_segments": [
            "taking a plane"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Nam đi máy bay: taking a plane."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "taking a plane"
          ],
          "feedback_on_error": "Cụm từ là 'taking a plane' nhé!"
        },
        "mathematical_or_logical_goal": "Định vị dẫn chứng văn bản",
        "intermediate_output": "'taking a plane'",
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Chọn Phương Án C",
        "action_verb": "Chọn",
        "atomic_instruction": "Chọn phương án C đi bằng máy bay (By plane).",
        "text": "Chọn phương án C đi bằng máy bay (By plane).",
        "type": "single_choice",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chọn phương án trắc nghiệm đúng:",
          "options": [
            "A. By train",
            "B. By coach",
            "C. By plane",
            "D. By boat"
          ]
        },
        "duration_sec": 80,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 45
        },
        "hints": [
          "Taking a plane tương ứng với By plane."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "C. By plane",
          "feedback_on_error": "Phương án C. By plane là chính xác!"
        },
        "mathematical_or_logical_goal": "Quy đổi ngữ nghĩa và chọn phương án",
        "intermediate_output": "Phương án C",
        "is_final_step": true
      }
    ]
  },
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
      "unit": null,
      "normalized_display": "Bàn học gọn gàng, sạch sẽ",
      "acceptable_variants": [
        "gọn gàng",
        "sạch sẽ",
        "ngăn nắp"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ dễ bị quá tải khi nhìn mặt bàn lộn xộn nhiều đồ vật cùng lúc (Visual Clutter Paralysis).",
      "executive_function_scaffolding": "Chia nhỏ thành 4 vi hành động đơn lẻ theo thứ tự: bút -> rác -> sách -> lau bàn.",
      "visual_or_concrete_aid": "Hoạt ảnh tương tác từng món đồ biến mất vào đúng vị trí khi chạm vào."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Cắm bút vào ống",
        "action_verb": "Cắm_bút",
        "atomic_instruction": "Chạm vào 3 cây bút bừa bộn trên bàn.",
        "text": "Chạm vào 3 cây bút bừa bộn trên bàn.",
        "type": "chore_pens",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chạm vào 3 cây bút đang nằm bừa bộn trên bàn để cắm vào ống:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Chạm vào bút chì, bút bi và bút sáp để cất gọn nhé."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": "pen3",
          "feedback_on_error": "Con cất đủ 3 cây bút vào ống nhé!"
        },
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Gom giấy vụn",
        "action_verb": "Gom_rác",
        "atomic_instruction": "Chạm vào các mảnh giấy bỏ vào sọt rác.",
        "text": "Chạm vào các mảnh giấy bỏ vào sọt rác.",
        "type": "chore_trash",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chạm vào mảnh giấy nháp bỏ vào sọt rác dưới gầm bàn:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 25
        },
        "hints": [
          "Bấm nút bỏ giấy vào thùng rác nào."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Mẩu giấy nháp cần được bỏ vào thùng rác nha!"
        },
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Xếp sách vở",
        "action_verb": "Xếp_sách",
        "atomic_instruction": "Chạm vào chồng sách xếp ngay ngắn góc trái.",
        "text": "Chạm vào chồng sách xếp ngay ngắn góc trái.",
        "type": "chore_books",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chạm vào chồng sách để xếp ngay ngắn vào góc trái:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "milo_thumbs_up",
          "audio_cue": "gentle_pop_success",
          "dopamine_points": 30
        },
        "hints": [
          "Xếp các cuốn sách ngay ngắn thẳng hàng góc trái."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Xếp sách thẳng hàng cùng Milo nhé!"
        },
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Lau sạch mặt bàn",
        "action_verb": "Lau_bàn",
        "atomic_instruction": "Chạm khăn lau để mặt bàn sáng bóng sạch sẽ.",
        "text": "Chạm khăn lau để mặt bàn sáng bóng sạch sẽ.",
        "type": "chore_wipe",
        "ui_type": "single_choice",
        "ui_data": {
          "prompt_text": "Chạm vào khăn lau để mặt bàn sáng bóng nhé:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Bấm khăn lau để mặt bàn sáng bóng lấp lánh."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Dùng khăn lau sạch vết bụi trên mặt bàn nào!"
        },
        "is_final_step": true
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
      "unit": null,
      "normalized_display": "Răng miệng sạch thơm tho",
      "acceptable_variants": [
        "sạch sẽ",
        "thơm tho",
        "trắng sáng"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ dễ vội vã đánh qua loa dưới 30 giây do bồn chồn cơ thể.",
      "executive_function_scaffolding": "Đĩa đồng hồ đếm ngược êm dịu chia 3 nhịp: chuẩn bị -> chải 2 phút -> súc miệng.",
      "visual_or_concrete_aid": "Hoạt ảnh bọt xà phòng trắng xoay tròn trên hàm răng."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Lấy kem đánh răng",
        "action_verb": "Lấy_kem",
        "atomic_instruction": "Lấy lượng kem bằng một hạt đậu nhỏ.",
        "text": "Lấy lượng kem bằng một hạt đậu nhỏ.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Lấy lượng kem vừa đủ bằng một hạt đậu nhỏ lên đầu lông bàn chải:"
        },
        "duration_sec": 45,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Chỉ cần một hạt đậu nhỏ là đủ rồi con nhé."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Lấy kem bằng hạt đậu nhỏ thôi con nha!"
        },
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Chải răng 2 phút",
        "action_verb": "Chải_răng",
        "atomic_instruction": "Chải xoay tròn mặt ngoài, trong và nhai.",
        "text": "Chải xoay tròn mặt ngoài, trong và nhai.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Chải nhẹ nhàng xoay tròn mặt ngoài, mặt trong và mặt nhai:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Đưa bàn chải theo vòng tròn nhẹ nhàng khắp hàm răng."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Chải đủ mặt ngoài, mặt trong và mặt nhai nhé!"
        },
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Súc miệng sạch",
        "action_verb": "Súc_miệng",
        "atomic_instruction": "Súc miệng sạch và cất bàn chải vào cốc.",
        "text": "Súc miệng sạch và cất bàn chải vào cốc.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Súc miệng sạch sẽ với nước và cất bàn chải vào cốc thẳng đứng:"
        },
        "duration_sec": 45,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Súc miệng 2 lần với nước sạch và cất bàn chải."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Súc miệng thật sạch và cất cốc ngay ngắn nào!"
        },
        "is_final_step": true
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
      "unit": null,
      "normalized_display": "Balo sẵn sàng đến trường",
      "acceptable_variants": [
        "sẵn sàng",
        "đầy đủ",
        "ngăn nắp"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Thường quên các món đồ nhỏ như bút chì, thước kẻ hoặc bình nước cá nhân.",
      "executive_function_scaffolding": "Checklist trực quan 4 điểm chốt chặn ngăn ngừa bỏ quên.",
      "visual_or_concrete_aid": "Biểu tượng balo mở nắp với các ngăn phát sáng tương ứng từng món đồ."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Thời khóa biểu",
        "action_verb": "Xem",
        "atomic_instruction": "Mở xem thời khóa biểu ngày mai đúng các môn.",
        "text": "Mở xem thời khóa biểu ngày mai đúng các môn.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Mở xem thời khóa biểu ngày mai để chọn đúng các môn học:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Nhìn vào thời khóa biểu ngày mai xem có môn gì nhé."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Xem thời khóa biểu ngày mai cùng Milo nha!"
        },
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Xếp sách vở",
        "action_verb": "Xếp_sách",
        "atomic_instruction": "Xếp sách to ở trong, vở mỏng ở ngoài.",
        "text": "Xếp sách to ở trong, vở mỏng ở ngoài.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Xếp sách to ở trong cùng, vở bài tập mỏng ở phía ngoài:"
        },
        "duration_sec": 70,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 25
        },
        "hints": [
          "Sách to xếp vào lưng cặp, vở mỏng ở ngoài."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Sách to ở trong, vở mỏng ở ngoài nha con!"
        },
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Kiểm tra hộp bút",
        "action_verb": "Kiểm_tra",
        "atomic_instruction": "Kiểm tra đủ 2 bút mực, 1 bút chì, 1 thước.",
        "text": "Kiểm tra đủ 2 bút mực, 1 bút chì, 1 thước.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Đảm bảo có đủ 2 bút mực, 1 bút chì và 1 chiếc thước kẻ:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "milo_thumbs_up",
          "audio_cue": "gentle_pop_success",
          "dopamine_points": 30
        },
        "hints": [
          "Mở hộp bút đếm: 2 bút mực, 1 chì, 1 thước."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Kiểm tra đủ bút thước để mai làm bài tốt nhé!"
        },
        "is_final_step": false
      },
      {
        "step_id": 4,
        "badge": "Bình nước cá nhân",
        "action_verb": "Bỏ_bình",
        "atomic_instruction": "Cho bình nước đầy vào ngăn lưới bên hông.",
        "text": "Cho bình nước đầy vào ngăn lưới bên hông.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Cho bình nước sạch đã rót đầy vào ngăn lưới bên hông balo:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Bình nước uống sạch để ở túi lưới bên sườn."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Nhớ mang theo bình nước để nạp năng lượng con nha!"
        },
        "is_final_step": true
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
      "unit": null,
      "normalized_display": "Giường ngủ ngăn nắp gọn gàng",
      "acceptable_variants": [
        "gọn gàng",
        "ngăn nắp",
        "phẳng phiu"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Mới ngủ dậy não bộ còn quán tính giấc ngủ (Sleep Inertia), dễ bỏ qua việc gấp chăn.",
      "executive_function_scaffolding": "3 động tác cơ học cực đơn giản: giũ -> gấp tư -> xếp gối.",
      "visual_or_concrete_aid": "Hoạt ảnh chăn gấp tự động thành hình chữ nhật phẳng phiu."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Giũ phẳng chăn",
        "action_verb": "Giũ",
        "atomic_instruction": "Giũ nhẹ để chăn trải phẳng trên giường.",
        "text": "Giũ nhẹ để chăn trải phẳng trên giường.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Cầm hai mép chăn giũ nhẹ để chăn trải phẳng trên giường:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "sparkle_star_01",
          "audio_cue": "positive_bell_c6",
          "dopamine_points": 25
        },
        "hints": [
          "Cầm 2 góc chăn giũ cho phẳng phiu."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Giũ nhẹ chăn cho phẳng trước khi gấp con nhé!"
        },
        "is_final_step": false
      },
      {
        "step_id": 2,
        "badge": "Gấp chăn làm tư",
        "action_verb": "Gấp",
        "atomic_instruction": "Gấp đôi chăn rồi gấp lại thành hình vuông.",
        "text": "Gấp đôi chăn rồi gấp lại thành hình vuông.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Gấp đôi chăn theo chiều dọc rồi gấp đôi lại thành hình vuông gọn:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "particle_burst_gold",
          "audio_cue": "sparkle_ting_short",
          "dopamine_points": 35
        },
        "hints": [
          "Gấp đôi một lần, rồi gấp đôi thêm một lần nữa."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Gấp đôi rồi gấp tư thành hình vuông gọn gàng nha!"
        },
        "is_final_step": false
      },
      {
        "step_id": 3,
        "badge": "Đặt gối ngay ngắn",
        "action_verb": "Đặt",
        "atomic_instruction": "Vỗ nhẹ gối và đặt sát đầu giường.",
        "text": "Vỗ nhẹ gối và đặt sát đầu giường.",
        "type": "generic",
        "ui_type": "checkbox",
        "ui_data": {
          "prompt_text": "Vỗ nhẹ gối và đặt ngay ngắn sát đầu giường:"
        },
        "duration_sec": 60,
        "immediate_reinforcer": {
          "visual_asset": "confetti_cannon",
          "audio_cue": "harp_glissando_soft",
          "dopamine_points": 40
        },
        "hints": [
          "Vỗ nhẹ gối và xếp sát đầu giường nhé."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": true,
          "feedback_on_error": "Đặt chiếc gối êm ái sát đầu giường nào!"
        },
        "is_final_step": true
      }
    ]
  },
  "G5_DEMO_DECIMAL": {
    "id": "G5_DEMO_DECIMAL",
    "grade": 5,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "icon": "🧪",
    "title": "🧪 [MẪU THỬ NGHIỆM] Nhân Số Thập Phân: 25,8 × 1,5",
    "island": "study",
    "reward": 100,
    "stepSeconds": 120,
    "original_text": "Mẫu thử nghiệm so sánh 3 phương án giao diện đặt tính nhân số thập phân kinh điển: 25,8 × 1,5.",
    "final_answer": {
      "value": "38.7",
      "unit": null,
      "normalized_display": "38,70",
      "acceptable_variants": [
        "38.7",
        "38,7",
        "38.70",
        "38,70"
      ]
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Thử nghiệm 3 phong cách giao diện trực quan cho trẻ ADHD.",
      "executive_function_scaffolding": "Phương án 1 (Lưới khít SGK), Phương án 2 (Vở ô ly), Phương án 3 (Thanh trượt chấm phẩy).",
      "visual_or_concrete_aid": "Thanh chọn 3 phương án trực tiếp trên đầu thẻ."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Thử Nghiệm Giao Diện 25,8 × 1,5",
        "action_verb": "Tính",
        "atomic_instruction": "Thử nghiệm đặt tính nhân: 25,8 nhân 1,5. Bạn có thể bấm chọn 3 phương án giao diện bên dưới!",
        "text": "Thử nghiệm đặt tính nhân: 25,8 nhân 1,5. Bạn có thể bấm chọn 3 phương án giao diện bên dưới!",
        "type": "text_input",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "25,8 × 1,5 = ?",
          "placeholder": "Nhập đáp số...",
          "is_decimal_demo": true
        },
        "duration_sec": 120,
        "immediate_reinforcer": {
          "visual_asset": "chest_open_burst",
          "audio_cue": "orchestral_fanfare_c6",
          "dopamine_points": 50
        },
        "hints": [
          "25,8 x 1,5 = 38,70."
        ],
        "success_criteria": {
          "evaluation_type": "exact_match",
          "expected_answer": [
            "38.7",
            "38,7",
            "38.70",
            "38,70"
          ],
          "feedback_on_error": "Kết quả là 38,70 con nhé!"
        },
        "mathematical_or_logical_goal": "So sánh 3 phong cách đặt tính nhân số thập phân",
        "intermediate_output": "38,70",
        "is_final_step": true
      }
    ],
    "exercise_type": "pure_arithmetic"
  },
  "G4_MATH_ARITH_MULTI_01": {
    "id": "G4_MATH_ARITH_MULTI_01",
    "grade": 4,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "exercise_type": "multi_item_arithmetic",
    "icon": "➕",
    "title": "Đặt tính rồi tính: Phép cộng nhiều chữ số (4 ý)",
    "header_title": "Bài 1: Đặt tính rồi tính",
    "island": "study",
    "reward": 120,
    "stepSeconds": 180,
    "original_text": "Bài 1: Đặt tính rồi tính: a) 95626 + 50482   b) 36011 + 17165   c) 52764 + 57532   d) 88891 + 22360",
    "final_answer": {
      "value": "146108; 53176; 110296; 111251",
      "unit": null,
      "normalized_display": "a) 146108; b) 53176; c) 110296; d) 111251"
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ dễ bị quá tải khi nhìn cả 4 phép tính cùng lúc hoặc bị bắt xác định phép tính rườm rà.",
      "executive_function_scaffolding": "Header chung ghim tiêu đề bài. Mỗi ý là 1 thẻ tập trung duy nhất, điền số từ phải qua trái.",
      "visual_or_concrete_aid": "Bảng đặt tính cột dọc chuẩn SGK với vạch kẻ ngang và ô nhập số căn lề chuẩn."
    },
    "items": [
      {
        "item_id": "a",
        "label": "a)",
        "top": "95626",
        "op": "+",
        "bot": "50482",
        "expected_answer": "146108",
        "dopamine_points": 30
      },
      {
        "item_id": "b",
        "label": "b)",
        "top": "36011",
        "op": "+",
        "bot": "17165",
        "expected_answer": "53176",
        "dopamine_points": 30
      },
      {
        "item_id": "c",
        "label": "c)",
        "top": "52764",
        "op": "+",
        "bot": "57532",
        "expected_answer": "110296",
        "dopamine_points": 30
      },
      {
        "item_id": "d",
        "label": "d)",
        "top": "88891",
        "op": "+",
        "bot": "22360",
        "expected_answer": "111251",
        "dopamine_points": 30
      }
    ],
    "steps": [
      {
        "step_id": 1,
        "badge": "Ý a)",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính và tính kết quả ý a: 95626 + 50482",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "95626 + 50482 = ?"
        },
        "expected_answer": "146108",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "146108"
        }
      },
      {
        "step_id": 2,
        "badge": "Ý b)",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính và tính kết quả ý b: 36011 + 17165",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "36011 + 17165 = ?"
        },
        "expected_answer": "53176",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "53176"
        }
      },
      {
        "step_id": 3,
        "badge": "Ý c)",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính và tính kết quả ý c: 52764 + 57532",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "52764 + 57532 = ?"
        },
        "expected_answer": "110296",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "110296"
        }
      },
      {
        "step_id": 4,
        "badge": "Ý d)",
        "action_verb": "Tính",
        "atomic_instruction": "Đặt tính và tính kết quả ý d: 88891 + 22360",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "88891 + 22360 = ?"
        },
        "expected_answer": "111251",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "111251"
        },
        "is_final_step": true
      }
    ]
  },
  "G4_MATH_FIND_X_MULTI_02": {
    "id": "G4_MATH_FIND_X_MULTI_02",
    "grade": 4,
    "subject": "Toán",
    "cat": "math",
    "catName": "Toán GDPT 2018",
    "exercise_type": "multi_item_find_x",
    "icon": "🎯",
    "title": "Tìm x: Biểu thức nâng cao & 2 tầng phép tính (4 ý)",
    "header_title": "Bài 2: Tìm x",
    "island": "study",
    "reward": 160,
    "stepSeconds": 240,
    "original_text": "Bài 2: Tìm x biết: a) x + 354 = 820   b) x + 125 = 450 - 150   c) x × 3 + 45 = 105   d) (x + 25) : 3 = 40",
    "final_answer": {
      "value": "466; 175; 20; 95",
      "unit": null,
      "normalized_display": "a) x = 466; b) x = 175; c) x = 20; d) x = 95"
    },
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ ADHD dễ bị ngợp khi gặp bài tìm x có nhiều phép tính hoặc ngoặc đơn.",
      "executive_function_scaffolding": "Tương tác lũy tiến từng dòng vở toán, đồng bộ cửa sổ đặt tính cho mọi phép tính nháp, tự động format thành bài giải 3-5 dòng chuẩn SGK.",
      "visual_or_concrete_aid": "Trang vở ô ly sạch sẽ không nhãn thừa, bảng đặt tính dọc RTL trượt xuống đúng lúc."
    },
    "items": [
      {
        "item_id": "a",
        "label": "a)",
        "sub_type": "single_op",
        "equation": "x + 354 = 820",
        "left_lead": "x = 820",
        "correct_op": "-",
        "target_num": "354",
        "formatted_line2": "x = 820 - 354",
        "calc_top": "820",
        "calc_op": "-",
        "calc_bot": "354",
        "expected_x": "466",
        "formatted_final": "x = 466",
        "dopamine_points": 40
      },
      {
        "item_id": "b",
        "label": "b)",
        "sub_type": "rhs_expr",
        "equation": "x + 125 = 450 - 150",
        "rhs_calc": {
          "top": "450",
          "op": "-",
          "bot": "150",
          "expected": "300"
        },
        "step1_formatted": "x + 125 = 300",
        "step2_lead": "x = 300",
        "step2_op": "-",
        "step2_num": "125",
        "step2_formatted": "x = 300 - 125",
        "final_calc": {
          "top": "300",
          "op": "-",
          "bot": "125",
          "expected": "175"
        },
        "formatted_final": "x = 175",
        "dopamine_points": 40
      },
      {
        "item_id": "c",
        "label": "c)",
        "sub_type": "two_tier",
        "equation": "x × 3 + 45 = 105",
        "tier1_lead": "x × 3 = 105",
        "tier1_op": "-",
        "tier1_num": "45",
        "tier1_formatted": "x × 3 = 105 - 45",
        "tier1_calc": {
          "top": "105",
          "op": "-",
          "bot": "45",
          "expected": "60"
        },
        "tier1_res_formatted": "x × 3 = 60",
        "tier2_lead": "x = 60",
        "tier2_op": ":",
        "tier2_num": "3",
        "tier2_formatted": "x = 60 : 3",
        "final_calc": {
          "top": "60",
          "op": ":",
          "bot": "3",
          "expected": "20"
        },
        "formatted_final": "x = 20",
        "dopamine_points": 40
      },
      {
        "item_id": "d",
        "label": "d)",
        "sub_type": "paren_expr",
        "equation": "(x + 25) : 3 = 40",
        "step1_lead": "x + 25 = 40",
        "step1_op": "×",
        "step1_num": "3",
        "step1_formatted": "x + 25 = 40 × 3",
        "step1_calc": {
          "top": "40",
          "op": "×",
          "bot": "3",
          "expected": "120"
        },
        "step1_res_formatted": "x + 25 = 120",
        "step2_lead": "x = 120",
        "step2_op": "-",
        "step2_num": "25",
        "step2_formatted": "x = 120 - 25",
        "final_calc": {
          "top": "120",
          "op": "-",
          "bot": "25",
          "expected": "95"
        },
        "formatted_final": "x = 95",
        "dopamine_points": 40
      }
    ],
    "steps": [
      {
        "step_id": 1,
        "badge": "Câu a)",
        "action_verb": "Tìm",
        "atomic_instruction": "Giải câu a: x + 354 = 820",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "x + 354 = 820 => x = ?"
        },
        "expected_answer": "466",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "466"
        }
      },
      {
        "step_id": 2,
        "badge": "Câu b)",
        "action_verb": "Tìm",
        "atomic_instruction": "Giải câu b: x + 125 = 450 - 150",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "x + 125 = 450 - 150 => x = ?"
        },
        "expected_answer": "175",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "175"
        }
      },
      {
        "step_id": 3,
        "badge": "Câu c)",
        "action_verb": "Tìm",
        "atomic_instruction": "Giải câu c: x × 3 + 45 = 105",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "x × 3 + 45 = 105 => x = ?"
        },
        "expected_answer": "20",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "20"
        }
      },
      {
        "step_id": 4,
        "badge": "Câu d)",
        "action_verb": "Tìm",
        "atomic_instruction": "Giải câu d: (x + 25) : 3 = 40",
        "ui_type": "text_input",
        "ui_data": {
          "prompt_text": "(x + 25) : 3 = 40 => x = ?"
        },
        "expected_answer": "95",
        "duration_sec": 60,
        "success_criteria": {
          "expected_answer": "95"
        },
        "is_final_step": true
      }
    ]
  }
};

// ==========================================
// DEDICATED DAILY ROUTINE DATABASE (TIMELINE LOCKED)
// ==========================================
window.routineDatabase = {
  "routine_morning_bed": {
    "id": "routine_morning_bed",
    "timeline_slot": "morning",
    "slot_time": "06:30",
    "title": "Gấp chăn gối phẳng phiu sau khi thức dậy",
    "cat": "routine",
    "catName": "Thói Quen Buổi Sáng",
    "icon": "🛏️",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_BED_0645.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Mới ngủ dậy não bộ còn quán tính giấc ngủ (Sleep Inertia), dễ quên gấp chăn nếu không có quy trình cơ học.",
      "executive_function_scaffolding": "3 cử động cơ bắp siêu đơn giản: Giũ phẳng -> Gấp đôi -> Đặt gối sát đầu giường.",
      "visual_or_concrete_aid": "Hoạt ảnh chiếc chăn tự động gấp đôi vuông vắn trên màn hình."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Giũ phẳng chăn",
        "action_verb": "Giũ",
        "atomic_instruction": "Cầm hai mép chăn giũ nhẹ để chăn trải phẳng trên giường.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Cầm 2 góc chăn giũ cho phẳng phiu con nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Gấp đôi mép chăn",
        "action_verb": "Gấp",
        "atomic_instruction": "Gấp đôi chăn theo chiều dọc rồi gấp lại thành hình vuông gọn gàng.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Gấp mép chăn vào giữa để tạo thành hình vuông xinh xắn."
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng giường phẳng",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh chiếc giường đã phẳng phiu để lưu vào Nhật ký của Mẹ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 10,
        "hints": [
          "Giơ máy chụp toàn cảnh chiếc giường gọn gàng nào!"
        ]
      }
    ]
  },
  "routine_morning_water": {
    "id": "routine_morning_water",
    "timeline_slot": "morning",
    "slot_time": "06:40",
    "title": "Uống 1 cốc nước ấm đánh thức cơ thể",
    "cat": "routine",
    "catName": "Thói Quen Buổi Sáng",
    "icon": "🥛",
    "island": "routine",
    "reward": 15,
    "target_photo_tag": "LEO_WATER_0640.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Não bộ trẻ ADHD sau đêm dài thiếu nước dễ cáu kỉnh và giảm tập trung (Dehydration Fatigue).",
      "executive_function_scaffolding": "Uống 1 cốc nước ấm 200ml giúp tăng tuần hoàn máu lên thùy trán.",
      "visual_or_concrete_aid": "Hoạt ảnh ly nước dâng lên và tim năng lượng bừng sáng."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Rót nước ấm",
        "action_verb": "Rót_nước",
        "atomic_instruction": "Rót 1 cốc nước lọc ấm vừa tay cầm (khoảng nửa cốc).",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 30,
        "dopamine_points": 5,
        "hints": [
          "Rót nước ấm vừa phải, cẩn thận kẻo tràn ly nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Uống từng ngụm",
        "action_verb": "Uống_nước",
        "atomic_instruction": "Uống từ từ từng ngụm nước ấm đánh thức các cơ quan trong cơ thể cho đến khi hết cốc.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Uống từng ngụm nhỏ chậm rãi thật sảng khoái nào!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng cốc rỗng",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh chiếc cốc đã uống cạn gửi Mẹ xem nhé!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Giơ máy chụp chiếc cốc sạch bóng nào!"
        ]
      }
    ]
  },
  "routine_morning_teeth": {
    "id": "routine_morning_teeth",
    "timeline_slot": "morning",
    "slot_time": "06:50",
    "title": "Rửa mặt mát & Đánh răng thơm tho",
    "cat": "routine",
    "catName": "Thói Quen Buổi Sáng",
    "icon": "🪥",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_TEETH_AM_0650.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Mới ngủ dậy còn ngái ngủ, trẻ hay quên lượng kem hoặc chải qua loa.",
      "executive_function_scaffolding": "Checkpoint cụ thể bằng thị giác: Chụp ảnh chiếc bàn chải đã có kem hạt đậu trước khi chải.",
      "visual_or_concrete_aid": "Hoạt ảnh bóp kem hạt đậu lên bàn chải và nụ cười lấp lánh."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Rửa mặt nước mát",
        "action_verb": "Rửa_mặt",
        "atomic_instruction": "Vặn vòi nước, xoa hai tay vỗ nước mát lên mặt để tỉnh táo hoàn toàn.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Nước mát sẽ giúp mắt Leo mở to tròn sảng khoái!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Minh chứng kem hạt đậu",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Bóp lượng kem đánh răng bằng hạt đậu lên bàn chải và chụp 1 tấm ảnh khoe với Mẹ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Giơ bàn chải đã có kem hạt đậu lên chụp một tấm thật rõ nét nhé!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Chải tròn các mặt răng",
        "action_verb": "Chải_răng",
        "atomic_instruction": "Chải xoay tròn mặt ngoài và mặt trong của răng trong 2 phút theo nhịp của Milo, rồi súc miệng sạch sẽ.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Chải xoay tròn từng chiếc răng xinh để vi khuẩn sâu răng biến mất!"
        ]
      }
    ]
  },
  "routine_morning_outfit": {
    "id": "routine_morning_outfit",
    "timeline_slot": "morning",
    "slot_time": "07:05",
    "title": "Tự mặc đồng phục & Đeo thẻ học sinh",
    "cat": "routine",
    "catName": "Thói Quen Buổi Sáng",
    "icon": "👔",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_OUTFIT_0705.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Hay mặc ngược áo hoặc quên đeo thẻ học sinh và khăn quàng đỏ.",
      "executive_function_scaffolding": "Checklist thị giác 3 điểm: Áo cài cúc phẳng -> Đeo thẻ học sinh -> Đi tất chân.",
      "visual_or_concrete_aid": "Hình minh họa chiếc áo cài đủ cúc và chiếc thẻ trước ngực."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Mặc áo cài cúc",
        "action_verb": "Mặc_áo",
        "atomic_instruction": "Mặc áo đồng phục và cài các nút cúc thẳng hàng từ trên xuống.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Soi gương xem cúc áo có bị cài lệch hàng không con nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Đeo thẻ học sinh",
        "action_verb": "Đeo_thẻ",
        "atomic_instruction": "Lấy dây thẻ học sinh đeo vào cổ ngay ngắn trước ngực.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 30,
        "dopamine_points": 5,
        "hints": [
          "Chiếc thẻ mang tên con đã sẵn sàng đến trường!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng chỉn chu",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh bộ đồng phục chỉn chu gửi Mẹ xem trước khi đi học!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Trông Leo thật bảnh bao trong bộ đồng phục!"
        ]
      }
    ]
  },
  "routine_afterschool_drop": {
    "id": "routine_afterschool_drop",
    "timeline_slot": "afternoon",
    "slot_time": "16:30",
    "title": "Hạ cánh tan trường: Cất giày & Treo balo",
    "cat": "routine",
    "catName": "Nề Nếp Tan Trường",
    "icon": "🎒",
    "island": "routine",
    "reward": 25,
    "target_photo_tag": "LEO_DROP_1645.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Vừa về nhà trẻ muốn lao ngay vào chơi hoặc xem màn hình, vứt giày và cặp giữa sàn nhà.",
      "executive_function_scaffolding": "Trạm dừng chân 2 phút tại cửa vào (Entryway Decompression): Cởi giày lên kệ -> Treo cặp lên móc.",
      "visual_or_concrete_aid": "Khung đổ bóng hình đôi giày và chiếc móc treo định vị chính xác vị trí đồ vật."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xếp giày lên kệ",
        "action_verb": "Cất_giày",
        "atomic_instruction": "Cởi đôi giày ra và đặt ngay ngắn lên tầng kệ dép của con.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Đặt mũi giày quay ra ngoài cho ngăn nắp nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Treo balo lên móc",
        "action_verb": "Treo_cặp",
        "atomic_instruction": "Treo quai balo học sinh vào chiếc móc treo tường quen thuộc.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Treo cặp lên móc để sàn nhà không bị vướng lối đi."
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng trạm hạ cánh",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh kệ dép và chiếc balo đã treo gọn gàng gửi Mẹ xem nhé!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 15,
        "hints": [
          "Chụp góc cửa ra vào sạch tinh tươm nào!"
        ]
      }
    ]
  },
  "routine_afterschool_wash": {
    "id": "routine_afterschool_wash",
    "timeline_slot": "afternoon",
    "slot_time": "16:40",
    "title": "Rửa tay xà phòng 6 bước & Thay đồ nhà",
    "cat": "routine",
    "catName": "Nề Nếp Tan Trường",
    "icon": "🧼",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_WASH_1640.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Rửa tay qua loa 3 giây dưới nước mà không dùng xà phòng diệt khuẩn sau buổi học đông người.",
      "executive_function_scaffolding": "Bài hát đếm 30 giây xoa bọt xà phòng tạo phản xạ vệ sinh tự giác.",
      "visual_or_concrete_aid": "Hoạt ảnh các hạt bong bóng xà phòng xua đuổi vi khuẩn."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Bơm xà phòng xoa bọt",
        "action_verb": "Xoa_tay",
        "atomic_instruction": "Bơm 1 nhấn xà phòng, xoa đều lòng bàn tay, mu bàn tay và các kẽ ngón trong 30 giây.",
        "ui_type": "single_choice",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Kỳ cọ cả các đầu ngón tay và cổ tay thật kỹ nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Xả sạch & Treo đồng phục",
        "action_verb": "Thay_đồ",
        "atomic_instruction": "Xả sạch bọt dưới vòi nước, lau khô tay và thay bộ quần áo mặc ở nhà thoải mái.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Treo áo đồng phục vào mắc áo hoặc bỏ vào giỏ giặt nhé!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng tay sạch",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh đôi bàn tay sạch sẽ thơm tho gửi Mẹ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Xòe 2 bàn tay sạch thơm chụp ảnh nào!"
        ]
      }
    ]
  },
  "routine_afterschool_snack": {
    "id": "routine_afterschool_snack",
    "timeline_slot": "afternoon",
    "slot_time": "17:00",
    "title": "Ăn bữa xế & Bỏ bình nước ra bồn rửa",
    "cat": "routine",
    "catName": "Nề Nếp Tan Trường",
    "icon": "🍎",
    "island": "routine",
    "reward": 15,
    "target_photo_tag": "LEO_SNACK_1700.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Hay bỏ quên bình nước hoặc hộp thức ăn lưu cữu trong cặp nhiều ngày gây mốc mùi.",
      "executive_function_scaffolding": "Neo thói quen (Habit Stacking): Cứ ăn bữa xế là lấy bình nước trong cặp ra bồn rửa.",
      "visual_or_concrete_aid": "Hoạt ảnh chiếc bình nước bay từ cặp sang bồn rửa bát."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Bỏ bình nước ra bồn",
        "action_verb": "Lấy_bình",
        "atomic_instruction": "Mở ngăn hông cặp, lấy bình nước mang từ trường ra đặt vào bồn rửa bát để rửa.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Mở nắp bình nước ra đặt trong bồn rửa con nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Ăn bữa phụ nhẹ nhàng",
        "action_verb": "Ăn_xế",
        "atomic_instruction": "Thưởng thức sữa hoặc đĩa trái cây nạp lại năng lượng sau giờ học.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Ăn ngon miệng để có sức tối nay chinh phục thử thách nhé!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng bồn rửa",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh bình nước đã nằm ngay ngắn trong bồn rửa gửi Mẹ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Mẹ sẽ rất hài lòng khi thấy bình nước được lấy ra kịp thời!"
        ]
      }
    ]
  },
  "routine_dinner_prep": {
    "id": "routine_dinner_prep",
    "timeline_slot": "evening",
    "slot_time": "18:30",
    "title": "Giúp mẹ dọn bàn ăn: Xếp đũa thìa bát cơm",
    "cat": "routine",
    "catName": "Nề Nếp Góc Học Tập & Gia Đình",
    "icon": "🍚",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_DINNER_1830.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ hay bị phân tâm vào tivi/game lúc cả nhà chuẩn bị ăn cơm, thiếu gắn kết gia đình.",
      "executive_function_scaffolding": "Giao nhiệm vụ cơ học có số lượng rõ ràng: Đếm đủ số người và xếp tương ứng số bát đũa.",
      "visual_or_concrete_aid": "Hoạt ảnh từng đôi đũa đặt ngay ngắn cạnh từng chiếc bát."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Lau mặt bàn ăn",
        "action_verb": "Lau_bàn",
        "atomic_instruction": "Lấy khăn ẩm lau một lượt mặt bàn ăn cho sạch bụi bẩn.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Lau mặt bàn thật sạch trước khi xếp bát nhé con!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Xếp bát đũa đủ người",
        "action_verb": "Xếp_bát",
        "atomic_instruction": "Xếp bát và đũa thìa ngay ngắn vào từng vị trí bàn ăn cho cả nhà.",
        "ui_type": "single_choice",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Xếp bát đũa thật ngay ngắn, đũa đặt bên tay phải của bát nhé con!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng bàn ăn ấm cúng",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh bàn ăn đã xếp xong bát đũa tươm tất gửi Mẹ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Bàn ăn trông thật ấm cúng và sẵn sàng cho bữa tối!"
        ]
      }
    ]
  },
  "routine_clean_desk": {
    "id": "routine_clean_desk",
    "timeline_slot": "evening",
    "slot_time": "19:00",
    "title": "Dọn bàn học gọn gàng trong 5 phút",
    "cat": "routine",
    "catName": "Nề Nếp Góc Học Tập",
    "icon": "🧹",
    "island": "routine",
    "reward": 30,
    "target_photo_tag": "LEO_DESK_1915.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Mặt bàn bừa bộn nhiều sách vở, bút thước gây quá tải thị giác (Visual Clutter Paralysis).",
      "executive_function_scaffolding": "Phân loại hành động rõ ràng theo cụm đồ vật: Bút thước vào ống -> Rác vào sọt -> Sách vở xếp chồng -> Chụp bàn sạch.",
      "visual_or_concrete_aid": "Hoạt ảnh góc bàn sáng bóng không còn đồ vật vương vãi."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Thu gom bút thước",
        "action_verb": "Cắm_bút",
        "atomic_instruction": "Thu gom tất cả bút, thước rải rác trên bàn cắm gọn vào ống đựng bút.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Bút chì, bút bi, thước kẻ đều cắm vào đúng chuồng nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Gom rác vào sọt",
        "action_verb": "Gom_rác",
        "atomic_instruction": "Nhặt sạch các mẩu giấy nháp, rác vụn trên bàn bỏ vào sọt rác dưới gầm bàn.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Mặt bàn không còn cọng rác hay mẩu giấy vụn nào con nhé!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Xếp sách vở thành chồng",
        "action_verb": "Xếp_sách",
        "atomic_instruction": "Xếp các cuốn sách vở trên bàn thành một chồng ngay ngắn ở góc bàn.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Sách to ở dưới, sách nhỏ ở trên xếp thật thẳng hàng nào!"
        ]
      },
      {
        "step_id": 4,
        "badge": "Minh chứng bàn sáng bóng",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Chụp 1 tấm ảnh mặt bàn học đã sạch bóng, ngăn nắp để nhận trọn vẹn +30 sao ngay!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 10,
        "hints": [
          "Giơ máy chụp toàn cảnh mặt bàn sáng tinh tươm nào!"
        ]
      }
    ]
  },
  "routine_pack_schoolbag": {
    "id": "routine_pack_schoolbag",
    "timeline_slot": "evening",
    "slot_time": "20:30",
    "title": "Soát thời khóa biểu & Xếp sách vở ngày mai",
    "cat": "routine",
    "catName": "Nề Nếp Góc Học Tập & Gia Đình",
    "icon": "📚",
    "island": "routine",
    "reward": 25,
    "target_photo_tag": "LEO_BAG_2030.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Trẻ ADHD rất hay để quên sách vở hoặc bài tập về nhà ở nhà vì buổi sáng cuống cuồng mới xếp.",
      "executive_function_scaffolding": "Xếp cặp trước khi đi ngủ 1 tiếng (Evening Lock-in): Mở thời khóa biểu -> So khớp từng môn -> Kéo khóa cặp.",
      "visual_or_concrete_aid": "Hoạt ảnh từng cuốn sách nhảy vào cặp khi hoàn tất."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Xem thời khóa biểu ngày mai",
        "action_verb": "Xem_TKB",
        "atomic_instruction": "Mở bảng thời khóa biểu trên tường và đọc to các môn học của ngày mai.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Ngày mai có những môn gì nhỉ? Toán, Tiếng Việt hay Mỹ thuật?"
        ]
      },
      {
        "step_id": 2,
        "badge": "Xếp sách vở & Hộp bút vào cặp",
        "action_verb": "Xếp_sách",
        "atomic_instruction": "Lấy đủ sách vở và hộp bút đã gọt sẵn bút chì bỏ vào ngăn cặp.",
        "ui_type": "single_choice",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 10,
        "hints": [
          "Kiểm tra xem bút chì đã gọt nhọn và có thước kẻ chưa nhé!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng cặp đã sẵn sàng",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Kéo khóa cặp lại và chụp 1 tấm ảnh chiếc cặp đã sẵn sàng cho ngày mai!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Cặp sách đã gọn gàng, ngày mai đi học thật thảnh thơi!"
        ]
      }
    ]
  },
  "routine_night_teeth": {
    "id": "routine_night_teeth",
    "timeline_slot": "night",
    "slot_time": "21:00",
    "title": "Đánh răng thơm tho & Thở 4-4-4 đi ngủ",
    "cat": "routine",
    "catName": "Thói Quen Trước Giờ Ngủ",
    "icon": "🦷",
    "island": "routine",
    "reward": 25,
    "target_photo_tag": "LEO_TEETH_2100.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Buổi tối năng lượng điều hành cạn kiệt, trẻ hay trì hoãn việc đánh răng.",
      "executive_function_scaffolding": "Tạo niềm vui trước gương: Chụp ảnh nụ cười bọt trắng thơm tho kết hợp thở 4-4-4 hạ nhiệt.",
      "visual_or_concrete_aid": "Milo cùng bé cười tươi trước gương và thở 4-4-4."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Lấy kem hạt đậu & Chải răng",
        "action_verb": "Chải_răng",
        "atomic_instruction": "Bóp lượng kem bằng hạt đậu và chải đều các mặt răng trong 2 phút.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Chải nhẹ nhàng xoay tròn cả hàm trên và hàm dưới nhé!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Minh chứng răng thơm trước gương",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Soi gương cười thật tươi chụp 1 tấm ảnh khoe hàm răng sạch bóng thơm tho trước khi đi ngủ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Nụ cười rạng rỡ và hàm răng trắng bóng sạch bọt nào!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Thở 4-4-4 cùng Milo",
        "action_verb": "Thở_ngủ",
        "atomic_instruction": "Lên giường trùm chăn ấm, hít thở 4-4-4 cùng Milo chuẩn bị chìm vào giấc ngủ ngon lành.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Hít sâu 4 giây... giữ 4 giây... thở ra 4 giây... chúc Leo ngủ ngon!"
        ]
      }
    ]
  },
  "routine_bedtime_screen_off": {
    "id": "routine_bedtime_screen_off",
    "timeline_slot": "night",
    "slot_time": "21:20",
    "title": "Tắt màn hình (Digital Sunset) & Đọc truyện 5 phút",
    "cat": "routine",
    "catName": "Thói Quen Trước Giờ Ngủ",
    "icon": "📖",
    "island": "routine",
    "reward": 20,
    "target_photo_tag": "LEO_SCREEN_OFF_2120.JPG",
    "adhd_scaffolding_notes": {
      "working_memory_pitfall": "Ánh sáng xanh từ điện thoại ức chế Melatonin làm trẻ ADHD rất khó chìm vào giấc ngủ sâu.",
      "executive_function_scaffolding": "Nghi thức 'Mặt trời lặn kỹ thuật số' (Digital Sunset): Cất máy ra bàn mẹ -> Đọc 3 trang sách giấy thư giãn não bộ.",
      "visual_or_concrete_aid": "Hoạt ảnh chú gấu Milo gập sách lại, tắt đèn phòng và ngáp ngủ."
    },
    "steps": [
      {
        "step_id": 1,
        "badge": "Cất điện thoại ra bàn",
        "action_verb": "Cất_máy",
        "atomic_instruction": "Tắt màn hình máy tính bảng/điện thoại và mang ra đặt trên bàn của bố mẹ.",
        "ui_type": "checkbox",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 5,
        "hints": [
          "Để máy nghỉ ngơi để mắt con được thư giãn nào!"
        ]
      },
      {
        "step_id": 2,
        "badge": "Đọc 3 trang sách giấy",
        "action_verb": "Đọc_sách",
        "atomic_instruction": "Nằm trên giường và đọc một vài trang sách truyện yêu thích để thư giãn não bộ.",
        "ui_type": "single_choice",
        "is_milestone": false,
        "requires_parent_check": false,
        "duration_sec": 60,
        "dopamine_points": 5,
        "hints": [
          "Những trang sách êm dịu sẽ đưa con vào giấc mơ đẹp!"
        ]
      },
      {
        "step_id": 3,
        "badge": "Minh chứng sách gập ngủ ngon",
        "action_verb": "Chụp_ảnh",
        "atomic_instruction": "Gập sách lại đặt đầu giường và chụp 1 tấm ảnh trước khi tắt đèn ngủ!",
        "ui_type": "photo_proof",
        "is_milestone": true,
        "requires_parent_check": false,
        "duration_sec": 45,
        "dopamine_points": 10,
        "hints": [
          "Chúc Leo ngủ một giấc thật ngon và mơ những giấc mơ đẹp!"
        ]
      }
    ]
  }
};

if (typeof window.taskDatabase !== 'undefined') {
  Object.assign(window.taskDatabase, window.routineDatabase);
}
