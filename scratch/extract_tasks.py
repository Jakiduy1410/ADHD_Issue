import json
import re

with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate taskDatabase
start_marker = 'const taskDatabase = {'
start_pos = text.find(start_marker)
if start_pos == -1:
    raise ValueError("taskDatabase not found in app.js")

# Find the end of taskDatabase by counting braces
brace_count = 0
start_brace = text.find('{', start_pos)
end_pos = -1

for idx in range(start_brace, len(text)):
    char = text[idx]
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            end_pos = idx + 1
            break

js_obj_str = text[start_brace:end_pos]
print(f"Extracted taskDatabase substring length: {len(js_obj_str)}")

# Use node.js to safely parse the JavaScript object to JSON
import subprocess
node_script = f"""
const fs = require('fs');
const obj = {js_obj_str};
fs.writeFileSync('data/curriculum/tasks_db.json', JSON.stringify(obj, null, 2), 'utf-8');
console.log('Successfully saved to data/curriculum/tasks_db.json. Keys count:', Object.keys(obj).length);
"""

with open('scratch/export_tasks.js', 'w', encoding='utf-8') as f:
    f.write(node_script)

res = subprocess.run(['node', 'scratch/export_tasks.js'], capture_output=True, text=True, encoding='utf-8')
print("Node export stdout:", res.stdout)
print("Node export stderr:", res.stderr)
