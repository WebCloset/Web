export interface Ad {
  id: number;
  name: string;
  script: string;
  position: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get ads URL: static JSON (no server) or custom API
const getAdsUrl = () => {
  // Custom API URL (e.g. your own backend or PHP API)
  if (import.meta.env.VITE_AD_API_URL) {
    return import.meta.env.VITE_AD_API_URL;
  }
  // No server: use static ads.json from same origin (e.g. public/ads.json)
  const base = import.meta.env.BASE_URL || '/';
  const path = base.endsWith('/') ? `${base}ads.json` : `${base}/ads.json`;
  return path;
};

const ADS_URL = getAdsUrl();

/**
 * Fetch active ads from the API
 */
export const fetchActiveAds = async (): Promise<Ad[]> => {
  try {
    const url = ADS_URL.includes('?') ? `${ADS_URL}&active=true` : `${ADS_URL}?active=true`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      console.error('Failed to fetch ads:', data.error);
      return [];
    }

    const ads = data.ads || [];
    return ads.filter((ad: Ad) => ad.active);
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
};

/**
 * Get ads for a specific position
 */
export const getAdsByPosition = (ads: Ad[], position: string): Ad[] => {
  return ads.filter(ad => ad.position === position && ad.active);
};

/**
 * Get a random ad from the array (for rotation)
 */
export const getRandomAd = (ads: Ad[]): Ad | null => {
  if (ads.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
};
