declare module 'std/project' {
  /**变量定义 */
  interface TyVariable extends TyLabelable {
    /**变量类型 */
    type?: 'boolean' | 'number' | 'function' | 'string' | 'array' | 'object' | 'date' | 'regexp';
    /**值 */
    value?: any;
    /**支持对象结构 */
    children?: TyMap<TyVariable>;
  }

  /**导入类型定义 */
  interface TyImport extends TyLabelable {
    /**导入名 */
    names?: {
      /**默认导入名，import xxx from ... */
      default?: string;
      /**具名导入，import { key: as xxx} from ...，如果xxx为空或等于key，则简写import { key } from ... */
      [key: string]: string | undefined;
    };
    /**来源定义 */
    from: string;
  }

  /**样式规则定义 */
  interface TyStyleRule extends TyLabelable {
    /**选择器 */
    selectors: Array<string>;
    /**样式属性 */
    attrs: TyMap<string>;
  }

  /**样式定义 */
  type TyStyleRules = Array<TyStyleRule>;

  /**函数实现定义 */
  interface TyMethodImplementation extends TyMethod {
    /**装饰，sync｜async，默认为空 */
    decoration?: 'sync' | 'async';
    /**函数体代码 */
    body: string;
  }

  interface TyMethodXetterImplementation {
    /**getter */
    get?: {
      /**装饰，sync｜async，默认为空 */
      decoration?: 'sync' | 'async';
      /**函数体代码 */
      body: string;
    };
    /**setter */
    set?: {
      /**装饰，sync｜async，默认为空 */
      decoration?: 'sync' | 'async';
      /**函数体代码 */
      body: string;
    };
  }

  /**属性类型 */
  interface TyAttrs {
    /**类型 */
    type: string;
    /**用于扩展 */
    [key: string]: any;
  }

  /**节点 */
  interface TyNode extends TyLabelable {
    /**节点类型 */
    type: string;
    /**节点数据最后被修改的时间 */
    mtimeMs: number;
    /**节点数据或状态最后被修改的时间 */
    ctimeMs: number;
    /**节点属性 */
    attrs?: TyAttrs;
    /**属性是否已脏 */
    dirty?: boolean;
    /**额外扩展内容 */
    extra?: TyMap<any>;
  }

  /**文件定义 */
  interface TyFile extends TyNode {
    /**类型 */
    type: 'file';
    /**数据类型 */
    mimetype?: string;
    /**文件内容 */
    content?: any;
    /**扩展 */
    extensions?: Array<any>;
  }

  /**目录节点 */
  interface TyDirNode extends TyNode {
    /**类型 */
    type: 'dir';
    /**文件及目录列表 */
    children: TyMap<TyNode | TyFile | TyDirNode>;
  }

  /**样式定义 */
  interface TyAttrsStyleSheet extends TyAttrs {
    /**类型 */
    type: 'stylesheet';
    /**样式规则 */
    rules?: TyStyleRules;
  }

  interface TyAttrsModule extends TyAttrs {
    /**类型 */
    type: 'module';
    /**导入配置 */
    imports?: Array<TyImport>;
    /**初始化代码 */
    init?: string;
    /**变量 */
    variables?: TyMap<TyVariable>;
    /**函数 */
    methods?: TyMap<TyMethodImplementation>;
  }

  /**页面定义 */
  interface TyAttrsPage extends TyAttrs {
    /**类型 */
    type: 'page-unit';
    /**页面配置 */
    options?: {
      /**任意健+值*/
      [key: string]: any;
    };
    /**页面语法树 */
    ast?: TyAst;
    /**局部变量 */
    variables?: TyMap<TyVariable>;
    /**计算属性 */
    computed?: TyMap<TyMethodImplementation | TyMethodXetterImplementation>;
    /**局部函数 */
    methods?: TyMap<TyMethodImplementation>;
    /**局部样式 */
    styles?: TyStyleRules;
    /**额外扩展内容 */
    extra?: TyMap<any>;
  }

  interface TyAttrsComponent extends Omit<TyAttrsPage, 'type'> {
    /**类型 */
    type: 'component-unit';
  }

  /**特性定义 */
  interface TyFeature extends TyLabelable {
    /**特性对应的实现文件，相对于项目跟路径，且父特性会继承所有自特性的实现文件 */
    files?: Array<string>;
    /**子特性 */
    children?: TyMap<TyFeature>;
  }

  /**项目定义 */
  interface TyProject {
    /**准从规范版本 */
    ver: TyVersion;
    /**基础属性 */
    props: {
      /**编号，用于系统内确定唯一性 */
      id: string;
      /**名称 */
      name: string;
      /**描述 */
      description?: string;
      /**创建人 */
      owner: {
        /**唯一id */
        openid: string;
        /**帐号 */
        account?: string;
        /**昵称 */
        nickname?: string;
        /**头像 */
        img?: TyUrl
      };
      /**项目版本 */
      version: TyVersion;
      /**最新修订版 */
      revision: number;
      /**使用的技术框架，比如Ra，Ng，Vue，WxApp.... */
      framework: string;
    };
    /**项目信息 */
    stats: {
      /**最后访问时间，单位MS */
      atimeMs: number;
      /**最后修改时间，单位MS */
      mtimeMs: number;
      /**创建时间，单位MS */
      ctimeMs: number;
      /**其它自定义子段，用于扩展 */
      [key: string]: any;
    };
    /**项目配置 */
    options: {
      /**其它自定义子段，用于扩展 */
      [key: string]: any;
    };
    /**依赖定义, 为String时表示 TyDependency{version:value,module:key}的简写 */
    dependencies?: TyMap<TyDependency | string>;
    /**特性定义，项目中使用的功能特性，类似树形宏定义 */
    features?: TyMap<TyFeature>;
    /**项目节点 */
    nodes: TyMap<TyNode>
  }

  /**项目配置，无节点内容 */
  interface TyProjectConfig extends Omit<TyProject, 'nodes'> {
  }
}
