import json
import re

with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('const taskDatabase = {')
end = text.find('// Danh sách bài tập mặc định khi khởi tạo')
snippet = text[start:end]

lines = snippet.splitlines()
tasks = []
for line in lines:
    l = line.strip()
    if (l.startswith('"G') or l.startswith('"ROUTINE')) and l.endswith('": {') or l.endswith('": {'):
        k = l.split(':')[0].strip('" ')
        tasks.append(k)

print(f"Total tasks in JS: {len(tasks)}")
print("Sample tasks:", tasks)

# Let's check G3_MCQ_14 and G4_ENG_20 in JS
for task_id in ["G3_MCQ_14", "G4_ENG_20", "G4_VIET_18", "G4_MCQ_19"]:
    idx = text.find(f'"{task_id}":')
    if idx != -1:
        sub = text[idx:idx+1500]
        print(f"\n--- {task_id} preview ---")
        print(sub[:400])
