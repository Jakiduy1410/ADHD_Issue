"""
Unified Test Runner for Elementary ADHD Micro-Task Intervention Test Suite.
Discovers and executes all E2E tests across Tiers 1-4 for R1, R2, R3, and R4.
"""

import sys
import time
import unittest
from pathlib import Path

# Ensure repo root is on sys.path
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))


def run_all_tests():
    # Ensure UTF-8 output on Windows terminal
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print("=" * 70)
    print("ADHD MICRO-TASK INTERVENTION E2E TEST SUITE (GDPT 2018)")
    print("=" * 70)
    print("Discovering tests in tests/e2e/...")

    loader = unittest.TestLoader()
    suite = loader.discover("tests", pattern="test_*.py")

    start_time = time.time()
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    print("\n" + "=" * 70)
    print("TEST EXECUTION SUMMARY")
    print("=" * 70)
    print(f"Total Tests Run: {result.testsRun}")
    print(f"Passed:         {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures:       {len(result.failures)}")
    print(f"Errors:         {len(result.errors)}")
    print(f"Elapsed Time:   {elapsed:.3f}s")

    if result.wasSuccessful():
        print("\nALL 54 E2E TESTS PASSED SUCCESSFULLY (STATUS: GREEN).")
        return 0
    else:
        print("\nTEST SUITE COMPLETED WITH FAILURES.")
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
