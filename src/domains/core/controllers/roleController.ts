import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { requestContext } from '../../../context';

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const roles = await Role.find({ orgId }).lean();
    res.status(200).json({ success: true, data: roles });
  } catch (error) { next(error); }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const { name, description, parentRoleId, permissions } = req.body;
    
    // Ensure parent role is within the same org
    if (parentRoleId) {
      const parent = await Role.findOne({ _id: parentRoleId, orgId });
      if (!parent) return res.status(400).json({ success: false, message: 'Invalid parent role' });
    }

    const role = new Role({ orgId, name, description, parentRoleId, permissions });
    await role.save();
    
    res.status(201).json({ success: true, data: role });
  } catch (error) { next(error); }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    const roleId = req.params.id;
    const { name, description, parentRoleId, permissions } = req.body;

    const role = await Role.findOneAndUpdate(
      { _id: roleId, orgId },
      { name, description, parentRoleId, permissions },
      { new: true }
    );
    
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, data: role });
  } catch (error) { next(error); }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    const roleId = req.params.id;

    const role = await Role.findOneAndDelete({ _id: roleId, orgId });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    
    // Unassign this role from children
    await Role.updateMany({ parentRoleId: roleId, orgId }, { $unset: { parentRoleId: 1 } });
    
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (error) { next(error); }
};


export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const role = await Role.findOne({ _id: req.params.id, orgId }).lean();
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    
    res.status(200).json({ success: true, data: role });
  } catch (error) { next(error); }
};
