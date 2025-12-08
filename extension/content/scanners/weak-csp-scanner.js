// Weak CSP Scanner - Detects weak CSP configurations
const WeakCSPScanner = {
  name: 'WeakCSPScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.WEAK_CSP;

    // Check for CSP in meta tags
    const cspMetaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    
    cspMetaTags.forEach(metaTag => {
      const cspContent = metaTag.getAttribute('content') || '';

      // Check for unsafe-inline
      if (cspContent.includes("'unsafe-inline'")) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'CSP Contains unsafe-inline',
          description: 'Content Security Policy uses unsafe-inline directive, which defeats the purpose of CSP by allowing inline scripts',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: 'Remove unsafe-inline from CSP. Use nonces or hashes for inline scripts. Move inline scripts to external files.',
          severity: vulnType.severity
        });
      }

      // Check for unsafe-eval
      if (cspContent.includes("'unsafe-eval'")) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'CSP Contains unsafe-eval',
          description: 'Content Security Policy uses unsafe-eval directive, allowing eval() and similar dangerous functions',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: 'Remove unsafe-eval from CSP. Refactor code to eliminate eval() usage. Use JSON.parse() for JSON data.',
          severity: vulnType.severity
        });
      }

      // Check for wildcard in script-src
      if (/script-src[^;]*\*/.test(cspContent)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'CSP Uses Wildcard in script-src',
          description: 'Content Security Policy uses wildcard (*) in script-src, allowing scripts from any domain',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: 'Replace wildcard with specific trusted domains. Use strict allowlist of script sources.',
          severity: vulnType.severity
        });
      }

      // Check for data: in script-src
      if (/script-src[^;]*data:/.test(cspContent)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'CSP Allows data: URLs in Scripts',
          description: 'Content Security Policy allows data: URLs in script-src, which can be exploited for XSS',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: 'Remove data: from script-src. Use external script files or nonces/hashes for inline scripts.',
          severity: vulnType.severity
        });
      }

      // Check for overly permissive default-src
      if (/default-src[^;]*\*/.test(cspContent) || cspContent.includes("default-src 'unsafe-inline'")) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Weak default-src Directive',
          description: 'Content Security Policy has overly permissive default-src with wildcard or unsafe-inline',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: 'Set default-src to \'self\' and specify individual directives for each resource type.',
          severity: vulnType.severity
        });
      }

      // Check if object-src is not set to 'none'
      if (!cspContent.includes("object-src 'none'") && !cspContent.includes("object-src'none'")) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'CSP Missing object-src Restriction',
          description: 'Content Security Policy does not restrict object-src, allowing potentially dangerous plugins',
          location: 'CSP meta tag',
          evidence: cspContent.substring(0, 200),
          recommendation: "Add object-src 'none' to CSP to prevent Flash and other plugin-based attacks.",
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(WeakCSPScanner);
}
