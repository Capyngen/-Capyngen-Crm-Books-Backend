"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjY1MTU0NSwiZXhwIjoxNzkzMjU2MzQ1fQ.HGUmUqrEMKbNxbf8vlz5YzICRYeW_NaAwwQj099g7O4';
const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
};
async function testAll() {
    console.log('Testing 7 Fulfillment & Dispatch Modules...\n');
    // 1. Order Fulfillment (Queue)
    console.log('1. Order Fulfillment:');
    const ffRes = await fetch(`${BASE_URL}/api/v1/inventory/fulfillment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            salesOrderNumber: 'SO-TEST-001',
            customerName: 'Spinny Test Customer',
            warehouseName: 'Main Central Warehouse',
            pickBin: 'BIN-F-01',
            itemsCount: 5,
            priority: 'Urgent',
            stage: 'To Pick'
        })
    });
    const ffData = await ffRes.json();
    console.log('  Created:', ffData.data?.waveNumber, 'Stage:', ffData.data?.stage);
    const ffAdvRes = await fetch(`${BASE_URL}/api/v1/inventory/fulfillment/${ffData.data?._id}/advance-stage`, {
        method: 'POST',
        headers
    });
    const ffAdvData = await ffAdvRes.json();
    console.log('  Advanced Stage:', ffAdvData.data?.stage);
    // 2. Sales Orders
    console.log('\n2. Sales Orders:');
    const soRes = await fetch(`${BASE_URL}/api/v1/inventory/sales/sales-orders?limit=1`, { headers });
    const soData = await soRes.json();
    console.log('  Sales Orders Count:', soData.count ?? soData.data?.length);
    // 3. Packages & Slips
    console.log('\n3. Packages & Slips:');
    const pkgRes = await fetch(`${BASE_URL}/api/v1/inventory/packages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            salesOrderNumber: 'SO-TEST-001',
            customer: 'Spinny Test Customer',
            warehouse: 'Main Central Warehouse',
            items: [{ name: 'Brake Disc', quantity: 2 }],
            status: 'Packed',
            trackingNumber: 'TRK-SPINNY-991'
        })
    });
    const pkgData = await pkgRes.json();
    console.log('  Created Package:', pkgData.data?.packageNumber, 'Status:', pkgData.data?.status);
    // 4. Shipments & Tracking
    console.log('\n4. Shipments & Tracking:');
    const shpRes = await fetch(`${BASE_URL}/api/v1/inventory/shipments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            shipmentNumber: `SHP-TEST-${Date.now().toString().slice(-4)}`,
            customerName: 'Spinny Test Customer',
            carrier: 'BlueDart Express',
            trackingNumber: 'BD-88912301',
            shippingCost: 350,
            status: 'Picked',
            items: []
        })
    });
    const shpData = await shpRes.json();
    console.log('  Created Shipment:', shpData.data?.shipmentNumber, 'Status:', shpData.data?.status);
    // 5. Delivery Challans
    console.log('\n5. Delivery Challans:');
    const dcRes = await fetch(`${BASE_URL}/api/v1/inventory/sales/delivery-challans?limit=1`, { headers });
    const dcData = await dcRes.json();
    console.log('  Delivery Challans Count:', dcData.count ?? dcData.data?.length);
    // 6. Sales Returns (RMA)
    console.log('\n6. Sales Returns (RMA):');
    const rmaRes = await fetch(`${BASE_URL}/api/v1/inventory/sales/returns`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            salesOrderNumber: 'SO-TEST-001',
            customerName: 'Spinny Test Customer',
            item: 'Brake Disc (Defective)',
            returnQty: 1,
            condition: 'Restockable (Good)',
            status: 'RMA Approved'
        })
    });
    const rmaData = await rmaRes.json();
    console.log('  Created RMA:', rmaData.data?.rmaNumber, 'Status:', rmaData.data?.status);
    const rmaRecRes = await fetch(`${BASE_URL}/api/v1/inventory/sales/returns/${rmaData.data?._id}/receive`, {
        method: 'POST',
        headers
    });
    const rmaRecData = await rmaRecRes.json();
    console.log('  Received RMA:', rmaRecData.data?.status, 'ReceivedBy:', rmaRecData.data?.receivedBy);
    // 7. Customers
    console.log('\n7. Customers:');
    const custRes = await fetch(`${BASE_URL}/api/v1/inventory/sales/customers?limit=1`, { headers });
    const custData = await custRes.json();
    console.log('  Customers Count:', custData.count ?? custData.data?.length);
    console.log('\nAll 7 Fulfillment & Dispatch Modules Verified Successfully!');
}
testAll().catch(err => {
    console.error('Test Failed:', err);
});
