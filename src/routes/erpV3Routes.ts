import { Router, Request, Response } from 'express';
import ERPConfig from '../core/models/ERPConfig';
import { EnterpriseV3MasterService } from '../core/services/EnterpriseV3MasterService';

const router = Router();

// Helper to extract orgId
const getOrgId = (req: Request): string => {
  return (req as any).orgId || (req as any).user?.orgId || req.headers['x-org-id'] as string || '6aa797278d301b4735f1d322';
};

// 1. Get Dynamic ERP Configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const config = await EnterpriseV3MasterService.getConfig(orgId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Update Dynamic ERP Configuration
router.put('/config', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const updated = await ERPConfig.findOneAndUpdate(
      { orgId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Query Live 3D ATP
router.get('/atp/:itemId', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { itemId } = req.params;
    const warehouseId = req.query.warehouseId as string | undefined;
    const atpData = await EnterpriseV3MasterService.calculateATP(orgId, itemId, warehouseId);
    res.json({ success: true, data: atpData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Flow 1: Inbound Receipt (P2P)
router.post('/inbound/receipt', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeInboundReceipt({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'Warehouse Operator' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. Flow 2: Outbound Fulfillment (O2C)
router.post('/outbound/fulfill', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeOutboundFulfillment({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'Dispatch Supervisor' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 6. Flow 3: Ind AS 115 Hybrid Bundle Allocation
router.post('/subscriptions/ssp-allocate', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const result = await EnterpriseV3MasterService.executeIndAS115SSPAllocation({
      orgId,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 7. Flow 5: Cycle Count, ADJ_HOLD & Dual-Witness Scrap
router.post('/audits/cycle-count-scrap', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeCycleCountAndScrap({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'Stock Auditor' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 8. Flow 6: Returns & RMA
router.post('/returns/rma', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeReturnsAndRTO({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'RMA Specialist' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 9. Flow 10: Finance Operations
router.post('/finance/operation', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeFinanceOperations({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'Finance Executive' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 10. Flow 11: Ground Exceptions
router.post('/ground/exception', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const userId = (req as any).user?.id || 'SYSTEM';
    const result = await EnterpriseV3MasterService.executeFlow11GroundExceptions({
      orgId,
      ...req.body,
      actor: { userId, role: (req as any).user?.role || 'Ground Operator' }
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
