import { EditableTable, statusBadge } from '../components/editable-table.js';
import { uid } from '../utils.js';

export function renderProducts(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>🛍️ Products / จัดการสินค้า</h2>
      <p class="text-muted">Manage your affiliate products database (สามารถใส่ราคาเองได้อิสระ อัปโหลดรูปภาพสินค้า Thumbnail และแก้ Product ID ได้)</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: 'Product ID', type: 'text', width: '100px', editable: true },
    { key: 'imageUrl', label: 'Photo / รูปสินค้า', type: 'image', width: '130px' },
    { key: 'name', label: 'Product Name', type: 'text', width: '180px' },
    { key: 'category', label: 'Category', type: 'dropdown', options: () => store.getSettingList('productCategories') },
    { key: 'brand', label: 'Brand', type: 'text', width: '110px' },
    { key: 'priceRange', label: 'Price ฿ / ราคา', type: 'text', width: '120px', editable: true },
    { key: 'platform', label: 'Platform', type: 'dropdown', options: () => store.getSettingList('channels') },
    { key: 'commission', label: 'Commission %', type: 'number', width: '90px' },
    { key: 'affiliateLink', label: 'Affiliate Link', type: 'url', width: '180px' },
    { key: 'sellingPoints', label: 'Selling Points', type: 'textarea', width: '220px' },
    { key: 'painPoints', label: 'Pain Points', type: 'textarea', width: '220px' },
    { key: 'targetAudience', label: 'Target Audience', type: 'text', width: '170px' },
    { key: 'status', label: 'Status', type: 'dropdown', options: () => store.getSettingList('productStatuses'), badge: statusBadge },
    { key: 'notes', label: 'Notes', type: 'text', width: '170px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    getData: () => store.getProducts(),
    onAdd: () => store.addProduct({ id: uid('P'), name: 'New Product', status: 'To Review' }),
    onChange: (id, field, value) => store.updateProduct(id, field, value),
    onDelete: (id) => store.deleteProduct(id),
    addLabel: '+ Add Product / เพิ่มสินค้า',
    emptyText: 'No products yet · ยังไม่มีสินค้า',
    emptyIcon: '🛍️'
  });
}

export function render(container, store) {
  renderProducts(container, store);
}
