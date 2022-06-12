import { rpc } from '../../rpc';
import store from '../../store';

wx.canIUse = function () {
  return false;
};
wx.getSystemInfoSync = function () {
  return store.sysinfo;
};
wx.getAccountInfoSync = function () {
  return {
    miniProgram: {
      appId: "",
      envVersion: "develop",
      version: "",
    },
  } as WechatMiniprogram.AccountInfo;
};

wx.login = async function (options: WechatMiniprogram.LoginOption) {
  const { complete, success, fail } = options || {};
  const res: WechatMiniprogram.LoginSuccessCallbackResult = {
    errMsg: 'Msg:Ok',
  } as any;
  try {
    const rs = await rpc.request('account.login');
    res.code = rs.code;
    if (success) success(res);
    if (complete) complete(res);
    return rs;
  } catch (e: any) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;

wx.getUserInfo = async function () {
  return await rpc.request('account.getUserInfo');
} as any;
