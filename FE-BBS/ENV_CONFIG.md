# Environment Configuration

This project uses environment variables to configure various settings including the frontend port and backend API URL.

## Environment Files

- `.env` - Default environment variables
- `.env.local` - Local development overrides (not committed to git)
- `.env.production` - Production environment variables

## Available Environment Variables

### Frontend Configuration
- `VITE_PORT` - Port number for the development server (default: 3000)

### Backend API Configuration
- `VITE_API_BASE_URL` - Base URL for the backend API (default: http://localhost:8000/api)
- `VITE_API_TIMEOUT` - API request timeout in milliseconds (default: 30000)

### Application
- `VITE_APP_ENV` - Application environment (development/production)

## Usage

### Development
```bash
# Use default .env configuration
npm run dev

# Use local development configuration
npm run dev:local
```

### Production Build
```bash
# Build for production
npm run build:prod
```

### Preview Production Build
```bash
# Preview production build locally
npm run preview
```

## Example Configuration

### Development (.env or .env.local)
```env
VITE_PORT=3000
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_APP_ENV=development
```

### Production (.env.production)
```env
VITE_PORT=5000
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_API_TIMEOUT=30000
VITE_APP_ENV=production
```

## Accessing Environment Variables in Code

Environment variables prefixed with `VITE_` are available in your Vue application:

```javascript
// Access environment variables
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const port = import.meta.env.VITE_PORT
const isProduction = import.meta.env.PROD
const isDevelopment = import.meta.env.DEV

// Use in API configuration
import { apiConfig } from '@/config/api.js'
console.log(apiConfig.baseURL) // Uses VITE_API_BASE_URL
```

## Important Notes

1. **Security**: Only environment variables prefixed with `VITE_` are accessible in the frontend code
2. **Git**: Add `.env.local` to `.gitignore` to avoid committing sensitive local configurations
3. **Build Time**: Environment variables are embedded at build time, not runtime
4. **Server Configuration**: The Vite development server will use the `VITE_PORT` variable automatically
