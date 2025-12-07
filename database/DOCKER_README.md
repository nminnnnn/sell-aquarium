# 🐳 Docker Setup Guide - Charan Aquarium Database

Hướng dẫn thiết lập database MySQL/MariaDB sử dụng Docker cho ứng dụng Charan Aquarium.

## 📋 Yêu cầu

- Docker đã được cài đặt ([Download Docker](https://www.docker.com/get-started))
- Docker Compose (thường đi kèm với Docker Desktop)

## 🚀 Các bước thiết lập

### Bước 1: Kiểm tra Docker

Mở terminal/command prompt và chạy:

```bash
docker --version
docker-compose --version
```

Nếu hiển thị version, bạn đã sẵn sàng!

### Bước 2: Di chuyển đến thư mục database

```bash
cd database
```

### Bước 3: Khởi động Docker containers

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Tải MySQL 8.0 image (nếu chưa có)
- Tạo và khởi động MySQL container
- Tự động tạo database `charan_aquarium`
- Chạy file `init.sql` để tạo tables và dữ liệu mẫu
- Khởi động phpMyAdmin (tùy chọn)

### Bước 4: Kiểm tra containers đang chạy

```bash
docker-compose ps
```

Bạn sẽ thấy:
- `charan_aquarium_db` (MySQL) - Port 3306
- `charan_phpmyadmin` (phpMyAdmin) - Port 8080

### Bước 5: Truy cập phpMyAdmin (Tùy chọn)

Mở trình duyệt và truy cập:
```
http://localhost:8080
```

**Thông tin đăng nhập:**
- Server: `mysql`
- Username: `root`
- Password: `rootpassword`

## 🔧 Cấu hình

### Thông tin kết nối Database

| Thông tin | Giá trị |
|-----------|---------|
| Host | `localhost` (hoặc `mysql` nếu PHP trong Docker) |
| Port | `3306` |
| Database | `charan_aquarium` |
| Username | `charan_user` |
| Password | `charan_password` |
| Root Password | `rootpassword` |

### Sử dụng với PHP API

**Option 1: Sử dụng config.docker.php**

Copy `config.docker.php` thành `config.php`:

```bash
cp config.docker.php config.php
```

**Option 2: Cập nhật config.php thủ công**

Mở `config.php` và cập nhật:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'charan_user');
define('DB_PASS', 'charan_password');
define('DB_NAME', 'charan_aquarium');
define('DB_PORT', 3306);
```

## 📡 API Endpoints

Sau khi setup xong, các API endpoints sẽ có sẵn tại:

- **Authentication:** `http://localhost/database/api/auth.php`
- **Products:** `http://localhost/database/api/products.php`
- **Orders:** `http://localhost/database/api/orders.php`

## 🧪 Kiểm tra kết nối

### Cách 1: Sử dụng test_connection.php

Truy cập: `http://localhost/database/test_connection.php`

### Cách 2: Sử dụng Docker exec

```bash
docker exec -it charan_aquarium_db mysql -u charan_user -pcharan_password charan_aquarium -e "SELECT COUNT(*) FROM users;"
```

### Cách 3: Sử dụng phpMyAdmin

Truy cập `http://localhost:8080` và kiểm tra database

## 🛠️ Các lệnh Docker hữu ích

### Xem logs
```bash
docker-compose logs mysql
docker-compose logs -f mysql  # Follow logs
```

### Dừng containers
```bash
docker-compose stop
```

### Khởi động lại containers
```bash
docker-compose start
```

### Dừng và xóa containers (giữ data)
```bash
docker-compose down
```

### Dừng và xóa tất cả (bao gồm data)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Xem trạng thái
```bash
docker-compose ps
```

## 💾 Quản lý dữ liệu

### Backup database

```bash
docker exec charan_aquarium_db mysqldump -u root -prootpassword charan_aquarium > backup.sql
```

### Restore database

```bash
docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium < backup.sql
```

### Xem dữ liệu trong container

```bash
docker exec -it charan_aquarium_db mysql -u root -prootpassword charan_aquarium
```

## 🔐 Tài khoản mặc định

Database đã được tạo sẵn với 5 tài khoản:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| rajesh | rajesh123 | Customer |
| priya | priya123 | Customer |
| amit | amit123 | Customer |
| sneha | sneha123 | Customer |

## 📁 Cấu trúc thư mục

```
database/
├── docker-compose.yml      # Docker configuration
├── init.sql                # Database initialization script
├── config.docker.php       # PHP config for Docker
├── config.php              # PHP config (update this)
├── api/                    # API endpoints
│   ├── auth.php
│   ├── products.php
│   └── orders.php
└── DOCKER_README.md        # This file
```

## ⚠️ Lưu ý quan trọng

1. **Port conflicts:** Nếu port 3306 hoặc 8080 đã được sử dụng, bạn có thể thay đổi trong `docker-compose.yml`:
   ```yaml
   ports:
     - "3307:3306"  # Thay đổi port bên trái
   ```

2. **Data persistence:** Dữ liệu được lưu trong Docker volume `mysql_data`. Khi chạy `docker-compose down -v`, dữ liệu sẽ bị xóa.

3. **Security:** 
   - Passwords trong file này chỉ dùng cho development
   - Trong production, sử dụng environment variables
   - Không commit passwords vào Git

4. **Network:** Nếu PHP chạy trong Docker, sử dụng `mysql` làm hostname thay vì `localhost`.

## 🆘 Xử lý lỗi thường gặp

### Lỗi: "Port already in use"
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :3306  # Windows
lsof -i :3306                 # Mac/Linux

# Thay đổi port trong docker-compose.yml
```

### Lỗi: "Cannot connect to MySQL"
- Kiểm tra container đang chạy: `docker-compose ps`
- Kiểm tra logs: `docker-compose logs mysql`
- Đảm bảo đã đợi container khởi động hoàn toàn (30-60 giây)

### Lỗi: "Access denied"
- Kiểm tra username/password trong config.php
- Kiểm tra environment variables trong docker-compose.yml

### Reset database
```bash
docker-compose down -v
docker-compose up -d
```

## 🎉 Hoàn thành!

Database của bạn đã sẵn sàng sử dụng với Docker. Bạn có thể:

- ✅ Sử dụng MySQL trên port 3306
- ✅ Truy cập phpMyAdmin trên port 8080
- ✅ Dữ liệu được lưu trữ an toàn trong Docker volume
- ✅ Dễ dàng backup và restore
- ✅ Không cần cài đặt MySQL trên máy

**Chúc bạn thành công! 🚀**

