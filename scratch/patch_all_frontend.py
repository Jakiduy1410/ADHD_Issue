import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# -----------------------------------------------------------------------------
# 1. Add renderGeometrySvg and updateParentCoachInsights helpers
# -----------------------------------------------------------------------------
helpers_code = '''
    /* ============================================================
       DYNAMIC GEOMETRY SVG COMPONENT & AI COACH TELEMETRY OBSERVER
       ============================================================ */
    function renderGeometrySvg(spec) {
      if (!spec || !spec.shape_type) return '';
      const shape = spec.shape_type;
      const dims = spec.dimensions || {};
      const isArea = spec.target === 'area' || spec.target === 'remaining_area';
      const isPerimeter = spec.target === 'perimeter';

      if (shape === 'rectangle' || shape === 'square') {
        const lenLabel = dims.length || dims.side || "15 m";
        const widLabel = dims.width || dims.side || "8 m";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[120px] overflow-visible select-none">
              <line x1="40" y1="18" x2="240" y2="18" stroke="#0D9488" stroke-width="2" />
              <text x="140" y="14" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F766E">Dài: ${lenLabel}</text>
              
              <rect x="40" y="24" width="200" height="90" rx="8"
                fill="${isArea ? 'rgba(16, 185, 129, 0.20)' : '#F8FAFC'}"
                stroke="${isPerimeter ? '#F59E0B' : '#0D9488'}"
                stroke-width="${isPerimeter ? '4' : '2.5'}"
                stroke-dasharray="${isPerimeter ? '8 4' : 'none'}" />
              
              <text x="140" y="74" text-anchor="middle" font-size="12" font-weight="900" fill="${isArea ? '#047857' : (isPerimeter ? '#B45309' : '#334155')}">
                ${isArea ? 'Diện tích S = Dài × Rộng' : (isPerimeter ? 'Chu vi P = (Dài + Rộng) × 2' : 'Hình chữ nhật')}
              </text>
              
              <line x1="248" y1="24" x2="248" y2="114" stroke="#0D9488" stroke-width="2" />
              <text x="254" y="73" font-size="10" font-weight="bold" fill="#0F766E" dominant-baseline="middle">Rộng: ${widLabel}</text>
            </svg>
          </div>
        `;
      } else if (shape === 'parallelogram') {
        const baseLabel = dims.base || dims.length || "24 m";
        const heightLabel = dims.height || "15 m";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[120px] overflow-visible select-none">
              <polygon points="65,115 245,115 215,25 35,25"
                fill="${isArea ? 'rgba(16, 185, 129, 0.20)' : '#F8FAFC'}"
                stroke="${isPerimeter ? '#F59E0B' : '#0D9488'}"
                stroke-width="${isPerimeter ? '4' : '2.5'}"
                stroke-dasharray="${isPerimeter ? '8 4' : 'none'}" />
              
              <line x1="65" y1="25" x2="65" y2="115" stroke="#E11D48" stroke-width="2" stroke-dasharray="4 4" />
              <rect x="65" y="105" width="10" height="10" fill="none" stroke="#E11D48" stroke-width="1.5" />
              <text x="70" y="72" font-size="10" font-weight="bold" fill="#BE123C">h = ${heightLabel}</text>
              
              <text x="155" y="132" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F766E">Đáy a = ${baseLabel}</text>
              <text x="150" y="72" text-anchor="middle" font-size="12" font-weight="900" fill="#047857">S = a × h</text>
            </svg>
          </div>
        `;
      } else if (shape === 'nested') {
        const outerLen = dims.length || "20 m";
        const outerWid = dims.width || "15 m";
        const nestedName = spec.nested_label || "Ao cá";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[125px] overflow-visible select-none">
              <rect x="30" y="20" width="220" height="105" rx="8" fill="rgba(220, 252, 231, 0.85)" stroke="#059669" stroke-width="2.5" />
              <text x="140" y="15" text-anchor="middle" font-size="10" font-weight="bold" fill="#065F46">Vườn cây: ${outerLen} × ${outerWid}</text>
              
              <rect x="135" y="50" width="85" height="50" rx="6" fill="rgba(186, 230, 253, 0.9)" stroke="#0284C7" stroke-width="2" stroke-dasharray="4 2" />
              <text x="177" y="80" text-anchor="middle" font-size="10" font-weight="bold" fill="#0369A1">${nestedName}</text>
              <text x="75" y="78" text-anchor="middle" font-size="9" font-weight="black" fill="#047857">Phần đất còn lại<br/>S = S(vườn) - S(ao)</text>
            </svg>
          </div>
        `;
      }
      return '';
    }

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
'''

# Insert helpers right before renderChildIslandRoadmap
target_anchor = "    function renderChildIslandRoadmap() {"
if target_anchor in code and "function renderGeometrySvg" not in code:
    code = code.replace(target_anchor, helpers_code + "\n" + target_anchor)
    print("Added renderGeometrySvg and updateParentCoachInsights helpers")

# -----------------------------------------------------------------------------
# 2. Overhaul renderChildIslandRoadmap for N islands and Victory State
# -----------------------------------------------------------------------------
old_roadmap_fn_pattern = re.compile(
    r"function renderChildIslandRoadmap\(\)\s*\{[\s\S]*?if \(typeof renderParentTelemetryProgress === 'function'\) \{\s*renderParentTelemetryProgress\(currentStepsCount, 1\);\s*\}\s*\}",
    re.MULTILINE
)

new_roadmap_fn = """function renderChildIslandRoadmap() {
      if (!Array.isArray(appState.childRoadmap) || appState.childRoadmap.length === 0) {
        const fallbackDefault = (typeof taskDatabase !== 'undefined' && taskDatabase && taskDatabase['G1_MATH_01'])
          ? taskDatabase['G1_MATH_01']
          : {
              id: 'G1_MATH_01',
              title: 'Cộng số chim trên cành (Phạm vi 10)',
              icon: '🐦',
              reward: 120,
              steps: [{ step_id: 1, badge: 'Đếm chim', text: 'Cùng Milo đếm chim nhé!', duration_sec: 60 }]
            };
        appState.childRoadmap = [fallbackDefault];
      }

      const roadmap = appState.childRoadmap;
      const totalIslands = roadmap.length;
      const isAllCompleted = (appState.currentRoadmapIndex >= totalIslands);
      const curIdx = isAllCompleted ? totalIslands - 1 : Math.max(0, Math.min(appState.currentRoadmapIndex, totalIslands - 1));

      const mapContainer = document.getElementById('child-island-map-container');
      const counterEl = document.getElementById('child-roadmap-counter');
      const startQuestBtn = document.getElementById('child-btn-start-quest');

      if (isAllCompleted) {
        if (counterEl) counterEl.innerHTML = `<span class="text-amber-800 font-black">👑 HẢI TRÌNH TOÀN THẮNG! (${totalIslands}/${totalIslands} Đảo)</span>`;
        if (startQuestBtn) {
          startQuestBtn.className = "w-full btn-3d-yellow text-slate-900 font-black text-base py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-bounce cursor-pointer";
          startQuestBtn.setAttribute('onclick', "childSwitchScreen('rewards')");
          startQuestBtn.innerHTML = `<span>ĐỔI VÉ VÀNG NGAY! (+${appState.stars} ⭐)</span> <span class="text-xl">🎁</span>`;
        }
      } else {
        if (counterEl) counterEl.innerText = `Đảo ${curIdx + 1} / ${totalIslands}: Đang Chinh Phục`;
        if (startQuestBtn) {
          const activeTask = roadmap[curIdx] || roadmap[0];
          const isChore = (activeTask && activeTask.cat === 'chore');
          startQuestBtn.setAttribute('onclick', "startChildQuest()");
          startQuestBtn.className = isChore
            ? "w-full btn-3d-amber text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            : "w-full btn-3d-green text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2";
          startQuestBtn.innerHTML = `<span>VÀO BUỒNG LÁI TẬP TRUNG!</span> <span class="text-xl">🚀</span>`;
        }
      }

      if (mapContainer) {
        let islandsHtml = '';
        
        // 1. Top Node: Treasure Island (Opened when all completed)
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

        // 2. Islands in reverse order: Treasure is top, starting island is bottom
        for (let i = totalIslands - 1; i >= 0; i--) {
          const t = roadmap[i] || {};
          const isDone = isAllCompleted || i < curIdx;
          const isActive = !isAllCompleted && i === curIdx;
          const isChore = (t.cat === 'chore');
          const titleSnippet = (t.title && t.title.length > 20) ? (t.title.slice(0, 18) + '...') : (t.title || 'Đảo Nhiệm Vụ');

          if (isActive) {
            islandsHtml += `
              <div id="node-island-active" class="relative z-20 flex flex-col items-center my-2.5">
                <div class="absolute -left-16 -top-2 flex flex-col items-center animate-milo">
                  <div id="child-milo-speech" class="bg-white border-2 border-emerald-400 px-2 py-0.5 rounded-xl rounded-br-none shadow-md text-[9px] font-extrabold text-emerald-800 mb-0.5 max-w-[105px] text-center leading-tight">
                    Đảo ${i + 1}: ${titleSnippet} 👋
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-2xl shadow-md">
                    🤖
                  </div>
                </div>

                <div id="child-island-btn" onclick="startChildQuest()" class="w-20 h-20 rounded-[28px] ${isChore ? 'btn-3d-amber ring-8 ring-amber-100/50' : 'btn-3d-green ring-8 ring-emerald-100'} flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition">
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
              <div class="relative z-10 flex flex-col items-center my-2 cursor-pointer opacity-90 hover:opacity-100 transition" onclick="showToast('Đảo Đã Hoàn Thành', 'Leo đã chinh phục xuất sắc hòn đảo này! ⭐', '✅')">
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
              <div class="relative z-10 flex flex-col items-center my-2 opacity-60 cursor-pointer hover:opacity-80 transition" onclick="selectQueuedIsland(${i})">
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

        mapContainer.innerHTML = islandsHtml;
      }

      if (!isAllCompleted) {
        appState.activeTask = roadmap[curIdx] || roadmap[0];
      }

      const currentTask = roadmap[curIdx] || roadmap[0];
      const telemTitleEl = document.getElementById('telemetry-task-title');
      if (telemTitleEl && currentTask) telemTitleEl.innerText = currentTask.title;
      if (typeof renderParentTelemetryProgress === 'function' && currentTask && currentTask.steps) {
        renderParentTelemetryProgress(currentTask.steps.length, isAllCompleted ? currentTask.steps.length : 1);
      }
      updateParentCoachInsights(currentTask, isAllCompleted ? (currentTask.steps.length - 1) : 0, {});
    }"""

match = old_roadmap_fn_pattern.search(code)
if match:
    code = code[:match.start()] + new_roadmap_fn + code[match.end():]
    print("Replaced renderChildIslandRoadmap with dynamic N-island implementation")
else:
    print("Warning: renderChildIslandRoadmap regex did not match")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Batch 2 completed.")
