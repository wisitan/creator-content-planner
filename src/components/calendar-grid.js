/* ──────────────────────────────────────────
   Calendar Grid Component 
   (With Month, Week & Day Views, Date Type Filter [Planned = Orange, Published = Green] & Rich Item Modal)
   ────────────────────────────────────────── */
import { esc, fmtDate } from '../utils.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function CalendarGrid(container, config) {
  const { getItems, onDayClick, onItemClick, statusOptions = [] } = config;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let selectedStatus = 'ALL';
  let viewMode = 'month'; // 'month', 'week', or 'day'

  // Date Type Filter State (Both true by default)
  let showPlanned = true;
  let showPublished = true;

  // Week & Day Views state
  let currentMonday = getMonday(now);
  let selectedDayDate = new Date(now);

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function render() {
    container.innerHTML = '';

    // Header Navigation & Actions
    const header = document.createElement('div');
    header.className = 'cal-header';
    header.style.flexWrap = 'wrap';
    header.style.justifyContent = 'space-between';
    header.style.gap = '10px';

    let headerTitle = '';
    if (viewMode === 'month') {
      headerTitle = `${MONTHS[month]} ${year}`;
    } else if (viewMode === 'week') {
      const sunday = new Date(currentMonday);
      sunday.setDate(sunday.getDate() + 6);
      const m1 = SHORT_MONTHS[currentMonday.getMonth()];
      const m2 = SHORT_MONTHS[sunday.getMonth()];
      const y1 = currentMonday.getFullYear();
      const y2 = sunday.getFullYear();
      if (m1 === m2 && y1 === y2) {
        headerTitle = `${currentMonday.getDate()} - ${sunday.getDate()} ${m1} ${y1}`;
      } else {
        headerTitle = `${currentMonday.getDate()} ${m1} - ${sunday.getDate()} ${m2} ${y2}`;
      }
    } else {
      const dayName = FULL_DAYS[selectedDayDate.getDay()];
      const dNum = selectedDayDate.getDate();
      const mName = SHORT_MONTHS[selectedDayDate.getMonth()];
      const yNum = selectedDayDate.getFullYear();
      headerTitle = `${dayName}, ${dNum} ${mName} ${yNum}`;
    }

    let statusSelectHtml = `<select id="cal-status-filter" class="form-select" style="width: auto; font-size: 0.82rem; padding: 3px 8px;">`;
    statusSelectHtml += `<option value="ALL">🔍 All Statuses</option>`;
    statusOptions.forEach(st => {
      statusSelectHtml += `<option value="${esc(st)}"${st === selectedStatus ? ' selected' : ''}>${esc(st)}</option>`;
    });
    statusSelectHtml += `</select>`;

    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-secondary btn-sm" id="cal-prev">◀</button>
        <h3 style="min-width:200px; text-align:center; margin:0; font-size:1.05rem; font-weight:700;">${headerTitle}</h3>
        <button class="btn btn-secondary btn-sm" id="cal-next">▶</button>
        <button class="btn btn-ghost btn-sm" id="cal-today">Today</button>
      </div>
      
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        
        <!-- Date Type Filter Buttons (Multi-Select) -->
        <div style="display:flex; align-items:center; gap:4px; background:var(--c-bg); padding:2px; border-radius:8px; border:1px solid var(--c-border);">
          <span style="font-size:0.75rem; font-weight:700; color:var(--c-text-muted); padding:0 4px;">📅 Date Filter:</span>
          <button type="button" id="btn-toggle-planned" class="btn btn-sm ${showPlanned ? 'btn-primary' : 'btn-secondary'}" style="padding:2px 8px; font-size:0.75rem; font-weight:700; ${showPlanned ? 'background:#F97316; border-color:#EA580C; color:#fff;' : ''}">
            🟠 Planned Date
          </button>
          <button type="button" id="btn-toggle-published" class="btn btn-sm ${showPublished ? 'btn-primary' : 'btn-secondary'}" style="padding:2px 8px; font-size:0.75rem; font-weight:700; ${showPublished ? 'background:#10B981; border-color:#059669; color:#fff;' : ''}">
            🟢 Published Date
          </button>
        </div>

        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.82rem; font-weight:600;" class="text-muted">Status:</span>
          ${statusSelectHtml}
        </div>

        <div class="view-toggle-btns" style="display:flex; gap:2px; background:var(--c-bg); padding:2px; border-radius:6px; border:1px solid var(--c-border);">
          <button id="cal-view-month" class="btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}" style="padding:2px 7px; font-size:0.75rem;">📅 Month</button>
          <button id="cal-view-week" class="btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}" style="padding:2px 7px; font-size:0.75rem;">📆 Week</button>
          <button id="cal-view-day" class="btn btn-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}" style="padding:2px 7px; font-size:0.75rem;">📌 Day</button>
        </div>
      </div>
    `;
    container.appendChild(header);

    const todayStr = fmtDate(new Date());
    const dateTypeFilterObj = { showPlanned, showPublished };

    if (viewMode === 'day') {
      // ── DAY VIEW RENDER ──
      const yStr = selectedDayDate.getFullYear();
      const mStr = String(selectedDayDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(selectedDayDate.getDate()).padStart(2, '0');
      const targetDateStr = `${yStr}-${mStr}-${dStr}`;

      const items = getItems ? getItems(selectedDayDate.getFullYear(), selectedDayDate.getMonth(), selectedStatus, dateTypeFilterObj) : [];
      const dayItems = items.filter(it => it.activeDate === targetDateStr);

      const dayViewWrapper = document.createElement('div');
      dayViewWrapper.className = 'cal-day-view-container card p-3';
      dayViewWrapper.style.minHeight = '360px';

      if (dayItems.length === 0) {
        dayViewWrapper.innerHTML = `
          <div class="empty-state" style="padding:30px 10px;">
            <div class="empty-icon" style="font-size:2.5rem;">📅</div>
            <p class="text-muted font-weight-600 m-0">No content found for ${targetDateStr} with selected date filters</p>
          </div>
        `;
      } else {
        let cardsHtml = `<h4 class="mb-3" style="color:var(--c-primary); border-bottom:1px solid var(--c-border); padding-bottom:6px;">📋 Items for ${targetDateStr} (${dayItems.length} items)</h4>`;
        cardsHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">`;
        
        dayItems.forEach(item => {
          const isPublished = item.dateType === 'published';
          const style = isPublished 
            ? 'border-left:4px solid #10B981; background:#ECFDF5; color:#064E3B;' 
            : 'border-left:4px solid #F97316; background:#FFF7ED; color:#7C2D12;';

          const tagBadge = isPublished
            ? '<span class="badge" style="background:#10B981; color:#fff; font-weight:700;">🟢 Published Date</span>'
            : '<span class="badge" style="background:#F97316; color:#fff; font-weight:700;">🟠 Planned Date</span>';

          cardsHtml += `
            <div class="cal-day-item-card card p-3" style="${style} cursor:pointer; position:relative;" data-id="${esc(item.id)}">
              <div class="flex-between mb-2">
                <span class="badge" style="font-size:0.8rem; font-weight:700; background:rgba(0,0,0,0.1);">${esc(item.id)}</span>
                ${tagBadge}
              </div>
              <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:6px; color:inherit;">${esc(item.title || item.hook || 'Untitled Content')}</h4>
              ${item.productName ? `<div style="font-size:0.8rem; margin-bottom:4px; opacity:0.85;">📦 ${esc(item.productName)}</div>` : ''}
              <div style="font-size:0.78rem; display:flex; gap:10px; flex-wrap:wrap; opacity:0.85;" class="mt-2">
                <span>🏷️ ${esc(item.contentType || '-')}</span>
                <span>📺 ${esc(item.channel || '-')}</span>
              </div>
            </div>
          `;
        });
        cardsHtml += `</div>`;
        dayViewWrapper.innerHTML = cardsHtml;
      }

      container.appendChild(dayViewWrapper);

      dayViewWrapper.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.cal-day-item-card');
        if (cardEl && onItemClick) {
          const item = dayItems.find(it => it.id === cardEl.dataset.id);
          if (item) onItemClick(item);
        }
      });

    } else {
      // ── MONTH & WEEK VIEWS RENDER ──
      const grid = document.createElement('div');
      grid.className = viewMode === 'month' ? 'cal-grid' : 'cal-grid cal-grid-week';

      DAYS.forEach(d => {
        const dh = document.createElement('div');
        dh.className = 'cal-day-header';
        dh.textContent = d;
        grid.appendChild(dh);
      });

      const items = getItems ? getItems(year, month, selectedStatus, dateTypeFilterObj) : [];

      if (viewMode === 'month') {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startOffset = (firstDay.getDay() + 6) % 7;

        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
          const d = prevMonthDays - i;
          const cell = createCell(d, true, '');
          grid.appendChild(cell);
        }

        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayOfWeek = (startOffset + d - 1) % 7;
          const isWeekend = dayOfWeek >= 5;
          const isToday = dateStr === todayStr;
          const dayItems = items.filter(it => it.activeDate === dateStr);

          const cell = createCell(d, false, dateStr, isWeekend, isToday, dayItems);
          grid.appendChild(cell);
        }

        const totalCells = startOffset + daysInMonth;
        const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let d = 1; d <= remaining; d++) {
          const cell = createCell(d, true, '');
          grid.appendChild(cell);
        }
      } else {
        // WEEK VIEW
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(currentMonday);
          dayDate.setDate(currentMonday.getDate() + i);

          const yStr = dayDate.getFullYear();
          const mStr = String(dayDate.getMonth() + 1).padStart(2, '0');
          const dStr = String(dayDate.getDate()).padStart(2, '0');
          const dateStr = `${yStr}-${mStr}-${dStr}`;

          const isWeekend = i >= 5;
          const isToday = dateStr === todayStr;
          const dayItems = items.filter(it => it.activeDate === dateStr);

          const displayLabel = `${dayDate.getDate()} ${SHORT_MONTHS[dayDate.getMonth()]}`;
          const cell = createCell(displayLabel, false, dateStr, isWeekend, isToday, dayItems);
          cell.classList.add('cal-cell-week');
          grid.appendChild(cell);
        }
      }

      container.appendChild(grid);

      grid.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.cal-item');
        if (itemEl && onItemClick) {
          const item = items.find(it => it.id === itemEl.dataset.id || it.displayId === itemEl.dataset.displayId);
          if (item) onItemClick(item);
          return;
        }
        const cell = e.target.closest('.cal-cell');
        if (cell && cell.dataset.date && onDayClick) {
          onDayClick(cell.dataset.date);
        }
      });
    }

    // Toggle Date Type Filter Listeners
    header.querySelector('#btn-toggle-planned').addEventListener('click', () => {
      if (showPlanned && !showPublished) return; // Prevent turning off both
      showPlanned = !showPlanned;
      render();
    });

    header.querySelector('#btn-toggle-published').addEventListener('click', () => {
      if (showPublished && !showPlanned) return; // Prevent turning off both
      showPublished = !showPublished;
      render();
    });

    // Nav Button Events
    header.querySelector('#cal-prev').addEventListener('click', () => {
      if (viewMode === 'month') {
        month--;
        if (month < 0) { month = 11; year--; }
      } else if (viewMode === 'week') {
        currentMonday.setDate(currentMonday.getDate() - 7);
        year = currentMonday.getFullYear();
        month = currentMonday.getMonth();
      } else {
        selectedDayDate.setDate(selectedDayDate.getDate() - 1);
        year = selectedDayDate.getFullYear();
        month = selectedDayDate.getMonth();
      }
      render();
    });

    header.querySelector('#cal-next').addEventListener('click', () => {
      if (viewMode === 'month') {
        month++;
        if (month > 11) { month = 0; year++; }
      } else if (viewMode === 'week') {
        currentMonday.setDate(currentMonday.getDate() + 7);
        year = currentMonday.getFullYear();
        month = currentMonday.getMonth();
      } else {
        selectedDayDate.setDate(selectedDayDate.getDate() + 1);
        year = selectedDayDate.getFullYear();
        month = selectedDayDate.getMonth();
      }
      render();
    });

    header.querySelector('#cal-today').addEventListener('click', () => {
      const t = new Date();
      year = t.getFullYear();
      month = t.getMonth();
      currentMonday = getMonday(t);
      selectedDayDate = new Date(t);
      render();
    });

    header.querySelector('#cal-status-filter').addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      render();
    });

    header.querySelector('#cal-view-month').addEventListener('click', () => {
      viewMode = 'month';
      render();
    });

    header.querySelector('#cal-view-week').addEventListener('click', () => {
      viewMode = 'week';
      render();
    });

    header.querySelector('#cal-view-day').addEventListener('click', () => {
      viewMode = 'day';
      render();
    });
  }

  function createCell(dayLabel, otherMonth, dateStr, isWeekend = false, isToday = false, dayItems = []) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (otherMonth) cell.classList.add('other-month');
    if (isWeekend) cell.classList.add('weekend');
    if (isToday) cell.classList.add('today');
    if (dateStr) cell.dataset.date = dateStr;

    let html = `<div class="cal-date">${dayLabel}</div>`;
    if (dayItems.length > 0) {
      html += '<div class="cal-items">';
      dayItems.forEach(item => {
        // Color Coding: Planned Date = Orange, Published Date = Green
        const isPublished = item.dateType === 'published';
        const style = isPublished
          ? 'background:#ECFDF5; color:#047857; border-left:3px solid #10B981; font-weight:700;'
          : 'background:#FFF7ED; color:#EA580C; border-left:3px solid #F97316; font-weight:700;';

        const titleText = item.title || item.hook || 'Untitled Content';
        const typeIcon = isPublished ? '🟢' : '🟠';

        html += `
          <div class="cal-item" style="${style}" data-id="${esc(item.id)}" data-display-id="${esc(item.displayId || '')}" title="[${isPublished ? 'Published' : 'Plan'}] ${esc(item.id)} : ${esc(titleText)} (${esc(item.status || '')})">
            <span class="cal-item-id">${typeIcon} ${esc(item.id)}</span>
            <span class="cal-item-sep">:</span>
            <span class="cal-item-title">${esc(titleText)}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    cell.innerHTML = html;
    return cell;
  }

  render();
  return { render, setMonth: (y, m) => { year = y; month = m; render(); } };
}
