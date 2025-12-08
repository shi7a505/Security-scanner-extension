// Content script - Main entry point for vulnerability scanning
(function() {
  'use strict';

  console.log('[Security Scanner] Content script loaded on', window.location.href);

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScanner);
  } else {
    initializeScanner();
  }

  async function initializeScanner() {
    try {
      console.log('[Security Scanner] Page ready, starting scan...');
      
      // Give the page a moment to fully render
      setTimeout(async () => {
        await performScan();
      }, 1000);

    } catch (error) {
      console.error('[Security Scanner] Error initializing:', error);
    }
  }

  async function performScan() {
    try {
      // Run all registered scanners
      const vulnerabilities = await window.ScannerCore.runAllScans();
      
      // Calculate risk score
      const riskScore = window.ScannerCore.calculateRiskScore(vulnerabilities);
      
      // Get counts by severity
      const counts = window.ScannerCore.getCountsBySeverity(vulnerabilities);

      console.log('[Security Scanner] Scan complete:', {
        total: vulnerabilities.length,
        riskScore: riskScore,
        counts: counts
      });

      // Send results to background script
      chrome.runtime.sendMessage({
        type: 'SCAN_COMPLETE',
        data: {
          url: window.location.href,
          vulnerabilities: vulnerabilities,
          riskScore: riskScore,
          counts: counts,
          timestamp: Date.now()
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Security Scanner] Error sending results:', chrome.runtime.lastError);
        } else {
          console.log('[Security Scanner] Results sent to background script:', response);
        }
      });

    } catch (error) {
      console.error('[Security Scanner] Error during scan:', error);
    }
  }

  // Listen for manual scan requests from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TRIGGER_SCAN') {
      console.log('[Security Scanner] Manual scan triggered');
      performScan().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('[Security Scanner] Manual scan error:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep message channel open for async response
    }
  });

})();
