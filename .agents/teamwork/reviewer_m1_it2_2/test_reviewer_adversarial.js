/**
 * Independent Adversarial Verification Suite by reviewer_m1_it2_2
 * Tests:
 * 1. Hydration of selectedCatalogIds from localStorage and reflection in parent catalog checkboxes
 * 2. renderChildIslandRoadmap behavior under empty, null, and malformed task lists
 * 3. PARENT_CHEER_SEND contract and display robustness
 * 4. TASK_ASSIGN_BATCH edge case resilience
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// 1. Read generated index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // Skip tailwind config
const appScriptMatch = scriptRegex.exec(html);
assert(appScriptMatch, "Failed to extract main app script from index.html");
const appScript = appScriptMatch[1];

function createIsolatedEnv(initialStorage = {}) {
  const store = { ...initialStorage };
  const mockLocalStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const dom = {};
  function makeElement(id) {
    if (!dom[id]) {
      dom[id] = {
        id,
        classList: {
          _classes: new Set(['hidden']),
          add(...cls) { cls.forEach(c => this._classes.add(c)); },
          remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
          toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
          contains(c) { return this._classes.has(c); }
        },
        _children: [],
        set innerHTML(val) {
          if (val === '') this._children = [];
          this._innerHTML = val;
        },
        get innerHTML() { return this._innerHTML || ''; },
        get children() { return this._children; },
        innerText: '',
        value: '',
        appendChild(child) {
          this._children.push(child);
        },
        setAttribute(k, v) { this[k] = v; },
        parentElement: null
      };
      dom[id].parentElement = {
        classList: {
          _classes: new Set(),
          add(...cls) { cls.forEach(c => this._classes.add(c)); },
          remove(...cls) { cls.forEach(c => this._classes.delete(c)); }
        }
      };
    }
    return dom[id];
  }

  // Pre-seed known DOM IDs
  const knownIds = [
    'catalog-tasks-list', 'child-roadmap-counter', 'child-current-icon',
    'child-current-title', 'child-current-sub', 'child-current-reward',
    'child-milo-speech', 'node-island-next', 'child-next-icon',
    'child-next-title', 'child-next-reward', 'telemetry-task-title',
    'telemetry-progress-text', 'telemetry-status-badge', 'telemetry-duration',
    'child-screen-home', 'child-screen-workspace', 'child-screen-rewards',
    'parent-golden-ticket-banner', 'p-reward-dot', 'parent-ticket-desc',
    'batch-selected-count', 'batch-total-time', 'batch-total-stars',
    'btn-parent-dispatch'
  ];
  knownIds.forEach(makeElement);

  const mockDocument = {
    getElementById: (id) => makeElement(id),
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        classList: {
          _classes: new Set(),
          add(...cls) { cls.forEach(c => this._classes.add(c)); },
          remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
          contains(c) { return this._classes.has(c); }
        },
        className: '',
        innerText: '',
        innerHTML: '',
        children: [],
        appendChild(child) { this.children.push(child); },
        setAttribute(k, v) { this[k] = v; }
      };
    },
    querySelectorAll: () => []
  };

  const listeners = {};
  const mockWindow = {
    addEventListener: (ev, fn) => {
      listeners[ev] = listeners[ev] || [];
      listeners[ev].push(fn);
    },
    location: { search: '' },
    localStorage: mockLocalStorage,
    _trigger: (ev, data) => {
      if (listeners[ev]) listeners[ev].forEach(fn => fn(data));
    }
  };

  class MockBC {
    constructor(name) { this.name = name; }
    postMessage() {}
    close() {}
  }

  class MockWS {
    constructor() {}
    send() {}
    close() {}
  }

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    BroadcastChannel: MockBC,
    WebSocket: MockWS,
    AudioContext: class { createOscillator() { return { connect(){}, start(){}, stop(){} }; } },
    webkitAudioContext: class {},
    console: { log(){}, warn(){}, error(){} },
    setTimeout: (fn) => fn(),
    setInterval: () => 1,
    clearInterval: () => {},
    clearTimeout: () => {},
    URLSearchParams: class { get() { return null; } }
  };

  const wrappedScript = appScript + `
    ;__exports__ = {
      taskDatabase,
      appState,
      MiloSyncBus,
      renderParentCatalogList,
      renderChildIslandRoadmap,
      toggleCatalogItem,
      selectAllCatalog,
      parentSendCheer
    };
  `;

  vm.createContext(sandbox);
  vm.runInContext(wrappedScript, sandbox);

  return {
    sandbox,
    dom,
    exports: sandbox.__exports__,
    triggerDOMReady: () => mockWindow._trigger('DOMContentLoaded')
  };
}

// -------------------------------------------------------------
// TEST SUITE EXECUTION
// -------------------------------------------------------------
let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log("\n=== INDEPENDENT REVIEWER ADVERSARIAL STRESS SUITE ===");

// 1. Storage Hydration & Catalog Checkbox Reflection
runTest("1.1: selectedCatalogIds hydrates from localStorage into appState Set", () => {
  const initial = {
    'milo_quest_saved_state': JSON.stringify({
      version: 1,
      selectedCatalogIds: ['G2_MATH_06', 'G3_ENG_18']
    })
  };
  const env = createIsolatedEnv(initial);
  env.triggerDOMReady();

  const { appState } = env.exports;
  assert(appState.selectedCatalogIds.constructor.name === 'Set', "selectedCatalogIds must be a Set");
  assert.strictEqual(appState.selectedCatalogIds.has('G2_MATH_06'), true);
  assert.strictEqual(appState.selectedCatalogIds.has('G3_ENG_18'), true);
  assert.strictEqual(appState.selectedCatalogIds.has('G1_MATH_01'), false);
});

runTest("1.2: Parent catalog UI renders input checkbox with 'checked' for hydrated tasks", () => {
  const initial = {
    'milo_quest_saved_state': JSON.stringify({
      version: 1,
      selectedCatalogIds: ['G2_MATH_06']
    })
  };
  const env = createIsolatedEnv(initial);
  env.triggerDOMReady();

  const container = env.dom['catalog-tasks-list'];
  assert(container.children.length > 0, "Catalog container must have rendered task card children");

  const g2Card = container.children.find(c => c['data-task-id'] === 'G2_MATH_06');
  assert(g2Card, "G2_MATH_06 card must exist in rendered children");
  assert(/<input[^>]+[\s]checked[\s>]/i.test(g2Card.innerHTML), "G2_MATH_06 checkbox must have 'checked' attribute");
  assert(g2Card.className.includes('border-teal-400'), "G2_MATH_06 card must have highlighted border class");

  const g1Card = container.children.find(c => c['data-task-id'] === 'G1_MATH_01');
  assert(g1Card, "G1_MATH_01 card must exist in rendered children");
  assert(!/<input[^>]+[\s]checked[\s>]/i.test(g1Card.innerHTML), "G1_MATH_01 checkbox must NOT have 'checked' attribute");
});

runTest("1.3: Malformed selectedCatalogIds in storage (numbers, empty strings) sanitized gracefully", () => {
  const initial = {
    'milo_quest_saved_state': JSON.stringify({
      version: 1,
      selectedCatalogIds: [null, 1234, '', '   ', 'G3_VIET_13']
    })
  };
  const env = createIsolatedEnv(initial);
  env.triggerDOMReady();

  const { appState } = env.exports;
  assert.strictEqual(appState.selectedCatalogIds.has('G3_VIET_13'), true);
  assert.strictEqual(appState.selectedCatalogIds.size, 1);
});

// 2. renderChildIslandRoadmap Robustness
runTest("2.1: renderChildIslandRoadmap handles empty childRoadmap array without crashing", () => {
  const env = createIsolatedEnv();
  const { appState, renderChildIslandRoadmap } = env.exports;
  appState.childRoadmap = [];
  
  assert.doesNotThrow(() => {
    renderChildIslandRoadmap();
  });
  assert(appState.childRoadmap.length > 0, "childRoadmap must fall back to default island");
  assert.strictEqual(env.dom['child-current-title'].innerText, appState.childRoadmap[0].title);
});

runTest("2.2: renderChildIslandRoadmap handles childRoadmap = null without crashing", () => {
  const env = createIsolatedEnv();
  const { appState, renderChildIslandRoadmap } = env.exports;
  appState.childRoadmap = null;

  assert.doesNotThrow(() => {
    renderChildIslandRoadmap();
  });
  assert(Array.isArray(appState.childRoadmap), "childRoadmap must recover to an array");
});

runTest("2.3: renderChildIslandRoadmap handles corrupt tasks [null, undefined, { id: 'x' }] safely", () => {
  const env = createIsolatedEnv();
  const { appState, renderChildIslandRoadmap } = env.exports;
  appState.childRoadmap = [null, undefined, { id: 'corrupt_no_steps' }];
  appState.currentRoadmapIndex = 0;

  assert.doesNotThrow(() => {
    renderChildIslandRoadmap();
  });
  assert(appState.activeTask, "activeTask must be substituted with safeDefaultIsland");
  assert(appState.activeTask.steps.length > 0, "activeTask must contain valid steps");
  assert.strictEqual(env.dom['child-current-icon'].innerText, appState.activeTask.icon);
});

runTest("2.4: renderChildIslandRoadmap bounds clamping when currentRoadmapIndex is out of range", () => {
  const env = createIsolatedEnv();
  const { appState, renderChildIslandRoadmap } = env.exports;
  appState.currentRoadmapIndex = 9999;

  assert.doesNotThrow(() => {
    renderChildIslandRoadmap();
  });
  assert.strictEqual(appState.currentRoadmapIndex, 0, "currentRoadmapIndex should clamp to 0");
});

// 3. PARENT_CHEER_SEND Variations
runTest("3.1: PARENT_CHEER_SEND with { message: '...' } renders speech bubble without 'undefined'", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();

  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', { message: 'Mẹ khen con nỗ lực!' });
  const speech = env.dom['child-milo-speech'].innerText;
  assert(!speech.includes('undefined'), `Speech bubble must not show 'undefined': ${speech}`);
  assert(speech.includes('Mẹ khen con nỗ lực!'), `Speech bubble must contain message: ${speech}`);
});

runTest("3.2: PARENT_CHEER_SEND with { cheerText: '...' } renders speech bubble without 'undefined'", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();

  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', { cheerText: 'Con làm tốt lắm!' });
  const speech = env.dom['child-milo-speech'].innerText;
  assert(!speech.includes('undefined'), `Speech bubble must not show 'undefined': ${speech}`);
  assert(speech.includes('Con làm tốt lắm!'), `Speech bubble must contain cheerText: ${speech}`);
});

runTest("3.3: PARENT_CHEER_SEND with empty payload falls back to warm Vietnamese praise without 'undefined'", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();

  env.sandbox.window.miloBus.broadcast('PARENT_CHEER_SEND', {});
  const speech = env.dom['child-milo-speech'].innerText;
  assert(!speech.includes('undefined'), `Speech bubble must not show 'undefined': ${speech}`);
  assert(speech.includes('Mẹ rất tự hào về con!'), `Speech bubble must show default cheer: ${speech}`);
});

// 4. Interactive Mutations & LocalStorage Synchronization
runTest("4.1: toggleCatalogItem unchecking removes ID from appState and updates localStorage", () => {
  const env = createIsolatedEnv({
    'milo_quest_saved_state': JSON.stringify({ version: 1, selectedCatalogIds: ['G2_MATH_06', 'G1_MATH_01'] })
  });
  env.triggerDOMReady();

  env.exports.toggleCatalogItem('G2_MATH_06', false);
  const { appState } = env.exports;
  assert.strictEqual(appState.selectedCatalogIds.has('G2_MATH_06'), false);
  assert.strictEqual(appState.selectedCatalogIds.has('G1_MATH_01'), true);

  // Check persisted localStorage
  const saved = JSON.parse(env.sandbox.localStorage.getItem('milo_quest_saved_state'));
  assert.deepStrictEqual(saved.selectedCatalogIds, ['G1_MATH_01']);
});

runTest("4.2: selectAllCatalog(true) adds all 29 tasks and writes through to localStorage", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();

  env.exports.selectAllCatalog(true);
  const { appState } = env.exports;
  assert.strictEqual(appState.selectedCatalogIds.size, 29);

  const saved = JSON.parse(env.sandbox.localStorage.getItem('milo_quest_saved_state'));
  assert.strictEqual(saved.selectedCatalogIds.length, 29);
});

runTest("4.3: selectAllCatalog(false) clears selections and writes through to localStorage", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();

  env.exports.selectAllCatalog(false);
  const { appState } = env.exports;
  assert.strictEqual(appState.selectedCatalogIds.size, 0);

  const saved = JSON.parse(env.sandbox.localStorage.getItem('milo_quest_saved_state'));
  assert.strictEqual(saved.selectedCatalogIds.length, 0);
});

runTest("4.4: Corrupted roadmap in localStorage ([null, 'foo', 123, { id: 'x' }]) is sanitized during hydration", () => {
  const initial = {
    'milo_quest_saved_state': JSON.stringify({
      version: 1,
      childRoadmap: [null, 'invalid_string', 12345, { id: 'corrupt_missing_steps' }]
    })
  };
  const env = createIsolatedEnv(initial);
  assert.doesNotThrow(() => {
    env.triggerDOMReady();
  });
  const { appState } = env.exports;
  assert(appState.childRoadmap.length > 0, "childRoadmap must retain valid defaults");
  assert(appState.childRoadmap.every(t => t && t.id && Array.isArray(t.steps) && t.steps.length > 0));
});

runTest("4.5: TASK_ASSIGN_BATCH with malformed items ignores invalid batch without corrupting current roadmap", () => {
  const env = createIsolatedEnv();
  env.triggerDOMReady();
  const { appState } = env.exports;
  const initialCount = appState.childRoadmap.length;

  env.sandbox.window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
    tasks: [null, undefined, { id: 'no_steps' }, 1234]
  });

  assert.strictEqual(appState.childRoadmap.length, initialCount, "Roadmap should remain unchanged on invalid batch");
});

console.log(`\nResults: ${passed}/${total} tests passed.\n`);
if (passed !== total) process.exit(1);
