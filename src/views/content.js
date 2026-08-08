import { EditableTable, statusBadge, contentTypeBadge } from '../components/editable-table.js';
import { t } from '../i18n.js';

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
    { key: 'plannedDate', label: t('col_cnt_planned_date'), type: 'date', width: '110px' },
    { key: 'status', label: t('col_cnt_status'), type: 'dropdown', options: () => store.getSettingList('contentStatuses'), badge: statusBadge },
    { key: 'publishedDate', label: t('col_cnt_pub_date'), type: 'date', width: '110px' },
    { key: 'publishedUrl', label: t('col_cnt_pub_url'), type: 'url', width: '170px' },
    { key: 'performanceNotes', label: t('col_cnt_perf_notes'), type: 'text', width: '220px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    getData: () => store.getContent(),
    getProducts: () => store.getProducts(),
    getCategories: () => store.getSettingList('productCategories'),
    getProductTypes: () => store.getSettingList('productTypes'),
    getStatuses: () => store.getSettingList('productStatuses'),
    onAdd: () => store.addContent({ status: '💡 Idea' }),
    onChange: (id, field, value) => store.updateContent(id, field, value),
    onDelete: (id) => store.deleteContent(id),
    addLabel: t('cnt_add_btn'),
    emptyText: t('cnt_empty'),
    emptyIcon: '📝'
  });
}

export function render(container, store) {
  renderContent(container, store);
}
