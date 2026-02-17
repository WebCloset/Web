# CORS Fix for Production Deployment

## Problem
The API calls work in development (using Vite proxy) but fail in production due to CORS policy when deployed to cPanel.

## Solution
A PHP proxy script has been created to handle API requests server-side, avoiding CORS issues.

## Files Created
- `public/api-proxy.php` - PHP proxy script that forwards requests to the backend API

## Deployment Steps

### Option 1: Deploy to Root Domain (Recommended)
If deploying to `https://anandt.com/` (root):

1. **Update vite.config.ts** - Change base path to `/`:
   ```typescript
   base: '/',  // Change from '/webcloset/'
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Upload to cPanel**:
   - Upload all files from the `dist/` folder to your cPanel public_html directory
   - Make sure `api-proxy.php` is in the root of public_html

4. **Verify PHP is enabled** on your cPanel hosting

### Option 2: Deploy to Subdirectory
If deploying to `https://anandt.com/webcloset/`:

1. **Keep vite.config.ts** with `base: '/webcloset/'`

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Upload to cPanel**:
   - Upload all files from the `dist/` folder to `public_html/webcloset/`
   - Make sure `api-proxy.php` is in the `webcloset/` directory

## How It Works

1. In **development**: Uses Vite's built-in proxy (`/api/nlp/search/`)
2. In **production**: Uses PHP proxy script (`/api-proxy.php` or `/webcloset/api-proxy.php`)

The PHP proxy:
- Receives requests from your frontend
- Forwards them to `https://api-production-d9dd.up.railway.app/nlp/search/`
- Returns the response with proper CORS headers
- Avoids browser CORS restrictions

## Testing

After deployment, test the API by:
1. Opening browser console
2. Searching for a product
3. Check Network tab - requests should go to `/api-proxy.php?query=...`
4. Should see successful responses without CORS errors

## Troubleshooting

### If API still doesn't work:

1. **Check PHP is enabled**: Create a test file `test.php` with `<?php phpinfo(); ?>` and access it via browser

2. **Check file permissions**: Ensure `api-proxy.php` has read permissions (644 or 755)

3. **Check error logs**: Look in cPanel error logs for PHP errors

4. **Test proxy directly**: Try accessing `https://anandt.com/api-proxy.php?query=test` directly in browser

5. **Verify file location**: Make sure `api-proxy.php` is in the same directory as your `index.html`

## Alternative: Backend CORS Configuration

If you have access to modify the backend API, you can add CORS headers there instead:

```python
# In your Python API (Flask/FastAPI)
from flask_cors import CORS
CORS(app, origins=["https://anandt.com", "https://www.anandt.com"])
```

This would allow direct API calls without needing a proxy.
