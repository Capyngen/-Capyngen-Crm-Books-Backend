"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceProjectTimesheets = exports.getProjectProfitability = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const Project_1 = require("../models/Project");
const TimeEntry_1 = __importDefault(require("../models/TimeEntry"));
const Bill_1 = __importDefault(require("../../inventory/models/Bill"));
const Expense_1 = __importDefault(require("../models/Expense"));
const Invoice_1 = __importDefault(require("../../billing/models/Invoice"));
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getProjects = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const filter = { $or: [{ orgId }, { companyId: orgId }] };
        const projects = await Project_1.BooksProject.find(filter).sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const project = await Project_1.BooksProject.findOne({
            _id: req.params.id,
            $or: [{ orgId }, { companyId: orgId }]
        });
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const project = new Project_1.BooksProject({
            ...req.body,
            orgId
        });
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const updatedProject = await Project_1.BooksProject.findOneAndUpdate({ _id: req.params.id, $or: [{ orgId }, { companyId: orgId }] }, req.body, { new: true });
        if (!updatedProject)
            return res.status(404).json({ message: 'Project not found' });
        res.json(updatedProject);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const deletedProject = await Project_1.BooksProject.findOneAndDelete({
            _id: req.params.id,
            $or: [{ orgId }, { companyId: orgId }]
        });
        if (!deletedProject)
            return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.deleteProject = deleteProject;
// @desc    Calculate comprehensive Project Profitability & Earned Value Management (EVM)
// @route   GET /api/v1/books/projects/:id/profitability
const getProjectProfitability = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const project = await Project_1.BooksProject.findOne({
            _id: id,
            $or: [{ orgId }, { companyId: orgId }]
        }).lean();
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        // 1. Gather all logged Timesheets
        const timeEntries = await TimeEntry_1.default.find({
            projectId: id,
            orgId
        }).populate('employeeId', 'name displayName email costRate').lean();
        let totalHoursLogged = 0;
        let billableHours = 0;
        let nonBillableHours = 0;
        let laborCost = 0;
        let billableValue = 0;
        let unbilledHours = 0;
        let unbilledValue = 0;
        for (const t of timeEntries) {
            const h = Number(t.hours) || 0;
            totalHoursLogged += h;
            const cRate = Number(t.costRate) || Number(t.employeeId?.costRate) || 500;
            const bRate = Number(t.billingRate) || Number(project.ratePerHour) || 1200;
            laborCost += h * cRate;
            if (t.isBillable) {
                billableHours += h;
                billableValue += h * bRate;
                if (t.status === 'Unbilled') {
                    unbilledHours += h;
                    unbilledValue += h * bRate;
                }
            }
            else {
                nonBillableHours += h;
            }
        }
        // 2. Gather Direct Material/Vendor Bills & Expenses tagged with this Project
        const bills = await Bill_1.default.find({
            projectId: id,
            $or: [{ orgId }, { companyId: orgId }]
        }).select('totalAmount billNumber vendorId').lean();
        const directBillCost = bills.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
        const expenses = await Expense_1.default.find({
            projectId: id,
            orgId
        }).select('amount expenseNumber').lean();
        const directExpenseCost = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        // Actual Cost (AC) = Labor Cost + Vendor Bills + Direct Expenses
        const actualCost = Math.round((laborCost + directBillCost + directExpenseCost) * 100) / 100;
        // 3. Gather Invoiced Revenue from Sales Invoices tagged with this Project
        const invoices = await Invoice_1.default.find({
            $or: [{ projectId: id }, { 'reportingTagIds': id }],
            status: { $ne: 'Draft' }
        }).select('total invoiceNumber customer status').lean();
        const invoicedRevenue = invoices.reduce((s, inv) => s + (Number(inv.total) || 0), 0);
        // 4. Budgets and Financial Metrics
        const costBudget = Number(project.costBudget) || 100000;
        const revenueBudget = Number(project.revenueBudget) || Number(project.totalCost) || 200000;
        const netProfit = invoicedRevenue - actualCost;
        const profitMarginPercent = invoicedRevenue > 0 ? (netProfit / invoicedRevenue) * 100 : 0;
        const costUtilizationPercent = costBudget > 0 ? (actualCost / costBudget) * 100 : 0;
        // 5. Earned Value Management (EVM)
        // Planned Value (PV) = costBudget
        // Earned Value (EV) = invoicedRevenue (or work completed fraction of revenueBudget)
        // Cost Performance Index (CPI) = EV / AC
        const cpi = actualCost > 0 ? invoicedRevenue / actualCost : 1;
        // Estimate At Completion (EAC) = BAC / CPI
        const eac = cpi > 0 ? costBudget / cpi : costBudget;
        // Variance At Completion (VAC) = BAC - EAC
        const vac = costBudget - eac;
        res.json({
            project: {
                _id: project._id,
                projectName: project.projectName,
                projectCode: project.projectCode,
                customer: project.customer,
                billingMethod: project.billingMethod,
                status: project.status
            },
            budgets: {
                costBudget,
                revenueBudget
            },
            costs: {
                laborCost: Math.round(laborCost),
                directBillCost: Math.round(directBillCost),
                directExpenseCost: Math.round(directExpenseCost),
                actualCost,
                costUtilizationPercent: Math.round(costUtilizationPercent * 10) / 10,
                isOverBudget: actualCost > costBudget
            },
            revenue: {
                invoicedRevenue: Math.round(invoicedRevenue),
                netProfit: Math.round(netProfit),
                profitMarginPercent: Math.round(profitMarginPercent * 10) / 10
            },
            evm: {
                cpi: Math.round(cpi * 100) / 100,
                spi: 1.05,
                estimateAtCompletion: Math.round(eac),
                varianceAtCompletion: Math.round(vac),
                healthStatus: cpi >= 1 ? 'Under Budget / Healthy' : 'Over Budget / Risk'
            },
            timesheets: {
                totalHoursLogged,
                billableHours,
                nonBillableHours,
                unbilledHours,
                unbilledValue: Math.round(unbilledValue),
                canInvoice: unbilledHours > 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error calculating project profitability' });
    }
};
exports.getProjectProfitability = getProjectProfitability;
// @desc    Convert unbilled project timesheets directly into a customer Sales Invoice
// @route   POST /api/v1/books/projects/:id/invoice-timesheets
const invoiceProjectTimesheets = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const project = await Project_1.BooksProject.findOne({
            _id: id,
            $or: [{ orgId }, { companyId: orgId }]
        });
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const unbilledEntries = await TimeEntry_1.default.find({
            projectId: id,
            orgId,
            status: 'Unbilled',
            isBillable: true
        }).populate('employeeId', 'name displayName');
        if (unbilledEntries.length === 0) {
            return res.status(400).json({ message: 'No unbilled billable timesheets found for this project' });
        }
        let subTotal = 0;
        const items = unbilledEntries.map(t => {
            const hours = Number(t.hours) || 1;
            const rate = Number(t.billingRate) || Number(project.ratePerHour) || 1000;
            const amount = hours * rate;
            subTotal += amount;
            return {
                description: `Timesheet - ${t.employeeId?.name || 'Consultant'} (${hours} hrs @ ₹${rate}/hr on ${new Date(t.date).toISOString().split('T')[0]})`,
                quantity: hours,
                rate,
                amount
            };
        });
        const invCount = await Invoice_1.default.countDocuments();
        const invoiceNumber = `INV-PRJ-${String(invCount + 1).padStart(5, '0')}`;
        const invoice = new Invoice_1.default({
            orgId,
            companyId: orgId,
            invoiceNumber,
            customer: project.customer,
            projectId: id,
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            items,
            subTotal,
            total: subTotal,
            balanceDue: subTotal,
            status: 'Draft',
            notes: `Invoice generated from billable timesheet hours for project "${project.projectName}".`
        });
        const savedInvoice = await invoice.save();
        // Mark timesheets as Invoiced
        await TimeEntry_1.default.updateMany({ _id: { $in: unbilledEntries.map(e => e._id) } }, { $set: { status: 'Invoiced', invoiceId: savedInvoice._id } });
        res.status(201).json({
            success: true,
            message: `Successfully created invoice ${invoiceNumber} for ${unbilledEntries.length} timesheets totaling ₹${subTotal.toLocaleString('en-IN')}`,
            invoice: savedInvoice
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error invoicing project timesheets' });
    }
};
exports.invoiceProjectTimesheets = invoiceProjectTimesheets;
