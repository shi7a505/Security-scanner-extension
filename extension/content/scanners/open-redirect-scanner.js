// Open Redirect Scanner - Detects open redirect vulnerabilities
const OpenRedirectScanner = {
  name: 'OpenRedirectScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.OPEN_REDIRECT;

    // Common redirect parameter names
    const redirectParams = [
      'redirect', 'redirect_uri', 'redirectUri', 'redirect_url', 'redirectUrl',
      'return', 'returnUrl', 'return_url', 'returnTo', 'return_to',
      'next', 'nextUrl', 'next_url',
      'url', 'target', 'dest', 'destination',
      'continue', 'continueTo', 'goto', 'go',
      'callback', 'callbackUrl', 'callback_url',
      'out', 'view', 'to', 'redir'
    ];

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousParams = [];

    redirectParams.forEach(param => {
      if (urlParams.has(param)) {
        const value = urlParams.get(param);
        // Check if value looks like a URL
        if (value && (value.startsWith('http://') || value.startsWith('https://') || 
            value.startsWith('//') || value.includes('.'))) {
          suspiciousParams.push({ param, value });
        }
      }
    });

    if (suspiciousParams.length > 0) {
      suspiciousParams.forEach(({ param, value }) => {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Open Redirect Parameter Detected',
          description: `URL parameter "${param}" contains a redirect target, potential open redirect vulnerability`,
          location: `URL parameter: ${param}`,
          evidence: `${param}=${value}`,
          recommendation: 'Validate redirect URLs against allowlist of trusted domains. Use relative paths instead of absolute URLs. Never redirect to user-controlled URLs.',
          severity: vulnType.severity
        });
      });
    }

    // Check links with redirect parameters
    const links = document.querySelectorAll('a[href]');
    const linksWithRedirects = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        try {
          const linkUrl = new URL(href, window.location.origin);
          const linkParams = new URLSearchParams(linkUrl.search);
          
          redirectParams.forEach(param => {
            if (linkParams.has(param)) {
              const value = linkParams.get(param);
              if (value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//'))) {
                linksWithRedirects.push(href);
              }
            }
          });
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    if (linksWithRedirects.length > 0) {
      const uniqueLinks = [...new Set(linksWithRedirects)];
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Links with Redirect Parameters',
        description: `Found ${uniqueLinks.length} link(s) containing redirect parameters`,
        location: 'Page links',
        evidence: uniqueLinks.slice(0, 3).join(', '),
        recommendation: 'Validate all redirect destinations. Implement allowlist of trusted redirect targets.',
        severity: vulnType.severity
      });
    }

    // Check for JavaScript redirects with user-controlled input
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    
    // Patterns for dangerous redirects
    const dangerousRedirectPatterns = [
      /window\.location\s*=\s*(?:urlParams|params|query|location\.search|document\.location\.search)/i,
      /window\.location\.href\s*=\s*(?:urlParams|params|query|location\.search|document\.location\.search)/i,
      /location\.replace\s*\(\s*(?:urlParams|params|query|location\.search|document\.location\.search)/i,
      /window\.open\s*\(\s*(?:urlParams|params|query|location\.search|document\.location\.search)/i
    ];

    dangerousRedirectPatterns.forEach(pattern => {
      if (pattern.test(scriptContent)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'JavaScript Redirect with User Input',
          description: 'JavaScript code redirects to user-controlled URL without validation',
          location: 'JavaScript code',
          evidence: scriptContent.match(pattern)?.[0] || 'Dangerous redirect detected',
          recommendation: 'Never redirect to user-controlled URLs. Validate against allowlist. Use indirect references (e.g., IDs) instead of URLs.',
          severity: vulnType.severity
        });
      }
    });

    // Check for meta refresh redirects
    const metaRefresh = document.querySelectorAll('meta[http-equiv="refresh"]');
    metaRefresh.forEach(meta => {
      const content = meta.getAttribute('content') || '';
      if (content.includes('url=')) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Meta Refresh Redirect',
          description: 'Meta refresh tag used for redirection',
          location: 'Meta tag',
          evidence: content,
          recommendation: 'Use server-side redirects (HTTP 302/301) instead of meta refresh. Validate redirect destinations.',
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(OpenRedirectScanner);
}
