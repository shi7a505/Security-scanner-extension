// Deprecated HTML Scanner - Detects deprecated HTML attributes and elements
const DeprecatedHTMLScanner = {
  name: 'DeprecatedHTMLScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.DEPRECATED_HTML;

    // Deprecated HTML elements
    const deprecatedElements = [
      { tag: 'applet', reason: 'Use object or embed instead' },
      { tag: 'basefont', reason: 'Use CSS for font styling' },
      { tag: 'center', reason: 'Use CSS text-align instead' },
      { tag: 'dir', reason: 'Use ul instead' },
      { tag: 'font', reason: 'Use CSS for text styling' },
      { tag: 'frame', reason: 'Use iframe or modern layouts' },
      { tag: 'frameset', reason: 'Use modern layouts instead' },
      { tag: 'isindex', reason: 'Use form elements instead' },
      { tag: 'marquee', reason: 'Use CSS animations instead' },
      { tag: 'menu', reason: 'Use ul or nav instead' },
      { tag: 'noframes', reason: 'Frames are deprecated' },
      { tag: 's', reason: 'Use del or CSS text-decoration' },
      { tag: 'strike', reason: 'Use del or CSS text-decoration' },
      { tag: 'tt', reason: 'Use code or CSS font-family' },
      { tag: 'u', reason: 'Use CSS text-decoration instead' },
      { tag: 'big', reason: 'Use CSS font-size instead' },
      { tag: 'blink', reason: 'Use CSS animations instead' }
    ];

    const foundDeprecated = [];

    deprecatedElements.forEach(({ tag, reason }) => {
      const elements = document.querySelectorAll(tag);
      if (elements.length > 0) {
        foundDeprecated.push({
          tag: tag,
          count: elements.length,
          reason: reason
        });
      }
    });

    if (foundDeprecated.length > 0) {
      foundDeprecated.forEach(({ tag, count, reason }) => {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `Deprecated <${tag}> Element Used`,
          description: `Found ${count} deprecated <${tag}> element(s). ${reason}`,
          location: `${count} <${tag}> element(s)`,
          evidence: `<${tag}> is deprecated in HTML5`,
          recommendation: reason,
          severity: vulnType.severity
        });
      });
    }

    // Deprecated attributes
    const deprecatedAttributes = [
      { attr: 'align', elements: '*', reason: 'Use CSS text-align or flexbox' },
      { attr: 'bgcolor', elements: '*', reason: 'Use CSS background-color' },
      { attr: 'border', elements: 'img, table', reason: 'Use CSS border' },
      { attr: 'height', elements: 'img, td, th', reason: 'Use CSS height (except img)' },
      { attr: 'width', elements: 'img, td, th, table', reason: 'Use CSS width (except img)' },
      { attr: 'name', elements: 'a', reason: 'Use id instead' },
      { attr: 'hspace', elements: 'img', reason: 'Use CSS margin' },
      { attr: 'vspace', elements: 'img', reason: 'Use CSS margin' }
    ];

    const foundDeprecatedAttrs = [];

    deprecatedAttributes.forEach(({ attr, elements, reason }) => {
      const selector = elements === '*' ? `[${attr}]` : `${elements}[${attr}]`;
      const elementsWithAttr = document.querySelectorAll(selector);
      
      if (elementsWithAttr.length > 0) {
        foundDeprecatedAttrs.push({
          attr: attr,
          count: elementsWithAttr.length,
          elements: elements,
          reason: reason
        });
      }
    });

    if (foundDeprecatedAttrs.length > 0) {
      foundDeprecatedAttrs.forEach(({ attr, count, elements, reason }) => {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: `Deprecated "${attr}" Attribute Used`,
          description: `Found ${count} element(s) using deprecated "${attr}" attribute on ${elements}`,
          location: `${count} element(s) with ${attr} attribute`,
          evidence: `${attr} attribute is deprecated in HTML5`,
          recommendation: reason,
          severity: vulnType.severity
        });
      });
    }

    // Check for inline styles (not deprecated but bad practice)
    const elementsWithInlineStyle = document.querySelectorAll('[style]');
    if (elementsWithInlineStyle.length > 10) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Excessive Inline Styles',
        description: `Found ${elementsWithInlineStyle.length} element(s) with inline style attributes`,
        location: `${elementsWithInlineStyle.length} elements`,
        evidence: 'Excessive use of inline styles',
        recommendation: 'Move styles to external CSS files for better maintainability and security (CSP compliance).',
        severity: vulnType.severity
      });
    }

    // Check for deprecated doctypes
    const doctype = document.doctype;
    if (doctype) {
      const doctypeString = `<!DOCTYPE ${doctype.name}${doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : ''}${doctype.systemId ? ' "' + doctype.systemId + '"' : ''}>`;
      
      // Check if it's not HTML5 doctype
      if (doctype.name.toLowerCase() !== 'html' || doctype.publicId || doctype.systemId) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Deprecated DOCTYPE',
          description: 'Page uses deprecated DOCTYPE instead of HTML5 DOCTYPE',
          location: 'Document type declaration',
          evidence: doctypeString.substring(0, 100),
          recommendation: 'Use HTML5 DOCTYPE: <!DOCTYPE html>',
          severity: vulnType.severity
        });
      }
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(DeprecatedHTMLScanner);
}
