"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const routingController_1 = require("../domains/inventory/controllers/routingController");
const uri = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
async function run() {
    await mongoose_1.default.connect(uri);
    console.log('Connected to DB');
    const req = {
        org: { _id: '6aa797278d301b4735f1d322' },
        headers: { 'x-org-id': '6aa797278d301b4735f1d322' },
        body: {}
    };
    const res = {
        status: (code) => {
            console.log('Status called with:', code);
            return res;
        },
        json: (data) => {
            console.log('JSON called with:', data);
            return res;
        }
    };
    const next = (err) => {
        if (err) {
            console.error('NEXT CALLED WITH ERROR:\n', err.stack || err);
        }
        else {
            console.log('NEXT called without error');
        }
    };
    await (0, routingController_1.getRoutings)(req, res, next);
    await mongoose_1.default.disconnect();
}
run().catch(console.error);
