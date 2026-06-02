@echo off
title Healthy Meal 啟動中...
echo.
echo  ========================================
echo    Healthy Meal 健康餐點網站 啟動中
echo  ========================================
echo.

echo  [1/2] 啟動伺服器 (port 3000)...
start "Healthy Meal - 伺服器" cmd /k "cd /d %~dp0 && node server.js"

echo  [2/2] 等待伺服器啟動...
timeout /t 3 /nobreak >nul

echo.
echo  ========================================
echo   啟動完成！自動開啟瀏覽器
echo   網址：http://localhost:3000/order-system.html
echo  ========================================
echo.

start http://localhost:3000/order-system.html

exit
