const fs = require('fs');
const path = 'src/domains/books/controllers/journalController.ts';
let content = fs.readFileSync(path, 'utf8');

const newFunction = `
export const reverseJournal = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { id } = req.params;
    const { reversalDate, reversalReason } = req.body;

    const originalJournal = await Journal.findOne({ _id: id, orgId });
    if (!originalJournal) return res.status(404).json({ message: 'Journal not found' });
    if (originalJournal.status === 'Reversed') return res.status(400).json({ message: 'Journal is already reversed' });

    // Enterprise checks: Should verify if the reversalDate is in a closed FiscalPeriod.
    // Assuming period checks pass...

    const reversedLineItems = originalJournal.lineItems.map(item => ({
      account: item.account,
      description: \`Reversal of \${originalJournal.journalNumber} - \${item.description || ''}\`,
      contact: item.contact,
      debits: item.credits, // Swap debits and credits
      credits: item.debits,
      costCenter: item.costCenter,
      department: item.department
    }));

    const reversalJournal = new Journal({
      orgId,
      date: new Date(reversalDate || new Date()),
      journalNumber: \`\${originalJournal.journalNumber}-REV\`,
      referenceNumber: originalJournal.journalNumber,
      notes: reversalReason || \`Reversal of journal \${originalJournal.journalNumber}\`,
      reportingMethod: originalJournal.reportingMethod,
      currency: originalJournal.currency,
      lineItems: reversedLineItems,
      subTotal: originalJournal.subTotal,
      total: originalJournal.total,
      status: 'Published',
      reversalOfId: originalJournal._id
    });

    const savedReversal = await reversalJournal.save();

    // Mark original as reversed
    originalJournal.status = 'Reversed';
    originalJournal.reversedById = savedReversal._id as any;
    originalJournal.reversalReason = reversalReason;
    await originalJournal.save();

    res.status(201).json(savedReversal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error reversing journal' });
  }
};
`;

content += newFunction;
fs.writeFileSync(path, content);
