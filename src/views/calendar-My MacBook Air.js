import { CalendarGrid } from '../components/calendar-grid.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { esc } from '../utils.js';

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
        (กดที่การ์ดคอนเทนต์เพื่อเปิด Pop-up ดูรายละเอียดฉบับเต็ม | สลับมุมมอง Month / Week / Day View ได้ที่มุมขวาบน)
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

      showModal({
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
    }
  });
}

export function render(container, store) {
  renderCalendar(container, store);
}
