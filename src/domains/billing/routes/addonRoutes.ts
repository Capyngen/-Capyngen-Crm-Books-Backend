import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const filter = orgId ? {
      $or: [
        { orgId },
        { orgId: orgId.toString() },
        { companyId: orgId },
        { companyId: orgId.toString() },
        { orgId: { $exists: false } }
      ]
    } : {};

    const items = await mongoose.connection.collection('addons').find(filter).toArray();
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id;
    const doc = {
      ...req.body,
      orgId,
      companyId: orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await mongoose.connection.collection('addons').insertOne(doc);
    res.status(201).json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const doc = await mongoose.connection.collection('addons').findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { _id: id as any },
        { id: id }
      ]
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Addon not found' });
    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const query = {
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { _id: id as any },
        { id: id }
      ]
    };
    await mongoose.connection.collection('addons').updateOne(query, {
      $set: { ...req.body, updatedAt: new Date() }
    });
    const updated = await mongoose.connection.collection('addons').findOne(query);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await mongoose.connection.collection('addons').deleteOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { _id: id as any },
        { id: id }
      ]
    });
    res.json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
