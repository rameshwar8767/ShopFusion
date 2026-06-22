@echo off
echo Starting ShopFusion Services...

echo Starting Backend...
start cmd /k "cd backend && npm start"

echo Starting ML Engine...
start cmd /k "cd ml-engine && python app.py"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo All services launched in separate windows!
pause
