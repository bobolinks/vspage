/* eslint-disable */
import zh from './zh-CN';
import en from './en-US';
import { appData } from '../store';
export const $s = appData.lang === 'en-US' ? en : zh;
export default {
    'zh-CN': zh,
    'en-US': en,
};
