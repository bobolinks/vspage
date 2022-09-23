import os from 'os';
import path from 'path';
import { parseArgs } from './args';
import pkg from '../package.json';

const args = parseArgs({
  root: {
    alias: 'd',
    description: '指定工作区根目录，默认为cwd',
  },
});

const cwd = process.cwd();

export const env = {
  debug: process.env.NODE_ENV !== 'production',
  version: pkg.version,
  platform: os.platform as any,
  paths: {
    bin: cwd,
    root: args.root ? path.resolve(cwd, args.root) || cwd : cwd,
  },
  args,
};

export default env;
