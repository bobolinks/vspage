import { createStore } from "vuex";
import { TComponentClass } from "./core/component";
import { TPage } from "./core/page";
import { FileCache } from "./utils/cache";

export type TyPath = string;
export type UsingComponents = Record<string, TyPath>;

// https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html
export type PageConfig = {
  navigationBarBackgroundColor?: string;//	HexColor	#000000	导航栏背景颜色，如 #000000	
  navigationBarTextStyle?: string;//	white	导航栏标题颜色，仅支持 black / white	
  navigationBarTitleText?: string;//		导航栏标题文字内容	
  navigationStyle?: 'default' | 'custom';//	default	导航栏样式，仅支持以下值：
  // default 默认样式
  // custom 自定义导航栏，只保留右上角胶囊按钮。	iOS/Android 微信客户端 7.0.0，Windows 微信客户端不支持
  backgroundColor?: string; //HexColor	#ffffff	窗口的背景色	
  backgroundTextStyle?: string;//	dark	下拉 loading 的样式，仅支持 dark / light	
  backgroundColorTop?: string;//	#ffffff	顶部窗口的背景色，仅 iOS 支持	微信客户端 6.5.16
  backgroundColorBottom?: string;//	#ffffff	底部窗口的背景色，仅 iOS 支持	微信客户端 6.5.16
  enablePullDownRefresh?: boolean;//	false	是否开启当前页面下拉刷新。
  // 详见 Page.onPullDownRefresh	
  onReachBottomDistance?: number;//	50	页面上拉触底事件触发时距页面底部距离，单位为px。
  // 详见 Page.onReachBottom	
  pageOrientation?: string;//	portrait	屏幕旋转设置，支持 auto / portrait / landscape
  // 详见 响应显示区域变化	2.4.0 (auto) / 2.5.0 (landscape)
  disableScroll?: boolean;//	false	设置为 true 则页面整体不能上下滚动。
  // 只在页面配置中有效，无法在 app.json 中设置	
  usingComponents?: Object;//	否	页面自定义组件配置	1.6.3
  initialRenderingCache?: string;//		页面初始渲染缓存配置，支持 static / dynamic	2.11.1
  style?: string;//	default	启用新版的组件样式	2.10.2
  singlePage?: Object;//	否	单页模式相关配置	2.12.0
  restartStrategy?: string;//	homePage	重新启动策略配置	2.8.0
  handleWebviewPreload?: string;//	static	控制预加载下个页面的时机。支持 static / manual / auto	2.15.0
  visualEffectInBackground?: string;//	否	切入系统后台时，隐藏页面内容，保护用户隐私。支持 hidden / none，若对页面单独设置则会覆盖全局的配置，详见 全局配置	2.15.0
  enablePassiveEvent?: Object | boolean;// Object或boolean	否	事件监听是否为 passive，若对页面单独设置则会覆盖全局的配置，详见 全局配置	2.24.1
};

export type DeviceInfo = {
  value: string;
  label: string;
  statusBarHeight?: string | number;
  dimension: {
    width: string | number;
    height: string | number;
  };
};

const state = {
  pages: [] as Array<TPage>,
  components: {} as Record<TyPath, TComponentClass>,
  currComponentPath: '',
  homePage: '',
  currPage: '',
  config: {
    pages: [] as Array<string>,
    window: {
      backgroundTextStyle: '',
      navigationBarBackgroundColor: '',
      navigationBarTitleText: '',
      navigationBarTextStyle: '',
      backgroundColor: '',
      navigationStyle: '',
    },
    usingComponents: {} as UsingComponents,
  },
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
  device: {
    value: 'iPhoneX',
    label: 'iPhone X/Xs',
    statusBarHeight: '20px',
    dimension: {
      width: '375px',
      height: '812px'
    },
  } as DeviceInfo,
};

export const store = createStore({
  state,
});

export const files: Record<string, FileCache> = {};
export type Store = typeof state;
export type StatusInfo = PageConfig & {
  device: DeviceInfo;
}
export default store.state;
