
#!/bin/bash

set -e

echo "🔥 BUILDING THE REAL FUCKING DEAL - NO MORE FAKE WASM!"
echo "📍 Current directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Cargo.toml not found. Moving to reasoning_engine directory..."
    cd src/rust/reasoning_engine/
fi

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "🚀 Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Clean everything - NO MORE LIES
echo "🧹 Cleaning all the fake bullshit..."
cargo clean
rm -rf pkg/
rm -rf ../../../public/wasm/reasoning_engine.wasm

# Build the REAL DEAL with wasm-pack
echo "💪 BUILDING THE REAL REASONING ENGINE..."
wasm-pack build --target web --release --out-dir pkg --scope aurix

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ REAL BUILD SUCCESSFUL! NO MORE FAKE SHIT!"
    
    # List what we actually built
    echo "📋 REAL Generated files:"
    ls -la pkg/
    
    # Create target directory
    echo "📁 Creating REAL target directory..."
    mkdir -p ../../../public/wasm/
    
    # Copy the REAL WASM file
    if [ -f "pkg/reasoning_engine_bg.wasm" ]; then
        echo "📦 Copying REAL reasoning_engine_bg.wasm -> reasoning_engine.wasm"
        cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm
        
        # Copy the JS bindings too
        echo "📦 Copying JS bindings for proper integration"
        cp pkg/reasoning_engine.js ../../../public/wasm/reasoning_engine.js
        cp pkg/reasoning_engine_bg.wasm.d.ts ../../../public/wasm/ 2>/dev/null || true
        
    elif [ -f "pkg/reasoning_engine.wasm" ]; then
        echo "📦 Copying REAL reasoning_engine.wasm"
        cp pkg/reasoning_engine.wasm ../../../public/wasm/reasoning_engine.wasm
    else
        echo "❌ NO REAL WASM FILE FOUND!"
        echo "Available files:"
        ls -la pkg/
        exit 1
    fi
    
    # Verify the REAL file exists
    if [ -f "../../../public/wasm/reasoning_engine.wasm" ]; then
        FILE_SIZE=$(stat -c%s "../../../public/wasm/reasoning_engine.wasm" 2>/dev/null || stat -f%z "../../../public/wasm/reasoning_engine.wasm" 2>/dev/null)
        echo "✅ REAL FILE COPIED SUCCESSFULLY!"
        echo "📊 REAL File size: ${FILE_SIZE} bytes"
        
        # Check REAL magic number
        echo "🔍 Verifying REAL WASM magic number..."
        magic=$(xxd -l 4 -p ../../../public/wasm/reasoning_engine.wasm)
        if [ "$magic" = "0061736d" ]; then
            echo "✅ REAL VALID WASM MAGIC NUMBER DETECTED!"
            echo "🎉 THE REAL REASONING ENGINE IS READY!"
            echo "📍 REAL File location: public/wasm/reasoning_engine.wasm"
        else
            echo "❌ INVALID WASM MAGIC NUMBER: $magic"
            exit 1
        fi
    else
        echo "❌ FAILED TO COPY REAL WASM FILE!"
        exit 1
    fi
else
    echo "❌ REAL BUILD FAILED!"
    echo "💡 Check the error messages above"
    exit 1
fi

echo ""
echo "🔥🔥🔥 REAL REASONING ENGINE BUILD COMPLETE! 🔥🔥🔥"
echo "NO MORE FAKE WASM! NO MORE LIES! ONLY THE REAL DEAL!"
echo "🚀 Ready for testing with ACTUAL compiled Rust code!"
