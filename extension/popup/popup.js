// Popup script for Security Scanner Extension
(function() {
  'use strict';

  // DOM elements
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const rateLimitEl = document.getElementById('rate-limit');
  const resultsEl = document.getElementById('results');
  const noVulnEl = document.getElementById('no-vulnerabilities');

  // Initialize popup
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Popup] Initializing...');
    loadScanResults();

    // Event listeners
    document.getElementById('retry-btn')?.addEventListener('click', retryScan);
    document.getElementById('login-btn')?.addEventListener('click', openLoginPage);
    document.getElementById('login-btn-no-vuln')?.addEventListener('click', openLoginPage);
    document.getElementById('login-from-limit-btn')?.addEventListener('click', openLoginPage);
    document.getElementById('view-details-btn')?.addEventListener('click', showDetails);
  });

  // Load scan results
  async function loadScanResults() {
    try {
      showState('loading');

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        showError('Unable to access current tab');
        return;
      }

      // Check if it's a valid URL
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        showError('Cannot scan Chrome internal pages');
        return;
      }

      // Check rate limit
      const rateLimitResponse = await chrome.runtime.sendMessage({ type: 'CHECK_RATE_LIMIT' });
      if (!rateLimitResponse.success) {
        showError('Failed to check rate limit');
        return;
      }

      const rateLimitStatus = rateLimitResponse.status;
      
      // Get current scan for this URL
      const scanResponse = await chrome.runtime.sendMessage({ 
        type: 'GET_CURRENT_SCAN',
        url: tab.url
      });

      if (scanResponse.success && scanResponse.scan) {
        // Display existing scan
        displayResults(scanResponse.scan, rateLimitStatus);
      } else if (!rateLimitStatus.allowed) {
        // Show rate limit message
        showRateLimit(rateLimitStatus);
      } else {
        // No scan available, show loading
        showError('No scan results available. Please refresh the page to trigger a scan.');
      }

    } catch (error) {
      console.error('[Popup] Error loading results:', error);
      showError('Error loading scan results: ' + error.message);
    }
  }

  // Display scan results
  function displayResults(scan, rateLimitStatus) {
    console.log('[Popup] Displaying results:', scan);

    if (scan.totalVulnerabilities === 0) {
      showNoVulnerabilities(rateLimitStatus);
      return;
    }

    showState('results');

    // Update site info
    const url = new URL(scan.url);
    document.getElementById('site-url').textContent = url.hostname;
    document.getElementById('scan-time').textContent = formatScanTime(scan.scannedAt);

    // Update vulnerability counts
    document.getElementById('critical-count').textContent = scan.counts.critical;
    document.getElementById('high-count').textContent = scan.counts.high;
    document.getElementById('medium-count').textContent = scan.counts.medium;
    document.getElementById('low-count').textContent = scan.counts.low;

    // Update risk score
    const riskScore = scan.riskScore;
    document.getElementById('risk-score').textContent = riskScore;
    document.getElementById('risk-progress').style.width = riskScore + '%';
    document.getElementById('risk-description').textContent = getRiskDescription(riskScore);

    // Update expiry info
    const timeRemaining = scan.expiresAt - Date.now();
    const minutesRemaining = Math.max(0, Math.floor(timeRemaining / 60000));
    document.getElementById('expiry-text').textContent = `Results saved for ${minutesRemaining} min`;

    // Update scans remaining
    document.getElementById('scans-remaining-text').textContent = 
      `${rateLimitStatus.remaining} scan${rateLimitStatus.remaining !== 1 ? 's' : ''} remaining this hour`;

    // Store scan for details view
    window.currentScan = scan;
  }

  // Show no vulnerabilities state
  function showNoVulnerabilities(rateLimitStatus) {
    showState('no-vulnerabilities');
    document.getElementById('scans-remaining-text-no-vuln').textContent = 
      `${rateLimitStatus.remaining} scan${rateLimitStatus.remaining !== 1 ? 's' : ''} remaining this hour`;
  }

  // Show rate limit state
  function showRateLimit(rateLimitStatus) {
    showState('rate-limit');
    
    // Start countdown
    updateRateLimitCountdown(rateLimitStatus.resetAt);
    setInterval(() => updateRateLimitCountdown(rateLimitStatus.resetAt), 1000);
  }

  // Update rate limit countdown
  function updateRateLimitCountdown(resetAt) {
    const now = Date.now();
    const remaining = Math.max(0, resetAt - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    document.getElementById('reset-countdown').textContent = 
      `${minutes}m ${seconds}s`;
  }

  // Format scan time
  function formatScanTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'Scanned just now';
    } else if (minutes < 60) {
      return `Scanned ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return `Scanned ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
  }

  // Get risk description
  function getRiskDescription(score) {
    if (score === 0) {
      return 'No vulnerabilities detected';
    } else if (score < 25) {
      return 'Low risk - Minor issues detected';
    } else if (score < 50) {
      return 'Medium risk - Several issues found';
    } else if (score < 75) {
      return 'High risk - Significant vulnerabilities';
    } else {
      return 'Critical risk - Severe vulnerabilities detected';
    }
  }

  // Show specific state
  function showState(state) {
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    rateLimitEl.classList.add('hidden');
    resultsEl.classList.add('hidden');
    noVulnEl.classList.add('hidden');

    switch (state) {
      case 'loading':
        loadingEl.classList.remove('hidden');
        break;
      case 'error':
        errorEl.classList.remove('hidden');
        break;
      case 'rate-limit':
        rateLimitEl.classList.remove('hidden');
        break;
      case 'results':
        resultsEl.classList.remove('hidden');
        break;
      case 'no-vulnerabilities':
        noVulnEl.classList.remove('hidden');
        break;
    }
  }

  // Show error
  function showError(message) {
    showState('error');
    document.getElementById('error-message').textContent = message;
  }

  // Retry scan
  function retryScan() {
    loadScanResults();
  }

  // Open login page
  function openLoginPage() {
    // TODO: Replace with actual website URL when available
    // For now, opens a placeholder that explains the feature
    const loginUrl = 'https://github.com/shi7a505/Security-scanner-extension';
    chrome.tabs.create({ url: loginUrl });
  }

  // Show details (simplified for now)
  function showDetails() {
    if (!window.currentScan) {
      alert('No scan data available');
      return;
    }

    const scan = window.currentScan;
    let detailsHtml = `Scan Results for ${scan.url}\n\n`;
    detailsHtml += `Total Vulnerabilities: ${scan.totalVulnerabilities}\n`;
    detailsHtml += `Risk Score: ${scan.riskScore}/100\n\n`;
    detailsHtml += `Critical: ${scan.counts.critical}\n`;
    detailsHtml += `High: ${scan.counts.high}\n`;
    detailsHtml += `Medium: ${scan.counts.medium}\n`;
    detailsHtml += `Low: ${scan.counts.low}\n\n`;
    
    detailsHtml += 'Vulnerabilities:\n\n';
    scan.vulnerabilities.forEach((vuln, index) => {
      detailsHtml += `${index + 1}. [${vuln.severity}] ${vuln.title}\n`;
      detailsHtml += `   ${vuln.description}\n`;
      detailsHtml += `   Location: ${vuln.location}\n`;
      detailsHtml += `   Recommendation: ${vuln.recommendation}\n\n`;
    });

    // For now, show in alert (in production, this would open a detailed page)
    alert(detailsHtml);
  }

})();
