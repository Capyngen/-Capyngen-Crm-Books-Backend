# 📑 Deep-Dive Enterprise Operational Expenses & Lifecycle Webhooks API Specification

Is document me Billing & Operations system ke do critical modules:
1. **Operational Expenses** (`/billing/expenses`)
   - 1.1 **Direct Expenses** (`/billing/expenses/list` & `/billing/expenses`)
   - 1.2 **Recurring Subscriptions / Recurring Expenses** (`/billing/expenses/recurring`)
2. **Lifecycle & Webhooks** (`/billing/events`)
   - 2.1 **Webhook Subscription Engine (Outbound Webhooks)**
   - 2.2 **Lifecycle Events Stream & Delivery Log Inspector**
   - 2.3 **Cross-Domain Inbound Lifecycle Webhooks (Ecosystem Integrations)**

ke har ek feature ka **Create**, **Edit (Update)**, **Delete**, **Save/Draft**, **Split View**, **Detail View Tabs**, aur **Single Button Clicks** ka complete, deep-dive technical blueprint diya gaya hai.

---

## 📌 Master Table of Contents
1. [Module 1: Operational Expenses](#1-module-1-operational-expenses)
   - 1.1 [Direct Expenses (`/billing/expenses/list`)](#11-direct-expenses-billingexpenseslist)
     - [A. Create Single Expense API](#a-create-single-expense-api)
     - [B. Bulk Add Expenses Tab API](#b-bulk-add-expenses-tab-api)
     - [C. Edit / Update Expense API](#c-edit--update-expense-api)
     - [D. Delete Expense API](#d-delete-expense-api)
     - [E. Split View & Master List API](#e-split-view--master-list-api)
     - [F. Detail View Tabs Specification](#f-detail-view-tabs-specification)
     - [G. Single Button Actions & Workflows](#g-single-button-actions--workflows)
   - 1.2 [Recurring Subscriptions / Recurring Expenses (`/billing/expenses/recurring`)](#12-recurring-subscriptions--recurring-expenses-billingexpensesrecurring)
     - [A. Create Recurring Profile API](#a-create-recurring-profile-api)
     - [B. Edit / Update Recurring Profile API](#b-edit--update-recurring-profile-api)
     - [C. Delete Recurring Profile API](#c-delete-recurring-profile-api)
     - [D. Split View & Master List API](#d-split-view--master-list-api)
     - [E. Detail View Tabs Specification](#e-detail-view-tabs-specification)
     - [F. Single Button Actions & Workflows](#f-single-button-actions--workflows)
2. [Module 2: Lifecycle & Webhooks](#2-module-2-lifecycle--webhooks)
   - 2.1 [Webhook Subscription Engine (Outbound Webhooks)](#21-webhook-subscription-engine-outbound-webhooks)
     - [A. Create Webhook Subscription API](#a-create-webhook-subscription-api)
     - [B. Edit / Update Webhook Subscription API](#b-edit--update-webhook-subscription-api)
     - [C. Delete Webhook Subscription API](#c-delete-webhook-subscription-api)
     - [D. Split View & Directory API](#d-split-view--directory-api)
     - [E. Detail View Tabs Specification](#e-detail-view-tabs-specification-1)
     - [F. Single Button Actions & Workflows](#f-single-button-actions--workflows-1)
   - 2.2 [Lifecycle Events Stream & Delivery Log Inspector](#22-lifecycle-events-stream--delivery-log-inspector)
     - [A. Event Stream Query & Filter API](#a-event-stream-query--filter-api)
     - [B. Delivery Log Inspection API](#b-delivery-log-inspection-api)
     - [C. Single Button Actions (Resend / Retry)](#c-single-button-actions-resend--retry)
   - 2.3 [Cross-Domain Inbound Lifecycle Webhooks (Ecosystem Integrations)](#23-cross-domain-inbound-lifecycle-webhooks)
     - [A. HRMS Payroll Finalized Inbound Webhook](#a-hrms-payroll-finalized-inbound-webhook)
     - [B. CRM Deal Won Inbound Webhook](#b-crm-deal-won-inbound-webhook)
     - [C. CRM Contact Sync Inbound Webhook](#c-crm-contact-sync-inbound-webhook)
     - [D. HRMS Employee Sync Inbound Webhook](#d-hrms-employee-sync-inbound-webhook)
     - [E. Payment Gateway Webhook (Razorpay/Stripe Settlement & Disputes)](#e-payment-gateway-webhook-razorpaystripe-settlement--disputes)

---

# 1. MODULE 1: Operational Expenses

---

## 1.1 Direct Expenses (`/billing/expenses/list`)
> **Core Purpose**: Records immediate operational disbursements (cloud servers, office supplies, travel mileage, client-billable out-of-pocket costs) with multi-currency, tax withholding, and automated journal postings.

```
+-----------------------------------------------------------------------------------------+
|                               DIRECT EXPENSES WORKFLOW                                  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   [Create Single / Bulk] ---> [Approval Workflow (Tiered)] ---> [Posting Engine]       |
|              |                                                        |                 |
|              v                                                        v                 |
|      Status: 'Draft'                                          Status: 'Approved'        |
|                                                                       |                 |
|                                                                       v                 |
|                                                            +---------------------+      |
|                                                            | Dr Expense Account  |      |
|                                                            | Dr Input GST (ITC)  |      |
|                                                            | Cr Bank / Payables  |      |
|                                                            +---------------------+      |
|                                                                       |                 |
|                                                  +--------------------+---------------+ |
|                                                  |                                    | |
|                                                  v                                    v |
|                                          [If Billable: True]                 [Employee Claim]   |
|                                                  |                                    | |
|                                                  v                                    v |
|                                          [Convert to Invoice]                [Mark Reimbursed]  |
+-----------------------------------------------------------------------------------------+
```

### ⚡ A. CREATE SINGLE EXPENSE API
- **Endpoint**: `POST /api/v1/billing/expenses` *(or `/api/v1/books/purchases/expenses`)*
- **Headers**:
  ```http
  Authorization: Bearer <capyngen_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Complete Request Payload (JSON)**:
  ```json
  {
    "expenseType": "Goods",
    "date": "2026-10-29T00:00:00.000Z",
    "expenseAccount": "Operating Expenses - Cloud Infrastructure",
    "paidThrough": "HDFC Bank Corporate Current A/C",
    "amount": 45000.00,
    "taxAmount": 8100.00,
    "totalAmount": 53100.00,
    "vendorId": "6aa00ceb36473ebc95f399ab",
    "vendorName": "Amazon Web Services India Pvt Ltd",
    "customerId": "6aa00ceb36473ebc95f399dd",
    "billable": true,
    "reference": "AWS-INV-9920194",
    "notes": "Dedicated production kubernetes cluster charges for client Finwizz.",
    "status": "Unbilled",
    "isItemized": true,
    "lineItems": [
      {
        "expenseAccount": "Cloud Servers (EC2 / EKS)",
        "notes": "EKS Worker Node Fleet (c6i.4xlarge)",
        "amount": 35000.00
      },
      {
        "expenseAccount": "Cloud Storage (S3 / EBS)",
        "notes": "NVMe EBS Volume IOPS Provisioned",
        "amount": 10000.00
      }
    ],
    "currency": "INR",
    "receiptUrl": "https://claveecom.s3.ap-south-1.amazonaws.com/receipts/aws_oct_2026.pdf"
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Expense created and posted successfully",
    "data": {
      "_id": "6ae2f810e74b21001239aa01",
      "expenseNumber": "EXP-9AA01",
      "orgId": "6aa797278d301b4735f1d322",
      "expenseType": "Goods",
      "date": "2026-10-29T00:00:00.000Z",
      "expenseAccount": "Operating Expenses - Cloud Infrastructure",
      "paidThrough": "HDFC Bank Corporate Current A/C",
      "amount": 45000.00,
      "taxAmount": 8100.00,
      "totalAmount": 53100.00,
      "vendorId": "6aa00ceb36473ebc95f399ab",
      "customerId": "6aa00ceb36473ebc95f399dd",
      "billable": true,
      "reference": "AWS-INV-9920194",
      "status": "Unbilled",
      "approvalStatus": "Approved",
      "journalId": "6ae2f810e74b21001239bb88",
      "journalNumber": "JRN-1793265001-204",
      "createdAt": "2026-10-29T14:45:00.000Z"
    }
  }
  ```
- **Business Logic & Double-Entry Ledger Invariant**:
  $$\text{Debit: Operating Expense Account } ₹45,000.00$$
  $$\text{Debit: Input GST Pending Verification (ITC) } ₹8,100.00$$
  $$\text{Credit: HDFC Bank Corporate Current A/C } ₹53,100.00$$
  $$\sum \text{Debits} == \sum \text{Credits} \quad (\Delta = 0.00)$$

---

### ⚡ B. BULK ADD EXPENSES TAB API
> Used on the frontend tab `BulkAddExpensesTab.tsx` when entering multiple line receipts in a spreadsheet grid.

- **Endpoint**: `POST /api/v1/billing/expenses/bulk` *(or `/api/v1/books/purchases/expenses/bulk`)*
- **Headers**:
  ```http
  Authorization: Bearer <capyngen_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Request Payload (JSON Array)**:
  ```json
  {
    "expenses": [
      {
        "date": "2026-10-28T00:00:00.000Z",
        "expenseAccount": "Printing & Stationery",
        "paidThrough": "Petty Cash Account",
        "amount": 1250.00,
        "vendorName": "Office Mart Express",
        "billable": false,
        "notes": "A4 Bond paper reams & laser toner"
      },
      {
        "date": "2026-10-28T00:00:00.000Z",
        "expenseAccount": "Meals & Entertainment",
        "paidThrough": "Corporate Credit Card",
        "amount": 4200.00,
        "vendorName": "Barbeque Nation",
        "customerId": "6aa00ceb36473ebc95f399dd",
        "billable": true,
        "notes": "Client review lunch meeting"
      },
      {
        "date": "2026-10-29T00:00:00.000Z",
        "expenseAccount": "Software Subscriptions",
        "paidThrough": "HDFC Bank Corporate Current A/C",
        "amount": 18500.00,
        "vendorName": "Figma Inc",
        "billable": false,
        "notes": "Annual UI/UX design licenses (5 seats)"
      }
    ]
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "3 expenses posted in batch successfully",
    "count": 3,
    "data": [
      { "_id": "6ae2f811e74b21001239aa02", "expenseNumber": "EXP-9AA02", "amount": 1250.00, "status": "Non-Billable" },
      { "_id": "6ae2f811e74b21001239aa03", "expenseNumber": "EXP-9AA03", "amount": 4200.00, "status": "Unbilled" },
      { "_id": "6ae2f811e74b21001239aa04", "expenseNumber": "EXP-9AA04", "amount": 18500.00, "status": "Non-Billable" }
    ]
  }
  ```

---

### ⚡ C. EDIT / UPDATE EXPENSE API
- **Endpoint**: `PUT /api/v1/billing/expenses/:id`
- **Request Payload**:
  ```json
  {
    "amount": 48000.00,
    "taxAmount": 8640.00,
    "totalAmount": 56640.00,
    "notes": "Updated AWS bill reflecting secondary replica load balancer."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Expense updated and journal adjusted",
    "data": {
      "_id": "6ae2f810e74b21001239aa01",
      "amount": 48000.00,
      "totalAmount": 56640.00,
      "updatedAt": "2026-10-29T14:48:00.000Z"
    }
  }
  ```
- **Lock & Guard Rules**:
  * Agar status `Invoiced` (Customer Invoice ban chuki hai) ya `Reimbursed` hai, toh `amount` edit karna strictly blocked hota hai (HTTP 422: `[LOCK EXP-3.2] Cannot modify invoiced or reimbursed expense. Reverse the customer invoice first.`).

---

### ⚡ D. DELETE EXPENSE API
- **Endpoint**: `DELETE /api/v1/billing/expenses/:id`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Expense deleted and contra journal entry posted"
  }
  ```
- **Guard Rules**:
  * Period Lock check: Closed accounting periods ka expense delete nahi ho sakta.
  * Contra Entry: Associated journal entries ko `Void` mark kiya jata hai ya exact negative contra voucher banaya jata hai.

---

### ⚡ E. SPLIT VIEW & MASTER LIST API
- **Endpoint**: `GET /api/v1/billing/expenses`
- **Query Parameters**:
  * `page=1&limit=25`
  * `status=All | Unbilled | Invoiced | Reimbursed | Non-Billable`
  * `search=AWS`
  * `startDate=2026-10-01&endDate=2026-10-31`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 25,
      "totalPages": 2,
      "totalExpenseAmount": 1425800.00,
      "totalUnbilledBillable": 182400.00
    },
    "data": [
      {
        "_id": "6ae2f810e74b21001239aa01",
        "expenseNumber": "EXP-9AA01",
        "date": "2026-10-29T00:00:00.000Z",
        "expenseAccount": "Operating Expenses - Cloud Infrastructure",
        "paidThrough": "HDFC Bank Corporate Current A/C",
        "amount": 45000.00,
        "taxAmount": 8100.00,
        "totalAmount": 53100.00,
        "vendorName": "Amazon Web Services India Pvt Ltd",
        "customerName": "Finwizz Capital Limited",
        "billable": true,
        "status": "Unbilled",
        "approvalStatus": "Approved",
        "receiptUrl": "https://claveecom.s3.ap-south-1.amazonaws.com/receipts/aws_oct_2026.pdf"
      }
    ]
  }
  ```

---

### ⚡ F. DETAIL VIEW TABS SPECIFICATION
Jab user Split View ke left pane se kisi expense record par click karta hai, toh right pane me detail view khulta hai:

1. **Tab 1: Overview (`OverviewTab.tsx`)**:
   - Dikhata hai: Expense Number, Date, Paid Through Account, Category Account, Vendor Details, Reference No., Tax Details, Billable Flag, aur Line Items Breakdown.
2. **Tab 2: Attachments & Receipts (`AttachmentsTab.tsx`)**:
   - `GET /api/v1/billing/expenses/:id/attachments`
   - Dikhata hai: Attached PDF vouchers, JPG/PNG scanner uploads, S3 direct download link, file size, upload timestamp.
3. **Tab 3: Journal & Ledger Impact (`JournalImpactTab.tsx`)**:
   - `GET /api/v1/billing/expenses/:id/journals`
   - Dikhata hai: Linked double-entry journal vouchers (`JRN-...`), exact debit/credit lines, accounts impacted.
4. **Tab 4: Audit Trail & Timeline (`HistoryTab.tsx`)**:
   - `GET /api/v1/billing/expenses/:id/audit-trail`
   - Dikhata hai: Created By, Approved By, Edited timestamps, status change timeline (`Draft` $\rightarrow$ `Pending` $\rightarrow$ `Approved` $\rightarrow$ `Unbilled` $\rightarrow$ `Invoiced`).

---

### ⚡ G. SINGLE BUTTON ACTIONS & WORKFLOWS

#### [Action 1] Convert to Customer Billable Invoice (`POST .../convert-to-invoice`)
- **Trigger**: "Convert to Invoice" button click on unbilled billable expenses.
- **Endpoint**: `POST /api/v1/billing/expenses/:id/convert-to-invoice`
- **Request Body**:
  ```json
  {
    "customerId": "6aa00ceb36473ebc95f399dd",
    "markupPercent": 15
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Draft Customer Invoice created with 15% markup",
    "invoiceId": "6ae2f990e74b21001239cc11",
    "invoiceNumber": "INV-2026-0814",
    "billedAmount": 51750.00
  }
  ```
- **State Mutation**: Expense status badal kar `Invoiced` ho jata hai, aur `invoiceId` link store ho jati hai.

#### [Action 2] Reimburse Employee / Mark Reimbursed (`POST .../reimburse`)
- **Trigger**: "Mark Reimbursed" button click on out-of-pocket employee expense claims.
- **Endpoint**: `POST /api/v1/billing/expenses/:id/reimburse`
- **Request Body**:
  ```json
  {
    "paymentMethod": "NEFT",
    "paidThroughAccount": "HDFC Bank Corporate Current A/C",
    "utrReference": "HDFCN26301984210"
  }
  ```
- **GL Posting**:
  $$\text{Debit: Employee Reimbursement Payable } ₹12,400.00$$
  $$\text{Credit: HDFC Bank Corporate Current A/C } ₹12,400.00$$

#### [Action 3] Void / Cancel Expense (`POST .../void`)
- **Trigger**: "Void Expense" button click.
- **Endpoint**: `POST /api/v1/billing/expenses/:id/void`
- **Request Body**: `{ "reason": "Duplicate claim submitted by department" }`
- **State Mutation**: Status `Void`, journal lines contra-posted.

---

## 1.2 Recurring Subscriptions / Recurring Expenses (`/billing/expenses/recurring`)
> **Core Purpose**: Automatically provisions recurring vendor commitments (SaaS subscriptions, cloud retainers, lease rents, internet lines) at scheduled intervals without manual data entry.

```
+-----------------------------------------------------------------------------------------+
|                        RECURRING SUBSCRIPTIONS ENGINE (CRON / WORKER)                   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +------------------------------------+                                                |
|   | Recurring Profile Definition       |                                                |
|   | - Profile Name: "AWS Core Hosting" |                                                |
|   | - Repeat Every: "1 Month"          |                                                |
|   | - Next Run Date: 2026-11-01        |                                                |
|   | - Status: 'Active'                 |                                                |
|   +------------------------------------+                                                |
|                     |                                                                   |
|                     | [Nightly Evaluator / Generate Now Button]                         |
|                     v                                                                   |
|   +------------------------------------+         +------------------------------------+ |
|   | Auto-Generate Child Direct Expense | ------> | Post GL Double-Entry Journal       | |
|   | - Amount: ₹1,25,000                |         | - Dr Server Hosting Expense        | |
|   | - Linked to Profile                |         | - Cr Accounts Payable / Bank       | |
|   +------------------------------------+         +------------------------------------+ |
|                     |                                                                   |
|                     v                                                                   |
|   +------------------------------------+                                                |
|   | Update Profile Next Run Date:      |                                                |
|   | 2026-11-01 + 1 Month = 2026-12-01  |                                                |
|   +------------------------------------+                                                |
+-----------------------------------------------------------------------------------------+
```

### ⚡ A. CREATE RECURRING PROFILE API
- **Endpoint**: `POST /api/v1/billing/expenses/recurring` *(or `/api/v1/books/purchases/recurring-expenses`)*
- **Headers**:
  ```http
  Authorization: Bearer <capyngen_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Complete Request Payload (JSON)**:
  ```json
  {
    "profileName": "GitHub Enterprise Server & Copilot Seats",
    "repeatEvery": "1 Month",
    "startsOn": "2026-11-01T00:00:00.000Z",
    "endsOn": "2027-10-31T23:59:59.000Z",
    "expenseAccount": "Software & Developer Tooling Subscriptions",
    "amount": 82000.00,
    "paidThrough": "Corporate Credit Card",
    "vendorId": "6aa00ceb36473ebc95f399ef",
    "customerId": "6aa00ceb36473ebc95f399dd",
    "billable": false,
    "status": "Active",
    "currency": "INR",
    "notes": "Covers 150 GitHub Enterprise seats + Copilot Business licenses."
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Recurring subscription profile created successfully",
    "data": {
      "_id": "6ae2f830e74b21001239dd01",
      "profileName": "GitHub Enterprise Server & Copilot Seats",
      "repeatEvery": "1 Month",
      "startsOn": "2026-11-01T00:00:00.000Z",
      "nextExpenseDate": "2026-11-01T00:00:00.000Z",
      "amount": 82000.00,
      "status": "Active",
      "createdAt": "2026-10-29T14:50:00.000Z"
    }
  }
  ```

---

### ⚡ B. EDIT / UPDATE RECURRING PROFILE API
- **Endpoint**: `PUT /api/v1/billing/expenses/recurring/:id`
- **Request Payload**:
  ```json
  {
    "amount": 95000.00,
    "repeatEvery": "1 Month",
    "notes": "Added 25 additional Copilot licenses for backend AI team."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Recurring subscription profile updated successfully",
    "data": {
      "_id": "6ae2f830e74b21001239dd01",
      "amount": 95000.00,
      "updatedAt": "2026-10-29T14:52:00.000Z"
    }
  }
  ```

---

### ⚡ C. DELETE RECURRING PROFILE API
- **Endpoint**: `DELETE /api/v1/billing/expenses/recurring/:id`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Recurring subscription profile stopped and removed"
  }
  ```
- **Guard Rules**:
  * Profile delete hone par pehle se generate ho chuki past child expenses delete nahi hoti (historical audit intact rehta hai). Sirf future triggers permanent terminate ho jate hain.

---

### ⚡ D. SPLIT VIEW & MASTER LIST API
- **Endpoint**: `GET /api/v1/billing/expenses/recurring`
- **Query Parameters**:
  * `status=All | Active | Paused | Stopped`
  * `search=GitHub`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 18,
    "data": [
      {
        "_id": "6ae2f830e74b21001239dd01",
        "profileName": "GitHub Enterprise Server & Copilot Seats",
        "repeatEvery": "1 Month",
        "nextExpenseDate": "2026-11-01T00:00:00.000Z",
        "expenseAccount": "Software & Developer Tooling Subscriptions",
        "amount": 82000.00,
        "paidThrough": "Corporate Credit Card",
        "vendorName": "GitHub Inc",
        "status": "Active"
      }
    ]
  }
  ```

---

### ⚡ E. DETAIL VIEW TABS SPECIFICATION
1. **Tab 1: Profile Overview (`OverviewTab.tsx`)**:
   - Dikhata hai: Profile Cadence, Next Generation Date, Vendor Binding, Bank Account, Total Committed Run-Rate.
2. **Tab 2: Child Expenses History (`ChildExpensesTab.tsx`)**:
   - `GET /api/v1/billing/expenses?recurringProfileId=:id`
   - Dikhata hai: Is profile se pichle 12 mahino me jitni bhi individual expenses auto-generate hui hain unki complete list aur payment status.
3. **Tab 3: Audit Trail (`AuditTab.tsx`)**:
   - Dikhata hai: Pause/Resume logs, rate adjustments, user modifications.

---

### ⚡ F. SINGLE BUTTON ACTIONS & WORKFLOWS

#### [Action 1] Pause Profile (`POST .../pause`)
- **Trigger**: "Pause" button click.
- **Endpoint**: `POST /api/v1/billing/expenses/recurring/:id/pause`
- **Result**: Status `Paused`. Nightly cron scheduler ise auto-generate nahi karega jab tak resume na ho.

#### [Action 2] Resume Profile (`POST .../resume`)
- **Trigger**: "Resume" button click.
- **Endpoint**: `POST /api/v1/billing/expenses/recurring/:id/resume`
- **Result**: Status `Active`. Next run date calculate hoti hai.

#### [Action 3] Generate Next Expense Immediately (`POST .../generate-now`)
- **Trigger**: "Generate Now" button click (Emergency/Early billing).
- **Endpoint**: `POST /api/v1/billing/expenses/recurring/:id/generate-now`
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Expense generated immediately for current cycle",
    "generatedExpenseId": "6ae2f850e74b21001239ee09",
    "expenseNumber": "EXP-9EE09",
    "amount": 82000.00,
    "nextCycleDate": "2026-12-01T00:00:00.000Z"
  }
  ```

---

# 2. MODULE 2: Lifecycle & Webhooks (`/billing/events`)

---

## 2.1 Webhook Subscription Engine (Outbound Webhooks)
> **Core Purpose**: Notifies external client microservices, ERP partners, Slack alerts, and data warehouses in real-time whenever subscription states change or financial events occur.

```
+-----------------------------------------------------------------------------------------+
|                           OUTBOUND WEBHOOK DISPATCH PIPELINE                            |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   [Event Occurs] -------------------------------------------------------------+         |
|   (e.g., subscription.created, invoice.paid, dunning.escalated)               |         |
|                                                                               v         |
|                                                                    [Query Subscriptions]|
|                                                                    - URL: https://...   |
|                                                                    - Secret: whsec_...  |
|                                                                               |         |
|                                                                               v         |
|   +-----------------------------------------------------------------------------------+ |
|   | HTTP POST Request:                                                                | |
|   | Header: X-Billing-Signature: sha256=hmac(payload, secret)                        | |
|   | Header: X-Billing-Timestamp: 1793265000                                          | |
|   | Body: { event: "invoice.paid", timestamp: "...", data: { ... } }                  | |
|   +-----------------------------------------------------------------------------------+ |
|                                       |                                                 |
|                                       v                                                 |
|                   +-------------------+-------------------+                             |
|                   |                                       |                             |
|                   v                                       v                             |
|           [HTTP 200/201 Success]                  [HTTP 4xx/5xx / Timeout]              |
|                   |                                       |                             |
|                   v                                       v                             |
|           [Log: Delivered (200)]                  [Smart Exponential Retry]             |
|                                                   (Retry 1: +5m, Retry 2: +30m,         |
|                                                    Retry 3: +2h -> Dead Letter Queue)   |
+-----------------------------------------------------------------------------------------+
```

### ⚡ A. CREATE WEBHOOK SUBSCRIPTION API
- **Endpoint**: `POST /api/v1/billing/events/subscriptions` *(or `/api/v1/integrations/webhooks`)*
- **Headers**:
  ```http
  Authorization: Bearer <capyngen_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Complete Request Payload (JSON)**:
  ```json
  {
    "url": "https://api.finwizz.com/webhooks/billing-events",
    "description": "Production Finwizz Sync: Subscriptions & Invoicing",
    "events": [
      "subscription.created",
      "subscription.renewed",
      "subscription.paused",
      "subscription.cancelled",
      "invoice.generated",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "dunning.level_escalated",
      "customer.credit_exhausted",
      "expense.approved"
    ],
    "isActive": true
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Webhook endpoint registered successfully",
    "data": {
      "_id": "6ae2f910e74b21001239ff01",
      "orgId": "6aa797278d301b4735f1d322",
      "url": "https://api.finwizz.com/webhooks/billing-events",
      "events": [
        "subscription.created",
        "subscription.renewed",
        "subscription.paused",
        "subscription.cancelled",
        "invoice.generated",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "dunning.level_escalated",
        "customer.credit_exhausted",
        "expense.approved"
      ],
      "secret": "whsec_live_9a8f27b9c104e6d2a8b9e7c3f104d5a6",
      "isActive": true,
      "createdAt": "2026-10-29T14:55:00.000Z"
    }
  }
  ```

---

### ⚡ B. EDIT / UPDATE WEBHOOK SUBSCRIPTION API
- **Endpoint**: `PUT /api/v1/billing/events/subscriptions/:id`
- **Request Payload**:
  ```json
  {
    "url": "https://api.finwizz.com/v2/webhooks/billing",
    "events": [
      "subscription.created",
      "subscription.renewed",
      "subscription.cancelled",
      "invoice.payment_succeeded"
    ],
    "isActive": true
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Webhook subscription updated successfully",
    "data": {
      "_id": "6ae2f910e74b21001239ff01",
      "url": "https://api.finwizz.com/v2/webhooks/billing",
      "eventsCount": 4,
      "updatedAt": "2026-10-29T14:56:00.000Z"
    }
  }
  ```

---

### ⚡ C. DELETE WEBHOOK SUBSCRIPTION API
- **Endpoint**: `DELETE /api/v1/billing/events/subscriptions/:id`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Webhook subscription deleted successfully"
  }
  ```

---

### ⚡ D. SPLIT VIEW & DIRECTORY API
- **Endpoint**: `GET /api/v1/billing/events/subscriptions`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "_id": "6ae2f910e74b21001239ff01",
        "url": "https://api.finwizz.com/webhooks/billing-events",
        "events": ["subscription.created", "invoice.payment_succeeded"],
        "isActive": true,
        "lastDeliveryStatus": "200 OK",
        "lastDeliveredAt": "2026-10-29T14:40:12.000Z",
        "failureCount": 0
      }
    ]
  }
  ```

---

### ⚡ E. DETAIL VIEW TABS SPECIFICATION
1. **Tab 1: Endpoint Configuration (`ConfigurationTab.tsx`)**:
   - Dikhata hai: Webhook URL, Masked Secret (`whsec_live_****`), Active status toggle, Subscribed event checkboxes.
2. **Tab 2: Delivery Logs (`DeliveryLogsTab.tsx`)**:
   - `GET /api/v1/billing/events/subscriptions/:id/logs`
   - Dikhata hai: Har webhook delivery ka timestamp, status code (`200`, `500`, `Timeout`), latency (`42ms`), response body preview.
3. **Tab 3: Secret & Security (`SecurityTab.tsx`)**:
   - Dikhata hai: Signature verification guide, HMAC sample code in Node.js / Python, "Rotate Secret" button.

---

### ⚡ F. SINGLE BUTTON ACTIONS & WORKFLOWS

#### [Action 1] Test Ping Webhook (`POST .../test-ping`)
- **Trigger**: "Send Test Ping" button click.
- **Endpoint**: `POST /api/v1/billing/events/subscriptions/:id/test-ping`
- **Dispatched Request to Client URL**:
  ```http
  POST https://api.finwizz.com/webhooks/billing-events
  Content-Type: application/json
  X-Billing-Signature: t=1793265300,v1=9b3a6ef02c78a011de3b5c689912c9b4e
  X-Billing-Event: system.test_ping
  ```
  ```json
  {
    "id": "evt_test_992019401",
    "event": "system.test_ping",
    "timestamp": "2026-10-29T14:58:00.000Z",
    "data": {
      "message": "Ping event verified from Capyngen Enterprise Billing Engine."
    }
  }
  ```
- **Response to Admin UI (`200 OK`)**:
  ```json
  {
    "success": true,
    "httpStatus": 200,
    "latencyMs": 58,
    "responseBody": "{\"received\":true}"
  }
  ```

#### [Action 2] Rotate Secret Key (`POST .../rotate-secret`)
- **Trigger**: "Rotate Secret Key" button click.
- **Endpoint**: `POST /api/v1/billing/events/subscriptions/:id/rotate-secret`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "newSecret": "whsec_live_7c4f19b8a213e4d9b018c6e2a7b8e5c1",
    "message": "Old secret will expire in 24 hours to prevent webhook downtime."
  }
  ```

---

## 2.2 Lifecycle Events Stream & Delivery Log Inspector
> **Core Purpose**: Full audit trail of every single commercial and lifecycle event emitted across Books, Billing, and Inventory.

### ⚡ A. EVENT STREAM QUERY & FILTER API
- **Endpoint**: `GET /api/v1/billing/events`
- **Query Parameters**:
  * `page=1&limit=50`
  * `eventType=subscription.created | invoice.paid | dunning.escalated`
  * `status=Delivered | Failed | Retrying`
  * `startDate=2026-10-01&endDate=2026-10-29`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "meta": {
      "totalEvents": 12480,
      "page": 1,
      "limit": 50,
      "deliveredCount": 12465,
      "failedCount": 15
    },
    "data": [
      {
        "_id": "evt_live_10928410",
        "eventType": "subscription.renewed",
        "entityId": "6aa00ceb36473ebc95f399dd",
        "entityType": "Subscription",
        "customerId": "6aa00ceb36473ebc95f399ab",
        "customerName": "Finwizz Capital Limited",
        "timestamp": "2026-10-29T14:40:00.000Z",
        "payloadPreview": {
          "plan": "Enterprise Cloud Tier 3",
          "billingCycle": "Monthly",
          "amount": 159300.00,
          "invoiceId": "INV-2026-0819"
        },
        "deliveryStatus": "Delivered",
        "subscribersDelivered": 2,
        "subscribersFailed": 0
      }
    ]
  }
  ```

---

### ⚡ B. DELIVERY LOG INSPECTION API
- **Endpoint**: `GET /api/v1/billing/events/:id/deliveries`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "eventId": "evt_live_10928410",
    "eventType": "subscription.renewed",
    "deliveries": [
      {
        "endpointId": "6ae2f910e74b21001239ff01",
        "url": "https://api.finwizz.com/webhooks/billing-events",
        "attempt": 1,
        "timestamp": "2026-10-29T14:40:01.214Z",
        "httpStatusCode": 200,
        "latencyMs": 42,
        "requestHeaders": {
          "X-Billing-Signature": "t=1793264401,v1=9e8c47b9...",
          "Content-Type": "application/json"
        },
        "responseHeaders": {
          "content-type": "application/json",
          "x-request-id": "req_fw_88192"
        },
        "responseBody": "{\"status\":\"processed\"}"
      }
    ]
  }
  ```

---

### ⚡ C. SINGLE BUTTON ACTIONS (RESEND / RETRY)
- **Trigger**: "Resend Event" button click on any failed or dropped webhook log.
- **Endpoint**: `POST /api/v1/billing/events/:id/retry`
- **Request Body**: `{ "endpointId": "6ae2f910e74b21001239ff01" }`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Webhook retry dispatched successfully",
    "newAttempt": 2,
    "httpStatusCode": 200,
    "latencyMs": 38
  }
  ```

---

## 2.3 Cross-Domain Inbound Lifecycle Webhooks
> These endpoints are invoked by other ecosystem microservices (HRMS, CRM, Payment Gateways) to synchronize operations into Books and Billing.

```
+-----------------------------------------------------------------------------------------+
|                         CROSS-DOMAIN INBOUND WEBHOOK MATRIX                             |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   [HRMS Service] --------> POST /api/v1/integration/hrms/payroll-finalized ------------+
|   (Payroll Monthly Close)                                                               |
|                                                                                         v
|   [CRM Service] ----------> POST /api/v1/integration/crm/deal-won ---------------------+
|   (Enterprise Won Deal)                                                                 |
|                                                                                         v
|   [Razorpay / Stripe] ----> POST /api/v1/integration/gateway/webhook -------------------+
|   (Card Auto-Debit / Dispute)                                                           |
|                                                                                         v
|                                                                          +------------+ |
|                                                                          | Post to    | |
|                                                                          | Books &    | |
|                                                                          | Billing    | |
|                                                                          +------------+ |
+-----------------------------------------------------------------------------------------+
```

### ⚡ A. HRMS PAYROLL FINALIZED INBOUND WEBHOOK
- **Endpoint**: `POST /api/v1/integration/hrms/payroll-finalized`
- **Headers**:
  ```http
  Authorization: Bearer <service_integration_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Request Payload (JSON)**:
  ```json
  {
    "companyId": "6aa797278d301b4735f1d322",
    "payrollMonth": "October 2026",
    "totalSalary": 1450000.00,
    "totalTds": 145000.00,
    "totalPf": 87000.00,
    "notes": "October 2026 monthly payroll close for 48 employees."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Payroll finalized for October 2026. Journal entry generated successfully in Books."
  }
  ```
- **Automatic Books GL Posting**:
  $$\text{Debit: Salaries & Wages Expense } ₹14,50,000.00$$
  $$\text{Credit: TDS Payable (Section 192) } ₹1,45,000.00$$
  $$\text{Credit: Employee Provident Fund (PF) Payable } ₹87,000.00$$
  $$\text{Credit: Net Salaries Payable / Bank } ₹12,18,000.00$$

---

### ⚡ B. CRM DEAL WON INBOUND WEBHOOK
- **Endpoint**: `POST /api/v1/integration/crm/deal-won`
- **Headers**:
  ```http
  Authorization: Bearer <service_integration_token>
  Content-Type: application/json
  x-org-id: 6aa797278d301b4735f1d322
  ```
- **Request Payload (JSON)**:
  ```json
  {
    "companyId": "6aa797278d301b4735f1d322",
    "customerName": "Tata Digital Enterprises",
    "customerEmail": "procurement@tatadigital.com",
    "customerPhone": "+91 98200 11223",
    "dealName": "Annual Cloud Architecture & DevOps SLA",
    "dealAmount": 1800000.00,
    "currency": "INR"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Deal Won event received. Draft Quote generated successfully in Billing.",
    "customerId": "6ae2f950e74b21001239aa88",
    "quoteId": "6ae2f950e74b21001239bb99"
  }
  ```
- **Automated Workflow**:
  1. Checks if Customer exists in DB; if not, automatically provisions new Customer master record.
  2. Creates a commercial Draft Quote (`/billing/sales/quotes`) with the negotiated deal amount ready for 1-click contract acceptance.

---

### ⚡ C. CRM CONTACT SYNC INBOUND WEBHOOK
- **Endpoint**: `POST /api/v1/integration/crm/contact-sync`
- **Request Payload**:
  ```json
  {
    "companyId": "6aa797278d301b4735f1d322",
    "name": "Rajesh Subramaniam",
    "email": "rajesh.s@tatadigital.com",
    "phone": "+91 98200 44556",
    "company": "Tata Digital Enterprises",
    "address": {
      "street": "Bombay House, 24 Homi Mody Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zip": "400001",
      "country": "India"
    }
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Customer synced successfully",
    "customerId": "6ae2f950e74b21001239aa88"
  }
  ```

---

### ⚡ D. HRMS EMPLOYEE SYNC INBOUND WEBHOOK
- **Endpoint**: `POST /api/v1/integration/hrms/employee-sync`
- **Request Payload**:
  ```json
  {
    "companyId": "6aa797278d301b4735f1d322",
    "employeeCode": "EMP-2041",
    "firstName": "Vikram",
    "lastName": "Aditya",
    "email": "vikram.aditya@spinny.com",
    "department": "Engineering",
    "designation": "Staff Cloud Architect",
    "costRate": 1500,
    "billingRate": 4000
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Employee synced successfully into Timesheets & Projects resource directory",
    "employeeId": "6ae2f970e74b21001239dd44"
  }
  ```

---

### ⚡ E. PAYMENT GATEWAY WEBHOOK (RAZORPAY / STRIPE)
- **Endpoint**: `POST /api/v1/integration/gateway/webhook`
- **Headers**:
  ```http
  X-Razorpay-Signature: <hmac_hex_digest>
  Content-Type: application/json
  ```
- **Request Payload (Recurring Auto-Debit Success)**:
  ```json
  {
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_O7d8192kL1920",
          "amount": 15930000,
          "currency": "INR",
          "status": "captured",
          "order_id": "order_O7d8192aA11",
          "invoice_id": "inv_O7d8192bB22",
          "method": "card",
          "fee": 318600,
          "tax": 57348
        }
      }
    }
  }
  ```
- **Automated Settlement & GL Invariance**:
  $$\text{Debit: HDFC Bank Account (Net Settlement) } ₹1,55,540.52$$
  $$\text{Debit: Payment Gateway Fee Expense (2%) } ₹3,186.00$$
  $$\text{Debit: Input GST on Gateway Fee (18%) } ₹573.48$$
  $$\text{Credit: Accounts Receivable / Customer Invoice } ₹1,59,300.00$$
  $$\sum \text{Debits} == \sum \text{Credits} \quad (\Delta = 0.00)$$
- **Invoice Status Update**: Customer Invoice `status` updated to `'Paid'`, `balanceDue` set to `0.00`, receipt generated and dispatched to customer email.

---

## 3. Summary of API Endpoints Covered

| Category | HTTP Method | Endpoint Route | Description |
| :--- | :--- | :--- | :--- |
| **Direct Expenses** | `POST` | `/api/v1/billing/expenses` | Create single expense with line items & tax |
| **Direct Expenses** | `POST` | `/api/v1/billing/expenses/bulk` | Bulk add expenses in grid format |
| **Direct Expenses** | `GET` | `/api/v1/billing/expenses` | Split view master list with filters & pagination |
| **Direct Expenses** | `GET` | `/api/v1/billing/expenses/:id` | Detailed view of expense record |
| **Direct Expenses** | `PUT` | `/api/v1/billing/expenses/:id` | Update expense line items & accounts |
| **Direct Expenses** | `DELETE` | `/api/v1/billing/expenses/:id` | Delete expense and contra post journal |
| **Direct Expenses** | `POST` | `/api/v1/billing/expenses/:id/convert-to-invoice` | Convert unbilled expense to client invoice |
| **Direct Expenses** | `POST` | `/api/v1/billing/expenses/:id/reimburse` | Mark employee claim reimbursed |
| **Direct Expenses** | `POST` | `/api/v1/billing/expenses/:id/void` | Void expense voucher |
| **Recurring Expenses** | `POST` | `/api/v1/billing/expenses/recurring` | Create recurring vendor subscription profile |
| **Recurring Expenses** | `GET` | `/api/v1/billing/expenses/recurring` | Master list of recurring subscription profiles |
| **Recurring Expenses** | `GET` | `/api/v1/billing/expenses/recurring/:id` | Detail view of recurring profile |
| **Recurring Expenses** | `PUT` | `/api/v1/billing/expenses/recurring/:id` | Update profile cadence or amounts |
| **Recurring Expenses** | `DELETE` | `/api/v1/billing/expenses/recurring/:id` | Stop profile and terminate future schedule |
| **Recurring Expenses** | `POST` | `/api/v1/billing/expenses/recurring/:id/pause` | Pause recurring generation |
| **Recurring Expenses** | `POST` | `/api/v1/billing/expenses/recurring/:id/resume` | Resume recurring generation |
| **Recurring Expenses** | `POST` | `/api/v1/billing/expenses/recurring/:id/generate-now` | Force immediate generation of current cycle |
| **Webhooks Engine** | `POST` | `/api/v1/billing/events/subscriptions` | Register outbound webhook endpoint |
| **Webhooks Engine** | `GET` | `/api/v1/billing/events/subscriptions` | Directory of webhook endpoints & health |
| **Webhooks Engine** | `PUT` | `/api/v1/billing/events/subscriptions/:id` | Update webhook target events or URL |
| **Webhooks Engine** | `DELETE` | `/api/v1/billing/events/subscriptions/:id` | Delete webhook endpoint |
| **Webhooks Engine** | `POST` | `/api/v1/billing/events/subscriptions/:id/test-ping` | Send test ping event with HMAC header |
| **Webhooks Engine** | `POST` | `/api/v1/billing/events/subscriptions/:id/rotate-secret` | Rotate HMAC secret key |
| **Lifecycle Logs** | `GET` | `/api/v1/billing/events` | Stream of all commercial & lifecycle events |
| **Lifecycle Logs** | `GET` | `/api/v1/billing/events/:id/deliveries` | Inspect delivery headers, latency & response body |
| **Lifecycle Logs** | `POST` | `/api/v1/billing/events/:id/retry` | Manually resend/retry failed webhook |
| **Ecosystem Sync** | `POST` | `/api/v1/integration/hrms/payroll-finalized` | Ingest HRMS payroll into Books journal |
| **Ecosystem Sync** | `POST` | `/api/v1/integration/crm/deal-won` | Ingest CRM deal into draft quote & customer |
| **Ecosystem Sync** | `POST` | `/api/v1/integration/crm/contact-sync` | Ingest CRM contacts into Customer directory |
| **Ecosystem Sync** | `POST` | `/api/v1/integration/hrms/employee-sync` | Ingest HRMS employees into Project resources |
| **Ecosystem Sync** | `POST` | `/api/v1/integration/gateway/webhook` | Ingest Payment Gateway auto-debit & disputes |
