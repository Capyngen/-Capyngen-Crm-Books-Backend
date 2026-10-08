const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'src', 'app.ts');
const openApiPath = path.join(root, 'docs', 'openapi.json');
const outputPath = path.join(root, 'docs', 'API_CATALOG.md');
const appSource = fs.readFileSync(appPath, 'utf8');
const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const routeImports = new Map();

for (const match of appSource.matchAll(/import\s+(?:\{([^}]+)\}|([A-Za-z_$][\w$]*))\s+from\s+['"]([^'"]*routes\/[^'"]+)['"]/g)) {
  const names = match[1]
    ? match[1].split(',').map((name) => name.trim().split(/\s+as\s+/).pop())
    : [match[2]];
  for (const name of names) routeImports.set(name, path.resolve(root, 'src', match[3]));
}

const operations = new Map();
const normalizePath = (value) => {
  const normalized = value.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/';
};
const lineNumber = (source, index) => source.slice(0, index).split('\n').length;

function addOperation(method, route, sourceFile, line) {
  const normalizedRoute = normalizePath(route);
  const key = `${method.toUpperCase()} ${normalizedRoute}`;
  if (!operations.has(key)) operations.set(key, { method: method.toUpperCase(), route: normalizedRoute, sourceFile, line });
}

function scanRouter(sourceFile, prefix) {
  const extensionless = sourceFile.replace(/\.(ts|js)$/, '');
  const file = ['.ts', '.js'].map((extension) => `${extensionless}${extension}`).find((candidate) => fs.existsSync(candidate));
  if (!file) return;

  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/router\.route\(\s*['"]([^'"]+)['"]\s*\)([\s\S]*?);/g)) {
    for (const methodMatch of match[2].matchAll(/\.(get|post|put|patch|delete|head|options)\s*\(/g)) {
      addOperation(methodMatch[1], `${prefix}/${match[1]}`.replace(/\/{2,}/g, '/'), path.relative(root, file).replace(/\\/g, '/'), lineNumber(source, match.index + methodMatch.index));
    }
  }

  for (const match of source.matchAll(/router\.(get|post|put|patch|delete|head|options)\s*\(\s*['"]([^'"]+)['"]/g)) {
    addOperation(match[1], `${prefix}/${match[2]}`.replace(/\/{2,}/g, '/'), path.relative(root, file).replace(/\\/g, '/'), lineNumber(source, match.index));
  }
}

for (const match of appSource.matchAll(/app\.use\(\s*['"]([^'"]+)['"]\s*,([\s\S]*?)\);/g)) {
  const prefix = match[1].replace(/\/$/, '');
  for (const [name, sourceFile] of routeImports) {
    if (new RegExp(`\\b${name}\\b`).test(match[2])) scanRouter(sourceFile, prefix);
  }

  const requiredRouter = match[2].match(/require\(['"](\.\/[^'"]*routes\/[^'"]+)['"]\)/);
  if (requiredRouter) scanRouter(path.resolve(root, 'src', requiredRouter[1]), prefix);
}

for (const match of appSource.matchAll(/app\.(get|post|put|patch|delete|head|options)\(\s*['"]([^'"]+)['"]/g)) {
  addOperation(match[1], match[2], 'src/app.ts', lineNumber(appSource, match.index));
}

const specOperations = new Map();
for (const [route, item] of Object.entries(openApi.paths || {})) {
  for (const method of methods) {
    if (item[method]) specOperations.set(`${method.toUpperCase()} ${normalizePath(route)}`, item[method]);
  }
}

const inlineJson = (value) => `\`${JSON.stringify(value).replace(/\|/g, '\\|')}\``;
const requestContract = (entry, operation) => {
  if (entry.route === '/api/v1/upload' && entry.method === 'POST') {
    return { schema: '`multipart/form-data` (`file`: one required file)', payload: '`file=<binary file>`' };
  }
  if (entry.route === '/api/v1/employees/login' && entry.method === 'POST') {
    return { schema: '`application/json` (forwarded to HRMS)', payload: 'HRMS login payload; fields are defined by the upstream service.' };
  }

  const content = operation?.requestBody?.content || {};
  const mediaType = Object.keys(content)[0];
  if (mediaType) {
    const body = content[mediaType];
    const schema = body.schema || {};
    const schemaName = schema.$ref ? `schema \`${schema.$ref}\`` : `schema ${inlineJson(schema)}`;
    const payload = body.example === undefined
      ? 'No example or field-level payload is defined in OpenAPI.'
      : inlineJson(body.example);
    return { schema: `\`${mediaType}\`, ${operation.requestBody.required ? 'required' : 'optional'}; ${schemaName}`, payload };
  }

  if (entry.method === 'GET' || entry.method === 'DELETE' || entry.method === 'HEAD') {
    return { schema: 'No request body declared.', payload: 'None.' };
  }
  return {
    schema: 'Not declared in OpenAPI; inspect the linked route/controller and model.',
    payload: 'Exact fields are not documented in the current source contract; no sample is inferred.',
  };
};

const sortedOperations = [...operations.values()].sort((left, right) => left.route.localeCompare(right.route) || left.method.localeCompare(right.method));
const documentedCount = sortedOperations.filter((entry) => specOperations.has(`${entry.method} ${entry.route}`)).length;
const specOnly = [...specOperations.keys()].filter((key) => !operations.has(key)).sort();
const lines = [
  '# API Catalog',
  '',
  `> Current source inventory: **${sortedOperations.length} locally declared operations**. ${documentedCount} also have an OpenAPI operation. Generated from mounted routes in \`src/app.ts\` and routers; rerun \`node scripts/generate-api-catalog.js\` after route changes.`,
  '',
  '## Scope and Contract Notes',
  '',
  '- The count is the unique HTTP method + route combinations registered by this repository. It includes the unversioned health check and the local login proxy handler.',
  '- Three mounted HRMS proxy families are not included in the numeric count because their methods and paths are owned by the upstream service and are not enumerable here: `/api/v1/employees/*` (except the explicit login handler), `/api/v1/superadmin/public/*`, and `/api/v1/subscribe/*`.',
  '- OpenAPI currently defines only generic request schemas for most operations; it does not provide resource field definitions or request examples. The catalog reports that limitation instead of guessing payload fields.',
  '- For operations without a declared OpenAPI body, use the linked handler/model to confirm accepted fields before sending a payload. `POST`, `PUT`, and `PATCH` do not imply a particular JSON shape by themselves.',
  '- `{id}` and other braces in paths are path parameters. Send `Authorization: Bearer <token>` where the route mount requires authentication; authorization may also depend on Books subscription/features or RBAC permissions.',
  '',
  '## Endpoint Inventory',
  '',
  '| # | Method | Route | Authentication | Request schema | Payload contract | Source |',
  '|---:|---|---|---|---|---|---|',
];

for (const [index, entry] of sortedOperations.entries()) {
  const key = `${entry.method} ${entry.route}`;
  const operation = specOperations.get(key);
  const request = requestContract(entry, operation);
  const auth = operation
    ? operation.security?.length === 0 ? 'Public' : 'Bearer'
    : entry.route === '/health' || entry.route.startsWith('/api/v1/books/public-test/') ? 'Public' : 'See mount middleware';
  const source = `[${entry.sourceFile}#L${entry.line}](${entry.sourceFile}#L${entry.line})`;
  lines.push(`| ${index + 1} | \`${entry.method}\` | \`${entry.route}\` | ${auth} | ${request.schema.replace(/\|/g, '\\|')} | ${request.payload.replace(/\|/g, '\\|')} | ${source} |`);
}

lines.push('', '## OpenAPI Coverage', '');
lines.push(`- Source operations also present in OpenAPI: **${documentedCount} / ${sortedOperations.length}**.`);
lines.push(`- Current source operations without an OpenAPI entry: **${sortedOperations.length - documentedCount}**.`);
lines.push(`- OpenAPI-only operations not mounted in current source: **${specOnly.length}**${specOnly.length ? ` (${specOnly.map((key) => `\`${key}\``).join(', ')})` : ''}.`);
lines.push('- Source of declared schemas: [openapi.json](openapi.json). Runtime mounts and middleware: [src/app.ts](../src/app.ts).');
lines.push('');

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
console.log(`Generated ${outputPath}: ${sortedOperations.length} source operations, ${documentedCount} matched to OpenAPI.`);