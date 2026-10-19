# Project: Dual-App ADHD Intervention Ecosystem Refactor

## Architecture
The ecosystem consists of:
1. **Frontend**: Single-page application (`index.html`) hosting dual-device simulator (`Milo Quest` for child, `Trạm Thấu Hiểu` for parent), featuring Web Audio, responsive mockups, interactive task cockpit, visual timer, and state sync bus.
2. **Backend**: FastAPI server (`src/api/server.py`) providing REST endpoints for mock login, curriculum, task decomposition (Gemini API integration), task dispatch, and WebSocket state sync.
3. **ADHD Diagnostic Engine**: 9-question clinical survey (`data/surveys/adhd_parent_survey.json`) and scoring service (`src/adhd_scoring/scoring_service.py`) computing cognitive profile vectors.
4. **Schemas & Curriculum**: Micro-task schema (`schemas/micro_task_schema.json`) and 25 GDPT 2018 benchmark exercises (`data/curriculum/`).
5. **Documentation & Reports**: Consolidated domain research in `docs/research/`, benchmark reports in `docs/reports/`, test infra in `docs/infra/`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Folder Structure Clean-Up | Relocate 4 research docs to `docs/research/`, benchmark docs to `docs/reports/`, infra docs to `docs/infra/`; preserve `scratch/prompt_experiment_report.md` | M1 | R6 |
| 2 | Path & Runner Updates | Update `benchmark/run_benchmark.py` and `.gitignore` to reflect new paths; verify zero broken imports | M1 | R6 |
| 3 | Parent Diagnostic Survey Flow | Interactive 9-question modal from `adhd_parent_survey.json` with Likert 0-3 options, complete/skip actions | M2 | R4 |
| 4 | Cognitive Profile Integration | Compute clinical dimensions (EF, AS, RSD, CDI) in JS, persist to `appState.cognitiveProfile`, render top-bar summary badge | M2 | R4 |
| 5 | Real Micro-Task AI Decomposer | Connect `parentRunAiBreakdown()` to `/api/tasks/decompose` with cognitive profile input and schema validation | M3 | R2 |
| 6 | Content-Aware Offline Fallback | Graceful offline decomposition matching subject (math/reading) and grade, generating valid micro-tasks | M3 | R2 |
| 7 | Strict Answer Validation | Validate child text input against `expected_answer` in `handleChildTextInputSubmit()`, show gentle RSD-safe hints on wrong input | M3 | R3 |
| 8 | Contextual Token Highlighting | Replace standalone chips with tokenized sentence segments, require selection of all target entities before completion | M3 | R3 |
| 9 | Checkbox Layout & Dual-Channel Ergonomics | Fix catalog card flex layout (`shrink-0`, `min-w-0`) to eliminate checkbox clipping on 370px inner phone mockup | M4 | R1 |
| 10 | Viewport Scrolling & Sticky Batch Action | Eliminate scroll trapping, make "GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!" batch action consistently visible and clickable | M4 | R1 |
| 11 | WCAG AA Color Contrast Compliance | Update `.btn-disabled` to `#475569` (6:1), darken clue text, update inactive filter chips to satisfy $\ge 4.5:1$ ratio | M4 | R1 |
| 12 | Visual Identity: Routines vs Study | Distinguish "Đảo sinh hoạt" (warm calming amber theme) from "Đảo bài tập" (cool focus teal theme) on roadmap & cockpit | M4 | R5 |
| 13 | Automated Regression Tests | Add comprehensive unit/integration tests verifying answer rejection, survey scoring, schema compliance, and path integrity | M5 | R7 |
| 14 | 0 Regressions in Full Test Suite | Run `tests/runner.py` (330+ tests) and Node.js adversarial tests ensuring 100% green exit code 0 | M5 | R7 |
| 15 | End-to-End User Documentation | Deliver clear walkthrough guide detailing system startup, survey usage, task decomposition, and child interaction | M5 | R7 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Folder Clean-Up & Path Integrity (R6) | Move loose root files to `docs/research/`, `docs/reports/`, `docs/infra/`; update `run_benchmark.py` & `.gitignore` | None | DONE |
| M2 | Parent Diagnostic Survey & Cognitive Profile (R4) | Add survey modal in `index.html`, scoring formulas, `cognitiveProfile` state & top-bar badge | M1 | DONE |
| M3 | AI Decomposer & Child Interactive Stages (R2, R3) | Real decomposition with offline fallback, strict answer validation, contextual highlight tokens | M2 | DONE |
| M4 | UI Ergonomics, Accessibility & Visual Themes (R1, R5) | Fix checkbox clipping, sticky batch dispatch, WCAG AA contrast, warm routine vs cool study themes | M3 | DONE |
| M5 | Automated Tests & User Documentation (R7) | Add regression tests for scoring, validation, schema, paths; verify full runner; write user guide | M4 | DONE |

## Code Layout
- `docs/research/`: Domain literature and pedagogical research documents.
- `docs/reports/`: Benchmark reports and summaries.
- `docs/infra/`: Testing infrastructure and test readiness specifications.
- `scratch/`: Prompt experiments and audit scripts (strictly preserves `prompt_experiment_report.md`).
- `data/surveys/`: Clinical survey definitions (`adhd_parent_survey.json`).
- `data/curriculum/`: GDPT 2018 benchmark exercises.
- `schemas/`: Micro-task JSON schemas.
- `src/adhd_scoring/`: Python scoring service.
- `src/api/`: FastAPI server and routers.
- `index.html`: Unified dual-app client.
- `tests/`: Automated Python test suites (`tests/runner.py`, `tests/e2e/`, `tests/adversarial/`).
