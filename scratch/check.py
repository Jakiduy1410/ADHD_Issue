import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'G3_VIET_13' in l:
        for j in range(i, min(i + 50, len(lines))):
            print(f'{j+1}: {lines[j].rstrip()}')
        break
