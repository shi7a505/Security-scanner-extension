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
│ Backend API     │◄─── My responsibility
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

### Backend 
- **Framework:** Node.js + Express
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)

---

## 📊 Database Design

### Tables (6 Main Tables)

1. **users** - User accounts
2. **scans** - Scan operations
3. **vulnerabilities** - Detected vulnerabilities
4. **vulnerability_types** - Types of vulnerabilities (XSS, SQL Injection, etc.)
5. **reports** - Generated reports (PDF/JSON)
6. **logs** - Activity logs


---
