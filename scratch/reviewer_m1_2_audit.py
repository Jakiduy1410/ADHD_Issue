import json
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load curriculum benchmark
with open('data/curriculum/grade_1_to_5_benchmark.json', encoding='utf-8') as f:
    bench_data = json.load(f)

bench_tasks = {ex['id']: ex for ex in bench_data['exercises']}
print(f"Loaded {len(bench_tasks)} benchmark tasks from grade_1_to_5_benchmark.json")

# 2. Extract taskDatabase from index.html (or out_index.html)
with open('index.html', encoding='utf-8') as f:
    html_content = f.read()

# Also check out_index.html matching
with open('out_index.html', encoding='utf-8') as f:
    out_html_content = f.read()

print("index.html size:", len(html_content))
print("out_index.html size:", len(out_html_content))
print("index.html matches out_index.html:", html_content == out_html_content)

# Extract JavaScript code where taskDatabase is defined
task_db_match = re.search(r'const taskDatabase = (\{[\s\S]*?\n    \});', html_content)
if not task_db_match:
    print("ERROR: Could not find `const taskDatabase = { ... }` in index.html via regex!")
else:
    print("Found taskDatabase in index.html!")

# Let's extract task keys using regex from taskDatabase block
task_db_block = task_db_match.group(1) if task_db_match else ""

# Regex to find task definitions: 'TASK_KEY': { or "TASK_KEY": {
keys = re.findall(r"['\"]([A-Za-z0-9_]+)['\"]\s*:\s*\{", task_db_block)
# Filter top-level keys
print(f"Found {len(keys)} task-like keys in taskDatabase block")

