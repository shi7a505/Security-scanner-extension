// Mixed Content Scanner - Detects HTTP resources on HTTPS pages
const MixedContentScanner = {
  name: 'MixedContentScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.MIXED_CONTENT;

    // Only check if current page is HTTPS
    if (window.location.protocol !== 'https:') {
      return vulnerabilities;
    }

    // Check for HTTP resources
    const httpResources = {
      scripts: [],
      stylesheets: [],
      images: [],
      iframes: [],
      videos: [],
      audios: [],
      other: []
    };

    // Check scripts
    document.querySelectorAll('script[src]').forEach(script => {
      if (script.src.startsWith('http://')) {
        httpResources.scripts.push(script.src);
      }
    });

    // Check stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href.startsWith('http://')) {
        httpResources.stylesheets.push(link.href);
      }
    });

    // Check images
    document.querySelectorAll('img[src]').forEach(img => {
      if (img.src.startsWith('http://')) {
        httpResources.images.push(img.src);
      }
    });

    // Check iframes
    document.querySelectorAll('iframe[src]').forEach(iframe => {
      if (iframe.src.startsWith('http://')) {
        httpResources.iframes.push(iframe.src);
      }
    });

    // Check videos
    document.querySelectorAll('video[src], source[src]').forEach(video => {
      const src = video.src;
      if (src && src.startsWith('http://')) {
        httpResources.videos.push(src);
      }
    });

    // Check audio
    document.querySelectorAll('audio[src]').forEach(audio => {
      if (audio.src.startsWith('http://')) {
        httpResources.audios.push(audio.src);
      }
    });

    // Report findings
    if (httpResources.scripts.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Mixed Content: HTTP Scripts on HTTPS Page',
        description: `Found ${httpResources.scripts.length} script(s) loaded over HTTP, which can be intercepted and modified by attackers`,
        location: 'Script tags',
        evidence: httpResources.scripts.slice(0, 3).join(', '),
        recommendation: 'Change all script URLs to HTTPS. This is CRITICAL as scripts can be modified to inject malicious code.',
        severity: vulnType.severity
      });
    }

    if (httpResources.stylesheets.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Mixed Content: HTTP Stylesheets on HTTPS Page',
        description: `Found ${httpResources.stylesheets.length} stylesheet(s) loaded over HTTP`,
        location: 'Link tags',
        evidence: httpResources.stylesheets.slice(0, 3).join(', '),
        recommendation: 'Change all stylesheet URLs to HTTPS. HTTP stylesheets can be modified to steal data or inject content.',
        severity: vulnType.severity
      });
    }

    if (httpResources.images.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Mixed Content: HTTP Images on HTTPS Page',
        description: `Found ${httpResources.images.length} image(s) loaded over HTTP`,
        location: 'Image tags',
        evidence: `${httpResources.images.length} HTTP images`,
        recommendation: 'Change all image URLs to HTTPS or use protocol-relative URLs (//). HTTP images can leak information.',
        severity: vulnType.severity
      });
    }

    if (httpResources.iframes.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Mixed Content: HTTP Iframes on HTTPS Page',
        description: `Found ${httpResources.iframes.length} iframe(s) loaded over HTTP`,
        location: 'Iframe tags',
        evidence: httpResources.iframes.slice(0, 3).join(', '),
        recommendation: 'Change all iframe URLs to HTTPS. HTTP iframes can compromise page security.',
        severity: vulnType.severity
      });
    }

    if (httpResources.videos.length > 0 || httpResources.audios.length > 0) {
      const count = httpResources.videos.length + httpResources.audios.length;
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Mixed Content: HTTP Media on HTTPS Page',
        description: `Found ${count} audio/video resource(s) loaded over HTTP`,
        location: 'Media tags',
        evidence: `${httpResources.videos.length} videos, ${httpResources.audios.length} audio files`,
        recommendation: 'Change all media URLs to HTTPS to prevent content interception.',
        severity: vulnType.severity
      });
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(MixedContentScanner);
}
