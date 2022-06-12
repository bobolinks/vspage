type HexColor = string;
declare type UsingComponents = Record<string, string>;

// https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html
// 用于设置小程序的状态栏、导航条、标题、窗口背景色。
declare type WindowConfig = {
  // 属性	类型	默认值	描述	最低版本
  navigationBarBackgroundColor?: HexColor;//	HexColor	#000000	导航栏背景颜色，如 #000000	
  navigationBarTextStyle?: string;//	white	导航栏标题颜色，仅支持 black / white	
  navigationBarTitleText?: string;//		导航栏标题文字内容	
  navigationStyle?: 'default' | 'custom';//	default	导航栏样式，仅支持以下值：
  // default 默认样式
  // custom 自定义导航栏，只保留右上角胶囊按钮。参见注 2。	iOS/Android 微信客户端 6.6.0，Windows 微信客户端不支持
  backgroundColor?: HexColor;//	HexColor	#ffffff	窗口的背景色	
  backgroundTextStyle?: string;//	dark	下拉 loading 的样式，仅支持 dark / light	
  backgroundColorTop?: string;//	#ffffff	顶部窗口的背景色，仅 iOS 支持	微信客户端 6.5.16
  backgroundColorBottom?: string;//	#ffffff	底部窗口的背景色，仅 iOS 支持	微信客户端 6.5.16
  enablePullDownRefresh?: boolean;//	false	是否开启全局的下拉刷新。
  // 详见 Page.onPullDownRefresh	
  onReachBottomDistance?: number;//	50	页面上拉触底事件触发时距页面底部距离，单位为 px。
  // 详见 Page.onReachBottom	
  pageOrientation?: string;//	portrait	屏幕旋转设置，支持 auto / portrait / landscape
  // 详见 响应显示区域变化	2.4.0 (auto) / 2.5.0 (landscape)
  restartStrategy?: string;//	homePage	重新启动策略配置	2.8.0
  initialRenderingCache?: string;//		页面初始渲染缓存配置，支持 static / dynamic	2.11.1
  visualEffectInBackground?: string;//	none	切入系统后台时，隐藏页面内容，保护用户隐私。支持 hidden / none	2.15.0
  handleWebviewPreload?: string;//	static	控制预加载下个页面的时机。支持 static / manual / auto	2.15.0
}

// https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html
declare type AppConfig = {
  // 属性	类型	必填	描述	最低版本
  entryPagePath?: string;//	否	小程序默认启动首页	
  pages: string[];//	是	页面路径列表	
  window?: WindowConfig;//	否	全局的默认窗口表现	
  tabBar?: Object;//	否	底部 tab 栏的表现	
  networkTimeout?: Object;//	否	网络超时时间	
  debug?: boolean;//	否	是否开启 debug 模式，默认关闭	
  functionalPages?: boolean;//	否	是否启用插件功能页，默认关闭	2.1.0
  subpackages?: Object[];//	否	分包结构配置	1.7.3
  workers?: string;//	否	Worker 代码放置的目录	1.9.90
  requiredBackgroundModes?: string[];//	否	需要在后台使用的能力，如「音乐播放」	
  plugins?: Object;//	否	使用到的插件	1.9.6
  preloadRule?: Object;//	否	分包预下载规则	2.3.0
  resizable?: boolean;//	否	PC 小程序是否支持用户任意改变窗口大小（包括最大化窗口）；iPad 小程序是否支持屏幕旋转。默认关闭	2.3.0
  usingComponents?: UsingComponents;//	否	全局自定义组件配置	开发者工具 1.02.1810190
  permission?: Object;//	否	小程序接口权限相关设置	微信客户端 7.0.0
  sitemapLocation: string;//	是	指明 sitemap.json 的位置	
  style?: string;//	否	指定使用升级后的 weui 样式	2.8.0
  useExtendedLib?: Object;//	否	指定需要引用的扩展库	2.2.1
  entranceDeclare?: Object;//	否	微信消息用小程序打开	微信客户端 7.0.9
  darkmode?: boolean;//	否	小程序支持 DarkMode	2.11.0
  themeLocation?: string;//	否	指明 theme.json 的位置，darkmode为 true 为必填	开发者工具 1.03.2004271
  lazyCodeLoading?: string;//	否	配置自定义组件代码按需注入	2.11.1
  singlePage?: Object;//	否	单页模式相关配置	2.12.0
  supportedMaterials?: Object;//	否	聊天素材小程序打开相关配置	2.14.3
  serviceProviderTicket?: string;//	否	定制化型服务商票据	
  embeddedAppIdList?: string[];//	否	半屏小程序 appId	2.20.1
  halfPage?: Object;//	否	视频号直播半屏场景设置	2.18.0
  debugOptions?: Object;//	否	调试相关配置	2.22.1
  enablePassiveEvent?: Object | boolean;//	Object或boolean	否	touch 事件监听是否为 passive	2.24.1
  resolveAlias?: Object;//	否	自定义模块映射规则
};

// https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html
declare type PageConfig = WindowConfig & {
  // 详见 响应显示区域变化	2.4.0 (auto) / 2.5.0 (landscape)
  disableScroll?: boolean;//	false	设置为 true 则页面整体不能上下滚动。
  // 只在页面配置中有效，无法在 app.json 中设置	
  usingComponents?: UsingComponents;//	否	页面自定义组件配置	1.6.3
  style?: string;//	default	启用新版的组件样式	2.10.2
  singlePage?: Object;//	否	单页模式相关配置	2.12.0
  enablePassiveEvent?: Object | boolean;// Object或boolean	否	事件监听是否为 passive，若对页面单独设置则会覆盖全局的配置，详见 全局配置	2.24.1
};

declare type SystemInfo = WechatMiniprogram.SystemInfo & {
  naviHeight: number; // 40,
}