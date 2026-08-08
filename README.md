# 🎬 TunaMagaRecap - Manga Studio AI Native OS

Hệ thống AI tự động tạo video recap truyện tranh (Manga/Manhwa/Manhua Recap Video) từ đường link chapter truyện chỉ với 1-Click. Lấy cảm hứng từ MagaRecap và tích hợp đầy đủ quy trình: Cào ảnh chapter thật, nhận diện bóng thoại OCR Panel, biên soạn kịch bản AI, lồng tiếng Voice TTS tiếng Việt, sinh phụ đề tự động và xuất dự án CapCut (.json/XML).

---

## ⚡ Tính Năng Nổi Bật

1. **⚡ 1-Click Full Automation Pipeline**:
   - Dán bất kỳ link chapter truyện nào (ThuVienSach, AsuraScans, NetTruyen, MangaDex...).
   - Tự động cào toàn bộ 65+ trang ảnh thật độ phân giải cao.
   - Nhận diện khung tranh (Panels) & bóng thoại (OCR).
   - Biên soạn kịch bản recap phân tích chi tiết.
   - Tổng hợp giọng đọc lồng tiếng tiếng Việt & sinh phụ đề TikTok Captions.
   - Tự động tạo Thumbnail 3D & sinh SEO Metadata YouTube.
   - Dựng sẵn 5-track NLE Video Timeline với hiệu ứng Ken Burns motion.

2. **🖼️ Proxy Hình Ảnh Vượt Tường Lửa CDN**:
   - Bỏ qua 100% rào cản chống hotlink / Referer 403 Forbidden của các web truyện tranh.

3. **🔊 Web Speech Synthesizer & Voice TTS**:
   - Hỗ trợ phát giọng đọc tiếng Việt chân thực trực tiếp qua loa trình duyệt.

4. **🎬 Xuất Dự Án CapCut 1-Click**:
   - Xuất file `.json` tương thích mở trực tiếp trong CapCut PC/Mobile.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (phiên bản v18 trở lên)
- Git

### 2. Cài Đặt Dependencies

Mở Terminal / Command Prompt tại thư mục dự án và chạy:

```bash
# Cài đặt thư viện cho Frontend & Backend
npm install
```

---

### 3. Khởi Chạy Dự Án

Dự án gồm **2 thành phần** (Backend Server & Frontend Dev Server). Bạn có thể mở **2 cửa sổ Terminal**:

#### 🔹 Cửa sổ Terminal 1: Chạy Backend Server (Port 3001)
```bash
npm run server
# Hoặc: node server/src/index.js
```
> Server sẽ lắng nghe tại: `http://localhost:3001` (xử lý cào dữ liệu, proxy ảnh và OCR).

#### 🔹 Cửa sổ Terminal 2: Chạy Frontend Web App (Port 5173)
```bash
npm run dev
```
> Mở trình duyệt tại: `http://localhost:5173/`

---

## 📖 Hướng Dẫn Sử Dụng Trên Web App

1. Mở trình duyệt tại `http://localhost:5173/`.
2. Tại tab **Library & Series**, bạn có thể:
   - Dán link chapter truyện bất kỳ (hoặc bấm nút mẫu **`Solo Leveling (ThuVienSach Chap 1)`**).
   - Bấm nút **"⚡ 1-Click Tự Động Tạo Video (MagaRecap)"** hoặc **"⚡ Cào Link"**.
3. Xem toàn bộ 65 trang ảnh truyện xuất hiện trên màn hình.
4. Chuyển đổi linh hoạt giữa các công cụ:
   - **OCR & Panel Split**: Xem vị trí bounding box từng khung hình.
   - **AI Script Director**: Tùy chỉnh kịch bản review 8 chế độ.
   - **Voice TTS Studio**: Chọn diễn viên lồng tiếng & nghe thử giọng đọc.
   - **Whisper Subtitle**: Tùy biến kiểu chữ phụ đề TikTok / Anime.
   - **NLE & CapCut Export**: Xem trước video 4K 60FPS và xuất file CapCut.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Zustand (Persist Middleware), Lucide Icons
- **Backend**: Node.js, WHATWG URL API, REST Streaming Image Proxy, HTML Parser
- **Export**: CapCut Draft JSON Specification
