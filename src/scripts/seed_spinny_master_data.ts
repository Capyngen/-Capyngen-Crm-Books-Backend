import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB Atlas...');

  const spinnyId = new mongoose.Types.ObjectId('6aa797278d301b4735f1d322');
  const spinnyStr = '6aa797278d301b4735f1d322';

  // 1. ITEMS & BOOKSITEMS
  const itemsColl = mongoose.connection.collection('booksitems');
  const itemsInventoryColl = mongoose.connection.collection('items');
  await itemsColl.deleteMany({ companyId: spinnyId });
  await itemsInventoryColl.deleteMany({ companyId: spinnyId });

  const item1Id = new mongoose.Types.ObjectId();
  const item2Id = new mongoose.Types.ObjectId();
  const item3Id = new mongoose.Types.ObjectId();
  const item4Id = new mongoose.Types.ObjectId();
  const item5Id = new mongoose.Types.ObjectId();
  const item6Id = new mongoose.Types.ObjectId();

  const itemsData = [
    {
      _id: item1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Spinny OBD-II Diagnostic Scanner Pro',
      sku: 'SPINNY-OBD-01',
      type: 'goods',
      unit: 'pcs',
      salesRate: 4500,
      purchaseRate: 2800,
      stockOnHand: 150,
      reorderPoint: 25,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: 'Enterprise CAN-bus real-time telematics OBD scanner for fleet diagnostics.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: item2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Spinny GPS Real-time Telematics Tracker',
      sku: 'SPINNY-GPS-02',
      type: 'goods',
      unit: 'pcs',
      salesRate: 3200,
      purchaseRate: 1900,
      stockOnHand: 220,
      reorderPoint: 40,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: '4G LTE IP67 waterproof GPS tracker with internal battery backup.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: item3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: '4G IoT Gateway Telematics Hub',
      sku: 'SPINNY-IOT-4G',
      type: 'goods',
      unit: 'pcs',
      salesRate: 8900,
      purchaseRate: 5600,
      stockOnHand: 85,
      reorderPoint: 15,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: 'Multi-sensor edge computing gateway for connected vehicle fleets.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: item4Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Annual Fleet Telematics Cloud Subscription',
      sku: 'SPINNY-SUB-YR',
      type: 'service',
      unit: 'license',
      salesRate: 12000,
      purchaseRate: 0,
      stockOnHand: 9999,
      reorderPoint: 0,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: 'Annual enterprise SaaS dashboard license per vehicle.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: item5Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Brake Wear AI Sensor Kit',
      sku: 'SPINNY-BRK-KIT',
      type: 'goods',
      unit: 'set',
      salesRate: 1800,
      purchaseRate: 950,
      stockOnHand: 120,
      reorderPoint: 30,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: 'Predictive maintenance acoustic brake pad wear sensor kit.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: item6Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'OBD Wiring Harness & Bracket Assembly',
      sku: 'SPINNY-HARN-01',
      type: 'goods',
      unit: 'pcs',
      salesRate: 450,
      purchaseRate: 180,
      stockOnHand: 500,
      reorderPoint: 100,
      isTaxable: true,
      taxRate: 18,
      status: 'Active',
      description: 'Heavy duty molded wiring harness for universal vehicle installation.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await itemsColl.insertMany(itemsData);
  await itemsInventoryColl.insertMany(itemsData);
  console.log('✅ Seeded 6 Items into booksitems & items');

  // 2. WAREHOUSES & BINS
  const whColl = mongoose.connection.collection('warehouses');
  await whColl.deleteMany({ companyId: spinnyId });
  const wh1Id = new mongoose.Types.ObjectId();
  const wh2Id = new mongoose.Types.ObjectId();
  const wh3Id = new mongoose.Types.ObjectId();

  await whColl.insertMany([
    {
      _id: wh1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Spinny Central Logistics Hub (Gurgaon)',
      code: 'SPINNY-WH-GGN',
      address: 'Plot 45, Udyog Vihar Phase 4, Gurgaon, Haryana 122016',
      bins: ['Aisle-1-Bin-A', 'Aisle-1-Bin-B', 'Aisle-2-Bin-A', 'ColdStorage-1'],
      status: 'Active',
      totalStock: 655,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: wh2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Spinny South Regional Hub (Bangalore)',
      code: 'SPINNY-WH-BLR',
      address: 'Plot 12, Electronic City Phase 1, Bangalore, Karnataka 560100',
      bins: ['Zone-A-Bin-01', 'Zone-A-Bin-02', 'Zone-B-Bin-01'],
      status: 'Active',
      totalStock: 320,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: wh3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Spinny West Distribution Center (Mumbai)',
      code: 'SPINNY-WH-BOM',
      address: 'Bhiwandi Logistics Park, Unit 8, Thane, Maharashtra 421302',
      bins: ['Bay-1', 'Bay-2', 'Bay-3'],
      status: 'Active',
      totalStock: 180,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('✅ Seeded 3 Warehouses');

  // 3. TRANSFER ORDERS
  const toColl = mongoose.connection.collection('transferorders');
  await toColl.deleteMany({ companyId: spinnyId });
  await toColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      transferNumber: 'TO-2026-001',
      date: '2026-10-15',
      fromWarehouseId: wh1Id,
      toWarehouseId: wh2Id,
      fromWarehouse: 'Spinny Central Logistics Hub (Gurgaon)',
      toWarehouse: 'Spinny South Regional Hub (Bangalore)',
      items: [{ itemId: item2Id, name: 'Spinny GPS Real-time Telematics Tracker', quantity: 25 }],
      status: 'In Transit',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      transferNumber: 'TO-2026-002',
      date: '2026-10-12',
      fromWarehouseId: wh1Id,
      toWarehouseId: wh3Id,
      fromWarehouse: 'Spinny Central Logistics Hub (Gurgaon)',
      toWarehouse: 'Spinny West Distribution Center (Mumbai)',
      items: [{ itemId: item1Id, name: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 40 }],
      status: 'Received',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      transferNumber: 'TO-2026-003',
      date: '2026-10-18',
      fromWarehouseId: wh3Id,
      toWarehouseId: wh2Id,
      fromWarehouse: 'Spinny West Distribution Center (Mumbai)',
      toWarehouse: 'Spinny South Regional Hub (Bangalore)',
      items: [{ itemId: item3Id, name: '4G IoT Gateway Telematics Hub', quantity: 15 }],
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('✅ Seeded 3 Transfer Orders');

  // 4. INVENTORY ADJUSTMENTS
  const adjColl = mongoose.connection.collection('inventoryadjustments');
  await adjColl.deleteMany({ companyId: spinnyId });
  await adjColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      adjustmentNumber: 'ADJ-2026-001',
      mode: 'quantity',
      date: '2026-10-10',
      reason: 'Physical stocktake reconciliation variance',
      warehouse: 'Spinny Central Logistics Hub (Gurgaon)',
      warehouseId: wh1Id,
      lineItems: [{ itemId: item1Id, itemName: 'Spinny OBD-II Diagnostic Scanner Pro', currentQty: 152, adjustedQty: 150, variance: -2 }],
      status: 'Adjusted',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      adjustmentNumber: 'ADJ-2026-002',
      mode: 'quantity',
      date: '2026-10-16',
      reason: 'Packaging damage during forklift movement',
      warehouse: 'Spinny South Regional Hub (Bangalore)',
      warehouseId: wh2Id,
      lineItems: [{ itemId: item2Id, itemName: 'Spinny GPS Real-time Telematics Tracker', currentQty: 221, adjustedQty: 220, variance: -1 }],
      status: 'Adjusted',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('✅ Seeded 2 Inventory Adjustments');

  // 5. PACKAGES & SHIPMENTS
  const pkgColl = mongoose.connection.collection('packages');
  const shpColl = mongoose.connection.collection('shipments');
  await pkgColl.deleteMany({ companyId: spinnyId });
  await shpColl.deleteMany({ companyId: spinnyId });

  await pkgColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      packageNumber: 'PKG-SPINNY-101',
      salesOrderNumber: 'SO-2026-01',
      customer: 'Uber India Systems Pvt Ltd',
      packageDate: '2026-10-16',
      warehouse: 'Spinny Central Logistics Hub (Gurgaon)',
      itemsPacked: 20,
      carrier: 'BlueDart',
      trackingNumber: 'BD77889911',
      status: 'Packed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      packageNumber: 'PKG-SPINNY-102',
      salesOrderNumber: 'SO-2026-02',
      customer: 'Zoomcar India Pvt Ltd',
      packageDate: '2026-10-17',
      warehouse: 'Spinny South Regional Hub (Bangalore)',
      itemsPacked: 15,
      carrier: 'Delhivery',
      trackingNumber: 'DL44556677',
      status: 'Shipped',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await shpColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      shipmentNumber: 'SHP-SPINNY-001',
      salesOrderNumber: 'SO-2026-01',
      customer: 'Uber India Systems Pvt Ltd',
      shipmentDate: '2026-10-16',
      carrier: 'BlueDart Express',
      trackingNumber: 'BD77889911',
      shippingCost: 850,
      deliveryStatus: 'Delivered',
      status: 'Delivered',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      shipmentNumber: 'SHP-SPINNY-002',
      salesOrderNumber: 'SO-2026-02',
      customer: 'Zoomcar India Pvt Ltd',
      shipmentDate: '2026-10-17',
      carrier: 'Delhivery Logistics',
      trackingNumber: 'DL44556677',
      shippingCost: 620,
      deliveryStatus: 'In Transit',
      status: 'Shipped',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      shipmentNumber: 'SHP-SPINNY-003',
      salesOrderNumber: 'SO-2026-03',
      customer: 'BluSmart Mobility Tech Pvt Ltd',
      shipmentDate: '2026-10-19',
      carrier: 'FedEx Express',
      trackingNumber: 'FX99881122',
      shippingCost: 1200,
      deliveryStatus: 'Ready for Pickup',
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('✅ Seeded Packages & Shipments');

  // 6. MANUFACTURING: MACHINES, ROUTINGS, WORK ORDERS
  const machColl = mongoose.connection.collection('machines');
  const routColl = mongoose.connection.collection('routings');
  const woColl = mongoose.connection.collection('workorders');
  await machColl.deleteMany({ companyId: spinnyId });
  await routColl.deleteMany({ companyId: spinnyId });
  await woColl.deleteMany({ companyId: spinnyId });

  const m1Id = new mongoose.Types.ObjectId();
  const m2Id = new mongoose.Types.ObjectId();
  const r1Id = new mongoose.Types.ObjectId();

  await machColl.insertMany([
    {
      _id: m1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'High-Precision SMT Placement Unit (SMT-01)',
      code: 'MACH-SMT-01',
      workstation: 'Electronic Assembly Line A',
      hourlyRate: 1500,
      capacityPerDay: 200,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: m2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Automated Optical Inspection Station (AOI-02)',
      code: 'MACH-AOI-02',
      workstation: 'QA Testing Bay',
      hourlyRate: 850,
      capacityPerDay: 350,
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  await routColl.insertMany([
    {
      _id: r1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'OBD-II Telematics Device Manufacturing Routing',
      code: 'ROUT-OBD-01',
      operations: [
        { sequence: 10, operationName: 'SMT Component Pick & Place', machineId: m1Id, cycleTimeMinutes: 12 },
        { sequence: 20, operationName: 'Optical QA Inspection & Soldering Verification', machineId: m2Id, cycleTimeMinutes: 5 },
        { sequence: 30, operationName: 'Firmware Flash & 4G RF Functional Test', machineId: m2Id, cycleTimeMinutes: 8 }
      ],
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  await woColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      workOrderNumber: 'WO-2026-001',
      assemblyItemId: item1Id,
      assemblyItemName: 'Spinny OBD-II Diagnostic Scanner Pro',
      quantityToBuild: 100,
      routingId: r1Id,
      warehouseId: wh1Id,
      status: 'In Production',
      startDate: '2026-10-14',
      targetCompletionDate: '2026-10-22',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      workOrderNumber: 'WO-2026-002',
      assemblyItemId: item3Id,
      assemblyItemName: '4G IoT Gateway Telematics Hub',
      quantityToBuild: 50,
      routingId: r1Id,
      warehouseId: wh1Id,
      status: 'Completed',
      startDate: '2026-10-01',
      completionDate: '2026-10-08',
      createdAt: new Date()
    }
  ]);
  console.log('✅ Seeded Manufacturing Machines, Routings & Work Orders');

  // 7. CUSTOMERS
  const custColl = mongoose.connection.collection('bookscustomers');
  const custLegacy = mongoose.connection.collection('customers');
  await custColl.deleteMany({ companyId: spinnyId });
  await custLegacy.deleteMany({ companyId: spinnyId });

  const c1Id = new mongoose.Types.ObjectId();
  const c2Id = new mongoose.Types.ObjectId();
  const c3Id = new mongoose.Types.ObjectId();
  const c4Id = new mongoose.Types.ObjectId();

  const customersData = [
    {
      _id: c1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Uber India Systems Pvt Ltd',
      companyName: 'Uber India Systems Private Limited',
      email: 'fleet.payments@uber.com',
      phone: '+91 124 4567890',
      receivables: 245000.00,
      unusedCredits: 5000.00,
      currency: 'INR',
      customerType: 'business',
      paymentTerms: 'net30',
      billingAddress: { street: 'Level 12, Tower B, DLF Cyber City', city: 'Gurgaon', state: 'Haryana', pincode: '122002', country: 'India' },
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: c2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Zoomcar India Pvt Ltd',
      companyName: 'Zoomcar India Private Limited',
      email: 'accounts@zoomcar.com',
      phone: '+91 80 67891234',
      receivables: 115000.00,
      unusedCredits: 0,
      currency: 'INR',
      customerType: 'business',
      paymentTerms: 'net15',
      billingAddress: { street: '7th Floor, Tower A, Diamond District', city: 'Bangalore', state: 'Karnataka', pincode: '560008', country: 'India' },
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: c3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Ola Fleet Technologies Pvt Ltd',
      companyName: 'Ola Fleet Technologies Private Limited',
      email: 'finance@olacabs.com',
      phone: '+91 80 45671234',
      receivables: 0,
      unusedCredits: 0,
      currency: 'INR',
      customerType: 'business',
      paymentTerms: 'due',
      billingAddress: { street: 'Regent Insignia, 100 Feet Road', city: 'Bangalore', state: 'Karnataka', pincode: '560034', country: 'India' },
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: c4Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'BluSmart Mobility Tech Pvt Ltd',
      companyName: 'BluSmart Mobility Tech Private Limited',
      email: 'billing@blusmart.in',
      phone: '+91 11 40506070',
      receivables: 85000.00,
      unusedCredits: 0,
      currency: 'INR',
      customerType: 'business',
      paymentTerms: 'net30',
      billingAddress: { street: 'Aerocity Hospitality District', city: 'New Delhi', state: 'Delhi', pincode: '110037', country: 'India' },
      status: 'Active',
      createdAt: new Date()
    }
  ];

  await custColl.insertMany(customersData);
  await custLegacy.insertMany(customersData);
  console.log('✅ Seeded 4 Customers');

  // 8. SALES: QUOTES, SALES ORDERS, INVOICES, RECURRING INVOICES, PAYMENTS RECEIVED, CREDIT NOTES
  const quotesColl = mongoose.connection.collection('quotes');
  const soColl = mongoose.connection.collection('salesorders');
  const invColl = mongoose.connection.collection('invoices');
  const rinvColl = mongoose.connection.collection('recurringinvoices');
  const dcColl = mongoose.connection.collection('deliverychallans');
  const pmtRcvColl = mongoose.connection.collection('paymentsreceived');
  const cnColl = mongoose.connection.collection('creditnotes');

  await quotesColl.deleteMany({ companyId: spinnyId });
  await soColl.deleteMany({ companyId: spinnyId });
  await invColl.deleteMany({ companyId: spinnyId });
  await rinvColl.deleteMany({ companyId: spinnyId });
  await dcColl.deleteMany({ companyId: spinnyId });
  await pmtRcvColl.deleteMany({ companyId: spinnyId });
  await cnColl.deleteMany({ companyId: spinnyId });

  // Quotes
  await quotesColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      quoteNumber: 'QUO-SPN-001',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-01',
      quoteDate: '2026-10-01',
      expiryDate: '2026-11-01',
      amount: 160000,
      status: 'Accepted',
      sentStatus: 'Sent',
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 50, rate: 3200, amount: 160000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      quoteNumber: 'QUO-SPN-002',
      customer: 'Zoomcar India Pvt Ltd',
      customerId: c2Id,
      date: '2026-10-05',
      quoteDate: '2026-10-05',
      expiryDate: '2026-11-05',
      amount: 90000,
      status: 'Sent',
      sentStatus: 'Sent',
      lineItems: [{ itemId: item1Id, description: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 20, rate: 4500, amount: 90000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      quoteNumber: 'QUO-SPN-003',
      customer: 'BluSmart Mobility Tech Pvt Ltd',
      customerId: c4Id,
      date: '2026-10-12',
      quoteDate: '2026-10-12',
      expiryDate: '2026-11-12',
      amount: 89000,
      status: 'Draft',
      sentStatus: 'Not Sent',
      lineItems: [{ itemId: item3Id, description: '4G IoT Gateway Telematics Hub', quantity: 10, rate: 8900, amount: 89000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      quoteNumber: 'QUO-SPN-004',
      customer: 'Ola Fleet Technologies Pvt Ltd',
      customerId: c3Id,
      date: '2026-09-15',
      quoteDate: '2026-09-15',
      expiryDate: '2026-10-15',
      amount: 320000,
      status: 'Invoiced',
      sentStatus: 'Viewed',
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 100, rate: 3200, amount: 320000 }],
      createdAt: new Date()
    }
  ]);

  // Sales Orders
  await soColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      salesOrderNumber: 'SO-SPN-001',
      orderNumber: 'SO-SPN-001',
      customer: c1Id,
      customerName: 'Uber India Systems Pvt Ltd',
      orderDate: '2026-10-05',
      salesOrderDate: new Date('2026-10-05'),
      shipmentDate: '2026-10-20',
      expectedShipmentDate: new Date('2026-10-20'),
      amount: 160000,
      subTotal: 160000,
      total: 160000,
      invoicedAmount: 160000,
      status: 'Confirmed',
      items: [{ item: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 50, rate: 3200, amount: 160000 }],
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 50, rate: 3200, amount: 160000 }],
      createdBy: 'Nitesh Thakur',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      salesOrderNumber: 'SO-SPN-002',
      orderNumber: 'SO-SPN-002',
      customer: c2Id,
      customerName: 'Zoomcar India Pvt Ltd',
      orderDate: '2026-10-08',
      salesOrderDate: new Date('2026-10-08'),
      shipmentDate: '2026-10-22',
      expectedShipmentDate: new Date('2026-10-22'),
      amount: 90000,
      subTotal: 90000,
      total: 90000,
      invoicedAmount: 90000,
      status: 'Confirmed',
      items: [{ item: item1Id, description: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 20, rate: 4500, amount: 90000 }],
      lineItems: [{ itemId: item1Id, description: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 20, rate: 4500, amount: 90000 }],
      createdBy: 'Nitesh Thakur',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      salesOrderNumber: 'SO-SPN-003',
      orderNumber: 'SO-SPN-003',
      customer: c4Id,
      customerName: 'BluSmart Mobility Tech Pvt Ltd',
      orderDate: '2026-10-15',
      salesOrderDate: new Date('2026-10-15'),
      shipmentDate: '2026-10-30',
      expectedShipmentDate: new Date('2026-10-30'),
      amount: 85000,
      subTotal: 85000,
      total: 85000,
      invoicedAmount: 0,
      status: 'Draft',
      items: [{ item: item3Id, description: '4G IoT Gateway Telematics Hub', quantity: 10, rate: 8500, amount: 85000 }],
      lineItems: [{ itemId: item3Id, description: '4G IoT Gateway Telematics Hub', quantity: 10, rate: 8500, amount: 85000 }],
      createdBy: 'Nitesh Thakur',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      salesOrderNumber: 'SO-SPN-004',
      orderNumber: 'SO-SPN-004',
      customer: c3Id,
      customerName: 'Ola Fleet Technologies Pvt Ltd',
      orderDate: '2026-09-20',
      salesOrderDate: new Date('2026-09-20'),
      shipmentDate: '2026-09-28',
      expectedShipmentDate: new Date('2026-09-28'),
      amount: 320000,
      subTotal: 320000,
      total: 320000,
      invoicedAmount: 320000,
      status: 'Closed',
      items: [{ item: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 100, rate: 3200, amount: 320000 }],
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 100, rate: 3200, amount: 320000 }],
      createdBy: 'Nitesh Thakur',
      createdAt: new Date()
    }
  ]);

  // Invoices
  const inv1Id = new mongoose.Types.ObjectId();
  const inv2Id = new mongoose.Types.ObjectId();
  const inv3Id = new mongoose.Types.ObjectId();
  const inv4Id = new mongoose.Types.ObjectId();
  const inv5Id = new mongoose.Types.ObjectId();

  await invColl.insertMany([
    {
      _id: inv1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      invoiceNumber: 'INV-SPN-001',
      num: 'INV-SPN-001',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-06',
      invoiceDate: '2026-10-06',
      due: '2026-11-06',
      dueDate: '2026-11-06',
      amount: 160000,
      balance: 60000,
      balanceDue: 60000,
      status: 'Partially Paid',
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 50, rate: 3200, amount: 160000 }],
      createdAt: new Date()
    },
    {
      _id: inv2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      invoiceNumber: 'INV-SPN-002',
      num: 'INV-SPN-002',
      customer: 'Zoomcar India Pvt Ltd',
      customerId: c2Id,
      date: '2026-10-10',
      invoiceDate: '2026-10-10',
      due: '2026-10-25',
      dueDate: '2026-10-25',
      amount: 90000,
      balance: 90000,
      balanceDue: 90000,
      status: 'Sent',
      lineItems: [{ itemId: item1Id, description: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 20, rate: 4500, amount: 90000 }],
      createdAt: new Date()
    },
    {
      _id: inv3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      invoiceNumber: 'INV-SPN-003',
      num: 'INV-SPN-003',
      customer: 'BluSmart Mobility Tech Pvt Ltd',
      customerId: c4Id,
      date: '2026-09-10',
      invoiceDate: '2026-09-10',
      due: '2026-10-10',
      dueDate: '2026-10-10',
      amount: 85000,
      balance: 85000,
      balanceDue: 85000,
      status: 'Overdue',
      lineItems: [{ itemId: item3Id, description: '4G IoT Gateway Telematics Hub', quantity: 10, rate: 8500, amount: 85000 }],
      createdAt: new Date()
    },
    {
      _id: inv4Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      invoiceNumber: 'INV-SPN-004',
      num: 'INV-SPN-004',
      customer: 'Ola Fleet Technologies Pvt Ltd',
      customerId: c3Id,
      date: '2026-09-22',
      invoiceDate: '2026-09-22',
      due: '2026-09-22',
      dueDate: '2026-09-22',
      amount: 320000,
      balance: 0,
      balanceDue: 0,
      status: 'Paid',
      lineItems: [{ itemId: item2Id, description: 'Spinny GPS Real-time Telematics Tracker', quantity: 100, rate: 3200, amount: 320000 }],
      createdAt: new Date()
    },
    {
      _id: inv5Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      invoiceNumber: 'INV-SPN-005',
      num: 'INV-SPN-005',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-18',
      invoiceDate: '2026-10-18',
      due: '2026-11-18',
      dueDate: '2026-11-18',
      amount: 145000,
      balance: 145000,
      balanceDue: 145000,
      status: 'Draft',
      lineItems: [{ itemId: item1Id, description: 'Spinny OBD-II Diagnostic Scanner Pro', quantity: 30, rate: 4500, amount: 135000 }],
      createdAt: new Date()
    }
  ]);

  // Recurring Invoices
  await rinvColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profile: 'Monthly Fleet Telematics Retainer',
      profileName: 'Monthly Fleet Telematics Retainer',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      number: 'RINV-SPN-001',
      frequency: 'Monthly',
      start: '2026-01-01',
      nextDate: '2026-11-01',
      nextBilling: '2026-11-01',
      amount: 25000,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profile: 'Quarterly Maintenance - Zoomcar Fleet',
      profileName: 'Quarterly Maintenance - Zoomcar Fleet',
      customer: 'Zoomcar India Pvt Ltd',
      customerId: c2Id,
      number: 'RINV-SPN-002',
      frequency: 'Quarterly',
      start: '2026-03-01',
      nextDate: '2026-12-01',
      nextBilling: '2026-12-01',
      amount: 45000,
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  // Delivery Challans
  await dcColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      challan: 'DC-SPN-001',
      challanNumber: 'DC-SPN-001',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-10',
      shipDate: '2026-10-12',
      ref: 'SO-SPN-001',
      referenceNumber: 'SO-SPN-001',
      status: 'Delivered',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      challan: 'DC-SPN-002',
      challanNumber: 'DC-SPN-002',
      customer: 'Zoomcar India Pvt Ltd',
      customerId: c2Id,
      date: '2026-10-14',
      shipDate: '2026-10-15',
      ref: 'SO-SPN-002',
      referenceNumber: 'SO-SPN-002',
      status: 'Delivered',
      createdAt: new Date()
    }
  ]);

  // Payments Received
  await pmtRcvColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      number: 'PMT-SPN-001',
      paymentNumber: 'PMT-SPN-001',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-08',
      paymentDate: '2026-10-08',
      mode: 'NEFT',
      paymentMode: 'Bank Transfer',
      amount: 100000,
      unused: 0,
      status: 'Closed',
      invoiceAllocations: [{ invoiceId: inv1Id, amountApplied: 100000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      number: 'PMT-SPN-002',
      paymentNumber: 'PMT-SPN-002',
      customer: 'Ola Fleet Technologies Pvt Ltd',
      customerId: c3Id,
      date: '2026-09-25',
      paymentDate: '2026-09-25',
      mode: 'Bank Transfer',
      paymentMode: 'Bank Transfer',
      amount: 320000,
      unused: 0,
      status: 'Closed',
      invoiceAllocations: [{ invoiceId: inv4Id, amountApplied: 320000 }],
      createdAt: new Date()
    }
  ]);

  // Credit Notes
  await cnColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      number: 'CN-SPN-001',
      creditNoteNumber: 'CN-SPN-001',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      date: '2026-10-12',
      amount: 5000,
      remaining: 5000,
      remainingCredits: 5000,
      status: 'Open',
      reason: 'Volume discount rebate on Q3 hardware deployment',
      createdAt: new Date()
    }
  ]);
  console.log('✅ Seeded Quotes, Sales Orders, Invoices, Recurring Invoices, Challans, Payments Received & Credit Notes');

  // 9. PURCHASES: VENDORS, POs, BILLS, RECURRING BILLS, PAYMENTS MADE, VENDOR CREDITS, EXPENSES
  const vendColl = mongoose.connection.collection('booksvendors');
  const vendLegacy = mongoose.connection.collection('vendors');
  const poColl = mongoose.connection.collection('purchaseorders');
  const billColl = mongoose.connection.collection('bills');
  const rbillColl = mongoose.connection.collection('recurringbills');
  const pmtMadeColl = mongoose.connection.collection('paymentsmade');
  const vcColl = mongoose.connection.collection('vendorcredits');
  const expColl = mongoose.connection.collection('expenses');
  const rexpColl = mongoose.connection.collection('recurringexpenses');
  const milColl = mongoose.connection.collection('mileageexpenses');

  await vendColl.deleteMany({ companyId: spinnyId });
  await vendLegacy.deleteMany({ companyId: spinnyId });
  await poColl.deleteMany({ companyId: spinnyId });
  await billColl.deleteMany({ companyId: spinnyId });
  await rbillColl.deleteMany({ companyId: spinnyId });
  await pmtMadeColl.deleteMany({ companyId: spinnyId });
  await vcColl.deleteMany({ companyId: spinnyId });
  await expColl.deleteMany({ companyId: spinnyId });
  await rexpColl.deleteMany({ companyId: spinnyId });
  await milColl.deleteMany({ companyId: spinnyId });

  const v1Id = new mongoose.Types.ObjectId();
  const v2Id = new mongoose.Types.ObjectId();
  const v3Id = new mongoose.Types.ObjectId();
  const v4Id = new mongoose.Types.ObjectId();

  const vendorsData = [
    {
      _id: v1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Bosch Automotive Electronics India Pvt Ltd',
      companyName: 'Bosch Automotive Electronics India Pvt Ltd',
      email: 'orders@in.bosch.com',
      phone: '+91 80 67521111',
      payables: 450000.00,
      currency: 'INR',
      paymentTerms: 'net45',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: v2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Continental Autonomous & Telematics India',
      companyName: 'Continental Autonomous & Telematics India',
      email: 'sales@continental.in',
      phone: '+91 80 66793000',
      payables: 85000.00,
      currency: 'INR',
      paymentTerms: 'net30',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: v3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Exide Industries Limited',
      companyName: 'Exide Industries Limited',
      email: 'commercial@exide.co.in',
      phone: '+91 33 22832120',
      payables: 0,
      currency: 'INR',
      paymentTerms: 'net30',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: v4Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      displayName: 'Amazon Web Services India (AWS)',
      companyName: 'Amazon Internet Services Private Limited',
      email: 'aws-billing@amazon.com',
      phone: '+1 206 2664064',
      payables: 42000.00,
      currency: 'INR',
      paymentTerms: 'due',
      status: 'Active',
      createdAt: new Date()
    }
  ];

  await vendColl.insertMany(vendorsData);
  await vendLegacy.insertMany(vendorsData);

  // Purchase Orders
  await poColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      poNumber: 'PO-SPN-01',
      vendor: 'Bosch Automotive Electronics India Pvt Ltd',
      vendorId: v1Id,
      date: '2026-10-02',
      expectedDelivery: '2026-11-10',
      amount: 450000,
      status: 'Issued',
      lineItems: [{ itemId: item1Id, description: 'Diagnostic Sub-assemblies', quantity: 150, rate: 3000, amount: 450000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      poNumber: 'PO-SPN-02',
      vendor: 'Continental Autonomous & Telematics India',
      vendorId: v2Id,
      date: '2026-10-06',
      expectedDelivery: '2026-11-15',
      amount: 185000,
      status: 'Issued',
      lineItems: [{ itemId: item2Id, description: 'GPS High-gain Modules', quantity: 100, rate: 1850, amount: 185000 }],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      poNumber: 'PO-SPN-03',
      vendor: 'Exide Industries Limited',
      vendorId: v3Id,
      date: '2026-09-15',
      expectedDelivery: '2026-09-25',
      amount: 120000,
      status: 'Billed',
      lineItems: [{ itemId: item5Id, description: 'Backup Batteries 3.7V', quantity: 200, rate: 600, amount: 120000 }],
      createdAt: new Date()
    }
  ]);

  // Bills
  const b1Id = new mongoose.Types.ObjectId();
  const b2Id = new mongoose.Types.ObjectId();
  const b3Id = new mongoose.Types.ObjectId();
  const b4Id = new mongoose.Types.ObjectId();

  await billColl.insertMany([
    {
      _id: b1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      billNumber: 'BILL-SPN-01',
      billDate: '2026-10-05',
      dueDate: '2026-11-19',
      vendor: 'Bosch Automotive Electronics India Pvt Ltd',
      vendorId: v1Id,
      amount: 450000,
      balance: 450000,
      balanceDue: 450000,
      status: 'Open',
      lineItems: [{ itemId: item1Id, description: 'Diagnostic Sub-assemblies', quantity: 150, rate: 3000, amount: 450000 }],
      createdAt: new Date()
    },
    {
      _id: b2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      billNumber: 'BILL-SPN-02',
      billDate: '2026-10-08',
      dueDate: '2026-11-08',
      vendor: 'Continental Autonomous & Telematics India',
      vendorId: v2Id,
      amount: 185000,
      balance: 85000,
      balanceDue: 85000,
      status: 'Partially Paid',
      lineItems: [{ itemId: item2Id, description: 'GPS High-gain Modules', quantity: 100, rate: 1850, amount: 185000 }],
      createdAt: new Date()
    },
    {
      _id: b3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      billNumber: 'BILL-SPN-03',
      billDate: '2026-09-28',
      dueDate: '2026-10-28',
      vendor: 'Exide Industries Limited',
      vendorId: v3Id,
      amount: 120000,
      balance: 0,
      balanceDue: 0,
      status: 'Paid',
      lineItems: [{ itemId: item5Id, description: 'Backup Batteries 3.7V', quantity: 200, rate: 600, amount: 120000 }],
      createdAt: new Date()
    },
    {
      _id: b4Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      billNumber: 'BILL-SPN-04',
      billDate: '2026-10-01',
      dueDate: '2026-10-15',
      vendor: 'Amazon Web Services India (AWS)',
      vendorId: v4Id,
      amount: 42000,
      balance: 42000,
      balanceDue: 42000,
      status: 'Open',
      lineItems: [{ description: 'AWS Production Cloud Compute & RDS Hosting', quantity: 1, rate: 42000, amount: 42000 }],
      createdAt: new Date()
    }
  ]);

  // Recurring Bills
  await rbillColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profileName: 'Gurgaon Central Logistics Hub Lease',
      vendor: 'Bosch Automotive Electronics India Pvt Ltd',
      vendorId: v1Id,
      frequency: 'Monthly',
      amount: 125000,
      nextDate: '2026-11-01',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profileName: 'Airtel Corporate 1 Gbps Fiber Leased Line',
      vendor: 'Continental Autonomous & Telematics India',
      vendorId: v2Id,
      frequency: 'Monthly',
      amount: 18500,
      nextDate: '2026-11-05',
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  // Payments Made
  await pmtMadeColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      paymentNumber: 'PMT-SPN-001',
      vendor: 'Continental Autonomous & Telematics India',
      vendorId: v2Id,
      paymentDate: '2026-10-12',
      paidThrough: 'HDFC Corporate Prime Current Account',
      paymentMode: 'RTGS',
      amount: 100000,
      status: 'Paid',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      paymentNumber: 'PMT-SPN-002',
      vendor: 'Exide Industries Limited',
      vendorId: v3Id,
      paymentDate: '2026-10-02',
      paidThrough: 'HDFC Corporate Prime Current Account',
      paymentMode: 'NEFT',
      amount: 120000,
      status: 'Paid',
      createdAt: new Date()
    }
  ]);

  // Vendor Credits
  await vcColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      creditNumber: 'VCR-SPN-01',
      vendor: 'Bosch Automotive Electronics India Pvt Ltd',
      vendorId: v1Id,
      date: '2026-10-11',
      amount: 15000,
      remainingCredits: 15000,
      status: 'Open',
      reason: 'Damaged packaging credit on shipment',
      createdAt: new Date()
    }
  ]);

  // Expenses
  await expColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      expenseNumber: 'EXP-2026-01',
      date: '2026-10-04',
      category: 'Hosting & Cloud Infrastructure',
      amount: 42000,
      paidThrough: 'HDFC Corporate Prime Current Account',
      vendor: 'Amazon Web Services India (AWS)',
      status: 'Non-Billable',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      expenseNumber: 'EXP-2026-02',
      date: '2026-10-14',
      category: 'Automobile Expense',
      amount: 14500,
      paidThrough: 'Petty Cash',
      vendor: 'Hindustan Petroleum Corporation Ltd',
      status: 'Non-Billable',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      expenseNumber: 'EXP-2026-03',
      date: '2026-10-16',
      category: 'Training & Development',
      amount: 25000,
      paidThrough: 'HDFC Corporate Prime Current Account',
      vendor: 'Automotive Embedded Systems Institute',
      status: 'Non-Billable',
      createdAt: new Date()
    }
  ]);

  // Recurring Expenses
  await rexpColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profileName: 'Google Workspace Enterprise Security',
      category: 'Software Subscription',
      frequency: 'Monthly',
      amount: 8500,
      nextDate: '2026-11-01',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      profileName: 'Datadog Cloud Observability APM',
      category: 'Software Subscription',
      frequency: 'Monthly',
      amount: 15000,
      nextDate: '2026-11-05',
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  // Mileage Expenses
  await milColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      date: '2026-10-15',
      employee: 'Nitesh Thakur',
      vehicleType: 'Car',
      distance: 180,
      rate: 12,
      amount: 2160,
      notes: 'Customer client site inspection - Uber Gurgaon fleet depot',
      status: 'Approved',
      createdAt: new Date()
    }
  ]);
  console.log('✅ Seeded Vendors, POs, Bills, Recurring Bills, Payments Made, Vendor Credits, Expenses & Mileage');

  // 10. BANK ACCOUNTS & RULES
  const bankColl = mongoose.connection.collection('bankaccounts');
  const bankRuleColl = mongoose.connection.collection('bankingrules');
  await bankColl.deleteMany({ companyId: spinnyId });
  await bankRuleColl.deleteMany({ companyId: spinnyId });

  await bankColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      accountName: 'HDFC Corporate Prime Current Account',
      accountNumber: 'XXXXXX5012',
      bankName: 'HDFC Bank Ltd',
      currency: 'INR',
      bookBalance: 2850400.00,
      bankBalance: 2850400.00,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      accountName: 'ICICI Corporate Escrow Account',
      accountNumber: 'XXXXXX9988',
      bankName: 'ICICI Bank Ltd',
      currency: 'INR',
      bookBalance: 1450000.00,
      bankBalance: 1450000.00,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      accountName: 'SBI Operations Checking',
      accountNumber: 'XXXXXX4455',
      bankName: 'State Bank of India',
      currency: 'INR',
      bookBalance: 680200.00,
      bankBalance: 680200.00,
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  await bankRuleColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Auto-Categorize AWS Infrastructure',
      criteria: 'contains',
      keyword: 'Amazon Web Services',
      category: 'Hosting & Cloud Infrastructure',
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Auto-Categorize Fleet Fuel',
      criteria: 'contains',
      keyword: 'HPCL Fuel',
      category: 'Automobile Expense',
      status: 'Active',
      createdAt: new Date()
    }
  ]);
  console.log('✅ Seeded 3 Bank Accounts & 2 Banking Rules');

  // 11. MANUAL JOURNALS, BUDGETS, FIXED ASSETS, INTER-COMPANY
  const jrnColl = mongoose.connection.collection('journals');
  const budColl = mongoose.connection.collection('budgets');
  const faColl = mongoose.connection.collection('fixedassets');
  const icColl = mongoose.connection.collection('intercompanytransactions');
  await jrnColl.deleteMany({ companyId: spinnyId });
  await budColl.deleteMany({ companyId: spinnyId });
  await faColl.deleteMany({ companyId: spinnyId });
  await icColl.deleteMany({ companyId: spinnyId });

  await jrnColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      journalNumber: 'JRN-2026-001',
      date: '2026-10-15',
      referenceNumber: 'JRN-2026-001',
      totalDebit: 45000,
      totalCredit: 45000,
      postingStatus: 'Posted',
      notes: 'Monthly telematics fleet hardware depreciation accrual',
      lines: [
        { accountName: 'Depreciation Expense', debit: 45000, credit: 0 },
        { accountName: 'Accumulated Depreciation - Fixed Assets', debit: 0, credit: 45000 }
      ],
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      journalNumber: 'JRN-2026-002',
      date: '2026-10-18',
      referenceNumber: 'JRN-2026-002',
      totalDebit: 350000,
      totalCredit: 350000,
      postingStatus: 'Posted',
      notes: 'Accrued engineering and operations payroll provision for October',
      lines: [
        { accountName: 'Salaries & Wages Expense', debit: 350000, credit: 0 },
        { accountName: 'Salaries Payable', debit: 0, credit: 350000 }
      ],
      createdAt: new Date()
    }
  ]);

  await budColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      budgetName: 'Spinny Q4 2026 Operating Budget',
      fiscalYear: '2026-2027',
      totalBudget: 1800000,
      departments: [
        { name: 'Engineering & R&D', allocated: 800000 },
        { name: 'Fleet Operations & Logistics', allocated: 600000 },
        { name: 'Sales & Marketing', allocated: 400000 }
      ],
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  // Budget Scenarios & Lines
  const bscenColl = mongoose.connection.collection('budgetscenarios');
  const blineColl = mongoose.connection.collection('budgetlines');
  await bscenColl.deleteMany({ orgId: spinnyStr });
  await blineColl.deleteMany({ orgId: spinnyStr });

  const scenId = new mongoose.Types.ObjectId();
  const fyearId = new mongoose.Types.ObjectId();
  await bscenColl.insertOne({
    _id: scenId,
    orgId: spinnyStr,
    companyId: spinnyId,
    name: 'FY 2026-2027 Annual Operating Budget',
    fiscalYearId: fyearId,
    type: 'Profit_Loss',
    periodType: 'Monthly',
    status: 'Active',
    description: 'Master operational budget for fleet maintenance, hardware telemetry, and logistics hubs',
    totalBudgetedAmount: 2400000,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Asset Categories & Fixed Assets
  const catColl = mongoose.connection.collection('assetcategories');
  await catColl.deleteMany({ orgId: spinnyStr });
  const catVehiclesId = new mongoose.Types.ObjectId();
  const catITId = new mongoose.Types.ObjectId();

  await catColl.insertMany([
    {
      _id: catVehiclesId,
      orgId: spinnyStr,
      companyId: spinnyId,
      name: 'Vehicles',
      description: 'Fleet inspection vans, transport cars and bikes',
      depreciationMethod: 'Straight_Line',
      defaultUsefulLifeMonths: 60,
      assetAccountId: new mongoose.Types.ObjectId(),
      depreciationAccountId: new mongoose.Types.ObjectId(),
      accumulatedDepreciationAccountId: new mongoose.Types.ObjectId(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: catITId,
      orgId: spinnyStr,
      companyId: spinnyId,
      name: 'IT Hardware & Servers',
      description: 'Server racks, cloud compute units, telematics hubs',
      depreciationMethod: 'Straight_Line',
      defaultUsefulLifeMonths: 48,
      assetAccountId: new mongoose.Types.ObjectId(),
      depreciationAccountId: new mongoose.Types.ObjectId(),
      accumulatedDepreciationAccountId: new mongoose.Types.ObjectId(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await faColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      assetName: 'Spinny Field Inspection Vans (Fleet of 3)',
      assetNumber: 'AST-SPN-001',
      assetCode: 'AST-SPN-001',
      categoryId: catVehiclesId,
      category: 'Vehicles',
      purchaseDate: new Date('2025-04-01'),
      purchasePrice: 2400000,
      cost: 2400000,
      salvageValue: 300000,
      usefulLifeMonths: 60,
      usefulLifeYears: 5,
      depreciationMethod: 'Straight_Line',
      accumulatedDepreciation: 480000,
      currentBookValue: 1920000,
      currentValue: 1920000,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      assetName: 'Dell PowerEdge R750 Server Racks',
      assetNumber: 'AST-SPN-002',
      assetCode: 'AST-SPN-002',
      categoryId: catITId,
      category: 'IT Hardware',
      purchaseDate: new Date('2025-06-15'),
      purchasePrice: 850000,
      cost: 850000,
      salvageValue: 50000,
      usefulLifeMonths: 48,
      usefulLifeYears: 4,
      depreciationMethod: 'Straight_Line',
      accumulatedDepreciation: 170000,
      currentBookValue: 680000,
      currentValue: 680000,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await icColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      fromOrgId: spinnyStr,
      toOrgId: '68dfbf5ec946e3d237b6058e',
      companyId: spinnyId,
      orgId: spinnyStr,
      fromAccountId: new mongoose.Types.ObjectId().toString(),
      toAccountId: new mongoose.Types.ObjectId().toString(),
      transactionNumber: 'IC-2026-001',
      sourceEntity: 'Spinny Technologies Pvt Ltd',
      destinationEntity: 'Spinny Logistics Hubs India',
      transactionDate: new Date('2026-10-10'),
      date: '2026-10-10',
      amount: 500000,
      currency: 'INR',
      description: 'Inter-company equipment transfer for Gurgaon warehouse setup',
      status: 'Approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('✅ Seeded Manual Journals, Budgets, Fixed Assets & Inter-Company');

  // 12. PROJECTS, TIMESHEETS, LEAVES
  const projColl = mongoose.connection.collection('projects');
  const bprojColl = mongoose.connection.collection('booksprojects');
  const timeColl = mongoose.connection.collection('timeentries');
  const leaveColl = mongoose.connection.collection('leaves');
  const leaveAppColl = mongoose.connection.collection('leaveapplications');
  const leaveBalColl = mongoose.connection.collection('leavebalances');

  await projColl.deleteMany({ companyId: spinnyId });
  await bprojColl.deleteMany({ orgId: spinnyStr });
  await timeColl.deleteMany({ companyId: spinnyId });
  await leaveColl.deleteMany({ companyId: spinnyId });
  await leaveAppColl.deleteMany({ orgId: spinnyStr });
  await leaveBalColl.deleteMany({ orgId: spinnyStr });

  const p1Id = new mongoose.Types.ObjectId();
  const p2Id = new mongoose.Types.ObjectId();
  const p3Id = new mongoose.Types.ObjectId();

  const projectsData = [
    {
      _id: p1Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Project Titan - Nationwide Fleet Telematics Upgrade',
      projectName: 'Project Titan - Nationwide Fleet Telematics Upgrade',
      projectCode: 'PRJ-TITAN-01',
      client: 'Uber India Systems Pvt Ltd',
      customer: 'Uber India Systems Pvt Ltd',
      customerId: c1Id,
      billingMethod: 'project_hours',
      rate: 120,
      ratePerHour: 120,
      costBudget: 50000,
      revenueBudget: 85000,
      budgetHours: 500,
      actualHours: 240,
      profitability: 58.5,
      watchlist: true,
      users: [{ userId: spinnyStr, ratePerHour: 120 }],
      tasks: [{ name: 'CAN-bus Telematics Integration', ratePerHour: 120, billable: true }],
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: p2Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Automated Vehicle Inspection AI Model',
      projectName: 'Automated Vehicle Inspection AI Model',
      projectCode: 'PRJ-AI-02',
      client: 'Internal R&D',
      customer: 'Internal R&D',
      billingMethod: 'fixed',
      totalCost: 150000,
      costBudget: 150000,
      revenueBudget: 220000,
      budgetHours: 350,
      actualHours: 190,
      profitability: 62.0,
      watchlist: false,
      users: [{ userId: spinnyStr, ratePerHour: 100 }],
      tasks: [{ name: 'Computer Vision Model Fine-Tuning', ratePerHour: 100, billable: false }],
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: p3Id,
      companyId: spinnyId,
      orgId: spinnyStr,
      name: 'Bengaluru Airport Express Hub Deployment',
      projectName: 'Bengaluru Airport Express Hub Deployment',
      projectCode: 'PRJ-BLR-03',
      client: 'BluSmart Mobility Tech Pvt Ltd',
      customer: 'BluSmart Mobility Tech Pvt Ltd',
      customerId: c4Id,
      billingMethod: 'project_hours',
      rate: 95,
      ratePerHour: 95,
      costBudget: 35000,
      revenueBudget: 55000,
      budgetHours: 200,
      actualHours: 85,
      profitability: 51.0,
      watchlist: true,
      users: [{ userId: spinnyStr, ratePerHour: 95 }],
      tasks: [{ name: 'Hardware Depot Setup', ratePerHour: 95, billable: true }],
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await projColl.insertMany(projectsData);
  await bprojColl.insertMany(projectsData);

  const emp1Id = new mongoose.Types.ObjectId();
  const emp2Id = new mongoose.Types.ObjectId();

  await timeColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      date: new Date('2026-10-14'),
      project: 'Project Titan - Nationwide Fleet Telematics Upgrade',
      projectId: p1Id,
      employeeId: emp1Id,
      task: 'CAN-bus Telematics Integration',
      employee: 'Nitesh Thakur',
      hours: 8,
      billable: true,
      isBillable: true,
      costRate: 80,
      billingRate: 120,
      status: 'Invoiced',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      date: new Date('2026-10-15'),
      project: 'Project Titan - Nationwide Fleet Telematics Upgrade',
      projectId: p1Id,
      employeeId: emp1Id,
      task: 'Firmware Over-The-Air (FOTA) Testing',
      employee: 'Nitesh Thakur',
      hours: 7.5,
      billable: true,
      isBillable: true,
      costRate: 80,
      billingRate: 120,
      status: 'Invoiced',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      date: new Date('2026-10-16'),
      project: 'Automated Vehicle Inspection AI Model',
      projectId: p2Id,
      employeeId: emp2Id,
      task: 'Computer Vision Model Fine-Tuning',
      employee: 'Deepak Sharma',
      hours: 8,
      billable: false,
      isBillable: false,
      costRate: 75,
      billingRate: 0,
      status: 'Unbilled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const leaveApplications = [
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyStr,
      orgId: spinnyStr,
      employeeId: emp2Id,
      employeeName: 'Deepak Sharma',
      employeeCode: 'EMP-SPN-02',
      leaveType: 'Casual Leave',
      startDate: new Date('2026-10-24'),
      endDate: new Date('2026-10-25'),
      totalDays: 2,
      reason: 'Personal family commitment',
      status: 'Approved',
      approvedBy: 'Nitesh Thakur',
      approvalDate: new Date('2026-10-20'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyStr,
      orgId: spinnyStr,
      employeeId: new mongoose.Types.ObjectId(),
      employeeName: 'Amit Verma',
      employeeCode: 'EMP-SPN-03',
      leaveType: 'Sick Leave',
      startDate: new Date('2026-10-19'),
      endDate: new Date('2026-10-19'),
      totalDays: 1,
      reason: 'Viral fever',
      status: 'Approved',
      approvedBy: 'Nitesh Thakur',
      approvalDate: new Date('2026-10-19'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await leaveColl.insertMany(leaveApplications);
  await leaveAppColl.insertMany(leaveApplications);

  await leaveBalColl.insertOne({
    _id: new mongoose.Types.ObjectId(),
    orgId: spinnyStr,
    companyId: spinnyStr,
    employeeId: emp2Id,
    year: 2026,
    paidLeave: { allocated: 18, used: 2, balance: 16 },
    casualLeave: { allocated: 12, used: 2, balance: 10 },
    sickLeave: { allocated: 12, used: 1, balance: 11 },
    lossOfPay: { used: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('✅ Seeded Projects, Timesheets, Leaves & Leave Balances');

  // 13. BILLING: PLANS, ADDONS, COUPONS, PRICING WIDGETS
  const bplansColl = mongoose.connection.collection('billingplans');
  const addonsColl = mongoose.connection.collection('addons');
  const couponsColl = mongoose.connection.collection('coupons');
  const pwColl = mongoose.connection.collection('pricingwidgets');

  await bplansColl.deleteMany({ orgId: spinnyStr });
  await addonsColl.deleteMany({ companyId: spinnyId });
  await couponsColl.deleteMany({ companyId: spinnyId });
  await pwColl.deleteMany({ companyId: spinnyId });

  await bplansColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      planName: 'Spinny Starter Fleet Tier',
      planCode: 'PLAN-STARTER',
      productName: 'Spinny Fleet Telematics',
      billingFrequency: 1,
      billingFrequencyUnit: 'month',
      price: 4999.00,
      setupFee: 0,
      freeTrialDays: 14,
      status: 'Active',
      description: 'Basic vehicle tracking and daily trip reporting for up to 10 vehicles.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      planName: 'Spinny Professional Telematics Tier',
      planCode: 'PLAN-PRO',
      productName: 'Spinny Fleet Telematics',
      billingFrequency: 1,
      billingFrequencyUnit: 'month',
      price: 12999.00,
      setupFee: 0,
      freeTrialDays: 14,
      status: 'Active',
      description: 'Advanced live telemetry, fuel theft monitoring, and driver behavior analytics.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      planName: 'Spinny Enterprise Fleet SaaS Tier',
      planCode: 'PLAN-ENT',
      productName: 'Spinny Fleet Telematics',
      billingFrequency: 12,
      billingFrequencyUnit: 'month',
      price: 99999.00,
      setupFee: 5000,
      freeTrialDays: 30,
      status: 'Active',
      description: 'Full unmetered enterprise suite with custom ERP integrations and dedicated SLA.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await addonsColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      addonName: 'Real-Time GPS 5-Second Ping Addon',
      addonCode: 'ADDON-GPS-5S',
      productName: 'Spinny Fleet Telematics',
      pricingModel: 'Fixed',
      price: 999.00,
      status: 'Active',
      description: 'Ultra-low latency real-time vehicle position ping every 5 seconds.',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      addonName: 'AI Driver Behavior & Collision Detection',
      addonCode: 'ADDON-AI-SAFE',
      productName: 'Spinny Fleet Telematics',
      pricingModel: 'Fixed',
      price: 2499.00,
      status: 'Active',
      description: 'Advanced computer vision road safety and harsh braking AI alert pack.',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      addonName: '24/7 Roadside Assistance & Battery Swap',
      addonCode: 'ADDON-RSA-247',
      productName: 'Spinny Fleet Telematics',
      pricingModel: 'Fixed',
      price: 1499.00,
      status: 'Active',
      description: 'Priority rapid on-field mechanic dispatch and battery jumpstart coverage.',
      createdAt: new Date()
    }
  ]);

  await couponsColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      couponName: 'SPINNY2026',
      code: 'SPINNY2026',
      discountType: 'Percentage',
      value: 20,
      validFrom: '2026-01-01',
      validUntil: '2027-01-01',
      maxUsage: 100,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      couponName: 'FLEETLAUNCH',
      code: 'FLEETLAUNCH',
      discountType: 'Flat',
      value: 5000,
      validFrom: '2026-09-01',
      validUntil: '2026-12-31',
      maxUsage: 50,
      status: 'Active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      couponName: 'ENTERPRISE50',
      code: 'ENTERPRISE50',
      discountType: 'Percentage',
      value: 50,
      validFrom: '2026-10-01',
      validUntil: '2026-11-30',
      maxUsage: 10,
      status: 'Active',
      createdAt: new Date()
    }
  ]);

  await pwColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      companyId: spinnyId,
      orgId: spinnyStr,
      widgetName: 'Main Website Telematics Pricing Table',
      theme: 'Modern Indigo',
      currency: 'INR',
      displayPlans: ['PLAN-STARTER', 'PLAN-PRO', 'PLAN-ENT'],
      status: 'Active',
      createdAt: new Date()
    }
  ]);
  console.log('✅ Seeded Billing Plans, Addons, Coupons & Pricing Widgets');

  // 14. RECURRING JOURNALS & DOCUMENTS
  const rjColl = mongoose.connection.collection('recurringjournals');
  await rjColl.deleteMany({ orgId: spinnyStr });
  await rjColl.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      profileName: 'Monthly Cloud Infrastructure Depreciation & Amortization',
      notes: 'Automated recurring journal for AWS and cloud hardware write-offs',
      frequency: 'Monthly',
      interval: 1,
      startsOn: new Date('2026-01-01'),
      nextRunDate: new Date('2026-11-01'),
      status: 'Active',
      reportingMethod: 'accrual',
      currency: 'INR',
      lineItems: [
        { account: 'Depreciation Expense', debits: 25000, credits: 0, description: 'Monthly Cloud Asset Depreciation' },
        { account: 'Accumulated Depreciation - Fixed Assets', debits: 0, credits: 25000, description: 'Accumulated Depreciation' }
      ],
      subTotal: 25000,
      total: 25000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const docColl = mongoose.connection.collection('documents');
  const bdocColl = mongoose.connection.collection('booksdocuments');
  await docColl.deleteMany({ companyId: spinnyId });
  await bdocColl.deleteMany({ orgId: spinnyStr });
  const docsData = [
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      module: 'books',
      name: 'Bosch_Electronics_Master_Supply_Agreement_2026.pdf',
      type: 'PDF',
      folder: 'Agreements',
      size: '2.4 MB',
      fileSizeInBytes: 2516582,
      fileUrl: '/uploads/documents/Bosch_Electronics_Master_Supply_Agreement_2026.pdf',
      status: 'Archived',
      amount: 450000,
      entityType: 'Bill',
      createdBy: 'Nitesh Thakur',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      module: 'inventory',
      name: 'Gurgaon_Logistics_Hub_Warehouse_Blueprint.pdf',
      type: 'PDF',
      folder: 'Warehouse Blueprints',
      size: '4.8 MB',
      fileSizeInBytes: 5033164,
      fileUrl: '/uploads/documents/Gurgaon_Logistics_Hub_Warehouse_Blueprint.pdf',
      status: 'Archived',
      entityType: 'Manual',
      createdBy: 'Nitesh Thakur',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: spinnyStr,
      companyId: spinnyId,
      module: 'billing',
      name: 'Uber_India_Fleet_Contract_Q4_2026.pdf',
      type: 'PDF',
      folder: 'Contracts',
      size: '1.2 MB',
      fileSizeInBytes: 1258291,
      fileUrl: '/uploads/documents/Uber_India_Fleet_Contract_Q4_2026.pdf',
      status: 'Archived',
      amount: 160000,
      entityType: 'Invoice',
      createdBy: 'Nitesh Thakur',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  await docColl.insertMany(docsData);
  await bdocColl.insertMany(docsData);
  console.log('✅ Seeded Recurring Journals & Enterprise Documents');

  console.log('\n======================================================');
  console.log('🎉 MASTER ENTERPRISE SEEDING FOR SPINNY COMPLETED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
