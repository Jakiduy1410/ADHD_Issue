import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update G4_ENG_01
old_g4_eng = '''      "G4_ENG_01": {
            "id": "G4_ENG_01",
            "grade": 4,
            "subject": "Tiếng Anh",
            "cat": "eng",
            "catName": "Tiếng Anh Tiểu Học",
            "icon": "🥞",
            "title": "English Reading: Hoạt động của mẹ Peter trong bếp",
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,
            "original_text": "Read the passage:\\n'It is Sunday morning. Peter's family is at home. His father is washing the car in the garage. His mother is making pancakes in the kitchen. Peter and his sister, Linda, are playing board games in the living room.'\\nQuestion: Where is Peter's mother and what is she doing?\\nA. In the garage, washing the car.\\nB. In the kitchen, making pancakes.\\nC. In the living room, playing board games.\\nD. In the bedroom, reading a book.",'''

new_g4_eng = '''      "G4_ENG_01": {
            "id": "G4_ENG_01",
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
            "original_text": "Question: Where is Peter's mother and what is she doing?",'''

if old_g4_eng in code:
    code = code.replace(old_g4_eng, new_g4_eng)
    print("1. Updated G4_ENG_01 metadata and reading_passage")
else:
    print("Warning: old_g4_eng not found exactly")

# Update G4_ENG_01 step 2 to have reading_excerpt
old_eng_step2 = '''                        "text": "Dò câu có cụm making pancakes in the kitchen.",
                        "type": "highlight",
                        "ui_type": "highlight",
                        "ui_data": {
                              "prompt_text": "Tìm câu miêu tả mẹ của Peter:",
                              "highlight_target_segments": [
                                    "His mother is making pancakes in the kitchen."
                              ]
                        },'''

new_eng_step2 = '''                        "text": "Dò câu có cụm making pancakes in the kitchen.",
                        "type": "highlight",
                        "ui_type": "highlight",
                        "ui_data": {
                              "prompt_text": "Tìm hành động của mẹ Peter trong câu:",
                              "reading_excerpt": "His mother is making pancakes in the kitchen.",
                              "highlight_target_segments": [
                                    "making pancakes in the kitchen"
                              ]
                        },'''

if old_eng_step2 in code:
    code = code.replace(old_eng_step2, new_eng_step2)
    print("2. Updated G4_ENG_01 step 2 with reading_excerpt")
else:
    print("Warning: old_eng_step2 not found exactly")

# 2. Update G4_VIET_18
old_g4_viet = '''      "G4_VIET_18": {
            "id": "G4_VIET_18",
            "grade": 4,
            "subject": "Tiếng Việt",
            "cat": "viet",
            "catName": "Tiếng Việt GDPT",
            "icon": "🌾",
            "title": "Đọc hiểu: Biện pháp nhân hóa Chị Gió thì thầm",
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,
            "original_text": "Đọc đoạn văn sau:\\n'Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non. Những bông lúa bẽn lẽn nghiêng đầu chào đón chị, rộn rã rì rào ca hát dưới nắng sớm.'\\nCâu hỏi: Trong đoạn văn trên, chị Gió được gán cho những hành động giống như con người qua các từ ngữ nào?",'''

new_g4_viet = '''      "G4_VIET_18": {
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
            "original_text": "Câu hỏi: Chị Gió được gán cho những từ ngữ hành động nào?",'''

if old_g4_viet in code:
    code = code.replace(old_g4_viet, new_g4_viet)
    print("3. Updated G4_VIET_18 metadata and reading_passage")
else:
    print("Warning: old_g4_viet not found exactly")

# Update G4_VIET_18 step 2 to have reading_excerpt
old_viet_step2 = '''                        "text": "Gạch chân từ thì thầm trong câu thứ nhất.",
                        "type": "highlight",
                        "ui_type": "highlight",
                        "ui_data": {
                              "prompt_text": "Tìm hành động giống con người của chị Gió trong câu 1:",
                              "highlight_target_segments": [
                                    "thì thầm"
                              ]
                        },'''

new_viet_step2 = '''                        "text": "Gạch chân từ thì thầm trong câu thứ nhất.",
                        "type": "highlight",
                        "ui_type": "highlight",
                        "ui_data": {
                              "prompt_text": "Tìm hành động giống con người của chị Gió trong câu 1:",
                              "reading_excerpt": "Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non.",
                              "highlight_target_segments": [
                                    "thì thầm"
                              ]
                        },'''

if old_viet_step2 in code:
    code = code.replace(old_viet_step2, new_viet_step2)
    print("4. Updated G4_VIET_18 step 2 with reading_excerpt")
else:
    print("Warning: old_viet_step2 not found exactly")

# 3. Add geometry_spec to G3_MATH_09 and G4_MATH_14
old_g3_math = '''      "G3_MATH_09": {
            "id": "G3_MATH_09",
            "grade": 3,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "📐",
            "title": "Tính chu vi mảnh đất hình chữ nhật (15m và 8m)",
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,'''

new_g3_math = '''      "G3_MATH_09": {
            "id": "G3_MATH_09",
            "grade": 3,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "📐",
            "title": "Tính chu vi mảnh đất hình chữ nhật (15m và 8m)",
            "exercise_type": "geometry",
            "geometry_spec": {
                  "shape_type": "rectangle",
                  "dimensions": { "length": "15 m", "width": "8 m" },
                  "target": "perimeter"
            },
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,'''

if old_g3_math in code:
    code = code.replace(old_g3_math, new_g3_math)
    print("5. Added geometry_spec to G3_MATH_09")
else:
    print("Warning: old_g3_math not found exactly")

old_g4_math = '''      "G4_MATH_14": {
            "id": "G4_MATH_14",
            "grade": 4,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "🔷",
            "title": "Tính diện tích hình bình hành (Đáy 24m, chiều cao 15m)",
            "island": "study",
            "reward": 140,
            "stepSeconds": 85,'''

new_g4_math = '''      "G4_MATH_14": {
            "id": "G4_MATH_14",
            "grade": 4,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "🔷",
            "title": "Tính diện tích hình bình hành (Đáy 24m, chiều cao 15m)",
            "exercise_type": "geometry",
            "geometry_spec": {
                  "shape_type": "parallelogram",
                  "dimensions": { "base": "24 m", "height": "15 m" },
                  "target": "area"
            },
            "island": "study",
            "reward": 140,
            "stepSeconds": 85,'''

if old_g4_math in code:
    code = code.replace(old_g4_math, new_g4_math)
    print("6. Added geometry_spec to G4_MATH_14")
else:
    print("Warning: old_g4_math not found exactly")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Batch 4 completed.")
