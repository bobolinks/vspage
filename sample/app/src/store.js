/* eslint-disable */
/* eslint-disable class-methods-use-this */
// 全局共享数据
import { Storage, Watcher } from './utils/storage';
/**
 * 数据监听
 */
export const watcher = new class extends Watcher {
    onflush(_name, root) {
        root.mTimeMs = Date.now();
    }
}();
export const appData = Storage('appdata', '1.0', {
    lang: 'zh-CN',
    ready: false,
    mTimeMs: 0,
}, watcher);
