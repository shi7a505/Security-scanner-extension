Complete API documentation for Security Scanner Extension including base URLs (Development: http://localhost:3000/api/v1, Production: https://api.security-scanner.com/api/v1), authentication requirement (JWT Bearer token), all endpoints with request/response examples:
- Authentication APIs: POST /auth/register, POST /auth/login
- Scans APIs: POST /scans, GET /scans with pagination, GET /scans/:id
- Vulnerabilities APIs: POST /scans/:scanId/vulnerabilities, GET /scans/:scanId/vulnerabilities, PUT /vulnerabilities/:id/status
- Dashboard APIs: GET /dashboard/stats
- Reports APIs: POST /reports, GET /reports/:id/download
Include error responses (400, 401, 404, 500), status codes table, request flow example, and notes about timestamps, UUIDs, pagination, rate limiting.