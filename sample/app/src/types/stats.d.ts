declare module 'dl/stats' {
  type Type = 'service' | 'product';
  type Order = 'asc' | 'desc';

  type Earn = {
    // income
    i: number;
    // cost
    c: number;
  };

  type Stock = {
    // name
    n: string;
    // date
    d: string;
    // services
    s: Record<string, Earn>;
    // products
    p: Record<string, Earn>;
  };

  type Proportion = {
    /** name */
    name: Name;
    /** symbol */
    symbol: STKSymbol;
    /** income in the last period */
    income: number;
    /** cost in the last period */
    cost: number;
    /** Gross margin */
    gross: number;
  }

  type Mixed = {
    /** name */
    name: Name;
    /** update date */
    date: string;
    /** sample count */
    sample: number;
    /** Average Gross margin */
    gross: number;
    /** market cap */
    cap: number;
    /** income*/
    income: number;
    /** cost */
    cost: number;
    /** proportions(ordered by income) */
    proportion: Array<Proportion>;
    /** calculated by all proportions without top4(leading enterprise) */
    left: {
      /** income in the last period */
      income: number;
      /** cost in the last period */
      cost: number;
      /** Gross margin */
      gross: number;
    };
  }

  type Service = Mixed;
  type Product = Mixed;

  interface MixedSet extends RecSet<Mixed> {
    cap: number;
    cost: number;
    date: string;
  };

  interface Module {
    /** list all items by type */
    list(type: Type, key?: MatchKey, order?: Order, count?: number, offset?: number): MixedSet;
  }
}