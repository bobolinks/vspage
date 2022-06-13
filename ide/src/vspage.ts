
import { readonly } from 'vue';
import { VsPage as IVsPage, Output as IOutput, Editor as IEditor, AlertData, Env } from 'vspage';
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
  select(ast: TyAst): void {
    store.swap.ast = readonly(ast);
  }
  markDirty(): void {
    throw new Error('Method not implemented.');
  }
};

w.Editor = Editor;