/* ============================================================
   MODULE: CLIENT-SIDE TASK DECOMPOSER FALLBACK & MANUAL CREATION
   ============================================================ */
    function parentSwitchCustomSubtab(subtab) {
      playSfx('tap');
      const btnAi = document.getElementById('p-subtab-ai');
      const btnManual = document.getElementById('p-subtab-manual');
      const conAi = document.getElementById('p-custom-ai-container');
      const conManual = document.getElementById('p-custom-manual-container');

      if (subtab === 'ai') {
        btnAi.className = "py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs transition";
        btnManual.className = "py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
        conAi.classList.remove('hidden');
        conManual.classList.add('hidden');
      } else {
        btnManual.className = "py-1.5 rounded-lg bg-teal-600 text-white shadow-xs transition";
        btnAi.className = "py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
        conManual.classList.remove('hidden');
        conAi.classList.add('hidden');
      }
    }

    function setAiPrompt(text) {
      playSfx('tap');
      document.getElementById('ai-task-input').value = text;
    }

    function detectDomainSubject(text) {
      if (!text) return "toan";
      const lower = text.toLowerCase();
      // Chores detection
      const choreWords = ["dọn", "bàn học", "rác", "quét", "lau", "gấp", "quần áo", "cặp sách", "sách vở", "rửa bát", "đánh răng", "đi ngủ", "tắm", "đồ chơi", "phòng ngủ", "giường"];
      if (choreWords.some(w => lower.includes(w))) {
        return "khoa_hoc_tu_nhien";
      }
      // Vietnamese / Reading detection
      const vnWords = ["đọc", "bài thơ", "đoạn văn", "từ ngữ", "chính tả", "tiếng việt", "từ láy", "câu chuyện", "kể chuyện", "tập đọc", "tập chép", "nghĩa của từ"];
      if (vnWords.some(w => lower.includes(w)) && !lower.match(/\d+\s*[\+\-\*\/×:]\s*\d+/)) {
        return "tieng_viet";
      }
      // Math detection (default or keywords or numbers)
      return "toan";
    }

    function generateClientSideMicroTasks(inputText, profile) {
      const text = (inputText || "Nhiệm vụ học tập").trim();
      const prof = profile || (appState && appState.cognitiveProfile) || DEFAULT_COGNITIVE_PROFILE;
      const durationSec = Math.max(60, Math.min(300, prof.recommended_micro_task_duration_sec || 120));
      const subject = detectDomainSubject(text);
      const nowId = Date.now();

      let microTasks = [];
      let finalSummary = {};

      if (subject === "toan") {
        // Extract numbers
        const numMatches = text.match(/\d+(?:[.,]\d+)?/g) || [];
        const nums = numMatches.map(n => parseFloat(n.replace(',', '.')));
        let a = nums[0] !== undefined ? nums[0] : 12;
        let b = nums[1] !== undefined ? nums[1] : 5;
        const lower = text.toLowerCase();

        let op = "cộng";
        let opSign = "+";
        let expected = a + b;
        if (lower.includes("chia") || lower.includes("mỗi phần") || lower.includes("phần bằng nhau") || lower.includes("chia đều") || lower.includes("chia cho") || lower.includes("cắm vào") || lower.includes("xếp vào")) {
          op = "chia";
          opSign = ":";
          expected = b !== 0 ? Math.round((a / b) * 10) / 10 : 1;
        } else if (lower.includes("nhân") || lower.includes("gấp") || lower.includes("mỗi")) {
          op = "nhân";
          opSign = "×";
          expected = a * b;
        } else if (lower.includes("trừ") || lower.includes("bớt") || lower.includes("còn lại") || lower.includes("ít hơn") || lower.includes("kém")) {
          op = "trừ";
          opSign = "-";
          expected = a >= b ? a - b : b - a;
        }

        const opKeywords = ["tất cả", "thêm", "bớt đi", "bớt", "còn lại", "nhiều hơn", "ít hơn"];
        const foundOp = opKeywords.find(k => lower.includes(k));
        const targetSegments = nums.length >= 2 ? [String(numMatches[0]), String(numMatches[1])] : (nums.length === 1 ? [String(numMatches[0])] : ["12", "5"]);
        if (foundOp) {
          targetSegments.push(foundOp);
        }

        microTasks = [
          {
            step_id: 1,
            title: "Gạch chân dữ kiện & từ khóa",
            action_verb: "Gạch_chân",
            atomic_instruction: foundOp ? `Gạch chân các số dữ kiện và từ khóa '${foundOp}' trong đề bài.` : "Gạch chân các số dữ kiện có trong câu toán.",
            duration_sec: durationSec,
            ui_type: "highlight",
            ui_payload: {
              prompt_text: text,
              highlight_target_segments: targetSegments
            },
            cognitive_scaffolding: {
              scaffolding_type: "visual_cue",
              cognitive_load_level: "low",
              working_memory_items: Math.min(3, Math.max(1, targetSegments.length)),
              explanation: "Khoanh vùng số liệu để loại bỏ nhiễu ngữ cảnh cho trẻ ADHD."
            },
            hints: ["Con hãy chạm vào các số xuất hiện trong đề bài nhé!"],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: targetSegments,
              feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại các số đã gạch chân nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "sparkle_star_01",
              audio_cue: "positive_bell_c6",
              dopamine_points: 25
            },
            is_final_step: false
          },
          {
            step_id: 2,
            title: "Lựa chọn phép tính",
            action_verb: "Chọn",
            atomic_instruction: "Chọn phép tính phù hợp để giải bài toán.",
            duration_sec: durationSec,
            ui_type: "single_choice",
            ui_payload: {
              prompt_text: "Để tìm đáp số, con hãy chọn phép tính đúng nhất:",
              options: [`${a} ${opSign} ${b}`, `${a} ${opSign === '+' ? '-' : '+'} ${b}`]
            },
            cognitive_scaffolding: {
              scaffolding_type: "worked_example",
              cognitive_load_level: "low",
              working_memory_items: 1,
              explanation: "Đơn giản hóa lựa chọn logic thành bài toán nhị phân."
            },
            hints: [`Bài toán cần thực hiện phép ${op} con nhé.`],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: `${a} ${opSign} ${b}`,
              feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "milo_thumbs_up",
              audio_cue: "sparkle_ting_short",
              dopamine_points: 30
            },
            is_final_step: false
          },
          {
            step_id: 3,
            title: "Tính và điền kết quả",
            action_verb: "Điền",
            atomic_instruction: "Thực hiện phép tính và điền đáp số.",
            duration_sec: durationSec,
            ui_type: "text_input",
            ui_payload: {
              prompt_text: `Kết quả của phép tính ${a} ${opSign} ${b} là bao nhiêu?`,
              placeholder: "Nhập số kết quả..."
            },
            cognitive_scaffolding: {
              scaffolding_type: "fill_in_the_blank",
              cognitive_load_level: "medium",
              working_memory_items: 2,
              explanation: "Điền kết quả cuối cùng sau khi đã loại bỏ xao nhãng."
            },
            hints: [`Thực hiện phép tính: ${a} ${opSign} ${b} = ?`],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: String(expected),
              feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại phép tính nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "particle_burst_gold",
              audio_cue: "gentle_pop_success",
              dopamine_points: 40
            },
            is_final_step: true
          }
        ];

        finalSummary = {
          final_answer_step_id: 3,
          extracted_final_answer: String(expected),
          pedagogical_wrap_up: "Tuyệt vời! Con đã hoàn thành xuất sắc bài toán từng bước một cùng bạn Milo!"
        };

      } else if (subject === "khoa_hoc_tu_nhien") {
        // Routines & Chores
        const choreKeywords = ["bàn học", "sách vở", "đồ chơi", "rác", "quần áo", "bút", "cặp sách"];
        const found = choreKeywords.filter(k => text.toLowerCase().includes(k));
        const targetSegments = found.length > 0 ? found : ["bàn học"];

        microTasks = [
          {
            step_id: 1,
            title: "Quan sát đồ vật cần dọn",
            action_verb: "Gạch_chân",
            atomic_instruction: "Gạch chân đồ vật cần thu dọn trong câu.",
            duration_sec: durationSec,
            ui_type: "highlight",
            ui_payload: {
              prompt_text: text,
              highlight_target_segments: targetSegments
            },
            cognitive_scaffolding: {
              scaffolding_type: "visual_cue",
              cognitive_load_level: "low",
              working_memory_items: Math.min(3, targetSegments.length),
              explanation: "Định hướng mục tiêu không gian cụ thể trước khi hành động."
            },
            hints: ["Con hãy tìm đồ vật cần dọn dẹp trong câu nhé!"],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: targetSegments,
              feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại đồ vật cần dọn nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "sparkle_star_01",
              audio_cue: "positive_bell_c6",
              dopamine_points: 25
            },
            is_final_step: false
          },
          {
            step_id: 2,
            title: "Chọn hành động đúng",
            action_verb: "Chọn",
            atomic_instruction: "Chọn cách sắp xếp khoa học nhất.",
            duration_sec: durationSec,
            ui_type: "single_choice",
            ui_payload: {
              prompt_text: "Hành động đúng và gọn gàng nhất là gì?",
              options: ["Cất gọn gàng vào đúng vị trí", "Để bừa bộn ở đó"]
            },
            cognitive_scaffolding: {
              scaffolding_type: "worked_example",
              cognitive_load_level: "low",
              working_memory_items: 1,
              explanation: "Hình thành thói quen kỷ luật tự giác qua lựa chọn nhị phân."
            },
            hints: ["Chọn việc làm sạch sẽ và ngăn nắp con nha."],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: "Cất gọn gàng vào đúng vị trí",
              feedback_on_error: "Milo gợi ý: Hãy chọn nơi ngăn nắp nhất nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "milo_thumbs_up",
              audio_cue: "sparkle_ting_short",
              dopamine_points: 30
            },
            is_final_step: false
          },
          {
            step_id: 3,
            title: "Xác nhận hoàn thành",
            action_verb: "Điền",
            atomic_instruction: "Điền chữ 'xong' khi con đã làm xong.",
            duration_sec: durationSec,
            ui_type: "text_input",
            ui_payload: {
              prompt_text: "Góc học tập đã gọn gàng chưa con? Điền 'xong' nhé:",
              placeholder: "Điền xong..."
            },
            cognitive_scaffolding: {
              scaffolding_type: "verification_check",
              cognitive_load_level: "low",
              working_memory_items: 1,
              explanation: "Đánh dấu hoàn thành chuỗi hành vi."
            },
            hints: ["Nhập chữ 'xong' con nhé."],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: "xong",
              feedback_on_error: "Milo gợi ý: Con hãy hoàn tất việc dọn dẹp rồi điền 'xong' nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "confetti_cannon",
              audio_cue: "harp_glissando_soft",
              dopamine_points: 40
            },
            is_final_step: true
          }
        ];

        finalSummary = {
          final_answer_step_id: 3,
          extracted_final_answer: "xong",
          pedagogical_wrap_up: "Tuyệt vời! Con đã có một góc học tập thật ngăn nắp và sạch đẹp!"
        };

      } else {
        // Vietnamese & Reading
        const words = text.split(/\s+/).filter(w => w.length > 2);
        const targetKeyword = words[1] || words[0] || "mùa hè";
        const targetSegments = [targetKeyword];

        microTasks = [
          {
            step_id: 1,
            title: "Gạch chân từ khóa",
            action_verb: "Gạch_chân",
            atomic_instruction: "Gạch chân từ quan trọng trong câu đọc.",
            duration_sec: durationSec,
            ui_type: "highlight",
            ui_payload: {
              prompt_text: text,
              highlight_target_segments: targetSegments
            },
            cognitive_scaffolding: {
              scaffolding_type: "visual_cue",
              cognitive_load_level: "low",
              working_memory_items: 1,
              explanation: "Hướng sự chú ý vào từ khóa trung tâm của câu."
            },
            hints: ["Con hãy chạm vào từ ngữ nổi bật nhất trong câu nhé!"],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: targetSegments,
              feedback_on_error: "Milo gợi ý: Con hãy kiểm tra lại từ khóa nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "sparkle_star_01",
              audio_cue: "positive_bell_c6",
              dopamine_points: 25
            },
            is_final_step: false
          },
          {
            step_id: 2,
            title: "Chọn ý nghĩa chính xác",
            action_verb: "Chọn",
            atomic_instruction: "Chọn ý đúng nhất cho bài đọc.",
            duration_sec: durationSec,
            ui_type: "single_choice",
            ui_payload: {
              prompt_text: "Ý nghĩa nổi bật nhất của câu là gì?",
              options: ["Nội dung đúng của bài đọc", "Chi tiết không có trong bài"]
            },
            cognitive_scaffolding: {
              scaffolding_type: "worked_example",
              cognitive_load_level: "low",
              working_memory_items: 1,
              explanation: "Phát triển năng lực đọc hiểu qua so sánh nhị phân."
            },
            hints: ["Dựa vào nội dung câu để chọn ý đúng nhất con nha."],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: "Nội dung đúng của bài đọc",
              feedback_on_error: "Milo gợi ý: Con hãy đọc kỹ lại câu văn nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "milo_thumbs_up",
              audio_cue: "sparkle_ting_short",
              dopamine_points: 30
            },
            is_final_step: false
          },
          {
            step_id: 3,
            title: "Điền từ thích hợp",
            action_verb: "Điền",
            atomic_instruction: "Điền từ khóa thích hợp vào chỗ trống.",
            duration_sec: durationSec,
            ui_type: "text_input",
            ui_payload: {
              prompt_text: "Điền từ còn thiếu vào câu:",
              placeholder: "Nhập từ khóa..."
            },
            cognitive_scaffolding: {
              scaffolding_type: "fill_in_the_blank",
              cognitive_load_level: "medium",
              working_memory_items: 1,
              explanation: "Khắc sâu từ vựng qua bài tập điền khuyết."
            },
            hints: [`Điền từ '${targetKeyword}' con nha.`],
            success_criteria: {
              evaluation_type: "exact_match",
              expected_answer: targetKeyword,
              feedback_on_error: "Milo gợi ý: Hãy điền đúng từ khóa ở bước 1 nhé! Bạn Milo tin con sẽ làm được! 🌱"
            },
            immediate_reinforcer: {
              visual_asset: "particle_burst_gold",
              audio_cue: "gentle_pop_success",
              dopamine_points: 40
            },
            is_final_step: true
          }
        ];

        finalSummary = {
          final_answer_step_id: 3,
          extracted_final_answer: targetKeyword,
          pedagogical_wrap_up: "Xuất sắc! Con đã hiểu rất rõ nội dung bài đọc cùng bạn Milo!"
        };
      }

      // Step count capped by cognitive profile
      const maxSteps = Math.min(10, Math.max(1, prof.max_steps_per_session || 4));
      if (microTasks.length > maxSteps) {
        microTasks = microTasks.slice(0, maxSteps);
        microTasks[microTasks.length - 1].is_final_step = true;
        finalSummary.final_answer_step_id = microTasks.length;
      }

      const totalEstimatedSec = microTasks.reduce((acc, t) => acc + t.duration_sec, 0);

      return {
        session_id: `SESSION_AI_${nowId}`,
        task_metadata: {
          benchmark_id: `AI_TASK_${nowId}`,
          original_title: text.length > 60 ? text.slice(0, 57) + "..." : text,
          grade: 3,
          subject: subject,
          target_cognitive_profile: {
            attention_span_minutes: prof.attention_span_minutes || 10,
            recommended_micro_task_duration_sec: durationSec,
            working_memory_capacity: prof.working_memory_capacity || 2,
            rsd_sensitivity_level: prof.rsd_sensitivity_level || "HIGH",
            scaffolding_level: prof.scaffolding_level || "MODERATE"
          },
          total_micro_tasks: microTasks.length,
          total_estimated_duration_sec: totalEstimatedSec
        },
        micro_tasks: microTasks,
        final_summary: finalSummary
      };
    }

    let activeGeneratedAiTask = null;

    async function parentRunAiBreakdown() {
      playSfx('bell');
      const inputEl = document.getElementById('ai-task-input');
      const input = (inputEl && inputEl.value ? inputEl.value.trim() : "") || "Nhiệm vụ AI";
      showToast("Milo AI Đang Phân Rã", "Đang phân tích cấu trúc bài & thiết kế giàn giáo ADHD...", "✨");

      const runBtn = document.querySelector("button[onclick*='parentRunAiBreakdown']");
      const originalBtnText = runBtn ? runBtn.innerHTML : "";
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.classList.add('opacity-60', 'cursor-not-allowed');
        runBtn.innerHTML = `<span>⏳</span> <span>AI đang phân rã bài tập...</span>`;
      }

      const profile = (appState && appState.cognitiveProfile) || DEFAULT_COGNITIVE_PROFILE;
      let session = null;

      // Live backend call to Gemini with 90s timeout
      let fetchError = null;
      if (typeof fetch === 'function') {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 90000) : null;
          const detectedSub = detectDomainSubject(input);
          const apiBase = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) ? '' : 'http://localhost:8000';
          const res = await fetch(`${apiBase}/api/tasks/decompose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              raw_text: input,
              grade: 3,
              subject: detectedSub,
              child_cognitive_profile: {
                cognitive_profile_vector: profile
              }
            }),
            signal: controller ? controller.signal : undefined
          });
          if (timeoutId) clearTimeout(timeoutId);
          if (res && res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.micro_tasks) && data.micro_tasks.length > 0) {
              session = data;
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            fetchError = errData.detail || `Server trả về mã lỗi: ${res.status}`;
          }
        } catch (e) {
          fetchError = e.name === 'AbortError' 
            ? "Quá thời gian chờ phản hồi AI (90s). Vui lòng thử lại với đề bài ngắn gọn hơn!" 
            : (e.message || "Không thể kết nối đến Backend Server port 8000.");
        } finally {
          if (runBtn) {
            runBtn.disabled = false;
            runBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            runBtn.innerHTML = originalBtnText;
          }
        }
      } else {
        fetchError = "Trình duyệt không hỗ trợ API fetch.";
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.classList.remove('opacity-60', 'cursor-not-allowed');
          runBtn.innerHTML = originalBtnText;
        }
      }

      if (!session) {
        if (typeof window !== 'undefined' && window.__TEST_MODE__) {
          session = generateClientSideMicroTasks(input, profile);
        } else {
          showToast("Lỗi Phân Rã AI", fetchError || "Không thể kết nối đến Gemini AI. Vui lòng kiểm tra lại server!", "❌");
          if (typeof alert === 'function') {
            alert("LỖI GỌI AI: " + (fetchError || "Không thể phân tích đề bài. Backend server chưa bật hoặc API Key lỗi."));
          }
          return null;
        }
      }

      const domainSub = session.task_metadata ? session.task_metadata.subject : detectDomainSubject(input);
      const isRoutine = domainSub === 'khoa_hoc_tu_nhien';
      const isMath = domainSub === 'toan';

      activeGeneratedAiTask = {
        id: (session.task_metadata && session.task_metadata.benchmark_id) || ('ai_' + Date.now()),
        cat: isMath ? 'math' : (isRoutine ? 'routine' : 'study'),
        catName: isRoutine ? 'Kỹ năng sinh hoạt (AI Băm)' : 'AI Tự Băm (GDPT 2018)',
        icon: isMath ? '🔢' : (isRoutine ? '🧹' : '📖'),
        title: (session.task_metadata && session.task_metadata.original_title) || input,
        island: isRoutine ? 'routine' : 'study',
        reward: session.micro_tasks.reduce((sum, s) => sum + ((s.immediate_reinforcer && s.immediate_reinforcer.dopamine_points) ? s.immediate_reinforcer.dopamine_points : 25), 0),
        stepSeconds: (session.task_metadata && session.task_metadata.target_cognitive_profile && session.task_metadata.target_cognitive_profile.recommended_micro_task_duration_sec) || profile.recommended_micro_task_duration_sec || 120,
        original_text: input,
        session_id: session.session_id,
        task_metadata: session.task_metadata,
        micro_tasks: session.micro_tasks,
        final_summary: session.final_summary,
        steps: session.micro_tasks.map((st, idx) => ({
          step_id: st.step_id || (idx + 1),
          badge: st.title || `Bước ${idx + 1}: ${st.action_verb}`,
          action_verb: st.action_verb,
          atomic_instruction: st.atomic_instruction,
          text: st.atomic_instruction,
          type: st.ui_type,
          ui_type: st.ui_type,
          ui_payload: st.ui_payload || {},
          ui_data: st.ui_payload || {}, // Seamless backward compatibility
          duration_sec: st.duration_sec,
          cognitive_scaffolding: st.cognitive_scaffolding,
          hints: st.hints,
          success_criteria: st.success_criteria,
          immediate_reinforcer: st.immediate_reinforcer,
          is_final_step: st.is_final_step
        }))
      };

      const previewCard = document.getElementById('ai-preview-card');
      const titleEl = document.getElementById('ai-preview-title');
      if (titleEl) titleEl.value = activeGeneratedAiTask.title;
      const stepsContainer = document.getElementById('ai-preview-steps-list');
      if (stepsContainer) {
        stepsContainer.innerHTML = '';
        activeGeneratedAiTask.steps.forEach((s, idx) => {
          const row = document.createElement('div');
          row.className = "bg-white p-2 rounded-xl border border-indigo-200 text-xs flex items-center gap-2";
          row.innerHTML = `
            <span class="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">${idx + 1}</span>
            <div class="flex-1">
              <span class="font-bold text-indigo-900 text-[10px] block">${s.badge}</span>
              <input type="text" value="${s.text}" oninput="if(activeGeneratedAiTask && activeGeneratedAiTask.steps[${idx}]) activeGeneratedAiTask.steps[${idx}].text = this.value" class="w-full text-[11px] font-semibold text-slate-700 bg-transparent focus:outline-none" />
            </div>
          `;
          stepsContainer.appendChild(row);
        });
      }

      if (previewCard) previewCard.classList.remove('hidden');
      showToast("Băm Xong Micro-tasks!", `Đã tạo chuỗi ${activeGeneratedAiTask.steps.length} bước vừa sức cho trẻ ADHD. Bạn có thể bấm giao ngay!`, "🎉");
      return activeGeneratedAiTask;
    }

    function parentDispatchAiTask(mode = 'replace') {
      if (!activeGeneratedAiTask) return;
      playSfx('bell');
      activeGeneratedAiTask.title = document.getElementById('ai-preview-title').value;
      
      // Đăng ký vào database & gán vào lộ trình máy con
      taskDatabase[activeGeneratedAiTask.id] = activeGeneratedAiTask;

      const kidId = appState.parentSelectedKidId || 'kid_leo_01';
      const currentKid = appState.parentSelectedKidProfile || { name: 'Bé' };
      const currentList = Array.isArray(appState.parentChildRoadmap) ? appState.parentChildRoadmap : appState.childRoadmap;

      if (mode === 'append' && Array.isArray(currentList) && currentList.length > 0) {
        const updated = [...currentList, activeGeneratedAiTask];
        appState.parentChildRoadmap = updated;
        if (appState.childDeviceKidId === kidId) {
          appState.childRoadmap = updated;
          if (typeof renderChildIslandRoadmap === 'function') renderChildIslandRoadmap();
        }
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            target_kid_id: kidId,
            kid_id: kidId,
            tasks: updated,
            islandName: `Hải Trình ${updated.length} Đảo Tri Thức`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        }
        renderParentActiveRoadmapList();
        showToast("Đã Thêm Đảo Mới", `Đã thêm [${activeGeneratedAiTask.title}] vào hải trình của ${currentKid.name}!`, "🏝️");
      } else {
        const updated = [activeGeneratedAiTask];
        appState.parentChildRoadmap = updated;
        appState.parentCurrentRoadmapIndex = 0;
        if (appState.childDeviceKidId === kidId) {
          appState.childRoadmap = updated;
          appState.currentRoadmapIndex = 0;
          appState.activeTask = activeGeneratedAiTask;
          if (typeof renderChildIslandRoadmap === 'function') renderChildIslandRoadmap();
          if (typeof childSwitchScreen === 'function') childSwitchScreen('home');
        }
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            target_kid_id: kidId,
            kid_id: kidId,
            tasks: updated,
            islandName: activeGeneratedAiTask.title,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        }
        renderParentActiveRoadmapList();
        showToast("Đã Giao Bài AI Băm", `[${activeGeneratedAiTask.title}] đã xuất hiện trên hải trình của ${currentKid.name}!`, "🚀");
      }
    }

    // FORM THỦ CÔNG: THÊM / BỚT BƯỚC ĐỘNG
    function addManualStepField() {
      playSfx('tap');
      const container = document.getElementById('manual-steps-container');
      const count = container.querySelectorAll('.manual-step-row').length + 1;
      const div = document.createElement('div');
      div.className = "manual-step-row flex items-center gap-1.5";
      div.innerHTML = `
        <span class="step-num-badge w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">${count}</span>
        <input type="text" placeholder="Nhập hành động bước ${count}..." class="manual-step-input flex-1 text-[11px] p-2 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-600" />
        <button onclick="removeManualStepField(this)" class="text-slate-400 hover:text-rose-500 p-1 text-xs font-bold">✕</button>
      `;
      container.appendChild(div);
      renumberManualSteps();
    }

    function removeManualStepField(btn) {
      playSfx('tap');
      const container = document.getElementById('manual-steps-container');
      if (container.querySelectorAll('.manual-step-row').length <= 2) {
        alert("Một nhiệm vụ nên có ít nhất 2 bước vi nhiệm vụ!");
        return;
      }
      btn.closest('.manual-step-row').remove();
      renumberManualSteps();
    }

    function renumberManualSteps() {
      const rows = document.querySelectorAll('#manual-steps-container .manual-step-row');
      rows.forEach((row, idx) => {
        row.querySelector('.step-num-badge').innerText = idx + 1;
      });
    }

    function parentDispatchManualTask(mode = 'replace') {
      playSfx('bell');
      const title = document.getElementById('manual-task-name').value.trim() || "Nhiệm vụ mẹ giao";
      const type = document.getElementById('manual-task-type').value;
      const stars = parseInt(document.getElementById('manual-task-stars').value) || 120;

      const inputElements = document.querySelectorAll('#manual-steps-container .manual-step-input');
      const dynamicSteps = [];
      inputElements.forEach((inp, idx) => {
        const val = inp.value.trim() || `Hành động bước ${idx + 1}`;
        dynamicSteps.push({
          badge: `Bước ${idx + 1}`,
          text: val
        });
      });

      const customTask = {
        id: 'manual_' + Date.now(),
        cat: type === 'routine' ? 'chore' : 'study',
        catName: type === 'routine' ? 'Sinh Hoạt Tự Lập' : 'Bài Tập Học Tập',
        icon: type === 'routine' ? '🧹' : '🚀',
        title: title,
        island: type,
        reward: stars,
        stepSeconds: 60,
        steps: dynamicSteps
      };

      taskDatabase[customTask.id] = customTask;

      const kidId = appState.parentSelectedKidId || 'kid_leo_01';
      const currentKid = appState.parentSelectedKidProfile || { name: 'Bé' };
      const currentList = Array.isArray(appState.parentChildRoadmap) ? appState.parentChildRoadmap : appState.childRoadmap;

      if (mode === 'append' && Array.isArray(currentList) && currentList.length > 0) {
        const updated = [...currentList, customTask];
        appState.parentChildRoadmap = updated;
        if (appState.childDeviceKidId === kidId) {
          appState.childRoadmap = updated;
          if (typeof renderChildIslandRoadmap === 'function') renderChildIslandRoadmap();
        }
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            target_kid_id: kidId,
            kid_id: kidId,
            tasks: updated,
            islandName: `Hải Trình ${updated.length} Đảo Tri Thức`,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        }
        renderParentActiveRoadmapList();
        showToast("Đã Thêm Đảo Mới", `Đã thêm [${title}] vào hải trình của ${currentKid.name}!`, "🏝️");
      } else {
        const updated = [customTask];
        appState.parentChildRoadmap = updated;
        appState.parentCurrentRoadmapIndex = 0;
        if (appState.childDeviceKidId === kidId) {
          appState.childRoadmap = updated;
          appState.currentRoadmapIndex = 0;
          appState.activeTask = customTask;
          if (typeof renderChildIslandRoadmap === 'function') renderChildIslandRoadmap();
          if (typeof childSwitchScreen === 'function') childSwitchScreen('home');
        }
        if (window.miloBus) {
          window.miloBus.broadcast('TASK_ASSIGN_BATCH', {
            target_kid_id: kidId,
            kid_id: kidId,
            tasks: updated,
            islandName: customTask.title,
            dispatchId: 'DISPATCH_' + Date.now()
          });
        }
        renderParentActiveRoadmapList();
        showToast("Giao Bài Thành Công", `Đã gửi [${title}] (${dynamicSteps.length} bước) sang máy ${currentKid.name}!`, "✍️");
      }
    }


