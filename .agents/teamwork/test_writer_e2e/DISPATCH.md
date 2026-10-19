## 2026-10-18T05:50:20Z
You are test_writer_e2e (E2E Test Writer).
Your working directory is:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\test_writer_e2e

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\PROJECT.md
And read TEST_INFRA.md at:
c:\Users\ADMIN\Documents\antigravity\calm-bardeen\TEST_INFRA.md

YOUR OBJECTIVE:
Implement the complete, requirement-driven, opaque-box E2E test suite in `tests/e2e/test_dual_app_e2e.py` covering Tiers 1-4:
1. Follow the methodology in TEST_INFRA.md (Category-Partition, Boundary Value Analysis, Pairwise Combinations, Real-World Workloads):
   - Tier 1: Feature Coverage (>=5 test cases per feature across all 21 inventoried features).
   - Tier 2: Boundary & Corner Cases (>=5 test cases per feature: empty batch, invalid step, zero stars, max time, corrupted state, rapid clicking, offline fallback).
   - Tier 3: Cross-Feature Interactions (Pairwise combinations of assignment, telemetry, rescue, ticket redemption, sync bus).
   - Tier 4: Real-World Application Scenarios (The 5 scenarios defined in TEST_INFRA.md § Real-World Application Scenarios).
2. The tests must be executable via Python unittest:
   `python -m unittest tests/e2e/test_dual_app_e2e.py`
   Ensure tests validate DOM structure, state bus contracts, curriculum data integrity, Web Audio synthesis functions, 4-4-4 breathing logic, and prompt guardrails.
3. Execute the tests to verify syntax and execution.
4. When test creation and execution are complete, create `TEST_READY.md` at project root `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\TEST_READY.md` following the template in the project pattern.

OUTPUT REQUIREMENTS:
Write your test suite to `tests/e2e/test_dual_app_e2e.py`, write `TEST_READY.md` at project root, and write handoff report to `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\test_writer_e2e\handoff.md`.
Send send_message to parent upon completion.
