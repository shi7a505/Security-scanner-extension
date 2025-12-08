# 🏗️ Security Scanner Extension - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Active Web Page                        │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Content Scripts (Injected)            │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │    vulnerability-types.js              │  │  │    │
│  │  │  │    (20 vulnerability definitions)       │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │    scanner-core.js                     │  │  │    │
│  │  │  │    • Scanner orchestrator               │  │  │    │
│  │  │  │    • Risk calculation                   │  │  │    │
│  │  │  │    • Result grouping                    │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │    20 Scanner Modules                   │  │  │    │
│  │  │  │    • xss-scanner.js                     │  │  │    │
│  │  │  │    • sql-injection-scanner.js           │  │  │    │
│  │  │  │    • api-key-scanner.js                 │  │  │    │
│  │  │  │    • ... (17 more)                      │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │    content.js                          │  │  │    │
│  │  │  │    • Main entry point                   │  │  │    │
│  │  │  │    • Trigger scans                      │  │  │    │
│  │  │  │    • Send results to background         │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │        Background Service Worker                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    background.js                             │  │    │
│  │  │    • Handle scan results                      │  │    │
│  │  │    • Rate limit checking                      │  │    │
│  │  │    • Storage management                       │  │    │
│  │  │    • Cleanup expired scans                    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Popup UI                               │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    popup.html + popup.css                    │  │    │
│  │  │    • Vulnerability summary                    │  │    │
│  │  │    • Risk score display                       │  │    │
│  │  │    • Guest mode info                          │  │    │
│  │  │    • Action buttons                           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    popup.js                                  │  │    │
│  │  │    • Load scan results                        │  │    │
│  │  │    • Display formatting                       │  │    │
│  │  │    • User interactions                        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Chrome Storage (Local)                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    • guestSessionId                          │  │    │
│  │  │    • scans[] (with 1-hour expiration)        │  │    │
│  │  │    • rateLimitData (10 scans/hour)           │  │    │
│  │  │    • currentScan                             │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Utility Modules                          │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    storage.js                                │  │    │
│  │  │    • Save/retrieve scans                      │  │    │
│  │  │    • Generate IDs                             │  │    │
│  │  │    • Cleanup expired data                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    rate-limiter.js                           │  │    │
│  │  │    • Check scan limits                        │  │    │
│  │  │    • Record scans                             │  │    │
│  │  │    • Calculate reset time                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Page Load & Scan
```
User navigates to website
         ↓
Content script injected
         ↓
Scanner core initializes
         ↓
20 scanners execute (passive)
         ↓
Results collected
         ↓
Risk score calculated
         ↓
Message sent to background
```

### 2. Background Processing
```
Background receives results
         ↓
Check rate limit
         ↓
If allowed:
  • Record scan
  • Generate scan ID
  • Set expiration (1 hour)
  • Save to storage
         ↓
If blocked:
  • Return rate limit error
```

### 3. Popup Display
```
User clicks extension icon
         ↓
Popup opens
         ↓
Fetch current scan
         ↓
Check rate limit status
         ↓
Display results:
  • Vulnerability counts
  • Risk score
  • Time remaining
  • Scans remaining
```

## Component Details

### Content Scripts
**Location**: `extension/content/`

**Purpose**: Injected into web pages to perform scanning

**Files**:
- `content.js` - Main entry point, orchestrates scanning
- `scanners/scanner-core.js` - Manages scanner execution
- `scanners/*.js` - 20 individual vulnerability scanners

**Lifecycle**:
1. Injected when page loads (document_idle)
2. Waits for DOM ready
3. Executes all scanners
4. Sends results to background

### Background Service Worker
**Location**: `extension/background.js`

**Purpose**: Central hub for extension logic

**Responsibilities**:
- Handle scan result messages
- Enforce rate limiting
- Manage storage operations
- Periodic cleanup (every 10 minutes)
- Generate unique IDs

**Persistent**: Yes (service worker stays active)

### Popup Interface
**Location**: `extension/popup/`

**Purpose**: User interface for viewing results

**Components**:
- `popup.html` - Structure
- `popup.css` - Dark theme styling
- `popup.js` - Logic and interactions

**States**:
- Loading - During scan
- Results - Show vulnerabilities
- No Vulnerabilities - Success state
- Rate Limit - Limit reached
- Error - Something went wrong

### Utility Modules
**Location**: `extension/utils/`

**Purpose**: Reusable helper functions

**Modules**:
- `vulnerability-types.js` - 20 vulnerability definitions
- `storage.js` - Chrome storage wrapper
- `rate-limiter.js` - Rate limiting logic

## Storage Schema

### Guest Session
```javascript
{
  guestSessionId: "guest_1234567890_abc123"
}
```

### Rate Limit
```javascript
{
  rateLimitData: {
    scanCount: 5,          // Current count
    windowStart: 1234567890000,  // Window start
    resetAt: 1234571490000       // When to reset
  }
}
```

### Scans
```javascript
{
  scans: [
    {
      id: "scan_1234567890_xyz789",
      guestSessionId: "guest_1234567890_abc123",
      url: "https://example.com",
      scannedAt: 1234567890000,
      expiresAt: 1234571490000,  // +1 hour
      totalVulnerabilities: 12,
      riskScore: 67,
      counts: {
        critical: 2,
        high: 3,
        medium: 5,
        low: 2
      },
      vulnerabilities: [
        {
          typeId: 1,
          title: "XSS Indicator",
          description: "Inline event handler",
          location: "button onclick",
          evidence: "onclick=\"alert('test')\"",
          recommendation: "Use addEventListener",
          severity: "Critical"
        }
        // ... more vulnerabilities
      ]
    }
  ]
}
```

## Scanner Architecture

### Scanner Interface
```javascript
const Scanner = {
  name: 'ScannerName',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.TYPE_NAME;
    
    // 1. Detection Logic
    // - Query DOM
    // - Check patterns
    // - Analyze code
    
    // 2. Create Vulnerability Objects
    if (issueFound) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Issue Title',
        description: 'What was found',
        location: 'Where in page',
        evidence: 'Proof of issue',
        recommendation: 'How to fix',
        severity: vulnType.severity
      });
    }
    
    // 3. Return Results
    return vulnerabilities;
  }
};

// 4. Register with Core
ScannerCore.register(Scanner);
```

### Scanner Execution
```javascript
// Scanner Core
const ScannerCore = {
  scanners: [],
  
  register(scanner) {
    this.scanners.push(scanner);
  },
  
  async runAllScans() {
    const results = [];
    
    for (const scanner of this.scanners) {
      try {
        const findings = await scanner.scan();
        results.push(...findings);
      } catch (error) {
        console.error(scanner.name, error);
      }
    }
    
    return results;
  },
  
  calculateRiskScore(vulnerabilities) {
    const weights = {
      Critical: 25,
      High: 15,
      Medium: 8,
      Low: 3
    };
    
    let score = 0;
    vulnerabilities.forEach(v => {
      score += weights[v.severity] || 0;
    });
    
    return Math.min(100, score);
  }
};
```

## Message Passing

### Content → Background
```javascript
// From content script
chrome.runtime.sendMessage({
  type: 'SCAN_COMPLETE',
  data: {
    url: window.location.href,
    vulnerabilities: [...],
    riskScore: 67,
    counts: { critical: 2, high: 3, medium: 5, low: 2 }
  }
}, (response) => {
  console.log('Scan saved:', response);
});
```

### Popup → Background
```javascript
// From popup
chrome.runtime.sendMessage({
  type: 'GET_CURRENT_SCAN',
  url: currentUrl
}, (response) => {
  displayResults(response.scan);
});

chrome.runtime.sendMessage({
  type: 'CHECK_RATE_LIMIT'
}, (response) => {
  updateRateLimitUI(response.status);
});
```

## Performance Considerations

### Scanning
- **Async execution** - Non-blocking
- **Efficient queries** - Specific selectors
- **Early returns** - Skip unnecessary work
- **Result caching** - Reuse parsed data

### Storage
- **Automatic cleanup** - Remove expired scans
- **Minimal data** - Only essential info
- **Indexed access** - Fast lookups
- **Compressed storage** - Efficient use

### UI
- **Lazy loading** - Load on demand
- **Virtual scrolling** - For large lists
- **Debounced updates** - Prevent thrashing
- **CSS animations** - Hardware accelerated

## Security Model

### Passive Scanning
```
✅ Read page content
✅ Query DOM elements
✅ Check HTTP headers (via meta tags)
✅ Analyze JavaScript code
❌ Modify page content
❌ Execute arbitrary code
❌ Send network requests
❌ Access user data
```

### Permissions
```json
{
  "permissions": [
    "activeTab",    // Access current tab
    "storage",      // Save scan results
    "scripting"     // Inject content scripts
  ],
  "host_permissions": [
    "<all_urls>"   // Scan any website
  ]
}
```

### Privacy
- ✅ No analytics
- ✅ No tracking
- ✅ No external requests
- ✅ Local storage only
- ✅ 1-hour data retention

## Extension Lifecycle

### Installation
```
1. User installs extension
2. background.js service worker starts
3. Initialize guest session ID
4. Extension icon appears in toolbar
```

### Page Visit
```
1. User navigates to website
2. Content scripts injected
3. Scanners execute automatically
4. Results sent to background
5. Stored locally with expiration
```

### Popup Interaction
```
1. User clicks extension icon
2. Popup opens
3. Fetch current scan data
4. Display results
5. User can view details or login
```

### Periodic Cleanup
```
Every 10 minutes:
1. Get all scans from storage
2. Filter out expired scans
3. Update storage
4. Free memory
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Phase 1 Complete
