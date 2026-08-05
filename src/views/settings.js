import { showToast } from '../components/toast.js';

export function renderSettings(container, store) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>⚙️ Settings & Data Management / ตั้งค่าและจัดการข้อมูล</h2>
      <p class="text-muted">ปรับแต่งรายการ Dropdown List, กำหนด Google Client ID สำหรับ Sync ข้อมูล และจัดการการลบข้อมูลทั้งหมด</p>
    </div>
  `;
  container.appendChild(header);

  // Google Drive Client ID Config Card
  const gdriveCard = document.createElement('div');
  gdriveCard.className = 'card mb-4 view-enter';
  const currentClientId = store.getSettings().googleClientId || '';
  
  gdriveCard.innerHTML = `
    <div class="card-header" style="background:var(--c-dark); color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
      <h3 class="m-0" style="font-size:1rem;">☁️ Google Drive Integration Configuration</h3>
    </div>
    <div class="card-body p-3">
      <div class="form-group mb-2">
        <label class="form-label" style="font-weight:bold;">Google OAuth Client ID (รหัสสำหรับเชื่อมต่อ Google Drive):</label>
        <div style="display:flex; gap:8px;">
          <input type="password" id="gdrive-client-id" class="form-input" placeholder="e.g. xxxxxxxxxxxx-xxxxxxxxxxxx.apps.googleusercontent.com" value="${currentClientId}" style="flex:1;">
          <button id="btn-toggle-clientid" class="btn btn-secondary" title="แสดง/ซ่อนรหัส">👁️</button>
          <button id="btn-save-gdrive" class="btn btn-primary">💾 Save Client ID</button>
        </div>
        <p class="text-muted mt-1" style="font-size:0.8rem;">
          🔒 <strong>ความปลอดภัย:</strong> Client ID เป็นเพียงรหัสสาธารณะสำหรับยืนยันแบรนด์กับ Google (Client Secret จะถูกซ่อนอย่างปลอดภัย)
        </p>
      </div>
    </div>
  `;
  container.appendChild(gdriveCard);

  const inputId = gdriveCard.querySelector('#gdrive-client-id');
  gdriveCard.querySelector('#btn-toggle-clientid').addEventListener('click', () => {
    inputId.type = inputId.type === 'password' ? 'text' : 'password';
  });

  gdriveCard.querySelector('#btn-save-gdrive').addEventListener('click', () => {
    const val = inputId.value.trim();
    const settings = store.getSettings();
    settings.googleClientId = val;
    store.updateSettingList('googleClientId', val);
    showToast('บันทึก Google Client ID เรียบร้อยแล้ว! 💾☁️', 'success');
  });

  // Danger Zone: Clear All Data Card
  const dangerCard = document.createElement('div');
  dangerCard.className = 'card mb-4 view-enter';
  dangerCard.style.border = '1px solid #fca5a5';
  dangerCard.innerHTML = `
    <div class="card-header" style="background:#fee2e2; color:#991b1b; padding:10px 16px; border-radius:8px 8px 0 0;">
      <h3 class="m-0" style="font-size:1rem;">⚠️ Danger Zone / เขตอันตราย</h3>
    </div>
    <div class="card-body p-3 flex-between">
      <div>
        <h4 class="m-0 text-danger" style="font-size:0.95rem;">🗑️ Reset & Delete All Data / ลบข้อมูลทั้งหมด</h4>
        <p class="text-muted m-0" style="font-size:0.85rem;">ลบข้อมูลสินค้า คอนเทนต์ ช่องทาง และแบรนด์ทั้งหมดในระบบเพื่อตั้งต้นใหม่</p>
      </div>
      <button id="btn-clear-all-data" class="btn btn-danger">🗑️ ลบข้อมูลทั้งหมด</button>
    </div>
  `;
  container.appendChild(dangerCard);

  dangerCard.querySelector('#btn-clear-all-data').addEventListener('click', () => {
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
