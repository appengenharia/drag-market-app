$templatePath = Join-Path $PSScriptRoot 'sw.template.js'
$outputPath = Join-Path $PSScriptRoot 'sw.js'
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

if (-not (Test-Path $templatePath)) {
  throw 'sw.template.js nao encontrado. Nao foi possivel gerar o service worker versionado.'
}

(Get-Content -Raw $templatePath) -replace '\{\{BUILD_TIMESTAMP\}\}', $timestamp | Set-Content -Path $outputPath
firebase deploy --only hosting
Write-Host "Deploy concluido. Versao: $timestamp"
