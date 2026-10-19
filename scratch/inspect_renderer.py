import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Look for where 'BƯỚC' is rendered or 'DÒ TÌM TỪ KHÓA' or 'step_id'
for m in re.finditer(r'step-container|single-focus-card|render.*Step|activeTask', text):
    pos = m.start()
    line_start = text.rfind('\n', 0, pos)
    line_end = text.find('\n', pos)
    line = text[line_start:line_end].strip()
    if 'function ' in line:
        print(line)
