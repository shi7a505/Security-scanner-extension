// CSP Scanner - Checks for missing Content Security Policy
const CSPScanner = {
  name: 'CSPScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.MISSING_CSP;

    try {
      // Check for CSP in meta tags
      const cspMetaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      
      // Note: We can't directly access HTTP headers from content script
      // But we can check if CSP is blocking inline scripts (indication it exists)
      // and check for meta tags
      
      if (cspMetaTags.length === 0) {
        // Check if there are inline scripts that would be blocked by CSP
        const inlineScripts = document.querySelectorAll('script:not([src])');
        const inlineStyles = document.querySelectorAll('style');
        const inlineEventHandlers = document.querySelectorAll('[onclick], [onerror], [onload]');

        // If no meta CSP and inline content exists, likely no CSP
        if (inlineScripts.length > 0 || inlineStyles.length > 0 || inlineEventHandlers.length > 0) {
          vulnerabilities.push({
            typeId: vulnType.id,
            title: 'Content Security Policy Not Implemented',
            description: 'No CSP meta tag found and inline content is present. CSP helps prevent XSS and injection attacks.',
            location: 'HTTP Headers / Meta tags',
            evidence: `Found ${inlineScripts.length} inline scripts, ${inlineStyles.length} inline styles, ${inlineEventHandlers.length} inline event handlers`,
            recommendation: 'Implement Content-Security-Policy header: "default-src \'self\'; script-src \'self\'; style-src \'self\'; object-src \'none\';"',
            severity: vulnType.severity
          });
        }
      }

      // Additional check: Look for CSP violation reports in console
      // (This would require console access which we don't have in content script)

    } catch (error) {
      console.error('[CSPScanner] Error:', error);
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(CSPScanner);
}
