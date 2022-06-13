import state from '../store';
import { voidElements } from '../utils/html';
import { Dom } from '../utils';
import { Output, Editor } from '../vspage';

const isContainer = (): boolean => {
  const ast = state.swap.ast;
  if (!ast) return true;
  return voidElements.has(ast.tag);
}

export const layout: TyActionGroup = {
  row: {
    label: '横向排列',
    icon: ' flex flex-direction',
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['flex-direction'] === 'row';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      if (style['flex-direction'] === 'row') {
        delete style['flex-direction'];
      } else {
        style['flex-direction'] = 'row';
      }
      if (style.display !== 'flex') {
        style.display = 'flex';
      }
      Editor.markDirty();
    },
  },
  column: {
    label: '纵向排列',
    icon: ' flex flex-direction flex-column',
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['flex-direction'] === 'column';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      if (style['flex-direction'] === 'column') {
        delete style['flex-direction'];
      } else {
        style['flex-direction'] = 'column';
      }
      if (style.display !== 'flex') {
        style.display = 'flex';
      }
      Editor.markDirty();
    },
  },
  alignStart: {
    label: '靠前',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} justify-content-flex-start`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['justify-content'] === 'flex-start';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['justify-content'] === 'flex-start') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'flex-start';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignCenter: {
    label: '居中',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} justify-content-center`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['justify-content'] === 'center';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['justify-content'] === 'center') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'center';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignEnd: {
    label: '靠后',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} justify-content-flex-end`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['justify-content'] === 'flex-end';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['justify-content'] === 'flex-end') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'flex-end';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignDistributed: {
    label: '平分',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} justify-content-space-around`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['justify-content'] === 'space-around';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['justify-content'] === 'space-around') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'space-around';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignTop: {
    label: '副轴靠前',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} align-items-flex-start`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['align-items'] === 'flex-start';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['align-items'] === 'flex-start') {
        patch['align-items'] = false;
      } else {
        patch['align-items'] = 'flex-start';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignMiddle: {
    label: '副轴居中',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} align-items-center`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['align-items'] === 'center';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['align-items'] === 'center') {
        patch['align-items'] = false;
      } else {
        patch['align-items'] = 'center';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
  alignBottom: {
    label: '副轴靠后',
    icon() {
      const ast = state.swap.ast;
      let column = '';
      if (ast) {
        const style = ast.style || ((ast as any).style = {}) as any;
        if (style['flex-direction'] === 'column') {
          column = ' flex-column';
        }
      }
      return ` flex${column} align-items-flex-end`;
    },
    disabled: isContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style['align-items'] === 'flex-end';
    },
    excute() {
      const ast = state.swap.ast;
      if (!ast) {
        Output.alert({ type: 'error', message: '未选中任何元素' });
        return;
      }
      const style = ast.style || ((ast as any).style = {}) as any;
      const patch = { display: 'flex' } as any;
      if (style['align-items'] === 'flex-end') {
        patch['align-items'] = false;
      } else {
        patch['align-items'] = 'flex-end';
      }
      if (Dom.patchStyle(style, patch)) {
        Editor.markDirty();
      }
    },
  },
}