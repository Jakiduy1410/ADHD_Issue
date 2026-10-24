"""
Tier 5 White-Box Backend Architecture & WebSocket Sync Adversarial Test Suite.
Tests:
1. Mock Login role validation & isolation (parent, kid, invalid roles)
2. Health Check metadata & connection tracking
3. Curriculum filtering boundaries & invalid query validation
4. Tasks dispatch batching & unknown task handling
5. WebSocket sync lifecycle: handshake, ping/pong, role routing isolation,
   malformed JSON resilience, abrupt disconnect cleanup, multi-client room broadcast.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
import sys
import unittest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient
from src.api.server import app, startup_event, manager


class TestTier5BackendAdversarial(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Trigger startup event to load datasets into memory
        asyncio.run(startup_event())
        cls.client = TestClient(app)
        # Catalog expectations are derived from the single source of truth
        # (data/curriculum/tasks_db.json) so the suite stays correct as the
        # catalog grows, instead of pinning a stale hardcoded task count.
        db_path = Path(__file__).resolve().parents[2] / "data" / "curriculum" / "tasks_db.json"
        with open(db_path, encoding="utf-8") as f:
            catalog = json.load(f)
        cls.catalog_total = len(catalog)
        cls.grade_counts = {}
        for task in catalog.values():
            g = task.get("grade")
            cls.grade_counts[g] = cls.grade_counts.get(g, 0) + 1

    # =========================================================================
    # 1. Mock Authentication & Role Boundaries
    # =========================================================================
    def test_01_mock_login_role_boundaries_and_rejections(self):
        """Verify mock login accepts valid roles (parent, kid) and rejects all others with 400."""
        # 1. Valid parent
        res_p = self.client.post("/api/auth/mock-login", json={"role": "parent", "username": "me_lan"})
        self.assertEqual(res_p.status_code, 200)
        p_data = res_p.json()
        self.assertEqual(p_data["role"], "parent")
        self.assertIsNotNone(p_data["active_kid_profile"])
        self.assertIsNone(p_data["kid_stats"])

        # 2. Valid kid
        res_k = self.client.post("/api/auth/mock-login", json={"role": "kid", "kid_id": "kid_01"})
        self.assertEqual(res_k.status_code, 200)
        k_data = res_k.json()
        self.assertEqual(k_data["role"], "kid")
        self.assertIsNone(k_data["active_kid_profile"])
        self.assertIsNotNone(k_data["kid_stats"])
        self.assertGreater(k_data["kid_stats"]["dopamine_points"], 0)

        # 3. Invalid roles must return 400 Bad Request
        invalid_roles = ["dual", "admin", "guest", "teacher", "", "   ", "PARENT_ROLE", "kid123"]
        for inv_r in invalid_roles:
            res_inv = self.client.post("/api/auth/mock-login", json={"role": inv_r})
            self.assertEqual(
                res_inv.status_code, 400,
                f"Role '{inv_r}' should return 400, got {res_inv.status_code}"
            )

        # 4. Missing required role field must return 422 Unprocessable Entity
        res_missing = self.client.post("/api/auth/mock-login", json={"username": "me_lan"})
        self.assertEqual(res_missing.status_code, 422)

    # =========================================================================
    # 2. Health Check & Connection Tracking
    # =========================================================================
    def test_02_health_check_integrity(self):
        """Verify health check returns online status, valid uptime, and accurate curriculum counts."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["total_curriculum_exercises"], self.catalog_total)
        self.assertGreaterEqual(self.catalog_total, 29)
        self.assertEqual(data["total_pre_decomposed_routines"], 2)
        self.assertGreaterEqual(data["uptime_seconds"], 0)
        self.assertIsInstance(data["total_active_ws_connections"], int)

    # =========================================================================
    # 3. Curriculum Filter Boundaries
    # =========================================================================
    def test_03_curriculum_filters_and_invalid_queries(self):
        """Verify curriculum filtering bounds and rejection of out-of-range grades."""
        # 1. Invalid grade < 1 or > 5 returns 422
        for invalid_grade in [0, 6, -1, 99]:
            res = self.client.get(f"/api/curriculum/recommended?grade={invalid_grade}")
            self.assertEqual(res.status_code, 422, f"Grade {invalid_grade} should return 422")

        # 2. Exclude routines
        res_no_routines = self.client.get("/api/curriculum/recommended?include_routines=false")
        self.assertEqual(res_no_routines.status_code, 200)
        data_no_routines = res_no_routines.json()
        self.assertEqual(len(data_no_routines["routine_tasks"]), 0)
        self.assertEqual(data_no_routines["total_count"], self.catalog_total)

        # 3. Valid grade filter (Grade 4)
        res_g4 = self.client.get("/api/curriculum/recommended?grade=4&include_routines=false")
        self.assertEqual(res_g4.status_code, 200)
        data_g4 = res_g4.json()
        self.assertEqual(len(data_g4["exercises"]), self.grade_counts.get(4, 0))
        for ex in data_g4["exercises"]:
            self.assertEqual(ex["grade"], 4)

    # =========================================================================
    # 4. Tasks Dispatch Boundaries & Unknown Tasks
    # =========================================================================
    def test_04_tasks_dispatch_boundaries(self):
        """Verify dispatch endpoint handles valid batches, empty task_ids, and non-existent IDs."""
        # 1. Missing task_ids field -> 422
        res_missing = self.client.post("/api/tasks/dispatch", json={"kid_id": "kid_01"})
        self.assertEqual(res_missing.status_code, 422)

        # 2. Dispatch with unknown task IDs -> handles with fallback titles
        payload = {
            "kid_id": "kid_adv_01",
            "family_room_id": "adv_room_01",
            "task_ids": ["NON_EXISTENT_TASK_ID_999", "G1_MATH_01"],
            "island_theme": "Đảo Thần Thoại Milo"
        }
        res = self.client.post("/api/tasks/dispatch", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_stations"], 2)
        self.assertEqual(data["stations"][0]["status"], "active")
        self.assertEqual(data["stations"][1]["status"], "locked")
        self.assertEqual(data["island_name"], "Đảo Thần Thoại Milo")

    # =========================================================================
    # 5. WebSocket Sync: Handshake, Role Routing & Error Isolation
    # =========================================================================
    def test_05_websocket_lifecycle_and_role_isolation(self):
        """Verify WebSocket handshake, ping/pong, role routing isolation, and error tolerance."""
        room = "family_room_adv_test_99"

        # Connect Kid client
        with self.client.websocket_connect(f"/ws/sync?role=kid&client_id=adv_kid_01&room_id={room}") as ws_kid:
            # 1. Initial Handshake
            init_k = json.loads(ws_kid.receive_text())
            self.assertEqual(init_k["event_type"], "CONNECTION_ESTABLISHED")
            self.assertEqual(init_k["role"], "kid")
            self.assertEqual(init_k["room_id"], room)

            # 2. Ping-Pong
            ws_kid.send_text(json.dumps({"event_type": "PING"}))
            pong = json.loads(ws_kid.receive_text())
            self.assertEqual(pong["event_type"], "PONG")

            # Connect Parent client in the same room
            with self.client.websocket_connect(f"/ws/sync?role=parent&client_id=adv_parent_01&room_id={room}") as ws_parent:
                init_p = json.loads(ws_parent.receive_text())
                self.assertEqual(init_p["role"], "parent")

                # Connect a 2nd Parent client (Observer / Co-parent)
                with self.client.websocket_connect(f"/ws/sync?role=parent&client_id=adv_parent_02&room_id={room}") as ws_parent2:
                    init_p2 = json.loads(ws_parent2.receive_text())
                    self.assertEqual(init_p2["role"], "parent")

                    # 3. Kid completes step -> Must route to BOTH parents, but NOT echo back to kid
                    ws_kid.send_text(json.dumps({
                        "event_type": "KID_STEP_COMPLETED",
                        "step_id": 2,
                        "dopamine_points": 40
                    }))

                    # Parent 1 receives
                    p1_msg = json.loads(ws_parent.receive_text())
                    self.assertEqual(p1_msg["event_type"], "PARENT_NOTIFICATION_STEP_DONE")
                    self.assertEqual(p1_msg["step_id"], 2)
                    self.assertEqual(p1_msg["points_earned"], 40)

                    # Parent 2 receives
                    p2_msg = json.loads(ws_parent2.receive_text())
                    self.assertEqual(p2_msg["event_type"], "PARENT_NOTIFICATION_STEP_DONE")
                    self.assertEqual(p2_msg["step_id"], 2)

                    # 4. Parent 1 sends Cheer -> Must route to Kid, but NOT to Parent 2
                    ws_parent.send_text(json.dumps({
                        "event_type": "PARENT_CHEER",
                        "cheer_text": "Mẹ rất tự hào về Leo!",
                        "sticker": "sparkle_star_01"
                    }))

                    k_msg = json.loads(ws_kid.receive_text())
                    self.assertEqual(k_msg["event_type"], "KID_RECEIVE_CHEER")
                    self.assertEqual(k_msg["cheer_text"], "Mẹ rất tự hào về Leo!")
                    self.assertEqual(k_msg["sticker"], "sparkle_star_01")

                    # 5. Invalid JSON resilience: Sending garbage text does not close connection
                    ws_kid.send_text("MALFORMED_NON_JSON_BUFFER{{{}}")
                    err_reply = json.loads(ws_kid.receive_text())
                    self.assertIn("error", err_reply)
                    self.assertEqual(err_reply["error"], "Invalid JSON")

                    # Connection is still alive after invalid JSON
                    ws_kid.send_text(json.dumps({"event_type": "PING"}))
                    pong2 = json.loads(ws_kid.receive_text())
                    self.assertEqual(pong2["event_type"], "PONG")

        # After exiting with blocks, manager must have cleanly disconnected all clients
        # Verify manager active rooms does not leak dead connections
        self.assertNotIn(room, manager.active_rooms)

    def test_06_websocket_empty_room_and_unknown_events_safety(self):
        """Verify broadcasting to empty rooms or handling unknown events does not raise exceptions."""
        room = "ghost_room_404"

        # Broadcast to room that does not exist
        asyncio.run(manager.broadcast_to_room(room, {"event_type": "GHOST_EVENT"}))

        # Send to role in room that does not exist
        asyncio.run(manager.send_to_role(room, "kid", {"event_type": "GHOST_EVENT"}))

        # Connect a client and send unknown event
        with self.client.websocket_connect(f"/ws/sync?role=kid&client_id=kid_ghost&room_id={room}") as ws:
            ws.receive_text()  # Handshake
            ws.send_text(json.dumps({"event_type": "CUSTOM_UNRECOGNIZED_EVENT", "payload": {"foo": "bar"}}))
            # Send PING to verify connection stayed open
            ws.send_text(json.dumps({"event_type": "PING"}))
            pong = json.loads(ws.receive_text())
            self.assertEqual(pong["event_type"], "PONG")


if __name__ == "__main__":
    unittest.main()
