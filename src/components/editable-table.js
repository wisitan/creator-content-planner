/* ──────────────────────────────────────────
   Reusable Editable Table Component 
   (With Multi-Row Selection/Delete, Excel Filtering, Year & Month Quick Filters, Image Zoom & Script Editor)
   ────────────────────────────────────────── */
import { esc, resizeImageFile } from '../utils.js';
import { showModal, showImageModal } from './modal.js';
import { showToast } from './toast.js';

export function EditableTable(container, config) {
  const {
    columns: initialColumns, onChange, onAdd, onDelete,
    addLabel = '+ Add',
    emptyText = 'No data yet',
    emptyIcon = '📭',
    idField = 'id',
    enableYearMonthFilter = false,
  } = config;

  let columns = [...initialColumns];
  let searchTerm = '';
  let sortCol = null;
  let sortAsc = true;
  let columnFilters = {}; // { colKey: [selectedValues] }
  let selectedRowIds = new Set();
  let activeFilterMenu = null;

  // Year & Month Filters state
  const currentYear = new Date().getFullYear();
  let selectedYear = '2026'; // Default initial year set to 2026
  let selectedMonths = new Set(); // 0 = JAN, 1 = FEB, ..., 11 = DEC (empty = all months)

  const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Always fetch fresh data array reference
  function getCurrentData() {
    if (typeof config.getData === 'function') {
      return config.getData();
    }
    if (typeof config.data === 'function') {
      return config.data();
    }
    return config.data || [];
  }

  function getFilteredData() {
    const rawData = getCurrentData();
    let filtered = [...rawData];

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

    // 2. Year & Month Filter (If enabled)
    if (enableYearMonthFilter) {
      filtered = filtered.filter(row => {
        // Collect dates in row (plannedDate, publishedDate, deadline, etc.)
        const datesInRow = [];
        Object.keys(row).forEach(k => {
          const val = row[k];
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            datesInRow.push(val);
          }
        });

        // If no date found in row, keep it if no month filter is selected
        if (datesInRow.length === 0) {
          return selectedMonths.size === 0;
        }

        // Check year match
        const yearMatches = datesInRow.some(dStr => {
          if (selectedYear === 'ALL') return true;
          return dStr.startsWith(selectedYear);
        });

        if (!yearMatches) return false;

        // Check month match if any month selected
        if (selectedMonths.size > 0) {
          const monthMatches = datesInRow.some(dStr => {
            const parts = dStr.split('-');
            const mIdx = parseInt(parts[1], 10) - 1;
            const yStr = parts[0];
            const isYearOk = selectedYear === 'ALL' || yStr === selectedYear;
            return isYearOk && selectedMonths.has(mIdx);
          });
          return monthMatches;
        }

        return true;
      });
    }

    // 3. Excel Column Filters
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

    // 4. Sorting
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
    const currentData = getCurrentData();
    currentData.forEach(row => {
      const rawVal = col && col.compute ? col.compute(row) : (row[colKey] ?? '');
      set.add(String(rawVal === '' || rawVal === null ? '(Blanks)' : rawVal));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  function render() {
    const currentData = getCurrentData();
    const filtered = getFilteredData();
    const hasActiveFilters = Object.values(columnFilters).some(arr => arr && arr.length > 0);
    const selectedCount = selectedRowIds.size;

    container.innerHTML = '';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'table-toolbar';

    // Year & Month Filter Controls HTML
    let ymFilterHtml = '';
    if (enableYearMonthFilter) {
      // Dynamic Smart Years Generator: Collect year from current data + rolling 5-year window
      const yearSet = new Set(['2026']);
      const currentYearNum = new Date().getFullYear();
      for (let y = currentYearNum - 2; y <= currentYearNum + 5; y++) {
        yearSet.add(y.toString());
      }
      currentData.forEach(row => {
        Object.keys(row).forEach(k => {
          const val = row[k];
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const y = val.split('-')[0];
            if (y && y.length === 4) yearSet.add(y);
          }
        });
      });
      const sortedYears = Array.from(yearSet).sort((a, b) => parseInt(a) - parseInt(b));
      const yearsList = ['ALL', ...sortedYears];
      const yearOpts = yearsList.map(y => `<option value="${y}" ${selectedYear === y ? 'selected' : ''}>${y === 'ALL' ? '🗓️ All Years' : y}</option>`).join('');

      const monthBtns = MONTH_NAMES.map((m, idx) => {
        const active = selectedMonths.has(idx) ? 'active' : '';
        return `<button class="btn btn-sm btn-month-toggle ${active}" data-month="${idx}" style="padding:2px 7px; font-size:0.75rem; font-weight:600; min-width:38px;">${m}</button>`;
      }).join('');

      ymFilterHtml = `
        <div class="ym-filter-group" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <select id="etable-year-select" class="form-input p-1" style="width:105px; font-size:0.8rem; font-weight:600;">
            ${yearOpts}
          </select>
          <div class="month-buttons-container" style="display:flex; gap:3px; flex-wrap:wrap;">
            ${monthBtns}
          </div>
          ${selectedMonths.size > 0 ? `<button id="btn-reset-months" class="btn btn-sm btn-secondary" style="padding:1px 6px; font-size:0.72rem;">✕ Reset Months</button>` : ''}
        </div>
      `;
    }

    toolbar.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1;">
        <div class="search-box">
          <input type="text" placeholder="Search... ค้นหา" value="${esc(searchTerm)}" id="etable-search">
        </div>
        ${ymFilterHtml}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        ${selectedCount > 0 && onDelete ? `
          <button class="btn btn-danger btn-sm" id="btn-batch-delete">
            🗑️ Delete Selected (${selectedCount})
          </button>
        ` : ''}
        ${hasActiveFilters ? `<button class="btn btn-secondary btn-sm" id="btn-clear-table-filters">🧹 Clear Filters (${Object.keys(columnFilters).length})</button>` : ''}
        <span class="text-muted" style="font-size:.8rem;">${filtered.length} of ${currentData.length} items</span>
        ${onAdd ? `<button class="btn btn-primary btn-sm" id="etable-add">${addLabel}</button>` : ''}
      </div>
    `;
    container.appendChild(toolbar);

    if (filtered.length === 0 && currentData.length === 0) {
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

    // Checkbox All Header Column
    if (onDelete) {
      const allFilteredSelected = filtered.length > 0 && filtered.every(r => selectedRowIds.has(String(r[idField])));
      html += `
        <th style="width:36px; text-align:center;">
          <input type="checkbox" id="cb-select-all" ${allFilteredSelected ? 'checked' : ''} title="Select All / Deselect All">
        </th>
      `;
    }

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
      html += `<tr><td colspan="${columns.length + (onDelete ? 2 : 0)}" class="text-center text-muted p-3">ไม่พบข้อมูลที่ตรงกับตัวกรอง Filter</td></tr>`;
    } else {
      filtered.forEach(row => {
        const rowIdStr = String(row[idField]);
        const isChecked = selectedRowIds.has(rowIdStr);
        html += `<tr data-id="${esc(rowIdStr)}" class="${isChecked ? 'row-selected' : ''}">`;
        
        if (onDelete) {
          html += `
            <td style="text-align:center;">
              <input type="checkbox" class="cb-row-select" data-id="${esc(rowIdStr)}" ${isChecked ? 'checked' : ''}>
            </td>
          `;
        }

        columns.forEach(col => {
          html += '<td>';
          html += renderCell(row, col);
          html += '</td>';
        });

        if (onDelete) {
          html += `<td class="row-actions"><button class="btn-delete-single-row" data-id="${esc(rowIdStr)}" title="Delete row">🗑️</button></td>`;
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
    const val = row[col.key] ?? '';

    if (col.key === idField || col.key === 'id') {
      return `<button class="btn btn-secondary btn-sm btn-open-row-detail" data-id="${esc(val)}" style="font-weight:700; font-family:monospace;" title="Click to view/edit full row details in vertical popup / กดเพื่อเปิดดูรายละเอียดแถวแนวตั้ง">📱 ${esc(val)}</button>`;
    }

    if (col.type === 'scriptModal') {
      const scriptVal = row[col.key] || '';
      const preview = scriptVal.length > 25 ? scriptVal.slice(0, 25) + '...' : (scriptVal || '✏️ Edit Details / Script');
      return `<button class="btn btn-secondary btn-sm btn-open-script" data-field="${col.key}" style="max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📜 ${esc(preview)}</button>`;
    }

    if (col.type === 'productPicker') {
      const pid = row[col.key] || '';
      const products = typeof config.getProducts === 'function' ? config.getProducts() : [];
      const pObj = products.find(p => p.id === pid);
      const imgUrl = pObj ? pObj.imageUrl : '';
      const pName = pObj ? pObj.name : '';

      return `
        <div style="display:flex; align-items:center; gap:6px;">
          ${imgUrl 
            ? `<img src="${esc(imgUrl)}" class="table-img-preview" data-id="${esc(row[idField])}" style="width:30px; height:30px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1; cursor:pointer;" title="Product Photo: ${esc(pName)}">` 
            : `<span style="font-size:1.1rem;" title="No photo">📦</span>`
          }
          <button class="btn btn-secondary btn-sm btn-open-product-picker" data-field="${col.key}" data-id="${esc(row[idField])}" style="padding:2px 8px; font-size:0.78rem; font-weight:700; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Click to pick product / กดเพื่อเลือกสินค้า">
            ${esc(pid || '-- Pick --')}
          </button>
        </div>
      `;
    }

    if (col.type === 'image') {
      const imgUrl = row[col.key] || '';
      return `
        <div class="table-img-cell" style="display:flex; align-items:center; gap:6px;">
          ${imgUrl 
            ? `<img src="${esc(imgUrl)}" class="table-img-preview" data-field="${col.key}" data-id="${esc(row[idField])}" style="width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1; cursor:pointer;" title="Click to view full size / กดเพื่อดูรูปใหญ่">` 
            : `<span class="text-muted" style="font-size:0.75rem;">No Photo</span>`
          }
          <label class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:0.7rem; cursor:pointer;" title="Upload photo">
            📷
            <input type="file" accept="image/*" class="input-table-img" data-field="${col.key}" style="display:none;">
          </label>
        </div>
      `;
    }

    if (col.compute) {
      const computedVal = col.compute(row);
      return `<span class="cell-computed">${esc(computedVal)}</span>`;
    }

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

    const searchInput = menu.querySelector('.filter-search-input');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      menu.querySelectorAll('.filter-opt-item').forEach(item => {
        const txt = item.textContent.toLowerCase();
        item.style.display = txt.includes(q) ? 'flex' : 'none';
      });
    });

    menu.querySelector('.btn-select-all').addEventListener('click', () => {
      menu.querySelectorAll('.filter-cb').forEach(cb => cb.checked = true);
    });
    menu.querySelector('.btn-clear-all').addEventListener('click', () => {
      menu.querySelectorAll('.filter-cb').forEach(cb => cb.checked = false);
    });

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

    menu.querySelector('.btn-reset-filter').addEventListener('click', () => {
      delete columnFilters[colKey];
      closeExcelFilterMenu();
      render();
    });

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

    // Year Select Handler
    const yearSel = container.querySelector('#etable-year-select');
    if (yearSel) {
      yearSel.addEventListener('change', (e) => {
        selectedYear = e.target.value;
        render();
      });
    }

    // Month Toggle Buttons Handlers
    container.querySelectorAll('.btn-month-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mIdx = parseInt(e.currentTarget.dataset.month, 10);
        if (selectedMonths.has(mIdx)) {
          selectedMonths.delete(mIdx);
        } else {
          selectedMonths.add(mIdx);
        }
        render();
      });
    });

    // Reset Months Button
    const btnResetMonths = container.querySelector('#btn-reset-months');
    if (btnResetMonths) {
      btnResetMonths.addEventListener('click', () => {
        selectedMonths.clear();
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

    // Direct Batch Delete Button Click Handler (With Confirmation Popup)
    const btnBatchDelete = container.querySelector('#btn-batch-delete');
    if (btnBatchDelete && onDelete) {
      btnBatchDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        const count = selectedRowIds.size;
        if (confirm(`Delete ${count} selected items? คุณแน่ใจหรือไม่ว่าต้องการลบทั้ง ${count} รายการที่เลือก?`)) {
          Array.from(selectedRowIds).forEach(id => {
            onDelete(id);
            if (Array.isArray(config.data)) {
              config.data = config.data.filter(item => String(item[idField]) !== String(id));
            }
          });
          selectedRowIds.clear();
          showToast(`Deleted ${count} items successfully! 🗑️✅`, 'success');
          render();
        }
      });
    }

    // Direct Single Delete Button Click Handlers (With Confirmation Popup)
    container.querySelectorAll('.btn-delete-single-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        if (confirm(`Delete row ${id}? คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?`)) {
          if (onDelete) {
            onDelete(id);
            if (Array.isArray(config.data)) {
              config.data = config.data.filter(item => String(item[idField]) !== String(id));
            }
            selectedRowIds.delete(String(id));
            showToast(`Deleted ${id} successfully! 🗑️`, 'info');
            render();
          }
        }
      });
    });

    // Select All Checkbox Handler
    const cbSelectAll = container.querySelector('#cb-select-all');
    if (cbSelectAll) {
      cbSelectAll.addEventListener('change', (e) => {
        const filtered = getFilteredData();
        if (e.target.checked) {
          filtered.forEach(r => selectedRowIds.add(String(r[idField])));
        } else {
          filtered.forEach(r => selectedRowIds.delete(String(r[idField])));
        }
        render();
      });
    }

    // Individual Row Checkbox Handler
    container.querySelectorAll('.cb-row-select').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const rowId = e.target.dataset.id;
        if (e.target.checked) {
          selectedRowIds.add(rowId);
        } else {
          selectedRowIds.delete(rowId);
        }
        render();
      });
    });

    // Add buttons
    const handleAdd = () => {
      if (onAdd) {
        onAdd();
        showToast('Added new item! ➕', 'success');
        render();
      }
    };
    const addBtn = container.querySelector('#etable-add');
    if (addBtn) addBtn.addEventListener('click', handleAdd);
    const addEmptyBtn = container.querySelector('#etable-add-empty');
    if (addEmptyBtn) addEmptyBtn.addEventListener('click', handleAdd);

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

    // Table Body Inputs & Script Modal Handler & Image Zoom Handler
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    // Image Zoom Click Handler (with Delete Photo Option)
    container.querySelectorAll('.table-img-preview').forEach(imgEl => {
      imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = e.currentTarget.getAttribute('src');
        const field = e.currentTarget.dataset.field;
        const id = e.currentTarget.dataset.id;
        if (src) {
          showImageModal(src, '🖼️ Image Zoom Preview / ดูรูปภาพขนาดใหญ่', field && id ? () => {
            if (onChange) onChange(id, field, '');
            showToast('Deleted photo successfully! 🗑️', 'info');
            render();
          } : undefined);
        }
      });
    });

    tbody.addEventListener('change', async (e) => {
      const target = e.target;
      if (target.classList.contains('cb-row-select')) return;

      // Image upload
      if (target.classList.contains('input-table-img')) {
        const file = target.files[0];
        if (!file) return;
        const tr = target.closest('tr');
        const id = tr.dataset.id;
        const field = target.dataset.field;
        try {
          const dataUrl = await resizeImageFile(file, 400);
          if (onChange) onChange(id, field, dataUrl);
          showToast('Image uploaded! 📷', 'success');
          render();
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

      if (onChange) {
        const res = onChange(id, field, value);
        if (res && res.error) {
          showModal({
            title: '⚠️ รหัส ID ซ้ำกันในระบบ!',
            body: `
              <div class="p-2">
                <p class="text-danger font-weight-700 mb-2">${esc(res.message)}</p>
                <p class="text-muted" style="font-size:0.85rem;">ระบบป้องกันข้อมูลเขียนทับ: กรุณาใช้รหัส ID อื่นที่ไม่ซ้ำนะคะ</p>
              </div>
            `,
            cancelText: '❌ ปิดหน้าต่างนี้',
          });
          render();
          return;
        }
      }

      // Auto re-render table to instantly refresh computed columns (e.g., Product Name auto-show)
      if (columns.some(c => c.compute || c.type === 'computed') || field === idField || field === 'id') {
        render();
      } else if (target.tagName === 'SELECT') {
        const col = columns.find(c => c.key === field);
        if (col && col.badge) {
          target.className = `cell-input cell-select ${col.badge(value)}`;
        }
      }
    });

    tbody.addEventListener('click', (e) => {
      const btnPicker = e.target.closest('.btn-open-product-picker');
      if (btnPicker) {
        const tr = btnPicker.closest('tr');
        const id = tr ? tr.dataset.id : btnPicker.dataset.id;
        const field = btnPicker.dataset.field;
        if (id && field) openProductPickerModal(id, field);
        return;
      }

      const btnDetail = e.target.closest('.btn-open-row-detail');
      if (btnDetail) {
        const id = btnDetail.dataset.id;
        if (id) openRowDetailModal(id);
        return;
      }

      const btn = e.target.closest('.btn-open-script');
      if (!btn) return;
      const tr = btn.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;
      const field = btn.dataset.field;
      const currentData = getCurrentData();
      const rowData = currentData.find(r => String(r[idField]) === String(id));

      const currentHook = rowData ? (rowData.hook || '') : '';
      const currentScript = rowData ? (rowData.script || rowData[field] || '') : '';

      showModal({
        title: `📜 Edit Script, Hook & Content Details (${id})`,
        body: `
          <div class="form-group mb-3">
            <label class="form-label" style="font-weight:bold;">🪝 Hook (คำเกริ่นเรียกร้องความสนใจ 3 วินาทีแรก):</label>
            <input type="text" id="modal-hook-input" class="form-input mb-3" style="font-size:0.95rem;" value="${esc(currentHook)}" placeholder="เช่น หยุดดูก่อนถ้าคุณกำลังจะซื้อ...">
          </div>
          <div class="form-group mb-2">
            <label class="form-label" style="font-weight:bold;">📜 Script & Outline (รายละเอียดสคริปต์, โครงเรื่อง และบรีฟคอนเทนต์ฉบับเต็ม):</label>
            <textarea id="modal-script-input" class="form-input" style="height:220px; font-family:var(--font); line-height:1.5; font-size:0.95rem;" placeholder="พิมพ์สคริปต์ บทพูด Hook, Body, CTA และบรีฟแบบละเอียดที่นี่...">${esc(currentScript)}</textarea>
          </div>
        `,
        confirmText: '💾 Save Script & Hook',
        onConfirm: () => {
          const newHook = document.getElementById('modal-hook-input')?.value || '';
          const newScript = document.getElementById('modal-script-input')?.value || '';
          if (onChange) {
            onChange(id, 'hook', newHook);
            onChange(id, 'script', newScript);
            if (field !== 'script' && field !== 'hook') {
              onChange(id, field, newScript);
            }
          }
          showToast('Saved Script & Hook details! 📜🪝✅', 'success');
          render();
        }
      });
    });
  }

  function openRowDetailModal(rowId) {
    const currentData = getCurrentData();
    const row = currentData.find(r => String(r[idField]) === String(rowId));
    if (!row) return;

    let fieldsHtml = '';
    columns.forEach(col => {
      const val = row[col.key] ?? '';
      
      fieldsHtml += `<div class="form-group mb-3 pb-2" style="border-bottom:1px solid var(--c-border);">`;
      fieldsHtml += `<label class="form-label" style="font-weight:700; color:var(--c-primary);">${esc(col.label)}:</label>`;

      if (col.type === 'image') {
        const imgUrl = val;
        fieldsHtml += `
          <div style="display:flex; align-items:center; gap:10px; margin-top:4px;">
            ${imgUrl ? `<img src="${esc(imgUrl)}" style="width:60px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; cursor:pointer;" class="table-img-preview" data-field="${col.key}" data-id="${esc(rowId)}">` : '<span class="text-muted">No Photo</span>'}
            <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
              📷 Upload Photo
              <input type="file" accept="image/*" class="input-table-img" data-field="${col.key}" data-id="${esc(rowId)}" style="display:none;">
            </label>
          </div>
        `;
      } else if (col.type === 'scriptModal') {
        const currentHook = row.hook || '';
        const currentScript = row.script || val || '';
        fieldsHtml += `
          <div class="mb-2">
            <label class="form-label" style="font-size:0.75rem; color:#D97706;">🪝 Hook (คำเกริ่นเปิดคลิป):</label>
            <input type="text" class="form-input modal-row-field" data-field="hook" value="${esc(currentHook)}" placeholder="พิมพ์ Hook...">
          </div>
          <div>
            <label class="form-label" style="font-size:0.75rem; color:#4F46E5;">📜 Script & Outline (สคริปต์ฉบับเต็ม):</label>
            <textarea class="form-input modal-row-field" data-field="script" style="height:120px;" placeholder="พิมพ์สคริปต์...">${esc(currentScript)}</textarea>
          </div>
        `;
      } else if (col.type === 'productPicker') {
        const pid = val || '';
        const products = typeof config.getProducts === 'function' ? config.getProducts() : [];
        const pObj = products.find(p => p.id === pid);
        const imgUrl = pObj ? pObj.imageUrl : '';
        const pName = pObj ? pObj.name : '';

        fieldsHtml += `
          <div style="display:flex; align-items:center; gap:12px; margin-top:4px;">
            ${imgUrl 
              ? `<img src="${esc(imgUrl)}" class="table-img-preview" data-id="${esc(rowId)}" style="width:46px; height:46px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; cursor:pointer;" title="Product Photo: ${esc(pName)}">` 
              : `<div style="width:46px; height:46px; border-radius:6px; background:var(--c-bg); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">📦</div>`
            }
            <div style="flex:1;">
              <button class="btn btn-secondary btn-sm btn-open-product-picker" data-field="${col.key}" data-id="${esc(rowId)}" style="padding:6px 12px; font-size:0.85rem; font-weight:700;">
                📦 Select Product: ${esc(pid || '-- Pick Product --')}
              </button>
              ${pName ? `<div style="font-size:0.8rem; font-weight:600; color:var(--c-primary); margin-top:4px;">${esc(pName)}</div>` : ''}
            </div>
          </div>
        `;
      } else if (col.compute) {
        fieldsHtml += `<div class="form-input modal-computed-cell" data-field="${col.key}" style="background:var(--c-bg); font-weight:600;">${esc(col.compute(row))}</div>`;
      } else if (col.readOnly || col.editable === false) {
        fieldsHtml += `<input type="text" class="form-input" value="${esc(val)}" readonly style="background:var(--c-bg); font-weight:700;">`;
      } else if (col.key === idField) {
        fieldsHtml += `<input type="text" class="form-input modal-row-field" data-field="${col.key}" value="${esc(val)}" style="font-weight:700; color:var(--c-primary);" placeholder="ระบุ ID...">`;
      } else if (col.type === 'dropdown') {
        const options = typeof col.options === 'function' ? col.options() : (col.options || []);
        let optHtml = options.map(o => `<option value="${esc(o)}"${String(o) === String(val) ? ' selected' : ''}>${esc(o)}</option>`).join('');
        fieldsHtml += `<select class="form-select modal-row-field" data-field="${col.key}"><option value="">-- Select --</option>${optHtml}</select>`;
      } else if (col.type === 'textarea') {
        fieldsHtml += `<textarea class="form-input modal-row-field" data-field="${col.key}" style="height:80px;">${esc(val)}</textarea>`;
      } else if (col.type === 'checkbox') {
        fieldsHtml += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" class="modal-row-field-cb" data-field="${col.key}" ${val ? 'checked' : ''}> <span>Enabled</span></label>`;
      } else {
        const inputType = col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : col.type === 'url' ? 'url' : 'text';
        fieldsHtml += `<input type="${inputType}" class="form-input modal-row-field" data-field="${col.key}" value="${esc(val)}">`;
      }

      fieldsHtml += `</div>`;
    });

    const modal = showModal({
      title: `📱 Row Details (${rowId}) — รายละเอียดแนวตั้ง`,
      body: `
        <div class="vertical-row-detail-modal" style="max-height:65vh; overflow-y:auto; padding-right:6px;">
          <p class="text-muted mb-3" style="font-size:0.8rem;">(สามารถพิมพ์แก้ไขหรือไถหน้าจอขึ้นลงเพื่อดูข้อมูลทุกคอลัมน์ในแนวตั้งได้อย่างสะดวก)</p>
          ${fieldsHtml}
        </div>
      `,
      confirmText: '💾 Save & Close / บันทึก',
      cancelText: '❌ Close / ปิด',
      onConfirm: (modalBody) => {
        if (!modalBody) return;

        // Check if ID field changed
        const idInput = modalBody.querySelector(`.modal-row-field[data-field="${idField}"]`) || modalBody.querySelector('.modal-row-field[data-field="id"]');
        let currentTargetId = rowId;
        if (idInput && idInput.value && idInput.value !== rowId) {
          const newId = idInput.value.trim();
          if (onChange) {
            const res = onChange(rowId, idField, newId);
            if (res && res.error) {
              showModal({
                title: '⚠️ รหัส ID ซ้ำกันในระบบ!',
                body: `
                  <div class="p-2">
                    <p class="text-danger font-weight-700 mb-2">${esc(res.message)}</p>
                    <p class="text-muted" style="font-size:0.85rem;">ระบบป้องกันข้อมูลเขียนทับ: กรุณาใช้รหัส ID อื่นที่ไม่ซ้ำนะคะ</p>
                  </div>
                `,
                cancelText: '❌ ปิดหน้าต่างนี้',
              });
              render();
              return;
            }
          }
          currentTargetId = newId;
        }

        modalBody.querySelectorAll('.modal-row-field').forEach(input => {
          const f = input.dataset.field;
          const v = input.value;
          if (f && f !== idField && onChange) {
            onChange(currentTargetId, f, v);
          }
        });
        modalBody.querySelectorAll('.modal-row-field-cb').forEach(cb => {
          const f = cb.dataset.field;
          const v = cb.checked;
          if (f && onChange) onChange(currentTargetId, f, v);
        });
        showToast(`Saved details for ${currentTargetId}! 💾✅`, 'success');
        render();
      }
    });

    // Wire image preview zoom, upload & dynamic computed values update inside vertical modal
    if (modal.element) {
      modal.element.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('modal-row-field')) {
          const field = target.dataset.field;
          const val = target.value;
          if (field && onChange) {
            onChange(rowId, field, val);
            const updatedData = getCurrentData();
            const updatedRow = updatedData.find(r => String(r[idField]) === String(rowId)) || row;
            columns.forEach(col => {
              if (col.compute) {
                const computedEl = modal.element.querySelector(`.modal-computed-cell[data-field="${col.key}"]`);
                if (computedEl) {
                  computedEl.textContent = col.compute(updatedRow);
                }
              }
            });
            render();
          }
        }
      });

      modal.element.querySelectorAll('.table-img-preview').forEach(imgEl => {
        imgEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const src = e.currentTarget.getAttribute('src');
          const field = e.currentTarget.dataset.field;
          const id = e.currentTarget.dataset.id || rowId;
          if (src) {
            showImageModal(src, '🖼️ Image Zoom Preview / ดูรูปภาพขนาดใหญ่', field && id ? () => {
              if (onChange) onChange(id, field, '');
              showToast('Deleted photo successfully! 🗑️', 'info');
              modal.close();
              render();
            } : undefined);
          }
        });
      });

      modal.element.querySelectorAll('.btn-open-product-picker').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const field = btn.dataset.field;
          openProductPickerModal(rowId, field);
          modal.close();
        });
      });

      modal.element.querySelectorAll('.input-table-img').forEach(input => {
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const field = e.target.dataset.field;
          try {
            const dataUrl = await resizeImageFile(file, 400);
            if (onChange) onChange(rowId, field, dataUrl);
            showToast('Uploaded image! 📷', 'success');
            modal.close();
            openRowDetailModal(rowId);
            render();
          } catch (err) {
            showToast('Upload failed: ' + err.message, 'error');
          }
        });
      });
    }
  }

  function openProductPickerModal(rowId, colKey) {
    const products = typeof config.getProducts === 'function' ? config.getProducts() : [];
    const categories = typeof config.getCategories === 'function' ? config.getCategories() : [];
    const statuses = typeof config.getStatuses === 'function' ? config.getStatuses() : [];

    let searchTerm = '';
    let selectedCategory = 'ALL';
    let selectedStatus = 'ALL';
    let currentPage = 1;
    const PAGE_SIZE = 12;

    function renderPickerBody(modalBody) {
      const listEl = modalBody.querySelector('#product-picker-list');
      const pagEl = modalBody.querySelector('#product-picker-pagination');
      if (!listEl || !pagEl) return;

      // 1. Filter products
      const filtered = products.filter(p => {
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const match = (p.id || '').toLowerCase().includes(s) || 
                        (p.name || '').toLowerCase().includes(s) || 
                        (p.brand || '').toLowerCase().includes(s) || 
                        (p.category || '').toLowerCase().includes(s);
          if (!match) return false;
        }
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
          return false;
        }
        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) {
          return false;
        }
        return true;
      });

      // Calculate Pagination
      const totalFiltered = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
      if (currentPage > totalPages) currentPage = totalPages;

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

      // Render Pagination Bar
      pagEl.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
          <div style="font-size:0.8rem; font-weight:600;" class="text-muted">
            พบ ${totalFiltered} รายการ (แสดง ${pageItems.length} รายการในหน้านี้)
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btn-picker-prev" ${currentPage <= 1 ? 'disabled' : ''}>◀ Prev</button>
            <span style="font-size:0.82rem; font-weight:700;">Page ${currentPage} / ${totalPages}</span>
            <button class="btn btn-secondary btn-sm" id="btn-picker-next" ${currentPage >= totalPages ? 'disabled' : ''}>Next ▶</button>
          </div>
        </div>
      `;

      if (filtered.length === 0) {
        listEl.innerHTML = `<div class="p-4 text-center text-muted" style="grid-column: 1 / -1;">ไม่พบสินค้าที่ตรงกับตัวกรอง 📦</div>`;
        return;
      }

      let html = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap:10px; min-height:240px; align-content:start; padding:2px;">`;
      
      // Clear Option (Show only on Page 1)
      if (currentPage === 1) {
        html += `
          <div class="card p-2 picker-item-card" data-pid="" style="cursor:pointer; border:1px dashed var(--c-border); display:flex; align-items:center; gap:10px; background:var(--c-bg);">
            <span style="font-size:1.4rem;">🚫</span>
            <div>
              <div style="font-weight:700; font-size:0.85rem; color:var(--c-text-muted);">-- ไม่ระบุสินค้า / Clear --</div>
              <div style="font-size:0.75rem;" class="text-muted">ปลดล็อกการผูกสินค้า</div>
            </div>
          </div>
        `;
      }

      pageItems.forEach(p => {
        html += `
          <div class="card p-2 picker-item-card" data-pid="${esc(p.id)}" style="cursor:pointer; display:flex; align-items:center; gap:10px; transition:all 0.15s ease;" onmouseover="this.style.borderColor='var(--c-primary)'" onmouseout="this.style.borderColor='var(--c-border)'">
            ${p.imageUrl 
              ? `<img src="${esc(p.imageUrl)}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; flex-shrink:0;">`
              : `<div style="width:44px; height:44px; border-radius:6px; background:var(--c-bg); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">📦</div>`
            }
            <div style="flex:1; overflow:hidden;">
              <div style="font-weight:700; font-size:0.85rem; color:var(--c-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(p.id)}: ${esc(p.name || 'Untitled')}</div>
              <div style="font-size:0.75rem; color:var(--c-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" class="text-muted">${esc(p.brand || p.category || '-')} | ${esc(p.status || '')}</div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      listEl.innerHTML = html;

      // Click event for selecting item
      listEl.querySelectorAll('.picker-item-card').forEach(card => {
        card.addEventListener('click', () => {
          const selectedPid = card.dataset.pid;
          if (onChange) onChange(rowId, colKey, selectedPid);
          showToast(`Selected product ${selectedPid || 'None'}! 📦✅`, 'success');
          modal.close();
          render();
        });
      });

      // Pagination Button Events
      const btnPrev = pagEl.querySelector('#btn-picker-prev');
      const btnNext = pagEl.querySelector('#btn-picker-next');
      if (btnPrev && !btnPrev.disabled) {
        btnPrev.addEventListener('click', () => {
          currentPage--;
          renderPickerBody(modalBody);
        });
      }
      if (btnNext && !btnNext.disabled) {
        btnNext.addEventListener('click', () => {
          currentPage++;
          renderPickerBody(modalBody);
        });
      }
    }

    let catOptions = `<option value="ALL">📁 All Categories (ทุกหมวด)</option>`;
    categories.forEach(cat => {
      catOptions += `<option value="${esc(cat)}">${esc(cat)}</option>`;
    });

    let statusOptions = `<option value="ALL">🏷️ All Statuses (ทุกสถานะ)</option>`;
    statuses.forEach(st => {
      statusOptions += `<option value="${esc(st)}">${esc(st)}</option>`;
    });

    const modal = showModal({
      title: `📦 Select Product / เลือกสินค้าจากคลัง (${products.length} รายการ)`,
      body: `
        <div>
          <!-- Search & Filter Controls -->
          <div style="display:grid; grid-template-columns: 2fr 1.2fr 1fr; gap:8px; margin-bottom:10px;">
            <input type="text" id="product-picker-search" class="form-input" placeholder="🔍 ค้นชื่อ, P001, แบรนด์..." style="font-size:0.85rem;">
            <select id="product-picker-category" class="form-select" style="font-size:0.85rem;">${catOptions}</select>
            <select id="product-picker-status" class="form-select" style="font-size:0.85rem;">${statusOptions}</select>
          </div>
          <!-- Pagination Control Bar -->
          <div id="product-picker-pagination" class="mb-2 p-2 card" style="background:var(--c-bg);"></div>
          <!-- List Container -->
          <div id="product-picker-list"></div>
        </div>
      `,
      confirmText: '',
      cancelText: '❌ Cancel / ยกเลิก',
    });

    if (modal.element) {
      renderPickerBody(modal.element);
      const searchInput = modal.element.querySelector('#product-picker-search');
      const catSelect = modal.element.querySelector('#product-picker-category');
      const statusSelect = modal.element.querySelector('#product-picker-status');

      if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('input', (e) => {
          searchTerm = e.target.value;
          currentPage = 1;
          renderPickerBody(modal.element);
        });
      }
      if (catSelect) {
        catSelect.addEventListener('change', (e) => {
          selectedCategory = e.target.value;
          currentPage = 1;
          renderPickerBody(modal.element);
        });
      }
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          selectedStatus = e.target.value;
          currentPage = 1;
          renderPickerBody(modal.element);
        });
      }
    }
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
