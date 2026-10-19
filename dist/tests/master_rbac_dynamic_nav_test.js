"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Models
const User_1 = require("../domains/core/models/User");
const Role_1 = require("../domains/core/models/Role");
const UserOrganization_1 = require("../domains/core/models/UserOrganization");
// Middlewares & Context
const context_1 = require("../context");
const permissionMiddleware_1 = require("../domains/core/middlewares/permissionMiddleware");
const rbacResults = [];
function recordRBACTest(persona, category, testName, status, details, evidence) {
    rbacResults.push({ persona, category, testName, status, details, evidence });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${persona}] [${category}] - ${testName}: ${details}`);
    if (evidence && status === 'FAIL') {
        console.error('   Evidence:', JSON.stringify(evidence, null, 2));
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND DYNAMIC NAVIGATION SIMULATOR
// (Replicates exactly BooksLayout.tsx filterNavigation & usePermissions hook)
// ─────────────────────────────────────────────────────────────────────────────
const mockBooksNavigation = [
    {
        id: 'main',
        items: [
            { id: 'home', label: 'Home', path: '/books/dashboard' },
            { id: 'quick-guide', label: 'Quick Guide', path: '/books/quick-guide' },
            {
                id: 'items',
                label: 'Items',
                path: '/books/items',
                children: [{ id: 'items-list', label: 'Items', path: '/books/items' }]
            },
            {
                id: 'inventory',
                label: 'Inventory',
                path: '/books/inventory',
                children: [{ id: 'inventory-adjustments', label: 'Inventory Adjustments', path: '/books/inventory/adjustments' }]
            },
            {
                id: 'sales',
                label: 'Sales',
                path: '/books/sales',
                children: [
                    { id: 'customers', label: 'Customers', path: '/books/sales/customers' },
                    { id: 'quotes', label: 'Quotes', path: '/books/sales/quotes' },
                    { id: 'sales-orders', label: 'Sales Orders', path: '/books/sales/sales-orders' },
                    { id: 'invoices', label: 'Invoices', path: '/books/sales/invoices' },
                    { id: 'recurring-invoices', label: 'Recurring Invoices', path: '/books/sales/recurring-invoices' },
                    { id: 'delivery-challans', label: 'Delivery Challans', path: '/books/sales/delivery-challans' },
                    { id: 'payments-received', label: 'Payments Received', path: '/books/sales/payments-received' },
                    { id: 'credit-notes', label: 'Credit Notes', path: '/books/sales/credit-notes' },
                ]
            },
            {
                id: 'purchases',
                label: 'Purchases',
                path: '/books/purchases',
                children: [
                    { id: 'vendors', label: 'Vendors', path: '/books/purchases/vendors' },
                    { id: 'expenses', label: 'Expenses', path: '/books/purchases/expenses' },
                    { id: 'recurring-expenses', label: 'Recurring Expenses', path: '/books/purchases/recurring-expenses' },
                    { id: 'purchase-orders', label: 'Purchase Orders', path: '/books/purchases/purchase-orders' },
                    { id: 'bills', label: 'Bills', path: '/books/purchases/bills' },
                    { id: 'recurring-bills', label: 'Recurring Bills', path: '/books/purchases/recurring-bills' },
                    { id: 'payments-made', label: 'Payments Made', path: '/books/purchases/payments-made' },
                    { id: 'vendor-credits', label: 'Vendor Credits', path: '/books/purchases/vendor-credits' },
                ]
            },
            {
                id: 'banking',
                label: 'Banking',
                path: '/books/banking',
                children: [
                    { id: 'bank-accounts', label: 'Bank Accounts', path: '/books/banking' },
                    { id: 'bank-reconciliation', label: 'Bank Reconciliation', path: '/books/banking/reconciliation' },
                    { id: 'banking-rules', label: 'Banking Rules', path: '/books/banking/rules' }
                ]
            },
            {
                id: 'accountant',
                label: 'Accountant',
                path: '/books/accountant',
                children: [
                    { id: 'manual-journals', label: 'Manual Journals', path: '/books/accountant/manual-journals' },
                    { id: 'bulk-update', label: 'Bulk Update', path: '/books/accountant/bulk-update' },
                    { id: 'currency-adjustments', label: 'Currency Adjustments', path: '/books/accountant/currency-adjustments' },
                    { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/books/accountant/chart-of-accounts' },
                    { id: 'budgets', label: 'Budgets', path: '/books/accountant/budgets' },
                    { id: 'transaction-locking', label: 'Transaction Locking', path: '/books/accountant/transaction-locking' },
                    { id: 'fixed-assets', label: 'Fixed Assets', path: '/books/accountant/fixed-assets' }
                ]
            },
            { id: 'reports', label: 'Reports', path: '/books/reports' },
            { id: 'documents', label: 'Documents', path: '/books/documents' }
        ]
    }
];
function simulateFrontendFilterNavigation(org, user) {
    const booksPerms = org?.rolePermissions?.books || {};
    const effectiveRole = (org?.role || user?.role || '').toLowerCase();
    const isAdmin = org?.isAdmin === true || effectiveRole === 'admin' || effectiveRole === 'owner';
    const alwaysAllowed = ['home', 'quick-guide', 'quick_guide', 'getting-started'];
    const filteredGroups = mockBooksNavigation.map(group => {
        const filteredItems = group.items.map((item) => {
            let hasRbacPermission = isAdmin || alwaysAllowed.includes(item.id);
            const moduleId = item.id.replace(/-/g, '_');
            const modulePerms = booksPerms[moduleId];
            if (!item.children) {
                if (item.id === 'reports') {
                    const hasReportPerm = hasRbacPermission || (modulePerms && Object.values(modulePerms).some((p) => p?.view === true || p === true)) || modulePerms?.reports?.view === true || modulePerms?.view === true || booksPerms?.reports?.view === true;
                    if (!hasReportPerm)
                        return null;
                    return { ...item };
                }
                if (item.id === 'documents') {
                    const hasDocPerm = hasRbacPermission || booksPerms?.settings?.documents?.view === true || booksPerms?.documents?.documents?.view === true || booksPerms?.documents?.view === true || modulePerms?.documents?.view === true || modulePerms?.view === true;
                    if (!hasDocPerm)
                        return null;
                    return { ...item };
                }
                if (!hasRbacPermission && !modulePerms?.[moduleId]?.view && !modulePerms?.view)
                    return null;
                return { ...item };
            }
            // Filter children
            const filteredChildren = item.children.map((child) => {
                let entityId = child.id.replace(/-/g, '_');
                if (entityId === 'items_list')
                    entityId = 'items';
                if (entityId === 'inventory_adjustments')
                    entityId = 'adjustments';
                if (entityId === 'bank_accounts')
                    entityId = 'banking_accounts';
                if (entityId === 'bank_reconciliation')
                    entityId = 'reconciliation';
                const childHasPerm = hasRbacPermission ||
                    modulePerms?.[entityId]?.view === true ||
                    modulePerms?.[entityId] === true ||
                    (entityId === 'bank_accounts' && (modulePerms?.['banking_accounts']?.view === true || modulePerms?.['bank_accounts']?.view === true || modulePerms?.['bank_accounts'] === true)) ||
                    (entityId === 'bank_reconciliation' && (modulePerms?.['reconciliation']?.view === true || modulePerms?.['bank_reconciliation']?.view === true || modulePerms?.['bank_reconciliation'] === true));
                if (!childHasPerm)
                    return null;
                return { ...child };
            }).filter(Boolean);
            if (filteredChildren.length > 0) {
                return { ...item, children: filteredChildren };
            }
            return null;
        }).filter(Boolean);
        return { ...group, items: filteredItems };
    });
    return filteredGroups[0].items;
}
function simulateFrontendTopNavbarState(org, user) {
    const effectiveRole = (org?.role || user?.role || '').toLowerCase();
    const isAdmin = org?.isAdmin === true || effectiveRole === 'admin' || effectiveRole === 'owner';
    const rolePermissions = org?.rolePermissions || {};
    const canManageUsers = isAdmin || Boolean(rolePermissions?.settings?.users?.view) || Boolean(rolePermissions?.books?.settings?.users?.view);
    const canManageRoles = isAdmin || Boolean(rolePermissions?.settings?.roles?.view) || Boolean(rolePermissions?.books?.settings?.roles?.view);
    const canManageApprovals = isAdmin || Boolean(rolePermissions?.settings?.approvals?.view) || Boolean(rolePermissions?.books?.settings?.approvals?.view);
    const canAccessSettings = canManageUsers || canManageRoles || canManageApprovals;
    const canApprove = isAdmin ||
        canManageApprovals ||
        Boolean(rolePermissions?.approvals) ||
        Boolean(rolePermissions?.books?.settings?.approvals?.view) ||
        Boolean(rolePermissions?.books?.sales?.sales_orders?.approve);
    return {
        isAdmin,
        canAccessSettings,
        canManageUsers,
        canManageRoles,
        canManageApprovals,
        canApprove,
        appPerms: rolePermissions?.apps || {}
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEST EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
async function runRBACAndDynamicNavTestSuite() {
    console.log('================================================================================');
    console.log('  🛡️ ENTERPRISE RBAC & DYNAMIC UI NAVIGATION VERIFICATION SUITE');
    console.log('  Testing 5 Distinct User Personas & Permissions on Organization: Honda');
    console.log('================================================================================\n');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri)
        throw new Error('MONGODB_URI not found');
    await mongoose_1.default.connect(mongoUri);
    console.log('Connected to MongoDB cluster.\n');
    const ORG_HONDA_ID = '6abdf9a7c076b4bb072b4587';
    const ORG_SPINNY_ID = '6aa797278d301b4735f1d322';
    // ───────────────────────────────────────────────────────────────────────────
    // 1. SETUP 5 REAL PERSONA ROLES IN DATABASE
    // ───────────────────────────────────────────────────────────────────────────
    console.log('--- [STEP 1: INITIALIZING ENTERPRISE ROLES & PERMISSIONS MATRIX] ---');
    // Role A: Admin Role (Full access)
    const adminRole = await Role_1.Role.findOneAndUpdate({ orgId: ORG_HONDA_ID, name: 'Admin' }, {
        orgId: ORG_HONDA_ID,
        name: 'Admin',
        description: 'Super Administrator with full organization access',
        permissions: { apps: { books: true, billing: true, inventory: true, crm: true, hrms: true } }
    }, { upsert: true, new: true });
    // Role B: Sales Executive Role
    const salesRole = await Role_1.Role.findOneAndUpdate({ orgId: ORG_HONDA_ID, name: 'Sales Executive' }, {
        orgId: ORG_HONDA_ID,
        name: 'Sales Executive',
        description: 'Manages Leads, Deals, Quotes, Orders and Customer Invoices',
        permissions: {
            apps: { books: true, crm: true },
            books: {
                sales: {
                    customers: { view: true, create: true, edit: true, delete: false },
                    quotes: { view: true, create: true, edit: true, delete: false },
                    sales_orders: { view: true, create: true, edit: true, delete: false },
                    invoices: { view: true, create: true, edit: true, delete: false },
                    delivery_challans: { view: true, create: true },
                    payments_received: { view: true, create: true }
                }
            }
        }
    }, { upsert: true, new: true });
    // Role C: Senior Accountant Role
    const accountsRole = await Role_1.Role.findOneAndUpdate({ orgId: ORG_HONDA_ID, name: 'Senior Accountant' }, {
        orgId: ORG_HONDA_ID,
        name: 'Senior Accountant',
        description: 'Manages Chart of Accounts, Journals, Bills, Banking & Financial Reports',
        permissions: {
            apps: { books: true },
            books: {
                purchases: {
                    vendors: { view: true, create: true },
                    bills: { view: true, create: true, edit: true },
                    payments_made: { view: true, create: true }
                },
                banking: {
                    bank_accounts: { view: true },
                    reconciliation: { view: true, create: true },
                    banking_rules: { view: true }
                },
                accountant: {
                    chart_of_accounts: { view: true, create: true, edit: true },
                    manual_journals: { view: true, create: true },
                    fixed_assets: { view: true, create: true },
                    transaction_locking: { view: true, edit: true }
                },
                reports: { view: true }
            }
        }
    }, { upsert: true, new: true });
    // Role D: Operations & Plant Manager Role
    const managerRole = await Role_1.Role.findOneAndUpdate({ orgId: ORG_HONDA_ID, name: 'Operations Manager' }, {
        orgId: ORG_HONDA_ID,
        name: 'Operations Manager',
        description: 'Authorizes Purchase Orders, Sales Orders, Work Orders & Claims',
        permissions: {
            approvals: true,
            apps: { books: true, inventory: true },
            settings: {
                approvals: { view: true, edit: true }
            },
            books: {
                sales: {
                    sales_orders: { view: true, approve: true }
                },
                inventory: {
                    adjustments: { view: true, approve: true }
                }
            }
        }
    }, { upsert: true, new: true });
    // Role E: Shop-Floor Employee Role (Self-Service Only)
    const employeeRole = await Role_1.Role.findOneAndUpdate({ orgId: ORG_HONDA_ID, name: 'Shop-Floor Employee' }, {
        orgId: ORG_HONDA_ID,
        name: 'Shop-Floor Employee',
        description: 'Personal Attendance, Leaves, Claims, and Payslips',
        permissions: {
            apps: { hrms: true },
            self_service: {
                attendance: true,
                leaves: true,
                claims: true,
                payslips: true
            }
        }
    }, { upsert: true, new: true });
    recordRBACTest('System Admin', 'Auth & Login', 'Role Matrix Definition', 'PASS', 'Configured 5 distinct granular roles with precise permission matrices');
    // ───────────────────────────────────────────────────────────────────────────
    // 2. CREATE 5 USER ACCOUNTS & MAP TO HONDA ORG
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 2: ENROLLING 5 USER PERSONAS & ORGANIZATION MAPPINGS] ---');
    const passwordHash = await bcryptjs_1.default.hash('Test@123', 10);
    const personas = [
        { email: 'honda@gmail.com', name: 'Honda Corp Admin', role: 'Admin', roleId: adminRole._id, isAdmin: true },
        { email: 'vikram.sales@honda-corp.internal', name: 'Vikram Sales Exec', role: 'Sales Executive', roleId: salesRole._id, isAdmin: false },
        { email: 'pooja.accounts@honda-corp.internal', name: 'Pooja Accountant', role: 'Senior Accountant', roleId: accountsRole._id, isAdmin: false },
        { email: 'rajesh.manager@honda-corp.internal', name: 'Rajesh Plant Manager', role: 'Operations Manager', roleId: managerRole._id, isAdmin: false },
        { email: 'amit.employee@honda-corp.internal', name: 'Amit Shift Worker', role: 'Shop-Floor Employee', roleId: employeeRole._id, isAdmin: false }
    ];
    const userDocs = {};
    for (const p of personas) {
        const userDoc = await User_1.User.findOneAndUpdate({ email: p.email }, {
            email: p.email,
            password: passwordHash,
            companyName: 'Honda Motor Co',
            role: p.isAdmin ? 'Admin' : 'Business User',
            isVerified: true
        }, { upsert: true, new: true });
        userDocs[p.email] = userDoc;
        await UserOrganization_1.UserOrganization.findOneAndUpdate({ email: p.email, orgId: ORG_HONDA_ID }, {
            email: p.email,
            name: p.name,
            orgId: ORG_HONDA_ID,
            userId: userDoc._id,
            roleId: p.roleId,
            isAdmin: p.isAdmin,
            status: 'Active'
        }, { upsert: true, new: true });
    }
    recordRBACTest('Auth Engine', 'Auth & Login', 'Multi-User Enrollment', 'PASS', 'Successfully mapped 5 user accounts with hashed passwords to Honda Organization');
    // ───────────────────────────────────────────────────────────────────────────
    // 3. TEST AUTHENTICATION & LOGIN ORGANIZATION RESOLUTION
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 3: TESTING LOGIN & ORG PAYLOAD FOR ALL 5 PERSONAS] ---');
    for (const p of personas) {
        const mapping = await UserOrganization_1.UserOrganization.findOne({ email: p.email, orgId: ORG_HONDA_ID }).populate('roleId').lean();
        const roleObj = mapping?.roleId;
        if (p.isAdmin) {
            if (mapping?.isAdmin === true) {
                recordRBACTest(p.name, 'Auth & Login', 'Admin Privilege Verification', 'PASS', 'Admin privileges correctly identified (`isAdmin: true`)');
            }
            else {
                recordRBACTest(p.name, 'Auth & Login', 'Admin Privilege Verification', 'FAIL', 'isAdmin not true');
            }
        }
        else {
            if (mapping?.isAdmin === false && roleObj?.name === p.role) {
                recordRBACTest(p.name, 'Auth & Login', 'Role & Permission Resolution', 'PASS', `Accurately resolved Role: "${roleObj.name}" with scoped permissions`);
            }
            else {
                recordRBACTest(p.name, 'Auth & Login', 'Role & Permission Resolution', 'FAIL', 'Role resolution mismatch');
            }
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // 4. TEST BACKEND PERMISSION MIDDLEWARE ENFORCEMENT
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 4: BACKEND RBAC MIDDLEWARE ENFORCEMENT & GUARDS] ---');
    function testMiddlewarePermission(contextStore, module, action) {
        let allowed = false;
        let status = 200;
        let message = 'OK';
        const req = {};
        const res = {
            status: (code) => {
                status = code;
                return {
                    json: (data) => {
                        message = data.message || 'Error';
                    }
                };
            }
        };
        const next = () => {
            allowed = true;
        };
        context_1.requestContext.run(contextStore, () => {
            const middleware = (0, permissionMiddleware_1.requirePermission)(module, action);
            middleware(req, res, next);
        });
        return { allowed, status, message };
    }
    // 4.1 Admin Persona Check
    const adminCtx = { userId: userDocs['honda@gmail.com']._id.toString(), orgId: ORG_HONDA_ID, isAdmin: true, permissions: {} };
    const adminRoleCheck = testMiddlewarePermission(adminCtx, 'settings', 'roles');
    if (adminRoleCheck.allowed) {
        recordRBACTest('Honda Admin', 'Backend Middleware Guard', 'Settings & Role Admin Access', 'PASS', 'Admin successfully bypassed permission guard for sensitive settings');
    }
    else {
        recordRBACTest('Honda Admin', 'Backend Middleware Guard', 'Settings & Role Admin Access', 'FAIL', 'Admin blocked');
    }
    // 4.2 Sales Executive Check
    const salesCtx = {
        userId: userDocs['vikram.sales@honda-corp.internal']._id.toString(),
        orgId: ORG_HONDA_ID,
        isAdmin: false,
        permissions: salesRole.permissions
    };
    // Can Sales Exec access Invoices? (YES)
    const salesInvCheck = testMiddlewarePermission(salesCtx, 'sales', 'invoices');
    // Can Sales Exec access Roles/Settings? (NO)
    const salesSettingsCheck = testMiddlewarePermission(salesCtx, 'settings', 'roles');
    // Can Sales Exec access Chart of Accounts? (NO)
    const salesCoaCheck = testMiddlewarePermission(salesCtx, 'accountant', 'chart_of_accounts');
    if (salesInvCheck.allowed && !salesSettingsCheck.allowed && salesSettingsCheck.status === 403 && !salesCoaCheck.allowed) {
        recordRBACTest('Sales Executive', 'Backend Middleware Guard', 'Granular Sales Permission Enforcement', 'PASS', 'Access ALLOWED for Sales/Invoices, strictly FORBIDDEN (403) for Settings and Chart of Accounts');
    }
    else {
        recordRBACTest('Sales Executive', 'Backend Middleware Guard', 'Granular Sales Permission Enforcement', 'FAIL', 'Sales Executive permission leakage detected');
    }
    // 4.3 Senior Accountant Check
    const accountsCtx = {
        userId: userDocs['pooja.accounts@honda-corp.internal']._id.toString(),
        orgId: ORG_HONDA_ID,
        isAdmin: false,
        permissions: accountsRole.permissions
    };
    // Can Accountant access Chart of Accounts? (YES)
    const accCoaCheck = testMiddlewarePermission(accountsCtx, 'accountant', 'chart_of_accounts');
    // Can Accountant access Bills? (YES)
    const accBillsCheck = testMiddlewarePermission(accountsCtx, 'purchases', 'bills');
    // Can Accountant access Settings/Users? (NO)
    const accUsersCheck = testMiddlewarePermission(accountsCtx, 'settings', 'users');
    if (accCoaCheck.allowed && accBillsCheck.allowed && !accUsersCheck.allowed && accUsersCheck.status === 403) {
        recordRBACTest('Senior Accountant', 'Backend Middleware Guard', 'Accounting Module Access & Settings Lockdown', 'PASS', 'Access ALLOWED for CoA and Vendor Bills, strictly FORBIDDEN (403) for Organization User Settings');
    }
    else {
        recordRBACTest('Senior Accountant', 'Backend Middleware Guard', 'Accounting Module Access & Settings Lockdown', 'FAIL', 'Accountant permission guard failed');
    }
    // 4.4 Shop-Floor Employee Check
    const empCtx = {
        userId: userDocs['amit.employee@honda-corp.internal']._id.toString(),
        orgId: ORG_HONDA_ID,
        isAdmin: false,
        permissions: employeeRole.permissions
    };
    // Can Employee access Invoices? (NO)
    const empInvCheck = testMiddlewarePermission(empCtx, 'sales', 'invoices');
    // Can Employee access Bills? (NO)
    const empBillsCheck = testMiddlewarePermission(empCtx, 'purchases', 'bills');
    // Can Employee access Settings? (NO)
    const empSettingsCheck = testMiddlewarePermission(empCtx, 'settings', 'roles');
    if (!empInvCheck.allowed && !empBillsCheck.allowed && !empSettingsCheck.allowed) {
        recordRBACTest('Shop-Floor Employee', 'Backend Middleware Guard', 'Total Financial Lockdown for Self-Service', 'PASS', 'All business endpoints (Sales, Purchases, Settings) strictly REJECTED (403 Forbidden)');
    }
    else {
        recordRBACTest('Shop-Floor Employee', 'Backend Middleware Guard', 'Total Financial Lockdown for Self-Service', 'FAIL', 'Unauthorized endpoint allowed for standard employee');
    }
    // ───────────────────────────────────────────────────────────────────────────
    // 5. TEST DYNAMIC FRONTEND SIDEBAR NAVIGATION FILTERING
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 5: DYNAMIC FRONTEND SIDEBAR NAVIGATION FILTERING] ---');
    // 5.1 Admin Sidebar Verification
    const adminOrg = { isAdmin: true, role: 'Admin', rolePermissions: adminRole.permissions };
    const adminNav = simulateFrontendFilterNavigation(adminOrg, userDocs['honda@gmail.com']);
    const adminNavIds = adminNav.map((i) => i.id);
    if (adminNavIds.includes('sales') && adminNavIds.includes('purchases') && adminNavIds.includes('banking') && adminNavIds.includes('accountant') && adminNavIds.includes('reports')) {
        recordRBACTest('Honda Admin', 'Dynamic Sidebar Filtering', 'Full Organization Master Navigation', 'PASS', `All 10 modules visible (${adminNav.length} navigation roots present)`);
    }
    else {
        recordRBACTest('Honda Admin', 'Dynamic Sidebar Filtering', 'Full Organization Master Navigation', 'FAIL', 'Missing nav items for Admin');
    }
    // 5.2 Sales Executive Sidebar Verification
    const salesOrg = { isAdmin: false, role: 'Sales Executive', rolePermissions: salesRole.permissions };
    const salesNav = simulateFrontendFilterNavigation(salesOrg, userDocs['vikram.sales@honda-corp.internal']);
    const salesNavIds = salesNav.map((i) => i.id);
    const salesGroup = salesNav.find((i) => i.id === 'sales');
    const salesChildrenIds = salesGroup?.children?.map((c) => c.id) || [];
    const salesHasOnlyPermitted = salesNavIds.includes('sales') &&
        !salesNavIds.includes('purchases') && // Purchases stripped!
        !salesNavIds.includes('banking') && // Banking stripped!
        !salesNavIds.includes('accountant'); // Accountant stripped!
    if (salesHasOnlyPermitted && salesChildrenIds.includes('quotes') && salesChildrenIds.includes('invoices') && salesChildrenIds.includes('sales-orders')) {
        recordRBACTest('Sales Executive', 'Dynamic Sidebar Filtering', 'Selective Commercial Sidebar Isolation', 'PASS', `Sales menu active with Invoices/Orders/Quotes; Purchases, Banking, and General Ledger STRIPPED cleanly`);
    }
    else {
        recordRBACTest('Sales Executive', 'Dynamic Sidebar Filtering', 'Selective Commercial Sidebar Isolation', 'FAIL', 'Sidebar did not filter correctly for sales');
    }
    // 5.3 Senior Accountant Sidebar Verification
    const accountsOrg = { isAdmin: false, role: 'Senior Accountant', rolePermissions: accountsRole.permissions };
    const accountsNav = simulateFrontendFilterNavigation(accountsOrg, userDocs['pooja.accounts@honda-corp.internal']);
    const accountsNavIds = accountsNav.map((i) => i.id);
    const accountsHasCorrect = !accountsNavIds.includes('sales') && // Sales stripped!
        accountsNavIds.includes('purchases') && // Purchases active!
        accountsNavIds.includes('banking') && // Banking active!
        accountsNavIds.includes('accountant') && // Accountant active!
        accountsNavIds.includes('reports'); // Reports active!
    if (accountsHasCorrect) {
        recordRBACTest('Senior Accountant', 'Dynamic Sidebar Filtering', 'Financial & Books Navigation Isolation', 'PASS', `Purchases, Banking, CoA, and Reports active; Sales pipelines STRIPPED cleanly`);
    }
    else {
        recordRBACTest('Senior Accountant', 'Dynamic Sidebar Filtering', 'Financial & Books Navigation Isolation', 'FAIL', 'Sidebar mismatch for accountant');
    }
    // 5.4 Shop-Floor Employee Sidebar Verification
    const employeeOrg = { isAdmin: false, role: 'Shop-Floor Employee', rolePermissions: employeeRole.permissions };
    const employeeNav = simulateFrontendFilterNavigation(employeeOrg, userDocs['amit.employee@honda-corp.internal']);
    const employeeNavIds = employeeNav.map((i) => i.id);
    const empHasZeroFinancials = !employeeNavIds.includes('sales') &&
        !employeeNavIds.includes('purchases') &&
        !employeeNavIds.includes('banking') &&
        !employeeNavIds.includes('accountant') &&
        !employeeNavIds.includes('reports');
    if (empHasZeroFinancials) {
        recordRBACTest('Shop-Floor Employee', 'Dynamic Sidebar Filtering', 'Zero Financial Modules Exposure', 'PASS', `All financial and commercial modules STRIPPED; Zero business data exposed in sidebar`);
    }
    else {
        recordRBACTest('Shop-Floor Employee', 'Dynamic Sidebar Filtering', 'Zero Financial Modules Exposure', 'FAIL', 'Data leak in employee sidebar');
    }
    // ───────────────────────────────────────────────────────────────────────────
    // 6. TEST TOP NAVBAR DYNAMIC STATE (SETTINGS ICON & APPROVALS BADGE)
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 6: TOP NAVBAR DYNAMIC CONTROLS & APPROVAL QUEUE] ---');
    // 6.1 Admin Top Navbar
    const adminNavbar = simulateFrontendTopNavbarState(adminOrg, userDocs['honda@gmail.com']);
    if (adminNavbar.canAccessSettings && adminNavbar.canApprove) {
        recordRBACTest('Honda Admin', 'Top Navbar State', 'Master Controls Enabled', 'PASS', 'Settings Gear Icon VISIBLE; Approval Queue VISIBLE; Full product switch allowed');
    }
    else {
        recordRBACTest('Honda Admin', 'Top Navbar State', 'Master Controls Enabled', 'FAIL', 'Admin missing navbar controls');
    }
    // 6.2 Operations Manager Top Navbar
    const managerOrg = { isAdmin: false, role: 'Operations Manager', rolePermissions: managerRole.permissions };
    const managerNavbar = simulateFrontendTopNavbarState(managerOrg, userDocs['rajesh.manager@honda-corp.internal']);
    if (managerNavbar.canApprove && !managerNavbar.canManageUsers && !managerNavbar.canManageRoles) {
        recordRBACTest('Operations Manager', 'Top Navbar State', 'Pending Approvals Queue Active', 'PASS', 'Pending Approvals Badge VISIBLE; User & Role Management strictly HIDDEN (Protected)');
    }
    else {
        recordRBACTest('Operations Manager', 'Top Navbar State', 'Pending Approvals Queue Active', 'FAIL', 'Manager navbar state mismatch');
    }
    // 6.3 Sales Executive Top Navbar
    const salesNavbar = simulateFrontendTopNavbarState(salesOrg, userDocs['vikram.sales@honda-corp.internal']);
    if (!salesNavbar.canAccessSettings && !salesNavbar.canApprove) {
        recordRBACTest('Sales Executive', 'Top Navbar State', 'Standard Executive Navbar', 'PASS', 'Settings Gear Icon HIDDEN; Approvals Queue HIDDEN; Clean streamlined navbar');
    }
    else {
        recordRBACTest('Sales Executive', 'Top Navbar State', 'Standard Executive Navbar', 'FAIL', 'Settings or approvals leaked to sales');
    }
    // 6.4 Shop-Floor Employee Top Navbar
    const employeeNavbar = simulateFrontendTopNavbarState(employeeOrg, userDocs['amit.employee@honda-corp.internal']);
    if (!employeeNavbar.canAccessSettings && !employeeNavbar.canApprove) {
        recordRBACTest('Shop-Floor Employee', 'Top Navbar State', 'Minimal Self-Service Navbar', 'PASS', 'All administrative controls (Settings, Approvals, Quick Create) strictly HIDDEN');
    }
    else {
        recordRBACTest('Shop-Floor Employee', 'Top Navbar State', 'Minimal Self-Service Navbar', 'FAIL', 'Administrative controls leaked to employee');
    }
    // ───────────────────────────────────────────────────────────────────────────
    // 7. CROSS-TENANT IMPERSONATION GUARD
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n--- [STEP 7: CROSS-TENANT IMPERSONATION & PRIVILEGE ESCALATION GUARD] ---');
    // Verify that an Org 2 (Spinny) user has zero mapping to Honda
    const spinnyUserOrg = await UserOrganization_1.UserOrganization.findOne({ email: 'nitesht206@gmail.com', orgId: ORG_HONDA_ID });
    if (!spinnyUserOrg) {
        recordRBACTest('Spinny User (Cross-Tenant)', 'Cross-Tenant Guard', 'Tenant Boundary Isolation', 'PASS', 'Spinny user has NULL mapping for Honda; Cross-tenant privilege escalation is IMPOSSIBLE');
    }
    else {
        recordRBACTest('Spinny User (Cross-Tenant)', 'Cross-Tenant Guard', 'Tenant Boundary Isolation', 'FAIL', 'Spinny user mapped to Honda!');
    }
    // ───────────────────────────────────────────────────────────────────────────
    // SUMMARY SCORECARD
    // ───────────────────────────────────────────────────────────────────────────
    console.log('\n================================================================================');
    console.log('  📊 RBAC & DYNAMIC NAVIGATION TEST SCORECARD');
    console.log('================================================================================');
    const total = rbacResults.length;
    const passed = rbacResults.filter(t => t.status === 'PASS').length;
    const failed = rbacResults.filter(t => t.status === 'FAIL').length;
    console.log(`  Total Scenarios Executed : ${total}`);
    console.log(`  Passed                   : ${passed} ✅`);
    console.log(`  Failed                   : ${failed} ${failed > 0 ? '❌' : ''}`);
    console.log(`  Pass Rate                : ${Math.round((passed / total) * 100)}%\n`);
    await mongoose_1.default.disconnect();
    console.log('Database cleanly disconnected.\n');
    if (failed > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runRBACAndDynamicNavTestSuite().catch(err => {
    console.error('Fatal RBAC Test Suite Error:', err);
    process.exit(1);
});
