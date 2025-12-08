// API Key Scanner - Detects exposed API keys in client code
const APIKeyScanner = {
  name: 'APIKeyScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.API_KEY_EXPOSURE;

    // API key patterns for major services
    const apiKeyPatterns = [
      // Google API Keys
      { name: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/, service: 'Google' },
      // AWS Access Keys
      { name: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/, service: 'AWS' },
      { name: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|aws_secret_key)[\s]*[=:][\s]*['"]?([A-Za-z0-9/+=]{40})['"]?/, service: 'AWS' },
      // Firebase
      { name: 'Firebase API Key', pattern: /firebase[_-]?api[_-]?key[\s]*[=:][\s]*['"]?([A-Za-z0-9-_]{39})['"]?/i, service: 'Firebase' },
      // Stripe
      { name: 'Stripe Publishable Key', pattern: /pk_live_[0-9a-zA-Z]{24,}/, service: 'Stripe' },
      { name: 'Stripe Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/, service: 'Stripe' },
      { name: 'Stripe Restricted Key', pattern: /rk_live_[0-9a-zA-Z]{24,}/, service: 'Stripe' },
      // SendGrid
      { name: 'SendGrid API Key', pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/, service: 'SendGrid' },
      // Twilio
      { name: 'Twilio API Key', pattern: /SK[a-z0-9]{32}/, service: 'Twilio' },
      // Slack
      { name: 'Slack Token', pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/, service: 'Slack' },
      // GitHub
      { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/, service: 'GitHub' },
      // Mailgun
      { name: 'Mailgun API Key', pattern: /key-[0-9a-zA-Z]{32}/, service: 'Mailgun' },
      // Square
      { name: 'Square Access Token', pattern: /sq0atp-[0-9A-Za-z-_]{22}/, service: 'Square' },
      // PayPal
      { name: 'PayPal Braintree Access Token', pattern: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/, service: 'PayPal' },
      // Generic patterns
      { name: 'Generic API Key', pattern: /api[_-]?key[\s]*[=:][\s]*['"]([A-Za-z0-9-_]{20,})['"]?/i, service: 'Generic' },
      { name: 'Generic Secret', pattern: /secret[\s]*[=:][\s]*['"]([A-Za-z0-9-_]{20,})['"]?/i, service: 'Generic' }
    ];

    // Get all script content (inline and external references)
    const scripts = document.querySelectorAll('script');
    const allScriptContent = Array.from(scripts).map(s => s.textContent).join('\n');

    // Also check HTML content
    const htmlContent = document.documentElement.outerHTML;

    // Combine all content to scan
    const contentToScan = allScriptContent + '\n' + htmlContent;

    // Scan for each API key pattern
    apiKeyPatterns.forEach(({ name, pattern, service }) => {
      const matches = contentToScan.match(pattern);
      if (matches) {
        // Find location
        let location = 'Unknown';
        if (allScriptContent.match(pattern)) {
          location = 'JavaScript code';
        } else if (htmlContent.match(pattern)) {
          location = 'HTML content';
        }

        vulnerabilities.push({
          typeId: vulnType.id,
          title: `${name} Exposed`,
          description: `Found hardcoded ${name} for ${service} in client-side code`,
          location: location,
          evidence: matches[0].substring(0, 50) + '...',
          recommendation: `Move ${service} API keys to backend environment variables. Never expose sensitive keys in client-side code. Use backend proxy for API calls.`,
          severity: vulnType.severity
        });
      }
    });

    // Check for config objects that might contain keys
    const configPatterns = [
      /apiKey[\s]*:[\s]*['"][^'"]{20,}['"]/i,
      /api_key[\s]*:[\s]*['"][^'"]{20,}['"]/i,
      /clientSecret[\s]*:[\s]*['"][^'"]{20,}['"]/i,
      /client_secret[\s]*:[\s]*['"][^'"]{20,}['"]/i,
      /accessToken[\s]*:[\s]*['"][^'"]{20,}['"]/i,
      /access_token[\s]*:[\s]*['"][^'"]{20,}['"]/i
    ];

    configPatterns.forEach(pattern => {
      if (pattern.test(contentToScan)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Potential API Key in Configuration',
          description: 'Found configuration object with potential API key or secret',
          location: 'JavaScript configuration',
          evidence: contentToScan.match(pattern)?.[0] || 'Config detected',
          recommendation: 'Store API keys and secrets on the server. Use environment variables. Implement backend proxy for sensitive API calls.',
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(APIKeyScanner);
}
