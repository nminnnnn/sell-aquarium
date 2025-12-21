# Charan Aquarium - Full Website

A modern e-commerce website for aquarium products built with React, TypeScript, Vite, and MySQL (Docker).

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v16 or higher)
- **Docker Desktop** (for MySQL database)
- **PHP** (v8.0 or higher) - Có thể dùng từ XAMPP hoặc cài riêng

### Bước 1: Chạy Backend (PHP + MySQL)

#### 1.1. Khởi động MySQL bằng Docker

1. **Vào thư mục backend:**
   ```bash
   cd backend
   ```

2. **Start Docker containers:**
   ```bash
   docker-compose up -d
   ```
   
   Lệnh này sẽ:
   - Tải MySQL 8.0 và phpMyAdmin images
   - Tạo database `charan_aquarium`
   - Tự động import dữ liệu từ `init.sql` (5 users, 10 products)

3. **Kiểm tra containers đang chạy:**
   ```bash
   docker-compose ps
   ```
   
   Bạn sẽ thấy:
   - `charan_aquarium_db` (MySQL) - Port 3307
   - `charan_phpmyadmin` (phpMyAdmin) - Port 8080

4. **Truy cập phpMyAdmin (Optional):**
   - Mở: `http://localhost:8080`
   - Server: `mysql`
   - Username: `root`
   - Password: `rootpassword`

#### 1.2. Chạy PHP API Server

1. **Vẫn trong thư mục backend:**
   ```bash
   # Nếu dùng PHP từ XAMPP:
   "C:\xampp\php\php.exe" -S localhost:8000 -t .
   
   # Hoặc nếu PHP đã có trong PATH:
   php -S localhost:8000 -t .
   ```

2. **API sẽ có sẵn tại:**
   - Test Connection: `http://localhost:8000/test_connection.php`
   - Auth API: `http://localhost:8000/api/auth.php`
   - Chat API: `http://localhost:8000/api/chat.php`
   - Products API: `http://localhost:8000/api/products.php`
   - Orders API: `http://localhost:8000/api/orders.php`
   - Reviews API: `http://localhost:8000/api/reviews.php`
   - Favorites API: `http://localhost:8000/api/favorites.php`
   - Shipping API: `http://localhost:8000/api/shipping.php`
   - Upload API: `http://localhost:8000/api/upload.php`

#### 1.3. Chạy Database Migrations (Tùy chọn)

Sau khi database đã được tạo, bạn có thể chạy các migrations để thêm các tính năng mới:

**Windows (PowerShell):**
```powershell
cd backend

# Migration cho AI Chatbot
.\run_ai_migration.ps1

# Migration cho Reviews/Đánh giá
.\run_reviews_migration.ps1

# Migration cho Shipping/Tính phí ship
.\run_shipping_migration.ps1

# Migration cho Bestsellers/Sản phẩm bán chạy
.\run_bestsellers_migration.ps1

# Migration cho Favorites/Yêu thích
.\run_favorites_migration.ps1
```

**Lưu ý:** Các migrations này là tùy chọn. Nếu muốn sử dụng đầy đủ tính năng, nên chạy tất cả migrations.

### Bước 2: Chạy Frontend (React)

1. **Mở terminal/cửa sổ PowerShell MỚI, vào thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies (chỉ lần đầu):**
   ```bash
   npm install
   ```

3. **Chạy development server:**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt:**
   - Vite sẽ hiển thị URL trong terminal, thường là: `http://localhost:5173/`
   - Mở đúng URL đó trong trình duyệt

## 📁 Project Structure

Dự án đã được tái cấu trúc để phân tách rõ ràng **Frontend** và **Backend**:

```
Charan-Aquarium-main/
├── frontend/              # FRONTEND (React + TypeScript)
│   ├── pages/            # React pages
│   │   ├── Home.tsx      # Trang chủ
│   │   ├── Shop.tsx      # Trang cửa hàng
│   │   ├── Cart.tsx      # Trang giỏ hàng
│   │   ├── Auth.tsx      # Trang đăng nhập/đăng ký
│   │   ├── Orders.tsx    # Trang đơn hàng
│   │   ├── Admin.tsx     # Trang admin
│   │   ├── AdminChat.tsx # Trang chat admin
│   │   ├── Chat.tsx      # Trang chat
│   │   ├── Orders.tsx    # Trang đơn hàng
│   │   ├── Favorites.tsx # Trang yêu thích
│   │   └── Invoice.tsx   # Trang hóa đơn
│   ├── components/       # React components
│   │   ├── Layout.tsx    # Layout chung
│   │   ├── ChatWidget.tsx # Widget chat
│   │   ├── ProductReviews.tsx # Component đánh giá sản phẩm
│   │   └── AddressForm.tsx # Form địa chỉ với Google Maps
│   ├── services/         # API service layer
│   │   └── api.ts        # Tất cả hàm gọi backend API
│   ├── App.tsx           # Main app component
│   ├── index.tsx         # Entry point
│   ├── index.html        # HTML template
│   ├── context.tsx       # React Context (state management)
│   ├── types.ts          # TypeScript types
│   ├── constants.ts      # Constants
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── img/              # Static images
│
└── backend/               # BACKEND (PHP + MySQL)
    ├── api/              # PHP API endpoints
    │   ├── auth.php      # Authentication API
    │   ├── chat.php      # Chat/Messages API (tích hợp AI chatbot)
    │   ├── ai_chat.php   # AI Chatbot logic (Google Gemini)
    │   ├── orders.php    # Orders API
    │   ├── products.php  # Products API
    │   ├── reviews.php   # Product Reviews API
    │   ├── favorites.php # Favorites/Wishlist API
    │   ├── shipping.php  # Shipping Cost Calculation API
    │   └── upload.php    # Image Upload API
    ├── config.php        # Database connection config & API keys
    ├── docker-compose.yml # Docker MySQL configuration
    ├── init.sql          # Database schema & seed data
    ├── test_connection.php # Test database connection
    ├── *_migration.sql   # Database migration files
    └── run_*_migration.ps1 # PowerShell scripts để chạy migrations
```

## 🔐 Default Accounts

The database comes with 5 pre-configured accounts:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| rajesh | rajesh123 | Customer |
| priya | priya123 | Customer |
| amit | amit123 | Customer |
| sneha | sneha123 | Customer |

## 🛠️ Available Scripts

### Frontend (React)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database (Docker)
- `docker-compose up -d` - Start containers
- `docker-compose stop` - Stop containers
- `docker-compose down` - Stop and remove containers
- `docker-compose ps` - View container status
- `docker-compose logs mysql` - View MySQL logs

## 🔧 Configuration

### Environment Variables (.env)

**⚠️ QUAN TRỌNG: Không commit API keys vào Git!**

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Windows: copy .env.example .env
   ```
   
   Sau đó chỉnh sửa `backend/.env` và thêm API keys của bạn:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3307
   DB_NAME=charan_aquarium
   DB_USER=charan_user
   DB_PASS=charan_password
   
   # AI Chatbot (Google Gemini API)
   GEMINI_API_KEY=YOUR_API_KEY_HERE
   
   # Google Maps API (optional)
   GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

2. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Windows: copy .env.example .env
   ```
   
   Sau đó chỉnh sửa `frontend/.env`:
   ```env
   # Google Maps API (for frontend)
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

**Lưu ý:**
- ✅ File `.env` đã được thêm vào `.gitignore` - sẽ không bị commit
- ✅ File `.env.example` được commit - đây là template
- ❌ **KHÔNG BAO GIỜ** commit file `.env` thật vào Git
- 📖 Xem thêm: `backend/README_ENV.md`

### Database Connection

Cấu hình database có thể được đặt trong `backend/.env` hoặc `backend/config.php`:

**Cho Docker MySQL (mặc định):**
```php
DB_HOST: localhost
DB_PORT: 3307
DB_NAME: charan_aquarium
DB_USER: charan_user
DB_PASSWORD: charan_password
```

**Cho XAMPP MySQL:**
```php
DB_HOST: localhost
DB_PORT: 3306
DB_NAME: charan_aquarium
DB_USER: root
DB_PASSWORD: '' (empty)
```

### Frontend API Configuration

Frontend kết nối tới backend thông qua các API endpoint được định nghĩa trong `frontend/services/api.ts`:

- Auth API: `http://localhost:8000/api/auth.php`
- Chat API: `http://localhost:8000/api/chat.php`
- Orders API: `http://localhost:8000/api/orders.php`
- Products API: `http://localhost:8000/api/products.php`
- Reviews API: `http://localhost:8000/api/reviews.php`
- Favorites API: `http://localhost:8000/api/favorites.php`
- Shipping API: `http://localhost:8000/api/shipping.php`
- Upload API: `http://localhost:8000/api/upload.php`

Nếu cần thay đổi địa chỉ backend, sửa các biến trong `frontend/services/api.ts`.

### AI Chatbot Configuration (Tùy chọn)

Để sử dụng AI Chatbot, thêm Google Gemini API key vào `backend/.env`:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Lấy API key từ: https://makersuite.google.com/app/apikey

**Lưu ý:** 
- Free tier: 60 requests/phút
- Chỉ tính phí khi user gửi tin nhắn, không có auto-polling
- Frontend polling không ảnh hưởng đến API quota
- Nếu để trống, AI chatbot sẽ bị vô hiệu hóa

### Google Maps Configuration (Tùy chọn)

Để sử dụng tính năng tính phí ship theo map, thêm Google Maps API key:

1. **Backend** (`backend/.env`):
   ```env
   GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

2. **Frontend** (`frontend/.env`):
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

Lấy API key từ: https://console.cloud.google.com/google/maps-apis  
Enable các APIs: Places API, Maps JavaScript API, Distance Matrix API

**Lưu ý:** 
- Free tier: $200 credit/tháng
- Có thể dùng fallback method (OpenStreetMap) nếu không có API key
- Nếu để trống, hệ thống sẽ tự động dùng fallback method

## 📡 API Endpoints

### Authentication
- `POST /api/auth.php` - Login/Register
  ```json
  {
    "action": "login",
    "username": "admin",
    "password": "admin123"
  }
  ```

### Products
- `GET /api/products.php` - Get all products
- `GET /api/products.php?category=Marine` - Filter by category
- `GET /api/products.php?bestsellers=1&limit=8` - Get bestsellers
- `POST /api/products.php` - Create product (Admin only)
- `PUT /api/products.php` - Update product (Admin only)
- `DELETE /api/products.php?id=1` - Delete product (Admin only)

### Orders
- `GET /api/orders.php?user_id=1` - Get user orders
- `GET /api/orders.php?user_id=1&all=true` - Get all orders (Admin)
- `POST /api/orders.php` - Create new order
- `PUT /api/orders.php` - Update order status (Admin)

### Reviews
- `GET /api/reviews.php?productId=1&userId=1` - Get reviews for a product
- `POST /api/reviews.php` - Create/Update review (chỉ user đã mua sản phẩm)

### Favorites
- `GET /api/favorites.php?userId=1` - Get user's favorites
- `POST /api/favorites.php` - Add to favorites
- `DELETE /api/favorites.php` - Remove from favorites

### Shipping
- `POST /api/shipping.php` - Calculate shipping cost
  ```json
  {
    "address": "Địa chỉ giao hàng"
  }
  ```

### Upload
- `POST /api/upload.php` - Upload product image (Admin only)

### Chat
- `GET /api/chat.php?action=conversations` - Get conversations (Admin)
- `GET /api/chat.php?action=messages&userId=1` - Get messages
- `POST /api/chat.php` - Send message (tích hợp AI chatbot)

## 🐳 Docker Commands

Tất cả lệnh Docker chạy từ thư mục `backend/`:

### Start Services
```bash
cd backend
docker-compose up -d
```

### Stop Services
```bash
cd backend
docker-compose stop
```

### View Logs
```bash
cd backend
docker-compose logs -f mysql
```

### Reset Database
```bash
cd backend
docker-compose down -v
docker-compose up -d
```

### Backup Database
```bash
cd backend
docker exec charan_aquarium_db mysqldump -u root -prootpassword charan_aquarium > backup.sql
```

## 📊 Database Migrations

Dự án có các migrations để thêm tính năng mới. Chạy migrations sau khi database đã được tạo:

### Windows (PowerShell)

Chạy từ thư mục `backend/`:

```powershell
# AI Chatbot support
.\run_ai_migration.ps1

# Product Reviews/Đánh giá
.\run_reviews_migration.ps1

# Shipping cost calculation
.\run_shipping_migration.ps1

# Bestsellers tracking
.\run_bestsellers_migration.ps1

# Favorites/Wishlist
.\run_favorites_migration.ps1
```

### Linux/Mac

```bash
cd backend

# AI Chatbot
cat ai_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

# Reviews
cat reviews_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

# Shipping
cat shipping_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

# Bestsellers
cat bestsellers_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

# Favorites
cat favorites_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium
```

**Thứ tự chạy migrations (nếu chạy lần đầu):**
1. `ai_migration.sql` (cho AI chatbot)
2. `reviews_migration.sql` (cho đánh giá sản phẩm)
3. `shipping_migration.sql` (cho tính phí ship)
4. `bestsellers_migration.sql` (cho sản phẩm bán chạy)
5. `favorites_migration.sql` (cho yêu thích)

## 🧪 Testing

### Test Database Connection
1. Vào thư mục backend và chạy PHP server:
   ```bash
   cd backend
   "C:\xampp\php\php.exe" -S localhost:8000 -t .
   ```
2. Mở trình duyệt: `http://localhost:8000/test_connection.php`
   - Nếu thành công, sẽ thấy: `{"success":true,"message":"Database connection successful"}`

### Test API Endpoints
Sau khi PHP server đang chạy, test các endpoint:
- Auth: `http://localhost:8000/api/auth.php` (POST với body JSON)
- Chat: `http://localhost:8000/api/chat.php`
- Products: `http://localhost:8000/api/products.php`
- Orders: `http://localhost:8000/api/orders.php`
- Reviews: `http://localhost:8000/api/reviews.php?productId=1`
- Favorites: `http://localhost:8000/api/favorites.php?userId=1`
- Shipping: `http://localhost:8000/api/shipping.php` (POST với address)
- Upload: `http://localhost:8000/api/upload.php` (POST với file)

Có thể dùng Postman, curl, hoặc test trực tiếp từ frontend.

## ⚠️ Troubleshooting

### Port Already in Use
- If port 3000 is busy, Vite will use the next available port
- Check terminal output for the actual port number

### Database Connection Failed
- Đảm bảo Docker containers đang chạy:
  ```bash
  cd backend
  docker-compose ps
  ```
- Kiểm tra MySQL logs:
  ```bash
  cd backend
  docker-compose logs mysql
  ```
- Kiểm tra `backend/config.php` có đúng thông tin:
  - Port: 3307 (Docker) hoặc 3306 (XAMPP)
  - User/Password: `charan_user`/`charan_password` (Docker) hoặc `root`/`` (XAMPP)

### PHP Server Not Starting
- Kiểm tra PHP đã cài:
  ```bash
  php --version
  # hoặc
  "C:\xampp\php\php.exe" --version
  ```
- Đảm bảo port 8000 không bị chiếm
- Thử port khác:
  ```bash
  php -S localhost:8000 -t .
  ```
- Nhớ chạy lệnh từ thư mục `backend/`

### Docker Containers Won't Start
- Kiểm tra Docker Desktop đang chạy (icon xanh ở system tray)
- Đảm bảo port 3307 và 8080 không bị chiếm
- Xem logs:
  ```bash
  cd backend
  docker-compose logs
  ```

## ✨ Tính năng chính

### Đã implement:
- ✅ **E-commerce cơ bản**: Products, Cart, Orders, Checkout
- ✅ **User Authentication**: Login, Register
- ✅ **Admin Panel**: Quản lý sản phẩm, đơn hàng, chat
- ✅ **AI Chatbot**: Tích hợp Google Gemini API, tự động trả lời khách hàng
- ✅ **Reviews/Đánh giá**: Đánh giá sản phẩm (chỉ user đã mua)
- ✅ **Favorites/Wishlist**: Danh sách yêu thích
- ✅ **Shipping Calculation**: Tính phí ship theo khoảng cách (Google Maps + OpenStreetMap fallback)
- ✅ **Bestsellers**: Theo dõi sản phẩm bán chạy
- ✅ **Image Upload**: Upload ảnh sản phẩm
- ✅ **Real-time Chat**: Chat giữa customer và admin
- ✅ **Product Search & Filter**: Tìm kiếm và lọc theo category

### Công nghệ sử dụng:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: PHP (RESTful API)
- **Database**: MySQL 8.0 (Docker)
- **AI**: Google Gemini API
- **Maps**: Google Maps Platform (tùy chọn)

## 📝 Notes

1. **Development Only**: Passwords are stored in plain text for demo purposes. In production, use password hashing.

2. **CORS**: API has CORS enabled for development. Configure properly for production.

3. **Environment Variables**: For production, move sensitive data to environment variables.

4. **Data Persistence**: Database data is stored in Docker volume `mysql_data`. Use `docker-compose down -v` to remove it.

5. **Category Images (Home page)**: Place these files in `frontend/img/` for the "Shop By Category" section:
   - `cat-freshwater.jpg`
   - `cat-marine.jpg`
   - `cat-exotic.jpg`
   - `cat-tanks.jpg`
   - `cat-food.jpg`
   - `cat-accessories.jpg`
   - (optional) `cat-placeholder.jpg` as fallback.

6. **AI Chatbot**: 
   - Cần Google Gemini API key (free tier: 60 requests/phút)
   - Cấu hình trong `backend/config.php`
   - User có thể yêu cầu admin bằng cách gõ "admin" trong chat

7. **Shipping Calculation**:
   - Hỗ trợ Google Distance Matrix API (cần API key)
   - Fallback: OpenStreetMap Nominatim + Haversine formula (miễn phí)
   - Store location: 470 Trần Đại Nghĩa, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng

8. **Image Upload**:
   - Upload folder: `backend/uploads/images/`
   - Max size: 5MB
   - Supported formats: JPG, PNG, GIF, WebP

## 🚀 Production Deployment

### Frontend
1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy thư mục `frontend/dist/` lên hosting (Vercel, Netlify, hoặc server của bạn)
3. Cập nhật API URLs trong `frontend/services/api.ts` thành production URLs

### Backend
1. Upload thư mục `backend/` lên server PHP
2. Cấu hình database production trong `backend/config.php`
3. Sử dụng password hashing (thay vì plain text)
4. Enable HTTPS
5. Cấu hình CORS cho production domain
6. Sử dụng environment variables cho sensitive data
7. Cấu hình MySQL production credentials

## 📞 Support

Khi gặp vấn đề:
1. Kiểm tra Docker logs:
   ```bash
   cd backend
   docker-compose logs
   ```
2. Kiểm tra PHP errors trong browser console (F12)
3. Đảm bảo tất cả services đang chạy:
   - Docker MySQL container (port 3307)
   - PHP server (port 8000)
   - Frontend dev server (port 5173)
4. Kiểm tra file `FEATURE_STATUS.md` để xem danh sách tính năng
5. Kiểm tra file `STRUCTURE.md` để hiểu rõ cấu trúc dự án
6. Kiểm tra `README_GOOGLE_MAPS_SETUP.md` để cấu hình Google Maps (nếu cần)

## 📚 Documentation Files

- `README.md` - Hướng dẫn chạy code (file này)
- `FEATURE_STATUS.md` - Trạng thái các tính năng
- `STRUCTURE.md` - Cấu trúc dự án chi tiết
- `README_GOOGLE_MAPS_SETUP.md` - Hướng dẫn setup Google Maps API
- `REQUEST_ADMIN_FEATURE.md` - Hướng dẫn tính năng yêu cầu admin

---

**Built with ❤️ for Aquarium Enthusiasts**
