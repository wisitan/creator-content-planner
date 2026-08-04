/* ──────────────────────────────────────────
   Calendar Grid Component (With Status Filter & Rich Cards)
   ────────────────────────────────────────── */
import { esc, fmtDate } from '../utils.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function CalendarGrid(container, config) {
  const { getItems, onDayClick, onItemClick, statusOptions = [] } = config;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let selectedStatus = 'ALL';

  function render() {
    container.innerHTML = '';

    // Header with status filter and month navigation
    const header = document.createElement('div');
    header.className = 'cal-header';
    header.style.flexWrap = 'wrap';
    header.style.justify = 'space-between';

    let statusSelectHtml = `<select id="cal-status-filter" class="form-select" style="width: auto; font-size: 0.85rem; padding: 4px 8px;">`;
    statusSelectHtml += `<option value="ALL">🔍 All Statuses (แสดงทุกสถานะ)</option>`;
    statusOptions.forEach(st => {
      statusSelectHtml += `<option value="${esc(st)}"${st === selectedStatus ? ' selected' : ''}>${esc(st)}</option>`;
    });
    statusSelectHtml += `</select>`;

    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-secondary btn-sm" id="cal-prev">◀</button>
        <h2 style="min-width:180px; text-align:center;">${MONTHS[month]} ${year}</h2>
        <button class="btn btn-secondary btn-sm" id="cal-next">▶</button>
        <button class="btn btn-ghost btn-sm" id="cal-today">Today</button>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-size:0.85rem; font-weight:600;">Status Filter:</label>
        ${statusSelectHtml}
      </div>
    `;
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    // Day headers
    DAYS.forEach(d => {
      const dh = document.createElement('div');
      dh.className = 'cal-day-header';
      dh.textContent = d;
      grid.appendChild(dh);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const todayStr = fmtDate(new Date());
    const items = getItems ? getItems(year, month, selectedStatus) : [];

    // Fill Previous Month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const cell = createCell(d, true, '');
      grid.appendChild(cell);
    }

    // Current Month Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (startOffset + d - 1) % 7;
      const isWeekend = dayOfWeek >= 5;
      const isToday = dateStr === todayStr;
      
      // Match items by activeDate (Planned Date or Published Date for 📤 Published)
      const dayItems = items.filter(it => it.activeDate === dateStr);

      const cell = createCell(d, false, dateStr, isWeekend, isToday, dayItems);
      grid.appendChild(cell);
    }

    // Fill Next Month
    const totalCells = startOffset + daysInMonth;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
      const cell = createCell(d, true, '');
      grid.appendChild(cell);
    }

    container.appendChild(grid);

    // Nav Events
    header.querySelector('#cal-prev').addEventListener('click', () => { month--; if (month < 0) { month = 11; year--; } render(); });
    header.querySelector('#cal-next').addEventListener('click', () => { month++; if (month > 11) { month = 0; year++; } render(); });
    header.querySelector('#cal-today').addEventListener('click', () => { year = now.getFullYear(); month = now.getMonth(); render(); });
    header.querySelector('#cal-status-filter').addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      render();
    });

    // Day & Item Click Events
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

  function createCell(day, otherMonth, dateStr, isWeekend = false, isToday = false, dayItems = []) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (otherMonth) cell.classList.add('other-month');
    if (isWeekend) cell.classList.add('weekend');
    if (isToday) cell.classList.add('today');
    if (dateStr) cell.dataset.date = dateStr;

    let html = `<div class="cal-date">${day}</div>`;
    if (dayItems.length > 0) {
      html += '<div class="cal-items">';
      dayItems.forEach(item => {
        const colorMap = {
          '🛒 Affiliate': 'background:var(--c-affiliate-lt);color:var(--c-affiliate);border-left:3px solid var(--c-affiliate);',
          '🎯 Personal Brand': 'background:var(--c-branding-lt);color:var(--c-branding);border-left:3px solid var(--c-branding);',
          '📚 Knowledge': 'background:var(--c-knowledge-lt);color:var(--c-knowledge);border-left:3px solid var(--c-knowledge);',
          '🤝 Sponsor': 'background:var(--c-sponsor-lt);color:var(--c-sponsor);border-left:3px solid var(--c-sponsor);',
        };
        const style = colorMap[item.contentType] || 'background:var(--c-bg);color:var(--c-text);';
        
        const titleText = item.title || item.hook || item.id;
        const prodText = item.productName ? `📦 ${item.productName}` : '';
        const statusIcon = item.status ? item.status.split(' ')[0] : '';

        html += `
          <div class="cal-item" style="${style} padding:4px 6px; font-size:0.75rem; line-height:1.25;" data-id="${esc(item.id)}" title="Click to view row in Content Planner">
            <div style="font-weight:700; display:flex; justify-content:space-between; align-items:center;">
              <span>${esc(item.id)}</span>
              <span>${statusIcon}</span>
            </div>
            <div style="font-weight:600; font-size:0.8rem; margin:2px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${esc(titleText)}
            </div>
            ${prodText ? `<div style="font-size:0.7rem; opacity:0.85; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(prodText)}</div>` : ''}
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
