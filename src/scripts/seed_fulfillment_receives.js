const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/backend/.env' });

const SPINNY_STR = '6aa797278d301b4735f1d322';
const SPINNY_OBJ = new mongoose.Types.ObjectId(SPINNY_STR);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Clear existing and insert full fulfillment waves
  await db.collection('fulfillmentorders').deleteMany({
    $or: [{ orgId: SPINNY_STR }, { companyId: SPINNY_OBJ }, { orgId: '' }]
  });

  const waves = [
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: SPINNY_STR,
      companyId: SPINNY_OBJ,
      waveNumber: 'WAVE-2026-0001',
      salesOrderNumber: 'SO-SPINNY-001',
      customerName: 'TCS Fleet Division',
      warehouseName: 'Spinny Central Fulfillment Hub (Gurugram)',
      pickBin: 'BIN-A1-04',
      itemsCount: 10,
      priority: 'Urgent',
      stage: 'To Pick',
      notes: 'Priority dispatch for corporate fleet deployment',
      assignedTo: 'Vikram Singh',
      date: new Date('2026-10-22T08:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: SPINNY_STR,
      companyId: SPINNY_OBJ,
      waveNumber: 'WAVE-2026-0002',
      salesOrderNumber: 'SO-CRM-FLEET-001',
      customerName: 'Apex Logistics India',
      warehouseName: 'Spinny Central Fulfillment Hub (Gurugram)',
      pickBin: 'BIN-B2-12',
      itemsCount: 30,
      priority: 'High',
      stage: 'Picked',
      notes: 'OBD custom firmware verified and packaged in anti-static containers',
      assignedTo: 'Vikram Singh',
      date: new Date('2026-10-22T09:30:00Z'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: SPINNY_STR,
      companyId: SPINNY_OBJ,
      waveNumber: 'WAVE-2026-0003',
      salesOrderNumber: 'SO-2026-0042',
      customerName: 'GlobalTech Innovations Ltd',
      warehouseName: 'Satellite Hub (Bangalore)',
      pickBin: 'BIN-C1-02',
      itemsCount: 15,
      priority: 'Normal',
      stage: 'Packed',
      notes: 'Ready for courier carrier handover',
      assignedTo: 'Logistics Associate',
      date: new Date('2026-10-22T10:15:00Z'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      orgId: SPINNY_STR,
      companyId: SPINNY_OBJ,
      waveNumber: 'WAVE-2026-0004',
      salesOrderNumber: 'SO-2026-0088',
      customerName: 'Tata AutoComp Systems',
      warehouseName: 'Spinny Central Fulfillment Hub (Gurugram)',
      pickBin: 'BIN-D3-09',
      itemsCount: 25,
      priority: 'High',
      stage: 'Shipped',
      notes: 'Dispatched via BlueDart AWB #BD-88492019',
      assignedTo: 'Vikram Singh',
      date: new Date('2026-10-21T14:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('fulfillmentorders').insertMany(waves);
  console.log(`✅ Seeded ${waves.length} fulfillment waves for Spinny.`);

  // Make sure purchasereceives has records for Spinny
  const prCount = await db.collection('purchasereceives').countDocuments({
    $or: [{ orgId: SPINNY_STR }, { companyId: SPINNY_OBJ }]
  });

  if (prCount === 0) {
    const prs = [
      {
        _id: new mongoose.Types.ObjectId(),
        receiveNumber: 'GRN-SPINNY-001',
        grnNumber: 'GRN-SPINNY-001',
        vendor: 'Silicon Microelectronics India Ltd',
        vendorName: 'Silicon Microelectronics India Ltd',
        poNumber: 'PO-SPINNY-001',
        receiveDate: new Date('2026-10-20'),
        date: '2026-10-20',
        warehouse: 'Spinny Central Fulfillment Hub (Gurugram)',
        warehouseName: 'Spinny Central Fulfillment Hub (Gurugram)',
        receivedQty: 50,
        qcStatus: 'QC Passed',
        status: 'Received',
        companyId: SPINNY_OBJ,
        orgId: SPINNY_STR,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        receiveNumber: 'GRN-SPINNY-002',
        grnNumber: 'GRN-SPINNY-002',
        vendor: 'Apex Circuit Solutions',
        vendorName: 'Apex Circuit Solutions',
        poNumber: 'PO-SPINNY-002',
        receiveDate: new Date('2026-10-21'),
        date: '2026-10-21',
        warehouse: 'Spinny Central Fulfillment Hub (Gurugram)',
        warehouseName: 'Spinny Central Fulfillment Hub (Gurugram)',
        receivedQty: 100,
        qcStatus: 'QC Passed',
        status: 'Putaway Pending',
        companyId: SPINNY_OBJ,
        orgId: SPINNY_STR,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('purchasereceives').insertMany(prs);
    console.log(`✅ Seeded ${prs.length} purchase receives.`);
  } else {
    // Ensure both grnNumber and receiveNumber exist on all records
    await db.collection('purchasereceives').updateMany(
      { $or: [{ orgId: SPINNY_STR }, { companyId: SPINNY_OBJ }] },
      [
        {
          $set: {
            grnNumber: { $ifNull: ['$grnNumber', '$receiveNumber'] },
            receiveNumber: { $ifNull: ['$receiveNumber', '$grnNumber'] },
            vendor: { $ifNull: ['$vendorName', '$vendor'] },
            vendorName: { $ifNull: ['$vendorName', '$vendor'] },
            receivedQty: { $ifNull: ['$receivedQty', 50] },
            qcStatus: { $ifNull: ['$qcStatus', 'QC Passed'] },
            date: { $ifNull: ['$date', '2026-10-20'] }
          }
        }
      ]
    );
    console.log('✅ Updated existing purchasereceives with grnNumber and vendorName.');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
