/* ──────────────────────────────────────────
   Calendar Grid Component 
   (With Month, Week & Day Views, Single-Line Content Format, Status Filter Chips, Dynamic Color Logic & Rich Item Modal)
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

  // Week & Day Views state
  let currentMonday = getMonday(now);
  let selectedDayDate = new Date(now);

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function getItemColorStyle(item, todayStr) {
    const statusStr = item.status || '';
    const isPublished = statusStr.includes('Published');
    const pubDate = item.publishedPlan || item.publishedDate || item.activeDate || '';

    // 1. If status is Published -> BLUE COLOR (Completed 🟦)
    if (isPublished) {
      return {
        style: 'background:#EFF6FF; color:#1D4ED8; border-left:3px solid #3B82F6;',
        badgeClass: 'badge-blue',
        statusText: 'Published'
      };
    }

    // 2. If past publishedPlan and NOT Published -> ORANGE COLOR (Overdue 🟧)
    if (pubDate && pubDate < todayStr) {
      return {
        style: 'background:#FFF7ED; color:#C2410C; border-left:3px solid #F97316; font-weight:600;',
        badgeClass: 'badge-orange',
        statusText: 'Overdue / Pending'
      };
    } 
    
    // 3. If today or future publishedPlan and NOT Published -> GREEN COLOR (On Track 🟩)
    return {
      style: 'background:#F0FDF4; color:#15803D; border-left:3px solid #22C55E;',
      badgeClass: 'badge-green',
      statusText: 'On Track'
    };
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
      // Day View Header Title
      const dayName = FULL_DAYS[selectedDayDate.getDay()];
      const dNum = selectedDayDate.getDate();
      const mName = SHORT_MONTHS[selectedDayDate.getMonth()];
      const yNum = selectedDayDate.getFullYear();
      headerTitle = `${dayName}, ${dNum} ${mName} ${yNum}`;
    }

    // Status Filter Chips Bar (Replacing Dropdown List)
    let statusChipsHtml = `<div class="status-chips-bar" style="display:flex; gap:4px; flex-wrap:wrap; align-items:center;">`;
    const allActive = selectedStatus === 'ALL';
    statusChipsHtml += `
      <button class="btn btn-sm ${allActive ? 'btn-primary' : 'btn-secondary'} btn-status-chip" data-status="ALL" style="padding:2px 10px; font-size:0.78rem; border-radius:14px; font-weight:600;">
        🔍 All Statuses
      </button>
    `;
    statusOptions.forEach(st => {
      const active = selectedStatus === st;
      statusChipsHtml += `
        <button class="btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'} btn-status-chip" data-status="${esc(st)}" style="padding:2px 10px; font-size:0.78rem; border-radius:14px; font-weight:500;">
          ${esc(st)}
        </button>
      `;
    });
    statusChipsHtml += `</div>`;

    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-secondary btn-sm" id="cal-prev">◀</button>
        <h3 style="min-width:200px; text-align:center; margin:0; font-size:1.05rem; font-weight:700;">${headerTitle}</h3>
        <button class="btn btn-secondary btn-sm" id="cal-next">▶</button>
        <button class="btn btn-ghost btn-sm" id="cal-today">Today</button>
      </div>
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-size:0.82rem; font-weight:600;" class="text-muted">Filter:</span>
          ${statusChipsHtml}
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

    if (viewMode === 'day') {
      // ── DAY VIEW RENDER (Vertical Detailed Day Cards) ──
      const yStr = selectedDayDate.getFullYear();
      const mStr = String(selectedDayDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(selectedDayDate.getDate()).padStart(2, '0');
      const targetDateStr = `${yStr}-${mStr}-${dStr}`;

      const items = getItems ? getItems(selectedDayDate.getFullYear(), selectedDayDate.getMonth(), selectedStatus) : [];
      const dayItems = items.filter(it => it.activeDate === targetDateStr);

      const dayViewWrapper = document.createElement('div');
      dayViewWrapper.className = 'cal-day-view-container card p-3';
      dayViewWrapper.style.minHeight = '360px';

      if (dayItems.length === 0) {
        dayViewWrapper.innerHTML = `
          <div class="empty-state" style="padding:30px 10px;">
            <div class="empty-icon" style="font-size:2.5rem;">📅</div>
            <p class="text-muted font-weight-600 m-0">No content published for ${targetDateStr} · ไม่มีแผนคอนเทนต์สำหรับวันนี้</p>
          </div>
        `;
      } else {
        let cardsHtml = `<h4 class="mb-3" style="color:var(--c-primary); border-bottom:1px solid var(--c-border); padding-bottom:6px;">📋 Items for Today (${dayItems.length} items)</h4>`;
        cardsHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">`;
        
        dayItems.forEach(item => {
          const colorObj = getItemColorStyle(item, todayStr);

          cardsHtml += `
            <div class="cal-day-item-card card p-3" style="${colorObj.style} cursor:pointer; position:relative;" data-id="${esc(item.id)}">
              <div class="flex-between mb-2">
                <span class="badge" style="font-size:0.8rem; font-weight:700;">${esc(item.id)}</span>
                <span class="badge" style="font-size:0.75rem;">${esc(item.status || '')}</span>
              </div>
              <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:6px; color:inherit;">${esc(item.title || item.hook || 'Untitled Content')}</h4>
              ${item.productName ? `<div style="font-size:0.8rem; margin-bottom:4px;" class="text-muted">📦 ${esc(item.productName)}</div>` : ''}
              <div style="font-size:0.78rem; display:flex; gap:10px; flex-wrap:wrap; opacity:0.85;" class="mt-2">
                <span>🏷️ ${esc(item.contentType || '-')}</span>
                <span>📌 ${esc(item.channel || '-')}</span>
                <span>📅 Pub: ${esc(item.publishedDate || '-')}</span>
              </div>
            </div>
          `;
        });
        cardsHtml += `</div>`;
        dayViewWrapper.innerHTML = cardsHtml;
      }

      container.appendChild(dayViewWrapper);

      // Event listener for day view cards click
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

      // Day Headers (Mon - Sun)
      DAYS.forEach(d => {
        const dh = document.createElement('div');
        dh.className = 'cal-day-header';
        dh.textContent = d;
        grid.appendChild(dh);
      });

      const items = getItems ? getItems(year, month, selectedStatus) : [];

      if (viewMode === 'month') {
        // MONTH VIEW
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startOffset = (firstDay.getDay() + 6) % 7;

        // Fill Previous Month Days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
          const d = prevMonthDays - i;
          const cell = createCell(d, true, '', false, false, [], todayStr);
          grid.appendChild(cell);
        }

        // Current Month Days
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayOfWeek = (startOffset + d - 1) % 7;
          const isWeekend = dayOfWeek >= 5;
          const isToday = dateStr === todayStr;
          const dayItems = items.filter(it => it.activeDate === dateStr);

          const cell = createCell(d, false, dateStr, isWeekend, isToday, dayItems, todayStr);
          grid.appendChild(cell);
        }

        // Fill Next Month Days
        const totalCells = startOffset + daysInMonth;
        const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let d = 1; d <= remaining; d++) {
          const cell = createCell(d, true, '', false, false, [], todayStr);
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
          const cell = createCell(displayLabel, false, dateStr, isWeekend, isToday, dayItems, todayStr);
          cell.classList.add('cal-cell-week');
          grid.appendChild(cell);
        }
      }

      container.appendChild(grid);

      // Item & Day Click Handlers for Grid
      grid.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.cal-item');
        if (itemEl && onItemClick) {
          const item = items.find(it => it.id === itemEl.dataset.id);
          if (item) onItemClick(item);
          return;
        }
        const cell = e.target.closest('.cal-cell');
        if (cell && cell.dataset.date && onDayClick) {
          onDayClick(cell.dataset.date);
        }
      });
    }

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

    // Status Chip Bar Event Listener
    header.addEventListener('click', (e) => {
      const chipBtn = e.target.closest('.btn-status-chip');
      if (chipBtn) {
        selectedStatus = chipBtn.dataset.status;
        render();
      }
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

  function createCell(dayLabel, otherMonth, dateStr, isWeekend = false, isToday = false, dayItems = [], todayStr = '') {
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
        const colorObj = getItemColorStyle(item, todayStr);
        const titleText = item.title || item.hook || 'Untitled Content';
        const statusIcon = item.status ? item.status.split(' ')[0] : '';

        // Single-line format strictly truncated with Dynamic Color Logic
        html += `
          <div class="cal-item" style="${colorObj.style}" data-id="${esc(item.id)}" title="${esc(item.id)} : ${esc(titleText)} (${esc(item.status || '')} - ${colorObj.statusText})">
            <span class="cal-item-id">${esc(item.id)}</span>
            <span class="cal-item-sep">:</span>
            <span class="cal-item-title">${esc(titleText)}</span>
            <span class="cal-item-status">${statusIcon}</span>
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
