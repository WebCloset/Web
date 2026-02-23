import { useEffect, useRef } from "react";
import "./AdAdmin.css";

interface AdAdminProps {
  positionId: number;
  className?: string;
  fullRow?: boolean;
}

/**
 * AdAdmin Component
 * Integrates the AdAdmin ad management system
 * 
 * @param positionId - The position ID from AdAdmin database
 * @param className - Additional CSS classes
 * @param fullRow - Whether this ad should span full row
 */
const AdAdmin = ({ positionId, className = "", fullRow = false }: AdAdminProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return;

    const targetDivId = `AADIV${positionId}`;
    const container = containerRef.current;

    // Create the target div for the ad
    const targetDiv = document.createElement("div");
    targetDiv.id = targetDivId;
    container.appendChild(targetDiv);

    // Read cookies for frequency capping (psc parameter)
    const cookieString = decodeURIComponent(document.cookie);
    const cookies = cookieString.split(";");
    let psc = "";
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf("adcapban") === 0) {
        psc += (psc === "" ? "" : ",") + cookie.replace("adcapban", "").replace("=", ",");
      }
    }

    // Create and load the ad script
    const script = document.createElement("script");
    script.src = `/amb/ser.php?t=${targetDivId}&f=${positionId}&psc=${psc}`;
    document.head.appendChild(script);

    scriptLoadedRef.current = true;

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [positionId]);

  const bannerClass = `ad-admin ${fullRow ? "ad-admin--fullrow" : ""} ${className}`.trim();

  return (
    <div 
      ref={containerRef} 
      className={bannerClass}
      data-position-id={positionId}
    />
  );
};

export default AdAdmin;

