@echo off
echo Dang khoi tao Git va day toan bo du an (tru node_modules) len GitHub...
git init
git add .
git commit -m "first commit: add all projects"
git branch -M main
git remote add origin https://github.com/nguyenxuanduc789/CRM.git
git push -u origin main
echo.
echo Hoan thanh! Nhan phim bat ky de thoat...
pause
