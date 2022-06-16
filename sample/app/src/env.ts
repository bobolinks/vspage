/* eslint-disable @typescript-eslint/naming-convention */
export const VERSION = 1.0;
export const wxAccountInfo = wx.getAccountInfoSync();
export const envVersion = wxAccountInfo.miniProgram.envVersion;
export const envs = {
  develop: {
    name: 'dev',
    label: '开发环境',
  },
  trial: {
    name: 'trial',
    label: '体验环境',
  },
  release: {
    name: 'release',
    label: '正式版本',
  },
};
export const backendEnvName = envs[envVersion].name;
export default {
  VERSION,
  wxAccountInfo,
  envVersion,
  envLabel: envs[envVersion].label,
  isNetworkConnected: true,
  networkType: 'wifi',
};
