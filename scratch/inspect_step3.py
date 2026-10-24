import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function renderChildWorkspaceStep')
print(text[pos+6500:pos+11000])
