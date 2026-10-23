async function testLogin() {
  const res = await fetch('http://127.0.0.1:3000/api/v1/employees/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nitesht206@gmail.com', password: 'password' })
  });
  console.log('Status 3000:', res.status);
  const data = await res.json();
  console.log('Response 3000:', JSON.stringify(data, null, 2));
}
testLogin().catch(console.error);
