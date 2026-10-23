"""
Test Suite for Multi-Child Management, 6-Digit Pairing Flow, and SQLite State Persistence.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
import sys
import time
import unittest

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient
from src.api.server import app, startup_event
import src.api.db as db


class TestMultiChildSync(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Trigger startup event to load datasets & SQLite
        asyncio.run(startup_event())
        cls.client = TestClient(app)

    def test_01_db_persistence_and_seed(self):
        """Kiểm tra SQLite DB lưu trữ bền vững phụ huynh và 2 con mặc định."""
        children = db.get_children_by_parent("parent_lan_01")
        self.assertGreaterEqual(len(children), 2)
        
        leo = next((c for c in children if c["kid_id"] == "kid_leo_01"), None)
        self.assertIsNotNone(leo)
        self.assertEqual(leo["name"], "Bé Leo")
        self.assertEqual(leo["grade"], 1)
        self.assertEqual(leo["pairing_code"], "729-184")

        minh = next((c for c in children if c["kid_id"] == "kid_minh_02"), None)
        self.assertIsNotNone(minh)
        self.assertEqual(minh["name"], "Bé Minh")
        self.assertEqual(minh["grade"], 3)
        self.assertEqual(minh["pairing_code"], "852-369")
        print(" test_01_db_persistence_and_seed PASSED")

    def test_02_rest_api_children_list_and_create(self):
        """Kiểm tra REST API lấy danh sách con và thêm con mới sinh mã PIN 6 số."""
        # 1. GET /api/parent/children
        res = self.client.get("/api/parent/children?parent_id=parent_lan_01")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["status"] == "success")
        self.assertGreaterEqual(data["total"], 2)

        # 2. POST /api/parent/children (Tạo Bé Bắp Lớp 2)
        create_payload = {
            "parent_id": "parent_lan_01",
            "name": "Bé Bắp",
            "grade": 2,
            "avatar": "🐰"
        }
        create_res = self.client.post("/api/parent/children", json=create_payload)
        self.assertEqual(create_res.status_code, 200)
        new_child = create_res.json()["child"]
        self.assertEqual(new_child["name"], "Bé Bắp")
        self.assertEqual(new_child["grade"], 2)
        self.assertEqual(new_child["avatar"], "🐰")
        self.assertTrue("-" in new_child["pairing_code"])
        self.assertEqual(len(new_child["pairing_code"]), 7)  # xxx-xxx = 7 chars

        # Cleanup created child to keep test runs idempotent and avoid polluting database
        created_kid_id = new_child["kid_id"]
        with db.get_db_connection() as conn:
            cursor = conn.cursor()
            for t in ["pairing_codes", "child_roadmaps", "child_routines", "activity_logs", "children"]:
                cursor.execute(f"DELETE FROM {t} WHERE kid_id = ?", (created_kid_id,))
            conn.commit()

        print(" test_02_rest_api_children_list_and_create PASSED")

    def test_03_pairing_code_verification(self):
        """Kiểm tra máy con gửi mã PIN 6 số để xác thực hồ sơ."""
        # Test đúng mã PIN của Leo (729-184 hoặc 729184)
        pair_res = self.client.post("/api/child/pair", json={"code": "729-184"})
        self.assertEqual(pair_res.status_code, 200)
        p_data = pair_res.json()
        self.assertEqual(p_data["child"]["kid_id"], "kid_leo_01")
        self.assertEqual(p_data["child"]["name"], "Bé Leo")
        self.assertEqual(p_data["child"]["grade"], 1)

        # Test dạng không gạch ngang 729184
        pair_res2 = self.client.post("/api/child/pair", json={"code": "729184"})
        self.assertEqual(pair_res2.status_code, 200)
        self.assertEqual(pair_res2.json()["child"]["kid_id"], "kid_leo_01")

        # Test mã sai
        bad_res = self.client.post("/api/child/pair", json={"code": "000-000"})
        self.assertEqual(bad_res.status_code, 400)
        print(" test_03_pairing_code_verification PASSED")

    def test_04_dispatch_and_reset_state_on_reassign(self):
        """Kiểm tra giao bài cấp instance_id mới và reset hoàn toàn tiến độ khi giao lại."""
        kid_id = "kid_leo_01"
        dispatch_req = {
            "kid_id": kid_id,
            "family_room_id": "family_room_milo_01",
            "task_ids": ["G1_MATH_01"],
            "island_theme": "Đảo Khám Phá"
        }

        # 1. Dispatch lần 1
        res1 = self.client.post("/api/tasks/dispatch", json=dispatch_req)
        self.assertEqual(res1.status_code, 200)
        state1 = db.get_child_state(kid_id)
        roadmap1 = state1["child_roadmap"]
        self.assertEqual(len(roadmap1), 1)
        inst_id_1 = roadmap1[0].get("instance_id")
        self.assertIsNotNone(inst_id_1)
        self.assertEqual(state1["current_step_index"], 0)

        # 2. Giả lập con làm xong bước 1
        db.save_child_roadmap(
            kid_id=kid_id,
            roadmap=roadmap1,
            current_roadmap_index=0,
            current_step_index=2,  # Đang ở bước 2
            pending_ticket=None
        )
        updated_state = db.get_child_state(kid_id)
        self.assertEqual(updated_state["current_step_index"], 2)

        # 3. Mẹ xóa và Giao Lại đúng bài G1_MATH_01 (Dispatch lần 2)
        res2 = self.client.post("/api/tasks/dispatch", json=dispatch_req)
        self.assertEqual(res2.status_code, 200)
        state2 = db.get_child_state(kid_id)
        roadmap2 = state2["child_roadmap"]
        inst_id_2 = roadmap2[0].get("instance_id")

        # Khẳng định tiến trình ĐÃ ĐƯỢC RESET SẠCH VỀ 0 và có instance_id mới
        self.assertEqual(state2["current_step_index"], 0)
        self.assertNotEqual(inst_id_1, inst_id_2)
        print(" test_04_dispatch_and_reset_state_on_reassign PASSED")

    def test_05_multi_child_websocket_routing(self):
        """Kiểm tra WebSocket định tuyến có đính kèm kid_id định danh."""
        # Kết nối WS phụ huynh và WS con
        with self.client.websocket_connect("/ws/sync?role=parent&room_id=test_room&client_id=parent_ws") as p_ws:
            # Nhận handshake welcome
            p_welcome = json.loads(p_ws.receive_text())
            self.assertEqual(p_welcome["event_type"], "CONNECTION_ESTABLISHED")

            with self.client.websocket_connect("/ws/sync?role=kid&room_id=test_room&client_id=minh_ws&kid_id=kid_minh_02") as k_ws:
                k_welcome = json.loads(k_ws.receive_text())
                self.assertEqual(k_welcome["event_type"], "CONNECTION_ESTABLISHED")

                # Con gửi tin hoàn thành bước 1
                k_ws.send_text(json.dumps({
                    "event_type": "KID_STEP_COMPLETED",
                    "step_id": 1,
                    "dopamine_points": 25,
                    "kid_id": "kid_minh_02"
                }))

                # Phụ huynh nhận được thông báo
                parent_msg = json.loads(p_ws.receive_text())
                self.assertEqual(parent_msg["event_type"], "PARENT_NOTIFICATION_STEP_DONE")
                self.assertEqual(parent_msg["step_id"], 1)

        print(" test_05_multi_child_websocket_routing PASSED")

    def test_06_independent_child_routines_and_state_isolation(self):
        """Kiểm tra độc lập 100% giữa Routine của Bé Minh và Bé Leo trong SQLite."""
        minh_routines = [
            {"id": "routine_morning_bed", "title": "Gấp chăn hình hộp diêm", "reward": 20},
            {"id": "routine_clean_desk", "title": "Dọn bàn học 3 phút", "reward": 30}
        ]
        leo_routines = [
            {"id": "routine_night_teeth", "title": "Đánh răng 2 phút vui nhộn", "reward": 25}
        ]

        # 1. Giao routine cho Bé Minh
        res_minh = self.client.put("/api/child/kid_minh_02/state", json={"routines": minh_routines})
        self.assertEqual(res_minh.status_code, 200)

        # 2. Giao routine cho Bé Leo
        res_leo = self.client.put("/api/child/kid_leo_01/state", json={"routines": leo_routines})
        self.assertEqual(res_leo.status_code, 200)

        # 3. Lấy state Bé Minh -> phải đúng 2 routine của Minh, không bị lẫn của Leo
        state_minh = self.client.get("/api/child/kid_minh_02/state").json()
        self.assertEqual(len(state_minh["child_routine_roadmap"]), 2)
        minh_ids = [r["id"] for r in state_minh["child_routine_roadmap"]]
        self.assertIn("routine_morning_bed", minh_ids)
        self.assertIn("routine_clean_desk", minh_ids)
        self.assertNotIn("routine_night_teeth", minh_ids)

        # 4. Lấy state Bé Leo -> phải đúng 1 routine của Leo, không bị lẫn của Minh
        state_leo = self.client.get("/api/child/kid_leo_01/state").json()
        self.assertEqual(len(state_leo["child_routine_roadmap"]), 1)
        self.assertEqual(state_leo["child_routine_roadmap"][0]["id"], "routine_night_teeth")

        # 5. Ghép nối độc lập máy con bằng PIN: PIN bé Minh trả về Minh Lớp 3, PIN bé Leo trả về Leo Lớp 1
        pair_minh = self.client.post("/api/child/pair", json={"code": "852-369"}).json()
        self.assertEqual(pair_minh["child"]["kid_id"], "kid_minh_02")
        self.assertEqual(pair_minh["child"]["grade"], 3)

        pair_leo = self.client.post("/api/child/pair", json={"code": "729-184"}).json()
        self.assertEqual(pair_leo["child"]["kid_id"], "kid_leo_01")
        self.assertEqual(pair_leo["child"]["grade"], 1)

        print(" test_06_independent_child_routines_and_state_isolation PASSED")

    def test_07_cross_child_task_dispatch_websocket_isolation(self):
        """Kiểm tra khi mẹ giao bài cho bé Lớp 1 (Leo), WebSocket bắn event có target_kid_id='kid_leo_01', máy bé Lớp 3 (Minh) không bị ô nhiễm DB."""
        # 1. Lấy dữ liệu ban đầu của bé Minh (Lớp 3)
        initial_minh = self.client.get("/api/child/kid_minh_02/state").json()
        minh_roadmap_before = initial_minh.get("child_roadmap", [])

        # 2. Kết nối WebSocket đồng thời giữa Mẹ và Bé Minh (Lớp 3)
        with self.client.websocket_connect("/ws/sync?role=parent&room_id=test_room_cross&client_id=parent_p1&kid_id=kid_leo_01") as p_ws:
            p_welcome = json.loads(p_ws.receive_text())
            self.assertEqual(p_welcome["event_type"], "CONNECTION_ESTABLISHED")

            with self.client.websocket_connect("/ws/sync?role=kid&room_id=test_room_cross&client_id=minh_phone&kid_id=kid_minh_02") as k_ws:
                k_welcome = json.loads(k_ws.receive_text())
                self.assertEqual(k_welcome["event_type"], "CONNECTION_ESTABLISHED")
                # Đảm bảo handshake của bé Minh chứa đúng profile bé Minh
                self.assertEqual(k_welcome.get("kid_id"), "kid_minh_02")
                self.assertEqual(k_welcome["state"].get("kid_id"), "kid_minh_02")

                # 3. Mẹ gọi API Dispatch giao bài lớp 1 (G1_MATH_01) cho bé Leo
                dispatch_req = {
                    "kid_id": "kid_leo_01",
                    "family_room_id": "test_room_cross",
                    "task_ids": ["G1_MATH_01"],
                    "island_theme": "Đảo Số Học Lớp 1"
                }
                res = self.client.post("/api/tasks/dispatch", json=dispatch_req)
                self.assertEqual(res.status_code, 200)

                # Cả k_ws và p_ws đều nhận được tin NEW_DISPATCH_ROUTE
                dispatch_event = json.loads(k_ws.receive_text())
                self.assertEqual(dispatch_event["event_type"], "NEW_DISPATCH_ROUTE")
                self.assertEqual(dispatch_event.get("kid_id"), "kid_leo_01")
                self.assertEqual(dispatch_event.get("target_kid_id"), "kid_leo_01")

                p_dispatch = json.loads(p_ws.receive_text())
                self.assertEqual(p_dispatch["event_type"], "NEW_DISPATCH_ROUTE")

                # 4. Mẹ gửi thêm broadcast TASK_ASSIGN_BATCH với target_kid_id='kid_leo_01'
                p_ws.send_text(json.dumps({
                    "event_type": "TASK_ASSIGN_BATCH",
                    "target_kid_id": "kid_leo_01",
                    "kid_id": "kid_leo_01",
                    "payload": {
                        "target_kid_id": "kid_leo_01",
                        "tasks": [{"id": "G1_MATH_01", "title": "Phép cộng phạm vi 10", "steps": [{"step_id": 1}]}]
                    }
                }))

                batch_event = json.loads(k_ws.receive_text())
                self.assertEqual(batch_event["event_type"], "TASK_ASSIGN_BATCH")
                self.assertEqual(batch_event.get("target_kid_id"), "kid_leo_01")

        # 5. Kiểm tra database của bé Minh: TUYỆT ĐỐI không bị thay thế bằng bài của bé Leo
        after_minh = self.client.get("/api/child/kid_minh_02/state").json()
        minh_roadmap_after = after_minh.get("child_roadmap", [])
        self.assertEqual(len(minh_roadmap_after), len(minh_roadmap_before))
        if len(minh_roadmap_after) > 0:
            self.assertTrue(minh_roadmap_after[0]["id"].startswith("G3_"))

        print(" test_07_cross_child_task_dispatch_websocket_isolation PASSED")


if __name__ == "__main__":
    unittest.main()
