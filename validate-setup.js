#!/usr/bin/env node

/**
 * Freepik Downloader - Validation Test Script
 * This script validates that the project is properly set up and ready for testing
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🚀 Freepik Downloader - Validation Test\n');

// Test 1: Check if dist directory exists and has compiled files
console.log('1. Checking compiled files...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    if (files.length > 0) {
        console.log('   ✅ Dist directory exists with compiled files');
        console.log(`   📁 Found ${files.length} files/directories in dist/`);
    } else {
        console.log('   ❌ Dist directory is empty');
        process.exit(1);
    }
} else {
    console.log('   ❌ Dist directory not found');
    process.exit(1);
}

// Test 2: Check if required directories exist
console.log('\n2. Checking required directories...');
const requiredDirs = ['download', 'storage'];
for (const dir of requiredDirs) {
    if (fs.existsSync(path.join(__dirname, dir))) {
        console.log(`   ✅ ${dir}/ directory exists`);
    } else {
        console.log(`   ❌ ${dir}/ directory missing`);
        process.exit(1);
    }
}

// Test 3: Check if .env file exists
console.log('\n3. Checking configuration...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('   ✅ .env configuration file exists');
} else {
    console.log('   ⚠️  .env file not found (will use defaults)');
}

// Test 4: Test basic imports
console.log('\n4. Testing module imports...');
try {
    const freepik = require('./dist/index.js');
    const methods = Object.keys(freepik.default);
    console.log('   ✅ Main module imports successfully');
    console.log(`   📦 Available methods: ${methods.join(', ')}`);
} catch (error) {
    console.log('   ❌ Failed to import main module:', error.message);
    process.exit(1);
}

// Test 5: Test API module
console.log('\n5. Testing API module...');
try {
    // Just check if the file can be loaded without running
    const apiPath = path.join(__dirname, 'dist/api/api.js');
    if (fs.existsSync(apiPath)) {
        console.log('   ✅ API module file exists');
    } else {
        console.log('   ❌ API module file not found');
        process.exit(1);
    }
} catch (error) {
    console.log('   ❌ Failed to check API module:', error.message);
    process.exit(1);
}

// Test 6: Check if port 3000 is available
console.log('\n6. Checking port availability...');
const server = http.createServer();
server.listen(3000, () => {
    console.log('   ✅ Port 3000 is available for API server');
    server.close();
    
    // Final success message
    console.log('\n🎉 All validation tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Add your Freepik premium cookies to .env file');
    console.log('   2. Add a test download URL to .env file');
    console.log('   3. Run: npm run api (to start API server)');
    console.log('   4. Run: npm run test (to test direct download)');
    console.log('   5. Check TEST_SETUP.md for detailed instructions');
    console.log('\n⚠️  Remember: You need a Freepik premium account to download files!');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log('   ⚠️  Port 3000 is already in use (API might be running)');
    } else {
        console.log('   ❌ Port test failed:', error.message);
    }
    
    // Still show success for other tests
    console.log('\n🎉 Core validation tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Add your Freepik premium cookies to .env file');
    console.log('   2. Add a test download URL to .env file');
    console.log('   3. Run: npm run api (to start API server)');
    console.log('   4. Run: npm run test (to test direct download)');
    console.log('   5. Check TEST_SETUP.md for detailed instructions');
    console.log('\n⚠️  Remember: You need a Freepik premium account to download files!');
});