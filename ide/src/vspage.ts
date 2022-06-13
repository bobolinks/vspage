
import { readonly } from 'vue';
import { VsPage as IVsPage, Output as IOutput, Editor as IEditor, AlertData, Env, StylePatch } from 'vspage';
import store from './store';

const w = window as any;

export const VsPage = new class implements IVsPage {
  initialize(env: Env): void {
    throw new Error('Method not implemented.');
  }
  setPage(page: string): void {
    throw new Error('Method not implemented.');
  }
};

w.VsPage = VsPage;

export const Output = new class implements IOutput {
  alert(data: string | AlertData): void {
    throw new Error('Method not implemented.');
  }
};

w.Output = Output;

export const Editor = new class implements IEditor {
  select(element: HTMLElement | null): void {
    if (element) {
      const ast = (element as any).__ast as TyAst;
      store.swap.ast = ast;
      store.swap.element = readonly(element);
    } else {
      store.swap.ast = readonly(null as any);
      store.swap.element = readonly(null as any);
    }
  }
  patchStyle(patch: StylePatch): boolean {
    if (!store.swap.ast) {
      return false;
    }
    const ast = store.swap.ast as any;
    const style = ast.style || ((ast as any).style = {}) as any;
    const element = store.swap.element as HTMLElement;
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      if (value === false) {
        if (Object.hasOwnProperty.call(style, key)) {
          delete style[key];
          element.style.setProperty(key, '');
          changed = true;
        }
        continue;
      }
      if (!Object.hasOwnProperty.call(style, key)) {
        changed = true;
        style[key] = value;
        element.style.setProperty(key, value);
      } else if (style[key] !== patch[key]) {
        changed = true;
        style[key] = value;
        element.style.setProperty(key, value);
      }
    }
    return changed;
  }
};

w.Editor = Editor;