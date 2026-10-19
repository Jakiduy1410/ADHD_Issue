## 2026-10-18T17:07:53Z
You are Worker M4 (worker_m4_orch3) for Milestone M4: UI Ergonomics, Accessibility & Visual Themes (Requirements R1 & R5).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m4_orch3

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Pay special attention to section ## 2026-10-18T16:12:18Z, Requirements R1 & R5 and acceptance criteria.
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\orchestrator_3\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK ASSIGNMENT:
Implement Requirements R1 and R5 in `index.html`:
1. Parent Task Catalog Checkbox Truncation (R1.1):
   - In `renderParentCatalogList`:
     * Make the text container `min-w-0 flex-1` so titles and descriptions wrap smoothly without overflowing.
     * Make the checkbox element `shrink-0 ml-2` so it never gets clipped, shifted off-screen, or truncated on narrow 370px inner phone mockup widths.
     * Ensure inner badge rows use `flex-wrap gap-1`.
     * Card container has `overflow-hidden` to prevent horizontal scrolling or clipping.
2. Viewport Scrolling & Sticky Batch Action Button (R1.2):
   - Fix viewport scrolling in dual-channel mode:
     * In `#catalog-tasks-list`: eliminate nested mousewheel scroll trapping (e.g. remove or adjust `max-h-[380px] overflow-y-auto` so the outer scroll container handles clean vertical scrolling).
     * Make the batch dispatch card / button ("GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!") sticky at the bottom of the parent catalog view:
       `class="sticky bottom-0 bg-white/95 backdrop-blur-md border-2 border-teal-500 rounded-2xl p-3 shadow-xl z-20 space-y-2"`
       so it is persistently visible, accessible, and clickable regardless of how many catalog tasks are loaded.
3. WCAG AA Color Contrast Compliance (R1.3):
   - Ensure all normal text achieves >= 4.5:1 contrast:
     * `.btn-disabled` (in `<style>`): update color from `#94A3B8` (slate-400) to `#475569` (slate-600) on `#E2E8F0` (contrast ratio 6.0:1, PASS).
     * Inactive filter chips: update text color from `#64748B` to `#334155` (slate-700) on `#F1F5F9` (contrast ratio 7.5:1, PASS).
     * Inactive grade chips: update text color to `#1E293B` on `#F1F5F9` (contrast ratio 10.5:1, PASS).
     * Clue distractor text (`renderChildWorkspaceStep`): remove `opacity-50`, use `text-slate-700 font-bold` (contrast ratio 8.5:1, PASS).
     * Context problem clue: remove `opacity-60`, use `text-slate-600 font-semibold` (contrast ratio 5.8:1, PASS).
     * Input placeholders: add `placeholder:text-slate-600` (contrast ratio 5.8:1, PASS).
4. Distinct Visual Identity for Routines vs Study Tasks (R5):
   - Distinguish "Đảo sinh hoạt" (routines/chores, `task.cat === 'chore'`) from "Đảo bài tập" (academic GDPT, math/viet/eng) on both the Island Quest roadmap and focus card styling:
     * Add `.btn-3d-amber` to `<style>`:
       `.btn-3d-amber { background-color: #f59e0b; border-bottom: 4px solid #b45309; color: white; border-radius: 1rem; font-weight: 800; transition: all 0.1s ease; }`
       `.btn-3d-amber:hover { background-color: #fbbf24; }`
       `.btn-3d-amber:active { transform: translateY(2px); border-bottom-width: 2px; }`
     * When `task.cat === 'chore'`:
       - Focus card / Cockpit: apply warm calming theme (`bg-[#FFFDF5] border-amber-300 ring-amber-100/50`).
       - Primary action button: `.btn-3d-amber`.
       - Roadmap Node: warm amber badge (`bg-amber-100 text-amber-900 border-amber-300 ring-amber-200`).
       - Island Tag: "ĐẢO SINH HOẠT THƯ THÁI 🌿" (`bg-amber-100 text-amber-800 border-amber-300`).
     * When `task.cat !== 'chore'` (study tasks):
       - Focus card / Cockpit: apply cool focus theme (`bg-[#F0FDFA] border-teal-200 ring-emerald-100`).
       - Primary action button: `.btn-3d-green`.
       - Roadmap Node: cool teal badge (`bg-teal-100 text-teal-900 border-teal-300 ring-teal-200`).
       - Island Tag: "ĐẢO BÀI TẬP TẬP TRUNG 🎯" (`bg-teal-100 text-teal-800 border-teal-300`).
5. Verification:
   - Execute `python tests/runner.py` to confirm 330/330 tests pass with 0 regressions.
   - Run all Node.js adversarial tests (all suites green).
   - Write a new regression test `tests/adversarial/test_m4_ergonomics_contrast_themes.js` verifying checkbox layout, sticky batch action, WCAG AA contrast rules, and routine vs study theme classes.

OUTPUT REQUIREMENTS:
- Write your detailed work report to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m4_orch3\report.md`.
- Write your 5-component handoff to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\worker_m4_orch3\handoff.md`.
- When finished, use `send_message` to report back to orchestrator_3 (Recipient: 82075e96-ee88-4405-8b7e-45a7eaed25fe).
