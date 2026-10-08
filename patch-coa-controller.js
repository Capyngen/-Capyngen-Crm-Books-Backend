const fs = require('fs');
let content = fs.readFileSync('src/domains/books/controllers/chartOfAccountController.ts', 'utf8');

const target = `export const updateAccount = async (req: Request, res: Response) => {
  try {
    const updated = await ChartOfAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });`;

const replacement = `export const updateAccount = async (req: Request, res: Response) => {
  try {
    if (req.body.parentAccount && req.body.parentAccount === req.params.id) {
      return res.status(400).json({ message: 'Account cannot be its own parent.' });
    }
    if (req.body.parentAccount) {
      const parent = await ChartOfAccount.findById(req.body.parentAccount);
      if (parent && parent.parentAccount?.toString() === req.params.id) {
        return res.status(400).json({ message: 'Circular dependency detected.' });
      }
    }
    const updated = await ChartOfAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/domains/books/controllers/chartOfAccountController.ts', content);
