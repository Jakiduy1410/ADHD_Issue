/**
 * EMPIRICAL ADVERSARIAL STRESS TEST: CORRUPTED ROADMAP & CHEER CONTRACT
 * Challenger: challenger_m1_it2_1
 * 
 * Verifies:
 * 1. Corrupted localStorage childRoadmap payloads:
 *    - [null, undefined, {}, { id: 'x', steps: [] }]
 *    - Hybrid arrays (corrupted items mixed with valid items)
 *    - Direct appState.childRoadmap corruption stress in renderChildIslandRoadmap
 *    - TASK_ASSIGN_BATCH dispatch fuzzing with malformed tasks
 * 2. PARENT_CHEER_SEND format variants:
 *    - { message: "Test cheer" }
 *    - { cheerText: "Test cheer" }
 *    - "Test cheer" (raw string)
 *    - Mixed and edge cases ({}, null, "")
 *    - Strict verification that the substring "undefined" NEVER appears anywhere in DOM or payloads
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   CHALLENGER EMPIRICAL VERIFICATION: ROADMAP CORRUPTION & CHEER     ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

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

  const allWsSent = [];
  class MockWebSocket {
    static OPEN = 1;
    static CLOSED = 3;
    constructor(url) {
      this.url = url;
      this.readyState = 1; // OPEN
      this.onopen = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.sent = [];
      setTimeout(() => { if (this.onopen) this.onopen(); }, 0);
    }
    send(data) {
      this.sent.push(data);
      allWsSent.push(data);
    }
    close() {
      this.readyState = 3;
      if (this.onclose) this.onclose({ code: 1000 });
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
        _innerHTML: "",
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) {
          this._innerHTML = val;
          const matches = String(val).matchAll(/id=["']([^"']+)["'][^>]*>([^<]*)/g);
          for (const m of matches) {
            getElement(m[1]).innerText = m[2].trim();
          }
        },
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
  const toasts = [];

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

  const wrappedScript = appScript + "\n;__exports__ = { taskDatabase, appState, MiloSyncBus, parentFilterCatalog, parentFilterGrade, parentApproveTicket, childRedeemTicket, renderChildIslandRoadmap, updateStarsEverywhere, playSfx, showToast, spawnStars, formatTime, renderParentTelemetryProgress, registerMiloSyncSubscribers };";
  vm.runInContext(wrappedScript, sandbox);

  // Intercept showToast to track toasts
  const originalShowToast = sandbox.__exports__.showToast;
  sandbox.__exports__.showToast = (title, body, icon) => {
    toasts.push({ title, body, icon });
    try { originalShowToast(title, body, icon); } catch(e) {}
  };

  return {
    sandbox,
    mockWindow,
    mockDocument,
    mockLocalStorage,
    getElement,
    exports: sandbox.__exports__,
    allWsSent
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
// SECTION 1: CORRUPTED LOCALSTORAGE childRoadmap STRESS TESTS
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SECTION 1] Corrupted childRoadmap localStorage Stress Tests${RESET}`);

// Vector 1.1: Exact payload specified in dispatch: [null, undefined, {}, { id: 'x', steps: [] }]
check("1.1: localStorage with exact vector [null, undefined, {}, { id: 'x', steps: [] }] survives DOMContentLoaded without exception", () => {
  const corruptedRoadmap = [null, undefined, {}, { id: 'x', steps: [] }];
  const storageData = {
    'milo_quest_saved_state': JSON.stringify({
      stars: 350,
      childRoadmap: corruptedRoadmap
    })
  };

  const env = createMockEnvironment({ initialStorage: storageData });
  let errorCaught = null;
  try {
    env.mockWindow._fireEvent('DOMContentLoaded');
  } catch (err) {
    errorCaught = err;
  }

  assert.strictEqual(errorCaught, null, `App threw during hydration: ${errorCaught && errorCaught.message}`);

  const { appState } = env.exports;
  assert(Array.isArray(appState.childRoadmap), "appState.childRoadmap must be an array");
  assert(appState.childRoadmap.length > 0, "appState.childRoadmap should retain safe default items");
  assert(appState.activeTask !== null && appState.activeTask !== undefined, "appState.activeTask must not be null/undefined");
  assert(Array.isArray(appState.activeTask.steps), "appState.activeTask.steps must be an array");
  assert(appState.activeTask.steps.length > 0, "appState.activeTask.steps must have length > 0");

  const curTitle = env.getElement('child-current-title').innerText;
  assert(curTitle.length > 0, "Child current title must be rendered");
});

// Vector 1.2: Single corrupted items ([null], [{}], [{ id: 'no_steps' }])
check("1.2: Varied permutations of malformed roadmap arrays in localStorage fall back safely", () => {
  const testCases = [
    [null],
    [undefined],
    [{}],
    [{ id: 'x' }],
    [{ id: 'x', steps: null }],
    [{ id: 'x', steps: [] }],
    [{ steps: [{ text: 'step' }] }], // missing id
    ["string_instead_of_object"],
    [12345],
    [null, null, null],
    [{}, {}, {}]
  ];

  for (let i = 0; i < testCases.length; i++) {
    const corruptedCase = testCases[i];
    const storageData = {
      'milo_quest_saved_state': JSON.stringify({
        stars: 400 + i,
        childRoadmap: corruptedCase
      })
    };
    const env = createMockEnvironment({ initialStorage: storageData });
    let errorCaught = null;
    try {
      env.mockWindow._fireEvent('DOMContentLoaded');
    } catch (err) {
      errorCaught = err;
    }
    assert.strictEqual(errorCaught, null, `Case ${i} failed with error: ${errorCaught && errorCaught.message}`);
    const { appState } = env.exports;
    assert(appState.childRoadmap.length > 0, `Case ${i}: childRoadmap must not be empty`);
    assert(appState.activeTask && appState.activeTask.id, `Case ${i}: activeTask must be valid`);
  }
});

// Vector 1.3: Partial corruption (valid task mixed with invalid tasks)
check("1.3: Hybrid roadmap array (valid task mixed with nulls and step-less objects) preserves only the valid task", () => {
  const hybridRoadmap = [
    null,
    { id: 'corrupt_1' },
    {
      id: 'valid_survivor_01',
      title: 'Đảo Cứu Hộ Hợp Lệ',
      icon: '🛡️',
      steps: [{ step_id: 1, action_verb: 'Đọc', atomic_instruction: 'Đọc câu hỏi', duration_sec: 60 }]
    },
    { id: 'corrupt_2', steps: [] },
    undefined
  ];

  const storageData = {
    'milo_quest_saved_state': JSON.stringify({
      stars: 520,
      childRoadmap: hybridRoadmap
    })
  };

  const env = createMockEnvironment({ initialStorage: storageData });
  env.mockWindow._fireEvent('DOMContentLoaded');
  const { appState } = env.exports;

  assert.strictEqual(appState.childRoadmap.length, 1, `Expected exactly 1 valid surviving task, got ${appState.childRoadmap.length}`);
  assert.strictEqual(appState.childRoadmap[0].id, 'valid_survivor_01', "Surviving task must be 'valid_survivor_01'");
  assert.strictEqual(appState.activeTask.id, 'valid_survivor_01');
  assert.strictEqual(env.getElement('child-current-title').innerText, 'Đảo Cứu Hộ Hợp Lệ');
});

// Vector 1.4: Direct mutation of appState.childRoadmap to corrupted array before calling renderChildIslandRoadmap()
check("1.4: Direct mutation of appState.childRoadmap to [null, undefined, {}, { id: 'x', steps: [] }] does not crash renderChildIslandRoadmap()", () => {
  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const { appState, renderChildIslandRoadmap } = env.exports;

  // Intentionally inject corruption directly into memory
  appState.childRoadmap = [null, undefined, {}, { id: 'x', steps: [] }];
  appState.currentRoadmapIndex = 0;

  let errorCaught = null;
  try {
    renderChildIslandRoadmap();
  } catch (err) {
    errorCaught = err;
  }

  assert.strictEqual(errorCaught, null, `renderChildIslandRoadmap threw on directly corrupted appState: ${errorCaught && errorCaught.message}`);
  assert(appState.activeTask !== null && appState.activeTask !== undefined);
  assert(appState.activeTask.steps && appState.activeTask.steps.length > 0);
  assert(env.getElement('child-current-title').innerText.length > 0);
});

// Vector 1.5: TASK_ASSIGN_BATCH dispatch fuzzing with malformed tasks
check("1.5: TASK_ASSIGN_BATCH dispatch with malformed array ignores or filters cleanly without throwing", () => {
  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;
  const { appState } = env.exports;

  const initialCount = appState.childRoadmap.length;

  let threw = false;
  try {
    bus.broadcast('TASK_ASSIGN_BATCH', { tasks: [null, undefined, {}, { id: 'bad', steps: [] }] });
  } catch (err) {
    threw = true;
  }

  assert.strictEqual(threw, false, "TASK_ASSIGN_BATCH must not throw when given malformed tasks");
  assert(appState.childRoadmap.length > 0, "Roadmap must still be intact");
  assert(appState.activeTask && appState.activeTask.id, "activeTask must still be valid");
});

// =========================================================================
// SECTION 2: PARENT_CHEER_SEND PAYLOAD FORMATS & "undefined" CHECK
// =========================================================================
console.log(`\n${BOLD}${YELLOW}[SECTION 2] PARENT_CHEER_SEND Payload Variations & 'undefined' Check${RESET}`);

// Vector 2.1: { message: "Test cheer" } (PROJECT.md contract)
check("2.1: PARENT_CHEER_SEND with { message: 'Test cheer' } displays cheer text without 'undefined'", () => {
  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;

  bus.broadcast('PARENT_CHEER_SEND', { message: "Test cheer" });

  const speechText = env.getElement('child-milo-speech').innerText;
  assert(speechText.includes("Test cheer"), `Speech must include 'Test cheer', got: '${speechText}'`);
  assert(!speechText.includes("undefined"), `Speech must NOT include 'undefined', got: '${speechText}'`);

  // Check toast DOM element
  const toastDesc = env.getElement('sync-toast-desc').innerText;
  assert.strictEqual(toastDesc, "Test cheer");
  assert(!toastDesc.includes("undefined"));
});

// Vector 2.2: { cheerText: "Test cheer" } (Legacy/alternative contract)
check("2.2: PARENT_CHEER_SEND with { cheerText: 'Test cheer' } displays cheer text without 'undefined'", () => {
  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;

  bus.broadcast('PARENT_CHEER_SEND', { cheerText: "Test cheer" });

  const speechText = env.getElement('child-milo-speech').innerText;
  assert(speechText.includes("Test cheer"), `Speech must include 'Test cheer', got: '${speechText}'`);
  assert(!speechText.includes("undefined"), `Speech must NOT include 'undefined', got: '${speechText}'`);

  const toastDesc = env.getElement('sync-toast-desc').innerText;
  assert.strictEqual(toastDesc, "Test cheer");
  assert(!toastDesc.includes("undefined"));
});

// Vector 2.3: Raw string "Test cheer"
check("2.3: PARENT_CHEER_SEND with string 'Test cheer' displays cheer text without 'undefined'", () => {
  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;

  bus.broadcast('PARENT_CHEER_SEND', "Test cheer");

  const speechText = env.getElement('child-milo-speech').innerText;
  assert(speechText.includes("Test cheer"), `Speech must include 'Test cheer', got: '${speechText}'`);
  assert(!speechText.includes("undefined"), `Speech must NOT include 'undefined', got: '${speechText}'`);

  const toastDesc = env.getElement('sync-toast-desc').innerText;
  assert.strictEqual(toastDesc, "Test cheer");
  assert(!toastDesc.includes("undefined"));
});

// Vector 2.4: Empty payload or missing cheer fields (graceful warm fallback)
check("2.4: PARENT_CHEER_SEND with empty/null/missing payload falls back gracefully without 'undefined'", () => {
  const edgePayloads = [
    {},
    { otherKey: "something" },
    null,
    undefined,
    ""
  ];

  const env = createMockEnvironment();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;

  edgePayloads.forEach((payload, idx) => {
    bus.broadcast('PARENT_CHEER_SEND', payload);
    const speechText = env.getElement('child-milo-speech').innerText;
    assert(!speechText.includes("undefined"), `Edge payload #${idx} caused 'undefined' in speech: '${speechText}'`);
    assert(speechText.length > 5, `Edge payload #${idx} resulted in empty speech`);

    const toastDesc = env.getElement('sync-toast-desc').innerText;
    assert(!toastDesc.includes("undefined"), `Edge payload #${idx} caused 'undefined' in toast`);
  });
});

// Vector 2.5: WebSocket outbound cheer frame contains valid message & cheer_text without 'undefined'
check("2.5: WebSocket outbound PARENT_CHEER envelope contains valid message & cheer_text without 'undefined'", () => {
  const env = createMockEnvironment({ urlSearch: "?role=parent&room=family_test_room" });
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;
  bus.role = 'parent';
  bus.isWsConnected = true;
  if (bus.ws) {
    bus.ws.readyState = env.sandbox.WebSocket.OPEN;
  }

  const testPayloads = [
    { message: "Mẹ tự hào về Leo!" },
    { cheerText: "Leo cố lên nhé!" },
    "Bé yêu của mẹ làm rất tốt!"
  ];

  testPayloads.forEach((payload) => {
    bus.broadcast('PARENT_CHEER_SEND', payload);
  });

  const cheerFrames = env.allWsSent
    .map(m => { try { return JSON.parse(m); } catch(e) { return null; } })
    .filter(m => m && m.event_type === "PARENT_CHEER");

  assert.strictEqual(cheerFrames.length, 3, `Expected 3 outbound PARENT_CHEER WS frames, found ${cheerFrames.length}`);

  cheerFrames.forEach((frame, idx) => {
    const rawFrame = JSON.stringify(frame);
    assert(!rawFrame.includes("undefined"), `WS Frame #${idx} contains 'undefined': ${rawFrame}`);
    assert(typeof frame.cheer_text === 'string' && frame.cheer_text.length > 0, `Frame #${idx} missing valid cheer_text`);
    assert(typeof frame.message === 'string' && frame.message.length > 0, `Frame #${idx} missing valid message`);
  });
});

// Vector 2.6: Inbound WebSocket KID_RECEIVE_CHEER translation to local PARENT_CHEER_SEND
check("2.6: Inbound WebSocket KID_RECEIVE_CHEER translates cleanly to local PARENT_CHEER_SEND without 'undefined'", () => {
  const env = createMockEnvironment({ urlSearch: "?role=child&room=family_test_room" });
  env.mockWindow._fireEvent('DOMContentLoaded');
  const bus = env.sandbox.window.miloBus;

  // Simulate server sending KID_RECEIVE_CHEER with cheer_text
  bus._handleIncomingWsMessage({
    event_type: "KID_RECEIVE_CHEER",
    cheer_text: "Tuyệt vời lắm con trai!"
  });

  let speechText = env.getElement('child-milo-speech').innerText;
  assert(speechText.includes("Tuyệt vời lắm con trai!"), `Speech must contain cheer text: ${speechText}`);
  assert(!speechText.includes("undefined"), `Speech must not contain 'undefined': ${speechText}`);

  // Simulate server sending KID_RECEIVE_CHEER with message
  bus._handleIncomingWsMessage({
    event_type: "KID_RECEIVE_CHEER",
    message: "Con đã vượt qua thử thách!"
  });

  speechText = env.getElement('child-milo-speech').innerText;
  assert(speechText.includes("Con đã vượt qua thử thách!"), `Speech must contain message text: ${speechText}`);
  assert(!speechText.includes("undefined"), `Speech must not contain 'undefined': ${speechText}`);
});

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}                       CHALLENGE TEST SUMMARY                         ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
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
  console.log(`\nAll Storage & Cheer Adversarial Vectors Passed Cleanly with Zero Exceptions!`);
  console.log(`Verdict: ${GREEN}${BOLD}APPROVE${RESET}`);
  process.exit(0);
}