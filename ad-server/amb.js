
(function() {
  function loadConsentElements(tcData) {
    const gdpr = tcData.gdprApplies ? 1 : 0;
    const consent = encodeURIComponent(tcData.tcString || "");
    const gppString = encodeURIComponent(tcData.gppString || "");
    const gppSid = Array.isArray(tcData.gppSid) ? tcData.gppSid.join(',') : "";

    document.querySelectorAll('[data-src]').forEach(el => {
        const srcTemplate = el.getAttribute('data-src');
        
        // Ricava vendorId da attributo o da placeholder
        let vendorId = el.getAttribute('data-vendor-id');
        if (vendorId) vendorId = parseInt(vendorId, 10);
        else {
        const match = srcTemplate.match(/\${GDPR_CONSENT_(\d+)}/);
        vendorId = match ? parseInt(match[1], 10) : null;
        }

        if (vendorId === null) return;

        const hasConsent = tcData.vendor.consents && tcData.vendor.consents[vendorId];
        if (!hasConsent) return;

        let resolvedSrc = srcTemplate
        .replace('${GDPR}', gdpr)
        .replace(`\${GDPR_CONSENT_${vendorId}}`, consent)
        .replace(`\${GPP_STRING_${vendorId}}`, gppString)
        .replace('${GPP_SID}', gppSid)
        .replace('[timestamp]', Date.now());

        if (el.tagName === 'SCRIPT') {
        const s = document.createElement('script');
        s.src = resolvedSrc;
        document.head.appendChild(s);
        } else if (el.tagName === 'IMG') {
        el.setAttribute('src', resolvedSrc);
        }

        el.removeAttribute('data-src');
    });

  }

  function waitForCMP(tries = 0) {
    if (typeof __tcfapi !== 'function') {
    //   if (tries < 50) 
      setTimeout(() => waitForCMP(tries + 1), 500);
      return;
    }
    __tcfapi('addEventListener', 2, function(tcData, success) {
      if (success && tcData.eventStatus === 'tcloaded') {
        loadConsentElements(tcData);
      }
    });
  }

  waitForCMP();
})();