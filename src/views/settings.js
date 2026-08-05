import { showToast } from '../components/toast.js';

export function renderSettings(container, store) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-header flex-between mb-4';
  header.innerHTML = `
    <div>
      <h2>⚙️ Settings / ปรับแต่งการใช้งาน</h2>
      <p class="text-muted">ปรับแต่งตัวเลือกรายการ Dropdown List ในระบบ และจัดการลบข้อมูล</p>
    </div>
    <div>
      <button id="btn-clear-all-data" class="btn btn-danger">🗑️ ลบข้อมูลทั้งหมด</button>
    </div>
  `;
  container.appendChild(header);

  // Wire clear all data button with confirmation dialog
  header.querySelector('#btn-clear-all-data').addEventListener('click', () => {
    if (confirm('🚨 คำเตือนสำคัญ!\n\nคุณแน่ใจหรือไม่ว่าต้องการ "ลบข้อมูลทั้งหมด"?\nข้อมูลสินค้า, แผนคอนเทนต์ และข้อมูลแบรนด์ทั้งหมดจะถูกลบออกจากเครื่องและไม่สามารถกู้คืนได้')) {
      store.clearAll();
      showToast('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว 🗑️✅', 'success');
      renderSettings(container, store);
    }
  });

  // Settings Grid
  const settingsGrid = document.createElement('div');
  settingsGrid.className = 'settings-grid view-enter';
  container.appendChild(settingsGrid);

  const lists = [
    { key: 'channels', label: 'Channels / ช่องทาง' },
    { key: 'contentPillars', label: 'Content Pillars / เสาหลัก' },
    { key: 'productCategories', label: 'Product Categories / หมวดสินค้า' },
    { key: 'contentTypes', label: 'Content Types / ประเภท content' },
    { key: 'contentAngles', label: 'Content Angles / มุมขาย' },
    { key: 'contentStatuses', label: 'Content Status / สถานะ content' },
    { key: 'productStatuses', label: 'Product Status / สถานะสินค้า' },
    { key: 'priceRanges', label: 'Price Ranges / ช่วงราคา' },
    { key: 'ctaTypes', label: 'CTA Types / ประเภท CTA' },
    { key: 'dealTypes', label: 'Deal Types / ประเภท deal' },
    { key: 'paymentStatuses', label: 'Payment Status / สถานะการจ่าย' },
  ];

  lists.forEach(item => {
    const card = document.createElement('div');
    card.className = 'setting-list';
    
    const items = store.getSettingList(item.key) || [];
    let itemsHtml = items.map((val, idx) => `
      <div class="setting-item">
        <input type="text" value="${val}" data-key="${item.key}" data-index="${idx}" class="setting-item-input">
        <button class="remove-btn" data-key="${item.key}" data-index="${idx}">&times;</button>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="setting-list-header">
        <span>${item.label}</span>
      </div>
      <div class="setting-list-body">
        <div class="setting-items-container">${itemsHtml}</div>
        <div class="setting-add" data-key="${item.key}">+ Add item</div>
      </div>
    `;

    settingsGrid.appendChild(card);
  });

  // Wire list events
  settingsGrid.addEventListener('change', (e) => {
    if (e.target.classList.contains('setting-item-input')) {
      const key = e.target.dataset.key;
      const idx = parseInt(e.target.dataset.index);
      const items = store.getSettingList(key);
      items[idx] = e.target.value;
      store.updateSettingList(key, items);
      showToast('Setting updated! ⚙️', 'info');
    }
  });

  settingsGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const key = e.target.dataset.key;
      const idx = parseInt(e.target.dataset.index);
      store.removeSettingItem(key, idx);
      renderSettings(container, store);
    }
    if (e.target.classList.contains('setting-add')) {
      const key = e.target.dataset.key;
      store.addSettingItem(key, 'New Item');
      renderSettings(container, store);
    }
  });
}

export function render(container, store) {
  renderSettings(container, store);
}
