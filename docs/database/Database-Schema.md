# Database Schema

## Reports Table

| Column    | Type   | Description         |
|-----------|--------|---------------------|
| id        | UUID   | Unique identifier    |
| file_size | BIGINT | Size of the file     |
| ...       | ...    | ...                 |

## Logs Table

| Column    | Type   | Description         |
|-----------|--------|---------------------|
| id        | UUID   | Unique identifier    |
| user_id   | UUID   | Identifier for user  |
| scan_id   | UUID   | References scans(id) ON DELETE SET NULL |
| ...       | ...    | ...                 |

### Indexes

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_scan_id ON logs(scan_id);

---

The Logs table now includes a `scan_id` field that allows for better tracking of scan-related entries. The `file_size` in the Reports Table has been changed to `BIGINT` to accommodate larger values.