import { EditableTable, statusBadge, contentTypeBadge } from '../components/editable-table.js';
import { t } from '../i18n.js';
import { esc } from '../utils.js';

export function renderContent(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>📝 ${t('cnt_title')}</h2>
      <p class="text-muted">${t('cnt_subtitle')}</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: t('col_cnt_id'), type: 'text', width: '100px', editable: true },
    { key: 'coverUrl', label: t('col_cnt_cover'), type: 'image', width: '130px' },
    { key: 'title', label: t('col_cnt_title'), type: 'text', width: '200px' },
    { key: 'contentType', label: t('col_cnt_type'), type: 'dropdown', options: () => store.getSettingList('contentTypes'), badge: contentTypeBadge },
    { key: 'productId', label: t('col_cnt_prod_id'), type: 'productPicker', width: '140px' },
    { key: 'productName', label: t('col_cnt_prod_name'), type: 'computed', compute: (row) => store.getProductName(row.productId), width: '160px' },
    { key: 'contentAngle', label: t('col_cnt_angle'), type: 'dropdown', options: () => store.getSettingList('contentAngles') },
    { key: 'contentPillar', label: t('col_cnt_pillar'), type: 'dropdown', options: () => store.getSettingList('contentPillars') },
    { key: 'channel', label: t('col_cnt_channel'), type: 'dropdown', options: () => store.getSettingList('channels') },
    { key: 'script', label: t('col_cnt_script'), type: 'scriptModal', width: '240px' },
    { key: 'ctaType', label: t('col_cnt_cta'), type: 'dropdown', options: () => store.getSettingList('ctaTypes') },
    { key: 'publishedDate', label: t('col_cnt_pub_date'), type: 'date', width: '120px' },
    { key: 'status', label: t('col_cnt_status'), type: 'dropdown', options: () => store.getSettingList('contentStatuses'), badge: statusBadge },
    { key: 'publishedUrl', label: t('col_cnt_pub_url'), type: 'url', width: '170px' },
    { key: 'performanceNotes', label: t('col_cnt_perf_notes'), type: 'text', width: '220px' }
  ];

  let selectedStatus = 'ALL';
  const statusOptions = store.getSettingList('contentStatuses') || [];

  function renderTable() {
    tableContainer.innerHTML = '';

    // Status Filter Chips Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'status-chips-bar p-3';
    filterBar.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; align-items:center; background:var(--c-bg); border-bottom:1px solid var(--c-border); border-top-left-radius:8px; border-top-right-radius:8px;';

    let chipsHtml = `<span style="font-size:0.82rem; font-weight:700;" class="text-muted mr-1">Filter Status:</span>`;
    const allActive = selectedStatus === 'ALL';
    chipsHtml += `
      <button class="btn btn-sm ${allActive ? 'btn-primary' : 'btn-secondary'} btn-cnt-status-chip" data-status="ALL" style="padding:3px 12px; font-size:0.8rem; border-radius:14px; font-weight:600;">
        🔍 All Statuses
      </button>
    `;
    statusOptions.forEach(st => {
      const active = selectedStatus === st;
      chipsHtml += `
        <button class="btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'} btn-cnt-status-chip" data-status="${esc(st)}" style="padding:3px 12px; font-size:0.8rem; border-radius:14px; font-weight:500;">
          ${esc(st)}
        </button>
      `;
    });
    filterBar.innerHTML = chipsHtml;
    tableContainer.appendChild(filterBar);

    filterBar.addEventListener('click', (e) => {
      const chipBtn = e.target.closest('.btn-cnt-status-chip');
      if (chipBtn) {
        selectedStatus = chipBtn.dataset.status;
        renderTable();
      }
    });

    const wrapper = document.createElement('div');
    tableContainer.appendChild(wrapper);

    EditableTable(wrapper, {
      columns: columns,
      getData: () => {
        const allContent = store.getContent();
        if (selectedStatus === 'ALL') return allContent;
        return allContent.filter(c => c.status === selectedStatus);
      },
      getProducts: () => store.getProducts(),
      getCategories: () => store.getSettingList('productCategories'),
      getProductTypes: () => store.getSettingList('productTypes'),
      getStatuses: () => store.getSettingList('productStatuses'),
      onAdd: () => store.addContent({ status: selectedStatus === 'ALL' ? '💡 Idea' : selectedStatus }),
      onChange: (id, field, value) => store.updateContent(id, field, value),
      onDelete: (id) => store.deleteContent(id),
      addLabel: t('cnt_add_btn'),
      emptyText: t('cnt_empty'),
      emptyIcon: '📝',
      enableYearMonthFilter: true
    });
  }

  renderTable();
}

export function render(container, store) {
  renderContent(container, store);
}
