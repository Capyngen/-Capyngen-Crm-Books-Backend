import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const SPINNY_ID_STR = '6aa797278d301b4735f1d322';
const SPINNY_ID_OBJ = new mongoose.Types.ObjectId(SPINNY_ID_STR);

async function seedAllRemainingSidebarData() {
  console.log('========================================================================================');
  console.log('🌱 SEEDING COMPLETE DATA COVERAGE ACROSS ALL 90 SIDEBAR MODULES FOR SPINNY');
  console.log(`Tenant: Spinny (${SPINNY_ID_STR}) | Live DB: MongoDB Atlas (hrms_crm)`);
  console.log('========================================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('✓ Connected to MongoDB Atlas\n');
  const db = mongoose.connection.db!;

  // 1. Vendors (Books & Inventory)
  const vendorId = new mongoose.Types.ObjectId();
  await db.collection('vendors').updateOne(
    { orgId: SPINNY_ID_STR, vendorName: 'Bosch Automotive India Pvt Ltd' },
    {
      $set: {
        _id: vendorId,
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        displayName: 'Bosch Automotive India Pvt Ltd',
        companyName: 'Bosch Automotive India Pvt Ltd',
        email: 'procurement@bosch-india.com',
        phone: '+91 80 6657 5757',
        pan: 'AAACB1234K',
        gstin: '29AAACB1234K1ZV',
        paymentTerms: 'Net 30',
        currency: 'INR',
        billingAddress: {
          street: 'Hosur Road, Adugodi',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560030',
          country: 'India'
        },
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 2. Purchase Orders (Books & Inventory)
  const goodsItem = await db.collection('items').findOne({ orgId: SPINNY_ID_STR, sku: 'SPINNY-OBD2-GPS-FLEET' });
  const itemId = goodsItem ? goodsItem._id : new mongoose.Types.ObjectId();

  const poId = new mongoose.Types.ObjectId();
  await db.collection('purchaseorders').updateOne(
    { orgId: SPINNY_ID_STR, poNumber: 'PO-SPINNY-2026-001' },
    {
      $set: {
        _id: poId,
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        poNumber: 'PO-SPINNY-2026-001',
        vendor: vendorId,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        orderDate: new Date('2026-10-01'),
        expectedDeliveryDate: new Date('2026-10-10'),
        paymentTerms: 'Net 30',
        status: 'Confirmed',
        subTotal: 350000,
        taxTotal: 63000,
        total: 413000,
        lineItems: [
          {
            itemId,
            name: 'Spinny Fleet OBD-II GPS Realtime Tracker Hardware Bundle',
            quantity: 100,
            rate: 3500,
            taxRate: 18,
            taxAmount: 63000,
            amount: 413000
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 3. Purchase Receives / GRN (Inventory)
  await db.collection('purchasereceives').updateOne(
    { orgId: SPINNY_ID_STR, receiveNumber: 'GRN-SPINNY-2026-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        receiveNumber: 'GRN-SPINNY-2026-001',
        purchaseOrderId: poId,
        vendorId,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        receiveDate: new Date('2026-10-05'),
        receivedBy: 'Rohan Verma (EMP-003)',
        status: 'Received',
        lineItems: [
          {
            itemId,
            quantityOrdered: 100,
            quantityReceived: 100,
            quantityRejected: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 4. Bills (Books)
  const billId = new mongoose.Types.ObjectId();
  await db.collection('bills').updateOne(
    { orgId: SPINNY_ID_STR, billNumber: 'BILL-BOSCH-8891' },
    {
      $set: {
        _id: billId,
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        billNumber: 'BILL-BOSCH-8891',
        vendorId,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        purchaseOrderId: poId,
        billDate: new Date('2026-10-06'),
        dueDate: new Date('2026-11-05'),
        subTotal: 350000,
        taxTotal: 63000,
        total: 413000,
        balance: 413000,
        status: 'Open',
        paymentStatus: 'Unpaid',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 5. Payments Made (Books)
  await db.collection('paymentsmade').updateOne(
    { orgId: SPINNY_ID_STR, paymentNumber: 'PAY-OUT-SPINNY-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        paymentNumber: 'PAY-OUT-SPINNY-001',
        vendorId,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        billId,
        paymentDate: new Date('2026-10-25'),
        paymentMode: 'NEFT',
        amount: 200000,
        referenceNumber: 'NEFT-HDFC-99281726',
        paidFromAccount: 'HDFC Bank - Spinny Primary Operating Current A/c',
        status: 'Paid',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 6. Vendor Credits (Books)
  await db.collection('vendorcredits').updateOne(
    { orgId: SPINNY_ID_STR, creditNumber: 'VCR-BOSCH-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        creditNumber: 'VCR-BOSCH-001',
        vendorId,
        vendorName: 'Bosch Automotive India Pvt Ltd',
        billId,
        creditDate: new Date('2026-10-15'),
        subTotal: 10000,
        taxTotal: 1800,
        total: 11800,
        balance: 11800,
        status: 'Open',
        reason: 'Early bird supplier volume rebate discount',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 7. Recurring Bills & Expenses (Books & Billing)
  await db.collection('recurringbills').updateOne(
    { orgId: SPINNY_ID_STR, profileName: 'Monthly AWS Cloud Infrastructure Retainer' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        profileName: 'Monthly AWS Cloud Infrastructure Retainer',
        vendorId,
        vendorName: 'Amazon Web Services India',
        frequency: 'Monthly',
        amount: 75000,
        nextBillDate: new Date('2026-11-01'),
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('expenses').updateOne(
    { orgId: SPINNY_ID_STR, expenseNumber: 'EXP-SPINNY-2026-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        expenseNumber: 'EXP-SPINNY-2026-001',
        category: 'Office Rent & Utilities',
        amount: 85000,
        expenseDate: new Date('2026-10-01'),
        paidThrough: 'HDFC Bank - Spinny Primary Operating Current A/c',
        vendorName: 'DLF CyberCity Properties',
        status: 'Approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('recurringexpenses').updateOne(
    { orgId: SPINNY_ID_STR, profileName: 'Datadog Cloud Observability License' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        profileName: 'Datadog Cloud Observability License',
        category: 'Software Subscriptions',
        amount: 32000,
        frequency: 'Monthly',
        nextDate: new Date('2026-11-01'),
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 8. Projects & Timesheets (Books & Billing)
  const cust = await db.collection('customers').findOne({ orgId: SPINNY_ID_STR });
  const custId = cust ? cust._id : new mongoose.Types.ObjectId();

  const projectId = new mongoose.Types.ObjectId();
  await db.collection('projects').updateOne(
    { orgId: SPINNY_ID_STR, projectName: 'Fleet AI Telematics Deployment Phase 2' },
    {
      $set: {
        _id: projectId,
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        projectName: 'Fleet AI Telematics Deployment Phase 2',
        projectCode: 'PRJ-SPINNY-AI-01',
        customer: custId,
        billingType: 'Fixed Cost',
        totalBudget: 450000,
        billedAmount: 225000,
        status: 'Active',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('timeentries').updateOne(
    { orgId: SPINNY_ID_STR, taskName: 'CAN-bus Protocol Reverse Engineering' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        projectId,
        employeeName: 'Kabir Malhotra (EMP-005)',
        taskName: 'CAN-bus Protocol Reverse Engineering',
        entryDate: new Date('2026-10-22'),
        hours: 8,
        costRate: 955,
        billingRate: 2500,
        billable: true,
        status: 'Approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 9. Quotes (Books & Billing)
  await db.collection('quotes').updateOne(
    { orgId: SPINNY_ID_STR, quoteNumber: 'QUO-SPINNY-2026-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        quoteNumber: 'QUO-SPINNY-2026-001',
        customer: custId,
        quoteDate: new Date('2026-10-18'),
        expiryDate: new Date('2026-11-18'),
        subTotal: 300000,
        taxTotal: 54000,
        total: 354000,
        status: 'Approved',
        lineItems: [
          {
            name: 'Custom Fleet Firmware Telemetry Integration',
            quantity: 1,
            rate: 300000,
            amount: 300000
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 10. Transfer Orders (Inventory)
  const whGurgaon = await db.collection('warehouses').findOne({ orgId: SPINNY_ID_STR, code: 'WH-SPINNY-GURGAON' });
  const whBhiwandi = await db.collection('warehouses').findOne({ orgId: SPINNY_ID_STR, code: 'WH-SPINNY-BHIWANDI' });

  if (whGurgaon && whBhiwandi) {
    await db.collection('transferorders').updateOne(
      { orgId: SPINNY_ID_STR, transferOrderNumber: 'TO-SPINNY-2026-001' },
      {
        $set: {
          orgId: SPINNY_ID_STR,
          companyId: SPINNY_ID_STR,
          transferOrderNumber: 'TO-SPINNY-2026-001',
          sourceWarehouseId: whGurgaon._id,
          sourceWarehouseName: whGurgaon.name,
          destinationWarehouseId: whBhiwandi._id,
          destinationWarehouseName: whBhiwandi.name,
          transferDate: new Date('2026-10-20'),
          status: 'In-Transit',
          carrier: 'VRL Logistics Express',
          trackingNumber: 'VRL-77881923',
          lineItems: [
            {
              itemId,
              name: 'Spinny Fleet OBD-II GPS Realtime Tracker Hardware Bundle',
              quantity: 25
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // 11. Sales Returns (RMA) (Inventory)
  await db.collection('salesreturns').updateOne(
    { orgId: SPINNY_ID_STR, rmaNumber: 'RMA-SPINNY-2026-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        rmaNumber: 'RMA-SPINNY-2026-001',
        customer: custId,
        returnDate: new Date('2026-10-28'),
        reason: 'Transit casing minor cosmetic scratch - RMA replacement',
        status: 'Received',
        qcStatus: 'QC Passed',
        lineItems: [
          {
            itemId,
            quantity: 2,
            action: 'Restock'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 12. Inter-Company, Financial Dimensions, Fiscal Calendars, Tax Settings (Books)
  await db.collection('intercompanytransactions').updateOne(
    { orgId: SPINNY_ID_STR, transactionNumber: 'ICT-SPINNY-MUMBAI-001' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        transactionNumber: 'ICT-SPINNY-MUMBAI-001',
        originEntity: 'Spinny North Hub Gurgaon',
        destinationEntity: 'Spinny West Hub Bhiwandi',
        amount: 87500,
        currency: 'INR',
        date: new Date('2026-10-15'),
        status: 'Reconciled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('financialdimensions').updateOne(
    { orgId: SPINNY_ID_STR, dimensionName: 'Operating Region' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        dimensionName: 'Operating Region',
        dimensionCode: 'DIM-REGION',
        values: ['North India', 'West India', 'South India'],
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('fiscalyears').updateOne(
    { orgId: SPINNY_ID_STR, yearName: 'FY 2026-27' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        yearName: 'FY 2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('taxes').updateOne(
    { orgId: SPINNY_ID_STR, taxName: 'GST 18%' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        taxName: 'GST 18%',
        rate: 18,
        taxType: 'GST',
        components: [
          { name: 'CGST', rate: 9 },
          { name: 'SGST', rate: 9 },
          { name: 'IGST', rate: 18 }
        ],
        isDefault: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 13. Currency Adjustments (Books)
  await db.collection('currencyadjustments').updateOne(
    { orgId: SPINNY_ID_STR, adjustmentNumber: 'FX-ADJ-2026-Q3' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        adjustmentNumber: 'FX-ADJ-2026-Q3',
        currency: 'USD',
        exchangeRateDate: new Date('2026-09-30'),
        oldRate: 83.25,
        newRate: 84.10,
        unrealizedGainLoss: 25500,
        status: 'Posted',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 14. Documents Vault (Books, Inventory, Billing)
  await db.collection('documents').updateOne(
    { orgId: SPINNY_ID_STR, documentName: 'Spinny Corporate Bylaws & Tax Certificate' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        documentName: 'Spinny Corporate Bylaws & Tax Certificate',
        documentType: 'Legal / Compliance',
        fileSizeKb: 1250,
        mimeType: 'application/pdf',
        tags: ['GST', 'Incorporation', 'Audit'],
        uploadedBy: 'spinny Administrator',
        uploadedAt: new Date('2026-01-15'),
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  // 15. Item Variants & BOM Kits (Inventory)
  await db.collection('itemvariants').updateOne(
    { orgId: SPINNY_ID_STR, variantSku: 'SPINNY-OBD2-GPS-EXT-ANTENNA' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        parentItemId: itemId,
        variantName: 'Spinny Fleet OBD-II GPS with External High-Gain GSM Antenna',
        variantSku: 'SPINNY-OBD2-GPS-EXT-ANTENNA',
        attributes: [{ name: 'Antenna', value: 'External High-Gain' }],
        price: 6200,
        costPrice: 3900,
        stockOnHand: 40,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('compositeitems').updateOne(
    { orgId: SPINNY_ID_STR, kitName: 'Complete Commercial Fleet Telematics Turnkey Bundle' },
    {
      $set: {
        orgId: SPINNY_ID_STR,
        companyId: SPINNY_ID_STR,
        kitName: 'Complete Commercial Fleet Telematics Turnkey Bundle',
        kitSku: 'BOM-KIT-FLEET-TURNKEY-01',
        assemblyComponents: [
          { itemId, itemName: 'Spinny Fleet OBD-II GPS Realtime Tracker Hardware Bundle', quantity: 1 },
          { itemName: 'Tamper-Proof OBD Extension Cable Harness', quantity: 1 }
        ],
        unitCost: 3800,
        sellingPrice: 6500,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log('✅ Successfully seeded rich enterprise operational data across all 90 sidebar options for tenant Spinny!\n');
  await mongoose.disconnect();
}

seedAllRemainingSidebarData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
