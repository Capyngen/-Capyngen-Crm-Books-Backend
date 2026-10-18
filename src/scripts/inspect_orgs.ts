import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const comp = await mongoose.connection.collection('companyprofiles').find({}).toArray();
  console.log('--- companyprofiles (' + comp.length + ') ---');
  comp.forEach(c => console.log('CompProfile:', c._id?.toString(), c.companyName, c.companyEmail, c.name));

  const orgs = await mongoose.connection.collection('organizations').find({}).toArray();
  console.log('--- organizations (' + orgs.length + ') ---');
  orgs.forEach(o => console.log('Org:', o._id?.toString(), o.name, o.companyName, o.email));

  const invoices = await mongoose.connection.collection('booksinvoices').find({}).limit(5).toArray();
  console.log('--- sample booksinvoices (' + invoices.length + ') ---');
  invoices.forEach(inv => console.log('Invoice:', inv.invoiceNumber || inv.num, 'orgId:', inv.orgId, 'companyId:', inv.companyId, 'organizationId:', inv.organizationId));

  const so = await mongoose.connection.collection('salesorders').find({}).limit(5).toArray();
  console.log('--- sample salesorders (' + so.length + ') ---');
  so.forEach(s => console.log('SO:', s.salesOrderNumber || s.orderNumber, 'orgId:', s.orgId, 'companyId:', s.companyId));

  await mongoose.disconnect();
}

run().catch(console.error);
