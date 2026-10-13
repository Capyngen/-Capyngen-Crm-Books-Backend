import mongoose from 'mongoose';
import Vendor from '../models/Vendor';

export class VendorOnboardingService {
    /**
     * Progresses a Vendor through the enterprise onboarding workflow.
     */
    static async updateOnboardingStatus(
        vendorId: string | string[] | mongoose.Types.ObjectId,
        newStatus: 'Draft' | 'KYC Pending' | 'UnderReview' | 'Approved' | 'Rejected',
        reviewerId: string,
        notes?: string
    ) {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) throw new Error('Vendor not found');

        vendor.onboardingStatus = newStatus;
        vendor.notes = (vendor.notes || '') + `\n[SYSTEM - ${new Date().toISOString()}]: Status changed to ${newStatus} by ${reviewerId}. ${notes || ''}`;
        
        // If approved, invite to portal automatically if portalAccess is enabled
        if (newStatus === 'Approved' && vendor.portalAccessStatus !== 'Active') {
            vendor.portalAccessStatus = 'Invited';
            vendor.portalAccess = true;
        }

        await vendor.save();
        return vendor;
    }

    /**
     * Submits a performance rating for a vendor (e.g., after PO fulfillment).
     * Maintains a running average.
     */
    static async submitVendorRating(vendorId: string | string[] | mongoose.Types.ObjectId, newScore: number) {
        if (newScore < 0 || newScore > 5) throw new Error('Rating must be between 0 and 5');

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) throw new Error('Vendor not found');

        const currentRating = vendor.rating || { score: 0, reviewCount: 0 };
        const totalScore = (currentRating.score * currentRating.reviewCount) + newScore;
        const newCount = currentRating.reviewCount + 1;

        vendor.rating = {
            ...currentRating,
            score: Number((totalScore / newCount).toFixed(1)),
            reviewCount: newCount
        };

        await vendor.save();
        return vendor;
    }
}
