const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("EMPIRICAL CHALLENGER: CATALOG SELECTION TOGGLE & RELOAD PERSISTENCE");
console.log("======================================================================\n");

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // Skip tailwind config
const appScriptMatch = scriptRegex.exec(html);
assert(appScriptMatch, "Failed to find main application script in index.html");
const appScript = appScriptMatch[1];

const domStore = {};
function getElement(id) {
  if (!domStore[id]) {
    domStore[id] = {
      id: id,
      classList: {
        classes: new Set(),
        add: function(...c) { c.forEach(x => this.classes.add(x)); },
        remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
        contains: function(x) { return this.classes.has(x); }
      },
      innerText: '',
      _innerHTML: '',
      get innerHTML() { return this._innerHTML; },
      set innerHTML(val) { this._innerHTML = val; if (val === '') this.children = []; },
      value: '',
      disabled: false,
      children: [],
      appendChild: function(c) { this.children.push(c); },
      querySelectorAll: () => []
    };
  }
  return domStore[id];
}

const mockDocument = {
  getElementById: (id) => getElement(id),
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      classList: {
        classes: new Set(),
        add: function(...c) { c.forEach(x => this.classes.add(x)); },
        remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
        contains: function(x) { return this.classes.has(x); }
      },
      _className: '',
      get className() { return this._className; },
      set className(v) {
        this._className = v;
        (v || '').split(/\s+/).forEach(c => { if (c) this.classList.add(c); });
      },
      innerText: '',
      innerHTML: '',
      children: [],
      appendChild: function(c) { this.children.push(c); },
      setAttribute: function(k, v) { this[k] = v; }
    };
    return el;
  }
};

const storage = {};
const mockLocalStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { for (let k in storage) delete storage[k]; }
};

let domContentLoadedHandler = null;
const sandbox = {
  window: {
    location: { search: '?role=dual', hostname: 'localhost', protocol: 'http:' },
    addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') domContentLoadedHandler = fn; },
    removeEventListener: () => {}
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  BroadcastChannel: class { postMessage() {} close() {} },
  WebSocket: class { send() {} close() {} },
  URLSearchParams: URLSearchParams,
  setTimeout: (fn) => setTimeout(fn, 0),
  clearTimeout: clearTimeout,
  setInterval: () => 1,
  clearInterval: () => {},
  console: console,
  AudioContext: class {
    constructor() { this.state = 'running'; }
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }; }
  },
  alert: () => {}
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);
vm.runInContext(appScript + ';__test__ = { appState, toggleCatalogItem, selectAllCatalog, renderParentCatalogList, parentFilterGrade, parentFilterCatalog, dispatchSelectedCatalogTasks, MiloSyncBus };', sandbox);

const exp = sandbox.__test__;
sandbox.window.miloBus = new exp.MiloSyncBus();

function isCheckboxChecked(cardElement) {
  // Checks for <input type="checkbox" checked onchange...
  return /<input\s+type="checkbox"\s+checked\s+onchange/i.test(cardElement.innerHTML);
}

let totalAssertions = 0;
let passedAssertions = 0;
function testAssert(name, condition, extraInfo = "") {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${extraInfo}`);
    throw new Error(`Assertion failed: ${name}`);
  }
}

console.log("[TEST 1] Initial Selection Baseline");
testAssert("Initial selected catalog count is 2", exp.appState.selectedCatalogIds.size === 2);
testAssert("Initial selection contains chore_desk", exp.appState.selectedCatalogIds.has('chore_desk'));
testAssert("Initial selection contains G1_MATH_01", exp.appState.selectedCatalogIds.has('G1_MATH_01'));

console.log("\n[TEST 2] Toggling Items (Add / Remove)");
// 2.1: Uncheck chore_desk
exp.toggleCatalogItem('chore_desk', false);
testAssert("chore_desk unselected after toggle false", !exp.appState.selectedCatalogIds.has('chore_desk'));
testAssert("Selected count dropped to 1", exp.appState.selectedCatalogIds.size === 1);

// 2.2: Check G2_MATH_06 and G3_VIET_13
exp.toggleCatalogItem('G2_MATH_06', true);
exp.toggleCatalogItem('G3_VIET_13', true);
testAssert("G2_MATH_06 selected after toggle true", exp.appState.selectedCatalogIds.has('G2_MATH_06'));
testAssert("G3_VIET_13 selected after toggle true", exp.appState.selectedCatalogIds.has('G3_VIET_13'));
testAssert("Selected count updated to 3", exp.appState.selectedCatalogIds.size === 3);

// 2.3: Verify write-through persistence into localStorage
const savedDataRaw = storage['milo_quest_saved_state'];
testAssert("milo_quest_saved_state exists in storage", !!savedDataRaw);
const savedObj = JSON.parse(savedDataRaw);
testAssert("savedObj.selectedCatalogIds is an Array", Array.isArray(savedObj.selectedCatalogIds));
testAssert("Saved items match appState", 
  savedObj.selectedCatalogIds.includes('G1_MATH_01') &&
  savedObj.selectedCatalogIds.includes('G2_MATH_06') &&
  savedObj.selectedCatalogIds.includes('G3_VIET_13') &&
  !savedObj.selectedCatalogIds.includes('chore_desk')
);

console.log("\n[TEST 3] Simulated Reload & Hydration via DOMContentLoaded");
// Simulate reload: mutate appState back to empty or arbitrary state
exp.appState.selectedCatalogIds = new Set(['arbitrary_wiped_state']);
domContentLoadedHandler();

testAssert("Hydration restored exact set size (3)", exp.appState.selectedCatalogIds.size === 3);
testAssert("Hydration restored G1_MATH_01", exp.appState.selectedCatalogIds.has('G1_MATH_01'));
testAssert("Hydration restored G2_MATH_06", exp.appState.selectedCatalogIds.has('G2_MATH_06'));
testAssert("Hydration restored G3_VIET_13", exp.appState.selectedCatalogIds.has('G3_VIET_13'));
testAssert("chore_desk remains unselected after reload", !exp.appState.selectedCatalogIds.has('chore_desk'));

console.log("\n[TEST 4] DOM Card Checkmark and Border Rendering Verification");
const catalogContainer = getElement('catalog-tasks-list');
testAssert("29 unique cards rendered into catalog-tasks-list", catalogContainer.children.length === 29);

const g2Card = catalogContainer.children.find(c => c.innerHTML.includes('G2_MATH_06'));
testAssert("G2_MATH_06 card exists in DOM", !!g2Card);
testAssert("G2_MATH_06 checkbox has 'checked' attribute", isCheckboxChecked(g2Card));
testAssert("G2_MATH_06 card has 'border-teal-400' styling", g2Card.classList.contains('border-teal-400'));

const g3Card = catalogContainer.children.find(c => c.innerHTML.includes('G3_VIET_13'));
testAssert("G3_VIET_13 card exists in DOM", !!g3Card);
testAssert("G3_VIET_13 checkbox has 'checked' attribute", isCheckboxChecked(g3Card));
testAssert("G3_VIET_13 card has 'border-teal-400' styling", g3Card.classList.contains('border-teal-400'));

const choreCard = catalogContainer.children.find(c => c.innerHTML.includes('chore_desk'));
testAssert("chore_desk card exists in DOM", !!choreCard);
testAssert("chore_desk checkbox does NOT have 'checked' attribute", !isCheckboxChecked(choreCard));
testAssert("chore_desk card does NOT have 'border-teal-400' styling", !choreCard.classList.contains('border-teal-400'));

console.log("\n[TEST 5] Batch Summary UI Synchronization");
const batchCountElem = getElement('batch-selected-count');
testAssert("batch-selected-count displays '3'", batchCountElem.innerText === '3' || batchCountElem.innerText === 3);

const batchMetaElem = getElement('batch-selected-meta');
testAssert("batch-selected-meta is properly formatted", batchMetaElem.innerText.includes('bước') && batchMetaElem.innerText.includes('⭐'));

console.log("\n[TEST 6] Select All (true) Persistence Across Reload");
exp.selectAllCatalog(true);
testAssert("Select all sets count to 29", exp.appState.selectedCatalogIds.size === 29);

// Reload
domContentLoadedHandler();
testAssert("Reload preserves all 29 selected tasks", exp.appState.selectedCatalogIds.size === 29);
const checkedInDom = catalogContainer.children.filter(c => isCheckboxChecked(c)).length;
testAssert("All 29 rendered DOM cards have checked checkboxes", checkedInDom === 29);

console.log("\n[TEST 7] Cross-Grade & Cross-Subject Filter Selection Resilience");
// Select Grade 2 filter
exp.parentFilterGrade(2);
testAssert("Catalog container renders only Grade 2 tasks", catalogContainer.children.length === 5);
// All rendered Grade 2 tasks are checked because of selectAll(true)
testAssert("All Grade 2 cards are checked", catalogContainer.children.every(c => isCheckboxChecked(c)));

// Toggle off one Grade 2 task
exp.toggleCatalogItem('G2_MATH_06', false);
testAssert("G2_MATH_06 is now unselected", !exp.appState.selectedCatalogIds.has('G2_MATH_06'));
testAssert("Overall selectedCatalogIds size is 28", exp.appState.selectedCatalogIds.size === 28);

// Switch filter to Grade 1
exp.parentFilterGrade(1);
testAssert("Catalog container renders Grade 1 tasks (9)", catalogContainer.children.length === 9);
testAssert("Grade 1 tasks remain checked", catalogContainer.children.every(c => isCheckboxChecked(c)));

// Switch back to all
exp.parentFilterGrade('all');
testAssert("Catalog container back to 29 tasks", catalogContainer.children.length === 29);
testAssert("28 cards checked, 1 unchecked", catalogContainer.children.filter(c => isCheckboxChecked(c)).length === 28);

// Reload with filtered state saved
domContentLoadedHandler();
testAssert("Reload preserves 28 checked items across grades", exp.appState.selectedCatalogIds.size === 28);
testAssert("G2_MATH_06 remains unchecked after reload", !exp.appState.selectedCatalogIds.has('G2_MATH_06'));

console.log("\n======================================================================");
console.log(`TOTAL ASSERTIONS:  ${totalAssertions}`);
console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITHOUT ERRORS!");
console.log("======================================================================");
