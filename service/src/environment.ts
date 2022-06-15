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
  root: {
    alias: 'w',
    description: '指定工作区根目录',
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
    /** workspace root path */
    root: string,
    /** miniapp project root path */
    miniroot: string;
    /** miniapp src root path */
    minisrc: string;
    /** temp path */
    temp: string;
  },
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

export const env: Environment = {
  debug: process.env.NODE_ENV !== 'production',
  version,
  platform: os.platform as any,
  paths: {
    bin: args.bin || process.cwd() || __dirname,
    root: args.root || process.cwd(),
    miniroot: args.root || process.cwd(),
    minisrc: args.root || process.cwd(),
    temp: path.join(args.root || process.cwd(), '.vspage/tmp'),
  },
  address: {
    host: '',
    port: 0,
    url: '',
  },
  cmd,
  args,
};

const vspagePath = path.resolve(args.root, '.vspage');
if (!fs.existsSync(vspagePath)) {
  fs.mkdirSync(vspagePath);
}

const vspageConfigFile = path.resolve(vspagePath, 'config.json');
if (fs.existsSync(vspageConfigFile)) {
  const cfg = JSON.parse(fs.readFileSync(vspageConfigFile, 'utf8'));
  if (cfg.projectRoot) {
    env.paths.miniroot = path.resolve(env.paths.root, cfg.projectRoot);
    env.paths.temp = path.resolve(env.paths.root, '.vspage/tmp');
  }
}

const miniConfigFile = path.join(env.paths.miniroot, 'project.config.json');
if (!fs.existsSync(miniConfigFile)) {
  throw new Error(`${miniConfigFile} not found`);
}

const miniConfig = JSON.parse(fs.readFileSync(miniConfigFile, 'utf-8'));
if (miniConfig.miniprogramRoot) {
  env.paths.minisrc = path.join(env.paths.miniroot, miniConfig.miniprogramRoot);
}

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
