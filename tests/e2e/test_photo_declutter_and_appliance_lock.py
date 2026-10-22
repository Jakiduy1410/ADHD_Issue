import unittest
import json
import os
import re

class TestPhotoDeclutterAndApplianceLock(unittest.TestCase):
    def setUp(self):
        self.curriculum_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'curriculum')
        self.routines_path = os.path.join(self.curriculum_dir, 'routines_db.json')
        self.tasks_path = os.path.join(self.curriculum_dir, 'tasks_db.json')
        self.renderers_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'js', 'renderers.js')
        self.roadmap_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'js', 'roadmap.js')
        self.index_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'index.html')

    def test_01_water_routine_has_only_one_photo_step(self):
        """Uống nước chỉ có 1 ảnh cạn ở cuối, không bắt chụp 2 lần (đầy & cạn)"""
        with open(self.routines_path, 'r', encoding='utf-8') as f:
            routines = json.load(f)
        water = routines.get('routine_morning_water')
        self.assertIsNotNone(water)
        photo_steps = [s for s in water['steps'] if s.get('ui_type') == 'photo_proof']
        self.assertEqual(len(photo_steps), 1, "Bài uống nước chỉ nên có duy nhất 1 ảnh minh chứng ở cuối!")
        self.assertEqual(len(water['steps']), 3, "Bài uống nước gồm 3 bước: Rót -> Uống -> Chụp cốc cạn")

        # Đồng bộ Single Source of Truth tasks_db.json
        with open(self.tasks_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
        task_water = tasks.get('routine_morning_water')
        self.assertIsNotNone(task_water)
        self.assertEqual(len(task_water['steps']), 3)

    def test_02_appliance_timer_scoped_by_task_id(self):
        """Thiết bị chạy ngầm (lò nướng/vi sóng) phải được gắn chặt với taskId, không rò rỉ sang task khác"""
        with open(self.renderers_path, 'r', encoding='utf-8') as f:
            renderers_code = f.read()

        # timerItem phải có taskId
        self.assertIn("taskId: currentTaskId", renderers_code)
        # photo_proof chỉ lấy timer khớp taskId
        self.assertIn("t.taskId === currentTaskId", renderers_code)
        # activeApplianceForStep cũng phải kiểm tra taskId
        self.assertIn("t.taskId === currentTaskId && !t.isCompleted", renderers_code)

    def test_03_photo_proof_ui_decluttered(self):
        """Giao diện chụp hình photo_proof đã được loại bỏ chữ nhỏ li ti, chỉ giữ tiêu đề to và khung ngắm trực quan"""
        with open(self.renderers_path, 'r', encoding='utf-8') as f:
            renderers_code = f.read()

        # Bỏ các dòng chữ thừa gây rối mắt
        self.assertNotIn("⭐ Bước Then Chốt: Minh Chứng Thị Giác", renderers_code)
        self.assertNotIn("Hệ thống tự động duyệt ngay!", renderers_code)
        self.assertNotIn("1 chạm tự động duyệt ngay • Con không cần chờ đợi", renderers_code)
        self.assertNotIn("CAMERA READY", renderers_code)
        self.assertNotIn("Chụp góc bàn/phòng gọn gàng để khoe với Mẹ", renderers_code)

        # Nút bấm chụp to rõ ràng
        self.assertIn("BẤM CHỤP (+", renderers_code)

    def test_04_island_locking_when_appliance_running(self):
        """Khóa chuyển đảo khi có nhiệm vụ chạy ngầm thiết bị bếp để bảo vệ trẻ ADHD không bỏ quên món ăn"""
        with open(self.index_path, 'r', encoding='utf-8') as f:
            index_code = f.read()
        with open(self.roadmap_path, 'r', encoding='utf-8') as f:
            roadmap_code = f.read()

        # startChildRoutineTask chặn chuyển đảo nếu có timer chạy ngầm của task khác
        self.assertIn("runningTimer.taskId !== routineId", index_code)
        self.assertIn("Bếp Đang Nấu! ♨️", index_code)

        # startChildQuest cũng chặn nếu có thiết bị đang nấu dở
        self.assertIn("runningTimer.taskId", roadmap_code)

if __name__ == '__main__':
    unittest.main()
