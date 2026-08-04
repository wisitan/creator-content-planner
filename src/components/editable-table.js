/* ──────────────────────────────────────────
   Reusable Editable Table Component (With Drag-to-Reorder Columns, Modal Script Editor & Image Upload Thumbnail)
   ────────────────────────────────────────── */
import { esc, resizeImageFile } from '../utils.js';
import { showModal } from './modal.js';
import { showToast } from './toast.js';

export function EditableTable(container, config) {
  const {
    columns: initialColumns, data, onChange, onAdd, onDelete,
    addLabel = '+ Add',
    emptyText = 'No data yet',
    emptyIcon = '📭',
    idField = 'id',
  } = config;

  let columns = [...initialColumns];
  let searchTerm = '';
  let sortCol = null;
  let sortAsc = true;
  let draggedColIdx = null;

  function getFilteredData() {
    let filtered = [...data];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(col => {
          const val = col.compute ? col.compute(row) : (row[col.key] ?? '');
          return String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortCol) {
      filtered.sort((a, b) => {
        const va = a[sortCol] ?? '';
        const vb = b[sortCol] ?? '';
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortAsc ? cmp : -cmp;
      });
    }
    return filtered;
  }

  function render() {
    const filtered = getFilteredData();

    container.innerHTML = '';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'table-toolbar';
    toolbar.innerHTML = `
      <div class="search-box">
        <input type="text" placeholder="Search... ค้นหา" value="${esc(searchTerm)}" id="etable-search">
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="text-muted" style="font-size:.8rem;">${filtered.length} items (ลากหัวคอลัมน์เพื่อสลับลำดับได้)</span>
        ${onAdd ? `<button class="btn btn-primary btn-sm" id="etable-add">${addLabel}</button>` : ''}
      </div>
    `;
    container.appendChild(toolbar);

    if (filtered.length === 0) {
      container.innerHTML += `
        <div class="empty-state">
          <div class="empty-icon">${emptyIcon}</div>
          <p>${emptyText}</p>
          ${onAdd ? `<button class="btn btn-primary" id="etable-add-empty">${addLabel}</button>` : ''}
        </div>
      `;
      wireEvents();
      return;
    }

    // Table
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    let html = '<table class="etable"><thead><tr>';

    // Headers with draggable attribute
    columns.forEach((col, idx) => {
      const w = col.width ? ` style="width:${col.width}"` : '';
      const sortIcon = sortCol === col.key ? (sortAsc ? ' ▲' : ' ▼') : '';
      html += `<th draggable="true" data-col-idx="${idx}" data-sort="${col.key}"${w} title="Drag to reorder column">${esc(col.label)}${sortIcon}</th>`;
    });
    if (onDelete) html += '<th style="width:44px"></th>';
    html += '</tr></thead><tbody>';

    // Rows
    filtered.forEach(row => {
      html += `<tr data-id="${esc(row[idField])}">`;
      columns.forEach(col => {
        html += '<td>';
        html += renderCell(row, col);
        html += '</td>';
      });
      if (onDelete) {
        html += `<td class="row-actions"><button class="btn-delete-row" data-action="delete" title="Delete">🗑️</button></td>`;
      }
      html += '</tr>';
    });

    html += '</tbody></table>';
    wrapper.innerHTML = html;
    container.appendChild(wrapper);

    wireEvents();
  }

  function renderCell(row, col) {
    const val = row[col.key] ?? '';
    const editable = col.editable !== false;

    // Computed / display-only
    if (col.type === 'computed' && col.compute) {
      return `<span class="text-muted">${esc(col.compute(row))}</span>`;
    }

    // Modal Script / Large Text Editor Trigger
    if (col.type === 'scriptModal') {
      const preview = val ? val.slice(0, 30) + (val.length > 30 ? '...' : '') : '📝 Open Script / Edit Details';
      const hasContentClass = val ? 'btn-primary' : 'btn-secondary';
      return `<button class="btn ${hasContentClass} btn-sm btn-script-modal" data-field="${col.key}" style="width:100%; text-align:left; justify-content:flex-start; overflow:hidden;">📄 ${esc(preview)}</button>`;
    }

    // Image Upload & Thumbnail Cell
    if (col.type === 'image') {
      const imgHtml = val 
        ? `<img src="${esc(val)}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1;" title="Click upload to replace">` 
        : `<div style="width:40px; height:40px; background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#94a3b8;">No img</div>`;
      return `
        <div style="display:flex; align-items:center; gap:6px;">
          ${imgHtml}
          <label class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:0.72rem; cursor:pointer;" title="Upload & Auto-resize Image">
            🖼️ Upload
            <input type="file" accept="image/*" class="img-upload-input" data-field="${col.key}" style="display:none;">
          </label>
        </div>
      `;
    }

    if (!editable) {
      return `<span>${esc(val)}</span>`;
    }

    // Dropdown
    if (col.type === 'dropdown') {
      const opts = typeof col.options === 'function' ? col.options() : (col.options || []);
      const badgeObj = col.badge ? col.badge(val) : null;
      const badgeClass = badgeObj ? badgeObj.class : '';
      let h = `<select data-field="${col.key}" class="${badgeClass}">`;
      h += `<option value="">—</option>`;
      opts.forEach(o => {
        h += `<option value="${esc(o)}"${o === val ? ' selected' : ''}>${esc(o)}</option>`;
      });
      h += '</select>';
      return h;
    }

    // Checkbox
    if (col.type === 'checkbox') {
      return `<input type="checkbox" data-field="${col.key}" ${val ? 'checked' : ''}>`;
    }

    // Date
    if (col.type === 'date') {
      return `<input type="date" data-field="${col.key}" value="${esc(val)}">`;
    }

    // Number
    if (col.type === 'number') {
      return `<input type="number" data-field="${col.key}" value="${esc(val)}" step="any">`;
    }

    // URL
    if (col.type === 'url') {
      return `<input type="url" data-field="${col.key}" value="${esc(val)}" placeholder="https://...">`;
    }

    // Textarea
    if (col.type === 'textarea') {
      return `<textarea data-field="${col.key}" rows="1">${esc(val)}</textarea>`;
    }

    // Default: text
    return `<input type="text" data-field="${col.key}" value="${esc(val)}">`;
  }

  function wireEvents() {
    // Search
    const searchInput = container.querySelector('#etable-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
        const newSearch = container.querySelector('#etable-search');
        if (newSearch) { newSearch.focus(); newSearch.selectionStart = newSearch.selectionEnd = searchTerm.length; }
      });
    }

    // Add
    const addBtn = container.querySelector('#etable-add') || container.querySelector('#etable-add-empty');
    if (addBtn && onAdd) {
      addBtn.addEventListener('click', () => { onAdd(); render(); });
    }

    const table = container.querySelector('.etable');
    if (!table) return;

    // Header Drag & Drop Reordering Logic
    const ths = table.querySelectorAll('th[draggable="true"]');
    ths.forEach(th => {
      th.addEventListener('dragstart', (e) => {
        draggedColIdx = parseInt(e.target.dataset.colIdx);
        e.dataTransfer.effectAllowed = 'move';
        th.style.opacity = '0.5';
      });

      th.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      th.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetTh = e.target.closest('th');
        if (!targetTh || targetTh.dataset.colIdx === undefined) return;
        const targetColIdx = parseInt(targetTh.dataset.colIdx);
        if (draggedColIdx !== null && draggedColIdx !== targetColIdx) {
          const movedCol = columns.splice(draggedColIdx, 1)[0];
          columns.splice(targetColIdx, 0, movedCol);
          render();
        }
      });

      th.addEventListener('dragend', (e) => {
        th.style.opacity = '1';
        draggedColIdx = null;
      });

      // Header click for sorting (only if not dragging)
      th.addEventListener('click', (e) => {
        const col = th.dataset.sort;
        if (!col) return;
        if (sortCol === col) sortAsc = !sortAsc;
        else { sortCol = col; sortAsc = true; }
        render();
      });
    });

    // Input/select/textarea/image changes
    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.addEventListener('input', handleChange);
      tbody.addEventListener('change', async (e) => {
        // Image File Upload Handler
        if (e.target.classList.contains('img-upload-input')) {
          const file = e.target.files[0];
          if (!file) return;
          const tr = e.target.closest('tr');
          const id = tr.dataset.id;
          const field = e.target.dataset.field;
          try {
            const dataUrl = await resizeImageFile(file, 100);
            if (onChange) onChange(id, field, dataUrl);
            const row = data.find(item => item[idField] === id);
            if (row) row[field] = dataUrl;
            showToast('Image uploaded & auto-resized! 🖼️', 'success');
            render();
          } catch (err) {
            showToast('Upload error: ' + err.message, 'error');
          }
          return;
        }

        handleChange(e);
        if (e.target.tagName === 'SELECT') {
          render();
        }
      });

      tbody.addEventListener('click', (e) => {
        // Script / Details Modal Trigger
        const btnScript = e.target.closest('.btn-script-modal');
        if (btnScript) {
          const tr = btnScript.closest('tr');
          const id = tr.dataset.id;
          const field = btnScript.dataset.field;
          const row = data.find(item => item[idField] === id);
          if (row) {
            openScriptModal(row, field);
          }
          return;
        }

        // Delete
        if (e.target.dataset.action === 'delete') {
          const tr = e.target.closest('tr');
          if (tr && onDelete) {
            onDelete(tr.dataset.id);
            render();
          }
        }
      });
    }
  }

  function openScriptModal(row, field) {
    const bodyContent = document.createElement('div');
    bodyContent.innerHTML = `
      <div class="form-group mb-3">
        <label class="form-label" style="font-weight:bold;">Hook / 1-3s Attention Grabber (ส่วนดึงดูดความสนใจ):</label>
        <textarea class="form-textarea script-hook-input" placeholder="ใส่ข้อความเปิดคลิปสั้นๆ..." style="min-height:60px;">${esc(row.hook || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" style="font-weight:bold;">Full Script / Outline & Content Details (เนื้อหา/บทพูดฉบับเต็ม):</label>
        <textarea class="form-textarea script-full-input" placeholder="ใส่สคริปต์ บทพูด ลำดับฉาก หรือเนื้อหาแบบยาวๆ ได้ไม่จำกัด..." style="min-height:220px; line-height:1.6;"></textarea>
      </div>
    `;

    bodyContent.querySelector('.script-full-input').value = row.script || '';

    showModal({
      title: `📝 Script & Content Editor — [${row.id || 'Content'}]`,
      body: bodyContent,
      confirmText: '💾 Save Script / บันทึก',
      cancelText: 'Cancel',
      onConfirm: (modalBody) => {
        const newHook = modalBody.querySelector('.script-hook-input').value;
        const newScript = modalBody.querySelector('.script-full-input').value;
        
        if (onChange) {
          onChange(row[idField], 'hook', newHook);
          onChange(row[idField], 'script', newScript);
        }
        row.hook = newHook;
        row.script = newScript;
        render();
      }
    });
  }

  function handleChange(e) {
    const el = e.target;
    const field = el.dataset.field;
    if (!field || !onChange) return;
    const tr = el.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;
    let value;
    if (el.type === 'checkbox') value = el.checked;
    else if (el.type === 'number') value = el.value;
    else value = el.value;
    onChange(id, field, value);
  }

  // Initial render
  render();

  return { render };
}

/** Helper: get badge class for content type */
export function contentTypeBadge(val) {
  const map = {
    '🛒 Affiliate':     { class: 'badge-affiliate' },
    '🎯 Personal Brand': { class: 'badge-branding' },
    '📚 Knowledge':      { class: 'badge-knowledge' },
    '🤝 Sponsor':        { class: 'badge-sponsor' },
  };
  return map[val] || null;
}

/** Helper: get badge class for content status */
export function statusBadge(val) {
  const map = {
    '💡 Idea':        { class: 'badge-idea' },
    '✍️ Scripting':   { class: 'badge-scripting' },
    '🎬 Filming':     { class: 'badge-filming' },
    '✂️ Editing':     { class: 'badge-editing' },
    '✅ Ready':       { class: 'badge-ready' },
    '📤 Published':   { class: 'badge-published' },
    '❌ Cancelled':   { class: 'badge-cancelled' },
    'To Review':     { class: 'badge-pending' },
    'Approved':      { class: 'badge-scripting' },
    'Active':        { class: 'badge-active' },
    'Paused':        { class: 'badge-paused' },
    'Done':          { class: 'badge-done' },
    'Pending':       { class: 'badge-pending' },
    'Invoiced':      { class: 'badge-scripting' },
    'Paid':          { class: 'badge-published' },
    'Cancelled':     { class: 'badge-cancelled' },
  };
  return map[val] || null;
}
