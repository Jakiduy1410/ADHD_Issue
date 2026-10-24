with open('app/js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if 'tokens = tokenizeSentenceForHighlight' in line or 'const tokens =' in line or 'let tokens =' in line:
        print(f"Line {i}: {line.strip()}")
