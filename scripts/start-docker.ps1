$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Set-Location -LiteralPath $ProjectRoot

for ($attempt = 1; $attempt -le 60; $attempt++) {
  docker info *> $null

  if ($LASTEXITCODE -eq 0) {
    break
  }

  Start-Sleep -Seconds 2
}

docker compose up -d
