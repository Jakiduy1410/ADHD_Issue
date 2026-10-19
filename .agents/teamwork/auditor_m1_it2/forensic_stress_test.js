/**
 * FORENSIC AUDITOR INDEPENDENT STRESS & CONTRACT VERIFICATION
 * Target: index.html extracted app script
 * Auditor: auditor_m1_it2
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("=== FORENSIC AUDIT EMPIRICAL VERIFICATION START ===");

// 1. Extract script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // skip tailwind config
const appScriptMatch = scriptRegex.exec(html);
assert(appScriptMatch, "Failed to extract script from index.html");
const appScript = appScriptMatch[1];

function createMockEnv(initialStorage = {}) {
  const store = { ...initialStorage };
  const mockLocalStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; }
  };

  const domElements = {};
  function getElement(id) {
    if (!domElements[id]) {
      domElements[id] = {
        id,
        innerText: '',
        innerHTML: '',
        classList: {
          _classes: new Set(['hidden']),
          add: function(...args) { args.forEach(c => this._classes.add(c)); },
          remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
          contains: function(c) { return this._classes.has(c); }
        },
        children: [],
        appendChild: function(c) { this.children.push(c); c.parentElement = this; },
        parentElement: {
          classList: {
            _classes: new Set(),
            add: function(...args) { args.forEach(c => this._classes.add(c)); },
            remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
            contains: function(c) { return this._classes.has(c); }
          }
        }
      };
    }
    return domElements[id];
  }

  const mockDocument = {
    getElementById: (id) => getElement(id),
    querySelectorAll: () => [],
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      classList: {
        _classes: new Set(),
        add: function(...args) { args.forEach(c => this._classes.add(c)); },
        remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
        contains: function(c) { return this._classes.has(c); }
      },
      innerText: '',
      innerHTML: '',
      className: '',
      style: {},
      children: [],
      appendChild: function(c) { this.children.push(c); },
      setAttribute: function(k, v) { this[k] = v; },
      remove: () => {}
    })
  };

  const listeners = {};
  const mockWindow = {
    location: { search: '?role=dual' },
    addEventListener: (evt, cb) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(cb);
    },
    _fireEvent: (evt, data) => {
      if (listeners[evt]) listeners[evt].forEach(cb => cb(data));
    }
  };

  const allSent = [];
  const activeSockets = [];
  class MockWebSocket {
    static OPEN = 1;
    static CLOSED = 3;
    constructor(url) {
      this.url = url;
      this.readyState = 1;
      this.sent = [];
      this.onopen = null;
      this.onclose = null;
      this.onerror = null;
      this.onmessage = null;
      activeSockets.push(this);
    }
    send(msg) {
      this.sent.push(msg);
      allSent.push(msg);
    }
  }

  class MockBroadcastChannel {
    constructor(name) { this.name = name; }
    postMessage() {}
    close() {}
  }

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
    console: { log: () => {}, warn: () => {}, error: () => {} },
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
  const wrappedScript = appScript + "\n;__exports__ = { taskDatabase, appState, MiloSyncBus, renderChildIslandRoadmap, renderParentCatalogList, toggleCatalogItem, selectAllCatalog, parentSendCheer };";
  vm.runInContext(wrappedScript, sandbox);

  return {
    sandbox,
    mockWindow,
    mockDocument,
    mockLocalStorage,
    getElement,
    allSent,
    exports: sandbox.__exports__
  };
}

let checksPassed = 0;
let totalChecks = 0;

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    checksPassed++;
    console.log(`[PASS] ${title}`);
  } catch (err) {
    console.error(`[FAIL] ${title}: ${err.message}`);
    throw err;
  }
}

// TEST 1: Corrupted localStorage childRoadmap exact vector [null, undefined, {}, { id: 'x', steps: [] }]
check("1. Corrupted childRoadmap array in localStorage survives DOMContentLoaded without crashing", () => {
  const corruptedStorage = {
    'milo_quest_saved_state': JSON.stringify({
      stars: 450,
      childRoadmap: [null, undefined, {}, { id: 'x', steps: [] }]
    })
  };
  const env = createMockEnv(corruptedStorage);
  env.mockWindow._fireEvent('DOMContentLoaded');
  assert(env.exports.appState.childRoadmap.length > 0, "Roadmap must not be empty");
  assert(env.exports.appState.activeTask !== null, "activeTask must be defined");
  assert(Array.isArray(env.exports.appState.activeTask.steps), "activeTask must have steps array");
});

// TEST 2: Direct mutation of childRoadmap followed by renderChildIslandRoadmap()
check("2. Malformed childRoadmap does not crash renderChildIslandRoadmap()", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  env.exports.appState.childRoadmap = [null, { id: 'empty_steps', steps: [] }];
  env.exports.appState.currentRoadmapIndex = 0;
  env.exports.renderChildIslandRoadmap();
  assert(env.exports.appState.activeTask !== null);
  assert(env.exports.appState.activeTask.icon);
});

// TEST 3: PARENT_CHEER_SEND with { message: "Test cheer" }
check("3. PARENT_CHEER_SEND with { message } does not display 'undefined'", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const speechEl = env.getElement('child-milo-speech');
  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', { message: "Con làm tốt lắm!" });
  assert(speechEl.innerText.includes("Con làm tốt lắm!"));
  assert(!speechEl.innerText.includes("undefined"));
});

// TEST 4: PARENT_CHEER_SEND with { cheerText: "Test cheer" }
check("4. PARENT_CHEER_SEND with { cheerText } does not display 'undefined'", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const speechEl = env.getElement('child-milo-speech');
  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', { cheerText: "Cố lên con yêu!" });
  assert(speechEl.innerText.includes("Cố lên con yêu!"));
  assert(!speechEl.innerText.includes("undefined"));
});

// TEST 5: PARENT_CHEER_SEND with string payload "Test cheer"
check("5. PARENT_CHEER_SEND with string payload does not display 'undefined'", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const speechEl = env.getElement('child-milo-speech');
  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', "Tuyệt vời!");
  assert(speechEl.innerText.includes("Tuyệt vời!"));
  assert(!speechEl.innerText.includes("undefined"));
});

// TEST 6: PARENT_CHEER_SEND with empty payload
check("6. PARENT_CHEER_SEND with empty payload uses safe fallback without 'undefined'", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const speechEl = env.getElement('child-milo-speech');
  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', {});
  assert(!speechEl.innerText.includes("undefined"));
  assert(speechEl.innerText.length > 5);
});

// TEST 7: selectedCatalogIds state persistence and hydration
check("7. selectedCatalogIds persists to localStorage and restores on DOMContentLoaded", () => {
  const env1 = createMockEnv();
  env1.mockWindow._fireEvent('DOMContentLoaded');
  env1.exports.toggleCatalogItem('G1_MATH_01', true);
  env1.exports.toggleCatalogItem('G2_MATH_06', true);
  
  const savedRaw = env1.mockLocalStorage.getItem('milo_quest_saved_state');
  assert(savedRaw, "State must be saved");
  const parsed = JSON.parse(savedRaw);
  assert(parsed.selectedCatalogIds.includes('G1_MATH_01'));
  assert(parsed.selectedCatalogIds.includes('G2_MATH_06'));

  // Reload in env2
  const env2 = createMockEnv({ 'milo_quest_saved_state': savedRaw });
  env2.mockWindow._fireEvent('DOMContentLoaded');
  assert(env2.exports.appState.selectedCatalogIds.has('G1_MATH_01'));
  assert(env2.exports.appState.selectedCatalogIds.has('G2_MATH_06'));
});

// TEST 8: WebSocket outbound cheer contains both message and cheer_text
check("8. WebSocket outbound cheer envelope includes message and cheer_text", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  if (env.sandbox.window.miloBus.ws && env.sandbox.window.miloBus.ws.onopen) {
    env.sandbox.window.miloBus.ws.onopen();
  }
  env.sandbox.window.miloBus.role = 'parent';
  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', { message: "Mẹ yêu con!" });
  const sentMsgs = env.allSent;
  assert(sentMsgs.length > 0, "Must send message via WebSocket");
  const parsed = JSON.parse(sentMsgs[sentMsgs.length - 1]);
  assert.strictEqual(parsed.event_type, "PARENT_CHEER");
  assert.strictEqual(parsed.message, "Mẹ yêu con!");
  assert.strictEqual(parsed.cheer_text, "Mẹ yêu con!");
  assert(!JSON.stringify(parsed).includes("undefined"));
});

// TEST 9: Inbound WebSocket KID_RECEIVE_CHEER translates without 'undefined'
check("9. Inbound WebSocket KID_RECEIVE_CHEER translates cleanly without 'undefined'", () => {
  const env = createMockEnv();
  env.mockWindow._fireEvent('DOMContentLoaded');
  const speechEl = env.getElement('child-milo-speech');
  env.sandbox.window.miloBus._handleIncomingWsMessage({
    event_type: "KID_RECEIVE_CHEER",
    message: "Bố khen con gái!"
  });
  assert(speechEl.innerText.includes("Bố khen con gái!"));
  assert(!speechEl.innerText.includes("undefined"));
});

console.log(`\nALL ${checksPassed}/${totalChecks} FORENSIC INDEPENDENT CHECKS PASSED EMPIRICALLY!`);
process.exit(0);
