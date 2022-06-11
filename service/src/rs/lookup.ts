import fs from 'fs';
import path from 'path';

export function lookupModule(root: string, name: string): string | undefined {
  if (name.indexOf('/') !== -1) {
    const fp = path.join(root, 'node_modules', name);
    if (fs.existsSync(fp)) {
      return `/node_modules/${name}`;
    } if (fs.existsSync(`${fp}.ts`)) {
      return `/node_modules/${name}.ts`;
    } if (fs.existsSync(`${fp}.js`)) {
      return `/node_modules/${name}.js`;
    }
  }
  const filePack = path.join(root, 'node_modules', name, 'package.json');
  if (!fs.existsSync(filePack)) {
    return undefined;
  }
  const pack = JSON.parse(fs.readFileSync(filePack, 'utf-8'));
  const relFileModule = pack.module || pack.main || 'index.js';
  const fileModule = path.join(root, 'node_modules', name, relFileModule);
  if (!fs.existsSync(fileModule)) {
    return undefined;
  }
  return `/node_modules/${name}/${relFileModule}`;
}
