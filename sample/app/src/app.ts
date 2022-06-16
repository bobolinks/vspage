// app.js
import ENV from './env';
import { loadData } from './modules/stats';

const networkListener = (res: { isConnected: boolean; networkType: string; }) => {
  if (res) {
    ENV.isNetworkConnected = res.isConnected;
    ENV.networkType = res.networkType;
  }
};

App({
  onLaunch() {
    wx.cloud.init({ // 初始化云开发环境
      traceUser: true,
      env: 'cloud1-0g8h5fze48931cdf',
    })
    loadData();
    console.log('launched');
  },
  onShow() {
    wx.onNetworkStatusChange(networkListener);
  },
  onHide() {
    wx.offNetworkStatusChange(networkListener);
  },
});
