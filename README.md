# Charan Aquarium - Full Website

A modern e-commerce website for aquarium products built with React, TypeScript, Vite, and MySQL (Docker).

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v16 or higher)
- **Docker Desktop** (for database)
- **PHP** (v8.0 or higher) - for API server

### Step 1: Setup Database with Docker

1. **Navigate to database folder:**
   ```bash
   cd database
   ```

2. **Start Docker containers:**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Download MySQL 8.0 and phpMyAdmin images
   - Create database `charan_aquarium`
   - Initialize tables and seed data (5 users, 10 products)

3. **Verify containers are running:**
   ```bash
   docker-compose ps
   ```
   
   You should see:
   - `charan_aquarium_db` (MySQL) - Port 3306
   - `charan_phpmyadmin` (phpMyAdmin) - Port 8080

4. **Access phpMyAdmin (Optional):**
   - Open: `http://localhost:8080`
   - Server: `mysql`
   - Username: `root`
   - Password: `rootpassword`

### Step 2: Start PHP API Server

1. **Navigate to database folder (if not already):**
   ```bash
   cd database
   ```

2. **Start PHP built-in server:**
   ```bash
   php -S localhost:8000
   ```

   The API will be available at:
   - Test Connection: `http://localhost:8000/test_connection.php`
   - Auth API: `http://localhost:8000/api/auth.php`
   - Products API: `http://localhost:8000/api/products.php`
   - Orders API: `http://localhost:8000/api/orders.php`

### Step 3: Install Frontend Dependencies

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install npm packages:**
   ```bash
   npm install
   ```

### Step 4: Start React Development Server

1. **Run Vite dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - The app will be available at `http://localhost:3000` (or the port shown in terminal)

## 📁 Project Structure

```
Charan-Aquarium-main/
├── database/              # Backend API & Database
│   ├── api/              # PHP API endpoints
│   │   ├── auth.php      # Authentication
│   │   ├── products.php  # Products CRUD
│   │   └── orders.php    # Orders management
│   ├── docker-compose.yml # Docker configuration
│   ├── init.sql          # Database schema & seed data
│   └── config.php        # Database connection config
├── pages/                # React pages
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── Cart.tsx
│   ├── Auth.tsx
│   ├── Orders.tsx
│   └── Admin.tsx
├── components/           # React components
├── services/            # API service layer
└── App.tsx              # Main app component
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

### Database Connection

The database configuration is in `database/config.php`:

```php
DB_HOST: localhost
DB_PORT: 3306
DB_NAME: charan_aquarium
DB_USER: charan_user
DB_PASSWORD: charan_password
```

### Frontend API Endpoints

Update `services/api.ts` if you need to change API base URL (default: `http://localhost:8000`)

## 📡 API Endpoints

### Authentication
- `POST /api/auth.php` - Login
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
- `POST /api/products.php` - Create product (Admin only)
- `DELETE /api/products.php?id=1` - Delete product (Admin only)

### Orders
- `GET /api/orders.php?user_id=1` - Get user orders
- `GET /api/orders.php?user_id=1&all=true` - Get all orders (Admin)
- `POST /api/orders.php` - Create new order
- `PUT /api/orders.php` - Update order status (Admin)

## 🐳 Docker Commands

### Start Services
```bash
cd database
docker-compose up -d
```

### Stop Services
```bash
docker-compose stop
```

### View Logs
```bash
docker-compose logs -f mysql
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### Backup Database
```bash
docker exec charan_aquarium_db mysqldump -u root -prootpassword charan_aquarium > backup.sql
```

## 🧪 Testing

### Test Database Connection
1. Start PHP server: `php -S localhost:8000` (in database folder)
2. Open: `http://localhost:8000/test_connection.php`

### Test API Endpoints
- Products: `http://localhost:8000/api/products.php`
- Auth: Use Postman or curl to test login

## ⚠️ Troubleshooting

### Port Already in Use
- If port 3000 is busy, Vite will use the next available port
- Check terminal output for the actual port number

### Database Connection Failed
- Ensure Docker containers are running: `docker-compose ps`
- Check MySQL is healthy: `docker-compose logs mysql`
- Verify config.php has correct credentials

### PHP Server Not Starting
- Check PHP is installed: `php --version`
- Ensure port 8000 is not in use
- Try a different port: `php -S localhost:8001`

### Docker Containers Won't Start
- Check Docker Desktop is running
- Verify port 3306 and 8080 are available
- Check logs: `docker-compose logs`

## 📝 Notes

1. **Development Only**: Passwords are stored in plain text for demo purposes. In production, use password hashing.

2. **CORS**: API has CORS enabled for development. Configure properly for production.

3. **Environment Variables**: For production, move sensitive data to environment variables.

4. **Data Persistence**: Database data is stored in Docker volume `mysql_data`. Use `docker-compose down -v` to remove it.

## 🚀 Production Deployment

1. Build frontend: `npm run build`
2. Configure production API URL
3. Use proper password hashing
4. Enable HTTPS
5. Configure proper CORS
6. Set up environment variables
7. Use production database credentials

## 📞 Support

For issues or questions:
- Check Docker logs: `docker-compose logs`
- Check PHP errors in browser console
- Verify all services are running

---

**Built with ❤️ for Aquarium Enthusiasts**
