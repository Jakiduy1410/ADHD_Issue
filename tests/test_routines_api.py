"""
Unit tests for ADHD Daily Routines API endpoints and Schema validation.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
import sys
import unittest

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient
from src.api.server import app, startup_event


class TestDailyRoutinesAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        asyncio.run(startup_event())
        cls.client = TestClient(app)

    def test_01_get_routines_list(self):
        """Kiểm tra lấy danh sách thói quen nhóm theo timeline slot."""
        res = self.client.get("/api/routines")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_routines"], 4)
        self.assertIn("morning", data["routines_by_slot"])
        self.assertIn("evening", data["routines_by_slot"])
        self.assertIn("night", data["routines_by_slot"])
        print(" test_01_get_routines_list PASSED")

    def test_02_get_routine_detail(self):
        """Kiểm tra lấy chi tiết 1 routine cụ thể."""
        res = self.client.get("/api/routines/routine_clean_desk")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "routine_clean_desk")
        self.assertEqual(data["timeline_slot"], "evening")
        self.assertEqual(data["slot_time"], "19:00")
        self.assertEqual(len(data["steps"]), 4)
        # Bước cuối là bước then chốt có photo_proof
        self.assertTrue(data["steps"][-1]["is_milestone"])
        self.assertEqual(data["steps"][-1]["ui_type"], "photo_proof")
        print(" test_02_get_routine_detail PASSED")

    def test_03_submit_proof(self):
        """Kiểm tra bé nộp minh chứng ảnh chụp."""
        payload = {
            "routine_id": "routine_clean_desk",
            "kid_id": "kid_milo_01",
            "photo_tag": "LEO_DESK_1915.JPG",
            "timestamp": "19:15"
        }
        res = self.client.post("/api/routines/proof", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["routine_id"], "routine_clean_desk")
        print(" test_03_submit_proof PASSED")

    def test_04_parent_heart_cheer(self):
        """Kiểm tra mẹ thả tim khen ngợi."""
        payload = {
            "routine_id": "routine_clean_desk",
            "parent_id": "me_lan",
            "praise_message": "Mẹ rất thích góc bàn sạch bóng của Leo!",
            "bonus_stars": 5
        }
        res = self.client.post("/api/routines/heart", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["bonus_stars"], 5)
        print(" test_04_parent_heart_cheer PASSED")


if __name__ == "__main__":
    unittest.main()
