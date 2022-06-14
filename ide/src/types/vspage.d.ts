declare module 'vspage' {
  /** 环境配置 */
  type Env = {
    base: string;
    host: string;
    nonce: string;
  }

  /** 页面内容 */
  interface PageData {
    scoped: string;
    /** wxml code */
    wxml: string;
    /** page options */
    json: PageConfig;
  }

  /** 编辑器服务接口 */
  interface VsPage {
    /** 初始化 */
    initialize(env: Env): void;
    /** 更新app配置 */
    syncAppConfig(appConfig: AppConfig): void;
    /** 设置当前页面 */
    setCurrentPage(path: TyAstPath, data: PageData): void;
    /** 更新页面 */
    updatePage(path: TyAstPath, data: Partial<PageData>): void;
    /** 同步选中元素 */
    select(target: TyAstPath | null): void;
  }

  /** 消息 */
  type MessageData = {
    type: 'debug' | 'info' | 'warning' | 'error';
    title?: string;
    message: string;
  };

  /** 服务反馈接口 */
  interface VsCode {
    /** 告警 */
    alert(data: string | MessageData): void;
    /** 同步样式补丁 */
    patchStyle(target: TyAstPath, patch: StylePatch): void;
    /** 同步选中元素 */
    select(target: TyAstPath | null): void;
  }

  type StylePatch = Record<string, string | false>;

  /** 编辑器接口 */
  interface Editor {
    /** 样式补丁 */
    patchStyle(style: StylePatch): boolean;
    /** 选中元素 */
    select(element: HTMLElement): void;
  }
}
