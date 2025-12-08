# 🚀 Installation and Testing Guide

## Quick Start Installation

### Step 1: Get the Extension Files

**Option A: Clone from GitHub**
```bash
git clone https://github.com/shi7a505/Security-scanner-extension.git
cd Security-scanner-extension
```

**Option B: Download ZIP**
1. Go to the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Type `chrome://extensions/` in address bar and press Enter
   - OR: Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch (top-right corner)

3. **Load Unpacked Extension:**
   - Click "Load unpacked" button
   - Navigate to and select the `extension` folder
   - The extension should now appear in your list

4. **Verify Installation:**
   - Extension icon should appear in toolbar
   - Extension status should show "Enabled"
   - No errors in console

5. **Pin Extension (Optional):**
   - Click puzzle icon in Chrome toolbar
   - Find "Security Scanner Extension"
   - Click pin icon to keep it visible

## Testing the Extension

### Basic Functionality Test

1. **Open Test Page:**
   ```bash
   # Open the test page in Chrome
   file:///path/to/extension/test-page.html
   ```

2. **Wait for Scan:**
   - Extension automatically scans when page loads
   - Check browser console for scan logs

3. **View Results:**
   - Click extension icon in toolbar
   - Popup should show:
     - Vulnerability counts by severity
     - Risk score with progress bar
     - Guest mode information
     - Scans remaining counter

### Expected Test Results

On the test page, you should see:
- **Critical**: 1-2 (XSS indicators, API key patterns)
- **High**: 1 (Missing CSP)
- **Medium**: 0-1
- **Low**: 1-2 (Deprecated HTML)
- **Risk Score**: 30-50

### Testing Specific Features

#### 1. Rate Limiting Test

Test the 10 scans/hour limit:

```javascript
// Open browser console and run:
chrome.storage.local.get(['rateLimitData'], (data) => {
  console.log('Rate Limit Status:', data.rateLimitData);
});
```

Steps:
1. Scan 10 different pages/tabs
2. Try an 11th scan - should see rate limit message
3. Wait for reset countdown
4. Verify reset after 1 hour

#### 2. Storage Test

Check scan storage:

```javascript
// In browser console:
chrome.storage.local.get(['scans'], (data) => {
  console.log('Stored Scans:', data.scans);
  console.log('Number of scans:', data.scans?.length);
});
```

Verify:
- Scans are stored with unique IDs
- Scans expire after 1 hour
- Old scans are cleaned up

#### 3. Scanner Test

Test individual scanners:

```html
<!-- Create test pages for each scanner type -->
<!-- Example: XSS Test -->
<button onclick="alert('test')">Click</button>
<script>eval('console.log("test")')</script>

<!-- Example: Mixed Content Test (on HTTPS) -->
<script src="http://example.com/script.js"></script>
<img src="http://example.com/image.jpg">
```

### Debugging

#### Enable Verbose Logging

Open background service worker console:
1. Go to `chrome://extensions/`
2. Find "Security Scanner Extension"
3. Click "service worker" link
4. View console logs

#### Check Content Script Logs

Open page console (F12) to see:
- `[Security Scanner] Content script loaded`
- `[Security Scanner] Starting scan...`
- `[Security Scanner] Scan complete`
- Individual scanner results

#### Common Issues

**Issue: Extension doesn't load**
- Check manifest.json is valid
- Verify all files are present
- Check for JavaScript syntax errors
- Look for errors in chrome://extensions/

**Issue: No scan results**
- Check console for errors
- Verify content scripts injected
- Try refreshing the page
- Check if URL is scannable (not chrome://)

**Issue: Popup doesn't open**
- Check popup.html exists
- Verify popup.js has no errors
- Check browser console for errors

**Issue: Scanners not detecting**
- Verify scanner files loaded
- Check scanner registration
- Test with test-page.html

## Manual Testing Checklist

### Extension Loading
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] No console errors in extensions page

### Scanning Functionality
- [ ] Content script injects properly
- [ ] All 20 scanners register
- [ ] Scan completes successfully
- [ ] Results sent to background script

### Storage
- [ ] Guest session ID created
- [ ] Scans saved to storage
- [ ] Expiration time set correctly
- [ ] Old scans cleaned up

### Rate Limiting
- [ ] Initial limit is 10 scans
- [ ] Counter decrements properly
- [ ] Limit enforced at 10
- [ ] Reset time displayed
- [ ] Resets after 1 hour

### Popup UI
- [ ] Opens without errors
- [ ] Shows vulnerability counts
- [ ] Displays risk score correctly
- [ ] Progress bar updates
- [ ] Guest info displayed
- [ ] Buttons work
- [ ] Countdown timer updates

### Scanner Accuracy
Test each vulnerability type:
- [ ] XSS Indicators
- [ ] SQL Injection patterns
- [ ] Command Injection patterns
- [ ] API Key exposure
- [ ] Insecure forms
- [ ] Missing/Weak CSP
- [ ] Sensitive files
- [ ] Mixed content
- [ ] Missing HSTS
- [ ] Clickjacking
- [ ] Insecure cookies
- [ ] Missing SRI
- [ ] CORS issues
- [ ] Debug pages
- [ ] Open redirects
- [ ] CSRF vulnerabilities
- [ ] Deprecated HTML
- [ ] Excessive trackers

## Performance Testing

### Load Time Test
```javascript
// Measure scan time
console.time('scan');
// Trigger scan
// ...
console.timeEnd('scan');
```

**Expected**: < 2 seconds on average page

### Memory Test
1. Open Chrome Task Manager (Shift+Esc)
2. Find "Security Scanner Extension"
3. Monitor memory usage
4. Scan multiple pages
5. Check for memory leaks

**Expected**: < 50MB typical usage

## Test Websites

Recommended sites for testing (with permission):

### Development Sites
- localhost applications
- Test environments
- Staging servers

### Public Test Sites
- http://testphp.vulnweb.com/ (intentionally vulnerable)
- http://demo.testfire.net/ (test banking app)
- https://juice-shop.herokuapp.com/ (OWASP Juice Shop)

⚠️ **Important**: Only scan sites you own or have explicit permission to test.

## Automated Testing (Future)

For Phase 2, we'll add:
- Unit tests with Jest
- Integration tests
- E2E tests with Puppeteer
- CI/CD pipeline

## Troubleshooting

### Reset Extension State

To start fresh:
```javascript
// Clear all storage
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  location.reload();
});
```

### Reinstall Extension

1. Remove extension from chrome://extensions/
2. Close all Chrome windows
3. Reopen Chrome
4. Load extension again

### Check Permissions

Verify extension has required permissions:
```javascript
chrome.permissions.getAll((permissions) => {
  console.log('Permissions:', permissions);
});
```

## Support

If you encounter issues:

1. **Check Console Logs**: Browser console + Service worker console
2. **Review Documentation**: README.md and this guide
3. **Create GitHub Issue**: Include error logs and steps to reproduce
4. **Contact Team**: Via GitHub repository

## Next Steps

After successful testing:
1. ✅ Verify all features work
2. ✅ Document any bugs found
3. ✅ Test on multiple websites
4. ✅ Prepare for Phase 2 (Backend Integration)

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Phase 1 Complete
