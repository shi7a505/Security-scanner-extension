// Sensitive Files Scanner - Detects references to sensitive files
const SensitiveFilesScanner = {
  name: 'SensitiveFilesScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.SENSITIVE_FILES_EXPOSED;

    // Sensitive file patterns to detect
    const sensitivePatterns = [
      { pattern: /\.git\//g, name: '.git directory', risk: 'Exposes source code and history' },
      { pattern: /\.svn\//g, name: '.svn directory', risk: 'Exposes source code and history' },
      { pattern: /\.env/g, name: '.env file', risk: 'Contains sensitive configuration and secrets' },
      { pattern: /\.htaccess/g, name: '.htaccess file', risk: 'Exposes server configuration' },
      { pattern: /\.htpasswd/g, name: '.htpasswd file', risk: 'Contains password hashes' },
      { pattern: /web\.config/g, name: 'web.config file', risk: 'Exposes server configuration' },
      { pattern: /config\.php/g, name: 'config.php file', risk: 'May contain database credentials' },
      { pattern: /database\.yml/g, name: 'database.yml file', risk: 'Contains database configuration' },
      { pattern: /\.sql/g, name: 'SQL dump files', risk: 'May contain sensitive data' },
      { pattern: /\.bak/g, name: 'Backup files', risk: 'May contain sensitive data' },
      { pattern: /~$/g, name: 'Editor backup files', risk: 'May contain sensitive data' },
      { pattern: /\.backup/g, name: 'Backup files', risk: 'May contain sensitive data' },
      { pattern: /\.old/g, name: 'Old files', risk: 'May contain outdated vulnerable code' },
      { pattern: /\.log/g, name: 'Log files', risk: 'May contain sensitive information' },
      { pattern: /phpinfo\.php/g, name: 'phpinfo file', risk: 'Exposes PHP configuration' },
      { pattern: /composer\.json/g, name: 'composer.json file', risk: 'Exposes dependencies' },
      { pattern: /package\.json/g, name: 'package.json file', risk: 'Exposes dependencies' },
      { pattern: /yarn\.lock/g, name: 'yarn.lock file', risk: 'Exposes exact dependency versions' },
      { pattern: /Gemfile/g, name: 'Gemfile', risk: 'Exposes Ruby dependencies' },
      { pattern: /\.DS_Store/g, name: '.DS_Store file', risk: 'Exposes directory structure (macOS)' },
      { pattern: /id_rsa/g, name: 'SSH private key', risk: 'CRITICAL: Exposes private SSH keys' },
      { pattern: /id_dsa/g, name: 'SSH private key', risk: 'CRITICAL: Exposes private SSH keys' }
    ];

    // Get all links and script/style sources
    const links = Array.from(document.querySelectorAll('a[href], link[href], script[src], img[src], source[src]'));
    const allUrls = links.map(el => el.href || el.src).filter(url => url);

    // Also check page content
    const pageContent = document.documentElement.outerHTML;

    // Check for sensitive file references
    sensitivePatterns.forEach(({ pattern, name, risk }) => {
      // Check in URLs
      const matchedUrls = allUrls.filter(url => pattern.test(url));
      if (matchedUrls.length > 0) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `Reference to ${name}`,
          description: `Found reference to ${name}. ${risk}`,
          location: 'Page resources',
          evidence: matchedUrls.slice(0, 3).join(', '),
          recommendation: `Ensure ${name} is not publicly accessible. Configure web server to deny access to sensitive files. Remove references from public code.`,
          severity: vulnType.severity
        });
      }

      // Check in page content (excluding URLs we already checked)
      const contentMatches = pageContent.match(pattern);
      if (contentMatches && matchedUrls.length === 0) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `Reference to ${name} in Code`,
          description: `Found ${name} mentioned in page source. ${risk}`,
          location: 'HTML/JavaScript content',
          evidence: `Found ${contentMatches.length} reference(s)`,
          recommendation: `Verify ${name} is not accessible. Remove sensitive file references from client-side code.`,
          severity: vulnType.severity
        });
      }
    });

    // Check for common admin/config panels
    const adminPatterns = [
      { url: '/admin', name: 'Admin panel' },
      { url: '/administrator', name: 'Administrator panel' },
      { url: '/phpmyadmin', name: 'phpMyAdmin' },
      { url: '/wp-admin', name: 'WordPress admin' },
      { url: '/cpanel', name: 'cPanel' },
      { url: '/config', name: 'Configuration panel' }
    ];

    adminPatterns.forEach(({ url, name }) => {
      if (allUrls.some(u => u.includes(url))) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `Reference to ${name}`,
          description: `Found reference to ${name} which should not be publicly accessible`,
          location: 'Page links',
          evidence: `Link to ${url}`,
          recommendation: `Ensure ${name} is protected with authentication and not indexed by search engines.`,
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(SensitiveFilesScanner);
}
