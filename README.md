# Security Scanner Extension - Project Overview

## 📌 Project Information

**Project Name:** Security Scanner Extension  
**Type:** Graduation Project  
**Duration:** 8 weeks (13 Oct - 7 Dec 2025)  
**Current Phase:** Week 2 - Design Complete ✅

---

## 🎯 Project Goal

Browser extension that automatically detects security vulnerabilities in websites and provides a comprehensive dashboard for analysis and reporting.

---

## 👥 Team Structure

| Name | Role | Responsibilities |
|------|------|------------------|
| محمد توفيق | AI/ML | AI-based vulnerability detection |
| مروان، معاذ، رضوان | Cybersecurity | Security analysis, vulnerability types |
| **أنت + هاجر** | **Backend** | **API, Database, Server** |
| تقي | Frontend | Web Dashboard (React/Vue) |
| فاطمة | UI/UX | Design, User Experience |

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

### Other Components
- **Extension:** JavaScript (Vanilla JS)
- **Frontend:** React.js / Vue.js
- **AI/ML:** Python + TensorFlow

---

## 📊 Database Design

### Tables (6 Main Tables)

1. **users** - User accounts
2. **scans** - Scan operations
3. **vulnerabilities** - Detected vulnerabilities
4. **vulnerability_types** - Types of vulnerabilities (XSS, SQL Injection, etc.)
5. **reports** - Generated reports (PDF/JSON)
6. **logs** - Activity logs

**Full Schema:** [Database-Schema-Enhanced.md](database/Database-Schema-Enhanced.md)

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

## 📅 Project Timeline

| Week | Dates | Phase | Status |
|------|-------|-------|--------|
| 1-2 | Oct 13 - Oct 26 | Design (ERD, Schema, API) | ✅ Complete |
| 3-4 | Oct 27 - Nov 9 | Development (Backend APIs) | ⏳ Next |
| 5-6 | Nov 10 - Nov 23 | Testing & Integration | 📅 Planned |
| 7-8 | Nov 24 - Dec 7 | Deployment & Presentation | 📅 Planned |

---

## ✅ Completed Work (Week 1-2)

### Database Design
- ✅ ERD (Entity Relationship Diagram)
- ✅ Database Schema (SQL)
- ✅ 6 tables with relationships
- ✅ Indexes for performance

### API Design
- ✅ 20+ endpoints defined
- ✅ Request/Response formats
- ✅ Authentication flow
- ✅ Error handling strategy

### Documentation
- ✅ Database documentation
- ✅ API documentation
- ✅ GitHub repository setup

---

## 🎯 Next Steps (Week 3-4)

### Week 3 (Oct 27 - Nov 2)
- Backend project setup
- Database implementation
- Authentication APIs (Register/Login)

### Week 4 (Nov 3 - Nov 9)
- Scans APIs
- Vulnerabilities APIs
- Dashboard APIs
- Integration testing

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
- **Database Design:** [docs/database/ERD-Enhanced.md](database/ERD-Enhanced.md)
- **API Documentation:** [docs/API-Documentation.md](API-Documentation.md)

---

## 📞 Team Communication

- Weekly meetings with supervisor
- Daily standups with team
- GitHub for code collaboration
- Slack/WhatsApp for quick communication
