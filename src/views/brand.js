import { esc, resizeImageFile } from '../utils.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n.js';

export function renderBrand(container, store) {
    container.innerHTML = '';
    const brand = store.getBrand() || {};
    
    // Fallback default arrays
    const pillars = Array.isArray(brand.pillars) && brand.pillars.length > 0 ? brand.pillars : [
        { name: '🛒 Affiliate & Product Review', desc: 'รีวิวสินค้าเจาะลึก ป้ายยาของน่าซื้อพร้อมแจกพิกัดคอมมิชชัน' },
        { name: '🎯 Personal Brand & Lifestyle', desc: 'แชร์ประสบการณ์ชีวิต เบื้องหลังการทำงาน คอนเทนต์สร้างความสนิทสนม' },
        { name: '📚 Knowledge & Tutorials', desc: 'สอนใช้งานทริคเทคนิค แนะนำวิธีแก้ปัญหาที่ผู้ชมค้นหาบ่อย' }
    ];

    const colors = Array.isArray(brand.colors) && brand.colors.length === 6 ? brand.colors : [
        { name: 'Primary Dark', hex: '#1E293B' },
        { name: 'Accent Blue', hex: '#3B82F6' },
        { name: 'Vibrant Orange', hex: '#F97316' },
        { name: 'Emerald Green', hex: '#10B981' },
        { name: 'Soft Gray', hex: '#F1F5F9' },
        { name: 'Highlight Yellow', hex: '#F59E0B' }
    ];

    const audiences = Array.isArray(brand.targetAudience) && brand.targetAudience.length > 0 ? brand.targetAudience : [
        'กลุ่มคนทำงานประจำ / พนักงานออฟฟิศ (25-40 ปี)',
        'นักช้อปออนไลน์ที่ชอบเปรียบเทียบราคาสินค้าคุ้มค่า',
        'ผู้ที่สนใจเรื่อง IT Gadget, EV Car & Smart Home'
    ];

    const links = Array.isArray(brand.channelLinks) && brand.channelLinks.length > 0 ? brand.channelLinks : [
        { platform: 'TikTok', handle: '@creator.tiktok', url: 'https://tiktok.com', followers: '50000' },
        { platform: 'Shopee Video', handle: '@creator.shopee', url: 'https://shopee.co.th', followers: '25000' },
        { platform: 'YouTube', handle: '@CreatorChannel', url: 'https://youtube.com', followers: '15000' }
    ];

    const moodboard = Array.isArray(brand.moodboardPhotos) && brand.moodboardPhotos.length === 3 
        ? brand.moodboardPhotos 
        : ['', '', ''];

    const wrapper = document.createElement('div');
    wrapper.className = 'view-enter';
    container.appendChild(wrapper);

    wrapper.innerHTML = `
        <div class="card-header no-print flex-between mb-3">
            <div>
                <h2>🎨 ${t('brand_title')}</h2>
                <p class="text-muted">${t('brand_subtitle')}</p>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" id="btnPrintBrand" title="Print or export Brand Guidelines PDF">
                    🖨️ Print / Export PDF
                </button>
            </div>
        </div>

        <!-- Brand Identity Board Printable Sheet -->
        <div class="card brand-board-sheet p-4" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px;">
            
            <!-- Top Header Section (Portrait, Creator Name, Tagline) -->
            <div class="board-header mb-4 pb-4 border-bottom" style="display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;">
                
                <div style="display:flex; align-items:center; gap:20px; flex:1; min-width:300px;">
                    <!-- Portrait Photo with Upload Button -->
                    <div style="position:relative;" class="brand-portrait-wrapper">
                        <div class="brand-portrait-box" style="width:110px; height:110px; border-radius:50%; overflow:hidden; border:4px solid var(--c-primary); background:var(--c-bg); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-md);">
                            ${brand.portraitPhotoUrl 
                                ? `<img src="${esc(brand.portraitPhotoUrl)}" id="imgBrandPortrait" style="width:100%; height:100%; object-fit:cover;">` 
                                : `<span style="font-size:2.5rem;" id="iconBrandPortrait">👤</span>`
                            }
                        </div>
                        <label class="btn btn-primary btn-sm no-print" style="position:absolute; bottom:0; right:0; border-radius:50%; width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.2); cursor:pointer;" title="Upload Creator Photo">
                            📷
                            <input type="file" accept="image/*" id="inputBrandPortrait" style="display:none;">
                        </label>
                    </div>

                    <!-- Creator Name & Handles -->
                    <div style="flex:1;">
                        <input type="text" data-field="creatorName" class="form-input simple-field brand-title" placeholder="Creator / Brand Name" value="${esc(brand.creatorName || '')}" style="font-size:1.8rem; font-weight:800; border:none; background:transparent; padding:0; width:100%; color:var(--c-text);">
                        <input type="text" data-field="handles" class="form-input simple-field text-muted mt-1" placeholder="@handle · Social Media Accounts" value="${esc(brand.handles || '')}" style="font-size:0.95rem; border:none; background:transparent; padding:0; width:100%; color:var(--c-text-muted);">
                    </div>
                </div>

                <!-- Tagline & Position Statement -->
                <div style="flex:1; min-width:280px; max-width:420px; text-align:right;" class="brand-tagline-box">
                    <input type="text" data-field="tagline" class="form-input simple-field" placeholder="Brand Slogan / Positioning Statement..." value="${esc(brand.tagline || '')}" style="font-size:0.95rem; font-style:italic; border:none; background:transparent; padding:0; text-align:right; color:var(--c-primary); font-weight:600; width:100%;">
                </div>
            </div>

            <!-- Main Content Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;">
                
                <!-- Left Column: Content Pillars & Mood Board -->
                <div style="display:flex; flex-direction:column; gap:1.5rem;">
                    
                    <!-- Content Pillars -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <div class="flex-between mb-3 border-bottom pb-2">
                            <h3 class="section-subheading" style="margin:0; font-size:1.05rem; font-weight:700; color:var(--c-primary);">📌 Content Pillars / เสาหลักคอนเทนต์</h3>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddPillar">+ Add</button>
                        </div>
                        <div id="pillarsList" style="display:flex; flex-direction:column; gap:10px;">
                            ${pillars.map((p, i) => `
                                <div class="pillar-box p-2.5" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface);">
                                    <div class="flex-between mb-1">
                                        <input type="text" class="form-input pillar-name" data-index="${i}" placeholder="Pillar Title" value="${esc(p.name || '')}" style="font-weight:700; font-size:0.9rem; border:none; background:transparent; padding:0; color:var(--c-primary); flex:1;">
                                        <button class="btn btn-sm btn-danger btnDelPillar no-print" data-index="${i}" style="padding:0 5px; font-size:0.7rem;">✕</button>
                                    </div>
                                    <textarea class="form-input pillar-desc" data-index="${i}" placeholder="Description..." style="font-size:0.8rem; border:none; background:transparent; padding:0; width:100%; height:45px; resize:none; color:var(--c-text-muted);">${esc(p.desc || '')}</textarea>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Mood Board Photos Grid (3 Photos) -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <h3 class="section-subheading mb-3 pb-2 border-bottom" style="font-size:1.05rem; font-weight:700; color:var(--c-primary);">🖼️ Brand Visual Mood Board / มู้ดพิกเจอร์</h3>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                            ${moodboard.map((img, i) => `
                                <div class="moodboard-item" style="position:relative; aspect-ratio:1/1; border:2px dashed var(--c-border); border-radius:8px; overflow:hidden; background:var(--c-surface); display:flex; align-items:center; justify-content:center;">
                                    ${img 
                                        ? `<img src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;">` 
                                        : `<span style="font-size:1.2rem;" class="text-muted">🖼️ ${i+1}</span>`
                                    }
                                    <label class="no-print" style="position:absolute; inset:0; cursor:pointer; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); opacity:0; transition:opacity 0.2s ease;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
                                        <span style="color:#fff; font-weight:700; font-size:0.75rem; background:rgba(0,0,0,0.7); padding:4px 8px; border-radius:12px;">📷 Upload</span>
                                        <input type="file" accept="image/*" class="inputMoodboard" data-index="${i}" style="display:none;">
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                </div>

                <!-- Right Column: Color Palette, Tone, Audience, Stats & Links -->
                <div style="display:flex; flex-direction:column; gap:1.5rem;">
                    
                    <!-- Brand Colors (6 Color Rectangles) -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <h3 class="section-subheading mb-3 pb-2 border-bottom" style="font-size:1.05rem; font-weight:700; color:var(--c-primary);">🎨 Brand Colors Palette / โทนสีหลัก 6 สี</h3>
                        <div id="colorsList" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                            ${colors.map((c, i) => `
                                <div class="color-rect-item p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface); text-align:center;">
                                    <div class="color-rect-swatch mb-2" style="height:36px; border-radius:6px; background:${esc(c.hex || '#6366F1')}; border:1px solid rgba(0,0,0,0.1); position:relative;">
                                        <input type="color" class="color-picker no-print" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="position:absolute; inset:0; opacity:0; width:100%; height:100%; cursor:pointer;">
                                    </div>
                                    <input type="text" class="form-input color-name text-center" data-index="${i}" value="${esc(c.name || 'Color')}" style="font-size:0.75rem; font-weight:700; border:none; background:transparent; padding:0; width:100%; color:var(--c-text);">
                                    <input type="text" class="form-input color-hex text-center text-muted" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="font-size:0.7rem; font-family:monospace; border:none; background:transparent; padding:0; width:100%;">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Tone of Voice & Style -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <h3 class="section-subheading mb-3 pb-2 border-bottom" style="font-size:1.05rem; font-weight:700; color:var(--c-primary);">🗣️ Tone of Voice & Style / บุคลิกและสไตล์การนำเสนอ</h3>
                        
                        <div class="mb-3">
                            <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Tone of Voice (น้ำเสียงและบรรยากาศ):</label>
                            <input type="text" data-field="tone" class="form-input simple-field mt-1" value="${esc(brand.tone || 'เป็นกันเอง จริงใจ จริงจังแต่เข้าใจง่าย เหมือนเพื่อนสนิทมาป้ายยา')}" style="font-size:0.85rem; width:100%;">
                        </div>

                        <div>
                            <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Presentation Style (สไตล์การเล่าเรื่อง):</label>
                            <input type="text" data-field="style" class="form-input simple-field mt-1" value="${esc(brand.style || 'กระชับ เปิดด้วย Hook ใน 3 วินาทีแรก ใช้ B-Roll ภาพคมชัด ตัดสลับไว')}" style="font-size:0.85rem; width:100%;">
                        </div>
                    </div>

                    <!-- Target Audience Grid -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <div class="flex-between mb-3 border-bottom pb-2">
                            <h3 class="section-subheading" style="margin:0; font-size:1.05rem; font-weight:700; color:var(--c-primary);">🎯 Target Audience / กลุ่มผู้ชมเป้าหมาย</h3>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddAudience">+ Add</button>
                        </div>
                        <div id="audienceList" style="display:flex; flex-direction:column; gap:8px;">
                            ${audiences.map((a, i) => `
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <input type="text" class="form-input audience-val" data-index="${i}" value="${esc(a)}" style="font-size:0.85rem; flex:1;">
                                    <button class="btn btn-sm btn-danger btnDelAudience no-print" data-index="${i}" style="padding:2px 6px;">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Media Kit Stats Dashboard -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <h3 class="section-subheading mb-3 pb-2 border-bottom" style="font-size:1.05rem; font-weight:700; color:var(--c-primary);">📊 Media Kit Highlights / สถิติจุดขายแบรนด์</h3>
                        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
                            <div class="stat-mini-box p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface);">
                                <div style="font-size:0.7rem; color:var(--c-text-muted); font-weight:700;">TOTAL FOLLOWERS</div>
                                <input type="text" data-field="totalFollowers" class="form-input simple-field" value="${esc(brand.totalFollowers || '100K+')}" style="font-size:1.1rem; font-weight:800; color:var(--c-primary); border:none; background:transparent; padding:0; width:100%;">
                            </div>
                            <div class="stat-mini-box p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface);">
                                <div style="font-size:0.7rem; color:var(--c-text-muted); font-weight:700;">AVG VIEWS / CLIP</div>
                                <input type="text" data-field="avgViews" class="form-input simple-field" value="${esc(brand.avgViews || '50K - 200K')}" style="font-size:1.1rem; font-weight:800; color:#10B981; border:none; background:transparent; padding:0; width:100%;">
                            </div>
                            <div class="stat-mini-box p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface);">
                                <div style="font-size:0.7rem; color:var(--c-text-muted); font-weight:700;">ENGAGEMENT RATE</div>
                                <input type="text" data-field="avgEngagement" class="form-input simple-field" value="${esc(brand.avgEngagement || '8.5%')}" style="font-size:1.1rem; font-weight:800; color:#F59E0B; border:none; background:transparent; padding:0; width:100%;">
                            </div>
                            <div class="stat-mini-box p-2" style="border:1px solid var(--c-border); border-radius:8px; background:var(--c-surface);">
                                <div style="font-size:0.7rem; color:var(--c-text-muted); font-weight:700;">TOP CATEGORY</div>
                                <input type="text" data-field="topCategory" class="form-input simple-field" value="${esc(brand.topCategory || 'Tech & Lifestyle')}" style="font-size:1.1rem; font-weight:800; color:#8B5CF6; border:none; background:transparent; padding:0; width:100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Channel Links Table -->
                    <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
                        <div class="flex-between mb-3 border-bottom pb-2">
                            <h3 class="section-subheading" style="margin:0; font-size:1.05rem; font-weight:700; color:var(--c-primary);">🔗 Channel Links / ช่องทางโซเชียลมีเดีย</h3>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddLink">+ Add</button>
                        </div>
                        <div style="overflow-x:auto;">
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="text-align:left; border-bottom:1px solid var(--c-border);">
                                        <th style="padding:4px;">Platform</th>
                                        <th style="padding:4px;">Handle</th>
                                        <th style="padding:4px;">URL</th>
                                        <th style="padding:4px;">Followers</th>
                                        <th class="no-print" style="width:30px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="linksList">
                                    ${links.map((l, i) => `
                                        <tr>
                                            <td style="padding:3px;"><input type="text" class="form-input link-platform" data-index="${i}" value="${esc(l.platform || '')}" style="font-size:0.78rem;"></td>
                                            <td style="padding:3px;"><input type="text" class="form-input link-handle" data-index="${i}" value="${esc(l.handle || '')}" style="font-size:0.78rem;"></td>
                                            <td style="padding:3px;"><input type="text" class="form-input link-url" data-index="${i}" value="${esc(l.url || '')}" style="font-size:0.78rem;"></td>
                                            <td style="padding:3px;"><input type="text" class="form-input link-followers" data-index="${i}" value="${esc(l.followers || '')}" style="font-size:0.78rem;"></td>
                                            <td class="no-print" style="padding:3px;"><button class="btn btn-sm btn-danger btnDelLink" data-index="${i}" style="padding:1px 5px; font-size:0.65rem;">✕</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;

    // 0. Print Handler
    wrapper.querySelector('#btnPrintBrand').addEventListener('click', () => {
        window.print();
    });

    // 0.1 Upload Portrait Photo Handler
    wrapper.querySelector('#inputBrandPortrait').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const dataUrl = await resizeImageFile(file, 600);
            store.updateBrand('portraitPhotoUrl', dataUrl);
            showToast('Portrait photo updated! 📷', 'success');
            renderBrand(container, store);
        } catch (err) {
            showToast('Upload failed: ' + err.message, 'error');
        }
    });

    // 0.2 Moodboard Upload Handler
    wrapper.querySelectorAll('.inputMoodboard').forEach(el => {
        el.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const idx = parseInt(e.target.dataset.index);
            if (!file) return;
            try {
                const dataUrl = await resizeImageFile(file, 500);
                const currentBoard = Array.isArray(store.getBrand().moodboardPhotos) ? [...store.getBrand().moodboardPhotos] : ['', '', ''];
                currentBoard[idx] = dataUrl;
                store.updateBrand('moodboardPhotos', currentBoard);
                showToast(`Moodboard photo ${idx+1} updated! 🖼️`, 'success');
                renderBrand(container, store);
            } catch (err) {
                showToast('Upload failed: ' + err.message, 'error');
            }
        });
    });

    // 1. Simple fields auto-save
    wrapper.querySelectorAll('.simple-field').forEach(el => {
        el.addEventListener('input', (e) => {
            store.updateBrand(e.target.dataset.field, e.target.value);
        });
    });

    // 2. Pillars Array Logic
    const getPillars = () => Array.from(wrapper.querySelectorAll('#pillarsList .pillar-box')).map((_, i) => ({
        name: wrapper.querySelector(`.pillar-name[data-index="${i}"]`).value,
        desc: wrapper.querySelector(`.pillar-desc[data-index="${i}"]`).value
    }));
    const updatePillars = () => store.updateBrand('pillars', getPillars());

    wrapper.querySelector('#btnAddPillar').addEventListener('click', () => {
        const p = getPillars();
        p.push({ name: '', desc: '' });
        store.updateBrand('pillars', p);
        renderBrand(container, store);
    });
    wrapper.querySelectorAll('.pillar-name, .pillar-desc').forEach(el => el.addEventListener('input', updatePillars));
    wrapper.querySelectorAll('.btnDelPillar').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const p = getPillars();
        p.splice(idx, 1);
        store.updateBrand('pillars', p);
        renderBrand(container, store);
    }));

    // 3. Colors Array Logic (Fixed 6 Colors Input Handlers)
    const getColors = () => Array.from(wrapper.querySelectorAll('#colorsList .color-rect-item')).map((_, i) => ({
        name: wrapper.querySelector(`.color-name[data-index="${i}"]`).value,
        hex: wrapper.querySelector(`.color-hex[data-index="${i}"]`).value
    }));
    const updateColors = () => store.updateBrand('colors', getColors());
    
    wrapper.querySelectorAll('.color-name').forEach(el => el.addEventListener('input', updateColors));

    wrapper.querySelectorAll('.color-picker').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const hexInput = wrapper.querySelector(`.color-hex[data-index="${idx}"]`);
            const swatch = e.target.closest('.color-rect-item').querySelector('.color-rect-swatch');
            if (hexInput) hexInput.value = e.target.value.toUpperCase();
            if (swatch) swatch.style.background = e.target.value;
            updateColors();
        });
    });

    wrapper.querySelectorAll('.color-hex').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const picker = wrapper.querySelector(`.color-picker[data-index="${idx}"]`);
            const swatch = e.target.closest('.color-rect-item').querySelector('.color-rect-swatch');
            if (picker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                picker.value = e.target.value;
                if (swatch) swatch.style.background = e.target.value;
            }
            updateColors();
        });
    });

    // 4. Target Audience Array Logic
    const getAudience = () => Array.from(wrapper.querySelectorAll('.audience-val')).map(el => el.value);
    const updateAudience = () => store.updateBrand('targetAudience', getAudience());

    wrapper.querySelector('#btnAddAudience').addEventListener('click', () => {
        const a = getAudience();
        a.push('');
        store.updateBrand('targetAudience', a);
        renderBrand(container, store);
    });
    wrapper.querySelectorAll('.audience-val').forEach(el => el.addEventListener('input', updateAudience));
    wrapper.querySelectorAll('.btnDelAudience').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const a = getAudience();
        a.splice(idx, 1);
        store.updateBrand('targetAudience', a);
        renderBrand(container, store);
    }));

    // 5. Channel Links Array Logic
    const getLinks = () => Array.from(wrapper.querySelectorAll('#linksList tr')).map((_, i) => ({
        platform: wrapper.querySelector(`.link-platform[data-index="${i}"]`).value,
        handle: wrapper.querySelector(`.link-handle[data-index="${i}"]`).value,
        url: wrapper.querySelector(`.link-url[data-index="${i}"]`).value,
        followers: wrapper.querySelector(`.link-followers[data-index="${i}"]`).value
    }));
    const updateLinks = () => store.updateBrand('channelLinks', getLinks());

    wrapper.querySelector('#btnAddLink').addEventListener('click', () => {
        const l = getLinks();
        l.push({ platform: '', handle: '', url: '', followers: '' });
        store.updateBrand('channelLinks', l);
        renderBrand(container, store);
    });
    wrapper.querySelectorAll('.link-platform, .link-handle, .link-url, .link-followers').forEach(el => el.addEventListener('input', updateLinks));
    wrapper.querySelectorAll('.btnDelLink').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const l = getLinks();
        l.splice(idx, 1);
        store.updateBrand('channelLinks', l);
        renderBrand(container, store);
    }));
}

export function render(container, store) {
    renderBrand(container, store);
}
