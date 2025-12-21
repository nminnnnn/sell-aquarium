# Cấu trúc dự án Charan Aquarium

Dự án đã được tái cấu trúc để phân tách rõ ràng **Frontend** và **Backend**.

## 📁 Cấu trúc thư mục

```
Charan-Aquarium-main/
├── frontend/              ← FRONTEND (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── pages/        ← Các trang (Home, Shop, Cart, Auth...)
│   │   ├── components/   ← Components tái sử dụng
│   │   ├── services/     ← API service layer (gọi backend)
│   │   ├── context.tsx   ← React Context (state management)
│   │   ├── types.ts      ← TypeScript types
│   │   └── constants.ts  ← Constants
│   ├── public/
│   │   ├── index.html
│   │   └── img/          ← Hình ảnh
│   ├── package.json      ← Dependencies (React, Vite...)
│   ├── vite.config.ts    ← Cấu hình Vite
│   └── tsconfig.json     ← Cấu hình TypeScript
│
├── backend/               ← BACKEND (PHP + MySQL)
│   ├── api/              ← API endpoints
│   │   ├── auth.php      ← Đăng nhập/đăng ký
│   │   ├── chat.php      ← Chat/tin nhắn
│   │   ├── orders.php    ← Quản lý đơn hàng
│   │   └── products.php  ← Quản lý sản phẩm
│   ├── config.php        ← Cấu hình database
│   ├── init.sql          ← Script tạo database
│   ├── docker-compose.yml ← Cấu hình Docker MySQL
│   └── test_connection.php ← Test kết nối DB
│
└── README.md
```

## 🔄 Luồng hoạt động

### Frontend → Backend Communication

```
User Action (Browser)
    ↓
Frontend (React Component)
    ↓
services/api.ts (API Service Layer)
    ↓
HTTP Request → http://localhost:8000/api/*
    ↓
Backend (PHP API)
    ↓
MySQL Database (Docker/XAMPP)
    ↓
HTTP Response (JSON)
    ↓
Frontend (Update UI)
```

## 🚀 Cách chạy

### 1. Chạy Backend (PHP + MySQL)

```powershell
# Vào thư mục backend
cd backend

# Khởi động MySQL bằng Docker
docker-compose up -d

# Chạy PHP server
"C:\xampp\php\php.exe" -S localhost:8000 -t .
```

### 2. Chạy Frontend (React)

```powershell
# Vào thư mục frontend
cd frontend

# Cài dependencies (lần đầu)
npm install

# Chạy dev server
npm run build
```

## 📝 Ghi chú

- **Frontend** chạy trên port **5173** (hoặc port khác do Vite tự chọn)
- **Backend** chạy trên port **8000**
- **MySQL** chạy trên port **3307** (Docker) hoặc **3306** (XAMPP)
- API endpoints được định nghĩa trong `frontend/services/api.ts`

## 🔗 API Endpoints

- `POST /api/auth.php` - Đăng nhập/đăng ký
- `GET/POST /api/chat.php` - Chat/tin nhắn
- `GET/POST/PUT /api/orders.php` - Quản lý đơn hàng
- `GET/POST/PUT/DELETE /api/products.php` - Quản lý sản phẩm

