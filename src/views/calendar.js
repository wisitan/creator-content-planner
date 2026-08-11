import { CalendarGrid } from '../components/calendar-grid.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { esc } from '../utils.js';

function openTeleprompterModal(item) {
  const hookText = item.hook ? `🪝 HOOK:\n${item.hook}\n\n` : '';
  const scriptText = item.script ? `📜 SCRIPT & OUTLINE:\n${item.script}` : (item.hook || 'ยังไม่มีเนื้อหาสคริปต์');
  const fullText = `${hookText}${scriptText}`;

  let isPlaying = false;
  let scrollSpeed = 2; // 1 to 5
  let timerId = null;

  const modalRes = showModal({
    title: `🎥 Teleprompter — ${esc(item.id)}: ${esc(item.title || 'Untitled')}`,
    body: `
      <div class="teleprompter-container" style="background:#0F172A; color:#F8FAFC; padding:16px; border-radius:8px; font-family:var(--font);">
        <!-- Teleprompter Controls Bar -->
        <div class="teleprompter-controls flex-between mb-3 p-2" style="background:#1E293B; border-radius:6px; border:1px solid #334155;">
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="tp-toggle-play" class="btn btn-sm btn-primary" style="padding:4px 12px; font-weight:700;">▶ Play</button>
            <button id="tp-reset" class="btn btn-sm btn-secondary" style="padding:4px 8px;">🔄 Reset</button>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <label style="font-size:0.8rem; font-weight:600; color:#94A3B8;">
              Speed: <span id="tp-speed-val" style="color:#38BDF8;">2x</span>
              <input type="range" id="tp-speed" min="1" max="5" value="2" style="vertical-align:middle; width:70px; cursor:pointer;">
            </label>
            <label style="font-size:0.8rem; font-weight:600; color:#94A3B8;">
              Font Size:
              <input type="range" id="tp-fontsize" min="16" max="36" value="24" style="vertical-align:middle; width:70px; cursor:pointer;">
            </label>
          </div>
        </div>

        <!-- Teleprompter Scrolling Viewport -->
        <div id="tp-viewport" style="height:320px; overflow-y:auto; padding:20px; background:#020617; border-radius:6px; border:1px solid #1E293B; scroll-behavior:smooth;">
          <div id="tp-text-box" style="font-size:24px; line-height:1.6; font-weight:600; white-space:pre-wrap; color:#F8FAFC; text-align:center; padding-bottom:200px;">
${esc(fullText)}
          </div>
        </div>
      </div>
    `,
    confirmText: '❌ Close Teleprompter',
    onConfirm: () => {
      if (timerId) clearInterval(timerId);
    }
  });

  const modalEl = modalRes.element;
  if (!modalEl) return;

  const btnPlay = modalEl.querySelector('#tp-toggle-play');
  const btnReset = modalEl.querySelector('#tp-reset');
  const rangeSpeed = modalEl.querySelector('#tp-speed');
  const rangeFontSize = modalEl.querySelector('#tp-fontsize');
  const speedVal = modalEl.querySelector('#tp-speed-val');
  const viewport = modalEl.querySelector('#tp-viewport');
  const textBox = modalEl.querySelector('#tp-text-box');

  const startScroll = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (viewport) {
        viewport.scrollTop += scrollSpeed;
        if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 10) {
          stopScroll();
        }
      }
    }, 40);
  };

  const stopScroll = () => {
    isPlaying = false;
    if (timerId) clearInterval(timerId);
    if (btnPlay) {
      btnPlay.textContent = '▶ Play';
      btnPlay.className = 'btn btn-sm btn-primary';
    }
  };

  btnPlay?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      btnPlay.textContent = '⏸ Pause';
      btnPlay.className = 'btn btn-sm btn-warning';
      startScroll();
    } else {
      stopScroll();
    }
  });

  btnReset?.addEventListener('click', () => {
    stopScroll();
    if (viewport) viewport.scrollTop = 0;
  });

  rangeSpeed?.addEventListener('input', (e) => {
    scrollSpeed = Number(e.target.value) || 2;
    if (speedVal) speedVal.textContent = `${scrollSpeed}x`;
    if (isPlaying) startScroll();
  });

  rangeFontSize?.addEventListener('input', (e) => {
    const size = e.target.value;
    if (textBox) textBox.style.fontSize = `${size}px`;
  });
}

export function renderCalendar(container, store) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card view-enter';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header';
  cardHeader.innerHTML = `
    <div>
      <h2>📅 Content Calendar / ปฏิทินวางแผนคอนเทนต์</h2>
      <p class="text-muted">
        (กดที่การ์ดคอนเทนต์เพื่อเปิด Pop-up ดูรายละเอียด & อ่านสคริปต์ Teleprompter | สลับมุมมอง Month / Week / Day View ได้ที่มุมขวาบน)
      </p>
    </div>
  `;
  card.appendChild(cardHeader);

  const calContainer = document.createElement('div');
  card.appendChild(calContainer);
  container.appendChild(card);

  CalendarGrid(calContainer, {
    statusOptions: store.getSettingList('contentStatuses') || [],
    getItems: (year, month, statusFilter) => {
      return store.getContentForMonth(year, month, statusFilter);
    },
    onDayClick: (dateStr) => {
      showToast(`Date selected: ${dateStr}`, 'info');
    },
    onItemClick: (item) => {
      const fullItem = store.getContentItem(item.id) || item;
      const productName = store.getProductName(fullItem.productId);

      const modalRes = showModal({
        title: `📝 Content Details: ${esc(fullItem.id)} — ${esc(fullItem.title || 'Untitled')}`,
        body: `
          <div class="content-detail-popup" style="font-size:0.88rem; line-height:1.5;">
            ${fullItem.coverUrl ? `
              <div style="text-align:center; margin-bottom:12px;">
                <img src="${esc(fullItem.coverUrl)}" style="max-height:180px; max-width:100%; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1;">
              </div>
            ` : ''}
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; margin-bottom:12px; background:var(--c-bg); padding:10px; border-radius:6px; border:1px solid var(--c-border);">
              <div><strong>Content ID:</strong> ${esc(fullItem.id)}</div>
              <div><strong>Content Type:</strong> ${esc(fullItem.contentType || '-')}</div>
              <div><strong>Product:</strong> ${esc(productName || fullItem.productId || '-')}</div>
              <div><strong>Content Angle:</strong> ${esc(fullItem.contentAngle || '-')}</div>
              <div><strong>Content Pillar:</strong> ${esc(fullItem.contentPillar || '-')}</div>
              <div><strong>Channel:</strong> ${esc(fullItem.channel || '-')}</div>
              <div><strong>CTA Type:</strong> ${esc(fullItem.ctaType || '-')}</div>
              <div><strong>Status:</strong> ${esc(fullItem.status || '-')}</div>
              <div><strong>Planned Date:</strong> ${esc(fullItem.plannedDate || '-')}</div>
              <div><strong>Published Date:</strong> ${esc(fullItem.publishedDate || '-')}</div>
            </div>

            ${fullItem.publishedUrl ? `
              <div class="mb-2">
                <strong>Published URL:</strong> 
                <a href="${esc(fullItem.publishedUrl)}" target="_blank" style="color:var(--c-primary); word-break:break-all;">${esc(fullItem.publishedUrl)} 🔗</a>
              </div>
            ` : ''}

            ${fullItem.hook ? `
              <div class="mb-2 p-2" style="background:var(--c-bg); border-left:3px solid #F59E0B; border-radius:4px;">
                <strong style="color:#D97706;">🪝 Hook (คำเกริ่นเปิดคลิป):</strong>
                <p class="m-0 mt-1" style="white-space:pre-wrap;">${esc(fullItem.hook)}</p>
              </div>
            ` : ''}

            ${fullItem.script ? `
              <div class="mb-2 p-2" style="background:var(--c-bg); border-left:3px solid #6366F1; border-radius:4px;">
                <strong style="color:#4F46E5;">📜 Script & Content Outline:</strong>
                <p class="m-0 mt-1" style="white-space:pre-wrap; max-height:180px; overflow-y:auto;">${esc(fullItem.script)}</p>
              </div>
            ` : ''}

            ${fullItem.performanceNotes ? `
              <div class="mb-2">
                <strong>Performance Notes:</strong>
                <p class="m-0 text-muted">${esc(fullItem.performanceNotes)}</p>
              </div>
            ` : ''}

            <!-- Teleprompter Trigger Button -->
            <div class="mt-3 p-2 text-center" style="background:var(--c-bg); border-radius:6px; border:1px dashed var(--c-border);">
              <button id="btn-open-teleprompter-cal" class="btn btn-primary" style="background:#8B5CF6; border-color:#7C3AED; font-weight:700; width:100%; font-size:0.92rem;">
                🎥 Open Teleprompter / เปิดกล้องอ่านสคริปต์หน้ากล้อง
              </button>
            </div>
          </div>
        `,
        confirmText: '✏️ Edit in Content Planner',
        cancelText: '❌ Close / ปิด',
        onConfirm: () => {
          window.location.hash = '#content';
          setTimeout(() => {
            const searchInput = document.querySelector('#etable-search');
            if (searchInput) {
              searchInput.value = fullItem.id;
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              showToast(`🎯 Found Row: ${fullItem.id}`, 'success');
            }
          }, 150);
        }
      });

      // Add click listener for Teleprompter button inside modal
      setTimeout(() => {
        const modalEl = modalRes.element;
        if (modalEl) {
          const btnTp = modalEl.querySelector('#btn-open-teleprompter-cal');
          btnTp?.addEventListener('click', () => {
            modalRes.close();
            openTeleprompterModal(fullItem);
          });
        }
      }, 50);
    }
  });
}

export function render(container, store) {
  renderCalendar(container, store);
}
