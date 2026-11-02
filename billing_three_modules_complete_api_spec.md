# 🏛️ Deep-Dive Enterprise Billing API & Operations Blueprint (Ground-to-Cloud)

Is document me Billing system ke teeno primary modules (**Subscriptions & Sales**, **Payments & Collections**, aur **Time & Client Billing**) ke saare 8 sub-modules ka **Create**, **Edit (Update)**, **Delete**, **Save/Draft**, **Split View**, **Detail View Tabs**, aur **Single Button Clicks** ka complete technical blueprint diya gaya hai.

---

## 📑 Index of Submodules
1. [Module 1: Subscriptions & Sales](#1-module-1-subscriptions--sales-billingsales)
   - 1.1 [Subscriptions (`/billing/sales/subscriptions`)](#11-subscriptions-billingsalessubscriptions)
   - 1.2 [Recurring Invoices (`/billing/sales/invoices`)](#12-recurring-invoices-billingsalesinvoices)
   - 1.3 [Quotes & Proposals (`/billing/sales/quotes`)](#13-quotes--proposals-billingsalesquotes)
   - 1.4 [Credit Notes & Refunds (`/billing/sales/credit-notes`)](#14-credit-notes--refunds-billingsalescredit-notes)
2. [Module 2: Payments & Collections](#2-module-2-payments--collections-billingpayments)
   - 2.1 [Payments Received (`/billing/payments/received`)](#21-payments-received-billingpaymentsreceived)
   - 2.2 [Payment Gateway Setup (`/billing/apps/zoho-payments`)](#22-payment-gateway-setup-billingappszoho-payments)
3. [Module 3: Time & Client Billing](#3-module-3-time--client-billing-billingtime-tracking)
   - 3.1 [Client Projects (`/billing/time-tracking/projects`)](#31-client-projects-billingtime-trackingprojects)
   - 3.2 [Billable Timesheets (`/billing/time-tracking/timesheet`)](#32-billable-timesheets-billingtime-trackingtimesheet)

---

# 1. MODULE 1: Subscriptions & Sales (`/billing/sales`)

---

## 1.1 Subscriptions (`/billing/sales/subscriptions`)
> **Core Purpose**: Automatic recurring billing profiles. Binds customer accounts with catalog products/plans on predetermined intervals (Monthly, Quarterly, Annually).

### ➕ A. CREATE / SAVE API
- **Endpoint**: `POST /api/v1/billing/sales/subscriptions` *(or `/api/v1/billing/subscriptions`)*
- **Headers**:
  ```http
  Authorization: Bearer <capyngen_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Complete Request Payload (JSON)**:
  ```json
  {
    "profileName": "Enterprise Cloud Hosting - Finwizz Tier 3",
    "customer": "6aa00ceb36473ebc95f399dd",
    "repeatEvery": "1 month",
    "frequency": "Monthly",
    "startsOn": "2026-11-01T00:00:00.000Z",
    "endsOn": "2027-10-31T23:59:59.000Z",
    "neverExpires": false,
    "paymentTerms": "Net 30",
    "status": "Active",
    "items": [
      {
        "item": "6ad525322d5bde67f33dee7f",
        "description": "Dedicated Cloud Core Cluster (32 vCPU, 128GB RAM)",
        "quantity": 1,
        "rate": 125000.00,
        "amount": 125000.00
      },
      {
        "item": "6ad525322d5bde67f33dee80",
        "description": "24/7 Dedicated DevOps Support SLA",
        "quantity": 1,
        "rate": 25000.00,
        "amount": 25000.00
      }
    ],
    "subTotal": 150000.00,
    "discountType": "percent",
    "discountValue": 10,
    "discount": 15000.00,
    "taxWithheldType": "TDS",
    "taxWithheldAmount": 2700.00,
    "adjustment": 0,
    "taxTotal": 24300.00,
    "total": 159300.00,
    "salesperson": "Amit Verma",
    "projectName": "Finwizz Infrastructure Modernization",
    "subject": "Monthly Dedicated Hosting Subscription",
    "notes": "Invoices auto-generate on the 1st of every calendar month.",
    "terms": "Payment due within 30 days from automated invoice date."
  }
  ```
- **Validation Rules**:
  - `profileName`: Required (string, min 3 chars).
  - `customer`: Required (valid Mongo ObjectId from `customers` or `clientaccounts`).
  - `repeatEvery`: Required (`1 week`, `2 weeks`, `1 month`, `2 months`, `3 months`, `6 months`, `1 year`).
  - `items`: Required (Array, minimum 1 item). Each item must contain valid `item` ObjectId, `quantity > 0`, and `rate >= 0`.
  - `total`: Calculated as `subTotal - discount + taxTotal + adjustment`.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad744a1e948c3b77a0192df",
      "profileName": "Enterprise Cloud Hosting - Finwizz Tier 3",
      "customer": {
        "_id": "6aa00ceb36473ebc95f399dd",
        "displayName": "FINWIZZ IT SOLUTIONS",
        "companyName": "Finwizz IT Solutions Pvt Ltd",
        "email": "billing@finwizz.com"
      },
      "status": "Active",
      "total": 159300.00,
      "createdAt": "2026-10-28T16:45:00.000Z"
    }
  }
  ```

---

### 📋 B. SPLIT VIEW (LIST & FILTER API)
- **Endpoint**: `GET /api/v1/billing/sales/subscriptions`
- **Query Parameters**:
  | Param | Type | Required | Description |
  |---|---|---|---|
  | `status` | string | No | `Active`, `Stopped`, `Draft` |
  | `customerId` | string | No | Target customer ID |
  | `search` | string | No | Search query for profile name |
  | `page` | number | No | Default: `1` |
  | `limit` | number | No | Default: `50`, Max: `100` |
  | `sort` | string | No | Default: `-createdAt` |
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6ad744a1e948c3b77a0192df",
        "profileName": "Enterprise Cloud Hosting - Finwizz Tier 3",
        "customerName": "FINWIZZ IT SOLUTIONS",
        "status": "Active",
        "repeatEvery": "1 month",
        "frequency": "Monthly",
        "total": 159300.00,
        "startsOn": "2026-11-01T00:00:00.000Z",
        "endsOn": "2027-10-31T23:59:59.000Z"
      }
    ]
  }
  ```

---

### 🔍 C. DETAIL VIEW (SINGLE FETCH & TABS)
- **Endpoint**: `GET /api/v1/billing/sales/subscriptions/:id`
- **Tab 1: Overview**
  - Data: Line items, discounts, customer contact, next cycle billing date.
- **Tab 2: Document (A4 Subscription Voucher)**
  - Data: Printable terms and contract schedule.
- **Tab 3: History (Child Invoices)**
  - **API**: `GET /api/v1/billing/sales/invoices?subscriptionId=:id`
  - Fetches all monthly invoices spawned by this profile.
- **Tab 4: Audit Trail**
  - **API**: Returns timestamped actor changes (Created by, Status switched).

---

### ✏️ D. EDIT / UPDATE API
- **Endpoint**: `PUT /api/v1/billing/sales/subscriptions/:id`
- **Headers**: Same as Create.
- **Request Payload (JSON)**:
  ```json
  {
    "profileName": "Enterprise Cloud Hosting - Finwizz Tier 3 (Upgraded)",
    "status": "Active",
    "repeatEvery": "1 month",
    "items": [
      {
        "item": "6ad525322d5bde67f33dee7f",
        "quantity": 2,
        "rate": 125000.00,
        "amount": 250000.00
      }
    ],
    "subTotal": 250000.00,
    "total": 295000.00
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad744a1e948c3b77a0192df",
      "profileName": "Enterprise Cloud Hosting - Finwizz Tier 3 (Upgraded)",
      "total": 295000.00,
      "updatedAt": "2026-10-28T16:50:00.000Z"
    }
  }
  ```

---

### 🗑️ E. DELETE API
- **Endpoint**: `DELETE /api/v1/billing/sales/subscriptions/:id`
- **Behavior**: Permanently deletes the profile. Existing previously generated child invoices remain intact for audit/accounting integrity.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Recurring Invoice deleted successfully"
  }
  ```

---

### 🔘 F. SINGLE ACTION BUTTONS & APIS
1. **Toggle Status (Pause / Resume)**:
   - **Action**: User clicks "Stop Profile" or "Resume Profile".
   - **Endpoint**: `PUT /api/v1/billing/sales/subscriptions/:id`
   - **Payload**: `{"status": "Stopped"}` or `{"status": "Active"}`.
2. **Print Contract / Save PDF**:
   - **Action**: User clicks "Print" or "Download PDF".
   - **Execution**: Invokes DOM Print Engine targeting `#printable-subscription-sheet`.

---

## 1.2 Recurring Invoices (`/billing/sales/invoices`)
> **Core Purpose**: Commercial tax invoices issued to customers. Integrates accounts receivable, approval workflows, risk analysis, payments, and credit notes.

### ➕ A. CREATE / SAVE DRAFT / APPROVE API
- **Endpoint**: `POST /api/v1/billing/sales/invoices` *(or `/api/v1/billing/invoices`)*
- **Complete Request Payload (JSON)**:
  ```json
  {
    "invoiceNumber": "INV-2026-00412",
    "customer": "6aa00ceb36473ebc95f399dd",
    "invoiceDate": "2026-10-28T00:00:00.000Z",
    "dueDate": "2026-11-27T00:00:00.000Z",
    "paymentTerms": "Net 30",
    "status": "Draft",
    "approvalStatus": "Pending",
    "referenceNumber": "PO-CLIENT-9912",
    "orderNumber": "SO-2026-081",
    "salesOrderId": "6ad525332d5bde67f33dee81",
    "items": [
      {
        "item": "6ad525322d5bde67f33dee7f",
        "description": "Dell Precision 7780 High Performance Workstation",
        "quantity": 2,
        "rate": 285000.00,
        "amount": 570000.00
      }
    ],
    "subTotal": 570000.00,
    "discountType": "amount",
    "discountValue": 20000.00,
    "discount": 20000.00,
    "taxWithheldType": "TDS",
    "taxWithheldAmount": 11000.00,
    "taxTotal": 99000.00,
    "adjustment": 0,
    "total": 649000.00,
    "balanceDue": 649000.00,
    "salesperson": "Rahul Sharma",
    "notes": "Standard manufacturer warranty applies.",
    "terms": "Interest @ 18% p.a. will be charged on overdue payments."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad75122c199ef87b00188bb",
      "invoiceNumber": "INV-2026-00412",
      "status": "Draft",
      "approvalStatus": "Pending",
      "total": 649000.00,
      "balanceDue": 649000.00,
      "createdAt": "2026-10-28T16:52:00.000Z"
    }
  }
  ```

---

### 📋 B. SPLIT VIEW (LIST API)
- **Endpoint**: `GET /api/v1/billing/sales/invoices`
- **Query Parameters**:
  - `status`: `Draft`, `Pending Approval`, `Open`, `Sent`, `Paid`, `PartiallyPaid`, `Void`, `Overdue`
  - `customer`: Customer ObjectId
  - `startDate`, `endDate`: Date range filter
  - `page`, `limit`: Pagination parameters

---

### 🔍 C. DETAIL VIEW TABS BREAKDOWN
- **Endpoint**: `GET /api/v1/billing/sales/invoices/:id`
- **Tab 1: Overview & Analytics**: Total Due, Aging Status, Payments Recorded, Line Item breakdown.
- **Tab 2: Formal Invoice (A4 Document)**: Pixel-perfect GST tax invoice layout.
- **Tab 3: Payments & Credits**: Complete list of payments applied and credit notes allocated.
- **Tab 4: Audit Trail**: `<RecordActivityTimeline recordId={invoice._id} />`.

---

### ✏️ D. EDIT / UPDATE API
- **Endpoint**: `PUT /api/v1/billing/sales/invoices/:id`
- **Payload**: Full or partial fields to update line items, dates, notes, or terms.

---

### 🗑️ E. DELETE API
- **Endpoint**: `DELETE /api/v1/billing/sales/invoices/:id`
- **Rule**: Allowed only if invoice has no posted payments or reconciliation locks.

---

### 🔘 F. SINGLE ACTION BUTTONS & APIS
1. **Approve Invoice Button**:
   - **Endpoint**: `POST /api/v1/approvals/approve`
   - **Payload**: `{"module": "invoices", "documentId": ":id"}`
   - **Transition**: `approvalStatus: "Approved"`, `status: "Open"`.
2. **Reject Invoice Button**:
   - **Endpoint**: `POST /api/v1/approvals/reject`
   - **Payload**: `{"module": "invoices", "documentId": ":id", "rejectionReason": "Item rates mismatch with agreed contract."}`
3. **Consolidate Multiple Invoices Button**:
   - **Endpoint**: `POST /api/v1/billing/sales/invoices/consolidate`
   - **Payload**:
     ```json
     {
       "invoiceIds": ["6ad75122c199ef87b00188bb", "6ad75122c199ef87b00188bc"],
       "customerId": "6aa00ceb36473ebc95f399dd"
     }
     ```
4. **Risk Analysis Button**:
   - **Endpoint**: `GET /api/v1/billing/sales/invoices/:id/risk-analysis`
   - **Response**: `{ "success": true, "riskScore": 12, "defaultProbability": "Low", "flags": [] }`

---

## 1.3 Quotes & Proposals (`/billing/sales/quotes`)
> **Core Purpose**: Pre-sales commercial quotations with direct conversion into Sales Orders or Invoices.

### ➕ A. CREATE / SAVE QUOTE API
- **Endpoint**: `POST /api/v1/billing/sales/quotes` *(or `/api/v1/billing/quotes`)*
- **Request Payload (JSON)**:
  ```json
  {
    "quoteNumber": "QT-2026-00089",
    "customer": "6aa00ceb36473ebc95f399dd",
    "quoteDate": "2026-10-28T00:00:00.000Z",
    "expiryDate": "2026-11-28T00:00:00.000Z",
    "status": "Sent",
    "referenceNumber": "RFQ-NOV-881",
    "items": [
      {
        "item": "6ad525322d5bde67f33dee7f",
        "description": "High Performance Server Rack 42U",
        "quantity": 1,
        "rate": 85000.00,
        "amount": 85000.00
      }
    ],
    "subTotal": 85000.00,
    "discount": 5000.00,
    "taxTotal": 14400.00,
    "total": 94400.00,
    "salesperson": "Amit Verma",
    "notes": "Quotation valid for 30 calendar days.",
    "terms": "50% advance upon order confirmation."
  }
  ```
- **Response (201 Created)**: Returns saved Quote with `_id`.

---

### 🔘 B. SINGLE ACTION BUTTONS & APIS (QUOTES)
1. **Convert to Sales Order Button**:
   - **Endpoint**: `POST /api/v1/billing/sales/quotes/:id/convert-to-sales-order`
   - **Behavior**: Clones quote line items into an active Sales Order, marks quote status as `Invoiced` or `Accepted`.
2. **Convert to Invoice Button**:
   - **Endpoint**: `POST /api/v1/billing/sales/quotes/:id/convert-to-invoice`
   - **Behavior**: Creates an accounts receivable invoice directly from quote data.
3. **Approve / Reject Quote**:
   - **Endpoint**: `POST /api/v1/approvals/approve` and `POST /api/v1/approvals/reject`.
4. **Delete Quote**:
   - **Endpoint**: `DELETE /api/v1/billing/sales/quotes/:id`.

---

## 1.4 Credit Notes & Refunds (`/billing/sales/credit-notes`)
> **Core Purpose**: Sales returns and account credit memos. Allows automatic allocation against open unpaid customer invoices or issuing cash refunds.

### ➕ A. CREATE / SAVE CREDIT NOTE API
- **Endpoint**: `POST /api/v1/billing/sales/credit-notes`
- **Request Payload (JSON)**:
  ```json
  {
    "creditNoteNumber": "CN-2026-00018",
    "customer": "6aa00ceb36473ebc95f399dd",
    "invoiceId": "6ad75122c199ef87b00188bb",
    "creditNoteDate": "2026-10-28T00:00:00.000Z",
    "referenceNumber": "RETURN-RMA-091",
    "status": "Open",
    "items": [
      {
        "item": "6ad525322d5bde67f33dee7f",
        "description": "Defective RAM replacement allowance",
        "quantity": 1,
        "rate": 15000.00,
        "amount": 15000.00
      }
    ],
    "subTotal": 15000.00,
    "discount": 0,
    "adjustment": 0,
    "total": 15000.00,
    "notes": "Credit note issued for RMA return #091."
  }
  ```

---

### 🔘 B. SINGLE ACTION BUTTONS & APIS (CREDIT NOTES)
1. **Apply Credit to Invoices Button**:
   - **Endpoint**: `POST /api/v1/billing/payments/allocate-credit-note/:creditNoteId`
   - **Payload**:
     ```json
     {
       "invoiceId": "6ad75122c199ef87b00188bb",
       "amountToApply": 15000.00
     }
     ```
   - **Database Impact**: Reduces `balanceDue` of invoice and records allocation in `creditnote.appliedToInvoices`.
2. **Issue Cash/Bank Refund Button**:
   - **Endpoint**: `PUT /api/v1/billing/sales/credit-notes/:id`
   - **Payload**:
     ```json
     {
       "refunds": [
         {
           "date": "2026-10-28T00:00:00.000Z",
           "amount": 15000.00,
           "reference": "BANK-REFUND-UTR-991823"
         }
       ],
       "status": "Closed"
     }
     ```

---

# 2. MODULE 2: Payments & Collections (`/billing/payments`)

---

## 2.1 Payments Received (`/billing/payments/received`)
> **Core Purpose**: Record customer payments, apply amounts across one or multiple invoices, handle excess/unused funds, and reconcile bank accounts.

### ➕ A. CREATE / RECORD PAYMENT API
- **Endpoint**: `POST /api/v1/billing/payments` *(or `/api/v1/books/sales/payments-received`)*
- **Complete Request Payload (JSON)**:
  ```json
  {
    "paymentNumber": "PAY-2026-00319",
    "customer": "6aa00ceb36473ebc95f399dd",
    "paymentDate": "2026-10-28T00:00:00.000Z",
    "amount": 649000.00,
    "bankCharges": 0,
    "paymentMode": "Bank Transfer",
    "depositTo": "HDFC Current Account (A/c ...8812)",
    "referenceNumber": "NEFT-HDFC-991829102",
    "taxDeducted": true,
    "taxType": "TDS Section 194C",
    "taxAmount": 12980.00,
    "invoices": [
      {
        "invoice": "6ad75122c199ef87b00188bb",
        "amountApplied": 649000.00
      }
    ],
    "amountUsed": 649000.00,
    "amountRefunded": 0,
    "amountInExcess": 0,
    "status": "Closed",
    "sendThankYouNote": true,
    "notes": "Full settlement received via NEFT."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad76229b0021a88bb1930ca",
      "paymentNumber": "PAY-2026-00319",
      "amount": 649000.00,
      "status": "Closed",
      "createdAt": "2026-10-28T16:55:00.000Z"
    }
  }
  ```

---

### 📋 B. SPLIT VIEW & DETAIL TABS
- **List API**: `GET /api/v1/billing/payments`
  - Filters: `customerId`, `paymentMode`, `dateRange`.
- **Detail View**: `GET /api/v1/billing/payments/:id`
  - **Tab 1: Overview & Allocations**: Displays customer, allocated invoice list, and excess balance.
  - **Tab 2: Formal Payment Receipt (A4)**: Printable official receipt voucher.
  - **Tab 3: Bank Remittance & Deposit**: UTR number, bank account ledger, clearing status.
  - **Tab 4: Audit Trail & GL Entries**: Double-entry bookkeeping ledger logs.

---

### 🔘 C. SINGLE ACTION BUTTONS & APIS
1. **Gateway Payment Checkout**:
   - **Endpoint**: `POST /api/v1/billing/payments/gateway-payment`
   - **Payload**: `{"amount": 50000, "customerId": "...", "gateway": "razorpay"}`
2. **Delete Payment**:
   - **Endpoint**: `DELETE /api/v1/billing/payments/:id`
   - **Behavior**: Reverts the applied amount back to the unpaid invoice balance.

---

## 2.2 Payment Gateway Setup (`/billing/apps/zoho-payments`)
- **GET Status**: `GET /api/v1/billing/apps/zoho-payments` ➔ `{ "success": true, "data": { "status": "Configured" } }`
- **POST Configuration**:
  ```json
  {
    "gateway": "Razorpay",
    "keyId": "rzp_live_abc123",
    "keySecret": "secret_xyz456",
    "webhookSecret": "whsec_789",
    "autoCapture": true
  }
  ```

---

# 3. MODULE 3: Time & Client Billing (`/billing/time-tracking`)

---

## 3.1 Client Projects (`/billing/time-tracking/projects`)
> **Core Purpose**: Project billing structures (Fixed cost, Hourly project rate, Task hourly rate, Staff hourly rate), task allocations, cost budgets, and profitability analysis.

### ➕ A. CREATE / SAVE PROJECT API
- **Endpoint**: `POST /api/v1/billing/time-tracking/projects` *(or `/api/v1/books/projects`)*
- **Complete Request Payload (JSON)**:
  ```json
  {
    "projectName": "Apex Fleet Custom ERP Integration",
    "projectCode": "PRJ-APEX-001",
    "customer": "6aa00ceb36473ebc95f399dd",
    "billingMethod": "project_hours",
    "ratePerHour": 150.00,
    "costBudget": 180000.00,
    "revenueBudget": 450000.00,
    "description": "Custom API connectors and automated reporting system for logistics fleet.",
    "tasks": [
      {
        "name": "Backend REST Architecture & DB Schema",
        "description": "MongoDB schema and transactional controllers",
        "ratePerHour": 150.00,
        "billable": true
      },
      {
        "name": "Frontend Dashboard & Split View",
        "description": "Vite React UI implementation",
        "ratePerHour": 120.00,
        "billable": true
      }
    ],
    "users": [
      {
        "userId": "6aa797278d301b4735f1d322",
        "ratePerHour": 150.00
      }
    ],
    "watchlist": false,
    "status": "Active"
  }
  ```
- **Validation Rules**:
  - `projectName`: Required (string).
  - `customer`: Required (Customer identifier).
  - `billingMethod`: Enum (`fixed`, `project_hours`, `task_hours`, `staff_hours`).
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad77102e88a1099bb0011dd",
      "projectName": "Apex Fleet Custom ERP Integration",
      "projectCode": "PRJ-APEX-001",
      "status": "Active",
      "createdAt": "2026-10-28T16:58:00.000Z"
    }
  }
  ```

---

### 📋 B. SPLIT VIEW & DETAIL VIEW TABS
- **List API**: `GET /api/v1/billing/time-tracking/projects`
- **Detail View**: `GET /api/v1/billing/time-tracking/projects/:id`
- **Tabs**:
  - **Tab 1: Dashboard & KPIs**: Budget vs Actual burn, Task completion, Assigned team members.
  - **Tab 2: Project Charter (A4 Document)**: Formally formatted scope of work sheet.
  - **Tab 3: Timesheets & Tasks**: Logged hours for this project from the timesheet collection.
  - **Tab 4: Profitability Analysis**: Real-time KPI breakdown (Revenue Earned vs Labor Cost vs Gross Margin).
  - **Tab 5: Audit Trail**: Timestamped logs of modifications.

---

### 🔘 C. SINGLE ACTION BUTTONS & APIS (PROJECTS)
1. **Invoice Unbilled Timesheets Button**:
   - **Endpoint**: `POST /api/v1/billing/time-tracking/projects/:id/invoice-timesheets`
   - **Behavior**: Scans all `Unbilled` time entries under this project, aggregates line items by task or staff member, and generates a new draft Invoice (`/billing/sales/invoices`).
2. **Calculate Profitability Button**:
   - **Endpoint**: `GET /api/v1/billing/time-tracking/projects/:id/profitability`
   - **Response (200 OK)**:
     ```json
     {
       "success": true,
       "data": {
         "projectId": "6ad77102e88a1099bb0011dd",
         "totalLoggedHours": 120.5,
         "billableHours": 115.0,
         "totalLaborCost": 138000.00,
         "totalBilledRevenue": 345000.00,
         "grossProfit": 207000.00,
         "grossMarginPercent": 60.0
       }
     }
     ```
3. **Delete Project**:
   - **Endpoint**: `DELETE /api/v1/billing/time-tracking/projects/:id`

---

## 3.2 Billable Timesheets (`/billing/time-tracking/timesheet`)
> **Core Purpose**: Daily time logging for employees on billable client tasks. Directly flows into invoices.

### ➕ A. CREATE / LOG TIME ENTRY API
- **Endpoint**: `POST /api/v1/billing/time-tracking/timesheet` *(or `/api/v1/books/time-entries`)*
- **Complete Request Payload (JSON)**:
  ```json
  {
    "project": "6ad77102e88a1099bb0011dd",
    "task": "Backend REST Architecture & DB Schema",
    "employee": "6aa797278d301b4735f1d322",
    "date": "2026-10-28T00:00:00.000Z",
    "hours": 7.5,
    "timeSpent": "07:30",
    "isBillable": true,
    "billingRate": 150.00,
    "costRate": 60.00,
    "status": "Unbilled",
    "notes": "Implemented Mongoose atomic transactions and test verification suite."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ad78001e9912088aa9922ff",
      "project": "6ad77102e88a1099bb0011dd",
      "hours": 7.5,
      "status": "Unbilled",
      "createdAt": "2026-10-28T17:00:00.000Z"
    }
  }
  ```

---

### 📋 B. SPLIT VIEW & DETAIL TABS (TIMESHEET)
- **List API**: `GET /api/v1/billing/time-tracking/timesheet`
  - Filters: `projectId`, `user`, `status` (`Unbilled`, `Invoiced`), `startDate`, `endDate`.
- **Detail View**: `GET /api/v1/billing/time-tracking/timesheet/:id`
  - **Tab 1: Overview**: Logged hours, employee, task name, and work notes.
  - **Tab 2: Timesheet Slip (A4)**: Formatted work slip for client approval.
  - **Tab 3: Billing & Invoicing**: Billable rate calculation, invoice association status.
  - **Tab 4: Audit Trail**: Creation and approval audit logs.

---

### 🔘 C. SINGLE ACTION BUTTONS & APIS (TIMESHEET)
1. **Generate Invoice from Timesheet**:
   - **Endpoint**: `POST /api/v1/billing/time-tracking/projects/:projectId/invoice-timesheets`
   - **Payload**:
     ```json
     {
       "timeEntryIds": ["6ad78001e9912088aa9922ff"]
     }
     ```
   - **Result**: Creates a customer invoice and marks the time entry status as `Invoiced` with linked `invoiceId`.
2. **Update / Edit Time Log**:
   - **Endpoint**: `PUT /api/v1/billing/time-tracking/timesheet/:id`
3. **Delete Time Entry**:
   - **Endpoint**: `DELETE /api/v1/billing/time-tracking/timesheet/:id`

---

## 🎯 Master Operations & Action Button Matrix

| Submodule | Create / Save Method | Edit / Update Method | Delete Method | Primary Action Button Endpoint | Secondary Action Button Endpoint |
|---|---|---|---|---|---|
| **Subscriptions** | `POST /subscriptions` | `PUT /subscriptions/:id` | `DELETE /subscriptions/:id` | `PUT /:id` *(Toggle Active/Stopped)* | `window.print()` *(A4 Voucher)* |
| **Recurring Invoices** | `POST /invoices` | `PUT /invoices/:id` | `DELETE /invoices/:id` | `POST /api/v1/approvals/approve` | `POST /invoices/consolidate` |
| **Quotes & Proposals** | `POST /quotes` | `PUT /quotes/:id` | `DELETE /quotes/:id` | `POST /:id/convert-to-sales-order` | `POST /:id/convert-to-invoice` |
| **Credit Notes** | `POST /credit-notes` | `PUT /credit-notes/:id` | `DELETE /credit-notes/:id` | `POST /payments/allocate-credit-note/:id` | `POST /api/v1/approvals/approve` |
| **Payments Received** | `POST /payments` | `PUT /payments/:id` | `DELETE /payments/:id` | `POST /payments/gateway-payment` | `POST /allocate-credit-note/:id` |
| **Gateway Setup** | `POST /apps/zoho-payments` | `POST /apps/zoho-payments` | N/A | `POST /apps/zoho-payments` *(Save Keys)* | `GET /apps/zoho-payments` *(Test Ping)* |
| **Client Projects** | `POST /projects` | `PUT /projects/:id` | `DELETE /projects/:id` | `POST /:id/invoice-timesheets` | `GET /:id/profitability` |
| **Timesheets** | `POST /timesheet` | `PUT /timesheet/:id` | `DELETE /timesheet/:id` | `POST /projects/:id/invoice-timesheets` | `window.print()` *(Time Slip)* |

---
*End of Deep-Dive Ground-to-Cloud Specification.*
