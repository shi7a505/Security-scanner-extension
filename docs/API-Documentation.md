# API Documentation - Security Scanner Extension

## 📌 Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.security-scanner.com/api/v1
```

## 🔐 Authentication
All endpoints (except `/auth/*`) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 1️⃣ Authentication APIs

### Register
**POST** `/auth/register`

**Request:**
```json
{
  "email": "ahmed@example.com",
  "username": "ahmed",
  "name": "Ahmed Mohamed",
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "ahmed@example.com",
      "username": "ahmed",
      "name": "Ahmed Mohamed",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "ahmed@example.com",
      "username": "ahmed",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2️⃣ Scans APIs

### Create Scan
**POST** `/scans`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "target_url": "https://facebook.com",
  "scan_type": "automatic"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "scan-uuid",
    "target_url": "https://facebook.com",
    "status": "pending",
    "total_vulnerabilities": 0,
    "created_at": "2025-10-23T23:46:40Z"
  }
}
```

---

### List Scans
**GET** `/scans?page=1&limit=20&status=completed`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "id": "scan-uuid",
        "target_url": "https://facebook.com",
        "status": "completed",
        "total_vulnerabilities": 15,
        "critical_count": 2,
        "high_count": 5,
        "medium_count": 6,
        "low_count": 2,
        "started_at": "2025-10-23T22:00:00Z",
        "completed_at": "2025-10-23T22:05:00Z",
        "duration_seconds": 300
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### Get Scan Details
**GET** `/scans/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "scan-uuid",
    "target_url": "https://facebook.com",
    "status": "completed",
    "total_vulnerabilities": 15,
    "critical_count": 2,
    "high_count": 5,
    "medium_count": 6,
    "low_count": 2,
    "started_at": "2025-10-23T22:00:00Z",
    "completed_at": "2025-10-23T22:05:00Z",
    "created_at": "2025-10-23T22:00:00Z"
  }
}
```

---

## 3️⃣ Vulnerabilities APIs

### Report Vulnerability
**POST** `/scans/:scanId/vulnerabilities`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "type_id": "xss-type-uuid",
  "url": "https://facebook.com/search?q=test",
  "description": "Reflected XSS in search parameter",
  "severity": "high",
  "method": "GET",
  "parameter": "q",
  "evidence": {
    "payload": "<script>alert(1)</script>",
    "response": "...",
    "screenshot_url": "https://..."
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "vuln-uuid",
    "scan_id": "scan-uuid",
    "type_id": "xss-type-uuid",
    "severity": "high",
    "status": "open",
    "created_at": "2025-10-23T23:46:40Z"
  }
}
```

---

### List Vulnerabilities
**GET** `/scans/:scanId/vulnerabilities?severity=critical,high`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vulnerabilities": [
      {
        "id": "vuln-uuid",
        "scan_id": "scan-uuid",
        "type": {
          "id": "type-uuid",
          "type_name": "xss",
          "display_name": "Cross-Site Scripting (XSS)"
        },
        "url": "https://facebook.com/search?q=test",
        "description": "Reflected XSS in search parameter",
        "severity": "high",
        "method": "GET",
        "parameter": "q",
        "status": "open",
        "detected_at": "2025-10-23T22:01:15Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 7
    }
  }
}
```

---

### Update Vulnerability Status
**PUT** `/vulnerabilities/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "status": "fixed"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "vuln-uuid",
    "status": "fixed",
    "updated_at": "2025-10-23T23:46:40Z"
  }
}
```

---

## 4️⃣ Dashboard APIs

### Get Statistics
**GET** `/dashboard/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_scans": 150,
    "scans_this_month": 25,
    "total_vulnerabilities": 450,
    "vulnerabilities_by_severity": {
      "critical": 45,
      "high": 120,
      "medium": 180,
      "low": 90,
      "info": 15
    },
    "top_vulnerability_types": [
      {
        "type": "xss",
        "display_name": "Cross-Site Scripting",
        "count": 150
      },
      {
        "type": "sql_injection",
        "display_name": "SQL Injection",
        "count": 80
      }
    ],
    "recent_scans": [
      {
        "id": "scan-uuid",
        "target_url": "https://facebook.com",
        "total_vulnerabilities": 15,
        "completed_at": "2025-10-23T22:05:00Z"
      }
    ]
  }
}
```

---

## 5️⃣ Reports APIs

### Generate Report
**POST** `/reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "scan_id": "scan-uuid",
  "report_type": "pdf"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "scan_id": "scan-uuid",
    "report_type": "pdf",
    "status": "generating",
    "created_at": "2025-10-23T23:46:40Z"
  }
}
```

---

### Download Report
**GET** `/reports/:id/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "file_url": "https://storage.example.com/reports/scan-uuid.pdf",
    "file_size": 1024000,
    "status": "completed",
    "expires_at": "2025-10-30T23:46:40Z"
  }
}
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Scan not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔄 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## 🚀 Request Flow Example

```
1. User Register/Login
   POST /auth/register or /auth/login
   → Receive JWT token

2. Extension Opens Website
   POST /scans
   → Receive scan_id

3. Extension Scans Website
   → Find vulnerabilities

4. Extension Reports Each Vulnerability
   POST /scans/:scanId/vulnerabilities
   → Store vulnerability

5. User Views Dashboard
   GET /dashboard/stats
   → See all statistics

6. User Views Scan Details
   GET /scans/:scanId
   GET /scans/:scanId/vulnerabilities
   → See all vulnerabilities

7. User Generates Report
   POST /reports
   GET /reports/:id/download
   → Download PDF
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDs (v4)
- Pagination default: page=1, limit=20
- Max limit: 100
- Token expiration: 24 hours
- Rate limiting: 100 requests/minute
