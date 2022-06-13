import state from '../store';
import { voidElements } from '../utils/html';
import { Output, Editor } from '../vspage';
import { StylePatch } from 'vspage';

export const isNotContainer = (): boolean => {
  const ast = state.swap.ast;
  if (!ast) return true;
  return voidElements.has(ast.tag);
}

export const layout: TyActionGroup = {
  row: {
    label: '横向排列',
    icon: ' flex flex-direction',
    disabled: isNotContainer,
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
      const patch = { display: 'flex' } as StylePatch;
      if (style['flex-direction'] === 'row') {
        patch['flex-direction'] = false;
        patch.display = false;
      } else {
        patch['flex-direction'] = 'row';
      }
      Editor.patchStyle(patch);
    },
  },
  column: {
    label: '纵向排列',
    icon: ' flex flex-direction flex-column',
    disabled: isNotContainer,
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
      const patch = { display: 'flex' } as StylePatch;
      if (style['flex-direction'] === 'column') {
        patch['flex-direction'] = false;
        patch.display = false;
      } else {
        patch['flex-direction'] = 'column';
      }
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      const patch = { display: 'flex' } as StylePatch;
      if (style['justify-content'] === 'flex-start') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'flex-start';
      }
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      const patch = { display: 'flex' } as StylePatch;
      if (style['justify-content'] === 'center') {
        patch['justify-content'] = false;
      } else {
        patch['justify-content'] = 'center';
      }
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      Editor.patchStyle(patch);
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
    disabled: isNotContainer,
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
      Editor.patchStyle(patch);
    },
  },
}