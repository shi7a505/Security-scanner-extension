// HSTS Scanner - Checks for missing Strict-Transport-Security header
const HSTSScanner = {
  name: 'HSTSScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.MISSING_HSTS;

    // Only relevant for HTTPS sites
    if (window.location.protocol !== 'https:') {
      return vulnerabilities;
    }

    // Check for HSTS meta tag (though HSTS should be in headers, not meta tags)
    const hstsMetaTags = document.querySelectorAll('meta[http-equiv="Strict-Transport-Security"]');
    
    // Note: We cannot directly access HTTP headers from content script
    // But we can make an educated guess based on meta tags and other indicators
    
    if (hstsMetaTags.length === 0) {
      // No HSTS meta tag found (HSTS is typically in headers, not meta tags)
      // This is an indication that HSTS might not be implemented
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Strict-Transport-Security Header Likely Missing',
        description: 'No HSTS implementation detected. Site may be vulnerable to SSL stripping and downgrade attacks.',
        location: 'HTTP Headers',
        evidence: 'No HSTS meta tag found (HSTS should be in HTTP headers)',
        recommendation: 'Implement HSTS header: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload". Consider HSTS preloading.',
        severity: vulnType.severity
      });
    }

    // Check if site has any HTTP links (which HSTS would prevent)
    const httpLinks = document.querySelectorAll('a[href^="http://"]');
    if (httpLinks.length > 0) {
      // Filter to only same-origin links
      const sameOriginHttpLinks = Array.from(httpLinks).filter(link => {
        try {
          const linkUrl = new URL(link.href);
          return linkUrl.hostname === window.location.hostname;
        } catch {
          return false;
        }
      });

      if (sameOriginHttpLinks.length > 0) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'HTTP Links to Same Domain on HTTPS Site',
          description: `Found ${sameOriginHttpLinks.length} HTTP link(s) pointing to the same domain. HSTS would prevent these.`,
          location: 'Page links',
          evidence: sameOriginHttpLinks.slice(0, 3).map(a => a.href).join(', '),
          recommendation: 'Change all same-domain links to HTTPS. Implement HSTS to force HTTPS for all connections.',
          severity: vulnType.severity
        });
      }
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(HSTSScanner);
}
