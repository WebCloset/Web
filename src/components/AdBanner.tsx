import { useEffect, useRef, useState } from "react";
import "./AdBanner.css";
import { AD_CONFIG } from "../config/ads";
import { fetchActiveAds, getAdsByPosition, getRandomAd, Ad } from "../services/adService";

interface AdBannerProps {
  adSlot?: string;
  adId?: string;
  className?: string;
  position?: string;
  fullRow?: boolean;
}

const AdBanner = ({ adSlot, adId, className = "", position = "between", fullRow = false }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ads from API
    const loadAd = async () => {
      try {
        const activeAds = await fetchActiveAds();
        const positionAds = getAdsByPosition(activeAds, position);
        
        if (positionAds.length > 0) {
          // Get a random ad for this position
          const selectedAd = getRandomAd(positionAds);
          setAd(selectedAd);
        }
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if using custom provider
    if (AD_CONFIG.PROVIDER === 'custom' || AD_CONFIG.ENABLED) {
      loadAd();
    } else {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    if (!ad || !scriptRef.current) return;

    // Clear previous content
    scriptRef.current.innerHTML = '';

    // Create a container for the ad script
    const adContainer = document.createElement('div');
    adContainer.innerHTML = ad.script;
    
    // Append scripts to the document
    const scripts = adContainer.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      scriptRef.current?.appendChild(newScript);
    });

    // Append non-script content
    const nonScriptContent = Array.from(adContainer.childNodes).filter(
      (node) => node.nodeName !== 'SCRIPT'
    );
    nonScriptContent.forEach((node) => {
      scriptRef.current?.appendChild(node.cloneNode(true));
    });

    // Handle Google AdSense if present
    if (window.adsbygoogle && adContainer.querySelector('.adsbygoogle')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [ad]);

  // Fallback to Google AdSense if configured
  useEffect(() => {
    if (AD_CONFIG.PROVIDER === 'google-adsense' && window.adsbygoogle && adRef.current && !ad) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [ad]);

  const bannerClass = `ad-banner ${fullRow ? "ad-banner--fullrow" : ""} ${className}`.trim();

  if (loading) {
    return (
      <div 
        ref={adRef} 
        className={bannerClass}
        data-ad-slot={adSlot}
        data-ad-id={adId}
      >
        <div className="ad-placeholder">
          <div className="ad-label">Loading ad...</div>
        </div>
      </div>
    );
  }

  if (!ad && AD_CONFIG.PROVIDER !== 'google-adsense') {
    return null; // Don't show placeholder if no ads available
  }

  return (
    <div 
      ref={adRef} 
      className={bannerClass}
      data-ad-slot={adSlot}
      data-ad-id={adId}
    >
      {ad ? (
        <div className="ad-content" ref={scriptRef}>
          {/* Ad script will be injected here */}
        </div>
      ) : (
        <div className="ad-placeholder">
          <div className="ad-label">Advertisement</div>
          <div className="ad-content">
            {/* Google AdSense fallback */}
            {AD_CONFIG.PROVIDER === 'google-adsense' && (
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={AD_CONFIG.GOOGLE_ADSENSE.CLIENT_ID}
                data-ad-slot={adSlot || AD_CONFIG.GOOGLE_ADSENSE.AD_SLOTS.SEARCH_RESULTS}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            )}
            
            {AD_CONFIG.PROVIDER !== 'google-adsense' && (
              <div className="ad-placeholder-content">
                <p>Ad Space</p>
                <span>300 x 250</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
