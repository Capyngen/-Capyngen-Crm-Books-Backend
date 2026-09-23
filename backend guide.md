# API Developer Guide

> Generated from the current TypeScript implementation. This document describes the contract **as the server currently behaves**, including routes that are declared but not mounted.

## 1. Runtime Status

### Server

- Default port: `5000` (or `PORT` from environment).
- JSON body parsing: enabled.
- CORS: enabled for all origins.
- Health check: `GET /health`.
- Base URL example: `http://localhost:5000`.

### Important: mounted versus declared routes

Only the routes explicitly mounted in `src/app.ts` are reachable at runtime. The Books CRUD routes below are mounted and protected. Core auth, organization, RBAC, billing, Books dashboard, reports, accounting setup and several other route files exist in the repository but are **not mounted in `app.ts` today**. They will return `404` until mounted.

### Books request flow

```text
Client
  -> Express JSON parser
  -> verifyCapyngenToken
  -> requireBooksSubscription
  -> requireFeature(feature key)
  -> route controller
  -> Mongoose model / domain service
  -> response or errorHandler
```

The authenticated employee is taken from the Capyngen JWT and injected as:

```json
{
  "user": { "_id": "employee-id", "role": "...", "email": "..." },
  "org": { "_id": "company-profile-id" }
}
```

The application currently does not show an `AsyncLocalStorage` middleware that populates `requestContext`. Controllers that depend on `requestContext.getStore()` may therefore return `Missing orgId` even when token authentication succeeds.

## 2. Authentication and Headers

### Books authentication

Send one of these:

```http
Authorization: Bearer <Capyngen-access-token>
Content-Type: application/json
```

or a cookie:

```http
Cookie: accessToken_hrms=<token>
```

The legacy cookie name `accessToken` is also accepted.

The token is verified with `ACCESS_TOKEN_SECRET` and its `decoded._id` or `decoded.id` is used to find the employee in the `employees` collection. No Books endpoint accepts an `orgId` header as the tenant source; tenant context is derived from `employee.companyId`.

### Common authentication failures

```json
{ "success": false, "message": "Access Denied: Missing Capyngen Token" }
```

```json
{ "success": false, "message": "Invalid or Expired Capyngen Session" }
```

```json
{ "success": false, "message": "User not found in Capyngen Ecosystem" }
```

## 3. Common Books Subscription Flow

After token verification:

1. `requireBooksSubscription` loads `companyprofiles` using `employee.companyId`.
2. The company must exist.
3. `platformType` must be one of `all`, `accounts`, `books`, `crm`, or `sales`.
4. Each mounted resource then checks the organization subscription and plan feature key.
5. Missing subscription, plan, or feature stops the request before the controller.

Typical responses:

```json
{ "success": false, "message": "Upgrade Required: Your active plan does not include the Books module." }
```

```json
{ "success": false, "message": "No active subscription found. Please subscribe to a plan." }
```

```json
{ "success": false, "message": "Upgrade Required: Your active plan does not include access to this feature." }
```

## 4. Live System Endpoints

These are the endpoints currently mounted in `src/app.ts`.

### Health and subscription context

| Method | Path | Auth | Request | Success response | Flow |
|---|---|---|---|---|---|
| GET | `/health` | None | None | `200 { success: true, message: "Backend is healthy" }` | Health response only |
| GET | `/api/v1/books/me` | Token only | None | `200 { subscription, plan, role }` | Employee -> company profile -> subscription -> plan |

`/api/v1/books/me` returns `{ subscription: null, plan: null }` when the company has no subscription. It returns `401 { success: false }` when organization context is missing.

### Books CRUD routes

All rows below require the Bearer token, Books platform access, and the listed plan feature.

| Method | Path | Feature key | Body/query | Success |
|---|---|---|---|---|
| GET | `/api/v1/books/items` | `accounts-items-directory` | None | `{ success, count, data[] }` |
| POST | `/api/v1/books/items` | `accounts-items-directory` | Item JSON | `201 { success, data }` |
| GET | `/api/v1/books/items/:id` | `accounts-items-directory` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/items/:id` | `accounts-items-directory` | Item fields to update | `{ success, data }` |
| DELETE | `/api/v1/books/items/:id` | `accounts-items-directory` | `id` | `{ success, data: {} }` |
| GET | `/api/v1/books/inventory-adjustments` | `accounts-items-inventory-adjustments` | None | `{ success, count, data[] }` |
| POST | `/api/v1/books/inventory-adjustments` | `accounts-items-inventory-adjustments` | Adjustment JSON | `201 { success, data }` |
| GET | `/api/v1/books/inventory-adjustments/:id` | `accounts-items-inventory-adjustments` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/inventory-adjustments/:id` | `accounts-items-inventory-adjustments` | Adjustment fields | `{ success, data }` |
| DELETE | `/api/v1/books/inventory-adjustments/:id` | `accounts-items-inventory-adjustments` | `id` | `{ success, data: {} }` |
| GET | `/api/v1/books/sales/customers` | `accounts-sales-customers` | None | `{ success, count, data[] }` |
| POST | `/api/v1/books/sales/customers` | `accounts-sales-customers` | Customer JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/customers/:id` | `accounts-sales-customers` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/customers/:id` | `accounts-sales-customers` | Customer fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/customers/:id` | `accounts-sales-customers` | `id` | `{ success, data: {} }` |
| GET | `/api/v1/books/purchases/vendors` | `accounts-purchases-vendors` | None | `{ success, count, data[] }` |
| POST | `/api/v1/books/purchases/vendors` | `accounts-purchases-vendors` | Vendor JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/vendors/:id` | `accounts-purchases-vendors` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/vendors/:id` | `accounts-purchases-vendors` | Vendor fields | `{ success, data }` |
| GET | `/api/v1/books/purchases/expenses` | `accounts-purchases-expenses` | Query supported by controller/model | `{ success, count, data[] }` |
| POST | `/api/v1/books/purchases/expenses` | `accounts-purchases-expenses` | Expense JSON | `201 { success, data }` |
| PUT | `/api/v1/books/purchases/expenses/:id` | `accounts-purchases-expenses` | Expense fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/expenses/:id` | `accounts-purchases-expenses` | `id` | `{ success, message }` or `{ success, data: {} }` |
| POST | `/api/v1/books/purchases/expenses/bulk` | `accounts-purchases-expenses` | `{ expenses: [...] }` | Bulk result |
| PUT | `/api/v1/books/purchases/expenses/bulk/:batchId` | `accounts-purchases-expenses` | Bulk update fields | Bulk result |
| GET | `/api/v1/books/purchases/recurring-expenses` | `accounts-purchases-recurring-expenses` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/recurring-expenses` | `accounts-purchases-recurring-expenses` | Recurring expense JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/recurring-expenses/:id` | `accounts-purchases-recurring-expenses` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/recurring-expenses/:id` | `accounts-purchases-recurring-expenses` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/recurring-expenses/:id` | `accounts-purchases-recurring-expenses` | `id` | Delete response |
| GET | `/api/v1/books/purchases/purchase-orders` | `accounts-purchases-purchase-orders` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/purchase-orders` | `accounts-purchases-purchase-orders` | Purchase order JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/purchase-orders/:id` | `accounts-purchases-purchase-orders` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/purchase-orders/:id` | `accounts-purchases-purchase-orders` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/purchase-orders/:id` | `accounts-purchases-purchase-orders` | `id` | Delete response |
| GET | `/api/v1/books/purchases/bills` | `accounts-purchases-bills` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/bills` | `accounts-purchases-bills` | Bill JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/bills/:id` | `accounts-purchases-bills` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/bills/:id` | `accounts-purchases-bills` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/bills/:id` | `accounts-purchases-bills` | `id` | Delete response |
| GET | `/api/v1/books/purchases/recurring-bills` | `accounts-purchases-recurring-bills` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/recurring-bills` | `accounts-purchases-recurring-bills` | Recurring bill JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/recurring-bills/:id` | `accounts-purchases-recurring-bills` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/recurring-bills/:id` | `accounts-purchases-recurring-bills` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/recurring-bills/:id` | `accounts-purchases-recurring-bills` | `id` | Delete response |
| GET | `/api/v1/books/purchases/payments-made` | `accounts-purchases-payments-made` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/payments-made` | `accounts-purchases-payments-made` | Payment made JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/payments-made/:id` | `accounts-purchases-payments-made` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/payments-made/:id` | `accounts-purchases-payments-made` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/payments-made/:id` | `accounts-purchases-payments-made` | `id` | Delete response |
| GET | `/api/v1/books/purchases/mileage` | `accounts-purchases-mileage` | None | `{ success, data[] }` |
| POST | `/api/v1/books/purchases/mileage` | `accounts-purchases-mileage` | Mileage JSON | `201 { success, data }` |
| GET | `/api/v1/books/purchases/mileage/:id` | `accounts-purchases-mileage` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/purchases/mileage/:id` | `accounts-purchases-mileage` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/purchases/mileage/:id` | `accounts-purchases-mileage` | `id` | Delete response |
| GET | `/api/v1/books/sales/quotes` | `accounts-sales-quotes` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/quotes` | `accounts-sales-quotes` | Quote JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/quotes/:id` | `accounts-sales-quotes` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/quotes/:id` | `accounts-sales-quotes` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/quotes/:id` | `accounts-sales-quotes` | `id` | Delete response |
| GET | `/api/v1/books/sales/sales-orders` | `accounts-sales-sales-orders` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/sales-orders` | `accounts-sales-sales-orders` | Sales order JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/sales-orders/:id` | `accounts-sales-sales-orders` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/sales-orders/:id` | `accounts-sales-sales-orders` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/sales-orders/:id` | `accounts-sales-sales-orders` | `id` | Delete response |
| GET | `/api/v1/books/sales/invoices` | `accounts-sales-invoices` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/invoices` | `accounts-sales-invoices` | Invoice JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/invoices/:id` | `accounts-sales-invoices` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/invoices/:id` | `accounts-sales-invoices` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/invoices/:id` | `accounts-sales-invoices` | `id` | Delete response |
| GET | `/api/v1/books/sales/recurring-invoices` | `accounts-sales-recurring-invoices` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/recurring-invoices` | `accounts-sales-recurring-invoices` | Recurring invoice JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/recurring-invoices/:id` | `accounts-sales-recurring-invoices` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/recurring-invoices/:id` | `accounts-sales-recurring-invoices` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/recurring-invoices/:id` | `accounts-sales-recurring-invoices` | `id` | Delete response |
| GET | `/api/v1/books/sales/delivery-challans` | `accounts-sales-delivery-challans` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/delivery-challans` | `accounts-sales-delivery-challans` | Delivery challan JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/delivery-challans/:id` | `accounts-sales-delivery-challans` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/delivery-challans/:id` | `accounts-sales-delivery-challans` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/delivery-challans/:id` | `accounts-sales-delivery-challans` | `id` | Delete response |
| GET | `/api/v1/books/sales/payments-received` | `accounts-sales-payments-received` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/payments-received` | `accounts-sales-payments-received` | Payment received JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/payments-received/:id` | `accounts-sales-payments-received` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/payments-received/:id` | `accounts-sales-payments-received` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/payments-received/:id` | `accounts-sales-payments-received` | `id` | Delete response |
| GET | `/api/v1/books/sales/credit-notes` | `accounts-sales-credit-notes` | None | `{ success, data[] }` |
| POST | `/api/v1/books/sales/credit-notes` | `accounts-sales-credit-notes` | Credit note JSON | `201 { success, data }` |
| GET | `/api/v1/books/sales/credit-notes/:id` | `accounts-sales-credit-notes` | `id` | `{ success, data }` |
| PUT | `/api/v1/books/sales/credit-notes/:id` | `accounts-sales-credit-notes` | Fields | `{ success, data }` |
| DELETE | `/api/v1/books/sales/credit-notes/:id` | `accounts-sales-credit-notes` | `id` | Delete response |

For standard CRUD routes, list, detail, create, update and delete all call the matching controller. Create/update/delete can also trigger ledger or model hooks for accounting documents; the client should treat a successful response as the persisted document returned in `data`.

## 5. Payload Contracts

There is no shared DTO or request validation layer. The client must send JSON fields accepted by the corresponding Mongoose model. Unknown fields may be discarded by Mongoose, and invalid enum/required values usually become `400`/`500` errors through the error handler.

### Item

```json
{
  "name": "Consulting",
  "sku": "CONS-001",
  "type": "goods",
  "unit": "pcs",
  "salesRate": 1000,
  "purchaseRate": 700,
  "description": "Service or stock description",
  "stock": 0,
  "orgId": "company-id"
}
```

`name`, `salesRate` and `purchaseRate` are required. `type` is `goods` or `service`.

### Customer

```json
{
  "orgId": "company-id",
  "customerType": "business",
  "firstName": "Asha",
  "lastName": "Sharma",
  "companyName": "Asha Foods",
  "displayName": "Asha Foods",
  "email": "asha@example.com",
  "phone": "+91...",
  "mobile": "+91...",
  "billingAddress": { "country": "India", "city": "Delhi", "state": "Delhi", "zipCode": "110001" },
  "shippingAddress": {},
  "contactPersons": [],
  "pan": "ABCDE1234F",
  "currency": "INR",
  "openingBalance": 0,
  "paymentTerms": "Net 30",
  "portalAccess": false,
  "customFields": [],
  "remarks": "",
  "status": "Active"
}
```

`displayName` is required. A positive `openingBalance` posts an Accounts Receivable and Opening Balance Equity ledger transaction.

### Invoice

```json
{
  "orgId": "company-id",
  "invoiceNumber": "INV-1001",
  "customer": "customer-object-id",
  "invoiceDate": "2026-09-23",
  "dueDate": "2026-10-23",
  "status": "Sent",
  "currency": "INR",
  "items": [
    { "item": "item-object-id", "description": "Consulting", "quantity": 1, "rate": 1000, "amount": 1000 }
  ],
  "subTotal": 1000,
  "discountType": "amount",
  "discountValue": 0,
  "discount": 0,
  "taxWithheldType": "none",
  "taxWithheldAmount": 0,
  "adjustment": 0,
  "taxTotal": 0,
  "total": 1000,
  "balanceDue": 1000,
  "notes": "",
  "terms": "",
  "createdBy": "employee-id"
}
```

Required invoice fields: `invoiceNumber`, `customer`, `items[].item`, `invoiceDate`, `subTotal`, `total`, and `balanceDue`. Invoice creation rejects a deactivated customer.

### Bill

```json
{
  "orgId": "company-id",
  "vendorId": "vendor-object-id",
  "billNumber": "BILL-1001",
  "billDate": "2026-09-23",
  "dueDate": "2026-10-23",
  "lineItems": [
    { "itemId": "item-object-id", "account": "Office Expense", "quantity": 1, "rate": 500, "discount": 0, "amount": 500 }
  ],
  "subTotal": 500,
  "discount": 0,
  "discountType": "amount",
  "taxWithheldType": "none",
  "taxWithheldAmount": 0,
  "adjustment": 0,
  "totalAmount": 500,
  "status": "Open",
  "currency": "INR"
}
```

Required bill fields include `vendorId`, `billNumber`, `billDate`, `lineItems[].account`, `lineItems[].quantity`, `lineItems[].rate`, `lineItems[].amount`, `subTotal`, and `totalAmount`.

### Expense

```json
{
  "orgId": "company-id",
  "expenseType": "Goods",
  "date": "2026-09-23",
  "expenseAccount": "Travel",
  "amount": 200,
  "taxAmount": 0,
  "totalAmount": 200,
  "billable": false,
  "status": "Non-Billable",
  "isItemized": false,
  "lineItems": [],
  "currency": "INR",
  "notes": ""
}
```

For mileage expenses use `expenseType: "Mileage"` and `mileageData: { distance, rate, unit, employee }`; `unit` is `km` or `mile`.

### Other transactional documents

The following POST/PUT routes pass the body directly to their model/controller. Use the model name as the payload source and preserve ObjectId/date/enum types:

| Resource | Model contract / important fields |
|---|---|
| Vendor | Vendor identity, contact/address, currency, opening balance, payable/status fields |
| Inventory adjustment | Item reference, adjustment type, quantity/value, date, reason and notes |
| Quote | Quote number, customer, date, expiry, line items, totals, tax, status |
| Sales order | `salesOrderNumber`, customer, order date, items/quantities/rates, totals, status |
| Purchase order | PO number, vendor, order date, line items, totals, status |
| Recurring invoice/bill/expense | Template document fields plus recurrence/frequency/next-run fields defined by the model |
| Payment received/made | Contact, payment date, amount, payment mode/account, reference and allocations |
| Delivery challan | Challan number, customer, date, items/quantities, status |
| Credit note | Credit note number, customer, date, items/amounts, reason and status |
| Mileage expense | Date, distance, rate, unit, employee, amount and notes |

The complete authoritative field definitions are in `src/domains/books/models/*.ts`. The current controllers do not automatically add `orgId` to every created document, so the client should send it where the model supports it and the backend should eventually derive it from auth context.

### Transaction lock

The declared controller contract is:

```json
{
  "lockedUntil": "2026-09-30T23:59:59.000Z",
  "isLocked": true
}
```

`PUT` merges the body with `lockedBy` from the authenticated user. Both lock endpoints require an initialized `requestContext.orgId`.

## 6. Response Contracts

### Standard Books response

```json
{ "success": true, "data": { "_id": "..." } }
```

List endpoints generally return either:

```json
{ "success": true, "count": 1, "data": [] }
```

or:

```json
{ "success": true, "data": [] }
```

Customer and item list/detail endpoints merge Books and Billing records and add `sourceDomain: "books" | "billing"`. A detail request first searches the Books collection, then Billing.

### Error response

Controllers use several legacy shapes. The shared error handler returns:

```json
{
  "success": false,
  "message": "Readable error message",
  "stack": null
}
```

`stack` is included outside production and is `null` in production. Some controllers return `{ message }` without `success`; client code should check HTTP status and handle both shapes.

Common statuses:

| Status | Meaning |
|---:|---|
| 200 | Read/update/delete success |
| 201 | Create success |
| 400 | Validation, missing context, invalid OTP or malformed input |
| 401 | Missing/invalid/expired token |
| 403 | Subscription, feature, permission or protected-admin restriction |
| 404 | Missing record, company, user or invite |
| 500 | Database/server failure |

## 7. Reports and Dashboard: Declared but Not Mounted

The following route files exist, but `app.ts` does not mount them. Intended base paths below are inferred from their route filenames and controller comments; confirm the final prefix when mounting.

### Intended Books routes

| Intended base | Routes |
|---|---|
| `/api/v1/books/dashboard` | `GET /` -> dashboard totals: `totalReceivables`, `totalPayables`, `totalIncome`, `watchlist[]` |
| `/api/v1/books/reports` | All report GET routes listed below |
| `/api/v1/books/chart-of-accounts` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/api/v1/books/currency-adjustments` | Standard GET/list/detail/create/update/delete |
| `/api/v1/books/journals` | Standard GET/list/detail/create/update/delete |
| `/api/v1/books/projects` | Standard GET/list/detail/create/update/delete |
| `/api/v1/books/time-entries` | Standard GET/list/detail/create/update/delete |
| `/api/v1/books/accountant/locks` | `GET /`, `PUT /` |

### Report query parameters

Reports are GET requests. No request body is used. These query parameters are read where applicable:

```text
startDate=2026-01-01&endDate=2026-09-23
accountId=<chart-of-account-id>
```

Dates are converted with JavaScript `new Date(...)`. Omitting dates means the service receives `undefined`. `accountId` is used by `/account-transactions`.

### Complete report route list

Every route below returns `200 { success: true, data }` on success unless noted. The `data` shape is produced by `AdvancedReportsService` and can be an object or array.

| GET path under `/api/v1/books/reports` | Query |
|---|---|
| `/drilldown` | Controller-specific drilldown query |
| `/profit-and-loss` | `startDate`, `endDate` |
| `/sales-by-customer` | None |
| `/sales-by-item` | None |
| `/sales-by-salesperson` | `startDate`, `endDate` |
| `/sales-summary` | `startDate`, `endDate` |
| `/inventory-summary` | Controller-specific service query |
| `/inventory-valuation` | Controller-specific service query |
| `/fifo-tracking` | Controller-specific service query |
| `/profit-by-item` | `startDate`, `endDate` |
| `/sales-channel-sync` | None |
| `/committed-stock` | Controller-specific service query |
| `/inventory-aging` | Controller-specific service query |
| `/stock-summary` | Controller-specific service query |
| `/inventory-adj-summary` | Controller-specific service query |
| `/inventory-adj-details` | Controller-specific service query |
| `/turnover-qty` | Controller-specific service query |
| `/abc-classification` | Controller-specific service query |
| `/turnover-amount` | Controller-specific service query |
| `/weighted-average-cost` | Controller-specific service query |
| `/customer-balances` | None |
| `/vendor-balances` | None |
| `/balance-sheet` | `startDate`, `endDate` |
| `/cash-flow` | None |
| `/horizontal-pl` | None; returns `{ data: { items[] } }` |
| `/horizontal-bs` | None; returns `{ data: { items[] } }` |
| `/movement-of-equity` | None |
| `/business-performance-ratios` | None |
| `/trial-balance` | `startDate`, `endDate` |
| `/general-ledger` | None |
| `/journal-report` | None |
| `/receivables-aging` | Controller-specific service query |
| `/invoice-details` | Controller-specific service query |
| `/ar-aging-details` | Controller-specific service query |
| `/so-details` | Controller-specific service query |
| `/delivery-challan-details` | Controller-specific service query |
| `/quote-details` | Controller-specific service query |
| `/quote-item-details` | Controller-specific service query |
| `/receivable-summary` | Controller-specific service query |
| `/receivable-details` | Controller-specific service query |
| `/payables-aging` | Controller-specific service query |
| `/po-details` | Controller-specific service query |
| `/ap-aging-details` | Controller-specific service query |
| `/vendor-credit-details` | Controller-specific service query |
| `/payables-refund-history` | Controller-specific service query |
| `/po-by-vendor` | Controller-specific service query |
| `/po-by-item` | Controller-specific service query |
| `/payable-summary` | Controller-specific service query |
| `/payable-details` | Controller-specific service query |
| `/expenses-by-category` | Controller-specific service query |
| `/expense-details` | Controller-specific service query |
| `/purchases-by-vendor` | Controller-specific service query |
| `/purchases-by-item` | Controller-specific service query |
| `/project-summary` | Controller-specific service query |
| `/timesheet-profitability` | Controller-specific service query |
| `/payments-received-report` | Controller-specific service query |
| `/payments-made-report` | Controller-specific service query |
| `/tax-summary` | Controller-specific service query |
| `/budget-vs-actual` | Controller-specific service query |
| `/activity-log` | Controller-specific service query |
| `/day-book` | None |
| `/account-transactions` | `accountId` |
| `/account-type-summary` | None |
| `/detailed-general-ledger` | `startDate`, `endDate` |

The reports route file currently declares duplicate handlers for `/horizontal-pl`, `/horizontal-bs`, `/movement-of-equity`, `/trial-balance`, `/general-ledger`, and `/journal-report`. Express uses the first matching handler, so the duplicates should be removed before relying on route ordering.

## 8. Core Auth, Organization and RBAC: Declared but Not Mounted

No core route router is mounted in `app.ts`. The following is the controller-level contract if these routers are mounted.

### Auth router

Suggested mount: `/api/v1/auth`.

| Method | Path | Body | Success / flow |
|---|---|---|---|
| POST | `/check-invite` | `{ email }` | `{ state: "existing_user" }`, `{ state: "invited_user", orgId }`, or `404 { state: "not_found" }` |
| POST | `/accept-invite-signup` | `{ email, password }` | Sets password and links invited mappings; does not activate invite |
| POST | `/login` | `{ emailOrMobile, password, useOtp }` | Password: `{ message, user }`; OTP mode: `{ message: "OTP sent", method: "otp" }` |
| POST | `/login/verify` | `{ emailOrMobile, otp }` | OTP must currently equal `123456`; returns `{ message, user }` |
| POST | `/signup` | `{ role, companyName, email, mobile, password, country, state }` | Creates user if absent, returns signup OTP message and user |
| POST | `/signup/verify` | `{ email, otp }` | OTP must currently equal `1234567`; verifies user and activates pending mappings |

These auth controllers do not generate or return the Capyngen access JWT. The app must obtain that token from the upstream identity/session system.

### Organization router

Suggested mount: `/api/v1/organizations`.

| Method | Path | Body/headers | Response / flow |
|---|---|---|---|
| POST | `/setup` | `{ userId, companyName, industry, location, state, currency, language, timeZone, gstRegistered, gstNumber }` | `201 { message, organization }`; creates org and admin mapping |
| GET | `/` | `x-user-id` header | `200 { success, data[] }`; finds owned/mapped orgs and attaches role permissions |
| POST | `/join` | `{ orgId }` | Activates matching invited user mapping; requires context userId |

### RBAC router

Suggested mount: `/api/v1/rbac`. Every endpoint also requires `requirePermission` for the relevant settings area.

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/roles` | None | `{ success, data[] }` |
| GET | `/roles/:id` | None | `{ success, data }` |
| POST | `/roles` | `{ name, description, parentRoleId, permissions }` | `201 { success, data }` |
| PUT | `/roles/:id` | Same role fields | `{ success, data }` |
| DELETE | `/roles/:id` | None | `{ success, message: "Role deleted" }` |
| GET | `/users` | None | `{ success, data[] }` |
| POST | `/users/invite` | `{ email, name, roleId }` | `201 { success, message, data }` |
| PUT | `/users/:id` | `{ roleId }` | `{ success, data }` |
| DELETE | `/users/:id` | None | `{ success, message }` |

RBAC controllers use `requestContext.orgId`, while the permission middleware implementation and context-population middleware are not wired in `app.ts` in the current snapshot.

## 9. Billing: Declared but Not Mounted

Billing route files exist but are not mounted. Suggested mount names are `/api/v1/billing/customers`, `/api/v1/billing/items`, `/api/v1/billing/plans`, and `/api/v1/billing/dashboard`.

| Resource | Routes | Controller contract |
|---|---|---|
| Customers | GET/POST `/`, GET/PUT/DELETE `/:id` | Standard CRUD; response uses `{ success, data }` or list `{ success, data[] }` |
| Items | GET/POST `/`, GET/PUT/DELETE `/:id` | Standard CRUD |
| Plans | GET/POST `/`, GET/PUT/DELETE `/:id` | Plan CRUD, including feature keys used by Books middleware |
| Dashboard | GET `/` | Billing dashboard data |

## 10. Client Integration Checklist

1. Use the exact mounted Books paths in section 4.
2. Attach `Authorization: Bearer <token>` to every Books call.
3. Treat `success`, `data`, `count`, and `message` as separate optional fields; response envelopes are not uniform.
4. Send ISO-8601 date strings and numeric amounts as JSON numbers.
5. Do not assume login responses contain a JWT; the current login controller returns a user only.
6. Do not send a client-selected organization as the security boundary; the server derives it from the token employee.
7. Handle `401`, `403`, `404`, `400`, and both `{ success: false, message }` and `{ message }` error forms.
8. Do not build UI against unmounted routes until the backend mounts them and adds integration tests.

## 11. Backend Handoff Blockers

Before calling the API stable for a new app, the backend team should resolve:

- Mount the intended auth, organization, RBAC, billing, dashboard and reports routers.
- Add request-context middleware so `requestContext.getStore()` contains authenticated user/org data.
- Make tenant scoping consistent; several list/create controllers query or save without `orgId` filters.
- Replace hard-coded OTP values with a real OTP provider and expiry.
- Decide whether login should issue the same JWT expected by `verifyCapyngenToken`.
- Normalize response envelopes and validation errors.
- Remove duplicate report route declarations.
- Add integration tests for every mounted route, subscription feature gate, tenant isolation and error status.
