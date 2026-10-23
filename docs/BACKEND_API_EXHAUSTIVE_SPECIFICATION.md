# Capyngen Enterprise ERP — Backend API Exhaustive Specification
> **Comprehensive Technical Reference for Books, Billing, and Inventory Domains**
> Version: 2.0 Enterprise | Date: October 2026 | Protocol: RESTful JSON over HTTPS

---
## Table of Contents
1. [System Architecture, Multi-Tenancy & Global Standards](#1-system-architecture-multi-tenancy--global-standards)
2. [Core Identity, Authentication & Context APIs](#2-core-identity-authentication--context-apis)
3. [Multi-Tenancy, Organization & RBAC APIs](#3-multi-tenancy-organization--rbac-apis)
4. [Approval Workflow Engine APIs](#4-approval-workflow-engine-apis)
5. [Books: Items & Inventory Adjustments APIs](#5-books-items--inventory-adjustments-apis)
6. [Books: Sales & Order-to-Cash (O2C) APIs](#6-books-sales--order-to-cash-o2c-apis)
7. [Books: Purchases & Procure-to-Pay (P2P) APIs](#7-books-purchases--procure-to-pay-p2p-apis)
8. [Books: Accountant & General Ledger (GL) APIs](#8-books-accountant--general-ledger-gl-apis)
9. [Books: Banking, Reconciliation & Treasury Forecast APIs](#9-books-banking-reconciliation--treasury-forecast-apis)
10. [Books: Time Tracking & Projects APIs](#10-books-time-tracking--projects-apis)
11. [Books: HRMS, Payroll & Employee Expense Claims APIs](#11-books-hrms-payroll--employee-expense-claims-apis)
12. [Books: Financial, Operational & Analytical Reports APIs](#12-books-financial-operational--analytical-reports-apis)
13. [Inventory: Warehouses, Operations & Manufacturing APIs](#13-inventory-warehouses-operations--manufacturing-apis)
14. [Billing: Subscriptions & Product Catalog APIs](#14-billing-subscriptions--product-catalog-apis)
15. [Customer Portal, Document Upload & Webhooks APIs](#15-customer-portal-document-upload--webhooks-apis)

---
## 1. System Architecture, Multi-Tenancy & Global Standards

### 1.1 Base URLs & Protocols
- **Development Server:** `http://localhost:5000`
- **Production Gateway:** `https://books.orinite.com`
- **HRMS Gateway Proxy Target:** `http://127.0.0.1:3000` (or `process.env.HRMS_BACKEND_URL`)

### 1.2 Global Request Headers
| Header Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Authorization` | `string` | Yes (for protected endpoints) | Bearer JWT access token | `Bearer eyJhbGciOi...` |
| `x-company-id` / `x-org-id` | `string` | Optional (defaults to token) | Multi-tenant organization ObjectId | `6aa797278d301b4735f1d322` |
| `Content-Type` | `string` | Yes | Request payload content type | `application/json` |
| `Accept` | `string` | Yes | Expected response format | `application/json` |

### 1.3 Standard JSON Envelopes
#### Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 128,
    "pages": 6
  }
}
```

#### Error Envelope (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Error details or validation failures",
  "statusCode": 400
}
```

## 2. Core Identity, Authentication & Context APIs

### `POST` /api/v1/employees/login
**Employee / User Login**

- **Description:** Authenticates an employee using email and password. Falls back to local database authentication if the HRMS microservice is unavailable.
- **Authentication:** `Public`

**Request Body:**
```json
{
  "email": "admin@spinny.com",
  "password": "Password@123"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6aa797278d301b4735f1d329",
    "id": "6aa797278d301b4735f1d329",
    "email": "admin@spinny.com",
    "firstName": "Nitesh",
    "lastName": "Thakur",
    "role": "Admin",
    "company": {
      "_id": "6aa797278d301b4735f1d322",
      "name": "Spinny Fleet Telematics"
    }
  }
}
```

---

### `POST` /api/v1/auth/spinny-login
**Direct Spinny Admin One-Click Login**

- **Description:** Generates a signed JWT session for Spinny administrative workflows.
- **Authentication:** `Public / Dev`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "6aa797278d301b4735f1d329",
    "role": "Admin",
    "company": {
      "_id": "6aa797278d301b4735f1d322",
      "name": "Spinny"
    }
  }
}
```

---

### `POST` /api/v1/auth/dev-login
**Development Bypass Login**

- **Description:** Rapid test session generation for local pair-programming and QA verification.
- **Authentication:** `Public / Dev`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "role": "Admin",
    "company": {
      "name": "Spinny"
    }
  }
}
```

---

### `GET` /api/v1/books/me
**Organization Identity & Subscription Context Resolver**

- **Description:** Resolves the caller organization profile, active subscription plan, modules unlocked, and caller role.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "subscription": {
    "_id": "6ad5b62c24f4c564a0071135",
    "status": "Active",
    "billingCycle": "Annual",
    "planId": "6a9aab2b37f115525a01b0dc"
  },
  "plan": {
    "_id": "6a9aab2b37f115525a01b0dc",
    "name": "Enterprise",
    "featureKeys": [
      "*"
    ]
  },
  "role": "Admin"
}
```

---

### `GET` /health
**System Health Check**

- **Description:** Returns server operational status, database connectivity status, and uptime metrics.
- **Authentication:** `Public`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Backend is healthy"
}
```

---

## 3. Multi-Tenancy, Organization & RBAC APIs

### `POST` /api/v1/organizations/setup
**Initialize New Organization**

- **Description:** Creates a new multi-tenant organization, seeds default Chart of Accounts, fiscal calendars, and administrative roles.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "companyName": "Apex Innovations Pvt Ltd",
  "industry": "Technology",
  "currency": "INR",
  "fiscalYearStartMonth": 4,
  "timeZone": "Asia/Kolkata"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "organization": {
      "_id": "6b0102030405060708090a0b",
      "companyName": "Apex Innovations Pvt Ltd",
      "currency": "INR"
    }
  }
}
```

---

### `GET` /api/v1/organizations
**List User Organizations**

- **Description:** Retrieves all organizations associated with the currently authenticated user session.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa797278d301b4735f1d322",
      "name": "Spinny Fleet Telematics",
      "role": "Admin"
    },
    {
      "_id": "6abdf9a7c076b4bb072b4587",
      "name": "Honda Logistics",
      "role": "Admin"
    }
  ]
}
```

---

### `POST` /api/v1/organizations/join
**Join Organization via Invite Token**

- **Description:** Validates an invitation code and associates the current employee with the target organization.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "invitationToken": "inv_8f7e6d5c4b3a21"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Successfully joined organization"
}
```

---

### `GET` /api/v1/rbac/roles
**List Organization RBAC Roles**

- **Description:** Returns all defined roles and their granular permission matrices for the tenant.
- **Authentication:** `verifyCapyngenToken`
- **RBAC Permission Required:** `settings.roles (read)`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa891011121314151617181",
      "name": "Accountant",
      "permissions": [
        "accounts-journals-read",
        "accounts-invoices-read",
        "accounts-bills-create"
      ]
    },
    {
      "_id": "6aa891011121314151617182",
      "name": "Sales Manager",
      "permissions": [
        "accounts-sales-quotes-full",
        "accounts-sales-invoices-full"
      ]
    }
  ]
}
```

---

### `POST` /api/v1/rbac/roles
**Create Custom RBAC Role**

- **Description:** Defines a new tenant role with explicit read, create, edit, delete, and approve permissions per module.
- **Authentication:** `verifyCapyngenToken`
- **RBAC Permission Required:** `settings.roles (create)`

**Request Body:**
```json
{
  "name": "Inventory Controller",
  "description": "Manages warehouse transfers and cycle counting",
  "permissions": [
    "inventory-warehouses-full",
    "inventory-transfer-orders-full",
    "inventory-cycle-counts-full"
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6aa991011121314151617183",
    "name": "Inventory Controller"
  }
}
```

---

### `GET` /api/v1/rbac/users
**List Tenant Users**

- **Description:** Retrieves all users/employees assigned to the organization with their assigned RBAC roles and status.
- **Authentication:** `verifyCapyngenToken`
- **RBAC Permission Required:** `settings.users (read)`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa797278d301b4735f1d329",
      "firstName": "Nitesh",
      "lastName": "Thakur",
      "email": "nitesht206@gmail.com",
      "role": "Admin",
      "status": "Active"
    }
  ]
}
```

---

### `POST` /api/v1/rbac/users/invite
**Invite User to Organization**

- **Description:** Dispatches an email invitation to a team member to access Books, Billing, or Inventory.
- **Authentication:** `verifyCapyngenToken`
- **RBAC Permission Required:** `settings.users (create)`

**Request Body:**
```json
{
  "email": "newuser@spinny.com",
  "role": "Staff",
  "roleId": "6aa891011121314151617181"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

---

### `POST` /api/v1/books/admin/purge-test-data
**Purge Company Test Data**

- **Description:** Safely truncates dummy transactions (invoices, bills, orders) while preserving Chart of Accounts, settings, and users.
- **Authentication:** `verifyCapyngenToken (Admin/Owner only)`

**Request Body:**
```json
{
  "confirmPurge": true
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Test transactions purged successfully"
}
```

---

## 4. Approval Workflow Engine APIs

### `GET` /api/v1/approvals/rules
**Get Multi-Tier Approval Rules**

- **Description:** Fetches configured approval thresholds and approver lists across Sales, Purchases, Journals, and Payments.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "invoices": {
      "enabled": true,
      "thresholdAmount": 50000,
      "approvers": [
        "Admin",
        "FinanceDirector"
      ]
    },
    "purchaseOrders": {
      "enabled": true,
      "thresholdAmount": 25000,
      "approvers": [
        "ProcurementLead",
        "Admin"
      ]
    },
    "journals": {
      "enabled": true,
      "thresholdAmount": 100000,
      "approvers": [
        "ChiefFinancialOfficer"
      ]
    }
  }
}
```

---

### `PUT` /api/v1/approvals/rules/:module
**Configure Module Approval Rule**

- **Description:** Updates threshold limits and mandatory approvers for a specific transaction module.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** `module` = `invoices` | `purchaseOrders` | `bills` | `journals` | `leaves`

**Request Body:**
```json
{
  "enabled": true,
  "thresholdAmount": 75000,
  "approvers": [
    "Admin"
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Approval rule updated successfully"
}
```

---

### `GET` /api/v1/approvals/pending
**List Pending Approval Requests**

- **Description:** Returns all transactions currently awaiting the caller review/approval signature.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6ad90102030405060708090a",
      "module": "invoices",
      "documentId": "6ad80102030405060708090a",
      "documentNumber": "INV-0042",
      "amount": 85000,
      "submittedBy": "sales.agent@spinny.com",
      "submittedAt": "2026-10-18T14:30:00Z",
      "status": "Pending"
    }
  ]
}
```

---

### `POST` /api/v1/approvals/submit
**Submit Transaction for Multi-Tier Approval**

- **Description:** Transitions a Draft transaction into Pending Approval status and notifies approvers.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "module": "invoices",
  "documentId": "6ad80102030405060708090a",
  "notes": "Urgent client requirement exceeding threshold"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Submitted for approval"
}
```

---

### `POST` /api/v1/approvals/approve
**Approve Transaction**

- **Description:** Approves transaction, updates approval workflow status to Approved, and triggers GL Posting and Stock Deduction.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "module": "invoices",
  "documentId": "6ad80102030405060708090a",
  "comments": "Reviewed and verified against client PO"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

### `POST` /api/v1/approvals/reject
**Reject Transaction**

- **Description:** Rejects transaction with mandatory audit justification reason and returns it to Draft state.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "module": "invoices",
  "documentId": "6ad80102030405060708090a",
  "reason": "Billing address mismatch with client GST certificate"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Transaction rejected"
}
```

---

## 5. Books: Items & Inventory Adjustments APIs

### `GET` /api/v1/books/items
**List Items & Catalog Products**

- **Description:** Fetches paginated inventory items, service items, and digital goods with stock levels and pricing.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-items-directory`
- **Query / Path Parameters:** `page=1&limit=25&type=goods|service&search=iPhone`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6ad10102030405060708090a",
      "name": "MacBook Pro 16\" M3",
      "sku": "MBP-16-M3",
      "type": "goods",
      "salesRate": 2499,
      "purchaseRate": 2100,
      "stockOnHand": 42,
      "reorderPoint": 10,
      "status": "Active"
    }
  ]
}
```

---

### `POST` /api/v1/books/items
**Create Item**

- **Description:** Creates a new physical good, service, or assembly item with pricing, tax rules, and initial stock.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-items-directory`

**Request Body:**
```json
{
  "name": "Dell UltraSharp 32\" 4K Monitor",
  "sku": "DELL-U32-4K",
  "type": "goods",
  "unit": "pcs",
  "salesRate": 850,
  "salesAccountId": "6a810102030405060708090a",
  "purchaseRate": 650,
  "purchaseAccountId": "6a810102030405060708090b",
  "initialStock": 15,
  "initialStockRate": 650,
  "reorderPoint": 5,
  "taxRate": 18,
  "isTaxable": true
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad10102030405060708090b",
    "name": "Dell UltraSharp 32\" 4K Monitor",
    "sku": "DELL-U32-4K"
  }
}
```

---

### `POST` /api/v1/books/inventory-adjustments
**Create Inventory Stock Adjustment**

- **Description:** Adjusts stock on hand (quantity or valuation) with automatic General Ledger inventory variance posting.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-items-inventory-adjustments`

**Request Body:**
```json
{
  "mode": "quantity",
  "date": "2026-10-18",
  "reason": "Stock damage during transit",
  "warehouseId": "6ad20102030405060708090a",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "currentQuantity": 42,
      "adjustedQuantity": 40,
      "variance": -2
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad30102030405060708090a",
    "adjustmentNumber": "ADJ-00012",
    "status": "Adjusted"
  }
}
```

---

## 6. Books: Sales & Order-to-Cash (O2C) APIs

### `POST` /api/v1/books/sales/customers
**Create Customer**

- **Description:** Registers a business or individual client with billing/shipping addresses, GSTIN, and credit terms.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-customers`

**Request Body:**
```json
{
  "displayName": "Global Infotech Solutions Pvt Ltd",
  "customerType": "business",
  "email": "billing@globalinfotech.com",
  "phone": "+91 98765 43210",
  "gstin": "27AABCU9603R1ZM",
  "currency": "INR",
  "paymentTerms": "net30",
  "billingAddress": {
    "street": "402 Cyber City, Tower B",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411028",
    "country": "India"
  }
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad40102030405060708090a",
    "displayName": "Global Infotech Solutions Pvt Ltd"
  }
}
```

---

### `POST` /api/v1/books/sales/quotes
**Create Sales Quote / Estimate**

- **Description:** Generates a customer quotation with line items, tax breakdowns, discounts, and expiry date.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-quotes`

**Request Body:**
```json
{
  "customerId": "6ad40102030405060708090a",
  "quoteNumber": "QUO-00042",
  "date": "2026-10-18",
  "expiryDate": "2026-11-18",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "description": "MacBook Pro 16\" M3 Max",
      "quantity": 2,
      "rate": 2499,
      "discount": 5,
      "taxPercentage": 18,
      "taxAmount": 854.65,
      "total": 5602.75
    }
  ],
  "terms": "Payment due 30 days from invoice generation."
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad50102030405060708090a",
    "quoteNumber": "QUO-00042",
    "status": "Draft",
    "totalAmount": 5602.75
  }
}
```

---

### `POST` /api/v1/books/sales/quotes/:id/convert-to-sales-order
**Convert Quote to Sales Order**

- **Description:** Transforms an accepted quote directly into a Confirmed Sales Order, copying line items and terms.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-quotes`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "salesOrderId": "6ad60102030405060708090a",
    "orderNumber": "SO-00089"
  }
}
```

---

### `POST` /api/v1/books/sales/sales-orders
**Create Sales Order**

- **Description:** Creates a confirmed sales order and reserves stock quantities in inventory.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-sales-orders`

**Request Body:**
```json
{
  "customerId": "6ad40102030405060708090a",
  "orderNumber": "SO-00089",
  "orderDate": "2026-10-18",
  "expectedShipmentDate": "2026-10-25",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "quantity": 2,
      "rate": 2499,
      "amount": 4998
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad60102030405060708090a",
    "orderNumber": "SO-00089",
    "status": "Confirmed"
  }
}
```

---

### `POST` /api/v1/books/sales/invoices
**Create Sales Invoice**

- **Description:** Creates a sales tax invoice. When approved, triggers posting to Accounts Receivable, Sales Revenue, and Tax Payable GL accounts.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-invoices`

**Request Body:**
```json
{
  "customerId": "6ad40102030405060708090a",
  "invoiceNumber": "INV-2026-0099",
  "invoiceDate": "2026-10-18",
  "dueDate": "2026-11-17",
  "salesOrderId": "6ad60102030405060708090a",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "description": "MacBook Pro 16\" M3 Max",
      "quantity": 2,
      "rate": 2499,
      "taxPercentage": 18,
      "amount": 4998
    }
  ],
  "subtotal": 4998,
  "taxTotal": 899.64,
  "total": 5897.64
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad70102030405060708090a",
    "invoiceNumber": "INV-2026-0099",
    "status": "Sent",
    "balanceDue": 5897.64
  }
}
```

---

### `POST` /api/v1/books/sales/payments-received
**Record Customer Payment Received**

- **Description:** Records payment against one or more outstanding invoices, debits Bank Account, credits Accounts Receivable, and updates invoice balances.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-payments-received`

**Request Body:**
```json
{
  "customerId": "6ad40102030405060708090a",
  "paymentDate": "2026-10-18",
  "paymentMode": "Bank Transfer",
  "amount": 5897.64,
  "depositToAccountId": "6a810102030405060708090c",
  "referenceNumber": "NEFT-8899220011",
  "invoicesAllocated": [
    {
      "invoiceId": "6ad70102030405060708090a",
      "amountApplied": 5897.64
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad80102030405060708090b",
    "paymentNumber": "PMT-RCV-0034",
    "status": "Closed"
  }
}
```

---

### `POST` /api/v1/books/sales/credit-notes
**Issue Credit Note**

- **Description:** Issues a credit note for returned goods or billing adjustments, crediting customer account and reversing revenue/tax.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-sales-credit-notes`

**Request Body:**
```json
{
  "customerId": "6ad40102030405060708090a",
  "creditNoteNumber": "CN-00015",
  "date": "2026-10-18",
  "reason": "Client discount adjustment post billing",
  "totalAmount": 500
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad90102030405060708090c",
    "creditNoteNumber": "CN-00015",
    "remainingCredits": 500,
    "status": "Open"
  }
}
```

---

## 7. Books: Purchases & Procure-to-Pay (P2P) APIs

### `POST` /api/v1/books/purchases/vendors
**Create Vendor / Supplier**

- **Description:** Registers a supplier with bank account details, PAN/GSTIN, payment terms, and vendor category.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-purchases-vendors`

**Request Body:**
```json
{
  "displayName": "SuperMicro Systems Inc.",
  "email": "orders@supermicro.com",
  "phone": "+1 408 503 8000",
  "currency": "USD",
  "paymentTerms": "net45"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ae10102030405060708090a",
    "displayName": "SuperMicro Systems Inc."
  }
}
```

---

### `POST` /api/v1/books/purchases/purchase-orders
**Create Purchase Order**

- **Description:** Creates a purchase order to vendor. Approvals are enforced if amount exceeds organization approval threshold.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-purchases-purchase-orders`

**Request Body:**
```json
{
  "vendorId": "6ae10102030405060708090a",
  "poNumber": "PO-2026-0045",
  "date": "2026-10-18",
  "expectedDeliveryDate": "2026-11-05",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "quantity": 10,
      "rate": 2100,
      "amount": 21000
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ae20102030405060708090a",
    "poNumber": "PO-2026-0045",
    "status": "Issued"
  }
}
```

---

### `POST` /api/v1/books/purchases/bills
**Create Vendor Bill**

- **Description:** Records an incoming vendor bill against PO. Credits Accounts Payable and debits Inventory or Expense accounts.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-purchases-bills`

**Request Body:**
```json
{
  "vendorId": "6ae10102030405060708090a",
  "billNumber": "BILL-88390",
  "billDate": "2026-10-18",
  "dueDate": "2026-12-02",
  "lineItems": [
    {
      "itemId": "6ad10102030405060708090a",
      "quantity": 10,
      "rate": 2100,
      "amount": 21000
    }
  ],
  "totalAmount": 21000
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ae30102030405060708090a",
    "billNumber": "BILL-88390",
    "status": "Open",
    "balanceDue": 21000
  }
}
```

---

### `POST` /api/v1/books/purchases/payments-made
**Record Payment Made to Vendor**

- **Description:** Disburses payment against outstanding vendor bills, debiting Accounts Payable and crediting Bank/Cash.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `accounts-purchases-payments-made`

**Request Body:**
```json
{
  "vendorId": "6ae10102030405060708090a",
  "paymentDate": "2026-10-18",
  "paidThroughAccountId": "6a810102030405060708090c",
  "paymentMode": "Wire Transfer",
  "amount": 21000,
  "billsAllocated": [
    {
      "billId": "6ae30102030405060708090a",
      "amountApplied": 21000
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ae40102030405060708090a",
    "paymentNumber": "PMT-MADE-0081",
    "status": "Closed"
  }
}
```

---

## 8. Books: Accountant & General Ledger (GL) APIs

### `GET` /api/v1/books/chart-of-accounts
**Get Chart of Accounts Tree**

- **Description:** Fetches the hierarchical Chart of Accounts structured under Assets, Liabilities, Equity, Revenue, and Expenses.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6a810102030405060708090c",
      "code": "1001",
      "name": "Operating Bank Account (HDFC)",
      "category": "Asset",
      "balance": 1450200.5
    },
    {
      "_id": "6a810102030405060708090d",
      "code": "2001",
      "name": "Accounts Payable",
      "category": "Liability",
      "balance": 245000
    }
  ]
}
```

---

### `POST` /api/v1/books/journals
**Create Manual Journal Entry**

- **Description:** Creates a double-entry journal entry. Validates that sum(debit) == sum(credit) before posting to Ledger.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "journalDate": "2026-10-18",
  "referenceNumber": "JRN-2026-108",
  "notes": "Depreciation accrual for Q3 compute servers",
  "lines": [
    {
      "accountId": "6a810102030405060708090e",
      "debit": 15000,
      "credit": 0,
      "description": "Depreciation Expense"
    },
    {
      "accountId": "6a810102030405060708090f",
      "debit": 0,
      "credit": 15000,
      "description": "Accumulated Depreciation - Fixed Assets"
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6af10102030405060708090a",
    "journalNumber": "JRN-2026-108",
    "postingStatus": "Posted"
  }
}
```

---

### `POST` /api/v1/books/closing/execute/:fiscalYearId
**Execute Fiscal Year-End Closing**

- **Description:** Transfers net profit/loss into Retained Earnings, resets temporary P&L accounts, and locks the closed fiscal period.
- **Authentication:** `verifyCapyngenToken (Admin only)`
- **Query / Path Parameters:** `fiscalYearId` = Target fiscal year ObjectId

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Fiscal year closed and locked successfully"
}
```

---

## 9. Books: Banking, Reconciliation & Treasury Forecast APIs

### `GET` /api/v1/books/banking/accounts
**List Bank Accounts**

- **Description:** Retrieves all corporate checking, savings, and credit card accounts with live book vs cleared balances.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6a810102030405060708090c",
      "accountName": "HDFC Corporate Prime Checking",
      "accountNumber": "XXXXXX5012",
      "currency": "INR",
      "bookBalance": 1450200.5,
      "bankBalance": 1445000
    }
  ]
}
```

---

### `POST` /api/v1/books/reconciliation/reconcile
**Match & Reconcile Bank Transactions**

- **Description:** Matches imported bank feed statement lines with recorded ERP transactions and marks them as Reconciled.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "bankAccountId": "6a810102030405060708090c",
  "statementLineId": "6b110102030405060708090a",
  "matchedTransactionId": "6ad80102030405060708090b",
  "transactionType": "payment_received"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Statement line successfully reconciled"
}
```

---

### `GET` /api/v1/books/treasury/forecast
**AI Treasury 90-Day Cash Forecast**

- **Description:** Projects 30, 60, and 90-day cash positions based on scheduled AR collections, AP due dates, payroll, and recurring expenses.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "currentCash": 1450200.5,
    "forecast30Days": 1820500,
    "forecast60Days": 2150000,
    "forecast90Days": 2490000,
    "riskLevel": "Low"
  }
}
```

---

## 10. Books: Time Tracking & Projects APIs

### `POST` /api/v1/books/projects
**Create Project**

- **Description:** Initializes a client or internal project with hourly/fixed billing methods, budget limits, and team members.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "projectName": "Cloud Fleet Telematics Revamp",
  "customerId": "6ad40102030405060708090a",
  "billingType": "hourly_project_rate",
  "projectRate": 85,
  "budgetHours": 200
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6b210102030405060708090a",
    "projectName": "Cloud Fleet Telematics Revamp",
    "status": "Active"
  }
}
```

---

### `GET` /api/v1/books/projects/:id/profitability
**Get Project EVM & Profitability**

- **Description:** Calculates Earned Value Metrics (Planned Value, Earned Value, Actual Cost, CPI, SPI) and gross margin percentage.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** `id` = Project ObjectId

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "actualHours": 120,
    "budgetHours": 200,
    "totalBilled": 10200,
    "totalLaborCost": 4800,
    "grossProfit": 5400,
    "marginPercentage": 52.9,
    "cpi": 1.15
  }
}
```

---

## 11. Books: HRMS, Payroll & Employee Expense Claims APIs

### `GET` /api/v1/books/hrms/employees
**List Employees**

- **Description:** Retrieves employees across departments with designation, payroll status, and attendance summaries.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa797278d301b4735f1d329",
      "firstName": "Nitesh",
      "lastName": "Thakur",
      "department": "Engineering",
      "role": "Admin",
      "status": "Active"
    }
  ]
}
```

---

### `POST` /api/v1/books/hrms/payroll
**Initiate Monthly Payroll Batch**

- **Description:** Generates payroll draft batch calculating gross pay, PF, ESI, TDS deductions, and net payout per employee.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "month": 10,
  "year": 2026,
  "payrollCycle": "Monthly",
  "departments": [
    "Engineering",
    "Sales",
    "Finance"
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6b310102030405060708090a",
    "batchNumber": "PAY-2026-10",
    "totalEmployees": 45,
    "totalGrossPayout": 2850000,
    "status": "Draft"
  }
}
```

---

### `POST` /api/v1/books/hrms/payroll/:id/finalize
**Finalize & Post Payroll Batch to GL**

- **Description:** Approves payroll batch and automatically posts Salaries Expense, PF Payable, and Bank Net Pay entries into GL.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** `id` = Payroll Batch ObjectId

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Payroll finalized and posted to General Ledger"
}
```

---

## 12. Books: Financial, Operational & Analytical Reports APIs

The ERP provides over 40 distinct real-time financial, tax, and inventory reporting endpoints under `/api/v1/books/reports/`:

| Endpoint Path | Report Name | Description |
| :--- | :--- | :--- |
| `GET /api/v1/books/reports/profit-and-loss` | **Profit and Loss Statement** | Operating revenues, cost of goods sold, and operating expenses. |
| `GET /api/v1/books/reports/balance-sheet` | **Balance Sheet** | Assets, liabilities, and owners equity balances. |
| `GET /api/v1/books/reports/cash-flow` | **Cash Flow Statement** | Operating, investing, and financing cash flows. |
| `GET /api/v1/books/reports/horizontal-pl` | **Horizontal P&L Schedule III** | Comparative horizontal format for statutory compliance. |
| `GET /api/v1/books/reports/horizontal-bs` | **Horizontal Balance Sheet Schedule III** | Comparative horizontal balance sheet format. |
| `GET /api/v1/books/reports/trial-balance` | **Trial Balance** | Summarized debit and credit balances for every COA ledger. |
| `GET /api/v1/books/reports/general-ledger` | **General Ledger Report** | Detailed transaction lines across all debit/credit accounts. |
| `GET /api/v1/books/reports/ar-aging-details` | **Accounts Receivable Aging Details** | Detailed receivables grouped into 0-30, 31-60, 61-90, 90+ buckets. |
| `GET /api/v1/books/reports/ap-aging-details` | **Accounts Payable Aging Details** | Detailed payables grouped into chronological aging buckets. |
| `GET /api/v1/books/reports/stock-summary` | **Inventory Stock Summary** | Quantity available, committed, incoming, and valuation per SKU. |
| `GET /api/v1/books/reports/inventory-aging` | **Inventory Aging Report** | Identifies slow-moving, obsolete, and high-turnover inventory lots. |
| `GET /api/v1/books/reports/turnover-qty` | **Inventory Turnover by Quantity** | Calculates sales volume turnover ratio per item. |
| `GET /api/v1/books/reports/abc-classification` | **ABC Inventory Classification** | Categorizes items into Class A (high value), B (medium), C (low value). |
| `GET /api/v1/books/reports/tax-summary` | **Tax Summary Report** | Summary of input tax credits (ITC) and output tax liabilities. |
| `GET /api/v1/books/reports/budget-vs-actual` | **Budget vs Actual Performance** | Variance analysis comparing planned budgets against actual GL spend. |
| `GET /api/v1/books/reports/drilldown` | **Ledger Transaction Drilldown** | Drills down into source invoices, bills, or journals from any report line. |


## 13. Inventory: Warehouses, Operations & Manufacturing APIs

### `POST` /api/v1/books/inventory/warehouses
**Create Warehouse**

- **Description:** Creates a physical or virtual warehouse location with bin aisle tracking.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "name": "North Logistics Hub (Gurgaon)",
  "code": "WH-GGN-01",
  "address": "Plot 45, Sector 18, Electronic City, Gurgaon",
  "status": "Active"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6ad20102030405060708090a",
    "name": "North Logistics Hub (Gurgaon)",
    "code": "WH-GGN-01"
  }
}
```

---

### `POST` /api/v1/books/inventory/transfer-orders
**Create Warehouse Transfer Order**

- **Description:** Initiates stock transfer between source and destination warehouses.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "fromWarehouseId": "6ad20102030405060708090a",
  "toWarehouseId": "6ad20102030405060708090b",
  "date": "2026-10-18",
  "items": [
    {
      "itemId": "6ad10102030405060708090a",
      "quantity": 5
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6b410102030405060708090a",
    "transferNumber": "TO-00021",
    "status": "Draft"
  }
}
```

---

### `POST` /api/v1/books/inventory/transfer-orders/:id/dispatch
**Dispatch Transfer Order**

- **Description:** Marks items In Transit and decrements source warehouse stock balance.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** `id` = Transfer Order ObjectId

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "status": "In Transit"
}
```

---

### `POST` /api/v1/books/inventory/transfer-orders/:id/receive
**Receive Transfer Order**

- **Description:** Receives transferred goods into destination warehouse bins and closes order.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** `id` = Transfer Order ObjectId

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "status": "Received"
}
```

---

### `POST` /api/v1/books/inventory/work-orders
**Create Manufacturing Work Order**

- **Description:** Creates a discrete manufacturing order exploding Bill of Materials (BOM) into raw materials.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "assemblyItemId": "6ad10102030405060708090a",
  "quantityToBuild": 50,
  "routingId": "6b510102030405060708090a",
  "targetWarehouseId": "6ad20102030405060708090a"
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6b610102030405060708090a",
    "workOrderNumber": "WO-2026-0012",
    "status": "In Production"
  }
}
```

---

### `GET` /api/v1/books/inventory/mrp/plan
**Calculate MRP Material Requirements**

- **Description:** Runs the MRP heuristic engine computing gross requirements, scheduled receipts, and suggested purchase orders.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "shortages": [
      {
        "itemId": "6ad10102030405060708090a",
        "sku": "MBP-16-M3",
        "requiredQty": 25,
        "availableQty": 10,
        "suggestedPoQty": 15
      }
    ]
  }
}
```

---

## 14. Billing: Subscriptions & Product Catalog APIs

### `GET` /api/v1/billing/dashboard
**Get Billing SaaS Dashboard Metrics**

- **Description:** Computes Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Churn Rate, and Active Subscriptions count.
- **Authentication:** `verifyCapyngenToken`
- **Subscription Feature Key:** `billing-dashboard-home`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "mrr": 125000,
    "arr": 1500000,
    "activeSubscriptions": 342,
    "netChurnRate": 1.2
  }
}
```

---

### `POST` /api/v1/billing/plans
**Create SaaS Subscription Plan**

- **Description:** Creates a recurring billing plan with trial days, billing cycles, pricing tiers, and module feature keys.
- **Authentication:** `verifyCapyngenToken`

**Request Body:**
```json
{
  "name": "Growth Cloud Tier",
  "code": "PLAN-GROWTH",
  "billingFrequency": "Monthly",
  "price": 99,
  "currency": "USD",
  "trialDays": 14,
  "featureKeys": [
    "billing-sales-customers",
    "billing-documents"
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "6b710102030405060708090a",
    "name": "Growth Cloud Tier"
  }
}
```

---

## 15. Customer Portal, Document Upload & Webhooks APIs

### `POST` /api/v1/upload
**Upload File / Supporting Attachment to AWS S3**

- **Description:** Uploads receipts, invoices, vendor quotes, or tax certificates to secure AWS S3 storage.
- **Authentication:** `verifyCapyngenToken`
- **Query / Path Parameters:** Multipart form data with `file` field

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": {
    "url": "https://claveecom.s3.ap-south-1.amazonaws.com/uploads/receipt_99210.pdf",
    "fileName": "receipt_99210.pdf",
    "size": 142500
  }
}
```

---

### `POST` /api/v1/integration/crm/deal-won
**CRM Deal-Won Cross-System Webhook**

- **Description:** Receives Deal-Won events from external CRM to automatically instantiate Customer profile and Draft Sales Invoice.
- **Authentication:** `Signed Integration Payload`

**Request Body:**
```json
{
  "dealId": "crm_deal_88301",
  "customerName": "Acrobat Logistics Corp",
  "contactEmail": "accounts@acrobatlogistics.com",
  "dealAmount": 12500,
  "items": [
    {
      "name": "Fleet Telematics OBD Units",
      "quantity": 10,
      "rate": 1250
    }
  ]
}
```

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Customer and Sales Order created from CRM deal"
}
```

---

### `GET` /api/v1/books/audit-trail
**Get Immutable System Audit Trail**

- **Description:** Retrieves audit logs of all create, update, delete, approve, and void operations across the platform.
- **Authentication:** `verifyCapyngenToken`

**Request Body:** None

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6b810102030405060708090a",
      "action": "APPROVE",
      "module": "invoices",
      "documentNumber": "INV-2026-0099",
      "userId": "6aa797278d301b4735f1d329",
      "userEmail": "nitesht206@gmail.com",
      "timestamp": "2026-10-18T16:15:22Z",
      "ipAddress": "122.161.44.12"
    }
  ]
}
```

---

