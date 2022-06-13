import state from "../store";
import { isNotContainer } from "./layout";

export const group: TyActionGroup = {
  flex: {
    label: 'FLEX',
    icon: 'layout',
    disabled: isNotContainer,
    actived() {
      const ast = state.swap.ast;
      if (!ast) return false;
      const style = ast.style || ((ast as any).style = {});
      return style.display === 'flex';
    },
    excute: () => false,
  }
};