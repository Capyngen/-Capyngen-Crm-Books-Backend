# API Documentation for Flutter Integration

> Generated from [openapi.json](openapi.json). Generated operation count: **217**. Run `npm run docs:api` after changing the OpenAPI contract.

This document describes the API contract currently represented by the repository. It intentionally distinguishes implemented contract metadata from behavior that is not present in source code. Do not infer an undocumented OTP, MFA, webhook, file-upload, export, or notification API from the feature checklist below; those capabilities are currently absent unless an endpoint appears in the catalog.

## 1. Connection and Versioning

- **Base URL:** replace `{{base_url}}` with the deployment origin, for example `https://api.example.com`.
- **API prefix/version:** `/api/v1`; health is the unversioned exception at `/health`.
- **Transport:** HTTPS in non-local environments; JSON request and response bodies unless the endpoint explicitly declares another media type.
- **Content negotiation:** send `Accept: application/json` and `Content-Type: application/json` for JSON bodies.
- **IDs:** MongoDB ObjectId values are represented as 24-character hexadecimal strings unless a response says otherwise.
- **Dates:** use ISO 8601 strings with timezone, preferably UTC, for example `2026-09-23T12:00:00.000Z`.
- **Amounts/decimals:** JSON numbers are used by the current contract; Flutter should parse defensively and use decimal-safe arithmetic for money. Do not use binary floating point for posting accounting totals.
- **Currency:** send and display an explicit ISO 4217 currency code where the resource has one; do not assume the device locale currency.

## 2. Request Headers and Authentication

| Header | Required | Value |
|---|---:|---|
| `Accept` | Recommended | `application/json` |
| `Content-Type` | JSON requests | `application/json` |
| `Authorization` | Protected APIs | `Bearer <access-token>` |
| `Cookie` | Alternative supported by server | `accessToken_hrms=<token>` or legacy `accessToken=<token>` |

The server verifies a JWT with `ACCESS_TOKEN_SECRET` (with a development fallback), loads the employee from the HRMS `employees` collection, and derives `user` and `org` context from the token. A Flutter client should store access tokens in platform-secure storage, send the bearer header on every protected request, and treat HTTP 401 as a session refresh/re-login boundary.

### Authorization layers

- Public operations are marked with `security: []` in the endpoint catalog.
- Books operations require a valid token, an organization context, a Books-compatible company platform (`all`, `accounts`, `books`, `crm`, or `sales`), an active subscription, and the route feature key where the runtime mount applies.
- The OpenAPI file does not define per-operation role/permission names. RBAC endpoints are documented as API surfaces, but callers must use the server’s role assignment rules; do not hard-code Admin access in Flutter.
- A 403 may mean platform mismatch, missing subscription, invalid plan, missing feature key, or insufficient application permission.

## 3. Response and Error Contract

### Success
```json
{
  "success": true,
  "message": "Request successful",
  "data": "<resource, object, array, or report-specific value>",
  "meta": {
    "page": 1,
    "limit": 25,
    "totalCount": 0,
    "totalPages": 0
  }
}
```

- `data` is `null`, an object, an array, or a report-specific object according to the operation.
- `meta` is present when pagination metadata is available. Defaults are `page=1`, `limit=25`; the server caps `limit` at 100. Invalid/non-positive values fall back to defaults.
- Array responses are normalized and sliced by the shared response middleware.

### Error
```json
{
  "success": false,
  "message": "Human-readable error",
  "data": null
}
```

In development, the top-level error handler may also return `stack`; never display or depend on it in Flutter. Error statuses used by the contract are:

| Status | Meaning | Typical causes |
|---:|---|---|
| 400 | Validation/business rule failure | Missing, malformed, or inconsistent payload |
| 401 | Authentication/context failure | Missing, invalid, or expired token; missing organization context; unknown user |
| 403 | Authorization/subscription failure | Plan, platform, feature, role, or permission restriction |
| 404 | Missing resource/context | Unknown ID, company profile, plan, or related entity |
| 409 | Conflict | Duplicate or state transition conflict when emitted by an operation |
| 422 | Unprocessable entity | Only when explicitly listed by an operation |
| 429 | Rate limited | Deployment or upstream rate limiter |
| 500 | Server failure | Database, subscription, feature, or unexpected server error |

## 4. Cross-Module Rules

### CRUD, search, filter, sort, and pagination

- Collection endpoints conventionally use `GET /resource`, `POST /resource`; item endpoints use `GET /resource/{id}`, `PUT`/`PATCH /resource/{id}`, and `DELETE /resource/{id}` when listed below.
- `page` and `limit` are the only globally guaranteed pagination parameters. `limit` is an integer from 1 to 100.
- `status` is the only globally repeated filter in the generated contract. Additional filters are listed per endpoint only when OpenAPI declares them.
- No global `sort`, `search`, or free-text filter contract is declared. A Flutter UI must not send undocumented query keys and assume they work.
- No global bulk, import, export, upload, download, or lifecycle-transition contract is declared; endpoint-specific exceptions are shown in the catalog.

### Accounting and calculation boundaries

- The current OpenAPI contract does not provide typed line-item, tax, discount, payment allocation, inventory valuation, or journal-posting schemas. Those details must be read from the corresponding controller/model before implementing a form or calculation client.
- The server remains authoritative for tax, discount, payment, inventory, balance, aging, valuation, and accounting calculations. Flutter should display server totals and avoid silently recomputing posted values.
- Related IDs must reference existing records in the same organization. Preserve IDs returned by the API; do not use display names as foreign keys.

# Request Payload Contracts

This section is generated into `API_DOCUMENTATION.md`. `required` means required by the create model/controller; update handlers may accept partial objects. IDs are MongoDB ObjectId strings unless stated otherwise. Dates are ISO 8601 JSON strings. Organization and audit fields are normally derived from authentication context and should not be trusted from Flutter input.

## Shared Nested Types

### Address
`attention`, `country`, `street1`, `street2`, `city`, `state`, `zipCode`, `phone`, `fax`: optional strings.

### Contact person
`firstName`, `lastName`, `email`, `phone`: optional strings; `designation`: optional string.

### Custom field
`label` and `value`: strings.

### Invoice/order line item
`item`: ObjectId where the model uses invoice/quote items; `itemId`: optional ObjectId on purchase lines; `itemDetails`: optional string; `account`: required string on purchase lines; `quantity`, `rate`, `amount`: numbers; `customerId`: optional ObjectId; `discount`: optional number, default `0`.

## Books Items

Routes: `/api/v1/books/items`

| Field | Type | Required | Default/validation |
|---|---|---:|---|
| `name` | string | create yes | Item name |
| `sku` | string | no | `""` |
| `type` | string | no | `goods` or `service`; default `goods` |
| `unit` | string | no | `pcs` |
| `salesRate` | number | create yes | default `0`; 0 to 100000000000000; rounded to 2 decimals |
| `purchaseRate` | number | create yes | default `0`; same monetary bounds |
| `description` | string | no | `""` |
| `stock` | number | no | `0` |
| `createdBy` | string | no | server/audit field |
| `orgId` | ObjectId string | no | derived from organization context |

Billing items use the same fields through `/api/v1/billing/items`; billing model validation is less restrictive for monetary values.

## Inventory Adjustments

Routes: `/api/v1/books/inventory-adjustments`

| Field | Type | Required | Default/validation |
|---|---|---:|---|
| `mode` | string | no | `quantity` or `value`; default `quantity` |
| `referenceNumber` | string | no | `""` |
| `date` | ISO date | yes | defaults to current time |
| `reason` | string | yes | required |
| `description` | string | no | `""` |
| `account` | ObjectId/string | yes | adjustment account |
| `items` | array | yes | each entry requires `item` ObjectId and `quantityAdjusted` number |
| `createdBy`, `orgId` | string/ObjectId | no | server/context fields |

Quantity mode increments each referenced item stock. Updating an adjustment does not reverse the previous stock change and update validation is not enabled by the current controller.

## Customers and Vendors

Routes: `/api/v1/books/sales/customers`, `/api/v1/books/purchases/vendors`, `/api/v1/billing/customers`

| Field | Type | Required | Default/validation |
|---|---|---:|---|
| `displayName` | string | create yes | required |
| `customerType` / `vendorType` | string | no | `business` or `individual`; default `business` |
| `salutation`, `firstName`, `lastName`, `companyName`, `email`, `phone`, `mobile`, `pan` | string | no | optional |
| `accountsReceivable` / `paymentTerms` / `remarks` | string | no | optional |
| `billingAddress`, `shippingAddress` | Address object | no | see shared type |
| `contactPersons` | array | no | default `[]`; contact person entries |
| `currency` | string | no | `INR` |
| `openingBalance`, `receivables`, `payables`, `unusedCredits` | number | no | default `0` |
| `portalAccess`, `isActive` | boolean | no | `false`/`true` respectively |
| `customFields` | array | no | default `[]`; `{label,value}` |
| `status` | string | no | `Active` or `Inactive`; default `Active` |
| `msmeRegistered` | boolean | vendor only | `false` |
| `tds` | string | vendor only | `yes` or `no`; default `no` |
| `bankDetails` | object | vendor only | `{accountHolderName,bankName,accountNumber,ifscCode}` |
| `createdBy`, `orgId` | string/ObjectId | no | server/context fields |

## Expenses and Mileage

Routes: `/api/v1/books/purchases/expenses`, `/api/v1/books/purchases/mileage`

### Expense body

| Field | Type | Required | Default/validation |
|---|---|---:|---|
| `date` | ISO date | yes | required |
| `amount`, `totalAmount` | number | yes | required |
| `expenseType` | string | no | `Goods` or `Mileage`; default `Goods` |
| `expenseAccount`, `paidThrough` | string/ObjectId | mileage required; expense optional | account/payment source |
| `taxAmount` | number | no | `0` |
| `vendorId`, `customerId`, `projectId`, `invoiceId`, `branchId` | ObjectId string | no | related entities |
| `reportingTagIds` | ObjectId string[] | no | optional |
| `billable`, `isItemized` | boolean | no | `false` |
| `reference`, `notes`, `receiptUrl`, `createdBy`, `bulkBatchId` | string | no | optional |
| `status` | string | no | `Non-Billable`, `Unbilled`, `Invoiced`, or `Reimbursed`; default `Non-Billable` |
| `lineItems` | array | no | `{expenseAccount:string, notes?:string, amount:number}` |
| `mileageData` | object | no | `{distance:number, rate:number, unit:km|mile, employee?:string}` |
| `currency`, `orgId` | string/ObjectId | no | `INR` / context |

### Mileage body

Required fields are `date` (ISO date), `distance` number, `rate` number, `amount` number, `expenseAccount` string, and `paidThrough` string. Optional fields are `unit` (`km` or `mile`, default `km`), `currency` (`INR`), `vendorId`, `customerId`, `employee`, `notes`, `createdBy`, `orgId`, and `billable` (boolean, default `false`). `status` is `Non-Billable`, `Unbilled`, `Invoiced`, or `Reimbursed`.

### Bulk expenses

`POST /api/v1/books/purchases/expenses/bulk` requires `{ "expenses": [ <Expense body>, ... ] }`. The server rejects a missing/non-array value, generates `bulkBatchId`, and inserts the entries. `GET` and `PUT /bulk/{batchId}` use the path `batchId`; PUT accepts a replacement bulk payload.

## Purchase Documents

Routes: `/api/v1/books/purchases/purchase-orders`, `/api/v1/books/purchases/bills`, `/api/v1/books/purchases/recurring-bills`

### Purchase order

Required: `vendorId` ObjectId, `poNumber` string, `orderDate` ISO date, `subTotal` number, `totalAmount` number. Optional: `referenceNumber`, `deliveryDate`, `shipmentPreference`, `paymentTerms`, `notes`, `terms`, `createdBy`, `orgId`, `customerId` ObjectId, `lineItems` array, `discount`, `discountType`, `taxWithheldType`, `taxWithheldAmount`, `adjustment`, `currency`. `deliveryDestination` is `organization` or `customer` (default `organization`). Line items contain optional `itemId`, optional `itemDetails`, required `account`, `quantity`, `rate`, and `amount`. `discountType` is `amount` or `percent`; `taxWithheldType` is `none`, `TDS`, or `TCS`. `status` is `Draft`, `Issued`, `Billed`, or `Cancelled` (default `Issued`).

### Bill

Required: `vendorId` ObjectId, `billNumber`, `billDate`, `lineItems`, `subTotal`, and `totalAmount`. Each line requires `account`, `quantity`, `rate`, and `amount`; optional `itemId`, `customerId`, and `discount`. Optional top-level fields include `taxConfigurationId`, `branchId`, `projectId`, `reportingTagIds`, `currency`, `exchangeRate`, `baseTotal`, `orderNumber`, `purchaseOrderId`, `dueDate`, `subject`, `notes`, `createdBy`, `orgId`, `accountsPayable`, `discount`, `discountType`, `taxWithheldType`, `taxWithheldAmount`, and `adjustment`. `discountType` is `amount` or `percent`; `taxWithheldType` is `none`, `TDS`, or `TCS`; `status` is `Draft`, `Open`, `Partially Paid`, `Paid`, or `Void` (default `Open`). `subTotal` and `totalAmount` are non-negative and capped at `100000000000000`.

### Recurring bill

Required: `vendorId`, `profileName`, `repeatEvery`, `startsOn`, `lineItems`, `subTotal`, and `totalAmount`. Optional: `endsOn`, `taxConfigurationId`, `notes`, `createdBy`, `orgId`. `neverExpires` defaults `false`; line items require `account`, `quantity`, `rate`, `amount`; `discountType` is `amount` or `percent`; `taxWithheldType` is `none`, `TDS`, or `TCS`; `status` is `Active`, `Stopped`, or `Expired`; `currency` defaults `INR`.

## Payments

### Payments made

Route: `/api/v1/books/purchases/payments-made`. Required: `vendorId` ObjectId, `paymentType`, `paymentNumber`, `amount`, `paymentDate`, `paymentMode`, and `paidThrough`. `paymentType` is `Bill Payment` or `Vendor Advance`; `status` is `Open`, `Closed`, or `Void` (default `Closed`). Optional: `branchId`, `projectId`, `reportingTagIds`, `currency`, `exchangeRate`, `baseTotal`, `referenceNumber`, `notes`, `depositTo`, `orgId`, `bills` array of `{billId, amountApplied}`, and `tds` object `{taxName, rate, act, section, isHigherRate, startDate, endDate}`.

### Payments received

Route: `/api/v1/books/sales/payments-received`. Required: `customer` ObjectId, `amount`, `paymentDate`, `paymentNumber`, and `paymentMode`. `amount` and `unusedAmount` are non-negative and capped at `100000000000000`; `paymentNumber` is generated as `PR-00001` when omitted. Optional: `branchId`, `projectId`, `reportingTagIds`, `currency`, `exchangeRate`, `baseTotal`, `depositTo`, `referenceNumber`, `taxType`, `notes`, `attachments`, `createdBy`, `orgId`, and `invoices` array of `{invoice, amountApplied}`. Defaults: `unusedAmount`, `bankCharges`, `taxAmount`, `amountUsed`, `amountRefunded`, `amountInExcess` = `0`; `taxDeducted` and `sendThankYouNote` = `false`; `status` = `Unused`, `Partially Used`, or `Closed`.

## Sales Documents

Routes: `/api/v1/books/sales/quotes`, `/api/v1/books/sales/sales-orders`, `/api/v1/books/sales/invoices`, `/api/v1/books/sales/recurring-invoices`, `/api/v1/books/sales/delivery-challans`, `/api/v1/books/sales/credit-notes`

### Shared sales line and totals fields

Sales `items` arrays contain required `item` ObjectId, `quantity` number, `rate` number, and `amount` number. Common totals fields are `subTotal`, `total`, `discountValue`, `discount`, `taxWithheldAmount`, `adjustment`, and `taxTotal` (numbers, generally default `0`). `discountType` is `amount` or `percent`; `taxWithheldType` is `TDS`, `TCS`, or `none`. Related IDs include customer, invoice, sales order, project, branch, tax configuration, and reporting tags as declared below.

### Quote

Required: `quoteNumber`, `customer` ObjectId, `quoteDate`, `items`, `subTotal`, and `total`. `quoteNumber` is generated as `QUO-00001` when omitted; `quoteDate` defaults to now. Optional: `expiryDate`, `referenceNumber`, `invoiceId`, `salesperson`, `projectName`, `projectDetails`, `subject`, `attachments`, `notes`, `terms`, `createdBy`, `orgId`, and shared totals fields. `status` is `Draft`, `Sent`, `Accepted`, `Declined`, `Expired`, or `Invoiced` (default `Sent`).

### Sales order

Required: `salesOrderNumber`, `customer` ObjectId, `salesOrderDate`, `items`, `subTotal`, and `total`. Number generation uses `SO-00001`; date defaults to now. Optional: `expectedShipmentDate`, `referenceNumber`, `salesperson`, `deliveryMethod`, `paymentTerms`, `attachments`, `notes`, `terms`, `createdBy`, `orgId`, and shared totals fields. `status` is `Draft`, `Open`, `Closed`, `Cancelled`, or `Invoiced` (default `Open`).

### Invoice

Required: `invoiceNumber`, `customer` ObjectId, `items`, `subTotal`, `total`, and `balanceDue`. `invoiceDate` defaults to now; `status` is `Draft`, `Sent`, `Viewed`, `Paid`, `PartiallyPaid`, `Void`, or `Overdue` (default `Sent`). Optional: `taxConfigurationId`, `branchId`, `projectId`, `salesOrderId`, `reportingTagIds`, `currency`, `exchangeRate`, `baseTotal`, `dueDate`, `paymentTerms`, `referenceNumber`, `orderNumber`, `salesperson`, `projectName`, `projectDetails`, `subject`, `attachments`, `notes`, `terms`, `orgId`, `accountsReceivable`, and shared totals fields. Monetary totals are non-negative and capped at `100000000000000`. Updating an unpaid total updates `balanceDue`; voiding with applied payments is rejected.

### Recurring invoice

Required: `profileName`, `customer` ObjectId, `repeatEvery`, `startsOn`, `items`, `subTotal`, and `total`. `repeatEvery` defaults to `1 month`, `startsOn` to now, `neverExpires` to `false`, and `status` is `Active`, `Stopped`, or `Draft` (default `Draft`). Item, discount, tax, and optional descriptive fields match invoices; `endsOn`, `paymentTerms`, `salesperson`, `projectName`, `projectDetails`, `subject`, `attachments`, `notes`, `terms`, `createdBy`, and `orgId` are optional.

### Delivery challan

Required: `challanNumber`, `customer` ObjectId, `challanDate`, `items`, `subTotal`, and `total`. Number is generated as `DC-00001`; `challanDate` defaults to now. Optional `salesOrderId`, `invoiceId`, `referenceNumber`, `notes`, `terms`, `attachments`, `createdBy`, `orgId`, and shared totals fields. `challanType` is `Supply of Liquid Gas`, `Job Work`, `Supply on Approval`, or `Others`; `status` is `Draft`, `Open`, `Delivered`, `Returned`, or `Closed` (default `Draft`).

### Credit note

Required: `customer` ObjectId, `creditNoteNumber`, `creditNoteDate`, `items`, `subTotal`, and `total`. Number is generated as `CN-00001`; date defaults to now. Items require `item`, `quantity` (minimum `1`), `rate`, and `amount`. Optional `invoiceId`, `refunds` array of `{date, amount, reference?}`, `appliedToInvoices` array of `{invoiceId, amountApplied}`, `currency`, `exchangeRate`, `baseTotal`, `referenceNumber`, `salesperson`, `notes`, `terms`, `attachments`, `createdBy`, and `orgId`. `discountType` is `percent` or `amount`; `status` is `Draft`, `Open`, `Closed`, or `Void` (default `Draft`). Totals are non-negative and capped at `100000000000000`.

## Accounting and Work Management

### Chart of accounts

Required: `accountType`, `accountName`. Optional: `accountCode`, `parentAccount`, `currency`, `accountNumber`, `ifsc`, `orgId`, `description` (maximum 500 characters), `users` string array, `addToWatchlist`, `isSubAccount`, and `isSystemAccount` (booleans default `false`). `status` is `Active` or `Inactive` (default `Active`).

### Currency adjustment

Required: `orgId`, `adjustmentDate`, `adjustedCurrency`, `newExchangeRate`, `totalGainOrLoss`, and `details`. Each detail requires `transactionId`, `transactionType`, `foreignBalance`, `oldBaseValue`, `newBaseValue`, and `gainOrLoss`.

### Journal

Required: `date`, `journalNumber`, `notes`, and `reportingMethod`. `reportingMethod` is `accrual`, `cash`, or `both`. `lineItems` contain required `account`, optional `description` and `contact`, and `debits`/`credits` numbers defaulting to `0`. Optional: `publishReverseOnlyOnDate` (default `false`), `currency` (default `INR`), `subTotal`, `total`, `reverseJournalDate`, `referenceNumber`, `orgId`. `status` is `Draft`, `Published`, or `Void` (default `Draft`).

### Project

Required: `projectName`, `customer` ObjectId, and `billingMethod`. `billingMethod` is `fixed`, `project_hours`, `task_hours`, or `staff_hours`. Optional: `projectCode`, `description`, `totalCost`, `ratePerHour`, `costBudget`, `revenueBudget`, `orgId`, `users` array of `{userId, ratePerHour?}`, and `tasks` array of `{name, description?, ratePerHour?, billable}`. `watchlist` defaults `false`; `status` is `Active`, `Inactive`, `Completed`, or `Pending` (default `Active`).

### Time entry

Required: `orgId`, `projectId` ObjectId, `employeeId` ObjectId, `date`, `hours`, `costRate`, and `billingRate`. Optional: `taskId` and `invoiceId` ObjectIds, `isBillable` default `true`, and `status` `Unbilled` or `Invoiced` (default `Unbilled`).

### Transaction lock

PUT body accepts optional date fields `salesLockDate`, `purchasesLockDate`, `bankingLockDate`, `accountantLockDate`, `allLockDate`, optional `reason` and `lockedBy`, `negativeStockRestriction` boolean default `true`, and `partialUnlocks` array of `{module, startDate, endDate, reason}`. `orgId` is required by the model but normally comes from context.

## Authentication, Organization, RBAC, and Billing

### Authentication

The OpenAPI contract lists `POST /api/v1/auth/login`, `/login/verify`, `/signup`, `/signup/verify`, `/check-invite`, and `/accept-invite-signup` with generic request bodies only. Exact field validation must be aligned with the external HRMS authentication service because those controllers are not mounted in the current `src/app.ts`.

### Organization

`POST /api/v1/organizations/setup` requires `userId`, `companyName`, `industry`, and `location`; optional fields are `state`, `currency`, `language`, `timeZone`, `gstNumber`, `gstRegistered` (default `false`), `fiscalYearStartMonth` (default `4`), and `fiscalYearStartDay` (default `1`). `POST /api/v1/organizations/join` requires `{orgId:string}`; `GET /organizations` has no body.

### Roles

`POST /api/v1/rbac/roles` requires `name`; optional `description`, `parentRoleId` ObjectId, and `permissions` object default `{}`. `orgId` is context-injected and required by the model. PUT accepts the same fields as partial update.

### Users

`POST /api/v1/rbac/users/invite` requires `email` and `roleId` ObjectId; optional `name`. Email is lowercased by the controller. `PUT /api/v1/rbac/users/{id}` accepts `{roleId:ObjectId}`. User status is set by the server to `Active` or `Invited`.

### Billing plans

`POST`/`PUT /api/v1/billing/plans` accepts `planName` required on create, `planCode` default `""`, `productName` default `General Product`, `billingFrequency` number default `1`, `billingFrequencyUnit` default `month`, `price` required on create default `0`, `setupFee` and `freeTrialDays` default `0`, `status` default `Active`, `description` default `""`, and optional `orgId`. Billing dashboard is read-only.

## Bodyless Requests

All GET and DELETE operations have no JSON request body. Use their documented path/query parameters. Sending a JSON body is unsupported and must not be required by the Flutter client. POST/PUT operations that have only a generic OpenAPI schema are explicitly called out above; their model-level contract is the applicable field section in this document.

## 5. Requested Capabilities Not Present in the Contract

| Capability | Current status | Flutter guidance |
|---|---|---|
| OTP, MFA, refresh-token, logout | No endpoint is listed in OpenAPI | Use the external HRMS/session contract; do not invent paths in this client. |
| Webhooks and third-party integrations | No endpoint is listed | No client integration contract exists here. |
| File/document upload/download | No multipart or binary endpoint is listed | No upload/download client should be generated from this repository. |
| Notifications/activity APIs | No dedicated notification endpoint is listed | Activity report endpoints are listed under Reports; they are not push notifications. |
| Bulk import/export | No dedicated endpoint is listed | The expense bulk endpoints are documented below; they are not assumed to be import/export without a declared request body. |
| Status/lifecycle transitions | No dedicated transition endpoint is listed | Use resource update operations only where listed and verify controller behavior. |

## 6. Module and Feature Index

- **Auth:** 6 operation(s)
- **Billing customers:** 5 operation(s)
- **Billing dashboard:** 1 operation(s)
- **Billing items:** 5 operation(s)
- **Billing plans:** 5 operation(s)
- **Bills:** 5 operation(s)
- **Books context:** 1 operation(s)
- **Chart of Accounts:** 5 operation(s)
- **Credit notes:** 5 operation(s)
- **Currency Adjustments:** 5 operation(s)
- **Dashboard:** 1 operation(s)
- **Delivery challans:** 5 operation(s)
- **Expenses:** 8 operation(s)
- **Health:** 1 operation(s)
- **Inventory adjustments:** 4 operation(s)
- **Invoices:** 5 operation(s)
- **Items:** 4 operation(s)
- **Journals:** 5 operation(s)
- **Mileage:** 5 operation(s)
- **Organization:** 3 operation(s)
- **Payments made:** 5 operation(s)
- **Payments received:** 5 operation(s)
- **Projects:** 5 operation(s)
- **Purchase orders:** 5 operation(s)
- **Quotes:** 5 operation(s)
- **Recurring bills:** 5 operation(s)
- **Recurring expenses:** 5 operation(s)
- **Recurring invoices:** 5 operation(s)
- **Reports:** 64 operation(s)
- **Roles:** 5 operation(s)
- **Sales customers:** 4 operation(s)
- **Sales orders:** 5 operation(s)
- **Time Entries:** 5 operation(s)
- **Transaction locks:** 2 operation(s)
- **Users:** 4 operation(s)
- **Vendors:** 4 operation(s)

## 7. Complete Endpoint Catalog

Every operation below is generated from `openapi.json`, including method, path, parameters, request body, success example, and every declared error status. A missing field means the current OpenAPI contract does not declare it.

### GET /health
- **Operation:** Health check | **Tag:** Health
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Healthy
    - Example: `{"success":true,"message":"Request successful","data":{}}`

### GET /api/v1/books/me
- **Operation:** Get subscription context | **Tag:** Books context
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Subscription context
    - Example: `{"success":true,"message":"Request successful","data":{"subscription":{},"plan":{},"role":"Admin"}}`
  - **HTTP 401:** Missing or invalid token
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/items
- **Operation:** List Items | **Tag:** Items
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/items
- **Operation:** Create Items | **Tag:** Items
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/items/{id}
- **Operation:** Get Items record | **Tag:** Items
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/items/{id}
- **Operation:** Update Items record | **Tag:** Items
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/inventory-adjustments
- **Operation:** List Inventory adjustments | **Tag:** Inventory adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/inventory-adjustments
- **Operation:** Create Inventory adjustments | **Tag:** Inventory adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/inventory-adjustments/{id}
- **Operation:** Get Inventory adjustments record | **Tag:** Inventory adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/inventory-adjustments/{id}
- **Operation:** Update Inventory adjustments record | **Tag:** Inventory adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/customers
- **Operation:** List Sales customers | **Tag:** Sales customers
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/customers
- **Operation:** Create Sales customers | **Tag:** Sales customers
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/customers/{id}
- **Operation:** Get Sales customers record | **Tag:** Sales customers
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/customers/{id}
- **Operation:** Update Sales customers record | **Tag:** Sales customers
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/vendors
- **Operation:** List Vendors | **Tag:** Vendors
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/vendors
- **Operation:** Create Vendors | **Tag:** Vendors
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/vendors/{id}
- **Operation:** Get Vendors record | **Tag:** Vendors
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/vendors/{id}
- **Operation:** Update Vendors record | **Tag:** Vendors
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/expenses
- **Operation:** List Expenses | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/expenses
- **Operation:** Create Expenses | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/expenses/{id}
- **Operation:** Get Expenses record | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/expenses/{id}
- **Operation:** Update Expenses record | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/expenses/{id}
- **Operation:** Delete Expenses record | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/recurring-expenses
- **Operation:** List Recurring expenses | **Tag:** Recurring expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/recurring-expenses
- **Operation:** Create Recurring expenses | **Tag:** Recurring expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/recurring-expenses/{id}
- **Operation:** Get Recurring expenses record | **Tag:** Recurring expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/recurring-expenses/{id}
- **Operation:** Update Recurring expenses record | **Tag:** Recurring expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/recurring-expenses/{id}
- **Operation:** Delete Recurring expenses record | **Tag:** Recurring expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/purchase-orders
- **Operation:** List Purchase orders | **Tag:** Purchase orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/purchase-orders
- **Operation:** Create Purchase orders | **Tag:** Purchase orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/purchase-orders/{id}
- **Operation:** Get Purchase orders record | **Tag:** Purchase orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/purchase-orders/{id}
- **Operation:** Update Purchase orders record | **Tag:** Purchase orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/purchase-orders/{id}
- **Operation:** Delete Purchase orders record | **Tag:** Purchase orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/bills
- **Operation:** List Bills | **Tag:** Bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/bills
- **Operation:** Create Bills | **Tag:** Bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/bills/{id}
- **Operation:** Get Bills record | **Tag:** Bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/bills/{id}
- **Operation:** Update Bills record | **Tag:** Bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/bills/{id}
- **Operation:** Delete Bills record | **Tag:** Bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/recurring-bills
- **Operation:** List Recurring bills | **Tag:** Recurring bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/recurring-bills
- **Operation:** Create Recurring bills | **Tag:** Recurring bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/recurring-bills/{id}
- **Operation:** Get Recurring bills record | **Tag:** Recurring bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/recurring-bills/{id}
- **Operation:** Update Recurring bills record | **Tag:** Recurring bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/recurring-bills/{id}
- **Operation:** Delete Recurring bills record | **Tag:** Recurring bills
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/payments-made
- **Operation:** List Payments made | **Tag:** Payments made
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/payments-made
- **Operation:** Create Payments made | **Tag:** Payments made
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/payments-made/{id}
- **Operation:** Get Payments made record | **Tag:** Payments made
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/payments-made/{id}
- **Operation:** Update Payments made record | **Tag:** Payments made
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/payments-made/{id}
- **Operation:** Delete Payments made record | **Tag:** Payments made
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/mileage
- **Operation:** List Mileage | **Tag:** Mileage
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/mileage
- **Operation:** Create Mileage | **Tag:** Mileage
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/mileage/{id}
- **Operation:** Get Mileage record | **Tag:** Mileage
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/mileage/{id}
- **Operation:** Update Mileage record | **Tag:** Mileage
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/purchases/mileage/{id}
- **Operation:** Delete Mileage record | **Tag:** Mileage
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/quotes
- **Operation:** List Quotes | **Tag:** Quotes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/quotes
- **Operation:** Create Quotes | **Tag:** Quotes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/quotes/{id}
- **Operation:** Get Quotes record | **Tag:** Quotes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/quotes/{id}
- **Operation:** Update Quotes record | **Tag:** Quotes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/quotes/{id}
- **Operation:** Delete Quotes record | **Tag:** Quotes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/sales-orders
- **Operation:** List Sales orders | **Tag:** Sales orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/sales-orders
- **Operation:** Create Sales orders | **Tag:** Sales orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/sales-orders/{id}
- **Operation:** Get Sales orders record | **Tag:** Sales orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/sales-orders/{id}
- **Operation:** Update Sales orders record | **Tag:** Sales orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/sales-orders/{id}
- **Operation:** Delete Sales orders record | **Tag:** Sales orders
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/invoices
- **Operation:** List Invoices | **Tag:** Invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/invoices
- **Operation:** Create Invoices | **Tag:** Invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/invoices/{id}
- **Operation:** Get Invoices record | **Tag:** Invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/invoices/{id}
- **Operation:** Update Invoices record | **Tag:** Invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/invoices/{id}
- **Operation:** Delete Invoices record | **Tag:** Invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/recurring-invoices
- **Operation:** List Recurring invoices | **Tag:** Recurring invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/recurring-invoices
- **Operation:** Create Recurring invoices | **Tag:** Recurring invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/recurring-invoices/{id}
- **Operation:** Get Recurring invoices record | **Tag:** Recurring invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/recurring-invoices/{id}
- **Operation:** Update Recurring invoices record | **Tag:** Recurring invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/recurring-invoices/{id}
- **Operation:** Delete Recurring invoices record | **Tag:** Recurring invoices
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/delivery-challans
- **Operation:** List Delivery challans | **Tag:** Delivery challans
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/delivery-challans
- **Operation:** Create Delivery challans | **Tag:** Delivery challans
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/delivery-challans/{id}
- **Operation:** Get Delivery challans record | **Tag:** Delivery challans
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/delivery-challans/{id}
- **Operation:** Update Delivery challans record | **Tag:** Delivery challans
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/delivery-challans/{id}
- **Operation:** Delete Delivery challans record | **Tag:** Delivery challans
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/payments-received
- **Operation:** List Payments received | **Tag:** Payments received
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/payments-received
- **Operation:** Create Payments received | **Tag:** Payments received
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/payments-received/{id}
- **Operation:** Get Payments received record | **Tag:** Payments received
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/payments-received/{id}
- **Operation:** Update Payments received record | **Tag:** Payments received
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/payments-received/{id}
- **Operation:** Delete Payments received record | **Tag:** Payments received
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/credit-notes
- **Operation:** List Credit notes | **Tag:** Credit notes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/sales/credit-notes
- **Operation:** Create Credit notes | **Tag:** Credit notes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/sales/credit-notes/{id}
- **Operation:** Get Credit notes record | **Tag:** Credit notes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/sales/credit-notes/{id}
- **Operation:** Update Credit notes record | **Tag:** Credit notes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/sales/credit-notes/{id}
- **Operation:** Delete Credit notes record | **Tag:** Credit notes
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/purchases/expenses/bulk
- **Operation:** Create expenses in bulk | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/purchases/expenses/bulk/{batchId}
- **Operation:** Get bulk expenses | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `batchId` | path | yes | `string` |
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/purchases/expenses/bulk/{batchId}
- **Operation:** Replace bulk expenses | **Tag:** Expenses
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `batchId` | path | yes | `string` |
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/organizations
- **Operation:** List organizations | **Tag:** Organization
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/check-invite
- **Operation:** Auth check-invite | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/accept-invite-signup
- **Operation:** Auth accept-invite-signup | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/login
- **Operation:** Auth login | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/login/verify
- **Operation:** Auth login/verify | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/signup
- **Operation:** Auth signup | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/auth/signup/verify
- **Operation:** Auth signup/verify | **Tag:** Auth
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/organizations/setup
- **Operation:** Create organization | **Tag:** Organization
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/organizations/join
- **Operation:** Join organization | **Tag:** Organization
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/rbac/roles
- **Operation:** List Roles | **Tag:** Roles
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/rbac/roles
- **Operation:** Create Roles | **Tag:** Roles
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/rbac/roles/{id}
- **Operation:** Get Roles record | **Tag:** Roles
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/rbac/roles/{id}
- **Operation:** Update Roles record | **Tag:** Roles
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/rbac/roles/{id}
- **Operation:** Delete role | **Tag:** Roles
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/rbac/users
- **Operation:** List Users | **Tag:** Users
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/rbac/users/{id}
- **Operation:** Update Users record | **Tag:** Users
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/rbac/users/{id}
- **Operation:** Remove user | **Tag:** Users
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/rbac/users/invite
- **Operation:** Invite user | **Tag:** Users
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/chart-of-accounts
- **Operation:** List Chart of Accounts | **Tag:** Chart of Accounts
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/chart-of-accounts
- **Operation:** Create Chart of Accounts | **Tag:** Chart of Accounts
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/chart-of-accounts/{id}
- **Operation:** Get Chart of Accounts record | **Tag:** Chart of Accounts
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/chart-of-accounts/{id}
- **Operation:** Update Chart of Accounts record | **Tag:** Chart of Accounts
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/chart-of-accounts/{id}
- **Operation:** Delete Chart of Accounts record | **Tag:** Chart of Accounts
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/journals
- **Operation:** List Journals | **Tag:** Journals
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/journals
- **Operation:** Create Journals | **Tag:** Journals
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/journals/{id}
- **Operation:** Get Journals record | **Tag:** Journals
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/journals/{id}
- **Operation:** Update Journals record | **Tag:** Journals
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/journals/{id}
- **Operation:** Delete Journals record | **Tag:** Journals
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/currency-adjustments
- **Operation:** List Currency Adjustments | **Tag:** Currency Adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/currency-adjustments
- **Operation:** Create Currency Adjustments | **Tag:** Currency Adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/currency-adjustments/{id}
- **Operation:** Get Currency Adjustments record | **Tag:** Currency Adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/currency-adjustments/{id}
- **Operation:** Update Currency Adjustments record | **Tag:** Currency Adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/currency-adjustments/{id}
- **Operation:** Delete Currency Adjustments record | **Tag:** Currency Adjustments
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/projects
- **Operation:** List Projects | **Tag:** Projects
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/projects
- **Operation:** Create Projects | **Tag:** Projects
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/projects/{id}
- **Operation:** Get Projects record | **Tag:** Projects
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/projects/{id}
- **Operation:** Update Projects record | **Tag:** Projects
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/projects/{id}
- **Operation:** Delete Projects record | **Tag:** Projects
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/time-entries
- **Operation:** List Time Entries | **Tag:** Time Entries
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/books/time-entries
- **Operation:** Create Time Entries | **Tag:** Time Entries
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/time-entries/{id}
- **Operation:** Get Time Entries record | **Tag:** Time Entries
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/time-entries/{id}
- **Operation:** Update Time Entries record | **Tag:** Time Entries
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/books/time-entries/{id}
- **Operation:** Delete Time Entries record | **Tag:** Time Entries
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/transaction-locks
- **Operation:** Get transaction lock | **Tag:** Transaction locks
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/books/transaction-locks
- **Operation:** Update transaction lock | **Tag:** Transaction locks
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/dashboard
- **Operation:** Books dashboard | **Tag:** Dashboard
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/drilldown
- **Operation:** Run drilldown report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/profit-and-loss
- **Operation:** Run profit-and-loss report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/sales-by-customer
- **Operation:** Run sales-by-customer report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/sales-by-item
- **Operation:** Run sales-by-item report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/sales-by-salesperson
- **Operation:** Run sales-by-salesperson report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/sales-summary
- **Operation:** Run sales-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/inventory-summary
- **Operation:** Run inventory-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/inventory-valuation
- **Operation:** Run inventory-valuation report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/fifo-tracking
- **Operation:** Run fifo-tracking report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/profit-by-item
- **Operation:** Run profit-by-item report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/sales-channel-sync
- **Operation:** Run sales-channel-sync report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/committed-stock
- **Operation:** Run committed-stock report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/inventory-aging
- **Operation:** Run inventory-aging report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/stock-summary
- **Operation:** Run stock-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/inventory-adj-summary
- **Operation:** Run inventory-adj-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/inventory-adj-details
- **Operation:** Run inventory-adj-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/turnover-qty
- **Operation:** Run turnover-qty report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/abc-classification
- **Operation:** Run abc-classification report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/turnover-amount
- **Operation:** Run turnover-amount report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/weighted-average-cost
- **Operation:** Run weighted-average-cost report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/customer-balances
- **Operation:** Run customer-balances report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/vendor-balances
- **Operation:** Run vendor-balances report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/balance-sheet
- **Operation:** Run balance-sheet report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/cash-flow
- **Operation:** Run cash-flow report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/horizontal-pl
- **Operation:** Run horizontal-pl report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/horizontal-bs
- **Operation:** Run horizontal-bs report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/movement-of-equity
- **Operation:** Run movement-of-equity report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/business-performance-ratios
- **Operation:** Run business-performance-ratios report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/trial-balance
- **Operation:** Run trial-balance report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/general-ledger
- **Operation:** Run general-ledger report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/journal-report
- **Operation:** Run journal-report report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/receivables-aging
- **Operation:** Run receivables-aging report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/invoice-details
- **Operation:** Run invoice-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/ar-aging-details
- **Operation:** Run ar-aging-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/so-details
- **Operation:** Run so-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/delivery-challan-details
- **Operation:** Run delivery-challan-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/quote-details
- **Operation:** Run quote-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/quote-item-details
- **Operation:** Run quote-item-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/receivable-summary
- **Operation:** Run receivable-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/receivable-details
- **Operation:** Run receivable-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payables-aging
- **Operation:** Run payables-aging report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/po-details
- **Operation:** Run po-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/ap-aging-details
- **Operation:** Run ap-aging-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/vendor-credit-details
- **Operation:** Run vendor-credit-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payables-refund-history
- **Operation:** Run payables-refund-history report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/po-by-vendor
- **Operation:** Run po-by-vendor report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/po-by-item
- **Operation:** Run po-by-item report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payable-summary
- **Operation:** Run payable-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payable-details
- **Operation:** Run payable-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/expenses-by-category
- **Operation:** Run expenses-by-category report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/expense-details
- **Operation:** Run expense-details report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/purchases-by-vendor
- **Operation:** Run purchases-by-vendor report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/purchases-by-item
- **Operation:** Run purchases-by-item report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/project-summary
- **Operation:** Run project-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/timesheet-profitability
- **Operation:** Run timesheet-profitability report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payments-received-report
- **Operation:** Run payments-received-report report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/payments-made-report
- **Operation:** Run payments-made-report report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/tax-summary
- **Operation:** Run tax-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/budget-vs-actual
- **Operation:** Run budget-vs-actual report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/activity-log
- **Operation:** Run activity-log report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/day-book
- **Operation:** Run day-book report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/account-transactions
- **Operation:** Run account-transactions report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/account-type-summary
- **Operation:** Run account-type-summary report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/books/reports/detailed-general-ledger
- **Operation:** Run detailed-general-ledger report | **Tag:** Reports
- **Authentication:** Bearer token required
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Report response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 401:** Authentication error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Books access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 500:** Report error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/customers
- **Operation:** List Billing customers | **Tag:** Billing customers
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/billing/customers
- **Operation:** Create Billing customers | **Tag:** Billing customers
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/customers/{id}
- **Operation:** Get Billing customers record | **Tag:** Billing customers
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/billing/customers/{id}
- **Operation:** Update Billing customers record | **Tag:** Billing customers
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/billing/customers/{id}
- **Operation:** Delete Billing customers record | **Tag:** Billing customers
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/items
- **Operation:** List Billing items | **Tag:** Billing items
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/billing/items
- **Operation:** Create Billing items | **Tag:** Billing items
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/items/{id}
- **Operation:** Get Billing items record | **Tag:** Billing items
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/billing/items/{id}
- **Operation:** Update Billing items record | **Tag:** Billing items
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/billing/items/{id}
- **Operation:** Delete Billing items record | **Tag:** Billing items
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/plans
- **Operation:** List Billing plans | **Tag:** Billing plans
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### POST /api/v1/billing/plans
- **Operation:** Create Billing plans | **Tag:** Billing plans
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 201:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/plans/{id}
- **Operation:** Get Billing plans record | **Tag:** Billing plans
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `id` | path | yes | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### PUT /api/v1/billing/plans/{id}
- **Operation:** Update Billing plans record | **Tag:** Billing plans
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** application/json; required
Schema reference: `#/components/schemas/ApiRequest`
- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### DELETE /api/v1/billing/plans/{id}
- **Operation:** Delete Billing plans record | **Tag:** Billing plans
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:** None declared.
- **Request body:** Not applicable; DELETE operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":{}}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

### GET /api/v1/billing/dashboard
- **Operation:** Billing dashboard | **Tag:** Billing dashboard
- **Authentication:** Public according to OpenAPI
- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.
- **Path/query parameters:**
| Name | Location | Required | Type/constraints |
|---|---|---:|---|
| `page` | query | no | `integer, min=1, default=1` |
| `limit` | query | no | `integer, min=1, max=100, default=25` |
| `status` | query | no | `string` |
- **Request body:** Not applicable; GET operations in this contract do not accept a JSON body.
- **Responses:**
  - **HTTP 200:** Successful response
    - Example: `{"success":true,"message":"Request successful","data":[]}`
  - **HTTP 400:** Validation or business-rule error
    - Example: `{"success":false,"message":"Validation failed","data":null}`
  - **HTTP 401:** Authentication or organization context error
    - Example: `{"success":false,"message":"Invalid or missing token","data":null}`
  - **HTTP 403:** Subscription or feature access error
    - Example: `{"success":false,"message":"Feature access denied","data":null}`
  - **HTTP 404:** Resource not found
    - Example: `{"success":false,"message":"Resource not found","data":null}`
  - **HTTP 500:** Server error
    - Example: `{"success":false,"message":"Server error","data":null}`

## 8. Flutter Integration Checklist

1. Configure the deployment origin as `baseUrl`; append the exact paths above.
2. Add `Authorization: Bearer <access-token>` for operations whose OpenAPI security is bearer.
3. Serialize JSON with the exact casing and IDs in the endpoint-specific contract; reject unknown enum values gracefully.
4. Decode the wrapper first, then decode `data`; preserve `meta` for paged screens.
5. On 401, clear stale credentials or use the external HRMS refresh flow; on 403, show subscription/permission state instead of retrying.
6. Treat 400/404 as actionable API errors, 409/422 as form/state conflicts, and 500/429 as retryable only under an explicit retry policy.
7. Keep money as decimal-safe values and use server-returned totals for accounting screens.

## 9. Source of Truth and Regeneration

- Contract metadata: [openapi.json](openapi.json)
- Runtime route mounting: [src/app.ts](../src/app.ts)
- Response wrapper and pagination: [src/core/middlewares/apiContract.ts](../src/core/middlewares/apiContract.ts), [src/core/http/apiResponse.ts](../src/core/http/apiResponse.ts)
- Authentication/subscription/feature gates: [src/core/middlewares/hrmsAuth.ts](../src/core/middlewares/hrmsAuth.ts)
- Regenerate: `npm run docs:api`

