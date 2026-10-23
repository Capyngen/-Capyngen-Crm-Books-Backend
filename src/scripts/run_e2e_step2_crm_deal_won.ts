import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const SPINNY_ID_STR = '6aa797278d301b4735f1d322';
const SPINNY_ID_OBJ = new mongoose.Types.ObjectId(SPINNY_ID_STR);

async function runStep2() {
  console.log('====================================================');
  console.log('🚀 STEP 2: CRM DEAL WON ➔ CUSTOMER PROVISIONING ➔ DRAFT QUOTE');
  console.log(`Target Tenant: Spinny (${SPINNY_ID_STR})`);
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI || '');
  const db = mongoose.connection.db!;

  // 1. Sales Executive Rahul Sharma triggers Deal Won
  const dealName = 'Spinny Fleet Telematics 100-Vehicle Solution';
  const dealAmount = 150000;
  const clientName = 'Apex Logistics India Pvt Ltd';
  const clientEmail = 'billing@apexlogistics.in';
  const clientPhone = '+91 98110 54321';

  console.log(`Sales Executive (Rahul Sharma) closed Deal: "${dealName}" for ₹${dealAmount.toLocaleString('en-IN')}`);

  // Auto-provision Customer in Spinny
  const customerId = new mongoose.Types.ObjectId();
  const customerDoc = {
    _id: customerId,
    displayName: clientName,
    companyName: clientName,
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
    currency: 'INR',
    paymentTerms: 'Net 30',
    billingAddress: {
      street: 'Plot 45, Udyog Vihar Phase 4',
      city: 'Gurgaon',
      state: 'Haryana',
      zipCode: '122016',
      country: 'India'
    },
    shippingAddress: {
      street: 'Plot 45, Udyog Vihar Phase 4',
      city: 'Gurgaon',
      state: 'Haryana',
      zipCode: '122016',
      country: 'India'
    },
    receivables: 0,
    unusedCredits: 0,
    status: 'Active',
    companyId: SPINNY_ID_OBJ,
    orgId: SPINNY_ID_STR,
    source: 'CRM_DEAL_WON',
    dealName,
    salesExecutive: 'Rahul Sharma (EMP-001)',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert into both bookscustomers and customers
  await db.collection('bookscustomers').insertOne(customerDoc);
  await db.collection('customers').insertOne(customerDoc);
  console.log(`✅ Customer Auto-Provisioned: "${clientName}" (_id: ${customerId})`);
  console.log(`   Source: CRM Deal Won | Assigned Rep: Rahul Sharma (EMP-001)`);

  // 2. Auto-Generate Draft Quote in Billing Quotes
  const quoteId = new mongoose.Types.ObjectId();
  const quoteNumber = 'QUO-CRM-001';
  const quoteDoc = {
    _id: quoteId,
    quoteNumber,
    customer: customerId,
    customerId,
    customerName: clientName,
    quoteDate: new Date('2026-10-22'),
    expiryDate: new Date('2026-11-21'),
    referenceNumber: 'DEAL-WON-SPINNY-9901',
    subject: dealName,
    salesperson: 'Rahul Sharma (EMP-001)',
    subTotal: 127118.64,
    taxTotal: 22881.36,
    total: dealAmount, // ₹1,50,000 (Incl 18% GST)
    amount: dealAmount,
    status: 'Draft', // Strictly Draft state
    approvalStatus: 'Draft',
    sentStatus: 'Not Sent',
    currency: 'INR',
    items: [
      {
        item: new mongoose.Types.ObjectId(),
        name: 'Spinny Telematics OBD-II GPS Tracker (100 units)',
        description: 'CAN-bus real-time telemetry hardware with 1-year cellular sim connectivity',
        quantity: 100,
        rate: 1271.1864,
        taxRate: 18,
        taxAmount: 22881.36,
        amount: 150000
      }
    ],
    terms: 'Payment 50% advance on Order confirmation, 50% on shipment delivery.',
    notes: 'Generated automatically from CRM Deal Won handover.',
    companyId: SPINNY_ID_OBJ,
    orgId: SPINNY_ID_STR,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('quotes').insertOne(quoteDoc);
  console.log(`✅ Draft Quote Generated in Billing: #${quoteDoc.quoteNumber} (Amount: ₹${dealAmount.toLocaleString('en-IN')})`);
  console.log(`   Initial Status: ${quoteDoc.status} | Sent Status: ${quoteDoc.sentStatus}`);
  console.log(`   Customer Attached: ${clientName} (${customerDoc.email})`);

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('🎉 STEP 2 COMPLETED SUCCESSFULLY WITH ZERO ERRORS!');
  console.log('====================================================');
}

runStep2().catch(err => {
  console.error('Step 2 Failed:', err);
  process.exit(1);
});
