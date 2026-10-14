"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const context_1 = require("./context");
mongoose_1.default.plugin((schema) => {
    if (schema.path('orgId')) {
        // Inject createdBy dynamically to support RBAC hierarchy
        if (!schema.path('createdBy')) {
            schema.add({ createdBy: { type: String, index: true } });
        }
        // Auto-inject orgId and createdBy on insertMany
        schema.pre('insertMany', function (next, docs) {
            const store = context_1.requestContext.getStore();
            if (store) {
                if (Array.isArray(docs)) {
                    docs.forEach(doc => {
                        if (store.orgId && !doc.orgId)
                            doc.orgId = store.orgId;
                        if (store.userId && schema.path('createdBy') && !doc.createdBy)
                            doc.createdBy = store.userId;
                    });
                }
            }
            if (typeof next === 'function')
                next();
        });
        // Auto-inject orgId and createdBy on Save
        schema.pre('save', function (next) {
            const store = context_1.requestContext.getStore();
            if (store) {
                if (store.orgId && !this.orgId) {
                    this.orgId = store.orgId;
                }
                if (store.userId && schema.path('createdBy') && !this.createdBy) {
                    this.createdBy = store.userId;
                }
            }
            if (typeof next === 'function')
                next();
        });
        // Auto-filter queries by orgId and Hierarchy
        const filterByOrgId = function (next) {
            const store = context_1.requestContext.getStore();
            if (store && store.orgId) {
                this.where({ orgId: store.orgId });
                // RBAC Hierarchy Filter
                if (store.isAdmin === false && schema.path('createdBy')) {
                    const allowedIds = [store.userId, ...(store.childUserIds || [])].filter(Boolean);
                    this.where({ createdBy: { $in: allowedIds } });
                }
            }
            if (typeof next === 'function')
                next();
        };
        schema.pre('find', filterByOrgId);
        schema.pre('findOne', filterByOrgId);
        schema.pre('findOneAndUpdate', filterByOrgId);
        schema.pre('countDocuments', filterByOrgId);
        schema.pre('updateMany', filterByOrgId);
        schema.pre('deleteMany', filterByOrgId);
    }
});
