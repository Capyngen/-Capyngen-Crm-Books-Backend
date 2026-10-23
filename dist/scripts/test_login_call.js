"use strict";
async function testLogin() {
    const res = await fetch('http://localhost:5000/api/v1/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nitesht206@gmail.com', password: 'password' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
}
testLogin().catch(console.error);
