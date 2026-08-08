import { EditableTable, statusBadge } from '../components/editable-table.js';
import { t } from '../i18n.js';

export function renderProducts(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>🛍️ ${t('prod_title')}</h2>
      <p class="text-muted">${t('prod_subtitle')}</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: t('col_prod_id'), type: 'text', width: '100px', editable: true },
    { key: 'imageUrl', label: t('col_prod_photo'), type: 'image', width: '130px' },
    { key: 'name', label: t('col_prod_name'), type: 'text', width: '180px' },
    { key: 'category', label: t('col_prod_category'), type: 'dropdown', options: () => store.getSettingList('productCategories') },
    { key: 'brand', label: t('col_prod_brand'), type: 'text', width: '110px' },
    { key: 'priceRange', label: t('col_prod_price'), type: 'text', width: '120px', editable: true },
    { key: 'platform', label: t('col_prod_platform'), type: 'dropdown', options: () => store.getSettingList('channels') },
    { key: 'commission', label: t('col_prod_commission'), type: 'number', width: '90px' },
    { key: 'affiliateLink', label: t('col_prod_aff_link'), type: 'url', width: '180px' },
    { key: 'sellingPoints', label: t('col_prod_selling_points'), type: 'textarea', width: '220px' },
    { key: 'productType', label: t('col_prod_type'), type: 'dropdown', options: () => store.getSettingList('productTypes') },
    { key: 'targetAudience', label: t('col_prod_audience'), type: 'text', width: '170px' },
    { key: 'status', label: t('col_prod_status'), type: 'dropdown', options: () => store.getSettingList('productStatuses'), badge: statusBadge },
    { key: 'notes', label: t('col_prod_notes'), type: 'text', width: '170px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    getData: () => store.getProducts(),
    onAdd: () => store.addProduct({ name: 'New Product', status: 'To Review' }),
    onChange: (id, field, value) => store.updateProduct(id, field, value),
    onDelete: (id) => store.deleteProduct(id),
    addLabel: t('prod_add_btn'),
    emptyText: t('prod_empty'),
    emptyIcon: '🛍️'
  });
}

export function render(container, store) {
  renderProducts(container, store);
}
