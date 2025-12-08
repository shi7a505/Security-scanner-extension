// SRI Scanner - Checks for missing Subresource Integrity on external scripts
const SRIScanner = {
  name: 'SRIScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.MISSING_SRI;

    // Check external scripts
    const externalScripts = document.querySelectorAll('script[src]');
    const scriptsWithoutSRI = [];

    externalScripts.forEach(script => {
      const src = script.getAttribute('src');
      const integrity = script.getAttribute('integrity');
      
      // Check if it's an external script (different origin)
      try {
        const scriptUrl = new URL(src, window.location.origin);
        const isExternal = scriptUrl.origin !== window.location.origin;
        
        if (isExternal && !integrity) {
          scriptsWithoutSRI.push(src);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    if (scriptsWithoutSRI.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'External Scripts Without Subresource Integrity',
        description: `Found ${scriptsWithoutSRI.length} external script(s) loaded without integrity attribute`,
        location: 'Script tags',
        evidence: scriptsWithoutSRI.slice(0, 3).join(', '),
        recommendation: 'Add integrity attribute to all external scripts: <script src="..." integrity="sha384-..." crossorigin="anonymous">. Use SRI Hash Generator tools.',
        severity: vulnType.severity
      });
    }

    // Check external stylesheets
    const externalStyles = document.querySelectorAll('link[rel="stylesheet"][href]');
    const stylesWithoutSRI = [];

    externalStyles.forEach(link => {
      const href = link.getAttribute('href');
      const integrity = link.getAttribute('integrity');
      
      try {
        const styleUrl = new URL(href, window.location.origin);
        const isExternal = styleUrl.origin !== window.location.origin;
        
        if (isExternal && !integrity) {
          stylesWithoutSRI.push(href);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    if (stylesWithoutSRI.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'External Stylesheets Without Subresource Integrity',
        description: `Found ${stylesWithoutSRI.length} external stylesheet(s) loaded without integrity attribute`,
        location: 'Link tags',
        evidence: stylesWithoutSRI.slice(0, 3).join(', '),
        recommendation: 'Add integrity attribute to all external stylesheets: <link rel="stylesheet" href="..." integrity="sha384-..." crossorigin="anonymous">',
        severity: vulnType.severity
      });
    }

    // Check for common CDNs without SRI
    const commonCDNs = [
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com',
      'unpkg.com',
      'code.jquery.com',
      'maxcdn.bootstrapcdn.com',
      'stackpath.bootstrapcdn.com',
      'ajax.googleapis.com',
      'cdn.bootcss.com'
    ];

    const cdnScriptsWithoutSRI = [];
    externalScripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      const integrity = script.getAttribute('integrity');
      
      if (!integrity && commonCDNs.some(cdn => src.includes(cdn))) {
        cdnScriptsWithoutSRI.push(src);
      }
    });

    if (cdnScriptsWithoutSRI.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'CDN Scripts Without SRI',
        description: `Found ${cdnScriptsWithoutSRI.length} CDN-hosted script(s) without integrity checks`,
        location: 'CDN script tags',
        evidence: cdnScriptsWithoutSRI.slice(0, 3).join(', '),
        recommendation: 'CRITICAL: Add SRI to all CDN resources to protect against CDN compromise. Most CDNs provide SRI hashes.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(SRIScanner);
}
