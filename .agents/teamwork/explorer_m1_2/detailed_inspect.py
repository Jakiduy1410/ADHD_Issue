import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("data/curriculum/grade_1_to_5_benchmark.json", encoding="utf-8") as f:
    data = json.load(f)

for idx, e in enumerate(data["exercises"], 1):
    print(f"=== #{idx:02d}: {e['id']} (Grade {e['grade']}, {e['subject']}) ===")
    print(f"Topic: {e['topic']}")
    print(f"Category: {e['category']} | Difficulty: {e['difficulty']} | Est: {e['estimated_duration_min']}m")
    print(f"Text: {e['original_text'][:100]}...")
    if e.get("options"):
        print(f"Options: {e['options']}")
    print(f"Final Answer: {e['final_answer']['normalized_display']}")
    print(f"Pitfall: {e['adhd_scaffolding_notes']['working_memory_pitfall']}")
    print(f"Visual aid: {e['adhd_scaffolding_notes']['visual_or_concrete_aid']}")
    print("Steps:")
    for s in e["ground_truth_steps"]:
        print(f"  Step {s['step_number']}: {s['instruction']} -> Output: {s['intermediate_output']}")
    print()
