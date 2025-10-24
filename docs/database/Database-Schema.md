# Database Schema - Security Scanner Extension

## Tables Overview

1. **users** - المستخدمين
2. **scans** - عمليات الفحص ◄ جديد
3. **vulnerabilities** - الثغرات (كانت reports)
4. **vulnerability_types** - أنواع الثغرات
5. **reports** - التقارير (PDF/JSON) ◄ جديد
6. **logs** - سجل الأحداث

---

##  Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

**التحسينات:**
- ✅ أضفنا `email` (مهم للـ Authentication)
- ✅ أضفنا `username` (للعرض)
- ✅ أضفنا `created_at`, `updated_at`
- ✅ أضفنا `is_active` (للتعطيل بدل الحذف)

---

##  Scans Table ◄ جدول جديد!

```sql
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    
    -- Vulnerability counts
    total_vulnerabilities INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_scans_target_url ON scans(target_url);
```

**ليه محتاجينه:**
- ✅ كل موقع يتفحص = scan واحد
- ✅ الـ scan يحتوي على vulnerabilities كتير
- ✅ نقدر نتتبع متى بدأ ومتى انتهى
- ✅ نعرف لقى كام ثغرة من كل نوع

---

##  Vulnerabilities Table (كانت Reports)

```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES vulnerability_types(id),
    
    -- Vulnerability details
    url TEXT NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    
    -- Technical details
    method VARCHAR(10),  -- GET, POST, PUT, DELETE
    parameter VARCHAR(255),  -- اسم الـ parameter المصاب
    evidence JSONB,  -- الدليل: payload, response, screenshot_url
    
    -- Status
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'fixed', 'false_positive', 'accepted_risk')),
    
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX idx_vulnerabilities_type_id ON vulnerabilities(type_id);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX idx_vulnerabilities_created_at ON vulnerabilities(created_at DESC);
```

**التحسينات:**
- ✅ أضفنا `scan_id` (الأهم!)
- ✅ أضفنا `severity` (critical/high/medium/low)
- ✅ أضفنا `method` و `parameter`
- ✅ أضفنا `evidence` (JSON للأدلة)
- ✅ حسّنا الـ `status` options

---

##  Vulnerability Types Table

```sql
CREATE TABLE vulnerability_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    severity_default VARCHAR(50) CHECK (severity_default IN ('critical', 'high', 'medium', 'low', 'info')),
    category VARCHAR(100) NOT NULL,
    owasp_category VARCHAR(50),
    cwe_id INTEGER,
    remediation_hint TEXT,
    detection_difficulty VARCHAR(50) CHECK (detection_difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all 19 vulnerability types
INSERT INTO vulnerability_types (
    type_name, 
    display_name, 
    description, 
    severity_default, 
    category, 
    owasp_category, 
    cwe_id, 
    remediation_hint, 
    detection_difficulty,
    priority
) VALUES

-- ========================================
-- CONFIGURATION ISSUES (Easy Detection)
-- ========================================

('mixed_content', 
 'Mixed Content (HTTP on HTTPS)', 
 'HTTPS page loading HTTP resources (images, scripts, stylesheets) which breaks confidentiality and allows tampering.',
 'medium',
 'configuration',
 'A05:2021',
 311,
 'Ensure all resources are loaded over HTTPS. Update resource URLs from http:// to https:// or use protocol-relative URLs (//).',
 'easy',
 1),

('missing_hsts', 
 'Missing HSTS Header', 
 'Strict-Transport-Security header not set, allowing potential downgrade attacks.',
 'medium',
 'configuration',
 'A05:2021',
 523,
 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
 'easy',
 2),

('missing_csp', 
 'Missing Content Security Policy', 
 'Content-Security-Policy header absent, increasing XSS risk.',
 'high',
 'configuration',
 'A05:2021',
 693,
 'Implement a strict CSP header to prevent XSS attacks. Example: Content-Security-Policy: default-src ''self''; script-src ''self'' ''unsafe-inline''',
 'easy',
 1),

('weak_csp', 
 'Weak Content Security Policy', 
 'CSP allows unsafe-inline, unsafe-eval, or wildcard (*) sources.',
 'high',
 'configuration',
 'A05:2021',
 693,
 'Remove unsafe-inline and unsafe-eval. Use nonces or hashes for inline scripts. Avoid wildcard sources.',
 'easy',
 1),

('missing_xfo', 
 'Missing X-Frame-Options / Clickjacking', 
 'X-Frame-Options header not set, page can be embedded in iframes (clickjacking risk).',
 'medium',
 'configuration',
 'A05:2021',
 1021,
 'Add header: X-Frame-Options: DENY or SAMEORIGIN. Or use CSP frame-ancestors directive.',
 'easy',
 2),

('insecure_cookies', 
 'Insecure Cookie Attributes', 
 'Cookies set without Secure, HttpOnly, or SameSite attributes.',
 'medium',
 'configuration',
 'A05:2021',
 614,
 'Set cookies with Secure, HttpOnly, and SameSite=Strict/Lax flags.',
 'easy',
 2),

('missing_sri', 
 'Missing Subresource Integrity (SRI)', 
 'Third-party scripts loaded without integrity attribute.',
 'medium',
 'configuration',
 'A08:2021',
 829,
 'Add integrity attribute to external scripts: <script src="..." integrity="sha384-..." crossorigin="anonymous">',
 'easy',
 3),

('deprecated_attrs', 
 'Deprecated HTML Attributes', 
 'Insecure autocomplete usage on password fields or deprecated attributes.',
 'low',
 'configuration',
 'A05:2021',
 0,
 'Remove autocomplete="off" on password fields. Use autocomplete="current-password" or "new-password".',
 'easy',
 4),

-- ========================================
-- INFORMATION DISCLOSURE (Medium)
-- ========================================

('cors_misconfiguration', 
 'CORS Misconfiguration', 
 'Access-Control-Allow-Origin: * on sensitive responses.',
 'medium',
 'disclosure',
 'A05:2021',
 942,
 'Restrict CORS to specific origins. Avoid wildcard (*) for sensitive endpoints.',
 'medium',
 2),

('exposed_files', 
 'Exposed Sensitive Files', 
 'Visible paths to .git/, .env, /backup, or other sensitive files.',
 'high',
 'disclosure',
 'A01:2021',
 538,
 'Remove or restrict access to .git, .env, backup files. Use .htaccess or server config to block access.',
 'medium',
 1),

('debug_exposure', 
 'Exposed Debug/Admin Pages', 
 'Admin, debug, or development pages visible in production (e.g., /phpmyadmin, /wp-admin).',
 'medium',
 'disclosure',
 'A05:2021',
 215,
 'Remove or restrict access to debug pages. Use authentication. Remove X-Powered-By headers.',
 'medium',
 2),

('api_key_exposure', 
 'Exposed API Keys in Client Code', 
 'API keys, secrets, or tokens found in client-side JavaScript.',
 'critical',
 'disclosure',
 'A01:2021',
 798,
 'Move API keys to server-side. Never expose secrets in client code. Rotate exposed keys immediately.',
 'medium',
 1),

('excessive_trackers', 
 'Excessive Third-Party Trackers', 
 'Large number of third-party tracking scripts (privacy concern).',
 'low',
 'disclosure',
 'A09:2021',
 0,
 'Review and minimize third-party trackers. Implement privacy-friendly alternatives.',
 'medium',
 4),

-- ========================================
-- ACTIVE VULNERABILITIES (Hard - Careful!)
-- ========================================

('xss', 
 'Cross-Site Scripting (XSS)', 
 'User input reflected in page without sanitization (possible reflected XSS).',
 'critical',
 'injection',
 'A03:2021',
 79,
 'Sanitize all user input. Use Content-Security-Policy. Encode output. Use templating engines with auto-escaping.',
 'hard',
 1),

('sql_injection', 
 'SQL Injection', 
 'SQL error patterns or suspicious behavior detected in responses.',
 'critical',
 'injection',
 'A03:2021',
 89,
 'Use parameterized queries/prepared statements. Never concatenate user input into SQL. Use ORM properly.',
 'hard',
 1),

('command_injection', 
 'Command Injection', 
 'System command error patterns detected (e.g., "Permission denied", "No such file").',
 'critical',
 'injection',
 'A03:2021',
 78,
 'Never pass user input to system commands. Use safe APIs. Validate and sanitize input strictly.',
 'hard',
 1),

('open_redirect', 
 'Open Redirect', 
 'Unvalidated redirect parameters (e.g., ?redirect=, ?next=) pointing to external domains.',
 'medium',
 'redirect',
 'A01:2021',
 601,
 'Validate redirect URLs against whitelist. Use relative URLs only. Warn users before external redirects.',
 'hard',
 2),

('csrf', 
 'Cross-Site Request Forgery (CSRF)', 
 'State-changing forms (POST/PUT/DELETE) missing CSRF tokens.',
 'medium',
 'csrf',
 'A01:2021',
 352,
 'Implement CSRF tokens for all state-changing requests. Use SameSite cookie attribute.',
 'hard',
 2),

('insecure_form', 
 'Insecure Form Endpoint', 
 'Password form submitting over HTTP or to untrusted origin.',
 'critical',
 'transport',
 'A02:2021',
 319,
 'Always use HTTPS for forms containing sensitive data. Ensure form action uses https://',
 'hard',
 1);

-- Index for fast lookups
CREATE INDEX idx_vulnerability_types_name ON vulnerability_types(type_name);
CREATE INDEX idx_vulnerability_types_category ON vulnerability_types(category);
CREATE INDEX idx_vulnerability_types_severity ON vulnerability_types(severity_default);
```

---
##  Reports Table ◄ جدول جديد!

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    report_type VARCHAR(50) DEFAULT 'pdf' CHECK (report_type IN ('pdf', 'json', 'csv', 'html')),
    file_url TEXT,
    file_size INTEGER,  -- in bytes
    
    status VARCHAR(50) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP  -- للتقارير المؤقتة
);

-- Indexes
CREATE INDEX idx_reports_scan_id ON reports(scan_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
```

**ليه محتاجينه:**
- ✅ المستخدم يطلب تقرير PDF/JSON
- ✅ نخزن رابط الملف
- ✅ نتتبع حالة التوليد

---

##  Logs Table

```sql
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,  -- معلومات إضافية
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
```

**التحسينات:**
- ✅ أضفنا `details` (JSON)
- ✅ أضفنا `ip_address` و `user_agent`

---

##  Relationships Summary

```
users (1) ──→ (M) scans
scans (1) ──→ (M) vulnerabilities
scans (1) ──→ (M) reports
vulnerabilities (M) ──→ (1) vulnerability_types
users (1) ──→ (M) logs
users (1) ──→ (M) reports
```

---

##  Data Flow Example

```sql
-- 1. User creates account
INSERT INTO users (email, username, name, password_hash) 
VALUES ('ahmed@example.com', 'ahmed', 'Ahmed Mohamed', 'hashed_password');

-- 2. Extension starts a scan
INSERT INTO scans (user_id, target_url, status, started_at) 
VALUES ('user-uuid', 'https://facebook.com', 'in_progress', NOW());

-- 3. Extension finds vulnerabilities
INSERT INTO vulnerabilities (scan_id, type_id, url, severity, description, method, parameter) 
VALUES ('scan-uuid', 'xss-type-uuid', 'https://facebook.com/search?q=test', 'high', 
        'Reflected XSS in search parameter', 'GET', 'q');

-- 4. Scan completes
UPDATE scans 
SET status = 'completed', 
    completed_at = NOW(), 
    total_vulnerabilities = 15,
    critical_count = 2,
    high_count = 5
WHERE id = 'scan-uuid';

-- 5. User requests report
INSERT INTO reports (scan_id, user_id, report_type, status) 
VALUES ('scan-uuid', 'user-uuid', 'pdf', 'generating');
```

---

##  Summary of Changes

### جداول جديدة:
1.  **scans** - لتتبع عمليات الفحص
2.  **reports** - للتقارير الحقيقية

### تحسينات:
1.  **users** - أضفنا email, username, timestamps
2.  **vulnerabilities** - أضفنا scan_id, severity, method, parameter, evidence
3.  **logs** - أضفنا details, ip_address, user_agent

### غيّرنا الأسماء:
-  `Reports` → ✅ `Vulnerabilities`
