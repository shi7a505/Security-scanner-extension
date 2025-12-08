// XSS Indicators Scanner - Detects dangerous inline scripts and XSS patterns
const XSSScanner = {
  name: 'XSSScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.XSS_INDICATORS;

    // Check for dangerous inline event handlers
    const inlineEventHandlers = document.querySelectorAll('[onclick], [onerror], [onload], [onmouseover]');
    if (inlineEventHandlers.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Inline Event Handlers Detected',
        description: `Found ${inlineEventHandlers.length} element(s) with inline event handlers (onclick, onerror, etc.)`,
        location: `${inlineEventHandlers.length} element(s) in DOM`,
        evidence: Array.from(inlineEventHandlers).slice(0, 3).map(el => el.outerHTML.substring(0, 100)).join(', '),
        recommendation: 'Use addEventListener() instead of inline event handlers. Implement Content Security Policy to prevent inline scripts.',
        severity: vulnType.severity
      });
    }

    // Check for eval() usage in inline scripts
    const scriptTags = document.querySelectorAll('script:not([src])');
    scriptTags.forEach(script => {
      if (script.textContent.includes('eval(')) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'eval() Usage Detected',
          description: 'Found eval() function in inline script which can execute arbitrary code',
          location: 'Inline script tag',
          evidence: script.textContent.substring(0, 200),
          recommendation: 'Avoid using eval(). Use JSON.parse() for JSON data or refactor code to eliminate eval().',
          severity: vulnType.severity
        });
      }
    });

    // Check for innerHTML usage (potential XSS if used with user input)
    const inlineScripts = Array.from(scriptTags).map(s => s.textContent).join(' ');
    if (inlineScripts.includes('innerHTML')) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'innerHTML Usage Detected',
        description: 'Found innerHTML usage which can lead to XSS if used with unsanitized user input',
        location: 'JavaScript code',
        evidence: 'innerHTML detected in scripts',
        recommendation: 'Use textContent, setAttribute(), or createElement() instead of innerHTML. If HTML is required, use DOMPurify library.',
        severity: vulnType.severity
      });
    }

    // Check for document.write()
    if (inlineScripts.includes('document.write')) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'document.write() Usage Detected',
        description: 'Found document.write() which can introduce XSS vulnerabilities',
        location: 'JavaScript code',
        evidence: 'document.write() detected in scripts',
        recommendation: 'Use DOM manipulation methods like appendChild() instead of document.write().',
        severity: vulnType.severity
      });
    }

    // Check for javascript: protocol in links
    const jsLinks = document.querySelectorAll('a[href^="javascript:"]');
    if (jsLinks.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'javascript: Protocol in Links',
        description: `Found ${jsLinks.length} link(s) using javascript: protocol`,
        location: `${jsLinks.length} anchor element(s)`,
        evidence: Array.from(jsLinks).slice(0, 3).map(a => a.href).join(', '),
        recommendation: 'Replace javascript: URLs with proper event handlers or use # with event.preventDefault().',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(XSSScanner);
}
