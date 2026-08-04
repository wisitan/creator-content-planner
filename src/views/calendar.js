import { CalendarGrid } from '../components/calendar-grid.js';
import { showToast } from '../components/toast.js';

export function renderCalendar(container, store) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card view-enter';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header';
  cardHeader.innerHTML = `
    <div>
      <h2>📅 Monthly Calendar / ปฏิทินวางแผนคอนเทนต์</h2>
      <p class="text-muted">
        (คลิกที่การ์ดคอนเทนต์เพื่อเด้งไปยังแถวนั้นใน Content Planner | สลับกรองสถานะได้ | คอนเทนต์ที่ 📤 Published จะยึดตาม Published Date ส่วนสถานะอื่นยึดตาม Planned Date)
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
      showToast(`Date selected: ${dateStr} (ไปที่ Content Planner เพื่อเพิ่มงานใหม่)`, 'info');
    },
    onItemClick: (item) => {
      // Navigate to Content Planner view and filter/highlight target row
      window.location.hash = '#content';
      setTimeout(() => {
        const searchInput = document.querySelector('#etable-search');
        if (searchInput) {
          searchInput.value = item.id;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          showToast(`🎯 Found Row: ${item.id} — ${item.title || item.hook || ''}`, 'success');
        }
      }, 150);
    }
  });
}

export function render(container, store) {
  renderCalendar(container, store);
}
