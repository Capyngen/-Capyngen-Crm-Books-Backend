const fs = require('fs');

const path = 'D:\\backend\\src\\app.ts';
let content = fs.readFileSync(path, 'utf8');

// Move test route up before verifyCapyngenToken
content = content.replace(
  "app.use('/api/v1/books/test', testRoutes);",
  ""
);

const target = "app.use('/api/v1/books', verifyCapyngenToken, requireBooksSubscription);";
const replacement = "app.use('/api/v1/books/public-test', require('./domains/books/routes/testRoutes').default);\n" + target;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
