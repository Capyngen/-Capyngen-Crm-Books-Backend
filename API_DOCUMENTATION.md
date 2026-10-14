# Antigravity Books & ERP Ecosystem — Complete API Reference & Specification

> **Version:** 2.0 Enterprise Release  
> **Base URL (Local):** `http://127.0.0.1:5000`  
> **Base URL (Production):** `https://backend-books-hxcr.onrender.com`  
> **Protocol:** HTTPS / JSON REST API  
> **Total Endpoints Documented:** 289  
> **Total Database Models:** 63  
> **Generated At:** 2026-10-14T06:47:41.409Z  

---

## Table of Contents
1. [Authentication & Session](#authentication-session) (3 APIs)
2. [System & Health](#system-health) (1 APIs)
3. [Core & Tenancy](#core-tenancy) (3 APIs)
4. [RBAC & Permissions](#rbac-permissions) (9 APIs)
5. [Storage & Uploads](#storage-uploads) (1 APIs)
6. [Integrations & Webhooks](#integrations-webhooks) (2 APIs)
7. [Customer Portal](#customer-portal) (3 APIs)
8. [Sales - Customers](#sales-customers) (4 APIs)
9. [Sales - Quotes](#sales-quotes) (5 APIs)
10. [Sales - Sales Orders](#sales-sales-orders) (6 APIs)
11. [Sales - Invoices](#sales-invoices) (7 APIs)
12. [Sales - Recurring Invoices](#sales-recurring-invoices) (5 APIs)
13. [Sales - Delivery Challans](#sales-delivery-challans) (5 APIs)
14. [Sales - Payments Received](#sales-payments-received) (7 APIs)
15. [Sales - Credit Notes](#sales-credit-notes) (5 APIs)
16. [Purchases - Vendors](#purchases-vendors) (5 APIs)
17. [Purchases - Expenses](#purchases-expenses) (8 APIs)
18. [Purchases - Recurring Expenses](#purchases-recurring-expenses) (5 APIs)
19. [Purchases - Purchase Orders](#purchases-purchase-orders) (7 APIs)
20. [Purchases - Bills](#purchases-bills) (6 APIs)
21. [Purchases - Recurring Bills](#purchases-recurring-bills) (5 APIs)
22. [Purchases - Payments Made](#purchases-payments-made) (7 APIs)
23. [Purchases - Mileage](#purchases-mileage) (5 APIs)
24. [Inventory - Items & Products](#inventory-items-products) (5 APIs)
25. [Inventory - Adjustments](#inventory-adjustments) (4 APIs)
26. [Inventory - Warehouses](#inventory-warehouses) (5 APIs)
27. [Inventory - Transfer Orders](#inventory-transfer-orders) (5 APIs)
28. [Inventory - Shipments](#inventory-shipments) (6 APIs)
29. [Manufacturing - Machines](#manufacturing-machines) (5 APIs)
30. [Manufacturing - Routings](#manufacturing-routings) (5 APIs)
31. [Manufacturing - Work Orders](#manufacturing-work-orders) (5 APIs)
32. [Inventory - AI Forecast](#inventory-ai-forecast) (3 APIs)
33. [Accounting - Chart of Accounts](#accounting-chart-of-accounts) (5 APIs)
34. [Accounting - Manual Journals](#accounting-manual-journals) (6 APIs)
35. [Accounting - Recurring Journals](#accounting-recurring-journals) (5 APIs)
36. [Accounting - Reconciliation](#accounting-reconciliation) (2 APIs)
37. [Accounting - Taxes & Configurations](#accounting-taxes-configurations) (6 APIs)
38. [Accounting - Fixed Assets](#accounting-fixed-assets) (4 APIs)
39. [Accounting - Budgets](#accounting-budgets) (5 APIs)
40. [Accounting - Currency Adjustments](#accounting-currency-adjustments) (5 APIs)
41. [Accounting - Transaction Locks](#accounting-transaction-locks) (2 APIs)
42. [Time Tracking - Projects](#time-tracking-projects) (5 APIs)
43. [Time Tracking - Timesheet Entries](#time-tracking-timesheet-entries) (5 APIs)
44. [Dashboard & Metrics](#dashboard-metrics) (1 APIs)
45. [Reports & Analytics](#reports-analytics) (65 APIs)
46. [Billing - Dashboard](#billing-dashboard) (1 APIs)
47. [Billing - Customers](#billing-customers) (5 APIs)
48. [Billing - Items](#billing-items) (5 APIs)
49. [Billing - Plans](#billing-plans) (5 APIs)

---

## 1. Global Architecture & API Contract

### Authentication & Headers
All requests (except public health probe) require an authenticated Capyngen/Books session.

| Header | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `Authorization` | Bearer JWT access token from ecosystem | **Yes** | `Bearer eyJhbGciOiJIUzI1Ni... ` |
| `x-org-id` | Active Organization / Company Profile ID | Optional (extracted from token) | `6a47ab48ec2ba07354500c91` |
| `x-user-id` | Active Employee / User ID | Optional (extracted from token) | `6a47a7e1ec2ba07354500c1b` |
| `Content-Type` | Payload format | **Yes** (POST/PUT/PATCH) | `application/json` |

### Global Response Contract
The backend enforces an API contract wrapper via `apiContract` middleware:

```json
{
  "success": true,
  "message": "Request successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "totalCount": 120,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Global Error Contract
```json
{
  "success": false,
  "message": "Error description message",
  "data": {
    "code": "PERMISSION_DENIED | VALIDATION_ERROR | NOT_FOUND | UNAUTHORIZED",
    "requiredRoles": ["Admin", "HR", "Finance"],
    "currentRole": "Employee"
  }
}
```

---

## Authentication & Session

Total APIs in this module: **3**

### 1. `POST` `/api/v1/employees/login`

- **Controller / Handler:** `handleEmployeeLogin`
- **Route Declaration:** `src/app.ts`
- **Primary Data Model:** `Employee`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "email": "employee@example.com",
  "password": "SecretPassword123!"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Employee`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `employeeName` | `string` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `defaultBillingRate` | `number` | Optional | Standard ERP entity attribute |

---

### 2. `GET` `/api/v1/books/me`

- **Controller / Handler:** `getCurrentUserProfileAndSubscription`
- **Route Declaration:** `src/app.ts`
- **Primary Data Model:** `User`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`User`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `mobile` | `string` | Optional | Standard ERP entity attribute |
| `password` | `string` | Optional | Standard ERP entity attribute |
| `role` | `string` | **Required** | Standard ERP entity attribute |
| `companyName` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `isVerified` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/debug-me`

- **Controller / Handler:** `debugOrganizationSubscription`
- **Route Declaration:** `src/app.ts`
- **Primary Data Model:** `Organization`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Organization`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ownerId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `companyName` | `string` | **Required** | Standard ERP entity attribute |
| `industry` | `string` | **Required** | Standard ERP entity attribute |
| `location` | `string` | **Required** | Standard ERP entity attribute |
| `state` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `language` | `string` | **Required** | Standard ERP entity attribute |
| `timeZone` | `string` | **Required** | Standard ERP entity attribute |
| `gstRegistered` | `boolean` | **Required** | Standard ERP entity attribute |
| `gstNumber` | `string` | Optional | Standard ERP entity attribute |
| `fiscalYearStartMonth` | `number` | Optional | Standard ERP entity attribute |
| `fiscalYearStartDay` | `number` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---


## System & Health

Total APIs in this module: **1**

### 1. `GET` `/health`

- **Controller / Handler:** `healthCheckHandler`
- **Route Declaration:** `src/app.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```

---


## Core & Tenancy

Total APIs in this module: **3**

### 1. `POST` `/api/v1/organizations/setup`

- **Controller / Handler:** `setupOrganization`
- **Route Declaration:** `src/domains/core/routes/orgRoutes.ts`
- **Primary Data Model:** `Organization`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Request Payload (JSON Body):**

```json
{
  "ownerId": "Sample ownerId",
  "companyName": "Sample companyName",
  "industry": "Sample industry",
  "location": "Sample location",
  "state": "Sample state",
  "currency": "Sample currency",
  "language": "Sample language",
  "timeZone": "Sample timeZone"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Organization`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ownerId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `companyName` | `string` | **Required** | Standard ERP entity attribute |
| `industry` | `string` | **Required** | Standard ERP entity attribute |
| `location` | `string` | **Required** | Standard ERP entity attribute |
| `state` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `language` | `string` | **Required** | Standard ERP entity attribute |
| `timeZone` | `string` | **Required** | Standard ERP entity attribute |
| `gstRegistered` | `boolean` | **Required** | Standard ERP entity attribute |
| `gstNumber` | `string` | Optional | Standard ERP entity attribute |
| `fiscalYearStartMonth` | `number` | Optional | Standard ERP entity attribute |
| `fiscalYearStartDay` | `number` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `GET` `/api/v1/organizations`

- **Controller / Handler:** `getOrganizations`
- **Route Declaration:** `src/domains/core/routes/orgRoutes.ts`
- **Primary Data Model:** `Organization`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Organization`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ownerId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `companyName` | `string` | **Required** | Standard ERP entity attribute |
| `industry` | `string` | **Required** | Standard ERP entity attribute |
| `location` | `string` | **Required** | Standard ERP entity attribute |
| `state` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `language` | `string` | **Required** | Standard ERP entity attribute |
| `timeZone` | `string` | **Required** | Standard ERP entity attribute |
| `gstRegistered` | `boolean` | **Required** | Standard ERP entity attribute |
| `gstNumber` | `string` | Optional | Standard ERP entity attribute |
| `fiscalYearStartMonth` | `number` | Optional | Standard ERP entity attribute |
| `fiscalYearStartDay` | `number` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `POST` `/api/v1/organizations/join`

- **Controller / Handler:** `joinOrganization`
- **Route Declaration:** `src/domains/core/routes/orgRoutes.ts`
- **Primary Data Model:** `Organization`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Request Payload (JSON Body):**

```json
{
  "ownerId": "Sample ownerId",
  "companyName": "Sample companyName",
  "industry": "Sample industry",
  "location": "Sample location",
  "state": "Sample state",
  "currency": "Sample currency",
  "language": "Sample language",
  "timeZone": "Sample timeZone"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Organization`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ownerId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `companyName` | `string` | **Required** | Standard ERP entity attribute |
| `industry` | `string` | **Required** | Standard ERP entity attribute |
| `location` | `string` | **Required** | Standard ERP entity attribute |
| `state` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `language` | `string` | **Required** | Standard ERP entity attribute |
| `timeZone` | `string` | **Required** | Standard ERP entity attribute |
| `gstRegistered` | `boolean` | **Required** | Standard ERP entity attribute |
| `gstNumber` | `string` | Optional | Standard ERP entity attribute |
| `fiscalYearStartMonth` | `number` | Optional | Standard ERP entity attribute |
| `fiscalYearStartDay` | `number` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---


## RBAC & Permissions

Total APIs in this module: **9**

### 1. `GET` `/api/v1/rbac/roles`

- **Controller / Handler:** `'roles'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 2. `GET` `/api/v1/rbac/roles/:id`

- **Controller / Handler:** `'roles'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 3. `POST` `/api/v1/rbac/roles`

- **Controller / Handler:** `'roles'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "permissions": [],
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/rbac/roles/:id`

- **Controller / Handler:** `'roles'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "permissions": [],
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/rbac/roles/:id`

- **Controller / Handler:** `'roles'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 6. `GET` `/api/v1/rbac/users`

- **Controller / Handler:** `'users'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 7. `POST` `/api/v1/rbac/users/invite`

- **Controller / Handler:** `'users'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "permissions": [],
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 8. `PUT` `/api/v1/rbac/users/:id`

- **Controller / Handler:** `'users'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "permissions": [],
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 9. `DELETE` `/api/v1/rbac/users/:id`

- **Controller / Handler:** `'users'`
- **Route Declaration:** `src/domains/core/routes/rbacRoutes.ts`
- **Primary Data Model:** `Role`
- **Role Authorization:** 🔒 `Admin` / Organization Owner

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Role`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `permissions` | `string[]` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---


## Storage & Uploads

Total APIs in this module: **1**

### 1. `POST` `/api/v1/upload`

- **Controller / Handler:** `upload.single('file'`
- **Route Declaration:** `src/routes/uploadRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample Record",
  "status": "Active",
  "notes": "Standard ERP entry"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```

---


## Integrations & Webhooks

Total APIs in this module: **2**

### 1. `POST` `/api/v1/integration/hrms/payroll-finalized`

- **Controller / Handler:** `next: NextFunction`
- **Route Declaration:** `src/routes/integrationRoutes.ts`
- **Primary Data Model:** `WebhookSubscription`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "url": "Sample url",
  "events": [],
  "secret": "Sample secret",
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`WebhookSubscription`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `url` | `string` | **Required** | Standard ERP entity attribute |
| `events` | `string[]` | **Required** | Standard ERP entity attribute |
| `secret` | `string` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/integration/crm/deal-won`

- **Controller / Handler:** `next: NextFunction`
- **Route Declaration:** `src/routes/integrationRoutes.ts`
- **Primary Data Model:** `WebhookSubscription`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "url": "Sample url",
  "events": [],
  "secret": "Sample secret",
  "isActive": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`WebhookSubscription`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `url` | `string` | **Required** | Standard ERP entity attribute |
| `events` | `string[]` | **Required** | Standard ERP entity attribute |
| `secret` | `string` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |

---


## Customer Portal

Total APIs in this module: **3**

### 1. `GET` `/api/v1/portal/:customerId/secure-link`

- **Controller / Handler:** `getSecurePortalLink`
- **Route Declaration:** `src/domains/books/routes/customerPortalRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `customerId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 2. `GET` `/api/v1/portal/:customerId/statement`

- **Controller / Handler:** `getStatementOfAccount`
- **Route Declaration:** `src/domains/books/routes/customerPortalRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `customerId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.411Z",
    "updatedAt": "2026-10-14T06:47:41.411Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 3. `GET` `/api/v1/portal/:customerId/invoices`

- **Controller / Handler:** `getOpenInvoices`
- **Route Declaration:** `src/domains/books/routes/customerPortalRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `customerId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---


## Sales - Customers

Total APIs in this module: **4**

### 1. `GET` `/api/v1/books/sales/customers`

- **Controller / Handler:** `getCustomers`
- **Route Declaration:** `src/domains/books/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 2. `POST` `/api/v1/books/sales/customers`

- **Controller / Handler:** `createCustomer`
- **Route Declaration:** `src/domains/books/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "email": "Sample email",
  "phone": "Sample phone",
  "address": "Sample address",
  "currency": "Sample currency",
  "paymentTerms": "Sample paymentTerms",
  "attention": "Sample attention",
  "country": "Sample country"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 3. `GET` `/api/v1/books/sales/customers/:id`

- **Controller / Handler:** `getCustomerById`
- **Route Declaration:** `src/domains/books/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 4. `PUT` `/api/v1/books/sales/customers/:id`

- **Controller / Handler:** `updateCustomer`
- **Route Declaration:** `src/domains/books/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "email": "Sample email",
  "phone": "Sample phone",
  "address": "Sample address",
  "currency": "Sample currency",
  "paymentTerms": "Sample paymentTerms",
  "attention": "Sample attention",
  "country": "Sample country"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---


## Sales - Quotes

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/sales/quotes`

- **Controller / Handler:** `getQuotes`
- **Route Declaration:** `src/domains/books/routes/quoteRoutes.ts`
- **Primary Data Model:** `Quote`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Quote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `quoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `quoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expiryDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Sent' \| 'Accepted' \| 'Declined' \| 'Expired' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `IQuoteItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 15 more fields* | | | See full Quote definition |

---

### 2. `POST` `/api/v1/books/sales/quotes`

- **Controller / Handler:** `createQuote`
- **Route Declaration:** `src/domains/books/routes/quoteRoutes.ts`
- **Primary Data Model:** `Quote`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "orgId": "Sample orgId",
  "quoteNumber": "Sample quoteNumber",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Quote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `quoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `quoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expiryDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Sent' \| 'Accepted' \| 'Declined' \| 'Expired' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `IQuoteItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 15 more fields* | | | See full Quote definition |

---

### 3. `GET` `/api/v1/books/sales/quotes/:id`

- **Controller / Handler:** `getQuoteById`
- **Route Declaration:** `src/domains/books/routes/quoteRoutes.ts`
- **Primary Data Model:** `Quote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Quote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `quoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `quoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expiryDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Sent' \| 'Accepted' \| 'Declined' \| 'Expired' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `IQuoteItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 15 more fields* | | | See full Quote definition |

---

### 4. `PUT` `/api/v1/books/sales/quotes/:id`

- **Controller / Handler:** `updateQuote`
- **Route Declaration:** `src/domains/books/routes/quoteRoutes.ts`
- **Primary Data Model:** `Quote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "orgId": "Sample orgId",
  "quoteNumber": "Sample quoteNumber",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Quote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `quoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `quoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expiryDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Sent' \| 'Accepted' \| 'Declined' \| 'Expired' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `IQuoteItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 15 more fields* | | | See full Quote definition |

---

### 5. `DELETE` `/api/v1/books/sales/quotes/:id`

- **Controller / Handler:** `deleteQuote`
- **Route Declaration:** `src/domains/books/routes/quoteRoutes.ts`
- **Primary Data Model:** `Quote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Quote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `quoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `quoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expiryDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Sent' \| 'Accepted' \| 'Declined' \| 'Expired' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `IQuoteItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 15 more fields* | | | See full Quote definition |

---


## Sales - Sales Orders

Total APIs in this module: **6**

### 1. `POST` `/api/v1/books/sales/sales-orders`

- **Controller / Handler:** `createSalesOrder`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "quantityFulfilled": 100,
  "isDropShip": true,
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---

### 2. `GET` `/api/v1/books/sales/sales-orders`

- **Controller / Handler:** `getSalesOrders`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---

### 3. `GET` `/api/v1/books/sales/sales-orders/:id`

- **Controller / Handler:** `getSalesOrderById`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---

### 4. `PUT` `/api/v1/books/sales/sales-orders/:id`

- **Controller / Handler:** `updateSalesOrder`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "quantityFulfilled": 100,
  "isDropShip": true,
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---

### 5. `DELETE` `/api/v1/books/sales/sales-orders/:id`

- **Controller / Handler:** `deleteSalesOrder`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---

### 6. `POST` `/api/v1/books/sales/sales-orders/:id/fulfill`

- **Controller / Handler:** `fulfillSalesOrder`
- **Route Declaration:** `src/domains/books/routes/salesOrderRoutes.ts`
- **Primary Data Model:** `SalesOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "quantityFulfilled": 100,
  "isDropShip": true,
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`SalesOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `quantityFulfilled` | `number` | Optional | Standard ERP entity attribute |
| `isDropShip` | `boolean` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `salesOrderDate` | `Date` | **Required** | Standard ERP entity attribute |
| `expectedShipmentDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Cancelled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `items` | `ISalesOrderItem[]` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full SalesOrder definition |

---


## Sales - Invoices

Total APIs in this module: **7**

### 1. `POST` `/api/v1/books/sales/invoices`

- **Controller / Handler:** `createInvoice`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "riskScore": 100,
  "riskFlags": [],
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 2. `GET` `/api/v1/books/sales/invoices`

- **Controller / Handler:** `getInvoices`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 3. `GET` `/api/v1/books/sales/invoices/:id`

- **Controller / Handler:** `getInvoiceById`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 4. `PUT` `/api/v1/books/sales/invoices/:id`

- **Controller / Handler:** `updateInvoice`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "riskScore": 100,
  "riskFlags": [],
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 5. `DELETE` `/api/v1/books/sales/invoices/:id`

- **Controller / Handler:** `deleteInvoice`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 6. `POST` `/api/v1/books/sales/invoices/consolidate`

- **Controller / Handler:** `consolidateInvoices`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "description": "Sample description",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "riskScore": 100,
  "riskFlags": [],
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---

### 7. `GET` `/api/v1/books/sales/invoices/:id/risk-analysis`

- **Controller / Handler:** `analyzeRisk`
- **Route Declaration:** `src/domains/books/routes/invoiceRoutes.ts`
- **Primary Data Model:** `Invoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`Invoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `riskScore` | `number` | Optional | Standard ERP entity attribute |
| `riskFlags` | `string[]` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Invoice definition |

---


## Sales - Recurring Invoices

Total APIs in this module: **5**

### 1. `POST` `/api/v1/books/sales/recurring-invoices`

- **Controller / Handler:** `createRecurringInvoice`
- **Route Declaration:** `src/domains/books/routes/recurringInvoiceRoutes.ts`
- **Primary Data Model:** `RecurringInvoice`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "customer": "Sample customer",
  "repeatEvery": "Sample repeatEvery",
  "startsOn": "2026-10-14T06:47:41.412Z",
  "endsOn": "2026-10-14T06:47:41.412Z",
  "neverExpires": true,
  "paymentTerms": "Sample paymentTerms"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`RecurringInvoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Stopped' \| 'Draft'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| `discountType` | `'amount' \| 'percent'` | Optional | Standard ERP entity attribute |
| `discountValue` | `number` | Optional | Standard ERP entity attribute |
| `discount` | `number` | Optional | Standard ERP entity attribute |
| `taxWithheldType` | `'TDS' \| 'TCS' \| 'none'` | Optional | Standard ERP entity attribute |
| *... and 12 more fields* | | | See full RecurringInvoice definition |

---

### 2. `GET` `/api/v1/books/sales/recurring-invoices`

- **Controller / Handler:** `getRecurringInvoices`
- **Route Declaration:** `src/domains/books/routes/recurringInvoiceRoutes.ts`
- **Primary Data Model:** `RecurringInvoice`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`RecurringInvoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Stopped' \| 'Draft'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| `discountType` | `'amount' \| 'percent'` | Optional | Standard ERP entity attribute |
| `discountValue` | `number` | Optional | Standard ERP entity attribute |
| `discount` | `number` | Optional | Standard ERP entity attribute |
| `taxWithheldType` | `'TDS' \| 'TCS' \| 'none'` | Optional | Standard ERP entity attribute |
| *... and 12 more fields* | | | See full RecurringInvoice definition |

---

### 3. `GET` `/api/v1/books/sales/recurring-invoices/:id`

- **Controller / Handler:** `getRecurringInvoiceById`
- **Route Declaration:** `src/domains/books/routes/recurringInvoiceRoutes.ts`
- **Primary Data Model:** `RecurringInvoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`RecurringInvoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Stopped' \| 'Draft'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| `discountType` | `'amount' \| 'percent'` | Optional | Standard ERP entity attribute |
| `discountValue` | `number` | Optional | Standard ERP entity attribute |
| `discount` | `number` | Optional | Standard ERP entity attribute |
| `taxWithheldType` | `'TDS' \| 'TCS' \| 'none'` | Optional | Standard ERP entity attribute |
| *... and 12 more fields* | | | See full RecurringInvoice definition |

---

### 4. `PUT` `/api/v1/books/sales/recurring-invoices/:id`

- **Controller / Handler:** `updateRecurringInvoice`
- **Route Declaration:** `src/domains/books/routes/recurringInvoiceRoutes.ts`
- **Primary Data Model:** `RecurringInvoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "customer": "Sample customer",
  "repeatEvery": "Sample repeatEvery",
  "startsOn": "2026-10-14T06:47:41.412Z",
  "endsOn": "2026-10-14T06:47:41.412Z",
  "neverExpires": true,
  "paymentTerms": "Sample paymentTerms"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`RecurringInvoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Stopped' \| 'Draft'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| `discountType` | `'amount' \| 'percent'` | Optional | Standard ERP entity attribute |
| `discountValue` | `number` | Optional | Standard ERP entity attribute |
| `discount` | `number` | Optional | Standard ERP entity attribute |
| `taxWithheldType` | `'TDS' \| 'TCS' \| 'none'` | Optional | Standard ERP entity attribute |
| *... and 12 more fields* | | | See full RecurringInvoice definition |

---

### 5. `DELETE` `/api/v1/books/sales/recurring-invoices/:id`

- **Controller / Handler:** `deleteRecurringInvoice`
- **Route Declaration:** `src/domains/books/routes/recurringInvoiceRoutes.ts`
- **Primary Data Model:** `RecurringInvoice`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`RecurringInvoice`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Stopped' \| 'Draft'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| `discountType` | `'amount' \| 'percent'` | Optional | Standard ERP entity attribute |
| `discountValue` | `number` | Optional | Standard ERP entity attribute |
| `discount` | `number` | Optional | Standard ERP entity attribute |
| `taxWithheldType` | `'TDS' \| 'TCS' \| 'none'` | Optional | Standard ERP entity attribute |
| *... and 12 more fields* | | | See full RecurringInvoice definition |

---


## Sales - Delivery Challans

Total APIs in this module: **5**

### 1. `POST` `/api/v1/books/sales/delivery-challans`

- **Controller / Handler:** `createDeliveryChallan`
- **Route Declaration:** `src/domains/books/routes/deliveryChallanRoutes.ts`
- **Primary Data Model:** `DeliveryChallan`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "ewayBillNumber": "Sample ewayBillNumber",
  "dispatchDate": "2026-10-14T06:47:41.412Z",
  "courierName": "Sample courierName",
  "trackingNumber": "Sample trackingNumber",
  "orgId": "Sample orgId",
  "challanNumber": "Sample challanNumber",
  "customer": "Sample customer",
  "referenceNumber": "Sample referenceNumber"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`DeliveryChallan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ewayBillNumber` | `string` | Optional | Standard ERP entity attribute |
| `dispatchDate` | `Date` | Optional | Standard ERP entity attribute |
| `courierName` | `string` | Optional | Standard ERP entity attribute |
| `trackingNumber` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `challanNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `challanDate` | `Date` | **Required** | Standard ERP entity attribute |
| `challanType` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Delivered' \| 'Returned' \| 'Closed'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full DeliveryChallan definition |

---

### 2. `GET` `/api/v1/books/sales/delivery-challans`

- **Controller / Handler:** `getDeliveryChallans`
- **Route Declaration:** `src/domains/books/routes/deliveryChallanRoutes.ts`
- **Primary Data Model:** `DeliveryChallan`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`DeliveryChallan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ewayBillNumber` | `string` | Optional | Standard ERP entity attribute |
| `dispatchDate` | `Date` | Optional | Standard ERP entity attribute |
| `courierName` | `string` | Optional | Standard ERP entity attribute |
| `trackingNumber` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `challanNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `challanDate` | `Date` | **Required** | Standard ERP entity attribute |
| `challanType` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Delivered' \| 'Returned' \| 'Closed'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full DeliveryChallan definition |

---

### 3. `GET` `/api/v1/books/sales/delivery-challans/:id`

- **Controller / Handler:** `getDeliveryChallanById`
- **Route Declaration:** `src/domains/books/routes/deliveryChallanRoutes.ts`
- **Primary Data Model:** `DeliveryChallan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.412Z",
    "updatedAt": "2026-10-14T06:47:41.412Z"
  }
}
```


**Associated Model Schema (`DeliveryChallan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ewayBillNumber` | `string` | Optional | Standard ERP entity attribute |
| `dispatchDate` | `Date` | Optional | Standard ERP entity attribute |
| `courierName` | `string` | Optional | Standard ERP entity attribute |
| `trackingNumber` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `challanNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `challanDate` | `Date` | **Required** | Standard ERP entity attribute |
| `challanType` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Delivered' \| 'Returned' \| 'Closed'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full DeliveryChallan definition |

---

### 4. `PUT` `/api/v1/books/sales/delivery-challans/:id`

- **Controller / Handler:** `updateDeliveryChallan`
- **Route Declaration:** `src/domains/books/routes/deliveryChallanRoutes.ts`
- **Primary Data Model:** `DeliveryChallan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "ewayBillNumber": "Sample ewayBillNumber",
  "dispatchDate": "2026-10-14T06:47:41.413Z",
  "courierName": "Sample courierName",
  "trackingNumber": "Sample trackingNumber",
  "orgId": "Sample orgId",
  "challanNumber": "Sample challanNumber",
  "customer": "Sample customer",
  "referenceNumber": "Sample referenceNumber"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`DeliveryChallan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ewayBillNumber` | `string` | Optional | Standard ERP entity attribute |
| `dispatchDate` | `Date` | Optional | Standard ERP entity attribute |
| `courierName` | `string` | Optional | Standard ERP entity attribute |
| `trackingNumber` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `challanNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `challanDate` | `Date` | **Required** | Standard ERP entity attribute |
| `challanType` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Delivered' \| 'Returned' \| 'Closed'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full DeliveryChallan definition |

---

### 5. `DELETE` `/api/v1/books/sales/delivery-challans/:id`

- **Controller / Handler:** `deleteDeliveryChallan`
- **Route Declaration:** `src/domains/books/routes/deliveryChallanRoutes.ts`
- **Primary Data Model:** `DeliveryChallan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`DeliveryChallan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ewayBillNumber` | `string` | Optional | Standard ERP entity attribute |
| `dispatchDate` | `Date` | Optional | Standard ERP entity attribute |
| `courierName` | `string` | Optional | Standard ERP entity attribute |
| `trackingNumber` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `challanNumber` | `string` | **Required** | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `challanDate` | `Date` | **Required** | Standard ERP entity attribute |
| `challanType` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Delivered' \| 'Returned' \| 'Closed'` | **Required** | Standard ERP entity attribute |
| `items` | `IInvoiceItem[]` | **Required** | Standard ERP entity attribute |
| `subTotal` | `number` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full DeliveryChallan definition |

---


## Sales - Payments Received

Total APIs in this module: **7**

### 1. `POST` `/api/v1/books/sales/payments-received`

- **Controller / Handler:** `createPaymentReceived`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 2. `GET` `/api/v1/books/sales/payments-received`

- **Controller / Handler:** `getPaymentsReceived`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 3. `GET` `/api/v1/books/sales/payments-received/:id`

- **Controller / Handler:** `getPaymentReceivedById`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 4. `PUT` `/api/v1/books/sales/payments-received/:id`

- **Controller / Handler:** `updatePaymentReceived`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 5. `DELETE` `/api/v1/books/sales/payments-received/:id`

- **Controller / Handler:** `deletePaymentReceived`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 6. `POST` `/api/v1/books/sales/payments-received/gateway-payment`

- **Controller / Handler:** `processGatewayPayment`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---

### 7. `POST` `/api/v1/books/sales/payments-received/allocate-credit-note/:creditNoteId`

- **Controller / Handler:** `autoAllocateCreditNote`
- **Route Declaration:** `src/domains/books/routes/paymentReceivedRoutes.ts`
- **Primary Data Model:** `PaymentReceived`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `creditNoteId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PaymentReceived`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `unusedAmount` | `number` | Optional | Standard ERP entity attribute |
| `bankCharges` | `number` | Optional | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `depositTo` | `string` | Optional | Standard ERP entity attribute |
| *... and 7 more fields* | | | See full PaymentReceived definition |

---


## Sales - Credit Notes

Total APIs in this module: **5**

### 1. `POST` `/api/v1/books/sales/credit-notes`

- **Controller / Handler:** `createCreditNote`
- **Route Declaration:** `src/domains/books/routes/creditNoteRoutes.ts`
- **Primary Data Model:** `CreditNote`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer",
  "creditNoteNumber": "Sample creditNoteNumber",
  "referenceNumber": "Sample referenceNumber",
  "invoiceId": "Sample invoiceId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`CreditNote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `creditNoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `salesperson` | `string` | Optional | Standard ERP entity attribute |
| `creditNoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Void'` | **Required** | Standard ERP entity attribute |
| `refunds` | `{ date: Date` | Optional | Standard ERP entity attribute |
| `appliedToInvoices` | `{ invoiceId: mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `{` | **Required** | Standard ERP entity attribute |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 5 more fields* | | | See full CreditNote definition |

---

### 2. `GET` `/api/v1/books/sales/credit-notes`

- **Controller / Handler:** `getCreditNotes`
- **Route Declaration:** `src/domains/books/routes/creditNoteRoutes.ts`
- **Primary Data Model:** `CreditNote`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`CreditNote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `creditNoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `salesperson` | `string` | Optional | Standard ERP entity attribute |
| `creditNoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Void'` | **Required** | Standard ERP entity attribute |
| `refunds` | `{ date: Date` | Optional | Standard ERP entity attribute |
| `appliedToInvoices` | `{ invoiceId: mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `{` | **Required** | Standard ERP entity attribute |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 5 more fields* | | | See full CreditNote definition |

---

### 3. `GET` `/api/v1/books/sales/credit-notes/:id`

- **Controller / Handler:** `getCreditNoteById`
- **Route Declaration:** `src/domains/books/routes/creditNoteRoutes.ts`
- **Primary Data Model:** `CreditNote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`CreditNote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `creditNoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `salesperson` | `string` | Optional | Standard ERP entity attribute |
| `creditNoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Void'` | **Required** | Standard ERP entity attribute |
| `refunds` | `{ date: Date` | Optional | Standard ERP entity attribute |
| `appliedToInvoices` | `{ invoiceId: mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `{` | **Required** | Standard ERP entity attribute |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 5 more fields* | | | See full CreditNote definition |

---

### 4. `PUT` `/api/v1/books/sales/credit-notes/:id`

- **Controller / Handler:** `updateCreditNote`
- **Route Declaration:** `src/domains/books/routes/creditNoteRoutes.ts`
- **Primary Data Model:** `CreditNote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "currency": "Sample currency",
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "customer": "Sample customer",
  "creditNoteNumber": "Sample creditNoteNumber",
  "referenceNumber": "Sample referenceNumber",
  "invoiceId": "Sample invoiceId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`CreditNote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `creditNoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `salesperson` | `string` | Optional | Standard ERP entity attribute |
| `creditNoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Void'` | **Required** | Standard ERP entity attribute |
| `refunds` | `{ date: Date` | Optional | Standard ERP entity attribute |
| `appliedToInvoices` | `{ invoiceId: mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `{` | **Required** | Standard ERP entity attribute |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 5 more fields* | | | See full CreditNote definition |

---

### 5. `DELETE` `/api/v1/books/sales/credit-notes/:id`

- **Controller / Handler:** `deleteCreditNote`
- **Route Declaration:** `src/domains/books/routes/creditNoteRoutes.ts`
- **Primary Data Model:** `CreditNote`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`CreditNote`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `creditNoteNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `salesperson` | `string` | Optional | Standard ERP entity attribute |
| `creditNoteDate` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Open' \| 'Closed' \| 'Void'` | **Required** | Standard ERP entity attribute |
| `refunds` | `{ date: Date` | Optional | Standard ERP entity attribute |
| `appliedToInvoices` | `{ invoiceId: mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `items` | `{` | **Required** | Standard ERP entity attribute |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 5 more fields* | | | See full CreditNote definition |

---


## Purchases - Vendors

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/purchases/vendors`

- **Controller / Handler:** `getVendors`
- **Route Declaration:** `src/domains/books/routes/vendorRoutes.ts`
- **Primary Data Model:** `Vendor`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Vendor`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | **Required** | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | **Required** | Standard ERP entity attribute |
| `lastName` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `designation` | `string` | Optional | Standard ERP entity attribute |
| `label` | `string` | **Required** | Standard ERP entity attribute |
| `value` | `string` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full Vendor definition |

---

### 2. `POST` `/api/v1/books/purchases/vendors`

- **Controller / Handler:** `createVendor`
- **Route Declaration:** `src/domains/books/routes/vendorRoutes.ts`
- **Primary Data Model:** `Vendor`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "attention": "Sample attention",
  "country": "Sample country",
  "street1": "Sample street1",
  "street2": "Sample street2",
  "city": "Sample city",
  "state": "Sample state",
  "zipCode": "Sample zipCode",
  "phone": "Sample phone"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Vendor`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | **Required** | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | **Required** | Standard ERP entity attribute |
| `lastName` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `designation` | `string` | Optional | Standard ERP entity attribute |
| `label` | `string` | **Required** | Standard ERP entity attribute |
| `value` | `string` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full Vendor definition |

---

### 3. `GET` `/api/v1/books/purchases/vendors/:id`

- **Controller / Handler:** `getVendorById`
- **Route Declaration:** `src/domains/books/routes/vendorRoutes.ts`
- **Primary Data Model:** `Vendor`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Vendor`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | **Required** | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | **Required** | Standard ERP entity attribute |
| `lastName` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `designation` | `string` | Optional | Standard ERP entity attribute |
| `label` | `string` | **Required** | Standard ERP entity attribute |
| `value` | `string` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full Vendor definition |

---

### 4. `PUT` `/api/v1/books/purchases/vendors/:id`

- **Controller / Handler:** `updateVendor`
- **Route Declaration:** `src/domains/books/routes/vendorRoutes.ts`
- **Primary Data Model:** `Vendor`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "attention": "Sample attention",
  "country": "Sample country",
  "street1": "Sample street1",
  "street2": "Sample street2",
  "city": "Sample city",
  "state": "Sample state",
  "zipCode": "Sample zipCode",
  "phone": "Sample phone"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Vendor`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | **Required** | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | **Required** | Standard ERP entity attribute |
| `lastName` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `designation` | `string` | Optional | Standard ERP entity attribute |
| `label` | `string` | **Required** | Standard ERP entity attribute |
| `value` | `string` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full Vendor definition |

---

### 5. `POST` `/api/v1/books/purchases/vendors/:id/onboarding`

- **Controller / Handler:** `updateVendorOnboarding`
- **Route Declaration:** `src/domains/books/routes/vendorRoutes.ts`
- **Primary Data Model:** `Vendor`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "attention": "Sample attention",
  "country": "Sample country",
  "street1": "Sample street1",
  "street2": "Sample street2",
  "city": "Sample city",
  "state": "Sample state",
  "zipCode": "Sample zipCode",
  "phone": "Sample phone"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Vendor`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | **Required** | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | **Required** | Standard ERP entity attribute |
| `lastName` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | **Required** | Standard ERP entity attribute |
| `designation` | `string` | Optional | Standard ERP entity attribute |
| `label` | `string` | **Required** | Standard ERP entity attribute |
| `value` | `string` | **Required** | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full Vendor definition |

---


## Purchases - Expenses

Total APIs in this module: **8**

### 1. `GET` `/api/v1/books/purchases/expenses`

- **Controller / Handler:** `getExpenses`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 2. `POST` `/api/v1/books/purchases/expenses`

- **Controller / Handler:** `createExpense`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "expenseAccount": "Sample expenseAccount",
  "notes": "Sample notes",
  "amount": 100,
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "branchId": "Sample branchId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 3. `POST` `/api/v1/books/purchases/expenses/bulk`

- **Controller / Handler:** `createBulkExpenses`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "expenseAccount": "Sample expenseAccount",
  "notes": "Sample notes",
  "amount": 100,
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "branchId": "Sample branchId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 4. `GET` `/api/v1/books/purchases/expenses/bulk/:batchId`

- **Controller / Handler:** `getBulkExpenses`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `batchId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 5. `PUT` `/api/v1/books/purchases/expenses/bulk/:batchId`

- **Controller / Handler:** `updateBulkExpenses`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `batchId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "expenseAccount": "Sample expenseAccount",
  "notes": "Sample notes",
  "amount": 100,
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "branchId": "Sample branchId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 6. `GET` `/api/v1/books/purchases/expenses/:id`

- **Controller / Handler:** `getExpenseById`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 7. `PUT` `/api/v1/books/purchases/expenses/:id`

- **Controller / Handler:** `updateExpense`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "expenseAccount": "Sample expenseAccount",
  "notes": "Sample notes",
  "amount": 100,
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "branchId": "Sample branchId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---

### 8. `DELETE` `/api/v1/books/purchases/expenses/:id`

- **Controller / Handler:** `deleteExpense`
- **Route Declaration:** `src/domains/books/routes/expenseRoutes.ts`
- **Primary Data Model:** `Expense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`Expense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expenseAccount` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `expenseType` | `'Goods' \| 'Mileage'` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `taxAmount` | `number` | Optional | Standard ERP entity attribute |
| `totalAmount` | `number` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| *... and 14 more fields* | | | See full Expense definition |

---


## Purchases - Recurring Expenses

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/purchases/recurring-expenses`

- **Controller / Handler:** `getRecurringExpenses`
- **Route Declaration:** `src/domains/books/routes/recurringExpenseRoutes.ts`
- **Primary Data Model:** `RecurringExpense`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`RecurringExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Stopped' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| *... and 2 more fields* | | | See full RecurringExpense definition |

---

### 2. `POST` `/api/v1/books/purchases/recurring-expenses`

- **Controller / Handler:** `createRecurringExpense`
- **Route Declaration:** `src/domains/books/routes/recurringExpenseRoutes.ts`
- **Primary Data Model:** `RecurringExpense`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "repeatEvery": "Sample repeatEvery",
  "startsOn": "2026-10-14T06:47:41.413Z",
  "endsOn": "2026-10-14T06:47:41.413Z",
  "expenseAccount": "Sample expenseAccount",
  "amount": 100,
  "paidThrough": "Sample paidThrough"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`RecurringExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Stopped' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| *... and 2 more fields* | | | See full RecurringExpense definition |

---

### 3. `GET` `/api/v1/books/purchases/recurring-expenses/:id`

- **Controller / Handler:** `getRecurringExpenseById`
- **Route Declaration:** `src/domains/books/routes/recurringExpenseRoutes.ts`
- **Primary Data Model:** `RecurringExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`RecurringExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Stopped' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| *... and 2 more fields* | | | See full RecurringExpense definition |

---

### 4. `PUT` `/api/v1/books/purchases/recurring-expenses/:id`

- **Controller / Handler:** `updateRecurringExpense`
- **Route Declaration:** `src/domains/books/routes/recurringExpenseRoutes.ts`
- **Primary Data Model:** `RecurringExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "repeatEvery": "Sample repeatEvery",
  "startsOn": "2026-10-14T06:47:41.413Z",
  "endsOn": "2026-10-14T06:47:41.413Z",
  "expenseAccount": "Sample expenseAccount",
  "amount": 100,
  "paidThrough": "Sample paidThrough"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`RecurringExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Stopped' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| *... and 2 more fields* | | | See full RecurringExpense definition |

---

### 5. `DELETE` `/api/v1/books/purchases/recurring-expenses/:id`

- **Controller / Handler:** `deleteRecurringExpense`
- **Route Declaration:** `src/domains/books/routes/recurringExpenseRoutes.ts`
- **Primary Data Model:** `RecurringExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`RecurringExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Stopped' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| *... and 2 more fields* | | | See full RecurringExpense definition |

---


## Purchases - Purchase Orders

Total APIs in this module: **7**

### 1. `GET` `/api/v1/books/purchases/purchase-orders`

- **Controller / Handler:** `getPurchaseOrders`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/purchases/purchase-orders`

- **Controller / Handler:** `createPurchaseOrder`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "itemDetails": "Sample itemDetails",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "poType": "Sample poType",
  "approvalStatus": "Sample approvalStatus"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/purchases/purchase-orders/:id`

- **Controller / Handler:** `getPurchaseOrderById`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/purchases/purchase-orders/:id`

- **Controller / Handler:** `updatePurchaseOrder`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "itemDetails": "Sample itemDetails",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "poType": "Sample poType",
  "approvalStatus": "Sample approvalStatus"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/purchases/purchase-orders/:id`

- **Controller / Handler:** `deletePurchaseOrder`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 6. `POST` `/api/v1/books/purchases/purchase-orders/:id/request-approval`

- **Controller / Handler:** `requestPOApproval`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "itemDetails": "Sample itemDetails",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "poType": "Sample poType",
  "approvalStatus": "Sample approvalStatus"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.413Z",
    "updatedAt": "2026-10-14T06:47:41.413Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---

### 7. `POST` `/api/v1/books/purchases/purchase-orders/:id/approve`

- **Controller / Handler:** `approvePOManager`
- **Route Declaration:** `src/domains/books/routes/purchaseOrderRoutes.ts`
- **Primary Data Model:** `PurchaseOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "itemDetails": "Sample itemDetails",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "amount": 100,
  "poType": "Sample poType",
  "approvalStatus": "Sample approvalStatus"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PurchaseOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `itemDetails` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `poType` | `'Standard' \| 'Blanket'` | Optional | Standard ERP entity attribute |
| `approvalStatus` | `'Pending' \| 'ManagerApproved' \| 'DirectorApproved' \| 'Rejected'` | Optional | Standard ERP entity attribute |
| `blanketDetails` | `{` | Optional | Standard ERP entity attribute |
| `maxAmount` | `number` | **Required** | Standard ERP entity attribute |
| `validUntil` | `Date` | **Required** | Standard ERP entity attribute |
| `amountUtilized` | `number` | **Required** | Standard ERP entity attribute |

---


## Purchases - Bills

Total APIs in this module: **6**

### 1. `POST` `/api/v1/books/purchases/bills/ocr`

- **Controller / Handler:** `processBillOCR`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "discount": 100,
  "customerId": "Sample customerId",
  "amount": 100,
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---

### 2. `GET` `/api/v1/books/purchases/bills`

- **Controller / Handler:** `getBills`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---

### 3. `POST` `/api/v1/books/purchases/bills`

- **Controller / Handler:** `createBill`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "discount": 100,
  "customerId": "Sample customerId",
  "amount": 100,
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---

### 4. `GET` `/api/v1/books/purchases/bills/:id`

- **Controller / Handler:** `getBillById`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---

### 5. `PUT` `/api/v1/books/purchases/bills/:id`

- **Controller / Handler:** `updateBill`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "discount": 100,
  "customerId": "Sample customerId",
  "amount": 100,
  "taxConfigurationId": "Sample taxConfigurationId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---

### 6. `DELETE` `/api/v1/books/purchases/bills/:id`

- **Controller / Handler:** `deleteBill`
- **Route Declaration:** `src/domains/books/routes/billRoutes.ts`
- **Primary Data Model:** `Bill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Bill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `discount` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| *... and 18 more fields* | | | See full Bill definition |

---


## Purchases - Recurring Bills

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/purchases/recurring-bills`

- **Controller / Handler:** `getRecurringBills`
- **Route Declaration:** `src/domains/books/routes/recurringBillRoutes.ts`
- **Primary Data Model:** `RecurringBill`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`RecurringBill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountsPayable` | `string` | **Required** | Standard ERP entity attribute |
| *... and 13 more fields* | | | See full RecurringBill definition |

---

### 2. `POST` `/api/v1/books/purchases/recurring-bills`

- **Controller / Handler:** `createRecurringBill`
- **Route Declaration:** `src/domains/books/routes/recurringBillRoutes.ts`
- **Primary Data Model:** `RecurringBill`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "customerId": "Sample customerId",
  "amount": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`RecurringBill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountsPayable` | `string` | **Required** | Standard ERP entity attribute |
| *... and 13 more fields* | | | See full RecurringBill definition |

---

### 3. `GET` `/api/v1/books/purchases/recurring-bills/:id`

- **Controller / Handler:** `getRecurringBillById`
- **Route Declaration:** `src/domains/books/routes/recurringBillRoutes.ts`
- **Primary Data Model:** `RecurringBill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`RecurringBill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountsPayable` | `string` | **Required** | Standard ERP entity attribute |
| *... and 13 more fields* | | | See full RecurringBill definition |

---

### 4. `PUT` `/api/v1/books/purchases/recurring-bills/:id`

- **Controller / Handler:** `updateRecurringBill`
- **Route Declaration:** `src/domains/books/routes/recurringBillRoutes.ts`
- **Primary Data Model:** `RecurringBill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemId": "Sample itemId",
  "account": "Sample account",
  "quantity": 100,
  "rate": 100,
  "customerId": "Sample customerId",
  "amount": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`RecurringBill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountsPayable` | `string` | **Required** | Standard ERP entity attribute |
| *... and 13 more fields* | | | See full RecurringBill definition |

---

### 5. `DELETE` `/api/v1/books/purchases/recurring-bills/:id`

- **Controller / Handler:** `deleteRecurringBill`
- **Route Declaration:** `src/domains/books/routes/recurringBillRoutes.ts`
- **Primary Data Model:** `RecurringBill`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`RecurringBill`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `repeatEvery` | `string` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `taxConfigurationId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `neverExpires` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountsPayable` | `string` | **Required** | Standard ERP entity attribute |
| *... and 13 more fields* | | | See full RecurringBill definition |

---


## Purchases - Payments Made

Total APIs in this module: **7**

### 1. `GET` `/api/v1/books/purchases/payments-made`

- **Controller / Handler:** `getPaymentsMade`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 2. `POST` `/api/v1/books/purchases/payments-made`

- **Controller / Handler:** `createPaymentMade`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId",
  "paymentType": "Sample paymentType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 3. `POST` `/api/v1/books/purchases/payments-made/:id/disburse`

- **Controller / Handler:** `processDisbursement`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId",
  "paymentType": "Sample paymentType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 4. `POST` `/api/v1/books/purchases/payments-made/:id/remittance`

- **Controller / Handler:** `sendRemittanceAdvice`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId",
  "paymentType": "Sample paymentType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 5. `GET` `/api/v1/books/purchases/payments-made/:id`

- **Controller / Handler:** `getPaymentMadeById`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 6. `PUT` `/api/v1/books/purchases/payments-made/:id`

- **Controller / Handler:** `updatePaymentMade`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "branchId": "Sample branchId",
  "projectId": "Sample projectId",
  "reportingTagIds": [],
  "exchangeRate": 100,
  "baseTotal": 100,
  "orgId": "Sample orgId",
  "vendorId": "Sample vendorId",
  "paymentType": "Sample paymentType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---

### 7. `DELETE` `/api/v1/books/purchases/payments-made/:id`

- **Controller / Handler:** `deletePaymentMade`
- **Route Declaration:** `src/domains/books/routes/paymentMadeRoutes.ts`
- **Primary Data Model:** `PaymentMade`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`PaymentMade`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `branchId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `reportingTagIds` | `(mongoose.Types.ObjectId \| string)[]` | Optional | Standard ERP entity attribute |
| `exchangeRate` | `number` | Optional | Standard ERP entity attribute |
| `baseTotal` | `number` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `paymentType` | `'Bill Payment' \| 'Vendor Advance'` | **Required** | Standard ERP entity attribute |
| `paymentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `paymentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `paymentMode` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| *... and 9 more fields* | | | See full PaymentMade definition |

---


## Purchases - Mileage

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/purchases/mileage`

- **Controller / Handler:** `getMileageExpenses`
- **Route Declaration:** `src/domains/books/routes/mileageExpenseRoutes.ts`
- **Primary Data Model:** `MileageExpense`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`MileageExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Non-Billable' \| 'Unbilled' \| 'Invoiced' \| 'Reimbursed'` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full MileageExpense definition |

---

### 2. `POST` `/api/v1/books/purchases/mileage`

- **Controller / Handler:** `createMileageExpense`
- **Route Declaration:** `src/domains/books/routes/mileageExpenseRoutes.ts`
- **Primary Data Model:** `MileageExpense`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "date": "2026-10-14T06:47:41.414Z",
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "amount": 100,
  "expenseAccount": "Sample expenseAccount"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`MileageExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Non-Billable' \| 'Unbilled' \| 'Invoiced' \| 'Reimbursed'` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full MileageExpense definition |

---

### 3. `GET` `/api/v1/books/purchases/mileage/:id`

- **Controller / Handler:** `getMileageExpenseById`
- **Route Declaration:** `src/domains/books/routes/mileageExpenseRoutes.ts`
- **Primary Data Model:** `MileageExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`MileageExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Non-Billable' \| 'Unbilled' \| 'Invoiced' \| 'Reimbursed'` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full MileageExpense definition |

---

### 4. `PUT` `/api/v1/books/purchases/mileage/:id`

- **Controller / Handler:** `updateMileageExpense`
- **Route Declaration:** `src/domains/books/routes/mileageExpenseRoutes.ts`
- **Primary Data Model:** `MileageExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "date": "2026-10-14T06:47:41.414Z",
  "distance": 100,
  "rate": 100,
  "unit": "Sample unit",
  "employee": "Sample employee",
  "amount": 100,
  "expenseAccount": "Sample expenseAccount"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`MileageExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Non-Billable' \| 'Unbilled' \| 'Invoiced' \| 'Reimbursed'` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full MileageExpense definition |

---

### 5. `DELETE` `/api/v1/books/purchases/mileage/:id`

- **Controller / Handler:** `deleteMileageExpense`
- **Route Declaration:** `src/domains/books/routes/mileageExpenseRoutes.ts`
- **Primary Data Model:** `MileageExpense`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`MileageExpense`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `distance` | `number` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `unit` | `'km' \| 'mile'` | **Required** | Standard ERP entity attribute |
| `employee` | `string` | Optional | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `expenseAccount` | `string` | **Required** | Standard ERP entity attribute |
| `paidThrough` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| `vendorId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `customerId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | Optional | Standard ERP entity attribute |
| `status` | `'Non-Billable' \| 'Unbilled' \| 'Invoiced' \| 'Reimbursed'` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full MileageExpense definition |

---


## Inventory - Items & Products

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/items`

- **Controller / Handler:** `getItems`
- **Route Declaration:** `src/domains/books/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 2. `POST` `/api/v1/books/items`

- **Controller / Handler:** `createItem`
- **Route Declaration:** `src/domains/books/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemClass": "Sample itemClass",
  "trackingType": "Sample trackingType",
  "valuationMethod": "Sample valuationMethod",
  "barcode": "Sample barcode",
  "dimensions": 100,
  "weight": 100,
  "reorderPoint": 100,
  "safetyStock": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 3. `GET` `/api/v1/books/items/:id`

- **Controller / Handler:** `getItemById`
- **Route Declaration:** `src/domains/books/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 4. `PUT` `/api/v1/books/items/:id`

- **Controller / Handler:** `updateItem`
- **Route Declaration:** `src/domains/books/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemClass": "Sample itemClass",
  "trackingType": "Sample trackingType",
  "valuationMethod": "Sample valuationMethod",
  "barcode": "Sample barcode",
  "dimensions": 100,
  "weight": 100,
  "reorderPoint": 100,
  "safetyStock": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 5. `POST` `/api/v1/books/items/:id/assemble`

- **Controller / Handler:** `assembleKit`
- **Route Declaration:** `src/domains/books/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemClass": "Sample itemClass",
  "trackingType": "Sample trackingType",
  "valuationMethod": "Sample valuationMethod",
  "barcode": "Sample barcode",
  "dimensions": 100,
  "weight": 100,
  "reorderPoint": 100,
  "safetyStock": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---


## Inventory - Adjustments

Total APIs in this module: **4**

### 1. `GET` `/api/v1/books/inventory-adjustments`

- **Controller / Handler:** `getAdjustments`
- **Route Declaration:** `src/domains/books/routes/inventoryAdjustmentRoutes.ts`
- **Primary Data Model:** `InventoryAdjustment`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`InventoryAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantityAdjusted` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `mode` | `'quantity' \| 'value'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `items` | `IAdjustmentItem[]` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory-adjustments`

- **Controller / Handler:** `createAdjustment`
- **Route Declaration:** `src/domains/books/routes/inventoryAdjustmentRoutes.ts`
- **Primary Data Model:** `InventoryAdjustment`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "quantityAdjusted": 100,
  "orgId": "Sample orgId",
  "mode": "Sample mode",
  "referenceNumber": "Sample referenceNumber",
  "date": "2026-10-14T06:47:41.414Z",
  "reason": "Sample reason",
  "description": "Sample description"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`InventoryAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantityAdjusted` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `mode` | `'quantity' \| 'value'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `items` | `IAdjustmentItem[]` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory-adjustments/:id`

- **Controller / Handler:** `getAdjustmentById`
- **Route Declaration:** `src/domains/books/routes/inventoryAdjustmentRoutes.ts`
- **Primary Data Model:** `InventoryAdjustment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`InventoryAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantityAdjusted` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `mode` | `'quantity' \| 'value'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `items` | `IAdjustmentItem[]` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory-adjustments/:id`

- **Controller / Handler:** `updateAdjustment`
- **Route Declaration:** `src/domains/books/routes/inventoryAdjustmentRoutes.ts`
- **Primary Data Model:** `InventoryAdjustment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "item": "Sample item",
  "quantityAdjusted": 100,
  "orgId": "Sample orgId",
  "mode": "Sample mode",
  "referenceNumber": "Sample referenceNumber",
  "date": "2026-10-14T06:47:41.414Z",
  "reason": "Sample reason",
  "description": "Sample description"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.414Z",
    "updatedAt": "2026-10-14T06:47:41.414Z"
  }
}
```


**Associated Model Schema (`InventoryAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantityAdjusted` | `number` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `mode` | `'quantity' \| 'value'` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `items` | `IAdjustmentItem[]` | **Required** | Standard ERP entity attribute |
| `createdBy` | `string` | Optional | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---


## Inventory - Warehouses

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/inventory/warehouses`

- **Controller / Handler:** `getWarehouses`
- **Route Declaration:** `src/domains/books/routes/warehouseRoutes.ts`
- **Primary Data Model:** `Warehouse`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Warehouse`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `code` | `string` | **Required** | Standard ERP entity attribute |
| `address` | `string` | **Required** | Standard ERP entity attribute |
| `bins` | `{ code: string` | **Required** | Standard ERP entity attribute |
| `status` | `'Active' \| 'Inactive'` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/warehouses`

- **Controller / Handler:** `createWarehouse`
- **Route Declaration:** `src/domains/books/routes/warehouseRoutes.ts`
- **Primary Data Model:** `Warehouse`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "code": "Sample code",
  "address": "Sample address",
  "bins": "Sample bins",
  "status": "Sample status"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Warehouse`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `code` | `string` | **Required** | Standard ERP entity attribute |
| `address` | `string` | **Required** | Standard ERP entity attribute |
| `bins` | `{ code: string` | **Required** | Standard ERP entity attribute |
| `status` | `'Active' \| 'Inactive'` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory/warehouses/:id`

- **Controller / Handler:** `getWarehouseById`
- **Route Declaration:** `src/domains/books/routes/warehouseRoutes.ts`
- **Primary Data Model:** `Warehouse`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Warehouse`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `code` | `string` | **Required** | Standard ERP entity attribute |
| `address` | `string` | **Required** | Standard ERP entity attribute |
| `bins` | `{ code: string` | **Required** | Standard ERP entity attribute |
| `status` | `'Active' \| 'Inactive'` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory/warehouses/:id`

- **Controller / Handler:** `updateWarehouse`
- **Route Declaration:** `src/domains/books/routes/warehouseRoutes.ts`
- **Primary Data Model:** `Warehouse`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "code": "Sample code",
  "address": "Sample address",
  "bins": "Sample bins",
  "status": "Sample status"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Warehouse`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `code` | `string` | **Required** | Standard ERP entity attribute |
| `address` | `string` | **Required** | Standard ERP entity attribute |
| `bins` | `{ code: string` | **Required** | Standard ERP entity attribute |
| `status` | `'Active' \| 'Inactive'` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/inventory/warehouses/:id`

- **Controller / Handler:** `deleteWarehouse`
- **Route Declaration:** `src/domains/books/routes/warehouseRoutes.ts`
- **Primary Data Model:** `Warehouse`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Warehouse`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `code` | `string` | **Required** | Standard ERP entity attribute |
| `address` | `string` | **Required** | Standard ERP entity attribute |
| `bins` | `{ code: string` | **Required** | Standard ERP entity attribute |
| `status` | `'Active' \| 'Inactive'` | **Required** | Standard ERP entity attribute |

---


## Inventory - Transfer Orders

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/inventory/transfer-orders`

- **Controller / Handler:** `getTransferOrders`
- **Route Declaration:** `src/domains/books/routes/transferOrderRoutes.ts`
- **Primary Data Model:** `TransferOrder`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`TransferOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `transferNumber` | `string` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `fromWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `toWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'In Transit' \| 'Received'` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/transfer-orders`

- **Controller / Handler:** `createTransferOrder`
- **Route Declaration:** `src/domains/books/routes/transferOrderRoutes.ts`
- **Primary Data Model:** `TransferOrder`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "transferNumber": "Sample transferNumber",
  "date": "2026-10-14T06:47:41.415Z",
  "fromWarehouse": "Sample fromWarehouse",
  "toWarehouse": "Sample toWarehouse",
  "status": "Sample status",
  "items": "Sample items"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`TransferOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `transferNumber` | `string` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `fromWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `toWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'In Transit' \| 'Received'` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory/transfer-orders/:id`

- **Controller / Handler:** `getTransferOrderById`
- **Route Declaration:** `src/domains/books/routes/transferOrderRoutes.ts`
- **Primary Data Model:** `TransferOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`TransferOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `transferNumber` | `string` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `fromWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `toWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'In Transit' \| 'Received'` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory/transfer-orders/:id`

- **Controller / Handler:** `updateTransferOrder`
- **Route Declaration:** `src/domains/books/routes/transferOrderRoutes.ts`
- **Primary Data Model:** `TransferOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "transferNumber": "Sample transferNumber",
  "date": "2026-10-14T06:47:41.415Z",
  "fromWarehouse": "Sample fromWarehouse",
  "toWarehouse": "Sample toWarehouse",
  "status": "Sample status",
  "items": "Sample items"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`TransferOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `transferNumber` | `string` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `fromWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `toWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'In Transit' \| 'Received'` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/inventory/transfer-orders/:id`

- **Controller / Handler:** `deleteTransferOrder`
- **Route Declaration:** `src/domains/books/routes/transferOrderRoutes.ts`
- **Primary Data Model:** `TransferOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`TransferOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `transferNumber` | `string` | **Required** | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `fromWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `toWarehouse` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'In Transit' \| 'Received'` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---


## Inventory - Shipments

Total APIs in this module: **6**

### 1. `GET` `/api/v1/books/inventory/shipments`

- **Controller / Handler:** `getShipments`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/shipments`

- **Controller / Handler:** `createShipment`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "shipmentNumber": "Sample shipmentNumber",
  "salesOrderId": "Sample salesOrderId",
  "date": "2026-10-14T06:47:41.415Z",
  "status": "Sample status",
  "carrier": "Sample carrier",
  "trackingNumber": "Sample trackingNumber",
  "shippingCost": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 3. `POST` `/api/v1/books/inventory/shipments/:id/carrier`

- **Controller / Handler:** `integrateCarrier`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "shipmentNumber": "Sample shipmentNumber",
  "salesOrderId": "Sample salesOrderId",
  "date": "2026-10-14T06:47:41.415Z",
  "status": "Sample status",
  "carrier": "Sample carrier",
  "trackingNumber": "Sample trackingNumber",
  "shippingCost": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 4. `GET` `/api/v1/books/inventory/shipments/:id`

- **Controller / Handler:** `getShipmentById`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 5. `PUT` `/api/v1/books/inventory/shipments/:id`

- **Controller / Handler:** `updateShipment`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "shipmentNumber": "Sample shipmentNumber",
  "salesOrderId": "Sample salesOrderId",
  "date": "2026-10-14T06:47:41.415Z",
  "status": "Sample status",
  "carrier": "Sample carrier",
  "trackingNumber": "Sample trackingNumber",
  "shippingCost": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---

### 6. `DELETE` `/api/v1/books/inventory/shipments/:id`

- **Controller / Handler:** `deleteShipment`
- **Route Declaration:** `src/domains/books/routes/shipmentRoutes.ts`
- **Primary Data Model:** `Shipment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Shipment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `shipmentNumber` | `string` | **Required** | Standard ERP entity attribute |
| `salesOrderId` | `mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `status` | `'Draft' \| 'Picked' \| 'Packed' \| 'Shipped' \| 'Delivered'` | **Required** | Standard ERP entity attribute |
| `carrier` | `string` | **Required** | Standard ERP entity attribute |
| `trackingNumber` | `string` | **Required** | Standard ERP entity attribute |
| `shippingCost` | `number` | **Required** | Standard ERP entity attribute |
| `items` | `{ item: mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |

---


## Manufacturing - Machines

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/inventory/machines`

- **Controller / Handler:** `getMachines`
- **Route Declaration:** `src/domains/books/routes/machineRoutes.ts`
- **Primary Data Model:** `Machine`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Machine`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `status` | `'Available' \| 'Maintenance' \| 'Offline'` | **Required** | Standard ERP entity attribute |
| `capacityPerHour` | `number` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/machines`

- **Controller / Handler:** `createMachine`
- **Route Declaration:** `src/domains/books/routes/machineRoutes.ts`
- **Primary Data Model:** `Machine`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "status": "Sample status",
  "capacityPerHour": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Machine`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `status` | `'Available' \| 'Maintenance' \| 'Offline'` | **Required** | Standard ERP entity attribute |
| `capacityPerHour` | `number` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory/machines/:id`

- **Controller / Handler:** `getMachineById`
- **Route Declaration:** `src/domains/books/routes/machineRoutes.ts`
- **Primary Data Model:** `Machine`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Machine`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `status` | `'Available' \| 'Maintenance' \| 'Offline'` | **Required** | Standard ERP entity attribute |
| `capacityPerHour` | `number` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory/machines/:id`

- **Controller / Handler:** `updateMachine`
- **Route Declaration:** `src/domains/books/routes/machineRoutes.ts`
- **Primary Data Model:** `Machine`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "status": "Sample status",
  "capacityPerHour": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Machine`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `status` | `'Available' \| 'Maintenance' \| 'Offline'` | **Required** | Standard ERP entity attribute |
| `capacityPerHour` | `number` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/inventory/machines/:id`

- **Controller / Handler:** `deleteMachine`
- **Route Declaration:** `src/domains/books/routes/machineRoutes.ts`
- **Primary Data Model:** `Machine`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Machine`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `status` | `'Available' \| 'Maintenance' \| 'Offline'` | **Required** | Standard ERP entity attribute |
| `capacityPerHour` | `number` | **Required** | Standard ERP entity attribute |

---


## Manufacturing - Routings

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/inventory/routings`

- **Controller / Handler:** `getRoutings`
- **Route Declaration:** `src/domains/books/routes/routingRoutes.ts`
- **Primary Data Model:** `Routing`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Routing`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `operations` | `{ stepNumber: number` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/routings`

- **Controller / Handler:** `createRouting`
- **Route Declaration:** `src/domains/books/routes/routingRoutes.ts`
- **Primary Data Model:** `Routing`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "operations": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Routing`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `operations` | `{ stepNumber: number` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory/routings/:id`

- **Controller / Handler:** `getRoutingById`
- **Route Declaration:** `src/domains/books/routes/routingRoutes.ts`
- **Primary Data Model:** `Routing`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Routing`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `operations` | `{ stepNumber: number` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory/routings/:id`

- **Controller / Handler:** `updateRouting`
- **Route Declaration:** `src/domains/books/routes/routingRoutes.ts`
- **Primary Data Model:** `Routing`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "name": "Sample name",
  "operations": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Routing`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `operations` | `{ stepNumber: number` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/inventory/routings/:id`

- **Controller / Handler:** `deleteRouting`
- **Route Declaration:** `src/domains/books/routes/routingRoutes.ts`
- **Primary Data Model:** `Routing`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Routing`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `operations` | `{ stepNumber: number` | **Required** | Standard ERP entity attribute |

---


## Manufacturing - Work Orders

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/inventory/work-orders`

- **Controller / Handler:** `getWorkOrders`
- **Route Declaration:** `src/domains/books/routes/workOrderRoutes.ts`
- **Primary Data Model:** `WorkOrder`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`WorkOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `workOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `itemId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `routingId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Planned' \| 'In Progress' \| 'Completed' \| 'Cancelled'` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/inventory/work-orders`

- **Controller / Handler:** `createWorkOrder`
- **Route Declaration:** `src/domains/books/routes/workOrderRoutes.ts`
- **Primary Data Model:** `WorkOrder`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "workOrderNumber": "Sample workOrderNumber",
  "itemId": "Sample itemId",
  "quantity": 100,
  "routingId": "Sample routingId",
  "status": "Sample status",
  "startDate": "2026-10-14T06:47:41.415Z",
  "endDate": "2026-10-14T06:47:41.415Z"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`WorkOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `workOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `itemId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `routingId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Planned' \| 'In Progress' \| 'Completed' \| 'Cancelled'` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/inventory/work-orders/:id`

- **Controller / Handler:** `getWorkOrderById`
- **Route Declaration:** `src/domains/books/routes/workOrderRoutes.ts`
- **Primary Data Model:** `WorkOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`WorkOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `workOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `itemId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `routingId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Planned' \| 'In Progress' \| 'Completed' \| 'Cancelled'` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/inventory/work-orders/:id`

- **Controller / Handler:** `updateWorkOrder`
- **Route Declaration:** `src/domains/books/routes/workOrderRoutes.ts`
- **Primary Data Model:** `WorkOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "workOrderNumber": "Sample workOrderNumber",
  "itemId": "Sample itemId",
  "quantity": 100,
  "routingId": "Sample routingId",
  "status": "Sample status",
  "startDate": "2026-10-14T06:47:41.415Z",
  "endDate": "2026-10-14T06:47:41.415Z"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`WorkOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `workOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `itemId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `routingId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Planned' \| 'In Progress' \| 'Completed' \| 'Cancelled'` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/inventory/work-orders/:id`

- **Controller / Handler:** `deleteWorkOrder`
- **Route Declaration:** `src/domains/books/routes/workOrderRoutes.ts`
- **Primary Data Model:** `WorkOrder`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`WorkOrder`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `workOrderNumber` | `string` | **Required** | Standard ERP entity attribute |
| `itemId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `quantity` | `number` | **Required** | Standard ERP entity attribute |
| `routingId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `status` | `'Planned' \| 'In Progress' \| 'Completed' \| 'Cancelled'` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---


## Inventory - AI Forecast

Total APIs in this module: **3**

### 1. `GET` `/api/v1/books/inventory/ai/demand-forecast`

- **Controller / Handler:** `generateDemandForecast`
- **Route Declaration:** `src/domains/books/routes/aiInventoryRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```

---

### 2. `GET` `/api/v1/books/inventory/ai/reorder-suggestions`

- **Controller / Handler:** `getReorderSuggestions`
- **Route Declaration:** `src/domains/books/routes/aiInventoryRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```

---

### 3. `POST` `/api/v1/books/inventory/ai/smart-vendor-routing`

- **Controller / Handler:** `smartVendorRouting`
- **Route Declaration:** `src/domains/books/routes/aiInventoryRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample Record",
  "status": "Active",
  "notes": "Standard ERP entry"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```

---


## Accounting - Chart of Accounts

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/chart-of-accounts`

- **Controller / Handler:** `getAccounts`
- **Route Declaration:** `src/domains/books/routes/chartOfAccountRoutes.ts`
- **Primary Data Model:** `ChartOfAccount`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`ChartOfAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `accountType` | `string` | **Required** | Standard ERP entity attribute |
| `accountGroup` | `string` | Optional | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountCode` | `string` | Optional | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `addToWatchlist` | `boolean` | Optional | Standard ERP entity attribute |
| `isSubAccount` | `boolean` | Optional | Standard ERP entity attribute |
| `parentAccount` | `string` | Optional | Standard ERP entity attribute |
| `applicableBranches` | `string[]` | Optional | Standard ERP entity attribute |
| `costCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `profitCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `departments` | `string[]` | Optional | Standard ERP entity attribute |
| `effectiveDate` | `Date` | Optional | Standard ERP entity attribute |
| `systemAccountType` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full ChartOfAccount definition |

---

### 2. `GET` `/api/v1/books/chart-of-accounts/:id`

- **Controller / Handler:** `getAccountById`
- **Route Declaration:** `src/domains/books/routes/chartOfAccountRoutes.ts`
- **Primary Data Model:** `ChartOfAccount`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`ChartOfAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `accountType` | `string` | **Required** | Standard ERP entity attribute |
| `accountGroup` | `string` | Optional | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountCode` | `string` | Optional | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `addToWatchlist` | `boolean` | Optional | Standard ERP entity attribute |
| `isSubAccount` | `boolean` | Optional | Standard ERP entity attribute |
| `parentAccount` | `string` | Optional | Standard ERP entity attribute |
| `applicableBranches` | `string[]` | Optional | Standard ERP entity attribute |
| `costCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `profitCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `departments` | `string[]` | Optional | Standard ERP entity attribute |
| `effectiveDate` | `Date` | Optional | Standard ERP entity attribute |
| `systemAccountType` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full ChartOfAccount definition |

---

### 3. `POST` `/api/v1/books/chart-of-accounts`

- **Controller / Handler:** `createAccount`
- **Route Declaration:** `src/domains/books/routes/chartOfAccountRoutes.ts`
- **Primary Data Model:** `ChartOfAccount`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "accountType": "Sample accountType",
  "accountGroup": "Sample accountGroup",
  "accountName": "Sample accountName",
  "accountCode": "Sample accountCode",
  "description": "Sample description",
  "addToWatchlist": true,
  "isSubAccount": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`ChartOfAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `accountType` | `string` | **Required** | Standard ERP entity attribute |
| `accountGroup` | `string` | Optional | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountCode` | `string` | Optional | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `addToWatchlist` | `boolean` | Optional | Standard ERP entity attribute |
| `isSubAccount` | `boolean` | Optional | Standard ERP entity attribute |
| `parentAccount` | `string` | Optional | Standard ERP entity attribute |
| `applicableBranches` | `string[]` | Optional | Standard ERP entity attribute |
| `costCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `profitCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `departments` | `string[]` | Optional | Standard ERP entity attribute |
| `effectiveDate` | `Date` | Optional | Standard ERP entity attribute |
| `systemAccountType` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full ChartOfAccount definition |

---

### 4. `PUT` `/api/v1/books/chart-of-accounts/:id`

- **Controller / Handler:** `updateAccount`
- **Route Declaration:** `src/domains/books/routes/chartOfAccountRoutes.ts`
- **Primary Data Model:** `ChartOfAccount`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "accountType": "Sample accountType",
  "accountGroup": "Sample accountGroup",
  "accountName": "Sample accountName",
  "accountCode": "Sample accountCode",
  "description": "Sample description",
  "addToWatchlist": true,
  "isSubAccount": true
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`ChartOfAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `accountType` | `string` | **Required** | Standard ERP entity attribute |
| `accountGroup` | `string` | Optional | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountCode` | `string` | Optional | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `addToWatchlist` | `boolean` | Optional | Standard ERP entity attribute |
| `isSubAccount` | `boolean` | Optional | Standard ERP entity attribute |
| `parentAccount` | `string` | Optional | Standard ERP entity attribute |
| `applicableBranches` | `string[]` | Optional | Standard ERP entity attribute |
| `costCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `profitCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `departments` | `string[]` | Optional | Standard ERP entity attribute |
| `effectiveDate` | `Date` | Optional | Standard ERP entity attribute |
| `systemAccountType` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full ChartOfAccount definition |

---

### 5. `DELETE` `/api/v1/books/chart-of-accounts/:id`

- **Controller / Handler:** `deleteAccount`
- **Route Declaration:** `src/domains/books/routes/chartOfAccountRoutes.ts`
- **Primary Data Model:** `ChartOfAccount`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`ChartOfAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `accountType` | `string` | **Required** | Standard ERP entity attribute |
| `accountGroup` | `string` | Optional | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountCode` | `string` | Optional | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `addToWatchlist` | `boolean` | Optional | Standard ERP entity attribute |
| `isSubAccount` | `boolean` | Optional | Standard ERP entity attribute |
| `parentAccount` | `string` | Optional | Standard ERP entity attribute |
| `applicableBranches` | `string[]` | Optional | Standard ERP entity attribute |
| `costCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `profitCenters` | `string[]` | Optional | Standard ERP entity attribute |
| `departments` | `string[]` | Optional | Standard ERP entity attribute |
| `effectiveDate` | `Date` | Optional | Standard ERP entity attribute |
| `systemAccountType` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full ChartOfAccount definition |

---


## Accounting - Manual Journals

Total APIs in this module: **6**

### 1. `GET` `/api/v1/books/journals`

- **Controller / Handler:** `getJournals`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---

### 2. `GET` `/api/v1/books/journals/:id`

- **Controller / Handler:** `getJournalById`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---

### 3. `POST` `/api/v1/books/journals`

- **Controller / Handler:** `createJournal`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "account": "Sample account",
  "description": "Sample description",
  "contact": "Sample contact",
  "debits": 100,
  "credits": 100,
  "costCenter": "Sample costCenter",
  "department": "Sample department",
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---

### 4. `PUT` `/api/v1/books/journals/:id`

- **Controller / Handler:** `updateJournal`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "account": "Sample account",
  "description": "Sample description",
  "contact": "Sample contact",
  "debits": 100,
  "credits": 100,
  "costCenter": "Sample costCenter",
  "department": "Sample department",
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---

### 5. `DELETE` `/api/v1/books/journals/:id`

- **Controller / Handler:** `deleteJournal`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---

### 6. `POST` `/api/v1/books/journals/:id/reverse`

- **Controller / Handler:** `reverseJournal`
- **Route Declaration:** `src/domains/books/routes/journalRoutes.ts`
- **Primary Data Model:** `Journal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "account": "Sample account",
  "description": "Sample description",
  "contact": "Sample contact",
  "debits": 100,
  "credits": 100,
  "costCenter": "Sample costCenter",
  "department": "Sample department",
  "orgId": "Sample orgId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Journal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `contact` | `string` | Optional | Standard ERP entity attribute |
| `debits` | `number` | **Required** | Standard ERP entity attribute |
| `credits` | `number` | **Required** | Standard ERP entity attribute |
| `costCenter` | `string` | Optional | Standard ERP entity attribute |
| `department` | `string` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `reverseJournalDate` | `Date` | Optional | Standard ERP entity attribute |
| `publishReverseOnlyOnDate` | `boolean` | **Required** | Standard ERP entity attribute |
| `journalNumber` | `string` | **Required** | Standard ERP entity attribute |
| `referenceNumber` | `string` | Optional | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| *... and 10 more fields* | | | See full Journal definition |

---


## Accounting - Recurring Journals

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/recurring-journals`

- **Controller / Handler:** `getRecurringJournals`
- **Route Declaration:** `src/domains/books/routes/recurringJournalRoutes.ts`
- **Primary Data Model:** `RecurringJournal`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`RecurringJournal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `frequency` | `'Daily' \| 'Weekly' \| 'Monthly' \| 'Yearly' \| 'Custom'` | **Required** | Standard ERP entity attribute |
| `interval` | `number` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `endsAfterOccurrences` | `number` | Optional | Standard ERP entity attribute |
| `occurrencesPosted` | `number` | **Required** | Standard ERP entity attribute |
| `nextRunDate` | `Date` | **Required** | Standard ERP entity attribute |
| `lastRunDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `lastError` | `string` | Optional | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full RecurringJournal definition |

---

### 2. `GET` `/api/v1/books/recurring-journals/:id`

- **Controller / Handler:** `getRecurringJournalById`
- **Route Declaration:** `src/domains/books/routes/recurringJournalRoutes.ts`
- **Primary Data Model:** `RecurringJournal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`RecurringJournal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `frequency` | `'Daily' \| 'Weekly' \| 'Monthly' \| 'Yearly' \| 'Custom'` | **Required** | Standard ERP entity attribute |
| `interval` | `number` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `endsAfterOccurrences` | `number` | Optional | Standard ERP entity attribute |
| `occurrencesPosted` | `number` | **Required** | Standard ERP entity attribute |
| `nextRunDate` | `Date` | **Required** | Standard ERP entity attribute |
| `lastRunDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `lastError` | `string` | Optional | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full RecurringJournal definition |

---

### 3. `POST` `/api/v1/books/recurring-journals`

- **Controller / Handler:** `createRecurringJournal`
- **Route Declaration:** `src/domains/books/routes/recurringJournalRoutes.ts`
- **Primary Data Model:** `RecurringJournal`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "notes": "Sample notes",
  "frequency": "Sample frequency",
  "interval": 100,
  "startsOn": "2026-10-14T06:47:41.415Z",
  "endsOn": "2026-10-14T06:47:41.415Z",
  "endsAfterOccurrences": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`RecurringJournal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `frequency` | `'Daily' \| 'Weekly' \| 'Monthly' \| 'Yearly' \| 'Custom'` | **Required** | Standard ERP entity attribute |
| `interval` | `number` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `endsAfterOccurrences` | `number` | Optional | Standard ERP entity attribute |
| `occurrencesPosted` | `number` | **Required** | Standard ERP entity attribute |
| `nextRunDate` | `Date` | **Required** | Standard ERP entity attribute |
| `lastRunDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `lastError` | `string` | Optional | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full RecurringJournal definition |

---

### 4. `PATCH` `/api/v1/books/recurring-journals/:id/status`

- **Controller / Handler:** `updateRecurringJournalStatus`
- **Route Declaration:** `src/domains/books/routes/recurringJournalRoutes.ts`
- **Primary Data Model:** `RecurringJournal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "profileName": "Sample profileName",
  "notes": "Sample notes",
  "frequency": "Sample frequency",
  "interval": 100,
  "startsOn": "2026-10-14T06:47:41.415Z",
  "endsOn": "2026-10-14T06:47:41.415Z",
  "endsAfterOccurrences": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`RecurringJournal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `frequency` | `'Daily' \| 'Weekly' \| 'Monthly' \| 'Yearly' \| 'Custom'` | **Required** | Standard ERP entity attribute |
| `interval` | `number` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `endsAfterOccurrences` | `number` | Optional | Standard ERP entity attribute |
| `occurrencesPosted` | `number` | **Required** | Standard ERP entity attribute |
| `nextRunDate` | `Date` | **Required** | Standard ERP entity attribute |
| `lastRunDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `lastError` | `string` | Optional | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full RecurringJournal definition |

---

### 5. `DELETE` `/api/v1/books/recurring-journals/:id`

- **Controller / Handler:** `deleteRecurringJournal`
- **Route Declaration:** `src/domains/books/routes/recurringJournalRoutes.ts`
- **Primary Data Model:** `RecurringJournal`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`RecurringJournal`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `profileName` | `string` | **Required** | Standard ERP entity attribute |
| `notes` | `string` | **Required** | Standard ERP entity attribute |
| `frequency` | `'Daily' \| 'Weekly' \| 'Monthly' \| 'Yearly' \| 'Custom'` | **Required** | Standard ERP entity attribute |
| `interval` | `number` | **Required** | Standard ERP entity attribute |
| `startsOn` | `Date` | **Required** | Standard ERP entity attribute |
| `endsOn` | `Date` | Optional | Standard ERP entity attribute |
| `endsAfterOccurrences` | `number` | Optional | Standard ERP entity attribute |
| `occurrencesPosted` | `number` | **Required** | Standard ERP entity attribute |
| `nextRunDate` | `Date` | **Required** | Standard ERP entity attribute |
| `lastRunDate` | `Date` | Optional | Standard ERP entity attribute |
| `status` | `'Active' \| 'Paused' \| 'Expired'` | **Required** | Standard ERP entity attribute |
| `lastError` | `string` | Optional | Standard ERP entity attribute |
| `reportingMethod` | `'accrual' \| 'cash' \| 'both'` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |
| *... and 3 more fields* | | | See full RecurringJournal definition |

---


## Accounting - Reconciliation

Total APIs in this module: **2**

### 1. `GET` `/api/v1/books/reconciliation/feeds`

- **Controller / Handler:** `getReconciliationFeeds`
- **Route Declaration:** `src/domains/books/routes/reconciliationRoutes.ts`
- **Primary Data Model:** `BankAccount`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`BankAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountNumber` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/reconciliation/feeds/:feedId/confirm`

- **Controller / Handler:** `confirmMatch`
- **Route Declaration:** `src/domains/books/routes/reconciliationRoutes.ts`
- **Primary Data Model:** `BankAccount`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `feedId` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "accountName": "Sample accountName",
  "accountNumber": "Sample accountNumber",
  "currency": "Sample currency"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`BankAccount`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountName` | `string` | **Required** | Standard ERP entity attribute |
| `accountNumber` | `string` | **Required** | Standard ERP entity attribute |
| `currency` | `string` | **Required** | Standard ERP entity attribute |

---


## Accounting - Taxes & Configurations

Total APIs in this module: **6**

### 1. `GET` `/api/v1/books/taxes`

- **Controller / Handler:** `getTaxes`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/taxes`

- **Controller / Handler:** `createTax`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "rate": 100,
  "isCompound": true,
  "accountId": "Sample accountId",
  "orgId": "Sample orgId",
  "regime": "Sample regime",
  "taxType": "Sample taxType",
  "components": []
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `DELETE` `/api/v1/books/taxes/:id`

- **Controller / Handler:** `deleteTax`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 4. `GET` `/api/v1/books/taxes/withholding`

- **Controller / Handler:** `getWithholdingTaxes`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 5. `POST` `/api/v1/books/taxes/withholding`

- **Controller / Handler:** `createWithholdingTax`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "rate": 100,
  "isCompound": true,
  "accountId": "Sample accountId",
  "orgId": "Sample orgId",
  "regime": "Sample regime",
  "taxType": "Sample taxType",
  "components": []
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 6. `DELETE` `/api/v1/books/taxes/withholding/:id`

- **Controller / Handler:** `deleteWithholdingTax`
- **Route Declaration:** `src/domains/books/routes/taxRoutes.ts`
- **Primary Data Model:** `Tax`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Tax`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `rate` | `number` | **Required** | Standard ERP entity attribute |
| `isCompound` | `boolean` | **Required** | Standard ERP entity attribute |
| `accountId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `regime` | `string` | **Required** | Standard ERP entity attribute |
| `taxType` | `'Sales' \| 'Purchase' \| 'Both'` | **Required** | Standard ERP entity attribute |
| `components` | `ITaxComponent[]` | **Required** | Standard ERP entity attribute |
| `totalRate` | `number` | **Required** | Standard ERP entity attribute |
| `isActive` | `boolean` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---


## Accounting - Fixed Assets

Total APIs in this module: **4**

### 1. `GET` `/api/v1/books/fixed-assets/categories`

- **Controller / Handler:** `getCategories`
- **Route Declaration:** `src/domains/books/routes/fixedAssetRoutes.ts`
- **Primary Data Model:** `FixedAsset`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`FixedAsset`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `journalId` | `Types.ObjectId` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `assetName` | `string` | **Required** | Standard ERP entity attribute |
| `assetNumber` | `string` | **Required** | Standard ERP entity attribute |
| `categoryId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `purchaseDate` | `Date` | **Required** | Standard ERP entity attribute |
| `purchasePrice` | `number` | **Required** | Standard ERP entity attribute |
| `salvageValue` | `number` | **Required** | Standard ERP entity attribute |
| `usefulLifeMonths` | `number` | **Required** | Standard ERP entity attribute |
| `depreciationMethod` | `'Straight_Line' \| 'Declining_Balance' \| 'None'` | **Required** | Standard ERP entity attribute |
| `depreciationRate` | `number` | Optional | Standard ERP entity attribute |
| `accumulatedDepreciation` | `number` | **Required** | Standard ERP entity attribute |
| `currentBookValue` | `number` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full FixedAsset definition |

---

### 2. `GET` `/api/v1/books/fixed-assets`

- **Controller / Handler:** `getAssets`
- **Route Declaration:** `src/domains/books/routes/fixedAssetRoutes.ts`
- **Primary Data Model:** `FixedAsset`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`FixedAsset`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `journalId` | `Types.ObjectId` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `assetName` | `string` | **Required** | Standard ERP entity attribute |
| `assetNumber` | `string` | **Required** | Standard ERP entity attribute |
| `categoryId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `purchaseDate` | `Date` | **Required** | Standard ERP entity attribute |
| `purchasePrice` | `number` | **Required** | Standard ERP entity attribute |
| `salvageValue` | `number` | **Required** | Standard ERP entity attribute |
| `usefulLifeMonths` | `number` | **Required** | Standard ERP entity attribute |
| `depreciationMethod` | `'Straight_Line' \| 'Declining_Balance' \| 'None'` | **Required** | Standard ERP entity attribute |
| `depreciationRate` | `number` | Optional | Standard ERP entity attribute |
| `accumulatedDepreciation` | `number` | **Required** | Standard ERP entity attribute |
| `currentBookValue` | `number` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full FixedAsset definition |

---

### 3. `POST` `/api/v1/books/fixed-assets`

- **Controller / Handler:** `createAsset`
- **Route Declaration:** `src/domains/books/routes/fixedAssetRoutes.ts`
- **Primary Data Model:** `FixedAsset`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "date": "2026-10-14T06:47:41.415Z",
  "amount": 100,
  "journalId": "Sample journalId",
  "orgId": "Sample orgId",
  "assetName": "Sample assetName",
  "assetNumber": "Sample assetNumber",
  "categoryId": "Sample categoryId",
  "purchaseDate": "2026-10-14T06:47:41.415Z"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`FixedAsset`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `journalId` | `Types.ObjectId` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `assetName` | `string` | **Required** | Standard ERP entity attribute |
| `assetNumber` | `string` | **Required** | Standard ERP entity attribute |
| `categoryId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `purchaseDate` | `Date` | **Required** | Standard ERP entity attribute |
| `purchasePrice` | `number` | **Required** | Standard ERP entity attribute |
| `salvageValue` | `number` | **Required** | Standard ERP entity attribute |
| `usefulLifeMonths` | `number` | **Required** | Standard ERP entity attribute |
| `depreciationMethod` | `'Straight_Line' \| 'Declining_Balance' \| 'None'` | **Required** | Standard ERP entity attribute |
| `depreciationRate` | `number` | Optional | Standard ERP entity attribute |
| `accumulatedDepreciation` | `number` | **Required** | Standard ERP entity attribute |
| `currentBookValue` | `number` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full FixedAsset definition |

---

### 4. `POST` `/api/v1/books/fixed-assets/depreciation-run`

- **Controller / Handler:** `runDepreciation`
- **Route Declaration:** `src/domains/books/routes/fixedAssetRoutes.ts`
- **Primary Data Model:** `FixedAsset`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "date": "2026-10-14T06:47:41.415Z",
  "amount": 100,
  "journalId": "Sample journalId",
  "orgId": "Sample orgId",
  "assetName": "Sample assetName",
  "assetNumber": "Sample assetNumber",
  "categoryId": "Sample categoryId",
  "purchaseDate": "2026-10-14T06:47:41.415Z"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`FixedAsset`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `amount` | `number` | **Required** | Standard ERP entity attribute |
| `journalId` | `Types.ObjectId` | Optional | Standard ERP entity attribute |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `assetName` | `string` | **Required** | Standard ERP entity attribute |
| `assetNumber` | `string` | **Required** | Standard ERP entity attribute |
| `categoryId` | `Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `purchaseDate` | `Date` | **Required** | Standard ERP entity attribute |
| `purchasePrice` | `number` | **Required** | Standard ERP entity attribute |
| `salvageValue` | `number` | **Required** | Standard ERP entity attribute |
| `usefulLifeMonths` | `number` | **Required** | Standard ERP entity attribute |
| `depreciationMethod` | `'Straight_Line' \| 'Declining_Balance' \| 'None'` | **Required** | Standard ERP entity attribute |
| `depreciationRate` | `number` | Optional | Standard ERP entity attribute |
| `accumulatedDepreciation` | `number` | **Required** | Standard ERP entity attribute |
| `currentBookValue` | `number` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full FixedAsset definition |

---


## Accounting - Budgets

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/budgets/scenarios`

- **Controller / Handler:** `getScenarios`
- **Route Declaration:** `src/domains/books/routes/budgetRoutes.ts`
- **Primary Data Model:** `Budget`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Budget`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `periodStart` | `Date` | **Required** | Standard ERP entity attribute |
| `periodEnd` | `Date` | **Required** | Standard ERP entity attribute |
| `budgetedAmount` | `number` | **Required** | Standard ERP entity attribute |
| `branchId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `projectId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/books/budgets/scenarios`

- **Controller / Handler:** `createScenario`
- **Route Declaration:** `src/domains/books/routes/budgetRoutes.ts`
- **Primary Data Model:** `Budget`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "accountId": "Sample accountId",
  "periodStart": "2026-10-14T06:47:41.415Z",
  "periodEnd": "2026-10-14T06:47:41.415Z",
  "budgetedAmount": 100,
  "branchId": "Sample branchId",
  "projectId": "Sample projectId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Budget`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `periodStart` | `Date` | **Required** | Standard ERP entity attribute |
| `periodEnd` | `Date` | **Required** | Standard ERP entity attribute |
| `budgetedAmount` | `number` | **Required** | Standard ERP entity attribute |
| `branchId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `projectId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/books/budgets/scenarios/:id`

- **Controller / Handler:** `getScenarioDetails`
- **Route Declaration:** `src/domains/books/routes/budgetRoutes.ts`
- **Primary Data Model:** `Budget`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Budget`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `periodStart` | `Date` | **Required** | Standard ERP entity attribute |
| `periodEnd` | `Date` | **Required** | Standard ERP entity attribute |
| `budgetedAmount` | `number` | **Required** | Standard ERP entity attribute |
| `branchId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `projectId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |

---

### 4. `POST` `/api/v1/books/budgets/scenarios/:id/lines`

- **Controller / Handler:** `saveBudgetLines`
- **Route Declaration:** `src/domains/books/routes/budgetRoutes.ts`
- **Primary Data Model:** `Budget`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "accountId": "Sample accountId",
  "periodStart": "2026-10-14T06:47:41.415Z",
  "periodEnd": "2026-10-14T06:47:41.415Z",
  "budgetedAmount": 100,
  "branchId": "Sample branchId",
  "projectId": "Sample projectId"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Budget`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `periodStart` | `Date` | **Required** | Standard ERP entity attribute |
| `periodEnd` | `Date` | **Required** | Standard ERP entity attribute |
| `budgetedAmount` | `number` | **Required** | Standard ERP entity attribute |
| `branchId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `projectId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |

---

### 5. `GET` `/api/v1/books/budgets/scenarios/:id/variance`

- **Controller / Handler:** `getBudgetVariance`
- **Route Declaration:** `src/domains/books/routes/budgetRoutes.ts`
- **Primary Data Model:** `Budget`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`Budget`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `accountId` | `mongoose.Types.ObjectId` | **Required** | Standard ERP entity attribute |
| `periodStart` | `Date` | **Required** | Standard ERP entity attribute |
| `periodEnd` | `Date` | **Required** | Standard ERP entity attribute |
| `budgetedAmount` | `number` | **Required** | Standard ERP entity attribute |
| `branchId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |
| `projectId` | `string \| mongoose.Types.ObjectId` | Optional | Standard ERP entity attribute |

---


## Accounting - Currency Adjustments

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/currency-adjustments`

- **Controller / Handler:** `getCurrencyAdjustments`
- **Route Declaration:** `src/domains/books/routes/currencyAdjustmentRoutes.ts`
- **Primary Data Model:** `CurrencyAdjustment`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`CurrencyAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `adjustmentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `adjustedCurrency` | `string` | **Required** | Standard ERP entity attribute |
| `newExchangeRate` | `number` | **Required** | Standard ERP entity attribute |
| `totalGainOrLoss` | `number` | **Required** | Standard ERP entity attribute |
| `details` | `{` | **Required** | Standard ERP entity attribute |
| `transactionId` | `string` | **Required** | Standard ERP entity attribute |
| `transactionType` | `string` | **Required** | Standard ERP entity attribute |
| `foreignBalance` | `number` | **Required** | Standard ERP entity attribute |
| `oldBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `newBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `gainOrLoss` | `number` | **Required** | Standard ERP entity attribute |

---

### 2. `GET` `/api/v1/books/currency-adjustments/:id`

- **Controller / Handler:** `getCurrencyAdjustmentById`
- **Route Declaration:** `src/domains/books/routes/currencyAdjustmentRoutes.ts`
- **Primary Data Model:** `CurrencyAdjustment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`CurrencyAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `adjustmentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `adjustedCurrency` | `string` | **Required** | Standard ERP entity attribute |
| `newExchangeRate` | `number` | **Required** | Standard ERP entity attribute |
| `totalGainOrLoss` | `number` | **Required** | Standard ERP entity attribute |
| `details` | `{` | **Required** | Standard ERP entity attribute |
| `transactionId` | `string` | **Required** | Standard ERP entity attribute |
| `transactionType` | `string` | **Required** | Standard ERP entity attribute |
| `foreignBalance` | `number` | **Required** | Standard ERP entity attribute |
| `oldBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `newBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `gainOrLoss` | `number` | **Required** | Standard ERP entity attribute |

---

### 3. `POST` `/api/v1/books/currency-adjustments`

- **Controller / Handler:** `createCurrencyAdjustment`
- **Route Declaration:** `src/domains/books/routes/currencyAdjustmentRoutes.ts`
- **Primary Data Model:** `CurrencyAdjustment`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "adjustmentDate": "2026-10-14T06:47:41.415Z",
  "adjustedCurrency": "Sample adjustedCurrency",
  "newExchangeRate": 100,
  "totalGainOrLoss": 100,
  "details": "Sample details",
  "transactionId": "Sample transactionId",
  "transactionType": "Sample transactionType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.415Z",
    "updatedAt": "2026-10-14T06:47:41.415Z"
  }
}
```


**Associated Model Schema (`CurrencyAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `adjustmentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `adjustedCurrency` | `string` | **Required** | Standard ERP entity attribute |
| `newExchangeRate` | `number` | **Required** | Standard ERP entity attribute |
| `totalGainOrLoss` | `number` | **Required** | Standard ERP entity attribute |
| `details` | `{` | **Required** | Standard ERP entity attribute |
| `transactionId` | `string` | **Required** | Standard ERP entity attribute |
| `transactionType` | `string` | **Required** | Standard ERP entity attribute |
| `foreignBalance` | `number` | **Required** | Standard ERP entity attribute |
| `oldBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `newBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `gainOrLoss` | `number` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/currency-adjustments/:id`

- **Controller / Handler:** `updateCurrencyAdjustment`
- **Route Declaration:** `src/domains/books/routes/currencyAdjustmentRoutes.ts`
- **Primary Data Model:** `CurrencyAdjustment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "adjustmentDate": "2026-10-14T06:47:41.417Z",
  "adjustedCurrency": "Sample adjustedCurrency",
  "newExchangeRate": 100,
  "totalGainOrLoss": 100,
  "details": "Sample details",
  "transactionId": "Sample transactionId",
  "transactionType": "Sample transactionType"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`CurrencyAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `adjustmentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `adjustedCurrency` | `string` | **Required** | Standard ERP entity attribute |
| `newExchangeRate` | `number` | **Required** | Standard ERP entity attribute |
| `totalGainOrLoss` | `number` | **Required** | Standard ERP entity attribute |
| `details` | `{` | **Required** | Standard ERP entity attribute |
| `transactionId` | `string` | **Required** | Standard ERP entity attribute |
| `transactionType` | `string` | **Required** | Standard ERP entity attribute |
| `foreignBalance` | `number` | **Required** | Standard ERP entity attribute |
| `oldBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `newBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `gainOrLoss` | `number` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/currency-adjustments/:id`

- **Controller / Handler:** `deleteCurrencyAdjustment`
- **Route Declaration:** `src/domains/books/routes/currencyAdjustmentRoutes.ts`
- **Primary Data Model:** `CurrencyAdjustment`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`CurrencyAdjustment`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `adjustmentDate` | `Date` | **Required** | Standard ERP entity attribute |
| `adjustedCurrency` | `string` | **Required** | Standard ERP entity attribute |
| `newExchangeRate` | `number` | **Required** | Standard ERP entity attribute |
| `totalGainOrLoss` | `number` | **Required** | Standard ERP entity attribute |
| `details` | `{` | **Required** | Standard ERP entity attribute |
| `transactionId` | `string` | **Required** | Standard ERP entity attribute |
| `transactionType` | `string` | **Required** | Standard ERP entity attribute |
| `foreignBalance` | `number` | **Required** | Standard ERP entity attribute |
| `oldBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `newBaseValue` | `number` | **Required** | Standard ERP entity attribute |
| `gainOrLoss` | `number` | **Required** | Standard ERP entity attribute |

---


## Accounting - Transaction Locks

Total APIs in this module: **2**

### 1. `GET` `/api/v1/books/transaction-locks`

- **Controller / Handler:** `getTransactionLock`
- **Route Declaration:** `src/domains/books/routes/transactionLockRoutes.ts`
- **Primary Data Model:** `TransactionLock`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TransactionLock`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `purchasesLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `bankingLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `accountantLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `allLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `lockedBy` | `string` | Optional | Standard ERP entity attribute |
| `negativeStockRestriction` | `boolean` | Optional | Standard ERP entity attribute |
| `partialUnlocks` | `{` | Optional | Standard ERP entity attribute |
| `module` | `string` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `PUT` `/api/v1/books/transaction-locks`

- **Controller / Handler:** `updateTransactionLock`
- **Route Declaration:** `src/domains/books/routes/transactionLockRoutes.ts`
- **Primary Data Model:** `TransactionLock`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "salesLockDate": "2026-10-14T06:47:41.417Z",
  "purchasesLockDate": "2026-10-14T06:47:41.417Z",
  "bankingLockDate": "2026-10-14T06:47:41.417Z",
  "accountantLockDate": "2026-10-14T06:47:41.417Z",
  "allLockDate": "2026-10-14T06:47:41.417Z",
  "reason": "Sample reason",
  "lockedBy": "Sample lockedBy"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TransactionLock`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `salesLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `purchasesLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `bankingLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `accountantLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `allLockDate` | `Date` | Optional | Standard ERP entity attribute |
| `reason` | `string` | **Required** | Standard ERP entity attribute |
| `lockedBy` | `string` | Optional | Standard ERP entity attribute |
| `negativeStockRestriction` | `boolean` | Optional | Standard ERP entity attribute |
| `partialUnlocks` | `{` | Optional | Standard ERP entity attribute |
| `module` | `string` | **Required** | Standard ERP entity attribute |
| `startDate` | `Date` | **Required** | Standard ERP entity attribute |
| `endDate` | `Date` | **Required** | Standard ERP entity attribute |

---


## Time Tracking - Projects

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/projects`

- **Controller / Handler:** `getProjects`
- **Route Declaration:** `src/domains/books/routes/projectRoutes.ts`
- **Primary Data Model:** `Project`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Project`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | **Required** | Standard ERP entity attribute |
| `ratePerHour` | `number` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `projectName` | `string` | **Required** | Standard ERP entity attribute |
| `projectCode` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `string` | **Required** | Standard ERP entity attribute |
| `billingMethod` | `'fixed' \| 'project_hours' \| 'task_hours' \| 'staff_hours'` | **Required** | Standard ERP entity attribute |
| `totalCost` | `number` | Optional | Standard ERP entity attribute |
| `costBudget` | `number` | Optional | Standard ERP entity attribute |
| `revenueBudget` | `number` | Optional | Standard ERP entity attribute |
| `users` | `IProjectUser[]` | **Required** | Standard ERP entity attribute |
| `tasks` | `IProjectTask[]` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full Project definition |

---

### 2. `GET` `/api/v1/books/projects/:id`

- **Controller / Handler:** `getProjectById`
- **Route Declaration:** `src/domains/books/routes/projectRoutes.ts`
- **Primary Data Model:** `Project`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Project`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | **Required** | Standard ERP entity attribute |
| `ratePerHour` | `number` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `projectName` | `string` | **Required** | Standard ERP entity attribute |
| `projectCode` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `string` | **Required** | Standard ERP entity attribute |
| `billingMethod` | `'fixed' \| 'project_hours' \| 'task_hours' \| 'staff_hours'` | **Required** | Standard ERP entity attribute |
| `totalCost` | `number` | Optional | Standard ERP entity attribute |
| `costBudget` | `number` | Optional | Standard ERP entity attribute |
| `revenueBudget` | `number` | Optional | Standard ERP entity attribute |
| `users` | `IProjectUser[]` | **Required** | Standard ERP entity attribute |
| `tasks` | `IProjectTask[]` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full Project definition |

---

### 3. `POST` `/api/v1/books/projects`

- **Controller / Handler:** `createProject`
- **Route Declaration:** `src/domains/books/routes/projectRoutes.ts`
- **Primary Data Model:** `Project`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "userId": "Sample userId",
  "ratePerHour": 100,
  "name": "Sample name",
  "description": "Sample description",
  "billable": true,
  "orgId": "Sample orgId",
  "projectName": "Sample projectName",
  "projectCode": "Sample projectCode"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Project`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | **Required** | Standard ERP entity attribute |
| `ratePerHour` | `number` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `projectName` | `string` | **Required** | Standard ERP entity attribute |
| `projectCode` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `string` | **Required** | Standard ERP entity attribute |
| `billingMethod` | `'fixed' \| 'project_hours' \| 'task_hours' \| 'staff_hours'` | **Required** | Standard ERP entity attribute |
| `totalCost` | `number` | Optional | Standard ERP entity attribute |
| `costBudget` | `number` | Optional | Standard ERP entity attribute |
| `revenueBudget` | `number` | Optional | Standard ERP entity attribute |
| `users` | `IProjectUser[]` | **Required** | Standard ERP entity attribute |
| `tasks` | `IProjectTask[]` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full Project definition |

---

### 4. `PUT` `/api/v1/books/projects/:id`

- **Controller / Handler:** `updateProject`
- **Route Declaration:** `src/domains/books/routes/projectRoutes.ts`
- **Primary Data Model:** `Project`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "userId": "Sample userId",
  "ratePerHour": 100,
  "name": "Sample name",
  "description": "Sample description",
  "billable": true,
  "orgId": "Sample orgId",
  "projectName": "Sample projectName",
  "projectCode": "Sample projectCode"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Project`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | **Required** | Standard ERP entity attribute |
| `ratePerHour` | `number` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `projectName` | `string` | **Required** | Standard ERP entity attribute |
| `projectCode` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `string` | **Required** | Standard ERP entity attribute |
| `billingMethod` | `'fixed' \| 'project_hours' \| 'task_hours' \| 'staff_hours'` | **Required** | Standard ERP entity attribute |
| `totalCost` | `number` | Optional | Standard ERP entity attribute |
| `costBudget` | `number` | Optional | Standard ERP entity attribute |
| `revenueBudget` | `number` | Optional | Standard ERP entity attribute |
| `users` | `IProjectUser[]` | **Required** | Standard ERP entity attribute |
| `tasks` | `IProjectTask[]` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full Project definition |

---

### 5. `DELETE` `/api/v1/books/projects/:id`

- **Controller / Handler:** `deleteProject`
- **Route Declaration:** `src/domains/books/routes/projectRoutes.ts`
- **Primary Data Model:** `Project`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Project`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | **Required** | Standard ERP entity attribute |
| `ratePerHour` | `number` | Optional | Standard ERP entity attribute |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | Optional | Standard ERP entity attribute |
| `billable` | `boolean` | **Required** | Standard ERP entity attribute |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `projectName` | `string` | **Required** | Standard ERP entity attribute |
| `projectCode` | `string` | Optional | Standard ERP entity attribute |
| `customer` | `string` | **Required** | Standard ERP entity attribute |
| `billingMethod` | `'fixed' \| 'project_hours' \| 'task_hours' \| 'staff_hours'` | **Required** | Standard ERP entity attribute |
| `totalCost` | `number` | Optional | Standard ERP entity attribute |
| `costBudget` | `number` | Optional | Standard ERP entity attribute |
| `revenueBudget` | `number` | Optional | Standard ERP entity attribute |
| `users` | `IProjectUser[]` | **Required** | Standard ERP entity attribute |
| `tasks` | `IProjectTask[]` | **Required** | Standard ERP entity attribute |
| *... and 4 more fields* | | | See full Project definition |

---


## Time Tracking - Timesheet Entries

Total APIs in this module: **5**

### 1. `GET` `/api/v1/books/time-entries`

- **Controller / Handler:** `getTimeEntries`
- **Route Declaration:** `src/domains/books/routes/timeEntryRoutes.ts`
- **Primary Data Model:** `TimeEntry`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TimeEntry`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `employeeId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `taskId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `hours` | `number` | **Required** | Standard ERP entity attribute |
| `isBillable` | `boolean` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `billingRate` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `'Unbilled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |

---

### 2. `GET` `/api/v1/books/time-entries/:id`

- **Controller / Handler:** `getTimeEntryById`
- **Route Declaration:** `src/domains/books/routes/timeEntryRoutes.ts`
- **Primary Data Model:** `TimeEntry`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TimeEntry`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `employeeId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `taskId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `hours` | `number` | **Required** | Standard ERP entity attribute |
| `isBillable` | `boolean` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `billingRate` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `'Unbilled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |

---

### 3. `POST` `/api/v1/books/time-entries`

- **Controller / Handler:** `createTimeEntry`
- **Route Declaration:** `src/domains/books/routes/timeEntryRoutes.ts`
- **Primary Data Model:** `TimeEntry`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "projectId": "Sample projectId",
  "employeeId": "Sample employeeId",
  "taskId": "Sample taskId",
  "date": "2026-10-14T06:47:41.417Z",
  "hours": 100,
  "isBillable": true,
  "costRate": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TimeEntry`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `employeeId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `taskId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `hours` | `number` | **Required** | Standard ERP entity attribute |
| `isBillable` | `boolean` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `billingRate` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `'Unbilled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/books/time-entries/:id`

- **Controller / Handler:** `updateTimeEntry`
- **Route Declaration:** `src/domains/books/routes/timeEntryRoutes.ts`
- **Primary Data Model:** `TimeEntry`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "projectId": "Sample projectId",
  "employeeId": "Sample employeeId",
  "taskId": "Sample taskId",
  "date": "2026-10-14T06:47:41.417Z",
  "hours": 100,
  "isBillable": true,
  "costRate": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TimeEntry`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `employeeId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `taskId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `hours` | `number` | **Required** | Standard ERP entity attribute |
| `isBillable` | `boolean` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `billingRate` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `'Unbilled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/books/time-entries/:id`

- **Controller / Handler:** `deleteTimeEntry`
- **Route Declaration:** `src/domains/books/routes/timeEntryRoutes.ts`
- **Primary Data Model:** `TimeEntry`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`TimeEntry`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | **Required** | Standard ERP entity attribute |
| `projectId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `employeeId` | `mongoose.Types.ObjectId \| string` | **Required** | Standard ERP entity attribute |
| `taskId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |
| `date` | `Date` | **Required** | Standard ERP entity attribute |
| `hours` | `number` | **Required** | Standard ERP entity attribute |
| `isBillable` | `boolean` | **Required** | Standard ERP entity attribute |
| `costRate` | `number` | **Required** | Standard ERP entity attribute |
| `billingRate` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `'Unbilled' \| 'Invoiced'` | **Required** | Standard ERP entity attribute |
| `invoiceId` | `mongoose.Types.ObjectId \| string` | Optional | Standard ERP entity attribute |

---


## Dashboard & Metrics

Total APIs in this module: **1**

### 1. `GET` `/api/v1/books/dashboard`

- **Controller / Handler:** `getDashboardData`
- **Route Declaration:** `src/domains/books/routes/dashboardRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---


## Reports & Analytics

Total APIs in this module: **65**

### 1. `GET` `/api/v1/books/reports/drilldown`

- **Controller / Handler:** `getDrilldown`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 2. `GET` `/api/v1/books/reports/profit-and-loss`

- **Controller / Handler:** `getProfitAndLoss`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "data": {
    "currency": "USD",
    "canAccessPayroll": true,
    "grossProfit": 3610000,
    "operatingExpenses": { "total": 909167 },
    "netProfit": 2700833
  }
}
```

---

### 3. `GET` `/api/v1/books/reports/payroll-drilldown`

- **Controller / Handler:** `getPayrollDrilldownReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** 🔒 **Restricted** to `Admin`, `HR Head`, `HR`, `Senior Accountant`, `Finance Manager`, `CFO`

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "data": {
    "canAccessPayroll": true,
    "currentUserRole": "Admin",
    "currency": "USD",
    "currencySymbol": "$",
    "exchangeRate": 95.32,
    "exchangeRateDate": "14 Oct 2026, 06:00 am UTC",
    "summary": {
      "totalGross": 379167,
      "totalNet": 315482,
      "totalDeductions": 63685
    },
    "employees": [
      {
        "name": "Arpit Agarwal",
        "code": "EMP-2026-002-00002",
        "grossSalary": 66667,
        "lopAmount": 8602,
        "totalDeductions": 10633,
        "netPayable": 56034
      }
    ]
  }
}
```

---

### 4. `GET` `/api/v1/books/reports/sales-by-customer`

- **Controller / Handler:** `getSalesByCustomer`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 5. `GET` `/api/v1/books/reports/sales-by-item`

- **Controller / Handler:** `getSalesByItem`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 6. `GET` `/api/v1/books/reports/sales-by-salesperson`

- **Controller / Handler:** `getSalesBySalesPerson`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 7. `GET` `/api/v1/books/reports/sales-summary`

- **Controller / Handler:** `getSalesSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 8. `GET` `/api/v1/books/reports/inventory-summary`

- **Controller / Handler:** `getInventorySummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 9. `GET` `/api/v1/books/reports/inventory-valuation`

- **Controller / Handler:** `getInventoryValuationSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 10. `GET` `/api/v1/books/reports/fifo-tracking`

- **Controller / Handler:** `getFifoCostLotTracking`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 11. `GET` `/api/v1/books/reports/profit-by-item`

- **Controller / Handler:** `getProfitByItem`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 12. `GET` `/api/v1/books/reports/sales-channel-sync`

- **Controller / Handler:** `getSalesChannelSync`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 13. `GET` `/api/v1/books/reports/committed-stock`

- **Controller / Handler:** `getCommittedStockDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 14. `GET` `/api/v1/books/reports/inventory-aging`

- **Controller / Handler:** `getInventoryAgingSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 15. `GET` `/api/v1/books/reports/stock-summary`

- **Controller / Handler:** `getStockSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 16. `GET` `/api/v1/books/reports/inventory-adj-summary`

- **Controller / Handler:** `getInventoryAdjustmentSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 17. `GET` `/api/v1/books/reports/inventory-adj-details`

- **Controller / Handler:** `getInventoryAdjustmentDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 18. `GET` `/api/v1/books/reports/turnover-qty`

- **Controller / Handler:** `getInventoryTurnoverByQuantity`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 19. `GET` `/api/v1/books/reports/abc-classification`

- **Controller / Handler:** `getABCClassification`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 20. `GET` `/api/v1/books/reports/turnover-amount`

- **Controller / Handler:** `getInventoryTurnoverByAmount`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 21. `GET` `/api/v1/books/reports/weighted-average-cost`

- **Controller / Handler:** `getWeightedAverageCostSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 22. `GET` `/api/v1/books/reports/customer-balances`

- **Controller / Handler:** `getCustomerBalances`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 23. `GET` `/api/v1/books/reports/vendor-balances`

- **Controller / Handler:** `getVendorBalances`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 24. `GET` `/api/v1/books/reports/balance-sheet`

- **Controller / Handler:** `getBalanceSheet`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 25. `GET` `/api/v1/books/reports/cash-flow`

- **Controller / Handler:** `getCashFlow`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 26. `GET` `/api/v1/books/reports/horizontal-pl`

- **Controller / Handler:** `getHorizontalPL`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 27. `GET` `/api/v1/books/reports/horizontal-bs`

- **Controller / Handler:** `getHorizontalBS`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 28. `GET` `/api/v1/books/reports/movement-of-equity`

- **Controller / Handler:** `getMovementOfEquity`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 29. `GET` `/api/v1/books/reports/business-performance-ratios`

- **Controller / Handler:** `getBusinessPerformanceRatios`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 30. `GET` `/api/v1/books/reports/trial-balance`

- **Controller / Handler:** `getTrialBalance`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 31. `GET` `/api/v1/books/reports/general-ledger`

- **Controller / Handler:** `getGeneralLedger`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 32. `GET` `/api/v1/books/reports/journal-report`

- **Controller / Handler:** `getJournalReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 33. `GET` `/api/v1/books/reports/receivables-aging`

- **Controller / Handler:** `getReceivablesAging`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 34. `GET` `/api/v1/books/reports/invoice-details`

- **Controller / Handler:** `getInvoiceDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 35. `GET` `/api/v1/books/reports/ar-aging-details`

- **Controller / Handler:** `getARAgingDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 36. `GET` `/api/v1/books/reports/so-details`

- **Controller / Handler:** `getSalesOrderDetailsReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 37. `GET` `/api/v1/books/reports/delivery-challan-details`

- **Controller / Handler:** `getDeliveryChallanDetailsReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 38. `GET` `/api/v1/books/reports/quote-details`

- **Controller / Handler:** `getQuoteDetailsReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 39. `GET` `/api/v1/books/reports/quote-item-details`

- **Controller / Handler:** `getQuoteItemDetailsReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 40. `GET` `/api/v1/books/reports/receivable-summary`

- **Controller / Handler:** `getReceivableSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 41. `GET` `/api/v1/books/reports/receivable-details`

- **Controller / Handler:** `getReceivableDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 42. `GET` `/api/v1/books/reports/payables-aging`

- **Controller / Handler:** `getPayablesAging`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 43. `GET` `/api/v1/books/reports/po-details`

- **Controller / Handler:** `getPurchaseOrderDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 44. `GET` `/api/v1/books/reports/ap-aging-details`

- **Controller / Handler:** `getAPAgingDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 45. `GET` `/api/v1/books/reports/vendor-credit-details`

- **Controller / Handler:** `getVendorCreditDetailsReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 46. `GET` `/api/v1/books/reports/payables-refund-history`

- **Controller / Handler:** `getPayablesRefundHistory`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 47. `GET` `/api/v1/books/reports/po-by-vendor`

- **Controller / Handler:** `getPurchaseOrdersByVendor`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 48. `GET` `/api/v1/books/reports/po-by-item`

- **Controller / Handler:** `getPurchaseOrderByItem`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 49. `GET` `/api/v1/books/reports/payable-summary`

- **Controller / Handler:** `getPayableSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 50. `GET` `/api/v1/books/reports/payable-details`

- **Controller / Handler:** `getPayableDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 51. `GET` `/api/v1/books/reports/expenses-by-category`

- **Controller / Handler:** `getExpensesByCategory`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 52. `GET` `/api/v1/books/reports/expense-details`

- **Controller / Handler:** `getExpenseDetails`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 53. `GET` `/api/v1/books/reports/purchases-by-vendor`

- **Controller / Handler:** `getPurchasesByVendor`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 54. `GET` `/api/v1/books/reports/purchases-by-item`

- **Controller / Handler:** `getPurchasesByItem`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 55. `GET` `/api/v1/books/reports/project-summary`

- **Controller / Handler:** `getProjectSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 56. `GET` `/api/v1/books/reports/timesheet-profitability`

- **Controller / Handler:** `getTimesheetProfitability`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 57. `GET` `/api/v1/books/reports/payments-received-report`

- **Controller / Handler:** `getPaymentsReceivedReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 58. `GET` `/api/v1/books/reports/payments-made-report`

- **Controller / Handler:** `getPaymentsMadeReport`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 59. `GET` `/api/v1/books/reports/tax-summary`

- **Controller / Handler:** `getTaxSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 60. `GET` `/api/v1/books/reports/budget-vs-actual`

- **Controller / Handler:** `getBudgetVsActual`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 61. `GET` `/api/v1/books/reports/activity-log`

- **Controller / Handler:** `getActivityLog`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 62. `GET` `/api/v1/books/reports/day-book`

- **Controller / Handler:** `getDayBook`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 63. `GET` `/api/v1/books/reports/account-transactions`

- **Controller / Handler:** `getAccountTransactions`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 64. `GET` `/api/v1/books/reports/account-type-summary`

- **Controller / Handler:** `getAccountTypeSummary`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---

### 65. `GET` `/api/v1/books/reports/detailed-general-ledger`

- **Controller / Handler:** `getDetailedGeneralLedger`
- **Route Declaration:** `src/domains/books/routes/reportsRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |
| `month` | `string` | `OCT` | Reporting period month (e.g. `OCT`, `SEP`, `ALL`) |
| `year` | `number` | `2026` | Reporting period fiscal year |
| `currency` | `string` | `USD` | Currency toggle (`USD` vs `INR`) |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---


## Billing - Dashboard

Total APIs in this module: **1**

### 1. `GET` `/api/v1/billing/dashboard`

- **Controller / Handler:** `getDashboardData`
- **Route Declaration:** `src/domains/billing/routes/dashboardRoutes.ts`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```

---


## Billing - Customers

Total APIs in this module: **5**

### 1. `GET` `/api/v1/billing/customers`

- **Controller / Handler:** `getCustomers`
- **Route Declaration:** `src/domains/billing/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 2. `POST` `/api/v1/billing/customers`

- **Controller / Handler:** `createCustomer`
- **Route Declaration:** `src/domains/billing/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "email": "Sample email",
  "phone": "Sample phone",
  "address": "Sample address",
  "currency": "Sample currency",
  "paymentTerms": "Sample paymentTerms",
  "attention": "Sample attention",
  "country": "Sample country"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 3. `GET` `/api/v1/billing/customers/:id`

- **Controller / Handler:** `getCustomerById`
- **Route Declaration:** `src/domains/billing/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 4. `PUT` `/api/v1/billing/customers/:id`

- **Controller / Handler:** `updateCustomer`
- **Route Declaration:** `src/domains/billing/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "name": "Sample name",
  "email": "Sample email",
  "phone": "Sample phone",
  "address": "Sample address",
  "currency": "Sample currency",
  "paymentTerms": "Sample paymentTerms",
  "attention": "Sample attention",
  "country": "Sample country"
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---

### 5. `DELETE` `/api/v1/billing/customers/:id`

- **Controller / Handler:** `deleteCustomer`
- **Route Declaration:** `src/domains/billing/routes/customerRoutes.ts`
- **Primary Data Model:** `Customer`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Customer`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | Standard ERP entity attribute |
| `email` | `string` | Optional | Standard ERP entity attribute |
| `phone` | `string` | Optional | Standard ERP entity attribute |
| `address` | `string` | Optional | Standard ERP entity attribute |
| `currency` | `string` | Optional | Standard ERP entity attribute |
| `paymentTerms` | `string` | Optional | Standard ERP entity attribute |
| `attention` | `string` | Optional | Standard ERP entity attribute |
| `country` | `string` | Optional | Standard ERP entity attribute |
| `street1` | `string` | Optional | Standard ERP entity attribute |
| `street2` | `string` | Optional | Standard ERP entity attribute |
| `city` | `string` | Optional | Standard ERP entity attribute |
| `state` | `string` | Optional | Standard ERP entity attribute |
| `zipCode` | `string` | Optional | Standard ERP entity attribute |
| `fax` | `string` | Optional | Standard ERP entity attribute |
| `firstName` | `string` | Optional | Standard ERP entity attribute |
| *... and 32 more fields* | | | See full Customer definition |

---


## Billing - Items

Total APIs in this module: **5**

### 1. `GET` `/api/v1/billing/items`

- **Controller / Handler:** `getItems`
- **Route Declaration:** `src/domains/billing/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 2. `POST` `/api/v1/billing/items`

- **Controller / Handler:** `createItem`
- **Route Declaration:** `src/domains/billing/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "itemClass": "Sample itemClass",
  "trackingType": "Sample trackingType",
  "valuationMethod": "Sample valuationMethod",
  "barcode": "Sample barcode",
  "dimensions": 100,
  "weight": 100,
  "reorderPoint": 100,
  "safetyStock": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 3. `GET` `/api/v1/billing/items/:id`

- **Controller / Handler:** `getItemById`
- **Route Declaration:** `src/domains/billing/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.417Z",
    "updatedAt": "2026-10-14T06:47:41.417Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 4. `PUT` `/api/v1/billing/items/:id`

- **Controller / Handler:** `updateItem`
- **Route Declaration:** `src/domains/billing/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "itemClass": "Sample itemClass",
  "trackingType": "Sample trackingType",
  "valuationMethod": "Sample valuationMethod",
  "barcode": "Sample barcode",
  "dimensions": 100,
  "weight": 100,
  "reorderPoint": 100,
  "safetyStock": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---

### 5. `DELETE` `/api/v1/billing/items/:id`

- **Controller / Handler:** `deleteItem`
- **Route Declaration:** `src/domains/billing/routes/itemRoutes.ts`
- **Primary Data Model:** `Item`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Item`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemClass` | `'Standard' \| 'Variant' \| 'Kit' \| 'Assembly'` | Optional | Standard ERP entity attribute |
| `trackingType` | `'None' \| 'Serial' \| 'Batch'` | Optional | Standard ERP entity attribute |
| `valuationMethod` | `'FIFO' \| 'FEFO' \| 'WAC'` | Optional | Standard ERP entity attribute |
| `barcode` | `string` | Optional | Standard ERP entity attribute |
| `dimensions` | `{ length?: number` | Optional | Standard ERP entity attribute |
| `weight` | `{ value?: number` | Optional | Standard ERP entity attribute |
| `reorderPoint` | `number` | Optional | Standard ERP entity attribute |
| `safetyStock` | `number` | Optional | Standard ERP entity attribute |
| `leadTimeDays` | `number` | Optional | Standard ERP entity attribute |
| `defaultWarehouseId` | `string` | Optional | Standard ERP entity attribute |
| `defaultBin` | `string` | Optional | Standard ERP entity attribute |
| `salesAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseAccount` | `string` | Optional | Standard ERP entity attribute |
| `inventoryAccount` | `string` | Optional | Standard ERP entity attribute |
| `purchaseDescription` | `string` | Optional | Standard ERP entity attribute |
| *... and 8 more fields* | | | See full Item definition |

---


## Billing - Plans

Total APIs in this module: **5**

### 1. `GET` `/api/v1/billing/plans`

- **Controller / Handler:** `getPlans`
- **Route Declaration:** `src/domains/billing/routes/planRoutes.ts`
- **Primary Data Model:** `Plan`
- **Role Authorization:** Authenticated Organization User

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Plan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `planName` | `string` | **Required** | Standard ERP entity attribute |
| `planCode` | `string` | **Required** | Standard ERP entity attribute |
| `productName` | `string` | **Required** | Standard ERP entity attribute |
| `billingFrequency` | `number` | **Required** | Standard ERP entity attribute |
| `billingFrequencyUnit` | `string` | **Required** | Standard ERP entity attribute |
| `price` | `number` | **Required** | Standard ERP entity attribute |
| `setupFee` | `number` | **Required** | Standard ERP entity attribute |
| `freeTrialDays` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 2. `POST` `/api/v1/billing/plans`

- **Controller / Handler:** `createPlan`
- **Route Declaration:** `src/domains/billing/routes/planRoutes.ts`
- **Primary Data Model:** `Plan`
- **Role Authorization:** Authenticated Organization User

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "planName": "Sample planName",
  "planCode": "Sample planCode",
  "productName": "Sample productName",
  "billingFrequency": 100,
  "billingFrequencyUnit": "Sample billingFrequencyUnit",
  "price": 100,
  "setupFee": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Plan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `planName` | `string` | **Required** | Standard ERP entity attribute |
| `planCode` | `string` | **Required** | Standard ERP entity attribute |
| `productName` | `string` | **Required** | Standard ERP entity attribute |
| `billingFrequency` | `number` | **Required** | Standard ERP entity attribute |
| `billingFrequencyUnit` | `string` | **Required** | Standard ERP entity attribute |
| `price` | `number` | **Required** | Standard ERP entity attribute |
| `setupFee` | `number` | **Required** | Standard ERP entity attribute |
| `freeTrialDays` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 3. `GET` `/api/v1/billing/plans/:id`

- **Controller / Handler:** `getPlanById`
- **Route Declaration:** `src/domains/billing/routes/planRoutes.ts`
- **Primary Data Model:** `Plan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number for pagination |
| `limit` | `number` | `25` | Records per page |
| `search` | `string` | `-` | Search keyword for auto-filtering |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Plan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `planName` | `string` | **Required** | Standard ERP entity attribute |
| `planCode` | `string` | **Required** | Standard ERP entity attribute |
| `productName` | `string` | **Required** | Standard ERP entity attribute |
| `billingFrequency` | `number` | **Required** | Standard ERP entity attribute |
| `billingFrequencyUnit` | `string` | **Required** | Standard ERP entity attribute |
| `price` | `number` | **Required** | Standard ERP entity attribute |
| `setupFee` | `number` | **Required** | Standard ERP entity attribute |
| `freeTrialDays` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 4. `PUT` `/api/v1/billing/plans/:id`

- **Controller / Handler:** `updatePlan`
- **Route Declaration:** `src/domains/billing/routes/planRoutes.ts`
- **Primary Data Model:** `Plan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Request Payload (JSON Body):**

```json
{
  "orgId": "Sample orgId",
  "planName": "Sample planName",
  "planCode": "Sample planCode",
  "productName": "Sample productName",
  "billingFrequency": 100,
  "billingFrequencyUnit": "Sample billingFrequencyUnit",
  "price": 100,
  "setupFee": 100
}
```

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Plan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `planName` | `string` | **Required** | Standard ERP entity attribute |
| `planCode` | `string` | **Required** | Standard ERP entity attribute |
| `productName` | `string` | **Required** | Standard ERP entity attribute |
| `billingFrequency` | `number` | **Required** | Standard ERP entity attribute |
| `billingFrequencyUnit` | `string` | **Required** | Standard ERP entity attribute |
| `price` | `number` | **Required** | Standard ERP entity attribute |
| `setupFee` | `number` | **Required** | Standard ERP entity attribute |
| `freeTrialDays` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

### 5. `DELETE` `/api/v1/billing/plans/:id`

- **Controller / Handler:** `deletePlan`
- **Route Declaration:** `src/domains/billing/routes/planRoutes.ts`
- **Primary Data Model:** `Plan`
- **Role Authorization:** Authenticated Organization User

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (ObjectId/Code)` | **Yes** | Unique identifier for entity lookup |

**Response (200 OK Sample):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "_id": "670cde589ab4123456789abc",
    "createdAt": "2026-10-14T06:47:41.418Z",
    "updatedAt": "2026-10-14T06:47:41.418Z"
  }
}
```


**Associated Model Schema (`Plan`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orgId` | `string` | Optional | Standard ERP entity attribute |
| `planName` | `string` | **Required** | Standard ERP entity attribute |
| `planCode` | `string` | **Required** | Standard ERP entity attribute |
| `productName` | `string` | **Required** | Standard ERP entity attribute |
| `billingFrequency` | `number` | **Required** | Standard ERP entity attribute |
| `billingFrequencyUnit` | `string` | **Required** | Standard ERP entity attribute |
| `price` | `number` | **Required** | Standard ERP entity attribute |
| `setupFee` | `number` | **Required** | Standard ERP entity attribute |
| `freeTrialDays` | `number` | **Required** | Standard ERP entity attribute |
| `status` | `string` | **Required** | Standard ERP entity attribute |
| `description` | `string` | **Required** | Standard ERP entity attribute |
| `createdAt` | `Date` | **Required** | Standard ERP entity attribute |
| `updatedAt` | `Date` | **Required** | Standard ERP entity attribute |

---

