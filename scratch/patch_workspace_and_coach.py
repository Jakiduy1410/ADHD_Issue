import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update single_choice inside renderChildWorkspaceStep to support geometry SVG
old_single_choice = """      } else if ((stepData.ui_type === 'single_choice' || stepData.type === 'single_choice') && ui.options && ui.options.length > 0) {
        const opts = ui.options;
        const prompt = ui.prompt_text || stepData.text || stepData.atomic_instruction || "Chọn đáp án đúng:";
        const expected = (stepData.success_criteria && stepData.success_criteria.expected_answer !== undefined) 
          ? stepData.success_criteria.expected_answer 
          : (stepData.expected_answer !== undefined ? stepData.expected_answer : (ui.expected_answer !== undefined ? ui.expected_answer : null));
        let optHtml = opts.map(opt => `
          <button onclick='handleChildChoice(this, ${JSON.stringify(opt)}, ${JSON.stringify(expected)})' class="w-full btn-3d-white py-2.5 px-3 rounded-2xl font-black text-xs text-slate-800 text-left hover:border-teal-400 transition flex items-center justify-between">
            <span>${opt}</span>
            <span class="text-[10px] text-slate-400 font-normal">Chạm để chọn 👆</span>
          </button>
        `).join('');
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 min-h-[200px] flex flex-col justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <p class="text-xs font-bold text-slate-800 leading-relaxed">${prompt}</p>
            </div>
            <div class="space-y-1.5 my-auto">
              ${optHtml}
            </div>
            <div id="choice-feedback" class="text-[10px] font-bold text-center text-slate-500">
              Chọn đáp án phù hợp nhất để mở khóa bước kế tiếp!
            </div>
          </div>
        `;"""

new_single_choice = """      } else if ((stepData.ui_type === 'single_choice' || stepData.type === 'single_choice') && ui.options && ui.options.length > 0) {
        const opts = ui.options;
        const prompt = ui.prompt_text || stepData.text || stepData.atomic_instruction || "Chọn đáp án đúng:";
        const expected = (stepData.success_criteria && stepData.success_criteria.expected_answer !== undefined) 
          ? stepData.success_criteria.expected_answer 
          : (stepData.expected_answer !== undefined ? stepData.expected_answer : (ui.expected_answer !== undefined ? ui.expected_answer : null));
        const geomSvg = (ui.geometry_spec || (task && task.geometry_spec)) ? renderGeometrySvg(ui.geometry_spec || task.geometry_spec) : '';
        let optHtml = opts.map(opt => `
          <button onclick='handleChildChoice(this, ${JSON.stringify(opt)}, ${JSON.stringify(expected)})' class="w-full btn-3d-white py-2.5 px-3 rounded-2xl font-black text-xs text-slate-800 text-left hover:border-teal-400 transition flex items-center justify-between">
            <span>${opt}</span>
            <span class="text-[10px] text-slate-400 font-normal">Chạm để chọn 👆</span>
          </button>
        `).join('');
        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 min-h-[200px] flex flex-col justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <p class="text-xs font-bold text-slate-800 leading-relaxed">${prompt}</p>
            </div>
            ${geomSvg}
            <div class="space-y-1.5 my-auto">
              ${optHtml}
            </div>
            <div id="choice-feedback" class="text-[10px] font-bold text-center text-slate-500">
              Chọn đáp án phù hợp nhất để mở khóa bước kế tiếp!
            </div>
          </div>
        `;"""

if old_single_choice in code:
    code = code.replace(old_single_choice, new_single_choice)
    print("1. Updated single_choice with geometry SVG support")
else:
    print("Warning: old_single_choice not found exactly")

# 2. Update highlight rendering inside renderChildWorkspaceStep
old_highlight_block = """      } else if (stepData.ui_type === 'highlight' || stepData.type === 'highlight') {
        const targetSegments = ui.highlight_target_segments || 
          (stepData.success_criteria && Array.isArray(stepData.success_criteria.expected_answer) ? stepData.success_criteria.expected_answer : []);
        const sentenceToTokenize = (task && task.original_text) || ui.prompt_text || stepData.text || "Đề bài";
        const tokens = tokenizeSentenceForHighlight(sentenceToTokenize, targetSegments);
        const totalTargets = tokens.filter(t => t.isTarget).length;

        // Render natural flowing paragraph: plain text stays normal, ONLY target keywords become clickable tactile cards
        const paragraphHtml = tokens.map((tok, idx) => {
          if (tok.isTarget) {
            const targetKeyAttr = tok.targetKey ? `data-target-key="${tok.targetKey}"` : '';
            return `
              <button type="button"
                onclick="toggleHighlightToken(this)"
                data-token-idx="${idx}"
                data-is-target="true"
                ${targetKeyAttr}
                class="highlight-token highlight-chip inline-flex items-center gap-1 px-2.5 py-1 mx-1 my-0.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 text-xs font-bold cursor-pointer hover:border-teal-400 active:scale-95 transition-all duration-150 select-none shadow-xs">
                <span class="text-teal-600 font-mono text-[10px]">📍</span>
                <span>${tok.text}</span>
              </button>
            `;
          } else {
            return `<span class="text-slate-800 text-xs font-medium leading-relaxed">${tok.text}</span>`;
          }
        }).join(' ');

        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 flex flex-col gap-2.5">
            <div class="flex items-center gap-2 pb-1 border-b border-teal-200/60">
              <span class="text-lg">🔍</span>
              <p class="text-xs font-black text-teal-900 leading-snug">Chạm vào các ô từ khóa màu vàng để nạp dữ kiện!</p>
            </div>
            
            <!-- Natural Reading Flow (Khít sát tự nhiên, không ô rác) -->
            <div id="highlight-tokens-container" class="bg-white/95 p-3 rounded-xl border border-teal-200 leading-loose text-left shadow-xs">
              ${paragraphHtml}
            </div>

            <!-- Milo Feedback & Counter -->
            <div id="highlight-feedback" class="text-[11px] font-bold text-center text-teal-800 bg-teal-100/60 py-1.5 px-2 rounded-xl">
              🎯 Milo: Đang chờ bé chạm vào đủ ${totalTargets} dữ kiện mấu chốt nhé!
            </div>

            <button id="btn-complete-highlight" onclick="completeHighlightStep(this)" disabled class="btn-3d-green px-3 py-2.5 rounded-xl font-black text-xs text-white shadow-md active:scale-95 transition opacity-50 cursor-not-allowed">
              ✅ BÉ ĐÃ NẠP XONG DỮ KIỆN
            </button>
          </div>
        `;"""

new_highlight_block = """      } else if (stepData.ui_type === 'highlight' || stepData.type === 'highlight') {
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

        const tokens = tokenizeSentenceForHighlight(sentenceToTokenize, targetSegments);
        const totalTargets = tokens.filter(t => t.isTarget).length;

        // Render natural flowing paragraph with authentic yellow highlighter styling
        const paragraphHtml = tokens.map((tok, idx) => {
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

        // Collapsible reading passage reference drawer if reading passage exists
        let passageDrawerHtml = '';
        const readingPassage = (task && task.reading_passage) || ui.reading_passage;
        if (readingPassage) {
          passageDrawerHtml = `
            <details class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-950 mb-1 cursor-pointer">
              <summary class="font-bold flex items-center justify-between text-indigo-800 select-none">
                <span class="flex items-center gap-1.5"><span>📖</span> <span>Xem lại toàn bài đọc</span></span>
                <span class="text-[10px] text-indigo-600 underline">Mở/Đóng</span>
              </summary>
              <p class="mt-2 text-[11px] leading-relaxed text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100 whitespace-pre-line">
                ${readingPassage}
              </p>
            </details>
          `;
        }

        stage.innerHTML = `
          <div class="bg-teal-50/70 border-2 border-dashed border-teal-300 rounded-2xl p-3 flex flex-col gap-2.5">
            <div class="flex items-center gap-2 pb-1 border-b border-teal-200/60">
              <span class="text-lg">🔍</span>
              <p class="text-xs font-black text-teal-900 leading-snug">Chạm vào các ô từ khóa màu vàng để nạp dữ kiện!</p>
            </div>
            
            ${passageDrawerHtml}

            <!-- Natural Reading Flow (Khít sát tự nhiên, hiệu ứng dạ quang) -->
            <div id="highlight-tokens-container" class="bg-white/95 p-3 rounded-xl border border-teal-200 leading-loose text-left shadow-xs">
              ${paragraphHtml}
            </div>

            <!-- Milo Feedback & Counter -->
            <div id="highlight-feedback" class="text-[11px] font-bold text-center text-teal-800 bg-teal-100/60 py-1.5 px-2 rounded-xl">
              🎯 Milo: Đang chờ bé chạm vào đủ ${totalTargets} dữ kiện mấu chốt nhé!
            </div>

            <button id="btn-complete-highlight" onclick="completeHighlightStep(this)" disabled class="btn-3d-green px-3 py-2.5 rounded-xl font-black text-xs text-white shadow-md active:scale-95 transition opacity-50 cursor-not-allowed">
              ✅ BÉ ĐÃ NẠP XONG DỮ KIỆN
            </button>
          </div>
        `;"""

if old_highlight_block in code:
    code = code.replace(old_highlight_block, new_highlight_block)
    print("2. Updated highlight block with reading passage support and authentic highlighter styling")
else:
    print("Warning: old_highlight_block not found exactly")

# 3. Update toggleHighlightToken
old_toggle_fn = """    function toggleHighlightToken(btn) {
      playSfx('tap');
      const isSelected = btn.classList.toggle('is-highlighted');

      if (isSelected) {
        btn.classList.remove('bg-white', 'text-slate-900', 'border-slate-300');
        btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-600', 'scale-105', 'shadow-md');
        btn.innerHTML = `<span class="text-white font-mono text-[10px]">✅</span> <span>${btn.innerText.replace(/^📍\\s*/, '').replace(/^✅\\s*/, '').trim()}</span>`;
      } else {
        btn.classList.add('bg-white', 'text-slate-900', 'border-slate-300');
        btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-600', 'scale-105', 'shadow-md');
        btn.innerHTML = `<span class="text-teal-600 font-mono text-[10px]">📍</span> <span>${btn.innerText.replace(/^📍\\s*/, '').replace(/^✅\\s*/, '').trim()}</span>`;
      }"""

new_toggle_fn = """    function toggleHighlightToken(btn) {
      playSfx('tap');
      const isSelected = btn.classList.toggle('is-highlighted');

      if (isSelected) {
        btn.classList.remove('bg-amber-50/80', 'border-amber-400', 'border-dashed');
        btn.classList.add('bg-amber-300', 'border-amber-600', 'border-b-2', 'text-amber-950', 'scale-105', 'shadow-xs');
        btn.innerHTML = `<span class="text-amber-900 font-mono text-[10px]">✨</span> <span>${btn.innerText.replace(/^✏️\\s*/, '').replace(/^✨\\s*/, '').replace(/^📍\\s*/, '').replace(/^✅\\s*/, '').trim()}</span>`;
      } else {
        btn.classList.add('bg-amber-50/80', 'border-amber-400', 'border-dashed');
        btn.classList.remove('bg-amber-300', 'border-amber-600', 'border-b-2', 'text-amber-950', 'scale-105', 'shadow-xs');
        btn.innerHTML = `<span class="text-amber-600 font-mono text-[10px]">✏️</span> <span>${btn.innerText.replace(/^✏️\\s*/, '').replace(/^✨\\s*/, '').replace(/^📍\\s*/, '').replace(/^✅\\s*/, '').trim()}</span>`;
      }"""

if old_toggle_fn in code:
    code = code.replace(old_toggle_fn, new_toggle_fn)
    print("3. Updated toggleHighlightToken highlighter style")
else:
    print("Warning: old_toggle_fn not found exactly")

# 4. Update parentAskCoach to be dynamic
old_ask_coach = """    function parentAskCoach() {
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

      setTimeout(() => {
        playSfx('bell');
        box.innerHTML += `
          <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 text-xs space-y-1.5 shadow-xs">
            <div class="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
              <span>🤖</span> <span>Milo Coach Phản Hồi:</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              "Với câu hỏi của mẹ, nguyên tắc vàng cho trẻ ADHD là <strong>giảm tối đa ma sát nhận thức</strong>. Hãy để Robot Milo hướng dẫn thở bụng 4-4-4 và chia nhỏ hành động xuống dưới 2 phút. Sự ghi nhận nỗ lực tức thì sẽ kích hoạt thụ thể Dopamine hiệu quả nhất!"
            </p>
          </div>
        `;
        box.scrollTop = box.scrollHeight;
      }, 600);
    }"""

new_ask_coach = """    function parentAskCoach() {
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
    }"""

if old_ask_coach in code:
    code = code.replace(old_ask_coach, new_ask_coach)
    print("4. Updated parentAskCoach with context-aware responses")
else:
    print("Warning: old_ask_coach not found exactly")

# 5. Wire updateParentCoachInsights into registerMiloSyncSubscribers
old_step_telem = """      // 2. STEP_TELEMETRY_UPDATE: Child updates step -> Parent telemetry bar updates
      bus.subscribe('STEP_TELEMETRY_UPDATE', (payload) => {
        const total = payload.totalSteps || (appState.activeTask ? appState.activeTask.steps.length : 3);
        const activeNum = (payload.stepIndex !== undefined ? payload.stepIndex + 1 : 1);
        renderParentTelemetryProgress(total, activeNum);
        if (payload.elapsedSec !== undefined) {
          const durEl = document.getElementById('telemetry-duration');
          if (durEl) durEl.innerHTML = `${formatTime(payload.elapsedSec)} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;
        }
      });"""

new_step_telem = """      // 2. STEP_TELEMETRY_UPDATE: Child updates step -> Parent telemetry bar updates
      bus.subscribe('STEP_TELEMETRY_UPDATE', (payload) => {
        const total = payload.totalSteps || (appState.activeTask ? appState.activeTask.steps.length : 3);
        const activeNum = (payload.stepIndex !== undefined ? payload.stepIndex + 1 : 1);
        renderParentTelemetryProgress(total, activeNum);
        if (payload.elapsedSec !== undefined) {
          const durEl = document.getElementById('telemetry-duration');
          if (durEl) durEl.innerHTML = `${formatTime(payload.elapsedSec)} <span class="font-normal text-slate-400 text-[10px]">(Thời gian thực)</span>`;
        }
        if (typeof updateParentCoachInsights === 'function' && appState.activeTask) {
          updateParentCoachInsights(appState.activeTask, activeNum - 1, payload);
        }
      });"""

if old_step_telem in code:
    code = code.replace(old_step_telem, new_step_telem)
    print("5. Connected updateParentCoachInsights to STEP_TELEMETRY_UPDATE")
else:
    print("Warning: old_step_telem not found exactly")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Batch 3 completed.")
