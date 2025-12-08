// Debug Pages Scanner - Detects exposed debug/admin pages
const DebugPagesScanner = {
  name: 'DebugPagesScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.EXPOSED_DEBUG_PAGES;

    // Debug/Admin paths to check
    const debugPaths = [
      '/debug', '/debug/', '/_debug',
      '/test', '/test/', '/_test',
      '/dev', '/dev/', '/_dev',
      '/admin', '/admin/', '/administrator',
      '/console', '/console/', '/_console',
      '/phpinfo.php', '/info.php',
      '/server-status', '/server-info',
      '/.env', '/config', '/configuration',
      '/swagger', '/swagger-ui', '/api-docs',
      '/graphql', '/graphiql',
      '/actuator', '/actuator/health',
      '/metrics', '/health', '/status',
      '/wp-admin', '/wp-login.php',
      '/phpmyadmin', '/pma',
      '/adminer', '/adminer.php'
    ];

    // Check all links on page
    const links = document.querySelectorAll('a[href]');
    const foundDebugLinks = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        debugPaths.forEach(debugPath => {
          if (href.includes(debugPath)) {
            foundDebugLinks.push(href);
          }
        });
      }
    });

    if (foundDebugLinks.length > 0) {
      const uniqueLinks = [...new Set(foundDebugLinks)];
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Links to Debug/Admin Pages Found',
        description: `Found ${uniqueLinks.length} link(s) to potential debug or admin pages`,
        location: 'Page links',
        evidence: uniqueLinks.slice(0, 5).join(', '),
        recommendation: 'Remove links to debug/admin pages from production. Protect admin areas with authentication. Disable debug mode in production.',
        severity: vulnType.severity
      });
    }

    // Check if current page is a debug page
    const currentPath = window.location.pathname.toLowerCase();
    const matchedDebugPath = debugPaths.find(path => currentPath.includes(path.toLowerCase()));
    
    if (matchedDebugPath) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Currently on Debug/Admin Page',
        description: `Current page appears to be a debug or admin page: ${currentPath}`,
        location: 'Current URL',
        evidence: `Path: ${currentPath}`,
        recommendation: 'Ensure this page is protected with strong authentication and not accessible to unauthorized users.',
        severity: vulnType.severity
      });
    }

    // Check for debug information in page content
    const debugIndicators = [
      { pattern: /debug\s*mode\s*:\s*true/i, name: 'Debug mode enabled' },
      { pattern: /development\s*mode/i, name: 'Development mode' },
      { pattern: /DEBUG\s*=\s*True/i, name: 'Debug flag set' },
      { pattern: /APP_DEBUG\s*=\s*true/i, name: 'App debug enabled' },
      { pattern: /environment\s*:\s*['"]development['"]/i, name: 'Development environment' },
      { pattern: /ENVIRONMENT\s*=\s*['"]dev['"]/i, name: 'Dev environment' }
    ];

    const pageContent = document.documentElement.innerHTML;
    debugIndicators.forEach(({ pattern, name }) => {
      if (pattern.test(pageContent)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `${name} Detected`,
          description: `Found indication that ${name.toLowerCase()} in page source`,
          location: 'Page content',
          evidence: pageContent.match(pattern)?.[0] || name,
          recommendation: 'Disable debug mode in production. Remove debug output from client-side code.',
          severity: vulnType.severity
        });
      }
    });

    // Check for stack traces or error details
    const errorPatterns = [
      /Stack trace:/i,
      /Error in file .* on line \d+/i,
      /Fatal error:/i,
      /Warning: /i,
      /Notice: /i,
      /Exception: /i,
      /Traceback \(most recent call last\):/i
    ];

    const pageText = document.body.innerText;
    errorPatterns.forEach(pattern => {
      if (pattern.test(pageText)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Detailed Error Messages Exposed',
          description: 'Detailed error messages or stack traces visible in page content',
          location: 'Page content',
          evidence: pageText.match(pattern)?.[0] || 'Error details detected',
          recommendation: 'Suppress detailed error messages in production. Log errors server-side instead of displaying them.',
          severity: vulnType.severity
        });
        return; // Only report once
      }
    });

    // Check for commented-out debug code
    const comments = document.evaluate('//comment()', document, null, XPathResult.ANY_TYPE, null);
    let comment = comments.iterateNext();
    const debugComments = [];
    
    while (comment && debugComments.length < 3) {
      const commentText = comment.textContent.toLowerCase();
      if (commentText.includes('debug') || commentText.includes('todo') || 
          commentText.includes('fixme') || commentText.includes('hack')) {
        debugComments.push(comment.textContent.substring(0, 100));
      }
      comment = comments.iterateNext();
    }

    if (debugComments.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Debug Comments in Source Code',
        description: `Found ${debugComments.length} HTML comment(s) containing debug-related text`,
        location: 'HTML comments',
        evidence: debugComments[0],
        recommendation: 'Remove debug comments from production code. Use build process to strip comments.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(DebugPagesScanner);
}
