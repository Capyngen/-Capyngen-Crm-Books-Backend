import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { eventBus, EVENTS } from '../src/core/events/eventBus';
import '../src/domains/books/listeners/journalListeners';
import { Journal } from '../src/domains/books/models/Journal';

dotenv.config();

async function runTest() {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority');
  console.log('Connected.');

  const companyId = new mongoose.Types.ObjectId().toString();

  // Test Invoice -> Journal Creation
  const mockInvoice = {
    invoiceNumber: 'TEST-INV-001',
    invoiceDate: new Date(),
    customer: new mongoose.Types.ObjectId().toString(),
    total: 1500.50
  };

  console.log('Emitting INVOICE_CREATED...');
  try {
    await eventBus.emitAsync(EVENTS.INVOICE_CREATED, { invoice: mockInvoice, companyId });
    console.log('Event processed successfully.');

    // Verify in DB
    const createdJournal = await Journal.findOne({ referenceNumber: 'TEST-INV-001', orgId: companyId });
    if (createdJournal) {
      console.log('SUCCESS! Journal created for Invoice:', createdJournal.journalNumber);
      console.log('Total Debits:', createdJournal.lineItems.find(l => l.account === 'Accounts Receivable')?.debits);
      console.log('Total Credits:', createdJournal.lineItems.find(l => l.account === 'Sales Revenue')?.credits);
      
      // Math validation test
      if (createdJournal.total === 1500.50) {
        console.log('Double-Entry Math Verified: PASS');
      } else {
        console.log('Double-Entry Math Verified: FAIL');
      }
    } else {
      console.log('FAILED! Journal not found.');
    }
  } catch (error) {
    console.error('FAILED with error:', error);
  }

  process.exit(0);
}

runTest();
