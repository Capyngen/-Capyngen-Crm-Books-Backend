const fs = require('fs');

const path = 'D:\\Capyngen-Crm-Superadmin-main\\src\\constants\\hrmsPlanCatalog.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /for \(const feature of ACCOUNTS_FEATURE_CATALOG\) \{[\s\S]*?\}\s+\}/;

const match = content.match(regex);
if (match) {
    const newLoops = `${match[0]}

    for (const feature of BILLING_FEATURE_CATALOG) {
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);
      for (const alias of feature.aliases) {
        FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);
      }
    }

    for (const feature of INVENTORY_FEATURE_CATALOG) {
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.key), feature.key);
      FEATURE_ALIAS_MAP.set(normalizeValue(feature.label), feature.key);
      for (const alias of feature.aliases) {
        FEATURE_ALIAS_MAP.set(normalizeValue(alias), feature.key);
      }
    }
`;
    content = content.replace(regex, newLoops);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched FEATURE_ALIAS_MAP via Regex");
} else {
    console.log("Could not find regex match");
}
