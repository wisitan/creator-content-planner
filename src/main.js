/* ──────────────────────────────────────────
   🚀 Main — App Shell + Hash Router + Google Drive Sync
   ────────────────────────────────────────── */
import './style.css';
import { store } from './store.js';
import { showToast } from './components/toast.js';
import { initGoogleDrive, backupToDrive, syncFromDrive } from './google-drive.js';

const APP_VERSION = 'v2.9.0';

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-theme');
  }
}

// Initial Theme Apply
applyTheme(store.getTheme());

// ── View modules ──
import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderContent } from './views/content.js';
import { renderCalendar } from './views/calendar.js';
import { renderChannels } from './views/channels.js';
import { renderBrand } from './views/brand.js';
import { renderSponsors } from './views/sponsors.js';
import { renderSettings } from './views/settings.js';

// ── Routes ──
const ROUTES = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard',      render: renderDashboard },
  { id: 'products',  icon: '🛍️', label: 'Products',        render: renderProducts },
  { id: 'content',   icon: '📝', label: 'Content Planner', render: renderContent },
  { id: 'calendar',  icon: '📅', label: 'Calendar',        render: renderCalendar },
  { id: 'channels',  icon: '📺', label: 'Channels',        render: renderChannels },
  { id: 'brand',     icon: '🎨', label: 'Brand Identity',  render: renderBrand },
  { id: 'sponsors',  icon: '🤝', label: 'Sponsors',        render: renderSponsors },
  { id: 'settings',  icon: '⚙️', label: 'Settings',        render: renderSettings },
];

let currentRoute = null;

// ── Build App Shell ──
function buildShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>🎯</span>
        <span class="logo-text">Content Planner</span>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav"></nav>
      <div class="sidebar-footer">${APP_VERSION} · Data saved locally</div>
    </aside>
    <header class="topbar">
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-secondary btn-sm mobile-menu-toggle" id="btn-mobile-menu" title="Toggle Navigation Menu">☰</button>
        <div class="topbar-title" id="topbar-title">Dashboard</div>
      </div>
      <div class="topbar-actions">
        <button class="btn btn-primary btn-sm" id="btn-manual-save" title="Save data to local browser storage immediately">💾 Save</button>
        <button class="btn btn-secondary btn-sm" id="btn-gdrive-backup" title="Backup to Google Drive">☁️ Drive Backup</button>
        <button class="btn btn-secondary btn-sm" id="btn-gdrive-sync" title="Sync from Google Drive">🔄 Drive Sync</button>
        <button class="btn btn-secondary btn-sm" id="btn-export" title="Export data as JSON">📥 Export</button>
        <label class="btn btn-secondary btn-sm" title="Import data from JSON">
          📤 Import
          <input type="file" accept=".json" id="btn-import" style="display:none">
        </label>
        <button class="btn btn-primary btn-sm" id="btn-sample" title="Load sample data">📦 Sample</button>
      </div>
    </header>
    <main class="main-content" id="main-content"></main>
    <div class="toast-container" id="toast-container"></div>
  `;

  // Mobile Drawer Toggle
  const sidebar = document.querySelector('.sidebar');
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  if (btnMobileMenu) {
    btnMobileMenu.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Build nav items
  const nav = document.getElementById('sidebar-nav');
  ROUTES.forEach(r => {
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = '#' + r.id;
    a.dataset.route = r.id;
    a.innerHTML = `<span class="icon">${r.icon}</span><span class="label">${r.label}</span>`;
    a.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
    });
    nav.appendChild(a);
  });

  // Helper for Smart Sync Conflict Alert
  function handleDriveConflict(err) {
    const driveMeta = err.driveMeta || {};
    const localMeta = err.localMeta || {};
    const driveRecs = driveMeta.totalRecords ?? 'ไม่ทราบ';
    const localRecs = localMeta.totalRecords ?? 'ไม่ทราบ';
    const driveTime = driveMeta.lastUpdated && driveMeta.lastUpdated !== 'Unknown' ? new Date(driveMeta.lastUpdated).toLocaleString('th-TH') : 'ไม่ระบุเวลา';
    const localTime = localMeta.lastUpdated ? new Date(localMeta.lastUpdated).toLocaleString('th-TH') : 'ไม่ระบุเวลา';

    showModal({
      title: '⚠️ ตรวจพบข้อมูลบน Google Drive ที่ใหม่กว่า!',
      body: `
        <div class="p-1">
          <p class="text-danger font-weight-700 mb-2">ระบบป้องกันข้อมูลสูญหาย: ข้อมูลบน Google Drive มีอัปเดตใหม่กว่าในเครื่องนี้ค่ะ</p>
          <div class="card p-3 mb-3" style="background:#EFF6FF; border-left:4px solid #3B82F6;">
            <h4 style="margin:0 0 6px 0; color:#1D4ED8;">☁️ ข้อมูลบน Google Drive (สมบูรณ์กว่า):</h4>
            <ul style="margin:0; padding-left:20px; font-size:0.88rem;">
              <li>จำนวนรายการรวม: <strong>${driveRecs} รายการ</strong></li>
              <li>อัปเดตล่าสุดเมื่อ: <strong>${driveTime}</strong> (${driveMeta.deviceName || 'อุปกรณ์อื่น'})</li>
            </ul>
          </div>
          <div class="card p-3 mb-3" style="background:#FFFBEB; border-left:4px solid #F59E0B;">
            <h4 style="margin:0 0 6px 0; color:#B45309;">📱 ข้อมูลในเครื่องนี้ (เก่ากว่า):</h4>
            <ul style="margin:0; padding-left:20px; font-size:0.88rem;">
              <li>จำนวนรายการรวม: <strong>${localRecs} รายการ</strong></li>
              <li>อัปเดตล่าสุดเมื่อ: <strong>${localTime}</strong> (${localMeta.deviceName || 'เครื่องนี้'})</li>
            </ul>
          </div>
          <p class="text-muted" style="font-size:0.8rem;">กรุณาเลือกดำเนินการ:</p>
        </div>
      `,
      confirmText: '🔄 Sync ดึงข้อมูลใหม่จาก Drive (แนะนำ)',
      cancelText: '⚠️ เขียนทับข้อมูลบน Drive',
      onConfirm: () => {
        if (err.driveData) {
          store.importData(err.driveData);
          showToast('ซิงก์ดึงข้อมูลล่าสุดจาก Google Drive เรียบร้อยแล้วค่ะ! 🔄✅', 'success');
          setTimeout(() => location.reload(), 800);
        }
      },
      onCancel: async () => {
        try {
          showToast('กำลังเขียนทับข้อมูลบน Google Drive... ☁️', 'info');
          await backupToDrive(store._data, true);
          showToast('เขียนทับข้อมูลบน Google Drive เรียบร้อยแล้วค่ะ ☁️✅', 'warning');
        } catch (e) {
          showToast('Overwrite failed: ' + e.message, 'error');
        }
      }
    });
  }

  // Wire Manual Save Button (With Auto-Backup & Smart Conflict Guard)
  document.getElementById('btn-manual-save').addEventListener('click', async () => {
    store.forceSave();
    
    const googleClientId = store.getSettings().googleClientId;
    if (googleClientId) {
      try {
        await initGoogleDrive(googleClientId);
        await backupToDrive(store._data);
        showToast('บันทึกข้อมูลลงเครื่อง และ Auto Backup ขึ้น Google Drive เรียบร้อยแล้วค่ะ! 💾☁️✅', 'success');
      } catch (err) {
        if (err.isConflict) {
          handleDriveConflict(err);
        } else {
          showToast('บันทึกข้อมูลลงเครื่องเรียบร้อยแล้วค่ะ! 💾✅', 'success');
        }
      }
    } else {
      showToast('บันทึกข้อมูลลงเครื่องเรียบร้อยแล้วค่ะ! 💾✅', 'success');
    }
  });

  // Wire Google Drive Backup
  document.getElementById('btn-gdrive-backup').addEventListener('click', async () => {
    const googleClientId = store.getSettings().googleClientId;
    if (!googleClientId) {
      showToast('กรุณากรอก Google Client ID ในหน้า ⚙️ Settings ก่อนนะคะ', 'error');
      window.location.hash = '#settings';
      return;
    }
    try {
      showToast('กำลังเชื่อมต่อ Google Drive... ☁️', 'info');
      await initGoogleDrive(googleClientId);
      await backupToDrive(store._data);
      showToast('Backup ไปยัง Google Drive สำเร็จแล้ว! ☁️✅', 'success');
    } catch (err) {
      if (err.isConflict) {
        handleDriveConflict(err);
      } else {
        showToast('Drive Backup Failed: ' + err.message, 'error');
      }
    }
  });

  // Wire Google Drive Sync
  document.getElementById('btn-gdrive-sync').addEventListener('click', async () => {
    const googleClientId = store.getSettings().googleClientId;
    if (!googleClientId) {
      showToast('กรุณากรอก Google Client ID ในหน้า ⚙️ Settings ก่อนนะคะ', 'error');
      window.location.hash = '#settings';
      return;
    }
    if (!confirm('ต้องการ Sync ดึงข้อมูลจาก Google Drive มาทับข้อมูลปัจจุบันใช่หรือไม่?')) return;
    try {
      showToast('กำลัง Sync จาก Google Drive... 🔄', 'info');
      await initGoogleDrive(googleClientId);
      const data = await syncFromDrive();
      store._data = data;
      store._persist();
      store.emit('change', 'all');
      showToast('Sync ข้อมูลจาก Google Drive สำเร็จเรียบร้อย! 🔄✅', 'success');
      navigate(currentRoute || 'dashboard');
    } catch (err) {
      showToast('Drive Sync Failed: ' + err.message, 'error');
    }
  });

  // Wire up top-bar actions
  document.getElementById('btn-export').addEventListener('click', () => {
    store.exportAll();
    showToast('Data exported! ✅', 'success');
  });

  document.getElementById('btn-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await store.importAll(file);
      showToast('Data imported! ✅', 'success');
      navigate(currentRoute || 'dashboard');
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  document.getElementById('btn-sample').addEventListener('click', () => {
    if (confirm('Load sample data? ข้อมูลเดิมจะถูกแทนที่')) {
      store.loadSampleData();
      showToast('Sample data loaded! 📦', 'success');
      navigate(currentRoute || 'dashboard');
    }
  });
}

// ── Router ──
function navigate(routeId) {
  const route = ROUTES.find(r => r.id === routeId) || ROUTES[0];
  currentRoute = route.id;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route.id);
  });

  document.getElementById('topbar-title').textContent = route.icon + ' ' + route.label;

  const main = document.getElementById('main-content');
  main.innerHTML = '';
  main.className = 'main-content view-enter';

  try {
    route.render(main, store);
  } catch (err) {
    main.innerHTML = `<div class="card"><h2>⚠️ Error loading view</h2><p>${err.message}</p></div>`;
    console.error(err);
  }
}

function onHashChange() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  navigate(hash);
}

// ── Init ──
buildShell();
window.addEventListener('hashchange', onHashChange);
onHashChange();

store.on('error', (msg) => {
  showToast(msg, 'error');
});
