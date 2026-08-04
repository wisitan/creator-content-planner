import { esc } from '../utils.js';

export function renderDashboard(container, store) {
    const stats = store.getStats() || {};
    const mix = store.getContentMix() || {};
    const channels = store.getChannelDistribution() || {};
    
    const now = new Date();
    const thisMonthContent = store.getContentForMonth(now.getFullYear(), now.getMonth()) || [];
    const planned = thisMonthContent.length;
    const published = thisMonthContent.filter(c => c.status === 'published').length;

    const colors = {
        affiliate: '#F97316',
        branding: '#3B82F6',
        knowledge: '#10B981',
        sponsor: '#8B5CF6'
    };

    container.innerHTML = `
        <div class="view-enter">
            <h2 class="mb-4">Dashboard / แดชบอร์ด</h2>
            
            <div class="stat-grid mb-5" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div class="stat-card card p-3">
                    <div class="stat-label">Total Products<br><small class="text-muted">สินค้าทั้งหมด</small></div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold;">${esc(stats.totalProducts || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Total Content<br><small class="text-muted">คอนเทนต์ทั้งหมด</small></div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold;">${esc(stats.totalContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Published<br><small class="text-muted">เผยแพร่แล้ว</small></div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold;">${esc(stats.publishedContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">In Progress<br><small class="text-muted">กำลังดำเนินการ</small></div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold;">${esc(stats.inProgressContent || 0)}</div>
                </div>
                <div class="stat-card card p-3">
                    <div class="stat-label">Sponsor Deals<br><small class="text-muted">ดีลสปอนเซอร์</small></div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold;">${esc(stats.sponsorDeals || 0)}</div>
                </div>
            </div>

            <div class="dash-grid mb-5" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="card">
                    <div class="card-header p-3 border-bottom">
                        <h3 style="margin: 0;">Content Mix / สัดส่วนคอนเทนต์</h3>
                    </div>
                    <div class="p-4">
                        ${Object.keys(mix).length ? Object.entries(mix).map(([type, data]) => `
                            <div class="dash-mix-item mb-3">
                                <div class="flex-between mb-1" style="display: flex; justify-content: space-between;">
                                    <span>${esc(type)}</span>
                                    <span>${esc(data.count)} (${esc(data.percentage)}%)</span>
                                </div>
                                <div class="progress-bar-container" style="background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="width: ${esc(data.percentage)}%; background: ${colors[type.toLowerCase()] || '#64748b'}; height: 100%;"></div>
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state text-muted">No data / ไม่มีข้อมูล</div>'}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header p-3 border-bottom">
                        <h3 style="margin: 0;">Channel Distribution / ช่องทางเผยแพร่</h3>
                    </div>
                    <div class="p-4">
                        ${Object.keys(channels).length ? Object.entries(channels).map(([channel, count]) => {
                            const max = Math.max(...Object.values(channels), 1);
                            const pct = Math.round((count / max) * 100);
                            return `
                            <div class="dash-mix-item mb-3">
                                <div class="flex-between mb-1" style="display: flex; justify-content: space-between;">
                                    <span>${esc(channel)}</span>
                                    <span>${esc(count)}</span>
                                </div>
                                <div class="progress-bar-container" style="background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="width: ${pct}%; background: #0ea5e9; height: 100%;"></div>
                                </div>
                            </div>
                        `;
                        }).join('') : '<div class="empty-state text-muted">No data / ไม่มีข้อมูล</div>'}
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header p-3 border-bottom">
                    <h3 style="margin: 0;">This Month / เดือนนี้</h3>
                </div>
                <div class="p-4">
                    <p class="mb-2">Planned / วางแผนไว้: <strong>${planned}</strong></p>
                    <p class="mb-0">Published / เผยแพร่แล้ว: <strong>${published}</strong></p>
                </div>
            </div>

            <div class="p-4 mt-4" style="background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <strong style="color: #1e40af;">Tip / คำแนะนำ:</strong> Keep your content mix balanced. Aim for 80% value and 20% promotion. <br>
                <span class="text-muted">พยายามรักษาสัดส่วนคอนเทนต์ให้สมดุล เน้นให้คุณค่า 80% และโปรโมท 20%</span>
            </div>
        </div>
    `;
}

export const render = renderDashboard;
