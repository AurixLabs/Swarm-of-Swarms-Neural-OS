
#!/bin/bash

set -e  # Exit on any error

echo "🚀 Building Reasoning Engine WASM Module..."
echo "📍 Current directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Cargo.toml not found. Are you in the reasoning_engine directory?"
    echo "💡 Please run this script from: src/rust/reasoning_engine/"
    exit 1
fi

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ Error: wasm-pack is not installed"
    echo "💡 Install it with: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cargo clean
rm -rf pkg/

# Build the WASM module with wasm-pack
echo "📦 Running wasm-pack build..."
wasm-pack build --target web --release --out-dir pkg

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check what files were generated
    echo "📋 Generated files:"
    ls -la pkg/
    
    # Ensure the target directory exists
    echo "📁 Creating target directory..."
    mkdir -p ../../../public/wasm/
    
    # Find and copy the correct WASM file
    if [ -f "pkg/reasoning_engine_bg.wasm" ]; then
        echo "📦 Copying reasoning_engine_bg.wasm -> reasoning_engine.wasm"
        cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm
    elif [ -f "pkg/reasoning_engine.wasm" ]; then
        echo "📦 Copying reasoning_engine.wasm"
        cp pkg/reasoning_engine.wasm ../../../public/wasm/reasoning_engine.wasm
    else
        echo "❌ No WASM file found in pkg directory!"
        echo "Available files:"
        ls -la pkg/
        exit 1
    fi
    
    # Verify the copied file exists and has content
    if [ -f "../../../public/wasm/reasoning_engine.wasm" ]; then
        FILE_SIZE=$(stat -f%z "../../../public/wasm/reasoning_engine.wasm" 2>/dev/null || stat -c%s "../../../public/wasm/reasoning_engine.wasm" 2>/dev/null)
        echo "✅ File copied successfully!"
        echo "📊 File size: ${FILE_SIZE} bytes"
        
        # Check magic number
        echo "🔍 Verifying WASM magic number..."
        magic=$(xxd -l 4 -p ../../../public/wasm/reasoning_engine.wasm)
        if [ "$magic" = "0061736d" ]; then
            echo "✅ Valid WASM magic number detected!"
        else
            echo "❌ Invalid WASM magic number: $magic"
            echo "Expected: 0061736d"
            echo "File content preview:"
            xxd -l 32 ../../../public/wasm/reasoning_engine.wasm
            exit 1
        fi
        
        echo "🎉 Reasoning Engine WASM module ready!"
        echo "📍 File location: public/wasm/reasoning_engine.wasm"
    else
        echo "❌ Failed to copy WASM file!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    echo "💡 Try running: cargo check"
    exit 1
fi
