@echo off
echo ===================================================
echo   MealMate - Local MongoDB Server Launcher
echo ===================================================
echo Starting mongod on port 27017...
if not exist "C:\Users\HP\mongo_data" mkdir "C:\Users\HP\mongo_data"
"C:\Users\HP\mongo_extract\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "C:\Users\HP\mongo_data" --bind_ip 127.0.0.1 --port 27017
pause
