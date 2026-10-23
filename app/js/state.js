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

    var routineDatabase = (typeof routineDatabase !== 'undefined' && routineDatabase && Object.keys(routineDatabase).length > 0)
      ? routineDatabase
      : ((typeof window !== 'undefined' && window.routineDatabase) || (typeof global !== 'undefined' && global.routineDatabase) || {});
    if (typeof window !== 'undefined') window.routineDatabase = routineDatabase;

    async function syncTasksFromApi() {
      if (typeof fetch === 'undefined') return;
      try {
        let res = await fetch('/api/curriculum/tasks');
        if (!res.ok) {
          res = await fetch('/data/curriculum/tasks_db.json');
        }
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) 
            ? data 
            : (data.exercises || (data && typeof data === 'object' ? Object.values(data) : []));
          if (items.length > 0) {
            items.forEach(t => {
              if (t && t.id && Array.isArray(t.steps) && t.steps.length > 0 && t.title) {
                taskDatabase[t.id] = t;
              }
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

    async function syncRoutinesFromApi() {
      if (typeof fetch === 'undefined') return;
      try {
        let res = await fetch('/api/routines');
        if (!res.ok) {
          res = await fetch('/data/curriculum/routines_db.json');
        }
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) 
            ? data 
            : (data.routines || (data && typeof data === 'object' ? Object.values(data) : []));
          if (items.length > 0) {
            items.forEach(r => {
              if (r && r.id && r.title) {
                routineDatabase[r.id] = r;
              }
            });

            // Nếu người dùng chưa từng chủ động bấm nút xóa sạch hải trình
            const isCleared = (typeof appState !== 'undefined' && appState.routineCleared) || (typeof localStorage !== 'undefined' && localStorage.getItem('milo_routine_cleared') === 'true');
            if (!isCleared && typeof appState !== 'undefined' && (!Array.isArray(appState.childRoutineRoadmap) || appState.childRoutineRoadmap.length === 0)) {
              const defaultRoutineIds = ['routine_morning_bed', 'routine_afterschool_drop', 'routine_clean_desk', 'routine_night_teeth'];
              const initialRoutines = defaultRoutineIds.map(id => routineDatabase[id]).filter(Boolean);
              if (initialRoutines.length > 0) {
                appState.childRoutineRoadmap = initialRoutines;
              }
            }

            if (typeof renderChildRoutineRoadmapFromTasks === 'function') {
              renderChildRoutineRoadmapFromTasks(appState.childRoutineRoadmap);
            }
            if (typeof renderParentRoutinesCatalog === 'function') {
              renderParentRoutinesCatalog();
            }
            if (typeof renderParentActiveRoadmapList === 'function') {
              renderParentActiveRoadmapList();
            }
          }
        }
      } catch (err) {
        console.warn('Routines API sync unavailable, using loaded routineDatabase:', err);
      }
    }
    syncRoutinesFromApi();




    /* ============================================================
       B. STATE MANAGEMENT TOÀN BỘ ỨNG DỤNG
       ============================================================ */
    var DEFAULT_COGNITIVE_PROFILE = window.DEFAULT_COGNITIVE_PROFILE = {
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

    var appState = window.appState = {
      role: 'dual', // 'dual', 'child', 'parent'
      familyId: 'family_room_milo_01',
      
      // Decoupled Identity: Máy Con độc lập với Mẹ chọn xem
      childDeviceKidId: (typeof localStorage !== 'undefined' && (localStorage.getItem('milo_child_device_kid_id') || localStorage.getItem('milo_active_kid_id'))) || 'kid_leo_01',
      parentSelectedKidId: (typeof localStorage !== 'undefined' && localStorage.getItem('milo_parent_selected_kid_id')) || 'kid_leo_01',
      
      get activeChildId() {
        return (this.role === 'child') ? this.childDeviceKidId : this.parentSelectedKidId;
      },
      set activeChildId(id) {
        if (this.role === 'child') {
          this.childDeviceKidId = id;
        } else {
          this.parentSelectedKidId = id;
        }
      },
      
      childrenList: [],
      childrenData: {},
      childrenStates: {}, // Cache riêng từng bé: { roadmap, routineRoadmap, selectedCatalogIds, selectedRoutineIds, stars }

      childDeviceProfile: { kid_id: 'kid_leo_01', name: 'Bé Leo', grade: 1, avatar: '🦁', stars: 450, pairing_code: '729-184' },
      parentSelectedKidProfile: { kid_id: 'kid_leo_01', name: 'Bé Leo', grade: 1, avatar: '🦁', stars: 450, pairing_code: '729-184' },
      
      get currentKidProfile() { return this.childDeviceProfile; },
      set currentKidProfile(p) { this.childDeviceProfile = p; },

      stars: 450,
      cognitiveProfile: loadStoredCognitiveProfile(),
      surveyAnswers: null,
      
      // Lộ Trình Đảo Nhiệm Vụ của Bé (Dynamic Island Quest Roadmap - Máy Con)
      childRoadmap: [taskDatabase['G1_MATH_01'], taskDatabase['G1_VIET_03'], taskDatabase['G1_MCQ_04']],
      currentRoadmapIndex: 0,
      
      // Lộ trình hiển thị bên máy Mẹ cho bé đang chọn
      parentChildRoadmap: [taskDatabase['G1_MATH_01'], taskDatabase['G1_VIET_03'], taskDatabase['G1_MCQ_04']],
      parentCurrentRoadmapIndex: 0,

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
      gradeFilter: 'current_kid',
      modalTaskKey: 'G1_MATH_01',
      pendingTicket: null,

      // Lộ Trình Đảo Nhiệm Vụ Sinh Hoạt của Bé (Dedicated Daily Routines - Máy Con)
      childRoutineRoadmap: (function() {
        const isCleared = typeof localStorage !== 'undefined' && localStorage.getItem('milo_routine_cleared') === 'true';
        if (isCleared) return [];
        const ids = ['routine_morning_bed', 'routine_afterschool_drop', 'routine_clean_desk', 'routine_night_teeth'];
        return ids.map(id => routineDatabase[id]).filter(Boolean);
      })(),
      // Lộ trình thói quen bên máy Mẹ cho bé đang chọn
      parentChildRoutineRoadmap: [],
      
      selectedRoutineIds: new Set(['routine_morning_bed', 'routine_afterschool_drop', 'routine_clean_desk', 'routine_night_teeth']),
      completedRoutineIds: new Set(),
      routinePhotoProofs: {},
      simulatedTimeSlot: 'morning',
      selectedActiveRoutineId: null,
      currentRoutineIndex: 0,
      routineCleared: typeof localStorage !== 'undefined' && localStorage.getItem('milo_routine_cleared') === 'true',
      roadmapCleared: typeof localStorage !== 'undefined' && localStorage.getItem('milo_roadmap_cleared') === 'true'
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
       B2. MULTI-CHILD MANAGEMENT & DYNAMIC STATE HYDRATION
       ============================================================ */
    async function fetchChildrenList() {
      if (typeof fetch === 'undefined') return;
      try {
        const res = await fetch('/api/parent/children?parent_id=parent_lan_01');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.children) && data.children.length > 0) {
            appState.childrenList = data.children;
            data.children.forEach(c => {
              appState.childrenData[c.kid_id] = c;
            });

            // Gán profile máy con
            const childDev = data.children.find(c => c.kid_id === appState.childDeviceKidId) || data.children[0];
            if (childDev) {
              appState.childDeviceKidId = childDev.kid_id;
              appState.childDeviceProfile = childDev;
            }

            // Gán profile mẹ đang chọn
            const parentActive = data.children.find(c => c.kid_id === appState.parentSelectedKidId) || data.children[0];
            if (parentActive) {
              appState.parentSelectedKidId = parentActive.kid_id;
              appState.parentSelectedKidProfile = parentActive;
            }

            if (typeof renderParentProfileCards === 'function') {
              renderParentProfileCards();
            }
            if (typeof updateChildProfileDisplay === 'function') {
              updateChildProfileDisplay();
            }
            if (typeof updateParentActiveChildBadge === 'function') {
              updateParentActiveChildBadge();
            }
          }
        }
      } catch (err) {
        console.warn('Cannot fetch children list from API:', err);
      }
    }
    // Auto-fetch on boot
    fetchChildrenList();

    /* ------------------------------------------------------------
       PARENT ACTION: Mẹ bấm chuyển xem / quản lý bé (CHỈ ĐỔI VIEW MẸ)
       TUYỆT ĐỐI KHÔNG làm nhảy màn hình hay đổi máy con!
       ------------------------------------------------------------ */
    async function parentSelectChild(targetKidId) {
      if (!targetKidId) return;
      appState.parentSelectedKidId = targetKidId;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('milo_parent_selected_kid_id', targetKidId);
        }
      } catch (e) {}

      // Lấy thông tin bé
      const child = (appState.childrenList || []).find(c => c.kid_id === targetKidId) || appState.childrenData[targetKidId] || {
        kid_id: targetKidId,
        name: targetKidId === 'kid_minh_02' ? 'Bé Minh' : 'Bé Leo',
        grade: targetKidId === 'kid_minh_02' ? 3 : 1,
        avatar: targetKidId === 'kid_minh_02' ? '🐯' : '🦁',
        stars: targetKidId === 'kid_minh_02' ? 320 : 450
      };
      appState.parentSelectedKidProfile = child;

      // 1. Tự động đồng bộ bộ lọc khối lớp kho GDPT sang lớp của bé mẹ đang chọn
      if (typeof parentFilterGrade === 'function') {
        parentFilterGrade('current_kid');
      }

      // 2. Fetch dữ liệu tiến độ & thói quen từ SQLite bền vững của bé này
      try {
        const res = await fetch(`/api/child/${targetKidId}/state`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            appState.childrenStates[targetKidId] = data;
            if (Array.isArray(data.child_roadmap)) {
              appState.parentChildRoadmap = data.child_roadmap;
              appState.parentCurrentRoadmapIndex = data.current_roadmap_index || 0;
            } else {
              appState.parentChildRoadmap = [];
            }
            if (Array.isArray(data.child_routine_roadmap)) {
              appState.parentChildRoutineRoadmap = data.child_routine_roadmap;
              // Khôi phục tick thói quen tương ứng của bé này
              appState.selectedRoutineIds = new Set(data.child_routine_roadmap.map(r => r.id).filter(Boolean));
            } else {
              appState.parentChildRoutineRoadmap = [];
              appState.selectedRoutineIds = new Set();
            }
          }
        }
      } catch (err) {
        console.warn(`Lỗi tải dữ liệu cho bé ${targetKidId}:`, err);
      }

      // 3. Cập nhật TOÀN BỘ giao diện phía Mẹ
      if (typeof updateParentActiveChildBadge === 'function') updateParentActiveChildBadge();
      if (typeof renderParentProfileCards === 'function') renderParentProfileCards();
      if (typeof renderParentActiveRoadmapList === 'function') renderParentActiveRoadmapList();
      if (typeof renderParentAuditTimeline === 'function') renderParentAuditTimeline();
      if (typeof renderParentRoutinesCatalog === 'function') renderParentRoutinesCatalog();
      if (typeof renderParentCatalogList === 'function') renderParentCatalogList();

      if (typeof showToast === 'function') {
        showToast("Giám Sát Bé", `Đang xem tiến độ của ${child.avatar} ${child.name} (Lớp ${child.grade})`, "👩‍👧");
      }
    }

    /* ------------------------------------------------------------
       CHILD ACTION: Đăng nhập / Ghép nối mã PIN trên MÁY CON
       Chỉ chạy khi bé nhập mã PIN 6 số trên điện thoại con
       ------------------------------------------------------------ */
    async function loginChildDevice(targetKidId) {
      if (!targetKidId) return;
      appState.childDeviceKidId = targetKidId;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('milo_child_device_kid_id', targetKidId);
          localStorage.setItem('milo_active_kid_id', targetKidId);
        }
      } catch (e) {}

      // Update sync bus kidId and reconnect WS for new kid
      if (window.miloBus) {
        window.miloBus.kidId = targetKidId;
        if (typeof window.miloBus.reconnectWithKid === 'function') {
          window.miloBus.reconnectWithKid(targetKidId);
        }
      }

      const child = (appState.childrenList || []).find(c => c.kid_id === targetKidId) || appState.childrenData[targetKidId] || {
        kid_id: targetKidId,
        name: targetKidId === 'kid_minh_02' ? 'Bé Minh' : 'Bé Leo',
        grade: targetKidId === 'kid_minh_02' ? 3 : 1,
        avatar: targetKidId === 'kid_minh_02' ? '🐯' : '🦁',
        stars: targetKidId === 'kid_minh_02' ? 320 : 450,
        pairing_code: targetKidId === 'kid_minh_02' ? '852-369' : '729-184'
      };
      appState.childDeviceProfile = child;

      // Fetch state từ SQLite cho máy con
      try {
        const res = await fetch(`/api/child/${targetKidId}/state`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (typeof data.stars === 'number') {
              updateStarsEverywhere(data.stars);
            }
            if (Array.isArray(data.child_roadmap)) {
              appState.childRoadmap = data.child_roadmap;
              appState.currentRoadmapIndex = data.current_roadmap_index || 0;
              appState.currentStepIndex = data.current_step_index || 0;
              appState.activeTask = (appState.childRoadmap && appState.childRoadmap[appState.currentRoadmapIndex]) || null;
            }
            if (Array.isArray(data.child_routine_roadmap)) {
              appState.childRoutineRoadmap = data.child_routine_roadmap;
            }
            if (data.routine_photo_proofs) {
              appState.routinePhotoProofs = data.routine_photo_proofs;
            }
            if (data.profile && data.profile.cognitive_profile) {
              appState.cognitiveProfile = data.profile.cognitive_profile;
            }
          }
        }
      } catch (err) {
        console.warn(`Lỗi tải dữ liệu máy con cho ${targetKidId}:`, err);
      }

      // Reset step interaction cache
      if (appState.selectedClues && typeof appState.selectedClues.clear === 'function') appState.selectedClues.clear();
      if (appState.cleanedItems && typeof appState.cleanedItems.clear === 'function') appState.cleanedItems.clear();

      // Cập nhật giao diện MÁY CON
      if (typeof updateChildProfileDisplay === 'function') updateChildProfileDisplay();
      if (typeof renderChildIslandRoadmap === 'function') renderChildIslandRoadmap();
      if (typeof renderChildRoutineRoadmapFromTasks === 'function') renderChildRoutineRoadmapFromTasks(appState.childRoutineRoadmap);

      // Báo lên sync bus cho mẹ biết máy con vừa đăng nhập
      if (window.miloBus && typeof window.miloBus.broadcast === 'function') {
        window.miloBus.broadcast('CHILD_DEVICE_LOGGED_IN', {
          kid_id: targetKidId,
          child_name: child.name,
          avatar: child.avatar,
          grade: child.grade
        });
      }

      if (typeof showToast === 'function') {
        showToast("Đăng Nhập Thành Công! 🚀", `Chào mừng ${child.avatar} ${child.name} (Lớp ${child.grade}) sẵn sàng săn vé vàng!`, "🎉");
      }
    }

    // Alias tương thích ngược
    async function switchActiveChild(targetKidId, skipRemote = false) {
      if (appState.role === 'parent') {
        await parentSelectChild(targetKidId);
      } else {
        await loginChildDevice(targetKidId);
      }
    }

    function updateChildProfileDisplay() {
      const child = appState.childDeviceProfile || { name: 'Bé Leo', grade: 1, avatar: '🦁', pairing_code: '729-184' };
      
      // Update Child device elements
      const nameEls = document.querySelectorAll('.child-profile-name');
      nameEls.forEach(el => el.innerText = child.name);
      
      const gradeEls = document.querySelectorAll('.child-profile-grade');
      gradeEls.forEach(el => el.innerText = `Lớp ${child.grade}`);
      
      const avatarEls = document.querySelectorAll('.child-profile-avatar');
      avatarEls.forEach(el => el.innerText = child.avatar || '🦁');

      const pinEl = document.getElementById('child-sheet-pin');
      if (pinEl) pinEl.innerText = child.pairing_code || "729-184";

      // Update label in Top Presentation Bar
      const roleText = document.getElementById('header-role-text');
      if (roleText && appState.role === 'child') {
        roleText.innerText = `Hồ sơ: ${child.name} (Máy Con)`;
      }
    }

    function updateParentActiveChildBadge() {
      const child = appState.parentSelectedKidProfile || { name: 'Bé Leo', grade: 1, avatar: '🦁', stars: 450 };
      const parentBadge = document.getElementById('parent-active-child-badge');
      if (parentBadge) {
        parentBadge.innerHTML = `<span class="text-sm">${child.avatar || '🦁'}</span> <span class="font-bold text-xs">${child.name} (Lớp ${child.grade || 1})</span>`;
      }

      // Cập nhật Top bar Mẹ thành "Giám Sát Bé [Tên]"
      const parentAvatar = document.getElementById('parent-header-avatar');
      if (parentAvatar) {
        parentAvatar.innerText = child.avatar || '🦁';
      }
      const parentTitle = document.getElementById('parent-header-title');
      if (parentTitle) {
        parentTitle.innerText = `Giám Sát ${child.name || 'Bé'}`;
      }
      const parentSubtitle = document.getElementById('parent-header-subtitle');
      if (parentSubtitle) {
        parentSubtitle.innerText = `Hồ sơ Lớp ${child.grade || 1} • Bấm để đổi bé ▾`;
      }

      // Cập nhật số sao hiển thị trên top bar mẹ theo đúng sao của bé đang được chọn
      const parentStarElem = document.querySelector('#parent-screen-container .sync-star-val');
      if (parentStarElem && child.stars !== undefined) {
        parentStarElem.innerText = child.stars;
      }
    }

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
      try {
        localStorage.setItem('milo_preferred_role', mode);
      } catch (e) {}

      const childCol = document.getElementById('col-child');
      const parentCol = document.getElementById('col-parent');
      const btnDual = document.getElementById('view-dual');
      const btnChild = document.getElementById('view-child');
      const btnParent = document.getElementById('view-parent');

      const roleIcon = document.getElementById('header-role-icon');
      const roleText = document.getElementById('header-role-text');

      if (btnDual && btnChild && btnParent) {
        [btnDual, btnChild, btnParent].forEach(b => {
          b.className = "px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5";
        });
      }

      const isMobileOrStandalone = window.innerWidth <= 900 || 
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (new URLSearchParams(window.location.search).get('standalone') === '1');

      if (mode === 'dual') {
        if (childCol) { childCol.classList.remove('hidden'); childCol.style.display = 'flex'; }
        if (parentCol) { parentCol.classList.remove('hidden'); parentCol.style.display = 'flex'; }
        if (btnDual) btnDual.className = "px-3 py-1.5 rounded-xl bg-teal-600 text-white shadow-sm transition flex items-center gap-1.5";
        if (roleIcon) roleIcon.innerText = "📱📱";
        if (roleText) roleText.innerText = "Hồ sơ: Song Song (Dual)";
        document.body.classList.remove('mobile-standalone-view');
        document.documentElement.classList.remove('mobile-standalone-view');
      } else if (mode === 'child') {
        if (childCol) { childCol.classList.remove('hidden'); childCol.style.display = 'flex'; }
        if (parentCol) { parentCol.classList.add('hidden'); parentCol.style.display = 'none'; }
        if (btnChild) btnChild.className = "px-3 py-1.5 rounded-xl bg-emerald-600 text-white shadow-sm transition flex items-center gap-1.5";
        if (roleIcon) roleIcon.innerText = "👦";
        if (roleText) roleText.innerText = "Hồ sơ: Bé Leo (Máy Con)";
        if (isMobileOrStandalone) {
          document.body.classList.add('mobile-standalone-view');
          document.documentElement.classList.add('mobile-standalone-view');
        }
      } else if (mode === 'parent') {
        if (childCol) { childCol.classList.add('hidden'); childCol.style.display = 'none'; }
        if (parentCol) { parentCol.classList.remove('hidden'); parentCol.style.display = 'flex'; }
        if (btnParent) btnParent.className = "px-3 py-1.5 rounded-xl bg-teal-600 text-white shadow-sm transition flex items-center gap-1.5";
        if (roleIcon) roleIcon.innerText = "👩";
        if (roleText) roleText.innerText = "Hồ sơ: Mẹ Lan (Máy Mẹ)";
        if (isMobileOrStandalone) {
          document.body.classList.add('mobile-standalone-view');
          document.documentElement.classList.add('mobile-standalone-view');
        }
      }

      if (window.miloBus) {
        window.miloBus.role = (mode === 'parent' ? 'parent' : 'child');
      }
    }


    /* ============================================================
       D. TOAST NOTIFICATION & REAL-TIME SYNC
       ============================================================ */
    function showToast(title, desc, icon = "⚡") {
      const currentRole = (typeof appState !== 'undefined' && appState.role) || (window.miloBus && window.miloBus.role) || 'dual';
      if (currentRole === 'child') {
        // Trên điện thoại con: KHÔNG pop toast tiến độ gây vướng màn hình của bé
        const isAllowedOnChild = title && (title.includes("Lời Khen Của Mẹ") || title.includes("Mẹ Lan Thả Tim") || title.includes("Vé Vàng") || title.includes("RƯƠNG"));
        if (!isAllowedOnChild) return;
      }

      const toast = document.getElementById('sync-toast');
      if (!toast) return;
      const tEl = document.getElementById('sync-toast-title');
      const dEl = document.getElementById('sync-toast-desc');
      const iEl = document.getElementById('sync-toast-icon');
      if (tEl) tEl.innerText = title;
      if (dEl) dEl.innerText = desc;
      if (iEl) iEl.innerText = icon;
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


if (typeof window !== 'undefined') {
  window.appState = appState;
  window.DEFAULT_COGNITIVE_PROFILE = DEFAULT_COGNITIVE_PROFILE;
  window.loadStoredCognitiveProfile = loadStoredCognitiveProfile;
  window.updateStarsEverywhere = updateStarsEverywhere;
  window.showToast = showToast;
  window.formatTime = formatTime;
  window.fetchChildrenList = fetchChildrenList;
  window.parentSelectChild = parentSelectChild;
  window.loginChildDevice = loginChildDevice;
  window.switchActiveChild = switchActiveChild;
  window.updateChildProfileDisplay = updateChildProfileDisplay;
  window.updateParentActiveChildBadge = updateParentActiveChildBadge;
}
