/* ──────────────────────────────────────────
   Reusable Editable Table Component (With Drag-to-Reorder Columns, Excel-Style Filtering, Modal Script Editor & Image Upload)
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
  let columnFilters = {}; // { colKey: [selectedValues] }
  let activeFilterMenu = null;

  function getFilteredData() {
    let filtered = [...data];

    // 1. Global text search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(col => {
          const val = col.compute ? col.compute(row) : (row[col.key] ?? '');
          return String(val).toLowerCase().includes(q);
        })
      );
    }

    // 2. Excel Column Filters
    Object.keys(columnFilters).forEach(colKey => {
      const selectedVals = columnFilters[colKey];
      if (selectedVals && selectedVals.length > 0) {
        const col = columns.find(c => c.key === colKey);
        filtered = filtered.filter(row => {
          const rawVal = col && col.compute ? col.compute(row) : (row[colKey] ?? '');
          const strVal = String(rawVal === '' || rawVal === null ? '(Blanks)' : rawVal);
          return selectedVals.includes(strVal);
        });
      }
    });

    // 3. Sorting
    if (sortCol) {
      filtered.sort((a, b) => {
        const col = columns.find(c => c.key === sortCol);
        const va = col && col.compute ? col.compute(a) : (a[sortCol] ?? '');
        const vb = col && col.compute ? col.compute(b) : (b[sortCol] ?? '');
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortAsc ? cmp : -cmp;
      });
    }

    return filtered;
  }

  function getUniqueValuesForCol(colKey) {
    const col = columns.find(c => c.key === colKey);
    const set = new Set();
    data.forEach(row => {
      const rawVal = col && col.compute ? col.compute(row) : (row[colKey] ?? '');
      set.add(String(rawVal === '' || rawVal === null ? '(Blanks)' : rawVal));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  function render() {
    const filtered = getFilteredData();
    const hasActiveFilters = Object.values(columnFilters).some(arr => arr && arr.length > 0);

    container.innerHTML = '';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'table-toolbar';
    toolbar.innerHTML = `
      <div class="search-box">
        <input type="text" placeholder="Search... ค้นหา" value="${esc(searchTerm)}" id="etable-search">
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        ${hasActiveFilters ? `<button class="btn btn-secondary btn-sm" id="btn-clear-table-filters">🧹 Clear Filters (${Object.keys(columnFilters).length})</button>` : ''}
        <span class="text-muted" style="font-size:.8rem;">${filtered.length} of ${data.length} items (กดปุ่ม 🔽 ที่หัวข้อเพื่อเลือก Filter แบบ Excel)</span>
        ${onAdd ? `<button class="btn btn-primary btn-sm" id="etable-add">${addLabel}</button>` : ''}
      </div>
    `;
    container.appendChild(toolbar);

    if (filtered.length === 0 && data.length === 0) {
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

    // Table Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    let html = '<table class="etable"><thead><tr>';

    // Headers with Filter Button
    columns.forEach((col, idx) => {
      const w = col.width ? ` style="width:${col.width}"` : '';
      const isFiltered = columnFilters[col.key] && columnFilters[col.key].length > 0;
      const filterActiveStyle = isFiltered ? 'color:#10B981; font-weight:bold;' : '';
      const filterIcon = isFiltered ? ' 🔻' : ' 🔽';
      const sortIcon = sortCol === col.key ? (sortAsc ? ' ▲' : ' ▼') : '';

      html += `
        <th draggable="true" data-col-idx="${idx}" data-sort="${col.key}"${w} title="Drag to reorder / Click to sort">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
            <span class="col-header-label">${esc(col.label)}${sortIcon}</span>
            <button class="btn-col-filter" data-col-key="${col.key}" title="Filter column" style="background:transparent; border:none; cursor:pointer; font-size:0.75rem; ${filterActiveStyle}">
              ${filterIcon}
            </button>
          </div>
        </th>
      `;
    });
    if (onDelete) html += '<th style="width:44px"></th>';
    html += '</tr></thead><tbody>';

    // Rows
    if (filtered.length === 0) {
      html += `<tr><td colspan="${columns.length + 1}" class="text-center text-muted p-3">ไม่พบข้อมูลที่ตรงกับตัวกรอง Filter</td></tr>`;
    } else {
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
    }

    html += '</tbody></table>';
    wrapper.innerHTML = html;
    container.appendChild(wrapper);

    wireEvents();
  }

  function renderCell(row, col) {
    if (col.type === 'scriptModal') {
      const val = row[col.key] || '';
      const preview = val.length > 25 ? val.slice(0, 25) + '...' : (val || '✏️ Edit Details / Script');
      return `<button class="btn btn-secondary btn-sm btn-open-script" data-field="${col.key}" style="max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📜 ${esc(preview)}</button>`;
    }

    if (col.type === 'image') {
      const imgUrl = row[col.key] || '';
      return `
        <div class="table-img-cell" style="display:flex; align-items:center; gap:6px;">
          ${imgUrl ? `<img src="${esc(imgUrl)}" style="width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1;">` : `<span class="text-muted" style="font-size:0.75rem;">No Photo</span>`}
          <label class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:0.7rem; cursor:pointer;" title="Upload photo">
            📷
            <input type="file" accept="image/*" class="input-table-img" data-field="${col.key}" style="display:none;">
          </label>
        </div>
      `;
    }

    if (col.compute) {
      const val = col.compute(row);
      return `<span class="cell-computed">${esc(val)}</span>`;
    }

    const val = row[col.key] ?? '';

    if (col.readOnly || col.editable === false) {
      return `<span class="cell-readonly">${esc(val)}</span>`;
    }

    switch (col.type) {
      case 'dropdown': {
        const options = typeof col.options === 'function' ? col.options() : (col.options || []);
        let optHtml = options.map(o => {
          const selected = String(o) === String(val) ? ' selected' : '';
          return `<option value="${esc(o)}"${selected}>${esc(o)}</option>`;
        }).join('');
        const badgeClass = col.badge ? col.badge(val) : '';
        return `<select class="cell-input cell-select ${badgeClass}" data-field="${col.key}"><option value="">-- Select --</option>${optHtml}</select>`;
      }
      case 'textarea':
        return `<textarea class="cell-input cell-textarea" data-field="${col.key}">${esc(val)}</textarea>`;
      case 'number':
        return `<input type="number" class="cell-input cell-number" data-field="${col.key}" value="${esc(val)}">`;
      case 'date':
        return `<input type="date" class="cell-input cell-date" data-field="${col.key}" value="${esc(val)}">`;
      case 'url':
        return `<input type="url" class="cell-input cell-url" placeholder="https://..." data-field="${col.key}" value="${esc(val)}">`;
      case 'checkbox':
        return `<input type="checkbox" class="cell-checkbox" data-field="${col.key}"${val ? ' checked' : ''}>`;
      default:
        return `<input type="text" class="cell-input cell-text" data-field="${col.key}" value="${esc(val)}">`;
    }
  }

  function openExcelFilterMenu(colKey, anchorBtn) {
    closeExcelFilterMenu();

    const uniqueVals = getUniqueValuesForCol(colKey);
    const selectedVals = columnFilters[colKey] || [];
    const col = columns.find(c => c.key === colKey);

    const menu = document.createElement('div');
    menu.className = 'excel-filter-popup card p-2';
    menu.style.cssText = `
      position: absolute;
      z-index: 1000;
      width: 230px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border-radius: 8px;
      font-size: 0.85rem;
    `;

    const rect = anchorBtn.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${Math.min(rect.left + window.scrollX, window.innerWidth - 250)}px`;

    menu.innerHTML = `
      <div class="mb-2 font-weight-700 text-muted" style="border-bottom:1px solid #e2e8f0; padding-bottom:4px; font-size:0.8rem;">
        🔍 Filter: ${esc(col ? col.label : colKey)}
      </div>
      <div class="mb-2">
        <input type="text" class="form-input p-1 filter-search-input" placeholder="Search values..." style="width:100%; font-size:0.8rem;">
      </div>
      <div class="flex-between mb-2" style="font-size:0.75rem;">
        <button class="btn btn-sm btn-secondary btn-select-all" style="padding:1px 6px;">Select All</button>
        <button class="btn btn-sm btn-secondary btn-clear-all" style="padding:1px 6px;">Clear All</button>
      </div>
      <div class="filter-options-list mb-2" style="max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:4px; padding:4px;">
        ${uniqueVals.map(v => {
          const checked = selectedVals.length === 0 || selectedVals.includes(v) ? 'checked' : '';
          return `
            <label style="display:flex; align-items:center; gap:6px; padding:2px; cursor:pointer;" class="filter-opt-item">
              <input type="checkbox" class="filter-cb" value="${esc(v)}" ${checked}>
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(v)}</span>
            </label>
          `;
        }).join('')}
      </div>
      <div class="flex-between" style="border-top:1px solid #e2e8f0; padding-top:6px;">
        <button class="btn btn-primary btn-sm btn-apply-filter" style="flex:1; margin-right:4px;">Apply</button>
        <button class="btn btn-secondary btn-sm btn-reset-filter" style="flex:1;">Reset</button>
      </div>
    `;

    document.body.appendChild(menu);
    activeFilterMenu = menu;

    // Filter Search
    const searchInput = menu.querySelector('.filter-search-input');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      menu.querySelectorAll('.filter-opt-item').forEach(item => {
        const txt = item.textContent.toLowerCase();
        item.style.display = txt.includes(q) ? 'flex' : 'none';
      });
    });

    // Select/Clear All
    menu.querySelector('.btn-select-all').addEventListener('click', () => {
      menu.querySelectorAll('.filter-cb').forEach(cb => cb.checked = true);
    });
    menu.querySelector('.btn-clear-all').addEventListener('click', () => {
      menu.querySelectorAll('.filter-cb').forEach(cb => cb.checked = false);
    });

    // Apply
    menu.querySelector('.btn-apply-filter').addEventListener('click', () => {
      const checkedVals = Array.from(menu.querySelectorAll('.filter-cb:checked')).map(cb => cb.value);
      if (checkedVals.length === uniqueVals.length) {
        delete columnFilters[colKey];
      } else {
        columnFilters[colKey] = checkedVals;
      }
      closeExcelFilterMenu();
      render();
    });

    // Reset
    menu.querySelector('.btn-reset-filter').addEventListener('click', () => {
      delete columnFilters[colKey];
      closeExcelFilterMenu();
      render();
    });

    // Click outside to close
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 50);
  }

  function handleOutsideClick(e) {
    if (activeFilterMenu && !activeFilterMenu.contains(e.target) && !e.target.classList.contains('btn-col-filter')) {
      closeExcelFilterMenu();
    }
  }

  function closeExcelFilterMenu() {
    if (activeFilterMenu) {
      activeFilterMenu.remove();
      activeFilterMenu = null;
      document.removeEventListener('click', handleOutsideClick);
    }
  }

  function wireEvents() {
    // Search
    const sInput = container.querySelector('#etable-search');
    if (sInput) {
      sInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    // Clear Filters
    const btnClearFilters = container.querySelector('#btn-clear-table-filters');
    if (btnClearFilters) {
      btnClearFilters.addEventListener('click', () => {
        columnFilters = {};
        render();
      });
    }

    // Add buttons
    const addBtn = container.querySelector('#etable-add');
    if (addBtn && onAdd) addBtn.addEventListener('click', onAdd);
    const addEmptyBtn = container.querySelector('#etable-add-empty');
    if (addEmptyBtn && onAdd) addEmptyBtn.addEventListener('click', onAdd);

    // Filter Buttons Click
    container.querySelectorAll('.btn-col-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colKey = e.currentTarget.dataset.colKey;
        openExcelFilterMenu(colKey, e.currentTarget);
      });
    });

    // Column Drag & Drop Reordering
    const ths = container.querySelectorAll('th[draggable="true"]');
    ths.forEach(th => {
      th.addEventListener('dragstart', (e) => {
        draggedColIdx = parseInt(th.dataset.colIdx);
        e.dataTransfer.effectAllowed = 'move';
        th.classList.add('col-dragging');
      });

      th.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      th.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(th.dataset.colIdx);
        if (draggedColIdx !== null && draggedColIdx !== targetIdx) {
          const movedCol = columns.splice(draggedColIdx, 1)[0];
          columns.splice(targetIdx, 0, movedCol);
          render();
          showToast('ลำดับคอลัมน์ถูกปรับเปลี่ยนเรียบร้อย 🔀', 'info');
        }
      });

      th.addEventListener('dragend', () => {
        th.classList.remove('col-dragging');
        draggedColIdx = null;
      });

      // Header click sorting (Clicking on header text)
      th.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-col-filter') || e.target.closest('.btn-col-filter')) return;
        const key = th.dataset.sort;
        if (sortCol === key) {
          if (sortAsc) sortAsc = false;
          else { sortCol = null; sortAsc = true; }
        } else {
          sortCol = key;
          sortAsc = true;
        }
        render();
      });
    });

    // Inputs & Edits
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    tbody.addEventListener('change', async (e) => {
      const target = e.target;

      // Image upload
      if (target.classList.contains('input-table-img')) {
        const file = target.files[0];
        if (!file) return;
        const tr = target.closest('tr');
        const id = tr.dataset.id;
        const field = target.dataset.field;
        try {
          const dataUrl = await resizeImageFile(file, 200);
          if (onChange) onChange(id, field, dataUrl);
          showToast('Image uploaded! 📷', 'success');
        } catch (err) {
          showToast('Image upload failed: ' + err.message, 'error');
        }
        return;
      }

      const tr = target.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;
      const field = target.dataset.field;
      if (!field) return;

      let value;
      if (target.type === 'checkbox') {
        value = target.checked;
      } else {
        value = target.value;
      }

      if (onChange) onChange(id, field, value);

      if (target.tagName === 'SELECT') {
        const col = columns.find(c => c.key === field);
        if (col && col.badge) {
          target.className = `cell-input cell-select ${col.badge(value)}`;
        }
      }
    });

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const tr = btn.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;

      if (btn.dataset.action === 'delete') {
        if (confirm('Delete this row? ต้องการลบรายการนี้ใช่หรือไม่')) {
          if (onDelete) onDelete(id);
        }
        return;
      }

      if (btn.classList.contains('btn-open-script')) {
        const field = btn.dataset.field;
        const rowData = data.find(r => String(r[idField]) === String(id));
        const currentVal = rowData ? (rowData[field] || '') : '';

        showModal({
          title: `📜 Edit ${columns.find(c => c.key === field)?.label || 'Script & Content Details'} (${id})`,
          bodyHtml: `
            <div class="form-group mb-3">
              <label class="form-label" style="font-weight:bold;">รายละเอียดสคริปต์, โครงเรื่อง และบรีฟคอนเทนต์อย่างละเอียด:</label>
              <textarea id="modal-script-input" class="form-input" style="height:280px; font-family:var(--font); line-height:1.5; font-size:0.95rem;" placeholder="พิมพ์สคริปต์ บทพูด Hook, Body, CTA และบรีฟแบบละเอียดที่นี่...">${esc(currentVal)}</textarea>
            </div>
          `,
          confirmLabel: '💾 Save Script',
          onConfirm: () => {
            const newVal = document.getElementById('modal-script-input').value;
            if (onChange) onChange(id, field, newVal);
            showToast('Script & Content details saved! 📜✅', 'success');
            render();
          }
        });
      }
    });
  }

  render();
}

// ── Badge Helpers ──
export function statusBadge(val) {
  if (!val) return '';
  if (val.includes('Published') || val.includes('Active') || val.includes('Paid') || val.includes('Approved')) return 'badge-green';
  if (val.includes('Scripting') || val.includes('Filming') || val.includes('Editing') || val.includes('Ready') || val.includes('Invoiced')) return 'badge-blue';
  if (val.includes('Idea') || val.includes('To Review') || val.includes('Pending')) return 'badge-yellow';
  if (val.includes('Cancelled') || val.includes('Paused')) return 'badge-red';
  return 'badge-gray';
}

export function contentTypeBadge(val) {
  if (!val) return '';
  if (val.includes('Affiliate')) return 'badge-orange';
  if (val.includes('Personal')) return 'badge-blue';
  if (val.includes('Knowledge')) return 'badge-green';
  if (val.includes('Sponsor')) return 'badge-purple';
  return 'badge-gray';
}

