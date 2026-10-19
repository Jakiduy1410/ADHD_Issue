# Handoff Report: Tri-Layer State Synchronization Bus (`MiloSyncBus`) Blueprint

**From:** explorer_m1_1 (Sync Bus Engineer Explorer)  
**To:** worker_m1 (Milestone 1 Implementation Worker) & parent agent  
**Date:** 2026-10-18T05:54:00Z  
**Type:** Hard Handoff (Investigation & Architecture Complete)

---

## 1. Observation

1. **`generate_app.py` State Definition (lines 1768–1797)**:
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
     selectedClues: new Set(),
     cleanedItems: new Set(),
     numpadValue: "",
     pauseCount: 1,
     totalSessionSeconds: 0,
     selectedCatalogIds: new Set(['chore_desk', 'math_garden']),
     catalogFilter: 'all',
     modalTaskKey: 'math_garden'
   };
   ```
   All components read and write to this single in-memory variable in the current tab's DOM.

2. **Direct DOM Mutation in Dispatch & Approval Functions**:
   - `dispatchSelectedCatalogTasks()` (lines 2774–2793):
     Directly sets `appState.childRoadmap = selectedTasks` and synchronously executes `renderChildIslandRoadmap()` on `#col-child`.
   - `completeChildStep()` (lines 2428–2445):
     Directly updates `appState.currentStepIndex`, calls `updateStarsEverywhere(appState.stars + 40)`, and calls `renderChildWorkspaceStep()`.
   - `childRedeemTicket()` (lines 2625–2646):
     Directly modifies `#parent-golden-ticket-banner` and `#parent-ticket-desc` DOM classes.
   - `parentApproveTicket()` (lines 3056–3063):
     Only modifies `#parent-golden-ticket-banner` and `#parent-golden-ticket-done` on parent DOM. It **does NOT alert or trigger any celebration modal on the child screen**.

3. **Backend WebSocket Interface (`src/api/server.py` lines 745–826)**:
   - Endpoint: `@app.websocket("/ws/sync")` accepting queries `room_id`, `role`, `client_id`.
   - Handshake message: `{"event_type": "CONNECTION_ESTABLISHED", "client_id": cid, "role": role, "room_id": room_id, "timestamp": ...}`.
   - Server special translations:
     - `KID_STEP_COMPLETED` → sends `PARENT_NOTIFICATION_STEP_DONE` to role `parent`.
     - `PARENT_CHEER` → sends `KID_RECEIVE_CHEER` to role `kid`.
     - General events → `manager.broadcast_to_room(room_id, broadcast_data, exclude=websocket)`.
   - Heartbeat: `PING` → `PONG`.

4. **Multi-Tab / Multi-Window Absence**:
   Currently, opening `index.html` in two separate tabs does not synchronize actions. If a parent dispatches tasks in Tab 1, Tab 2's child view remains unmodified.

---

## 2. Logic Chain

1. **Premise 1 (from Observation 1 & 4)**: Because `appState` is purely in-memory and local DOM functions are invoked synchronously, state is not shared between tabs or surviving page reloads.
2. **Premise 2 (from ORIGINAL_REQUEST R1 & PROJECT.md Feature 2)**: The ecosystem must support Dual Split View on a single screen (0ms), cross-tab zero-config synchronization (<2ms), and real LAN multi-device communication with graceful degradation if offline.
3. **Premise 3 (from Observation 2 & Gap G3)**: Direct DOM calls couple components tightly. Decoupling calls into a pub/sub event bus allows one action (e.g. `parentApproveTicket`) to trigger reactions both locally and across all remote tabs/devices (e.g. child ticket celebration modal).
4. **Premise 4 (from Observation 3)**: The WebSocket client in the browser must interoperate with `src/api/server.py`'s `/ws/sync` protocol, transmitting `KID_STEP_COMPLETED` and `PARENT_CHEER` to trigger server role forwarding, while utilizing `BroadcastChannel` and `localStorage` as resilient local transports that function even when the backend is offline.
5. **Conclusion**: A Tri-Layer Hybrid State Bus (`MiloSyncBus`) combining In-Memory Loopback (Layer 1), BroadcastChannel with localStorage fallback & persistent state (Layer 2), and auto-connecting WebSocket with exponential backoff and silent failure (Layer 3) provides the required 0ms local response, <2ms cross-tab sync, offline survival, and physical multi-device support.

---

## 3. Caveats

1. **`file:///` Protocol Restrictions**:
   When opening `index.html` via `file:///` in certain browsers (e.g. Chrome on Windows without flags), `localStorage` and `BroadcastChannel` may be scoped to the file origin or sandboxed. The code includes a comprehensive `try...catch` wrapper so if any API is blocked, the in-memory Layer 1 operates without disruption.
2. **WebSocket Port Assumption**:
   The default port is `8000` (`ws://${window.location.hostname || 'localhost'}:8000/ws/sync`). If the user runs the FastAPI backend on another port, the fallback layers (Layer 1 and Layer 2) will continue operating seamlessly while Layer 3 retries in the background with exponential backoff.
3. **Scope Discipline**:
   As an explorer, no modifications have been made directly to `generate_app.py`, `index.html`, or `src/api/server.py`. The complete implementation code has been documented in `exploration_report.md` for Worker M1.

---

## 4. Conclusion

1. The exact architecture and full JavaScript implementation of `MiloSyncBus` are formulated in `exploration_report.md`.
2. The 10-event state protocol (`TASK_ASSIGN_BATCH`, `STEP_TELEMETRY_UPDATE`, `STEP_COMPLETED`, `ISLAND_COMPLETED`, `TREASURE_UNLOCKED`, `TICKET_REDEEM_REQUEST`, `TICKET_APPROVAL_RESPONSE`, `MILO_RESCUE_TRIGGER`, `PARENT_CHEER_SEND`, `STARS_SYNC`) provides complete coverage for all child-parent interactions.
3. Persistent state schema in `localStorage` (`stars`, `childRoadmap`, `currentRoadmapIndex`, `currentStepIndex`, `pendingTicket`, `pauseCount`) ensures state resilience across page reloads.
4. A missing child UI element—the Ticket Approved Celebration Modal (`#child-modal-ticket-approved`)—has been designed and specified with exact HTML and JavaScript controllers to satisfy Acceptance Criterion R1 & R3.

---

## 5. Verification Method

To independently verify the architecture and subsequent worker implementation:

1. **Verify Existing Tests Pass**:
   Run the test runner to ensure current backend and test suites are pristine:
   ```powershell
   python tests/runner.py
   python tests/test_api_server.py
   ```
2. **Verify Code Generation**:
   After Worker M1 applies the changes to `generate_app.py`:
   ```powershell
   python generate_app.py
   ```
   Check that `index.html` and `out_index.html` are created and contain `class MiloSyncBus` and `milo_quest_sync`.
3. **Verify Cross-Tab Synchronization**:
   - Open Tab 1: `index.html?role=parent`
   - Open Tab 2: `index.html?role=child`
   - In Tab 1: Tick 2 tasks in the Catalog and click "Giao ngay".
   - In Tab 2: Verify the Island Roadmap updates immediately (<2ms) without page refresh.
   - In Tab 2: Click "Đổi vé vàng".
   - In Tab 1: Verify the parent golden ticket approval banner appears.
   - In Tab 1: Click "Duyệt ngay".
   - In Tab 2: Verify the child celebration modal pops up with star burst and fanfare sound.
4. **Verify Offline Resilience**:
   Turn off backend or open `index.html` directly. Verify console contains no unhandled exceptions and all local interactions operate smoothly.
