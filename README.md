# Security Scanner Extension - Project Overview

## 📌 Project Information

**Project Name:** Security Scanner Extension  
**Type:** Graduation Project  


---

## 🎯 Project Goal

Browser extension that automatically detects security vulnerabilities in websites and provides a comprehensive dashboard for analysis and reporting.

---

## 👥 Team Structure

| Name | Role | Responsibilities |
|------|------|------------------|
| Mohamed Tawfeek | AI/ML | AI-based vulnerability detection |
| Marwan, MOaz and Radwan | Cybersecurity | Security analysis, vulnerability types |
| **Shiha + Hager** | **Backend** | **API, Database, Server** |
| Toka | Frontend | Web Dashboard (React) |
| Fatma | UI/UX | Design, User Experience |

---

## 🏗️ System Architecture

```
┌─────────────────┐
│ Browser         │
│ Extension       │◄─── User opens website
│ (Chrome/Firefox)│
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│ Backend API     │◄─── Your responsibility
│ (Node.js)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PostgreSQL      │◄─── Database
│ Database        │
└─────────────────┘
         ▲
         │
┌─────────────────┐
│ Web Dashboard   │
│ (React)         │◄─── User views results
└─────────────────┘
```

---

## 🔧 Technology Stack

### Backend (Your Part)
- **Framework:** Node.js + Express
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** Joi / express-validator
- **Testing:** Jest + Supertest


---

## 📊 Database Design

### Tables (6 Main Tables)

1. **users** - User accounts
2. **scans** - Scan operations
3. **vulnerabilities** - Detected vulnerabilities
4. **vulnerability_types** - Types of vulnerabilities (XSS, SQL Injection, etc.)
5. **reports** - Generated reports (PDF/JSON)
6. **logs** - Activity logs

**Full Schema:** [Database-Schema.md](database/Database-Schema.md)

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Scans
- `POST /scans` - Create new scan
- `GET /scans` - List all scans
- `GET /scans/:id` - Get scan details

### Vulnerabilities
- `POST /scans/:id/vulnerabilities` - Report vulnerability
- `GET /scans/:id/vulnerabilities` - List vulnerabilities

### Dashboard
- `GET /dashboard/stats` - Get statistics

### Reports
- `POST /reports` - Generate report
- `GET /reports/:id/download` - Download report

**Full Documentation:** [API-Documentation.md](API-Documentation.md)

---




## 🔑 Key Features

### For Users
1. **Automatic Scanning** - Extension scans websites automatically
2. **Real-time Detection** - Instant vulnerability detection
3. **Comprehensive Dashboard** - View all scans and vulnerabilities
4. **Detailed Reports** - Generate PDF/JSON reports
5. **Statistics** - Trends and insights

### For Developers (Your Backend)
1. **RESTful API** - Clean, standard API design
2. **JWT Authentication** - Secure token-based auth
3. **Scalable Database** - PostgreSQL with proper indexing
4. **Error Handling** - Comprehensive error responses
5. **Documentation** - Well-documented endpoints

---

## 📈 Success Metrics

- ✅ All APIs functional
- ✅ Response time < 500ms
- ✅ 99% uptime
- ✅ Secure authentication
- ✅ Complete documentation

---

## 🔗 Resources

- **GitHub Repository:** https://github.com/shi7a505/Security-scanner-extension
- **Database Design:** [docs/database/ERD.md](database/ERD.md)
- **API Documentation:** [docs/API-Documentation.md](API-Documentation.md)

---
