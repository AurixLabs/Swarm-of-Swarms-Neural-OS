# PowerShell script to build the REAL FUCKING DEAL - NO MORE FAKE WASM!
Write-Host "🔥 BUILDING THE REAL FUCKING DEAL - NO MORE FAKE WASM!" -ForegroundColor Red
Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "Cargo.toml")) {
    Write-Host "❌ Error: Cargo.toml not found. Moving to reasoning_engine directory..." -ForegroundColor Red
    Set-Location "src\rust\reasoning_engine\"
}

# Check if wasm-pack is installed
$wasmPackPath = Get-Command wasm-pack -ErrorAction SilentlyContinue
if (-not $wasmPackPath) {
    Write-Host "🚀 Installing wasm-pack..." -ForegroundColor Cyan
    Write-Host "Download from: https://rustwasm.github.io/wasm-pack/installer/" -ForegroundColor Yellow
    Write-Host "Or use: iwr https://rustwasm.github.io/wasm-pack/installer/init.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Clean everything - NO MORE LIES
Write-Host "🧹 Cleaning all the fake bullshit..." -ForegroundColor Yellow
& cargo clean
Remove-Item -Recurse -Force "pkg\" -ErrorAction SilentlyContinue
Remove-Item -Force "..\..\..\public\wasm\reasoning_engine.wasm" -ErrorAction SilentlyContinue

# Build the REAL DEAL with wasm-pack
Write-Host "💪 BUILDING THE REAL REASONING ENGINE..." -ForegroundColor Green
& wasm-pack build --target web --release --out-dir pkg --scope aurix

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ REAL BUILD SUCCESSFUL! NO MORE FAKE SHIT!" -ForegroundColor Green
    
    # List what we actually built
    Write-Host "📋 REAL Generated files:" -ForegroundColor Cyan
    Get-ChildItem "pkg\" -Force
    
    # Create target directory
    Write-Host "📁 Creating REAL target directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "..\..\..\public\wasm\" | Out-Null
    
    # Copy the REAL WASM file - Fixed the if/elseif/else structure
    if (Test-Path "pkg\reasoning_engine_bg.wasm") {
        Write-Host "📦 Copying REAL reasoning_engine_bg.wasm -> reasoning_engine.wasm" -ForegroundColor Green
        Copy-Item "pkg\reasoning_engine_bg.wasm" "..\..\..\public\wasm\reasoning_engine.wasm"
        
        # Copy the JS bindings too
        Write-Host "📦 Copying JS bindings for proper integration" -ForegroundColor Green
        Copy-Item "pkg\reasoning_engine.js" "..\..\..\public\wasm\reasoning_engine.js"
        if (Test-Path "pkg\reasoning_engine_bg.wasm.d.ts") {
            Copy-Item "pkg\reasoning_engine_bg.wasm.d.ts" "..\..\..\public\wasm\"
        }
    } elseif (Test-Path "pkg\reasoning_engine.wasm") {
        Write-Host "📦 Copying REAL reasoning_engine.wasm" -ForegroundColor Green
        Copy-Item "pkg\reasoning_engine.wasm" "..\..\..\public\wasm\reasoning_engine.wasm"
    } else {
        Write-Host "❌ NO REAL WASM FILE FOUND!" -ForegroundColor Red
        Write-Host "Available files:" -ForegroundColor Yellow
        Get-ChildItem "pkg\" -Force
        exit 1
    }
    
    # Verify the REAL file exists
    if (Test-Path "..\..\..\public\wasm\reasoning_engine.wasm") {
        $fileSize = (Get-Item "..\..\..\public\wasm\reasoning_engine.wasm").Length
        Write-Host "✅ REAL FILE COPIED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "📊 REAL File size: $fileSize bytes" -ForegroundColor Cyan
        
        # Check REAL magic number
        Write-Host "🔍 Verifying REAL WASM magic number..." -ForegroundColor Cyan
        $bytes = [System.IO.File]::ReadAllBytes("..\..\..\public\wasm\reasoning_engine.wasm")
        if ($bytes.Length -ge 4) {
            $magic = [System.BitConverter]::ToString($bytes[0..3]) -replace '-', ''
            if ($magic -eq "0061736D") {
                Write-Host "✅ REAL VALID WASM MAGIC NUMBER DETECTED!" -ForegroundColor Green
                Write-Host "🎉 THE REAL REASONING ENGINE IS READY!" -ForegroundColor Green
                Write-Host "📍 REAL File location: public\wasm\reasoning_engine.wasm" -ForegroundColor Cyan
            } else {
                Write-Host "❌ INVALID WASM MAGIC NUMBER: $magic" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ FILE TOO SMALL!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ FAILED TO COPY REAL WASM FILE!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ REAL BUILD FAILED!" -ForegroundColor Red
    Write-Host "💡 Check the error messages above" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔥🔥🔥 REAL REASONING ENGINE BUILD COMPLETE! 🔥🔥🔥" -ForegroundColor Red
Write-Host "NO MORE FAKE WASM! NO MORE LIES! ONLY THE REAL DEAL!" -ForegroundColor Green
Write-Host "🚀 Ready for testing with ACTUAL compiled Rust code!" -ForegroundColor Cyan
