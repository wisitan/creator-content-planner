import { esc, fmtNum, fmtBaht } from '../utils.js';
import { t } from '../i18n.js';

let selectedYear = 'ALL';
let selectedMonths = new Set(); // Set of month indices (0-11), empty means ALL
let selectedContentType = 'ALL';
let selectedCategory = 'ALL';
let selectedChannel = 'ALL';
let mixSelectedStatus = 'ALL';

export function renderDashboard(container, store) {
  const products = store.getProducts() || [];
  const contentList = store.getContent() || [];
  const channelEntries = store.getChannelTracker() || [];
  const productCategories = store.getSettingList('productCategories') || [];
  const contentTypes = store.getSettingList('contentTypes') || [
    '🛒 Affiliate', '🎯 Personal Brand', '📚 Knowledge', '🤝 Sponsor'
  ];
  const contentStatuses = store.getSettingList('contentStatuses') || [
    '💡 Idea', '✍️ Scripting', '🎬 Filming', '✂️ Editing', '✅ Ready', '📤 Published', '❌ Cancelled'
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

  // Filter content & channels by selected Year, Multi-Months, Content Type, Category & Channel
  const filteredContent = contentList.filter(c => {
    const dStr = c.publishedDate || c.plannedDate;
    if (dStr) {
      const d = new Date(dStr);
      if (selectedYear !== 'ALL' && d.getFullYear() !== parseInt(selectedYear, 10)) return false;
      if (selectedMonths.size > 0 && !selectedMonths.has(d.getMonth())) return false;
    }
    // 🏷️ Content Type Filter
    if (selectedContentType !== 'ALL' && c.contentType !== selectedContentType) {
      return false;
    }
    // 📺 Channel Filter
    if (selectedChannel !== 'ALL' && c.channel !== selectedChannel) {
      return false;
    }
    // 📦 Category Filter
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
      if (selectedMonths.size > 0 && !selectedMonths.has(d.getMonth())) return false;
    }
    if (selectedChannel !== 'ALL' && ch.channel !== selectedChannel) {
      return false;
    }
    if (selectedContentType !== 'ALL' || selectedCategory !== 'ALL') {
      const cItem = contentList.find(c => c.id === ch.contentId);
      if (cItem) {
        if (selectedContentType !== 'ALL' && cItem.contentType !== selectedContentType) return false;
        if (selectedCategory !== 'ALL') {
          const p = products.find(prod => prod.id === cItem.productId);
          if (!p || p.category !== selectedCategory) return false;
        }
      }
    }
    return true;
  });

  // Calculate Stat Cards Values
  const activeProductsCount = filteredProducts.filter(p => p.status && (p.status === 'Active' || p.status.includes('Active'))).length;
  const totalContent = filteredContent.length;
  const publishedCount = filteredContent.filter(c => c.status && c.status.includes('Published')).length;
  const inProgressList = filteredContent.filter(c => !c.status || !c.status.includes('Published'));
  const inProgressCount = inProgressList.length;
  const sponsorDeals = (store.getSponsors() || []).length;

  // Content Mix Filter by Status
  const mixFilteredContent = filteredContent.filter(c => {
    if (mixSelectedStatus !== 'ALL') {
      return c.status === mixSelectedStatus || (c.status && c.status.includes(mixSelectedStatus));
    }
    return true;
  });

  const mixTotalContent = mixFilteredContent.length;
  const mixData = {};
  contentTypes.forEach(tName => {
    const label = tName.split(' ')[1] || tName;
    const count = mixFilteredContent.filter(x => x.contentType === tName || (x.contentType && x.contentType.includes(label))).length;
    const percentage = mixTotalContent > 0 ? Math.round((count / mixTotalContent) * 100) : 0;
    mixData[tName] = { count, percentage };
  });

  const mixColors = {
    '🛒 Affiliate': '#F97316',
    '🎯 Personal Brand': '#3B82F6',
    '📚 Knowledge': '#10B981',
    '🤝 Sponsor': '#8B5CF6',
  };

  // Build SVG Doughnut Slices for Content Mix Chart
  let svgOffset = 25; // 25% starts top (-90deg)
  const svgSegments = contentTypes.map(tName => {
    const item = mixData[tName] || { percentage: 0 };
    const color = mixColors[tName] || '#64748b';
    const pct = item.percentage;
    if (pct <= 0) return '';
    const strokeDash = `${pct} ${100 - pct}`;
    const strokeOffset = svgOffset;
    svgOffset -= pct;
    return `<circle cx="21" cy="21" r="15.91549430918954" fill="none" stroke="${color}" stroke-width="6.5" stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeOffset}"></circle>`;
  }).join('');

  // Calculate Product Category & Status Breakdown
  const categoryBreakdown = {};
  filteredProducts.forEach(p => {
    const cat = p.category || 'Uncategorized';
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

  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  container.innerHTML = `
    <div class="view-enter">
      <!-- Clean Top Header & Filter Card -->
      <div class="card p-3 mb-4" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:12px;">
        
        <div class="mb-3">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800; color:var(--c-text);">📊 ${t('dash_title')}</h2>
        </div>

        <!-- Clean Filter Grid (Content Type in Front of Category, Channel replaces Product Type) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; width: 100%; margin-bottom: 12px;">
          
          <!-- Year Filter -->
          <div style="display: grid; grid-template-columns: 95px 1fr; align-items: center; gap: 6px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--c-text-muted); white-space: nowrap;">📅 ${t('dash_filter_year')}</label>
            <select id="dash-filter-year" class="form-select" style="padding:5px 8px; font-size:0.84rem; width:100%;">
              <option value="ALL" ${selectedYear === 'ALL' ? 'selected' : ''}>${t('dash_all_years')}</option>
              ${availableYears.map(y => `<option value="${y}" ${String(selectedYear) === String(y) ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
          </div>

          <!-- 🏷️ Content Type Filter (Placing in FRONT of Category!) -->
          <div style="display: grid; grid-template-columns: 105px 1fr; align-items: center; gap: 6px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--c-text-muted); white-space: nowrap;">🏷️ Type / ประเภท:</label>
            <select id="dash-filter-content-type" class="form-select" style="padding:5px 8px; font-size:0.84rem; width:100%;">
              <option value="ALL" ${selectedContentType === 'ALL' ? 'selected' : ''}>-- All Types (ทุกประเภท) --</option>
              ${contentTypes.map(ct => `<option value="${esc(ct)}" ${selectedContentType === ct ? 'selected' : ''}>${esc(ct)}</option>`).join('')}
            </select>
          </div>

          <!-- 📦 Category Filter (หมวดสินค้า) -->
          <div style="display: grid; grid-template-columns: 95px 1fr; align-items: center; gap: 6px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--c-text-muted); white-space: nowrap;">📦 ${t('dash_filter_category')}</label>
            <select id="dash-filter-category" class="form-select" style="padding:5px 8px; font-size:0.84rem; width:100%;">
              <option value="ALL" ${selectedCategory === 'ALL' ? 'selected' : ''}>${t('dash_all_categories')}</option>
              ${productCategories.map(cat => `<option value="${esc(cat)}" ${selectedCategory === cat ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
            </select>
          </div>

          <!-- 📺 Channel Filter (Replaced Product Type Filter with Channel!) -->
          <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center; gap: 6px;">
            <label style="font-size:0.82rem; font-weight:700; color:var(--c-text-muted); white-space: nowrap;">📺 Channel / ช่องทาง:</label>
            <select id="dash-filter-channel" class="form-select" style="padding:5px 8px; font-size:0.84rem; width:100%;">
              <option value="ALL" ${selectedChannel === 'ALL' ? 'selected' : ''}>-- All Channels (ทุกช่องทาง) --</option>
              ${configuredChannels.map(ch => `<option value="${esc(ch)}" ${selectedChannel === ch ? 'selected' : ''}>${esc(ch)}</option>`).join('')}
            </select>
          </div>

        </div>

        <!-- Multi-Select Months Toggle Bar -->
        <div style="border-top:1px solid var(--c-border); padding-top:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--c-text-muted); flex-shrink:0;">🗓️ ${t('dash_filter_month')}</span>
          <button type="button" class="btn btn-sm ${selectedMonths.size === 0 ? 'btn-primary' : 'btn-secondary'}" id="btn-dash-month-all" style="padding:2px 10px; font-size:0.78rem; font-weight:700; border-radius:12px;">
            ${t('dash_all_months')}
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

      <!-- Top Stat Cards (2 Cards Per Row On Mobile Responsive) -->
      <div class="stat-grid mb-4" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
        <div class="stat-card card p-2.5" style="border-top:4px solid #6366F1; padding: 10px 12px;">
          <div class="stat-label" style="font-weight:700; font-size:0.78rem; line-height:1.2;">${t('stat_active_products')}<br><small class="text-muted" style="font-size:0.7rem;">${t('stat_active_products_sub')}</small></div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #6366F1; margin-top:2px;">${activeProductsCount}</div>
        </div>
        <div class="stat-card card p-2.5" style="border-top:4px solid #3B82F6; padding: 10px 12px;">
          <div class="stat-label" style="font-weight:700; font-size:0.78rem; line-height:1.2;">${t('stat_total_content')}<br><small class="text-muted" style="font-size:0.7rem;">${t('stat_total_content_sub')}</small></div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #3B82F6; margin-top:2px;">${totalContent}</div>
        </div>
        <div class="stat-card card p-2.5" style="border-top:4px solid #10B981; padding: 10px 12px;">
          <div class="stat-label" style="font-weight:700; font-size:0.78rem; line-height:1.2;">${t('stat_published')}<br><small class="text-muted" style="font-size:0.7rem;">${t('stat_published_sub')}</small></div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #10B981; margin-top:2px;">${publishedCount}</div>
        </div>
        
        <!-- Interactive In Progress Stat Card with Clickable Detail Popup -->
        <div class="stat-card card p-2.5" id="btn-open-inprogress-modal" style="border-top:4px solid #F59E0B; padding: 10px 12px; cursor:pointer; position:relative; transition:transform 0.15s ease;" title="Click to view In Progress Status Breakdown Details">
          <div class="flex-between">
            <div class="stat-label" style="font-weight:700; font-size:0.78rem; line-height:1.2;">${t('stat_in_progress')}<br><small class="text-muted" style="font-size:0.7rem;">${t('stat_in_progress_sub')}</small></div>
            <span style="font-size:0.7rem; font-weight:700; color:#F59E0B; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:10px;">🔍 Detail</span>
          </div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #F59E0B; margin-top:2px;">${inProgressCount}</div>
        </div>

        <div class="stat-card card p-2.5" style="border-top:4px solid #8B5CF6; grid-column: span 2; padding: 10px 12px;">
          <div class="stat-label" style="font-weight:700; font-size:0.78rem; line-height:1.2;">${t('stat_sponsor_deals')}<br><small class="text-muted" style="font-size:0.7rem;">${t('stat_sponsor_deals_sub')}</small></div>
          <div class="stat-value" style="font-size: 1.6rem; font-weight: 800; color: #8B5CF6; margin-top:2px;">${sponsorDeals}</div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;" class="mb-4">
        
        <!-- 🎨 CONTENT MIX (DOUGHNUT CHART WITH HOLE TOTAL & STATUS FILTER) -->
        <div class="card p-4">
          <div class="flex-between mb-3" style="flex-wrap:wrap; gap:8px;">
            <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:var(--c-text); display:flex; align-items:center; gap:6px;">
              🎨 Content Mix
            </h3>
            
            <!-- Status Filter for Content Mix -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:0.78rem; font-weight:600;" class="text-muted">Status:</span>
              <select id="dash-mix-status-filter" class="form-select" style="padding:2px 6px; font-size:0.78rem; width:auto;">
                <option value="ALL" ${mixSelectedStatus === 'ALL' ? 'selected' : ''}>🔍 All Statuses</option>
                ${contentStatuses.map(st => `<option value="${esc(st)}" ${mixSelectedStatus === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Clean SVG Doughnut Chart with Unfilled Transparent Center & Total Content Counter -->
          <div style="display:flex; align-items:center; justify-content:center; position:relative; margin: 15px 0 25px 0;">
            <svg viewBox="0 0 42 42" style="width:170px; height:170px; transform: rotate(-90deg); filter:drop-shadow(0 4px 10px rgba(0,0,0,0.06));">
              <!-- Base Track Circle -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="none" stroke="var(--c-border)" stroke-width="6.5"></circle>
              <!-- Colored Segments -->
              ${svgSegments}
            </svg>

            <!-- Unfilled Center Hole Content Counter -->
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; pointer-events:none;">
              <div style="font-size:1.5rem; font-weight:800; color:var(--c-text); line-height:1;">${mixTotalContent}</div>
              <div style="font-size:0.7rem; font-weight:700; color:var(--c-text-muted); text-transform:uppercase; margin-top:2px;">Total Content</div>
            </div>
          </div>

          <!-- Content Mix Legend Bars -->
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${contentTypes.map(tName => {
              const item = mixData[tName] || { count: 0, percentage: 0 };
              const color = mixColors[tName] || '#64748b';
              return `
                <div>
                  <div class="flex-between mb-1" style="font-size:0.85rem;">
                    <span style="font-weight:700; color:var(--c-text);">${tName}</span>
                    <span style="font-weight:700; color:var(--c-text-muted);">${item.count} (${item.percentage}%)</span>
                  </div>
                  <div style="background:var(--c-border); border-radius:4px; height:8px; overflow:hidden;">
                    <div style="width:${item.percentage}%; background:${color}; height:100%; border-radius:4px; transition:width 0.4s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 📺 CHANNEL PERFORMANCE DISTRIBUTION -->
        <div class="card p-4">
          <div class="flex-between mb-3">
            <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:var(--c-text);">📺 Channel Performance & Views</h3>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
            ${configuredChannels.map(ch => {
              const st = channelStats[ch] || { count: 0, views: 0, clicks: 0, orders: 0, revenue: 0 };
              return `
                <div class="p-3" style="border:1px solid var(--c-border); border-radius:10px; background:var(--c-bg);">
                  <div class="flex-between mb-1.5">
                    <span style="font-weight:800; font-size:0.9rem; color:var(--c-primary);">${esc(ch)}</span>
                    <span class="badge badge-blue" style="font-size:0.75rem; font-weight:700;">${st.count} Clips</span>
                  </div>
                  
                  <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; font-size:0.78rem; color:var(--c-text-muted);" class="mt-2">
                    <div>👁️ <strong>${fmtNum(st.views)}</strong> Views</div>
                    <div>🛒 <strong>${fmtNum(st.clicks)}</strong> Clicks</div>
                    <div>💰 <strong style="color:#10B981;">฿${fmtBaht(st.revenue)}</strong></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- 📦 PRODUCT CATEGORY & STATUS BREAKDOWN -->
      <div class="card p-4 mb-4">
        <h3 class="mb-3" style="margin:0; font-size:1.1rem; font-weight:800; color:var(--c-text);">
          📦 Product Category Status Breakdown
        </h3>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
          ${Object.keys(categoryBreakdown).length ? Object.entries(categoryBreakdown).map(([catName, data]) => `
            <div class="p-3" style="border:1px solid var(--c-border); border-radius:10px; background:var(--c-bg);">
              <div class="flex-between mb-2 border-bottom pb-2">
                <span style="font-weight:800; font-size:0.9rem; color:var(--c-text);">${esc(catName)}</span>
                <span class="badge badge-purple" style="font-size:0.78rem; font-weight:700;">${data.total} Items</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px; font-size:0.8rem; color:var(--c-text-muted);">
                ${Object.entries(data.statuses).map(([st, cnt]) => `
                  <div class="flex-between">
                    <span>${esc(st)}</span>
                    <strong style="color:var(--c-text);">${cnt}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('') : `<div class="text-center p-3 text-muted">No product category data available</div>`}
        </div>
      </div>

    </div>
  `;

  // WIRE EVENT LISTENERS FOR FILTERS
  const ySel = container.querySelector('#dash-filter-year');
  const ctSel = container.querySelector('#dash-filter-content-type');
  const cSel = container.querySelector('#dash-filter-category');
  const chSel = container.querySelector('#dash-filter-channel');
  const mixStSel = container.querySelector('#dash-mix-status-filter');

  if (ySel) {
    ySel.addEventListener('change', (e) => {
      selectedYear = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (ctSel) {
    ctSel.addEventListener('change', (e) => {
      selectedContentType = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (cSel) {
    cSel.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (chSel) {
    chSel.addEventListener('change', (e) => {
      selectedChannel = e.target.value;
      renderDashboard(container, store);
    });
  }
  if (mixStSel) {
    mixStSel.addEventListener('change', (e) => {
      mixSelectedStatus = e.target.value;
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

  // Wire Click Handler for In Progress Modal Popup
  const inProgressBtn = container.querySelector('#btn-open-inprogress-modal');
  if (inProgressBtn) {
    inProgressBtn.addEventListener('click', () => {
      openInProgressModal(inProgressList, store);
    });
  }
}

// Function to render In Progress Breakdown Modal Popup
function openInProgressModal(inProgressList, store) {
  const statusCounts = {};
  const statusItems = {};

  const defaultStatuses = store.getSettingList('contentStatuses') || [
    '💡 Idea', '✍️ Scripting', '🎬 Filming', '✂️ Editing', '✅ Ready', '❌ Cancelled'
  ];

  defaultStatuses.filter(st => !st.includes('Published')).forEach(st => {
    statusCounts[st] = 0;
    statusItems[st] = [];
  });

  inProgressList.forEach(item => {
    const st = item.status || '💡 Idea';
    if (!st.includes('Published')) {
      if (!statusCounts[st]) {
        statusCounts[st] = 0;
        statusItems[st] = [];
      }
      statusCounts[st] += 1;
      statusItems[st].push(item);
    }
  });

  const totalInProgress = inProgressList.length;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay open';
  modalOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); p:16px;';

  modalOverlay.innerHTML = `
    <div class="card p-4" style="width:100%; max-width:540px; max-height:85vh; overflow-y:auto; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.3); background:var(--c-surface); border:1px solid var(--c-border); animation: modalEnter 0.2s ease-out;">
      
      <!-- Modal Header -->
      <div class="flex-between border-bottom pb-3 mb-3">
        <div>
          <h3 style="margin:0; font-size:1.2rem; font-weight:800; color:var(--c-text); display:flex; align-items:center; gap:8px;">
            ⏳ ${t('modal_inprogress_title')}
          </h3>
          <p class="text-muted m-0 mt-1" style="font-size:0.83rem;">
            ${t('modal_inprogress_sub')} (<strong style="color:#F59E0B;">${totalInProgress}</strong>)
          </p>
        </div>
        <button id="btn-close-inprogress-modal" type="button" class="btn btn-secondary" style="border-radius:50%; width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:700;">
          ✕
        </button>
      </div>

      <!-- Status Breakdown List -->
      <div class="mb-4">
        ${Object.keys(statusCounts).length ? Object.entries(statusCounts).map(([stName, count]) => {
          const pct = totalInProgress > 0 ? Math.round((count / totalInProgress) * 100) : 0;
          return `
            <div class="p-2.5 mb-2.5" style="border:1px solid var(--c-border); border-radius:10px; background:var(--c-bg);">
              <div class="flex-between mb-1" style="font-size:0.9rem;">
                <span style="font-weight:700; color:var(--c-text);">${esc(stName)}</span>
                <span style="font-weight:700;" class="badge badge-yellow">${count} (${pct}%)</span>
              </div>
              
              <div style="background:var(--c-border); border-radius:4px; height:6px; overflow:hidden; margin-bottom:6px;">
                <div style="width:${pct}%; background:#F59E0B; height:100%; border-radius:4px;"></div>
              </div>

              ${statusItems[stName] && statusItems[stName].length ? `
                <div style="font-size:0.8rem; color:var(--c-text-muted); padding-left:4px;">
                  ${statusItems[stName].map(c => `• ${esc(c.title || c.hook || c.id)} <small style="opacity:0.7;">(${esc(c.channel || 'N/A')})</small>`).join('<br>')}
                </div>
              ` : `<div style="font-size:0.78rem; color:var(--c-text-muted); font-style:italic; padding-left:4px;">${t('modal_inprogress_empty')}</div>`}
            </div>
          `;
        }).join('') : `<div class="text-center p-3 text-muted">${t('modal_no_inprogress')}</div>`}
      </div>

      <!-- Modal Footer -->
      <div class="text-right border-top pt-3">
        <button id="btn-dismiss-inprogress-modal" type="button" class="btn btn-primary" style="padding:6px 20px; font-weight:700; border-radius:8px;">
          ${t('modal_ok_close')}
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => {
    if (modalOverlay && modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
  };

  modalOverlay.querySelector('#btn-close-inprogress-modal').addEventListener('click', closeModal);
  modalOverlay.querySelector('#btn-dismiss-inprogress-modal').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

export const render = renderDashboard;
