window.UNLOCK_ALL_ROUTINES = false;
/* ============================================================
   MODULE: ISLAND QUEST ROADMAP & S-CURVE BÉZIER TRAIL
   ============================================================ */
    function renderChildIslandRoadmap() {
      const rawRoadmap = Array.isArray(appState.childRoadmap) ? appState.childRoadmap : [];
      const roadmap = rawRoadmap.filter(t => t && typeof t === 'object' && t.id && Array.isArray(t.steps) && t.steps.length > 0);
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
          startQuestBtn.onclick = function(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            startChildQuest();
          };
          startQuestBtn.className = isChore
            ? "w-full btn-3d-amber text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
            : "w-full btn-3d-green text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition";
          startQuestBtn.innerHTML = `<span>VÀO BUỒNG LÁI TẬP TRUNG!</span> <span class="text-xl">🚀</span>`;
        }
      }

      const nextNode = document.getElementById('node-island-next');
      if (nextNode) {
        if (curIdx >= totalIslands - 1 || isAllCompleted) {
          nextNode.classList.add('hidden');
        } else {
          nextNode.classList.remove('hidden');
        }
      }

      // 3. TÍNH TOÁN TỌA ĐỘ VÀ VẼ ĐƯỜNG MÒN S-CURVE NỐI CÁC ĐẢO (SVG QUEST TRAIL)
      const points = [];
      for (let r = totalIslands; r >= 1; r--) {
        const xr = (totalIslands === 1) ? 170 : ((r % 2 === 1) ? 218 : 122);
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
        <svg id="svg-quest-trail" class="absolute inset-0 w-full pointer-events-none z-0" viewBox="0 0 340 ${totalHeight}" preserveAspectRatio="none" style="height: ${totalHeight}px; min-height: 100%;" fill="none">
          <!-- Vết bước chân / đường mòn đá cuội nối toàn bộ hải trình -->
          <path id="svg-quest-path-base" d="${fullPathD}" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round" stroke-dasharray="14 14"/>
          <!-- Đường mòn ánh sao phát sáng cho các đảo đã hoàn thành -->
          ${conqueredPathD ? `<path id="svg-quest-path-conquered" d="${conqueredPathD}" stroke="${isAllCompleted ? '#F59E0B' : '#10B981'}" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10" class="animate-pulse"/>` : ''}
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
            <div id="node-island-active" data-island-index="${i}" class="relative z-20 flex flex-col items-center my-2.5 ${alignClass}">
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

              <div class="mt-1.5 text-center max-w-[200px]">
                <div class="flex items-center justify-center gap-1 mb-0.5">
                  <span id="child-current-badge" class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${isChore ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-teal-100 text-teal-900 border-teal-300'}">
                    Đang Chinh Phục 🎯
                  </span>
                </div>
                <h2 id="child-current-title" class="text-xs font-black text-slate-800 leading-snug truncate px-1">${t.title}</h2>
              </div>
            </div>
          `;
        } else if (isDone) {
          islandsHtml += `
            <div data-island-index="${i}" class="relative z-10 flex flex-col items-center my-2 cursor-pointer opacity-90 hover:opacity-100 transition ${alignClass}" onclick="showToast('Đảo Đã Hoàn Thành', 'Leo đã chinh phục xuất sắc hòn đảo này! ⭐', '✅')">
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
            <div data-island-index="${i}" class="relative z-10 flex flex-col items-center my-2 opacity-65 cursor-pointer hover:opacity-85 transition ${alignClass}" onclick="selectQueuedIsland(${i})">
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
        mapContainer.innerHTML = `
          <div class="roadmap-canvas relative w-full flex flex-col items-center justify-between py-2" style="height: ${totalHeight}px; min-height: 100%;">
            ${svgTrailHtml}
            ${islandsHtml}
          </div>
        `;
        initRoadmapDragScroll(mapContainer);
        // Tự động cuộn nội bộ chỉ trong mapContainer, TUYỆT ĐỐI không dùng scrollIntoView làm trôi khung màn hình
        setTimeout(() => {
          const screenContainer = document.getElementById('child-screen-container');
          if (screenContainer) screenContainer.scrollTop = 0;
          const homeScreen = document.getElementById('child-screen-home');
          if (homeScreen) homeScreen.scrollTop = 0;

          const activeNode = document.getElementById('node-island-active');
          if (activeNode && mapContainer) {
            const nodeOffset = activeNode.offsetTop;
            const containerH = mapContainer.clientHeight || 450;
            mapContainer.scrollTop = Math.max(0, nodeOffset - containerH / 2 + 30);
          }
          if (typeof snapRoadmapTrailToDOM === 'function') {
            snapRoadmapTrailToDOM(mapContainer, false);
          }
        }, 50);
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

    function selectQueuedIsland(offset) {
      playSfx('tap');
      showToast("Đảo Trong Hải Trình", "Hãy hoàn thành xong Đảo hiện tại để mở khóa Đảo kế tiếp bạn nhé!", "🔒");
    }

    function alertTreasureStatus() {
      playSfx('tap');
      const routineBtn = document.getElementById('child-tab-routine-btn');
      const isRoutineTab = routineBtn && routineBtn.classList.contains('bg-amber-400');

      if (isRoutineTab) {
        // RƯƠNG BÁU CỦA ĐẢO THÓI QUEN (ROUTINE)
        const routines = appState.childRoutineRoadmap || [];
        const completed = appState.completedRoutineIds || new Set();
        const remaining = routines.filter(r => {
          const id = typeof r === 'string' ? r : (r ? r.id : null);
          return id && !completed.has(id);
        }).length;

        if (routines.length > 0 && remaining === 0) {
          if (typeof openRoutineTreasureCeremony === 'function') {
            openRoutineTreasureCeremony();
          }
        } else {
          showToast("Rương Hoàng Kim Nề Nếp 🔒", `Cần hoàn thành nốt ${remaining} thói quen sinh hoạt hôm nay để mở rương nhé Leo!`, "🏆");
        }
        return;
      }

      // RƯƠNG BÁU CỦA ĐẢO HỌC TẬP (GDPT)
      const total = (appState.childRoadmap || []).length;
      if (total > 0 && appState.currentRoadmapIndex >= total) {
        if (typeof openTreasureCeremony === 'function') {
          openTreasureCeremony();
        }
      } else {
        const remaining = Math.max(0, total - (appState.currentRoadmapIndex || 0));
        showToast("Rương Báu Hoàng Kim 🔒", `Cần hoàn thành nốt ${remaining} hòn đảo bài tập để mở rương báu và đổi Vé Vàng!`, "🏆");
      }
    }

    function startChildQuest() {
      appState.activeTaskIsRoutine = false;
      // Khóa không cho bỏ chạy sang học bài khi bếp/nồi đang nấu thức ăn dở
      const runningTimer = (window.miloActiveTimers || []).find(t => !t.isCompleted && t.endTime > Date.now());
      if (runningTimer && runningTimer.taskId && !window.UNLOCK_ALL_ROUTINES) {
        if (typeof showToast === 'function') {
          showToast("Bếp Đang Nấu! ♨️", `Lò đang hâm nóng món [${runningTimer.dishName}] nè Leo! Con hoàn thành nốt Bữa sáng rồi hẵng sang học bài nhé!`, "⏳");
        }
        return;
      }
      playSfx('tap');
      appState.currentStepIndex = 0;
      appState.selectedClues.clear();
      appState.cleanedItems.clear();
      appState.numpadValue = "";

      const rawRoadmap = Array.isArray(appState.childRoadmap) ? appState.childRoadmap : [];
      const curIdx = Math.max(0, Math.min(appState.currentRoadmapIndex || 0, Math.max(0, rawRoadmap.length - 1)));
      const task = appState.activeTask || rawRoadmap[curIdx] || taskDatabase['G1_MATH_01'];
      appState.activeTask = task;

      // Switch screen hiển thị Buồng lái
      childSwitchScreen('workspace');

      const isChore = (task && task.cat === 'chore');
      const wsTagEl = document.getElementById('child-workspace-island-tag');
      if (wsTagEl) {
        if (isChore) {
          wsTagEl.innerText = "ĐẢO SINH HOẠT THƯ THÁI 🌿";
          wsTagEl.className = "text-[10px] font-black px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300";
        } else {
          wsTagEl.innerText = "ĐẢO BÀI TẬP TẬP TRUNG 🎯";
          wsTagEl.className = "text-[10px] font-black px-2 py-0.5 rounded-full border bg-teal-100 text-teal-800 border-teal-300";
        }
      }
      const titleSnippet = (task && task.title) ? (task.title.length > 16 ? task.title.slice(0, 16) + '...' : task.title) : 'Đảo Nhiệm Vụ';
      const wsNameEl = document.getElementById('child-workspace-island-name');
      if (wsNameEl) {
        wsNameEl.innerText = `🏝️ Đảo ${curIdx + 1}: ${titleSnippet}`;
      }
      renderChildWorkspaceStep();
    }


    /* ============================================================
       PARENT ACTIVE ROADMAP MANAGEMENT
       ============================================================ */
    function renderParentActiveRoadmapList() {
      const container = document.getElementById('parent-active-roadmap-list');
      const badge = document.getElementById('parent-roadmap-count-badge');
      const titleEl = document.getElementById('parent-roadmap-title');
      const subEl = document.getElementById('parent-roadmap-sub');
      const iconEl = document.getElementById('parent-roadmap-icon');
      if (!container) return;

      const mode = appState.assignMode || 'catalog';

      if (mode === 'routines') {
        // --- CHẾ ĐỘ SINH HOẠT (ROUTINES) ---
        if (titleEl) titleEl.innerText = "Lộ Trình Thói Quen Đang Chinh Phục";
        if (subEl) subEl.innerText = "Các nề nếp sinh hoạt đang hiển thị trên Đảo Thói Quen của Leo";
        if (iconEl) iconEl.innerText = "🌟";

        const routinesDb = window.routineDatabase || {};
        let routineList = appState.childRoutineRoadmap;
        if (routineList === undefined || routineList === null) {
          routineList = [
            routinesDb['routine_morning_bed'],
            routinesDb['routine_afterschool_drop'],
            routinesDb['routine_clean_desk'],
            routinesDb['routine_night_teeth']
          ].filter(Boolean);
          appState.childRoutineRoadmap = routineList;
        }

        const validRoutines = routineList.map(r => (typeof r === 'string' ? routinesDb[r] : r)).filter(Boolean);

        if (badge) {
          badge.innerText = `${validRoutines.length} thói quen`;
          badge.className = "text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full";
        }

        if (validRoutines.length === 0) {
          container.innerHTML = `
            <div class="bg-white/80 border border-dashed border-amber-300 rounded-xl p-3 text-center">
              <p class="text-[11px] font-bold text-amber-900 mb-0.5">Đảo thói quen hiện tại đang trống 🌟</p>
              <p class="text-[9px] text-slate-600 leading-snug">
                Hãy tick chọn thói quen bên dưới, rồi bấm <strong>"Giao thói quen sang máy con"</strong> nhé!
              </p>
            </div>
          `;
          return;
        }

        let html = '';
        validRoutines.forEach((rt, idx) => {
          let slotText = "";
          if (rt.timeline_slot === 'morning') slotText = `🌅 Sáng ${rt.slot_time || '06:30'}`;
          else if (rt.timeline_slot === 'afternoon') slotText = `🌇 Chiều ${rt.slot_time || '16:30'}`;
          else if (rt.timeline_slot === 'evening') slotText = `🌙 Tối ${rt.slot_time || '19:00'}`;
          else slotText = `✨ Ngủ ${rt.slot_time || '21:00'}`;

          const timeLocked = typeof isRoutineTimeLocked === 'function' ? isRoutineTimeLocked(rt) : false;
          const hasProof = !!(appState.routinePhotoProofs && appState.routinePhotoProofs[rt.id]);
          const isDone = appState.completedRoutineIds && appState.completedRoutineIds.has(rt.id) && (!timeLocked || hasProof);
          const isLocked = !isDone && timeLocked;
          let statusBadge = isDone 
            ? `<span class="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1 rounded border border-emerald-300">✓ Xong</span>`
            : (isLocked 
                ? `<span class="text-[8px] font-black text-slate-500 bg-slate-100 px-1 rounded border border-slate-300">🔒 Chờ giờ</span>`
                : `<span class="text-[8px] font-black text-amber-900 bg-amber-200 px-1 rounded border border-amber-300">⚡ Mở</span>`);

          html += `
            <div class="bg-white rounded-xl p-2 border border-amber-200 hover:border-amber-300 flex items-center justify-between gap-2 shadow-2xs">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="w-5 h-5 rounded-lg bg-amber-500 text-amber-950 font-black text-[10px] flex items-center justify-center shrink-0">
                  ${idx + 1}
                </span>
                <span class="text-base shrink-0">${rt.icon || '🌟'}</span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1">
                    <span class="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                      ${slotText}</span> ${statusBadge} <span class="hidden">
                    </span>
                    <span class="text-[8px] font-extrabold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                      +${rt.reward || 20} ⭐
                    </span>
                  </div>
                  <p class="text-[11px] font-bold text-slate-800 truncate">${rt.title}</p>
                  <p class="text-[9px] text-slate-500">${rt.steps ? rt.steps.length : 3} vi bước • 📸 Chụp ảnh</p>
                </div>
              </div>
              <button onclick="parentRemoveRoutineTask(${idx})" title="Xóa thói quen này khỏi đảo của con" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 active:scale-95 cursor-pointer">
                <span class="text-sm">🗑️</span>
              </button>
            </div>
          `;
        });
        container.innerHTML = html;

      } else {
        // --- CHẾ ĐỘ BÀI TẬP GDPT (CATALOG / CUSTOM) ---
        if (titleEl) titleEl.innerText = "Hải Trình Đang Chinh Phục";
        if (subEl) subEl.innerText = "Các hòn đảo bài tập đang hiển thị trên Đảo Học Tập của Leo";
        if (iconEl) iconEl.innerText = "🏝️";

        const rawRoadmap = Array.isArray(appState.childRoadmap) ? appState.childRoadmap : [];
        const roadmap = rawRoadmap.filter(t => t && typeof t === 'object' && t.id);
        if (badge) {
          badge.innerText = `${roadmap.length} đảo`;
          badge.className = "text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full";
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

    function parentRemoveRoutineTask(index) {
      playSfx('tap');
      if (!Array.isArray(appState.childRoutineRoadmap) || index < 0 || index >= appState.childRoutineRoadmap.length) return;
      const removed = appState.childRoutineRoadmap.splice(index, 1)[0];

      if (removed && removed.id) {
        if (appState.selectedRoutineIds) {
          appState.selectedRoutineIds.delete(removed.id);
        }
        if (appState.completedRoutineIds) {
          appState.completedRoutineIds.delete(removed.id);
        }
        if (appState.routinePhotoProofs) {
          delete appState.routinePhotoProofs[removed.id];
        }
        if (typeof updateRoutineSelectedMeta === 'function') updateRoutineSelectedMeta();
        if (typeof renderParentRoutinesCatalog === 'function') renderParentRoutinesCatalog();
      }

      const bus = window.miloBus || window.syncBus;
      if (bus && typeof bus.broadcast === 'function') {
        bus.broadcast('ROUTINE_ASSIGN_BATCH', {
          routines: appState.childRoutineRoadmap,
          timestamp: Date.now()
        });
      }
      if (bus && typeof bus.savePersistedState === 'function') {
        bus.savePersistedState(appState);
      }

      if (typeof window.renderChildRoutineRoadmapFromTasks === 'function') {
        window.renderChildRoutineRoadmapFromTasks(appState.childRoutineRoadmap);
      }

      renderParentActiveRoadmapList();
      showToast("Đã Xóa Thói Quen", `Đã gỡ [${removed ? removed.title : 'Thói quen'}] khỏi Đảo Thói Quen của Leo!`, "🗑️");
    }

    function parentClearRoutinesOnly() {
      playSfx('tap');
      if (!confirm("Ba mẹ có chắc muốn xóa sạch toàn bộ các thói quen trên Đảo Thói Quen của con để giao lại từ đầu không?")) {
        return;
      }

      appState.childRoutineRoadmap = [];
      appState.routineCleared = true;
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('milo_routine_cleared', 'true'); } catch(_) {}

      appState.completedRoutineIds = new Set();
      appState.routinePhotoProofs = {};
      appState.selectedActiveRoutineId = null;
      appState.currentRoutineIndex = 0;

      if (appState.activeTask && appState.activeTask.cat === 'routine') {
        appState.activeTask = null;
      }

      if (appState.selectedRoutineIds) {
        appState.selectedRoutineIds.clear();
        if (typeof updateRoutineSelectedMeta === 'function') updateRoutineSelectedMeta();
        if (typeof renderParentRoutinesCatalog === 'function') renderParentRoutinesCatalog();
      }

      const bus = window.miloBus || window.syncBus;
      if (bus && typeof bus.broadcast === 'function') {
        bus.broadcast('ROUTINE_ASSIGN_BATCH', {
          routines: [],
          timestamp: Date.now()
        });
      }
      if (bus && typeof bus.savePersistedState === 'function') {
        bus.savePersistedState(appState);
      }

      if (typeof window.renderChildRoutineRoadmapFromTasks === 'function') {
        window.renderChildRoutineRoadmapFromTasks([]);
      }

      const counter = document.getElementById('child-roadmap-counter');
      const routineBtn = document.getElementById('child-tab-routine-btn');
      const isRoutineTab = routineBtn && routineBtn.classList.contains('bg-amber-400');
      if (counter && isRoutineTab) {
        counter.innerHTML = `<span class="text-slate-500 font-bold">Đảo thói quen trống (0 nề nếp)</span>`;
      }

      renderParentActiveRoadmapList();
      showToast("Đã Xóa Sạch Thói Quen", "Toàn bộ thói quen đã được xóa sạch trên cả hai máy! Hãy giao nề nếp mới cho bé nhé.", "🗑️");
    }

    function parentClearChildRoadmap() {
      playSfx('tap');
      const mode = appState.assignMode || 'catalog';

      if (mode === 'routines') {
        parentClearRoutinesOnly();
      } else {
        if (!Array.isArray(appState.childRoadmap) || appState.childRoadmap.length === 0) {
          showToast("Hải Trình Trống", "Hải trình của con hiện đang trống!", "ℹ️");
          return;
        }

        if (!confirm("Ba mẹ có chắc muốn xóa sạch toàn bộ các hòn đảo trên máy con để giao lại từ đầu không?")) {
          return;
        }

        appState.childRoadmap = [];
        appState.roadmapCleared = true;
        try { if (typeof localStorage !== 'undefined') localStorage.setItem('milo_roadmap_cleared', 'true'); } catch(_) {}

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
    }

    function snapRoadmapTrailToDOM(container, isRoutine) {
      if (!container) return;
      const canvas = container.querySelector('.roadmap-canvas');
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      if (!canvasRect || canvasRect.width === 0 || canvasRect.height === 0) return;

      const treasureEl = container.querySelector(isRoutine ? '#node-routine-treasure' : '#node-treasure-island');
      if (!treasureEl) return;
      const treasureBtn = treasureEl.querySelector('.w-16, div') || treasureEl;
      const tRect = treasureBtn.getBoundingClientRect();

      // Lấy toàn bộ các nốt đảo theo thuộc tính data (từ index 0 là đảo sớm nhất ở đáy)
      const indexAttr = isRoutine ? 'data-routine-index' : 'data-island-index';
      const islandEls = container.querySelectorAll(`[${indexAttr}]`);
      if (!islandEls || islandEls.length === 0) return;

      const points = [];
      const total = islandEls.length;
      for (let i = 0; i < total; i++) {
        const el = container.querySelector(`[${indexAttr}="${i}"]`);
        if (el) {
          // Canh chính xác vào tâm điểm của nút bấm 3D hình tròn/bo góc
          const btn = el.querySelector('#child-island-btn, #node-routine-btn-active, .w-20, .w-14') || el;
          const bRect = btn.getBoundingClientRect();
          const x = Math.round(bRect.left - canvasRect.left + bRect.width / 2);
          const y = Math.round(bRect.top - canvasRect.top + bRect.height / 2);
          points.push({ x, y, islandIndex: i });
        }
      }

      if (points.length === 0) return;

      // Đỉnh: Tâm điểm rương báu cúp vàng
      const tx = Math.round(tRect.left - canvasRect.left + tRect.width / 2);
      const ty = Math.round(tRect.top - canvasRect.top + tRect.height / 2);
      points.push({ x: tx, y: ty, isTreasure: true });

      // ĐỒNG BỘ 100% VIEWBOX VÀ WIDTH/HEIGHT CỦA SVG THEO CANVAS THỰC TẾ (BAO PHỦ TẬN ĐÁY)
      const svg = container.querySelector(isRoutine ? '#svg-routine-trail' : '#svg-quest-trail') || container.querySelector('svg');
      if (svg) {
        const cWidth = Math.round(canvasRect.width);
        const maxPointY = points.reduce((m, p) => Math.max(m, p.y), 0);
        const cHeight = Math.max(canvas.scrollHeight, canvas.offsetHeight, Math.round(canvasRect.height), maxPointY + 85);
        svg.setAttribute('viewBox', `0 0 ${cWidth} ${cHeight}`);
        svg.setAttribute('width', cWidth);
        svg.setAttribute('height', cHeight);
        svg.style.width = cWidth + 'px';
        svg.style.height = cHeight + 'px';
        canvas.style.minHeight = cHeight + 'px';
      }

      // Xây dựng đường cong Bézier toàn trình đi xuyên qua tâm mọi đảo
      let fullD = `M ${points[0].x} ${points[0].y}`;
      for (let k = 0; k < points.length - 1; k++) {
        const p1 = points[k];
        const p2 = points[k + 1];
        const midY = Math.round((p1.y + p2.y) / 2);
        fullD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
      }

      const basePath = container.querySelector(isRoutine ? '#svg-routine-path-base' : '#svg-quest-path-base') || container.querySelector('svg path');
      if (basePath) {
        basePath.setAttribute('d', fullD);
      }

      // Xây dựng đường cong conquered nếu có
      const completedSet = appState.completedRoutineIds || new Set();
      let maxConqueredIdx = 0;
      if (isRoutine) {
        const routines = appState.childRoutineRoadmap || [];
        for (let i = 0; i < total; i++) {
          const rt = routines[i];
          if (rt && completedSet.has(rt.id)) {
            maxConqueredIdx = Math.max(maxConqueredIdx, i + 1);
          }
        }
        if (routines.length > 0 && routines.every(r => completedSet.has(r.id))) {
          maxConqueredIdx = points.length - 1;
        }
      } else {
        const isAllDone = (appState.currentRoadmapIndex >= total);
        maxConqueredIdx = isAllDone ? (points.length - 1) : (appState.currentRoadmapIndex || 0);
      }

      const conqPath = container.querySelector(isRoutine ? '#svg-routine-path-conquered' : '#svg-quest-path-conquered');
      if (conqPath) {
        if (maxConqueredIdx > 0) {
          let conqD = `M ${points[0].x} ${points[0].y}`;
          for (let k = 0; k < maxConqueredIdx; k++) {
            const p1 = points[k];
            const p2 = points[k + 1];
            const midY = Math.round((p1.y + p2.y) / 2);
            conqD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
          }
          conqPath.setAttribute('d', conqD);
          conqPath.style.display = '';
        } else {
          conqPath.setAttribute('d', '');
          conqPath.style.display = 'none';
        }
      }
    }

    function initRoadmapDragScroll(container) {
      if (!container || container.dataset.dragInit === 'true') return;
      container.dataset.dragInit = 'true';

      let isDown = false;
      let startY = 0;
      let startScrollTop = 0;
      let hasDragged = false;
      let capturedPointerId = null;
      const dragThreshold = 10; // Ngưỡng 10px để phân biệt rạch ròi giữa click và kéo cuộn

      container.style.cursor = 'grab';
      container.style.touchAction = 'pan-y';

      // Chặn triệt để native drag drop của trình duyệt khi kéo qua text hoặc icon emoji
      container.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });

      container.addEventListener('pointerdown', (e) => {
        // Chỉ nhận chuột trái hoặc cảm ứng chạm ngón tay
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        startY = e.clientY;
        startScrollTop = container.scrollTop;
        capturedPointerId = null;
        // TUYỆT ĐỐI KHÔNG setPointerCapture ở pointerdown để không cướp mất click của đảo/nút con
      });

      window.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const deltaY = e.clientY - startY;
        // Chỉ khi di chuyển vượt quá ngưỡng 10px mới chính thức kích hoạt chế độ Drag
        if (!hasDragged && Math.abs(deltaY) > dragThreshold) {
          hasDragged = true;
          container.style.cursor = 'grabbing';
          container.classList.add('select-none');
          if (e.pointerId !== undefined) {
            capturedPointerId = e.pointerId;
            try {
              container.setPointerCapture(e.pointerId);
            } catch (_) {}
          }
        }
        if (hasDragged) {
          e.preventDefault();
          container.scrollTop = startScrollTop - deltaY;
        }
      });

      const finishDrag = (e) => {
        if (!isDown) return;
        isDown = false;
        if (capturedPointerId !== null) {
          try {
            container.releasePointerCapture(capturedPointerId);
          } catch (_) {}
          capturedPointerId = null;
        }
        container.style.cursor = 'grab';
        container.classList.remove('select-none');
        // Reset hasDragged sau một nhịp ngắn để sự kiện click cùng lúc được kiểm tra chính xác
        setTimeout(() => {
          hasDragged = false;
        }, 80);
      };

      window.addEventListener('pointerup', finishDrag);
      window.addEventListener('pointercancel', finishDrag);

      // Chặn click nhầm vào đảo/nút CHỈ KHI người dùng THỰC SỰ kéo chuột (>10px)
      container.addEventListener('click', (e) => {
        if (hasDragged) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }, true);
    }

    // Expose roadmap APIs to global window object
    if (typeof window !== 'undefined') {
      window.startChildQuest = startChildQuest;
      window.renderChildIslandRoadmap = renderChildIslandRoadmap;
      window.selectQueuedIsland = selectQueuedIsland;
      window.alertTreasureStatus = alertTreasureStatus;
      window.parentRemoveRoadmapTask = parentRemoveRoadmapTask;
      window.parentRemoveRoutineTask = parentRemoveRoutineTask;
      window.parentClearRoutinesOnly = parentClearRoutinesOnly;
      window.parentClearChildRoadmap = parentClearChildRoadmap;
      window.renderParentActiveRoadmapList = renderParentActiveRoadmapList;
      window.initRoadmapDragScroll = initRoadmapDragScroll;
      window.snapRoadmapTrailToDOM = snapRoadmapTrailToDOM;

      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const mc = document.getElementById('child-island-map-container');
          if (mc && mc.style.display !== 'none' && !mc.classList.contains('hidden')) {
            snapRoadmapTrailToDOM(mc, false);
          }
          const rc = document.getElementById('child-routine-map-container');
          if (rc && rc.style.display !== 'none' && !rc.classList.contains('hidden')) {
            snapRoadmapTrailToDOM(rc, true);
          }
        }, 120);
      });
    }


    /* ============================================================
       DYNAMIC ROUTINE ROADMAP & S-CURVE ALIGNMENT (PERFECT TROPHY SYNC)
       ============================================================ */
    /* ============================================================
       TIMELINE & SIMULATED TIME ENGINE
       ============================================================ */
    function getSimulatedCurrentMinutes() {
      const mode = (appState && appState.simulatedTimeSlot) || 'morning';
      if (mode === 'morning') return 7 * 60; // 07:00
      if (mode === 'noon') return 11 * 60 + 30; // 11:30
      if (mode === 'afternoon') return 16 * 60 + 30; // 16:30
      if (mode === 'evening') return 20 * 60 + 30; // 20:30
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    function getRoutineMinutes(rt) {
      if (!rt) return 0;
      if (rt.slot_time) {
        const parts = rt.slot_time.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return parts[0] * 60 + parts[1];
        }
      }
      const defaultSlotMinutes = { morning: 7 * 60, noon: 11 * 60 + 30, afternoon: 16 * 60 + 30, evening: 19 * 60, night: 21 * 60 };
      return defaultSlotMinutes[rt.timeline_slot] || 7 * 60;
    }

    function isRoutineTimeLocked(rt) {
      if (window.UNLOCK_ALL_ROUTINES === true || (typeof appState !== 'undefined' && appState && appState.simulatedTimeSlot === 'all')) {
        return false;
      }
      if (!rt) return false;
      const currentMinutes = getSimulatedCurrentMinutes();
      const routineMinutes = getRoutineMinutes(rt);
      return routineMinutes > currentMinutes;
    }

    window.getSimulatedCurrentMinutes = getSimulatedCurrentMinutes;
    window.getRoutineMinutes = getRoutineMinutes;
    window.isRoutineTimeLocked = isRoutineTimeLocked;

    function renderChildRoutineRoadmapFromTasks(routinesList) {
      const container = document.getElementById('child-routine-map-container');
      if (!container) return;

      let routines = routinesList;
      if (routines === undefined || routines === null) {
        routines = appState.childRoutineRoadmap;
      }
      if (routines === undefined || routines === null) {
        routines = [];
      }

      const routinesDb = window.routineDatabase || {};
      const validRoutines = routines.map(r => (typeof r === 'string' ? routinesDb[r] : r)).filter(Boolean);
      const totalIslands = validRoutines.length;

      const counter = document.getElementById('child-roadmap-counter');
      const routineBtn = document.getElementById('child-tab-routine-btn');
      const isRoutineActive = routineBtn && routineBtn.classList.contains('bg-amber-400');
      if (counter && isRoutineActive) {
        counter.innerText = totalIslands > 0 ? `Đảo Thói Quen (${totalIslands} nề nếp)` : "Đảo thói quen trống (0 nề nếp)";
      }

      // Đồng bộ nút CTA đáy máy con khi ở tab thói quen
      const startQuestBtn = document.getElementById('child-btn-start-quest');
      const routineTabBtn = document.getElementById('child-tab-routine-btn');
      const isRoutineTab = routineTabBtn && routineTabBtn.classList.contains('bg-amber-400');

      // 1. EMPTY STATE
      if (totalIslands === 0) {
        if (startQuestBtn && isRoutineTab) {
          startQuestBtn.disabled = true;
          startQuestBtn.className = "w-full bg-slate-200 text-slate-500 font-bold text-sm py-3.5 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300";
          startQuestBtn.innerHTML = `<span>CHỜ BA MẸ GIAO NỀ NẾP... ⏳</span>`;
          startQuestBtn.onclick = function() {
            if (typeof showToast === 'function') showToast('Đảo Thói Quen Trống', 'Hãy nhờ ba mẹ tick chọn nề nếp bên Trạm Thấu Hiểu để bắt đầu nhé!', '🌟');
          };
        }
        container.innerHTML = `
          <div class="flex-1 relative flex flex-col items-center justify-center p-6 text-center min-h-[360px] my-auto">
            <div class="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner mb-3 animate-float">
              🌟
            </div>
            <h3 class="text-sm font-black text-slate-800 mb-1">Đảo thói quen đang trống!</h3>
            <p class="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              Chưa có nề nếp sinh hoạt nào. Ba mẹ hãy tick chọn thói quen bên <strong>Trạm Thấu Hiểu</strong> và bấm giao bài nhé!
            </p>
            <div class="mt-4 flex items-center gap-2 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-900">
              <span>🦁</span>
              <span>Milo đã sẵn sàng xuất phát</span>
            </div>
          </div>
        `;
        return;
      }

      // 2. TÍNH TOÁN TIẾN ĐỘ THÓI QUEN & TRẠNG THÁI ACTIVE (CHUẨN HÓA KHÓA GIỜ)
      const completedSet = appState.completedRoutineIds || new Set();
      const isRoutineEffectivelyDone = (r) => {
        const timeLocked = isRoutineTimeLocked(r);
        const hasProof = !!(appState.routinePhotoProofs && appState.routinePhotoProofs[r.id]);
        return completedSet.has(r.id) && (!timeLocked || hasProof);
      };
      const allDone = totalIslands > 0 && validRoutines.every(r => isRoutineEffectivelyDone(r));
      const uncompletedRoutines = validRoutines.filter(r => !isRoutineEffectivelyDone(r));
      const availableUncompleted = uncompletedRoutines.filter(r => !isRoutineTimeLocked(r));

      let activeRoutine = null;
      if (appState.selectedActiveRoutineId) {
        const found = availableUncompleted.find(r => r.id === appState.selectedActiveRoutineId);
        if (found) activeRoutine = found;
      }
      if (!activeRoutine && availableUncompleted.length > 0) {
        const simSlot = appState.simulatedTimeSlot || 'morning';
        const matchSlot = availableUncompleted.find(r => r.timeline_slot === simSlot || (simSlot === 'evening' && (r.timeline_slot === 'evening' || r.timeline_slot === 'night')));
        activeRoutine = matchSlot || availableUncompleted[0];
      }
      const activeRoutineId = activeRoutine ? activeRoutine.id : null;
      const isAllCompleted = allDone;
      const curIdx = activeRoutine ? validRoutines.findIndex(r => r.id === activeRoutine.id) : (allDone ? totalIslands - 1 : 0);

      if (startQuestBtn && isRoutineTab && validRoutines.length > 0) {
        if (allDone) {
          startQuestBtn.disabled = false;
          startQuestBtn.className = "w-full btn-3d-yellow text-slate-900 font-black text-sm py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer";
          startQuestBtn.innerHTML = `<span>ĐÃ CHINH PHỤC TẤT CẢ NỀ NẾP! 👑</span>`;
          startQuestBtn.onclick = function() {
            if (typeof alertTreasureStatus === 'function') alertTreasureStatus();
          };
        } else if (activeRoutine) {
          const titleSnippet = (activeRoutine.title && activeRoutine.title.length > 20) ? (activeRoutine.title.slice(0, 18) + '...') : activeRoutine.title;
          startQuestBtn.disabled = false;
          startQuestBtn.className = "w-full btn-3d-yellow text-slate-900 font-black text-base py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer";
          startQuestBtn.innerHTML = `<span>BẮT ĐẦU: ${titleSnippet}</span> <span class="text-xl">🌟</span>`;
          startQuestBtn.onclick = function(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (typeof startChildRoutineTask === 'function') startChildRoutineTask(activeRoutine.id);
          };
        } else {
          const nextLocked = validRoutines.find(r => !completedSet.has(r.id) && isRoutineTimeLocked(r));
          const lockTime = nextLocked ? (nextLocked.slot_time || 'mốc tiếp theo') : 'mốc giờ tới';
          startQuestBtn.disabled = true;
          startQuestBtn.className = "w-full bg-slate-200 text-slate-500 font-bold text-sm py-3.5 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300";
          startQuestBtn.innerHTML = `<span>CHỜ ĐẾN ${lockTime} ĐỂ MỞ TIẾP... 🔒</span>`;
          startQuestBtn.onclick = function() {
            if (nextLocked && typeof handleLockedRoutineClick === 'function') {
              handleLockedRoutineClick(nextLocked.id);
            }
          };
        }
      }
      if (false && startQuestBtn) {
        startQuestBtn.disabled = false;
        startQuestBtn.className = "w-full btn-3d-yellow text-slate-900 font-black text-base py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer";
        startQuestBtn.innerHTML = `<span>BẮT ĐẦU NỀ NẾP SINH HOẠT!</span> <span class="text-xl">🌟</span>`;
        const activeRoutineId = validRoutines[curIdx] ? validRoutines[curIdx].id : validRoutines[0].id;
        startQuestBtn.onclick = function(e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          if (typeof startChildRoutineTask === 'function') startChildRoutineTask(activeRoutineId);
        };
      }

      // 3. DYNAMIC POINTS & S-CURVE BÉZIER TRAIL (CANH CHÍNH XÁC VÀO CÚP VÀNG)
      const points = [];
      const stepY = 125;
      for (let r = totalIslands; r >= 1; r--) {
        const xr = (totalIslands === 1) ? 170 : ((r % 2 === 1) ? 218 : 122);
        const yr = 55 + r * stepY;
        points.push({ x: xr, y: yr, rowIndex: r, islandIndex: totalIslands - r });
      }
      // Điểm đỉnh: Rương báu cúp vàng tại tọa độ (170, 55)
      points.push({ x: 170, y: 55, rowIndex: 0, isTreasure: true });

      const totalHeight = 55 + totalIslands * stepY + 85;

      // Vẽ đường cong Bézier kết nối từ đảo dưới cùng lên đỉnh Cúp vàng
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
        <svg id="svg-routine-trail" class="absolute inset-0 w-full pointer-events-none z-0" viewBox="0 0 340 ${totalHeight}" preserveAspectRatio="none" style="height: ${totalHeight}px; min-height: 100%;" fill="none">
          <path id="svg-routine-path-base" d="${fullPathD}" stroke="#FDE68A" stroke-width="12" stroke-linecap="round" stroke-dasharray="14 14"/>
          ${conqueredPathD ? `<path id="svg-routine-path-conquered" d="${conqueredPathD}" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10" class="animate-pulse"/>` : ''}
        </svg>
      `;

      // 4. RENDER CÁC NỐT HÒN ĐẢO THEO PHÂN TẦNG THỊ GIÁC (VISUAL HIERARCHY)
      let islandsHtml = '';

      // Đỉnh: Cúp Vàng Rương Hoàng Kim (Căn chuẩn tâm điểm nối đường trail)
      islandsHtml += `
        <div id="node-routine-treasure" onclick="alertTreasureStatus()" class="relative z-10 flex flex-col items-center cursor-pointer transition hover:scale-105 my-2">
          <div class="w-16 h-16 rounded-3xl ${isAllCompleted ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-yellow-200 text-4xl animate-bounce shadow-2xl' : 'bg-gradient-to-tr from-amber-300 to-yellow-400 border-b-4 border-amber-600 text-3xl shadow-lg animate-pulse-glow'} flex items-center justify-center">
            ${isAllCompleted ? '✨🏆' : '🏆'}
          </div>
          <span class="text-[10px] font-black ${isAllCompleted ? 'text-amber-950 bg-yellow-300 border-amber-500 ring-2 ring-yellow-200' : 'text-amber-900 bg-amber-100 border-amber-300'} mt-1 border px-2.5 py-0.5 rounded-full shadow-xs">
            ${isAllCompleted ? 'RƯƠNG HOÀNG KIM MỞ BUNG! 👑' : 'RƯƠNG HOÀNG KIM 🔒'}
          </span>
        </div>
      `;

      for (let r = 1; r <= totalIslands; r++) {
        const i = totalIslands - r;
        const rt = validRoutines[i] || {};
        const isDone = isRoutineEffectivelyDone(rt);
        const isLocked = !isDone && isRoutineTimeLocked(rt);
        const isActive = !allDone && !isDone && (rt.id === activeRoutineId);



        const titleSnippet = (rt.title && rt.title.length > 20) ? (rt.title.slice(0, 18) + '...') : (rt.title || 'Nề nếp');
        const alignClass = (totalIslands === 1) ? 'translate-x-0' : ((r % 2 === 1) ? 'translate-x-12' : '-translate-x-12');

        if (isActive) {
          const miloAlignClass = (totalIslands === 1) ? '-left-14 top-1' : ((r % 2 === 1) ? '-left-14 top-1' : '-right-14 top-1');
          const runningTimerForThis = (window.miloActiveTimers || []).find(t => t.taskId === rt.id && !t.isCompleted && t.endTime > Date.now());
          const isCookingNow = !!runningTimerForThis;
          const statusBadgeText = isCookingNow ? `♨️ ĐANG NẤU: ${runningTimerForThis.dishName}` : `${rt.slot_time || '07:00'} • SẴN SÀNG 🚀`;

          islandsHtml += `
            <div id="node-routine-island-active" data-routine-id="${rt.id}" data-routine-index="${i}" class="relative z-20 flex flex-col items-center my-2 ${alignClass}">
              <div class="absolute ${miloAlignClass} flex flex-col items-center animate-milo pointer-events-none">
                <div class="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-md">
                  🦁
                </div>
              </div>

              <div id="node-routine-btn-active" onclick="startChildRoutineTask('${rt.id}')" class="w-20 h-20 rounded-[28px] btn-3d-yellow island-active-glow flex flex-col items-center justify-center text-slate-900 shadow-xl ring-8 ring-amber-200/80 cursor-pointer hover:scale-105 active:scale-95 transition">
                <span class="text-3xl mb-0.5">${rt.icon || '🌟'}</span>
                <span class="text-[9px] font-black uppercase tracking-wider bg-black/15 text-amber-950 px-2 py-0.5 rounded-full">+${rt.reward || 25} ⭐</span>
              </div>

              <div class="mt-1.5 text-center max-w-[190px]">
                <div class="flex items-center justify-center gap-1 mb-0.5">
                  <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${isCookingNow ? 'bg-amber-300 text-amber-950 border-amber-500 animate-pulse' : 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'}">
                    ${statusBadgeText}
                  </span>
                </div>
                <h2 class="text-xs font-black text-slate-900 leading-snug truncate px-1">${rt.title}</h2>
              </div>
            </div>
          `;
        } else if (isDone) {
          islandsHtml += `
            <div data-routine-id="${rt.id}" data-routine-index="${i}" class="relative z-10 flex flex-col items-center my-2 cursor-pointer opacity-90 hover:opacity-100 transition ${alignClass}" onclick="showToast('Thói Quen Hoàn Thành', 'Leo đã hoàn thành xuất sắc nề nếp này! ⭐', '✅')">
              <div class="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 flex flex-col items-center justify-center shadow-xs">
                <span class="text-xl">✅</span>
                <span class="text-[8px] font-black text-amber-800">+${rt.reward || 25} ⭐</span>
              </div>
              <span class="text-[9px] font-extrabold text-amber-900 mt-1 bg-white border border-amber-200 px-2.5 py-0.5 rounded-full shadow-xs max-w-[130px] truncate text-center">
                ${rt.title}
              </span>
            </div>
          `;
        } else if (isLocked) {
          islandsHtml += `
            <div data-routine-id="${rt.id}" data-routine-index="${i}" class="relative z-10 flex flex-col items-center my-2 opacity-50 cursor-pointer hover:opacity-75 transition ${alignClass}" onclick="handleLockedRoutineClick('${rt.id}')">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shadow-xs">
                <span class="text-xl">🔒</span>
                <span class="text-[8px] font-black text-slate-500">+${rt.reward || 25} ⭐</span>
              </div>
              <span class="text-[9px] font-bold text-slate-600 mt-1 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-xs max-w-[130px] truncate text-center flex items-center justify-center gap-1">
                <span>🔒</span> <span>${rt.slot_time || 'Chưa tới giờ'}</span>
              </span>
            </div>
          `;
        } else {
          islandsHtml += `
            <div data-routine-id="${rt.id}" data-routine-index="${i}" class="relative z-10 flex flex-col items-center my-2 opacity-85 cursor-pointer hover:opacity-100 hover:scale-105 transition ${alignClass}" onclick="startChildRoutineTask('${rt.id}')">
              <div class="w-14 h-14 rounded-2xl bg-amber-50/80 border-2 border-amber-200 flex flex-col items-center justify-center shadow-xs">
                <span class="text-xl">${rt.icon || '🌟'}</span>
                <span class="text-[8px] font-black text-amber-700">+${rt.reward || 25} ⭐</span>
              </div>
              <span class="text-[9px] font-extrabold text-amber-800 mt-1 bg-white/95 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-xs max-w-[130px] truncate text-center">
                ${rt.title}
              </span>
            </div>
          `;
        }
      }

      container.innerHTML = `
        <div class="roadmap-canvas relative w-full flex flex-col items-center gap-3 py-4" style="min-height: ${totalHeight}px;">
          ${svgTrailHtml}
          ${islandsHtml}
        </div>
      `;
      initRoadmapDragScroll(container);

      // Tự động cuộn đến nốt đảo thói quen active & Snap đường trail Bézier chuẩn xác
      setTimeout(() => {
        const screenContainer = document.getElementById('child-screen-container');
        if (screenContainer) screenContainer.scrollTop = 0;
        const homeScreen = document.getElementById('child-screen-home');
        if (homeScreen) homeScreen.scrollTop = 0;

        const activeNode = document.getElementById('node-routine-island-active');
        if (activeNode && container) {
          const nodeOffset = activeNode.offsetTop;
          const containerH = container.clientHeight || 450;
          container.scrollTop = Math.max(0, nodeOffset - containerH / 2 + 30);
        }
        if (typeof snapRoadmapTrailToDOM === 'function') {
          snapRoadmapTrailToDOM(container, true);
        }
      }, 50);
    }

    window.renderChildRoutineRoadmapFromTasks = renderChildRoutineRoadmapFromTasks;
