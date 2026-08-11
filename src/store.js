/* ──────────────────────────────────────────
   Data Store — localStorage backed
   ────────────────────────────────────────── */
import { debounce, uid, getNextId, clone, Emitter } from './utils.js';

const STORAGE_KEY = 'ccp_data_v1';
const BACKUP_SNAPSHOT_KEY = 'ccp_data_last_save_v1';
const DEFAULT_GOOGLE_CLIENT_ID = '586705952935-j91o3ch4j005kh6tjam0tqt8u3ops55s.apps.googleusercontent.com';

// ── Default Settings ──
const DEFAULT_SETTINGS = {
  googleClientId: DEFAULT_GOOGLE_CLIENT_ID,
  theme: 'light',
  channels: ['TikTok','Shopee Video','YouTube Shorts','YouTube Long','Instagram Reels','Facebook Reels','LINE VOOM','X (Twitter)'],
  contentPillars: ['Desk Productivity','Everyday Electronics','Creator Gear','EV/Solar Lifestyle','Windows-to-Mac'],
  productCategories: ['Desk Productivity','Everyday Electronics','Creator Gear','EV Solar','Mac Accessories','Smartphone Accessories','Home Smart'],
  contentTypes: ['🛒 Affiliate','🎯 Personal Brand','📚 Knowledge','🤝 Sponsor'],
  contentAngles: ['Selling Point','Pain Point','Comparison','Tutorial','Storytelling','Trend','Review','Unboxing','Setup Tour'],
  contentStatuses: ['💡 Idea','✍️ Scripting','🎬 Filming','✂️ Editing','✅ Ready','📤 Published','❌ Cancelled'],
  productStatuses: ['To Review','Approved','Active','Paused','Done'],
  productTypes: ['A สินค้าขายดี', 'B สินค้ามาใหม่', 'C สินค้าราคาประหยัด', 'D สินค้าค่าคอมสูง'],
  priceRanges: ['< ฿500','฿500-1,000','฿1,000-2,000','฿2,000-5,000','฿5,000+'],
  ctaTypes: ['ปักตะกร้า','Link in Bio','Follow','Comment','Save','DM','Share'],
  dealTypes: ['Paid Review','Barter','Affiliate Boost','Long-term','Ambassador'],
  paymentStatuses: ['Pending','Invoiced','Paid','Cancelled'],
};

const DEFAULT_PRODUCT_IMAGES = {
  P001: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
  P002: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80',
  P003: 'https://images.unsplash.com/photo-1609592424074-1d374465d3d4?w=500&auto=format&fit=crop&q=80',
  P004: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=80',
  P005: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80',
  P006: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
};

const DEFAULT_CONTENT_COVERS = {
  C001: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
  C002: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80',
  C003: 'https://images.unsplash.com/photo-1609592424074-1d374465d3d4?w=500&auto=format&fit=crop&q=80',
  C004: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=80',
  C005: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80',
  C006: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
};

const DEFAULT_BRAND = {
  creatorName: '',
  handles: '',
  tagline: '',
  profilePhotoUrl: '',
  pillars: [
    { name: 'Desk Productivity', desc: 'อุปกรณ์จัดโต๊ะ, USB-C hub, monitor arm' },
    { name: 'Everyday Electronics', desc: 'power bank, GaN charger, smart plug' },
    { name: 'Creator Gear', desc: 'ไมค์, ไฟ, tripod, อุปกรณ์ถ่ายคลิป' },
    { name: 'EV/Solar Lifestyle', desc: 'อุปกรณ์ EV, solar, smart home' },
    { name: 'Windows-to-Mac', desc: 'การย้ายจาก Windows มา Mac' },
  ],
  colors: [
    { name: 'Primary', hex: '#6366F1' },
    { name: 'Secondary', hex: '#1E293B' },
    { name: 'Accent', hex: '#F97316' },
    { name: 'Success', hex: '#22C55E' },
    { name: 'Background', hex: '#F8FAFC' },
  ],
  tone: '',
  style: '',
  dos: '',
  donts: '',
  audiences: [],
  channelLinks: [],
  stats: { totalFollowers: '', avgViews: '', avgEngagement: '', totalVideos: '', topCategory: '' },
  rateCard: [],
  portfolio: [],
};

// ── Store singleton ──
class Store extends Emitter {
  constructor() {
    super();
    this._data = this._load();
    this._save = debounce(() => this._persist(), 400);
  }

  /* ── Persistence ── */
  _load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      
      // Safety Net: If current data is missing or empty, check if we have a backup snapshot
      if (!raw) {
        const backupRaw = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
        if (backupRaw) {
          const snapshot = JSON.parse(backupRaw);
          if (snapshot && snapshot.raw) {
            raw = snapshot.raw;
            localStorage.setItem(STORAGE_KEY, raw);
            console.log('[Store] Auto-recovered data from backup snapshot!');
          }
        }
      }

      if (!raw) return this._defaults();
      const parsed = JSON.parse(raw);
      const data = {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings, googleClientId: DEFAULT_GOOGLE_CLIENT_ID },
        products: parsed.products || [],
        content: parsed.content || [],
        channelTracker: parsed.channelTracker || [],
        sponsors: parsed.sponsors || [],
        deletedItems: parsed.deletedItems || [],
        brand: { ...DEFAULT_BRAND, ...parsed.brand },
      };
      // Migration: backfill updatedAt for legacy records that don't have it
      this._migrateTimestamps(data);
      this._migrateDates(data);
      return data;
    } catch (e) {
      console.warn('[Store] Corrupted data, trying backup snapshot', e);
      try {
        const backupRaw = localStorage.getItem(BACKUP_SNAPSHOT_KEY);
        if (backupRaw) {
          const snapshot = JSON.parse(backupRaw);
          if (snapshot && snapshot.raw) {
            const parsed = JSON.parse(snapshot.raw);
            return {
              settings: { ...DEFAULT_SETTINGS, ...parsed.settings, googleClientId: DEFAULT_GOOGLE_CLIENT_ID },
              products: parsed.products || [],
              content: parsed.content || [],
              channelTracker: parsed.channelTracker || [],
              sponsors: parsed.sponsors || [],
              deletedItems: parsed.deletedItems || [],
              brand: { ...DEFAULT_BRAND, ...parsed.brand },
            };
          }
        }
      } catch (err) {}
      const defaults = this._defaults();
      this._migrateTimestamps(defaults);
      return defaults;
    }
  }

  _defaults() {
    return {
      settings: clone(DEFAULT_SETTINGS),
      products: [],
      content: [],
      channelTracker: [],
      sponsors: [],
      deletedItems: [],
      brand: clone(DEFAULT_BRAND),
    };
  }

  _migrateTimestamps(data) {
    const now = new Date().toISOString();
    const collections = ['products', 'content', 'channelTracker', 'sponsors'];
    let migrated = false;
    collections.forEach(key => {
      (data[key] || []).forEach(item => {
        if (item && item.id && !item.updatedAt) {
          item.updatedAt = now;
          migrated = true;
        }
      });
    });
    if (migrated) {
      console.log('[Store] Migrated legacy records with updatedAt timestamps');
    }
  }

  _migrateDates(data) {
    if (!data || !data.content) return;
    data.content.forEach(c => {
      if (c && typeof c === 'object') {
        const val = c.publishedPlan || c.publishedDate || c.plannedDate || '';
        c.publishedPlan = val;
        c.publishedDate = val;
        c.plannedDate = val;
      }
    });
  }

  _persist() {
    try {
      const totalRecs = (this._data.products?.length || 0) + 
                        (this._data.content?.length || 0) + 
                        (this._data.channelTracker?.length || 0) + 
                        (this._data.sponsors?.length || 0);

      this._data.meta = {
        lastUpdated: new Date().toISOString(),
        totalRecords: totalRecs,
        deviceName: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'Mobile Device' : 'PC / Mac',
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      this.emit('saved');
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this.emit('error', 'Storage full! Please export and clear data.');
      }
      console.error('[Store] Save failed', e);
    }
  }

  forceSave() {
    this._persist();
    return true;
  }

  _changed(area) {
    this._save();
    this.emit('change', area);
  }

  /* ── Settings, Theme & Language ── */
  getSettings() { return this._data.settings; }
  getTheme() { return this._data.settings.theme || 'light'; }
  setTheme(theme) {
    this._data.settings.theme = theme;
    this._changed('settings');
  }
  getLanguage() { 
    return this._data.settings.language || localStorage.getItem('ccp_lang') || 'en'; 
  }
  setLanguage(lang) {
    this._data.settings.language = lang;
    localStorage.setItem('ccp_lang', lang);
    this._changed('settings');
  }
  getSettingList(key) { return this._data.settings[key] || []; }
  updateSettingList(key, values) {
    this._data.settings[key] = values;
    this._changed('settings');
  }
  addSettingItem(key, value) {
    if (!this._data.settings[key]) this._data.settings[key] = [];
    this._data.settings[key].push(value);
    this._changed('settings');
  }
  removeSettingItem(key, index) {
    this._data.settings[key].splice(index, 1);
    this._changed('settings');
  }

  _trackDelete(id, type) {
    if (!this._data.deletedItems) this._data.deletedItems = [];
    this._data.deletedItems.push({
      id: String(id),
      type: type,
      deletedAt: new Date().toISOString(),
    });
    // Garbage collection for tombstones older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this._data.deletedItems = this._data.deletedItems.filter(item => {
      return new Date(item.deletedAt).getTime() > thirtyDaysAgo;
    });
  }

  /* ── Products ── */
  getProducts() { return this._data.products; }
  getProduct(id) { return this._data.products.find(p => p.id === id); }
  addProduct(data = {}) {
    const nextId = (data && data.id) || getNextId('P', this._data.products, 4);
    const p = {
      id: nextId, name: '', category: '', brand: '', priceRange: '',
      platform: '', commission: '', affiliateLink: '',
      sellingPoints: '', productType: 'A สินค้าขายดี', targetAudience: '',
      imageUrl: '', status: 'To Review', notes: '', ...data,
    };
    p.updatedAt = new Date().toISOString();
    this._data.products.push(p);
    this._changed('products');
    return p;
  }
  updateProduct(id, field, value) {
    const cleanId = String(id).trim();
    const cleanValue = String(value).trim();

    if (field === 'id') {
      if (!cleanValue) return { error: true, message: 'รหัส ID ห้ามเป็นค่าว่างค่ะ' };
      if (cleanId.toLowerCase() === cleanValue.toLowerCase()) return { success: true };

      const existingWithValue = this._data.products.find(p => 
        String(p.id).trim().toLowerCase() === cleanValue.toLowerCase()
      );
      const existingWithId = this._data.products.find(p => 
        String(p.id).trim().toLowerCase() === cleanId.toLowerCase()
      );

      // Ghost event check: old ID no longer exists, but new ID already exists (was just renamed)
      if (!existingWithId && existingWithValue) {
        return { success: true };
      }

      // Real duplicate check: both exist and are different items
      if (existingWithValue && existingWithId && existingWithValue !== existingWithId) {
        return { error: true, message: `รหัสสินค้า "${cleanValue}" มีอยู่ในระบบแล้วค่ะ! ไม่สามารถใช้ ID ซ้ำได้` };
      }

      const p = existingWithId || existingWithValue;
      if (p) {
        this._trackDelete(cleanId, 'product');
        p.id = cleanValue;
        p.updatedAt = new Date().toISOString();
        this._changed('products');
        return { success: true };
      }
      return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
    }

    const p = this.getProduct(cleanId) || this.getProduct(cleanValue);
    if (p) { p[field] = value; p.updatedAt = new Date().toISOString(); this._changed('products'); return { success: true }; }
    return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  }
  deleteProduct(id) {
    this._trackDelete(id, 'product');
    const targetIdStr = String(id).trim().toLowerCase();
    this._data.products = this._data.products.filter(p => String(p.id).trim().toLowerCase() !== targetIdStr);
    this._changed('products');
  }

  /* ── Content ── */
  getContent() { return this._data.content; }
  getContentItem(id) { 
    const clean = String(id).trim().toLowerCase();
    return this._data.content.find(c => String(c.id).trim().toLowerCase() === clean); 
  }
  addContent(data = {}) {
    const nextId = (data && data.id) || getNextId('C', this._data.content, 4);
    const c = {
      id: nextId, coverUrl: '', title: '', contentType: '', productId: '', contentAngle: '',
      contentPillar: '', channel: '',
      hook: '', script: '', ctaType: '',
      plannedDate: '', status: '💡 Idea', publishedDate: '',
      publishedUrl: '', performanceNotes: '', ...data,
    };
    c.updatedAt = new Date().toISOString();
    this._data.content.push(c);
    this._changed('content');
    return c;
  }
  updateContent(id, field, value) {
    const cleanId = String(id).trim();
    const cleanValue = String(value).trim();

    if (field === 'id') {
      if (!cleanValue) return { error: true, message: 'รหัส ID ห้ามเป็นค่าว่างค่ะ' };
      if (cleanId.toLowerCase() === cleanValue.toLowerCase()) return { success: true };

      const existingWithValue = this._data.content.find(c => 
        String(c.id).trim().toLowerCase() === cleanValue.toLowerCase()
      );
      const existingWithId = this._data.content.find(c => 
        String(c.id).trim().toLowerCase() === cleanId.toLowerCase()
      );

      if (!existingWithId && existingWithValue) {
        return { success: true };
      }

      if (existingWithValue && existingWithId && existingWithValue !== existingWithId) {
        return { error: true, message: `รหัสคอนเทนต์ "${cleanValue}" มีอยู่ในระบบแล้วค่ะ! ไม่สามารถใช้ ID ซ้ำได้` };
      }

      const c = existingWithId || existingWithValue;
      if (c) {
        this._trackDelete(cleanId, 'content');
        c.id = cleanValue;
        c.updatedAt = new Date().toISOString();
        this._changed('content');
        return { success: true };
      }
      return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
    }

    const c = this.getContentItem(cleanId) || this.getContentItem(cleanValue);
    if (c) { c[field] = value; c.updatedAt = new Date().toISOString(); this._changed('content'); return { success: true }; }
    return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  }
  deleteContent(id) {
    this._trackDelete(id, 'content');
    const targetIdStr = String(id).trim().toLowerCase();
    this._data.content = this._data.content.filter(c => String(c.id).trim().toLowerCase() !== targetIdStr);
    this._changed('content');
  }

  /* ── Channel Tracker ── */
  getChannelTracker() { return this._data.channelTracker; }
  addChannelEntry(data = {}) {
    const nextId = (data && data.id) || getNextId('CH', this._data.channelTracker, 4);
    const e = {
      id: nextId, contentId: '', channel: '', publishedDate: '',
      views: '', likes: '', comments: '', shares: '', saves: '',
      avgWatchTime: '', productClicks: '', orders: '', revenue: '',
      notes: '', ...data,
    };
    e.updatedAt = new Date().toISOString();
    this._data.channelTracker.push(e);
    this._changed('channelTracker');
    return e;
  }
  updateChannelEntry(id, field, value) {
    const cleanId = String(id).trim();
    const cleanValue = String(value).trim();

    if (field === 'id') {
      if (!cleanValue) return { error: true, message: 'รหัส ID ห้ามเป็นค่าว่างค่ะ' };
      if (cleanId.toLowerCase() === cleanValue.toLowerCase()) return { success: true };

      const existingWithValue = this._data.channelTracker.find(x => 
        String(x.id).trim().toLowerCase() === cleanValue.toLowerCase()
      );
      const existingWithId = this._data.channelTracker.find(x => 
        String(x.id).trim().toLowerCase() === cleanId.toLowerCase()
      );

      if (!existingWithId && existingWithValue) {
        return { success: true };
      }

      if (existingWithValue && existingWithId && existingWithValue !== existingWithId) {
        return { error: true, message: `รหัสบันทึก "${cleanValue}" มีอยู่ในระบบแล้วค่ะ! ไม่สามารถใช้ ID ซ้ำได้` };
      }

      const e = existingWithId || existingWithValue;
      if (e) {
        this._trackDelete(cleanId, 'channel');
        e.id = cleanValue;
        e.updatedAt = new Date().toISOString();
        this._changed('channelTracker');
        return { success: true };
      }
      return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
    }

    const e = this._data.channelTracker.find(x => String(x.id).trim().toLowerCase() === cleanId.toLowerCase()) ||
              this._data.channelTracker.find(x => String(x.id).trim().toLowerCase() === cleanValue.toLowerCase());
    if (e) { e[field] = value; e.updatedAt = new Date().toISOString(); this._changed('channelTracker'); return { success: true }; }
    return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  }
  deleteChannelEntry(id) {
    this._trackDelete(id, 'channel');
    const targetIdStr = String(id).trim().toLowerCase();
    this._data.channelTracker = this._data.channelTracker.filter(x => String(x.id).trim().toLowerCase() !== targetIdStr);
    this._changed('channelTracker');
  }

  /* ── Sponsors ── */
  getSponsors() { return this._data.sponsors; }
  addSponsor(data = {}) {
    const nextId = (data && data.id) || getNextId('D', this._data.sponsors, 4);
    const s = {
      id: nextId, brandClient: '', contactPerson: '', contactInfo: '',
      dealType: '', agreedFee: '', deliverables: '', deadline: '',
      contentIds: '', draftSent: false, approved: false, published: false,
      paymentStatus: 'Pending', paymentDate: '', notes: '', ...data,
    };
    s.updatedAt = new Date().toISOString();
    this._data.sponsors.push(s);
    this._changed('sponsors');
    return s;
  }
  updateSponsor(id, field, value) {
    const cleanId = String(id).trim();
    const cleanValue = String(value).trim();

    if (field === 'id') {
      if (!cleanValue) return { error: true, message: 'รหัส ID ห้ามเป็นค่าว่างค่ะ' };
      if (cleanId.toLowerCase() === cleanValue.toLowerCase()) return { success: true };

      const existingWithValue = this._data.sponsors.find(s => 
        String(s.id).trim().toLowerCase() === cleanValue.toLowerCase()
      );
      const existingWithId = this._data.sponsors.find(s => 
        String(s.id).trim().toLowerCase() === cleanId.toLowerCase()
      );

      if (!existingWithId && existingWithValue) {
        return { success: true };
      }

      if (existingWithValue && existingWithId && existingWithValue !== existingWithId) {
        return { error: true, message: `รหัสดีล "${cleanValue}" มีอยู่ในระบบแล้วค่ะ! ไม่สามารถใช้ ID ซ้ำได้` };
      }

      const s = existingWithId || existingWithValue;
      if (s) {
        this._trackDelete(cleanId, 'sponsor');
        s.id = cleanValue;
        s.updatedAt = new Date().toISOString();
        this._changed('sponsors');
        return { success: true };
      }
      return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
    }

    const s = this._data.sponsors.find(x => String(x.id).trim().toLowerCase() === cleanId.toLowerCase()) ||
              this._data.sponsors.find(x => String(x.id).trim().toLowerCase() === cleanValue.toLowerCase());
    if (s) { s[field] = value; s.updatedAt = new Date().toISOString(); this._changed('sponsors'); return { success: true }; }
    return { error: true, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  }
  deleteSponsor(id) {
    this._trackDelete(id, 'sponsor');
    const targetIdStr = String(id).trim().toLowerCase();
    this._data.sponsors = this._data.sponsors.filter(x => String(x.id).trim().toLowerCase() !== targetIdStr);
    this._changed('sponsors');
  }

  /* ── Brand Identity ── */
  getBrand() { return this._data.brand; }
  updateBrand(field, value) {
    this._data.brand[field] = value;
    this._changed('brand');
  }
  updateBrandNested(path, value) {
    const keys = path.split('.');
    let obj = this._data.brand;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    this._changed('brand');
  }
  getContentForMonth(year, month, statusFilter = 'ALL') {
    return this._data.content.filter(c => {
      const targetDateStr = c.publishedPlan;
      if (!targetDateStr) return false;
      const d = new Date(targetDateStr);
      if (isNaN(d.getTime())) return false;

      const matchesMonth = d.getFullYear() === year && d.getMonth() === month;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesMonth && matchesStatus;
    }).map(c => {
      return {
        ...c,
        activeDate: c.publishedPlan,
        productName: this.getProductName(c.productId)
      };
    });
  }

  /* ── Computed Stats ── */
  getStats() {
    const c = this._data.content || [];
    const publishedCount = c.filter(x => x.status && (x.status.includes('Published') || x.status === '📤 Published')).length;
    const inProgressCount = c.filter(x => !x.status || !x.status.includes('Published')).length;
    return {
      totalProducts: this._data.products?.length || 0,
      totalContent: c.length,
      published: publishedCount,
      publishedContent: publishedCount,
      inProgress: inProgressCount,
      inProgressContent: inProgressCount,
      sponsorDeals: this._data.sponsors?.length || 0,
    };
  }

  getContentMix() {
    const c = this._data.content || [];
    const total = c.length;
    const mix = {};
    const types = ['🛒 Affiliate', '🎯 Personal Brand', '📚 Knowledge', '🤝 Sponsor'];
    types.forEach(t => {
      const label = t.split(' ')[1] || t;
      const count = c.filter(x => x.contentType === t || (x.contentType && x.contentType.includes(label))).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      mix[t] = { count, percentage };
    });
    return mix;
  }

  getChannelDistribution() {
    const dist = {};
    this._data.content.forEach(c => {
      if (c.channel) dist[c.channel] = (dist[c.channel] || 0) + 1;
    });
    return dist;
  }

  getContentForMonth(year, month, statusFilter = 'ALL', dateTypeFilter = { showPlanned: true, showPublished: true }) {
    const result = [];
    this._data.content.forEach(c => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      if (!matchesStatus) return;

      // 🟠 1. Planned Date Entry
      if (dateTypeFilter.showPlanned && c.plannedDate) {
        const d = new Date(c.plannedDate);
        if (d.getFullYear() === year && d.getMonth() === month) {
          result.push({
            ...c,
            displayId: `${c.id}-plan`,
            activeDate: c.plannedDate,
            dateType: 'planned',
            productName: this.getProductName(c.productId)
          });
        }
      }

      // 🟢 2. Published Date Entry
      if (dateTypeFilter.showPublished && c.publishedDate) {
        const d = new Date(c.publishedDate);
        if (d.getFullYear() === year && d.getMonth() === month) {
          result.push({
            ...c,
            displayId: `${c.id}-pub`,
            activeDate: c.publishedDate,
            dateType: 'published',
            productName: this.getProductName(c.productId)
          });
        }
      }
    });
    return result;
  }

  getProductName(productId) {
    if (!productId) return '';
    const p = this.getProduct(productId);
    return p ? p.name : '⚠️ ไม่พบ';
  }

  /* ── Export / Import ── */
  exportAll() {
    const json = JSON.stringify(this._data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-planner-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          this.importData(parsedData);
          resolve();
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  }

  importData(parsedData) {
    if (!parsedData) return;

    const currentProductsMap = new Map();
    (this._data.products || []).forEach(p => {
      if (p && p.id) currentProductsMap.set(String(p.id), p);
    });

    const currentContentMap = new Map();
    (this._data.content || []).forEach(c => {
      if (c && c.id) currentContentMap.set(String(c.id), c);
    });

    const products = (parsedData.products || []).map(p => {
      let img = p.imageUrl || '';
      if (!img) {
        const local = currentProductsMap.get(String(p.id));
        if (local && local.imageUrl) img = local.imageUrl;
      }
      if (!img && DEFAULT_PRODUCT_IMAGES[p.id]) {
        img = DEFAULT_PRODUCT_IMAGES[p.id];
      }
      return { ...p, imageUrl: img };
    });

    const content = (parsedData.content || []).map(c => {
      let cover = c.coverUrl || '';
      if (!cover) {
        const local = currentContentMap.get(String(c.id));
        if (local && local.coverUrl) cover = local.coverUrl;
      }
      if (!cover && DEFAULT_CONTENT_COVERS[c.id]) {
        cover = DEFAULT_CONTENT_COVERS[c.id];
      }
      return { ...c, coverUrl: cover };
    });

    this._data = {
      settings: { ...DEFAULT_SETTINGS, ...parsedData.settings, googleClientId: DEFAULT_GOOGLE_CLIENT_ID },
      products: products,
      content: content,
      channelTracker: parsedData.channelTracker || [],
      sponsors: parsedData.sponsors || [],
      deletedItems: parsedData.deletedItems || [],
      brand: { ...DEFAULT_BRAND, ...parsedData.brand },
    };

    this.forceSave();
    this.emit('change', 'all');
  }

  mergeData(remoteData) {
    if (!remoteData) return false;

    // 1. Merge Tombstone deletedItems from both local and remote
    const localDeleted = this._data.deletedItems || [];
    const remoteDeleted = remoteData.deletedItems || [];
    const deletedMap = new Map();

    [...localDeleted, ...remoteDeleted].forEach(item => {
      if (item && item.id) {
        const existing = deletedMap.get(String(item.id));
        if (!existing || new Date(item.deletedAt) > new Date(existing.deletedAt)) {
          deletedMap.set(String(item.id), item);
        }
      }
    });

    const mergedDeleted = Array.from(deletedMap.values());
    this._data.deletedItems = mergedDeleted;

    // 2. Helper merge array by ID while respecting Tombstones & Image Preservation
    const mergeArrayWithTombstones = (localArr = [], remoteArr = [], idKey = 'id') => {
      // Keep all local items during sync without discarding sample items
      const cleanLocalArr = localArr;

      const map = new Map();
      remoteArr.forEach(item => {
        if (item && item[idKey]) map.set(String(item[idKey]), { ...item });
      });
      cleanLocalArr.forEach(item => {
        if (item && item[idKey]) map.set(String(item[idKey]), { ...item });
      });

      // Filter out any items marked as deleted in Tombstones & Preserve Images
      return Array.from(map.values()).filter(item => {
        const itemId = String(item[idKey]);
        return !deletedMap.has(itemId);
      }).map(item => {
        if (idKey === 'id' && item.id) {
          if (item.imageUrl !== undefined) {
            let img = item.imageUrl || '';
            const local = cleanLocalArr.find(x => String(x.id) === String(item.id));
            const remote = remoteArr.find(x => String(x.id) === String(item.id));
            if (!img && local && local.imageUrl) img = local.imageUrl;
            if (!img && remote && remote.imageUrl) img = remote.imageUrl;
            if (!img && DEFAULT_PRODUCT_IMAGES[item.id]) img = DEFAULT_PRODUCT_IMAGES[item.id];
            return { ...item, imageUrl: img };
          }
          if (item.coverUrl !== undefined) {
            let cover = item.coverUrl || '';
            const local = cleanLocalArr.find(x => String(x.id) === String(item.id));
            const remote = remoteArr.find(x => String(x.id) === String(item.id));
            if (!cover && local && local.coverUrl) cover = local.coverUrl;
            if (!cover && remote && remote.coverUrl) cover = remote.coverUrl;
            if (!cover && DEFAULT_CONTENT_COVERS[item.id]) cover = DEFAULT_CONTENT_COVERS[item.id];
            return { ...item, coverUrl: cover };
          }
        }
        return item;
      });
    };

    this._data.products = mergeArrayWithTombstones(this._data.products, remoteData.products || []);
    this._data.content = mergeArrayWithTombstones(this._data.content, remoteData.content || []);
    this._data.channelTracker = mergeArrayWithTombstones(this._data.channelTracker, remoteData.channelTracker || []);
    this._data.sponsors = mergeArrayWithTombstones(this._data.sponsors, remoteData.sponsors || []);

    if (remoteData.settings) {
      this._data.settings = { ...remoteData.settings, ...this._data.settings };
    }
    if (remoteData.brand) {
      this._data.brand = { ...remoteData.brand, ...this._data.brand };
    }

    this.forceSave();
    this.emit('change', 'all');
    return true;
  }

  clearAll() {
    this._data = this._defaults();
    this._persist();
    this.emit('change', 'all');
  }

  /* ── Sample Data ── */
  loadSampleData() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const md = (d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    this._data.products = [
      {
        id: 'P001',
        isSample: true,
        name: 'Keychron K2 Pro Wireless Mechanical Keyboard',
        category: 'Desk Productivity',
        brand: 'Keychron',
        priceRange: '฿2,000-5,000',
        platform: 'TikTok',
        commission: '12',
        affiliateLink: 'https://shope.ee/sample_keychron',
        sellingPoints: 'คีย์บอร์ดไร้สายพิมพ์ฟิน, รองรับ QMK/VIA ปรับแต่งปุ่มได้, เชื่อมต่อได้ 3 อุปกรณ์พร้อมกัน, สวิตช์ Hot-swappable',
        painPoints: 'พิมพ์งานนานแล้วเมื่อยมือ, สายคีย์บอร์ดเกะกะโต๊ะทำงาน',
        targetAudience: 'สาย Coding, คนทำงาน Office, Creator จัดโต๊ะทำงาน',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
        status: 'Active',
        notes: 'สินค้าขายดีประจำเดือน สั่งซื้อผ่าน TikTok Shop ได้คอมมิชชัน 12%'
      },
      {
        id: 'P002',
        isSample: true,
        name: 'Xiaomi Robot Vacuum X20+ หุ่นยนต์ดูดฝุ่น',
        category: 'Home Smart',
        brand: 'Xiaomi',
        priceRange: '฿5,000+',
        platform: 'Shopee Video',
        commission: '10',
        affiliateLink: 'https://shope.ee/sample_xiaomi_vacuum',
        sellingPoints: 'ดูดฝุ่น+ถูพื้นอัตโนมัติ, แท่นเก็บฝุ่นและซักผ้าถูในตัว, แรงดูด 6,000 Pa, ระบบนำทางเลเซอร์ LDS',
        painPoints: 'กวาดถูบ้านเองเสียเวลาวันละชั่วโมง, ขี้เกียจซักผ้าถูพื้น',
        targetAudience: 'คนทำงานบ้านเวลาน้อย, พ่อบ้านแม่บ้านยุคใหม่, คนเลี้ยงสัตว์ในบ้าน',
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80',
        status: 'Active',
        notes: 'ดีลสปอนเซอร์ Barter + Affiliate ค่านายหน้าพิเศษ'
      },
      {
        id: 'P003',
        isSample: true,
        name: 'Anker Prime 20,000mAh Power Bank (200W)',
        category: 'Everyday Electronics',
        brand: 'Anker',
        priceRange: '฿2,000-5,000',
        platform: 'TikTok',
        commission: '8',
        affiliateLink: 'https://shope.ee/sample_anker_prime',
        sellingPoints: 'ชาร์จเร็วสูงสุด 200W, ชาร์จ MacBook Pro ได้พร้อมกัน 2 เครื่อง, มีหน้าจอ Smart Display บอกวัตต์สด',
        painPoints: 'แบตโน้ตบุ๊กหมดกลางทางหาปลั๊กไม่ได้, พกพาวเวอร์แบงก์ชาร์จช้า',
        targetAudience: 'Digital Nomad, คนทำงานนอกสถานที่, ช่างภาพและ Creator ถ่ายงานนอกสถานที่',
        imageUrl: 'https://images.unsplash.com/photo-1609592424074-1d374465d3d4?w=500&auto=format&fit=crop&q=80',
        status: 'Active',
        notes: 'ไอเทมจำเป็นสำหรับ Creator สายลุย'
      },
      {
        id: 'P004',
        isSample: true,
        name: 'Tesla Model Y All-Weather 3D Floor Mats',
        category: 'EV Solar',
        brand: '3D Spider',
        priceRange: '฿2,000-5,000',
        platform: 'YouTube Shorts',
        commission: '15',
        affiliateLink: 'https://shope.ee/sample_tesla_mats',
        sellingPoints: 'พรมปูรถยนต์ไร้กลิ่น เข้ารูป 100%, กันน้ำ กันคราบโคลน ล้างน้ำทำความสะอาดง่ายมาก',
        painPoints: 'พรมเดิมเปื้อนง่าย ทำความสะอาดยาก มีกลิ่นอับเวลาฝนตก',
        targetAudience: 'เจ้าของรถยนต์ไฟฟ้า Tesla Model Y / Model 3',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=80',
        status: 'Active',
        notes: 'ตลาดเจ้าของรถ EV กำลังเติบโตสูง คอมมิชชัน 15%'
      },
      {
        id: 'P005',
        isSample: true,
        name: 'Bewell Ergonomic Standing Desk Dual Motor',
        category: 'Desk Productivity',
        brand: 'Bewell',
        priceRange: '฿5,000+',
        platform: 'TikTok',
        commission: '10',
        affiliateLink: 'https://shope.ee/sample_bewell_desk',
        sellingPoints: 'โต๊ะปรับระดับความสูงไฟฟ้า มอเตอร์คู่ ลื่นเงียบ, บันทึกระดับความสูงได้ 4 ระดับ, ท็อปไม้กันน้ำ',
        painPoints: 'นั่งทำงานนานๆ แล้วปวดหลัง ออฟฟิศซินโดรม',
        targetAudience: 'สายออฟฟิศซินโดรม, พนักงาน WFH, คนจัดโต๊ะทำงานมินิมอล',
        imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80',
        status: 'To Review',
        notes: 'รอสินค้าตัวอย่างส่งมาถึงเพื่อทำรีวิวฉบับเต็ม'
      },
      {
        id: 'P006',
        isSample: true,
        name: 'Sony WH-1000XM5 Wireless Headphones',
        category: 'Creator Gear',
        brand: 'Sony',
        priceRange: '฿5,000+',
        platform: 'YouTube Long',
        commission: '7',
        affiliateLink: 'https://shope.ee/sample_sony_xm5',
        sellingPoints: 'ระบบตัดเสียงรบกวนที่ดีที่สุดในโลก ANC, น้ำหนักเบาสวมสบายตลอดวัน, เสียงไมค์สนทนาคมชัดระดับ HD',
        painPoints: 'เสียงรบกวนรอบข้างตัดสมาธิเวลาทำงานหรือตัดต่อคลิป',
        targetAudience: 'คนชอบฟังเพลง, Editor ตัดต่อคลิป, คนเดินทางบนเครื่องบินบ่อย',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
        status: 'Active',
        notes: 'หูฟังยอดนิยม รีวิวแล้วยอดวิวสูงตลอด'
      }
    ];

    this._data.content = [
      {
        id: 'C001',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
        title: 'ป้ายยา คีย์บอร์ดไร้สายพิมพ์ฟิน สาย Coding ห้ามพลาด!',
        contentType: '🛒 Affiliate',
        productId: 'P001',
        contentAngle: 'Selling Point',
        contentPillar: 'Desk Productivity',
        channel: 'TikTok',
        hook: 'พิมพ์งานแล้วปวดมือ? ลองเปลี่ยนมาใช้คีย์บอร์ดตัวนี้ ชีวิตดีขึ้น 10 เท่า!',
        script: 'Hook: พิมพ์งานแล้วปวดมือ ลองเปลี่ยนมาใช้คีย์บอร์ดตัวนี้ดูครับ!\nBody: รีวิว Keychron K2 Pro เสียงพิมพ์ฟินมาก สวิตช์นุ่ม ปรับแต่งปุ่มได้เอง แถมต่อ Mac/Windows ได้ 3 เครื่อง\nCTA: พิกัดกดปักตะกร้าซ้ายล่างได้เลยครับ!',
        ctaType: 'ปักตะกร้า',
        plannedDate: md(3),
        status: '📤 Published',
        publishedDate: md(3),
        publishedUrl: 'https://tiktok.com/@sample/video/1',
        performanceNotes: 'Views 45K | Orders 32 ชิ้น | Revenue ฿85,000'
      },
      {
        id: 'C002',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80',
        title: 'รีวิวหุ่นยนต์ดูดฝุ่น Xiaomi X20+ ซักผ้าถูเอง คุ้มไหม?',
        contentType: '🤝 Sponsor',
        productId: 'P002',
        contentAngle: 'Review',
        contentPillar: 'Home Smart',
        channel: 'YouTube Long',
        hook: 'ขี้เกียจกวาดถูบ้าน? ให้หุ่นยนต์ตัวนี้ทำงานแทน 100%',
        script: 'Hook: ขี้เกียจกวาดถูบ้านใช่ไหม?\nIntro: วันนี้พามาดู Xiaomi Robot Vacuum X20+ ตัวจบปี 2026\nDemo: ทดสอบดูดคราบกาแฟ + เติมน้ำซักผ้าถูอัตโนมัติ\nVerdict: คุ้มค่าเงินที่สุดในงบหมื่นกลางๆ',
        ctaType: 'Link in Bio',
        plannedDate: md(6),
        status: '✅ Ready',
        publishedDate: '',
        publishedUrl: '',
        performanceNotes: 'รอปล่อยคลิปวันเสาร์เวลา 19:00 น.'
      },
      {
        id: 'C003',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1609592424074-1d374465d3d4?w=500&auto=format&fit=crop&q=80',
        title: 'แกะกล่อง พาวเวอร์แบงก์ชาร์จโน้ตบุ๊กแรงที่สุด 200W',
        contentType: '🛒 Affiliate',
        productId: 'P003',
        contentAngle: 'Unboxing',
        contentPillar: 'Everyday Electronics',
        channel: 'TikTok',
        hook: 'พาวเวอร์แบงก์อะไร ชาร์จ MacBook Pro พร้อมกันได้ 2 เครื่อง?!',
        script: 'Hook: ชาร์จ MacBook Pro ได้พร้อมกัน 2 เครื่อง!\nDemo: เสียบชาร์จจริงให้ดูหน้าจอ Display แสดงไฟ 200W สดๆ\nCTA: ใครทำงานนอกบ้านบ่อยๆ ปักตะกร้าไว้เลย',
        ctaType: 'ปักตะกร้า',
        plannedDate: md(9),
        status: '🎬 Filming',
        publishedDate: '',
        publishedUrl: '',
        performanceNotes: 'เตรียมถ่ายช็อต B-Roll นอกสถานที่'
      },
      {
        id: 'C004',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=80',
        title: '3 อุปกรณ์แต่งรถ EV Tesla ที่ต้องมีตั้งแต่วันแรก!',
        contentType: '🛒 Affiliate',
        productId: 'P004',
        contentAngle: 'Tutorial',
        contentPillar: 'EV Solar',
        channel: 'YouTube Shorts',
        hook: 'เพิ่งรับรถ Tesla มา? อย่าเพิ่งขับออกจากศูนย์ถ้ายังไม่มี 3 สิ่งนี้!',
        script: 'Hook: 3 อุปกรณ์แต่ง Tesla ที่ต้องมีตั้งแต่วันแรก!\nItem 1: พรม 3D กันน้ำ เข้ารูปเป๊ะ\nItem 2: ฟิล์มกันรอยหน้าจอสัมผัส\nItem 3: ม่านบังแดดหลังคาแก้ว\nCTA: พิกัดอยู่ในลิงก์หน้าโปรไฟล์ครับ',
        ctaType: 'Link in Bio',
        plannedDate: md(12),
        status: '✍️ Scripting',
        publishedDate: '',
        publishedUrl: '',
        performanceNotes: 'เตรียมสคริปต์สั้น 45 วินาที'
      },
      {
        id: 'C005',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80',
        title: 'นั่งทำงานจนปวดหลัง? ลองปรับมายืนทำงานด้วยโต๊ะไฟฟ้า',
        contentType: '📚 Knowledge',
        productId: 'P005',
        contentAngle: 'Pain Point',
        contentPillar: 'Desk Productivity',
        channel: 'Facebook Reels',
        hook: 'นั่งทำงานเกิน 8 ชั่วโมงต่อวัน ระวังออฟฟิศซินโดรมถามหา!',
        script: 'Hook: นั่งทำงานนานๆ ปวดหลังกันไหมครับ?\nBody: อธิบายข้อดีของการสลับยืนทำงานวันละ 30 นาที ช่วยเลือดหมุนเวียนดีขึ้น\nCTA: กดเซฟคลิปนี้ไว้ลองทำตามกันดูครับ',
        ctaType: 'Save',
        plannedDate: md(15),
        status: '💡 Idea',
        publishedDate: '',
        publishedUrl: '',
        performanceNotes: ''
      },
      {
        id: 'C006',
        isSample: true,
        coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
        title: 'เปรียบเทียบหูฟังตัดเสียง Sony XM5 คุ้มไหมที่จะอัปเกรด?',
        contentType: '🎨 Personal Brand',
        productId: 'P006',
        contentAngle: 'Comparison',
        contentPillar: 'Creator Gear',
        channel: 'Instagram Reels',
        hook: 'หูฟังหลักหมื่น ตัดเสียงรบกวนเงียบกริบจริงหรือแค่โฆษณา?',
        script: 'Hook: ตัดเสียงรบกวนเงียบกริบจริงไหม?\nDemo: ทดสอบตัดเสียงบนรถไฟฟ้า BTS + เสียงร้านกาแฟ\nVerdict: เหมาะมากกับคนที่ต้องการสมาธิทำงาน',
        ctaType: 'Follow',
        plannedDate: md(18),
        status: '💡 Idea',
        publishedDate: '',
        publishedUrl: '',
        performanceNotes: ''
      }
    ];

    this._data.channelTracker = [
      { id: 'CH001', isSample: true, contentId: 'C001', channel: 'TikTok', publishedDate: md(3), views: '45000', likes: '3200', comments: '180', shares: '450', saves: '1200', avgWatchTime: '24', productClicks: '2800', orders: '32', revenue: '85000', notes: 'คลิปไวรัล ยอดขายปังมาก' },
      { id: 'CH002', isSample: true, contentId: 'C001', channel: 'Shopee Video', publishedDate: md(4), views: '18000', likes: '1100', comments: '45', shares: '80', saves: '310', avgWatchTime: '20', productClicks: '950', orders: '14', revenue: '37000', notes: 'รีโพสต์จาก TikTok' },
      { id: 'CH003', isSample: true, contentId: 'C003', channel: 'YouTube Shorts', publishedDate: md(9), views: '22000', likes: '1500', comments: '62', shares: '110', saves: '420', avgWatchTime: '35', productClicks: '800', orders: '8', revenue: '28000', notes: 'คนสนใจเรื่องการชาร์จไฟ 200W มาก' },
    ];

    this._data.sponsors = [
      { id: 'D001', isSample: true, brandClient: 'Xiaomi Thailand', contactPerson: 'คุณเจมส์ (Marketing)', contactInfo: 'james@xiaomi.sample', dealType: 'Barter', agreedFee: '15000', deliverables: 'YouTube Long 1 คลิป + TikTok 1 คลิป', deadline: md(10), contentIds: 'C002', draftSent: true, approved: true, published: false, paymentStatus: 'Pending', paymentDate: '', notes: 'ส่งสินค้าดูดฝุ่น X20+ มาให้รีวิว' },
      { id: 'D002', isSample: true, brandClient: 'Keychron TH', contactPerson: 'คุณเมย์', contactInfo: 'may@keychron.sample', dealType: 'Affiliate Boost', agreedFee: '5000', deliverables: 'TikTok 1 คลิป', deadline: md(5), contentIds: 'C001', draftSent: true, approved: true, published: true, paymentStatus: 'Paid', paymentDate: md(4), notes: 'เพิ่มคอมมิชชันเป็น 12% ตลอดเดือนนี้' },
    ];

    this._data.brand = {
      ...DEFAULT_BRAND,
      creatorName: 'AveryTech & Lifestyle',
      handles: '@averytech.th',
      tagline: 'ลองของเทค อุปกรณ์จัดโต๊ะ และไอเทม EV ให้ดูก่อนคุณจ่ายเงิน',
      tone: 'Helpful, Honest, Practical, Premium, Friendly',
      style: 'สั้น กระชับ โชว์การใช้งานจริงก่อนอธิบาย ให้ Verdict ชัดเจนไม่กั๊ก',
      dos: 'โชว์สินค้าใช้งานจริง, บอกทั้งข้อดีและข้อเสียตรงๆ, ทำ B-Roll สวยงามคมชัด',
      donts: 'อวยสินค้าเกินจริง, พูดภาษาวิชาการยากเกินไป, Hard Sell จนน่ารำคาญ',
      audiences: [
        'คนทำงาน Office / สาย WFH ที่ชอบจัดโต๊ะทำงาน',
        'Creator และคนตัดต่อคลิปที่มองหาอุปกรณ์คุณภาพสูง',
        'เจ้าของรถยนต์ไฟฟ้า EV และผู้สนใจ Smart Home',
        'นักช้อปสาย TikTok Shop & Shopee ที่ชอบดูคลิปรีวิวก่อนซื้อ'
      ],
      channelLinks: [
        { platform: 'TikTok', handle: '@averytech.th', url: 'https://tiktok.com', followers: '125,000' },
        { platform: 'YouTube', handle: 'AveryTech Channel', url: 'https://youtube.com', followers: '45,000' },
        { platform: 'Shopee', handle: 'AveryTech Collection', url: 'https://shopee.co.th', followers: '18,000' },
        { platform: 'Instagram', handle: '@averytech.official', url: 'https://instagram.com', followers: '28,000' },
      ],
    };

    this._persist();
    this.emit('change', 'all');
  }
}

// Export singleton
export const store = new Store();
