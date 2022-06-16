declare type Tinyint = number;
declare type Int = number;
declare type Float = number;
declare type Double = number;
declare type Datetime = Date;
declare type Time = Date;
/** miliseconds */
declare type Timestamp = number;
declare type Char<T> = string;
declare type Varchar<T> = string;
declare type Enum = string;
declare type Union = string;
declare type Json = Record<string, any>;

/** 名称 */
declare type Name = Varchar<64>;
/** 标签 */
declare type Label = Varchar<128>;
/** 用户唯一编号，由ID和域组成，格式为ID@DOMAIN, 如123123usyej@wechat,123123123213@tencent, */
declare type UID = Varchar<64>;
/** 数据哈希 */
declare type HASH = Varchar<32>;
/** 股票符号 = ${Market}.${Symbol} */
declare type STKSymbol = Varchar<32>;
/** @sample "key123" */
/** 匹配关键字 */
declare type MatchKey = string;
/** 错误码 */
declare type ErrCode = number;

declare interface Timetable {
  /** 最后更新时间 */
  /** @default now() */
  tsModified: Timestamp;
  /** 创建时间 */
  /** @default now() */
  tsCreate: Timestamp;
}

declare interface Namable {
  /** 名称 */
  name: Name,
  /** 标签 */
  label?: Label,
  /** 描述 */
  description?: string,
}

/** 含总数的列表 */
declare interface RecSet<T> {
  total: number;
  items: Array<T>;
}
