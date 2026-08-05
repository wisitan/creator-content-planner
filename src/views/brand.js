import { esc, resizeImageFile } from '../utils.js';
import { showToast } from '../components/toast.js';

export function render(container, store) {
    renderBrand(container, store);
}

const DEFAULT_FIXED_COLORS = [
    { name: 'Primary', hex: '#6366F1' },
    { name: 'Secondary', hex: '#1E293B' },
    { name: 'Accent', hex: '#F97316' },
    { name: 'Success', hex: '#22C55E' },
    { name: 'Neutral', hex: '#64748B' },
    { name: 'Background', hex: '#F8FAFC' }
];

export function renderBrand(container, store) {
    const brand = store.getBrand() || {};
    
    // Fallbacks & Ensure exactly 6 colors fixed
    const pillars = Array.isArray(brand.pillars) ? brand.pillars : [];
    let colors = Array.isArray(brand.colors) && brand.colors.length > 0 ? brand.colors : DEFAULT_FIXED_COLORS;
    if (colors.length < 6) {
        colors = [...colors, ...DEFAULT_FIXED_COLORS.slice(colors.length)];
    } else if (colors.length > 6) {
        colors = colors.slice(0, 6);
    }

    const audiences = Array.isArray(brand.targetAudience) ? brand.targetAudience : [];
    const links = Array.isArray(brand.channelLinks) ? brand.channelLinks : [];
    const moodboard = Array.isArray(brand.moodboardPhotos) ? brand.moodboardPhotos : ['', '', ''];

    const portraitPhoto = brand.portraitPhotoUrl || '';
    const primaryColor = colors[0].hex || '#6366F1';
    const secondaryColor = colors[1].hex || '#1E293B';

    container.innerHTML = `
        <div class="view-enter brand-board-page">
            <div class="flex-between mb-3 no-print">
                <h2>🎨 Brand Identity Guidelines / บอร์ดข้อมูลแบรนด์</h2>
                <button class="btn btn-primary" id="btnPrintBrand">🖨️ Print / Export PDF (A4)</button>
            </div>

            <!-- Printable Brand Guidelines Board Document -->
            <div class="brand-board-sheet" style="--brand-primary: ${primaryColor}; --brand-secondary: ${secondaryColor};">
                
                <!-- Board Header Banner -->
                <div class="board-header flex-between mb-3" style="border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">
                    <div>
                        <h1 class="brand-title m-0" style="font-size: 1.8rem; font-weight: 800; color: ${secondaryColor}; font-family:'Playfair Display', serif, system-ui;">
                            ${esc(brand.creatorName || 'BRAND IDENTITY')}
                        </h1>
                        <p class="brand-tagline m-0 text-muted" style="font-size: 0.9rem; font-style: italic;">
                            ${esc(brand.tagline || 'Design a life you love / สโลแกนประจำช่อง')}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="badge" style="background:${primaryColor}; color:#fff; font-size:0.85rem; padding:4px 10px; border-radius:20px;">
                            ${esc(brand.handles || '@creator')}
                        </span>
                    </div>
                </div>

                <!-- Section 1: Top 2-Column Grid (Left: Portrait + Tone, Right: Creator Profile + Rectangular Colors) -->
                <div class="print-grid-top mb-3">
                    <!-- Left: Portrait Photo Card -->
                    <div class="card p-2 text-center brand-portrait-card">
                        <div class="brand-portrait-wrapper" style="position:relative; width:100%; height:190px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                            ${portraitPhoto 
                                ? `<img src="${esc(portraitPhoto)}" style="width:100%; height:100%; object-fit:cover;" id="brandPortraitImg">` 
                                : `<div class="text-muted" style="font-size:0.8rem;">📸 Portrait Photo</div>`
                            }
                            <label class="btn btn-secondary btn-sm no-print" style="position:absolute; bottom:6px; right:6px; opacity:0.9; cursor:pointer; background:#ffffff; box-shadow:0 2px 5px rgba(0,0,0,0.15); padding:2px 6px; font-size:0.75rem;">
                                📷 Change
                                <input type="file" accept="image/*" id="inputBrandPortrait" style="display:none;">
                            </label>
                        </div>
                    </div>

                    <!-- Right: Creator Info + Rectangular 6-Color Palette Grid -->
                    <div class="card p-3 flex-column justify-between">
                        <!-- Profile & Tone -->
                        <div class="mb-2">
                            <h4 class="section-subheading" style="color:${primaryColor}; border-bottom:1px solid #e2e8f0; padding-bottom:3px; margin-bottom:6px; font-size:0.95rem;">👤 Creator Profile & Tone of Voice</h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.85rem;" class="mb-2">
                                <div><strong>Name:</strong> <input type="text" class="form-input simple-field font-weight-600" data-field="creatorName" value="${esc(brand.creatorName || '')}"></div>
                                <div><strong>Handles:</strong> <input type="text" class="form-input simple-field" data-field="handles" value="${esc(brand.handles || '')}"></div>
                                <div><span class="text-muted">Tone:</span> <input type="text" class="form-input simple-field" data-field="tone" value="${esc(brand.tone || '')}"></div>
                                <div><span class="text-muted">Style:</span> <input type="text" class="form-input simple-field" data-field="style" value="${esc(brand.style || '')}"></div>
                                <div><span class="text-muted">Do's:</span> <input type="text" class="form-input simple-field" data-field="dos" value="${esc(brand.dos || '')}"></div>
                                <div><span class="text-muted">Don'ts:</span> <input type="text" class="form-input simple-field" data-field="donts" value="${esc(brand.donts || '')}"></div>
                            </div>
                        </div>

                        <!-- Fixed 6-Color Palette Grid (Rectangular Swatches + Left Names) -->
                        <div>
                            <h4 class="section-subheading m-0 mb-2" style="font-size:0.9rem; border-bottom:1px solid var(--c-border); padding-bottom:3px;">🎨 Brand Color Palette (Fixed 6 Colors)</h4>
                            <div class="color-rect-grid" id="colorsList" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px 12px; margin-top:6px;">
                                ${colors.map((c, i) => `
                                    <div class="color-rect-item" style="display:flex; align-items:center; gap:8px; background:var(--c-bg); padding:4px 8px; border-radius:6px; border:1px solid var(--c-border);">
                                        <div class="color-rect-swatch" style="width:36px; height:24px; border-radius:4px; background:${esc(c.hex || '#6366F1')}; border:1px solid rgba(0,0,0,0.15); cursor:pointer; position:relative; overflow:hidden; flex-shrink:0;">
                                            <input type="color" class="color-picker" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="position:absolute; top:-10px; left:-10px; width:60px; height:60px; cursor:pointer; opacity:0;">
                                        </div>
                                        <div style="flex:1; overflow:hidden;">
                                            <input type="text" class="form-input color-name" style="font-size:0.75rem; font-weight:700; padding:0; border:none; background:transparent; line-height:1.1; width:100%;" data-index="${i}" value="${esc(c.name || '')}">
                                            <input type="text" class="form-input color-hex text-muted" style="font-size:0.68rem; font-family:monospace; padding:0; border:none; background:transparent; line-height:1.1; width:100%;" data-index="${i}" value="${esc(c.hex || '')}">
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Mood Board & Content Pillars -->
                <div class="card p-3 mb-3">
                    <div class="flex-between mb-2" style="border-bottom:1px solid var(--c-border); padding-bottom:3px;">
                        <h4 class="section-subheading m-0" style="font-size:0.95rem;">📌 Content Pillars & Mood Board Gallery</h4>
                        <button class="btn btn-sm btn-secondary no-print" id="btnAddPillar">+ Add Pillar</button>
                    </div>
                    
                    <!-- Mood Board Photos Grid (3 images) -->
                    <div class="moodboard-grid mb-3" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
                        ${[0, 1, 2].map(idx => `
                            <div class="moodboard-item" style="position:relative; height:100px; background:var(--c-bg); border:1px dashed var(--c-border); border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                                ${moodboard[idx]
                                    ? `<img src="${esc(moodboard[idx])}" style="width:100%; height:100%; object-fit:cover;">`
                                    : `<div class="text-muted" style="font-size:0.75rem;">🖼️ Mood Board Photo ${idx+1}</div>`
                                }
                                <label class="btn btn-secondary btn-sm no-print" style="position:absolute; bottom:4px; right:4px; padding:2px 5px; font-size:0.68rem;">
                                    📷 Upload
                                    <input type="file" accept="image/*" class="inputMoodboard" data-index="${idx}" style="display:none;">
                                </label>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Pillars List -->
                    <div id="pillarsList" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
                        ${pillars.map((p, i) => `
                            <div class="pillar-box brand-hover-row p-2" style="background:var(--c-bg); border-left:3px solid ${primaryColor}; border-radius:4px; position:relative;">
                                <input type="text" class="form-input pillar-name font-weight-700 mb-1" style="font-size:0.85rem;" placeholder="Pillar Name" data-index="${i}" value="${esc(p.name || '')}">
                                <textarea class="form-input pillar-desc text-muted" style="font-size:0.78rem; width:100%; resize:vertical; min-height:40px; border:none; background:transparent;" placeholder="Description" data-index="${i}">${esc(p.desc || '')}</textarea>
                                <button class="btn btn-sm btn-danger btnDelPillar hover-show-btn no-print" data-index="${i}" style="position:absolute; top:4px; right:4px; padding:0 3px; font-size:0.6rem;">✕</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Section 3: Target Audience & Media Kit Stats -->
                <div class="dash-grid mb-3" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                    <!-- Target Audience -->
                    <div class="card p-3">
                        <div class="flex-between mb-2" style="border-bottom:1px solid var(--c-border); padding-bottom:3px;">
                            <h4 class="section-subheading m-0" style="font-size:0.95rem;">🎯 Target Audience</h4>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddAudience" style="padding:1px 6px; font-size:0.75rem;">+ Add</button>
                        </div>
                        <div id="audienceList">
                            ${audiences.map((a, i) => `
                                <div class="flex-between mb-1 brand-hover-row" style="gap:0.4rem;">
                                    <span style="color:${primaryColor};">•</span>
                                    <input type="text" class="form-input audience-val" style="flex:1; font-size:0.82rem;" placeholder="Audience segment" data-index="${i}" value="${esc(a)}">
                                    <button class="btn btn-sm btn-danger btnDelAudience hover-show-btn no-print" data-index="${i}" style="padding:0 3px; font-size:0.6rem;">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Media Kit Stats -->
                    <div class="card p-3">
                        <h4 class="section-subheading mb-2" style="font-size:0.95rem; border-bottom:1px solid var(--c-border); padding-bottom:3px;">📊 Media Kit Performance</h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.82rem;">
                            <div class="stat-mini-box p-2" style="background:var(--c-bg); border-radius:4px;">
                                <span class="text-muted" style="font-size:0.72rem;">Total Followers</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:0.95rem;" data-field="totalFollowers" value="${esc(brand.totalFollowers || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:var(--c-bg); border-radius:4px;">
                                <span class="text-muted" style="font-size:0.72rem;">Avg. Views</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:0.95rem;" data-field="avgViews" value="${esc(brand.avgViews || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:var(--c-bg); border-radius:4px;">
                                <span class="text-muted" style="font-size:0.72rem;">Avg. Engagement</span>
                                <input type="text" class="form-input simple-field font-weight-700" style="font-size:0.95rem;" data-field="avgEngagement" value="${esc(brand.avgEngagement || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:var(--c-bg); border-radius:4px;">
                                <span class="text-muted" style="font-size:0.72rem;">Total Videos</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:0.95rem;" data-field="totalVideos" value="${esc(brand.totalVideos || '')}">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Channel Links -->
                <div class="card p-3">
                    <div class="flex-between mb-1" style="border-bottom:1px solid #e2e8f0; padding-bottom:3px;">
                        <h4 class="section-subheading m-0" style="color:${primaryColor}; font-size:0.95rem;">🔗 Social Channels</h4>
                        <button class="btn btn-sm btn-secondary no-print" id="btnAddLink" style="padding:1px 6px; font-size:0.75rem;">+ Add</button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                            <thead>
                                <tr style="text-align:left; border-bottom:1px solid #cbd5e1; color:var(--c-text-muted);">
                                    <th style="padding:3px;">Platform</th>
                                    <th style="padding:3px;">Handle</th>
                                    <th style="padding:3px;">URL</th>
                                    <th style="padding:3px;">Followers</th>
                                    <th class="no-print" style="width:25px;"></th>
                                </tr>
                            </thead>
                            <tbody id="linksList">
                                ${links.map((l, i) => `
                                    <tr class="brand-hover-row">
                                        <td style="padding:2px;"><input type="text" class="form-input link-platform" placeholder="Platform" data-index="${i}" value="${esc(l.platform || '')}"></td>
                                        <td style="padding:2px;"><input type="text" class="form-input link-handle" placeholder="@handle" data-index="${i}" value="${esc(l.handle || '')}"></td>
                                        <td style="padding:2px;"><input type="text" class="form-input link-url" placeholder="https://..." data-index="${i}" value="${esc(l.url || '')}"></td>
                                        <td style="padding:2px;"><input type="number" class="form-input link-followers" placeholder="Count" data-index="${i}" value="${esc(l.followers || '')}"></td>
                                        <td class="no-print" style="padding:2px;"><button class="btn btn-sm btn-danger btnDelLink hover-show-btn" data-index="${i}" style="padding:0 3px; font-size:0.6rem;">✕</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    `;

    // 0. Print Handler
    container.querySelector('#btnPrintBrand').addEventListener('click', () => {
        window.print();
    });

    // 0.1 Upload Portrait Photo Handler
    container.querySelector('#inputBrandPortrait').addEventListener('change', async (e) => {
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
    container.querySelectorAll('.inputMoodboard').forEach(el => {
        el.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const idx = parseInt(e.target.dataset.index);
            if (!file) return;
            try {
                const dataUrl = await resizeImageFile(file, 500);
                const currentBoard = Array.isArray(store.getBrand().moodboardPhotos) ? [...store.getBrand().moodboardPhotos] : ['', '', ''];
                currentBoard[idx] = dataUrl;
                store.updateBrand('moodboardPhotos', currentBoard);
                showToast(`Mood board photo ${idx+1} updated! 🖼️`, 'success');
                renderBrand(container, store);
            } catch (err) {
                showToast('Upload failed: ' + err.message, 'error');
            }
        });
    });

    // 1. Simple fields
    container.querySelectorAll('.simple-field').forEach(el => {
        el.addEventListener('input', (e) => {
            store.updateBrand(e.target.dataset.field, e.target.value);
        });
    });

    // 2. Pillars Array Logic
    const getPillars = () => Array.from(container.querySelectorAll('#pillarsList .pillar-box')).map((_, i) => ({
        name: container.querySelector(`.pillar-name[data-index="${i}"]`).value,
        desc: container.querySelector(`.pillar-desc[data-index="${i}"]`).value
    }));
    const updatePillars = () => store.updateBrand('pillars', getPillars());

    container.querySelector('#btnAddPillar').addEventListener('click', () => {
        const p = getPillars();
        p.push({ name: '', desc: '' });
        store.updateBrand('pillars', p);
        renderBrand(container, store);
    });
    container.querySelectorAll('.pillar-name, .pillar-desc').forEach(el => el.addEventListener('input', updatePillars));
    container.querySelectorAll('.btnDelPillar').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const p = getPillars();
        p.splice(idx, 1);
        store.updateBrand('pillars', p);
        renderBrand(container, store);
    }));

    // 3. Colors Array Logic (Fixed 6 Colors Input Handlers)
    const getColors = () => Array.from(container.querySelectorAll('#colorsList .color-rect-item')).map((_, i) => ({
        name: container.querySelector(`.color-name[data-index="${i}"]`).value,
        hex: container.querySelector(`.color-hex[data-index="${i}"]`).value
    }));
    const updateColors = () => store.updateBrand('colors', getColors());
    
    container.querySelectorAll('.color-name').forEach(el => el.addEventListener('input', updateColors));

    container.querySelectorAll('.color-picker').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const hexInput = container.querySelector(`.color-hex[data-index="${idx}"]`);
            const swatch = e.target.closest('.color-rect-swatch');
            if (hexInput) hexInput.value = e.target.value.toUpperCase();
            if (swatch) swatch.style.background = e.target.value;
            updateColors();
        });
    });

    container.querySelectorAll('.color-hex').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const picker = container.querySelector(`.color-picker[data-index="${idx}"]`);
            const swatch = e.target.closest('.color-rect-item').querySelector('.color-rect-swatch');
            if (picker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                picker.value = e.target.value;
                if (swatch) swatch.style.background = e.target.value;
            }
            updateColors();
        });
    });

    // 4. Target Audience Array Logic
    const getAudience = () => Array.from(container.querySelectorAll('.audience-val')).map(el => el.value);
    const updateAudience = () => store.updateBrand('targetAudience', getAudience());

    container.querySelector('#btnAddAudience').addEventListener('click', () => {
        const a = getAudience();
        a.push('');
        store.updateBrand('targetAudience', a);
        renderBrand(container, store);
    });
    container.querySelectorAll('.audience-val').forEach(el => el.addEventListener('input', updateAudience));
    container.querySelectorAll('.btnDelAudience').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const a = getAudience();
        a.splice(idx, 1);
        store.updateBrand('targetAudience', a);
        renderBrand(container, store);
    }));

    // 5. Channel Links Array Logic
    const getLinks = () => Array.from(container.querySelectorAll('#linksList tr')).map((_, i) => ({
        platform: container.querySelector(`.link-platform[data-index="${i}"]`).value,
        handle: container.querySelector(`.link-handle[data-index="${i}"]`).value,
        url: container.querySelector(`.link-url[data-index="${i}"]`).value,
        followers: container.querySelector(`.link-followers[data-index="${i}"]`).value
    }));
    const updateLinks = () => store.updateBrand('channelLinks', getLinks());

    container.querySelector('#btnAddLink').addEventListener('click', () => {
        const l = getLinks();
        l.push({ platform: '', handle: '', url: '', followers: '' });
        store.updateBrand('channelLinks', l);
        renderBrand(container, store);
    });
    container.querySelectorAll('.link-platform, .link-handle, .link-url, .link-followers').forEach(el => el.addEventListener('input', updateLinks));
    container.querySelectorAll('.btnDelLink').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const l = getLinks();
        l.splice(idx, 1);
        store.updateBrand('channelLinks', l);
        renderBrand(container, store);
    }));
}
