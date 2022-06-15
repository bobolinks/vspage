export default {
  parseTextValue(text: string): string | TyTextExp | Array<string | TyTextExp> {
    if (!/{{.*}}/.test(text)) {
      return text;
    }
    const values: Array<string> = [];
    const tokens = text.replace(/{{(.*?)}}/mg, ($0, $1) => {
      values.push($1);
      return '[#$#$#$#$]';
    }).split('[#$#$#$#$]');
    values.reverse();
    const outputs = [] as Array<any>;
    for (const iterator of tokens) {
      if (iterator) {
        outputs.push(iterator);
      }
      if (values.length) {
        outputs.push({
          $: values.pop(),
        });
      }
    }
    return outputs.length === 1 ? outputs[0] : outputs;
  },
  parseEsTemplate(text: string): string | TyTextExp | Array<string | TyTextExp> {
    if (!/\${.*}/.test(text)) {
      return text;
    }
    const values: Array<string> = [];
    const tokens = text.replace(/\${(.*?)}/mg, ($0, $1) => {
      values.push($1);
      return '[#$#$#$#$]';
    }).split('[#$#$#$#$]');
    values.reverse();
    const outputs = [] as Array<any>;
    for (const iterator of tokens) {
      if (iterator) {
        outputs.push(iterator);
      }
      if (values.length) {
        outputs.push({
          $: values.pop(),
        });
      }
    }
    return outputs.length === 1 ? outputs[0] : outputs;
  },
  stringifyToText(value: any): string {
    const values = Array.isArray(value) ? value : [value];
    let str = '';
    for (const v of values) {
      if (typeof v === 'string') {
        str += v;
      } else {
        str += `{{${v.$}}}`;
      }
    }
    return str;
  },
  stringifyToAttr(value: any): string {
    const str = this.stringifyToText(value);
    return this.escapeAttr(str);
  },
  escapeAttr(str: string) {
    str = str.replace(/\n/g, '\\n');
    const noSingle = !/'/.test(str);
    const noDouble = !/"/.test(str);
    if (noSingle && noDouble) {
      return `'${str}'`;
    } if (noDouble) {
      return `"${str}"`;
    }
    return `'${str.replace(/'/g, '\\')}'`;
  },
  stringifyToEsTemplate(value: any): string {
    if (Array.isArray(value)) {
      let str = '';
      for (const v of value) {
        if (typeof v === 'string') {
          str += v;
        } else {
          str += `$\{${v.$}}`;
        }
      }
      return str;
    } if (typeof value === 'string') {
      return value;
    }
    return value.$ || '';
  },
  stringifyToExpression(value: any): string {
    if (Array.isArray(value)) {
      return value.map((v) => {
        if (typeof v === 'string') {
          return this.escapeAttr(v);
        }
        return `(${v.$})`;
      }).join('+');
    } if (typeof value === 'string') {
      return this.escapeAttr(value);
    }
    return value.$ || '';
  },
};
