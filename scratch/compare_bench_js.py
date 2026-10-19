import json

with open('data/curriculum/grade_1_to_5_benchmark.json', 'r', encoding='utf-8') as f:
    bench = json.load(f)

bench_map = {ex['id']: ex for ex in bench['exercises']}

# Check G3_MCQ_14 in bench vs app.js
with open('app/js/app.js', 'r', encoding='utf-8') as f:
    js_text = f.read()

report = []
for tid in ["G3_MCQ_14", "G4_MCQ_19", "G4_ENG_20", "G4_VIET_18"]:
    bench_ex = bench_map.get(tid, {})
    report.append(f"=== {tid} in Benchmark JSON ===")
    report.append(f"original_text: {bench_ex.get('original_text')}")
    report.append(f"Has geometry_spec in JSON: {'geometry_spec' in bench_ex}")
    report.append(f"Has reading_passage in JSON: {'reading_passage' in bench_ex}")
    
    # In JS:
    idx = js_text.find(f'"{tid}":')
    if idx != -1:
        sub = js_text[idx:idx+2500]
        has_geom = '"geometry_spec"' in sub
        has_read = '"reading_passage"' in sub
        report.append(f"In JS: has geometry_spec = {has_geom}, has reading_passage = {has_read}")

with open('scratch/report.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(report))
print("Wrote scratch/report.txt successfully")
