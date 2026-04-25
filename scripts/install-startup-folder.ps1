$ErrorActionPreference = "Stop"

$StartupDir = [Environment]::GetFolderPath("Startup")
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$StartScript = Join-Path $ProjectRoot "scripts\start-docker.ps1"
$StartupFile = Join-Path $StartupDir "Novatria Bot Docker.cmd"

$Content = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$StartScript"
"@

Set-Content -LiteralPath $StartupFile -Value $Content -Encoding ASCII

Write-Host "Startup file installed: $StartupFile"
Write-Host "Project: $ProjectRoot"
