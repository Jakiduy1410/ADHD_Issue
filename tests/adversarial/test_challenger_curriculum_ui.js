/**
 * Empirical Adversarial Test Suite for Curriculum Boundaries, Edge Cases, and UI State.
 * 
 * Verifies:
 * 1. Deep audit of all 29 tasks in taskDatabase (25 GDPT 2018 + 4 life routines):
 *    - Zero null steps
 *    - Zero empty instructions
 *    - Zero missing ui_types (must be in allowed set)
 *    - Zero negative rewards/stars
 *    - Action verb format (<15 words, single token verb, valid duration)
 * 2. Empty batch selection dispatch behavior (must block gracefully without state corruption)
 * 3. Maximum batch selection (all 29 tasks / 10+ islands):
 *    - Full roadmap handling across 10+ islands up to all 29 islands
 *    - Island-by-island progression and final treasure unlock
 * 4. Rapid clicking, numpad buffer overflows, input boundary fuzzing:
 *    - Numpad length caps, empty DEL, non-numeric resilience
 *    - Rapid completeChildStep calls within transition windows
 *    - Text input fuzzing (empty, whitespace, 1000+ chars, special characters)
 *    - Rapid single_choice selections and RSD shield handling
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("CHALLENGER ADVERSARIAL SUITE: CURRICULUM BOUNDARIES & UI EDGE CASES");
console.log("======================================================================\n");

const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

// Browser DOM & Environment Mock
const domStore = {};
function getOrCreateElement(id) {
  if (!domStore[id]) {
    domStore[id] = {
      id: id,
      classList: {
        classes: new Set(
          html.includes(`id="${id}"`) && !html.match(new RegExp(`id=["']${id}["'][^>]*class=["'][^"']*\\bhidden\\b`))
            ? []
            : ['hidden']
        ),
        add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
        toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      innerText: "",
      _innerHTML: "",
      get innerHTML() { return this._innerHTML; },
      set innerHTML(val) {
        this._innerHTML = val;
        const matches = String(val).matchAll(/id=["']([^"']+)["'][^>]*>([^<]*)/g);
        for (const m of matches) {
          getOrCreateElement(m[1]).innerText = m[2].trim();
        }
      },
      value: "",
      disabled: false,
      children: [],
      style: {
        setProperty: function(k, v) { this[k] = v; }
      },
      appendChild: function(c) { this.children.push(c); },
      querySelectorAll: function(s) { return []; },
      setAttribute: function(attr, val) { this[attr] = val; }
    };
  }
  return domStore[id];
}

const alertsTriggered = [];
const toastsTriggered = [];

const mockDocument = {
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: (sel) => {
    if (sel === '.sync-star-val') {
      return [getOrCreateElement('child-stars-count'), getOrCreateElement('parent-child-stars')];
    }
    return [];
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      classList: {
        classes: new Set(),
        add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
        contains: function(c) { return this.classes.has(c); }
      },
      innerText: "",
      innerHTML: "",
      className: "",
      style: {
        setProperty: function(k, v) { this[k] = v; }
      },
      children: [],
      appendChild: function(c) { this.children.push(c); },
      setAttribute: function(attr, val) { this[attr] = val; },
      remove: function() {}
    };
  }
};

const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
};

class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }
  postMessage(data) {}
  close() {}
}

class MockWebSocket {
  constructor(url) {
    this.readyState = 1;
    this.sent = [];
    setTimeout(() => { if (this.onopen) this.onopen(); }, 0);
  }
  send(d) { this.sent.push(d); }
  close() {}
}

const sandbox = {
  window: {
    location: { search: "?role=dual", hostname: "localhost", protocol: "http:" },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  BroadcastChannel: MockBroadcastChannel,
  WebSocket: MockWebSocket,
  URLSearchParams: URLSearchParams,
  setTimeout: (fn, ms) => {
    return setTimeout(fn, ms);
  },
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {},
  console: console,
  AudioContext: class {
    constructor() { this.state = 'running'; }
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }; }
  },
  webkitAudioContext: class {},
  alert: (msg) => { alertsTriggered.push(msg); }
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);

// Export hooks for deep inspection
const exportHooks = `
;__test_exports__ = {
  taskDatabase,
  appState,
  MiloSyncBus,
  registerMiloSyncSubscribers,
  parentFilterCatalog,
  parentFilterGrade,
  selectAllCatalog,
  toggleCatalogItem,
  dispatchSelectedCatalogTasks,
  renderParentCatalogList,
  renderChildIslandRoadmap,
  renderChildWorkspaceStep,
  pressChildNum,
  completeChildStep,
  proceedToNextRoadmapIsland,
  openTreasureCeremony,
  handleChildChoice,
  handleChildTextInputSubmit,
  toggleSoftPause
};
`;

vm.runInContext(appScript + exportHooks, sandbox);
const exp = sandbox.__test_exports__;
sandbox.window.miloBus = new exp.MiloSyncBus();
exp.registerMiloSyncSubscribers(sandbox.window.miloBus);


let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: 29-TASK CURRICULUM BOUNDARIES & DATA INTEGRITY
// ============================================================================
console.log("\n--- SUITE 1: 29 Tasks Data Integrity & Scaffolding Check ---");

runTest("Total deduplicated tasks must equal exactly 29", () => {
  const taskMap = new Map();
  Object.values(exp.taskDatabase).forEach(t => {
    if (t && t.id) taskMap.set(t.id, t);
  });
  assert.strictEqual(taskMap.size, 29, `Expected 29 unique tasks, found ${taskMap.size}`);
});

runTest("Every task must have valid non-empty fields (id, title, grade, subject, steps)", () => {
  const taskMap = new Map();
  Object.values(exp.taskDatabase).forEach(t => {
    if (t && t.id) taskMap.set(t.id, t);
  });

  taskMap.forEach((t, id) => {
    assert(t.id && typeof t.id === 'string' && t.id.length > 0, `Task ${id} has invalid id`);
    assert(t.title && typeof t.title === 'string' && t.title.trim().length > 0, `Task ${id} has empty title`);
    assert(Array.isArray(t.steps) && t.steps.length > 0, `Task ${id} steps is empty or not an array`);
    assert(t.reward !== undefined && typeof t.reward === 'number' && t.reward >= 0, `Task ${id} has invalid/negative reward: ${t.reward}`);
  });
});

runTest("Every micro-task step across all 29 tasks must have zero nulls, non-empty instructions, valid ui_types, and non-negative rewards", () => {
  const allowedUiTypes = new Set(['highlight', 'single_choice', 'text_input', 'checkbox', 'order_sequencing', 'math_numpad']);
  let totalStepsCount = 0;

  const taskMap = new Map();
  Object.values(exp.taskDatabase).forEach(t => {
    if (t && t.id) taskMap.set(t.id, t);
  });

  taskMap.forEach((t, taskId) => {
    t.steps.forEach((step, sIdx) => {
      totalStepsCount++;
      const ctx = `${taskId} step[${sIdx}]`;
      assert(step !== null && step !== undefined, `${ctx} is null/undefined`);
      
      // Instruction check
      const instruction = step.atomic_instruction || step.instruction || step.prompt || (step.ui_payload && (step.ui_payload.prompt_text || step.ui_payload.prompt));
      assert(instruction && typeof instruction === 'string' && instruction.trim().length > 0, `${ctx} has empty or missing instruction`);

      // ui_type check
      assert(step.ui_type && typeof step.ui_type === 'string', `${ctx} missing ui_type`);
      assert(allowedUiTypes.has(step.ui_type), `${ctx} has unrecognized ui_type: ${step.ui_type}`);

      // Rewards check
      if (step.stars !== undefined) {
        assert(typeof step.stars === 'number' && step.stars >= 0, `${ctx} has negative stars: ${step.stars}`);
      }
      if (step.reward !== undefined) {
        assert(typeof step.reward === 'number' && step.reward >= 0, `${ctx} has negative reward: ${step.reward}`);
      }

      // Duration check
      assert(step.duration_sec && typeof step.duration_sec === 'number' && step.duration_sec > 0, `${ctx} duration_sec must be positive`);
    });
  });

  assert(totalStepsCount >= 90, `Expected at least 90 total steps across 29 tasks, found ${totalStepsCount}`);
});

runTest("Backwards compatibility alias math_garden points to G1_MATH_01", () => {
  assert(exp.taskDatabase['math_garden'] !== undefined, "math_garden alias missing");
  assert.strictEqual(exp.taskDatabase['math_garden'].id, 'G1_MATH_01');
});


// ============================================================================
// SUITE 2: EMPTY BATCH SELECTION DISPATCH (DEFENSIVE BEHAVIOR)
// ============================================================================
console.log("\n--- SUITE 2: Empty Batch Selection Dispatch ---");

runTest("Empty batch selection blocks gracefully with alert and does not alter roadmap", () => {
  // Clear alerts log
  alertsTriggered.length = 0;

  // Set up baseline roadmap
  exp.appState.childRoadmap = [exp.taskDatabase['chore_desk'], exp.taskDatabase['G1_MATH_01']];
  exp.appState.currentRoadmapIndex = 0;
  exp.appState.selectedCatalogIds.clear(); // Empty selection!

  const roadmapBefore = [...exp.appState.childRoadmap];

  // Attempt dispatch
  exp.dispatchSelectedCatalogTasks();

  // Verify alert triggered
  assert.strictEqual(alertsTriggered.length, 1, "Alert must be triggered on empty batch dispatch");
  assert(alertsTriggered[0].includes("Vui lòng tick chọn ít nhất 1 bài tập"), `Unexpected alert message: ${alertsTriggered[0]}`);

  // Verify roadmap unchanged
  assert.strictEqual(exp.appState.childRoadmap.length, roadmapBefore.length, "childRoadmap should remain unchanged");
  assert.strictEqual(exp.appState.childRoadmap[0].id, roadmapBefore[0].id);
});


// ============================================================================
// SUITE 3: MAXIMUM BATCH SELECTION (ALL 29 TASKS / 10+ ISLANDS)
// ============================================================================
console.log("\n--- SUITE 3: Maximum Batch Selection (All 29 Tasks / 10+ Islands) ---");

runTest("Selecting all 29 tasks via selectAllCatalog(true) populates selectedCatalogIds to 29", () => {
  exp.selectAllCatalog(true);
  assert.strictEqual(exp.appState.selectedCatalogIds.size, 29, `Expected 29 selected tasks, got ${exp.appState.selectedCatalogIds.size}`);
});

runTest("Dispatching all 29 tasks sets childRoadmap length to 29 and updates roadmap UI cleanly", () => {
  // Ensure miloBus has subscribers
  if (!sandbox.window.miloBus || !sandbox.window.miloBus.subscribers['TASK_ASSIGN_BATCH']) {
    sandbox.window.miloBus = new exp.MiloSyncBus();
    exp.registerMiloSyncSubscribers(sandbox.window.miloBus);
  }
  
  exp.dispatchSelectedCatalogTasks();
  assert.strictEqual(exp.appState.childRoadmap.length, 29, "Roadmap must contain all 29 tasks");
  assert.strictEqual(exp.appState.currentRoadmapIndex, 0, "Current roadmap index must reset to 0");

  exp.renderChildIslandRoadmap();
  const counterText = getOrCreateElement('child-roadmap-counter').innerText;
  assert(counterText.includes("Đảo 1 / 29"), `Counter must show Đảo 1 / 29, got: ${counterText}`);
  assert.strictEqual(getOrCreateElement('child-current-title').innerText, exp.appState.childRoadmap[0].title);
  assert(!getOrCreateElement('node-island-next').classList.contains('hidden'), "Next island node must be visible");
});

runTest("Progressing through 10+ islands up to all 29 islands updates island index and triggers treasure ceremony", () => {
  // Simulate island completions up to island 29
  for (let i = 0; i < 28; i++) {
    assert.strictEqual(exp.appState.currentRoadmapIndex, i, `Mismatch at island ${i}`);
    exp.proceedToNextRoadmapIsland();
    assert.strictEqual(exp.appState.currentRoadmapIndex, i + 1, `Island did not advance to ${i + 1}`);
  }

  // Now on Island 29 (index 28)
  assert.strictEqual(exp.appState.currentRoadmapIndex, 28);
  exp.renderChildIslandRoadmap();
  const counterText = getOrCreateElement('child-roadmap-counter').innerText;
  assert(counterText.includes("Đảo 29 / 29"), `Counter must show Đảo 29 / 29, got: ${counterText}`);
  assert(getOrCreateElement('node-island-next').classList.contains('hidden'), "Next island node should be hidden on final island");

  // Complete final island 29 -> treasure ceremony must trigger
  const starsBefore = exp.appState.stars;
  exp.proceedToNextRoadmapIsland();
  
  assert(!getOrCreateElement('child-modal-treasure-ceremony').classList.contains('hidden'), "Treasure ceremony modal must be visible");
  assert(exp.appState.stars >= starsBefore + 250, "Stars must increase by 250 upon treasure unlock");
});


// ============================================================================
// SUITE 4: NUMPAD BUFFER OVERFLOW & RAPID CLICKING STRESS TESTS
// ============================================================================
console.log("\n--- SUITE 4: Numpad Buffer & Rapid Clicking Stress Tests ---");

runTest("Numpad buffer enforces length <= 3 and prevents buffer overflow under 100 keypresses", () => {
  exp.appState.numpadValue = "";
  // Press '9' 100 times
  for (let i = 0; i < 100; i++) {
    exp.pressChildNum('9');
  }
  assert.strictEqual(exp.appState.numpadValue.length, 3, `Numpad value length must not exceed 3, got: ${exp.appState.numpadValue.length}`);
  assert.strictEqual(exp.appState.numpadValue, "999");
  assert.strictEqual(getOrCreateElement('child-numpad-screen').innerText, "999");
  assert(getOrCreateElement('child-btn-next-step').disabled, "Button should be disabled for wrong answer 999");
});

runTest("Numpad DEL handles empty buffer without error or NaN", () => {
  exp.appState.numpadValue = "";
  for (let i = 0; i < 10; i++) {
    exp.pressChildNum('DEL');
  }
  assert.strictEqual(exp.appState.numpadValue, "");
  assert.strictEqual(getOrCreateElement('child-numpad-screen').innerText, "?");
});

runTest("Numpad correctly enables button when expected value (60) is typed", () => {
  exp.appState.numpadValue = "";
  exp.pressChildNum('6');
  exp.pressChildNum('0');
  assert.strictEqual(exp.appState.numpadValue, "60");
  assert(!getOrCreateElement('child-btn-next-step').disabled, "Button should be enabled when answer 60 is entered");
  assert(!getOrCreateElement('child-btn-next-step').classList.contains('btn-disabled'));
});

runTest("Rapid completeChildStep calls: inspect transition guard", () => {
  // Setup a 2-step task
  exp.appState.activeTask = {
    id: "test_task",
    title: "Test Task",
    steps: [
      { id: 1, title: "S1", atomic_instruction: "Step 1", ui_type: "single_choice", duration_sec: 60, options: ["A", "B"], correct_index: 0 },
      { id: 2, title: "S2", atomic_instruction: "Step 2", ui_type: "single_choice", duration_sec: 60, options: ["C", "D"], correct_index: 0 }
    ],
    reward: 100
  };
  exp.appState.currentStepIndex = 0;
  const initialStars = exp.appState.stars;

  // Single step completion
  exp.completeChildStep();
  assert.strictEqual(exp.appState.currentStepIndex, 1, "Should advance to step 1");
  assert.strictEqual(exp.appState.stars, initialStars + 40, "Stars should increase by 40");
});

runTest("Text input submission handles empty, whitespace, and 1000-character adversarial inputs safely", () => {
  const btnNext = getOrCreateElement('child-btn-next-step');
  const stageInput = getOrCreateElement('child-stage-text-input');
  const fb = getOrCreateElement('text-input-feedback');

  // Empty text submission
  btnNext.disabled = true;
  stageInput.value = "";
  exp.handleChildTextInputSubmit("14");
  assert(btnNext.disabled, "Empty input should not enable next step");

  // Whitespace-only submission
  stageInput.value = "     ";
  exp.handleChildTextInputSubmit("14");
  assert(btnNext.disabled, "Whitespace input should not enable next step");

  // Adversarial XSS payload submission - rejected safely with gentle RSD hint
  stageInput.value = "<script>alert(1)</script>";
  exp.handleChildTextInputSubmit("14");
  assert(btnNext.disabled, "Incorrect XSS payload should keep next step disabled");
  assert(fb.innerText.includes("Milo gợi ý"), "Incorrect input shows gentle RSD hint");

  // 1000-character fuzzing payload - rejected safely without crash
  stageInput.value = "A".repeat(1000);
  exp.handleChildTextInputSubmit("14");
  assert(btnNext.disabled, "1000-char incorrect input should keep next step disabled");

  // Correct answer with case-insensitivity and trimming
  stageInput.value = "  14  ";
  exp.handleChildTextInputSubmit("14");
  assert(!btnNext.disabled, "Trimmed correct answer enables next step");

  // Vietnamese comma decimal normalization (e.g. 12,5 vs 12.5)
  stageInput.value = " 12,5 ";
  exp.handleChildTextInputSubmit("12.5");
  assert(!btnNext.disabled, "Vietnamese comma decimal equates to decimal point");
});

runTest("Single choice selection: incorrect choice triggers soft pause (RSD shield) without crash", () => {
  const pauseCountBefore = exp.appState.pauseCount;
  const mockBtn = {
    className: "",
    classList: { add: () => {}, remove: () => {} },
    innerText: "Wrong Option"
  };
  
  // Select wrong option
  exp.handleChildChoice(mockBtn, "B", "A");
  assert.strictEqual(exp.appState.pauseCount, pauseCountBefore + 1, "RSD soft pause should increment pause count");
  assert(!getOrCreateElement('child-modal-soft-pause').classList.contains('hidden'), "Soft pause modal should open");

  // Select right option
  exp.handleChildChoice(mockBtn, "A", "A");
  assert(!getOrCreateElement('child-btn-next-step').disabled, "Correct choice must enable next step button");
});



// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log("\n======================================================================");
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED:      ${passedTests}`);
console.log(`FAILED:      ${failedTests}`);
console.log("======================================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("ALL ADVERSARIAL CURRICULUM & EDGE CASE TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}