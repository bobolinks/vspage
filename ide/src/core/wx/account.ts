import { rpc } from '../../rpc';

wx.canIUse = function () {
  return false;
};
wx.getSystemInfoSync = function () {
  return {
    SDKVersion: "2.10.4",
    backTop: 52,
    batteryLevel: 100,
    benchmarkLevel: 1,
    brand: "devtools",
    deviceOrientation: "portrait",
    devicePixelRatio: 3,
    fontSizeSetting: 16,
    iOS: true,
    isPhoneX: true,
    language: "zh_CN",
    menuButtonRect: { width: 87, height: 32, left: 278, top: 48, right: 365 },
    model: "iPhone X",
    naviHeight: 40,
    naviPadding: 84,
    pixelRatio: 3,
    platform: "devtools",
    rpx2px: 0.5,
    safeArea: { top: 44, left: 0, right: 375, bottom: 778, width: 375 },
    screenHeight: 812,
    screenScaleClass: "",
    screenWidth: 375,
    statusBarHeight: 44,
    system: "iOS 10.0.1",
    version: "7.0.4",
    windowHeight: 724,
    windowWidth: 375,
  } as any as WechatMiniprogram.SystemInfo;
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
