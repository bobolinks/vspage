import fs from 'fs';
import path from 'path';
import { env } from '../environment';
import { rpc } from '../rpc';
import { module as Net, net as axiosInstance } from './net';
import { module as Project } from './project';
import { Sys } from '../utils/index';

const accFile = path.join(env.paths.temp, 'data/acc.json');

const wxContext = {
  userInfo: {} as any as WechatMiniprogram.UserInfo,
  expired: 0,
  session: {
    uuid: '',
    openid: '',
    code: '',
    ticket: '',
    newTicket: '',
    signature: '',
  },
};

export const module = {
  async login() {
    // unsupported
    return {};
  },
  getUserInfo() {
    return wxContext.userInfo;
  },
};

export default {
  name: 'account',
  module(rpc: any) {
    if (fs.existsSync(accFile)) {
      wxContext.userInfo = JSON.parse(fs.readFileSync(accFile, 'utf-8'));
    }
    return module;
  },
};
