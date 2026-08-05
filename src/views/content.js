import { EditableTable, contentTypeBadge, statusBadge } from '../components/editable-table.js';
import { uid } from '../utils.js';

export function renderContent(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>📝 Content Planner / แผนคอนเทนต์</h2>
      <p class="text-muted">วางแผนคอนเทนต์ (กดปุ่ม 📄 Script & Details เพื่อเปิดใส่สคริปต์/บทพูดฉบับเต็ม | ลากหัวคอลัมน์เพื่อสลับตำแหน่งได้)</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: 'Content ID', type: 'text', width: '100px', editable: true },
    { key: 'title', label: 'Content Title', type: 'text', width: '200px' },
    { key: 'contentType', label: 'Content Type', type: 'dropdown', options: () => store.getSettingList('contentTypes'), badge: contentTypeBadge },
    { key: 'productId', label: 'Product ID', type: 'dropdown', options: () => ['', ...store.getProducts().map(p => p.id)], width: '100px' },
    { key: 'productName', label: 'Product Name (auto)', type: 'computed', compute: (row) => store.getProductName(row.productId) },
    { key: 'contentAngle', label: 'Content Angle', type: 'dropdown', options: () => store.getSettingList('contentAngles') },
    { key: 'scriptModal', label: 'Script & Content Details', type: 'scriptModal', width: '220px' },
    { key: 'contentPillar', label: 'Content Pillar', type: 'dropdown', options: () => store.getSettingList('contentPillars') },
    { key: 'channel', label: 'Channel', type: 'dropdown', options: () => store.getSettingList('channels') },
    { key: 'ctaType', label: 'CTA Type', type: 'dropdown', options: () => store.getSettingList('ctaTypes') },
    { key: 'plannedDate', label: 'Planned Date', type: 'date', width: '110px' },
    { key: 'status', label: 'Status', type: 'dropdown', options: () => store.getSettingList('contentStatuses'), badge: statusBadge },
    { key: 'publishedDate', label: 'Published Date', type: 'date', width: '110px' },
    { key: 'publishedUrl', label: 'Published URL', type: 'url', width: '170px' },
    { key: 'performanceNotes', label: 'Performance Notes', type: 'text', width: '220px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    getData: () => store.getContent(),
    onAdd: () => store.addContent({ id: uid('C'), title: 'New Content Title', contentType: '🛒 Affiliate', status: '💡 Idea' }),
    onChange: (id, field, value) => store.updateContent(id, field, value),
    onDelete: (id) => store.deleteContent(id),
    addLabel: '+ Add Content / เพิ่ม content',
    emptyText: 'No content planned yet · ยังไม่มีแผน content',
    emptyIcon: '📝'
  });
}

export function render(container, store) {
  renderContent(container, store);
}
