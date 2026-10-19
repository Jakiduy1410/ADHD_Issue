# Technical Fix Report: Issue 2 - Cheer Protocol Contract Normalization (`PARENT_CHEER_SEND`)

**Document ID:** FIX-REPORT-M1-ISSUE-02-CHEER-PROTOCOL  
**Author:** explorer_m1_fix_2 (Cheer Protocol Contract Fix Explorer)  
**Date:** 2026-10-18T06:37:00Z  
**Parent Agent:** `f373a3a8-9bab-4128-a177-2c52ad25b640`  
**Milestone:** Milestone 1 (Sync Bus & Curriculum Bank) — Iteration 2  
**Target Files:** `generate_app.py`, `index.html`, `out_index.html`, `src/api/server.py`  
**Status:** PROPOSED (Read-Only Investigation Completed & Verified in Sandbox)

---

## 1. Executive Summary

During Milestone 1 adversarial testing, challenger agent `challenger_m1_1` identified a contract mismatch and UI bug in the implementation of the `PARENT_CHEER_SEND` state event (`tests/adversarial/test_milo_sync_adversarial.js` assertion 5.9b):

1. **Protocol Specification vs UI Implementation Discrepancy**:
   - `PROJECT.md` line 61 explicitly specifies:
     ```markdown
     - `PARENT_CHEER_SEND`: `{ type: "PARENT_CHEER_SEND", payload: { message } }`
     ```
   - In `generate_app.py` lines 2034–2047 and `index.html` lines 2026–2039, the event listener strictly inspected `payload.cheerText`:
     ```javascript
     speechEl.innerText = `👩 Mẹ nhắn: "${payload.cheerText}" ❤️`;
     showToast("Lời Khen Của Mẹ", payload.cheerText, "❤️");
     ```
2. **Defect Impact**:
   - When an external actor, test suite (e.g. `test_milo_sync_adversarial.js:854`, `test_dual_app_e2e.py:347`), backend API, or another browser tab dispatches `{ message: "Mẹ luôn đồng hành cùng con!" }`, `payload.cheerText` evaluates to `undefined`.
   - The speech bubble displayed verbatim: `👩 Mẹ nhắn: "undefined" ❤️`.
   - The toast popup displayed: `"Lời Khen Của Mẹ", undefined, "❤️"`.
   - **Clinical / Pedagogical Severity**: For children with ADHD who experience Rejection Sensitive Dysphoria (RSD), seeing `"undefined"` in Robot Milo's speech bubble breaks immersion, induces confusion, and degrades the positive reinforcement mechanism.
3. **Proposed Resolution**:
   - Implement universal, bi-directional normalization in both the subscriber and publisher layers:
     ```javascript
     const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
     ```
   - Upgrade `parentSendCheer`, WebSocket outbound framing, and WebSocket inbound translation to emit and consume both `message` and `cheerText`, guaranteeing 100% interoperability across all past, present, and external contracts.

---

## 2. Root Cause & Touchpoint Analysis

A full code audit revealed **5 interrelated touchpoints** across the client and server where cheer payloads are produced or consumed:

| # | File | Line Range | Role | Current Behavior | Defect / Vulnerability |
|---|------|------------|------|------------------|------------------------|
| 1 | `generate_app.py` / `index.html` | 2034–2047 | Subscriber | Reads `payload.cheerText` only | Displays `"undefined"` when `{ message }` is provided |
| 2 | `generate_app.py` / `index.html` | 7600–7611 | UI Dispatcher (`parentSendCheer`) | Broadcasts `{ cheerText: text, sticker }` | Missing `message` field specified in `PROJECT.md` |
| 3 | `generate_app.py` / `index.html` | 1847–1854 | WebSocket Outbound (`broadcast`) | Sends `{ event_type: "PARENT_CHEER", cheer_text: payload.cheerText }` | If payload has only `message`, sends `undefined` to server |
| 4 | `generate_app.py` / `index.html` | 1776–1784 | WebSocket Inbound (`_handleWsMessage`) | Dispatches `{ cheerText: data.cheer_text }` | Missing `message` field for external listeners |
| 5 | `src/api/server.py` | 803–815 | FastAPI WebSocket Manager | Reads `data.get("cheer_text", ...)` | Does not read `data.get("message")` if parent sends `{ message }` |

---

## 3. Detailed Proposed Code Changes

### Touchpoint 1: `PARENT_CHEER_SEND` Event Subscriber
**Location:** `generate_app.py` (lines 2034–2047) & `index.html` (lines 2026–2039)

#### Before:
```javascript
      // 9. PARENT_CHEER_SEND: Parent sends cheer -> Milo animation & bubble on Child screen
      bus.subscribe('PARENT_CHEER_SEND', (payload) => {
        playSfx('bell');
        const speechEl = document.getElementById('child-milo-speech');
        if (speechEl) {
          speechEl.innerText = `👩 Mẹ nhắn: "${payload.cheerText}" ❤️`;
          if (speechEl.parentElement) {
            speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
            setTimeout(() => {
              if (speechEl.parentElement) speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
            }, 4000);
          }
        }
        showToast("Lời Khen Của Mẹ", payload.cheerText, "❤️");
      });
```

#### After (Proposed Fix):
```javascript
      // 9. PARENT_CHEER_SEND: Parent sends cheer -> Milo animation & bubble on Child screen
      bus.subscribe('PARENT_CHEER_SEND', (payload) => {
        playSfx('bell');
        const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
        const speechEl = document.getElementById('child-milo-speech');
        if (speechEl) {
          speechEl.innerText = `👩 Mẹ nhắn: "${cheerMsg}" ❤️`;
          if (speechEl.parentElement) {
            speechEl.parentElement.classList.add('scale-105', 'ring-2', 'ring-amber-300');
            setTimeout(() => {
              if (speechEl.parentElement) speechEl.parentElement.classList.remove('scale-105', 'ring-2', 'ring-amber-300');
            }, 4000);
          }
        }
        showToast("Lời Khen Của Mẹ", cheerMsg, "❤️");
      });
```

**Rationale:**
- Accepts `payload.cheerText` (legacy UI).
- Accepts `payload.message` (`PROJECT.md:61` contract).
- Accepts `payload` if passed as a raw string (e.g. `bus.broadcast('PARENT_CHEER_SEND', 'Cố lên!')`).
- Safely defaults to `"Mẹ rất tự hào về con!"` if payload is `{}` or `null`, eliminating any possibility of displaying `"undefined"`.

---

### Touchpoint 2: Parent UI Cheer Dispatcher (`parentSendCheer`)
**Location:** `generate_app.py` (lines 7600–7611) & `index.html` (lines 7592–7603)

#### Before:
```javascript
    function parentSendCheer(customText) {
      playSfx('tap');
      const scriptEl = document.getElementById('parent-praise-script');
      const text = customText || (scriptEl ? scriptEl.innerText : "") || "Mẹ rất tự hào về sự kiên trì của con!";
      if (window.miloBus) {
        window.miloBus.broadcast('PARENT_CHEER_SEND', {
          cheerText: text,
          sticker: 'milo_thumbs_up'
        });
      }
      showToast("Đã Gửi Lời Khen", "Lời khen ngợi nỗ lực đã xuất hiện trên buồng lái của Leo! ❤️", "💌");
    }
```

#### After (Proposed Fix):
```javascript
    function parentSendCheer(customText) {
      playSfx('tap');
      const scriptEl = document.getElementById('parent-praise-script');
      const text = customText || (scriptEl ? scriptEl.innerText : "") || "Mẹ rất tự hào về sự kiên trì của con!";
      if (window.miloBus) {
        window.miloBus.broadcast('PARENT_CHEER_SEND', {
          cheerText: text,
          message: text,
          sticker: 'milo_thumbs_up'
        });
      }
      showToast("Đã Gửi Lời Khen", "Lời khen ngợi nỗ lực đã xuất hiện trên buồng lái của Leo! ❤️", "💌");
    }
```

**Rationale:**
- Outbound broadcast envelopes now carry both `message` and `cheerText`. Any subscriber relying strictly on `PROJECT.md` contracts receives `payload.message` directly without transformation.

---

### Touchpoint 3: WebSocket Outbound Message Builder (`MiloSyncBus.broadcast`)
**Location:** `generate_app.py` (lines 1847–1854) & `index.html` (lines 1839–1846)

#### Before:
```javascript
            } else if (eventType === "PARENT_CHEER_SEND" && this.role === 'parent') {
              this.ws.send(JSON.stringify({
                event_type: "PARENT_CHEER",
                cheer_text: payload.cheerText,
                sticker: payload.sticker || "milo_thumbs_up",
                payload: payload
              }));
```

#### After (Proposed Fix):
```javascript
            } else if (eventType === "PARENT_CHEER_SEND" && this.role === 'parent') {
              const cheerMsg = (typeof payload === 'string' ? payload : (payload && (payload.cheerText || payload.message))) || "Mẹ rất tự hào về con!";
              this.ws.send(JSON.stringify({
                event_type: "PARENT_CHEER",
                cheer_text: cheerMsg,
                message: cheerMsg,
                sticker: (payload && payload.sticker) || "milo_thumbs_up",
                payload: payload
              }));
```

**Rationale:**
- Ensures that when a parent tab sends `PARENT_CHEER_SEND` with `{ message: "..." }` across WebSocket Layer 3, `cheer_text` is non-null and correctly populated.

---

### Touchpoint 4: WebSocket Inbound Message Handler (`MiloSyncBus._handleWsMessage`)
**Location:** `generate_app.py` (lines 1776–1784) & `index.html` (lines 1768–1776)

#### Before:
```javascript
        // Server translated event: Parent cheer -> Kid receive cheer
        if (data.event_type === "KID_RECEIVE_CHEER") {
          this._dispatchLocal("PARENT_CHEER_SEND", {
            cheerText: data.cheer_text,
            sticker: data.sticker
          }, data);
          return;
        }
```

#### After (Proposed Fix):
```javascript
        // Server translated event: Parent cheer -> Kid receive cheer
        if (data.event_type === "KID_RECEIVE_CHEER") {
          const cheerMsg = data.cheer_text || data.message || "Bố mẹ rất tự hào về sự kiên trì của con!";
          this._dispatchLocal("PARENT_CHEER_SEND", {
            cheerText: cheerMsg,
            message: cheerMsg,
            sticker: data.sticker || "milo_thumbs_up"
          }, data);
          return;
        }
```

**Rationale:**
- Guarantees that kid client receiving server WebSocket event `KID_RECEIVE_CHEER` unpacks both `cheerText` and `message` into the local `PARENT_CHEER_SEND` dispatch.

---

### Touchpoint 5: FastAPI Backend Server Event Normalization
**Location:** `src/api/server.py` (lines 803–814)

#### Before:
```python
            # 3. Parent sends encouragement sticker/cheer -> Notify Kid
            elif event_type == "PARENT_CHEER":
                cheer_text = data.get("cheer_text", "Bố mẹ rất tự hào về sự kiên trì của con!")
                sticker = data.get("sticker", "milo_thumbs_up")
                forward_event = {
                    "event_type": "KID_RECEIVE_CHEER",
                    "timestamp": time.time(),
                    "sender": cid,
                    "cheer_text": cheer_text,
                    "sticker": sticker,
                    "milo_audio": "harp_glissando_soft",
                }
                await manager.send_to_role(room_id, target_role="kid", message=forward_event)
```

#### After (Proposed Fix):
```python
            # 3. Parent sends encouragement sticker/cheer -> Notify Kid
            elif event_type == "PARENT_CHEER":
                cheer_text = data.get("cheer_text") or data.get("message") or "Bố mẹ rất tự hào về sự kiên trì của con!"
                sticker = data.get("sticker", "milo_thumbs_up")
                forward_event = {
                    "event_type": "KID_RECEIVE_CHEER",
                    "timestamp": time.time(),
                    "sender": cid,
                    "cheer_text": cheer_text,
                    "message": cheer_text,
                    "sticker": sticker,
                    "milo_audio": "harp_glissando_soft",
                }
                await manager.send_to_role(room_id, target_role="kid", message=forward_event)
```

---

## 4. Edge Case Matrix & Resilience Verification

| Input Payload Scenario | Evaluated `cheerMsg` | Rendered `speechEl.innerText` | Toast Output | Result |
|------------------------|----------------------|-------------------------------|--------------|--------|
| `{ cheerText: "Bé làm giỏi lắm!" }` | `"Bé làm giỏi lắm!"` | `👩 Mẹ nhắn: "Bé làm giỏi lắm!" ❤️` | `"Bé làm giỏi lắm!"` | PASS (Legacy UI compatibility) |
| `{ message: "Mẹ luôn đồng hành cùng con!" }` | `"Mẹ luôn đồng hành cùng con!"` | `👩 Mẹ nhắn: "Mẹ luôn đồng hành cùng con!" ❤️` | `"Mẹ luôn đồng hành cùng con!"` | PASS (PROJECT.md contract compliance) |
| `{ cheerText: "Nhanh lên", message: "Con cố gắng nhé" }` | `"Nhanh lên"` | `👩 Mẹ nhắn: "Nhanh lên" ❤️` | `"Nhanh lên"` | PASS (cheerText precedence preserved) |
| `{}` (Empty payload) | `"Mẹ rất tự hào về con!"` | `👩 Mẹ nhắn: "Mẹ rất tự hào về con!" ❤️` | `"Mẹ rất tự hào về con!"` | PASS (Graceful fallback, no `"undefined"`) |
| `"Thương con!"` (Primitive String) | `"Thương con!"` | `👩 Mẹ nhắn: "Thương con!" ❤️` | `"Thương con!"` | PASS (Primitive resilience) |
| `null` / `undefined` | `"Mẹ rất tự hào về con!"` | `👩 Mẹ nhắn: "Mẹ rất tự hào về con!" ❤️` | `"Mẹ rất tự hào về con!"` | PASS (No unhandled TypeError) |

---

## 5. Implementation Roadmap for Worker

1. Edit `generate_app.py`:
   - Apply Touchpoint 1 (lines ~2034–2047)
   - Apply Touchpoint 2 (lines ~7600–7611)
   - Apply Touchpoint 3 (lines ~1847–1854)
   - Apply Touchpoint 4 (lines ~1776–1784)
2. Run `python generate_app.py` to regenerate `index.html` and `out_index.html`.
3. Optionally edit `src/api/server.py` lines 803–814 for Touchpoint 5.
4. Verify by running `node tests/adversarial/test_milo_sync_adversarial.js`:
   - Assertion 5.9b will transition from `FAILED` (`Error: Speech bubble displayed 'undefined'`) to `PASSED`.

---

## 6. Verification Method

To independently verify this fix design:
```bash
node .agents/teamwork/explorer_m1_fix_2/test_cheer_fix.js
```
Expected output:
```text
✓ Test 5.9 Passed: 👩 Mẹ nhắn: "Con trai yêu làm rất tốt!" ❤️
✓ Test 5.9b Passed: 👩 Mẹ nhắn: "Mẹ luôn đồng hành cùng con!" ❤️
✓ Edge Case 1 ({}) Passed: 👩 Mẹ nhắn: "Mẹ rất tự hào về con!" ❤️
✓ Edge Case 2 (string) Passed: 👩 Mẹ nhắn: "Cố lên con trai yêu!" ❤️
✓ Edge Case 3 (both) Passed: 👩 Mẹ nhắn: "Khen cụ thể" ❤️

================================================================
  ALL CHEER PROTOCOL ASSERTIONS PASSED WITH ZERO "undefined"
================================================================
```
