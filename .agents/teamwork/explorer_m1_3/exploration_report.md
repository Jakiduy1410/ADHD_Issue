# MILESTONE 1 EXPLORATION REPORT: 10-EVENT STATE PROTOCOL & VERIFICATION STRATEGY

**Document ID:** EXP-M1-STATE-PROTO-20261018  
**Author:** explorer_m1_3 (State Protocol & Verification Explorer)  
**Milestone:** M1 (Sync Bus & Curriculum Bank)  
**Target Repository:** `c:\Users\ADMIN\Documents\antigravity\calm-bardeen`  
**Date:** 2026-10-18  

---

## 1. Executive Summary

Milestone 1 establishes the foundational communication and content backbone for the dual-application ecosystem (**Milo Quest** child app × **Trạm Thấu Hiểu** parent app). To enable seamless, zero-friction operation across three execution modalities (single-window split view, multi-tab browser windows, and networked physical devices), the ecosystem requires:

1. **A Strictly Formulated 10-Event State Protocol**: Canonical Draft-07 JSON schemas, TypeScript interfaces, and bidirectional event contracts covering the full lifecycle of task assignment, telemetry, dopamine reinforcement, box breathing rescue, and Golden Ticket token economy.
2. **Tri-Layer Delivery Transport Agnosticism**: All 10 events must travel seamlessly across Layer 1 (In-Memory direct loopback, 0ms), Layer 2 (`BroadcastChannel` with `localStorage` storage-event fallback, <2ms), and Layer 3 (FastAPI WebSocket `/ws/sync`, 5–15ms) without altering payload contracts.
3. **Objective Verification Procedures**: Test protocols to verify cross-tab DOM updates, `localStorage` page-refresh persistence, and 100% catalog availability of all 25 GDPT 2018 benchmark tasks across Grades 1–5.
4. **Neurocognitive Safety Guardrails**: Hardened limits protecting elementary ADHD learners from Rejection Sensitive Dysphoria (RSD), cognitive overload, and delayed reinforcement (>300ms SLA).

---

## 2. Unified State Protocol Envelope (`MiloSyncEnvelope`)

Every event transmitted through `MiloSyncBus` wraps its specific payload in a standardized top-level envelope. This ensures uniform routing, origin filtering (avoiding self-echo), timestamp reconciliation, and transport agnosticism.

### 2.1 Envelope JSON Schema (Draft-07)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MiloSyncEnvelope",
  "description": "Standardized envelope for all Milo Quest dual-app synchronization events.",
  "type": "object",
  "required": [
    "event_type",
    "event_id",
    "room_id",
    "sender_role",
    "sender_id",
    "timestamp",
    "payload"
  ],
  "properties": {
    "event_type": {
      "type": "string",
      "enum": [
        "TASK_ASSIGN_BATCH",
        "STEP_TELEMETRY_UPDATE",
        "STEP_COMPLETED",
        "ISLAND_COMPLETED",
        "TREASURE_UNLOCKED",
        "TICKET_REDEEM_REQUEST",
        "TICKET_APPROVAL_RESPONSE",
        "MILO_RESCUE_TRIGGER",
        "PARENT_CHEER_SEND",
        "STARS_SYNC"
      ],
      "description": "Identifies the semantic contract and payload schema."
    },
    "event_id": {
      "type": "string",
      "pattern": "^(evt_)?[0-9a-fA-F-]{8,36}$",
      "description": "Globally unique event identifier for idempotency and de-duplication."
    },
    "room_id": {
      "type": "string",
      "minLength": 3,
      "maxLength": 64,
      "default": "family_room_milo_01",
      "description": "Family room synchronization channel."
    },
    "sender_role": {
      "type": "string",
      "enum": ["parent", "child", "system"],
      "description": "Role of the event emitter."
    },
    "sender_id": {
      "type": "string",
      "description": "Client device identifier or session token (e.g. 'parent_me_lan', 'kid_milo_01')."
    },
    "timestamp": {
      "type": "number",
      "description": "Unix epoch timestamp in milliseconds (e.g. 1729230500123)."
    },
    "payload": {
      "type": "object",
      "description": "Event-specific data payload matching the schema defined by event_type."
    }
  },
  "additionalProperties": false
}
```

### 2.2 TypeScript Interface Definitions

```typescript
export type MiloEventType =
  | 'TASK_ASSIGN_BATCH'
  | 'STEP_TELEMETRY_UPDATE'
  | 'STEP_COMPLETED'
  | 'ISLAND_COMPLETED'
  | 'TREASURE_UNLOCKED'
  | 'TICKET_REDEEM_REQUEST'
  | 'TICKET_APPROVAL_RESPONSE'
  | 'MILO_RESCUE_TRIGGER'
  | 'PARENT_CHEER_SEND'
  | 'STARS_SYNC';

export type MiloRole = 'parent' | 'child' | 'system';

export interface MiloSyncEnvelope<T = any> {
  event_type: MiloEventType;
  event_id: string;
  room_id: string;
  sender_role: MiloRole;
  sender_id: string;
  timestamp: number;
  payload: T;
}
```

---

## 3. The 10 Core Synchronization Event Contracts

### 3.1 Event 1: `TASK_ASSIGN_BATCH`

- **Direction**: `Parent Hub -> Child Quest`
- **Functional Purpose**: The parent selects a batch of tasks (from the 25 GDPT 2018 benchmark catalog, 4 routine tasks, or AI/manual custom tasks) and dispatches them in one click to the child's device.
- **Cognitive Rationale**: Children with ADHD struggle with fragmented, uncertain schedules. Generating a sequential adventure roadmap ("Lộ trình Đảo Nhiệm Vụ") transforms intimidating homework into a predictable, gamified journey.
- **Trigger**: Parent selects one or more tasks in the catalog (or generates via AI/Manual builder) and clicks `#btn-dispatch-catalog` ("Giao bài ngay").
- **State Mutations**:
  - `appState.childRoadmap = payload.tasks`
  - `appState.currentRoadmapIndex = 0`
  - `appState.activeTask = payload.tasks[0]`
  - `appState.currentStepIndex = 0`
  - `appState.selectedClues.clear(); appState.cleanedItems.clear(); appState.numpadValue = ""`
- **UI/UX Reactions**:
  - Child App: Calls `renderChildIslandRoadmap()`. Updates current island icon, title, reward pill (`child-current-reward`), and Robot Milo greeting speech bubble.
  - Sfx: Plays soft bell chime (`playSfx('bell')`).
  - Screen switch: If child is on completed screen or home, transitions smoothly to Island Roadmap or Workspace.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskAssignBatchPayload",
  "type": "object",
  "required": ["dispatch_id", "island_name", "tasks"],
  "properties": {
    "dispatch_id": { "type": "string" },
    "island_name": { "type": "string", "maxLength": 100 },
    "theme": { "type": "string", "default": "adventure" },
    "parent_note": { "type": "string", "maxLength": 200 },
    "tasks": {
      "type": "array",
      "minItems": 1,
      "maxItems": 10,
      "items": {
        "type": "object",
        "required": ["id", "title", "cat", "catName", "icon", "reward", "stepSeconds", "steps"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "cat": { "type": "string", "enum": ["math", "viet", "eng", "mcq", "chore", "routine", "ai_custom"] },
          "catName": { "type": "string" },
          "icon": { "type": "string" },
          "reward": { "type": "integer", "minimum": 10, "maximum": 500 },
          "stepSeconds": { "type": "integer", "minimum": 30, "maximum": 300 },
          "steps": {
            "type": "array",
            "minItems": 1,
            "maxItems": 6,
            "items": {
              "type": "object",
              "required": ["badge", "text", "type"],
              "properties": {
                "badge": { "type": "string" },
                "text": { "type": "string" },
                "type": { "type": "string" }
              }
            }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "TASK_ASSIGN_BATCH",
  "event_id": "evt_b1c2d3e4-0001",
  "room_id": "family_room_milo_01",
  "sender_role": "parent",
  "sender_id": "parent_me_lan",
  "timestamp": 1729230500123,
  "payload": {
    "dispatch_id": "DISPATCH_20261018_01",
    "island_name": "Đảo Khám Phá Tri Thức (Adventure Island)",
    "theme": "tropical_quest",
    "parent_note": "Mẹ chúc Leo vượt qua các đảo thật vui vẻ và kiên trì!",
    "tasks": [
      {
        "id": "G1_MATH_01",
        "title": "Phép cộng trong phạm vi 10 (Thêm chim đậu cành)",
        "cat": "math",
        "catName": "Toán GDPT 2018",
        "icon": "📐",
        "reward": 150,
        "stepSeconds": 90,
        "steps": [
          { "badge": "Thám tử Dữ kiện", "text": "Tìm số chim ban đầu (5) và chim bay đến (3)", "type": "math_clues" },
          { "badge": "Chọn Phép Tính", "text": "Chọn phép cộng 5 + 3", "type": "math_formula" },
          { "badge": "Numpad Về Đích", "text": "Nhập kết quả 8 con chim", "type": "math_numpad" }
        ]
      },
      {
        "id": "chore_desk",
        "title": "Dọn bàn học gọn gàng trong 5 phút",
        "cat": "chore",
        "catName": "Kỹ Năng Sinh Hoạt",
        "icon": "🧹",
        "reward": 120,
        "stepSeconds": 60,
        "steps": [
          { "badge": "Cắm bút vào ống", "text": "Chạm vào 3 cây bút bừa bộn", "type": "chore_pens" },
          { "badge": "Xếp sách vở", "text": "Chạm vào chồng sách xếp vào góc", "type": "chore_books" }
        ]
      }
    ]
  }
}
```

---

### 3.2 Event 2: `STEP_TELEMETRY_UPDATE`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Transmits a live heartbeat while the child is actively engaged in a micro-task step.
- **Cognitive Rationale**: Allows the parent to observe real-time focus duration and pause occurrences without hovering over the child, preserving the child's autonomy and preventing hyper-vigilant parent anxiety.
- **Trigger**: Dispatched periodically (every 5 seconds) during active step countdown, and immediately upon pause/resume.
- **State Mutations**:
  - Parent updates `appState.telemetry` cache for the active task.
- **UI/UX Reactions**:
  - Parent App: Updates `#telemetry-task-title`, advances the active progress bar segment (`renderParentTelemetryProgress`), updates timer display `#telemetry-time-elapsed`, and refreshes the live status indicator badge ("Đang làm bài", "Đang tạm dừng", "Đang thở 4-4-4").

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StepTelemetryUpdatePayload",
  "type": "object",
  "required": [
    "task_id",
    "step_index",
    "step_title",
    "elapsed_seconds",
    "remaining_seconds",
    "status",
    "pause_count"
  ],
  "properties": {
    "task_id": { "type": "string" },
    "step_index": { "type": "integer", "minimum": 0 },
    "step_title": { "type": "string" },
    "elapsed_seconds": { "type": "integer", "minimum": 0 },
    "remaining_seconds": { "type": "integer", "minimum": 0 },
    "total_step_seconds": { "type": "integer", "minimum": 30 },
    "status": {
      "type": "string",
      "enum": ["in_progress", "paused", "breathing_rescue", "idle"]
    },
    "pause_count": { "type": "integer", "minimum": 0 },
    "active_ui_type": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "STEP_TELEMETRY_UPDATE",
  "event_id": "evt_b1c2d3e4-0002",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230515456,
  "payload": {
    "task_id": "G1_MATH_01",
    "step_index": 1,
    "step_title": "Chọn Phép Tính",
    "elapsed_seconds": 25,
    "remaining_seconds": 65,
    "total_step_seconds": 90,
    "status": "in_progress",
    "pause_count": 0,
    "active_ui_type": "math_formula"
  }
}
```

---

### 3.3 Event 3: `STEP_COMPLETED`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Signals that the child has successfully answered/completed an atomic step card.
- **Cognitive Rationale**: Fixed-Ratio 1 (FR1) immediate dopamine reinforcement (<300ms) is essential to combat delay discounting in ADHD brains. Parent notification prepares effort-based praise.
- **Trigger**: Fired when child selects correct clue, taps correct formula, enters correct numpad value, or clicks finish step.
- **State Mutations**:
  - Child: `appState.stars += payload.dopamine_points_earned`, `appState.currentStepIndex++`.
  - Parent: Updates step status in telemetry widget to "completed" and prepares praise recommendation.
- **UI/UX Reactions**:
  - Child App: **< 300ms SLA**: Fires glowing star particle animation (`triggerStarBurst()`), plays synthesized E5-A5-C6 triangle chord chime (`playSfx('star')`), and auto-advances card after 600ms transition.
  - Parent App: Plays notification chime, turns current progress segment emerald green, updates `#parent-child-stars`.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StepCompletedPayload",
  "type": "object",
  "required": [
    "task_id",
    "step_index",
    "total_steps",
    "dopamine_points_earned",
    "total_stars_now",
    "time_spent_seconds",
    "is_task_complete"
  ],
  "properties": {
    "task_id": { "type": "string" },
    "step_index": { "type": "integer", "minimum": 0 },
    "total_steps": { "type": "integer", "minimum": 1 },
    "dopamine_points_earned": { "type": "integer", "minimum": 10, "maximum": 100 },
    "total_stars_now": { "type": "integer", "minimum": 0 },
    "time_spent_seconds": { "type": "integer", "minimum": 1 },
    "is_task_complete": { "type": "boolean" },
    "step_badge": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "STEP_COMPLETED",
  "event_id": "evt_b1c2d3e4-0003",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230545789,
  "payload": {
    "task_id": "G1_MATH_01",
    "step_index": 0,
    "total_steps": 3,
    "dopamine_points_earned": 50,
    "total_stars_now": 500,
    "time_spent_seconds": 32,
    "is_task_complete": false,
    "step_badge": "Thám tử Dữ kiện"
  }
}
```

---

### 3.4 Event 4: `ISLAND_COMPLETED`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Signals that all micro-steps of an individual task/island are cleared.
- **Cognitive Rationale**: Marking milestone completions solidifies self-efficacy and provides a natural break point to prevent cognitive fatigue.
- **Trigger**: Child completes the final step (`stepIdx === totalSteps - 1`) of a task.
- **State Mutations**:
  - Child: Marks island as completed, increments `appState.currentRoadmapIndex++`.
  - Parent: Marks island station in roadmap overview as finished.
- **UI/UX Reactions**:
  - Child App: Unlocks next station flag on island map, plays celebration arpeggio (`playSfx('success')`), shows island victory card with total stars earned.
  - Parent App: Displays celebration banner: "Bé Leo đã chinh phục Đảo 1!".

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "IslandCompletedPayload",
  "type": "object",
  "required": [
    "task_id",
    "island_index",
    "total_islands",
    "island_title",
    "total_stars_earned",
    "is_final_island"
  ],
  "properties": {
    "task_id": { "type": "string" },
    "island_index": { "type": "integer", "minimum": 0 },
    "total_islands": { "type": "integer", "minimum": 1 },
    "island_title": { "type": "string" },
    "total_stars_earned": { "type": "integer", "minimum": 10 },
    "is_final_island": { "type": "boolean" },
    "next_task_id": { "type": ["string", "null"] }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "ISLAND_COMPLETED",
  "event_id": "evt_b1c2d3e4-0004",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230590000,
  "payload": {
    "task_id": "G1_MATH_01",
    "island_index": 0,
    "total_islands": 2,
    "island_title": "Phép cộng trong phạm vi 10 (Thêm chim đậu cành)",
    "total_stars_earned": 150,
    "is_final_island": false,
    "next_task_id": "chore_desk"
  }
}
```

---

### 3.5 Event 5: `TREASURE_UNLOCKED`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Emitted when all assigned islands in the current dispatch are cleared, unlocking the Great Treasure Chest.
- **Cognitive Rationale**: Grand episodic reward that activates long-term intrinsic motivation and unlocks the Golden Ticket store.
- **Trigger**: The final island is completed (`is_final_island === true`).
- **State Mutations**:
  - Child: `appState.treasureUnlocked = true`.
  - Parent: Marks batch dispatch as 100% completed.
- **UI/UX Reactions**:
  - Child App: Screen transforms to Grand Treasure Chamber, 3D chest shakes and opens with golden beam, releases full-screen confetti shower, plays celebration fanfare (`playSfx('success')`).
  - Parent App: Telemetry card switches to "Hoàn thành toàn bộ lộ trình!" with child's total focus time and suggested growth praise.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TreasureUnlockedPayload",
  "type": "object",
  "required": [
    "dispatch_id",
    "total_islands_completed",
    "total_stars_awarded",
    "treasure_tier",
    "unlocked_at"
  ],
  "properties": {
    "dispatch_id": { "type": "string" },
    "total_islands_completed": { "type": "integer", "minimum": 1 },
    "total_stars_awarded": { "type": "integer", "minimum": 50 },
    "treasure_tier": { "type": "string", "enum": ["bronze", "silver", "gold", "diamond"] },
    "bonus_rewards": {
      "type": "array",
      "items": { "type": "string" }
    },
    "unlocked_at": { "type": "number" }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "TREASURE_UNLOCKED",
  "event_id": "evt_b1c2d3e4-0005",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230630000,
  "payload": {
    "dispatch_id": "DISPATCH_20261018_01",
    "total_islands_completed": 2,
    "total_stars_awarded": 270,
    "treasure_tier": "gold",
    "bonus_rewards": ["Huy hiệu Hiệp Sĩ Tập Trung", "Mở khóa Đổi Vé Vàng"],
    "unlocked_at": 1729230630000
  }
}
```

---

### 3.6 Event 6: `TICKET_REDEEM_REQUEST`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Child redeems accumulated dopamine stars for a real-world Golden Ticket privilege.
- **Cognitive Rationale**: Bridges digital tokens into tangible real-world bonding experiences (e.g. playing Lego with mom, choosing dinner menu, extra park time), anchoring motivation in positive parental relationships.
- **Trigger**: Child selects a ticket in the Reward Store and clicks "Đổi Vé Vàng".
- **State Mutations**:
  - Child: Records ticket into `appState.pendingTicket = payload`.
  - Parent: Appends ticket to `appState.pendingApprovals` queue.
- **UI/UX Reactions**:
  - Child App: Shows pending modal: *"Bé đã gửi yêu cầu đổi Vé Vàng! Đang chờ Mẹ duyệt nha..."* with soft hourglass animation.
  - Parent App: Pops up amber glowing action banner at top of screen: *"Bé Leo vừa yêu cầu đổi: 30 phút chơi Lego cùng mẹ Lan (200 ⭐)"* with "Duyệt ngay" and "Nhắc nhở" buttons. Sfx: `playSfx('bell')`.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TicketRedeemRequestPayload",
  "type": "object",
  "required": [
    "request_id",
    "ticket_id",
    "ticket_name",
    "stars_cost",
    "current_child_stars"
  ],
  "properties": {
    "request_id": { "type": "string" },
    "ticket_id": { "type": "string" },
    "ticket_name": { "type": "string", "maxLength": 100 },
    "ticket_icon": { "type": "string" },
    "stars_cost": { "type": "integer", "minimum": 10 },
    "current_child_stars": { "type": "integer", "minimum": 0 },
    "child_note": { "type": "string", "maxLength": 150 }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "TICKET_REDEEM_REQUEST",
  "event_id": "evt_b1c2d3e4-0006",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230660000,
  "payload": {
    "request_id": "REQ_TICKET_001",
    "ticket_id": "TICKET_LEGO_30M",
    "ticket_name": "30 phút chơi Lego cùng mẹ Lan",
    "ticket_icon": "🧱",
    "stars_cost": 200,
    "current_child_stars": 500,
    "child_note": "Leo đã hoàn thành 2 hòn đảo rồi ạ!"
  }
}
```

---

### 3.7 Event 7: `TICKET_APPROVAL_RESPONSE`

- **Direction**: `Parent Hub -> Child Quest`
- **Functional Purpose**: Transmits the parent's approval (or constructive reschedule) for the requested Golden Ticket.
- **Cognitive Rationale**: Rapid affirmative parental closure reinforces trust and prevents Rejection Sensitive Dysphoria (RSD) from feeling ignored.
- **Trigger**: Parent clicks "Duyệt ngay" on the Parent Hub banner.
- **State Mutations**:
  - Child: Deducts `stars_cost` from `appState.stars`, moves ticket from pending to approved inventory, clears pending modal.
  - Parent: Dismisses pending banner, records approval in history.
- **UI/UX Reactions**:
  - Child App: Closes pending modal, instantly displays Grand Golden Ticket Celebration popup with confetti, fanfare audio (`playSfx('success')`), and renders Mom's praise message on screen!
  - Parent App: Banner turns emerald green: *"Đã duyệt thành công! Mẹ hãy dành thời gian chơi cùng Leo nhé!"*.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TicketApprovalResponsePayload",
  "type": "object",
  "required": [
    "request_id",
    "ticket_id",
    "ticket_name",
    "approved",
    "stars_deducted",
    "remaining_stars"
  ],
  "properties": {
    "request_id": { "type": "string" },
    "ticket_id": { "type": "string" },
    "ticket_name": { "type": "string" },
    "approved": { "type": "boolean" },
    "stars_deducted": { "type": "integer", "minimum": 0 },
    "remaining_stars": { "type": "integer", "minimum": 0 },
    "parent_praise_message": { "type": "string", "maxLength": 200 },
    "scheduled_time": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "TICKET_APPROVAL_RESPONSE",
  "event_id": "evt_b1c2d3e4-0007",
  "room_id": "family_room_milo_01",
  "sender_role": "parent",
  "sender_id": "parent_me_lan",
  "timestamp": 1729230675123,
  "payload": {
    "request_id": "REQ_TICKET_001",
    "ticket_id": "TICKET_LEGO_30M",
    "ticket_name": "30 phút chơi Lego cùng mẹ Lan",
    "approved": true,
    "stars_deducted": 200,
    "remaining_stars": 300,
    "parent_praise_message": "Mẹ đồng ý ngay! Mẹ rất tự hào về sự kiên trì vượt các đảo hôm nay của Leo!",
    "scheduled_time": "19:30 tối nay"
  }
}
```

---

### 3.8 Event 8: `MILO_RESCUE_TRIGGER`

- **Direction**: `Child Quest -> Parent Hub`
- **Functional Purpose**: Notifies the ecosystem that the child has entered an emotional co-regulation or soft-pause state via Robot Milo.
- **Cognitive Rationale**: Implements the Barkley Emotional Dysregulation and Dodson RSD Shield protocol. Replaces punitive failure buzzer with a parasympathetic 4-4-4 box breathing calming sequence. Notifies parent to offer gentle co-regulation rather than scolding.
- **Trigger**: Child taps the Milo SOS Rescue button (`#btn-milo-sos`), or Visual Timer reaches zero (initiating soft pause), or child incurs repeated errors.
- **State Mutations**:
  - Child: Pauses active step timer (`isTimerPaused = true`), opens Milo breathing overlay, increments `appState.pauseCount`.
  - Parent: Logs emotional rescue event; updates status to "Bé đang thở 4-4-4 cùng Milo".
- **UI/UX Reactions**:
  - Child App: Dims screen, launches Milo 4-4-4 breathing circle overlay (Inhale 4s -> Hold 4s -> Exhale 4s -> Rest 4s) with warm Tibetan singing bowl chime (`playSfx('breathe')`).
  - Parent App: Displays Parent Emotional Coach banner with specific anti-RSD talking points: *"Bé đang cần một nhịp nghỉ êm dịu. Mẹ hãy đến xoa nhẹ vai hoặc rót cho bé 1 ly nước ấm!"*.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MiloRescueTriggerPayload",
  "type": "object",
  "required": [
    "task_id",
    "step_index",
    "trigger_reason",
    "breathing_technique",
    "pause_count_total"
  ],
  "properties": {
    "task_id": { "type": "string" },
    "step_index": { "type": "integer", "minimum": 0 },
    "trigger_reason": {
      "type": "string",
      "enum": [
        "user_clicked_rescue",
        "timer_expired_soft_pause",
        "repeated_errors",
        "sensory_overload"
      ]
    },
    "breathing_technique": {
      "type": "string",
      "enum": ["box_breathing_4_4_4", "sensory_grounding_5_4_3_2_1"]
    },
    "pause_count_total": { "type": "integer", "minimum": 1 }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "MILO_RESCUE_TRIGGER",
  "event_id": "evt_b1c2d3e4-0008",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230700000,
  "payload": {
    "task_id": "G1_MATH_01",
    "step_index": 1,
    "trigger_reason": "user_clicked_rescue",
    "breathing_technique": "box_breathing_4_4_4",
    "pause_count_total": 1
  }
}
```

---

### 3.9 Event 9: `PARENT_CHEER_SEND`

- **Direction**: `Parent Hub -> Child Quest`
- **Functional Purpose**: Parent sends an effort-based cheer sticker or personalized encouraging text to the child's screen in real time.
- **Cognitive Rationale**: Non-disruptive praise validates effort and persistence (Carol Dweck Growth Mindset) without interrupting the child's active working memory flow.
- **Trigger**: Parent taps one of the preset effort cheer buttons (e.g. "Mẹ thấy con rất kiên trì!", "Cố lên phi hành gia nhỏ!") in the Parent Coach panel.
- **State Mutations**:
  - No disruptive state mutation. Appended to child's ephemeral cheer queue.
- **UI/UX Reactions**:
  - Child App: A cheerful floating Milo banner glides across the top of the cockpit with the chosen sticker and praise message, accompanied by a gentle harp glissando (`playSfx('bell')`), fading out automatically after 3.5 seconds.
  - Parent App: Shows toast: *"Đã gửi lời động viên tới bé Leo!"*.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ParentCheerSendPayload",
  "type": "object",
  "required": [
    "cheer_id",
    "sticker",
    "cheer_text",
    "sfx_cue"
  ],
  "properties": {
    "cheer_id": { "type": "string" },
    "sticker": {
      "type": "string",
      "enum": ["milo_thumbs_up", "super_star", "high_five", "warm_hug", "rocket_boost"]
    },
    "cheer_text": { "type": "string", "maxLength": 160 },
    "sfx_cue": { "type": "string", "default": "harp_glissando_soft" }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "PARENT_CHEER_SEND",
  "event_id": "evt_b1c2d3e4-0009",
  "room_id": "family_room_milo_01",
  "sender_role": "parent",
  "sender_id": "parent_me_lan",
  "timestamp": 1729230725000,
  "payload": {
    "cheer_id": "CHEER_004",
    "sticker": "milo_thumbs_up",
    "cheer_text": "Mẹ thấy con đang rất tập trung suy nghĩ, tuyệt vời lắm con yêu!",
    "sfx_cue": "harp_glissando_soft"
  }
}
```

---

### 3.10 Event 10: `STARS_SYNC`

- **Direction**: `Bi-directional / Authoritative State Synchronization`
- **Functional Purpose**: Authoritatively reconciles total dopamine stars across all open tabs, windows, and backend stores.
- **Cognitive Rationale**: Star counter discrepancies cause immediate distress and distrust in neurodivergent children. Star balances must remain perfectly synchronized.
- **Trigger**: Dispatched upon any star mutation (step reward, ticket purchase, island bonus) or during initial session hydration.
- **State Mutations**:
  - `appState.stars = payload.total_stars`
  - Persisted to `localStorage.setItem('milo_stars_v1', payload.total_stars)`
- **UI/UX Reactions**:
  - Both Apps: Updates all DOM star pills (`#child-stars-count`, `#parent-child-stars`, `#reward-modal-stars`) with a subtle pulse glow animation.

#### Draft-07 Payload Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StarsSyncPayload",
  "type": "object",
  "required": [
    "sync_id",
    "total_stars",
    "delta_stars",
    "reason",
    "authoritative_source"
  ],
  "properties": {
    "sync_id": { "type": "string" },
    "total_stars": { "type": "integer", "minimum": 0 },
    "delta_stars": { "type": "integer" },
    "reason": {
      "type": "string",
      "enum": ["step_reward", "island_bonus", "ticket_deduct", "admin_grant", "session_hydration"]
    },
    "authoritative_source": {
      "type": "string",
      "enum": ["child", "parent", "server"]
    }
  },
  "additionalProperties": false
}
```

#### Canonical JSON Payload Example:
```json
{
  "event_type": "STARS_SYNC",
  "event_id": "evt_b1c2d3e4-0010",
  "room_id": "family_room_milo_01",
  "sender_role": "child",
  "sender_id": "kid_milo_01",
  "timestamp": 1729230750000,
  "payload": {
    "sync_id": "SYNC_STAR_992",
    "total_stars": 550,
    "delta_stars": 50,
    "reason": "step_reward",
    "authoritative_source": "child"
  }
}
```

---

## 4. Multi-Layer Transport Architecture

The 10 events operate over the Tri-Layer Sync Bus:

```
+---------------------------------------------------------------------------------------+
|                                    APPLICATION UI                                     |
|            [Parent Hub: Trạm Thấu Hiểu]       [Child Cockpit: Milo Quest]             |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                 MiloSyncBus (Facade)                                  |
|   - emit(eventType, payload)                                                          |
|   - on(eventType, callback)                                                           |
|   - persistState(stateSnapshot) / hydrateState()                                      |
+---------------------------------------------------------------------------------------+
           |                                   |                                   |
           v (0ms Single Window)               v (<2ms Cross-Tab & Reload)         v (5-15ms LAN/Cloud)
+-----------------------+           +-----------------------+           +-----------------------+
|  Layer 1: In-Memory   |           |  Layer 2: Web Bus     |           |  Layer 3: WebSocket   |
|  Loopback             |           |  BroadcastChannel +   |           |  FastAPI /ws/sync     |
|  Direct handler call  |           |  LocalStorage Event   |           |  Auto-reconnect with  |
|  within same JS frame |           |  & State Hydration    |           |  graceful degradation |
+-----------------------+           +-----------------------+           +-----------------------+
```

### 4.1 Anti-Echo & Idempotency Rules
1. **Self-Origin Filtering**: When `event.sender_id === this.clientId` and transport is not `'loopback'`, the event must be ignored to prevent infinite message bounce-backs.
2. **De-duplication Cache**: An in-memory LRU set of the last 100 `event_id` strings prevents double-processing if an event arrives over both `BroadcastChannel` and `WebSocket`.

---

## 5. Verification Strategy & Test Procedures

### 5.1 Verification Part A: Cross-Tab `BroadcastChannel` Live DOM Updates

#### Objective
Verify that actions taken on Tab 1 (Parent Hub) instantly trigger live DOM updates on Tab 2 (Child Quest) without any page reload.

#### Environmental Nuance: `file:///` vs Local HTTP Server
- **Observation**: Chromium and WebKit security models often restrict or isolate `BroadcastChannel` communication between `file:///` URLs depending on the exact path and browser sandbox.
- **Requirement**: `MiloSyncBus` must implement dual cross-tab signaling:
  1. Primary: `new BroadcastChannel('milo_quest_sync')`.
  2. Redundant Secondary: `window.addEventListener('storage', ...)` by writing to `localStorage.setItem('milo_event_bus', JSON.stringify(envelope))`.
- **Testing Standard**: For automated browser testing, serve the repository via a local lightweight HTTP server:
  ```bash
  python -m http.server 8080
  ```

#### Detailed Test Procedure

| Step | Action on Tab 1 (Parent Hub: `http://localhost:8080/index.html?role=parent`) | Expected Reaction on Tab 2 (Child App: `http://localhost:8080/index.html?role=child`) | Verification Checkpoint in DOM |
|---|---|---|---|
| **A1** | Open Tab 1 and Tab 2 in separate browser windows. | Both tabs establish connection to `milo_quest_sync` channel. | `window.miloBus.channel !== null` on both tabs. |
| **A2** | In Tab 1, navigate to "Kho Đề Xuất", select 3 tasks (`G1_MATH_01`, `G1_VIET_03`, `chore_desk`), and click `#btn-dispatch-catalog` ("Giao bài ngay"). | Tab 2 immediately updates its Island Roadmap from the previous 2 default islands to exactly 3 new sequential islands. | Tab 2: `#child-roadmap-stations` child elements count equals 3; station 1 title text matches "Phép cộng trong phạm vi 10". |
| **A3** | In Tab 2, click into Island 1, answer Step 1 correctly. | Tab 1 Live Telemetry card immediately advances step progress bar and reflects +50 stars. | Tab 1: `#telemetry-progress-segment-0` contains class `bg-emerald-500`; `#parent-child-stars` updates. |
| **A4** | In Tab 2, tap "Đổi Vé Vàng" for "30 phút chơi Lego cùng mẹ Lan". | Tab 1 immediately displays glowing top notification banner with sound chime. | Tab 1: `#parent-ticket-alert-banner` is visible (class `hidden` removed); text contains "30 phút chơi Lego". |
| **A5** | In Tab 1, click "Duyệt ngay" on the ticket banner. | Tab 2 immediately displays the Grand Ticket Celebration modal with confetti and Mom's praise message. | Tab 2: `#modal-ticket-celebration` is visible; praise text element is populated. |
| **A6** | In Tab 2, click the Milo SOS button (`#btn-milo-sos`). | Tab 1 displays the emotional co-regulation banner with 4-4-4 breathing alert. | Tab 1: `#parent-milo-rescue-alert` is visible. |

---

### 5.2 Verification Part B: LocalStorage State Persistence Across Page Refresh

#### Objective
Verify that `appState` survives a browser page refresh (F5 / `location.reload()`) so that the child's progress, earned stars, and current island/step are never reset to defaults.

#### Persisted State Contract (`milo_sync_state_v1`)
The state object persisted to `localStorage` under key `milo_sync_state_v1` must include:

```json
{
  "version": 1,
  "last_updated": 1729230800000,
  "stars": 520,
  "childRoadmap": [ ... ],
  "currentRoadmapIndex": 1,
  "activeTaskId": "G1_MATH_02",
  "currentStepIndex": 2,
  "pauseCount": 2,
  "totalSessionSeconds": 340,
  "completedIslandIds": ["G1_MATH_01"],
  "pendingTicket": null
}
```

#### Detailed Test Procedure

| Step | Action | Expected State & Verification Method |
|---|---|---|
| **B1** | Load `index.html`. Verify initial stars (default 450). | DOM `#child-stars-count` displays `450 ⭐`. |
| **B2** | Complete Step 1 and Step 2 of active task. Earn +80 stars. | In-memory stars = 530. `localStorage.getItem('milo_sync_state_v1')` contains `"stars": 530`. |
| **B3** | Advance to Island 2 (Station 2). | `currentRoadmapIndex` in storage equals `1`. |
| **B4** | Trigger hard page reload: `window.location.reload(true)`. | Application initializes, executes `hydrateStateFromStorage()`. |
| **B5** | Inspect hydrated DOM immediately upon load. | 1. `#child-stars-count` displays `530 ⭐` (NOT 450).<br>2. Active island rendered is Island 2 (Station 2), NOT Island 1.<br>3. Progress indicator reflects saved `currentStepIndex`. |
| **B6** | Test corruption resilience: Inject invalid JSON into `localStorage.setItem('milo_sync_state_v1', '{corrupt_data!')` and reload. | App catches `SyntaxError`, falls back safely to default state without throwing white-screen fatal errors. |

---

### 5.3 Verification Part C: Verification of All 25 GDPT 2018 Benchmark Tasks in Parent Hub

#### Objective
Ensure that 100% of the 25 standardized GDPT 2018 benchmark tasks from `data/curriculum/grade_1_to_5_benchmark.json` are loaded, rendered, filterable, and selectable in the Parent Assignment Hub.

#### Exact Inventory Requirements
The Parent Assignment Hub (`#parent-screen-tasks` -> `#catalog-tasks-list`) must contain exactly:
- **Total Benchmark Tasks**: 25 tasks.
- **Practical Life Routines**: 4 tasks (`chore_desk`, `chore_teeth`, `chore_backpack`, `chore_bed`).
- **Grand Total Catalog Items**: 29 tasks.

#### Grade & Subject Filter Verification Matrix

| Filter Selection | Expected Number of Tasks | Expected Benchmark Task IDs |
|---|:---:|---|
| **Khối 1 (Grade 1)** | 5 tasks | `G1_MATH_01`, `G1_MATH_02`, `G1_VIET_03`, `G1_MCQ_04`, `G1_ENG_05` |
| **Khối 2 (Grade 2)** | 5 tasks (+ 1 routine) | `G2_MATH_06`, `G2_MATH_07`, `G2_VIET_08`, `G2_MCQ_09`, `G2_ENG_10` |
| **Khối 3 (Grade 3)** | 5 tasks | `G3_MATH_11`, `G3_MATH_12`, `G3_VIET_13`, `G3_MCQ_14`, `G3_ENG_15` |
| **Khối 4 (Grade 4)** | 5 tasks | `G4_MATH_16`, `G4_MATH_17`, `G4_VIET_18`, `G4_MCQ_19`, `G4_ENG_20` |
| **Khối 5 (Grade 5)** | 5 tasks | `G5_MATH_21`, `G5_MATH_22`, `G5_VIET_23`, `G5_MCQ_24`, `G5_ENG_25` |
| **Môn Toán (Math)** | 10 tasks | `G1_MATH_01`, `G1_MATH_02`, `G2_MATH_06`, `G2_MATH_07`, `G3_MATH_11`, `G3_MATH_12`, `G4_MATH_16`, `G4_MATH_17`, `G5_MATH_21`, `G5_MATH_22` |
| **Môn Tiếng Việt** | 5 tasks | `G1_VIET_03`, `G2_VIET_08`, `G3_VIET_13`, `G4_VIET_18`, `G5_VIET_23` |
| **Môn Tiếng Anh** | 5 tasks | `G1_ENG_05`, `G2_ENG_10`, `G3_ENG_15`, `G4_ENG_20`, `G5_ENG_25` |
| **Trắc Nghiệm (MCQ)** | 5 tasks | `G1_MCQ_04`, `G2_MCQ_09`, `G3_MCQ_14`, `G4_MCQ_19`, `G5_MCQ_24` |
| **Sinh Hoạt (Routines)**| 4 tasks | `chore_desk`, `chore_teeth`, `chore_backpack`, `chore_bed` |

#### Detailed Verification Steps

| Step | Action | Checkpoint |
|---|---|---|
| **C1** | Open Parent App -> Click "Giao Bài" -> "Kho Đề Xuất (Băm sẵn)". | Container `#catalog-tasks-list` contains 29 interactive task cards. |
| **C2** | Inspect DOM IDs of rendered task cards. | Every ID from `G1_MATH_01` through `G5_ENG_25` exists as `data-task-id`. |
| **C3** | Click filter badge "Lớp 3". | Exactly 5 cards remain visible; all contain grade badge "Lớp 3". |
| **C4** | Click filter badge "Toán". | Exactly 10 cards remain visible; all display icon 📐 and math category. |
| **C5** | Check boxes for `G3_MATH_11`, `G3_VIET_13`, `G3_ENG_15`. | Counter badge displays "Đã chọn 3 bài". |
| **C6** | Click `#btn-dispatch-catalog` ("Giao ngay 3 bài"). | Dispatches `TASK_ASSIGN_BATCH` containing all 3 chosen tasks with their full atomic steps. |

---

## 6. Regression Testing & Safety Guardrails

### 6.1 Automated Contract Regression Test Design
To ensure that future changes to `generate_app.py` or backend endpoints never violate the protocol, we specify an automated Python test suite (`tests/e2e/test_state_protocol.py`):

1. **Schema Compliance Test**: Loads all 10 canonical event payloads and validates them using Python `jsonschema.Draft7Validator` against the formal schemas defined in Section 3.
2. **Catalog Ingestion Test**: Parses `generate_app.py`, extracts the JavaScript `taskDatabase` object, and asserts:
   - Contains all 25 benchmark task IDs matching `data/curriculum/grade_1_to_5_benchmark.json`.
   - Each task contains `steps` with atomic instructions $< 15$ words and valid single action verbs.
3. **Storage Persistence Test**: Validates that serialization/deserialization of `appState` maintains fidelity across all schema fields.

### 6.2 Strict Neurodiversity & Clinical Safety Guardrails

| Guardrail ID | Dimension | Safety Rule | Invalidation / Failure Condition |
|---|---|---|---|
| **SG-01** | **Dopamine Latency SLA** | Star burst animation and Web Audio SFX chime must trigger in **< 300ms** after correct input. | Any network-blocking call or reflow loop that delays dopamine feedback $> 300\text{ms}$. |
| **SG-02** | **RSD Shield (No Punitive Feedback)** | Zero red warning flashing, zero buzzer alarms, zero negative evaluation text ("Sai rồi", "Kém quá"). | Use of harsh audio or red critical alerts on incorrect answers. |
| **SG-03** | **Single-Focus Card Cockpit** | Focus Cockpit must render **exactly 1 card** at a time. The child must never see future questions or task lists simultaneously. | Multiple active step cards rendered at once. |
| **SG-04** | **Silent WebSocket Degradation** | If `ws://localhost:8000/ws/sync` is offline or fails, the application must **silently downgrade** to Layer 2 (`BroadcastChannel` / `localStorage`). | Modal alerts or popups announcing "WebSocket connection failed" to the user. |
| **SG-05** | **Strict Prompt Preservation** | The 4 production prompt files in `prompts/` are **STRICTLY READ-ONLY**. | Any modification, overwrite, or deletion of files in `prompts/`. |

---

## 7. Actionable Implementation Recommendations for Worker (`worker_m1`)

1. **Inject `MiloSyncBus` Definition**:
   Insert the complete `MiloSyncBus` class into `generate_app.py` directly before `appState` initialization (around line 1765). Ensure it defines:
   - Primary `BroadcastChannel('milo_quest_sync')`.
   - Fallback `window.addEventListener('storage', ...)`.
   - Reconnectable WebSocket to `ws://${location.hostname || 'localhost'}:8000/ws/sync`.
   - Methods: `emit(eventType, payload)`, `on(eventType, callback)`, `persistState()`, `hydrateState()`.
2. **Wire Event Handlers to DOM Callbacks**:
   - `TASK_ASSIGN_BATCH` -> `appState.childRoadmap = tasks; renderChildIslandRoadmap();`
   - `STEP_TELEMETRY_UPDATE` -> `renderParentTelemetryProgress();`
   - `STEP_COMPLETED` -> `triggerStarBurst(); playSfx('star');`
   - `TICKET_REDEEM_REQUEST` -> `showParentTicketAlert(payload);`
   - `TICKET_APPROVAL_RESPONSE` -> `showChildTicketApprovedModal(payload); playSfx('success');`
   - `MILO_RESCUE_TRIGGER` -> `startBoxBreathing(); showParentMiloAlert();`
   - `PARENT_CHEER_SEND` -> `showChildCheerBanner(payload);`
   - `STARS_SYNC` -> `updateStarPills(payload.total_stars);`
3. **Populate `taskDatabase` with All 25 Benchmark Tasks**:
   Work in alignment with `explorer_m1_2`'s mapping to ensure lines 1527–1762 of `generate_app.py` hold the complete 25 GDPT 2018 tasks.
4. **Re-generate Web Artifacts**:
   Execute `python generate_app.py` to compile `index.html` and `out_index.html`.

---
*Report compiled by explorer_m1_3 for Orchestrator, Worker M1, and Reviewers.*
