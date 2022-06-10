wx.getStorageSync = function (key) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
};
wx.getStorage = function (options: WechatMiniprogram.GetStorageOption) {
  const { complete, success, fail } = options;
  const res: WechatMiniprogram.GetStorageSuccessCallbackResult = {
    errMsg: 'Msg:Ok',
    data: null,
  };
  try {
    res.data = wx.getStorageSync(options.key);
    if (success) success(res);
    if (complete) complete(res);
    return res;
  } catch (e: any) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;

wx.setStorageSync = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};
wx.setStorage = function (options: WechatMiniprogram.SetStorageOption) {
  const { complete, success, fail } = options;
  const res: WechatMiniprogram.GeneralCallbackResult = {
    errMsg: 'Msg:Ok',
  };
  try {
    wx.setStorageSync(options.key, options.data);
    if (success) success(res);
    if (complete) complete(res);
    return res;
  } catch (e: any) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;

wx.env = {
  USER_DATA_PATH: "http://usr",
};
