# Complete API Developer Guide

> Source basis: `backend guide.md`, `src/app.ts`, route files, controllers and Mongoose models in the current repository snapshot. This is a source-faithful contract, not a proposed API. Where the source does not define a field, query, response property, calculation or mount prefix, this document says so explicitly.

## Table of Contents

1. [Conventions, authentication and errors](#1-conventions-authentication-and-errors)
2. [Health and Books subscription context](#2-health-and-books-subscription-context)
3. [Books CRUD - Items and inventory](#3-books-crud---items-and-inventory)
4. [Books CRUD - Sales](#4-books-crud---sales)
5. [Books CRUD - Purchases](#5-books-crud---purchases)
6. [Transaction locks](#6-transaction-locks)
7. [Declared Books dashboard and accounting modules](#7-declared-books-dashboard-and-accounting-modules)
8. [Reports - every route](#8-reports---every-route)
9. [Core auth](#9-core-auth)
10. [Organization](#10-organization)
11. [RBAC](#11-rbac)
12. [Billing](#12-billing)
13. [Source gaps and handoff blockers](#13-source-gaps-and-handoff-blockers)

## 1. Conventions, authentication and errors

### 1.1 Base URL and transport

- Base URL: `http://localhost:5000` by default; `PORT` may override it.
- JSON parsing and CORS are enabled globally.
- JSON requests use `Content-Type: application/json`.
- Dates are ISO-8601 strings in examples and are converted by Mongoose/JavaScript date handling.
- Mongoose timestamps add `createdAt` and `updatedAt` where the model has `timestamps: true`.
- Source does not define request DTO validation or pagination middleware.

### 1.2 Auth headers and middleware chain

Bearer header:

```http
Authorization: Bearer <Capyngen-access-token>
Content-Type: application/json
```

Accepted cookies are `accessToken_hrms=<token>` and legacy `accessToken=<token>`.

Mounted Books chain, in order:

```text
Express JSON parser
 -> verifyCapyngenToken
    -> JWT verification with ACCESS_TOKEN_SECRET
    -> employees lookup using decoded._id or decoded.id
    -> req.user and req.org injection
 -> requireBooksSubscription
    -> companyprofiles lookup using employee.companyId
    -> platformType must be all/accounts/books/crm/sales
 -> requireFeature(feature key)
    -> subscription, plan and featureKeys lookup
 -> route controller
 -> errorHandler
```

`verifyCapyngenToken` injects:

```json
{
  "user": { "_id": "employee-id", "role": "Admin", "email": "a@example.com" },
  "org": { "_id": "company-profile-id" }
}
```

`GET /health` has no auth. `GET /api/v1/books/me` uses only `verifyCapyngenToken`, not the Books subscription/feature gates.

### 1.3 Common error envelopes

```json
{ "success": false, "message": "Readable error message" }
```

The shared error handler can return:

```json
{ "success": false, "message": "Readable error message", "stack": null }
```

`stack` is `null` in production and may contain a stack outside production. Some controllers return `{ "message": "..." }` without `success`.

| Status | Source-defined triggers |
|---:|---|
| 400 | Validation, malformed input, missing context, invalid OTP, model validation error |
| 401 | Missing/invalid/expired token, missing organization context |
| 403 | Unsupported platform, missing subscription/plan/feature, permission failure |
| 404 | Missing company, record, user or invite; unmounted route also results in 404 |
| 409 | Possible duplicate/unique constraint; exact envelope is controller/database dependent |
| 500 | Database/server failure or error-handler fallback |

For every endpoint below, an error row marked `common` means the exact common envelope above plus the endpoint-specific trigger. The source does not define a more precise payload for that case.

### 1.4 Standard CRUD endpoint contract

The following per-operation contract is used only where the route file actually declares that operation.

- **GET list**: `200 { success: true, count?: number, data: [] }`. `count` is controller-dependent; pagination fields are not defined in source. Query parameters are controller-dependent unless listed.
- **GET detail**: `200 { success: true, data: object }`; `404` when the record is not found.
- **POST create**: `201 { success: true, data: createdObject }`; body is passed to the controller/model unless the endpoint says otherwise.
- **PUT update**: `200 { success: true, data: updatedObject }`; body contains source-supported fields, but exact update semantics are controller-dependent.
- **DELETE**: `200` with `{ success: true, data: {} }` or `{ success: true, message: "..." }` where declared. Delete operations not present in a route file are not available.

Generic error cases for these operations: `400` validation/invalid ObjectId, `404` missing record, `500` persistence failure. Books endpoints additionally have the auth/subscription/feature `401/403/404/500` cases from section 1.2.

---

## 2. Health and Books subscription context

### 2.1 GET /health

1. **Method + Full Path:** `GET /health`
2. **Auth requirement:** None; middleware chain is Express JSON parser -> health handler.
3. **Path Params:** None.
4. **Query Params:** None are read by source.
5. **Request Body:** No body. Example: none.
6. **Success Response:** `200`

```json
{ "success": true, "message": "Backend is healthy" }
```

7. **Error Responses:** No explicit handler-level error response is defined; unexpected failure is subject to `errorHandler` and may be `500 { success:false, message, stack }`.
8. **Business Logic / Side Effects:** Returns a constant health message; no database or ledger side effect.
9. **Text-based Flow:** Request -> Express -> health handler -> JSON response.
10. **Status:** ✅ LIVE/MOUNTED

### 2.2 GET /api/v1/books/me

1. **Method + Full Path:** `GET /api/v1/books/me`
2. **Auth requirement:** Bearer/cookie Capyngen token. Chain: JSON parser -> `verifyCapyngenToken` -> employee lookup -> `req.org` injection -> handler.
3. **Path Params:** None.
4. **Query Params:** None are read by source.
5. **Request Body:** No body. Example: none.
6. **Success Response:** `200`

```json
{
  "subscription": { "_id": "subscription-id", "planId": "plan-id" },
  "plan": { "_id": "plan-id", "featureKeys": ["accounts-items-directory"] },
  "role": "Admin"
}
```

When the company or `subscriptionId` is absent, source returns `200 { "subscription": null, "plan": null }` without a `role` field. Exact subscription/plan fields are database-document dependent.
7. **Error Responses:** `401 { success:false }` when `req.org._id` is missing; common auth `401` for missing/invalid token; `500` for database failure (exact handler envelope source-dependent).
8. **Business Logic / Side Effects:** Reads `companyprofiles`, then `subscriptions`, then `plans`; no mutation.
9. **Text-based Flow:** Token -> employee -> company profile -> optional subscription -> optional plan -> response.
10. **Status:** ✅ LIVE/MOUNTED

---

## 3. Books CRUD - Items and inventory

### 3.1 Item schema used by all Item operations

Fields are from `src/domains/books/models/Item.ts`:

| Field | Type | Required | Allowed/default |
|---|---|---:|---|
| `orgId` | string | no | none |
| `name` | string | yes | none |
| `sku` | string | no | `""` |
| `type` | string | no | `goods`, `service`; default `goods` |
| `unit` | string | no | `"pcs"` |
| `salesRate` | number | yes | default `0`, non-negative |
| `purchaseRate` | number | yes | default `0`, non-negative |
| `description` | string | no | `""` |
| `stock` | number | no | `0` |
| `createdBy` | string | no | `piyushsharma12452` |
| `createdAt`, `updatedAt` | date | response | timestamps |

Complete create example:

```json
{
  "orgId": "company-id",
  "name": "Consulting",
  "sku": "CONS-001",
  "type": "service",
  "unit": "pcs",
  "salesRate": 1000,
  "purchaseRate": 700,
  "description": "Monthly consulting",
  "stock": 0,
  "createdBy": "employee-id"
}
```

### 3.2 Item endpoints

#### GET /api/v1/books/items

1. **Method + Full Path:** `GET /api/v1/books/items`
2. **Auth requirement:** Bearer/cookie -> `verifyCapyngenToken` -> `requireBooksSubscription` -> `requireFeature('accounts-items-directory')` -> `getItems`.
3. **Path Params:** None.
4. **Query Params:** No list query is defined in the route/source contract. ⚠️ NOT DEFINED IN SOURCE — needs backend confirmation.
5. **Request Body:** None; example `null`.
6. **Success Response:** `200 { "success": true, "count": 1, "data": [<Item>] }`; exact count/pagination behavior is controller-defined and no pagination fields are defined.
7. **Error Responses:** Common `401/403/404/500`; `500` database failure.
8. **Business Logic / Side Effects:** Reads items; source does not define tenant filter behavior.
9. **Text-based Flow:** Auth -> feature gate -> controller -> item query -> list envelope.
10. **Status:** ✅ LIVE/MOUNTED

#### POST /api/v1/books/items

1. **Method + Full Path:** `POST /api/v1/books/items`
2. **Auth requirement:** Same chain as item list, ending in `createItem`.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** Full Item schema in section 3.1; `name`, `salesRate`, `purchaseRate` are required; example shown there.
6. **Success Response:** `201 { "success": true, "data": <Item> }`.
7. **Error Responses:** `400` schema/amount validation; common auth/subscription/feature errors; `500` persistence failure.
8. **Business Logic / Side Effects:** Persists an item. No stock/ledger calculation is defined in the model/controller source.
9. **Text-based Flow:** Auth -> feature gate -> body -> Mongoose validation/defaults -> save -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### GET /api/v1/books/items/:id

1. **Method + Full Path:** `GET /api/v1/books/items/:id`
2. **Auth requirement:** Same item middleware chain -> `getItemById`.
3. **Path Params:** `id` string/ObjectId, required, example `65f000000000000000000001`.
4. **Query Params:** None defined.
5. **Request Body:** None; example `null`.
6. **Success Response:** `200 { "success": true, "data": <Item> }`.
7. **Error Responses:** `404` missing item; `400` malformed id if controller validates it; common auth/feature errors; `500` database failure.
8. **Business Logic / Side Effects:** Read only.
9. **Text-based Flow:** Auth -> feature gate -> id lookup -> detail response.
10. **Status:** ✅ LIVE/MOUNTED

#### PUT /api/v1/books/items/:id

1. **Method + Full Path:** `PUT /api/v1/books/items/:id`
2. **Auth requirement:** Same item middleware chain -> `updateItem`.
3. **Path Params:** `id` string/ObjectId, required, example `65f000000000000000000001`.
4. **Query Params:** None defined.
5. **Request Body:** Any source-supported Item fields; no separate update DTO. Example: `{ "salesRate": 1250, "description": "Updated" }`.
6. **Success Response:** `200 { "success": true, "data": <updated Item> }`.
7. **Error Responses:** `400` invalid field/value; `404` missing item; common auth/feature errors; `500` persistence failure.
8. **Business Logic / Side Effects:** Updates model fields; no ledger/stock recalculation is defined.
9. **Text-based Flow:** Auth -> feature gate -> id/body -> update -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### DELETE /api/v1/books/items/:id

1. **Method + Full Path:** `DELETE /api/v1/books/items/:id`
2. **Auth requirement:** Same item middleware chain. Route file does not declare a DELETE handler.
3. **Path Params:** `id` would be a required ObjectId if mounted, but this route is not declared.
4. **Query Params:** Not applicable.
5. **Request Body:** None; no source schema because no handler exists.
6. **Success Response:** None; this request reaches `404`.
7. **Error Responses:** `404` route not found; standard error envelope is not guaranteed.
8. **Business Logic / Side Effects:** None because no handler executes.
9. **Text-based Flow:** Auth/feature middleware may run at mounted prefix -> no matching route -> Express 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404) — more precisely, resource delete is absent from the route file.

### 3.3 Inventory adjustment schema

From `InventoryAdjustment.ts`:

```json
{
  "orgId": "company-id",
  "mode": "quantity",
  "referenceNumber": "ADJ-1001",
  "date": "2026-09-23T00:00:00.000Z",
  "reason": "Damaged stock",
  "description": "Warehouse count adjustment",
  "account": "Inventory Adjustment",
  "items": [
    { "item": "item-object-id", "quantityAdjusted": -2 }
  ],
  "createdBy": "employee-id"
}
```

`mode` enum: `quantity | value`; `date`, `reason`, `account`, `items[].item`, `items[].quantityAdjusted` are required. `referenceNumber` and `description` default to empty strings; `date` defaults to now.

### 3.4 Inventory adjustment endpoints

#### GET /api/v1/books/inventory-adjustments

1. **Method + Full Path:** `GET /api/v1/books/inventory-adjustments`
2. **Auth requirement:** Token -> Books subscription -> `requireFeature('accounts-items-inventory-adjustments')` -> `getAdjustments`.
3. **Path Params:** None.
4. **Query Params:** None defined; pagination/count behavior is not defined beyond the guide's generic list envelope.
5. **Request Body:** None.
6. **Success Response:** `200 { "success": true, "count": 1, "data": [<InventoryAdjustment>] }` (exact count is controller-dependent).
7. **Error Responses:** Common `401/403/404/500`.
8. **Business Logic / Side Effects:** Reads adjustments; source does not define whether stock is recalculated on read.
9. **Text-based Flow:** Auth -> feature gate -> query -> list response.
10. **Status:** ✅ LIVE/MOUNTED

#### POST /api/v1/books/inventory-adjustments

1. **Method + Full Path:** `POST /api/v1/books/inventory-adjustments`
2. **Auth requirement:** Same inventory chain -> `createAdjustment`.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** Schema in section 3.3; complete example is shown there.
6. **Success Response:** `201 { "success": true, "data": <InventoryAdjustment> }`.
7. **Error Responses:** `400` required/enum/ObjectId validation; common feature errors; `500` persistence failure.
8. **Business Logic / Side Effects:** Model stores adjustment rows. ⚠️ NOT DEFINED IN SOURCE — actual stock/ledger mutation and value-mode calculation need backend confirmation.
9. **Text-based Flow:** Auth -> feature gate -> validate item references/body -> save -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### GET /api/v1/books/inventory-adjustments/:id

1. **Method + Full Path:** `GET /api/v1/books/inventory-adjustments/:id`
2. **Auth requirement:** Same chain -> `getAdjustmentById`.
3. **Path Params:** `id` required ObjectId; example `65f000000000000000000002`.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** `200 { "success": true, "data": <InventoryAdjustment> }`.
7. **Error Responses:** `404` missing record; `400` malformed id; common auth/feature errors; `500` database failure.
8. **Business Logic / Side Effects:** Read only.
9. **Text-based Flow:** Auth -> feature gate -> id lookup -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### PUT /api/v1/books/inventory-adjustments/:id

1. **Method + Full Path:** `PUT /api/v1/books/inventory-adjustments/:id`
2. **Auth requirement:** Same chain -> `updateAdjustment`.
3. **Path Params:** `id` required ObjectId; example `65f000000000000000000002`.
4. **Query Params:** None defined.
5. **Request Body:** Partial/full adjustment schema from section 3.3; example `{ "reason": "Recount", "items": [{ "item": "item-object-id", "quantityAdjusted": 1 }] }`.
6. **Success Response:** `200 { "success": true, "data": <updated InventoryAdjustment> }`.
7. **Error Responses:** `400`, `404`, common auth/feature errors, `500`.
8. **Business Logic / Side Effects:** ⚠️ NOT DEFINED IN SOURCE — whether updating reverses/reapplies stock or ledger entries needs backend confirmation.
9. **Text-based Flow:** Auth -> feature gate -> id/body -> update -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### DELETE /api/v1/books/inventory-adjustments/:id

1. **Method + Full Path:** `DELETE /api/v1/books/inventory-adjustments/:id`
2. **Auth requirement:** Prefix auth/feature middleware exists, but route file has no DELETE handler.
3. **Path Params:** `id` required if implemented; currently no handler.
4. **Query Params:** None.
5. **Request Body:** None.
6. **Success Response:** None; `404` route not found.
7. **Error Responses:** `404` unmatched route; exact envelope is not defined.
8. **Business Logic / Side Effects:** None.
9. **Text-based Flow:** Middleware -> no route match -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404) — delete is absent from the route file.

---

## 4. Books CRUD - Sales

### 4.1 Sales resource route and feature map

Each row is an individual endpoint family. Every family has `GET /`, `POST /`, `GET /:id`, `PUT /:id`; none of the sales route files declares DELETE.

| Resource/base path | Feature key | Status |
|---|---|---|
| Customers `/api/v1/books/sales/customers` | `accounts-sales-customers` | ✅ mounted |
| Quotes `/api/v1/books/sales/quotes` | `accounts-sales-quotes` | ✅ mounted |
| Sales orders `/api/v1/books/sales/sales-orders` | `accounts-sales-sales-orders` | ✅ mounted |
| Invoices `/api/v1/books/sales/invoices` | `accounts-sales-invoices` | ✅ mounted |
| Recurring invoices `/api/v1/books/sales/recurring-invoices` | `accounts-sales-recurring-invoices` | ✅ mounted |
| Delivery challans `/api/v1/books/sales/delivery-challans` | `accounts-sales-delivery-challans` | ✅ mounted |
| Payments received `/api/v1/books/sales/payments-received` | `accounts-sales-payments-received` | ✅ mounted |
| Credit notes `/api/v1/books/sales/credit-notes` | `accounts-sales-credit-notes` | ✅ mounted |

### 4.2 Customer schema

Customer body (all fields shown; required fields are marked):

```json
{
  "orgId": "company-id",
  "customerType": "business",
  "salutation": "Ms",
  "firstName": "Asha",
  "lastName": "Sharma",
  "companyName": "Asha Foods",
  "displayName": "Asha Foods",
  "email": "asha@example.com",
  "phone": "+91-1100000000",
  "mobile": "+91-9900000000",
  "billingAddress": { "attention": "Asha", "country": "India", "street1": "1 Main Road", "street2": "Floor 2", "city": "Delhi", "state": "Delhi", "zipCode": "110001", "phone": "+91-1100000000", "fax": "" },
  "shippingAddress": {},
  "contactPersons": [{ "firstName": "Ravi", "lastName": "Sharma", "email": "ravi@example.com", "phone": "+91-9800000000", "designation": "Accounts" }],
  "pan": "ABCDE1234F",
  "currency": "INR",
  "accountsReceivable": "Accounts Receivable",
  "openingBalance": 0,
  "paymentTerms": "Net 30",
  "portalAccess": false,
  "customFields": [{ "label": "Segment", "value": "Retail" }],
  "remarks": "Preferred customer",
  "status": "Active",
  "receivables": 0,
  "unusedCredits": 0,
  "createdBy": "employee-id"
}
```

`displayName` is required. `customerType` is `business | individual`; `status` is `Active | Inactive`; nested address fields are optional strings; contact-person fields have no required flags in the Mongoose nested schema; custom field `label`/`value` are source interface fields but the nested schema does not mark them required.

### 4.3 Customer endpoint contracts

#### GET /api/v1/books/sales/customers

1. **Method + Full Path:** `GET /api/v1/books/sales/customers`
2. **Auth requirement:** Token -> Books subscription -> `requireFeature('accounts-sales-customers')` -> `getCustomers`.
3. **Path Params:** None.
4. **Query Params:** None defined. ⚠️ NOT DEFINED IN SOURCE — needs backend confirmation.
5. **Request Body:** None.
6. **Success Response:** `200 { success:true, count?:number, data:[<Customer or merged Books/Billing record>] }`; source guide says customer lists may include `sourceDomain: "books" | "billing"`.
7. **Error Responses:** Common `401/403/404/500`.
8. **Business Logic / Side Effects:** Reads Books/Billing customer records according to controller; exact tenant/filter logic not defined.
9. **Text-based Flow:** Auth -> subscription -> feature -> controller -> query/merge -> list response.
10. **Status:** ✅ LIVE/MOUNTED

#### POST /api/v1/books/sales/customers

1. **Method + Full Path:** `POST /api/v1/books/sales/customers`
2. **Auth requirement:** Same chain -> `createCustomer`.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** Full customer schema in section 4.2; `displayName` required; example shown there.
6. **Success Response:** `201 { success:true, data:<Customer> }`.
7. **Error Responses:** `400` validation; common auth/feature errors; `500` persistence/ledger failure.
8. **Business Logic / Side Effects:** A positive `openingBalance` posts Accounts Receivable and Opening Balance Equity according to the source guide; exact ledger shape is not defined.
9. **Text-based Flow:** Auth -> feature -> validate -> save customer -> optional opening-balance ledger -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### GET /api/v1/books/sales/customers/:id

1. **Method + Full Path:** `GET /api/v1/books/sales/customers/:id`
2. **Auth requirement:** Same chain -> `getCustomerById`.
3. **Path Params:** `id` required ObjectId; example `65f000000000000000000003`.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** `200 { success:true, data:<Customer> }`; detail searches Books then Billing and may add `sourceDomain`.
7. **Error Responses:** `404` missing customer; `400` malformed id; common auth/feature errors; `500`.
8. **Business Logic / Side Effects:** Read only.
9. **Text-based Flow:** Auth -> feature -> Books lookup -> Billing fallback -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### PUT /api/v1/books/sales/customers/:id

1. **Method + Full Path:** `PUT /api/v1/books/sales/customers/:id`
2. **Auth requirement:** Same chain -> `updateCustomer`.
3. **Path Params:** `id` required ObjectId.
4. **Query Params:** None defined.
5. **Request Body:** Partial/full customer schema; example `{ "status": "Inactive", "paymentTerms": "Net 45" }`.
6. **Success Response:** `200 { success:true, data:<updated Customer> }`.
7. **Error Responses:** `400`, `404`, common auth/feature errors, `500`.
8. **Business Logic / Side Effects:** Updates customer; delete hook prevents hard deletion when invoices exist, but this route file exposes no DELETE.
9. **Text-based Flow:** Auth -> feature -> id/body -> update -> response.
10. **Status:** ✅ LIVE/MOUNTED

#### DELETE /api/v1/books/sales/customers/:id

1. **Method + Full Path:** `DELETE /api/v1/books/sales/customers/:id`
2. **Auth requirement:** No route handler is declared; the prefix middleware exists.
3. **Path Params:** `id` would be required if implemented.
4. **Query Params:** None.
5. **Request Body:** None.
6. **Success Response:** None; `404` unmatched route.
7. **Error Responses:** `404` route not found.
8. **Business Logic / Side Effects:** None.
9. **Text-based Flow:** Prefix middleware -> no DELETE route -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404) — delete is absent from the route file.

### 4.4 Shared sales document schemas

The following field definitions are authoritative for POST/PUT bodies. For every nested `items` array, each item has `item` (ObjectId, required), `description` (string optional), `quantity` (number required, default 1), `rate` (number required, default 0), and `amount` (number required, default 0), unless noted.

**Quote:** required `quoteNumber` string, `customer` ObjectId, `quoteDate` date, `items[]`, `subTotal` number, `total` number. Enums: `status = Draft | Sent | Accepted | Declined | Expired | Invoiced`; `discountType = amount | percent`; `taxWithheldType = TDS | TCS | none`. Optional fields: `orgId`, `expiryDate`, `referenceNumber`, `invoiceId`, `discountValue`, `discount`, `taxWithheldAmount`, `adjustment`, `taxTotal`, `salesperson`, `projectName`, `projectDetails`, `subject`, `attachments[]`, `notes`, `terms`, `createdBy`. Example:

```json
{ "orgId":"company-id", "quoteNumber":"Q-1001", "customer":"customer-id", "quoteDate":"2026-09-23", "expiryDate":"2026-10-23", "status":"Sent", "items":[{"item":"item-id","description":"Consulting","quantity":1,"rate":1000,"amount":1000}], "subTotal":1000, "discountType":"amount", "discountValue":0, "discount":0, "taxWithheldType":"none", "taxWithheldAmount":0, "adjustment":0, "taxTotal":0, "total":1000, "notes":"", "terms":"Net 30", "createdBy":"employee-id" }
```

**Sales order:** same item and totals fields as Quote, with required `salesOrderNumber`, `customer`, `salesOrderDate`, `subTotal`, `total`; enums `status = Draft | Open | Closed | Cancelled | Invoiced`, `discountType = amount | percent`, `taxWithheldType = TDS | TCS | none`; optional `expectedShipmentDate`, `referenceNumber`, `salesperson`, `deliveryMethod`, `paymentTerms`, `attachments[]`, `notes`, `terms`, `createdBy`.

**Invoice:** required `invoiceNumber`, `customer`, `invoiceDate`, `items[]`, `subTotal`, `total`, `balanceDue`; enums `status = Draft | Sent | Viewed | Paid | PartiallyPaid | Void | Overdue`, `discountType = amount | percent`, `taxWithheldType = TDS | TCS | none`; optional fields are `taxConfigurationId`, `branchId`, `projectId`, `reportingTagIds[]`, `currency`, `exchangeRate`, `baseTotal`, `orgId`, `dueDate`, `paymentTerms`, `referenceNumber`, `orderNumber`, `salesOrderId`, `accountsReceivable`, `discountValue`, `discount`, `taxWithheldAmount`, `adjustment`, `taxTotal`, `salesperson`, `projectName`, `projectDetails` (mixed), `subject`, `attachments[]`, `notes`, `terms`, `createdBy`. Example:

```json
{ "orgId":"company-id", "invoiceNumber":"INV-1001", "customer":"customer-id", "invoiceDate":"2026-09-23", "dueDate":"2026-10-23", "status":"Sent", "currency":"INR", "items":[{"item":"item-id","description":"Consulting","quantity":1,"rate":1000,"amount":1000}], "subTotal":1000, "discountType":"amount", "discountValue":0, "discount":0, "taxWithheldType":"none", "taxWithheldAmount":0, "adjustment":0, "taxTotal":0, "total":1000, "balanceDue":1000, "notes":"", "terms":"Net 30", "createdBy":"employee-id" }
```

**Recurring invoice:** required `profileName`, `customer`, `repeatEvery`, `startsOn`, `items[]`, `subTotal`, `total`, `createdBy` interface field; `neverExpires` boolean default false; enums `status = Active | Stopped | Draft`, `discountType = amount | percent`, `taxWithheldType = TDS | TCS | none`; remaining fields follow Invoice template. Example: `{ "profileName":"Monthly consulting", "customer":"customer-id", "repeatEvery":"1 month", "startsOn":"2026-10-01", "neverExpires":true, "status":"Active", "items":[{"item":"item-id","quantity":1,"rate":1000,"amount":1000}], "subTotal":1000,"total":1000,"createdBy":"employee-id" }`.

**Delivery challan:** required `challanNumber`, `customer`, `challanDate`, `items[]`, `subTotal`, `total`; `challanType = Supply of Liquid Gas | Job Work | Supply on Approval | Others`; `status = Draft | Open | Delivered | Returned | Closed`; item shape is the shared sales item shape. Example: `{ "challanNumber":"DC-1001", "customer":"customer-id", "challanDate":"2026-09-23", "challanType":"Others", "status":"Open", "items":[{"item":"item-id","quantity":2,"rate":500,"amount":1000}], "subTotal":1000,"total":1000,"createdBy":"employee-id" }`.

**Payment received:** required `customer`, `amount`, `paymentDate`, `paymentNumber`, `paymentMode`, `invoices[].amountApplied` when invoice allocation is sent; `invoices[]` entries contain `invoice` ObjectId and `amountApplied` number. Enums `status = Unused | Partially Used | Closed`; fields include `branchId`, `projectId`, `reportingTagIds[]`, `currency`, `exchangeRate`, `baseTotal`, `orgId`, `unusedAmount`, `bankCharges`, `depositTo`, `referenceNumber`, `taxDeducted`, `taxType`, `taxAmount`, `amountUsed`, `amountRefunded`, `amountInExcess`, `notes`, `attachments[]`, `sendThankYouNote`, `createdBy`. Example: `{ "customer":"customer-id","amount":1000,"paymentDate":"2026-09-23","paymentNumber":"PAY-1001","paymentMode":"Bank Transfer","depositTo":"Bank","taxDeducted":false,"invoices":[{"invoice":"invoice-id","amountApplied":1000}],"status":"Closed","currency":"INR","sendThankYouNote":true,"createdBy":"employee-id" }`.

**Credit note:** required `customer`, `creditNoteNumber`, `creditNoteDate`, `items[]`, `items[].quantity`, `items[].rate`, `items[].amount`, `subTotal`, `total`; enums `status = Draft | Open | Closed | Void`, `discountType = percent | amount`. Nested `refunds[]` has required `date`, `amount`, optional `reference`; `appliedToInvoices[]` has `invoiceId`, `amountApplied`. Example: `{ "customer":"customer-id","creditNoteNumber":"CN-1001","creditNoteDate":"2026-09-23","status":"Draft","items":[{"item":"item-id","description":"Returned item","quantity":1,"rate":100,"amount":100}],"subTotal":100,"discountType":"percent","discountValue":0,"discount":0,"adjustment":0,"total":100,"createdBy":"employee-id" }`.

### 4.5 Individual sales endpoints

For each resource below, the five endpoint contracts are listed individually. `Resource schema` refers to section 4.4, `Customer schema` to 4.2. Each list/detail/create/update has the same common error cases from section 1.3; exact controller-specific extras are not defined.

#### Quotes

- **GET `/api/v1/books/sales/quotes`**. Auth: token -> subscription -> `accounts-sales-quotes` -> `getQuotes`. Path: none. Query: none defined. Body: none. Success: `200 { success:true, data:[<Quote>] }` (count/pagination ⚠️ NOT DEFINED IN SOURCE). Errors: common `401/403/404/500`, `404` record is not applicable to list. Logic: read quotes. Flow: gate -> query -> list. Status: ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/quotes`**. Auth: same -> `createQuote`. Path/query: none. Body: full Quote schema and example in 4.4. Success: `201 { success:true, data:<Quote> }`. Errors: `400` model validation, common `401/403/500`. Logic/flow: validate -> save -> response; ledger side effect ⚠️ NOT DEFINED IN SOURCE. Status: ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/quotes/:id`**. Auth: same -> `getQuoteById`. Path `id` required ObjectId, e.g. `65f000000000000000000004`; query/body none. Success `200 {success:true,data:<Quote>}`. Errors `400/404` plus common. Logic read. Flow gate -> lookup -> response. Status ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/quotes/:id`**. Auth: same -> `updateQuote`. Path `id` required; query none. Body: partial/full Quote schema; example `{ "status":"Accepted" }`. Success `200 {success:true,data:<Quote>}`. Errors `400/404` plus common. Logic update; calculations/ledger ⚠️ NOT DEFINED IN SOURCE. Flow gate -> update -> response. Status ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/quotes/:id`**. Auth prefix exists, route file has no DELETE. Path/body/query would be as shown, but no handler. Success none; `404` route not found. Side effects none. Flow -> unmatched route. Status ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Sales orders

- **GET `/api/v1/books/sales/sales-orders`**. Auth -> `accounts-sales-sales-orders` -> `getSalesOrders`; no path/body/query defined; success `200 {success:true,data:[<SalesOrder>]}` with count/pagination ⚠️ NOT DEFINED IN SOURCE; read-only flow; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/sales-orders`**. Auth -> `createSalesOrder`; body full Sales Order schema in 4.4; success `201 {success:true,data:<SalesOrder>}`; `400` validation + common errors; persistence only, ledger/stock ⚠️ NOT DEFINED IN SOURCE; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/sales-orders/:id`**. Auth -> `getSalesOrderById`; `id` required ObjectId; no query/body; success `200 {success:true,data:<SalesOrder>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/sales-orders/:id`**. Auth -> `updateSalesOrder`; body partial Sales Order, e.g. `{ "status":"Closed" }`; success `200 {success:true,data:<SalesOrder>}`; `400/404` + common; update calculations ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/sales-orders/:id`**. No DELETE handler; no body/success; `404` unmatched route; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Invoices

- **GET `/api/v1/books/sales/invoices`**. Auth -> `accounts-sales-invoices` -> `getInvoices`; no path/body/query; success `200 {success:true,data:[<Invoice>]}` (count/pagination not defined); read; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/invoices`**. Auth -> `createInvoice`; body full Invoice schema in 4.4; success `201 {success:true,data:<Invoice>}`; `400` validation/deactivated customer, common errors; pre-save rejects inactive customer; ledger calculation ⚠️ NOT DEFINED IN SOURCE; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/invoices/:id`**. Auth -> `getInvoiceById`; `id` ObjectId required; success `200 {success:true,data:<Invoice>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/invoices/:id`**. Auth -> `updateInvoice`; body partial Invoice, e.g. `{ "status":"Paid", "balanceDue":0 }`; success `200 {success:true,data:<Invoice>}`; `400/404` + common; ledger/recalculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/invoices/:id`**. No route handler; no success; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Recurring invoices

- **GET `/api/v1/books/sales/recurring-invoices`**. Auth -> `accounts-sales-recurring-invoices` -> list; no body/path/query; success `200 {success:true,data:[<RecurringInvoice>]}`; count/pagination ⚠️ NOT DEFINED; read; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/recurring-invoices`**. Auth -> create; body recurring invoice schema in 4.4; success `201 {success:true,data:<RecurringInvoice>}`; `400` + common; scheduling/next-run side effects ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/recurring-invoices/:id`**. Auth -> detail; path `id` required ObjectId; body/query none; success `200 {success:true,data:<RecurringInvoice>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/recurring-invoices/:id`**. Auth -> update; body partial recurring schema; success `200 {success:true,data:<RecurringInvoice>}`; `400/404` + common; schedule recalculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/recurring-invoices/:id`**. No DELETE route; `404`; no body/success/side effect; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Delivery challans

- **GET `/api/v1/books/sales/delivery-challans`**. Auth -> `accounts-sales-delivery-challans` -> list; no body/path/query; success `200 {success:true,data:[<DeliveryChallan>]}`; count/pagination ⚠️ NOT DEFINED; read; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/delivery-challans`**. Auth -> create; body schema in 4.4; success `201 {success:true,data:<DeliveryChallan>}`; `400` + common; stock mutation on delivery ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/delivery-challans/:id`**. Auth -> detail; `id` required ObjectId; success `200 {success:true,data:<DeliveryChallan>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/delivery-challans/:id`**. Auth -> update; partial schema; success `200 {success:true,data:<DeliveryChallan>}`; `400/404` + common; stock/total calculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/delivery-challans/:id`**. No route; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Payments received

- **GET `/api/v1/books/sales/payments-received`**. Auth -> `accounts-sales-payments-received` -> list; no body/path/query; success `200 {success:true,data:[<PaymentReceived>]}`; count/pagination ⚠️ NOT DEFINED; read; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/payments-received`**. Auth -> create; body Payment Received schema in 4.4; success `201 {success:true,data:<PaymentReceived>}`; `400` + common; allocation/AR balance formula ⚠️ NOT DEFINED IN SOURCE; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/payments-received/:id`**. Auth -> detail; `id` ObjectId required; success `200 {success:true,data:<PaymentReceived>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/payments-received/:id`**. Auth -> update; partial schema; success `200 {success:true,data:<PaymentReceived>}`; `400/404` + common; allocation recalculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/payments-received/:id`**. No route; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Credit notes

- **GET `/api/v1/books/sales/credit-notes`**. Auth -> `accounts-sales-credit-notes` -> list; no body/path/query; success `200 {success:true,data:[<CreditNote>]}`; count/pagination ⚠️ NOT DEFINED; read; common errors; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/sales/credit-notes`**. Auth -> create; body Credit Note schema in 4.4; success `201 {success:true,data:<CreditNote>}`; `400` + common; credit/AR ledger effect ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/sales/credit-notes/:id`**. Auth -> detail; `id` ObjectId required; success `200 {success:true,data:<CreditNote>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/sales/credit-notes/:id`**. Auth -> update; partial schema; success `200 {success:true,data:<CreditNote>}`; `400/404` + common; credit application calculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/sales/credit-notes/:id`**. No route; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

---

## 5. Books CRUD - Purchases

### 5.1 Purchase schemas

**Vendor:** same address/contact/custom-field structures as Customer. Required `displayName`; enums `vendorType = business | individual`, `tds = yes | no`, `status = Active | Inactive`; optional `orgId`, identity/contact/address fields, `pan`, `currency` default `INR`, `accountsPayable`, `openingBalance` default 0, `paymentTerms`, `portalAccess`, `msmeRegistered`, `bankDetails` (`accountHolderName`, `bankName`, `accountNumber`, `ifscCode`), `customFields[]`, `remarks`, `payables`, `unusedCredits`, `createdBy`. Example:

```json
{ "orgId":"company-id", "vendorType":"business", "companyName":"North Supplies", "displayName":"North Supplies", "email":"accounts@north.example", "currency":"INR", "accountsPayable":"Accounts Payable", "openingBalance":0, "portalAccess":false, "msmeRegistered":false, "tds":"no", "bankDetails":{"accountHolderName":"North Supplies","bankName":"Example Bank","accountNumber":"000123","ifscCode":"EXMP0001"}, "customFields":[], "status":"Active", "payables":0,"unusedCredits":0,"createdBy":"employee-id" }
```

**Expense:** required `date`, `amount`, `totalAmount`; enums `expenseType = Goods | Mileage`, `status = Non-Billable | Unbilled | Invoiced | Reimbursed`, `mileageData.unit = km | mile`; line item fields `expenseAccount` and `amount` required, `notes` optional; mileage fields `distance`, `rate` required, `employee` optional. Complete example:

```json
{ "orgId":"company-id", "expenseType":"Goods", "date":"2026-09-23", "expenseAccount":"Travel", "amount":200, "taxAmount":0, "totalAmount":200, "billable":false, "status":"Non-Billable", "isItemized":false, "lineItems":[], "currency":"INR", "notes":"Taxi" }
```

**Recurring expense:** required `profileName`, `repeatEvery`, `startsOn`, `expenseAccount`, `amount`, `paidThrough`; enums `status = Active | Paused | Stopped | Expired`; optional `endsOn`, vendor/customer ids, notes, `billable`, currency default `INR`, createdBy. Example: `{ "profileName":"Office rent", "repeatEvery":"1 Month", "startsOn":"2026-10-01", "expenseAccount":"Rent", "amount":50000, "paidThrough":"Bank", "billable":false, "status":"Active", "currency":"INR" }`.

**Purchase order:** required `vendorId`, `poNumber`, `orderDate`, `lineItems[]`, `lineItems[].account`, `lineItems[].quantity`, `lineItems[].rate`, `lineItems[].amount`, `subTotal`, `totalAmount`; enums `deliveryDestination = organization | customer`, `discountType = amount | percent`, `taxWithheldType = none | TDS | TCS`, `status = Draft | Issued | Billed | Cancelled`; line item `itemId` and `itemDetails` optional. Example: `{ "vendorId":"vendor-id", "deliveryDestination":"organization", "poNumber":"PO-1001", "orderDate":"2026-09-23", "lineItems":[{"itemId":"item-id","account":"Office Expense","quantity":1,"rate":500,"amount":500}], "subTotal":500,"discount":0,"discountType":"amount","taxWithheldType":"none","taxWithheldAmount":0,"adjustment":0,"totalAmount":500,"status":"Issued","currency":"INR" }`.

**Bill:** required `vendorId`, `billNumber`, `billDate`, `lineItems[]`, line item `account`, `quantity`, `rate`, `amount`, `subTotal`, `totalAmount`; enums `discountType = amount | percent`, `taxWithheldType = none | TDS | TCS`, `status = Draft | Open | Partially Paid | Paid | Void`; line item optional `itemId`, `customerId`, `discount` default 0. Example:

```json
{ "vendorId":"vendor-id", "billNumber":"BILL-1001", "billDate":"2026-09-23", "dueDate":"2026-10-23", "lineItems":[{"itemId":"item-id","account":"Office Expense","quantity":1,"rate":500,"discount":0,"amount":500}], "subTotal":500,"discount":0,"discountType":"amount","taxWithheldType":"none","taxWithheldAmount":0,"adjustment":0,"totalAmount":500,"status":"Open","currency":"INR" }
```

**Recurring bill:** required `vendorId`, `profileName`, `repeatEvery`, `startsOn`, `lineItems[]`, line item `account`, `quantity`, `rate`, `amount`, `subTotal`, `totalAmount`; enums `status = Active | Stopped | Expired`, `discountType = amount | percent`, `taxWithheldType = none | TDS | TCS`; optional `endsOn`, `taxConfigurationId`, `neverExpires`, notes, currency. Example: `{ "vendorId":"vendor-id","profileName":"Monthly hosting","repeatEvery":"1 month","startsOn":"2026-10-01","lineItems":[{"account":"Hosting","quantity":1,"rate":500,"amount":500}],"subTotal":500,"totalAmount":500,"status":"Active","currency":"INR" }`.

**Payment made:** required `vendorId`, `paymentType`, `paymentNumber`, `amount`, `paymentDate`, `paymentMode`, `paidThrough`; `paymentType = Bill Payment | Vendor Advance`, status `Open | Closed | Void`; optional `bills[]` entries `{ billId, amountApplied }`; optional TDS object has `taxName`, `rate`, `act`, `section`, `isHigherRate`, `startDate`, `endDate`. Example: `{ "vendorId":"vendor-id","paymentType":"Bill Payment","paymentNumber":"PM-1001","amount":500,"paymentDate":"2026-09-23","paymentMode":"Bank Transfer","paidThrough":"Bank","bills":[{"billId":"bill-id","amountApplied":500}],"status":"Closed","currency":"INR" }`.

**Mileage:** required `date`, `distance`, `rate`, `amount`, `expenseAccount`, `paidThrough`; `unit = km | mile`, `status = Non-Billable | Unbilled | Invoiced | Reimbursed`; optional employee/vendor/customer/notes, `billable`, currency. Formula is not implemented in the model. Example: `{ "date":"2026-09-23","distance":20,"rate":10,"unit":"km","employee":"employee-id","amount":200,"expenseAccount":"Travel","paidThrough":"Bank","currency":"INR","billable":false,"status":"Non-Billable" }`.

### 5.2 Purchase endpoint inventory and individual contracts

All purchase routes use `verifyCapyngenToken -> requireBooksSubscription -> requireFeature(feature key) -> controller`. List success is `200 {success:true,data:[<resource>]}` unless the controller explicitly adds `count`; detail is `200 {success:true,data:<resource>}`; create is `201 {success:true,data:<resource>}`; update is `200 {success:true,data:<resource>}`. Body schemas and complete examples are in 5.1. Every endpoint has path `id` as required ObjectId for detail/update, no defined query unless noted, and no body for GET. Common errors are `400` validation, `404` missing record, `401/403` middleware errors, `500` persistence failure. This paragraph is the contract preamble; each endpoint remains individually listed below.

#### Vendors (`accounts-purchases-vendors`)

- **GET `/api/v1/books/purchases/vendors`**: Auth chain -> `getVendors`; path/body none; query ⚠️ NOT DEFINED; success `200 {success:true,count?:number,data:[<Vendor>]}`; errors common; read/no side effect; flow gate -> query -> response; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/vendors`**: Auth -> `createVendor`; body full Vendor schema/example 5.1; success `201 {success:true,data:<Vendor>}`; `400` + common; positive opening balance ledger behavior is ⚠️ NOT DEFINED IN SOURCE; save flow; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/vendors/:id`**: Auth -> `getVendorById`; path `id` ObjectId required; body/query none; success `200 {success:true,data:<Vendor>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/vendors/:id`**: Auth -> `updateVendor`; path `id`; body partial Vendor, e.g. `{ "status":"Inactive" }`; success `200 {success:true,data:<Vendor>}`; `400/404` + common; update; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/vendors/:id`**: No DELETE declaration; no body/success; `404` unmatched route; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Expenses (`accounts-purchases-expenses`)

- **GET `/api/v1/books/purchases/expenses`**: Auth -> `getExpenses`; query is controller-defined; source guide confirms query support but names/defaults are not defined: ⚠️ NOT DEFINED IN SOURCE. Body none; success `200 {success:true,count?:number,data:[<Expense>]}`; common errors; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/expenses`**: Auth -> `createExpense`; body full Expense schema/example 5.1; success `201 {success:true,data:<Expense>}`; `400` + common; expense ledger calculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/expenses/:id`**: Auth -> detail; `id` required ObjectId; no query/body; success `200 {success:true,data:<Expense>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/expenses/:id`**: Auth -> update; partial Expense; success `200 {success:true,data:<Expense>}`; `400/404` + common; calculations ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/expenses/:id`**: Auth -> delete; `id` required ObjectId; no query/body; success source may be `{success:true,message}` or `{success:true,data:{}}`; `400/404` + common; side effects ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/expenses/bulk`**: Auth -> bulk feature -> `createBulkExpenses`; body full schema is `{ "expenses": [<Expense>] }`, requiredness of wrapper and every item ⚠️ NOT DEFINED; example `{ "expenses": [{ "date":"2026-09-23","amount":200,"totalAmount":200,"expenseType":"Goods" }] }`; success `201` bulk result shape ⚠️ NOT DEFINED; errors `400` + common; creates batch records; flow gate -> validate array -> bulk save -> response; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/expenses/bulk/:batchId`**: Auth -> `getBulkExpenses`; path `batchId` string required; query/body none; success `200` bulk list shape ⚠️ NOT DEFINED; errors `404/400` + common; reads `bulkBatchId`; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/expenses/bulk/:batchId`**: Auth -> `updateBulkExpenses`; path `batchId` required; body update fields/schema ⚠️ NOT DEFINED; success `200` bulk result ⚠️ NOT DEFINED; errors `400/404` + common; batch update side effects ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.

#### Recurring expenses (`accounts-purchases-recurring-expenses`)

- **GET `/api/v1/books/purchases/recurring-expenses`**: Auth -> list; no path/body/query defined; success `200 {success:true,data:[<RecurringExpense>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/recurring-expenses`**: Auth -> create; body schema/example 5.1; success `201 {success:true,data:<RecurringExpense>}`; `400` + common; scheduler/next-run ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/recurring-expenses/:id`**: Auth -> detail; `id` required ObjectId; success `200 {success:true,data:<RecurringExpense>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/recurring-expenses/:id`**: Auth -> update; partial schema; success `200 {success:true,data:<RecurringExpense>}`; `400/404` + common; schedule logic ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/recurring-expenses/:id`**: Auth -> delete; `id`; body/query none; success delete shape ⚠️ NOT DEFINED; `400/404` + common; delete side effects ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.

#### Purchase orders (`accounts-purchases-purchase-orders`)

- **GET `/api/v1/books/purchases/purchase-orders`**: Auth -> list; no query defined; success `200 {success:true,data:[<PurchaseOrder>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/purchase-orders`**: Auth -> create; body Purchase Order schema/example 5.1; success `201 {success:true,data:<PurchaseOrder>}`; `400` + common; stock/commitment ledger effect ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/purchase-orders/:id`**: Auth -> detail; `id` ObjectId; success `200 {success:true,data:<PurchaseOrder>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/purchase-orders/:id`**: Auth -> update; partial schema; success `200 {success:true,data:<PurchaseOrder>}`; `400/404` + common; calculations ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/purchase-orders/:id`**: No DELETE declaration; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Bills (`accounts-purchases-bills`)

- **GET `/api/v1/books/purchases/bills`**: Auth -> list; no query defined; success `200 {success:true,data:[<Bill>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/bills`**: Auth -> create; body Bill schema/example 5.1; success `201 {success:true,data:<Bill>}`; `400` validation/deactivated vendor + common; pre-save rejects inactive vendor; AP ledger effect ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/bills/:id`**: Auth -> detail; `id` ObjectId; success `200 {success:true,data:<Bill>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/bills/:id`**: Auth -> update; partial Bill; success `200 {success:true,data:<Bill>}`; `400/404` + common; totals/ledger ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/bills/:id`**: No DELETE declaration; `404`; ⚠️ DECLARED BUT NOT MOUNTED (404).

#### Recurring bills (`accounts-purchases-recurring-bills`)

- **GET `/api/v1/books/purchases/recurring-bills`**: Auth -> list; no query; success `200 {success:true,data:[<RecurringBill>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/recurring-bills`**: Auth -> create; body schema/example 5.1; success `201 {success:true,data:<RecurringBill>}`; `400` + common; recurrence side effects ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/recurring-bills/:id`**: Auth -> detail; `id`; success `200 {success:true,data:<RecurringBill>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/recurring-bills/:id`**: Auth -> update; partial schema; success `200 {success:true,data:<RecurringBill>}`; `400/404` + common; schedule logic ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/recurring-bills/:id`**: Auth -> delete; `id`; success delete envelope ⚠️ NOT DEFINED; `400/404` + common; ✅ LIVE/MOUNTED.

#### Payments made (`accounts-purchases-payments-made`)

- **GET `/api/v1/books/purchases/payments-made`**: Auth -> list; no query; success `200 {success:true,data:[<PaymentMade>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/payments-made`**: Auth -> create; body Payment Made schema/example 5.1; success `201 {success:true,data:<PaymentMade>}`; `400` + common; bill allocation/AP mutation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/payments-made/:id`**: Auth -> detail; `id`; success `200 {success:true,data:<PaymentMade>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/payments-made/:id`**: Auth -> update; partial schema; success `200 {success:true,data:<PaymentMade>}`; `400/404` + common; allocation logic ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/payments-made/:id`**: Auth -> delete; `id`; success `200 {success:true,message?:string,data?:{}}`; `400/404` + common; reversal behavior ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.

#### Mileage (`accounts-purchases-mileage`)

- **GET `/api/v1/books/purchases/mileage`**: Auth -> list; no query; success `200 {success:true,data:[<MileageExpense>]}`; count/pagination ⚠️ NOT DEFINED; read; ✅ LIVE/MOUNTED.
- **POST `/api/v1/books/purchases/mileage`**: Auth -> create; body Mileage schema/example 5.1; success `201 {success:true,data:<MileageExpense>}`; `400` + common; amount formula (distance x rate or otherwise) ⚠️ NOT DEFINED IN SOURCE; ✅ LIVE/MOUNTED.
- **GET `/api/v1/books/purchases/mileage/:id`**: Auth -> detail; `id`; success `200 {success:true,data:<MileageExpense>}`; `400/404` + common; read; ✅ LIVE/MOUNTED.
- **PUT `/api/v1/books/purchases/mileage/:id`**: Auth -> update; partial schema; success `200 {success:true,data:<MileageExpense>}`; `400/404` + common; recalculation ⚠️ NOT DEFINED; ✅ LIVE/MOUNTED.
- **DELETE `/api/v1/books/purchases/mileage/:id`**: Auth -> delete; `id`; success delete envelope ⚠️ NOT DEFINED; `400/404` + common; ✅ LIVE/MOUNTED.

---

## 6. Transaction locks

### GET /api/v1/books/transaction-locks

1. **Method + Full Path:** `GET /api/v1/books/transaction-locks` (intended base; route file is not mounted in `app.ts`).
2. **Auth requirement:** Declared controller requires authenticated user and initialized `requestContext.orgId`; intended chain is token -> Books subscription -> route controller, but mount middleware is ⚠️ NOT DEFINED IN SOURCE.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** `200 { success:true, data:<TransactionLock> }`; exact model fields beyond lock contract are ⚠️ NOT DEFINED.
7. **Error Responses:** `401` missing context; `404` no lock; `500` persistence; exact envelopes controller-dependent.
8. **Business Logic / Side Effects:** Reads organization lock.
9. **Text-based Flow:** Intended auth/context -> org lookup -> lock response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### PUT /api/v1/books/transaction-locks

1. **Method + Full Path:** `PUT /api/v1/books/transaction-locks` (intended base; not mounted).
2. **Auth requirement:** Same declared context requirement; mount chain ⚠️ NOT DEFINED.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "lockedUntil": "2026-09-30T23:59:59.000Z", "isLocked": true }`; `lockedUntil` date and `isLocked` boolean are the only documented fields.
6. **Success Response:** `200 { success:true, data:<TransactionLock> }` or controller-specific shape ⚠️ NOT DEFINED.
7. **Error Responses:** `400` invalid body; `401` missing org context; `500` persistence; exact shape controller-dependent.
8. **Business Logic / Side Effects:** Merges body with `lockedBy` from authenticated user; lock enforcement on other endpoints ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended auth -> context -> merge `lockedBy` -> upsert/update lock -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

---

## 7. Declared Books dashboard and accounting modules

All routes in this section are present in route files but not mounted by `src/app.ts`; therefore runtime result is `404`. Intended base paths are those in the source guide. For every route, the declared auth is controller/module dependent and mount middleware is not wired. Unless stated, query/body/response fields are not defined in source.

### 7.1 Dashboard

#### GET /api/v1/books/dashboard

1. **Method + Full Path:** `GET /api/v1/books/dashboard`
2. **Auth requirement:** Intended token -> Books subscription -> dashboard controller; exact mount chain ⚠️ NOT DEFINED.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** Intended `200 { success:true, data:{ totalReceivables, totalPayables, totalIncome, watchlist:[] } }`; nested types and exact values ⚠️ NOT DEFINED.
7. **Error Responses:** `401/403/404/500` controller/mount dependent; unmounted request is `404`.
8. **Business Logic / Side Effects:** Dashboard totals; formulas ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended auth -> dashboard controller -> aggregate models -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### 7.2 Standard declared accounting CRUD

The following five operations are declared for each base: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /`. Each endpoint has the mandatory contract below with resource-specific schema unknown unless noted.

**Shared declared endpoint contract:**

1. **Method + Full Path:** method/path listed in the endpoint table below.
2. **Auth requirement:** Intended token -> Books subscription -> resource controller; exact feature middleware/mount is not wired. `requestContext.orgId` is required by some controllers.
3. **Path Params:** `id` is required ObjectId for `/:id`; no path params for `/`.
4. **Query Params:** None are defined in route files; controller queries ⚠️ NOT DEFINED IN SOURCE.
5. **Request Body:** None for GET/DELETE. POST/PUT use the corresponding model body, but full controller validation/complete example is ⚠️ NOT DEFINED IN SOURCE; do not invent fields.
6. **Success Response:** Intended list `200 {success:true,data:[]}`, detail/update `200 {success:true,data:object}`, create `201 {success:true,data:object}`, delete `200 {success:true,message?:string,data?:{}}`; exact shapes controller-dependent.
7. **Error Responses:** `400` validation, `401` context, `404` missing record/unmounted route, `500` database; exact envelopes controller-dependent.
8. **Business Logic / Side Effects:** Resource-specific calculations are ⚠️ NOT DEFINED IN SOURCE.
9. **Text-based Flow:** Intended auth/context -> controller -> model query/mutation -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

| Resource | Full paths |
|---|---|
| Chart of Accounts | `GET/POST /api/v1/books/chart-of-accounts`; `GET/PUT/DELETE /api/v1/books/chart-of-accounts/:id` |
| Currency Adjustments | `GET/POST /api/v1/books/currency-adjustments`; `GET/PUT/DELETE /api/v1/books/currency-adjustments/:id` |
| Journals | `GET/POST /api/v1/books/journals`; `GET/PUT/DELETE /api/v1/books/journals/:id` |
| Projects | `GET/POST /api/v1/books/projects`; `GET/PUT/DELETE /api/v1/books/projects/:id` |
| Time Entries | `GET/POST /api/v1/books/time-entries`; `GET/PUT/DELETE /api/v1/books/time-entries/:id` |

Each path in this table is an individually declared endpoint and uses the shared ten-section contract above. The source does not define complete request/response fields for these controllers in the supplied guide; any field beyond the model source must be confirmed before frontend integration.

### 7.3 Accountant locks

`GET /api/v1/books/accountant/locks` and `PUT /api/v1/books/accountant/locks` are declared-only. Both use the same ten-section lock contract as section 6, with body `{lockedUntil: date, isLocked: boolean}` for PUT, and no body for GET. Error triggers are missing request context (`401`), invalid body (`400`), persistence failure (`500`), and current unmounted route (`404`). Status for both: ⚠️ DECLARED BUT NOT MOUNTED (404).

---

## 8. Reports - every route

### 8.1 Common report contract

Every report is declared as `GET` under intended base `/api/v1/books/reports` and is not mounted in `app.ts`.

1. **Method + Full Path:** `GET /api/v1/books/reports/<route>`.
2. **Auth requirement:** Intended token -> Books subscription -> report controller; exact feature/context middleware is not mounted and is ⚠️ NOT DEFINED.
3. **Path Params:** None.
4. **Query Params:** Only the route-specific fields in the table below are source-defined. `startDate` and `endDate` are passed through `new Date(...)`; omitted dates become `undefined`. Other controller-specific queries are intentionally not invented.
5. **Request Body:** None. Example: `null`.
6. **Success Response:** Default `200 { "success": true, "data": <controller result> }`. `data` may be object or array. Horizontal reports specifically return `{data:{items:[]}}`; exact nested fields for all other reports are ⚠️ NOT DEFINED IN SOURCE.
7. **Error Responses:** `400` invalid date/query, `401/403` intended auth/context, `404` unmounted route or missing data, `500` service/database error; exact report-controller envelope ⚠️ NOT DEFINED.
8. **Business Logic / Side Effects:** Read-only report calculation in `AdvancedReportsService`; exact formulas/aggregations ⚠️ NOT DEFINED IN SOURCE.
9. **Text-based Flow:** Intended auth/context -> parse query -> report controller -> service aggregation -> `{success,data}`; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### 8.2 Individual report endpoint contracts

Each bullet below is one separate endpoint and inherits sections 1-10 from 8.1. The bullet explicitly records its query contract, schema/example and route-specific source note.

- **GET `/api/v1/books/reports/drilldown`**. Query: controller-specific, names/defaults ⚠️ NOT DEFINED. Body none. Response `200 {success:true,data:<object|array>}`. Side effect none. Status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/profit-and-loss`**. Query: optional `startDate` string/date and `endDate` string/date, no defaults; purpose report period. Body none. Response generic report envelope. Formula/fields ⚠️ NOT DEFINED. Status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/sales-by-customer`**. Query: none source-defined. Body none. Response generic report envelope; data schema ⚠️ NOT DEFINED. Status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/sales-by-item`**. Query none defined; body none; response generic; aggregation fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/sales-by-salesperson`**. Query optional `startDate`, `endDate`, no defaults; body none; generic response; fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/sales-summary`**. Query optional `startDate`, `endDate`; body none; generic response; fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/inventory-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; inventory calculation ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/inventory-valuation`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; valuation method ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/fifo-tracking`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; FIFO lot fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/profit-by-item`**. Query optional `startDate`, `endDate`; body none; generic response; formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/sales-channel-sync`**. Query none defined; body none; generic response; sync behavior ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/committed-stock`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; commitment definition ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/inventory-aging`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; aging buckets ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/stock-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/inventory-adj-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/inventory-adj-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/turnover-qty`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; quantity formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/abc-classification`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; classification thresholds ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/turnover-amount`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; amount formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/weighted-average-cost`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; cost formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/customer-balances`**. Query none defined; body none; generic response; balance fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/vendor-balances`**. Query none defined; body none; generic response; balance fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/balance-sheet`**. Query optional `startDate`, `endDate`; body none; generic response; account grouping/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/cash-flow`**. Query none defined; body none; generic response; classification ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/horizontal-pl`**. Query none defined; body none; success `200 {success:true,data:{items:[]}}`; item fields ⚠️ NOT DEFINED; duplicate route declaration exists; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/horizontal-bs`**. Query none; body none; success `200 {success:true,data:{items:[]}}`; item fields ⚠️ NOT DEFINED; duplicate declaration exists; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/movement-of-equity`**. Query none; body none; generic response; duplicate declaration exists; fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/business-performance-ratios`**. Query none; body none; generic response; ratio formulas ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/trial-balance`**. Query optional `startDate`, `endDate`; body none; generic response; duplicate declaration exists; fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/general-ledger`**. Query none; body none; generic response; duplicate declaration exists; ledger fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/journal-report`**. Query none; body none; generic response; duplicate declaration exists; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/receivables-aging`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; aging buckets ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/invoice-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/ar-aging-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; aging detail fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/so-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; sales-order detail fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/delivery-challan-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/quote-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/quote-item-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; item fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/receivable-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/receivable-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payables-aging`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; aging buckets ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/po-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/ap-aging-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/vendor-credit-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payables-refund-history`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/po-by-vendor`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; grouping fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/po-by-item`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; grouping fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payable-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payable-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/expenses-by-category`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; category fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/expense-details`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/purchases-by-vendor`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; grouping fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/purchases-by-item`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; grouping fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/project-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/timesheet-profitability`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payments-received-report`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/payments-made-report`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/tax-summary`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; tax fields/formulas ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/budget-vs-actual`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; variance formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/activity-log`**. Query controller-specific ⚠️ NOT DEFINED; body none; generic response; activity fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/day-book`**. Query none defined; body none; generic response; fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/account-transactions`**. Query optional `accountId` string/ObjectId, no default; purpose account filter. Body none; generic response; transaction shape ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/account-type-summary`**. Query none; body none; generic response; fields ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).
- **GET `/api/v1/books/reports/detailed-general-ledger`**. Query optional `startDate`, `endDate`; body none; generic response; detail fields/formula ⚠️ NOT DEFINED; status ⚠️ DECLARED BUT NOT MOUNTED (404).

---

## 9. Core Auth

Suggested mount: `/api/v1/auth`. No core router is mounted in `app.ts`; every endpoint below is therefore `404` at runtime. Auth middleware, exact controller errors and JWT issuance are not wired as a complete flow. The source controllers use these body shapes.

### POST /api/v1/auth/check-invite

1. **Method + Full Path:** `POST /api/v1/auth/check-invite`.
2. **Auth requirement:** No source-defined auth middleware; intended public auth route.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "email": "asha@example.com" }`; `email` string required by controller contract.
6. **Success Response:** `200 { "state":"existing_user" }` or `200 { "state":"invited_user", "orgId":"org-id" }`.
7. **Error Responses:** `404 { "state":"not_found" }`; malformed body `400` shape controller-dependent; current app route `404`.
8. **Business Logic / Side Effects:** Reads invite/user state.
9. **Text-based Flow:** Body -> lookup -> state response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/auth/accept-invite-signup

1. **Method + Full Path:** `POST /api/v1/auth/accept-invite-signup`.
2. **Auth requirement:** Intended public invite flow; no mounted middleware.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "email":"asha@example.com", "password":"secret" }`; both strings, required by controller contract.
6. **Success Response:** `200 { "message":"...", "user": <user> }`; exact message/user fields ⚠️ NOT DEFINED.
7. **Error Responses:** `400` invalid/missing input, `404` invite/user not found, `500` persistence; current route `404`.
8. **Business Logic / Side Effects:** Sets password and links invited mappings; does not activate invite according to source guide.
9. **Text-based Flow:** Body -> invite lookup -> password set -> mapping link -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/auth/login

1. **Method + Full Path:** `POST /api/v1/auth/login`.
2. **Auth requirement:** Intended public endpoint; no mounted middleware.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "emailOrMobile":"asha@example.com", "password":"secret", "useOtp":false }`; types string/string/boolean; requiredness beyond controller use ⚠️ NOT DEFINED.
6. **Success Response:** Password mode `{ "message":"...", "user":<user> }`; OTP mode `{ "message":"OTP sent", "method":"otp" }`.
7. **Error Responses:** `400` invalid input, `401` bad credentials, `404` route currently; exact shape controller-dependent.
8. **Business Logic / Side Effects:** Password login or sends OTP; does not issue the Capyngen access JWT per source guide.
9. **Text-based Flow:** Body -> user lookup -> password/OTP branch -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/auth/login/verify

1. **Method + Full Path:** `POST /api/v1/auth/login/verify`.
2. **Auth requirement:** Intended public endpoint; not mounted.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "emailOrMobile":"asha@example.com", "otp":"123456" }`; both strings.
6. **Success Response:** `200 { "message":"...", "user":<user> }`.
7. **Error Responses:** `400` invalid OTP/input; source OTP must equal `123456`; current route `404`.
8. **Business Logic / Side Effects:** Verifies hard-coded OTP; JWT issuance ⚠️ NOT DEFINED/not returned.
9. **Text-based Flow:** Body -> compare OTP -> user response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/auth/signup

1. **Method + Full Path:** `POST /api/v1/auth/signup`.
2. **Auth requirement:** Intended public endpoint; not mounted.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "role":"Admin", "companyName":"Asha Foods", "email":"asha@example.com", "mobile":"+91-9900000000", "password":"secret", "country":"India", "state":"Delhi" }`; all are source-listed; exact requiredness ⚠️ NOT DEFINED.
6. **Success Response:** Signup OTP message and user; exact shape ⚠️ NOT DEFINED.
7. **Error Responses:** `400` validation/duplicate, `500` persistence; current route `404`.
8. **Business Logic / Side Effects:** Creates user if absent and returns signup OTP message.
9. **Text-based Flow:** Body -> user check/create -> OTP response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/auth/signup/verify

1. **Method + Full Path:** `POST /api/v1/auth/signup/verify`.
2. **Auth requirement:** Intended public endpoint; not mounted.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "email":"asha@example.com", "otp":"1234567" }`; strings.
6. **Success Response:** `200` success/user shape ⚠️ NOT DEFINED.
7. **Error Responses:** `400` invalid OTP/input; source OTP must equal `1234567`; current route `404`.
8. **Business Logic / Side Effects:** Verifies user and activates pending mappings.
9. **Text-based Flow:** Body -> OTP compare -> verification/mapping activation -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

---

## 10. Organization

Suggested mount: `/api/v1/organizations`; all are unmounted.

### POST /api/v1/organizations/setup

1. **Method + Full Path:** `POST /api/v1/organizations/setup`.
2. **Auth requirement:** Controller/context requirement is source-dependent; no mount exists.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "userId":"user-id", "companyName":"Asha Foods", "industry":"Retail", "location":"Delhi", "state":"Delhi", "currency":"INR", "language":"en", "timeZone":"Asia/Kolkata", "gstRegistered":true, "gstNumber":"GST-ID" }`; source-listed types; requiredness ⚠️ NOT DEFINED.
6. **Success Response:** `201 { "message":"...", "organization":<organization> }`; nested shape ⚠️ NOT DEFINED.
7. **Error Responses:** `400/500`, current route `404`.
8. **Business Logic / Side Effects:** Creates organization and admin mapping.
9. **Text-based Flow:** Body -> create org -> create admin mapping -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### GET /api/v1/organizations

1. **Method + Full Path:** `GET /api/v1/organizations`.
2. **Auth requirement:** Source contract requires `x-user-id` header; no mounted middleware.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** `200 { "success":true, "data":[<organization with role permissions>] }`; exact fields ⚠️ NOT DEFINED.
7. **Error Responses:** `401/404/500`; current route `404`.
8. **Business Logic / Side Effects:** Finds owned/mapped organizations and attaches role permissions.
9. **Text-based Flow:** Header -> org query -> permissions attach -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### POST /api/v1/organizations/join

1. **Method + Full Path:** `POST /api/v1/organizations/join`.
2. **Auth requirement:** Requires context `userId`; not mounted.
3. **Path Params:** None.
4. **Query Params:** None.
5. **Request Body:** `{ "orgId":"organization-id" }`; `orgId` string/ObjectId required by source contract.
6. **Success Response:** Success envelope exact fields ⚠️ NOT DEFINED.
7. **Error Responses:** `400` invalid body, `404` mapping/org, current route `404`.
8. **Business Logic / Side Effects:** Activates matching invited user mapping.
9. **Text-based Flow:** Context/body -> mapping lookup -> activate -> response.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

---

## 11. RBAC

Suggested mount: `/api/v1/rbac`; all are unmounted. Declared endpoints use `requirePermission('settings','roles')` for role endpoints and `requirePermission('settings','users')` for user endpoints, but permission/context wiring is not in `app.ts`.

### Roles

For each endpoint below: auth chain is intended token/context -> `requirePermission('settings','roles')` -> controller; no query params; GET/DELETE have no body; role body is `{name:string, description:string, parentRoleId:string|null, permissions: <source-defined permission structure>}` where exact types/requiredness are ⚠️ NOT DEFINED; success list/detail/update `200 {success:true,data:[]|object}`, create `201 {success:true,data:object}`, delete `200 {success:true,message:"Role deleted"}`; errors `401/403/404/400/500`; role permission inheritance/side effects ⚠️ NOT DEFINED; flow permission -> controller -> response; each status is ⚠️ DECLARED BUT NOT MOUNTED (404).

- `GET /api/v1/rbac/roles`
- `GET /api/v1/rbac/roles/:id` (`id` required ObjectId/string)
- `POST /api/v1/rbac/roles`
- `PUT /api/v1/rbac/roles/:id` (`id` required)
- `DELETE /api/v1/rbac/roles/:id` (`id` required)

### Users

For each endpoint below: intended auth -> `requirePermission('settings','users')` -> controller; no query params; GET/DELETE have no body; invite body is `{email:string,name:string,roleId:string}`; update body is `{roleId:string}`; success list `200 {success:true,data:[]}`, invite `201 {success:true,message:<string>,data:<object>}`, update `200 {success:true,data:object}`, delete `200 {success:true,message:<string>}`; errors `400/401/403/404/500`; invite/membership side effects are controller-dependent ⚠️ NOT DEFINED; flow permission -> controller -> response; all statuses ⚠️ DECLARED BUT NOT MOUNTED (404).

- `GET /api/v1/rbac/users`
- `POST /api/v1/rbac/users/invite`
- `PUT /api/v1/rbac/users/:id`
- `DELETE /api/v1/rbac/users/:id`

---

## 12. Billing

Billing routers are declared in `src/domains/billing/routes` but are not mounted in `app.ts`. Suggested bases: `/api/v1/billing/customers`, `/api/v1/billing/items`, `/api/v1/billing/plans`, `/api/v1/billing/dashboard`.

### 12.1 Billing Customers

1. **Method + Full Paths:** `GET/POST /api/v1/billing/customers`; `GET/PUT/DELETE /api/v1/billing/customers/:id`.
2. **Auth requirement:** Billing router has no auth middleware in the route file; app mount is absent. Exact intended auth ⚠️ NOT DEFINED.
3. **Path Params:** `id` required for detail/update/delete; type/validation ⚠️ NOT DEFINED.
4. **Query Params:** None defined in route file.
5. **Request Body:** POST/PUT use BillingCustomer model fields: source provides identity/address/contact/custom-field structures, but complete controller DTO/requiredness is ⚠️ NOT DEFINED; do not invent a payload. GET/DELETE no body.
6. **Success Response:** List `200 {success:true,data:[]}`; detail/update `200 {success:true,data:object}`; create `201 {success:true,data:object}`; delete `200 {success:true,message?:string,data?:{}}`.
7. **Error Responses:** `400/404/500` controller-dependent; current runtime `404`.
8. **Business Logic / Side Effects:** Billing customer persistence; exact side effects ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended body -> BillingCustomer controller/model -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### 12.2 Billing Items

1. **Method + Full Paths:** `GET/POST /api/v1/billing/items`; `GET/PUT/DELETE /api/v1/billing/items/:id`.
2. **Auth requirement:** No mounted middleware; exact intended auth ⚠️ NOT DEFINED.
3. **Path Params:** `id` required for `/:id`; type/validation ⚠️ NOT DEFINED.
4. **Query Params:** None defined.
5. **Request Body:** BillingItem model body; fields/requiredness from controller contract are ⚠️ NOT DEFINED in supplied source. GET/DELETE no body.
6. **Success Response:** Standard list/detail/create/update/delete envelopes from section 1.4.
7. **Error Responses:** `400/404/500` controller-dependent; current route `404`.
8. **Business Logic / Side Effects:** Billing item persistence; calculations ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended controller/model -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### 12.3 Billing Plans

1. **Method + Full Paths:** `GET/POST /api/v1/billing/plans`; `GET/PUT/DELETE /api/v1/billing/plans/:id`.
2. **Auth requirement:** No mounted middleware; exact intended auth ⚠️ NOT DEFINED.
3. **Path Params:** `id` required for `/:id`; type/validation ⚠️ NOT DEFINED.
4. **Query Params:** None defined.
5. **Request Body:** Plan model fields are source-defined as plan data including feature keys used by Books middleware, but complete field schema/requiredness ⚠️ NOT DEFINED; do not invent example fields.
6. **Success Response:** Standard list/detail/create/update/delete envelopes; create `201`.
7. **Error Responses:** `400/404/500` controller-dependent; current route `404`.
8. **Business Logic / Side Effects:** Plan feature keys can gate Books access through `requireFeature`; billing CRUD side effects otherwise ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended plan mutation -> subscription feature reads later -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

### 12.4 Billing Dashboard

1. **Method + Full Path:** `GET /api/v1/billing/dashboard`.
2. **Auth requirement:** No mounted middleware; exact intended auth ⚠️ NOT DEFINED.
3. **Path Params:** None.
4. **Query Params:** None defined.
5. **Request Body:** None.
6. **Success Response:** `200 {success:true,data:<billing dashboard>}`; exact fields ⚠️ NOT DEFINED.
7. **Error Responses:** `401/403/404/500` controller-dependent; current route `404`.
8. **Business Logic / Side Effects:** Dashboard aggregation; formulas ⚠️ NOT DEFINED.
9. **Text-based Flow:** Intended auth -> aggregation -> response; current app -> 404.
10. **Status:** ⚠️ DECLARED BUT NOT MOUNTED (404)

---

## 13. Source gaps and handoff blockers

- Mount auth, organization, RBAC, billing, dashboard, reports, accounting and transaction-lock routers before treating declared paths as reachable.
- Add request-context middleware; controllers using `requestContext.getStore()` can return `Missing orgId` even after token authentication.
- Confirm tenant filtering and derive `orgId` consistently from auth rather than trusting client body values.
- Define missing list query parameters, pagination shape and count semantics.
- Define complete controller DTOs and response schemas for reports, accounting, billing and core modules.
- Document exact ledger, stock, tax, balance, recurring-schedule and report formulas before frontend implementation.
- Replace hard-coded OTP values with an expiring OTP provider.
- Decide whether login issues the JWT required by `verifyCapyngenToken`.
- Normalize `{success,message,data,count}` and validation error envelopes.
- Remove duplicate report declarations for `horizontal-pl`, `horizontal-bs`, `movement-of-equity`, `trial-balance`, `general-ledger` and `journal-report`.
- Add integration tests for every mounted endpoint, feature gate, tenant isolation and every declared-only route after mounting.
