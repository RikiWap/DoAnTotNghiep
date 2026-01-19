# Hệ Thống CRM Bán Hàng (CRM Sales System)

## Giới thiệu
Đây là hệ thống CRM bán hàng được xây dựng với mục tiêu quản lý quy trình bán hàng hiệu quả. Hệ thống bao gồm đầy đủ các chức năng cần thiết cho doanh nghiệp.

### Các công nghệ sử dụng

**Backend:**
*   Java 21
*   Spring Boot 3.2
*   JOOQ (Java Object Oriented Querying)
*   Mysql (Database)
*   MinIO (Object Storage)
*   JWT (Authentication)
*   Maven

**Frontend:**
*   Node.js
*   React 19
*   Vite
*   Redux Toolkit
*   Bootstrap / React-Bootstrap
*   Sass

**Infrastructure:**
*   Docker & Docker Compose

## 5 hình ảnh demo
*(Vui lòng chèn 5 hình ảnh demo của hệ thống vào bên dưới)*

### 1. Dashboard tổng quan
![Dashboard](link-to-image-1)

### 2. Quản lý khách hàng
![Customer Management](link-to-image-2)

### 3. Quy trình bán hàng
![Sales Process](link-to-image-3)

### 4. Báo cáo doanh thu
![Revenue Report](link-to-image-4)

### 5. Quản lý luồng phân quyền động theo chức vụ
![Permission Management](link-to-image-5)

## Hướng dẫn cài đặt

### Yêu cầu môi trường
Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:
*   **Java JDK 21**
*   **Node.js** (Phiên bản LTS mới nhất)
*   **Maven**
*   **Docker**

### Cài đặt và chạy ứng dụng

#### 1. Cài đặt Docker, MinIO, MySQL và Cơ sở dữ liệu cho hệ thống
ở thư mục chính chứa docker-compose.yml và chạy lệnh:

```bash
docker compose up -d
```

Đợi cho các container chạy thành công, sau đó truy cập vào MySQL và tạo database cho hệ thống.

#### 2. Backend
Di chuyển vào thư mục backend (`be`) và thực hiện các lệnh sau:

```bash
cd be

# Build project và generate JOOQ code
mvn clean install

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```

#### 3. Frontend
Di chuyển vào thư mục frontend (`fe`) và thực hiện các lệnh sau:

```bash
cd fe

# Cài đặt các thư viện dependencies
npm install

# Chạy server development
npm run dev
```

Sau khi chạy thành công, truy cập ứng dụng tại địa chỉ được hiển thị trên terminal (thường là `http://localhost:5173`).
