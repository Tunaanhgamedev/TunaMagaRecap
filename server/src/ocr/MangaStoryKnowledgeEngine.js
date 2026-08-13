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
    actionBeats: [
      'Góc máy lia nhanh từ dưới lên, bắt trọn khoảnh khắc nhân vật chính né đòn vuốt quái vật trong gang tấc.',
      'Hiệu ứng ma lực tím đen bùng nổ, từng đòn chém chuẩn xác phá hủy lõi ma thạch của quái vật.',
      'Cửa sổ thông báo hệ thống nhấp nháy liên tục, các chỉ số sức mạnh tăng vọt ngoài tầm kiểm soát.',
      'Đôi mắt nhân vật chính phát ra luồng sáng xanh sắc lạnh, áp lực ma lực đè bẹp toàn bộ đối thủ trong khu vực.',
    ],
  },
  cultivation_wuxia: {
    name: 'Tu Tiên / Huyền Huyễn / Kiếm Hiệp',
    keywords: ['tu tiên', 'tu chân', 'kiếm hiệp', 'tông môn', 'đan điền', 'độ kiếp', 'linh khí', 'chưởng môn', 'sư phụ', 'đệ tử', 'linh thạch', 'võ đạo', 'võ luyện', 'đỉnh phong'],
    visualTrope: 'Mây mù bao phủ đỉnh núi tông môn hùng vĩ, linh khí cuồn cuộn hóa rồng bay lượn, kiếm khí sắc bén rực rỡ cắt đứt cả bầu trời.',
    combatStyle: 'Tung kiếm xuất chiêu với vạn đạo kiếm quang, đan điền bộc phát chân khí cuồng bạo làm rung chuyển cả càn khôn đại địa.',
    sfxBgm: '[BGM: Nhạc cổ phong hùng tráng kết hợp sáo trúc và tiếng trống trận]',
    actionBeats: [
      'Vạn đạo kiếm quang xoay quanh thân thể, kiếm khí rạch nát không gian lao thẳng về phía kẻ thù.',
      'Linh lực trong đan điền dâng trào như sóng thần, phá vỡ cảnh giới giam cầm bấy lâu nay.',
      'Chưởng phong cuồng bạo giáng xuống từ chín tầng mây, chấn động cả sơn hà tông môn.',
      'Ánh mắt uy nghiêm nhìn thấu hồng trần, chỉ một chỉ điểm ra đã dập tắt toàn bộ sát khí của địch nhân.',
    ],
  },
  isekai_fantasy: {
    name: 'Isekai / Chuyển Sinh / Ma Pháp',
    keywords: ['isekai', 'chuyển sinh', 'xuyên không', 'thế giới khác', 'ma vương', 'dũng giả', 'ma pháp', 'nữ thần', 'ma pháp trận', 'yêu tinh', 'elf', 'long tộc'],
    visualTrope: 'Lục địa fantasy tráng lệ với các tòa lâu đài nguy nga, vòng tròn ma pháp phát sáng đa sắc dưới chân, những loài sinh vật huyền bí trong rừng sâu.',
    combatStyle: 'Niệm chú cổ ngữ kích hoạt đại ma pháp cấp cấm thuật, tia sét và ngọn lửa rực cháy thiêu rụi toàn bộ binh đoàn quái vật.',
    sfxBgm: '[BGM: Nhạc giao hưởng fantasy huyền ảo, đẩy dần nhịp độ kịch tính]',
    actionBeats: [
      'Vòng tròn ma pháp nhiều tầng xoay chuyển dưới chân, ánh sáng rực rỡ soi sáng cả bầu trời đêm.',
      'Niệm nhanh cổ ngữ, ngọn lửa cấm thuật bùng cháy dữ dội thiêu rụi toàn bộ hàng phòng ngự đối phương.',
      'Các loại kỹ năng gian lận (cheat skills) kích hoạt đồng thời, thay đổi hoàn toàn quy luật của thế giới.',
      'Nụ cười tự tin khi đối mặt với ma vương, đòn kết liễu mang sức mạnh vượt trội giải phóng lục địa.',
    ],
  },
  regression_revenge: {
    name: 'Trùng Sinh / Báo Thù / Vả Mặt',
    keywords: ['trùng sinh', 'báo thù', 'hồi quy', 'sống lại', 'quá khứ', 'vả mặt', 'phản bội', 'kẻ thù', '10 năm trước', 'kiếp trước', 'tái sinh'],
    visualTrope: 'Khung tranh đối lập giữa cái chết thảm khốc của kiếp trước và ánh mắt lạnh lùng, sắc lẹm đầy sát khí khi mở mắt tỉnh lại ở quá khứ.',
    combatStyle: 'Ra tay quyết đoán, tính toán trước từng đường đi nước bước của kẻ địch khiến chúng rơi vào tuyệt vọng không kịp trở tay.',
    sfxBgm: '[BGM: Tiếng đàn cello u tối, nhịp tim đập nghẹt thở]',
    actionBeats: [
      'Ký ức kiếp trước ùa về trong tích tắc, từng bước đi của kẻ thù đều nằm trọn trong lòng bàn tay.',
      'Ra đòn dứt khoát không một động tác thừa, tước đi toàn bộ lợi thế mà kẻ phản bội đang tự mãn.',
      'Ánh mắt lạnh như băng giá nhìn kẻ thù ngã gục, từng món nợ máu năm xưa giờ đây được thanh toán sòng phẳng.',
      'Cười khẩy trước sự giãy giụa vô vọng của địch thủ, màn lật kèo vả mặt khiến người xem thỏa mãn tột độ.',
    ],
  },
  school_urban: {
    name: 'Bạo Lực Học Đường / Đô Thị / Hành Động',
    keywords: ['học đường', 'đô thị', 'giang hồ', 'bạo lực', 'trường học', 'cảnh sát', 'băng đảng', 'giáo dục', 'chân chính', 'đầu gấu', 'quyền anh', 'đấm bốc'],
    visualTrope: 'Góc phố đêm ẩm ướt hoặc hành lang trường học căng thẳng, ánh đèn đường le lói soi rọi ánh mắt kiên định của nhân vật chính.',
    combatStyle: 'Những cú đấm móc uy lực, đòn bẻ khớp chuẩn xác và kỹ năng cận chiến thực dụng mang lại cảm giác thỏa mãn tột cùng.',
    sfxBgm: '[BGM: Nhạc rock đường phố sôi động, tiếng va chạm kim loại đanh thép]',
    actionBeats: [
      'Cú đấm thẳng đầy uy lực phá tan thế phòng thủ, tiếng va chạm đanh thép dội vang khắp hành lang.',
      'Né đòn linh hoạt rồi bẻ khớp đối thủ trong chớp mắt, phong thái áp đảo của kẻ thống trị đường phố.',
      'Ánh mắt kiên định không hề chớp trước đám đông bao vây, từng tên một lần lượt ngã gục dưới chân.',
      'Đứng sừng sững giữa vòng vây kẻ địch, khẳng định uy quyền và trật tự mới cho toàn trường.',
    ],
  },
  horror_survival: {
    name: 'Kinh Dị / Sinh Tồn / Thần Bí',
    keywords: ['kinh dị', 'sinh tồn', 'quỷ', 'ma', 'chú thuật', 'chú linh', 'bóng tối', 'ám ảnh', 'tử thần', 'ác mộng', 'máu me', 'thoát hiểm'],
    visualTrope: 'Tông màu đen trắng tương phản u uất, bóng ma dị dạng rình rập sau lưng nhân vật, những vết máu loang lổ trên tường.',
    combatStyle: 'Cuộc rượt đuổi nghẹt thở trong không gian hẹp, những đòn phản kháng liều mạng giữa lằn ranh sự sống và cái chết.',
    sfxBgm: '[BGM: Tiếng thì thầm ma quái, hiệu ứng âm thanh rùng rợn bất ngờ]',
    actionBeats: [
      'Bóng đen dị dạng trườn dọc theo hành lang, tiếng thở dốc nghẹt thở khi trốn sau góc khuất.',
      'Khoảnh khắc giật mình kinh hãi khi quay đầu lại, đòn phản kháng trong vô thức xé toạc bóng tối.',
      'Những mảnh ghép bí ẩn dần hé lộ nguồn gốc lời nguyền kinh hoàng đang nuốt chửng từng nạn nhân.',
      'Chạy đua với thần chết từng giây từng phút để tìm ra lối thoát duy nhất còn sót lại.',
    ],
  },
  romance_drama: {
    name: 'Ngôn Tình / Cung Đấu / Drama',
    keywords: ['ngôn tình', 'tổng tài', 'cung đấu', 'hoàng hậu', 'tình cảm', 'nữ phụ', 'tiểu thư', 'thiếu gia', 'hiểu lầm', 'ly hôn', 'hôn nhân'],
    visualTrope: 'Khung cảnh hoa lệ, ánh mắt chan chứa tình cảm hoặc giọt nước mắt rơi nghiêng của nhân vật nữ trong hoàng cung nguy nga.',
    combatStyle: 'Những màn đấu khẩu sắc sảo, vạch trần âm mưu thâm hiểm của kẻ gian và bảo vệ người mình yêu thương.',
    sfxBgm: '[BGM: Nhạc piano da diết, sâu lắng chạm đến cảm xúc]',
    actionBeats: [
      'Ánh mắt giao nhau giữa vũ hội hoàng gia hoa lệ, rung động đầu tiên sau bao tháng ngày xa cách.',
      'Vạch trần bức màn âm mưu hãm hại bằng những chứng cứ đanh thép không thể chối cãi.',
      'Cái ôm siết chặt giữa cơn mưa giông, xóa tan mọi hiểu lầm và rào cản ngăn cách bấy lâu.',
      'Khẳng định vị thế độc tôn, khiến kẻ ác phải trả giá cho những dã tâm đã gây ra.',
    ],
  },
  mystery_mindgame: {
    name: 'Trinh Thám / Đấu Trí',
    keywords: ['trinh thám', 'đấu trí', 'thám tử', 'vụ án', 'hung thủ', 'manh mối', 'suy luận', 'cờ vua', 'tâm lý', 'bẫy', 'kế hoạch'],
    visualTrope: 'Cận cảnh đôi mắt tập trung cao độ, các mảnh ghép manh mối xoay quanh tâm trí, ánh đèn bàn soi sáng hồ sơ vụ án.',
    combatStyle: 'Màn lật tẩy danh tính hung thủ với những lập luận sắc bén không tì vết, ép đối phương vào chân tường.',
    sfxBgm: '[BGM: Nhạc jazz trinh thám bí ẩn kết hợp tiếng gõ đồng hồ tích tắc]',
    actionBeats: [
      'Từng chi tiết bất thường kết nối lại thành một chuỗi sự kiện hoàn chỉnh đến rùng mình.',
      'Ánh mắt bối rối của nghi phạm khi bị dồn vào góc tường bởi một câu hỏi mấu chốt.',
      'Màn giăng bẫy tâm lý đỉnh cao khiến thủ phạm tự để lộ sơ hở chí mạng mà không hề hay biết.',
      'Lời tuyên bố đanh thép vạch trần chân tướng sự thật trước sự ngỡ ngàng của tất cả mọi người.',
    ],
  },
  general_shonen: {
    name: 'Shonen / Phiêu Lưu Hành Động',
    keywords: ['phiêu lưu', 'shonen', 'hành động', 'đồng đội', 'bảo vệ', 'ước mơ', 'vua', 'đại hải trình', 'nhẫn giả', 'anh hùng'],
    visualTrope: 'Bầu trời rộng mở rực rỡ ánh bình minh, nụ cười tự tin của nhân vật chính cùng những người đồng đội kề vai sát cánh.',
export function generateUniversalMangaScript({
  seriesName = 'Bộ Truyện Tuyệt Đỉnh',
  chapterNumber = 1,
  mode = 'review',
  dialogues = [],
  pages = [],
  customPrompt = '',
  genre = null,
  protagonist = '',
}) {
  const chap = Number(chapterNumber) || 1;
  const cleanDialogues = cleanRawDialogues(dialogues);
  const { genreKey, config } = detectMangaGenre(seriesName, cleanDialogues, genre);
  const heroName = protagonist || (cleanDialogues[0]?.speaker && cleanDialogues[0].speaker !== 'Nhân vật' && cleanDialogues[0].speaker !== 'Dẫn Chuyện' ? cleanDialogues[0].speaker : 'Nhân Vật Chính');

  // Normalize pages data
  let allPages = [];
  if (Array.isArray(pages) && pages.length > 0) {
    allPages = pages;
  } else {
    const maxPage = Math.max(1, ...cleanDialogues.map((d) => d.pageIndex || 1));
    for (let pIdx = 1; pIdx <= maxPage; pIdx++) {
      const pageD = cleanDialogues.filter((d) => (d.pageIndex || 1) === pIdx);
      allPages.push({
        pageIndex: pIdx,
        panels: pageD.length > 0 ? pageD.map((d, i) => ({
          panelIndex: i + 1,
          suggestedCameraEffect: i % 2 === 0 ? 'dramatic_zoom' : 'pan_right',
          dialogues: [d],
        })) : [
          { panelIndex: 1, suggestedCameraEffect: 'dramatic_zoom', dialogues: [] },
          { panelIndex: 2, suggestedCameraEffect: 'pan_right', dialogues: [] },
        ],
      });
    }
  }

  const totalPages = allPages.length;
  const totalPanels = allPages.reduce((acc, p) => acc + (p.panels?.length || 2), 0);

  // Dynamic hype commentary templates per genre
  const hypeCommentaries = {
    hunter_system: [
      `Cửa sổ thông báo hệ thống phát sáng xanh rực trước mắt ${heroName}! Các chỉ số sức mạnh nổ tung ngoài tầm kiểm soát!`,
      `Nhìn vào vệt ma lực tím đen cuồn cuộn bao phủ thanh vũ khí kìa! Áp lực ma pháp khiến cả hầm ngục như muốn sụp đổ!`,
      `Kèo này tưởng chừng như là đường chết, nhưng đối thủ đâu có ngờ ${heroName} đang chuẩn bị tung ra đòn kết liễu chí mạng!`,
      `Sự kiêu ngạo của quái vật Boss lập tức biến thành sự kinh hãi! Pha vả mặt đỉnh cao khiến fan xem chỉ biết trầm ồ thỏa mãn!`,
      `Tốc độ di chuyển vượt mốc âm thanh! Từng cú vung đao chính xác đến rùng mình phá hủy hoàn toàn cốt lõi kẻ thù!`,
    ],
    cultivation_wuxia: [
      `Linh lực trong đan điền dâng trào như đại dương cuồng bạo! Vạn đạo kiếm quang rợp trời rạch nát hư không!`,
      `Địch nhân tưởng rằng mình là thiên tài tông môn có thể áp đảo, nhưng trước mặt ${heroName}, chúng chẳng khác nào dế mèn!`,
      `Chưởng phong dội xuống làm rung chuyển sơn hà! Thần thái ngạo nghễ nhìn thấu càn khôn của bậc đế vương!`,
      `Một đòn kiếm khí rực rỡ cắt đứt mọi hy vọng phản kháng! Cảnh giới bộc phát vượt xa tưởng tượng của toàn bộ chưởng lão!`,
      `Màn lật kèo quá đỗi mãn nhãn! Kẻ phản bội phải quỳ gối xin tha trong sự bàng hoàng tột độ!`,
    ],
    isekai_fantasy: [
      `Vòng tròn ma pháp cấm thuật đa tầng phát sáng rực rỡ dưới chân! Năng lượng ma pháp cổ xưa thức tỉnh trọn vẹn!`,
      `Kỹ năng gian lận (Cheat Skill) chính thức kích hoạt! Quy luật của thế giới fantasy này hoàn toàn bị bẻ cong!`,
      `Cả binh đoàn quái vật đứng chết lặng trước uy áp tuyệt đối! Sự tự tin của ${heroName} khiến đối phương phải khiếp sợ!`,
      `Màn trình diễn đại ma pháp không thể tin nổi! Chỉ với một chiêu duy nhất, toàn bộ trận địa bị san bằng!`,
      `Pha xử lý đẳng cấp ma vương! Khán giả theo dõi chỉ biết thốt lên: Quá ngầu và quá bá đạo!`,
    ],
    regression_revenge: [
      `Ánh mắt lạnh như băng giá của ${heroName} nhìn thấu mọi mưu đồ! Ký ức kiếp trước giúp nắm trọn 100% chiến thắng!`,
      `Từng bước đi của kẻ thù đều nằm trong kịch bản đã giăng sẵn! Sự ngạo mạn của chúng sắp sửa phải trả giá bằng máu!`,
      `Ra tay quyết đoán không một động tác thừa! Món nợ năm xưa giờ đây được thanh toán sòng phẳng từng chút một!`,
      `Nhìn cái biểu cảm hốt hoảng của tên phản bội kìa! Hắn không hiểu tại sao mọi lợi thế đều biến mất trong chớp mắt!`,
      `Màn vả mặt đỉnh cao không thể thỏa mãn hơn! Công lý và sự phục thù tàn khốc đã giáng xuống đúng lúc!`,
    ],
    school_urban: [
      `Cú đấm thẳng đầy uy lực phá tan thế phòng thủ! Tiếng va chạm đanh thép dội vang khắp không gian!`,
      `Né đòn cực phẩm rồi tung chiêu bẻ khớp đối thủ trong tích tắc! Phong thái bá chủ đường phố không thể bàn cãi!`,
      `Ánh mắt kiên định không hề chớp trước đám đông bao vây! Từng tên một lần lượt ngã gục dưới chân ${heroName}!`,
      `Trật tự mới đã được thiết lập! Sự thống trị tuyệt đối khiến toàn bộ bang hội đối phương phải cúi đầu nhận thua!`,
      `Pha cận chiến thực dụng đến nghẹt thở! Nhịp độ dồn dập khiến người xem không thể rời mắt dù chỉ 1 giây!`,
    ],
    general_shonen: [
      `Ngọn lửa ý chí bộc phát cuồng bạo! Sức mạnh niềm tin và quyết tâm bảo vệ đồng đội dâng trào tột đỉnh!`,
      `Bất chấp thương tích đầy mình, ${heroName} vẫn gượng dậy với nụ cười tự tin ngạo nghễ!`,
      `Tuyệt kỹ tối thượng được giải phóng! Cú đấm quyết định mang theo toàn bộ ước mơ phá tan mọi chướng ngại!`,
      `Không khí sôi động bùng nổ! Từng khoảnh khắc đều khiến trái tim người xem đập liên hồi phấn khích!`,
      `Chiến thắng thuyết phục không thể bàn cãi! Bản lĩnh của bậc anh hùng chân chính được khẳng định rực rỡ!`,
    ],
  };

  const activeHypeList = hypeCommentaries[genreKey] || hypeCommentaries.hunter_system;

  let script = `# 🎬 KỊCH BẢN REVIEW CHI TIẾT (${mode.toUpperCase()}): ${seriesName.toUpperCase()} CHAPTER ${chap}\n`;
  script += `> 📌 **Thể Loại**: ${config.name} | **Phong Cách Video**: Chuẩn YouTube / TikTok Triệu View (Kịch Tính - Sôi Động - Cuốn Hút)\n`;
  script += `> 📊 **Quy Mô Chương**: Bao quát 100% toàn bộ ${totalPages} Trang truyện (${totalPanels} Khung hình / Panels)\n`;
  script += `> 🎵 **Định Hướng Âm Thanh**: ${config.sfxBgm}\n\n`;

  // Act 0: High-Energy 5s Viral Opening Hook
  script += `## 🎯 PHÂN ĐOẠN 0: HOOK GIỮ CHÂN 5S THÂM NHẬP GIẬT GÂN\n`;
  script += `**[Dẫn Chuyện]**: "CẢNH BÁO: Đừng xem video này nếu bạn chưa sẵn sàng đón nhận cú sốc lớn nhất Chapter ${chap}! Bạn có tin rằng chỉ trong ${totalPages} trang truyện căng thẳng này, một biến cố kinh hoàng đã đảo lộn hoàn toàn vận mệnh của ${heroName} không? Chào mừng các bạn đến với TunaMagaRecap! Hãy cùng mình bóc tách chi tiết từng trang truyện từ 1 đến ${totalPages} của siêu phẩm ${seriesName} ngay bây giờ!"\n\n`;

  // Dynamic Act Splitting Algorithm
  const actCount = totalPages <= 10 ? totalPages : 5;
  const actNames = [
    'HỒI 1: BẤT NGỜ XUẤT HIỆN & KHỞI ĐẦU CUỘC CHẠM TRÁN GAY CẤN',
    'HỒI 2: THÂM NHẬP KHÔNG GIAN NGUY HIỂM & ĐỐI MẶT THỬ THÁCH',
    'HỒI 3: CAO TRÀO BÙNG NỔ & XUNG ĐỘT TỘT ĐỈNH',
    'HỒI 4: BIẾN SỐ BẤT NGỜ & MÀN VẢ MẶT LẬT KÈO NGOẠN MỤC',
    'HỒI 5: THỨC TỈNH SỨC MẠNH TOÀN LỰC & KHÉP LẠI CHAPTER',
  ];

  const pagesPerAct = Math.ceil(totalPages / actCount);

  for (let actIdx = 0; actIdx < actCount; actIdx++) {
    const startPageIdx = actIdx * pagesPerAct;
    const endPageIdx = Math.min(totalPages, (actIdx + 1) * pagesPerAct);
    const actPages = allPages.slice(startPageIdx, endPageIdx);

    if (actPages.length === 0) continue;

    const actTitle = actCount === totalPages
      ? `HỒI ${actIdx + 1}: TRANG ${actPages[0].pageIndex}`
      : `${actNames[actIdx] || `HỒI ${actIdx + 1}`} (Trang ${actPages[0].pageIndex} - ${actPages[actPages.length - 1].pageIndex})`;

    script += `## 📜 ${actTitle}\n`;

    const beatDesc = config.actionBeats[actIdx % config.actionBeats.length];
    script += `*🎨 [Bối Cảnh & Hiệu Ứng Trực Quan]*: ${actIdx === 0 ? `${config.visualTrope} ${config.combatStyle}` : beatDesc}\n`;
    script += `*🎵 [Âm Nhạc Sub-BGM]*: ${config.sfxBgm}\n\n`;

    // Iterate through EVERY page and panel in this act
    for (const page of actPages) {
      const pNum = page.pageIndex;
      const panels = Array.isArray(page.panels) && page.panels.length > 0
        ? page.panels
        : [
            { panelIndex: 1, suggestedCameraEffect: 'dramatic_zoom', dialogues: [] },
            { panelIndex: 2, suggestedCameraEffect: 'pan_down', dialogues: [] },
          ];

      const pageDialogues = cleanRawDialogues(
        panels.flatMap((pan) => pan.dialogues || [])
      );

      script += `### 📄 Trang ${pNum} (Gồm ${panels.length} Khung Hình Panels)\n`;

      // Page-level introductory storytelling line
      if (pNum === 1) {
        script += `**[Dẫn Chuyện]**: "Mở đầu Trang ${pNum}, bầu không khí ngột ngạt và căng thẳng lập tức bao trùm! ${heroName} xuất hiện với phong thái tự tin nhưng ẩn chứa sát khí vô cùng sắc lạnh!"\n`;
      } else if (pNum % 3 === 0) {
        script += `**[Dẫn Chuyện]**: "Chuyển sang Trang ${pNum}, nhịp độ trận đấu được đẩy lên một tầm cao mới! Từng chuyển động của các nhân vật đều khiến không gian xung quanh rung chuyển dữ dội!"\n`;
      }

      for (let panIdx = 0; panIdx < panels.length; panIdx++) {
        const pan = panels[panIdx];
        const panNum = pan.panelIndex || (panIdx + 1);
        const cam = pan.suggestedCameraEffect || (panNum === 1 ? 'dramatic_zoom' : 'pan_right');
        const panDialogues = cleanRawDialogues(pan.dialogues || []);
        const hypeIndex = (pNum * 3 + panNum) % activeHypeList.length;
        const hypeText = activeHypeList[hypeIndex];

        // Visual / Camera Tag
        if (pan.aiDescription && !pan.aiDescription.includes('Bấm "Quét Chữ')) {
          script += `*🎨 [Trang ${pNum} • Panel ${panNum} (${cam})]*: ${pan.aiDescription}\n`;
        } else {
          const actionLine = config.actionBeats[(pNum + panNum) % config.actionBeats.length];
          script += `*🎨 [Trang ${pNum} • Panel ${panNum} (${cam})]*: ${actionLine}\n`;
        }

        // ALWAYS include dynamic high-energy Narrator commentary for EVERY panel
        script += `**[Dẫn Chuyện]**: "Tại Panel ${panNum} của Trang ${pNum}, ${hypeText}"\n`;

        // Spoken OCR Dialogues if available
        if (panDialogues.length > 0) {
          for (const d of panDialogues) {
            const spk = d.speaker && d.speaker !== 'Nhân vật' && d.speaker !== 'Dẫn Chuyện' ? d.speaker : heroName;
            script += `**[${spk}]**: "${d.translatedText || d.text}"\n`;
          }
          // Follow up reaction after dialogue
          script += `**[Dẫn Chuyện]**: "Từng lời phát ra đều mang sức nặng nghìn cân, khiến bất cứ ai có mặt tại hiện trường cũng phải bàng hoàng!"\n`;
        }
      }

      // Concluding page synthesis line
      if (pageDialogues.length === 0 && pNum % 2 === 0) {
        script += `**[Dẫn Chuyện]**: "Diễn biến trên Trang ${pNum} dù không cần nhiều lời thoại nhưng từng hình ảnh đã tự cất lời, khắc họa một bức tranh chiến trận vô cùng hoành tráng!"\n`;
      }

      script += `\n`;
    }

    // Mid-act summary breakdown
    script += `> 💡 *[Phân Tích Đạo Diễn Hồi ${actIdx + 1}]*: Nhịp phim đang được đẩy lên cao trào. Các góc máy Zoom & Pan kết hợp với giọng thuyết minh truyền cảm giúp tăng 200% tỷ lệ giữ chân khán giả (Audience Retention).\n\n`;
  }

  // Final Act: High-Converting Cliffhanger & Call-to-Action
  script += `## 🔔 HỒI KẾT: ĐÁNH GIÁ TỔNG KẾT & KÊU GỌI ĐĂNG KÝ (CLIFFHANGER GIẬT GÂN)\n`;
  script += `**[Dẫn Chuyện]**: "Toàn bộ ${totalPages} trang truyện của Chapter ${chap} đã khép lại với những diễn biến nghẹt thở và mãn nhãn tột cùng! Liệu trong Chapter ${chap + 1}, ${heroName} sẽ đối mặt với thế lực bá chủ nào tiếp theo? Cú lật kèo tới đây có thực sự thành công hay chỉ là khởi đầu cho một cơn ác mộng lớn hơn?"\n`;
  script += `**[Dẫn Chuyện]**: "Anh em thấy thế nào về pha vả mặt đỉnh cao này? Đừng quên để lại BÌNH LUẬN cảm nghĩ bên dưới, nhấn LIKE và bấm nút ĐĂNG KÝ KÊNH 🔔 kèm chuông thông báo để là người đầu tiên đón xem video recap Chapter ${chap + 1} mới nhất trên TunaMagaRecap nhé! Xin chào và hẹn gặp lại các bạn trong những video triệu view tiếp theo!"\n`;

  return script;
}

