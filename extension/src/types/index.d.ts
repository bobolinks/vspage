declare type TypeToken = number;

declare interface MessageBase {
  /** method name */
  method: string;
  /** is response, default false */
  isrsp?: boolean;
}

declare interface MessageResponse extends MessageBase {
  /** is response */
  isrsp: true;
  /** request token */
  token: TypeToken;
  /** error code */
  code: number;
  /** response data */
  data?: any;
}

declare interface MessageRequest extends MessageBase {
  /** is request */
  isrsp?: false;
  /** request token */
  token: TypeToken;
  /** params */
  params: Array<any>;
  /** timer */
  timer: NodeJS.Timeout;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}