/* ──────────────────────────────────────────
   Internationalization (i18n) Module
   Language Dictionary: English (Default) & Thai
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
    dash_title: "Dashboard",
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
    stat_in_progress_sub: "Ongoing (Click for details)",
    stat_sponsor_deals: "Sponsor Deals",
    stat_sponsor_deals_sub: "Active brand deals",
    stat_click_view: "Click View 🔍",

    mix_title: "Content Mix",
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
    prod_subtitle: "Manage your affiliate products database, upload thumbnail photos, and edit custom IDs",
    prod_add_btn: "+ Add Product",
    prod_empty: "No products yet",
    col_prod_id: "Product ID",
    col_prod_photo: "Photo",
    col_prod_name: "Product Name",
    col_prod_category: "Category",
    col_prod_brand: "Brand",
    col_prod_price: "Price ฿",
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
    col_cnt_perf_notes: "Performance Notes",

    // Calendar View
    cal_title: "Monthly Calendar",
    cal_subtitle: "View your content production & publishing schedule across the month",

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
    brand_subtitle: "Define creator profile, content pillars, tone of voice, and colors",

    // Settings View
    set_title: "Settings",
    set_subtitle: "Configure screen theme, UI language, dropdown lists, and data backups",
    set_clear_data: "Delete All Data",
    set_theme_title: "Theme Settings",
    set_theme_sub: "Switch screen theme between Light Mode and Dark Mode",
    set_lang_title: "Language Settings / ตั้งค่าภาษา",
    set_lang_sub: "Switch UI display language between English and Thai",
    set_dark_mode: "DARK MODE",
    set_light_mode: "LIGHT MODE",
    set_lang_en: "English (US)",
    set_lang_th: "ภาษาไทย (Thai)",
    
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
    common_teleprompter: "🎬 Open Teleprompter Mode",
    common_save: "Save",
    common_cancel: "Cancel",
    common_delete: "Delete",
    common_edit: "Edit",
    common_actions: "Actions",
  },

  th: {
    // Navigation Sidebar
    nav_dashboard: "แดชบอร์ด",
    nav_products: "จัดการสินค้า",
    nav_content: "แผนคอนเทนต์",
    nav_calendar: "ปฏิทินงาน",
    nav_channels: "สถิติตามช่องทาง",
    nav_sponsors: "ดีลสปอนเซอร์",
    nav_brand: "ข้อมูลแบรนด์",
    nav_settings: "ตั้งค่าระบบ",

    // Dashboard View
    dash_title: "Dashboard",
    dash_filter_year: "ปี:",
    dash_filter_category: "หมวดสินค้า:",
    dash_filter_producttype: "ประเภทสินค้า:",
    dash_filter_month: "เลือกเดือน:",
    dash_all_years: "ทุกปี (All)",
    dash_all_categories: "ทุกหมวด (All)",
    dash_all_types: "ทุกประเภท (All)",
    dash_all_months: "ทุกเดือน (All)",
    
    stat_active_products: "Total Product Active",
    stat_active_products_sub: "สินค้า Active ในคลัง",
    stat_total_content: "Total Content",
    stat_total_content_sub: "คอนเทนต์ทั้งหมด",
    stat_published: "Published",
    stat_published_sub: "เผยแพร่แล้ว",
    stat_in_progress: "In Progress 🔍",
    stat_in_progress_sub: "กำลังดำเนินการ (กดดูรายละเอียด)",
    stat_sponsor_deals: "Sponsor Deals",
    stat_sponsor_deals_sub: "ดีลสปอนเซอร์",
    stat_click_view: "คลิกดู 🔍",

    mix_title: "Content Mix",
    mix_total_content: "Total Content",
    mix_items: "รายการ",
    mix_status: "สถานะ:",
    mix_all_statuses: "ทุกสถานะ (All)",

    cat_breakdown_title: "Product Categories & Status",
    cat_count: "หมวดหมู่",
    cat_items_suffix: "สินค้า",
    cat_empty: "ยังไม่มีรายการสินค้าในระบบ 📦",

    channel_perf_title: "Content Performance by Channel / ประสิทธิภาพรายช่องทาง",
    channel_col_channel: "Channel / ช่องทาง",
    channel_col_videos: "Videos / คลิป",
    channel_col_views: "Views / ยอดวิว",
    channel_col_clicks: "Clicks / คลิกสินค้า",
    channel_col_orders: "Orders / ออเดอร์",
    channel_col_revenue: "Revenue / รายได้รวม",
    channel_col_engagement: "Engagement %",

    modal_inprogress_title: "In Progress Details / รายละเอียดงานที่กำลังทำ",
    modal_inprogress_sub: "คอนเทนต์ที่อยู่ระหว่างดำเนินการทั้งหมด (ไม่รวมที่เผยแพร่แล้ว)",
    modal_inprogress_empty: "ไม่มีรายการในสถานะนี้",
    modal_no_inprogress: "ไม่มีงานที่อยู่ระหว่างดำเนินการ 🎉",
    modal_ok_close: "ตกลง / ปิดหน้าต่าง",

    // Products View
    prod_title: "Products / จัดการสินค้า",
    prod_subtitle: "จัดการคลังสินค้า Affiliate อัปโหลดรูปภาพสินค้า Thumbnail และกำหนดราคาเองได้อิสระ",
    prod_add_btn: "+ Add Product / เพิ่มสินค้า",
    prod_empty: "ยังไม่มีสินค้าในคลัง",
    col_prod_id: "Product ID",
    col_prod_photo: "รูปสินค้า",
    col_prod_name: "Product Name",
    col_prod_category: "Category",
    col_prod_brand: "Brand",
    col_prod_price: "Price ฿ / ราคา",
    col_prod_platform: "Platform",
    col_prod_commission: "Commission %",
    col_prod_aff_link: "Affiliate Link",
    col_prod_selling_points: "Selling Points",
    col_prod_type: "Product Type",
    col_prod_audience: "Target Audience",
    col_prod_status: "Status",
    col_prod_notes: "Notes",

    // Content View
    cnt_title: "Content Planner / แผนคอนเทนต์",
    cnt_subtitle: "วางแผนสคริปต์ มุมขาย Hook และกำหนดวันเผยแพร่คอนเทนต์",
    cnt_add_btn: "+ Add Content / เพิ่มคอนเทนต์",
    cnt_empty: "ยังไม่มีแผนคอนเทนต์",
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
    col_cnt_perf_notes: "Performance Notes",

    // Calendar View
    cal_title: "Calendar / ปฏิทินรายเดือน",
    cal_subtitle: "ตารางเวลาวางแผนงานคอนเทนต์และกำหนดวันเผยแพร่ตลอดทั้งเดือน",

    // Channels View
    chan_title: "Channel Tracker / บันทึกผลรายช่องทาง",
    chan_subtitle: "บันทึกสถิติ Views, Likes, Engagement % และ Conversion Rate ของแต่ละช่องทาง",
    chan_add_btn: "+ Add Entry / เพิ่มข้อมูล",
    chan_empty: "ยังไม่มีข้อมูลสถิติช่องทาง",

    // Sponsors View
    spon_title: "Sponsors / ดีลสปอนเซอร์",
    spon_subtitle: "จัดการดีลสปอนเซอร์ ค่าจ้าง งานที่ต้องส่ง และสถานะการชำระเงิน",
    spon_add_btn: "+ Add Deal / เพิ่มดีล",
    spon_empty: "ยังไม่มีดีลสปอนเซอร์",

    // Brand View
    brand_title: "Brand Identity / ข้อมูลแบรนด์",
    brand_subtitle: "กำหนดอัตลักษณ์แบรนด์ โทนการพูด เสาหลักคอนเทนต์ และโทนสี",

    // Settings View
    set_title: "Settings / ตั้งค่าระบบ",
    set_subtitle: "ปรับแต่งธีมหน้าจอ (Light/Dark Mode), สลับภาษา UI และตัวเลือก Dropdown",
    set_clear_data: "🗑️ ลบข้อมูลทั้งหมด",
    set_theme_title: "Theme Settings / ธีมหน้าจอ",
    set_theme_sub: "สลับโหมดการแสดงผลหน้าจอระหว่าง Light Mode และ Dark Mode",
    set_lang_title: "Language Settings / ตั้งค่าภาษา",
    set_lang_sub: "เลือกภาษาในการแสดงผล UI ระหว่าง English และ ภาษาไทย",
    set_dark_mode: "DARK MODE",
    set_light_mode: "LIGHT MODE",
    set_lang_en: "English (US)",
    set_lang_th: "ภาษาไทย (Thai)",
    
    // Settings Lists Labels
    set_list_channels: "Channels / ช่องทาง",
    set_list_pillars: "Content Pillars / เสาหลัก",
    set_list_prod_cats: "Product Categories / หมวดสินค้า",
    set_list_cnt_types: "Content Types / ประเภท content",
    set_list_cnt_angles: "Content Angles / มุมขาย",
    set_list_cnt_statuses: "Content Status / สถานะ content",
    set_list_prod_statuses: "Product Status / สถานะสินค้า",
    set_list_prod_types: "Product Types / ประเภทสินค้า",
    set_list_cta_types: "CTA Types / ประเภท CTA",
    set_list_deal_types: "Deal Types / ประเภท deal",
    set_list_pay_statuses: "Payment Status / สถานะการจ่าย",
    set_add_item: "+ Add item",

    // Common UI Text
    common_search: "Search... ค้นหา",
    common_items: "รายการ",
    common_teleprompter: "🎬 เปิดโหมด Teleprompter",
    common_save: "บันทึก",
    common_cancel: "ยกเลิก",
    common_delete: "ลบ",
    common_edit: "แก้ไข",
    common_actions: "การกระทำ",
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
