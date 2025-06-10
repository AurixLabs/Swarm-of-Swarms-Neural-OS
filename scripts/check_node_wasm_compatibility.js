
/**
 * Node.js and WASM Compatibility Checker
 * Checks if current Node.js version is compatible with WASM modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 CMA Neural OS - Node.js & WASM Compatibility Check');
console.log('=====================================================');

// Check Node.js version
const nodeVersion = process.version;
const nodeMajorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`📦 Current Node.js version: ${nodeVersion}`);
console.log(`📊 Major version: ${nodeMajorVersion}`);

// Check Node.js version compatibility
if (nodeMajorVersion >= 18) {
  console.log('✅ Node.js version is compatible with WASM (18+)');
} else if (nodeMajorVersion >= 16) {
  console.log('⚠️  Node.js version may work but 18+ is recommended');
} else {
  console.log('❌ Node.js version too old. Please upgrade to 18+');
}

// Function to find package.json in current or parent directories
function findPackageJson(startDir = process.cwd()) {
  let currentDir = startDir;
  
  for (let i = 0; i < 10; i++) { // Check up to 10 levels up
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      return { found: true, path: packageJsonPath, dir: currentDir };
    }
    
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root
    currentDir = parentDir;
  }
  
  return { found: false, path: null, dir: null };
}

// Search for package.json
console.log(`📁 Starting search from: ${process.cwd()}`);
const packageResult = findPackageJson();

if (packageResult.found) {
  console.log(`✅ Found package.json at: ${packageResult.path}`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageResult.path, 'utf8'));
    console.log(`📋 Project: ${packageJson.name || 'unnamed'}`);
    console.log(`📋 Version: ${packageJson.version || 'unknown'}`);
    
    // Check Node.js engines requirement
    if (packageJson.engines && packageJson.engines.node) {
      console.log(`⚙️ Required Node.js: ${packageJson.engines.node}`);
    }
    
    // Check for WASM-related dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const wasmDeps = Object.keys(dependencies).filter(dep => 
      dep.includes('wasm') || dep.includes('bindgen') || dep === 'vite'
    );
    
    if (wasmDeps.length > 0) {
      console.log(`🦀 WASM-related packages: ${wasmDeps.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
  }
} else {
  console.log('❌ No package.json found in current directory or parents');
  console.log('💡 Make sure you\'re running this from the project root');
}

// Check WASM files
console.log('\n🦀 Checking WASM modules...');
const possibleWasmDirs = [
  path.join(packageResult.dir || process.cwd(), 'public', 'wasm'),
  path.join(packageResult.dir || process.cwd(), 'src', 'wasm'),
  path.join(packageResult.dir || process.cwd(), 'wasm')
];

let wasmFound = false;
for (const wasmDir of possibleWasmDirs) {
  if (fs.existsSync(wasmDir)) {
    const wasmFiles = fs.readdirSync(wasmDir).filter(file => file.endsWith('.wasm'));
    if (wasmFiles.length > 0) {
      console.log(`✅ Found ${wasmFiles.length} WASM files in ${wasmDir}:`);
      wasmFiles.forEach(file => {
        const filePath = path.join(wasmDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📦 ${file} (${Math.round(stats.size / 1024)}KB)`);
      });
      wasmFound = true;
      break;
    }
  }
}

if (!wasmFound) {
  console.log('❌ No WASM files found');
  console.log('💡 Run Rust build scripts to generate WASM modules');
}

// Check Rust toolchain
console.log('\n🦀 Checking Rust toolchain...');
try {
  const { execSync } = await import('child_process');
  
  try {
    const rustVersion = execSync('rustc --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Rust: ${rustVersion}`);
  } catch {
    console.log('❌ Rust not found - install from https://rustup.rs/');
  }
  
  try {
    const cargoVersion = execSync('cargo --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Cargo: ${cargoVersion}`);
  } catch {
    console.log('❌ Cargo not found');
  }
  
  try {
    const targets = execSync('rustup target list --installed', { encoding: 'utf8' });
    if (targets.includes('wasm32-unknown-unknown')) {
      console.log('✅ WASM target installed');
    } else {
      console.log('❌ WASM target missing - run: rustup target add wasm32-unknown-unknown');
    }
  } catch {
    console.log('⚠️  Could not check WASM target');
  }
  
} catch (error) {
  console.log('⚠️  Could not check Rust toolchain');
}

// Final recommendations
console.log('\n💡 Compatibility Summary:');
console.log(`Node.js ${nodeVersion}: ${nodeMajorVersion >= 18 ? '✅ Compatible' : '❌ Needs upgrade'}`);
console.log(`Package.json: ${packageResult.found ? '✅ Found' : '❌ Missing'}`);
console.log(`WASM files: ${wasmFound ? '✅ Present' : '❌ Need compilation'}`);

console.log('\n🔧 Next steps:');
if (nodeMajorVersion < 18) {
  console.log('1. Upgrade Node.js to version 18 or higher');
}
if (!packageResult.found) {
  console.log('2. Navigate to the project root directory');
}
if (!wasmFound) {
  console.log('3. Run Rust build scripts in src/rust/ directories');
}
console.log('4. Check that Vite is configured for WASM support');

// Export for programmatic use
export default function checkCompatibility() {
  return {
    nodeVersion,
    nodeMajorVersion,
    isNodeCompatible: nodeMajorVersion >= 18,
    packageJsonFound: packageResult.found,
    packageJsonPath: packageResult.path,
    projectDir: packageResult.dir,
    wasmFilesFound: wasmFound
  };
}
