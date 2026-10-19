import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update batch selection HTML initial values
old_batch_html = """                  <div class="sticky bottom-0 bg-white/95 backdrop-blur-md border-2 border-teal-500 rounded-2xl p-3 shadow-xl z-20 space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-slate-700">Đã chọn: <strong id="batch-selected-count" class="text-teal-700 font-black">2</strong> bài tập</span>
                      <span id="batch-selected-meta" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        7 bước • ~15 phút • +270 ⭐
                      </span>
                    </div>"""

new_batch_html = """                  <div class="sticky bottom-0 bg-white/95 backdrop-blur-md border-2 border-teal-500 rounded-2xl p-3 shadow-xl z-20 space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-slate-700">Đã chọn: <strong id="batch-selected-count" class="text-teal-700 font-black">0</strong> bài tập</span>
                      <span id="batch-selected-meta" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        0 bài tập • Chọn bài từ danh sách bên trên
                      </span>
                    </div>"""

if old_batch_html in content:
    content = content.replace(old_batch_html, new_batch_html)
    print("1. Replaced batch selection HTML counter")
else:
    print("Warning: old_batch_html not found exactly")

# 2. Update initial appState
old_appstate_init = """      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [
        taskDatabase['chore_desk'],   // Đảo 1: Đang làm
        taskDatabase['G1_MATH_01']    // Đảo 2: Kế tiếp
      ],
      currentRoadmapIndex: 0,

      // Task đang giải quyết trong Focus Cockpit
      activeTask: taskDatabase['chore_desk'],
      currentStepIndex: 0,"""

new_appstate_init = """      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [
        taskDatabase['G1_MATH_01']    // Đảo 1: Khởi đầu bài tập
      ],
      currentRoadmapIndex: 0,

      // Task đang giải quyết trong Focus Cockpit
      activeTask: taskDatabase['G1_MATH_01'],
      currentStepIndex: 0,"""

if old_appstate_init in content:
    content = content.replace(old_appstate_init, new_appstate_init)
    print("2. Replaced appState childRoadmap initial value")
else:
    print("Warning: old_appstate_init not found")

old_selected_ids = "selectedCatalogIds: new Set(['chore_desk', 'G1_MATH_01']),"
new_selected_ids = "selectedCatalogIds: new Set([]),"

if old_selected_ids in content:
    content = content.replace(old_selected_ids, new_selected_ids)
    print("3. Replaced selectedCatalogIds with empty set")
else:
    print("Warning: old_selected_ids not found")

# 4. Update initial AI Parent Coach text in HTML
old_coach_text = """                    <p id="ai-summary-text" class="text-[11px] text-slate-600 leading-relaxed">
                      "Leo đang làm tốt việc chia nhỏ bàn học. Khi bé bấm Soft Pause để thở bụng 4-4-4, não bộ bé đang tự điều hòa cảm xúc rất tốt thay vì nổi cơn bức bội."
                    </p>"""

new_coach_text = """                    <p id="ai-summary-text" class="text-[11px] text-slate-600 leading-relaxed">
                      "Leo đang khởi động bài tập cùng Milo. Hệ thống đang phân tích hành vi và xử lý nhận thức thời gian thực..."
                    </p>"""

if old_coach_text in content:
    content = content.replace(old_coach_text, new_coach_text)
    print("4. Replaced initial coach text in HTML")
else:
    print("Warning: old_coach_text not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Batch 1 completed.")
