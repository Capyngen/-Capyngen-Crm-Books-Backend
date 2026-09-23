const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const specPath = path.join(root, 'docs', 'openapi.json');
const outputPath = path.join(root, 'docs', 'API_DOCUMENTATION.md');
const payloadContractsPath = path.join(root, 'docs', 'API_PAYLOAD_CONTRACTS.md');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const payloadContracts = fs.readFileSync(payloadContractsPath, 'utf8').trim();

const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const json = (value) => `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
const inline = (value) => value === undefined ? '-' : `\`${String(value)}\``;
const schemaText = (schema) => {
  if (!schema) return 'Not specified in OpenAPI.';
  if (schema.$ref) return `Schema reference: \`${schema.$ref}\``;
  return json(schema);
};
const exampleFor = (operation, status) => {
  const response = operation.responses && operation.responses[status];
  return response?.content?.['application/json']?.example;
};
const requestContent = (operation) => {
  const content = operation.requestBody?.content || {};
  const media = Object.keys(content)[0];
  return media ? { media, schema: content[media].schema, example: content[media].example } : null;
};
const operations = [];
for (const [route, item] of Object.entries(spec.paths || {})) {
  for (const method of methods) {
    const operation = item[method];
    if (operation) operations.push({ route, method: method.toUpperCase(), operation });
  }
}

const tags = [...new Set(operations.flatMap(({ operation }) => operation.tags || ['Untagged']))].sort();
const lines = [];
lines.push('# API Documentation for Flutter Integration');
lines.push('');
lines.push(`> Generated from [openapi.json](openapi.json). Generated operation count: **${operations.length}**. Run \`npm run docs:api\` after changing the OpenAPI contract.`);
lines.push('');
lines.push('This document describes the API contract currently represented by the repository. It intentionally distinguishes implemented contract metadata from behavior that is not present in source code. Do not infer an undocumented OTP, MFA, webhook, file-upload, export, or notification API from the feature checklist below; those capabilities are currently absent unless an endpoint appears in the catalog.');
lines.push('');
lines.push('## 1. Connection and Versioning');
lines.push('');
lines.push(`- **Base URL:** replace \`${spec.servers?.[0]?.url || '{{base_url}}'}\` with the deployment origin, for example \`https://api.example.com\`.`);
lines.push('- **API prefix/version:** `/api/v1`; health is the unversioned exception at `/health`.');
lines.push('- **Transport:** HTTPS in non-local environments; JSON request and response bodies unless the endpoint explicitly declares another media type.');
lines.push('- **Content negotiation:** send `Accept: application/json` and `Content-Type: application/json` for JSON bodies.');
lines.push('- **IDs:** MongoDB ObjectId values are represented as 24-character hexadecimal strings unless a response says otherwise.');
lines.push('- **Dates:** use ISO 8601 strings with timezone, preferably UTC, for example `2026-09-23T12:00:00.000Z`.');
lines.push('- **Amounts/decimals:** JSON numbers are used by the current contract; Flutter should parse defensively and use decimal-safe arithmetic for money. Do not use binary floating point for posting accounting totals.');
lines.push('- **Currency:** send and display an explicit ISO 4217 currency code where the resource has one; do not assume the device locale currency.');
lines.push('');
lines.push('## 2. Request Headers and Authentication');
lines.push('');
lines.push('| Header | Required | Value |');
lines.push('|---|---:|---|');
lines.push('| `Accept` | Recommended | `application/json` |');
lines.push('| `Content-Type` | JSON requests | `application/json` |');
lines.push('| `Authorization` | Protected APIs | `Bearer <access-token>` |');
lines.push('| `Cookie` | Alternative supported by server | `accessToken_hrms=<token>` or legacy `accessToken=<token>` |');
lines.push('');
lines.push('The server verifies a JWT with `ACCESS_TOKEN_SECRET` (with a development fallback), loads the employee from the HRMS `employees` collection, and derives `user` and `org` context from the token. A Flutter client should store access tokens in platform-secure storage, send the bearer header on every protected request, and treat HTTP 401 as a session refresh/re-login boundary.');
lines.push('');
lines.push('### Authorization layers');
lines.push('');
lines.push('- Public operations are marked with `security: []` in the endpoint catalog.');
lines.push('- Books operations require a valid token, an organization context, a Books-compatible company platform (`all`, `accounts`, `books`, `crm`, or `sales`), an active subscription, and the route feature key where the runtime mount applies.');
lines.push('- The OpenAPI file does not define per-operation role/permission names. RBAC endpoints are documented as API surfaces, but callers must use the server’s role assignment rules; do not hard-code Admin access in Flutter.');
lines.push('- A 403 may mean platform mismatch, missing subscription, invalid plan, missing feature key, or insufficient application permission.');
lines.push('');
lines.push('## 3. Response and Error Contract');
lines.push('');
lines.push('### Success');
lines.push(json({ success: true, message: 'Request successful', data: '<resource, object, array, or report-specific value>', meta: { page: 1, limit: 25, totalCount: 0, totalPages: 0 } }));
lines.push('');
lines.push('- `data` is `null`, an object, an array, or a report-specific object according to the operation.');
lines.push('- `meta` is present when pagination metadata is available. Defaults are `page=1`, `limit=25`; the server caps `limit` at 100. Invalid/non-positive values fall back to defaults.');
lines.push('- Array responses are normalized and sliced by the shared response middleware.');
lines.push('');
lines.push('### Error');
lines.push(json({ success: false, message: 'Human-readable error', data: null }));
lines.push('');
lines.push('In development, the top-level error handler may also return `stack`; never display or depend on it in Flutter. Error statuses used by the contract are:');
lines.push('');
lines.push('| Status | Meaning | Typical causes |');
lines.push('|---:|---|---|');
lines.push('| 400 | Validation/business rule failure | Missing, malformed, or inconsistent payload |');
lines.push('| 401 | Authentication/context failure | Missing, invalid, or expired token; missing organization context; unknown user |');
lines.push('| 403 | Authorization/subscription failure | Plan, platform, feature, role, or permission restriction |');
lines.push('| 404 | Missing resource/context | Unknown ID, company profile, plan, or related entity |');
lines.push('| 409 | Conflict | Duplicate or state transition conflict when emitted by an operation |');
lines.push('| 422 | Unprocessable entity | Only when explicitly listed by an operation |');
lines.push('| 429 | Rate limited | Deployment or upstream rate limiter |');
lines.push('| 500 | Server failure | Database, subscription, feature, or unexpected server error |');
lines.push('');
lines.push('## 4. Cross-Module Rules');
lines.push('');
lines.push('### CRUD, search, filter, sort, and pagination');
lines.push('');
lines.push('- Collection endpoints conventionally use `GET /resource`, `POST /resource`; item endpoints use `GET /resource/{id}`, `PUT`/`PATCH /resource/{id}`, and `DELETE /resource/{id}` when listed below.');
lines.push('- `page` and `limit` are the only globally guaranteed pagination parameters. `limit` is an integer from 1 to 100.');
lines.push('- `status` is the only globally repeated filter in the generated contract. Additional filters are listed per endpoint only when OpenAPI declares them.');
lines.push('- No global `sort`, `search`, or free-text filter contract is declared. A Flutter UI must not send undocumented query keys and assume they work.');
lines.push('- No global bulk, import, export, upload, download, or lifecycle-transition contract is declared; endpoint-specific exceptions are shown in the catalog.');
lines.push('');
lines.push('### Accounting and calculation boundaries');
lines.push('');
lines.push('- The current OpenAPI contract does not provide typed line-item, tax, discount, payment allocation, inventory valuation, or journal-posting schemas. Those details must be read from the corresponding controller/model before implementing a form or calculation client.');
lines.push('- The server remains authoritative for tax, discount, payment, inventory, balance, aging, valuation, and accounting calculations. Flutter should display server totals and avoid silently recomputing posted values.');
lines.push('- Related IDs must reference existing records in the same organization. Preserve IDs returned by the API; do not use display names as foreign keys.');
lines.push('');
lines.push(payloadContracts);
lines.push('');
lines.push('## 5. Requested Capabilities Not Present in the Contract');
lines.push('');
lines.push('| Capability | Current status | Flutter guidance |');
lines.push('|---|---|---|');
lines.push('| OTP, MFA, refresh-token, logout | No endpoint is listed in OpenAPI | Use the external HRMS/session contract; do not invent paths in this client. |');
lines.push('| Webhooks and third-party integrations | No endpoint is listed | No client integration contract exists here. |');
lines.push('| File/document upload/download | No multipart or binary endpoint is listed | No upload/download client should be generated from this repository. |');
lines.push('| Notifications/activity APIs | No dedicated notification endpoint is listed | Activity report endpoints are listed under Reports; they are not push notifications. |');
lines.push('| Bulk import/export | No dedicated endpoint is listed | The expense bulk endpoints are documented below; they are not assumed to be import/export without a declared request body. |');
lines.push('| Status/lifecycle transitions | No dedicated transition endpoint is listed | Use resource update operations only where listed and verify controller behavior. |');
lines.push('');
lines.push('## 6. Module and Feature Index');
lines.push('');
for (const tag of tags) {
  const count = operations.filter(({ operation }) => (operation.tags || ['Untagged']).includes(tag)).length;
  lines.push(`- **${tag}:** ${count} operation(s)`);
}
lines.push('');
lines.push('## 7. Complete Endpoint Catalog');
lines.push('');
lines.push('Every operation below is generated from `openapi.json`, including method, path, parameters, request body, success example, and every declared error status. A missing field means the current OpenAPI contract does not declare it.');
lines.push('');
for (const { route, method, operation } of operations) {
  const anchor = `${method.toLowerCase()}-${route.replace(/[^a-zA-Z0-9]+/g, '-')}`.replace(/-+$/, '');
  lines.push(`### ${method} ${route}`);
  lines.push(`- **Operation:** ${operation.summary || 'No summary'} | **Tag:** ${(operation.tags || ['Untagged']).join(', ')}`);
  lines.push(`- **Authentication:** ${operation.security && operation.security.length ? 'Bearer token required' : 'Public according to OpenAPI'}`);
  lines.push('- **Permission/subscription:** See authorization layers; no explicit permission key is declared for this operation.');
  const params = operation.parameters || [];
  if (params.length) {
    lines.push('- **Path/query parameters:**');
    lines.push('| Name | Location | Required | Type/constraints |');
    lines.push('|---|---|---:|---|');
    for (const parameter of params) {
      const schema = parameter.schema || {};
      const constraints = [schema.type, schema.format, schema.enum ? `enum=${schema.enum.join('|')}` : '', schema.minimum !== undefined ? `min=${schema.minimum}` : '', schema.maximum !== undefined ? `max=${schema.maximum}` : '', schema.default !== undefined ? `default=${schema.default}` : ''].filter(Boolean).join(', ');
      lines.push(`| \`${parameter.name}\` | ${parameter.in} | ${parameter.required ? 'yes' : 'no'} | ${inline(constraints || 'not specified')} |`);
    }
  } else {
    lines.push('- **Path/query parameters:** None declared.');
  }
  const body = requestContent(operation);
  if (body) {
    lines.push(`- **Request body:** ${body.media}; ${operation.requestBody.required ? 'required' : 'optional'}`);
    lines.push(schemaText(body.schema));
    lines.push('- **Detailed field contract:** See the matching resource section under `Request Payload Contracts` above. The generic OpenAPI `ApiRequest` reference does not replace the model-level fields.');
    if (body.example !== undefined) {
      lines.push('- **Request example:**');
      lines.push(json(body.example));
    }
  } else {
    lines.push(`- **Request body:** Not applicable; ${method} operations in this contract do not accept a JSON body.`);
  }
  lines.push('- **Responses:**');
  for (const [status, response] of Object.entries(operation.responses || {})) {
    lines.push(`  - **HTTP ${status}:** ${response.description || 'No description'}`);
    const example = exampleFor(operation, status);
    if (example !== undefined) lines.push(`    - Example: ${inline(JSON.stringify(example))}`);
  }
  lines.push('');
}
lines.push('## 8. Flutter Integration Checklist');
lines.push('');
lines.push('1. Configure the deployment origin as `baseUrl`; append the exact paths above.');
lines.push('2. Add `Authorization: Bearer <access-token>` for operations whose OpenAPI security is bearer.');
lines.push('3. Serialize JSON with the exact casing and IDs in the endpoint-specific contract; reject unknown enum values gracefully.');
lines.push('4. Decode the wrapper first, then decode `data`; preserve `meta` for paged screens.');
lines.push('5. On 401, clear stale credentials or use the external HRMS refresh flow; on 403, show subscription/permission state instead of retrying.');
lines.push('6. Treat 400/404 as actionable API errors, 409/422 as form/state conflicts, and 500/429 as retryable only under an explicit retry policy.');
lines.push('7. Keep money as decimal-safe values and use server-returned totals for accounting screens.');
lines.push('');
lines.push('## 9. Source of Truth and Regeneration');
lines.push('');
lines.push('- Contract metadata: [openapi.json](openapi.json)');
lines.push('- Runtime route mounting: [src/app.ts](../src/app.ts)');
lines.push('- Response wrapper and pagination: [src/core/middlewares/apiContract.ts](../src/core/middlewares/apiContract.ts), [src/core/http/apiResponse.ts](../src/core/http/apiResponse.ts)');
lines.push('- Authentication/subscription/feature gates: [src/core/middlewares/hrmsAuth.ts](../src/core/middlewares/hrmsAuth.ts)');
lines.push('- Regenerate: `npm run docs:api`');
lines.push('');

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
console.log(`Generated ${outputPath} from ${operations.length} OpenAPI operations.`);
