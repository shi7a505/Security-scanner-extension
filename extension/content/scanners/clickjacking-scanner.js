// Clickjacking Scanner - Checks for missing X-Frame-Options
const ClickjackingScanner = {
  name: 'ClickjackingScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.CLICKJACKING;

    // Check if page can be framed
    // If we're in an iframe, the parent site might be attempting clickjacking
    const isFramed = window !== window.top;

    // Check for X-Frame-Options in meta tags (should be in headers)
    const xFrameOptionsMetaTags = document.querySelectorAll('meta[http-equiv="X-Frame-Options"]');
    
    // Check for CSP frame-ancestors
    const cspMetaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    let hasFrameAncestors = false;
    
    cspMetaTags.forEach(metaTag => {
      const cspContent = metaTag.getAttribute('content') || '';
      if (cspContent.includes('frame-ancestors')) {
        hasFrameAncestors = true;
      }
    });

    // If no protection found
    if (xFrameOptionsMetaTags.length === 0 && !hasFrameAncestors) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Missing X-Frame-Options and CSP frame-ancestors',
        description: 'No clickjacking protection detected. Site can be embedded in iframes by malicious sites.',
        location: 'HTTP Headers / CSP',
        evidence: isFramed ? 'Page is currently framed' : 'No frame protection headers found',
        recommendation: 'Add X-Frame-Options header: "SAMEORIGIN" or "DENY". Or use CSP frame-ancestors directive: "frame-ancestors \'self\'"',
        severity: vulnType.severity
      });
    }

    // Check if site is currently being framed (potential active clickjacking)
    if (isFramed) {
      try {
        // Try to access parent origin (will throw error if cross-origin)
        const parentOrigin = window.parent.location.origin;
        if (parentOrigin !== window.location.origin) {
          vulnerabilities.push({
            typeId: vulnType.id,
            title: 'Page Currently Framed by Different Origin',
            description: 'This page is embedded in an iframe from a different origin, potential clickjacking attack',
            location: 'Current page context',
            evidence: `Framed by: ${parentOrigin}`,
            recommendation: 'Implement frame-busting code or X-Frame-Options header to prevent unauthorized framing.',
            severity: vulnType.severity
          });
        }
      } catch (e) {
        // Cross-origin error - definitely framed by different origin
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Page Framed by Cross-Origin Site',
          description: 'This page is embedded in an iframe from a different origin (cross-origin), possible clickjacking',
          location: 'Current page context',
          evidence: 'Cross-origin iframe detected',
          recommendation: 'Implement X-Frame-Options: DENY or SAMEORIGIN to prevent cross-origin framing.',
          severity: vulnType.severity
        });
      }
    }

    // Check for frame-busting code
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    const hasFrameBusting = /if\s*\(\s*top\s*[!=]=\s*self\s*\)|if\s*\(\s*window\s*[!=]=\s*top\s*\)|top\.location\s*=/.test(scriptContent);
    
    if (hasFrameBusting && xFrameOptionsMetaTags.length === 0 && !hasFrameAncestors) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Relying on JavaScript Frame-Busting Only',
        description: 'JavaScript frame-busting detected but no X-Frame-Options header. JS frame-busting can be bypassed.',
        location: 'JavaScript code',
        evidence: 'Frame-busting code found in scripts',
        recommendation: 'Use X-Frame-Options header or CSP frame-ancestors instead of JavaScript frame-busting.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(ClickjackingScanner);
}
