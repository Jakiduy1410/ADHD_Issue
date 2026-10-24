# scratch/patch_dispatch_modes.py
from pathlib import Path

INDEX_HTML_PATH = Path('index.html')

with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update hydration to respect empty roadmap
old_hydration = """        if (saved.childRoadmap && Array.isArray(saved.childRoadmap) && saved.childRoadmap.length > 0) {
          const validTasks = saved.childRoadmap.filter(t => (
            t &&
            typeof t === 'object' &&
            t.id &&
            Array.isArray(t.steps) &&
            t.steps.length > 0
          ));
          if (validTasks.length > 0) {
            appState.childRoadmap = validTasks;
          }
        }
        // Đảm bảo currentRoadmapIndex luôn hợp lệ trong phạm vi roadmap hiện hành
        if (saved.currentRoadmapIndex !== undefined && saved.currentRoadmapIndex >= 0 && saved.currentRoadmapIndex < appState.childRoadmap.length) {
          appState.currentRoadmapIndex = saved.currentRoadmapIndex;
        } else {
          appState.currentRoadmapIndex = 0;
        }
        appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex] || appState.childRoadmap[0];"""

new_hydration = """        if (saved.childRoadmap && Array.isArray(saved.childRoadmap)) {
          const validTasks = saved.childRoadmap.filter(t => (
            t &&
            typeof t === 'object' &&
            t.id &&
            Array.isArray(t.steps) &&
            t.steps.length > 0
          ));
          appState.childRoadmap = validTasks;
        }
        // Đảm bảo currentRoadmapIndex luôn hợp lệ trong phạm vi roadmap hiện hành
        if (saved.currentRoadmapIndex !== undefined && saved.currentRoadmapIndex >= 0 && saved.currentRoadmapIndex < appState.childRoadmap.length) {
          appState.currentRoadmapIndex = saved.currentRoadmapIndex;
        } else {
          appState.currentRoadmapIndex = 0;
        }
        appState.activeTask = (appState.childRoadmap && appState.childRoadmap.length > 0)
          ? (appState.childRoadmap[appState.currentRoadmapIndex] || appState.childRoadmap[0])
          : null;"""

if old_hydration in content:
    content = content.replace(old_hydration, new_hydration)
    print("Updated hydration to support empty array")
else:
    print("Warning: old_hydration not found directly")

# 2. Update AI preview HTML buttons
ai_btn_old = """<button onclick="parentDispatchAiTask()" class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mt-2">
                        <span>🚀 GIAO BÀI NÀY SANG MÁY CON NGAY!</span>
                      </button>"""

ai_btn_new = """<div class="grid grid-cols-2 gap-2 mt-2">
                        <button onclick="parentDispatchAiTask('replace')" class="py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-black text-[11px] rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1">
                          <span>🚀 Giao Mới (Thay Thế)</span>
                        </button>
                        <button onclick="parentDispatchAiTask('append')" class="py-2.5 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-black text-[11px] rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1">
                          <span>➕ Thêm Vào Hải Trình</span>
                        </button>
                      </div>"""

# Try both formatted variations of ai_btn_old
if "onclick=\"parentDispatchAiTask()\"" in content:
    content = content.replace(
        """<button onclick="parentDispatchAiTask()" class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mt-2">\n                        <span>🚀 GIAO BÀI NÀY SANG MÁY CON NGAY!</span>\n                      </button>""",
        ai_btn_new
    )
    print("Updated AI Preview button")

# 3. Update Manual task HTML buttons
manual_btn_pattern = """<button onclick="parentDispatchManualTask()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mt-2">
                        <span>🚀 TẠO NHIỆM VỤ & GIAO SANG MÁY CON</span>
                      </button>"""

manual_btn_new = """<div class="grid grid-cols-2 gap-2 mt-2">
                        <button onclick="parentDispatchManualTask('replace')" class="py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-[11px] rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1">
                          <span>🚀 Giao Mới (Thay Thế)</span>
                        </button>
                        <button onclick="parentDispatchManualTask('append')" class="py-2.5 bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 font-black text-[11px] rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1">
                          <span>➕ Thêm Vào Hải Trình</span>
                        </button>
                      </div>"""

if manual_btn_pattern in content:
    content = content.replace(manual_btn_pattern, manual_btn_new)
    print("Updated Manual task button")

# 4. Update parentDispatchAiTask definition
ai_fn_old = """    function parentDispatchAiTask() {
      if (!activeGeneratedAiTask) return;
      playSfx('bell');
      activeGeneratedAiTask.title = document.getElementById('ai-preview-title').value;
      
      // Đăng ký vào database & gán vào lộ trình máy con
      taskDatabase[activeGeneratedAiTask.id] = activeGeneratedAiTask;
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: [activeGeneratedAiTask],
          islandName: activeGeneratedAiTask.title,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = [activeGeneratedAiTask];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = activeGeneratedAiTask;
        renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        childSwitchScreen('home');
      }

      showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của con!`, "🚀");
    }"""

ai_fn_new = """    function parentDispatchAiTask(mode = 'replace') {
      if (!activeGeneratedAiTask) return;
      playSfx('bell');
      activeGeneratedAiTask.title = document.getElementById('ai-preview-title').value;
      
      // Đăng ký vào database & gán vào lộ trình máy con
      taskDatabase[activeGeneratedAiTask.id] = activeGeneratedAiTask;

      if (mode === 'append' && Array.isArray(appState.childRoadmap) && appState.childRoadmap.length > 0) {
        const updated = [...appState.childRoadmap, activeGeneratedAiTask];
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: updated,
            islandName: `Hải Trình ${updated.length} Đảo Tri Thức`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = updated;
          renderChildIslandRoadmap();
        }
        renderParentActiveRoadmapList();
        showToast("Đã Thêm Đảo Mới", `Đã thêm [${activeGeneratedAiTask.title}] vào hải trình của con!`, "🏝️");
      } else {
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: [activeGeneratedAiTask],
            islandName: activeGeneratedAiTask.title,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = [activeGeneratedAiTask];
          appState.currentRoadmapIndex = 0;
          appState.activeTask = activeGeneratedAiTask;
          renderChildIslandRoadmap();
          childSwitchScreen('home');
        }
        renderParentActiveRoadmapList();
        showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của con!`, "🚀");
      }
    }"""

if ai_fn_old in content:
    content = content.replace(ai_fn_old, ai_fn_new)
    print("Updated parentDispatchAiTask")

# 5. Update parentDispatchManualTask definition
manual_fn_old = """    function parentDispatchManualTask() {
      playSfx('bell');
      const title = document.getElementById('manual-task-name').value.trim() || "Nhiệm vụ mẹ giao";
      const type = document.getElementById('manual-task-type').value;
      const stars = parseInt(document.getElementById('manual-task-stars').value) || 120;

      const inputElements = document.querySelectorAll('#manual-steps-container .manual-step-input');
      const dynamicSteps = [];
      inputElements.forEach((inp, idx) => {
        const val = inp.value.trim() || `Hành động bước ${idx + 1}`;
        dynamicSteps.push({
          badge: `Bước ${idx + 1}`,
          text: val
        });
      });

      const customTask = {
        id: 'manual_' + Date.now(),
        cat: type === 'routine' ? 'chore' : 'study',
        catName: type === 'routine' ? 'Sinh Hoạt Tự Lập' : 'Bài Tập Học Tập',
        icon: type === 'routine' ? '🧹' : '🚀',
        title: title,
        island: type,
        reward: stars,
        stepSeconds: 60,
        steps: dynamicSteps
      };

      taskDatabase[customTask.id] = customTask;
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: [customTask],
          islandName: customTask.title,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = [customTask];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = customTask;
        renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        childSwitchScreen('home');
      }

      showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "✍️");
    }"""

manual_fn_new = """    function parentDispatchManualTask(mode = 'replace') {
      playSfx('bell');
      const title = document.getElementById('manual-task-name').value.trim() || "Nhiệm vụ mẹ giao";
      const type = document.getElementById('manual-task-type').value;
      const stars = parseInt(document.getElementById('manual-task-stars').value) || 120;

      const inputElements = document.querySelectorAll('#manual-steps-container .manual-step-input');
      const dynamicSteps = [];
      inputElements.forEach((inp, idx) => {
        const val = inp.value.trim() || `Hành động bước ${idx + 1}`;
        dynamicSteps.push({
          badge: `Bước ${idx + 1}`,
          text: val
        });
      });

      const customTask = {
        id: 'manual_' + Date.now(),
        cat: type === 'routine' ? 'chore' : 'study',
        catName: type === 'routine' ? 'Sinh Hoạt Tự Lập' : 'Bài Tập Học Tập',
        icon: type === 'routine' ? '🧹' : '🚀',
        title: title,
        island: type,
        reward: stars,
        stepSeconds: 60,
        steps: dynamicSteps
      };

      taskDatabase[customTask.id] = customTask;

      if (mode === 'append' && Array.isArray(appState.childRoadmap) && appState.childRoadmap.length > 0) {
        const updated = [...appState.childRoadmap, customTask];
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: updated,
            islandName: `Hải Trình ${updated.length} Đảo Tri Thức`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = updated;
          renderChildIslandRoadmap();
        }
        renderParentActiveRoadmapList();
        showToast("Đã Thêm Đảo Mới", `Đã thêm [${title}] vào hải trình của con!`, "🏝️");
      } else {
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: [customTask],
            islandName: customTask.title,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = [customTask];
          appState.currentRoadmapIndex = 0;
          appState.activeTask = customTask;
          renderChildIslandRoadmap();
          childSwitchScreen('home');
        }
        renderParentActiveRoadmapList();
        showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "✍️");
      }
    }"""

if manual_fn_old in content:
    content = content.replace(manual_fn_old, manual_fn_new)
    print("Updated parentDispatchManualTask")

with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dispatch modes patch complete!")
