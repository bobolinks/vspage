declare module 'std/facade' {
  /** 方法扩展，增加url字段 */
  interface FcMethod extends TyMethod {
    /**接口地址 */
    url: string;
  }
  type FcMethods = Record<string, FcMethod>

  /**接口平面描述 */
  interface TyFacadeAnnotation extends TyAnnotation {
    methods: FcMethods;
  }
}