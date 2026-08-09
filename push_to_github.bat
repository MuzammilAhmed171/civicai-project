@echo off
title Pushing CivicAI to GitHub
echo ========================================================
echo Pushing CivicAI Project to https://github.com/MuzammilAhmed171/civicai-project.git
echo ========================================================
echo.
git push -u origin main
echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Project pushed to GitHub successfully!
) else (
    echo FAILED: Please check GitHub credentials or permissions above.
)
echo ========================================================
echo.
pause
