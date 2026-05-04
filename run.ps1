$ErrorActionPreference = "Stop"

Write-Host "Setting up AI Real Estate Investment Analyzer..." -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed. Please install Python to continue." -ForegroundColor Red
    exit 1
}

# Setup Python Virtual Environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv and install requirements
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

Write-Host "Starting backend server..." -ForegroundColor Green
# Start uvicorn in the background using Start-Process, targeting the backend directory
$pythonExe = Join-Path $PWD "venv\Scripts\python.exe"
Start-Process -NoNewWindow -WorkingDirectory "backend" -FilePath $pythonExe -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000"

# Wait a few seconds for the server to start
Start-Sleep -Seconds 4

Write-Host "Opening Frontend..." -ForegroundColor Green
# Open the index.html in the default browser
Start-Process "frontend\index.html"

Write-Host "Setup complete. The application is running." -ForegroundColor Cyan
Write-Host "Press any key to stop the server and exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null

# Cleanup: Stop the background Python process (simplistic approach)
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Process -Name "python" -ErrorAction SilentlyContinue
