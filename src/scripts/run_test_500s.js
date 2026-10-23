const jwt = require('jsonwebtoken');

const secret = 'esdjAF8ZphD/gj14SlF35Ej97NL/C5PIQphWvzKYLzsX8l2QEMs1PQAXPTsugLIO';
const token = jwt.sign({ _id: '6ad9ada4309299119a95a05b', id: '6ad9ada4309299119a95a05b', email: 'nitesht206@gmail.com' }, secret);

async function testAll() {
  const eps = [
    '/api/v1/inventory/routings',
    '/api/v1/inventory/machines',
    '/api/v1/inventory/work-orders'
  ];
  for (const ep of eps) {
    try {
      const res = await fetch('http://localhost:5000' + ep, {
        headers: { 'Authorization': 'Bearer ' + token, 'x-org-id': '6aa797278d301b4735f1d322' }
      });
      const data = await res.json();
      console.log(ep, '-> STATUS:', res.status, 'Count:', data.data?.length || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.log(ep, '-> ERROR:', err.message);
    }
  }
}
testAll();
