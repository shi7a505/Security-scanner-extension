# ERD - Security Scanner Extension

```
                         ┌──────────────────┐
                         │      User        │
                         ├──────────────────┤
                         │ ID (PK)          │
                         │ Email (Unique)   │
                         │ Username (Unique)│
                         │ Name             │
                         │ PasswordHash     │
                         │ Role             │
                         │ CreatedAt        │
                         │ UpdatedAt        │
                         │ IsActive         │
                         └────────┬─────────┘
                                  │
                                  │ 1:M (Creates)
                                  ↓
                         ┌──────────────────┐
                         │     Scans        │ ◄── جدول جديد!
                         ├──────────────────┤
                         │ ID (PK)          │
                         │ UserID (FK)      │
                         │ TargetURL        │
                         │ Status           │
                         │ TotalVulns       │
                         │ CriticalCount    │
                         │ HighCount        │
                         │ MediumCount      │
                         │ LowCount         │
                         │ StartedAt        │
                         │ CompletedAt      │
                         │ CreatedAt        │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         1:M (Has) │                           │ 1:M (Produces)
                    ↓                           ↓
       ┌──────────────────────┐      ┌──────────────────┐
       │  Vulnerabilities     │      │     Reports      │ ◄── جدول جديد!
       ├──────────────────────┤      ├──────────────────┤
       │ ID (PK)              │      │ ID (PK)          │
       │ ScanID (FK)          │      │ ScanID (FK)      │
       │ TypeID (FK)          │      │ UserID (FK)      │
       │ URL                  │      │ ReportType       │
       │ Description          │      │ FileURL          │
       │ Severity             │      │ FileSize         │
       │ Method               │      │ Status           │
       │ Parameter            │      │ CreatedAt        │
       │ Evidence (JSON)      │      └──────────────────┘
       │ Status               │
       │ DetectedAt           │
       │ CreatedAt            │
       └────────┬─────────────┘
                │
                │ M:1 (HasType)
                ↓
       ┌──────────────────────┐
       │  VulnerabilityTypes  │
       ├──────────────────────┤
       │ ID (PK)              │
       │ TypeName             │
       │ DisplayName          │
       │ Priority             │
       │ Enabled              │
       │ CreatedAt            │
       └──────────────────────┘


       ┌──────────────────┐
       │      Logs        │ (منفصل - للتتبع)
       ├──────────────────┤
       │ ID (PK)          │
       │ UserID (FK)      │
       │ Action           │
       │ Details (JSON)   │
       │ CreatedAt        │
       └──────────────────┘
```

##  العلاقات:

1. **User → Scans**: (1:M)
   - كل user يقدر يعمل scans كتير

2. **Scans → Vulnerabilities**: (1:M)
   - كل scan يلاقي vulnerabilities كتير

3. **Scans → Reports**: (1:M)
   - كل scan ممكن يطلع منه reports كتير

4. **Vulnerabilities → VulnerabilityTypes**: (M:1)
   - كل vulnerability ليها نوع واحد

5. **User → Logs**: (1:M)
   - كل user عنده logs كتير

