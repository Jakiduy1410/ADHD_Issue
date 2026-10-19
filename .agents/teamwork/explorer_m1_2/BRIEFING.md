# BRIEFING — 2026-10-18T06:01:00Z

## Mission
Design the ingestion of the complete 25 GDPT 2018 benchmark tasks from `data/curriculum/grade_1_to_5_benchmark.json` into `taskDatabase` in `generate_app.py`, mapping curriculum fields to frontend scaffolded step schema, retaining the 4 daily routine tasks, and providing exact replacement data structures.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, synthesizer
- Working directory: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_2
- Original parent: f373a3a8-9bab-4128-a177-2c52ad25b640
- Milestone: Milestone 1 (Sync Bus & Curriculum Bank)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code directly
- Map all 25 benchmark tasks across Grades 1-5 (Math, Vietnamese, English, MCQ)
- Retain the 4 practical daily routine tasks under 'hoat_dong_trai_nghiem' / routine
- Schema must match frontend expectations (steps, atomic_instruction, action_verb, ui_type, ui_data, immediate_reinforcer, duration_sec, etc.)
- Provide exact Python/JSON structure ready for implementer

## Current Parent
- Conversation ID: f373a3a8-9bab-4128-a177-2c52ad25b640
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `data/curriculum/grade_1_to_5_benchmark.json` (all 25 benchmark tasks)
  - `generate_app.py` lines 1030-1034, 1527-1762, 1774-1796, 2130-2288, 2688-2780
  - `schemas/micro_task_schema.json` (Draft-07 constraints, 8 UI types, FR1 reinforcers)
  - `src/api/server.py` lines 64-355 (pre-decomposed routines)
- **Key findings**:
  - 25 benchmark tasks + 4 routine chores = 29 standardized tasks (94 micro-steps total).
  - 100% of instructions are < 15 words (average 8.2 words).
  - 100% of action verbs match regex `^[a-zA-ZÀ-ỹ_]+$` with zero spaces.
  - Full bidirectional compatibility between Draft-07 schema and frontend `generate_app.py` requirements.
  - Backward compatibility alias for `math_garden` mapped to `G1_MATH_01`.
- **Unexplored areas**: None for Milestone 1 Curriculum Bank.

## Key Decisions Made
- Category assignment: 15 Math, 5 Vietnamese, 5 English, 4 Chores. G1_MCQ_04 (TNXH Geometry counting) mapped to `cat: 'math'` with `catName: 'TNXH & Hình Học'` to match existing 4 tabs.
- Backward compatibility: Retained `chore_desk`, `chore_teeth`, `chore_backpack`, `chore_bed` keys; added alias `math_garden` pointing to `G1_MATH_01`.
- Dual step fields: Attached both `s.text` and `s.atomic_instruction` as well as `s.type` and `s.ui_type` to guarantee zero frontend render regression.

## Artifact Index
- `.agents/teamwork/explorer_m1_2/DISPATCH.md` — Incoming dispatch log
- `.agents/teamwork/explorer_m1_2/progress.md` — Liveness and step tracking
- `.agents/teamwork/explorer_m1_2/exploration_report.md` — Full curriculum mapping report
- `.agents/teamwork/explorer_m1_2/handoff.md` — 5-component handoff report
- `.agents/teamwork/explorer_m1_2/ingested_task_database.json` — 29-task complete JSON dataset
- `.agents/teamwork/explorer_m1_2/task_database_snippet.js` — 200 KB JavaScript code ready for `generate_app.py`
- `.agents/teamwork/explorer_m1_2/build_curriculum_bank.py` — Python builder & validator
- `.agents/teamwork/explorer_m1_2/export_snippet.py` — Snippet exporter
