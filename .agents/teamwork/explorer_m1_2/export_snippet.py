"""
Append to build_curriculum_bank.py: Generate task_database_snippet.js
"""

import json

with open(".agents/teamwork/explorer_m1_2/ingested_task_database.json", "r", encoding="utf-8") as f:
    task_database = json.load(f)

# Format as JavaScript code
js_lines = ["    const taskDatabase = {"]

task_keys = list(task_database.keys())
for idx, key in enumerate(task_keys):
    task = task_database[key]
    is_last_task = (idx == len(task_keys) - 1)
    
    # Header comment
    js_lines.append(f"      // #{idx+1:02d}. {task['subject']} (Grade {task['grade']}): {task['title']}")
    js_lines.append(f"      '{key}': " + json.dumps(task, ensure_ascii=False, indent=8)[8:] + ("," if not is_last_task else ""))
    js_lines.append("")

# Also add backward-compatibility alias for math_garden
js_lines.append("      // Backward Compatibility Alias:")
js_lines.append("      'math_garden': null // Linked dynamically below")
js_lines.append("    };")
js_lines.append("    taskDatabase['math_garden'] = taskDatabase['G1_MATH_01']; // Alias for legacy references")

js_content = "\n".join(js_lines)

with open(".agents/teamwork/explorer_m1_2/task_database_snippet.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated task_database_snippet.js ({len(js_content)} chars)")
