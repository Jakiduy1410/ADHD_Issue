/* ============================================================
   MODULE: MAIN APPLICATION ENTRY POINT & LIFECYCLE BOOTSTRAP
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  if (typeof syncTasksFromApi === 'function') {
    syncTasksFromApi();
  }

      // 1. Khởi tạo MiloSyncBus toàn cục
      window.miloBus = new MiloSyncBus();
      registerMiloSyncSubscribers(window.miloBus);

      // 2. Phục hồi trạng thái lưu trữ nếu có (LocalStorage State Hydration)
      const saved = window.miloBus.loadPersistedState();
      if (saved) {
        if (saved.stars !== undefined) {
          appState.stars = saved.stars;
          updateStarsEverywhere(saved.stars);
        }
        if (saved.childRoadmap && Array.isArray(saved.childRoadmap)) {
          const validTasks = saved.childRoadmap.filter(t => (
            t &&
            typeof t === 'object' &&
            t.id
          )).map(t => {
            // Luôn đồng bộ dữ liệu chuẩn mực mới nhất từ taskDatabase nếu có
            return (taskDatabase && taskDatabase[t.id]) ? taskDatabase[t.id] : t;
          }).filter(t => (
            t &&
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
        appState.activeTask = (appState.childRoadmap && appState.childRoadmap.length > 0)
          ? (appState.childRoadmap[appState.currentRoadmapIndex] || appState.childRoadmap[0])
          : null;
        if (appState.activeTask && taskDatabase && taskDatabase[appState.activeTask.id]) {
          appState.activeTask = taskDatabase[appState.activeTask.id];
        }

        // Đảm bảo currentStepIndex không vượt quá số bước của activeTask
        if (saved.currentStepIndex !== undefined && appState.activeTask && Array.isArray(appState.activeTask.steps) && saved.currentStepIndex >= 0 && saved.currentStepIndex < appState.activeTask.steps.length) {
          appState.currentStepIndex = saved.currentStepIndex;
        } else {
          appState.currentStepIndex = 0;
        }
        if (saved.pauseCount !== undefined) {
          appState.pauseCount = saved.pauseCount;
        }
        if (saved.totalSessionSeconds !== undefined) {
          appState.totalSessionSeconds = saved.totalSessionSeconds;
        }
        if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {
          const validIds = saved.selectedCatalogIds.filter(id => typeof id === 'string' && id.trim().length > 0);
          if (validIds.length > 0) {
            appState.selectedCatalogIds = new Set(validIds);
          }
        }
        if (saved.pendingTicket) {
          appState.pendingTicket = saved.pendingTicket;
          const banner = document.getElementById('parent-golden-ticket-banner');
          const redDot = document.getElementById('p-reward-dot');
          const desc = document.getElementById('parent-ticket-desc');
          if (banner) banner.classList.remove('hidden');
          if (redDot) redDot.classList.remove('hidden');
          if (desc) desc.innerText = `🎉 Leo vừa dùng ${saved.pendingTicket.cost} ⭐ để đổi [Vé Vàng: ${saved.pendingTicket.title}]!`;
        }
      }

      // 3. URL Parameter role auto-switch (?role=child, ?role=parent, ?role=dual)
      const urlParams = new URLSearchParams(window.location.search);
      const paramRole = urlParams.get('role');
      if (paramRole === 'child' || paramRole === 'parent' || paramRole === 'dual') {
        setViewMode(paramRole);
        window.miloBus.role = paramRole;
      }

      // 4. Khởi tạo danh sách catalog bên mẹ
      renderParentCatalogList();
      // 5. Khởi tạo lộ trình đảo bên máy con
      renderChildIslandRoadmap();
      // 6. Cập nhật huy hiệu Hồ sơ nhận thức trên header phụ huynh
      updateCognitiveProfileUI(appState.cognitiveProfile);
    });