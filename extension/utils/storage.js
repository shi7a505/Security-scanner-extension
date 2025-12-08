// Storage utility for managing scan data in chrome.storage.local
const StorageManager = {
  // Keys used in storage
  KEYS: {
    GUEST_SESSION_ID: 'guestSessionId',
    SCANS: 'scans',
    RATE_LIMIT_DATA: 'rateLimitData'
  },

  /**
   * Initialize storage with guest session ID if not exists
   */
  async initialize() {
    const data = await chrome.storage.local.get([this.KEYS.GUEST_SESSION_ID]);
    if (!data[this.KEYS.GUEST_SESSION_ID]) {
      const guestSessionId = this.generateGuestSessionId();
      await chrome.storage.local.set({ [this.KEYS.GUEST_SESSION_ID]: guestSessionId });
    }
  },

  /**
   * Generate a unique guest session ID
   */
  generateGuestSessionId() {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Generate a unique scan ID
   */
  generateScanId() {
    return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Get guest session ID
   */
  async getGuestSessionId() {
    const data = await chrome.storage.local.get([this.KEYS.GUEST_SESSION_ID]);
    return data[this.KEYS.GUEST_SESSION_ID];
  },

  /**
   * Save a scan result
   * @param {string} url - The scanned URL
   * @param {Array} vulnerabilities - Array of detected vulnerabilities
   * @param {number} riskScore - Risk score (0-100)
   */
  async saveScan(url, vulnerabilities, riskScore) {
    const scanId = this.generateScanId();
    const guestSessionId = await this.getGuestSessionId();
    const now = Date.now();
    const expiresAt = now + (60 * 60 * 1000); // 1 hour from now

    const scan = {
      id: scanId,
      guestSessionId: guestSessionId,
      url: url,
      scannedAt: now,
      expiresAt: expiresAt,
      totalVulnerabilities: vulnerabilities.length,
      riskScore: riskScore,
      isGuest: true,
      vulnerabilities: vulnerabilities
    };

    // Get existing scans
    const data = await chrome.storage.local.get([this.KEYS.SCANS]);
    const scans = data[this.KEYS.SCANS] || [];

    // Clean expired scans before adding new one
    const validScans = scans.filter(s => s.expiresAt > now);

    // Add new scan
    validScans.push(scan);

    // Save back to storage
    await chrome.storage.local.set({ [this.KEYS.SCANS]: validScans });

    return scan;
  },

  /**
   * Get all valid (non-expired) scans
   */
  async getValidScans() {
    const data = await chrome.storage.local.get([this.KEYS.SCANS]);
    const scans = data[this.KEYS.SCANS] || [];
    const now = Date.now();
    
    // Filter out expired scans
    const validScans = scans.filter(s => s.expiresAt > now);
    
    // Update storage if any scans were filtered out
    if (validScans.length !== scans.length) {
      await chrome.storage.local.set({ [this.KEYS.SCANS]: validScans });
    }
    
    return validScans;
  },

  /**
   * Get a specific scan by ID
   */
  async getScan(scanId) {
    const scans = await this.getValidScans();
    return scans.find(s => s.id === scanId);
  },

  /**
   * Get scan for a specific URL (most recent)
   */
  async getScanByUrl(url) {
    const scans = await this.getValidScans();
    const urlScans = scans.filter(s => s.url === url);
    
    if (urlScans.length === 0) return null;
    
    // Return most recent scan
    return urlScans.sort((a, b) => b.scannedAt - a.scannedAt)[0];
  },

  /**
   * Clean expired scans
   */
  async cleanExpiredScans() {
    await this.getValidScans(); // This automatically cleans expired scans
  },

  /**
   * Clear all scans (for testing/debugging)
   */
  async clearAllScans() {
    await chrome.storage.local.set({ [this.KEYS.SCANS]: [] });
  },

  /**
   * Get storage statistics
   */
  async getStats() {
    const scans = await this.getValidScans();
    return {
      totalScans: scans.length,
      totalVulnerabilities: scans.reduce((sum, s) => sum + s.totalVulnerabilities, 0),
      averageRiskScore: scans.length > 0 
        ? Math.round(scans.reduce((sum, s) => sum + s.riskScore, 0) / scans.length)
        : 0
    };
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
