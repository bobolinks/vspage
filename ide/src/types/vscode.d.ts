declare const VsCodeApi: {
  getState(): object;
  setState(state: object): void;
  postMessage(msg: any): void;
};
