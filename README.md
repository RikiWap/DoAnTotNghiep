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

### 1. Dashboard tổng quan
![Dashboard]
<img width="1873" height="966" alt="Screenshot 2026-01-19 123655" src="https://github.com/user-attachments/assets/469e152c-6ceb-4803-9cf3-e24949dc0a21" />

### 2. Quản lý khách hàng
![Customer Management]
<img width="1876" height="971" alt="Screenshot 2026-01-19 123845" src="https://github.com/user-attachments/assets/a4baac28-d305-4d05-93d2-7459a1ca6fbb" />

### 3. Quy trình bán hàng
![Sales Process]
<img width="1877" height="970" alt="Screenshot 2026-01-19 124222" src="https://github.com/user-attachments/assets/80673bf6-9158-4dc6-aeb1-8ad9d3e296f2" />

### 4. Báo cáo doanh thu
![Revenue Report]
<img width="1882" height="972" alt="Screenshot 2026-01-19 123932" src="https://github.com/user-attachments/assets/bc744a5e-a9f0-4bfd-be53-150c88bfc424" />

### 5. Quản lý luồng phân quyền động theo chức vụ
![Permission Management]
<img width="1879" height="972" alt="Screenshot 2026-01-19 124011" src="https://github.com/user-attachments/assets/8499c100-f19f-4367-ad7b-04bf51f6bc27" />

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
