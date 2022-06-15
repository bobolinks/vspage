declare interface VsPageConfig {
  /** 工程跟路径 */
  projectRoot: string;
  /** ts代码检测屏蔽路径 */
  exclude: Array<string>;
}