/* eslint-disable class-methods-use-this */
// 全局共享数据
import { Storage, Watcher } from './utils/storage';

/** 行业 */
export interface Industry {
  name: Name;
}

/**
 * 数据监听
 */
export const watcher = new class extends Watcher {
  onflush(_name: string, root: any) {
    root.mTimeMs = Date.now();
  }
}();

/**
 * APP数据
 */
interface AppData {
  lang: string;
  ready: boolean;
  /** 最后更新时间 */
  mTimeMs: number;
}

export const appData: AppData = Storage('appdata', '1.0', {
  lang: 'zh-CN',
  ready: false,
  mTimeMs: 0,
}, watcher);

