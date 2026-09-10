import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectUser {
  userId: string; // The user ID selected in the dropdown
  ratePerHour?: number;
}

export interface IProjectTask {
  name: string;
  description?: string;
  ratePerHour?: number;
  billable: boolean;
}

export interface IBooksProject extends Document {
  orgId?: string;
  projectName: string;
  projectCode?: string;
  customer: string;
  billingMethod: 'fixed' | 'project_hours' | 'task_hours' | 'staff_hours';
  totalCost?: number;
  ratePerHour?: number;
  description?: string;
  costBudget?: number;
  revenueBudget?: number;
  users: IProjectUser[];
  tasks: IProjectTask[];
  watchlist: boolean;
  status: 'Active' | 'Inactive' | 'Completed' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectUserSchema = new Schema<IProjectUser>({
  userId: { type: String, required: true },
  ratePerHour: { type: Number }
}, { _id: false });

const ProjectTaskSchema = new Schema<IProjectTask>({
  name: { type: String, required: true },
  description: { type: String },
  ratePerHour: { type: Number },
  billable: { type: Boolean, default: true }
});

const BooksProjectSchema = new Schema<IBooksProject>(
  {
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
  },
  { timestamps: true }
);

export const BooksProject = mongoose.model<IBooksProject>('BooksProject', BooksProjectSchema);
