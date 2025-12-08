// Scanner Core - Orchestrates all vulnerability scanners
const ScannerCore = {
  scanners: [],
  vulnerabilities: [],

  /**
   * Register a scanner
   * @param {Object} scanner - Scanner object with scan() method
   */
  register(scanner) {
    this.scanners.push(scanner);
  },

  /**
   * Run all registered scanners
   * @returns {Promise<Array>} Array of detected vulnerabilities
   */
  async runAllScans() {
    this.vulnerabilities = [];
    
    console.log('[Security Scanner] Starting scan on', window.location.href);
    console.log('[Security Scanner] Registered scanners:', this.scanners.length);

    for (const scanner of this.scanners) {
      try {
        const results = await scanner.scan();
        if (results && results.length > 0) {
          this.vulnerabilities.push(...results);
          console.log(`[Security Scanner] ${scanner.name}: Found ${results.length} issue(s)`);
        }
      } catch (error) {
        console.error(`[Security Scanner] Error in ${scanner.name}:`, error);
      }
    }

    console.log('[Security Scanner] Total vulnerabilities found:', this.vulnerabilities.length);
    return this.vulnerabilities;
  },

  /**
   * Calculate risk score based on vulnerabilities
   * @param {Array} vulnerabilities - Array of vulnerabilities
   * @returns {number} Risk score (0-100)
   */
  calculateRiskScore(vulnerabilities) {
    if (vulnerabilities.length === 0) return 0;

    const severityWeights = {
      'Critical': 25,
      'High': 15,
      'Medium': 8,
      'Low': 3
    };

    let totalScore = 0;
    vulnerabilities.forEach(vuln => {
      totalScore += severityWeights[vuln.severity] || 0;
    });

    // Cap at 100
    return Math.min(100, totalScore);
  },

  /**
   * Group vulnerabilities by severity
   * @param {Array} vulnerabilities - Array of vulnerabilities
   * @returns {Object} Grouped vulnerabilities
   */
  groupBySeverity(vulnerabilities) {
    const grouped = {
      Critical: [],
      High: [],
      Medium: [],
      Low: []
    };

    vulnerabilities.forEach(vuln => {
      if (grouped[vuln.severity]) {
        grouped[vuln.severity].push(vuln);
      }
    });

    return grouped;
  },

  /**
   * Get vulnerability counts by severity
   * @param {Array} vulnerabilities - Array of vulnerabilities
   * @returns {Object} Counts by severity
   */
  getCountsBySeverity(vulnerabilities) {
    const grouped = this.groupBySeverity(vulnerabilities);
    return {
      critical: grouped.Critical.length,
      high: grouped.High.length,
      medium: grouped.Medium.length,
      low: grouped.Low.length,
      total: vulnerabilities.length
    };
  },

  /**
   * Reset scanner state
   */
  reset() {
    this.vulnerabilities = [];
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ScannerCore = ScannerCore;
}
