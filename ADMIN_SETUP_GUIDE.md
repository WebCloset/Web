# AdAdmin Setup Guide

This guide will help you complete the AdAdmin integration after the implementation.

## Step 1: Configure Database Connection

1. **Create the configuration file:**
   - Copy `amb/pons-settings-install.php` to `amb/pons-settings.php`
   - Edit `amb/pons-settings.php` and fill in your database credentials:

```php
// database configuration
define("WEBDOMAIN","your-domain.com");
define("DEFDBNAME","your_database_name");
define("DEFUSERNAME","your_database_user");
define("DEFDBPWD","your_database_password");
```

2. **Create the database** (if not already created):
   - Create a MySQL/MariaDB database for AdAdmin
   - Make sure the user has full privileges

## Step 2: Run AdAdmin Installer

1. **Access the installer:**
   - Navigate to: `http://your-domain.com/amb/src/componenti/install/`
   - Or if using local development: `http://localhost/amb/src/componenti/install/`

2. **Follow the installation wizard:**
   - The installer will create all necessary database tables
   - Create your admin account
   - Complete the setup

## Step 3: Configure Ad Positions

1. **Log into AdAdmin:**
   - Access: `http://your-domain.com/amb/src/`
   - Login with your admin credentials

2. **Create Ad Positions:**
   - Go to "Positions" (Posizioni) section
   - Create at least 2 positions:
     - **Position 29** (or your preferred ID): For inline ads between products
       - Name: "Search Results - Inline"
       - Size: 300x250 (or your preferred size)
     - **Position 30** (or your preferred ID): For full-row ads
       - Name: "Search Results - Full Row"
       - Size: Responsive or 728x90

3. **Note the Position IDs:**
   - Write down the actual Position IDs you created
   - You'll need to update these in the React component

## Step 4: Update Position IDs in React Component

1. **Edit `src/components/SearchResults.tsx`:**
   - Find the `AD_CONFIG` object (around line 8)
   - Update the `POSITION_IDS` to match your AdAdmin positions:

```typescript
POSITION_IDS: {
  BETWEEN: 29, // Replace with your inline ad position ID
  FULLROW: 30, // Replace with your full-row ad position ID
},
```

## Step 5: Upload Banners

1. **In AdAdmin admin panel:**
   - Go to "Banners" section
   - Upload your ad banners
   - Assign them to the positions you created (29 and 30)
   - Set banners to "Active" status

## Step 6: Server Configuration

### For Development (Local):
- Ensure PHP is installed and running
- Use a local server like XAMPP, WAMP, or Laravel Valet
- Make sure the `amb` folder is accessible

### For Production:
- Ensure your web server (Apache/Nginx) can execute PHP files
- The `amb` folder must be accessible at `/amb/` path
- Configure proper file permissions:
  ```bash
  chmod 755 amb/
  chmod 644 amb/ser.php
  ```

### If using Vercel/Netlify (Static Hosting):
- You'll need a separate PHP server or API proxy
- Consider using a serverless function to proxy requests to a PHP server
- Or host the `amb` folder on a separate PHP-capable server

## Step 7: Test the Integration

1. **Start your React development server:**
   ```bash
   npm run dev
   ```

2. **Test ad loading:**
   - Perform a search on your site
   - Check browser console for any errors
   - Verify ads appear in the search results
   - Check Network tab to see if `ser.php` requests are successful

3. **Common Issues:**
   - **404 errors for `/amb/ser.php`**: Check server configuration
   - **CORS errors**: Configure CORS headers in your PHP server
   - **Database connection errors**: Verify `pons-settings.php` credentials
   - **No ads showing**: Check if banners are active in AdAdmin panel

## Step 8: Adjust Ad Intervals (Optional)

If you want to change how often ads appear:

1. **Edit `src/components/SearchResults.tsx`:**
   - Modify `AD_INTERVAL`: Show inline ad after every N products (default: 4)
   - Modify `FULL_ROW_AD_INTERVAL`: Show full-row ad after every N products (default: 12)

## Step 9: Production Build

1. **Build your React app:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Deploy the `dist` folder to your web server
   - Ensure the `amb` folder is also deployed and accessible
   - Make sure PHP is enabled on your production server

## Additional Configuration

### Customize Ad Appearance:
- Edit `src/components/AdAdmin.css` to style the ad containers
- The ads themselves are controlled by AdAdmin settings

### Disable Ads Temporarily:
- In `src/components/SearchResults.tsx`, set `ENABLED: false` in `AD_CONFIG`

## Troubleshooting

### Ads not loading:
1. Check browser console for JavaScript errors
2. Verify `amb.js` is loaded (check Network tab)
3. Check if `ser.php` is accessible: `http://your-domain.com/amb/ser.php?f=29&t=AADIV29`
4. Verify database connection in AdAdmin

### CORS Issues:
- Add CORS headers to your PHP server configuration
- Or configure a proxy in your React app

### Position IDs not matching:
- Check AdAdmin admin panel for actual position IDs
- Update `POSITION_IDS` in `SearchResults.tsx` accordingly

## Support

- AdAdmin Documentation: Check `amb/docs/AdAdmindocumentation.html`
- AdAdmin GitHub: https://github.com/giuliopons/adadmin

