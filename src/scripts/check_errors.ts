const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
const headers: Record<string, string> = {
  Authorization: 'Bearer ' + token,
  'x-org-id': '6aa797278d301b4735f1d322',
  'x-user-id': '6aa797278d301b4735f1d324',
  'Content-Type': 'application/json'
};

async function testPayAndBill() {
  // 1. Payment Received with invoices array
  const pmtRes = await fetch('http://localhost:5000/api/v1/books/sales/payments-received', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: '6ad5e4633a4cccfc97f7bb95',
      customerId: '6ad5e4633a4cccfc97f7bb95',
      paymentNumber: `PR-TEST-${Date.now()}`,
      paymentDate: '2026-10-19',
      paymentMode: 'Bank Transfer',
      amount: 100,
      invoices: [{ invoiceId: '6ad60d3a9fa583873b4eed16', amount: 100 }]
    })
  });
  console.log('Payment Received:', pmtRes.status, await pmtRes.json());

  // 2. Bill
  const billRes = await fetch('http://localhost:5000/api/v1/books/purchases/bills', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vendor: '6ad5e4643a4cccfc97f7bbad',
      vendorId: '6ad5e4643a4cccfc97f7bbad',
      billNumber: `BILL-TEST-${Date.now()}`,
      billDate: '2026-10-19',
      items: [{ name: 'Test item', quantity: 2, rate: 500, amount: 1000 }]
    })
  });
  console.log('Bill:', billRes.status, await billRes.json());
}

testPayAndBill();
export {};
