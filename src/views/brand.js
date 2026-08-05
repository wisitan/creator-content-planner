import { esc, resizeImageFile } from '../utils.js';
import { showToast } from '../components/toast.js';

export function render(container, store) {
    renderBrand(container, store);
}

export function renderBrand(container, store) {
    const brand = store.getBrand() || {};
    
    // Arrays fallbacks
    const pillars = Array.isArray(brand.pillars) ? brand.pillars : [];
    const colors = Array.isArray(brand.colors) ? brand.colors : [];
    const audiences = Array.isArray(brand.targetAudience) ? brand.targetAudience : [];
    const links = Array.isArray(brand.channelLinks) ? brand.channelLinks : [];
    const moodboard = Array.isArray(brand.moodboardPhotos) ? brand.moodboardPhotos : ['', '', ''];

    const portraitPhoto = brand.portraitPhotoUrl || '';
    const primaryColor = (colors[0] && colors[0].hex) ? colors[0].hex : '#6366F1';
    const secondaryColor = (colors[1] && colors[1].hex) ? colors[1].hex : '#1E293B';

    container.innerHTML = `
        <div class="view-enter brand-board-page">
            <div class="flex-between mb-3 no-print">
                <h2>🎨 Brand Identity Guidelines / บอร์ดข้อมูลแบรนด์</h2>
                <button class="btn btn-primary" id="btnPrintBrand">🖨️ Print / Export PDF (A4)</button>
            </div>

            <!-- Printable Brand Guidelines Board Document -->
            <div class="brand-board-sheet" style="--brand-primary: ${primaryColor}; --brand-secondary: ${secondaryColor};">
                
                <!-- Board Header Banner -->
                <div class="board-header flex-between mb-3" style="border-bottom: 2px solid ${primaryColor}; padding-bottom: 12px;">
                    <div>
                        <h1 class="brand-title m-0" style="font-size: 1.8rem; font-weight: 800; color: ${secondaryColor}; font-family:'Playfair Display', serif, system-ui;">
                            ${esc(brand.creatorName || 'BRAND IDENTITY')}
                        </h1>
                        <p class="brand-tagline m-0 text-muted" style="font-size: 0.95rem; font-style: italic;">
                            ${esc(brand.tagline || 'Design a life you love / สโลแกนประจำช่อง')}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="badge" style="background:${primaryColor}; color:#fff; font-size:0.85rem; padding:4px 10px; border-radius:20px;">
                            ${esc(brand.handles || '@creator')}
                        </span>
                    </div>
                </div>

                <!-- Section 1: Portrait Photo + Basic Info + Circle Colors -->
                <div class="brand-grid-top mb-3">
                    <!-- Left: Compact Creator Portrait -->
                    <div class="card p-2 text-center brand-portrait-card">
                        <div class="brand-portrait-wrapper" style="position:relative; width:100%; height:220px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                            ${portraitPhoto 
                                ? `<img src="${esc(portraitPhoto)}" style="width:100%; height:100%; object-fit:cover;" id="brandPortraitImg">` 
                                : `<div class="text-muted" style="font-size:0.85rem;">📸 Portrait Photo</div>`
                            }
                            <label class="btn btn-secondary btn-sm no-print" style="position:absolute; bottom:8px; right:8px; opacity:0.9; cursor:pointer; background:#ffffff; box-shadow:0 2px 5px rgba(0,0,0,0.15);">
                                📷 Change
                                <input type="file" accept="image/*" id="inputBrandPortrait" style="display:none;">
                            </label>
                        </div>
                    </div>

                    <!-- Middle: Creator Info & Tone of Voice -->
                    <div class="card p-3 flex-column justify-between">
                        <div class="mb-2">
                            <h4 class="section-subheading" style="color:${primaryColor}; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">👤 Creator Profile</h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.9rem;">
                                <div><strong>Name:</strong> <input type="text" class="form-input simple-field font-weight-600" data-field="creatorName" value="${esc(brand.creatorName || '')}"></div>
                                <div><strong>Handles:</strong> <input type="text" class="form-input simple-field" data-field="handles" value="${esc(brand.handles || '')}"></div>
                            </div>
                        </div>
                        <div>
                            <h4 class="section-subheading" style="color:${primaryColor}; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">🗣️ Tone & Style</h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.85rem;">
                                <div><span class="text-muted">Tone:</span> <input type="text" class="form-input simple-field" data-field="tone" value="${esc(brand.tone || '')}"></div>
                                <div><span class="text-muted">Style:</span> <input type="text" class="form-input simple-field" data-field="style" value="${esc(brand.style || '')}"></div>
                                <div><span class="text-muted">Do's:</span> <input type="text" class="form-input simple-field" data-field="dos" value="${esc(brand.dos || '')}"></div>
                                <div><span class="text-muted">Don'ts:</span> <input type="text" class="form-input simple-field" data-field="donts" value="${esc(brand.donts || '')}"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Circle Color Palettes (Inspired by Blog with Anna) -->
                    <div class="card p-3">
                        <div class="flex-between mb-2" style="border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
                            <h4 class="section-subheading m-0" style="color:${primaryColor};">🎨 Color Palette</h4>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddColor" style="padding:1px 6px; font-size:0.75rem;">+ Add</button>
                        </div>
                        <div class="circle-palette-container" id="colorsList" style="display:flex; flex-wrap:wrap; gap:12px; justify-content:flex-start; margin-top:8px;">
                            ${colors.map((c, i) => `
                                <div class="circle-color-item text-center brand-hover-row" style="position:relative;">
                                    <div class="circle-color-swatch" style="width:48px; height:48px; border-radius:50%; background:${esc(c.hex || '#6366F1')}; margin:0 auto 4px auto; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.12); position:relative; overflow:hidden;">
                                        <input type="color" class="color-picker" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="position:absolute; top:-10px; left:-10px; width:70px; height:70px; cursor:pointer; opacity:0;">
                                    </div>
                                    <input type="text" class="form-input color-name text-center" style="font-size:0.75rem; font-weight:600; padding:0; border:none; background:transparent;" data-index="${i}" value="${esc(c.name || '')}">
                                    <input type="text" class="form-input color-hex text-center text-muted" style="font-size:0.7rem; font-family:monospace; padding:0; border:none; background:transparent;" data-index="${i}" value="${esc(c.hex || '')}">
                                    <button class="btn btn-sm btn-danger btnDelColor hover-show-btn no-print" data-index="${i}" style="position:absolute; top:-4px; right:-4px; padding:0 4px; font-size:0.65rem; border-radius:50%;">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Section 2: Mood Board & Content Pillars with Gallery Photos -->
                <div class="card p-3 mb-3">
                    <div class="flex-between mb-2" style="border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
                        <h4 class="section-subheading m-0" style="color:${primaryColor};">📌 Content Pillars & Mood Board Photo Gallery</h4>
                        <button class="btn btn-sm btn-secondary no-print" id="btnAddPillar">+ Add Pillar</button>
                    </div>
                    
                    <!-- Mood Board Photos Grid (3 images) -->
                    <div class="moodboard-grid mb-3" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                        ${[0, 1, 2].map(idx => `
                            <div class="moodboard-item" style="position:relative; height:120px; background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                                ${moodboard[idx]
                                    ? `<img src="${esc(moodboard[idx])}" style="width:100%; height:100%; object-fit:cover;">`
                                    : `<div class="text-muted" style="font-size:0.75rem;">🖼️ Mood Board Photo ${idx+1}</div>`
                                }
                                <label class="btn btn-secondary btn-sm no-print" style="position:absolute; bottom:4px; right:4px; padding:2px 6px; font-size:0.7rem; background:#fff;">
                                    📷 Upload
                                    <input type="file" accept="image/*" class="inputMoodboard" data-index="${idx}" style="display:none;">
                                </label>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Pillars List -->
                    <div id="pillarsList" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
                        ${pillars.map((p, i) => `
                            <div class="pillar-box brand-hover-row p-2" style="background:#f8fafc; border-left:3px solid ${primaryColor}; border-radius:4px; position:relative;">
                                <input type="text" class="form-input pillar-name font-weight-700 mb-1" style="font-size:0.9rem; color:${secondaryColor};" placeholder="Pillar Name" data-index="${i}" value="${esc(p.name || '')}">
                                <textarea class="form-input pillar-desc text-muted" style="font-size:0.8rem; width:100%; resize:vertical; min-height:45px; border:none; background:transparent;" placeholder="Description" data-index="${i}">${esc(p.desc || '')}</textarea>
                                <button class="btn btn-sm btn-danger btnDelPillar hover-show-btn no-print" data-index="${i}" style="position:absolute; top:4px; right:4px; padding:0 4px; font-size:0.65rem;">✕</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Section 3: Target Audience & Media Kit Stats -->
                <div class="dash-grid mb-3" style="grid-template-columns: 1fr 1fr; gap: 12px;">
                    <!-- Target Audience -->
                    <div class="card p-3">
                        <div class="flex-between mb-2" style="border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
                            <h4 class="section-subheading m-0" style="color:${primaryColor};">🎯 Target Audience</h4>
                            <button class="btn btn-sm btn-secondary no-print" id="btnAddAudience" style="padding:1px 6px; font-size:0.75rem;">+ Add</button>
                        </div>
                        <div id="audienceList">
                            ${audiences.map((a, i) => `
                                <div class="flex-between mb-1 brand-hover-row" style="gap:0.4rem;">
                                    <span style="color:${primaryColor};">•</span>
                                    <input type="text" class="form-input audience-val" style="flex:1; font-size:0.85rem;" placeholder="Audience segment" data-index="${i}" value="${esc(a)}">
                                    <button class="btn btn-sm btn-danger btnDelAudience hover-show-btn no-print" data-index="${i}" style="padding:0 4px; font-size:0.65rem;">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Media Kit Stats -->
                    <div class="card p-3">
                        <h4 class="section-subheading mb-2" style="color:${primaryColor}; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">📊 Media Kit Performance</h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:0.85rem;">
                            <div class="stat-mini-box p-2" style="background:#f8fafc; border-radius:4px;">
                                <span class="text-muted" style="font-size:0.75rem;">Total Followers</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:1rem; color:${secondaryColor};" data-field="totalFollowers" value="${esc(brand.totalFollowers || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:#f8fafc; border-radius:4px;">
                                <span class="text-muted" style="font-size:0.75rem;">Avg. Views</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:1rem; color:${secondaryColor};" data-field="avgViews" value="${esc(brand.avgViews || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:#f8fafc; border-radius:4px;">
                                <span class="text-muted" style="font-size:0.75rem;">Avg. Engagement</span>
                                <input type="text" class="form-input simple-field font-weight-700" style="font-size:1rem; color:${secondaryColor};" data-field="avgEngagement" value="${esc(brand.avgEngagement || '')}">
                            </div>
                            <div class="stat-mini-box p-2" style="background:#f8fafc; border-radius:4px;">
                                <span class="text-muted" style="font-size:0.75rem;">Total Videos</span>
                                <input type="number" class="form-input simple-field font-weight-700" style="font-size:1rem; color:${secondaryColor};" data-field="totalVideos" value="${esc(brand.totalVideos || '')}">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Channel Links -->
                <div class="card p-3">
                    <div class="flex-between mb-2" style="border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
                        <h4 class="section-subheading m-0" style="color:${primaryColor};">🔗 Social Channels</h4>
                        <button class="btn btn-sm btn-secondary no-print" id="btnAddLink" style="padding:1px 6px; font-size:0.75rem;">+ Add</button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                            <thead>
                                <tr style="text-align:left; border-bottom:1px solid #cbd5e1; color:var(--c-text-muted);">
                                    <th style="padding:4px;">Platform</th>
                                    <th style="padding:4px;">Handle</th>
                                    <th style="padding:4px;">URL</th>
                                    <th style="padding:4px;">Followers</th>
                                    <th class="no-print" style="width:30px;"></th>
                                </tr>
                            </thead>
                            <tbody id="linksList">
                                ${links.map((l, i) => `
                                    <tr class="brand-hover-row">
                                        <td style="padding:2px;"><input type="text" class="form-input link-platform" placeholder="Platform" data-index="${i}" value="${esc(l.platform || '')}"></td>
                                        <td style="padding:2px;"><input type="text" class="form-input link-handle" placeholder="@handle" data-index="${i}" value="${esc(l.handle || '')}"></td>
                                        <td style="padding:2px;"><input type="text" class="form-input link-url" placeholder="https://..." data-index="${i}" value="${esc(l.url || '')}"></td>
                                        <td style="padding:2px;"><input type="number" class="form-input link-followers" placeholder="Count" data-index="${i}" value="${esc(l.followers || '')}"></td>
                                        <td class="no-print" style="padding:2px;"><button class="btn btn-sm btn-danger btnDelLink hover-show-btn" data-index="${i}" style="padding:0 4px; font-size:0.65rem;">✕</button></td>
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

    // 3. Colors Array Logic
    const getColors = () => Array.from(container.querySelectorAll('#colorsList .circle-color-item')).map((_, i) => ({
        name: container.querySelector(`.color-name[data-index="${i}"]`).value,
        hex: container.querySelector(`.color-hex[data-index="${i}"]`).value
    }));
    const updateColors = () => store.updateBrand('colors', getColors());

    container.querySelector('#btnAddColor').addEventListener('click', () => {
        const c = getColors();
        c.push({ name: 'Accent', hex: '#F97316' });
        store.updateBrand('colors', c);
        renderBrand(container, store);
    });
    
    container.querySelectorAll('.color-name').forEach(el => el.addEventListener('input', updateColors));

    container.querySelectorAll('.color-picker').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const hexInput = container.querySelector(`.color-hex[data-index="${idx}"]`);
            const swatch = e.target.closest('.circle-color-swatch');
            if (hexInput) hexInput.value = e.target.value.toUpperCase();
            if (swatch) swatch.style.background = e.target.value;
            updateColors();
        });
    });

    container.querySelectorAll('.color-hex').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const picker = container.querySelector(`.color-picker[data-index="${idx}"]`);
            const swatch = e.target.closest('.circle-color-item').querySelector('.circle-color-swatch');
            if (picker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                picker.value = e.target.value;
                if (swatch) swatch.style.background = e.target.value;
            }
            updateColors();
        });
    });

    container.querySelectorAll('.btnDelColor').forEach(el => el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const c = getColors();
        c.splice(idx, 1);
        store.updateBrand('colors', c);
        renderBrand(container, store);
    }));

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
