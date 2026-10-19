import json
from pathlib import Path

b_path = Path("data/curriculum/grade_1_to_5_benchmark.json")
with open(b_path, encoding="utf-8") as f:
    benchmark_data = json.load(f)

benchmark_ids = [t["id"] for t in benchmark_data["exercises"]]

gen_content = Path("generate_app.py").read_text(encoding="utf-8")

missing = []
for tid in benchmark_ids:
    if f'"{tid}":' not in gen_content:
        missing.append(tid)

print(f"Total benchmark IDs: {len(benchmark_ids)}")
print(f"Missing IDs in generate_app.py: {missing}")
print(f"Found count: {len(benchmark_ids) - len(missing)}")

# Also check life routines
routines = ["chore_desk", "chore_morning", "break_water", "pack_backpack"]
missing_routines = [r for r in routines if f'"{r}":' not in gen_content]
print(f"Routines missing: {missing_routines}")
