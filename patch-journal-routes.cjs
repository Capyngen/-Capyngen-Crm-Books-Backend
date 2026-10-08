const fs = require('fs');
const path = 'src/domains/books/routes/journalRoutes.ts';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "updateJournal, deleteJournal } from '../controllers/journalController';";
const importReplacement = "updateJournal, deleteJournal, reverseJournal } from '../controllers/journalController';";
content = content.replace(importTarget, importReplacement);

const routeTarget = "router.delete('/:id', deleteJournal);";
const routeReplacement = `router.delete('/:id', deleteJournal);
router.post('/:id/reverse', reverseJournal);`;
content = content.replace(routeTarget, routeReplacement);

fs.writeFileSync(path, content);
