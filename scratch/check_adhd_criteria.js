const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html);
const appScript = scriptRegex.exec(html)[1];

const sandbox = {
  console: console,
  document: { addEventListener: () => {}, getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, style: {} }), querySelectorAll: () => [], querySelector: () => null },
  window: { addEventListener: () => {}, localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }, location: { search: '' } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  BroadcastChannel: function() { return { postMessage: () => {}, close: () => {} }; },
  WebSocket: function() { return { readyState: 1, send: () => {}, close: () => {} }; },
  setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {}
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
vm.createContext(sandbox);
vm.runInContext(appScript + '\n;globalThis.__taskDatabase = taskDatabase;', sandbox);

const taskDb = sandbox.__taskDatabase;
const taskEntries = Object.entries(taskDb).filter(([k, v]) => v && v.id);

console.log("=== CHECKING ALL STEP DURATIONS ===");
taskEntries.forEach(([key, task]) => {
  task.steps.forEach((step, idx) => {
    if (step.duration_sec < 60 || step.duration_sec > 300) {
      console.log(`Task [${task.id}] Step ${idx + 1} (${step.badge || step.title}): duration_sec = ${step.duration_sec}`);
    }
  });
});

console.log("=== CHECKING ALL ACTION VERBS ===");
const verbPattern = /^[a-zA-ZÀ-ỹ_]+$/;
taskEntries.forEach(([key, task]) => {
  task.steps.forEach((step, idx) => {
    const verb = step.action_verb || "";
    if (!verbPattern.test(verb)) {
      console.log(`Task [${task.id}] Step ${idx + 1}: action_verb '${verb}' violates regex ^[a-zA-ZÀ-ỹ_]+$`);
    }
  });
});

console.log("=== CHECKING ALL WORD COUNTS ===");
taskEntries.forEach(([key, task]) => {
  task.steps.forEach((step, idx) => {
    const text = step.atomic_instruction || step.instruction || step.text || "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 15) {
      console.log(`Task [${task.id}] Step ${idx + 1}: word count = ${words.length} (>= 15): "${text}"`);
    }
  });
});
