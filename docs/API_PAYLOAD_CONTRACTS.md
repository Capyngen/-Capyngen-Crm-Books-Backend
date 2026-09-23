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
