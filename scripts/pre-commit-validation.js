#!/usr/bin/env node

/**
 * Pre-commit validation script for CMA Neural OS
 * Place this in .git/hooks/pre-commit and make it executable
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running CMA pre-commit validation...');

// Browser compatibility checks
function checkBrowserCompatibility(files) {
  const issues = [];
  const nodeOnlyPatterns = [
    /import.*from\s+['"]events['"]/,
    /import.*from\s+['"]fs['"]/,
    /import.*from\s+['"]path['"]/,
    /require\(['"]events['"]\)/
  ];

  files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        nodeOnlyPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            issues.push(`❌ ${file}: Node.js-only import detected. Use browser-compatible alternatives.`);
          }
        });
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}: ${error.message}`);
      }
    }
  });

  return issues;
}

// WASM configuration checks
function checkWasmConfiguration() {
  const issues = [];
  const wasmFiles = [
    'public/wasm/cma_neural_os.js',
    'public/wasm/neuromorphic.js', 
    'public/wasm/llama_bridge.js',
    'public/wasm-service-worker.js'
  ];

  wasmFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      issues.push(`❌ Missing WASM file: ${file}`);
    }
  });

  return issues;
}

// Route integrity checks
function checkRouteIntegrity() {
  const issues = [];
  
  try {
    const appContent = fs.readFileSync('src/App.tsx', 'utf8');
    const pagesDir = 'src/pages';
    
    if (fs.existsSync(pagesDir)) {
      const pageFiles = fs.readdirSync(pagesDir)
        .filter(file => file.endsWith('.tsx'))
        .map(file => file.replace('.tsx', ''));

      pageFiles.forEach(page => {
        if (!appContent.includes(page) && page !== 'index') {
          issues.push(`⚠️  Page ${page} may not have a route in App.tsx`);
        }
      });
    }
  } catch (error) {
    issues.push(`❌ Could not validate routes: ${error.message}`);
  }

  return issues;
}

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.split('\n').filter(file => file.trim() !== '');
  } catch (error) {
    console.error('❌ Could not get staged files:', error.message);
    return [];
  }
}

// Main validation
function runValidation() {
  const stagedFiles = getStagedFiles();
  let allIssues = [];

  console.log(`📁 Checking ${stagedFiles.length} staged files...`);

  // Run all checks
  allIssues = allIssues.concat(checkBrowserCompatibility(stagedFiles));
  allIssues = allIssues.concat(checkWasmConfiguration());
  allIssues = allIssues.concat(checkRouteIntegrity());

  // Report results
  if (allIssues.length === 0) {
    console.log('✅ All validation checks passed!');
    process.exit(0);
  } else {
    console.log('❌ Validation failed:');
    allIssues.forEach(issue => console.log(`  ${issue}`));
    console.log('\n💡 Fix these issues before committing or run validation in the System Health dashboard.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };