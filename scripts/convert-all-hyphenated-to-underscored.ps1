
# Convert all hyphenated WASM naming to underscored naming
Write-Host "🔄 Converting ALL hyphenated WASM names to underscored naming..." -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Define the mapping of old names to new names
$nameMapping = @{
    'cma-neural-os' = 'cma_neural_os'
    'llama-bridge' = 'llama_bridge'
    'neuromorphic' = 'neuromorphic'
}

# Step 1: Rename actual files in public/wasm/
Write-Host ""
Write-Host "📁 Step 1: Renaming files in public/wasm/..." -ForegroundColor Yellow
$wasmDir = "public\wasm"
if (Test-Path $wasmDir) {
    foreach ($oldName in $nameMapping.Keys) {
        $newName = $nameMapping[$oldName]
        
        # Find and rename .wasm files
        $wasmFiles = Get-ChildItem $wasmDir -Filter "$oldName*.wasm" -ErrorAction SilentlyContinue
        foreach ($file in $wasmFiles) {
            $newFileName = $file.Name -replace [regex]::Escape($oldName), $newName
            $newPath = Join-Path $wasmDir $newFileName
            if ($file.FullName -ne $newPath) {
                Write-Host "  Renaming: $($file.Name) -> $newFileName" -ForegroundColor Green
                Move-Item $file.FullName $newPath -Force
            }
        }
        
        # Find and rename .js files
        $jsFiles = Get-ChildItem $wasmDir -Filter "$oldName*.js" -ErrorAction SilentlyContinue
        foreach ($file in $jsFiles) {
            $newFileName = $file.Name -replace [regex]::Escape($oldName), $newName
            $newPath = Join-Path $wasmDir $newFileName
            if ($file.FullName -ne $newPath) {
                Write-Host "  Renaming: $($file.Name) -> $newFileName" -ForegroundColor Green
                Move-Item $file.FullName $newPath -Force
            }
        }
    }
} else {
    Write-Host "  ⚠️ public\wasm directory not found" -ForegroundColor Yellow
}

# Step 2: Update file contents across the entire codebase
Write-Host ""
Write-Host "📝 Step 2: Updating file contents across codebase..." -ForegroundColor Yellow

# Define file extensions to search
$extensions = @('*.ts', '*.tsx', '*.js', '*.jsx', '*.sh', '*.bat', '*.md', '*.json')

# Define directories to search
$searchDirs = @('src', 'scripts', 'public', 'docs')

$totalReplacements = 0

foreach ($dir in $searchDirs) {
    if (Test-Path $dir) {
        Write-Host "  Searching in $dir..." -ForegroundColor Cyan
        
        foreach ($ext in $extensions) {
            $files = Get-ChildItem $dir -Recurse -Include $ext -ErrorAction SilentlyContinue | 
                     Where-Object { $_.FullName -notmatch '(node_modules|\.git|target|pkg)' }
            
            foreach ($file in $files) {
                try {
                    $content = Get-Content $file.FullName -Raw -ErrorAction Stop -Encoding UTF8
                    $originalContent = $content
                    
                    # Replace each hyphenated name with underscored version
                    foreach ($oldName in $nameMapping.Keys) {
                        $newName = $nameMapping[$oldName]
                        
                        # File paths and imports
                        $content = $content -replace "$oldName\.wasm", "$newName.wasm"
                        $content = $content -replace "$oldName\.js", "$newName.js"
                        $content = $content -replace "$oldName_bg\.wasm", "$newName_bg.wasm"
                        
                        # String literals and URLs
                        $content = $content -replace "/$oldName/", "/$newName/"
                        $content = $content -replace "'$oldName'", "'$newName'"
                        $content = $content -replace "`"$oldName`"", "`"$newName`""
                        
                        # Directory names in paths
                        $content = $content -replace "pkg/$oldName/", "pkg/$newName/"
                        $content = $content -replace "wasm/$oldName", "wasm/$newName"
                        
                        # Module names and identifiers
                        $content = $content -replace "loadModule\('$oldName'\)", "loadModule('$newName')"
                        $content = $content -replace "getModule\('$oldName'\)", "getModule('$newName')"
                        
                        # Comments and documentation
                        $content = $content -replace "# $oldName", "# $newName"
                        $content = $content -replace "// $oldName", "// $newName"
                    }
                    
                    # Only write if content changed
                    if ($content -ne $originalContent) {
                        Set-Content $file.FullName $content -NoNewline -Encoding UTF8
                        Write-Host "    ✅ Updated: $($file.FullName)" -ForegroundColor Green
                        $totalReplacements++
                    }
                    
                } catch {
                    Write-Host "    ⚠️ Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
}

# Step 3: Clean up old files that might still exist
Write-Host ""
Write-Host "🧹 Step 3: Cleaning up any remaining old files..." -ForegroundColor Yellow

# Remove old hyphenated files from various locations
$cleanupPaths = @(
    "public\wasm\cma-neural-os.*",
    "public\wasm\llama-bridge.*",
    "src\wasm\cma-neural-os.*",
    "src\wasm\llama-bridge.*",
    "src\public\wasm\cma-neural-os.*",
    "src\public\wasm\llama-bridge.*"
)

foreach ($pattern in $cleanupPaths) {
    $files = Get-ChildItem $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Write-Host "  Removing old file: $($file.FullName)" -ForegroundColor Red
        Remove-Item $file.FullName -Force
    }
}

# Step 4: Summary
Write-Host ""
Write-Host "✅ CONVERSION COMPLETE!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "  - Files updated: $totalReplacements" -ForegroundColor Green
Write-Host "  - Naming convention: hyphenated -> underscored" -ForegroundColor Green
Write-Host "  - All WASM modules now use consistent naming" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Rebuild WASM modules: cd src\rust; .\build.bat" -ForegroundColor Cyan
Write-Host "  2. Test the application to ensure everything works" -ForegroundColor Cyan
Write-Host "  3. Commit the changes to git" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 All hyphenated WASM names converted to underscored!" -ForegroundColor Magenta
