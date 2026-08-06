@echo off
title Pushing AI-Ticket to GitHub
echo ============================================================
echo   🐙 Initializing and Pushing AI-Ticket Repository to GitHub
echo   Target Repo: git@github.com:Aman678317/AI-Ticket.git
echo ============================================================
echo.

cd /d "c:\Users\acer\Desktop\Ai ticket"

echo Initializing Git repository...
git init

echo Adding files...
git add .

echo Committing code...
git commit -m "Initial commit: Enterprise AI Support Ticket Classification & Auto-Response System"

echo Setting default branch to main...
git branch -M main

echo Configuring remote repository...
git remote remove origin 2>nul
git remote add origin git@github.com:Aman678317/AI-Ticket.git

echo Pushing code to GitHub...
git push -u origin main

echo.
echo ============================================================
echo   ✅ GitHub Push Process Completed!
echo ============================================================
pause
