import { showToast } from '../components/toast.js';
import { applyTheme } from '../main.js';
import { setLang, getLang, t } from '../i18n.js';

export function renderSettings(container, store) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-header flex-between mb-3';
  header.innerHTML = `
    <div>
      <h2 style="margin:0; font-size:1.4rem; font-weight:800; color:var(--c-text);">⚙️ ${t('set_title')}</h2>
      <p class="text-muted m-0 mt-1" style="font-size:0.85rem;">${t('set_subtitle')}</p>
    </div>
    <div>
      <button id="btn-clear-all-data" class="btn btn-danger">${t('set_clear_data')}</button>
    </div>
  `;
  container.appendChild(header);

  // Wire clear all data button with confirmation dialog
  header.querySelector('#btn-clear-all-data').addEventListener('click', () => {
    if (confirm('🚨 Important Warning!\n\nAre you sure you want to delete all data?\nAll products, content plans, and brand data will be permanently cleared from this device.')) {
      store.clearAll();
      showToast('All data cleared successfully! 🗑️✅', 'success');
      renderSettings(container, store);
    }
  });

  // Controls Grid (Theme & Language Settings Cards Side-by-Side)
  const controlsGrid = document.createElement('div');
  controlsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;';
  container.appendChild(controlsGrid);

  // 1. 🌙 Dark Theme Toggle Card
  const themeCard = document.createElement('div');
  themeCard.className = 'card view-enter p-3 flex-between';
  const currentTheme = store.getTheme();
  const isDark = currentTheme === 'dark';

  themeCard.innerHTML = `
    <div>
      <h3 class="m-0" style="font-size:1.05rem; display:flex; align-items:center; gap:8px;">
        ${isDark ? '🌙 Dark Theme' : '☀️ Light Theme'}
      </h3>
      <p class="text-muted m-0 mt-1" style="font-size:0.82rem;">${t('set_theme_sub')}</p>
    </div>
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:0.8rem; font-weight:800; color:${isDark ? '#6366F1' : '#475569'};">${isDark ? t('set_dark_mode') : t('set_light_mode')}</span>
      <label class="theme-toggle-switch">
        <input type="checkbox" id="toggle-theme-cb" ${isDark ? 'checked' : ''}>
        <span class="theme-slider"></span>
      </label>
    </div>
  `;
  controlsGrid.appendChild(themeCard);

  themeCard.querySelector('#toggle-theme-cb').addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    store.setTheme(newTheme);
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}`, 'info');
    renderSettings(container, store);
  });

  // 2. 🌐 Language Switcher Card
  const langCard = document.createElement('div');
  langCard.className = 'card view-enter p-3 flex-between';
  const currentLang = store.getLanguage();

  langCard.innerHTML = `
    <div>
      <h3 class="m-0" style="font-size:1.05rem; display:flex; align-items:center; gap:8px;">
        🌐 ${t('set_lang_title')}
      </h3>
      <p class="text-muted m-0 mt-1" style="font-size:0.82rem;">${t('set_lang_sub')}</p>
    </div>
    <div>
      <select id="select-ui-lang" class="form-select" style="padding:6px 12px; font-size:0.85rem; font-weight:700; border-radius:8px; width:150px;">
        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇺🇸 English (US)</option>
        <option value="th" ${currentLang === 'th' ? 'selected' : ''}>🇹🇭 ภาษาไทย (TH)</option>
      </select>
    </div>
  `;
  controlsGrid.appendChild(langCard);

  langCard.querySelector('#select-ui-lang').addEventListener('change', (e) => {
    const newLang = e.target.value;
    store.setLanguage(newLang);
    setLang(newLang);
    showToast(newLang === 'th' ? 'สลับการแสดงผลเป็น ภาษาไทย เรียบร้อย! 🇹🇭' : 'UI language set to English (US) 🇺🇸', 'success');
    window.location.reload(); // Refresh shell to re-render all translations
  });

  // Settings Grid
  const settingsGrid = document.createElement('div');
  settingsGrid.className = 'settings-grid view-enter';
  container.appendChild(settingsGrid);

  const lists = [
    { key: 'channels', label: t('set_list_channels') },
    { key: 'contentPillars', label: t('set_list_pillars') },
    { key: 'productCategories', label: t('set_list_prod_cats') },
    { key: 'contentTypes', label: t('set_list_cnt_types') },
    { key: 'contentAngles', label: t('set_list_cnt_angles') },
    { key: 'contentStatuses', label: t('set_list_cnt_statuses') },
    { key: 'productStatuses', label: t('set_list_prod_statuses') },
    { key: 'productTypes', label: t('set_list_prod_types') },
    { key: 'ctaTypes', label: t('set_list_cta_types') },
    { key: 'dealTypes', label: t('set_list_deal_types') },
    { key: 'paymentStatuses', label: t('set_list_pay_statuses') },
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
        <div class="setting-add" data-key="${item.key}">${t('set_add_item')}</div>
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
