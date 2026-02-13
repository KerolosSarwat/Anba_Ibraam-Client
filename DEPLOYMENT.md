# Client Deployment Guide

## Overview
This is the frontend React application built with Vite.

## 📋 Prerequisites

- Node.js 16+ and npm
- Backend API URL (deployed server)

## 🔧 Environment Setup

### 1. Configure API URL

Create `.env.production` in client root:

```env
# API Configuration
VITE_API_URL=https://your-backend-api.com

# Or if using IP:
# VITE_API_URL=http://192.168.1.100:3000
```

### 2. Update API Base URL in Code

If not using environment variables, update the fetch calls or create an API config file:

**Create `src/config/api.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE_URL;
```

**Then update fetch calls:**
```javascript
import API_BASE_URL from '../config/api';

fetch(`${API_BASE_URL}/api/families`, {
  // ... options
})
```

## 🏗️ Build Commands

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 3. Preview Build Locally

```bash
npm run preview
```

## 📦 Build Output

After running `npm run build`, you'll have:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── vite.svg
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Via CLI:**
```bash
npm install -g vercel
vercel --prod
```

**Via GitHub:**
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set build settings:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-api.com`
6. Deploy!

### Option 2: Netlify

**Via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Via Drag & Drop:**
1. Build: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag `dist` folder to deploy

**Via GitHub:**
1. Connect repository
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variable: `VITE_API_URL`

**Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

**Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repo-name"
}
```

**Update `vite.config.js`:**
```javascript
export default defineConfig({
  base: '/repo-name/',
  plugins: [react()],
})
```

**Deploy:**
```bash
npm run deploy
```

### Option 4: Static Hosting (Apache/Nginx)

**Build:**
```bash
npm run build
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/charityhelper/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Deploy:**
1. Upload `dist` contents to server
2. Configure web server
3. Ensure routing redirects to index.html

### Option 5: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select dist as public directory
# Configure as single-page app: Yes
firebase deploy
```

### Option 6: Cloudflare Pages

1. Go to Cloudflare Pages
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Deploy!

### Option 7: AWS S3 + CloudFront

1. Build the app: `npm run build`
2. Create S3 bucket
3. Upload `dist` contents
4. Enable static website hosting
5. Create CloudFront distribution
6. Configure routing rules for SPA

## 🔧 Vite Configuration for Production

**`vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

## 📦 Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "lucide-react": "^0.344.0",
  "xlsx": "^0.18.5"
}
```

### Dev Dependencies
```json
{
  "vite": "^5.1.4",
  "@vitejs/plugin-react": "^4.2.1",
  "eslint": "^8.56.0"
}
```

## 🔒 Security Checklist

- [ ] Set proper CORS on backend to allow only your frontend domain
- [ ] Use HTTPS in production
- [ ] Remove console.logs from production build
- [ ] Enable source map only for debugging (disable in final build)
- [ ] Set proper CSP headers
- [ ] Validate all user inputs
- [ ] Keep dependencies updated

## 🌐 Environment Variables

Create different `.env` files:

**`.env.development`:**
```env
VITE_API_URL=http://localhost:3000
```

**`.env.production`:**
```env
VITE_API_URL=https://api.your-domain.com
```

**Access in code:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🔄 CI/CD Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Client

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## 🆘 Troubleshooting

**Build errors:**
```bash
# Clear cache and node_modules
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

**Routing issues (404 on refresh):**
- Configure server to redirect all routes to index.html
- See platform-specific configuration above

**API connection issues:**
- Check VITE_API_URL is correct
- Verify CORS settings on backend
- Check browser console for errors

## 📝 Build Commands Summary

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 🔗 Post-Deployment

After deployment, update:
1. Backend CORS settings to allow your frontend domain
2. Any hardcoded API URLs in the code
3. Test all features thoroughly
4. Monitor for errors using browser console

## 📊 Performance Optimization

- Enable gzip/brotli compression on server
- Use CDN for static assets
- Implement lazy loading for routes
- Optimize images and assets
- Enable caching headers
- Consider code splitting

## 🎯 Recommended Stack

**Best Free Options:**
- **Frontend:** Vercel or Netlify
- **Backend:** Railway or Render
- **Database:** Railway PostgreSQL

**Example URLs after deployment:**
- Frontend: `https://charityhelper.vercel.app`
- Backend: `https://charityhelper-api.railway.app`
