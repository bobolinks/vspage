
import fs from 'fs';
import path from 'path';
import { Express } from 'express';
import { env } from '../environment';
import { Encoding } from '../utils/index';

function relPath(dirPath: string) {
  return path.join(env.paths.temp, dirPath.replace(/^https?:\/\//, ''));
}

export const module: WechatMiniprogram.FileSystemManager = {
  readdirSync(dirPath: string): string[] {
    return fs.readdirSync(relPath(dirPath));
  },
  access(option: WechatMiniprogram.AccessOption): void {
    fs.access(relPath(option.path), (err) => {
      option.complete?.call(option, { errMsg: err?.message || 'Msg:OK' });
    });
  },
  accessSync(dirPath: string): void {
    return fs.accessSync(relPath(dirPath));
  },
  appendFile(option: WechatMiniprogram.AppendFileOption): void {
    fs.appendFile(relPath(option.filePath), Encoding.toTypedArray((option.data as any).data), (option as any).encoding, (err) => {
      option.complete?.call(option, { errMsg: err?.message || 'Msg:OK' });
    });
  },
  appendFileSync(filePath: string, data: string | ArrayBuffer, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'ucs-2' | 'utf16le' | 'utf-16le' | 'utf-8' | 'utf8' | 'latin1'): void {
    throw new Error('Method not implemented.');
  },
  close(option: WechatMiniprogram.FileSystemManagerCloseOption): void {
    fs.close(parseInt(option.fd, 10));
  },
  copyFile(option: WechatMiniprogram.CopyFileOption): void {
    return this.copyFileSync(option.srcPath, option.destPath);
  },
  copyFileSync(srcPath: string, destPath: string): void {
    throw new Error('Method not implemented.');
  },
  fstat(option: WechatMiniprogram.FstatOption): void {
    fs.fstat(parseInt(option.fd, 10), () => null);
  },
  ftruncate(option: WechatMiniprogram.FtruncateOption): void {
    fs.ftruncate(parseInt(option.fd, 10), option.length, () => null);
  },
  getFileInfo(option: WechatMiniprogram.FileSystemManagerGetFileInfoOption): void {
    throw new Error('Method not implemented.');
  },
  getSavedFileList(option?: WechatMiniprogram.FileSystemManagerGetSavedFileListOption): void {
    throw new Error('Method not implemented.');
  },
  mkdir(option: WechatMiniprogram.MkdirOption): void {
    throw new Error('Method not implemented.');
  },
  mkdirSync(dirPath: string, recursive?: boolean): void {
    fs.mkdirSync(relPath(dirPath), {
      recursive,
    });
  },
  open(option: WechatMiniprogram.OpenOption): void {
    throw new Error('Method not implemented.');
  },
  read(option: WechatMiniprogram.ReadOption): void {
    throw new Error('Method not implemented.');
  },
  readFile(option: WechatMiniprogram.ReadFileOption): void {
    throw new Error('Method not implemented.');
  },
  readZipEntry(option: WechatMiniprogram.ReadZipEntryOption): void {
    throw new Error('Method not implemented.');
  },
  readdir(option: WechatMiniprogram.ReaddirOption): void {
    throw new Error('Method not implemented.');
  },
  removeSavedFile(option: WechatMiniprogram.FileSystemManagerRemoveSavedFileOption): void {
    throw new Error('Method not implemented.');
  },
  rename(option: WechatMiniprogram.RenameOption): void {
    throw new Error('Method not implemented.');
  },
  renameSync(oldPath: string, newPath: string): void {
    throw new Error('Method not implemented.');
  },
  rmdir(option: WechatMiniprogram.RmdirOption): void {
    throw new Error('Method not implemented.');
  },
  rmdirSync(dirPath: string, recursive?: boolean): void {
    throw new Error('Method not implemented.');
  },
  saveFile(option: WechatMiniprogram.FileSystemManagerSaveFileOption): void {
    throw new Error('Method not implemented.');
  },
  stat(option: WechatMiniprogram.StatOption): void {
    throw new Error('Method not implemented.');
  },
  truncate(option: WechatMiniprogram.TruncateOption): void {
    throw new Error('Method not implemented.');
  },
  unlink(option: WechatMiniprogram.UnlinkOption): void {
    throw new Error('Method not implemented.');
  },
  unlinkSync(filePath: string): void {
    throw new Error('Method not implemented.');
  },
  unzip(option: WechatMiniprogram.UnzipOption): void {
    throw new Error('Method not implemented.');
  },
  write(option: WechatMiniprogram.WriteOption): void {
    throw new Error('Method not implemented.');
  },
  writeFile(option: WechatMiniprogram.WriteFileOption): void {
    throw new Error('Method not implemented.');
  },
  writeFileSync(filePath: string, data: string | ArrayBuffer, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'ucs-2' | 'utf16le' | 'utf-16le' | 'utf-8' | 'utf8' | 'latin1'): void {
    if (typeof data !== 'string' && (data as any).data && (data as any).type === 'Buffer') {
      data = Encoding.toTypedArray((data as any).data);
    }
    fs.writeFileSync(relPath(filePath), data as any, encoding);
  },
  readSync(option: WechatMiniprogram.ReadSyncOption): WechatMiniprogram.ReadResult {
    throw new Error('Method not implemented.');
  },
  fstatSync(option: WechatMiniprogram.FstatSyncOption): WechatMiniprogram.Stats {
    throw new Error('Method not implemented.');
  },
  statSync(path: string, recursive?: boolean): WechatMiniprogram.Stats | WechatMiniprogram.Stats[] {
    throw new Error('Method not implemented.');
  },
  writeSync(option: WechatMiniprogram.WriteSyncOption): WechatMiniprogram.WriteResult {
    throw new Error('Method not implemented.');
  },
  openSync(option: WechatMiniprogram.OpenSyncOption): string {
    throw new Error('Method not implemented.');
  },
  saveFileSync(tempFilePath: string, filePath?: string): string {
    throw new Error('Method not implemented.');
  },
  readFileSync(filePath: string, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'ucs-2' | 'utf16le' | 'utf-16le' | 'utf-8' | 'utf8' | 'latin1', position?: number, length?: number): string | ArrayBuffer {
    return fs.readFileSync(relPath(filePath), encoding as any);
  },
  closeSync(option: WechatMiniprogram.CloseSyncOption): undefined {
    throw new Error('Method not implemented.');
  },
  ftruncateSync(option: WechatMiniprogram.FtruncateSyncOption): undefined {
    throw new Error('Method not implemented.');
  },
  truncateSync(option: WechatMiniprogram.TruncateSyncOption): undefined {
    throw new Error('Method not implemented.');
  },
};

interface FileOption {
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?(res: WechatMiniprogram.GeneralCallbackResult): void;
}

export default {
  installFileSystem(expr: Express) {
    expr.use('/__fs__', (request, response, next) => {
      const [, name] = (request.url.match(/^\/([a-z]+)\/?/i) || []);
      if (!name) {
        return response.status(404).end();
      }
      const isSync = /Sync$/.test(name);
      const method = (module as any)[name];
      if (!method) {
        return response.status(404).end();
      }
      try {
        if (!isSync) {
          const options = request.body[0] as FileOption;
          options.complete = (res) => {
            response.json(res);
            response.end();
          };
          method(...request.body);
        } else {
          const rs = method(...request.body);
          if (rs && typeof rs.then === 'function') {
            rs.then((r: any) => {
              response.write(r);
              response.end();
            });
          } else {
            if (rs) response.write(rs);
            response.end();
          }
        }
      } catch (_e: any) {
        return response.status(500).end(_e.message);
      }
    });
  },
};
