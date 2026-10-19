const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

// 1. Read existing index.html
let indexCode = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// 2. Define the replacement logic for PARENT_CHEER_SEND subscriber
const oldSubscriber = `      // 9. PARENT_CHEER_SEND: Parent sends cheer -> Milo animation & bubble on Child screen
      bus.subscribe('PARENT_CHEER_SEND', (payload) => {
        playSfx('bell');
        const speechEl = document.getElementById('child-milo-speech');
        if (speechEl) {
          speechEl.innerText = \`👩 Mẹ nhắn: "\${payload.cheerText}" ❤️\`;
          if (speechEl.parentElement) {
            speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
            setTimeout(() => {
              if (speechEl.parentElement) speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
            }, 4000);
          }
        }
        showToast("Lời Khen Của Mẹ", payload.cheerText, "❤️");
      });`;

const newSubscriber = `      // 9. PARENT_CHEER_SEND: Parent sends cheer -> Milo animation & bubble on Child screen
      bus.subscribe('PARENT_CHEER_SEND', (payload) => {
        playSfx('bell');
        const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
        const speechEl = document.getElementById('child-milo-speech');
        if (speechEl) {
          speechEl.innerText = \`👩 Mẹ nhắn: "\${cheerMsg}" ❤️\`;
          if (speechEl.parentElement) {
            speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
            setTimeout(() => {
              if (speechEl.parentElement) speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
            }, 4000);
          }
        }
        showToast("Lời Khen Của Mẹ", cheerMsg, "❤️");
      });`;

assert(indexCode.includes(oldSubscriber), "Old subscriber must exist in index.html");
indexCode = indexCode.replace(oldSubscriber, newSubscriber);

// Extract main app script (second script tag)
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(indexCode); // Skip Tailwind config
const appScriptMatch = scriptRegex.exec(indexCode);
assert(appScriptMatch, "Failed to extract main app script from index.html");
const appScript = appScriptMatch[1];

// Setup mock DOM environment
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
      parentElement: {
        classList: {
          _classes: new Set(),
          add: function(...args) { args.forEach(c => this._classes.add(c)); },
          remove: function(...args) { args.forEach(c => this._classes.delete(c)); },
          contains: function(c) { return this._classes.has(c); }
        }
      },
      children: [],
      style: {},
      appendChild: function(c) { this.children.push(c); c.parentElement = this; },
      setAttribute: function(k, v) { this[k] = v; },
      querySelectorAll: () => []
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
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    classList: { _classes: new Set(), add(){}, remove(){}, contains: ()=>false },
    innerText: "", innerHTML: "", className: "", style: {}, children: [], appendChild(){}, setAttribute(){}
  })
};

const listeners = {};
const mockWindow = {
  location: { search: "?role=dual&room=family_room_milo_01", hostname: "localhost", protocol: "http:" },
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
  localStorage: { getItem: () => null, setItem: ()=>{} },
  BroadcastChannel: class { postMessage(){} addEventListener(){} },
  WebSocket: class { constructor(){ this.readyState = 3; } addEventListener(){} send(){} },
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
  alert: () => {}
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);
const wrappedScript = appScript + "\n;__exports__ = { taskDatabase, appState, MiloSyncBus, parentFilterCatalog, parentFilterGrade, parentApproveTicket, childRedeemTicket, renderChildIslandRoadmap, updateStarsEverywhere, playSfx, showToast, spawnStars, formatTime, renderParentTelemetryProgress };";
vm.runInContext(wrappedScript, sandbox);

// Fire DOMContentLoaded
mockWindow._fireEvent('DOMContentLoaded');
const bus = mockWindow.miloBus;
assert(bus, "bus must be instantiated after DOMContentLoaded");

// Test 5.9: Legacy { cheerText }
bus.broadcast('PARENT_CHEER_SEND', { cheerText: 'Con trai yêu làm rất tốt!' });
const speech59 = getElement('child-milo-speech');
assert(speech59.innerText.includes('Con trai yêu làm rất tốt!'), `Speech bubble must contain cheer text: ${speech59.innerText}`);
assert(!speech59.innerText.includes('undefined'), `Speech bubble displayed undefined in 5.9: ${speech59.innerText}`);
console.log('✓ Test 5.9 Passed:', speech59.innerText);

// Test 5.9b: PROJECT.md contract { message }
bus.broadcast('PARENT_CHEER_SEND', { message: 'Mẹ luôn đồng hành cùng con!' });
const speech59b = getElement('child-milo-speech');
assert(!speech59b.innerText.includes('undefined'), `Speech bubble displayed undefined: ${speech59b.innerText}`);
assert(speech59b.innerText.includes('Mẹ luôn đồng hành cùng con!'), `Speech bubble must contain message text: ${speech59b.innerText}`);
console.log('✓ Test 5.9b Passed:', speech59b.innerText);

// Test Edge Case 1: Empty object {}
bus.broadcast('PARENT_CHEER_SEND', {});
const speechEmpty = getElement('child-milo-speech');
assert(!speechEmpty.innerText.includes('undefined'), `Speech bubble displayed undefined for {}: ${speechEmpty.innerText}`);
assert(speechEmpty.innerText.includes('Mẹ rất tự hào về con!'), `Speech bubble must contain fallback text: ${speechEmpty.innerText}`);
console.log('✓ Edge Case 1 ({}) Passed:', speechEmpty.innerText);

// Test Edge Case 2: Plain String
bus.broadcast('PARENT_CHEER_SEND', 'Cố lên con trai yêu!');
const speechStr = getElement('child-milo-speech');
assert(speechStr.innerText.includes('Cố lên con trai yêu!'), `Speech bubble must contain string text: ${speechStr.innerText}`);
assert(!speechStr.innerText.includes('undefined'), `Speech bubble displayed undefined for string: ${speechStr.innerText}`);
console.log('✓ Edge Case 2 (string) Passed:', speechStr.innerText);

// Test Edge Case 3: Both cheerText and message provided (cheerText takes priority or message, non-empty)
bus.broadcast('PARENT_CHEER_SEND', { cheerText: 'Khen cụ thể', message: 'Khen chung' });
const speechBoth = getElement('child-milo-speech');
assert(speechBoth.innerText.includes('Khen cụ thể'), `Speech bubble must handle both: ${speechBoth.innerText}`);
console.log('✓ Edge Case 3 (both) Passed:', speechBoth.innerText);

console.log('\n================================================================');
console.log('  ALL CHEER PROTOCOL ASSERTIONS PASSED WITH ZERO "undefined"');
console.log('================================================================');
