/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import crypto from 'crypto';
export { default as Logger } from './logger';
export { default as Sys } from './sys';
export * from './memcache';

const BUFFER_SIZE = 8192;

export const Utils = {
  md5File(file: string): string {
    const fd = fs.openSync(file, 'r');
    const hash = crypto.createHash('md5');
    const buffer = Buffer.alloc(BUFFER_SIZE);

    try {
      let bytesRead;
      do {
        bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE, null);
        hash.update(buffer.slice(0, bytesRead));
      } while (bytesRead === BUFFER_SIZE);
    } finally {
      fs.closeSync(fd);
    }

    return hash.digest('hex');
  },
  md5Raw(data: ArrayBuffer): string {
    const hash = crypto.createHash('md5');
    hash.update(new Uint8Array(data));
    return hash.digest('hex');
  },
};
