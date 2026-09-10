import mongoose from 'mongoose';
import { requestContext } from './context';

mongoose.plugin((schema) => {
  if (schema.path('orgId')) {
    // Inject createdBy dynamically to support RBAC hierarchy
    if (!schema.path('createdBy')) {
      schema.add({ createdBy: { type: String, index: true } });
    }
    
    // Auto-inject orgId and createdBy on insertMany
    schema.pre('insertMany', function (next: any, docs: any) {
      const store = requestContext.getStore();
      if (store) {
        if (Array.isArray(docs)) {
          docs.forEach(doc => {
            if (store.orgId && !doc.orgId) doc.orgId = store.orgId;
            if (store.userId && schema.path('createdBy') && !doc.createdBy) doc.createdBy = store.userId;
          });
        }
      }
      if (typeof next === 'function') next();
    });

    // Auto-inject orgId and createdBy on Save
    schema.pre('save', function (next: any) {
      const store = requestContext.getStore();
      if (store) {
        if (store.orgId && !(this as any).orgId) {
          (this as any).orgId = store.orgId;
        }
        if (store.userId && schema.path('createdBy') && !(this as any).createdBy) {
          (this as any).createdBy = store.userId;
        }
      }
      if (typeof next === 'function') next();
    });

    // Auto-filter queries by orgId and Hierarchy
    const filterByOrgId = function (this: any, next: any) {
      const store = requestContext.getStore();
      if (store && store.orgId) {
        this.where({ orgId: store.orgId });
        
        // RBAC Hierarchy Filter
        if (store.isAdmin === false && schema.path('createdBy')) {
          const allowedIds = [store.userId, ...(store.childUserIds || [])].filter(Boolean);
          this.where({ createdBy: { $in: allowedIds } });
        }
      }
      if (typeof next === 'function') next();
    };

    schema.pre('find', filterByOrgId as any);
    schema.pre('findOne', filterByOrgId as any);
    schema.pre('findOneAndUpdate', filterByOrgId as any);
    schema.pre('countDocuments', filterByOrgId as any);
    schema.pre('updateMany', filterByOrgId as any);
    schema.pre('deleteMany', filterByOrgId as any);
  }
});
