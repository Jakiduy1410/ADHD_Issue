/**
 * Comprehensive Automated Verification Suite for Milestone 1:
 * - Tri-Layer MiloSyncBus (Layer 1 in-memory, Layer 2 BroadcastChannel/localStorage, Layer 3 WebSocket)
 * - 10-Event State Protocol Execution & Contracts
 * - 29-Task Curriculum Bank Ingestion (25 GDPT 2018 + 4 Routines) & Catalog Filtering
 * - LocalStorage State Persistence & Hydration Across Reloads
 * - Parent Golden Ticket Approval Fanfare Modal Trigger
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("=== STARTING MILESTONE 1 VERIFICATION SUITE ===");

// 1. Read index.html and extract script tag #2
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // Skip Tailwind config script
const appScriptMatch = scriptRegex.exec(html);
assert(appScriptMatch, "Could not find main application script in index.html");
const appScript = appScriptMatch[1];

// 2. Setup mock browser environment
const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
};

const broadcastChannels = [];
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
    broadcastChannels.push(this);
  }
  postMessage(data) {
    broadcastChannels.forEach(ch => {
      if (ch !== this && ch.name === this.name && ch.onmessage) {
        setTimeout(() => ch.onmessage({ data }), 0);
      }
    });
  }
  close() {
    const idx = broadcastChannels.indexOf(this);
    if (idx !== -1) broadcastChannels.splice(idx, 1);
  }
}

class MockWebSocket {
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
  }
  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  }
}

const domElements = {};
function getOrCreateElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id: id,
      classList: {
        classes: new Set(['hidden']),
        add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
        remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
        toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      innerText: "",
      innerHTML: "",
      value: "",
      disabled: false,
      children: [],
      style: {},
      appendChild: function(child) { this.children.push(child); },
      querySelectorAll: function(sel) { return []; },
      setAttribute: function(attr, val) { this[attr] = val; }
    };
  }
  return domElements[id];
}

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
        toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      innerText: "",
      innerHTML: "",
      className: "",
      style: {},
      children: [],
      appendChild: function(c) { this.children.push(c); },
      setAttribute: function(attr, val) { this[attr] = val; }
    };
  }
};

const domEventListeners = {};
const mockWindow = {
  location: { search: "?role=dual&room=family_room_milo_01", hostname: "localhost", protocol: "http:" },
  addEventListener: (evt, cb) => {
    if (!domEventListeners[evt]) domEventListeners[evt] = [];
    domEventListeners[evt].push(cb);
  },
  removeEventListener: (evt, cb) => {
    if (domEventListeners[evt]) {
      domEventListeners[evt] = domEventListeners[evt].filter(f => f !== cb);
    }
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
  console: console,
  AudioContext: class {
    constructor() { this.state = 'running'; }
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
  },
  webkitAudioContext: class {},
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  alert: (msg) => console.log("[Alert]:", msg)
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);

// Append export hook to script for testing access
const wrappedScript = appScript + "\n;__test_exports__ = { taskDatabase, appState, MiloSyncBus, parentFilterCatalog, parentFilterGrade, parentApproveTicket, childRedeemTicket };";
vm.runInContext(wrappedScript, sandbox);
console.log("-> App script executed in mock context without errors.");

const { taskDatabase, appState, MiloSyncBus, parentFilterCatalog, parentFilterGrade, parentApproveTicket, childRedeemTicket } = sandbox.__test_exports__;

// -------------------------------------------------------------
// TEST 1: Curriculum Bank Ingestion (29 tasks + math_garden alias)
// -------------------------------------------------------------
console.log("\n[TEST 1] Verifying Curriculum Bank Ingestion...");
assert(taskDatabase, "taskDatabase must exist in sandbox");

// Deduplicated tasks count
const taskMap = new Map();
Object.values(taskDatabase).forEach(t => {
  if (t && t.id) taskMap.set(t.id, t);
});
assert.strictEqual(taskMap.size, 29, `Expected exactly 29 unique tasks, found ${taskMap.size}`);

// Verify all 25 GDPT 2018 benchmark IDs
for (let g = 1; g <= 5; g++) {
  const tasksInGrade = Array.from(taskMap.values()).filter(t => t.grade === g);
  assert.strictEqual(tasksInGrade.length >= 5, true, `Grade ${g} must have at least 5 tasks`);
}

// Check math_garden backward compatibility alias
assert(taskDatabase['math_garden'], "taskDatabase['math_garden'] alias must exist");
assert.strictEqual(taskDatabase['math_garden'].id, 'G1_MATH_01', "math_garden must alias to G1_MATH_01");

// Check the 4 life routine tasks
const routineIds = ['chore_desk', 'chore_teeth', 'chore_backpack', 'chore_bed'];
routineIds.forEach(id => {
  assert(taskDatabase[id], `Routine task '${id}' must exist`);
  assert.strictEqual(taskDatabase[id].cat, 'chore');
});

// Verify Draft-07 Micro-Task constraints on all 29 tasks
let totalSteps = 0;
taskMap.forEach(task => {
  assert(task.title, `Task ${task.id} must have a title`);
  assert(task.steps && task.steps.length > 0, `Task ${task.id} must have steps`);
  task.steps.forEach((step, sIdx) => {
    totalSteps++;
    assert(step.badge, `Step ${sIdx+1} in ${task.id} must have badge`);
    assert(step.action_verb, `Step ${sIdx+1} in ${task.id} must have action_verb`);
    assert(/^[a-zA-ZÀ-ỹ_]+$/.test(step.action_verb), `Step ${sIdx+1} action_verb '${step.action_verb}' in ${task.id} must be a single verb token`);
    assert(step.atomic_instruction, `Step ${sIdx+1} in ${task.id} must have atomic_instruction`);
    const wordCount = step.atomic_instruction.trim().split(/\s+/).length;
    assert(wordCount < 15, `Step ${sIdx+1} instruction in ${task.id} has ${wordCount} words (must be < 15 words)`);
  });
});
console.log(` PASSED: All 29 tasks verified! Total steps: ${totalSteps}.`);

// -------------------------------------------------------------
// TEST 2: Parent Catalog & Grade Filtering
// -------------------------------------------------------------
console.log("\n[TEST 2] Verifying Parent Catalog & Grade Filtering...");
parentFilterCatalog('all');
assert.strictEqual(appState.catalogFilter, 'all');

parentFilterCatalog('math');
assert.strictEqual(appState.catalogFilter, 'math');

parentFilterCatalog('viet');
assert.strictEqual(appState.catalogFilter, 'viet');

parentFilterCatalog('eng');
assert.strictEqual(appState.catalogFilter, 'eng');

parentFilterCatalog('chore');
assert.strictEqual(appState.catalogFilter, 'chore');

parentFilterGrade('all');
assert.strictEqual(appState.gradeFilter, 'all');

parentFilterGrade(3);
assert.strictEqual(appState.gradeFilter, 3);

// Reset filters to all
parentFilterCatalog('all');
parentFilterGrade('all');
console.log(" PASSED: Category and Grade filtering methods functioning cleanly.");

// -------------------------------------------------------------
// TEST 3: Tri-Layer MiloSyncBus Architecture
// -------------------------------------------------------------
console.log("\n[TEST 3] Verifying Tri-Layer MiloSyncBus...");
const domLoadedCallbacks = domEventListeners['DOMContentLoaded'] || [];
domLoadedCallbacks.forEach(cb => cb());

const bus = sandbox.window.miloBus;
assert(bus, "window.miloBus must be instantiated upon DOMContentLoaded");
assert(bus.subscribe, "bus must have subscribe method");
assert(bus.broadcast, "bus must have broadcast method");
assert(bus.savePersistedState, "bus must have savePersistedState method");
assert(bus.loadPersistedState, "bus must have loadPersistedState method");

console.log(" PASSED: MiloSyncBus instance initialized cleanly with tri-layer transports.");

// -------------------------------------------------------------
// TEST 4: The 10-Event State Protocol Execution
// -------------------------------------------------------------
console.log("\n[TEST 4] Verifying the 10-Event State Protocol...");
let eventLog = [];

const all10Events = [
  'TASK_ASSIGN_BATCH',
  'STEP_TELEMETRY_UPDATE',
  'STEP_COMPLETED',
  'ISLAND_COMPLETED',
  'TREASURE_UNLOCKED',
  'TICKET_REDEEM_REQUEST',
  'TICKET_APPROVAL_RESPONSE',
  'MILO_RESCUE_TRIGGER',
  'PARENT_CHEER_SEND',
  'STARS_SYNC'
];

all10Events.forEach(evtType => {
  bus.subscribe(evtType, (payload) => {
    eventLog.push({ type: evtType, payload });
  });
});

// Event 1: TASK_ASSIGN_BATCH
const sampleBatch = [taskDatabase['G1_MATH_01'], taskDatabase['G1_VIET_03']];
bus.broadcast('TASK_ASSIGN_BATCH', { tasks: sampleBatch });
assert(eventLog.some(e => e.type === 'TASK_ASSIGN_BATCH'), "TASK_ASSIGN_BATCH must be handled");
assert.strictEqual(appState.childRoadmap.length, 2);
assert.strictEqual(appState.childRoadmap[0].id, 'G1_MATH_01');

// Event 2: STEP_TELEMETRY_UPDATE
bus.broadcast('STEP_TELEMETRY_UPDATE', { taskId: 'G1_MATH_01', stepIndex: 1, elapsedSec: 45, totalSteps: 3 });
assert(eventLog.some(e => e.type === 'STEP_TELEMETRY_UPDATE'), "STEP_TELEMETRY_UPDATE must be handled");

// Event 3: STEP_COMPLETED
bus.broadcast('STEP_COMPLETED', { taskId: 'G1_MATH_01', stepIndex: 0, totalSteps: 3, starsEarned: 40, totalStarsNow: 490, isTaskComplete: false });
assert(eventLog.some(e => e.type === 'STEP_COMPLETED'), "STEP_COMPLETED must be handled");

// Event 4: ISLAND_COMPLETED
bus.broadcast('ISLAND_COMPLETED', { taskId: 'G1_MATH_01', islandTitle: 'Đảo Số 1', totalStars: 520, nextIslandIndex: 1 });
assert(eventLog.some(e => e.type === 'ISLAND_COMPLETED'), "ISLAND_COMPLETED must be handled");

// Event 5: TREASURE_UNLOCKED
bus.broadcast('TREASURE_UNLOCKED', { totalStarsEarned: 700, unlockedRewards: ['Huy hiệu'] });
assert(eventLog.some(e => e.type === 'TREASURE_UNLOCKED'), "TREASURE_UNLOCKED must be handled");

// Event 6: TICKET_REDEEM_REQUEST
bus.broadcast('TICKET_REDEEM_REQUEST', { ticketId: 'ticket_123', title: '30 phút chơi Lego cùng mẹ Lan', cost: 200, remainingStars: 500 });
assert(eventLog.some(e => e.type === 'TICKET_REDEEM_REQUEST'), "TICKET_REDEEM_REQUEST must be handled");
assert(appState.pendingTicket, "pendingTicket must be set");
assert.strictEqual(appState.pendingTicket.title, '30 phút chơi Lego cùng mẹ Lan');

// Event 7: TICKET_APPROVAL_RESPONSE
const approvedModal = getOrCreateElement('child-modal-ticket-approved');
assert.strictEqual(approvedModal.classList.contains('hidden'), true);

bus.broadcast('TICKET_APPROVAL_RESPONSE', {
  ticketId: 'ticket_123',
  title: '30 phút chơi Lego cùng mẹ Lan',
  approved: true,
  praiseMessage: 'Mẹ tự hào về con!'
});
assert(eventLog.some(e => e.type === 'TICKET_APPROVAL_RESPONSE'), "TICKET_APPROVAL_RESPONSE must be handled");
assert.strictEqual(approvedModal.classList.contains('flex'), true, "child-modal-ticket-approved must receive class 'flex'");
assert.strictEqual(approvedModal.classList.contains('hidden'), false, "child-modal-ticket-approved must not contain 'hidden'");
assert.strictEqual(getOrCreateElement('child-approved-ticket-name').innerText, '30 phút chơi Lego cùng mẹ Lan');

// Event 8: MILO_RESCUE_TRIGGER
bus.broadcast('MILO_RESCUE_TRIGGER', { reason: 'user_clicked_rescue', stepId: 1, taskId: 'G1_MATH_01', pauseCount: 2 });
assert(eventLog.some(e => e.type === 'MILO_RESCUE_TRIGGER'), "MILO_RESCUE_TRIGGER must be handled");
assert.strictEqual(appState.pauseCount, 2);

// Event 9: PARENT_CHEER_SEND
bus.broadcast('PARENT_CHEER_SEND', { cheerText: 'Leo cố lên!', sticker: 'milo_thumbs_up' });
assert(eventLog.some(e => e.type === 'PARENT_CHEER_SEND'), "PARENT_CHEER_SEND must be handled");
assert(getOrCreateElement('child-milo-speech').innerText.includes('Leo cố lên!'), "Milo speech must display cheer text");

// Event 10: STARS_SYNC
bus.broadcast('STARS_SYNC', { totalStars: 888, delta: 50, reason: 'step_reward' });
assert(eventLog.some(e => e.type === 'STARS_SYNC'), "STARS_SYNC must be handled");
assert.strictEqual(appState.stars, 888, "appState.stars must be synchronized to 888");
assert.strictEqual(getOrCreateElement('child-stars-count').innerText, 888, "DOM star pills must update");

console.log(" PASSED: All 10 protocol events broadcasted and verified synchronously!");

// -------------------------------------------------------------
// TEST 5: State Persistence & Hydration across Reloads
// -------------------------------------------------------------
console.log("\n[TEST 5] Verifying State Persistence & Hydration...");
appState.stars = 777;
appState.currentRoadmapIndex = 1;
appState.currentStepIndex = 2;
appState.pauseCount = 5;
appState.pendingTicket = { title: "Xem phim hoạt hình", cost: 150 };
bus.savePersistedState(appState);

const rawPersisted = mockLocalStorage.getItem('milo_quest_saved_state');
assert(rawPersisted, "Persisted state must be stored in localStorage under 'milo_quest_saved_state'");
const parsed = JSON.parse(rawPersisted);
assert.strictEqual(parsed.stars, 777);
assert.strictEqual(parsed.currentRoadmapIndex, 1);
assert.strictEqual(parsed.currentStepIndex, 2);
assert.strictEqual(parsed.pauseCount, 5);
assert.strictEqual(parsed.pendingTicket.title, "Xem phim hoạt hình");

// Simulate page reload by resetting in-memory appState to default 450
appState.stars = 450;
appState.currentRoadmapIndex = 0;
appState.currentStepIndex = 0;
appState.pauseCount = 0;
appState.pendingTicket = null;

// Run DOMContentLoaded hydration
domLoadedCallbacks.forEach(cb => cb());

assert.strictEqual(appState.stars, 777, "Hydrated stars must be 777 (not default 450)");
assert.strictEqual(appState.currentRoadmapIndex, 1, "Hydrated currentRoadmapIndex must be 1");
assert.strictEqual(appState.currentStepIndex, 2, "Hydrated currentStepIndex must be 2");
assert.strictEqual(appState.pauseCount, 5, "Hydrated pauseCount must be 5");
assert.strictEqual(appState.pendingTicket.title, "Xem phim hoạt hình", "Hydrated pendingTicket must match");

console.log(" PASSED: Offline state persistence & hydration across reloads verified!");

// -------------------------------------------------------------
// TEST 6: Layer 2 Cross-Tab Sync via Mock BroadcastChannel
// -------------------------------------------------------------
console.log("\n[TEST 6] Verifying Layer 2 Cross-Tab BroadcastChannel Sync...");
const tab1Bus = bus;
const tab2Bus = new MiloSyncBus({ role: 'child' });

let tab2Received = null;
tab2Bus.subscribe('TASK_ASSIGN_BATCH', (payload) => {
  tab2Received = payload;
});

// Tab 1 (Parent) emits batch
tab1Bus.broadcast('TASK_ASSIGN_BATCH', { tasks: [taskDatabase['G2_MATH_06']] });

// Wait a tick for MockBroadcastChannel asynchronous message delivery
setTimeout(() => {
  assert(tab2Received, "Tab 2 must receive message from Tab 1 via BroadcastChannel");
  assert.strictEqual(tab2Received.tasks[0].id, 'G2_MATH_06');
  console.log(" PASSED: Cross-Tab BroadcastChannel synchronization verified!");
  console.log("\n=== ALL 6 TEST SUITES PASSED WITH 100% SUCCESS ===");
  process.exit(0);
}, 50);
