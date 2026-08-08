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

      // Show Rich Content Item Modal with Teleprompter option
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay open';
      modalOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); p:16px;';

      modalOverlay.innerHTML = `
        <div class="card p-4" style="width:100%; max-width:520px; max-height:85vh; overflow-y:auto; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.3); background:var(--c-surface); border:1px solid var(--c-border); animation: modalEnter 0.2s ease-out;">
          
          <div class="flex-between border-bottom pb-3 mb-3">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge badge-blue mb-1" style="font-size:0.8rem; font-weight:700;">${esc(c.id)}</span>
                ${isPublishedEntry 
                  ? `<span class="badge" style="background:#10B981; color:#fff; font-weight:700; font-size:0.75rem;">🟢 Published Date pin</span>`
                  : `<span class="badge" style="background:#F97316; color:#fff; font-weight:700; font-size:0.75rem;">🟠 Planned Date pin</span>`
                }
              </div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--c-text);">
                ${esc(titleText)}
              </h3>
            </div>
            <button id="btn-close-cal-item-modal" type="button" class="btn btn-secondary" style="border-radius:50%; width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:700;">
              ✕
            </button>
          </div>

          <div class="mb-4" style="display:flex; flex-direction:column; gap:10px; font-size:0.9rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Status:</span>
              <span class="badge badge-green" style="font-weight:700;">${esc(c.status || '-')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Planned Date:</span>
              <span style="font-weight:700; color:#F97316;">🟠 ${esc(c.plannedDate || '-')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Published Date:</span>
              <span style="font-weight:700; color:#10B981;">🟢 ${esc(c.publishedDate || '-')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Content Type:</span>
              <span style="font-weight:700; color:var(--c-primary);">${esc(c.contentType || '-')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Product:</span>
              <span style="font-weight:700;">📦 ${esc(prodName)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--c-border); padding-bottom:6px;">
              <span class="text-muted" style="font-weight:600;">Channel:</span>
              <span style="font-weight:700;">📺 ${esc(c.channel || '-')}</span>
            </div>

            ${c.script ? `
              <div class="p-3 mt-2" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:10px;">
                <div style="font-size:0.8rem; font-weight:700; color:var(--c-primary); margin-bottom:4px;">📜 Script & Outline Preview:</div>
                <div style="font-size:0.85rem; color:var(--c-text); white-space:pre-wrap; line-height:1.45; max-height:140px; overflow-y:auto;">${esc(c.script)}</div>
              </div>
            ` : ''}
          </div>

          <div class="flex-between border-top pt-3">
            <a href="#content" class="btn btn-secondary btn-sm" id="btn-go-to-content" style="font-weight:700;">
              📝 Go to Content Planner
            </a>
            <button id="btn-dismiss-cal-item-modal" type="button" class="btn btn-primary btn-sm" style="padding:6px 18px; font-weight:700;">
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
