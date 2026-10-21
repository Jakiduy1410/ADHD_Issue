/* ============================================================
   MODULE: ADHD INTERACTIVE STEP RENDERERS & WORKSPACE
   ============================================================ */
    function childSwitchScreen(screenName) {
      playSfx('tap');
      const sHome = document.getElementById('child-screen-home');
      const sWork = document.getElementById('child-screen-workspace');
      const sRew = document.getElementById('child-screen-rewards');

      [sHome, sWork, sRew].forEach(el => {
        if (!el) return;
        el.classList.add('hidden');
        el.classList.remove('flex');
        el.style.setProperty('display', 'none', 'important');
        el.scrollTop = 0;
      });
      const sContainer = document.getElementById('child-screen-container');
      if (sContainer) sContainer.scrollTop = 0;

      if (screenName === 'home') {
        if (sHome) {
          sHome.classList.remove('hidden');
          sHome.classList.add('flex');
          sHome.style.setProperty('display', 'flex', 'important');
          sHome.scrollTop = 0;
        }
        stopStepTimer();
        renderChildIslandRoadmap();
      } else if (screenName === 'workspace') {
        if (sWork) {
          sWork.classList.remove('hidden');
          sWork.classList.add('flex');
          sWork.style.setProperty('display', 'flex', 'important');
          sWork.scrollTop = 0;
        }
      } else if (screenName === 'rewards') {
        if (sRew) {
          sRew.classList.remove('hidden');
          sRew.classList.add('flex');
          sRew.style.setProperty('display', 'flex', 'important');
          sRew.scrollTop = 0;
        }
        stopStepTimer();
      }
    }

    function exitChildWorkspace() {
      playSfx('tap');
      stopStepTimer();
      childSwitchScreen('home');
    }

    function startStepTimer(durationSecs) {
      stopStepTimer();
      stepTotalSeconds = durationSecs || 60;
      stepRemainingSeconds = stepTotalSeconds;
      isTimerPaused = false;
      updateTimerUI();

      stepTimerInterval = setInterval(() => {
        if (!isTimerPaused) {
          if (stepRemainingSeconds > 0) {
            stepRemainingSeconds--;
            updateTimerUI();
          } else {
            // Hết năng lượng bước: Nhẹ nhàng mở Milo Soft Pause
            stopStepTimer();
            toggleSoftPause(true);
          }
        }
      }, 1000);

      // Bộ đếm tổng thời gian phiên học
      if (!sessionTimerInterval) {
        sessionTimerInterval = setInterval(() => {
          if (!isTimerPaused) {
            appState.totalSessionSeconds++;
            const formatted = formatTime(appState.totalSessionSeconds);
            const durEl = document.getElementById('telemetry-duration');
            if (durEl) durEl.innerHTML = `${formatted} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;

            // Periodic telemetry broadcast every 5s
            if (appState.totalSessionSeconds % 5 === 0 && window.miloBus) {
              window.miloBus.broadcast('STEP_TELEMETRY_UPDATE', {
                taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
                stepIndex: appState.currentStepIndex,
                elapsedSec: appState.totalSessionSeconds,
                totalSteps: appState.activeTask ? appState.activeTask.steps.length : 3,
                status: isTimerPaused ? 'paused' : 'in_progress'
              });
            }
          }
        }, 1000);
      }
    }

    function stopStepTimer() {
      if (stepTimerInterval) {
        clearInterval(stepTimerInterval);
        stepTimerInterval = null;
      }
    }

    function updateTimerUI() {
      const ring = document.getElementById('child-ring-timer');
      const pill = document.getElementById('child-timer-pill');
      if (!ring || !pill) return;

      const progressPct = (stepRemainingSeconds / stepTotalSeconds) * 100;
      ring.style.setProperty('--progress', `${progressPct}%`);

      const formatted = formatTime(stepRemainingSeconds);
      pill.className = "hidden";
      if (isTimerPaused) {
        pill.innerHTML = `⏸️ ${formatted} • Đang sạc pin năng lượng`;
      } else if (progressPct > 30) {
        pill.innerHTML = `⏱️ ${formatted} • Năng lượng dồi dào`;
        ring.classList.remove('ring-timer-warning');
      } else {
        pill.innerHTML = `⏱️ ${formatted} • Nhẹ nhàng về đích`;
        ring.classList.add('ring-timer-warning');
      }
    }

    // Render đốt tiến trình ĐỘNG THEO SỐ BƯỚC CỦA BÀI
    function renderSegmentedTrackbar(totalSteps, currentStepIdx) {
      const track = document.getElementById('child-segments-track');
      track.innerHTML = '';
      for (let i = 0; i < totalSteps; i++) {
        const seg = document.createElement('div');
        seg.className = "h-2 flex-1 rounded-full transition-all duration-300 ";
        if (i < currentStepIdx) {
          seg.className += "bg-emerald-500 shadow-xs";
        } else if (i === currentStepIdx) {
          seg.className += "bg-emerald-400 ring-2 ring-emerald-200 animate-pulse";
        } else {
          seg.className += "bg-slate-200";
        }
        track.appendChild(seg);
      }
    }

    function renderParentTelemetryProgress(totalSteps, activeStepNum) {
      const barsContainer = document.getElementById('telemetry-progress-bars');
      const textContainer = document.getElementById('telemetry-progress-text');
      if (!barsContainer) return;

      barsContainer.innerHTML = '';
      textContainer.innerText = `${activeStepNum}/${totalSteps} bước đang làm`;

      for (let i = 0; i < totalSteps; i++) {
        const bar = document.createElement('div');
        bar.id = `telemetry-progress-segment-${i}`;
        bar.className = "h-2 flex-1 rounded-full ";
        if (i < activeStepNum - 1) {
          bar.className += "bg-emerald-500";
        } else if (i === activeStepNum - 1) {
          bar.className += "bg-amber-400 animate-pulse";
        } else {
          bar.className += "bg-slate-200";
        }
        barsContainer.appendChild(bar);
      }
    }

    function renderChildWorkspaceStep(stepIndex) {
      if (stepIndex !== undefined && stepIndex !== null) {
        appState.currentStepIndex = stepIndex;
      }
      const task = appState.activeTask;
      const stepIdx = appState.currentStepIndex;
      const totalSteps = task.steps.length;
      const stepData = task.steps[stepIdx];

      const btnNext = document.getElementById('child-btn-next-step');
      btnNext.disabled = true;
      btnNext.classList.add('btn-disabled');

      // Visual Theme (R5): Distinct visual identity for routines vs study tasks
      const isChore = (task && task.cat === 'chore');

      const focusCard = document.getElementById('child-focus-card');
      if (focusCard) {
        if (isChore) {
          focusCard.className = "bg-[#FFFDF5] border-2 border-amber-300 ring-4 ring-amber-100/50 rounded-[24px] p-3 shadow-inner flex flex-col justify-between";
        } else {
          focusCard.className = "bg-[#F0FDFA] border-2 border-teal-200 ring-4 ring-emerald-100 rounded-[24px] p-3 shadow-inner flex flex-col justify-between";
        }
      }

      const workspaceEl = document.getElementById('child-screen-workspace');
      if (workspaceEl) {
        if (isChore) {
          workspaceEl.classList.remove('bg-[#F0FDFA]', 'bg-[#F4F9F9]');
          workspaceEl.classList.add('bg-[#FFFDF5]');
        } else {
          workspaceEl.classList.remove('bg-[#FFFDF5]', 'bg-[#F4F9F9]');
          workspaceEl.classList.add('bg-[#F0FDFA]');
        }
      }

      if (isChore) {
        btnNext.classList.remove('btn-3d-green');
        btnNext.classList.add('btn-3d-amber');
      } else {
        btnNext.classList.remove('btn-3d-amber');
        btnNext.classList.add('btn-3d-green');
      }

      const wsIslandTagEl = document.getElementById('child-workspace-island-tag');
      if (wsIslandTagEl) {
        if (isChore) {
          wsIslandTagEl.innerText = "ĐẢO SINH HOẠT THƯ THÁI 🌿";
          wsIslandTagEl.className = "text-[10px] font-black px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300";
        } else {
          wsIslandTagEl.innerText = "ĐẢO BÀI TẬP TẬP TRUNG 🎯";
          wsIslandTagEl.className = "text-[10px] font-black px-2 py-0.5 rounded-full border bg-teal-100 text-teal-800 border-teal-300";
        }
      }

      // 1. Progress Bar
      renderSegmentedTrackbar(totalSteps, stepIdx);
      renderParentTelemetryProgress(totalSteps, stepIdx + 1);

      // 2. Chạy đồng hồ thị giác
      startStepTimer(task.stepSeconds || 60);

      // 3. Header Text (Duy nhất 1 tiêu đề to rõ, badge bước gọn gàng)
      document.getElementById('child-step-badge').innerText = `Bước ${stepIdx + 1} / ${totalSteps}`;
      document.getElementById('child-instruction-text').innerHTML = stepData.text || stepData.atomic_instruction || (stepData.title || "");


      // 4. Interactive Stage Render theo Loại
      const stage = document.getElementById('child-interactive-stage');
      const ui = stepData.ui_payload || stepData.ui_data || {};

      // Điều phối chuyên biệt cho 2 Dạng bài nhiều ý GDPT 2018 (Đặt tính & Tìm X lũy tiến)
      if (task.exercise_type === 'multi_item_arithmetic') {
        stage.innerHTML = renderMultiItemArithmeticStage(task, stepIdx);
        return;
      }
      if (task.exercise_type === 'multi_item_find_x') {
        resetMultiTaskState();
        stage.innerHTML = renderMultiItemFindXStage(task, stepIdx);
        return;
      }

      if (stepData.type === 'chore_pens') {
        stage.innerHTML = `
          <div class="relative bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 min-h-[200px] flex flex-col justify-between">
            <div class="flex justify-between items-center text-xs font-black text-amber-900 mb-1">
              <span>Góc bàn học của Leo:</span>
              <span id="pen-counter" class="bg-amber-200 px-2 py-0.5 rounded-full font-mono">0/3 cây bút</span>
            </div>
            <div class="grid grid-cols-3 gap-2 my-auto">
              <button onclick="pickChoreItem(this, 'pen1')" class="chore-target bg-white p-2.5 rounded-2xl border-2 border-amber-200 text-3xl shadow-sm hover:scale-105 active:scale-95 transition flex flex-col items-center">
                <span>✏️</span>
                <span class="text-[9px] font-bold text-slate-500 mt-0.5">Bút chì</span>
              </button>
              <button onclick="pickChoreItem(this, 'pen2')" class="chore-target bg-white p-2.5 rounded-2xl border-2 border-amber-200 text-3xl shadow-sm hover:scale-105 active:scale-95 transition flex flex-col items-center">
                <span>🖊️</span>
                <span class="text-[9px] font-bold text-slate-500 mt-0.5">Bút bi xanh</span>
              </button>
              <button onclick="pickChoreItem(this, 'pen3')" class="chore-target bg-white p-2.5 rounded-2xl border-2 border-amber-200 text-3xl shadow-sm hover:scale-105 active:scale-95 transition flex flex-col items-center">
                <span>🖍️</span>
                <span class="text-[9px] font-bold text-slate-500 mt-0.5">Bút sáp</span>
              </button>
            </div>
            <div class="text-[11px] font-bold text-slate-500 text-center">
              Ống cắm bút: 🏺 <span id="pen-box-status" class="text-amber-700">Đang chờ 3 cây bút về đích...</span>
            </div>
          </div>
        `;

      } else if (stepData.type === 'chore_trash') {
        stage.innerHTML = `
          <div class="bg-rose-50/70 border-2 border-dashed border-rose-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div id="trash-items" class="flex items-center gap-3">
              <span class="text-4xl animate-bounce">📄</span>
              <span class="text-3xl opacity-75">🗑️</span>
            </div>
            <p class="text-xs font-bold text-slate-600 text-center">Có mẩu giấy nháp rơi dưới sàn cạnh bàn</p>
            <button onclick="pickTrash(this)" class="btn-3d-yellow px-5 py-3 rounded-2xl font-black text-sm text-slate-900 shadow-md">
              🗑️ BỎ GIẤY VÀO THÙNG RÁC
            </button>
          </div>
        `;

      } else if (stepData.type === 'chore_books') {
        stage.innerHTML = `
          <div class="bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div id="books-scattered" class="flex items-center gap-2">
              <span class="text-4xl animate-bounce">📚</span>
              <span class="text-3xl opacity-75">📖</span>
              <span class="text-3xl opacity-60">📒</span>
            </div>
            <p class="text-xs font-bold text-slate-600 text-center">3 cuốn sách đang nằm lệch lạc</p>
            <button onclick="tidyBooks(this)" class="btn-3d-yellow px-5 py-3 rounded-2xl font-black text-sm text-slate-900 shadow-md">
              📐 XẾP THẲNG HÀNG VÀO GÓC TRÁI
            </button>
          </div>
        `;

      } else if (stepData.type === 'chore_wipe') {
        stage.innerHTML = `
          <div class="bg-sky-50/70 border-2 border-dashed border-sky-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div id="desk-surface" class="w-20 h-20 rounded-3xl bg-amber-100/80 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner transition duration-500">
              💨
            </div>
            <p id="desk-status" class="text-xs font-bold text-slate-600">Có một vệt bụi nhỏ trên mặt bàn</p>
            <button onclick="cleanDesk(this)" class="btn-3d-blue px-5 py-3 rounded-2xl font-black text-sm text-white shadow-md">
              ✨ DÙNG KHĂN LAU SÁNG BÓNG
            </button>
          </div>
        `;

      } else if (stepData.type === 'math_clues') {
        stage.innerHTML = `
          <div class="py-2 flex flex-wrap gap-2 items-center">
            <span class="text-slate-600 font-semibold text-sm">Bác Ba có một mảnh vườn.</span>
            <span class="text-slate-700 font-extrabold text-base">Biết vườn có</span>
            
            <button onclick="toggleMathClue(this, '12m')" class="math-clue btn-3d-white px-3 py-1.5 rounded-xl font-black text-base text-slate-800">
              chiều dài 12m
            </button>
            
            <span class="text-slate-700 font-extrabold text-base">và</span>
            
            <button onclick="toggleMathClue(this, '5m')" class="math-clue btn-3d-white px-3 py-1.5 rounded-xl font-black text-base text-slate-800">
              chiều rộng 5m
            </button>

            <button onclick="alertWrongClue(this)" class="btn-3d-white px-2.5 py-1 rounded-xl font-bold text-xs text-slate-700 font-bold">
              trồng 3 cây xoài
            </button>

            <span class="text-slate-700 font-extrabold text-base w-full mt-1">Hỏi diện tích mảnh vườn là bao nhiêu?</span>
          </div>
        `;

      } else if (stepData.type === 'math_formula') {
        stage.innerHTML = `
          <div class="py-2 flex flex-col gap-3">
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-around text-xs font-black text-amber-900">
              <span>📏 Dài: 12m</span> <span>•</span> <span>📐 Rộng: 5m</span>
            </div>
            <div class="grid grid-cols-1 gap-2.5">
              <button onclick="selectMathOp(this, true)" class="math-op btn-3d-white py-3 rounded-2xl font-black text-xl text-slate-800 flex items-center justify-center gap-3">
                <span>12 × 5</span>
                <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">Dài nhân Rộng (Đúng)</span>
              </button>
              <button id="math-wrong-op" onclick="selectMathOp(this, false)" class="math-op btn-3d-white py-3 rounded-2xl font-black text-xl text-slate-800 flex items-center justify-center gap-3">
                <span>12 + 5</span>
                <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">Dài cộng Rộng</span>
              </button>
            </div>
          </div>
        `;

      } else if (stepData.type === 'math_numpad') {
        appState.numpadValue = "";
        stage.innerHTML = `
          <div class="flex flex-col items-center py-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl font-black text-slate-700">12 × 5 =</span>
              <div id="child-numpad-screen" class="w-20 h-10 rounded-xl bg-amber-50 border-3 border-amber-400 flex items-center justify-center text-2xl font-black text-slate-900 font-mono shadow-inner">
                ?
              </div>
              <span class="text-base font-black text-slate-500">m²</span>
            </div>
            <!-- BÀN PHÍM NUMPAD XÚC GIÁC TACTILE -->
            <div class="grid grid-cols-3 gap-2 w-full max-w-[250px]">
              <button onclick="pressChildNum('1')" class="btn-3d-white py-2 rounded-xl font-black text-base">1</button>
              <button onclick="pressChildNum('2')" class="btn-3d-white py-2 rounded-xl font-black text-base">2</button>
              <button onclick="pressChildNum('3')" class="btn-3d-white py-2 rounded-xl font-black text-base">3</button>
              <button onclick="pressChildNum('4')" class="btn-3d-white py-2 rounded-xl font-black text-base">4</button>
              <button onclick="pressChildNum('5')" class="btn-3d-white py-2 rounded-xl font-black text-base">5</button>
              <button onclick="pressChildNum('6')" class="btn-3d-white py-2 rounded-xl font-black text-base">6</button>
              <button onclick="pressChildNum('7')" class="btn-3d-white py-2 rounded-xl font-black text-base">7</button>
              <button onclick="pressChildNum('8')" class="btn-3d-white py-2 rounded-xl font-black text-base">8</button>
              <button onclick="pressChildNum('9')" class="btn-3d-white py-2 rounded-xl font-black text-base">9</button>
              <button onclick="pressChildNum('0')" class="col-span-2 btn-3d-white py-2 rounded-xl font-black text-base">0</button>
              <button onclick="pressChildNum('DEL')" class="btn-3d-white py-2 rounded-xl font-black text-xs text-rose-500">⌫ Xóa</button>
            </div>
          </div>
        `;

      } else if (
        stepData.action_verb === 'Chạm_hình' || 
        stepData.ui_type === 'shape_touch' || 
        (ui.geometry_spec && (ui.geometry_spec.shape_type === 'house_counting' || stepData.badge === 'Xác Định Cửa Sổ Tròn' || ui.hide_choice_options))
      ) {
        // VI BƯỚC TƯƠNG TÁC CHẠM HÌNH HỌC THUẦN TÚY (KHÔNG CHÈN TRẮC NGHIỆM GÂY NHIỄU)
        const geomSvg = (ui.geometry_spec || (task && task.geometry_spec)) ? renderGeometrySvg(ui.geometry_spec || task.geometry_spec) : '';
        stage.innerHTML = `
          <div class="flex flex-col gap-2.5 my-auto w-full items-center">
            ${geomSvg}
            <div id="choice-feedback" class="text-xs font-bold text-center text-slate-600 min-h-[18px]">
              👆 Bé hãy chạm trực tiếp vào hình tròn trên ngôi nhà nhé!
            </div>
          </div>
        `;

      } else if (stepData.ui_type === 'progressive_calculation' || (ui && ui.progressive_phases && ui.progressive_phases.length > 0)) {
        renderProgressiveCalculationStage(stage, stepData, task);

      } else if ((stepData.ui_type === 'single_choice' || stepData.type === 'single_choice') && ui.options && ui.options.length > 0) {
        const opts = ui.options;
        const prompt = ui.prompt_text || stepData.text || stepData.atomic_instruction || "Chọn đáp án đúng:";
        const expected = (stepData.success_criteria && stepData.success_criteria.expected_answer !== undefined) 
          ? stepData.success_criteria.expected_answer 
          : (stepData.expected_answer !== undefined ? stepData.expected_answer : (ui.expected_answer !== undefined ? ui.expected_answer : null));
        const geomSvg = (ui.geometry_spec || (task && task.geometry_spec)) ? renderGeometrySvg(ui.geometry_spec || task.geometry_spec) : '';
        const readingPassage = (task && task.reading_passage) || ui.reading_passage;
        let passageDrawerHtml = '';
        if (readingPassage) {
          passageDrawerHtml = `
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-950 mb-1 cursor-pointer" open>
              <summary class="font-bold flex items-center justify-between text-indigo-800 select-none">
                <span class="flex items-center gap-2"><span>📖</span> <span>Đoạn văn chuyện gốc:</span></span>
                <span class="text-[10px] text-indigo-600 underline">Thu gọn/Mở</span>
              </summary>
              <p class="mt-2 text-[11px] leading-relaxed text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100 whitespace-pre-line">
                ${readingPassage}
              </p>
            </details>
          `;
        }
        let optHtml = opts.map(opt => `
          <button onclick='handleChildChoice(this, ${JSON.stringify(opt)}, ${JSON.stringify(expected)})' class="w-full btn-3d-white py-3 px-4 rounded-2xl font-black text-xs text-slate-800 text-left hover:border-emerald-400 transition flex items-center justify-between">
            <span>${opt}</span>
          </button>
        `).join('');
        stage.innerHTML = `
          <div class="flex flex-col gap-2.5 my-auto w-full">
            <p class="hidden">${prompt}</p>
            ${geomSvg}
            ${passageDrawerHtml}
            <div class="space-y-2 my-auto">
              ${optHtml}
            </div>
            <div id="choice-feedback" class="text-xs font-bold text-center min-h-[18px]"></div>
          </div>
        `;



      } else if (stepData.ui_type === 'text_input' || stepData.type === 'text_input') {
        const prompt = ui.prompt_text || stepData.text || stepData.atomic_instruction || "Nhập câu trả lời của bé:";
        const placeholder = ui.placeholder || "Điền số...";
        const expected = (stepData.success_criteria && stepData.success_criteria.expected_answer !== undefined) 
          ? stepData.success_criteria.expected_answer 
          : (stepData.expected_answer !== undefined ? stepData.expected_answer : (ui.expected_answer !== undefined ? ui.expected_answer : null));

        // 1. Tách phần đơn vị (trong ngoặc đơn ở cuối nếu có)
        const unitMatch = prompt.match(/\s*\((.*?)\)\s*$/);
        const unitText = unitMatch ? unitMatch[1].trim() : '';
        const mathPart = unitMatch ? prompt.slice(0, unitMatch.index).trim() : prompt.trim();

        // 2. Nhận diện phép tính đặt bảng dọc (+, -, ×, *)
        const opCount = (mathPart.match(/[\+\-\*×x]/g) || []).length;
        const hasDivOrPercent = /[:\/%]/.test(mathPart);

        let vertMatch = null;
        if (opCount === 1 && !hasDivOrPercent) {
          vertMatch = mathPart.match(/^\s*([0-9\s,\.]+?)\s*([\+\-\*×x])\s*([0-9\s,\.]+?)\s*=\s*(?:\?|[\.\_]+)\s*$/);
        }

        let mathDisplayHtml = '';

        if (vertMatch) {
          let numTop = vertMatch[1].replace(/\s+/g, '').trim();
          let op = vertMatch[2].trim();
          if (op === '*' || op === 'x') op = '×';
          let numBottom = vertMatch[3].replace(/\s+/g, '').trim();

          // 1. QUY TẮC: LUÔN CHO SỐ BÉ XUỐNG DƯỚI Ở PHÉP NHÂN ĐỂ TỐI ƯU DÒNG RENDER
          if (op === '×') {
            const topClean = numTop.replace(',', '');
            const botClean = numBottom.replace(',', '');
            if (topClean.length < botClean.length || (topClean.length === botClean.length && parseFloat(numTop.replace(',', '.')) < parseFloat(numBottom.replace(',', '.')))) {
              const temp = numTop;
              numTop = numBottom;
              numBottom = temp;
            }
          }

          // 2. PHÂN TÍCH CHỮ SỐ VÀ VỊ TRÍ DẤU PHẨY (THỪA SỐ TRÊN, THỪA SỐ DƯỚI, VÀ KẾT QUẢ)
          const topParts = numTop.split(',');
          const topIntStr = topParts[0] || '0';
          const topDecStr = topParts[1] || '';
          const topDecLen = topDecStr.length;
          const topClean = topIntStr + topDecStr;

          const botParts = numBottom.split(',');
          const botIntStr = botParts[0] || '0';
          const botDecStr = botParts[1] || '';
          const botDecLen = botDecStr.length;
          const botClean = botIntStr + botDecStr;

          const hasDecimal = (topDecLen > 0 || botDecLen > 0);
          let resDecLen = 0;
          if (op === '×') {
            resDecLen = topDecLen + botDecLen;
          } else {
            resDecLen = Math.max(topDecLen, botDecLen);
          }

          // 3. TÍNH TOÁN GIÁ TRỊ VÀ CÁC DÒNG TÍCH RIÊNG ĐỘNG (HỖ TRỢ MỌI SỐ CÓ >= 2 CHỮ SỐ)
          let totalDigitsStr = '';
          const partialProducts = []; // Danh sách các dòng tích riêng: part1, part2, part3...
          const botDigitsRev = botClean.split('').reverse();
          const hasMultiRows = (op === '×' && botDigitsRev.length >= 2);

          if (op === '×') {
            const topValInt = parseInt(topClean, 10);
            const botValInt = parseInt(botClean, 10);
            const totalValInt = topValInt * botValInt;
            totalDigitsStr = totalValInt.toString();
            if (resDecLen > 0 && totalDigitsStr.length <= resDecLen) {
              totalDigitsStr = totalDigitsStr.padStart(resDecLen + 1, '0');
            }
            if (hasMultiRows) {
              for (let r = 0; r < botDigitsRev.length; r++) {
                const d = parseInt(botDigitsRev[r], 10);
                partialProducts.push((topValInt * d).toString());
              }
            }
          } else {
            const topFloat = parseFloat(numTop.replace(',', '.'));
            const botFloat = parseFloat(numBottom.replace(',', '.'));
            const mathRes = (op === '+') ? (topFloat + botFloat) : (topFloat - botFloat);
            if (resDecLen > 0) {
              const resFmt = mathRes.toFixed(resDecLen).replace('.', ',');
              totalDigitsStr = resFmt.replace(',', '');
            } else {
              totalDigitsStr = Math.round(mathRes).toString();
            }
          }

          // 4. XÁC ĐỊNH SỐ CỘT (NUM COLS) ĐẢM BẢO CHỮ SỐ Ở TẤT CẢ CÁC HÀNG CĂN THẲNG TRỤC DỌC 100%
          let maxColsNeeded = Math.max(topClean.length, botClean.length, totalDigitsStr.length);
          if (hasMultiRows) {
            partialProducts.forEach((pVal, r) => {
              maxColsNeeded = Math.max(maxColsNeeded, pVal.length + r);
            });
          }
          let numCols = Math.max(maxColsNeeded, 3);

          // Kích thước ô chuẩn:
          let cellCls = 'w-8 h-9 text-lg';
          let fontCls = 'text-lg';
          if (numCols >= 6 && numCols <= 7) {
            cellCls = 'w-7 h-8 text-base';
            fontCls = 'text-base';
          } else if (numCols >= 8) {
            cellCls = 'w-6 h-7 text-sm';
            fontCls = 'text-sm';
          }

          // Dấu phẩy thanh thoát nằm lọt vào khoảng hở 8px giữa 2 ô (không đè viền hộp, không chiếm cột):
          const gapPx = 8;
          const makeCommaTag = (isInput = false) => `
            <div class="absolute left-full top-0 bottom-0 flex items-end justify-center select-none pointer-events-none" style="width: ${gapPx}px; z-index: 20;">
              <span class="font-mono font-black text-rose-600 ${isInput ? 'text-xl' : fontCls} leading-none mb-1">,</span>
            </div>
          `;

          // A. DÒNG THỪA SỐ TRÊN
          let rowTopHtml = '';
          for (let c = numCols - 1; c >= 0; c--) {
            const hasComma = (c === topDecLen && topDecLen > 0);
            const commaTag = hasComma ? makeCommaTag(false) : '';
            if (c < topClean.length) {
              const ch = topClean[topClean.length - 1 - c];
              rowTopHtml += `<div class="${cellCls} relative flex items-center justify-center font-mono font-black text-slate-800 select-none">${ch}${commaTag}</div>`;
            } else {
              rowTopHtml += `<div class="${cellCls} select-none"></div>`;
            }
          }

          // B. DÒNG THỪA SỐ DƯỚI (SỐ NGUYÊN KHÔNG CÓ DẤU PHẨY, GIỮ NGUYÊN DẠNG GỐC)
          let rowBotHtml = '';
          for (let c = numCols - 1; c >= 0; c--) {
            const hasComma = (c === botDecLen && botDecLen > 0);
            const commaTag = hasComma ? makeCommaTag(false) : '';
            if (c < botClean.length) {
              const ch = botClean[botClean.length - 1 - c];
              rowBotHtml += `<div class="${cellCls} relative flex items-center justify-center font-mono font-black text-slate-800 select-none">${ch}${commaTag}</div>`;
            } else {
              rowBotHtml += `<div class="${cellCls} select-none"></div>`;
            }
          }

          // C. CÁC DÒNG TÍCH RIÊNG ĐỘNG (Sinh đầy đủ part1, part2, part3... theo số chữ số thừa số dưới)
          let multiRowsHtml = '';
          if (hasMultiRows) {
            const rowsHtmlArr = [];
            partialProducts.forEach((pVal, r) => {
              let cells = '';
              for (let c = numCols - 1; c >= 0; c--) {
                if (c < r) {
                  // Cột bị lùi sang trái ở dòng thứ r
                  cells += `<div class="${cellCls} flex items-center justify-center text-slate-300 font-light select-none">·</div>`;
                } else if ((c - r) < pVal.length) {
                  // Cột có chữ số của tích riêng
                  cells += `<input type="text" maxlength="1" inputmode="numeric" data-row="part${r + 1}" data-col="${c}" class="digit-cell ${cellCls} text-center font-mono font-black rounded-lg border-2 border-slate-300 bg-white text-slate-900 focus:bg-teal-50 focus:border-teal-500 focus:outline-none shadow-xs transition" />`;
                } else {
                  // Cột đệm bên trái
                  cells += `<div class="${cellCls} select-none"></div>`;
                }
              }
              rowsHtmlArr.push(`
                <div class="flex items-center justify-end my-0.5 gap-2">
                  ${cells}
                </div>
              `);
            });

            multiRowsHtml = `
              ${rowsHtmlArr.join('')}
              <div class="w-full h-[2px] bg-slate-700 my-1 rounded-full"></div>
            `;
          }

          // D. DÒNG ĐÁP SỐ TỔNG (ĐIỀN TỪ PHẢI QUA TRÁI, DẤU PHẨY CĂN GIỮA KHE KHÔNG ĐÈ HỘP)
          let totalCellsHtml = '';
          for (let c = numCols - 1; c >= 0; c--) {
            const hasComma = (c === resDecLen && resDecLen > 0);
            const commaTag = hasComma ? makeCommaTag(true) : '';
            if (c < totalDigitsStr.length) {
              totalCellsHtml += `<div class="relative"><input type="text" maxlength="1" inputmode="numeric" data-row="total" data-col="${c}" class="digit-cell ${cellCls} text-center font-mono font-black rounded-lg border-2 border-teal-500 bg-teal-50 text-slate-900 focus:bg-teal-100 focus:border-teal-600 focus:outline-none shadow-xs transition" />${commaTag}</div>`;
            } else {
              totalCellsHtml += `<div class="${cellCls} select-none"></div>`;
            }
          }

          mathDisplayHtml = `
            <div data-math-grid="true" data-res-dec-len="${resDecLen}" class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center my-1 select-none max-w-[340px] mx-auto w-full">
              <div class="inline-flex flex-col items-end">
                <!-- Hàng thừa số trên -->
                <div class="flex items-center justify-end my-0.5 gap-2">
                  ${rowTopHtml}
                </div>

                <!-- Hàng thừa số dưới: Dấu phép tính căn trái, thừa số căn phải -->
                <div class="flex items-center justify-end my-0.5 relative w-full gap-2">
                  <span class="absolute left-0 text-teal-600 font-mono font-black ${fontCls} select-none pl-1">${op}</span>
                  <div class="flex items-center justify-end gap-2">
                    ${rowBotHtml}
                  </div>
                </div>

                <!-- Vạch ngang đặt tính -->
                <div class="w-full h-[2.5px] bg-slate-800 my-1 rounded-full"></div>

                <!-- Các dòng tích riêng (nếu có) -->
                ${multiRowsHtml}

                <!-- Hàng đáp số tổng -->
                <div class="flex items-center justify-end my-0.5 gap-2">
                  ${totalCellsHtml}
                </div>

                ${unitText ? `<div class="text-[11px] font-bold text-slate-500 mt-2 text-center w-full select-none">Đơn vị: (${unitText})</div>` : ''}
                <input id="child-stage-text-input" type="hidden" value="" />
              </div>
            </div>
          `;

          setTimeout(() => {
            setupDigitGridListeners(expected);
          }, 60);
        
        } else {
          // Biểu thức ngang (phép chia, hoặc biểu thức phức hợp)
          const formulaMatch = mathPart.match(/^([^\?=]+?)\s*=\s*(?:\?|[\.\_]+)/);
          if (formulaMatch) {
            const expression = formulaMatch[1].trim();
            mathDisplayHtml = `
              <div class="bg-white py-3 px-4 rounded-2xl border-2 border-teal-300 shadow-sm flex items-center justify-center gap-2 text-slate-800 font-mono text-base font-black my-2 max-w-[320px] mx-auto w-full">
                <span class="tracking-wider whitespace-nowrap">${expression} =</span>
                <div class="inline-block w-24">
                  <input id="child-stage-text-input" 
                         type="text" 
                         placeholder="${placeholder || '?'}" 
                         autofocus 
                         inputmode="numeric"
                         autocomplete="off"
                         class="w-full text-center text-lg font-black p-1.5 rounded-xl border-2 border-teal-400 bg-teal-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner placeholder:text-slate-400" 
                         oninput='handleChildTextInput(this.value, ${JSON.stringify(expected)})'
                         onkeydown='if(event.key === "Enter") handleChildTextInputSubmit(${JSON.stringify(expected)})' />
                </div>
                ${unitText ? `<span class="text-xs font-bold text-slate-600 whitespace-nowrap">(${unitText})</span>` : ''}
              </div>
            `;
          } else {
            mathDisplayHtml = `
              <div class="max-w-[300px] mx-auto w-full my-2">
                <input id="child-stage-text-input" 
                       type="text" 
                       placeholder="${placeholder}" 
                       autofocus 
                       class="w-full text-center text-base font-black p-2.5 rounded-2xl border-2 border-teal-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-900 placeholder:text-slate-400" 
                       oninput='handleChildTextInput(this.value, ${JSON.stringify(expected)})'
                       onkeydown='if(event.key === "Enter") handleChildTextInputSubmit(${JSON.stringify(expected)})' />
              </div>
            `;
          }
        }

        const geomSvg = (ui.geometry_spec || (task && task.geometry_spec)) ? renderGeometrySvg(ui.geometry_spec || task.geometry_spec) : '';
        const readingPassage = (task && task.reading_passage) || ui.reading_passage;
        let passageDrawerHtml = '';
        if (readingPassage) {
          passageDrawerHtml = `
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-950 mb-1 cursor-pointer" open>
              <summary class="font-bold flex items-center justify-between text-indigo-800 select-none">
                <span class="flex items-center gap-2"><span>📖</span> <span>Đoạn văn chuyện gốc:</span></span>
                <span class="text-[10px] text-indigo-600 underline">Thu gọn/Mở</span>
              </summary>
              <p class="mt-2 text-[11px] leading-relaxed text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100 whitespace-pre-line">
                ${readingPassage}
              </p>
            </details>
          `;
        }

        stage.innerHTML = `
          <div class="flex flex-col gap-2.5 my-auto w-full">
            <p class="hidden">${prompt}</p>
            ${geomSvg}
            ${passageDrawerHtml}
            <div class="my-auto space-y-2">
              ${mathDisplayHtml}
              <button onclick='handleChildTextInputSubmit(${JSON.stringify(expected)})' class="w-full btn-3d-green py-2.5 rounded-xl font-black text-xs text-white shadow-md active:scale-95 transition">
                ✨ XÁC NHẬN ĐÁP SỐ
              </button>
            </div>
            <div id="text-input-feedback" class="text-xs font-bold text-center min-h-[16px]"></div>
          </div>
        `;

      } else if (stepData.ui_type === 'highlight' || stepData.type === 'highlight') {
        const targetSegments = ui.highlight_target_segments || 
          (stepData.success_criteria && Array.isArray(stepData.success_criteria.expected_answer) ? stepData.success_criteria.expected_answer : []);
        
        // Intelligent sentence resolution to prevent text dumping
        const isReading = task && (task.cat === 'eng' || task.cat === 'viet' || ui.exercise_type === 'reading_comprehension');
        let sentenceToTokenize;
        if (ui.reading_excerpt) {
          sentenceToTokenize = ui.reading_excerpt;
        } else if (isReading) {
          sentenceToTokenize = ui.prompt_text || stepData.text || (task && task.title) || "Đề bài";
        } else {
          sentenceToTokenize = (task && task.original_text) || ui.prompt_text || stepData.text || "Đề bài";
        }

        // Tước bỏ triệt để các phương án trắc nghiệm A, B, C, D nếu còn sót lại trong đề bài gốc
        if (sentenceToTokenize && typeof sentenceToTokenize === 'string') {
          sentenceToTokenize = sentenceToTokenize.split(/\n\s*[A-D][\.\:\)]/)[0].trim();
        }

        let tokens = tokenizeSentenceForHighlight(sentenceToTokenize, targetSegments);
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
        }

        // Render natural flowing paragraph with authentic yellow highlighter styling
        const paragraphHtml = tokens.map((tok, idx) => {
          if (tok.isNewline) {
            return `<span class="block w-full my-1.5"></span>`;
          }
          if (tok.isTarget) {
            const targetKeyAttr = tok.targetKey ? `data-target-key="${tok.targetKey}"` : '';
            return `
              <button type="button"
                onclick="toggleHighlightToken(this)"
                data-token-idx="${idx}"
                data-is-target="true"
                ${targetKeyAttr}
                class="highlight-token highlight-chip inline-flex items-center gap-1 px-2.5 py-1 mx-1 my-0.5 rounded-xl border-b-2 border-dashed border-amber-400 bg-amber-50/80 text-slate-900 text-xs font-bold cursor-pointer hover:bg-amber-100 active:scale-95 transition-all duration-150 select-none shadow-xs">
                <span class="text-amber-600 font-mono text-[10px]">✏️</span>
                <span>${tok.text}</span>
              </button>
            `;
          } else {
            return `<span class="text-slate-800 text-xs font-medium leading-relaxed">${tok.text}</span>`;
          }
        }).join(' ');

        // BƯỚC 1 GẠCH CHÂN ĐỀ BÀI: TUYỆT ĐỐI KHÔNG HIỂN THỊ HÌNH VẼ ĐỂ TRẺ TẬP TRUNG ĐỌC ĐỀ!
        // Chỉ vẽ hình nếu chính bước này yêu cầu rõ trong ui.geometry_spec
        const geomSvg = ui.geometry_spec ? renderGeometrySvg(ui.geometry_spec) : '';

        // Collapsible reading passage reference drawer if reading passage exists
        let passageDrawerHtml = '';
        const readingPassage = (task && task.reading_passage) || ui.reading_passage;
        if (readingPassage) {
          passageDrawerHtml = `
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-950 mb-1 cursor-pointer">
              <summary class="font-bold flex items-center justify-between text-indigo-800 select-none">
                <span class="flex items-center gap-2"><span>📖</span> <span>Xem lại toàn bài đọc</span></span>
                <span class="text-[10px] text-indigo-600 underline">Mở/Đóng</span>
              </summary>
              <p class="mt-2 text-[11px] leading-relaxed text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100 whitespace-pre-line">
                ${readingPassage}
              </p>
            </details>
          `;
        }

        stage.innerHTML = `
          <div class="flex flex-col gap-3 my-auto w-full">
            ${geomSvg}
            ${passageDrawerHtml}

            <!-- Natural Reading Flow (Thoáng, sạch sẽ, không hộp lồng hộp) -->
            <div id="highlight-tokens-container" class="bg-white p-4 rounded-2xl border border-slate-200 leading-loose text-left shadow-xs text-sm">
              ${paragraphHtml}
            </div>

            <!-- Feedback & Counter: Gọn gàng -->
            <div id="highlight-feedback" class="text-xs font-bold text-center text-teal-800 min-h-[16px]"></div>

            <button id="btn-complete-highlight" onclick="completeHighlightStep(this)" disabled class="hidden"></button>
          </div>
        `;


      } else {
        // Generic Micro-Task Stage (Cho các bài GDPT Tiếng Việt, Tiếng Anh, AI hoặc Soạn bằng tay)
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-3xl shadow-sm">
              🎯
            </div>
            <p class="text-xs font-bold text-slate-700 text-center px-2 leading-relaxed">${stepData.text || stepData.atomic_instruction}</p>
            <button onclick="completeGenericStep(this)" class="btn-3d-green px-5 py-3 rounded-2xl font-black text-xs text-white shadow-md active:scale-95 transition">
              ✅ BÉ ĐÃ LÀM XONG BƯỚC NÀY
            </button>
          </div>
        `;
      }
    }


    /* ============================================================
       G. TƯƠNG TÁC CHI TIẾT TRONG FOCUS WORKSPACE
       ============================================================ */
    function handleChildChoice(btn, chosen, expected) {
      playSfx('tap');
      const isCorrect = !expected || chosen === expected || (Array.isArray(expected) && expected.includes(chosen));
      if (isCorrect) {
        playSfx('star');
        btn.className = "w-full bg-emerald-100 border-2 border-emerald-400 py-2.5 px-3 rounded-2xl font-black text-xs text-emerald-950 flex items-center justify-between";
        const fb = document.getElementById('choice-feedback');
        if (fb) {
          fb.innerText = "";
        }
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
      } else {
        toggleSoftPause(true);
      }
    }

    function handleHouseWindowClick(el, winIdx) {
      if (typeof playSfx === 'function') playSfx('sparkle');
      if (el) {
        const circle = el.querySelector('circle') || el;
        if (circle) {
          circle.setAttribute('fill', '#86EFAC');
          circle.setAttribute('stroke', '#16A34A');
          circle.setAttribute('stroke-width', '4');
        }
      }
      const fb = document.getElementById('house-click-feedback') || document.getElementById('choice-feedback');
      if (fb) {
        fb.innerHTML = `✨ <span class="text-emerald-700 font-black">Chính xác! Bé đã tìm thấy cửa sổ hình tròn 🔵!</span>`;
      }
      // Tự động chọn phương án tương ứng nếu có danh sách lựa chọn
      const allChoiceBtns = document.querySelectorAll('#child-interactive-stage button');
      let foundMatchingChoice = false;
      allChoiceBtns.forEach(b => {
        const txt = (b.innerText || '').toLowerCase();
        if (txt.includes('cửa sổ') || txt.includes('hình tròn')) {
          b.click();
          foundMatchingChoice = true;
        }
      });
      if (!foundMatchingChoice) {
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
          btnNext.classList.add('animate-bounce');
          setTimeout(() => {
            const curNext = document.getElementById('child-btn-next-step');
            if (curNext && !curNext.disabled && typeof curNext.click === 'function') {
              curNext.click();
            }
          }, 800);
        }
      }
    }

    function handleHouseWindowWrongClick(el, partName) {
      if (typeof playSfx === 'function') playSfx('soft');
      const fb = document.getElementById('house-click-feedback') || document.getElementById('choice-feedback');
      if (fb) {
        fb.innerHTML = `💡 <span class="text-amber-700 font-bold">Đây là ${partName}! Bé hãy chạm vào cửa sổ hình tròn 🔵 nhé!</span>`;
      }
    }

    function normalizeAnswer(val) {
      if (val === null || val === undefined) return "";
      let s = String(val).trim().toLowerCase();
      // Loại bỏ dấu cách giữa các chữ số: "170 000" -> "170000"
      s = s.replace(/(\d)\s+(\d)/g, "$1$2");
      // Quy chuẩn dấu phẩy thập phân kiểu Việt Nam (12,5 -> 12.5)
      s = s.replace(/(\d+),(\d+)/g, "$1.$2");
      s = s.replace(/\s+/g, " ");
      return s;
    }

    function tokenizeSentenceForHighlight(sentence, targets) {
      if (!sentence) return [];
      const validTargets = (targets || []).filter(t => t && String(t).trim().length > 0);
      const sortedTargets = [...validTargets].sort((a, b) => String(b).length - String(a).length);
      const rawTokens = [];
      let remaining = sentence;

      // Group regular words into natural 2-3 word phrases and handle punctuation
      function chunkTextIntoPhrases(text) {
        if (!text || !text.trim()) return [];
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const chunks = [];
        let cur = [];
        for (let i = 0; i < words.length; i++) {
          cur.push(words[i]);
          const w = words[i];
          const hasPunct = /[.,!?;:]$/.test(w);
          if (cur.length >= 3 || hasPunct || i === words.length - 1) {
            chunks.push(cur.join(' '));
            cur = [];
          }
        }
        if (cur.length > 0) chunks.push(cur.join(' '));
        return chunks;
      }

      while (remaining.length > 0) {
        let earliestMatch = null;
        let matchedTarget = null;

        for (const target of sortedTargets) {
          const tStr = String(target).trim();
          const idx = remaining.toLowerCase().indexOf(tStr.toLowerCase());
          if (idx !== -1 && (earliestMatch === null || idx < earliestMatch.idx)) {
            earliestMatch = { idx, len: tStr.length };
            matchedTarget = tStr;
          }
        }

        if (earliestMatch !== null) {
          function pushWordsWithNewlines(str) {
            if (!str) return;
            const lines = str.split('\n');
            lines.forEach((line, lIdx) => {
              if (lIdx > 0) {
                rawTokens.push({ isNewline: true });
              }
              line.trim().split(/\s+/).forEach(w => {
                if (w) rawTokens.push({ text: w, isTarget: false });
              });
            });
          }

          const before = remaining.slice(0, earliestMatch.idx);
          pushWordsWithNewlines(before);

          const actualTargetText = remaining.slice(earliestMatch.idx, earliestMatch.idx + earliestMatch.len);
          rawTokens.push({ text: actualTargetText, isTarget: true, targetKey: matchedTarget.toLowerCase() });
          remaining = remaining.slice(earliestMatch.idx + earliestMatch.len);
        } else {
          pushWordsWithNewlines(remaining);
          break;
        }
      }

      // Second pass: attach any orphaned trailing punctuation to previous non-target token
      const tokens = [];
      for (let i = 0; i < rawTokens.length; i++) {
        const item = rawTokens[i];
        if (item.isNewline) {
          tokens.push(item);
        } else if (/^[.,!?;:]+$/.test(item.text.trim())) {
          if (tokens.length > 0 && !tokens[tokens.length - 1].isTarget && !tokens[tokens.length - 1].isNewline) {
            tokens[tokens.length - 1].text += item.text;
          }
        } else {
          tokens.push(item);
        }
      }
      return tokens;
    }

    function toggleHighlightToken(btn) {
      playSfx('tap');
      const isSelected = btn.classList.toggle('is-highlighted');

      if (isSelected) {
        btn.classList.remove('bg-amber-50/80', 'border-amber-400', 'border-dashed');
        btn.classList.add('bg-amber-300', 'border-amber-600', 'border-b-2', 'text-amber-950', 'scale-105', 'shadow-xs');
        btn.innerHTML = `<span class="text-amber-900 font-mono text-[10px]">✨</span> <span>${btn.innerText.replace(/^✏️\s*/, '').replace(/^✨\s*/, '').replace(/^📍\s*/, '').replace(/^✅\s*/, '').trim()}</span>`;
      } else {
        btn.classList.add('bg-amber-50/80', 'border-amber-400', 'border-dashed');
        btn.classList.remove('bg-amber-300', 'border-amber-600', 'border-b-2', 'text-amber-950', 'scale-105', 'shadow-xs');
        btn.innerHTML = `<span class="text-amber-600 font-mono text-[10px]">✏️</span> <span>${btn.innerText.replace(/^✏️\s*/, '').replace(/^✨\s*/, '').replace(/^📍\s*/, '').replace(/^✅\s*/, '').trim()}</span>`;
      }

      const fb = document.getElementById('highlight-feedback');
      const completeBtn = document.getElementById('btn-complete-highlight');
      const btnNext = document.getElementById('child-btn-next-step');
      const isTarget = (btn.getAttribute('data-is-target') === 'true');
      if (!isTarget && isSelected) {
        if (fb) {
          fb.innerHTML = "💡 <strong>Milo gợi ý:</strong> Hãy chú ý vào những con số hoặc từ khóa quan trọng của bài toán nhé!";
          fb.innerText = "💡 Milo gợi ý: Hãy chú ý vào những con số hoặc từ khóa quan trọng của bài toán nhé!";
          fb.className = "text-[11px] font-bold text-center text-amber-800 bg-amber-100/70 py-1.5 px-2 rounded-xl";
        }
        if (completeBtn) {
          completeBtn.disabled = true;
          completeBtn.classList.add('opacity-50', 'cursor-not-allowed');
          completeBtn.classList.remove('animate-pulse');
        }
        if (btnNext) btnNext.disabled = true;
        return;
      }

      const container = document.getElementById('highlight-tokens-container');
      if (container) {
        const targetTokens = Array.from(container.querySelectorAll('[data-is-target="true"]'));
        const total = targetTokens.length;
        const highlightedCount = targetTokens.filter(t => t.classList.contains('is-highlighted')).length;
        const allTargetsHighlighted = total > 0 && highlightedCount === total;

        if (allTargetsHighlighted) {
          playSfx('star');
          if (fb) {
            fb.innerHTML = "🎉 <strong>Milo:</strong> Tuyệt vời! Con đã nạp đủ tất cả dữ kiện! ⭐ Bấm nút màu xanh bên dưới nhé!";
            fb.className = "text-[11px] font-bold text-center text-emerald-800 bg-emerald-100/70 py-1.5 px-2 rounded-xl";
          }
          if (completeBtn) {
            completeBtn.disabled = false;
            completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            completeBtn.classList.add('animate-pulse');
          }
          if (btnNext) {
            btnNext.disabled = false;
            btnNext.classList.remove('btn-disabled');
          }
        } else {

          if (fb) {
            fb.innerHTML = `🎯 <strong>Milo:</strong> Đã thu thập <strong>${highlightedCount} / ${total}</strong> dữ kiện mấu chốt!`;
            fb.className = "text-[11px] font-bold text-center text-teal-800 bg-teal-100/60 py-1.5 px-2 rounded-xl";
          }
          if (completeBtn) {
            completeBtn.disabled = true;
            completeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            completeBtn.classList.remove('animate-pulse');
          }
          if (btnNext) {
            btnNext.disabled = true;
            btnNext.classList.add('btn-disabled');
          }
        }
      }
    }

    function completeHighlightStep(btn) {
      const container = document.getElementById('highlight-tokens-container');
      const fb = document.getElementById('highlight-feedback');
      if (container) {
        const targetTokens = Array.from(container.querySelectorAll('[data-is-target="true"]'));
        const allTargetsHighlighted = targetTokens.length > 0 && targetTokens.every(t => t.classList.contains('is-highlighted'));

        if (!allTargetsHighlighted) {
          playSfx('tap');
          if (fb) {
            fb.innerText = "Milo gợi ý: Vẫn còn dữ kiện chưa được gạch chân, con hãy tìm thêm nhé! 🌱";
            fb.className = "text-[10px] font-bold text-center text-amber-700";
          }
          return;
        }
      }

      playSfx('star');
      if (btn) {
        btn.innerText = "✅ ĐÃ HOÀN THÀNH GẠCH CHÂN!";
        btn.className = "bg-emerald-100 text-emerald-800 font-black text-xs px-5 py-2.5 rounded-2xl w-full";
        btn.disabled = true;
      }

      const btnNext = document.getElementById('child-btn-next-step');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      }
    }

    function toggleHighlightSegment(btn) {
      toggleHighlightToken(btn);
    }

    function handleChildTextInput(val, expected) {
      if (!val) return;
      const valNorm = normalizeAnswer(val);
      const currentStep = (appState.activeTask && appState.activeTask.steps) 
        ? appState.activeTask.steps[appState.currentStepIndex] 
        : null;
      let exp = expected !== undefined && expected !== null ? expected : (currentStep && currentStep.success_criteria ? currentStep.success_criteria.expected_answer : null);
      if (exp === null || exp === undefined) return;

      let isCorrect = false;
      if (Array.isArray(exp)) {
        isCorrect = exp.some(item => normalizeAnswer(item) === valNorm || (!isNaN(parseFloat(normalizeAnswer(item))) && !isNaN(parseFloat(valNorm)) && parseFloat(normalizeAnswer(item)) === parseFloat(valNorm)));
      } else {
        const expNorm = normalizeAnswer(exp);
        isCorrect = (valNorm === expNorm) || (!isNaN(parseFloat(expNorm)) && !isNaN(parseFloat(valNorm)) && parseFloat(expNorm) === parseFloat(valNorm));
      }

      if (isCorrect) {
        playSfx('star');
        const fb = document.getElementById('text-input-feedback');
        if (fb) {
          fb.innerText = "Đúng rồi! Bé giỏi quá! ⭐";
          fb.className = "text-[10px] font-bold text-center text-emerald-700";
        }
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
      }
    }

    function handleChildTextInputSubmit(expected) {
      const input = document.getElementById('child-stage-text-input');
      if (!input) return;
      const rawVal = input.value;
      if (!rawVal || !rawVal.trim()) return;

      const valNorm = normalizeAnswer(rawVal);
      const btnNext = document.getElementById('child-btn-next-step');
      const fb = document.getElementById('text-input-feedback');

      const currentStep = (appState.activeTask && appState.activeTask.steps) 
        ? appState.activeTask.steps[appState.currentStepIndex] 
        : null;

      let exp = expected;
      if (exp === undefined || exp === null) {
        if (currentStep) {
          if (currentStep.success_criteria && currentStep.success_criteria.expected_answer !== undefined) {
            exp = currentStep.success_criteria.expected_answer;
          } else if (currentStep.expected_answer !== undefined) {
            exp = currentStep.expected_answer;
          } else if (currentStep.ui_payload && currentStep.ui_payload.expected_answer !== undefined) {
            exp = currentStep.ui_payload.expected_answer;
          } else if (currentStep.ui_data && currentStep.ui_data.expected_answer !== undefined) {
            exp = currentStep.ui_data.expected_answer;
          }
        }
      }

      let isCorrect = false;
      if (exp === null || exp === undefined) {
        // If no expected answer specified, any non-empty answer is accepted
        isCorrect = true;
      } else if (Array.isArray(exp)) {
        isCorrect = exp.some(item => {
          const itemNorm = normalizeAnswer(item);
          if (itemNorm === valNorm) return true;
          const numItem = parseFloat(itemNorm);
          const numVal = parseFloat(valNorm);
          return !isNaN(numItem) && !isNaN(numVal) && numItem === numVal;
        });
      } else {
        const expNorm = normalizeAnswer(exp);
        if (valNorm === expNorm) {
          isCorrect = true;
        } else {
          const numExp = parseFloat(expNorm);
          const numVal = parseFloat(valNorm);
          if (!isNaN(numExp) && !isNaN(numVal) && numExp === numVal) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        playSfx('star');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
        if (fb) {
          fb.innerText = "Chính xác!";
          fb.className = "hidden";
        }
      } else {
        if (btnNext) {
          btnNext.disabled = true;
          btnNext.classList.add('btn-disabled');
        }
        playSfx('tap');
        const gentleHint = (currentStep && currentStep.success_criteria && currentStep.success_criteria.feedback_on_error)
          ? currentStep.success_criteria.feedback_on_error
          : "Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱";
        if (fb) {
          fb.innerText = gentleHint;
          fb.className = "text-[10px] font-bold text-center text-amber-700";
        }
      }
    }

    function updateMultiProductTotal() {
      const inputs = document.querySelectorAll('.partial-product-input');
      if (!inputs || inputs.length === 0) return;

      let allFilled = true;
      let sum = 0;
      inputs.forEach(inp => {
        const raw = (inp.value || '').replace(/[\s\.\,]/g, '');
        if (!raw || isNaN(raw)) {
          allFilled = false;
        } else {
          sum += parseInt(raw, 10);
        }
      });

      const totalInput = document.getElementById('child-stage-text-input');
      if (totalInput) {
        if (allFilled && sum > 0) {
          totalInput.placeholder = `Tổng: ${sum.toLocaleString('vi-VN')}`;
          if (!totalInput.value) {
            totalInput.value = sum.toString();
            totalInput.dispatchEvent(new Event('input'));
          }
        }
      }
    }

    function setupDigitGridListeners(expected) {
      const cells = Array.from(document.querySelectorAll('.digit-cell'));
      if (!cells.length) return;

      const firstRowName = cells.some(c => c.dataset.row === 'part1') ? 'part1' : 'total';
      const firstRowCells = cells.filter(c => c.dataset.row === firstRowName);
      const startCell = firstRowCells[firstRowCells.length - 1];
      if (startCell) {
        startCell.focus();
        startCell.select();
      }

      cells.forEach(cell => {
        cell.addEventListener('keydown', function(e) {
          const rowName = this.dataset.row;
          const rowCells = cells.filter(c => c.dataset.row === rowName);
          const currentIndexInRow = rowCells.indexOf(this);

          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            this.value = e.key;
            syncMathGridValues(expected);

            // Tự động nhảy sang ô bên TRÁI trong cùng dòng (tính từ phải qua trái)
            if (currentIndexInRow > 0) {
              const prevCell = rowCells[currentIndexInRow - 1];
              prevCell.focus();
              prevCell.select();
            } else {
              // Nhảy sang hàng tiếp theo
              const allRows = Array.from(new Set(cells.map(c => c.dataset.row)));
              const currentRowIdx = allRows.indexOf(rowName);
              if (currentRowIdx !== -1 && currentRowIdx < allRows.length - 1) {
                const nextRowName = allRows[currentRowIdx + 1];
                const nextRowCells = cells.filter(c => c.dataset.row === nextRowName);
                if (nextRowCells.length > 0) {
                  const nextStartCell = nextRowCells[nextRowCells.length - 1];
                  nextStartCell.focus();
                  nextStartCell.select();
                }
              }
            }
          } else if (e.key === ',' || e.key === '.') {
            e.preventDefault();
            // Trong lưới số thập phân: bấm phẩy/chấm tự nhảy sang ô phần nguyên bên trái
            if (currentIndexInRow > 0) {
              const prevCell = rowCells[currentIndexInRow - 1];
              prevCell.focus();
              prevCell.select();
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            handleChildTextInputSubmit(expected);
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            if (this.value) {
              this.value = '';
              syncMathGridValues(expected);
            } else if (currentIndexInRow < rowCells.length - 1) {
              const nextCell = rowCells[currentIndexInRow + 1];
              nextCell.focus();
              nextCell.value = '';
              syncMathGridValues(expected);
            }
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentIndexInRow > 0) {
              rowCells[currentIndexInRow - 1].focus();
            }
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentIndexInRow < rowCells.length - 1) {
              rowCells[currentIndexInRow + 1].focus();
            }
          }
        });

        cell.addEventListener('input', function() {
          const val = this.value.replace(/\D/g, '');
          if (val.length > 0) {
            this.value = val.slice(-1);
            syncMathGridValues(expected);
            const rowName = this.dataset.row;
            const rowCells = cells.filter(c => c.dataset.row === rowName);
            const currentIndexInRow = rowCells.indexOf(this);
            if (currentIndexInRow > 0) {
              const prevCell = rowCells[currentIndexInRow - 1];
              prevCell.focus();
              prevCell.select();
            }
          }
        });

        cell.addEventListener('focus', function() {
          this.select();
        });

        cell.addEventListener('paste', function(e) {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
          if (!text) return;
          const rowName = this.dataset.row;
          const rowCells = cells.filter(c => c.dataset.row === rowName);
          const digits = text.split('');
          const startIndex = Math.max(0, rowCells.length - digits.length);
          digits.forEach((d, i) => {
            if (startIndex + i < rowCells.length) {
              rowCells[startIndex + i].value = d;
            }
          });
          syncMathGridValues(expected);
        });
      });
    }

    function syncMathGridValues(expected) {
      const grid = document.querySelector('[data-math-grid="true"]');
      if (grid) {
        const resDecLen = parseInt(grid.dataset.resDecLen || '0', 10);
        const totalCells = Array.from(grid.querySelectorAll('.digit-cell[data-row="total"]'));
        if (!totalCells.length) return;

        let fullVal = '';
        if (resDecLen > 0) {
          let intPart = '';
          let decPart = '';
          // totalCells được duyệt theo thứ tự DOM (từ trái qua phải, data-col từ lớn xuống 0)
          totalCells.forEach(cell => {
            const col = parseInt(cell.dataset.col, 10);
            if (col >= resDecLen) {
              intPart += (cell.value || '');
            } else {
              decPart += (cell.value || '');
            }
          });
          fullVal = `${intPart || '0'},${decPart}`;
        } else {
          fullVal = totalCells.map(c => c.value || '').join('').trim();
        }

        const hiddenInput = document.getElementById('child-stage-text-input');
        if (hiddenInput) {
          hiddenInput.value = fullVal;
        }

        const allFilled = totalCells.every(c => (c.value || '').trim() !== '');
        if (allFilled) {
          handleChildTextInput(fullVal, expected);
        }
        return;
      }

      // Fallback cho lưới cũ
      const totalCells = Array.from(document.querySelectorAll('.digit-cell[data-row="total"]'));
      if (!totalCells.length) return;

      const totalStr = totalCells.map(c => c.value || '').join('').trim();
      const hiddenInput = document.getElementById('child-stage-text-input');
      if (hiddenInput) {
        hiddenInput.value = totalStr;
      }

      if (totalStr) {
        handleChildTextInput(totalStr, expected);
      }
    }

    function completeGenericStep(btn) {
      playSfx('star');
      btn.innerText = "✅ ĐÃ HOÀN THÀNH BƯỚC!";
      btn.className = "bg-emerald-100 text-emerald-800 font-black text-xs px-5 py-3 rounded-2xl";
      btn.disabled = true;

      const btnNext = document.getElementById('child-btn-next-step');
      btnNext.disabled = false;
      btnNext.classList.remove('btn-disabled');
    }

    // Chores: Dọn bàn
    function pickChoreItem(btn, itemId) {
      playSfx('tap');
      if (appState.cleanedItems.has(itemId)) return;
      appState.cleanedItems.add(itemId);
      btn.classList.add('opacity-30', 'pointer-events-none', 'scale-90');
      btn.innerHTML = `<span>✅</span><span class="text-[9px] font-bold text-emerald-600 mt-0.5">Đã cất</span>`;
      
      const count = appState.cleanedItems.size;
      document.getElementById('pen-counter').innerText = `${count}/3 cây bút`;
      
      if (count === 3) {
        playSfx('star');
        document.getElementById('pen-box-status').innerText = "Tuyệt vời! 3 cây bút đã về ống 🏺✨";
        const btnNext = document.getElementById('child-btn-next-step');
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      }
    }

    function pickTrash(btn) {
      playSfx('star');
      btn.innerText = "✅ ĐÃ GOM SẠCH VÀO THÙNG RÁC!";
      btn.className = "bg-emerald-100 text-emerald-800 font-black text-xs px-5 py-3 rounded-2xl";
      btn.disabled = true;
      document.getElementById('trash-items').innerHTML = `<span class="text-4xl">✨🗑️</span>`;

      const btnNext = document.getElementById('child-btn-next-step');
      btnNext.disabled = false;
      btnNext.classList.remove('btn-disabled');
    }

    function tidyBooks(btn) {
      playSfx('star');
      btn.innerText = "✅ SÁCH ĐÃ THẲNG HÀNG!";
      btn.className = "bg-emerald-100 text-emerald-800 font-black text-xs px-5 py-3 rounded-2xl";
      btn.disabled = true;
      document.getElementById('books-scattered').innerHTML = `<span class="text-4xl">📐📚✨</span>`;

      const btnNext = document.getElementById('child-btn-next-step');
      btnNext.disabled = false;
      btnNext.classList.remove('btn-disabled');
    }

    function cleanDesk(btn) {
      playSfx('star');
      const desk = document.getElementById('desk-surface');
      desk.innerHTML = "✨";
      desk.className = "w-20 h-20 rounded-3xl bg-sky-200 border-2 border-sky-400 flex items-center justify-center text-4xl shadow-md";
      document.getElementById('desk-status').innerText = "Mặt bàn đã sạch bóng lấp lánh rồi! 🌟";
      btn.innerText = "✅ BÀN HỌC SÁNG BÓNG!";
      btn.className = "bg-sky-100 text-sky-800 font-black text-xs px-5 py-3 rounded-2xl";
      btn.disabled = true;

      const btnNext = document.getElementById('child-btn-next-step');
      btnNext.disabled = false;
      btnNext.classList.remove('btn-disabled');
    }

    // Math: Clues, Formula, Numpad
    function toggleMathClue(btn, clueId) {
      playSfx('tap');
      if (appState.selectedClues.has(clueId)) {
        appState.selectedClues.delete(clueId);
        btn.className = "math-clue btn-3d-white px-3 py-1.5 rounded-xl font-black text-base text-slate-800";
      } else {
        appState.selectedClues.add(clueId);
        btn.className = "math-clue bg-amber-200 border-2 border-amber-400 px-3 py-1.5 rounded-xl font-black text-base text-amber-950 shadow-inner";
      }

      const btnNext = document.getElementById('child-btn-next-step');
      if (appState.selectedClues.size === 2) {
        playSfx('star');
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      } else {
        btnNext.disabled = true;
        btnNext.classList.add('btn-disabled');
      }
    }

    function alertWrongClue(btn) {
      playSfx('tap');
      showToast("Chi Tiết Gây Nhiễu", "Đây là chi tiết không liên quan đến bài toán tính diện tích!", "💡");
    }

    function selectMathOp(btn, isCorrect) {
      playSfx('tap');
      if (isCorrect) {
        playSfx('star');
        btn.className = "math-op bg-emerald-100 border-2 border-emerald-400 py-3 rounded-2xl font-black text-xl text-emerald-950 flex items-center justify-center gap-3";
        const btnNext = document.getElementById('child-btn-next-step');
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      } else {
        toggleSoftPause(true);
      }
    }

    function pressChildNum(val) {
      playSfx('tap');
      if (val === 'DEL') {
        appState.numpadValue = appState.numpadValue.slice(0, -1);
      } else if (appState.numpadValue.length < 3) {
        appState.numpadValue += val;
      }
      document.getElementById('child-numpad-screen').innerText = appState.numpadValue || "?";
      
      const btnNext = document.getElementById('child-btn-next-step');
      if (appState.numpadValue === "60") {
        playSfx('star');
        btnNext.disabled = false;
        btnNext.classList.remove('btn-disabled');
      } else {
        btnNext.disabled = true;
        btnNext.classList.add('btn-disabled');
      }
    }




    /* ============================================================
       MODULE: PROGRESSIVE 2-PHASE WORD PROBLEM CALCULATION
       ============================================================ */
    function renderProgressiveCalculationStage(stage, stepData, task) {
      const ui = stepData.ui_payload || stepData.ui_data || {};
      const phases = ui.progressive_phases || [];
      if (!phases.length) return;

      stepData._curPhase = stepData._curPhase || 1;
      const curPhaseIdx = stepData._curPhase - 1;
      const currentPhase = phases[curPhaseIdx] || phases[0];
      const isFinalPhase = stepData._curPhase > phases.length;

      let phasesListHtml = '';
      phases.forEach((p, pIdx) => {
        const isDone = (stepData._curPhase > pIdx + 1);
        const isCurrent = (stepData._curPhase === pIdx + 1);
        if (isDone) {
          phasesListHtml += `
            <div class="space-y-0.5">
              <p class="text-xs font-bold text-slate-600">${p.lead_text}</p>
              <div class="flex items-center gap-2 text-base font-mono font-black text-emerald-700">
                <span>${p.expression}</span>
                <span class="px-2.5 py-0.5 rounded-lg border-2 bg-emerald-100 border-emerald-400 text-emerald-900 min-w-[50px] text-center">
                  ${p.expected_answer} ✓
                </span>
                ${p.unit ? `<span class="text-xs font-sans text-slate-500 font-bold">(${p.unit})</span>` : ''}
              </div>
            </div>
          `;
        } else if (isCurrent) {
          phasesListHtml += `
            <div class="space-y-0.5 slide-in-down">
              <p class="text-xs font-bold text-slate-700">${p.lead_text}</p>
              <div class="flex items-center gap-2 text-base font-mono font-black text-slate-800">
                <span>${p.expression}</span>
                <span class="px-2.5 py-0.5 rounded-lg border-2 bg-amber-100 border-amber-400 text-amber-900 min-w-[50px] text-center animate-pulse">
                  ?
                </span>
                ${p.unit ? `<span class="text-xs font-sans text-slate-500 font-bold">(${p.unit})</span>` : ''}
              </div>
            </div>
          `;
        }
      });

      let calcHtml = '';
      if (!isFinalPhase && currentPhase && currentPhase.calc) {
        calcHtml = renderFxCalcGrid(
          currentPhase.calc.top,
          currentPhase.calc.op,
          currentPhase.calc.bot,
          currentPhase.calc.expected,
          () => {
            stepData._curPhase++;
            if (stepData._curPhase > phases.length) {
              if (typeof playSfx === 'function') playSfx('star');
              const btnNext = document.getElementById('child-btn-next-step');
              if (btnNext) {
                btnNext.disabled = false;
                btnNext.classList.remove('btn-disabled');
                btnNext.classList.add('animate-bounce');
              }
            } else {
              if (typeof playSfx === 'function') playSfx('correct');
            }
            renderChildWorkspaceStep();
          },
          "Đặt tính:"
        );
      }

      stage.innerHTML = `
        <div class="flex flex-col gap-2.5 my-auto w-full">
          <div class="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-2xl p-3.5 shadow-sm space-y-3">
            ${phasesListHtml}
          </div>
          <div class="my-auto">
            ${calcHtml}
          </div>
        </div>
      `;

      if (isFinalPhase) {
        const btnNext = document.getElementById('child-btn-next-step');
        if (btnNext) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
        }
      }
    }


if (typeof window !== 'undefined') {
  window.childSwitchScreen = childSwitchScreen;
  window.exitChildWorkspace = exitChildWorkspace;
  window.renderChildWorkspaceStep = renderChildWorkspaceStep;
  window.renderProgressiveCalculationStage = renderProgressiveCalculationStage;

  window.handleChildChoice = handleChildChoice;
  window.handleHouseWindowClick = handleHouseWindowClick;
  window.handleHouseWindowWrongClick = handleHouseWindowWrongClick;
  window.toggleHighlightToken = toggleHighlightToken;
  window.handleChildTextInput = typeof handleChildTextInput !== 'undefined' ? handleChildTextInput : null;
  window.handleChildTextInputSubmit = typeof handleChildTextInputSubmit !== 'undefined' ? handleChildTextInputSubmit : null;
  window.completeChildStep = typeof completeChildStep !== 'undefined' ? completeChildStep : null;
  window.pressChildNum = pressChildNum;
  window.selectMathOp = selectMathOp;
  window.toggleMathClue = typeof toggleMathClue !== 'undefined' ? toggleMathClue : null;
  window.alertWrongClue = typeof alertWrongClue !== 'undefined' ? alertWrongClue : null;
  window.cleanDesk = typeof cleanDesk !== 'undefined' ? cleanDesk : null;
  window.tidyBooks = typeof tidyBooks !== 'undefined' ? tidyBooks : null;
  window.pickTrash = typeof pickTrash !== 'undefined' ? pickTrash : null;
  window.pickChoreItem = typeof pickChoreItem !== 'undefined' ? pickChoreItem : null;
}


    /* ============================================================
       MODULE: MULTI-ITEM ARITHMETIC & PROGRESSIVE FIND X RENDERERS
       ============================================================ */
    var multiTaskState = {
      curStage: 1,
      tempOp: '',
      tempNum: ''
    };

    function resetMultiTaskState() {
      multiTaskState.curStage = 1;
      multiTaskState.tempOp = '';
      multiTaskState.tempNum = '';
    }

    // --- 1. RENDERER CHO DẠNG ĐẶT TÍNH RỒI TÍNH NHIỀU Ý (multi_item_arithmetic) ---
    function renderMultiItemArithmeticStage(task, stepIdx) {
      const items = task.items || [];
      const item = items[stepIdx] || items[0] || {};
      const topStr = String(item.top || '0');
      const op = item.op || '+';
      const botStr = String(item.bot || '0');
      const expectedStr = String(item.expected_answer || '');

      const badgeEl = document.getElementById('child-step-badge');
      if (badgeEl) {
        badgeEl.innerText = `${item.label || ('Ý ' + (stepIdx + 1))} • ${task.header_title || 'Đặt tính rồi tính'}`;
        badgeEl.className = "bg-teal-100 text-teal-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase";
      }
      const titleEl = document.getElementById('child-instruction-text');
      if (titleEl) {
        titleEl.innerHTML = `Đặt tính và tính: <span class="text-teal-700 font-mono">${topStr} ${op} ${botStr}</span>`;
      }

      const numCols = Math.max(topStr.length, botStr.length, expectedStr.length) + 1;
      const cellCls = "w-7 h-8 text-base font-mono font-black text-center";

      let rowTop = '';
      for (let i = numCols - 1; i >= 0; i--) {
        const ch = topStr[topStr.length - 1 - i] || '';
        rowTop += `<div class="${cellCls} flex items-center justify-center text-slate-800">${ch}</div>`;
      }

      let rowBot = '';
      for (let i = numCols - 1; i >= 0; i--) {
        const ch = botStr[botStr.length - 1 - i] || '';
        rowBot += `<div class="${cellCls} flex items-center justify-center text-slate-800">${ch}</div>`;
      }

      let rowInputs = '';
      for (let i = numCols - 1; i >= 0; i--) {
        if (i < expectedStr.length) {
          rowInputs += `
            <input type="text" maxlength="1" inputmode="numeric" 
                   data-col="${i}" 
                   class="multi-digit-cell ${cellCls} rounded-lg border-2 border-teal-500 bg-teal-50 text-slate-900 focus:bg-teal-100 focus:border-teal-600 focus:outline-none shadow-xs transition" />
          `;
        } else {
          rowInputs += `<div class="${cellCls}"></div>`;
        }
      }

      setTimeout(() => {
        setupMultiRightToLeftListeners(expectedStr, () => {
          const btnNext = document.getElementById('child-btn-next-step');
          if (btnNext) {
            btnNext.disabled = false;
            btnNext.classList.remove('btn-disabled');
            btnNext.classList.add('animate-bounce');
          }
        });
      }, 50);

      return `
        <div class="bg-white p-3.5 rounded-2xl border-2 border-teal-200 shadow-sm flex flex-col items-center justify-center my-1 select-none w-full max-w-[300px] mx-auto">
          <div class="inline-flex flex-col items-end">
            <div class="flex items-center justify-end gap-1.5">${rowTop}</div>
            <div class="flex items-center justify-end relative w-full gap-1.5 my-0.5">
              <span class="absolute left-0 text-teal-600 font-mono font-black text-lg select-none pl-1">${op}</span>
              <div class="flex items-center justify-end gap-1.5">${rowBot}</div>
            </div>
            <div class="w-full h-[2.5px] bg-slate-800 my-1 rounded-full"></div>
            <div class="flex items-center justify-end gap-1.5 pt-0.5">
              ${rowInputs}
            </div>
          </div>
          <span class="text-[10px] font-bold text-teal-700 mt-2 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            👉 Điền từ phải sang trái (đơn vị ➔ chục ➔ trăm)
          </span>
        </div>
      `;
    }

    // --- 2. RENDERER CHO DẠNG TÌM X LŨY TIẾN (multi_item_find_x) ---
    function renderMultiItemFindXStage(task, stepIdx) {
      const items = task.items || [];
      const item = items[stepIdx] || items[0] || {};
      const subType = item.sub_type || 'single_op';

      const badgeEl = document.getElementById('child-step-badge');
      if (badgeEl) {
        badgeEl.innerText = `${item.label || ('Câu ' + (stepIdx + 1))} • ${task.header_title || 'Tìm x'}`;
        badgeEl.className = "bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase";
      }
      const titleEl = document.getElementById('child-instruction-text');
      if (titleEl) {
        titleEl.innerHTML = `Giải tìm x: <span class="text-amber-800 font-mono font-black">${item.equation || ''}</span>`;
      }

      let notebookHtml = '';
      let calcWindowHtml = '';
      let isCompleted = false;

      // TYPE A: SINGLE OP (x + 354 = 820)
      if (subType === 'single_op') {
        notebookHtml = `
          <div class="flex items-center text-slate-800 text-lg pl-1">${item.equation}</div>
          <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1">
            ${multiTaskState.curStage === 1 ? `
              <span class="text-teal-700">${item.left_lead || 'x = '}</span>
              <select onchange="onFxSingleOpChange(this.value)" class="w-8 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none appearance-none cursor-pointer shadow-2xs shrink-0">
                <option value="">?</option>
                <option value="+" ${multiTaskState.tempOp === '+' ? 'selected' : ''}>+</option>
                <option value="-" ${multiTaskState.tempOp === '-' ? 'selected' : ''}>-</option>
                <option value="×" ${multiTaskState.tempOp === '×' ? 'selected' : ''}>×</option>
                <option value=":" ${multiTaskState.tempOp === ':' ? 'selected' : ''}>:</option>
              </select>
              <input type="text" value="${multiTaskState.tempNum}" oninput="onFxSingleNumChange(this.value)" placeholder="số?" class="w-16 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none placeholder:text-slate-400 placeholder:text-xs shadow-2xs shrink-0" />
            ` : `
              <span class="text-emerald-700 slide-in-down flex items-center gap-1.5">
                ${item.formatted_line2}
                <span class="text-xs text-emerald-600 font-sans">✓</span>
              </span>
            `}
          </div>
          ${multiTaskState.curStage === 3 ? `
            <div class="flex items-center gap-2 text-lg text-emerald-800 slide-in-down pl-1">
              <span class="text-emerald-900 font-black">${item.formatted_final}</span>
              <span class="text-sm">🎉</span>
            </div>
          ` : ''}
        `;

        if (multiTaskState.curStage === 2) {
          calcWindowHtml = `
            <div class="mt-3 pt-2 border-t-2 border-dashed border-teal-200 slide-in-down">
              ${renderFxCalcGrid(item.calc_top, item.calc_op, item.calc_bot, item.expected_x, () => {
                multiTaskState.curStage = 3;
                triggerFxReRender();
              }, "Đặt tính tìm x:")}
            </div>
          `;
        }
        isCompleted = (multiTaskState.curStage === 3);

      // TYPE B: RHS EXPR (x + 125 = 450 - 150)
      } else if (subType === 'rhs_expr') {
        notebookHtml = `
          <div class="flex items-center text-slate-800 text-lg pl-1">${item.equation}</div>
          ${multiTaskState.curStage >= 2 ? `
            <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1 slide-in-down">
              <span class="text-emerald-700 flex items-center gap-1.5">
                ${item.step1_formatted}
                <span class="text-xs text-emerald-600 font-sans">✓</span>
              </span>
            </div>
          ` : ''}
          ${multiTaskState.curStage >= 2 ? `
            <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1">
              ${multiTaskState.curStage === 2 ? `
                <span class="text-teal-700">${item.step2_lead || 'x = '}</span>
                <select onchange="onFxRhsOpChange(this.value)" class="w-8 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none appearance-none cursor-pointer shadow-2xs shrink-0">
                  <option value="">?</option>
                  <option value="+" ${multiTaskState.tempOp === '+' ? 'selected' : ''}>+</option>
                  <option value="-" ${multiTaskState.tempOp === '-' ? 'selected' : ''}>-</option>
                  <option value="×" ${multiTaskState.tempOp === '×' ? 'selected' : ''}>×</option>
                  <option value=":" ${multiTaskState.tempOp === ':' ? 'selected' : ''}>:</option>
                </select>
                <input type="text" value="${multiTaskState.tempNum}" oninput="onFxRhsNumChange(this.value)" placeholder="số?" class="w-16 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none placeholder:text-slate-400 placeholder:text-xs shadow-2xs shrink-0" />
              ` : `
                <span class="text-emerald-700 slide-in-down flex items-center gap-1.5">
                  ${item.step2_formatted}
                  <span class="text-xs text-emerald-600 font-sans">✓</span>
                </span>
              `}
            </div>
          ` : ''}
          ${multiTaskState.curStage === 4 ? `
            <div class="flex items-center gap-2 text-lg text-emerald-800 slide-in-down pl-1">
              <span class="text-emerald-900 font-black">${item.formatted_final}</span>
              <span class="text-sm">🎉</span>
            </div>
          ` : ''}
        `;

        if (multiTaskState.curStage === 1) {
          calcWindowHtml = `
            <div class="mt-3 pt-2 border-t-2 border-dashed border-amber-300 slide-in-down">
              <div class="text-xs font-black text-amber-800 mb-1">⚡ Bước 1: Đặt tính thu gọn vế phải</div>
              ${renderFxCalcGrid(item.rhs_calc.top, item.rhs_calc.op, item.rhs_calc.bot, item.rhs_calc.expected, () => {
                multiTaskState.curStage = 2;
                multiTaskState.tempOp = '';
                multiTaskState.tempNum = '';
                triggerFxReRender();
              }, "Tính vế phải:")}
            </div>
          `;
        } else if (multiTaskState.curStage === 3) {
          calcWindowHtml = `
            <div class="mt-3 pt-2 border-t-2 border-dashed border-teal-200 slide-in-down">
              <div class="text-xs font-black text-teal-800 mb-1">⚡ Bước 2: Đặt tính tìm x</div>
              ${renderFxCalcGrid(item.final_calc.top, item.final_calc.op, item.final_calc.bot, item.final_calc.expected, () => {
                multiTaskState.curStage = 4;
                triggerFxReRender();
              }, "Tính kết quả x:")}
            </div>
          `;
        }
        isCompleted = (multiTaskState.curStage === 4);

      // TYPE C & D: TWO TIER & PAREN EXPR
      } else {
        notebookHtml = `
          <div class="flex items-center text-slate-800 text-lg pl-1">${item.equation}</div>
          <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1">
            ${multiTaskState.curStage === 1 ? `
              <span class="text-teal-700">${item.tier1_lead || item.step1_lead || ''}</span>
              <select onchange="onFxGenericOpChange(this.value)" class="w-8 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none appearance-none cursor-pointer shadow-2xs shrink-0">
                <option value="">?</option>
                <option value="+" ${multiTaskState.tempOp === '+' ? 'selected' : ''}>+</option>
                <option value="-" ${multiTaskState.tempOp === '-' ? 'selected' : ''}>-</option>
                <option value="×" ${multiTaskState.tempOp === '×' ? 'selected' : ''}>×</option>
                <option value=":" ${multiTaskState.tempOp === ':' ? 'selected' : ''}>:</option>
              </select>
              <input type="text" value="${multiTaskState.tempNum}" oninput="onFxGenericNumChange(this.value)" placeholder="số?" class="w-16 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none placeholder:text-slate-400 placeholder:text-xs shadow-2xs shrink-0" />
            ` : `
              <span class="text-emerald-700 slide-in-down flex items-center gap-1.5">
                ${item.tier1_formatted || item.step1_formatted || ''}
                <span class="text-xs text-emerald-600 font-sans">✓</span>
              </span>
            `}
          </div>
          ${multiTaskState.curStage >= 3 ? `
            <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1 slide-in-down">
              <span class="text-emerald-700 flex items-center gap-1.5">
                ${item.tier1_res_formatted || item.step1_res_formatted || ''}
                <span class="text-xs text-emerald-600 font-sans">✓</span>
              </span>
            </div>
          ` : ''}
          ${multiTaskState.curStage >= 3 ? `
            <div class="flex items-center gap-1.5 whitespace-nowrap text-base sm:text-lg pl-1">
              ${multiTaskState.curStage === 3 ? `
                <span class="text-teal-700">${item.tier2_lead || item.step2_lead || 'x = '}</span>
                <select onchange="onFxGenericTier2OpChange(this.value)" class="w-8 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none appearance-none cursor-pointer shadow-2xs shrink-0">
                  <option value="">?</option>
                  <option value="+" ${multiTaskState.tempOp === '+' ? 'selected' : ''}>+</option>
                  <option value="-" ${multiTaskState.tempOp === '-' ? 'selected' : ''}>-</option>
                  <option value="×" ${multiTaskState.tempOp === '×' ? 'selected' : ''}>×</option>
                  <option value=":" ${multiTaskState.tempOp === ':' ? 'selected' : ''}>:</option>
                </select>
                <input type="text" value="${multiTaskState.tempNum}" oninput="onFxGenericTier2NumChange(this.value)" placeholder="số?" class="w-16 h-8 text-center bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg font-mono text-sm font-black focus:outline-none placeholder:text-slate-400 placeholder:text-xs shadow-2xs shrink-0" />
              ` : `
                <span class="text-emerald-700 slide-in-down flex items-center gap-1.5">
                  ${item.tier2_formatted || item.step2_formatted || ''}
                  <span class="text-xs text-emerald-600 font-sans">✓</span>
                </span>
              `}
            </div>
          ` : ''}
          ${multiTaskState.curStage === 5 ? `
            <div class="flex items-center gap-2 text-lg text-emerald-800 slide-in-down pl-1">
              <span class="text-emerald-900 font-black">${item.formatted_final}</span>
              <span class="text-sm">🎉</span>
            </div>
          ` : ''}
        `;

        const calc1 = item.tier1_calc || item.step1_calc;
        const calc2 = item.final_calc;
        if (multiTaskState.curStage === 2 && calc1) {
          calcWindowHtml = `
            <div class="mt-3 pt-2 border-t-2 border-dashed border-amber-300 slide-in-down">
              ${renderFxCalcGrid(calc1.top, calc1.op, calc1.bot, calc1.expected, () => {
                multiTaskState.curStage = 3;
                multiTaskState.tempOp = '';
                multiTaskState.tempNum = '';
                triggerFxReRender();
              }, "Đặt tính cụm:")}
            </div>
          `;
        } else if (multiTaskState.curStage === 4 && calc2) {
          calcWindowHtml = `
            <div class="mt-3 pt-2 border-t-2 border-dashed border-teal-200 slide-in-down">
              ${renderFxCalcGrid(calc2.top, calc2.op, calc2.bot, calc2.expected, () => {
                multiTaskState.curStage = 5;
                triggerFxReRender();
              }, "Đặt tính tìm x:")}
            </div>
          `;
        }
        isCompleted = (multiTaskState.curStage === 5);
      }

      const btnNext = document.getElementById('child-btn-next-step');
      if (btnNext) {
        if (isCompleted) {
          btnNext.disabled = false;
          btnNext.classList.remove('btn-disabled');
          btnNext.classList.add('animate-bounce');
        } else {
          btnNext.disabled = true;
          btnNext.classList.add('btn-disabled');
          btnNext.classList.remove('animate-bounce');
        }
      }

      return `
        <div class="bg-white border-2 border-amber-300 rounded-[24px] p-3 shadow-xs flex flex-col justify-between min-h-[360px] relative w-full">
          <div>
            <div class="notebook-paper p-3 rounded-2xl border border-slate-200 font-mono text-base font-black text-slate-900 space-y-1.5 shadow-inner">
              ${notebookHtml}
            </div>
            ${calcWindowHtml}
            ${isCompleted ? `
              <div class="mt-2.5 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl flex items-center gap-2 slide-in-down">
                <span class="text-xl">👑</span>
                <span class="text-[11px] font-black text-emerald-950">Bài giải trình bày 3-5 dòng chuẩn SGK!</span>
              </div>
            ` : ''}
          </div>
          <div class="bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center gap-2 mt-2">
            <span class="text-base">🤖</span>
            <p class="text-[10px] font-bold text-amber-900 leading-tight">
              ${isCompleted ? 'Milo: Tuyệt vời! Bấm XONG BƯỚC NÀY để nhận sao nhé!' : 'Milo: Đặt tính xong là dòng tiếp theo sẽ tự động in ra ngay!'}
            </p>
          </div>
        </div>
      `;
    }

    // --- CÁC HÀM TIỆN ÍCH CHO TÌM X RENDERER ---
    function triggerFxReRender() {
      const task = appState.activeTask;
      const stepIdx = appState.currentStepIndex || 0;
      const stage = document.getElementById('child-interactive-stage');
      if (stage && task) {
        stage.innerHTML = renderMultiItemFindXStage(task, stepIdx);
      }
    }

    function decomposeLongDivisionEngine(dividend, divisor) {
      const dStr = String(dividend);
      const N = dStr.length;
      const rounds = [];
      
      let cursor = 0;
      let partStr = dStr[cursor];
      cursor++;
      while (Number(partStr) < divisor && cursor < dStr.length) {
        partStr += dStr[cursor];
        cursor++;
      }

      let currentEndCol = cursor - 1;
      let currentPart = Number(partStr);

      while (true) {
        const qDigit = Math.floor(currentPart / divisor);
        const prod = qDigit * divisor;
        const rem = currentPart - prod;
        const prodStr = String(prod);
        const prodStartCol = currentEndCol - prodStr.length + 1;
        const prodEndCol = currentEndCol;
        const remStr = String(rem);
        const remStartCol = currentEndCol - remStr.length + 1;
        const remEndCol = currentEndCol;
        
        let bringDown = null;
        let bringDownCol = null;
        if (cursor < dStr.length) {
          bringDown = dStr[cursor];
          bringDownCol = cursor;
          cursor++;
        }

        const clue = `${divisor} × ${qDigit} = ${prod}` + 
          (currentPart > prod ? ` (dư ${rem}, gần ${currentPart} nhất)` : ` (vừa hết)`);

        rounds.push({
          roundNum: rounds.length + 1,
          currentPart: currentPart,
          quotientDigit: qDigit,
          product: prod,
          prodStr: prodStr,
          prodStartCol: prodStartCol,
          prodEndCol: prodEndCol,
          remainder: rem,
          remStr: remStr,
          remStartCol: remStartCol,
          remEndCol: remEndCol,
          bringDownDigit: bringDown,
          bringDownCol: bringDownCol,
          clue: clue
        });

        if (bringDown === null) {
          break;
        }

        currentPart = rem * 10 + Number(bringDown);
        currentEndCol = bringDownCol;
      }

      return {
        dividend: dividend,
        divisor: divisor,
        dStr: dStr,
        numCols: N,
        quotient: Math.floor(dividend / divisor),
        finalRemainder: dividend % divisor,
        rounds: rounds
      };
    }

    // State quản lý phép chia đặt tính trực quan toàn cục
    window._fxDivState = {
      activeKey: '',
      task: null,
      roundIdx: 0,
      subStage: 0, // 0 = nhập thương, 1 = nhập số dư, 1.5 = tự động hạ số, 3 = xong
      inputBuffer: '',
      onDone: null
    };

    window.handleFxDivInput = function(val) {
      const s = window._fxDivState;
      if (!s || !s.task || s.subStage === 1.5 || s.subStage === 3) return;

      const curRound = s.task.rounds[s.roundIdx];
      if (!curRound) return;

      if (val === 'DEL') {
        s.inputBuffer = s.inputBuffer.slice(0, -1);
        if (typeof playSfx === 'function') playSfx('tap');
        updateFxDivDom();
        return;
      }

      if (typeof playSfx === 'function') playSfx('tap');

      // 1. Nhập chữ số thương
      if (s.subStage === 0) {
        s.inputBuffer = val;
        updateFxDivDom();

        if (parseInt(s.inputBuffer, 10) === curRound.quotientDigit) {
          if (typeof playSfx === 'function') playSfx('pop');
          setTimeout(() => {
            s.subStage = 1; // Chuyển sang tính phép trừ (tìm số dư)
            s.inputBuffer = '';
            updateFxDivDom();
          }, 250);
        } else {
          flashFxDivError();
        }
      }
      // 2. Nhập số dư (tính phép trừ)
      else if (s.subStage === 1) {
        const expectedRemStr = String(curRound.remainder);
        s.inputBuffer += val;
        if (s.inputBuffer.length > expectedRemStr.length) {
          s.inputBuffer = val;
        }
        updateFxDivDom();

        if (s.inputBuffer === expectedRemStr) {
          if (typeof playSfx === 'function') playSfx('pop');

          if (curRound.bringDownDigit !== null) {
            // Tự động hạ số sinh động
            s.inputBuffer = '';
            s.subStage = 1.5;
            updateFxDivDom();

            setTimeout(() => {
              if (typeof playSfx === 'function') playSfx('drop');
              s.roundIdx++;
              s.subStage = 0; // Chuyển sang lần chia tiếp theo
              s.inputBuffer = '';
              updateFxDivDom();
            }, 400);

          } else {
            // Hoàn thành toàn bộ phép chia
            s.subStage = 3;
            s.inputBuffer = '';
            if (typeof playSfx === 'function') playSfx('correct');
            updateFxDivDom();

            setTimeout(() => {
              if (typeof s.onDone === 'function') s.onDone();
              else if (typeof s.onDone === 'string' && typeof window[s.onDone] === 'function') {
                window[s.onDone](String(s.task.quotient));
              }
            }, 300);
          }
        } else if (s.inputBuffer.length === expectedRemStr.length) {
          flashFxDivError();
        }
      }
    };

    function flashFxDivError() {
      const activeCell = document.getElementById('fx-active-div-cell');
      if (activeCell) {
        activeCell.classList.add('bg-rose-100', 'border-rose-500', 'animate-shake');
        setTimeout(() => {
          activeCell.classList.remove('bg-rose-100', 'border-rose-500', 'animate-shake');
          window._fxDivState.inputBuffer = '';
          updateFxDivDom();
        }, 500);
      }
    }

    function updateFxDivDom() {
      const container = document.getElementById('fx-long-division-container');
      if (!container || !window._fxDivState.task) return;
      container.innerHTML = buildFxLongDivisionHTML();
    }

    function buildFxLongDivisionHTML() {
      const s = window._fxDivState;
      const t = s.task;
      const curRound = t.rounds[s.roundIdx] || t.rounds[t.rounds.length - 1];
      const isCompleted = (s.subStage === 3);
      const N = t.numCols;

      const cellCls = "w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg font-mono font-black flex items-center justify-center shrink-0";
      const signCls = "w-4 h-7 sm:w-5 sm:h-8 text-sm sm:text-base font-mono font-bold flex items-center justify-end text-slate-400 shrink-0 select-none pr-0.5";

      // 1. CỘT TRÁI: SỐ BỊ CHIA & CÁC LẦN TRỪ (THU GỌN CÁC Ý ĐÃ LÀM ĐỂ TỐI ƯU DÒNG CHO ĐIỆN THOẠI)
      let leftRowsHtml = `
        <div class="flex items-center">
          <div class="${signCls}"></div>
          <div class="flex items-center">
            ${[...t.dStr].map(ch => `
              <div class="${cellCls} text-slate-900 font-black text-lg sm:text-xl">${ch}</div>
            `).join('')}
          </div>
        </div>
      `;

      for (let i = 0; i <= s.roundIdx; i++) {
        const r = t.rounds[i];
        const isCurrentRound = (i === s.roundIdx);

        if (!isCurrentRound) {
          // LẦN CHIA ĐÃ LÀM XONG: TIẾT KIỆM DÒNG TỐI ĐA CHO ĐIỆN THOẠI (chỉ giữ dòng Số dư + Chữ số hạ)
          leftRowsHtml += `
            <div class="flex items-center py-0.5">
              <div class="${signCls}"></div>
              <div class="flex items-center font-black">
                ${Array.from({length: N}).map((_, col) => {
                  if (col >= r.remStartCol && col <= r.remEndCol) {
                    const ch = r.remStr[col - r.remStartCol];
                    return `<div class="${cellCls} text-slate-900 font-black">${ch}</div>`;
                  }
                  if (col === r.bringDownCol) {
                    return `<div class="${cellCls} text-teal-600 font-black">${r.bringDownDigit}</div>`;
                  }
                  return `<div class="${cellCls}"></div>`;
                }).join('')}
              </div>
            </div>
          `;
        } else {
          // LẦN CHIA HIỆN TẠI ĐANG LÀM
          if (s.subStage === 0) {
            // Đang điền thương
          } else if (s.subStage === 1) {
            // Đang điền số dư: Hiện phép trừ và ô input số dư
            leftRowsHtml += `
              <div class="flex items-center slide-in-down">
                <div class="${signCls}">-</div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      const ch = r.prodStr[col - r.prodStartCol];
                      return `<div class="${cellCls} text-slate-500 font-bold">${ch}</div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center my-0.5">
                <div class="${signCls}"></div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      return `<div class="${cellCls} flex items-center justify-center"><div class="w-full h-[2px] bg-amber-400 rounded-full"></div></div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center">
                <div class="${signCls}"></div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.remStartCol && col <= r.remEndCol) {
                      return `
                        <div id="fx-active-div-cell" class="${cellCls} bg-amber-100 border-2 border-amber-500 rounded-lg text-amber-950 font-black animate-pulse shadow-xs">
                          ${s.inputBuffer || '?'}
                        </div>
                      `;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
            `;
          } else if (s.subStage === 1.5) {
            // Tự động hạ số rơi xuống
            leftRowsHtml += `
              <div class="flex items-center">
                <div class="${signCls}">-</div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      const ch = r.prodStr[col - r.prodStartCol];
                      return `<div class="${cellCls} text-slate-400">${ch}</div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center my-0.5">
                <div class="${signCls}"></div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      return `<div class="${cellCls} flex items-center justify-center"><div class="w-full h-[1.5px] bg-slate-300 rounded-full"></div></div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center">
                <div class="${signCls}"></div>
                <div class="flex items-center font-black">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.remStartCol && col <= r.remEndCol) {
                      const ch = r.remStr[col - r.remStartCol];
                      return `<div class="${cellCls} text-slate-900">${ch}</div>`;
                    }
                    if (col === r.bringDownCol) {
                      return `
                        <div class="${cellCls} flex items-center justify-center">
                          <span class="text-teal-600 font-black animate-drop">
                            ${r.bringDownDigit}
                          </span>
                        </div>
                      `;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
            `;
          } else if (s.subStage === 3) {
            // Xong cả bài
            leftRowsHtml += `
              <div class="flex items-center">
                <div class="${signCls}">-</div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      const ch = r.prodStr[col - r.prodStartCol];
                      return `<div class="${cellCls} text-slate-400">${ch}</div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center my-0.5">
                <div class="${signCls}"></div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.prodStartCol && col <= r.prodEndCol) {
                      return `<div class="${cellCls} flex items-center justify-center"><div class="w-full h-[2px] bg-emerald-500 rounded-full"></div></div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
              <div class="flex items-center">
                <div class="${signCls}"></div>
                <div class="flex items-center">
                  ${Array.from({length: N}).map((_, col) => {
                    if (col >= r.remStartCol && col <= r.remEndCol) {
                      const ch = r.remStr[col - r.remStartCol];
                      return `<div class="${cellCls} text-emerald-700 font-black text-lg">${ch}</div>`;
                    }
                    return `<div class="${cellCls}"></div>`;
                  }).join('')}
                </div>
              </div>
            `;
          }
        }
      }

      // 2. CỘT PHẢI: DÃY CÁC CHỮ SỐ THƯƠNG
      let quotientCellsHtml = '';
      for (let i = 0; i < t.rounds.length; i++) {
        const r = t.rounds[i];
        if (i < s.roundIdx) {
          quotientCellsHtml += `<div class="${cellCls} text-emerald-700 font-black text-lg sm:text-xl">${r.quotientDigit}</div>`;
        } else if (i === s.roundIdx) {
          if (s.subStage === 0) {
            quotientCellsHtml += `
              <div id="fx-active-div-cell" class="${cellCls} bg-amber-100 border-2 border-amber-500 rounded-lg text-amber-950 font-black text-lg sm:text-xl animate-pulse shadow-xs">
                ${s.inputBuffer || '?'}
              </div>
            `;
          } else {
            quotientCellsHtml += `<div class="${cellCls} text-emerald-700 font-black text-lg sm:text-xl">${r.quotientDigit}</div>`;
          }
        } else {
          quotientCellsHtml += `<div class="${cellCls} text-slate-300 font-black text-lg sm:text-xl flex items-center justify-center">·</div>`;
        }
      }

      let instructionText = '';
      if (s.subStage === 0) {
        instructionText = `👉 <strong>1. Tính chia:</strong> Lấy <strong>${curRound.currentPart}</strong> chia cho <strong>${t.divisor}</strong> được mấy? (Điền thương)`;
      } else if (s.subStage === 1) {
        instructionText = `👉 <strong>2. Tính trừ:</strong> Lấy ${curRound.currentPart} - ${curRound.product} = ? (Điền số dư)`;
      } else if (s.subStage === 1.5) {
        instructionText = `⬇️ <strong>Tự động hạ số ${curRound.bringDownDigit}</strong> xuống cạnh số dư...`;
      } else {
        instructionText = `🎉 <strong>Hoàn thành!</strong> Kết quả: <strong>${t.dividend} : ${t.divisor} = ${t.quotient}</strong>`;
      }

      return `
        <div class="w-full flex flex-col gap-2 my-1">
          
          <!-- Hướng dẫn vi bước & gợi ý cửu chương -->
          <div class="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 shadow-2xs">
            <p class="text-xs font-bold text-slate-800 leading-snug">${instructionText}</p>
            ${s.subStage === 0 ? `
              <div class="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                <span>💡 Gợi ý:</span> <span>${curRound.clue}</span>
              </div>
            ` : ''}
          </div>

          <!-- Khung bảng đặt tính thẳng hàng 100% -->
          <div class="bg-white border-2 border-slate-300 rounded-2xl p-2.5 sm:p-3 shadow-xs relative flex items-start justify-center">
            
            <div class="flex items-start justify-center font-mono">
              <!-- Cột trái: Số bị chia & các lần trừ thẳng hàng -->
              <div class="flex flex-col items-start pr-1">
                ${leftRowsHtml}
              </div>

              <!-- Vạch đứng chia -->
              <div class="w-[3px] bg-teal-600 self-stretch rounded-full mx-1 shrink-0"></div>

              <!-- Cột phải: Số chia & Thương -->
              <div class="pl-2 flex flex-col items-start shrink-0">
                <div class="flex items-center pb-0.5">
                  <span class="font-mono text-lg sm:text-xl font-black text-teal-800 tracking-wider">
                    ${t.divisor}
                  </span>
                </div>
                <div class="w-full h-[3px] bg-teal-600 rounded-full my-0.5"></div>
                <div class="flex items-center pt-0.5">
                  ${quotientCellsHtml}
                </div>
              </div>
            </div>

            <!-- Overlay hoàn thành -->
            ${isCompleted ? `
              <div class="absolute inset-0 bg-emerald-500/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-3 text-center text-white">
                <span class="text-2xl">🎉</span>
                <span class="text-xs font-black mt-1">Xuất Sắc! Đã Chia Xong</span>
                <span class="text-[11px] font-mono font-bold text-emerald-100">${t.dividend} : ${t.divisor} = ${t.quotient}</span>
              </div>
            ` : ''}

          </div>

          <!-- Bàn phím số Numpad cảm ứng xúc giác (luôn sẵn sàng cho điện thoại) -->
          <div class="w-full max-w-[280px] mx-auto pt-1">
            <div class="grid grid-cols-5 gap-1 w-full">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `
                <button type="button" onclick="handleFxDivInput('${n}')" class="btn-3d-white py-2 rounded-xl font-black font-mono text-sm text-slate-800">
                  ${n}
                </button>
              `).join('')}
            </div>
            <div class="flex items-center justify-between gap-2 pt-1">
              <button type="button" onclick="handleFxDivInput('DEL')" class="btn-3d-white px-3 py-1 rounded-xl font-black text-xs text-rose-600 flex items-center gap-1">
                <span>⌫</span> Xóa
              </button>
              <span class="text-[9px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                ✨ Số tự động hạ xuống sau khi tính trừ
              </span>
            </div>
          </div>

        </div>
      `;
    }

    // Bắt sự kiện bàn phím máy tính cho phép chia
    if (typeof window !== 'undefined' && !window._fxDivKeyAttached) {
      window._fxDivKeyAttached = true;
      window.addEventListener('keydown', (e) => {
        const s = window._fxDivState;
        if (!s || !s.task || s.subStage === 1.5 || s.subStage === 3) return;
        if (e.key >= '0' && e.key <= '9') {
          window.handleFxDivInput(e.key);
        } else if (e.key === 'Backspace') {
          window.handleFxDivInput('DEL');
        }
      });
    }

    function renderFxCalcGrid(topStr, op, botStr, expectedStr, onDone, titleLabel = "Đặt tính:") {
      if (op === ':') {
        const key = `${topStr}:${botStr}`;
        if (!window._fxDivState || window._fxDivState.activeKey !== key) {
          window._fxDivState = {
            activeKey: key,
            task: decomposeLongDivisionEngine(Number(topStr), Number(botStr)),
            roundIdx: 0,
            subStage: 0,
            inputBuffer: '',
            onDone: onDone
          };
        } else {
          window._fxDivState.onDone = onDone;
        }

        return `
          <div id="fx-long-division-container" class="w-full">
            ${buildFxLongDivisionHTML()}
          </div>
        `;
      }

      const numCols = Math.max(String(topStr).length, String(botStr).length, String(expectedStr).length) + 1;
      const cellCls = "w-6 h-7 text-sm font-mono font-black text-center";

      let rowTop = '';
      for (let i = numCols - 1; i >= 0; i--) {
        const ch = String(topStr)[String(topStr).length - 1 - i] || '';
        rowTop += `<div class="${cellCls} flex items-center justify-center text-slate-800">${ch}</div>`;
      }

      let rowBot = '';
      for (let i = numCols - 1; i >= 0; i--) {
        const ch = String(botStr)[String(botStr).length - 1 - i] || '';
        rowBot += `<div class="${cellCls} flex items-center justify-center text-slate-800">${ch}</div>`;
      }

      let rowInputs = '';
      for (let i = numCols - 1; i >= 0; i--) {
        if (i < String(expectedStr).length) {
          rowInputs += `
            <input type="text" maxlength="1" inputmode="numeric" 
                   data-col="${i}" 
                   class="multi-digit-cell ${cellCls} rounded-lg border-2 border-teal-500 bg-teal-50 text-slate-900 focus:bg-teal-100 focus:border-teal-600 focus:outline-none shadow-xs transition" />
          `;
        } else {
          rowInputs += `<div class="${cellCls}"></div>`;
        }
      }

      setTimeout(() => {
        setupMultiRightToLeftListeners(expectedStr, onDone);
      }, 50);

      return `
        <div class="bg-white p-2.5 rounded-2xl border-2 border-teal-200 shadow-xs flex flex-col items-center justify-center my-1 select-none w-full max-w-[260px] mx-auto">
          <div class="inline-flex flex-col items-end">
            <div class="flex items-center justify-end gap-1">${rowTop}</div>
            <div class="flex items-center justify-end relative w-full gap-1 my-0.5">
              <span class="absolute left-0 text-teal-600 font-mono font-black text-base select-none pl-1">${op}</span>
              <div class="flex items-center justify-end gap-1">${rowBot}</div>
            </div>
            <div class="w-full h-[2px] bg-slate-800 my-1 rounded-full"></div>
            <div class="flex items-center justify-end gap-1 pt-0.5">${rowInputs}</div>
          </div>
          <span class="text-[9px] font-bold text-teal-700 mt-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            👉 ${titleLabel}
          </span>
        </div>
      `;
    }

function setupMultiRightToLeftListeners(expectedStr, onDone) {
      const cells = Array.from(document.querySelectorAll('.multi-digit-cell'));
      if (!cells.length) return;

      cells.sort((a, b) => parseInt(a.dataset.col) - parseInt(b.dataset.col));
      const startCell = cells[0];
      if (startCell) {
        startCell.focus();
        startCell.select();
      }

      cells.forEach((cell, idx) => {
        cell.onkeydown = function(e) {
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            this.value = e.key;
            playSfx('tap');

            let currentValRev = '';
            for (let c of cells) currentValRev += (c.value || '');
            const currentFullVal = currentValRev.split('').reverse().join('');

            if (idx < cells.length - 1) {
              const nextLeftCell = cells[idx + 1];
              nextLeftCell.focus();
              nextLeftCell.select();
            }

            if (currentFullVal === String(expectedStr)) {
              playSfx('pop');
              cells.forEach(c => {
                c.classList.remove('bg-teal-50', 'border-teal-500');
                c.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-950');
              });
              if (onDone) onDone();
            }
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.value = '';
            if (idx > 0) {
              const prevRightCell = cells[idx - 1];
              prevRightCell.focus();
              prevRightCell.select();
            }
          }
        };
      });
    }

    // Handlers chọn dấu và gõ số cho Tìm X
    function onFxSingleOpChange(val) {
      multiTaskState.tempOp = val;
      playSfx('tap');
      checkFxSingle();
    }
    function onFxSingleNumChange(val) {
      multiTaskState.tempNum = val.trim();
      checkFxSingle();
    }
    function checkFxSingle() {
      const item = (appState.activeTask.items || [])[appState.currentStepIndex || 0] || {};
      if (multiTaskState.tempOp === item.correct_op && multiTaskState.tempNum === item.target_num) {
        playSfx('pop');
        multiTaskState.curStage = 2;
        triggerFxReRender();
      }
    }

    function onFxRhsOpChange(val) {
      multiTaskState.tempOp = val;
      playSfx('tap');
      checkFxRhs();
    }
    function onFxRhsNumChange(val) {
      multiTaskState.tempNum = val.trim();
      checkFxRhs();
    }
    function checkFxRhs() {
      const item = (appState.activeTask.items || [])[appState.currentStepIndex || 0] || {};
      if (multiTaskState.tempOp === item.step2_op && multiTaskState.tempNum === item.step2_num) {
        playSfx('pop');
        multiTaskState.curStage = 3;
        triggerFxReRender();
      }
    }

    function onFxGenericOpChange(val) {
      multiTaskState.tempOp = val;
      playSfx('tap');
      checkFxGeneric1();
    }
    function onFxGenericNumChange(val) {
      multiTaskState.tempNum = val.trim();
      checkFxGeneric1();
    }
    function checkFxGeneric1() {
      const item = (appState.activeTask.items || [])[appState.currentStepIndex || 0] || {};
      const expectedOp = item.tier1_op || item.step1_op;
      const expectedNum = item.tier1_num || item.step1_num;
      if (multiTaskState.tempOp === expectedOp && multiTaskState.tempNum === expectedNum) {
        playSfx('pop');
        multiTaskState.curStage = 2;
        triggerFxReRender();
      }
    }

    function onFxGenericTier2OpChange(val) {
      multiTaskState.tempOp = val;
      playSfx('tap');
      checkFxGeneric2();
    }
    function onFxGenericTier2NumChange(val) {
      multiTaskState.tempNum = val.trim();
      checkFxGeneric2();
    }
    function checkFxGeneric2() {
      const item = (appState.activeTask.items || [])[appState.currentStepIndex || 0] || {};
      const expectedOp = item.tier2_op || item.step2_op;
      const expectedNum = item.tier2_num || item.step2_num;
      if (multiTaskState.tempOp === expectedOp && multiTaskState.tempNum === expectedNum) {
        playSfx('pop');
        multiTaskState.curStage = 4;
        triggerFxReRender();
      }
    }
