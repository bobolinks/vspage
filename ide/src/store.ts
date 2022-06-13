import { watch, readonly } from "vue";
import { createStore } from "vuex";
import { TComponentClass } from "./core/component";
import { TPage } from "./core/page";
import { FileCache } from "./utils/cache";

const state = {
  /** app.json */
  config: {
    pages: [],
    window: {
      backgroundTextStyle: '',
      navigationBarBackgroundColor: '',
      navigationBarTitleText: '',
      navigationBarTextStyle: '',
      backgroundColor: '',
      navigationStyle: 'default',
    },
    usingComponents: {},
    sitemapLocation: '',
  } as AppConfig,
  /** all components cached */
  components: {} as Record<TyPath, TComponentClass>,
  /** path of current component loaded */
  currComponentPath: '',
  /** pages */
  pages: [] as Array<TPage>,
  /** url of home page */
  homePage: '',
  /** url of current page */
  currPage: '',
  /** json of current page */
  page: {
    backgroundTextStyle: '',
    navigationBarBackgroundColor: '',
    navigationBarTitleText: '',
    navigationBarTextStyle: '',
    backgroundColor: '',
    navigationStyle: 'default',
  } as PageConfig,
  modal: {} as WechatMiniprogram.ShowModalOption & {
    resolve?(value: any): void;
  },
  loading: {} as WechatMiniprogram.ShowLoadingOption & {
    show: boolean,
    resolve?(value: any): void;
  },
  sysinfo: {
    SDKVersion: "2.19.4",
    version: "7.0.4",
    language: "zh_CN",
    benchmarkLevel: 1,
    brand: "devtools",
    deviceOrientation: "portrait",
    fontSizeSetting: 16,
    platform: 'mac',
    pixelRatio: 3,
    model: "iPhone X",
    naviHeight: 40,
    safeArea: { top: 44, left: 0, right: 375, bottom: 778, width: 375, height: 734 },
    screenHeight: 812,
    screenWidth: 375,
    statusBarHeight: 44,
    windowHeight: 812,
    windowWidth: 375,
    system: "iOS 10.0.1",
    albumAuthorized: true,
    cameraAuthorized: true,
    locationAuthorized: true,
    microphoneAuthorized: true,
    notificationAuthorized: true,
    readStorageAuthorized: true,
    writeStorageAuthorized: true,
    bluetoothEnabled: true,
    enableDebug: true,
    locationEnabled: true,
    locationReducedAccuracy: false,
    notificationAlertAuthorized: true,
    notificationBadgeAuthorized: true,
    notificationSoundAuthorized: true,
    phoneCalendarAuthorized: true,
    wifiEnabled: true,
    host: {
      appId: "",
    },
  } as SystemInfo,
  swap: {
    ast: readonly(null as any as TyAst),
  },
};

const sysinfo = localStorage.getItem('sysinfo');
if (sysinfo) {
  state.sysinfo = JSON.parse(sysinfo);
}

export const store = createStore({
  state,
});

watch(store.state.sysinfo, (v) => {
  localStorage.setItem('sysinfo', JSON.stringify(v));
});

export const files: Record<string, FileCache> = {};
export type Store = typeof state;
export default store.state;
