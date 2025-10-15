const http = require('http');

const pages = [
  // Main pages
  { url: '/', name: 'Home Page' },
  { url: '/about', name: 'About Page' },
  { url: '/pricing', name: 'Pricing Page' },
  
  // Auth pages
  { url: '/auth/login', name: 'Login Page' },
  { url: '/auth/signup', name: 'Signup Page' },
  
  // Dashboard pages (these might redirect to login)
  { url: '/dashboard', name: 'Dashboard Page' },
  { url: '/dashboard/text-to-speech', name: 'Text-to-Speech Page' },
  { url: '/dashboard/speech-to-text', name: 'Speech-to-Text Page' },
  { url: '/dashboard/voice-cloning', name: 'Voice Cloning Page' },
  { url: '/dashboard/files', name: 'Audio Files Page' },
  { url: '/dashboard/usage', name: 'Usage Analytics Page' },
  { url: '/dashboard/settings', name: 'Settings Page' },
  
  // API endpoints
  { url: '/api/health', name: 'Health API' },
  { url: '/api/user/subscription', name: 'Subscription API' },
  { url: '/api/user/usage', name: 'Usage API' },
];

function testPage(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false
      });
    });

    req.end();
  });
}

async function testAllPages() {
  console.log('🔍 Testing all pages and API endpoints...\n');
  
  const results = [];
  
  for (const page of pages) {
    process.stdout.write(`Testing ${page.name}... `);
    const result = await testPage(page.url);
    results.push({ ...page, ...result });
    
    if (result.success) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status}`);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('✅ Working Pages:');
    successful.forEach(r => {
      console.log(`  - ${r.name}: ${r.status}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Pages:');
    failed.forEach(r => {
      console.log(`  - ${r.name}: ${r.status}`);
    });
  }
  
  console.log('\n📝 Notes:');
  console.log('- Dashboard pages may redirect to login (expected)');
  console.log('- API endpoints may require authentication');
  console.log('- Status 401/403 for protected routes is normal');
}

testAllPages().catch(console.error);
