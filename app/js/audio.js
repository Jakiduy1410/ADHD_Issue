/* ============================================================
   MODULE: AUDIO SYNTHESIZER (WEB AUDIO API)
   ============================================================ */
/* ============================================================
       0. WEB AUDIO API SYNTHESIZER (KHÔNG CẦN FILE MP3 NGOÀI, 100% RELIABLE)
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
      btn.innerText = isSoundEnabled ? "🔊" : "🔇";
      showToast(isSoundEnabled ? "Âm Thanh Đã Bật" : "Âm Thanh Đã Tắt", isSoundEnabled ? "Hiệu ứng âm thanh sinh động < 300ms" : "Chế độ yên lặng", isSoundEnabled ? "🔊" : "🔇");
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


