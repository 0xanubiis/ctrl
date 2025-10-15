// Simple test to verify environment variables are loaded
const fs = require('fs');

console.log('=== Environment Variables Test ===');

// Read the .env.local file directly
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  console.log('Environment file found and readable');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        console.log(`${key.trim()}: ${value.trim().substring(0, 20)}...`);
      }
    }
  });
} catch (error) {
  console.log('Error reading .env.local:', error.message);
}
