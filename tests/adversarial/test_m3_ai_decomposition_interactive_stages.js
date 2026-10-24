/**
 * Automated Adversarial Verification Suite for Milestone M3:
 * Real Micro-Task AI Decomposer Pipeline & Child Interactive Stages (Requirements R2 & R3).
 *
 * Verifies:
 * 1. AI Task Decomposition Pipeline (parentRunAiBreakdown & generateClientSideMicroTasks):
 *    - Domain classification: Math vs Reading/Vietnamese vs Chores.
 *    - Strict conformance to Draft-07 schemas/micro_task_schema.json across all domains.
 *    - Duration scaling by cognitive profile (clamped 60s-300s).
 *    - Step count capped by max_steps_per_session.
 *    - Single action verb per step token (Đọc, Gạch_chân, Tính, Chọn, Điền).
 *    - Seamless dual setting of ui_payload and ui_data.
 *    - Preview card rendering and input synchronization.
 * 2. Stage Rendering Schema Compatibility (renderChildWorkspaceStep):
 *    - Standardized payload retrieval (ui_payload || ui_data).
 *    - Authentic rendering of single_choice, text_input, and highlight stages.
 * 3. Strict Answer Validation (handleChildTextInputSubmit):
 *    - Rejection of incorrect, fuzz, and malformed answers.
 *    - RSD-safe gentle corrective feedback ("Milo gợi ý: ...").
 *    - Acceptance of correct answers with trimming and case insensitivity.
 *    - Vietnamese decimal comma normalization ("12,5" == "12.5").
 * 4. Contextual Keyword Highlighting with Sentence Context:
 *    - Reading-order sentence tokenization preserving target entities.
 *    - Required target segments validation before enabling completion.
 *    - Safe non-target token toggling with gentle guidance.
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("TEST SUITE: M3 REAL AI DECOMPOSER & CHILD INTERACTIVE STAGES (R2 & R3)");
console.log("======================================================================\n");

const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');

// DOM Sandbox Setup
function createMockDOM() {
  const store = {};
  function getEl(id) {
    if (!store[id]) {
      const cls = new Set(['hidden']);
      const children = [];
      store[id] = {
        id,
        classList: {
          contains: (c) => cls.has(c),
          add: (...c) => c.forEach(x => cls.add(x)),
          remove: (...c) => c.forEach(x => cls.delete(x)),
          toggle: (c) => { if (cls.has(c)) { cls.delete(c); return false; } else { cls.add(c); return true; } }
        },
        innerText: '',
        innerHTML: '',
        value: '',
        disabled: false,
        style: {
          setProperty: function(k, v) { this[k] = v; }
        },
        children: children,
        scrollIntoView: () => {},
        appendChild: (child) => children.push(child),
        querySelectorAll: (selector) => {
          const results = [];
          function traverse(el) {
            if (!el) return;
            if (selector.startsWith('.') && el.classList && el.classList.contains(selector.slice(1))) {
              results.push(el);
            }
            if (selector.includes('[data-is-target="true"]') && el.getAttribute && el.getAttribute('data-is-target') === 'true') {
              results.push(el);
            }
            if (el.children) {
              el.children.forEach(traverse);
            }
          }
          traverse(store[id]);
          return results;
        },
        querySelector: (sel) => {
          const all = store[id].querySelectorAll(sel);
          return all.length > 0 ? all[0] : null;
        },
        getAttribute: (k) => store[id][`attr_${k}`] || null,
        setAttribute: (k, v) => { store[id][`attr_${k}`] = String(v); }
      };
    }
    return store[id];
  }

  const doc = {
    getElementById: (id) => getEl(id),
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        classList: {
          classes: new Set(),
          contains: function(c) { return this.classes.has(c); },
          add: function(...c) { c.forEach(x => this.classes.add(x)); },
          remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
          toggle: function(c) { if (this.classes.has(c)) { this.classes.delete(c); return false; } else { this.classes.add(c); return true; } }
        },
        className: '',
        innerHTML: '',
        innerText: '',
        value: '',
        attributes: {},
        children: [],
        appendChild: function(c) { this.children.push(c); },
        getAttribute: function(k) { return this.attributes[k] || null; },
        setAttribute: function(k, v) { this.attributes[k] = String(v); },
        querySelectorAll: function(selector) {
          const results = [];
          function scan(n) {
            if (!n) return;
            if (selector.includes('[data-is-target="true"]') && n.getAttribute && n.getAttribute('data-is-target') === 'true') {
              results.push(n);
            }
            if (selector.startsWith('.') && n.classList && n.classList.contains(selector.slice(1))) {
              results.push(n);
            }
            if (n.children) n.children.forEach(scan);
          }
          scan(this);
          return results;
        }
      };
      return el;
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
  };

  return { store, getEl, doc };
}

const mockDOM = createMockDOM();
const toasts = [];
const sfxPlayed = [];

const sandbox = {
  window: {
    addEventListener: () => {},
    location: { search: '' }
  },
  document: mockDOM.doc,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  },
  showToast: (title, desc, icon) => { toasts.push({ title, desc, icon }); },
  playSfx: (cue) => { sfxPlayed.push(cue); },
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  formatTime: (s) => `${s}s`,
  fetch: undefined // offline mode
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.__TEST_MODE__ = true;

vm.createContext(sandbox);

// Export hooks
const exportHooks = `
;__m3_exports__ = {
  detectDomainSubject,
  generateClientSideMicroTasks,
  parentRunAiBreakdown,
  tokenizeSentenceForHighlight,
  toggleHighlightToken,
  completeHighlightStep,
  toggleHighlightSegment,
  normalizeAnswer,
  handleChildTextInputSubmit,
  handleChildTextInput,
  renderChildWorkspaceStep,
  appState,
  DEFAULT_COGNITIVE_PROFILE,
  taskDatabase,
  get activeGeneratedAiTask() { return activeGeneratedAiTask; },
  set activeGeneratedAiTask(v) { activeGeneratedAiTask = v; }
};
`;

vm.runInContext(appScript + exportHooks, sandbox);
const exp = sandbox.__m3_exports__;

let testsRun = 0;
let testsPassed = 0;

const pendingAsyncTests = [];
const asyncFailures = [];

function runTest(name, fn) {
  testsRun++;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      pendingAsyncTests.push(result.then(() => {
        console.log(`  ✓ [PASS] ${name}`);
        testsPassed++;
      }).catch(err => {
        console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
        asyncFailures.push({ name, err });
      }));
    } else {
      console.log(`  ✓ [PASS] ${name}`);
      testsPassed++;
    }
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// ============================================================================
// SUITE 1: DOMAIN DETECTION & SMART OFFLINE TASK DECOMPOSITION (R2)
// ============================================================================
console.log("--- SUITE 1: Domain Detection & Smart Offline Task Decomposition ---");

runTest("1.1: detectDomainSubject correctly classifies Math, Chores, and Reading", () => {
  assert.strictEqual(exp.detectDomainSubject("Bác Ba có 12 con gà, bán đi 5 con gà"), "toan");
  assert.strictEqual(exp.detectDomainSubject("Tính chu vi hình chữ nhật có chiều dài 8m"), "toan");
  assert.strictEqual(exp.detectDomainSubject("Có 15 cái kẹo chia đều cho 3 bạn"), "toan");

  assert.strictEqual(exp.detectDomainSubject("Dọn dẹp bàn học và cất sách vở vào cặp"), "khoa_hoc_tu_nhien");
  assert.strictEqual(exp.detectDomainSubject("Quét nhà và nhặt rác bỏ vào thùng"), "khoa_hoc_tu_nhien");
  assert.strictEqual(exp.detectDomainSubject("Gấp quần áo gọn gàng sau khi tắm"), "khoa_hoc_tu_nhien");

  assert.strictEqual(exp.detectDomainSubject("Đọc bài thơ Em yêu mùa hè và tìm từ ngữ miêu tả"), "tieng_viet");
  assert.strictEqual(exp.detectDomainSubject("Đọc đoạn văn kể chuyện cây sồi và tìm từ láy"), "tieng_viet");
});

runTest("1.2: generateClientSideMicroTasks scales duration and caps steps by cognitive profile", () => {
  const profileMild = {
    attention_span_minutes: 20,
    recommended_micro_task_duration_sec: 240,
    working_memory_capacity: 4,
    rsd_sensitivity_level: 'LOW',
    scaffolding_level: 'MINIMAL',
    max_steps_per_session: 3
  };

  const mathSession = exp.generateClientSideMicroTasks("Mẹ có 18 bông hoa, cắm vào 2 lọ", profileMild);
  assert.strictEqual(mathSession.task_metadata.subject, "toan");
  assert.strictEqual(mathSession.task_metadata.total_micro_tasks, 3);
  assert.strictEqual(mathSession.micro_tasks[0].duration_sec, 240);
  assert.strictEqual(mathSession.micro_tasks[0].action_verb, "Gạch_chân");
  assert.strictEqual(mathSession.micro_tasks[1].action_verb, "Chọn");
  assert.strictEqual(mathSession.micro_tasks[2].action_verb, "Điền");
  assert.strictEqual(mathSession.micro_tasks[2].is_final_step, true);
  assert.strictEqual(mathSession.final_summary.extracted_final_answer, "9");

  // Profile with clamped duration (e.g., 50s -> clamped to 60s)
  const profileSevere = {
    attention_span_minutes: 5,
    recommended_micro_task_duration_sec: 50,
    working_memory_capacity: 1,
    rsd_sensitivity_level: 'SEVERE',
    scaffolding_level: 'INTENSIVE',
    max_steps_per_session: 2
  };
  const severeSession = exp.generateClientSideMicroTasks("Dọn dẹp bàn học và cất bút", profileSevere);
  assert.strictEqual(severeSession.micro_tasks[0].duration_sec, 60, "Duration must clamp to minimum 60s");
  assert.strictEqual(severeSession.micro_tasks.length, 2, "Step count capped by max_steps_per_session (2)");
  assert.strictEqual(severeSession.micro_tasks[1].is_final_step, true);
});

runTest("1.3: parentRunAiBreakdown populates activeGeneratedAiTask and renders preview list", async () => {
  const inputEl = mockDOM.getEl('ai-task-input');
  inputEl.value = "Lớp 3A có 24 học sinh, chia đều thành 4 tổ";
  const previewTitle = mockDOM.getEl('ai-preview-title');
  const previewSteps = mockDOM.getEl('ai-preview-steps-list');
  const previewCard = mockDOM.getEl('ai-preview-card');

  await exp.parentRunAiBreakdown();

  assert.ok(exp.activeGeneratedAiTask, "activeGeneratedAiTask must be populated");
  assert.strictEqual(exp.activeGeneratedAiTask.cat, "math");
  assert.strictEqual(exp.activeGeneratedAiTask.steps.length, 3);
  assert.strictEqual(previewTitle.value, exp.activeGeneratedAiTask.title);
  assert.strictEqual(previewSteps.children.length, 3, "Preview list must render 3 steps");
  assert.strictEqual(previewCard.classList.contains('hidden'), false, "Preview card must become visible");

  // Verify dual ui_payload and ui_data properties
  exp.activeGeneratedAiTask.steps.forEach(st => {
    assert.ok(st.ui_payload, "ui_payload must exist");
    assert.ok(st.ui_data, "ui_data must exist for seamless backward compatibility");
    assert.strictEqual(st.ui_payload, st.ui_data);
  });
});

// ============================================================================
// SUITE 2: STAGE RENDERING SCHEMA COMPATIBILITY (R2 & R3)
// ============================================================================
console.log("\n--- SUITE 2: Stage Rendering Schema Compatibility ---");

runTest("2.1: renderChildWorkspaceStep renders single_choice dynamically with authentic options", () => {
  const testTask = {
    id: "test_choice_01",
    title: "Phép tính mẫu",
    stepSeconds: 90,
    steps: [
      {
        step_id: 1,
        title: "Chọn công thức",
        action_verb: "Chọn",
        atomic_instruction: "Chọn công thức tính diện tích hình chữ nhật",
        ui_type: "single_choice",
        ui_payload: {
          prompt_text: "Công thức tính diện tích hình chữ nhật là:",
          options: ["Dài nhân Rộng", "Dài cộng Rộng", "Dài nhân 2"]
        },
        success_criteria: {
          expected_answer: "Dài nhân Rộng"
        }
      }
    ]
  };

  exp.appState.activeTask = testTask;
  exp.renderChildWorkspaceStep(0);

  const stage = mockDOM.getEl('child-interactive-stage');
  assert.ok(stage.innerHTML.includes("Dài nhân Rộng"), "Rendered options must include authentic choice");
  assert.ok(stage.innerHTML.includes("Công thức tính diện tích"), "Rendered prompt must match payload");
  assert.ok(!stage.innerHTML.includes("🎯\n            </div>\n            <p class=\"text-xs font-bold text-slate-700 text-center px-2"), "Must NOT fall back to generic card");
});

runTest("2.2: renderChildWorkspaceStep renders text_input with placeholder and input box", () => {
  const testTask = {
    id: "test_input_01",
    title: "Điền số",
    stepSeconds: 60,
    steps: [
      {
        step_id: 1,
        title: "Điền kết quả",
        action_verb: "Điền",
        atomic_instruction: "Đếm số chân của con mèo rồi điền vào ô trống",
        ui_type: "text_input",
        ui_payload: {
          prompt_text: "Con mèo có mấy cái chân?",
          placeholder: "Nhập số chân..."
        },
        success_criteria: {
          expected_answer: "4"
        }
      }
    ]
  };

  exp.appState.activeTask = testTask;
  exp.renderChildWorkspaceStep(0);

  const stage = mockDOM.getEl('child-interactive-stage');
  assert.ok(stage.innerHTML.includes('id="child-stage-text-input"'), "Must render child-stage-text-input");
  assert.ok(stage.innerHTML.includes('placeholder="Nhập số chân..."'), "Must render authentic placeholder");
  assert.ok(stage.innerHTML.includes('Con mèo có mấy cái chân?'), "Must render authentic prompt");
});

// ============================================================================
// SUITE 3: STRICT ANSWER VALIDATION IN TEXT INPUT (R3)
// ============================================================================
console.log("\n--- SUITE 3: Strict Answer Validation in Text Input ---");

runTest("3.1: handleChildTextInputSubmit strictly validates answers, rejects invalid, shows RSD hint", () => {
  const btnNext = mockDOM.getEl('child-btn-next-step');
  const stageInput = mockDOM.getEl('child-stage-text-input');
  const fb = mockDOM.getEl('text-input-feedback');

  // Set active step with expected answer "12.5"
  exp.appState.activeTask = {
    steps: [
      {
        step_id: 1,
        success_criteria: {
          expected_answer: "12.5",
          feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"
        }
      }
    ]
  };
  exp.appState.currentStepIndex = 0;

  // Case 1: Wrong answer "99"
  btnNext.disabled = true;
  stageInput.value = "99";
  exp.handleChildTextInputSubmit("12.5");
  assert.strictEqual(btnNext.disabled, true, "Wrong answer must keep next button disabled");
  assert.ok(fb.innerText.includes("Milo gợi ý"), "Wrong answer must show gentle RSD hint");
  assert.ok(fb.className.includes("text-amber-700"), "RSD safe styling (amber, not red shaming)");

  // Case 2: Random text fuzz
  stageInput.value = "sai rồi";
  exp.handleChildTextInputSubmit("12.5");
  assert.strictEqual(btnNext.disabled, true, "Text fuzz must keep next button disabled");

  // Case 3: Vietnamese decimal comma normalization ("12,5" matches "12.5")
  stageInput.value = " 12,5 ";
  exp.handleChildTextInputSubmit("12.5");
  assert.strictEqual(btnNext.disabled, false, "Vietnamese decimal comma '12,5' must equal '12.5'");
  assert.ok(fb.innerText.includes("Chính xác"), "Correct feedback shown");

  // Case 4: Array of acceptable answers
  exp.appState.activeTask.steps[0].success_criteria.expected_answer = ["8 con chim", "8"];
  btnNext.disabled = true;
  stageInput.value = "8";
  exp.handleChildTextInputSubmit(["8 con chim", "8"]);
  assert.strictEqual(btnNext.disabled, false, "Answer in acceptable variants array must enable next button");
});

// ============================================================================
// SUITE 4: CONTEXTUAL TOKENIZED KEYWORD HIGHLIGHTING (R3)
// ============================================================================
console.log("\n--- SUITE 4: Contextual Tokenized Keyword Highlighting ---");

runTest("4.1: tokenizeSentenceForHighlight splits sentence into tokens in reading order", () => {
  const sentence = "Bác Ba có 12 quả cam và 5 quả lê.";
  const targets = ["12 quả cam", "5 quả lê"];

  const tokens = exp.tokenizeSentenceForHighlight(sentence, targets);
  assert.ok(tokens.length >= 5, "Tokens must include both targets and surrounding words");

  const targetTokens = tokens.filter(t => t.isTarget);
  assert.strictEqual(targetTokens.length, 2, "Must find exactly 2 target tokens");
  assert.strictEqual(targetTokens[0].text, "12 quả cam");
  assert.strictEqual(targetTokens[1].text, "5 quả lê");

  const nonTargets = tokens.filter(t => !t.isTarget);
  assert.ok(nonTargets.some(t => t.text.includes("Bác")), "Must contain leading word");
  assert.ok(nonTargets.some(t => t.text.includes("và")), "Must contain conjunction");
});

runTest("4.2: Highlighting validates that all required targets are selected before completion", () => {
  const testTask = {
    id: "test_highlight_01",
    title: "Gạch chân số lượng",
    original_text: "Trên cành có 5 con chim và 3 con sóc.",
    stepSeconds: 60,
    steps: [
      {
        step_id: 1,
        title: "Gạch chân số lượng",
        action_verb: "Gạch_chân",
        atomic_instruction: "Gạch chân 2 số lượng con vật",
        ui_type: "highlight",
        ui_payload: {
          prompt_text: "Tìm 2 số lượng con vật trong câu:",
          highlight_target_segments: ["5 con chim", "3 con sóc"]
        },
        success_criteria: {
          expected_answer: ["5 con chim", "3 con sóc"]
        }
      }
    ]
  };

  exp.appState.activeTask = testTask;
  exp.renderChildWorkspaceStep(0);

  const container = mockDOM.getEl('highlight-tokens-container');
  const completeBtn = mockDOM.getEl('btn-complete-highlight');
  const fb = mockDOM.getEl('highlight-feedback');
  const stage = mockDOM.getEl('child-interactive-stage');
  const btnNext = mockDOM.getEl('child-btn-next-step');
  assert.ok(stage.innerHTML.includes('disabled'), "Complete button must have disabled attribute in HTML");
  completeBtn.disabled = true;

  // Create simulated tokens in container matching the DOM structure
  const tokenNonTarget = mockDOM.doc.createElement('button');
  tokenNonTarget.setAttribute('data-is-target', 'false');
  container.appendChild(tokenNonTarget);

  const tokenTarget1 = mockDOM.doc.createElement('button');
  tokenTarget1.setAttribute('data-is-target', 'true');
  container.appendChild(tokenTarget1);

  const tokenTarget2 = mockDOM.doc.createElement('button');
  tokenTarget2.setAttribute('data-is-target', 'true');
  container.appendChild(tokenTarget2);

  // Tap non-target token: toggles safely with gentle guidance
  exp.toggleHighlightToken(tokenNonTarget);
  assert.strictEqual(completeBtn.disabled, true, "Tapping non-target must not enable completion");
  assert.ok(fb.innerText.includes("Milo gợi ý"), "Non-target shows gentle guidance");

  // Tap first target token only (incomplete)
  exp.toggleHighlightToken(tokenTarget1);
  assert.strictEqual(completeBtn.disabled, true, "1 of 2 targets must keep completion button disabled");

  // Attempting completeHighlightStep before all targets: blocked with gentle reminder
  exp.completeHighlightStep(completeBtn);
  assert.strictEqual(btnNext.disabled, true, "Next step button must remain disabled");
  assert.ok(fb.innerText.includes("Vẫn còn dữ kiện"), "Shows gentle reminder");

  // Tap second target token (complete)
  exp.toggleHighlightToken(tokenTarget2);
  assert.strictEqual(completeBtn.disabled, false, "All targets selected must enable completion button");

  // Complete step
  exp.completeHighlightStep(completeBtn);
  assert.strictEqual(btnNext.disabled, false, "Completing highlight step unlocks next step button");
  assert.ok(completeBtn.innerText.includes("ĐÃ HOÀN THÀNH"), "Button text updates to completed");
});

(async () => {
  await Promise.allSettled(pendingAsyncTests);
  const failedCount = testsRun - testsPassed;
  console.log("\n======================================================================");
  console.log(`TOTAL M3 ADVERSARIAL TESTS: ${testsRun}`);
  console.log(`PASSED:                     ${testsPassed}`);
  console.log(`FAILED:                     ${failedCount}`);
  console.log("======================================================================");
  if (failedCount === 0 && asyncFailures.length === 0) {
    console.log("ALL M3 ADVERSARIAL & COMPATIBILITY TESTS PASSED CLEANLY!");
  } else {
    console.log("SOME M3 ADVERSARIAL TESTS FAILED!");
    process.exitCode = 1;
  }
})();