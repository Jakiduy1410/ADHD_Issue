# HANDOFF REPORT: MILESTONE 1 STATE PROTOCOL & VERIFICATION STRATEGY

**Agent:** explorer_m1_3 (State Protocol & Verification Explorer)  
**Milestone:** M1 (Sync Bus & Curriculum Bank)  
**Handoff Type:** Hard (Task complete)  
**Target Path:** `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_3\handoff.md`  
**Reference Report:** `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_3\exploration_report.md`  
**Recipient:** Orchestrator (`f373a3a8-9bab-4128-a177-2c52ad25b640`), Worker (`worker_m1`), Reviewers (`reviewer_1`, `reviewer_2`)  

---

## 1. Observation

Direct code observations from the repository:

1. **Standalone Generator & State Architecture**:
   - `generate_app.py` lines 1768–1798 define `appState` containing in-memory variables:
     ```javascript
     const appState = {
       role: 'dual', // 'dual', 'child', 'parent'
       stars: 450,
       childRoadmap: [
         taskDatabase['chore_desk'],
         taskDatabase['math_garden']
       ],
       currentRoadmapIndex: 0,
       activeTask: taskDatabase['chore_desk'],
       currentStepIndex: 0,
       ...
     };
     ```
   - Prior to Milestone 1, `appState` is shared solely within a single DOM window, lacking `BroadcastChannel`, `localStorage` event synchronization, or active WebSocket integration.

2. **Existing Task Catalog Discrepancy**:
   - `generate_app.py` lines 1527–1762 define `taskDatabase` with only 12 tasks (8 school tasks: `math_garden`, `math_market`, `math_remainder`, `math_geometry`, `viet_luom`, `viet_family`, `eng_pet`, `eng_fruit` + 4 routine tasks: `chore_desk`, `chore_teeth`, `chore_backpack`, `chore_bed`).
   - In contrast, `data/curriculum/grade_1_to_5_benchmark.json` contains exactly 25 standardized GDPT 2018 tasks spanning Grades 1–5 (`G1_MATH_01` through `G5_ENG_25`).

3. **Backend WebSocket Route Readiness**:
   - `src/api/server.py` line 745 defines `@app.websocket("/ws/sync")` accepting parameters `room_id`, `role`, and `client_id`, with connection manager broadcasting events to peers in the room.
   - `tests/test_api_server.py` lines 155–200 (`test_07_websocket_sync`) verifies successful two-way WebSocket message exchange between kid and parent roles.

4. **Clinical & Pedagogical Schemas**:
   - `schemas/micro_task_schema.json` lines 152–171 define strict boundaries: durations between 60s–300s, exactly 8 UI types (`single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`), single action verbs (`^[a-zA-ZÀ-ỹ_]+$`), and dopamine points between 10–100.
   - `prompts/` contains 4 strictly protected system prompts (`stage1_problem_classifier.md`, `stage2_task_decomposer.md`, `kid_rsd_calming_milo.md`, `parent_effort_coach.md`) which must not be modified.

---

## 2. Logic Chain

1. **From Observation 1**: Because `generate_app.py` relies exclusively on an in-memory `appState` object, running the application in two separate tabs (Tab 1: Parent, Tab 2: Child) or reloading the browser resets state to defaults and breaks synchronization.
2. **From Observation 1 & 3**: Introducing `MiloSyncBus` with Layer 1 (In-Memory loopback), Layer 2 (`BroadcastChannel('milo_quest_sync')` + `localStorage` storage events), and Layer 3 (WebSocket `/ws/sync`) provides unified 0ms local dispatch, <2ms cross-tab dispatch, and LAN/remote multi-device dispatch.
3. **From Observation 2**: To satisfy Requirement R2 and M1 objectives, all 25 benchmark tasks from `data/curriculum/grade_1_to_5_benchmark.json` must be ingested into `taskDatabase` alongside the 4 practical routine tasks, expanding the catalog from 12 to 29 total selectable tasks.
4. **From Observation 4**: A standardized 10-event state protocol (`TASK_ASSIGN_BATCH`, `STEP_TELEMETRY_UPDATE`, `STEP_COMPLETED`, `ISLAND_COMPLETED`, `TREASURE_UNLOCKED`, `TICKET_REDEEM_REQUEST`, `TICKET_APPROVAL_RESPONSE`, `MILO_RESCUE_TRIGGER`, `PARENT_CHEER_SEND`, `STARS_SYNC`) enclosed within `MiloSyncEnvelope` ensures end-to-end type safety, deterministic testing, and compliance with clinical ADHD boundaries (RSD protection, <300ms dopamine SLA, single-card cockpit).
5. **From Logic Steps 1–4**: A complete verification protocol comprising multi-tab DOM tests, localStorage refresh tests, and catalog availability tests is required to enable Worker and Reviewers to independently validate M1 deliverables.

---

## 3. Caveats

1. **Browser Security Sandboxing on `file:///`**:
   - If the user opens `index.html` via `file:///` in Google Chrome or Microsoft Edge, browser origin security may isolate `BroadcastChannel` instances or restrict `localStorage` events across tabs.
   - **Remediation**: The protocol mandates running a local HTTP server (`python -m http.server 8080`) for cross-tab testing, and enforces dual transport fallback (`window.addEventListener('storage')`) in `MiloSyncBus`.
2. **Prompt Protection Boundary**:
   - The prompt files in `prompts/` must remain completely untouched. All experimental prompts or scoring simulations remain confined to `scratch/`.
3. **No Direct Source Code Modification**:
   - In adherence to the Explorer archetype, this report specifies blueprints, schemas, and test procedures without directly editing `generate_app.py` or backend source files.

---

## 4. Conclusion

1. The **10-Event State Protocol** has been completely formulated with Draft-07 JSON schemas, TypeScript interfaces, semantic directions, and canonical payloads in `exploration_report.md`.
2. The **Verification Strategy** has been established with step-by-step procedures covering:
   - Live cross-tab DOM verification over `BroadcastChannel`.
   - Persistence and hydration of `appState` across page refreshes via `localStorage`.
   - Comprehensive filter and selection testing for all 25 GDPT 2018 benchmark tasks in the Parent Hub.
3. **Neurocognitive Safety Guardrails** (dopamine feedback latency <300ms, RSD-safe non-punitive UI, single-focus card cockpit, and silent WebSocket degradation) are formally specified to guide implementation and auditing.

---

## 5. Verification Method

To independently verify the recommendations and protocol definitions:

1. **Inspect Exploration Report**:
   ```powershell
   Get-Content "c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_m1_3\exploration_report.md"
   ```
2. **Run Existing Test Suites**:
   Confirm baseline test health across all existing modules:
   ```powershell
   python tests/runner.py
   python tests/test_api_server.py
   ```
3. **Downstream Worker Verification Checklist**:
   Once `worker_m1` implements the state bus in `generate_app.py` and regenerates `index.html`:
   - Start local HTTP server: `python -m http.server 8080`.
   - Open Tab 1: `http://localhost:8080/index.html?role=parent`.
   - Open Tab 2: `http://localhost:8080/index.html?role=child`.
   - Verify that batch-dispatching tasks from Tab 1 re-renders Tab 2's `#child-roadmap-stations`.
   - Verify that completing steps in Tab 2 updates Tab 1's `#telemetry-task-title` and progress bar.
   - Verify that refreshing Tab 2 preserves earned stars and current island progress.
   - Verify that `#catalog-tasks-list` contains all 25 benchmark tasks (`G1_MATH_01` to `G5_ENG_25`).
