# Deployment Guide for WEB CLOSET

## Routing Configuration

This React app uses client-side routing with React Router. After building and deploying, you need to configure your hosting server to serve `index.html` for all routes.

## Hosting Platform Configurations

### Netlify
The `public/_redirects` file is already configured. Just deploy the `dist` folder.

### Vercel
The `public/vercel.json` file is already configured. Deploy normally.

### Apache (.htaccess)
The `public/.htaccess` file is already configured. Make sure mod_rewrite is enabled.

### Other Hosting Services

#### GitHub Pages
1. Set base path in `vite.config.ts` to your repository name
2. Add a `404.html` file that redirects to `index.html`

#### Firebase Hosting
Add to `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Nginx
Add to your nginx config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Build Command
```bash
npm run build
```

The built files will be in the `dist` folder.

## Railway

1. **Push your code** to GitHub (if not already).
2. **Go to [railway.com](https://railway.com)** → Login → **New Project** → **Deploy from GitHub repo** and select your Web-Closet repo.
3. **Root directory:** If your app is in a subfolder (e.g. `Web-Closet/`), set **Root Directory** in the service settings to `Web-Closet`.
4. **Build & start (already set in this repo):**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start` (serves the `dist` folder with SPA fallback)
   - **Install Command:** `npm install`
5. **Base URL:** Your `vite.config.ts` has `base: '/webcloset/'`. For Railway (app at root), change it to `base: '/'` so assets and routes work.
6. **API:** In your Railway service, add a variable: `VITE_API_URL` = `https://api-production-d9dd.up.railway.app` (your API URL). The app uses this in production. Ensure the API allows CORS from your frontend URL. (VITE_ vars are applied at build time—redeploy after changing them.)
7. Railway sets `PORT` automatically; the `serve` command uses it.

## Important Notes
- Always deploy the `dist` folder, not the `src` folder
- Make sure all routes redirect to `index.html`
- Check that your hosting service supports SPA routing
