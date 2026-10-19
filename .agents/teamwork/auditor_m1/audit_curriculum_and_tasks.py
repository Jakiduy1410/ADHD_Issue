import json
import re
import sys

def audit():
    sys.stdout.reconfigure(encoding='utf-8')
    benchmark_path = r"c:\Users\ADMIN\Documents\antigravity\calm-bardeen\data\curriculum\grade_1_to_5_benchmark.json"
    generate_app_path = r"c:\Users\ADMIN\Documents\antigravity\calm-bardeen\generate_app.py"

    print("=== AUDITING BENCHMARK JSON ===")
    with open(benchmark_path, "r", encoding="utf-8") as f:
        bm = json.load(f)

    exercises = bm.get("exercises", [])
    print(f"Total benchmark exercises: {len(exercises)}")
    assert len(exercises) == 25, f"Expected 25 exercises, got {len(exercises)}"

    grades = {}
    subjects = {}
    for idx, ex in enumerate(exercises):
        eid = ex.get("id")
        grade = ex.get("grade")
        subject = ex.get("subject")
        text = ex.get("original_text", "")
        gt_steps = ex.get("ground_truth_steps", [])
        final_ans = ex.get("final_answer", {})

        grades[grade] = grades.get(grade, 0) + 1
        subjects[subject] = subjects.get(subject, 0) + 1

        # Check for placeholder texts
        for dummy in ["lorem", "dummy", "placeholder", "todo", "sample text"]:
            if dummy in text.lower():
                print(f"VIOLATION: Dummy text found in {eid}: {text}")
                return False

        if not gt_steps or len(gt_steps) == 0:
            print(f"VIOLATION: No ground truth steps in {eid}")
            return False

        for st in gt_steps:
            if not st.get("instruction") or len(st.get("instruction").strip()) == 0:
                print(f"VIOLATION: Empty instruction in {eid}")
                return False

        if not final_ans or "value" not in final_ans:
            print(f"VIOLATION: Missing final answer in {eid}")
            return False

    print(f"Grade distribution: {grades}")
    print(f"Subject distribution: {subjects}")

    print("\n=== AUDITING taskDatabase IN generate_app.py ===")
    with open(generate_app_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract taskDatabase JSON/object
    start_marker = "const taskDatabase = "
    end_marker = "};\n    taskDatabase['math_garden']"
    if start_marker not in content:
        print("VIOLATION: const taskDatabase not found in generate_app.py")
        return False

    sub = content[content.find(start_marker) + len(start_marker):]
    sub = sub[:sub.find(end_marker) + 1].strip()

    try:
        tasks = json.loads(sub)
    except Exception as e:
        print(f"ERROR parsing taskDatabase JSON: {e}")
        return False

    print(f"Parsed taskDatabase entries: {len(tasks)}")
    
    # Audit all 25 benchmark tasks in taskDatabase
    verb_regex = re.compile(r"^[a-zA-ZÀ-ỹ_]+$")
    bm_ids = [ex["id"] for ex in exercises]
    
    missing_in_app = []
    for bid in bm_ids:
        if bid not in tasks:
            missing_in_app.append(bid)
    
    if missing_in_app:
        print(f"VIOLATION: Missing benchmark tasks in taskDatabase: {missing_in_app}")
        return False
    else:
        print(f"ALL 25 benchmark tasks present in taskDatabase!")

    # Check routines
    routines = [k for k in tasks if k.startswith("chore_") or k.startswith("routine_")]
    print(f"Practical life routines in taskDatabase: {len(routines)} ({routines})")

    # Deep check on each task
    total_steps = 0
    violations = []
    bm_violations = []
    routine_violations = []

    for tid, tdata in tasks.items():
        is_bm = tid in bm_ids
        target_list = bm_violations if is_bm else routine_violations
        steps = tdata.get("steps", [])
        total_steps += len(steps)
        if len(steps) == 0:
            target_list.append(f"{tid}: empty steps")
        for sidx, step in enumerate(steps):
            verb = step.get("action_verb", "")
            if not verb_regex.match(verb):
                target_list.append(f"{tid} step {sidx+1}: invalid action_verb '{verb}'")
            inst = step.get("atomic_instruction") or step.get("instruction") or step.get("text", "")
            words = inst.split()
            if len(words) >= 15:
                # check if < 15 words
                target_list.append(f"{tid} step {sidx+1}: instruction >= 15 words ({len(words)} words): '{inst}'")
            dur = step.get("duration_sec") or step.get("duration") or tdata.get("stepSeconds", 0)
            if dur < 60 or dur > 300:
                target_list.append(f"{tid} step {sidx+1}: duration {dur} out of bounds (60-300)")
            ui_type = step.get("ui_type") or step.get("type")
            if not ui_type:
                target_list.append(f"{tid} step {sidx+1}: missing ui_type")
            
            # Check for dummy placeholders
            for dummy in ["placeholder", "lorem", "todo", "xxx", "foo", "bar"]:
                if dummy in inst.lower():
                    target_list.append(f"{tid} step {sidx+1}: dummy placeholder found: {inst}")

    print(f"Total steps audited: {total_steps}")
    print(f"GDPT 2018 Benchmark (25 tasks) violations: {len(bm_violations)}")
    if bm_violations:
        for v in bm_violations:
            print(f" - {v}")
    else:
        print(">>> 100% of 25 GDPT 2018 benchmark tasks are COMPLETELY CLEAN and compliant!")

    print(f"\nPractical Life Routines (4 routines) notes: {len(routine_violations)}")
    for v in routine_violations:
        print(f" - {v}")

    return len(bm_violations) == 0

if __name__ == "__main__":
    success = audit()
    sys.exit(0 if success else 1)
