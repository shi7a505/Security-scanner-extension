// Rate limiter for guest scans (10 scans per hour)
const RateLimiter = {
  LIMIT: 10, // Maximum scans per window
  WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds

  /**
   * Check if a new scan is allowed
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
   */
  async canScan() {
    const data = await chrome.storage.local.get(['rateLimitData']);
    const now = Date.now();
    
    let rateLimitData = data.rateLimitData;

    // Initialize if not exists or if window has expired
    if (!rateLimitData || now >= rateLimitData.resetAt) {
      rateLimitData = {
        scanCount: 0,
        windowStart: now,
        resetAt: now + this.WINDOW_MS
      };
    }

    const allowed = rateLimitData.scanCount < this.LIMIT;
    const remaining = Math.max(0, this.LIMIT - rateLimitData.scanCount);

    return {
      allowed: allowed,
      remaining: remaining,
      resetAt: rateLimitData.resetAt,
      scanCount: rateLimitData.scanCount
    };
  },

  /**
   * Record a scan (increment counter)
   */
  async recordScan() {
    const data = await chrome.storage.local.get(['rateLimitData']);
    const now = Date.now();
    
    let rateLimitData = data.rateLimitData;

    // Initialize if not exists or if window has expired
    if (!rateLimitData || now >= rateLimitData.resetAt) {
      rateLimitData = {
        scanCount: 1,
        windowStart: now,
        resetAt: now + this.WINDOW_MS
      };
    } else {
      rateLimitData.scanCount += 1;
    }

    await chrome.storage.local.set({ rateLimitData: rateLimitData });

    return {
      scanCount: rateLimitData.scanCount,
      remaining: Math.max(0, this.LIMIT - rateLimitData.scanCount),
      resetAt: rateLimitData.resetAt
    };
  },

  /**
   * Get current rate limit status
   */
  async getStatus() {
    return await this.canScan();
  },

  /**
   * Format time remaining until reset
   * @param {number} resetAt - Timestamp when the limit resets
   * @returns {string} Formatted time string
   */
  formatTimeRemaining(resetAt) {
    const now = Date.now();
    const msRemaining = Math.max(0, resetAt - now);
    const minutes = Math.floor(msRemaining / 60000);
    const seconds = Math.floor((msRemaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} sec${seconds !== 1 ? 's' : ''}`;
    }
  },

  /**
   * Reset rate limit (for testing/debugging)
   */
  async reset() {
    await chrome.storage.local.remove(['rateLimitData']);
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.RateLimiter = RateLimiter;
}
