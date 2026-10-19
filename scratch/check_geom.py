import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'Tính diện tích hình bình hành' in l or 'Tính chu vi mảnh đất hình chữ nhật' in l:
        for j in range(i - 5, min(i + 50, len(lines))):
            print(f'{j+1}: {lines[j].rstrip()}')
        print('='*50)
