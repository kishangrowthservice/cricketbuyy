import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'drizzle') {
        scanDirectory(fullPath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('🔍 Checking for un-sanctioned mutation exports bypassing secureAction...');
const rootDir = path.resolve(__dirname, '../src');
const files = scanDirectory(rootDir);

let violations = 0;
const serverActionRegex = /export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\(/g;

for (const f of files) {
  // Only check actions/ folders or files with 'use server'
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes("'use server'") || content.includes('"use server"')) {
    let match;
    while ((match = serverActionRegex.exec(content)) !== null) {
      const fnName = match[1];
      if (!content.includes('createSecureAction') && !content.includes('secureAction')) {
        console.error(`❌ [Violation] Exported server mutation '${fnName}' in ${path.relative(rootDir, f)} does not use secureAction!`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n🚨 Failed: ${violations} actions bypassed the secureAction mutation pipeline.`);
  process.exit(1);
} else {
  console.log('✅ Success: All server actions conform strictly to the secureAction pipeline!');
}
