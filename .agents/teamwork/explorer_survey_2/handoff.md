# HANDOFF REPORT: ADHD UI/UX & GAMIFICATION SPECIFICATION SURVEY
## Explorer: explorer_survey_2 (ADHD UI & Gamification Explorer)
## Date: 2026-10-18T05:48:00Z
## Recipient: orchestrator_2 (Conversation ID: f373a3a8-9bab-4128-a177-2c52ad25b640)

---

### 1. OBSERVATION

I directly inspected and verified the following artifacts, files, and system components in the repository:

1. **User Objective & Requirements (`.agents/teamwork/ORIGINAL_REQUEST.md`)**:
   - Lines 50–96: Section `## 2026-10-18T05:39:44Z` establishes the Dual-App ADHD Intervention Ecosystem:
     * *R1*: Dual-Device Simulator (2 mobile frames side-by-side or 1-click role toggle, bidirectional real-time sync).
     * *R2*: Parent Assignment Hub with 2 modes (Pre-decomposed bank of 25 GDPT 2018 benchmark tasks + Batch Selection 1-click send, Custom creator with AI decomposition preview & dynamic manual builder, Live Telemetry dashboard, Effort-based praise generator with RSD forbidden words).
     * *R3*: Child Quest & Cockpit (Island Quest Roadmap, Single-Focus Card, Visual Timer disc, tactile Numpad, < 300ms dopamine star burst, Robot Milo 4-4-4 Box Breathing rescue overlay, Treasure Chest unlock & Golden Ticket redemption approval).
     * *R4*: Strict Prompt Guardrail (Never overwrite files in `prompts/`).
   - Lines 86–93: Acceptance criteria requires 60fps web UI at `index.html`, Web Audio API synthesis for click/fanfare without external audio assets, instant profile switching, batch island dispatch without page reload, < 300ms star burst, 4-4-4 breathing with countdown, and real-time Golden Ticket approval.

2. **Existing Implementation Analysis (`index.html` & `generate_app.py`)**:
   - `index.html` Lines 56–81: iPhone 16 Pro mockup shell defined with dimensions `390px` width, `840px` height, `52px` border-radius, `box-shadow` depth, and `.phone-screen` at `44px` border-radius.
   - `index.html` Lines 83–99: Dynamic Island mockup shell (`116px` width, `28px` height, `20px` radius, `z-index: 100`).
   - `index.html` Lines 101–168: Duolingo-style 3D tactile buttons (`.btn-3d-green`, `.btn-3d-yellow`, `.btn-3d-blue`, `.btn-3d-white`) with `border-bottom: 5px solid ...` and active translation `translateY(4px)`.
   - `index.html` Lines 171–184: Conic gradient Visual Timer ring wrapper (`conic-gradient(#58CC02 var(--progress, 100%), #E2E8F0 0%)`), warning state `#FFC800`, paused state `#38BDF8`.
   - `index.html` Lines 185–200: Keyframe animations for `floatMilo` (2.6s cycle) and `breatheCircle` (16s cycle).
   - `index.html` Lines 411–857: Child App structure (`#col-child`) featuring `child-screen-home` (Island Quest with SVG S-curve path, active island, queued island, treasure island), `child-screen-workspace` (Focus Cockpit, segmented trackbar, Visual Timer pill, tactile workspace), `child-modal-soft-pause` (Milo 4-4-4 Box Breathing overlay), `child-modal-celebration`, `child-modal-treasure-ceremony`, and `child-screen-rewards` (Golden Ticket station).
   - `index.html` Lines 863–1388: Parent Hub structure (`#col-parent`) featuring Live Telemetry dashboard (real-time stopwatch, active step progress, pause counter), assignment hub with 2 modes (catalog filter with batch checkboxes vs. custom AI breakdown / manual dynamic builder), Golden Ticket pending approval banner, and AI Parent Coach interactive chat.
   - `index.html` Lines 1403–1513: Web Audio API synthesizer (`initAudio()`, `playSfx(type)`) implementing zero-dependency sound generation:
     * `'tap'`: Sine sweep $450\text{Hz} \to 150\text{Hz}$ in $50\text{ms}$.
     * `'star'`: Triangle wave 3-note arpeggio E5 ($659.25\text{Hz}$), A5 ($880\text{Hz}$), C6 ($1046.5\text{Hz}$) with $60\text{ms}$ stagger and $160\text{ms}$ decay (< $280\text{ms}$ total).
     * `'success'`: Major triad chord C-E-G-C ($523.25, 659.25, 783.99, 1046.5\text{Hz}$).
     * `'breathe'`: C4 ($261.63\text{Hz}$) warm sine wave with 0.5s attack, 2.0s decay.
     * `'bell'`: Sine sweep $880\text{Hz} \to 1318.51\text{Hz}$ in $450\text{ms}$.
   - `index.html` Lines 1519–1754: Current `taskDatabase` contains only 12 hardcoded tasks (4 math, 2 viet, 2 eng, 4 chore).
   - `index.html` Lines 2540–2611: `startBoxBreathing()` implements 4-second stages (0: Inhale, 1: Hold, 2: Exhale, 3: Rest) over 3 cycles, updating orb scaling (`scale-125` vs `scale-90`) and textual guidance.
   - `index.html` Lines 2617–2649: `childRedeemTicket()` deducts stars, disables button, dispatches banner to parent.
   - `index.html` Lines 2766–2785: `dispatchSelectedCatalogTasks()` converts selected tasks into `childRoadmap` and calls `renderChildIslandRoadmap()`.

3. **Standardized Curriculum Benchmark (`data/curriculum/grade_1_to_5_benchmark.json`)**:
   - Contains exactly 25 benchmark exercises conforming to Vietnam GDPT 2018 (Grades 1 to 5, 5 exercises per grade, covering Math, Vietnamese reading comprehension, Multiple Choice, and Elementary English).
   - Each item includes `id`, `grade`, `subject`, `category`, `topic`, `difficulty`, `original_text`, `ground_truth_steps`, `final_answer`, and `adhd_scaffolding_notes`.

4. **Micro-Task Schema (`schemas/micro_task_schema.json`)**:
   - Lines 158–171: Enumerates valid `ui_type` values: `single_choice`, `multiple_choice`, `text_input`, `drag_drop`, `audio_listen`, `highlight`, `checkbox`, `order_sequencing`.
   - Lines 308–344: `immediate_reinforcer` requires `visual_asset` (e.g., `sparkle_star_01`, `particle_burst_gold`), `audio_cue` (e.g., `positive_bell_c6`, `sparkle_ting_short`), and `dopamine_points` (10–100).
   - Duration strictly constrained to $60\text{s} \le \text{duration\_sec} \le 300\text{s}$.

5. **Clinical & Neurodivergent Guidelines (`prompts/`)**:
   - `prompts/kid_rsd_calming_milo.md`: Lines 22–45 define 3-phase calming protocol: Deficit Externalization -> Vagal Box Breathing (4-4-4) -> Cognitive Resumption. Lines 47–59 list strict red lines: Never use negative words like "sai rồi", "tại sao không tập trung", never use clinical diagnosis labels ("ADHD", "bệnh lý").
   - `prompts/parent_effort_coach.md`: Lines 38–64 define effort-based praise principles, RSD protection ("Đồng cảm trước - Hạ nhiệt - Đặt giới hạn sau"), and EdTech/Wellness non-medical lexical boundaries. Lines 107–200 provide benchmark scripts for completed, partially completed, and early abandonment sessions.

---

### 2. LOGIC CHAIN

1. **Neurodivergent Design Validation**:
   - Based on *Observation 1 & 5*, children with ADHD suffer from severe Working Memory limitations and Rejection Sensitive Dysphoria (RSD).
   - Therefore, the UI must strictly implement the **Single-Focus Card Principle** (1 screen, 1 step, < 15 words instruction, 1 action verb) to prevent cognitive overload.
   - The Visual Timer Conic Disc with color shifts (Green -> Amber -> Sky Blue on pause) successfully eliminates the anxiety of auditory ticking and numerical countdowns observed in *Observation 2*.

2. **Dopamine Loop & Multi-Sensory Latency**:
   - Based on *Observation 2 & 4*, maintaining momentum requires an FR1 reinforcement schedule with response latency under 300ms.
   - The Web Audio API implementation in `index.html` (lines 1403–1513) generates tactile clicks (50ms) and star fanfare (280ms) entirely in client-side memory using pure Web Audio oscillator nodes (`sine` and `triangle`).
   - Because no external audio files (`.mp3` or `.wav`) are loaded over the network, audio execution is 100% deterministic, zero-latency, and immune to network packet drops or browser CORS restrictions.

3. **Curriculum Integration Gap Identification**:
   - *Observation 3* confirms all 25 GDPT 2018 benchmark tasks exist with full step breakdown and pedagogical notes in `data/curriculum/grade_1_to_5_benchmark.json`.
   - However, *Observation 2* shows `taskDatabase` in `index.html` currently only incorporates 12 hardcoded tasks (4 math, 2 viet, 2 eng, 4 chore).
   - Therefore, for the Parent Pre-Decomposed Bank to fulfill Requirement R2 ("Kho 25 bài tập chuẩn GDPT 2018 Lớp 1-5"), all 25 benchmark items must be mapped and ingested into the parent assignment catalog.

4. **Co-Regulation & Approval Workflow Verification**:
   - *Observation 1 & 2* reveal that the Golden Ticket redemption and batch assignment dispatch rely on real-time state synchronization.
   - In `index.html`, `childRedeemTicket()` and `dispatchSelectedCatalogTasks()` currently mutate shared in-memory `appState` and trigger DOM updates with toast alerts.
   - In a dual-window or multi-tab deployment, this state exchange requires a shared bus (e.g., `BroadcastChannel('milo_quest_sync')` or `localStorage` events) so that actions on one device frame instantaneously reflect on the other without page refresh.

5. **RSD Guardrail Compliance in Parent Hub**:
   - *Observation 5* provides the exact formula for effort-based praise and the forbidden phrase list.
   - The parent interface in `index.html` has praise templates, but lacks an explicit visual warning card displaying the Red Lines (forbidden phrases like "con thông minh lắm", "sao không ráng làm nốt", "sai rồi") alongside neuro-affirming green alternatives. Adding this UI component will directly elevate parent coaching efficacy.

---

### 3. CAVEATS

1. **AudioContext Autoplay Policy**: Modern web browsers (Chrome, Safari, Edge) suspend `AudioContext` until the user performs a first gesture (click/tap) on the page. The `initAudio()` function handles this by resuming the context upon first interaction, but automated headless browser tests without user interaction may log audio suspension warnings.
2. **Device Responsiveness on Mobile Viewports**: While the simulator displays two iPhone 16 Pro frames side-by-side on desktop screens ($\ge 1024\text{px}$), on small mobile screens ($< 768\text{px}$), the frames stack vertically or require the 1-click role switcher (`setViewMode('child')` or `setViewMode('parent')`).
3. **Prompt Files Invariance**: In strict accordance with Requirement R4, no files in `prompts/` were edited, modified, or moved during this survey.

---

### 4. CONCLUSION

1. **Ergonomic & Gamification Architecture is Fully Mapped**:
   - The UI/UX architecture for both Child Quest (Milo Quest) and Parent Hub (Trạm Thấu Hiểu) is fully specified in `survey_report.md`.
   - Key specifications include:
     * **Island Quest Roadmap**: S-curve path with active glowing node, queued nodes, treasure island apex, and floating Milo companion.
     * **Focus Cockpit**: Single-Focus Card, dynamic segmented trackbar beads, Conic Gradient Visual Timer disc (no auditory ticking), tactile Duolingo 3D buttons, and high-contrast Numpad.
     * **Dopamine Burst**: < 300ms star burst animation with Web Audio API synthesis (zero external MP3 assets).
     * **Milo & Box Breathing 4-4-4**: 3-phase RSD calming overlay with expanding/contracting orb and reassuring script without blame words.
     * **Golden Ticket Token Economy**: Treasure opening ceremony, star deduction, and parent approval state machine.
     * **Parent Hub 2 Modes**: Batch assignment from GDPT 2018 bank + Custom creator (AI preview + dynamic manual builder).
     * **Live Telemetry & RSD Praise**: Real-time step progress, elapsed timer, CBT pause counter, and effort praise generator with forbidden words guardrails.
     * **Dual Simulator**: Side-by-side iPhone 16 Pro frames with 1-click role switcher and real-time toast synchronization.

2. **Immediate Implementation Priority for Implementation Track**:
   - **Task 1**: Expand `taskDatabase` in `index.html` from 12 tasks to all **25 GDPT 2018 benchmark tasks** from `data/curriculum/grade_1_to_5_benchmark.json` plus the 4 chore routines.
   - **Task 2**: Implement the `BroadcastChannel('milo_quest_sync')` bus to guarantee zero-latency cross-frame and cross-tab synchronization.
   - **Task 3**: Add the visual **Forbidden Words / RSD Red Lines Warning Card** to Parent Tab 1 (Giám Sát) and Tab 4 (AI Coach).

---

### 5. VERIFICATION METHOD

To independently verify the findings and specifications in this report:

1. **Verify Survey Report Artifact**:
   - Inspect: `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_2\survey_report.md`
   - Check that all 5 sections, UI component tables, Web Audio formulas, CSS keyframes, and the 25 GDPT task matrix are present and complete.

2. **Verify Codebase Artifacts & Audio Synthesis**:
   - Open `index.html` in any modern web browser:
     ```powershell
     Start-Process "c:\Users\ADMIN\Documents\antigravity\calm-bardeen\index.html"
     ```
   - Test Web Audio API: Click the sound icon `🔊` in the top header and click any button to verify zero-latency sound synthesis (`playSfx`).
   - Test Role Toggle: Click `Máy Bé Leo` (Child Fullscreen), `Máy Mẹ Lan` (Parent Fullscreen), and `Song Song (Split)` to verify layout responsiveness.
   - Test Milo 4-4-4 Breathing: In Child Cockpit, click `💡 Milo giúp` and verify the orb scales between 1.25 and 0.90 across the 4-second stages with `playSfx('breathe')`.
   - Test Batch Assignment: In Parent Hub Tab 2, check multiple tasks in the catalog, click `🚀 GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!`, and confirm the Child Quest island roadmap updates dynamically.
   - Test Golden Ticket Approval: In Child Rewards tab, redeem a ticket, verify the pending banner appears in Parent Rewards tab, click `👍 DUYỆT VÉ VÀNG`, and verify celebration notification.

3. **Verify Integrity of Original Prompts**:
   - Confirm `git status` shows 0 modified files in `prompts/`.
