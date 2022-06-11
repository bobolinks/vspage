import os from 'os';
import fs from 'fs';
import md5 from 'md5';
import path from 'path';
import { version } from './version';
import argsParse, { ArgAnnotation } from './args';

let cmd = 'o';
let argOffset = 2;
if (process.argv.length > 2) {
  if (process.argv[2][0] !== '-') { // is commond
    // eslint-disable-next-line prefer-destructuring
    cmd = process.argv[2];
    argOffset = 3;
  }
}

export const argsAnno: Record<string, ArgAnnotation> = {
  dir: {
    alias: 'd',
    description: '指定小程序项目根路径',
  },
  port: {
    alias: 'p',
    description: '指定服务器端口，默认为随机端口',
  },
  open: {
    alias: 'o',
    description: '是否同时打开浏览器',
  },
};

const { args } = argsParse(argsAnno, process.argv.slice(argOffset));

export interface Environment {
  /** in debug mode */
  debug: boolean,
  /** vide version */
  version: string,
  /** platform name */
  platform: 'windows' | 'darwin' | 'linux' | string,
  /** relative paths */
  paths: {
    /** where the server app is located after 'npm install -g mind-test' */
    bin: string,
    /** project root path */
    root: string,
    /** miniapp src root path */
    miniroot: string;
    /** temp path */
    temp: string;
  },
  /** project uuid */
  uuid: string;
  /** listening address */
  address: {
    host: string;
    port: number;
    url: string;
  };
  /** args passed from cmd line */
  args: Record<string, number | boolean | string>,
  /** running mode */
  cmd: string,
}

const uuid = md5(args.dir || process.cwd());

export const env: Environment = {
  debug: process.env.NODE_ENV !== 'production',
  version,
  platform: os.platform as any,
  paths: {
    bin: args.bin || process.cwd() || __dirname,
    root: args.dir || process.cwd(),
    miniroot: args.dir || process.cwd(),
    temp: path.join(os.tmpdir(), uuid),
  },
  uuid,
  address: {
    host: '',
    port: 0,
    url: '',
  },
  cmd,
  args,
};

if (!fs.existsSync(env.paths.temp)) {
  fs.mkdirSync(env.paths.temp);
}

for (const iterator of ['usr', 'data', 'cloud']) {
  const p = path.join(env.paths.temp, iterator);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
}

export default env;
