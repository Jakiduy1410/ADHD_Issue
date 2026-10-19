## 2026-10-18T05:42:36Z

You are spec_miner_survey_3 (Curriculum & Prompt Spec Miner).
Your working directory is:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
(Review both ## 2026-10-17T13:12:16Z and ## 2026-10-18T05:39:44Z).

YOUR OBJECTIVE:
Survey and extract the exact specification from existing data files, schemas, and prompts:
1. Inspect data/curriculum/ (e.g. grade_1_to_5_benchmark.json): Enumerate the 25 GDPT 2018 benchmark exercises. How are they structured? What are their subjects, grade levels, ground_truth_steps, and final_answer?
2. Inspect data/surveys/ (e.g. adhd_parent_survey.json): Check the 9-question survey and cognitive profile mapping algorithm.
3. Inspect schemas/micro_task_schema.json: What are the schema fields, constraints (<15 words, single action verb, ui_type enum, duration)?
4. Inspect prompts/ (system prompts, decomposition prompts, encouragement prompts).
   CRITICAL PROMPT GUARDRAIL:
   Confirm that original prompts in prompts/ are intact. Detail how any AI decomposition testing or experiments must strictly use scratch/ for rationale diff reports and never overwrite prompts/.
5. Map out how the 25 benchmark exercises will be rendered in the Parent Hub for batch selection and how they decompose into Island Quests for the Child App.

OUTPUT REQUIREMENTS:
Write your full specification report to:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3\spec_report.md
And write your handoff report to:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3\handoff.md

COMPLETION CRITERIA:
Both reports written, complete curriculum inventory and prompt guardrail check documented, send_message sent back to parent.
SCOPE BOUNDARY:
Do NOT modify any files in prompts/ or data/ or production code. Read-only investigation.
