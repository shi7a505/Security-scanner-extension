# Backend Tasks - Security Scanner Project
## خطة العمل بالترتيب

---

## Week 1: Foundation & Core Features

### Day 1-2

1. **Database Design & Setup**
   - تصميم ERD كامل (Users, Scans, Vulnerabilities, Reports)
   - إنشاء Database على SQL Server
   - تنفيذ Schema الأساسي

2. **Project Structure Setup**
   - إنشاء المشروع (ASP.NET Core / Node.js / Python)
   - تنظيم Folder Structure
   - Git Repository Setup
   - .gitignore + README

---

### Day 3-4

3. **Entity Framework Setup**
   - إنشاء DbContext
   - إنشاء Models (User, Scan, Vulnerability, Report)
   - Configure Relationships (Foreign Keys, Navigation Properties)
   - Initial Migration + تطبيقها

4. **DTOs Creation**
   - RegisterRequestDto
   - LoginRequestDto
   - LoginResponseDto
   - CreateScanDto
   - ScanResponseDto
   - VulnerabilityDto

5. **Password Hashing Setup**
   - PasswordHasher class/helper
   - Hash method
   - Verify method

---

### Day 5-6

6. **JWT Configuration**
   - JWT Helper Class (GenerateToken, ValidateToken)
   - appsettings.json configuration (Secret Key, Expiration)
   - Token validation middleware setup

7. **Repository Pattern**
   - إنشاء IRepository<T> interface
   - GenericRepository<T> implementation
   - UserRepository
   - ScanRepository

8. **Authentication Service & Controller**
   - IAuthService interface
   - AuthService implementation (Register, Login)
   - AuthController (POST /api/auth/register, POST /api/auth/login)

---

### Day 7

9. **Input Validation**
   - FluentValidation setup
   - RegisterValidator
   - LoginValidator
   - CreateScanValidator

10. **CORS & Basic Security**
    - CORS configuration
    - [Authorize] attribute setup

11. **Testing Authentication**
    - Postman Collection
    - Test Register
    - Test Login
    - Test JWT Token

---

## Week 2: Advanced Features & Security

### Day 1-2

12. **Scans Service & Controller**
    - IScansService interface
    - ScansService (CreateScan, GetUserScans, GetScanById, DeleteScan)
    - ScansController (CRUD endpoints)
    - Authorization check (user can only access his scans)

13. **Vulnerabilities Service & Controller**
    - IVulnerabilitiesService
    - VulnerabilitiesService (GetScanVulnerabilities, FilterBySeverity)
    - VulnerabilitiesController endpoints

14. **Testing Scans & Vulnerabilities**
    - Postman tests للـ Scans CRUD
    - Test authorization (403 errors)

---

### Day 3-4

15. **Reports Service & Controller**
    - IReportsService
    - ReportsService (GenerateReport, GetReportById)
    - ReportsController endpoints

16. **Middleware Implementation**
    - Global Error Handling Middleware
    - Request Logging Middleware
    - Rate Limiting Middleware

17. **Logging System**
    - Serilog/Winston configuration
    - File logging
    - Console logging
    - Error logging

---

### Day 5

18. **Refresh Token System**
    - RefreshTokens table/model
    - Migration
    - GenerateRefreshToken method
    - ValidateRefreshToken method
    - POST /api/auth/refresh endpoint
    - POST /api/auth/logout endpoint

19. **Database Optimization**
    - Indexes (Users.Email, Scans.UserId, Vulnerabilities.ScanId)
    - Query optimization (Eager loading)
    - Pagination helper

---

### Day 6

20. **Security Hardening**
    - Security Headers (X-Content-Type-Options, X-Frame-Options)
    - HTTPS enforcement
    - Rate limiting configuration
    - Password policy validation
    - Secure error messages

21. **Role-Based Access Control (RBAC)**
    - Add Role field في User model
    - Migration
    - [Authorize(Roles = "Admin")] setup
    - Admin endpoints (GET users, GET all scans, DELETE user)

22. **Swagger Documentation**
    - Swashbuckle setup
    - XML comments
    - JWT authentication في Swagger
    - Request/Response examples

---

### Day 7

23. **Comprehensive Testing**
    - Postman Collection كامل
    - Environment variables
    - Test scripts
    - جميع الـ scenarios:
      - Authentication flow
      - CRUD operations
      - Authorization checks
      - Error handling
      - Pagination
      - Filtering

24. **Code Review & Cleanup**
    - Code refactoring
    - Remove unused code
    - XML documentation comments
    - README update

25. **Final Integration Testing**
    - End-to-end testing
    - Performance testing
    - Security testing
    - Fix any bugs

---

## API Endpoints Checklist

### Authentication
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me

### Scans
- [ ] POST /api/scans
- [ ] GET /api/scans
- [ ] GET /api/scans/{id}
- [ ] DELETE /api/scans/{id}

### Vulnerabilities
- [ ] GET /api/scans/{scanId}/vulnerabilities
- [ ] GET /api/vulnerabilities/{id}
- [ ] GET /api/scans/{scanId}/vulnerabilities/severity/{level}

### Reports
- [ ] POST /api/scans/{scanId}/reports/generate
- [ ] GET /api/reports/{id}
- [ ] GET /api/reports/{id}/download

### Admin
- [ ] GET /api/admin/users
- [ ] GET /api/admin/scans
- [ ] DELETE /api/admin/users/{id}

---

## Security Checklist

- [ ] Password Hashing (bcrypt)
- [ ] JWT with expiration
- [ ] Refresh Token mechanism
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] SQL Injection prevention
- [ ] XSS protection
- [ ] Rate Limiting
- [ ] Input Validation
- [ ] Secure error messages
- [ ] Security headers
- [ ] Environment variables للـ secrets
- [ ] Logging (without sensitive data)
- [ ] RBAC implementation

---

## Database Schema

### Users
- id, email (unique), password_hash, role, created_at, updated_at

### Scans
- id, user_id (FK), target_url, status, created_at, updated_at

### Vulnerabilities
- id, scan_id (FK), type, severity, description, detected_at

### Reports
- id, scan_id (FK), file_path, format, generated_at

### RefreshTokens
- id, user_id (FK), token (unique), expires_at, is_revoked, created_at
