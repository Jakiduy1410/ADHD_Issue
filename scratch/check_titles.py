import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'"title":\s*"([^"]+)"', text)
for m in set(matches):
    print(m)
