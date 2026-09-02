/**
 * Vietnamese Text Normalizer for Manga / Manhwa / Manhua Recap TTS
 * Transforms foreign names, gaming terms, and manga formatting into 100% natural Vietnamese pronunciation.
 * Supports:
 * 1. Global Built-in Dictionaries (Tu Tiên, Manhwa Thợ Săn, Shonen Isekai, Đô Thị, Esports)
 * 2. Genre-Specific Pack overrides
 * 3. Project-Specific Custom Rules (passed dynamically via API)
 * 4. Unicode-safe word boundary detection to prevent corruption of Vietnamese words with diacritics
 */

export const GENRE_DICTIONARIES = {
  // 1. Tu Tiên / Cổ Phong / Huyền Huyễn (Manhua & Tiên Hiệp)
  tutien: [
    [/(?<=^|[^\p{L}\p{N}])Xiao\s+Yan(?=[^\p{L}\p{N}]|$)/gui, 'Tiêu Viêm'],
    [/(?<=^|[^\p{L}\p{N}])Gu\s+Chang[- ]?ge(?=[^\p{L}\p{N}]|$)/gui, 'Cổ Trường Ca'],
    [/(?<=^|[^\p{L}\p{N}])Tang\s+San(?=[^\p{L}\p{N}]|$)/gui, 'Đường Tam'],
    [/(?<=^|[^\p{L}\p{N}])Shi\s+Hao(?=[^\p{L}\p{N}]|$)/gui, 'Thạch Hạo'],
    [/(?<=^|[^\p{L}\p{N}])Luo\s+Feng(?=[^\p{L}\p{N}]|$)/gui, 'La Phong'],
    [/(?<=^|[^\p{L}\p{N}])Lin\s+Dong(?=[^\p{L}\p{N}]|$)/gui, 'Lâm Động'],
    [/(?<=^|[^\p{L}\p{N}])Zhou\s+Yuan(?=[^\p{L}\p{N}]|$)/gui, 'Chu Nguyên'],
    [/(?<=^|[^\p{L}\p{N}])Yun\s+Che(?=[^\p{L}\p{N}]|$)/gui, 'Vân Triệt'],
    [/(?<=^|[^\p{L}\p{N}])Han\s+Li(?=[^\p{L}\p{N}]|$)/gui, 'Hàn Lập'],
    [/(?<=^|[^\p{L}\p{N}])Fang\s+Yuan(?=[^\p{L}\p{N}]|$)/gui, 'Phương Nguyên'],
    [/(?<=^|[^\p{L}\p{N}])Zhuo\s+Fan(?=[^\p{L}\p{N}]|$)/gui, 'Trác Phàm'],
    [/(?<=^|[^\p{L}\p{N}])Yang\s+Kai(?=[^\p{L}\p{N}]|$)/gui, 'Dương Khai'],
    [/(?<=^|[^\p{L}\p{N}])Bai\s+Xiao[- ]?chun(?=[^\p{L}\p{N}]|$)/gui, 'Bạch Tiểu Thuần'],
    [/(?<=^|[^\p{L}\p{N}])Meng\s+Hao(?=[^\p{L}\p{N}]|$)/gui, 'Mạnh Hạo'],
    [/(?<=^|[^\p{L}\p{N}])Chu\s+Yang(?=[^\p{L}\p{N}]|$)/gui, 'Sở Dương'],
    [/(?<=^|[^\p{L}\p{N}])Wang\s+Lin(?=[^\p{L}\p{N}]|$)/gui, 'Vương Lâm'],
    [/(?<=^|[^\p{L}\p{N}])Nie\s+Li(?=[^\p{L}\p{N}]|$)/gui, 'Nhiếp Ly'],
    [/(?<=^|[^\p{L}\p{N}])Chen\s+Bei[- ]?xuan(?=[^\p{L}\p{N}]|$)/gui, 'Trần Bắc Huyền'],
    [/(?<=^|[^\p{L}\p{N}])Ye\s+Chen(?=[^\p{L}\p{N}]|$)/gui, 'Diệp Thần'],
    [/(?<=^|[^\p{L}\p{N}])Ye\s+Fan(?=[^\p{L}\p{N}]|$)/gui, 'Diệp Phàm'],
    [/(?<=^|[^\p{L}\p{N}])Qin\s+Yu(?=[^\p{L}\p{N}]|$)/gui, 'Tần Vũ'],
    [/(?<=^|[^\p{L}\p{N}])Mu\s+Chen(?=[^\p{L}\p{N}]|$)/gui, 'Mục Trần'],
    [/(?<=^|[^\p{L}\p{N}])Dantian(?=[^\p{L}\p{N}]|$)/gui, 'Đan Điền'],
    [/(?<=^|[^\p{L}\p{N}])Qi\s*Sea(?=[^\p{L}\p{N}]|$)/gui, 'Khí Hải'],
    [/(?<=^|[^\p{L}\p{N}])Heavenly\s+Tribulation(?=[^\p{L}\p{N}]|$)/gui, 'Thiên Kiếp'],
    [/(?<=^|[^\p{L}\p{N}])Spiritual\s+Root(?=[^\p{L}\p{N}]|$)/gui, 'Linh Căn'],
    [/(?<=^|[^\p{L}\p{N}])Immortal(?=[^\p{L}\p{N}]|$)/gui, 'Tiên nhân'],
  ],

  // 2. Manhwa Thợ Săn / Hệ Thống / Hồi Quy
  thosan: [
    [/(?<=^|[^\p{L}\p{N}])Sung\s+Jin[- ]?woo(?=[^\p{L}\p{N}]|$)/gui, 'Sung Jin U'],
    [/(?<=^|[^\p{L}\p{N}])Cha\s+Hae[- ]?in(?=[^\p{L}\p{N}]|$)/gui, 'Cha Hae In'],
    [/(?<=^|[^\p{L}\p{N}])Kim\s+Dok[- ]?ja(?=[^\p{L}\p{N}]|$)/gui, 'Kim Đốc Cha'],
    [/(?<=^|[^\p{L}\p{N}])Han\s+Soo[- ]?young(?=[^\p{L}\p{N}]|$)/gui, 'Han Su Dương'],
    [/(?<=^|[^\p{L}\p{N}])Yoo\s+Joong[- ]?hyuk(?=[^\p{L}\p{N}]|$)/gui, 'Du Trung Hách'],
    [/(?<=^|[^\p{L}\p{N}])Arthur\s+Leywin(?=[^\p{L}\p{N}]|$)/gui, 'Át-thơ Lay-uyn'],
    [/(?<=^|[^\p{L}\p{N}])Tessia(?=[^\p{L}\p{N}]|$)/gui, 'Tét-xi-a'],
    [/(?<=^|[^\p{L}\p{N}])Sylvie(?=[^\p{L}\p{N}]|$)/gui, 'Sin-vi'],
    [/(?<=^|[^\p{L}\p{N}])Cheon\s+Yeo[- ]?woon(?=[^\p{L}\p{N}]|$)/gui, 'Thiên Như Vân'],
    [/(?<=^|[^\p{L}\p{N}])Chung\s+Myung(?=[^\p{L}\p{N}]|$)/gui, 'Thanh Minh'],
    [/(?<=^|[^\p{L}\p{N}])Sung\s+Su[- ]?ho(?=[^\p{L}\p{N}]|$)/gui, 'Sung Su Hô'],
    [/(?<=^|[^\p{L}\p{N}])Baam(?=[^\p{L}\p{N}]|$)/gui, 'Ba-am'],
    [/(?<=^|[^\p{L}\p{N}])Khun(?=[^\p{L}\p{N}]|$)/gui, 'Khum'],
    [/(?<=^|[^\p{L}\p{N}])Rak(?=[^\p{L}\p{N}]|$)/gui, 'Rắc'],
    [/(?<=^|[^\p{L}\p{N}])Shadow\s+Monarch(?=[^\p{L}\p{N}]|$)/gui, 'Chúa Tể Bóng Tối'],
    [/(?<=^|[^\p{L}\p{N}])Monarch(?=[^\p{L}\p{N}]|$)/gui, 'Quân Vương'],
    [/(?<=^|[^\p{L}\p{N}])Ruler(?=[^\p{L}\p{N}]|$)/gui, 'Kẻ Thống Trị'],
    [/(?<=^|[^\p{L}\p{N}])Constellation(?=[^\p{L}\p{N}]|$)/gui, 'Tinh Tọa'],
    [/(?<=^|[^\p{L}\p{N}])Incarnation(?=[^\p{L}\p{N}]|$)/gui, 'Hóa Thân'],
    [/(?<=^|[^\p{L}\p{N}])Dungeon\s+Break(?=[^\p{L}\p{N}]|$)/gui, 'Vỡ cổng hầm ngục'],
    [/(?<=^|[^\p{L}\p{N}])Status\s+Window(?=[^\p{L}\p{N}]|$)/gui, 'Bảng trạng thái'],
    [/(?<=^|[^\p{L}\p{N}])Awakening(?=[^\p{L}\p{N}]|$)/gui, 'Thức tỉnh'],
    [/(?<=^|[^\p{L}\p{N}])Shadow\s+Soldier(?=[^\p{L}\p{N}]|$)/gui, 'Lính bóng tối'],
    [/(?<=^|[^\p{L}\p{N}])Igris(?=[^\p{L}\p{N}]|$)/gui, 'I-gơ-rít'],
    [/(?<=^|[^\p{L}\p{N}])Beru(?=[^\p{L}\p{N}]|$)/gui, 'Bê-ru'],
    [/(?<=^|[^\p{L}\p{N}])Iron(?=[^\p{L}\p{N}]|$)/gui, 'Ai-rơn'],
  ],

  // 3. Manga Shonen / Isekai / Chuyển Sinh
  shonen: [
    [/(?<=^|[^\p{L}\p{N}])Luffy(?=[^\p{L}\p{N}]|$)/gui, 'Lúp-phi'],
    [/(?<=^|[^\p{L}\p{N}])Zoro(?=[^\p{L}\p{N}]|$)/gui, 'Zô-rô'],
    [/(?<=^|[^\p{L}\p{N}])Sanji(?=[^\p{L}\p{N}]|$)/gui, 'San-ji'],
    [/(?<=^|[^\p{L}\p{N}])Naruto(?=[^\p{L}\p{N}]|$)/gui, 'Na-ru-tô'],
    [/(?<=^|[^\p{L}\p{N}])Sasuke(?=[^\p{L}\p{N}]|$)/gui, 'Sa-su-kê'],
    [/(?<=^|[^\p{L}\p{N}])Kakashi(?=[^\p{L}\p{N}]|$)/gui, 'Ka-ka-si'],
    [/(?<=^|[^\p{L}\p{N}])Itachi(?=[^\p{L}\p{N}]|$)/gui, 'I-ta-chi'],
    [/(?<=^|[^\p{L}\p{N}])Gojo\s+Satoru(?=[^\p{L}\p{N}]|$)/gui, 'Gô-giô Sa-tô-ru'],
    [/(?<=^|[^\p{L}\p{N}])Sukuna(?=[^\p{L}\p{N}]|$)/gui, 'Su-ku-na'],
    [/(?<=^|[^\p{L}\p{N}])Yuji\s+Itadori(?=[^\p{L}\p{N}]|$)/gui, 'I-ta-đô-ri'],
    [/(?<=^|[^\p{L}\p{N}])Megumi(?=[^\p{L}\p{N}]|$)/gui, 'Mê-gu-mi'],
    [/(?<=^|[^\p{L}\p{N}])Nobara(?=[^\p{L}\p{N}]|$)/gui, 'Nô-ba-ra'],
    [/(?<=^|[^\p{L}\p{N}])Rimuru\s+Tempest(?=[^\p{L}\p{N}]|$)/gui, 'Ri-mu-ru Tem-pét'],
    [/(?<=^|[^\p{L}\p{N}])Tanjiro(?=[^\p{L}\p{N}]|$)/gui, 'Tan-ji-rô'],
    [/(?<=^|[^\p{L}\p{N}])Nezuko(?=[^\p{L}\p{N}]|$)/gui, 'Nê-zu-kô'],
    [/(?<=^|[^\p{L}\p{N}])Zenitsu(?=[^\p{L}\p{N}]|$)/gui, 'Zê-nít-xừ'],
    [/(?<=^|[^\p{L}\p{N}])Inosuke(?=[^\p{L}\p{N}]|$)/gui, 'I-nô-sư-kê'],
    [/(?<=^|[^\p{L}\p{N}])Muzan(?=[^\p{L}\p{N}]|$)/gui, 'Mu-zan'],
    [/(?<=^|[^\p{L}\p{N}])Deku(?=[^\p{L}\p{N}]|$)/gui, 'Đê-ku'],
    [/(?<=^|[^\p{L}\p{N}])Bakugo(?=[^\p{L}\p{N}]|$)/gui, 'Ba-ku-gô'],
    [/(?<=^|[^\p{L}\p{N}])All\s+Might(?=[^\p{L}\p{N}]|$)/gui, 'On Mít'],
    [/(?<=^|[^\p{L}\p{N}])Denji(?=[^\p{L}\p{N}]|$)/gui, 'Đen-ji'],
    [/(?<=^|[^\p{L}\p{N}])Makima(?=[^\p{L}\p{N}]|$)/gui, 'Ma-ki-ma'],
    [/(?<=^|[^\p{L}\p{N}])Asta(?=[^\p{L}\p{N}]|$)/gui, 'A-xta'],
    [/(?<=^|[^\p{L}\p{N}])Yuno(?=[^\p{L}\p{N}]|$)/gui, 'Yu-nô'],
    [/(?<=^|[^\p{L}\p{N}])Saitama(?=[^\p{L}\p{N}]|$)/gui, 'Sai-ta-ma'],
    [/(?<=^|[^\p{L}\p{N}])Genos(?=[^\p{L}\p{N}]|$)/gui, 'Gê-nốt'],
    [/(?<=^|[^\p{L}\p{N}])Eren\s+Yeager(?=[^\p{L}\p{N}]|$)/gui, 'Ê-ren Dê-gơ'],
    [/(?<=^|[^\p{L}\p{N}])Levi\s+Ackerman(?=[^\p{L}\p{N}]|$)/gui, 'Li-vai Ác-cơ-man'],
    [/(?<=^|[^\p{L}\p{N}])Rudeus(?=[^\p{L}\p{N}]|$)/gui, 'Ru-đê-út'],
    [/(?<=^|[^\p{L}\p{N}])Anos\s+Voldigoad(?=[^\p{L}\p{N}]|$)/gui, 'A-nót Vôn-đi-gốt'],
    [/(?<=^|[^\p{L}\p{N}])Shadow\s+Garden(?=[^\p{L}\p{N}]|$)/gui, 'Tổ chức Bóng Tối'],
    [/(?<=^|[^\p{L}\p{N}])Cid\s+Kagenou(?=[^\p{L}\p{N}]|$)/gui, 'Sít Ka-gê-nô'],
  ],

  // 4. Đô Thị / Giang Hồ / Học Đường / Báo Thù
  dothi: [
    [/(?<=^|[^\p{L}\p{N}])Park\s+Hyung[- ]?suk(?=[^\p{L}\p{N}]|$)/gui, 'Pắc Hiêng Súc'],
    [/(?<=^|[^\p{L}\p{N}])Gun\s+Park(?=[^\p{L}\p{N}]|$)/gui, 'Găn Pắc'],
    [/(?<=^|[^\p{L}\p{N}])Goo\s+Kim(?=[^\p{L}\p{N}]|$)/gui, 'Gu Kim'],
    [/(?<=^|[^\p{L}\p{N}])DG(?=[^\p{L}\p{N}]|$)/gui, 'Đi Gi'],
    [/(?<=^|[^\p{L}\p{N}])Jay\s+Jo(?=[^\p{L}\p{N}]|$)/gui, 'Dây Giô'],
    [/(?<=^|[^\p{L}\p{N}])Vin\s+Jin(?=[^\p{L}\p{N}]|$)/gui, 'Vin Gin'],
    [/(?<=^|[^\p{L}\p{N}])Vasco(?=[^\p{L}\p{N}]|$)/gui, 'Va-xcô'],
    [/(?<=^|[^\p{L}\p{N}])Zack\s+Lee(?=[^\p{L}\p{N}]|$)/gui, 'Zắc Ly'],
    [/(?<=^|[^\p{L}\p{N}])Daniel\s+Park(?=[^\p{L}\p{N}]|$)/gui, 'Đan-ni-en Pắc'],
    [/(?<=^|[^\p{L}\p{N}])Ijin\s+Yu(?=[^\p{L}\p{N}]|$)/gui, 'I-jin Du'],
    [/(?<=^|[^\p{L}\p{N}])Ha\s+Do[- ]?wan(?=[^\p{L}\p{N}]|$)/gui, 'Ha Đô Oan'],
    [/(?<=^|[^\p{L}\p{N}])Kang\s+Chan(?=[^\p{L}\p{N}]|$)/gui, 'Khang Chan'],
    [/(?<=^|[^\p{L}\p{N}])CEO(?=[^\p{L}\p{N}]|$)/gui, 'tổng giám đốc'],
    [/(?<=^|[^\p{L}\p{N}])President(?=[^\p{L}\p{N}]|$)/gui, 'chủ tịch'],
    [/(?<=^|[^\p{L}\p{N}])Mercenary(?=[^\p{L}\p{N}]|$)/gui, 'lính đánh thuê'],
  ],

  // 5. Esports / Gaming / MMORPG
  gaming: [
    [/(?<=^|[^\p{L}\p{N}])Gacha(?=[^\p{L}\p{N}]|$)/gui, 'quay tướng'],
    [/(?<=^|[^\p{L}\p{N}])DPS(?=[^\p{L}\p{N}]|$)/gui, 'sát thương theo giây'],
    [/(?<=^|[^\p{L}\p{N}])AoE(?=[^\p{L}\p{N}]|$)/gui, 'sát thương diện rộng'],
    [/(?<=^|[^\p{L}\p{N}])PK(?=[^\p{L}\p{N}]|$)/gui, 'đấu tay đôi'],
    [/(?<=^|[^\p{L}\p{N}])PvP(?=[^\p{L}\p{N}]|$)/gui, 'người đấu người'],
    [/(?<=^|[^\p{L}\p{N}])PvE(?=[^\p{L}\p{N}]|$)/gui, 'đánh quái'],
    [/(?<=^|[^\p{L}\p{N}])Cooldown(?=[^\p{L}\p{N}]|$)/gui, 'thời gian hồi chiêu'],
    [/(?<=^|[^\p{L}\p{N}])CD(?=[^\p{L}\p{N}]|$)/gui, 'thời gian hồi chiêu'],
    [/(?<=^|[^\p{L}\p{N}])Kiting(?=[^\p{L}\p{N}]|$)/gui, 'thả diều'],
    [/(?<=^|[^\p{L}\p{N}])Stun(?=[^\p{L}\p{N}]|$)/gui, 'làm choáng'],
    [/(?<=^|[^\p{L}\p{N}])Healer(?=[^\p{L}\p{N}]|$)/gui, 'trị liệu'],
    [/(?<=^|[^\p{L}\p{N}])Tanker(?=[^\p{L}\p{N}]|$)/gui, 'đỡ đòn'],
    [/(?<=^|[^\p{L}\p{N}])Carry(?=[^\p{L}\p{N}]|$)/gui, 'gánh đội'],
    [/(?<=^|[^\p{L}\p{N}])Ultimate(?=[^\p{L}\p{N}]|$)/gui, 'chiêu cuối'],
    [/(?<=^|[^\p{L}\p{N}])Ulti(?=[^\p{L}\p{N}]|$)/gui, 'chiêu cuối'],
    [/(?<=^|[^\p{L}\p{N}])Drop\s+rate(?=[^\p{L}\p{N}]|$)/gui, 'tỷ lệ rơi đồ'],
  ],
};

// Global common gaming/manga acronyms and ranks using safe regex
const COMMON_RECAP_RULES = [
  [/(?<=^|[^\p{L}\p{N}])(chap|chapter)\s*(\d+)(?=[^\p{L}\p{N}]|$)/gui, 'chương $2'],
  [/(?<=^|[^\p{L}\p{N}])(lv|lvl|level)\s*(\d+)(?=[^\p{L}\p{N}]|$)/gui, 'cấp $2'],
  [/(?<=^|[^\p{L}\p{N}])(SSS)\s*[- ]?(?:rank|hạng)?(?=[^\p{L}\p{N}]|$)/gui, 'hạng tam ét'],
  [/(?<=^|[^\p{L}\p{N}])(SS)\s*[- ]?(?:rank|hạng)?(?=[^\p{L}\p{N}]|$)/gui, 'hạng kép ét'],
  [/(?<=^|[^\p{L}\p{N}])([SABCDEF])\s*[- ]?(?:rank|hạng)(?=[^\p{L}\p{N}]|$)/gui, (m, p1) => `hạng ${p1.toUpperCase()}`],
  [/(?<=^|[^\p{L}\p{N}])HP(?=[^\p{L}\p{N}]|$)/gui, 'máu'],
  [/(?<=^|[^\p{L}\p{N}])MP(?=[^\p{L}\p{N}]|$)/gui, 'năng lượng'],
  [/(?<=^|[^\p{L}\p{N}])EXP(?=[^\p{L}\p{N}]|$)/gui, 'kinh nghiệm'],
  [/(?<=^|[^\p{L}\p{N}])NPC(?=[^\p{L}\p{N}]|$)/gui, 'nhân vật phụ'],
  [/(?<=^|[^\p{L}\p{N}])MC(?=[^\p{L}\p{N}]|$)/gui, 'nhân vật chính'],
  [/(?<=^|[^\p{L}\p{N}])OP(?=[^\p{L}\p{N}]|$)/gui, 'bá đạo'],
  [/(?<=^|[^\p{L}\p{N}])boss(?=[^\p{L}\p{N}]|$)/gui, 'trùm'],
  [/(?<=^|[^\p{L}\p{N}])buff(?=[^\p{L}\p{N}]|$)/gui, 'tăng sức mạnh'],
  [/(?<=^|[^\p{L}\p{N}])nerf(?=[^\p{L}\p{N}]|$)/gui, 'giảm sức mạnh'],
  [/(?<=^|[^\p{L}\p{N}])solo(?=[^\p{L}\p{N}]|$)/gui, 'đấu đơn'],
  [/(?<=^|[^\p{L}\p{N}])gate(?=[^\p{L}\p{N}]|$)/gui, 'cổng hầm ngục'],
  [/(?<=^|[^\p{L}\p{N}])dungeon(?=[^\p{L}\p{N}]|$)/gui, 'hầm ngục'],
  [/(?<=^|[^\p{L}\p{N}])guild(?=[^\p{L}\p{N}]|$)/gui, 'bang hội'],
  [/(?<=^|[^\p{L}\p{N}])hunter(?=[^\p{L}\p{N}]|$)/gui, 'thợ săn'],
  [/(?<=^|[^\p{L}\p{N}])item(?=[^\p{L}\p{N}]|$)/gui, 'vật phẩm'],
  [/(?<=^|[^\p{L}\p{N}])skill(?=[^\p{L}\p{N}]|$)/gui, 'kỹ năng'],
  [/(?<=^|[^\p{L}\p{N}])mana(?=[^\p{L}\p{N}]|$)/gui, 'ma lực'],
  [/(?<=^|[^\p{L}\p{N}])stat(?=[^\p{L}\p{N}]|$)/gui, 'chỉ số'],
  [/(?<=^|[^\p{L}\p{N}])status(?=[^\p{L}\p{N}]|$)/gui, 'bảng trạng thái'],
  [/(?<=^|[^\p{L}\p{N}])quest(?=[^\p{L}\p{N}]|$)/gui, 'nhiệm vụ'],
];

/**
 * Clean and normalize text before Edge Neural TTS synthesis
 * @param {string} text - Raw input text
 * @param {Object} [options]
 * @param {string} [options.genre] - 'tutien' | 'thosan' | 'shonen' | 'dothi' | 'gaming'
 * @param {Array<{term: string, reading: string}>} [options.customDictionary] - User custom rules
 */
export function normalizeRecapText(text, options = {}) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove script director notes: *🎨 [Trang 1 • Panel 1]*, *🎵 [BGM: Hào Hùng]*, *💡 [SFX]*
  cleaned = cleaned.replace(/\*🎨.*?\*/g, '');
  cleaned = cleaned.replace(/\*🎵.*?\*/g, '');
  cleaned = cleaned.replace(/\*💡.*?\*/g, '');
  cleaned = cleaned.replace(/\*\*\[.*?\]\*\*:?/g, '');
  cleaned = cleaned.replace(/\[\/?(Dẫn Chuyện|Nhân vật|Phản Diện|Gợi Ý|BGM|SFX|Audio|Speaker|Trang \d+|Panel \d+).*?\]:?/gi, '');

  // 2. Remove script annotations in brackets: [Cười], (hét lớn), 【thở dài】
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/【[^】]*】/g, ' ');

  // 3. Remove Markdown formatting
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // 4. Remove emojis
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // 5. Apply User Project-Specific Custom Rules First (Highest Priority)
  if (Array.isArray(options.customDictionary) && options.customDictionary.length > 0) {
    for (const rule of options.customDictionary) {
      if (rule.term && rule.reading) {
        try {
          const escapedTerm = rule.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(?<=^|[^\\p{L}\\p{N}])${escapedTerm}(?=[^\\p{L}\\p{N}]|$)`, 'gui');
          cleaned = cleaned.replace(regex, rule.reading);
        } catch (e) {}
      }
    }
  }

  // 6. Apply Specific Genre Dictionary & Recap Terminology ONLY for Vietnamese voices
  const isVietnameseVoice = !options.voice || options.voice.startsWith('vi-');
  if (isVietnameseVoice) {
    if (options.genre && GENRE_DICTIONARIES[options.genre]) {
      for (const [pattern, replacement] of GENRE_DICTIONARIES[options.genre]) {
        cleaned = cleaned.replace(pattern, replacement);
      }
    } else {
      // Scan all genre dictionaries
      for (const genreKey in GENRE_DICTIONARIES) {
        for (const [pattern, replacement] of GENRE_DICTIONARIES[genreKey]) {
          cleaned = cleaned.replace(pattern, replacement);
        }
      }
    }

    // 7. Apply Common Recap Terminology Rules
    for (const [pattern, replacement] of COMMON_RECAP_RULES) {
      cleaned = cleaned.replace(pattern, replacement);
    }
  }

  // 8. Handle breathing pauses and punctuation
  // Ellipses "..." often cause long awkward silence; replace with comma for dramatic suspense
  cleaned = cleaned.replace(/\.{3,}/g, ', ');
  cleaned = cleaned.replace(/…/g, ', ');
  cleaned = cleaned.replace(/[;:]/g, ', ');

  // Clean excessive spaces and newlines
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Split long script text into natural sentence chunks (< 800 chars) for smooth streaming
 */
export function splitTextIntoChunks(text, maxChars = 800) {
  if (!text) return [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
