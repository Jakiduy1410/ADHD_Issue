# Fix Report: Catalog Selection State Hydration (Issue 3)

**Author:** explorer_m1_fix_3 (Catalog Selection Hydration Fix Explorer)  
**Date:** 2026-10-18T06:36:00Z  
**Milestone:** Milestone 1 Iteration 2 (Issue 3)  
**Target Files:** `generate_app.py`, `index.html`, `out_index.html`  
**Test Suite:** `tests/adversarial/test_milo_sync_adversarial.js` (Assertion 2.4)

---

## 1. Executive Summary

In Milestone 1, `MiloSyncBus.savePersistedState()` explicitly serialized `selectedCatalogIds` into `localStorage` as an array (`['chore_desk', 'G1_MATH_01', ...]`). However, during `DOMContentLoaded` state restoration, the hydration block omitted `appState.selectedCatalogIds`. Consequently, whenever the browser reloaded or restored a session, parent catalog checkmarks silently reverted to the hardcoded default set (`['chore_desk', 'G1_MATH_01']`), erasing the parent's custom task selections and causing test assertion 2.4 in `test_milo_sync_adversarial.js` to fail.

This report provides the exact root cause, architectural trace, defensive hydration implementation, and verified test results ensuring that `appState.selectedCatalogIds`, DOM checkbox inputs, card highlight classes, batch summary badges, and task dispatch all seamlessly maintain state across page reloads.

---

## 2. Root Cause Analysis

### 2.1 Serialization Present, Hydration Omitted
1. In `generate_app.py` line 1881 (inside `savePersistedState(stateSnapshot)`):
   ```javascript
   selectedCatalogIds: Array.from(stateSnapshot.selectedCatalogIds || [])
   ```
   The `selectedCatalogIds` `Set` is properly converted to a JSON Array and saved to both `milo_quest_saved_state` and `milo_sync_state_v1`.

2. In `generate_app.py` lines 7728–7759 (inside `window.addEventListener('DOMContentLoaded', ...)`):
   State properties are restored from `saved`:
   - `saved.stars` -> `appState.stars`
   - `saved.childRoadmap` -> `appState.childRoadmap`
   - `saved.currentRoadmapIndex` -> `appState.currentRoadmapIndex`
   - `saved.currentStepIndex` -> `appState.currentStepIndex`
   - `saved.pauseCount` -> `appState.pauseCount`
   - `saved.totalSessionSeconds` -> `appState.totalSessionSeconds`
   - `saved.pendingTicket` -> `appState.pendingTicket`
   - **`saved.selectedCatalogIds` was omitted entirely!**

3. Default initialization in `appState` (line 6019):
   ```javascript
   selectedCatalogIds: new Set(['chore_desk', 'G1_MATH_01']),
   ```
   Because `saved.selectedCatalogIds` was never restored into `appState.selectedCatalogIds`, `appState.selectedCatalogIds` remained the hardcoded 2 default tasks.

### 2.2 Lack of Immediate Persistence on Interaction
In `toggleCatalogItem(id, isChecked)` (lines 7209–7217) and `selectAllCatalog(selectAll)` (lines 7233–7245), the user modifies `appState.selectedCatalogIds`, and `renderParentCatalogList()` is called, but `savePersistedState()` was not invoked. State was only saved when `TASK_ASSIGN_BATCH` or step events fired. Adding `if (window.miloBus) window.miloBus.savePersistedState(appState);` to these handlers guarantees immediate write-through persistence whenever a checkbox is clicked.

---

## 3. UI Reflection & Downstream Verification

Immediately following state hydration in `DOMContentLoaded` (line 7770), the application invokes:
```javascript
renderParentCatalogList();
```
*(Note: Some external specifications reference `renderCatalogTaskCards()`; in the actual codebase, `renderParentCatalogList()` performs this exact card and checkbox rendering).*

### 3.1 Trace of UI Elements Updated
When `renderParentCatalogList()` runs with the hydrated `appState.selectedCatalogIds`:

1. **Card Border & Background Highlight** (line 7161):
   ```javascript
   const isChecked = appState.selectedCatalogIds.has(t.id);
   card.className = `... ${isChecked ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200'}`;
   ```
   Any restored task ID receives active teal borders and subtle background highlight.

2. **Checkbox Input `checked` Attribute** (line 7185):
   ```javascript
   <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCatalogItem('${t.id}', this.checked)" class="w-5 h-5 accent-teal-600 cursor-pointer shrink-0" />
   ```
   When `isChecked` is `true`, the HTML string injects the `checked` attribute, checking the native checkbox input.

3. **Batch Summary Badges** (lines 7247–7262):
   `renderParentCatalogList()` calls `updateBatchSummaryUI()`, which executes:
   ```javascript
   const selected = Array.from(appState.selectedCatalogIds).map(id => taskDatabase[id]).filter(Boolean);
   const count = selected.length;
   let totalSteps = 0, totalStars = 0, totalMinutes = 0;
   selected.forEach(t => {
     totalSteps += t.steps.length;
     totalStars += t.reward;
     totalMinutes += Math.round((t.steps.length * t.stepSeconds) / 60);
   });
   document.getElementById('batch-selected-count').innerText = count;
   document.getElementById('batch-selected-meta').innerText = `${totalSteps} bước • ~${totalMinutes} phút • +${totalStars} ⭐`;
   ```
   This immediately overwrites the default hardcoded HTML (`2 bài tập`) with the hydrated count, steps, minutes, and stars.

4. **Batch Dispatch Payload** (lines 7265–7289):
   When the parent clicks "Giao ngay", `dispatchSelectedCatalogTasks()` reads `appState.selectedCatalogIds` to broadcast `TASK_ASSIGN_BATCH`, correctly dispatching all restored curriculum tasks to the child roadmap.

---

## 4. Exact Implementation Specification

### 4.1 Hydration in `DOMContentLoaded`
**File:** `generate_app.py`  
**Location:** After line 7748 (`appState.totalSessionSeconds = saved.totalSessionSeconds;`)

```javascript
<<<< PREVIOUS CODE
        if (saved.totalSessionSeconds !== undefined) {
          appState.totalSessionSeconds = saved.totalSessionSeconds;
        }
        if (saved.pendingTicket) {
==== PROPOSED FIX
        if (saved.totalSessionSeconds !== undefined) {
          appState.totalSessionSeconds = saved.totalSessionSeconds;
        }
        if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {
          const validIds = saved.selectedCatalogIds.filter(id => typeof id === 'string' && id.trim().length > 0);
          appState.selectedCatalogIds = new Set(validIds);
        }
        if (saved.pendingTicket) {
>>>>
```

### 4.2 Immediate Persistence on User Interaction
**File:** `generate_app.py`  
**Locations:** Lines 7209–7217 (`toggleCatalogItem`) and lines 7233–7245 (`selectAllCatalog`)

```javascript
<<<< PREVIOUS CODE
    function toggleCatalogItem(id, isChecked) {
      playSfx('tap');
      if (isChecked) {
        appState.selectedCatalogIds.add(id);
      } else {
        appState.selectedCatalogIds.delete(id);
      }
      renderParentCatalogList();
    }

    function selectAllCatalog(selectAll) {
      playSfx('tap');
      if (selectAll) {
        const taskMap = new Map();
        Object.values(taskDatabase).forEach(t => {
          if (t && t.id) taskMap.set(t.id, t);
        });
        taskMap.forEach(t => appState.selectedCatalogIds.add(t.id));
      } else {
        appState.selectedCatalogIds.clear();
      }
      renderParentCatalogList();
    }
==== PROPOSED FIX
    function toggleCatalogItem(id, isChecked) {
      playSfx('tap');
      if (isChecked) {
        appState.selectedCatalogIds.add(id);
      } else {
        appState.selectedCatalogIds.delete(id);
      }
      renderParentCatalogList();
      if (window.miloBus) window.miloBus.savePersistedState(appState);
    }

    function selectAllCatalog(selectAll) {
      playSfx('tap');
      if (selectAll) {
        const taskMap = new Map();
        Object.values(taskDatabase).forEach(t => {
          if (t && t.id) taskMap.set(t.id, t);
        });
        taskMap.forEach(t => appState.selectedCatalogIds.add(t.id));
      } else {
        appState.selectedCatalogIds.clear();
      }
      renderParentCatalogList();
      if (window.miloBus) window.miloBus.savePersistedState(appState);
    }
>>>>
```

### 4.3 Function Alias Support (Safety Guard)
**File:** `generate_app.py`  
**Location:** Right below `renderParentCatalogList()` definition (line 7192)

```javascript
const renderCatalogTaskCards = renderParentCatalogList;
```
Ensures backward and external compatibility if any test or component invokes `renderCatalogTaskCards()`.

---

## 5. Verification Results

### 5.1 Verification Script (`verify_fix.js`)
An independent sandbox test simulating `localStorage` state with 3 selected tasks (`['G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13']`) was executed:
```
Hydrated selectedCatalogIds: [ 'G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13' ]
Total cards rendered: 29
Checked cards count: 3
Checked card IDs: [ 'G1_MATH_01', 'G2_MATH_06', 'G3_VIET_13' ]
Batch count UI text: 3
Batch meta UI text: 10 bước • ~12 phút • +380 ⭐
>>> ALL HYDRATION AND RENDERING CHECKS PASSED SUCCESSFULLY! <<<
```

### 5.2 Adversarial Suite Verification (`test_suite2_verified.js`)
Execution of `tests/adversarial/test_milo_sync_adversarial.js` with the proposed hydration fix applied in-memory:
```
[SUITE 2] State Persistence & Hydration Across Simulated Reload
  ✓ 2.1: Dual-key atomic state persistence under primary and backup keys
  ✓ 2.2: Full state hydration on DOMContentLoaded restores all gameplay progress
  ✓ 2.3: Fallback hydration recovers state from backup key if primary key was wiped
  ✓ 2.4: selectedCatalogIds state hydration across reload
```
**Outcome:** Assertion 2.4 transitioned from `FAILED (false !== true)` to `PASSED (✓ 2.4)`. All 4 tests in Suite 2 achieved 100% pass rate.
