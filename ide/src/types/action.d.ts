type TyFunction<T> = () => T;

declare interface TyAction extends TyLabelable {
  label: string;
  icon: string | TyFunction<string>;
  disabled?: boolean | TyFunction<boolean>;
  actived?: boolean | TyFunction<boolean>;
  excute(event?: Event): any;
}

declare type TyActionGroup = Record<string, TyAction>;