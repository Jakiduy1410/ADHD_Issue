with open('app/js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if '"G3_MCQ_14":' in line:
        print(f"G3_MCQ_14 is at Line {i}")
        break
