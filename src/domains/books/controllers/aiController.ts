import { Request, Response } from 'express';

// ==========================================
// MOCK AI SERVICE (Simulating Google Gemini)
// ==========================================

export const classifyAccount = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const input = `${name} ${description || ''}`.toLowerCase();
    
    // Simulated delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    let accountGroup = 'Expenses';
    let accountType = 'Expense';

    if (input.match(/bank|cash|petty/)) {
      accountGroup = 'Assets';
      accountType = 'Cash';
    } else if (input.match(/receivable|debtor|customer/)) {
      accountGroup = 'Assets';
      accountType = 'Accounts Receivable';
    } else if (input.match(/payable|creditor|supplier/)) {
      accountGroup = 'Liabilities';
      accountType = 'Accounts Payable';
    } else if (input.match(/tax|gst|vat/)) {
      accountGroup = 'Liabilities';
      accountType = 'Other Current Liability';
    } else if (input.match(/sale|revenue|income/)) {
      accountGroup = 'Income';
      accountType = 'Income';
    } else if (input.match(/marketing|ad|facebook|google/)) {
      accountGroup = 'Expenses';
      accountType = 'Advertising & Marketing';
    } else if (input.match(/aws|cloud|server|software/)) {
      accountGroup = 'Expenses';
      accountType = 'IT & Cloud Services';
    }

    res.json({ accountGroup, accountType, confidence: 0.92 });
  } catch (error) {
    res.status(500).json({ message: 'AI Error' });
  }
};

export const suggestDimensions = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const input = (description || '').toLowerCase();
    
    await new Promise(resolve => setTimeout(resolve, 600));

    let costCenter = null;
    let department = null;

    if (input.match(/marketing|ad|campaign/)) {
      costCenter = 'CC-MKTG';
      department = 'Marketing';
    } else if (input.match(/server|cloud|aws/)) {
      costCenter = 'CC-ENG';
      department = 'Engineering';
    } else if (input.match(/hr|payroll|salary/)) {
      costCenter = 'CC-HR';
      department = 'Human Resources';
    }

    res.json({ costCenter, department, confidence: 0.85 });
  } catch (error) {
    res.status(500).json({ message: 'AI Error' });
  }
};

export const detectAnomalies = async (req: Request, res: Response) => {
  try {
    const { journals } = req.body;
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock anomaly detection logic
    const anomalies: any[] = [];
    
    if (Array.isArray(journals)) {
      journals.forEach((j: any) => {
        if (j.total > 50000) {
          anomalies.push({
            journalId: j._id,
            reason: 'Unusually high amount for standard operations.',
            severity: 'High'
          });
        }
        
        // Check for missing dimensions on high value items
        if (j.total > 10000) {
          const missingDimensions = j.lineItems?.some((line: any) => line.debits > 0 && !line.costCenter);
          if (missingDimensions) {
            anomalies.push({
              journalId: j._id,
              reason: 'High value expense missing Cost Center allocation.',
              severity: 'Medium'
            });
          }
        }
      });
    }

    res.json({ anomalies, scannedCount: journals?.length || 0 });
  } catch (error) {
    res.status(500).json({ message: 'AI Error' });
  }
};
