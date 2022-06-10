declare module 'std/uikit' {
  /*
   * Component types is a lite variant of html main content categories.
   * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Flow_content
   */
  type UkElementGroupTypeMdn = 'metadata' | 'flow' | 'container' | 'sectioning' | 'heading' | 'phrasing' | 'text' | 'embedded' | 'interactive' | 'form' | 'transparent';
  type UkElementGroupType = UkElementGroupTypeMdn | 'base' | 'chart' | 'layout' | 'navigation' | 'data' | 'notice' | 'media' | 'others';
  interface UkProp extends TyProp {
    /**优先级，整数值，用于在IDE的属性面板中展示时，对多个属性进行排序以区分前后顺序的值，值越大越靠前，
     * 且：大于0时，认为是常用属性，默认展示；等于0时，认为是非常用属性，默认隐藏，需要手动展开；小于0时，则任何情况都不展示，仅在解释代码时用；
     * ！：如果所有属性字段都没有设置优先级，则前5个属性会被IDE优先展示，后面的属性默认隐藏，需要手动展开
     * */
    priority?: number;
    /**双向数据，用户表明组件的关键属性 */
    model?: boolean;
    /**属性值的单位描述，比如px，ms等 */
    unit?: string;
    /**属性编辑器 */
    ui?: {
      /**插件名称 */
      widget: string;
      /**插件拓展配置, 用于自定义类型, 格式不做限制 */
      config?: object;
    };
    /**版本限制 */
    version?: string;
    /**属性分组名称 */
    group?: string;
  }
  interface UkMethod extends TyMethod {
    /**优先级, 参照 UkProp的定义 */
    priority?: number;
    /**版本限制 */
    version?: string;
  }
  type UkMethods = TyMap<UkMethod>
  interface UkEvent extends TyMethod {
    /**事件是否必填绑定，默认为否 */
    required?: boolean;
    /**定义参照UkProp.priority */
    priority?: number;
    /**版本限制 */
    version?: string;
  }
  interface UkSlot extends TyLabelable {
    /**优先级, 参照 UkProp的定义 */
    priority?: number;
    /**子组件清单，如果可放任何组件，则如此定义components:['*','@flow], @ 开头表示分组 */
    components?: Array<string>;
    /**用户传递给插槽组件的上下文，变量或表达式 */
    scoped?: string | Array<string>;
    /**版本限制 */
    version?: string;
  }
  interface UkExample extends TyLabelable {
    /**分组名称 */
    group?: string;
    /**样例的截图 */
    cover?: TyPath | TyUrl;
    /**样例的类型 */
    type: 'html' | 'ast';
    /**type为ast时有效 */
    ast?: TyAst;
    /**type为html时有效 */
    html?: string
  }
  interface UkComponentAnnotation extends TyLabelable {
    /**组件tagName 指最终生成到html代码中的tagName，
     * 尽量统一采用减号划分格式，
     * 如tag未定义，则TyMap<UkComponentAnnotation>中的key将会作为tag
     * */
    tag?: string;
    /**组件分组，可在UiKitAnnotation.groups定义，也可以在此定义 */
    group?: UkElementGroupType | Array<UkElementGroupType>;
    /**在线帮助文档链接，默认可不填，然后在setup里面设置 */
    link?: string;
    /**限定父组件，用于指明组件仅能在某些限定父组件内使用 */
    parent?: string | Array<string>;
    /**属性定义 */
    properties?: TyMap<UkProp>;
    /**方法定义 */
    methods?: UkMethods;
    /**事件定义 */
    events?: TyMap<UkEvent>;
    /**插槽定义 */
    slots?: TyMap<UkSlot>;
    /**样例定义，第一个为默认样例 */
    examples?: Array<UkExample>;
    /**属性依赖，内容不做强限制，具体实现取决于ide */
    dependencies?: object;
    /**额外信息，规范不做内容限定 */
    extra?: object;
  }

  /**组件分组定义 */
  type UiComponentGroups = {
    [key in UkElementGroupType]?: Array<string>
  }

  /**组件库描述 */
  interface UiKitAnnotation extends TyAnnotation {
    /**组件前缀 */
    prefix?: string;
    /**托管地址 */
    hosting?: {
      /**源代码托管地址 */
      src?: TyUrl;
      /**dist的cdn包托管地址 */
      cdn?: TyUrl;
      /**dist的npm包托管地址 */
      npm?: TyUrl;
      [key: string]: TyUrl | undefined
    };
    /**依赖定义, 为String时表示 TyDependency{version:value}的简写 */
    dependencies?: TyMap<TyDependency | string>;
    /**组件列表 */
    components: TyMap<UkComponentAnnotation>;
    /**组件分组 */
    groups?: UiComponentGroups;
    /**组件提供的icon（iconfont格式）*/
    icons?: {
      /**样式前缀 */
      prefix?: string;
      /**图标样式清单 */
      values: Array<string | { label: string, value: string }>;
      /**图标分类器 */
      classifier?: Array<{
        /**分类名称 */
        name: string;
        /**图标列表 */
        items: Array<string>;
      }>;
    };
    /**在组件代码被nodejs方式引入或者在挂接到浏览器上之后执行的脚本
     * 一般用于解决组件在使用环节的兼容性问题
     */
    install?(): void;
    /**在UiKit的描述内容被装载之后执行的初始化函数，常用于IDE上
     * 一般用于
     *  动态生成组件的帮助链接
     *  初始化图标内容
     *  ...
     */
    setup?(): void;
    /**额外信息，规范不做内容限定 */
    extra?: object;
  }
}