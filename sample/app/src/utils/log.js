/* eslint-disable */
/* eslint-disable prefer-spread */
/* eslint-disable no-nested-ternary */
import { envVersion } from '../env';
const log = envVersion === 'release' ? null : (wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null);
export default {
    info(...args) {
        if (!log)
            return;
        log.info.apply(log, args);
    },
    warn(...args) {
        if (!log)
            return;
        log.warn.apply(log, args);
    },
    error(...args) {
        if (!log)
            return;
        log.error.apply(log, args);
    },
    setFilterMsg(msg) {
        if (!log || !log.setFilterMsg)
            return;
        if (typeof msg !== 'string')
            return;
        log.setFilterMsg(msg);
    },
    addFilterMsg(msg) {
        if (!log || !log.addFilterMsg)
            return;
        if (typeof msg !== 'string')
            return;
        log.addFilterMsg(msg);
    },
};
