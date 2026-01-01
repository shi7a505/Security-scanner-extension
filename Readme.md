# 🔒 Web Vulnerability Scanner - Project Overview

## 📌 الفكرة الرئيسية:
Browser Extension لاكتشاف الثغرات الأمنية في المواقع بشكل **Passive** (بدون تدخل)، مع Backend بـ .NET لتخزين النتائج وعرضها في Dashboard.

---

## 👥 الفريق:

| الدور | المسؤولية |
|------|----------|
| **2 Backend Developers** | Backend (.NET) - API, Database, Business Logic |
| **3 Cyber Security** | تحديد الثغرات وخوارزميات Detection |
| **1 UI/UX** | تصميم Dashboard والـ Extension UI |
| **1 Frontend** | تطوير Dashboard (React/Vue/Angular) |
| **1 AI** | Chatbot لشرح الثغرات وحلولها |

---

## 🎯 المميزات الأساسية:

### **1. Scanning Mode:**
- ✅ **Passive Scanning فقط** (مراقبة بدون تدخل)
- ❌ **No Active Scanning** (لا يوجد injection أو testing)

### **2. User Types:**

#### **🔓 Guest Mode:**
- يعمل Install للـ Extension
- يفحص أي موقع ويشوف النتائج في الـ Popup
- النتائج تتحفظ **مؤقتاً لمدة ساعة واحدة**
- **Rate Limit: 10 scans/hour per IP**

#### **🔐 Logged In Mode:**
- يسجل دخول من الـ Website (عبر زرار في الـ Popup)
- كل Scan يتحفظ في الـ Backend
- يقدر يدخل الـ Dashboard ويشوف كل فحوصاته
- **Rate Limit: 100 scans/day**
- الفحوصات تتحذف بعد **7 أيام** تلقائياً

### **3. Guest to User Linking:**
- لو Guest عمل Scans وبعدها عمل Login
- الـ Scans المؤقتة (اللي لسه موجودة) تتربط بحسابه تلقائياً

### **4. Duplicate Scans:**
- لو User فحص نفس الموقع مرتين
- الفحص الجديد **يستبدل** القديم (خلال 24 ساعة)

### **5. Settings:**
- ❌ **مفيش اختيارات** - كل الـ 20 ثغرة تشتغل تلقائياً

### **6. Admin:**
- ❌ **مفيش Admin Role** - كل الـ Users عاديين

---

## 🐛 الثغرات المكتشفة (20 نوع):

### 🔴 **Critical:**
1. Cross-Site Scripting (XSS)
2. SQL Injection
3. Command Injection
4. Exposed API Keys in Client Code
5. Insecure Form Endpoint

### 🟠 **High:**
6. Missing Content Security Policy (CSP)
7. Weak Content Security Policy (CSP)
8. Exposed Sensitive Files

### 🟡 **Medium:**
9. Mixed Content (HTTP on HTTPS)
10. Missing HSTS Header
11. Missing X-Frame-Options / Clickjacking
12. Insecure Cookie Attributes
13. Missing Subresource Integrity (SRI)
14. CORS Misconfiguration
15. Exposed Debug/Admin Pages
16. Open Redirect
17. Cross-Site Request Forgery (CSRF)

### 🟢 **Low:**
18. Deprecated HTML Attributes
19. Excessive Third-Party Trackers

---

## 🗄️ Database Schema:

### **Users:**
```sql
Users
├── Id (Guid, PK)
├── Email (unique, varchar 320)
├── Username (unique, varchar 50)
├── PasswordHash (varchar 255)
├── CreatedAt (DateTime)
├── LastLoginAt (DateTime)
└── IsActive (bool)
```

### **Scans:**
```sql
Scans
├── Id (Guid, PK)
├── UserId (Guid, FK, nullable)
├── GuestSessionId (Guid, nullable)
├── Url (varchar 500)
├── ScannedAt (DateTime)
├── ExpiresAt (DateTime, nullable)
    -- Guest: ScannedAt + 1 hour
    -- User: ScannedAt + 7 days
├── TotalVulnerabilities (int)
├── RiskScore (int, 0-100)
└── IsGuest (bool)
```

### **Vulnerabilities:**
```sql
Vulnerabilities
├── Id (Guid, PK)
├── ScanId (Guid, FK)
├── TypeId (int, FK)
├── Title (varchar 200)
├── Description (text)
├── Location (varchar 500)
├── Evidence (text)
├── Recommendation (text)
└── DetectedAt (DateTime)
```

### **VulnerabilityTypes (Static - 20 rows):**
```sql
VulnerabilityTypes
├── Id (int, PK)
├── Name (varchar 100)              -- "API_KEY_EXPOSURE"
├── DisplayName (varchar 200)       -- "Exposed API Keys in Client Code"
├── Severity (enum)                 -- Critical/High/Medium/Low
├── Description (text)
├── CWE_Id (int, nullable)
└── Category (varchar 50)           -- "Injection", "Configuration", etc.
```

### **RateLimits:**
```sql
RateLimits
├── Id (Guid, PK)
├── Identifier (varchar 100)        -- IP or UserId
├── ScanCount (int)
├── WindowStart (DateTime)
└── WindowEnd (DateTime)
```

### **ChatbotConversations:**
```sql
ChatbotConversations
├── Id (Guid, PK)
├── UserId (Guid, FK, nullable)
├── Message (text)
├── Response (text)
└── CreatedAt (DateTime)
```

---

## 🔧 API Endpoints:

### **Authentication:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/link-guest-scans
GET    /api/auth/me
POST   /api/auth/logout
```

### **Scanning:**
```
POST   /api/scans/guest              
  Rate Limit: 10/hour per IP
  Body: { url, vulnerabilities[] }
  Response: { scanId, guestSessionId, expiresAt, ... }

POST   /api/scans
  Rate Limit: 100/day per User
  Auth: Required (Bearer Token)
  Body: { url, vulnerabilities[] }
  Response: { scanId, expiresAt, ... }

GET    /api/scans
  Auth: Required
  Response: User's scans (last 7 days)

GET    /api/scans/{id}
  Auth: Required
  Response: Scan details + vulnerabilities

DELETE /api/scans/{id}
  Auth: Required

GET    /api/scans/statistics
  Auth: Required
  Response: { totalScans, bySeverity, byType, ... }

POST   /api/scans/{id}/export
  Auth: Required
  Body: { format: "pdf" | "json" }
  Response: File download
```

### **Vulnerabilities:**
```
GET    /api/vulnerabilities/types
  Response: All 20 vulnerability types

GET    /api/scans/{scanId}/vulnerabilities
  Auth: Required
  Response: All vulnerabilities for a scan
```

### **AI Chatbot:**
```
POST   /api/chatbot/ask
  Auth: Optional
  Body: { message, context? }
  Response: { answer, sources? }

GET    /api/chatbot/history
  Auth: Required
  Response: User's chat history
```

---

## 📤 Extension → Backend Request Format:

```json
{
  "url": "https://example.com",
  "scannedAt": "2025-12-06T10:30:00Z",
  "vulnerabilities": [
    {
      "typeId": 4,
      "title": "Google API Key Exposed in JavaScript",
      "description": "Found hardcoded API key in client-side code",
      "location": "script tag line 45, /assets/app.js",
      "evidence": "AIzaSyDxxxxxxxxxxx",
      "recommendation": "Move API keys to backend environment variables"
    },
    {
      "typeId": 6,
      "title": "Content Security Policy Not Implemented",
      "description": "No CSP header found in HTTP response",
      "location": "HTTP Headers",
      "evidence": "Content-Security-Policy header missing",
      "recommendation": "Implement CSP header: Content-Security-Policy: default-src 'self'"
    }
  ]
}
```

---

## 🔄 User Flow:

### **Guest Flow:**
```
1. Install Extension
2. Browse any website
3. Extension auto-scans (Passive)
4. Results show in Popup
5. Backend saves for 1 hour (with guestSessionId)
6. [Optional] Click "Login" → Goes to Website
```

### **Registration Flow:**
```
1. User clicks "Login/Register" in Extension Popup
2. Opens Website in new tab
3. User registers/logs in
4. Website sends token to Extension (via postMessage or redirect)
5. Extension saves token in chrome.storage
6. Extension calls /api/auth/link-guest-scans
7. Previous guest scans linked to account
```

### **Logged In Flow:**
```
1. Browse any website
2. Extension auto-scans (with Bearer token)
3. Results saved for 7 days
4. Can view all scans in Dashboard
5. Can export scans (PDF/JSON)
```

---

## 🧹 Background Jobs:

### **Job 1: Clean Expired Guest Scans**
- **Frequency:** Every hour
- **Action:** Delete scans where `IsGuest = true` AND `ExpiresAt < NOW()`

### **Job 2: Clean Old User Scans**
- **Frequency:** Daily at 2 AM
- **Action:** Delete scans where `IsGuest = false` AND `ScannedAt < NOW() - 7 days`

### **Job 3: Clean Rate Limit Records**
- **Frequency:** Every hour
- **Action:** Delete records where `WindowEnd < NOW()`

---

## 🔐 Security & Rate Limiting:

| User Type | Rate Limit | Storage Duration | Authentication |
|-----------|-----------|------------------|----------------|
| **Guest** | 10 scans/hour | 1 hour | None (IP-based) |
| **Logged In** | 100 scans/day | 7 days | JWT Bearer Token |

### **Rate Limit Implementation:**
```csharp
[RateLimit(10, per: "1h", by: "IP")]          // Guest
[RateLimit(100, per: "1d", by: "UserId")]     // User
```

---

## 🎨 Extension Popup UI:

### **Guest - After Scan:**
```
┌───────────────────────────────┐
│  🔍 Scan Results              │
│  example.com                  │
├───────────────────────────────┤
│  🔴 3 Critical                │
│  🟠 2 High                    │
│  🟡 5 Medium                  │
│  🟢 1 Low                     │
├───────────────────────────────┤
│  Risk Score: 78/100           │
│                               │
│  ⏰ Results saved for 59 min  │
│                               │
│  💡 Login to keep forever     │
│  [Login / Register] →         │
│                               │
│  [View Details]               │
└───────────────────────────────┘
```

### **Logged In - After Scan:**
```
┌───────────────────────────────┐
│  🔍 Scan Results              │
│  👤 Welcome, Ahmed            │
│  example.com                  │
├───────────────────────────────┤
│  🔴 3 Critical                │
│  🟠 2 High                    │
│  🟡 5 Medium                  │
│  🟢 1 Low                     │
├───────────────────────────────┤
│  Risk Score: 78/100           │
│  ✅ Scan saved for 7 days     │
│                               │
│  [Open Dashboard] →           │
│  [View Details]               │
│  [Export PDF]                 │
└───────────────────────────────┘
```

---

## 🖥️ Dashboard Features:

### **Pages:**
1. **Overview** - Statistics, Recent scans, Risk trends
2. **All Scans** - List of all scans (filterable, sortable)
3. **Scan Details** - Full report of a single scan
4. **AI Chatbot** - Ask questions about vulnerabilities
5. **Profile** - User settings, Export data

### **Overview Page:**
- Total scans (last 7 days)
- Vulnerabilities by severity (pie chart)
- Vulnerabilities by type (bar chart)
- Most vulnerable sites
- Scan history timeline

---

## 🤖 AI Chatbot Examples:

**User:** "What is XSS?"
**Bot:** "Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users..."

**User:** "How do I fix Missing CSP?"
**Bot:** "To fix Missing Content Security Policy:
1. Add this header to your server response:
   `Content-Security-Policy: default-src 'self'`
2. For Apache: Add to .htaccess...
3. For Nginx: Add to nginx.conf..."

**User:** "Which vulnerabilities did I find most?"
**Bot:** "Based on your scans, you found:
1. Missing CSP - 15 times
2. Insecure Cookies - 12 times
3. Missing HSTS - 10 times..."

---

## 🛠️ Tech Stack:

| Component | Technology |
|-----------|-----------|
| **Backend** | ASP.NET Core 8.0 Web API |
| **Database** | SQL Server / PostgreSQL |
| **ORM** | Entity Framework Core |
| **Authentication** | JWT (JSON Web Tokens) |
| **Rate Limiting** | AspNetCoreRateLimit |
| **Background Jobs** | Hangfire / Quartz.NET |
| **Extension** | JavaScript/TypeScript (Manifest V3) |
| **Frontend** | React/Vue/Angular |
| **AI** | OpenAI API / Custom Model |

---

## 📂 Recommended .NET Project Structure:

```
VulnScanner.Backend/
├── VulnScanner.API/                 (Web API)
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ScansController.cs
│   │   ├── VulnerabilitiesController.cs
│   │   └── ChatbotController.cs
│   ├── Middleware/
│   │   ├── RateLimitingMiddleware.cs
│   │   └── ErrorHandlingMiddleware.cs
│   ├── Program.cs
│   └── appsettings.json
│
├── VulnScanner.Core/                (Domain Models)
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Scan.cs
│   │   ├── Vulnerability.cs
│   │   └── VulnerabilityType.cs
│   ├── DTOs/
│   ├── Interfaces/
│   └── Enums/
│
├── VulnScanner.Infrastructure/      (Data Access)
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   └── Migrations/
│   ├── Repositories/
│   └── Services/
│
└── VulnScanner.Tests/               (Unit Tests)
```

---

## ✅ Summary Checklist:

### **Confirmed:**
- ✅ Passive Scanning only
- ✅ 20 vulnerability types (Critical → Low)
- ✅ Guest mode (1 hour storage, 10 scans/hour)
- ✅ User mode (7 days storage, 100 scans/day)
- ✅ Guest-to-User linking
- ✅ Replace duplicate scans (same URL within 24h)
- ✅ No user settings (all scans enabled)
- ✅ No Admin role
- ✅ AI Chatbot for help
- ✅ .NET Backend
- ✅ Auto-cleanup jobs

---

## 🚀 Next Steps:

1. ✅ Create GitHub repository
2. Initialize .NET Solution
3. Setup Database with EF Core
4. Implement Authentication
5. Build Scan endpoints
6. Create Extension (Content Scripts)
7. Develop Dashboard
8. Integrate AI Chatbot

---

**Last Updated:** 2025-12-06
