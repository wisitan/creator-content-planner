import { EditableTable, statusBadge } from '../components/editable-table.js';

export function renderSponsors(container, store) {
  container.innerHTML = '';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h2>🤝 Sponsor Deals / จัดการดีลสปอนเซอร์</h2>
      <p class="text-muted">บันทึกข้อมูลดีล ค่าจ้าง สถานะร่าง/อนุมัติ/โพสต์ และการชำระเงิน</p>
    </div>
  `;
  container.appendChild(header);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'card view-enter';
  container.appendChild(tableContainer);

  const columns = [
    { key: 'id', label: 'Deal ID', type: 'text', width: '90px' },
    { key: 'brandClient', label: 'Brand / Client', type: 'text', width: '150px' },
    { key: 'contactPerson', label: 'Contact Person', type: 'text', width: '120px' },
    { key: 'contactInfo', label: 'Contact Info', type: 'text', width: '140px' },
    { key: 'dealType', label: 'Deal Type', type: 'dropdown', options: () => store.getSettingList('dealTypes') },
    { key: 'agreedFee', label: 'Agreed Fee ฿', type: 'number', width: '100px' },
    { key: 'deliverables', label: 'Deliverables', type: 'textarea', width: '220px' },
    { key: 'deadline', label: 'Deadline', type: 'date', width: '110px' },
    { key: 'contentIds', label: 'Content IDs', type: 'text', width: '110px' },
    { key: 'draftSent', label: 'Draft Sent', type: 'checkbox', width: '80px' },
    { key: 'approved', label: 'Approved', type: 'checkbox', width: '80px' },
    { key: 'published', label: 'Published', type: 'checkbox', width: '80px' },
    { key: 'paymentStatus', label: 'Payment Status', type: 'dropdown', options: () => store.getSettingList('paymentStatuses'), badge: statusBadge },
    { key: 'paymentDate', label: 'Payment Date', type: 'date', width: '110px' },
    { key: 'notes', label: 'Notes', type: 'text', width: '200px' }
  ];

  EditableTable(tableContainer, {
    columns: columns,
    getData: () => store.getSponsors(),
    onAdd: () => store.addSponsor(),
    onChange: (id, field, value) => store.updateSponsor(id, field, value),
    onDelete: (id) => store.deleteSponsor(id),
    addLabel: '+ Add Deal / เพิ่ม deal',
    emptyText: 'No sponsor deals yet · ยังไม่มี deal กับ sponsor',
    emptyIcon: '🤝'
  });
}

export function render(container, store) {
  renderSponsors(container, store);
}
