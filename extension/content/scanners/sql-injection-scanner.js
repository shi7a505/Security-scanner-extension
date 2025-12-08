// SQL Injection Scanner - Detects SQL error patterns
const SQLInjectionScanner = {
  name: 'SQLInjectionScanner',
  
  async scan() {
    const vulnerabilities = [];
    const vulnType = window.VULNERABILITY_TYPES.SQL_INJECTION;

    // SQL error patterns to detect
    const sqlErrorPatterns = [
      /SQL syntax.*?MySQL/i,
      /Warning.*?mysqli/i,
      /MySQLSyntaxErrorException/i,
      /valid MySQL result/i,
      /PostgreSQL.*?ERROR/i,
      /Warning.*?pg_/i,
      /valid PostgreSQL result/i,
      /Npgsql\./i,
      /Driver.*?SQL Server/i,
      /OLE DB.*?SQL Server/i,
      /SQLServer JDBC Driver/i,
      /SqlException/i,
      /Oracle error/i,
      /Oracle.*?Driver/i,
      /Warning.*?oci_/i,
      /SQLite\/JDBCDriver/i,
      /SQLite.Exception/i,
      /System.Data.SQLite.SQLiteException/i,
      /Warning.*?sqlite_/i,
      /SQLSTATE\[/i,
      /syntax error.*?near/i,
      /Incorrect syntax near/i
    ];

    // Check page content for SQL errors
    const pageText = document.body.innerText;
    sqlErrorPatterns.forEach(pattern => {
      if (pattern.test(pageText)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'SQL Error Message Detected in Page',
          description: 'SQL database error message visible in page content, indicating potential SQL injection vulnerability',
          location: 'Page content',
          evidence: pageText.match(pattern)?.[0] || 'SQL error detected',
          recommendation: 'Suppress error messages in production. Use parameterized queries or prepared statements. Never concatenate user input into SQL queries.',
          severity: vulnType.severity
        });
      }
    });

    // Check console logs for SQL errors
    // Note: We can't directly access console logs from content script,
    // but we can check for common error display patterns

    // Check for SQL-related form field names (potential injection points)
    // Threshold of 5 is used to avoid false positives on pages with few inputs
    // while catching pages that extensively use database queries
    const suspiciousInputs = document.querySelectorAll('input[name*="sql"], input[name*="query"], input[name*="id"], input[name*="search"]');
    if (suspiciousInputs.length > 5) {
      vulnerabilities.push({
        typeId: vulnType.id,
        title: 'Multiple Database Query Input Fields',
        description: `Found ${suspiciousInputs.length} input fields that may be vulnerable to SQL injection`,
        location: 'Form inputs',
        evidence: `Fields: ${Array.from(suspiciousInputs).slice(0, 5).map(i => i.name).join(', ')}`,
        recommendation: 'Ensure all inputs are validated and sanitized. Use parameterized queries or ORM frameworks.',
        severity: vulnType.severity
      });
    }

    // Check HTML comments for SQL queries
    const comments = document.evaluate('//comment()', document, null, XPathResult.ANY_TYPE, null);
    let comment = comments.iterateNext();
    while (comment) {
      const commentText = comment.textContent;
      if (/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/i.test(commentText)) {
        vulnerabilities.push({
          typeId: vulnType.id,
          title: 'SQL Query in HTML Comment',
          description: 'Found SQL query in HTML comment, which may expose database structure',
          location: 'HTML comment',
          evidence: commentText.substring(0, 150),
          recommendation: 'Remove SQL queries and sensitive comments from production code.',
          severity: vulnType.severity
        });
        break; // Only report once
      }
      comment = comments.iterateNext();
    }

    return vulnerabilities;
  }
};

// Register scanner
if (window.ScannerCore) {
  ScannerCore.register(SQLInjectionScanner);
}
