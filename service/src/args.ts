/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-destructuring */
export interface ArgAnnotation {
  /** is required ? */
  required?: boolean,
  /** short key from arg */
  alias?: string,
  /** arg description */
  description: string,
  /** parse method */
  parse?(v: string): any,
}

export default function (as: Record<string, ArgAnnotation>, args: Array<string>): { target: string | Array<string>, args: Record<string, any> } {
  const rs: any = {
    target: undefined,
    args: {},
  };
  if (args.length) {
    const aliasMap: any = {};
    Object.entries(as).forEach(kv => (aliasMap[kv[1].alias || ''] = kv[0]));
    args.forEach((v) => {
      const matches = /^(--?)([a-zA-Z.?]+)(=[^\s]+)?$/i.exec(v);
      if (matches) {
        const k = matches[1] === '--' ? matches[2] : aliasMap[matches[2]];
        if (!k) {
          console.warn(`Unrecognized argment '${matches[2]}'!`);
          return;
        }
        const adsc = as[k];
        if (!adsc) {
          console.warn(`Unrecognized argment '${k}'!`);
          return;
        }
        // eslint-disable-next-line prefer-destructuring
        let v: any = matches[3];
        if (matches[3] === undefined) {
          v = true;
        } else if (/^=(true|false)$/.test(v)) {
          v = v === '=true';
        } else if (/^=[0-9]+$/.test(v)) {
          // eslint-disable-next-line radix
          v = parseInt(v.substring(1));
        } else if (typeof v === 'string' && v.indexOf(',') !== -1) {
          v = v.substring(1).split(',');
        } else {
          v = v.substring(1);
        }
        rs.args[k] = adsc.parse ? adsc.parse(v) : v;
      } else {
        if (rs.target === undefined) {
          rs.target = v;
        } else if (Array.isArray(rs.target)) {
          rs.target.push(v);
        } else {
          rs.target = [rs.target, v];
        }
      }
    });
  }
  for (const key in as) {
    const element = as[key];
    if (element.required && !rs.hasOwnProperty(key)) {
      throw `arg '${key}' not found`;
    }
  }
  return rs;
}
