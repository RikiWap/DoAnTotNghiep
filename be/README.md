# Base Backend - Spring Boot + JOOQ + MySQL

Dự án base backend sử dụng Spring Boot, JOOQ và MySQL.

## Cấu trúc dự án

```
Base-Monolithic/
├── core-backend/          # Module chính chứa business logic
├── entity-backend/        # Module chứa entities và JOOQ generated code
├── init.sql/              # SQL scripts
├── volumes/               # Docker volumes
└── docker-compose.yml     # Docker configuration
```

## Công nghệ sử dụng

- **Spring Boot 3.2.3**
- **JOOQ 3.18.6** - Type-safe SQL builder
- **MySQL 8.1.0** - Database
- **Maven** - Build tool
- **Docker & Docker Compose** - Containerization
- **JWT** - Authentication
- **MapStruct** - Object mapping

## Cài đặt và chạy

### 1. Khởi động database

```bash
docker-compose up -d mysql
```

### 2. Build chung

```bash
mvn clean compile -am -DskipTests -DconfigFile=src/main/resources/ -DspringProfilesActive=dev
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

## Cấu hình

### Database
- Host: localhost:3306
- Database: backend_base
- Username: root
- Password: root

### Application
- Port: 8080
- Context Path: /api

## Phát triển

### Thêm bảng mới
1. Tạo SQL script trong `database/`
2. Chạy script trên database
3. Generate JOOQ code: `mvn clean compile` trong entity-backend
4. Sử dụng generated classes trong core-backend

### Thêm API mới
1. Tạo Controller trong `core-backend/src/main/java/vn/backend/core/controller/`
2. Tạo Service trong `core-backend/src/main/java/vn/backend/core/service/`
3. Sử dụng JOOQ DSLContext để truy vấn database

## Lưu ý

- JOOQ code được generate tự động từ database schema
- Sử dụng MapStruct để mapping giữa entities và DTOs
- JWT được sử dụng cho authentication
- Password được hash bằng BCrypt
