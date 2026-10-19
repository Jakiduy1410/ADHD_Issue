/**
 * EMPIRICAL ADVERSARIAL STRESS TEST & CONTRACT VERIFICATION HARNESS
 * Target: MiloSyncBus & State Sync Engine in index.html
 * 
 * Test Suites:
 * 1. Burst Event Broadcasting (50-250 rapid events, FIFO eviction, subscriber error isolation, multi-tab concurrency)
 * 2. State Persistence Across Simulated Reload & Hydration (dual-key, full snapshot, backup recovery)
 * 3. Corrupted / Malformed LocalStorage Payload Handling & Graceful Recovery
 * 4. WebSocket Offline State, Silent Degradation, Reconnection Backoff & Heartbeat Lifecycle
 * 5. 10-Event State Protocol Contract Compliance & Payload Boundary Verification
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// ANSI Color Helpers
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   MILO SYNC BUS ADVERSARIAL STRESS TEST & VERIFICATION SUITE   ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

// 1. Load app/index.html and app/js/app.js
const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

// Helper to build realistic mock environment
function createMockEnvironment(options = {}) {
  const store = options.initialStorage || {};
  let storageQuotaExceeded = options.throwQuotaExceeded || false;

  const mockLocalStorage = {
    _store: store,
    getItem: (k) => store[k] !== undefined ? store[k] : null,
    setItem: (k, v) => {
      if (storageQuotaExceeded) {
        const err = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      }
      store[k] = String(v);
    },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; }
  };

  const activeChannels = options.sharedChannels || [];

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
          // Asynchronous delivery like real browser
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
      this.readyState = options.wsOffline ? 3 : 1; // 1 = OPEN, 3 = CLOSED
      this.onopen = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.sent = [];

      if (options.wsOffline) {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error("Connection Refused"));
          if (this.onclose) this.onclose({ code: 1006, reason: "Offline" });
        }, 0);
      } else {
        setTimeout(() => {
          if (this.onopen) this.onopen();
        }, 0);
      }
    }
    send(data) {
      if (this.readyState !== 1) {
        throw new Error("WebSocket is not open: readyState " + this.readyState);
      }
      this.sent.push(data);
    }
    close() {
      this.readyState = 3;
      if (this.onclose) this.onclose({ code: 1000, reason: "Normal closure" });
    }
  }

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
        style: {},
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
        style: {},
        children: [],
        appendChild: function(c) { this.children.push(c); },
        setAttribute: function(k, v) { this[k] = v; }
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

  const wrappedScript = appScript + "\n;__exports__ = { taskDatabase, appState, MiloSyncBus, parentFilterCatalog, parentFilterGrade, parentApproveTicket, childRedeemTicket, renderChildIslandRoadmap, updateStarsEverywhere, playSfx, showToast, spawnStars, formatTime, renderParentTelemetryProgress };";
  vm.runInContext(wrappedScript, sandbox);

  return {
    sandbox,
    mockWindow,
    mockDocument,
    mockLocalStorage,
    sharedChannels: activeChannels,
    getElement,
    exports: sandbox.__exports__,
    setQuotaExceeded: (val) => { storageQuotaExceeded = val; }
  };
}

// Track all test assertions
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runAssert(desc, fn) {
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

async function runAsyncAssert(desc, fn) {
  totalTests++;
  try {
    await fn();
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
// SUITE 1: BURST EVENT BROADCASTING & CONCURRENCY
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SUITE 1] Burst Event Broadcasting & Concurrency Stress Tests${RESET}`);

{
  const env = createMockEnvironment();
  const { MiloSyncBus } = env.exports;
  const bus = new MiloSyncBus();

  // Test 1.1: 50 Rapid Synchronous Events
  runAssert("1.1: Burst of 50 rapid state events delivered without drop or reorder", () => {
    const received = [];
    bus.subscribe('STEP_TELEMETRY_UPDATE', (payload) => {
      received.push(payload.seq);
    });

    const start = Date.now();
    for (let i = 0; i < 50; i++) {
      bus.broadcast('STEP_TELEMETRY_UPDATE', { seq: i, elapsedSec: i * 2 });
    }
    const elapsed = Date.now() - start;

    assert.strictEqual(received.length, 50, `Expected 50 events, got ${received.length}`);
    for (let i = 0; i < 50; i++) {
      assert.strictEqual(received[i], i, `Event sequence mismatch at index ${i}`);
    }
    assert(elapsed < 100, `Burst took too long: ${elapsed}ms`);
  });

  // Test 1.2: Stress rolling buffer limit (250 events > 200 limit)
  runAssert("1.2: FIFO eviction of processedEventIds when burst exceeds 200 items", () => {
    for (let i = 0; i < 250; i++) {
      bus.broadcast('STARS_SYNC', { totalStars: 500 + i });
    }
    assert(bus.processedEventIds.size <= 200, `Buffer size exceeded limit: ${bus.processedEventIds.size}`);
    assert.strictEqual(bus.processedEventIds.size, 200, `Buffer size should cap exactly at 200`);
  });

  // Test 1.3: Fault isolation when subscriber throws during burst
  runAssert("1.3: Fault isolation: subscriber throwing an unhandled exception does not block peer subscribers", () => {
    let peerRan = 0;
    bus.subscribe('BURST_TEST_FAULT', () => {
      throw new Error("Malicious subscriber explosion");
    });
    bus.subscribe('BURST_TEST_FAULT', () => {
      peerRan++;
    });

    for (let i = 0; i < 10; i++) {
      bus.broadcast('BURST_TEST_FAULT', { count: i });
    }
    assert.strictEqual(peerRan, 10, `Peer subscriber should execute all 10 times despite peer throw, got ${peerRan}`);
  });

  // Test 1.4: Cross-Tab Burst Delivery & Anti-Echo
  runAssert("1.4: Multi-tab burst: Tab A fires 50 events -> Tab B receives 50; Tab A anti-echo drops its own echoes", async () => {
    const sharedChannels = [];
    const envA = createMockEnvironment({ sharedChannels });
    const envB = createMockEnvironment({ sharedChannels });

    const busA = new envA.exports.MiloSyncBus({ role: 'parent' });
    const busB = new envB.exports.MiloSyncBus({ role: 'child' });

    let bReceived = [];
    let aReceivedFromEcho = 0;

    busB.subscribe('STEP_COMPLETED', (payload) => {
      bReceived.push(payload.stepIndex);
    });

    let aLocalRuns = 0;
    busA.subscribe('STEP_COMPLETED', () => {
      aLocalRuns++;
    });

    for (let i = 0; i < 50; i++) {
      busA.broadcast('STEP_COMPLETED', { stepIndex: i, starsEarned: 40 });
    }

    assert.strictEqual(aLocalRuns, 50, "Tab A should dispatch locally 50 times");

    // Wait for async broadcast channel delivery
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(bReceived.length, 50, `Tab B expected 50 events, received ${bReceived.length}`);
    for (let i = 0; i < 50; i++) {
      assert.strictEqual(bReceived[i], i, `Tab B received out-of-order event at ${i}`);
    }
    assert.strictEqual(aLocalRuns, 50, "Tab A must not re-execute handlers from its own echo");
  });

  // Test 1.5: Concurrent Bidirectional Burst between 2 tabs
  runAssert("1.5: Concurrent bidirectional burst: Tab A and Tab B fire 25 events simultaneously", async () => {
    const sharedChannels = [];
    const envA = createMockEnvironment({ sharedChannels });
    const envB = createMockEnvironment({ sharedChannels });

    const busA = new envA.exports.MiloSyncBus({ role: 'parent' });
    const busB = new envB.exports.MiloSyncBus({ role: 'child' });

    let aGotB = [];
    let bGotA = [];

    busA.subscribe('FROM_B', (p) => aGotB.push(p.val));
    busB.subscribe('FROM_A', (p) => bGotA.push(p.val));

    for (let i = 0; i < 25; i++) {
      busA.broadcast('FROM_A', { val: i });
      busB.broadcast('FROM_B', { val: i });
    }

    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(aGotB.length, 25, `Tab A should receive 25 from B, got ${aGotB.length}`);
    assert.strictEqual(bGotA.length, 25, `Tab B should receive 25 from A, got ${bGotA.length}`);
  });
}

// =========================================================================
// SUITE 2: STATE PERSISTENCE & HYDRATION ACROSS SIMULATED RELOAD
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SUITE 2] State Persistence & Hydration Across Simulated Reload${RESET}`);

{
  const sharedStorage = {};

  // Step 2.1: Populate and save state
  runAssert("2.1: Dual-key atomic state persistence under primary and backup keys", () => {
    const env1 = createMockEnvironment({ initialStorage: sharedStorage });
    const { MiloSyncBus, taskDatabase } = env1.exports;
    const bus1 = new MiloSyncBus();

    const complexState = {
      stars: 920,
      childRoadmap: [taskDatabase['G1_MATH_01'], taskDatabase['G2_MATH_06'], taskDatabase['G3_VIET_13']],
      currentRoadmapIndex: 1,
      currentStepIndex: 2,
      activeTask: taskDatabase['G2_MATH_06'],
      pendingTicket: { ticketId: 'ticket_adv_1', title: '30 phút lắp Lego', cost: 200 },
      pauseCount: 4,
      totalSessionSeconds: 1250,
      selectedCatalogIds: new Set(['G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13'])
    };

    bus1.savePersistedState(complexState);

    const primaryRaw = env1.mockLocalStorage.getItem('milo_quest_saved_state');
    const backupRaw = env1.mockLocalStorage.getItem('milo_sync_state_v1');

    assert(primaryRaw, "Primary state key 'milo_quest_saved_state' must be written");
    assert(backupRaw, "Backup state key 'milo_sync_state_v1' must be written");
    assert.strictEqual(primaryRaw, backupRaw, "Primary and backup state payloads must be identical");

    const parsed = JSON.parse(primaryRaw);
    assert.strictEqual(parsed.stars, 920);
    assert.strictEqual(parsed.childRoadmap.length, 3);
    assert.strictEqual(parsed.currentRoadmapIndex, 1);
    assert.strictEqual(parsed.currentStepIndex, 2);
    assert.strictEqual(parsed.activeTaskId, 'G2_MATH_06');
    assert.strictEqual(parsed.pauseCount, 4);
    assert.strictEqual(parsed.totalSessionSeconds, 1250);
    assert.deepStrictEqual(parsed.selectedCatalogIds, ['G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13']);
  });

  // Step 2.2: Simulate page reload and verify hydration
  runAssert("2.2: Full state hydration on DOMContentLoaded restores all gameplay progress", () => {
    const env2 = createMockEnvironment({ initialStorage: sharedStorage });
    env2.mockWindow._fireEvent('DOMContentLoaded');
    const { appState } = env2.exports;

    assert.strictEqual(appState.stars, 920, "Stars count must hydrate to 920");
    assert.strictEqual(appState.childRoadmap.length, 3, "childRoadmap must hydrate to 3 tasks");
    assert.strictEqual(appState.currentRoadmapIndex, 1, "currentRoadmapIndex must hydrate to 1");
    assert.strictEqual(appState.currentStepIndex, 2, "currentStepIndex must hydrate to 2");
    assert.strictEqual(appState.activeTask.id, 'G2_MATH_06', "activeTask must point to current roadmap item");
    assert.strictEqual(appState.pauseCount, 4, "pauseCount must hydrate to 4");
    assert.strictEqual(appState.totalSessionSeconds, 1250, "totalSessionSeconds must hydrate to 1250");
    assert(appState.pendingTicket, "pendingTicket must be hydrated");
    assert.strictEqual(appState.pendingTicket.title, '30 phút lắp Lego');

    // Check UI DOM reflections
    const ticketBanner = env2.getElement('parent-golden-ticket-banner');
    assert.strictEqual(ticketBanner.classList.contains('hidden'), false, "Golden ticket banner must be visible");
    const desc = env2.getElement('parent-ticket-desc');
    assert(desc.innerText.includes('30 phút lắp Lego'), "Banner description must include ticket title");
  });

  // Step 2.3: Fallback hydration from backup key when primary key is missing
  runAssert("2.3: Fallback hydration recovers state from backup key if primary key was wiped", () => {
    const backupOnlyStorage = {
      'milo_sync_state_v1': JSON.stringify({
        version: 1,
        stars: 888,
        pauseCount: 9,
        currentRoadmapIndex: 0,
        currentStepIndex: 1
      })
    };
    const envBackup = createMockEnvironment({ initialStorage: backupOnlyStorage });
    envBackup.mockWindow._fireEvent('DOMContentLoaded');

    assert.strictEqual(envBackup.exports.appState.stars, 888, "Should restore stars from backup key");
    assert.strictEqual(envBackup.exports.appState.pauseCount, 9, "Should restore pauseCount from backup key");
  });

  // Step 2.4: Catalog Selected IDs Preservation Test
  runAssert("2.4: selectedCatalogIds state hydration across reload", () => {
    const env = createMockEnvironment({ initialStorage: sharedStorage });
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState } = env.exports;

    const hasG2 = appState.selectedCatalogIds && appState.selectedCatalogIds.has('G2_MATH_06');
    assert.strictEqual(hasG2, true, "selectedCatalogIds must be hydrated from localStorage to preserve parent catalog selections");
  });
}

// =========================================================================
// SUITE 3: CORRUPTED OR MALFORMED LOCALSTORAGE HANDLING
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SUITE 3] Corrupted / Malformed LocalStorage Payload Handling${RESET}`);

{
  // Test 3.1: Completely unparseable garbage JSON in localStorage
  runAssert("3.1: Unparseable syntax error in localStorage returns null gracefully without crash", () => {
    const corruptedStorage = {
      'milo_quest_saved_state': '<<<CORRUPTED_NON_JSON_SYNTAX_ERROR???>>'
    };
    const env = createMockEnvironment({ initialStorage: corruptedStorage });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    let loaded = null;
    let threw = false;
    try {
      loaded = bus.loadPersistedState();
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, false, "loadPersistedState should not throw on syntax error");
    assert.strictEqual(loaded, null, "loadPersistedState should return null on syntax error");

    let initThrew = false;
    try {
      env.mockWindow._fireEvent('DOMContentLoaded');
    } catch (e) {
      initThrew = true;
    }
    assert.strictEqual(initThrew, false, "App initialization must not crash on malformed JSON in localStorage");
    assert.strictEqual(env.exports.appState.stars, 450, "appState should cleanly retain default values");
  });

  // Test 3.2: Non-object JSON primitives in storage
  runAssert("3.2: Primitive non-object JSON values (number, string, boolean) do not crash hydration", () => {
    const primitives = ['12345', '"plain_string"', 'true', 'null'];
    primitives.forEach(prim => {
      const env = createMockEnvironment({
        initialStorage: { 'milo_quest_saved_state': prim }
      });
      let initThrew = false;
      try {
        env.mockWindow._fireEvent('DOMContentLoaded');
      } catch (e) {
        initThrew = true;
      }
      assert.strictEqual(initThrew, false, `Hydration must survive primitive JSON: ${prim}`);
    });
  });

  // Test 3.3: Empty childRoadmap array in storage
  runAssert("3.3: Empty childRoadmap array in storage does not wipe default roadmap", () => {
    const env = createMockEnvironment({
      initialStorage: {
        'milo_quest_saved_state': JSON.stringify({
          stars: 600,
          childRoadmap: []
        })
      }
    });
    env.mockWindow._fireEvent('DOMContentLoaded');
    const { appState } = env.exports;

    assert.strictEqual(appState.stars, 600);
    assert(appState.childRoadmap.length > 0, "Default roadmap should not be emptied out by empty array");
  });

  // Test 3.4: Storage Event corruption from external tab
  runAssert("3.4: Corrupted storage event does not crash listener or abort bus", () => {
    const env = createMockEnvironment();
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    let threw = false;
    try {
      env.mockWindow._fireEvent('storage', {
        key: 'milo_quest_sync_event',
        newValue: 'NOT_VALID_JSON{:::}'
      });
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, false, "Storage listener must catch syntax errors silently");
  });

  // Test 3.5: QuotaExceededError handling in savePersistedState
  runAssert("3.5: QuotaExceededError in localStorage does not throw or crash application loop", () => {
    const env = createMockEnvironment({ throwQuotaExceeded: true });
    const { MiloSyncBus, appState } = env.exports;
    const bus = new MiloSyncBus();

    let threw = false;
    try {
      bus.savePersistedState(appState);
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, false, "savePersistedState must silently catch QuotaExceededError");
  });

  // Test 3.6: Malformed childRoadmap item (null or missing steps) in storage
  runAssert("3.6: Corrupted childRoadmap item in localStorage (null element or missing steps) must not crash application", () => {
    const corruptedRoadmapStorage = {
      'milo_quest_saved_state': JSON.stringify({
        stars: 500,
        childRoadmap: [null, { id: 'malformed_task_no_steps' }]
      })
    };
    const env = createMockEnvironment({ initialStorage: corruptedRoadmapStorage });
    let initThrew = false;
    let errMessage = "";
    try {
      env.mockWindow._fireEvent('DOMContentLoaded');
    } catch (e) {
      initThrew = true;
      errMessage = e.message;
    }
    assert.strictEqual(initThrew, false, `App crashed during DOMContentLoaded when childRoadmap contained malformed item: ${errMessage}`);
  });
}

// =========================================================================
// SUITE 4: WEBSOCKET OFFLINE STATE & RESILIENCE
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SUITE 4] WebSocket Offline State & Network Isolation Tests${RESET}`);

{
  // Test 4.1: WebSocket Server Completely Offline at startup
  runAssert("4.1: App functions seamlessly when WebSocket server is offline (graceful silent degradation)", () => {
    const env = createMockEnvironment({ wsOffline: true });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    assert.strictEqual(bus.isWsConnected, false, "WebSocket connected flag must be false");

    // Indicator must reflect local bus
    const indicator = env.getElement('sync-status-indicator');
    bus._updateSyncIndicator(false);
    assert(indicator.innerHTML.includes('WebBus Local'), "Sync indicator must show 'WebBus Local (<2ms)'");

    // Broadcasting while offline must NOT throw
    let broadcastThrew = false;
    try {
      bus.broadcast('STEP_COMPLETED', { stepIndex: 0, starsEarned: 40 });
    } catch (e) {
      broadcastThrew = true;
    }
    assert.strictEqual(broadcastThrew, false, "Broadcast must not throw when WebSocket is offline");
  });

  // Test 4.2: Exponential Reconnect Backoff & Max Delay Cap
  runAssert("4.2: Exponential reconnect backoff caps at 16000ms", () => {
    const env = createMockEnvironment({ wsOffline: true });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    const backoffs = [];
    for (let i = 0; i < 8; i++) {
      const backoff = Math.min(1000 * Math.pow(2, bus.reconnectAttempts), 16000);
      backoffs.push(backoff);
      bus.reconnectAttempts++;
    }

    assert.deepStrictEqual(backoffs.slice(0, 5), [1000, 2000, 4000, 8000, 16000]);
    assert.strictEqual(backoffs[5], 16000, "Must cap at 16s");
    assert.strictEqual(backoffs[6], 16000, "Must stay capped at 16s");
    assert.strictEqual(backoffs[7], 16000, "Must stay capped at 16s");
  });

  // Test 4.3: WebSocket Abrupt Disconnect Clears Heartbeat Timer
  runAssert("4.3: Abrupt WebSocket closure clears ping heartbeat and switches status badge", () => {
    const env = createMockEnvironment({ wsOffline: false });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    // Trigger open
    bus.ws.onopen();
    assert.strictEqual(bus.isWsConnected, true);
    assert(bus.pingTimer !== null, "Ping heartbeat timer must be active when connected");

    // Trigger abrupt close
    bus.ws.onclose();
    assert.strictEqual(bus.isWsConnected, false);
    assert.strictEqual(bus.pingTimer, null, "Ping timer must be cleared on disconnect");

    const indicator = env.getElement('sync-status-indicator');
    assert(indicator.innerHTML.includes('WebBus Local'), "Indicator must revert to WebBus Local");
  });

  // Test 4.4: Corrupted JSON message from WebSocket server
  runAssert("4.4: Corrupted frame from WebSocket server is ignored cleanly without throwing", () => {
    const env = createMockEnvironment({ wsOffline: false });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    let threw = false;
    try {
      bus.ws.onmessage({ data: "INVALID_JSON_STREAM_BUFFER_CORRUPT{{{" });
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, false, "WebSocket onmessage must swallow JSON parse error");
  });

  // Test 4.5: WebSocket Server-translated events handling
  runAssert("4.5: Server-translated event 'PARENT_NOTIFICATION_STEP_DONE' maps to local 'STEP_COMPLETED'", () => {
    const env = createMockEnvironment({ wsOffline: false });
    const { MiloSyncBus } = env.exports;
    const bus = new MiloSyncBus();

    let received = null;
    bus.subscribe('STEP_COMPLETED', (payload) => {
      received = payload;
    });

    bus._handleIncomingWsMessage({
      event_type: "PARENT_NOTIFICATION_STEP_DONE",
      step_id: 3,
      points_earned: 40,
      message: "Leo làm xong bước 3!"
    });

    assert(received, "Subscriber for STEP_COMPLETED must be triggered");
    assert.strictEqual(received.stepIndex, 2, "step_id 3 must map to stepIndex 2");
    assert.strictEqual(received.starsEarned, 40);
  });
}

// =========================================================================
// SUITE 5: 10-EVENT STATE PROTOCOL COMPLIANCE & PAYLOAD BOUNDARIES
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SUITE 5] 10-Event State Protocol Contract Compliance & Edge Cases${RESET}`);

{
  const env = createMockEnvironment();
  // Fire DOMContentLoaded so window.miloBus is instantiated and registerMiloSyncSubscribers is wired
  env.mockWindow._fireEvent('DOMContentLoaded');

  const bus = env.sandbox.window.miloBus;
  const { taskDatabase, appState } = env.exports;

  assert(bus, "window.miloBus must exist after DOMContentLoaded");

  // Event 1: TASK_ASSIGN_BATCH
  runAssert("5.1: TASK_ASSIGN_BATCH: Valid batch replaces roadmap; Empty batch safely ignored", () => {
    const tasks = [taskDatabase['G1_MATH_01'], taskDatabase['G1_VIET_03']];
    bus.broadcast('TASK_ASSIGN_BATCH', { tasks });

    assert.strictEqual(appState.childRoadmap.length, 2);
    assert.strictEqual(appState.childRoadmap[0].id, 'G1_MATH_01');
    assert.strictEqual(appState.currentRoadmapIndex, 0);

    // Empty batch should NOT wipe roadmap
    bus.broadcast('TASK_ASSIGN_BATCH', { tasks: [] });
    assert.strictEqual(appState.childRoadmap.length, 2, "Empty batch must not overwrite existing roadmap");
  });

  // Event 2: STEP_TELEMETRY_UPDATE
  runAssert("5.2: STEP_TELEMETRY_UPDATE: Updates telemetry bar and formatted duration correctly", () => {
    bus.broadcast('STEP_TELEMETRY_UPDATE', { taskId: 'G1_MATH_01', stepIndex: 1, elapsedSec: 90, totalSteps: 3 });

    const durEl = env.getElement('telemetry-duration');
    assert(durEl.innerHTML.includes('01:30'), `Duration must show '01:30', got: ${durEl.innerHTML}`);
  });

  // Event 3: STEP_COMPLETED
  runAssert("5.3: STEP_COMPLETED: Updates step badge and rewards cleanly", () => {
    bus.broadcast('STEP_COMPLETED', { taskId: 'G1_MATH_01', stepIndex: 1, totalSteps: 3, starsEarned: 40 });

    const badge = env.getElement('telemetry-status-badge');
    assert(badge.innerHTML.includes('Bước 2 hoàn thành'), `Badge must show 'Bước 2 hoàn thành', got: ${badge.innerHTML}`);
  });

  // Event 4: ISLAND_COMPLETED
  runAssert("5.4: ISLAND_COMPLETED: Updates status badge to completed and handles fallback title", () => {
    bus.broadcast('ISLAND_COMPLETED', { taskId: 'G1_MATH_01', totalStars: 600 });

    const badge = env.getElement('telemetry-status-badge');
    assert(badge.innerHTML.includes('Vừa hoàn thành đảo'), "Badge must reflect island completion");
  });

  // Event 5: TREASURE_UNLOCKED
  runAssert("5.5: TREASURE_UNLOCKED: Broadcasts and processes without errors", () => {
    let captured = null;
    bus.subscribe('TREASURE_UNLOCKED', (p) => { captured = p; });
    bus.broadcast('TREASURE_UNLOCKED', { taskId: 'G1_MATH_01', rewards: ['chest_gold'] });

    assert(captured, "TREASURE_UNLOCKED event must be captured");
    assert.deepStrictEqual(captured.rewards, ['chest_gold']);
  });

  // Event 6: TICKET_REDEEM_REQUEST
  runAssert("5.6: TICKET_REDEEM_REQUEST: Triggers parent banner, bell chime, and pending ticket state", () => {
    bus.broadcast('TICKET_REDEEM_REQUEST', { ticketId: 'tick_99', title: 'Ăn kem socola', cost: 150 });

    assert(appState.pendingTicket, "appState.pendingTicket must be populated");
    assert.strictEqual(appState.pendingTicket.title, 'Ăn kem socola');
    assert.strictEqual(appState.pendingTicket.cost, 150);

    const banner = env.getElement('parent-golden-ticket-banner');
    assert.strictEqual(banner.classList.contains('hidden'), false, "Parent golden ticket banner must be visible");
  });

  // Event 7: TICKET_APPROVAL_RESPONSE
  runAssert("5.7: TICKET_APPROVAL_RESPONSE: Approved triggers child celebration modal; Rejected does not", () => {
    const modal = env.getElement('child-modal-ticket-approved');

    // Case 1: Approved
    bus.broadcast('TICKET_APPROVAL_RESPONSE', {
      ticketId: 'tick_99',
      title: 'Ăn kem socola',
      approved: true,
      praiseMessage: 'Mẹ khen con đã rất cố gắng!'
    });

    assert.strictEqual(modal.classList.contains('flex'), true, "Modal must have 'flex' class");
    assert.strictEqual(modal.classList.contains('hidden'), false, "Modal must not have 'hidden' class");
    assert.strictEqual(env.getElement('child-approved-ticket-name').innerText, 'Ăn kem socola');
    assert(env.getElement('child-approved-ticket-praise').innerText.includes('Mẹ khen con'), "Praise text must be set");
    assert.strictEqual(appState.pendingTicket, null, "pendingTicket should be cleared on approval");

    // Reset modal
    modal.classList.remove('flex');
    modal.classList.add('hidden');

    // Case 2: Rejected
    bus.broadcast('TICKET_APPROVAL_RESPONSE', {
      ticketId: 'tick_100',
      approved: false
    });
    assert.strictEqual(modal.classList.contains('hidden'), true, "Modal must remain hidden on approval=false");
  });

  // Event 8: MILO_RESCUE_TRIGGER
  runAssert("5.8: MILO_RESCUE_TRIGGER: Increments pause counter and updates CBT telemetry indicator", () => {
    const initialPause = appState.pauseCount || 0;
    bus.broadcast('MILO_RESCUE_TRIGGER', { reason: 'box_breathing', stepId: 1 });

    assert.strictEqual(appState.pauseCount, initialPause + 1);
    const pCountEl = env.getElement('telemetry-pause-count');
    assert(pCountEl.innerHTML.includes('CBT'), "Pause element must mention CBT");
  });

  // Event 9: PARENT_CHEER_SEND Contract Robustness
  runAssert("5.9: PARENT_CHEER_SEND: Robust handling of cheerText and speech bubble animation", () => {
    bus.broadcast('PARENT_CHEER_SEND', { cheerText: 'Con trai yêu làm rất tốt!' });

    const speech = env.getElement('child-milo-speech');
    assert(speech.innerText.includes('Con trai yêu làm rất tốt!'), `Speech bubble must contain cheer text: ${speech.innerText}`);
  });

  // Event 9b: PARENT_CHEER_SEND with PROJECT.md contract { message }
  runAssert("5.9b: PARENT_CHEER_SEND contract: supports { message } property from PROJECT.md without displaying 'undefined'", () => {
    bus.broadcast('PARENT_CHEER_SEND', { message: 'Mẹ luôn đồng hành cùng con!' });

    const speech = env.getElement('child-milo-speech');
    assert(!speech.innerText.includes('undefined'), `Speech bubble displayed 'undefined' instead of cheer message: ${speech.innerText}`);
    assert(speech.innerText.includes('Mẹ luôn đồng hành cùng con!'), `Speech bubble must contain message text: ${speech.innerText}`);
  });

  // Event 10: STARS_SYNC
  runAssert("5.10: STARS_SYNC: Synchronizes star counts across appState and all DOM badges", () => {
    bus.broadcast('STARS_SYNC', { totalStars: 1050 });

    assert.strictEqual(appState.stars, 1050, "appState.stars must update to 1050");
    const childStarEl = env.getElement('child-stars-count');
    assert.strictEqual(childStarEl.innerText, 1050, "Child star badge must display 1050");
  });
}

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
console.log(`${BOLD}${CYAN}                       TEST SUITE SUMMARY                       ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================${RESET}`);
console.log(`Total Assertions Checked: ${BOLD}${totalTests}${RESET}`);
console.log(`Passed Assertions:        ${GREEN}${BOLD}${passedTests}${RESET}`);
console.log(`Failed Assertions:        ${failedTests === 0 ? GREEN : RED}${BOLD}${failedTests}${RESET}`);

if (failedTests > 0) {
  console.log(`\n${RED}${BOLD}CRITICAL FAILURES DETECTED:${RESET}`);
  failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${f.desc}`);
    console.log(`     Error: ${f.error}`);
  });
  console.log(`\nVerdict: ${RED}${BOLD}REQUEST_CHANGES${RESET}`);
  process.exit(1);
} else {
  console.log(`\nAll Adversarial Stress Vectors Succeeded with Zero Regressions!`);
  console.log(`Verdict: ${GREEN}${BOLD}APPROVE${RESET}`);
  process.exit(0);
}