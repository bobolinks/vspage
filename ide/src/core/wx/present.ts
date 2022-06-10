import store from '../../store';

wx.showLoading = async function (options: WechatMiniprogram.ShowLoadingOption) {
  const { complete, success, fail } = options;
  const res: WechatMiniprogram.GeneralCallbackResult = {
    errMsg: 'Msg:Ok',
  };
  try {
    const action = await new Promise((resolve) => {
      Object.assign(store.loading, options);
      store.loading.show = true;
      store.loading.resolve = resolve;
    });
    if (success) success(res);
    if (complete) complete(res);
    return res;
  } catch (e) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;

wx.hideLoading = function (options: WechatMiniprogram.HideLoadingOption) {
  const { complete, success } = options || {};
  const res: WechatMiniprogram.GeneralCallbackResult = {
    errMsg: 'Msg:Ok',
  };
  store.loading.show = false;
  if (success) success(res);
  if (complete) complete(res);
} as any;

wx.showModal = async function (options: WechatMiniprogram.ShowModalOption) {
  const { complete, success, fail } = options;
  const res: WechatMiniprogram.GeneralCallbackResult = {
    errMsg: 'Msg:Ok',
  };
  try {
    const action = await new Promise((resolve) => {
      Object.assign(store.modal, options);
      store.modal.resolve = resolve;
    });
    const resSuc = res as WechatMiniprogram.ShowModalSuccessCallbackResult;
    resSuc.confirm = action === 'confirm';
    resSuc.cancel = !resSuc.confirm;
    resSuc.content = store.modal.content || '';
    if (success) success(resSuc);
    if (complete) complete(res);
    return resSuc;
  } catch (e) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;
