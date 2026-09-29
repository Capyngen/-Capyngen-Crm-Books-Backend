const fs = require('fs');

function patch(path, name) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Add imports
    if (!content.includes('useMemo')) {
        content = content.replace("import { Outlet } from 'react-router-dom'", "import { useMemo } from 'react'\nimport { Outlet } from 'react-router-dom'\nimport { useQuery } from '@tanstack/react-query'");
    }

    const lowerName = name.toLowerCase();
    const isFeatureLockedLogic = `
function isFeatureLocked(moduleId: string, childId: string | null, featureKeys: string[]) {
  if (['home', 'reports', 'documents', 'configure-features', 'apps', 'getting-started'].includes(moduleId)) return false;

  let key = \`${lowerName}-\${moduleId}\`;
  if (childId) {
    key = \`${lowerName}-\${moduleId}-\${childId}\`;
  }

  if (!childId) { return !featureKeys.some(f => f.startsWith(\`${lowerName}-\` + moduleId)); } return !featureKeys.includes(key);
}

function filterNavigation(nav: any[], org: any, user: any, featureKeys: string[] = []) {
  const isAdmin = user?.role === 'Admin' || user?.role === 'Owner' || user?.isWorkspaceOwner;
  const perms = org?.rolePermissions?.${lowerName} || {};
  const alwaysAllowed = ['home', 'getting-started']; 
  
  return nav.map(group => {
    const filteredItems = group.items.map((item: any) => {
      let hasRbacPermission = isAdmin || alwaysAllowed.includes(item.id);
      const moduleId = item.id.replace(/-/g, '_');
      const modulePerms = perms[moduleId];
      
      if (!item.children) {
        if (!hasRbacPermission && !modulePerms?.[moduleId]?.view) return null;
        const locked = isFeatureLocked(item.id, null, featureKeys);
        return { ...item, isLocked: locked };
      }
      
      const filteredChildren = item.children.map((child: any) => {
        let entityId = child.id.replace(/-/g, '_');
        const childHasPerm = hasRbacPermission || modulePerms?.[entityId]?.view === true;
        if (!childHasPerm) return null;

        const childLocked = isFeatureLocked(item.id, child.id, featureKeys);
        return { ...child, isLocked: childLocked };
      }).filter(Boolean);
      
      if (filteredChildren.length > 0) {
        const allChildrenLocked = filteredChildren.every((c: any) => c.isLocked);
        return { ...item, children: filteredChildren, isLocked: allChildrenLocked };
      }
      return null;
    }).filter(Boolean);
    
    return { ...group, items: filteredItems };
  });
}
`;

    // Inject logic before export function
    if (!content.includes('isFeatureLocked')) {
        content = content.replace(`export function ${name}Layout() {`, isFeatureLockedLogic + `\nexport function ${name}Layout() {`);
    }

    // Inside component
    const navPatch = `
  const { data: meData } = useQuery({ queryKey: ["books_me"] }) as any
  const featureKeys = meData?.plan?.featureKeys || []
  const currentOrg = store.selectedOrganization
  const currentUser = store.user
  const navigation = useMemo(() => filterNavigation(${lowerName}Navigation, currentOrg, currentUser, featureKeys), [currentOrg, currentUser, featureKeys])
`;

    if (!content.includes('const navigation = useMemo')) {
        content = content.replace(
            `return (`,
            `${navPatch}\n  return (`
        );
        
        // Update AppShell to use filtered navigation
        content = content.replace(
            `<AppShell navigation={${lowerName}Navigation}`,
            `<AppShell navigation={navigation}`
        );
    }
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched Visual Locks for", name);
}

patch('D:\\frontend\\src\\domains\\billing\\layouts\\BillingLayout.tsx', 'Billing');
patch('D:\\frontend\\src\\domains\\inventory\\layouts\\InventoryLayout.tsx', 'Inventory');
