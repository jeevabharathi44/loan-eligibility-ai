@echo off
chcp 65001 >nul
title Smart Digital Lending System Launcher
cd /d "%~dp0"
start "" python "launcher.py"
