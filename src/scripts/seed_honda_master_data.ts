import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function seedHondaMasterData() {
  console.log('Seeding Comprehensive Interconnected Enterprise Data for HONDA...');
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const hondaId = '6abdf9a7c076b4bb072b4587';
  const hondaObjId = new mongoose.Types.ObjectId(hondaId);

  // 1. Chart of Accounts
  const accRevenueId = new mongoose.Types.ObjectId();
  const accSaaSRevenueId = new mongoose.Types.ObjectId();
  const accBankId = new mongoose.Types.ObjectId();
  const accARId = new mongoose.Types.ObjectId();
  const accAPId = new mongoose.Types.ObjectId();
  const accInvAssetId = new mongoose.Types.ObjectId();
  const accInvAdjGainId = new mongoose.Types.ObjectId();
  const accSalaryExpId = new mongoose.Types.ObjectId();
  const accEmployerPFId = new mongoose.Types.ObjectId();
  const accPFSdrId = new mongoose.Types.ObjectId();
  const accTDSId = new mongoose.Types.ObjectId();
  const accNetSalId = new mongoose.Types.ObjectId();
  const accTravelExpId = new mongoose.Types.ObjectId();
  const accDepreciationExpId = new mongoose.Types.ObjectId();
  const accAccumDeprId = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('chartofaccounts').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('chartofaccounts').insertMany([
    { _id: accRevenueId, orgId: hondaId, companyId: hondaId, accountName: 'Product Sales Revenue', accountType: 'Income', code: '4001', status: 'Active' },
    { _id: accSaaSRevenueId, orgId: hondaId, companyId: hondaId, accountName: 'SaaS Subscription Revenue', accountType: 'Income', code: '4002', status: 'Active' },
    { _id: accBankId, orgId: hondaId, companyId: hondaId, accountName: 'HDFC Corporate Current Bank', accountType: 'Bank', code: '1001', status: 'Active', balance: 10000000 },
    { _id: accARId, orgId: hondaId, companyId: hondaId, accountName: 'Trade Accounts Receivable', accountType: 'Current Asset', code: '1101', status: 'Active' },
    { _id: accAPId, orgId: hondaId, companyId: hondaId, accountName: 'Trade Accounts Payable', accountType: 'Current Liability', code: '2001', status: 'Active' },
    { _id: accInvAssetId, orgId: hondaId, companyId: hondaId, accountName: 'Inventory Raw/Finished Asset', accountType: 'Stock Asset', code: '1201', status: 'Active' },
    { _id: accInvAdjGainId, orgId: hondaId, companyId: hondaId, accountName: 'Inventory Adjustment Gain/Loss', accountType: 'Other Income', code: '4901', status: 'Active' },
    { _id: accSalaryExpId, orgId: hondaId, companyId: hondaId, accountName: 'Salaries & Staff Expenses', accountType: 'Expense', code: '5001', status: 'Active' },
    { _id: accEmployerPFId, orgId: hondaId, companyId: hondaId, accountName: 'Employer PF Contribution', accountType: 'Expense', code: '5002', status: 'Active' },
    { _id: accPFSdrId, orgId: hondaId, companyId: hondaId, accountName: 'Provident Fund (PF) Payable', accountType: 'Current Liability', code: '2101', status: 'Active' },
    { _id: accTDSId, orgId: hondaId, companyId: hondaId, accountName: 'TDS Salary Tax Payable', accountType: 'Current Liability', code: '2102', status: 'Active' },
    { _id: accNetSalId, orgId: hondaId, companyId: hondaId, accountName: 'Net Salaries Payable', accountType: 'Current Liability', code: '2103', status: 'Active' },
    { _id: accTravelExpId, orgId: hondaId, companyId: hondaId, accountName: 'Travel & Conveyance Expense', accountType: 'Expense', code: '5101', status: 'Active' },
    { _id: accDepreciationExpId, orgId: hondaId, companyId: hondaId, accountName: 'Depreciation Expense', accountType: 'Expense', code: '5201', status: 'Active' },
    { _id: accAccumDeprId, orgId: hondaId, companyId: hondaId, accountName: 'Accumulated Depreciation', accountType: 'Contra Asset', code: '1599', status: 'Active' },
  ]);

  // 2. Items
  const itemWorkstationId = new mongoose.Types.ObjectId();
  const itemCpuId = new mongoose.Types.ObjectId();
  const itemGpuId = new mongoose.Types.ObjectId();
  const itemMonitorId = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('booksitems').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('items').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  const itemsData = [
    {
      _id: itemWorkstationId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'Dell Precision 7780 Workstation',
      sku: 'SKU-DELL-7780',
      description: 'Intel i9, 64GB RAM, RTX 5000 Ada GPU Enterprise Workstation',
      salesRate: 150000,
      purchaseRate: 110000,
      stock: 55,
      unit: 'Units',
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: itemCpuId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'Intel Core i9-13980HX Processor',
      sku: 'RAW-CPU-I9',
      description: '24-Core 5.6GHz Mobile CPU Component',
      salesRate: 45000,
      purchaseRate: 35000,
      stock: 95,
      unit: 'Units',
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: itemGpuId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'NVIDIA RTX 5000 Ada GPU 16GB',
      sku: 'RAW-GPU-ADA',
      description: 'Enterprise AI Compute Mobile GPU Component',
      salesRate: 75000,
      purchaseRate: 60000,
      stock: 45,
      unit: 'Units',
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: itemMonitorId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'Dell UltraSharp 32" 4K Video Monitor',
      sku: 'SKU-DELL-U3223QE',
      description: 'IPS Black 4K USB-C Hub Monitor',
      salesRate: 65000,
      purchaseRate: 48000,
      stock: 30,
      unit: 'Units',
      status: 'Active',
      createdAt: new Date(),
    },
  ];
  await mongoose.connection.collection('booksitems').insertMany(itemsData);
  await mongoose.connection.collection('items').insertMany(itemsData);

  // 3. Customers
  const custTcsId = new mongoose.Types.ObjectId();
  const custRilId = new mongoose.Types.ObjectId();
  const custInfyId = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('bookscustomers').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('bookscustomers').insertMany([
    {
      _id: custTcsId,
      orgId: hondaId,
      companyId: hondaId,
      displayName: 'Tata Consultancy Services Ltd',
      companyName: 'Tata Consultancy Services Ltd',
      email: 'accounts@tcs.internal',
      phone: '+91 22 6778 9999',
      currency: 'INR',
      paymentTerms: 'Net 30',
      receivables: 0,
      unusedCredits: 50000,
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: custRilId,
      orgId: hondaId,
      companyId: hondaId,
      displayName: 'Reliance Retail Ventures Ltd',
      companyName: 'Reliance Retail Ventures Ltd',
      email: 'sanjay.verma@ril.internal',
      phone: '+91 22 3555 1200',
      currency: 'INR',
      paymentTerms: 'Net 30',
      receivables: 5310000,
      unusedCredits: 0,
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: custInfyId,
      orgId: hondaId,
      companyId: hondaId,
      displayName: 'Infosys Technologies Limited',
      companyName: 'Infosys Limited',
      email: 'billing@infosys.internal',
      phone: '+91 80 2852 0261',
      currency: 'INR',
      paymentTerms: 'Net 45',
      receivables: 0,
      unusedCredits: 0,
      status: 'Active',
      createdAt: new Date(),
    },
  ]);

  // 4. Quotes
  const quote1Id = new mongoose.Types.ObjectId();
  const quote2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('quotes').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('quotes').insertMany([
    {
      _id: quote1Id,
      orgId: hondaId,
      companyId: hondaId,
      quoteNumber: 'QUO-2026-001',
      customerId: custTcsId,
      customerName: 'Tata Consultancy Services Ltd',
      customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
      date: new Date('2026-10-01'),
      expiryDate: new Date('2026-10-31'),
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 10, rate: 150000, amount: 1500000 }],
      totalAmount: 1500000,
      amount: 1500000,
      status: 'Accepted',
      sentStatus: 'Accepted',
      createdAt: new Date('2026-10-01'),
    },
    {
      _id: quote2Id,
      orgId: hondaId,
      companyId: hondaId,
      quoteNumber: 'QUO-2026-002',
      customerId: custInfyId,
      customerName: 'Infosys Technologies Limited',
      customer: { _id: custInfyId, displayName: 'Infosys Technologies Limited' },
      date: new Date('2026-10-05'),
      expiryDate: new Date('2026-11-04'),
      items: [{ itemId: itemMonitorId, name: 'Dell UltraSharp 32" 4K Monitor', quantity: 10, rate: 65000, amount: 650000 }],
      totalAmount: 650000,
      amount: 650000,
      status: 'Sent',
      sentStatus: 'Sent',
      createdAt: new Date('2026-10-05'),
    },
  ]);

  // 5. Sales Orders
  const so1Id = new mongoose.Types.ObjectId();
  const so2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('salesorders').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('salesorders').insertMany([
    {
      _id: so1Id,
      orgId: hondaId,
      companyId: hondaId,
      salesOrderNumber: 'SO-2026-001',
      referenceQuoteId: quote1Id,
      customerId: custTcsId,
      customerName: 'Tata Consultancy Services Ltd',
      customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
      date: new Date('2026-10-02'),
      shipmentDate: new Date('2026-10-15'),
      expectedDeliveryDate: new Date('2026-10-15'),
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 10, rate: 150000, amount: 1500000 }],
      totalAmount: 1500000,
      amount: 1500000,
      invoicedAmount: 1500000,
      status: 'Confirmed',
      createdAt: new Date('2026-10-02'),
    },
    {
      _id: so2Id,
      orgId: hondaId,
      companyId: hondaId,
      salesOrderNumber: 'SO-CRM-RIL-001',
      customerId: custRilId,
      customerName: 'Reliance Retail Ventures Ltd',
      customer: { _id: custRilId, displayName: 'Reliance Retail Ventures Ltd' },
      date: new Date('2026-10-10'),
      shipmentDate: new Date('2026-10-25'),
      expectedDeliveryDate: new Date('2026-10-25'),
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 30, rate: 150000, amount: 4500000 }],
      totalAmount: 4500000,
      amount: 4500000,
      invoicedAmount: 4500000,
      status: 'Confirmed',
      createdAt: new Date('2026-10-10'),
    },
  ]);

  // 6. Invoices
  const inv1Id = new mongoose.Types.ObjectId();
  const inv2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('invoices').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('invoices').insertMany([
    {
      _id: inv1Id,
      orgId: hondaId,
      companyId: hondaId,
      invoiceNumber: 'INV-2026-001',
      salesOrderId: so1Id,
      customerId: custTcsId,
      customerName: 'Tata Consultancy Services Ltd',
      customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
      invoiceDate: new Date('2026-10-03'),
      dueDate: new Date('2026-11-02'),
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 10, rate: 150000, amount: 1500000 }],
      subtotal: 1500000,
      taxAmount: 270000,
      totalAmount: 1770000,
      total: 1770000,
      amount: 1770000,
      balanceDue: 0,
      status: 'Paid',
      createdAt: new Date('2026-10-03'),
    },
    {
      _id: inv2Id,
      orgId: hondaId,
      companyId: hondaId,
      invoiceNumber: 'INV-2026-002',
      salesOrderId: so2Id,
      customerId: custRilId,
      customerName: 'Reliance Retail Ventures Ltd',
      customer: { _id: custRilId, displayName: 'Reliance Retail Ventures Ltd' },
      invoiceDate: new Date('2026-10-11'),
      dueDate: new Date('2026-11-10'),
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 30, rate: 150000, amount: 4500000 }],
      subtotal: 4500000,
      taxAmount: 810000,
      totalAmount: 5310000,
      total: 5310000,
      amount: 5310000,
      balanceDue: 5310000,
      status: 'Sent',
      createdAt: new Date('2026-10-11'),
    },
  ]);

  // 7. Delivery Challans
  const dc1Id = new mongoose.Types.ObjectId();
  const dc2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('deliverychallans').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('deliverychallans').insertMany([
    {
      _id: dc1Id,
      orgId: hondaId,
      companyId: hondaId,
      challanNumber: 'DC-2026-001',
      salesOrderId: so1Id,
      customerId: custTcsId,
      customerName: 'Tata Consultancy Services Ltd',
      customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
      date: '2026-10-04',
      shipDate: '2026-10-05',
      ref: 'SO-2026-001',
      status: 'Delivered',
      deliveryStatus: 'Delivered',
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 10 }],
      createdAt: new Date('2026-10-04'),
    },
    {
      _id: dc2Id,
      orgId: hondaId,
      companyId: hondaId,
      challanNumber: 'DC-2026-002',
      salesOrderId: so2Id,
      customerId: custRilId,
      customerName: 'Reliance Retail Ventures Ltd',
      customer: { _id: custRilId, displayName: 'Reliance Retail Ventures Ltd' },
      date: '2026-10-12',
      shipDate: '2026-10-14',
      ref: 'SO-CRM-RIL-001',
      status: 'Open',
      deliveryStatus: 'In Transit',
      items: [{ itemId: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 30 }],
      createdAt: new Date('2026-10-12'),
    },
  ]);

  // 8. Payments Received
  const pmtRec1Id = new mongoose.Types.ObjectId();
  await mongoose.connection.collection('paymentreceiveds').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('paymentreceiveds').insertMany([
    {
      _id: pmtRec1Id,
      orgId: hondaId,
      companyId: hondaId,
      paymentNumber: 'PMT-RCV-00001',
      number: 'PMT-RCV-00001',
      customerId: custTcsId,
      customerName: 'Tata Consultancy Services Ltd',
      customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
      invoiceId: inv1Id,
      amount: 1770000,
      unused: 0,
      unusedAmount: 0,
      paymentDate: new Date('2026-10-06'),
      date: '2026-10-06',
      paymentMode: 'Bank Transfer (RTGS)',
      mode: 'Bank Transfer',
      depositTo: 'HDFC Corporate Current Bank',
      status: 'Closed',
      createdAt: new Date('2026-10-06'),
    },
  ]);

  // 9. Credit Notes
  await mongoose.connection.collection('creditnotes').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('creditnotes').insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: hondaId,
    companyId: hondaId,
    creditNoteNumber: 'CN-2026-001',
    number: 'CN-2026-001',
    customerId: custTcsId,
    customerName: 'Tata Consultancy Services Ltd',
    customer: { _id: custTcsId, displayName: 'Tata Consultancy Services Ltd' },
    date: '2026-10-08',
    amount: 50000,
    remaining: 50000,
    remainingCredits: 50000,
    reason: 'Annual SLA Quality Rebate',
    status: 'Open',
    createdAt: new Date('2026-10-08'),
  });

  // 10. Vendors
  const vendorDellId = new mongoose.Types.ObjectId();
  const vendorIntelId = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('booksvendors').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('vendors').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  const vendorsData = [
    {
      _id: vendorDellId,
      orgId: hondaId,
      companyId: hondaId,
      vendorName: 'Dell Technologies India Pvt Ltd',
      name: 'Dell Technologies India Pvt Ltd',
      companyName: 'Dell Technologies',
      email: 'orders@dell.com',
      phone: '+91 80 6688 0000',
      paymentTerms: 'Net 15',
      payables: 0,
      currency: 'INR',
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: vendorIntelId,
      orgId: hondaId,
      companyId: hondaId,
      vendorName: 'Intel India Technology Pvt Ltd',
      name: 'Intel India Technology Pvt Ltd',
      companyName: 'Intel Corporation',
      email: 'supplies@intel.internal',
      phone: '+91 80 4110 5000',
      paymentTerms: 'Net 30',
      payables: 1750000,
      currency: 'INR',
      status: 'Active',
      createdAt: new Date(),
    },
  ];
  await mongoose.connection.collection('booksvendors').insertMany(vendorsData);
  await mongoose.connection.collection('vendors').insertMany(vendorsData);

  // 11. Purchase Orders
  const po1Id = new mongoose.Types.ObjectId();
  const po2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('bookspurchaseorders').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('bookspurchaseorders').insertMany([
    {
      _id: po1Id,
      orgId: hondaId,
      companyId: hondaId,
      orderNumber: 'PO-2026-001',
      poNumber: 'PO-2026-001',
      vendor: vendorDellId,
      vendorId: vendorDellId,
      vendorName: 'Dell Technologies India Pvt Ltd',
      date: new Date('2026-09-20'),
      expectedDeliveryDate: new Date('2026-10-05'),
      items: [{ item: itemWorkstationId, name: 'Dell Precision 7780 Workstation', quantity: 20, rate: 110000, amount: 2200000 }],
      total: 2200000,
      totalAmount: 2200000,
      status: 'Issued',
      createdAt: new Date('2026-09-20'),
    },
    {
      _id: po2Id,
      orgId: hondaId,
      companyId: hondaId,
      orderNumber: 'PO-2026-002',
      poNumber: 'PO-2026-002',
      vendor: vendorIntelId,
      vendorId: vendorIntelId,
      vendorName: 'Intel India Technology Pvt Ltd',
      date: new Date('2026-10-01'),
      expectedDeliveryDate: new Date('2026-10-18'),
      items: [{ item: itemCpuId, name: 'Intel Core i9-13980HX Processor', quantity: 50, rate: 35000, amount: 1750000 }],
      total: 1750000,
      totalAmount: 1750000,
      status: 'Issued',
      createdAt: new Date('2026-10-01'),
    },
  ]);

  // 12. Bills
  const bill1Id = new mongoose.Types.ObjectId();
  const bill2Id = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('booksbills').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('booksbills').insertMany([
    {
      _id: bill1Id,
      orgId: hondaId,
      companyId: hondaId,
      billNumber: 'BILL-DELL-901',
      orderNumber: 'PO-2026-001',
      purchaseOrderId: po1Id,
      vendor: vendorDellId,
      vendorId: vendorDellId,
      vendorName: 'Dell Technologies India Pvt Ltd',
      billDate: new Date('2026-10-05'),
      dueDate: new Date('2026-10-20'),
      totalAmount: 2200000,
      total: 2200000,
      balanceDue: 0,
      status: 'Paid',
      createdAt: new Date('2026-10-05'),
    },
    {
      _id: bill2Id,
      orgId: hondaId,
      companyId: hondaId,
      billNumber: 'BILL-INTEL-102',
      orderNumber: 'PO-2026-002',
      purchaseOrderId: po2Id,
      vendor: vendorIntelId,
      vendorId: vendorIntelId,
      vendorName: 'Intel India Technology Pvt Ltd',
      billDate: new Date('2026-10-15'),
      dueDate: new Date('2026-11-14'),
      totalAmount: 1750000,
      total: 1750000,
      balanceDue: 1750000,
      status: 'Open',
      createdAt: new Date('2026-10-15'),
    },
  ]);

  // 13. Payments Made
  await mongoose.connection.collection('bookspaymentmades').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('bookspaymentmades').insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: hondaId,
    companyId: hondaId,
    paymentNumber: 'PMT-OUT-00001',
    vendorId: vendorDellId,
    vendorName: 'Dell Technologies India Pvt Ltd',
    billId: bill1Id,
    amount: 2200000,
    paidThrough: 'HDFC Corporate Current Bank',
    paymentMode: 'NEFT',
    date: new Date('2026-10-07'),
    status: 'Paid',
    createdAt: new Date('2026-10-07'),
  });

  // 14. Warehouses
  const whBhiwandiId = new mongoose.Types.ObjectId();
  const whDelhiId = new mongoose.Types.ObjectId();

  await mongoose.connection.collection('bookswarehouses').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('bookswarehouses').insertMany([
    {
      _id: whBhiwandiId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'Bhiwandi Central Fulfillment Hub',
      code: 'WH-BHIWANDI',
      address: { city: 'Mumbai', state: 'Maharashtra', pincode: '421302' },
      isPrimary: true,
      status: 'Active',
      createdAt: new Date(),
    },
    {
      _id: whDelhiId,
      orgId: hondaId,
      companyId: hondaId,
      name: 'Delhi NCR Satellite Distribution Center',
      code: 'WH-DELHI',
      address: { city: 'Gurugram', state: 'Haryana', pincode: '122001' },
      isPrimary: false,
      status: 'Active',
      createdAt: new Date(),
    },
  ]);

  // 15. Packages & Shipments
  const pkg1Id = new mongoose.Types.ObjectId();
  await mongoose.connection.collection('packages').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('booksshipments').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('packages').insertOne({
    _id: pkg1Id,
    orgId: hondaId,
    companyId: hondaId,
    packageNumber: 'PKG-2026-001',
    salesOrderId: so1Id,
    warehouseId: whBhiwandiId,
    customer: 'Tata Consultancy Services Ltd',
    packageDate: '2026-10-04',
    weightKg: 28.5,
    items: [{ itemId: itemWorkstationId, quantity: 10 }],
    carrier: 'BlueDart Express',
    trackingNumber: 'BD-991827364',
    status: 'Packed',
    createdAt: new Date('2026-10-04'),
  });

  await mongoose.connection.collection('booksshipments').insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: hondaId,
    companyId: hondaId,
    shipmentNumber: 'SHP-2026-001',
    packageId: pkg1Id,
    salesOrderId: so1Id,
    carrier: 'BlueDart Express',
    trackingNumber: 'BD-991827364',
    date: new Date('2026-10-05'),
    shipmentDate: '2026-10-05',
    status: 'Shipped',
    createdAt: new Date('2026-10-05'),
  });

  // 16. BOM & Work Orders
  const bomId = new mongoose.Types.ObjectId();
  await mongoose.connection.collection('boms').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('booksworkorders').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('boms').insertOne({
    _id: bomId,
    orgId: hondaId,
    companyId: hondaId,
    bomNumber: 'BOM-DELL-7780',
    name: 'Dell Precision 7780 Workstation Assembly',
    finishedItemId: itemWorkstationId,
    components: [
      { itemId: itemCpuId, name: 'Intel i9 CPU', quantity: 1 },
      { itemId: itemGpuId, name: 'NVIDIA Ada GPU', quantity: 1 },
    ],
    status: 'Active',
    createdAt: new Date(),
  });

  await mongoose.connection.collection('booksworkorders').insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: hondaId,
    companyId: hondaId,
    workOrderNumber: 'WO-MFG-001',
    bomId,
    productName: 'Dell Precision 7780 Assembly',
    plannedQuantity: 5,
    completedQuantity: 5,
    status: 'Completed',
    createdAt: new Date('2026-10-09'),
  });

  // 17. Billing: Subscription Plans & Subscriptions
  const planId = new mongoose.Types.ObjectId();
  await mongoose.connection.collection('plans').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });
  await mongoose.connection.collection('subscriptions').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('plans').insertOne({
    _id: planId,
    orgId: hondaId,
    companyId: hondaId,
    name: 'Enterprise Cloud SaaS Tier',
    planCode: 'SAAS-ENT-ANNUAL',
    billingFrequency: 'yearly',
    price: 240000,
    currency: 'INR',
    trialDays: 14,
    status: 'Active',
    createdAt: new Date(),
  });

  await mongoose.connection.collection('subscriptions').insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: hondaId,
    companyId: hondaId,
    subscriptionNumber: 'SUB-2026-901',
    customerId: custTcsId,
    planId,
    planName: 'Enterprise Cloud SaaS Tier',
    customerName: 'Tata Consultancy Services Ltd',
    billingCycle: 'yearly',
    mrr: 22500,
    arr: 270000,
    startDate: new Date('2026-10-01'),
    nextBillingDate: new Date('2027-10-01'),
    status: 'Active',
    createdAt: new Date('2026-10-01'),
  });

  // 18. General Ledger: Balanced Double-Entry Journal
  await mongoose.connection.collection('ledgerentries').deleteMany({
    $or: [{ orgId: hondaId }, { orgId: hondaObjId }, { companyId: hondaId }, { companyId: hondaObjId }]
  });

  await mongoose.connection.collection('ledgerentries').insertMany([
    // Invoice 1
    { orgId: hondaId, companyId: hondaId, accountId: accARId, accountName: 'Trade Accounts Receivable', debit: 1770000, credit: 0, refDoc: 'INV-2026-001', date: new Date('2026-10-03') },
    { orgId: hondaId, companyId: hondaId, accountId: accRevenueId, accountName: 'Product Sales Revenue', debit: 0, credit: 1500000, refDoc: 'INV-2026-001', date: new Date('2026-10-03') },
    { orgId: hondaId, companyId: hondaId, accountName: 'GST Output Tax Payable', debit: 0, credit: 270000, refDoc: 'INV-2026-001', date: new Date('2026-10-03') },
    // Payment 1
    { orgId: hondaId, companyId: hondaId, accountId: accBankId, accountName: 'HDFC Corporate Current Bank', debit: 1770000, credit: 0, refDoc: 'PMT-RCV-001', date: new Date('2026-10-06') },
    { orgId: hondaId, companyId: hondaId, accountId: accARId, accountName: 'Trade Accounts Receivable', debit: 0, credit: 1770000, refDoc: 'PMT-RCV-001', date: new Date('2026-10-06') },
    // Bill 1
    { orgId: hondaId, companyId: hondaId, accountId: accInvAssetId, accountName: 'Inventory Raw/Finished Asset', debit: 2200000, credit: 0, refDoc: 'BILL-DELL-901', date: new Date('2026-10-05') },
    { orgId: hondaId, companyId: hondaId, accountId: accAPId, accountName: 'Trade Accounts Payable', debit: 0, credit: 2200000, refDoc: 'BILL-DELL-901', date: new Date('2026-10-05') },
    // Payment Made 1
    { orgId: hondaId, companyId: hondaId, accountId: accAPId, accountName: 'Trade Accounts Payable', debit: 2200000, credit: 0, refDoc: 'PMT-OUT-001', date: new Date('2026-10-07') },
    { orgId: hondaId, companyId: hondaId, accountId: accBankId, accountName: 'HDFC Corporate Current Bank', debit: 0, credit: 2200000, refDoc: 'PMT-OUT-001', date: new Date('2026-10-07') },
  ]);

  console.log('✅ SEEDING COMPLETE FOR HONDA (6abdf9a7c076b4bb072b4587)!');
  await mongoose.disconnect();
}

seedHondaMasterData().catch(console.error);
