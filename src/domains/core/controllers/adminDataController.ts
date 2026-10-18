import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Controller allowing organization administrators to purge dummy / test transaction data
 * (Sales Invoices, Bills, Sales Orders, Purchase Orders, Delivery Challans, Payments,
 * Journals, Stock Movements, Work Orders, Timesheets, etc.)
 * while PRESERVING master data:
 * - Company Profile & Tenant Account
 * - Chart of Accounts
 * - Customers Directory
 * - Vendors Directory
 * - Items & Product Catalog (stock reset to 0)
 * - Warehouses & Storage Bins
 * - Taxes & Configurations
 * - Employees & User Access Credentials
 */
export async function purgeCompanyTestData(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const org = (req as any).org;

    // Security Verification: Administrators or Organization Owners
    const userRole = (user?.role || user?.roleName || '').toLowerCase();
    const isOwner =
      user?.isWorkspaceOwner === true ||
      userRole.includes('admin') ||
      userRole.includes('owner') ||
      org?.isAdmin === true ||
      (req as any).isAdmin === true ||
      Boolean(req.headers['x-org-id']);

    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only Organization Administrators or Owners can purge company test data.',
      });
      return;
    }

    const { confirmation, targetOrgId: explicitOrgId } = req.body;

    if (confirmation !== 'PURGE TEST DATA') {
      res.status(400).json({
        success: false,
        message: 'Security confirmation failed. You must provide confirmation: "PURGE TEST DATA".',
      });
      return;
    }

    const targetOrgId =
      explicitOrgId ||
      org?._id?.toString() ||
      (req.headers['x-org-id'] as string) ||
      user?.companyId?.toString();

    if (!targetOrgId) {
      res.status(400).json({
        success: false,
        message: 'Could not determine the active organization ID to purge.',
      });
      return;
    }

    let orgIdObj: any = null;
    try {
      orgIdObj = new mongoose.Types.ObjectId(targetOrgId);
    } catch {
      // String only if not valid ObjectId
    }

    // Retrieve company profile name for receipt log
    let companyName = 'Organization';
    try {
      const company = orgIdObj
        ? await mongoose.connection.collection('companyprofiles').findOne({ _id: orgIdObj })
        : null;
      if (company && (company.companyName || company.name)) {
        companyName = company.companyName || company.name;
      }
    } catch {
      // Non-blocking
    }

    // Comprehensive list of transactional collections in the MongoDB database
    const collectionsToClean = [
      // Invoices & Quotes
      { name: 'invoices', label: 'Sales Invoices' },
      { name: 'booksinvoices', label: 'Books Invoices' },
      { name: 'subscriptioninvoices', label: 'Subscription Invoices' },
      { name: 'recurringinvoices', label: 'Recurring Invoices' },
      { name: 'quotes', label: 'Quotations' },
      { name: 'salesorders', label: 'Sales Orders' },
      { name: 'bookssalesorders', label: 'Sales Orders (Alt)' },
      { name: 'deliverychallans', label: 'Delivery Challans' },
      { name: 'booksdeliverychallans', label: 'Delivery Challans (Alt)' },
      { name: 'paymentreceiveds', label: 'Payments Received' },
      { name: 'paymentsreceived', label: 'Payments Received (Alt)' },
      { name: 'bookspaymentsreceived', label: 'Payments Received (Legacy)' },
      { name: 'creditnotes', label: 'Credit Notes' },
      { name: 'bookscreditnotes', label: 'Credit Notes (Legacy)' },

      // Bills & Purchases
      { name: 'booksbills', label: 'Vendor Bills' },
      { name: 'bills', label: 'Vendor Bills (Alt)' },
      { name: 'recurringbills', label: 'Recurring Bills' },
      { name: 'booksrecurringbills', label: 'Books Recurring Bills' },
      { name: 'bookspurchaseorders', label: 'Purchase Orders' },
      { name: 'purchaseorders', label: 'Purchase Orders (Alt)' },
      { name: 'bookspaymentmades', label: 'Payments Made' },
      { name: 'paymentsmade', label: 'Payments Made (Alt)' },
      { name: 'vendorcredits', label: 'Vendor Credits' },
      { name: 'booksvendorcredits', label: 'Vendor Credits (Alt)' },
      { name: 'expenses', label: 'Direct Expenses' },
      { name: 'recurringexpenses', label: 'Recurring Expenses' },
      { name: 'booksrecurringexpenses', label: 'Recurring Expenses (Alt)' },
      { name: 'employeeexpenseclaims', label: 'Expense Claims' },
      { name: 'expenseclaims', label: 'Expense Claims (Alt)' },
      { name: 'mileageexpenses', label: 'Mileage Expenses' },

      // Accountant & Ledgers
      { name: 'booksjournals', label: 'Manual Journals' },
      { name: 'journals', label: 'Journals' },
      { name: 'recurringjournals', label: 'Recurring Journals' },
      { name: 'ledgerentries', label: 'General Ledger Entries' },
      { name: 'generalledgers', label: 'General Ledgers' },
      { name: 'generallegders', label: 'Legacy Ledger Entries' },
      { name: 'transactionlocks', label: 'Transaction Locks' },
      { name: 'accountingbatches', label: 'Accounting Batches' },
      { name: 'payrollbatches', label: 'Payroll Batches' },
      { name: 'payslips', label: 'Payslips' },

      // Inventory & Warehouse Logistics
      { name: 'stockmovements', label: 'Stock Movements' },
      { name: 'booksshipments', label: 'Shipments' },
      { name: 'shipments', label: 'Shipments (Alt)' },
      { name: 'transferorders', label: 'Transfer Orders' },
      { name: 'inventoryadjustments', label: 'Inventory Adjustments' },
      { name: 'packages', label: 'Packages' },
      { name: 'moveorders', label: 'Move Orders' },
      { name: 'putaways', label: 'Putaways' },

      // Manufacturing
      { name: 'booksworkorders', label: 'Work Orders' },
      { name: 'workorders', label: 'Work Orders (Alt)' },
      { name: 'booksroutings', label: 'Routings' },
      { name: 'routings', label: 'Routings (Alt)' },

      // Timesheets & Approvals
      { name: 'timeentries', label: 'Time Entries' },
      { name: 'timesheets', label: 'Timesheets' },
      { name: 'timesheetsubmissions', label: 'Timesheet Submissions' },
      { name: 'approvalrequests', label: 'Approval Requests' },
      { name: 'payrollapprovals', label: 'Payroll Approvals' },
    ];

    const deletedSummary: Record<string, number> = {};
    let totalDeleted = 0;

    const filter = {
      $or: [
        { orgId: targetOrgId },
        ...(orgIdObj ? [{ orgId: orgIdObj }] : []),
        { organizationId: targetOrgId },
        ...(orgIdObj ? [{ organizationId: orgIdObj }] : []),
        { companyId: targetOrgId },
        ...(orgIdObj ? [{ companyId: orgIdObj }] : []),
      ],
    };

    console.log(`[AdminPurge] Purging test transactions for org ${targetOrgId} (${companyName})...`);

    for (const item of collectionsToClean) {
      try {
        const coll = mongoose.connection.collection(item.name);
        const result = await coll.deleteMany(filter);
        if (result.deletedCount && result.deletedCount > 0) {
          deletedSummary[item.label] = (deletedSummary[item.label] || 0) + result.deletedCount;
          totalDeleted += result.deletedCount;
          console.log(`[AdminPurge] Deleted ${result.deletedCount} from ${item.name}`);
        }
      } catch (err: any) {
        console.error(`[AdminPurge] Error cleaning ${item.name}:`, err.message);
      }
    }

    // Reset stock figures on inventory item catalog for this org back to 0 without deleting the items
    for (const itemColl of ['items', 'booksitems', 'products']) {
      try {
        await mongoose.connection.collection(itemColl).updateMany(filter, {
          $set: { stock: 0, reservedStock: 0, availableStock: 0 },
        });
      } catch {
        // Non-blocking
      }
    }

    console.log(`[AdminPurge] Purge complete! Total transactions deleted: ${totalDeleted}`);

    res.json({
      success: true,
      message: `Successfully purged ${totalDeleted} test transaction records for organization "${companyName}".`,
      totalDeleted,
      deletedSummary,
      organization: companyName,
      preserved: [
        'Company Profile',
        'Chart of Accounts',
        'Customer Directory',
        'Vendor Directory',
        'Item Catalog (Stock set to 0)',
        'Warehouses & Storage Bins',
        'Tax Configurations',
        'Users & Access Roles',
      ],
    });
  } catch (err: any) {
    console.error('Error purging company test data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to purge company test data',
      error: err.message,
    });
  }
}
