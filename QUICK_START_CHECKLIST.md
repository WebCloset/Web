# AdAdmin Quick Start Checklist

## ✅ Immediate Next Steps

### 1. Database Setup (5 minutes)
- [ ] Create a MySQL database for AdAdmin
- [ ] Copy `amb/pons-settings-install.php` to `amb/pons-settings.php`
- [ ] Edit `amb/pons-settings.php` with your database credentials:
  ```php
  define("DEFDBNAME","your_database_name");
  define("DEFUSERNAME","your_database_user");
  define("DEFDBPWD","your_database_password");
  ```

### 2. Install AdAdmin (5 minutes)
- [ ] Navigate to: `http://localhost/amb/src/componenti/install/`
- [ ] Run the installation wizard
- [ ] Create your admin account
- [ ] Complete database setup

### 3. Create Ad Positions (5 minutes)
- [ ] Login to AdAdmin: `http://localhost/amb/src/`
- [ ] Go to "Positions" section
- [ ] Create Position 29: "Search Results - Inline" (300x250)
- [ ] Create Position 30: "Search Results - Full Row" (728x90 or responsive)
- [ ] **Note the actual Position IDs** (they might be different)

### 4. Update Position IDs (2 minutes)
- [ ] Open `src/components/SearchResults.tsx`
- [ ] Update lines 13-14 with your actual Position IDs:
  ```typescript
  POSITION_IDS: {
    BETWEEN: 29, // Your inline position ID
    FULLROW: 30, // Your full-row position ID
  },
  ```

### 5. Upload Test Banners (5 minutes)
- [ ] In AdAdmin, go to "Banners"
- [ ] Upload at least one test banner
- [ ] Assign it to Position 29
- [ ] Set status to "Active"

### 6. Test (2 minutes)
- [ ] Start dev server: `npm run dev`
- [ ] Perform a search on your site
- [ ] Check if ads appear in search results
- [ ] Check browser console for errors

## 🔧 Server Requirements

### For Local Development:
- [ ] PHP 7.4+ installed
- [ ] MySQL/MariaDB running
- [ ] Web server (Apache/Nginx) or PHP built-in server
- [ ] `amb` folder accessible at `/amb/`

### For Production:
- [ ] PHP-enabled web server
- [ ] Database accessible from production server
- [ ] `amb` folder deployed and accessible
- [ ] Proper file permissions set

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| 404 for `/amb/ser.php` | Check server configuration, ensure PHP is enabled |
| CORS errors | Configure CORS headers or use proxy |
| No ads showing | Check if banners are active in AdAdmin panel |
| Database errors | Verify credentials in `pons-settings.php` |
| Position IDs wrong | Check actual IDs in AdAdmin admin panel |

## 📝 Current Configuration

- **Inline ads**: Show every 4 products (Position 29)
- **Full-row ads**: Show every 12 products (Position 30)
- **Ad script**: `amb.js` loaded in `index.html`
- **Component**: `src/components/AdAdmin.tsx`

## 🎯 What's Already Done

✅ AdAdmin component created  
✅ Integration with SearchResults  
✅ Old ad system removed  
✅ `amb.js` included in HTML  
✅ CSS styling added  
✅ Development proxy configured  

## 📚 Need Help?

- Full guide: See `ADMIN_SETUP_GUIDE.md`
- AdAdmin docs: `amb/docs/AdAdmindocumentation.html`
- AdAdmin GitHub: https://github.com/giuliopons/adadmin

