#!/usr/bin/env node

/**
 * Dashboard Feature Test Script
 * 
 * This script tests the basic functionality of the dashboard features
 * Run with: node scripts/test-dashboard.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/audio/voices',
  '/api/audio/usage',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEndpoint(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function runTests() {
  log('🚀 Starting Dashboard Feature Tests...', 'blue');
  log(`📍 Testing against: ${BASE_URL}`, 'blue');
  log('');
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const fullUrl = `${BASE_URL}${endpoint}`;
    log(`Testing ${endpoint}...`, 'yellow');
    
    const result = await testEndpoint(fullUrl);
    results.push(result);
    
    if (result.success) {
      log(`✅ ${endpoint} - ${result.status}`, 'green');
    } else {
      log(`❌ ${endpoint} - ${result.status}`, 'red');
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
    }
  }
  
  log('');
  log('📊 Test Results Summary:', 'blue');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  
  if (failed > 0) {
    log('');
    log('🔍 Failed Tests:', 'red');
    results.filter(r => !r.success).forEach(result => {
      log(`   ${result.url} - ${result.status}`, 'red');
    });
    
    log('');
    log('💡 Troubleshooting Tips:', 'yellow');
    log('   1. Make sure your development server is running (npm run dev)');
    log('   2. Check that all environment variables are set');
    log('   3. Verify your Supabase configuration');
    log('   4. Check the browser console for detailed errors');
    log('   5. Review the CONFIGURATION.md file for setup instructions');
  } else {
    log('');
    log('🎉 All tests passed! Your dashboard features are working correctly.', 'green');
  }
  
  log('');
  log('📋 Next Steps:', 'blue');
  log('   1. Test the UI components in your browser');
  log('   2. Try creating audio content with each feature');
  log('   3. Check that usage tracking is working');
  log('   4. Verify subscription limits are enforced');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
