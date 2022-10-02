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
    fs.watch(env.paths.minisrc, { persistent: true, recursive: true }, (event, filePath) => {
      const relPath = path.join(env.paths.minisrc, filePath);
      const isDeleted = (event !== 'change' && !fs.existsSync(relPath));
      Editor.fileChanged(filePath, isDeleted ? 0 : fs.statSync(relPath).mtimeMs);
    });
    wxfs.installFileSystem(expr);
    // disable service worker
    // expr.use('/__app__', async (request, response, next) => {
    expr.use('/', async (request, response, next) => {
      let [url, query] = request.originalUrl.split('?');
      // disable service worker
      // let filePathRel = url.replace(/^\/+__app__\//, '');
      let filePathRel = url.replace(/^\//, '');
      if (!filePathRel) {
        return next();
      }
      if (query) {
        query = `?${query}`;
      } else {
        query = '';
      }
      let filePath = path.resolve(env.paths.minisrc, filePathRel);
      let exists = fs.existsSync(filePath);
      if (exists && fs.statSync(filePath).isDirectory()) {
        filePathRel += `${filePathRel}/index`;
        exists = false;
        // return response.redirect(`/${request.path}/index`.replace(/\/\/+/, '/'));
      }
      if (!exists) {
        for (const it of ['.ts', '.js']) {
          if (fs.existsSync(filePath + it)) {
            filePathRel = filePathRel + it;
            exists = true;
            // return response.redirect(302, `/__app__/${filePathRel}${it}${query}`);
            break;
          }
        }
        if (!exists) {
          if (/^\/node_modules\//.test(filePathRel)) {
            const newPath = lookupModule(env.paths.minisrc, filePathRel.substring(14));
            if (newPath) {
              filePathRel = newPath;
              exists = true;
              // return response.redirect(302, `/__app__/${newPath}${query}`);
            }
          } else if (/\.(css|wxss)/.test(filePathRel)) {
            if (fs.existsSync(filePath.replace(/\.css$/i, '.less'))) {
              filePathRel = filePathRel.replace(/\.css$/i, '.less');
              exists = true;
              // return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.less')}${query}`);
            } else if (fs.existsSync(filePath.replace(/\.css$/i, '.sass'))) {
              filePathRel = filePathRel.replace(/\.css$/i, '.sass');
              exists = true;
              // return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.sass')}${query}`);
            } else if (fs.existsSync(filePath.replace(/\.css$/i, '.scss'))) {
              filePathRel = filePathRel.replace(/\.css$/i, '.scss');
              exists = true;
              // return response.redirect(302, `/__app__/${filePathRel.replace(/\.css$/i, '.scss')}${query}`);
            }
          }
        }
        if (!exists) {
          return next();
        } else {
          filePath = path.resolve(env.paths.minisrc, filePathRel);
        }
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
          src = xs(env.paths.minisrc, filePathRel, src, importType, `window.__FILE__='${filePathRel}';`);
        } else {
          src = xs(env.paths.minisrc, filePathRel, src, importType);
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
              src = await less(filePath, env.paths.minisrc, scoped);
            } else if (/\.sass$/i.test(filePathRel)) {
              src = await sass(filePath, env.paths.minisrc, scoped);
            } else if (/\.scss$/i.test(filePathRel)) {
              src = await sass(filePath, env.paths.minisrc, scoped);
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
            src = await less(filePath, env.paths.minisrc, scoped);
          } else if (/\.sass$/i.test(filePathRel)) {
            src = await sass(filePath, env.paths.minisrc, scoped);
          } else if (/\.scss$/i.test(filePathRel)) {
            src = await sass(filePath, env.paths.minisrc, scoped);
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
    // disable service worker
    expr.use('/', express.static(env.paths.minisrc));
  },
};
