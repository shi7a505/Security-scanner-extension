// Trackers Scanner - Detects excessive third-party tracking scripts
const TrackersScanner = {
  name: 'TrackersScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.EXCESSIVE_TRACKERS;

    // Known tracking/analytics domains
    const trackerDomains = [
      'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
      'facebook.net', 'connect.facebook.net', 'facebook.com/tr',
      'analytics.twitter.com', 'static.ads-twitter.com',
      'linkedin.com/px', 'snap.licdn.com',
      'hotjar.com', 'static.hotjar.com',
      'mouseflow.com', 'cdn.mouseflow.com',
      'crazyegg.com', 'script.crazyegg.com',
      'mixpanel.com', 'cdn.mxpnl.com',
      'segment.com', 'cdn.segment.com',
      'amplitude.com', 'cdn.amplitude.com',
      'fullstory.com', 'cdn.fullstory.com',
      'quantserve.com', 'pixel.quantserve.com',
      'scorecardresearch.com', 'sb.scorecardresearch.com',
      'pinterest.com/ct', 'ct.pinterest.com',
      'adsrvr.org', 'match.adsrvr.org',
      'adnxs.com', 'ib.adnxs.com',
      'amazon-adsystem.com', 'aax.amazon-adsystem.com',
      'chartbeat.com', 'static.chartbeat.com',
      'inspectlet.com', 'cdn.inspectlet.com',
      'clarity.ms', 'www.clarity.ms',
      'mouseflow.com', 'o2.mouseflow.com'
    ];

    // Get all external scripts
    const scripts = document.querySelectorAll('script[src]');
    const trackers = [];
    const trackersByDomain = {};

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          const hostname = url.hostname;
          
          // Check if it's a known tracker
          const matchedTracker = trackerDomains.find(domain => hostname.includes(domain));
          if (matchedTracker) {
            trackers.push(src);
            trackersByDomain[matchedTracker] = (trackersByDomain[matchedTracker] || 0) + 1;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Check for tracking pixels (img, iframe)
    const trackingPixels = [];
    
    // Check images
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          const hostname = url.hostname;
          if (trackerDomains.some(domain => hostname.includes(domain))) {
            trackingPixels.push(src);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Check iframes
    document.querySelectorAll('iframe[src]').forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          const hostname = url.hostname;
          if (trackerDomains.some(domain => hostname.includes(domain))) {
            trackingPixels.push(src);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    const totalTrackers = trackers.length + trackingPixels.length;
    const uniqueDomains = Object.keys(trackersByDomain).length;

    // Report if excessive trackers found
    if (totalTrackers >= 5) {
      const domainList = Object.entries(trackersByDomain)
        .map(([domain, count]) => `${domain} (${count})`)
        .slice(0, 5)
        .join(', ');

      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Excessive Third-Party Trackers',
        description: `Found ${totalTrackers} tracking script(s)/pixel(s) from ${uniqueDomains} different tracking service(s)`,
        location: 'External scripts and pixels',
        evidence: domainList,
        recommendation: 'Minimize third-party trackers to protect user privacy. Consider using privacy-focused alternatives. Implement consent management.',
        severity: vulnType.severity
      });
    }

    // Check for specific privacy-invasive trackers
    const highRiskTrackers = [
      'doubleclick.net',
      'facebook.com/tr',
      'connect.facebook.net',
      'hotjar.com',
      'mouseflow.com',
      'fullstory.com',
      'inspectlet.com',
      'crazyegg.com'
    ];

    const foundHighRiskTrackers = highRiskTrackers.filter(domain => 
      trackers.some(src => src.includes(domain))
    );

    if (foundHighRiskTrackers.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Privacy-Invasive Tracking Services',
        description: `Found ${foundHighRiskTrackers.length} privacy-invasive tracking service(s) that may record user behavior`,
        location: 'External tracking scripts',
        evidence: foundHighRiskTrackers.join(', '),
        recommendation: 'Review necessity of session recording and behavioral tracking. Ensure GDPR/privacy compliance. Implement proper user consent.',
        severity: vulnType.severity
      });
    }

    // Check for fingerprinting scripts
    const scriptContent = Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
    const fingerprintingIndicators = [
      /navigator\.plugins/i,
      /screen\.width.*screen\.height/i,
      /canvas\.toDataURL/i,
      /getContext\(['"]2d['"]\)/i,
      /AudioContext|webkitAudioContext/i
    ];

    let hasFingerprintingIndicators = false;
    fingerprintingIndicators.forEach(pattern => {
      if (pattern.test(scriptContent)) {
        hasFingerprintingIndicators = true;
      }
    });

    if (hasFingerprintingIndicators) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Browser Fingerprinting Detected',
        description: 'Code detected that may be used for browser fingerprinting',
        location: 'JavaScript code',
        evidence: 'Fingerprinting techniques detected (canvas, audio, plugins)',
        recommendation: 'Disclose fingerprinting in privacy policy. Consider less invasive tracking methods. Obtain user consent.',
        severity: vulnType.severity
      });
    }

    // Check for cookie consent
    const pageText = document.body.innerText.toLowerCase();
    const hasCookieConsent = pageText.includes('cookie') && (
      pageText.includes('consent') || pageText.includes('accept') || pageText.includes('agree')
    );

    if (totalTrackers >= 3 && !hasCookieConsent) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'No Cookie Consent Banner with Trackers',
        description: 'Multiple tracking services detected but no cookie consent mechanism found',
        location: 'Page content',
        evidence: `${totalTrackers} trackers but no consent banner`,
        recommendation: 'Implement cookie consent banner compliant with GDPR/CCPA. Allow users to opt-out of tracking.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(TrackersScanner);
}
