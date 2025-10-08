import { config } from '../config/env';

// Network connectivity tester
export const testNetworkConnectivity = async () => {
  const BASE_URL = config.API_BASE_URL;
  
  console.log('🧪 Testing Network Connectivity...');
  console.log('📍 Target URL:', BASE_URL);
  
  // Test 1: Simple fetch to base URL
  try {
    console.log('🔍 Test 1: Testing base URL connectivity...');
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Base URL Response Status:', response.status);
    console.log('✅ Base URL Response Headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.error('❌ Base URL Test Failed:', error);
  }
  
  // Test 2: Test specific endpoint
  try {
    console.log('🔍 Test 2: Testing /auth/register endpoint...');
    const testData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: 'testpass',
      confirmPassword: 'testpass'
    };
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('✅ Register Endpoint Response Status:', response.status);
    const responseText = await response.text();
    console.log('✅ Register Endpoint Response:', responseText);
    
  } catch (error) {
    console.error('❌ Register Endpoint Test Failed:', error);
  }
  
  // Test 3: Test network reachability
  try {
    console.log('🔍 Test 3: Testing network reachability...');
    const [host, port] = BASE_URL.replace('http://', '').replace('https://', '').split('/')[0].split(':');
    console.log('🏠 Host:', host);
    console.log('🚪 Port:', port || '80/443');
    
    // Try to reach the host
    const testResponse = await fetch(`http://${host}:${port || 80}`, {
      method: 'GET',
    });
    
    console.log('✅ Host Reachable:', testResponse.status);
    
  } catch (error) {
    console.error('❌ Host Unreachable:', error);
  }
};

// Quick connection test
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const BASE_URL = config.API_BASE_URL;
    const response = await fetch(BASE_URL, {
      method: 'GET',
    });
    
    return response.status < 500; // Accept any response that's not a server error
  } catch (error) {
    console.error('❌ Quick connection test failed:', error);
    return false;
  }
};

// Network troubleshooting guide
export const printTroubleshootingGuide = () => {
  console.log(`
🔧 NETWORK TROUBLESHOOTING GUIDE
================================

Current Configuration:
📍 API Base URL: ${config.API_BASE_URL}

Common Issues & Solutions:

1. 🏠 Backend Server Not Running
   ✅ Solution: Start your backend server
   📝 Command: Check your backend project's start command

2. 🌐 Wrong IP Address
   ✅ Solution: Update API_BASE_URL in .env file
   📝 Current: ${config.API_BASE_URL}
   💡 Try: http://localhost:8001/api (if running locally)
   💡 Try: Find your machine's IP with 'ipconfig' or 'ifconfig'

3. 🚪 Port Not Accessible
   ✅ Solution: Check if port 8001 is open
   📝 Command: netstat -an | grep 8001
   💡 Try: Different port number

4. 🔥 Firewall Blocking
   ✅ Solution: Allow port 8001 in firewall
   💡 Try: Temporarily disable firewall to test

5. 📱 Mobile Device Network
   ✅ Solution: Ensure mobile device can reach the server
   💡 Try: Same WiFi network for both devices
   💡 Try: Use computer's IP address instead of localhost

6. 🚫 CORS Issues
   ✅ Solution: Configure CORS in backend
   📝 Allow origin: http://localhost:19006 (Expo dev server)

Quick Tests:
1. Open ${config.API_BASE_URL} in browser
2. Check if backend logs show any requests
3. Try ping to the server IP
4. Use curl to test the endpoint

Debug Commands:
- curl -X POST ${config.API_BASE_URL}/auth/register -H "Content-Type: application/json" -d '{"test":"data"}'
- ping ${config.API_BASE_URL.split('//')[1].split('/')[0].split(':')[0]}
- telnet ${config.API_BASE_URL.split('//')[1].split('/')[0].split(':')[0]} ${config.API_BASE_URL.split(':')[2]?.split('/')[0] || '80'}
  `);
};