declare module 'vspage' {
  /** 环境配置 */
  type Env = {
    base: string,
    host: string;
    nonce: string;
  }

  /** 编辑器服务接口 */
  interface VsPage {
    /** 初始化 */
    initialize(env: Env): void;
    /** 设置当前页面 */
    setPage(page: string): void;
  }

  type AlertData = {
    type: 'debug' | 'info' | 'warning' | 'error';
    title?: string;
    message: string;
  };

  /** 服务反馈接口 */
  interface Output {
    /** 告警 */
    alert(data: string | AlertData): void;
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
