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
    type_name VARCHAR(100) UNIQUE NOT NULL,  -- xss, sql_injection, csrf, etc.
    display_name VARCHAR(255) NOT NULL,  -- "Cross-Site Scripting (XSS)"
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_vulnerability_types_type_name ON vulnerability_types(type_name);
CREATE INDEX idx_vulnerability_types_enabled ON vulnerability_types(enabled);

-- Insert default types
INSERT INTO vulnerability_types (type_name, display_name, priority) VALUES
    ('xss', 'Cross-Site Scripting (XSS)', 1),
    ('sql_injection', 'SQL Injection', 1),
    ('csrf', 'Cross-Site Request Forgery (CSRF)', 2),
    ('insecure_headers', 'Insecure HTTP Headers', 3),
    ('mixed_content', 'Mixed Content (HTTP/HTTPS)', 3),
    ('outdated_libraries', 'Outdated JavaScript Libraries', 4),
    ('ssl_tls_issues', 'SSL/TLS Configuration Issues', 2),
    ('open_redirect', 'Open Redirect', 3),
    ('information_disclosure', 'Information Disclosure', 4),
    ('weak_authentication', 'Weak Authentication', 2);
```


- ✅ أضفنا `created_at`

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
