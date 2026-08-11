import { esc, resizeImageFile } from '../utils.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n.js';

let isEditMode = false;

// Header Preset Color Options
const HEADER_COLOR_PRESETS = [
  { id: 'indigo', name: 'Indigo Dream', style: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)', text: '#4F46E5', border: '#818CF8' },
  { id: 'ocean', name: 'Ocean Blue', style: 'linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(59,130,246,0.12) 100%)', text: '#0284C7', border: '#38BDF8' },
  { id: 'sunset', name: 'Sunset Orange', style: 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(245,158,11,0.12) 100%)', text: '#EA580C', border: '#FB923C' },
  { id: 'emerald', name: 'Emerald Mint', style: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(20,184,166,0.12) 100%)', text: '#059669', border: '#34D399' },
  { id: 'dark', name: 'Charcoal Dark', style: 'linear-gradient(135deg, rgba(30,41,59,0.22) 0%, rgba(15,23,42,0.18) 100%)', text: '#1E293B', border: '#475569' }
];

export function renderBrand(container, store) {
  container.innerHTML = '';
  const brand = store.getBrand() || {};
  
  // Default fallback data
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
    { platform: 'TikTok', handle: '@creator.tiktok', url: '50,000+ Followers', followers: '฿15,000 / Clip' },
    { platform: 'Shopee Video', handle: '@creator.shopee', url: '25,000+ Followers', followers: '฿8,000 / Clip' },
    { platform: 'YouTube Shorts', handle: '@CreatorChannel', url: '15,000+ Subscribers', followers: '฿10,000 / Clip' }
  ];

  const moodboard = Array.isArray(brand.moodboardPhotos) && brand.moodboardPhotos.length === 3 
    ? brand.moodboardPhotos 
    : ['', '', ''];

  const selectedHeaderPreset = HEADER_COLOR_PRESETS.find(p => p.id === brand.headerPresetId) || HEADER_COLOR_PRESETS[0];

  const wrapper = document.createElement('div');
  wrapper.className = 'view-enter';
  container.appendChild(wrapper);

  wrapper.innerHTML = `
    <!-- Top Action Bar (Hide on Print) -->
    <div class="card-header no-print flex-between mb-3">
      <div>
        <h2 style="margin:0; font-size:1.4rem; font-weight:800; color:var(--c-text);">📋 Creator Media Kit & Rate Card</h2>
        <p class="text-muted m-0 mt-1" style="font-size:0.85rem;">พรีวิวแบรนด์การ์ดสำหรับเสนอสปอนเซอร์ (กดแก้ไขเพื่อปรับแต่งข้อมูลและเปลี่ยนสี)</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <button class="btn ${isEditMode ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btnToggleEditMode" style="padding:6px 16px; font-weight:700; border-radius:20px;">
          ${isEditMode ? `💾 ${t('common_save')}` : `✏️ ${t('common_edit')}`}
        </button>
        <button class="btn btn-primary btn-sm" id="btnPrintRateCard" style="padding:6px 18px; font-weight:700; border-radius:20px; background:#8b5cf6; border:none; box-shadow:0 3px 10px rgba(139,92,246,0.3);">
          🖨️ Export PDF / Print Rate Card
        </button>
      </div>
    </div>

    <!-- RATE CARD SHEET CONTAINER (Forced Exact Background Printing) -->
    <div class="card brand-board-sheet p-4" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:20px; box-shadow:var(--shadow-md); max-width:960px; margin:0 auto; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
      
      <!-- 🌟 RATE CARD HEADER SPOTLIGHT (Customizable Color Theme) -->
      <div class="brand-header-spotlight p-4" style="background:${selectedHeaderPreset.style}; border:2px solid ${selectedHeaderPreset.border}; border-radius:16px; position:relative; overflow:hidden; margin-bottom:1.75rem !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
        
        ${isEditMode ? `
          <div class="mb-3 p-2 no-print" style="background:rgba(255,255,255,0.7); backdrop-filter:blur(4px); border-radius:10px; border:1px solid var(--c-border); display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.78rem; font-weight:800; color:var(--c-text);">🎨 เลือกสี Header Banner:</span>
            ${HEADER_COLOR_PRESETS.map(p => `
              <button type="button" class="btn btn-sm btn-preset-color ${p.id === selectedHeaderPreset.id ? 'btn-primary' : 'btn-secondary'}" data-preset="${p.id}" style="padding:2px 8px; font-size:0.75rem; border-radius:12px;">
                ${p.name}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div style="display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; position:relative; z-index:2;">
          
          <div style="display:flex; align-items:center; gap:20px; flex:1; min-width:280px;">
            <!-- Portrait Avatar -->
            <div style="position:relative;">
              <div style="width:115px; height:115px; border-radius:50%; overflow:hidden; border:4px solid ${selectedHeaderPreset.text}; background:var(--c-bg); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(0,0,0,0.15);">
                ${brand.portraitPhotoUrl 
                  ? `<img src="${esc(brand.portraitPhotoUrl)}" style="width:100%; height:100%; object-fit:cover;">` 
                  : `<span style="font-size:3rem;">👤</span>`
                }
              </div>
              ${isEditMode ? `
                <label class="btn btn-primary btn-sm no-print" style="position:absolute; bottom:0; right:0; border-radius:50%; width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Upload Photo">
                  📷
                  <input type="file" accept="image/*" id="inputBrandPortrait" style="display:none;">
                </label>
              ` : ''}
            </div>

            <!-- Creator Name & Handles -->
            <div style="flex:1;">
              ${isEditMode ? `
                <input type="text" data-field="creatorName" class="form-input simple-field" placeholder="Creator / Brand Name" value="${esc(brand.creatorName || '')}" style="font-size:1.6rem; font-weight:800; width:100%; margin-bottom:4px;">
                <input type="text" data-field="handles" class="form-input simple-field text-muted" placeholder="@handle · Channel Handles" value="${esc(brand.handles || '')}" style="font-size:0.9rem; width:100%;">
              ` : `
                <h1 style="margin:0; font-size:1.85rem; font-weight:800; color:var(--c-text); letter-spacing:-0.02em; line-height:1.2;">${esc(brand.creatorName || 'Creator Brand Name')}</h1>
                <div style="font-size:0.95rem; font-weight:700; color:${selectedHeaderPreset.text}; margin-top:3px;">${esc(brand.handles || '@creator.official')}</div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--c-text-muted); margin-top:4px; letter-spacing:0.04em;">MEDIA KIT & OFFICIAL RATE CARD</div>
              `}
            </div>
          </div>

          <!-- Tagline Box -->
          <div style="flex:1; min-width:260px; max-width:400px; text-align:right;">
            ${isEditMode ? `
              <label style="font-size:0.75rem; font-weight:700; color:var(--c-text-muted);">Brand Tagline / Slogan:</label>
              <input type="text" data-field="tagline" class="form-input simple-field mt-1" placeholder="Slogan..." value="${esc(brand.tagline || '')}" style="font-size:0.9rem; width:100%;">
            ` : `
              <div style="font-size:0.98rem; font-style:italic; font-weight:700; color:var(--c-text); line-height:1.45;">
                "${esc(brand.tagline || 'Creating High-Converting Affiliate & Authentic Brand Content')}"
              </div>
            `}
          </div>

        </div>
      </div>

      <!-- 📊 MEDIA KIT KEY METRICS DASHBOARD (3 Stat Cards Equal Columns) -->
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; margin-bottom:1.75rem !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
        <div class="p-3 text-center" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; border-top:4px solid #6366F1;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--c-text-muted); text-transform:uppercase; letter-spacing:0.04em;">TOTAL AUDIENCE</div>
          ${isEditMode ? `
            <input type="text" data-field="totalFollowers" class="form-input simple-field text-center mt-1" value="${esc(brand.totalFollowers || '100K+')}" style="font-size:1.3rem; font-weight:800; color:#6366F1;">
          ` : `
            <div style="font-size:1.5rem; font-weight:800; color:#6366F1; margin-top:2px;">${esc(brand.totalFollowers || '100K+')}</div>
          `}
        </div>

        <div class="p-3 text-center" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; border-top:4px solid #10B981;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--c-text-muted); text-transform:uppercase; letter-spacing:0.04em;">AVG VIEWS / CLIP</div>
          ${isEditMode ? `
            <input type="text" data-field="avgViews" class="form-input simple-field text-center mt-1" value="${esc(brand.avgViews || '50K - 200K')}" style="font-size:1.3rem; font-weight:800; color:#10B981;">
          ` : `
            <div style="font-size:1.5rem; font-weight:800; color:#10B981; margin-top:2px;">${esc(brand.avgViews || '50K - 200K')}</div>
          `}
        </div>

        <div class="p-3 text-center" style="background:var(--c-bg); border:1px solid var(--c-border); border-radius:12px; border-top:4px solid #F59E0B;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--c-text-muted); text-transform:uppercase; letter-spacing:0.04em;">ENGAGEMENT RATE</div>
          ${isEditMode ? `
            <input type="text" data-field="avgEngagement" class="form-input simple-field text-center mt-1" value="${esc(brand.avgEngagement || '8.5%')}" style="font-size:1.3rem; font-weight:800; color:#F59E0B;">
          ` : `
            <div style="font-size:1.5rem; font-weight:800; color:#F59E0B; margin-top:2px;">${esc(brand.avgEngagement || '8.5%')}</div>
          `}
        </div>
      </div>

      <!-- MAIN CONTENT GRID (2 COLUMNS) -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;" class="mb-4">
        
        <!-- LEFT COLUMN: CONTENT PILLARS & MOODBOARD -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- Content Pillars Card -->
          <div style="border:1px solid var(--c-border); border-radius:14px; background:var(--c-bg); overflow:hidden; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            
            <!-- Distinct Card Header Banner -->
            <div class="card-section-header-banner p-3 flex-between" style="background:var(--c-primary-light); border-bottom:1px solid var(--c-border); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
              <h3 style="margin:0; font-size:0.98rem; font-weight:800; color:var(--c-primary); display:flex; align-items:center; gap:6px;">
                📌 ${t('set_list_pillars')}
              </h3>
              ${isEditMode ? `<button class="btn btn-sm btn-secondary no-print" id="btnAddPillar">+ Add Pillar</button>` : ''}
            </div>

            <!-- Balanced Line-Height Content Pillars List -->
            <div id="pillarsList" class="p-3" style="display:flex; flex-direction:column; gap:12px;">
              ${pillars.map((p, i) => `
                <div class="p-3" style="border:1px solid var(--c-border); border-radius:10px; background:var(--c-surface); display:flex; flex-direction:column; justify-content:center;">
                  ${isEditMode ? `
                    <div class="flex-between mb-1.5">
                      <input type="text" class="form-input pillar-name" data-index="${i}" value="${esc(p.name || '')}" placeholder="Pillar Name" style="font-weight:700; font-size:0.9rem; flex:1;">
                      <button class="btn btn-sm btn-danger btnDelPillar no-print ms-2" data-index="${i}" style="padding:2px 8px; font-size:0.75rem;">ลบ</button>
                    </div>
                    <textarea class="form-input pillar-desc" data-index="${i}" placeholder="Description..." style="font-size:0.83rem; height:50px; width:100%; line-height:1.45; padding:6px;">${esc(p.desc || '')}</textarea>
                  ` : `
                    <div style="font-weight:700; font-size:0.92rem; color:var(--c-text); line-height:1.3; margin-bottom:4px;">${esc(p.name)}</div>
                    <div style="font-size:0.83rem; color:var(--c-text-muted); line-height:1.45; margin:0;">${esc(p.desc)}</div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Brand Moodboard Photos Card (Large Full Image Boxes) -->
          <div style="border:1px solid var(--c-border); border-radius:14px; background:var(--c-bg); overflow:hidden; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            
            <!-- Distinct Card Header Banner -->
            <div class="card-section-header-banner p-3" style="background:var(--c-primary-light); border-bottom:1px solid var(--c-border); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
              <h3 style="margin:0; font-size:0.98rem; font-weight:800; color:var(--c-primary); display:flex; align-items:center; gap:6px;">
                🖼️ Visual Style & Moodboard
              </h3>
            </div>

            <!-- Large Photo Grid filling bottom space nicely -->
            <div class="p-3">
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
                ${moodboard.map((img, i) => `
                  <div style="position:relative; height:185px; border:1px solid var(--c-border); border-radius:10px; overflow:hidden; background:var(--c-surface); display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.06); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
                    ${img 
                      ? `<img src="${esc(img)}" style="width:100%; height:100%; object-fit:cover; display:block;">` 
                      : `<span style="font-size:1.3rem;" class="text-muted">🖼️ Photo ${i+1}</span>`
                    }
                    ${isEditMode ? `
                      <label class="no-print" style="position:absolute; inset:0; cursor:pointer; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); transition:opacity 0.15s ease;">
                        <span style="color:#fff; font-weight:700; font-size:0.75rem; background:rgba(0,0,0,0.75); padding:6px 12px; border-radius:14px;">📷 Change</span>
                        <input type="file" accept="image/*" class="inputMoodboard" data-index="${i}" style="display:none;">
                      </label>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: COLORS, TONE, AUDIENCE, RATE CARD TABLE -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- Brand Colors Palette Card -->
          <div style="border:1px solid var(--c-border); border-radius:14px; background:var(--c-bg); overflow:hidden; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            
            <!-- Distinct Card Header Banner -->
            <div class="card-section-header-banner p-3" style="background:var(--c-primary-light); border-bottom:1px solid var(--c-border); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
              <h3 style="margin:0; font-size:0.98rem; font-weight:800; color:var(--c-primary); display:flex; align-items:center; gap:6px;">
                🎨 Brand Color Palette
              </h3>
            </div>

            <!-- Color Swatches Grid (Color Preserved on Print) -->
            <div id="colorsList" class="p-3" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
              ${colors.map((c, i) => `
                <div style="border:1px solid var(--c-border); border-radius:10px; background:var(--c-surface); padding:8px; text-align:center;">
                  <div class="color-rect-swatch mb-2" style="height:38px; border-radius:6px; background:${esc(c.hex || '#6366F1')}; border:1px solid rgba(0,0,0,0.1); position:relative; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
                    ${isEditMode ? `
                      <input type="color" class="color-picker no-print" data-index="${i}" value="${esc(c.hex || '#6366F1')}" style="position:absolute; inset:0; opacity:0; width:100%; height:100%; cursor:pointer;">
                    ` : ''}
                  </div>
                  ${isEditMode ? `
                    <input type="text" class="form-input color-name text-center" data-index="${i}" value="${esc(c.name || '')}" style="font-size:0.75rem; padding:1px; width:100%;">
                    <input type="text" class="form-input color-hex text-center text-muted" data-index="${i}" value="${esc(c.hex || '')}" style="font-size:0.7rem; font-family:monospace; padding:1px; width:100%;">
                  ` : `
                    <div style="font-size:0.78rem; font-weight:700; color:var(--c-text);">${esc(c.name)}</div>
                    <div style="font-size:0.7rem; font-family:monospace; color:var(--c-text-muted);">${esc(c.hex)}</div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Tone of Voice & Audience Card -->
          <div style="border:1px solid var(--c-border); border-radius:14px; background:var(--c-bg); overflow:hidden; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            
            <!-- Distinct Card Header Banner -->
            <div class="card-section-header-banner p-3" style="background:var(--c-primary-light); border-bottom:1px solid var(--c-border); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
              <h3 style="margin:0; font-size:0.98rem; font-weight:800; color:var(--c-primary); display:flex; align-items:center; gap:6px;">
                🗣️ Tone of Voice & Target Audience
              </h3>
            </div>

            <div class="p-3.5">
              <div class="mb-3">
                <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Tone of Voice (น้ำเสียงและสไตล์):</label>
                ${isEditMode ? `
                  <input type="text" data-field="tone" class="form-input simple-field mt-1" value="${esc(brand.tone || '')}" style="font-size:0.85rem; width:100%;">
                ` : `
                  <div style="font-size:0.88rem; font-weight:600; color:var(--c-text); margin-top:2px;">${esc(brand.tone || 'เป็นกันเอง จริงใจ ชัดเจน เข้าใจง่าย')}</div>
                `}
              </div>

              <div>
                <div class="flex-between mb-2">
                  <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Target Audience (กลุ่มเป้าหมายหลัก):</label>
                  ${isEditMode ? `<button class="btn btn-sm btn-secondary no-print" id="btnAddAudience">+ Add</button>` : ''}
                </div>
                
                <div id="audienceList" style="display:flex; flex-wrap:wrap; gap:6px;">
                  ${audiences.map((a, i) => `
                    ${isEditMode ? `
                      <div style="display:flex; align-items:center; gap:4px; width:100%;">
                        <input type="text" class="form-input audience-val" data-index="${i}" value="${esc(a)}" style="font-size:0.82rem; flex:1;">
                        <button class="btn btn-sm btn-danger btnDelAudience no-print" data-index="${i}" style="padding:2px 8px; font-size:0.75rem;">ลบ</button>
                      </div>
                    ` : `
                      <span class="badge badge-blue" style="font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:12px;">🎯 ${esc(a)}</span>
                    `}
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Channel & Sponsorship Rate Card Table -->
          <div style="border:1px solid var(--c-border); border-radius:14px; background:var(--c-bg); overflow:hidden; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            
            <!-- Distinct Card Header Banner -->
            <div class="card-section-header-banner p-3 flex-between" style="background:var(--c-primary-light); border-bottom:1px solid var(--c-border); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
              <h3 style="margin:0; font-size:0.98rem; font-weight:800; color:var(--c-primary); display:flex; align-items:center; gap:6px;">
                💳 Rate Card & Channel Packages
              </h3>
              ${isEditMode ? `<button class="btn btn-sm btn-secondary no-print" id="btnAddLink">+ Add Channel</button>` : ''}
            </div>

            <div class="p-3" style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.83rem;">
                <thead>
                  <tr style="text-align:left; border-bottom:2px solid var(--c-border); color:var(--c-text-muted);">
                    <th style="padding:6px;">Platform</th>
                    <th style="padding:6px;">Handle</th>
                    <th style="padding:6px;">Audience</th>
                    <th style="padding:6px; text-align:right;">Rate / Package</th>
                    ${isEditMode ? `<th class="no-print" style="width:36px;"></th>` : ''}
                  </tr>
                </thead>
                <tbody id="linksList">
                  ${links.map((l, i) => `
                    <tr style="border-bottom:1px solid var(--c-border);">
                      ${isEditMode ? `
                        <td style="padding:4px;"><input type="text" class="form-input link-platform" data-index="${i}" value="${esc(l.platform || '')}"></td>
                        <td style="padding:4px;"><input type="text" class="form-input link-handle" data-index="${i}" value="${esc(l.handle || '')}"></td>
                        <td style="padding:4px;"><input type="text" class="form-input link-url" data-index="${i}" value="${esc(l.url || '')}" placeholder="Followers"></td>
                        <td style="padding:4px;"><input type="text" class="form-input link-followers" data-index="${i}" value="${esc(l.followers || '')}" placeholder="฿ Rate"></td>
                        <td class="no-print" style="padding:4px;"><button class="btn btn-sm btn-danger btnDelLink" data-index="${i}">ลบ</button></td>
                      ` : `
                        <td style="padding:8px 6px; font-weight:700; color:var(--c-text);">${esc(l.platform)}</td>
                        <td style="padding:8px 6px; color:var(--c-primary); font-weight:600;">${esc(l.handle)}</td>
                        <td style="padding:8px 6px; font-weight:600; color:var(--c-text-muted);">${esc(l.url)}</td>
                        <td style="padding:8px 6px; font-weight:800; color:#10B981; text-align:right;">${esc(l.followers)}</td>
                      `}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      <!-- RATE CARD FOOTER NOTE -->
      <div class="text-center p-3 border-top" style="color:var(--c-text-muted); font-size:0.78rem; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
        Official Rate Card & Media Kit · Terms & Conditions apply · Contact via email or social handles for sponsorship inquiries.
      </div>

    </div>
  `;

  // WIRE EVENT LISTENERS

  // Preset Color Buttons
  wrapper.querySelectorAll('.btn-preset-color').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetId = e.currentTarget.dataset.preset;
      store.updateBrand('headerPresetId', presetId);
      renderBrand(container, store);
    });
  });

  // Toggle Edit Mode
  wrapper.querySelector('#btnToggleEditMode').addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (!isEditMode) {
      showToast('Saved Rate Card changes! 💾✅', 'success');
    }
    renderBrand(container, store);
  });

  // Print / Export PDF Handler
  wrapper.querySelector('#btnPrintRateCard').addEventListener('click', () => {
    if (isEditMode) {
      isEditMode = false;
      renderBrand(container, store);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  });

  if (isEditMode) {
    // Portrait photo upload
    const portraitInput = wrapper.querySelector('#inputBrandPortrait');
    if (portraitInput) {
      portraitInput.addEventListener('change', async (e) => {
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
    }

    // Moodboard upload
    wrapper.querySelectorAll('.inputMoodboard').forEach(el => {
      el.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        const idx = parseInt(e.target.dataset.index);
        if (!file) return;
        try {
          const dataUrl = await resizeImageFile(file, 600);
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

    // Simple fields auto-save
    wrapper.querySelectorAll('.simple-field').forEach(el => {
      el.addEventListener('input', (e) => {
        store.updateBrand(e.target.dataset.field, e.target.value);
      });
    });

    // Pillars Array Logic
    const getPillars = () => Array.from(wrapper.querySelectorAll('#pillarsList .p-3')).map((_, i) => ({
      name: wrapper.querySelector(`.pillar-name[data-index="${i}"]`)?.value || '',
      desc: wrapper.querySelector(`.pillar-desc[data-index="${i}"]`)?.value || ''
    }));
    const updatePillars = () => store.updateBrand('pillars', getPillars());

    const btnAddPillar = wrapper.querySelector('#btnAddPillar');
    if (btnAddPillar) {
      btnAddPillar.addEventListener('click', () => {
        const p = getPillars();
        p.push({ name: '', desc: '' });
        store.updateBrand('pillars', p);
        renderBrand(container, store);
      });
    }

    wrapper.querySelectorAll('.pillar-name, .pillar-desc').forEach(el => el.addEventListener('input', updatePillars));
    wrapper.querySelectorAll('.btnDelPillar').forEach(el => el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const p = getPillars();
      p.splice(idx, 1);
      store.updateBrand('pillars', p);
      renderBrand(container, store);
    }));

    // Colors Array Logic
    const getColors = () => Array.from(wrapper.querySelectorAll('#colorsList > div')).map((_, i) => ({
      name: wrapper.querySelector(`.color-name[data-index="${i}"]`)?.value || '',
      hex: wrapper.querySelector(`.color-hex[data-index="${i}"]`)?.value || ''
    }));
    const updateColors = () => store.updateBrand('colors', getColors());

    wrapper.querySelectorAll('.color-name').forEach(el => el.addEventListener('input', updateColors));

    wrapper.querySelectorAll('.color-picker').forEach(el => {
      el.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        const hexInput = wrapper.querySelector(`.color-hex[data-index="${idx}"]`);
        const swatch = e.target.closest('div').querySelector('div');
        if (hexInput) hexInput.value = e.target.value.toUpperCase();
        if (swatch) swatch.style.background = e.target.value;
        updateColors();
      });
    });

    wrapper.querySelectorAll('.color-hex').forEach(el => {
      el.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        const picker = wrapper.querySelector(`.color-picker[data-index="${idx}"]`);
        const swatch = e.target.closest('div').querySelector('div');
        if (picker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
          picker.value = e.target.value;
          if (swatch) swatch.style.background = e.target.value;
        }
        updateColors();
      });
    });

    // Target Audience Array Logic
    const getAudience = () => Array.from(wrapper.querySelectorAll('.audience-val')).map(el => el.value);
    const updateAudience = () => store.updateBrand('targetAudience', getAudience());

    const btnAddAudience = wrapper.querySelector('#btnAddAudience');
    if (btnAddAudience) {
      btnAddAudience.addEventListener('click', () => {
        const a = getAudience();
        a.push('');
        store.updateBrand('targetAudience', a);
        renderBrand(container, store);
      });
    }
    wrapper.querySelectorAll('.audience-val').forEach(el => el.addEventListener('input', updateAudience));
    wrapper.querySelectorAll('.btnDelAudience').forEach(el => el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const a = getAudience();
      a.splice(idx, 1);
      store.updateBrand('targetAudience', a);
      renderBrand(container, store);
    }));

    // Channel Links Array Logic
    const getLinks = () => Array.from(wrapper.querySelectorAll('#linksList tr')).map((_, i) => ({
      platform: wrapper.querySelector(`.link-platform[data-index="${i}"]`)?.value || '',
      handle: wrapper.querySelector(`.link-handle[data-index="${i}"]`)?.value || '',
      url: wrapper.querySelector(`.link-url[data-index="${i}"]`)?.value || '',
      followers: wrapper.querySelector(`.link-followers[data-index="${i}"]`)?.value || ''
    }));
    const updateLinks = () => store.updateBrand('channelLinks', getLinks());

    const btnAddLink = wrapper.querySelector('#btnAddLink');
    if (btnAddLink) {
      btnAddLink.addEventListener('click', () => {
        const l = getLinks();
        l.push({ platform: '', handle: '', url: '', followers: '' });
        store.updateBrand('channelLinks', l);
        renderBrand(container, store);
      });
    }
    wrapper.querySelectorAll('.link-platform, .link-handle, .link-url, .link-followers').forEach(el => el.addEventListener('input', updateLinks));
    wrapper.querySelectorAll('.btnDelLink').forEach(el => el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const l = getLinks();
      l.splice(idx, 1);
      store.updateBrand('channelLinks', l);
      renderBrand(container, store);
    }));
  }
}

export function render(container, store) {
  renderBrand(container, store);
}
