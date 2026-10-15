import { Request, Response } from 'express';
import BooksDocument from '../models/Document';
import Expense from '../models/Expense';
import Bill from '../../inventory/models/Bill';
import Invoice from '../../billing/models/Invoice';

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        const tenantFilter = orgId ? { $or: [{ orgId }, { companyId: orgId }] } : {};

        const moduleType = (req.query.module as string) || 
            (req.baseUrl.includes('billing') ? 'billing' : req.baseUrl.includes('inventory') ? 'inventory' : 'books');

        const moduleQuery = moduleType === 'books' 
            ? { $or: [{ module: 'books' }, { module: { $exists: false } }] }
            : { module: moduleType };

        const docs = await BooksDocument.find({ ...tenantFilter, ...moduleQuery }).sort({ createdAt: -1 }).lean();

        const existingNames = new Set(docs.map((d: any) => d.name));
        const autoSyncedDocs: any[] = [];

        let standardFolders = ['All Documents', 'Inbox', 'Bills', 'Receipts', 'Expenses', 'Bank Statements', 'Contracts'];

        if (moduleType === 'billing') {
            standardFolders = [
                'All Documents', 
                'Invoices & Receipts', 
                'Customer Contracts', 
                'Subscription Agreements', 
                'Payment Proofs', 
                'Tax Certificates'
            ];
            try {
                const invoices = await Invoice.find({ 
                    ...tenantFilter, 
                    $or: [{ attachments: { $exists: true, $ne: [] } }, { fileUrl: { $exists: true, $ne: '' } }] 
                }).lean();
                invoices.forEach((inv: any) => {
                    const atts = Array.isArray(inv.attachments) ? inv.attachments : (inv.fileUrl ? [inv.fileUrl] : []);
                    atts.forEach((url: string, idx: number) => {
                        const name = url.split('/').pop() || `Invoice_${inv.invoiceNumber || inv._id}_${idx + 1}.pdf`;
                        if (!existingNames.has(name)) {
                            existingNames.add(name);
                            autoSyncedDocs.push({
                                _id: `auto_inv_${inv._id}_${idx}`,
                                name,
                                type: name.endsWith('.jpg') || name.endsWith('.png') ? 'Image' : 'PDF',
                                folder: 'Invoices & Receipts',
                                size: '280 KB',
                                fileUrl: url,
                                status: 'Converted to Bill',
                                amount: inv.totalAmount || inv.total || 0,
                                createdAt: inv.createdAt || inv.invoiceDate || new Date()
                            });
                        }
                    });
                });
            } catch (err) {
                // Ignore if Invoice model query fails
            }
        } else if (moduleType === 'inventory') {
            standardFolders = [
                'All Documents', 
                'Purchase Orders & GRN', 
                'Delivery Challans', 
                'Shipping & Carrier Slips', 
                'Warehouse Slips', 
                'Vendor Invoices', 
                'Inspection & QC Reports'
            ];
        } else {
            // Books
            try {
                const [bills, expenses] = await Promise.all([
                    Bill.find({ ...tenantFilter, $or: [{ attachments: { $exists: true, $ne: [] } }, { receiptUrl: { $exists: true, $ne: '' } }] }).lean(),
                    Expense.find({ ...tenantFilter, receiptUrl: { $exists: true, $ne: '' } }).lean()
                ]);

                bills.forEach((b: any) => {
                    const atts = Array.isArray(b.attachments) ? b.attachments : (b.receiptUrl ? [b.receiptUrl] : []);
                    atts.forEach((url: string, idx: number) => {
                        const name = url.split('/').pop() || `Bill_${b.billNumber || b._id}_${idx + 1}.pdf`;
                        if (!existingNames.has(name)) {
                            existingNames.add(name);
                            autoSyncedDocs.push({
                                _id: `auto_bill_${b._id}_${idx}`,
                                name,
                                type: name.endsWith('.jpg') || name.endsWith('.png') ? 'Image' : 'PDF',
                                folder: 'Bills',
                                size: '350 KB',
                                fileUrl: url,
                                status: 'Converted to Bill',
                                amount: b.totalAmount || 0,
                                createdAt: b.createdAt || b.billDate || new Date()
                            });
                        }
                    });
                });

                expenses.forEach((e: any) => {
                    if (e.receiptUrl) {
                        const name = e.receiptUrl.split('/').pop() || `Expense_Receipt_${e._id}.jpg`;
                        if (!existingNames.has(name)) {
                            existingNames.add(name);
                            autoSyncedDocs.push({
                                _id: `auto_exp_${e._id}`,
                                name,
                                type: name.endsWith('.pdf') ? 'PDF' : 'Image',
                                folder: 'Expenses',
                                size: '220 KB',
                                fileUrl: e.receiptUrl,
                                status: 'Converted to Expense',
                                amount: e.totalAmount || e.amount || 0,
                                createdAt: e.createdAt || e.date || new Date()
                            });
                        }
                    }
                });
            } catch (err) {
                // Ignore auto-sync err
            }
        }

        const allDocs = [...docs, ...autoSyncedDocs];

        // Unique folders
        const customFolders = allDocs.map((d: any) => d.folder).filter(f => f && !standardFolders.includes(f));
        const allFolders = Array.from(new Set([...standardFolders, ...customFolders]));

        // Calculate total storage bytes
        let totalStorageBytes = 0;
        docs.forEach((d: any) => {
            totalStorageBytes += (d.fileSizeInBytes || 250000);
        });

        res.json({
            success: true,
            data: allDocs.map((d: any) => ({
                id: d._id.toString(),
                name: d.name,
                type: d.type || 'Other',
                folder: d.folder || standardFolders[1] || 'Inbox',
                size: d.size || '150 KB',
                date: (d.createdAt ? new Date(d.createdAt) : new Date()).toISOString().split('T')[0],
                status: d.status || 'Unprocessed',
                amount: d.amount,
                fileUrl: d.fileUrl || ''
            })),
            folders: allFolders,
            totalCount: allDocs.length,
            storageUsedBytes: totalStorageBytes
        });
    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ success: false, message: 'Server error fetching documents' });
    }
};

export const createDocument = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        if (!orgId) return res.status(401).json({ success: false, message: 'Missing organization context' });

        const moduleType = (req.body.module as string) || 
            (req.baseUrl.includes('billing') ? 'billing' : req.baseUrl.includes('inventory') ? 'inventory' : 'books');

        const { name, type, folder, size, fileSizeInBytes, fileUrl, amount, status } = req.body;
        
        let docType = type || 'Other';
        if (name && !type) {
            if (name.endsWith('.pdf')) docType = 'PDF';
            else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(name)) docType = 'Image';
            else if (/\.(xlsx|xls|csv)$/i.test(name)) docType = 'Spreadsheet';
        }

        const defaultFolder = moduleType === 'billing' ? 'Invoices & Receipts' : moduleType === 'inventory' ? 'Purchase Orders & GRN' : 'Inbox';

        const newDoc = await BooksDocument.create({
            orgId,
            module: moduleType,
            name: name || `Doc_${Date.now()}`,
            type: docType,
            folder: folder || defaultFolder,
            size: size || '100 KB',
            fileSizeInBytes: fileSizeInBytes || 102400,
            fileUrl: fileUrl || '',
            amount: amount ? Number(amount) : undefined,
            status: status || 'Unprocessed',
            createdBy: (req as any).user?._id || 'User'
        });

        res.status(201).json({
            success: true,
            data: {
                id: newDoc._id.toString(),
                name: newDoc.name,
                type: newDoc.type,
                folder: newDoc.folder,
                size: newDoc.size,
                date: new Date(newDoc.createdAt).toISOString().split('T')[0],
                status: newDoc.status,
                amount: newDoc.amount,
                fileUrl: newDoc.fileUrl
            }
        });
    } catch (error) {
        console.error("Create Document Error:", error);
        res.status(500).json({ success: false, message: 'Failed to create document' });
    }
};

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        const { id } = req.params;
        const tenantFilter = orgId ? { _id: id, $or: [{ orgId }, { companyId: orgId }] } : { _id: id };

        const updated = await BooksDocument.findOneAndUpdate(
            tenantFilter,
            { $set: req.body },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update Document Error:", error);
        res.status(500).json({ success: false, message: 'Failed to update document' });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const orgId = (req as any).org?._id;
        const { id } = req.params;
        const tenantFilter = orgId ? { _id: id, $or: [{ orgId }, { companyId: orgId }] } : { _id: id };

        await BooksDocument.findOneAndDelete(tenantFilter);
        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error("Delete Document Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete document' });
    }
};
