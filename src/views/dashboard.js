import { esc, fmtNum, fmtBaht } from '../utils.js';

let selectedYear = 'ALL';
let selectedMonth = 'ALL';
let selectedCategory = 'ALL';

export function renderDashboard(container, store) {
  const products = store.getProducts() || [];
  const contentList = store.getContent() || [];
  const channelEntries = store.getChannelTracker() || [];
  const productCategories = store.getSettingList('productCategories') || [];
  const configuredChannels = store.getSettingList('channels') || [
    'TikTok', 'Shopee Video', 'YouTube Shorts', 'YouTube Long', 'Instagram Reels', 'Facebook Reels'
  ];

  // Extract available years from content & channel data
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

  // Filter content & channel entries by selected Year & Month & Category
  const filteredContent = contentList.filter(c => {
    const dStr = c.publishedDate || c.plannedDate;
    if (dStr) {
      const d = new Date(dStr);
      if (selectedYear !== 'ALL' && d.getFullYear() !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth !== 'ALL' && d.getMonth() !== parseInt(selectedMonth, 10)) return false;
    }
    if (selectedCategory !== 'ALL') {
      const p = products.find(prod => prod.id === c.productId);
      if (!p || p.category !== selectedCategory) return false;
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  const filteredChannelEntries = channelEntries.filter(ch => {
    if (ch.publishedDate) {
      const d = new Date(ch.publishedDate);
      if (selectedYear !== 'ALL' && d.getFullYear() !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth !== 'ALL' && d.getMonth() !== parseInt(selectedMonth, 10)) return false;
    }
    if (selectedCategory !== 'ALL') {
      const cItem = contentList.find(c => c.id === ch.contentId);
      if (cItem) {
        const p = products.find(prod => prod.id === cItem.productId);
        if (!p || p.category !== selectedCategory) return false;
      }
    }
    return true;
  });

  // Calculate Stat Cards Values
  const totalProducts = filteredProducts.length;
  const totalContent = filteredContent.length;
  const publishedCount = filteredContent.filter(c => c.status && c.status.includes('Published')).length;
  // In Progress = All content that is NOT Published
  const inProgressCount = filteredContent.filter(c => !c.status || !c.status.includes('Published')).length;
  const sponsorDeals = (store.getSponsors() || []).length;

  // Calculate Content Mix
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

  const monthNames = [
    'มกราคม (Jan)', 'กุมภาพันธ์ (Feb)', 'มีนาคม (Mar)', 'เมษายน (Apr)',
    'พฤษภาคม (May)', 'มิถุนายน (Jun)', 'กรกฎาคม (Jul)', 'สิงหาคม (Aug)',
    'กันยายน (Sep)', 'ตุลาคม (Oct)', 'พฤศจิกายน (Nov)', 'ธันวาคม (Dec)'
  ];

  container.innerHTML = `
    <div class="view-enter">
      <!-- Top Header & Filter Bar -->
      <div class="card p-3 mb-4" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:12px;">
        <div class="flex-between flex-wrap gap-3 mb-3">
          <div>
            <h2 style="margin:0; font-size:1.4rem; display:flex; align-items:center; gap:8px;">
              📊 Dashboard <span style="font-size:0.9rem; font-weight:normal;" class="text-muted">/ แดชบอร์ดสรุปผลภาพรวม v1.5.1</span>
            </h2>
            <p class="text-muted m-0 mt-1" style="font-size:0.85rem;">วิเคราะห์สถานะสินค้า สัดส่วนคอนเทนต์ และประสิทธิภาพแยกตามช่องทาง</p>
          </div>

          <!-- Quick Filters: Year, Month, Category -->
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            
            <!-- Year Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">📅 ปี:</label>
              <select id="dash-filter-year" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:110px;">
                <option value="ALL" ${selectedYear === 'ALL' ? 'selected' : ''}>ทุกปี (All)</option>
                ${availableYears.map(y => `<option value="${y}" ${String(selectedYear) === String(y) ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>

            <!-- Month Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">🗓️ เดือน:</label>
              <select id="dash-filter-month" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:150px;">
                <option value="ALL" ${selectedMonth === 'ALL' ? 'selected' : ''}>ทุกเดือน (All)</option>
                ${monthNames.map((mName, idx) => `<option value="${idx}" ${String(selectedMonth) === String(idx) ? 'selected' : ''}>${mName}</option>`).join('')}
              </select>
            </div>

            <!-- Category Filter -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted);">📦 หมวดสินค้า:</label>
              <select id="dash-filter-category" class="form-select" style="padding:4px 10px; font-size:0.85rem; width:170px;">
                <option value="ALL" ${selectedCategory === 'ALL' ? 'selected' : ''}>ทุกหมวด (All)</option>
                ${productCategories.map(cat => `<option value="${esc(cat)}" ${selectedCategory === cat ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
              </select>
            </div>

          </div>
        </div>
      </div>

      <!-- Top Stat Cards -->
      <div class="stat-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem;">
        <div class="stat-card card p-3" style="border-top:4px solid #6366F1;">
          <div class="stat-label" style="font-weight:700;">Total Products<br><small class="text-muted">สินค้าทั้งหมด</small></div>
          <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #6366F1; margin-top:4px;">${totalProducts}</div>
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

      <!-- Content Mix & Product Category Breakdown -->
      <div class="dash-grid mb-4" style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.5rem;">
        
        <!-- Content Mix Card -->
        <div class="card" style="display:flex; flex-direction:column;">
          <div class="card-header p-3 border-bottom">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight:700;">📝 Content Mix / สัดส่วนประเภทคอนเทนต์</h3>
          </div>
          <div class="p-3" style="flex:1;">
            ${contentTypes.map(t => {
              const item = mixData[t] || { count: 0, percentage: 0 };
              const color = mixColors[t] || '#64748b';
              return `
                <div class="dash-mix-item mb-3">
                  <div class="flex-between mb-1" style="font-size:0.9rem;">
                    <span style="font-weight:700; color:var(--c-text);">${esc(t)}</span>
                    <span style="font-weight:600; font-size:0.85rem;" class="text-muted">${item.count} รายการ (${item.percentage}%)</span>
                  </div>
                  <div class="progress-bar-container" style="background:var(--c-border); border-radius:4px; height:9px; overflow:hidden;">
                    <div class="progress-bar-fill" style="width:${item.percentage}%; background:${color}; height:100%; border-radius:4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Product Category & Status Breakdown Card -->
        <div class="card" style="display:flex; flex-direction:column;">
          <div class="card-header p-3 border-bottom flex-between">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight:700;">📦 Product Categories & Status / แยกตามหมวดสินค้าและสถานะ</h3>
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

      <!-- Content Performance by Channel Table (Clean & Compact) -->
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

  // Wire Filter Event Listeners
  const ySel = container.querySelector('#dash-filter-year');
  const mSel = container.querySelector('#dash-filter-month');
  const cSel = container.querySelector('#dash-filter-category');

  if (ySel) {
    ySel.addEventListener('change', (e) => {
      selectedYear = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (mSel) {
    mSel.addEventListener('change', (e) => {
      selectedMonth = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (cSel) {
    cSel.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      renderDashboard(container, store);
    });
  }
}

export const render = renderDashboard;
