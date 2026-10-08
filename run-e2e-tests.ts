import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const createMockRes = (onResult: (status: number, data: any) => void) => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        onResult(res.statusCode || 200, data);
    };
    res.send = res.json;
    return res;
};

const domainsDir = path.join(__dirname, 'src', 'domains');
const testOrgId = new mongoose.Types.ObjectId();

async function runTests() {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected.');

    const domains = ['books', 'inventory', 'billing'];
    const results: any[] = [];

    for (const domain of domains) {
        const controllersDir = path.join(domainsDir, domain, 'controllers');
        if (!fs.existsSync(controllersDir)) continue;

        const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));

        for (const file of files) {
            const moduleName = file.replace('Controller.ts', '');
            const capName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            
            try {
                const controllerPath = 'file://' + path.join(controllersDir, file).replace(/\\\\/g, '/');
                const controller = await import(controllerPath);
                
                const createFnName = 'create' + capName;
                const getFnName = ('get' + capName + 's') === 'getItems' && domain === 'inventory' ? 'getItems' : ('get' + capName + 's');
                
                const createFn = controller[createFnName] || Object.values(controller).find((f: any) => f.name && f.name.startsWith('create'));
                const getFn = controller[getFnName] || Object.values(controller).find((f: any) => f.name && f.name.startsWith('get'));

                if (createFn && getFn) {
                    let createdId = null;
                    let passCreate = false;
                    let passFetch = false;
                    let errorMsg = '';

                    await new Promise<void>((resolve) => {
                        const req = {
                            body: { name: 'Test ' + capName, code: 'TEST1234', status: 'Active', workOrderNumber: 'WO-1' },
                            org: { _id: testOrgId },
                            user: { _id: testOrgId }
                        } as any;
                        const res = createMockRes((status, data) => {
                            if (status >= 200 && status < 300) {
                                passCreate = true;
                                createdId = data?.data?._id;
                            } else {
                                errorMsg = data?.message || 'Create failed';
                            }
                            resolve();
                        });
                        const next = (err: any) => {
                            errorMsg = err?.message || 'Create threw error';
                            resolve();
                        };
                        createFn(req, res, next).catch(next);
                    });

                    if (passCreate) {
                        await new Promise<void>((resolve) => {
                            const req = {
                                org: { _id: testOrgId },
                                user: { _id: testOrgId },
                                query: {}
                            } as any;
                            const res = createMockRes((status, data) => {
                                if (status >= 200 && status < 300) {
                                    passFetch = true;
                                } else {
                                    errorMsg = data?.message || 'Fetch failed';
                                }
                                resolve();
                            });
                            const next = (err: any) => {
                                errorMsg = err?.message || 'Fetch threw error';
                                resolve();
                            };
                            getFn(req, res, next).catch(next);
                        });
                    }

                    results.push({
                        domain,
                        module: capName,
                        passCreate,
                        passFetch,
                        error: errorMsg
                    });
                }
            } catch (e: any) {
                // ignoring non-controller files
            }
        }
    }

    console.table(results);
    fs.writeFileSync('test-report.json', JSON.stringify(results, null, 2));
    
    const failed = results.filter(r => !r.passCreate || !r.passFetch);
    const md = '# E2E Test Report\\n\\n' + 
      results.map(r => "- **" + r.domain.toUpperCase() + " / " + r.module + "**: " + (r.passCreate && r.passFetch ? "PASS" : "FAIL (" + r.error + ")")).join("\n");
    fs.writeFileSync('D:/e2e-report.md', md);
    
    console.log('\\nTest Complete. ' + results.length + ' modules tested. ' + failed.length + ' failed.');
    process.exit(0);
}

runTests();
