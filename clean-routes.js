const fs = require('fs');
const path = 'D:\\frontend\\src\\app\\routes.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },`n            { path: '*', element: <Navigate to=\"dashboard\" replace /> },",
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },"
);
content = content.replace(
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },`n            { path: '*', element: <Navigate to=\"dashboard\" replace /> },",
    "{ path: '*', element: <Navigate to=\"dashboard\" replace /> },"
);

fs.writeFileSync(path, content, 'utf8');
