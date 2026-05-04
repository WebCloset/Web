// Ad Configuration
// Configure your ad settings here

export const AD_CONFIG = {
  // Interval between inline ads (show ad after every N products)
  AD_INTERVAL: 4,

  // Interval for full-row ads (show after every N products; higher = less often)
  FULL_ROW_AD_INTERVAL: 12,

  // Enable/disable ads
  ENABLED: true,
  
  // Ad provider: 'google-adsense' | 'custom' | 'none'
  // 'custom' uses the Admin API to fetch ad scripts
  PROVIDER: 'custom' as 'google-adsense' | 'custom' | 'none',
  
  // Google AdSense settings (if using AdSense)
  GOOGLE_ADSENSE: {
    CLIENT_ID: 'ca-pub-XXXXXXXXXX', // Replace with your AdSense client ID
    AD_SLOTS: {
      SEARCH_RESULTS: 'XXXXXXXXXX', // Replace with your ad slot ID
    },
  },
  
  // Custom ad server settings (now using Admin API)
  CUSTOM_ADS: {
    API_ENDPOINT: '/../Admin/api/ads.php', // Admin API endpoint for ad scripts
    AD_UNIT_ID: '', // Not used with Admin API
  },
};

// Type declaration for Google AdSense (if using)
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}
