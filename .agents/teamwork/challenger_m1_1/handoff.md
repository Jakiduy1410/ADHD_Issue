# Handoff Report: Milestone 1 - MiloSyncBus Adversarial Challenge & Verification

**Document ID:** HANDOFF-M1-CHALLENGER-20261018  
**Author:** challenger_m1_1 (Sync Bus & Concurrency Challenger)  
**Date:** 2026-10-18T06:30:00Z  
**Parent Agent ID:** `f373a3a8-9bab-4128-a177-2c52ad25b640`  
**Milestone:** Milestone 1 (Sync Bus & Curriculum Bank)  
**Target Deliverables:** `generate_app.py`, `index.html`, `out_index.html`  
**Automated Adversarial Suite:** `tests/adversarial/test_milo_sync_adversarial.js`  
**Verdict:** **REQUEST_CHANGES** (1 Critical Crash Loop, 1 Contract UI Defect, 1 State Hydration Gap)

---

## 1. Observation

### 1.1 Direct Empirical Observations & Tool Results

1. **Adversarial Test Suite Execution**:
   - Command: `node tests/adversarial/test_milo_sync_adversarial.js`
   - Outcome: Ran 31 assertions across 5 suites.
     - **Passed**: 28 assertions
     - **Failed**: 3 assertions
   - Test Results:
     - Suite 1 (Burst & Concurrency): 5/5 PASSED (50 rapid synchronous events < 100ms, 250 rolling buffer FIFO eviction, subscriber fault isolation, multi-tab broadcast channel sync, concurrent bidirectional burst).
     - Suite 2 (State Persistence): 3/4 PASSED (1 failure on `selectedCatalogIds` hydration).
     - Suite 3 (Corrupted Storage): 5/6 PASSED (1 critical failure on malformed `childRoadmap` in localStorage).
     - Suite 4 (WebSocket Offline & Fallback): 5/5 PASSED (silent degradation, exponential backoff cap at 16s, heartbeat cleanup on close, frame error handling, server event translation).
     - Suite 5 (10-Event Contract Compliance): 10/11 PASSED (1 failure on `PARENT_CHEER_SEND` displaying `"undefined"` when provided `{ message }`).

2. **Observation 1 — Critical: LocalStorage Malformed Task Crash Loop**:
   - Location: `index.html` lines 7726–7728 and lines 6140–6156.
   - Code snippet (`index.html:7726`):
     ```javascript
     if (saved.childRoadmap && Array.isArray(saved.childRoadmap) && saved.childRoadmap.length > 0) {
       appState.childRoadmap = saved.childRoadmap;
     }
     ```
   - Code snippet (`index.html:6141-6146`):
     ```javascript
     const currentTask = roadmap[curIdx] || roadmap[0];
     appState.activeTask = currentTask;

     document.getElementById('child-current-icon').innerText = currentTask.icon || "🏝️";
     document.getElementById('child-current-title').innerText = currentTask.title;
     document.getElementById('child-current-sub').innerText = `Chuỗi ${currentTask.steps.length} vi nhiệm vụ vừa sức • Milo hỗ trợ`;
     ```
   - Verbatim Error:
     `TypeError: Cannot read properties of null (reading 'icon')` or `TypeError: Cannot read properties of undefined (reading 'length')`
   - Tool reproduction command:
     ```bash
     node -e "
     const fs = require('fs'), vm = require('vm');
     const html = fs.readFileSync('index.html', 'utf8');
     const script = /<script>([\s\S]*?)<\/script>/gi.exec(html) && /<script>([\s\S]*?)<\/script>/gi.exec(html)[1];
     // Set localStorage with malformed element
     const env = { window: { location: { search: '' }, addEventListener: (e, cb)=>{ if (e==='DOMContentLoaded') env.onDom = cb; } }, document: { getElementById: ()=>({ classList:{add(){},remove(){}}, innerText:'', innerHTML:'', appendChild(){} }), querySelectorAll: ()=>[], createElement: ()=>({ classList:{add(){}}, setAttribute(){} }) }, localStorage: { getItem: () => JSON.stringify({ version: 1, stars: 500, childRoadmap: [null] }), setItem: ()=>{} }, BroadcastChannel: class{}, WebSocket: class{}, URLSearchParams: URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console, AudioContext: class{createOscillator(){return{start(){},stop(){}};} createGain(){return{gain:{setValueAtTime(){}}};}} };
     env.window.document = env.document; vm.createContext(env); vm.runInContext(script, env); env.onDom();"
     ```
     Result: Throws `TypeError: Cannot read properties of null (reading 'icon')` at initialization.

3. **Observation 2 — Medium: `PARENT_CHEER_SEND` UI Displays `"undefined"`**:
   - Location: `PROJECT.md` line 61 vs `index.html` lines 2026–2038 and 7597–7600.
   - Contract in `PROJECT.md:61`:
     `- PARENT_CHEER_SEND: { type: "PARENT_CHEER_SEND", payload: { message } }`
   - Implementation in `index.html:2029`:
     ```javascript
     bus.subscribe('PARENT_CHEER_SEND', (payload) => {
       playSfx('bell');
       const speechEl = document.getElementById('child-milo-speech');
       if (speechEl) {
         speechEl.innerText = `👩 Mẹ nhắn: "${payload.cheerText}" ❤️`;
     ```
   - Verbatim Output: When `{ message: "Con làm tốt lắm" }` is broadcasted, `payload.cheerText` evaluates to `undefined`, and `speechEl.innerText` renders `👩 Mẹ nhắn: "undefined" ❤️`.

4. **Observation 3 — Low-Medium: `selectedCatalogIds` Persistence Omission**:
   - Location: `index.html` line 1873 vs lines 7720–7751.
   - In `savePersistedState()`:
     `selectedCatalogIds: Array.from(stateSnapshot.selectedCatalogIds || [])` is saved to storage.
   - In `DOMContentLoaded` hydration (lines 7720–7751):
     No assignment to `appState.selectedCatalogIds` exists.
   - Result: On page reload, `appState.selectedCatalogIds` reverts to hardcoded default `new Set(['chore_desk', 'G1_MATH_01'])`, losing any parent task selections made before reload.

5. **Regression Test Suite Verification**:
   - `python -m unittest tests/test_api_server.py`: `Ran 7 tests in 28.477s - OK`.
   - `python -m unittest discover -s src/adhd_scoring -p "test_*.py"`: `Ran 22 tests in 0.003s - OK`.
   - `node .agents/teamwork/worker_m1/test_milo_sync_and_catalog.js`: `ALL 6 TEST SUITES PASSED WITH 100% SUCCESS`.

---

## 2. Logic Chain

1. **Analysis of Critical Vulnerability (Crash Loop)**:
   - *Observation Reference*: Observation 1.
   - *Premise*: Elementary students with ADHD frequently click back/forward, refresh, or have browser tab state restored across sessions. If `localStorage` receives a partial or corrupted payload (e.g. from an incomplete network batch dispatch or corrupt storage entry where a task is `null` or lacks `steps`), `loadPersistedState()` successfully parses the JSON string.
   - *Deduction*: `saved.childRoadmap && Array.isArray(saved.childRoadmap) && saved.childRoadmap.length > 0` evaluates to `true` even when items are `null` or `{}`.
   - *Failure Mode*: During `DOMContentLoaded`, `renderChildIslandRoadmap()` immediately attempts to access `currentTask.icon` and `currentTask.steps.length`. Because `currentTask` is `null` or `currentTask.steps` is `undefined`, an unhandled `TypeError` is thrown.
   - *Impact*: Page initialization is aborted. The DOM remains half-rendered or blank. Because the corrupted JSON remains in `localStorage`, every subsequent reload repeats the crash, rendering the application inoperable.
   - *Remediation*: Filter `saved.childRoadmap` to ensure each item is a valid task with an `Array.isArray(t.steps)` before assigning to `appState.childRoadmap`, and add null guards in `renderChildIslandRoadmap()`.

2. **Analysis of Contract Inconsistency (`PARENT_CHEER_SEND`)**:
   - *Observation Reference*: Observation 2.
   - *Premise*: `PROJECT.md` specifies the public state protocol: `PARENT_CHEER_SEND: { type: "PARENT_CHEER_SEND", payload: { message } }`.
   - *Deduction*: Any peer client, third-party component, or server conforming to `PROJECT.md` will send `payload.message`. `index.html` currently looks only for `payload.cheerText`.
   - *Failure Mode*: Milo's encouragement speech bubble renders `👩 Mẹ nhắn: "undefined" ❤️`. For a child with ADHD who is emotionally vulnerable to Rejection Sensitive Dysphoria (RSD), seeing "undefined" instead of their mother's praise disrupts emotional regulation.
   - *Remediation*: Accept `const text = payload.cheerText || payload.message || "Mẹ luôn đồng hành cùng con!";`.

3. **Analysis of State Hydration Omission (`selectedCatalogIds`)**:
   - *Observation Reference*: Observation 3.
   - *Premise*: `savePersistedState()` explicitly serializes `selectedCatalogIds`.
   - *Deduction*: The intent of the author was to persist the parent's catalog selections. However, the restore step in `DOMContentLoaded` was omitted.
   - *Failure Mode*: A parent selects 5 specific curriculum exercises, but upon page reload, the checkmarks reset to the default 2 tasks.
   - *Remediation*: In `DOMContentLoaded`, add:
     ```javascript
     if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {
       appState.selectedCatalogIds = new Set(saved.selectedCatalogIds);
     }
     ```

---

## 3. Caveats

- **Transports Tested via High-Fidelity In-Memory & Process Mocks**: Stress tests for `BroadcastChannel` and WebSocket were executed via Node.js VM harness matching W3C and WebSocket specifications. Full integration over a physical multi-machine LAN depends on network latency and firewall permissions.
- **Web Audio Context Autoplay**: As noted in worker_m1's handoff, browsers require a user interaction gesture before audio playback starts. The test harness verified sound generator invocation without hardware audio driver attachment.
- **Gemini API Live Rate Limits**: During execution of `tests/test_api_server.py`, live calls to Gemini API returned HTTP 429 quota exhaustion warnings. The fallback offline mocks handled the requests safely and all 7 test cases passed.

---

## 4. Conclusion & Challenge Summary

**Overall Risk Assessment:** **MEDIUM-HIGH** (Architecture is exceptionally strong in concurrency and offline resilience, but contains 1 critical crash loop on malformed storage and 2 contract/hydration defects).

### Verdict: **REQUEST_CHANGES**

The Tri-Layer `MiloSyncBus` implementation is architecturally sophisticated and withstood extreme burst concurrency (50–250 rapid events), multi-tab synchronization, and WebSocket network isolation without dropping packets or deadlock.

However, changes are **MANDATORY** before Milestone 1 sign-off to fix:
1. **Critical**: Unhandled `TypeError` in `DOMContentLoaded` / `renderChildIslandRoadmap()` on malformed tasks in `localStorage` leading to permanent infinite crash loop.
2. **Medium**: `PARENT_CHEER_SEND` displaying `"undefined"` when receiving `PROJECT.md` contract payload `{ message }`.
3. **Low-Medium**: `appState.selectedCatalogIds` hydration missing in `DOMContentLoaded`.

### Proposed Mitigations for Worker

1. **In `generate_app.py` & `index.html` (lines 7726–7728)**:
   ```javascript
   // Validate tasks before hydrating roadmap
   if (saved.childRoadmap && Array.isArray(saved.childRoadmap) && saved.childRoadmap.length > 0) {
     const validTasks = saved.childRoadmap.filter(t => t && typeof t === 'object' && t.id && Array.isArray(t.steps) && t.steps.length > 0);
     if (validTasks.length > 0) {
       appState.childRoadmap = validTasks;
     }
   }
   ```
2. **In `generate_app.py` & `index.html` (lines 7750–7752)**:
   ```javascript
   if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {
     appState.selectedCatalogIds = new Set(saved.selectedCatalogIds);
   }
   ```
3. **In `generate_app.py` & `index.html` (lines 2026–2038)**:
   ```javascript
   bus.subscribe('PARENT_CHEER_SEND', (payload) => {
     playSfx('bell');
     const speechEl = document.getElementById('child-milo-speech');
     const cheerMsg = payload.cheerText || payload.message || "Mẹ rất tự hào về con!";
     if (speechEl) {
       speechEl.innerText = `👩 Mẹ nhắn: "${cheerMsg}" ❤️`;
     ...
     showToast("Lời Khen Của Mẹ", cheerMsg, "❤️");
   ```
4. **In `renderChildIslandRoadmap()` (lines 6140–6158)**:
   Add defensive null checks for `currentTask` and `nextTask` so malformed tasks fall back safely to defaults.

---

## 5. Verification Method

To reproduce the adversarial challenge findings and independently verify fixes:

1. **Run the Adversarial Test Suite**:
   ```bash
   node tests/adversarial/test_milo_sync_adversarial.js
   ```
   *Current Result*: Exits with code 1 (`REQUEST_CHANGES`), failing assertions 2.4, 3.6, and 5.9b.  
   *Target Outcome after Worker Fix*: All 31 assertions pass with code 0 (`APPROVE`).

2. **Run Worker Baseline Test**:
   ```bash
   node .agents/teamwork/worker_m1/test_milo_sync_and_catalog.js
   ```
   *Expected Outcome*: All 6 test suites pass with 100% success.

3. **Run Backend API Server & ADHD Scoring Suites**:
   ```bash
   python -m unittest tests/test_api_server.py
   python -m unittest discover -s src/adhd_scoring -p "test_*.py"
   ```
   *Expected Outcome*: All unit tests pass.

4. **Verify Strict Prompt Guardrail Compliance**:
   ```bash
   git status -- prompts/
   ```
   *Expected Outcome*: Clean; zero files modified in `prompts/`.
