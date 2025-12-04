# Architecture Documentation

Detailed architecture diagrams and explanations for the JWT RBAC Backend API.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Login Flow](#login-flow)
3. [Request Flow with RBAC](#request-flow-with-rbac)
4. [Column-Level RBAC Flow](#column-level-rbac-flow)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Complete System Architecture                      │
└─────────────────────────────────────────────────────────────────────────────┘

                                  ┌─────────────┐
                                  │   Client    │
                                  │ (Browser/   │
                                  │   Mobile)   │
                                  └──────┬──────┘
                                         │
                                         │ HTTP/HTTPS
                                         │ JWT in Authorization header
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              Express.js Server                             │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                          Middleware Layer                            │ │
│  │                                                                      │ │
│  │  ┌────────────────┐    ┌────────────────┐    ┌─────────────────┐  │ │
│  │  │  CORS          │───▶│  Body Parser   │───▶│  Auth Middleware│  │ │
│  │  │  (cors)        │    │  (express.json)│    │  (JWT Verify)   │  │ │
│  │  └────────────────┘    └────────────────┘    └────────┬────────┘  │ │
│  │                                                        │            │ │
│  │                                                        ▼            │ │
│  │                                              ┌─────────────────┐   │ │
│  │                                              │ RBAC Middleware │   │ │
│  │                                              │ (Load Perms)    │   │ │
│  │                                              └────────┬────────┘   │ │
│  └───────────────────────────────────────────────────────┼────────────┘ │
│                                                           │              │
│  ┌───────────────────────────────────────────────────────┼────────────┐ │
│  │                          Routes Layer                 │            │ │
│  │                                                        ▼            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │ │
│  │  │ /api/auth    │  │ /api/        │  │ /api/permissions     │    │ │
│  │  │              │  │ campaigns    │  │                      │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │ │
│  └─────────┼──────────────────┼──────────────────────┼────────────────┘ │
│            │                  │                      │                  │
│  ┌─────────▼──────────────────▼──────────────────────▼────────────────┐ │
│  │                       Controllers Layer                             │ │
│  │  (Handle HTTP requests/responses, status codes)                    │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │ │
│  │  │ Auth         │  │ Campaign     │  │ Permission           │    │ │
│  │  │ Controller   │  │ Controller   │  │ Controller           │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │ │
│  └─────────┼──────────────────┼──────────────────────┼────────────────┘ │
│            │                  │                      │                  │
│  ┌─────────▼──────────────────▼──────────────────────▼────────────────┐ │
│  │                        Services Layer                               │ │
│  │  (Business logic, authorization, validation)                       │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │ │
│  │  │ Auth         │  │ Campaign     │  │ Permission           │    │ │
│  │  │ Service      │  │ Service      │  │ Service              │    │ │
│  │  │              │  │              │  │                      │    │ │
│  │  │ - Login      │  │ - CRUD ops   │  │ - Manage perms       │    │ │
│  │  │ - Password   │  │ - Ownership  │  │ - Validation         │    │ │
│  │  │   verify     │  │   checks     │  │                      │    │ │
│  │  │ - JWT gen    │  │ - Role check │  │                      │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │ │
│  └─────────┼──────────────────┼──────────────────────┼────────────────┘ │
│            │                  │                      │                  │
│  ┌─────────▼──────────────────▼──────────────────────▼────────────────┐ │
│  │                      Repositories Layer                             │ │
│  │  (Database operations only, SQL queries)                           │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │ │
│  │  │ User         │  │ Campaign     │  │ Permission           │    │ │
│  │  │ Repository   │  │ Repository   │  │ Repository           │    │ │
│  │  │              │  │              │  │                      │    │ │
│  │  │ - findByEmail│  │ - findAll    │  │ - findByRoleTable    │    │ │
│  │  │ - findById   │  │ - findById   │  │ - upsert             │    │ │
│  │  │ - create     │  │ - create     │  │ - delete             │    │ │
│  │  │              │  │ - update     │  │                      │    │ │
│  │  │              │  │ - delete     │  │                      │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │ │
│  └─────────┼──────────────────┼──────────────────────┼────────────────┘ │
│            │                  │                      │                  │
│            └──────────────────┴──────────────────────┘                  │
│                               │                                         │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL Database │
                    │                       │
                    │  ┌─────────────────┐ │
                    │  │ users           │ │
                    │  │ - id            │ │
                    │  │ - email         │ │
                    │  │ - password_hash │ │
                    │  │ - role          │ │
                    │  └─────────────────┘ │
                    │                       │
                    │  ┌─────────────────┐ │
                    │  │ sales_campaign  │ │
                    │  │ - id            │ │
                    │  │ - name          │ │
                    │  │ - budget        │ │
                    │  │ - start_date    │ │
                    │  │ - end_date      │ │
                    │  │ - created_by    │ │
                    │  └─────────────────┘ │
                    │                       │
                    │  ┌─────────────────┐ │
                    │  │ column_perms    │ │
                    │  │ - role          │ │
                    │  │ - table_name    │ │
                    │  │ - column_name   │ │
                    │  │ - can_read      │ │
                    │  └─────────────────┘ │
                    └───────────────────────┘
```

---

## Login Flow

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Server    │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. POST /api/auth/login                        │
       │     { email, password }                         │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                         ┌────────▼────────┐
       │                                         │ Auth Controller │
       │                                         └────────┬────────┘
       │                                                  │
       │                                         ┌────────▼────────┐
       │                                         │  Auth Service   │
       │                                         │                 │
       │                                         │ 1. Validate     │
       │                                         │    input        │
       │                                         └────────┬────────┘
       │                                                  │
       │                                         ┌────────▼────────┐
       │                                         │ User Repository │
       │                                         │                 │
       │                                         │ 2. Find user    │
       │                                         │    by email     │
       │                                         └────────┬────────┘
       │                                                  │
       │                                         ┌────────▼────────┐
       │                                         │    Database     │
       │                                         │                 │
       │                                         │ SELECT * FROM   │
       │                                         │ users WHERE     │
       │                                         │ email = ?       │
       │                                         └────────┬────────┘
       │                                                  │
       │                                         ┌────────▼────────┐
       │                                         │  Auth Service   │
       │                                         │                 │
       │                                         │ 3. Verify       │
       │                                         │    password     │
       │                                         │    (Argon2)     │
       │                                         │                 │
       │                                         │ 4. Generate JWT │
       │                                         │    - userId     │
       │                                         │    - email      │
       │                                         │    - role       │
       │                                         │    - expiry     │
       │                                         └────────┬────────┘
       │                                                  │
       │  2. Response: { token, user }                   │
       │<────────────────────────────────────────────────┤
       │                                                  │
       │  {                                               │
       │    "token": "eyJhbGc...",                        │
       │    "user": {                                     │
       │      "id": 1,                                    │
       │      "email": "admin@test.com",                  │
       │      "role": "ADMIN"                             │
       │    }                                             │
       │  }                                               │
       │                                                  │
┌──────▼──────┐                                    ┌──────┴──────┐
│   Client    │                                    │   Server    │
│ (stores JWT)│                                    │             │
└─────────────┘                                    └─────────────┘
```

---

## Request Flow with RBAC

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │  GET /api/campaigns
       │  Authorization: Bearer eyJhbGc...
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                         Express App                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  1. Auth Middleware (authenticate)                │    │
│  │     - Extract JWT from Authorization header       │    │
│  │     - Verify signature with JWT_SECRET            │    │
│  │     - Check expiration                             │    │
│  │     - Decode payload                               │    │
│  │                                                     │    │
│  │     req.user = {                                   │    │
│  │       userId: 2,                                   │    │
│  │       email: "user@test.com",                      │    │
│  │       role: "USER"                                 │    │
│  │     }                                               │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌───────────────────────────────────────────────────┐    │
│  │  2. RBAC Middleware (rbacMiddleware)              │    │
│  │     - Query column_permissions table              │    │
│  │     - Load allowed columns for USER role          │    │
│  │                                                     │    │
│  │     SELECT column_name FROM column_permissions    │    │
│  │     WHERE role = 'USER'                            │    │
│  │       AND table_name = 'sales_campaign'           │    │
│  │       AND can_read = true                          │    │
│  │                                                     │    │
│  │     req.allowedColumns = Set([                     │    │
│  │       'id', 'name', 'start_date', 'end_date'...   │    │
│  │     ])  // Note: 'budget' NOT included            │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌───────────────────────────────────────────────────┐    │
│  │  3. Campaign Controller                           │    │
│  │     - Call service layer                           │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌───────────────────────────────────────────────────┐    │
│  │  4. Campaign Service                              │    │
│  │     - Check authorization rules                    │    │
│  │     - If DELETE: check role === 'ADMIN'           │    │
│  │     - If UPDATE: check ownership for USER         │    │
│  │     - Call repository                              │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌───────────────────────────────────────────────────┐    │
│  │  5. Campaign Repository                           │    │
│  │     - Execute database query                       │    │
│  │     - Return raw data                              │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌───────────────────────────────────────────────────┐    │
│  │  6. Controller (Response)                         │    │
│  │     - Filter columns using req.allowedColumns     │    │
│  │     - Remove 'budget' field for USER              │    │
│  │     - Send filtered response                       │    │
│  └───────────────────┬───────────────────────────────┘    │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
                ┌─────────────┐
                │   Client    │
                │  (receives  │
                │   filtered  │
                │    data)    │
                └─────────────┘
```

---

## Column-Level RBAC Flow

### Example: sales_campaign.budget

```
Step 1: Database Configuration
┌─────────────────────────────────────────────────────────────────────┐
│  column_permissions table                                           │
├──────────┬────────────────┬─────────────┬──────────┐               │
│   role   │  table_name    │ column_name │ can_read │               │
├──────────┼────────────────┼─────────────┼──────────┤               │
│  ADMIN   │ sales_campaign │ budget      │   true   │ ◄─ ADMIN sees │
│  USER    │ sales_campaign │ budget      │  false   │ ◄─ USER hidden│
└──────────┴────────────────┴─────────────┴──────────┘               │
└─────────────────────────────────────────────────────────────────────┘

Step 2: RBAC Middleware Loads Permissions
┌─────────────────────────────────────────────────────────────────────┐
│  Query: SELECT column_name FROM column_permissions                 │
│         WHERE role = 'USER' AND table_name = 'sales_campaign'      │
│           AND can_read = true                                       │
│                                                                     │
│  Result: ['id', 'name', 'start_date', ...]  (no 'budget')         │
│                                                                     │
│  req.allowedColumns = Set(['id', 'name', 'start_date', ...])      │
└─────────────────────────────────────────────────────────────────────┘

Step 3: Controller Filters Response
┌─────────────────────────────────────────────────────────────────────┐
│  Database returns:                                                  │
│  { id: 1, name: "Summer Sale", budget: 50000, start_date: ... }   │
│                                                                     │
│  filterColumns() removes fields NOT in allowedColumns:             │
│  { id: 1, name: "Summer Sale", start_date: ... }                   │
│  // budget removed                                                  │
└─────────────────────────────────────────────────────────────────────┘

Comparison: ADMIN vs USER
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN Response:                                                    │
│  { "id": 1, "name": "Summer Sale", "budget": 50000, ... }          │
│                                                                     │
│  USER Response:                                                     │
│  { "id": 1, "name": "Summer Sale", ... }  // no budget             │
└─────────────────────────────────────────────────────────────────────┘
```

### Why It's Generic

This works for ANY table:

```sql
-- Add RBAC for products table
INSERT INTO column_permissions (role, table_name, column_name, can_read) VALUES
('USER', 'products', 'cost', false);

-- Use same middleware
router.get('/products', authenticate, rbacMiddleware('products'), getProducts);
```

No code changes needed!
