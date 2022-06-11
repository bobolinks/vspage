import fs from 'fs';
import path from 'path';
import md5 from 'md5';
import mime from 'mime';
import stream from 'stream';
import express, { Express } from 'express';
import env from '../environment';
import Editor from '../modules/editor';
import { lookupModule } from './lookup';
import xs from './transformers/xs';
import wxss from './transformers/css';
import less from './transformers/less';
import sass from './transformers/sass';
import scss from './transformers/scss';
import wxml from './transformers/wxml';
import wxfs from './fs';

function parseHttpDate(date: string) {
  const timestamp = date && Date.parse(date);

  return typeof timestamp === 'number'
    ? timestamp
    : NaN;
}

export default {
  init(expr: Express) {
    const config = JSON.parse(fs.readFileSync(path.join(env.paths.root, 'project.config.json'), 'utf-8'));
    if (config.miniprogramRoot) {
      env.paths.miniroot = path.join(env.paths.root, config.miniprogramRoot);
    }
    fs.watch(env.paths.miniroot, { persistent: true, recursive: true }, (event, filePath) => {
      const relPath = path.join(env.paths.miniroot, filePath);
      const isDeleted = (event !== 'change' && !fs.existsSync(relPath));
      Editor.fileChanged(filePath, isDeleted ? 0 : fs.statSync(relPath).mtimeMs);
    });
    wxfs.installFileSystem(expr);
    expr.use('/__app__', async (request, response, next) => {
      let [url, query] = request.originalUrl.split('?');
      const filePathRel = url.replace(/^\/+__app__\//, '');
      if (!filePathRel) {
        return next();
      }
      if (query) {
        query = `?${query}`;
      } else {
        query = '';
      }
      let filePath = path.resolve(env.paths.miniroot, filePathRel);
      const exists = fs.existsSync(filePath);
      if (exists && fs.statSync(filePath).isDirectory()) {
        return response.redirect(`/${request.path}/index`.replace(/\/\/+/, '/'));
      } if (!exists) {
        for (const it of ['.ts', '.js']) {
          if (fs.existsSync(filePath + it)) {
            return response.redirect(302, `/__app__/${filePathRel}${it}${query}`);
            // break;
          }
        }
        if (/^\/node_modules\//.test(filePathRel)) {
          const newPath = lookupModule(env.paths.miniroot, filePathRel.substring(14));
          if (newPath) {
            return response.redirect(302, `/__app__/${newPath}${query}`);
          }
        }
        if (/\.(css|wxss)/.test(filePathRel)) {
          if (fs.existsSync(filePath.replace(/\.css$/i, '.less'))) {
            return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.less')}${query}`);
          }
          if (fs.existsSync(filePath.replace(/\.css$/i, '.sass'))) {
            return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.sass')}${query}`);
          }
          if (fs.existsSync(filePath.replace(/\.css$/i, '.scss'))) {
            return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.scss')}${query}`);
          }
        }
        return next();
      }

      const stats = fs.statSync(filePath);
      const unmodifiedSince = parseHttpDate(request.header('if-modified-since') || '');
      // if-unmodified-since
      if (!isNaN(unmodifiedSince) && stats.mtimeMs > unmodifiedSince) {
        response.statusCode = 304;
        return response.end();
      }
      let mimeType = mime.lookup(filePath);
      if (!/\.(ts|wxss|wxml|less|sass|scss)$/i.test(filePath) && !/^text|application/.test(mimeType)) {
        return next();
      }
      let src = '';
      const secFetchDest = request.header('Sec-Fetch-Dest');
      const importType = request.query.import?.toString() || '';
      const moduleType = request.query.type?.toString() || '';
      const scoped = request.query.scoped?.toString() || '';
      if (/\.(js|ts)$/i.test(filePath)) {
        src = fs.readFileSync(filePath, 'utf-8');
        mimeType = 'application/javascript';
        if (moduleType === 'wx-component') {
          src = xs(env.paths.miniroot, filePathRel, src, importType, `window.__FILE__='${filePathRel}';`);
        } else {
          src = xs(env.paths.miniroot, filePathRel, src, importType);
        }
      } else if (/\.(css|wxss|less|sass|scss)$/.test(filePath)) {
        if (secFetchDest === 'script' || importType === 'module') {
          // import css as module
          filePath += '.js';
          if (importType !== 'module') {
            src = `
            const eid = '${md5(filePath)}';
            let el = document.getElementById(eid);
            if (!el) {
              el = document.createElement('link');
              el.setAttribute('rel', 'stylesheet');
              el.setAttribute('href', '${filePathRel}?t=${stats.mtimeMs}');
              document.head.insertBefore(el, document.head.firstChild);
            }
            `;
          } else {
            if (/\.less$/i.test(filePathRel)) {
              src = await less(filePath, env.paths.miniroot, scoped);
            } else if (/\.sass$/i.test(filePathRel)) {
              src = await sass(filePath, env.paths.miniroot, scoped);
            } else if (/\.scss$/i.test(filePathRel)) {
              src = await sass(filePath, env.paths.miniroot, scoped);
            } else {
              src = fs.readFileSync(filePath, 'utf-8');
            }
            src = wxss(src, scoped);
            src = `
            const code = unescape('${escape(src)}')
            export default code;
            `;
          }
        } else {
          if (/\.less$/i.test(filePathRel)) {
            src = await less(filePath, env.paths.miniroot, scoped);
          } else if (/\.sass$/i.test(filePathRel)) {
            src = await sass(filePath, env.paths.miniroot, scoped);
          } else if (/\.scss$/i.test(filePathRel)) {
            src = await sass(filePath, env.paths.miniroot, scoped);
          } else {
            src = fs.readFileSync(filePath, 'utf-8');
          }
          src = wxss(src, scoped);
          mimeType = 'text/css';
        }
      } else if (/\.wxml$/.test(filePath)) {
        src = fs.readFileSync(filePath, 'utf-8');
        if (secFetchDest === 'script' || importType === 'module') {
          mimeType = 'application/javascript';
          // import wxml as module
          filePath += '.js';
          src = `
        const code = unescape('${escape(src)}');
        export default code;
        `;
        } else {
          // transform
          src = wxml(src, filePathRel);
          mimeType = 'text/html';
        }
      } else if (/\.json$/.test(filePath) && (request.header('Sec-Fetch-Dest') === 'script' || importType === 'module')) {
        src = fs.readFileSync(filePath, 'utf-8');
        mimeType = 'application/javascript';
        src = `
        export default ${src};
        `;
      } else {
        src = fs.readFileSync(filePath, 'utf-8');
      }
      const fileContents = Buffer.from(src, 'utf-8');
      const readStream = new stream.PassThrough();
      readStream.end(fileContents);

      if (!/^text\//.test(mimeType)) {
        response.set('Content-disposition', `attachment; filename=${path.basename(filePath)}`);
      }
      response.set('Content-Type', `${mimeType}; charset=UTF-8`);
      response.set('Last-Modified', stats.mtime.toUTCString());
      if (/^\/node_modules\//.test(filePathRel)) {
        response.set('Cache-Control', 'max-age=100000');
      } else {
        response.set('Cache-Control', ['no-cache', 'no-store', 'must-revalidate', 'max-age=0']);
      }
      readStream.pipe(response);
    });
    expr.use('/', express.static(env.paths.miniroot));
  },
};
