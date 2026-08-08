import { CalendarGrid } from '../components/calendar-grid.js';
import { showToast } from '../components/toast.js';
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

  CalendarGrid(calContainer, {
    getItems: (year, month) => {
      const items = store.getContentForMonth(year, month);
      return items.map(c => ({
        id: c.id,
        title: c.title || c.hook || c.contentAngle || c.id,
        type: c.contentType,
        date: c.activeDate || c.publishedDate || c.plannedDate,
        status: c.status
      }));
    },
    onDayClick: (dateStr) => {
      showToast(`Selected date: ${dateStr}`, 'info');
    },
    onItemClick: (item) => {
      const c = store.getContent().find(x => x.id === item.id);
      if (!c) return;
      
      const prodName = store.getProductName(c.productId);
      alert(
        `📝 Content Details\n\n` +
        `ID: ${c.id}\n` +
        `Title: ${c.title || '-'}\n` +
        `Type: ${c.contentType || '-'}\n` +
        `Product: ${prodName}\n` +
        `Angle: ${c.contentAngle || '-'}\n` +
        `Channel: ${c.channel || '-'}\n` +
        `Planned Date: ${c.plannedDate || '-'}\n` +
        `Status: ${c.status || '-'}`
      );
    }
  });
}

export function render(container, store) {
  renderCalendar(container, store);
}
