@echo off
chcp 65001 > nul
cls
echo ======================================================================
echo    MILO QUEST x TRAM THAU HIEU - CHE DO 1 PHONE + 1 PC
echo ======================================================================
echo.
echo [1/3] Dang khoi chay Backend FastAPI (Port 8000)...
start "Milo Backend Server" cmd /k python src/api/server.py

ping 127.0.0.1 -n 3 > nul

echo [2/3] Dang khoi chay Ngrok HTTPS Tunnel cho Dien thoai...
start "Milo Ngrok Tunnel" cmd /k "C:\Users\ADMIN\AppData\Local\ngrok\ngrok.exe" http 8000 --url https://moonshine-poem-shore.ngrok-free.dev

ping 127.0.0.1 -n 3 > nul

echo [3/3] Dang mo trinh duyet May tinh (May Me Lan)...
start "" "http://localhost:8000/?role=parent"

echo.
echo ======================================================================
echo  [DIEN THOAI BE LEO] Mo trinh duyet dien thoai va truy cap link:
echo  https://moonshine-poem-shore.ngrok-free.dev/?role=child^&standalone=1
echo.
echo  [DIEN THOAI ME LAN (NEU DEMO 2 PHONE)] Truy cap:
echo  https://moonshine-poem-shore.ngrok-free.dev/?role=parent^&standalone=1
echo.
echo  [MAY TINH ME LAN] Trinh duyet da tu dong mo tai:
echo  http://localhost:8000/?role=parent
echo ======================================================================
echo.
echo Giu nguyen cac cua so server dang chay trong khi su dung.
echo.
pause
