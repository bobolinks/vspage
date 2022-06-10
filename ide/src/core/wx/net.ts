import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { rpc } from '../../rpc';

wx.request = async function (options: WechatMiniprogram.RequestOption) {
  const { complete, success, fail } = options;
  const res: WechatMiniprogram.GeneralCallbackResult = {
    errMsg: 'Msg:Ok',
  };
  try {
    const resSuc = res as WechatMiniprogram.RequestSuccessCallbackResult;
    const optionsAxios: AxiosRequestConfig = Object.assign({ headers: options.header }, options) as any;
    const rs = await rpc.request('net.request', optionsAxios, true) as AxiosResponse<any>;
    resSuc.data = rs.data;
    resSuc.header = rs.headers;
    resSuc.statusCode = rs.status;
    if (success) success(resSuc);
    if (complete) complete(res);
    return resSuc.data;
  } catch (e: any) {
    if (fail) fail(e);
    res.errMsg = e.message;
    if (complete) complete(res);
    throw e;
  }
} as any;
