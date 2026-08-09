/**
 * MangaStoryKnowledgeEngine.js
 * Universal Multi-Genre Manga Storytelling & Visual Narrative Synthesizer
 * 
 * Supports ANY manga / manhwa / manhua / comic in the world across all genres:
 * - Thợ Săn / Hệ Thống / Thức Tỉnh (Hunter / System)
 * - Tu Tiên / Huyền Huyễn / Kiếm Hiệp (Cultivation / Wuxia)
 * - Isekai / Chuyển Sinh / Ma Pháp (Isekai / Fantasy)
 * - Trùng Sinh / Báo Thù / Vả Mặt (Regression / Revenge)
 * - Bạo Lực Học Đường / Đô Thị (School Action / Urban)
 * - Kinh Dị / Sinh Tồn (Horror / Survival)
 * - Ngôn Tình / Drama (Romance / Drama)
 * - Trinh Thám / Đấu Trí (Mystery / Mind Game)
 * - Shonen / Phiêu Lưu Tổng Hợp (General Shonen / Adventure)
 */

export const GENRE_CONFIGS = {
  hunter_system: {
    name: 'Thợ Săn / Hệ Thống / Thức Tỉnh',
    keywords: ['hunter', 'hệ thống', 'thức tỉnh', 'hầm ngục', 'dungeon', 'gate', 'cổng', 'quái vật', 'ma lực', 'cấp e', 'cấp s', 'level', 'player', 'solo', 'thăng cấp'],
    visualTrope: 'Hầm ngục u tối với làn sương ma pháp lơ lửng, quái vật hung tợn gầm thét, ánh sáng xanh lục từ cửa sổ hệ thống phát sáng trước mắt nhân vật chính.',
    combatStyle: 'Những đòn vung dao găm xé gió, ma lực đen tím bùng nổ bao phủ toàn thân, tốc độ di chuyển vượt qua giới hạn âm thanh.',
    sfxBgm: '[BGM: Nhạc điện tử dồn dập, tiếng bass đập mạnh theo từng bước chân]',
  },
  cultivation_wuxia: {
    name: 'Tu Tiên / Huyền Huyễn / Kiếm Hiệp',
    keywords: ['tu tiên', 'tu chân', 'kiếm hiệp', 'tông môn', 'đan điền', 'độ kiếp', 'linh khí', 'chưởng môn', 'sư phụ', 'đệ tử', 'linh thạch', 'võ đạo', 'võ luyện', 'đỉnh phong'],
    visualTrope: 'Mây mù bao phủ đỉnh núi tông môn hùng vĩ, linh khí cuồn cuộn hóa rồng bay lượn, kiếm khí sắc bén rực rỡ cắt đứt cả bầu trời.',
    combatStyle: 'Tung kiếm xuất chiêu với vạn đạo kiếm quang, đan điền bộc phát chân khí cuồng bạo làm rung chuyển cả càn khôn đại địa.',
    sfxBgm: '[BGM: Nhạc cổ phong hùng tráng kết hợp sáo trúc và tiếng trống trận]',
  },
  isekai_fantasy: {
    name: 'Isekai / Chuyển Sinh / Ma Pháp',
    keywords: ['isekai', 'chuyển sinh', 'xuyên không', 'thế giới khác', 'ma vương', 'dũng giả', 'ma pháp', 'nữ thần', 'ma pháp trận', 'yêu tinh', 'elf', 'long tộc'],
    visualTrope: 'Lục địa fantasy tráng lệ với các tòa lâu đài nguy nga, vòng tròn ma pháp phát sáng đa sắc dưới chân, những loài sinh vật huyền bí trong rừng sâu.',
    combatStyle: 'Niệm chú cổ ngữ kích hoạt đại ma pháp cấp cấm thuật, tia sét và ngọn lửa rực cháy thiêu rụi toàn bộ binh đoàn quái vật.',
    sfxBgm: '[BGM: Nhạc giao hưởng fantasy huyền ảo, đẩy dần nhịp độ kịch tính]',
  },
  regression_revenge: {
    name: 'Trùng Sinh / Báo Thù / Vả Mặt',
    keywords: ['trùng sinh', 'báo thù', 'hồi quy', 'sống lại', 'quá khứ', 'vả mặt', 'phản bội', 'kẻ thù', '10 năm trước', 'kiếp trước', 'tái sinh'],
    visualTrope: 'Khung tranh đối lập giữa cái chết thảm khốc của kiếp trước và ánh mắt lạnh lùng, sắc lẹm đầy sát khí khi mở mắt tỉnh lại ở quá khứ.',
    combatStyle: 'Ra tay quyết đoán, tính toán trước từng đường đi nước bước của kẻ địch khiến chúng rơi vào tuyệt vọng không kịp trở tay.',
    sfxBgm: '[BGM: Tiếng đàn cello u tối, nhịp tim đập nghẹt thở]',
  },
  school_urban: {
    name: 'Bạo Lực Học Đường / Đô Thị / Hành Động',
    keywords: ['học đường', 'đô thị', 'giang hồ', 'bạo lực', 'trường học', 'cảnh sát', 'băng đảng', 'giáo dục', 'chân chính', 'đầu gấu', 'quyền anh', 'đấm bốc'],
    visualTrope: 'Góc phố đêm ẩm ướt hoặc hành lang trường học căng thẳng, ánh đèn đường le lói soi rọi ánh mắt kiên định của nhân vật chính.',
    combatStyle: 'Những cú đấm móc uy lực, đòn bẻ khớp chuẩn xác và kỹ năng cận chiến thực dụng mang lại cảm giác thỏa mãn tột cùng.',
    sfxBgm: '[BGM: Nhạc rock đường phố sôi động, tiếng va chạm kim loại đanh thép]',
  },
  horror_survival: {
    name: 'Kinh Dị / Sinh Tồn / Thần Bí',
    keywords: ['kinh dị', 'sinh tồn', 'quỷ', 'ma', 'chú thuật', 'chú linh', 'bóng tối', 'ám ảnh', 'tử thần', 'ác mộng', 'máu me', 'thoát hiểm'],
    visualTrope: 'Tông màu đen trắng tương phản u uất, bóng ma dị dạng rình rập sau lưng nhân vật, những vết máu loang lổ trên tường.',
    combatStyle: 'Cuộc rượt đuổi nghẹt thở trong không gian hẹp, những đòn phản kháng liều mạng giữa lằn ranh sự sống và cái chết.',
    sfxBgm: '[BGM: Tiếng thì thầm ma quái, hiệu ứng âm thanh rùng rợn bất ngờ]',
  },
  romance_drama: {
    name: 'Ngôn Tình / Cung Đấu / Drama',
    keywords: ['ngôn tình', 'tổng tài', 'cung đấu', 'hoàng hậu', 'tình cảm', 'nữ phụ', 'tiểu thư', 'thiếu gia', 'hiểu lầm', 'ly hôn', 'hôn nhân'],
    visualTrope: 'Khung cảnh hoa lệ, ánh mắt chan chứa tình cảm hoặc giọt nước mắt rơi nghiêng của nhân vật nữ trong hoàng cung nguy nga.',
    combatStyle: 'Những màn đấu khẩu sắc sảo, vạch trần âm mưu thâm hiểm của kẻ gian và bảo vệ người mình yêu thương.',
    sfxBgm: '[BGM: Nhạc piano da diết, sâu lắng chạm đến cảm xúc]',
  },
  mystery_mindgame: {
    name: 'Trinh Thám / Đấu Trí',
    keywords: ['trinh thám', 'đấu trí', 'thám tử', 'vụ án', 'hung thủ', 'manh mối', 'suy luận', 'cờ vua', 'tâm lý', 'bẫy', 'kế hoạch'],
    visualTrope: 'Cận cảnh đôi mắt tập trung cao độ, các mảnh ghép manh mối xoay quanh tâm trí, ánh đèn bàn soi sáng hồ sơ vụ án.',
    combatStyle: 'Màn lật tẩy danh tính hung thủ với những lập luận sắc bén không tì vết, ép đối phương vào chân tường.',
    sfxBgm: '[BGM: Nhạc jazz trinh thám bí ẩn kết hợp tiếng gõ đồng hồ tích tắc]',
  },
  general_shonen: {
    name: 'Shonen / Phiêu Lưu Hành Động',
    keywords: ['phiêu lưu', 'shonen', 'hành động', 'đồng đội', 'bảo vệ', 'ước mơ', 'vua', 'đại hải trình', 'nhẫn giả', 'anh hùng'],
    visualTrope: 'Bầu trời rộng mở rực rỡ ánh bình minh, nụ cười tự tin của nhân vật chính cùng những người đồng đội kề vai sát cánh.',
    combatStyle: 'Bộc phát toàn bộ sức mạnh ý chí, tung tuyệt kỹ tối thượng phá tan mọi rào cản và đánh bại kẻ thù.',
    sfxBgm: '[BGM: Nhạc anime hào hùng truyền cảm hứng mãnh liệt]',
  },
};

/**
 * Universal Genre Auto-Detector based on title, dialogues, and keywords
 */
export function detectMangaGenre(seriesName = '', dialogues = [], manualGenre = null) {
  if (manualGenre && GENRE_CONFIGS[manualGenre]) {
    return { genreKey: manualGenre, config: GENRE_CONFIGS[manualGenre] };
  }

  const combinedText = `${seriesName} ${dialogues.map((d) => d.text || '').join(' ')}`.toLowerCase();

  let bestMatch = 'general_shonen';
  let highestScore = 0;

  for (const [key, conf] of Object.entries(GENRE_CONFIGS)) {
    let score = 0;
    for (const kw of conf.keywords) {
      if (combinedText.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = key;
    }
  }

  return { genreKey: bestMatch, config: GENRE_CONFIGS[bestMatch] };
}

/**
 * Filter out dummy OCR placeholder strings
 */
export function cleanRawDialogues(dialogues = []) {
  if (!Array.isArray(dialogues)) return [];
  const bannedKeywords = [
    'quét chữ thật',
    'quet chu that',
    'bấm "',
    'bam "',
    'trích xuất văn bản',
    'phân đoạn của trang',
    'phan doan cua trang',
  ];

  return dialogues.filter((d) => {
    const text = (d.text || d.translatedText || '').toLowerCase().trim();
    if (!text || text.length < 2) return false;
    return !bannedKeywords.some((bk) => text.includes(bk));
  });
}

/**
 * Universal Storytelling Script Generator for ANY manga/comic in the world
 */
export function generateUniversalMangaScript({
  seriesName = 'Bộ Truyện Tuyệt Đỉnh',
  chapterNumber = 1,
  mode = 'review',
  dialogues = [],
  customPrompt = '',
  genre = null,
  protagonist = '',
}) {
  const cleanDialogues = cleanRawDialogues(dialogues);
  const chap = Number(chapterNumber) || 1;
  const { genreKey, config } = detectMangaGenre(seriesName, cleanDialogues, genre);
  const heroName = protagonist || (cleanDialogues[0]?.speaker && cleanDialogues[0].speaker !== 'Dẫn Chuyện' ? cleanDialogues[0].speaker : 'Nhân Vật Chính');

  let script = `# 🎬 KỊCH BẢN REVIEW AI (${mode.toUpperCase()}): ${seriesName.toUpperCase()} CHAPTER ${chap}\n`;
  script += `> 📌 **Thể Loại**: ${config.name} | **Phong Cách Video**: Chuẩn YouTube / TikTok Triệu View\n`;
  script += `> 🎵 **Định Hướng Âm Thanh**: ${config.sfxBgm}\n\n`;

  // Act 1: 5s Viral Hook
  script += `## 🎯 PHÂN ĐOẠN 1: HOOK MỞ ĐẦU GIỮ CHÂN (5s Đầu)\n`;
  script += `**[Dẫn Chuyện]**: "Khoan đã! Bạn có tin rằng chỉ trong Chapter ${chap} này, một biến cố kinh hoàng đã làm đảo lộn hoàn toàn vận mệnh của ${heroName} không? Chào mừng các bạn đến với TunaMagaRecap! Hôm nay chúng ta sẽ cùng thưởng thức siêu phẩm ${seriesName} với những tình tiết bùng nổ nhất!"\n\n`;

  // Act 2: Worldbuilding & Visual Setup
  script += `## 🏰 PHÂN ĐOẠN 2: BỐI CẢNH & KHỞI ĐẦU CUỘC CHẠM TRÁN\n`;
  script += `*🎨 [Hình Ảnh & Bối Cảnh]*: ${config.visualTrope} Từng khung tranh mở ra khung cảnh tráng lệ nhưng cũng đầy căng thẳng, báo hiệu một cơn bão sắp ập tới.\n`;
  script += `**[Dẫn Chuyện]**: "Mở đầu Chapter ${chap}, nhịp truyện ngay lập tức được đẩy lên cao trào khi các nhân vật bước vào tình thế ngàn cân treo sợi tóc. Mọi ánh nhìn đều đổ dồn về phía ${heroName}."\n\n`;

  // Act 3: Core Conflict & OCR Dialogues
  script += `## ⚔️ PHÂN ĐOẠN 3: DIỄN BIẾN CAO TRÀO & XUNG ĐỘT TỘT ĐỈNH\n`;
  script += `*🎨 [Hình Ảnh Hành Động]*: ${config.combatStyle}\n\n`;

  if (cleanDialogues.length > 0) {
    cleanDialogues.slice(0, 8).forEach((d) => {
      const spk = d.speaker && d.speaker !== 'Nhân vật' ? d.speaker : heroName;
      script += `**[Trang ${d.pageIndex || 1} - ${spk}]**: "${d.text || d.translatedText}"\n\n`;
    });
  } else {
    script += `**[${heroName}]**: "Dù đối thủ có là ai đi chăng nữa, hôm nay ta tuyệt đối sẽ không lùi bước!"\n\n`;
    script += `**[Kẻ Địch]**: "Hừ! Ngươi nghĩ mình có đủ tư cách để đứng trước mặt ta sao? Hãy nếm thử sức mạnh thực sự đi!"\n\n`;
  }

  // Act 4: Turning Point & Power Scaling Analysis
  script += `## 📊 PHÂN ĐOẠN 4: CÚ LẬT KÈO NGOẠN MỤC & PHÂN TÍCH CHIẾN THUẬT\n`;
  script += `**[Dẫn Chuyện]**: "Chính vào khoảnh khắc kẻ thù tưởng chừng đã nắm chắc phần thắng, một biến số bất ngờ đã xuất hiện! Sự kết hợp hoàn hảo giữa ý chí sắt đá và khả năng phân tích nhạy bén đã giúp ${heroName} xoay chuyển tình thế một cách ngoạn mục!"\n\n`;

  // Act 5: Cliffhanger & CTA
  script += `## 🔔 PHÂN ĐOẠN 5: HỒI KẾT KỊCH TÍNH & KÊU GỌI ĐĂNG KÝ (CLIFFHANGER)\n`;
  script += `**[Dẫn Chuyện]**: "Trận chiến Chapter ${chap} tạm thời khép lại với nụ cười bí ẩn, nhưng một bí mật đen tối hơn đang chờ đón chúng ta ở Chapter ${chap + 1}. Bạn dự đoán điều gì sẽ xảy ra tiếp theo? Hãy để lại BÌNH LUẬN bên dưới, bấm LIKE và ĐĂNG KÝ KÊNH 🔔 để không bỏ lỡ video recap mới nhất trên TunaMagaRecap nhé! Xin chào và hẹn gặp lại!"\n`;

  return script;
}
