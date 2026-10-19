import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("data/curriculum/grade_1_to_5_benchmark.json", encoding="utf-8") as f:
    data = json.load(f)

for idx in range(10, 20):
    e = data["exercises"][idx]
    print(f"=== #{idx+1:02d}: {e['id']} (Grade {e['grade']}, {e['subject']}) ===")
    print(f"Topic: {e['topic']}")
    print(f"Text: {e['original_text'][:90]}...")
    if e.get("options"):
        print(f"Options: {e['options']}")
    print(f"Final Answer: {e['final_answer']['normalized_display']}")
    print("Steps:")
    for s in e["ground_truth_steps"]:
        print(f"  Step {s['step_number']}: {s['instruction']} -> {s['intermediate_output']}")
    print()
