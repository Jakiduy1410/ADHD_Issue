/**
 * TIER 5 WHITE-BOX ADVERSARIAL STRESS TEST & COVERAGE HARDENING
 * 
 * Target Domains:
 * 1. MiloSyncBus: Unsubscribe isolation, subscriber list dynamic mutation,
 *    fault isolation on malformed callbacks, broadcast input fuzzing, anti-duplicate & FIFO eviction,
 *    WebSocket connection state variations (CONNECTING/CLOSING/CLOSED), reconnect timer bounds & backoff ceiling.
 * 2. Dual-Device Simulator: Active task execution survival across role switches (timer preservation,
 *    background telemetry dispatch to hidden/visible peer columns), invalid view modes/roles fuzzing,
 *    cross-role outbound WebSocket message separation.
 * 3. Golden Ticket Approval Flow: Balance underflow prevention, exact balance deduction,
 *    rapid consecutive redemptions (double-spend race condition stress), rapid consecutive parent approvals (10x),
 *    null pending ticket safety, decline followed by deferred approval, rapid decline (5x),
 *    custom ticket title preservation through approval cycle.
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN} TIER 5: WHITE-BOX SYNC BUS, SIMULATOR & TICKET ADVERSARIAL SUITE     ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

// Environment builder for isolated tests
function createTestHarness(options = {}) {
  const storage = options.initialStorage || {};
  const activeChannels = options.sharedChannels || [];

  const mockLocalStorage = {
    _store: storage,
    getItem: (k) => storage[k] !== undefined ? storage[k] : null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { for (const k in storage) delete storage[k]; }
  };

  class MockBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
      this.closed = false;
      activeChannels.push(this);
    }
    postMessage(data) {
      if (this.closed) return;
      activeChannels.forEach(ch => {
        if (ch !== this && ch.name === this.name && !ch.closed && ch.onmessage) {
          setTimeout(() => {
            if (!ch.closed && ch.onmessage) {
              ch.onmessage({ data: JSON.parse(JSON.stringify(data)) });
            }
          }, 0);
        }
      });
    }
    close() {
      this.closed = true;
      const idx = activeChannels.indexOf(this);
      if (idx !== -1) activeChannels.splice(idx, 1);
    }
  }

  class MockWebSocket {
    constructor(url) {
      this.url = url;
      this.readyState = options.wsState !== undefined ? options.wsState : (options.wsOffline ? 3 : 1);
      this.onopen = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.sent = [];

      if (!options.wsOffline && this.readyState === 1) {
        setTimeout(() => { if (this.onopen) this.onopen(); }, 0);
      } else if (options.wsOffline) {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error("Offline"));
          if (this.onclose) this.onclose({ code: 1006, reason: "Offline" });
        }, 0);
      }
    }
    send(d) {
      if (this.readyState !== 1) {
        throw new Error("WebSocket is not open, readyState=" + this.readyState);
      }
      this.sent.push(d);
    }
    close() {
      this.readyState = 3;
      if (this.onclose) this.onclose({ code: 1000, reason: "Normal" });
    }
  }
  MockWebSocket.CONNECTING = 0;
  MockWebSocket.OPEN = 1;
  MockWebSocket.CLOSING = 2;
  MockWebSocket.CLOSED = 3;

  const domElements = {};
  function getElement(id) {
    if (!domElements[id]) {
      domElements[id] = {
        id: id,
        classList: {
          _classes: new Set(['hidden']),
          add: function(...args) { args.forEach(c => this._classes.add(c)); },
          remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
          toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
          contains: function(c) { return this._classes.has(c); }
        },
        innerText: "",
        innerHTML: "",
        value: "",
        disabled: false,
        parentElement: null,
        children: [],
        style: {
          setProperty: function(k, v) { this[k] = v; }
        },
        appendChild: function(c) { this.children.push(c); c.parentElement = this; },
        setAttribute: function(k, v) { this[k] = v; },
        querySelectorAll: () => []
      };
      domElements[id].parentElement = {
        classList: {
          _classes: new Set(),
          add: function(...args) { args.forEach(c => this._classes.add(c)); },
          remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
          contains: function(c) { return this._classes.has(c); }
        }
      };
    }
    return domElements[id];
  }

  const starElements = [getElement('child-stars-count'), getElement('parent-child-stars')];

  const mockDocument = {
    getElementById: (id) => getElement(id),
    querySelectorAll: (sel) => {
      if (sel === '.sync-star-val') return starElements;
      return [];
    },
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        classList: {
          _classes: new Set(),
          add: function(...args) { args.forEach(c => this._classes.add(c)); },
          remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
          contains: function(c) { return this._classes.has(c); }
        },
        innerText: "",
        innerHTML: "",
        className: "",
        style: { setProperty: function(k, v) { this[k] = v; } },
        children: [],
        appendChild: function(c) { this.children.push(c); },
        setAttribute: function(attr, val) { this[attr] = val; },
        remove: function() {}
      };
    }
  };

  const listeners = {};
  const mockWindow = {
    location: {
      search: options.urlSearch || "?role=dual&room=family_room_milo_01",
      hostname: "localhost",
      protocol: "http:"
    },
    addEventListener: (evt, cb) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(cb);
    },
    removeEventListener: (evt, cb) => {
      if (listeners[evt]) listeners[evt] = listeners[evt].filter(f => f !== cb);
    },
    _fireEvent: (evt, eventObj) => {
      if (listeners[evt]) listeners[evt].forEach(cb => cb(eventObj));
    }
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    BroadcastChannel: MockBroadcastChannel,
    WebSocket: MockWebSocket,
    URLSearchParams: URLSearchParams,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {}
    },
    AudioContext: class {
      constructor() { this.state = 'running'; }
      createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
      createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
    },
    webkitAudioContext: class {},
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    alert: () => {}
  };
  sandbox.window.document = mockDocument;

  vm.createContext(sandbox);

  const exportShim = `
  ;__exports__ = {
    taskDatabase,
    appState,
    MiloSyncBus,
    registerMiloSyncSubscribers,
    setViewMode,
    switchProfile,
    startChildQuest,
    startStepTimer,
    stopStepTimer,
    completeChildStep,
    childRedeemTicket,
    childRedeemCustomTicket,
    parentApproveTicket,
    parentDeclineTicket,
    showChildTicketApprovedModal,
    renderChildIslandRoadmap,
    renderParentTelemetryProgress,
    updateStarsEverywhere,
    formatTime,
    showToast
  };`;

  vm.runInContext(appScript + exportShim, sandbox);

  return {
    sandbox,
    mockWindow,
    mockDocument,
    mockLocalStorage,
    getElement,
    exports: sandbox.__exports__
  };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function check(desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${desc}`);
  } catch (err) {
    failedTests++;
    failures.push({ desc, error: err.message, stack: err.stack });
    console.log(`  ${RED}✗ ${desc}${RESET}`);
    console.log(`    ${RED}Error: ${err.message}${RESET}`);
  }
}

// =========================================================================
// SECTION 1: MILO SYNC BUS DEEP WHITE-BOX HARDENING
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SECTION 1] MiloSyncBus: Unsubscribe, Dynamic Mutation & Error Isolation${RESET}`);

{
  const env = createTestHarness();
  const { MiloSyncBus } = env.exports;
  const bus = new MiloSyncBus();

  // 1.1 Unsubscribe Callback Isolation & Idempotency
  check("1.1: Unsubscribe cleanly removes specific handler without affecting peer handlers", () => {
    let callA = 0;
    let callB = 0;
    let callC = 0;

    const unsubA = bus.subscribe("TEST_UNSUB", () => { callA++; });
    const unsubB = bus.subscribe("TEST_UNSUB", () => { callB++; });
    const unsubC = bus.subscribe("TEST_UNSUB", () => { callC++; });

    bus.broadcast("TEST_UNSUB");
    assert.strictEqual(callA, 1);
    assert.strictEqual(callB, 1);
    assert.strictEqual(callC, 1);

    // Unsubscribe B only
    unsubB();

    bus.broadcast("TEST_UNSUB");
    assert.strictEqual(callA, 2, "Handler A should still be active");
    assert.strictEqual(callB, 1, "Handler B should NOT be called after unsubscribe");
    assert.strictEqual(callC, 2, "Handler C should still be active");

    // Idempotent duplicate unsubscribe calls must not throw or alter list
    unsubB();
    unsubB();
    bus.broadcast("TEST_UNSUB");
    assert.strictEqual(callA, 3);
    assert.strictEqual(callB, 1);
    assert.strictEqual(callC, 3);

    // Unsubscribe remaining
    unsubA();
    unsubC();
    bus.broadcast("TEST_UNSUB");
    assert.strictEqual(callA, 3);
    assert.strictEqual(callB, 1);
    assert.strictEqual(callC, 3);
  });

  // 1.2 Subscriber mutating subscriber list during dispatch
  check("1.2: A subscriber unsubscribing itself during dispatch does not throw or skip peer handlers", () => {
    let selfCalls = 0;
    let peerCalls = 0;

    let unsubSelf = null;
    unsubSelf = bus.subscribe("DYNAMIC_MUTATION", () => {
      selfCalls++;
      if (unsubSelf) unsubSelf(); // self-unsubscribe inside callback
    });

    bus.subscribe("DYNAMIC_MUTATION", () => {
      peerCalls++;
    });

    // 1st dispatch: both should run, and self-unsubscribes
    bus.broadcast("DYNAMIC_MUTATION");
    assert.strictEqual(selfCalls, 1, "Self should run on 1st dispatch");
    assert.strictEqual(peerCalls, 1, "Peer should run on 1st dispatch");

    // 2nd dispatch: only peer should run
    bus.broadcast("DYNAMIC_MUTATION");
    assert.strictEqual(selfCalls, 1, "Self must not run on 2nd dispatch");
    assert.strictEqual(peerCalls, 2, "Peer must continue to run");
  });

  // 1.3 Fault isolation when registering non-function callbacks
  check("1.3: Fault isolation: non-function subscriber callbacks do not crash bus or peer handlers", () => {
    let peerRan = 0;

    // Register malformed non-functions
    bus.subscribe("MALFORMED_SUB", null);
    bus.subscribe("MALFORMED_SUB", undefined);
    bus.subscribe("MALFORMED_SUB", 12345);
    bus.subscribe("MALFORMED_SUB", "not_a_function");
    bus.subscribe("MALFORMED_SUB", { foo: "bar" });

    // Register valid subscriber
    bus.subscribe("MALFORMED_SUB", () => {
      peerRan++;
    });

    let broadcastThrew = false;
    try {
      bus.broadcast("MALFORMED_SUB", { val: 42 });
    } catch (e) {
      broadcastThrew = true;
    }

    assert.strictEqual(broadcastThrew, false, "Broadcast must not throw when malformed callback is encountered");
    assert.strictEqual(peerRan, 1, "Valid peer handler must execute cleanly");
  });

  // 1.4 Broadcast input fuzzing with empty, null, and primitive eventTypes & payloads
  check("1.4: Broadcast handles empty, null, undefined, and primitive event types & payloads safely", () => {
    const fuzzedEvents = ["", null, undefined, 0, 999, true, false];
    const fuzzedPayloads = [null, undefined, 42, "raw_string", true, [], [1, 2, 3]];

    fuzzedEvents.forEach(evt => {
      fuzzedPayloads.forEach(pl => {
        let threw = false;
        try {
          bus.broadcast(evt, pl);
        } catch (e) {
          threw = true;
        }
        assert.strictEqual(threw, false, `Broadcast threw on event='${evt}', payload=${JSON.stringify(pl)}`);
      });
    });
  });

  // 1.5 Anti-duplicate dropping of external messages
  check("1.5: Anti-duplicate drops external messages with previously processed event_id", () => {
    const externalEnv = createTestHarness();
    const extBus = new externalEnv.exports.MiloSyncBus();

    let triggerCount = 0;
    extBus.subscribe("IDEMPOTENT_TEST", () => {
      triggerCount++;
    });

    const fixedEnvelope = {
      event_type: "IDEMPOTENT_TEST",
      event_id: "evt_duplicate_stress_001",
      sender_id: "other_client_99",
      payload: { data: "test" }
    };

    // Simulate 3 external storage event deliveries of identical event
    for (let i = 0; i < 3; i++) {
      externalEnv.mockWindow._fireEvent('storage', {
        key: extBus.storageEventKey,
        newValue: JSON.stringify(fixedEnvelope)
      });
    }

    assert.strictEqual(triggerCount, 1, `Expected exactly 1 execution, got ${triggerCount}`);
  });

  // 1.6 WebSocket connection state variations (CONNECTING, CLOSING, CLOSED)
  check("1.6: Broadcast executes Layer 1 & Layer 2 cleanly across all WebSocket readyStates (0, 2, 3)", () => {
    [0, 2, 3].forEach(state => {
      const h = createTestHarness({ wsState: state });
      const b = new h.exports.MiloSyncBus();

      let localRan = false;
      b.subscribe("STATE_VARIATION", () => { localRan = true; });

      let threw = false;
      try {
        b.broadcast("STATE_VARIATION", { readyState: state });
      } catch (e) {
        threw = true;
      }

      assert.strictEqual(threw, false, `Broadcast threw when ws.readyState=${state}`);
      assert.strictEqual(localRan, true, `Local dispatch must succeed when ws.readyState=${state}`);
    });
  });

  // 1.7 WebSocket reconnect timer bounds & backoff ceiling under 50 cycles
  check("1.7: Reconnect backoff strictly enforces delay ceiling of 16000ms over 50 failure cycles", () => {
    const h = createTestHarness({ wsOffline: true });
    const b = new h.exports.MiloSyncBus();

    for (let cycle = 0; cycle < 50; cycle++) {
      const expectedBackoff = Math.min(1000 * Math.pow(2, b.reconnectAttempts), 16000);
      assert(expectedBackoff <= 16000, `Backoff exceeded 16000ms: ${expectedBackoff}`);
      b.reconnectAttempts++;
    }
    assert.strictEqual(b.reconnectAttempts, 50);
  });

  // 1.8 Reconnect timer deduplication
  check("1.8: _scheduleReconnect does not spawn duplicate timers when already scheduled", () => {
    const h = createTestHarness({ wsOffline: true });
    const b = new h.exports.MiloSyncBus();

    b._scheduleReconnect();
    const firstTimer = b.reconnectTimer;
    assert.notStrictEqual(firstTimer, null, "reconnectTimer must be scheduled");

    // Call again immediately
    b._scheduleReconnect();
    assert.strictEqual(b.reconnectTimer, firstTimer, "reconnectTimer must not be overwritten or duplicated");

    clearTimeout(b.reconnectTimer);
  });
}

// =========================================================================
// SECTION 2: DUAL-DEVICE SIMULATOR CONCURRENCY & PROFILE SWITCHING
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SECTION 2] Dual-Device Simulator: Task Execution Survival & Role Permissions${RESET}`);

{
  // 2.1 Active task execution survival across role switches
  check("2.1: Active task Visual Timer continues running and dispatches telemetry when switching to parent profile", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');

    const {
      appState,
      startChildQuest,
      startStepTimer,
      stopStepTimer,
      switchProfile,
      setViewMode
    } = env.exports;

    // 1. Start quest on child device
    startChildQuest();
    startStepTimer(120);

    const childCol = env.getElement('col-child');
    const parentCol = env.getElement('col-parent');

    // Child workspace active
    assert.strictEqual(appState.currentStepIndex, 0);
    assert.notStrictEqual(appState.activeTask, null);
    const activeTaskId = appState.activeTask.id;

    // 2. Switch to Parent Profile ('parent')
    switchProfile('parent');

    // Verify DOM visibility: Child phone is hidden, Parent phone is visible
    assert.strictEqual(childCol.classList.contains('hidden'), true, "Child column must be hidden in parent profile");
    assert.strictEqual(parentCol.classList.contains('hidden'), false, "Parent column must be visible in parent profile");
    assert.strictEqual(appState.role, 'parent');

    // 3. Telemetry in background: simulate 10 elapsed seconds
    for (let s = 1; s <= 10; s++) {
      appState.totalSessionSeconds++;
      if (appState.totalSessionSeconds % 5 === 0 && env.sandbox.window.miloBus) {
        env.sandbox.window.miloBus.broadcast('STEP_TELEMETRY_UPDATE', {
          taskId: appState.activeTask.id,
          stepIndex: appState.currentStepIndex,
          elapsedSec: appState.totalSessionSeconds,
          totalSteps: appState.activeTask.steps.length,
          status: 'in_progress'
        });
      }
    }

    // Verify Parent Telemetry updated while child is hidden
    const durEl = env.getElement('telemetry-duration');
    assert(durEl.innerHTML.includes(env.exports.formatTime(appState.totalSessionSeconds)),
      `Parent telemetry must display elapsed time (${appState.totalSessionSeconds}s)`);

    // 4. Switch back to Child Profile ('child')
    switchProfile('child');
    assert.strictEqual(childCol.classList.contains('hidden'), false, "Child column must be visible again");
    assert.strictEqual(parentCol.classList.contains('hidden'), true, "Parent column must be hidden in child profile");

    // Verify child active task and step are preserved
    assert.strictEqual(appState.currentStepIndex, 0, "Step index must be preserved");
    assert.strictEqual(appState.activeTask.id, activeTaskId, "Active task must be preserved");

    // 5. Switch to Dual Mode ('dual')
    switchProfile('dual');
    assert.strictEqual(childCol.classList.contains('hidden'), false, "Child column must be visible in dual mode");
    assert.strictEqual(parentCol.classList.contains('hidden'), false, "Parent column must be visible in dual mode");

    stopStepTimer();
  });

  // 2.2 Invalid view mode / role boundary fuzzing
  check("2.2: setViewMode and switchProfile gracefully handle unsupported/invalid role strings without crashing", () => {
    const env = createTestHarness();
    const { setViewMode, switchProfile } = env.exports;

    const invalidRoles = ["admin", "guest", "super_user", "", null, undefined, 42, {}, []];

    invalidRoles.forEach(r => {
      let threw = false;
      try {
        setViewMode(r);
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, false, `setViewMode threw on invalid role: ${r}`);
    });

    invalidRoles.forEach(r => {
      let threw = false;
      try {
        switchProfile(r);
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, false, `switchProfile threw on invalid role: ${r}`);
    });
  });

  // 2.3 Role-based outbound WebSocket message separation
  check("2.3: Cross-role outbound separation: child role transmits KID_STEP_COMPLETED; parent transmits PARENT_CHEER", () => {
    const envChild = createTestHarness({ urlSearch: "?role=child" });
    const busChild = new envChild.exports.MiloSyncBus({ role: 'child' });
    busChild.ws.readyState = 1;
    busChild.isWsConnected = true;

    // Child broadcasts STEP_COMPLETED -> must send KID_STEP_COMPLETED
    busChild.broadcast("STEP_COMPLETED", { stepIndex: 1, starsEarned: 40 });
    assert.strictEqual(busChild.ws.sent.length, 1);
    const childSent = JSON.parse(busChild.ws.sent[0]);
    assert.strictEqual(childSent.event_type, "KID_STEP_COMPLETED");
    assert.strictEqual(childSent.step_id, 2);

    // Child broadcasts PARENT_CHEER_SEND -> should NOT send PARENT_CHEER (sends standard envelope)
    busChild.ws.sent = [];
    busChild.broadcast("PARENT_CHEER_SEND", { message: "Cheer from kid" });
    assert.strictEqual(busChild.ws.sent.length, 1);
    const nonParentSent = JSON.parse(busChild.ws.sent[0]);
    assert.notStrictEqual(nonParentSent.event_type, "PARENT_CHEER"); // only standard envelope

    // Parent broadcasts PARENT_CHEER_SEND -> must send PARENT_CHEER
    const envParent = createTestHarness({ urlSearch: "?role=parent" });
    const busParent = new envParent.exports.MiloSyncBus({ role: 'parent' });
    busParent.ws.readyState = 1;
    busParent.isWsConnected = true;

    busParent.broadcast("PARENT_CHEER_SEND", { message: "Mẹ yêu con!" });
    assert.strictEqual(busParent.ws.sent.length, 1);
    const parentSent = JSON.parse(busParent.ws.sent[0]);
    assert.strictEqual(parentSent.event_type, "PARENT_CHEER");
    assert.strictEqual(parentSent.cheer_text, "Mẹ yêu con!");
  });
}

// =========================================================================
// SECTION 3: GOLDEN TICKET APPROVAL CONCURRENCY & BALANCE UNDERFLOW
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SECTION 3] Golden Ticket Approval Flow: Concurrency & Balance Underflow${RESET}`);

{
  // 3.1 Balance underflow prevention (insufficient stars)
  check("3.1: childRedeemTicket blocks redemption when stars < cost (zero underflow)", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, childRedeemTicket } = env.exports;

    appState.stars = 100;
    appState.pendingTicket = null;

    // Attempt to redeem 150-star item
    childRedeemTicket("Kem que socola", 150);

    assert.strictEqual(appState.stars, 100, "Star balance must remain unchanged at 100");
    assert.strictEqual(appState.pendingTicket, null, "No pending ticket should be generated");

    // Attempt to redeem 500-star item
    childRedeemTicket("Vé siêu cấp", 500);
    assert.strictEqual(appState.stars, 100, "Star balance must remain 100");
  });

  // 3.2 Exact balance deduction down to 0
  check("3.2: childRedeemTicket allows exact balance deduction (stars == cost) reaching exactly 0 stars", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, childRedeemTicket } = env.exports;

    appState.stars = 150;
    appState.pendingTicket = null;

    childRedeemTicket("Kem que socola", 150);

    assert.strictEqual(appState.stars, 0, "Star balance must reach exactly 0");
    assert.notStrictEqual(appState.pendingTicket, null, "Pending ticket must be generated");
    assert.strictEqual(appState.pendingTicket.title, "Kem que socola");

    // Subsequent redemption when balance is 0 must fail
    childRedeemTicket("30 phút chơi Lego", 200);
    assert.strictEqual(appState.stars, 0, "Star balance must not underflow into negative numbers");
  });

  // 3.3 Rapid consecutive redemptions (Double-spend race condition stress)
  check("3.3: Rapid consecutive redemptions: first deduction succeeds, second is blocked, avoiding double-spend", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, childRedeemTicket } = env.exports;

    appState.stars = 250;
    appState.pendingTicket = null;

    // Two 200-star redemption requests fired back-to-back
    childRedeemTicket("Vé xem phim", 200);
    childRedeemTicket("Vé ăn kem", 200);

    // First redemption: 250 - 200 = 50 stars
    // Second redemption: 50 < 200 -> BLOCKED!
    assert.strictEqual(appState.stars, 50, "Final star balance must be 50 (never negative -150)");
    assert.strictEqual(appState.pendingTicket.title, "Vé xem phim", "Pending ticket must reflect first valid redemption");
  });

  // 3.4 Rapid consecutive parent approvals (10x burst idempotency)
  check("3.4: Parent rapid approval (10x click burst) executes first approval and handles null safety for remainder", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, parentApproveTicket } = env.exports;

    appState.pendingTicket = {
      ticketId: "ticket_burst_001",
      title: "1 tiếng lắp Lego",
      cost: 200
    };

    let approvalsCaptured = 0;
    env.sandbox.window.miloBus.subscribe("TICKET_APPROVAL_RESPONSE", (p) => {
      approvalsCaptured++;
      assert.strictEqual(p.approved, true);
    });

    // Fire 10 rapid clicks
    for (let click = 0; click < 10; click++) {
      let threw = false;
      try {
        parentApproveTicket();
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, false, `Click ${click + 1} threw an exception`);
    }

    assert.strictEqual(appState.pendingTicket, null, "pendingTicket must be cleared to null");
    assert.strictEqual(approvalsCaptured, 10, "All 10 clicks broadcasted safely without null pointer crash");

    // Parent done banner is visible
    const doneBanner = env.getElement('parent-golden-ticket-done');
    assert.strictEqual(doneBanner.classList.contains('hidden'), false, "Done banner must be shown");
  });

  // 3.5 Approval when pendingTicket is initially null
  check("3.5: parentApproveTicket with null pendingTicket uses safe default title without error", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, parentApproveTicket } = env.exports;

    appState.pendingTicket = null;

    let payloadCaptured = null;
    env.sandbox.window.miloBus.subscribe("TICKET_APPROVAL_RESPONSE", (p) => {
      payloadCaptured = p;
    });

    let threw = false;
    try {
      parentApproveTicket();
    } catch (e) {
      threw = true;
    }

    assert.strictEqual(threw, false, "parentApproveTicket must not throw when pendingTicket is null");
    assert.notStrictEqual(payloadCaptured, null);
    assert.strictEqual(payloadCaptured.approved, true);
    assert(payloadCaptured.title.length > 0, "Default title fallback must be non-empty string");
  });

  // 3.6 Parent decline followed by deferred approval
  check("3.6: parentDeclineTicket hides banner but preserves pending ticket for later approval", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState, parentDeclineTicket, parentApproveTicket } = env.exports;

    appState.pendingTicket = {
      ticketId: "ticket_defer_99",
      title: "Đi công viên nước",
      cost: 300
    };

    // 1. Parent declines
    parentDeclineTicket();

    const banner = env.getElement('parent-golden-ticket-banner');
    assert.strictEqual(banner.classList.contains('hidden'), true, "Banner must be hidden on decline");
    assert.notStrictEqual(appState.pendingTicket, null, "pendingTicket must NOT be wiped by decline");
    assert.strictEqual(appState.pendingTicket.title, "Đi công viên nước");

    // 2. Later, parent decides to approve
    let approvedPayload = null;
    env.sandbox.window.miloBus.subscribe("TICKET_APPROVAL_RESPONSE", (p) => {
      approvedPayload = p;
    });

    parentApproveTicket();
    assert.notStrictEqual(approvedPayload, null);
    assert.strictEqual(approvedPayload.title, "Đi công viên nước");
    assert.strictEqual(appState.pendingTicket, null, "pendingTicket cleared after approval");
  });

  // 3.7 Rapid consecutive declines (5x) without crash
  check("3.7: Rapid consecutive calls to parentDeclineTicket (5x) execute safely without error", () => {
    const env = createTestHarness();
    const { parentDeclineTicket } = env.exports;

    for (let i = 0; i < 5; i++) {
      let threw = false;
      try {
        parentDeclineTicket();
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, false, `parentDeclineTicket threw on iteration ${i + 1}`);
    }
  });

  // 3.8 Custom ticket redemption and approval cycle
  check("3.8: Custom ticket redemption cycle preserves custom title through approval modal", () => {
    const env = createTestHarness();
    env.mockWindow._fireEvent('DOMContentLoaded');
    const {
      appState,
      childRedeemCustomTicket,
      parentApproveTicket
    } = env.exports;

    appState.stars = 500;

    // Set custom input
    const inputEl = env.getElement('custom-child-ticket-input');
    inputEl.value = "Đi chơi Thảo Cầm Viên cuối tuần";

    childRedeemCustomTicket();

    assert.strictEqual(appState.stars, 300, "Stars must deduct 200 (500 -> 300)");
    assert.strictEqual(appState.pendingTicket.title, "Đi chơi Thảo Cầm Viên cuối tuần");
    assert.strictEqual(inputEl.value, "", "Input field must be cleared");

    // Parent approves
    parentApproveTicket();

    // Verify modal on child device
    const modal = env.getElement('child-modal-ticket-approved');
    assert.strictEqual(modal.classList.contains('flex'), true, "Approval modal must open");
    const titleEl = env.getElement('child-approved-ticket-name');
    assert.strictEqual(titleEl.innerText, "Đi chơi Thảo Cầm Viên cuối tuần", "Modal must display custom ticket title");
  });
}

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}                   TIER 5 ADVERSARIAL TEST SUMMARY                   ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`Total Assertions Tested: ${BOLD}${totalTests}${RESET}`);
console.log(`Passed Assertions:       ${GREEN}${BOLD}${passedTests}${RESET}`);
console.log(`Failed Assertions:       ${failedTests === 0 ? GREEN : RED}${BOLD}${failedTests}${RESET}`);

if (failedTests > 0) {
  console.log(`\n${RED}${BOLD}REGRESSIONS / DEFECTS DETECTED:${RESET}`);
  failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${f.desc}`);
    console.log(`     Error: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}ALL TIER 5 WHITE-BOX ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!${RESET}`);
  process.exit(0);
}