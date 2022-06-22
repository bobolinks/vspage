declare module 'vspage' {
  /** 页面内容 */
  interface PageData {
    scoped: string;
    /** wxml code */
    wxml: string;
  }

  /** 编辑器服务接口 */
  interface VsPage {
    /** 更新app配置 */
    syncAppConfig(appConfig: AppConfig): void;
    /** 设置当前页面 */
    setCurrentPage(path: TyPath, data: PageData): void;
    /** 更新页面 */
    updatePage(path: TyPath, data: Partial<PageData>): void;
    /** 更新文件wxss|xs */
    updateFile(path: TyPath, timestamp: number);
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
    patchStyle(path: TyPath, target: TyAstPath, patch: StylePatch): void;
    /** 同步选中元素 */
    select(path: TyPath, target: TyAstPath | null): void;
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
