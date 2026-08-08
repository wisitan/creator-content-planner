import { CalendarGrid } from '../components/calendar-grid.js';
import { showToast } from '../components/toast.js';
import { esc } from '../utils.js';
import { t } from '../i18n.js';

export function renderCalendar(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>📅 ${t('cal_title')}</h2>
      <p class="text-muted">${t('cal_subtitle')}</p>
    </div>
  `;
  container.appendChild(header);

  const calContainer = document.createElement('div');
  calContainer.className = 'card view-enter p-3';
  container.appendChild(calContainer);

  const contentStatuses = store.getSettingList('contentStatuses') || [];

  CalendarGrid(calContainer, {
    statusOptions: contentStatuses,
    getItems: (year, month, statusFilter = 'ALL', dateTypeFilter = { showPlanned: true, showPublished: true }) => {
      const items = store.getContentForMonth(year, month, statusFilter, dateTypeFilter);
      return items.map(c => ({
        id: c.id,
        displayId: c.displayId,
        title: c.title || c.hook || c.contentAngle || c.id,
        contentType: c.contentType,
        activeDate: c.activeDate,
        dateType: c.dateType,
        status: c.status,
        channel: c.channel,
        productName: store.getProductName(c.productId),
        script: c.script || c.hook || ''
      }));
    },
    onDayClick: (dateStr) => {
      showToast(`Selected Date: ${dateStr}`, 'info');
    },
    onItemClick: (item) => {
      const c = store.getContent().find(x => String(x.id).trim() === String(item.id).trim());
      if (!c) return;
      
      const prodName = store.getProductName(c.productId);
      const titleText = c.title || c.hook || c.id;
      const isPublishedEntry = item.dateType === 'published';

      // Show Rich Content Item Modal with Premium Balanced Layout & Generous Padding
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay open';
      modalOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.82) !important; z-index:99999; display:flex; align-items:center; justify-content:center; padding:24px;';

      modalOverlay.innerHTML = `
        <div class="modal-card-solid" style="width:100%; max-width:580px; max-height:88vh; overflow-y:auto; border-radius:20px; padding:28px 32px; position:relative; z-index:100000; animation: modalEnter 0.2s ease-out;">
          
          <!-- Modal Header (Spacious Layout) -->
          <div class="border-bottom pb-3 mb-4" style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                <span class="badge badge-blue" style="font-size:0.82rem; font-weight:700; padding:4px 10px;">${esc(c.id)}</span>
                ${isPublishedEntry 
                  ? `<span class="badge" style="background:#10B981; color:#fff; font-weight:700; font-size:0.78rem; padding:4px 10px;">🟢 Published Date pin</span>`
                  : `<span class="badge" style="background:#F97316; color:#fff; font-weight:700; font-size:0.78rem; padding:4px 10px;">🟠 Planned Date pin</span>`
                }
              </div>
              <h3 style="margin:0; font-size:1.25rem; font-weight:800; line-height:1.35; color:var(--c-text);">
                ${esc(titleText)}
              </h3>
            </div>

            <button id="btn-close-cal-item-modal" type="button" class="btn btn-secondary" style="border-radius:50%; width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:700; flex-shrink:0;">
              ✕
            </button>
          </div>

          <!-- Metadata Grid (2 Columns, Inset Card Boxes, No edge stretching) -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap:12px;" class="mb-4">
            
            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Status:</span>
              <span class="badge badge-green" style="font-weight:700; font-size:0.8rem;">${esc(c.status || '-')}</span>
            </div>

            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Content Type:</span>
              <span style="font-weight:700; font-size:0.83rem; color:var(--c-primary);">${esc(c.contentType || '-')}</span>
            </div>

            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Planned Date:</span>
              <span style="font-weight:700; font-size:0.83rem; color:#F97316;">🟠 ${esc(c.plannedDate || '-')}</span>
            </div>

            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Published Date:</span>
              <span style="font-weight:700; font-size:0.83rem; color:#10B981;">🟢 ${esc(c.publishedDate || '-')}</span>
            </div>

            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; grid-column: 1 / -1; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Product:</span>
              <span style="font-weight:700; font-size:0.85rem;">📦 ${esc(prodName)}</span>
            </div>

            <div class="p-2.5" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; grid-column: 1 / -1; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">Channel:</span>
              <span style="font-weight:700; font-size:0.85rem;">📺 ${esc(c.channel || '-')}</span>
            </div>

          </div>

          <!-- Script & Outline Preview Box (Generous Inset Padding) -->
          ${c.script ? `
            <div class="p-3.5 mb-4" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:14px;">
              <div style="font-size:0.82rem; font-weight:800; color:var(--c-primary); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                📜 Script & Outline Preview:
              </div>
              <div style="font-size:0.88rem; color:var(--c-text); white-space:pre-wrap; line-height:1.55; max-height:160px; overflow-y:auto; padding-right:4px;">${esc(c.script)}</div>
            </div>
          ` : ''}

          <!-- Modal Footer Buttons -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid var(--c-border); padding-top:20px; margin-top:10px;">
            <a href="#content" class="btn btn-secondary btn-sm" id="btn-go-to-content" style="font-weight:700; padding:8px 16px; border-radius:10px;">
              📝 Go to Content Planner
            </a>
            <button id="btn-dismiss-cal-item-modal" type="button" class="btn btn-primary btn-sm" style="padding:8px 24px; font-weight:700; border-radius:10px;">
              OK / Close
            </button>
          </div>

        </div>
      `;

      document.body.appendChild(modalOverlay);

      const closeModal = () => {
        if (modalOverlay && modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      };

      modalOverlay.querySelector('#btn-close-cal-item-modal').addEventListener('click', closeModal);
      modalOverlay.querySelector('#btn-dismiss-cal-item-modal').addEventListener('click', closeModal);
      const btnGo = modalOverlay.querySelector('#btn-go-to-content');
      if (btnGo) btnGo.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }
  });
}

export function render(container, store) {
  renderCalendar(container, store);
}
