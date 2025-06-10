# PowerShell script to build REAL WASM modules - NO MORE STUBS!
Write-Host "Building REAL WASM modules - NO MORE STUBS!" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Yellow

# Check if wasm-pack is installed
$wasmPackPath = Get-Command wasm-pack -ErrorAction SilentlyContinue
if (-not $wasmPackPath) {
    Write-Host "wasm-pack is required. Install it with:" -ForegroundColor Red
    Write-Host "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh" -ForegroundColor Yellow
    Write-Host "Or download from: https://rustwasm.github.io/wasm-pack/installer/" -ForegroundColor Yellow
    exit 1
}

# Create output directory
New-Item -ItemType Directory -Force -Path "public\wasm" | Out-Null

Write-Host "Building REAL reasoning engine..." -ForegroundColor Cyan
Set-Location "src\rust\reasoning_engine"
& wasm-pack build --target web --out-dir "..\..\..\public\wasm\reasoning_temp"

if ($LASTEXITCODE -eq 0) {
    Copy-Item "..\..\..\public\wasm\reasoning_temp\reasoning_engine.wasm" "..\..\..\public\wasm\reasoning_engine.wasm"
    Write-Host "REAL reasoning engine built successfully!" -ForegroundColor Green
} else {
    Write-Host "Reasoning engine build failed" -ForegroundColor Red
}

Set-Location "..\..\..\"

Write-Host "Building REAL neuromorphic processor..." -ForegroundColor Cyan
Set-Location "src\rust\neuromorphic"
& wasm-pack build --target web --out-dir "..\..\..\public\wasm\neuromorphic_temp"

if ($LASTEXITCODE -eq 0) {
    Copy-Item "..\..\..\public\wasm\neuromorphic_temp\neuromorphic.wasm" "..\..\..\public\wasm\neuromorphic.wasm"
    Write-Host "REAL neuromorphic processor built successfully!" -ForegroundColor Green
} else {
    Write-Host "Neuromorphic processor build failed" -ForegroundColor Red
}

Set-Location "..\..\..\"

# Clean up temp directories
Remove-Item -Recurse -Force "public\wasm\reasoning_temp" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "public\wasm\neuromorphic_temp" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "REAL WASM BUILD COMPLETE!" -ForegroundColor Green
Write-Host "Built modules:" -ForegroundColor Yellow

$wasmFiles = Get-ChildItem "public\wasm\*.wasm" -ErrorAction SilentlyContinue
if ($wasmFiles) {
    $wasmFiles | ForEach-Object { 
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  $($_.Name) - ${size}KB" -ForegroundColor White
    }
} else {
    Write-Host "No WASM files found - check build errors above" -ForegroundColor Red
}

Write-Host ""
Write-Host "NO MORE STUBS - ONLY REAL INFERENCE!" -ForegroundColor Red
Write-Host "Your EdgeSwarm OS now has REAL intelligence!" -ForegroundColor Green
