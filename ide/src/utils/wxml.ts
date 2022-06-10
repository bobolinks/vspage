import Html, { TyAstRoot } from "./html";
import Css from './css';

type TyLogicData = {
  /** for 主体 */
  entity: string,
};

interface TyLogicForData extends TyLogicData {
  /** 关键字 */
  key: string,
  /** 迭代值 */
  it: string,
  /** 索引值 */
  index: string,
}

export type TyEventValue = {
  type: 'catch' | 'bind';
  script: string;
  prefix?: string;
};

export default {
  parseTextValue(text: string): string | TyTextExp | Array<string | TyTextExp> {
    if (!/{{.*}}/.test(text)) {
      return text;
    }
    const values: Array<string> = [];
    const tokens = text.replace(/{{(.*?)}}/mg, ($0, $1) => {
      values.push($1);
      return '[#$#$#$#$]';
    }).split('[#$#$#$#$]');
    values.reverse();
    const outputs = [] as Array<any>;
    for (const iterator of tokens) {
      if (iterator) {
        outputs.push(iterator);
      }
      if (values.length) {
        outputs.push({
          $: values.pop(),
        });
      }
    }
    return outputs.length === 1 ? outputs[0] : outputs;
  },
  stringifyToEsTemplate(value: any): string {
    if (Array.isArray(value)) {
      let str = '';
      for (const v of value) {
        if (typeof v === 'string') {
          str += v;
        } else {
          str += `$\{${v.$}}`;
        }
      }
      return str;
    } if (typeof value === 'string') {
      return value;
    }
    return value.$ || '';
  },
  stringifyToExpression(value: any): string {
    if (Array.isArray(value)) {
      return value.map((v) => {
        if (typeof v === 'string') {
          return this.escapeAttr(v);
        }
        return `(${v.$})`;
      }).join('+');
    } if (typeof value === 'string') {
      return this.escapeAttr(value);
    }
    return value.$ || '';
  },
  stringifyToText(value: any): string {
    const values = Array.isArray(value) ? value : [value];
    let str = '';
    for (const v of values) {
      if (typeof v === 'string') {
        str += v;
      } else {
        str += `{{${v.$}}}`;
      }
    }
    return str;
  },
  stringifyToAttr(value: any): string {
    const str = this.stringifyToText(value);
    return this.escapeAttr(str);
  },
  escapeAttr(str: string) {
    str = str.replace(/\n/g, '\\n');
    const noSingle = !/'/.test(str);
    const noDouble = !/"/.test(str);
    if (noSingle && noDouble) {
      return `'${str}'`;
    } if (noDouble) {
      return `"${str}"`;
    }
    return `'${str.replace(/'/g, '\\')}'`;
  },
  toAst(src: string): TyAstRoot {
    let id = 0;
    const asts = Html.htmlToAstEx(src, undefined, {
      parseText: (ast: TyAstText, text: string) => {
        ast.text = this.parseTextValue(text);
        return true;
      },
      parseAttr: (ast: TyAst, name: string, value: string) => {
        name = name.toLocaleLowerCase();
        const values = this.parseTextValue(value);
        const hasBound = /{{.*}}/.test(value);
        if (['wx:for', 'wx:if', 'wx:elif'].indexOf(name) !== -1) {
          const logic = (ast.logic || ((ast as any).logic = { data: {} })) as TyAstLogic;
          logic.instruction = name;
          (logic.data as TyLogicForData).entity = values ? this.stringifyToEsTemplate(values) : value;
        } else if (name === 'wx:for-item') {
          const logic = (ast.logic || ((ast as any).logic = { data: {} })) as TyAstLogic;
          (logic.data as TyLogicForData).it = values ? this.stringifyToEsTemplate(values) : value;
        } else if (name === 'wx:for-index') {
          const logic = (ast.logic || ((ast as any).logic = { data: {} })) as TyAstLogic;
          (logic.data as TyLogicForData).index = values ? this.stringifyToEsTemplate(values) : value;
        } else if (name === 'wx:key') {
          const logic = (ast.logic || ((ast as any).logic = { data: {} })) as TyAstLogic;
          (logic.data as TyLogicForData).key = values ? this.stringifyToEsTemplate(values) : value;
        } else if (name === 'wx:else') {
          const logic = (ast.logic || ((ast as any).logic = { data: {} })) as TyAstLogic;
          logic.instruction = name;
        } else if (/^(capture-)?(mut-)?(bind|catch):?(.+)$/.test(name)) {
          const [, prefix, type, ename] = /^((?:capture-)?(?:mut-)?)(bind|catch):?(.+)$/.exec(name) || [];
          (ast.events || (ast.events = []))[ename] = {
            type,
            script: values ? this.stringifyToText(values) : value,
            prefix
          } as TyEventValue;
        } else if (name === 'class') {
          ast.classes = [];
          for (const cls of (Array.isArray(values) ? values : [values])) {
            if (typeof cls === 'string') {
              ast.classes.push(...(cls as any).split(' '));
            } else {
              ast.classes.push(cls);
            }
          }
        } else if (name === 'style') {
          if (hasBound) {
            if (!ast.attrs) ast.attrs = {};
            ast.attrs[hasBound ? `:${name}` : name] = values ? this.stringifyToText(values) : value;
          } else {
            ast.style = Css.inlineStyleToAst(value);
          }
        } else {
          if (!ast.attrs) ast.attrs = {};
          ast.attrs[hasBound ? `:${name}` : name] = values ? this.stringifyToText(values) : value;
        }
        return true;
      },
      transform(ast: TyAst): TyAst {
        ast.id = ++id;
        return ast;
      },
    });
    asts.htmlAst.id = 0;
    return asts.htmlAst;
  }
};
