import { Request, Response, NextFunction } from 'express';
import { UserOrganization } from '../models/UserOrganization';
import { User } from '../models/User';
import { requestContext } from '../../../context';

export const inviteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    let { email, name, roleId } = req.body; email = email.toLowerCase();
    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    // Check if mapping already exists
    let mapping = await UserOrganization.findOne({ email, orgId });
    if (mapping) {
      return res.status(400).json({ success: false, message: 'User is already invited or active in this organization' });
    }

    // Try to find if user already has an account
    const existingUser = await User.findOne({ email });

    mapping = new UserOrganization({
      email,
      name,
      orgId,
      roleId,
      userId: existingUser ? existingUser._id : undefined,
      status: existingUser ? 'Active' : 'Invited'
    });

    await mapping.save();

    res.status(201).json({ success: true, message: 'User invited successfully', data: mapping });
  } catch (error) { console.error("UserManagement Error:", error); next(error); }
};

export const getOrganizationUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const users = await UserOrganization.find({ orgId }).populate('roleId').lean();
    res.status(200).json({ success: true, data: users });
  } catch (error) { console.error("UserManagement Error:", error); next(error); }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    const mappingId = req.params.id;
    const { roleId } = req.body;

    const mapping = await UserOrganization.findOneAndUpdate(
      { _id: mappingId, orgId },
      { roleId },
      { new: true }
    );
    
    if (!mapping) return res.status(404).json({ success: false, message: 'User mapping not found' });
    res.status(200).json({ success: true, data: mapping });
  } catch (error) { console.error("UserManagement Error:", error); next(error); }
};

export const removeUserFromOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    const mappingId = req.params.id;

    const checkMapping = await UserOrganization.findOne({ _id: mappingId, orgId });
    if (!checkMapping) return res.status(404).json({ success: false, message: 'User mapping not found' });
    if (checkMapping.isAdmin) return res.status(403).json({ success: false, message: 'Cannot remove organization admin' });
    
    const mapping = await UserOrganization.findOneAndDelete({ _id: mappingId, orgId });
    if (!mapping) return res.status(404).json({ success: false, message: 'User mapping not found' });
    
    res.status(200).json({ success: true, message: 'User removed from organization' });
  } catch (error) { console.error("UserManagement Error:", error); next(error); }
};


export const joinOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requestContext.getStore()?.userId;
    const { orgId } = req.body;
    
    if (!userId || !orgId) return res.status(400).json({ success: false, message: 'Missing userId or orgId' });

    const mapping = await UserOrganization.findOneAndUpdate(
      { userId, orgId, status: 'Invited' },
      { status: 'Active' },
      { new: true }
    );
    
    if (!mapping) return res.status(404).json({ success: false, message: 'Invite not found or already active' });
    
    res.status(200).json({ success: true, data: mapping });
  } catch (error) { console.error("UserManagement Error:", error); next(error); }
};
