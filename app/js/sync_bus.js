/* ============================================================
   MODULE: TRI-LAYER HYBRID STATE BUS (MiloSyncBus)
   ============================================================ */
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
        if (data.event_type === "CONNECTION_ESTABLISHED" || data.event_type === "ROOM_STATE_HYDRATE") {
          if (data.state && typeof applyServerRoomState === 'function') {
            applyServerRoomState(data.state);
          }
          return;
        }

        if (data.event_type === "PONG") {
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
          const cheerMsg = data.cheer_text || data.message || "Bố mẹ rất tự hào về sự kiên trì của con!";
          this._dispatchLocal("PARENT_CHEER_SEND", {
            cheerText: cheerMsg,
            message: cheerMsg,
            sticker: data.sticker || "milo_thumbs_up"
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
              const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
              this.ws.send(JSON.stringify({
                event_type: "PARENT_CHEER",
                cheer_text: cheerMsg,
                message: cheerMsg,
                sticker: (payload && payload.sticker) || "milo_thumbs_up",
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
       0.15 SERVER-AUTHORITATIVE STATE HYDRATION (WEBSOCKET DRIVEN)
       ============================================================ */
    function applyServerRoomState(state) {
      if (!state || typeof state !== 'object') return;
      if (typeof appState === 'undefined') return;

      if (state.stars !== undefined && typeof updateStarsEverywhere === 'function') {
        appState.stars = state.stars;
        updateStarsEverywhere(state.stars);
      }

      if (Array.isArray(state.child_roadmap) && state.child_roadmap.length > 0) {
        const validTasks = state.child_roadmap.filter(t => (
          t && typeof t === 'object' && t.id && Array.isArray(t.steps) && t.steps.length > 0
        ));
        if (validTasks.length > 0) {
          appState.childRoadmap = validTasks;
        }
      }

      if (state.current_roadmap_index !== undefined && state.current_roadmap_index >= 0) {
        const maxIdx = Math.max(0, (appState.childRoadmap || []).length - 1);
        appState.currentRoadmapIndex = Math.min(state.current_roadmap_index, maxIdx);
      }

      if (appState.childRoadmap && appState.childRoadmap.length > 0) {
        appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex] || appState.childRoadmap[0];
      }

      if (state.current_step_index !== undefined && state.current_step_index >= 0) {
        appState.currentStepIndex = state.current_step_index;
      }

      if (state.pending_ticket) {
        appState.pendingTicket = state.pending_ticket;
        const banner = document.getElementById('parent-golden-ticket-banner');
        const redDot = document.getElementById('p-reward-dot');
        const desc = document.getElementById('parent-ticket-desc');
        if (banner) banner.classList.remove('hidden');
        if (redDot) redDot.classList.remove('hidden');
        if (desc) desc.innerText = `🎉 Leo vừa dùng ${state.pending_ticket.cost || 500} ⭐ để đổi [Vé Vàng: ${state.pending_ticket.title}]!`;
      } else {
        appState.pendingTicket = null;
        const banner = document.getElementById('parent-golden-ticket-banner');
        const redDot = document.getElementById('p-reward-dot');
        if (banner) banner.classList.add('hidden');
        if (redDot) redDot.classList.add('hidden');
      }

      if (typeof renderChildIslandRoadmap === 'function') {
        renderChildIslandRoadmap();
      }
      if (typeof renderParentActiveRoadmapList === 'function') {
        renderParentActiveRoadmapList();
      }
    }
    if (typeof window !== 'undefined') { window.applyServerRoomState = applyServerRoomState; }

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
      // 0. ROADMAP_UPDATED: Parent deletes/clears islands -> Child updates immediately
      bus.subscribe('ROADMAP_UPDATED', (payload) => {
        if (!payload) return;
        appState.childRoadmap = Array.isArray(payload.roadmap) ? payload.roadmap : [];
        appState.currentRoadmapIndex = (typeof payload.currentIdx === 'number') ? payload.currentIdx : 0;
        appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex] || null;
        appState.currentStepIndex = 0;
        renderChildIslandRoadmap();
      // 5b. Khởi tạo bảng quản lý hải trình bên máy mẹ
      renderParentActiveRoadmapList();
        renderParentActiveRoadmapList();
        bus.savePersistedState(appState);
      });

      // 1. TASK_ASSIGN_BATCH: Parent dispatches -> Child renders Island Roadmap
      bus.subscribe('TASK_ASSIGN_BATCH', (payload) => {
        if (!payload || !payload.tasks || !Array.isArray(payload.tasks) || payload.tasks.length === 0) return;
        const validBatch = payload.tasks.filter(t => (
          t &&
          typeof t === 'object' &&
          t.id &&
          Array.isArray(t.steps) &&
          t.steps.length > 0
        ));
        if (validBatch.length === 0) return;

        appState.childRoadmap = validBatch;
        appState.currentRoadmapIndex = 0;
        appState.activeTask = validBatch[0];
        appState.currentStepIndex = 0;

        renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        childSwitchScreen('home');
        bus.savePersistedState(appState);
        showToast("Hải Trình Mới Sẵn Sàng!", `Mẹ vừa giao ${validBatch.length} đảo thử thách!`, "🏝️");
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
        if (typeof updateParentCoachInsights === 'function' && appState.activeTask) {
          updateParentCoachInsights(appState.activeTask, activeNum - 1, payload);
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
        const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
        const speechEl = document.getElementById('child-milo-speech');
        if (speechEl) {
          speechEl.innerText = `👩 Mẹ nhắn: "${cheerMsg}" ❤️`;
          if (speechEl.parentElement) {
            speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
            setTimeout(() => {
              if (speechEl.parentElement) speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
            }, 4000);
          }
        }
        showToast("Lời Khen Của Mẹ", cheerMsg, "❤️");
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

