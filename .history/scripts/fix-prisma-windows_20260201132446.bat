@echo off
REM Fix Prisma EPERM error on Windows
REM Run: scripts\fix-prisma-windows.bat

echo.
echo ====================================
echo Fix Prisma EPERM Error on Windows
echo ====================================
echo.

REM Step 1: Kill Node processes
echo 1. Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Node processes stopped
) else (
    echo    [INFO] No Node processes found
)

REM Wait
timeout /t 2 /nobreak >nul

REM Step 2: Remove Prisma folders
echo.
echo 2. Removing old Prisma Client...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma" 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] Removed .prisma folder
    ) else (
        echo    [ERROR] Failed to remove .prisma folder
    )
) else (
    echo    [INFO] .prisma folder not found
)

if exist "node_modules\@prisma\client" (
    rmdir /s /q "node_modules\@prisma\client" 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] Removed @prisma/client folder
    ) else (
        echo    [ERROR] Failed to remove @prisma/client folder
    )
) else (
    echo    [INFO] @prisma/client folder not found
)

REM Step 3: Clear cache
echo.
echo 3. Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo    [OK] Cache cleared

REM Step 4: Generate Prisma Client
echo.
echo 4. Generating new Prisma Client...
call npx prisma generate
if %errorlevel% equ 0 (
    echo    [OK] Prisma Client generated!
) else (
    echo    [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)

REM Step 5: Verify
echo.
echo 5. Verifying installation...
if exist "node_modules\.prisma\client" (
    echo    [OK] Prisma Client installed correctly
) else (
    echo    [ERROR] Prisma Client not found
    pause
    exit /b 1
)

echo.
echo ====================================
echo FIX HOAN THANH!
echo ====================================
echo.
echo Cac buoc tiep theo:
echo    1. Chay: npm run dev
echo    2. Test upload!
echo.
pause
