# JWT Authentication & RBAC Backend API

A Node.js/TypeScript backend demonstrating JWT authentication and Role-Based Access Control (RBAC) with column-level permissions.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Generate password hashes
node scripts/update-passwords.js

# Start server
pnpm dev

# Run tests
pnpm test
```

Server runs at `http://localhost:3000`

**Test Credentials:**

- Admin: `admin@test.com` / `password123`
- User: `user@test.com` / `password123`

## Tech Stack

- Node.js 20+ | TypeScript | Express.js
- PostgreSQL 15 (Docker) | JWT | Argon2
- Layered Architecture (Controller → Service → Repository)

## How It Works

### 1. Authentication (JWT)

**Login Flow:**

```
Client → POST /api/auth/login → Verify Password (Argon2) → Generate JWT → Return Token
```

**JWT Payload:**

```json
{
  "userId": 1,
  "email": "admin@test.com",
  "role": "ADMIN",
  "exp": 1701734400
}
```

**Usage:**

```bash
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer <token>"
```

### 2. Role-Based Access Control

| Action             | ADMIN          | USER                  |
| ------------------ | -------------- | --------------------- |
| Create campaign    | ✅             | ✅                    |
| Read campaigns     | ✅ All columns | ✅ Restricted columns |
| Update campaign    | ✅ Any         | ✅ Own only           |
| Delete campaign    | ✅             | ❌ 403 Forbidden      |
| Manage permissions | ✅             | ❌ 403 Forbidden      |

**Implementation:**

- **Middleware**: JWT validation (`authenticate`)
- **Service Layer**: Authorization logic (ownership checks, role checks)
- **Database**: Permission configuration

### 3. Column-Level RBAC (Generic)

**How it works:**

1. **Permissions stored in database:**

```sql
role  | table_name     | column_name | can_read
------|----------------|-------------|----------
ADMIN | sales_campaign | budget      | true
USER  | sales_campaign | budget      | false
```

2. **RBAC middleware loads permissions:**

```typescript
// For USER role on sales_campaign
allowedColumns = ['id', 'name', 'start_date', ...] // No 'budget'
```

3. **Controller filters response:**

```typescript
// ADMIN sees:
{ id: 1, name: "Summer Sale", budget: 50000, ... }

// USER sees:
{ id: 1, name: "Summer Sale", ... } // budget removed
```

**Why it's generic:**

- Works for ANY table (not hardcoded)
- Add new tables by inserting permissions
- No code changes needed

**Example: Add RBAC for products table:**

```sql
INSERT INTO column_permissions (role, table_name, column_name, can_read) VALUES
('USER', 'products', 'cost', false);
```

## API Endpoints

### Authentication

```bash
POST /api/auth/login
Body: { "email": "admin@test.com", "password": "password123" }
```

### Campaigns

```bash
GET    /api/campaigns           # List all
GET    /api/campaigns/:id       # Get one
POST   /api/campaigns           # Create
PUT    /api/campaigns/:id       # Update
DELETE /api/campaigns/:id       # Delete (ADMIN only)
```

### Permission Management (ADMIN only)

```bash
GET    /api/permissions                    # Get all
GET    /api/permissions/:role/:table       # Get by role/table
PUT    /api/permissions                    # Set permission
POST   /api/permissions/bulk               # Bulk set
DELETE /api/permissions                    # Delete permission
```

## Architecture

```
Client
  ↓
Middleware (Auth → RBAC)
  ↓
Controller (HTTP handling)
  ↓
Service (Business logic)
  ↓
Repository (Database queries)
  ↓
PostgreSQL
```

**Key Features:**

- ✅ Layered architecture for separation of concerns
- ✅ Repository pattern for data access
- ✅ Service pattern for business logic
- ✅ Custom error classes with HTTP status codes
- ✅ TypeScript for type safety

## Project Structure

```
src/
├── controllers/    # HTTP request/response
├── services/       # Business logic
├── repositories/   # Database operations
├── middleware/     # Auth & RBAC
├── routes/         # API endpoints
├── models/         # TypeScript types
└── utils/          # Helpers (JWT, errors)
```

## Security Features

- ✅ Argon2 password hashing (PHC 2015 winner)
- ✅ JWT with expiration (24h)
- ✅ Role-based authorization
- ✅ Column-level access control
- ✅ Parameterized SQL queries
- ✅ No sensitive data in errors

## Testing

### Automated Test Suite

Run the complete test suite:

```bash
pnpm test
```

**Test Coverage (19 tests):**

**Authentication Tests:**

1. ✅ Login as ADMIN - Returns JWT with ADMIN role
2. ✅ Login as USER - Returns JWT with USER role

**Campaign CRUD Tests:**

3. ✅ ADMIN creates campaign - Sees budget in response
4. ✅ USER creates campaign - Budget hidden in response
5. ✅ ADMIN gets campaigns - All fields including budget visible
6. ✅ USER gets campaigns - Budget field filtered out
7. ✅ USER updates own campaign - Success
8. ✅ USER tries to update other's campaign - 403 Forbidden
9. ✅ USER tries to delete campaign - 403 Forbidden
10. ✅ ADMIN deletes campaign - Success
11. ✅ Access without token - 401 Unauthorized

**RBAC Management Tests:**

12. ✅ ADMIN gets all permissions - Returns permission list
13. ✅ ADMIN gets USER permissions for sales_campaign
14. ✅ ADMIN allows USER to see budget - Permission updated
15. ✅ Verify USER can now see budget - Budget field appears
16. ✅ ADMIN bulk sets permissions - Multiple permissions updated
17. ✅ Verify budget hidden again - Budget field removed
18. ✅ USER tries to manage permissions - 403 Forbidden
19. ✅ ADMIN deletes permission - Success

**What the tests verify:**

- JWT authentication and token validation
- Password hashing with Argon2
- Role-based authorization (ADMIN vs USER)
- Column-level RBAC (budget field filtering)
- Dynamic permission management
- Immediate effect of permission changes
- Proper error responses (401, 403)

### Manual Testing

**HTTP files for REST Client:**

- `test-api.http` - Campaign API tests
- `test-rbac-api.http` - Permission management tests

## Documentation

- 📄 [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture diagrams
- 📄 [API.md](./API.md) - Complete API documentation
