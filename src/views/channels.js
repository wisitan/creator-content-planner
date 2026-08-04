import { EditableTable } from '../components/editable-table.js';

export function renderChannels(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>📺 Channels / ติดตามผลงานรายช่องทาง</h2>
      <p class="text-muted">Track views, engagement rate, product clicks and revenue by channel</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: 'ID', type: 'text', width: '80px', editable: false },
    { key: 'contentId', label: 'Content ID', type: 'dropdown', options: () => store.getContent().map(c => c.id), width: '90px' },
    { key: 'channel', label: 'Channel', type: 'dropdown', options: () => store.getSettingList('channels') },
    { key: 'publishedDate', label: 'Published Date', type: 'date', width: '110px' },
    { key: 'views', label: 'Views', type: 'number', width: '90px' },
    { key: 'likes', label: 'Likes', type: 'number', width: '80px' },
    { key: 'comments', label: 'Comments', type: 'number', width: '80px' },
    { key: 'shares', label: 'Shares', type: 'number', width: '80px' },
    { key: 'saves', label: 'Saves', type: 'number', width: '80px' },
    { key: 'avgWatchTime', label: 'Avg Watch (s)', type: 'number', width: '90px' },
    { key: 'productClicks', label: 'Product Clicks', type: 'number', width: '100px' },
    { key: 'orders', label: 'Orders', type: 'number', width: '80px' },
    { key: 'revenue', label: 'Revenue ฿', type: 'number', width: '100px' },
    { 
      key: 'engagement', 
      label: 'Engagement %', 
      type: 'computed', 
      compute: (row) => {
        const v = Number(row.views) || 0;
        if (!v) return '-';
        const eng = (Number(row.likes || 0) + Number(row.comments || 0) + Number(row.shares || 0) + Number(row.saves || 0)) / v * 100;
        return eng.toFixed(2) + '%';
      }
    },
    {
      key: 'conversion',
      label: 'Conversion %',
      type: 'computed',
      compute: (row) => {
        const cl = Number(row.productClicks) || 0;
        if (!cl) return '-';
        return ((Number(row.orders || 0) / cl) * 100).toFixed(2) + '%';
      }
    },
    { key: 'notes', label: 'Notes', type: 'text', width: '220px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    data: store.getChannelTracker(),
    onAdd: () => store.addChannelEntry(),
    onChange: (id, field, value) => store.updateChannelEntry(id, field, value),
    onDelete: (id) => store.deleteChannelEntry(id),
    addLabel: '+ Add Entry / เพิ่มข้อมูล',
    emptyText: 'No channel data yet · ยังไม่มีข้อมูล channel',
    emptyIcon: '📺'
  });
}

export function render(container, store) {
  renderChannels(container, store);
}
