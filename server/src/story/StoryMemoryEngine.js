export class StoryMemoryEngine {
  constructor() {
    this.seriesMemory = new Map();
  }

  getMemory(seriesName) {
    const key = (seriesName || '').toLowerCase().trim();
    if (!this.seriesMemory.has(key)) {
      this.seriesMemory.set(key, {
        seriesName,
        mainCharacters: [],
        cumulativePlotSummary: '',
        chapterSummaries: {},
        lastChapter: 0,
      });
    }
    return this.seriesMemory.get(key);
  }

  updateMemory(seriesName, chapterNumber, events, characters = []) {
    const mem = this.getMemory(seriesName);
    mem.lastChapter = Math.max(mem.lastChapter, chapterNumber);
    mem.chapterSummaries[chapterNumber] = events;

    characters.forEach((c) => {
      if (!mem.mainCharacters.includes(c)) {
        mem.mainCharacters.push(c);
      }
    });

    mem.cumulativePlotSummary += `\n- Chapter ${chapterNumber}: ${events.slice(0, 150)}...`;
    return mem;
  }

  generateContextualScript(seriesName, chapterNumber, mode = 'review') {
    const mem = this.getMemory(seriesName);
    const pastContext =
      chapterNumber > 1 && mem.chapterSummaries[chapterNumber - 1]
        ? `Nối tiếp những diễn biến kịch tính từ Chapter ${chapterNumber - 1}`
        : `Mở đầu chuyến hành trình huyền thoại`;

    const charactersStr = mem.mainCharacters.length > 0 ? mem.mainCharacters.join(', ') : 'Nhân vật chính và đồng đội';

    return `# 🎬 KỊCH BẢN REVIEW AI (CONTEXT MEMORY): ${seriesName.toUpperCase()} - CHAPTER ${chapterNumber}

## 📌 Phân Đoạn 1: Tóm Tắt & Mở Đầu Bối Cảnh
[CẢNH 1: TIẾP NỐI DIỄN BIẾN]
**Giọng đọc**: "Chào mừng các bạn quay trở lại với TunaMagaRecap! ${pastContext}, hôm nay trong Chapter ${chapterNumber} của ${seriesName}, chúng ta cùng theo chân ${charactersStr} bước vào những thử thách sinh tử và những bước ngoặt bất ngờ nhất!"

## 📌 Phân Đoạn 2: Xung Đột Lên Đỉnh Điểm
[CẢNH 2: TRẬN CHIẾN CAO TRÀO]
**Giọng đọc**: "Không khí căng thẳng bao trùm từng khung tranh khi thế trận đảo chiều. Kẻ thù bất ngờ tung ra chiêu thức tối thượng, buộc các nhân vật phải bộc phát toàn bộ tiềm năng thức tỉnh!"

## 📌 Phân Đoạn 3: Kết Cục & Cài Cắm Cho Chapter Tiếp Theo
[CẢNH 3: CLIFFHANGER HỒI KẾT]
**Giọng đọc**: "Trận chiến tạm khép lại với những bí ẩn lớn hơn còn chờ phía trước. Liệu diễn biến trong Chapter ${chapterNumber + 1} sẽ tiếp diễn ra sao? Hãy Like, Subscribe và cùng bàn luận dưới phần bình luận nhé!"`;
  }
}

export const storyMemoryEngine = new StoryMemoryEngine();
