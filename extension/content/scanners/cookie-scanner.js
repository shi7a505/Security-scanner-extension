// Cookie Scanner - Checks for insecure cookie attributes
const CookieScanner = {
  name: 'CookieScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.INSECURE_COOKIES;

    // Get all cookies
    const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);

    if (cookies.length === 0) {
      return vulnerabilities; // No cookies to check
    }

    // Note: From content script, we can only see cookie names/values, not attributes
    // We can't directly check Secure, HttpOnly, or SameSite flags
    // However, we can infer issues

    // If on HTTPS and cookies exist, check if we can access them (means no HttpOnly)
    if (window.location.protocol === 'https:' && cookies.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Cookies Accessible to JavaScript',
        description: `Found ${cookies.length} cookie(s) accessible to JavaScript. These cookies likely lack HttpOnly flag.`,
        location: 'document.cookie',
        evidence: `${cookies.length} cookies found: ${cookies.slice(0, 3).map(c => c.split('=')[0]).join(', ')}`,
        recommendation: 'Set HttpOnly flag on sensitive cookies to prevent XSS attacks from stealing them. Use Secure flag on HTTPS sites.',
        severity: vulnType.severity
      });
    }

    // Check for session-related cookies without proper attributes
    const sessionCookies = cookies.filter(c => {
      const name = c.split('=')[0].toLowerCase();
      return name.includes('session') || name.includes('sess') || 
             name.includes('token') || name.includes('auth') || 
             name.includes('login') || name.includes('user');
    });

    if (sessionCookies.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Session Cookies Accessible to JavaScript',
        description: `Found ${sessionCookies.length} session/authentication cookie(s) accessible via JavaScript`,
        location: 'document.cookie',
        evidence: `Session cookies: ${sessionCookies.slice(0, 3).map(c => c.split('=')[0]).join(', ')}`,
        recommendation: 'CRITICAL: Set HttpOnly flag on all session cookies. Set Secure flag on HTTPS. Set SameSite=Strict or Lax.',
        severity: vulnType.severity
      });
    }

    // Check if on HTTPS but cookies might not be secure
    if (window.location.protocol === 'https:' && cookies.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Cookies May Lack Secure Flag',
        description: 'Cookies found on HTTPS site. Verify all cookies have Secure flag to prevent transmission over HTTP.',
        location: 'document.cookie',
        evidence: `${cookies.length} cookies on HTTPS site`,
        recommendation: 'Set Secure flag on all cookies for HTTPS sites: Set-Cookie: name=value; Secure; HttpOnly; SameSite=Strict',
        severity: vulnType.severity
      });
    }

    // Check for cookies set via JavaScript (insecure practice)
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    if (/document\.cookie\s*=/.test(scriptContent)) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Cookies Set via JavaScript',
        description: 'Cookies being set through document.cookie in JavaScript, which cannot set HttpOnly flag',
        location: 'JavaScript code',
        evidence: 'document.cookie assignment found in scripts',
        recommendation: 'Set cookies on the server-side with proper security flags (Secure, HttpOnly, SameSite).',
        severity: vulnType.severity
      });
    }

    // Check for potential SameSite issues
    const forms = document.querySelectorAll('form[method="post"]');
    if (forms.length > 0 && sessionCookies.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'POST Forms with Session Cookies',
        description: 'Site has POST forms and session cookies. Ensure cookies have SameSite attribute to prevent CSRF.',
        location: `${forms.length} POST form(s)`,
        evidence: `Session cookies present with ${forms.length} POST forms`,
        recommendation: 'Set SameSite=Strict or SameSite=Lax on all cookies to prevent CSRF attacks.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(CookieScanner);
}
