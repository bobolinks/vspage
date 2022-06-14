/**内置类型如下，如为Function类型时，可直接写Boolean、String...等，自定义类型的行为解释取决于具体平台 */
declare type TyType = 'boolean' | 'number' | 'integer' | 'bigint' | 'string' | 'function' | 'array' | 'object' | 'date' | 'datetime' | 'time' | boolean | number | string | Array<any> | object | Date | Function
/**通用版本类型，格式为 Major.Minor.Revision.Build */
declare type TyVersion = string
declare type TyUrl = string
declare type TyPath = string
/**值描述 */
declare type TyValueAnnotation = {
  /**值 */
  value: any;
  /**值标签 */
  label: string
}
/**可选值列表 */
declare type TyValues = Array<boolean | number | string | TyValueAnnotation>
/**用于生成字典的模版 */
declare type TyMap<T> = {
  [key: string]: T
}
declare type TyLabelable = {
  /**标签 */
  label?: string;
  /**描述 */
  description?: string;
}
/**校验规则，内置标准规则如url、email、number、datetime、date、time....，非内置规则统一使用函数方式来表示 */
declare type TyValidateFunction = (value: any) => Boolean
declare type TyValidator = 'url' | 'email' | 'number' | 'datetime' | 'date' | 'time' | string | TyValidateFunction | RegExp
/**通用属性描述 */
declare interface TyProp extends TyLabelable {
  /**类型 */
  type: TyType;
  /**默认值 */
  default?: any;
  /**校验规则 */
  validator?: TyValidator;
  /**可选值 */
  values?: TyValues;
  /**是否必填项，默认为否 */
  required?: boolean;
  /**外部引用 */
  $ref?: string
}
declare type TyProps = TyMap<TyProp>
/**参数描述 */
declare interface TyArg extends Partial<TyProp> {
  /**参数名 */
  name: string;
  /**类型，改为可选值，默认为string */
  type?: TyType;
}
/**参数列表, 为string时表示 {name: $str, type: string}*/
declare type TyArgs = Array<TyArg | string>
declare type TyArgNoName = Omit<TyArg, 'name'>;
/**方法描述 */
declare interface TyMethod extends TyLabelable {
  /**参数列表 */
  args?: TyArgs;
  /**输出值, 默认为void */
  out?: TyType | Record<string, TyArgNoName>;
}
/**方法列表 */
declare type TyMethods = TyMap<TyMethod>
/**文本表达式 */
declare type TyTextExp = {
  /**表达式内容 */
  $: string
};
/**逻辑描述 */
declare type TyAstLogic = {
  /**指令 */
  instruction: 'for' | 'if' | string;
  /**操作数据 */
  data: any;
};
/**文本节点 */
declare type TyAstText = {
  /**文本内容 */
  text: string | TyTextExp | Array<string | TyTextExp> | undefined;
};
/**注释节点 */
declare interface TyAstComment {
  /**文本内容 */
  comment: string;
}
/**宏节点 */
declare interface TyAstMacro {
  /**固定标签，非html标准，需要特殊处理 */
  tag: '#macro';
  /**宏名称 */
  name: string;
  /**检测表达式（js语法） */
  test: string;
  /**子节点*/
  children?: Array<TyAst | TyAstText | TyAstMacro | TyAstComment>;
}
/**元素语法树 */
declare interface TyAst {
  /**tagName，标签名，如果是文本节点的话，除了text子段外，其它子段均忽略 */
  tag: string;
  /**用于定义属性，并约定，:key模式表示属性绑定表达式，~key模式表示双向变量绑定*/
  attrs?: TyMap<any>;
  /**用于定义事件 */
  events?: TyMap<any>;
  /**用于定于应用于元素的样式，:key模式表示属性绑定表达式 */
  style?: TyMap<string>;
  /**子节点 */
  children?: Array<TyAst | TyAstText | TyAstMacro | TyAstComment>;
  /**样式类别 */
  classes?: string | TyTextExp | Array<string | TyTextExp>;
  /**节点逻辑 */
  logic?: TyAstLogic | Array<TyAstLogic>;
  /**其它自定义子段 */
  [key: string]: any;
}
/** 语法节点路径，格式为{index0}.{index1}.... */
declare type TyAstPath = string;
/**模块依赖 */
declare interface TyDependency {
  /**版本要求 */
  version: TyVersion;
  /**引入模式, 默认为module
   * module 模块方式引用，一般采用import或require的方式编译到dist包中
   * link 为链接（外部引用方式），用于以<link>或<script>方式插入到<head></head>
   */
  mode?: 'module' | 'link';
  /**模块名称或路径，名称时，取node_modules/name/下的package.json:main字段 */
  path?: string | TyPath | TyUrl;
  /**完整性标签，当module为url时，可选择性带上integrity及crossorigin */
  integrity?: string;
  /**跨域描述 */
  crossorigin?: string;
  /**模块附带的样式资源文件 */
  stylesheets?: Array<TyPath | TyUrl>
}
/**通用描述 */
declare interface TyAnnotation extends TyLabelable {
  /**描述信息所配套的组件库版本 */
  version: TyVersion;
  /**组件库名称 */
  name: string;
  /**主页地址 */
  home?: TyUrl;
}
