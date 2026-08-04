import { esc } from '../utils.js';

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

    container.innerHTML = `
        <div class="view-enter">
            <h2 class="mb-3">Brand & Creator Profile / ข้อมูลแบรนด์และครีเอเตอร์</h2>
            
            <div class="card mb-4">
                <div class="card-header brand-section-header">
                    <h3 class="m-0">👤 Creator Info / ข้อมูลครีเอเตอร์</h3>
                </div>
                <div class="card-body brand-section-body p-3">
                    <div class="dash-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Creator Name / ชื่อครีเอเตอร์</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="creatorName" value="${esc(brand.creatorName || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Handles / ชื่อบัญชี (เช่น @creator)</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="handles" value="${esc(brand.handles || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Tagline / สโลแกน</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="tagline" value="${esc(brand.tagline || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Profile Photo URL / ลิงก์รูปโปรไฟล์</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="profilePhotoUrl" value="${esc(brand.profilePhotoUrl || '')}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="dash-grid mb-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                <!-- Content Pillars -->
                <div class="card">
                    <div class="card-header brand-section-header flex-between">
                        <h3 class="m-0">📌 Content Pillars / แกนคอนเทนต์</h3>
                        <button class="btn btn-sm btn-secondary" id="btnAddPillar">+ Add</button>
                    </div>
                    <div class="card-body brand-section-body p-3" id="pillarsList">
                        ${pillars.map((p, i) => `
                            <div class="flex-between mb-2" style="gap:0.5rem; align-items:flex-start;">
                                <div style="flex:1;">
                                    <input type="text" class="form-input mb-1 pillar-name" placeholder="Pillar Name" data-index="${i}" value="${esc(p.name || '')}">
                                    <input type="text" class="form-input pillar-desc" placeholder="Description" data-index="${i}" value="${esc(p.desc || '')}">
                                </div>
                                <button class="btn btn-sm btn-danger btnDelPillar" data-index="${i}">X</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Brand Colors -->
                <div class="card">
                    <div class="card-header brand-section-header flex-between">
                        <h3 class="m-0">🎨 Brand Colors / สีประจำแบรนด์</h3>
                        <button class="btn btn-sm btn-secondary" id="btnAddColor">+ Add</button>
                    </div>
                    <div class="card-body brand-section-body p-3" id="colorsList">
                        ${colors.map((c, i) => `
                            <div class="flex-between mb-2" style="gap:0.5rem; align-items:center;">
                                <input type="color" class="color-picker" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="width:40px; height:36px; padding:2px; cursor:pointer; border:1px solid #cbd5e1; border-radius:4px;">
                                <input type="text" class="form-input color-name" style="flex:1;" placeholder="Color Name" data-index="${i}" value="${esc(c.name || '')}">
                                <input type="text" class="form-input color-hex" style="width:95px; font-family:monospace;" placeholder="#HEX" data-index="${i}" value="${esc(c.hex || '')}">
                                <button class="btn btn-sm btn-danger btnDelColor" data-index="${i}">X</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Tone of Voice -->
            <div class="card mb-4">
                <div class="card-header brand-section-header">
                    <h3 class="m-0">🗣️ Tone of Voice / โทนการสื่อสาร</h3>
                </div>
                <div class="card-body brand-section-body p-3">
                    <div class="dash-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Tone / น้ำเสียง</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="tone" value="${esc(brand.tone || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Style / สไตล์</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="style" value="${esc(brand.style || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Do's / สิ่งที่ควรทำ</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="dos" value="${esc(brand.dos || '')}">
                        </div>
                        <div class="brand-field form-group">
                            <label class="form-label brand-field-label">Don'ts / สิ่งที่ไม่ควรทำ</label>
                            <input type="text" class="form-input brand-field-value simple-field" data-field="donts" value="${esc(brand.donts || '')}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="dash-grid mb-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                <!-- Target Audience -->
                <div class="card">
                    <div class="card-header brand-section-header flex-between">
                        <h3 class="m-0">🎯 Target Audience / กลุ่มเป้าหมาย</h3>
                        <button class="btn btn-sm btn-secondary" id="btnAddAudience">+ Add</button>
                    </div>
                    <div class="card-body brand-section-body p-3" id="audienceList">
                        ${audiences.map((a, i) => `
                            <div class="flex-between mb-2" style="gap:0.5rem;">
                                <input type="text" class="form-input audience-val" style="flex:1;" placeholder="Audience segment" data-index="${i}" value="${esc(a)}">
                                <button class="btn btn-sm btn-danger btnDelAudience" data-index="${i}">X</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Media Kit Stats -->
                <div class="card">
                    <div class="card-header brand-section-header">
                        <h3 class="m-0">📊 Media Kit Stats / สถิติสำหรับเสนอสปอนเซอร์</h3>
                    </div>
                    <div class="card-body brand-section-body p-3">
                        <div class="dash-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Total Followers / ยอดติดตามรวม</label>
                                <input type="number" class="form-input simple-field" data-field="totalFollowers" value="${esc(brand.totalFollowers || '')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Avg. Views / ยอดวิวมัธยฐาน</label>
                                <input type="number" class="form-input simple-field" data-field="avgViews" value="${esc(brand.avgViews || '')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Avg. Engagement / เอนเกจเมนต์เฉลี่ย</label>
                                <input type="text" class="form-input simple-field" data-field="avgEngagement" value="${esc(brand.avgEngagement || '')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Total Videos / วิดีโอทั้งหมด</label>
                                <input type="number" class="form-input simple-field" data-field="totalVideos" value="${esc(brand.totalVideos || '')}">
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label class="form-label">Top Category / หมวดหมู่เด่น</label>
                                <input type="text" class="form-input simple-field" data-field="topCategory" value="${esc(brand.topCategory || '')}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Channel Links -->
            <div class="card mb-4">
                <div class="card-header brand-section-header flex-between">
                    <h3 class="m-0">🔗 Channel Links / ช่องทางโซเชียลมีเดีย</h3>
                    <button class="btn btn-sm btn-secondary" id="btnAddLink">+ Add</button>
                </div>
                <div class="card-body brand-section-body p-3" style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:600px;">
                        <thead>
                            <tr style="text-align:left; border-bottom:1px solid #ddd;">
                                <th class="p-2" style="width: 150px;">Platform</th>
                                <th class="p-2" style="width: 150px;">Handle</th>
                                <th class="p-2">URL</th>
                                <th class="p-2" style="width: 120px;">Followers</th>
                                <th class="p-2" style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody id="linksList">
                            ${links.map((l, i) => `
                                <tr>
                                    <td class="p-1"><input type="text" class="form-input link-platform" placeholder="e.g. TikTok" data-index="${i}" value="${esc(l.platform || '')}"></td>
                                    <td class="p-1"><input type="text" class="form-input link-handle" placeholder="@handle" data-index="${i}" value="${esc(l.handle || '')}"></td>
                                    <td class="p-1"><input type="text" class="form-input link-url" placeholder="https://..." data-index="${i}" value="${esc(l.url || '')}"></td>
                                    <td class="p-1"><input type="number" class="form-input link-followers" placeholder="Number" data-index="${i}" value="${esc(l.followers || '')}"></td>
                                    <td class="p-1"><button class="btn btn-sm btn-danger btnDelLink" data-index="${i}">X</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 1. Simple fields
    container.querySelectorAll('.simple-field').forEach(el => {
        el.addEventListener('input', (e) => {
            store.updateBrand(e.target.dataset.field, e.target.value);
        });
    });

    // 2. Pillars Array Logic
    const getPillars = () => Array.from(container.querySelectorAll('#pillarsList .flex-between')).map((_, i) => ({
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

    // 3. Colors Array Logic (With Interactive Color Picker)
    const getColors = () => Array.from(container.querySelectorAll('#colorsList .flex-between')).map((_, i) => ({
        name: container.querySelector(`.color-name[data-index="${i}"]`).value,
        hex: container.querySelector(`.color-hex[data-index="${i}"]`).value
    }));
    const updateColors = () => store.updateBrand('colors', getColors());

    container.querySelector('#btnAddColor').addEventListener('click', () => {
        const c = getColors();
        c.push({ name: 'New Color', hex: '#6366F1' });
        store.updateBrand('colors', c);
        renderBrand(container, store);
    });
    
    container.querySelectorAll('.color-name').forEach(el => el.addEventListener('input', updateColors));

    // Sync input[type=color] with input[type=text] for HEX
    container.querySelectorAll('.color-picker').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const hexInput = container.querySelector(`.color-hex[data-index="${idx}"]`);
            if (hexInput) hexInput.value = e.target.value.toUpperCase();
            updateColors();
        });
    });

    container.querySelectorAll('.color-hex').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = e.target.dataset.index;
            const picker = container.querySelector(`.color-picker[data-index="${idx}"]`);
            if (picker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                picker.value = e.target.value;
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
