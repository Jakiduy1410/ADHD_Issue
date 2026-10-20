/* ============================================================
   MODULE: COGNITIVE PROFILE & REACTIVE APPLICATION STATE
   ============================================================ */
    /* ============================================================
       A. DATABASE NHIỆM VỤ ĐỀ XUẤT (KHO BĂM SẴN GDPT 2018 & SINH HOẠT - 29 BÀI)
       ============================================================ */
    /* ============================================================
       A. CURRICULUM DATABASE REFERENCE & API SYNC
       ============================================================ */
    var taskDatabase = (typeof taskDatabase !== 'undefined' && taskDatabase && Object.keys(taskDatabase).length > 0)
      ? taskDatabase
      : ((typeof window !== 'undefined' && window.taskDatabase) || (typeof global !== 'undefined' && global.taskDatabase) || {});

    async function syncTasksFromApi() {
      if (typeof fetch === 'undefined') return;
      try {
        let res = await fetch('/api/curriculum/tasks');
        if (!res.ok) {
          res = await fetch('/data/curriculum/tasks_db.json');
        }
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.values(data) : []);
          if (items.length > 0) {
            items.forEach(t => {
              if (t && t.id) taskDatabase[t.id] = t;
            });
            if (taskDatabase['G1_MATH_01']) {
              taskDatabase['math_garden'] = taskDatabase['G1_MATH_01'];
            }
            if (typeof renderParentCatalogList === 'function') {
              renderParentCatalogList();
            }
          }
        }
      } catch (err) {
        console.warn('API sync unavailable, using loaded taskDatabase:', err);
      }
    }
    syncTasksFromApi();




    /* ============================================================
       B. STATE MANAGEMENT TOÀN BỘ ỨNG DỤNG
       ============================================================ */
    const DEFAULT_COGNITIVE_PROFILE = {
      attention_span_minutes: 12,
      recommended_micro_task_duration_sec: 120,
      working_memory_capacity: 3,
      rsd_sensitivity_level: 'HIGH',
      scaffolding_level: 'MODERATE',
      max_steps_per_session: 4
    };

    function loadStoredCognitiveProfile() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('milo_cognitive_profile');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              return {
                attention_span_minutes: typeof parsed.attention_span_minutes === 'number' ? parsed.attention_span_minutes : DEFAULT_COGNITIVE_PROFILE.attention_span_minutes,
                recommended_micro_task_duration_sec: typeof parsed.recommended_micro_task_duration_sec === 'number' ? parsed.recommended_micro_task_duration_sec : DEFAULT_COGNITIVE_PROFILE.recommended_micro_task_duration_sec,
                working_memory_capacity: typeof parsed.working_memory_capacity === 'number' ? parsed.working_memory_capacity : DEFAULT_COGNITIVE_PROFILE.working_memory_capacity,
                rsd_sensitivity_level: parsed.rsd_sensitivity_level || DEFAULT_COGNITIVE_PROFILE.rsd_sensitivity_level,
                scaffolding_level: parsed.scaffolding_level || DEFAULT_COGNITIVE_PROFILE.scaffolding_level,
                max_steps_per_session: typeof parsed.max_steps_per_session === 'number' ? parsed.max_steps_per_session : DEFAULT_COGNITIVE_PROFILE.max_steps_per_session
              };
            }
          }
        }
      } catch (e) {}
      return Object.assign({}, DEFAULT_COGNITIVE_PROFILE);
    }

    const appState = {
      role: 'dual', // 'dual', 'child', 'parent'
      stars: 450,
      cognitiveProfile: loadStoredCognitiveProfile(),
      surveyAnswers: null,
      
      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap)
      childRoadmap: [taskDatabase['G1_MATH_01'], taskDatabase['G1_VIET_03'], taskDatabase['G1_MCQ_04']],
      currentRoadmapIndex: 0,
      
      // Task đang giải quyết trong Focus Cockpit
      activeTask: taskDatabase['G1_MATH_01'],
      currentStepIndex: 0,
      
      // Trạng thái tương tác cụ thể của từng bước
      selectedClues: new Set(),
      cleanedItems: new Set(),
      numpadValue: "",
      
      // Telemetry & Coaching
      pauseCount: 1,
      totalSessionSeconds: 0,
      
      // Parent Batch Selection State
      selectedCatalogIds: new Set([]),
      catalogFilter: 'all',
      gradeFilter: 'all',
      modalTaskKey: 'G1_MATH_01',
      pendingTicket: null
    };

    // TIMER ENGINE (ĐỒNG HỒ THỊ GIÁC VISUAL TIMER)
    let stepTimerInterval = null;
    let stepTotalSeconds = 60;
    let stepRemainingSeconds = 60;
    let isTimerPaused = false;
    let sessionTimerInterval = null;

    // BOX BREATHING 4-4-4 ENGINE
    let breathingInterval = null;
    let breathingStage = 0; // 0: Inhale(4s), 1: Hold(4s), 2: Exhale(4s), 3: Rest(4s)
    let breathingSecondsLeft = 4;
    let breathingCycleCount = 1;


    /* ============================================================
       C. PROFILE SWITCHER / MOCK LOGIN (LUỒNG ĐĂNG NHẬP GIẢ LẬP)
       ============================================================ */
    function openProfileModal() {
      playSfx('tap');
      const modal = document.getElementById('modal-profile-switcher');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeProfileModal() {
      playSfx('tap');
      const modal = document.getElementById('modal-profile-switcher');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function switchProfile(targetRole) {
      playSfx('bell');
      closeProfileModal();
      setViewMode(targetRole);

      if (targetRole === 'child') {
        showToast("Đăng Nhập Máy Bé Leo", "Chào mừng nhà thám hiểm nhí! Đã sẵn sàng săn vé vàng!", "🦁");
      } else if (targetRole === 'parent') {
        showToast("Đăng Nhập Máy Mẹ Lan", "Chào mẹ Lan! Trạm Thấu Hiểu đã kết nối trực tiếp với máy của con.", "👩");
      } else {
        showToast("Chế Độ Song Song (Dual)", "Mô phỏng 2 máy cạnh nhau: Bắn dữ liệu Real-time tức thì!", "📱📱");
      }
    }

    function setViewMode(mode) {
      appState.role = mode;
      const childCol = document.getElementById('col-child');
      const parentCol = document.getElementById('col-parent');
      const btnDual = document.getElementById('view-dual');
      const btnChild = document.getElementById('view-child');
      const btnParent = document.getElementById('view-parent');

      const roleIcon = document.getElementById('header-role-icon');
      const roleText = document.getElementById('header-role-text');

      [btnDual, btnChild, btnParent].forEach(b => {
        b.className = "px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5";
      });

      if (mode === 'dual') {
        childCol.classList.remove('hidden');
        parentCol.classList.remove('hidden');
        btnDual.className = "px-3 py-1.5 rounded-xl bg-teal-600 text-white shadow-sm transition flex items-center gap-1.5";
        roleIcon.innerText = "📱📱";
        roleText.innerText = "Hồ sơ: Song Song (Dual)";
      } else if (mode === 'child') {
        childCol.classList.remove('hidden');
        parentCol.classList.add('hidden');
        btnChild.className = "px-3 py-1.5 rounded-xl bg-emerald-600 text-white shadow-sm transition flex items-center gap-1.5";
        roleIcon.innerText = "👦";
        roleText.innerText = "Hồ sơ: Bé Leo (Máy Con)";
      } else if (mode === 'parent') {
        childCol.classList.add('hidden');
        parentCol.classList.remove('hidden');
        btnParent.className = "px-3 py-1.5 rounded-xl bg-teal-600 text-white shadow-sm transition flex items-center gap-1.5";
        roleIcon.innerText = "👩";
        roleText.innerText = "Hồ sơ: Mẹ Lan (Máy Mẹ)";
      }
    }


    /* ============================================================
       D. TOAST NOTIFICATION & REAL-TIME SYNC
       ============================================================ */
    function showToast(title, desc, icon = "⚡") {
      const toast = document.getElementById('sync-toast');
      document.getElementById('sync-toast-title').innerText = title;
      document.getElementById('sync-toast-desc').innerText = desc;
      document.getElementById('sync-toast-icon').innerText = icon;
      toast.classList.remove('translate-y-24', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
      }, 3500);
    }

    function updateStarsEverywhere(newCount) {
      appState.stars = newCount;
      document.querySelectorAll('.sync-star-val').forEach(el => el.innerText = newCount);
    }

    function formatTime(totalSecs) {
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }


    /* ============================================================
       E. LỘ TRÌNH ĐẢO BÀI TẬP (ISLAND QUEST ROADMAP) LOGIC
       ============================================================ */

