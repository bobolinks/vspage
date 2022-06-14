export default {
  /**
   * Solve the relative path from {from} to {to}.
   * At times we have two absolute paths, and we need to derive the relative path from one to the other. This is actually the reverse transform of path.resolve.
   */
  relative(from: string, to: string): string {
    if (to[0] === '/') {
      return to;
    } if (to[0] !== '.') {
      return `/${to}`;
    }
    const bnames = from.split('/').filter(e => e);
    const tnames = to.split('/').filter(e => e);
    if (bnames.length) bnames.pop();
    for (const iterator of tnames) {
      if (iterator === '..') {
        if (bnames.length) bnames.pop();
      } else if (iterator === '.') {
        continue;
      } else {
        bnames.push(iterator);
      }
    }
    return `/${bnames.join('/')}`;
  },
};
