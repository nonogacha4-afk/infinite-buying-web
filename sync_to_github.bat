@echo off
setlocal
echo ===================================================
echo   AUTOMATED GITHUB SYNC TOOL (V3.0)
echo ===================================================
echo.

:: 1. Check if it is a git repo
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    git remote add origin https://github.com/nonogacha4-afk/infinite-buying-web.git
    echo [INFO] Remote added: https://github.com/nonogacha4-afk/infinite-buying-web.git
)

:: 2. Pull latest just in case
echo [INFO] Pulling latest changes from main...
git pull origin main --rebase

:: 3. Add and Commit
echo [INFO] Staging changes...
git add .
echo [INFO] Committing changes (V3.0 Major Upgrade)...
git commit -m "Automated Update: Major Version Upgrade to V3.0 & UI Polishing"

:: 4. Push
echo [INFO] Pushing to GitHub...
echo.
echo [IMPORTANT] A login window may appear if you are not currently authenticated via Git.
echo.
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. Please check your credentials or network.
) else (
    echo.
    echo [SUCCESS] Successfully updated GitHub!
    echo [INFO] Vercel will start deploying now.
)

echo.
pause
