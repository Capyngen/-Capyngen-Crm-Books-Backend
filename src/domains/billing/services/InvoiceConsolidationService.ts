import mongoose from 'mongoose';
import Invoice from '../models/Invoice';

export class InvoiceConsolidationService {
    /**
     * ERP-Level Invoice Consolidation Engine.
     * Merges multiple draft/unbilled invoices into a single Consolidated invoice for corporate clients.
     */
    static async consolidateInvoices(
        customerId: string | mongoose.Types.ObjectId,
        invoiceIds: (string | mongoose.Types.ObjectId)[],
        createdBy: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Find source invoices
            const sourceInvoices = await Invoice.find({
                _id: { $in: invoiceIds },
                customer: customerId,
                status: 'Draft',
                invoiceType: { $ne: 'Consolidated' }
            }).session(session);

            if (sourceInvoices.length !== invoiceIds.length) {
                throw new Error('Some invoices could not be found, belong to a different customer, or are not in Draft state.');
            }

            if (sourceInvoices.length < 2) {
                throw new Error('At least 2 invoices are required for consolidation.');
            }

            // Aggregate items and totals
            let consolidatedItems: any[] = [];
            let totalSubTotal = 0;
            let totalTax = 0;
            let totalAdjustment = 0;
            let totalAmount = 0;
            let totalDiscount = 0;

            const consolidatedFromIds = [];

            for (const inv of sourceInvoices) {
                consolidatedItems = consolidatedItems.concat(inv.items);
                totalSubTotal += inv.subTotal;
                totalTax += inv.taxTotal || 0;
                totalAdjustment += inv.adjustment || 0;
                totalAmount += inv.total;
                totalDiscount += inv.discount || 0;
                consolidatedFromIds.push(inv._id);
            }

            // Create the new consolidated invoice
            const consolidatedInvoice = new Invoice({
                customer: customerId,
                invoiceNumber: `CONSOL-${Date.now()}`,
                invoiceDate: new Date(),
                status: 'Draft',
                invoiceType: 'Consolidated',
                items: consolidatedItems,
                subTotal: totalSubTotal,
                taxTotal: totalTax,
                adjustment: totalAdjustment,
                discount: totalDiscount,
                total: totalAmount,
                balanceDue: totalAmount,
                createdBy: createdBy,
                consolidatedFrom: consolidatedFromIds,
                notes: `Consolidated from ${sourceInvoices.length} invoices.`
            });

            await consolidatedInvoice.save({ session });

            // Mark source invoices as Void or link them securely (we'll mark them Void so they don't count towards AR twice)
            for (const inv of sourceInvoices) {
                inv.status = 'Void';
                inv.notes = (inv.notes || '') + `\nMerged into Consolidated Invoice: ${consolidatedInvoice.invoiceNumber}`;
                await inv.save({ session });
            }

            await session.commitTransaction();
            return consolidatedInvoice;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
