import { esc, fmtNum, fmtBaht } from '../utils.js';

export function renderDashboard(container, store) {
    const stats = store.getStats() || {};
    const mix = store.getContentMix() || {};
    const products = store.getProducts() || [];
    const content = store.getContent() || [];
    const channelEntries = store.getChannelTracker() || [];

    // Calculate Product Status Breakdown
    const productStatuses = {};
    products.forEach(p => {
        const status = p.status || 'To Review';
        productStatuses[status] = (productStatuses[status] || 0) + 1;
    });

    const statusColors = {
        'Active': '#10B981',
        'To Review': '#F59E0B',
        'Out of Stock': '#EF4444',
        'Archived': '#6B7280'
    };

    // Calculate Content Performance by Channel
    const channelStats = {};
    
    // Seed configured channels first
    const configuredChannels = store.getSettingList('channels') || ['TikTok', 'YouTube Shorts', 'YouTube Long', 'Facebook Reels', 'Shopee Video', 'Instagram Reels'];
    configuredChannels.forEach(ch => {
        channelStats[ch] = {
            count: 0,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            clicks: 0,
            orders: 0,
            revenue: 0
        };
    });

    channelEntries.forEach(entry => {
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

    // Content planned for this month
    const now = new Date();
    const thisMonthContent = store.getContentForMonth(now.getFullYear(), now.getMonth()) || [];
    const planned = thisMonthContent.length;
    const published = thisMonthContent.filter(c => c.status && c.status.includes('Published')).length;

    const colors = {
        affiliate: '#F97316',
        branding: '#3B82F6',
        knowledge: '#10B981',
        sponsor: '#8B5CF6'
    };

    container.innerHTML = `
        <div class="view-enter">
            <div class="card-header flex-between mb-4">
                <div>
                    <h2>📊 Dashboard / แดชบอร์ดสรุปผลภาพรวม</h2>
                    <p class="text-muted">วิเคราะห์สถานะพอร์ตสินค้า สัดส่วนคอนเทนต์ และประสิทธิภาพรายช่องทาง</p>
                </div>
            </div>
            
            <!-- Top Stat Cards -->
            <div class="stat-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem;">
                <div class="stat-card card p-3">
                    <div class="stat-label">Total Products<br><small class="text-muted">สินค้าทั้งหมด</small></div>
                    <div class="stat-value" style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${esc(stats.totalProducts || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Total Content<br><small class="text-muted">คอนเทนต์ทั้งหมด</small></div>
                    <div class="stat-value" style="font-size: 1.8rem; font-weight: bold;">${esc(stats.totalContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Published<br><small class="text-muted">เผยแพร่แล้ว</small></div>
                    <div class="stat-value" style="font-size: 1.8rem; font-weight: bold; color: #10B981;">${esc(stats.publishedContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">In Progress<br><small class="text-muted">กำลังดำเนินการ</small></div>
                    <div class="stat-value" style="font-size: 1.8rem; font-weight: bold; color: #F59E0B;">${esc(stats.inProgressContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Sponsor Deals<br><small class="text-muted">ดีลสปอนเซอร์</small></div>
                    <div class="stat-value" style="font-size: 1.8rem; font-weight: bold; color: #8B5CF6;">${esc(stats.sponsorDeals || 0)}</div>
                </div>
            </div>

            <!-- Content Mix & Product Status Grid -->
            <div class="dash-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                
                <!-- Content Mix -->
                <div class="card">
                    <div class="card-header p-3 border-bottom">
                        <h3 style="margin: 0; font-size: 1.05rem;">📝 Content Mix / สัดส่วนคอนเทนต์</h3>
                    </div>
                    <div class="p-3">
                        ${Object.keys(mix).length ? Object.entries(mix).map(([type, data]) => `
                            <div class="dash-mix-item mb-3">
                                <div class="flex-between mb-1" style="display: flex; justify-space-between; font-size:0.9rem;">
                                    <span><strong>${esc(type)}</strong></span>
                                    <span>${esc(data.count)} รายการ (${esc(data.percentage)}%)</span>
                                </div>
                                <div class="progress-bar-container" style="background: var(--border); border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="width: ${esc(data.percentage)}%; background: ${colors[type.toLowerCase()] || '#64748b'}; height: 100%;"></div>
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state text-muted">ยังไม่มีข้อมูลคอนเทนต์</div>'}
                    </div>
                </div>

                <!-- Product Status Breakdown -->
                <div class="card">
                    <div class="card-header p-3 border-bottom">
                        <h3 style="margin: 0; font-size: 1.05rem;">🛍️ Product Status / สถานะสินค้าในคลัง</h3>
                    </div>
                    <div class="p-3">
                        ${products.length ? Object.entries(productStatuses).map(([status, count]) => {
                            const pct = Math.round((count / products.length) * 100);
                            const statusColor = statusColors[status] || '#6366F1';
                            return `
                            <div class="dash-mix-item mb-3">
                                <div class="flex-between mb-1" style="display: flex; justify-content: space-between; font-size:0.9rem;">
                                    <span style="display:flex; align-items:center; gap:6px;">
                                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${statusColor};"></span>
                                        <strong>${esc(status)}</strong>
                                    </span>
                                    <span>${count} รายการ (${pct}%)</span>
                                </div>
                                <div class="progress-bar-container" style="background: var(--border); border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="width: ${pct}%; background: ${statusColor}; height: 100%;"></div>
                                </div>
                            </div>
                        `;
                        }).join('') : '<div class="empty-state text-muted">ยังไม่มีรายการสินค้า</div>'}
                    </div>
                </div>

            </div>

            <!-- Content Performance by Channel Table -->
            <div class="card mb-4">
                <div class="card-header p-3 border-bottom flex-between">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">📊 Content Performance by Channel / ประสิทธิภาพคอนเทนต์แยกตามช่องทาง</h3>
                        <p class="text-muted m-0" style="font-size:0.85rem;">สรุปยอดวิว ยอดคลิกลิงก์ จำนวนออเดอร์ และรายได้รวมแยกรายแพลตฟอร์ม</p>
                    </div>
                </div>
                <div class="table-responsive p-2">
                    <table class="data-table" style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                        <thead>
                            <tr style="background:var(--bg-card-header); text-align:left; border-bottom:1px solid var(--border);">
                                <th style="padding:10px 14px;">Channel / ช่องทาง</th>
                                <th style="padding:10px 14px; text-align:center;">Videos / คลิป</th>
                                <th style="padding:10px 14px; text-align:right;">Views / ยอดวิวรวม</th>
                                <th style="padding:10px 14px; text-align:right;">Clicks / คลิกสินค้า</th>
                                <th style="padding:10px 14px; text-align:right;">Orders / คำสั่งซื้อ</th>
                                <th style="padding:10px 14px; text-align:right;">Revenue / รายได้รวม</th>
                                <th style="padding:10px 14px; text-align:center;">Engagement %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(channelStats).map(([ch, st]) => {
                                const totalEng = st.likes + st.comments + st.shares + st.saves;
                                const engPct = st.views > 0 ? ((totalEng / st.views) * 100).toFixed(2) + '%' : '-';
                                return `
                                <tr style="border-bottom:1px solid var(--border);">
                                    <td style="padding:10px 14px; font-weight:600; color:var(--text);">
                                        ${esc(ch)}
                                    </td>
                                    <td style="padding:10px 14px; text-align:center;">
                                        <span class="badge" style="background:var(--bg-card); border:1px solid var(--border); font-size:0.85rem;">${st.count}</span>
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
                                        <span style="font-size:0.85rem; font-weight:600; color:${parseFloat(engPct) > 5 ? '#10B981' : 'var(--text-muted)'};">${engPct}</span>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Monthly Summary & Creator Tip -->
            <div class="dash-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="card p-3">
                    <h3 style="margin: 0 0 10px 0; font-size:1.05rem;">📅 Month Summary / สรุปประจำเดือนนี้</h3>
                    <div style="display:flex; justify-content:space-around; align-items:center; padding:10px 0;">
                        <div style="text-align:center;">
                            <div style="font-size:1.6rem; font-weight:bold; color:#6366F1;">${planned}</div>
                            <div class="text-muted" style="font-size:0.85rem;">Planned / วางแผนไว้</div>
                        </div>
                        <div style="font-size:1.5rem; color:var(--border);">|</div>
                        <div style="text-align:center;">
                            <div style="font-size:1.6rem; font-weight:bold; color:#10B981;">${published}</div>
                            <div class="text-muted" style="font-size:0.85rem;">Published / เผยแพร่แล้ว</div>
                        </div>
                    </div>
                </div>

                <div class="card p-3" style="border-left: 4px solid #3B82F6; background: var(--bg-card);">
                    <strong style="color: #3B82F6;">💡 Creator Strategy Tip / คำแนะนำเชิงกลยุทธ์:</strong><br>
                    <span style="font-size:0.9rem; line-height:1.5; color:var(--text);">
                        พยายามรักษาสัดส่วนคอนเทนต์ให้สมดุล (Value Content 80% และ Affiliate Promotion 20%) เพื่อสร้างความเชื่อมั่นในกลุ่มผู้ติดตามระยะยาวค่ะ
                    </span>
                </div>
            </div>

        </div>
    `;
}

export const render = renderDashboard;
