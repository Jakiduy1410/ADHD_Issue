@echo off
chcp 65001 > nul
cls
echo ======================================================================
echo    MILO QUEST x TRẠM THẤU HIỂU (ADHD EDTECH ECOSYSTEM)
echo ======================================================================
echo.
echo [1/2] Đang khởi chạy máy chủ Backend API và Giao diện Web (Port 8000)...
echo [2/2] Đang mở trình duyệt tại: http://localhost:8000
echo.
echo Nhấn Ctrl+C để dừng máy chủ bất cứ lúc nào.
echo ======================================================================
echo.

start "" "http://localhost:8000"
python src/api/server.py

pause
