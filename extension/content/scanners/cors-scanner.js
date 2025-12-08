// CORS Scanner - Checks for CORS misconfiguration
const CORSScanner = {
  name: 'CORSScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.CORS_MISCONFIGURATION;

    // Check for CORS-related meta tags (uncommon but possible)
    const corsMetaTags = document.querySelectorAll('meta[http-equiv*="Access-Control"]');
    
    corsMetaTags.forEach(metaTag => {
      const httpEquiv = metaTag.getAttribute('http-equiv');
      const content = metaTag.getAttribute('content');
      
      if (httpEquiv.includes('Access-Control-Allow-Origin')) {
        if (content === '*') {
          vulnerabilities.push({
            typeId: vulnType.id,
            title: 'Wildcard CORS Policy',
            description: 'Access-Control-Allow-Origin set to * (wildcard), allowing any domain to access resources',
            location: 'Meta tag',
            evidence: `${httpEquiv}: ${content}`,
            recommendation: 'Restrict CORS to specific trusted domains. Never use * for APIs with sensitive data.',
            severity: vulnType.severity
          });
        }
      }
    });

    // Check JavaScript code for CORS configurations
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    
    // Check for fetch/XHR with credentials
    const corsPatterns = [
      { pattern: /Access-Control-Allow-Origin['"]?\s*:\s*['"]?\*['"]?/gi, issue: 'Wildcard CORS' },
      { pattern: /Access-Control-Allow-Credentials['"]?\s*:\s*['"]?true['"]?/gi, issue: 'CORS with credentials' },
      { pattern: /credentials\s*:\s*['"]?include['"]?/gi, issue: 'Fetch with credentials' },
      { pattern: /withCredentials\s*=\s*true/gi, issue: 'XHR with credentials' }
    ];

    const foundPatterns = [];
    corsPatterns.forEach(({ pattern, issue }) => {
      if (pattern.test(scriptContent)) {
        foundPatterns.push(issue);
      }
    });

    if (foundPatterns.includes('Wildcard CORS')) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'CORS Wildcard Configuration in Code',
        description: 'Found Access-Control-Allow-Origin: * configuration in JavaScript code',
        location: 'JavaScript code',
        evidence: 'Wildcard CORS policy detected',
        recommendation: 'Use specific origins instead of wildcard. Validate origins server-side.',
        severity: vulnType.severity
      });
    }

    if (foundPatterns.includes('CORS with credentials') || 
        foundPatterns.includes('Fetch with credentials') || 
        foundPatterns.includes('XHR with credentials')) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'CORS Requests with Credentials',
        description: 'Cross-origin requests are configured to send credentials (cookies, auth headers)',
        location: 'JavaScript code',
        evidence: `Found: ${foundPatterns.join(', ')}`,
        recommendation: 'Ensure server validates Origin header when using credentials. Never combine credentials with wildcard CORS.',
        severity: vulnType.severity
      });
    }

    // Check for cross-origin API calls
    const apiCallPatterns = [
      /fetch\s*\(\s*['"]https?:\/\/([^'"]+)['"]/gi,
      /\.ajax\s*\(\s*[{]?[^}]*url\s*:\s*['"]https?:\/\/([^'"]+)['"]/gi,
      /XMLHttpRequest.*?open\s*\(\s*['"][^'"]*['"]\s*,\s*['"]https?:\/\/([^'"]+)['"]/gi
    ];

    const crossOriginCalls = [];
    apiCallPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(scriptContent)) !== null) {
        try {
          const url = new URL(match[1].startsWith('http') ? match[1] : 'https://' + match[1]);
          if (url.origin !== window.location.origin) {
            crossOriginCalls.push(url.origin);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    if (crossOriginCalls.length > 0) {
      const uniqueOrigins = [...new Set(crossOriginCalls)];
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Cross-Origin API Calls Detected',
        description: `Found ${uniqueOrigins.length} different cross-origin API call(s). Ensure proper CORS configuration.`,
        location: 'JavaScript API calls',
        evidence: uniqueOrigins.slice(0, 3).join(', '),
        recommendation: 'Verify CORS configuration on all API endpoints. Use allowlist of trusted origins. Validate Origin header server-side.',
        severity: vulnType.severity
      });
    }

    // Check for postMessage usage (can be CORS-related)
    if (/postMessage\s*\(/gi.test(scriptContent)) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'postMessage Usage Detected',
        description: 'Cross-window messaging detected. Ensure proper origin validation.',
        location: 'JavaScript code',
        evidence: 'postMessage() calls found',
        recommendation: 'Always validate message origin in postMessage handlers: if (event.origin !== "https://trusted.com") return;',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(CORSScanner);
}
