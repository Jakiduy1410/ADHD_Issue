/* ============================================================
   MODULE: AUDIO SYNTHESIZER (WEB AUDIO API & MILO VOICE ENGINE)
   ============================================================ */

/* ============================================================
   0. WEB AUDIO API SYNTHESIZER (SFX HIỆU ỨNG TỨC THÌ < 300MS)
   ============================================================ */
let audioCtx = null;
let isSoundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) {
    btn.innerText = isSoundEnabled ? "🔊" : "🔇";
  }
  if (!isSoundEnabled && window.miloVoice) {
    window.miloVoice.stop();
  }
  if (typeof showToast === 'function') {
    showToast(
      isSoundEnabled ? "Âm Thanh Đã Bật" : "Âm Thanh Đã Tắt",
      isSoundEnabled ? "Giọng bạn Milo & hiệu ứng sinh động" : "Chế độ yên lặng",
      isSoundEnabled ? "🔊" : "🔇"
    );
  }
}

function playSfx(type) {
  if (!isSoundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'tap') {
      // Âm thanh chạm xúc giác nhẹ nhàng
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

    } else if (type === 'star') {
      // Chuông nổ sao Dopamine cực nhanh (< 300ms)
      const notes = [659.25, 880, 1046.5]; // E5, A5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.16);
      });

    } else if (type === 'success') {
      // Hợp âm hoàn thành đảo
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });

    } else if (type === 'breathe') {
      // Âm thanh chuông xoay êm dịu cho bài tập thở
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // C4 ấm áp
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 2.5);

    } else if (type === 'bell') {
      // Chuông thông báo đồng bộ 2 chiều
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn("Audio Context init pending user interaction", e);
  }
}

/* ============================================================
   1. MILO VOICE ASSISTANT (MP3 ASSET ENGINE - GIỌNG BẠN MILO)
   Tự động phát audio hướng dẫn vi bước, nề nếp & phản hồi hành vi
   ============================================================ */
class MiloVoicePlayer {
  constructor() {
    this.manifest = null;
    this.currentAudio = null;
    this.audioCache = new Map();
    this.wrongAttemptCount = 0;
    this.isLoaded = false;
  }

  async init() {
    try {
      const res = await fetch('/data/audio/manifest.json');
      if (res.ok) {
        this.manifest = await res.json();
        this.isLoaded = true;
      }
    } catch (e) {
      console.info("MiloVoicePlayer: Could not fetch manifest, using fallback resolver", e);
    }
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    const indicator = document.getElementById('step-voice-btn');
    if (indicator) {
      indicator.classList.remove('animate-pulse', 'text-amber-500');
    }
  }

  play(key, onEnded = null) {
    if (!isSoundEnabled) return;
    this.stop();

    let filePath = null;
    if (this.manifest && this.manifest[key]) {
      filePath = '/' + this.manifest[key].file.replace(/\\/g, '/');
    } else {
      filePath = `/data/audio/generic_ui/${key}.mp3`;
    }

    try {
      let audio = this.audioCache.get(filePath);
      if (!audio) {
        audio = new Audio(filePath);
        this.audioCache.set(filePath, audio);
      }
      this.currentAudio = audio;
      audio.currentTime = 0;

      const btn = document.getElementById('step-voice-btn');
      if (btn) {
        btn.classList.add('animate-pulse', 'text-amber-500');
      }

      audio.onended = () => {
        if (btn) btn.classList.remove('animate-pulse', 'text-amber-500');
        if (typeof onEnded === 'function') onEnded();
      };

      audio.onerror = (err) => {
        if (btn) btn.classList.remove('animate-pulse', 'text-amber-500');
        console.warn("MiloVoice audio load error:", filePath, err);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (btn) btn.classList.remove('animate-pulse', 'text-amber-500');
          console.debug("Audio autoplay deferred pending user interaction:", err);
        });
      }
    } catch (e) {
      console.warn("MiloVoice play exception:", e);
    }
  }

  resolveStepKey(task, stepIndex) {
    if (!task) return 'highlight';
    const step = (task.steps && task.steps[stepIndex]) ? task.steps[stepIndex] : null;
    const stepNum = stepIndex + 1;

    // 1. Routine task đặc thù
    if (task.id && task.id.startsWith('routine_')) {
      const routineKey = `${task.id}_step${stepNum}`;
      if (this.manifest && this.manifest[routineKey]) {
        return routineKey;
      }
    }

    // 2. Bài tập GDPT đặc thù
    const etype = task.exercise_type || '';
    if (etype === 'geometry') {
      if (stepNum === 1) return 'geometry_step1_dims';
      if (stepNum === 2) return 'geometry_step2_formula';
      return 'geometry_step3_calc';
    }
    if (etype === 'reading_comprehension') {
      if (stepNum === 1) return 'reading_step1_passage';
      return 'reading_step2_character';
    }
    if (etype === 'multi_item_find_x' || etype === 'find_x') {
      if (stepNum === 1) return 'find_x_step1_role';
      return 'find_x_step2_rule';
    }
    if (etype === 'pure_arithmetic' || etype === 'multi_item_arithmetic') {
      if (stepNum === 1) return 'arithmetic_step1_units';
      return 'arithmetic_step2_tens';
    }
    if (task.subject === 'Tiếng Anh' || etype === 'eng') {
      if (stepNum === 1) return 'english_step1_vocab';
      return 'english_step2_meaning';
    }

    // 3. Fallback theo UI type
    if (step) {
      const uiType = step.ui_type || step.type;
      if (uiType === 'photo_proof') return 'photo_proof';
      if (uiType === 'timer_brush') return 'timer_brush';
      if (uiType === 'checkbox') return 'checkbox';
      if (uiType === 'single_choice') return 'single_choice';
      if (uiType === 'text_input') return 'text_input';
      if (uiType === 'highlight') return 'highlight';
      if (uiType === 'pipeline_timer') return 'timer_brush';
      if (uiType === 'study_bridge') return 'single_choice';
    }

    return 'highlight';
  }

  playStep(task, stepIndex) {
    this.wrongAttemptCount = 0;
    const key = this.resolveStepKey(task, stepIndex);
    this.play(key);
  }

  playWrongAttempt() {
    this.wrongAttemptCount++;
    if (this.wrongAttemptCount === 1) {
      this.play('wrong_attempt_1');
    } else if (this.wrongAttemptCount === 2) {
      this.play('wrong_attempt_2');
    } else {
      this.play('wrong_attempt_3_rescue');
    }
  }

  playIdleNudge() {
    this.play('idle_nudge_25s');
  }

  playIdleRescue() {
    this.play('idle_rescue_50s');
  }

  playRewardStep() {
    this.play('reward_step_win');
  }

  playRewardIsland() {
    this.play('reward_island_win');
  }

  playRewardPhoto() {
    this.play('reward_photo_sent');
  }

  playRewardTicket() {
    this.play('reward_golden_ticket');
  }
}

// Khởi tạo thực thể Milo Voice toàn cục
window.miloVoice = new MiloVoicePlayer();
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.miloVoice.init());
  } else {
    window.miloVoice.init();
  }
}


/* ============================================================
   TIỆN ÍCH KIỂM THỬ TOÀN DIỆN AUDIO TASK & ROUTINES
   ============================================================ */
window.testAllRoutineAudios = async function(options = {}) {
  const routinesDb = window.routineDatabase || {};
  const manifest = (window.miloVoice && window.miloVoice.manifest) || {};
  const report = [];
  let totalSteps = 0;
  let customVoiceCount = 0;
  let fallbackUiCount = 0;
  let missingCount = 0;

  console.log("%c🎵 ĐANG KIỂM TRA AUDIO CỦA TẤT CẢ ROUTINES...", "color: #10B981; font-weight: bold; font-size: 13px;");

  for (const [rid, r] of Object.entries(routinesDb)) {
    const steps = r.steps || [];
    for (let idx = 0; idx < steps.length; idx++) {
      totalSteps++;
      const s = steps[idx];
      const sNum = idx + 1;
      const expectedCustomKey = `${rid}_step${sNum}`;
      const uiType = s.ui_type || s.type || 'highlight';
      
      const resolvedKey = window.miloVoice ? window.miloVoice.resolveStepKey(r, idx) : expectedCustomKey;
      let filePath = null;
      let status = 'OK';

      if (manifest[resolvedKey]) {
        filePath = '/' + manifest[resolvedKey].file.replace(/\\/g, '/');
        if (resolvedKey === expectedCustomKey) {
          status = '⭐ GIỌNG THỰC TẾ RIÊNG (Custom Voice)';
          customVoiceCount++;
        } else {
          status = '🔔 GIỌNG UI CHUNG (Generic Fallback)';
          fallbackUiCount++;
        }
      } else {
        filePath = `/data/audio/generic_ui/${resolvedKey}.mp3`;
        status = '⚠️ THIẾU MANIFEST (Fallback)';
        missingCount++;
      }

      report.push({
        RoutineId: rid,
        RoutineTitle: r.title,
        Step: sNum,
        UiType: uiType,
        ResolvedKey: resolvedKey,
        FilePath: filePath,
        Status: status
      });
    }
  }

  console.table(report);
  console.log(`%c📊 TỔNG KẾT AUDIO: ${totalSteps} bước trong ${Object.keys(routinesDb).length} routines | ⭐ Custom Voice: ${customVoiceCount} | 🔔 Generic UI: ${fallbackUiCount} | ⚠️ Thiếu: ${missingCount}`, "color: #0284C7; font-weight: bold;");
  
  if (options.autoPlay) {
    console.log("%c▶️ Đang phát thử lần lượt từng audio (khoảng cách 1.5s)...", "color: #F59E0B;");
    for (let i = 0; i < report.length; i++) {
      const item = report[i];
      console.log(`[${i+1}/${report.length}] Phát audio: ${item.ResolvedKey} (${item.FilePath})`);
      window.miloVoice.play(item.ResolvedKey);
      await new Promise(res => setTimeout(res, 1800));
    }
  }

  return { totalSteps, customVoiceCount, fallbackUiCount, missingCount, report };
};

window.playRoutineAudio = function(routineId, stepIndex = 0) {
  const r = (window.routineDatabase || {})[routineId];
  if (!r) {
    console.warn("Không tìm thấy routine:", routineId);
    return;
  }
  if (window.miloVoice) {
    const key = window.miloVoice.resolveStepKey(r, stepIndex);
    console.log(`▶️ Phát audio bước ${stepIndex + 1} của [${r.title}] -> Key: ${key}`);
    window.miloVoice.play(key);
  }
};
