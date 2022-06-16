/* eslint-disable complexity */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
import ENV, { VERSION } from '../env';

export { default as Log } from './log';
export * from './storage';
export { default as Task } from './task';
export { default as Router } from './router';

interface SysInfo extends WechatMiniprogram.SystemInfo {
  isPhoneX: boolean;
  isPad: boolean;
  rpx2px: number;
  iOS: boolean;
  menuButtonRect: any;
  naviHeight: number;
  naviPadding: number;
  backTop: number;
}

const chars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'];

export const Utils = {
  randomHash(randomFlag: boolean, min: number, max: number) {
    let str = '';
    let range = min;
    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < range; i++) {
      const pos = Math.round(Math.random() * (chars.length - 1));
      str += chars[pos];
    }
    return str;
  },

  getRandomData(sysinfo: SysInfo) {
    const timestamp = Date.now() / 1000;
    const nonce = this.randomHash(false, 32, 32);
    const client = {
      edition: VERSION,
      brand: sysinfo.brand,
      version: sysinfo.version,
      system: sysinfo.system,
      platform: sysinfo.platform,
      language: sysinfo.language,
      networkType: ENV.networkType,
      model: sysinfo.model,
    };

    return {
      timestamp,
      nonce,
      client,
    };
  },

  fieldsCopy(dst: any, src: any, keys: Array<string> | undefined) {
    keys = keys || Object.keys(src);
    keys.forEach(k => {
      dst[k] = src[k];
    });
  },

  formatTime(date: any) {
    if (!date) {
      return '';
    }
    return date.format('yyyy-MM-dd hh:mm:ss');
  },

  formatDate(date: any) {
    if (!date) {
      return '';
    }
    return date.format('yyyy-MM-dd');
  },

  getSystemInfo(): SysInfo {
    const sysInfo = wx.getSystemInfoSync() as any as SysInfo;
    if (sysInfo.brand === 'devtools') {
      sysInfo.isPhoneX = (sysInfo.model.indexOf('X') !== -1);
    } else {
      sysInfo.isPhoneX = sysInfo.brand === 'iPhone' && /X|11/.test(sysInfo.brand);
    }
    sysInfo.iOS = sysInfo.brand === 'iPhone' || /iPhone|iOs/.test(sysInfo.brand);
    sysInfo.rpx2px = sysInfo.windowWidth / 750;

    if (!sysInfo.safeArea) {
      sysInfo.safeArea = {} as any as WechatMiniprogram.SafeArea;
    }
    sysInfo.safeArea.top = sysInfo.safeArea.top || 0;
    if (Number.isNaN(sysInfo.statusBarHeight)) {
      if (sysInfo.safeArea.top === 0) {
        sysInfo.statusBarHeight = sysInfo.safeArea.top;
      } else {
        sysInfo.statusBarHeight = 24;
      }
    }

    if (!sysInfo.naviHeight) {
      let naviHeight = sysInfo.iOS ? 44 : 48;
      if (wx.canIUse('getMenuButtonBoundingClientRect')) {
        sysInfo.menuButtonRect = wx.getMenuButtonBoundingClientRect();
        const boundHeight = ((sysInfo.menuButtonRect.top - sysInfo.statusBarHeight) * 2) + sysInfo.menuButtonRect.height;
        if (!Number.isNaN(boundHeight)) {
          naviHeight = boundHeight;
        }
      }
      sysInfo.naviHeight = naviHeight || 44; // 导航栏高度  
    }
    if (!sysInfo.naviPadding) {
      sysInfo.naviPadding = sysInfo.statusBarHeight + sysInfo.naviHeight; // 工具栏 + 导航栏高度
    }
    if (!sysInfo.backTop) {
      sysInfo.backTop = Math.ceil(sysInfo.statusBarHeight + sysInfo.naviHeight / 2.0 - 24 * sysInfo.rpx2px); // 返回按钮的高度
    }

    return sysInfo;
  },

  tip(tip: WechatMiniprogram.ShowModalOption = {}) {
    if (wx?.showModal) {
      wx.showModal({
        content: '我知道了',
        confirmColor: '#4c5d85',
        ...tip,
      });
    }
  },

  isDateIn(base: number, to: number, days: number) {
    return Math.floor((to - base) / 86400000) <= days;
  },

  isTimeIn(t: number, seconds: number) {
    return (Date.now() - t) <= (seconds * 1000);
  },

  timeLeft(ms: number) {
    let secs = Math.ceil(ms / 1000);
    const days = Math.floor(secs / 86400);
    secs %= 86400;
    const hours = Math.floor(secs / 3600);
    secs %= 3600;
    const mins = Math.floor(secs / 60);
    secs %= 60;
    const ps: Array<string> = [];
    if (days) {
      ps.push(`${days}天`);
    } if (hours) {
      ps.push(`${hours}小时`);
    } if (mins) {
      ps.push(`${mins}分`);
    } if (secs) {
      ps.push(`${secs}秒`);
    }
    return ps.join('');
  },

  timeLeftStd(ms: number) {
    let secs = Math.ceil(ms / 1000);
    const hours = Math.floor(secs / 3600).toString().padStart(2, '0');
    secs %= 3600;
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    secs %= 60;
    return `${hours.toString()}:${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

export const sysInfo = Utils.getSystemInfo();

// Date的prototype 属性可以向对象添加属性和方法。
(Date.prototype as any).format = function (fmt: string) {
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const [k, v] of Object.entries(o)) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (v) : (('00' + v).substr(('' + v).length)));
    }
  }
  return fmt;
};
