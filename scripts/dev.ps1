$backendPath = Join-Path $PSScriptRoot "..\\backend"
$frontendPath = Join-Path $PSScriptRoot "..\\frontend"

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm start
} -ArgumentList $backendPath

try {
    Set-Location $frontendPath
    npm run dev
}
finally {
    if ($backendJob) {
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
    }
}
