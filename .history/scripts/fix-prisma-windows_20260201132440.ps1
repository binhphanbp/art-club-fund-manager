# Fix Prisma EPERM error on Windows
# Run: powershell -ExecutionPolicy Bypass -File scripts/fix-prisma-windows.ps1

Write-Host "`n🔧 Fixing Prisma EPERM Error on Windows`n" -ForegroundColor Cyan

# Step 1: Kill all Node processes
Write-Host "1️⃣  Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   ✅ Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  No Node processes found" -ForegroundColor Yellow
}

# Wait a bit
Start-Sleep -Seconds 2

# Step 2: Remove Prisma Client folders
Write-Host "`n2️⃣  Removing old Prisma Client..." -ForegroundColor Yellow

$paths = @(
    "node_modules\.prisma",
    "node_modules\@prisma\client"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ Removed: $path" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to remove: $path" -ForegroundColor Red
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  Not found: $path" -ForegroundColor Yellow
    }
}

# Step 3: Clear npm cache
Write-Host "`n3️⃣  Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✅ Cache cleared" -ForegroundColor Green

# Step 4: Generate Prisma Client
Write-Host "`n4️⃣  Generating new Prisma Client..." -ForegroundColor Yellow
$result = npx prisma generate 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma Client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "   Error output:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

# Step 5: Verify
Write-Host "`n5️⃣  Verifying installation..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "   ✅ Prisma Client installed correctly" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma Client not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "✅ FIX HOÀN THÀNH!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan

Write-Host "`n📝 Các bước tiếp theo:" -ForegroundColor Yellow
Write-Host "   1. Chạy: npm run dev" -ForegroundColor White
Write-Host "   2. Test upload!" -ForegroundColor White
Write-Host ""
