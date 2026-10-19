## 2026-10-17T13:24:36Z
You are Survey Implementation Worker (Milestone M1).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1\
The authoritative user request is located at: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md and c:\Users\ADMIN\Documents\antigravity\calm-bardeen\PROJECT.md before starting work.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You exclusively own: `data/surveys/adhd_parent_survey.json` and any utility code in `src/adhd_scoring/`.
You must NOT modify files owned by other workers.

Your task:
1. Review Explorer 1's findings at:
   - `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_1\handoff.md`
   - `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_1\reference_adhd_parent_survey.json`
   - `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_1\scoring_engine.py`
2. Implement and deploy `data/surveys/adhd_parent_survey.json`:
   - Exact 9 questions covering Executive Function (q1-q3), Attention Span (q4-q6), Rejection Sensitive Dysphoria (q7-q9).
   - 4-level Likert scale (0: Never, 1: Occasionally, 2: Often, 3: Very Often).
   - Clinical origins (Vanderbilt VADPRS, SNAP-IV, Barkley framework).
   - Exact scoring formulas and mapping algorithms transforming responses to continuous and categorical Cognitive Profile vectors (`attention_span_minutes` [5-25], `recommended_micro_task_duration_sec` [60-300], `working_memory_capacity` [1-5], `rsd_sensitivity_level`, `scaffolding_level`, `prompt_injection_directives`).
3. Deploy a production Python scoring module `src/adhd_scoring/scoring_service.py` that implements this scoring algorithm and vector conversion for downstream pipeline use.
4. Run verification tests with Python to confirm:
   - `data/surveys/adhd_parent_survey.json` is valid JSON and contains all 9 questions.
   - `scoring_service.py` passes all boundary test cases (All 0s, All 3s, mixed scores).
5. Document all commands and results in `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1\handoff.md`.
6. Send a message to orchestrator (`799fffd1-d215-47b1-9d09-7dfd1688ffaf`) when complete.
## 2026-10-18T06:02:17Z
You are worker_m1 (Sync Bus & Curriculum Implementer).
Your working directory is:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m1

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\PROJECT.md
And read the comprehensive blueprints prepared by the 3 M1 Explorers:
- c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_1\exploration_report.md (and handoff.md)
- c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_2\exploration_report.md (and task_database_snippet.js)
- c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_3\exploration_report.md (and handoff.md)

WRITE OWNERSHIP:
You have exclusive write ownership over:
- `generate_app.py`
- `index.html` and `out_index.html` (generated via `python generate_app.py`)
- Metadata/reports in your own directory `.agents/teamwork/worker_m1/`
STRICT PROMPT GUARDRAIL:
Do NOT edit or overwrite any files in `prompts/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR OBJECTIVE FOR MILESTONE 1 (Sync Bus & Curriculum Bank):
1. Ingest Full Curriculum Bank (25 GDPT 2018 tasks + 4 routines = 29 tasks):
   - Replace the incomplete `taskDatabase` in `generate_app.py` with the complete 29-task dictionary from `.agents/teamwork/explorer_m1_2/task_database_snippet.js`.
   - Update HTML category filter counts and ensure all 5 grades and subjects are rendered cleanly in Parent Hub.
2. Implement Tri-Layer `MiloSyncBus`:
   - Layer 1 (In-memory loopback for 0ms single-tab Dual mode).
   - Layer 2 (`BroadcastChannel('milo_quest_sync')` + `localStorage` storage-event fallback for <2ms cross-tab multi-window sync, plus persistent state hydration across page reloads for stars, childRoadmap, currentTaskIndex, activeStepIndex, pendingTicketRedemption).
   - Layer 3 (WebSocket auto-connect to `/ws/sync` with reconnect backoff and silent graceful degradation).
3. Wire the 10-Event State Protocol:
   - Handle all 10 events: `TASK_ASSIGN_BATCH`, `STEP_TELEMETRY_UPDATE`, `STEP_COMPLETED`, `ISLAND_COMPLETED`, `TREASURE_UNLOCKED`, `TICKET_REDEEM_REQUEST`, `TICKET_APPROVAL_RESPONSE`, `MILO_RESCUE_TRIGGER`, `PARENT_CHEER_SEND`, `STARS_SYNC`.
   - In particular, when Parent approves a Golden Ticket (`parentApproveTicket`), broadcast `TICKET_APPROVAL_RESPONSE` and display a celebratory fanfare modal on the Child screen (`#child-modal-ticket-approved`).
4. Generate `index.html` and `out_index.html`:
   - Run `python generate_app.py` to regenerate the deliverable files.
   - Run verification commands:
     - `python -m unittest tests/test_api_server.py`
     - `python -m unittest discover -s src/adhd_scoring -p "test_*.py"`
     - Validate `index.html` syntax and cross-tab event handling.
5. Produce a complete handoff report following the 5-component protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).

Send send_message to parent upon completion.
