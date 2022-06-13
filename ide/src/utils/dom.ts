import { TyAstRoot } from "./html";
import Wxml, { TyEventValue } from './wxml';

declare type TyAstPath = string;
declare const exparser: any;

export type TyAttrsMap = Record<string /* tag */, Record<string /* attr */, string /* value */>>;

type TyCreateOptions = {
  ast: TyAst;
  attrs: Record<string, string | number | boolean>;
  events: Record<string, TyEventValue>;
  classList: Array<string>;
  propKeys: Array<string>;
};

function createElement(instance: any, tag: string, options: TyCreateOptions) {
  const node = customElements.get(tag) ? undefined : exparser.Component.create(tag);
  const el = node ? node.$$ : document.createElement(tag);
  const data: Record<string, string | number | boolean> = {};
  const keys = new Set(options.propKeys);
  for (const it of (options.classList || [])) {
    el.classList.toggle(it);
  }
  for (const [name, value] of Object.entries(options.attrs)) {
    const camelName = name.replace(/-([a-zA-Z])/g, $1 => $1.substring(1).toLocaleUpperCase());
    if (keys.has(name)) {
      data[camelName] = value;
    } else {
      el.setAttribute(name, value === null ? '' : value);
    }
  }
  /* disable events
  for (const [name, value] of Object.entries(options.events)) {
    if (name === 'tap') {
      el.onclick = (ev: Event) => {
        instance[value.script](ev);
      };
    }
    else if (el.hasOwnProperty(`on${name}`)) {
      el[`on${name}`] = (ev: Event) => {
        instance[value.script](ev);
      };
    }
  }
  */
  el.__ast = options.ast;
  el.__props = data;
  if (!node) {
    return el;
  }
  node.setData(data);
  node._hasCheckedLinked = true;
  node.__lifeTimeFuncs.attached.call(node.__methodCaller, [], node);
  return node.$$;
}

function inlineStyleTranform(style: Record<string, string>): string {
  let src = '';
  for (const key of Object.keys(style).sort()) {
    let v = style[key].toString();
    // process rpx in calc
    while (v.indexOf('rpx') !== -1) {
      const nv = v.replace(/calc(\(|(?:\([^)]*[\s-+/*]))(\d+)rpx(\)|(?:[\s-+/*][^)]*\)))/gm, 'calc$1var(--devicePixelRatio) * $2px$3');
      if (nv !== v) {
        v = nv;
      } else {
        break;
      }
    }
    // process rpx in others
    while (v.indexOf('rpx') !== -1) {
      const nv = v.replace(/(^|[\s+/*])(-?\d+)rpx/gm, '$1calc(var(--devicePixelRatio) * $2px)');
      if (nv !== v) {
        v = nv;
      } else {
        break;
      }
    }
    src += `${key}: ${v.replace(/'/g, '"')}; `;
  }
  return src;
}

export default {
  patchStyle(dst: any, src: any) {
    let changed = false;
    for (const [key, value] of Object.entries(src)) {
      if (value === false) {
        if (Object.hasOwnProperty.call(dst, key)) {
          delete dst[key];
          changed = true;
        }
        continue;
      }
      if (!Object.hasOwnProperty.call(dst, key)) {
        changed = true;
        dst[key] = value;
      } else if (dst[key] !== src[key]) {
        changed = true;
        dst[key] = value;
      }
    }
    if (!changed) {
      console.log('no changed!');
    }
    return changed;
  },
  excute(expression: string, scoped: Record<string, any>, context: Object) {
    const target = Object.assign({}, context, scoped);
    const _f = new Function('target', `with(target){ return ${expression};}`);
    try {
      return _f.call(undefined, target);
    } catch (e) {
      return undefined;
    }
  },
  generate(instance: any, ast: TyAstRoot, data: Object, scopedAttr: string, withPath?: boolean, attrsMap?: TyAttrsMap, propsMap?: Record<string, Array<string>>) {
    const create = (ast: TyAst, nodePath: TyAstPath = '', scoped: Record<string, any>) => {
      if (!ast.tag && (ast.comment || (typeof ast.text === 'string' && !ast.text.trim()))) {
        return undefined;
      }
      if (!ast.tag) {
        if (!ast.text) {
          return undefined;
        }
        let textOrg = ast.text;
        let isExpression = false;
        if (Array.isArray(ast.text)) {
          for (const iterator of ast.text) {
            if (Object.hasOwnProperty.call(iterator, '$')) {
              isExpression = true;
              break;
            }
          }
          textOrg = ast.text.join('');
        } else if (Object.hasOwnProperty.call(ast.text, '$')) {
          isExpression = true;
        }
        const text = Wxml.stringifyToExpression(ast.text);
        const value = (isExpression ? this.excute(text, scoped, data) : textOrg);
        if (typeof value === 'undefined' || value === null) {
          return document.createTextNode(Wxml.stringifyToText(ast.text) || '[文本]');
        }
        return document.createTextNode(value);
      }

      const attrs: Record<string, string> = {
        [scopedAttr]: null as any,
      };
      // const n = document.createElement(`wx-${ast.tag}`);
      const n = {
        setAttribute(name: string, value: string) {
          attrs[name] = value;
        }
      };

      if (ast.id !== undefined) {
        n.setAttribute('data-attr-id', ast.id);
      }
      if (withPath && nodePath) {
        n.setAttribute('data-attr-path', nodePath);
      }

      // make a slot to place new element
      const classList: any = ast.classes ? (typeof ast.classes === 'string' ? [ast.classes] : [...ast.classes as Array<any>]) : [];
      if (ast.tag === 'block') {
        classList.push('editor-element-inherit');
      }

      // process attrs
      for (const key in ast.attrs || {}) {
        const isBound = /^[:~]/.test(key);
        const keyWithoutComma = isBound ? key.substring(1) : key;
        const value = (ast.attrs as any)[key];
        // ignores wxml hidden attribute
        if (keyWithoutComma === 'hidden') continue;
        if (key === 'class') {
          classList.push(value);
        } else if (isBound) {
          n.setAttribute(keyWithoutComma, this.excute(Wxml.stringifyToExpression(Wxml.parseTextValue(value)), scoped, data));
        } else {
          n.setAttribute(keyWithoutComma, value);
        }
      }

      // process events
      const events: Record<string, TyEventValue> = {};
      for (const key in ast.events || {}) {
        const value = (ast.events as any)[key] as TyEventValue;
        events[key] = {
          type: value.type,
          prefix: value.prefix,
          script: this.excute(Wxml.stringifyToExpression(Wxml.parseTextValue(value.script)), scoped, data),
        };
      }
      // process class list
      if (classList.length) {
        let hasBound = false;
        for (const iterator of classList) {
          if (Object.hasOwnProperty.call(iterator, '$')) {
            hasBound = true;
          }
        }
        if (hasBound) {
          const nameList = [];
          for (const iterator of classList) {
            if (Object.hasOwnProperty.call(iterator, '$')) {
              nameList.push(this.excute(iterator.$, scoped, data));
            } else {
              nameList.push(iterator);
            }
          }
          classList.length = 0;
          nameList.filter(e => e).forEach(e => classList.push(e));
        }
      }

      // process style
      if (ast.style && Object.keys(ast.style).length) {
        n.setAttribute('style', inlineStyleTranform(ast.style));
      }

      if (attrsMap) {
        for (const [k, v] of Object.entries(attrsMap[ast.tag] || {})) {
          if (attrs.hasOwnProperty(k)) {
            continue;
          }
          attrs[k] = v;
        }
      }

      const node = createElement(instance, `wx-${ast.tag}`, {
        ast,
        attrs,
        events,
        classList: classList.filter((e: any) => e),
        propKeys: propsMap && propsMap[ast.tag] || [],
      });

      // process children
      if (ast.children) {
        trv(ast.children as any, node, nodePath, scoped);
      }
      return node;
    }
    const trv = (children: Array<TyAst>, parent: ParentNode, parentPath: TyAstPath = '', scoped: Record<string, any>) => {
      let inIf = false;
      for (const i in children) {
        const nodePath = parentPath ? `${parentPath}.${i}` : i;
        const ast = children[i];
        if (ast.logic) {
          const logics: Array<TyAstLogic> = Array.isArray(ast.logic) ? ast.logic : [ast.logic];
          // process if condiction
          let logicCond = logics.find(e => e.instruction === 'wx:if');
          if (logicCond) {
            if (!this.excute(logicCond.data.entity, scoped, data)) {
              inIf = true;
              continue;
            }
            // consumed
          } else if ((logicCond = logics.find(e => e.instruction === 'wx:elif'))) {
            if (inIf) {
              if (!this.excute(logicCond.data.entity, scoped, data)) {
                continue;
              }
              // consumed
              inIf = false;
            } else {
              // ignore
              continue;
            }
          } else if ((logicCond = logics.find(e => e.instruction === 'wx:else'))) {
            if (inIf) {
              // consumed
              inIf = false;
            } else {
              // ignore
              continue;
            }
          } else {
            // break
            inIf = false;
          }
          const logicFor = logics.find(e => e.instruction === 'wx:for');
          if (logicFor) {
            const entity = this.excute(logicFor.data.entity, scoped, data);
            const forIndex = logicFor.data.index || 'index';
            const forItem = logicFor.data.it || 'item';
            for (const [index, item] of Object.entries(entity || {})) {
              const childScoped = Object.assign({}, scoped, {
                [forIndex]: index,
                [forItem]: item,
              });
              const c = create(ast, nodePath, childScoped);
              if (c === undefined) continue;
              parent.append(c);
            }
          } else {
            const c = create(ast, nodePath, scoped);
            if (c) {
              parent.append(c);
            }
          }
        } else {
          const c = create(ast, nodePath, scoped);
          if (c) {
            parent.append(c);
          }
        }
      }
    };
    const fragment = document.createDocumentFragment();
    trv(ast.children as any, fragment, '', {});
    return fragment;
  }
}
