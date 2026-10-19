# scratch/patch_flexible_roadmap.py
"""
Applies flexible roadmap management and SVG S-curve trail restoration to index.html:
1. Re-add dynamic SVG S-curve trail in renderChildIslandRoadmap().
2. Add Parent Active Roadmap Manager with 🗑️ delete island and 🔄 clear all roadmap buttons.
3. Update state hydration to support flexible/empty roadmap and zero forced defaults.
4. Add append/replace options for AI and manual task dispatch.
5. Fix G4_VIET_18 Reading Comprehension tokenization fallback.
"""

import re
from pathlib import Path

INDEX_HTML_PATH = Path('index.html')

with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update G4_VIET_18 step 1 ui_data to include reading_excerpt
g4_old = """"ui_data": {
                              "prompt_text": "Tìm tên sự vật thiên nhiên được gọi như con người:",
                              "highlight_target_segments": [
                                    "Chị Gió"
                              ]
                        },"""

g4_new = """"ui_data": {
                              "prompt_text": "Tìm tên sự vật thiên nhiên được gọi như con người:",
                              "reading_excerpt": "Chị Gió bay qua những cánh đồng, khẽ thì thầm với các bông lúa non.",
                              "highlight_target_segments": [
                                    "Chị Gió"
                              ]
                        },"""

if g4_old in content:
    content = content.replace(g4_old, g4_new)
    print("Updated G4_VIET_18 reading_excerpt")
else:
    print("Warning: g4_old not found directly, checking regex")

# 2. Update highlight step fallback in renderChildWorkspaceStep
hl_old_pattern = r"""(\s*const tokens = tokenizeSentenceForHighlight\(sentenceToTokenize, targetSegments\);)(\s*const totalTargets = tokens\.filter\(t => t\.isTarget\)\.length;)"""

hl_new_code = r"""\1
        let totalTargets = tokens.filter(t => t.isTarget).length;

        // Safeguard: if chosen sentence does not contain the target segments, check other sources
        if (totalTargets === 0 && targetSegments && targetSegments.length > 0) {
          const candidateSentences = [
            ui.reading_excerpt,
            task && task.reading_passage,
            task && task.original_text,
            ui.prompt_text,
            stepData.text
          ].filter(Boolean);

          for (const cand of candidateSentences) {
            const candTokens = tokenizeSentenceForHighlight(cand, targetSegments);
            if (candTokens.filter(t => t.isTarget).length > 0) {
              tokens = candTokens;
              totalTargets = candTokens.filter(t => t.isTarget).length;
              sentenceToTokenize = cand;
              break;
            }
          }

          if (totalTargets === 0) {
            tokens = targetSegments.map((seg, sIdx) => ({
              text: String(seg),
              isTarget: true,
              targetKey: String(seg).trim().toLowerCase()
            }));
            totalTargets = tokens.length;
          }
        }"""

content = re.sub(hl_old_pattern, hl_new_code, content, count=1)
print("Updated highlight fallback in renderChildWorkspaceStep")

# 3. Add Parent Active Roadmap Manager Card in Parent Tab 2 (right under Header Tab Giao Bài)
parent_tab2_header_marker = """<!-- Header Tab Giao Bài -->
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="font-bold text-slate-800 text-sm">Giao Bài & Quản Lý Hải Trình</h2>
                    <p class="text-[10px] text-slate-500">2 Hướng: Kho Băm Sẵn GDPT 2018 & Tự Giao Linh Hoạt</p>
                  </div>
                </div>"""

parent_active_roadmap_card = """<!-- Header Tab Giao Bài -->
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="font-bold text-slate-800 text-sm">Giao Bài & Quản Lý Hải Trình</h2>
                    <p class="text-[10px] text-slate-500">2 Hướng: Kho Băm Sẵn GDPT 2018 & Tự Giao Linh Hoạt</p>
                  </div>
                </div>

                <!-- BẢNG QUẢN LÝ HẢI TRÌNH ĐANG GIAO CỦA CON (FLEXIBLE ROADMAP MANAGER) -->
                <div class="bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 border border-sky-200 rounded-2xl p-3 shadow-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="text-base">🏝️</span>
                      <div>
                        <h3 class="text-xs font-black text-slate-800 leading-none">Hải Trình Đang Chinh Phục</h3>
                        <p class="text-[9px] font-bold text-slate-500 mt-0.5">Các hòn đảo đang hiển thị trên máy của Leo</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span id="parent-roadmap-count-badge" class="text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full">
                        0 đảo
                      </span>
                      <button onclick="parentClearChildRoadmap()" title="Xóa sạch toàn bộ hải trình để giao lại từ đầu" class="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95">
                        <span>🔄</span> <span>Xóa sạch</span>
                      </button>
                    </div>
                  </div>

                  <!-- Danh sách các đảo động trên máy con -->
                  <div id="parent-active-roadmap-list" class="space-y-1.5 max-h-44 overflow-y-auto pr-0.5 no-scrollbar">
                    <!-- Sẽ render động từng đảo đang có -->
                  </div>
                </div>"""

if parent_tab2_header_marker in content:
    content = content.replace(parent_tab2_header_marker, parent_active_roadmap_card)
    print("Added Parent Active Roadmap Manager Card into Tab 2 HTML")
else:
    print("Warning: parent_tab2_header_marker not found")

# 4. Update AI Preview and Manual Dispatch Buttons to support Append / Replace
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

if ai_btn_old in content:
    content = content.replace(ai_btn_old, ai_btn_new)
    print("Updated AI Preview dispatch buttons")

manual_btn_old = """<button onclick="parentDispatchManualTask()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mt-2">
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

if manual_btn_old in content:
    content = content.replace(manual_btn_old, manual_btn_new)
    print("Updated Manual dispatch buttons")

# 5. Subscribe to ROADMAP_UPDATED in registerMiloSyncSubscribers
milo_sub_marker = """      // 1. TASK_ASSIGN_BATCH: Parent dispatches -> Child renders Island Roadmap"""
roadmap_sub_code = """      // 0. ROADMAP_UPDATED: Parent deletes/clears islands -> Child updates immediately
      bus.subscribe('ROADMAP_UPDATED', (payload) => {
        if (!payload) return;
        appState.childRoadmap = Array.isArray(payload.roadmap) ? payload.roadmap : [];
        appState.currentRoadmapIndex = (typeof payload.currentIdx === 'number') ? payload.currentIdx : 0;
        appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex] || null;
        appState.currentStepIndex = 0;
        renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        bus.savePersistedState(appState);
      });

      // 1. TASK_ASSIGN_BATCH: Parent dispatches -> Child renders Island Roadmap"""

if milo_sub_marker in content and "ROADMAP_UPDATED" not in content:
    content = content.replace(milo_sub_marker, roadmap_sub_code)
    print("Added ROADMAP_UPDATED subscriber")

# Also ensure TASK_ASSIGN_BATCH subscriber calls renderParentActiveRoadmapList()
task_batch_sub_marker = """renderChildIslandRoadmap();
        childSwitchScreen('home');"""
task_batch_sub_replacement = """renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        childSwitchScreen('home');"""
content = content.replace(task_batch_sub_marker, task_batch_sub_replacement)

# 6. Replace renderChildIslandRoadmap implementation with the new S-Curve + Trail + Empty state
render_old_start = "function renderChildIslandRoadmap() {"
render_old_end = "function selectQueuedIsland(offset) {"

start_pos = content.find(render_old_start)
end_pos = content.find(render_old_end)

if start_pos != -1 and end_pos != -1:
    new_render_func = """function renderChildIslandRoadmap() {
      const roadmap = Array.isArray(appState.childRoadmap) ? appState.childRoadmap : [];
      const totalIslands = roadmap.length;
      const isAllCompleted = (totalIslands > 0 && appState.currentRoadmapIndex >= totalIslands);
      const curIdx = isAllCompleted ? (totalIslands - 1) : Math.max(0, Math.min(appState.currentRoadmapIndex || 0, Math.max(0, totalIslands - 1)));

      const mapContainer = document.getElementById('child-island-map-container');
      const counterEl = document.getElementById('child-roadmap-counter');
      const startQuestBtn = document.getElementById('child-btn-start-quest');
      const telemTitleEl = document.getElementById('telemetry-task-title');

      // 1. EMPTY STATE: Khi chưa có đảo nào được giao
      if (totalIslands === 0) {
        if (counterEl) counterEl.innerHTML = `<span class="text-slate-500 font-bold">Hải trình trống (0 đảo)</span>`;
        if (startQuestBtn) {
          startQuestBtn.disabled = true;
          startQuestBtn.className = "w-full bg-slate-200 text-slate-500 font-bold text-sm py-3.5 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300";
          startQuestBtn.setAttribute('onclick', "showToast('Chưa Có Nhiệm Vụ', 'Hãy nhờ ba mẹ giao bài từ Trạm Thấu Hiểu để bắt đầu nhé!', '🏝️')");
          startQuestBtn.innerHTML = `<span>CHỜ BA MẸ GIAO BÀI... ⏳</span>`;
        }
        if (telemTitleEl) telemTitleEl.innerText = "Chưa có nhiệm vụ nào đang diễn ra";
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div class="flex-1 relative flex flex-col items-center justify-center p-6 text-center min-h-[360px] my-auto">
              <div class="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner mb-3 animate-float">
                🏝️
              </div>
              <h3 class="text-sm font-black text-slate-800 mb-1">Hải trình đang trống!</h3>
              <p class="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                Chưa có hòn đảo nào hôm nay. Ba mẹ hãy chọn bài từ kho hoặc tự băm bài tập từ <strong>Trạm Thấu Hiểu</strong> để bắt đầu nhé!
              </p>
              <div class="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-emerald-700">
                <span>🤖</span>
                <span>Milo đã sẵn sàng xuất phát</span>
              </div>
            </div>
          `;
          mapContainer.style.minHeight = '360px';
        }
        renderParentActiveRoadmapList();
        return;
      }

      // 2. CẬP NHẬT HEADER VÀ NÚT BẮT ĐẦU KHI CÓ ĐẢO
      if (isAllCompleted) {
        if (counterEl) counterEl.innerHTML = `<span class="text-amber-800 font-black">👑 HẢI TRÌNH TOÀN THẮNG! (${totalIslands}/${totalIslands} Đảo)</span>`;
        if (startQuestBtn) {
          startQuestBtn.disabled = false;
          startQuestBtn.className = "w-full btn-3d-yellow text-slate-900 font-black text-base py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-bounce cursor-pointer";
          startQuestBtn.setAttribute('onclick', "childSwitchScreen('rewards')");
          startQuestBtn.innerHTML = `<span>ĐỔI VÉ VÀNG NGAY! (+${appState.stars} ⭐)</span> <span class="text-xl">🎁</span>`;
        }
      } else {
        if (counterEl) counterEl.innerText = `Đảo ${curIdx + 1} / ${totalIslands}: Đang Chinh Phục`;
        if (startQuestBtn) {
          startQuestBtn.disabled = false;
          const activeTask = roadmap[curIdx] || roadmap[0];
          const isChore = (activeTask && activeTask.cat === 'chore');
          startQuestBtn.setAttribute('onclick', "startChildQuest()");
          startQuestBtn.className = isChore
            ? "w-full btn-3d-amber text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            : "w-full btn-3d-green text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2";
          startQuestBtn.innerHTML = `<span>VÀO BUỒNG LÁI TẬP TRUNG!</span> <span class="text-xl">🚀</span>`;
        }
      }

      // 3. TÍNH TOÁN TỌA ĐỘ VÀ VẼ ĐƯỜNG MÒN S-CURVE NỐI CÁC ĐẢO (SVG QUEST TRAIL)
      const points = [];
      for (let r = totalIslands; r >= 1; r--) {
        const xr = (totalIslands === 1) ? 170 : ((r % 2 === 1) ? 230 : 110);
        const yr = 45 + r * 105;
        points.push({ x: xr, y: yr, rowIndex: r, islandIndex: totalIslands - r });
      }
      // Điểm đỉnh: Rương báu hoàng kim
      points.push({ x: 170, y: 45, rowIndex: 0, isTreasure: true });

      const totalHeight = 45 + totalIslands * 105 + 55;

      // Xây dựng đường cong Bézier toàn trình
      let fullPathD = `M ${points[0].x} ${points[0].y}`;
      for (let k = 0; k < points.length - 1; k++) {
        const p1 = points[k];
        const p2 = points[k + 1];
        const midY = (p1.y + p2.y) / 2;
        fullPathD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
      }

      // Xây dựng đường cong đã chinh phục (Conquered trail)
      const maxConqueredPointIdx = isAllCompleted ? (points.length - 1) : curIdx;
      let conqueredPathD = "";
      if (maxConqueredPointIdx > 0) {
        conqueredPathD = `M ${points[0].x} ${points[0].y}`;
        for (let k = 0; k < maxConqueredPointIdx; k++) {
          const p1 = points[k];
          const p2 = points[k + 1];
          const midY = (p1.y + p2.y) / 2;
          conqueredPathD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
        }
      }

      const svgTrailHtml = `
        <svg class="absolute inset-0 w-full pointer-events-none z-0" viewBox="0 0 340 ${totalHeight}" preserveAspectRatio="none" style="height: ${totalHeight}px; min-height: 100%;" fill="none">
          <!-- Vết bước chân / đường mòn đá cuội nối toàn bộ hải trình -->
          <path d="${fullPathD}" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round" stroke-dasharray="14 14"/>
          <!-- Đường mòn ánh sao phát sáng cho các đảo đã hoàn thành -->
          ${conqueredPathD ? `<path d="${conqueredPathD}" stroke="${isAllCompleted ? '#F59E0B' : '#10B981'}" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10" class="animate-pulse"/>` : ''}
        </svg>
      `;

      // 4. RENDER CÁC NỐT HÒN ĐẢO (TỪ TRÊN XUỐNG DƯỚI: RƯƠNG BÁU -> ĐẢO CUỐI -> ĐẢO ĐẦU)
      let islandsHtml = '';

      // Đỉnh: Rương báu hoàng kim
      islandsHtml += `
        <div id="node-treasure-island" onclick="alertTreasureStatus()" class="relative z-10 flex flex-col items-center cursor-pointer transition hover:scale-105 my-2">
          <div class="w-16 h-16 rounded-3xl ${isAllCompleted ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-yellow-200 text-4xl animate-bounce shadow-2xl' : 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-b-4 border-amber-600 text-3xl shadow-lg animate-pulse-glow'} flex items-center justify-center">
            ${isAllCompleted ? '✨🎁' : '🏆'}
          </div>
          <span class="text-[10px] font-black ${isAllCompleted ? 'text-amber-950 bg-yellow-300 border-amber-500 ring-2 ring-yellow-200' : 'text-amber-800 bg-amber-100 border-amber-300'} mt-1 border px-2.5 py-0.5 rounded-full shadow-xs">
            ${isAllCompleted ? 'RƯƠNG BÁU ĐÃ MỞ BUNG! 👑' : 'RƯƠNG BÁU HOÀNG KIM 🔒'}
          </span>
        </div>
      `;

      // Các đảo theo thứ tự đảo ngược (từ đảo N-1 xuống đảo 0)
      for (let r = 1; r <= totalIslands; r++) {
        const i = totalIslands - r;
        const t = roadmap[i] || {};
        const isDone = isAllCompleted || i < curIdx;
        const isActive = !isAllCompleted && i === curIdx;
        const isChore = (t.cat === 'chore');
        const titleSnippet = (t.title && t.title.length > 20) ? (t.title.slice(0, 18) + '...') : (t.title || 'Đảo Nhiệm Vụ');
        const alignClass = (totalIslands === 1) ? 'translate-x-0' : ((r % 2 === 1) ? 'translate-x-12' : '-translate-x-12');

        if (isActive) {
          const miloAlignClass = (totalIslands === 1) ? '-left-16 -top-2' : ((r % 2 === 1) ? '-left-16 -top-2' : '-right-16 -top-2');
          islandsHtml += `
            <div id="node-island-active" class="relative z-20 flex flex-col items-center my-2.5 ${alignClass}">
              <div class="absolute ${miloAlignClass} flex flex-col items-center animate-milo">
                <div id="child-milo-speech" class="bg-white border-2 border-emerald-400 px-2 py-0.5 rounded-xl rounded-br-none shadow-md text-[9px] font-extrabold text-emerald-800 mb-0.5 max-w-[105px] text-center leading-tight">
                  Đảo ${i + 1}: ${titleSnippet} 👋
                </div>
                <div class="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-2xl shadow-md">
                  🤖
                </div>
              </div>

              <div id="child-island-btn" onclick="startChildQuest()" class="w-20 h-20 rounded-[28px] ${isChore ? 'btn-3d-amber ring-8 ring-amber-100/60' : 'btn-3d-green ring-8 ring-emerald-100/60'} flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition">
                <span id="child-current-icon" class="text-3xl mb-0.5">${t.icon || '🏝️'}</span>
                <span id="child-current-reward" class="text-[9px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">+${t.reward || 100} ⭐</span>
              </div>

              <div class="mt-1.5 text-center max-w-[240px]">
                <div class="flex items-center justify-center gap-1 mb-0.5 flex-wrap">
                  <span id="child-island-tag" class="text-[9px] font-black px-2 py-0.2 rounded-full border ${isChore ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-teal-100 text-teal-800 border-teal-300'}">
                    ${isChore ? 'ĐẢO SINH HOẠT THƯ THÁI 🌿' : 'ĐẢO BÀI TẬP TẬP TRUNG 🎯'}
                  </span>
                  <span id="child-current-badge" class="text-[9px] font-black px-2 py-0.2 rounded-full uppercase border bg-amber-100 text-amber-900 border-amber-300">
                    Đang Chinh Phục
                  </span>
                </div>
                <h2 id="child-current-title" class="text-xs font-black text-slate-800 leading-snug truncate px-1">${t.title}</h2>
                <p id="child-current-sub" class="text-[10px] font-bold text-slate-500">${t.steps ? t.steps.length : 1} vi nhiệm vụ • Milo hỗ trợ</p>
              </div>
            </div>
          `;
        } else if (isDone) {
          islandsHtml += `
            <div class="relative z-10 flex flex-col items-center my-2 cursor-pointer opacity-90 hover:opacity-100 transition ${alignClass}" onclick="showToast('Đảo Đã Hoàn Thành', 'Leo đã chinh phục xuất sắc hòn đảo này! ⭐', '✅')">
              <div class="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-xs">
                <span class="text-xl">✅</span>
                <span class="text-[8px] font-black text-emerald-800">+${t.reward || 100} ⭐</span>
              </div>
              <span class="text-[9px] font-extrabold text-emerald-800 mt-1 bg-white border border-emerald-200 px-2 py-0.2 rounded-full shadow-xs max-w-[140px] truncate text-center">
                ${t.title}
              </span>
            </div>
          `;
        } else {
          islandsHtml += `
            <div class="relative z-10 flex flex-col items-center my-2 opacity-65 cursor-pointer hover:opacity-85 transition ${alignClass}" onclick="selectQueuedIsland(${i})">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-300 flex flex-col items-center justify-center shadow-xs">
                <span class="text-xl">${t.icon || '🔒'}</span>
                <span class="text-[8px] font-black text-slate-600">+${t.reward || 100} ⭐</span>
              </div>
              <span class="text-[9px] font-extrabold text-slate-600 mt-1 bg-white border border-slate-200 px-2 py-0.2 rounded-full shadow-xs max-w-[140px] truncate text-center">
                ${t.title}
              </span>
            </div>
          `;
        }
      }

      if (mapContainer) {
        mapContainer.innerHTML = svgTrailHtml + islandsHtml;
        mapContainer.style.minHeight = totalHeight + "px";
      }

      if (!isAllCompleted) {
        appState.activeTask = roadmap[curIdx] || roadmap[0];
      }

      const currentTask = roadmap[curIdx] || roadmap[0];
      if (telemTitleEl && currentTask) telemTitleEl.innerText = currentTask.title;
      if (typeof renderParentTelemetryProgress === 'function' && currentTask && currentTask.steps) {
        renderParentTelemetryProgress(currentTask.steps.length, isAllCompleted ? currentTask.steps.length : 1);
      }
      if (typeof updateParentCoachInsights === 'function' && currentTask) {
        updateParentCoachInsights(currentTask, isAllCompleted ? (currentTask.steps.length - 1) : 0, {});
      }
      renderParentActiveRoadmapList();
    }

    """
    content = content[:start_pos] + new_render_func + content[end_pos:]
    print("Replaced renderChildIslandRoadmap with S-Curve SVG trail & empty state")
else:
    print(f"Error finding renderChildIslandRoadmap bounds: start={start_pos}, end={end_pos}")

# 7. Add Parent Roadmap Management Functions: renderParentActiveRoadmapList, parentRemoveRoadmapTask, parentClearChildRoadmap
roadmap_mgmt_funcs = """
    /* ============================================================
       QUẢN LÝ HẢI TRÌNH ĐANG GIAO (PARENT ROADMAP MANAGER API)
       ============================================================ */
    function renderParentActiveRoadmapList() {
      const container = document.getElementById('parent-active-roadmap-list');
      const badge = document.getElementById('parent-roadmap-count-badge');
      if (!container) return;

      const roadmap = Array.isArray(appState.childRoadmap) ? appState.childRoadmap : [];
      if (badge) {
        badge.innerText = `${roadmap.length} đảo`;
      }

      if (roadmap.length === 0) {
        container.innerHTML = `
          <div class="bg-white/80 border border-dashed border-slate-300 rounded-xl p-3 text-center">
            <p class="text-[11px] font-bold text-slate-600 mb-0.5">Hải trình hiện tại đang trống 🏝️</p>
            <p class="text-[9px] text-slate-600 leading-snug">
              Hãy tick chọn bài từ kho bên dưới hoặc tự băm bằng AI, rồi bấm <strong>"Giao sang máy con"</strong> nhé!
            </p>
          </div>
        `;
        return;
      }

      const isAllDone = (appState.currentRoadmapIndex >= roadmap.length);
      let html = '';
      roadmap.forEach((t, idx) => {
        const isDone = isAllDone || idx < appState.currentRoadmapIndex;
        const isActive = !isAllDone && idx === appState.currentRoadmapIndex;
        const isChore = (t.cat === 'chore');
        html += `
          <div class="bg-white rounded-xl p-2 border ${isActive ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-200' : isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'} flex items-center justify-between gap-2 shadow-2xs">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="w-5 h-5 rounded-lg ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'} font-black text-[10px] flex items-center justify-center shrink-0">
                ${isDone ? '✓' : (idx + 1)}
              </span>
              <span class="text-base shrink-0">${t.icon || '🏝️'}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                  <span class="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${isChore ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}">
                    ${isChore ? 'Sinh hoạt' : (t.catName || 'Bài tập')}
                  </span>
                  ${isActive ? '<span class="text-[8px] font-black bg-amber-200 text-amber-900 px-1 rounded">Đang làm</span>' : ''}
                </div>
                <p class="text-[11px] font-bold text-slate-800 truncate">${t.title || 'Đảo Nhiệm Vụ'}</p>
                <p class="text-[9px] text-slate-500">${t.steps ? t.steps.length : 1} bước • +${t.reward || 100} ⭐</p>
              </div>
            </div>
            <button onclick="parentRemoveRoadmapTask(${idx})" title="Xóa hòn đảo này khỏi máy con" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 active:scale-95 cursor-pointer">
              <span class="text-sm">🗑️</span>
            </button>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    function parentRemoveRoadmapTask(index) {
      playSfx('tap');
      if (!Array.isArray(appState.childRoadmap) || index < 0 || index >= appState.childRoadmap.length) return;
      const removed = appState.childRoadmap.splice(index, 1)[0];

      if (appState.childRoadmap.length === 0) {
        appState.currentRoadmapIndex = 0;
        appState.activeTask = null;
      } else {
        if (appState.currentRoadmapIndex >= appState.childRoadmap.length) {
          appState.currentRoadmapIndex = appState.childRoadmap.length - 1;
        }
        appState.activeTask = appState.childRoadmap[appState.currentRoadmapIndex];
      }

      if (window.miloBus) {
        window.miloBus.savePersistedState(appState);
        window.miloBus.broadcast('ROADMAP_UPDATED', {
          roadmap: appState.childRoadmap,
          currentIdx: appState.currentRoadmapIndex
        });
      }

      renderParentActiveRoadmapList();
      renderChildIslandRoadmap();
      showToast("Đã Xóa Đảo", `Đã gỡ [${removed ? removed.title : 'Đảo'}] khỏi hải trình của Leo!`, "🗑️");
    }

    function parentClearChildRoadmap() {
      playSfx('tap');
      if (!Array.isArray(appState.childRoadmap) || appState.childRoadmap.length === 0) {
        showToast("Hải Trình Trống", "Hải trình của con hiện đang trống!", "ℹ️");
        return;
      }

      if (!confirm("Ba mẹ có chắc muốn xóa sạch toàn bộ các hòn đảo trên máy con để giao lại từ đầu không?")) {
        return;
      }

      appState.childRoadmap = [];
      appState.currentRoadmapIndex = 0;
      appState.activeTask = null;
      appState.currentStepIndex = 0;

      if (window.miloBus) {
        window.miloBus.savePersistedState(appState);
        window.miloBus.broadcast('ROADMAP_UPDATED', {
          roadmap: [],
          currentIdx: 0
        });
      }

      renderParentActiveRoadmapList();
      renderChildIslandRoadmap();
      showToast("Đã Làm Mới Hải Trình", "Toàn bộ đảo đã được xóa sạch! Hãy giao bài mới cho bé nhé.", "✨");
    }
"""

# Insert roadmap_mgmt_funcs right before window.addEventListener('DOMContentLoaded', ...)
init_marker = "window.addEventListener('DOMContentLoaded', () => {"
if init_marker in content:
    content = content.replace(init_marker, roadmap_mgmt_funcs + "\n    " + init_marker)
    print("Inserted roadmap management functions")

# 8. Update window exports for parent functions
export_marker = "window.handleChildTextInputSubmit = handleChildTextInputSubmit;"
export_new = """window.handleChildTextInputSubmit = handleChildTextInputSubmit;
      window.renderParentActiveRoadmapList = renderParentActiveRoadmapList;
      window.parentRemoveRoadmapTask = parentRemoveRoadmapTask;
      window.parentClearChildRoadmap = parentClearChildRoadmap;"""

if export_marker in content and "parentRemoveRoadmapTask" not in content:
    content = content.replace(export_marker, export_new)
    print("Added window exports for parentRemoveRoadmapTask")

# 9. In DOMContentLoaded, call renderParentActiveRoadmapList()
dom_load_marker = "renderChildIslandRoadmap();"
dom_load_new = """renderChildIslandRoadmap();
      // 5b. Khởi tạo bảng quản lý hải trình bên máy mẹ
      renderParentActiveRoadmapList();"""

content = content.replace(dom_load_marker, dom_load_new, 1)
print("Updated DOMContentLoaded to call renderParentActiveRoadmapList()")

# 10. In dispatchSelectedCatalogTasks(), ensure renderParentActiveRoadmapList() is called
dispatch_marker = "showToast(\"Lộ Trình Đảo Đã Cập Nhật\""
dispatch_new = """renderParentActiveRoadmapList();
      showToast("Lộ Trình Đảo Đã Cập Nhật\""""

content = content.replace(dispatch_marker, dispatch_new, 1)
print("Updated dispatchSelectedCatalogTasks to call renderParentActiveRoadmapList()")

# 11. Update parentDispatchAiTask to accept mode ('replace' vs 'append')
ai_dispatch_func_old = """    function parentDispatchAiTask() {
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
        childSwitchScreen('home');
      }

      showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của con!`, "🚀");
    }"""

ai_dispatch_func_new = """    function parentDispatchAiTask(mode = 'replace') {
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

if ai_dispatch_func_old in content:
    content = content.replace(ai_dispatch_func_old, ai_dispatch_func_new)
    print("Updated parentDispatchAiTask with append/replace")

# 12. Update parentDispatchManualTask to accept mode ('replace' vs 'append')
manual_dispatch_func_old = """    function parentDispatchManualTask() {
      playSfx('bell');
      const title = document.getElementById('manual-task-title').value.trim() || "Nhiệm vụ tự soạn";
      const cat = document.getElementById('manual-task-cat').value;
      const reward = parseInt(document.getElementById('manual-task-reward').value) || 120;
      const stepInputs = document.querySelectorAll('.manual-step-input');
      
      const dynamicSteps = [];
      stepInputs.forEach((inp, idx) => {
        const val = inp.value.trim();
        if (val) {
          dynamicSteps.push({
            step_id: idx + 1,
            badge: `Bước ${idx + 1}`,
            text: val,
            duration_sec: 60,
            ui_type: 'single_choice',
            choices: ["Tôi đã làm xong", "Cần thêm 1 phút"],
            expected_answer: "Tôi đã làm xong"
          });
        }
      });

      if (dynamicSteps.length === 0) {
        alert("Vui lòng nhập ít nhất 1 bước hành động!");
        return;
      }

      const customTask = {
        id: 'CUSTOM_MANUAL_' + Date.now(),
        grade: 1,
        subject: cat === 'chore' ? 'hoat_dong_trai_nghiem' : 'toan',
        cat: cat,
        catName: cat === 'chore' ? 'Sinh hoạt' : 'Bài tập',
        icon: cat === 'chore' ? '🧹' : '📐',
        title: title,
        reward: reward,
        stepSeconds: 60,
        steps: dynamicSteps
      };

      taskDatabase[customTask.id] = customTask;

      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: [customTask],
          islandName: `Đảo Thử Thách: ${title}`,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = [customTask];
        appState.currentRoadmapIndex = 0;
        appState.activeTask = customTask;
        renderChildIslandRoadmap();
        childSwitchScreen('home');
      }

      showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "🚀");
    }"""

manual_dispatch_func_new = """    function parentDispatchManualTask(mode = 'replace') {
      playSfx('bell');
      const title = document.getElementById('manual-task-title').value.trim() || "Nhiệm vụ tự soạn";
      const cat = document.getElementById('manual-task-cat').value;
      const reward = parseInt(document.getElementById('manual-task-reward').value) || 120;
      const stepInputs = document.querySelectorAll('.manual-step-input');
      
      const dynamicSteps = [];
      stepInputs.forEach((inp, idx) => {
        const val = inp.value.trim();
        if (val) {
          dynamicSteps.push({
            step_id: idx + 1,
            badge: `Bước ${idx + 1}`,
            text: val,
            duration_sec: 60,
            ui_type: 'single_choice',
            choices: ["Tôi đã làm xong", "Cần thêm 1 phút"],
            expected_answer: "Tôi đã làm xong"
          });
        }
      });

      if (dynamicSteps.length === 0) {
        alert("Vui lòng nhập ít nhất 1 bước hành động!");
        return;
      }

      const customTask = {
        id: 'CUSTOM_MANUAL_' + Date.now(),
        grade: 1,
        subject: cat === 'chore' ? 'hoat_dong_trai_nghiem' : 'toan',
        cat: cat,
        catName: cat === 'chore' ? 'Sinh hoạt' : 'Bài tập',
        icon: cat === 'chore' ? '🧹' : '📐',
        title: title,
        reward: reward,
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
            islandName: `Đảo Thử Thách: ${title}`,
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
        showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy con!`, "🚀");
      }
    }"""

if manual_dispatch_func_old in content:
    content = content.replace(manual_dispatch_func_old, manual_dispatch_func_new)
    print("Updated parentDispatchManualTask with append/replace")

# 13. Update initial state childRoadmap to be flexible (empty)
state_roadmap_old = """      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [
        taskDatabase['G1_MATH_01']    // Đảo 1: Khởi đầu bài tập
      ],"""

state_roadmap_new = """      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [], // Bắt đầu rỗng linh hoạt, phụ huynh toàn quyền giao hoặc xóa bài"""

if state_roadmap_old in content:
    content = content.replace(state_roadmap_old, state_roadmap_new)
    print("Updated appState.childRoadmap to be flexible []")

# Write out patched index.html
with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: index.html patched successfully!")
