/* ──────────────────────────────────────────
   Internationalization (i18n) Module
   Language Dictionary: English & Thai (Pure Single Language per Mode)
   ────────────────────────────────────────── */

export const DICTIONARY = {
  en: {
    // Navigation Sidebar
    nav_dashboard: "Dashboard",
    nav_products: "Products",
    nav_content: "Content Planner",
    nav_calendar: "Calendar",
    nav_channels: "Channel Tracker",
    nav_sponsors: "Sponsors",
    nav_brand: "Brand Identity",
    nav_settings: "Settings",

    // Dashboard View
    dash_title: "Dashboard Summary",
    dash_filter_year: "Year:",
    dash_filter_category: "Category:",
    dash_filter_producttype: "Product Type:",
    dash_filter_month: "Select Months:",
    dash_all_years: "All Years",
    dash_all_categories: "All Categories",
    dash_all_types: "All Types",
    dash_all_months: "All Months",
    
    stat_active_products: "Total Active Products",
    stat_active_products_sub: "Active items in store",
    stat_total_content: "Total Content",
    stat_total_content_sub: "All planned content",
    stat_published: "Published",
    stat_published_sub: "Successfully published",
    stat_in_progress: "In Progress 🔍",
    stat_in_progress_sub: "Ongoing items (Click for details)",
    stat_sponsor_deals: "Sponsor Deals",
    stat_sponsor_deals_sub: "Active brand deals",
    stat_click_view: "Click View 🔍",

    mix_title: "Content Mix Breakdown",
    mix_total_content: "Total Content",
    mix_items: "items",
    mix_status: "Status:",
    mix_all_statuses: "All Statuses",

    cat_breakdown_title: "Product Categories & Status",
    cat_count: "Categories",
    cat_items_suffix: "Products",
    cat_empty: "No products in system yet 📦",

    channel_perf_title: "Content Performance by Channel",
    channel_col_channel: "Channel",
    channel_col_videos: "Videos",
    channel_col_views: "Views",
    channel_col_clicks: "Product Clicks",
    channel_col_orders: "Orders",
    channel_col_revenue: "Total Revenue",
    channel_col_engagement: "Engagement %",

    modal_inprogress_title: "In Progress Details",
    modal_inprogress_sub: "All ongoing content items (excluding published)",
    modal_inprogress_empty: "No items in this status",
    modal_no_inprogress: "No ongoing items 🎉",
    modal_ok_close: "Close Window",

    // Products View
    prod_title: "Products Management",
    prod_subtitle: "Manage your affiliate products database and set custom pricing",
    prod_add_btn: "+ Add Product",
    prod_empty: "No products yet",
    col_prod_id: "Product ID",
    col_prod_photo: "Photo",
    col_prod_name: "Product Name",
    col_prod_category: "Category",
    col_prod_brand: "Brand",
    col_prod_price: "Price (฿)",
    col_prod_platform: "Platform",
    col_prod_commission: "Commission %",
    col_prod_aff_link: "Affiliate Link",
    col_prod_selling_points: "Selling Points",
    col_prod_type: "Product Type",
    col_prod_audience: "Target Audience",
    col_prod_status: "Status",
    col_prod_notes: "Notes",

    // Content View
    cnt_title: "Content Planner",
    cnt_subtitle: "Plan affiliate content scripts, angles, hooks, and publication dates",
    cnt_add_btn: "+ Add Content",
    cnt_empty: "No content planned yet",
    col_cnt_id: "Content ID",
    col_cnt_cover: "Cover",
    col_cnt_title: "Title / Topic",
    col_cnt_type: "Content Type",
    col_cnt_prod_id: "Product ID",
    col_cnt_prod_name: "Product Name",
    col_cnt_angle: "Content Angle",
    col_cnt_pillar: "Content Pillar",
    col_cnt_channel: "Channel",
    col_cnt_hook: "Hook Line",
    col_cnt_script: "Script / Teleprompter",
    col_cnt_cta: "CTA Type",
    col_cnt_planned_date: "Planned Date",
    col_cnt_status: "Status",
    col_cnt_pub_date: "Published Date",
    col_cnt_pub_url: "Published URL",
    col_cnt_perf_notes: "Notes",

    // Calendar View
    cal_title: "Content Calendar",
    cal_subtitle: "Production & publishing schedule overview across the month",
    cal_quick_edit_title: "Quick Edit Content",
    cal_help_text: "Click any content card to quick edit details or open Teleprompter",

    // Channels View
    chan_title: "Channel Tracker",
    chan_subtitle: "Track views, likes, engagement rate, and conversion per channel",
    chan_add_btn: "+ Add Entry",
    chan_empty: "No channel tracker data yet",

    // Sponsors View
    spon_title: "Sponsor Deals",
    spon_subtitle: "Manage brand sponsorships, barter agreements, fees, and deliverables",
    spon_add_btn: "+ Add Deal",
    spon_empty: "No sponsor deals yet",

    // Brand View
    brand_title: "Brand Identity",
    brand_subtitle: "Define creator profile, content pillars, tone of voice, and brand colors",

    // Settings View
    set_title: "System Settings",
    set_subtitle: "Configure screen theme, UI language, dropdown options, and data backups",
    set_clear_data: "🗑️ Delete All Data",
    set_theme_title: "Theme Settings",
    set_theme_sub: "Switch screen theme between Light Mode and Dark Mode",
    set_lang_title: "Language Settings",
    set_lang_sub: "Switch UI display language between English and Thai",
    set_dark_mode: "DARK MODE",
    set_light_mode: "LIGHT MODE",
    set_lang_en: "English (US)",
    set_lang_th: "Thai (ภาษาไทย)",
    
    // Settings Lists Labels
    set_list_channels: "Channels",
    set_list_pillars: "Content Pillars",
    set_list_prod_cats: "Product Categories",
    set_list_cnt_types: "Content Types",
    set_list_cnt_angles: "Content Angles",
    set_list_cnt_statuses: "Content Statuses",
    set_list_prod_statuses: "Product Statuses",
    set_list_prod_types: "Product Types",
    set_list_cta_types: "CTA Types",
    set_list_deal_types: "Deal Types",
    set_list_pay_statuses: "Payment Statuses",
    set_add_item: "+ Add item",

    // Common UI Text
    common_search: "Search...",
    common_items: "items",
    common_teleprompter: "🎬 Teleprompter Mode",
    common_save: "Save Changes",
    common_close: "Close",
    common_cancel: "Cancel",
    common_delete: "Delete Record",
    common_delete_confirm: "Are you sure you want to delete this record?",
    common_edit: "Edit Details",
    common_actions: "Actions",
    common_tap_drilldown: "Tap to view/edit details",
  },

  th: {
    // Navigation Sidebar
    nav_dashboard: "แดชบอร์ดสรุปผล",
    nav_products: "จัดการสินค้า",
    nav_content: "แผนคอนเทนต์",
    nav_calendar: "ปฏิทินงาน",
    nav_channels: "สถิติตามช่องทาง",
    nav_sponsors: "ดีลสปอนเซอร์",
    nav_brand: "อัตลักษณ์แบรนด์",
    nav_settings: "ตั้งค่าระบบ",

    // Dashboard View
    dash_title: "ภาพรวมแดชบอร์ด",
    dash_filter_year: "ปี:",
    dash_filter_category: "หมวดสินค้า:",
    dash_filter_producttype: "ประเภทสินค้า:",
    dash_filter_month: "เลือกเดือน:",
    dash_all_years: "ทุกปี",
    dash_all_categories: "ทุกหมวดสินค้า",
    dash_all_types: "ทุกประเภทสินค้า",
    dash_all_months: "ทุกเดือน",
    
    stat_active_products: "สินค้าทั้งหมดในคลัง",
    stat_active_products_sub: "สินค้าที่เปิดใช้งานอยู่",
    stat_total_content: "คอนเทนต์ทั้งหมด",
    stat_total_content_sub: "แผนคอนเทนต์ทั้งหมด",
    stat_published: "เผยแพร่เรียบร้อย",
    stat_published_sub: "คอนเทนต์ที่ลงเรียบร้อยแล้ว",
    stat_in_progress: "กำลังดำเนินการ 🔍",
    stat_in_progress_sub: "งานที่กำลังผลิต (คลิกเพื่อดู)",
    stat_sponsor_deals: "ดีลสปอนเซอร์",
    stat_sponsor_deals_sub: "ดีลแบรนด์สปอนเซอร์ทั้งหมด",
    stat_click_view: "คลิกเพื่อดู 🔍",

    mix_title: "สัดส่วนประเภทคอนเทนต์",
    mix_total_content: "คอนเทนต์ทั้งหมด",
    mix_items: "รายการ",
    mix_status: "สถานะ:",
    mix_all_statuses: "ทุกสถานะ",

    cat_breakdown_title: "จำนวนสินค้าแยกตามหมวดหมู่และสถานะ",
    cat_count: "หมวดหมู่",
    cat_items_suffix: "สินค้า",
    cat_empty: "ยังไม่มีรายการสินค้าในระบบ 📦",

    channel_perf_title: "ประสิทธิภาพคอนเทนต์แยกตามช่องทาง",
    channel_col_channel: "ช่องทาง",
    channel_col_videos: "จำนวนคลิป",
    channel_col_views: "ยอดเข้าชม",
    channel_col_clicks: "คลิกลิงก์สินค้า",
    channel_col_orders: "จำนวนออเดอร์",
    channel_col_revenue: "รายได้รวม",
    channel_col_engagement: "อัตรา Engagement %",

    modal_inprogress_title: "รายละเอียดงานที่กำลังทำ",
    modal_inprogress_sub: "คอนเทนต์ที่อยู่ระหว่างดำเนินการทั้งหมด (ไม่รวมที่เผยแพร่แล้ว)",
    modal_inprogress_empty: "ไม่มีรายการในสถานะนี้",
    modal_no_inprogress: "ไม่มีงานที่อยู่ระหว่างดำเนินการ 🎉",
    modal_ok_close: "ปิดหน้าต่าง",

    // Products View
    prod_title: "จัดการคลังสินค้า",
    prod_subtitle: "จัดการคลังสินค้า Affiliate อัปโหลดรูปภาพสินค้า Thumbnail และกำหนดราคาได้อิสระ",
    prod_add_btn: "+ เพิ่มสินค้า",
    prod_empty: "ยังไม่มีสินค้าในคลัง",
    col_prod_id: "รหัสสินค้า",
    col_prod_photo: "รูปสินค้า",
    col_prod_name: "ชื่อสินค้า",
    col_prod_category: "หมวดหมู่สินค้า",
    col_prod_brand: "แบรนด์",
    col_prod_price: "ราคา (บาท)",
    col_prod_platform: "แพลตฟอร์ม",
    col_prod_commission: "ค่าคอมมิชชัน %",
    col_prod_aff_link: "ลิงก์ Affiliate",
    col_prod_selling_points: "จุดขายหลัก",
    col_prod_type: "ประเภทสินค้า",
    col_prod_audience: "กลุ่มเป้าหมาย",
    col_prod_status: "สถานะสินค้า",
    col_prod_notes: "บันทึกเพิ่มเติม",

    // Content View
    cnt_title: "ตารางแผนคอนเทนต์",
    cnt_subtitle: "วางแผนสคริปต์ มุมขาย Hook และกำหนดวันเผยแพร่คอนเทนต์",
    cnt_add_btn: "+ เพิ่มคอนเทนต์",
    cnt_empty: "ยังไม่มีแผนคอนเทนต์",
    col_cnt_id: "รหัสคอนเทนต์",
    col_cnt_cover: "รูปหน้าปก",
    col_cnt_title: "ชื่อหัวข้อคอนเทนต์",
    col_cnt_type: "ประเภทคอนเทนต์",
    col_cnt_prod_id: "รหัสสินค้า",
    col_cnt_prod_name: "ชื่อสินค้า",
    col_cnt_angle: "มุมขายคอนเทนต์",
    col_cnt_pillar: "เสาหลักคอนเทนต์",
    col_cnt_channel: "ช่องทางเผยแพร่",
    col_cnt_hook: "Hook (คำเกริ่นเปิดคลิป)",
    col_cnt_script: "บทพูด / สคริปต์",
    col_cnt_cta: "ประเภท CTA",
    col_cnt_planned_date: "วันที่วางแผน",
    col_cnt_status: "สถานะงาน",
    col_cnt_pub_date: "วันที่เผยแพร่",
    col_cnt_pub_url: "ลิงก์ที่เผยแพร่",
    col_cnt_perf_notes: "บันทึกผลลัพธ์",

    // Calendar View
    cal_title: "ปฏิทินงานคอนเทนต์",
    cal_subtitle: "ตารางเวลาวางแผนงานคอนเทนต์และกำหนดวันเผยแพร่ตลอดทั้งเดือน",
    cal_quick_edit_title: "แก้ไขคอนเทนต์แบบด่วน",
    cal_help_text: "กดที่การ์ดคอนเทนต์เพื่อแก้ไขรายละเอียดแบบด่วน หรือเปิด Teleprompter ได้ทันที",

    // Channels View
    chan_title: "บันทึกสถิติตามช่องทาง",
    chan_subtitle: "บันทึกสถิติ Views, Likes, Engagement % และ Conversion Rate ของแต่ละช่องทาง",
    chan_add_btn: "+ เพิ่มข้อมูลสถิติ",
    chan_empty: "ยังไม่มีข้อมูลสถิติช่องทาง",

    // Sponsors View
    spon_title: "จัดการดีลสปอนเซอร์",
    spon_subtitle: "จัดการดีลสปอนเซอร์ ค่าจ้าง งานที่ต้องส่ง และสถานะการชำระเงิน",
    spon_add_btn: "+ เพิ่มดีลสปอนเซอร์",
    spon_empty: "ยังไม่มีดีลสปอนเซอร์",

    // Brand View
    brand_title: "กำหนดอัตลักษณ์แบรนด์",
    brand_subtitle: "กำหนดอัตลักษณ์แบรนด์ โทนการพูด เสาหลักคอนเทนต์ และธีมสี",

    // Settings View
    set_title: "ตั้งค่าระบบ",
    set_subtitle: "ปรับแต่งธีมหน้าจอ สลับภาษา UI และจัดการตัวเลือก Dropdown",
    set_clear_data: "🗑️ ลบข้อมูลทั้งหมดในระบบ",
    set_theme_title: "ธีมการแสดงผลหน้าจอ",
    set_theme_sub: "สลับโหมดการแสดงผลหน้าจอระหว่าง Light Mode และ Dark Mode",
    set_lang_title: "ภาษาของระบบ (UI Language)",
    set_lang_sub: "เลือกภาษาที่ใช้แสดงผลข้อความในเมนูและปุ่มคำสั่งทั้งหมด",
    set_dark_mode: "โหมดมืด (Dark)",
    set_light_mode: "โหมดสว่าง (Light)",
    set_lang_en: "English (ภาษาอังกฤษ)",
    set_lang_th: "ภาษาไทย (Thai)",
    
    // Settings Lists Labels
    set_list_channels: "ตัวเลือกช่องทางเผยแพร่",
    set_list_pillars: "ตัวเลือกเสาหลักคอนเทนต์ (Pillars)",
    set_list_prod_cats: "ตัวเลือกหมวดสินค้า",
    set_list_cnt_types: "ตัวเลือกประเภทคอนเทนต์",
    set_list_cnt_angles: "ตัวเลือกมุมขายคอนเทนต์",
    set_list_cnt_statuses: "ตัวเลือกสถานะคอนเทนต์",
    set_list_prod_statuses: "ตัวเลือกสถานะสินค้า",
    set_list_prod_types: "ตัวเลือกประเภทสินค้า",
    set_list_cta_types: "ตัวเลือกประเภท CTA",
    set_list_deal_types: "ตัวเลือกประเภทดีลสปอนเซอร์",
    set_list_pay_statuses: "ตัวเลือกสถานะการจ่ายเงิน",
    set_add_item: "+ เพิ่มตัวเลือก",

    // Common UI Text
    common_search: "ค้นหาข้อมูล...",
    common_items: "รายการ",
    common_teleprompter: "🎬 อ่านบทพูด (Teleprompter)",
    common_save: "บันทึกการแก้ไข",
    common_close: "ปิดหน้าต่าง",
    common_cancel: "ยกเลิก",
    common_delete: "ลบรายการนี้",
    common_delete_confirm: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
    common_edit: "แก้ไขรายละเอียด",
    common_actions: "เครื่องมือ",
    common_tap_drilldown: "แตะเพื่อดู/แก้ไขรายละเอียด",
  }
};

let currentLanguage = localStorage.getItem('ccp_lang') || 'en';

export function getLang() {
  return currentLanguage;
}

export function setLang(lang) {
  if (lang === 'th' || lang === 'en') {
    currentLanguage = lang;
    localStorage.setItem('ccp_lang', lang);
  }
}

export function t(key) {
  const langDict = DICTIONARY[currentLanguage] || DICTIONARY.en;
  return langDict[key] || DICTIONARY.en[key] || key;
}
