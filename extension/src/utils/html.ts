/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable max-len */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-var-requires */
import css from 'css';
import htmlParser from 'html-parser';
import cssUtil from './css';

export const voidElements = new Set(['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

type TyCssAst = any;

export interface TyAstRoot {
  id: number;
  children: Array<TyAst | TyAstText | TyAstMacro | TyAstComment>;
}

export type TyParseOptions = {
  /** keep css var */
  keepVar?: boolean,
  /** parse attribute */
  parseAttr?(ast: TyAst, name: string, value: string): boolean,
  /** parse text */
  parseText?(ast: TyAstText, value: string): boolean,
  /** before append to tree */
  transform?(ast: TyAst): TyAst;
};

const attributeExpr = {
  '~='(elValue: any, value: any) {
    if (!value || value.indexOf(' ') > -1) {
      return 0;
    }
    return (` ${elValue} `).indexOf(` ${value} `) !== -1;
  },
  '|='(elValue: any, value: any) {
    return (` ${elValue}`).indexOf(` ${value}-`) !== -1;
  },
  '^='(elValue: any, value: any) {
    return value && elValue.startsWith(value);
  },
  '$='(elValue: any, value: any) {
    return value && elValue.endsWith(value);
  },
  '*='(elValue: any, value: any) {
    return value && elValue.indexOf(value) !== -1;
  },
  '='(elValue: any, value: any) {
    return elValue === value;
  },
};

const tool = {
  toAttrString(str: string): string {
    if (typeof str !== 'string') return `'${str}'`;
    const noSingle = !/'/.test(str);
    const noDouble = !/"/.test(str);
    if (noSingle && noDouble) {
      return `'${str}'`;
    } if (noDouble) {
      return `"${str}"`;
    }
    return `'${str.replace(/'/g, '\\')}'`;
  },
};

export interface HtmlEmitter {
  textContent(ast: TyAstText): string,
  stringify(ast: TyAst): string,
}

const emitterHtml: HtmlEmitter = {
  textContent(ast: TyAstText): string {
    return ast.text as string;
  },

  stringify(ast: TyAst) {
    let src = '';
    if (ast.classes) {
      if (typeof ast.classes === 'string') {
        src = ` class='${ast.classes}'`;
      } else if (Array.isArray(ast.classes)) {
        src = ` class='${ast.classes.join(' ')}'`;
      }
    }
    for (const key of Object.keys(ast.attrs || {})) {
      const v = (ast.attrs as any)[key];
      if (typeof v === 'string' && v === '') {
        src += ` ${key}`;
      } else if ((typeof v === 'boolean' && v === true) || v === null) {
        src += ` ${key}`;
      } else {
        src += ` ${key}=${tool.toAttrString(v)}`;
      }
    }
    const style = Object.assign(ast.Gstyle || {}, ast.style || {});
    if (Object.keys(style).length) {
      src += ` style='${cssUtil.astToInlinestyle(style)}'`;
    }
    return src;
  },
};

export default {
  tool,
  emitter: emitterHtml,

  cssToInlineStyle(html: string, cssCode: string, options = { keepVar: false }) {
    const { htmlAst } = this.cssToInlineStyleAst(html, cssCode, options);
    return this.astToHtml(htmlAst);
  },

  cssToInlineStyleAst(html: string, cssCode: string, options = {}) {
    const cssAst = css.parse(cssCode);
    const { htmlAst, cssVars } = this.htmlToAstEx(html, cssAst, options);
    const ast = htmlAst as unknown as TyAst;
    for (const rule of cssAst.stylesheet?.rules || []) {
      if (rule.type !== 'rule') continue;
      for (const selector of (rule as any).selectors || []) {
        const elements = this.querySelectors(ast as TyAst, selector);
        if (!elements || !elements.length) continue;
        for (const declaration of (rule as any).declarations) {
          if (declaration.type !== 'declaration') continue;
          const hasVar = /^var\(/.test(declaration.value) || /[\s]var\(/.test(declaration.value);
          const value = hasVar ? this.getCssPropertyValue(cssAst, declaration.value, cssVars) : declaration.value;
          for (const e of elements) {
            if (hasVar) {
              e.style[declaration.property] = value;
            } else {
              (e.Gstyle || (e.Gstyle = {}))[declaration.property] = value;
            }
          }
        }
      }
    }
    return { htmlAst, cssVars };
  },

  querySelectors(ast: TyAst, sel: string, recursive = true, els = undefined as unknown as Array<TyAst>) {
    const ms = /^([.#])?([0-9a-z_-]+)(?::([0-9a-z_-]+))?(?:\[([0-9a-z_-]+)(?:([~|^$*]?=)(.+))?\])?([ >~+]\s*[.#]?[0-9a-z_-].*)?$/i.exec(sel);
    if (!ms) return undefined;
    const selector = {
      type: ms[1],
      key: ms[2],
      pseudo: ms[3],
      attrKey: ms[4],
      attrOpr: ms[5],
      attrValue: ms[6],
    };
    if (selector.pseudo || !selector.key) {
      // unsupported
      return [];
    }
    const elements = els || [];
    const trv = (node: TyAst, parent?: TyAst) => {
      let testing = true;
      if (selector.type === '.') {
        const clss = (node.attrs?.class || '').split(' ');
        if (clss.indexOf(selector.key) === -1) {
          testing = false;
        }
      } else if (selector.type === '#') {
        if (node.attrs?.id !== selector.key) {
          testing = false;
        }
      } else if (node.tag !== selector.key) {
        testing = false;
      }
      if (testing && selector.attrKey) {
        if (selector.attrValue) {
          if (!(attributeExpr as any)[selector.attrOpr]((node.attrs as any)[selector.attrKey], selector.attrValue)) {
            testing = false;
          }
        } else if (!(node.attrs as any).hasOwnProperty(selector.attrKey)) {
          testing = false;
        }
      }
      if (testing) {
        elements.push({ node, parent } as unknown as TyAst);
      }
      if (!recursive) return;
      for (const child of node.children || []) {
        trv(child as TyAst, node);
      }
    };
    trv(ast);
    if (!ms[7]) return elements.map(e => (e as any).node);
    const grpElements: Array<TyAst> = [];
    // eslint-disable-next-line prefer-destructuring
    const locator = ms[7][0];
    const subsel = ms[7].substring(1);
    for (const e of elements) {
      if (locator === ' ') {
        this.querySelectors((e as any).node, subsel, true, grpElements as any);
        continue;
      } else if (locator === '>') {
        this.querySelectors((e as any).node, subsel, false, grpElements as any);
        continue;
      } else if (!(e as any).parent) {
        continue;
      }
      const start = (e as any).parent.children.indexOf((e as any).node) + 1;
      if ((e as any).parent.children.length <= start) continue;
      if (locator === '+') {
        this.querySelectors((e as any).parent.children[start], subsel, false, grpElements as any);
        continue;
      } else { // is ~
        for (let i = start; i < (e as any).parent.children.length; i++) {
          this.querySelectors((e as any).parent.children[i], subsel, false, grpElements as any);
        }
      }
    }
    return grpElements.map(e => e.node);
  },

  getCssPropertyValue(ast: TyCssAst, code: string, cssVars?: TyMap<any>) {
    return code.replace(/var\((.+)\)/g, ($0, proName) => {
      let value;
      for (const rule of ast.stylesheet.rules) {
        if (rule.type !== 'rule' || rule.selectors.indexOf(':root') === -1) {
          continue;
        }
        for (const declaration of rule.declarations) {
          if (declaration.property === proName) {
            // eslint-disable-next-line prefer-destructuring
            value = declaration.value;
          }
        }
      }
      if (cssVars) cssVars[proName] = value;
      return value;
    });
  },

  htmlToAstEx(html: string, cssAst: TyCssAst, options: TyParseOptions = {}): { htmlAst: TyAstRoot, cssVars: Record<string, any> } {
    let htmlFmt = html.replace(/<!---CLSTAG-MACRO\(\s*([^)\s]+)\s*\)(---|~~~)>/ig, '<#macro name="$1" test="$2">');
    htmlFmt = htmlFmt.replace(/<!(---|~~~)CLSTAG-MACRO-END\(\s*([^)\s]+)\s*\)--->/ig, '</#macro>');
    const { parseAttr } = options;
    const { parseText } = options;
    const transform = options.transform || ((e: TyAst) => e);
    function Text(text: string, parent = undefined as any): TyAstText {
      const ast = { parent } as unknown as TyAstText;
      if (!parseText || !parseText(ast, text)) {
        ast.text = text;
      }
      return ast;
    }
    function Comment(text: string, parent = undefined as any): TyAstComment {
      return { comment: text, parent } as unknown as TyAstComment;
    }
    function Code(text: string, parent = undefined as any): TyAstText {
      return { text, parent } as unknown as TyAstText;
    }
    function Element(tag: string, parent = undefined as any): TyAst {
      return { tag, attrs: {}, style: {}, children: [] as Array<TyAst>, parent };
    }
    const cssVars = {};
    const stack: Array<any> = [];
    const root: TyAstRoot = { id: 0, children: [] };
    let curNode: any = root;
    let leadingText = '';
    htmlParser.parse(htmlFmt, {
      openElement: (name) => {
        // close void element first
        if (curNode && voidElements.has(curNode.tag)) {
          curNode.selfClose = true;
          const n = curNode;
          (n as any).endingText = leadingText;
          leadingText = '';
          curNode = stack.pop();
          // console.log(`/>${' '.repeat(stack.length)}[${stack.length}]/${n.tag} -- ${name}`);
          curNode.children.push(transform(n));
        }
        const n = name === '#macro' ? { tag: name, name: undefined, test: undefined, children: [] } : Element(name, curNode);
        // console.log(`<${' '.repeat(stack.length)}[${stack.length}]${name}`);
        stack.push(curNode);
        curNode = n;
        (n as any).leadingText = leadingText;
        leadingText = '';
      },
      // eslint-disable-next-line no-unused-vars
      closeOpenedElement: (name, token, unary) => {
        if (token === '/>' || token === '?>') {
          curNode.selfClose = unary;
          const n = curNode;
          (n as any).endingText = leadingText;
          leadingText = '';
          curNode = stack.pop();
          // console.log(`/>${' '.repeat(stack.length)}[${stack.length}]/${n.tag} -- ${name}`);
          curNode.children.push(transform(n));
        }
      },
      // eslint-disable-next-line no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      closeElement: (name) => {
        // close void element first
        if (curNode && curNode.tag !== name && voidElements.has(curNode.tag)) {
          curNode.selfClose = true;
          const n = curNode;
          (n as any).endingText = leadingText;
          leadingText = '';
          curNode = stack.pop();
          // console.log(`/>${' '.repeat(stack.length)}[${stack.length}]/${n.tag} -- ${name}`);
          curNode.children.push(transform(n));
        }
        const n = curNode;
        (n as any).endingText = leadingText;
        leadingText = '';
        curNode = stack.pop();
        // console.log(`</${' '.repeat(stack.length)}[${stack.length}]/${n.tag} -- ${name}`);
        curNode.children.push(transform(n));
      },
      comment: (value) => {
        const n = Comment(value, curNode);
        (n as any).leadingText = leadingText;
        leadingText = '';
        curNode.children.push(transform(n as unknown as TyAst));
      },
      cdata: (value) => {
        const n = Code(value, curNode);
        (n as any).leadingText = leadingText;
        leadingText = '';
        curNode.children.push(transform(n as unknown as TyAst));
      },
      attribute: (name, value) => {
        if (curNode.tag === '#macro') {
          if (name === 'name') {
            curNode.name = value;
          } else if (name === 'test') {
            curNode.test = value;
          }
        }
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (parseAttr && parseAttr(curNode, name, value)) {
          return;
        }
        if (name === 'style') {
          curNode.style = cssUtil.inlineStyleToAst(value);
          for (const key of Object.keys(curNode.style)) {
            const value = curNode.style[key];
            const hasVar = /^var\(/.test(value) || /[\s]var\(/.test(value);
            if (hasVar && cssAst) {
              const vfmt = this.getCssPropertyValue(cssAst, value, cssVars);
              if (!(options as any).keepVar) {
                curNode.style[key] = vfmt;
              }
            }
          }
        } else if (name === 'class') {
          curNode.classes = value.replace(/\s\s+/, ' ').split(' ');
        } else {
          curNode.attrs[name] = value;
        }
      },
      docType: (value) => {
        leadingText = '';
        console.warn('doctype: %s', value);
      },
      text: (value) => {
        const m = /^([\s\n]*)([\s\S]*)([\s\n]*)$/.exec(value);
        if (!m) return;
        const [, left, midle, right] = m;
        if (midle) {
          const n = Text(midle, curNode);
          (n as any).leadingText = left || '';
          curNode.children.push(transform(n as unknown as TyAst));
          leadingText = right || '';
        } else {
          leadingText = left || '';
        }
      },
    }, {
      attribute: /[~@:a-zA-Z_#][\w:\-.]*/,
    });
    if (curNode && curNode !== root) {
      do {
        const n = curNode;
        (n as any).endingText = leadingText;
        leadingText = '';
        curNode = stack.pop();
        curNode.children.push(transform(n));
      } while (curNode !== root);
    }
    return { htmlAst: root, cssVars };
  },

  htmlToAst(html: string): TyAstRoot {
    return this.htmlToAstEx(html, null).htmlAst;
  },

  astToHtml(ast: TyAstRoot | TyAst, depth = 0, emitter = emitterHtml) {
    const ts = (n: TyAst, depth: number) => {
      if (n.text) {
        return (n.leadingText || '') + emitter.textContent(n as any);
      } if (n.comment) {
        return `${n.leadingText || ''}<!--${n.comment}-->`;
      } if (!n.tag) {
        let src = '';
        for (const child of n.children || []) {
          src += ts(child as TyAst, depth + 1);
        }
        return src;
      }
      let src = '';
      if (n.hasOwnProperty('leadingText')) {
        src += n.leadingText;
      } else {
        src += `\n${' '.repeat(2 * depth)}`;
      }
      src += `<${n.tag}`;
      src += emitter.stringify(n);
      if (n.selfClose || voidElements.has(n.tag)) {
        src += '/>';
        return src;
      }
      src += '>';

      let hasTag = false;
      for (const child of n.children || []) {
        if ((child as any).tag) hasTag = true;
        src += ts(child as TyAst, depth + 1);
      }
      if (n.hasOwnProperty('endingText')) {
        src += n.endingText;
      } else if (hasTag) {
        src += `\n${' '.repeat(2 * depth)}`;
      }
      src += `</${n.tag}>`;
      return src;
    };
    return ts(ast as TyAst, depth).replace(/^\n+/, '');
  },

  cssToAst(cssCode: string): TyCssAst {
    return css.parse(cssCode);
  },

  astToCss(ast: TyCssAst): string {
    return css.stringify(ast);
  },

  astScoped(htmlAst: TyAstRoot | TyAst, cssAst: TyCssAst) {
    const scopedAttr = `scoped-p-${(~~(Math.random() * 6)).toString(6)}`;
    const ts = (n: TyAst) => {
      if (n.attrs) {
        n.attrs[scopedAttr] = true;
      }
      for (const child of n.children || []) {
        ts(child as TyAst);
      }
    };
    ts(htmlAst as TyAst);
    for (const rule of cssAst.stylesheet.rules) {
      const newSelectors = [];
      for (const selector of rule.selectors) {
        const ms: Array<any> = /^(.+)(?:(:.+))$/.exec(selector) || [];
        newSelectors.push(`${ms[1]}[${scopedAttr}]${ms || ''}`);
      }
      rule.selectors = newSelectors;
    }
  },
};
