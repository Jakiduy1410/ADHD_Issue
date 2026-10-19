## 2026-10-18T05:50:20Z
You are explorer_m1_2 (Curriculum Bank Integration Explorer).
Your working directory is:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_2

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\PROJECT.md
And reference spec report at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3\spec_report.md

YOUR OBJECTIVE FOR MILESTONE 1 (Sync Bus & Curriculum Bank):
Design the ingestion of the complete 25 GDPT 2018 benchmark tasks from `data/curriculum/grade_1_to_5_benchmark.json` into `taskDatabase` in `generate_app.py`:
1. Inspect `data/curriculum/grade_1_to_5_benchmark.json` (25 tasks across Grades 1-5, Math, Vietnamese, English, MCQ) and `generate_app.py`'s current `taskDatabase` (lines 1527-1762).
2. Map each benchmark task's `ground_truth_steps`, `final_answer`, `adhd_scaffolding_notes`, `grade`, and `subject` into the schema expected by the frontend (with `steps`, `atomic_instruction`, `action_verb`, `ui_type`, `ui_data`, `immediate_reinforcer`, `duration_sec`).
3. Retain the 4 practical daily routine tasks (gấp chăn, dọn bàn học, đánh răng, chuẩn bị sách vở) under subject `'hoat_dong_trai_nghiem'` / routine.
4. Provide the exact Python/JSON structure to replace or extend `taskDatabase` in `generate_app.py`. Do NOT modify source code directly.

OUTPUT REQUIREMENTS:
Write report to:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_2\exploration_report.md
And handoff to:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_2\handoff.md
Send send_message to parent upon completion.
