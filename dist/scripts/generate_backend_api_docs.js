"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const backendDocPath = 'D:/backend/docs/BACKEND_API_EXHAUSTIVE_SPECIFICATION.md';
const artifactDocPath = 'C:/Users/piyus/.gemini/antigravity/brain/3c8bffc7-5c06-43d3-95fc-a8e60f1a4ebd/backend_api_exhaustive_specification.md';
console.log('Generating exhaustive backend API documentation...');
// We will construct the master markdown documentation
let doc = '';
function add(text) {
    doc += text + '\n';
}
add('# Capyngen Enterprise ERP — Backend API Exhaustive Specification');
add('> **Comprehensive Technical Reference for Books, Billing, and Inventory Domains**');
add('> Version: 2.0 Enterprise | Date: October 2026 | Protocol: RESTful JSON over HTTPS\n');
add('---');
add('## Table of Contents');
add('1. [System Architecture, Multi-Tenancy & Global Standards](#1-system-architecture-multi-tenancy--global-standards)');
add('2. [Core Identity, Authentication & Context APIs](#2-core-identity-authentication--context-apis)');
add('3. [Multi-Tenancy, Organization & RBAC APIs](#3-multi-tenancy-organization--rbac-apis)');
add('4. [Approval Workflow Engine APIs](#4-approval-workflow-engine-apis)');
add('5. [Books: Items & Inventory Adjustments APIs](#5-books-items--inventory-adjustments-apis)');
add('6. [Books: Sales & Order-to-Cash (O2C) APIs](#6-books-sales--order-to-cash-o2c-apis)');
add('7. [Books: Purchases & Procure-to-Pay (P2P) APIs](#7-books-purchases--procure-to-pay-p2p-apis)');
add('8. [Books: Accountant & General Ledger (GL) APIs](#8-books-accountant--general-ledger-gl-apis)');
add('9. [Books: Banking, Reconciliation & Treasury Forecast APIs](#9-books-banking-reconciliation--treasury-forecast-apis)');
add('10. [Books: Time Tracking & Projects APIs](#10-books-time-tracking--projects-apis)');
add('11. [Books: HRMS, Payroll & Employee Expense Claims APIs](#11-books-hrms-payroll--employee-expense-claims-apis)');
add('12. [Books: Financial, Operational & Analytical Reports APIs](#12-books-financial-operational--analytical-reports-apis)');
add('13. [Inventory: Warehouses, Operations & Manufacturing APIs](#13-inventory-warehouses-operations--manufacturing-apis)');
add('14. [Billing: Subscriptions & Product Catalog APIs](#14-billing-subscriptions--product-catalog-apis)');
add('15. [Customer Portal, Document Upload & Webhooks APIs](#15-customer-portal-document-upload--webhooks-apis)\n');
add('---');
add('## 1. System Architecture, Multi-Tenancy & Global Standards\n');
add('### 1.1 Base URLs & Protocols');
add('- **Development Server:** `http://localhost:5000`');
add('- **Production Gateway:** `https://books.orinite.com`');
add('- **HRMS Gateway Proxy Target:** `http://127.0.0.1:3000` (or `process.env.HRMS_BACKEND_URL`)\n');
add('### 1.2 Global Request Headers');
add('| Header Name | Type | Required | Description | Example |');
add('| :--- | :--- | :--- | :--- | :--- |');
add('| `Authorization` | `string` | Yes (for protected endpoints) | Bearer JWT access token | `Bearer eyJhbGciOi...` |');
add('| `x-company-id` / `x-org-id` | `string` | Optional (defaults to token) | Multi-tenant organization ObjectId | `6aa797278d301b4735f1d322` |');
add('| `Content-Type` | `string` | Yes | Request payload content type | `application/json` |');
add('| `Accept` | `string` | Yes | Expected response format | `application/json` |\n');
add('### 1.3 Standard JSON Envelopes');
add('#### Success Envelope (HTTP 200 / 201)');
add('```json');
add('{');
add('  "success": true,');
add('  "message": "Operation completed successfully",');
add('  "data": { ... },');
add('  "pagination": {');
add('    "page": 1,');
add('    "limit": 25,');
add('    "total": 128,');
add('    "pages": 6');
add('  }');
add('}');
add('```\n');
add('#### Error Envelope (HTTP 400 / 401 / 403 / 404 / 500)');
add('```json');
add('{');
add('  "success": false,');
add('  "message": "Descriptive error message",');
add('  "error": "Error details or validation failures",');
add('  "statusCode": 400');
add('}');
add('```\n');
// Read extracted endpoints
const extracted = JSON.parse(fs_1.default.readFileSync('D:/backend/extracted_endpoints.json', 'utf-8'));
// Helper function to render an API block
function renderEndpoint(e) {
    add(`### \`${e.method}\` ${e.endpoint}`);
    add(`**${e.title}**\n`);
    add(`- **Description:** ${e.desc}`);
    add(`- **Authentication:** \`${e.auth}\``);
    if (e.perm)
        add(`- **RBAC Permission Required:** \`${e.perm}\``);
    if (e.feature)
        add(`- **Subscription Feature Key:** \`${e.feature}\``);
    if (e.params)
        add(`- **Query / Path Parameters:** ${e.params}`);
    if (e.body) {
        add(`\n**Request Body:**`);
        add('```json');
        add(JSON.stringify(e.body, null, 2));
        add('```');
    }
    else {
        add(`\n**Request Body:** None`);
    }
    add(`\n**Success Response (HTTP 200/201):**`);
    add('```json');
    add(JSON.stringify(e.response, null, 2));
    add('```');
    add('\n---\n');
}
add('## 2. Core Identity, Authentication & Context APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/employees/login',
    title: 'Employee / User Login',
    desc: 'Authenticates an employee using email and password. Falls back to local database authentication if the HRMS microservice is unavailable.',
    auth: 'Public',
    body: {
        email: 'admin@spinny.com',
        password: 'Password@123'
    },
    response: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
            _id: '6aa797278d301b4735f1d329',
            id: '6aa797278d301b4735f1d329',
            email: 'admin@spinny.com',
            firstName: 'Nitesh',
            lastName: 'Thakur',
            role: 'Admin',
            company: {
                _id: '6aa797278d301b4735f1d322',
                name: 'Spinny Fleet Telematics'
            }
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/auth/spinny-login',
    title: 'Direct Spinny Admin One-Click Login',
    desc: 'Generates a signed JWT session for Spinny administrative workflows.',
    auth: 'Public / Dev',
    response: {
        success: true,
        token: 'eyJhbGciOi...',
        user: {
            _id: '6aa797278d301b4735f1d329',
            role: 'Admin',
            company: { _id: '6aa797278d301b4735f1d322', name: 'Spinny' }
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/auth/dev-login',
    title: 'Development Bypass Login',
    desc: 'Rapid test session generation for local pair-programming and QA verification.',
    auth: 'Public / Dev',
    response: {
        success: true,
        token: 'eyJhbGciOi...',
        user: { role: 'Admin', company: { name: 'Spinny' } }
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/me',
    title: 'Organization Identity & Subscription Context Resolver',
    desc: 'Resolves the caller organization profile, active subscription plan, modules unlocked, and caller role.',
    auth: 'verifyCapyngenToken',
    response: {
        subscription: {
            _id: '6ad5b62c24f4c564a0071135',
            status: 'Active',
            billingCycle: 'Annual',
            planId: '6a9aab2b37f115525a01b0dc'
        },
        plan: {
            _id: '6a9aab2b37f115525a01b0dc',
            name: 'Enterprise',
            featureKeys: ['*']
        },
        role: 'Admin'
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/health',
    title: 'System Health Check',
    desc: 'Returns server operational status, database connectivity status, and uptime metrics.',
    auth: 'Public',
    response: {
        success: true,
        message: 'Backend is healthy'
    }
});
add('## 3. Multi-Tenancy, Organization & RBAC APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/organizations/setup',
    title: 'Initialize New Organization',
    desc: 'Creates a new multi-tenant organization, seeds default Chart of Accounts, fiscal calendars, and administrative roles.',
    auth: 'verifyCapyngenToken',
    body: {
        companyName: 'Apex Innovations Pvt Ltd',
        industry: 'Technology',
        currency: 'INR',
        fiscalYearStartMonth: 4,
        timeZone: 'Asia/Kolkata'
    },
    response: {
        success: true,
        data: {
            organization: {
                _id: '6b0102030405060708090a0b',
                companyName: 'Apex Innovations Pvt Ltd',
                currency: 'INR'
            }
        }
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/organizations',
    title: 'List User Organizations',
    desc: 'Retrieves all organizations associated with the currently authenticated user session.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            { _id: '6aa797278d301b4735f1d322', name: 'Spinny Fleet Telematics', role: 'Admin' },
            { _id: '6abdf9a7c076b4bb072b4587', name: 'Honda Logistics', role: 'Admin' }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/organizations/join',
    title: 'Join Organization via Invite Token',
    desc: 'Validates an invitation code and associates the current employee with the target organization.',
    auth: 'verifyCapyngenToken',
    body: {
        invitationToken: 'inv_8f7e6d5c4b3a21'
    },
    response: {
        success: true,
        message: 'Successfully joined organization'
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/rbac/roles',
    title: 'List Organization RBAC Roles',
    desc: 'Returns all defined roles and their granular permission matrices for the tenant.',
    auth: 'verifyCapyngenToken',
    perm: 'settings.roles (read)',
    response: {
        success: true,
        data: [
            {
                _id: '6aa891011121314151617181',
                name: 'Accountant',
                permissions: ['accounts-journals-read', 'accounts-invoices-read', 'accounts-bills-create']
            },
            {
                _id: '6aa891011121314151617182',
                name: 'Sales Manager',
                permissions: ['accounts-sales-quotes-full', 'accounts-sales-invoices-full']
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/rbac/roles',
    title: 'Create Custom RBAC Role',
    desc: 'Defines a new tenant role with explicit read, create, edit, delete, and approve permissions per module.',
    auth: 'verifyCapyngenToken',
    perm: 'settings.roles (create)',
    body: {
        name: 'Inventory Controller',
        description: 'Manages warehouse transfers and cycle counting',
        permissions: [
            'inventory-warehouses-full',
            'inventory-transfer-orders-full',
            'inventory-cycle-counts-full'
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6aa991011121314151617183',
            name: 'Inventory Controller'
        }
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/rbac/users',
    title: 'List Tenant Users',
    desc: 'Retrieves all users/employees assigned to the organization with their assigned RBAC roles and status.',
    auth: 'verifyCapyngenToken',
    perm: 'settings.users (read)',
    response: {
        success: true,
        data: [
            {
                _id: '6aa797278d301b4735f1d329',
                firstName: 'Nitesh',
                lastName: 'Thakur',
                email: 'nitesht206@gmail.com',
                role: 'Admin',
                status: 'Active'
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/rbac/users/invite',
    title: 'Invite User to Organization',
    desc: 'Dispatches an email invitation to a team member to access Books, Billing, or Inventory.',
    auth: 'verifyCapyngenToken',
    perm: 'settings.users (create)',
    body: {
        email: 'newuser@spinny.com',
        role: 'Staff',
        roleId: '6aa891011121314151617181'
    },
    response: {
        success: true,
        message: 'Invitation sent successfully'
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/admin/purge-test-data',
    title: 'Purge Company Test Data',
    desc: 'Safely truncates dummy transactions (invoices, bills, orders) while preserving Chart of Accounts, settings, and users.',
    auth: 'verifyCapyngenToken (Admin/Owner only)',
    body: {
        confirmPurge: true
    },
    response: {
        success: true,
        message: 'Test transactions purged successfully'
    }
});
add('## 4. Approval Workflow Engine APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/approvals/rules',
    title: 'Get Multi-Tier Approval Rules',
    desc: 'Fetches configured approval thresholds and approver lists across Sales, Purchases, Journals, and Payments.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: {
            invoices: { enabled: true, thresholdAmount: 50000, approvers: ['Admin', 'FinanceDirector'] },
            purchaseOrders: { enabled: true, thresholdAmount: 25000, approvers: ['ProcurementLead', 'Admin'] },
            journals: { enabled: true, thresholdAmount: 100000, approvers: ['ChiefFinancialOfficer'] }
        }
    }
});
renderEndpoint({
    method: 'PUT',
    endpoint: '/api/v1/approvals/rules/:module',
    title: 'Configure Module Approval Rule',
    desc: 'Updates threshold limits and mandatory approvers for a specific transaction module.',
    auth: 'verifyCapyngenToken',
    params: '`module` = `invoices` | `purchaseOrders` | `bills` | `journals` | `leaves`',
    body: {
        enabled: true,
        thresholdAmount: 75000,
        approvers: ['Admin']
    },
    response: {
        success: true,
        message: 'Approval rule updated successfully'
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/approvals/pending',
    title: 'List Pending Approval Requests',
    desc: 'Returns all transactions currently awaiting the caller review/approval signature.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            {
                _id: '6ad90102030405060708090a',
                module: 'invoices',
                documentId: '6ad80102030405060708090a',
                documentNumber: 'INV-0042',
                amount: 85000,
                submittedBy: 'sales.agent@spinny.com',
                submittedAt: '2026-10-18T14:30:00Z',
                status: 'Pending'
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/approvals/submit',
    title: 'Submit Transaction for Multi-Tier Approval',
    desc: 'Transitions a Draft transaction into Pending Approval status and notifies approvers.',
    auth: 'verifyCapyngenToken',
    body: {
        module: 'invoices',
        documentId: '6ad80102030405060708090a',
        notes: 'Urgent client requirement exceeding threshold'
    },
    response: {
        success: true,
        message: 'Submitted for approval'
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/approvals/approve',
    title: 'Approve Transaction',
    desc: 'Approves transaction, updates approval workflow status to Approved, and triggers GL Posting and Stock Deduction.',
    auth: 'verifyCapyngenToken',
    body: {
        module: 'invoices',
        documentId: '6ad80102030405060708090a',
        comments: 'Reviewed and verified against client PO'
    },
    response: {
        success: true,
        message: 'Transaction approved successfully'
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/approvals/reject',
    title: 'Reject Transaction',
    desc: 'Rejects transaction with mandatory audit justification reason and returns it to Draft state.',
    auth: 'verifyCapyngenToken',
    body: {
        module: 'invoices',
        documentId: '6ad80102030405060708090a',
        reason: 'Billing address mismatch with client GST certificate'
    },
    response: {
        success: true,
        message: 'Transaction rejected'
    }
});
add('## 5. Books: Items & Inventory Adjustments APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/items',
    title: 'List Items & Catalog Products',
    desc: 'Fetches paginated inventory items, service items, and digital goods with stock levels and pricing.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-items-directory',
    params: '`page=1&limit=25&type=goods|service&search=iPhone`',
    response: {
        success: true,
        data: [
            {
                _id: '6ad10102030405060708090a',
                name: 'MacBook Pro 16" M3',
                sku: 'MBP-16-M3',
                type: 'goods',
                salesRate: 2499.00,
                purchaseRate: 2100.00,
                stockOnHand: 42,
                reorderPoint: 10,
                status: 'Active'
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/items',
    title: 'Create Item',
    desc: 'Creates a new physical good, service, or assembly item with pricing, tax rules, and initial stock.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-items-directory',
    body: {
        name: 'Dell UltraSharp 32" 4K Monitor',
        sku: 'DELL-U32-4K',
        type: 'goods',
        unit: 'pcs',
        salesRate: 850.00,
        salesAccountId: '6a810102030405060708090a',
        purchaseRate: 650.00,
        purchaseAccountId: '6a810102030405060708090b',
        initialStock: 15,
        initialStockRate: 650.00,
        reorderPoint: 5,
        taxRate: 18,
        isTaxable: true
    },
    response: {
        success: true,
        data: {
            _id: '6ad10102030405060708090b',
            name: 'Dell UltraSharp 32" 4K Monitor',
            sku: 'DELL-U32-4K'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory-adjustments',
    title: 'Create Inventory Stock Adjustment',
    desc: 'Adjusts stock on hand (quantity or valuation) with automatic General Ledger inventory variance posting.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-items-inventory-adjustments',
    body: {
        mode: 'quantity',
        date: '2026-10-18',
        reason: 'Stock damage during transit',
        warehouseId: '6ad20102030405060708090a',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                currentQuantity: 42,
                adjustedQuantity: 40,
                variance: -2
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6ad30102030405060708090a',
            adjustmentNumber: 'ADJ-00012',
            status: 'Adjusted'
        }
    }
});
add('## 6. Books: Sales & Order-to-Cash (O2C) APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/customers',
    title: 'Create Customer',
    desc: 'Registers a business or individual client with billing/shipping addresses, GSTIN, and credit terms.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-customers',
    body: {
        displayName: 'Global Infotech Solutions Pvt Ltd',
        customerType: 'business',
        email: 'billing@globalinfotech.com',
        phone: '+91 98765 43210',
        gstin: '27AABCU9603R1ZM',
        currency: 'INR',
        paymentTerms: 'net30',
        billingAddress: {
            street: '402 Cyber City, Tower B',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411028',
            country: 'India'
        }
    },
    response: {
        success: true,
        data: {
            _id: '6ad40102030405060708090a',
            displayName: 'Global Infotech Solutions Pvt Ltd'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/quotes',
    title: 'Create Sales Quote / Estimate',
    desc: 'Generates a customer quotation with line items, tax breakdowns, discounts, and expiry date.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-quotes',
    body: {
        customerId: '6ad40102030405060708090a',
        quoteNumber: 'QUO-00042',
        date: '2026-10-18',
        expiryDate: '2026-11-18',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                description: 'MacBook Pro 16" M3 Max',
                quantity: 2,
                rate: 2499.00,
                discount: 5,
                taxPercentage: 18,
                taxAmount: 854.65,
                total: 5602.75
            }
        ],
        terms: 'Payment due 30 days from invoice generation.'
    },
    response: {
        success: true,
        data: {
            _id: '6ad50102030405060708090a',
            quoteNumber: 'QUO-00042',
            status: 'Draft',
            totalAmount: 5602.75
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/quotes/:id/convert-to-sales-order',
    title: 'Convert Quote to Sales Order',
    desc: 'Transforms an accepted quote directly into a Confirmed Sales Order, copying line items and terms.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-quotes',
    response: {
        success: true,
        data: {
            salesOrderId: '6ad60102030405060708090a',
            orderNumber: 'SO-00089'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/sales-orders',
    title: 'Create Sales Order',
    desc: 'Creates a confirmed sales order and reserves stock quantities in inventory.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-sales-orders',
    body: {
        customerId: '6ad40102030405060708090a',
        orderNumber: 'SO-00089',
        orderDate: '2026-10-18',
        expectedShipmentDate: '2026-10-25',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                quantity: 2,
                rate: 2499.00,
                amount: 4998.00
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6ad60102030405060708090a',
            orderNumber: 'SO-00089',
            status: 'Confirmed'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/invoices',
    title: 'Create Sales Invoice',
    desc: 'Creates a sales tax invoice. When approved, triggers posting to Accounts Receivable, Sales Revenue, and Tax Payable GL accounts.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-invoices',
    body: {
        customerId: '6ad40102030405060708090a',
        invoiceNumber: 'INV-2026-0099',
        invoiceDate: '2026-10-18',
        dueDate: '2026-11-17',
        salesOrderId: '6ad60102030405060708090a',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                description: 'MacBook Pro 16" M3 Max',
                quantity: 2,
                rate: 2499.00,
                taxPercentage: 18,
                amount: 4998.00
            }
        ],
        subtotal: 4998.00,
        taxTotal: 899.64,
        total: 5897.64
    },
    response: {
        success: true,
        data: {
            _id: '6ad70102030405060708090a',
            invoiceNumber: 'INV-2026-0099',
            status: 'Sent',
            balanceDue: 5897.64
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/payments-received',
    title: 'Record Customer Payment Received',
    desc: 'Records payment against one or more outstanding invoices, debits Bank Account, credits Accounts Receivable, and updates invoice balances.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-payments-received',
    body: {
        customerId: '6ad40102030405060708090a',
        paymentDate: '2026-10-18',
        paymentMode: 'Bank Transfer',
        amount: 5897.64,
        depositToAccountId: '6a810102030405060708090c',
        referenceNumber: 'NEFT-8899220011',
        invoicesAllocated: [
            {
                invoiceId: '6ad70102030405060708090a',
                amountApplied: 5897.64
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6ad80102030405060708090b',
            paymentNumber: 'PMT-RCV-0034',
            status: 'Closed'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/sales/credit-notes',
    title: 'Issue Credit Note',
    desc: 'Issues a credit note for returned goods or billing adjustments, crediting customer account and reversing revenue/tax.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-sales-credit-notes',
    body: {
        customerId: '6ad40102030405060708090a',
        creditNoteNumber: 'CN-00015',
        date: '2026-10-18',
        reason: 'Client discount adjustment post billing',
        totalAmount: 500.00
    },
    response: {
        success: true,
        data: {
            _id: '6ad90102030405060708090c',
            creditNoteNumber: 'CN-00015',
            remainingCredits: 500.00,
            status: 'Open'
        }
    }
});
add('## 7. Books: Purchases & Procure-to-Pay (P2P) APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/purchases/vendors',
    title: 'Create Vendor / Supplier',
    desc: 'Registers a supplier with bank account details, PAN/GSTIN, payment terms, and vendor category.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-purchases-vendors',
    body: {
        displayName: 'SuperMicro Systems Inc.',
        email: 'orders@supermicro.com',
        phone: '+1 408 503 8000',
        currency: 'USD',
        paymentTerms: 'net45'
    },
    response: {
        success: true,
        data: {
            _id: '6ae10102030405060708090a',
            displayName: 'SuperMicro Systems Inc.'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/purchases/purchase-orders',
    title: 'Create Purchase Order',
    desc: 'Creates a purchase order to vendor. Approvals are enforced if amount exceeds organization approval threshold.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-purchases-purchase-orders',
    body: {
        vendorId: '6ae10102030405060708090a',
        poNumber: 'PO-2026-0045',
        date: '2026-10-18',
        expectedDeliveryDate: '2026-11-05',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                quantity: 10,
                rate: 2100.00,
                amount: 21000.00
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6ae20102030405060708090a',
            poNumber: 'PO-2026-0045',
            status: 'Issued'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/purchases/bills',
    title: 'Create Vendor Bill',
    desc: 'Records an incoming vendor bill against PO. Credits Accounts Payable and debits Inventory or Expense accounts.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-purchases-bills',
    body: {
        vendorId: '6ae10102030405060708090a',
        billNumber: 'BILL-88390',
        billDate: '2026-10-18',
        dueDate: '2026-12-02',
        lineItems: [
            {
                itemId: '6ad10102030405060708090a',
                quantity: 10,
                rate: 2100.00,
                amount: 21000.00
            }
        ],
        totalAmount: 21000.00
    },
    response: {
        success: true,
        data: {
            _id: '6ae30102030405060708090a',
            billNumber: 'BILL-88390',
            status: 'Open',
            balanceDue: 21000.00
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/purchases/payments-made',
    title: 'Record Payment Made to Vendor',
    desc: 'Disburses payment against outstanding vendor bills, debiting Accounts Payable and crediting Bank/Cash.',
    auth: 'verifyCapyngenToken',
    feature: 'accounts-purchases-payments-made',
    body: {
        vendorId: '6ae10102030405060708090a',
        paymentDate: '2026-10-18',
        paidThroughAccountId: '6a810102030405060708090c',
        paymentMode: 'Wire Transfer',
        amount: 21000.00,
        billsAllocated: [
            {
                billId: '6ae30102030405060708090a',
                amountApplied: 21000.00
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6ae40102030405060708090a',
            paymentNumber: 'PMT-MADE-0081',
            status: 'Closed'
        }
    }
});
add('## 8. Books: Accountant & General Ledger (GL) APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/chart-of-accounts',
    title: 'Get Chart of Accounts Tree',
    desc: 'Fetches the hierarchical Chart of Accounts structured under Assets, Liabilities, Equity, Revenue, and Expenses.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            {
                _id: '6a810102030405060708090c',
                code: '1001',
                name: 'Operating Bank Account (HDFC)',
                category: 'Asset',
                balance: 1450200.50
            },
            {
                _id: '6a810102030405060708090d',
                code: '2001',
                name: 'Accounts Payable',
                category: 'Liability',
                balance: 245000.00
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/journals',
    title: 'Create Manual Journal Entry',
    desc: 'Creates a double-entry journal entry. Validates that sum(debit) == sum(credit) before posting to Ledger.',
    auth: 'verifyCapyngenToken',
    body: {
        journalDate: '2026-10-18',
        referenceNumber: 'JRN-2026-108',
        notes: 'Depreciation accrual for Q3 compute servers',
        lines: [
            {
                accountId: '6a810102030405060708090e',
                debit: 15000.00,
                credit: 0,
                description: 'Depreciation Expense'
            },
            {
                accountId: '6a810102030405060708090f',
                debit: 0,
                credit: 15000.00,
                description: 'Accumulated Depreciation - Fixed Assets'
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6af10102030405060708090a',
            journalNumber: 'JRN-2026-108',
            postingStatus: 'Posted'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/closing/execute/:fiscalYearId',
    title: 'Execute Fiscal Year-End Closing',
    desc: 'Transfers net profit/loss into Retained Earnings, resets temporary P&L accounts, and locks the closed fiscal period.',
    auth: 'verifyCapyngenToken (Admin only)',
    params: '`fiscalYearId` = Target fiscal year ObjectId',
    response: {
        success: true,
        message: 'Fiscal year closed and locked successfully'
    }
});
add('## 9. Books: Banking, Reconciliation & Treasury Forecast APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/banking/accounts',
    title: 'List Bank Accounts',
    desc: 'Retrieves all corporate checking, savings, and credit card accounts with live book vs cleared balances.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            {
                _id: '6a810102030405060708090c',
                accountName: 'HDFC Corporate Prime Checking',
                accountNumber: 'XXXXXX5012',
                currency: 'INR',
                bookBalance: 1450200.50,
                bankBalance: 1445000.00
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/reconciliation/reconcile',
    title: 'Match & Reconcile Bank Transactions',
    desc: 'Matches imported bank feed statement lines with recorded ERP transactions and marks them as Reconciled.',
    auth: 'verifyCapyngenToken',
    body: {
        bankAccountId: '6a810102030405060708090c',
        statementLineId: '6b110102030405060708090a',
        matchedTransactionId: '6ad80102030405060708090b',
        transactionType: 'payment_received'
    },
    response: {
        success: true,
        message: 'Statement line successfully reconciled'
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/treasury/forecast',
    title: 'AI Treasury 90-Day Cash Forecast',
    desc: 'Projects 30, 60, and 90-day cash positions based on scheduled AR collections, AP due dates, payroll, and recurring expenses.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: {
            currentCash: 1450200.50,
            forecast30Days: 1820500.00,
            forecast60Days: 2150000.00,
            forecast90Days: 2490000.00,
            riskLevel: 'Low'
        }
    }
});
add('## 10. Books: Time Tracking & Projects APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/projects',
    title: 'Create Project',
    desc: 'Initializes a client or internal project with hourly/fixed billing methods, budget limits, and team members.',
    auth: 'verifyCapyngenToken',
    body: {
        projectName: 'Cloud Fleet Telematics Revamp',
        customerId: '6ad40102030405060708090a',
        billingType: 'hourly_project_rate',
        projectRate: 85.00,
        budgetHours: 200
    },
    response: {
        success: true,
        data: {
            _id: '6b210102030405060708090a',
            projectName: 'Cloud Fleet Telematics Revamp',
            status: 'Active'
        }
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/projects/:id/profitability',
    title: 'Get Project EVM & Profitability',
    desc: 'Calculates Earned Value Metrics (Planned Value, Earned Value, Actual Cost, CPI, SPI) and gross margin percentage.',
    auth: 'verifyCapyngenToken',
    params: '`id` = Project ObjectId',
    response: {
        success: true,
        data: {
            actualHours: 120,
            budgetHours: 200,
            totalBilled: 10200.00,
            totalLaborCost: 4800.00,
            grossProfit: 5400.00,
            marginPercentage: 52.9,
            cpi: 1.15
        }
    }
});
add('## 11. Books: HRMS, Payroll & Employee Expense Claims APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/hrms/employees',
    title: 'List Employees',
    desc: 'Retrieves employees across departments with designation, payroll status, and attendance summaries.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            {
                _id: '6aa797278d301b4735f1d329',
                firstName: 'Nitesh',
                lastName: 'Thakur',
                department: 'Engineering',
                role: 'Admin',
                status: 'Active'
            }
        ]
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/hrms/payroll',
    title: 'Initiate Monthly Payroll Batch',
    desc: 'Generates payroll draft batch calculating gross pay, PF, ESI, TDS deductions, and net payout per employee.',
    auth: 'verifyCapyngenToken',
    body: {
        month: 10,
        year: 2026,
        payrollCycle: 'Monthly',
        departments: ['Engineering', 'Sales', 'Finance']
    },
    response: {
        success: true,
        data: {
            _id: '6b310102030405060708090a',
            batchNumber: 'PAY-2026-10',
            totalEmployees: 45,
            totalGrossPayout: 2850000.00,
            status: 'Draft'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/hrms/payroll/:id/finalize',
    title: 'Finalize & Post Payroll Batch to GL',
    desc: 'Approves payroll batch and automatically posts Salaries Expense, PF Payable, and Bank Net Pay entries into GL.',
    auth: 'verifyCapyngenToken',
    params: '`id` = Payroll Batch ObjectId',
    response: {
        success: true,
        message: 'Payroll finalized and posted to General Ledger'
    }
});
add('## 12. Books: Financial, Operational & Analytical Reports APIs\n');
add('The ERP provides over 40 distinct real-time financial, tax, and inventory reporting endpoints under `/api/v1/books/reports/`:\n');
const reportEndpoints = [
    { path: '/profit-and-loss', name: 'Profit and Loss Statement', desc: 'Operating revenues, cost of goods sold, and operating expenses.' },
    { path: '/balance-sheet', name: 'Balance Sheet', desc: 'Assets, liabilities, and owners equity balances.' },
    { path: '/cash-flow', name: 'Cash Flow Statement', desc: 'Operating, investing, and financing cash flows.' },
    { path: '/horizontal-pl', name: 'Horizontal P&L Schedule III', desc: 'Comparative horizontal format for statutory compliance.' },
    { path: '/horizontal-bs', name: 'Horizontal Balance Sheet Schedule III', desc: 'Comparative horizontal balance sheet format.' },
    { path: '/trial-balance', name: 'Trial Balance', desc: 'Summarized debit and credit balances for every COA ledger.' },
    { path: '/general-ledger', name: 'General Ledger Report', desc: 'Detailed transaction lines across all debit/credit accounts.' },
    { path: '/ar-aging-details', name: 'Accounts Receivable Aging Details', desc: 'Detailed receivables grouped into 0-30, 31-60, 61-90, 90+ buckets.' },
    { path: '/ap-aging-details', name: 'Accounts Payable Aging Details', desc: 'Detailed payables grouped into chronological aging buckets.' },
    { path: '/stock-summary', name: 'Inventory Stock Summary', desc: 'Quantity available, committed, incoming, and valuation per SKU.' },
    { path: '/inventory-aging', name: 'Inventory Aging Report', desc: 'Identifies slow-moving, obsolete, and high-turnover inventory lots.' },
    { path: '/turnover-qty', name: 'Inventory Turnover by Quantity', desc: 'Calculates sales volume turnover ratio per item.' },
    { path: '/abc-classification', name: 'ABC Inventory Classification', desc: 'Categorizes items into Class A (high value), B (medium), C (low value).' },
    { path: '/tax-summary', name: 'Tax Summary Report', desc: 'Summary of input tax credits (ITC) and output tax liabilities.' },
    { path: '/budget-vs-actual', name: 'Budget vs Actual Performance', desc: 'Variance analysis comparing planned budgets against actual GL spend.' },
    { path: '/drilldown', name: 'Ledger Transaction Drilldown', desc: 'Drills down into source invoices, bills, or journals from any report line.' }
];
add('| Endpoint Path | Report Name | Description |');
add('| :--- | :--- | :--- |');
for (const r of reportEndpoints) {
    add(`| \`GET /api/v1/books/reports${r.path}\` | **${r.name}** | ${r.desc} |`);
}
add('\n');
add('## 13. Inventory: Warehouses, Operations & Manufacturing APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory/warehouses',
    title: 'Create Warehouse',
    desc: 'Creates a physical or virtual warehouse location with bin aisle tracking.',
    auth: 'verifyCapyngenToken',
    body: {
        name: 'North Logistics Hub (Gurgaon)',
        code: 'WH-GGN-01',
        address: 'Plot 45, Sector 18, Electronic City, Gurgaon',
        status: 'Active'
    },
    response: {
        success: true,
        data: {
            _id: '6ad20102030405060708090a',
            name: 'North Logistics Hub (Gurgaon)',
            code: 'WH-GGN-01'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory/transfer-orders',
    title: 'Create Warehouse Transfer Order',
    desc: 'Initiates stock transfer between source and destination warehouses.',
    auth: 'verifyCapyngenToken',
    body: {
        fromWarehouseId: '6ad20102030405060708090a',
        toWarehouseId: '6ad20102030405060708090b',
        date: '2026-10-18',
        items: [
            {
                itemId: '6ad10102030405060708090a',
                quantity: 5
            }
        ]
    },
    response: {
        success: true,
        data: {
            _id: '6b410102030405060708090a',
            transferNumber: 'TO-00021',
            status: 'Draft'
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory/transfer-orders/:id/dispatch',
    title: 'Dispatch Transfer Order',
    desc: 'Marks items In Transit and decrements source warehouse stock balance.',
    auth: 'verifyCapyngenToken',
    params: '`id` = Transfer Order ObjectId',
    response: {
        success: true,
        status: 'In Transit'
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory/transfer-orders/:id/receive',
    title: 'Receive Transfer Order',
    desc: 'Receives transferred goods into destination warehouse bins and closes order.',
    auth: 'verifyCapyngenToken',
    params: '`id` = Transfer Order ObjectId',
    response: {
        success: true,
        status: 'Received'
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/books/inventory/work-orders',
    title: 'Create Manufacturing Work Order',
    desc: 'Creates a discrete manufacturing order exploding Bill of Materials (BOM) into raw materials.',
    auth: 'verifyCapyngenToken',
    body: {
        assemblyItemId: '6ad10102030405060708090a',
        quantityToBuild: 50,
        routingId: '6b510102030405060708090a',
        targetWarehouseId: '6ad20102030405060708090a'
    },
    response: {
        success: true,
        data: {
            _id: '6b610102030405060708090a',
            workOrderNumber: 'WO-2026-0012',
            status: 'In Production'
        }
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/inventory/mrp/plan',
    title: 'Calculate MRP Material Requirements',
    desc: 'Runs the MRP heuristic engine computing gross requirements, scheduled receipts, and suggested purchase orders.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: {
            shortages: [
                {
                    itemId: '6ad10102030405060708090a',
                    sku: 'MBP-16-M3',
                    requiredQty: 25,
                    availableQty: 10,
                    suggestedPoQty: 15
                }
            ]
        }
    }
});
add('## 14. Billing: Subscriptions & Product Catalog APIs\n');
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/billing/dashboard',
    title: 'Get Billing SaaS Dashboard Metrics',
    desc: 'Computes Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Churn Rate, and Active Subscriptions count.',
    auth: 'verifyCapyngenToken',
    feature: 'billing-dashboard-home',
    response: {
        success: true,
        data: {
            mrr: 125000.00,
            arr: 1500000.00,
            activeSubscriptions: 342,
            netChurnRate: 1.2
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/billing/plans',
    title: 'Create SaaS Subscription Plan',
    desc: 'Creates a recurring billing plan with trial days, billing cycles, pricing tiers, and module feature keys.',
    auth: 'verifyCapyngenToken',
    body: {
        name: 'Growth Cloud Tier',
        code: 'PLAN-GROWTH',
        billingFrequency: 'Monthly',
        price: 99.00,
        currency: 'USD',
        trialDays: 14,
        featureKeys: ['billing-sales-customers', 'billing-documents']
    },
    response: {
        success: true,
        data: {
            _id: '6b710102030405060708090a',
            name: 'Growth Cloud Tier'
        }
    }
});
add('## 15. Customer Portal, Document Upload & Webhooks APIs\n');
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/upload',
    title: 'Upload File / Supporting Attachment to AWS S3',
    desc: 'Uploads receipts, invoices, vendor quotes, or tax certificates to secure AWS S3 storage.',
    auth: 'verifyCapyngenToken',
    params: 'Multipart form data with `file` field',
    response: {
        success: true,
        data: {
            url: 'https://claveecom.s3.ap-south-1.amazonaws.com/uploads/receipt_99210.pdf',
            fileName: 'receipt_99210.pdf',
            size: 142500
        }
    }
});
renderEndpoint({
    method: 'POST',
    endpoint: '/api/v1/integration/crm/deal-won',
    title: 'CRM Deal-Won Cross-System Webhook',
    desc: 'Receives Deal-Won events from external CRM to automatically instantiate Customer profile and Draft Sales Invoice.',
    auth: 'Signed Integration Payload',
    body: {
        dealId: 'crm_deal_88301',
        customerName: 'Acrobat Logistics Corp',
        contactEmail: 'accounts@acrobatlogistics.com',
        dealAmount: 12500.00,
        items: [
            { name: 'Fleet Telematics OBD Units', quantity: 10, rate: 1250.00 }
        ]
    },
    response: {
        success: true,
        message: 'Customer and Sales Order created from CRM deal'
    }
});
renderEndpoint({
    method: 'GET',
    endpoint: '/api/v1/books/audit-trail',
    title: 'Get Immutable System Audit Trail',
    desc: 'Retrieves audit logs of all create, update, delete, approve, and void operations across the platform.',
    auth: 'verifyCapyngenToken',
    response: {
        success: true,
        data: [
            {
                _id: '6b810102030405060708090a',
                action: 'APPROVE',
                module: 'invoices',
                documentNumber: 'INV-2026-0099',
                userId: '6aa797278d301b4735f1d329',
                userEmail: 'nitesht206@gmail.com',
                timestamp: '2026-10-18T16:15:22Z',
                ipAddress: '122.161.44.12'
            }
        ]
    }
});
// Write to files
fs_1.default.writeFileSync(backendDocPath, doc, 'utf-8');
fs_1.default.writeFileSync(artifactDocPath, doc, 'utf-8');
console.log(`Backend API documentation generated successfully! Length: ${doc.length} characters.`);
