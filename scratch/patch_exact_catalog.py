import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. G4_ENG_20
old_g4_eng_20 = '''      "G4_ENG_20": {
            "id": "G4_ENG_20",
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

new_g4_eng_20 = '''      "G4_ENG_20": {
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
            "original_text": "Question: Where is Peter's mother and what is she doing?",'''

if old_g4_eng_20 in code:
    code = code.replace(old_g4_eng_20, new_g4_eng_20)
    print("1. Replaced G4_ENG_20 metadata with reading_passage")
else:
    print("Warning: old_g4_eng_20 not found")

# 2. G3_MCQ_14
old_g3_mcq = '''      "G3_MCQ_14": {
            "id": "G3_MCQ_14",
            "grade": 3,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "📐",
            "title": "Tính chu vi mảnh đất hình chữ nhật (15m và 8m)",
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,'''

new_g3_mcq = '''      "G3_MCQ_14": {
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
                  "dimensions": { "length": "15 m", "width": "8 m" },
                  "target": "perimeter"
            },
            "island": "study",
            "reward": 130,
            "stepSeconds": 80,'''

if old_g3_mcq in code:
    code = code.replace(old_g3_mcq, new_g3_mcq)
    print("2. Replaced G3_MCQ_14 metadata with geometry_spec")
else:
    print("Warning: old_g3_mcq not found")

# 3. G4_MCQ_19
old_g4_mcq = '''      "G4_MCQ_19": {
            "id": "G4_MCQ_19",
            "grade": 4,
            "subject": "Toán",
            "cat": "math",
            "catName": "Toán GDPT 2018",
            "icon": "🔷",
            "title": "Tính diện tích hình bình hành (Đáy 24m, chiều cao 15m)",
            "island": "study",
            "reward": 140,
            "stepSeconds": 85,'''

new_g4_mcq = '''      "G4_MCQ_19": {
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
                  "dimensions": { "base": "24 m", "height": "15 m" },
                  "target": "area"
            },
            "island": "study",
            "reward": 140,
            "stepSeconds": 85,'''

if old_g4_mcq in code:
    code = code.replace(old_g4_mcq, new_g4_mcq)
    print("3. Replaced G4_MCQ_19 metadata with geometry_spec")
else:
    print("Warning: old_g4_mcq not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Catalog patching completed.")
