"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksProject = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProjectUserSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    ratePerHour: { type: Number }
}, { _id: false });
const ProjectTaskSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    ratePerHour: { type: Number },
    billable: { type: Boolean, default: true }
});
const BooksProjectSchema = new mongoose_1.Schema({
    orgId: { type: String },
    projectName: { type: String, required: true },
    projectCode: { type: String },
    customer: { type: String, required: true },
    billingMethod: {
        type: String,
        required: true,
        enum: ['fixed', 'project_hours', 'task_hours', 'staff_hours']
    },
    totalCost: { type: Number },
    ratePerHour: { type: Number },
    description: { type: String },
    costBudget: { type: Number },
    revenueBudget: { type: Number },
    users: [ProjectUserSchema],
    tasks: [ProjectTaskSchema],
    watchlist: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive', 'Completed', 'Pending'], default: 'Active' }
}, { timestamps: true });
exports.BooksProject = mongoose_1.default.models.BooksProject || mongoose_1.default.model('BooksProject', BooksProjectSchema, 'projects');
if (!mongoose_1.default.models.Project) {
    try {
        mongoose_1.default.model('Project', BooksProjectSchema, 'projects');
    }
    catch (e) { }
}
