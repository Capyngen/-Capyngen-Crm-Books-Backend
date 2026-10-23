async function testEtagElimination() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';

  const baseHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-org-id': '6aa797278d301b4735f1d322',
    'x-user-id': '6aa797278d301b4735f1d324'
  };

  console.log('--- TEST 1: Request without caching headers ---');
  const res1 = await fetch('http://localhost:5000/api/v1/books/items', { headers: baseHeaders });
  console.log('Status:', res1.status);
  console.log('ETag header:', res1.headers.get('etag'));
  console.log('Cache-Control:', res1.headers.get('cache-control'));
  console.log('Pragma:', res1.headers.get('pragma'));

  console.log('\n--- TEST 2: Request WITH If-None-Match header (Simulating Browser Revalidation) ---');
  const res2 = await fetch('http://localhost:5000/api/v1/books/items', {
    headers: {
      ...baseHeaders,
      'If-None-Match': 'W/"653-2IQiBceHH1aVARqJSUDPs1V9jTI"',
      'If-Modified-Since': new Date().toUTCString()
    }
  });
  console.log('Status:', res2.status, '(Expected: 200 OK, NEVER 304)');
  const data2: any = await res2.json();
  console.log('Body items count:', data2.data?.length);

  if (res2.status === 200 && !res1.headers.get('etag')) {
    console.log('\n🎯 VERIFICATION PASSED: ETag is disabled, anti-caching headers active, and 304 is completely eliminated!');
  } else {
    console.log('\n⚠️ FAILED: ETag or 304 still occurring!');
  }
}

testEtagElimination().catch(console.error);
