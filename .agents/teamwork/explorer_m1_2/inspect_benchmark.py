import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("data/curriculum/grade_1_to_5_benchmark.json", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total exercises: {len(data['exercises'])}")
for idx, e in enumerate(data["exercises"], 1):
    options_summary = list(e["options"].keys()) if e.get("options") else "None"
    print(f"#{idx:02d} ID: {e['id']:<12} | G{e['grade']} | {e['subject']:<20} | {e['category']:<25} | Steps: {len(e['ground_truth_steps'])} | Options: {options_summary} | Ans: {e['final_answer']['normalized_display']}")
