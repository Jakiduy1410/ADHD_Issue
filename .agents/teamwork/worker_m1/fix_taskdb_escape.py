import json

with open('generate_app.py', 'r', encoding='utf-8') as f:
    content = f.read()

with open('.agents/teamwork/explorer_m1_2/ingested_task_database.json', 'r', encoding='utf-8') as f:
    tasks_data = json.load(f)

json_str = json.dumps(tasks_data, ensure_ascii=False, indent=6)
escaped_json = json_str.replace('\\', '\\\\')

replacement = "const taskDatabase = " + escaped_json + ";\n    taskDatabase['math_garden'] = taskDatabase['G1_MATH_01']; // backwards compatibility alias"

start_needle = "    const taskDatabase = {"
end_needle = "taskDatabase['math_garden'] = taskDatabase['G1_MATH_01']; // backwards compatibility alias"

start_idx = content.find(start_needle)
assert start_idx != -1, "start_needle not found"

end_idx = content.find(end_needle, start_idx)
assert end_idx != -1, "end_needle not found"
end_idx += len(end_needle)

content = content[:start_idx] + replacement + content[end_idx:]

with open('generate_app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced taskDatabase with escaped JSON!")
