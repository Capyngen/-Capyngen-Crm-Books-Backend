async function check() {
  try {
    const res = await fetch('http://localhost:5000/health');
    console.log('Health status:', res.status);
    const data = await res.text();
    console.log('Health body:', data);

    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
    const r2 = await fetch('http://localhost:5000/api/v1/books/items', {
      headers: {
        'Authorization': token,
        'x-org-id': '6aa797278d301b4735f1d322',
        'x-company-id': '6aa797278d301b4735f1d322'
      }
    });
    console.log('Books items status:', r2.status);
    const b2 = await r2.text();
    console.log('Books items body:', b2.slice(0, 300));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}
check();
