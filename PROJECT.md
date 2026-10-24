# Project: Dual-App ADHD Intervention Ecosystem (Milo Quest x Trạm Thấu Hiểu)

## Architecture
The Dual-App ADHD Intervention Ecosystem integrates two distinct user experiences tailored to pediatric ADHD neurodiversity (GDPT 2018):
1. **Child App (Milo Quest)**: Island Quest adventure roadmap, Single-Focus Card cockpit (1 screen 1 step), smooth Visual Timer disc, tactile Numpad/inputs, instant dopamine reinforcement (<300ms star burst + synthesized Web Audio), Robot Milo 4-4-4 box breathing rescue overlay, and Treasure Chest / Golden Ticket token economy.
2. **Parent App (Trạm Thấu Hiểu)**: Two assignment pathways (Pre-decomposed bank of 25 GDPT 2018 exercises with batch selection + Custom AI decomposition / manual builder), real-time Live Telemetry monitoring, RSD-safe effort-based praise generator with forbidden words warning, and Golden Ticket real-time approval.
3. **Dual-Device Simulator & State Bus (`MiloSyncBus`)**: Tri-Layer Hybrid Synchronization:
   - **Layer 1 (In-Memory)**: 0ms latency for side-by-side Dual Split View on a single screen.
   - **Layer 2 (BroadcastChannel + LocalStorage)**: <2ms cross-tab zero-config sync across browser tabs/monitors and offline persistent state across page reloads.
   - **Layer 3 (WebSocket Auto-Connect)**: Real LAN/cloud multi-device communication (`ws://localhost:8000/ws/sync`) with silent auto-fallback when offline.
4. **Standalone Web Delivery**: `index.html` and `out_index.html` generated via `generate_app.py`, 60fps animations, 100% synthesized Web Audio API (zero external asset dependency).
5. **Backend & Prompt Guardrails**: FastAPI server (`src/api/server.py`), 9-question clinical survey (`adhd_parent_survey.json`), 25 GDPT 2018 benchmark tasks (`grade_1_to_5_benchmark.json`), Draft-07 schemas (`schemas/`), and 100% protected production prompts (`prompts/`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dual Side-by-Side Simulator | Split-screen phone frames (#col-child & #col-parent) and 1-click role toggle | M1 | ORIGINAL_REQUEST R1 |
| 2 | Tri-Layer Hybrid Sync Bus (`MiloSyncBus`) | In-memory + BroadcastChannel + localStorage + WebSocket multi-channel sync | M1 | Survey 1 |
| 3 | 10-Event State Protocol | TASK_ASSIGN_BATCH, STEP_TELEMETRY, STEP_COMPLETED, TICKET_REDEEM, etc. | M1 | Survey 1 |
| 4 | 25 GDPT 2018 Benchmark Integration | Full ingestion of all 25 curriculum tasks across Grades 1-5 into catalog | M1 | Survey 3 & R2 |
| 5 | Offline State Persistence | Saving stars, progress, roadmap, and pending tickets to localStorage | M1 | Survey 1 |
| 6 | Pre-decomposed Assignment Bank | Grade/subject filters, batch checkboxes, and 1-click "Giao ngay" dispatch | M2 | ORIGINAL_REQUEST R2 |
| 7 | Custom Assignment Creator | AI decomposition preview (<15 words, 1 verb) and dynamic manual step builder | M2 | ORIGINAL_REQUEST R2 |
| 8 | Live Telemetry Dashboard | Real-time monitoring of child's active step, time elapsed, and star count | M2 | ORIGINAL_REQUEST R2 |
| 9 | RSD-Safe Effort Praise Generator | Script generator with explicit Forbidden Words / Red Lines warning card | M2 | ORIGINAL_REQUEST R2 |
| 10 | Golden Ticket Parent Approval | Ticket approval interface triggering celebration broadcast | M2 | ORIGINAL_REQUEST R2 |
| 11 | Island Quest Adventure Roadmap | S-curve path rendering all assigned exercises as sequential islands | M3 | ORIGINAL_REQUEST R3 |
| 12 | Focus Cockpit Single-Focus Card | 1 screen 1 step layout minimizing cognitive distraction | M3 | ORIGINAL_REQUEST R3 |
| 13 | Smooth Visual Timer Disc | Conic-gradient visual countdown disc without stressful ticking audio | M3 | ORIGINAL_REQUEST R3 |
| 14 | Tactile Inputs & Numpad | Mobile-friendly large buttons and tactile virtual numpad | M3 | ORIGINAL_REQUEST R3 |
| 15 | Instant Dopamine Feedback | <300ms star burst particle animation + synthesized Web Audio chime | M3 | ORIGINAL_REQUEST R3 |
| 16 | Robot Milo & 4-4-4 Box Breathing | Calming RSD shield dialog + 4-4-4-4 visual breathing circle overlay | M3 | ORIGINAL_REQUEST R3 |
| 17 | Treasure Chest & Ticket Redemption | Island completion chest unboxing, ticket redemption, and celebration modal | M3 | ORIGINAL_REQUEST R3 |
| 18 | Web Audio Synthesis Engine | 100% in-memory audio oscillator synthesis (zero external sound files) | M3 | Survey 2 |
| 19 | Backend WebSocket & API Server | FastAPI `/ws/sync` and task endpoints supporting multi-device setups | M4 | ORIGINAL_REQUEST R1 |
| 20 | Offline Mocking for API Tests | Deterministic test mocks for Gemini API to prevent 429 quota stalls | M4 | Survey 1 |
| 21 | Strict Prompt Guardrail Compliance | Zero overwrites of prompts/, all experimental diffs isolated in scratch/ | M4 | ORIGINAL_REQUEST R4 |
| 22 | Full E2E Test Suite Validation | 100% pass across Tier 1 (Feature), Tier 2 (Boundary), Tier 3 (Pairwise), Tier 4 (Workloads) | M5 | ORIGINAL_REQUEST Acceptance |
| 23 | Tier 5 Adversarial Coverage Hardening | White-box adversarial testing, edge cases, and code coverage verification | M5 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Sync Bus & Curriculum Bank | Tri-Layer MiloSyncBus, 10-event state protocol, full 25 GDPT 2018 tasks | none | DONE |
| M2 | Parent Assignment Hub | Pre-decomposed bank, batch dispatch, custom creator, telemetry, RSD coach | M1 | DONE |
| M3 | Child Quest & Focus Cockpit | Island roadmap, single-focus card, visual timer, dopamine audio, Milo 4-4-4 | M1 | DONE |
| M4 | Backend API & Prompt Guardrail | Server sync endpoint validation, test offline mocks, strict prompt guardrails | none | DONE |
| M5 | E2E Testing & Coverage Hardening | Phase 1: 100% pass on Tiers 1-4 tests; Phase 2: Tier 5 Adversarial Hardening | M1, M2, M3, M4 | DONE |

## Interface Contracts
### MiloSyncBus ↔ UI Components
- Events:
  - `TASK_ASSIGN_BATCH`: `{ type: "TASK_ASSIGN_BATCH", payload: { tasks: TaskItem[] } }`
  - `STEP_TELEMETRY_UPDATE`: `{ type: "STEP_TELEMETRY_UPDATE", payload: { taskId, stepIndex, elapsedSec } }`
  - `STEP_COMPLETED`: `{ type: "STEP_COMPLETED", payload: { taskId, stepIndex, starsEarned } }`
  - `ISLAND_COMPLETED`: `{ type: "ISLAND_COMPLETED", payload: { taskId, totalStars } }`
  - `TREASURE_UNLOCKED`: `{ type: "TREASURE_UNLOCKED", payload: { taskId, rewards } }`
  - `TICKET_REDEEM_REQUEST`: `{ type: "TICKET_REDEEM_REQUEST", payload: { ticketId, title, cost } }`
  - `TICKET_APPROVAL_RESPONSE`: `{ type: "TICKET_APPROVAL_RESPONSE", payload: { ticketId, approved: boolean } }`
  - `MILO_RESCUE_TRIGGER`: `{ type: "MILO_RESCUE_TRIGGER", payload: { reason, stepId } }`
  - `PARENT_CHEER_SEND`: `{ type: "PARENT_CHEER_SEND", payload: { message } }`
  - `STARS_SYNC`: `{ type: "STARS_SYNC", payload: { totalStars } }`
- Method: `MiloSyncBus.broadcast(event)` and `MiloSyncBus.subscribe(eventType, callback)`

### Parent Hub ↔ Child Quest
- Dispatch contract: `appState.childRoadmap = tasks`, broadcast `TASK_ASSIGN_BATCH`, trigger `renderChildIslandRoadmap()`.
- Telemetry contract: Child dispatches `STEP_TELEMETRY_UPDATE`, Parent view updates live progress widget.
- Ticket approval contract: Child dispatches `TICKET_REDEEM_REQUEST`, Parent clicks "Duyệt ngay", dispatches `TICKET_APPROVAL_RESPONSE`, Child shows celebration fanfare.

## Code Layout
- `docs/research/`: Domain literature and pedagogical research documents.
- `docs/reports/`: Benchmark reports and summaries.
- `docs/infra/`: Testing infrastructure and test readiness specifications.
- `generate_app.py`: Generator script creating standalone `index.html` and `out_index.html`.
- `index.html` / `out_index.html`: Standalone dual-app web deliverable with Tailwind CSS, Web Audio API, and MiloSyncBus.
- `src/api/server.py`: FastAPI server with WebSocket `/ws/sync` and REST endpoints.
- `src/adhd_scoring/`: Scoring algorithms and unit tests.
- `data/curriculum/`: 25 GDPT 2018 benchmark tasks (`grade_1_to_5_benchmark.json`).
- `data/surveys/`: 9-question clinical survey (`adhd_parent_survey.json`).
- `schemas/`: Draft-07 JSON schemas.
- `prompts/`: Protected system prompts (STRICTLY READ-ONLY).
- `scratch/`: Prompt experimentation scripts, reports, and diff proposals (strictly preserves `prompt_experiment_report.md`).
- `tests/`: Unit, integration, E2E, and adversarial test suites.
