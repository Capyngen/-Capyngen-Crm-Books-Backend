const fs = require('fs');
const content = fs.readFileSync('src/app.ts', 'utf8');

const loginRoute = `
// Intercept login to extract token from cookie and send it in JSON body
app.post('/api/v1/employees/login', async (req, res) => {
    try {
        const axios = require('axios');
        const hrmsRes = await axios.post(hrmsBackendUrl + '/api/v1/employees/login', req.body, {
            validateStatus: () => true // resolve all statuses
        });
        const data = hrmsRes.data;
        
        let token = null;
        const setCookie = hrmsRes.headers['set-cookie'];
        if (setCookie) {
            for (const cookie of setCookie) {
                const matchHrms = cookie.match(/accessToken_hrms=([^;]+)/);
                const matchOld = cookie.match(/(?:^|;\\s*)accessToken=([^;]+)/);
                if (matchHrms) token = matchHrms[1];
                else if (matchOld) token = matchOld[1];
            }
        }
        
        if (token) {
            data.token = token;
        }
        
        res.status(hrmsRes.status).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Proxy Login Failed' });
    }
});
`;

const updated = content.replace("app.use('/api/v1/employees', createProxyMiddleware", loginRoute + "\napp.use('/api/v1/employees', createProxyMiddleware");
fs.writeFileSync('src/app.ts', updated);
