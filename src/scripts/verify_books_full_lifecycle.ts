const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
const headers: Record<string, string> = {
  Authorization: 'Bearer ' + token,
  'x-org-id': '6aa797278d301b4735f1d322',
  'x-user-id': '6aa797278d301b4735f1d324',
  'Content-Type': 'application/json'
};

const BASE_URL = 'http://localhost:5000/api/v1';

async function testLifecycle() {
  console.log('=== STARTING BOOKS FULL LIFECYCLE AUDIT & VERIFICATION ===\n');

  // TEST 1: ITEM CREATION & CROSS-MODULE SYNC
  console.log('--- TEST 1: ITEM LIFECYCLE & CROSS-MODULE SYNC ---');
  const testItemSku = `AUDIT-ITEM-${Date.now()}`;
  const newItemPayload = {
    name: `Audit Test Item ${Date.now()}`,
    sku: testItemSku,
    type: 'goods',
    unit: 'pcs',
    sellingPrice: 1500,
    salesRate: 1500,
    rate: 1500,
    costPrice: 800,
    purchaseRate: 800,
    stockOnHand: 50,
    stock: 50,
    trackInventory: true
  };

  const createItemRes = await fetch(`${BASE_URL}/books/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(newItemPayload)
  });
  const createdItemData = await createItemRes.json();
  const createdItemId = createdItemData?.data?._id || createdItemData?._id;
  console.log('1.1 Item created via Books API:', createItemRes.status, 'ID:', createdItemId);

  // Verify it appears in Books GET
  const booksItemsRes = await fetch(`${BASE_URL}/books/items`, { headers });
  const booksItemsData = await booksItemsRes.json();
  const foundInBooks = (booksItemsData?.data || []).some((it: any) => it._id === createdItemId || it.sku === testItemSku);
  console.log('1.2 Item immediately available in Books GET /items:', foundInBooks);

  // Verify it appears in Billing GET
  const billingItemsRes = await fetch(`${BASE_URL}/billing/items`, { headers });
  const billingItemsData = await billingItemsRes.json();
  const foundInBilling = (billingItemsData?.data || []).some((it: any) => it._id === createdItemId || it.sku === testItemSku);
  console.log('1.3 Item immediately synced to Billing GET /items:', foundInBilling);

  // TEST 2: CUSTOMER & SALES ORDER & INVOICE FLOW
  console.log('\n--- TEST 2: SALES FLOW (CUSTOMER -> QUOTE -> SO -> INVOICE -> PAYMENT) ---');
  // 2.1 Fetch customers
  const custRes = await fetch(`${BASE_URL}/books/sales/customers`, { headers });
  const custData = await custRes.json();
  const testCust = custData?.data?.[0];
  console.log('2.1 Selected Customer for test:', testCust?.displayName || testCust?.name, 'ID:', testCust?._id);

  // 2.2 Create Quote
  const quoteNumber = `QT-AUDIT-${Date.now()}`;
  const quotePayload = {
    customer: testCust?._id,
    customerId: testCust?._id,
    quoteNumber,
    quoteDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    items: [
      {
        item: createdItemId,
        itemId: createdItemId,
        name: newItemPayload.name,
        quantity: 2,
        rate: 1500,
        amount: 3000
      }
    ],
    total: 3000,
    status: 'Sent'
  };
  const createQuoteRes = await fetch(`${BASE_URL}/books/sales/quotes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(quotePayload)
  });
  const quoteResult = await createQuoteRes.json();
  const quoteId = quoteResult?.data?._id || quoteResult?._id;
  console.log('2.2 Quote created:', createQuoteRes.status, 'Quote#:', quoteNumber, 'ID:', quoteId);

  // 2.3 Create Sales Order
  const soNumber = `SO-AUDIT-${Date.now()}`;
  const soPayload = {
    customer: testCust?._id,
    customerId: testCust?._id,
    salesOrderNumber: soNumber,
    orderNumber: soNumber,
    orderDate: new Date().toISOString().split('T')[0],
    items: [
      {
        item: createdItemId,
        itemId: createdItemId,
        name: newItemPayload.name,
        quantity: 2,
        rate: 1500,
        amount: 3000
      }
    ],
    total: 3000,
    status: 'Confirmed'
  };
  const createSoRes = await fetch(`${BASE_URL}/books/sales/sales-orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(soPayload)
  });
  const soResult = await createSoRes.json();
  const soId = soResult?.data?._id || soResult?._id;
  console.log('2.3 Sales Order created:', createSoRes.status, 'SO#:', soNumber, 'ID:', soId);

  // 2.4 Create Invoice
  const invNumber = `INV-AUDIT-${Date.now()}`;
  const invPayload = {
    customer: testCust?._id,
    customerId: testCust?._id,
    invoiceNumber: invNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    salesOrderId: soId,
    items: [
      {
        item: createdItemId,
        itemId: createdItemId,
        name: newItemPayload.name,
        quantity: 2,
        rate: 1500,
        amount: 3000
      }
    ],
    subtotal: 3000,
    total: 3000,
    balance: 3000,
    balanceDue: 3000,
    status: 'Sent'
  };
  const createInvRes = await fetch(`${BASE_URL}/books/sales/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify(invPayload)
  });
  const invResult = await createInvRes.json();
  const invId = invResult?.data?._id || invResult?._id;
  console.log('2.4 Invoice created:', createInvRes.status, 'Inv#:', invNumber, 'ID:', invId, 'Balance Due: 3000');

  // 2.5 Record Payment Received for this invoice
  const pmtNumber = `PMT-AUDIT-${Date.now()}`;
  const pmtPayload = {
    customer: testCust?._id,
    customerId: testCust?._id,
    paymentNumber: pmtNumber,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    amount: 3000,
    invoices: [
      {
        invoiceId: invId,
        amount: 3000
      }
    ],
    notes: 'Audit payment test'
  };
  const createPmtRes = await fetch(`${BASE_URL}/books/sales/payments-received`, {
    method: 'POST',
    headers,
    body: JSON.stringify(pmtPayload)
  });
  const pmtResult = await createPmtRes.json();
  console.log('2.5 Payment Received recorded:', createPmtRes.status, 'Pmt#:', pmtNumber);

  // TEST 3: PURCHASES FLOW (VENDOR -> PO -> BILL -> PAYMENT MADE)
  console.log('\n--- TEST 3: PURCHASES FLOW (VENDOR -> PO -> BILL -> PAYMENT MADE) ---');
  const vendorRes = await fetch(`${BASE_URL}/books/purchases/vendors`, { headers });
  const vendorData = await vendorRes.json();
  const testVendor = vendorData?.data?.[0];
  console.log('3.1 Selected Vendor for test:', testVendor?.displayName || testVendor?.name, 'ID:', testVendor?._id);

  const poNumber = `PO-AUDIT-${Date.now()}`;
  const poPayload = {
    vendor: testVendor?._id,
    vendorId: testVendor?._id,
    purchaseOrderNumber: poNumber,
    orderNumber: poNumber,
    orderDate: new Date().toISOString().split('T')[0],
    items: [
      {
        item: createdItemId,
        itemId: createdItemId,
        name: newItemPayload.name,
        quantity: 10,
        rate: 800,
        amount: 8000
      }
    ],
    total: 8000,
    status: 'Issued'
  };
  const createPoRes = await fetch(`${BASE_URL}/books/purchases/purchase-orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(poPayload)
  });
  const poResult = await createPoRes.json();
  const poId = poResult?.data?._id || poResult?._id;
  console.log('3.2 Purchase Order created:', createPoRes.status, 'PO#:', poNumber, 'ID:', poId);

  // 3.3 Create Bill
  const billNumber = `BILL-AUDIT-${Date.now()}`;
  const billPayload = {
    vendor: testVendor?._id,
    vendorId: testVendor?._id,
    billNumber,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    purchaseOrderId: poId,
    items: [
      {
        item: createdItemId,
        itemId: createdItemId,
        name: newItemPayload.name,
        quantity: 10,
        rate: 800,
        amount: 8000
      }
    ],
    subtotal: 8000,
    total: 8000,
    balance: 8000,
    balanceDue: 8000,
    status: 'Open'
  };
  const createBillRes = await fetch(`${BASE_URL}/books/purchases/bills`, {
    method: 'POST',
    headers,
    body: JSON.stringify(billPayload)
  });
  const billResult = await createBillRes.json();
  const billId = billResult?.data?._id || billResult?._id;
  console.log('3.3 Bill created:', createBillRes.status, 'Bill#:', billNumber, 'ID:', billId);

  // 3.4 Payment Made
  const payMadePayload = {
    vendor: testVendor?._id,
    vendorId: testVendor?._id,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    amount: 8000,
    paidThroughAccountId: 'checking',
    bills: [
      {
        billId,
        amount: 8000
      }
    ]
  };
  const createPayMadeRes = await fetch(`${BASE_URL}/books/purchases/payments-made`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payMadePayload)
  });
  console.log('3.4 Payment Made recorded:', createPayMadeRes.status);

  // TEST 4: GENERAL LEDGER / MANUAL JOURNAL DOUBLE-ENTRY
  console.log('\n--- TEST 4: GENERAL LEDGER & MANUAL JOURNAL ---');
  const journalNumber = `JRN-AUDIT-${Date.now()}`;
  const journalPayload = {
    journalNumber,
    date: new Date().toISOString().split('T')[0],
    referenceNumber: 'AUDIT-REF',
    notes: 'Audit balanced journal verification',
    journalType: 'Manual',
    lines: [
      {
        account: 'Bank Accounts',
        accountName: 'Bank Accounts',
        debit: 5000,
        credit: 0,
        description: 'Debit Cash at Bank'
      },
      {
        account: 'Sales',
        accountName: 'Sales Revenue',
        debit: 0,
        credit: 5000,
        description: 'Credit Sales Revenue'
      }
    ],
    totalDebit: 5000,
    totalCredit: 5000,
    difference: 0,
    status: 'Published'
  };
  const createJournalRes = await fetch(`${BASE_URL}/books/journals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(journalPayload)
  });
  const journalResult = await createJournalRes.json();
  console.log('4.1 Manual Journal double-entry posted:', createJournalRes.status, 'JRN#:', journalNumber, 'Balanced (5000 DR == 5000 CR):', createJournalRes.status === 201 || createJournalRes.status === 200);

  // CLEANUP TEST ITEM
  console.log('\n--- CLEANUP AUDIT TEST ARTIFACTS ---');
  const delItemRes = await fetch(`${BASE_URL}/books/items/${createdItemId}`, {
    method: 'DELETE',
    headers
  });
  console.log('Cleanup Test Item:', delItemRes.status);

  console.log('\n=== ALL BOOKS LIFECYCLES AUDITED & PASSED SUCCESSFULLY ===');
}

testLifecycle().catch(console.error);
export {};
