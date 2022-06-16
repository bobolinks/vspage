import os from 'os';
import path from 'path';
import url from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';
import env from './environment';
import { logger } from './utils/logger';
import rpc from './rpc';
import modules from './modules/index';
import rs from './rs/index';
import { Net } from './utils';

if (!env.debug) {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err.toString());
    if (err.stack) {
      logger.error(err.stack);
    }
  });
}

/** express */
const expr = express();

/** config express */
expr.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end('OK');
  } else {
    next();
  }
});

/** apply express routing rules */
function applyRoutingRules() {
  expr.use(bodyParser.urlencoded({ limit: '30mb', extended: false }));
  expr.use(bodyParser.json({ limit: '30mb' }));
  expr.use('/__ide__', express.static(path.join(env.paths.bin, '__ide__')));
  expr.use('/service-worker.js', express.static(path.join(env.paths.bin, '__ide__/service-worker.js')));
  rs.init(expr);
}

function loadModules(app: any) {
  const mos: any = {};
  for (const mo of Object.values(modules)) {
    const methods = typeof mo.module === 'function' ? mo.module(rpc) : mo.module;
    logger.info(`Module ${mo.name} loaded!`);
    mos[mo.name] = methods;
  }
  rpc.init(app, mos);
}

// lsof -i:3080
logger.info('VsPage deamon initializing...');

async function start() {
  const upgradeEvents: any = {};
  const port = await Net.choosePort(4040);
  const app = expr.listen(port, () => {
    /** init express upgrade hook */
    (app as any).onUpgrade = function (name: string | number, cb: any) {
      upgradeEvents[name] = cb;
    };
    (app as any).downUpgrade = (name: string | number) => delete upgradeEvents[name];

    app.on('upgrade', (request, socket, head) => {
      const pathInfo = request.url ? url.parse(request.url) : { pathname: undefined };
      const { pathname } = pathInfo;
      const cb = upgradeEvents[pathname || ''];
      if (cb) cb(request, socket, head);
    });

    loadModules(app);

    const { port } = app.address() as any;

    env.address.port = port;

    applyRoutingRules();

    process.stdout.write(`[port=${port}]\n`);

    app.setTimeout(120000);
    if (env.args.open) {
      open(`http://localhost:${port}/`, {
        app: {
          name: 'chrome',
        },
      });
    }
    const interfaces: any = [];
    Object.values(os.networkInterfaces()).forEach((e) => {
      if (!e) {
        return;
      }
      e.filter(detail => detail.family === 'IPv4').forEach((detail) => {
        interfaces.push(detail);
        if (!/^127\./.test(detail.address)) {
          env.address.host = detail.address;
        }
      });
    });

    logger.info(`VsPage started, listening on : ${interfaces.map((e: { address: any; }) => `http://${e.address}:${port}`).join(', ')}`);
  });
}

start();
