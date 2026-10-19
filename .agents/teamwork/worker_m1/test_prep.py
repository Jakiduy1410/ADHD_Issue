import json

with open('.agents/teamwork/explorer_m1_2/ingested_task_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

js_str = 'const taskDatabase = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\ntaskDatabase["math_garden"] = taskDatabase["G1_MATH_01"];\n'
print("Length:", len(js_str), "Lines:", js_str.count('\n'))
print("Tasks count:", len(data))
