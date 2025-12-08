// CSRF Scanner - Detects forms without CSRF tokens
const CSRFScanner = {
  name: 'CSRFScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.CSRF_VULNERABILITY;

    // Find all forms that submit data
    const forms = document.querySelectorAll('form');
    const formsWithoutCSRF = [];

    forms.forEach(form => {
      const method = (form.getAttribute('method') || 'get').toLowerCase();
      
      // Only check POST, PUT, PATCH, DELETE forms (state-changing operations)
      if (method !== 'get') {
        // Check for CSRF token (common names)
        const csrfTokenNames = [
          'csrf', 'csrf_token', 'csrftoken', '_csrf', '_csrf_token',
          'authenticity_token', '_token', 'token', '__RequestVerificationToken',
          'anti_csrf', 'xsrf', 'xsrf_token', '_xsrf'
        ];

        let hasCSRFToken = false;
        
        // Check all inputs in the form
        const inputs = form.querySelectorAll('input[type="hidden"], input[name]');
        inputs.forEach(input => {
          const name = (input.getAttribute('name') || '').toLowerCase();
          if (csrfTokenNames.some(csrfName => name.includes(csrfName))) {
            hasCSRFToken = true;
          }
        });

        if (!hasCSRFToken) {
          const action = form.getAttribute('action') || 'current page';
          formsWithoutCSRF.push({
            action: action,
            method: method,
            formHtml: form.outerHTML.substring(0, 200)
          });
        }
      }
    });

    if (formsWithoutCSRF.length > 0) {
      formsWithoutCSRF.forEach(({ action, method, formHtml }) => {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Form Without CSRF Token',
          description: `${method.toUpperCase()} form without CSRF protection token detected`,
          location: `Form with action="${action}"`,
          evidence: `Method: ${method.toUpperCase()}, Action: ${action}`,
          recommendation: 'Add CSRF token to all state-changing forms. Use synchronizer token pattern or double-submit cookie. Enable SameSite cookie attribute.',
          severity: vulnType.severity
        });
      });
    }

    // Check for AJAX requests without CSRF protection
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    
    // Check for POST/PUT/PATCH/DELETE requests without CSRF headers
    const ajaxPatterns = [
      /fetch\s*\(\s*['"][^'"]*['"]\s*,\s*\{[^}]*method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/gi,
      /\.ajax\s*\(\s*\{[^}]*type\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/gi,
      /\.post\s*\(/gi,
      /XMLHttpRequest.*?open\s*\(\s*['"](?:POST|PUT|PATCH|DELETE)['"]/gi
    ];

    let hasStateChangingAjax = false;
    ajaxPatterns.forEach(pattern => {
      if (pattern.test(scriptContent)) {
        hasStateChangingAjax = true;
      }
    });

    if (hasStateChangingAjax) {
      // Check if CSRF token is being added to requests
      const csrfHeaderPatterns = [
        /X-CSRF-Token/i,
        /X-XSRF-Token/i,
        /X-CSRFToken/i,
        /X-RequestVerificationToken/i,
        /csrf[_-]?token/i
      ];

      let hasCSRFHeader = false;
      csrfHeaderPatterns.forEach(pattern => {
        if (pattern.test(scriptContent)) {
          hasCSRFHeader = true;
        }
      });

      if (!hasCSRFHeader) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'AJAX Requests Without CSRF Protection',
          description: 'State-changing AJAX requests detected without CSRF token headers',
          location: 'JavaScript AJAX calls',
          evidence: 'POST/PUT/PATCH/DELETE requests without CSRF headers',
          recommendation: 'Add CSRF token to AJAX request headers: X-CSRF-Token. Read token from meta tag or cookie.',
          severity: vulnType.severity
        });
      }
    }

    // Check for meta CSRF token (good practice indicator)
    const csrfMetaTags = document.querySelectorAll('meta[name*="csrf"], meta[name*="token"]');
    const hasCSRFMeta = csrfMetaTags.length > 0;

    // If there are state-changing forms/requests but no CSRF meta tag
    if ((formsWithoutCSRF.length > 0 || hasStateChangingAjax) && !hasCSRFMeta) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'No CSRF Token Meta Tag Found',
        description: 'Site has state-changing operations but no CSRF token meta tag detected',
        location: 'HTML head',
        evidence: 'No <meta name="csrf-token"> found',
        recommendation: 'Add CSRF token to page: <meta name="csrf-token" content="token_value">. Include in all state-changing requests.',
        severity: vulnType.severity
      });
    }

    // Check for GET requests that change state (anti-pattern)
    const getForms = document.querySelectorAll('form[method="get"], form:not([method])');
    const dangerousGetForms = [];

    getForms.forEach(form => {
      const action = (form.getAttribute('action') || '').toLowerCase();
      const inputs = Array.from(form.querySelectorAll('input')).map(i => i.name?.toLowerCase() || '');
      
      // Check if form looks like it changes state
      const stateChangingKeywords = ['delete', 'remove', 'update', 'edit', 'create', 'add', 'save'];
      const hasStateChangingIndicators = stateChangingKeywords.some(keyword => 
        action.includes(keyword) || inputs.some(name => name.includes(keyword))
      );

      if (hasStateChangingIndicators) {
        dangerousGetForms.push(action || 'current page');
      }
    });

    if (dangerousGetForms.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'State-Changing GET Requests',
        description: `Found ${dangerousGetForms.length} GET form(s) that appear to change state, making them vulnerable to CSRF`,
        location: 'GET forms',
        evidence: dangerousGetForms.slice(0, 3).join(', '),
        recommendation: 'Use POST, PUT, PATCH, or DELETE for state-changing operations. Never use GET for actions that modify data.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(CSRFScanner);
}
