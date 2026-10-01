const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

const oldCode = `        const axios = require('axios');
        const hrmsRes = await axios.post(hrmsBackendUrl + '/api/v1/employees/login', req.body, {
            validateStatus: () => true // resolve all statuses
        });
        const data = hrmsRes.data;
        
        let token = null;
        const setCookie = hrmsRes.headers['set-cookie'];`;

const newCode = `        const response = await fetch(hrmsBackendUrl + '/api/v1/employees/login', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(req.body) 
        });
        const data = await response.json();
        
        let token = null;
        const setCookie = response.headers.getSetCookie ? response.headers.getSetCookie() : [];`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/app.ts', content);
