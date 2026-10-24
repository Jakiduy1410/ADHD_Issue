import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'Chị Gió thì thầm' in l:
        for j in range(i - 10, min(i + 60, len(lines))):
            print(f'{j+1}: {lines[j].rstrip()}')
        break
