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
const taskMap = new Map();
Object.values(taskDb).forEach(t => {
  if (t && t.id) taskMap.set(t.id, t);
});
const tasks = Array.from(taskMap.values());

console.log(`Total unique tasks: ${tasks.length}`);

// Category breakdown
const cats = ['all', 'math', 'viet', 'eng', 'chore'];
const grades = ['all', 1, 2, 3, 4, 5];

console.log("\n--- Category Breakdown (all grades) ---");
cats.forEach(c => {
  const count = tasks.filter(t => c === 'all' || t.cat === c).length;
  console.log(`Category [${c}]: ${count} tasks`);
});

console.log("\n--- Grade Breakdown (all categories) ---");
grades.forEach(g => {
  const count = tasks.filter(t => g === 'all' || t.grade === g).length;
  console.log(`Grade [${g}]: ${count} tasks`);
});

console.log("\n--- Cross Matrix (Grade x Category) ---");
grades.forEach(g => {
  const row = cats.map(c => {
    const count = tasks.filter(t => (c === 'all' || t.cat === c) && (g === 'all' || t.grade === g)).length;
    return `${c}:${count}`;
  });
  console.log(`Grade ${g} -> ${row.join(', ')}`);
});

// Check if any task has missing cat, grade, icon, title, steps, reward
console.log("\n--- Task Properties Integrity Check ---");
let integrityErrors = [];
tasks.forEach(t => {
  if (!t.id) integrityErrors.push(`Task missing id`);
  if (!t.title) integrityErrors.push(`Task ${t.id} missing title`);
  if (!t.cat) integrityErrors.push(`Task ${t.id} missing cat`);
  if (t.grade === undefined || t.grade === null) integrityErrors.push(`Task ${t.id} missing grade`);
  if (!t.icon) integrityErrors.push(`Task ${t.id} missing icon`);
  if (!Array.isArray(t.steps) || t.steps.length === 0) integrityErrors.push(`Task ${t.id} has no steps`);
  if (typeof t.reward !== 'number') integrityErrors.push(`Task ${t.id} missing reward`);
});

if (integrityErrors.length > 0) {
  console.log("Integrity errors found:", integrityErrors);
} else {
  console.log("100% of tasks have valid id, title, cat, grade, icon, steps, and reward!");
}
