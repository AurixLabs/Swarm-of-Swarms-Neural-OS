
# WASM Modules Directory

This directory contains the compiled WASM modules for the CMA Neural OS.

## Real vs Phantom Files
- This directory was created because Lovable's sandbox was serving phantom 0-byte files
- Real compiled WASM files need to be placed here for Lovable to access them
- This is separate from public/wasm/ which exists in the real repo but Lovable can't see

## Required Files
- reasoning_engine.wasm (141KB+ TinyLlama inference)
- neuromorphic.wasm (284KB+ neuromorphic processor)
- cma_neural_os.wasm
- llama_bridge.wasm
- hybrid_intelligence.wasm
- fused_kernels.wasm

## Status
🚨 PLACEHOLDER DIRECTORY - Real WASM files need to be uploaded to Lovable manually
