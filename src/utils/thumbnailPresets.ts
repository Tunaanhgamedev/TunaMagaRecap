import {
  ThumbnailTheme,
  ThumbnailBadgeStyle,
  ThumbnailTitleStyle,
  ThumbnailOverlayEffect,
  AIVisualElement,
  ThumbnailConfig,
} from '../types/studio';

export interface ThemePresetDefinition {
  id: ThumbnailTheme;
  name: string;
  badge: string;
  bgGradient: string;
  glowColor: string;
  badgeStyle: ThumbnailBadgeStyle;
  titleStyle: ThumbnailTitleStyle;
  overlayEffect: ThumbnailOverlayEffect;
  defaultSubtitle: string;
  accentBorder: string;
  description: string;
}

export const THUMBNAIL_THEMES: Record<ThumbnailTheme, ThemePresetDefinition> = {
  solo_awakening: {
    id: 'solo_awakening',
    name: '⚡ Solo Awakening (Hunter / Hệ Thống)',
    badge: '🔥 SSS-RANK THỨC TỈNH',
    bgGradient: 'from-slate-950 via-blue-950 to-cyan-950',
    glowColor: '#06b6d4',
    badgeStyle: 'neon_cyan',
    titleStyle: 'electric_blue',
    overlayEffect: 'lightning_storm',
    defaultSubtitle: 'HỆ THỐNG BAN THƯỞNG SỨC MẠNH VÔ HẠN',
    accentBorder: 'border-cyan-500/50',
    description: 'Phong cách Solo Leveling với luồng sét xanh neon, hào quang thợ săn và cửa sổ hệ thống.',
  },
  tutien_mahoang: {
    id: 'tutien_mahoang',
    name: '🐉 Ma Hoàng / Tu Tiên Cổ Phong (Sắn Review)',
    badge: 'FULL BỘ | TU TIÊN',
    bgGradient: 'from-slate-950 via-emerald-950 to-amber-950',
    glowColor: '#10b981',
    badgeStyle: 'emerald_god',
    titleStyle: 'gold_3d',
    overlayEffect: 'flaming_embers',
    defaultSubtitle: 'MA HOÀNG BÁ ĐẠO ẨN THÂN BÁO THÙ TOÀN TÔNG MÔN',
    accentBorder: 'border-emerald-500/50',
    description: 'Phong cách Ma Hoàng Quản Gia, Đấu La, Đấu Phá với rồng vàng, ngọc bích và lửa ma đạo.',
  },
  dark_monarch: {
    id: 'dark_monarch',
    name: '👑 Chúa Tể Bóng Tối / Trọng Sinh (Bé Khôi / Miss Manhua)',
    badge: 'FULL 200 TẬP',
    bgGradient: 'from-black via-purple-950 to-slate-950',
    glowColor: '#a855f7',
    badgeStyle: 'purple_void',
    titleStyle: 'gold_3d',
    overlayEffect: 'flaming_embers',
    defaultSubtitle: 'TỪ PHẾ VẬT TA TRỞ THÀNH CHÚA TỂ BÓNG TỐI',
    accentBorder: 'border-purple-500/50',
    description: 'Sắc tím hắc ám huyền bí kết hợp lửa đen và triệu hoán vong linh nghìn năm.',
  },
  haihuoc_su_muoi: {
    id: 'haihuoc_su_muoi',
    name: '🌸 Tiểu Sư Muội / Hài Hước / Harem (Tỷ Tỷ Review)',
    badge: 'TRỌN BỘ 1-200',
    bgGradient: 'from-rose-950 via-purple-950 to-slate-950',
    glowColor: '#ec4899',
    badgeStyle: 'flaming_orange',
    titleStyle: 'fiery_orange',
    overlayEffect: 'magic_runes',
    defaultSubtitle: 'NHẶT ĐƯỢC TIỂU SƯ MUỘI SIÊU MẠNH SIÊU HÀI HƯỚC',
    accentBorder: 'border-pink-500/50',
    description: 'Phong cách vui nhộn, waifu đáng yêu, tông hồng tím cam tươi sáng bắt mắt.',
  },
  nguyento_vodich: {
    id: 'nguyento_vodich',
    name: '⚡ 100% Nguyên Tố / Chúa Bịp (Mèo Cày Truyện)',
    badge: 'TRỌN BỘ 1-END',
    bgGradient: 'from-cyan-950 via-blue-950 to-slate-950',
    glowColor: '#06b6d4',
    badgeStyle: 'neon_cyan',
    titleStyle: 'pure_white',
    overlayEffect: 'lightning_storm',
    defaultSubtitle: '100% KHẢ NĂNG ĐIỀU KHIỂN NGUYÊN TỐ LIỀN VÔ ĐỊCH',
    accentBorder: 'border-cyan-500/50',
    description: 'Hào quang nguyên tố băng sét, phong cách video cày truyện cực dài 10-40 tiếng.',
  },
  boss_nhatu: {
    id: 'boss_nhatu',
    name: '🚨 Trùm Nhà Tù / Sát Thủ Học Viện (Gấu Xàm Anime)',
    badge: 'TRÙM NGUY HIỂM NHẤT',
    bgGradient: 'from-red-950 via-stone-950 to-amber-950',
    glowColor: '#ef4444',
    badgeStyle: 'blood_red',
    titleStyle: 'crimson_blood',
    overlayEffect: 'shattered_glass',
    defaultSubtitle: 'THẦY DẠY HÓA LÀ BOSS NHÀ TÙ NGUY HIỂM NHẤT THẾ GIỚI',
    accentBorder: 'border-red-500/50',
    description: 'Màu đỏ máu gay cấn, cảnh báo nguy hiểm, hành động sát thủ giật gân.',
  },
  dothi_gianghe: {
    id: 'dothi_gianghe',
    name: '💼 Đô Thị / Chủ Tịch Giấu Nghề (Bún / Sắn Review)',
    badge: 'TRỌN BỘ | ĐÔ THỊ',
    bgGradient: 'from-slate-950 via-blue-950 to-stone-900',
    glowColor: '#38bdf8',
    badgeStyle: 'gold_metallic',
    titleStyle: 'gold_3d',
    overlayEffect: 'speed_lines',
    defaultSubtitle: 'CHỦ TỊCH KHÔNG THÈM GIẢ NGHÈO NỮA VẢ MẶT TOÀN BỘ',
    accentBorder: 'border-amber-500/50',
    description: 'Tông vàng hoàng kim + xanh doanh nhân, phong cách vả mặt cực đã.',
  },
  chuyensinh_bochet: {
    id: 'chuyensinh_bochet',
    name: '🦗 Chuyển Sinh Dị Biệt / Shorts Viral (DuuDey / MON)',
    badge: '😱 SIÊU DỊ BIỆT',
    bgGradient: 'from-lime-950 via-emerald-950 to-slate-950',
    glowColor: '#84cc16',
    badgeStyle: 'emerald_god',
    titleStyle: 'toxic_green',
    overlayEffect: 'speed_lines',
    defaultSubtitle: 'THANH NIÊN CHUYỂN SINH THÀNH BỌ CHÉT VÔ ĐỊCH',
    accentBorder: 'border-lime-500/50',
    description: 'Màu xanh chanh neon độc lạ, câu hook giật gân cuốn hút hàng triệu view Shorts.',
  },
  golden_immortal: {
    id: 'golden_immortal',
    name: '🐉 Hoàng Kim Long Hồn (Thần Đế Phi Thăng)',
    badge: '⚡ ĐỘ KIẾP PHI THĂNG',
    bgGradient: 'from-amber-950 via-stone-950 to-red-950',
    glowColor: '#f59e0b',
    badgeStyle: 'gold_metallic',
    titleStyle: 'gold_3d',
    overlayEffect: 'flaming_embers',
    defaultSubtitle: 'CẢ THẾ GIỚI TU CHÂN PHẢI QUỲ XUỐNG DƯỚI CHÂN',
    accentBorder: 'border-amber-500/50',
    description: 'Hào quang rồng vàng kim, lửa thần và phong cách thần tiên bá đạo.',
  },
  magic_overlord: {
    id: 'magic_overlord',
    name: '🔮 Isekai Overlord (Ma Pháp Cấm Kỵ)',
    badge: '🔞 CẤM THUẬT TỐI THƯỢNG',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    glowColor: '#d946ef',
    badgeStyle: 'purple_void',
    titleStyle: 'crimson_blood',
    overlayEffect: 'magic_runes',
    defaultSubtitle: 'CHUYỂN SINH THÀNH TRÙM CUỐI MA GIỚI',
    accentBorder: 'border-fuchsia-500/50',
    description: 'Trận pháp ma thuật huyền bí, vòng tròn ma pháp đa tầng và ma lực tím rực rỡ.',
  },
  blood_fury: {
    id: 'blood_fury',
    name: '🩸 Cuồng Nộ Báo Thù (Blood Moon)',
    badge: '💥 BÁO THÙ RỬA HẬN',
    bgGradient: 'from-red-950 via-stone-950 to-black',
    glowColor: '#ef4444',
    badgeStyle: 'blood_red',
    titleStyle: 'crimson_blood',
    overlayEffect: 'shattered_glass',
    defaultSubtitle: 'TẬN DIỆT TOÀN BỘ KẺ PHẢN BỘI TÀN NHẪN',
    accentBorder: 'border-red-500/50',
    description: 'Trăng máu đỏ thẫm, vết chém sát khí ngút trời và mảnh vỡ không gian.',
  },
  speed_action: {
    id: 'speed_action',
    name: '🚀 Shonen Action (Hành Động Bùng Nổ)',
    badge: '😱 CÚ LẬT KÈO KINH ĐIỂN',
    bgGradient: 'from-orange-950 via-slate-950 to-amber-950',
    glowColor: '#f97316',
    badgeStyle: 'flaming_orange',
    titleStyle: 'fiery_orange',
    overlayEffect: 'speed_lines',
    defaultSubtitle: 'SỨC MẠNH VƯỢT MỨC 100% CỰC HẠN',
    accentBorder: 'border-orange-500/50',
    description: 'Tia tốc độ manga manga, bùng nổ năng lượng và tông cam cháy rực.',
  },
  cyber_system: {
    id: 'cyber_system',
    name: '🤖 Cyber Hacker (Game Thực Tế Ảo)',
    badge: '💎 HACK TOÀN BỘ SERVER',
    bgGradient: 'from-emerald-950 via-slate-950 to-cyan-950',
    glowColor: '#10b981',
    badgeStyle: 'emerald_god',
    titleStyle: 'toxic_green',
    overlayEffect: 'system_hud',
    defaultSubtitle: 'CHỈ SỐ SỨC MẠNH NỔ TUNG NGOÀI TẦM KIỂM SOÁT',
    accentBorder: 'border-emerald-500/50',
    description: 'Giao diện HUD holographic xanh lục, quét mã glitch và phong cách VR MMO.',
  },
  custom: {
    id: 'custom',
    name: '🎨 Tùy Chỉnh Toàn Diện',
    badge: '🔥 HOT REVIEW',
    bgGradient: 'from-slate-950 via-purple-950 to-slate-950',
    glowColor: '#8b5cf6',
    badgeStyle: 'gold_metallic',
    titleStyle: 'gold_3d',
    overlayEffect: 'lightning_storm',
    defaultSubtitle: 'DIỄN BIẾN MỚI NHẤT SIÊU KỊCH TÍNH',
    accentBorder: 'border-slate-700',
    description: 'Tự do tùy chỉnh màu sắc, hiệu ứng, layer và sticker theo ý thích.',
  },
};

// Preset AI Visual Overlays & Characters (Clean SVG Data URIs)
export const AI_PRESET_ASSETS: Array<{
  id: string;
  name: string;
  category: 'aura' | 'character' | 'effect' | 'badge';
  thumbnailUrl: string;
  svgContent: string;
}> = [
  {
    id: 'ai_blue_monarch_aura',
    name: '⚡ Hào Quang Sét Xanh Thần Cấp',
    category: 'aura',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%2306b6d4" stroke-width="4" opacity="0.8"/><path d="M50 10 L45 45 L60 40 L40 90 L48 55 L35 60 Z" fill="%2338bdf8"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <defs>
        <radialGradient id="blueAuraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#blueAuraGlow)"/>
      <path d="M200 40 L180 160 L240 150 L160 360 L190 220 L140 235 Z" fill="#38bdf8" opacity="0.9" filter="drop-shadow(0 0 12px #38bdf8)"/>
      <path d="M220 80 L200 180 L250 170 L180 320 L210 230 L170 240 Z" fill="#67e8f9" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'ai_golden_dragon_aura',
    name: '🐉 Long Hồn Hoàng Kim Tu Tiên',
    category: 'aura',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23f59e0b" stroke-width="4"/><path d="M30 70 Q 50 20 70 70 T 90 40" fill="none" stroke="%23fbbf24" stroke-width="6"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <defs>
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#d97706" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#goldGlow)"/>
      <path d="M120 320 C 100 200, 300 200, 280 80 C 260 20, 200 60, 180 120 C 150 200, 320 280, 280 360" stroke="#fde047" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.85" filter="drop-shadow(0 0 16px #f59e0b)"/>
      <circle cx="280" cy="80" r="16" fill="#fff" filter="drop-shadow(0 0 10px #fef08a)"/>
    </svg>`,
  },
  {
    id: 'ai_system_hud_window',
    name: '🖥️ Cửa Sổ Hệ Thống SSS-Rank',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="60" rx="8" fill="%230f172a" stroke="%2306b6d4" stroke-width="4"/><text x="50" y="55" fill="%2338bdf8" font-size="14" font-weight="bold" text-anchor="middle">QUEST</text></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
      <rect x="10" y="10" width="380" height="240" rx="14" fill="#020617" fill-opacity="0.88" stroke="#06b6d4" stroke-width="4" filter="drop-shadow(0 0 20px rgba(6, 182, 212, 0.6))"/>
      <rect x="20" y="20" width="360" height="40" rx="6" fill="#0891b2" fill-opacity="0.3"/>
      <text x="200" y="46" fill="#a5f3fc" font-size="18" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="2">⚠️ THÔNG BÁO HỆ THỐNG CẤP SSS</text>
      <line x1="30" y1="75" x2="370" y2="75" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="40" y="115" fill="#f8fafc" font-size="16" font-weight="bold" font-family="sans-serif">▶ NGƯỜI CHƠI ĐÃ THỨC TỈNH SỨC MẠNH</text>
      <text x="40" y="150" fill="#38bdf8" font-size="15" font-weight="bold" font-family="sans-serif">▶ DANH HIỆU: BÁ CHỦ TỐI CAO (LV.999)</text>
      <text x="40" y="185" fill="#fbbf24" font-size="15" font-weight="bold" font-family="sans-serif">▶ PHẦN THƯỞNG: ĐẶC QUYỀN DUY NHẤT VÔ ĐỊCH</text>
      <rect x="260" y="205" width="110" height="32" rx="6" fill="#06b6d4"/>
      <text x="315" y="226" fill="#020617" font-size="13" font-weight="900" font-family="sans-serif" text-anchor="middle">CHẤP NHẬN</text>
    </svg>`,
  },
  {
    id: 'ai_magic_circle_runes',
    name: '🔮 Ma Pháp Trận Đa Tầng Cấm Kỵ',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23c084fc" stroke-width="3"/><polygon points="50,15 80,75 20,75" fill="none" stroke="%23e879f9" stroke-width="2"/><polygon points="50,85 80,25 20,25" fill="none" stroke="%23e879f9" stroke-width="2"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <circle cx="200" cy="200" r="180" stroke="#d946ef" stroke-width="4" stroke-dasharray="12 6" opacity="0.85" filter="drop-shadow(0 0 14px #d946ef)"/>
      <circle cx="200" cy="200" r="145" stroke="#a855f7" stroke-width="3" opacity="0.75"/>
      <circle cx="200" cy="200" r="110" stroke="#c084fc" stroke-width="2" stroke-dasharray="4 8"/>
      <polygon points="200,60 321,270 79,270" stroke="#f472b6" stroke-width="3" fill="none" opacity="0.8"/>
      <polygon points="200,340 321,130 79,130" stroke="#f472b6" stroke-width="3" fill="none" opacity="0.8"/>
      <circle cx="200" cy="200" r="50" fill="#a855f7" fill-opacity="0.25"/>
    </svg>`,
  },
  {
    id: 'ai_blood_slash_effect',
    name: '🩸 Trảm Kích Huyết Nguyệt',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 90 Q 50 10 90 20 Q 60 70 10 90" fill="%23ef4444"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <path d="M30 370 Q 180 50 380 40 Q 240 220 30 370 Z" fill="url(#bloodGrad)" filter="drop-shadow(0 0 20px #dc2626)"/>
      <path d="M50 360 Q 190 70 360 60 Q 250 200 50 360 Z" fill="#fca5a5" opacity="0.6"/>
      <defs>
        <linearGradient id="bloodGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7f1d1d"/>
          <stop offset="50%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#fecaca"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'ai_speed_burst_rays',
    name: '💥 Tia Tốc Độ Manga Action Zoom',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,50 0,0 20,0" fill="%23fff" opacity="0.5"/><polygon points="50,50 80,0 100,0" fill="%23fff" opacity="0.5"/><polygon points="50,50 100,80 100,100" fill="%23fff" opacity="0.5"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" fill="none">
      <g stroke="#ffffff" stroke-width="2.5" opacity="0.35">
        <line x1="300" y1="200" x2="0" y2="0"/>
        <line x1="300" y1="200" x2="60" y2="0"/>
        <line x1="300" y1="200" x2="140" y2="0"/>
        <line x1="300" y1="200" x2="220" y2="0"/>
        <line x1="300" y1="200" x2="380" y2="0"/>
        <line x1="300" y1="200" x2="460" y2="0"/>
        <line x1="300" y1="200" x2="540" y2="0"/>
        <line x1="300" y1="200" x2="600" y2="0"/>
        <line x1="300" y1="200" x2="600" y2="80"/>
        <line x1="300" y1="200" x2="600" y2="160"/>
        <line x1="300" y1="200" x2="600" y2="240"/>
        <line x1="300" y1="200" x2="600" y2="320"/>
        <line x1="300" y1="200" x2="600" y2="400"/>
        <line x1="300" y1="200" x2="0" y2="400"/>
        <line x1="300" y1="200" x2="100" y2="400"/>
        <line x1="300" y1="200" x2="200" y2="400"/>
        <line x1="300" y1="200" x2="400" y2="400"/>
        <line x1="300" y1="200" x2="500" y2="400"/>
        <line x1="300" y1="200" x2="0" y2="100"/>
        <line x1="300" y1="200" x2="0" y2="200"/>
        <line x1="300" y1="200" x2="0" y2="300"/>
      </g>
    </svg>`,
  },
  {
    id: 'ai_attention_arrow',
    name: '🎯 Mũi Tên Đỏ Giật Gân (Clickbait Arrow)',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 70 L55 35 L50 20 L85 20 L85 55 L70 50 L35 85 Z" fill="%23ef4444" stroke="%23fff" stroke-width="4"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
      <path d="M40 220 L150 110 L135 70 L240 70 L240 175 L200 160 L90 270 Z" fill="#ef4444" stroke="#ffffff" stroke-width="12" stroke-linejoin="round" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.8))"/>
      <path d="M50 215 L145 120 L138 90 L220 90 L220 172 L190 165 L95 260 Z" fill="#f87171" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'ai_floating_skill_badge',
    name: '🃏 Thẻ Kỹ Năng / Biểu Tượng Cấp SSS',
    category: 'badge',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="10" fill="%231e1b4b" stroke="%23a855f7" stroke-width="4"/><text x="50" y="58" fill="%23e879f9" font-size="22" font-weight="bold" text-anchor="middle">SSS</text></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" fill="none">
      <rect x="20" y="20" width="210" height="210" rx="24" fill="#030712" stroke="#38bdf8" stroke-width="8" filter="drop-shadow(0 0 25px #0284c7)"/>
      <rect x="35" y="35" width="180" height="180" rx="16" fill="#0f172a" stroke="#67e8f9" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="125" cy="110" r="50" fill="#0284c7" fill-opacity="0.3"/>
      <path d="M125 70 L140 100 L170 105 L148 126 L153 156 L125 142 L97 156 L102 126 L80 105 L110 100 Z" fill="#facc15" filter="drop-shadow(0 0 10px #eab308)"/>
      <text x="125" y="195" fill="#38bdf8" font-size="20" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="3">SKILL EX</text>
    </svg>`,
  },
  {
    id: 'ai_red_eye_flare',
    name: '🔴 Mắt Đỏ Sát Khí (Red Eye Flare / Omae Wa)',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="16" fill="%23ef4444"/><line x1="10" y1="50" x2="90" y2="50" stroke="%23f87171" stroke-width="4"/><line x1="50" y1="10" x2="50" y2="90" stroke="%23f87171" stroke-width="4"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
      <defs>
        <radialGradient id="redEyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#ef4444"/>
          <stop offset="70%" stop-color="#dc2626" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#991b1b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="100" fill="url(#redEyeGlow)"/>
      <line x1="10" y1="150" x2="290" y2="150" stroke="#fca5a5" stroke-width="8" stroke-linecap="round" filter="drop-shadow(0 0 15px #ef4444)"/>
      <line x1="150" y1="10" x2="150" y2="290" stroke="#fca5a5" stroke-width="8" stroke-linecap="round" filter="drop-shadow(0 0 15px #ef4444)"/>
      <circle cx="150" cy="150" r="22" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)"/>
    </svg>`,
  },
  {
    id: 'ai_cyan_eye_flare',
    name: '💠 Mắt Xanh Thợ Săn (Hunter Mana Eye Glow)',
    category: 'effect',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="16" fill="%2306b6d4"/><line x1="10" y1="50" x2="90" y2="50" stroke="%2338bdf8" stroke-width="4"/><line x1="50" y1="10" x2="50" y2="90" stroke="%2338bdf8" stroke-width="4"/></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
      <defs>
        <radialGradient id="cyanEyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#38bdf8"/>
          <stop offset="75%" stop-color="#0284c7" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="110" fill="url(#cyanEyeGlow)"/>
      <line x1="15" y1="150" x2="285" y2="150" stroke="#bae6fd" stroke-width="7" stroke-linecap="round" filter="drop-shadow(0 0 12px #06b6d4)"/>
      <line x1="150" y1="15" x2="150" y2="285" stroke="#bae6fd" stroke-width="7" stroke-linecap="round" filter="drop-shadow(0 0 12px #06b6d4)"/>
      <circle cx="150" cy="150" r="20" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)"/>
    </svg>`,
  },
  {
    id: 'ai_question_marks',
    name: '❓ Dấu Hỏi Vàng Giật Gân (Shocked ???)',
    category: 'badge',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" fill="%23facc15" font-size="50" font-weight="900" text-anchor="middle" stroke="%23000" stroke-width="3">???</text></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 160" fill="none">
      <text x="125" y="115" fill="#facc15" font-size="110" font-weight="900" font-family="'Arial Black', Impact, sans-serif" text-anchor="middle" stroke="#000000" stroke-width="14" stroke-linejoin="round" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.9))">???</text>
    </svg>`,
  },
  {
    id: 'ai_versus_badge',
    name: '⚔️ Biểu Tượng VS Rực Lửa (Battle Clash)',
    category: 'badge',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23ef4444"/><text x="50" y="65" fill="%23fff" font-size="34" font-weight="900" text-anchor="middle">VS</text></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" fill="none">
      <circle cx="130" cy="130" r="115" fill="#991b1b" stroke="#facc15" stroke-width="10" filter="drop-shadow(0 0 25px #ef4444)"/>
      <polygon points="130,20 155,90 230,90 170,135 195,205 130,165 65,205 90,135 30,90 105,90" fill="#f97316" opacity="0.5"/>
      <text x="130" y="170" fill="#ffffff" font-size="120" font-weight="900" font-family="'Arial Black', Impact, sans-serif" text-anchor="middle" stroke="#000000" stroke-width="16" stroke-linejoin="round">VS</text>
    </svg>`,
  },
  {
    id: 'ai_rank_progression_box',
    name: '📈 Bảng Tiến Hóa Cấp F ➔ SSS (Level Evolution)',
    category: 'badge',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="30" width="80" height="40" rx="8" fill="%231e1b4b" stroke="%2338bdf8" stroke-width="3"/><text x="50" y="56" fill="%23facc15" font-size="12" font-weight="bold" text-anchor="middle">F ➔ SSS</text></svg>',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 120" fill="none">
      <rect x="8" y="8" width="344" height="104" rx="18" fill="#030712" fill-opacity="0.9" stroke="#38bdf8" stroke-width="6" filter="drop-shadow(0 0 20px rgba(6,182,212,0.8))"/>
      <text x="70" y="70" fill="#94a3b8" font-size="44" font-weight="900" font-family="'Arial Black', sans-serif" text-anchor="middle" stroke="#000" stroke-width="4">CẤP F</text>
      <path d="M140 60 L200 60 L185 45 M200 60 L185 75" stroke="#facc15" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="275" y="72" fill="#facc15" font-size="48" font-weight="900" font-family="'Arial Black', sans-serif" text-anchor="middle" stroke="#000" stroke-width="6" filter="drop-shadow(0 0 12px #eab308)">SSS</text>
    </svg>`,
  },
];

// Viral High-CTR Stickers
export const CTR_STICKERS: string[] = [
  '🔥 SSS-RANK THỨC TỈNH',
  '👑 TRÙM CUỐI LỘ DIỆN',
  '💎 FULL 4K 60FPS',
  '💥 VẢ MẶT CỰC MÃN NHÃN',
  '🔞 CẤM ĐỊA MA GIỚI',
  '🚀 10M+ LƯỢT XEM',
  '😱 CÚ TWIST BẺ LÁI',
  '⚔️ TRỌN BỘ 10 TIẾNG',
  '🏆 VÔ ĐỊCH HẠ GIỚI',
  '⚡ HỆ THỐNG BUG GAME',
];

// Viral YouTube Manga Review Templates (Proven High CTR Formulas)
export interface ViralTitleTemplate {
  id: string;
  category: 'fulldai' | 'tutien' | 'badao' | 'thosan' | 'harem' | 'baothu' | 'dothi' | 'nguyento' | 'shorts';
  categoryLabel: string;
  channelSource?: string;
  viewsEstimate?: string;
  durationLabel?: string;
  title: string;
  subtitle: string;
  badge: string;
  theme: ThumbnailTheme;
  titleStyle: ThumbnailTitleStyle;
  hookExplanation?: string;
  progressionBadge?: string;
}

export interface YouTubeChannelBenchmark {
  id: string;
  name: string;
  handle: string;
  subs: string;
  totalViews: string;
  avgViews: string;
  genreFocus: string;
  signatureFormat: string;
  hitVideoTitle: string;
  hitViews: string;
  hitDuration: string;
  thumbnailStyle: string;
  recommendedTheme: ThumbnailTheme;
}

export const YOUTUBE_CHANNELS_BENCHMARK: YouTubeChannelBenchmark[] = [
  {
    id: 'san_review',
    name: 'Sắn Review',
    handle: '@santutien_98',
    subs: '437K',
    totalViews: '96.8M',
    avgViews: '219K / video',
    genreFocus: 'Tu Tiên / Ma Đạo / Trùng Sinh Báo Thù / Quản Gia',
    signatureFormat: 'FULL BỘ | [Tình huống cực mạnh] | Review Truyện Tranh',
    hitVideoTitle: 'FULL BỘ | Ma Hoàng Bá Đạo Ẩn Mình Trong Thân Phận Quản Gia Từng Bước Báo Thù',
    hitViews: '2.58M views',
    hitDuration: '9 giờ 20 phút',
    thumbnailStyle: '2-3 nhân vật đối đầu, chữ VÀNG KIM 3D viền đen dày, hào quang rồng vàng / ngọc bích',
    recommendedTheme: 'tutien_mahoang',
  },
  {
    id: 'gau_xam_anime',
    name: 'Gấu Xàm Anime',
    handle: '@gauxamreview',
    subs: '487K',
    totalViews: '138M',
    avgViews: '180K / video',
    genreFocus: 'Action / Manhwa Giật Gân / Boss Ngục Tù / Siêu Năng Lực',
    signatureFormat: '[TÌNH HUỐNG SỐC & NGUY HIỂM] | REVIEW MANHWA',
    hitVideoTitle: 'THẦY DẠY HÓA LÀ BOSS NHÀ TÙ NGUY HIỂM NHẤT THẾ GIỚI',
    hitViews: '5.06M views',
    hitDuration: '1 giờ 45 phút',
    thumbnailStyle: 'Mắt đỏ sát khí, luồng điện bùng nổ, viền đỏ máu cảnh báo, text TRẮNG/ĐỎ nổi bần bật',
    recommendedTheme: 'boss_nhatu',
  },
  {
    id: 'be_khoi_review',
    name: 'Bé Khôi Review / Miss Manhua',
    handle: '@bekhoireview',
    subs: '106K',
    totalViews: '35M',
    avgViews: '350K / video',
    genreFocus: 'Huyền Huyễn / Chúa Tể Bóng Tối / Phế Vật Nghịch Thiên',
    signatureFormat: 'Full 200 Tập | Từ Phế Vật Ta Trở Thành [Danh hiệu bá đạo]',
    hitVideoTitle: 'Full 200 Tập | Từ Phế Vật Ta Trở Thành Chúa Tể Bóng Tối',
    hitViews: '4.85M views',
    hitDuration: '13 giờ 10 phút',
    thumbnailStyle: 'Chia 2 khung: Phế vật yếu ớt vs Chúa tể tối thượng, mũi tên đỏ chỉ sang, cấp F ➔ SSS',
    recommendedTheme: 'dark_monarch',
  },
  {
    id: 'ty_ty_review',
    name: 'Tỷ Tỷ Review Truyện',
    handle: '@tytyreviewtruyen',
    subs: '74K',
    totalViews: '25M',
    avgViews: '200K / video',
    genreFocus: 'Hài Hước / Tiểu Sư Muội / Harem Waifu / Hắc Liên Hoa',
    signatureFormat: 'Chap 1 - 200 | [Nhặt được sư muội / Phu quân kỳ lạ]',
    hitVideoTitle: 'Chap 1 - 200 | Nhặt được tiểu sư muội siêu mạnh siêu hài hước',
    hitViews: '2.85M views',
    hitDuration: '7 giờ 38 phút',
    thumbnailStyle: 'Waifu chibi/dễ thương biểu cảm sốc bên cạnh nam chính, chữ CAM VÀNG rực rỡ',
    recommendedTheme: 'haihuoc_su_muoi',
  },
  {
    id: 'meo_cay_truyen',
    name: 'Mèo Cày Truyện',
    handle: '@meocaytruyen69',
    subs: '84K',
    totalViews: '18.5M',
    avgViews: '150K / video',
    genreFocus: 'Manhua / Video Cực Dài 24-48h / Toàn Năng Nguyên Tố',
    signatureFormat: '[Trọn Bộ 1-End] [Khả năng 100% / Bá đạo] Liền Vô Địch',
    hitVideoTitle: '[Trọn Bộ 1-End] Tôi Có 100% Khả Năng Điều Khiển Mọi Nguyên Tố Liền Vô Địch',
    hitViews: '1.58M views',
    hitDuration: '44 giờ (1 ngày 20 tiếng)',
    thumbnailStyle: '4 nguyên tố lửa-băng-sét-gió bao quanh nhân vật, biểu tượng 100% vàng sáng',
    recommendedTheme: 'nguyento_vodich',
  },
  {
    id: 'hai_ly_manga',
    name: 'Hải Ly Manga Review',
    handle: '@hailymangareview',
    subs: '33.3K',
    totalViews: '27.3M',
    avgViews: '142K / video',
    genreFocus: 'Manga / Manhwa hot thịnh hành / Tăng trưởng nhanh',
    signatureFormat: 'Review Truyện Tranh Hay Nhất [Tình huống xoay chuyển]',
    hitVideoTitle: 'Thiên Tài Bị Ruồng Bỏ Thức Tỉnh Ma Pháp Cổ Đại',
    hitViews: '1.2M views',
    hitDuration: '3 giờ 15 phút',
    thumbnailStyle: 'Ảnh nhân vật góc nghiêng thần thánh, độ bão hòa cao 130%, chữ TRẮNG viền đen 4px',
    recommendedTheme: 'solo_awakening',
  },
  {
    id: 'duudey_shorts',
    name: 'DuuDey (Shorts Master)',
    handle: '@dudey169',
    subs: '66K',
    totalViews: '55.7M',
    avgViews: '300K / short',
    genreFocus: 'Shorts 30-60s / Chuyển Sinh Dị Biệt / Tình Huống Sốc',
    signatureFormat: '[Nhân vật cực dị] + [Tình huống không thể tin nổi]',
    hitVideoTitle: 'Thanh Niên Chuyển Sinh Thành Bọ Chét Cắn Đứt Long Mạch',
    hitViews: '3.57M views',
    hitDuration: '55 giây',
    thumbnailStyle: 'Ảnh dọc 9:16, zoom cận mặt nhân vật độc lạ, chữ to chiếm 40% màn hình',
    recommendedTheme: 'chuyensinh_bochet',
  },
  {
    id: 'bun_review',
    name: 'Bún Review',
    handle: '@bunreview',
    subs: '149K',
    totalViews: '45M',
    avgViews: '190K / video',
    genreFocus: 'Anime + Manga + Manhwa + Manhua Đa Thể Loại',
    signatureFormat: 'Tóm Tắt Full | Khi Kẻ Yếu Nhất Nắm Giữ Sức Mạnh Vô Địch',
    hitVideoTitle: 'Khi Hoàng Tử Phế Vật Lại Là Đại Pháp Sư Nghìn Năm Trước',
    hitViews: '2.1M views',
    hitDuration: '4 giờ 50 phút',
    thumbnailStyle: 'Khung cảnh hoành tráng, hiệu ứng ma trận tròn tím hồng, độ nét 4K',
    recommendedTheme: 'magic_overlord',
  },
];

export const VIRAL_TITLE_TEMPLATES: ViralTitleTemplate[] = [
  // 🌟 Nhóm A: Video Dài / Full Bộ (10-20 Tiếng Triệu View)
  {
    id: 'san_mahoang',
    category: 'fulldai',
    categoryLabel: '🏆 Sắn Review (2.58M Views)',
    channelSource: 'Sắn Review',
    viewsEstimate: '2.58M views',
    durationLabel: '9h20m',
    title: 'MA HOÀNG BÁ ĐẠO ẨN MÌNH',
    subtitle: 'TRONG THÂN PHẬN QUẢN GIA TỪNG BƯỚC BÁO THÙ TOÀN TÔNG MÔN',
    badge: 'FULL BỘ | TU TIÊN',
    theme: 'tutien_mahoang',
    titleStyle: 'gold_3d',
    progressionBadge: '👑 [ MA HOÀNG ➔ VÔ ĐỊCH ]',
    hookExplanation: 'Mô-típ ẩn mình giấu nghề + báo thù cực đã, giữ chân người xem video dài 10 tiếng.',
  },
  {
    id: 'san_chuabip',
    category: 'fulldai',
    categoryLabel: '🏆 Sắn Review (1.71M Views)',
    channelSource: 'Sắn Review',
    viewsEstimate: '1.71M views',
    durationLabel: '6h45m',
    title: 'VÔ ĐỊCH TỪ CẢM XÚC TIÊU CỰC',
    subtitle: 'ĐẾ VƯƠNG TRỌNG SINH TRỞ THÀNH CHÚA BỊP THIÊN HẠ',
    badge: 'FULL BỘ | CHÚA BỊP',
    theme: 'tutien_mahoang',
    titleStyle: 'fiery_orange',
    progressionBadge: '💥 [ BỊP TOÀN SERVER ]',
    hookExplanation: 'Main tính cách lươn lẹo, thu thập cảm xúc tiêu cực để thăng cấp, hài hước cuốn hút.',
  },
  {
    id: 'bekhoi_bongtoi',
    category: 'fulldai',
    categoryLabel: '🏆 Bé Khôi / Miss Manhua (4.85M Views)',
    channelSource: 'Bé Khôi Review',
    viewsEstimate: '4.85M views',
    durationLabel: '13h10m',
    title: 'TỪ PHẾ VẬT TA TRỞ THÀNH',
    subtitle: 'CHÚA TỂ BÓNG TỐI NẮM TRONG TAY 100 VẠN ÂM BINH',
    badge: 'FULL 200 TẬP',
    theme: 'dark_monarch',
    titleStyle: 'gold_3d',
    progressionBadge: '💀 [ PHẾ VẬT ➔ CHÚA TỂ ]',
    hookExplanation: 'Công thức từ phế vật thành trùm tối thượng, kích thích tò mò cực độ cho video full bộ.',
  },
  {
    id: 'tyty_sumuoi',
    category: 'harem',
    categoryLabel: '🌸 Tỷ Tỷ Review (2.85M Views)',
    channelSource: 'Tỷ Tỷ Review',
    viewsEstimate: '2.85M views',
    durationLabel: '7h38m',
    title: 'NHẶT ĐƯỢC TIỂU SƯ MUỘI',
    subtitle: 'SIÊU MẠNH SIÊU HÀI HƯỚC ĐÁNH BAY CẢ TÔNG MÔN',
    badge: 'CHAP 1 - 200',
    theme: 'haihuoc_su_muoi',
    titleStyle: 'fiery_orange',
    progressionBadge: '🌸 [ SƯ MUỘI BÁ ĐẠO ]',
    hookExplanation: 'Kết hợp yếu tố waifu dễ thương + sức mạnh nghịch thiên + tình huống cười ra nước mắt.',
  },
  {
    id: 'meocay_nguyento',
    category: 'nguyento',
    categoryLabel: '⚡ Mèo Cày Truyện (1.58M Views)',
    channelSource: 'Mèo Cày Truyện',
    viewsEstimate: '1.58M views',
    durationLabel: '44 giờ',
    title: '100% KHẢ NĂNG ĐIỀU KHIỂN',
    subtitle: 'MỌI NGUYÊN TỐ LIỀN VÔ ĐỊCH NGAY TỪ TẬP ĐẦU TIÊN',
    badge: 'TRỌN BỘ 1-END',
    theme: 'nguyento_vodich',
    titleStyle: 'pure_white',
    progressionBadge: '⚡ [ 100% NGUYÊN TỐ ]',
    hookExplanation: 'Tựa đề cam kết độ dài trọn bộ + năng lực tuyệt đối khiến fan cày truyện bấm ngay lập tức.',
  },
  {
    id: 'gauxam_bossnhatu',
    category: 'badao',
    categoryLabel: '🚨 Gấu Xàm Anime (5.06M Views)',
    channelSource: 'Gấu Xàm Anime',
    viewsEstimate: '5.06M views',
    durationLabel: '1h45m',
    title: 'THẦY DẠY HÓA LÀ BOSS',
    subtitle: 'NHÀ TÙ NGUY HIỂM NHẤT THẾ GIỚI KHIẾN QUÂN ĐỘI KHIẾP SỢ',
    badge: 'TRÙM NGUY HIỂM',
    theme: 'boss_nhatu',
    titleStyle: 'crimson_blood',
    progressionBadge: '🩸 [ TRÙM NHÀ TÙ ]',
    hookExplanation: 'Độ tương phản cực mạnh giữa thân phận bình thường (thầy giáo) và thân phận ngầm (trùm nhà tù).',
  },

  // 🐉 Tu Tiên / Tiên Hiệp / Huyền Huyễn
  {
    id: 'do_kiep_that_bai',
    category: 'tutien',
    categoryLabel: '🐉 Tu Tiên / Đô Thị',
    channelSource: 'Tu Tiên Thịnh Hành',
    viewsEstimate: '1.45M views',
    durationLabel: '5h20m',
    title: 'ĐỘ KIẾP THẤT BẠI',
    subtitle: 'CHUYỂN SINH THÀNH CHÀNG RỂ PHẾ VẬT VẢ MẶT TOÀN THÀNH PHỐ',
    badge: 'FULL BỘ | ĐÔ THỊ',
    theme: 'tutien_mahoang',
    titleStyle: 'gold_3d',
    progressionBadge: '🐉 [ THẦN ĐẾ TRÙNG SINH ]',
    hookExplanation: 'Thần đế tu tiên chuyển sinh đô thị, công thức vả mặt kinh điển.',
  },
  {
    id: 'co_chan_nhan_ma_dao',
    category: 'tutien',
    categoryLabel: '🐉 Ma Đạo / Nghịch Thiên',
    channelSource: 'Manhua VIP',
    viewsEstimate: '1.88M views',
    durationLabel: '8h15m',
    title: 'CỔ CHÂN NHÂN TÁI XUẤT',
    subtitle: 'TÂM ĐỊA ĐỘC ÁC BÁO THÙ KHÔNG TỪ MỌI THỦ ĐOẠN',
    badge: 'MA ĐẠO BẤT TỬ',
    theme: 'tutien_mahoang',
    titleStyle: 'crimson_blood',
    progressionBadge: '💀 [ TÀN NHẪN VÔ ĐỊCH ]',
    hookExplanation: 'Main phản diện thông minh, tàn nhẫn, chiến lược logic đỉnh cao.',
  },

  // ⚡ Thợ Săn / Hệ Thống / Bug Game
  {
    id: 'chutich_giangheo',
    category: 'dothi',
    categoryLabel: '💼 Đô Thị / Chủ Tịch',
    channelSource: 'Bún Review',
    viewsEstimate: '2.1M views',
    durationLabel: '4h50m',
    title: 'CHỦ TỊCH KHÔNG THÈM GIẢ NGHÈO',
    subtitle: 'VẢ MẶT TOÀN BỘ GIA TỘC KHINH THƯỜNG TRONG 1 NỐT NHẠC',
    badge: 'TRỌN BỘ | ĐÔ THỊ',
    theme: 'dothi_gianghe',
    titleStyle: 'gold_3d',
    progressionBadge: '💎 [ TÀI SẢN NGHÌN TỶ ]',
    hookExplanation: 'Sự hả hê tuyệt đối khi kẻ yếu mở khóa thân phận tài phiệt vô địch.',
  },
  {
    id: 'thosan_cap_f_bug',
    category: 'thosan',
    categoryLabel: '⚡ Thợ Săn / Bug Game',
    channelSource: 'Hải Ly Manga',
    viewsEstimate: '1.65M views',
    durationLabel: '6h10m',
    title: 'THỢ SĂN CẤP F THỨC TỈNH',
    subtitle: 'HỆ THỐNG BUG GAME BAN THƯỞNG KỸ NĂNG VÔ HẠN CẤP SSS',
    badge: '⚡ BUG SERVER',
    theme: 'solo_awakening',
    titleStyle: 'electric_blue',
    progressionBadge: '⚡ [ CẤP F ➔ CẤP SSS ]',
    hookExplanation: 'Khởi đầu yếu nhất server nhưng tận dụng lỗi game để trở thành người mạnh nhất.',
  },
  {
    id: 'sung_thu_sss',
    category: 'thosan',
    categoryLabel: '⚡ Sủng Thú Triệu Hồi',
    channelSource: 'Solo Review',
    viewsEstimate: '1.32M views',
    durationLabel: '4h15m',
    title: 'CHỈ MÌNH TA SỞ HỮU',
    subtitle: 'SỦNG THÚ THẦN THÚ CẤP SSS ĐÁNH TAN CẢ HẦM NGỤC',
    badge: '🔥 SSS-RANK',
    theme: 'solo_awakening',
    titleStyle: 'fiery_orange',
    progressionBadge: '👑 [ LEVEL 1 ➔ LEVEL 999 ]',
    hookExplanation: 'Sủng thú đáng yêu tiến hóa thành quái vật diệt thế.',
  },

  // 💘 Harem / Waifu / Hài Hước
  {
    id: 'vo_toi_xich_long',
    category: 'harem',
    categoryLabel: '💘 Harem / Long Tộc',
    channelSource: 'Tỷ Tỷ Review',
    viewsEstimate: '2.16M views',
    durationLabel: '5h40m',
    title: 'VỢ TÔI LÀ XÍCH LONG',
    subtitle: 'MẮC CHỨNG SỢ GIAO TIẾP VÔ CÙNG ĐÁNG YÊU NHƯNG CỰC MẠNH',
    badge: 'TRỌN BỘ HAREM',
    theme: 'haihuoc_su_muoi',
    titleStyle: 'fiery_orange',
    progressionBadge: '💘 [ LONG TỘC WAIFU ]',
    hookExplanation: 'Sự tương phản giữa rồng thần hủy diệt và tính cách nhút nhát siêu dễ thương.',
  },
  {
    id: 'phu_quan_hac_lien_hoa',
    category: 'harem',
    categoryLabel: '💘 Hắc Liên Hoa',
    channelSource: 'Tỷ Tỷ Review',
    viewsEstimate: '2.18M views',
    durationLabel: '6h20m',
    title: 'PHU QUÂN TA NHẶT ĐƯỢC',
    subtitle: 'LẠI LÀ HẮC LIÊN HOA GIẤU NGHỀ THỐNG TRỊ MA GIỚI',
    badge: 'CHAP 1 - 100',
    theme: 'magic_overlord',
    titleStyle: 'gold_3d',
    progressionBadge: '🔮 [ TRÙM MA GIỚI ]',
    hookExplanation: 'Chuyện tình hài hước giữa nữ chính ngây thơ và ma vương ngụy trang.',
  },

  // 🩸 Báo Thù / Chuyển Sinh / Trùng Sinh
  {
    id: 'trung_sinh_bao_thu',
    category: 'baothu',
    categoryLabel: '🩸 Báo Thù Rửa Hận',
    channelSource: 'Sắn Review',
    viewsEstimate: '1.92M views',
    durationLabel: '7h50m',
    title: 'BỊ PHẢN BỘI TÀN NHẪN',
    subtitle: 'TRÙNG SINH VỀ 10 NĂM TRƯỚC TẬN DIỆT TOÀN BỘ KẺ THÙ',
    badge: '💀 HUYẾT THÙ',
    theme: 'blood_fury',
    titleStyle: 'crimson_blood',
    progressionBadge: '🩸 [ TẬN DIỆT KẺ THÙ ]',
    hookExplanation: 'Mạch phim báo thù dồn dập, không tha cho bất kỳ kẻ phản bội nào.',
  },
  {
    id: 'bi_duoi_khoi_to_doi',
    category: 'baothu',
    categoryLabel: '🩸 Đuổi Khỏi Tổ Đội',
    channelSource: 'Anime Review Hub',
    viewsEstimate: '1.48M views',
    durationLabel: '3h30m',
    title: 'SAU KHI BỊ ĐUỔI KHỎI TỔ ĐỘI',
    subtitle: 'TÔI MỞ KHÓA BÍ THUẬT THẦN CẤP KHIẾN HỌ PHẢI HỐI HẬN',
    badge: '🔞 CẤM THUẬT',
    theme: 'magic_overlord',
    titleStyle: 'crimson_blood',
    progressionBadge: '⚡ [ CẤP F ➔ CẤP SSS ]',
    hookExplanation: 'Tổ đội cũ suy tàn vì thiếu main, còn main thì một mình lập nên đế chế mới.',
  },

  // 🦗 Shorts Dị Biệt (20 - 60s Triệu View)
  {
    id: 'short_bochet',
    category: 'shorts',
    categoryLabel: '⚡ Shorts (3.57M Views)',
    channelSource: 'Mê Animehen',
    viewsEstimate: '3.57M views',
    durationLabel: '45s Shorts',
    title: 'CHUYỂN SINH THÀNH BỌ CHÉT',
    subtitle: 'THANH NIÊN HÚT MÁU RỒNG THẦN ĐỘT BIẾN VÔ ĐỊCH',
    badge: '😱 SIÊU DỊ BIỆT',
    theme: 'chuyensinh_bochet',
    titleStyle: 'toxic_green',
    progressionBadge: '🦗 [ BỌ CHÉT VÔ ĐỊCH ]',
    hookExplanation: 'Concept quái dị khiến người lướt Shorts dừng lại xem ngay trong 3 giây đầu.',
  },
  {
    id: 'short_thany',
    category: 'shorts',
    categoryLabel: '⚡ Shorts (3.37M Views)',
    channelSource: 'MON Đẹp Trai',
    viewsEstimate: '3.37M views',
    durationLabel: '50s Shorts',
    title: 'THẦN Y CHỮA BỆNH ĐỘC LẠ',
    subtitle: 'CHỈ CẦN 1 CÁI TÁT CHỮA KHỎI BỆNH NAN Y CHO TIỂU THƯ',
    badge: '🔥 THẦN Y ĐÔ THỊ',
    theme: 'dothi_gianghe',
    titleStyle: 'fiery_orange',
    progressionBadge: '💎 [ THẦN Y 1 CÁI TÁT ]',
    hookExplanation: 'Hành động chữa bệnh kỳ lạ tạo sự tò mò và tiếng cười sảng khoái.',
  },
  {
    id: 'short_truvuong',
    category: 'shorts',
    categoryLabel: '⚡ Shorts (2.18M Views)',
    channelSource: 'Tatu Review',
    viewsEstimate: '2.18M views',
    durationLabel: '58s Shorts',
    title: 'THỨ DUY NHẤT KHIẾN TRỤ VƯƠNG',
    subtitle: 'DÁM NGÓ LƠ ĐẮC KỶ VÀ TẬP TRUNG LUYỆN KIẾM',
    badge: '👑 BẤT NGỜ CHƯA',
    theme: 'golden_immortal',
    titleStyle: 'gold_3d',
    progressionBadge: '⚔️ [ KIẾM ĐẠO VÔ TÌNH ]',
    hookExplanation: 'Cú bẻ lái cực mạnh từ truyền thuyết kinh điển.',
  },
];

// Progression Badges
export const PROGRESSION_BADGES = [
  '⚡ [ CẤP F ➔ CẤP SSS ]',
  '👑 [ LEVEL 1 ➔ LEVEL 999 ]',
  '💥 [ PHẾ VẬT ➔ BÁ CHỦ ]',
  '💀 [ 0.0001% TỶ LỆ SỐNG ]',
  '🏆 [ CHIẾN LỰC 999.999+ ]',
  '💎 [ TRỌN BỘ 10 TIẾNG ]',
  '🐉 [ MA HOÀNG ➔ VÔ ĐỊCH ]',
  '🌸 [ SƯ MUỘI BÁ ĐẠO ]',
  '🩸 [ TẬN DIỆT KẺ THÙ ]',
  '🦗 [ BỌ CHÉT VÔ ĐỊCH ]',
];

export function createDefaultThumbnailConfig(
  seriesName: string = 'Tôi Thăng Cấp Một Mình',
  chapterNumber: number = 1,
  coverImage: string = '',
  themeId: ThumbnailTheme = 'solo_awakening'
): ThumbnailConfig {
  const theme = THUMBNAIL_THEMES[themeId] || THUMBNAIL_THEMES.solo_awakening;
  return {
    mainTitle: seriesName.toUpperCase(),
    subtitle: `CHAPTER ${chapterNumber} • ${theme.defaultSubtitle}`,
    badge: theme.badge,
    characterImage: coverImage,
    bgGradient: theme.bgGradient,
    glowColor: theme.glowColor,
    theme: theme.id,
    badgeStyle: theme.badgeStyle,
    titleStyle: theme.titleStyle,
    overlayEffect: theme.overlayEffect,
    characterPosition: 'right',
    characterScale: 105,
    characterGlow: true,
    characterBlend: 'normal',
    aspectRatio: '16:9',
    activeStickers: ['🔥 SSS-RANK THỨC TỈNH', '💎 FULL 4K 60FPS'],
    aiElements: [],
    filterSettings: {
      brightness: 105,
      contrast: 125,
      saturation: 130,
      vignette: 40,
    },
  };
}

