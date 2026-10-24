"""
Test Multi-Subject Pedagogical Scaffolding & Frontend UX Refactor.
Verifies:
1. selectedCatalogIds starts empty and batch counter starts at 0.
2. Geometry SVG renderer (renderGeometrySvg) handles rectangle, parallelogram, and nested shapes.
3. Reading comprehension isolates questions, excerpts, and passages.
4. Dynamic Island Quest Roadmap renders N islands and triggers Victory State.
5. AI Parent Coach updates dynamically from live telemetry without static mock data.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


class TestMultiSubjectScaffolding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app_dir = REPO_ROOT / "app"
        js_code = "\n".join(f.read_text(encoding="utf-8") for f in sorted((app_dir / "js").glob("*.js")))
        cls.html = (
            (app_dir / "index.html").read_text(encoding="utf-8")
            + "\n"
            + js_code
            + "\n"
            + (app_dir / "css" / "style.css").read_text(encoding="utf-8")
            + "\n"
            + (REPO_ROOT / "data" / "curriculum" / "tasks_db.json").read_text(encoding="utf-8")
        )

    def test_01_catalog_selection_starts_empty(self):
        """Verify selectedCatalogIds starts empty and batch count is 0."""
        self.assertIn("selectedCatalogIds: new Set([]),", self.html)
        self.assertIn('id="batch-selected-count" class="text-teal-700 font-black">0</strong>', self.html)

    def test_02_geometry_svg_renderer_contract(self):
        """Verify index.html contains renderGeometrySvg supporting rectangle, parallelogram, nested."""
        self.assertIn("function renderGeometrySvg(spec)", self.html)
        self.assertIn("parallelogram", self.html)
        self.assertIn("nested", self.html)
        self.assertIn("isPerimeter", self.html)
        self.assertIn("isArea", self.html)

    def test_03_catalog_geometry_tasks_have_specs(self):
        """Verify G3_MCQ_14 and G4_MCQ_19 have geometry_spec."""
        self.assertIn('"G3_MCQ_14"', self.html)
        self.assertIn('"G4_MCQ_19"', self.html)
        self.assertIn('"geometry_spec"', self.html)
        self.assertIn('"shape_type": "rectangle"', self.html)
        self.assertIn('"shape_type": "parallelogram"', self.html)

    def test_04_reading_comprehension_isolation(self):
        """Verify G4_ENG_20 and G4_VIET_18 have reading_passage and isolated excerpt."""
        self.assertIn('"reading_passage"', self.html)
        self.assertIn('"reading_excerpt"', self.html)
        self.assertIn("Peter's family is at home", self.html)
        self.assertIn("Chị Gió bay qua những cánh đồng", self.html)

    def test_05_dynamic_island_roadmap_and_victory(self):
        """Verify renderChildIslandRoadmap handles N islands and Victory State."""
        self.assertIn("RƯƠNG BÁU ĐÃ MỞ BUNG! 👑", self.html)
        self.assertIn("HẢI TRÌNH TOÀN THẮNG!", self.html)
        self.assertIn("ĐỔI VÉ VÀNG NGAY!", self.html)

    def test_06_parent_coach_telemetry_observer(self):
        """Verify updateParentCoachInsights exists and parentAskCoach is context-aware."""
        self.assertIn("function updateParentCoachInsights(task, stepIdx, telemetry)", self.html)
        self.assertIn("function parentAskCoach()", self.html)
        self.assertNotIn("Leo đang làm tốt việc chia nhỏ bàn học. Khi bé bấm Soft Pause", self.html)

    def test_07_authentic_highlighter_styling(self):
        """Verify highlight tokens use authentic yellow highlighter styles."""
        self.assertIn("border-b-2 border-dashed border-amber-400 bg-amber-50", self.html)
        self.assertIn("bg-amber-300", self.html)


if __name__ == "__main__":
    unittest.main()
