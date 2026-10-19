/* ============================================================
   MODULE: REWARDS, VISUAL TIMER & MILO RSD RESCUE
   ============================================================ */
    /* ============================================================
       H. NỔ SAO DOPAMINE < 300MS & CHUYỂN BƯỚC / ĂN MỪNG
       ============================================================ */
    function completeChildStep() {
      // 1. Phản hồi Dopamine tức thì < 300ms
      playSfx('star');
      spawnStars();
      const earned = 40;
      const newStars = appState.stars + earned;
      updateStarsEverywhere(newStars);

      const totalSteps = appState.activeTask ? appState.activeTask.steps.length : 3;
      const isFinalStep = appState.currentStepIndex >= totalSteps - 1;

      // Broadcast STEP_COMPLETED & STARS_SYNC
      if (window.miloBus) {
        window.miloBus.broadcast('STEP_COMPLETED', {
          taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
          stepIndex: appState.currentStepIndex,
          totalSteps: totalSteps,
          starsEarned: earned,
          totalStarsNow: newStars,
          isTaskComplete: isFinalStep
        });
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: earned,
          reason: 'step_reward'
        });
      }

      if (!isFinalStep) {
        appState.currentStepIndex++;
        if (window.miloBus) window.miloBus.savePersistedState(appState);
        setTimeout(() => { renderChildWorkspaceStep(); }, 250);
      } else {
        // Hoàn thành toàn bộ hòn đảo hiện tại!
        stopStepTimer();
        playSfx('success');
        if (window.miloBus) {
          window.miloBus.broadcast('ISLAND_COMPLETED', {
            taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
            islandTitle: appState.activeTask ? appState.activeTask.title : 'Đảo Nhiệm Vụ',
            totalStars: newStars,
            nextIslandIndex: appState.currentRoadmapIndex + 1
          });
          window.miloBus.savePersistedState(appState);
        }
        setTimeout(() => { showCelebration(); }, 300);
      }
    }

    function spawnStars() {
      const container = document.getElementById('child-screen-workspace');
      for (let i = 0; i < 7; i++) {
        const star = document.createElement('div');
        star.className = 'star-burst text-2xl';
        star.innerText = ['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)];
        star.style.left = (60 + i * 38) + 'px';
        star.style.bottom = '85px';
        container.appendChild(star);
        setTimeout(() => star.remove(), 700);
      }
    }

    function showCelebration() {
      const modal = document.getElementById('child-modal-celebration');
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      const task = appState.activeTask;
      document.getElementById('child-celeb-title').innerText = `${task.title} thành công! 🚀`;
      document.getElementById('child-celeb-desc').innerHTML = `"Milo thấy Leo rất kiên trì hoàn thành xuất sắc tất cả ${task.steps.length} vi nhiệm vụ mà không bỏ cuộc giữa chừng!"`;
      document.getElementById('child-celeb-reward-val').innerText = `+${task.reward} Sao`;

      // Cập nhật Telemetry bên máy Mẹ
      document.getElementById('telemetry-status-badge').innerHTML = "🎉 Vừa hoàn thành!";
      document.getElementById('telemetry-status-badge').className = "inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold";
      document.getElementById('telemetry-progress-text').innerText = `${task.steps.length}/${task.steps.length} bước xong 🎉`;
      
      showToast("Đồng bộ máy Mẹ", `Leo vừa hoàn thành: ${task.title}`, "🎉");
    }

    function proceedToNextRoadmapIsland() {
      playSfx('tap');
      const modal = document.getElementById('child-modal-celebration');
      modal.classList.add('hidden');
      modal.classList.remove('flex');

      // Chuyển sang đảo kế tiếp nếu có
      if (appState.currentRoadmapIndex < appState.childRoadmap.length - 1) {
        appState.currentRoadmapIndex++;
        childSwitchScreen('home');
        showToast("Mở Khóa Đảo Mới", `Chúc mừng Leo! Đảo tiếp theo đã sẵn sàng trên bản đồ!`, "🏝️");
      } else {
        // ĐÃ HOÀN THÀNH TẤT CẢ CÁC ĐẢO -> MỞ RƯƠNG BÁU HOÀNG KIM!
        appState.currentRoadmapIndex = appState.childRoadmap.length;
        openTreasureCeremony();
      }
    }

    function openTreasureCeremony() {
      playSfx('success');
      const ceremony = document.getElementById('child-modal-treasure-ceremony');
      if (ceremony) {
        ceremony.classList.remove('hidden');
        ceremony.classList.add('flex');
      }
      const newStars = appState.stars + 250;
      updateStarsEverywhere(newStars);
      if (window.miloBus) {
        window.miloBus.broadcast('TREASURE_UNLOCKED', {
          totalStarsEarned: newStars,
          unlockedRewards: ["Huy hiệu Hiệp Sĩ Tập Trung", "Mở khóa Đổi Vé Vàng"]
        });
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: 250,
          reason: 'island_bonus'
        });
        window.miloBus.savePersistedState(appState);
      }
      showToast("RƯƠNG BÁU HOÀNG KIM!", "Leo đã nhận thêm +250 ⭐ và mở khóa Trạm Vé Vàng!", "👑");
    }

    function openRedeemFromTreasure() {
      playSfx('tap');
      exitTreasureModal();
      childSwitchScreen('rewards');
    }

    function exitTreasureModal() {
      const ceremony = document.getElementById('child-modal-treasure-ceremony');
      if (ceremony) {
        ceremony.classList.add('hidden');
        ceremony.classList.remove('flex');
      }
      childSwitchScreen('home');
      renderChildIslandRoadmap();
    }


    /* ============================================================
       I. ROBOT MILO HẠ NHIỆT RSD & BÀI TẬP THỞ BỤNG 4-4-4
       ============================================================ */
    function toggleSoftPause(show) {
      playSfx('breathe');
      const modal = document.getElementById('child-modal-soft-pause');
      const ring = document.getElementById('child-ring-timer');
      
      if (show) {
        isTimerPaused = true;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        ring.classList.add('ring-timer-paused');
        updateTimerUI();

        // Kích hoạt chu kỳ thở bụng 4-4-4
        startBoxBreathing();

        appState.pauseCount++;
        const pCountEl = document.getElementById('telemetry-pause-count');
        if (pCountEl) pCountEl.innerHTML = `${appState.pauseCount} lần <span class="text-emerald-600 font-semibold">(Biết tự điều tiết CBT)</span>`;
        const badgeEl = document.getElementById('telemetry-status-badge');
        if (badgeEl) badgeEl.innerHTML = "🔋 Tự giác Pause (CBT)";

        if (window.miloBus) {
          window.miloBus.broadcast('MILO_RESCUE_TRIGGER', {
            reason: 'user_clicked_rescue',
            stepId: appState.currentStepIndex + 1,
            taskId: appState.activeTask ? appState.activeTask.id : 'unknown',
            pauseCount: appState.pauseCount
          });
          window.miloBus.savePersistedState(appState);
        }
      } else {
        isTimerPaused = false;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        ring.classList.remove('ring-timer-paused');
        updateTimerUI();
        stopBoxBreathing();
      }
    }

    function startBoxBreathing() {
      stopBoxBreathing();
      breathingStage = 0;
      breathingSecondsLeft = 4;
      breathingCycleCount = 1;
      updateBreathingUI();

      breathingInterval = setInterval(() => {
        breathingSecondsLeft--;
        if (breathingSecondsLeft <= 0) {
          breathingSecondsLeft = 4;
          breathingStage = (breathingStage + 1) % 4;
          if (breathingStage === 0) {
            breathingCycleCount++;
          }
          playSfx('breathe');
        }
        updateBreathingUI();
      }, 1000);
    }

    function stopBoxBreathing() {
      if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
      }
    }

    function updateBreathingUI() {
      const label = document.getElementById('breathing-phase-label');
      const counter = document.getElementById('breathing-cycle-counter');
      const num = document.getElementById('breathing-seconds-num');
      const orb = document.getElementById('breathing-orb');
      const sub = document.getElementById('breathing-sub-instruction');

      if (!label || !num || !orb) return;

      counter.innerText = `Nhịp ${breathingCycleCount} / 3`;
      num.innerText = breathingSecondsLeft;

      if (breathingStage === 0) {
        label.innerText = `🫁 1. Hít vào từ từ bằng mũi (${breathingSecondsLeft}s)`;
        label.className = "text-xs font-black text-sky-900 bg-sky-200/80 px-2.5 py-0.5 rounded-full";
        sub.innerText = "Hít không khí mát lành vào căng tròn bụng";
        orb.className = "w-20 h-20 rounded-full bg-sky-400 border-2 border-sky-500 flex items-center justify-center text-white font-black text-sm shadow-lg transition-all duration-1000 scale-125";
      } else if (breathingStage === 1) {
        label.innerText = `⏸️ 2. Giữ hơi thở êm dịu (${breathingSecondsLeft}s)`;
        label.className = "text-xs font-black text-teal-900 bg-teal-200/80 px-2.5 py-0.5 rounded-full";
        sub.innerText = "Giữ hơi nhẹ nhàng • Cảm nhận sự bình tĩnh";
        orb.className = "w-20 h-20 rounded-full bg-teal-300 border-2 border-teal-400 flex items-center justify-center text-teal-950 font-black text-sm shadow-md transition-all duration-1000 scale-125";
      } else if (breathingStage === 2) {
        label.innerText = `💨 3. Thở ra từ từ bằng miệng (${breathingSecondsLeft}s)`;
        label.className = "text-xs font-black text-indigo-900 bg-indigo-200/80 px-2.5 py-0.5 rounded-full";
        sub.innerText = "Thổi nhẹ như thổi nguội một bát súp ấm";
        orb.className = "w-20 h-20 rounded-full bg-sky-200 border-2 border-sky-300 flex items-center justify-center text-sky-900 font-black text-sm shadow-inner transition-all duration-1000 scale-90";
      } else {
        label.innerText = `🌿 4. Thả lỏng toàn thân (${breathingSecondsLeft}s)`;
        label.className = "text-xs font-black text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-full";
        sub.innerText = "Thả lỏng hai vai • Sẵn sàng đón chào năng lượng mới";
        orb.className = "w-20 h-20 rounded-full bg-emerald-200 border-2 border-emerald-300 flex items-center justify-center text-emerald-950 font-black text-sm shadow-inner transition-all duration-1000 scale-95";
      }
    }

    function useMiloHint() {
      playSfx('star');
      toggleSoftPause(false);
      const wrong = document.getElementById('math-wrong-op');
      if (wrong) {
        wrong.classList.add('opacity-20', 'pointer-events-none');
      }
      showToast("Milo hỗ trợ", "Đã làm mờ phép tính gây nhiễu giúp con!", "💡");
    }


    /* ============================================================
       J. TRẠM ĐỔI VÉ VÀNG (REWARD CENTER) & ĐỒNG BỘ MÁY MẸ
       ============================================================ */
    function childRedeemTicket(name, stars) {
      playSfx('tap');
      if (appState.stars < stars) {
        showToast("Chưa Đủ Sao", `Bạn cần ${stars} ⭐ để đổi món quà này. Cùng làm thêm nhiệm vụ nhé!`, "⭐");
        return;
      }
      playSfx('bell');
      const newStars = appState.stars - stars;
      updateStarsEverywhere(newStars);
      const btn = document.getElementById('btn-redeem-ticket');
      if (btn) {
        btn.innerText = "⏳ ĐÃ GỬI BỐ MẸ!";
        btn.disabled = true;
      }

      const ticketPayload = {
        ticketId: 'ticket_' + Date.now(),
        title: name,
        cost: stars,
        remainingStars: newStars
      };
      appState.pendingTicket = ticketPayload;

      // Broadcast TICKET_REDEEM_REQUEST & STARS_SYNC
      if (window.miloBus) {
        window.miloBus.broadcast('TICKET_REDEEM_REQUEST', ticketPayload);
        window.miloBus.broadcast('STARS_SYNC', {
          totalStars: newStars,
          delta: -stars,
          reason: 'ticket_deduct'
        });
        window.miloBus.savePersistedState(appState);
      }

      // Kích hoạt banner bên máy Mẹ Realtime (nếu ở single-tab dual mode)
      const banner = document.getElementById('parent-golden-ticket-banner');
      const doneBanner = document.getElementById('parent-golden-ticket-done');
      const dot = document.getElementById('p-reward-dot');
      const desc = document.getElementById('parent-ticket-desc');
      if (banner) banner.classList.remove('hidden');
      if (doneBanner) doneBanner.classList.add('hidden');
      if (dot) dot.classList.remove('hidden');
      if (desc) desc.innerText = `🎉 Leo vừa dùng ${stars} ⭐ để đổi [Vé Vàng: ${name}]!`;

      showToast("Vé Vàng Đã Gửi", `Yêu cầu đổi [${name}] đã gửi sang máy mẹ Lan để phê duyệt!`, "🎟️");
    }

    function childRedeemCustomTicket() {
      const inp = document.getElementById('custom-child-ticket-input');
      const val = inp.value.trim();
      if (!val) {
        alert("Vui lòng nhập điều ước Vé Vàng của bạn!");
        return;
      }
      childRedeemTicket(val, 200);
      inp.value = "";
    }


