$ErrorActionPreference = "Stop"

$StartupDir = [Environment]::GetFolderPath("Startup")
$StartupFile = Join-Path $StartupDir "Novatria Bot Docker.cmd"

if (Test-Path -LiteralPath $StartupFile) {
  Remove-Item -LiteralPath $StartupFile
  Write-Host "Startup file removed: $StartupFile"
} else {
  Write-Host "Startup file not found: $StartupFile"
}
