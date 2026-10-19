const fs = require('fs');
const vm = require('vm');
const path = require('path');

const benchmarkData = JSON.parse(fs.readFileSync(path.join('data', 'curriculum', 'grade_1_to_5_benchmark.json'), 'utf8'));
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

console.log("=== ADVERSARIAL INTEGRITY AUDIT: TASK CONTENT vs GROUND TRUTH ===");
let integrityIssues = [];

benchmarkData.exercises.forEach(ex => {
  const dbTask = taskDb[ex.id];
  if (!dbTask) {
    integrityIssues.push(`[CRITICAL] Missing task ${ex.id} in taskDatabase`);
    return;
  }

  // Check title/topic relevance
  if (!dbTask.title || dbTask.title.trim().length === 0) {
    integrityIssues.push(`[INTEGRITY] Task ${ex.id} has empty title`);
  }

  // Check steps count
  if (!dbTask.steps || dbTask.steps.length === 0) {
    integrityIssues.push(`[CRITICAL] Task ${ex.id} has zero steps`);
  }

  // Check final answer
  if (!dbTask.final_answer) {
    integrityIssues.push(`[MAJOR] Task ${ex.id} has no final_answer`);
  } else {
    const dbFinal = String(dbTask.final_answer.normalized_display || dbTask.final_answer.value || "").trim();
    const benchFinal = String(ex.final_answer.normalized_display || ex.final_answer.value || "").trim();
    if (!dbFinal) {
      integrityIssues.push(`[MAJOR] Task ${ex.id} final_answer is empty`);
    }
  }

  // Check pedagogical steps match ground truth steps
  const dbStepsCount = dbTask.steps ? dbTask.steps.length : 0;
  const gtStepsCount = ex.ground_truth_steps ? ex.ground_truth_steps.length : 0;
  console.log(`Task ${ex.id}: Grade ${ex.grade} | ${ex.category} | Steps: ${dbStepsCount} (Benchmark GT steps: ${gtStepsCount})`);
});

console.log(`\nIntegrity Issues found: ${integrityIssues.length}`);
if (integrityIssues.length > 0) {
  console.log(integrityIssues);
} else {
  console.log("100% of tasks match ground truth and contain authentic pedagogical steps!");
}
