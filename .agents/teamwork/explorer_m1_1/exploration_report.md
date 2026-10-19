# Technical Specification & Architectural Blueprint: Tri-Layer Hybrid State Bus (`MiloSyncBus`)

**Author:** explorer_m1_1 (Sync Bus Engineer Explorer)  
**Date:** 2026-10-18T05:53:30Z  
**Target Milestone:** Milestone 1 (Sync Bus & Curriculum Bank)  
**Affected Artifacts:** `generate_app.py`, `index.html`, `out_index.html` (generated), with interoperability to `src/api/server.py` (`/ws/sync`)

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 Existing State Implementation Analysis (`generate_app.py`)
In the current codebase (`generate_app.py`, lines 1768–1797), application state is maintained via a single in-memory JavaScript object:
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

### 1.2 Current State Mutation Bottlenecks
State modifications currently mutate `appState` directly and invoke DOM manipulation functions targeting elements within the same document:
1. **Batch Assignment Dispatch** (`dispatchSelectedCatalogTasks` at lines 2774–2793): Mutates `appState.childRoadmap = selectedTasks` and directly calls `renderChildIslandRoadmap()` on `#col-child`.
2. **Step Completion** (`completeChildStep` at lines 2428–2445): Modifies `appState.currentStepIndex`, invokes `updateStarsEverywhere(appState.stars + 40)`, and manipulates parent telemetry elements directly (`#telemetry-status-badge`, `#telemetry-progress-text`).
3. **Golden Ticket Redemption** (`childRedeemTicket` at lines 2625–2646): Deducts stars and toggles CSS classes on `#parent-golden-ticket-banner` and `#p-reward-dot` directly.
4. **Ticket Approval** (`parentApproveTicket` at lines 3056–3063): Toggles parent banner, but **does not emit any event or trigger any celebration on the child screen** (violating acceptance criterion R1/R3).
5. **Absence of Cross-Context Communication**: If the Child App is opened in Tab 1 and the Parent App in Tab 2, or if the page is reloaded, all state is lost or decoupled. No synchronization exists outside of the single DOM instance.

---

## 2. Tri-Layer Hybrid Synchronization Architecture (`MiloSyncBus`)

The `MiloSyncBus` encapsulates three complementary communication layers into a unified pub/sub facade:

```
+----------------------------------------------------------------------------------------------------+
|                                         APPLICATION UI                                             |
|        [Parent Hub: Trạm Thấu Hiểu]                        [Child Cockpit: Milo Quest]             |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                    MiloSyncBus (Facade API)                                        |
|  - broadcast(eventType, payload)                                                                   |
|  - subscribe(eventType, callback)                                                                  |
|  - savePersistedState() / loadPersistedState()                                                     |
+----------------------------------------------------------------------------------------------------+
              │                                   │                                   │
              ▼ (0ms Latency)                     ▼ (< 2ms Latency)                   ▼ (~5-15ms Latency)
+---------------------------+       +---------------------------+       +---------------------------+
|    Layer 1: In-Memory     |       |    Layer 2: Web Bus       |       |   Layer 3: WebSocket      |
|    Loopback Dispatch      |       |  BroadcastChannel         |       |   ws://localhost:8000/    |
|  • Instant DOM updates    |       |  ('milo_quest_sync')      |       |   ws/sync                 |
|  • Side-by-side Dual Mode |       |  + localStorage Fallback  |       |  • LAN / Multi-device     |
|  • Zero serialisation lag |       |  • Persistent state store |       |  • Exponential backoff    |
|                           |       |  • Cross-tab zero-config  |       |  • Silent degradation     |
+---------------------------+       +---------------------------+       +---------------------------+
```

### 2.1 Layer 1: In-Memory Loopback Dispatch (0ms Latency)
- **Target Context**: Single-tab Dual View (`appState.role === 'dual'`), pitch presentations, local split-screen evaluations.
- **Mechanism**: Synchronous callback dispatch through an internal `Map<string, Array<(payload, envelope) => void>>`.
- **Latency**: Exactly 0ms (same microtask/event tick).
- **Loopback Safety**: Each outgoing envelope attaches `sender_id: this.clientId`. Layer 1 immediately runs subscribers locally, while marking the envelope so remote layers (BroadcastChannel/WebSocket) do not re-trigger the sender.

### 2.2 Layer 2: BroadcastChannel API + LocalStorage Fallback (< 2ms Latency)
- **Target Context**: Multi-tab operations across dual monitors (Tab 1: `?role=parent`, Tab 2: `?role=child`).
- **Primary Transport**: `new BroadcastChannel('milo_quest_sync')`.
  - Native browser IPC channel with sub-2 millisecond latency.
  - Listeners on `channel.onmessage` filter out incoming events where `envelope.sender_id === this.clientId`.
- **Secondary Fallback Transport**: `localStorage` key `'milo_quest_sync_event'`.
  - When `BroadcastChannel` is restricted (e.g. strict origin isolation in sandboxed WebViews), event snapshots are written to `localStorage.setItem('milo_quest_sync_event', JSON.stringify(envelope))`.
  - `window.addEventListener('storage', ...)` listens for changes and executes subscribers.
- **Offline State Persistence**:
  - Key: `'milo_quest_saved_state'`.
  - Persists: `stars`, `childRoadmap`, `currentRoadmapIndex`, `currentStepIndex`, `pendingTicket`, `pauseCount`.
  - Automatically loads on page refresh to ensure progress survives navigation or page refreshes.

### 2.3 Layer 3: Network WebSocket Client with Silent Auto-Degradation (~5–15ms Latency)
- **Target Context**: Physical dual-device testing (Parent on phone, Child on iPad) via local Wi-Fi.
- **Connection URL**:
  `ws://${window.location.hostname || 'localhost'}:8000/ws/sync?room_id=${this.roomId}&role=${this.role}&client_id=${this.clientId}`
- **Server Interoperability (`src/api/server.py`)**:
  - Matches the existing `ConnectionManager` at line 420.
  - Server auto-responds to `"PING"` with `{"event_type": "PONG", "timestamp": ...}`.
  - Server translates specific events:
    - `"KID_STEP_COMPLETED"` → emits `"PARENT_NOTIFICATION_STEP_DONE"` to role `"parent"`.
    - `"PARENT_CHEER"` → emits `"KID_RECEIVE_CHEER"` to role `"kid"`.
    - All other events are broadcasted to peers in the room via `broadcast_to_room`.
- **Silent Degradation & Exponential Backoff**:
  - If backend is offline (e.g. opened directly as `file:///...` or server not started), WebSocket failure causes **zero UI interruption**, no error banners, and no broken interactions.
  - Automatically attempts reconnection using exponential backoff: `1s, 2s, 4s, 8s, up to 16s max`.
  - Presentation bar shows a clean sync indicator badge: `🟢 Đồng bộ tức thì (Local/WebBus)` or `☁️ WebSocket Online`.

---

## 3. The 10-Event State Protocol Specification

The protocol formalizes every interaction between Child App, Parent App, and the backend.

| # | Event Type | Emitter | Listener | Payload Schema | Action & UI Reaction |
|---|------------|---------|----------|----------------|----------------------|
| 1 | `TASK_ASSIGN_BATCH` | Parent | Child | `{ tasks: Task[], islandName?: string, dispatchId?: string, note?: string }` | Child updates `childRoadmap`, resets `currentRoadmapIndex = 0`, switches to home screen, renders islands. |
| 2 | `STEP_TELEMETRY_UPDATE` | Child | Parent | `{ taskId: string, stepIndex: number, elapsedSec: number, totalSteps: number }` | Parent updates Live Telemetry widget (timer elapsed, active step pulse). |
| 3 | `STEP_COMPLETED` | Child | Parent | `{ taskId: string, stepIndex: number, totalSteps: number, starsEarned: number, totalStarsNow: number, isTaskComplete: boolean }` | Parent telemetry advances segmented progress bar; triggers effort praise suggestion. |
| 4 | `ISLAND_COMPLETED` | Child | Parent | `{ taskId: string, islandTitle: string, totalStars: number, nextIslandIndex: number }` | Parent dashboard flags island complete; Child displays island celebration modal. |
| 5 | `TREASURE_UNLOCKED` | Child | Parent | `{ totalStarsEarned: number, unlockedRewards: string[] }` | Child triggers Golden Chest opening ceremony modal; Parent receives completion notification. |
| 6 | `TICKET_REDEEM_REQUEST` | Child | Parent | `{ ticketId: string, title: string, cost: number, remainingStars: number }` | Parent displays golden ticket approval banner (`#parent-golden-ticket-banner`) with sound chime. |
| 7 | `TICKET_APPROVAL_RESPONSE`| Parent | Child | `{ ticketId: string, title: string, approved: boolean, praiseMessage: string }` | Child displays celebration modal (`#child-modal-ticket-approved`), plays C-Major fanfare, confetti burst. |
| 8 | `MILO_RESCUE_TRIGGER` | Child | Parent | `{ reason: string, stepId: number, taskId: string, pauseCount: number }` | Parent dashboard updates pause count badge; activates anti-RSD coach script. |
| 9 | `PARENT_CHEER_SEND` | Parent | Child | `{ cheerText: string, sticker: string, sfxCue?: string }` | Child screen displays Milo cheer bubble with animated reaction and harp chime. |
| 10 | `STARS_SYNC` | Both | Both | `{ totalStars: number, delta: number, reason: string }` | Synchronizes star count in all DOM nodes (`.sync-star-val`) across all open windows. |

---

## 4. Concrete JavaScript Implementation Blueprint

### 4.1 Complete `MiloSyncBus` Class Code Snippet
To be inserted into `generate_app.py` inside the `<script>` section immediately preceding `/* B. STATE MANAGEMENT TOÀN BỘ ỨNG DỤNG */`:

```javascript
/* ============================================================
   0.1 TRI-LAYER HYBRID STATE BUS (MiloSyncBus)
   ============================================================ */
class MiloSyncBus {
  constructor(options = {}) {
    this.roomId = options.roomId || this._getUrlParam('room') || 'family_room_milo_01';
    this.role = options.role || this._getUrlParam('role') || 'dual'; // 'dual', 'child', 'parent'
    this.clientId = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    
    this.channelName = 'milo_quest_sync';
    this.storageEventKey = 'milo_quest_sync_event';
    this.storageStateKey = `milo_quest_saved_state_${this.roomId}`;
    
    this.subscribers = new Map();
    this.channel = null;
    this.ws = null;
    this.isWsConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;

    // 1. Initialize Layer 2: BroadcastChannel
    this._initBroadcastChannel();

    // 2. Initialize Layer 2 fallback: LocalStorage storage event
    this._initStorageListener();

    // 3. Initialize Layer 3: WebSocket with silent degradation
    this._initWebSocket();
  }

  _getUrlParam(param) {
    if (typeof window === 'undefined' || !window.location) return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /* ---------------- Layer 1: In-Memory Loopback ---------------- */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(callback);
    return () => {
      const list = this.subscribers.get(eventType) || [];
      this.subscribers.set(eventType, list.filter(cb => cb !== callback));
    };
  }

  _dispatchLocal(eventType, payload, envelope) {
    const callbacks = this.subscribers.get(eventType) || [];
    callbacks.forEach(cb => {
      try {
        cb(payload, envelope);
      } catch (err) {
        console.error(`[MiloSyncBus] Error in subscriber for ${eventType}:`, err);
      }
    });
  }

  /* ---------------- Layer 2: BroadcastChannel & LocalStorage ---------------- */
  _initBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          const envelope = event.data;
          if (!envelope || !envelope.event_type) return;
          // Ignore own messages broadcasted back
          if (envelope.sender_id === this.clientId) return;
          this._dispatchLocal(envelope.event_type, envelope.payload, envelope);
        };
      }
    } catch (e) {
      console.warn('[MiloSyncBus] BroadcastChannel unavailable, using LocalStorage fallback.', e);
    }
  }

  _initStorageListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageEventKey && e.newValue) {
        try {
          const envelope = JSON.parse(e.newValue);
          if (!envelope || !envelope.event_type) return;
          if (envelope.sender_id === this.clientId) return;
          this._dispatchLocal(envelope.event_type, envelope.payload, envelope);
        } catch (err) {
          // ignore corrupted payload
        }
      }
    });
  }

  /* ---------------- Layer 3: WebSocket Auto-Connect & Silent Degradation ---------------- */
  _initWebSocket() {
    // Determine host & port
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
    const port = '8000';
    const wsProto = isHttps ? 'wss://' : 'ws://';
    const wsRole = this.role === 'child' ? 'kid' : (this.role === 'parent' ? 'parent' : 'kid');
    const wsUrl = `${wsProto}${host}:${port}/ws/sync?room_id=${this.roomId}&role=${wsRole}&client_id=${this.clientId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isWsConnected = true;
        this.reconnectAttempts = 0;
        this._updateSyncIndicator(true);
        this._startHeartbeat();
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this._handleIncomingWsMessage(data);
        } catch (err) {}
      };

      this.ws.onclose = () => {
        this.isWsConnected = false;
        this._stopHeartbeat();
        this._updateSyncIndicator(false);
        this._scheduleReconnect();
      };

      this.ws.onerror = () => {
        // Silent failure - do not alert user
        if (this.ws) {
          try { this.ws.close(); } catch (err) {}
        }
      };
    } catch (e) {
      this.isWsConnected = false;
      this._updateSyncIndicator(false);
      this._scheduleReconnect();
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.isWsConnected) {
        try {
          this.ws.send(JSON.stringify({ event_type: "PING", client_id: this.clientId }));
        } catch (err) {}
      }
    }, 25000);
  }

  _stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._initWebSocket();
    }, backoff);
  }

  _handleIncomingWsMessage(data) {
    if (!data || !data.event_type) return;

    // 1. Connection established handshake
    if (data.event_type === "CONNECTION_ESTABLISHED") {
      return;
    }
    // 2. Heartbeat reply
    if (data.event_type === "PONG") {
      return;
    }
    // 3. Server translated event: Kid step done -> Parent notification
    if (data.event_type === "PARENT_NOTIFICATION_STEP_DONE") {
      this._dispatchLocal("STEP_COMPLETED", {
        stepIndex: data.step_id ? data.step_id - 1 : 0,
        starsEarned: data.points_earned || 25,
        message: data.message
      }, data);
      return;
    }
    // 4. Server translated event: Parent cheer -> Kid receive cheer
    if (data.event_type === "KID_RECEIVE_CHEER") {
      this._dispatchLocal("PARENT_CHEER_SEND", {
        cheerText: data.cheer_text,
        sticker: data.sticker
      }, data);
      return;
    }
    // 5. Standard broadcasted event
    if (data.sender && data.sender === this.clientId) return;
    const eventType = data.event_type;
    const payload = data.payload || data;
    this._dispatchLocal(eventType, payload, data);
  }

  _updateSyncIndicator(wsActive) {
    const indicator = document.getElementById('sync-status-indicator');
    if (!indicator) return;
    if (wsActive) {
      indicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-emerald-300">WebSocket Online</span>';
    } else {
      indicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-teal-400"></span><span class="text-teal-300">WebBus Local (&lt;2ms)</span>';
    }
  }

  /* ---------------- Unified Broadcast Dispatch ---------------- */
  broadcast(eventType, payload = {}) {
    const envelope = {
      event_type: eventType,
      sender_id: this.clientId,
      sender_role: this.role,
      room_id: this.roomId,
      timestamp: Date.now(),
      payload: payload
    };

    // 1. Layer 1: In-Memory Loopback (0ms instant execution)
    this._dispatchLocal(eventType, payload, envelope);

    // 2. Layer 2: BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(envelope);
      } catch (err) {
        console.warn('[MiloSyncBus] BroadcastChannel post failed:', err);
      }
    }

    // 3. Layer 2 Fallback: LocalStorage event trigger
    try {
      localStorage.setItem(this.storageEventKey, JSON.stringify(envelope));
    } catch (err) {}

    // 4. Layer 3: WebSocket Server Broadcast
    if (this.ws && this.isWsConnected) {
      try {
        // Check if server has specific translation schema
        if (eventType === "STEP_COMPLETED" && (this.role === 'child' || this.role === 'kid')) {
          this.ws.send(JSON.stringify({
            event_type: "KID_STEP_COMPLETED",
            step_id: (payload.stepIndex !== undefined ? payload.stepIndex + 1 : 1),
            dopamine_points: payload.starsEarned || 40,
            payload: payload
          }));
        } else if (eventType === "PARENT_CHEER_SEND" && this.role === 'parent') {
          this.ws.send(JSON.stringify({
            event_type: "PARENT_CHEER",
            cheer_text: payload.cheerText,
            sticker: payload.sticker || "milo_thumbs_up",
            payload: payload
          }));
        } else {
          this.ws.send(JSON.stringify(envelope));
        }
      } catch (err) {
        console.warn('[MiloSyncBus] WebSocket send failed:', err);
      }
    }
  }

  /* ---------------- State Persistence API ---------------- */
  savePersistedState(stateSnapshot) {
    try {
      const serialized = JSON.stringify({
        stars: stateSnapshot.stars,
        childRoadmap: stateSnapshot.childRoadmap,
        currentRoadmapIndex: stateSnapshot.currentRoadmapIndex,
        currentStepIndex: stateSnapshot.currentStepIndex,
        pendingTicket: stateSnapshot.pendingTicket || null,
        pauseCount: stateSnapshot.pauseCount || 0,
        savedAt: Date.now()
      });
      localStorage.setItem(this.storageStateKey, serialized);
    } catch (err) {}
  }

  loadPersistedState() {
    try {
      const data = localStorage.getItem(this.storageStateKey);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  clearPersistedState() {
    try {
      localStorage.removeItem(this.storageStateKey);
    } catch (err) {}
  }
}
```

---

## 5. Wiring Subscriber Callbacks to UI Re-renders

The following table provides the exact refactoring requirements for Worker M1 to decouple existing direct calls in `generate_app.py` into event broadcasts and subscribers.

### 5.1 Event Subscription Wiring Map

```javascript
function registerMiloSyncSubscribers(bus) {
  // 1. TASK_ASSIGN_BATCH: Parent dispatches -> Child renders Island Roadmap
  bus.subscribe('TASK_ASSIGN_BATCH', (payload) => {
    if (!payload.tasks || payload.tasks.length === 0) return;
    appState.childRoadmap = payload.tasks;
    appState.currentRoadmapIndex = 0;
    appState.activeTask = payload.tasks[0];
    appState.currentStepIndex = 0;

    renderChildIslandRoadmap();
    childSwitchScreen('home');
    bus.savePersistedState(appState);
    showToast("Hải Trình Mới Sẵn Sàng!", `Mẹ vừa giao ${payload.tasks.length} đảo thử thách!`, "🏝️");
  });

  // 2. STEP_TELEMETRY_UPDATE: Child updates step -> Parent telemetry bar updates
  bus.subscribe('STEP_TELEMETRY_UPDATE', (payload) => {
    const total = payload.totalSteps || (appState.activeTask ? appState.activeTask.steps.length : 3);
    const activeNum = (payload.stepIndex !== undefined ? payload.stepIndex + 1 : 1);
    renderParentTelemetryProgress(total, activeNum);
    if (payload.elapsedSec !== undefined) {
      const durEl = document.getElementById('telemetry-duration');
      if (durEl) durEl.innerHTML = `${formatTime(payload.elapsedSec)} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;
    }
  });

  // 3. STEP_COMPLETED: Child finishes micro-step -> Parent progress updates
  bus.subscribe('STEP_COMPLETED', (payload) => {
    if (payload.totalStarsNow !== undefined) {
      updateStarsEverywhere(payload.totalStarsNow);
    }
    const total = payload.totalSteps || 3;
    const nextStep = (payload.stepIndex !== undefined ? payload.stepIndex + 1 : 1);
    renderParentTelemetryProgress(total, nextStep);

    // Update parent telemetry badge
    const badge = document.getElementById('telemetry-status-badge');
    if (badge) {
      badge.innerHTML = `⭐ Bước ${payload.stepIndex + 1} hoàn thành!`;
      badge.className = "inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold";
    }
    showToast("Tiến Độ Cập Nhật", `Leo vừa hoàn thành bước ${payload.stepIndex + 1}! (+${payload.starsEarned || 40} ⭐)`, "⭐");
  });

  // 4. ISLAND_COMPLETED: Whole island cleared
  bus.subscribe('ISLAND_COMPLETED', (payload) => {
    showToast("Đảo Đã Chinh Phục!", `Leo đã hoàn thành đảo: ${payload.islandTitle || 'Thành công'}!`, "🎉");
    const badge = document.getElementById('telemetry-status-badge');
    if (badge) {
      badge.innerHTML = "🎉 Vừa hoàn thành đảo!";
      badge.className = "inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold";
    }
  });

  // 5. TREASURE_UNLOCKED: All islands completed
  bus.subscribe('TREASURE_UNLOCKED', (payload) => {
    showToast("Rương Báu Hoàng Kim!", "Tất cả các đảo đã hoàn thành. Rương báu đã mở!", "👑");
  });

  // 6. TICKET_REDEEM_REQUEST: Child redeems ticket -> Parent banner alerts
  bus.subscribe('TICKET_REDEEM_REQUEST', (payload) => {
    appState.pendingTicket = payload;
    bus.savePersistedState(appState);

    const banner = document.getElementById('parent-golden-ticket-banner');
    const doneBanner = document.getElementById('parent-golden-ticket-done');
    const redDot = document.getElementById('p-reward-dot');
    const desc = document.getElementById('parent-ticket-desc');

    if (banner) banner.classList.remove('hidden');
    if (doneBanner) doneBanner.classList.add('hidden');
    if (redDot) redDot.classList.remove('hidden');
    if (desc) desc.innerText = `🎉 Leo vừa dùng ${payload.cost} ⭐ để đổi [Vé Vàng: ${payload.title}]!`;

    playSfx('bell');
    showToast("Yêu Cầu Vé Vàng", `Leo muốn đổi: ${payload.title} (${payload.cost} ⭐)`, "🎟️");
  });

  // 7. TICKET_APPROVAL_RESPONSE: Parent approves -> Child celebration modal fires!
  bus.subscribe('TICKET_APPROVAL_RESPONSE', (payload) => {
    if (payload.approved) {
      playSfx('success');
      showChildTicketApprovedModal(payload.title, payload.praiseMessage);
      appState.pendingTicket = null;
      bus.savePersistedState(appState);
    }
  });

  // 8. MILO_RESCUE_TRIGGER: Child activates CBT breathing -> Parent coach updates
  bus.subscribe('MILO_RESCUE_TRIGGER', (payload) => {
    appState.pauseCount = payload.pauseCount || (appState.pauseCount + 1);
    const pCountEl = document.getElementById('telemetry-pause-count');
    if (pCountEl) {
      pCountEl.innerHTML = `${appState.pauseCount} lần <span class="text-emerald-600 font-semibold">(Biết tự điều tiết CBT)</span>`;
    }
    const badge = document.getElementById('telemetry-status-badge');
    if (badge) {
      badge.innerHTML = "🔋 Tự giác Pause (CBT)";
    }
    showToast("Milo Hỗ Trợ Cảm Xúc", "Bé Leo đang thực hiện bài tập thở bụng 4-4-4 cùng Milo.", "🌿");
  });

  // 9. PARENT_CHEER_SEND: Parent sends cheer -> Milo animation & bubble on Child screen
  bus.subscribe('PARENT_CHEER_SEND', (payload) => {
    playSfx('bell');
    const speechEl = document.getElementById('child-milo-speech');
    if (speechEl) {
      speechEl.innerText = `👩 Mẹ nhắn: "${payload.cheerText}" ❤️`;
      speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
      setTimeout(() => {
        speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
      }, 4000);
    }
    showToast("Lời Khen Của Mẹ", payload.cheerText, "❤️");
  });

  // 10. STARS_SYNC: Bidirectional star balance synchronizer
  bus.subscribe('STARS_SYNC', (payload) => {
    if (payload.totalStars !== undefined && payload.totalStars !== appState.stars) {
      appState.stars = payload.totalStars;
      document.querySelectorAll('.sync-star-val').forEach(el => el.innerText = payload.totalStars);
      bus.savePersistedState(appState);
    }
  });
}
```

### 5.2 Child Ticket Approved Modal (`#child-modal-ticket-approved`)
To fulfill Acceptance Criteria R1 & R3, Worker M1 must add this modal to `#col-child` inside `.phone-screen`:

```html
<!-- MODAL BÉ LEO NHẬN PHÊ DUYỆT VÉ VÀNG TỪ MẸ -->
<div id="child-modal-ticket-approved" class="hidden absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 p-4 flex-col items-center justify-center text-center">
  <div class="bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 border-4 border-yellow-400 rounded-[36px] p-6 w-full shadow-2xl flex flex-col items-center animate-slide-up">
    <div class="text-6xl mb-2 animate-bounce">
      🎉🎟️
    </div>
    <span class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase shadow-sm">
      BỐ MẸ ĐÃ DUYỆT VÉ VÀNG!
    </span>
    <h3 id="child-approved-ticket-name" class="text-lg font-black text-slate-900 mt-2">
      30 phút chơi Lego cùng mẹ Lan
    </h3>
    <p id="child-approved-ticket-praise" class="text-xs font-bold text-slate-700 mt-1.5 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-yellow-300">
      "Mẹ rất tự hào về sự kiên trì vượt các đảo hôm nay của Leo!"
    </p>
    <button onclick="closeChildTicketApprovedModal()" class="w-full mt-4 btn-3d-yellow text-slate-950 font-black py-3 rounded-2xl text-xs shadow-md">
      NHẬN PHẦN THƯỞNG NGAY 🌟
    </button>
  </div>
</div>
```

Accompanied by the modal controller:
```javascript
function showChildTicketApprovedModal(ticketTitle, praiseMessage) {
  const modal = document.getElementById('child-modal-ticket-approved');
  if (!modal) return;
  document.getElementById('child-approved-ticket-name').innerText = ticketTitle || "Vé Vàng Của Bé";
  if (praiseMessage) {
    document.getElementById('child-approved-ticket-praise').innerText = `"${praiseMessage}"`;
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  spawnStars();
}

function closeChildTicketApprovedModal() {
  playSfx('tap');
  const modal = document.getElementById('child-modal-ticket-approved');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
```

---

## 6. Implementation Strategy for Worker M1

Worker M1 should follow this non-destructive execution sequence inside `generate_app.py`:

1. **Step 1: Insert `MiloSyncBus` Definition**:
   Place the class right after `AudioContext` functions (line 1523) and before `taskDatabase`.
2. **Step 2: Initialize Global Bus & Register Subscribers**:
   - Initialize `window.miloBus = new MiloSyncBus();`
   - Setup `registerMiloSyncSubscribers(window.miloBus);` inside `DOMContentLoaded`.
   - Hydrate `appState` from `miloBus.loadPersistedState()`.
3. **Step 3: Refactor Dispatch Call Sites**:
   - In `dispatchSelectedCatalogTasks()`: Replace direct state mutation with `window.miloBus.broadcast('TASK_ASSIGN_BATCH', { tasks: selectedTasks })`.
   - In `completeChildStep()`: Call `window.miloBus.broadcast('STEP_COMPLETED', { ... })` and `window.miloBus.broadcast('STARS_SYNC', { ... })`.
   - In `childRedeemTicket(name, stars)`: Call `window.miloBus.broadcast('TICKET_REDEEM_REQUEST', { ... })` and `window.miloBus.broadcast('STARS_SYNC', { ... })`.
   - In `parentApproveTicket()`: Call `window.miloBus.broadcast('TICKET_APPROVAL_RESPONSE', { ... })`.
   - In `toggleSoftPause(show)`: When `show === true`, call `window.miloBus.broadcast('MILO_RESCUE_TRIGGER', { ... })`.
4. **Step 4: URL Parameter Parsing for Multi-Tab Mode**:
   Add role auto-detection on startup:
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const paramRole = urlParams.get('role');
   if (paramRole === 'child' || paramRole === 'parent') {
     setViewMode(paramRole);
   }
   ```
5. **Step 5: Regeneration & Testing**:
   Run `python generate_app.py` to regenerate both `out_index.html` and `index.html`. Verify in browser that dual split mode, multi-tab mode (`?role=parent` and `?role=child`), and state persistence work without errors.
