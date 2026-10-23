const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/backend/.env' });

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'esdjAF8ZphD/gj14SlF35Ej97NL/C5PIQphWvzKYLzsX8l2QEMs1PQAXPTsugLIO';
const token = jwt.sign(
  { _id: '6aa797278d301b4735f1d324', id: '6aa797278d301b4735f1d324', email: 'nitesht206@gmail.com', role: 'Admin', orgId: '6aa797278d301b4735f1d322' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

async function testReceives() {
  const headers = { Authorization: `Bearer ${token}` };
  
  // 1. Receives
  const res1 = await fetch('http://localhost:5000/api/v1/inventory/purchases/receives', { headers });
  const data1 = await res1.json();
  console.log('Purchases Receives status:', res1.status, 'data length:', Array.isArray(data1.data) ? data1.data.length : data1);

  // 2. Fulfillment
  const res2 = await fetch('http://localhost:5000/api/v1/inventory/fulfillment', { headers });
  const data2 = await res2.json();
  console.log('Fulfillment status:', res2.status, 'data length:', Array.isArray(data2.data) ? data2.data.length : data2);
}

testReceives();
