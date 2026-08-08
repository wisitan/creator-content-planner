import { esc, fmtNum, fmtBaht } from '../utils.js';

let selectedYear = 'ALL';
let selectedMonths = new Set(); // Set of month indices (0-11), empty means ALL
let selectedCategory = 'ALL';
let selectedProductType = 'ALL';

export function renderDashboard(container, store) {
  const products = store.getProducts() || [];
  const contentList = store.getContent() || [];
  const channelEntries = store.getChannelTracker() || [];
  const productCategories = store.getSettingList('productCategories') || [];
  const productTypes = store.getSettingList('productTypes') || [
    'A สินค้าขายดี', 'B สินค้ามาใหม่', 'C สินค้าราคาประหยัด', 'D สินค้าค่าคอมสูง'
  ];
  const configuredChannels = store.getSettingList('channels') || [
    'TikTok', 'Shopee Video', 'YouTube Shorts', 'YouTube Long', 'Instagram Reels', 'Facebook Reels'
  ];

  // Extract available years
  const yearsSet = new Set([new Date().getFullYear()]);
  contentList.forEach(c => {
    const dStr = c.publishedDate || c.plannedDate;
    if (dStr) {
      const y = new Date(dStr).getFullYear();
      if (!isNaN(y)) yearsSet.add(y);
    }
  });
  channelEntries.forEach(ch => {
    if (ch.publishedDate) {
      const y = new Date(ch.publishedDate).getFullYear();
      if (!isNaN(y)) yearsSet.add(y);
    }
  });
  const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

  // Filter content & channels by selected Year, Multi-Months, Category & Product Type
  const filteredContent = contentList.filter(c => {
    const dStr = c.publishedDate || c.plannedDate;
    if (dStr) {
      const d = new Date(dStr);
      if (selectedYear !== 'ALL' && d.getFullYear() !== parseInt(selectedYear, 10)) return false;
      if (selectedMonths.size > 0 && !selectedMonths.has(d.getMonth())) return false;
    }
    const p = products.find(prod => prod.id === c.productId);
    if (selectedCategory !== 'ALL') {
      if (!p || p.category !== selectedCategory) return false;
    }
    if (selectedProductType !== 'ALL') {
      if (!p || p.productType !== selectedProductType) return false;
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (selectedProductType !== 'ALL' && p.productType !== selectedProductType) return false;
    return true;
  });

  const filteredChannelEntries = channelEntries.filter(ch => {
    if (ch.publishedDate) {
      const d = new Date(ch.publishedDate);
      if (selectedYear !== 'ALL' && d.getFullYear() !== parseInt(selectedYear, 10)) return false;
      if (selectedMonths.size > 0 && !selectedMonths.has(d.getMonth())) return false;
    }
    if (selectedCategory !== 'ALL' || selectedProductType !== 'ALL') {
      const cItem = contentList.find(c => c.id === ch.contentId);
      if (cItem) {
        const p = products.find(prod => prod.id === cItem.productId);
        if (!p) return false;
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
        if (selectedProductType !== 'ALL' && p.productType !== selectedProductType) return false;
      }
    }
    return true;
  });

  // Calculate Stat Cards Values
  // Total Product Active = count products with Active status
  const activeProductsCount = filteredProducts.filter(p => p.status && (p.status === 'Active' || p.status.includes('Active'))).length;
  const totalContent = filteredContent.length;
  const publishedCount = filteredContent.filter(c => c.status && c.status.includes('Published')).length;
  const inProgressCount = filteredContent.filter(c => !c.status || !c.status.includes('Published')).length;
  const sponsorDeals = (store.getSponsors() || []).length;

  // Calculate Content Mix & Pie Chart
  const mixColors = {
    '🛒 Affiliate': '#F97316',
    '🎯 Personal Brand': '#3B82F6',
    '📚 Knowledge': '#10B981',
    '🤝 Sponsor': '#8B5CF6'
  };

  const contentTypes = ['🛒 Affiliate', '🎯 Personal Brand', '📚 Knowledge', '🤝 Sponsor'];
  const mixData = {};
  contentTypes.forEach(t => {
    const label = t.split(' ')[1] || t;
    const count = filteredContent.filter(c => c.contentType === t || (c.contentType && c.contentType.includes(label))).length;
    const percentage = totalContent > 0 ? Math.round((count / totalContent) * 100) : 0;
    mixData[t] = { count, percentage };
  });

  // Generate Conic Gradient for Pie Chart
  let cumulativePct = 0;
  const gradientParts = contentTypes.map(t => {
    const item = mixData[t] || { percentage: 0 };
    const color = mixColors[t] || '#64748b';
    const start = cumulativePct;
    cumulativePct += item.percentage;
    return `${color} ${start}% ${cumulativePct}%`;
  });

  const pieChartStyle = totalContent > 0 
    ? `background: conic-gradient(${gradientParts.join(', ')});`
    : `background: #e2e8f0;`;

  // Calculate Product Category & Status Breakdown
  const categoryBreakdown = {};
  filteredProducts.forEach(p => {
    const cat = p.category || 'Uncategorized / ไม่ระบุหมวด';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, statuses: {} };
    }
    categoryBreakdown[cat].total += 1;
    const st = p.status || 'To Review';
    categoryBreakdown[cat].statuses[st] = (categoryBreakdown[cat].statuses[st] || 0) + 1;
  });

  // Calculate Content Performance by Channel
  const channelStats = {};
  configuredChannels.forEach(ch => {
    channelStats[ch] = { count: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, orders: 0, revenue: 0 };
  });

  filteredChannelEntries.forEach(entry => {
    const ch = entry.channel || 'Other';
    if (!channelStats[ch]) {
      channelStats[ch] = { count: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, orders: 0, revenue: 0 };
    }
    channelStats[ch].count += 1;
    channelStats[ch].views += Number(entry.views) || 0;
    channelStats[ch].likes += Number(entry.likes) || 0;
    channelStats[ch].comments += Number(entry.comments) || 0;
    channelStats[ch].shares += Number(entry.shares) || 0;
    channelStats[ch].saves += Number(entry.saves) || 0;
    channelStats[ch].clicks += Number(entry.productClicks) || 0;
    channelStats[ch].orders += Number(entry.orders) || 0;
    channelStats[ch].revenue += Number(entry.revenue) || 0;
  });

  const monthShorts = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  container.innerHTML = `
    <div class="view-enter">
      <!-- Top Header & Filter Bar -->
      <div class="card p-3 mb-4" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:12px;">
        <div class="flex-between flex-wrap gap-3 mb-3">
          <div>
            <h2 style="margin:0; font-size:1.4rem; display:flex; align-items:center; gap:8px;">
              📊 Dashboard <span style="font-size:0.9rem; font-weight:normal;" class="text-muted">/ แดชบอร์ด v1.5.3</span>
            </h2>
            <p class="text-muted m-0 mt-1" style="font-size:0.85rem;">สรุปสถานะสินค้า Active, Pie Chart สัดส่วนคอนเทนต์ และประสิทธิภาพแยกตามช่องทาง</p>
          </div>

          <!-- Quick Dropdown Filters: Year, Category, Product Type -->
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <!-- Year Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">📅 ปี:</label>
              <select id="dash-filter-year" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:110px;">
                <option value="ALL" ${selectedYear === 'ALL' ? 'selected' : ''}>ทุกปี (All)</option>
                ${availableYears.map(y => `<option value="${y}" ${String(selectedYear) === String(y) ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>

            <!-- Category Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">📦 หมวดสินค้า:</label>
              <select id="dash-filter-category" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:160px;">
                <option value="ALL" ${selectedCategory === 'ALL' ? 'selected' : ''}>ทุกหมวด (All)</option>
                ${productCategories.map(cat => `<option value="${esc(cat)}" ${selectedCategory === cat ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
              </select>
            </div>

            <!-- Product Type Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">🏷️ ประเภทสินค้า:</label>
              <select id="dash-filter-producttype" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:160px;">
                <option value="ALL" ${selectedProductType === 'ALL' ? 'selected' : ''}>ทุกประเภท (All)</option>
                ${productTypes.map(pt => `<option value="${esc(pt)}" ${selectedProductType === pt ? 'selected' : ''}>${esc(pt)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Multi-Select Months Toggle Bar -->
        <div style="border-top:1px solid var(--c-border); padding-top:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted); flex-shrink:0;">🗓️ เลือกเดือน (เลือกได้หลายเดือน):</span>
          <button type="button" class="btn btn-sm ${selectedMonths.size === 0 ? 'btn-primary' : 'btn-secondary'}" id="btn-dash-month-all" style="padding:2px 10px; font-size:0.78rem; font-weight:700; border-radius:12px;">
            ทุกเดือน (All)
          </button>
          <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
            ${monthShorts.map((mName, mIdx) => {
              const isSelected = selectedMonths.has(mIdx);
              return `
                <button type="button" class="btn btn-sm btn-dash-month-toggle ${isSelected ? 'btn-primary' : 'btn-secondary'}" data-month="${mIdx}" style="padding:2px 8px; font-size:0.78rem; font-weight:600; border-radius:12px;">
                  ${mName}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Top Stat Cards -->
      <div class="stat-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem;">
        <div class="stat-card card p-3" style="border-top:4px solid #6366F1;">
          <div class="stat-label" style="font-weight:700;">Total Product Active<br><small class="text-muted">สินค้าที่ Active ในคลัง</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #6366F1; margin-top:4px;">${activeProductsCount}</div>
        </div>
        <div class="stat-card card p-3" style="border-top:4px solid #3B82F6;">
          <div class="stat-label" style="font-weight:700;">Total Content<br><small class="text-muted">คอนเทนต์ทั้งหมด</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #3B82F6; margin-top:4px;">${totalContent}</div>
        </div>
        <div class="stat-card card p-3" style="border-top:4px solid #10B981;">
          <div class="stat-label" style="font-weight:700;">Published<br><small class="text-muted">เผยแพร่แล้ว</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #10B981; margin-top:4px;">${publishedCount}</div>
        </div>
        <div class="stat-card card p-3" style="border-top:4px solid #F59E0B;">
          <div class="stat-label" style="font-weight:700;">In Progress<br><small class="text-muted">กำลังดำเนินการ (ยังไม่เผยแพร่)</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #F59E0B; margin-top:4px;">${inProgressCount}</div>
        </div>
        <div class="stat-card card p-3" style="border-top:4px solid #8B5CF6;">
          <div class="stat-label" style="font-weight:700;">Sponsor Deals<br><small class="text-muted">ดีลสปอนเซอร์</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #8B5CF6; margin-top:4px;">${sponsorDeals}</div>
        </div>
      </div>

      <!-- Content Mix (Pie Chart) & Product Categories & Status -->
      <div class="dash-grid mb-4" style="display: grid; grid-template-columns: 1.1fr 1.2fr; gap: 1.5rem;">
        
        <!-- Content Mix Pie Chart Card -->
        <div class="card" style="display:flex; flex-direction:column;">
          <div class="card-header p-3 border-bottom">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight:700;">📝 Content Mix / สัดส่วนประเภทคอนเทนต์</h3>
          </div>
          <div class="p-3" style="flex:1; display:flex; align-items:center;">
            <div style="display:flex; align-items:center; gap:20px; justify-content:center; flex-wrap:wrap; width:100%;">
              
              <!-- Donut / Pie Chart Element -->
              <div style="position:relative; width:150px; height:150px; border-radius:50%; ${pieChartStyle} display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
                <div style="width:92px; height:92px; border-radius:50%; background:var(--c-surface, #ffffff); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                  <span style="font-size:1.5rem; font-weight:800; color:var(--c-text);">${totalContent}</span>
                  <span style="font-size:0.72rem; color:var(--c-text-muted);" class="text-muted">รายการ</span>
                </div>
              </div>

              <!-- Pie Chart Legend & Numbers -->
              <div style="flex:1; min-width:180px;">
                ${contentTypes.map(t => {
                  const item = mixData[t] || { count: 0, percentage: 0 };
                  const color = mixColors[t] || '#64748b';
                  return `
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:12px; height:12px; border-radius:3px; background:${color}; display:inline-block; flex-shrink:0;"></span>
                        <span style="font-weight:700; color:var(--c-text);">${esc(t)}</span>
                      </div>
                      <span style="font-weight:700; font-size:0.85rem;" class="text-muted">${item.count} คลิป (${item.percentage}%)</span>
                    </div>
                  `;
                }).join('')}
              </div>

            </div>
          </div>
        </div>

        <!-- Product Categories & Status Card -->
        <div class="card" style="display:flex; flex-direction:column;">
          <div class="card-header p-3 border-bottom flex-between">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight:700;">📦 Product Categories & Status</h3>
            <span class="badge" style="font-size:0.8rem; background:var(--c-bg); border:1px solid var(--c-border);">${Object.keys(categoryBreakdown).length} หมวดหมู่</span>
          </div>
          <div class="p-3" style="flex:1; max-height:340px; overflow-y:auto;">
            ${Object.keys(categoryBreakdown).length ? Object.entries(categoryBreakdown).map(([catName, info]) => `
              <div class="mb-3 p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-bg);">
                <div class="flex-between mb-2">
                  <strong style="font-size:0.92rem; color:var(--c-primary);">${esc(catName)}</strong>
                  <span class="badge badge-blue" style="font-weight:700;">${info.total} สินค้า</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                  ${Object.entries(info.statuses).map(([stName, stCount]) => {
                    let stBadge = 'badge-gray';
                    if (stName.includes('Active') || stName.includes('Approved')) stBadge = 'badge-green';
                    if (stName.includes('Review')) stBadge = 'badge-yellow';
                    if (stName.includes('Paused') || stName.includes('Out')) stBadge = 'badge-red';
                    return `
                      <span class="badge ${stBadge}" style="font-size:0.78rem; font-weight:600;">
                        ${esc(stName)}: <strong>${stCount}</strong>
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('') : '<div class="empty-state text-muted p-4 text-center">ยังไม่มีรายการสินค้าในระบบ 📦</div>'}
          </div>
        </div>

      </div>

      <!-- Content Performance by Channel Table -->
      <div class="card mb-4">
        <div class="card-header p-3 border-bottom flex-between">
          <div>
            <h3 style="margin:0; font-size:1.1rem; font-weight:700;">📺 Content Performance by Channel / ประสิทธิภาพรายช่องทาง</h3>
            <p class="text-muted m-0 mt-1" style="font-size:0.82rem;">สรุปยอดวิว ยอดคลิก ออเดอร์ รายได้ และ Engagement Rate แยกตามแพลตฟอร์ม</p>
          </div>
        </div>
        
        <div class="p-0" style="overflow-x:auto;">
          <table class="data-table" style="width:100%; border-collapse:collapse; font-size:0.88rem; min-width:700px;">
            <thead>
              <tr style="background:var(--c-bg); text-align:left; border-bottom:1px solid var(--c-border);">
                <th style="padding:10px 14px; font-weight:700;">Channel / ช่องทาง</th>
                <th style="padding:10px 14px; text-align:center; font-weight:700;">Videos / คลิป</th>
                <th style="padding:10px 14px; text-align:right; font-weight:700;">Views / ยอดวิว</th>
                <th style="padding:10px 14px; text-align:right; font-weight:700;">Clicks / คลิกสินค้า</th>
                <th style="padding:10px 14px; text-align:right; font-weight:700;">Orders / ออเดอร์</th>
                <th style="padding:10px 14px; text-align:right; font-weight:700;">Revenue / รายได้รวม</th>
                <th style="padding:10px 14px; text-align:center; font-weight:700;">Engagement %</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(channelStats).map(([ch, st]) => {
                const totalEng = st.likes + st.comments + st.shares + st.saves;
                const engPct = st.views > 0 ? ((totalEng / st.views) * 100).toFixed(2) + '%' : '-';
                return `
                  <tr style="border-bottom:1px solid var(--c-border);">
                    <td style="padding:10px 14px; font-weight:700; color:var(--c-text);">
                      ${esc(ch)}
                    </td>
                    <td style="padding:10px 14px; text-align:center;">
                      <span class="badge badge-gray" style="font-weight:700;">${st.count}</span>
                    </td>
                    <td style="padding:10px 14px; text-align:right; font-weight:600;">
                      ${st.views ? fmtNum(st.views) : '-'}
                    </td>
                    <td style="padding:10px 14px; text-align:right;">
                      ${st.clicks ? fmtNum(st.clicks) : '-'}
                    </td>
                    <td style="padding:10px 14px; text-align:right;">
                      ${st.orders ? fmtNum(st.orders) : '-'}
                    </td>
                    <td style="padding:10px 14px; text-align:right; font-weight:700; color:#10B981;">
                      ${st.revenue ? fmtBaht(st.revenue) : '-'}
                    </td>
                    <td style="padding:10px 14px; text-align:center;">
                      <span style="font-size:0.85rem; font-weight:700; color:${parseFloat(engPct) > 5 ? '#10B981' : 'var(--c-text-muted)'};">${engPct}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Wire Event Listeners for Filters
  const ySel = container.querySelector('#dash-filter-year');
  const cSel = container.querySelector('#dash-filter-category');
  const ptSel = container.querySelector('#dash-filter-producttype');

  if (ySel) {
    ySel.addEventListener('change', (e) => {
      selectedYear = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (cSel) {
    cSel.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (ptSel) {
    ptSel.addEventListener('change', (e) => {
      selectedProductType = e.target.value;
      renderDashboard(container, store);
    });
  }

  // Multi-Month Toggle Handlers
  const btnAllMonths = container.querySelector('#btn-dash-month-all');
  if (btnAllMonths) {
    btnAllMonths.addEventListener('click', () => {
      selectedMonths.clear();
      renderDashboard(container, store);
    });
  }

  container.querySelectorAll('.btn-dash-month-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = parseInt(e.currentTarget.dataset.month, 10);
      if (selectedMonths.has(mIdx)) {
        selectedMonths.delete(mIdx);
      } else {
        selectedMonths.add(mIdx);
      }
      renderDashboard(container, store);
    });
  });
}

export const render = renderDashboard;
