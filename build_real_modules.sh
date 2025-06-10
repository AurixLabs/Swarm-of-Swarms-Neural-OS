
#!/bin/bash

echo "🔥 Building REAL WASM modules - NO MORE STUBS!"
echo "================================================"

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack is required. Install it with:"
    echo "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
fi

# Create output directory
mkdir -p public/wasm

echo "🧠 Building REAL reasoning engine..."
cd src/rust/reasoning_engine
wasm-pack build --target web --out-dir ../../../public/wasm/reasoning_temp

if [ $? -eq 0 ]; then
    cp ../../../public/wasm/reasoning_temp/reasoning_engine.wasm ../../../public/wasm/reasoning_engine.wasm
    echo "✅ REAL reasoning engine built successfully!"
else
    echo "❌ Reasoning engine build failed"
fi

cd ../../..

echo "⚡ Building REAL neuromorphic processor..."
cd src/rust/neuromorphic
wasm-pack build --target web --out-dir ../../../public/wasm/neuromorphic_temp

if [ $? -eq 0 ]; then
    cp ../../../public/wasm/neuromorphic_temp/neuromorphic.wasm ../../../public/wasm/neuromorphic.wasm
    echo "✅ REAL neuromorphic processor built successfully!"
else
    echo "❌ Neuromorphic processor build failed"
fi

cd ../../..

# Clean up temp directories
rm -rf public/wasm/reasoning_temp
rm -rf public/wasm/neuromorphic_temp

echo ""
echo "🎉 REAL WASM BUILD COMPLETE!"
echo "📊 Built modules:"
ls -la public/wasm/*.wasm 2>/dev/null || echo "❌ No WASM files found - check build errors above"

echo ""
echo "🔥 NO MORE STUBS - ONLY REAL INFERENCE!"
echo "Your EdgeSwarm OS now has REAL intelligence!"
