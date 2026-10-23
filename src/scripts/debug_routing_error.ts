import mongoose from 'mongoose';
import { getRoutings } from '../domains/inventory/controllers/routingController';

const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to DB');

  const req: any = {
    org: { _id: '6aa797278d301b4735f1d322' },
    headers: { 'x-org-id': '6aa797278d301b4735f1d322' },
    body: {}
  };

  const res: any = {
    status: (code: number) => {
      console.log('Status called with:', code);
      return res;
    },
    json: (data: any) => {
      console.log('JSON called with:', data);
      return res;
    }
  };

  const next = (err: any) => {
    if (err) {
      console.error('NEXT CALLED WITH ERROR:\n', err.stack || err);
    } else {
      console.log('NEXT called without error');
    }
  };

  await getRoutings(req, res, next);
  await mongoose.disconnect();
}

run().catch(console.error);
