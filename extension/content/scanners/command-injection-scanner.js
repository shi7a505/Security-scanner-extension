// Command Injection Scanner - Detects command injection patterns
const CommandInjectionScanner = {
  name: 'CommandInjectionScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.COMMAND_INJECTION;

    // Command injection error patterns
    const commandErrorPatterns = [
      /sh: .*?: command not found/i,
      /bash: .*?: command not found/i,
      /cannot execute binary file/i,
      /Permission denied.*?\/bin\//i,
      /system\(\) has been disabled/i,
      /exec\(\) has been disabled/i,
      /shell_exec\(\) has been disabled/i,
      /Warning.*?shell_exec/i,
      /Warning.*?system/i,
      /Warning.*?passthru/i,
      /Fatal error.*?proc_open/i
    ];

    // Check page content for command execution errors
    const pageText = document.body.innerText;
    commandErrorPatterns.forEach(pattern => {
      if (pattern.test(pageText)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Command Execution Error Detected',
          description: 'System command error message visible in page, indicating potential command injection vulnerability',
          location: 'Page content',
          evidence: pageText.match(pattern)?.[0] || 'Command error detected',
          recommendation: 'Suppress error messages. Never pass user input directly to system commands. Use allowlists for allowed commands.',
          severity: vulnType.severity
        });
      }
    });

    // Check for file upload fields (potential command injection vector)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'File Upload Functionality Detected',
        description: `Found ${fileInputs.length} file upload field(s) that may be vulnerable to command injection via filenames`,
        location: `${fileInputs.length} file input(s)`,
        evidence: 'File upload fields present',
        recommendation: 'Validate and sanitize uploaded filenames. Store files with generated names. Disable script execution in upload directories.',
        severity: vulnType.severity
      });
    }

    // Check for inputs that might execute commands (e.g., ping, traceroute tools)
    const commandInputs = document.querySelectorAll('input[name*="ping"], input[name*="trace"], input[name*="host"], input[name*="cmd"], input[name*="command"]');
    if (commandInputs.length > 0) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Potential Command Execution Input Fields',
        description: `Found ${commandInputs.length} input field(s) that may execute system commands`,
        location: 'Form inputs',
        evidence: `Fields: ${Array.from(commandInputs).map(i => i.name).join(', ')}`,
        recommendation: 'Use allowlists to restrict allowed inputs. Sanitize all user input. Consider using APIs instead of system commands.',
        severity: vulnType.severity
      });
    }

    // Check for path traversal patterns in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const pathParams = ['file', 'path', 'dir', 'folder', 'include', 'page', 'doc'];
    pathParams.forEach(param => {
      const value = urlParams.get(param);
      if (value && (value.includes('../') || value.includes('..\\') || value.includes('%2e%2e'))) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'Path Traversal Pattern in URL',
          description: `URL parameter "${param}" contains path traversal sequences that may lead to command injection`,
          location: `URL parameter: ${param}`,
          evidence: `${param}=${value}`,
          recommendation: 'Validate and sanitize file paths. Use allowlists for allowed files. Never pass user input directly to file operations.',
          severity: vulnType.severity
        });
      }
    });

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(CommandInjectionScanner);
}
