/* ──────────────────────────────────────────
   🚀 Main — App Shell + Hash Router + Google Drive Sync + i18n
   ────────────────────────────────────────── */
import './style.css';
import { store } from './store.js';
import { showToast } from './components/toast.js';
import { initGoogleDrive, backupToDrive, syncFromDrive } from './google-drive.js';
import { getLang, setLang, t } from './i18n.js';

const APP_VERSION = 'v1.9.3';

// Apply saved Language & Theme
setLang(store.getLanguage());

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
const getRoutes = () => [
  { id: 'dashboard', icon: '📊', label: t('nav_dashboard'), render: renderDashboard },
  { id: 'products',  icon: '🛍️', label: t('nav_products'),  render: renderProducts },
  { id: 'content',   icon: '📝', label: t('nav_content'),   render: renderContent },
  { id: 'calendar',  icon: '📅', label: t('nav_calendar'),  render: renderCalendar },
  { id: 'channels',  icon: '📺', label: t('nav_channels'),  render: renderChannels },
  { id: 'brand',     icon: '🎨', label: t('nav_brand'),     render: renderBrand },
  { id: 'sponsors',  icon: '🤝', label: t('nav_sponsors'),  render: renderSponsors },
  { id: 'settings',  icon: '⚙️', label: t('nav_settings'),  render: renderSettings },
];

let currentRoute = null;

// ── Build App Shell ──
function buildShell() {
  const routes = getRoutes();
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
  routes.forEach(r => {
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

  // Wire Manual Save Button
  document.getElementById('btn-manual-save').addEventListener('click', () => {
    store.forceSave();
    showToast(getLang() === 'th' ? 'บันทึกข้อมูลลงในเครื่องนี้เรียบร้อยแล้วค่ะ! 💾✅' : 'Data saved locally successfully! 💾✅', 'success');
  });

  // Wire Google Drive Backup
  document.getElementById('btn-gdrive-backup').addEventListener('click', async () => {
    const googleClientId = store.getSettings().googleClientId;
    if (!googleClientId) {
      showToast(getLang() === 'th' ? 'กรุณากรอก Google Client ID ในหน้า ⚙️ Settings ก่อนนะคะ' : 'Please enter Google Client ID in ⚙️ Settings first.', 'error');
      window.location.hash = '#settings';
      return;
    }
    try {
      store.forceSave();
      showToast(getLang() === 'th' ? 'กำลังเชื่อมต่อและอัปโหลดข้อมูลในเครื่องขึ้น Google Drive... ☁️' : 'Connecting & uploading local data to Google Drive... ☁️', 'info');
      await initGoogleDrive(googleClientId);
      await backupToDrive(store._data, store);
      showToast(getLang() === 'th' ? 'อัปโหลดข้อมูลขึ้น Google Drive สำเร็จเรียบร้อยแล้วค่ะ! ☁️⬆️✅' : 'Backup to Google Drive succeeded! ☁️⬆️✅', 'success');
    } catch (err) {
      showToast('Drive Backup Failed: ' + err.message, 'error');
    }
  });

  // Wire Google Drive Sync
  document.getElementById('btn-gdrive-sync').addEventListener('click', async () => {
    const googleClientId = store.getSettings().googleClientId;
    if (!googleClientId) {
      showToast(getLang() === 'th' ? 'กรุณากรอก Google Client ID ในหน้า ⚙️ Settings ก่อนนะคะ' : 'Please enter Google Client ID in ⚙️ Settings first.', 'error');
      window.location.hash = '#settings';
      return;
    }
    if (!confirm(getLang() === 'th' ? 'ต้องการ Sync ดึงข้อมูลจาก Google Drive ลงมาอัปเดตในเครื่องใช่หรือไม่คะ?' : 'Sync and overwrite local data with Google Drive backup?')) return;
    try {
      showToast(getLang() === 'th' ? 'กำลังดึงข้อมูลจาก Google Drive... 🔄' : 'Syncing data from Google Drive... 🔄', 'info');
      await initGoogleDrive(googleClientId);
      const data = await syncFromDrive();
      if (data) {
        store.importData(data);
        showToast(getLang() === 'th' ? 'Sync ข้อมูลจาก Google Drive สำเร็จเรียบร้อย! 🔄✅' : 'Synced from Google Drive successfully! 🔄✅', 'success');
        navigate(currentRoute || 'dashboard');
      }
    } catch (err) {
      showToast('Drive Sync Failed: ' + err.message, 'error');
    }
  });

  // Top-bar actions
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
    if (confirm(getLang() === 'th' ? 'โหลดข้อมูลตัวอย่าง? ข้อมูลเดิมจะถูกแทนที่' : 'Load sample data? Existing data will be replaced.')) {
      store.loadSampleData();
      showToast('Sample data loaded! 📦', 'success');
      navigate(currentRoute || 'dashboard');
    }
  });
}

// ── Router ──
function navigate(routeId) {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId) || routes[0];
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
