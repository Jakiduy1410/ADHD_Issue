/* ============================================================
   MODULE: PARENT DASHBOARD & DIAGNOSTIC SURVEY ENGINE
   ============================================================ */
    function updateParentCoachInsights(task, stepIdx, telemetry) {
      const summaryEl = document.getElementById('ai-summary-text');
      const praiseEl = document.getElementById('parent-praise-script');
      if (!task) return;

      const title = task.title || "bài tập";
      const cat = task.cat || "math";
      const stepNum = (stepIdx !== undefined ? stepIdx + 1 : 1);
      const isPaused = telemetry && telemetry.isPaused;

      let insight = "";
      let praise = "";

      if (isPaused) {
        insight = `Leo vừa kích hoạt nhịp nghỉ vi mô Soft Pause 4-4-4 khi đang ở [${title}]. Não bộ bé đang tự điều hòa cảm xúc rất tốt thay vì nổi cơn bực bội hay bỏ cuộc.`;
        praise = `"Mẹ rất tự hào khi thấy Leo biết dừng lại thở sâu 4-4-4 khi mệt! Đó là bản lĩnh tự chủ của một nhà vô địch đấy con!"`;
      } else if (cat === 'math') {
        if (stepNum === 1) {
          insight = `Leo đang đọc đề và lọc dữ kiện bài toán [${title}]. Việc phân loại số liệu và từ khóa hỏi giúp vỏ não trước trán giải phóng 40% dung lượng bộ nhớ làm việc.`;
          praise = `"Mẹ khen ngợi cách Leo tìm đúng dữ kiện quan trọng của đề bài! Con đang tư duy mạch lạc và rất tập trung!"`;
        } else {
          insight = `Leo đang đặt tính từng chữ số ở Bước ${stepNum}. Thao tác tính toán từ phải sang trái giúp não bé neo chắc các hàng đơn vị, chục, trăm mà không bị lộn ngược kết quả.`;
          praise = `"Mẹ thấy Leo đặt tính rất thẳng hàng và cẩn thận! Mỗi phép tính đúng là một bước tiến tuyệt vời của con!"`;
        }
      } else if (cat === 'eng') {
        insight = `Leo đang rèn luyện khả năng đọc hiểu Tiếng Anh ở [${title}]. Việc xác định từ khóa câu hỏi trước khi đọc đoạn văn giúp loại bỏ 70% nhiễu thị giác cho trẻ ADHD.`;
        praise = `"Mẹ rất thích cách Leo nắm bắt câu hỏi Tiếng Anh thật chuẩn xác! Con đang trở thành một thợ săn từ khóa cừ khôi đấy!"`;
      } else if (cat === 'viet') {
        insight = `Leo đang cảm thụ biện pháp nghệ thuật trong [${title}]. Tách bạch chủ ngữ và từ ngữ nhân hóa/so sánh giúp bé củng cố khả năng liên tưởng ngôn ngữ sâu sắc.`;
        praise = `"Mẹ ấn tượng với cách Leo cảm nhận câu văn rất tinh tế! Cố lên nhé nhà thám hiểm ngôn ngữ nhí!"`;
      } else {
        insight = `Leo đang thực hiện chuỗi vi nhiệm vụ [${title}]. Việc chia nhỏ hành vi giúp giảm năng lượng kích hoạt ban đầu và dập tắt sức ỳ tâm lý hiệu quả nhất.`;
        praise = `"Mẹ nhìn thấy sự tự lập của Leo lớn lên từng ngày! Cảm ơn con đã cùng mẹ giữ gìn không gian tinh tươm!"`;
      }

      if (summaryEl) summaryEl.innerText = insight;
      if (praiseEl) praiseEl.innerText = praise;
    }


    /* ============================================================
       K. PHÍA PHỤ HUYNH: 2 HƯỚNG GIAO BÀI (KHO GDPT & TỰ GIAO)
       ============================================================ */
    function parentSwitchAssignMode(mode) {
      playSfx('tap');
      const btnCat = document.getElementById('p-mode-btn-catalog');
      const btnCus = document.getElementById('p-mode-btn-custom');
      const viewCat = document.getElementById('p-view-catalog');
      const viewCus = document.getElementById('p-view-custom');

      if (mode === 'catalog') {
        btnCat.className = "py-2 rounded-xl bg-white text-teal-800 shadow-xs transition flex items-center justify-center gap-1.5";
        btnCus.className = "py-2 rounded-xl text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5";
        viewCat.classList.remove('hidden');
        viewCus.classList.add('hidden');
      } else {
        btnCus.className = "py-2 rounded-xl bg-white text-teal-800 shadow-xs transition flex items-center justify-center gap-1.5";
        btnCat.className = "py-2 rounded-xl text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5";
        viewCus.classList.remove('hidden');
        viewCat.classList.add('hidden');
      }
    }

    function renderParentCatalogList() {
      const container = document.getElementById('catalog-tasks-list');
      if (!container) return;
      container.innerHTML = '';

      const catFilter = appState.catalogFilter || 'all';
      const gradeFilter = appState.gradeFilter || 'all';

      // Deduplicate aliases (e.g. math_garden -> G1_MATH_01)
      const taskMap = new Map();
      Object.values(taskDatabase).forEach(t => {
        if (t && t.id) taskMap.set(t.id, t);
      });
      const tasks = Array.from(taskMap.values());

      // Pill counts must reflect the real catalog (they were hardcoded as
      // 29/15/5/5/4 in index.html and went stale whenever tasks were added)
      const pillLabels = { all: 'Tất cả', math: '📐 Toán GDPT', viet: '📖 Tiếng Việt', eng: '🇬🇧 Tiếng Anh', chore: '🧹 Sinh Hoạt' };
      Object.keys(pillLabels).forEach(c => {
        const btn = document.getElementById(`p-cat-${c}`);
        if (!btn) return;
        const n = c === 'all' ? tasks.length : tasks.filter(task => task.cat === c).length;
        btn.textContent = `${pillLabels[c]} (${n})`;
      });

      tasks.forEach(t => {
        if (catFilter !== 'all' && t.cat !== catFilter) return;
        if (gradeFilter !== 'all' && t.grade !== gradeFilter) return;

        const isChecked = appState.selectedCatalogIds.has(t.id);
        const card = document.createElement('div');
        card.setAttribute('data-task-id', t.id);
        card.className = `bg-white rounded-2xl p-3 shadow-xs border transition flex items-center justify-between gap-2.5 overflow-hidden ${isChecked ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200'}`;
        card.innerHTML = `
          <div class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onclick="parentOpenTaskModal('${t.id}')">
            <span class="text-2xl shrink-0">${t.icon || '📚'}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1 mb-0.5 flex-wrap">
                <span class="text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${t.cat === 'math' ? 'bg-amber-100 text-amber-800' : t.cat === 'viet' ? 'bg-rose-100 text-rose-800' : t.cat === 'eng' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}">
                  ${t.catName || 'Nhiệm vụ'}
                </span>
                <span class="text-[9px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded-md">
                  Lớp ${t.grade || 1}
                </span>
                <span class="text-[10px] text-teal-600 font-bold ml-auto">Xem bước →</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs truncate">${t.title || 'Nhiệm vụ'}</h4>
              <div class="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                <span class="font-bold text-teal-700">${(t.steps && t.steps.length) || 0} Micro-tasks</span>
                <span>•</span>
                <span class="font-bold text-amber-600">+${t.reward || 50} ⭐</span>
                <span>•</span>
                <span>~${Math.round(((t.stepSeconds || 60) * ((t.steps && t.steps.length) || 1)) / 60)} phút</span>
              </div>
            </div>
          </div>
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCatalogItem('${t.id}', this.checked)" class="w-5 h-5 accent-teal-600 cursor-pointer shrink-0 ml-2" />
        `;
        container.appendChild(card);
      });

      updateBatchSummaryUI();
    }
    const renderCatalogTaskCards = renderParentCatalogList;

    function parentFilterGrade(grade) {
      playSfx('tap');
      appState.gradeFilter = grade;
      ['all', 1, 2, 3, 4, 5].forEach(g => {
        const btn = document.getElementById(`p-grade-${g}`);
        if (btn) {
          if (g === grade) {
            btn.className = "px-2 py-0.5 rounded-lg bg-teal-700 text-white shrink-0 text-[10px]";
          } else {
            btn.className = "px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0 text-[10px]";
          }
        }
      });
      renderParentCatalogList();
    }

    function toggleCatalogItem(id, isChecked) {
      playSfx('tap');
      if (isChecked) {
        appState.selectedCatalogIds.add(id);
      } else {
        appState.selectedCatalogIds.delete(id);
      }
      renderParentCatalogList();
      if (window.miloBus) window.miloBus.savePersistedState(appState);
    }

    function parentFilterCatalog(cat) {
      playSfx('tap');
      appState.catalogFilter = cat;
      ['all', 'math', 'viet', 'eng', 'chore'].forEach(c => {
        const btn = document.getElementById(`p-cat-${c}`);
        if (c === cat) {
          btn.className = "px-2.5 py-1 rounded-xl bg-teal-600 text-white shrink-0";
        } else {
          btn.className = "px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0";
        }
      });
      renderParentCatalogList();
    }

    function selectAllCatalog(selectAll) {
      playSfx('tap');
      if (selectAll) {
        const taskMap = new Map();
        Object.values(taskDatabase).forEach(t => {
          if (t && t.id) taskMap.set(t.id, t);
        });
        taskMap.forEach(t => appState.selectedCatalogIds.add(t.id));
      } else {
        appState.selectedCatalogIds.clear();
      }
      renderParentCatalogList();
      if (window.miloBus) window.miloBus.savePersistedState(appState);
    }

    function updateBatchSummaryUI() {
      const selected = Array.from(appState.selectedCatalogIds).map(id => taskDatabase[id]).filter(Boolean);
      const count = selected.length;
      let totalSteps = 0;
      let totalStars = 0;
      let totalMinutes = 0;

      selected.forEach(t => {
        totalSteps += t.steps.length;
        totalStars += t.reward;
        totalMinutes += Math.round((t.steps.length * t.stepSeconds) / 60);
      });

      document.getElementById('batch-selected-count').innerText = count;
      document.getElementById('batch-selected-meta').innerText = `${totalSteps} bước • ~${totalMinutes} phút • +${totalStars} ⭐`;
    }

    // BẮN LÔ BÀI TẬP ĐÃ CHỌN SANG MÁY CON TẠO LỘ TRÌNH ĐẢO
    function dispatchSelectedCatalogTasks() {
      playSfx('bell');
      const selectedTasks = Array.from(appState.selectedCatalogIds).map(id => taskDatabase[id]).filter(Boolean);
      if (selectedTasks.length === 0) {
        alert("Vui lòng tick chọn ít nhất 1 bài tập!");
        return;
      }

      // Broadcast TASK_ASSIGN_BATCH via MiloSyncBus
      if (window.miloBus) {
        window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
          tasks: selectedTasks,
          islandName: `Hải Trình ${selectedTasks.length} Đảo Tri Thức`,
          dispatchId: 'DISPATCH_' + Date.now()
        });
      } else {
        appState.childRoadmap = selectedTasks;
        appState.currentRoadmapIndex = 0;
        appState.activeTask = selectedTasks[0];
        renderChildIslandRoadmap();
        renderParentActiveRoadmapList();
        childSwitchScreen('home');
      }

      renderParentActiveRoadmapList();
      showToast("Lộ Trình Đảo Đã Cập Nhật", `Mẹ vừa giao lô ${selectedTasks.length} bài tập sang hải trình của Leo!`, "🚀");
    }

    // Modal chi tiết bước bên phía mẹ
    function parentOpenTaskModal(key) {
      playSfx('tap');
      appState.modalTaskKey = key;
      const task = taskDatabase[key];
      if (!task) return;

      document.getElementById('parent-modal-cat').innerText = task.catName;
      document.getElementById('parent-modal-title').innerText = task.title;
      document.getElementById('parent-modal-steps-count').innerText = `${task.steps.length} Micro-tasks`;
      document.getElementById('parent-modal-reward').innerText = `+${task.reward} ⭐`;

      const stepsList = document.getElementById('parent-modal-steps');
      stepsList.innerHTML = '';
      task.steps.forEach((s, idx) => {
        const item = document.createElement('div');
        item.className = "bg-slate-50 border border-slate-200 p-2 rounded-xl";
        item.innerHTML = `
          <div class="flex items-center gap-1.5 text-[10px] font-bold text-teal-800 mb-0.5">
            <span class="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px]">${idx + 1}</span>
            <span>${s.badge}</span>
          </div>
          <p class="text-slate-600 text-[11px] leading-snug pl-5">${s.text}</p>
        `;
        stepsList.appendChild(item);
      });

      const modal = document.getElementById('parent-task-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function parentCloseTaskModal() {
      playSfx('tap');
      const modal = document.getElementById('parent-task-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function parentDispatchActiveModalTask() {
      playSfx('bell');
      const task = taskDatabase[appState.modalTaskKey];
      const btn = document.getElementById('parent-modal-dispatch-btn');
      btn.innerText = "✅ ĐÃ BẮN SANG HẢI TRÌNH CỦA CON!";
      btn.className = "w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md";

      setTimeout(() => {
        parentCloseTaskModal();
        btn.innerText = "GỬI SANG MÁY CỦA CON 🚀";
        btn.className = "w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition";
        
        // Cập nhật hải trình máy con
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            tasks: [task],
            islandName: `Đảo Thử Thách: ${task.title}`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        } else {
          appState.childRoadmap = [task];
          appState.currentRoadmapIndex = 0;
          appState.activeTask = task;
          renderChildIslandRoadmap();
          childSwitchScreen('home');
        }

        showToast("Nhiệm Vụ Mới Nhận", `Mẹ vừa giao: ${task.title} (${task.steps.length} bước)`, "🚀");
      }, 700);
    }


    /* ============================================================
       L. HƯỚNG 2: TỰ GIAO (AI TỰ BĂM & SOẠN BẰNG TAY ĐỘNG)
       ============================================================ */

    /* ============================================================
       M. TABS PHỤ HUYNH & PHÊ DUYỆT VÉ VÀNG
       ============================================================ */
    function parentSwitchTab(tabName) {
      playSfx('tap');
      const tabs = ['home', 'tasks', 'rewards', 'coach'];
      tabs.forEach(t => {
        const sec = document.getElementById(`parent-screen-${t}`);
        const nav = document.getElementById(`p-nav-${t}`);
        if (t === tabName) {
          sec.classList.remove('hidden');
          sec.classList.add(t === 'coach' ? 'flex' : 'block');
          nav.className = "flex flex-col items-center py-1 text-teal-600 font-bold text-[10px]";
        } else {
          sec.classList.add('hidden');
          sec.classList.remove('flex', 'block');
          nav.className = "flex flex-col items-center py-1 text-slate-400 hover:text-slate-600 font-bold text-[10px]";
        }
      });
      if (tabName === 'rewards') {
        document.getElementById('p-reward-dot').classList.add('hidden');
      }
    }

    function copyParentScript() {
      playSfx('tap');
      const text = document.getElementById('parent-praise-script').innerText;
      navigator.clipboard?.writeText(text);
      showToast("Đã Sao Chép Lời Khen", "Mẹ hãy đọc to hoặc gửi tin nhắn ngọt ngào cho Leo nhé!", "📋");
    }

    function parentApproveTicket() {
      playSfx('success');
      const banner = document.getElementById('parent-golden-ticket-banner');
      const doneBanner = document.getElementById('parent-golden-ticket-done');
      if (banner) banner.classList.add('hidden');
      if (doneBanner) doneBanner.classList.remove('hidden');

      const ticketTitle = appState.pendingTicket ? appState.pendingTicket.title : "30 phút chơi Lego cùng mẹ Lan";
      const praiseMsg = "Mẹ rất tự hào về sự kiên trì vượt các đảo hôm nay của Leo!";

      // Broadcast TICKET_APPROVAL_RESPONSE
      if (window.miloBus) {
        window.miloBus.broadcast('TICKET_APPROVAL_RESPONSE', {
          ticketId: appState.pendingTicket ? appState.pendingTicket.ticketId : 'ticket_01',
          title: ticketTitle,
          approved: true,
          praiseMessage: praiseMsg
        });
        appState.pendingTicket = null;
        window.miloBus.savePersistedState(appState);
      }

      showToast("Đã Duyệt Vé Vàng!", "Lời khen ngợi và phê duyệt đã bắn ngay sang điện thoại của Leo!", "🎉");
    }

    function parentSendCheer(customText) {
      playSfx('tap');
      const scriptEl = document.getElementById('parent-praise-script');
      const text = customText || (scriptEl ? scriptEl.innerText : "") || "Mẹ rất tự hào về sự kiên trì của con!";
      if (window.miloBus) {
        window.miloBus.broadcast('PARENT_CHEER_SEND', {
          cheerText: text,
          message: text,
          sticker: 'milo_thumbs_up'
        });
      }
      showToast("Đã Gửi Lời Khen", "Lời khen ngợi nỗ lực đã xuất hiện trên buồng lái của Leo! ❤️", "💌");
    }

    function parentDeclineTicket() {
      playSfx('tap');
      document.getElementById('parent-golden-ticket-banner').classList.add('hidden');
      showToast("Để Phê Duyệt Sau", "Yêu cầu đổi quà đã được lưu trong danh sách chờ duyệt.", "⏳");
    }

    function parentAddCustomReward() {
      const title = document.getElementById('new-reward-title').value.trim();
      const stars = parseInt(document.getElementById('new-reward-stars').value) || 300;
      if (!title) return;

      playSfx('tap');
      const list = document.getElementById('parent-reward-list');
      const item = document.createElement('div');
      item.className = 'bg-white rounded-2xl p-3 shadow-xs border border-teal-200 flex items-center justify-between';
      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-xl bg-teal-50 w-9 h-9 rounded-xl flex items-center justify-center">🎁</span>
          <div>
            <h4 class="font-bold text-xs text-slate-800">${title}</h4>
            <span class="text-[11px] font-bold text-amber-600">${stars} ⭐</span>
          </div>
        </div>
        <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Đang kích hoạt</span>
      `;
      list.prepend(item);
      document.getElementById('new-reward-title').value = "";
      showToast("Thêm Vé Vàng", `Đã kích hoạt phần thưởng [${title}] cho bé!`, "🎁");
    }

    // AI Coach Chat
    function parentSendSituation(type) {
      playSfx('tap');
      const box = document.getElementById('parent-chat-box');
      const data = {
        tantrum: {
          q: "😤 Con đang cáu gắt không chịu ngồi vào bàn",
          s1: '"Mẹ thấy Leo đang rất khó chịu và mệt mỏi đúng không con? Không sao cả."',
          s2: '"Con uống 1 ngụm nước mát nhé, hai mẹ con mình chỉ làm đúng Bước 1 trong 3 phút thôi rồi nghỉ!"'
        },
        quit: {
          q: "🛑 Con bỏ dở bài giữa chừng và nản",
          s1: '"Tuyệt vời! Leo đã tự kiên nhẫn làm xong bước đầu tiên rồi, pin não vừa báo cần sạc thêm đấy."',
          s2: '"Mình cùng bấm nút Tạm Dừng trên máy, vươn vai 5 phút rồi quay lại lấy nốt Sao nhé!"'
        },
        praise: {
          q: "⭐ Cách khen nỗ lực khi con hoàn thành",
          s1: '"Hôm nay mẹ cực kỳ ấn tượng ở các bước làm bài, con vẫn rất kiên trì hoàn thành từng bước!"',
          s2: '"Con nhìn xem ví Sao vừa nhảy lên rồi kìa, đập tay ăn mừng nào!"'
        }
      }[type];

      box.innerHTML += `
        <div class="flex justify-end">
          <div class="bg-teal-600 text-white rounded-2xl rounded-br-none px-3 py-1.5 text-xs font-semibold max-w-[85%]">
            ${data.q}
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 text-xs space-y-1.5 shadow-xs">
          <div class="bg-purple-50 border border-purple-100 p-2 rounded-xl text-purple-950">
            <strong class="block text-purple-800 text-[10px] mb-0.5">Bước 1 • Đồng cảm trước:</strong>
            ${data.s1}
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-emerald-950">
            <strong class="block text-emerald-800 text-[10px] mb-0.5">Bước 2 • Đặt giới hạn vi mô:</strong>
            ${data.s2}
          </div>
        </div>
      `;
      box.scrollTop = box.scrollHeight;
    }

    function parentAskCoach() {
      const inp = document.getElementById('coach-user-input');
      const val = inp.value.trim();
      if (!val) return;

      playSfx('tap');
      const box = document.getElementById('parent-chat-box');
      box.innerHTML += `
        <div class="flex justify-end">
          <div class="bg-teal-600 text-white rounded-2xl rounded-br-none px-3 py-1.5 text-xs font-semibold max-w-[85%]">
            ${val}
          </div>
        </div>
      `;
      inp.value = "";
      box.scrollTop = box.scrollHeight;

      // Intelligent context-aware coach response based on actual child state
      const task = appState.activeTask || {};
      const stepIdx = appState.currentStepIndex || 0;
      const taskTitle = task.title || "bài tập";
      const qLower = val.toLowerCase();

      let reply = "";
      if (qLower.includes("cáu") || qLower.includes("khóc") || qLower.includes("nản") || qLower.includes("không chịu") || qLower.includes("mệt")) {
        reply = `Leo đang đối mặt với việc cạn kiệt năng lượng chú ý ở [${taskTitle}]. Đây là phản ứng thần kinh bình thường khi hạch hạnh nhân (Amygdala) bị quá tải. Mẹ hãy dùng quy tắc <strong>Đồng cảm 2 phút</strong>: 'Mẹ thấy con đang rất mệt đúng không? Con uống ngụm nước nhé, hai mẹ con chỉ giải quyết nốt 1 ô này thôi rồi dừng!'. Tuyệt đối không quát mắng lúc này mẹ nhé!`;
      } else if (qLower.includes("khen") || qLower.includes("thưởng") || qLower.includes("động viên")) {
        reply = `Khi Leo hoàn thành Bước ${stepIdx + 1} của [${taskTitle}], mẹ hãy áp dụng kỹ thuật <strong>Khen ngợi nỗ lực cụ thể (Effort Praise)</strong> thay vì khen kết quả: 'Mẹ nhìn thấy sự kiên trì của Leo khi đặt từng phép tính rất thẳng hàng!'. Điều này sẽ kích hoạt thụ thể Dopamine D2 bền vững, giúp bé xây dựng động lực nội tại.`;
      } else if (qLower.includes("toán") || qLower.includes("tính") || qLower.includes("nhân") || qLower.includes("cộng")) {
        reply = `Ở bài toán [${taskTitle}], bí quyết cho trẻ ADHD là <strong>ngoại hóa bộ nhớ làm việc</strong>. Nhờ có lưới ô vuông từng chữ số và cơ chế nhập từ phải sang trái, não bộ bé không cần phải 'tưởng tượng' các cột số trong đầu nữa. Mẹ chỉ cần quan sát và khích lệ bé từng dòng một nhé!`;
      } else if (qLower.includes("tiếng anh") || qLower.includes("đọc") || qLower.includes("văn")) {
        reply = `Với bài đọc hiểu, điểm nghẽn lớn nhất của trẻ ADHD là 'ngợp trước bức tường chữ'. Hệ thống đã tách bài đọc và câu hỏi thành 2 phần độc lập để bé săn lùng từ khóa từng bước. Mẹ có thể gợi ý bé gạch chân đối tượng được hỏi trước nhé!`;
      } else {
        reply = `Milo Coach ghi nhận câu hỏi của mẹ! Hiện tại Leo đang thực hiện [${taskTitle}] (Bước ${stepIdx + 1}). Với trẻ ADHD, điều cốt lõi là <strong>hạ thấp rào cản hành động</strong> và chia nhỏ nhiệm vụ dưới 2 phút. Mẹ hãy cùng Milo theo dõi thanh đo nhịp tim nhận thức của bé nhé!`;
      }

      setTimeout(() => {
        playSfx('bell');
        box.innerHTML += `
          <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 text-xs space-y-1.5 shadow-xs">
            <div class="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
              <span>🤖</span> <span>Milo Coach Phản Hồi:</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              ${reply}
            </p>
          </div>
        `;
        box.scrollTop = box.scrollHeight;
      }, 350);
    }


    /* ============================================================
       M2. BẢNG KHẢO SÁT CHẨN ĐOÁN PHỤ HUYNH & HỒ SƠ NHẬN THỨC (VADPRS / SNAP-IV 9 CÂU)
       ============================================================ */
    const ADHD_SURVEY_QUESTIONS = [
      {
        id: "q1",
        dimension: "executive_function",
        dimensionName: "Chức năng Điều hành",
        subTrait: "Trí nhớ làm việc (Working Memory)",
        promptText: "Khi con được giao bài tập có từ 2 đến 3 yêu cầu liên tiếp (ví dụ: 'Đọc đoạn văn, gạch chân từ chỉ hoạt động rồi trả lời câu hỏi 1'), con có hay bị quên các bước tiếp theo hoặc chỉ làm được bước đầu tiên rồi dừng lại không?",
        behavioralAnchor: "Trẻ không ghi nhớ được chuỗi hành động trong đầu, cần phụ huynh phải nhắc đi nhắc lại từng bước một."
      },
      {
        id: "q2",
        dimension: "executive_function",
        dimensionName: "Chức năng Điều hành",
        subTrait: "Khởi động nhiệm vụ (Task Initiation)",
        promptText: "Khi bắt đầu ngồi vào bàn học, con có loay hoay rất lâu (như liên tục đi uống nước, tìm bút, gọt bút chì, ngó nghiêng đồ vật) hoặc bị 'đóng băng', không biết bắt đầu từ đâu dù bài tập không quá khó không?",
        behavioralAnchor: "Trẻ trì hoãn khởi động, cần 15-30 phút chỉ để đặt bút viết chữ đầu tiên."
      },
      {
        id: "q3",
        dimension: "executive_function",
        dimensionName: "Chức năng Điều hành",
        subTrait: "Kiểm soát ức chế & Lập kế hoạch",
        promptText: "Con có xu hướng vội vàng viết đáp án ngay khi chưa đọc hết câu hỏi, bỏ qua bước tính toán ngoài nháp hoặc đột ngột chuyển sang làm việc khác giữa chừng mà không kiểm soát được không?",
        behavioralAnchor: "Trẻ hấp tấp, thiếu bước kiểm tra lại bài, hành động trước khi suy nghĩ."
      },
      {
        id: "q4",
        dimension: "attention_span",
        dimensionName: "Khoảng Chú ý & Kháng Nhiễu",
        subTrait: "Chú ý duy trì liên tục",
        promptText: "Khoảng thời gian con có thể ngồi tập trung liên tục vào một bài tập học thuật (không đổi tư thế, không ngắt quãng) thường ngắn đến mức nào (ví dụ: chỉ duy trì được dưới 5 đến 10 phút là bắt đầu bồn chồn, ngáp hoặc nhìn đi nơi khác)?",
        behavioralAnchor: "Sự suy giảm chú ý diễn ra nhanh chóng sau vài phút đối diện bài tập có cấu trúc."
      },
      {
        id: "q5",
        dimension: "attention_span",
        dimensionName: "Khoảng Chú ý & Kháng Nhiễu",
        subTrait: "Kháng nhiễu ngoại lai",
        promptText: "Khi đang làm bài tập, chỉ cần một tiếng động nhỏ (tiếng nói chuyện nhẹ, tiếng xe ngoài ngõ, tivi ở phòng bên) hoặc một đồ vật chuyển động trong tầm mắt, con có lập tức bị phân tán và mất luôn dòng suy nghĩ không?",
        behavioralAnchor: "Bộ lọc cảm giác yếu, trẻ phản ứng với mọi biến đổi của môi trường xung quanh."
      },
      {
        id: "q6",
        dimension: "attention_span",
        dimensionName: "Khoảng Chú ý & Kháng Nhiễu",
        subTrait: "Duy trì quán tính hoàn thành bài",
        promptText: "Con có thường xuyên để bài tập ở trạng thái dở dang (ví dụ: làm được nửa bài toán hoặc viết được vài dòng chính tả thì dừng lại, bỏ đi chơi hoặc vẽ linh tinh vào lề vở) dù chưa hết giờ không?",
        behavioralAnchor: "Đứt gãy động lực giữa chừng do chiết khấu trì hoãn và thiếu hụt dopamine."
      },
      {
        id: "q7",
        dimension: "rsd_sensitivity",
        dimensionName: "Độ Nhạy Cảm Thất Bại (RSD)",
        subTrait: "Nỗi sợ làm sai & Cầu toàn tiêu cực",
        promptText: "Con có biểu hiện quá lo lắng về việc bị sai (ví dụ: liên tục tẩy xóa đến rách vở, hỏi đi hỏi lại 'con làm thế này có bị sai không mẹ', hoặc ngập ngừng không dám tự điền đáp án vì sợ sai) không?",
        behavioralAnchor: "Nỗi sợ thất bại gây ức chế hành động, tạo ra cảm giác bất an khi đối diện bài tập đánh giá."
      },
      {
        id: "q8",
        dimension: "rsd_sensitivity",
        dimensionName: "Độ Nhạy Cảm Thất Bại (RSD)",
        subTrait: "Phản ứng cảm xúc khi bị sửa bài",
        promptText: "Khi ba mẹ hoặc thầy cô chỉ ra chỗ con làm sai hoặc nhắc con sửa lại, con có dễ nảy sinh phản ứng gay gắt (như cáu kỉnh, khóc òa, tự ái, xé nháp hoặc giận dỗi nói 'con dốt lắm / con không làm nữa') không?",
        behavioralAnchor: "Hạch hạnh nhân kích hoạt quá mức trước phản hồi tiêu cực, coi việc sửa sai như một sự từ chối cá nhân."
      },
      {
        id: "q9",
        dimension: "rsd_sensitivity",
        dimensionName: "Độ Nhạy Cảm Thất Bại (RSD)",
        subTrait: "Ngưỡng chịu đựng thất vọng",
        promptText: "Khi gặp một câu hỏi hóc búa hoặc chưa hiểu ngay cách giải, con có nhanh chóng nản lòng, bực tức và lập tức buông xuôi, từ chối thử sức tiếp không?",
        behavioralAnchor: "Trẻ né tránh sự thất vọng bằng cách từ bỏ ngay lập tức để bảo vệ lòng tự trọng bị đe dọa."
      }
    ];

    const ADHD_LIKERT_OPTIONS = [
      { value: 0, label: "Không bao giờ" },
      { value: 1, label: "Thỉnh thoảng" },
      { value: 2, label: "Thường xuyên" },
      { value: 3, label: "Rất thường xuyên" }
    ];

    function calculateCognitiveProfileFromAnswers(answers) {
      let q = [];
      if (Array.isArray(answers)) {
        q = answers.map(Number);
      } else if (typeof answers === 'object' && answers !== null) {
        for (let i = 1; i <= 9; i++) {
          const v = answers[`q${i}`] !== undefined ? answers[`q${i}`] : answers[i];
          q.push(Number(v));
        }
      }
      if (q.length !== 9 || q.some(v => isNaN(v) || v < 0 || v > 3)) {
        throw new Error("Cần đủ 9 câu trả lời hợp lệ từ 0 đến 3");
      }

      // 1. Raw Subscale Scores
      const S_EF = q[0] + q[1] + q[2];
      const S_AS = q[3] + q[4] + q[5];
      const S_RSD = q[6] + q[7] + q[8];
      const S_total = S_EF + S_AS + S_RSD;

      // 2. Normalized Indices [0.0, 1.0]
      const I_EF = S_EF / 9.0;
      const I_AS = S_AS / 9.0;
      const I_RSD = S_RSD / 9.0;
      const CDI = 0.40 * I_EF + 0.35 * I_AS + 0.25 * I_RSD;

      // 3. CognitiveProfile Vector Mapping
      const attention_span_minutes = Math.max(5, Math.min(25, Math.round(25.0 - (S_AS / 9.0) * 20.0)));
      const recommended_micro_task_duration_sec = Math.min(300, Math.max(60, Math.round((300.0 - (S_AS / 9.0) * 210.0) / 30.0) * 30));
      const working_memory_capacity = Math.min(5, Math.max(1, Math.round(5.0 - (S_EF / 9.0) * 4.0)));
      const rsd_sensitivity_level = S_RSD <= 2 ? "LOW" : S_RSD <= 4 ? "MEDIUM" : S_RSD <= 7 ? "HIGH" : "SEVERE";
      const scaffolding_level = CDI < 0.35 ? "MINIMAL" : CDI < 0.70 ? "MODERATE" : "INTENSIVE";
      const max_steps_per_session = CDI < 0.35 ? 6 : CDI < 0.70 ? 4 : 3;

      return {
        attention_span_minutes,
        recommended_micro_task_duration_sec,
        working_memory_capacity,
        rsd_sensitivity_level,
        scaffolding_level,
        max_steps_per_session,
        raw_scores: {
          executive_function: S_EF,
          attention_span: S_AS,
          rsd_sensitivity: S_RSD,
          total_score: S_total
        },
        normalized_indices: {
          executive_function_deficit_index: Math.round(I_EF * 10000) / 10000,
          attention_decay_index: Math.round(I_AS * 10000) / 10000,
          rejection_sensitivity_index: Math.round(I_RSD * 10000) / 10000,
          composite_deficit_index: Math.round(CDI * 10000) / 10000
        }
      };
    }

    function updateCognitiveProfileUI(profile) {
      if (!profile) profile = appState.cognitiveProfile || DEFAULT_COGNITIVE_PROFILE;
      const badgeText = `🎯 Hồ sơ nhận thức: Chú ý ${profile.attention_span_minutes}p • Vi bước ${profile.recommended_micro_task_duration_sec}s • RSD ${profile.rsd_sensitivity_level}`;
      const badgeEl = document.getElementById('parent-cognitive-badge');
      if (badgeEl) {
        badgeEl.textContent = badgeText;
      }
      const homeBadge = document.getElementById('parent-home-scaffold-badge');
      if (homeBadge) {
        homeBadge.textContent = profile.scaffolding_level;
      }
      const homeDesc = document.getElementById('parent-home-profile-desc');
      if (homeDesc) {
        homeDesc.textContent = `Chú ý ${profile.attention_span_minutes} phút • Vi bước ${profile.recommended_micro_task_duration_sec}s • Trí nhớ ${profile.working_memory_capacity} chunks`;
      }
    }

    function renderSurveyQuestions() {
      const container = document.getElementById('survey-questions-list');
      if (!container) return;

      let savedAnswers = appState.surveyAnswers;
      if (!savedAnswers) {
        try {
          if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem('milo_survey_answers');
            if (raw) savedAnswers = JSON.parse(raw);
          }
        } catch (e) {}
      }

      container.innerHTML = ADHD_SURVEY_QUESTIONS.map((q, idx) => {
        const qNum = idx + 1;
        const currentVal = savedAnswers && (savedAnswers[q.id] !== undefined ? savedAnswers[q.id] : savedAnswers[qNum]);
        return `
          <div id="survey-q-box-${qNum}" class="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Câu ${qNum}: ${q.subTrait}
              </span>
              <span class="text-[9px] text-slate-400 font-semibold">${q.dimensionName}</span>
            </div>
            <p class="text-xs font-semibold text-slate-800 leading-relaxed">${q.promptText}</p>
            <p class="text-[10px] text-slate-500 italic bg-white/80 p-1.5 rounded-lg border border-slate-100">💡 ${q.behavioralAnchor}</p>
            <div class="grid grid-cols-2 gap-1.5 pt-1">
              ${ADHD_LIKERT_OPTIONS.map(opt => `
                <label class="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition text-[11px] font-medium text-slate-700 select-none">
                  <input type="radio" name="survey_${q.id}" value="${opt.value}" ${currentVal === opt.value ? 'checked' : ''} class="accent-teal-600 w-3.5 h-3.5 cursor-pointer">
                  <span>${opt.value}. ${opt.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    function openSurveyModal() {
      playSfx('tap');
      const modal = document.getElementById('parent-survey-modal');
      if (!modal) return;
      renderSurveyQuestions();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeSurveyModal() {
      playSfx('tap');
      const modal = document.getElementById('parent-survey-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function saveSurveyAndCalculateProfile() {
      playSfx('tap');
      const answers = {};
      const answerList = [];
      for (let i = 1; i <= 9; i++) {
        const checked = document.querySelector(`input[name="survey_q${i}"]:checked`) || document.querySelector(`input[name="q${i}"]:checked`);
        if (!checked) {
          if (typeof showToast === 'function') {
            showToast("Chưa hoàn thành khảo sát", `Vui lòng trả lời câu ${i} trước khi lưu!`, "⚠️");
          } else {
            alert(`Vui lòng trả lời câu ${i} trước khi lưu!`);
          }
          const qBox = document.getElementById(`survey-q-box-${i}`);
          if (qBox && typeof qBox.scrollIntoView === 'function') {
            qBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        const val = parseInt(checked.value, 10);
        answers[`q${i}`] = val;
        answerList.push(val);
      }

      const profile = calculateCognitiveProfileFromAnswers(answerList);
      appState.cognitiveProfile = profile;
      appState.surveyAnswers = answers;

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('milo_cognitive_profile', JSON.stringify(profile));
          localStorage.setItem('milo_survey_answers', JSON.stringify(answers));
        }
      } catch (err) {}

      updateCognitiveProfileUI(profile);
      closeSurveyModal();

      if (typeof showToast === 'function') {
        showToast("Hồ Sơ Đã Được Cập Nhật!", `Chú ý ${profile.attention_span_minutes}p • Vi bước ${profile.recommended_micro_task_duration_sec}s • RSD ${profile.rsd_sensitivity_level}`, "🎯");
      }
    }

    function skipSurveyWithDefaults() {
      playSfx('tap');
      appState.cognitiveProfile = Object.assign({}, DEFAULT_COGNITIVE_PROFILE);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('milo_cognitive_profile', JSON.stringify(appState.cognitiveProfile));
        }
      } catch (err) {}

      updateCognitiveProfileUI(appState.cognitiveProfile);
      closeSurveyModal();

      if (typeof showToast === 'function') {
        showToast("Đã Dùng Hồ Sơ Mặc Định", "Chú ý 12p • Vi bước 120s • RSD HIGH", "⚙️");
      }
    }

    // Expose survey APIs to window for inline onclick and test suites
    if (typeof window !== 'undefined') {
      window.openSurveyModal = openSurveyModal;
      window.closeSurveyModal = closeSurveyModal;
      window.saveSurveyAndCalculateProfile = saveSurveyAndCalculateProfile;
      window.skipSurveyWithDefaults = skipSurveyWithDefaults;
      window.calculateCognitiveProfileFromAnswers = calculateCognitiveProfileFromAnswers;
      window.DEFAULT_COGNITIVE_PROFILE = (typeof DEFAULT_COGNITIVE_PROFILE !== 'undefined') ? DEFAULT_COGNITIVE_PROFILE : (window.DEFAULT_COGNITIVE_PROFILE || {});
      window.updateCognitiveProfileUI = updateCognitiveProfileUI;
      window.renderSurveyQuestions = renderSurveyQuestions;
      window.loadStoredCognitiveProfile = loadStoredCognitiveProfile;
      window.ADHD_SURVEY_QUESTIONS = ADHD_SURVEY_QUESTIONS;
      window.ADHD_LIKERT_OPTIONS = ADHD_LIKERT_OPTIONS;
      window.detectDomainSubject = detectDomainSubject;
      window.generateClientSideMicroTasks = generateClientSideMicroTasks;
      window.parentRunAiBreakdown = parentRunAiBreakdown;
      window.tokenizeSentenceForHighlight = tokenizeSentenceForHighlight;
      window.toggleHighlightToken = toggleHighlightToken;
      window.completeHighlightStep = completeHighlightStep;
      window.toggleHighlightSegment = toggleHighlightSegment;
      window.normalizeAnswer = normalizeAnswer;
      window.handleChildTextInputSubmit = handleChildTextInputSubmit;
      window.renderParentActiveRoadmapList = renderParentActiveRoadmapList;
      window.parentRemoveRoadmapTask = parentRemoveRoadmapTask;
      window.parentClearChildRoadmap = parentClearChildRoadmap;
    }

