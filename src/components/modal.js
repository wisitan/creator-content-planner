/* ──────────────────────────────────────────
   Modal Component
   ────────────────────────────────────────── */

export function showModal({ 
  title = '', 
  body = '', 
  bodyHtml = '', 
  onConfirm, 
  onCancel,
  confirmText = '', 
  confirmLabel = '', 
  cancelText = '', 
  cancelLabel = '',
  closeOnOutsideClick = false
}) {
  // Remove existing modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const finalBody = body || bodyHtml || '';
  const finalConfirmText = confirmText || confirmLabel || 'Save';
  const finalCancelText = cancelText || cancelLabel || 'Cancel';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" data-action="close">&times;</button>
      </div>
      <div class="modal-body">${typeof finalBody === 'string' ? finalBody : ''}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="close">${finalCancelText}</button>
        ${onConfirm ? `<button class="btn btn-primary" data-action="confirm">${finalConfirmText}</button>` : ''}
      </div>
    </div>
  `;

  // If body is a DOM element, append it
  if (typeof finalBody !== 'string' && finalBody instanceof HTMLElement) {
    overlay.querySelector('.modal-body').innerHTML = '';
    overlay.querySelector('.modal-body').appendChild(finalBody);
  }

  document.body.appendChild(overlay);

  // Close handlers
  const close = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    if (closeOnOutsideClick && e.target === overlay) {
      if (onCancel) onCancel();
      close();
      return;
    }
    if (e.target.dataset.action === 'close') {
      if (onCancel) onCancel();
      close();
      return;
    }
    if (e.target.dataset.action === 'confirm' && onConfirm) {
      onConfirm(overlay.querySelector('.modal-body'));
      close();
      return;
    }
  });

  return { close, element: overlay };
}

/** Convenience: Image Preview Modal */
export function showImageModal(imgUrl, title = '🖼️ Photo Preview / ดูรูปภาพขนาดใหญ่', onDelete) {
  if (!imgUrl) return;
  const modal = showModal({
    title,
    body: `
      <div style="text-align:center; padding:10px;">
        <img src="${imgUrl}" style="max-width:100%; max-height:65vh; object-fit:contain; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.25);">
        ${onDelete ? `
          <div style="margin-top:14px;">
            <button id="modal-btn-delete-img" class="btn btn-danger btn-sm">🗑️ Delete Photo / ลบรูปภาพนี้</button>
          </div>
        ` : ''}
      </div>
    `,
    cancelText: '❌ Close / ปิด',
  });

  if (onDelete && modal.element) {
    const delBtn = modal.element.querySelector('#modal-btn-delete-img');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้? (Delete this photo?)')) {
          onDelete();
          modal.close();
        }
      });
    }
  }
}

/** Convenience: confirm dialog */
export function confirmDialog(message) {
  return new Promise((resolve) => {
    const modal = showModal({
      title: 'Confirm / ยืนยัน',
      body: `<p style="font-size:1rem; margin:10px 0;">${message}</p>`,
      confirmText: 'Yes / ใช่',
      cancelText: 'No / ไม่',
      onConfirm: () => resolve(true),
    });

    if (modal.element) {
      const cancelBtn = modal.element.querySelector('[data-action="close"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => resolve(false));
      }
    }
    // If modal closed without confirm, resolve false
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) resolve(false);
    });
  });
}

/** Convenience: Teleprompter Modal for Filming */
export function showTeleprompterModal(title = '🎬 Teleprompter / โหมดอ่านบทอัดคลิป', scriptText = '') {
  if (!scriptText || !scriptText.trim()) {
    showToast('กรุณากรอกสคริปต์ก่อนเปิดโหมด Teleprompter นะคะ ⚠️', 'warning');
    return;
  }

  // Remove existing teleprompter
  const existing = document.querySelector('.teleprompter-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'teleprompter-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #09090b; color: #ffffff; z-index: 99999;
    display: flex; flex-direction: column; font-family: system-ui, -apple-system, sans-serif;
    user-select: none; box-sizing: border-box; overflow: hidden;
  `;

  overlay.innerHTML = `
    <!-- Top Floating Control Bar -->
    <div class="teleprompter-header" style="
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 24px; background: #121215; border-bottom: 1px solid #27272a;
      z-index: 10; font-size: 0.9rem; flex-wrap: wrap; gap: 12px;
    ">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-weight:700; color:#a855f7; font-size:1.1rem;">🎬 Teleprompter</span>
        <span style="color:#71717a; font-size:0.85rem; max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</span>
      </div>

      <!-- Controls Group -->
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        
        <!-- Play/Pause -->
        <button id="tp-btn-play" style="
          background: #8b5cf6; color: #fff; border: none; padding: 6px 16px; border-radius: 20px;
          font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.95rem;
        ">
          <span id="tp-play-icon">▶️</span> <span id="tp-play-text">Play (Space)</span>
        </button>

        <!-- Speed Slider -->
        <div style="display:flex; align-items:center; gap:6px; background:#18181b; padding:4px 12px; border-radius:16px; border:1px solid #27272a;">
          <span style="color:#a1a1aa; font-size:0.85rem;">⚡ Speed:</span>
          <input type="range" id="tp-speed" min="1" max="10" value="3" style="width:70px; cursor:pointer;">
          <span id="tp-speed-val" style="color:#38bdf8; font-weight:bold; width:22px; text-align:center;">3x</span>
        </div>

        <!-- Font Size Slider -->
        <div style="display:flex; align-items:center; gap:6px; background:#18181b; padding:4px 12px; border-radius:16px; border:1px solid #27272a;">
          <span style="color:#a1a1aa; font-size:0.85rem;">🔠 Size:</span>
          <input type="range" id="tp-fontsize" min="24" max="64" value="40" style="width:70px; cursor:pointer;">
          <span id="tp-fontsize-val" style="color:#38bdf8; font-weight:bold; width:35px; text-align:center;">40px</span>
        </div>

        <!-- Mirror Mode Button -->
        <button id="tp-btn-mirror" style="
          background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 16px;
          font-size: 0.85rem; cursor: pointer; font-weight: 600;
        " title="Toggle Mirror Mode (สำหรับกระจก Teleprompter)">
          🪞 Mirror: Off
        </button>

        <!-- Restart Button -->
        <button id="tp-btn-restart" style="
          background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 16px;
          font-size: 0.85rem; cursor: pointer;
        ">
          🔄 Top
        </button>

        <!-- Close Button -->
        <button id="tp-btn-close" style="
          background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 16px;
          font-weight: 700; cursor: pointer; font-size: 0.9rem;
        ">
          ❌ Exit
        </button>

      </div>
    </div>

    <!-- Teleprompter Screen Container -->
    <div id="tp-screen" style="
      flex: 1; overflow-y: auto; position: relative; padding: 45vh 10vw;
      text-align: center; scroll-behavior: smooth; cursor: pointer;
    ">
      <!-- Eye Line Guide Overlay -->
      <div style="
        position: fixed; top: 50%; left: 0; width: 100%; height: 60px;
        transform: translateY(-50%); background: rgba(168, 85, 247, 0.12);
        border-top: 1px dashed rgba(168, 85, 247, 0.4);
        border-bottom: 1px dashed rgba(168, 85, 247, 0.4);
        pointer-events: none; z-index: 5;
      "></div>

      <!-- Script Text Render Area -->
      <div id="tp-content" style="
        font-size: 40px; line-height: 1.7; font-weight: 700;
        color: #fef08a; text-shadow: 0 4px 12px rgba(0,0,0,0.8);
        transition: font-size 0.15s ease, transform 0.2s ease;
        white-space: pre-wrap; word-break: break-word; max-width: 1000px; margin: 0 auto;
      "></div>
    </div>

    <!-- Bottom Instruction Bar -->
    <div style="
      padding: 6px; background: #000; text-align: center; font-size: 0.75rem; color: #71717a; border-top: 1px solid #18181b;
    ">
      💡 Tip: กด Spacebar หรือแตะหน้าจอเพื่อ Play / Pause | ใช้ลูกศร ↑ ↓ ปรับความเร็ว | กด Esc เพื่อปิดโหมด
    </div>
  `;

  overlay.querySelector('#tp-content').textContent = scriptText;
  document.body.appendChild(overlay);

  // Teleprompter Control State
  let isPlaying = false;
  let scrollSpeed = 3; // 1 to 10
  let isMirrored = false;
  let scrollInterval = null;

  const screenEl = overlay.querySelector('#tp-screen');
  const contentEl = overlay.querySelector('#tp-content');
  const playBtn = overlay.querySelector('#tp-btn-play');
  const playIcon = overlay.querySelector('#tp-play-icon');
  const playText = overlay.querySelector('#tp-play-text');
  const speedInput = overlay.querySelector('#tp-speed');
  const speedVal = overlay.querySelector('#tp-speed-val');
  const fontSizeInput = overlay.querySelector('#tp-fontsize');
  const fontSizeVal = overlay.querySelector('#tp-fontsize-val');
  const mirrorBtn = overlay.querySelector('#tp-btn-mirror');
  const restartBtn = overlay.querySelector('#tp-btn-restart');
  const closeBtn = overlay.querySelector('#tp-btn-close');

  const togglePlay = () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playIcon.textContent = '⏸️';
      playText.textContent = 'Pause';
      playBtn.style.background = '#eab308';
      startAutoScroll();
    } else {
      playIcon.textContent = '▶️';
      playText.textContent = 'Play';
      playBtn.style.background = '#8b5cf6';
      stopAutoScroll();
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    scrollInterval = setInterval(() => {
      if (screenEl) {
        screenEl.scrollTop += (scrollSpeed * 0.8);
      }
    }, 30);
  };

  const stopAutoScroll = () => {
    if (scrollInterval) clearInterval(scrollInterval);
  };

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  screenEl.addEventListener('click', (e) => {
    if (e.target.closest('.teleprompter-header')) return;
    togglePlay();
  });

  speedInput.addEventListener('input', (e) => {
    scrollSpeed = parseInt(e.target.value, 10);
    speedVal.textContent = scrollSpeed + 'x';
    if (isPlaying) startAutoScroll();
  });

  fontSizeInput.addEventListener('input', (e) => {
    const sz = e.target.value;
    fontSizeVal.textContent = sz + 'px';
    contentEl.style.fontSize = sz + 'px';
  });

  mirrorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMirrored = !isMirrored;
    if (isMirrored) {
      contentEl.style.transform = 'scaleX(-1)';
      mirrorBtn.textContent = '🪞 Mirror: On';
      mirrorBtn.style.background = '#8b5cf6';
    } else {
      contentEl.style.transform = 'scaleX(1)';
      mirrorBtn.textContent = '🪞 Mirror: Off';
      mirrorBtn.style.background = '#27272a';
    }
  });

  restartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (screenEl) screenEl.scrollTop = 0;
  });

  const close = () => {
    stopAutoScroll();
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
  };

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  const onKeyDown = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowUp') {
      scrollSpeed = Math.min(10, scrollSpeed + 1);
      speedInput.value = scrollSpeed;
      speedVal.textContent = scrollSpeed + 'x';
      if (isPlaying) startAutoScroll();
    } else if (e.key === 'ArrowDown') {
      scrollSpeed = Math.max(1, scrollSpeed - 1);
      speedInput.value = scrollSpeed;
      speedVal.textContent = scrollSpeed + 'x';
      if (isPlaying) startAutoScroll();
    }
  };

  document.addEventListener('keydown', onKeyDown);
}
