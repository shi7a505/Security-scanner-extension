# 🔒 Security Scanner Extension

A Chrome Extension (Manifest V3) that performs passive security scanning of web applications to detect 20 types of vulnerabilities without modifying pages.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Architecture](#architecture)
- [Vulnerability Types](#vulnerability-types)
- [Technical Details](#technical-details)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Guest Mode (Phase 1)
- ✅ **Passive Scanning** - Detects vulnerabilities without modifying pages
- ✅ **20 Vulnerability Scanners** - Comprehensive security checks
- ✅ **Risk Score Calculation** - 0-100 score based on severity
- ✅ **Local Storage** - Scan results saved for 1 hour
- ✅ **Rate Limiting** - 10 scans per hour for guest users
- ✅ **Modern UI** - Dark theme with color-coded severity levels
- ✅ **Offline Support** - Works without backend connection

### Coming Soon (Phase 2)
- 🔜 User authentication and login
- 🔜 Backend integration for persistent storage
- 🔜 Dashboard with scan history
- 🔜 AI chatbot for vulnerability explanations
- 🔜 Export reports (PDF, JSON)

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download the extension:**
   ```bash
   git clone https://github.com/shi7a505/Security-scanner-extension.git
   cd Security-scanner-extension
   ```

2. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension:**
   - Click "Load unpacked"
   - Select the `extension` folder from the repository
   - Extension icon should appear in your toolbar

4. **Pin the extension (optional):**
   - Click the puzzle icon in Chrome toolbar
   - Find "Security Scanner Extension"
   - Click the pin icon to keep it visible

### Method 2: Chrome Web Store (Coming Soon)
Will be available once published to Chrome Web Store.

## 📖 How to Use

### Basic Usage

1. **Navigate to any website** you want to scan

2. **Wait for automatic scan:**
   - Extension automatically scans the page when it loads
   - Scanning happens in the background (passive mode)

3. **View results:**
   - Click the extension icon in your toolbar
   - Popup shows vulnerability summary:
     - Vulnerability counts by severity (Critical/High/Medium/Low)
     - Risk score (0-100) with visual progress bar
     - Time remaining until results expire (1 hour)
     - Scans remaining this hour (max 10)

4. **View details:**
   - Click "View Details" button for full vulnerability list
   - Each vulnerability shows:
     - Title and description
     - Location in the code
     - Evidence found
     - Recommendations for fixing

5. **Login for more features:**
   - Click "Login / Register" to access the website
   - Logged-in users get:
     - 100 scans per day (vs 10 per hour)
     - 7-day storage (vs 1 hour)
     - Access to dashboard
     - Scan history and export features

### Rate Limiting

**Guest Mode:**
- 10 scans per hour
- Counter resets every hour
- Popup shows remaining scans and time until reset

**Logged-In Mode (Coming Soon):**
- 100 scans per day
- Much higher limits for regular use

### Storage

**Guest Mode:**
- Scans saved locally in browser storage
- Expires after 1 hour
- Automatic cleanup of old scans
- Unique guest session ID generated

## 🏗️ Architecture

### Extension Structure

```
extension/
├── manifest.json                 # Extension configuration (Manifest V3)
├── background.js                 # Service worker for background tasks
├── popup/
│   ├── popup.html               # Popup UI structure
│   ├── popup.css                # Popup styling (dark theme)
│   └── popup.js                 # Popup logic and interactions
├── content/
│   ├── content.js               # Main content script entry point
│   └── scanners/
│       ├── scanner-core.js      # Scanner orchestration
│       ├── xss-scanner.js       # XSS detection
│       ├── sql-injection-scanner.js
│       ├── command-injection-scanner.js
│       ├── api-key-scanner.js
│       ├── insecure-form-scanner.js
│       ├── csp-scanner.js
│       ├── weak-csp-scanner.js
│       ├── sensitive-files-scanner.js
│       ├── mixed-content-scanner.js
│       ├── hsts-scanner.js
│       ├── clickjacking-scanner.js
│       ├── cookie-scanner.js
│       ├── sri-scanner.js
│       ├── cors-scanner.js
│       ├── debug-pages-scanner.js
│       ├── open-redirect-scanner.js
│       ├── csrf-scanner.js
│       ├── deprecated-html-scanner.js
│       └── trackers-scanner.js
├── utils/
│   ├── storage.js               # Chrome storage management
│   ├── rate-limiter.js          # Rate limiting logic
│   └── vulnerability-types.js   # Vulnerability definitions
├── assets/
│   └── icons/                   # Extension icons (16x16, 32x32, 48x48, 128x128)
└── README.md                    # This file
```

### Data Flow

1. **Page Load:**
   - Content script injected into page
   - Scanner core initialized

2. **Scanning:**
   - Each scanner runs independently
   - Passive detection only (no page modifications)
   - Results collected by scanner core

3. **Processing:**
   - Risk score calculated based on severity
   - Vulnerabilities grouped by severity
   - Results sent to background script

4. **Storage:**
   - Background script checks rate limit
   - Scan saved to chrome.storage.local
   - Expiration time set (1 hour for guests)

5. **Display:**
   - Popup fetches current scan from storage
   - Results displayed with visual indicators
   - User can view details or login

### Scanner Architecture

Each scanner is an independent module that:
- Implements a `scan()` method
- Returns array of vulnerability objects
- Registers with `ScannerCore`
- Runs without affecting page functionality

Vulnerability object structure:
```javascript
{
  typeId: 1,
  title: "Vulnerability Title",
  description: "Detailed description",
  location: "Where found in code",
  evidence: "Specific evidence",
  recommendation: "How to fix",
  severity: "Critical|High|Medium|Low"
}
```

## 🐛 Vulnerability Types

### 🔴 Critical (5)

1. **Cross-Site Scripting (XSS) Indicators**
   - Dangerous inline scripts, eval(), innerHTML usage
   - Inline event handlers (onclick, onerror, etc.)
   - javascript: protocol in links
   - CWE-79

2. **SQL Injection Patterns**
   - SQL error messages in page content
   - Database error patterns in console/DOM
   - SQL queries in HTML comments
   - CWE-89

3. **Command Injection Patterns**
   - System command errors in page
   - File upload functionality (potential vector)
   - Path traversal patterns in URLs
   - CWE-78

4. **Exposed API Keys**
   - Google, AWS, Firebase, Stripe keys in client code
   - API configuration objects
   - Hardcoded secrets in JavaScript
   - CWE-798

5. **Insecure Form Endpoints**
   - HTTP forms on HTTPS pages
   - Password fields submitting over HTTP
   - AJAX calls to HTTP from HTTPS
   - CWE-319

### 🟠 High (3)

6. **Missing Content Security Policy (CSP)**
   - No CSP header or meta tag
   - Inline content without protection
   - CWE-1021

7. **Weak Content Security Policy**
   - unsafe-inline or unsafe-eval directives
   - Wildcard (*) in script-src
   - data: URLs allowed in scripts
   - CWE-1021

8. **Exposed Sensitive Files**
   - .git, .env, .htaccess, backup files
   - SSH keys, config files
   - Admin/debug page references
   - CWE-552

### 🟡 Medium (9)

9. **Mixed Content**
   - HTTP resources on HTTPS pages
   - Scripts, stylesheets, images, iframes
   - CWE-311

10. **Missing HSTS Header**
    - No Strict-Transport-Security header
    - HTTP links to same domain on HTTPS
    - CWE-523

11. **Missing X-Frame-Options / Clickjacking**
    - No X-Frame-Options header
    - No CSP frame-ancestors
    - Page can be embedded in iframes
    - CWE-1021

12. **Insecure Cookie Attributes**
    - Cookies accessible to JavaScript (no HttpOnly)
    - Missing Secure flag on HTTPS
    - No SameSite attribute
    - CWE-614

13. **Missing Subresource Integrity (SRI)**
    - External scripts without integrity attribute
    - CDN resources without SRI
    - CWE-353

14. **CORS Misconfiguration**
    - Wildcard Access-Control-Allow-Origin
    - CORS with credentials enabled
    - postMessage without origin validation
    - CWE-942

15. **Exposed Debug/Admin Pages**
    - Links to /debug, /admin, /console
    - Debug mode indicators in code
    - Stack traces visible
    - CWE-215

16. **Open Redirect**
    - Redirect parameters in URL
    - JavaScript redirects with user input
    - Meta refresh tags
    - CWE-601

17. **CSRF Vulnerability**
    - Forms without CSRF tokens
    - AJAX requests without CSRF headers
    - GET requests that change state
    - CWE-352

### 🟢 Low (2)

18. **Deprecated HTML Attributes**
    - Deprecated elements (font, center, marquee)
    - Deprecated attributes (align, bgcolor, border)
    - Old doctypes
    - Best practices

19. **Excessive Third-Party Trackers**
    - Multiple tracking scripts (Google Analytics, Facebook Pixel, etc.)
    - Privacy-invasive session recording
    - Browser fingerprinting
    - Privacy concerns

## 🔧 Technical Details

### Manifest V3
- Uses service worker instead of background pages
- Content scripts injected via manifest
- Declarative permissions model
- Modern Chrome extension architecture

### Permissions
- `activeTab` - Access current tab for scanning
- `storage` - Save scan results locally
- `scripting` - Inject content scripts dynamically
- `<all_urls>` - Scan any website

### Storage
- Uses `chrome.storage.local` API
- No external database in Phase 1
- Automatic cleanup of expired scans
- Guest session tracking

### Rate Limiting
- Client-side implementation
- 10 scans per hour window
- Resets automatically
- Counter stored in chrome.storage.local

### Security
- Passive scanning only (read-only)
- No page modifications
- No data sent to external servers (Phase 1)
- Local storage only

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding New Scanners

1. Create new scanner file in `content/scanners/`
2. Follow the scanner template:

```javascript
const NewScanner = {
  name: 'NewScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.YOUR_TYPE;

    // Your detection logic here
    
    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(NewScanner);
}
```

3. Add to manifest.json content_scripts
4. Test thoroughly

### Improving Existing Scanners

- Reduce false positives
- Add more detection patterns
- Improve performance
- Better evidence collection

### Guidelines

- **Passive only** - Never modify pages
- **Performance** - Keep scans fast
- **Accuracy** - Minimize false positives
- **Documentation** - Comment your code
- **Testing** - Test on various sites

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewScanner`)
3. Commit changes (`git commit -m 'Add NewScanner'`)
4. Push to branch (`git push origin feature/NewScanner`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Roadmap

### Phase 1 (Current) - Guest Mode ✅
- [x] 20 vulnerability scanners
- [x] Local storage (1 hour)
- [x] Rate limiting (10/hour)
- [x] Modern popup UI
- [x] Risk score calculation

### Phase 2 - Backend Integration 🚧
- [ ] User authentication
- [ ] .NET backend API
- [ ] Persistent storage (7 days)
- [ ] Scan history
- [ ] Export functionality

### Phase 3 - Advanced Features 📋
- [ ] Dashboard with analytics
- [ ] AI chatbot for explanations
- [ ] Custom scan configurations
- [ ] Team collaboration
- [ ] Scheduled scans

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/shi7a505/Security-scanner-extension/issues)
- **Documentation**: This README
- **Website**: Coming soon

## 👥 Team

This project is part of a graduation project by a team of developers specializing in:
- Backend Development (.NET)
- Cybersecurity
- Frontend Development
- UI/UX Design
- AI Integration

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Phase 1 (Guest Mode) Complete
