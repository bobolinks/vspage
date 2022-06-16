/* eslint-disable */
// app.js
import ENV from './env';
import { loadData } from './modules/stats';
const networkListener = (res) => {
    if (res) {
        ENV.isNetworkConnected = res.isConnected;
        ENV.networkType = res.networkType;
    }
};
App({
    onLaunch() {
        wx.cloud.init({
            traceUser: true,
            env: 'cloud1-0g8h5fze48931cdf',
        });
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
