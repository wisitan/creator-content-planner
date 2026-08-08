import { esc } from '../utils.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n.js';

export function renderBrand(container, store) {
  container.innerHTML = '';
  
  const brand = store.getBrand() || {};
  
  const wrapper = document.createElement('div');
  wrapper.className = 'view-enter';
  
  wrapper.innerHTML = `
    <div class="card-header mb-4">
      <div>
        <h2>🎨 ${t('brand_title')}</h2>
        <p class="text-muted">${t('brand_subtitle')}</p>
      </div>
    </div>

    <!-- Brand Identity Board Card -->
    <div class="card p-4 brand-board-sheet" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px;">
      
      <!-- Board Header -->
      <div class="board-header mb-4 pb-3 border-bottom flex-between flex-wrap gap-3">
        <div>
          <h1 class="brand-title" style="margin:0; font-size:1.8rem; font-weight:800; color:var(--c-text);">
            <input type="text" id="brand-creatorName" value="${esc(brand.creatorName || 'Creator Brand')}" class="form-input" style="font-size:1.8rem; font-weight:800; border:none; background:transparent; padding:0; width:100%; color:var(--c-text);">
          </h1>
          <div class="text-muted mt-1" style="font-size:0.95rem;">
            <input type="text" id="brand-handles" value="${esc(brand.handles || '@creator.handle')}" class="form-input" style="font-size:0.95rem; border:none; background:transparent; padding:0; color:var(--c-text-muted); width:100%;">
          </div>
        </div>
        
        <div style="flex:1; max-width:400px; text-align:right;">
          <input type="text" id="brand-tagline" value="${esc(brand.tagline || 'Tagline / Slogan')}" class="form-input" style="font-size:0.9rem; font-style:italic; border:none; background:transparent; padding:0; text-align:right; color:var(--c-primary); width:100%;">
        </div>
      </div>

      <!-- Content Pillars & Tone Grid -->
      <div class="dash-grid mb-4" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        
        <!-- Pillars -->
        <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
          <h3 class="section-subheading mb-3" style="font-size:1rem; font-weight:700; color:var(--c-primary); border-bottom:2px solid var(--c-border); pb:6px;">📌 Content Pillars</h3>
          <div id="brand-pillars-container">
            ${(brand.pillars || ['Tech Reviews', 'Lifestyle', 'Tutorials']).map((p, idx) => `
              <div class="pillar-box mb-2 p-2" style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:8px;">
                <div class="pillar-name" style="font-weight:700; font-size:0.9rem; color:var(--c-text);">${esc(p)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tone & Voice -->
        <div class="p-3" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
          <h3 class="section-subheading mb-3" style="font-size:1rem; font-weight:700; color:var(--c-primary); border-bottom:2px solid var(--c-border); pb:6px;">🗣️ Tone & Style</h3>
          
          <div class="mb-3">
            <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Tone of Voice:</label>
            <input type="text" id="brand-tone" value="${esc(brand.tone || 'Honest, Helpful, Friendly')}" class="form-input simple-field mt-1" style="font-size:0.88rem; width:100%;">
          </div>

          <div>
            <label style="font-size:0.78rem; font-weight:700; color:var(--c-text-muted);">Presentation Style:</label>
            <input type="text" id="brand-style" value="${esc(brand.style || 'Fast-paced B-roll with clear verdict')}" class="form-input simple-field mt-1" style="font-size:0.88rem; width:100%;">
          </div>
        </div>

      </div>

      <!-- Target Audience List -->
      <div class="p-3 mb-4" style="border:1px solid var(--c-border); border-radius:12px; background:var(--c-bg);">
        <h3 class="section-subheading mb-3" style="font-size:1rem; font-weight:700; color:var(--c-primary); border-bottom:2px solid var(--c-border); pb:6px;">🎯 Target Audience</h3>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${(brand.audiences || ['Tech Enthusiasts', 'Office Workers', 'Shopee Buyers']).map(aud => `
            <span class="audience-val badge badge-blue" style="font-size:0.85rem; padding:4px 10px; border-radius:12px;">🎯 ${esc(aud)}</span>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  container.appendChild(wrapper);

  // Wire Auto Save for Brand Fields
  const inputs = wrapper.querySelectorAll('.form-input');
  inputs.forEach(inp => {
    inp.addEventListener('change', (e) => {
      const field = e.target.id.replace('brand-', '');
      store.updateBrand(field, e.target.value);
      showToast('Brand details saved! 🎨✅', 'info');
    });
  });
}

export function render(container, store) {
  renderBrand(container, store);
}
