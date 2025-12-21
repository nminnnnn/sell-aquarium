# Environment Variables Setup

## Backend (.env)

1. **Copy `.env.example` to `.env`:**
   ```bash
   cd backend
   cp .env.example .env
   ```

   Windows:
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. **Edit `.env` file và thêm API keys của bạn:**
   ```env
   # Database (mặc định cho Docker)
   DB_HOST=localhost
   DB_PORT=3307
   DB_NAME=charan_aquarium
   DB_USER=charan_user
   DB_PASS=charan_password

   # AI Chatbot (Google Gemini API)
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

   # Google Maps API (optional)
   GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```

3. **Lưu file `.env`**

## Frontend (.env)

1. **Copy `.env.example` to `.env`:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

   Windows:
   ```powershell
   cd frontend
   copy .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # Google Maps API (optional - for frontend)
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```

3. **Restart Vite dev server** sau khi thay đổi `.env`:
   ```bash
   npm run dev
   ```

## Lưu ý

- ✅ `.env` đã được thêm vào `.gitignore` - sẽ không bị commit vào Git
- ✅ `.env.example` được commit - đây là template cho các developer khác
- ❌ **KHÔNG BAO GIỜ** commit file `.env` thật vào Git
- 🔐 API keys trong `.env` sẽ được đọc tự động bởi code

## Security Checklist

- [ ] Đã copy `.env.example` thành `.env`
- [ ] Đã thêm API keys vào `.env`
- [ ] Đã kiểm tra `.env` không có trong Git (chạy `git status`)
- [ ] Đã restart server sau khi thay đổi `.env`

