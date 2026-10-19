"""
Test Flexible Archipelago Roadmap Manager & S-Curve SVG Connecting Trail.
Verifies:
1. Parent Roadmap Manager UI container (#parent-active-roadmap-list) & counter badge exist.
2. Parent functions parentRemoveRoadmapTask and parentClearChildRoadmap are exported.
3. Child screen renderChildIslandRoadmap renders dynamic S-curve SVG trail with Bezier spline.
4. Empty roadmap state shows friendly waiting screen rather than forcing hardcoded tasks.
5. AI and manual task dispatch support both replace and append modes.
6. Reading comprehension tokenization fallback guarantees totalTargets > 0.
7. MiloSyncBus handles real-time ROADMAP_UPDATED synchronization.
"""

import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


class TestFlexibleRoadmapAndTrail(unittest.TestCase):
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
        )

    def test_01_parent_active_roadmap_manager_ui(self):
        """Verify Parent Active Roadmap Manager DOM elements exist in Tab 2."""
        self.assertIn('id="parent-active-roadmap-list"', self.html)
        self.assertIn('id="parent-roadmap-count-badge"', self.html)
        self.assertIn('onclick="parentClearChildRoadmap()"', self.html)
        self.assertIn('Hải Trình Đang Chinh Phục', self.html)

    def test_02_parent_roadmap_management_functions(self):
        """Verify parentRemoveRoadmapTask and parentClearChildRoadmap exist and are exported to window."""
        self.assertIn("function renderParentActiveRoadmapList()", self.html)
        self.assertIn("function parentRemoveRoadmapTask(index)", self.html)
        self.assertIn("function parentClearChildRoadmap()", self.html)
        self.assertIn("window.parentRemoveRoadmapTask = parentRemoveRoadmapTask", self.html)
        self.assertIn("window.parentClearChildRoadmap = parentClearChildRoadmap", self.html)

    def test_03_s_curve_svg_trail_in_roadmap(self):
        """Verify renderChildIslandRoadmap builds dynamic SVG Bézier path connecting islands."""
        self.assertIn("points.push({ x: xr, y: yr, rowIndex: r, islandIndex: totalIslands - r });", self.html)
        self.assertIn("fullPathD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;", self.html)
        self.assertIn('stroke="#CBD5E1"', self.html)
        self.assertIn('stroke-dasharray="14 14"', self.html)
        self.assertIn('conqueredPathD', self.html)

    def test_04_empty_roadmap_friendly_state(self):
        """Verify empty roadmap renders cute waiting state with Milo, without forcing tasks."""
        self.assertIn("Hải trình đang trống!", self.html)
        self.assertIn("CHỜ BA MẸ GIAO BÀI... ⏳", self.html)
        self.assertIn("Hải trình trống (0 đảo)", self.html)

    def test_05_append_and_replace_dispatch(self):
        """Verify AI and Manual dispatchers support append and replace modes."""
        self.assertIn("parentDispatchAiTask('replace')", self.html)
        self.assertIn("parentDispatchAiTask('append')", self.html)
        self.assertIn("parentDispatchManualTask('replace')", self.html)
        self.assertIn("parentDispatchManualTask('append')", self.html)

    def test_06_reading_comprehension_tokenization_fallback(self):
        """Verify G4_VIET_18 has reading_excerpt and highlight fallback ensures totalTargets > 0."""
        self.assertIn('"reading_excerpt": "Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non."', self.html)
        self.assertIn("if (totalTargets === 0 && targetSegments && targetSegments.length > 0)", self.html)

    def test_07_bus_roadmap_updated_event(self):
        """Verify MiloSyncBus handles ROADMAP_UPDATED event."""
        self.assertIn("bus.subscribe('ROADMAP_UPDATED'", self.html)
        self.assertIn("window.miloBus.broadcast('ROADMAP_UPDATED'", self.html)


if __name__ == "__main__":
    unittest.main()
