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
  dark_monarch: {
    id: 'dark_monarch',
    name: '👑 Dark Monarch (Bá Chủ Bóng Tối)',
    badge: '💀 QUÂN ĐOÀN BÓNG TỐI',
    bgGradient: 'from-black via-purple-950 to-slate-950',
    glowColor: '#a855f7',
    badgeStyle: 'purple_void',
    titleStyle: 'gold_3d',
    overlayEffect: 'flaming_embers',
    defaultSubtitle: 'TRIỆU HOÁN 100 VẠN ÂM BINH VÔ ĐỊCH',
    accentBorder: 'border-purple-500/50',
    description: 'Sắc tím hắc ám huyền bí kết hợp lửa đen và triệu hoán vong linh.',
  },
  golden_immortal: {
    id: 'golden_immortal',
    name: '🐉 Tu Tiên (Hoàng Kim Long Hồn)',
    badge: '⚡ ĐỘ KIẾP PHI THĂNG',
    bgGradient: 'from-amber-950 via-stone-950 to-red-950',
    glowColor: '#f59e0b',
    badgeStyle: 'gold_metallic',
    titleStyle: 'gold_3d',
    overlayEffect: 'flaming_embers',
    defaultSubtitle: 'CẢ THẾ GIỚI TU CHÂN PHẢI QUỲ XUỐNG',
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
