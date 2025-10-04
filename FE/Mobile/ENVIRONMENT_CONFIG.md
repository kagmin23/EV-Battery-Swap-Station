# Environment Configuration Guide

## Overview
The app now uses environment variables for configuration management, making it easy to switch between development, staging, and production environments.

## Files Created

### Environment Files
- `.env` - Development environment (git-ignored)
- `.env.example` - Template for other developers
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration

### Configuration Files
- `config/env.ts` - Environment configuration handler
- `app.json` - Updated with `extra` field for Expo config

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8001/api` |
| `NODE_ENV` | Environment mode | `development`, `staging`, `production` |
| `EXPO_PUBLIC_APP_NAME` | Application name | `EV Battery Swap Station` |
| `EXPO_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Usage

### In Code
```typescript
import { config } from '@/config/env';

// Use the base URL
const apiUrl = config.EXPO_PUBLIC_API_BASE_URL;

// Check environment
if (config.NODE_ENV === 'development') {
  console.log('Running in development mode');
}
```

### Helper Functions
```typescript
import { isDevelopment, isProduction, isStaging } from '@/config/env';

if (isDevelopment()) {
  // Development-only code
}

if (isProduction()) {
  // Production-only code
}
```

## Environment Setup

### Development
1. Copy `.env.example` to `.env`
2. Update variables as needed
3. Run: `npm start`

### Staging
1. Set environment variables in your CI/CD
2. Or use: `.env.staging` file
3. Build with staging configuration

### Production
1. Set environment variables in your deployment platform
2. Or use: `.env.production` file
3. Build for production

## Expo Configuration

### Method 1: app.json (Current)
Environment variables are defined in `app.json` under the `extra` field:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "http://localhost:8001/api",
      "NODE_ENV": "development"
    }
  }
}
```

### Method 2: EXPO_PUBLIC_ Prefix (Alternative)
For sensitive variables, use the `EXPO_PUBLIC_` prefix:

```bash
EXPO_PUBLIC_EXPO_PUBLIC_API_BASE_URL=http://localhost:8001/api
```

## Security Notes

### Git Ignored Files
- `.env` (local development)
- `.env.development`
- `.env.production` 
- `.env.staging`

### Public Files (Committed)
- `.env.example` (template)
- `config/env.ts` (configuration handler)

### Best Practices
1. Never commit actual `.env` files with sensitive data
2. Use `.env.example` as a template
3. Set production variables in your deployment platform
4. Use different API URLs for each environment

## Deployment

### Expo EAS Build
```bash
# Development build
eas build --profile development

# Production build with env vars
eas build --profile production
```

### Environment-specific builds
Update `eas.json` to use different configurations:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://localhost:8001/api",
        "NODE_ENV": "development"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.yourdomain.com/api",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues
1. **Environment variables not loading**: Restart the Expo dev server
2. **Variables undefined**: Check `app.json` extra field
3. **TypeScript errors**: Import from `@/config/env`

### Debug Configuration
In development, the app logs all configuration values to the console for debugging.

## Migration Complete

✅ Moved BASE_URL from hardcoded to environment variables
✅ Created configuration management system
✅ Set up multiple environment support
✅ Added proper git ignore rules
✅ Updated API service to use config
✅ Created comprehensive documentation

The API base URL is now configurable through environment variables!