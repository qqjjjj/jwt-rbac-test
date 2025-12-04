# API Documentation

Complete API reference for all endpoints.

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**

```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": "ADMIN"
  }
}
```

**Errors:**

- `400` - Email and password required
- `401` - Invalid credentials
- `500` - Internal server error

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

---

## Campaign Endpoints

### GET /api/campaigns

Get all campaigns. Response filtered based on user role.

**Authentication:** Required

**Response (200 OK) - ADMIN:**

```json
[
  {
    "id": 1,
    "name": "Summer Sale",
    "budget": 50000,
    "start_date": "2024-06-01",
    "end_date": "2024-08-31",
    "created_by": 1,
    "created_at": "2024-05-01T10:00:00Z",
    "updated_at": "2024-05-01T10:00:00Z"
  }
]
```

**Response (200 OK) - USER:**

```json
[
  {
    "id": 1,
    "name": "Summer Sale",
    "start_date": "2024-06-01",
    "end_date": "2024-08-31",
    "created_by": 1,
    "created_at": "2024-05-01T10:00:00Z",
    "updated_at": "2024-05-01T10:00:00Z"
  }
]
```

**Note:** USER role does not see `budget` field.

**Errors:**

- `401` - Unauthorized (no token or invalid token)
- `500` - Failed to fetch campaigns

**Example:**

```bash
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/campaigns/:id

Get a single campaign by ID.

**Authentication:** Required

**Parameters:**

- `id` (path) - Campaign ID

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "Summer Sale",
  "budget": 50000,
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "created_by": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

**Errors:**

- `401` - Unauthorized
- `404` - Campaign not found
- `500` - Failed to fetch campaign

**Example:**

```bash
curl http://localhost:3000/api/campaigns/1 \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/campaigns

Create a new campaign.

**Authentication:** Required

**Roles:** ADMIN, USER

**Request:**

```json
{
  "name": "Black Friday Sale",
  "budget": 100000,
  "start_date": "2024-11-25",
  "end_date": "2024-11-30"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "name": "Black Friday Sale",
  "budget": 100000,
  "start_date": "2024-11-25",
  "end_date": "2024-11-30",
  "created_by": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

**Note:** USER role will not see `budget` in response.

**Errors:**

- `400` - Name is required
- `401` - Unauthorized
- `500` - Failed to create campaign

**Example:**

```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Black Friday","budget":100000,"start_date":"2024-11-25","end_date":"2024-11-30"}'
```

---

### PUT /api/campaigns/:id

Update a campaign.

**Authentication:** Required

**Roles:**

- ADMIN - Can update any campaign
- USER - Can only update own campaigns

**Parameters:**

- `id` (path) - Campaign ID

**Request:**

```json
{
  "name": "Updated Campaign Name",
  "budget": 75000,
  "start_date": "2024-06-15",
  "end_date": "2024-09-15"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "Updated Campaign Name",
  "budget": 75000,
  "start_date": "2024-06-15",
  "end_date": "2024-09-15",
  "created_by": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-02T14:30:00Z"
}
```

**Errors:**

- `401` - Unauthorized
- `403` - You can only update your own campaigns (USER role)
- `404` - Campaign not found
- `500` - Failed to update campaign

**Example:**

```bash
curl -X PUT http://localhost:3000/api/campaigns/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Updated Name"}'
```

---

### DELETE /api/campaigns/:id

Delete a campaign.

**Authentication:** Required

**Roles:** ADMIN only

**Parameters:**

- `id` (path) - Campaign ID

**Response (200 OK):**

```json
{
  "message": "Campaign deleted successfully"
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Only admins can delete campaigns
- `404` - Campaign not found
- `500` - Failed to delete campaign

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/campaigns/1 \
  -H "Authorization: Bearer <token>"
```

---

## Permission Management Endpoints

All permission endpoints require ADMIN role.

### GET /api/permissions

Get all column permissions.

**Authentication:** Required (ADMIN only)

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "role": "ADMIN",
    "table_name": "sales_campaign",
    "column_name": "budget",
    "can_read": true
  },
  {
    "id": 2,
    "role": "USER",
    "table_name": "sales_campaign",
    "column_name": "budget",
    "can_read": false
  }
]
```

**Errors:**

- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `500` - Failed to fetch permissions

**Example:**

```bash
curl http://localhost:3000/api/permissions \
  -H "Authorization: Bearer <admin-token>"
```

---

### GET /api/permissions/:role/:table

Get permissions for a specific role and table.

**Authentication:** Required (ADMIN only)

**Parameters:**

- `role` (path) - Role name (ADMIN or USER)
- `table` (path) - Table name (e.g., sales_campaign)

**Response (200 OK):**

```json
[
  {
    "id": 2,
    "role": "USER",
    "table_name": "sales_campaign",
    "column_name": "id",
    "can_read": true
  },
  {
    "id": 3,
    "role": "USER",
    "table_name": "sales_campaign",
    "column_name": "name",
    "can_read": true
  },
  {
    "id": 4,
    "role": "USER",
    "table_name": "sales_campaign",
    "column_name": "budget",
    "can_read": false
  }
]
```

**Errors:**

- `400` - Invalid role
- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `500` - Failed to fetch permissions

**Example:**

```bash
curl http://localhost:3000/api/permissions/USER/sales_campaign \
  -H "Authorization: Bearer <admin-token>"
```

---

### PUT /api/permissions

Set or update a single permission.

**Authentication:** Required (ADMIN only)

**Request:**

```json
{
  "role": "USER",
  "table_name": "sales_campaign",
  "column_name": "budget",
  "can_read": true
}
```

**Response (200 OK):**

```json
{
  "message": "Permission updated successfully",
  "permission": {
    "id": 4,
    "role": "USER",
    "table_name": "sales_campaign",
    "column_name": "budget",
    "can_read": true
  }
}
```

**Errors:**

- `400` - Invalid role or missing fields
- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `500` - Failed to set permission

**Example:**

```bash
curl -X PUT http://localhost:3000/api/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"role":"USER","table_name":"sales_campaign","column_name":"budget","can_read":true}'
```

---

### POST /api/permissions/bulk

Set multiple permissions at once.

**Authentication:** Required (ADMIN only)

**Request:**

```json
{
  "role": "USER",
  "table_name": "sales_campaign",
  "columns": [
    { "columnName": "id", "canRead": true },
    { "columnName": "name", "canRead": true },
    { "columnName": "budget", "canRead": false },
    { "columnName": "start_date", "canRead": true }
  ]
}
```

**Response (200 OK):**

```json
{
  "message": "4 permissions updated successfully",
  "permissions": [
    {
      "id": 1,
      "role": "USER",
      "table_name": "sales_campaign",
      "column_name": "id",
      "can_read": true
    },
    {
      "id": 2,
      "role": "USER",
      "table_name": "sales_campaign",
      "column_name": "name",
      "can_read": true
    }
  ]
}
```

**Errors:**

- `400` - Invalid role or columns must be an array
- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `500` - Failed to set permissions

**Example:**

```bash
curl -X POST http://localhost:3000/api/permissions/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"role":"USER","table_name":"sales_campaign","columns":[{"columnName":"budget","canRead":false}]}'
```

---

### DELETE /api/permissions

Delete a specific permission.

**Authentication:** Required (ADMIN only)

**Request:**

```json
{
  "role": "USER",
  "table_name": "sales_campaign",
  "column_name": "budget"
}
```

**Response (200 OK):**

```json
{
  "message": "Permission deleted successfully"
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `404` - Permission not found
- `500` - Failed to delete permission

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"role":"USER","table_name":"sales_campaign","column_name":"budget"}'
```

---

### DELETE /api/permissions/:role/:table

Delete all permissions for a role and table.

**Authentication:** Required (ADMIN only)

**Parameters:**

- `role` (path) - Role name
- `table` (path) - Table name

**Response (200 OK):**

```json
{
  "message": "5 permission(s) deleted successfully",
  "count": 5
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Only admins can manage permissions
- `500` - Failed to delete permissions

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/permissions/USER/sales_campaign \
  -H "Authorization: Bearer <admin-token>"
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting to prevent abuse.

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.
