/* eslint-disable prefer-spread */
/* eslint-disable no-nested-ternary */
import { envVersion } from '../env';

const log = envVersion === 'release' ? null : (wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null);

export default {
  info(...args: any[]) {
    if (!log) return;
    log.info.apply(log, args);
  },
  warn(...args: any[]) {
    if (!log) return;
    log.warn.apply(log, args);
  },
  error(...args: any[]) {
    if (!log) return;
    log.error.apply(log, args);
  },
  setFilterMsg(msg: any) { // 从基础库2.7.3开始支持
    if (!log || !log.setFilterMsg) return;
    if (typeof msg !== 'string') return;
    log.setFilterMsg(msg);
  },
  addFilterMsg(msg: any) { // 从基础库2.8.1开始支持
    if (!log || !log.addFilterMsg) return;
    if (typeof msg !== 'string') return;
    log.addFilterMsg(msg);
  },
};
