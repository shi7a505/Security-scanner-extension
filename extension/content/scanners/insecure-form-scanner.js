// Insecure Form Scanner - Detects HTTP forms on HTTPS pages
const InsecureFormScanner = {
  name: 'InsecureFormScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.INSECURE_FORM_ENDPOINT;

    // Only check if current page is HTTPS
    if (window.location.protocol !== 'https:') {
      return vulnerabilities;
    }

    // Find all forms
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      const action = form.getAttribute('action');
      const method = form.getAttribute('method')?.toLowerCase() || 'get';

      // Check if form action is HTTP (insecure)
      if (action && action.startsWith('http://')) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Form Submits to HTTP Endpoint',
          description: `Form on HTTPS page submits to insecure HTTP endpoint: ${action}`,
          location: `Form with action="${action}"`,
          evidence: `Method: ${method.toUpperCase()}, Action: ${action}`,
          recommendation: 'Change form action to HTTPS to protect submitted data from interception. Ensure the receiving endpoint supports HTTPS.',
          severity: vulnType.severity
        });
      }

      // Check for password fields in forms with HTTP action
      if (action && action.startsWith('http://')) {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        if (passwordFields.length > 0) {
          vulnerabilities.push({
            typeId: vulnType.id,
            title: 'Password Field Submits Over HTTP',
            description: `Form contains password field(s) but submits to HTTP endpoint`,
            location: `Form with ${passwordFields.length} password field(s)`,
            evidence: `Password fields submitting to: ${action}`,
            recommendation: 'CRITICAL: Change form action to HTTPS immediately. Passwords should never be transmitted over unencrypted connections.',
            severity: vulnType.severity
          });
        }
      }

      // Check for forms without action attribute on HTTPS (might default to current page)
      if (!action) {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        const emailFields = form.querySelectorAll('input[type="email"]');
        const sensitiveFields = form.querySelectorAll('input[name*="card"], input[name*="ssn"], input[name*="credit"]');
        
        if (passwordFields.length > 0 || emailFields.length > 0 || sensitiveFields.length > 0) {
          // This is okay on HTTPS, but we should verify
          // No vulnerability here, form will submit to same page (HTTPS)
        }
      }
    });

    // Check for Ajax calls to HTTP from HTTPS
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    const httpCallPatterns = [
      /fetch\s*\(\s*['"]http:\/\//g,
      /\.ajax\s*\(\s*[{]?[^}]*url\s*:\s*['"]http:\/\//g,
      /XMLHttpRequest.*?open\s*\(\s*['"][^'"]*['"]\s*,\s*['"]http:\/\//g
    ];

    httpCallPatterns.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'AJAX Request to HTTP from HTTPS',
          description: `JavaScript makes HTTP requests from HTTPS page, exposing data to interception`,
          location: 'JavaScript code',
          evidence: matches[0].substring(0, 100),
          recommendation: 'Change all API endpoints to HTTPS. Enable HSTS on the backend server.',
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(InsecureFormScanner);
}
