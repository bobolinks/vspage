import css, { Declaration, Rule } from 'css';

function processRule(rule: Rule, scoped: string | undefined) {
  if (!rule.selectors) {
    return;
  }
  rule.selectors = rule.selectors.map(e => e.split(' ').map((name) => {
    if (name === 'html' || name === 'body') {
      return name;
    } if (name === 'page') {
      return 'html';
    }
    if (/^\w/.test(name) && /^(?!wx-)/.test(name)) {
      return `wx-${name}`;
    }
    return name;
  })
    .join(' ') + (scoped ? `[${scoped}]` : ''));
  for (const declaration of rule.declarations || []) {
    if (declaration.type !== 'declaration') continue;
    const decl = declaration as Declaration;
    if (!decl.value) continue;
    let v = decl.value;
    // process rpx in calc
    while (v.indexOf('rpx') !== -1) {
      const nv = v.replace(/calc(\(|(?:\([^)]*[\s-+/*]))(\d+)rpx(\)|(?:[\s-+/*][^)]*\)))/gm, 'calc$1var(--devicePixelRatio) * $2px$3');
      if (nv !== v) {
        v = nv;
      } else {
        break;
      }
    }
    // process rpx in others
    while (v.indexOf('rpx') !== -1) {
      const nv = v.replace(/(^|[\s+/*])(-?\d+)rpx/gm, '$1calc(var(--devicePixelRatio) * $2px)');
      if (nv !== v) {
        v = nv;
      } else {
        break;
      }
    }
    if (v !== decl.value) {
      decl.value = v;
    }
  }
}

export default function (code: string, scoped: string | undefined): string {
  const ast = css.parse(code);
  for (const it of ast.stylesheet?.rules || []) {
    if (it.type === 'rule') {
      processRule(it as Rule, scoped);
    } else if (it.type === 'media') {
      for (const itsub of (it as any).rules || []) {
        if (itsub.type !== 'rule') {
          continue;
        }
        processRule(itsub as Rule, scoped);
      }
    }
  }

  return css.stringify(ast);
}
