/**
 * Empirical Adversarial Test Suite for Milestone M4:
 * UI Ergonomics, Accessibility (WCAG AA) & Visual Themes (Requirements R1 & R5).
 * 
 * Verifies:
 * 1. Parent Task Catalog Checkbox Truncation & Card Layout (R1.1):
 *    - overflow-hidden on cards
 *    - min-w-0 flex-1 on text containers
 *    - shrink-0 ml-2 on checkboxes
 *    - flex-wrap gap-1 on inner badge rows
 * 2. Viewport Scrolling & Sticky Batch Action Button (R1.2):
 *    - catalog-tasks-list has no nested mousewheel scroll trapping (no max-h-[380px] overflow-y-auto)
 *    - Batch action card has sticky bottom-0, backdrop-blur-md, border-2 border-teal-500, shadow-xl, z-20
 * 3. WCAG AA Color Contrast Compliance (R1.3):
 *    - .btn-disabled color is #475569 on #E2E8F0 (contrast >= 4.5:1)
 *    - Inactive filter chips text is text-slate-700 (#334155, contrast >= 4.5:1)
 *    - Inactive grade chips text is text-slate-800 (#1E293B, contrast >= 4.5:1)
 *    - Clue distractor has text-slate-700 font-bold and NO opacity-50
 *    - Context problem clue has text-slate-600 font-semibold and NO opacity-60
 *    - Input placeholders have placeholder:text-slate-600 and ::placeholder rule in <style>
 * 4. Distinct Visual Identity for Routines vs Study Tasks (R5):
 *    - .btn-3d-amber style definition in <style>
 *    - Routine/Chore tasks (task.cat === 'chore'):
 *      * Focus card / Cockpit: bg-[#FFFDF5] border-amber-300 ring-amber-100/50
 *      * Primary action button: .btn-3d-amber
 *      * Roadmap Node: bg-amber-100 text-amber-900 border-amber-300 ring-amber-200
 *      * Island Tag: "ĐẢO SINH HOẠT THƯ THÁI 🌿" with bg-amber-100 text-amber-800 border-amber-300
 *    - Study tasks (task.cat !== 'chore'):
 *      * Focus card / Cockpit: bg-[#F0FDFA] border-teal-200 ring-emerald-100
 *      * Primary action button: .btn-3d-green
 *      * Roadmap Node: bg-teal-100 text-teal-900 border-teal-300 ring-teal-200
 *      * Island Tag: "ĐẢO BÀI TẬP TẬP TRUNG 🎯" with bg-teal-100 text-teal-800 border-teal-300
 */

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("======================================================================");
console.log("ADVERSARIAL SUITE: M4 UI ERGONOMICS, WCAG AA CONTRAST & VISUAL THEMES");
console.log("======================================================================\n");

const rawHtml = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const css = fs.existsSync('app/css/style.css') ? fs.readFileSync('app/css/style.css', 'utf8') : '';
const jsModules = ['tasks_data.js', 'audio.js', 'sync_bus.js', 'state.js', 'geometry.js', 'roadmap.js', 'renderers.js', 'rewards_timer_milo.js', 'parent_survey.js', 'decomposer_fallback.js', 'app.js'];
const appScript = jsModules.map(f => fs.existsSync('app/js/' + f) ? fs.readFileSync('app/js/' + f, 'utf8') : '').join('\n;\n');
const html = rawHtml + `<style>\n${css}\n</style>\n<script>\n${appScript}\n</script>`;

// DOM Mock Environment
const domStore = {};
function getOrCreateElement(id) {
  if (!domStore[id]) {
    domStore[id] = {
      id: id,
      classList: {
        classes: new Set(),
        add: function(...cls) {
          cls.forEach(c => {
            if (c) c.split(/\s+/).filter(Boolean).forEach(x => this.classes.add(x));
          });
        },
        remove: function(...cls) {
          cls.forEach(c => {
            if (c) c.split(/\s+/).filter(Boolean).forEach(x => this.classes.delete(x));
          });
        },
        toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      className: "",
      innerText: "",
      _innerHTML: "",
      get innerHTML() { return this._innerHTML; },
      set innerHTML(val) {
        this._innerHTML = val;
        const matches = String(val).matchAll(/<([a-z0-9]+)[^>]*id=["']([^"']+)["'][^>]*>/gi);
        for (const m of matches) {
          const fullTag = m[0];
          const tagId = m[2];
          const el = getOrCreateElement(tagId);
          const classMatch = fullTag.match(/class=["']([^"']+)["']/i);
          if (classMatch) {
            el.className = classMatch[1];
            classMatch[1].split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));
          }
          const textMatch = String(val).match(new RegExp(`id=["']${tagId}["'][^>]*>([^<]*)`, 'i'));
          if (textMatch) el.innerText = textMatch[1].trim();
        }
      },
      value: "",
      disabled: false,
      children: [],
      style: {
        setProperty: function(k, v) { this[k] = v; }
      },
      appendChild: function(c) { this.children.push(c); },
      querySelectorAll: function(s) { return []; },
      setAttribute: function(attr, val) { this[attr] = val; }
    };
  }
  return domStore[id];
}

const mockDocument = {
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: (sel) => [],
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      classList: {
        classes: new Set(),
        add: function(...cls) {
          cls.forEach(c => {
            if (c) c.split(/\s+/).filter(Boolean).forEach(x => this.classes.add(x));
          });
        },
        remove: function(...cls) {
          cls.forEach(c => {
            if (c) c.split(/\s+/).filter(Boolean).forEach(x => this.classes.delete(x));
          });
        },
        contains: function(c) { return this.classes.has(c); }
      },
      innerText: "",
      innerHTML: "",
      className: "",
      style: {
        setProperty: function(k, v) { this[k] = v; }
      },
      children: [],
      appendChild: function(c) { this.children.push(c); },
      setAttribute: function(attr, val) { this[attr] = val; },
      remove: function() {}
    };
  }
};

const sandbox = {
  window: {
    location: { search: "?role=dual", hostname: "localhost", protocol: "http:" },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  document: mockDocument,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  },
  BroadcastChannel: class { postMessage() {} close() {} },
  WebSocket: class { constructor() { this.readyState = 1; } send() {} close() {} },
  URLSearchParams: URLSearchParams,
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  setInterval: () => 1,
  clearInterval: () => {},
  clearTimeout: () => {},
  AudioContext: class {
    constructor() { this.state = 'running'; }
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
  },
  webkitAudioContext: class {},
  alert: () => {}
};
sandbox.window.document = mockDocument;

vm.createContext(sandbox);

const exportHooks = `
;__test_exports__ = {
  taskDatabase,
  appState,
  renderParentCatalogList,
  parentFilterGrade,
  parentFilterCatalog,
  renderChildIslandRoadmap,
  renderChildWorkspaceStep,
  startChildQuest,
  completeChildStep
};
`;

vm.runInContext(appScript + exportHooks, sandbox);
const exp = sandbox.__test_exports__;

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// ============================================================================
// SUITE 1: Parent Task Catalog Checkbox Truncation & Card Layout (R1.1)
// ============================================================================
console.log("--- SUITE 1: Parent Task Catalog Checkbox Truncation & Card Layout (R1.1) ---");

runTest("1.1: renderParentCatalogList renders cards with overflow-hidden to prevent 370px blowout", () => {
  const container = getOrCreateElement('catalog-tasks-list');
  container.children = [];
  exp.renderParentCatalogList();

  assert(container.children.length > 0, "Catalog container must have rendered task cards");
  
  container.children.forEach((card, idx) => {
    assert(card.className.includes('overflow-hidden'), `Card ${idx} missing 'overflow-hidden': ${card.className}`);
    assert(card.className.includes('flex'), `Card ${idx} missing 'flex': ${card.className}`);
    assert(card.className.includes('items-center'), `Card ${idx} missing 'items-center': ${card.className}`);
    assert(card.className.includes('justify-between'), `Card ${idx} missing 'justify-between': ${card.className}`);
  });
});

runTest("1.2: Checkbox element has shrink-0 ml-2 to guarantee zero clipping on narrow phone screens", () => {
  const container = getOrCreateElement('catalog-tasks-list');
  container.children = [];
  exp.renderParentCatalogList();

  container.children.forEach((card, idx) => {
    const html = card.innerHTML;
    assert(html.includes('shrink-0 ml-2'), `Card ${idx} checkbox missing 'shrink-0 ml-2': ${html}`);
    assert(html.includes('type="checkbox"'), `Card ${idx} missing checkbox element`);
  });
});

runTest("1.3: Text container has min-w-0 flex-1 and badge rows have flex-wrap gap-1", () => {
  const container = getOrCreateElement('catalog-tasks-list');
  container.children = [];
  exp.renderParentCatalogList();

  container.children.forEach((card, idx) => {
    const html = card.innerHTML;
    assert(html.includes('min-w-0 flex-1') || html.includes('flex-1 min-w-0'), `Card ${idx} missing 'min-w-0 flex-1': ${html}`);
    assert(html.includes('flex-wrap'), `Card ${idx} missing 'flex-wrap' in badge rows: ${html}`);
    assert(html.includes('gap-1'), `Card ${idx} missing 'gap-1' in badge rows: ${html}`);
  });
});

// ============================================================================
// SUITE 2: Viewport Scrolling & Sticky Batch Action Button (R1.2)
// ============================================================================
console.log("\n--- SUITE 2: Viewport Scrolling & Sticky Batch Action Button (R1.2) ---");

runTest("2.1: #catalog-tasks-list has no max-h-[380px] or overflow-y-auto (eliminates nested scroll trapping)", () => {
  assert(!html.includes('id="catalog-tasks-list" class="space-y-2 max-h-[380px] overflow-y-auto'), 
    "catalog-tasks-list must not trap mousewheel with max-h-[380px] overflow-y-auto");
  assert(html.includes('id="catalog-tasks-list" class="space-y-2 pr-0.5"'), 
    "catalog-tasks-list must allow smooth outer container scrolling");
});

runTest("2.2: Batch action card has sticky bottom-0, backdrop-blur-md, border-2 border-teal-500, shadow-xl, z-20", () => {
  const requiredClasses = [
    "sticky bottom-0",
    "bg-white/95",
    "backdrop-blur-md",
    "border-2 border-teal-500",
    "rounded-2xl",
    "p-3",
    "shadow-xl",
    "z-20",
    "space-y-2"
  ];
  requiredClasses.forEach(cls => {
    assert(html.includes(cls), `HTML missing sticky batch action card class '${cls}'`);
  });
  assert(html.includes("GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!"), "Sticky batch dispatch button must be present");
});

// ============================================================================
// SUITE 3: WCAG AA Color Contrast Compliance (R1.3)
// ============================================================================
console.log("\n--- SUITE 3: WCAG AA Color Contrast Compliance (R1.3) ---");

runTest("3.1: .btn-disabled has color: #475569 !important (contrast ratio >= 4.5:1 on #E2E8F0)", () => {
  const styleMatch = html.match(/\.btn-disabled\s*\{([\s\S]*?)\}/);
  assert(styleMatch, ".btn-disabled definition missing from style tag");
  const rule = styleMatch[1];
  assert(rule.includes('#475569'), `.btn-disabled must use #475569 for WCAG AA compliance, found: ${rule}`);
  assert(!rule.includes('#94A3B8'), ".btn-disabled must NOT use #94A3B8 (violates 4.5:1)");
});

runTest("3.2: Inactive filter chips use text-slate-700 (#334155, contrast 7.5:1)", () => {
  assert(html.includes("p-cat-math") && html.includes("text-slate-700"), 
    "Inactive catalog category filters must have text-slate-700");
  
  // Test JS parentFilterCatalog toggling inactive button classes
  ['math', 'viet', 'eng', 'chore'].forEach(cat => {
    const btn = getOrCreateElement(`p-cat-${cat}`);
    btn.className = "";
  });
  exp.parentFilterCatalog('all');
  ['math', 'viet', 'eng', 'chore'].forEach(cat => {
    const btn = getOrCreateElement(`p-cat-${cat}`);
    assert(btn.className.includes('text-slate-700'), `Inactive cat ${cat} button missing text-slate-700`);
  });
});

runTest("3.3: Inactive grade chips use text-slate-800 (#1E293B, contrast 10.5:1)", () => {
  [1, 2, 3, 4, 5].forEach(g => {
    assert(html.includes(`id="p-grade-${g}" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800`), 
      `HTML grade ${g} button missing text-slate-800`);
  });

  // Test JS parentFilterGrade toggling inactive button classes
  exp.parentFilterGrade(1);
  [2, 3, 4, 5].forEach(g => {
    const btn = getOrCreateElement(`p-grade-${g}`);
    assert(btn.className.includes('text-slate-800'), `Inactive grade ${g} button missing text-slate-800: ${btn.className}`);
  });
});

runTest("3.4: Clue distractor button has text-slate-700 font-bold and NO opacity-50", () => {
  const stage = getOrCreateElement('child-interactive-stage');
  exp.appState.activeTask = {
    id: 'test_clues',
    cat: 'math',
    steps: [{ type: 'math_clues', step_id: 1, text: 'Tìm dữ kiện' }]
  };
  exp.renderChildWorkspaceStep(0);
  assert(stage.innerHTML.includes('text-slate-700 font-bold'), 
    `Math clue distractor button must use text-slate-700 font-bold, got: ${stage.innerHTML}`);
  assert(!stage.innerHTML.includes('opacity-50'), 
    "Math clue distractor button must NOT have opacity-50");
});

runTest("3.5: Context problem clue has text-slate-600 font-semibold and NO opacity-60", () => {
  const stage = getOrCreateElement('child-interactive-stage');
  exp.appState.activeTask = {
    id: 'test_clues',
    cat: 'math',
    steps: [{ type: 'math_clues', step_id: 1, text: 'Tìm dữ kiện' }]
  };
  exp.renderChildWorkspaceStep(0);
  assert(stage.innerHTML.includes('text-slate-600 font-semibold'), 
    `Context problem clue must use text-slate-600 font-semibold, got: ${stage.innerHTML}`);
  assert(!stage.innerHTML.includes('opacity-60'), 
    "Context problem clue must NOT have opacity-60");
});

runTest("3.6: Input placeholders have placeholder:text-slate-600 and ::placeholder in style tag", () => {
  assert(html.includes('::placeholder'), "<style> must contain ::placeholder rule");
  assert(html.includes('color: #475569 !important;'), "::placeholder must enforce color: #475569");

  const expectedInputs = [
    'custom-child-ticket-input',
    'ai-task-input',
    'new-reward-title',
    'coach-user-input',
    'child-stage-text-input',
    'manual-step-input'
  ];
  expectedInputs.forEach(inputId => {
    assert(html.includes(inputId) && html.includes('placeholder:text-slate-600'), 
      `Input ${inputId} or template must include placeholder:text-slate-600`);
  });
});

// ============================================================================
// SUITE 4: Distinct Visual Identity for Routines vs Study Tasks (R5)
// ============================================================================
console.log("\n--- SUITE 4: Distinct Visual Identity for Routines vs Study Tasks (R5) ---");

runTest("4.1: .btn-3d-amber style is defined in <style> with warm amber colors", () => {
  assert(html.includes('.btn-3d-amber {'), ".btn-3d-amber must be defined in <style>");
  assert(html.includes('background-color: #f59e0b;'), ".btn-3d-amber must have background-color #f59e0b");
  assert(html.includes('border-bottom: 4px solid #b45309;'), ".btn-3d-amber must have border-bottom 4px solid #b45309");
});

runTest("4.2: Chore tasks (task.cat === 'chore') apply warm calming amber theme to Roadmap", () => {
  exp.appState.childRoadmap = [
    {
      id: 'chore_desk',
      cat: 'chore',
      title: 'Dọn bàn học tinh tươm',
      icon: '🧹',
      reward: 120,
      steps: [{ step_id: 1, type: 'chore_pens', badge: 'Xếp bút', text: 'Cất bút', duration_sec: 60 }]
    }
  ];
  exp.appState.currentRoadmapIndex = 0;
  exp.renderChildIslandRoadmap();

  const islandTag = getOrCreateElement('child-island-tag');
  assert.strictEqual(islandTag.innerText, "ĐẢO SINH HOẠT THƯ THÁI 🌿");
  assert(islandTag.className.includes('bg-amber-100 text-amber-800 border-amber-300'), 
    `Chore island tag missing amber classes: ${islandTag.className}`);

  const currentBadge = getOrCreateElement('child-current-badge');
  assert(currentBadge.className.includes('bg-amber-100 text-amber-900 border-amber-300 ring-amber-200'), 
    `Chore roadmap node badge missing amber classes: ${currentBadge.className}`);

  const islandBtn = getOrCreateElement('child-island-btn');
  assert(islandBtn.className.includes('btn-3d-amber'), `Chore island button missing btn-3d-amber: ${islandBtn.className}`);

  const startQuestBtn = getOrCreateElement('child-btn-start-quest');
  assert(startQuestBtn.className.includes('btn-3d-amber'), `Chore start quest CTA missing btn-3d-amber: ${startQuestBtn.className}`);
});

runTest("4.3: Chore tasks (task.cat === 'chore') apply warm calming amber theme to Focus Workspace", () => {
  exp.appState.activeTask = {
    id: 'chore_desk',
    cat: 'chore',
    title: 'Dọn bàn học tinh tươm',
    icon: '🧹',
    reward: 120,
    steps: [{ step_id: 1, type: 'chore_pens', badge: 'Xếp bút', text: 'Cất bút', duration_sec: 60 }]
  };
  exp.renderChildWorkspaceStep(0);

  const focusCard = getOrCreateElement('child-focus-card');
  assert(focusCard.className.includes('bg-[#FFFDF5] border-2 border-amber-300 ring-4 ring-amber-100/50'), 
    `Focus card missing warm calming amber classes: ${focusCard.className}`);

  const workspace = getOrCreateElement('child-screen-workspace');
  assert(workspace.classList.contains('bg-[#FFFDF5]'), "Workspace container missing bg-[#FFFDF5]");

  const btnNext = getOrCreateElement('child-btn-next-step');
  assert(btnNext.classList.contains('btn-3d-amber'), "Next button must have btn-3d-amber for chores");
  assert(!btnNext.classList.contains('btn-3d-green'), "Next button must NOT have btn-3d-green for chores");

  const wsIslandTag = getOrCreateElement('child-workspace-island-tag');
  assert.strictEqual(wsIslandTag.innerText, "ĐẢO SINH HOẠT THƯ THÁI 🌿");
  assert(wsIslandTag.className.includes('bg-amber-100 text-amber-800 border-amber-300'), 
    `Workspace island tag missing amber classes: ${wsIslandTag.className}`);
});

runTest("4.4: Study tasks (task.cat !== 'chore') apply cool focus teal theme to Roadmap", () => {
  exp.appState.childRoadmap = [
    {
      id: 'G1_MATH_01',
      cat: 'math',
      title: 'Cộng số chim trên cành',
      icon: '🐦',
      reward: 120,
      steps: [{ step_id: 1, type: 'highlight', badge: 'Tìm Dữ Kiện', text: 'Gạch chân', duration_sec: 60 }]
    }
  ];
  exp.appState.currentRoadmapIndex = 0;
  exp.renderChildIslandRoadmap();

  const islandTag = getOrCreateElement('child-island-tag');
  assert.strictEqual(islandTag.innerText, "ĐẢO BÀI TẬP TẬP TRUNG 🎯");
  assert(islandTag.className.includes('bg-teal-100 text-teal-800 border-teal-300'), 
    `Study island tag missing teal classes: ${islandTag.className}`);

  const currentBadge = getOrCreateElement('child-current-badge');
  assert(currentBadge.className.includes('bg-teal-100 text-teal-900 border-teal-300 ring-teal-200'), 
    `Study roadmap node badge missing teal classes: ${currentBadge.className}`);

  const islandBtn = getOrCreateElement('child-island-btn');
  assert(islandBtn.className.includes('btn-3d-green'), `Study island button missing btn-3d-green: ${islandBtn.className}`);

  const startQuestBtn = getOrCreateElement('child-btn-start-quest');
  assert(startQuestBtn.className.includes('btn-3d-green'), `Study start quest CTA missing btn-3d-green: ${startQuestBtn.className}`);
});

runTest("4.5: Study tasks (task.cat !== 'chore') apply cool focus teal theme to Focus Workspace", () => {
  exp.appState.activeTask = {
    id: 'G1_MATH_01',
    cat: 'math',
    title: 'Cộng số chim trên cành',
    icon: '🐦',
    reward: 120,
    steps: [{ step_id: 1, type: 'highlight', badge: 'Tìm Dữ Kiện', text: 'Gạch chân', duration_sec: 60 }]
  };
  exp.renderChildWorkspaceStep(0);

  const focusCard = getOrCreateElement('child-focus-card');
  assert(focusCard.className.includes('bg-[#F0FDFA] border-2 border-teal-200 ring-4 ring-emerald-100'), 
    `Focus card missing cool focus teal classes: ${focusCard.className}`);

  const workspace = getOrCreateElement('child-screen-workspace');
  assert(workspace.classList.contains('bg-[#F0FDFA]'), "Workspace container missing bg-[#F0FDFA]");

  const btnNext = getOrCreateElement('child-btn-next-step');
  assert(btnNext.classList.contains('btn-3d-green'), "Next button must have btn-3d-green for study tasks");
  assert(!btnNext.classList.contains('btn-3d-amber'), "Next button must NOT have btn-3d-amber for study tasks");

  const wsIslandTag = getOrCreateElement('child-workspace-island-tag');
  assert.strictEqual(wsIslandTag.innerText, "ĐẢO BÀI TẬP TẬP TRUNG 🎯");
  assert(wsIslandTag.className.includes('bg-teal-100 text-teal-800 border-teal-300'), 
    `Workspace island tag missing teal classes: ${wsIslandTag.className}`);
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n======================================================================");
console.log(`TOTAL M4 ADVERSARIAL TESTS: ${totalTests}`);
console.log(`PASSED:                     ${passedTests}`);
console.log(`FAILED:                     ${totalTests - passedTests}`);
console.log("======================================================================");

if (totalTests === passedTests) {
  console.log("ALL M4 ERGONOMICS, CONTRAST & THEME ADVERSARIAL TESTS PASSED CLEANLY!\n");
  process.exit(0);
} else {
  console.error("SOME M4 ADVERSARIAL TESTS FAILED!\n");
  process.exit(1);
}