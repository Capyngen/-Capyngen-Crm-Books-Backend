export {};
async function test() {
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjY1MTU0NSwiZXhwIjoxNzkzMjU2MzQ1fQ.HGUmUqrEMKbNxbf8vlz5YzICRYeW_NaAwwQj099g7O4';
  const headers = {
    Authorization: token,
    'x-org-id': '6aa797278d301b4735f1d322',
    'Content-Type': 'application/json'
  };

  const moList = await fetch('http://localhost:5000/api/v1/inventory/inventory/move-orders', { headers }).then(r => r.json());
  console.log('GET Move Orders Status: 200 | Items:', moList.data?.length);
  const moId = moList.data?.[0]?._id;
  if (moId) {
    const execRes = await fetch(`http://localhost:5000/api/v1/inventory/inventory/move-orders/${moId}/execute`, {
      method: 'POST',
      headers
    }).then(r => r.json());
    console.log('Execute Move Order:', execRes.success, '| New Status:', execRes.data?.status);
  }

  const pwList = await fetch('http://localhost:5000/api/v1/inventory/inventory/putaways', { headers }).then(r => r.json());
  console.log('GET Putaways Status: 200 | Items:', pwList.data?.length);
  const pwId = pwList.data?.[0]?._id;
  if (pwId) {
    const compRes = await fetch(`http://localhost:5000/api/v1/inventory/inventory/putaways/${pwId}/complete`, {
      method: 'POST',
      headers
    }).then(r => r.json());
    console.log('Complete Putaway:', compRes.success, '| New Status:', compRes.data?.status);
  }
}

test().catch(console.error);
