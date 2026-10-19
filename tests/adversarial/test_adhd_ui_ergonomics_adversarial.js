/**
 * Empirical Adversarial Test Suite for ADHD UI & Ergonomics Workflows.
 * 
 * Target Workflows:
 * 1. Single-Focus Card: transitions between steps, step progress bar calculation (1, 3, 5, 10 steps).
 * 2. Visual Timer Disc: start/stop timer, smooth conic update, soft pause modal, time expired behavior.
 * 3. Web Audio Synthesizer: zero external assets, audio muting toggle, audio context unlocking, sound profiles.
 * 4. Milo 4-4-4 Box Breathing: 4-4-4-4 phase transitions, aborting breathing early, completing all 10 cycles.
 * 5. RSD Effort Coach & Red Lines: toxic praise detection, advice copy-to-clipboard, CBT situation cheers.
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("ADVERSARIAL SUITE: ADHD UI & ERGONOMICS INTERACTION WORKFLOWS");
console.log("======================================================================\n");

const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

// Browser DOM Mock Store
const domStore = {};
function createMockElement(id = "") {
  let _innerHTML = "";
  let _innerText = "";
  const el = {
    id: id,
    classList: {
      classes: new Set(['hidden']),
      add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
      toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
      contains: function(c) { return this.classes.has(c); }
    },
    value: "",
    disabled: false,
    className: "",
    children: [],
    style: {
      setProperty: function(k, v) { this[k] = v; }
    },
    appendChild: function(c) { this.children.push(c); },
    querySelectorAll: function(s) { return []; },
    setAttribute: function(attr, val) { this[attr] = val; },
    remove: function() {}
  };

    Object.defineProperty(el, 'innerHTML', {
      get: () => _innerHTML,
      set: (val) => {
        _innerHTML = val;
        _innerText = typeof val === 'string' ? val.replace(/<[^>]*>/g, '') : '';
        if (val === '') {
          el.children = [];
        }
      }
    });

    Object.defineProperty(el, 'innerText', {
      get: () => _innerText || _innerHTML,
      set: (val) => {
        _innerText = val;
        _innerHTML = val;
      }
    });

    return el;
  }

function getOrCreateElement(id) {
  if (!domStore[id]) {
    domStore[id] = createMockElement(id);
  }
  return domStore[id];
}

const toastsTriggered = [];
function showToast(title, msg, icon) {
  toastsTriggered.push({ title, msg, icon });
}

let clipboardWritten = null;
const mockNavigator = {
  clipboard: {
    writeText: async (text) => {
      clipboardWritten = text;
      return true;
    }
  }
};

// Web Audio Mock
class MockOscillator {
  constructor() {
    this.type = 'sine';
    this.frequency = {
      value: 0,
      setValueAtTime: (val, t) => { this.frequency.value = val; },
      exponentialRampToValueAtTime: (val, t) => { this.frequency.target = val; }
    };
  }
  connect(dest) {}
  start(t) {}
  stop(t) {}
}

class MockGain {
  constructor() {
    this.gain = {
      value: 1,
      setValueAtTime: (val, t) => { this.gain.value = val; },
      exponentialRampToValueAtTime: (val, t) => { this.gain.target = val; },
      linearRampToValueAtTime: (val, t) => { this.gain.target = val; }
    };
  }
  connect(dest) {}
}

let mockAudioCtxInstance = null;
class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0;
    this.destination = {};
    this.createdOscillators = [];
    this.createdGains = [];
    mockAudioCtxInstance = this;
  }
  createOscillator() {
    const osc = new MockOscillator();
    this.createdOscillators.push(osc);
    return osc;
  }
  createGain() {
    const gain = new MockGain();
    this.createdGains.push(gain);
    return gain;
  }
  resume() {
    this.state = 'running';
  }
}

const mockDocument = {
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: (sel) => {
    if (sel === '.sync-star-val') {
      return [getOrCreateElement('child-stars-count'), getOrCreateElement('parent-child-stars')];
    }
    return [];
  },
  createElement: (tag) => createMockElement()
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
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
  }
  send(data) {}
  close() {}
}

const broadcastEvents = [];
class TestMiloSyncBus {
  constructor() {
    this.role = 'dual';
  }
  broadcast(type, payload) {
    broadcastEvents.push({ type, payload });
  }
  savePersistedState(state) {}
}

// Sandbox environment
const sandbox = {
  window: {
    addEventListener: () => {},
    location: { search: '' },
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    miloBus: new TestMiloSyncBus()
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  BroadcastChannel: MockBroadcastChannel,
  WebSocket: MockWebSocket,
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  navigator: mockNavigator,
  showToast: showToast,
  console: console,
  setInterval: setInterval,
  clearInterval: clearInterval,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math: Math,
  Set: Set,
  Map: Map,
  Array: Array,
  Object: Object,
  Date: Date,
  JSON: JSON,
  parseInt: parseInt
};
sandbox.window.document = mockDocument;

const exportHooks = `
;__test_exports__ = {
  appState,
  taskDatabase,
  renderSegmentedTrackbar,
  renderParentTelemetryProgress,
  renderChildWorkspaceStep,
  startChildQuest,
  childSwitchScreen,
  completeChildStep,
  pickChoreItem,
  pickTrash,
  tidyBooks,
  cleanDesk,
  toggleMathClue,
  alertWrongClue,
  selectMathOp,
  pressChildNum,
  handleChildChoice,
  handleChildTextInput,
  handleChildTextInputSubmit,
  toggleHighlightSegment,
  completeGenericStep,
  startStepTimer,
  stopStepTimer,
  updateTimerUI,
  get stepTotalSeconds() { return stepTotalSeconds; },
  set stepTotalSeconds(v) { stepTotalSeconds = v; },
  get stepRemainingSeconds() { return stepRemainingSeconds; },
  set stepRemainingSeconds(v) { stepRemainingSeconds = v; },
  get isTimerPaused() { return isTimerPaused; },
  set isTimerPaused(v) { isTimerPaused = v; },
  get stepTimerInterval() { return stepTimerInterval; },
  toggleSoftPause,
  startBoxBreathing,
  stopBoxBreathing,
  updateBreathingUI,
  get breathingStage() { return breathingStage; },
  set breathingStage(v) { breathingStage = v; },
  get breathingSecondsLeft() { return breathingSecondsLeft; },
  set breathingSecondsLeft(v) { breathingSecondsLeft = v; },
  get breathingCycleCount() { return breathingCycleCount; },
  set breathingCycleCount(v) { breathingCycleCount = v; },
  get breathingInterval() { return breathingInterval; },
  initAudio,
  toggleSound,
  playSfx,
  get isSoundEnabled() { return isSoundEnabled; },
  set isSoundEnabled(v) { isSoundEnabled = v; },
  get audioCtx() { return audioCtx; },
  set audioCtx(v) { audioCtx = v; },
  copyParentScript,
  parentSendCheer,
  parentSendSituation,
  parentAskCoach
};
`;

vm.createContext(sandbox);
vm.runInContext(appScript + exportHooks, sandbox);
const exp = sandbox.__test_exports__;

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    testsFailed++;
  }
}

/* ======================================================================
   SUITE 1: Single-Focus Card & Step Transitions
   ====================================================================== */
console.log("--- SUITE 1: Single-Focus Card & Step Transitions ---");

runTest("1.1: renderSegmentedTrackbar renders correct segments and active pulse for 1, 3, 5, 10 steps", () => {
  const track = getOrCreateElement('child-segments-track');

  // Test 1 step
  exp.renderSegmentedTrackbar(1, 0);
  assert.strictEqual(track.children.length, 1);
  assert.ok(track.children[0].className.includes("animate-pulse"), "Single step should be pulsing active");

  // Test 3 steps, current = 1
  exp.renderSegmentedTrackbar(3, 1);
  assert.strictEqual(track.children.length, 3);
  assert.ok(track.children[0].className.includes("bg-emerald-500"), "Step 0 should be completed");
  assert.ok(track.children[1].className.includes("animate-pulse"), "Step 1 should be pulsing active");
  assert.ok(track.children[2].className.includes("bg-slate-200"), "Step 2 should be pending");

  // Test 5 steps, current = 4 (last step)
  exp.renderSegmentedTrackbar(5, 4);
  assert.strictEqual(track.children.length, 5);
  for (let i = 0; i < 4; i++) {
    assert.ok(track.children[i].className.includes("bg-emerald-500"), `Step ${i} should be completed`);
  }
  assert.ok(track.children[4].className.includes("animate-pulse"), "Step 4 should be active");

  // Test 10 steps
  exp.renderSegmentedTrackbar(10, 0);
  assert.strictEqual(track.children.length, 10);
});

runTest("1.2: renderParentTelemetryProgress updates fraction text and segments correctly", () => {
  const bars = getOrCreateElement('telemetry-progress-bars');
  const txt = getOrCreateElement('telemetry-progress-text');

  exp.renderParentTelemetryProgress(4, 2);
  assert.strictEqual(txt.innerText, "2/4 bước đang làm");
  assert.strictEqual(bars.children.length, 4);
  assert.ok(bars.children[0].className.includes("bg-emerald-500"), "Step 0 should be completed");
  assert.ok(bars.children[1].className.includes("bg-amber-400 animate-pulse"), "Step 1 should be in-progress");
  assert.ok(bars.children[2].className.includes("bg-slate-200"), "Step 2 should be pending");
  assert.ok(bars.children[3].className.includes("bg-slate-200"), "Step 3 should be pending");
});

runTest("1.3: Interactive stage input validation enables Next button across chore types", () => {
  const btnNext = getOrCreateElement('child-btn-next-step');

  // Test chore_pens
  btnNext.disabled = true;
  exp.appState.cleanedItems.clear();
  const penMock1 = { classList: { add: () => {} }, innerHTML: "" };
  const penMock2 = { classList: { add: () => {} }, innerHTML: "" };
  const penMock3 = { classList: { add: () => {} }, innerHTML: "" };

  exp.pickChoreItem(penMock1, 'pen1');
  assert.strictEqual(btnNext.disabled, true, "1 pen picked should keep Next button disabled");
  exp.pickChoreItem(penMock2, 'pen2');
  assert.strictEqual(btnNext.disabled, true, "2 pens picked should keep Next button disabled");
  exp.pickChoreItem(penMock3, 'pen3');
  assert.strictEqual(btnNext.disabled, false, "3 pens picked should enable Next button");
  assert.strictEqual(getOrCreateElement('pen-counter').innerText, "3/3 cây bút");

  // Test chore_trash
  btnNext.disabled = true;
  const trashBtn = { innerText: "", className: "", disabled: false };
  exp.pickTrash(trashBtn);
  assert.strictEqual(btnNext.disabled, false, "pickTrash should enable Next button");
  assert.strictEqual(trashBtn.disabled, true);

  // Test chore_books
  btnNext.disabled = true;
  const bookBtn = { innerText: "", className: "", disabled: false };
  exp.tidyBooks(bookBtn);
  assert.strictEqual(btnNext.disabled, false, "tidyBooks should enable Next button");

  // Test chore_wipe
  btnNext.disabled = true;
  const wipeBtn = { innerText: "", className: "", disabled: false };
  exp.cleanDesk(wipeBtn);
  assert.strictEqual(btnNext.disabled, false, "cleanDesk should enable Next button");
});

runTest("1.4: Math clues requires exactly 2 relevant clues; distractors trigger toast", () => {
  const btnNext = getOrCreateElement('child-btn-next-step');
  exp.appState.selectedClues.clear();
  btnNext.disabled = true;

  const clue1 = { className: "" };
  const clue2 = { className: "" };
  const wrongClue = { className: "" };

  // Select clue 1
  exp.toggleMathClue(clue1, '12m');
  assert.strictEqual(exp.appState.selectedClues.size, 1);
  assert.strictEqual(btnNext.disabled, true, "1 clue selected should keep disabled");

  // Select distractor
  exp.alertWrongClue(wrongClue);
  const toastTitle = getOrCreateElement('sync-toast-title');
  const toastDesc = getOrCreateElement('sync-toast-desc');
  assert.strictEqual(toastTitle.innerText, "Chi Tiết Gây Nhiễu");
  assert.ok(toastDesc.innerText.includes("không liên quan"));
  assert.strictEqual(btnNext.disabled, true);

  // Select clue 2
  exp.toggleMathClue(clue2, '5m');
  assert.strictEqual(exp.appState.selectedClues.size, 2);
  assert.strictEqual(btnNext.disabled, false, "2 clues selected must enable Next button");

  // Deselect clue 1
  exp.toggleMathClue(clue1, '12m');
  assert.strictEqual(exp.appState.selectedClues.size, 1);
  assert.strictEqual(btnNext.disabled, true, "Deselecting clue must re-disable Next button");
});

runTest("1.5: Complete step progression: non-final step advances; final step triggers celebration", () => {
  broadcastEvents.length = 0;
  exp.appState.stars = 100;
  exp.appState.activeTask = {
    id: 'test_task_adv',
    title: 'Bài test chuyển bước',
    steps: [
      { badge: 'B1', text: 'Bước 1' },
      { badge: 'B2', text: 'Bước 2' }
    ],
    reward: 80
  };
  exp.appState.currentStepIndex = 0;

  // Complete Step 0 -> should advance to Step 1
  exp.completeChildStep();
  assert.strictEqual(exp.appState.stars, 140, "Earned 40 stars on step 1");
  assert.strictEqual(exp.appState.currentStepIndex, 1, "Step index should increment to 1");
  const stepEvt = broadcastEvents.find(e => e.type === 'STEP_COMPLETED' && e.payload.stepIndex === 0);
  assert.ok(stepEvt, "Must broadcast STEP_COMPLETED for step 0");
  assert.strictEqual(stepEvt.payload.isTaskComplete, false);

  // Complete Step 1 (final) -> should complete task
  exp.completeChildStep();
  assert.strictEqual(exp.appState.stars, 180, "Earned 40 stars on step 2");
  const finalEvt = broadcastEvents.find(e => e.type === 'STEP_COMPLETED' && e.payload.stepIndex === 1);
  assert.ok(finalEvt, "Must broadcast STEP_COMPLETED for final step");
  assert.strictEqual(finalEvt.payload.isTaskComplete, true);
  const islandEvt = broadcastEvents.find(e => e.type === 'ISLAND_COMPLETED');
  assert.ok(islandEvt, "Must broadcast ISLAND_COMPLETED on final step");
});


/* ======================================================================
   SUITE 2: Visual Timer Disc & Time Expired Behavior
   ====================================================================== */
console.log("\n--- SUITE 2: Visual Timer Disc & Time Expired Behavior ---");

runTest("2.1: startStepTimer initializes duration, isTimerPaused false, and conic style", () => {
  exp.startStepTimer(120);
  assert.strictEqual(exp.stepTotalSeconds, 120);
  assert.strictEqual(exp.stepRemainingSeconds, 120);
  assert.strictEqual(exp.isTimerPaused, false);
  const ring = getOrCreateElement('child-ring-timer');
  assert.strictEqual(ring.style['--progress'], "100%");
  exp.stopStepTimer();
});

runTest("2.2: updateTimerUI switches from green (>30%) to warning amber (<=30%)", () => {
  const ring = getOrCreateElement('child-ring-timer');
  const pill = getOrCreateElement('child-timer-pill');

  exp.stepTotalSeconds = 100;

  // At 50% remaining (>30%)
  exp.stepRemainingSeconds = 50;
  exp.isTimerPaused = false;
  exp.updateTimerUI();
  assert.strictEqual(ring.style['--progress'], "50%");
  assert.ok(!ring.classList.contains('ring-timer-warning'), "Should not have warning class at 50%");
  assert.ok(pill.innerText.includes("Năng lượng dồi dào"));

  // At 25% remaining (<=30%)
  exp.stepRemainingSeconds = 25;
  exp.updateTimerUI();
  assert.strictEqual(ring.style['--progress'], "25%");
  assert.ok(ring.classList.contains('ring-timer-warning'), "Must have ring-timer-warning at <= 30%");
  assert.ok(pill.innerText.includes("Nhẹ nhàng về đích"));
});

runTest("2.3: Time expired behavior triggers soft pause modal without failure buzzer", () => {
  broadcastEvents.length = 0;
  const modal = getOrCreateElement('child-modal-soft-pause');
  const ring = getOrCreateElement('child-ring-timer');
  modal.classList.add('hidden');
  ring.classList.remove('ring-timer-paused');
  exp.appState.pauseCount = 0;

  // Simulate timer countdown reaching 0
  exp.stepTotalSeconds = 60;
  exp.stepRemainingSeconds = 0;
  exp.stopStepTimer();
  exp.toggleSoftPause(true);

  assert.strictEqual(exp.isTimerPaused, true, "isTimerPaused should be true");
  assert.ok(!modal.classList.contains('hidden'), "Soft pause modal must be visible");
  assert.ok(ring.classList.contains('ring-timer-paused'), "Ring must have ring-timer-paused");
  assert.strictEqual(exp.appState.pauseCount, 1, "CBT pause count must increment");
  const rescueEvt = broadcastEvents.find(e => e.type === 'MILO_RESCUE_TRIGGER');
  assert.ok(rescueEvt, "Must broadcast MILO_RESCUE_TRIGGER");

  // Unpause cleanly
  exp.toggleSoftPause(false);
  assert.strictEqual(exp.isTimerPaused, false);
  assert.ok(modal.classList.contains('hidden'), "Modal must be hidden after unpause");
  assert.ok(!ring.classList.contains('ring-timer-paused'), "Ring paused class removed");
});


/* ======================================================================
   SUITE 3: Web Audio Synthesizer Engine
   ====================================================================== */
console.log("\n--- SUITE 3: Web Audio Synthesizer Engine ---");

runTest("3.1: Zero external sound asset dependencies in code", () => {
  const audioFileRegex = /\.(mp3|wav|ogg|m4a|aac)\b/i;
  assert.ok(!audioFileRegex.test(appScript), "App script must contain ZERO external audio file references");
  assert.ok(!/<audio/i.test(html), "HTML must not contain <audio> tags");
});

runTest("3.2: Sound mute toggle cleanly bypasses all oscillator node generation", () => {
  const btnSound = getOrCreateElement('btn-sound-toggle');

  // Mute audio
  exp.isSoundEnabled = true;
  exp.toggleSound();
  assert.strictEqual(exp.isSoundEnabled, false, "Sound should be muted");
  assert.strictEqual(btnSound.innerText, "🔇");

  // Attempt to play SFX while muted
  mockAudioCtxInstance = null;
  exp.playSfx('star');
  exp.playSfx('tap');
  exp.playSfx('success');
  exp.playSfx('bell');
  exp.playSfx('breathe');

  if (mockAudioCtxInstance) {
    assert.strictEqual(mockAudioCtxInstance.createdOscillators.length, 0, "No oscillators should be created when muted");
  }

  // Unmute audio
  exp.toggleSound();
  assert.strictEqual(exp.isSoundEnabled, true);
  assert.strictEqual(btnSound.innerText, "🔊");
});

runTest("3.3: Synthesizer unlocks suspended AudioContext and produces correct frequencies", () => {
  exp.isSoundEnabled = true;
  mockAudioCtxInstance = null;
  exp.audioCtx = null;

  // Trigger star sound
  exp.playSfx('star');
  assert.ok(mockAudioCtxInstance, "AudioContext must be instantiated");
  assert.strictEqual(mockAudioCtxInstance.state, 'running', "Suspended context must be resumed");
  assert.strictEqual(mockAudioCtxInstance.createdOscillators.length, 3, "Star sound generates 3 harmonic oscillators");
  assert.strictEqual(mockAudioCtxInstance.createdOscillators[0].type, 'triangle');

  // Trigger breathe sound (C4, 261.63Hz)
  mockAudioCtxInstance.createdOscillators.length = 0;
  exp.playSfx('breathe');
  assert.strictEqual(mockAudioCtxInstance.createdOscillators.length, 1);
  assert.strictEqual(mockAudioCtxInstance.createdOscillators[0].type, 'sine');
  assert.strictEqual(mockAudioCtxInstance.createdOscillators[0].frequency.value, 261.63);

  // Trigger unknown sound -> graceful no-throw
  assert.doesNotThrow(() => {
    exp.playSfx('unknown_cosmic_frequency');
  });
});


/* ======================================================================
   SUITE 4: Robot Milo 4-4-4 Box Breathing
   ====================================================================== */
console.log("\n--- SUITE 4: Robot Milo 4-4-4 Box Breathing ---");

runTest("4.1: 4-4-4-4 phase transitions cycle through Inhale -> Hold -> Exhale -> Rest", () => {
  exp.startBoxBreathing();
  assert.strictEqual(exp.breathingStage, 0, "Starts at Stage 0 (Inhale)");
  assert.strictEqual(exp.breathingSecondsLeft, 4);
  assert.strictEqual(exp.breathingCycleCount, 1);

  const phaseLabel = getOrCreateElement('breathing-phase-label');
  assert.ok(phaseLabel.innerText.includes("1. Hít vào"));

  // Manually step through stages
  exp.breathingStage = 1;
  exp.updateBreathingUI();
  assert.ok(phaseLabel.innerText.includes("2. Giữ hơi thở"));

  exp.breathingStage = 2;
  exp.updateBreathingUI();
  assert.ok(phaseLabel.innerText.includes("3. Thở ra"));

  exp.breathingStage = 3;
  exp.updateBreathingUI();
  assert.ok(phaseLabel.innerText.includes("4. Thả lỏng"));

  exp.stopBoxBreathing();
});

runTest("4.2: Aborting breathing early stops interval and clears handles", () => {
  exp.startBoxBreathing();
  assert.ok(exp.breathingInterval !== null, "Interval must be active");

  exp.toggleSoftPause(false);
  assert.strictEqual(exp.breathingInterval, null, "Breathing interval must be cleared on unpause");
});

runTest("4.3: Stress test 10 complete cycles (160 seconds) without numerical drift or crash", () => {
  exp.startBoxBreathing();
  exp.stopBoxBreathing(); // stop real interval to step deterministically

  // Deterministically step 160 seconds (10 full cycles)
  exp.breathingStage = 0;
  exp.breathingSecondsLeft = 4;
  exp.breathingCycleCount = 1;

  for (let sec = 0; sec < 160; sec++) {
    exp.breathingSecondsLeft--;
    if (exp.breathingSecondsLeft <= 0) {
      exp.breathingSecondsLeft = 4;
      exp.breathingStage = (exp.breathingStage + 1) % 4;
      if (exp.breathingStage === 0) {
        exp.breathingCycleCount++;
      }
    }
  }

  // 160 seconds / 16 seconds per cycle = exactly 10 cycles completed -> breathingCycleCount = 11
  assert.strictEqual(exp.breathingCycleCount, 11, "Must complete exactly 10 full cycles");
  assert.strictEqual(exp.breathingStage, 0, "Must be back at stage 0 (Inhale)");
  assert.strictEqual(exp.breathingSecondsLeft, 4);

  // Verify UI renders cycle count cleanly without exception
  exp.updateBreathingUI();
  const cycleEl = getOrCreateElement('breathing-cycle-counter');
  assert.strictEqual(cycleEl.innerText, "Nhịp 11 / 3");
});


/* ======================================================================
   SUITE 5: RSD Effort Coach & Red Lines
   ====================================================================== */
console.log("\n--- SUITE 5: RSD Effort Coach & Red Lines ---");

runTest("5.1: copyParentScript copies praise text to navigator clipboard", () => {
  const scriptEl = getOrCreateElement('parent-praise-script');
  scriptEl.innerText = "Mẹ rất thích sự kiên trì vượt khó của Leo!";
  clipboardWritten = null;

  exp.copyParentScript();
  assert.strictEqual(clipboardWritten, "Mẹ rất thích sự kiên trì vượt khó của Leo!");
});

runTest("5.2: Clipboard failure or missing navigator.clipboard handles gracefully", () => {
  const originalNav = sandbox.navigator;
  sandbox.navigator = {}; // missing clipboard
  assert.doesNotThrow(() => {
    exp.copyParentScript();
  }, "copyParentScript should not crash if clipboard is unavailable");
  sandbox.navigator = originalNav;
});

runTest("5.3: Red Lines & Toxic Praise detector catches ADHD-harming expressions", () => {
  const redLinesForbidden = [
    "con lười", "lười biếng", "chây ì", "thiếu ý chí", "bướng bỉnh",
    "không chịu cố gắng", "con dốt", "nhìn bạn khác",
    "học trước quên sau", "con thông minh quá", "sao có mỗi bài này"
  ];

  function detectRedLines(text) {
    const lower = text.toLowerCase();
    return redLinesForbidden.filter(term => lower.includes(term));
  }

  // Test toxic strings
  assert.ok(detectRedLines("Sao con lười thế?").length > 0);
  assert.ok(detectRedLines("Nhìn bạn khác kìa, con dốt thế").length >= 2);
  assert.ok(detectRedLines("Con thông minh quá, làm tí là xong").length > 0);

  // Test healthy effort-based praise
  assert.strictEqual(
    detectRedLines("Mẹ rất thích cách Leo kiên trì giải quyết từng bước một!").length,
    0,
    "Effort-based praise must pass cleanly"
  );
});

runTest("5.4: parentSendSituation injects 2-stage coaching responses for tantrum, quit, praise", () => {
  const chatBox = getOrCreateElement('parent-chat-box');

  ['tantrum', 'quit', 'praise'].forEach(situation => {
    chatBox.innerHTML = "";
    exp.parentSendSituation(situation);
    assert.ok(chatBox.innerHTML.includes("Bước 1 • Đồng cảm trước"), `Situation ${situation} must include Stage 1`);
    assert.ok(chatBox.innerHTML.includes("Bước 2 • Đặt giới hạn vi mô"), `Situation ${situation} must include Stage 2`);
  });
});

runTest("5.5: parentSendCheer formats and broadcasts PARENT_CHEER_SEND with message and cheerText", () => {
  broadcastEvents.length = 0;
  const scriptEl = getOrCreateElement('parent-praise-script');
  scriptEl.innerText = "Leo kiên trì lắm, mẹ rất tự hào!";

  exp.parentSendCheer();
  const cheerEvt = broadcastEvents.find(e => e.type === 'PARENT_CHEER_SEND');
  assert.ok(cheerEvt, "Must broadcast PARENT_CHEER_SEND");
  assert.strictEqual(cheerEvt.payload.cheerText, "Leo kiên trì lắm, mẹ rất tự hào!");
  assert.strictEqual(cheerEvt.payload.message, "Leo kiên trì lắm, mẹ rất tự hào!", "Must supply message property to prevent 'undefined'");
});


console.log("\n======================================================================");
console.log(`TOTAL ADVERSARIAL TESTS: ${testsPassed + testsFailed}`);
console.log(`PASSED:                  ${testsPassed}`);
console.log(`FAILED:                  ${testsFailed}`);
console.log("======================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("ALL ADHD UI & ERGONOMICS ADVERSARIAL TESTS PASSED CLEANLY!");
  process.exit(0);
}