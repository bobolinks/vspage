import fs from 'fs';
import path from 'path';
import { env } from '../environment';
import { rpc } from '../rpc';
import { module as Net, net as axiosInstance } from './net';
import { module as Project } from './project';
import { Sys } from '../utils/index';

const accFile = path.join(env.paths.temp, 'data/acc.json');

const wxContext = {
  userInfo: null as any as WechatMiniprogram.UserInfo,
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

async function login() {
  const text = await Net.get('https://open.weixin.qq.com/connect/qrconnect?appid=wxde40e023744664cb&redirect_uri=https%3a%2f%2fmp.weixin.qq.com%2fdebug%2fcgi-bin%2fwebdebugger%2fqrcode&scope=snsapi_login&state=login#wechat_redirect');
  const uuid = text.match(/connect\/l\/qrconnect\?uuid=([^"']+)/)[1];
  const qrcode = `https://open.weixin.qq.com/connect/qrcode/${uuid}`;
  rpc.notify('account:qrcode', qrcode);
  let leftCount = 10;
  let code = '';
  while (leftCount--) {
    const stUrl = `https://open.weixin.qq.com/connect/l/qrconnect?uuid=${uuid}&_=${Date.now()}`;
    const wxcode = await Net.get(stUrl, { responseType: 'text' });
    const ms = wxcode.match(/window.wx_code\s*=\s*'([^."]+)';/);
    if (ms) {
      code = ms[1] as any;
      break;
    }
    Sys.wait(1000);
  }
  if (!code) {
    throw 'timeout';
  }
  const info = await axiosInstance.get(`https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${code}&state=login`);
  wxContext.userInfo = {
    avatarUrl: info.data.headurl,
    city: info.data.city,
    country: info.data.contry,
    gender: info.data.sex,
    language: 'zh_CN',
    nickName: info.data.nickname,
    province: info.data.province,
  };
  wxContext.expired = info.data.expired_time * 1000;
  wxContext.session.openid = info.data.openid;
  wxContext.session.newTicket = info.headers['debugger-newticket'];
  wxContext.session.ticket = info.headers['debugger-ticket'];
  wxContext.session.signature = info.headers['debugger-signature'];

  fs.writeFileSync(accFile, JSON.stringify(wxContext), 'utf-8');

  rpc.notify('account:qrcode', '');
}

export const module = {
  async login() {
    const now = Date.now();
    if (!wxContext.userInfo || now >= wxContext.expired) {
      await login();
    }
    const config = Project.config();
    const { appid } = config;

    const rs = await Net.post(
      `https://servicewechat.com/wxa-dev-logic/jslogin?_r=${Math.random()}&newticket=${wxContext.session.newTicket}&appid=${appid}`,
      { scope: ['snsapi_base'] },
    );

    if (rs.baseresponse?.errcode === 42001) {
      await login();
      return await Net.post(
        `https://servicewechat.com/wxa-dev-logic/jslogin?_r=${Math.random()}&newticket=${wxContext.session.newTicket}&appid=${appid}`,
        { scope: ['snsapi_base'] },
      );
    }

    return rs;
  },
  getUserInfo() {
    return wxContext.userInfo;
  },
};

export default {
  name: 'account',
  module(rpc: any) {
    if (fs.existsSync(accFile)) {
      Object.assign(wxContext, JSON.parse(fs.readFileSync(accFile, 'utf-8')));
    }
    return module;
  },
};
