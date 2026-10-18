import { Request, Response, NextFunction } from 'express';

export const generateDemandForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Mock richer data for a Sensex-style chart
    const forecast = [
      { month: 'Jan', predictedDemand: 300, actual: 310 },
      { month: 'Feb', predictedDemand: 320, actual: 340 },
      { month: 'Mar', predictedDemand: 450, actual: 420 },
      { month: 'Apr', predictedDemand: 380, actual: 400 },
      { month: 'May', predictedDemand: 500, actual: 550 },
      { month: 'Jun', predictedDemand: 480, actual: 470 },
      { month: 'Jul', predictedDemand: 600, actual: null }, // Future
      { month: 'Aug', predictedDemand: 650, actual: null },
      { month: 'Sep', predictedDemand: 720, actual: null },
      { month: 'Oct', predictedDemand: 680, actual: null },
      { month: 'Nov', predictedDemand: 800, actual: null },
      { month: 'Dec', predictedDemand: 950, actual: null },
    ];
    res.status(200).json({ success: true, data: forecast, message: 'AI Forecast generated successfully' });
  } catch (error) { next(error); }
};

import { ReplenishmentService } from '../services/ReplenishmentService';
import { requestContext } from '../../../context';

export const getReorderSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const liveAlerts = await ReplenishmentService.getReplenishmentAlerts(orgId);

    if (liveAlerts.length > 0) {
      const suggestions = liveAlerts.map(a => ({
        itemId: a.itemName,
        currentStock: a.currentStock,
        reorderPoint: a.reorderPoint,
        suggestedQuantity: a.suggestedReorderQuantity,
        reason: `Current stock (${a.currentStock}) is at or below ROP (${a.reorderPoint}). Safety stock buffer: ${a.safetyStock}.`,
        urgency: a.urgency,
        estimatedCost: a.estimatedCost
      }));
      return res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
    }

    // Default fallback demo suggestions if catalogue is brand new
    const suggestions = [
      { itemId: 'MacBook Pro 16', currentStock: 5, reorderPoint: 15, suggestedQuantity: 30, reason: 'High confidence: Upcoming holiday demand spike detected (+45%).', urgency: 'High' },
      { itemId: 'AirPods Pro 2', currentStock: 12, reorderPoint: 20, suggestedQuantity: 100, reason: 'Historical trend shows 3x sales in Q4.', urgency: 'Medium' },
      { itemId: 'Dell XPS 15', currentStock: 2, reorderPoint: 5, suggestedQuantity: 10, reason: 'Stockout risk in 4 days based on current burn rate.', urgency: 'Critical' },
    ];
    res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
  } catch (error) { next(error); }
};

export const triggerReplenishmentPO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).org?._id?.toString() || requestContext.getStore()?.orgId;
    const userId = (req as any).user?._id?.toString();
    const pos = await ReplenishmentService.autoGeneratePurchaseOrders(orgId, req.body.itemIds, userId);
    res.status(200).json({ 
      success: true, 
      count: pos.length, 
      data: pos, 
      message: `Generated ${pos.length} draft Purchase Order(s) for replenishment.` 
    });
  } catch (error) { next(error); }
};

export const smartVendorRouting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routing = {
      recommendedVendor: 'GlobalTech Distributors',
      estimatedCost: 14500,
      estimatedDelivery: '2 days (Fastest)',
      confidenceScore: 94,
      alternativeVendor: 'Acme Supplies',
      altCost: 14000,
      altDelivery: '5 days',
      reasoning: 'GlobalTech is chosen despite being $500 more expensive because Acme Supplies has a 30% delay probability this month.'
    };
    res.status(200).json({ success: true, data: routing });
  } catch (error) { next(error); }
};
