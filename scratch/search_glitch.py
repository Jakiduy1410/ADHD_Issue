import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'cất tiếng gáy vang', text)]
print(f"Found {len(matches)} matches for 'cất tiếng gáy vang'")
for pos in matches:
    print("\n--- SNIPPET ---")
    print(text[max(0, pos-200):min(len(text), pos+600)])

matches2 = [m.start() for m in re.finditer(r'Đề bài yêu cầu đếm loại hình học nào', text)]
print(f"\nFound {len(matches2)} matches for 'Đề bài yêu cầu đếm loại hình học nào'")
for pos in matches2:
    print("\n--- SNIPPET 2 ---")
    print(text[max(0, pos-200):min(len(text), pos+600)])
