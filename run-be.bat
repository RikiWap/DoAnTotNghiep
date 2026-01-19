@echo off
echo ===============================
echo Starting Spring Boot Backend
echo ===============================

REM Chuyển vào thư mục backend
cd /d "%~dp0be\core-backend"

REM Chạy Spring Boot
mvn spring-boot:run

pause
