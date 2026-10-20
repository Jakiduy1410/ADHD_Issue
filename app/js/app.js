/* ============================================================
   MODULE: MAIN APPLICATION ENTRY POINT & LIFECYCLE BOOTSTRAP
   Server-Authoritative State & WebSocket Real-time Hydration
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Nạp danh mục bài tập từ API / Server (Single Source of Truth: data/curriculum/tasks_db.json)
  if (typeof syncTasksFromApi === 'function') {
    syncTasksFromApi();
  }

  // 2. Khởi tạo MiloSyncBus toàn cục & kết nối WebSocket
  window.miloBus = new MiloSyncBus();
  registerMiloSyncSubscribers(window.miloBus);

  // 3. Phục hồi trạng thái lưu trữ ngoại tuyến nếu có trước khi nhận snapshot từ WebSocket
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
        t.id &&
        Array.isArray(t.steps) &&
        t.steps.length > 0
      ));
      if (validTasks.length > 0) {
        appState.childRoadmap = validTasks;
      }
    }
    if (saved.currentRoadmapIndex !== undefined && saved.currentRoadmapIndex >= 0 && saved.currentRoadmapIndex < appState.childRoadmap.length) {
      appState.currentRoadmapIndex = saved.currentRoadmapIndex;
    } else {
      appState.currentRoadmapIndex = 0;
    }
    appState.activeTask = (appState.childRoadmap && appState.childRoadmap.length > 0)
      ? (appState.childRoadmap[appState.currentRoadmapIndex] || appState.childRoadmap[0])
      : null;

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

  // 4. URL Parameter role auto-switch (?role=child, ?role=parent, ?role=dual)
  const urlParams = new URLSearchParams(window.location.search);
  const paramRole = urlParams.get('role');
  if (paramRole === 'child' || paramRole === 'parent' || paramRole === 'dual') {
    setViewMode(paramRole);
    window.miloBus.role = paramRole;
  }

  // 5. Khởi tạo giao diện ban đầu (Sẽ tự động cập nhật khi nhận WebSocket snapshot)
  renderParentCatalogList();
  renderChildIslandRoadmap();
  updateCognitiveProfileUI(appState.cognitiveProfile);
});