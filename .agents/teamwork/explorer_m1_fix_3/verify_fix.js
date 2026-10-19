const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // Skip Tailwind config
const appScriptMatch = scriptRegex.exec(html);
let appScript = appScriptMatch[1];

// Inject the hydration fix into appScript
const targetRegex = /(if\s*\(\s*saved\.totalSessionSeconds\s*!==\s*undefined\s*\)\s*\{[\s\S]*?\})/;
assert(targetRegex.test(appScript), 'Target regex not found in script');

const hydrationSnippet = `
        if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {
          appState.selectedCatalogIds = new Set(saved.selectedCatalogIds);
        }`;

appScript = appScript.replace(targetRegex, `$1${hydrationSnippet}`);

// Storage with 3 selected tasks
const store = {
  'milo_quest_saved_state': JSON.stringify({
    version: 1,
    selectedCatalogIds: ['G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13']
  })
};

const domElements = {};
function getElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id: id,
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      innerText: '',
      innerHTML: '',
      style: {},
      children: [],
      appendChild(c) { this.children.push(c); },
      parentElement: { classList: { add() {}, remove() {}, contains() { return false; } } },
      querySelectorAll: () => []
    };
  }
  return domElements[id];
}

const listeners = {};
const mockWindow = {
  location: { search: '' },
  addEventListener: (e, cb) => {
    listeners[e] = listeners[e] || [];
    listeners[e].push(cb);
  },
  _fireEvent: (e) => (listeners[e] || []).forEach(cb => cb())
};

const mockDocument = {
  getElementById: (id) => getElement(id),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tagName: tag,
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    setAttribute(k, v) { this[k] = v; },
    children: [],
    appendChild(c) { this.children.push(c); },
    className: '',
    innerHTML: ''
  })
};

const sandbox = {
  window: mockWindow,
  document: mockDocument,
  localStorage: {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v; }
  },
  BroadcastChannel: class { postMessage() {} close() {} },
  WebSocket: class { send() {} close() {} },
  URLSearchParams: URLSearchParams,
  setTimeout, clearTimeout, setInterval, clearInterval,
  console: { log() {}, warn() {}, error() {} },
  AudioContext: class {
    createOscillator() { return { start() {}, stop() {}, connect() {}, frequency: { setValueAtTime() {} } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {} } }; }
  }
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);
const wrappedScript = appScript + '\n;__exports__ = { appState, renderParentCatalogList };';
vm.runInContext(wrappedScript, sandbox);

// Fire DOMContentLoaded
mockWindow._fireEvent('DOMContentLoaded');

const appState = sandbox.__exports__.appState;
const selectedList = Array.from(appState.selectedCatalogIds);
console.log('Hydrated selectedCatalogIds:', selectedList);

const catalogContainer = getElement('catalog-tasks-list');
console.log('Total cards rendered:', catalogContainer.children.length);

const checkedCards = catalogContainer.children.filter(c => c.innerHTML.includes('type="checkbox" checked'));
console.log('Checked cards count:', checkedCards.length);
console.log('Checked card IDs:', checkedCards.map(c => c['data-task-id']));

const batchCount = getElement('batch-selected-count').innerText;
const batchMeta = getElement('batch-selected-meta').innerText;
console.log('Batch count UI text:', batchCount);
console.log('Batch meta UI text:', batchMeta);

assert.strictEqual(selectedList.length, 3);
assert.strictEqual(appState.selectedCatalogIds.has('G2_MATH_06'), true);
assert.strictEqual(checkedCards.length, 3);
assert.deepStrictEqual(checkedCards.map(c => c['data-task-id']), ['G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13']);
assert.strictEqual(batchCount, 3);
console.log('\n>>> ALL HYDRATION AND RENDERING CHECKS PASSED SUCCESSFULLY! <<<');
