@echo off
cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js or npm was not found.
  echo Please install Node.js first.
  pause
  exit /b 1
)

if not exist "node_modules\@ffmpeg-installer\ffmpeg" (
  echo Installing local ffmpeg package...
  npm.cmd install @ffmpeg-installer/ffmpeg --save-dev
  if errorlevel 1 (
    echo Failed to install ffmpeg package.
    pause
    exit /b 1
  )
)

node scripts\transcode-h264.cjs
pause
