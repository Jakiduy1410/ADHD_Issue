# BRIEFING — 2026-10-18T05:49:00Z

## Mission
Survey and extract the exact specification from existing curriculum data, parent surveys, micro-task JSON schemas, and prompts. Establish prompt guardrails and map exercises to Parent Hub batch selection and Child App Island Quests.

## 🔒 My Identity
- Archetype: spec_miner
- Roles: Curriculum & Prompt Spec Miner
- Working directory: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\spec_miner_survey_3
- Original parent: f373a3a8-9bab-4128-a177-2c52ad25b640
- Milestone: M0 - System Specification & Architecture Mining

## 🔒 Key Constraints
- Read-only investigation: Do NOT modify any files in prompts/, data/, or production code.
- Strict prompt guardrails: Original prompts in prompts/ must remain 100% intact. Testing/experiments must strictly use scratch/ for rationale diff reports and never overwrite prompts/.
- Write only to workspace folder: .agents/teamwork/spec_miner_survey_3/
- Deliverables: spec_report.md, handoff.md, and send_message to parent f373a3a8-9bab-4128-a177-2c52ad25b640.

## Current Parent
- Conversation ID: f373a3a8-9bab-4128-a177-2c52ad25b640
- Updated: 2026-10-18T05:49:00Z

## Task Summary
- **What to build**: Comprehensive curriculum and prompt specification report for ADHD GDPT 2018 Dual-App system.
- **Success criteria**:
  1. Complete enumeration of all 25 GDPT 2018 benchmark exercises (structure, subjects, grades, ground_truth_steps, final_answer).
  2. Full survey specification (9 questions, scoring, cognitive profile mapping algorithm).
  3. Micro-task JSON schema specification (fields, constraints: <15 words, single action verb, ui_type enum, duration).
  4. Prompt system specification & guardrail verification (system, decomposition, encouragement; verify intact, document scratch/ diff policy).
  5. UI/UX mapping (Parent Hub batch selection and Child App Island Quest roadmap).
- **Interface contracts**: data/curriculum/grade_1_to_5_benchmark.json, data/surveys/adhd_parent_survey.json, schemas/micro_task_schema.json, prompts/*
- **Code layout**: .agents/teamwork/spec_miner_survey_3/

## Key Decisions Made
- Audited all 25 GDPT 2018 benchmark exercises: validated schema adherence, step counts (3-4), normalized final answers, and ADHD pitfall/scaffolding notes.
- Audited 9-question ADHD clinical survey and mapped scoring formulas in scoring_service.py (verified 22/22 unit tests passing).
- Documented Draft-07 micro_task_schema.json constraints: 60s-300s durations, atomic action verbs, <15 words instructions, 8 UI types, and FR1 dopamine reinforcers (<300ms).
- Verified strict prompt guardrails: confirmed 100% intact status of prompts/ files, validated that experimental testing was strictly confined to scratch/ and produced structured diff proposals.
- Mapped Parent Hub batch selection and Child App Island Quest adventure roadmap integration.
- Authored spec_report.md and handoff.md.

## Artifact Index
- .agents/teamwork/spec_miner_survey_3/DISPATCH.md — Dispatch assignment
- .agents/teamwork/spec_miner_survey_3/BRIEFING.md — Persistent context & identity
- .agents/teamwork/spec_miner_survey_3/progress.md — Execution heartbeat
- .agents/teamwork/spec_miner_survey_3/spec_report.md — Authoritative specification report
- .agents/teamwork/spec_miner_survey_3/handoff.md — 5-component handoff report
