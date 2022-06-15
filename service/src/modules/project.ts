import fs from 'fs';
import path from 'path';
import { env } from '../environment';
import { rpc } from '../rpc';

const cached = {
  mTimeMs: 0,
  config: null as any,
};

export const module = {
  config() {
    const file = path.join(env.paths.miniroot, 'project.config.json');
    const mTimeMs = fs.statSync(file).mtimeMs;
    if (mTimeMs !== cached.mTimeMs) {
      cached.mTimeMs = mTimeMs;
      cached.config = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return cached.config;
  },
};

export default {
  name: 'project',
  module,
  syncConfig() {
    rpc.notify('project:config', module.config());
  },
};
