# 🛠️ Network Connection Troubleshooting Guide

## Problem
Getting "Unable to connect to server" error when trying to register.

## Configuration Check
Your current configuration:
- **Environment File**: `.env` has `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.38:8001/api`
- **App Config**: `app.json` has been updated to match
- **Axios Base URL**: Should now use `http://192.168.1.38:8001/api`

## 🔍 Troubleshooting Steps

### 1. Restart Expo Development Server
After changing environment variables, you need to restart:
```bash
# Stop current server (Ctrl+C)
# Then restart
npm start
# or
expo start
```

### 2. Check Backend Server Status
Make sure your backend server is running on `192.168.1.38:8001`:

```bash
# Test if server is running
curl http://192.168.1.38:8001/api
# or
curl http://192.168.1.38:8001/api/auth/register -X POST -H "Content-Type: application/json" -d '{"test":"data"}'
```

### 3. Network Connectivity Tests
Add this to your register screen to test network connectivity:

```typescript
import { testNetworkConnectivity, printTroubleshootingGuide } from '@/utils/networkTester';

// Add this button temporarily for testing
<TouchableOpacity onPress={testNetworkConnectivity}>
  <Text>Test Network</Text>
</TouchableOpacity>

<TouchableOpacity onPress={printTroubleshootingGuide}>
  <Text>Show Troubleshooting Guide</Text>
</TouchableOpacity>
```

### 4. Common Issues & Solutions

#### A. Wrong IP Address
**Problem**: The IP `192.168.1.38` might not be correct
**Solution**: 
```bash
# Find your computer's IP address
# macOS/Linux:
ifconfig | grep "inet "
# Windows:
ipconfig
```

#### B. Backend Server Not Running
**Problem**: Server isn't running on port 8001
**Solution**: Start your backend server and check it's listening on the correct port

#### C. Firewall Blocking Connection
**Problem**: Firewall blocking port 8001
**Solution**: 
- Temporarily disable firewall to test
- Add exception for port 8001

#### D. Different WiFi Networks
**Problem**: Mobile device and server on different networks
**Solution**: Ensure both devices are on the same WiFi network

#### E. Use Localhost for Simulator
**Problem**: Running on iOS Simulator or Android Emulator
**Solution**: Change URL to `http://localhost:8001/api` for simulators

### 5. Quick Tests

#### Test 1: Browser Test
Open in browser: `http://192.168.1.38:8001/api`
- Should show some response (even if error)
- If timeout = server not running or unreachable

#### Test 2: Command Line Test
```bash
# Test basic connectivity
ping 192.168.1.38

# Test port accessibility
telnet 192.168.1.38 8001

# Test API endpoint
curl -v http://192.168.1.38:8001/api
```

#### Test 3: Alternative URLs to Try
Update your `.env` file to test different URLs:

```bash
# For iOS Simulator
EXPO_PUBLIC_API_BASE_URL=http://localhost:8001/api

# For Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8001/api

# For physical device (find your computer's IP)
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:8001/api
```

### 6. Environment Variable Debug
Add this to see what URL is actually being used:

```typescript
// In your register screen, add this console.log
console.log('🔧 Current API URL:', config.API_BASE_URL);
```

### 7. Backend Server Checklist
Make sure your backend server:
- ✅ Is running on port 8001
- ✅ Accepts requests from `0.0.0.0` (not just localhost)
- ✅ Has CORS enabled for your Expo dev server
- ✅ Returns proper JSON responses
- ✅ Has the `/api/auth/register` endpoint implemented

### 8. Emergency Fallback (Local Development)
If you can't get the IP working, use localhost and run on simulator:

```bash
# In .env file
EXPO_PUBLIC_API_BASE_URL=http://localhost:8001/api
```

```bash
# Run on iOS simulator
expo start --ios

# Or Android emulator
expo start --android
```

## 🚨 After Making Changes

**Important**: After changing any environment variables:
1. Stop the Expo development server (Ctrl+C)
2. Restart it: `npm start` or `expo start`
3. Reload the app (press `r` in terminal or shake device)

## 📝 Quick Debug Script

Add this temporarily to your register screen to debug:

```typescript
const debugNetwork = () => {
  console.log('🔧 Debug Info:');
  console.log('Base URL:', config.API_BASE_URL);
  console.log('Environment:', config.NODE_ENV);
  console.log('Timestamp:', new Date().toISOString());
  
  // Test network
  testNetworkConnectivity();
};

// Add button in your JSX
<TouchableOpacity onPress={debugNetwork} style={{padding: 10, backgroundColor: 'red'}}>
  <Text style={{color: 'white'}}>DEBUG NETWORK</Text>
</TouchableOpacity>
```

## ✅ Success Indicators

You'll know it's working when:
- Console shows: `🔧 API Configuration: { BASE_URL: "http://192.168.1.38:8001/api" }`
- Network request logs show the full URL
- You get an actual HTTP response (even if error) instead of network error