# Production Build Script for Zuper
# Run this script to prepare the app for production deployment

Write-Host "Building Zuper for Production..." -ForegroundColor Cyan
Write-Host ""

# Check if we're on prod branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "prod") {
    Write-Host "Warning: Not on prod branch (current: $currentBranch)" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Build cancelled" -ForegroundColor Red
        exit 1
    }
}

# Backend Build
Write-Host "Installing Backend Dependencies..." -ForegroundColor Green
Push-Location backend
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend dependency installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Backend dependencies installed" -ForegroundColor Green
Write-Host ""
Pop-Location

# Frontend Build
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Green
Push-Location frontend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend dependency installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Building Frontend for Production..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Frontend built successfully" -ForegroundColor Green
Write-Host ""
Pop-Location

Write-Host "Production Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Update backend/.env with production values"
Write-Host "  2. Deploy backend/ to your server (Railway, Render, Heroku, etc.)"
Write-Host "  3. Deploy frontend/dist to Vercel/Netlify or serve with nginx"
Write-Host ""
Write-Host "See PRODUCTION_DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
