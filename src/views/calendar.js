import { CalendarGrid } from '../components/calendar-grid.js';
import { showModal, showTeleprompterModal } from '../components/modal.js';
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
        (กดที่การ์ดคอนเทนต์เพื่อแก้ไขรายละเอียดและเปิด Teleprompter ได้ทันที | สลับมุมมอง Month / Week / Day View ได้ที่มุมขวาบน)
      </p>
    </div>
  `;
  card.appendChild(cardHeader);

  const calWrapper = document.createElement('div');
  calWrapper.className = 'cal-wrapper';
  const calContainer = document.createElement('div');
  calWrapper.appendChild(calContainer);
  card.appendChild(calWrapper);
  container.appendChild(card);

  function renderGrid() {
    calContainer.innerHTML = '';
    CalendarGrid(calContainer, {
      statusOptions: store.getSettingList('contentStatuses') || [],
      getItems: (year, month, statusFilter) => {
        return store.getContentForMonth(year, month, statusFilter);
      },
      onDayClick: (dateStr) => {
        showToast(`Date selected: ${dateStr}`, 'info');
      },
      onItemClick: (item) => {
        openCalendarItemModal(item.id);
      }
    });
  }

  function openCalendarItemModal(rowId) {
    const fullItem = store.getContentItem(rowId) || {};
    const products = store.getProducts() || [];
    const contentTypes = store.getSettingList('contentTypes') || [];
    const contentAngles = store.getSettingList('contentAngles') || [];
    const contentPillars = store.getSettingList('contentPillars') || [];
    const channels = store.getSettingList('channels') || [];
    const ctaTypes = store.getSettingList('ctaTypes') || [];
    const contentStatuses = store.getSettingList('contentStatuses') || [];

    const modal = showModal({
      title: `📝 Edit Content: ${esc(rowId)}`,
      body: `
        <div class="calendar-edit-popup" style="font-size:0.88rem; line-height:1.5;">
          <!-- Top Action Bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:8px; flex-wrap:wrap; background:var(--c-bg); padding:10px 12px; border-radius:8px; border:1px solid var(--c-border);">
            <button type="button" class="btn btn-primary btn-sm btn-open-teleprompter" style="background:#8B5CF6; border-color:#7C3AED; font-weight:700; font-size:0.85rem; padding:6px 14px; border-radius:6px; display:inline-flex; align-items:center; gap:6px;">
              🎬 Teleprompter (อ่านบท)
            </button>
            <button type="button" class="btn btn-danger btn-sm btn-delete-cal-item" data-id="${esc(rowId)}" style="font-weight:700; font-size:0.8rem; padding:5px 12px; border-radius:6px;">
              🗑️ ลบรายการนี้
            </button>
          </div>

          <!-- Cover Image Preview if exists -->
          ${fullItem.coverUrl ? `
            <div style="text-align:center; margin-bottom:12px;">
              <img src="${esc(fullItem.coverUrl)}" style="max-height:160px; max-width:100%; object-fit:contain; border-radius:8px; border:1px solid var(--c-border);">
            </div>
          ` : ''}

          <!-- Editable Fields Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
            <div style="grid-column: span 2;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Title / หัวข้อคอนเทนต์</label>
              <input type="text" class="form-input cal-field" data-field="title" value="${esc(fullItem.title || '')}" placeholder="ระบุชื่อคอนเทนต์..." style="width:100%;">
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Status / สถานะ</label>
              <select class="form-select cal-field" data-field="status" style="width:100%;">
                <option value="">-- เลือกสถานะ --</option>
                ${contentStatuses.map(s => `<option value="${esc(s)}" ${fullItem.status === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Published Date / วันที่เผยแพร่</label>
              <input type="date" class="form-input cal-field" data-field="publishedDate" value="${esc(fullItem.publishedDate || '')}" style="width:100%;">
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Content Type / ประเภท</label>
              <select class="form-select cal-field" data-field="contentType" style="width:100%;">
                <option value="">-- เลือกประเภท --</option>
                ${contentTypes.map(t => `<option value="${esc(t)}" ${fullItem.contentType === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Product / สินค้าที่เกี่ยวข้อง</label>
              <select class="form-select cal-field" data-field="productId" style="width:100%;">
                <option value="">-- เลือกสินค้า --</option>
                ${products.map(p => `<option value="${esc(p.id)}" ${fullItem.productId === p.id ? 'selected' : ''}>${esc(p.name || p.id)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Channel / ช่องทาง</label>
              <select class="form-select cal-field" data-field="channel" style="width:100%;">
                <option value="">-- เลือกช่องทาง --</option>
                ${channels.map(c => `<option value="${esc(c)}" ${fullItem.channel === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Content Angle / มุมขาย</label>
              <select class="form-select cal-field" data-field="contentAngle" style="width:100%;">
                <option value="">-- เลือกมุมขาย --</option>
                ${contentAngles.map(a => `<option value="${esc(a)}" ${fullItem.contentAngle === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Content Pillar / เสาหลัก</label>
              <select class="form-select cal-field" data-field="contentPillar" style="width:100%;">
                <option value="">-- เลือก Pillar --</option>
                ${contentPillars.map(p => `<option value="${esc(p)}" ${fullItem.contentPillar === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">CTA Type / ประเภท CTA</label>
              <select class="form-select cal-field" data-field="ctaType" style="width:100%;">
                <option value="">-- เลือก CTA --</option>
                ${ctaTypes.map(cta => `<option value="${esc(cta)}" ${fullItem.ctaType === cta ? 'selected' : ''}>${esc(cta)}</option>`).join('')}
              </select>
            </div>

            <div style="grid-column: span 2;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Published URL / ลิงก์ที่เผยแพร่แล้ว</label>
              <input type="url" class="form-input cal-field" data-field="publishedUrl" value="${esc(fullItem.publishedUrl || '')}" placeholder="https://..." style="width:100%;">
            </div>
          </div>

          <!-- Hook Textarea -->
          <div style="margin-bottom:12px;">
            <label style="font-size:0.8rem; font-weight:700; color:#D97706; display:block; margin-bottom:3px;">🪝 Hook (คำเกริ่นเปิดคลิป)</label>
            <textarea class="form-input cal-field cal-hook-input" data-field="hook" rows="2" style="width:100%; border-left:3px solid #F59E0B;" placeholder="เขียน Hook ดึงดูดผู้ชมที่นี่...">${esc(fullItem.hook || '')}</textarea>
          </div>

          <!-- Script Textarea -->
          <div style="margin-bottom:12px;">
            <label style="font-size:0.8rem; font-weight:700; color:#4F46E5; display:block; margin-bottom:3px;">📜 Script & Content Outline</label>
            <textarea class="form-input cal-field cal-script-textarea" data-field="script" rows="4" style="width:100%; border-left:3px solid #6366F1;" placeholder="เขียนบทพูดหรือรายละเอียดคอนเทนต์ที่นี่...">${esc(fullItem.script || '')}</textarea>
          </div>

          <!-- Performance Notes -->
          <div>
            <label style="font-size:0.8rem; font-weight:700; color:var(--c-muted); display:block; margin-bottom:3px;">Performance Notes / บันทึกผลลัพธ์</label>
            <input type="text" class="form-input cal-field" data-field="performanceNotes" value="${esc(fullItem.performanceNotes || '')}" placeholder="บันทึกยอดวิว หรือข้อสังเกต..." style="width:100%;">
          </div>
        </div>
      `,
      confirmText: '💾 Save / บันทึกการแก้ไข',
      cancelText: '❌ Close / ปิด',
      onConfirm: () => {
        // Collect all values from modal inputs
        modal.element.querySelectorAll('.cal-field').forEach(input => {
          const field = input.dataset.field;
          const val = input.value;
          store.updateContent(rowId, field, val);
        });
        showToast(`Saved changes for ${rowId}! 💾`, 'success');
        renderGrid();
      }
    });

    // Wire Real-time auto sync or button events inside modal
    if (modal && modal.element) {
      // Auto save field on change
      modal.element.querySelectorAll('.cal-field').forEach(input => {
        input.addEventListener('change', (e) => {
          const field = e.target.dataset.field;
          const val = e.target.value;
          store.updateContent(rowId, field, val);
          renderGrid();
        });
      });

      // Teleprompter button click
      const tpBtn = modal.element.querySelector('.btn-open-teleprompter');
      if (tpBtn) {
        tpBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const hookInput = modal.element.querySelector('.cal-hook-input');
          const scriptArea = modal.element.querySelector('.cal-script-textarea');
          const titleInput = modal.element.querySelector('[data-field="title"]');

          const hVal = hookInput ? hookInput.value.trim() : (fullItem.hook || '').trim();
          const sVal = scriptArea ? scriptArea.value.trim() : (fullItem.script || '').trim();
          const tVal = titleInput ? titleInput.value.trim() : (fullItem.title || rowId);

          const hookPart = hVal ? `🪝 Hook:\n${hVal}\n\n` : '';
          const fullText = hookPart + sVal;
          showTeleprompterModal(`🎬 ${tVal}`, fullText);
        });
      }

      // Delete button click
      const delBtn = modal.element.querySelector('.btn-delete-cal-item');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm(`Delete content ${rowId}? คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?`)) {
            store.deleteContent(rowId);
            showToast(`Deleted ${rowId} successfully! 🗑️`, 'info');
            modal.close();
            renderGrid();
          }
        });
      }
    }
  }

  renderGrid();
}

export function render(container, store) {
  renderCalendar(container, store);
}
