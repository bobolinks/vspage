import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export function prepare(extRoot: string): Promise<any> | boolean {
  const nodeModulesPath = path.join(extRoot, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    return true;
  }
  const child = exec('npm i', {
    cwd: extRoot,
  });
  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
}