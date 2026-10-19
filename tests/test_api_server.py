"""
Test Suite for ADHD Micro-Task FastAPI Server & WebSocket Sync.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys
import unittest

# Setup sys.path
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient
from src.api.server import app, startup_event


class TestAPIServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Trigger startup event to load datasets
        import asyncio
        asyncio.run(startup_event())
        cls.client = TestClient(app)

    def test_01_health_check(self):
        """Test GET /api/health returns 200 and accurate system metadata."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertGreater(data["total_curriculum_exercises"], 0)
        self.assertGreater(data["total_pre_decomposed_routines"], 0)
        print(" test_01_health_check PASSED")

    def test_02_mock_login(self):
        """Test POST /api/auth/mock-login for parent and kid roles."""
        # Parent login
        p_res = self.client.post("/api/auth/mock-login", json={"role": "parent", "username": "me_lan"})
        self.assertEqual(p_res.status_code, 200)
        p_data = p_res.json()
        self.assertEqual(p_data["role"], "parent")
        self.assertIn("mock_token_parent", p_data["access_token"])
        self.assertIsNotNone(p_data["active_kid_profile"])

        # Kid login
        k_res = self.client.post("/api/auth/mock-login", json={"role": "kid", "kid_id": "kid_milo_01"})
        self.assertEqual(k_res.status_code, 200)
        k_data = k_res.json()
        self.assertEqual(k_data["role"], "kid")
        self.assertIn("mock_token_kid", k_data["access_token"])
        self.assertIsNotNone(k_data["kid_stats"])
        self.assertGreater(k_data["kid_stats"]["dopamine_points"], 0)
        print(" test_02_mock_login PASSED")

    def test_03_curriculum_recommended(self):
        """Test GET /api/curriculum/recommended with and without filters."""
        # Unfiltered
        res_all = self.client.get("/api/curriculum/recommended")
        self.assertEqual(res_all.status_code, 200)
        data_all = res_all.json()
        self.assertGreater(data_all["total_count"], 20)
        self.assertGreater(len(data_all["routine_tasks"]), 0)

        # Filter by grade=3
        res_g3 = self.client.get("/api/curriculum/recommended?grade=3")
        self.assertEqual(res_g3.status_code, 200)
        data_g3 = res_g3.json()
        for ex in data_g3["exercises"]:
            self.assertEqual(ex["grade"], 3)

        # Filter by subject=toan
        res_math = self.client.get("/api/curriculum/recommended?subject=toan")
        self.assertEqual(res_math.status_code, 200)
        data_math = res_math.json()
        self.assertGreater(len(data_math["exercises"]), 0)
        for ex in data_math["exercises"]:
            self.assertIn(ex["subject"].lower(), ["toán", "toan"])
        print(" test_03_curriculum_recommended PASSED")

    def test_04_tasks_decompose_curriculum(self):
        """Test POST /api/tasks/decompose with known curriculum exercise ID."""
        req_payload = {
            "exercise_id": "G1_MATH_01",
            "child_cognitive_profile": {
                "cognitive_profile_vector": {
                    "attention_span_minutes": 8,
                    "recommended_micro_task_duration_sec": 90,
                    "working_memory_capacity": 2,
                    "rsd_sensitivity_level": "HIGH",
                    "scaffolding_level": "MODERATE",
                }
            }
        }
        res = self.client.post("/api/tasks/decompose", json=req_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check required schema keys
        self.assertIn("session_id", data)
        self.assertIn("task_metadata", data)
        self.assertIn("micro_tasks", data)
        self.assertIn("final_summary", data)

        micro_tasks = data["micro_tasks"]
        self.assertGreater(len(micro_tasks), 0)
        for step in micro_tasks:
            self.assertIn("step_id", step)
            self.assertIn("action_verb", step)
            self.assertIn("duration_sec", step)
            self.assertIn("atomic_instruction", step)
            self.assertIn("success_criteria", step)
            self.assertIn("immediate_reinforcer", step)
        print(" test_04_tasks_decompose_curriculum PASSED")

    def test_05_tasks_decompose_adhoc_text(self):
        """Test POST /api/tasks/decompose with raw problem text."""
        req_payload = {
            "raw_text": "Bé An có 6 bông hoa đỏ và 4 bông hoa vàng. Hỏi bé An có tất cả bao nhiêu bông hoa?",
            "grade": 1,
            "subject": "toan",
            "category": "Toán lời văn cộng",
        }
        res = self.client.post("/api/tasks/decompose", json=req_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("session_id", data)
        self.assertIn("micro_tasks", data)
        self.assertGreater(len(data["micro_tasks"]), 0)
        print(" test_05_tasks_decompose_adhoc_text PASSED")

    def test_06_tasks_dispatch(self):
        """Test POST /api/tasks/dispatch generates island roadmap stations."""
        req_payload = {
            "kid_id": "kid_milo_01",
            "family_room_id": "family_test_room",
            "task_ids": ["G3_MATH_11", "ROUTINE_01_CLEAN_DESK"],
            "island_theme": "Đảo Không Gian Kỳ Thú (Galaxy Island)",
        }
        res = self.client.post("/api/tasks/dispatch", json=req_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["kid_id"], "kid_milo_01")
        self.assertEqual(data["island_name"], "Đảo Không Gian Kỳ Thú (Galaxy Island)")
        self.assertEqual(data["total_stations"], 2)
        self.assertEqual(len(data["stations"]), 2)
        self.assertEqual(data["stations"][0]["status"], "active")
        self.assertEqual(data["stations"][1]["status"], "locked")
        self.assertGreater(data["total_dopamine_points_available"], 0)
        print(" test_06_tasks_dispatch PASSED")

    def test_07_websocket_sync(self):
        """Test WebSocket /ws/sync real-time handshake, ping/pong, and message exchange."""
        with self.client.websocket_connect("/ws/sync?role=kid&client_id=kid_test_device&room_id=room_dual_01") as ws_kid:
            # 1. Connection established
            init_msg = json.loads(ws_kid.receive_text())
            self.assertEqual(init_msg["event_type"], "CONNECTION_ESTABLISHED")
            self.assertEqual(init_msg["role"], "kid")

            # 2. Ping-pong
            ws_kid.send_text(json.dumps({"event_type": "PING"}))
            pong_msg = json.loads(ws_kid.receive_text())
            self.assertEqual(pong_msg["event_type"], "PONG")

            # 3. Connect parent device in same room
            with self.client.websocket_connect("/ws/sync?role=parent&client_id=parent_test_device&room_id=room_dual_01") as ws_parent:
                p_init = json.loads(ws_parent.receive_text())
                self.assertEqual(p_init["role"], "parent")

                # Kid sends step completion
                ws_kid.send_text(json.dumps({
                    "event_type": "KID_STEP_COMPLETED",
                    "step_id": 1,
                    "dopamine_points": 35
                }))

                # Parent receives notification
                p_recv = json.loads(ws_parent.receive_text())
                self.assertEqual(p_recv["event_type"], "PARENT_NOTIFICATION_STEP_DONE")
                self.assertEqual(p_recv["step_id"], 1)
                self.assertEqual(p_recv["points_earned"], 35)

                # Parent sends cheer to kid
                ws_parent.send_text(json.dumps({
                    "event_type": "PARENT_CHEER",
                    "cheer_text": "Mẹ tự hào về con lắm!",
                    "sticker": "milo_thumbs_up"
                }))

                # Kid receives cheer
                k_recv = json.loads(ws_kid.receive_text())
                self.assertEqual(k_recv["event_type"], "KID_RECEIVE_CHEER")
                self.assertEqual(k_recv["cheer_text"], "Mẹ tự hào về con lắm!")
                self.assertEqual(k_recv["sticker"], "milo_thumbs_up")

        print(" test_07_websocket_sync PASSED")


if __name__ == "__main__":
    unittest.main()
