import json
import re

def main():
    with open('generate_app.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Load 29 tasks JSON from explorer_m1_2
    with open('.agents/teamwork/explorer_m1_2/ingested_task_database.json', 'r', encoding='utf-8') as f:
        tasks_data = json.load(f)

    print(f"Loaded {len(tasks_data)} tasks from ingested_task_database.json")

    # 1. Header Bar: Add #sync-status-indicator after btn-sound-toggle
    sound_btn_needle = """        <!-- Sound Synthesizer Toggle -->
        <button id="btn-sound-toggle" onclick="toggleSound()" class="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition" title="Bật/Tắt âm thanh">
          🔊
        </button>"""
    
    sync_indicator_html = """        <!-- Sound Synthesizer Toggle -->
        <button id="btn-sound-toggle" onclick="toggleSound()" class="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition" title="Bật/Tắt âm thanh">
          🔊
        </button>

        <!-- Live Sync Bus Status Indicator -->
        <div id="sync-status-indicator" class="flex items-center gap-1.5 text-[11px] font-bold bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
          <span class="w-2 h-2 rounded-full bg-teal-400"></span>
          <span class="text-teal-300">WebBus Local (&lt;2ms)</span>
        </div>"""
    
    assert sound_btn_needle in content, "Could not find sound_btn_needle"
    content = content.replace(sound_btn_needle, sync_indicator_html, 1)
    print("1. Inserted sync-status-indicator in presentation header")

    # 2. Child App Modal for Golden Ticket Approval
    child_modal_needle = """                  <div class="w-full space-y-2 pt-1">
                    <button onclick="openRedeemFromTreasure()" class="w-full btn-3d-yellow text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2">
                      <span>🎟️ ĐỔI VÉ VÀNG VỚI BỐ MẸ NGAY!</span>
                    </button>
                    <button onclick="exitTreasureModal()" class="w-full btn-3d-white text-slate-700 font-black py-2.5 rounded-xl text-xs">
                      🏝️ Về lại bản đồ
                    </button>
                  </div>
                </div>
              </div>

            </div>"""

    child_modal_replacement = """                  <div class="w-full space-y-2 pt-1">
                    <button onclick="openRedeemFromTreasure()" class="w-full btn-3d-yellow text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2">
                      <span>🎟️ ĐỔI VÉ VÀNG VỚI BỐ MẸ NGAY!</span>
                    </button>
                    <button onclick="exitTreasureModal()" class="w-full btn-3d-white text-slate-700 font-black py-2.5 rounded-xl text-xs">
                      🏝️ Về lại bản đồ
                    </button>
                  </div>
                </div>
              </div>

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

            </div>"""

    assert child_modal_needle in content, "Could not find child_modal_needle"
    content = content.replace(child_modal_needle, child_modal_replacement, 1)
    print("2. Inserted child-modal-ticket-approved")

    # 3. Parent Praise Card: Add parentSendCheer button
    parent_praise_needle = """                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800">💬 Câu Khen Ngợi Tạo Động Lực (Khen Nỗ Lực):</span>
                    <button onclick="copyParentScript()" class="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      📋 Sao chép
                    </button>
                  </div>"""

    parent_praise_replacement = """                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800">💬 Câu Khen Ngợi Tạo Động Lực (Khen Nỗ Lực):</span>
                    <div class="flex items-center gap-1.5">
                      <button onclick="parentSendCheer()" class="text-[10px] text-white font-bold bg-teal-600 hover:bg-teal-700 px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1 transition active:scale-95">
                        <span>💌</span> <span>Gửi bé</span>
                      </button>
                      <button onclick="copyParentScript()" class="text-[10px] text-teal-600 font-bold bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200">
                        📋 Sao chép
                      </button>
                    </div>
                  </div>"""

    assert parent_praise_needle in content, "Could not find parent_praise_needle"
    content = content.replace(parent_praise_needle, parent_praise_replacement, 1)
    print("3. Added parentSendCheer button in Parent Praise Card")

    # 4. Parent Catalog Filter Pills: Update counts to 29, 15, 5, 5, 4 and add Grade filters
    filter_pills_needle = """                  <!-- Filter Pills: Tất cả, Toán, Tiếng Việt, Tiếng Anh, Sinh Hoạt -->
                  <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-bold">
                    <button onclick="parentFilterCatalog('all')" id="p-cat-all" class="px-2.5 py-1 rounded-xl bg-teal-600 text-white shrink-0">Tất cả (12)</button>
                    <button onclick="parentFilterCatalog('math')" id="p-cat-math" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📐 Toán GDPT (4)</button>
                    <button onclick="parentFilterCatalog('viet')" id="p-cat-viet" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📖 Tiếng Việt (2)</button>
                    <button onclick="parentFilterCatalog('eng')" id="p-cat-eng" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🇬🇧 Tiếng Anh (2)</button>
                    <button onclick="parentFilterCatalog('chore')" id="p-cat-chore" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🧹 Sinh Hoạt (4)</button>
                  </div>"""

    filter_pills_replacement = """                  <!-- Filter Pills: Tất cả, Toán, Tiếng Việt, Tiếng Anh, Sinh Hoạt -->
                  <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-bold">
                    <button onclick="parentFilterCatalog('all')" id="p-cat-all" class="px-2.5 py-1 rounded-xl bg-teal-600 text-white shrink-0">Tất cả (29)</button>
                    <button onclick="parentFilterCatalog('math')" id="p-cat-math" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📐 Toán GDPT (15)</button>
                    <button onclick="parentFilterCatalog('viet')" id="p-cat-viet" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">📖 Tiếng Việt (5)</button>
                    <button onclick="parentFilterCatalog('eng')" id="p-cat-eng" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🇬🇧 Tiếng Anh (5)</button>
                    <button onclick="parentFilterCatalog('chore')" id="p-cat-chore" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0">🧹 Sinh Hoạt (4)</button>
                  </div>

                  <!-- Grade Filters: Lớp 1 -> 5 -->
                  <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-bold">
                    <span class="text-slate-400 text-[9px] shrink-0 font-extrabold mr-0.5">Khối:</span>
                    <button onclick="parentFilterGrade('all')" id="p-grade-all" class="px-2 py-0.5 rounded-lg bg-teal-700 text-white shrink-0 text-[10px]">Tất cả</button>
                    <button onclick="parentFilterGrade(1)" id="p-grade-1" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]">Lớp 1</button>
                    <button onclick="parentFilterGrade(2)" id="p-grade-2" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]">Lớp 2</button>
                    <button onclick="parentFilterGrade(3)" id="p-grade-3" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]">Lớp 3</button>
                    <button onclick="parentFilterGrade(4)" id="p-grade-4" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]">Lớp 4</button>
                    <button onclick="parentFilterGrade(5)" id="p-grade-5" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]">Lớp 5</button>
                  </div>"""

    assert filter_pills_needle in content, "Could not find filter_pills_needle"
    content = content.replace(filter_pills_needle, filter_pills_replacement, 1)
    print("4. Updated Parent Catalog Filter Pills and added Grade Filters")

    # 5. Insert MiloSyncBus class before taskDatabase and replace taskDatabase
    bus_and_taskdb_code = """    /* ============================================================
       0.1 TRI-LAYER HYBRID STATE BUS (MiloSyncBus)
       ============================================================ */
    class MiloSyncBus {
      constructor(options = {}) {
        this.roomId = options.roomId || this._getUrlParam('room') || 'family_room_milo_01';
        this.role = options.role || this._getUrlParam('role') || 'dual'; // 'dual', 'child', 'parent'
        this.clientId = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

        this.channelName = 'milo_quest_sync';
        this.storageEventKey = 'milo_quest_sync_event';
        this.storageStateKey = 'milo_quest_saved_state';
        this.storageStateBackupKey = 'milo_sync_state_v1';

        this.subscribers = new Map();
        this.channel = null;
        this.ws = null;
        this.isWsConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.pingTimer = null;
        this.processedEventIds = new Set();

        // 1. Initialize Layer 2: BroadcastChannel
        this._initBroadcastChannel();

        // 2. Initialize Layer 2 fallback: LocalStorage storage event
        this._initStorageListener();

        // 3. Initialize Layer 3: WebSocket with silent degradation
        this._initWebSocket();
      }

      _getUrlParam(param) {
        if (typeof window === 'undefined' || !window.location) return null;
        try {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(param);
        } catch (e) {
          return null;
        }
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

      on(eventType, callback) {
        return this.subscribe(eventType, callback);
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
              if (envelope.sender_id === this.clientId) return; // Anti-echo
              if (envelope.event_id && this.processedEventIds.has(envelope.event_id)) return; // Anti-duplicate
              if (envelope.event_id) {
                this.processedEventIds.add(envelope.event_id);
                if (this.processedEventIds.size > 200) {
                  const first = this.processedEventIds.values().next().value;
                  this.processedEventIds.delete(first);
                }
              }
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
              if (envelope.sender_id === this.clientId) return; // Anti-echo
              if (envelope.event_id && this.processedEventIds.has(envelope.event_id)) return; // Anti-duplicate
              if (envelope.event_id) {
                this.processedEventIds.add(envelope.event_id);
                if (this.processedEventIds.size > 200) {
                  const first = this.processedEventIds.values().next().value;
                  this.processedEventIds.delete(first);
                }
              }
              this._dispatchLocal(envelope.event_type, envelope.payload, envelope);
            } catch (err) {}
          }
        });
      }

      /* ---------------- Layer 3: WebSocket Auto-Connect & Silent Degradation ---------------- */
      _initWebSocket() {
        const isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
        const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || 'localhost';
        const port = this._getUrlParam('ws_port') || '8000';
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
          if (this.ws && this.isWsConnected && this.ws.readyState === WebSocket.OPEN) {
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

        if (data.event_type === "CONNECTION_ESTABLISHED" || data.event_type === "PONG") {
          return;
        }

        if (data.sender && data.sender === this.clientId) return;

        // Server translated event: Kid step done -> Parent notification
        if (data.event_type === "PARENT_NOTIFICATION_STEP_DONE") {
          this._dispatchLocal("STEP_COMPLETED", {
            stepIndex: data.step_id ? data.step_id - 1 : 0,
            starsEarned: data.points_earned || 40,
            message: data.message
          }, data);
          return;
        }

        // Server translated event: Parent cheer -> Kid receive cheer
        if (data.event_type === "KID_RECEIVE_CHEER") {
          this._dispatchLocal("PARENT_CHEER_SEND", {
            cheerText: data.cheer_text,
            sticker: data.sticker
          }, data);
          return;
        }

        // Standard broadcasted event
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
          event_id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
          sender_id: this.clientId,
          sender_role: this.role,
          room_id: this.roomId,
          timestamp: Date.now(),
          payload: payload
        };

        // Mark as processed locally
        this.processedEventIds.add(envelope.event_id);
        if (this.processedEventIds.size > 200) {
          const first = this.processedEventIds.values().next().value;
          this.processedEventIds.delete(first);
        }

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
        if (this.ws && this.isWsConnected && this.ws.readyState === WebSocket.OPEN) {
          try {
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

      emit(eventType, payload) {
        this.broadcast(eventType, payload);
      }

      /* ---------------- State Persistence API ---------------- */
      savePersistedState(stateSnapshot) {
        try {
          const serialized = JSON.stringify({
            version: 1,
            last_updated: Date.now(),
            stars: stateSnapshot.stars,
            childRoadmap: stateSnapshot.childRoadmap,
            currentRoadmapIndex: stateSnapshot.currentRoadmapIndex,
            currentStepIndex: stateSnapshot.currentStepIndex,
            activeTaskId: stateSnapshot.activeTask ? stateSnapshot.activeTask.id : null,
            pendingTicket: stateSnapshot.pendingTicket || null,
            pauseCount: stateSnapshot.pauseCount || 0,
            totalSessionSeconds: stateSnapshot.totalSessionSeconds || 0,
            selectedCatalogIds: Array.from(stateSnapshot.selectedCatalogIds || [])
          });
          localStorage.setItem(this.storageStateKey, serialized);
          localStorage.setItem(this.storageStateBackupKey, serialized);
        } catch (err) {}
      }

      loadPersistedState() {
        try {
          const data = localStorage.getItem(this.storageStateKey) || localStorage.getItem(this.storageStateBackupKey);
          if (!data) return null;
          return JSON.parse(data);
        } catch (err) {
          return null;
        }
      }

      clearPersistedState() {
        try {
          localStorage.removeItem(this.storageStateKey);
          localStorage.removeItem(this.storageStateBackupKey);
        } catch (err) {}
      }
    }

    /* ============================================================
       0.2 MODAL CONTROLLER & SUBSCRIBERS REGISTRATION
       ============================================================ */
    function showChildTicketApprovedModal(ticketTitle, praiseMessage) {
      const modal = document.getElementById('child-modal-ticket-approved');
      if (!modal) return;
      const nameEl = document.getElementById('child-approved-ticket-name');
      if (nameEl) nameEl.innerText = ticketTitle || "Vé Vàng Của Bé";
      const praiseEl = document.getElementById('child-approved-ticket-praise');
      if (praiseEl && praiseMessage) {
        praiseEl.innerText = `"${praiseMessage}"`;
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      playSfx('success');
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

    /* ============================================================
       A. DATABASE NHIỆM VỤ ĐỀ XUẤT (KHO BĂM SẴN GDPT 2018 & SINH HOẠT - 29 BÀI)
       ============================================================ */
    const taskDatabase = """ + json.dumps(tasks_data, ensure_ascii=False, indent=6) + """;
    taskDatabase['math_garden'] = taskDatabase['G1_MATH_01']; // backwards compatibility alias"""

    old_task_db_regex = r"""    /\* ============================================================
       A\. DATABASE NHIỆM VỤ ĐỀ XUẤT \(KHO BĂM SẴN GDPT 2018 & SINH HOẠT\)
       ============================================================ \*/
    const taskDatabase = \{[\s\S]*?\n    \};"""

    match = re.search(old_task_db_regex, content)
    assert match is not None, "Could not match old_task_db_regex"
    content = content[:match.start()] + bus_and_taskdb_code + content[match.end():]
    print("5. Inserted MiloSyncBus and ingested full 29-task taskDatabase")

    # 6. Update appState
    old_appstate_needle = """    const appState = {
      role: 'dual', // 'dual', 'child', 'parent'
      stars: 450,
      
      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      // Mảng các task được gán từ bố mẹ hoặc mặc định
      childRoadmap: [
        taskDatabase['chore_desk'],   // Đảo 1: Đang làm
        taskDatabase['math_garden']   // Đảo 2: Kế tiếp
      ],
      currentRoadmapIndex: 0, // Đang ở hòn đảo thứ mấy
      
      // Task đang giải quyết trong Focus Cockpit
      activeTask: taskDatabase['chore_desk'],
      currentStepIndex: 0,
      
      // Trạng thái tương tác cụ thể của từng bước
      selectedClues: new Set(),
      cleanedItems: new Set(),
      numpadValue: "",
      
      // Telemetry & Coaching
      pauseCount: 1,
      totalSessionSeconds: 0,
      
      // Parent Batch Selection State
      selectedCatalogIds: new Set(['chore_desk', 'math_garden']),
      catalogFilter: 'all',
      modalTaskKey: 'math_garden'
    };"""

    new_appstate_replacement = """    const appState = {
      role: 'dual', // 'dual', 'child', 'parent'
      stars: 450,
      
      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [
        taskDatabase['chore_desk'],   // Đảo 1: Đang làm
        taskDatabase['G1_MATH_01']    // Đảo 2: Kế tiếp
      ],
      currentRoadmapIndex: 0,
      
      // Task đang giải quyết trong Focus Cockpit
      activeTask: taskDatabase['chore_desk'],
      currentStepIndex: 0,
      
      // Trạng thái tương tác cụ thể của từng bước
      selectedClues: new Set(),
      cleanedItems: new Set(),
      numpadValue: "",
      
      // Telemetry & Coaching
      pauseCount: 1,
      totalSessionSeconds: 0,
      
      // Parent Batch Selection State
      selectedCatalogIds: new Set(['chore_desk', 'G1_MATH_01']),
      catalogFilter: 'all',
      gradeFilter: 'all',
      modalTaskKey: 'G1_MATH_01',
      pendingTicket: null
    };"""

    assert old_appstate_needle in content, "Could not find old_appstate_needle"
    content = content.replace(old_appstate_needle, new_appstate_replacement, 1)
    print("6. Updated appState default roadmap and filter keys")

    # 7. Update startStepTimer telemetry broadcast
    old_timer_needle = """      // Bộ đếm tổng thời gian phiên học
      if (!sessionTimerInterval) {
        sessionTimerInterval = setInterval(() => {
          if (!isTimerPaused) {
            appState.totalSessionSeconds++;
            const formatted = formatTime(appState.totalSessionSeconds);
            document.getElementById('telemetry-duration').innerHTML = `${formatted} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;
          }
        }, 1000);
      }"""

    new_timer_replacement = """      // Bộ đếm tổng thời gian phiên học
      if (!sessionTimerInterval) {
        sessionTimerInterval = setInterval(() => {
          if (!isTimerPaused) {
            appState.totalSessionSeconds++;
            const formatted = formatTime(appState.totalSessionSeconds);
            const durEl = document.getElementById('telemetry-duration');
            if (durEl) durEl.innerHTML = `${formatted} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;

            // Periodic telemetry broadcast every 5s
            if (appState.totalSessionSeconds % 5 === 0 && window.miloBus) {
              window.miloBus.broadcast('STEP_TELEMETRY_UPDATE', {
                taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
                stepIndex: appState.currentStepIndex,
                elapsedSec: appState.totalSessionSeconds,
                totalSteps: appState.activeTask ? appState.activeTask.steps.length : 3,
                status: isTimerPaused ? 'paused' : 'in_progress'
              });
            }
          }
        }, 1000);
      }"""

    assert old_timer_needle in content, "Could not find old_timer_needle"
    content = content.replace(old_timer_needle, new_timer_replacement, 1)
    print("7. Added periodic STEP_TELEMETRY_UPDATE in startStepTimer")

    # 8. Update renderParentTelemetryProgress to set IDs and classes on segments
    old_telemetry_bars_needle = """      for (let i = 0; i < totalSteps; i++) {
        const bar = document.createElement('div');
        bar.className = "h-2 flex-1 rounded-full ";
        if (i < activeStepNum - 1) {
          bar.className += "bg-teal-500";
        } else if (i === activeStepNum - 1) {
          bar.className += "bg-amber-400 animate-pulse";
        } else {
          bar.className += "bg-slate-200";
        }
        barsContainer.appendChild(bar);
      }"""

    new_telemetry_bars_replacement = """      for (let i = 0; i < totalSteps; i++) {
        const bar = document.createElement('div');
        bar.id = `telemetry-progress-segment-${i}`;
        bar.className = "h-2 flex-1 rounded-full ";
        if (i < activeStepNum - 1) {
          bar.className += "bg-emerald-500";
        } else if (i === activeStepNum - 1) {
          bar.className += "bg-amber-400 animate-pulse";
        } else {
          bar.className += "bg-slate-200";
        }
        barsContainer.appendChild(bar);
      }"""

    assert old_telemetry_bars_needle in content, "Could not find old_telemetry_bars_needle"
    content = content.replace(old_telemetry_bars_needle, new_telemetry_bars_replacement, 1)
    print("8. Updated telemetry bars with id telemetry-progress-segment-i and bg-emerald-500")

    # 9. Update renderChildWorkspaceStep to support single_choice, text_input, highlight for the 25 GDPT tasks
    old_generic_stage_needle = """      } else {
        // Generic Micro-Task Stage (Cho các bài GDPT Tiếng Việt, Tiếng Anh, AI hoặc Soạn bằng tay)
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-3xl shadow-sm">
              🎯
            </div>
            <p class="text-xs font-bold text-slate-700 text-center px-2 leading-relaxed">${stepData.text}</p>
            <button onclick="completeGenericStep(this)" class="btn-3d-green px-5 py-3 rounded-2xl font-black text-xs text-white shadow-md active:scale-95 transition">
              ✅ BÉ ĐÃ LÀM XONG BƯỚC NÀY
            </button>
          </div>
        `;
      }"""

    new_generic_stage_replacement = """      } else if ((stepData.ui_type === 'single_choice' || stepData.type === 'single_choice') && stepData.ui_data && stepData.ui_data.options) {
        const opts = stepData.ui_data.options;
        const prompt = stepData.ui_data.prompt_text || stepData.text;
        const expected = stepData.success_criteria ? stepData.success_criteria.expected_answer : null;
        let optHtml = opts.map(opt => `
          <button onclick='handleChildChoice(this, ${JSON.stringify(opt)}, ${JSON.stringify(expected)})' class="w-full btn-3d-white py-2.5 px-3 rounded-2xl font-black text-xs text-slate-800 text-left hover:border-teal-400 transition flex items-center justify-between">
            <span>${opt}</span>
            <span class="text-[10px] text-slate-400 font-normal">Chạm để chọn 👆</span>
          </button>
        `).join('');
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 min-h-[200px] flex flex-col justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <p class="text-xs font-bold text-slate-800 leading-relaxed">${prompt}</p>
            </div>
            <div class="space-y-1.5 my-auto">
              ${optHtml}
            </div>
            <div id="choice-feedback" class="text-[10px] font-bold text-center text-slate-500">
              Chọn đáp án phù hợp nhất để mở khóa bước kế tiếp!
            </div>
          </div>
        `;

      } else if (stepData.ui_type === 'text_input' || stepData.type === 'text_input') {
        const prompt = (stepData.ui_data && stepData.ui_data.prompt_text) || stepData.text;
        const placeholder = (stepData.ui_data && stepData.ui_data.placeholder) || "Nhập câu trả lời của bé...";
        const expected = stepData.success_criteria ? stepData.success_criteria.expected_answer : null;
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 min-h-[200px] flex flex-col justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">✍️</span>
              <p class="text-xs font-bold text-slate-800 leading-relaxed">${prompt}</p>
            </div>
            <div class="my-auto space-y-2">
              <input id="child-stage-text-input" type="text" placeholder="${placeholder}" class="w-full text-center text-sm font-black p-2.5 rounded-2xl border-2 border-teal-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-900" oninput='handleChildTextInput(this.value, ${JSON.stringify(expected)})' />
              <button onclick='handleChildTextInputSubmit(${JSON.stringify(expected)})' class="w-full btn-3d-green py-2 rounded-xl font-black text-xs text-white">
                ✨ XÁC NHẬN ĐÁP SỐ
              </button>
            </div>
            <div id="text-input-feedback" class="text-[10px] font-bold text-center text-slate-500">
              Gợi ý: ${stepData.hints && stepData.hints[0] ? stepData.hints[0] : 'Con hãy điền số hoặc từ thích hợp nhé!'}
            </div>
          </div>
        `;

      } else if (stepData.ui_type === 'highlight' && stepData.ui_data && stepData.ui_data.highlight_target_segments) {
        const segments = stepData.ui_data.highlight_target_segments;
        const prompt = stepData.ui_data.prompt_text || stepData.text;
        let segHtml = segments.map(seg => `
          <button onclick="toggleHighlightSegment(this)" class="highlight-chip btn-3d-white px-2.5 py-1.5 rounded-xl font-bold text-xs text-slate-800">
            ${seg}
          </button>
        `).join(' ');
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 min-h-[200px] flex flex-col justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔍</span>
              <p class="text-xs font-bold text-slate-800 leading-relaxed">${prompt}</p>
            </div>
            <div class="flex flex-wrap gap-1.5 my-auto justify-center">
              ${segHtml}
            </div>
            <button onclick="completeGenericStep(this)" class="btn-3d-green px-4 py-2 rounded-2xl font-black text-xs text-white shadow-md active:scale-95 transition">
              ✅ BÉ ĐÃ GẠCH CHÂN XONG
            </button>
          </div>
        `;

      } else {
        // Generic Micro-Task Stage (Cho các bài GDPT Tiếng Việt, Tiếng Anh, AI hoặc Soạn bằng tay)
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-3xl shadow-sm">
              🎯
            </div>
            <p class="text-xs font-bold text-slate-700 text-center px-2 leading-relaxed">${stepData.text}</p>
            <button onclick="completeGenericStep(this)" class="btn-3d-green px-5 py-3 rounded-2xl font-black text-xs text-white shadow-md active:scale-95 transition">
              ✅ BÉ ĐÃ LÀM XONG BƯỚC NÀY
            </button>
          </div>
        `;
      }"""

    assert old_generic_stage_needle in content, "Could not find old_generic_stage_needle"
    content = content.replace(old_generic_stage_needle, new_generic_stage_replacement, 1)
    print("9. Enhanced renderChildWorkspaceStep with interactive UI widgets")

    # 10. Add companion interactive helper functions right before completeGenericStep
    complete_generic_needle = """    function completeGenericStep(btn) {"""
    interactive_helpers_code = """    function handleChildChoice(btn, chosen, expected) {
      playSfx('tap');
      const isCorrect = !expected || chosen === expected || (Array.isArray(expected) && expected.includes(chosen));
      if (isCorrect) {
        playSfx('star');
        btn.className = "w-full bg-emerald-100 border-2 border-emerald-400 py-2.5 px-3 rounded-2xl font-black text-xs text-emerald-950 flex items-center justify-between";
        const fb = document.getElementById('choice-feedback');
        if (fb) {
          fb.innerText = "Chính xác tuyệt vời! ⭐ Bấm 'Tiếp tục' bên dưới nhé!";
          fb.className = "text-[10px] font-bold text-center text-emerald-700";
        }
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
      } else {
        toggleSoftPause(true);
      }
    }

    function handleChildTextInput(val, expected) {
      const norm = val.trim().toLowerCase();
      const expNorm = expected ? String(expected).trim().toLowerCase() : "";
      if (norm && (norm === expNorm || (Array.isArray(expected) && expected.map(x => String(x).trim().toLowerCase()).includes(norm)))) {
        playSfx('star');
        const fb = document.getElementById('text-input-feedback');
        if (fb) {
          fb.innerText = "Đúng rồi! Bé giỏi quá! ⭐";
          fb.className = "text-[10px] font-bold text-center text-emerald-700";
        }
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
      }
    }

    function handleChildTextInputSubmit(expected) {
      const input = document.getElementById('child-stage-text-input');
      if (!input) return;
      const val = input.value.trim();
      if (!val) return;
      playSfx('star');
      const btnNext = document.getElementById('child-btn-next-step');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      }
      const fb = document.getElementById('text-input-feedback');
      if (fb) {
        fb.innerText = "Đã ghi nhận câu trả lời của bé! ⭐";
        fb.className = "text-[10px] font-bold text-center text-emerald-700";
      }
    }

    function toggleHighlightSegment(btn) {
      playSfx('tap');
      btn.classList.toggle('bg-amber-200');
      btn.classList.toggle('border-amber-400');
      btn.classList.toggle('text-amber-950');
    }

    function completeGenericStep(btn) {"""

    assert complete_generic_needle in content, "Could not find complete_generic_needle"
    content = content.replace(complete_generic_needle, interactive_helpers_code, 1)
    print("10. Inserted interactive step helper functions")

    # 11. Wire completeChildStep to broadcast STEP_COMPLETED, STARS_SYNC, ISLAND_COMPLETED
    old_complete_child_step_needle = """    function completeChildStep() {
      // 1. Phản hồi Dopamine tức thì < 300ms
      playSfx('star');
      spawnStars();
      updateStarsEverywhere(appState.stars + 40);

      const totalSteps = appState.activeTask.steps.length;
      if (appState.currentStepIndex < totalSteps - 1) {
        appState.currentStepIndex++;
        setTimeout(() => { renderChildWorkspaceStep(); }, 250);
      } else {
        // Hoàn thành toàn bộ hòn đảo hiện tại!
        stopStepTimer();
        playSfx('success');
        setTimeout(() => { showCelebration(); }, 300);
      }
    }"""

    new_complete_child_step_replacement = """    function completeChildStep() {
      // 1. Phản hồi Dopamine tức thì < 300ms
      playSfx('star');
      spawnStars();
      const earned = 40;
      const newStars = appState.stars + earned;
      updateStarsEverywhere(newStars);

      const totalSteps = appState.activeTask ? appState.activeTask.steps.length : 3;
      const isFinalStep = appState.currentStepIndex >= totalSteps - 1;

      // Broadcast STEP_COMPLETED & STARS_SYNC
      if (window.miloBus) {
        window.miloBus.broadcast('STEP_COMPLETED', {
          taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
          stepIndex: appState.currentStepIndex,
          totalSteps: totalSteps,
          starsEarned: earned,
          totalStarsNow: newStars,
          isTaskComplete: isFinalStep
        });
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: earned,
          reason: 'step_reward'
        });
      }

      if (!isFinalStep) {
        appState.currentStepIndex++;
        if (window.miloBus) window.miloBus.savePersistedState(appState);
        setTimeout(() => { renderChildWorkspaceStep(); }, 250);
      } else {
        // Hoàn thành toàn bộ hòn đảo hiện tại!
        stopStepTimer();
        playSfx('success');
        if (window.miloBus) {
          window.miloBus.broadcast('ISLAND_COMPLETED', {
            taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
            islandTitle: appState.activeTask ? appState.activeTask.title : 'Đảo Nhiệm Vụ',
            totalStars: newStars,
            nextIslandIndex: appState.currentRoadmapIndex + 1
          });
          window.miloBus.savePersistedState(appState);
        }
        setTimeout(() => { showCelebration(); }, 300);
      }
    }"""

    assert old_complete_child_step_needle in content, "Could not find old_complete_child_step_needle"
    content = content.replace(old_complete_child_step_needle, new_complete_child_step_replacement, 1)
    print("11. Wired completeChildStep to STEP_COMPLETED, STARS_SYNC, ISLAND_COMPLETED")

    # 12. Wire openTreasureCeremony to broadcast TREASURE_UNLOCKED and STARS_SYNC
    old_treasure_needle = """    function openTreasureCeremony() {
      playSfx('success');
      const ceremony = document.getElementById('child-modal-treasure-ceremony');
      ceremony.classList.remove('hidden');
      ceremony.classList.add('flex');
      updateStarsEverywhere(appState.stars + 250);
      showToast("RƯƠNG BÁU HOÀNG KIM!", "Leo đã nhận thêm +250 ⭐ và mở khóa Trạm Vé Vàng!", "👑");
    }"""

    new_treasure_replacement = """    function openTreasureCeremony() {
      playSfx('success');
      const ceremony = document.getElementById('child-modal-treasure-ceremony');
      if (ceremony) {
        ceremony.classList.remove('hidden');
        ceremony.classList.add('flex');
      }
      const newStars = appState.stars + 250;
      updateStarsEverywhere(newStars);
      if (window.miloBus) {
        window.miloBus.broadcast('TREASURE_UNLOCKED', {
          totalStarsEarned: newStars,
          unlockedRewards: ["Huy hiệu Hiệp Sĩ Tập Trung", "Mở khóa Đổi Vé Vàng"]
        });
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: 250,
          reason: 'island_bonus'
        });
        window.miloBus.savePersistedState(appState);
      }
      showToast("RƯƠNG BÁU HOÀNG KIM!", "Leo đã nhận thêm +250 ⭐ và mở khóa Trạm Vé Vàng!", "👑");
    }"""

    assert old_treasure_needle in content, "Could not find old_treasure_needle"
    content = content.replace(old_treasure_needle, new_treasure_replacement, 1)
    print("12. Wired openTreasureCeremony to TREASURE_UNLOCKED and STARS_SYNC")

    # 13. Wire toggleSoftPause to broadcast MILO_RESCUE_TRIGGER
    old_soft_pause_needle = """        appState.pauseCount++;
        document.getElementById('telemetry-pause-count').innerHTML = `${appState.pauseCount} lần <span class="text-emerald-600 font-semibold">(Biết tự điều tiết CBT)</span>`;
        document.getElementById('telemetry-status-badge').innerHTML = "🔋 Tự giác Pause (CBT)";"""

    new_soft_pause_replacement = """        appState.pauseCount++;
        const pCountEl = document.getElementById('telemetry-pause-count');
        if (pCountEl) pCountEl.innerHTML = `${appState.pauseCount} lần <span class="text-emerald-600 font-semibold">(Biết tự điều tiết CBT)</span>`;
        const badgeEl = document.getElementById('telemetry-status-badge');
        if (badgeEl) badgeEl.innerHTML = "🔋 Tự giác Pause (CBT)";

        if (window.miloBus) {
          window.miloBus.broadcast('MILO_RESCUE_TRIGGER', {
            reason: 'user_clicked_rescue',
            stepId: appState.currentStepIndex + 1,
            taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
            pauseCount: appState.pauseCount
          });
          window.miloBus.savePersistedState(appState);
        }"""

    assert old_soft_pause_needle in content, "Could not find old_soft_pause_needle"
    content = content.replace(old_soft_pause_needle, new_soft_pause_replacement, 1)
    print("13. Wired toggleSoftPause to MILO_RESCUE_TRIGGER")

    # 14. Wire childRedeemTicket to broadcast TICKET_REDEEM_REQUEST and STARS_SYNC
    old_child_redeem_needle = """    function childRedeemTicket(name, stars) {
      playSfx('tap');
      if (appState.stars < stars) {
        showToast("Chưa Đủ Sao", `Bạn cần ${stars} ⭐ để đổi món quà này. Cùng làm thêm nhiệm vụ nhé!`, "⭐");
        return;
      }
      playSfx('bell');
      updateStarsEverywhere(appState.stars - stars);
      const btn = document.getElementById('btn-redeem-ticket');
      if (btn) {
        btn.innerText = "⏳ ĐÃ GỬI BỐ MẸ!";
        btn.disabled = true;
      }

      // Kích hoạt banner bên máy Mẹ Realtime
      document.getElementById('parent-golden-ticket-banner').classList.remove('hidden');
      document.getElementById('parent-golden-ticket-done').classList.add('hidden');
      document.getElementById('p-reward-dot').classList.remove('hidden');
      document.getElementById('parent-ticket-desc').innerText = `🎉 Leo vừa dùng ${stars} ⭐ để đổi [Vé Vàng: ${name}]!`;

      showToast("Vé Vàng Đã Gửi", `Yêu cầu đổi [${name}] đã gửi sang máy mẹ Lan để phê duyệt!`, "🎟️");
    }"""

    new_child_redeem_replacement = """    function childRedeemTicket(name, stars) {
      playSfx('tap');
      if (appState.stars < stars) {
        showToast("Chưa Đủ Sao", `Bạn cần ${stars} ⭐ để đổi món quà này. Cùng làm thêm nhiệm vụ nhé!`, "⭐");
        return;
      }
      playSfx('bell');
      const newStars = appState.stars - stars;
      updateStarsEverywhere(newStars);
      const btn = document.getElementById('btn-redeem-ticket');
      if (btn) {
        btn.innerText = "⏳ ĐÃ GỬI BỐ MẸ!";
        btn.disabled = true;
      }

      const ticketPayload = {
        ticketId: 'ticket_' + Date.now(),
        title: name,
        cost: stars,
        remainingStars: newStars
      };
      appState.pendingTicket = ticketPayload;

      // Broadcast TICKET_REDEEM_REQUEST & STARS_SYNC
      if (window.miloBus) {
        window.miloBus.broadcast('TICKET_REDEEM_REQUEST', ticketPayload);
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: -stars,
          reason: 'ticket_deduct'
        });
        window.miloBus.savePersistedState(appState);
      }

      // Kích hoạt banner bên máy Mẹ Realtime (nếu ở single-tab dual mode)
      const banner = document.getElementById('parent-golden-ticket-banner');
      const doneBanner = document.getElementById('parent-golden-ticket-done');
      const dot = document.getElementById('p-reward-dot');
      const desc = document.getElementById('parent-ticket-desc');
      if (banner) banner.classList.remove('hidden');
      if (doneBanner) doneBanner.classList.add('hidden');
      if (dot) dot.classList.remove('hidden');
      if (desc) desc.innerText = `🎉 Leo vừa dùng ${stars} ⭐ để đổi [Vé Vàng: ${name}]!`;

      showToast("Vé Vàng Đã Gửi", `Yêu cầu đổi [${name}] đã gửi sang máy mẹ Lan để phê duyệt!`, "🎟️");
    }"""

    assert old_child_redeem_needle in content, "Could not find old_child_redeem_needle"
    content = content.replace(old_child_redeem_needle, new_child_redeem_replacement, 1)
    print("14. Wired childRedeemTicket to TICKET_REDEEM_REQUEST and STARS_SYNC")

    # 15. Update renderParentCatalogList with deduplication, grade filtering, and data-task-id
    old_catalog_render_needle = """    function renderParentCatalogList() {
      const container = document.getElementById('catalog-tasks-list');
      container.innerHTML = '';

      const filter = appState.catalogFilter;
      const tasks = Object.values(taskDatabase);

      tasks.forEach(t => {
        if (filter !== 'all' && t.cat !== filter) return;

        const isChecked = appState.selectedCatalogIds.has(t.id);
        const card = document.createElement('div');
        card.className = `bg-white rounded-2xl p-3 shadow-xs border transition flex items-center justify-between gap-2.5 ${isChecked ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200'}`;
        card.innerHTML = `
          <div class="flex items-center gap-2.5 flex-1 cursor-pointer" onclick="parentOpenTaskModal('${t.id}')">
            <span class="text-2xl">${t.icon || '📚'}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${t.cat === 'math' ? 'bg-amber-100 text-amber-800' : t.cat === 'viet' ? 'bg-rose-100 text-rose-800' : t.cat === 'eng' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}">
                  ${t.catName}
                </span>
                <span class="text-[10px] text-teal-600 font-bold">Xem bước →</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs truncate">${t.title}</h4>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                <span class="font-bold text-teal-700">${t.steps.length} Micro-tasks</span>
                <span>•</span>
                <span class="font-bold text-amber-600">+${t.reward} ⭐</span>
              </div>
            </div>
          </div>
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCatalogItem('${t.id}', this.checked)" class="w-5 h-5 accent-teal-600 cursor-pointer shrink-0" />
        `;
        container.appendChild(card);
      });

      updateBatchSummaryUI();
    }"""

    new_catalog_render_replacement = """    function renderParentCatalogList() {
      const container = document.getElementById('catalog-tasks-list');
      if (!container) return;
      container.innerHTML = '';

      const catFilter = appState.catalogFilter || 'all';
      const gradeFilter = appState.gradeFilter || 'all';

      // Deduplicate aliases (e.g. math_garden -> G1_MATH_01)
      const taskMap = new Map();
      Object.values(taskDatabase).forEach(t => {
        if (t && t.id) taskMap.set(t.id, t);
      });
      const tasks = Array.from(taskMap.values());

      tasks.forEach(t => {
        if (catFilter !== 'all' && t.cat !== catFilter) return;
        if (gradeFilter !== 'all' && t.grade !== gradeFilter) return;

        const isChecked = appState.selectedCatalogIds.has(t.id);
        const card = document.createElement('div');
        card.setAttribute('data-task-id', t.id);
        card.className = `bg-white rounded-2xl p-3 shadow-xs border transition flex items-center justify-between gap-2.5 ${isChecked ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200'}`;
        card.innerHTML = `
          <div class="flex items-center gap-2.5 flex-1 cursor-pointer" onclick="parentOpenTaskModal('${t.id}')">
            <span class="text-2xl">${t.icon || '📚'}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span class="text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${t.cat === 'math' ? 'bg-amber-100 text-amber-800' : t.cat === 'viet' ? 'bg-rose-100 text-rose-800' : t.cat === 'eng' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}">
                  ${t.catName}
                </span>
                <span class="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                  Lớp ${t.grade || 1}
                </span>
                <span class="text-[10px] text-teal-600 font-bold ml-auto">Xem bước →</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs truncate">${t.title}</h4>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                <span class="font-bold text-teal-700">${t.steps.length} Micro-tasks</span>
                <span>•</span>
                <span class="font-bold text-amber-600">+${t.reward} ⭐</span>
                <span>•</span>
                <span>~${Math.round(((t.stepSeconds || 60) * t.steps.length) / 60)} phút</span>
              </div>
            </div>
          </div>
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCatalogItem('${t.id}', this.checked)" class="w-5 h-5 accent-teal-600 cursor-pointer shrink-0" />
        `;
        container.appendChild(card);
      });

      updateBatchSummaryUI();
    }

    function parentFilterGrade(grade) {
      playSfx('tap');
      appState.gradeFilter = grade;
      ['all', 1, 2, 3, 4, 5].forEach(g => {
        const btn = document.getElementById(`p-grade-${g}`);
        if (btn) {
          if (g === grade) {
            btn.className = "px-2 py-0.5 rounded-lg bg-teal-700 text-white shrink-0 text-[10px]";
          } else {
            btn.className = "px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px]";
          }
        }
      });
      renderParentCatalogList();
    }"""

    assert old_catalog_render_needle in content, "Could not find old_catalog_render_needle"
    content = content.replace(old_catalog_render_needle, new_catalog_render_replacement, 1)
    print("15. Updated renderParentCatalogList and added parentFilterGrade")

    # 16. Update selectAllCatalog to use deduplicated task IDs
    old_select_all_needle = """    function selectAllCatalog(selectAll) {
      playSfx('tap');
      if (selectAll) {
        Object.keys(taskDatabase).forEach(k => appState.selectedCatalogIds.add(k));
      } else {
        appState.selectedCatalogIds.clear();
      }
      renderParentCatalogList();
    }"""

    new_select_all_replacement = """    function selectAllCatalog(selectAll) {
      playSfx('tap');
      if (selectAll) {
        const taskMap = new Map();
        Object.values(taskDatabase).forEach(t => {
          if (t && t.id) taskMap.set(t.id, t);
        });
        taskMap.forEach(t => appState.selectedCatalogIds.add(t.id));
      } else {
        appState.selectedCatalogIds.clear();
      }
      renderParentCatalogList();
    }"""

    assert old_select_all_needle in content, "Could not find old_select_all_needle"
    content = content.replace(old_select_all_needle, new_select_all_replacement, 1)
    print("16. Updated selectAllCatalog with deduplicated task IDs")

    # 17. Wire dispatchSelectedCatalogTasks to broadcast TASK_ASSIGN_BATCH
    old_dispatch_batch_needle = """    // BẮN LÔ BÀI TẬP ĐÃ CHỌN SANG MÁY CON TẠO LỘ TRÌNH ĐẢO
    function dispatchSelectedCatalogTasks() {
      playSfx('bell');
      const selectedTasks = Array.from(appState.selectedCatalogIds).map(id => taskDatabase[id]).filter(Boolean);
      if (selectedTasks.length === 0) {
        alert("Vui lòng tick chọn ít nhất 1 bài tập!");
        return;
      }

      // Đẩy mảng bài tập thành lộ trình đảo của Bé
      appState.childRoadmap = selectedTasks;
      appState.currentRoadmapIndex = 0;
      appState.activeTask = selectedTasks[0];

      // Cập nhật giao diện bên máy Con
      renderChildIslandRoadmap();
      childSwitchScreen('home');

      showToast("Lộ Trình Đảo Đã Cập Nhật", `Mẹ vừa giao lô ${selectedTasks.length} bài tập sang hải trình của Leo!`, "🚀");
    }"""

    new_dispatch_batch_replacement = """    // BẮN LÔ BÀI TẬP ĐÃ CHỌN SANG MÁY CON TẠO LỘ TRÌNH ĐẢO
    function dispatchSelectedCatalogTasks() {
      playSfx('bell');
      const selectedTasks = Array.from(appState.selectedCatalogIds).map(id => taskDatabase[id]).filter(Boolean);
      if (selectedTasks.length === 0) {
        alert("Vui lòng tick chọn ít nhất 1 bài tập!");
        return;
      }

      // Broadcast TASK_ASSIGN_BATCH via MiloSyncBus
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: selectedTasks,
          islandName: `Hải Trình ${selectedTasks.length} Đảo Tri Thức`,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = selectedTasks;
        appState.currentRoadmapIndex = 0;
        appState.activeTask = selectedTasks[0];
        renderChildIslandRoadmap();
        childSwitchScreen('home');
      }

      showToast("Lộ Trình Đảo Đã Cập Nhật", `Mẹ vừa giao lô ${selectedTasks.length} bài tập sang hải trình của Leo!`, "🚀");
    }"""

    assert old_dispatch_batch_needle in content, "Could not find old_dispatch_batch_needle"
    content = content.replace(old_dispatch_batch_needle, new_dispatch_batch_replacement, 1)
    print("17. Wired dispatchSelectedCatalogTasks to TASK_ASSIGN_BATCH")

    # 18. Wire parentDispatchActiveModalTask, parentDispatchAiTask, parentDispatchManualTask
    old_modal_dispatch_needle = """        // Cập nhật hải trình máy con: Đưa task này lên đầu
        appState.childRoadmap = [task];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = task;
        renderChildIslandRoadmap();
        childSwitchScreen('home');

        showToast("Nhiệm Vụ Mới Nhận", `Mẹ vừa giao: ${task.title} (${task.steps.length} bước)`, "🚀");"""

    new_modal_dispatch_replacement = """        // Cập nhật hải trình máy con
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: [task],
            islandName: `Đảo Thử Thách: ${task.title}`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = [task];
          appState.currentRoadmapIndex = 0;
          appState.activeTask = task;
          renderChildIslandRoadmap();
          childSwitchScreen('home');
        }

        showToast("Nhiệm Vụ Mới Nhận", `Mẹ vừa giao: ${task.title} (${task.steps.length} bước)`, "🚀");"""

    assert old_modal_dispatch_needle in content, "Could not find old_modal_dispatch_needle"
    content = content.replace(old_modal_dispatch_needle, new_modal_dispatch_replacement, 1)

    old_ai_dispatch_needle = """      // Đăng ký vào database & gán vào lộ trình máy con
      taskDatabase[activeGeneratedAiTask.id] = activeGeneratedAiTask;
      appState.childRoadmap = [activeGeneratedAiTask];
      appState.currentRoadmapIndex = 0;
      appState.activeTask = activeGeneratedAiTask;

      renderChildIslandRoadmap();
      childSwitchScreen('home');

      showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của con!`, "🚀");"""

    new_ai_dispatch_replacement = """      // Đăng ký vào database & gán vào lộ trình máy con
      taskDatabase[activeGeneratedAiTask.id] = activeGeneratedAiTask;
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: [activeGeneratedAiTask],
          islandName: activeGeneratedAiTask.title,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = [activeGeneratedAiTask];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = activeGeneratedAiTask;
        renderChildIslandRoadmap();
        childSwitchScreen('home');
      }

      showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của con!`, "🚀");"""

    assert old_ai_dispatch_needle in content, "Could not find old_ai_dispatch_needle"
    content = content.replace(old_ai_dispatch_needle, new_ai_dispatch_replacement, 1)

    old_manual_dispatch_needle = """      taskDatabase[customTask.id] = customTask;
      appState.childRoadmap = [customTask];
      appState.currentRoadmapIndex = 0;
      appState.activeTask = customTask;

      renderChildIslandRoadmap();
      childSwitchScreen('home');

      showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "✍️");"""

    new_manual_dispatch_replacement = """      taskDatabase[customTask.id] = customTask;
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: [customTask],
          islandName: customTask.title,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = [customTask];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = customTask;
        renderChildIslandRoadmap();
        childSwitchScreen('home');
      }

      showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "✍️");"""

    assert old_manual_dispatch_needle in content, "Could not find old_manual_dispatch_needle"
    content = content.replace(old_manual_dispatch_needle, new_manual_dispatch_replacement, 1)
    print("18. Wired modal, AI, and manual dispatches to TASK_ASSIGN_BATCH")

    # 19. Wire parentApproveTicket to broadcast TICKET_APPROVAL_RESPONSE and define parentSendCheer
    old_approve_needle = """    function parentApproveTicket() {
      playSfx('success');
      document.getElementById('parent-golden-ticket-banner').classList.add('hidden');
      document.getElementById('parent-golden-ticket-done').classList.remove('hidden');
      
      showToast("Đã Duyệt Vé Vàng!", "Lời khen ngợi và phê duyệt đã bắn ngay sang điện thoại của Leo!", "🎉");
    }"""

    new_approve_replacement = """    function parentApproveTicket() {
      playSfx('success');
      const banner = document.getElementById('parent-golden-ticket-banner');
      const doneBanner = document.getElementById('parent-golden-ticket-done');
      if (banner) banner.classList.add('hidden');
      if (doneBanner) doneBanner.classList.remove('hidden');

      const ticketTitle = appState.pendingTicket ? appState.pendingTicket.title : "30 phút chơi Lego cùng mẹ Lan";
      const praiseMsg = "Mẹ rất tự hào về sự kiên trì vượt các đảo hôm nay của Leo!";

      // Broadcast TICKET_APPROVAL_RESPONSE
      if (window.miloBus) {
        window.miloBus.broadcast('TICKET_APPROVAL_RESPONSE', {
          ticketId: appState.pendingTicket ? appState.pendingTicket.ticketId : 'ticket_01',
          title: ticketTitle,
          approved: true,
          praiseMessage: praiseMsg
        });
        appState.pendingTicket = null;
        window.miloBus.savePersistedState(appState);
      }

      showToast("Đã Duyệt Vé Vàng!", "Lời khen ngợi và phê duyệt đã bắn ngay sang điện thoại của Leo!", "🎉");
    }

    function parentSendCheer(customText) {
      playSfx('tap');
      const scriptEl = document.getElementById('parent-praise-script');
      const text = customText || (scriptEl ? scriptEl.innerText : "") || "Mẹ rất tự hào về sự kiên trì của con!";
      if (window.miloBus) {
        window.miloBus.broadcast('PARENT_CHEER_SEND', {
          cheerText: text,
          sticker: 'milo_thumbs_up'
        });
      }
      showToast("Đã Gửi Lời Khen", "Lời khen ngợi nỗ lực đã xuất hiện trên buồng lái của Leo! ❤️", "💌");
    }"""

    assert old_approve_needle in content, "Could not find old_approve_needle"
    content = content.replace(old_approve_needle, new_approve_replacement, 1)
    print("19. Wired parentApproveTicket to TICKET_APPROVAL_RESPONSE and added parentSendCheer")

    # 20. Update DOMContentLoaded
    old_dom_loaded_needle = """    /* ============================================================
       N. KHỞI TẠO MẶC ĐỊNH KHI TẢI TRANG
       ============================================================ */
    window.addEventListener('DOMContentLoaded', () => {
      // Khởi tạo danh sách catalog bên mẹ
      renderParentCatalogList();
      // Khởi tạo lộ trình đảo bên máy con
      renderChildIslandRoadmap();
    });"""

    new_dom_loaded_replacement = """    /* ============================================================
       N. KHỞI TẠO MẶC ĐỊNH KHI TẢI TRANG
       ============================================================ */
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Khởi tạo MiloSyncBus toàn cục
      window.miloBus = new MiloSyncBus();
      registerMiloSyncSubscribers(window.miloBus);

      // 2. Phục hồi trạng thái lưu trữ nếu có (LocalStorage State Hydration)
      const saved = window.miloBus.loadPersistedState();
      if (saved) {
        if (saved.stars !== undefined) {
          appState.stars = saved.stars;
          updateStarsEverywhere(saved.stars);
        }
        if (saved.childRoadmap && Array.isArray(saved.childRoadmap) && saved.childRoadmap.length > 0) {
          appState.childRoadmap = saved.childRoadmap;
        }
        if (saved.currentRoadmapIndex !== undefined && saved.currentRoadmapIndex < appState.childRoadmap.length) {
          appState.currentRoadmapIndex = saved.currentRoadmapIndex;
          appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex];
        }
        if (saved.currentStepIndex !== undefined) {
          appState.currentStepIndex = saved.currentStepIndex;
        }
        if (saved.pauseCount !== undefined) {
          appState.pauseCount = saved.pauseCount;
        }
        if (saved.totalSessionSeconds !== undefined) {
          appState.totalSessionSeconds = saved.totalSessionSeconds;
        }
        if (saved.pendingTicket) {
          appState.pendingTicket = saved.pendingTicket;
          const banner = document.getElementById('parent-golden-ticket-banner');
          const redDot = document.getElementById('p-reward-dot');
          const desc = document.getElementById('parent-ticket-desc');
          if (banner) banner.classList.remove('hidden');
          if (redDot) redDot.classList.remove('hidden');
          if (desc) desc.innerText = `🎉 Leo vừa dùng ${saved.pendingTicket.cost} ⭐ để đổi [Vé Vàng: ${saved.pendingTicket.title}]!`;
        }
      }

      // 3. URL Parameter role auto-switch (?role=child, ?role=parent, ?role=dual)
      const urlParams = new URLSearchParams(window.location.search);
      const paramRole = urlParams.get('role');
      if (paramRole === 'child' || paramRole === 'parent' || paramRole === 'dual') {
        setViewMode(paramRole);
        window.miloBus.role = paramRole;
      }

      // 4. Khởi tạo danh sách catalog bên mẹ
      renderParentCatalogList();
      // 5. Khởi tạo lộ trình đảo bên máy con
      renderChildIslandRoadmap();
    });"""

    assert old_dom_loaded_needle in content, "Could not find old_dom_loaded_needle"
    content = content.replace(old_dom_loaded_needle, new_dom_loaded_replacement, 1)
    print("20. Updated DOMContentLoaded with MiloSyncBus init, hydration, and URL role routing")

    with open('generate_app.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully wrote updated generate_app.py!")

if __name__ == '__main__':
    main()
