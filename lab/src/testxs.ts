import fs from 'fs';
import path from 'path';
import xs from './transformers/xs';

const root = '/Users/amos/Projects/kids/app';
const file = path.join(root, 'src/libs/index.ts');
const code = fs.readFileSync(file, 'utf-8');
const out = xs(root, file, code, 'module');
console.log(out);