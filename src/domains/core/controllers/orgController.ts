import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserOrganization } from '../models/UserOrganization';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Role } from '../models/Role';

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
    const userId = (req.headers['x-user-id'] as string) || (req as any).user?._id;
    const userEmail = (req as any).user?.email;

    // Fetch mappings by userId or email
    const query: any = {};
    if (userId && mongoose.isValidObjectId(userId)) {
      query.$or = [{ userId: new mongoose.Types.ObjectId(userId) }, { userId: userId.toString() }];
      if (userEmail) query.$or.push({ email: userEmail.toLowerCase() });
    } else if (userEmail) {
      query.email = userEmail.toLowerCase();
    } else if (userId) {
      query.userId = userId;
    }

    const mappings = await UserOrganization.find(query).populate('roleId').lean();
    const mappedOrgIds = mappings.map(m => m.orgId).filter(Boolean);

    // Also check if user has companyId in employees collection
    if (userId && mongoose.isValidObjectId(userId)) {
      const emp = await mongoose.connection.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (emp && emp.companyId) {
        const empOrgId = emp.companyId.toString();
        if (!mappedOrgIds.includes(empOrgId)) mappedOrgIds.push(empOrgId);
      }
    } else if (userEmail) {
      const emp = await mongoose.connection.collection('employees').findOne({ email: userEmail.toLowerCase() });
      if (emp && emp.companyId) {
        const empOrgId = emp.companyId.toString();
        if (!mappedOrgIds.includes(empOrgId)) mappedOrgIds.push(empOrgId);
      }
    }

    // 1. Fetch from companyprofiles (HRMS & Books ecosystem)
    const validObjectIds = mappedOrgIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
    const companyProfiles = await mongoose.connection.collection('companyprofiles').find({
      _id: { $in: validObjectIds }
    }).toArray();

    // 2. Also check Organization collection (fallback)
    const orgCollection = await Organization.find({
      $or: [{ ownerId: userId }, { _id: { $in: mappedOrgIds } }]
    }).lean();

    // Combine organizations
    const allOrgList: any[] = [];
    const seenOrgIds = new Set<string>();

    for (const cp of companyProfiles) {
      const orgIdStr = cp._id.toString();
      seenOrgIds.add(orgIdStr);
      const mapping = mappings.find(m => m.orgId === orgIdStr);
      let perms = {};
      let roleName = 'Employee';
      if (mapping && mapping.roleId) {
        perms = (mapping.roleId as any).permissions || {};
        roleName = (mapping.roleId as any).name || 'Employee';
      }
      const isSystemAdmin = (req as any).user?.role === 'Admin' || (req as any).user?.role === 'Owner';
      const isAdmin = mapping ? (mapping.isAdmin || isSystemAdmin) : isSystemAdmin;

      allOrgList.push({
        _id: orgIdStr,
        id: orgIdStr,
        name: cp.companyName || 'Organization',
        companyName: cp.companyName || 'Organization',
        country: cp.country || 'India',
        currency: cp.currency || 'INR',
        isAdmin,
        role: roleName,
        rolePermissions: perms,
        status: mapping?.status || 'Active'
      });
    }

    for (const o of orgCollection) {
      const orgIdStr = o._id.toString();
      if (!seenOrgIds.has(orgIdStr)) {
        seenOrgIds.add(orgIdStr);
        const mapping = mappings.find(m => m.orgId === orgIdStr);
        let perms = {};
        let roleName = 'Employee';
        if (mapping && mapping.roleId) {
          perms = (mapping.roleId as any).permissions || {};
          roleName = (mapping.roleId as any).name || 'Employee';
        }
        allOrgList.push({
          _id: orgIdStr,
          id: orgIdStr,
          name: o.companyName || 'Organization',
          companyName: o.companyName || 'Organization',
          isAdmin: mapping?.isAdmin || false,
          role: roleName,
          rolePermissions: perms,
          status: mapping?.status || 'Active'
        });
      }
    }

    res.status(200).json({ success: true, data: allOrgList });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
