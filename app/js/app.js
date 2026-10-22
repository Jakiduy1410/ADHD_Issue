/* ============================================================
   MODULE: MAIN APPLICATION ENTRY POINT & LIFECYCLE BOOTSTRAP
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Đồng bộ cơ sở dữ liệu đề xuất từ Backend API
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

    // Kiểm tra cờ người dùng đã chủ động xóa sạch bài tập GDPT
    const isRoadmapCleared = saved.roadmapCleared || (typeof localStorage !== 'undefined' && localStorage.getItem('milo_roadmap_cleared') === 'true');
    appState.roadmapCleared = isRoadmapCleared;
    if (isRoadmapCleared) {
      appState.childRoadmap = [];
      appState.currentRoadmapIndex = 0;
      appState.activeTask = null;
    } else if (saved.childRoadmap && Array.isArray(saved.childRoadmap)) {
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
    }

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

    // Kiểm tra cờ người dùng đã chủ động xóa sạch thói quen sinh hoạt
    const isRoutineCleared = saved.routineCleared || (typeof localStorage !== 'undefined' && localStorage.getItem('milo_routine_cleared') === 'true');
    appState.routineCleared = isRoutineCleared;
    if (isRoutineCleared) {
      appState.childRoutineRoadmap = [];
    } else if (saved.childRoutineRoadmap !== undefined && Array.isArray(saved.childRoutineRoadmap)) {
      appState.childRoutineRoadmap = saved.childRoutineRoadmap;
    }

    if (saved.selectedRoutineIds !== undefined && Array.isArray(saved.selectedRoutineIds)) {
      appState.selectedRoutineIds = new Set(saved.selectedRoutineIds);
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

  // 4.1 URL Parameter task auto-load (?task=G5_DEMO_DECIMAL or ?demo=1)
  const paramTask = urlParams.get('task') || (urlParams.get('demo') === '1' ? 'G5_DEMO_DECIMAL' : null);
  if (paramTask && typeof taskDatabase !== 'undefined' && taskDatabase[paramTask]) {
    const demoTask = taskDatabase[paramTask];
    appState.childRoadmap = [demoTask];
    appState.currentRoadmapIndex = 0;
    appState.activeTask = demoTask;
    appState.currentStepIndex = 0;
    setTimeout(() => {
      if (typeof startChildQuest === 'function') {
        startChildQuest();
      }
    }, 200);
  }

  // 5. Khởi tạo giao diện ban đầu (Sẽ tự động cập nhật khi nhận WebSocket snapshot)
  renderParentCatalogList();
  renderChildIslandRoadmap();
  if (typeof renderChildRoutineRoadmapFromTasks === 'function') {
    renderChildRoutineRoadmapFromTasks(appState.childRoutineRoadmap);
  }
  if (typeof renderParentActiveRoadmapList === 'function') {
    renderParentActiveRoadmapList();
  }
  if (typeof renderParentRoutinesCatalog === 'function') {
    renderParentRoutinesCatalog();
  }
  updateCognitiveProfileUI(appState.cognitiveProfile);
});


// Ham toan cuc cho phep kich hoat nhanh bai kiem thu mau so thap phan
window.loadDemoDecimalTask = function() {
  const task = (typeof taskDatabase !== 'undefined' && taskDatabase['G5_DEMO_DECIMAL']) || null;
  if (!task) {
    window.location.href = 'demo.html';
    return;
  }
  appState.childRoadmap = [task];
  appState.currentRoadmapIndex = 0;
  appState.activeTask = task;
  appState.currentStepIndex = 0;
  if (typeof startChildQuest === 'function') {
    startChildQuest();
  }
  if (typeof showToast === 'function') {
    showToast('Da mo bai kiem thu mau!', 'Phep nhan 25,8 x 1,5 voi 3 phuong an giao dien.', '🧪');
  }
};
