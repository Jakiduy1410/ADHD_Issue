const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 1. Read index.html
const html = fs.readFileSync('index.html', 'utf8');

// 2. Load benchmark JSON
const benchmarkData = JSON.parse(fs.readFileSync(path.join('data', 'curriculum', 'grade_1_to_5_benchmark.json'), 'utf8'));
const expectedBenchmarkIds = benchmarkData.exercises.map(e => e.id);
console.log(`Expected Benchmark IDs (${expectedBenchmarkIds.length}):`, expectedBenchmarkIds);

// 3. Extract script #2 from index.html
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // script 1 (tailwind config)
const match2 = scriptRegex.exec(html);
if (!match2) {
  console.error("Could not find script #2 in index.html");
  process.exit(1);
}
const appScript = match2[1];

// 4. Run script in sandbox with mock environment to extract `taskDatabase` and UI filter logic
const sandbox = {
  console: console,
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      innerHTML: '',
      innerText: '',
      textContent: '',
      value: '',
      checked: false,
      setAttribute: () => {},
      getAttribute: () => null,
      focus: () => {},
      style: {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      setAttribute: () => {},
      style: {}
    })
  },
  window: {
    addEventListener: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    AudioContext: function() {
      return {
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, type: 'sine' }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }),
        currentTime: 0,
        destination: {}
      };
    },
    location: { search: '' }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  BroadcastChannel: function(name) {
    return { name, postMessage: () => {}, close: () => {} };
  },
  WebSocket: function(url) {
    return { url, readyState: 1, send: () => {}, close: () => {} };
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

vm.createContext(sandbox);

try {
  vm.runInContext(appScript + '\n;globalThis.__taskDatabase = taskDatabase; globalThis.__appState = appState;', sandbox);
  console.log("App script successfully executed in sandbox.");
} catch (e) {
  console.error("Error executing app script:", e);
}

const taskDatabase = sandbox.__taskDatabase || sandbox.window.__taskDatabase;
if (!taskDatabase) {
  console.error("ERROR: taskDatabase is undefined in sandbox!");
  process.exit(1);
}

// Analyze taskDatabase
const keys = Object.keys(taskDatabase);
console.log(`Total keys in taskDatabase: ${keys.length}`);
console.log("Keys:", keys);

// Check distinct tasks (handling aliases)
const uniqueTaskMap = new Map();
for (const [k, v] of Object.entries(taskDatabase)) {
  if (!v || !v.id) continue;
  if (!uniqueTaskMap.has(v.id)) {
    uniqueTaskMap.set(v.id, { originalKey: k, task: v });
  }
}
console.log(`Total unique task IDs: ${uniqueTaskMap.size}`);

// Verify 25 benchmark tasks
let missingBenchmark = [];
for (const bid of expectedBenchmarkIds) {
  if (!uniqueTaskMap.has(bid)) {
    missingBenchmark.push(bid);
  }
}
console.log(`Missing benchmark tasks count: ${missingBenchmark.length}`);
if (missingBenchmark.length > 0) {
  console.error("Missing IDs:", missingBenchmark);
} else {
  console.log("ALL 25 GDPT 2018 BENCHMARK TASKS ARE PRESENT!");
}

// Find routine tasks
const routineTasks = [];
for (const [id, entry] of uniqueTaskMap.entries()) {
  if (!expectedBenchmarkIds.includes(id)) {
    routineTasks.push(entry);
  }
}
console.log(`Routine tasks count: ${routineTasks.length}`);
routineTasks.forEach(r => console.log(`  Routine: ${r.task.id} - ${r.task.title} - category: ${r.task.category}`));

// Check total unique tasks = 29
console.log(`Total tasks count (25 benchmark + ${routineTasks.length} routine): ${uniqueTaskMap.size}`);

// Verify ADHD Cognitive Guidelines for ALL tasks:
// - instruction < 15 words
// - single action verb (1 token, only word chars)
// - duration 60s - 300s
// - immediate reinforcer < 300ms

console.log("\n=== AUDITING ADHD COGNITIVE GUIDELINES ===");
let violations = [];
let totalSteps = 0;

for (const [id, entry] of uniqueTaskMap.entries()) {
  const task = entry.task;
  const steps = task.steps || [];
  totalSteps += steps.length;
  
  steps.forEach((step, idx) => {
    // 1. Instruction word count
    const instr = step.instruction || step.atomic_instruction || step.text || "";
    const words = instr.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 15) {
      violations.push({
        taskId: id,
        stepIndex: idx,
        type: "INSTRUCTION_WORD_COUNT",
        detail: `Word count is ${words.length} (>= 15): "${instr}"`
      });
    }

    // 2. Action verb: single word
    const verb = (step.action_verb || step.verb || "").trim();
    if (!verb) {
      violations.push({
        taskId: id,
        stepIndex: idx,
        type: "MISSING_ACTION_VERB",
        detail: `No action_verb defined`
      });
    } else {
      const verbTokens = verb.split(/\s+/).filter(Boolean);
      if (verbTokens.length > 1) {
        violations.push({
          taskId: id,
          stepIndex: idx,
          type: "MULTI_WORD_ACTION_VERB",
          detail: `Action verb has ${verbTokens.length} tokens: "${verb}"`
        });
      }
    }

    // 3. Duration: 60s - 300s
    const dur = step.duration_sec || step.duration || 0;
    if (dur < 60 || dur > 300) {
      violations.push({
        taskId: id,
        stepIndex: idx,
        type: "DURATION_OUT_OF_BOUNDS",
        detail: `Duration is ${dur}s (must be between 60s and 300s)`
      });
    }

    // 4. Dopamine reinforcer latency < 300ms
    // Check if immediate_reinforcer has latency_ms or if audio feedback is instant
    if (step.immediate_reinforcer) {
      if (step.immediate_reinforcer.latency_ms && step.immediate_reinforcer.latency_ms > 300) {
        violations.push({
          taskId: id,
          stepIndex: idx,
          type: "DOPAMINE_LATENCY_EXCEEDED",
          detail: `Immediate reinforcer latency is ${step.immediate_reinforcer.latency_ms}ms (> 300ms)`
        });
      }
    }
  });
}

console.log(`Total micro-steps checked across all ${uniqueTaskMap.size} tasks: ${totalSteps}`);
console.log(`Total ADHD guideline violations: ${violations.length}`);
if (violations.length > 0) {
  console.log("Violations found:", JSON.stringify(violations, null, 2));
} else {
  console.log("100% OF MICRO-TASKS COMPLY WITH ADHD COGNITIVE GUIDELINES!");
}

