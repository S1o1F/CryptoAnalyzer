@echo off
echo Starting FastAPI server...
start "FastAPI Server" cmd /k "python main.py"
timeout /t 3 /nobreak >nul
echo Opening frontend in browser...
start "" "prototype\index.html"
echo.
echo Frontend opened! Make sure the server is running on http://localhost:8000
pause


