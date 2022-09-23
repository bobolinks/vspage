import minimist from 'minimist';
import pkg from '../package.json';

interface ArgType<T = 'string' | 'boolean' | 'number', V = string | boolean | number> {
  /** default is string  */
  type?: T;
  /** is required ? */
  required?: boolean;
  /** short key from arg */
  alias?: string;
  /** arg description */
  description: string;
  /** default value */
  default?: V;
};

interface ArgTypeWT<T = 'boolean' | 'number', V = boolean | number> extends ArgType<T, V> {
  type: T;
}

type ArgTypes = ArgType<'string', string> | ArgTypeWT<'boolean', boolean> | ArgTypeWT<'number', number>;

type Args<T extends Record<string, ArgTypes>> = {
  [P in keyof T]: T[P] extends ArgTypeWT<'boolean', boolean> ? boolean : (T[P] extends ArgTypeWT<'number', number> ? number : string);
}

export function parseArgs<T extends Record<string, ArgTypes>>(argsAnno: T): Args<T> {
  const entries = Object.entries(argsAnno);

  const args = minimist(process.argv.slice(2), {
    alias: Object.fromEntries(entries.map(([k, v]) => [k, v.alias])
      .filter(([, v]) => v)),
    string: entries.filter(([, v]) => v.type === 'string')
      .map(kv => kv[0]),
    boolean: entries.filter(([, v]) => v.type === 'boolean')
      .map(kv => kv[0]),
    default: Object.fromEntries(entries.map(([k, v]) => [k, v.default])
      .filter(([, v]) => v !== undefined)),
  });

  // alias hyphen args in camel case
  Object.keys(args).forEach((key) => {
    const camelKey = key.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
    if (camelKey !== key) args[camelKey] = args[key];
    if (camelKey === 'help') {
      printHelp(argsAnno);
    } else if (camelKey === 'version') {
      console.log(`${pkg.name} v${pkg.version}`);
    }
  });

  entries.forEach(([e, t]) => {
    if (args[e] === undefined) {
      if (t.default !== undefined) {
        args[e] = t.default;
      } else if (t.required) {
        printHelp(argsAnno);
        throw new Error(`${e} is required`);
      }
    }
  });

  return args as any;
}

const builtinArgs: Record<string, ArgTypes> = {
  help: {
    alias: 'h',
    description: '显示帮助信息',
  },
  version: {
    alias: 'v',
    description: '显示版本信息',
  }
};

export function printHelp(argsAnno: Record<string, ArgTypes>) {
  const entries = Object.entries(builtinArgs).concat(Object.entries(argsAnno));
  const keys = entries.map(([k, v]) => k);
  const maxLen = keys.reduce((a, b) => Math.max(a, b.length), 0);
  const lines = entries.map(([k, v]) => {
    const key = k.padEnd(maxLen);
    const desc = v.description;
    const def = v.default === undefined ? '' : `[default: ${v.default}]`;
    return ` --${key} ${desc} ${def}`;
  }
  ).join('\n');
  console.log(`${pkg.name} v${pkg.version}`);
  console.log(lines);
}
