/* ──────────────────────────────────────────
   Data Store — localStorage backed
   ────────────────────────────────────────── */
import { debounce, uid, clone, Emitter } from './utils.js';

const STORAGE_KEY = 'ccp_data_v1';
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._defaults();
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings, googleClientId: DEFAULT_GOOGLE_CLIENT_ID },
        products: parsed.products || [],
        content: parsed.content || [],
        channelTracker: parsed.channelTracker || [],
        sponsors: parsed.sponsors || [],
        deletedItems: parsed.deletedItems || [],
        brand: { ...DEFAULT_BRAND, ...parsed.brand },
      };
    } catch (e) {
      console.warn('[Store] Corrupted data, using defaults', e);
      return this._defaults();
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

  /* ── Settings & Theme ── */
  getSettings() { return this._data.settings; }
  getTheme() { return this._data.settings.theme || 'light'; }
  setTheme(theme) {
    this._data.settings.theme = theme;
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
    const p = {
      id: uid('P'), name: '', category: '', brand: '', priceRange: '',
      platform: '', commission: '', affiliateLink: '',
      sellingPoints: '', productType: 'A สินค้าขายดี', targetAudience: '',
      imageUrl: '', status: 'To Review', notes: '', ...data,
    };
    this._data.products.push(p);
    this._changed('products');
    return p;
  }
  updateProduct(id, field, value) {
    const p = this.getProduct(id);
    if (p) { p[field] = value; this._changed('products'); }
  }
  deleteProduct(id) {
    this._trackDelete(id, 'product');
    this._data.products = this._data.products.filter(p => p.id !== id);
    this._changed('products');
  }

  /* ── Content ── */
  getContent() { return this._data.content; }
  getContentItem(id) { return this._data.content.find(c => c.id === id); }
  addContent(data = {}) {
    const c = {
      id: uid('C'), coverUrl: '', title: '', contentType: '', productId: '', contentAngle: '',
      contentPillar: '', channel: '',
      hook: '', script: '', ctaType: '',
      plannedDate: '', status: '💡 Idea', publishedDate: '',
      publishedUrl: '', performanceNotes: '', ...data,
    };
    this._data.content.push(c);
    this._changed('content');
    return c;
  }
  updateContent(id, field, value) {
    const c = this.getContentItem(id);
    if (c) { c[field] = value; this._changed('content'); }
  }
  deleteContent(id) {
    this._trackDelete(id, 'content');
    this._data.content = this._data.content.filter(c => c.id !== id);
    this._changed('content');
  }

  /* ── Channel Tracker ── */
  getChannelTracker() { return this._data.channelTracker; }
  addChannelEntry(data = {}) {
    const e = {
      id: uid('CH'), contentId: '', channel: '', publishedDate: '',
      views: '', likes: '', comments: '', shares: '', saves: '',
      avgWatchTime: '', productClicks: '', orders: '', revenue: '',
      notes: '', ...data,
    };
    this._data.channelTracker.push(e);
    this._changed('channelTracker');
    return e;
  }
  updateChannelEntry(id, field, value) {
    const e = this._data.channelTracker.find(x => x.id === id);
    if (e) { e[field] = value; this._changed('channelTracker'); }
  }
  deleteChannelEntry(id) {
    this._trackDelete(id, 'channel');
    this._data.channelTracker = this._data.channelTracker.filter(x => x.id !== id);
    this._changed('channelTracker');
  }

  /* ── Sponsors ── */
  getSponsors() { return this._data.sponsors; }
  addSponsor(data = {}) {
    const s = {
      id: uid('D'), brandClient: '', contactPerson: '', contactInfo: '',
      dealType: '', agreedFee: '', deliverables: '', deadline: '',
      contentIds: '', draftSent: false, approved: false, published: false,
      paymentStatus: 'Pending', paymentDate: '', notes: '', ...data,
    };
    this._data.sponsors.push(s);
    this._changed('sponsors');
    return s;
  }
  updateSponsor(id, field, value) {
    const s = this._data.sponsors.find(x => x.id === id);
    if (s) { s[field] = value; this._changed('sponsors'); }
  }
  deleteSponsor(id) {
    this._trackDelete(id, 'sponsor');
    this._data.sponsors = this._data.sponsors.filter(x => x.id !== id);
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

  /* ── Computed Stats ── */
  getStats() {
    const c = this._data.content;
    return {
      totalProducts: this._data.products.length,
      totalContent: c.length,
      published: c.filter(x => x.status === '📤 Published').length,
      inProgress: c.filter(x => ['✍️ Scripting','🎬 Filming','✂️ Editing','✅ Ready'].includes(x.status)).length,
      sponsorDeals: this._data.sponsors.length,
    };
  }

  getContentMix() {
    const c = this._data.content;
    return {
      '🛒 Affiliate': c.filter(x => x.contentType === '🛒 Affiliate').length,
      '🎯 Personal Brand': c.filter(x => x.contentType === '🎯 Personal Brand').length,
      '📚 Knowledge': c.filter(x => x.contentType === '📚 Knowledge').length,
      '🤝 Sponsor': c.filter(x => x.contentType === '🤝 Sponsor').length,
    };
  }

  getChannelDistribution() {
    const dist = {};
    this._data.content.forEach(c => {
      if (c.channel) dist[c.channel] = (dist[c.channel] || 0) + 1;
    });
    return dist;
  }

  getContentForMonth(year, month, statusFilter = 'ALL') {
    return this._data.content.filter(c => {
      const targetDateStr = c.status === '📤 Published' ? (c.publishedDate || c.plannedDate) : c.plannedDate;
      if (!targetDateStr) return false;
      const d = new Date(targetDateStr);
      const matchesMonth = d.getFullYear() === year && d.getMonth() === month;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesMonth && matchesStatus;
    }).map(c => {
      const activeDate = c.status === '📤 Published' ? (c.publishedDate || c.plannedDate) : c.plannedDate;
      return {
        ...c,
        activeDate: activeDate,
        productName: this.getProductName(c.productId)
      };
    });
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
          const data = JSON.parse(e.target.result);
          this._data = {
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
            products: data.products || [],
            content: data.content || [],
            channelTracker: data.channelTracker || [],
            sponsors: data.sponsors || [],
            brand: { ...DEFAULT_BRAND, ...data.brand },
          };
          this._persist();
          this.emit('change', 'all');
          resolve();
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
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

    // 2. Helper merge array by ID while respecting Tombstones
    const mergeArrayWithTombstones = (localArr = [], remoteArr = [], idKey = 'id') => {
      const map = new Map();
      remoteArr.forEach(item => {
        if (item && item[idKey]) map.set(String(item[idKey]), { ...item });
      });
      localArr.forEach(item => {
        if (item && item[idKey]) map.set(String(item[idKey]), { ...item });
      });

      // Filter out any items marked as deleted in Tombstones!
      return Array.from(map.values()).filter(item => {
        const itemId = String(item[idKey]);
        return !deletedMap.has(itemId);
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
      { id:'P001',name:'USB-C Hub 7-in-1',category:'Desk Productivity',brand:'Ugreen',priceRange:'฿500-1,000',platform:'TikTok',commission:'10',affiliateLink:'',sellingPoints:'พอร์ตครบ 7 ช่อง, ตัวเล็ก, ชาร์จได้ 100W PD',painPoints:'พอร์ต MacBook ไม่พอ, ต่อจอไม่ได้',targetAudience:'คนใช้ MacBook / Laptop',imageUrl:'',status:'Active',notes:'' },
      { id:'P002',name:'GaN Charger 65W',category:'Everyday Electronics',brand:'Baseus',priceRange:'฿500-1,000',platform:'Shopee Video',commission:'8',affiliateLink:'',sellingPoints:'ชาร์จเร็ว 65W, ตัวเล็ก, ชาร์จ Laptop ได้',painPoints:'ที่ชาร์จเดิมใหญ่เกะกะ, ชาร์จช้า',targetAudience:'คนทำงานนอกบ้าน',imageUrl:'',status:'Active',notes:'' },
      { id:'P003',name:'Monitor Light Bar',category:'Desk Productivity',brand:'Xiaomi',priceRange:'฿1,000-2,000',platform:'TikTok',commission:'12',affiliateLink:'',sellingPoints:'ไม่สะท้อนจอ, ปรับแสง warm/cool',painPoints:'ปวดตาตอนทำงานดึก',targetAudience:'คนทำงานหน้าจอ',imageUrl:'',status:'Approved',notes:'' },
      { id:'P004',name:'Wireless Lavalier Mic',category:'Creator Gear',brand:'BOYA',priceRange:'฿1,000-2,000',platform:'TikTok',commission:'10',affiliateLink:'',sellingPoints:'ตัดเสียงรบกวนดี, พกง่าย',painPoints:'อัดเสียงจากกล้องไม่ชัด',targetAudience:'Creator มือใหม่',imageUrl:'',status:'Active',notes:'' },
      { id:'P005',name:'Portable Tire Inflator',category:'EV Solar',brand:'Xiaomi',priceRange:'฿500-1,000',platform:'Shopee Video',commission:'8',affiliateLink:'',sellingPoints:'พกใส่ EV ได้, ชาร์จ USB-C',painPoints:'ลมยางอ่อนกลางทาง',targetAudience:'คนใช้ EV / คนขับรถบ่อย',imageUrl:'',status:'Active',notes:'' },
    ];

    this._data.content = [
      { id:'C001',title:'MacBook พอร์ตเดียว ต่อจอไม่ได้ แก้ยังไง?',contentType:'🛒 Affiliate',productId:'P001',contentAngle:'Selling Point',contentPillar:'Desk Productivity',channel:'TikTok',hook:'MacBook พอร์ตเดียว ต่อจอไม่ได้ แก้ยังไง?',script:'Hook → Demo ต่อจอ+ชาร์จ → spec → CTA',ctaType:'ปักตะกร้า',plannedDate:md(5),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C002',title:'โต๊ะทำงานเต็มไปด้วยสาย แก้ด้วยตัวนี้',contentType:'🛒 Affiliate',productId:'P001',contentAngle:'Pain Point',contentPillar:'Desk Productivity',channel:'TikTok',hook:'โต๊ะทำงานเต็มไปด้วยสาย แก้ด้วยตัวนี้',script:'Hook → Before/After → Demo → CTA',ctaType:'ปักตะกร้า',plannedDate:md(7),status:'✍️ Scripting',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C003',title:'USB-C Hub 300 vs 900 ต่างกันจริงไหม?',contentType:'🛒 Affiliate',productId:'P001',contentAngle:'Comparison',contentPillar:'Desk Productivity',channel:'YouTube Shorts',hook:'USB-C Hub 300 vs 900 ต่างกันจริงไหม?',script:'Hook → เทียบ build → speed test → verdict',ctaType:'ปักตะกร้า',plannedDate:md(10),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C004',title:'ที่ชาร์จเล็กกว่านิ้วก้อย ชาร์จ Laptop ได้',contentType:'🛒 Affiliate',productId:'P002',contentAngle:'Selling Point',contentPillar:'Everyday Electronics',channel:'TikTok',hook:'ที่ชาร์จเล็กกว่านิ้วก้อย แต่ชาร์จ Laptop ได้',script:'Hook → เทียบขนาด → ชาร์จจริง → CTA',ctaType:'ปักตะกร้า',plannedDate:md(8),status:'🎬 Filming',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C005',title:'GaN Charger คืออะไร ทำไมต้องเปลี่ยน?',contentType:'📚 Knowledge',productId:'P002',contentAngle:'Tutorial',contentPillar:'Everyday Electronics',channel:'YouTube Long',hook:'GaN Charger คืออะไร ทำไมต้องเปลี่ยน?',script:'Hook → อธิบาย GaN → เทียบ Si → สรุป',ctaType:'Follow',plannedDate:md(12),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C006',title:'ปวดตาตอนทำงานดึก? ลองติดตัวนี้',contentType:'🛒 Affiliate',productId:'P003',contentAngle:'Selling Point',contentPillar:'Desk Productivity',channel:'Shopee Video',hook:'ปวดตาตอนทำงานดึก? ลองติดตัวนี้',script:'Hook → ติดตั้ง → on/off → CTA',ctaType:'ปักตะกร้า',plannedDate:md(9),status:'✅ Ready',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C007',title:'โต๊ะทำงาน creator ที่ใช้หาเงินทุกวัน',contentType:'🎯 Personal Brand',productId:'',contentAngle:'Setup Tour',contentPillar:'Desk Productivity',channel:'TikTok',hook:'โต๊ะทำงาน creator ที่ใช้หาเงินทุกวัน',script:'Tour ทั้งโต๊ะ → ของแต่ละชิ้น → ราคารวม',ctaType:'Follow',plannedDate:md(6),status:'📤 Published',publishedDate:md(6),publishedUrl:'',performanceNotes:'views 25K, saves 500' },
      { id:'C008',title:'ไมค์ 1,500 ที่ทำให้เสียงดีขึ้น 10 เท่า',contentType:'🛒 Affiliate',productId:'P004',contentAngle:'Selling Point',contentPillar:'Creator Gear',channel:'TikTok',hook:'ไมค์ 1,500 ที่ทำให้เสียงดีขึ้น 10 เท่า',script:'Hook → before/after → demo → CTA',ctaType:'ปักตะกร้า',plannedDate:md(14),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C009',title:'ถ่ายคลิปเสียงไม่ชัด? 3 ไมค์ที่ช่วยได้',contentType:'📚 Knowledge',productId:'P004',contentAngle:'Tutorial',contentPillar:'Creator Gear',channel:'YouTube Shorts',hook:'ถ่ายคลิปเสียงไม่ชัด? 3 ไมค์ที่ช่วยได้',script:'Hook → 3 ตัวเลือก → เทียบเสียง → สรุป',ctaType:'Save',plannedDate:md(16),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C010',title:'ขับ EV อยู่ดีๆ ลมยางอ่อน ทำไงดี?',contentType:'🛒 Affiliate',productId:'P005',contentAngle:'Pain Point',contentPillar:'EV/Solar Lifestyle',channel:'TikTok',hook:'ขับ EV อยู่ดีๆ ลมยางอ่อน ทำไงดี?',script:'Hook → เล่าสถานการณ์ → demo ปั๊ม → CTA',ctaType:'ปักตะกร้า',plannedDate:md(11),status:'✍️ Scripting',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C011',title:'ใช้ Windows มา 25 ปี เปิด Mac วันแรก...',contentType:'🎯 Personal Brand',productId:'',contentAngle:'Storytelling',contentPillar:'Windows-to-Mac',channel:'TikTok',hook:'ใช้ Windows มา 25 ปี เปิด Mac วันแรก...',script:'Hook อารมณ์ → unbox → first impression',ctaType:'Follow',plannedDate:md(13),status:'🎬 Filming',publishedDate:'',publishedUrl:'',performanceNotes:'' },
      { id:'C012',title:'5 ของจัดโต๊ะ ไม่เกิน 1,000 ที่ใช้ทุกวัน',contentType:'📚 Knowledge',productId:'',contentAngle:'Tutorial',contentPillar:'Desk Productivity',channel:'YouTube Long',hook:'5 ของจัดโต๊ะ ไม่เกิน 1,000 ที่ใช้ทุกวัน',script:'Hook → 5 ชิ้น → total cost → สรุป',ctaType:'Save',plannedDate:md(18),status:'💡 Idea',publishedDate:'',publishedUrl:'',performanceNotes:'' },
    ];

    this._data.brand = {
      ...DEFAULT_BRAND,
      creatorName: 'AveryThings',
      handles: '@theaverythings',
      tagline: 'ลองของเทคที่ช่วยให้ชีวิตสะดวกขึ้น ให้ดูก่อนคุณซื้อ',
      tone: 'Helpful, Practical, Honest, Curious, Data-aware',
      style: 'สั้น ชัด แสดงให้ดูก่อนอธิบาย ให้ verdict ชัดเจน',
      dos: 'โชว์ของจริง, บอกข้อเสีย, เปรียบเทียบ use case, CTA แบบธรรมชาติ',
      donts: 'เคลมเว่อร์, hard sell, พูดเหมือนโฆษณา',
      audiences: ['คนทำงานหน้าคอม / creator / freelancer','คนชอบ gadget จาก TikTok Shop / Shopee','คนเริ่มสนใจ EV, Solar, Smart Home','คน Windows ที่ลังเลจะย้ายมา Mac'],
      channelLinks: [
        { platform:'TikTok', handle:'@theaverythings', url:'', followers:'' },
        { platform:'YouTube', handle:'', url:'', followers:'' },
        { platform:'Shopee', handle:'', url:'', followers:'' },
        { platform:'Instagram', handle:'', url:'', followers:'' },
      ],
    };

    this._persist();
    this.emit('change', 'all');
  }
}

// Export singleton
export const store = new Store();
