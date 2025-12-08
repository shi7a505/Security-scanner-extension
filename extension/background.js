// Background service worker for Security Scanner Extension
console.log('[Security Scanner] Background service worker started');

// Storage helper functions (imported conceptually - service workers can't use ES6 imports)
const KEYS = {
  GUEST_SESSION_ID: 'guestSessionId',
  SCANS: 'scans',
  RATE_LIMIT_DATA: 'rateLimitData',
  CURRENT_SCAN: 'currentScan'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Security Scanner] Extension installed/updated:', details.reason);
  
  // Initialize guest session ID if not exists
  const data = await chrome.storage.local.get([KEYS.GUEST_SESSION_ID]);
  if (!data[KEYS.GUEST_SESSION_ID]) {
    const guestSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await chrome.storage.local.set({ [KEYS.GUEST_SESSION_ID]: guestSessionId });
    console.log('[Security Scanner] Guest session ID created:', guestSessionId);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Security Scanner] Message received:', message.type);

  if (message.type === 'SCAN_COMPLETE') {
    handleScanComplete(message.data)
      .then((result) => {
        sendResponse({ success: true, result: result });
      })
      .catch((error) => {
        console.error('[Security Scanner] Error handling scan:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'GET_CURRENT_SCAN') {
    getCurrentScan(message.url)
      .then((scan) => {
        sendResponse({ success: true, scan: scan });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === 'TRIGGER_SCAN') {
    // Forward to active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TRIGGER_SCAN' }, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: 'No active tab' });
      }
    });
    return true;
  }

  if (message.type === 'CHECK_RATE_LIMIT') {
    checkRateLimit()
      .then((status) => {
        sendResponse({ success: true, status: status });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Handle scan completion
async function handleScanComplete(scanData) {
  console.log('[Security Scanner] Processing scan results for:', scanData.url);

  // Check rate limit
  const rateLimitStatus = await checkRateLimit();
  if (!rateLimitStatus.allowed) {
    console.log('[Security Scanner] Rate limit exceeded');
    return { error: 'rate_limit_exceeded', status: rateLimitStatus };
  }

  // Record scan
  await recordScan();

  // Save scan results
  const scan = await saveScan(scanData);
  
  // Store as current scan
  await chrome.storage.local.set({ [KEYS.CURRENT_SCAN]: scan });

  console.log('[Security Scanner] Scan saved:', scan.id);
  return scan;
}

// Check rate limit
async function checkRateLimit() {
  const data = await chrome.storage.local.get(['rateLimitData']);
  const now = Date.now();
  const LIMIT = 10;
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  let rateLimitData = data.rateLimitData;

  if (!rateLimitData || now >= rateLimitData.resetAt) {
    rateLimitData = {
      scanCount: 0,
      windowStart: now,
      resetAt: now + WINDOW_MS
    };
  }

  const allowed = rateLimitData.scanCount < LIMIT;
  const remaining = Math.max(0, LIMIT - rateLimitData.scanCount);

  return {
    allowed: allowed,
    remaining: remaining,
    resetAt: rateLimitData.resetAt,
    scanCount: rateLimitData.scanCount
  };
}

// Record a scan (increment counter)
async function recordScan() {
  const data = await chrome.storage.local.get(['rateLimitData']);
  const now = Date.now();
  const WINDOW_MS = 60 * 60 * 1000;

  let rateLimitData = data.rateLimitData;

  if (!rateLimitData || now >= rateLimitData.resetAt) {
    rateLimitData = {
      scanCount: 1,
      windowStart: now,
      resetAt: now + WINDOW_MS
    };
  } else {
    rateLimitData.scanCount += 1;
  }

  await chrome.storage.local.set({ rateLimitData: rateLimitData });
}

// Save scan results
async function saveScan(scanData) {
  const scanId = 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const guestData = await chrome.storage.local.get([KEYS.GUEST_SESSION_ID]);
  const guestSessionId = guestData[KEYS.GUEST_SESSION_ID];
  const now = Date.now();
  const expiresAt = now + (60 * 60 * 1000); // 1 hour

  const scan = {
    id: scanId,
    guestSessionId: guestSessionId,
    url: scanData.url,
    scannedAt: now,
    expiresAt: expiresAt,
    totalVulnerabilities: scanData.vulnerabilities.length,
    riskScore: scanData.riskScore,
    counts: scanData.counts,
    isGuest: true,
    vulnerabilities: scanData.vulnerabilities
  };

  // Get existing scans and clean expired ones
  const data = await chrome.storage.local.get([KEYS.SCANS]);
  const scans = data[KEYS.SCANS] || [];
  const validScans = scans.filter(s => s.expiresAt > now);

  // Add new scan
  validScans.push(scan);

  // Save back to storage
  await chrome.storage.local.set({ [KEYS.SCANS]: validScans });

  return scan;
}

// Get current scan for a URL
async function getCurrentScan(url) {
  const data = await chrome.storage.local.get([KEYS.CURRENT_SCAN]);
  const currentScan = data[KEYS.CURRENT_SCAN];
  
  if (currentScan && currentScan.url === url && currentScan.expiresAt > Date.now()) {
    return currentScan;
  }
  
  return null;
}

// Clean expired scans periodically (every 10 minutes)
setInterval(async () => {
  console.log('[Security Scanner] Cleaning expired scans...');
  const data = await chrome.storage.local.get([KEYS.SCANS]);
  const scans = data[KEYS.SCANS] || [];
  const now = Date.now();
  const validScans = scans.filter(s => s.expiresAt > now);
  
  if (validScans.length !== scans.length) {
    await chrome.storage.local.set({ [KEYS.SCANS]: validScans });
    console.log('[Security Scanner] Cleaned', scans.length - validScans.length, 'expired scan(s)');
  }
}, 10 * 60 * 1000);
