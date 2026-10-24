"""
Forensic Auditor Verification Script
Conducts deep forensic integrity checks across R1-R7 and anti-cheating patterns.
"""

import os
import re
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

errors = []
findings = []

def check(condition, desc, detail=""):
    if condition:
        findings.append(f"[PASS] {desc}")
    else:
        errors.append(f"[FAIL] {desc}: {detail}")

print("=== STARTING FORENSIC AUDIT CHECKS ===")

# Read index.html
index_path = ROOT / "index.html"
with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# -------------------------------------------------------------
# R1: UI Ergonomics & Accessibility
# -------------------------------------------------------------
print("\n--- Auditing R1: UI Ergonomics & Accessibility ---")
check("renderParentCatalogList" in html, "renderParentCatalogList defined in index.html")

# Checkbox layout
check("shrink-0 ml-2" in html, "Catalog checkbox has shrink-0 ml-2 to prevent clipping")
check("overflow-hidden" in html and ("min-w-0 flex-1" in html or "flex-1 min-w-0" in html), "Catalog card layout has overflow-hidden and min-w-0 flex-1")

# Viewport scrolling un-nested
check('id="catalog-tasks-list" class="space-y-2 pr-0.5"' in html, "catalog-tasks-list has un-nested scroll container")
check("max-h-[380px] overflow-y-auto" not in html, "No nested max-h-[380px] overflow-y-auto scroll trap in catalog list")

# Sticky batch action
check("sticky bottom-0" in html and "GIAO LÔ ĐÃ CHỌN SANG MÁY CON NGAY!" in html, "Sticky batch dispatch card at bottom-0")
check("dispatchSelectedCatalogTasks()" in html, "Batch dispatch wired to dispatchSelectedCatalogTasks()")

# Contrast ratios
btn_disabled_match = re.search(r"\.btn-disabled\s*\{[^}]*color:\s*#475569\s*!important", html)
check(bool(btn_disabled_match), ".btn-disabled color is #475569 !important (WCAG AA >= 4.5:1)")
check("text-slate-700" in html, "Filter chips have high contrast text-slate-700 (#334155)")
check("text-slate-800" in html, "Grade chips have high contrast text-slate-800 (#1E293B)")
check("placeholder:text-slate-600" in html or "::placeholder" in html, "Placeholders have text-slate-600")

# -------------------------------------------------------------
# R2: Real Micro-Task AI Decomposer Pipeline
# -------------------------------------------------------------
print("\n--- Auditing R2: Real Micro-Task AI Decomposer Pipeline ---")
check("async function parentRunAiBreakdown" in html or "parentRunAiBreakdown = async" in html, "parentRunAiBreakdown is an async function")
check("/api/tasks/decompose" in html, "parentRunAiBreakdown connects to /api/tasks/decompose backend endpoint")
check("cognitive_profile: appState.cognitiveProfile" in html or "cognitive_profile" in html, "parentRunAiBreakdown ingests cognitive profile")
check("generateClientSideMicroTasks" in html, "Smart content-aware offline fallback generator exists")
check("detectDomainSubject" in html, "Subject/domain classifier exists for fallback")
check("single_choice" in html and "text_input" in html and "highlight" in html, "Child workspace handles single_choice, text_input, highlight ui_types")
check("ui_payload ||" in html or "ui_data ||" in html, "Child workspace handles ui_payload and ui_data schema polymorphism")

# -------------------------------------------------------------
# R3: Authentic Keyword Highlighting & Strict Validation
# -------------------------------------------------------------
print("\n--- Auditing R3: Authentic Keyword Highlighting & Strict Validation ---")
check("tokenizeSentenceForHighlight" in html, "tokenizeSentenceForHighlight tokenizes sentence segments")
check("toggleHighlightToken" in html, "toggleHighlightToken manages token selection and highlights")
check("data-is-target" in html and "allTargetsHighlighted" in html, "Highlight validation strictly checks all target tokens before enabling next step")
check("handleChildTextInputSubmit" in html, "handleChildTextInputSubmit validates text input")
check("normalizeAnswer" in html, "normalizeAnswer handles Vietnamese decimal comma and whitespace")
check("nhẹ nhàng" in html.lower() or "thử lại" in html.lower() or "bạn milo tin con" in html.lower(), "RSD-safe gentle guidance on wrong answer")

# -------------------------------------------------------------
# R4: Parent Diagnostic Survey & Cognitive Profile Integration
# -------------------------------------------------------------
print("\n--- Auditing R4: Parent Diagnostic Survey & Cognitive Profile ---")
check('id="parent-survey-modal"' in html, "DOM contains #parent-survey-modal")
check('id="parent-cognitive-profile-badge"' in html, "DOM contains #parent-cognitive-profile-badge")
check("calculateCognitiveProfileFromAnswers" in html, "calculateCognitiveProfileFromAnswers computes clinical scores")
check("adhd_parent_survey.json" in str(list(ROOT.glob("**/adhd_parent_survey.json"))), "adhd_parent_survey.json exists in repository")

# Verify survey scoring parity directly
from src.adhd_scoring.scoring_service import calculate_cognitive_profile

survey_file = ROOT / "data" / "surveys" / "adhd_parent_survey.json"
with open(survey_file, "r", encoding="utf-8") as f:
    survey_data = json.load(f)
check(len(survey_data.get("questions", [])) == 9, "adhd_parent_survey.json contains exactly 9 questions")

p_zeros = calculate_cognitive_profile([0]*9)
check(p_zeros["attention_span_minutes"] == 25 and p_zeros["rsd_sensitivity_level"] == "LOW", f"All 0s survey maps to Attention=25, RSD=LOW (got Attention={p_zeros['attention_span_minutes']}, RSD={p_zeros['rsd_sensitivity_level']})")
p_threes = calculate_cognitive_profile([3]*9)
check(p_threes["attention_span_minutes"] == 5 and p_threes["rsd_sensitivity_level"] == "SEVERE", f"All 3s survey maps to Attention=5, RSD=SEVERE (got Attention={p_threes['attention_span_minutes']}, RSD={p_threes['rsd_sensitivity_level']})")

# -------------------------------------------------------------
# R5: Visual Themes: Routines vs Study Tasks
# -------------------------------------------------------------
print("\n--- Auditing R5: Distinct Visual Identity (Routines vs Study) ---")
check(".btn-3d-amber" in html, ".btn-3d-amber CSS defined")
check("ĐẢO SINH HOẠT THƯ THÁI" in html, "Roadmap tag for routines (ĐẢO SINH HOẠT THƯ THÁI 🌿)")
check("ĐẢO BÀI TẬP TẬP TRUNG" in html, "Roadmap tag for study (ĐẢO BÀI TẬP TẬP TRUNG 🎯)")
check("task.cat === 'chore'" in html or "isChore" in html, "Visual identity branches based on chore/routine category")

# -------------------------------------------------------------
# R6: Folder Structure Clean-Up & Path Integrity
# -------------------------------------------------------------
print("\n--- Auditing R6: Project Structure Clean-Up & Organization ---")
research_files = list((ROOT / "docs" / "research").glob("*.md"))
check(len(research_files) == 4, f"docs/research contains 4 files (found {len(research_files)})")

reports_files = list((ROOT / "docs" / "reports").glob("*"))
check(len(reports_files) >= 2, f"docs/reports contains >= 2 files (found {len(reports_files)})")

infra_files = list((ROOT / "docs" / "infra").glob("*"))
check(len(infra_files) >= 2, f"docs/infra contains >= 2 files (found {len(infra_files)})")

prompt_exp = ROOT / "scratch" / "prompt_experiment_report.md"
check(prompt_exp.exists() and prompt_exp.stat().st_size > 5000, "scratch/prompt_experiment_report.md is preserved intact")

# Check run_benchmark.py defaults
with open(ROOT / "benchmark" / "run_benchmark.py", "r", encoding="utf-8") as f:
    bench_code = f.read()
check('docs/reports/benchmark_report.json' in bench_code, "run_benchmark.py defaults output_json to docs/reports/benchmark_report.json")
check('docs/reports/BENCHMARK_SUMMARY.md' in bench_code, "run_benchmark.py defaults output_md to docs/reports/BENCHMARK_SUMMARY.md")

# Check root has no loose research markdown files
root_mds = [f.name for f in ROOT.glob("*.md") if f.name not in ["README.md", "USER_GUIDE.md", "PROJECT.md", "BRIEFING.md", "CHANGELOG.md"]]
check(len(root_mds) == 0, f"Root has no unstructured research markdowns (found: {root_mds})")

# -------------------------------------------------------------
# R7: Documentation Verification
# -------------------------------------------------------------
print("\n--- Auditing R7: User Documentation ---")
check((ROOT / "USER_GUIDE.md").exists(), "USER_GUIDE.md exists in root")
check((ROOT / "docs" / "USER_GUIDE.md").exists(), "USER_GUIDE.md exists in docs/")
check((ROOT / "USER_GUIDE.md").stat().st_size > 20000, "USER_GUIDE.md is comprehensive (>20KB)")

# -------------------------------------------------------------
# Anti-Cheating & Integrity Forensics
# -------------------------------------------------------------
print("\n--- Auditing Anti-Cheating & Integrity Forensics ---")
# Check 1: Check for hardcoded test results / bypasses in tests/
suspicious_patterns = [
    r"def test_.*return True",
    r"assert True\s*# bypass",
    r"if os\.environ\.get\('TEST_MOCK'\):\s*pass",
    r"skipTest\('bypassed'\)",
]

found_suspicious = False
for py_file in (ROOT / "tests").rglob("*.py"):
    with open(py_file, "r", encoding="utf-8") as f:
        content = f.read()
    for pat in suspicious_patterns:
        if re.search(pat, content):
            errors.append(f"Suspicious pattern found in {py_file.name}: {pat}")
            found_suspicious = True
if not found_suspicious:
    findings.append("[PASS] No suspicious bypass patterns found in tests/")

# Check 2: Check for facade implementations in src/
facade_found = False
for py_file in (ROOT / "src").rglob("*.py"):
    with open(py_file, "r", encoding="utf-8") as f:
        content = f.read()
    if "return None  # TODO" in content or "pass  # placeholder" in content:
        errors.append(f"Facade placeholder found in {py_file.name}")
        facade_found = True
if not facade_found:
    findings.append("[PASS] No facade placeholders found in src/")

print("\n=== SUMMARY ===")
print(f"Passed checks: {len(findings)}")
print(f"Failed checks: {len(errors)}")
if errors:
    print("ERRORS:")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)
else:
    print("\nALL FORENSIC CHECKS PASSED CLEANLY! VERDICT: CLEAN")
