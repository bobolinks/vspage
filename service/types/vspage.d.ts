declare interface VsPageConfig {
  /** 工程跟路径 */
  projectRoot: string;
  /** ts代码检测屏蔽路径 */
  exclude: Array<string>;
  /** 组件自定义映射 */
  modules: Record<string, string>;
}