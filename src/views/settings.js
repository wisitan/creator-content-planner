import { showToast } from '../components/toast.js';
import { applyTheme } from '../main.js';

export function renderSettings(container, store) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-header flex-between mb-3';
  header.innerHTML = `
    <div>
      <h2>⚙️ Settings / ปรับแต่งการใช้งาน</h2>
      <p class="text-muted">ปรับแต่งธีมหน้าจอ (Light/Dark Mode), ตัวเลือก Dropdown List และจัดการข้อมูล</p>
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

  // 🌙 Dark Theme Toggle Card
  const themeCard = document.createElement('div');
  themeCard.className = 'card mb-4 view-enter p-3 flex-between';
  const currentTheme = store.getTheme();
  const isDark = currentTheme === 'dark';

  themeCard.innerHTML = `
    <div>
      <h3 class="m-0" style="font-size:1.05rem; display:flex; align-items:center; gap:8px;">
        ${isDark ? '🌙 Dark Theme / ธีมมืด' : '☀️ Light Theme / ธีมสว่าง'}
      </h3>
      <p class="text-muted m-0" style="font-size:0.85rem;">สลับโหมดการแสดงผลหน้าจอระหว่าง Light Mode และ Dark Mode</p>
    </div>
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:0.85rem; font-weight:700; color:${isDark ? '#6366F1' : '#475569'};">${isDark ? 'DARK MODE' : 'LIGHT MODE'}</span>
      <label class="theme-toggle-switch">
        <input type="checkbox" id="toggle-theme-cb" ${isDark ? 'checked' : ''}>
        <span class="theme-slider"></span>
      </label>
    </div>
  `;
  container.appendChild(themeCard);

  themeCard.querySelector('#toggle-theme-cb').addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    store.setTheme(newTheme);
    applyTheme(newTheme);
    showToast(`สลับใช้งาน ${newTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'} เรียบร้อย!`, 'info');
    renderSettings(container, store);
  });

  // ⏪ Data Recovery / Restore Card
  const recoveryCard = document.createElement('div');
  recoveryCard.className = 'card mb-4 view-enter p-3';
  recoveryCard.style.borderLeft = '4px solid #6366F1';
  
  const snapshotInfo = store.getLastLocalSnapshotInfo();
  const snapshotText = snapshotInfo 
    ? `พบ Snapshot เซฟล่าสุดในเครื่องเมื่อ: ${new Date(snapshotInfo.snapshotTime).toLocaleString('th-TH')} (${snapshotInfo.reason}) — สินค้า: ${snapshotInfo.productsCount} | คอนเทนต์: ${snapshotInfo.contentCount}`
    : 'ยังไม่มีประวัติ Snapshot ก่อนหน้านี้ในเครื่อง';

  recoveryCard.innerHTML = `
    <div class="flex-between">
      <div>
        <h3 class="m-0" style="font-size:1.05rem; display:flex; align-items:center; gap:8px;">
          ⏪ Emergency Local Restore / กู้คืนข้อมูลเซฟล่าสุดในเครื่อง
        </h3>
        <p class="text-muted m-0 mt-1" style="font-size:0.85rem;">
          ${snapshotText}
        </p>
      </div>
      <div>
        <button id="btn-restore-last-save" class="btn btn-secondary" ${!snapshotInfo ? 'disabled' : ''}>
          ⏪ Restore Last Save
        </button>
      </div>
    </div>
  `;
  container.appendChild(recoveryCard);

  recoveryCard.querySelector('#btn-restore-last-save')?.addEventListener('click', () => {
    if (!snapshotInfo) return;
    const timeStr = new Date(snapshotInfo.snapshotTime).toLocaleString('th-TH');
    showModal({
      title: '⏪ กู้คืนข้อมูลสำรองในเครื่อง (Local Restore)',
      body: `
        <div class="p-1">
          <p class="text-primary font-weight-700 mb-2">ระบบเตรียมกู้คืนข้อมูลสำรองเซฟล่าสุดในเครื่องดังนี้ค่ะ:</p>
          <div class="card p-3 mb-3" style="background:#EFF6FF; border-left:4px solid #3B82F6;">
            <ul style="margin:0; padding-left:18px; font-size:0.88rem;">
              <li>ประทับเวลาเซฟ: <strong>${timeStr}</strong></li>
              <li>เหตุผลการเซฟ: <strong>${snapshotInfo.reason}</strong></li>
              <li>รายการสินค้า: <strong>${snapshotInfo.productsCount} รายการ</strong></li>
              <li>แผนคอนเทนต์: <strong>${snapshotInfo.contentCount} รายการ</strong></li>
            </ul>
          </div>
          <p class="text-muted" style="font-size:0.82rem;">ต้องการกู้คืนข้อมูลชุดนี้กลับมาแทนที่ปัจจุบันหรือไม่คะ?</p>
        </div>
      `,
      confirmText: '⏪ ยืนยันกู้คืนข้อมูล (Restore Now)',
      cancelText: '❌ ยกเลิก',
      onConfirm: () => {
        try {
          store.restoreLastLocalSnapshot();
          showToast('กู้คืนข้อมูลเซฟล่าสุดในเครื่องเรียบร้อยแล้วค่ะ! ⏪✅', 'success');
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          showToast('Restore Failed: ' + err.message, 'error');
        }
      }
    });
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
    { key: 'productTypes', label: 'Product Types / ประเภทสินค้า' },
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
