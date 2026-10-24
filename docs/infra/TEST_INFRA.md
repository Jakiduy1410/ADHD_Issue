# E2E Test Infra: Dual-App ADHD Intervention Ecosystem

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory Mapping
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Dual Side-by-Side Simulator | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 2 | Tri-Layer Hybrid Sync Bus | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 3 | 10-Event State Protocol | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 4 | 25 GDPT 2018 Benchmark Integration | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 5 | Offline State Persistence | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 6 | Pre-decomposed Assignment Bank | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 7 | Custom Assignment Creator | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 8 | Live Telemetry Dashboard | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 9 | RSD-Safe Effort Praise Generator | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 10 | Golden Ticket Parent Approval | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 11 | Island Quest Adventure Roadmap | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 12 | Focus Cockpit Single-Focus Card | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 13 | Smooth Visual Timer Disc | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 14 | Tactile Inputs & Numpad | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 15 | Instant Dopamine Feedback (<300ms) | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 16 | Robot Milo & 4-4-4 Box Breathing | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 17 | Treasure Chest & Ticket Redemption | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 18 | Web Audio Synthesis Engine | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 19 | Backend WebSocket & API Server | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 20 | Offline Mocking for API Tests | Technical Requirement | 5 | 5 | ✓ |
| 21 | Strict Prompt Guardrail Compliance | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Python `unittest` / automated test runner (`tests/e2e/test_dual_app_e2e.py`).
- Headless browser / DOM verification scripts and API contract validation.
- Directory layout: `tests/e2e/` for Tiers 1-4, `tests/adversarial/` for Tier 5.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Mother Lan batch-assigns 3 GDPT 2018 tasks (Grade 2 Math & Vietnamese), Bé Leo completes them on Island Roadmap, triggers Web Audio dopamine bursts | F1, F2, F4, F6, F11, F12, F15, F18 | High |
| 2 | Bé Leo encounters difficult problem, requests Milo Rescue, completes 4-4-4 box breathing cycle, resumes task | F12, F16, F8, F9 | High |
| 3 | Bé Leo finishes island, unlocks Treasure Chest, redeems Golden Ticket (Ice cream reward), Mother Lan approves on Parent Hub, Child receives celebration fanfare | F2, F3, F10, F17, F18 | High |
| 4 | Mother Lan inputs custom Math word problem, AI preview decomposes into <15-word micro-steps, dispatches to Bé Leo | F6, F7, F2, F11 | High |
| 5 | Cross-tab multi-window simulation: Child in Tab 1, Parent in Tab 2, real-time sync verified via BroadcastChannel / localStorage | F1, F2, F3, F5, F8 | High |

## Coverage Thresholds
- Tier 1 (Feature Coverage): >= 5 test cases per feature
- Tier 2 (Boundary & Corner Cases): >= 5 test cases per feature
- Tier 3 (Cross-Feature Combinations): Pairwise coverage of major feature interactions
- Tier 4 (Real-World Scenarios): >= 5 realistic end-to-end scenarios
