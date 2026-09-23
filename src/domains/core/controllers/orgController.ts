import { UserOrganization } from '../models/UserOrganization';
import { User } from '../models/User';
﻿import { Request, Response } from 'express';
import { Organization } from '../models/Organization';

export const setupOrganization = async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      companyName, 
      industry, 
      location, 
      state, 
      currency, 
      language, 
      timeZone, 
      gstRegistered, 
      gstNumber 
    } = req.body;
    
    const org = new Organization({
      ownerId: userId,
      companyName,
      industry,
      location,
      state,
      currency,
      language,
      timeZone,
      gstRegistered,
      gstNumber
    });
    
    await org.save();
    
    // Create Admin mapping
    const user = await User.findById(userId);
    if (user) {
      await UserOrganization.create({
        email: user.email,
        userId: user._id,
        orgId: org._id.toString(),
        isAdmin: true,
        status: 'Active',
        name: (user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}` : 'Admin User'
      });
    }
    res.status(201).json({ message: 'Organization created', organization: org });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'];
    // Fetch orgs where user is owner OR mapped via UserOrganization
    const mappings = await UserOrganization.find({ userId });
    const mappedOrgIds = mappings.map(m => m.orgId);
    const orgs = await Organization.find({ $or: [{ ownerId: userId }, { _id: { $in: mappedOrgIds } }] }).lean();
    
    // Attach mapping info
    const populatedOrgs = await Promise.all(orgs.map(async (org) => {
      let mapping = mappings.find(m => m.orgId === org._id.toString());
      if (!mapping && org.ownerId?.toString() === userId) {
         mapping = { isAdmin: true } as any;
      }
      let perms = {};
      if (mapping && mapping.roleId) {
         const Role = require('../models/Role').default;
         const roleObj = await Role.findById(mapping.roleId).lean();
         if (roleObj && roleObj.permissions) {
             perms = roleObj.permissions;
         }
      }
      return { 
          ...org, 
          isAdmin: mapping?.isAdmin || false, 
          rolePermissions: perms, 
          status: mapping?.status || "Active" 
      };
    }));

    res.status(200).json({ success: true, data: populatedOrgs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
