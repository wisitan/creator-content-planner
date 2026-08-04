/* ──────────────────────────────────────────
   Utility helpers
   ────────────────────────────────────────── */

/** Debounce — delay execution until pause in calls */
export function debounce(fn, ms = 350) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/** Generate short unique ID */
let _seq = Date.now();
export function uid(prefix = '') {
  _seq++;
  return prefix + String(_seq).slice(-4);
}

/** Escape HTML to prevent XSS */
export function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Format date to YYYY-MM-DD */
export function fmtDate(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0, 10);
}

/** Today as YYYY-MM-DD */
export function today() { return fmtDate(new Date()); }

/** Format number with commas */
export function fmtNum(n) {
  if (n == null || n === '') return '';
  return Number(n).toLocaleString('en-US');
}

/** Format currency (Thai Baht) */
export function fmtBaht(n) {
  if (n == null || n === '') return '';
  return '฿' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

/** Deep clone via JSON */
export function clone(o) { return JSON.parse(JSON.stringify(o)); }

/** Resize image file to Base64 thumbnail (fit max 120x120) */
export function resizeImageFile(file, maxDimension = 120) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight WebP/JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Create DOM element shorthand */
export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function')
      e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

/** Simple event emitter */
export class Emitter {
  constructor() { this._h = {}; }
  on(e, fn) { (this._h[e] ||= []).push(fn); return () => this.off(e, fn); }
  off(e, fn) { this._h[e] = (this._h[e] || []).filter(f => f !== fn); }
  emit(e, ...a) { (this._h[e] || []).forEach(fn => fn(...a)); }
}
